// ═══════════════════════════════════════════════════════════════════════
// LYRICS::TRANSLATOR hero visual — a Tulum/Zamna-festival-style centerpiece:
// a dark humanoid silhouette dancing inside a vertical shaft of light,
// flanked by two walls of pulsing light fins, a festival
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
  // Avatar color theme — index into AVATAR_THEMES.
  setTheme?(idx: number): void;
  // LIVE beat engine — real onsets detected from the microphone (the room's
  // actual Spotify audio). liveBeatTick() fires the show's beat exactly on
  // a detected onset (overrides the internal clock until the mic goes
  // quiet); bassDrop() slams a two-beat high-impact accent pose + triple
  // floor shockwave; setLiveBeat(false) hands control back to the clock.
  liveBeatTick?(): void;
  bassDrop?(): void;
  setLiveBeat?(on: boolean): void;
  dispose(): void;
}

const DEFAULT_TEMPO_MS = 560; // ~107bpm fallback, used until setTempo() supplies a real per-song value
const BEATS_PER_PATTERN = 8; // choreography switches every N beats

// ── Avatar color themes — user-selectable. a/b = the rim gradient pair,
// c = the hot accent at grazing angles, eye = eyes/antenna-tips/energy-core
// tint. "rainbow" ignores a/b/c and cycles the full spectrum in-shader. ──
export interface AvatarTheme { name: string; a: [number, number, number]; b: [number, number, number]; c: [number, number, number]; eye: [number, number, number]; rainbow?: boolean }
export const AVATAR_THEMES: AvatarTheme[] = [
  { name: 'נאון קלאסי', a: [0.58, 0.24, 0.97], b: [0.16, 0.85, 1.0], c: [0.98, 0.22, 0.66], eye: [0.35, 1.0, 0.85] },
  { name: 'זהב מלכותי', a: [1.0, 0.72, 0.2], b: [1.0, 0.9, 0.55], c: [1.0, 0.45, 0.1], eye: [1.0, 0.85, 0.4] },
  { name: 'להבה', a: [1.0, 0.2, 0.05], b: [1.0, 0.55, 0.1], c: [1.0, 0.85, 0.3], eye: [1.0, 0.6, 0.25] },
  { name: 'חייזר ירוק', a: [0.15, 0.95, 0.3], b: [0.6, 1.0, 0.4], c: [0.1, 0.8, 0.6], eye: [0.5, 1.0, 0.5] },
  { name: 'קרח', a: [0.35, 0.65, 1.0], b: [0.8, 0.95, 1.0], c: [0.5, 0.8, 1.0], eye: [0.75, 0.95, 1.0] },
  { name: 'ורוד ניאון', a: [1.0, 0.15, 0.65], b: [1.0, 0.5, 0.85], c: [0.8, 0.3, 1.0], eye: [1.0, 0.6, 0.9] },
  { name: 'טורקיז', a: [0.05, 0.85, 0.75], b: [0.3, 1.0, 0.9], c: [0.1, 0.6, 0.9], eye: [0.4, 1.0, 0.9] },
  { name: 'גלקסיה', a: [0.35, 0.15, 0.9], b: [0.15, 0.4, 1.0], c: [0.9, 0.3, 0.9], eye: [0.65, 0.55, 1.0] },
  { name: 'כסוף זוהר', a: [0.85, 0.9, 1.0], b: [1.0, 1.0, 1.0], c: [0.6, 0.75, 1.0], eye: [0.95, 0.98, 1.0] },
  { name: 'מטריקס', a: [0.05, 0.75, 0.2], b: [0.3, 1.0, 0.45], c: [0.7, 1.0, 0.6], eye: [0.4, 1.0, 0.4] },
  { name: 'שקיעה', a: [1.0, 0.4, 0.15], b: [1.0, 0.2, 0.5], c: [0.7, 0.25, 0.9], eye: [1.0, 0.65, 0.45] },
  { name: '🌈 קשת חיה', a: [1, 0, 0], b: [0, 1, 0], c: [0, 0, 1], eye: [1.0, 1.0, 1.0], rainbow: true },
];

function buildFigureMaterial() {
  const t0 = AVATAR_THEMES[0];
  return new THREE.ShaderMaterial({
    uniforms: {
      uPulse: { value: 0 }, uTime: { value: 0 },
      uColA: { value: new THREE.Vector3(...t0.a) },
      uColB: { value: new THREE.Vector3(...t0.b) },
      uColC: { value: new THREE.Vector3(...t0.c) },
      uRainbow: { value: 0 },
    },
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
      uniform vec3 uColA;
      uniform vec3 uColB;
      uniform vec3 uColC;
      uniform float uRainbow;
      varying vec3 vNormalW;
      varying vec3 vViewDirW;
      varying vec3 vWorldPos;
      void main() {
        // Glossy black-glass android: near-black body with a TIGHT neon rim
        // (reads sharp instead of the old washed-out ghost), an animated
        // iridescent hue drift, and a real specular highlight from a fixed
        // key light so the limbs read as solid curved surfaces, not fog.
        // Rim colors are user-selectable theme uniforms; rainbow mode
        // cycles the full spectrum via a cosine palette.
        vec3 n = normalize(vNormalW);
        vec3 v = normalize(vViewDirW);
        float ndv = clamp(dot(n, v), 0.0, 1.0);
        float fresnel = pow(1.0 - ndv, 3.2);
        float hueDrift = sin(uTime * 0.25) * 0.5 + 0.5;
        vec3 cA = uColA, cB = uColB, cC = uColC;
        if (uRainbow > 0.5) {
          float hh = uTime * 0.12;
          cA = 0.5 + 0.5 * cos(6.2832 * (hh + vec3(0.0, 0.33, 0.67)));
          cB = 0.5 + 0.5 * cos(6.2832 * (hh + 0.25 + vec3(0.0, 0.33, 0.67)));
          cC = 0.5 + 0.5 * cos(6.2832 * (hh + 0.5 + vec3(0.0, 0.33, 0.67)));
        }
        vec3 grad = mix(mix(cA, cB, hueDrift), cC, smoothstep(0.75, 1.0, fresnel) * 0.5);
        vec3 rim = grad * fresnel * (1.35 + uPulse * 2.2);
        // key-light specular (fixed light up-left-front) — the "real material" read
        vec3 lightDir = normalize(vec3(-0.35, 0.9, 0.55));
        vec3 h = normalize(lightDir + v);
        float spec = pow(clamp(dot(n, h), 0.0, 1.0), 42.0) * 0.5;
        // soft cool bounce fill from below so the underside isn't a void
        float below = clamp(-n.y, 0.0, 1.0) * 0.03;
        vec3 fill = vec3(0.008, 0.006, 0.016) + vec3(0.25, 0.3, 0.55) * below;

        // ── Biomechanical neon circuitry veins ──────────────────────────
        // Thin glowing lines running along the body surface, energy pulses
        // travelling up them, cycling purple → cyan → green. Two crossing
        // vein fields (vertical-ish + diagonal) give a woven-circuit read;
        // a bright travelling pulse rides each vein and flares on the beat.
        float vy = vWorldPos.y * 7.0;
        float vx = (vWorldPos.x + vWorldPos.z) * 5.0;
        float veinA = pow(0.5 + 0.5 * sin(vy + sin(vx * 0.6) * 1.4), 22.0);        // near-vertical traces
        float veinB = pow(0.5 + 0.5 * sin(vx * 1.3 + vy * 0.35 + 1.7), 26.0);      // diagonal traces
        float flow = 0.5 + 0.5 * sin(vWorldPos.y * 4.0 - uTime * 3.5);             // energy travelling upward
        float veins = (veinA + veinB) * (0.35 + flow * 0.9);
        vec3 vPurple = vec3(0.75, 0.0, 1.0);
        vec3 vCyan   = vec3(0.0, 0.9, 1.0);
        vec3 vGreen  = vec3(0.0, 1.0, 0.25);
        float cph = fract(uTime * 0.12 + vWorldPos.y * 0.15);
        vec3 veinCol = cph < 0.33 ? mix(vPurple, vCyan, cph / 0.33)
                     : cph < 0.66 ? mix(vCyan, vGreen, (cph - 0.33) / 0.33)
                                  : mix(vGreen, vPurple, (cph - 0.66) / 0.34);
        vec3 veinGlow = veinCol * veins * (0.9 + uPulse * 2.6);

        gl_FragColor = vec4(fill + rim + veinGlow + vec3(0.85, 0.92, 1.0) * spec, 1.0);
      }
    `,
  });
}

// The glowing audio waveform strung between the two antenna tips — a Line
// whose vertices are displaced into a live sine wave in the vertex shader
// (amplitude rides uEnergy/uPulse), so it reads as a signal arcing across
// the antennae. Additive + theme-tinted.
function buildWaveMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uEnergy: { value: 0.3 }, uPulse: { value: 0 }, uCol: { value: new THREE.Vector3(0.35, 1.0, 0.85) } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute float aT;
      uniform float uTime; uniform float uEnergy; uniform float uPulse;
      varying float vT;
      void main() {
        vT = aT;
        vec3 p = position;
        float amp = 0.028 * (0.3 + uEnergy) + uPulse * 0.03;
        // taper the wave to zero at both antenna tips so it "attaches"
        float taper = sin(aT * 3.14159);
        p.y += sin(aT * 22.0 - uTime * 9.0) * amp * taper;
        p.z += cos(aT * 15.0 - uTime * 7.0) * amp * 0.6 * taper;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform vec3 uCol; uniform float uPulse;
      varying float vT;
      void main() {
        float edge = sin(vT * 3.14159);
        gl_FragColor = vec4(uCol * (1.2 + uPulse * 1.5), edge * 0.9);
      }
    `,
  });
}

