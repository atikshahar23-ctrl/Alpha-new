// ═══════════════════════════════════════════════════════════════════════
// LYRICS::TRANSLATOR hero visual — a Tulum/Zamna-festival-style centerpiece:
// a dark humanoid silhouette dancing inside a vertical shaft of light,
// flanked by two walls of pulsing light fins, a flowing cape, a festival
// hat, drifting sparks + confetti, beat-synced floor shockwave rings, a
// crowd silhouette, haze, and bloom.
// Owner reference: a festival stage photo (backlit figure suspended in a
// light shaft between two illuminated walls, purple/blue haze, crowd below).
//
// Adapted, not copied 1:1: the reference is a single frozen stunt-rig
// freeze-frame (a performer mid-fall on a wire). The user's actual ask was
// "a character that can move to the beat" — a static falling pose can't
// groove — so the pose here is a standing/dancing rig that cycles through
// a few distinct choreography patterns (groove, arms-overhead, spin) every
// few beats instead of one repeating loop, while keeping the reference's
// LIGHTING language (vertical beam, side light fins, purple/cyan haze,
// crowd below).
//
// No real audio stream exists to analyze (Spotify's Web API exposes only
// track metadata + transport, never PCM/frequency data) — same constraint
// already solved for the 2D equalizer elsewhere in this app. Spotify's
// Audio Features endpoint (which used to expose a real `tempo` BPM) was
// restricted by Spotify in late 2024 to apps that already had extended
// quota approved — a freshly created Client ID like this app uses gets a
// 403, so it can't be relied on either. Instead, setTempo() is driven by
// the CALLER analyzing the real per-line LRC timestamps we already have
// (median gap between synced lines) — a per-song-specific rhythm derived
// from real data, not a generic guess, without needing any extra API scope.
// ═══════════════════════════════════════════════════════════════════════
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export interface LyricsAvatarHandle {
  setEnergy(playing: boolean): void;
  setTempo(ms: number): void;
  dispose(): void;
}

const DEFAULT_TEMPO_MS = 560; // ~107bpm fallback, used until setTempo() supplies a real per-song value
const BEATS_PER_PATTERN = 8; // choreography switches every N beats

function buildFigureMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uPulse: { value: 0 } },
    vertexShader: /* glsl */`
      varying vec3 vNormalW;
      varying vec3 vViewDirW;
      varying vec3 vWorldPos;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vViewDirW = normalize(cameraPosition - worldPos.xyz);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform float uPulse;
      varying vec3 vNormalW;
      varying vec3 vViewDirW;
      varying vec3 vWorldPos;
      void main() {
        // Solid dark silhouette (reads as backlit, like the reference) with
        // a rim in a violet→cyan→magenta gradient that brightens on the
        // beat pulse, plus a soft vertical sheen so the body isn't flat black.
        float fresnel = pow(1.0 - clamp(dot(normalize(vNormalW), normalize(vViewDirW)), 0.0, 1.0), 2.3);
        vec3 violet = vec3(0.58, 0.24, 0.97);
        vec3 cyan = vec3(0.22, 0.87, 1.0);
        vec3 magenta = vec3(0.95, 0.25, 0.7);
        vec3 grad = mix(violet, cyan, clamp(fresnel * 1.4, 0.0, 1.0));
        grad = mix(grad, magenta, smoothstep(0.7, 1.0, fresnel) * 0.4);
        vec3 rim = grad * fresnel * (0.95 + uPulse * 1.6);
        float sheen = smoothstep(-0.3, 1.8, vWorldPos.y) * 0.05;
        vec3 fill = vec3(0.02, 0.014, 0.04) + vec3(0.3, 0.2, 0.5) * sheen;
        gl_FragColor = vec4(fill + rim, 1.0);
      }
    `,
  });
}

function buildCapeMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uSway: { value: 0 } },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    vertexShader: /* glsl */`
      uniform float uTime;
      uniform float uSway;
      varying vec3 vNormalW;
      varying vec3 vViewDirW;
      varying float vDrop;
      void main() {
        vDrop = 1.0 - uv.y; // 0 at collar, 1 at the free-flowing hem
        vec3 p = position;
        float sway = sin(uTime * 2.2 - p.y * 2.4) * uSway * vDrop * vDrop;
        p.x += sway;
        p.z += sway * 0.5;
        vec4 worldPos = modelMatrix * vec4(p, 1.0);
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vViewDirW = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      varying vec3 vNormalW;
      varying vec3 vViewDirW;
      varying float vDrop;
      void main() {
        float fresnel = pow(1.0 - clamp(abs(dot(normalize(vNormalW), normalize(vViewDirW))), 0.0, 1.0), 1.4);
        vec3 violet = vec3(0.4, 0.15, 0.7);
        vec3 base = mix(vec3(0.01, 0.008, 0.02), violet, 0.25 + fresnel * 0.5);
        float alpha = (0.55 + fresnel * 0.35) * (1.0 - vDrop * 0.25);
        gl_FragColor = vec4(base, alpha);
      }
    `,
  });
}

function buildFigureRig(mat: THREE.ShaderMaterial, capeMat: THREE.ShaderMaterial) {
  const group = new THREE.Group();
  const cap = (r: number, len: number) => new THREE.CapsuleGeometry(r, len, 6, 12);
  const sph = (r: number) => new THREE.SphereGeometry(r, 20, 20);

  const head = new THREE.Mesh(sph(0.16), mat); head.position.y = 1.62; group.add(head);

  // A wide-brim festival hat — cheap silhouette read, very "Tulum".
  const hatGroup = new THREE.Group(); hatGroup.position.set(0, 1.74, 0); head.add(hatGroup);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.02, 24), mat); hatGroup.add(brim);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.13, 16), mat); crown.position.y = 0.07; hatGroup.add(crown);

  const neck = new THREE.Mesh(cap(0.055, 0.06), mat); neck.position.y = 1.46; group.add(neck);
  const torso = new THREE.Mesh(cap(0.22, 0.46), mat); torso.position.y = 1.1; group.add(torso);
  const hips = new THREE.Mesh(sph(0.21), mat); hips.position.y = 0.72; hips.scale.set(1, 0.7, 0.88); group.add(hips);

  // Real hip→knee→ankle chains (previously thigh+shin+foot were flat
  // siblings under one hip pivot, so the whole leg swung rigidly with no
  // knee bend at all — the "bounce" read as a stiff bob, not a squat).
  // kneeL/kneeR bend independently now, so the groove/jump actually
  // compresses and releases like a real dance move.
  const legL = new THREE.Group(); legL.position.set(-0.11, 0.5, 0); group.add(legL);
  const thighL = new THREE.Mesh(cap(0.095, 0.42), mat); thighL.position.y = -0.21; legL.add(thighL);
  const kneeL = new THREE.Group(); kneeL.position.set(0, -0.42, 0); legL.add(kneeL);
  const shinL = new THREE.Mesh(cap(0.08, 0.42), mat); shinL.position.y = -0.21; kneeL.add(shinL);
  const footL = new THREE.Mesh(sph(0.09), mat); footL.position.set(0, -0.44, 0.07); footL.scale.set(1, 0.6, 1.5); kneeL.add(footL);

  const legR = new THREE.Group(); legR.position.set(0.11, 0.5, 0); group.add(legR);
  const thighR = new THREE.Mesh(cap(0.095, 0.42), mat); thighR.position.y = -0.21; legR.add(thighR);
  const kneeR = new THREE.Group(); kneeR.position.set(0, -0.42, 0); legR.add(kneeR);
  const shinR = new THREE.Mesh(cap(0.08, 0.42), mat); shinR.position.y = -0.21; kneeR.add(shinR);
  const footR = new THREE.Mesh(sph(0.09), mat); footR.position.set(0, -0.44, 0.07); footR.scale.set(1, 0.6, 1.5); kneeR.add(footR);

  const shoulderL = new THREE.Group(); shoulderL.position.set(-0.29, 1.32, 0); group.add(shoulderL);
  const upperArmL = new THREE.Mesh(cap(0.07, 0.34), mat); upperArmL.position.y = -0.19; shoulderL.add(upperArmL);
  const foreArmL = new THREE.Group(); foreArmL.position.set(0, -0.4, 0); shoulderL.add(foreArmL);
  const foreArmMeshL = new THREE.Mesh(cap(0.06, 0.32), mat); foreArmMeshL.position.y = -0.17; foreArmL.add(foreArmMeshL);
  const handL = new THREE.Mesh(sph(0.065), mat); handL.position.y = -0.36; foreArmL.add(handL);

  const shoulderR = new THREE.Group(); shoulderR.position.set(0.29, 1.32, 0); group.add(shoulderR);
  const upperArmR = new THREE.Mesh(cap(0.07, 0.34), mat); upperArmR.position.y = -0.19; shoulderR.add(upperArmR);
  const foreArmR = new THREE.Group(); foreArmR.position.set(0, -0.4, 0); shoulderR.add(foreArmR);
  const foreArmMeshR = new THREE.Mesh(cap(0.06, 0.32), mat); foreArmMeshR.position.y = -0.17; foreArmR.add(foreArmMeshR);
  const handR = new THREE.Mesh(sph(0.065), mat); handR.position.y = -0.36; foreArmR.add(handR);

  // A flowing cape hung from the collar — cheap, big visual payoff: gives
  // the silhouette a distinct read (vs. a bare mannequin) and its own
  // beat-driven sway sells "movement" even during held poses.
  const capeGeo = new THREE.PlaneGeometry(0.62, 1.05, 1, 10);
  const cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, 1.0, -0.13);
  cape.rotation.x = 0.12;
  group.add(cape);

  return { group, legL, legR, kneeL, kneeR, shoulderL, shoulderR, foreArmL, foreArmR, torso, head, hips, cape };
}

function buildBeamMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uPulse: { value: 0 }, uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform float uPulse;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        // Bright vertical column, softest at the horizontal edges, with a
        // slow drifting haze band riding through it, plus faint radiating
        // "god ray" streaks for a more volumetric read.
        float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
        float col = pow(edge, 1.6);
        float haze = sin(vUv.y * 6.0 - uTime * 0.6) * 0.5 + 0.5;
        float rays = pow(abs(sin((vUv.x - 0.5) * 40.0 + uTime * 0.15)), 6.0) * 0.4;
        float vfade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
        vec3 violet = vec3(0.42, 0.18, 0.85);
        vec3 cyan = vec3(0.22, 0.75, 0.95);
        vec3 tint = mix(violet, cyan, 0.35 + haze * 0.3);
        float alpha = (col + rays * edge) * vfade * (0.22 + uPulse * 0.22) * (0.7 + haze * 0.3);
        gl_FragColor = vec4(tint, alpha);
      }
    `,
  });
}

// Soft-edged vertical light bar (a gradient texture on a plane) instead of
// a hard-edged box — reads as a glowing light tube rather than a flat panel.
function buildFinTexture() {
  const c = document.createElement('canvas'); c.width = 32; c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 32, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.5, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 32, 128);
  return new THREE.CanvasTexture(c);
}

function buildSparkTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

// A thin glowing ring texture used for the floor shockwave pulses.
function buildRingTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d')!;
  g.strokeStyle = 'rgba(255,255,255,1)';
  g.lineWidth = 10;
  g.beginPath(); g.arc(64, 64, 52, 0, Math.PI * 2); g.stroke();
  return new THREE.CanvasTexture(c);
}

// A low, bumpy silhouette strip across the bottom of the frame — stands in
// for the reference photo's crowd, without modeling individual people.
function buildCrowdTexture() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = 'rgba(5,4,10,0.9)';
  g.beginPath(); g.moveTo(0, 64);
  let x = 0;
  while (x < 512) {
    const w = 14 + Math.random() * 16;
    const h = 18 + Math.random() * 26;
    g.lineTo(x, 64 - h * 0.3);
    g.lineTo(x + w * 0.5, 64 - h);
    g.lineTo(x + w, 64 - h * 0.35);
    x += w;
  }
  g.lineTo(512, 64); g.closePath(); g.fill();
  return new THREE.CanvasTexture(c);
}

export function mountLyricsAvatar(container: HTMLElement): LyricsAvatarHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0518, 0.085);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  const camBase = new THREE.Vector3(0, 1.15, 4.4);
  camera.position.copy(camBase);
  camera.lookAt(0, 1.05, 0);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 1.15, 0.62, 0.2);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  function resize() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, true);
    composer.setSize(w, h);
    bloom.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  // ── The vertical light shaft behind the figure ──
  const beamMat = buildBeamMaterial();
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 5.2), beamMat);
  beam.position.set(0, 1.1, -0.8);
  scene.add(beam);

  // ── Crowd silhouette along the back/bottom ──
  const crowdTex = buildCrowdTexture();
  crowdTex.wrapS = THREE.RepeatWrapping;
  const crowdMat = new THREE.MeshBasicMaterial({ map: crowdTex, transparent: true, depthWrite: false });
  const crowd = new THREE.Mesh(new THREE.PlaneGeometry(9, 0.6), crowdMat);
  crowd.position.set(0, -0.05, -2.6);
  scene.add(crowd);

  // ── Floor glow disc grounding the figure ──
  const floorTex = buildSparkTexture();
  const floorMat = new THREE.MeshBasicMaterial({ map: floorTex, color: new THREE.Color(0.55, 0.35, 1.0), transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false });
  const floorGlow = new THREE.Mesh(new THREE.CircleGeometry(0.9, 32), floorMat);
  floorGlow.rotation.x = -Math.PI / 2;
  floorGlow.position.set(0, -0.02, 0);
  scene.add(floorGlow);

  // ── Beat-synced floor shockwave rings — a pool of 3, reused round-robin,
  // each launched fresh on a beat and scaling/fading outward. ──
  const ringTex = buildRingTexture();
  const RING_COUNT = 3;
  const rings: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; age: number }[] = [];
  for (let i = 0; i < RING_COUNT; i++) {
    const mat = new THREE.MeshBasicMaterial({ map: ringTex, color: new THREE.Color(0.6, 0.85, 1.0), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, -0.015, 0);
    scene.add(mesh);
    rings.push({ mesh, mat, age: 999 });
  }
  let ringCursor = 0;

  // ── Two walls of soft vertical light fins flanking the figure — same
  // "chase a random target" procedural rhythm as the 2D equalizer, just
  // rendered as glowing 3D bars instead of canvas rectangles. ──
  const finTex = buildFinTexture();
  const FIN_COUNT = 9;
  const fins: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; val: number; target: number }[] = [];
  const finGeo = new THREE.PlaneGeometry(0.09, 1);
  for (const side of [-1, 1]) {
    for (let i = 0; i < FIN_COUNT; i++) {
      const mat = new THREE.MeshBasicMaterial({ map: finTex, color: new THREE.Color(0.75, 0.92, 1.0), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(finGeo, mat);
      const x = side * (1.55 + i * 0.14);
      mesh.position.set(x, 1.3, -1.6 - i * 0.35);
      mesh.scale.y = 1.4 + Math.random() * 0.6;
      scene.add(mesh);
      fins.push({ mesh, mat, val: 0.1, target: Math.random() });
    }
  }

  // ── The figure ──
  const figMat = buildFigureMaterial();
  const capeMat = buildCapeMaterial();
  const rig = buildFigureRig(figMat, capeMat);
  scene.add(rig.group);

  // ── Drifting spark particles rising through the beam ──
  const SPARK_COUNT = 40;
  const sparkTex = buildSparkTexture();
  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(SPARK_COUNT * 3);
  const sparkSpeed = new Float32Array(SPARK_COUNT);
  for (let i = 0; i < SPARK_COUNT; i++) {
    sparkPos[i * 3] = (Math.random() - 0.5) * 1.6;
    sparkPos[i * 3 + 1] = Math.random() * 3.2;
    sparkPos[i * 3 + 2] = -0.9 + (Math.random() - 0.5) * 0.6;
    sparkSpeed[i] = 0.15 + Math.random() * 0.35;
  }
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({ map: sparkTex, size: 0.05, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, color: new THREE.Color(0.8, 0.9, 1.0) });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  scene.add(sparks);

  // ── Falling confetti — colored flecks, distinct from the rising sparks. ──
  const CONFETTI_COUNT = 30;
  const confettiColors = [
    new THREE.Color(0.95, 0.35, 0.75), new THREE.Color(1.0, 0.8, 0.3),
    new THREE.Color(0.35, 0.85, 1.0), new THREE.Color(0.6, 0.4, 1.0),
  ];
  const confettiGeo = new THREE.BufferGeometry();
  const confettiPos = new Float32Array(CONFETTI_COUNT * 3);
  const confettiCol = new Float32Array(CONFETTI_COUNT * 3);
  const confettiSpeed = new Float32Array(CONFETTI_COUNT);
  const confettiDrift = new Float32Array(CONFETTI_COUNT);
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    confettiPos[i * 3] = (Math.random() - 0.5) * 2.6;
    confettiPos[i * 3 + 1] = Math.random() * 3.4;
    confettiPos[i * 3 + 2] = -0.6 + (Math.random() - 0.5) * 1.4;
    const c = confettiColors[i % confettiColors.length];
    confettiCol[i * 3] = c.r; confettiCol[i * 3 + 1] = c.g; confettiCol[i * 3 + 2] = c.b;
    confettiSpeed[i] = 0.1 + Math.random() * 0.2;
    confettiDrift[i] = (Math.random() - 0.5) * 0.4;
  }
  confettiGeo.setAttribute('position', new THREE.BufferAttribute(confettiPos, 3));
  confettiGeo.setAttribute('color', new THREE.BufferAttribute(confettiCol, 3));
  const confettiMat = new THREE.PointsMaterial({ map: sparkTex, size: 0.045, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, vertexColors: true });
  const confetti = new THREE.Points(confettiGeo, confettiMat);
  scene.add(confetti);

  // ── Soft drifting haze sprites for atmosphere ──
  const hazeTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,0.35)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const hazeSprites: THREE.Sprite[] = [];
  for (let i = 0; i < 5; i++) {
    const sm = new THREE.SpriteMaterial({ map: hazeTex, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false });
    const s = new THREE.Sprite(sm);
    s.scale.set(3 + Math.random() * 2, 2 + Math.random(), 1);
    s.position.set((Math.random() - 0.5) * 3, 0.6 + Math.random() * 1.6, -1 - Math.random() * 2);
    scene.add(s);
    hazeSprites.push(s);
  }

  let playing = false;
  let energy = 0.25; // smoothed 0..1, drives everything below
  let tempoMs = DEFAULT_TEMPO_MS;
  let raf = 0;
  const start = performance.now();
  let lastBeat = 0;
  let beatPulse = 0; // decays after each beat tick
  let beatCount = 0;

  // Adaptive quality — same pattern used for the other 3D scenes in this
  // codebase (Office3D.jsx, src/orb/OrbScene.ts): watch real frame times
  // and shed cost (bloom first, then resolution) if a weaker device can't
  // sustain a smooth framerate, instead of a fixed one-size-fits-all
  // quality level. Sticky downgrade only, never auto-upgrades back.
  let qTier = 0;
  let lastFrameTime = 0, warmT = 0, fpsT = 0, fpsN = 0, lowStreak = 0;
  function applyQTier() {
    if (qTier >= 1) bloom.enabled = false;
    if (qTier >= 2) renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    const dt = lastFrameTime ? Math.min((now - lastFrameTime) / 1000, 0.05) : 0.016;
    lastFrameTime = now;
    if (qTier < 2) {
      warmT += dt; fpsT += dt; fpsN++;
      if (warmT > 2.5 && fpsT >= 1) {
        const fps = fpsN / fpsT; fpsT = 0; fpsN = 0;
        if (fps < 40) { if (++lowStreak >= 2) { lowStreak = 0; qTier++; applyQTier(); } }
        else lowStreak = 0;
      }
    }
    const t = (now - start) / 1000;
    const targetEnergy = playing ? 1 : 0.25;
    energy += (targetEnergy - energy) * 0.04;

    // Procedural beat: a pulse fires every tempoMs while playing, decays
    // exponentially — drives the fins' chase target refresh, the floor
    // shockwave rings, and the choreography-pattern counter. tempoMs is set
    // by the caller from the real song's LRC line timing (see setTempo), so
    // this locks to the actual track instead of a one-size-fits-all guess.
    let firedBeat = false;
    if (playing && now - lastBeat > tempoMs) {
      lastBeat = now;
      beatPulse = 1;
      beatCount++;
      firedBeat = true;
      for (const f of fins) f.target = 0.35 + Math.random() * 0.65;
    }
    beatPulse *= 0.9;

    if (firedBeat) {
      const r = rings[ringCursor];
      ringCursor = (ringCursor + 1) % RING_COUNT;
      r.age = 0;
    }
    for (const r of rings) {
      r.age += 1 / 60;
      const life = Math.min(1, r.age / 0.9);
      const scale = 0.3 + life * 1.6;
      r.mesh.scale.set(scale, scale, 1);
      r.mat.opacity = (1 - life) * 0.35 * energy;
    }

    figMat.uniforms.uPulse.value = beatPulse * energy;
    beamMat.uniforms.uTime.value = t;
    beamMat.uniforms.uPulse.value = beatPulse * energy;
    capeMat.uniforms.uTime.value = t;
    capeMat.uniforms.uSway.value = (0.05 + beatPulse * 0.09) * (0.3 + energy * 0.7);
    (floorMat as THREE.MeshBasicMaterial).opacity = 0.25 + beatPulse * energy * 0.3;

    for (const f of fins) {
      f.val += (f.target * energy - f.val) * 0.15;
      f.mat.opacity = 0.15 + f.val * 0.65;
      f.mesh.scale.y = 0.8 + f.val * 1.8;
    }

    // Choreography: cycle through a few distinct dance patterns instead of
    // one repeating loop, switching every BEATS_PER_PATTERN beats.
    const pattern = Math.floor(beatCount / BEATS_PER_PATTERN) % 3;
    const bounceCycle = ((now - lastBeat) / tempoMs);
    const bounce = Math.max(0, Math.sin(Math.PI * Math.min(1, bounceCycle * 1.4))) * energy;

    if (pattern === 0) {
      // Groove: bounce + arm pump + hip sway.
      rig.group.position.y = -0.05 - bounce * 0.09;
      rig.group.rotation.y = Math.sin(t * 0.3) * 0.08;
      rig.hips.rotation.z = Math.sin(t * 2.1) * 0.06 * (0.4 + energy * 0.6);
      rig.torso.rotation.y = Math.sin(t * 1.3) * 0.1 * (0.4 + energy * 0.6);
      rig.legL.rotation.x = -bounce * 0.18;
      rig.legR.rotation.x = bounce * 0.1;
      rig.kneeL.rotation.x = bounce * 0.55;
      rig.kneeR.rotation.x = bounce * 0.4;
      rig.shoulderL.rotation.z = 0.3 + Math.sin(t * 2.4) * 0.25 * (0.3 + energy * 0.7);
      rig.shoulderR.rotation.z = -0.3 - Math.sin(t * 2.4 + 0.5) * 0.25 * (0.3 + energy * 0.7);
      rig.foreArmL.rotation.z = Math.sin(t * 2.4 + 1) * 0.3 * energy;
      rig.foreArmR.rotation.z = -Math.sin(t * 2.4 + 1.4) * 0.3 * energy;
    } else if (pattern === 1) {
      // Arms overhead, swaying side to side — a "hands up" festival moment.
      rig.group.position.y = -0.05 - bounce * 0.05;
      rig.group.rotation.y = Math.sin(t * 0.5) * 0.05;
      rig.hips.rotation.z = Math.sin(t * 1.6) * 0.09 * energy;
      rig.torso.rotation.z = Math.sin(t * 1.6) * 0.08 * energy;
      rig.legL.rotation.x = -bounce * 0.08;
      rig.legR.rotation.x = bounce * 0.05;
      rig.kneeL.rotation.x = bounce * 0.35;
      rig.kneeR.rotation.x = bounce * 0.28;
      rig.shoulderL.rotation.z = 2.6 + Math.sin(t * 1.8) * 0.15 * energy;
      rig.shoulderR.rotation.z = -2.6 - Math.sin(t * 1.8 + 0.4) * 0.15 * energy;
      rig.foreArmL.rotation.z = Math.sin(t * 1.8 + 0.6) * 0.2 * energy;
      rig.foreArmR.rotation.z = -Math.sin(t * 1.8 + 1.0) * 0.2 * energy;
    } else {
      // Slow spin, arms out — a full-body turn.
      rig.group.position.y = -0.05 - bounce * 0.04;
      rig.group.rotation.y += 0.012 * energy;
      rig.hips.rotation.z = Math.sin(t * 1.4) * 0.04;
      rig.torso.rotation.y = 0;
      rig.legL.rotation.x = -bounce * 0.05;
      rig.legR.rotation.x = bounce * 0.05;
      rig.kneeL.rotation.x = bounce * 0.22;
      rig.kneeR.rotation.x = bounce * 0.22;
      rig.shoulderL.rotation.z = 1.35 + Math.sin(t * 1.2) * 0.1;
      rig.shoulderR.rotation.z = -1.35 - Math.sin(t * 1.2 + 0.3) * 0.1;
      rig.foreArmL.rotation.z = 0.1;
      rig.foreArmR.rotation.z = -0.1;
    }
    rig.head.rotation.y = Math.sin(t * 1.1 + 0.4) * 0.12;

    // Sparks drift upward through the beam, looping back to the floor.
    const posAttr = sparkGeo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < SPARK_COUNT; i++) {
      let y = posAttr.getY(i) + sparkSpeed[i] * energy * 0.016;
      if (y > 3.2) y = 0;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
    sparkMat.opacity = 0.25 + energy * 0.4;

    // Confetti falls and drifts sideways, recycling to the top.
    const confAttr = confettiGeo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      let y = confAttr.getY(i) - confettiSpeed[i] * energy * 0.016;
      let x = confAttr.getX(i) + Math.sin(t * 0.6 + i) * confettiDrift[i] * 0.004;
      if (y < 0) y = 3.4;
      confAttr.setY(i, y);
      confAttr.setX(i, x);
    }
    confAttr.needsUpdate = true;
    confettiMat.opacity = 0.15 + energy * 0.55;

    for (let i = 0; i < hazeSprites.length; i++) {
      hazeSprites[i].position.x += Math.sin(t * 0.15 + i) * 0.0015;
      (hazeSprites[i].material as THREE.SpriteMaterial).opacity = 0.06 + Math.sin(t * 0.3 + i) * 0.03;
    }

    // Subtle cinematic camera sway + a gentle breathing zoom on the beat,
    // instead of a fully static frame.
    camera.position.x = camBase.x + Math.sin(t * 0.12) * 0.08;
    camera.position.y = camBase.y + Math.sin(t * 0.09 + 1) * 0.04;
    camera.position.z = camBase.z - beatPulse * energy * 0.06;
    camera.lookAt(0, 1.05, 0);

    composer.render();
  }
  raf = requestAnimationFrame(frame);

  return {
    setEnergy(p: boolean) { playing = p; },
    setTempo(ms: number) {
      if (Number.isFinite(ms) && ms > 0) tempoMs = ms;
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of mats) {
            const mm = m as THREE.MeshBasicMaterial;
            if (mm.map) mm.map.dispose();
            mm.dispose();
          }
        }
      });
      hazeTex.dispose();
      finTex.dispose();
      sparkTex.dispose();
      floorTex.dispose();
      ringTex.dispose();
      crowdTex.dispose();
      renderer.dispose();
      composer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    },
  };
}
