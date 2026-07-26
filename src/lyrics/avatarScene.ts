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
  // Party modes: 0/false = solo · 1/true = crew of three (same move,
  // per-dancer beat offset, periodic perfect unison) · 2 = BIG PARTY —
  // a 30-alien crowd + DJ on a glowing dance floor.
  setParty?(mode: boolean | number): void;
  dispose(): void;
}

const DEFAULT_TEMPO_MS = 560; // ~107bpm fallback, used until setTempo() supplies a real per-song value
const BEATS_PER_PATTERN = 8; // choreography switches every N beats

function buildFigureMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uPulse: { value: 0 }, uTime: { value: 0 } },
    vertexShader: /* glsl */`
      varying vec3 vNormalW;
      varying vec3 vViewDirW;
      varying vec3 vWorldPos;
      void main() {
        // USE_INSTANCING is defined automatically by three whenever this
        // material renders on an InstancedMesh (the big-party crowd);
        // the lead dancers keep the plain path.
        #ifdef USE_INSTANCING
          vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
          vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
        #else
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vNormalW = normalize(mat3(modelMatrix) * normal);
        #endif
        vViewDirW = normalize(cameraPosition - worldPos.xyz);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform float uPulse;
      uniform float uTime;
      varying vec3 vNormalW;
      varying vec3 vViewDirW;
      varying vec3 vWorldPos;
      void main() {
        // Glossy black-glass android: near-black body with a TIGHT neon rim
        // (reads sharp instead of the old washed-out ghost), an animated
        // iridescent hue drift, and a real specular highlight from a fixed
        // key light so the limbs read as solid curved surfaces, not fog.
        vec3 n = normalize(vNormalW);
        vec3 v = normalize(vViewDirW);
        float ndv = clamp(dot(n, v), 0.0, 1.0);
        float fresnel = pow(1.0 - ndv, 3.2);
        float hueDrift = sin(uTime * 0.25) * 0.5 + 0.5;
        vec3 violet = vec3(0.58, 0.24, 0.97);
        vec3 cyan = vec3(0.16, 0.85, 1.0);
        vec3 magenta = vec3(0.98, 0.22, 0.66);
        vec3 grad = mix(mix(violet, cyan, hueDrift), magenta, smoothstep(0.75, 1.0, fresnel) * 0.5);
        vec3 rim = grad * fresnel * (1.35 + uPulse * 2.2);
        // key-light specular (fixed light up-left-front) — the "real material" read
        vec3 lightDir = normalize(vec3(-0.35, 0.9, 0.55));
        vec3 h = normalize(lightDir + v);
        float spec = pow(clamp(dot(n, h), 0.0, 1.0), 42.0) * 0.5;
        // soft cool bounce fill from below so the underside isn't a void
        float below = clamp(-n.y, 0.0, 1.0) * 0.03;
        vec3 fill = vec3(0.008, 0.006, 0.016) + vec3(0.25, 0.3, 0.55) * below;
        gl_FragColor = vec4(fill + rim + vec3(0.85, 0.92, 1.0) * spec, 1.0);
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

  // Alien head: elongated egg skull, two big glossy almond eyes (classic
  // "grey" read, angled outward), and glowing-tip antennae — less robot,
  // more extraterrestrial. The old visor band + festival hat are gone.
  const head = new THREE.Mesh(sph(0.15), mat);
  head.position.y = 1.64; head.scale.set(0.95, 1.35, 1.0); group.add(head);
  const eyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 1.0, 0.85), transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(sph(0.052), eyeMat);
    // counter the head's Y-stretch so the eyes stay almond, not egg-shaped
    eye.scale.set(1.15, 0.62 / 1.35, 0.5);
    eye.position.set(side * 0.072, 0.015, 0.125);
    eye.rotation.z = side * -0.45; // outer corners swept upward
    head.add(eye);
  }
  const antTipMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.55, 1.0, 0.9), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  for (const side of [-1, 1]) {
    const ant = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.16, 3, 6), mat);
    ant.position.set(side * 0.06, 0.19, 0);
    ant.rotation.z = side * -0.35;
    head.add(ant);
    const tip = new THREE.Mesh(sph(0.026), antTipMat);
    tip.position.y = 0.1;
    ant.add(tip);
  }

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

  // Shoulder pivots sit wide of the torso capsule (r=0.22) so raised arms
  // sweep OUTSIDE the body instead of clipping through it.
  const shoulderL = new THREE.Group(); shoulderL.position.set(-0.33, 1.34, 0); group.add(shoulderL);
  const upperArmL = new THREE.Mesh(cap(0.07, 0.34), mat); upperArmL.position.y = -0.19; shoulderL.add(upperArmL);
  const foreArmL = new THREE.Group(); foreArmL.position.set(0, -0.4, 0); shoulderL.add(foreArmL);
  const foreArmMeshL = new THREE.Mesh(cap(0.06, 0.32), mat); foreArmMeshL.position.y = -0.17; foreArmL.add(foreArmMeshL);
  // Long three-fingered alien hands — a small palm with fingers fanned out,
  // continuing the forearm's direction so they read in silhouette.
  const addAlienHand = (parent: THREE.Group) => {
    const palm = new THREE.Mesh(sph(0.05), mat); palm.position.y = -0.36; palm.scale.set(1, 0.75, 0.6); parent.add(palm);
    // fingers hang from the forearm group itself (not the squashed palm)
    // so they keep their long thin proportions
    for (const [fx, rz] of [[-0.034, 0.32], [0, 0], [0.034, -0.32]] as [number, number][]) {
      const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.013, 0.085, 3, 6), mat);
      finger.position.set(fx, -0.435, 0.006);
      finger.rotation.z = rz;
      parent.add(finger);
    }
  };
  addAlienHand(foreArmL);

  const shoulderR = new THREE.Group(); shoulderR.position.set(0.33, 1.34, 0); group.add(shoulderR);
  const upperArmR = new THREE.Mesh(cap(0.07, 0.34), mat); upperArmR.position.y = -0.19; shoulderR.add(upperArmR);
  const foreArmR = new THREE.Group(); foreArmR.position.set(0, -0.4, 0); shoulderR.add(foreArmR);
  const foreArmMeshR = new THREE.Mesh(cap(0.06, 0.32), mat); foreArmMeshR.position.y = -0.17; foreArmR.add(foreArmMeshR);
  addAlienHand(foreArmR);

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
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0518, 0.085);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  const camBase = new THREE.Vector3(0, 1.15, 4.4);
  camera.position.copy(camBase);
  camera.lookAt(0, 1.05, 0);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  // Tighter bloom than before (threshold up, strength down): the figure was
  // getting washed into a white ghost on phones — the neon rim should GLOW,
  // not dissolve the silhouette.
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.95, 0.55, 0.3);
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

  // ── Choreography engine — pose-target springs that "hit" on the beat ──
  // Instead of the old continuous sine washes, every beat sets a TARGET
  // POSE from the current move's step chart, and underdamped springs snap
  // each joint to it: fast attack, slight overshoot, micro-settle — the
  // anticipation/hit/release shape real dancers (and animators) use. Moves
  // rotate every BEATS_PER_PATTERN beats through a shuffled playlist so the
  // dance never visibly loops.
  type Pose = Record<string, number>;
  const POSE_KEYS = ['rootY', 'rootX', 'rootRy', 'hipsRz', 'torsoRx', 'torsoRy', 'torsoRz', 'headRx', 'headRy',
    'shLz', 'shLx', 'shRz', 'shRx', 'fALz', 'fALx', 'fARz', 'fARx',
    'legLx', 'legLz', 'legRx', 'legRz', 'kneeLx', 'kneeRx'];
  const BASE_POSE: Pose = { shLz: 0.35, shRz: -0.35, fALz: 0.25, fARz: -0.25 };
  type Dancer = { rig: ReturnType<typeof buildFigureRig>; cur: Pose; vel: Pose; tgt: Pose; stepOffset: number; baseX: number; baseZ: number; microPhase: number };
  function mkDancer(drig: ReturnType<typeof buildFigureRig>, stepOffset: number, baseX: number, baseZ: number, microPhase: number): Dancer {
    const cur: Pose = {}, vel: Pose = {}, tgt: Pose = {};
    for (const k of POSE_KEYS) { cur[k] = BASE_POSE[k] || 0; vel[k] = 0; tgt[k] = BASE_POSE[k] || 0; }
    return { rig: drig, cur, vel, tgt, stepOffset, baseX, baseZ, microPhase };
  }
  const setPoseFor = (d: Dancer, p: Pose) => { for (const k of POSE_KEYS) d.tgt[k] = (k in p) ? p[k] : (BASE_POSE[k] || 0); };
  function shuffleMoves(arr: number[]) {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }
  // Each move maps a step (0..7 inside its 8-beat block) to a target pose.
  const MOVES: ((s: number) => Pose)[] = [
    // 1 · Groove pump — weight shifts side to side, elbows pumping.
    (s) => { const a = s % 2 ? 1 : -1; return {
      hipsRz: a * 0.14, torsoRz: -a * 0.1, torsoRy: a * 0.12, headRy: a * 0.14,
      shLz: 0.55 + (a > 0 ? 0.5 : 0), shRz: -0.55 - (a < 0 ? 0.5 : 0),
      fALz: 1.15 - (a > 0 ? 0.55 : 0), fARz: -1.15 + (a < 0 ? 0.55 : 0),
      kneeLx: 0.32, kneeRx: 0.32, legLx: -0.12, legRx: -0.12, rootY: -0.045,
    }; },
    // 2 · Hands-up festival sway.
    (s) => { const a = s % 2 ? 1 : -1; return {
      shLz: 2.55, shRz: -2.55, fALz: a * 0.35, fARz: a * 0.35,
      torsoRz: a * 0.15, hipsRz: -a * 0.12, headRx: -0.12, rootY: -0.02,
      kneeLx: 0.18, kneeRx: 0.18, legLx: -0.06, legRx: -0.06,
    }; },
    // 3 · Robot isolations — sharp asymmetric angles snapping per beat.
    (s) => { const q = s % 4; return {
      shLz: q < 2 ? 1.55 : 0.4, shRz: q >= 2 ? -1.55 : -0.4,
      fALx: q < 2 ? -1.35 : 0, fARx: q >= 2 ? -1.35 : 0,
      fALz: q < 2 ? 0.15 : 1.0, fARz: q >= 2 ? -0.15 : -1.0,
      headRy: (q === 1 || q === 2 ? 1 : -1) * 0.38, torsoRy: (q < 2 ? 1 : -1) * 0.22,
      kneeLx: 0.15, kneeRx: 0.15,
    }; },
    // 4 · Full turn — one clean 360° over six beats, arms wide, ends front
    // (rootRy is wrapped back to 0 at the move switch, see the beat handler).
    (s) => ({
      rootRy: Math.PI * 2 * Math.min(1, (s + 1) / 6),
      shLz: 1.45, shRz: -1.45, fALz: 0.1, fARz: -0.1,
      kneeLx: 0.25, kneeRx: 0.25, rootY: -0.03, hipsRz: (s % 2 ? 1 : -1) * 0.08,
    }),
    // 5 · Skate slide — the whole body glides side to side, arms opposed.
    (s) => { const a = s % 2 ? 1 : -1; return {
      rootX: a * 0.32, hipsRz: -a * 0.1, torsoRz: a * 0.08,
      legLx: a > 0 ? -0.5 : 0.15, legRx: a < 0 ? -0.5 : 0.15,
      kneeLx: a > 0 ? 0.75 : 0.2, kneeRx: a < 0 ? 0.75 : 0.2,
      shLx: a * 0.65, shRx: a * 0.65, fALz: 0.6, fARz: -0.6, headRy: a * 0.2, rootY: -0.06,
    }; },
    // 6 · Jump & freeze — crouch, explode up, then hold a pointed pose.
    (s): Pose => {
      if (s < 2) return { rootY: -0.16, kneeLx: 0.95, kneeRx: 0.95, legLx: -0.4, legRx: -0.4, torsoRx: 0.18, shLz: 0.5, shRz: -0.5, fALz: 0.9, fARz: -0.9 };
      if (s === 2) return { rootY: 0.3, kneeLx: 1.15, kneeRx: 1.15, legLx: -0.55, legRx: -0.55, shLz: 2.3, shRz: -2.3 };
      return { rootY: -0.02, shRz: -2.15, shRx: -0.3, fARz: -0.2, headRy: -0.25, headRx: -0.1, hipsRz: 0.12, torsoRz: -0.1, kneeLx: 0.2, kneeRx: 0.3, legRx: -0.15 };
    },
    // 7 · Overhead clap — arms gather and clap on every other beat.
    (s) => { const clap = s % 2 === 1; return {
      shLz: clap ? 2.35 : 1.7, shRz: clap ? -2.35 : -1.7,
      fALz: clap ? -0.5 : 0.2, fARz: clap ? 0.5 : -0.2,
      rootY: clap ? -0.02 : -0.06, kneeLx: clap ? 0.15 : 0.35, kneeRx: clap ? 0.15 : 0.35,
      torsoRx: clap ? -0.06 : 0.08, headRx: clap ? -0.15 : 0.05,
    }; },
    // 8 · Lunge & point — deep lunge pointing to the crowd, alternating sides.
    (s) => { const a = s % 4 < 2 ? 1 : -1; return {
      legLx: a > 0 ? -0.6 : 0.1, kneeLx: a > 0 ? 0.85 : 0.2,
      legRx: a < 0 ? -0.6 : 0.1, kneeRx: a < 0 ? 0.85 : 0.2,
      rootY: -0.1, torsoRy: a * 0.3, headRy: a * 0.32,
      shLz: a > 0 ? 1.9 : 0.4, fALz: a > 0 ? 0.05 : 0.9,
      shRz: a < 0 ? -1.9 : -0.4, fARz: a < 0 ? -0.05 : -0.9,
      hipsRz: a * 0.08,
    }; },
    // 9 · Running man — alternating knee lifts with opposed arm swing.
    (s) => { const a = s % 2 ? 1 : -1; return {
      legLx: a > 0 ? -0.75 : 0.3, kneeLx: a > 0 ? 1.0 : 0.1,
      legRx: a < 0 ? -0.75 : 0.3, kneeRx: a < 0 ? 1.0 : 0.1,
      rootY: -0.09, torsoRx: 0.12,
      shLx: a * 0.55, shRx: -a * 0.55, fALz: 0.95, fARz: -0.95,
      headRx: 0.06,
    }; },
    // 10 · Disco point — Saturday-night diagonal points, hand on hip between.
    (s) => { const a = s % 4 < 2 ? 1 : -1; return {
      shRz: a > 0 ? -2.35 : -0.35, fARz: a > 0 ? -0.1 : -1.15, shRx: a > 0 ? -0.25 : 0,
      shLz: a < 0 ? 2.35 : 0.35, fALz: a < 0 ? 0.1 : 1.15, shLx: a < 0 ? -0.25 : 0,
      headRy: a * 0.3, headRx: -0.14, torsoRz: -a * 0.12, hipsRz: a * 0.15,
      kneeLx: 0.25, kneeRx: 0.25, rootY: -0.04,
    }; },
    // 11 · Body wave — chest rolls forward/up in sequence, arms low and loose.
    (s): Pose => { const q = s % 4; return q === 0
      ? { torsoRx: 0.28, headRx: 0.2, rootY: -0.1, kneeLx: 0.45, kneeRx: 0.45, legLx: -0.15, legRx: -0.15, shLz: 0.5, shRz: -0.5, fALz: 0.5, fARz: -0.5 }
      : q === 1
      ? { torsoRx: -0.22, headRx: -0.16, rootY: -0.01, kneeLx: 0.1, kneeRx: 0.1, shLz: 0.65, shRz: -0.65, fALz: 0.2, fARz: -0.2 }
      : { torsoRx: 0.05, rootY: -0.05, kneeLx: 0.28, kneeRx: 0.28, hipsRz: (q === 2 ? 1 : -1) * 0.1, shLz: 0.45, shRz: -0.45, fALz: 0.7, fARz: -0.7 };
    },
    // 12 · Salsa side-step — hips leading hard, bent arms alternating.
    (s) => { const a = s % 2 ? 1 : -1; return {
      rootX: a * 0.2, hipsRz: a * 0.22, torsoRz: -a * 0.14, torsoRy: a * 0.16,
      legLx: a > 0 ? -0.25 : 0, legRx: a < 0 ? -0.25 : 0,
      kneeLx: a > 0 ? 0.45 : 0.15, kneeRx: a < 0 ? 0.45 : 0.15,
      shLz: 0.55, shRz: -0.55, fALz: a > 0 ? 1.25 : 0.5, fARz: a < 0 ? -1.25 : -0.5,
      fALx: -0.3, fARx: -0.3, headRy: a * 0.18, rootY: -0.05,
    }; },
    // 13 · Kick & punch — front kicks with the opposite arm punching forward.
    (s) => { const a = s % 2 ? 1 : -1; return {
      legLx: a > 0 ? -0.85 : 0.05, kneeLx: a > 0 ? 0.12 : 0.3,
      legRx: a < 0 ? -0.85 : 0.05, kneeRx: a < 0 ? 0.12 : 0.3,
      shLx: a < 0 ? -1.15 : 0.25, fALx: a < 0 ? -0.25 : 0, fALz: a < 0 ? 0.1 : 0.8,
      shRx: a > 0 ? -1.15 : 0.25, fARx: a > 0 ? -0.25 : 0, fARz: a > 0 ? -0.1 : -0.8,
      rootY: -0.06, torsoRx: 0.08, torsoRy: -a * 0.14,
    }; },
    // 14 · Drop & freeze — deep low groove drop, one arm flung high; holds,
    // then pops back up. Big dynamic-range contrast against the fast moves.
    (s): Pose => s % 4 < 2
      ? { rootY: -0.24, kneeLx: 1.25, kneeRx: 1.25, legLx: -0.5, legRx: -0.5, torsoRx: 0.15, torsoRz: 0.14,
          shLz: 2.15, fALz: 0.15, shRz: -0.5, fARz: -1.0, headRy: 0.25, headRx: -0.12, hipsRz: 0.1 }
      : { rootY: -0.02, kneeLx: 0.15, kneeRx: 0.15, shLz: 0.6, shRz: -0.6, fALz: 0.4, fARz: -0.4, torsoRz: -0.06 },
    // 15 · Big arm waves — one arm sweeps a huge overhead arc per beat.
    (s) => { const a = s % 2 ? 1 : -1; return {
      shLz: a > 0 ? 2.7 : 0.9, fALz: a > 0 ? 0.35 : 0.9,
      shRz: a < 0 ? -2.7 : -0.9, fARz: a < 0 ? -0.35 : -0.9,
      torsoRz: a * 0.18, hipsRz: -a * 0.12, headRy: a * 0.2,
      kneeLx: 0.25, kneeRx: 0.25, rootY: -0.05,
    }; },
    // 16 · Floss-ish — both arms swing to the same side, hips counter.
    (s) => { const a = s % 2 ? 1 : -1; return {
      shLz: a > 0 ? 1.0 : 0.15, shRz: a > 0 ? 0.35 : -1.0,
      fALz: 0.55, fARz: -0.55, shLx: a * 0.25, shRx: a * 0.25,
      hipsRz: -a * 0.2, torsoRz: a * 0.12, rootX: a * 0.06,
      kneeLx: 0.3, kneeRx: 0.3, rootY: -0.06, headRy: -a * 0.12,
    }; },
    // 17 · Stomp march — hard alternating stomps, fists pumping low.
    (s) => { const a = s % 2 ? 1 : -1; return {
      legLx: a > 0 ? -0.55 : 0.05, kneeLx: a > 0 ? 0.9 : 0.25,
      legRx: a < 0 ? -0.55 : 0.05, kneeRx: a < 0 ? 0.9 : 0.25,
      rootY: -0.09, torsoRx: 0.1, hipsRz: a * 0.08,
      shLz: 0.5, shRz: -0.5, fALz: a > 0 ? 1.3 : 0.5, fARz: a < 0 ? -1.3 : -0.5,
      headRx: 0.06,
    }; },
    // 18 · Praise bounce — both arms pinned high, double-time body pops.
    (s) => { const hi = s % 2 === 0; return {
      shLz: 2.5, shRz: -2.5, fALz: hi ? 0.15 : 0.45, fARz: hi ? -0.15 : -0.45,
      rootY: hi ? 0.02 : -0.12, kneeLx: hi ? 0.1 : 0.55, kneeRx: hi ? 0.1 : 0.55,
      torsoRx: hi ? -0.06 : 0.1, headRx: hi ? -0.15 : 0.05,
    }; },
  ];
  let movePlaylist = shuffleMoves(MOVES.map((_, i) => i));
  let moveCursor = 0;

  // Lead dancer + lazily-built party backups (hidden until party mode 1+).
  const dancers: Dancer[] = [mkDancer(rig, 0, 0, 0, 0)];
  let partyMode = 0; // 0 solo · 1 crew of 3 · 2 BIG PARTY (crowd + DJ)
  function ensureBackups() {
    if (dancers.length > 1) return;
    const spots: [number, number, number][] = [[-1.0, -0.5, 1], [1.0, -0.5, 2]]; // x, z, beat offset
    for (const [bx, bz, off] of spots) {
      const r = buildFigureRig(figMat, capeMat);
      r.group.position.set(bx, -0.05, bz);
      r.group.scale.setScalar(0.8);
      r.group.visible = false;
      scene.add(r.group);
      dancers.push(mkDancer(r, off, bx, bz, off * 2.1));
    }
  }
  const activeDancers = () => (partyMode >= 1 ? dancers : [dancers[0]]);

  // ── BIG PARTY crowd — 30 alien dancers + a DJ, rendered as six
  // InstancedMeshes (one per body part): the whole crowd costs six draw
  // calls, not six hundred. Each crowd dancer gets an archetype (bounce /
  // sway / hands-up / jumper), its own phase and scale — everyone locked to
  // the same beat clock as the lead, nobody doing the exact same thing. ──
  const CROWD_N = 30;
  type CrowdD = { x: number; z: number; s: number; face: number; type: number; phase: number };
  let bigCrowd: { parts: THREE.InstancedMesh[]; body: THREE.InstancedMesh; head: THREE.InstancedMesh; armL: THREE.InstancedMesh; armR: THREE.InstancedMesh; legs: THREE.InstancedMesh; eyes: THREE.InstancedMesh; data: CrowdD[] } | null = null;
  let djStripMat: THREE.MeshBasicMaterial | null = null;
  let djBooth: THREE.Group | null = null;
  let danceFloor: THREE.Mesh | null = null;
  const crowdDummy = new THREE.Object3D();
  function ensureCrowd() {
    if (bigCrowd) return;
    const N = CROWD_N + 1; // +1 = the DJ
    const mk = (geo: THREE.BufferGeometry, material: THREE.Material) => {
      const m = new THREE.InstancedMesh(geo, material, N);
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      m.frustumCulled = false;
      m.visible = false;
      scene.add(m);
      return m;
    };
    // Parts are authored with the pivot at their attachment point, so a
    // single instance matrix (position=joint, rotation=swing) animates them.
    const bodyGeo = new THREE.CapsuleGeometry(0.15, 0.3, 4, 8);
    const headGeo = new THREE.SphereGeometry(0.1, 10, 10); headGeo.scale(0.95, 1.35, 1);
    const armGeo = new THREE.CapsuleGeometry(0.045, 0.28, 3, 6); armGeo.translate(0, -0.17, 0);
    const legsGeo = new THREE.CapsuleGeometry(0.11, 0.4, 4, 8); legsGeo.translate(0, -0.28, 0);
    const eyesGeo = new THREE.SphereGeometry(0.085, 8, 8); eyesGeo.scale(1, 0.4, 0.5);
    const body = mk(bodyGeo, figMat), head = mk(headGeo, figMat), armL = mk(armGeo, figMat), armR = mk(armGeo, figMat), legs = mk(legsGeo, figMat);
    const eyeMatI = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 1.0, 0.85), transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
    const eyes = mk(eyesGeo, eyeMatI);
    const data: CrowdD[] = [];
    for (let i = 0; i < CROWD_N; i++) {
      // scatter across the floor, keeping front-center stage for the leads
      let x = 0, z = 0, tries = 0;
      do {
        x = (Math.random() - 0.5) * 6.4;
        z = -0.7 - Math.random() * 2.3;
        tries++;
      } while (Math.abs(x) < 1.35 && z > -1.5 && tries < 12);
      const s = (0.62 + Math.random() * 0.14) * (1 + (z + 3) * 0.045);
      data.push({ x, z, s, face: (Math.random() - 0.5) * 0.8, type: i % 4, phase: (i % 3) * 0.16 });
    }
    data.push({ x: 0, z: -3.55, s: 0.95, face: 0, type: 4, phase: 0 }); // the DJ
    bigCrowd = { parts: [body, head, armL, armR, legs, eyes], body, head, armL, armR, legs, eyes, data };

    // DJ booth — dark slab with a beat-pulsing glow strip.
    djBooth = new THREE.Group();
    const booth = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.6, 0.45), new THREE.MeshBasicMaterial({ color: 0x0a0a18 }));
    booth.position.set(0, 0.3, -3.15);
    djBooth.add(booth);
    djStripMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 0.9, 1.0), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(1.66, 0.1), djStripMat);
    strip.position.set(0, 0.34, -2.92);
    djBooth.add(strip);
    djBooth.visible = false;
    scene.add(djBooth);

    // Glowing checkerboard dance floor under everyone.
    const fc = document.createElement('canvas'); fc.width = fc.height = 256;
    const fg = fc.getContext('2d')!;
    for (let yy = 0; yy < 8; yy++) for (let xx = 0; xx < 8; xx++) {
      fg.fillStyle = (xx + yy) % 2 ? 'rgba(120,60,255,0.55)' : 'rgba(0,180,255,0.35)';
      fg.fillRect(xx * 32, yy * 32, 30, 30);
    }
    const floorTexP = new THREE.CanvasTexture(fc);
    danceFloor = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 3.6), new THREE.MeshBasicMaterial({ map: floorTexP, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false }));
    danceFloor.rotation.x = -Math.PI / 2;
    danceFloor.position.set(0, -0.02, -2.0);
    danceFloor.visible = false;
    scene.add(danceFloor);
  }
  function setCrowdVisible(on: boolean) {
    if (!bigCrowd) return;
    for (const p of bigCrowd.parts) p.visible = on;
    if (djBooth) djBooth.visible = on;
    if (danceFloor) danceFloor.visible = on;
  }
  // Per-frame crowd animation — cheap parametric motion per dancer (no
  // springs): hop/lean/arm-raise computed from the shared beat clock and
  // the dancer's archetype, then written as instance matrices.
  function updateCrowd(now2: number, t2: number) {
    if (!bigCrowd) return;
    const bp = Math.min(1, (now2 - lastBeat) / tempoMs);
    const even = beatCount % 2 === 0;
    for (let i = 0; i < bigCrowd.data.length; i++) {
      const d = bigCrowd.data[i];
      const cyc = (bp + d.phase) % 1;
      const pulse = Math.sin(Math.PI * cyc);
      const sway = Math.sin((t2 * 0.7 + d.phase * 7) * 1.3) * 0.05;
      let hop = 0, lean = 0, raiseL = 0.35, raiseR = 0.35, bob = 0;
      if (d.type === 0) { hop = pulse * 0.07; raiseL = 0.5 + pulse * 0.5; raiseR = 0.5 + (1 - pulse) * 0.5; lean = (even ? 1 : -1) * pulse * 0.08; }
      else if (d.type === 1) { lean = (even ? 1 : -1) * pulse * 0.16; hop = pulse * 0.03; raiseL = 0.4; raiseR = 0.4; }
      else if (d.type === 2) { raiseL = 2.5 + Math.sin(t2 * 2 + d.phase * 9) * 0.25; raiseR = 2.5 + Math.cos(t2 * 2.2 + d.phase * 9) * 0.25; hop = pulse * 0.05; }
      else if (d.type === 3) { const dbl = even ? pulse : 0; hop = dbl * 0.16; raiseL = 0.9 + dbl * 1.4; raiseR = 0.9 + dbl * 1.4; }
      else { hop = pulse * 0.02; bob = pulse * 0.06; raiseL = 0.9 + (even ? pulse : 0) * 0.5; raiseR = 0.9 + (even ? 0 : pulse) * 0.5; lean = sway; } // DJ scratching
      hop *= energy;
      lean = lean * energy + sway * 0.4;
      const hipY = 0.66 * d.s + hop;
      crowdDummy.scale.setScalar(d.s);
      crowdDummy.position.set(d.x, hipY, d.z);
      crowdDummy.rotation.set(0, d.face, lean * 0.4);
      crowdDummy.updateMatrix();
      bigCrowd.legs.setMatrixAt(i, crowdDummy.matrix);
      crowdDummy.position.set(d.x, hipY + 0.3 * d.s, d.z);
      crowdDummy.rotation.set(0, d.face, lean);
      crowdDummy.updateMatrix();
      bigCrowd.body.setMatrixAt(i, crowdDummy.matrix);
      crowdDummy.position.set(d.x, hipY + (0.62 + bob) * d.s, d.z);
      crowdDummy.rotation.set(0, d.face, lean * 1.3);
      crowdDummy.updateMatrix();
      bigCrowd.head.setMatrixAt(i, crowdDummy.matrix);
      crowdDummy.position.set(d.x + Math.sin(d.face) * 0.085 * d.s, hipY + (0.63 + bob) * d.s, d.z + Math.cos(d.face) * 0.085 * d.s);
      crowdDummy.updateMatrix();
      bigCrowd.eyes.setMatrixAt(i, crowdDummy.matrix);
      crowdDummy.position.set(d.x - 0.19 * d.s * Math.cos(d.face), hipY + 0.42 * d.s, d.z + 0.19 * d.s * Math.sin(d.face));
      crowdDummy.rotation.set(0, d.face, -raiseL + lean);
      crowdDummy.updateMatrix();
      bigCrowd.armL.setMatrixAt(i, crowdDummy.matrix);
      crowdDummy.position.set(d.x + 0.19 * d.s * Math.cos(d.face), hipY + 0.42 * d.s, d.z - 0.19 * d.s * Math.sin(d.face));
      crowdDummy.rotation.set(0, d.face, raiseR + lean);
      crowdDummy.updateMatrix();
      bigCrowd.armR.setMatrixAt(i, crowdDummy.matrix);
    }
    for (const p of bigCrowd.parts) p.instanceMatrix.needsUpdate = true;
    if (djStripMat) djStripMat.opacity = 0.3 + beatPulse * 0.5;
    if (danceFloor) (danceFloor.material as THREE.MeshBasicMaterial).opacity = 0.1 + beatPulse * energy * 0.18;
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
  let camParty = 0; // smoothed 0..1 — camera pull-back for big party
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
      // Choreography: on each beat, set the target pose from the current
      // move's step chart; every BEATS_PER_PATTERN beats advance to the
      // next move in the shuffled playlist (reshuffling when exhausted).
      // Party backups run the same move at a per-dancer beat offset — a
      // choreographed crew wave rather than three clones in lockstep.
      const step = beatCount % BEATS_PER_PATTERN;
      if (step === 0) {
        // Wrap any accumulated full turn so the next move starts facing
        // front instead of spring-unwinding backwards through 360°.
        for (const d of dancers) {
          const wrap = Math.round(d.cur.rootRy / (Math.PI * 2)) * Math.PI * 2;
          d.cur.rootRy -= wrap; d.tgt.rootRy -= wrap;
        }
        moveCursor++;
        if (moveCursor >= movePlaylist.length) { movePlaylist = shuffleMoves(movePlaylist); moveCursor = 0; }
      }
      const moveFn = MOVES[movePlaylist[moveCursor]];
      // Every 4th move block the crew snaps into PERFECT unison (offset 0
      // for everyone) — the classic "drop" moment; the other blocks keep
      // the offset wave so the routine breathes between the two.
      const unison = Math.floor(beatCount / BEATS_PER_PATTERN) % 4 === 3;
      for (const d of activeDancers()) setPoseFor(d, moveFn((step + (unison ? 0 : d.stepOffset)) % BEATS_PER_PATTERN));
    }
    if (!playing) for (const d of activeDancers()) setPoseFor(d, BASE_POSE); // paused → calm idle
    beatPulse *= 0.9;

    // Integrate the pose springs — underdamped (slight overshoot) so every
    // pose change lands with a physical "hit" instead of a linear glide.
    {
      const kSpring = 130, damp = 15;
      for (const d of activeDancers()) {
        for (const key of POSE_KEYS) {
          d.vel[key] += (d.tgt[key] - d.cur[key]) * kSpring * dt;
          d.vel[key] *= Math.exp(-damp * dt);
          d.cur[key] += d.vel[key] * dt;
        }
      }
    }

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
    figMat.uniforms.uTime.value = t;
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

    // Apply spring pose + a continuous micro-groove layer (breathing sway,
    // beat throb in the knees/root) so the body never fully freezes even
    // during held poses. Runs per active dancer, with a per-dancer phase on
    // the micro-motion so the crew doesn't breathe in eerie unison.
    const bounceCycle = ((now - lastBeat) / tempoMs);
    const bounce = Math.max(0, Math.sin(Math.PI * Math.min(1, bounceCycle * 1.4))) * energy;
    for (const d of activeDancers()) {
      const S = d.cur;
      const dg = d.rig;
      const tp = t + d.microPhase;
      dg.group.position.y = -0.05 + S.rootY - bounce * 0.06;
      dg.group.position.x = d.baseX + S.rootX;
      dg.group.position.z = d.baseZ;
      dg.group.rotation.y = S.rootRy + Math.sin(tp * 0.4) * 0.04 * energy;
      dg.hips.rotation.z = S.hipsRz + Math.sin(tp * 2.0) * 0.02 * energy;
      dg.torso.rotation.x = S.torsoRx;
      dg.torso.rotation.y = S.torsoRy + Math.sin(tp * 1.1) * 0.03 * energy;
      dg.torso.rotation.z = S.torsoRz;
      dg.head.rotation.x = S.headRx + Math.sin(tp * 1.7) * 0.02;
      dg.head.rotation.y = S.headRy + Math.sin(tp * 1.1 + 0.4) * 0.06;
      // Sign flip on the Z axes: poses are authored as "positive = raise
      // the arm", but +Z rotation swings a hanging left arm INWARD through
      // the torso (this was the "body swallows the arms" bug). Negating
      // here makes every raise sweep OUTWARD around the body; authored
      // negatives (e.g. the overhead clap) correctly curl inward above the
      // head where there is nothing to clip through.
      dg.shoulderL.rotation.z = -S.shLz; dg.shoulderL.rotation.x = S.shLx;
      dg.shoulderR.rotation.z = -S.shRz; dg.shoulderR.rotation.x = S.shRx;
      dg.foreArmL.rotation.z = -S.fALz; dg.foreArmL.rotation.x = S.fALx;
      dg.foreArmR.rotation.z = -S.fARz; dg.foreArmR.rotation.x = S.fARx;
      dg.legL.rotation.x = S.legLx; dg.legL.rotation.z = S.legLz;
      dg.legR.rotation.x = S.legRx; dg.legR.rotation.z = S.legRz;
      dg.kneeL.rotation.x = S.kneeLx + bounce * 0.25;
      dg.kneeR.rotation.x = S.kneeRx + bounce * 0.2;
    }

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
    confettiMat.opacity = Math.min(1, (0.15 + energy * 0.55) * (partyMode === 2 ? 1.9 : partyMode === 1 ? 1.5 : 1));

    for (let i = 0; i < hazeSprites.length; i++) {
      hazeSprites[i].position.x += Math.sin(t * 0.15 + i) * 0.0015;
      (hazeSprites[i].material as THREE.SpriteMaterial).opacity = 0.06 + Math.sin(t * 0.3 + i) * 0.03;
    }

    if (partyMode === 2) updateCrowd(now, t);

    // Subtle cinematic camera sway + a gentle breathing zoom on the beat.
    // Big party pulls the camera back and up so the whole dance floor,
    // crowd and DJ booth frame together.
    camParty += ((partyMode === 2 ? 1 : 0) - camParty) * Math.min(1, dt * 2);
    camera.position.x = camBase.x + Math.sin(t * 0.12) * 0.08;
    camera.position.y = camBase.y + Math.sin(t * 0.09 + 1) * 0.04 + camParty * 0.5;
    camera.position.z = camBase.z - beatPulse * energy * 0.06 + camParty * 1.6;
    camera.lookAt(0, 1.05 - camParty * 0.3, -camParty * 0.9);

    composer.render();
  }
  raf = requestAnimationFrame(frame);

  return {
    setEnergy(p: boolean) { playing = p; },
    setTempo(ms: number) {
      if (Number.isFinite(ms) && ms > 0) tempoMs = ms;
    },
    setParty(mode: boolean | number) {
      partyMode = mode === true ? 1 : mode === false ? 0 : Math.max(0, Math.min(2, Math.round(mode)));
      if (partyMode >= 1) ensureBackups();
      for (let i = 1; i < dancers.length; i++) dancers[i].rig.group.visible = partyMode >= 1;
      if (partyMode === 2) ensureCrowd();
      setCrowdVisible(partyMode === 2);
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
