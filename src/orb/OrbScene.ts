import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { pikaEmoteSpeak } from '../assistant/pikaVoice';

export type PikaEmote = 'happy' | 'curious' | 'excited' | 'sad' | 'surprised';

export interface CharXform { x: number; y: number; z: number; s: number; px: number; py: number; pz: number; }

export interface OrbHandle {
  setEnergy(v: number): void;
  pikaEmote(emote: PikaEmote): void;
  dispose(): void;
  startBodyDetection(): void;
  stopBodyDetection(): void;
  setCharacter(name: string): void;
  throwPokeball(onOpen?: () => void, onDone?: () => void): void;
  setCharacterTransform(x: number, y: number, z: number, s: number, px: number, py: number, pz: number): void;
  getCharacterTransform(): CharXform;
  resetCharacterTransform(): void;
}

// ============================================================
// Shared constants
// ============================================================
const PI = Math.PI;
const PI2 = PI * 2;

// ============================================================
// Custom post-processing shaders (gold/warm theme)
// ============================================================

// Gold-tinted vignette — never goes black, settles into warm obsidian
const GOLD_VIGNETTE_SHADER = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    offset: { value: 1.0 },
    darkness: { value: 0.65 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - 0.5) * 2.0 * offset;
      float vignette = 1.0 - dot(uv, uv) * darkness;
      vignette = clamp(vignette, 0.0, 1.0);
      // Gold-tinted vignette instead of black
      vec3 vigColor = mix(vec3(0.02, 0.015, 0.005), texel.rgb, vignette);
      gl_FragColor = vec4(vigColor, texel.a);
    }
  `,
};

// ============================================================
// Grid floor shaders — upgraded with data flow + holographic flicker
// ============================================================
const GRID_VERTEX = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GRID_FRAGMENT = /* glsl */`
  uniform float uTime;
  uniform float uEnergy;

  varying vec2 vUv;

  float gHash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float gNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(gHash(i), gHash(i + vec2(1.0, 0.0)), f.x),
               mix(gHash(i + vec2(0.0, 1.0)), gHash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float gFbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += gNoise(p) * a; p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = (vUv - 0.5) * 2.0;
    float dist = length(uv);
    float angle = atan(uv.y, uv.x);

    // Concentric rings pulsing outward
    float rings = sin((dist * 12.0 - uTime * 1.5) * 3.14159) * 0.5 + 0.5;
    rings *= smoothstep(1.0, 0.3, dist);

    // Grid lines
    vec2 grid = abs(fract(uv * 8.0) - 0.5);
    float gridLine = 1.0 - smoothstep(0.0, 0.05, min(grid.x, grid.y));
    gridLine *= smoothstep(1.0, 0.2, dist);

    // Radial lines
    float radialLine = 1.0 - smoothstep(0.0, 0.03, abs(fract(angle / 3.14159 * 8.0) - 0.5));
    radialLine *= smoothstep(1.0, 0.4, dist) * smoothstep(0.05, 0.15, dist);

    // Animated data-flow streaks running outward along radial channels
    float flowSpeed = uTime * 0.8;
    float flow = gFbm(vec2(angle * 4.0, dist * 6.0 - flowSpeed));
    float dataFlow = smoothstep(0.55, 0.85, flow) * smoothstep(1.0, 0.25, dist);

    // Holographic flicker — multi-octave shimmer
    float flicker = 0.85 + 0.15 * gNoise(vec2(uTime * 6.0, dist * 3.0));
    flicker *= 0.9 + 0.1 * sin(uTime * 30.0 + dist * 20.0);

    float combined = max(gridLine * 0.4, rings * 0.3) + radialLine * 0.15 + dataFlow * 0.35;
    combined *= (0.5 + uEnergy * 0.5);

    // Pulse wave from center
    float pulse = smoothstep(0.02, 0.0, abs(dist - fract(uTime * 0.3) * 1.2));
    combined += pulse * 0.6;
    combined *= flicker;

    vec3 color = mix(vec3(0.6, 0.48, 0.2), vec3(0.9, 0.78, 0.4), rings);
    color = mix(color, vec3(1.0, 0.95, 0.85), radialLine * 0.3);
    color = mix(color, vec3(1.0, 0.88, 0.55), dataFlow * 0.6);

    // Better radial falloff — softer outer edge
    float fall = smoothstep(1.0, 0.55, dist) * smoothstep(0.0, 0.08, dist);
    float alpha = combined * fall;
    gl_FragColor = vec4(color, alpha * 0.05);
  }
`;

// ============================================================
// Enhanced particle shaders — multi-layer glow with depth falloff
// ============================================================
const PART_VERT = /* glsl */`
  attribute float aPhase;
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uTime;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float p = 0.7 + sin(uTime * 2.0 + aPhase * 6.28) * 0.3;
    gl_PointSize = aSize * p * (120.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vColor = aColor;
    vAlpha = 0.12 + sin(uTime * 1.5 + aPhase * 3.14) * 0.06;
  }
`;

const PART_FRAG = /* glsl */`
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    // Multi-layer glow with proper energy falloff
    float core = exp(-d * d * 30.0); // Gaussian core
    float inner = exp(-d * d * 8.0) * 0.6; // Inner glow
    float outer = smoothstep(0.5, 0.2, d) * 0.2; // Soft outer halo
    float ring = exp(-pow(d - 0.3, 2.0) * 80.0) * 0.15; // Subtle ring
    float a = core + inner + outer + ring;
    vec3 col = vColor * (1.0 + core * 1.5);
    col += vec3(1.0, 0.95, 0.85) * core * 0.3; // Hot white core
    gl_FragColor = vec4(col, a * vAlpha);
  }
`;

// Pulse ring shader — expanding ring that fades
const PULSE_RING_FRAG = /* glsl */`
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float d = length(c) * 2.0;
    float ring = smoothstep(0.9, 0.95, d) * smoothstep(1.0, 0.97, d);
    vec3 col = vec3(0.9, 0.75, 0.35);
    gl_FragColor = vec4(col, ring * uOpacity);
  }
