// ═══════════════════════════════════════════════════════════════════════
// LYRICS::TRANSLATOR hero visual — a Tulum/Zamna-festival-style centerpiece:
// a dark humanoid silhouette groove-dancing inside a vertical shaft of
// light, flanked by two walls of pulsing light fins, haze, and bloom.
// Owner reference: a festival stage photo (backlit figure suspended in a
// light shaft between two illuminated walls, purple/blue haze, crowd below).
//
// Adapted, not copied 1:1: the reference is a single frozen stunt-rig
// freeze-frame (a performer mid-fall on a wire). The user's actual ask was
// "a character that can move to the beat" — a static falling pose can't
// groove — so the pose here is a standing/grooving rig (bounce, arm-pump,
// hip sway) that keeps the reference's LIGHTING language (vertical beam,
// side light fins, purple/cyan haze) while actually being danceable.
//
// No real audio stream exists to analyze (Spotify's Web API exposes only
// track metadata + transport, never PCM/frequency data) — same constraint
// already solved for the 2D equalizer elsewhere in this app. The beat here
// is a procedural rhythm generator (fixed tempo pulse + per-fin chase),
// identical in spirit to that equalizer's "chase random targets on a
// beat-ish cadence" approach, just driving a 3D rig instead of 2D bars.
// ═══════════════════════════════════════════════════════════════════════
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export interface LyricsAvatarHandle {
  setEnergy(playing: boolean): void;
  dispose(): void;
}

const TEMPO_MS = 560; // ~107bpm — a comfortable, generic dance-pulse cadence

function buildFigureMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uPulse: { value: 0 },
    },
    vertexShader: /* glsl */`
      varying vec3 vNormalW;
      varying vec3 vViewDirW;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vViewDirW = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform float uPulse;
      varying vec3 vNormalW;
      varying vec3 vViewDirW;
      void main() {
        // Solid dark silhouette (reads as backlit, like the reference) with
        // a thin additive rim in a violet→cyan gradient that brightens on
        // the beat pulse.
        float fresnel = pow(1.0 - clamp(dot(normalize(vNormalW), normalize(vViewDirW)), 0.0, 1.0), 2.6);
        vec3 violet = vec3(0.56, 0.22, 0.95);
        vec3 cyan = vec3(0.2, 0.85, 1.0);
        vec3 rim = mix(violet, cyan, fresnel) * fresnel * (0.9 + uPulse * 1.4);
        vec3 fill = vec3(0.015, 0.01, 0.03);
        gl_FragColor = vec4(fill + rim, 1.0);
      }
    `,
  });
}