function buildFigureRig(mat: THREE.ShaderMaterial, waveMat: THREE.ShaderMaterial) {
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
  // Audio waveform arcing between the two antenna tips (head-local coords;
  // tips resolve to ≈(±0.094, 0.284) after the antennae's outward tilt).
  {
    const N = 28;
    const pos = new Float32Array(N * 3), aT = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const f = i / (N - 1);
      pos[i * 3] = -0.094 + f * 0.188;
      pos[i * 3 + 1] = 0.284;
      pos[i * 3 + 2] = 0.02;
      aT[i] = f;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
    head.add(new THREE.Line(g, waveMat));
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

  // (The cape plane was removed per user request — the semi-transparent
  // violet sheet behind the torso read as a floating purple box.)

  // Premium detailing: a pulsing energy core in the chest + small glow
  // nodes on the shoulder/knee joints — theme-tinted with the eyes, they
  // sell "engineered alien tech" instead of plain rubber limbs.
  const core = new THREE.Mesh(sph(0.055), eyeMat);
  core.position.set(0, 1.24, 0.185);
  core.scale.set(1, 1.25, 0.5);
  group.add(core);
  for (const jt of [shoulderL, shoulderR] as THREE.Group[]) {
    const dot = new THREE.Mesh(sph(0.028), eyeMat);
    jt.add(dot);
  }
  for (const jt of [kneeL, kneeR] as THREE.Group[]) {
    const dot = new THREE.Mesh(sph(0.024), eyeMat);
    jt.add(dot);
  }

  // accents = every additive glow material on this rig (eyes, antenna
  // tips, chest core, joint dots) — the theme system tints them together.
  return { group, legL, legR, kneeL, kneeR, shoulderL, shoulderR, foreArmL, foreArmR, torso, head, hips, accents: [eyeMat, antTipMat] };
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

  // ── Volumetric spotlights — two cones hanging over the stage, sweeping
  // and strobing exactly on the beat, tinted from the active color theme
  // (one takes the theme's hot accent, the other its secondary). ──
  const spotGeo = new THREE.ConeGeometry(0.95, 3.6, 20, 1, true);
  spotGeo.translate(0, -1.8, 0); // apex at origin → the cone hangs downward
  const spots: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; phase: number; colIdx: 0 | 1 }[] = [];
  for (const [sx, phase, colIdx] of [[-1.7, 0, 0], [1.7, Math.PI * 0.7, 1]] as [number, number, 0 | 1][]) {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(spotGeo, mat);
    mesh.position.set(sx, 3.3, -0.6);
    scene.add(mesh);
    spots.push({ mesh, mat, phase, colIdx });
  }

  // ── Wet-asphalt reflective floor (PILLAR 2/4) — a real Reflector doubles
  // the whole render (fatal with 30 crowd dancers), so this fakes the "wet
  // black puddle" look in one cheap shader plane: near-black base, a bright
  // vertical smear directly under the light beam (the beam's reflection),
  // grazing-angle sheen, and a slow animated ripple. ──
  const floorReflMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPulse: { value: 0 }, uCol: { value: new THREE.Vector3(0.3, 0.55, 1.0) } },
    transparent: true, depthWrite: false,
    vertexShader: /* glsl */`
      varying vec2 vUv; varying vec3 vWpos;
      void main() { vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vWpos = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform float uTime; uniform float uPulse; uniform vec3 uCol;
      varying vec2 vUv; varying vec3 vWpos;
      void main() {
        // distance from the stage centerline (x≈0) — the beam's wet smear
        float cx = abs(vWpos.x);
        float smear = exp(-cx * cx * 2.2);
        // depth fade to the horizon + a rolling ripple shimmer
        float depth = smoothstep(1.0, 0.0, vUv.y);
        float ripple = 0.5 + 0.5 * sin(vWpos.z * 9.0 - uTime * 2.0 + sin(vWpos.x * 6.0) * 1.5);
        vec3 col = uCol * (smear * (0.5 + ripple * 0.5) * (0.6 + uPulse * 0.9));
        float a = (0.06 + smear * 0.5) * depth;
        gl_FragColor = vec4(col, a);
      }
    `,
  });
  const floorRefl = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), floorReflMat);
  floorRefl.rotation.x = -Math.PI / 2;
  floorRefl.position.set(0, -0.06, -1.6);
  scene.add(floorRefl);

  // ── Subwoofer monoliths (PILLAR 2) — two tall sci-fi speaker cabinets
  // flanking the stage, each with two cones that punch forward (+Z) on the
  // beat and a grille glow that flares with the bass. ──
  const subs: { cones: THREE.Mesh[]; glow: THREE.MeshBasicMaterial }[] = [];
  for (const sx of [-2.85, 2.85]) {
    const cabinet = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 2.6, 0.9),
      new THREE.MeshBasicMaterial({ color: 0x0a0a12 }),
    );
    cabinet.position.set(sx, 1.1, -1.9);
    scene.add(cabinet);
    const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 0.6, 1.0), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
    const cones: THREE.Mesh[] = [];
    for (const cy of [1.55, 0.65]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 8, 24), glowMat);
      ring.position.set(sx, cy, -1.44);
      scene.add(ring);
      const cone = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
        new THREE.MeshBasicMaterial({ color: 0x14141f }),
      );
      cone.rotation.x = Math.PI / 2; // dome faces +Z (toward the viewer)
      cone.position.set(sx, cy, -1.45);
      scene.add(cone);
      cones.push(cone);
    }
    subs.push({ cones, glow: glowMat });
  }

  // ── The figure ──
  const figMat = buildFigureMaterial();
  const waveMat = buildWaveMaterial(); // shared antenna-waveform material
  const rig = buildFigureRig(figMat, waveMat);
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

    // ═══════ HIP-HOP / STREET (19-28) ═══════
    // 19 · Bounce rock — two-beat lean rock, fists riding low.
    (s) => { const a = s % 4 < 2 ? 1 : -1; return {
      hipsRz: a * 0.16, torsoRz: -a * 0.12, torsoRy: a * 0.18, rootX: a * 0.08,
      shLz: 0.5, shRz: -0.5, fALz: 1.0, fARz: -1.0, headRy: a * 0.2, rootY: -0.07, kneeLx: 0.35, kneeRx: 0.35,
    }; },
    // 20 · Shoulder bounce — dipping shoulders alternately, arms loose.
    (s) => { const a = s % 2 ? 1 : -1; return {
      torsoRz: a * 0.14, hipsRz: -a * 0.06, shLz: 0.4 + (a > 0 ? 0.25 : 0), shRz: -0.4 - (a < 0 ? 0.25 : 0),
      fALz: 0.35, fARz: -0.35, headRy: a * 0.1, rootY: -0.05 + (s % 2 ? -0.03 : 0), kneeLx: 0.28, kneeRx: 0.28,
    }; },
    // 21 · Swag cross — forearms crossed in FRONT of the chest (x brings
    // them forward off the torso plane, so no clipping), head cocked.
    (s) => { const a = s % 4 < 2 ? 1 : -1; return {
      shLz: 0.85, shRz: -0.85, shLx: -0.55, shRx: -0.55, fALx: -0.9, fARx: -0.9, fALz: -0.28, fARz: 0.28,
      headRy: a * 0.28, headRx: 0.08, torsoRz: a * 0.08, rootY: -0.06, kneeLx: 0.3, kneeRx: 0.3, hipsRz: a * 0.1,
    }; },
    // 22 · Chest pop — sharp rib-cage pops on every beat.
    (s) => { const a = s % 2 ? 1 : -1; return {
      torsoRx: a > 0 ? -0.22 : 0.16, headRx: a > 0 ? 0.1 : -0.06, rootY: a > 0 ? -0.02 : -0.09,
      shLz: 0.7, shRz: -0.7, fALz: 0.7, fARz: -0.7, shLx: a > 0 ? 0.2 : -0.15, shRx: a > 0 ? 0.2 : -0.15, kneeLx: 0.25, kneeRx: 0.25,
    }; },
    // 23 · Arm wave chain — the raise travels from one arm to the other.
    (s) => { const q = s % 4; return {
      shLz: q === 0 ? 1.6 : q === 1 ? 0.9 : 0.35, fALz: q === 0 ? 0.2 : 0.8,
      shRz: q === 2 ? -1.6 : q === 3 ? -0.9 : -0.35, fARz: q === 2 ? -0.2 : -0.8,
      torsoRz: q < 2 ? 0.1 : -0.1, headRy: q < 2 ? 0.2 : -0.2, rootY: -0.04, kneeLx: 0.2, kneeRx: 0.2,
    }; },
    // 24 · Toprock — b-boy standing cross-steps, arms opening wide.
    (s) => { const a = s % 2 ? 1 : -1; return {
      legLx: a > 0 ? -0.55 : 0.1, kneeLx: a > 0 ? 0.35 : 0.2, legRx: a < 0 ? -0.55 : 0.1, kneeRx: a < 0 ? 0.35 : 0.2,
      shLz: a > 0 ? 1.5 : 0.5, shRz: a < 0 ? -1.5 : -0.5, fALz: 0.3, fARz: -0.3,
      torsoRy: a * 0.22, rootY: -0.08, hipsRz: a * 0.08, headRy: a * 0.15,
    }; },
    // 25 · Low freeze — deep crouch, one hand planted low, one flung high.
    (s): Pose => s % 4 < 2
      ? { rootY: -0.28, kneeLx: 1.3, kneeRx: 1.3, legLx: -0.5, legRx: -0.6, torsoRz: 0.22, torsoRx: 0.18,
          shLz: 0.15, shLx: 0.35, fALz: 0.1, shRz: -2.5, fARz: -0.1, headRy: -0.3, hipsRz: 0.12 }
      : { rootY: -0.05, kneeLx: 0.25, kneeRx: 0.25, shLz: 0.55, shRz: -0.55, fALz: 0.5, fARz: -0.5 },
    // 26 · Krump — aggressive chest hits and arm slams.
    (s) => { const a = s % 2 ? 1 : -1; return {
      torsoRx: a > 0 ? 0.2 : -0.1, rootY: a > 0 ? -0.12 : -0.04,
      shLx: a > 0 ? -1.0 : 0.2, fALx: a > 0 ? -1.1 : 0, fALz: a > 0 ? -0.2 : 0.9,
      shRz: a < 0 ? -1.7 : -0.5, fARz: a < 0 ? -0.15 : -0.9,
      legLx: a > 0 ? -0.35 : 0, kneeLx: a > 0 ? 0.55 : 0.25, kneeRx: 0.3, headRx: 0.12, torsoRy: a * 0.18,
    }; },
    // 27 · Kick-out lean — quick low kicks with a cocky lean-back.
    (s) => { const a = s % 2 ? 1 : -1; return {
      torsoRx: -0.14, headRx: -0.08,
      legLx: a > 0 ? -0.7 : 0.05, kneeLx: a > 0 ? 0.05 : 0.3, legRx: a < 0 ? -0.7 : 0.05, kneeRx: a < 0 ? 0.05 : 0.3,
      shLz: 0.9, shRz: -0.9, fALz: 0.8, fARz: -0.8, rootY: -0.07, hipsRz: -a * 0.08,
    }; },
    // 28 · Windmill arms — both arms sweep the same big circle together.
    (s) => { const q = s % 4; return {
      shLz: q === 0 ? 2.4 : q === 1 ? 1.5 : q === 2 ? 0.4 : 1.5,
      shRz: q === 0 ? -0.4 : q === 1 ? -1.5 : q === 2 ? -2.4 : -1.5,
      fALz: 0.25, fARz: -0.25, torsoRz: q === 0 ? 0.15 : q === 2 ? -0.15 : 0,
      rootY: -0.05, kneeLx: 0.25, kneeRx: 0.25, headRy: q < 2 ? 0.15 : -0.15,
    }; },

    // ═══════ LATIN (29-36) ═══════
    // 29 · Salsa quarter turns — hips rolling through each turn.
    (s) => ({
      rootRy: (Math.PI / 2) * (s % 4 < 2 ? 0 : 1), hipsRz: (s % 2 ? 1 : -1) * 0.2, torsoRz: (s % 2 ? -1 : 1) * 0.1,
      shLz: 0.8, shRz: -0.8, fALz: 0.9, fARz: -0.9, rootY: -0.05, kneeLx: 0.3, kneeRx: 0.3, headRy: (s % 2 ? 1 : -1) * 0.12,
    }),
    // 30 · Bachata side steps — glide, glide, HIP POP on the fourth.
    (s) => { const q = s % 4; const pop = q === 3; return {
      rootX: q < 2 ? -0.18 : 0.18, hipsRz: pop ? 0.32 : (q % 2 ? 0.12 : -0.12), torsoRz: pop ? -0.18 : 0,
      shLz: 0.6, shRz: -0.6, fALz: 0.85, fARz: -0.85, rootY: pop ? -0.09 : -0.04, kneeLx: 0.25, kneeRx: 0.25, headRy: pop ? 0.2 : 0,
    }; },
    // 31 · Merengue march — quick small marching lifts, hips never stop.
    (s) => { const a = s % 2 ? 1 : -1; return {
      legLx: a > 0 ? -0.3 : 0, kneeLx: a > 0 ? 0.5 : 0.2, legRx: a < 0 ? -0.3 : 0, kneeRx: a < 0 ? 0.5 : 0.2,
      hipsRz: a * 0.24, torsoRz: -a * 0.1, shLz: 0.7, shRz: -0.7, fALz: 1.0, fARz: -1.0, rootY: -0.05,
    }; },
    // 32 · Cumbia back-step — one foot sweeps back, arms swinging free.
    (s) => { const a = s % 2 ? 1 : -1; return {
      legLx: a > 0 ? 0.5 : -0.1, kneeLx: a > 0 ? 0.4 : 0.15, legRx: a < 0 ? 0.5 : -0.1, kneeRx: a < 0 ? 0.4 : 0.15,
      torsoRx: 0.1, hipsRz: a * 0.14, shLx: a * 0.5, shRx: -a * 0.5, fALz: 0.6, fARz: -0.6, rootY: -0.06, headRy: a * 0.1,
    }; },
    // 33 · Samba bounce — rapid knee pulses, arms out low and loose.
    (s) => { const a = s % 2 ? 1 : -1; return {
      rootY: a > 0 ? -0.11 : -0.03, kneeLx: a > 0 ? 0.6 : 0.2, kneeRx: a > 0 ? 0.55 : 0.2,
      hipsRz: a * 0.18, shLz: 1.1, shRz: -1.1, fALz: 0.45, fARz: -0.45, torsoRz: -a * 0.08, headRx: 0.05,
    }; },
    // 34 · Reggaeton dembow — deep grounded hip hits.
    (s) => { const a = s % 2 ? 1 : -1; return {
      rootY: -0.14, kneeLx: 0.7, kneeRx: 0.7, legLx: -0.2, legRx: -0.2,
      hipsRz: a * 0.28, torsoRx: 0.14, torsoRz: -a * 0.12, headRx: 0.1,
      shLz: 0.45, shRz: -0.45, fALz: 0.95, fARz: -0.95, rootX: a * 0.05,
    }; },
    // 35 · Rumba — slow sweeping figure, arms carving graceful arcs.
    (s) => { const q = s % 4; return {
      hipsRz: q < 2 ? 0.22 : -0.22, torsoRz: q < 2 ? -0.14 : 0.14, rootX: q < 2 ? 0.1 : -0.1,
      shLz: q < 2 ? 1.7 : 0.6, fALz: q < 2 ? 0.35 : 0.75, shRz: q < 2 ? -0.6 : -1.7, fARz: q < 2 ? -0.75 : -0.35,
      headRy: q < 2 ? 0.2 : -0.2, rootY: -0.04, kneeLx: 0.2, kneeRx: 0.2,
    }; },
    // 36 · Cha-cha — two quick side hits then a held stretch.
    (s): Pose => { const q = s % 4; return q < 2
      ? { rootX: (q ? 1 : -1) * 0.14, hipsRz: (q ? 1 : -1) * 0.18, kneeLx: 0.35, kneeRx: 0.35, rootY: -0.07, shLz: 0.7, shRz: -0.7, fALz: 0.8, fARz: -0.8 }
      : { rootX: 0, hipsRz: q === 2 ? 0.26 : -0.26, torsoRz: q === 2 ? -0.15 : 0.15, shLz: q === 2 ? 1.9 : 0.5, shRz: q === 2 ? -0.5 : -1.9, fALz: 0.3, fARz: -0.3, rootY: -0.03, headRy: q === 2 ? 0.25 : -0.25 };
    },

    // ═══════ DISCO / FUNK (37-42) ═══════
    // 37 · Double sky points — both hands shoot up, then down to the hips.
    (s) => { const up = s % 2 === 0; return {
      shLz: up ? 2.45 : 0.4, shRz: up ? -2.45 : -0.4, fALz: up ? 0.1 : 1.15, fARz: up ? -0.1 : -1.15,
      rootY: up ? -0.02 : -0.09, torsoRx: up ? -0.08 : 0.08, headRx: up ? -0.2 : 0.05, kneeLx: up ? 0.12 : 0.4, kneeRx: up ? 0.12 : 0.4, hipsRz: (s % 4 < 2 ? 1 : -1) * 0.1,
    }; },
    // 38 · Funky chicken — elbows out, wings flapping on every beat.
    (s) => { const flap = s % 2 === 0; return {
      shLz: 1.3, shRz: -1.3, fALz: flap ? 1.45 : 0.6, fARz: flap ? -1.45 : -0.6,
      rootY: flap ? -0.08 : -0.03, kneeLx: flap ? 0.45 : 0.15, kneeRx: flap ? 0.45 : 0.15,
      headRx: flap ? 0.12 : -0.05, torsoRx: 0.1, hipsRz: (s % 4 < 2 ? 1 : -1) * 0.08,
    }; },
    // 39 · Hustle roll — fists rolling around each other in front.
    (s) => { const q = s % 4; return {
      shLx: -0.7, shRx: -0.7, shLz: 0.5, shRz: -0.5,
      fALx: q < 2 ? -1.2 : -0.5, fARx: q < 2 ? -0.5 : -1.2, fALz: 0.2, fARz: -0.2,
      torsoRy: (q < 2 ? 1 : -1) * 0.12, rootY: -0.05, kneeLx: 0.3, kneeRx: 0.3, hipsRz: (q % 2 ? 1 : -1) * 0.1,
    }; },
    // 40 · Half-spin point — spin halfway, land in a full point.
    (s): Pose => { const q = s % 4; return q < 2
      ? { rootRy: Math.PI * (q === 1 ? 1 : 0.4), shLz: 1.2, shRz: -1.2, kneeLx: 0.3, kneeRx: 0.3, rootY: -0.05 }
      : { rootRy: q === 2 ? Math.PI * 1.6 : Math.PI * 2, shRz: -2.3, shRx: -0.3, fARz: -0.1, shLz: 0.4, fALz: 1.1, headRy: -0.25, rootY: -0.04, kneeLx: 0.2, kneeRx: 0.3, hipsRz: 0.12 };
    },
    // 41 · Hip bump — side hip smashes with the opposite arm flung up.
    (s) => { const a = s % 2 ? 1 : -1; return {
      hipsRz: a * 0.3, rootX: a * 0.12, torsoRz: -a * 0.18,
      shLz: a > 0 ? 2.1 : 0.5, fALz: a > 0 ? 0.2 : 0.9, shRz: a < 0 ? -2.1 : -0.5, fARz: a < 0 ? -0.2 : -0.9,
      rootY: -0.06, kneeLx: 0.3, kneeRx: 0.3, headRy: -a * 0.15,
    }; },
    // 42 · Strut — walking in place with big arm swings and a head nod.
    (s) => { const a = s % 2 ? 1 : -1; return {
      legLx: a > 0 ? -0.4 : 0.1, kneeLx: a > 0 ? 0.6 : 0.15, legRx: a < 0 ? -0.4 : 0.1, kneeRx: a < 0 ? 0.6 : 0.15,
      shLx: a * 0.6, shRx: -a * 0.6, fALz: 0.5, fARz: -0.5, headRx: a > 0 ? 0.1 : -0.05,
      torsoRx: -0.06, rootY: -0.05, hipsRz: a * 0.06,
    }; },

    // ═══════ ELECTRONIC / RAVE (43-50) ═══════
    // 43 · Shuffle T-step — fast feet, arms riding low and tight.
    (s) => { const a = s % 2 ? 1 : -1; return {
      legLx: a > 0 ? -0.45 : 0.2, kneeLx: a > 0 ? 0.7 : 0.05, legRx: a < 0 ? -0.45 : 0.2, kneeRx: a < 0 ? 0.7 : 0.05,
      legLz: a > 0 ? 0.12 : 0, legRz: a < 0 ? -0.12 : 0,
      rootY: -0.08, shLz: 0.45, shRz: -0.45, fALz: 0.9, fARz: -0.9, torsoRx: 0.08, hipsRz: a * 0.1,
    }; },
    // 44 · Big fish — cast both arms wide, then reel them in.
    (s): Pose => s % 4 < 2
      ? { shLz: 1.6, shRz: -1.6, fALz: 0.15, fARz: -0.15, torsoRx: -0.08, rootY: -0.03, kneeLx: 0.2, kneeRx: 0.2, headRx: -0.1 }
      : { shLz: 0.7, shRz: -0.7, fALz: 1.35, fARz: -1.35, shLx: -0.4, shRx: -0.4, torsoRx: 0.12, rootY: -0.08, kneeLx: 0.4, kneeRx: 0.4, headRx: 0.08 },
    // 45 · Sky punches — alternating fists hammering the air upward.
    (s) => { const a = s % 2 ? 1 : -1; return {
      shLz: a > 0 ? 2.5 : 0.6, fALz: a > 0 ? 0.05 : 1.1, shRz: a < 0 ? -2.5 : -0.6, fARz: a < 0 ? -0.05 : -1.1,
      rootY: a > 0 ? -0.02 : -0.08, kneeLx: 0.3, kneeRx: 0.3, torsoRz: a * 0.1, headRx: -0.12, hipsRz: -a * 0.08,
    }; },
    // 46 · Hardstyle kicks — high snap kicks with a hop.
    (s) => { const a = s % 2 ? 1 : -1; return {
      legLx: a > 0 ? -1.0 : 0.15, kneeLx: a > 0 ? 0.1 : 0.4, legRx: a < 0 ? -1.0 : 0.15, kneeRx: a < 0 ? 0.1 : 0.4,
      rootY: a > 0 ? 0.04 : -0.08, shLz: 0.8, shRz: -0.8, fALz: 0.9, fARz: -0.9, torsoRx: -0.06,
    }; },
    // 47 · Gloving — hands weaving small circles in front of the face.
    (s) => { const q = s % 4; return {
      shLz: 1.5, shRz: -1.5, shLx: -0.5, shRx: -0.5,
      fALx: q % 2 ? -1.15 : -0.75, fARx: q % 2 ? -0.75 : -1.15, fALz: q < 2 ? -0.15 : 0.25, fARz: q < 2 ? -0.25 : 0.15,
      headRx: -0.06, rootY: -0.04, kneeLx: 0.2, kneeRx: 0.2, torsoRy: (q < 2 ? 1 : -1) * 0.08,
    }; },
    // 48 · Pogo — straight vertical jumps, arms snapping up on the fourth.
    (s): Pose => { const q = s % 4; return q === 3
      ? { rootY: 0.12, shLz: 2.4, shRz: -2.4, kneeLx: 0.5, kneeRx: 0.5, headRx: -0.15 }
      : { rootY: q % 2 ? -0.1 : 0.02, shLz: 0.4, shRz: -0.4, fALz: 0.8, fARz: -0.8, kneeLx: q % 2 ? 0.5 : 0.15, kneeRx: q % 2 ? 0.5 : 0.15 };
    },
    // 49 · Headbang — full head-and-torso dips into a low stance.
    (s) => { const dn = s % 2 === 0; return {
      headRx: dn ? 0.45 : -0.25, torsoRx: dn ? 0.3 : -0.08, rootY: dn ? -0.12 : -0.03,
      kneeLx: dn ? 0.6 : 0.2, kneeRx: dn ? 0.6 : 0.2, shLz: 0.7, shRz: -0.7, fALz: 0.9, fARz: -0.9, legLx: -0.15, legRx: -0.15,
    }; },
    // 50 · Rave sway — both arms high, waving in opposite phases.
    (s) => { const a = s % 2 ? 1 : -1; return {
      shLz: 2.3 + a * 0.2, shRz: -2.3 + a * 0.2, fALz: a * 0.4, fARz: a * 0.4,
      torsoRz: a * 0.12, hipsRz: -a * 0.1, rootY: -0.04, kneeLx: 0.25, kneeRx: 0.25, headRy: a * 0.12, headRx: -0.1,
    }; },

    // ═══════ POP / CLASSICS (51-58) ═══════
    // 51 · Moonwalk illusion — leaning glide, stiff legs alternating.
    (s) => { const a = s % 2 ? 1 : -1; return {
      rootX: -0.1 * (s % BEATS_PER_PATTERN) / 2 + 0.2, torsoRx: 0.16, headRx: -0.12,
      legLx: a > 0 ? 0.35 : -0.15, kneeLx: a > 0 ? 0.05 : 0.35, legRx: a < 0 ? 0.35 : -0.15, kneeRx: a < 0 ? 0.05 : 0.35,
      shLx: a * 0.35, shRx: -a * 0.35, fALz: 0.3, fARz: -0.3, rootY: -0.06,
    }; },
    // 52 · Thriller claws — clawed hands stalking side to side.
    (s) => { const a = s % 4 < 2 ? 1 : -1; return {
      shLz: 1.35, shRz: -1.35, shLx: -0.55, shRx: -0.55, fALx: -0.85, fARx: -0.85, fALz: 0.3, fARz: -0.3,
      torsoRz: a * 0.16, rootX: a * 0.14, headRy: a * 0.3, headRx: 0.1, rootY: -0.07, kneeLx: 0.35, kneeRx: 0.35, hipsRz: -a * 0.1,
    }; },
    // 53 · Vogue frames — sharp hand frames around the face, snapping.
    (s) => { const q = s % 4; return {
      shLz: q === 0 || q === 3 ? 2.0 : 1.1, shRz: q === 1 || q === 2 ? -2.0 : -1.1,
      fALx: q < 2 ? -1.0 : -0.3, fARx: q >= 2 ? -1.0 : -0.3, fALz: -0.2, fARz: 0.2,
      headRy: (q % 2 ? 1 : -1) * 0.3, headRx: -0.08, torsoRz: (q < 2 ? 1 : -1) * 0.1, rootY: -0.03, kneeLx: 0.15, kneeRx: 0.15,
    }; },
    // 54 · Robot arm sequence — shoulder, then elbow, then snap down.
    (s): Pose => { const q = s % 4; return q === 0
      ? { shLz: 1.55, fALz: 1.2, shRz: -0.3, kneeLx: 0.1, kneeRx: 0.1, headRy: 0.3 }
      : q === 1
      ? { shLz: 1.55, fALz: 0.1, shRz: -0.3, headRy: 0.3, kneeLx: 0.1, kneeRx: 0.1 }
      : q === 2
      ? { shRz: -1.55, fARz: -1.2, shLz: 0.3, headRy: -0.3, kneeLx: 0.1, kneeRx: 0.1 }
      : { shRz: -1.55, fARz: -0.1, shLz: 0.3, headRy: -0.3, kneeLx: 0.1, kneeRx: 0.1 };
    },
    // 55 · Sprinkler — one arm behind the head, the other ratcheting out.
    (s) => { const q = s % 4; return {
      shRz: -1.9, fARx: -1.25, // right hand tucked behind the head
      shLz: 0.5 + q * 0.35, fALz: 0.25, torsoRy: -0.1 - q * 0.08,
      rootY: -0.06, kneeLx: 0.3, kneeRx: 0.3, hipsRz: (q % 2 ? 1 : -1) * 0.1, headRy: 0.2,
    }; },
    // 56 · Lawnmower — grab the cord and YANK, twice per block.
    (s): Pose => { const q = s % 4; return q < 2
      ? { torsoRx: 0.2, rootY: -0.12, shRx: -0.8, fARz: -0.9, shLz: 0.4, kneeLx: 0.5, kneeRx: 0.5, headRx: 0.15 }
      : { torsoRx: -0.1, torsoRy: -0.3, rootY: -0.03, shRx: 0.7, shRz: -0.9, fARz: -0.5, shLz: 0.4, kneeLx: 0.2, kneeRx: 0.2, headRy: -0.25 };
    },
    // 57 · Shopping cart — pushing the cart, plucking off the shelves.
    (s): Pose => { const q = s % 4; return q < 2
      ? { shLx: -0.85, shRx: -0.85, fALz: 0.35, fARz: -0.35, torsoRx: 0.1, rootY: -0.05, kneeLx: 0.3, kneeRx: 0.3, legLx: q ? -0.3 : 0 }
      : { shLx: -0.85, fALz: 0.35, shRz: q === 2 ? -1.9 : -0.6, fARz: q === 2 ? -0.2 : -1.2, torsoRy: -0.2, headRy: -0.25, rootY: -0.04, kneeLx: 0.2, kneeRx: 0.2 };
    },
    // 58 · The Twist — knees pivoting together, arms counter-swinging.
    (s) => { const a = s % 2 ? 1 : -1; return {
      rootRy: a * 0.35, hipsRz: a * 0.14, torsoRy: -a * 0.3,
      shLx: a * 0.55, shRx: a * 0.55, fALz: 0.85, fARz: -0.85,
      rootY: s % 4 < 2 ? -0.04 : -0.12, kneeLx: s % 4 < 2 ? 0.2 : 0.55, kneeRx: s % 4 < 2 ? 0.2 : 0.55,
    }; },

    // ═══════ BALLROOM / WORLD (59-68) ═══════
    // 59 · Waltz sway — grand three-count sways with a rise.
    (s): Pose => { const q = s % 4; return q === 3
      ? { rootY: 0.02, shLz: 1.6, shRz: -1.6, fALz: 0.3, fARz: -0.3, torsoRx: -0.06, headRx: -0.1 }
      : { rootX: (q === 0 ? -1 : q === 1 ? 1 : 0) * 0.16, torsoRz: (q === 0 ? 1 : q === 1 ? -1 : 0) * 0.14, hipsRz: (q === 0 ? -1 : q === 1 ? 1 : 0) * 0.1,
          shLz: 1.3, shRz: -1.3, fALz: 0.5, fARz: -0.5, rootY: -0.05, kneeLx: 0.2, kneeRx: 0.2 };
    },
    // 60 · Tango — sharp lunge, frame arms, head SNAP.
    (s): Pose => s % 4 < 2
      ? { legLx: -0.65, kneeLx: 0.75, legRx: 0.2, kneeRx: 0.1, torsoRy: 0.3, headRy: 0.45,
          shLz: 1.4, fALz: 0.4, shRz: -0.9, fARz: -1.1, shRx: -0.5, rootY: -0.1, hipsRz: 0.1 }
      : { legRx: -0.65, kneeRx: 0.75, legLx: 0.2, kneeLx: 0.1, torsoRy: -0.3, headRy: -0.45,
          shRz: -1.4, fARz: -0.4, shLz: 0.9, fALz: 1.1, shLx: -0.5, rootY: -0.1, hipsRz: -0.1 },
    // 61 · Flamenco — arms carving high curves, a proud stomp on the beat.
    (s) => { const a = s % 2 ? 1 : -1; return {
      shLz: a > 0 ? 2.35 : 1.2, fALz: a > 0 ? -0.35 : 0.5, shRz: a < 0 ? -2.35 : -1.2, fARz: a < 0 ? 0.35 : -0.5,
      torsoRz: a * 0.12, headRx: -0.15, headRy: a * 0.2, hipsRz: -a * 0.08,
      legLx: a > 0 ? -0.3 : 0, kneeLx: a > 0 ? 0.45 : 0.15, kneeRx: 0.15, rootY: -0.05,
    }; },
    // 62 · Bollywood bulbs — wrists screwing lightbulbs overhead.
    (s) => { const q = s % 4; return {
      shLz: 2.1, shRz: -2.1, fALz: q % 2 ? -0.45 : 0.15, fARz: q % 2 ? 0.45 : -0.15,
      hipsRz: (q < 2 ? 1 : -1) * 0.22, torsoRz: (q < 2 ? -1 : 1) * 0.12, headRy: (q < 2 ? 1 : -1) * 0.25,
      rootY: -0.06, kneeLx: 0.35, kneeRx: 0.35, rootX: (q < 2 ? 1 : -1) * 0.08,
    }; },
    // 63 · Dabke — line-dance stomps with linked-arm posture.
    (s) => { const a = s % 2 ? 1 : -1; return {
      shLz: 0.35, shRz: -0.35, fALz: 0.2, fARz: -0.2, torsoRz: a * 0.08,
      legLx: a > 0 ? -0.75 : 0.05, kneeLx: a > 0 ? 0.35 : 0.2, legRx: a < 0 ? -0.75 : 0.05, kneeRx: a < 0 ? 0.35 : 0.2,
      rootY: a > 0 ? -0.03 : -0.1, rootX: a * 0.1, headRy: a * 0.1, hipsRz: a * 0.1,
    }; },
    // 64 · Hora bounce — festive circle-dance spring, arms lifted wide.
    (s) => { const a = s % 2 ? 1 : -1; return {
      rootY: a > 0 ? 0.0 : -0.1, kneeLx: a > 0 ? 0.2 : 0.5, kneeRx: a > 0 ? 0.2 : 0.5,
      shLz: 1.75, shRz: -1.75, fALz: 0.25, fARz: -0.25, rootX: a * 0.14,
      torsoRz: a * 0.08, headRx: -0.08, hipsRz: -a * 0.06, legLx: a > 0 ? -0.25 : 0, legRx: a < 0 ? -0.25 : 0,
    }; },
    // 65 · Cossack squat kicks — impossibly low, legs firing forward.
    (s) => { const a = s % 2 ? 1 : -1; return {
      rootY: -0.3, torsoRx: 0.12,
      legLx: a > 0 ? -0.95 : -0.35, kneeLx: a > 0 ? 0.05 : 1.35, legRx: a < 0 ? -0.95 : -0.35, kneeRx: a < 0 ? 0.05 : 1.35,
      shLx: -0.6, shRx: -0.6, fALz: -0.25, fARz: 0.25, headRx: -0.05,
    }; },
    // 66 · Grounded pulse — wide stance, deep earth-driven knee drives.
    (s) => { const dn = s % 2 === 0; return {
      legLz: 0.22, legRz: -0.22, rootY: dn ? -0.16 : -0.06, kneeLx: dn ? 0.8 : 0.35, kneeRx: dn ? 0.8 : 0.35,
      torsoRx: dn ? 0.18 : 0.05, shLz: 0.7, shRz: -0.7, fALz: dn ? 1.2 : 0.5, fARz: dn ? -1.2 : -0.5, headRx: dn ? 0.12 : 0,
    }; },
    // 67 · Haka — wide power stance, alternating chest slaps, fierce.
    (s) => { const a = s % 2 ? 1 : -1; return {
      legLz: 0.25, legRz: -0.25, rootY: -0.14, kneeLx: 0.65, kneeRx: 0.65, torsoRx: 0.16, headRx: 0.14,
      shLx: a > 0 ? -0.95 : 0.1, fALx: a > 0 ? -1.05 : 0, fALz: a > 0 ? -0.2 : 0.6,
      shRx: a < 0 ? -0.95 : 0.1, fARx: a < 0 ? -1.05 : 0, fARz: a < 0 ? 0.2 : -0.6,
      torsoRy: a * 0.12,
    }; },
    // 68 · Capoeira ginga — rocking guard lunges, one arm shielding.
    (s) => { const a = s % 2 ? 1 : -1; return {
      legLx: a > 0 ? -0.5 : 0.4, kneeLx: a > 0 ? 0.7 : 0.2, legRx: a < 0 ? -0.5 : 0.4, kneeRx: a < 0 ? 0.7 : 0.2,
      rootY: -0.12, rootX: a * 0.14, torsoRy: a * 0.35, torsoRx: 0.1,
      shLz: a > 0 ? 0.4 : 1.0, shLx: a > 0 ? -0.9 : 0.2, fALx: a > 0 ? -1.0 : 0,
      shRz: a < 0 ? -0.4 : -1.0, shRx: a < 0 ? -0.9 : 0.2, fARx: a < 0 ? -1.0 : 0,
      headRy: a * 0.25, hipsRz: a * 0.1,
    }; },
  ];
  // ── Style pools — the move set follows the track's energy: fast tracks
  // pull from the aggressive hip-hop/rave/percussive set, mid tempo from
  // groove/disco/pop, slow tempo from latin/ballroom/smooth. Indexes into
  // the 68-move library above.
  // (0-based array indexes — the // N labels in the move comments are 1-based)
  const POOL_FAST = [2, 8, 12, 16, 5, 15, 23, 25, 26, 30, 32, 35, 42, 44, 45, 47, 48, 57, 62, 65, 66];
  const POOL_MID = [0, 3, 9, 10, 14, 17, 6, 18, 19, 20, 21, 22, 27, 36, 37, 40, 41, 43, 49, 51, 52, 53, 54, 55, 56, 61, 63, 67];
  const POOL_SLOW = [1, 4, 7, 11, 13, 10, 24, 28, 29, 31, 33, 34, 38, 39, 46, 50, 58, 59, 60, 64];
  const poolForTempo = () => (tempoMs < 460 ? POOL_FAST : tempoMs <= 580 ? POOL_MID : POOL_SLOW);
  let currentMoveIdx = 0;

  // Bass-drop accents — high-impact poses held for two beats when the live
  // mic detector registers a heavy low-frequency hit.
  const ACCENTS: Pose[] = [
    { rootY: -0.26, kneeLx: 1.3, kneeRx: 1.3, legLx: -0.55, legRx: -0.55, shLz: 2.6, shRz: -2.6, torsoRx: 0.2, headRx: -0.2 },
    { rootY: -0.12, legRx: -0.7, kneeRx: 0.2, shRz: -2.3, shRx: -0.4, torsoRz: -0.18, headRy: -0.3, shLz: 0.3, fALz: 1.2 },
    { rootY: 0.05, shLz: 2.4, shRz: -2.4, fALz: -0.4, fARz: 0.4, kneeLx: 0.1, kneeRx: 0.1, torsoRx: -0.12, headRx: -0.25 },
  ];
  let accentHold = 0;
  let liveMode = false, lastLiveTick = 0;

  // ── Theme system — one place tints the figure shader + every additive
  // accent material (eyes, antenna tips, chest cores, joint dots, crowd
  // eyes), including materials created lazily later (backups, crowd). ──
  let currentTheme = AVATAR_THEMES[0];
  const accentMats: THREE.MeshBasicMaterial[] = [];
  function tintAccent(m: THREE.MeshBasicMaterial) { m.color.setRGB(currentTheme.eye[0], currentTheme.eye[1], currentTheme.eye[2]); }
  function registerAccents(mats: THREE.MeshBasicMaterial[]) { for (const m of mats) { accentMats.push(m); tintAccent(m); } }
  function applyTheme(idx: number) {
    currentTheme = AVATAR_THEMES[Math.max(0, Math.min(AVATAR_THEMES.length - 1, Math.round(idx)))] || AVATAR_THEMES[0];
    (figMat.uniforms.uColA.value as THREE.Vector3).set(...currentTheme.a);
    (figMat.uniforms.uColB.value as THREE.Vector3).set(...currentTheme.b);
    (figMat.uniforms.uColC.value as THREE.Vector3).set(...currentTheme.c);
    figMat.uniforms.uRainbow.value = currentTheme.rainbow ? 1 : 0;
    (waveMat.uniforms.uCol.value as THREE.Vector3).set(...currentTheme.eye);
    for (const m of accentMats) tintAccent(m);
  }
  registerAccents(rig.accents);

  // Soft contact shadow under each lead dancer — grounds the figure to the
  // floor (jumps visibly lift off it), a big "actually standing there" cue.
  const shadowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(64, 64, 6, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,0.85)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const dancerShadows: THREE.Mesh[] = [];
  function mkShadow(bx: number, bz: number) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.42), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.34, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(bx, -0.045, bz + 0.05);
    scene.add(m);
    dancerShadows.push(m);
    return m;
  }
  mkShadow(0, 0);

  // Lead dancer + lazily-built party backups (hidden until party mode 1+).
  const dancers: Dancer[] = [mkDancer(rig, 0, 0, 0, 0)];
  let partyMode = 0; // 0 solo · 1 crew of 3 · 2 BIG PARTY (crowd + DJ)
  function ensureBackups() {
    if (dancers.length > 1) return;
    const spots: [number, number, number][] = [[-1.0, -0.5, 1], [1.0, -0.5, 2]]; // x, z, beat offset
    for (const [bx, bz, off] of spots) {
      const r = buildFigureRig(figMat, waveMat);
      r.group.position.set(bx, -0.05, bz);
      r.group.scale.setScalar(0.8);
      r.group.visible = false;
      scene.add(r.group);
      dancers.push(mkDancer(r, off, bx, bz, off * 2.1));
      registerAccents(r.accents);
      mkShadow(bx, bz).visible = false;
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
    registerAccents([eyeMatI]); // crowd eyes follow the avatar color theme
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

  // One beat of the show: pulse the lights, ripple the floor under the
  // lead's alternating feet, and drive the choreography step chart.
  function fireBeat(now2: number) {
    lastBeat = now2;
    beatPulse = Math.max(beatPulse, 1);
    beatCount++;
    for (const f of fins) f.target = 0.35 + Math.random() * 0.65;
    // Footstep ripple — spawns under the lead dancer's alternating foot,
    // not the stage center, so the floor visibly reacts to the footwork.
    const r = rings[ringCursor];
    ringCursor = (ringCursor + 1) % RING_COUNT;
    r.age = 0;
    const lead = dancers[0];
    r.mesh.position.x = lead.baseX + lead.cur.rootX + (beatCount % 2 ? 0.13 : -0.13);
    if (accentHold > 0) { accentHold--; return; } // holding a bass-drop pose
    const step = beatCount % BEATS_PER_PATTERN;
    if (step === 0) {
      // Wrap any accumulated full turn so the next move starts facing
      // front instead of spring-unwinding backwards through 360°.
      for (const d of dancers) {
        const wrap = Math.round(d.cur.rootRy / (Math.PI * 2)) * Math.PI * 2;
        d.cur.rootRy -= wrap; d.tgt.rootRy -= wrap;
      }
      const pool = poolForTempo();
      let mi = pool[Math.floor(Math.random() * pool.length)];
      if (mi === currentMoveIdx && pool.length > 1) mi = pool[(pool.indexOf(mi) + 1) % pool.length];
      currentMoveIdx = mi;
    }
    const moveFn = MOVES[currentMoveIdx];
    // Every 4th move block the crew snaps into PERFECT unison (offset 0
    // for everyone) — the classic "drop" moment; the other blocks keep
    // the offset wave so the routine breathes between the two.
    const unison = Math.floor(beatCount / BEATS_PER_PATTERN) % 4 === 3;
    for (const d of activeDancers()) setPoseFor(d, moveFn((step + (unison ? 0 : d.stepOffset)) % BEATS_PER_PATTERN));
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

    // Beat sources, in priority order:
    // 1. LIVE — real onsets detected from the microphone (the room's actual
    //    Spotify audio) via liveBeatTick(); overrides the internal clock and
    //    falls back automatically if the mic goes quiet for a while.
    // 2. Internal — a pulse every tempoMs (derived from the song's real LRC
    //    line timing, or from the live BPM estimate when the mic runs).
    if (playing) {
      if (liveMode) {
        if (now - lastLiveTick > 2500) liveMode = false; // mic went quiet → internal clock resumes
      } else if (now - lastBeat > tempoMs) {
        fireBeat(now);
      }
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
    waveMat.uniforms.uTime.value = t;
    waveMat.uniforms.uEnergy.value = energy;
    waveMat.uniforms.uPulse.value = beatPulse * energy;
    (floorMat as THREE.MeshBasicMaterial).opacity = 0.25 + beatPulse * energy * 0.3;

    for (const f of fins) {
      f.val += (f.target * energy - f.val) * 0.15;
      f.mat.opacity = 0.15 + f.val * 0.65;
      f.mesh.scale.y = 0.8 + f.val * 1.8;
    }

    // Spotlights sweep continuously and strobe hard on the beat.
    for (const sp of spots) {
      sp.mesh.rotation.z = Math.sin(t * 0.65 + sp.phase) * 0.38;
      sp.mesh.rotation.x = Math.sin(t * 0.42 + sp.phase * 2) * 0.2;
      sp.mat.opacity = (0.035 + beatPulse * 0.15) * energy;
      const c = sp.colIdx === 0 ? currentTheme.c : currentTheme.b;
      sp.mat.color.setRGB(c[0], c[1], c[2]);
    }

    // Wet floor + subwoofer cones react to the theme + bass.
    floorReflMat.uniforms.uTime.value = t;
    floorReflMat.uniforms.uPulse.value = beatPulse * energy;
    (floorReflMat.uniforms.uCol.value as THREE.Vector3).set(currentTheme.b[0], currentTheme.b[1], currentTheme.b[2]);
    const punch = 1 + beatPulse * energy * 0.7; // cones jump forward on the beat
    for (const sub of subs) {
      for (const cone of sub.cones) cone.scale.z = punch;
      sub.glow.opacity = 0.2 + beatPulse * energy * 0.6;
      sub.glow.color.setRGB(currentTheme.c[0], currentTheme.c[1], currentTheme.c[2]);
    }

    // Apply spring pose + a continuous micro-groove layer (breathing sway,
    // beat throb in the knees/root) so the body never fully freezes even
    // during held poses. Runs per active dancer, with a per-dancer phase on
    // the micro-motion so the crew doesn't breathe in eerie unison.
    const bounceCycle = ((now - lastBeat) / tempoMs);
    const bounce = Math.max(0, Math.sin(Math.PI * Math.min(1, bounceCycle * 1.4))) * energy;
    // Theme accents (eyes/cores/joints) breathe with the beat.
    for (const m of accentMats) m.opacity = 0.72 + beatPulse * 0.28;
    const actD = activeDancers();
    for (let di = 0; di < actD.length; di++) {
      const d = actD[di];
      const S = d.cur;
      const dg = d.rig;
      const tp = t + d.microPhase;
      // contact shadow tracks the dancer, fading/shrinking as they leave
      // the floor (jump) and darkening in a crouch
      const sh = dancerShadows[di];
      if (sh) {
        sh.position.x = d.baseX + S.rootX;
        const lift = Math.max(0, S.rootY);
        const shScale = Math.max(0.55, 1 - lift * 1.6);
        sh.scale.set(shScale, shScale, 1);
        (sh.material as THREE.MeshBasicMaterial).opacity = Math.max(0.08, (0.34 - lift * 0.7 - S.rootY * 0.15)) * (0.5 + energy * 0.5);
      }
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
      for (let i = 1; i < dancers.length; i++) {
        dancers[i].rig.group.visible = partyMode >= 1;
        if (dancerShadows[i]) dancerShadows[i].visible = partyMode >= 1;
      }
      if (partyMode === 2) ensureCrowd();
      setCrowdVisible(partyMode === 2);
    },
    setTheme(idx: number) { applyTheme(idx); },
    liveBeatTick() {
      const n = performance.now();
      lastLiveTick = n; liveMode = true;
      if (n - lastBeat < 200) return; // debounce double-onsets
      fireBeat(n);
    },
    bassDrop() {
      accentHold = 2;
      beatPulse = Math.max(beatPulse, 1.35);
      const pose = ACCENTS[Math.floor(Math.random() * ACCENTS.length)];
      for (const d of activeDancers()) setPoseFor(d, pose);
      for (const r of rings) r.age = 0; // triple shockwave
    },
    setLiveBeat(on: boolean) { liveMode = !!on; if (!on) lastLiveTick = 0; },
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