`;

// Radial glow texture for sprites — eliminates square artifacts
let _glowTex: THREE.Texture | null = null;
function glowTexture(): THREE.Texture {
  if (_glowTex) return _glowTex;
  const s = 128;
  const c = document.createElement('canvas');
  c.width = s; c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.2, 'rgba(255,255,255,0.8)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.25)');
  g.addColorStop(0.8, 'rgba(255,255,255,0.04)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  _glowTex = new THREE.CanvasTexture(c);
  return _glowTex;
}

// Anamorphic / streak lens flare texture (horizontal+vertical soft cross)
let _flareTex: THREE.Texture | null = null;
function flareTexture(): THREE.Texture {
  if (_flareTex) return _flareTex;
  const s = 256;
  const c = document.createElement('canvas');
  c.width = s; c.height = s;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, s, s);
  // soft round halo
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,240,210,0.9)');
  g.addColorStop(0.25, 'rgba(255,225,170,0.35)');
  g.addColorStop(0.6, 'rgba(218,165,32,0.06)');
  g.addColorStop(1, 'rgba(218,165,32,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  // horizontal streak
  const gh = ctx.createLinearGradient(0, s / 2 - 4, s, s / 2 + 4);
  gh.addColorStop(0, 'rgba(255,235,190,0)');
  gh.addColorStop(0.5, 'rgba(255,235,190,0.5)');
  gh.addColorStop(1, 'rgba(255,235,190,0)');
  ctx.fillStyle = gh;
  ctx.fillRect(0, s / 2 - 3, s, 6);
  _flareTex = new THREE.CanvasTexture(c);
  return _flareTex;
}

// ============================================================
// PIKACHU CHARACTER — builder helpers
// ============================================================

// Procedural environment map for the metallic PBR materials.
function createEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture | null {
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x0a0806);
    envScene.add(new THREE.HemisphereLight(0xffeedd, 0x0a0806, 0.8));
    const p1 = new THREE.PointLight(0xffeedd, 15, 30);
    p1.position.set(5, 5, 5);
    envScene.add(p1);
    const p2 = new THREE.PointLight(0xdaa520, 10, 30);
    p2.position.set(-5, 3, -3);
    envScene.add(p2);
    const p3 = new THREE.PointLight(0xffe8c0, 8, 30);
    p3.position.set(0, -2, 6);
    envScene.add(p3);
    const envMap = pmrem.fromScene(envScene, 0, 0.1, 100).texture;
    pmrem.dispose();
    return envMap;
  } catch {
    return null;
  }
}

interface PikachuMaterials {
  yellow: THREE.MeshPhysicalMaterial;
  darkYellow: THREE.MeshPhysicalMaterial;
  cream: THREE.MeshPhysicalMaterial;
  red: THREE.MeshPhysicalMaterial;
  brown: THREE.MeshPhysicalMaterial;
  white: THREE.MeshPhysicalMaterial;
  black: THREE.MeshPhysicalMaterial;
  mouth: THREE.MeshPhysicalMaterial;
  nose: THREE.MeshPhysicalMaterial;
  pink: THREE.MeshPhysicalMaterial;
  tongue: THREE.MeshPhysicalMaterial;
}

function createPikachuMaterials(envMap: THREE.Texture | null): PikachuMaterials {
  const e = envMap ?? undefined;
  const ei = envMap ? 1 : 0;
  return {
    yellow: new THREE.MeshPhysicalMaterial({
      color: 0xFDD835, metalness: 0.0, roughness: 0.52,
      ...(e ? { envMap: e, envMapIntensity: 0.30 * ei } : {}),
      clearcoat: 0.18, clearcoatRoughness: 0.30,
      sheen: 0.20, sheenRoughness: 0.42, sheenColor: new THREE.Color(0xFFE57A),
      emissive: new THREE.Color(0xFDD835), emissiveIntensity: 0.02,
    }),
    darkYellow: new THREE.MeshPhysicalMaterial({
      color: 0xC8A415, metalness: 0.0, roughness: 0.58,
      ...(e ? { envMap: e, envMapIntensity: 0.18 * ei } : {}),
      clearcoat: 0.08, clearcoatRoughness: 0.38,
      emissive: new THREE.Color(0xC8A415), emissiveIntensity: 0.01,
    }),
    cream: new THREE.MeshPhysicalMaterial({
      color: 0xFFFDE7, metalness: 0.0, roughness: 0.48,
      ...(e ? { envMap: e, envMapIntensity: 0.20 * ei } : {}),
      clearcoat: 0.12, clearcoatRoughness: 0.30,
      emissive: new THREE.Color(0xFFFDE7), emissiveIntensity: 0.02,
    }),
    red: new THREE.MeshPhysicalMaterial({
      color: 0xE53935, metalness: 0.0, roughness: 0.45,
      ...(e ? { envMap: e, envMapIntensity: 0.20 * ei } : {}),
      emissive: new THREE.Color(0xE53935), emissiveIntensity: 0.06,
      clearcoat: 0.14, clearcoatRoughness: 0.20,
    }),
    brown: new THREE.MeshPhysicalMaterial({
      color: 0x5D4037, metalness: 0.0, roughness: 0.6,
      ...(e ? { envMap: e, envMapIntensity: 0.18 * ei } : {}),
      clearcoat: 0.08, clearcoatRoughness: 0.4,
    }),
    white: new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.0, roughness: 0.18,
      ...(e ? { envMap: e, envMapIntensity: 0.20 * ei } : {}),
      emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.12,
      clearcoat: 0.28, clearcoatRoughness: 0.10,
    }),
    black: new THREE.MeshPhysicalMaterial({
      color: 0x0A0A0A, metalness: 0.06, roughness: 0.22,
      ...(e ? { envMap: e, envMapIntensity: 0.25 * ei } : {}),
      clearcoat: 0.35, clearcoatRoughness: 0.12,
    }),
    mouth: new THREE.MeshPhysicalMaterial({
      color: 0x8B1A1A, metalness: 0.0, roughness: 0.5,
      ...(e ? { envMap: e, envMapIntensity: 0.12 * ei } : {}),
      clearcoat: 0.1, clearcoatRoughness: 0.3,
    }),
    nose: new THREE.MeshPhysicalMaterial({
      color: 0x151515, metalness: 0.06, roughness: 0.28,
      ...(e ? { envMap: e, envMapIntensity: 0.22 * ei } : {}),
      clearcoat: 0.28, clearcoatRoughness: 0.12,
    }),
    pink: new THREE.MeshPhysicalMaterial({
      color: 0xF48FB1, metalness: 0.0, roughness: 0.58,
      ...(e ? { envMap: e, envMapIntensity: 0.12 * ei } : {}),
      clearcoat: 0.06, clearcoatRoughness: 0.48,
      emissive: new THREE.Color(0xF48FB1), emissiveIntensity: 0.03,
    }),
    tongue: new THREE.MeshPhysicalMaterial({
      color: 0xF06080, metalness: 0.0, roughness: 0.40,
      ...(e ? { envMap: e, envMapIntensity: 0.10 * ei } : {}),
      clearcoat: 0.16, clearcoatRoughness: 0.24,
      emissive: new THREE.Color(0xE84060), emissiveIntensity: 0.04,
    }),
  };
}

interface PikachuParts {
  group: THREE.Group;
  head: THREE.Group;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  leftPupil: THREE.Mesh;
  rightPupil: THREE.Mesh;
  leftEyelid: THREE.Mesh;
  rightEyelid: THREE.Mesh;
  leftEarGroup: THREE.Group;
  rightEarGroup: THREE.Group;
  cheekMatL: THREE.MeshPhysicalMaterial;
  cheekMatR: THREE.MeshPhysicalMaterial;
  tail: THREE.Group;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  mouthMesh: THREE.Mesh;
  tongue: THREE.Mesh;
  sparks: THREE.Group;
  sparkMats: THREE.MeshBasicMaterial[];
  sparkMeshes: THREE.Mesh[];
  auraMat: THREE.MeshBasicMaterial;
  coronaMats: THREE.SpriteMaterial[];
}

function buildPikachu(mats: PikachuMaterials, detail: number): PikachuParts {
  const group = new THREE.Group();
  const headGroup = new THREE.Group();
  const seg = (n: number) => Math.max(8, Math.round(n * detail));

  // PBR materials — respond to scene lighting for true 3D depth
  const mYellow = mats.yellow;
  const mBrown = mats.brown;
  const mBlack = mats.black;
  const mCream = mats.cream;

  // ── Body — round chubby torso ──
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.68, seg(48), seg(48)),
    mYellow,
  );
  body.scale.set(1.1, 1.0, 0.88);
  body.position.set(0, -0.32, 0);
  group.add(body);

  // Cream belly patch on the front — wider, slightly larger for iconic Pikachu look
  const belly = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, seg(32), seg(32)),
    mCream,
  );
  belly.scale.set(0.88, 0.85, 0.32);
  belly.position.set(0, -0.28, 0.38);
  group.add(belly);

  // Lower body — wider at the bottom for a pear/egg silhouette
  const hips = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, seg(24), seg(24)),
    mYellow,
  );
  hips.scale.set(1.22, 0.62, 0.98);
  hips.position.set(0, -0.66, 0.0);
  group.add(hips);

  // Shoulders — narrower at the top so the body tapers up toward the head
  const shoulders = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, seg(32), seg(32)),
    mYellow,
  );
  shoulders.scale.set(0.92, 0.5, 0.78);
  shoulders.position.set(0, 0.2, 0.0);
  group.add(shoulders);

  // Back stripes — two horizontal brown bands across the back
  for (const [sy, width, offset] of [[0.02, 0.60, 0], [-0.22, 0.52, 0.01]] as [number, number, number][]) {
    const stripe = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.048, width, seg(6), seg(12)),
      mBrown,
    );
    stripe.rotation.z = PI / 2;
    stripe.position.set(offset, -0.18 + sy, -0.56);
    stripe.rotation.x = 0.14;
    stripe.scale.set(1.0, 1.0, 0.62);
    group.add(stripe);
  }

  // ── Head — wide round, anime Pikachu's head is wider than tall ──
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, seg(48), seg(48)),
    mYellow,
  );
  // Anime Pikachu has a notably large, round head relative to the body
  head.scale.set(1.24, 1.06, 0.94);
  head.position.set(0, 0.02, 0.04);
  headGroup.add(head);

  // Cheek bulges make the face wider at the bottom
  for (const sx of [-1, 1]) {
    const cheekBulge = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, seg(20), seg(20)),
      mYellow,
    );
    cheekBulge.scale.set(0.62, 0.56, 0.48);
    cheekBulge.position.set(sx * 0.54, -0.13, 0.33);
    headGroup.add(cheekBulge);
  }

  // ── Ears ──
  let leftEarGroup!: THREE.Group;
  let rightEarGroup!: THREE.Group;
  for (const sx of [-1, 1]) {
    const earGroup = new THREE.Group();

    const earBase = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, seg(24), seg(24)),
      mYellow,
    );
    earBase.scale.set(1.05, 3.4, 0.60);
    earBase.position.set(0, 0.42, 0);
    earGroup.add(earBase);

    const earTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.7, seg(16)),
      mYellow,
    );
    earTip.position.set(0, 0.90, 0);
    earTip.scale.set(1.05, 1.0, 0.60);
    earGroup.add(earTip);

    const earBlackBase = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, seg(16), seg(16)),
      mBlack,
    );
    earBlackBase.scale.set(0.90, 1.5, 0.55);
    earBlackBase.position.set(0, 0.96, 0);
    earGroup.add(earBlackBase);

    const earBlackTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.5, seg(14)),
      mBlack,
    );
    earBlackTip.position.set(0, 1.22, 0);
    earBlackTip.scale.set(0.90, 1.0, 0.55);
    earGroup.add(earBlackTip);

    // Pink inner ear — flat ellipse on the front face of the ear
    const innerEar = new THREE.Mesh(
      new THREE.CircleGeometry(0.10, seg(16)),
      mats.pink,
    );
    innerEar.scale.set(0.85, 2.6, 1.0);
    innerEar.position.set(0, 0.44, 0.08);
    innerEar.rotation.x = -0.12;
    earGroup.add(innerEar);

    earGroup.position.set(sx * 0.46, 0.52, -0.04);
    earGroup.rotation.z = -sx * 0.20;
    earGroup.rotation.x = -0.10;
    headGroup.add(earGroup);
    if (sx === -1) leftEarGroup = earGroup;
    else rightEarGroup = earGroup;
  }

  // ── Face — canvas-drawn for true anime look ──
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = 2048;
  faceCanvas.height = 2048;
  const fctx = faceCanvas.getContext('2d')!;
  fctx.clearRect(0, 0, 2048, 2048);

  // All coordinates are in 2048×2048 space (4× the old 512×512)
  const S = 4;
  const drawEllipse = (cx: number, cy: number, rx: number, ry: number, color: string) => {
    fctx.fillStyle = color;
    fctx.beginPath();
    fctx.ellipse(cx * S, cy * S, rx * S, ry * S, 0, 0, PI2);
    fctx.fill();
  };

  // Eyes — large dark ovals with slight inward tilt
  fctx.save();
  fctx.translate(178 * S, 218 * S);
  fctx.rotate(0.08);
  fctx.fillStyle = '#0A0804';
  fctx.beginPath();
  fctx.ellipse(0, 0, 46 * S, 62 * S, 0, 0, PI2);
  fctx.fill();
  fctx.restore();

  fctx.save();
  fctx.translate(334 * S, 218 * S);
  fctx.rotate(-0.08);
  fctx.fillStyle = '#0A0804';
  fctx.beginPath();
  fctx.ellipse(0, 0, 46 * S, 62 * S, 0, 0, PI2);
  fctx.fill();
  fctx.restore();

  // Iris — amber/brown gradient ring to break up flat dark eyes
  for (const [cx, cy, rot] of [[178, 218, 0.08], [334, 218, -0.08]] as [number, number, number][]) {
    fctx.save();
    fctx.translate(cx * S, cy * S);
    fctx.rotate(rot);
    const iGrad = fctx.createRadialGradient(0, 0, 10 * S, 0, 0, 37 * S);
    iGrad.addColorStop(0, 'rgba(8,4,1,1)');
    iGrad.addColorStop(0.36, 'rgba(52,26,6,0.95)');
    iGrad.addColorStop(0.60, 'rgba(98,56,16,0.72)');
    iGrad.addColorStop(0.82, 'rgba(42,20,4,0.5)');
    iGrad.addColorStop(1, 'rgba(8,4,1,0)');
    fctx.fillStyle = iGrad;
    fctx.beginPath();
    fctx.ellipse(0, 0, 40 * S, 54 * S, 0, 0, PI2);
    fctx.fill();
    fctx.restore();
  }

  // Eye highlights — large white upper-right + small lower-left + tiny center sparkle (anime style)
  drawEllipse(196, 196, 18, 22, '#FFFFFF');
  drawEllipse(350, 196, 18, 22, '#FFFFFF');
  drawEllipse(166, 232, 9, 11, '#FFFFFF');
  drawEllipse(318, 232, 9, 11, '#FFFFFF');
  // Center sparkle dot for liveliness ("catch-light" effect)
  drawEllipse(185, 204, 5, 5, 'rgba(255,255,255,0.65)');
  drawEllipse(339, 204, 5, 5, 'rgba(255,255,255,0.65)');
  // Blue-grey lower catch-light
  drawEllipse(174, 238, 4, 3, 'rgba(180,200,220,0.45)');
  drawEllipse(328, 238, 4, 3, 'rgba(180,200,220,0.45)');

  // Red cheeks — bright core fading outward, anime style
  const drawCheek = (cx: number, cy: number) => {
    // Outer soft halo
    const grad = fctx.createRadialGradient(cx * S, cy * S, 4 * S, cx * S, cy * S, 56 * S);
    grad.addColorStop(0, 'rgba(245, 82, 78, 0.92)');
    grad.addColorStop(0.40, 'rgba(229, 57, 53, 0.72)');
    grad.addColorStop(0.72, 'rgba(229, 57, 53, 0.28)');
    grad.addColorStop(1, 'rgba(229, 57, 53, 0)');
    fctx.fillStyle = grad;
    fctx.beginPath();
    fctx.ellipse(cx * S, cy * S, 58 * S, 50 * S, 0, 0, PI2);
    fctx.fill();
    // Bright center spot
    const inner = fctx.createRadialGradient(cx * S, (cy - 6) * S, 0, cx * S, cy * S, 22 * S);
    inner.addColorStop(0, 'rgba(255,160,140,0.55)');
    inner.addColorStop(1, 'rgba(255,100,90,0)');
    fctx.fillStyle = inner;
    fctx.beginPath();
    fctx.ellipse(cx * S, cy * S, 22 * S, 18 * S, 0, 0, PI2);
    fctx.fill();
  };
  drawCheek(108, 298);
  drawCheek(404, 298);

  // Nose — small inverted triangle
  fctx.fillStyle = '#1A1008';
  fctx.beginPath();
  fctx.moveTo(256 * S, 286 * S);
  fctx.lineTo(249 * S, 298 * S);
  fctx.lineTo(263 * S, 298 * S);
  fctx.closePath();
  fctx.fill();

  // Mouth — ω shape
  fctx.strokeStyle = '#1A0505';
  fctx.lineWidth = 4 * S;
  fctx.lineCap = 'round';
  fctx.lineJoin = 'round';
  fctx.beginPath();
  fctx.moveTo(198 * S, 314 * S);
  fctx.quadraticCurveTo(215 * S, 348 * S, 249 * S, 332 * S);
  fctx.quadraticCurveTo(256 * S, 318 * S, 263 * S, 332 * S);
  fctx.quadraticCurveTo(297 * S, 348 * S, 314 * S, 314 * S);
  fctx.stroke();

  // Eyebrows — thick dark angled arcs, classic Pikachu look
  fctx.save();
  fctx.strokeStyle = '#0E0804';
  fctx.lineWidth = 10 * S;
  fctx.lineCap = 'round';
  fctx.beginPath();
  fctx.moveTo(136 * S, 179 * S);
  fctx.quadraticCurveTo(176 * S, 158 * S, 222 * S, 173 * S);
  fctx.stroke();
  fctx.beginPath();
  fctx.moveTo(292 * S, 173 * S);
  fctx.quadraticCurveTo(336 * S, 158 * S, 376 * S, 179 * S);
  fctx.stroke();
  fctx.restore();

  // Top forehead highlight — simulates the rounded 3D head shape
  const foreheadLight = fctx.createRadialGradient(256 * S, 80 * S, 0, 256 * S, 140 * S, 200 * S);
  foreheadLight.addColorStop(0, 'rgba(255,255,220,0.12)');
  foreheadLight.addColorStop(0.6, 'rgba(255,240,180,0.04)');
  foreheadLight.addColorStop(1, 'rgba(255,240,180,0)');
  fctx.fillStyle = foreheadLight;
  fctx.fillRect(0, 0, 2048, 2048);

  // Subtle depth shading — slight darkening at bottom of face for roundness
  const depthShade = fctx.createRadialGradient(256 * S, 320 * S, 40 * S, 256 * S, 280 * S, 240 * S);
  depthShade.addColorStop(0, 'rgba(20,10,2,0)');
  depthShade.addColorStop(0.7, 'rgba(20,10,2,0)');
  depthShade.addColorStop(1, 'rgba(20,10,2,0.22)');
  fctx.fillStyle = depthShade;
  fctx.fillRect(0, 0, 2048, 2048);

  // Soft circular mask
  fctx.globalCompositeOperation = 'destination-in';
  const faceGrad = fctx.createRadialGradient(1024, 1024, 0, 1024, 1024, 1024);
  faceGrad.addColorStop(0, 'rgba(255,255,255,1)');
  faceGrad.addColorStop(0.85, 'rgba(255,255,255,1)');
  faceGrad.addColorStop(1, 'rgba(255,255,255,0)');
  fctx.fillStyle = faceGrad;
  fctx.fillRect(0, 0, 2048, 2048);
  fctx.globalCompositeOperation = 'source-over';

  const faceTexture = new THREE.CanvasTexture(faceCanvas);
  faceTexture.colorSpace = THREE.SRGBColorSpace;

  const faceDecal = new THREE.Mesh(
    new THREE.CircleGeometry(0.80, seg(48)),
    new THREE.MeshBasicMaterial({
      map: faceTexture, transparent: true,
      depthWrite: false, depthTest: false, side: THREE.FrontSide,
    }),
  );
  faceDecal.renderOrder = 2;
  faceDecal.position.set(0, 0.0, 0.72);
  headGroup.add(faceDecal);

  // Invisible eye tracking references (visuals are on canvas)
  let leftEyelid!: THREE.Mesh;
  let rightEyelid!: THREE.Mesh;
  let leftPupil!: THREE.Mesh;
  let rightPupil!: THREE.Mesh;
  let leftEye!: THREE.Mesh;
  let rightEye!: THREE.Mesh;
  const invisMat = new THREE.MeshBasicMaterial({ visible: false });

  for (const sx of [-1, 1]) {
    const eyeRef = new THREE.Mesh(new THREE.SphereGeometry(0.001, 4, 4), invisMat);
    eyeRef.position.set(sx * 0.19, 0.02, 0.72);
    headGroup.add(eyeRef);
    if (sx === -1) leftEye = eyeRef;
    else rightEye = eyeRef;

    const pupilRef = new THREE.Mesh(new THREE.SphereGeometry(0.001, 4, 4), invisMat);
    pupilRef.position.set(sx * 0.19, -0.04, 0.72);
    headGroup.add(pupilRef);
    if (sx === -1) leftPupil = pupilRef;
    else rightPupil = pupilRef;

    const eyelid = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, seg(24), seg(12), 0, PI2, 0, PI * 0.5),
      mYellow,
    );
    eyelid.scale.set(0.85, 0.01, 0.45);
    eyelid.position.set(sx * 0.19, 0.14, 0.720);
    eyelid.rotation.x = -0.08;
    headGroup.add(eyelid);
    if (sx === -1) leftEyelid = eyelid;
    else rightEyelid = eyelid;
  }

  // Mouth ref for animation
  const mouthMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.001, 4, 4),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  mouthMesh.position.set(0, -0.18, 0.720);
  headGroup.add(mouthMesh);

  // Tongue — PBR material so it catches the keyLight
  const tongue = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, seg(12), seg(12)),
    mats.tongue,
  );
  tongue.scale.set(1.5, 0.55, 0.9);
  tongue.position.set(0, -0.2, 0.715);
  headGroup.add(tongue);

  // Cheek glow overlays (subtle additive glow over the canvas cheeks)
  const cheekMatL = new THREE.MeshPhysicalMaterial({
    color: 0xE53935, roughness: 0.5, emissive: 0xE53935, emissiveIntensity: 0.3,
    transparent: true, opacity: 0.18, depthWrite: false, depthTest: false,
  });
  const cheekMatR = new THREE.MeshPhysicalMaterial({
    color: 0xE53935, roughness: 0.5, emissive: 0xE53935, emissiveIntensity: 0.3,
    transparent: true, opacity: 0.18, depthWrite: false, depthTest: false,
  });
  const cheekGeo = new THREE.CircleGeometry(0.12, seg(24));

  const cheekL = new THREE.Mesh(cheekGeo, cheekMatL);
  cheekL.renderOrder = 3;
  cheekL.position.set(-0.44, -0.1, 0.722);
  headGroup.add(cheekL);

  const cheekR = new THREE.Mesh(cheekGeo, cheekMatR);
  cheekR.renderOrder = 3;
  cheekR.position.set(0.44, -0.1, 0.722);
  headGroup.add(cheekR);

  headGroup.position.set(0, 0.50, 0.04);
  group.add(headGroup);

  // Neck — short cylinder blending head into body
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.34, 0.22, seg(20)),
    mYellow,
  );
  neck.position.set(0, 0.28, 0.04);
  group.add(neck);

  // ── Arms — positioned outside body sphere (body radius ~0.75 at shoulder) ──
  const armGeo = new THREE.CapsuleGeometry(0.11, 0.30, seg(8), seg(12));
  const leftArm = new THREE.Mesh(armGeo, mYellow);
  leftArm.position.set(-0.82, 0.04, 0.26);
  leftArm.rotation.z = 0.78;
  leftArm.rotation.x = 0.14;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, mYellow);
  rightArm.position.set(0.82, 0.04, 0.26);
  rightArm.rotation.z = -0.78;
  rightArm.rotation.x = 0.14;
  group.add(rightArm);

  for (const sx of [-1, 1]) {
    const pawX = sx * 0.82 + sx * Math.cos(0.78) * 0.20;
    const pawY = 0.04 - Math.sin(0.78) * 0.20 - 0.02;
    const pawZ = 0.26 + 0.07;
    for (let fi = 0; fi < 3; fi++) {
      const finger = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, seg(6), seg(6)),
        mYellow,
      );
      const fAngle = (fi - 1) * 0.4;
      finger.position.set(
        pawX + sx * Math.cos(fAngle) * 0.05,
        pawY - 0.03 + Math.sin(fAngle) * 0.02,
        pawZ + Math.abs(Math.cos(fAngle)) * 0.02,
      );
      group.add(finger);
    }
  }

  // ── Feet — big flat ovals with toes ──
  const footGeo = new THREE.CapsuleGeometry(0.18, 0.2, seg(10), seg(14));
  for (const sx of [-1, 1]) {
    const foot = new THREE.Mesh(footGeo, mYellow);
    foot.rotation.x = PI / 2;
    foot.rotation.z = sx * 0.08;
    foot.position.set(sx * 0.32, -0.95, 0.26);
    foot.scale.set(1.05, 1.0, 0.78);
    group.add(foot);

    // Three toes
    for (let ti = 0; ti < 3; ti++) {
      const toe = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, seg(8), seg(8)),
        mYellow,
      );
      toe.position.set(
        sx * 0.32 + (ti - 1) * 0.06,
        -1.05,
        0.42,
      );
      toe.scale.set(0.85, 0.55, 1.1);
      group.add(toe);
    }
  }

  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000, transparent: true, opacity: 0.15,
    depthWrite: false, side: THREE.DoubleSide,
  });
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.6, seg(24)),
    shadowMat,
  );
  shadow.position.set(0, -1.12, 0.16);
  shadow.rotation.x = -PI / 2;
  group.add(shadow);

  // ── Tail ──
  const tail = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.2, 0.32);
  shape.lineTo(-0.1, 0.38);
  shape.lineTo(0.25, 0.78);
  shape.lineTo(-0.12, 0.86);
  shape.lineTo(0.35, 1.5);
  shape.lineTo(0.52, 1.4);
  shape.lineTo(0.1, 0.84);
  shape.lineTo(0.42, 0.76);
  shape.lineTo(0.05, 0.32);
  shape.lineTo(0.32, 0.26);
  shape.lineTo(0.0, 0.0);
  const extSettings = { depth: 0.14, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: seg(3) };
  const tailMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, extSettings),
    mYellow,
  );
  tailMesh.position.set(-0.16, 0, -0.07);
  tail.add(tailMesh);

  const tailBase = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.1, 0.2, seg(8), seg(12)),
    mBrown,
  );
  tailBase.position.set(0.04, -0.04, 0.01);
  tail.add(tailBase);

  tail.position.set(0.08, -0.06, -0.52);
  tail.rotation.x = 0.72;   // tilt tip toward viewer so it arcs over the back
  tail.rotation.y = 0.18;
  tail.rotation.z = -0.38;  // lean to Pikachu's right — classic lightning bolt pose
  group.add(tail);

  // ── Sparks — zigzag lightning bolt lines ──
  const sparks = new THREE.Group();
  const sparkMats: THREE.MeshBasicMaterial[] = [];
  const sparkMeshes: THREE.Mesh[] = [];
  const sparkCount = Math.round(10 * detail);

  // Helper: build a zigzag lightning bolt geometry
  function makeLightningGeo(length: number, segs: number): THREE.BufferGeometry {
    const pts: number[] = [];
    for (let s = 0; s <= segs; s++) {
      const t = s / segs;
      const jitter = s === 0 || s === segs ? 0 : (Math.random() - 0.5) * length * 0.35;
      const jitter2 = s === 0 || s === segs ? 0 : (Math.random() - 0.5) * length * 0.18;
      pts.push(jitter, t * length - length * 0.5, jitter2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }

  for (let i = 0; i < sparkCount; i++) {
    const sMat = new THREE.MeshBasicMaterial({
      color: i % 3 === 0 ? 0xFFFFDD : 0xFFE44D,
      transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    sparkMats.push(sMat);
    const boltLen = 0.28 + Math.random() * 0.28;
    const boltGeo = makeLightningGeo(boltLen, Math.round(5 + Math.random() * 4));
    const sMesh = new THREE.Line(boltGeo, sMat) as unknown as THREE.Mesh;
    const angle = (i / sparkCount) * PI2;
    const r = 1.05 + Math.random() * 0.55;
    sMesh.position.set(Math.cos(angle) * r, -0.35 + Math.random() * 1.1, Math.sin(angle) * r);
    sMesh.rotation.set(Math.random() * PI, Math.random() * PI, Math.random() * PI);
    sparks.add(sMesh);
    sparkMeshes.push(sMesh);

    // Short secondary branch
    const bMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF, transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    sparkMats.push(bMat);
    const branchGeo = makeLightningGeo(boltLen * 0.45, 3);
    const bMesh = new THREE.Line(branchGeo, bMat) as unknown as THREE.Mesh;
    bMesh.position.set(
      sMesh.position.x + (Math.random() - 0.5) * 0.18,
      sMesh.position.y + (Math.random() - 0.5) * 0.18,
      sMesh.position.z + (Math.random() - 0.5) * 0.18,
    );
    bMesh.rotation.set(Math.random() * PI, Math.random() * PI, Math.random() * PI);
    sparks.add(bMesh);
    sparkMeshes.push(bMesh);
  }

  // Cheek sparks — short bolts near the red cheeks
  for (const sx of [-1, 1]) {
    for (let ci = 0; ci < 3; ci++) {
      const csMat = new THREE.MeshBasicMaterial({
        color: ci === 0 ? 0xFFFFFF : 0xFFDD44, transparent: true, opacity: 0,
        depthWrite: false, blending: THREE.AdditiveBlending,
      });
      sparkMats.push(csMat);
      const cBoltGeo = makeLightningGeo(0.10 + Math.random() * 0.08, 4);
      const csMesh = new THREE.Line(cBoltGeo, csMat) as unknown as THREE.Mesh;
      csMesh.position.set(
        sx * 0.48 + (Math.random() - 0.5) * 0.10,
        0.40 + (Math.random() - 0.5) * 0.10,
        0.52 + Math.random() * 0.10,
      );
      csMesh.rotation.set(Math.random() * PI * 0.5, Math.random() * PI, sx * 0.4);
      sparks.add(csMesh);
      sparkMeshes.push(csMesh);
    }
  }
  group.add(sparks);

  const auraMat = new THREE.MeshBasicMaterial({
    color: 0xFFDD44, transparent: true, opacity: 0, wireframe: true,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const aura = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.6, 1),
    auraMat,
  );
  group.add(aura);

  const glassOrb = new THREE.Mesh(
    new THREE.SphereGeometry(2.0, 4, 4),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  group.add(glassOrb);

  // Front fill light — brings out face detail
  const pikaLight = new THREE.PointLight(0xFFFDF0, 2.2, 5.0, 1.0);
  pikaLight.position.set(0, 0.5, 2.5);
  group.add(pikaLight);

  // Top warm overhead — makes the yellow fur glow nicely
  const pikaTopLight = new THREE.PointLight(0xFFF8E0, 1.0, 4.5, 1.2);
  pikaTopLight.position.set(0, 2.2, 0.5);
  group.add(pikaTopLight);

  // Side rim light — creates fur-edge definition
  const pikaSideLight = new THREE.PointLight(0xFFE0B0, 0.7, 3.5, 1.5);
  pikaSideLight.position.set(1.8, 0.8, 0.8);
  group.add(pikaSideLight);

  // Electric corona — sprite-based glowing bolts (visible on all devices, unlike Lines)
  const coronaMats: THREE.SpriteMaterial[] = [];
  const CORONA_N = Math.round(12 * detail);
  for (let i = 0; i < CORONA_N; i++) {
    const color = i % 3 === 0 ? 0xFFFFFF : (i % 3 === 1 ? 0xFFE030 : 0xFFCC00);
    const cm = new THREE.SpriteMaterial({
      map: glowTexture(), color,
      transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    coronaMats.push(cm);
    const cs = new THREE.Sprite(cm);
    const angle = (i / CORONA_N) * PI2 + Math.random() * 0.5;
    const r = 1.0 + Math.random() * 0.65;
    const sz = 0.18 + Math.random() * 0.22;
    cs.scale.setScalar(sz);
    cs.position.set(Math.cos(angle) * r, -0.35 + Math.random() * 1.1, Math.sin(angle) * r);
    sparks.add(cs);
  }

  return { group, head: headGroup, leftEye, rightEye, leftPupil, rightPupil, leftEyelid, rightEyelid, leftEarGroup, rightEarGroup, cheekMatL, cheekMatR, tail, leftArm, rightArm, mouthMesh, tongue, sparks, sparkMats, sparkMeshes, auraMat, coronaMats };
}

// Atmosphere glow shaders — volumetric, animated, multi-fresnel
const ATMOSPHERE_VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;
  uniform float uTime;
  uniform float uEnergy;
  void main() {
    vec3 pos = position;
    // Subtle heat-shimmer displacement
    float shimmer = sin(pos.y * 8.0 + uTime * 2.0) * sin(pos.x * 6.0 - uTime * 1.5);
    pos += normal * shimmer * 0.015 * (0.5 + uEnergy);
    vNormal = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    vLocalPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const ATMOSPHERE_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uEnergy;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;

  float ah(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
  }
  float an(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(mix(ah(i), ah(i+vec3(1,0,0)), f.x),
                   mix(ah(i+vec3(0,1,0)), ah(i+vec3(1,1,0)), f.x), f.y),
               mix(mix(ah(i+vec3(0,0,1)), ah(i+vec3(1,0,1)), f.x),
                   mix(ah(i+vec3(0,1,1)), ah(i+vec3(1,1,1)), f.x), f.y), f.z);
  }

  void main() {
    vec3 vd = normalize(cameraPosition - vWorldPos);
    vec3 n = normalize(vNormal);
    float d = max(0.6 - dot(n, vd), 0.0);

    // Multiple fresnel layers at different exponents
    float i1 = pow(d, 2.0);
    float i2 = pow(d, 3.0);
    float i3 = pow(d, 5.0);

    // Animated noise modulating atmosphere density
    float density = an(vLocalPos * 4.0 + vec3(0.0, uTime * 0.3, uTime * 0.15));
    density = 0.6 + density * 0.5;

    // Volumetric light shaft approximation — directional streaking
    vec3 ld = normalize(vec3(0.5, 0.8, 0.4));
    float shaft = pow(max(dot(n, ld), 0.0), 3.0);

    vec3 deepGold = vec3(0.15, 0.10, 0.04);
    vec3 lightGold = vec3(0.35, 0.26, 0.10);
    vec3 pearl = vec3(0.45, 0.40, 0.32);

    // Animated color shifting within the warm palette
    float shift = sin(uTime * 0.25 + vLocalPos.y * 2.0) * 0.5 + 0.5;
    vec3 baseGold = mix(lightGold, vec3(0.40, 0.30, 0.13), shift);

    float pulse = 0.65 + sin(uTime * 0.35) * 0.04 + uEnergy * 0.08;

    vec3 col = mix(deepGold, baseGold, i1) * pulse * density;
    col += pearl * i3 * 0.08;
    col += vec3(0.5, 0.42, 0.22) * shaft * 0.06;

    float alpha = (i2 * 0.015 + i3 * 0.005) * pulse * density;

    gl_FragColor = vec4(col, alpha);
  }
`;

