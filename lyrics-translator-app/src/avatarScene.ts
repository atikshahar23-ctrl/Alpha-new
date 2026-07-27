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
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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
  // Avatar size — camera-distance zoom (1 = default, >1 = bigger avatars).
  setZoom?(z: number): void;
  // Neon circuitry vein glow strength (0 = off, 1 = default, up to 2).
  setVeinIntensity?(v: number): void;
  // Choreography step rate vs. the song's real tempo (0.4-2.5x).
  setDanceSpeed?(mult: number): void;
  // Flip the whole stage horizontally.
  setMirror?(on: boolean): void;
  // Non-stadium camera behavior: 0 cinematic sway · 1 static · 2 handheld.
  setCameraStyle?(mode: number): void;
  // Bass-drop camera-shake strength multiplier (0-3).
  setShakeIntensity?(v: number): void;
  setConfettiIntensity?(v: number): void;
  setSparkIntensity?(v: number): void;
  setHazeIntensity?(v: number): void;
  setBeamIntensity?(v: number): void;
  setFinIntensity?(v: number): void;
  // Stadium crowd point cap (e.g. 20000/50000/80000); -1 = no user cap
  // (device auto-quality still applies).
  setStadiumDensity?(n: number): void;
  // Stadium camera: 0 drone orbit · 1 fixed wide · 2 stage-cam close.
  setStadiumCameraStyle?(mode: number): void;
  // Vibe / atmosphere: 0 auto (from tempo) · 1 party (energetic) · 2 chill
  // (lounge/flowing) · 3 shanti (deep ambient/meditative). Eases the whole
  // show — springs, haze, sweep speed, energy ceiling, and move pool — toward
  // calm, so slow/atmospheric songs read as calm instead of frantic.
  setVibe?(mode: number): void;
  // Avatar style — which character dances lead. 0 = the procedural neon
  // alien; 1-3 load the simulator's own rigged GLB agents (casual male /
  // legendary robot / Sophia) and drive their skeletons directly from the
  // same pose-spring choreography engine (all moves + lyric sync carry over).
  setAvatarStyle?(style: number): void;
  // Wedding mode — bride & groom center stage dancing couple choreography
  // (embrace, twirl, dip, promenade), the crew circling them with the hora,
  // a flower chuppah, floating hearts, rose petals, and a warm gold light
  // grade. Built for DJs projecting the show at real weddings. Works in
  // every party mode (solo couple → crew hora → big party → stadium).
  setWedding?(on: boolean): void;
  // Backup dancers shown in crew/BIG PARTY modes (0-6).
  setCrewSize?(n: number): void;
  // Renderer tone-mapping exposure — overall scene brightness (0.3-2).
  setExposure?(v: number): void;
  // LIVE beat engine — real onsets detected from the microphone (the room's
  // actual Spotify audio). liveBeatTick() fires the show's beat exactly on
  // a detected onset (overrides the internal clock until the mic goes
  // quiet); bassDrop() slams a two-beat high-impact accent pose + triple
  // floor shockwave; setLiveBeat(false) hands control back to the clock.
  liveBeatTick?(): void;
  bassDrop?(): void;
  setLiveBeat?(on: boolean): void;
  // A real sung lyric line just started (from the LRC line timestamps) — the
  // tightest musical-sync signal available. Re-anchors the beat grid to the
  // vocal and turns the choreography over on the word, so the dance reads as
  // perfectly synced to the song rather than running on a free clock.
  syncLine?(): void;
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
      uVeinIntensity: { value: 1 },
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
      uniform float uVeinIntensity;
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
        // ── Studio lighting rig (the "expensive figure" read) ──────────────
        // A real photo-studio setup faked in-shader: key light + cool kicker
        // + soft top fill, each with its own specular lobe; a horizontal
        // softbox reflection band riding the reflection vector (what makes
        // glossy product shots look expensive); and a tight clearcoat ping.
        vec3 lightDir = normalize(vec3(-0.35, 0.9, 0.55));   // warm key, up-left-front
        vec3 h = normalize(lightDir + v);
        float ndh = clamp(dot(n, h), 0.0, 1.0);
        float spec = pow(ndh, 42.0) * 0.5;
        float coat = pow(ndh, 240.0) * 0.55;                  // clearcoat ping on top of the key
        vec3 kickDir = normalize(vec3(0.7, 0.25, -0.55));     // cool kicker from back-right
        float kick = pow(clamp(dot(n, normalize(kickDir + v)), 0.0, 1.0), 34.0) * 0.32;
        vec3 topDir = normalize(vec3(0.05, 1.0, 0.1));        // soft top fill
        float topFill = pow(clamp(dot(n, normalize(topDir + v)), 0.0, 1.0), 8.0) * 0.06;
        // softbox reflection band — a bright horizontal stripe in the
        // reflection vector, like a studio light panel mirrored in gloss
        vec3 refl = reflect(-v, n);
        float box = smoothstep(0.05, 0.3, refl.y) * smoothstep(0.75, 0.35, refl.y);
        vec3 softbox = mix(vec3(0.5, 0.6, 0.8), grad, 0.45) * box * 0.16;
        // faint warm backlight bleed (cheap subsurface read on thin edges)
        float sss = pow(clamp(dot(n, -lightDir), 0.0, 1.0), 2.5) * fresnel * 0.18;
        // vertical tone — legs sit a touch darker, chest/head catch the light
        float tone = mix(0.82, 1.12, smoothstep(0.15, 1.55, vWorldPos.y));
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
        vec3 veinGlow = veinCol * veins * (0.9 + uPulse * 2.6) * uVeinIntensity;

        vec3 lit = fill + (rim + softbox + grad * sss) * tone
                 + vec3(0.85, 0.92, 1.0) * (spec + coat)
                 + vec3(0.55, 0.75, 1.0) * kick
                 + vec3(0.8, 0.85, 1.0) * topFill;
        gl_FragColor = vec4(lit + veinGlow, 1.0);
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
  // Face 2.0 — pupils + catchlights give the glowing eyes a focused gaze
  // instead of a blank sheen, brow ridges catch the rim light for
  // expression, and a mouth glow-line "sings" (driven per-frame from the
  // lyric-line pulse). All face extras live in a counter-scaled group so
  // the head's egg-stretch doesn't distort them.
  const faceGrp = new THREE.Group();
  faceGrp.scale.set(1 / 0.95, 1 / 1.35, 1);
  head.add(faceGrp);
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x05070c });
  const catchMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, depthWrite: false });
  for (const side of [-1, 1]) {
    const pupil = new THREE.Mesh(sph(0.02), pupilMat);
    pupil.scale.set(1.1, 0.75, 0.45);
    pupil.position.set(side * 0.072, 0.02, 0.153);
    faceGrp.add(pupil);
    const catchlight = new THREE.Mesh(sph(0.0065), catchMat);
    catchlight.position.set(side * 0.072 + 0.012, 0.033, 0.163);
    faceGrp.add(catchlight);
    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.0075, 0.05, 3, 6), mat);
    brow.position.set(side * 0.072, 0.078, 0.138);
    brow.rotation.z = side * -0.55 + Math.PI / 2;
    brow.rotation.y = side * 0.25;
    faceGrp.add(brow);
  }
  const mouthMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.75, 0.9), transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false });
  const mouth = new THREE.Mesh(new THREE.CapsuleGeometry(0.01, 0.05, 3, 8), mouthMat);
  mouth.rotation.z = Math.PI / 2;
  mouth.position.set(0, -0.088, 0.143);
  faceGrp.add(mouth);
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
  // Torso 2.0 — a sculpted multi-piece chest instead of one blank capsule:
  // core mass + pec plate + defined abdominal block + a tapering waist +
  // clavicle bridges out to the shoulders. The group pivot keeps the same
  // y=1.1 position/rotation semantics the whole move library was authored
  // against, so all 104 moves read identically — just on a better body.
  const torso = new THREE.Group(); torso.position.y = 1.1; group.add(torso);
  const chestCore = new THREE.Mesh(cap(0.21, 0.44), mat); torso.add(chestCore);
  const pecs = new THREE.Mesh(sph(0.16), mat); pecs.scale.set(1.28, 0.62, 0.66); pecs.position.set(0, 0.13, 0.06); torso.add(pecs);
  const abs = new THREE.Mesh(sph(0.14), mat); abs.scale.set(1.0, 0.8, 0.62); abs.position.set(0, -0.16, 0.055); torso.add(abs);
  const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.13, 0.16, 14), mat); waist.position.y = -0.3; torso.add(waist);
  for (const side of [-1, 1]) {
    const clav = new THREE.Mesh(cap(0.028, 0.16), mat);
    clav.position.set(side * 0.16, 0.245, 0.03);
    clav.rotation.z = side * 1.28;
    torso.add(clav);
  }
  const hips = new THREE.Mesh(sph(0.21), mat); hips.position.y = 0.72; hips.scale.set(1, 0.7, 0.88); group.add(hips);

  // Real hip→knee→ankle chains (previously thigh+shin+foot were flat
  // siblings under one hip pivot, so the whole leg swung rigidly with no
  // knee bend at all — the "bounce" read as a stiff bob, not a squat).
  // kneeL/kneeR bend independently now, so the groove/jump actually
  // compresses and releases like a real dance move.
  // Legs 2.0 — anatomically tapered (thick thigh → knee → calf bulge →
  // slim ankle) with visible knee/hip joint caps, replacing the uniform
  // sausage capsules. Same pivots, same move compatibility.
  const mkLeg = (side: number) => {
    const leg = new THREE.Group(); leg.position.set(side * 0.11, 0.5, 0); group.add(leg);
    const hipCap = new THREE.Mesh(sph(0.1), mat); hipCap.scale.set(1, 0.85, 1); leg.add(hipCap);
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.07, 0.44, 14), mat); thigh.position.y = -0.21; leg.add(thigh);
    const knee = new THREE.Group(); knee.position.set(0, -0.42, 0); leg.add(knee);
    const kneeCap = new THREE.Mesh(sph(0.072), mat); knee.add(kneeCap);
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.045, 0.42, 12), mat); shin.position.y = -0.21; knee.add(shin);
    const calf = new THREE.Mesh(sph(0.06), mat); calf.scale.set(0.95, 1.55, 0.95); calf.position.set(0, -0.13, -0.018); knee.add(calf);
    const ankle = new THREE.Mesh(sph(0.048), mat); ankle.position.y = -0.42; knee.add(ankle);
    const foot = new THREE.Mesh(sph(0.09), mat); foot.position.set(0, -0.44, 0.07); foot.scale.set(1, 0.6, 1.5); knee.add(foot);
    return { leg, knee };
  };
  const { leg: legL, knee: kneeL } = mkLeg(-1);
  const { leg: legR, knee: kneeR } = mkLeg(1);

  // Shoulder pivots sit wide of the torso capsule (r=0.22) so raised arms
  // sweep OUTSIDE the body instead of clipping through it.
  const mkArmSegs = (shoulder: THREE.Group, foreArm: THREE.Group) => {
    const shoulderCap = new THREE.Mesh(sph(0.085), mat); shoulder.add(shoulderCap);
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.052, 0.36, 12), mat); upperArm.position.y = -0.19; shoulder.add(upperArm);
    const elbow = new THREE.Mesh(sph(0.058), mat); foreArm.add(elbow);
    const foreMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.038, 0.32, 12), mat); foreMesh.position.y = -0.17; foreArm.add(foreMesh);
    const wrist = new THREE.Mesh(sph(0.042), mat); wrist.position.y = -0.335; foreArm.add(wrist);
  };
  const shoulderL = new THREE.Group(); shoulderL.position.set(-0.33, 1.34, 0); group.add(shoulderL);
  const foreArmL = new THREE.Group(); foreArmL.position.set(0, -0.4, 0); shoulderL.add(foreArmL);
  mkArmSegs(shoulderL, foreArmL);
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
  const foreArmR = new THREE.Group(); foreArmR.position.set(0, -0.4, 0); shoulderR.add(foreArmR);
  mkArmSegs(shoulderR, foreArmR);
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
  return { group, legL, legR, kneeL, kneeR, shoulderL, shoulderR, foreArmL, foreArmR, torso, head, hips, accents: [eyeMat, antTipMat], mouthMat };
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

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 260); // far reaches the scaled stadium bowl + backdrop
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
  // Base strength resize() scales by resolution; setParty(3) lowers this
  // while the 80,000-dot stadium crowd is up (see there for why).
  let bloomBaseStrength = 0.95;

  function resize() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, true);
    composer.setSize(w, h);
    bloom.setSize(w, h);
    camera.aspect = w / h;
    // Aspect-aware framing: the vertical FOV is fixed, so on tall/narrow
    // viewports (portrait phones, a rotated 34" monitor at 1440×3440) the
    // horizontal frame shrinks until the figure spills past the edges and
    // the bloom blows up into a blurry wall. Push the camera back until
    // the stage's core width (~2.35 units — dancer with arms out + margin)
    // fits horizontally; wide screens keep the classic 4.4 distance.
    const halfFovTan = Math.tan((42 * Math.PI / 180) / 2);
    const fitDist = 2.35 / (2 * halfFovTan * Math.max(0.3, camera.aspect));
    camBase.z = Math.max(4.4, Math.min(9.5, fitDist));
    // UnrealBloom accumulates more mip levels as resolution grows — on a
    // large canvas (fullscreen stage mode on a 34" monitor) the additive
    // stack washes into a white wall. Scale strength down continuously
    // with pixel count: full 0.95 up to ~0.5MP (phone hero card), easing
    // to ~0.3 at 5MP.
    bloom.strength = bloomBaseStrength * Math.max(0.32, Math.min(1, Math.sqrt(500000 / Math.max(1, w * h))));
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

  // ── LED dance-floor grid — a real glowing tile grid the dancer stands ON,
  // present in EVERY mode (it lives in `scene`, not any mode group). Tiles
  // light in a travelling checker wave and flare white on the beat; the whole
  // grid is theme-tinted. Sits a hair below the feet plane so the figures
  // read as standing exactly on it. ──
  const ledFloorMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPulse: { value: 0 }, uEnergy: { value: 0.3 }, uCol: { value: new THREE.Vector3(0.3, 0.7, 1.0) } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: /* glsl */`
      varying vec3 vW;
      void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform float uTime; uniform float uPulse; uniform float uEnergy; uniform vec3 uCol;
      varying vec3 vW;
      void main() {
        vec2 g = vW.xz * 1.25;                       // ~0.8-unit tiles
        vec2 f = abs(fract(g) - 0.5);
        float grid = smoothstep(0.42, 0.5, max(f.x, f.y)); // bright seams
        vec2 cell = floor(g);
        // travelling checker wave across the tiles + a per-cell twinkle
        float wave = 0.5 + 0.5 * sin(uTime * 2.2 + (cell.x + cell.y) * 0.7);
        float fill = (0.06 + wave * 0.14 * uEnergy) * mod(cell.x + cell.y, 2.0); // lit checker cells
        float lit = grid * (0.3 + wave * 0.5 + uPulse * 1.1) + fill;
        float rad = smoothstep(7.5, 0.4, length(vW.xz + vec2(0.0, 0.6))); // fade out from stage center
        vec3 col = uCol * lit * rad * (0.7 + uPulse * 0.8);
        gl_FragColor = vec4(col, lit * rad);
      }
    `,
  });
  const ledFloor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), ledFloorMat);
  ledFloor.rotation.x = -Math.PI / 2;
  ledFloor.position.set(0, -0.05, -0.6);
  scene.add(ledFloor);

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
  // moveIdx/stepIn/phraseLen let each BACKUP dancer run its OWN move on its
  // own little phrase clock — a crew freestyling different moves at once,
  // snapping to the lead only for the unison "drop" — instead of clones.
  // faceOff = a constant extra Y rotation applied on top of the pose — used
  // by wedding mode to angle the groom and bride toward each other.
  type Dancer = { rig: ReturnType<typeof buildFigureRig>; cur: Pose; vel: Pose; tgt: Pose; stepOffset: number; baseX: number; baseZ: number; microPhase: number; moveIdx: number; stepIn: number; phraseLen: number; faceOff: number };
  function mkDancer(drig: ReturnType<typeof buildFigureRig>, stepOffset: number, baseX: number, baseZ: number, microPhase: number): Dancer {
    const cur: Pose = {}, vel: Pose = {}, tgt: Pose = {};
    for (const k of POSE_KEYS) { cur[k] = BASE_POSE[k] || 0; vel[k] = 0; tgt[k] = BASE_POSE[k] || 0; }
    return { rig: drig, cur, vel, tgt, stepOffset, baseX, baseZ, microPhase, moveIdx: 0, stepIn: 0, phraseLen: 6 + Math.floor(Math.random() * 5), faceOff: 0 };
  }
  // Amplitude exaggeration: authored poses get scaled up with energy (up to
  // ~+25%) so a playing track reads BIG from across a room / on a projector;
  // calm pulls it back toward the authored value. rootRy is exempt — full
  // turns are authored as exact multiples of 2π and must stay exact.
  const setPoseFor = (d: Dancer, p: Pose) => {
    const amp = 1 + (1 - calm) * 0.25 * energy;
    for (const k of POSE_KEYS) {
      const v = (k in p) ? p[k] : (BASE_POSE[k] || 0);
      d.tgt[k] = (k === 'rootRy' || !(k in p)) ? v : v * amp;
    }
  };
  // Arm anti-clip — the body is SOLID: a hand can't pass through the belly.
  // Unless a pose deliberately brings the arm FORWARD (negative shLx/fALx
  // lifts it off the torso plane, e.g. a cross-in-front), keep the shoulder
  // abducted at least `m` and the forearm from curling hard into the chest,
  // so a lowered/inward arm hugs the side of the torso instead of vanishing
  // into it. `m` is bigger for the bulkier GLB characters. Returns the four
  // clamped arm-Z angles; callers pass the rest of the pose straight through.
  function armClear(S: Pose, m: number) {
    return {
      shLz: (S.shLx ?? 0) < -0.4 ? S.shLz : Math.max(S.shLz, m),
      shRz: (S.shRx ?? 0) < -0.4 ? S.shRz : Math.min(S.shRz, -m),
      fALz: (S.fALx ?? 0) < -0.35 ? S.fALz : Math.max(S.fALz, -0.12),
      fARz: (S.fARx ?? 0) < -0.35 ? S.fARz : Math.min(S.fARz, 0.12),
    };
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

    // ═══════ AFROBEATS / VIRAL (69-78) ═══════
    // 69 · Afro shoki — grounded shoulder shakes over a low bounce.
    (s) => { const a = s % 2 ? 1 : -1; return {
      rootY: -0.14, kneeLx: 0.55, kneeRx: 0.55, torsoRz: a * 0.16, shLz: a > 0 ? 0.85 : 0.4, shRz: a < 0 ? -0.85 : -0.4,
      fALz: 0.5, fARz: -0.5, headRy: a * 0.1, hipsRz: -a * 0.14, rootX: a * 0.05,
    }; },
    // 70 · Zanku leg work — sharp alternating leg flicks, torso upright and cool.
    (s) => { const a = s % 2 ? 1 : -1; return {
      legLx: a > 0 ? -0.4 : 0.5, kneeLx: a > 0 ? 0.15 : 1.1, legRx: a < 0 ? -0.4 : 0.5, kneeRx: a < 0 ? 0.15 : 1.1,
      rootY: -0.1, shLz: 0.6, shRz: -0.6, fALz: 0.65, fARz: -0.65, torsoRy: a * 0.1, headRx: 0.05,
    }; },
    // 71 · Gwara gwara — hips carve a wide circle, upper body leans with it.
    (s) => { const q = s % 4; const ang = [0.18, 0.05, -0.18, 0.05][q]; return {
      hipsRz: ang, torsoRz: -ang * 0.7, rootX: ang * 0.6, torsoRy: ang * 0.5,
      shLz: 0.5, shRz: -0.5, fALz: 0.4, fARz: -0.4, headRy: ang * 0.8, rootY: -0.06, kneeLx: 0.3, kneeRx: 0.3,
    }; },
    // 72 · Woah — sudden hard freeze-snap of the head/shoulders on the beat.
    (s) => { const hit = s % 2 === 0; return {
      headRx: hit ? -0.35 : 0.05, headRy: hit ? 0.3 : 0, torsoRz: hit ? 0.2 : 0,
      shLz: hit ? 0.3 : 0.9, shRz: hit ? -1.1 : -0.4, fALz: hit ? 0.6 : 0.2, fARz: hit ? -0.2 : -0.7,
      rootY: hit ? -0.1 : -0.03, kneeLx: 0.3, kneeRx: 0.3,
    }; },
    // 73 · Dougie lean — loose shoulder roll with a deep side lean.
    (s) => { const a = s % 2 ? 1 : -1; return {
      torsoRz: a * 0.24, hipsRz: -a * 0.1, rootX: a * 0.16, shLz: 0.45, shRz: -0.45,
      fALz: 0.55, fARz: -0.55, headRy: -a * 0.2, headRx: 0.05, kneeLx: 0.3, kneeRx: 0.3, rootY: -0.06,
    }; },
    // 74 · Shoot dance — arm mimes a bow-and-arrow pull, hips punctuate.
    (s) => { const a = s % 2 ? 1 : -1; return {
      shLx: a > 0 ? -1.2 : 0.3, fALx: a > 0 ? -0.9 : 0, fALz: a > 0 ? 0.1 : 0.7,
      shRz: a > 0 ? -0.4 : -1.3, fARz: a > 0 ? -0.7 : -0.05, hipsRz: a * 0.16,
      torsoRy: a * 0.2, rootY: -0.06, kneeLx: 0.3, kneeRx: 0.3, headRy: a * 0.15,
    }; },
    // 75 · Viral tutting — sharp geometric arm folds, robotic but grounded.
    (s) => { const q = s % 4; return {
      shLz: q === 0 ? 1.1 : q === 1 ? 1.1 : 0.5, shLx: q === 1 ? -0.9 : -0.2, fALx: q >= 1 ? -1.1 : 0, fALz: q >= 2 ? 0.15 : 0.7,
      shRz: q === 2 ? -1.1 : q === 3 ? -1.1 : -0.5, shRx: q === 3 ? -0.9 : -0.2, fARx: q >= 3 ? -1.1 : 0, fARz: q === 0 ? -0.7 : -0.15,
      headRy: (q < 2 ? 1 : -1) * 0.2, rootY: -0.04, kneeLx: 0.2, kneeRx: 0.2,
    }; },
    // 76 · Bounce clap combo — two-beat bounce with an overhead clap topper.
    (s): Pose => { const clap = s % 4 === 3; return clap
      ? { shLz: 2.2, shRz: -2.2, fALz: -0.4, fARz: 0.4, rootY: -0.01, kneeLx: 0.15, kneeRx: 0.15, headRx: -0.1 }
      : { rootY: s % 2 ? -0.15 : -0.05, kneeLx: s % 2 ? 0.7 : 0.25, kneeRx: s % 2 ? 0.7 : 0.25, shLz: 0.6, shRz: -0.6, fALz: 0.55, fARz: -0.55, hipsRz: (s % 2 ? 1 : -1) * 0.1 };
    },
    // 77 · Shaku shaku — foot-tap shuffle with hands rowing forward.
    (s) => { const a = s % 2 ? 1 : -1; return {
      legLx: a > 0 ? -0.3 : 0.1, legRx: a < 0 ? -0.3 : 0.1, kneeLx: 0.25, kneeRx: 0.25,
      shLx: -0.5, shRx: -0.5, fALx: a > 0 ? -0.6 : -0.2, fARx: a < 0 ? -0.6 : -0.2, fALz: 0.5, fARz: -0.5,
      torsoRy: a * 0.14, rootY: -0.07, headRy: a * 0.12,
    }; },
    // 78 · Amapiano glide — smooth slow-drag steps, arms low and languid.
    (s) => { const a = s % 2 ? 1 : -1; return {
      rootX: a * 0.28, legLx: a > 0 ? -0.35 : 0.1, legRx: a < 0 ? -0.35 : 0.1,
      kneeLx: a > 0 ? 0.4 : 0.15, kneeRx: a < 0 ? 0.4 : 0.15, torsoRz: a * 0.1,
      shLz: 0.35, shRz: -0.35, fALz: 0.75, fARz: -0.75, headRy: a * 0.15, rootY: -0.04,
    }; },

    // ═══════ CONTEMPORARY / VOGUE (79-88) ═══════
    // 79 · Vogue hand performance — sharp geometric hand frames near the face.
    (s) => { const q = s % 4; return {
      shLz: q < 2 ? 1.9 : 1.2, shLx: q === 1 ? -0.6 : -0.1, fALx: q >= 1 ? -1.2 : -0.3, fALz: q < 2 ? 0.2 : 0.6,
      shRz: q >= 2 ? -1.9 : -1.2, shRx: q === 3 ? -0.6 : -0.1, fARx: q >= 3 ? -1.2 : -0.3, fARz: q >= 2 ? -0.2 : -0.6,
      headRx: -0.1, headRy: (q < 2 ? 1 : -1) * 0.22, rootY: -0.02, kneeLx: 0.15, kneeRx: 0.15,
    }; },
    // 80 · Duckwalk strut — runway walk with an exaggerated hip roll.
    (s) => { const a = s % 2 ? 1 : -1; return {
      rootX: a * 0.1, hipsRz: a * 0.26, torsoRy: -a * 0.1, torsoRz: -a * 0.08,
      legLx: a > 0 ? -0.3 : 0.15, legRx: a < 0 ? -0.3 : 0.15, kneeLx: 0.25, kneeRx: 0.25,
      shLz: 0.4, shRz: -0.4, fALz: 0.3, fARz: -0.3, headRy: -a * 0.1, rootY: -0.03,
    }; },
    // 81 · Dip drop — a controlled floor dip and smooth recovery.
    (s): Pose => s % 4 < 3
      ? { rootY: -0.05 - (s % 4) * 0.08, kneeLx: 0.3 + (s % 4) * 0.3, kneeRx: 0.3 + (s % 4) * 0.3, torsoRx: (s % 4) * 0.08,
          shLz: 1.6, shRz: -1.6, fALz: 0.2, fARz: -0.2, headRx: -0.05 }
      : { rootY: -0.02, kneeLx: 0.15, kneeRx: 0.15, torsoRx: -0.05, shLz: 2.2, shRz: -2.2, fALz: -0.1, fARz: 0.1, headRx: -0.15 },
    // 82 · Contemporary reach — a long diagonal reach with a spiraling torso.
    (s) => { const a = s % 2 ? 1 : -1; return {
      shLz: a > 0 ? 2.6 : 0.5, fALz: a > 0 ? 0.15 : 0.5, shRz: a < 0 ? -2.6 : -0.5, fARz: a < 0 ? -0.15 : -0.5,
      torsoRy: a * 0.32, torsoRx: -0.08, hipsRz: -a * 0.1, headRy: a * 0.3, rootY: -0.04, kneeLx: 0.2, kneeRx: 0.2,
    }; },
    // 83 · Catwalk pivot — crisp quarter-turn pivot every four beats, chin high.
    (s) => ({
      rootRy: (Math.PI / 2) * Math.floor(s / 4) + (Math.PI / 2) * Math.min(1, (s % 4) / 3),
      shLz: 0.4, shRz: -0.4, fALz: 0.2, fARz: -0.2, headRx: -0.12, rootY: -0.02, kneeLx: 0.15, kneeRx: 0.15,
    }),
    // 84 · Floor ripple — a seated-height ripple traveling torso to fingertips.
    (s): Pose => { const q = s % 4; return q === 0
      ? { rootY: -0.22, torsoRx: 0.2, kneeLx: 1.0, kneeRx: 1.0, legLx: -0.3, legRx: -0.3, shLz: 0.3, shRz: -0.3, fALz: 0.3, fARz: -0.3 }
      : q === 1
      ? { rootY: -0.14, torsoRx: -0.1, kneeLx: 0.6, kneeRx: 0.6, shLz: 0.9, shRz: -0.9, fALz: 0.5, fARz: -0.5 }
      : { rootY: -0.03, torsoRx: 0.05, kneeLx: 0.2, kneeRx: 0.2, shLz: 1.7, shRz: -1.7, fALz: 0.6, fARz: -0.6, headRx: -0.1 };
    },
    // 85 · Isolation box — chest/hips/head isolate independently in sequence.
    (s) => { const q = s % 4; return {
      torsoRx: q === 0 ? 0.2 : 0, hipsRz: q === 1 ? 0.2 : q === 3 ? -0.2 : 0,
      headRy: q === 2 ? 0.3 : q === 0 ? -0.1 : 0, shLz: 0.6, shRz: -0.6, fALz: 0.5, fARz: -0.5,
      rootY: -0.05, kneeLx: 0.25, kneeRx: 0.25,
    }; },
    // 86 · Lyrical fall — a soft controlled collapse and rise, arms trailing.
    (s): Pose => s % 4 < 2
      ? { rootY: -0.05 - (s % 2) * 0.14, torsoRx: (s % 2) * 0.22, shLz: 1.9 - (s % 2) * 0.9, shRz: -1.4 + (s % 2) * 0.5,
          fALz: 0.2, fARz: -0.3, kneeLx: 0.2 + (s % 2) * 0.5, kneeRx: 0.2 + (s % 2) * 0.5, headRx: (s % 2) * 0.15 }
      : { rootY: -0.02, torsoRx: -0.06, shLz: 2.3, shRz: -0.7, fALz: 0.1, fARz: -0.4, kneeLx: 0.15, kneeRx: 0.15, headRx: -0.1, headRy: 0.15 },
    // 87 · Sharp jazz kick — a crisp high kick with a spotting head snap.
    (s) => { const a = s % 2 ? 1 : -1; return {
      legLx: a > 0 ? -1.1 : 0.05, kneeLx: a > 0 ? 0.0 : 0.25, legRx: a < 0 ? -1.1 : 0.05, kneeRx: a < 0 ? 0.0 : 0.25,
      torsoRx: -0.1, headRy: a * 0.35, headRx: -0.08, shLz: 1.5, shRz: -1.5, fALz: 0.3, fARz: -0.3, rootY: 0.02,
    }; },
    // 88 · Grand finale pose — big open stance, chest out, both arms crowning up.
    (s) => { const breathe = Math.sin(s * 0.9) * 0.05; return {
      shLz: 2.75, shRz: -2.75, fALz: 0.1 + breathe, fARz: -0.1 - breathe,
      torsoRx: -0.12, headRx: -0.18, rootY: 0.04 + breathe * 0.4, kneeLx: 0.1, kneeRx: 0.1, hipsRz: 0,
    }; },

    // ═══════ CHILL / AMBIENT / SHANTI (89-98) ═══════
    // Slow, flowing, breath-paced. Authored as smooth functions of the whole
    // 8-beat block (phase p = s/8) rather than per-beat "hits", so the soft
    // chill springs (see the frame loop) glide the body through them like
    // water instead of snapping. Meant for the calm vibe — ballads, lounge,
    // meditative and world-ambient music.
    // 89 · Ocean sway — a long weight shift side to side, arms drifting like kelp.
    (s) => { const w = Math.sin((s / 8) * Math.PI * 2); return {
      rootX: w * 0.16, hipsRz: w * 0.12, torsoRz: -w * 0.1, torsoRy: w * 0.14,
      shLz: 0.9 + w * 0.2, shRz: -0.9 + w * 0.2, fALz: 0.5 + w * 0.15, fARz: -0.5 + w * 0.15,
      headRy: w * 0.16, headRx: -0.05, rootY: -0.05 - Math.abs(w) * 0.03, kneeLx: 0.28, kneeRx: 0.28,
    }; },
    // 90 · Lotus bloom — both arms rise slowly from the heart and open overhead.
    (s) => { const p = s / 8; const rise = Math.sin(p * Math.PI); return {
      shLz: 0.7 + rise * 1.9, shRz: -0.7 - rise * 1.9, fALz: 0.6 - rise * 0.45, fARz: -0.6 + rise * 0.45,
      shLx: -0.1, shRx: -0.1, torsoRx: -rise * 0.1, headRx: -rise * 0.16,
      rootY: -0.06 + rise * 0.04, kneeLx: 0.22, kneeRx: 0.22, hipsRz: Math.sin(p * Math.PI * 2) * 0.05,
    }; },
    // 91 · Tai-chi push — weight sinks as one palm presses slowly forward, then swaps.
    (s) => { const a = s % 8 < 4 ? 1 : -1; const p = (s % 4) / 4; return {
      rootY: -0.1, kneeLx: a > 0 ? 0.5 : 0.3, kneeRx: a < 0 ? 0.5 : 0.3,
      legLx: a > 0 ? -0.2 : 0.05, legRx: a < 0 ? -0.2 : 0.05, torsoRy: a * 0.18,
      shLx: a > 0 ? -0.9 - p * 0.4 : 0.1, fALx: a > 0 ? -0.5 : 0, fALz: 0.3,
      shRx: a < 0 ? -0.9 - p * 0.4 : 0.1, fARx: a < 0 ? -0.5 : 0, fARz: -0.3,
      headRy: a * 0.2, hipsRz: -a * 0.08,
    }; },
    // 92 · Slow body wave — one very long chest-to-fingertip ripple over the block.
    (s) => { const p = s / 8; return {
      torsoRx: Math.sin(p * Math.PI * 2) * 0.18, headRx: Math.sin(p * Math.PI * 2 - 0.6) * 0.14,
      shLz: 1.0 + Math.sin(p * Math.PI * 2 - 1.0) * 0.5, shRz: -1.0 - Math.sin(p * Math.PI * 2 - 1.0) * 0.5,
      fALz: 0.4 + Math.sin(p * Math.PI * 2 - 1.6) * 0.35, fARz: -0.4 - Math.sin(p * Math.PI * 2 - 1.6) * 0.35,
      rootY: -0.05 + Math.sin(p * Math.PI * 2) * 0.03, kneeLx: 0.26, kneeRx: 0.26,
    }; },
    // 93 · Moon reach — a slow long reach up toward one side, torso spiraling after it.
    (s) => { const a = s % 8 < 4 ? 1 : -1; const rise = Math.sin(((s % 4) / 4) * Math.PI); return {
      shLz: a > 0 ? 1.4 + rise * 1.2 : 0.6, fALz: a > 0 ? 0.1 : 0.5,
      shRz: a < 0 ? -1.4 - rise * 1.2 : -0.6, fARz: a < 0 ? -0.1 : -0.5,
      torsoRy: a * rise * 0.25, torsoRz: a * rise * 0.1, headRy: a * 0.2, headRx: -rise * 0.14,
      rootY: -0.04 + rise * 0.03, kneeLx: 0.2, kneeRx: 0.2, hipsRz: -a * 0.06,
    }; },
    // 94 · Breathe & sway — the minimal one: tiny sway with a visible breath in
    // the chest, arms hanging soft. The "barely dancing, just feeling it" pose.
    (s) => { const p = s / 8; const br = Math.sin(p * Math.PI * 2); return {
      rootY: -0.05 + br * 0.035, torsoRx: -br * 0.06, headRx: -br * 0.05,
      rootX: Math.sin(p * Math.PI) * 0.06, torsoRz: Math.sin(p * Math.PI) * 0.05,
      shLz: 0.5 + br * 0.12, shRz: -0.5 - br * 0.12, fALz: 0.55, fARz: -0.55,
      kneeLx: 0.24 + br * 0.05, kneeRx: 0.24 + br * 0.05,
    }; },
    // 95 · Lantern hands — hands float up in front as if cupping a light, slow tilt.
    (s) => { const p = s / 8; const lift = 0.5 + Math.sin(p * Math.PI) * 0.4; return {
      shLz: 1.1, shRz: -1.1, shLx: -0.7, shRx: -0.7, fALx: -1.0, fARx: -1.0,
      fALz: -0.15 - lift * 0.2, fARz: 0.15 + lift * 0.2, torsoRx: -0.05,
      headRx: -0.1 + Math.sin(p * Math.PI * 2) * 0.06, headRy: Math.sin(p * Math.PI * 2) * 0.1,
      rootY: -0.05, kneeLx: 0.24, kneeRx: 0.24,
    }; },
    // 96 · Starlit turn — a single very slow half-turn drift, arms open to the sky.
    (s) => ({
      rootRy: Math.PI * (s / 8), shLz: 1.7, shRz: -1.7, fALz: 0.25, fARz: -0.25,
      shLx: -0.1, shRx: -0.1, headRx: -0.14, torsoRx: -0.04,
      rootY: -0.04, kneeLx: 0.2, kneeRx: 0.2, hipsRz: Math.sin((s / 8) * Math.PI * 2) * 0.06,
    }),
    // 97 · Cradle rock — arms cradled in front, rocking softly, head resting to the lift.
    (s) => { const w = Math.sin((s / 8) * Math.PI * 2); return {
      shLz: 0.9, shRz: -0.9, shLx: -0.55, shRx: -0.55, fALx: -0.95, fARx: -0.95, fALz: -0.2, fARz: 0.2,
      rootX: w * 0.1, torsoRz: w * 0.14, hipsRz: -w * 0.07, headRy: w * 0.16, headRx: -0.06,
      rootY: -0.06, kneeLx: 0.26, kneeRx: 0.26,
    }; },
    // 98 · Sun salutation — a slow reach overhead, a hint of a forward fold, and rise.
    (s) => { const p = s / 8; const fold = Math.sin(p * Math.PI); return {
      shLz: 2.0 - fold * 0.6, shRz: -2.0 + fold * 0.6, fALz: 0.15 + fold * 0.3, fARz: -0.15 - fold * 0.3,
      torsoRx: fold * 0.28, headRx: fold * 0.2, rootY: -0.04 - fold * 0.08,
      kneeLx: 0.2 + fold * 0.3, kneeRx: 0.2 + fold * 0.3, hipsRz: 0,
    }; },

    // ═══════ WEDDING (99-104 · couple dances + hora) ═══════
    // Danced by the groom AND bride in unison (she mirrors via her facing
    // angle), while the crew circles them with the hora set.
    // 99 · Embrace sway — arms curved forward as if holding a partner close,
    // a gentle box-step weight shift. THE first-dance pose.
    (s) => { const w = Math.sin((s / 8) * Math.PI * 2); return {
      shLz: 0.85, shRz: -0.85, shLx: -0.75, shRx: -0.75, fALx: -0.7, fARx: -0.7, fALz: -0.1, fARz: 0.1,
      rootX: w * 0.12, torsoRz: w * 0.08, hipsRz: -w * 0.06, headRy: w * 0.12, headRx: -0.04,
      torsoRy: w * 0.1, rootY: -0.04 - Math.abs(w) * 0.02, kneeLx: 0.2, kneeRx: 0.2,
    }; },
    // 100 · Wedding twirl — one full graceful spin, one arm crowned high.
    (s) => ({
      rootRy: Math.PI * 2 * Math.min(1, (s + 1) / 6),
      shLz: 2.5, fALz: 0.2, shRz: -0.8, fARz: -0.6,
      headRx: -0.1, rootY: -0.02, kneeLx: 0.2, kneeRx: 0.2, hipsRz: (s % 2 ? 1 : -1) * 0.06,
    }),
    // 101 · The dip — a held romantic lean-back, one arm flung high; rise, repeat.
    (s): Pose => s % 8 < 3
      ? { torsoRx: -0.42, headRx: -0.3, rootY: -0.14, kneeLx: 0.55, kneeRx: 0.85, legRx: -0.35,
          shLz: 0.6, fALz: 0.5, shRz: -2.4, fARz: -0.2, hipsRz: -0.08 }
      : { rootY: -0.03, shLz: 0.9, shRz: -0.9, shLx: -0.6, shRx: -0.6, fALx: -0.6, fARx: -0.6, kneeLx: 0.2, kneeRx: 0.2 },
    // 102 · Promenade — side-steps hand-in-hand, inside arm to the partner,
    // outside arm sweeping wide.
    (s) => { const a = s % 2 ? 1 : -1; return {
      rootX: a * 0.18, legLx: a > 0 ? -0.3 : 0.1, legRx: a < 0 ? -0.3 : 0.1,
      kneeLx: a > 0 ? 0.4 : 0.15, kneeRx: a < 0 ? 0.4 : 0.15,
      shLx: -0.85, fALx: -0.55, fALz: -0.1,
      shRz: a < 0 ? -1.9 : -0.7, fARz: a < 0 ? -0.2 : -0.6,
      torsoRy: a * 0.14, headRy: a * 0.16, rootY: -0.05, hipsRz: a * 0.08,
    }; },
    // 103 · Hora kick — the wedding circle-dance kick-step, arms linked wide.
    (s) => { const a = s % 2 ? 1 : -1; return {
      shLz: 1.15, shRz: -1.15, shLx: -0.25, shRx: -0.25, fALz: 0.15, fARz: -0.15,
      legLx: a > 0 ? -0.85 : 0.1, kneeLx: a > 0 ? 0.1 : 0.3, legRx: a < 0 ? -0.85 : 0.1, kneeRx: a < 0 ? 0.1 : 0.3,
      rootY: a > 0 ? -0.02 : -0.1, rootX: a * 0.1, torsoRx: 0.06, headRx: -0.05, hipsRz: a * 0.08,
    }; },
    // 104 · Lift bounce — the "raised on chairs" moment: huge joyous V-arm leaps.
    (s) => { const up = s % 2 === 0; return {
      rootY: up ? 0.34 : -0.12, kneeLx: up ? 0.5 : 0.95, kneeRx: up ? 0.5 : 0.95,
      legLx: up ? -0.3 : -0.2, legRx: up ? -0.3 : -0.2,
      shLz: 2.6, shRz: -2.6, fALz: 0.15, fARz: -0.15, headRx: -0.18, torsoRx: up ? -0.08 : 0.1,
    }; },
  ];
  // ── Style pools — the move set follows the track's energy: fast tracks
  // pull from the aggressive hip-hop/rave/percussive set, mid tempo from
  // groove/disco/pop, slow tempo from latin/ballroom/smooth. Indexes into
  // the 88-move library above.
  // (0-based array indexes — the // N labels in the move comments are 1-based)
  const POOL_FAST = [2, 8, 12, 16, 5, 15, 23, 25, 26, 30, 32, 35, 42, 44, 45, 47, 48, 57, 62, 65, 66, 69, 71, 73, 74, 86];
  const POOL_MID = [0, 3, 9, 10, 14, 17, 6, 18, 19, 20, 21, 22, 27, 36, 37, 40, 41, 43, 49, 51, 52, 53, 54, 55, 56, 61, 63, 67, 68, 70, 72, 75, 76, 79, 84];
  const POOL_SLOW = [1, 4, 7, 11, 13, 10, 24, 28, 29, 31, 33, 34, 38, 39, 46, 50, 58, 59, 60, 64, 77, 78, 80, 81, 82, 83, 85, 87];
  // Chill vibe — the flowing/breath-paced set (moves 89-98). SHANTI is the
  // calmest subset (sway/breathe/lantern/cradle), CHILL adds the slightly
  // more expansive flows (lotus, tai-chi, waves, reaches, slow turn).
  const POOL_SHANTI = [88, 89, 93, 94, 96];        // ocean sway, lotus, breathe, lantern, cradle
  const POOL_CHILL = [88, 89, 90, 91, 92, 93, 94, 95, 96, 97]; // the whole flowing family
  // SPICE — the visually DRAMATIC moves (big level/silhouette changes: spins,
  // jumps, freezes, kicks, floor drops, huge reaches). Every energetic phrase
  // is guaranteed a couple of these interleaved with the grooves, at ANY
  // tempo — without it the mid pool alone reads as endless upper-body sway.
  const SPICE = [3, 5, 13, 24, 25, 8, 12, 16, 65, 87, 82, 84, 44, 47, 14, 62, 66];
  // Moves whose interest lives across a full 8 beats (a whole spin, a slow
  // wave/reach) must hold the full pattern; everything else changes every 4
  // beats so the dance turns over TWICE as often (the "not varied" fix).
  const LONG_MOVES = new Set([3, 4, 10, 11, 82, 83, 84, 88, 89, 90, 91, 92, 93, 95, 96, 97, 98, 100]);
  // Wedding mode — the couple dances the romantic set (embrace, twirl, dip,
  // promenade + the graceful waltz/sway moves), the crew circles them with
  // the hora set (hora kick/bounce, dabke, lift bounce, claps).
  const POOL_WEDDING_COUPLE = [98, 99, 100, 101, 58, 88, 95];
  const POOL_WEDDING_SLOW = [98, 58, 88, 93, 101];   // the first-dance set
  const POOL_HORA = [102, 63, 62, 103, 75, 6];
  let currentMoveIdx = 0;

  // ── Choreography sequencer ──────────────────────────────────────────────
  // The show is danced as curated, REPEATING phrases — a combo of moves
  // danced, then danced AGAIN — instead of a fresh random move every block.
  // Repetition is what makes motion read as *rehearsed choreography* rather
  // than shuffling: the eye recognizes "they're doing the combo again". On
  // top of that the routine alternates verse/chorus intensity (choruses pull
  // the flashy pool) and every fourth phrase ends on a held "signature" hero
  // move — so each song plays out as a performance with a shape, not a loop.
  let routine: number[] = [];
  let routinePos = 0;   // index within the current phrase
  let routinePass = 0;  // which repeat of the phrase we're on
  let phraseNo = 0;     // phrases danced so far this session (drives the arc)
  let stepInPattern = 0; // beat within the current move (decoupled from beatCount
                         // so a lyric line can start a fresh move mid-count)
  let lastLineAt = 0;    // last time a real sung lyric line arrived (syncLine)
  let mouthPulse = 0;    // mouth glow flare — spikes on each sung line, decays
  let routineRepeats = 1; // how many times to repeat THIS phrase (chorus = 2)
  // Big "hero" moments a phrase can climax on: jump&freeze, drop&freeze, low
  // freeze, full turn, starlit turn, grand finale pose, lift bounce.
  const SIGNATURES = [5, 13, 24, 3, 96, 87, 103];
  function pickN(pool: number[], n: number): number[] {
    const bag = pool.slice(), out: number[] = [];
    for (let i = 0; i < n && bag.length; i++) { const j = Math.floor(Math.random() * bag.length); out.push(bag[j]); bag.splice(j, 1); }
    return out;
  }
  // The eligible move set right now — vibe/calm first, then the verse/chorus
  // energy arc. Shared by the lead's phrase builder AND the backups' freestyle
  // so the whole crew pulls from the same energy without cloning each other.
  function activePool(): number[] {
    if (calm > 0.75) return POOL_SHANTI;
    if (calm > 0.5) return POOL_CHILL;
    const chorus = Math.floor(phraseNo / 2) % 2 === 1;
    const bigPool = tempoMs < 520 ? POOL_FAST : POOL_MID;
    const versePool = tempoMs > 600 ? POOL_SLOW : POOL_MID;
    return chorus ? bigPool : versePool;
  }
  function buildRoutine(): number[] {
    if (weddingMode) {
      // The couple's routine: romantic combos that repeat (a first dance has
      // a hook you recognize), a slow-set when the vibe is calm, and every
      // third phrase climaxing on the chair-lift bounce.
      routineRepeats = 2;
      if (calm > 0.5) return pickN(POOL_WEDDING_SLOW, 4);
      const phrase = pickN(POOL_WEDDING_COUPLE, 4);
      if (phraseNo % 3 === 2) phrase.push(103, 103);
      return phrase;
    }
    const chorus = calm <= 0.5 && Math.floor(phraseNo / 2) % 2 === 1;
    // Verses FLOW through many unique moves (no repeat) so the dance never
    // feels like the same handful of steps; only the chorus repeats, because
    // a repeated hook is what the ear/eye WANTS to recognize. Calm vibes flow
    // through a longer chill sweep.
    if (calm > 0.5) { routineRepeats = 1; return pickN(activePool(), Math.min(6, POOL_CHILL.length)); }
    routineRepeats = chorus ? 2 : 1;
    // Interleave groove moves from the tempo pool with GUARANTEED dramatic
    // SPICE (spins/jumps/freezes/kicks/floor drops), so every phrase has big
    // silhouette changes instead of all upper-body sway — then shuffle so the
    // spice isn't predictably last. Choruses land bigger (more spice).
    const grooves = pickN(activePool(), chorus ? 3 : 4);
    const spice = pickN(SPICE, chorus ? 3 : 2);
    const phrase = grooves.concat(spice);
    for (let i = phrase.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [phrase[i], phrase[j]] = [phrase[j], phrase[i]]; }
    if (phraseNo % 4 === 3) { // cap every 4th phrase with a held signature hero beat
      const sig = SIGNATURES[Math.floor(Math.random() * SIGNATURES.length)];
      phrase.push(sig, sig);
    }
    return phrase;
  }
  function nextMoveIdx(): number {
    if (routine.length === 0 || routinePos >= routine.length) {
      if (routine.length && routinePass < routineRepeats - 1) {
        routinePass++; routinePos = 0; // dance the SAME phrase again (chorus hook)
      } else {
        phraseNo++; routine = buildRoutine(); routinePos = 0; routinePass = 0;
        if (routine.length === 0) routine = [currentMoveIdx];
      }
    }
    return routine[routinePos++];
  }

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
  // Every figure's mouth glow, driven together per-frame: a base glow that
  // breathes with energy plus a hard flare each time a lyric line fires —
  // the dancers visibly SING the song's lines.
  const mouthMats: THREE.MeshBasicMaterial[] = [rig.mouthMat];

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
  // All possible backup spots (x, z, beat offset), built once; ensureBackups
  // grows/shows however many crewSize currently calls for (2, 4, or 6),
  // hiding the rest — so changing crew size mid-show needs no rebuild.
  const ALL_BACKUP_SPOTS: [number, number, number][] = [
    [-1.0, -0.5, 1], [1.0, -0.5, 2],
    [-1.9, -1.0, 3], [1.9, -1.0, 4],
    [-2.7, -1.5, 5], [2.7, -1.5, 6],
  ];
  function ensureBackups() {
    const want = Math.max(0, Math.min(ALL_BACKUP_SPOTS.length, crewSize));
    while (dancers.length - 1 < want) {
      const [bx, bz, off] = ALL_BACKUP_SPOTS[dancers.length - 1];
      const r = buildFigureRig(figMat, waveMat);
      r.group.position.set(bx, -0.05, bz);
      r.group.scale.setScalar(0.8);
      r.group.visible = false;
      scene.add(r.group);
      dancers.push(mkDancer(r, off, bx, bz, off * 2.1));
      registerAccents(r.accents);
      mouthMats.push(r.mouthMat);
      mkShadow(bx, bz).visible = false;
    }
  }
  // ── WEDDING MODE — bride & groom + chuppah + floating hearts ─────────────
  // For DJs projecting at real weddings: the lead becomes the groom (top hat
  // + bow tie), a bride in an ivory-champagne glow dress joins him center
  // stage, a flower-covered chuppah arch rises behind them, rose-tinted
  // petals fall and hearts float up — and the whole light rig goes warm gold.
  // Built lazily on first activation; visibility-toggled after that.
  let brideD: Dancer | null = null;
  let brideShadow: THREE.Mesh | null = null;
  let weddingGroup: THREE.Group | null = null;
  let groomHat: THREE.Group | null = null;
  let groomTie: THREE.Group | null = null;
  let heartTex: THREE.CanvasTexture | null = null;
  let heartsGeo: THREE.BufferGeometry | null = null;
  let heartsMat: THREE.PointsMaterial | null = null;
  let heartSpeed: Float32Array | null = null;
  const HEART_N = 26;
  function ensureWedding() {
    if (weddingGroup) return;
    // Bride — her own figure material, frozen to an ivory/champagne/rose
    // palette (deliberately NOT theme-registered, so user theme changes
    // restyle the groom + crew while the bride stays bridal white).
    const brideMat = buildFigureMaterial();
    (brideMat.uniforms.uColA.value as THREE.Vector3).set(1.0, 0.97, 0.92);
    (brideMat.uniforms.uColB.value as THREE.Vector3).set(1.0, 0.85, 0.55);
    (brideMat.uniforms.uColC.value as THREE.Vector3).set(1.0, 0.62, 0.75);
    brideMat.uniforms.uVeinIntensity.value = 0.25; // subtle circuitry under the "dress"
    const bRig = buildFigureRig(brideMat, waveMat);
    for (const m of bRig.accents) m.color.setRGB(1.0, 0.85, 0.6); // warm gold eyes/core
    mouthMats.push(bRig.mouthMat);
    // Dress skirt — a soft glowing cone flaring from the hips.
    const skirtMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.95, 0.9), transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.62, 24, 1, true), skirtMat);
    skirt.position.y = 0.41;
    bRig.group.add(skirt);
    // Veil — a translucent cone draping back off the head — plus a tiny tiara.
    // (children of the head inherit its egg-stretch scale; counter it.)
    const headWear = new THREE.Group();
    headWear.scale.set(1 / 0.95, 1 / 1.35, 1);
    const veil = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.42, 12, 1, true), skirtMat);
    veil.position.set(0, -0.02, -0.1);
    veil.rotation.x = 0.5;
    headWear.add(veil);
    const tiaraMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.85, 0.45), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
    const tiara = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.011, 8, 24), tiaraMat);
    tiara.position.y = 0.14;
    tiara.rotation.x = Math.PI / 2 - 0.25;
    headWear.add(tiara);
    bRig.head.add(headWear);
    bRig.group.position.set(0.42, -0.05, 0);
    bRig.group.scale.setScalar(0.97);
    bRig.group.visible = false;
    scene.add(bRig.group);
    brideD = mkDancer(bRig, 0, 0.42, 0, 1.3);
    brideD.faceOff = -0.5; // angled toward the groom
    brideShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.42), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.3, depthWrite: false }));
    brideShadow.rotation.x = -Math.PI / 2;
    brideShadow.position.set(0.42, -0.045, 0.05);
    brideShadow.visible = false;
    scene.add(brideShadow);
    // Groom accessories on the lead rig — a top hat with a gold band + bow tie.
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x0d0d16 });
    const goldMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.8, 0.4), transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
    groomHat = new THREE.Group();
    groomHat.scale.set(1 / 0.95, 1 / 1.35, 1);
    const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.15, 16), darkMat);
    hatTop.position.y = 0.235;
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.015, 20), darkMat);
    hatBrim.position.y = 0.16;
    const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.103, 0.103, 0.03, 16), goldMat);
    hatBand.position.y = 0.185;
    groomHat.add(hatTop, hatBrim, hatBand);
    groomHat.rotation.z = 0.07;
    groomHat.visible = false;
    rig.head.add(groomHat);
    groomTie = new THREE.Group();
    const tieL = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.06, 3), darkMat);
    tieL.rotation.z = Math.PI / 2; tieL.position.x = -0.037;
    const tieR = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.06, 3), darkMat);
    tieR.rotation.z = -Math.PI / 2; tieR.position.x = 0.037;
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), goldMat);
    groomTie.add(tieL, tieR, knot);
    groomTie.position.set(0, 0.31, 0.16);
    groomTie.visible = false;
    rig.torso.add(groomTie);
    // Chuppah — a glowing golden arch on two posts, covered in flower blobs.
    weddingGroup = new THREE.Group();
    const archMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.0, 0.82, 0.45), transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.045, 10, 40, Math.PI), archMat);
    arch.position.set(0, 0.9, -1.35);
    weddingGroup.add(arch);
    for (const px of [-1.35, 1.35]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.95, 10), archMat);
      post.position.set(px, 0.43, -1.35);
      weddingGroup.add(post);
    }
    const flowerCols = [new THREE.Color(1.0, 0.75, 0.8), new THREE.Color(1.0, 0.95, 0.9), new THREE.Color(1.0, 0.55, 0.65)];
    for (let i = 0; i < 15; i++) {
      const th = (i / 14) * Math.PI;
      const fm = new THREE.MeshBasicMaterial({ color: flowerCols[i % 3], transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
      const fl = new THREE.Mesh(new THREE.SphereGeometry(0.05 + (i % 3) * 0.012, 8, 8), fm);
      fl.position.set(Math.cos(th) * 1.35, 0.9 + Math.sin(th) * 1.35, -1.33);
      weddingGroup.add(fl);
    }
    // Floating hearts — emoji-on-canvas texture, gently rising points.
    const hc = document.createElement('canvas'); hc.width = hc.height = 64;
    const hg = hc.getContext('2d')!;
    hg.font = '44px serif'; hg.textAlign = 'center'; hg.textBaseline = 'middle';
    hg.shadowColor = 'rgba(255,90,140,0.9)'; hg.shadowBlur = 10;
    hg.fillText('❤', 32, 34);
    heartTex = new THREE.CanvasTexture(hc);
    heartsGeo = new THREE.BufferGeometry();
    const hp = new Float32Array(HEART_N * 3);
    heartSpeed = new Float32Array(HEART_N);
    for (let i = 0; i < HEART_N; i++) {
      hp[i * 3] = (Math.random() - 0.5) * 4.6;
      hp[i * 3 + 1] = Math.random() * 3.2;
      hp[i * 3 + 2] = -1.7 + Math.random() * 2.2;
      heartSpeed[i] = 0.12 + Math.random() * 0.22;
    }
    heartsGeo.setAttribute('position', new THREE.BufferAttribute(hp, 3));
    heartsMat = new THREE.PointsMaterial({ map: heartTex, size: 0.17, transparent: true, opacity: 0.8, depthWrite: false });
    weddingGroup.add(new THREE.Points(heartsGeo, heartsMat));
    weddingGroup.visible = false;
    scene.add(weddingGroup);
  }
  // ── AVATAR STYLE — the simulator's own agent characters as the lead ─────
  // The Office3D GLB characters (casual male / legendary robot / Sophia) all
  // carry full humanoid skeletons, so instead of playing their baked clips we
  // DRIVE THEIR BONES directly from the same pose-spring engine — every one
  // of the 104 moves, the lyric sync, the springs, all of it, on a real
  // skinned character. The lead dancer's spring state (dancers[0].cur) stays
  // the single source of truth; the hidden procedural rig keeps computing so
  // switching styles is instant and lossless.
  //
  // Rotation math: each pose key is authored in the procedural rig's frame,
  // where every pivot's local axes are world-aligned at rest. For a GLB bone
  // (arbitrary bind orientation + bone roll) the equivalent rotation is
  // applied in the PARENT's frame about the bind-time world axes:
  //   q_local = pInv · q_world(euler) · p · q_bind
  // where p is the parent's bind world quaternion. This transfers the whole
  // move library without per-bone axis hand-tuning.
  interface GlbStyleCfg { url: string; suffix: boolean; armDown: number; yaw: number; map: Record<string, string> }
  const GLB_STYLES: (GlbStyleCfg | null)[] = [
    null, // 0 = the procedural neon alien
    { url: 'office-models/casual_male.glb', suffix: false, armDown: 1.3, yaw: 0, map: {
      hips: 'Hips', torso: 'Chest', head: 'Head',
      shL: 'Upper_Arm_L', shR: 'Upper_Arm_R', fAL: 'Lower_Arm_L', fAR: 'Lower_Arm_R',
      legL: 'Upper_Leg_L', legR: 'Upper_Leg_R', kneeL: 'Lower_Leg_L', kneeR: 'Lower_Leg_R',
    } },
    // The robot's bind pose already hangs arms-down (unlike the T-posed
    // human), so it needs only a small settle offset.
    { url: 'office-models/legendary_robot.glb', suffix: false, armDown: 0.2, yaw: 0, map: {
      hips: 'pelvis', torso: 'spine_02', head: 'head',
      shL: 'upperarm_L', shR: 'upperarm_R', fAL: 'lowerarm_L', fAR: 'lowerarm_R',
      legL: 'thigh_L', legR: 'thigh_R', kneeL: 'calf_L', kneeR: 'calf_R',
    } },
    // (sophia.glb was evaluated too — its RenderPeople rig explodes under
    // bone retargeting, so it stays out until that bind pose is solved.)
  ];
  let avatarStyle = 0;
  let glbGroup: THREE.Group | null = null;
  let glbBones: Record<string, THREE.Bone> | null = null;
  let glbBaseScale = 1;
  let glbArmDown = 1.3;
  let glbLights: THREE.Object3D[] = [];
  let glbLoadSeq = 0;
  const _gE = new THREE.Euler(), _gQ = new THREE.Quaternion(), _gQ2 = new THREE.Quaternion();
  function disposeGlbGroup(g: THREE.Object3D) {
    g.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        for (const m of (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as THREE.MeshStandardMaterial[]) {
          m.map?.dispose(); m.normalMap?.dispose(); m.roughnessMap?.dispose();
          m.metalnessMap?.dispose(); m.emissiveMap?.dispose(); m.aoMap?.dispose();
          m.dispose();
        }
      }
    });
  }
  function clearGlbCharacter() {
    if (glbGroup) { scene.remove(glbGroup); disposeGlbGroup(glbGroup); glbGroup = null; glbBones = null; }
    for (const l of glbLights) scene.remove(l);
    glbLights = [];
    rig.group.visible = true;
  }
  function loadGlbCharacter(style: number) {
    const cfg = GLB_STYLES[style];
    if (!cfg) return;
    const seq = ++glbLoadSeq;
    new GLTFLoader().load(cfg.url, (gltf) => {
      if (seq !== glbLoadSeq) { disposeGlbGroup(gltf.scene); return; } // user switched again mid-load
      const wrap = new THREE.Group();
      wrap.add(gltf.scene);
      // Normalize: ground the feet at y=0 inside the wrapper and scale the
      // character to the procedural dancer's height so the camera/stage fit.
      const bbox = new THREE.Box3().setFromObject(gltf.scene);
      const h = Math.max(0.01, bbox.max.y - bbox.min.y);
      glbBaseScale = 1.78 / h;
      gltf.scene.position.y = -bbox.min.y;
      wrap.scale.setScalar(glbBaseScale);
      wrap.rotation.y = cfg.yaw;
      // Collect the mapped bones + bind-pose quaternions for the retarget.
      const bones: Record<string, THREE.Bone> = {};
      gltf.scene.updateMatrixWorld(true);
      gltf.scene.traverse((obj) => {
        if (!(obj as THREE.Bone).isBone) return;
        const n = obj.name;
        for (const key of Object.keys(cfg.map)) {
          const want = cfg.map[key];
          const hit = cfg.suffix ? n.toLowerCase().endsWith(want) : n === want;
          if (hit && !bones[key]) bones[key] = obj as THREE.Bone;
        }
        const mesh = obj as unknown as THREE.Mesh;
        if (mesh.isMesh) mesh.frustumCulled = false;
      });
      gltf.scene.traverse((obj) => { const m = obj as THREE.Mesh; if (m.isMesh) m.frustumCulled = false; });
      for (const key of Object.keys(bones)) {
        const b = bones[key];
        const p = new THREE.Quaternion();
        (b.parent || b).getWorldQuaternion(p);
        b.userData.p = p;
        b.userData.pInv = p.clone().invert();
        b.userData.bind = b.quaternion.clone();
      }
      glbBones = bones;
      glbArmDown = cfg.armDown;
      glbGroup = wrap;
      scene.add(wrap);
      // PBR characters need real lights (the whole neon stage is unlit
      // materials) — a compact concert rig, added only while a GLB is up.
      const hemi = new THREE.HemisphereLight(0x99aaff, 0x2a1440, 1.35);
      const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(2.2, 4.2, 3.2);
      const rim = new THREE.PointLight(0x00e5ff, 14, 9); rim.position.set(-2.4, 2.2, -1.4);
      glbLights = [hemi, key, rim];
      for (const l of glbLights) scene.add(l);
      rig.group.visible = false; // the star hands the stage to the character
    }, undefined, () => { /* load failed → keep the alien */ });
  }
  // Apply the lead's spring state onto the character's skeleton.
  function applyPoseToBones(bounce: number) {
    if (!glbBones) return;
    const S = dancers[0].cur;
    const rot = (key: string, ex: number, ey: number, ez: number) => {
      const b = glbBones![key];
      if (!b) return;
      _gE.set(ex, ey, ez, 'XYZ');
      _gQ.setFromEuler(_gE);
      _gQ2.copy(b.userData.pInv as THREE.Quaternion).multiply(_gQ)
        .multiply(b.userData.p as THREE.Quaternion).multiply(b.userData.bind as THREE.Quaternion);
      b.quaternion.copy(_gQ2);
    };
    // Bulkier body → wider clearance so hands hug the sides, never the belly.
    const ac = armClear(S, 0.42);
    rot('hips', 0, 0, S.hipsRz * 0.55);
    rot('torso', S.torsoRx, S.torsoRy, S.torsoRz);
    rot('head', S.headRx, S.headRy, 0);
    rot('shL', S.shLx, 0, glbArmDown - ac.shLz);
    rot('shR', S.shRx, 0, -glbArmDown - ac.shRz);
    rot('fAL', S.fALx, 0, -ac.fALz);
    rot('fAR', S.fARx, 0, -ac.fARz);
    rot('legL', S.legLx, 0, S.legLz);
    rot('legR', S.legRx, 0, S.legRz);
    rot('kneeL', S.kneeLx + bounce * 0.34, 0, 0);
    rot('kneeR', S.kneeRx + bounce * 0.28, 0, 0);
  }
  const activeDancers = () => {
    const base = partyMode >= 1 ? dancers : [dancers[0]];
    return weddingMode && brideD ? base.concat(brideD) : base;
  };

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

  // ── STADIUM mode (party mode 3) — a Super-Bowl-halftime bowl: ~80,000
  // crowd "phone lights" as ONE animated Points draw call (each dot bobs
  // and twinkles per-vertex in the shader — zero CPU per frame), a dark
  // elliptical bowl shell with a glowing rim, four light towers, two mega
  // screens, stage-edge glow bars, and a drone camera that flies the bowl.
  const STADIUM_N = 80000;
  let stadiumGroup: THREE.Group | null = null;
  let stadiumPtsMat: THREE.ShaderMaterial | null = null;
  let stadiumPtsGeo: THREE.BufferGeometry | null = null;
  let stadiumScreens: THREE.MeshBasicMaterial | null = null;
  let stadiumRimMat: THREE.MeshBasicMaterial | null = null;
  function ensureStadium() {
    if (stadiumGroup) return;
    stadiumGroup = new THREE.Group();
    stadiumGroup.visible = false;
    // The entire bowl (crowd points, rim, towers, backdrop, screens, ground)
    // lives in this group — the STAGE (dancers/beam/floor/spots) does NOT — so
    // scaling the group blows the arena up to true stadium size around a
    // normal-size stage at the center. Bigger bowl also means the 80k dots
    // spread over far more pixels, so per-dot overdraw (the old white-wall
    // washout) drops for free.
    const ST = 2.6;
    stadiumGroup.scale.setScalar(ST);
    scene.add(stadiumGroup);

    // 80K crowd lights across three elliptical tiers — laid out with real
    // STRUCTURE, not a random scatter: 16 angular sections separated by
    // dark aisles, and a dark gap between each of the 3 tiers. A borderless
    // random cloud of 80,000 dots reads as a fuzzy haze no matter how the
    // shading is tuned (found via testing — "too much light, unclear" was
    // the actual complaint); real gaps are what make the eye parse it as
    // "stadium seating" instead of "glowing mist".
    const SECTIONS = 16;
    const AISLE_FRAC = 0.13; // fraction of each section's angular width left empty
    const sectionSpan = (Math.PI * 2) / SECTIONS;
    const pos = new Float32Array(STADIUM_N * 3);
    const phase = new Float32Array(STADIUM_N);
    const size = new Float32Array(STADIUM_N);
    const col = new Float32Array(STADIUM_N * 3);
    for (let i = 0; i < STADIUM_N; i++) {
      const tier = i % 3;
      const f = Math.random() * 0.82; // stop short of the tier's outer edge → a real gap before the next tier
      // Tight bowl — the stands start right at the field's edge (Super
      // Bowl close-crowd feel), climbing outward/upward in three tiers.
      const a = 4.6 + tier * 2.1 + f * 1.6;   // x semi-axis, gap baked in via the 2.1 step vs 1.6*0.82 max fill
      const b = a * 0.72;                      // z semi-axis
      const section = Math.floor(Math.random() * SECTIONS);
      const ang = section * sectionSpan + (Math.random() * (1 - AISLE_FRAC) + AISLE_FRAC / 2) * sectionSpan;
      pos[i * 3] = Math.cos(ang) * a;
      pos[i * 3 + 1] = 0.9 + tier * 1.75 + f * 1.15 + Math.random() * 0.14;
      pos[i * 3 + 2] = Math.sin(ang) * b - 0.6;
      phase[i] = Math.random();
      size[i] = 0.85 + Math.random() * 0.75;
      // Each of the 16 sections gets ONE dominant color (like real stadium
      // card-stunt blocks / team-colored sections) with a little per-dot
      // variance, instead of fully random per-dot color — reads as
      // organized crowd sections rather than confetti noise.
      const SECTION_COLORS: [number, number, number][] = [
        [1.0, 0.93, 0.8], [0.45, 0.8, 1.0], [0.8, 0.5, 1.0], [1.0, 0.45, 0.75],
        [1.0, 0.93, 0.8], [0.4, 1.0, 0.7], [0.45, 0.8, 1.0], [1.0, 0.8, 0.3],
      ];
      const sc = SECTION_COLORS[section % SECTION_COLORS.length];
      const v = 0.85 + Math.random() * 0.15;
      col[i * 3] = sc[0] * v; col[i * 3 + 1] = sc[1] * v; col[i * 3 + 2] = sc[2] * v;
    }
    const ptsGeo = new THREE.BufferGeometry();
    ptsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    ptsGeo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    ptsGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    ptsGeo.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
    // NormalBlending, not additive: 80,000 overlapping additive dots have
    // NO ceiling — however dim each one is, enough overlap always sums to
    // white (found via testing: shrinking size/alpha again and again never
    // fully fixed it, because the accumulation is unbounded by construction).
    // Normal alpha blending composites instead of summing, so it's immune
    // to overdraw regardless of density — the correct tool for a crowd this
    // size, same reason real "starfield" crowd shaders use it.
    stadiumPtsMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uEnergy: { value: 0.3 }, uPulse: { value: 0 } },
      transparent: true, depthWrite: false, blending: THREE.NormalBlending,
      vertexShader: /* glsl */`
        attribute float aPhase;
        attribute float aSize;
        attribute vec3 aCol;
        uniform float uTime; uniform float uEnergy;
        varying vec3 vCol; varying float vTw; varying float vNear;
        void main() {
          vec3 p = position;
          // every fan bounces to the shared beat clock with their own phase
          // (toned down from the first pass — a smaller bob keeps sections
          // reading as steady blocks instead of a shimmering blur)
          p.y += sin(uTime * (1.6 + fract(aPhase * 3.1) * 1.4) + aPhase * 40.0) * 0.07 * uEnergy;
          vCol = aCol;
          vTw = 0.65 + 0.35 * sin(uTime * (2.0 + fract(aPhase * 7.3) * 3.0) + aPhase * 80.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          // Near-fade: insurance in case the drone ever grazes the stands
          // (the flight path is kept outside the bowl radius on purpose).
          vNear = smoothstep(1.0, 3.0, -mv.z);
          gl_PointSize = min(aSize * (52.0 / max(1.0, -mv.z)), 7.0);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */`
        precision highp float;
        uniform float uPulse;
        varying vec3 vCol; varying float vTw; varying float vNear;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          // Sharp-edged dot (tight falloff band, not a soft cloud): with
          // 80,000 of these on screen, a wide soft edge is what made
          // neighboring dots visually melt into one glowing haze. A crisp
          // edge keeps each one legible as an individual point of light —
          // still with a thin anti-aliased rim so it doesn't look pixelated.
          float a = smoothstep(0.5, 0.4, d);
          // NormalBlending composites rather than sums, so full brightness
          // is safe here regardless of how many dots overlap on screen —
          // each pixel settles on whichever dot(s) actually cover it.
          vec3 c = vCol * (0.75 + vTw * 0.4 + uPulse * 0.3);
          gl_FragColor = vec4(c, a * 0.95 * vNear);
        }
      `,
    });
    const pts = new THREE.Points(ptsGeo, stadiumPtsMat);
    pts.frustumCulled = false;
    stadiumGroup.add(pts);
    stadiumPtsGeo = ptsGeo;

    // Stadium ground — a huge near-black disc so the space between field
    // and stands reads as pitch, not a void.
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(15, 48),
      new THREE.MeshBasicMaterial({ color: 0x0b0b16 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.scale.y = 0.72; // (post-rotation this squashes world Z — elliptical pitch)
    ground.position.set(0, -0.08, -0.6);
    stadiumGroup.add(ground);

    // NOTE: an earlier version of this bowl had a big solid cylinder "wall"
    // meshing the whole stand structure — removed. The flying drone camera
    // orbits (R 5.2-11.2) regularly crossed its DoubleSide surface, and a
    // huge unlit dark backface filling the frame is indistinguishable from
    // "the scene went black" (this was the actual bug, found via a debug
    // probe: camera/fog/bloom values all looked correct while the canvas
    // still rendered solid black). The 80,000-dot crowd + rim ring already
    // read as a stadium shape without a solid prop the camera can clip.
    // NOT registered as a generic accent on purpose: registerAccents' beat
    // breathing (opacity → up to ~1.0) was tuned for tiny eye/joint dots —
    // applied to a torus with a 67-unit circumference under additive
    // blending, it read as a solid white sheet across most of the frame
    // (the actual cause of a "washed out" bowl, more than the point count).
    // Kept deliberately thin and dim, with its own small independent pulse.
    stadiumRimMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(10.7, 0.035, 8, 64), stadiumRimMat);
    rim.rotation.x = Math.PI / 2; rim.scale.y = 0.72; rim.position.set(0, 5.4, -0.6);
    stadiumGroup.add(rim);

    // Four light towers with glowing heads.
    for (const [tx, tz] of [[-9.6, -6.4], [9.6, -6.4], [-9.6, 5.2], [9.6, 5.2]] as [number, number][]) {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(0.22, 7.2, 0.22), new THREE.MeshBasicMaterial({ color: 0x0a0a14 }));
      tower.position.set(tx, 3.6, tz);
      stadiumGroup.add(tower);
      const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 10), headMat);
      head.position.set(tx, 7.3, tz);
      stadiumGroup.add(head);
      registerAccents([headMat]);
    }

    // Distant backdrop wall — reads as "this is an enclosed arena, not
    // dots floating in a void" without repeating the earlier mistake (a
    // solid cylinder that the drone's own flight path clipped through,
    // which looked exactly like a black-screen bug). Placed at radius 20,
    // far outside the drone's absolute worst-case reach (R maxes out
    // around ~15 only at minimum zoom) — the camera can never touch it —
    // and built from 16 separate vertical light strips (matching the
    // crowd's section layout) plus dark filler panels, so it reads as
    // structure with real gaps, not another big flat sheet.
    const backdropMat = new THREE.MeshBasicMaterial({ color: 0x07060d, side: THREE.DoubleSide });
    const stripMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false });
    registerAccents([stripMat]);
    const backdropR = 20;
    for (let s = 0; s < SECTIONS; s++) {
      const midAng = (s + 0.5) * sectionSpan;
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(backdropR * sectionSpan * 0.94, 9), backdropMat);
      panel.position.set(Math.cos(midAng) * backdropR, 4.5, Math.sin(midAng) * backdropR * 0.72 - 0.6);
      panel.rotation.y = -midAng + Math.PI / 2;
      stadiumGroup.add(panel);
      const edgeAng = s * sectionSpan;
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 9.2, 0.12), stripMat);
      strip.position.set(Math.cos(edgeAng) * backdropR, 4.5, Math.sin(edgeAng) * backdropR * 0.72 - 0.6);
      stadiumGroup.add(strip);
    }

    // Two mega screens flanking the stage (grayscale gradient canvas,
    // tinted live from the theme + pulsing on the beat).
    const sc = document.createElement('canvas'); sc.width = 128; sc.height = 64;
    const sg = sc.getContext('2d')!;
    const sgrad = sg.createLinearGradient(0, 64, 0, 0);
    sgrad.addColorStop(0, '#333'); sgrad.addColorStop(0.5, '#bbb'); sgrad.addColorStop(1, '#666');
    sg.fillStyle = sgrad; sg.fillRect(0, 0, 128, 64);
    const screenTex = new THREE.CanvasTexture(sc);
    stadiumScreens = new THREE.MeshBasicMaterial({ map: screenTex, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    for (const sx of [-6.8, 6.8]) {
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.3), stadiumScreens);
      screen.position.set(sx, 3.6, -4.6);
      screen.rotation.y = sx > 0 ? -0.5 : 0.5;
      stadiumGroup.add(screen);
    }

    // Stage-edge glow bars around the performance floor. These frame the
    // real (unscaled) stage, so divide out the group scale on both size and
    // position — otherwise they'd blow up into a huge floor outline.
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
    registerAccents([edgeMat]);
    for (const [w2, d2, ex, ez] of [[4.6, 0.07, 0, 1.45], [4.6, 0.07, 0, -2.6], [0.07, 4.12, -2.3, -0.58], [0.07, 4.12, 2.3, -0.58]] as [number, number, number, number][]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(w2, 0.05, d2), edgeMat);
      bar.position.set(ex / ST, -0.03 / ST, ez / ST);
      bar.scale.setScalar(1 / ST);
      stadiumGroup.add(bar);
    }
    applyQTier(); // a device that already shed quality gets the thinner crowd immediately
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
  let userZoom = 1; // 🔍 button — >1 brings the avatars closer/bigger
  // Settings-panel-driven tuning knobs — all default to a neutral value so
  // an app that never calls these setters looks identical to before.
  let danceSpeedMult = 1;      // dance step rate vs. the song's real tempo
  let mirrorOn = false;        // flip the whole stage horizontally
  let cameraStyleMode = 0;     // 0 cinematic sway · 1 static · 2 handheld
  let shakeMult = 1;           // bass-drop camera-shake multiplier
  let confettiMult = 1, sparkMult = 1, hazeMult = 1, beamMult = 1, finMult = 1;
  let stadiumDensityOverride = -1; // -1 = auto (qTier), else 20000/50000/80000
  let stadiumCamStyle = 0;     // 0 drone orbit · 1 fixed wide · 2 stage-cam close
  let crewSize = 2;            // backup dancers in crew/party modes (2, 4, or 6)
  // Vibe / atmosphere — how energetic vs. calm the whole show reads.
  //   0 auto (derive calm from the song's tempo) · 1 party (always energetic)
  //   2 chill (lounge/flowing) · 3 shanti (deep ambient/meditative).
  // `calm` is the smoothed 0..1 result that actually drives softer springs,
  // thicker atmosphere haze, slower sweeps, a mellower energy ceiling, and
  // the flowing chill move pool — so vibe changes ease in instead of snapping.
  let vibeMode = 0;
  let calm = 0;
  // Wedding mode — bride & groom couple choreography, hora crew, chuppah,
  // hearts, and a warm gold/rose grade over the whole light rig.
  let weddingMode = false;
  const WED_GOLD: [number, number, number] = [1.0, 0.78, 0.35];
  const WED_ROSE: [number, number, number] = [1.0, 0.55, 0.6];
  let lastFrameTime = 0, warmT = 0, fpsT = 0, fpsN = 0, lowStreak = 0;
  function applyQTier() {
    if (qTier >= 1) bloom.enabled = false;
    if (qTier >= 2) renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));
    applyStadiumDensity();
  }
  // Weak devices auto-shed stadium crowd density (80K → 36K → 14K); the
  // user's own density preference (settings panel) is a further cap on top
  // of whatever the device can handle, never an override that fights it.
  function applyStadiumDensity() {
    if (!stadiumPtsGeo) return;
    const autoCapacity = qTier >= 2 ? 14000 : qTier >= 1 ? 36000 : STADIUM_N;
    const userCap = stadiumDensityOverride >= 0 ? stadiumDensityOverride : STADIUM_N;
    stadiumPtsGeo.setDrawRange(0, Math.min(autoCapacity, userCap));
  }

  // Begin the next move in the routine, from step 0. Called on the 8-beat
  // auto-boundary OR forced early by a sung lyric line (syncLine) so the
  // choreography turns over exactly with the vocal.
  function startNewMove() {
    // Wrap any accumulated full turn so the next move starts facing front
    // instead of spring-unwinding backwards through 360°.
    for (const d of dancers) {
      const wrap = Math.round(d.cur.rootRy / (Math.PI * 2)) * Math.PI * 2;
      d.cur.rootRy -= wrap; d.tgt.rootRy -= wrap;
    }
    currentMoveIdx = nextMoveIdx();
    stepInPattern = 0;
    // Punchy moves hold only 4 beats (turn over twice as fast → twice the
    // variety); long moves (a full spin, a slow wave) keep the full 8.
    curMoveHold = LONG_MOVES.has(currentMoveIdx) ? 8 : 4;
    // A signature "hero" move lands with an extra visual punch + a fresh
    // floor shockwave so the choreography's peak moments read as peaks.
    if (SIGNATURES.includes(currentMoveIdx)) {
      beatPulse = Math.max(beatPulse, 1.2);
      for (const rr of rings) if (rr.age > 0.5) { rr.age = 0; break; }
    }
  }
  let curMoveHold = 8;

  // Apply each dancer's CURRENT move at its current step. The lead (dancer 0)
  // dances the choreographed routine; backups freestyle their own moves —
  // EXCEPT during the unison window (every 4th phrase) when the whole crew
  // snaps to the lead's move on the same step: the classic "everyone hits the
  // drop together" moment, made powerful precisely because the rest of the
  // time they're all doing different things.
  function applyStep() {
    const unison = phraseNo % 4 === 3;
    const act = activeDancers();
    for (let i = 0; i < act.length; i++) {
      const d = act[i];
      // The bride dances the couple routine WITH the groom, same move same
      // step — their inward facing + close spacing sells "dancing together".
      if (i === 0 || (weddingMode && d === brideD)) { setPoseFor(d, MOVES[currentMoveIdx](stepInPattern % BEATS_PER_PATTERN)); continue; }
      if (unison) { d.moveIdx = currentMoveIdx; d.stepIn = stepInPattern; } // lock to lead
      setPoseFor(d, MOVES[d.moveIdx](d.stepIn % BEATS_PER_PATTERN));
    }
  }

  // One beat of the show: pulse the lights, ripple the floor under the
  // lead's alternating feet, and drive the choreography step chart.
  function fireBeat(now2: number) {
    lastBeat = now2;
    beatPulse = Math.max(beatPulse, 1);
    beatCount++;
    if (beatCount % 4 === 0) beatPulse = Math.max(beatPulse, 1.15); // downbeat accent (every bar)
    for (const f of fins) f.target = 0.35 + Math.random() * 0.65;
    // Footstep ripple — spawns under the lead dancer's alternating foot,
    // not the stage center, so the floor visibly reacts to the footwork.
    const r = rings[ringCursor];
    ringCursor = (ringCursor + 1) % RING_COUNT;
    r.age = 0;
    const lead = dancers[0];
    r.mesh.position.x = lead.baseX + lead.cur.rootX + (beatCount % 2 ? 0.13 : -0.13);
    if (accentHold > 0) { accentHold--; return; } // holding a bass-drop pose
    // When real sung lines are arriving (syncLine fired recently) THEY drive
    // move changes, so the dance turns over on the vocal; the beat clock then
    // only auto-advances a move if a line hasn't come for a while (a long
    // instrumental stretch). With no synced lyrics, fall back to a clean
    // 8-beat auto-advance so an instrumental / manual song still choreographs.
    const lineDriven = now2 - lastLineAt < 9000;
    // Auto-advance on the move's own hold (4 for punchy, 8 for long moves).
    // When lyric lines are driving, give a longer safety cap so a sparse
    // instrumental stretch still turns the move over.
    const autoCap = lineDriven ? Math.max(12, curMoveHold * 2) : curMoveHold;
    if (stepInPattern >= autoCap) startNewMove();
    // Each backup that just finished its own little phrase grabs a FRESH random
    // move from the same energy pool → the crew is always doing a mix. At a
    // wedding the crew circles the couple with the hora set instead.
    const pool = weddingMode ? POOL_HORA : activePool();
    for (let i = 1; i < dancers.length; i++) {
      const d = dancers[i];
      if (!d.rig.group.visible) continue;
      if (d.stepIn >= d.phraseLen) { d.moveIdx = pool[Math.floor(Math.random() * pool.length)]; d.stepIn = 0; d.phraseLen = 6 + Math.floor(Math.random() * 5); }
    }
    applyStep();
    stepInPattern++;
    for (let i = 1; i < dancers.length; i++) { const d = dancers[i]; if (d.rig.group.visible) d.stepIn++; }
  }

  // A real musical phrase boundary: a new sung lyric line just started. This
  // is the tightest sync signal the app has (LRC line timestamps), so lock
  // the choreography to it — re-anchor the beat grid to the vocal and turn
  // the move over exactly on the word, giving a "perfectly on the song" read.
  function syncLine() {
    const n = performance.now();
    if (!playing) return;
    if (n - lastLineAt < 350) return; // debounce rapid re-fires
    lastLineAt = n;
    mouthPulse = 1; // the dancers visibly "sing" the new line
    // Re-anchor the beat phase so the next internal beat lands just after the
    // line instead of drifting — keeps the groove locked to the vocal.
    lastBeat = n - Math.min(tempoMs * 0.2, 90);
    beatPulse = Math.max(beatPulse, 0.95); // accent the line
    if (accentHold > 0) return; // don't stomp a held bass-drop pose
    startNewMove();
    applyStep();
    stepInPattern++;
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) return;
    // rawDt for the fps watchdog, clamped dt for animation: the clamp keeps
    // a GC pause from making the scene leap, but feeding CLAMPED time into
    // the watchdog makes its clock run 10x slow at very low framerates —
    // exactly when it's needed most (found at 2fps under SwiftShader: the
    // shed that should fire in ~5s took minutes).
    const rawDt = lastFrameTime ? (now - lastFrameTime) / 1000 : 0.016;
    const dt = Math.min(rawDt, 0.05);
    lastFrameTime = now;
    if (qTier < 2) {
      warmT += rawDt; fpsT += rawDt; fpsN++;
      if (warmT > 2.5 && fpsT >= 1) {
        const fps = fpsN / fpsT; fpsT = 0; fpsN = 0;
        if (fps < 40) { if (++lowStreak >= 2) { lowStreak = 0; qTier++; applyQTier(); } }
        else lowStreak = 0;
      }
    }
    const t = (now - start) / 1000;
    // Vibe → calm: party is always 0; chill/shanti are fixed; auto reads the
    // song's tempo (fast → energetic, slow → calm). Eased slowly so switching
    // vibe (or a tempo change between songs) melts between the two looks.
    let calmTarget: number;
    if (vibeMode === 1) calmTarget = 0;
    else if (vibeMode === 2) calmTarget = 0.65;
    else if (vibeMode === 3) calmTarget = 1;
    // Auto engages calm only for genuinely slow songs (tempo ≥ ~620ms/beat);
    // the old (tempo-500)/200 curve was damping ordinary pop tracks too —
    // softer springs + slower beats compounded into "barely dancing".
    else calmTarget = Math.max(0, Math.min(1, (tempoMs - 620) / 220)) * 0.8; // auto
    calm += (calmTarget - calm) * Math.min(1, dt * 1.2);
    // Calm pulls the energy ceiling down so lights/motion stay gentle but alive.
    const targetEnergy = playing ? 1 - calm * 0.38 : 0.25;
    energy += (targetEnergy - energy) * 0.04;
    // Calm thickens the stage haze into a dreamy atmospheric depth (left thin
    // in the stadium, where the far bowl must stay visible).
    if (scene.fog) (scene.fog as THREE.FogExp2).density = partyMode === 3 ? 0.026 : 0.085 * (1 + calm * 0.5);

    // Beat sources, in priority order:
    // 1. LIVE — real onsets detected from the microphone (the room's actual
    //    Spotify audio) via liveBeatTick(); overrides the internal clock and
    //    falls back automatically if the mic goes quiet for a while.
    // 2. Internal — a pulse every tempoMs (derived from the song's real LRC
    //    line timing, or from the live BPM estimate when the mic runs).
    if (playing) {
      if (liveMode) {
        if (now - lastLiveTick > 2500) liveMode = false; // mic went quiet → internal clock resumes
      } else if (now - lastBeat > (tempoMs / danceSpeedMult) * (1 + Math.max(0, calm - 0.45) * 1.6)) {
        // Only genuine chill/shanti stretches the beat into languid holds;
        // mild auto-calm keeps the full-rate groove.
        fireBeat(now);
      }
    }
    if (!playing) for (const d of activeDancers()) setPoseFor(d, BASE_POSE); // paused → calm idle
    beatPulse *= 0.9;

    // Integrate the pose springs — underdamped (slight overshoot) so every
    // pose change lands with a physical "hit" instead of a linear glide.
    {
      // Calm softens the springs: lower stiffness + higher damping turns the
      // sharp "hit with overshoot" into a smooth, flowing glide (no snap).
      const kSpring = 130 - calm * 72, damp = 15 + calm * 11;
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
    beamMat.uniforms.uPulse.value = beatPulse * energy * beamMult;
    waveMat.uniforms.uTime.value = t;
    waveMat.uniforms.uEnergy.value = energy;
    waveMat.uniforms.uPulse.value = beatPulse * energy;
    (floorMat as THREE.MeshBasicMaterial).opacity = 0.25 + beatPulse * energy * 0.3;
    ledFloorMat.uniforms.uTime.value = t;
    ledFloorMat.uniforms.uPulse.value = beatPulse * energy;
    ledFloorMat.uniforms.uEnergy.value = energy;
    if (weddingMode) (ledFloorMat.uniforms.uCol.value as THREE.Vector3).set(1.0, 0.78, 0.4);
    else (ledFloorMat.uniforms.uCol.value as THREE.Vector3).set(currentTheme.b[0], currentTheme.b[1], currentTheme.b[2]);

    for (const f of fins) {
      f.val += (f.target * energy - f.val) * 0.15;
      f.mat.opacity = (0.15 + f.val * 0.65) * finMult;
      f.mesh.scale.y = 0.8 + f.val * 1.8;
    }

    // Spotlights sweep continuously and strobe hard on the beat.
    const spotSweep = 1 - calm * 0.55; // calm → slow, lazy spotlight drift
    for (const sp of spots) {
      sp.mesh.rotation.z = Math.sin(t * 0.65 * spotSweep + sp.phase) * 0.38;
      sp.mesh.rotation.x = Math.sin(t * 0.42 * spotSweep + sp.phase * 2) * 0.2;
      sp.mat.opacity = (0.035 + calm * 0.03 + beatPulse * 0.15 * (1 - calm * 0.5)) * energy;
      const c = weddingMode ? (sp.colIdx === 0 ? WED_GOLD : WED_ROSE) : (sp.colIdx === 0 ? currentTheme.c : currentTheme.b);
      sp.mat.color.setRGB(c[0], c[1], c[2]);
    }

    // Wet floor + subwoofer cones react to the theme + bass.
    floorReflMat.uniforms.uTime.value = t;
    floorReflMat.uniforms.uPulse.value = beatPulse * energy;
    if (weddingMode) (floorReflMat.uniforms.uCol.value as THREE.Vector3).set(1.0, 0.75, 0.42);
    else (floorReflMat.uniforms.uCol.value as THREE.Vector3).set(currentTheme.b[0], currentTheme.b[1], currentTheme.b[2]);
    const punch = 1 + beatPulse * energy * 0.7; // cones jump forward on the beat
    for (const sub of subs) {
      for (const cone of sub.cones) cone.scale.z = punch;
      sub.glow.opacity = 0.2 + beatPulse * energy * 0.6;
      if (weddingMode) sub.glow.color.setRGB(WED_GOLD[0], WED_GOLD[1], WED_GOLD[2]);
      else sub.glow.color.setRGB(currentTheme.c[0], currentTheme.c[1], currentTheme.c[2]);
    }

    // Apply spring pose + a continuous micro-groove layer (breathing sway,
    // beat throb in the knees/root) so the body never fully freezes even
    // during held poses. Runs per active dancer, with a per-dancer phase on
    // the micro-motion so the crew doesn't breathe in eerie unison.
    const bounceCycle = ((now - lastBeat) / tempoMs);
    const bounce = Math.max(0, Math.sin(Math.PI * Math.min(1, bounceCycle * 1.4))) * energy;
    // Theme accents (eyes/cores/joints) breathe with the beat.
    for (const m of accentMats) m.opacity = 0.72 + beatPulse * 0.28;
    // Mouths glow with the music and flare hard on each sung lyric line.
    mouthPulse *= Math.exp(-dt * 2.4);
    const mOp = 0.16 + energy * 0.24 + mouthPulse * 0.6;
    for (const m of mouthMats) m.opacity = mOp;
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
      dg.group.position.y = -0.05 + S.rootY - bounce * 0.09;
      dg.group.position.x = d.baseX + S.rootX;
      dg.group.position.z = d.baseZ;
      dg.group.scale.x = mirrorOn ? -Math.abs(dg.group.scale.x || 1) : Math.abs(dg.group.scale.x || 1);
      dg.group.rotation.y = S.rootRy + d.faceOff + Math.sin(tp * 0.4) * 0.04 * energy;
      dg.hips.rotation.z = S.hipsRz + Math.sin(tp * 2.0) * 0.02 * energy;
      dg.torso.rotation.x = S.torsoRx;
      dg.torso.rotation.y = S.torsoRy + Math.sin(tp * 1.1) * 0.03 * energy;
      dg.torso.rotation.z = S.torsoRz;
      // Visible breathing — the ribcage swells on a slow cycle, stronger at
      // rest, subtler mid-performance.
      const breath = (Math.sin(tp * 1.9) + 1) * 0.5 * (1 - energy * 0.4);
      dg.torso.scale.set(1 + breath * 0.022, 1 + breath * 0.012, 1 + breath * 0.03);
      dg.head.rotation.x = S.headRx + Math.sin(tp * 1.7) * 0.02;
      // The lead "works the camera" — between big head moves the gaze eases
      // toward the audience, the stage-performer's connection trick.
      let gaze = 0;
      if (di === 0) {
        const yawToCam = Math.atan2(camera.position.x - (d.baseX + S.rootX), camera.position.z - d.baseZ);
        const rel = yawToCam - (S.rootRy + d.faceOff);
        gaze = Math.max(-0.5, Math.min(0.5, rel)) * 0.3;
      }
      dg.head.rotation.y = S.headRy + gaze + Math.sin(tp * 1.1 + 0.4) * 0.06;
      // Sign flip on the Z axes: poses are authored as "positive = raise
      // the arm", but +Z rotation swings a hanging left arm INWARD through
      // the torso (this was the "body swallows the arms" bug). Negating
      // here makes every raise sweep OUTWARD around the body; authored
      // negatives (e.g. the overhead clap) correctly curl inward above the
      // head where there is nothing to clip through.
      const ac = armClear(S, 0.14);
      dg.shoulderL.rotation.z = -ac.shLz; dg.shoulderL.rotation.x = S.shLx;
      dg.shoulderR.rotation.z = -ac.shRz; dg.shoulderR.rotation.x = S.shRx;
      dg.foreArmL.rotation.z = -ac.fALz; dg.foreArmL.rotation.x = S.fALx;
      dg.foreArmR.rotation.z = -ac.fARz; dg.foreArmR.rotation.x = S.fARx;
      dg.legL.rotation.x = S.legLx; dg.legL.rotation.z = S.legLz;
      dg.legR.rotation.x = S.legRx; dg.legR.rotation.z = S.legRz;
      dg.kneeL.rotation.x = S.kneeLx + bounce * 0.34;
      dg.kneeR.rotation.x = S.kneeRx + bounce * 0.28;
    }
    // The bride's contact shadow tracks her separately (she lives outside the
    // dancerShadows index mapping).
    if (weddingMode && brideD && brideShadow) {
      brideShadow.position.x = brideD.baseX + brideD.cur.rootX;
      const bLift = Math.max(0, brideD.cur.rootY);
      (brideShadow.material as THREE.MeshBasicMaterial).opacity = Math.max(0.08, 0.3 - bLift * 0.6);
    }
    // GLB character lead — mirror the (hidden) procedural lead's root
    // transform onto the wrapper, then retarget the pose onto the skeleton.
    if (avatarStyle !== 0 && glbGroup && glbBones) {
      glbGroup.position.copy(rig.group.position);
      glbGroup.rotation.y = rig.group.rotation.y;
      const sgn = mirrorOn ? -1 : 1;
      glbGroup.scale.set(glbBaseScale * sgn, glbBaseScale, glbBaseScale);
      applyPoseToBones(bounce);
    }

    // Sparks drift upward through the beam, looping back to the floor.
    const posAttr = sparkGeo.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < SPARK_COUNT; i++) {
      let y = posAttr.getY(i) + sparkSpeed[i] * energy * 0.016;
      if (y > 3.2) y = 0;
      posAttr.setY(i, y);
    }
    posAttr.needsUpdate = true;
    sparkMat.opacity = (0.25 + energy * 0.4) * sparkMult;

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
    confettiMat.opacity = Math.min(1, (0.15 + energy * 0.55) * (partyMode === 2 ? 1.9 : partyMode === 1 ? 1.5 : 1) * confettiMult * (1 - calm * 0.85));

    for (let i = 0; i < hazeSprites.length; i++) {
      hazeSprites[i].position.x += Math.sin(t * 0.15 + i) * 0.0015;
      (hazeSprites[i].material as THREE.SpriteMaterial).opacity = (0.06 + Math.sin(t * 0.3 + i) * 0.03) * hazeMult * (1 + calm * 1.6);
    }

    // Wedding hearts drift upward with a gentle side-sway, pulsing with the
    // beat, recycling to the floor when they clear the top of the stage.
    if (weddingMode && heartsGeo && heartsMat && heartSpeed) {
      const hAttr = heartsGeo.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < HEART_N; i++) {
        let y = hAttr.getY(i) + heartSpeed[i] * 0.016;
        if (y > 3.4) y = -0.1;
        hAttr.setY(i, y);
        hAttr.setX(i, hAttr.getX(i) + Math.sin(t * 0.7 + i * 1.7) * 0.0022);
      }
      hAttr.needsUpdate = true;
      heartsMat.opacity = 0.55 + beatPulse * energy * 0.4;
      heartsMat.size = 0.15 + beatPulse * energy * 0.05;
    }

    if (partyMode >= 2) updateCrowd(now, t); // floor crowd dances in stadium too
    if (partyMode === 3 && stadiumPtsMat) {
      stadiumPtsMat.uniforms.uTime.value = t;
      stadiumPtsMat.uniforms.uEnergy.value = energy;
      stadiumPtsMat.uniforms.uPulse.value = beatPulse * energy;
      if (stadiumScreens) {
        stadiumScreens.opacity = 0.3 + beatPulse * energy * 0.45;
        if (weddingMode) stadiumScreens.color.setRGB(WED_GOLD[0], WED_GOLD[1], WED_GOLD[2]);
        else stadiumScreens.color.setRGB(currentTheme.b[0], currentTheme.b[1], currentTheme.b[2]);
      }
      if (stadiumRimMat) {
        stadiumRimMat.opacity = 0.14 + beatPulse * energy * 0.16; // small, deliberate pulse
        if (weddingMode) stadiumRimMat.color.setRGB(WED_ROSE[0], WED_ROSE[1], WED_ROSE[2]);
        else stadiumRimMat.color.setRGB(currentTheme.eye[0], currentTheme.eye[1], currentTheme.eye[2]);
      }
    }

    if (partyMode === 3) {
      // stadiumCamStyle: 0 drone orbit (default broadcast flight) · 1 fixed
      // wide (steady high overview, no flight — for a calmer "poster shot")
      // · 2 stage-cam close (low, near the performers, crowd as backdrop).
      // The bowl was scaled up (see ensureStadium's ST): the crowd now tops
      // out around y≈14 and its outer edge around R≈26 (x) / 19 (z). Every
      // stadium camera must therefore fly ABOVE that height and OUTSIDE that
      // radius, tilted down at the stage — the old rig sat at y 1–6 / R 5–11,
      // i.e. level with and INSIDE the stands, which is exactly the "camera is
      // behind the stands" the user hit.
      if (stadiumCamStyle === 1) {
        // Fixed high overview — a steady press-box shot looking down.
        const bob = Math.sin(t * 0.15) * 0.6;
        camera.position.set(Math.sin(t * 0.04) * 3, 22 + bob, 30);
        camera.lookAt(0, 2, -1.2);
      } else if (stadiumCamStyle === 2) {
        // Stage-cam close — low and near the performers, crowd as a backdrop
        // wall (intentionally the one "inside" shot; still starts outside the
        // stage-edge, below the stands rather than among them).
        camera.position.set(Math.sin(t * 0.2) * 1.6, 1.4 + beatPulse * energy * 0.05, 4.2 / Math.max(0.75, userZoom));
        camera.lookAt(0, 1.1, -1.2);
      } else {
        // STADIUM drone — a broadcast heli/drone flying HIGH ABOVE the rim and
        // OUTSIDE the bowl, gimbal tilted down onto the lit stage. Altitude
        // (18–28) always clears the crowd top (~14); radius (30–42, never less
        // than 28) always clears the bowl's outer edge, so the drone is over
        // the stands looking down, never buried in them. The orbit angle
        // advances steadily; radius/altitude breathe on their own slow
        // rhythms; the lookAt drifts a touch so it feels hand-flown.
        const ft = t * 0.9;
        const R = Math.max(28, (36 + 6 * Math.sin(ft * 0.055)) / Math.max(0.85, userZoom));
        const ang = ft * 0.11;
        const camY = 18 + (Math.sin(ft * 0.041) + 1) * 5; // 18..28, always above the crowd
        camera.position.set(
          Math.sin(ang) * R,
          camY + beatPulse * energy * 0.15,
          Math.cos(ang) * R * 0.8 + 0.4,
        );
        camera.lookAt(Math.sin(ft * 0.09) * 2.0, 2.0 + Math.sin(ft * 0.06) * 0.6, -0.6);
      }
    } else {
      // Subtle cinematic camera sway + a gentle breathing zoom on the beat.
      // Big party pulls the camera back and up so the whole dance floor,
      // crowd and DJ booth frame together. userZoom (the 🔍 button) scales
      // the final distance so the avatars can be made bigger or smaller.
      // cameraStyleMode: 0 cinematic sway (default) · 1 static (locked off)
      // · 2 handheld (bigger, faster jitter, like a phone filming the show).
      camParty += ((partyMode === 2 ? 1 : 0) - camParty) * Math.min(1, dt * 2);
      const swaySc = cameraStyleMode === 1 ? 0 : cameraStyleMode === 2 ? 2.4 : 1;
      const swayFreqSc = (cameraStyleMode === 2 ? 3.1 : 1) * (1 - calm * 0.45); // calm → slower drift
      const jitter = cameraStyleMode === 2 ? (Math.sin(t * 17.3) * 0.012 + Math.sin(t * 23.7) * 0.008) : 0;
      camera.position.x = camBase.x + (Math.sin(t * 0.12 * swayFreqSc) * 0.08 + jitter) * swaySc;
      camera.position.y = camBase.y + (Math.sin(t * 0.09 * swayFreqSc + 1) * 0.04 + jitter * 0.7) * swaySc + camParty * 0.5;
      camera.position.z = (camBase.z + camParty * 1.6) / userZoom - beatPulse * energy * 0.06 * shakeMult;
      camera.lookAt(0, 1.05 - camParty * 0.3, -camParty * 0.9);
    }

    composer.render();
  }
  raf = requestAnimationFrame(frame);

  return {
    setEnergy(p: boolean) { playing = p; },
    setTempo(ms: number) {
      if (Number.isFinite(ms) && ms > 0) tempoMs = ms;
    },
    setParty(mode: boolean | number) {
      partyMode = mode === true ? 1 : mode === false ? 0 : Math.max(0, Math.min(3, Math.round(mode)));
      if (partyMode >= 1) ensureBackups();
      for (let i = 1; i < dancers.length; i++) {
        const on = partyMode >= 1 && i <= crewSize;
        dancers[i].rig.group.visible = on;
        if (dancerShadows[i]) dancerShadows[i].visible = on;
      }
      if (partyMode >= 2) ensureCrowd();
      setCrowdVisible(partyMode >= 2); // the floor crowd stays for stadium
      if (partyMode === 3) ensureStadium();
      if (stadiumGroup) stadiumGroup.visible = partyMode === 3;
      // The bowl sits ~10-20 units out — the default stage fog would erase
      // it, so thin the fog while the stadium is up.
      (scene.fog as THREE.FogExp2).density = partyMode === 3 ? 0.026 : 0.085;
      // The overdraw fix that actually matters is the crowd dot footprint
      // (see the point vertex shader) — that alone tames 80,000 additive
      // dots. bloom.threshold is a SCENE-WIDE knob: cranking it hard also
      // killed bloom on the dancer/beam/spotlights (found via testing —
      // "washed white" flipped straight to "everything went black"). Only
      // a mild nudge here, so the stage keeps its normal glow.
      bloom.threshold = partyMode === 3 ? 0.38 : 0.3;
      bloomBaseStrength = partyMode === 3 ? 0.8 : 0.95;
      resize(); // recompute bloom.strength from the new base immediately
    },
    setTheme(idx: number) { applyTheme(idx); },
    setVeinIntensity(v: number) { figMat.uniforms.uVeinIntensity.value = Math.max(0, Math.min(2, v)); },
    setDanceSpeed(mult: number) { if (Number.isFinite(mult)) danceSpeedMult = Math.max(0.4, Math.min(2.5, mult)); },
    setMirror(on: boolean) { mirrorOn = !!on; },
    setCameraStyle(mode: number) { cameraStyleMode = Math.max(0, Math.min(2, Math.round(mode))); },
    setShakeIntensity(v: number) { shakeMult = Math.max(0, Math.min(3, v)); },
    setConfettiIntensity(v: number) { confettiMult = Math.max(0, Math.min(2.5, v)); },
    setSparkIntensity(v: number) { sparkMult = Math.max(0, Math.min(2.5, v)); },
    setHazeIntensity(v: number) { hazeMult = Math.max(0, Math.min(2.5, v)); },
    setBeamIntensity(v: number) { beamMult = Math.max(0, Math.min(2.5, v)); },
    setFinIntensity(v: number) { finMult = Math.max(0, Math.min(2.5, v)); },
    setStadiumDensity(n: number) { stadiumDensityOverride = n < 0 ? -1 : Math.round(n); applyStadiumDensity(); },
    setStadiumCameraStyle(mode: number) { stadiumCamStyle = Math.max(0, Math.min(2, Math.round(mode))); },
    setVibe(mode: number) { vibeMode = Math.max(0, Math.min(3, Math.round(mode))); },
    setAvatarStyle(style: number) {
      const s = Math.max(0, Math.min(GLB_STYLES.length - 1, Math.round(style)));
      if (s === avatarStyle) return;
      avatarStyle = s;
      clearGlbCharacter(); // also restores the procedural alien immediately
      if (s !== 0) loadGlbCharacter(s); // alien stays visible until the swap lands
    },
    setWedding(on: boolean) {
      weddingMode = !!on;
      if (weddingMode) ensureWedding();
      if (weddingGroup) weddingGroup.visible = weddingMode;
      if (brideD) brideD.rig.group.visible = weddingMode;
      if (brideShadow) brideShadow.visible = weddingMode;
      if (groomHat) groomHat.visible = weddingMode;
      if (groomTie) groomTie.visible = weddingMode;
      // The groom steps aside so the couple shares center stage, both angled
      // slightly toward each other.
      dancers[0].baseX = weddingMode ? -0.42 : 0;
      dancers[0].faceOff = weddingMode ? 0.5 : 0;
      // Warm the dressing: rose-gold petals (confetti is vertex-colored, the
      // material color multiplies it), gold floor glow, champagne fins.
      if (weddingMode) {
        confettiMat.color.setRGB(1.0, 0.82, 0.72);
        floorMat.color.setRGB(1.0, 0.72, 0.42);
        for (const f of fins) f.mat.color.setRGB(1.0, 0.9, 0.7);
      } else {
        confettiMat.color.setRGB(1, 1, 1);
        floorMat.color.setRGB(0.55, 0.35, 1.0);
        for (const f of fins) f.mat.color.setRGB(0.75, 0.92, 1.0);
      }
      // Restart the routine so the couple/hora pools take over immediately.
      routine = []; routinePos = 0; routinePass = 0;
    },
    setCrewSize(n: number) {
      crewSize = Math.max(0, Math.min(ALL_BACKUP_SPOTS.length, Math.round(n)));
      if (partyMode >= 1) ensureBackups();
      for (let i = 1; i < dancers.length; i++) {
        const on = partyMode >= 1 && i <= crewSize;
        dancers[i].rig.group.visible = on;
        if (dancerShadows[i]) dancerShadows[i].visible = on;
      }
    },
    setExposure(v: number) { if (Number.isFinite(v)) renderer.toneMappingExposure = Math.max(0.3, Math.min(2, v)); },
    setZoom(z: number) { if (Number.isFinite(z)) userZoom = Math.max(0.6, Math.min(1.8, z)); },
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
    syncLine() { syncLine(); },
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
      heartTex?.dispose();
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