function buildFigureRig(mat: THREE.ShaderMaterial) {
  const group = new THREE.Group();
  const cap = (r: number, len: number) => new THREE.CapsuleGeometry(r, len, 4, 8);
  const sph = (r: number) => new THREE.SphereGeometry(r, 14, 14);

  const head = new THREE.Mesh(sph(0.16), mat); head.position.y = 1.62; group.add(head);
  const neck = new THREE.Mesh(cap(0.055, 0.06), mat); neck.position.y = 1.46; group.add(neck);
  const torso = new THREE.Mesh(cap(0.22, 0.46), mat); torso.position.y = 1.1; group.add(torso);
  const hips = new THREE.Mesh(sph(0.21), mat); hips.position.y = 0.72; hips.scale.set(1, 0.7, 0.88); group.add(hips);

  const thighL = new THREE.Mesh(cap(0.095, 0.42), mat); const legL = new THREE.Group(); legL.position.set(-0.11, 0.5, 0); legL.add(thighL); thighL.position.y = -0.21; group.add(legL);
  const shinL = new THREE.Mesh(cap(0.08, 0.42), mat); shinL.position.set(0, -0.63, 0); legL.add(shinL);
  const footL = new THREE.Mesh(sph(0.09), mat); footL.position.set(0, -0.86, 0.07); footL.scale.set(1, 0.6, 1.5); legL.add(footL);

  const thighR = new THREE.Mesh(cap(0.095, 0.42), mat); const legR = new THREE.Group(); legR.position.set(0.11, 0.5, 0); legR.add(thighR); thighR.position.y = -0.21; group.add(legR);
  const shinR = new THREE.Mesh(cap(0.08, 0.42), mat); shinR.position.set(0, -0.63, 0); legR.add(shinR);
  const footR = new THREE.Mesh(sph(0.09), mat); footR.position.set(0, -0.86, 0.07); footR.scale.set(1, 0.6, 1.5); legR.add(footR);

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

  group.position.y = -0.05;
  return { group, legL, legR, shoulderL, shoulderR, foreArmL, foreArmR, torso, head, hips };
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
        // slow drifting haze band riding through it.
        float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
        float col = pow(edge, 1.6);
        float haze = sin(vUv.y * 6.0 - uTime * 0.6) * 0.5 + 0.5;
        float vfade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
        vec3 violet = vec3(0.42, 0.18, 0.85);
        vec3 cyan = vec3(0.22, 0.75, 0.95);
        vec3 tint = mix(violet, cyan, 0.35 + haze * 0.3);
        float alpha = col * vfade * (0.22 + uPulse * 0.22) * (0.7 + haze * 0.3);
        gl_FragColor = vec4(tint, alpha);
      }
    `,
  });
}

function buildFinMaterial() {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(0.75, 0.92, 1.0),
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

export function mountLyricsAvatar(container: HTMLElement): LyricsAvatarHandle {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0518, 0.09);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 1.15, 4.4);
  camera.lookAt(0, 1.05, 0);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.55, 0.25);
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

  // ── Two walls of thin vertical light fins flanking the figure — same
  // "chase a random target" procedural rhythm as the 2D equalizer, just
  // rendered as 3D emissive bars instead of canvas rectangles. ──
  const FIN_COUNT = 9;
  const fins: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; val: number; target: number }[] = [];
  const finGeo = new THREE.BoxGeometry(0.045, 1, 0.045);
  for (const side of [-1, 1]) {
    for (let i = 0; i < FIN_COUNT; i++) {
      const mat = buildFinMaterial();
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
  const rig = buildFigureRig(figMat);
  scene.add(rig.group);

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
  let raf = 0;
  let start = performance.now();
  let lastBeat = 0;
  let beatPulse = 0; // decays after each beat tick

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    const t = (now - start) / 1000;
    const targetEnergy = playing ? 1 : 0.25;
    energy += (targetEnergy - energy) * 0.04;

    // Procedural beat: a pulse fires every TEMPO_MS while playing, decays
    // exponentially — drives the fins' chase target refresh + a bounce.
    if (playing && now - lastBeat > TEMPO_MS) {
      lastBeat = now;
      beatPulse = 1;
      for (const f of fins) f.target = 0.35 + Math.random() * 0.65;
    }
    beatPulse *= 0.9;

    figMat.uniforms.uPulse.value = beatPulse * energy;
    beamMat.uniforms.uTime.value = t;
    beamMat.uniforms.uPulse.value = beatPulse * energy;

    for (const f of fins) {
      f.val += (f.target * energy - f.val) * 0.15;
      f.mat.opacity = 0.15 + f.val * 0.65;
      f.mesh.scale.y = 0.8 + f.val * 1.8;
    }

    // Groove: bounce + arm pump + hip sway, amplitude scaled by energy so a
    // paused/idle state settles to a gentle breathing sway instead of
    // freezing dead.
    const bounceCycle = ((now - lastBeat) / TEMPO_MS);
    const bounce = Math.max(0, Math.sin(Math.PI * Math.min(1, bounceCycle * 1.4))) * energy;
    rig.group.position.y = -0.05 - bounce * 0.09;
    rig.hips.rotation.z = Math.sin(t * 2.1) * 0.06 * (0.4 + energy * 0.6);
    rig.torso.rotation.y = Math.sin(t * 1.3) * 0.1 * (0.4 + energy * 0.6);
    rig.head.rotation.y = Math.sin(t * 1.1 + 0.4) * 0.12;
    rig.legL.rotation.x = -bounce * 0.35;
    rig.legR.rotation.x = bounce * 0.2;
    rig.shoulderL.rotation.z = 0.3 + Math.sin(t * 2.4) * 0.25 * (0.3 + energy * 0.7);
    rig.shoulderR.rotation.z = -0.3 - Math.sin(t * 2.4 + 0.5) * 0.25 * (0.3 + energy * 0.7);
    rig.foreArmL.rotation.z = Math.sin(t * 2.4 + 1) * 0.3 * energy;
    rig.foreArmR.rotation.z = -Math.sin(t * 2.4 + 1.4) * 0.3 * energy;

    for (let i = 0; i < hazeSprites.length; i++) {
      hazeSprites[i].position.x += Math.sin(t * 0.15 + i) * 0.0015;
      (hazeSprites[i].material as THREE.SpriteMaterial).opacity = 0.06 + Math.sin(t * 0.3 + i) * 0.03;
    }

    composer.render();
  }
  raf = requestAnimationFrame(frame);

  return {
    setEnergy(p: boolean) { playing = p; },
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
      renderer.dispose();
      composer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    },
  };
}