// ============================================================
// Energy tendril shader — curved animated filaments from the surface
// ============================================================
const TENDRIL_VERT = /* glsl */`
  attribute float aT;
  varying float vT;
  void main() {
    vT = aT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const TENDRIL_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uOpacity;
  varying float vT;
  void main() {
    // Bright at root, fades to tip; animated energy pulse travels outward
    float pulse = sin(vT * 12.0 - uTime * 5.0) * 0.5 + 0.5;
    float fade = (1.0 - vT) * (0.4 + pulse * 0.6);
    vec3 col = mix(vec3(1.0, 0.85, 0.4), vec3(0.85, 0.6, 0.25), vT);
    gl_FragColor = vec4(col, fade * uOpacity);
  }
`;

// ============================================================
// Pikachu long-press "Chuu!" electricity effect helpers
// ============================================================
function playPikachuCry() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)() as AudioContext;
    const t = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.9, t);
    master.connect(ctx.destination);

    // "CHOOOooooo!" — explosive start, held screaming vowel, long tail
    const carrier = ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(1800, t);
    carrier.frequency.exponentialRampToValueAtTime(1200, t + 0.08); // explosive "CH" attack
    carrier.frequency.setValueAtTime(1100, t + 0.10);
    carrier.frequency.linearRampToValueAtTime(1050, t + 0.55);      // held "OOooo" vowel
    carrier.frequency.exponentialRampToValueAtTime(560, t + 0.88);  // fall at the end

    // FM sawtooth — electric crackle, stays active through whole scream
    const mod = ctx.createOscillator();
    mod.type = 'sawtooth';
    mod.frequency.setValueAtTime(480, t);
    mod.frequency.exponentialRampToValueAtTime(140, t + 0.85);
    const modG = ctx.createGain();
    modG.gain.setValueAtTime(920, t);        // huge depth at start
    modG.gain.exponentialRampToValueAtTime(60, t + 0.88);
    mod.connect(modG);
    modG.connect(carrier.frequency);

    // Tremolo LFO — gives the screaming/yelling wobble
    const tremolo = ctx.createOscillator();
    tremolo.frequency.value = 11;
    const tremG = ctx.createGain();
    tremG.gain.setValueAtTime(0, t);
    tremG.gain.linearRampToValueAtTime(0.35, t + 0.12); // tremolo kicks in after attack
    tremG.gain.setValueAtTime(0.35, t + 0.55);
    tremG.gain.linearRampToValueAtTime(0.0, t + 0.88);
    tremolo.connect(tremG);
    const tremoloMod = ctx.createGain();
    tremoloMod.gain.value = 1;
    tremG.connect(tremoloMod);

    // Vibrato on pitch — screaming voice shake
    const vibrato = ctx.createOscillator();
    vibrato.frequency.value = 8.5;
    const vibG = ctx.createGain();
    vibG.gain.setValueAtTime(0, t);
    vibG.gain.linearRampToValueAtTime(38, t + 0.10);
    vibG.gain.setValueAtTime(38, t + 0.55);
    vibG.gain.exponentialRampToValueAtTime(5, t + 0.88);
    vibrato.connect(vibG);
    vibG.connect(carrier.frequency);

    // Formant — "oo" vowel, then opens to "ah"
    const formant = ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(2400, t);
    formant.frequency.exponentialRampToValueAtTime(820, t + 0.12);
    formant.frequency.setValueAtTime(820, t + 0.55);
    formant.frequency.exponentialRampToValueAtTime(680, t + 0.88);
    formant.Q.value = 2.8;

    // Envelope — very fast attack, loud sustained body, long tail
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(1.0, t + 0.008); // explosive attack
    env.gain.setValueAtTime(0.92, t + 0.04);
    env.gain.setValueAtTime(0.90, t + 0.55);           // held loud through "OOooo"
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.90);

    carrier.connect(env);
    env.connect(formant);
    // Tremolo modulates the output amplitude
    const ampMod = ctx.createGain();
    ampMod.gain.value = 0;
    tremG.connect(ampMod.gain);
    formant.connect(ampMod);
    ampMod.connect(master);
    formant.connect(master); // direct path too for thickness

    // Electric noise burst — sustained through the whole scream
    const noiseLen = Math.ceil(ctx.sampleRate * 0.90);
    const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) nd[i] = Math.random() * 2 - 1;
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    const nf = ctx.createBiquadFilter();
    nf.type = 'highpass'; nf.frequency.value = 3000; nf.Q.value = 0.4;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.30, t);
    ng.gain.setValueAtTime(0.18, t + 0.10);
    ng.gain.setValueAtTime(0.12, t + 0.55);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.88);
    noiseSrc.connect(nf); nf.connect(ng); ng.connect(master);

    carrier.start(t); carrier.stop(t + 0.92);
    vibrato.start(t); vibrato.stop(t + 0.92);
    mod.start(t);     mod.stop(t + 0.92);
    tremolo.start(t); tremolo.stop(t + 0.92);
    noiseSrc.start(t);
    setTimeout(() => { try { ctx.close(); } catch {} }, 2500);
  } catch {}
}

function setupChuEffect(
  container: HTMLElement,
  canvas: HTMLElement,
  onCharge: (level: number) => void,
): () => void {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:9;';
  if (getComputedStyle(container).position === 'static') container.style.position = 'relative';
  container.appendChild(overlay);

  let charging = false, flashing = false, chargeStart = 0, chargeRAF = 0;
  const CHARGE_MS = 2200;

  function tick() {
    if (!charging) return;
    const lv = Math.min((performance.now() - chargeStart) / CHARGE_MS, 1);
    onCharge(lv);
    if (lv >= 1 && !flashing) {
      flashing = true; charging = false;
      playPikachuCry();
      overlay.style.transition = 'opacity 0.08s ease-in';
      overlay.style.opacity = '1';
      setTimeout(() => {
        overlay.style.transition = 'opacity 1.4s ease-out';
        overlay.style.opacity = '0';
        setTimeout(() => { flashing = false; onCharge(0); }, 1400);
      }, 140);
    } else if (lv < 1) {
      chargeRAF = requestAnimationFrame(tick);
    }
  }

  function start() {
    if (flashing) return;
    charging = true;
    chargeStart = performance.now();
    chargeRAF = requestAnimationFrame(tick);
  }

  function cancel() {
    if (flashing) return;
    charging = false;
    cancelAnimationFrame(chargeRAF);
    onCharge(0);
  }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mouseup', cancel);
  canvas.addEventListener('mouseleave', cancel);
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); start(); }, { passive: false });
  canvas.addEventListener('touchend', cancel);
  canvas.addEventListener('touchcancel', cancel);

  return () => {
    canvas.removeEventListener('mousedown', start);
    canvas.removeEventListener('mouseup', cancel);
    canvas.removeEventListener('mouseleave', cancel);
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  };
}

// ============================================================
// Replace procedural Pikachu body with a purchased GLB model.
// Keeps all effects (sparks, aura, lights) from buildPikachu.
// Body meshes use MeshPhysicalMaterial; face decal uses
// MeshBasicMaterial with a canvas texture map — both are hidden.
// ============================================================
// Registry of swappable main characters. Pikachu is the built-in (vertex-color
// GLB); the others are textured GLBs the user provided (converted from FBX/DAE).
const CHARACTER_FILES: Record<string, string> = {
  pikachu:    'pikachu.glb?v=5',
  charmander: 'ar-models/charmander.glb',
  squirtle:   'ar-models/squirtle.glb',
  meowth:     'ar-models/meowth.glb',
  bulbasaur:  'ar-models/bulbasaur.glb',
  eevee:      'ar-models/eevee.glb',
  mewtwo:     'ar-models/mewtwo.glb',
  articuno:   'ar-models/articuno.glb',
  suicune:    'ar-models/suicune.glb',
  raikou:     'ar-models/raikou.glb',
  entei:      'ar-models/entei.glb',
  moltres:    'ar-models/moltres.glb',
  zapdos:     'ar-models/zapdos.glb',
  lugia:      'ar-models/lugia.glb',
  'ho-oh':    'ar-models/ho-oh.glb',
};
export const CHARACTER_NAMES = Object.keys(CHARACTER_FILES);

// Per-character scene background — the orb canvas is opaque and fills the whole
// screen, so this clear colour IS the app background. Switching characters
// recolours the entire backdrop to match the Pokemon (kept dark so the 3D model
// and UI stay readable). Pairs with the CSS .char-ambient glow + body tint.
const CHAR_BG: Record<string, number> = {
  pikachu:    0x0c0a04, // electric warm
  charmander: 0x140803, // ember red
  squirtle:   0x04101c, // water blue
  meowth:     0x100614, // hypnosis purple
  bulbasaur:  0x05140c, // grass green
  eevee:      0x140d06, // warm amber
  mewtwo:     0x0e0618, // psychic violet
  articuno:   0x041524, // ice blue
  suicune:    0x04161c, // aurora teal
  raikou:     0x141004, // electric amber
  entei:      0x1a0703, // volcanic red
  moltres:    0x1c0903, // fire orange
  zapdos:     0x161202, // lightning yellow
  lugia:      0x081020, // deep-sea silver
  'ho-oh':    0x180e03, // sacred gold
};
function charBg(name: string): number { return CHAR_BG[name] ?? 0x0a0806; }

// Per-character ACCENT — the bright colour for the orb's cage / rings / lines.
// Swapping a Pokemon hue-shifts the whole gold framework to this colour so the
// surrounding sphere matches the active Pokemon instead of always being gold.
const CHAR_ACCENT: Record<string, number> = {
  pikachu:    0xffd633, // electric yellow
  charmander: 0xff7a2a, // ember orange
  squirtle:   0x33b5ff, // water blue
  meowth:     0xc26bff, // hypnosis purple
  bulbasaur:  0x5fd64d, // grass green
  eevee:      0xe0a85a, // warm amber
  mewtwo:     0xb060ff, // psychic violet
  articuno:   0x66ccff, // ice blue
  suicune:    0x3fd6c8, // aurora teal
  raikou:     0xffd633, // electric amber
  entei:      0xff5a28, // volcanic red
  moltres:    0xff7a18, // fire orange
  zapdos:     0xfff04d, // lightning yellow
  lugia:      0x8fb6ff, // deep-sea silver-blue
  'ho-oh':    0xffb020, // sacred gold
};
function charAccent(name: string): number { return CHAR_ACCENT[name] ?? 0xdaa520; }

// ──────────────────────────────────────────────────────────────
// POKEMON CRIES — load from PokeAPI cries CDN on first play.
// Audio is module-scoped so swapping characters stops the old cry.
// ──────────────────────────────────────────────────────────────
const POKEMON_CRY_ID: Record<string, number> = {
  pikachu: 25, charmander: 4, squirtle: 7, meowth: 52, bulbasaur: 1,
  eevee: 133, mewtwo: 150, articuno: 144, suicune: 245, raikou: 243,
  entei: 244, moltres: 146, zapdos: 145, lugia: 249, 'ho-oh': 250,
};
let _activeCry: HTMLAudioElement | null = null;
function playCry(name: string) {
  if (_activeCry) { _activeCry.pause(); _activeCry.src = ''; _activeCry = null; }
  const id = POKEMON_CRY_ID[name]; if (!id) return;
  const audio = new Audio(`https://cdn.jsdelivr.net/gh/PokeAPI/cries@main/cries/pokemon/latest/${id}.ogg`);
  audio.volume = 0.55;
  audio.play().catch(() => {});
  _activeCry = audio;
}
function stopCry() {
  if (_activeCry) { _activeCry.pause(); _activeCry.src = ''; _activeCry = null; }
}

// ──────────────────────────────────────────────────────────────
// PER-POKEMON PARTICLE EFFECTS — Points cloud around the orb.
// Mobile: half count. Uses additive blending to look "glowy".
// ──────────────────────────────────────────────────────────────
interface PFXCfg { color: number; count: number; size: number; speed: number; upward: boolean; }
const POKEMON_PFX: Record<string, PFXCfg> = {
  pikachu:    { color: 0xffee22, count: 30, size: 0.05, speed: 0.012, upward: true  },
  charmander: { color: 0xff6622, count: 35, size: 0.05, speed: 0.014, upward: true  },
  squirtle:   { color: 0x44bbff, count: 28, size: 0.06, speed: 0.008, upward: false },
  meowth:     { color: 0xcc88ff, count: 22, size: 0.05, speed: 0.010, upward: true  },
  bulbasaur:  { color: 0x55dd44, count: 30, size: 0.07, speed: 0.009, upward: true  },
  eevee:      { color: 0xddaa55, count: 22, size: 0.05, speed: 0.010, upward: true  },
  mewtwo:     { color: 0xcc66ff, count: 32, size: 0.06, speed: 0.011, upward: true  },
  articuno:   { color: 0x99ddff, count: 35, size: 0.05, speed: 0.007, upward: false },
  suicune:    { color: 0x33cccc, count: 30, size: 0.06, speed: 0.008, upward: false },
  raikou:     { color: 0xffee22, count: 28, size: 0.04, speed: 0.015, upward: true  },
  entei:      { color: 0xff5522, count: 38, size: 0.05, speed: 0.013, upward: true  },
  moltres:    { color: 0xff8811, count: 40, size: 0.05, speed: 0.014, upward: true  },
  zapdos:     { color: 0xffff22, count: 32, size: 0.04, speed: 0.016, upward: true  },
  lugia:      { color: 0xaabbff, count: 25, size: 0.06, speed: 0.008, upward: false },
  'ho-oh':    { color: 0xff9922, count: 38, size: 0.05, speed: 0.013, upward: true  },
};

interface PFXState { pts: THREE.Points; pos: Float32Array; vel: Float32Array; count: number; }

function createParticles(scene: THREE.Scene, name: string, isMobile: boolean): PFXState | null {
  const cfg = POKEMON_PFX[name]; if (!cfg) return null;
  const count = isMobile ? Math.ceil(cfg.count * 0.55) : cfg.count;
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const rng = () => (Math.random() - 0.5) * 2;
  for (let i = 0; i < count; i++) {
    // Distribute on a sphere of radius ~1.7–2.2 (just outside the orb)
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    const r = 1.7 + Math.random() * 0.5;
    pos[i * 3    ] = r * Math.sin(theta) * Math.cos(phi);
    pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
    pos[i * 3 + 2] = r * Math.cos(theta);
    const sp = cfg.speed * (0.5 + Math.random() * 0.8);
    vel[i * 3    ] = rng() * sp * 0.4;
    vel[i * 3 + 1] = cfg.upward ? sp * (0.4 + Math.random() * 0.6) : rng() * sp;
    vel[i * 3 + 2] = rng() * sp * 0.4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: cfg.color, size: cfg.size, transparent: true, opacity: 0.75,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return { pts, pos, vel, count };
}

function updateParticles(pfx: PFXState, cfg: PFXCfg) {
  for (let i = 0; i < pfx.count; i++) {
    pfx.pos[i * 3    ] += pfx.vel[i * 3    ];
    pfx.pos[i * 3 + 1] += pfx.vel[i * 3 + 1];
    pfx.pos[i * 3 + 2] += pfx.vel[i * 3 + 2];
    const x = pfx.pos[i * 3], y = pfx.pos[i * 3 + 1], z = pfx.pos[i * 3 + 2];
    const dist = Math.sqrt(x * x + y * y + z * z);
    if (dist > 3.0 || (cfg.upward && y > 2.8) || (!cfg.upward && y < -2.8)) {
      // Respawn near the orb surface
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const r = 1.6 + Math.random() * 0.3;
      pfx.pos[i * 3    ] = r * Math.sin(theta) * Math.cos(phi);
      pfx.pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      pfx.pos[i * 3 + 2] = r * Math.cos(theta);
    }
  }
  (pfx.pts.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
}

function disposeParticles(pfx: PFXState | null, scene: THREE.Scene) {
  if (!pfx) return;
  scene.remove(pfx.pts);
  pfx.pts.geometry.dispose();
  (pfx.pts.material as THREE.Material).dispose();
}

// Recolour a collection of gold materials to an accent, preserving each one's
// original lightness so the layered look survives the hue change.
type AccentMat = { mat: any; baseL: number; baseS: number };
function applyAccentToMats(mats: AccentMat[], hex: number) {
  const tgt = new THREE.Color(hex);
  const thsl = { h: 0, s: 0, l: 0 }; tgt.getHSL(thsl);
  for (const a of mats) {
    a.mat.color.setHSL(thsl.h, Math.min(1, a.baseS * 0.4 + thsl.s * 0.6), a.baseL);
  }
}
// Red-laser arrival flash: tint a freshly-loaded model bright red, then fade it
// back to its natural colours over ~0.55s (matches the swap pokeball burst).
function flashArrival(model: THREE.Object3D) {
  const RED = new THREE.Color(0xff2418);
  const mats: { m: any; oe: THREE.Color; oi: number }[] = [];
  model.traverse((o: any) => {
    if (!o.isMesh) return;
    const ms = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
    for (const m of ms) {
      if (m && m.emissive) {
        mats.push({ m, oe: m.emissive.clone(), oi: m.emissiveIntensity ?? 1 });
        m.emissive.copy(RED);
        m.emissiveIntensity = 1.6;
      }
    }
  });
  if (!mats.length) return;
  const start = performance.now();
  const dur = 550;
  function step(now: number) {
    const t = Math.min(1, (now - start) / dur);
    for (const e of mats) {
      e.m.emissive.copy(RED).lerp(e.oe, t);
      e.m.emissiveIntensity = 1.6 * (1 - t) + e.oi * t;
    }
    if (t < 1) requestAnimationFrame(step);
    else for (const e of mats) { e.m.emissive.copy(e.oe); e.m.emissiveIntensity = e.oi; }
  }
  requestAnimationFrame(step);
}

function collectAccentMats(root: THREE.Object3D, skip: THREE.Object3D): AccentMat[] {
  const out: AccentMat[] = [];
  const underSkip = (o: THREE.Object3D | null) => { while (o) { if (o === skip) return true; o = o.parent; } return false; };
  root.traverse((o: any) => {
    if (underSkip(o)) return;
    const ms = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
    for (const m of ms) {
      if (m && m.color && (m.isLineBasicMaterial || m.isMeshBasicMaterial)) {
        const hsl = { h: 0, s: 0, l: 0 }; m.color.getHSL(hsl);
        out.push({ mat: m, baseL: hsl.l, baseS: hsl.s });
      }
    }
  });
  return out;
}

// CharXform — full per-character transform: rotation (radians), scale multiplier,
// and position offset relative to auto-centered position. Exported via OrbHandle.
const CHAR_XFORM_LS_KEY = 'char_xform_v1';

function defaultXform(character: string): CharXform {
  // Rotation defaults vary by model source format; scale/position default to identity.
  const ROT: Record<string, {x:number;y:number;z:number}> = {
    pikachu:    { x: 0,            y: Math.PI, z: 0 },
    charmander: { x: 0,            y: Math.PI, z: 0 },
    squirtle:   { x: -Math.PI / 2, y: 0,       z: Math.PI },
    meowth:     { x: 0,            y: Math.PI, z: 0 },
    bulbasaur:  { x: 0,            y: Math.PI, z: 0 },
    eevee:      { x: 0,            y: Math.PI, z: 0 },
    mewtwo:     { x: 0,            y: Math.PI, z: 0 },
    articuno:   { x: 0,            y: Math.PI, z: 0 },
    suicune:    { x: -Math.PI / 2, y: 0,       z: Math.PI },
    raikou:     { x: 0,            y: Math.PI, z: 0 },
    entei:      { x: 0,            y: Math.PI, z: 0 },
    moltres:    { x: 0,            y: Math.PI, z: 0 },
    zapdos:     { x: 0,            y: Math.PI, z: 0 },
    lugia:      { x: 0,            y: Math.PI, z: 0 },
    'ho-oh':    { x: 0,            y: Math.PI, z: 0 },
  };
  const r = ROT[character] ?? { x: 0, y: Math.PI, z: 0 };
  return { x: r.x, y: r.y, z: r.z, s: 1, px: 0, py: 0, pz: 0 };
}

function getCharXform(character: string): CharXform {
  try {
    const saved = localStorage.getItem(CHAR_XFORM_LS_KEY);
    if (saved) {
      const all = JSON.parse(saved) as Record<string, CharXform>;
      if (all[character]) return all[character];
    }
  } catch {}
  return defaultXform(character);
}

function saveCharXform(character: string, xf: CharXform): void {
  try {
    const saved = localStorage.getItem(CHAR_XFORM_LS_KEY);
    const all: Record<string, CharXform> = saved ? JSON.parse(saved) : {};
    all[character] = xf;
    localStorage.setItem(CHAR_XFORM_LS_KEY, JSON.stringify(all));
  } catch {}
}

function clearCharXform(character: string): void {
  try {
    const saved = localStorage.getItem(CHAR_XFORM_LS_KEY);
    if (!saved) return;
    const all = JSON.parse(saved) as Record<string, CharXform>;
    delete all[character];
    localStorage.setItem(CHAR_XFORM_LS_KEY, JSON.stringify(all));
  } catch {}
}

// Stores auto-normalization values per model so real-time transform changes can
// re-apply scale and offset without reloading.
type BaseTransform = { s: number; cx: number; cy: number; cz: number };
const modelBaseTransform = new WeakMap<THREE.Object3D, BaseTransform>();

// Holds the currently-loaded swappable model per pikaGroup so we can replace it.
const loadedModels = new WeakMap<THREE.Group, THREE.Object3D>();

function loadAndReplaceBody(
  pikaGroup: THREE.Group,
  _mats: PikachuMaterials,
  base: string,
  character = 'pikachu',
  onLoaded?: (model: THREE.Object3D) => void,
): void {
  const file = CHARACTER_FILES[character] || CHARACTER_FILES.pikachu;
  import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
    const loader = new GLTFLoader();
    loader.load(
      base + file,
      (gltf) => {
        // Hide all procedural body/head geometry (only needs doing once, but
        // harmless to repeat on swaps).
        pikaGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const mat = Array.isArray(child.material) ? child.material[0] : child.material;
            if (mat instanceof THREE.MeshPhysicalMaterial) child.visible = false;
            if (mat instanceof THREE.MeshBasicMaterial && (mat as THREE.MeshBasicMaterial).map) {
              child.visible = false;
            }
          }
        });

        // Remove a previously-swapped model if present.
        const prev = loadedModels.get(pikaGroup);
        if (prev) { pikaGroup.remove(prev); }

        const model = gltf.scene;
        // All Pokemon GLBs now carry embedded textures — keep their materials,
        // just make them double-sided and shadow-casting.
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.computeVertexNormals();
            const apply = (m: THREE.Material) => {
              (m as any).side = THREE.DoubleSide;
              const sm = m as THREE.MeshStandardMaterial;
              if (sm.map) sm.map.colorSpace = THREE.SRGBColorSpace;
            };
            if (Array.isArray(child.material)) child.material.forEach(apply);
            else if (child.material) apply(child.material);
            child.castShadow = true;
          }
        });

        // Auto-normalize so every Pokemon is roughly the SAME apparent size and
        // fills the orb sphere. Rotation is applied FIRST, then the bounding box
        // is measured in the rotated frame — otherwise rotated models (suicune,
        // squirtle) end up off-centre. Normalise by the largest of all 3 dims so
        // the model's full extent fits consistently regardless of its shape.
        const xf = getCharXform(character);
        model.rotation.set(xf.x, xf.y, xf.z);
        model.scale.setScalar(1);
        model.position.set(0, 0, 0);
        model.updateMatrixWorld(true);
        const bb = new THREE.Box3().setFromObject(model);
        const bbSize = bb.getSize(new THREE.Vector3());
        const bbCenter = bb.getCenter(new THREE.Vector3());
        const target = 2.5;   // fill the sphere (radius ~1.6)
        const s = target / Math.max(bbSize.x, bbSize.y, bbSize.z);
        // Store the base transform so real-time adjustments can re-apply without reload.
        modelBaseTransform.set(model, { s, cx: -bbCenter.x * s, cy: -bbCenter.y * s, cz: -bbCenter.z * s });
        // Apply stored user transform (scale multiplier + position offset on top).
        model.scale.setScalar(s * xf.s);
        model.position.set(-bbCenter.x * s + xf.px, -bbCenter.y * s + xf.py, -bbCenter.z * s + xf.pz);
        pikaGroup.add(model);
        loadedModels.set(pikaGroup, model);
        onLoaded?.(model);
      },
      undefined,
      (err) => console.warn(`[OrbScene] ${file} load failed:`, err),
    );
  });
}

// ============================================================
// Pokeball throw — renders the real 3D Pokéball INSIDE the orb scene (same
// proven WebGL context as the characters), so it's always visible. Hides the
// character mesh during the throw and reveals the new one when it "opens".
// Returns a throwPokeball(onOpen,onDone) bound to the given scene group.
// ============================================================
function makeThrowPokeball(group: THREE.Group, pikaGroup: THREE.Group, base: string) {
  let ball: THREE.Object3D | null = null;
  let loading: Promise<THREE.Object3D | null> | null = null;
  let raf = 0;
  function ensure(): Promise<THREE.Object3D | null> {
    if (ball) return Promise.resolve(ball);
    if (loading) return loading;
    loading = import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) =>
      new Promise<THREE.Object3D | null>((res) => {
        new GLTFLoader().load(base + 'ar-models/pokeball.glb', (g: any) => {
          const m: THREE.Object3D = g.scene;
          m.traverse((o: any) => {
            if (!o.isMesh) return;
            o.geometry.computeVertexNormals();
            const t = (mm: any) => { mm.roughness = 0.3; mm.metalness = 0.18; mm.side = THREE.FrontSide; };
            Array.isArray(o.material) ? o.material.forEach(t) : (o.material && t(o.material));
          });
          const bb = new THREE.Box3().setFromObject(m);
          const sz = bb.getSize(new THREE.Vector3()); const ctr = bb.getCenter(new THREE.Vector3());
          const s = 1.5 / Math.max(sz.x, sz.y, sz.z);
          const wrap = new THREE.Group();
          m.scale.setScalar(s); m.position.set(-ctr.x * s, -ctr.y * s, -ctr.z * s);
          wrap.add(m); wrap.visible = false; group.add(wrap); ball = wrap; res(wrap);
        }, undefined, () => res(null));
      })).catch(() => null);
    return loading;
  }
  return function throwPokeball(onOpen?: () => void, onDone?: () => void) {
    let opened = false, doneF = false;
    const fo = () => { if (!opened) { opened = true; pikaGroup.visible = true; try { onOpen && onOpen(); } catch {} } };
    const fd = () => { if (!doneF) { doneF = true; if (ball) ball.visible = false; try { onDone && onDone(); } catch {} } };
    const wd1 = setTimeout(fo, 1500), wd2 = setTimeout(() => { fo(); fd(); }, 2700);
    pikaGroup.visible = false; // character vanishes (laser hit)
    ensure().then((b) => {
      if (!b) { clearTimeout(wd1); clearTimeout(wd2); fo(); fd(); return; }
      b.visible = true; b.position.set(0, 0, 0); b.scale.setScalar(0.01); b.rotation.set(0, 0, 0);
      const start = performance.now(); cancelAnimationFrame(raf);
      const tick = (now: number) => {
        const t = (now - start) / 1000;
        if (t < 0.5) {                              // fly in from below, spin
          const p = t / 0.5, e = 1 - Math.pow(1 - p, 3);
          b.position.y = -2.4 + 2.4 * e; b.scale.setScalar(0.3 + 0.9 * e);
          b.rotation.y = t * 16; b.rotation.x = 0.25;
        } else if (t < 1.05) {                       // wobble
          b.position.y = 0; b.scale.setScalar(1.2);
          b.rotation.z = Math.sin((t - 0.5) * 22) * 0.42 * Math.max(0, 1 - (t - 0.5) / 0.55);
          b.rotation.y += 0.05;
        } else if (t < 1.5) {                        // open: reveal char, ball spins away
          if (!opened) { clearTimeout(wd1); fo(); }
          const p = (t - 1.05) / 0.45;
          b.scale.setScalar(1.2 * (1 - p)); b.rotation.y += 0.3; b.position.y = p * 0.4;
        } else { clearTimeout(wd2); fd(); return; }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
  };
}

// ============================================================
// Mobile orb scene — holographic AI core (MAXIMUM QUALITY)
// ============================================================
function mountMobileOrb(container: HTMLElement): OrbHandle {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    failIfMajorPerformanceCaveat: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(charBg("pikachu"), 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.65;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 6);
  camera.lookAt(0, 0, 0);

  // Try full post-processing pipeline; if it fails use direct render
  let composer: EffectComposer | null = null;
  let mBloom: UnrealBloomPass | null = null;
  let mFxaa: ShaderPass | null = null;
  let useComposer = false;
  try {
    const pr0 = Math.min(window.devicePixelRatio || 1, 2);
    // Multisampled (MSAA) render target — crisp edges instead of pixelated
    const mRT = new THREE.WebGLRenderTarget(
      Math.max(1, Math.floor((container.clientWidth || window.innerWidth) * pr0)),
      Math.max(1, Math.floor((container.clientHeight || window.innerHeight) * pr0)),
      { samples: 4 },
    );
    composer = new EffectComposer(renderer, mRT);
    composer.addPass(new RenderPass(scene, camera));
    mBloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth * pr0, window.innerHeight * pr0),
      0.08, 0.5, 0.78,
    );
    composer.addPass(mBloom);
    const mVignette = new ShaderPass(GOLD_VIGNETTE_SHADER);
    mVignette.uniforms.darkness.value = 0.7;
    composer.addPass(mVignette);
    mFxaa = new ShaderPass(FXAAShader);
    composer.addPass(mFxaa);
    composer.addPass(new OutputPass());
    // Test render to confirm pipeline works
    composer.render();
    useComposer = true;
  } catch {
    composer = null;
    mBloom = null;
    mFxaa = null;
    useComposer = false;
  }

  function resize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, true);
    if (composer) composer.setSize(w * pr, h * pr);
    if (mFxaa) mFxaa.uniforms['resolution'].value.set(1 / (w * pr), 1 / (h * pr));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const group = new THREE.Group();
  scene.add(group);

  // ── Balanced lighting for mobile — expose Pikachu shape without blowout ──
  const mKey = new THREE.DirectionalLight(0xfff8e0, 2.2);
  mKey.position.set(2, 3, 5);
  scene.add(mKey);
  const mFill = new THREE.DirectionalLight(0xFFE860, 0.9);
  mFill.position.set(-3, 2, 4);
  scene.add(mFill);
  const mFront = new THREE.DirectionalLight(0xFFFAE8, 0.7);
  mFront.position.set(0, 1, 6);
  scene.add(mFront);
  const mRim = new THREE.DirectionalLight(0xffe0b0, 0.5);
  mRim.position.set(0, 2, -4);
  scene.add(mRim);
  const mAmbient = new THREE.AmbientLight(0x1a1208, 0.6);
  scene.add(mAmbient);

  // ────────────────────────────────────────────
  // CENTRAL OBJECT — PIKACHU (mobile, lower detail)
  // ────────────────────────────────────────────
  const envMap = createEnvMap(renderer);
  if (envMap) scene.environment = envMap;
  const pikaMats = createPikachuMaterials(envMap);
  const pika = buildPikachu(pikaMats, 1.0);
  const pikaGroup = pika.group;
  pikaGroup.scale.setScalar(0.95);
  group.add(pikaGroup);
  let mobileCurrentChar = 'pikachu';
  let mobileCurrentModel: THREE.Object3D | null = null;
  let mobPFX: PFXState | null = null;
  loadAndReplaceBody(pikaGroup, pikaMats, import.meta.env.BASE_URL || '/', 'pikachu', (m) => { mobileCurrentModel = m; });
  const mobileThrowPokeball = makeThrowPokeball(group, pikaGroup, import.meta.env.BASE_URL || '/');

  // ────────────────────────────────────────────
  // ORBITAL RINGS — gold halo, champagne, rose
  // ────────────────────────────────────────────
  // Orbital rings — HIDDEN so Pikachu reads as a clean character (no saturn look)
  const goldRGeo = new THREE.TorusGeometry(1.85, 0.035, 28, 220);
  const goldRMat = new THREE.MeshBasicMaterial({
    color: 0xdaa520, transparent: true, opacity: 0, depthWrite: false,
  });
  const goldRing = new THREE.Mesh(goldRGeo, goldRMat);
  goldRing.visible = false;
  group.add(goldRing);

  const haloGlowGeo = new THREE.TorusGeometry(1.85, 0.1, 24, 200);
  const haloGlowMat = new THREE.MeshBasicMaterial({
    color: 0xdaa520, transparent: true, opacity: 0, depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const haloGlow = new THREE.Mesh(haloGlowGeo, haloGlowMat);
  haloGlow.visible = false;
  group.add(haloGlow);

  const cyanRGeo = new THREE.TorusGeometry(1.35, 0.012, 16, 160);
  const cyanRMat = new THREE.MeshBasicMaterial({
    color: 0xf5e6c8, transparent: true, opacity: 0, depthWrite: false,
  });
  const cyanRing = new THREE.Mesh(cyanRGeo, cyanRMat);
  cyanRing.visible = false;
  group.add(cyanRing);

  const purpRGeo = new THREE.TorusGeometry(1.6, 0.01, 12, 140);
  const purpRMat = new THREE.MeshBasicMaterial({
    color: 0xc8956a, transparent: true, opacity: 0, depthWrite: false,
  });
  const purpRing = new THREE.Mesh(purpRGeo, purpRMat);
  purpRing.visible = false;
  group.add(purpRing);

  const accentRGeo = new THREE.TorusGeometry(1.1, 0.008, 10, 120);
  const accentRMat = new THREE.MeshBasicMaterial({
    color: 0xffd700, transparent: true, opacity: 0, depthWrite: false,
  });
  const accentRing = new THREE.Mesh(accentRGeo, accentRMat);
  accentRing.visible = false;
  group.add(accentRing);

  // ────────────────────────────────────────────
  // EXPANDING PULSE RINGS — 3 rings cycling outward
  // ────────────────────────────────────────────
  const PULSE_N = 3;
  const pulseRings: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; phase: number }[] = [];
  const pulseBaseGeo = new THREE.PlaneGeometry(1, 1);
  for (let i = 0; i < PULSE_N; i++) {
    const pm = new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: PULSE_RING_FRAG,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const pmesh = new THREE.Mesh(pulseBaseGeo, pm);
    pmesh.rotation.x = -PI * 0.5;
    pmesh.position.y = 0;
    group.add(pmesh);
    pulseRings.push({ mesh: pmesh, mat: pm, phase: i / PULSE_N });
  }

  // ────────────────────────────────────────────
  // ATMOSPHERE SHELL — nearly disabled so Pikachu is clear
  // ────────────────────────────────────────────
  const atmoGeo = new THREE.IcosahedronGeometry(1.6, 3);
  const atmoMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uEnergy: { value: 0 } },
    vertexShader: ATMOSPHERE_VERT,
    fragmentShader: ATMOSPHERE_FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const atmosphere = new THREE.Mesh(atmoGeo, atmoMat);
  group.add(atmosphere);

  const glow1Mat = new THREE.SpriteMaterial({
    map: glowTexture(), color: 0x5a4218, transparent: true, opacity: 0.015,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const glow1 = new THREE.Sprite(glow1Mat);
  glow1.scale.setScalar(4.0);
  group.add(glow1);

  const glow2Mat = new THREE.SpriteMaterial({
    map: glowTexture(), color: 0x2a1c0a, transparent: true, opacity: 0.008,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const glow2 = new THREE.Sprite(glow2Mat);
  glow2.scale.setScalar(6.0);
  group.add(glow2);

  // ────────────────────────────────────────────
  // ORBITING NETWORK NODES — 10 dots with connection lines
  // ────────────────────────────────────────────
  const NODE_N = 10;
  const nodeOrbs: { angle: number; r: number; speed: number; y: number }[] = [];
  const nodeMeshes: THREE.Mesh[] = [];
  const nodeGlows: THREE.Sprite[] = [];
  const nodeLines: { geo: THREE.BufferGeometry }[] = [];
  const nColors = [0xdaa520, 0xf5e6c8, 0xdaa520, 0xc8956a, 0xf0d090,
                   0xdaa520, 0xf5e6c8, 0xd4a84d, 0xc8956a, 0xf0d090];

  for (let i = 0; i < NODE_N; i++) {
    const angle = (i / NODE_N) * PI2;
    const r = 2.0 + (i % 3) * 0.3;
    const nGeo = new THREE.IcosahedronGeometry(0.04, 1);
    const nMat = new THREE.MeshBasicMaterial({
      color: nColors[i], transparent: true, opacity: 0.8, depthWrite: false,
    });
    const nd = new THREE.Mesh(nGeo, nMat);
    const yy = (Math.random() - 0.5) * 0.8;
    nd.position.set(Math.cos(angle) * r, yy, Math.sin(angle) * r);
    nd.visible = false;
    group.add(nd);
    nodeMeshes.push(nd);
    nodeOrbs.push({ angle, r, speed: 0.02 + Math.random() * 0.04, y: yy });

    const ngMat = new THREE.SpriteMaterial({
      map: glowTexture(), color: nColors[i], transparent: true, opacity: 0.25,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const ng = new THREE.Sprite(ngMat);
    ng.scale.setScalar(0.25);
    ng.visible = false;
    group.add(ng);
    nodeGlows.push(ng);

    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const lMat = new THREE.LineBasicMaterial({
      color: nColors[i], transparent: true, opacity: 0.1, depthWrite: false,
    });
    const line = new THREE.Line(lGeo, lMat);
    line.visible = false;
    group.add(line);
    nodeLines.push({ geo: lGeo });
  }

  // ────────────────────────────────────────────
  // FLOATING PARTICLES — 60 glowing motes
  // ────────────────────────────────────────────
  const PN = 60;
  const pPos = new Float32Array(PN * 3);
  const pPh = new Float32Array(PN);
  const pSz = new Float32Array(PN);
  const pCl = new Float32Array(PN * 3);
  const pOrbs: { a: number; r: number; spd: number; y0: number; tilt: number }[] = [];
  for (let i = 0; i < PN; i++) {
    const a = Math.random() * PI2;
    const r2 = 1.3 + Math.random() * 2.2;
    const tilt = (Math.random() - 0.5) * 0.6;
    pPos[i * 3] = Math.cos(a) * r2;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
    pPos[i * 3 + 2] = Math.sin(a) * r2;
    pPh[i] = Math.random();
    pSz[i] = 0.8 + Math.random() * 2.0;
    const kind = Math.random();
    if (kind > 0.8) { pCl[i*3]=1; pCl[i*3+1]=0.85; pCl[i*3+2]=0.5; }
    else if (kind > 0.6) { pCl[i*3]=0.95; pCl[i*3+1]=0.9; pCl[i*3+2]=0.82; }
    else { pCl[i*3]=0.85; pCl[i*3+1]=0.68; pCl[i*3+2]=0.3; }
    pOrbs.push({ a, r: r2, spd: 0.05 + Math.random() * 0.12, y0: pPos[i*3+1], tilt });
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('aPhase', new THREE.BufferAttribute(pPh, 1));
  pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSz, 1));
  pGeo.setAttribute('aColor', new THREE.BufferAttribute(pCl, 3));
  const pMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: PART_VERT,
    fragmentShader: PART_FRAG,
    transparent: true,
    depthWrite: false,
  });
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);

  // ────────────────────────────────────────────
  // ANIMATION — maximum flow
  // ────────────────────────────────────────────
  let chargeLevel = 0;
  const disposeChu = setupChuEffect(container, renderer.domElement, (lv) => { chargeLevel = lv; });

  // Drag rotation state
  let userRotY = 0, rotVel = 0;
  let dragActive = false, dragLastX = 0;
  const cvs = renderer.domElement;
  function onDragStart(x: number) { dragActive = true; dragLastX = x; rotVel = 0; }
  function onDragMove(x: number) {
    if (!dragActive) return;
    const dx = x - dragLastX; dragLastX = x;
    rotVel = dx * 0.012;
    userRotY += rotVel;
  }
  function onDragEnd() { dragActive = false; }
  cvs.addEventListener('mousedown', (e) => onDragStart(e.clientX));
  cvs.addEventListener('mousemove', (e) => onDragMove(e.clientX));
  cvs.addEventListener('mouseup', onDragEnd);
  cvs.addEventListener('mouseleave', onDragEnd);
  cvs.addEventListener('touchstart', (e) => { if (e.touches[0]) onDragStart(e.touches[0].clientX); }, { passive: true });
  cvs.addEventListener('touchmove', (e) => { if (e.touches[0]) onDragMove(e.touches[0].clientX); }, { passive: true });
  cvs.addEventListener('touchend', onDragEnd);

  let time = 0, raf = 0;
  let amp = 0.06, ampTarget = 0.06;
  let glitchStr = 0, nextGlitch = 3 + Math.random() * 5, glitchTimer = 0;
  let lastFrame = 0;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (document.hidden || document.body.classList.contains('bg-paused')) return;
    if (now - lastFrame < 33) return;
    lastFrame = now;
    const dt = 0.016;
    time += dt;
    amp += (ampTarget - amp) * 0.07;
    if (!dragActive) { rotVel *= 0.92; userRotY += rotVel; }

    // Long-press charge: ramp up bloom and exposure
    if (mBloom) mBloom.strength = 0.08 + chargeLevel * 2.0;
    renderer.toneMappingExposure = 0.9 + chargeLevel * 2.5;

    glitchTimer += dt;
    if (glitchTimer >= nextGlitch) {
      glitchStr = 0.4 + Math.random() * 0.6;
      nextGlitch = glitchTimer + 2 + Math.random() * 6;
    }
    glitchStr *= 0.93;
    if (glitchStr < 0.01) glitchStr = 0;

    pMat.uniforms.uTime.value = time;

    // ── Pikachu "life" animation ──
    // Body sway — gentle side-to-side idle tilting
    const sway = Math.sin(time * 0.45) * 0.04;
    pikaGroup.rotation.y = Math.sin(time * 0.35) * 0.35 + userRotY;
    pikaGroup.rotation.z = sway;
    // Periodic happy hop — quick bounce every ~8 seconds
    const hopCycle = time % 8.0;
    const hopActive = hopCycle > 7.4 && hopCycle < 7.8;
    const hopHeight = hopActive ? Math.sin((hopCycle - 7.4) / 0.4 * PI) * 0.15 : 0;
    pikaGroup.position.y = Math.sin(time * 0.7) * 0.06 + hopHeight;
    const breath = 1.0 + Math.sin(time * 1.2) * 0.02;
    const bounce = 1.0 + Math.max(0, Math.sin(time * 3.0)) * 0.008;
    const hopSquash = hopActive ? 1.0 + Math.sin((hopCycle - 7.4) / 0.4 * PI) * 0.04 : 1.0;
    pikaGroup.scale.set(0.95 * breath * (1.0 / bounce) * (1.0 / hopSquash), 0.95 * breath * bounce * hopSquash, 0.95 * breath);
    if (pika.head) {
      // Curious head tilt — cycles between looking around and tilting curiously
      const curiousCycle = time % 12.0;
      const curiousTilt = curiousCycle > 5.0 && curiousCycle < 7.0
        ? Math.sin((curiousCycle - 5.0) / 2.0 * PI) * 0.12 : 0;
      pika.head.rotation.y = Math.sin(time * 0.5 + 0.5) * 0.14;
      pika.head.rotation.z = Math.sin(time * 0.3) * 0.05 + curiousTilt;
      pika.head.rotation.x = Math.sin(time * 0.25) * 0.04 + (curiousTilt > 0 ? -0.03 : 0);
    }
    // Periodic electric ZAP — strong lightning burst every ~5s
    const zapCycle = time % 5.0;
    const zapActive = zapCycle > 4.2;
    const zapStrength = zapActive ? Math.sin((zapCycle - 4.2) / 0.8 * PI) : 0;
    const sparkBurst = zapStrength > 0.25 ? 0.5 : 0;
    // Heartbeat cheek glow — "lub-dub" rhythm
    const hbPhase = (time * 1.2) % PI2;
    const lub = Math.max(0, Math.sin(hbPhase * 2.0)) > 0.85 ? 0.25 : 0;
    const dub = Math.max(0, Math.sin(hbPhase * 2.0 + 1.2)) > 0.9 ? 0.18 : 0;
    const cheekPulse = 0.08 + lub * 0.3 + dub * 0.2 + amp * 0.1 + sparkBurst * 0.3 + chargeLevel * 1.5;
    pika.cheekMatL.emissiveIntensity = cheekPulse;
    pika.cheekMatR.emissiveIntensity = cheekPulse;
    if (pika.tail) {
      // Multi-frequency wag with periodic wag bursts
      const wagBurst = (time % 6.0) > 5.0 ? 2.5 : 1.0;
      pika.tail.rotation.z = Math.sin(time * 1.8 * wagBurst) * 0.18 + Math.sin(time * 4.2) * 0.04;
      pika.tail.rotation.y = 0.15 + Math.sin(time * 2.5) * 0.12 + Math.cos(time * 3.8) * 0.05;
      pika.tail.rotation.x = -0.45 + Math.sin(time * 1.2) * 0.05;
    }
    // Arm wave gesture — one arm raises periodically as a greeting
    const waveCycle = time % 10.0;
    const waveActive = waveCycle > 8.5 && waveCycle < 10.0;
    const waveAmount = waveActive ? Math.sin((waveCycle - 8.5) / 1.5 * PI) * 0.65 : 0;
    if (pika.leftArm) pika.leftArm.rotation.z = 0.55 + Math.sin(time * 1.2) * 0.18 - waveAmount;
    if (pika.rightArm) pika.rightArm.rotation.z = -0.55 + Math.sin(time * 1.2 + 1.0) * 0.18;
    // Blinking — natural blink pattern with double-blink
    const blinkPeriod = 3.5 + Math.sin(time * 0.1) * 0.5;
    const blinkPhase = time % blinkPeriod;
    const doubleBlink = blinkPhase > 0.35 && blinkPhase < 0.65;
    const blinkActive = blinkPhase < 0.15 || doubleBlink;
    const blinkT = blinkActive ? (doubleBlink ? (blinkPhase - 0.35) / 0.3 : blinkPhase / 0.15) : 0;
    // Happy squint during hop
    const happySquint = hopActive ? 0.35 : 0;
    const squintAmount = sparkBurst > 0 ? 0.4 : happySquint;
    const blinkY = blinkActive ? Math.max(0.01, 1.0 - Math.sin(blinkT * PI) * 0.99) : Math.max(0.01, squintAmount);
    if (pika.leftEyelid) pika.leftEyelid.scale.y = blinkY;
    if (pika.rightEyelid) pika.rightEyelid.scale.y = blinkY;
    // Ear twitching — independent, occasional + perk up during sparks + hop
    const chargeEarPerk = chargeLevel * -0.12;
    const earPerk = sparkBurst > 0 ? -0.08 : hopActive ? -0.06 : chargeEarPerk;
    const earTwitchL = Math.sin(time * 2.5) * 0.05 + (Math.sin(time * 7.3) > 0.95 ? 0.12 : 0) + earPerk;
    const earTwitchR = Math.sin(time * 2.5 + 0.6) * 0.05 + (Math.sin(time * 8.1 + 1.0) > 0.95 ? 0.12 : 0) + earPerk;
    if (pika.leftEarGroup) pika.leftEarGroup.rotation.x = -0.12 + earTwitchL;
    if (pika.rightEarGroup) pika.rightEarGroup.rotation.x = -0.12 + earTwitchR;
    // Electric sparks — always crackling, stronger during zap/charge
    const chargeSparkBoost = chargeLevel * 8.0;
    for (let si = 0; si < pika.sparkMats.length; si++) {
      const idlePhase = Math.sin(time * 8.0 + si * 2.7) * Math.sin(time * 3.1 + si * 1.3);
      const idle = 0.12 + Math.abs(idlePhase) * 0.30;
      const flicker = Math.sin(time * 45 + si * 2.7) * 0.5 + 0.5;
      pika.sparkMats[si].opacity = Math.min(1, Math.max(idle, zapStrength * (0.55 + flicker * 0.45)) + chargeLevel * (0.4 + flicker * chargeSparkBoost * 0.1));
    }
    // Sparks spin fast during a zap or charge
    pika.sparks.rotation.y += dt * (0.35 + zapStrength * 6.0 + chargeLevel * 12.0);
    // Eye tracking — pupils occasionally look toward viewer, drift around
    const viewerLook = Math.sin(time * 0.08) > 0.7 ? 0.01 : 0;
    const lookX = Math.sin(time * 0.18) * 0.015 + viewerLook;
    const lookY = Math.sin(time * 0.13 + 0.7) * 0.01;
    if (pika.leftPupil) { pika.leftPupil.position.x = -0.32 + lookX; pika.leftPupil.position.y = 0.055 + lookY; }
    if (pika.rightPupil) { pika.rightPupil.position.x = 0.32 + lookX; pika.rightPupil.position.y = 0.055 + lookY; }
    // Tongue subtle wiggle — more active during hop
    const tongueWiggle = hopActive ? 0.008 : 0.003;
    if (pika.tongue) pika.tongue.position.y = -0.12 + Math.sin(time * 2.0) * tongueWiggle;
    // Mouth expression — opens slightly during hop (happy face)
    if (pika.mouthMesh) {
      const mouthOpen = hopActive ? 0.03 : 0;
      pika.mouthMesh.position.y = -0.12 - mouthOpen;
    }
    // Electricity aura — always faintly visible, flares with zap or charge
    pika.auraMat.opacity = Math.max(0.04 + Math.sin(time * 4.0) * 0.02, Math.max(zapStrength * (0.15 + Math.sin(time * 30) * 0.05), chargeLevel * (0.4 + Math.sin(time * 40) * 0.1)));
    // Corona sprites — always-on electric glow (visible on all devices)
    for (let ci = 0; ci < pika.coronaMats.length; ci++) {
      const phase = Math.sin(time * 5.5 + ci * 2.1) * Math.cos(time * 3.2 + ci * 1.4);
      const base = 0.30 + Math.abs(phase) * 0.55;
      pika.coronaMats[ci].opacity = Math.min(1, base + zapStrength * 0.9 + chargeLevel * 2.0);
    }

    goldRing.rotation.z = 0.15 + time * 0.1;
    goldRMat.opacity = 0.4 + Math.sin(time * 0.8) * 0.05 + amp * 0.05;
    haloGlow.rotation.z = goldRing.rotation.z;
    haloGlowMat.opacity = 0.05 + Math.sin(time * 0.8) * 0.02 + amp * 0.03;
    cyanRing.rotation.z = -0.3 - time * 0.14;
    cyanRMat.opacity = 0.15 + Math.sin(time * 0.7) * 0.05;
    purpRing.rotation.z = 0.5 + time * 0.06;
    purpRing.rotation.x = PI * 0.62 + Math.sin(time * 0.2) * 0.1;
    purpRMat.opacity = 0.2 + Math.sin(time * 0.6) * 0.08 + amp * 0.12;
    accentRing.rotation.z = -0.8 + time * 0.18;
    accentRing.rotation.y = Math.sin(time * 0.15) * 0.2;
    accentRMat.opacity = 0.3 + Math.sin(time * 1.0) * 0.1;

    atmoMat.uniforms.uTime.value = time;
    atmoMat.uniforms.uEnergy.value = amp;

    for (let i = 0; i < PULSE_N; i++) {
      const pr = pulseRings[i];
      const t = ((time * 0.3 + pr.phase) % 1);
      const scale = 1.5 + t * 4.0;
      pr.mesh.scale.set(scale, scale, 1);
      pr.mat.uniforms.uOpacity.value = (1 - t) * 0.15 * (0.5 + amp);
    }

    glow1.scale.setScalar(4.0 + Math.sin(time * 0.8) * 0.5 + amp * 0.8);
    glow1Mat.opacity = 0.15 + amp * 0.12 + Math.sin(time * 0.6) * 0.03;
    glow2.scale.setScalar(6.5 + Math.sin(time * 0.5) * 0.6);
    glow2Mat.opacity = 0.07 + amp * 0.05;

    for (let i = 0; i < NODE_N; i++) {
      const o = nodeOrbs[i];
      o.angle += o.speed * dt;
      const nx = Math.cos(o.angle) * o.r;
      const ny = o.y + Math.sin(time * 0.25 + i * 0.9) * 0.2;
      const nz = Math.sin(o.angle) * o.r;
      nodeMeshes[i].position.set(nx, ny, nz);
      nodeMeshes[i].rotation.y = time * 2;
      nodeMeshes[i].rotation.x = time * 1.5;
      nodeGlows[i].position.set(nx, ny, nz);
      nodeGlows[i].scale.setScalar(0.2 + Math.sin(time * 1.2 + i) * 0.05 + amp * 0.06);
      const lp = nodeLines[i].geo.attributes.position as THREE.BufferAttribute;
      lp.setXYZ(0, 0, 0, 0);
      lp.setXYZ(1, nx, ny, nz);
      lp.needsUpdate = true;
    }

    const pp = pGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < PN; i++) {
      const po = pOrbs[i];
      po.a += po.spd * dt;
      pp.setXYZ(i,
        Math.cos(po.a) * po.r,
        po.y0 + Math.sin(time * 0.35 + i * 0.7) * 0.3 + Math.sin(po.a * 2) * po.tilt,
        Math.sin(po.a) * po.r,
      );
    }
    pp.needsUpdate = true;

    group.position.y = Math.sin(time * 0.2) * 0.12 + Math.sin(time * 0.07) * 0.05;
    group.position.x = Math.sin(time * 0.15 + 1) * 0.06;
    // Face the viewer at all times — only a tiny "looking around" sway, no full spin
    group.rotation.y = Math.sin(time * 0.25) * 0.12;

    if (mobPFX) {
      const cfg = POKEMON_PFX[mobileCurrentChar]; if (cfg) updateParticles(mobPFX, cfg);
    }

    if (useComposer && composer) {
      try { composer.render(); } catch { useComposer = false; }
    }
    if (!useComposer) {
      renderer.render(scene, camera);
    }
  }

  raf = requestAnimationFrame(frame);

  // Collect the gold cage / ring / line materials so the framework recolours to
  // match the active Pokemon (skips the character model itself).
  const mobAccentMats = collectAccentMats(group, pikaGroup);
  function mobApplyAccent(name: string) { applyAccentToMats(mobAccentMats, charAccent(name)); }
  mobApplyAccent('pikachu');

  return {
    setEnergy(v: number) { ampTarget = Math.max(0, Math.min(1, v)); },
    pikaEmote(emote: PikaEmote) {
      pikaEmoteSpeak(emote);
      if (emote === 'excited' || emote === 'happy') { ampTarget = 0.85; setTimeout(() => { ampTarget = 0.06; }, 1200); }
      if (emote === 'surprised') { ampTarget = 0.7; setTimeout(() => { ampTarget = 0.06; }, 800); }
      if (emote === 'curious') { ampTarget = 0.45; setTimeout(() => { ampTarget = 0.06; }, 900); }
      if (emote === 'sad') { ampTarget = 0.15; setTimeout(() => { ampTarget = 0.06; }, 1500); }
    },
    dispose() {
      cancelAnimationFrame(raf);
      stopCry();
      disposeParticles(mobPFX, scene);
      disposeChu();
      window.removeEventListener('resize', resize);
      if (envMap) envMap.dispose();
      if (composer) composer.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    },
    startBodyDetection() {},
    stopBodyDetection() {},
    setCharacter(name: string) {
      stopCry();
      disposeParticles(mobPFX, scene); mobPFX = null;
      mobileCurrentChar = name;
      renderer.setClearColor(charBg(name), 1);
      mobApplyAccent(name);
      mobPFX = createParticles(scene, name, true);
      loadAndReplaceBody(pikaGroup, pikaMats, import.meta.env.BASE_URL || '/', name, (m) => {
        mobileCurrentModel = m;
        flashArrival(m);
        playCry(name);
      });
    },
    throwPokeball: mobileThrowPokeball,
    getCharacterTransform() { return getCharXform(mobileCurrentChar); },
    setCharacterTransform(x: number, y: number, z: number, s: number, px: number, py: number, pz: number) {
      saveCharXform(mobileCurrentChar, { x, y, z, s, px, py, pz });
      if (mobileCurrentModel) {
        const bt = modelBaseTransform.get(mobileCurrentModel);
        const as = bt ? bt.s : 1;
        const acx = bt ? bt.cx : 0; const acy = bt ? bt.cy : 0; const acz = bt ? bt.cz : 0;
        mobileCurrentModel.scale.setScalar(as * s);
        mobileCurrentModel.position.set(acx + px, acy + py, acz + pz);
        mobileCurrentModel.rotation.set(x, y, z);
      }
    },
    resetCharacterTransform() {
      clearCharXform(mobileCurrentChar);
      const def = defaultXform(mobileCurrentChar);
      if (mobileCurrentModel) {
        const bt = modelBaseTransform.get(mobileCurrentModel);
        const as = bt ? bt.s : 1;
        const acx = bt ? bt.cx : 0; const acy = bt ? bt.cy : 0; const acz = bt ? bt.cz : 0;
        mobileCurrentModel.scale.setScalar(as);
        mobileCurrentModel.position.set(acx, acy, acz);
        mobileCurrentModel.rotation.set(def.x, def.y, def.z);
      }
    },
  };
}

// ============================================================
// MAIN: mountOrb — desktop renders same orb concept with full pipeline
// ============================================================
export function mountOrb(container: HTMLElement): OrbHandle {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
  if (isMobile) return mountMobileOrb(container);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    failIfMajorPerformanceCaveat: false,
  });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setClearColor(charBg("pikachu"), 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.75;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(0, 0.4, 6);
  camera.lookAt(0, 0, 0);

  let dMouseX = 0, dMouseY = 0;
  const onDeskMouseMove = (e: MouseEvent) => {
    dMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    dMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener('mousemove', onDeskMouseMove);

  // ────────────────────────────────────────────
  // POST-PROCESSING PIPELINE
  // ────────────────────────────────────────────
  const dpr0 = window.devicePixelRatio || 1;
  // Multisampled (MSAA) render target — crisp edges through the post pipeline
  const deskRT = new THREE.WebGLRenderTarget(
    Math.max(1, Math.floor((container.clientWidth || window.innerWidth) * dpr0)),
    Math.max(1, Math.floor((container.clientHeight || window.innerHeight) * dpr0)),
    { samples: 4 },
  );
  const composer = new EffectComposer(renderer, deskRT);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth * dpr0, window.innerHeight * dpr0),
    0.2, 0.4, 0.7,
  );
  composer.addPass(bloom);

  const vignette = new ShaderPass(GOLD_VIGNETTE_SHADER);
  vignette.uniforms.darkness.value = 0.5;
  composer.addPass(vignette);

  // FXAA — screen-space AA needed because MSAA is lost in EffectComposer
  const fxaa = new ShaderPass(FXAAShader);
  composer.addPass(fxaa);

  composer.addPass(new OutputPass());

  function resize() {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    const pr = window.devicePixelRatio || 1;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, true);
    composer.setSize(w * pr, h * pr);
    fxaa.uniforms['resolution'].value.set(1 / (w * pr), 1 / (h * pr));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const group = new THREE.Group();
  scene.add(group);

  // ── Lighting tuned for PBR MeshPhysicalMaterial ──
  // Key light — warm white, upper right
  const keyLight = new THREE.DirectionalLight(0xffffff, 4.5);
  keyLight.position.set(3, 5, 4);
  scene.add(keyLight);
  // Fill light — warm golden yellow from left
  const fillLight = new THREE.DirectionalLight(0xFFE45C, 2.2);
  fillLight.position.set(-4, 1, 3);
  scene.add(fillLight);
  // Rim light — crisp white backlight for silhouette pop
  const rimLight = new THREE.DirectionalLight(0xfff8f0, 2.8);
  rimLight.position.set(0, 2, -5);
  scene.add(rimLight);
  // Under fill — subtle warm bounce off floor
  const bottomLight = new THREE.DirectionalLight(0xdaa520, 0.8);
  bottomLight.position.set(0, -3, 2);
  scene.add(bottomLight);
  // Ambient — slightly elevated so dark parts stay warm, not muddy
  const ambientLight = new THREE.AmbientLight(0x2a1e08, 1.0);
  scene.add(ambientLight);

  // ────────────────────────────────────────────
  // CENTRAL OBJECT — PIKACHU IN GLASS ORB
  // ────────────────────────────────────────────
  const envMap = createEnvMap(renderer);
  if (envMap) scene.environment = envMap;
  const pikaMats = createPikachuMaterials(envMap);
  const pika = buildPikachu(pikaMats, 1.0);
  const pikaGroup = pika.group;
  group.add(pikaGroup);
  let deskCurrentChar = 'pikachu';
  let deskCurrentModel: THREE.Object3D | null = null;
  let deskPFX: PFXState | null = null;
  loadAndReplaceBody(pikaGroup, pikaMats, import.meta.env.BASE_URL || '/', 'pikachu', (m) => { deskCurrentModel = m; });
  const deskThrowPokeball = makeThrowPokeball(group, pikaGroup, import.meta.env.BASE_URL || '/');

  // ────────────────────────────────────────────
  // ORBITAL RINGS — prominent gold halo, champagne, rose
  // ────────────────────────────────────────────
  const rings: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }[] = [];
  const rData = [
    { r: 2.3, thick: 0.07, segs: 260, color: 0xdaa520, op: 0.95, rx: PI * 0.5, rz: 0.15 },
    { r: 1.9, thick: 0.015, segs: 200, color: 0xf5e6c8, op: 0.35, rx: PI * 0.38, rz: -0.3 },
    { r: 2.7, thick: 0.008, segs: 160, color: 0xc8956a, op: 0.22, rx: PI * 0.62, rz: 0.5 },
    { r: 1.7, thick: 0.006, segs: 140, color: 0xf0d090, op: 0.15, rx: PI * 0.7, rz: -0.8 },
  ];
  for (const rd of rData) {
    const rGeo = new THREE.TorusGeometry(rd.r, rd.thick, 24, rd.segs);
    const rMat = new THREE.MeshBasicMaterial({
      color: rd.color, transparent: true, opacity: rd.op, depthWrite: false,
    });
    const rMesh = new THREE.Mesh(rGeo, rMat);
    rMesh.rotation.x = rd.rx;
    rMesh.rotation.z = rd.rz;
    rMesh.visible = false;
    group.add(rMesh);
    rings.push({ mesh: rMesh, mat: rMat });
  }

  // Glow halo behind the primary gold ring — circular halo like the reference
  const dHaloGlowGeo = new THREE.TorusGeometry(2.3, 0.2, 24, 220);
  const dHaloGlowMat = new THREE.MeshBasicMaterial({
    color: 0xdaa520, transparent: true, opacity: 0.16, depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const dHaloGlow = new THREE.Mesh(dHaloGlowGeo, dHaloGlowMat);
  dHaloGlow.rotation.x = PI * 0.5;
  dHaloGlow.rotation.z = 0.15;
  dHaloGlow.visible = false;
  group.add(dHaloGlow);

  // ────────────────────────────────────────────
  // PULSE RINGS — 4 expanding waves
  // ────────────────────────────────────────────
  const PULSE_N = 4;
  const pulseRings: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; phase: number }[] = [];
  const pulseBaseGeo = new THREE.PlaneGeometry(1, 1);
  for (let i = 0; i < PULSE_N; i++) {
    const pm = new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: PULSE_RING_FRAG,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
    });
    const pmesh = new THREE.Mesh(pulseBaseGeo, pm);
    pmesh.rotation.x = -PI * 0.5;
    group.add(pmesh);
    pulseRings.push({ mesh: pmesh, mat: pm, phase: i / PULSE_N });
  }

  // ────────────────────────────────────────────
  // ENERGY TENDRILS — curved animated filaments from the surface outward
  // ────────────────────────────────────────────
  const TENDRIL_N = 8;
  const tendrils: { mat: THREE.ShaderMaterial; baseDir: THREE.Vector3; phase: number }[] = [];
  for (let i = 0; i < TENDRIL_N; i++) {
    const phi = Math.acos(2 * ((i + 0.5) / TENDRIL_N) - 1);
    const theta = i * 2.399963; // golden angle for even spread
    const baseDir = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta),
    ).normalize();
    const SEG = 24;
    const positions = new Float32Array((SEG + 1) * 3);
    const tAttr = new Float32Array(SEG + 1);
    // tangent for curving the tendril
    const tangent = new THREE.Vector3(-baseDir.z, 0.4, baseDir.x).normalize();
    for (let j = 0; j <= SEG; j++) {
      const t = j / SEG;
      const radius = 1.32 + t * 1.4;
      const curve = Math.sin(t * PI) * 0.5;
      const p = baseDir.clone().multiplyScalar(radius).addScaledVector(tangent, curve);
      positions[j * 3] = p.x;
      positions[j * 3 + 1] = p.y;
      positions[j * 3 + 2] = p.z;
      tAttr[j] = t;
    }
    const tGeo = new THREE.BufferGeometry();
    tGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    tGeo.setAttribute('aT', new THREE.BufferAttribute(tAttr, 1));
    const tMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 0.0 } },
      vertexShader: TENDRIL_VERT,
      fragmentShader: TENDRIL_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const tLine = new THREE.Line(tGeo, tMat);
    group.add(tLine);
    tendrils.push({ mat: tMat, baseDir, phase: i / TENDRIL_N });
  }

  // ────────────────────────────────────────────
  // LENS FLARE SPRITES — subtle gold flares around the orb
  // ────────────────────────────────────────────
  const lensFlares: { sprite: THREE.Sprite; mat: THREE.SpriteMaterial; baseScale: number; off: THREE.Vector3; speed: number }[] = [];
  const flareDefs = [
    { color: 0xffe8b0, scale: 1.6, off: new THREE.Vector3(1.6, 0.9, 0.4), speed: 1.1 },
    { color: 0xdaa520, scale: 2.4, off: new THREE.Vector3(-1.4, -0.7, 0.6), speed: 0.7 },
    { color: 0xf5e6c8, scale: 1.2, off: new THREE.Vector3(0.4, 1.5, -0.5), speed: 0.9 },
  ];
  for (const fd of flareDefs) {
    const fm = new THREE.SpriteMaterial({
      map: flareTexture(), color: fd.color, transparent: true, opacity: 0.0,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const fs = new THREE.Sprite(fm);
    fs.scale.setScalar(fd.scale);
    fs.position.copy(fd.off);
    group.add(fs);
    lensFlares.push({ sprite: fs, mat: fm, baseScale: fd.scale, off: fd.off, speed: fd.speed });
  }

  // ────────────────────────────────────────────
  // OUTER GLOW — layered sprites
  // ────────────────────────────────────────────
  const glow1Mat = new THREE.SpriteMaterial({
    map: glowTexture(), color: 0x4a3210, transparent: true, opacity: 0.05,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const glow1 = new THREE.Sprite(glow1Mat);
  glow1.scale.setScalar(4.0);
  group.add(glow1);

  const glow2Mat = new THREE.SpriteMaterial({
    map: glowTexture(), color: 0x2a1c0a, transparent: true, opacity: 0.025,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const glow2 = new THREE.Sprite(glow2Mat);
  glow2.scale.setScalar(6.0);
  group.add(glow2);

  // ────────────────────────────────────────────
  // ORBITING NETWORK NODES — 14 dots with connection lines
  // ────────────────────────────────────────────
  const NODE_N = 14;
  const nodeOrbs: { angle: number; r: number; speed: number; y: number }[] = [];
  const nodeMeshes: THREE.Mesh[] = [];
  const nodeGlows: THREE.Sprite[] = [];
  const nodeLines: { geo: THREE.BufferGeometry }[] = [];
  const nColors = [0xdaa520, 0xf5e6c8, 0xd4a84d, 0xc8956a, 0xf0d090,
                   0xdaa520, 0xf5e6c8, 0xd4a84d, 0xc8956a, 0xf0d090,
                   0xdaa520, 0xc8956a, 0xf5e6c8, 0xf0d090];

  for (let i = 0; i < NODE_N; i++) {
    const angle = (i / NODE_N) * PI2;
    const r = 3.0 + (i % 3) * 0.4;
    const nGeo = new THREE.IcosahedronGeometry(0.06, 1);
    const nMat = new THREE.MeshBasicMaterial({
      color: nColors[i], transparent: true, opacity: 0.85, depthWrite: false,
    });
    const nd = new THREE.Mesh(nGeo, nMat);
    const yy = (Math.random() - 0.5) * 1.0;
    nd.position.set(Math.cos(angle) * r, yy, Math.sin(angle) * r);
    nd.visible = false;
    group.add(nd);
    nodeMeshes.push(nd);
    nodeOrbs.push({ angle, r, speed: 0.015 + Math.random() * 0.03, y: yy });

    const ngMat = new THREE.SpriteMaterial({
      map: glowTexture(), color: nColors[i], transparent: true, opacity: 0.3,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const ng = new THREE.Sprite(ngMat);
    ng.scale.setScalar(0.35);
    ng.visible = false;
    group.add(ng);
    nodeGlows.push(ng);

    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const lMat = new THREE.LineBasicMaterial({
      color: nColors[i], transparent: true, opacity: 0.12, depthWrite: false,
    });
    const line = new THREE.Line(lGeo, lMat);
    line.visible = false;
    group.add(line);
    nodeLines.push({ geo: lGeo });
  }

  // ────────────────────────────────────────────
  // GRID FLOOR — holographic platform
  // ────────────────────────────────────────────
  const gridGeo = new THREE.PlaneGeometry(20, 20, 1, 1);
  const gridMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uEnergy: { value: 0 } },
    vertexShader: GRID_VERTEX,
    fragmentShader: GRID_FRAGMENT,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const gridFloor = new THREE.Mesh(gridGeo, gridMat);
  gridFloor.rotation.x = -PI / 2;
  gridFloor.position.y = -2.0;
  group.add(gridFloor);

  // Concentric base rings
  const baseRings: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }[] = [];
  const baseRR = [1.0, 1.5, 2.0, 2.6, 3.2, 4.0];
  const baseRC = [0xdaa520, 0xf5e6c8, 0xdaa520, 0xc8956a, 0xf0d090, 0xdaa520];
  for (let i = 0; i < baseRR.length; i++) {
    const brGeo = new THREE.TorusGeometry(baseRR[i], 0.005, 8, 180);
    const brMat = new THREE.MeshBasicMaterial({
      color: baseRC[i], transparent: true, opacity: 0.2 - i * 0.025, depthWrite: false,
    });
    const brMesh = new THREE.Mesh(brGeo, brMat);
    brMesh.rotation.x = PI * 0.5;
    brMesh.position.y = -2.0;
    group.add(brMesh);
    baseRings.push({ mesh: brMesh, mat: brMat });
  }

  // ────────────────────────────────────────────
  // DNA HELIX — double interleaved helices around the orb
  // ────────────────────────────────────────────
  const helixSegs = 300;
  const helixPtsA: number[] = [];
  const helixPtsB: number[] = [];
  const helixPtsC: number[] = [];
  const helixPtsD: number[] = [];
  for (let i = 0; i <= helixSegs; i++) {
    const t = i / helixSegs;
    const yy = -2.5 + t * 5.0;
    const r = 1.8 + Math.sin(t * PI * 2) * 0.15;
    const a = t * PI * 8;
    helixPtsA.push(r * Math.cos(a), yy, r * Math.sin(a));
    helixPtsB.push(r * Math.cos(a + PI), yy, r * Math.sin(a + PI));
    // Second helix — interleaved, different radius and opposite winding
    const r2 = 1.45 + Math.cos(t * PI * 2.0) * 0.12;
    const a2 = -t * PI * 8 + PI * 0.5;
    helixPtsC.push(r2 * Math.cos(a2), yy, r2 * Math.sin(a2));
    helixPtsD.push(r2 * Math.cos(a2 + PI), yy, r2 * Math.sin(a2 + PI));
  }
  function makeHelixLine(pts: number[], color: number, op: number): THREE.Line {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false });
    return new THREE.Line(g, m);
  }
  const helixLineA = makeHelixLine(helixPtsA, 0xdaa520, 0.15);
  const helixLineB = makeHelixLine(helixPtsB, 0xf5e6c8, 0.1);
  const helixLineC = makeHelixLine(helixPtsC, 0xc8956a, 0.1);
  const helixLineD = makeHelixLine(helixPtsD, 0xf0d090, 0.08);
  const helixMatA = helixLineA.material as THREE.LineBasicMaterial;
  const helixMatB = helixLineB.material as THREE.LineBasicMaterial;
  const helixMatC = helixLineC.material as THREE.LineBasicMaterial;
  const helixMatD = helixLineD.material as THREE.LineBasicMaterial;
  const helixGroup = new THREE.Group();
  helixGroup.add(helixLineA);
  helixGroup.add(helixLineB);
  const helixGroup2 = new THREE.Group();
  helixGroup2.add(helixLineC);
  helixGroup2.add(helixLineD);
  group.add(helixGroup);
  group.add(helixGroup2);

  // ────────────────────────────────────────────
  // FLOATING PARTICLES — 200 glowing motes
  // ────────────────────────────────────────────
  const PN = 200;
  const pPos = new Float32Array(PN * 3);
  const pPh = new Float32Array(PN);
  const pSz = new Float32Array(PN);
  const pCl = new Float32Array(PN * 3);
  const pOrbs: { a: number; r: number; spd: number; y0: number; tilt: number }[] = [];
  for (let i = 0; i < PN; i++) {
    const a = Math.random() * PI2;
    const r2 = 1.8 + Math.random() * 3.5;
    const tilt = (Math.random() - 0.5) * 0.6;
    pPos[i * 3] = Math.cos(a) * r2;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 4.0;
    pPos[i * 3 + 2] = Math.sin(a) * r2;
    pPh[i] = Math.random();
    pSz[i] = 1.0 + Math.random() * 2.5;
    const kind = Math.random();
    if (kind > 0.8) { pCl[i*3]=1; pCl[i*3+1]=0.85; pCl[i*3+2]=0.5; }
    else if (kind > 0.6) { pCl[i*3]=0.95; pCl[i*3+1]=0.9; pCl[i*3+2]=0.82; }
    else { pCl[i*3]=0.85; pCl[i*3+1]=0.68; pCl[i*3+2]=0.3; }
    pOrbs.push({ a, r: r2, spd: 0.03 + Math.random() * 0.08, y0: pPos[i*3+1], tilt });
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('aPhase', new THREE.BufferAttribute(pPh, 1));
  pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSz, 1));
  pGeo.setAttribute('aColor', new THREE.BufferAttribute(pCl, 3));
  const pMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: PART_VERT,
    fragmentShader: PART_FRAG,
    transparent: true, depthWrite: false,
  });
  const particles = new THREE.Points(pGeo, pMat);
  group.add(particles);

  // ────────────────────────────────────────────
  // ATMOSPHERIC GLOW — volumetric rim (sphere 64x64)
  // ────────────────────────────────────────────
  const atmosGeo = new THREE.SphereGeometry(1.8, 64, 64);
  const atmosMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uEnergy: { value: 0 } },
    vertexShader: ATMOSPHERE_VERT,
    fragmentShader: ATMOSPHERE_FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
  });
  const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
  group.add(atmosphere);

  // ────────────────────────────────────────────
  // SURFACE PARTICLES — dense cloud (500)
  // ────────────────────────────────────────────
  const SPN = 500;
  const spPos = new Float32Array(SPN * 3);
  const spPh = new Float32Array(SPN);
  const spSz = new Float32Array(SPN);
  const spCl = new Float32Array(SPN * 3);
  const spOrbs: { theta: number; phi: number; r: number; thetaSpd: number; phiSpd: number }[] = [];
  for (let i = 0; i < SPN; i++) {
    const theta = Math.random() * PI2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.38 + Math.random() * 0.12;
    spPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    spPos[i * 3 + 1] = r * Math.cos(phi);
    spPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    spPh[i] = Math.random();
    spSz[i] = 0.3 + Math.random() * 1.0;
    if (Math.random() > 0.85) { spCl[i*3]=1; spCl[i*3+1]=0.88; spCl[i*3+2]=0.55; }
    else { spCl[i*3]=0.85; spCl[i*3+1]=0.7; spCl[i*3+2]=0.35; }
    spOrbs.push({ theta, phi, r, thetaSpd: (Math.random() - 0.5) * 0.3, phiSpd: (Math.random() - 0.5) * 0.12 });
  }
  const spGeo = new THREE.BufferGeometry();
  spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
  spGeo.setAttribute('aPhase', new THREE.BufferAttribute(spPh, 1));
  spGeo.setAttribute('aSize', new THREE.BufferAttribute(spSz, 1));
  spGeo.setAttribute('aColor', new THREE.BufferAttribute(spCl, 3));
  const spMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: PART_VERT,
    fragmentShader: PART_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const surfaceParticles = new THREE.Points(spGeo, spMat);
  group.add(surfaceParticles);

  // ────────────────────────────────────────────
  // FAR-FIELD DEPTH STARS — 700
  // ────────────────────────────────────────────
  const starGroup = new THREE.Group();
  scene.add(starGroup);

  const STAR_N = 300;
  const stPos = new Float32Array(STAR_N * 3);
  const stPh = new Float32Array(STAR_N);
  const stSz = new Float32Array(STAR_N);
  const stCl = new Float32Array(STAR_N * 3);
  for (let i = 0; i < STAR_N; i++) {
    const theta = Math.random() * PI2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 14 + Math.random() * 20;
    stPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    stPos[i * 3 + 1] = r * Math.cos(phi);
    stPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    stPh[i] = Math.random();
    stSz[i] = 0.3 + Math.random() * 1.4;
    const k = Math.random();
    if (k > 0.7) { stCl[i*3]=1; stCl[i*3+1]=0.9; stCl[i*3+2]=0.6; }
    else if (k > 0.4) { stCl[i*3]=0.9; stCl[i*3+1]=0.8; stCl[i*3+2]=0.5; }
    else { stCl[i*3]=0.7; stCl[i*3+1]=0.6; stCl[i*3+2]=0.35; }
  }
  const stGeo = new THREE.BufferGeometry();
  stGeo.setAttribute('position', new THREE.BufferAttribute(stPos, 3));
  stGeo.setAttribute('aPhase', new THREE.BufferAttribute(stPh, 1));
  stGeo.setAttribute('aSize', new THREE.BufferAttribute(stSz, 1));
  stGeo.setAttribute('aColor', new THREE.BufferAttribute(stCl, 3));
  const stMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: PART_VERT,
    fragmentShader: PART_FRAG,
    transparent: true, depthWrite: false,
  });
  const farStars = new THREE.Points(stGeo, stMat);
  starGroup.add(farStars);

  const DUST_N = 100;
  const dustPos = new Float32Array(DUST_N * 3);
  const dustPh = new Float32Array(DUST_N);
  const dustSz = new Float32Array(DUST_N);
  const dustCl = new Float32Array(DUST_N * 3);
  const dustOrbs: { a: number; r: number; spd: number; y0: number }[] = [];
  for (let i = 0; i < DUST_N; i++) {
    const a = Math.random() * PI2;
    const r = 5 + Math.random() * 8;
    dustPos[i * 3] = Math.cos(a) * r;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    dustPos[i * 3 + 2] = Math.sin(a) * r;
    dustPh[i] = Math.random();
    dustSz[i] = 0.5 + Math.random() * 1.0;
    dustCl[i*3] = 0.8; dustCl[i*3+1] = 0.65; dustCl[i*3+2] = 0.3;
    dustOrbs.push({ a, r, spd: 0.01 + Math.random() * 0.03, y0: dustPos[i*3+1] });
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute('aPhase', new THREE.BufferAttribute(dustPh, 1));
  dustGeo.setAttribute('aSize', new THREE.BufferAttribute(dustSz, 1));
  dustGeo.setAttribute('aColor', new THREE.BufferAttribute(dustCl, 3));
  const dustMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: PART_VERT,
    fragmentShader: PART_FRAG,
    transparent: true, depthWrite: false,
  });
  const dustParticles = new THREE.Points(dustGeo, dustMat);
  scene.add(dustParticles);

  // ────────────────────────────────────────────
  // BODY DETECTION (MediaPipe)
  // ────────────────────────────────────────────
  let holisticActive = false;
  let holisticVideo: HTMLVideoElement | null = null;
  let holisticCanvas: HTMLCanvasElement | null = null;
  let holisticCtx: CanvasRenderingContext2D | null = null;
  let holisticInstance: any = null;
  let holisticCamera: any = null;
  let holisticOverlay: HTMLDivElement | null = null;

  function createHolisticOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'holisticOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;pointer-events:none;';
    const cvs = document.createElement('canvas');
    cvs.style.cssText = 'width:60%;height:70%;max-width:640px;max-height:480px;border-radius:16px;border:1px solid rgba(218,165,32,.2);box-shadow:0 0 40px rgba(218,165,32,.1);background:transparent;';
    overlay.appendChild(cvs);
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'position:absolute;top:20px;right:20px;width:36px;height:36px;border-radius:10px;background:rgba(10,8,6,.7);border:1px solid rgba(218,165,32,.2);color:#daa520;font-size:16px;cursor:pointer;pointer-events:all;z-index:10;backdrop-filter:blur(10px);';
    closeBtn.onclick = () => stopBodyDetection();
    overlay.appendChild(closeBtn);
    const label = document.createElement('div');
    label.style.cssText = 'position:absolute;top:20px;left:50%;transform:translateX(-50%);font-family:"Space Grotesk",sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#daa520;opacity:.7;background:rgba(10,8,6,.6);padding:6px 16px;border-radius:8px;border:1px solid rgba(218,165,32,.15);backdrop-filter:blur(10px);';
    label.textContent = 'BODY DETECTION';
    overlay.appendChild(label);
    const status = document.createElement('div');
    status.id = 'holisticStatus';
    status.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);font-family:"Space Grotesk",sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#daa520;opacity:.6;background:rgba(10,8,6,.6);padding:5px 14px;border-radius:8px;border:1px solid rgba(218,165,32,.15);backdrop-filter:blur(10px);';
    status.textContent = 'INITIALIZING...';
    overlay.appendChild(status);
    document.body.appendChild(overlay);
    holisticOverlay = overlay;
    holisticCanvas = cvs;
    holisticCtx = cvs.getContext('2d');
    return { cvs, status };
  }

  async function loadHolisticScripts(): Promise<boolean> {
    const scripts = [
      'https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
      'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
    ];
    for (const src of scripts) {
      if (document.querySelector(`script[src="${src}"]`)) continue;
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src; s.crossOrigin = 'anonymous';
        s.onload = () => resolve(); s.onerror = () => reject(new Error('Failed to load: ' + src));
        document.head.appendChild(s);
      });
    }
    return true;
  }

  async function startBodyDetection() {
    if (holisticActive) return;
    holisticActive = true;
    const { cvs, status } = createHolisticOverlay();
    try {
      await loadHolisticScripts();
      status.textContent = 'LOADING MODEL...';
      const W = window as any;
      const vid = document.createElement('video');
      vid.style.display = 'none';
      document.body.appendChild(vid);
      holisticVideo = vid;
      const holistic = new W.Holistic({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}` });
      holisticInstance = holistic;
      holistic.setOptions({ modelComplexity: 1, smoothLandmarks: true, refineFaceLandmarks: true });
      holistic.onResults((results: any) => {
        if (!holisticCtx || !holisticCanvas) return;
        const cw = cvs.width = cvs.clientWidth * (window.devicePixelRatio || 1);
        const ch = cvs.height = cvs.clientHeight * (window.devicePixelRatio || 1);
        const ctx = holisticCtx;
        ctx.clearRect(0, 0, cw, ch);
        ctx.save(); ctx.globalAlpha = 0.15;
        if (results.image) ctx.drawImage(results.image, 0, 0, cw, ch);
        ctx.restore();
        if (results.poseLandmarks) {
          W.drawConnectors(ctx, results.poseLandmarks, W.POSE_CONNECTIONS, { color: '#daa520', lineWidth: 2 });
          W.drawLandmarks(ctx, results.poseLandmarks, { color: '#f5e6c8', fillColor: '#f5e6c8', lineWidth: 1, radius: 3 });
        }
        if (results.faceLandmarks) W.drawConnectors(ctx, results.faceLandmarks, W.FACEMESH_TESSELATION, { color: 'rgba(218,165,32,0.3)', lineWidth: 0.5 });
        if (results.leftHandLandmarks) W.drawConnectors(ctx, results.leftHandLandmarks, W.HAND_CONNECTIONS, { color: '#c8956a', lineWidth: 1.5 });
        if (results.rightHandLandmarks) W.drawConnectors(ctx, results.rightHandLandmarks, W.HAND_CONNECTIONS, { color: '#daa520', lineWidth: 1.5 });
        status.textContent = 'TRACKING ACTIVE'; status.style.color = '#daa520';
      });
      const cam = new W.Camera(vid, { onFrame: async () => { await holistic.send({ image: vid }); }, width: 640, height: 480 });
      holisticCamera = cam;
      await cam.start();
      status.textContent = 'CAMERA READY';
    } catch (err: any) {
      status.textContent = 'ERROR: ' + (err.message || 'Camera failed');
      status.style.color = '#ff5d73';
    }
  }

  function stopBodyDetection() {
    holisticActive = false;
    if (holisticCamera) { try { holisticCamera.stop(); } catch {} holisticCamera = null; }
    if (holisticInstance) { try { holisticInstance.close(); } catch {} holisticInstance = null; }
    if (holisticVideo) { holisticVideo.remove(); holisticVideo = null; }
    if (holisticOverlay) { holisticOverlay.remove(); holisticOverlay = null; }
    holisticCanvas = null; holisticCtx = null;
  }

  // ────────────────────────────────────────────
  // ANIMATION
  // ────────────────────────────────────────────
  let chargeLevel = 0;
  const disposeChu = setupChuEffect(container, renderer.domElement, (lv) => { chargeLevel = lv; });

  // Drag rotation state
  let userRotY = 0, rotVel = 0;
  let dragActive = false, dragLastX = 0;
  const deskCvs = renderer.domElement;
  function onDragStart(x: number) { dragActive = true; dragLastX = x; rotVel = 0; }
  function onDragMove(x: number) {
    if (!dragActive) return;
    const dx = x - dragLastX; dragLastX = x;
    rotVel = dx * 0.012;
    userRotY += rotVel;
  }
  function onDragEnd() { dragActive = false; }
  deskCvs.addEventListener('mousedown', (e) => onDragStart(e.clientX));
  deskCvs.addEventListener('mousemove', (e) => onDragMove(e.clientX));
  deskCvs.addEventListener('mouseup', onDragEnd);
  deskCvs.addEventListener('mouseleave', onDragEnd);
  deskCvs.addEventListener('touchstart', (e) => { if (e.touches[0]) onDragStart(e.touches[0].clientX); }, { passive: true });
  deskCvs.addEventListener('touchmove', (e) => { if (e.touches[0]) onDragMove(e.touches[0].clientX); }, { passive: true });
  deskCvs.addEventListener('touchend', onDragEnd);

  let time = 0, raf = 0;
  let amp = 0.06, ampTarget = 0.06;
  let glitchStr = 0, nextGlitch = 3 + Math.random() * 5, glitchTimer = 0;
  let lastFrame = 0;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (document.hidden || document.body.classList.contains('bg-paused')) return;
    if (now - lastFrame < 33) return;
    lastFrame = now;
    const dt = 0.016;
    time += dt;
    amp += (ampTarget - amp) * 0.07;
    if (!dragActive) { rotVel *= 0.92; userRotY += rotVel; }

    // Long-press charge: ramp bloom and exposure
    bloom.strength = 0.2 + chargeLevel * 4.5;
    renderer.toneMappingExposure = 0.75 + chargeLevel * 2.5;

    glitchTimer += dt;
    if (glitchTimer >= nextGlitch) {
      glitchStr = 0.4 + Math.random() * 0.6;
      nextGlitch = glitchTimer + 2 + Math.random() * 6;
    }
    glitchStr *= 0.93;
    if (glitchStr < 0.01) glitchStr = 0;

    pMat.uniforms.uTime.value = time;
    gridMat.uniforms.uTime.value = time;
    gridMat.uniforms.uEnergy.value = amp;

    // ── Pikachu "life" animation ──
    // Body sway — gentle side-to-side idle tilting
    const sway = Math.sin(time * 0.45) * 0.04;
    pikaGroup.rotation.y = Math.sin(time * 0.35) * 0.35 + userRotY;
    pikaGroup.rotation.z = sway;
    // Periodic happy hop — quick bounce every ~8 seconds
    const hopCycle = time % 8.0;
    const hopActive = hopCycle > 7.4 && hopCycle < 7.8;
    const hopHeight = hopActive ? Math.sin((hopCycle - 7.4) / 0.4 * PI) * 0.15 : 0;
    pikaGroup.position.y = Math.sin(time * 0.7) * 0.06 + hopHeight;
    const breath = 1.0 + Math.sin(time * 1.2) * 0.02;
    const bounce = 1.0 + Math.max(0, Math.sin(time * 3.0)) * 0.008;
    const hopSquash = hopActive ? 1.0 + Math.sin((hopCycle - 7.4) / 0.4 * PI) * 0.04 : 1.0;
    pikaGroup.scale.set(breath * (1.0 / bounce) * (1.0 / hopSquash), breath * bounce * hopSquash, breath);
    if (pika.head) {
      // Curious head tilt — cycles between looking around and tilting curiously
      const curiousCycle = time % 12.0;
      const curiousTilt = curiousCycle > 5.0 && curiousCycle < 7.0
        ? Math.sin((curiousCycle - 5.0) / 2.0 * PI) * 0.12 : 0;
      pika.head.rotation.y = Math.sin(time * 0.5 + 0.5) * 0.14;
      pika.head.rotation.z = Math.sin(time * 0.3) * 0.05 + curiousTilt;
      pika.head.rotation.x = Math.sin(time * 0.25) * 0.04 + (curiousTilt > 0 ? -0.03 : 0);
    }
    // Periodic electric ZAP — strong lightning burst every ~5s
    const zapCycle = time % 5.0;
    const zapActive = zapCycle > 4.2;
    const zapStrength = zapActive ? Math.sin((zapCycle - 4.2) / 0.8 * PI) : 0;
    const sparkBurst = zapStrength > 0.25 ? 0.5 : 0;
    // Heartbeat cheek glow — "lub-dub" rhythm
    const hbPhase = (time * 1.2) % PI2;
    const lub = Math.max(0, Math.sin(hbPhase * 2.0)) > 0.85 ? 0.25 : 0;
    const dub = Math.max(0, Math.sin(hbPhase * 2.0 + 1.2)) > 0.9 ? 0.18 : 0;
    const cheekPulse = 0.08 + lub * 0.3 + dub * 0.2 + amp * 0.1 + sparkBurst * 0.3 + chargeLevel * 1.5;
    pika.cheekMatL.emissiveIntensity = cheekPulse;
    pika.cheekMatR.emissiveIntensity = cheekPulse;
    if (pika.tail) {
      // Multi-frequency wag with periodic wag bursts
      const wagBurst = (time % 6.0) > 5.0 ? 2.5 : 1.0;
      pika.tail.rotation.z = Math.sin(time * 1.8 * wagBurst) * 0.18 + Math.sin(time * 4.2) * 0.04;
      pika.tail.rotation.y = 0.15 + Math.sin(time * 2.5) * 0.12 + Math.cos(time * 3.8) * 0.05;
      pika.tail.rotation.x = -0.45 + Math.sin(time * 1.2) * 0.05;
    }
    // Arm wave gesture — one arm raises periodically as a greeting
    const waveCycle = time % 10.0;
    const waveActive = waveCycle > 8.5 && waveCycle < 10.0;
    const waveAmount = waveActive ? Math.sin((waveCycle - 8.5) / 1.5 * PI) * 0.65 : 0;
    if (pika.leftArm) pika.leftArm.rotation.z = 0.55 + Math.sin(time * 1.2) * 0.18 - waveAmount;
    if (pika.rightArm) pika.rightArm.rotation.z = -0.55 + Math.sin(time * 1.2 + 1.0) * 0.18;
    // Blinking — natural blink pattern with double-blink
    const blinkPeriod = 3.5 + Math.sin(time * 0.1) * 0.5;
    const blinkPhase = time % blinkPeriod;
    const doubleBlink = blinkPhase > 0.35 && blinkPhase < 0.65;
    const blinkActive = blinkPhase < 0.15 || doubleBlink;
    const blinkT = blinkActive ? (doubleBlink ? (blinkPhase - 0.35) / 0.3 : blinkPhase / 0.15) : 0;
    // Happy squint during hop
    const happySquint = hopActive ? 0.35 : 0;
    const squintAmount = sparkBurst > 0 ? 0.4 : happySquint;
    const blinkY = blinkActive ? Math.max(0.01, 1.0 - Math.sin(blinkT * PI) * 0.99) : Math.max(0.01, squintAmount);
    if (pika.leftEyelid) pika.leftEyelid.scale.y = blinkY;
    if (pika.rightEyelid) pika.rightEyelid.scale.y = blinkY;
    // Ear twitching — independent, occasional + perk up during sparks + charge
    const chargeEarPerk = chargeLevel * -0.12;
    const earPerk = sparkBurst > 0 ? -0.08 : hopActive ? -0.06 : chargeEarPerk;
    const earTwitchL = Math.sin(time * 2.5) * 0.05 + (Math.sin(time * 7.3) > 0.95 ? 0.12 : 0) + earPerk;
    const earTwitchR = Math.sin(time * 2.5 + 0.6) * 0.05 + (Math.sin(time * 8.1 + 1.0) > 0.95 ? 0.12 : 0) + earPerk;
    if (pika.leftEarGroup) pika.leftEarGroup.rotation.x = -0.12 + earTwitchL;
    if (pika.rightEarGroup) pika.rightEarGroup.rotation.x = -0.12 + earTwitchR;
    // Electric sparks — always crackling, stronger during ZAP or charge
    const chargeSparkBoost = chargeLevel * 8.0;
    for (let si = 0; si < pika.sparkMats.length; si++) {
      const idlePhase = Math.sin(time * 8.0 + si * 2.7) * Math.sin(time * 3.1 + si * 1.3);
      const idle = 0.12 + Math.abs(idlePhase) * 0.30;
      const flicker = Math.sin(time * 45 + si * 2.7) * 0.5 + 0.5;
      pika.sparkMats[si].opacity = Math.min(1, Math.max(idle, zapStrength * (0.55 + flicker * 0.45)) + chargeLevel * (0.4 + flicker * chargeSparkBoost * 0.1));
    }
    // Sparks spin fast during a zap or charge
    pika.sparks.rotation.y += dt * (0.35 + zapStrength * 6.0 + chargeLevel * 12.0);
    // Eye tracking — pupils occasionally look toward viewer (mouse), drift around
    const viewerLookD = dMouseX * 0.008;
    const viewerLookYD = dMouseY * -0.005;
    const lookX = Math.sin(time * 0.18) * 0.015 + viewerLookD;
    const lookY = Math.sin(time * 0.13 + 0.7) * 0.01 + viewerLookYD;
    if (pika.leftPupil) { pika.leftPupil.position.x = -0.32 + lookX; pika.leftPupil.position.y = 0.055 + lookY; }
    if (pika.rightPupil) { pika.rightPupil.position.x = 0.32 + lookX; pika.rightPupil.position.y = 0.055 + lookY; }
    // Tongue subtle wiggle — more active during hop
    const tongueWiggle = hopActive ? 0.008 : 0.003;
    if (pika.tongue) pika.tongue.position.y = -0.12 + Math.sin(time * 2.0) * tongueWiggle;
    // Mouth expression — opens slightly during hop (happy face)
    if (pika.mouthMesh) {
      const mouthOpen = hopActive ? 0.03 : 0;
      pika.mouthMesh.position.y = -0.12 - mouthOpen;
    }
    // Electricity aura — always faintly visible, flares with zap or charge
    pika.auraMat.opacity = Math.max(0.04 + Math.sin(time * 4.0) * 0.02, Math.max(zapStrength * (0.15 + Math.sin(time * 30) * 0.05), chargeLevel * (0.4 + Math.sin(time * 40) * 0.1)));
    // Corona sprites — always-on electric glow (visible on all devices)
    for (let ci = 0; ci < pika.coronaMats.length; ci++) {
      const phase = Math.sin(time * 5.5 + ci * 2.1) * Math.cos(time * 3.2 + ci * 1.4);
      const base = 0.30 + Math.abs(phase) * 0.55;
      pika.coronaMats[ci].opacity = Math.min(1, base + zapStrength * 0.9 + chargeLevel * 2.0);
    }

    rings[0].mesh.rotation.z = 0.15 + time * 0.07;
    rings[0].mat.opacity = 0.9 + Math.sin(time * 0.6) * 0.06 + amp * 0.04;
    dHaloGlow.rotation.z = rings[0].mesh.rotation.z;
    dHaloGlowMat.opacity = 0.14 + Math.sin(time * 0.6) * 0.04 + amp * 0.08;
    rings[1].mesh.rotation.z = -0.3 - time * 0.1;
    rings[1].mat.opacity = 0.22 + Math.sin(time * 0.5) * 0.04;
    rings[2].mesh.rotation.z = 0.5 + time * 0.04;
    rings[2].mesh.rotation.x = PI * 0.62 + Math.sin(time * 0.15) * 0.08;
    rings[2].mat.opacity = 0.12 + Math.sin(time * 0.45) * 0.03 + amp * 0.04;
    rings[3].mesh.rotation.z = -0.8 + time * 0.12;
    rings[3].mat.opacity = 0.08 + Math.sin(time * 0.55) * 0.02;

    for (let i = 0; i < PULSE_N; i++) {
      const pr = pulseRings[i];
      const t = ((time * 0.25 + pr.phase) % 1);
      const scale = 2.0 + t * 6.0;
      pr.mesh.scale.set(scale, scale, 1);
      pr.mat.uniforms.uOpacity.value = (1 - t) * 0.06 * (0.5 + amp);
    }

    // Energy tendrils — animate pulse + opacity
    for (let i = 0; i < TENDRIL_N; i++) {
      const td = tendrils[i];
      td.mat.uniforms.uTime.value = time + td.phase * 6.28;
      td.mat.uniforms.uOpacity.value = (0.1 + amp * 0.25) * (0.5 + 0.5 * Math.sin(time * 0.8 + i));
    }

    // Lens flares — gentle drift, opacity tied to energy
    for (let i = 0; i < lensFlares.length; i++) {
      const lf = lensFlares[i];
      const pulse = 0.5 + 0.5 * Math.sin(time * lf.speed + i * 1.7);
      lf.mat.opacity = (0.05 + amp * 0.18) * (0.4 + pulse * 0.6);
      lf.sprite.scale.setScalar(lf.baseScale * (0.9 + pulse * 0.2 + amp * 0.3));
      lf.sprite.position.set(
        lf.off.x + Math.sin(time * 0.2 + i) * 0.1,
        lf.off.y + Math.cos(time * 0.18 + i) * 0.1,
        lf.off.z,
      );
    }

    glow1.scale.setScalar(3.5 + Math.sin(time * 0.6) * 0.3 + amp * 0.4);
    glow1Mat.opacity = 0.04 + amp * 0.03 + Math.sin(time * 0.5) * 0.01;
    glow2.scale.setScalar(5.5 + Math.sin(time * 0.4) * 0.3);
    glow2Mat.opacity = 0.02 + amp * 0.015;

    atmosMat.uniforms.uTime.value = time;
    atmosMat.uniforms.uEnergy.value = amp;
    atmosphere.rotation.y = time * 0.03;

    spMat.uniforms.uTime.value = time;
    const spp = spGeo.attributes.position as THREE.BufferAttribute;
    for (let j = 0; j < SPN; j++) {
      const so = spOrbs[j];
      so.theta += so.thetaSpd * dt;
      so.phi += so.phiSpd * dt * 0.5;
      spp.setXYZ(j,
        so.r * Math.sin(so.phi) * Math.cos(so.theta),
        so.r * Math.cos(so.phi),
        so.r * Math.sin(so.phi) * Math.sin(so.theta),
      );
    }
    spp.needsUpdate = true;

    for (let i = 0; i < NODE_N; i++) {
      const o = nodeOrbs[i];
      o.angle += o.speed * dt;
      const nx = Math.cos(o.angle) * o.r;
      const ny = o.y + Math.sin(time * 0.2 + i * 0.7) * 0.25;
      const nz = Math.sin(o.angle) * o.r;
      nodeMeshes[i].position.set(nx, ny, nz);
      nodeMeshes[i].rotation.y = time * 1.5;
      nodeMeshes[i].rotation.x = time * 1.0;
      nodeGlows[i].position.set(nx, ny, nz);
      nodeGlows[i].scale.setScalar(0.18 + Math.sin(time * 1.0 + i) * 0.04 + amp * 0.03);
      const lp = nodeLines[i].geo.attributes.position as THREE.BufferAttribute;
      lp.setXYZ(0, 0, 0, 0);
      lp.setXYZ(1, nx, ny, nz);
      lp.needsUpdate = true;
    }

    for (let i = 0; i < baseRings.length; i++) {
      baseRings[i].mesh.rotation.z = time * (0.03 + i * 0.015) * (i % 2 === 0 ? 1 : -1);
      baseRings[i].mat.opacity = (0.09 - i * 0.0125) + amp * 0.04;
    }

    helixGroup.rotation.y = time * 0.1;
    helixGroup2.rotation.y = -time * 0.08;
    helixMatA.opacity = 0.09 + amp * 0.07 + Math.sin(time * 1.2) * 0.024;
    helixMatB.opacity = 0.06 + amp * 0.06 + Math.sin(time * 1.2 + 1) * 0.018;
    helixMatC.opacity = 0.06 + amp * 0.05 + Math.sin(time * 1.0 + 2) * 0.018;
    helixMatD.opacity = 0.04 + amp * 0.04 + Math.sin(time * 1.0 + 3) * 0.012;

    const pp = pGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < PN; i++) {
      const po = pOrbs[i];
      po.a += po.spd * dt;
      pp.setXYZ(i,
        Math.cos(po.a) * po.r,
        po.y0 + Math.sin(time * 0.3 + i * 0.5) * 0.4 + Math.sin(po.a * 2) * po.tilt,
        Math.sin(po.a) * po.r,
      );
    }
    pp.needsUpdate = true;

    group.position.y = Math.sin(time * 0.15) * 0.1 + Math.sin(time * 0.06) * 0.04;
    group.position.x = Math.sin(time * 0.12 + 1) * 0.05;
    // Face the viewer — gentle sway only, no continuous spin
    group.rotation.y = Math.sin(time * 0.22) * 0.1;

    const tCamX = dMouseX * 0.9;
    const tCamY = 0.4 + dMouseY * -0.6;
    camera.position.x += (tCamX - camera.position.x) * 0.035;
    camera.position.y += (tCamY - camera.position.y) * 0.035;
    camera.lookAt(0, 0, 0);

    stMat.uniforms.uTime.value = time;
    starGroup.rotation.y = time * 0.004;
    starGroup.rotation.x = Math.sin(time * 0.015) * 0.02;

    dustMat.uniforms.uTime.value = time;
    const dp = dustGeo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < DUST_N; i++) {
      const d = dustOrbs[i];
      d.a += d.spd * dt;
      dp.setXYZ(i,
        Math.cos(d.a) * d.r,
        d.y0 + Math.sin(time * 0.12 + i * 0.3) * 0.6,
        Math.sin(d.a) * d.r,
      );
    }
    dp.needsUpdate = true;

    if (deskPFX) {
      const cfg = POKEMON_PFX[deskCurrentChar]; if (cfg) updateParticles(deskPFX, cfg);
    }

    composer.render();
  }

  raf = requestAnimationFrame(frame);

  // Collect the gold cage / ring / line materials so the whole framework can be
  // recoloured to match the active Pokemon (skips the character model itself).
  const deskAccentMats = collectAccentMats(group, pikaGroup);
  function deskApplyAccent(name: string) { applyAccentToMats(deskAccentMats, charAccent(name)); }
  deskApplyAccent('pikachu');

  return {
    setEnergy(v: number) { ampTarget = Math.max(0, Math.min(1, v)); },
    pikaEmote(emote: PikaEmote) {
      pikaEmoteSpeak(emote);
      if (emote === 'excited' || emote === 'happy') {
        ampTarget = 0.85;
        setTimeout(() => { ampTarget = 0.06; }, 1200);
      } else if (emote === 'surprised') {
        ampTarget = 0.7;
        setTimeout(() => { ampTarget = 0.06; }, 800);
      } else if (emote === 'curious') {
        ampTarget = 0.45;
        setTimeout(() => { ampTarget = 0.06; }, 900);
      } else if (emote === 'sad') {
        ampTarget = 0.15;
        setTimeout(() => { ampTarget = 0.06; }, 1500);
      }
    },
    dispose() {
      cancelAnimationFrame(raf);
      stopCry();
      disposeParticles(deskPFX, scene);
      disposeChu();
      stopBodyDetection();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onDeskMouseMove);
      if (envMap) envMap.dispose();
      renderer.dispose();
      composer.dispose();
      container.removeChild(renderer.domElement);
    },
    startBodyDetection,
    stopBodyDetection,
    setCharacter(name: string) {
      stopCry();
      disposeParticles(deskPFX, scene); deskPFX = null;
      deskCurrentChar = name;
      renderer.setClearColor(charBg(name), 1);
      deskApplyAccent(name);
      deskPFX = createParticles(scene, name, false);
      loadAndReplaceBody(pikaGroup, pikaMats, import.meta.env.BASE_URL || '/', name, (m) => {
        deskCurrentModel = m;
        flashArrival(m);
        playCry(name);
      });
    },
    throwPokeball: deskThrowPokeball,
    getCharacterTransform() { return getCharXform(deskCurrentChar); },
    setCharacterTransform(x: number, y: number, z: number, s: number, px: number, py: number, pz: number) {
      saveCharXform(deskCurrentChar, { x, y, z, s, px, py, pz });
      if (deskCurrentModel) {
        const bt = modelBaseTransform.get(deskCurrentModel);
        const as = bt ? bt.s : 1;
        const acx = bt ? bt.cx : 0; const acy = bt ? bt.cy : 0; const acz = bt ? bt.cz : 0;
        deskCurrentModel.scale.setScalar(as * s);
        deskCurrentModel.position.set(acx + px, acy + py, acz + pz);
        deskCurrentModel.rotation.set(x, y, z);
      }
    },
    resetCharacterTransform() {
      clearCharXform(deskCurrentChar);
      const def = defaultXform(deskCurrentChar);
      if (deskCurrentModel) {
        const bt = modelBaseTransform.get(deskCurrentModel);
        const as = bt ? bt.s : 1;
        const acx = bt ? bt.cx : 0; const acy = bt ? bt.cy : 0; const acz = bt ? bt.cz : 0;
        deskCurrentModel.scale.setScalar(as);
        deskCurrentModel.position.set(acx, acy, acz);
        deskCurrentModel.rotation.set(def.x, def.y, def.z);
      }
    },
  };
}
