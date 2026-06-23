import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

export interface OrbHandle {
  setEnergy(v: number): void;
  dispose(): void;
  startBodyDetection(): void;
  stopBodyDetection(): void;
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

// Subtle radial chromatic aberration
const CHROMATIC_SHADER = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    amount: { value: 0.002 },
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
    uniform float amount;
    varying vec2 vUv;
    void main() {
      vec2 dir = vUv - 0.5;
      float d = length(dir);
      vec2 offset = dir * d * amount * 60.0;
      float r = texture2D(tDiffuse, vUv + offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - offset).b;
      float a = texture2D(tDiffuse, vUv).a;
      gl_FragColor = vec4(r, g, b, a);
    }
  `,
};

// Warm color grading — slight contrast boost, warm tint in shadows
const COLOR_GRADE_SHADER = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    contrast: { value: 1.08 },
    brightness: { value: 0.01 },
    tint: { value: new THREE.Color(1.06, 0.99, 0.9) },
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
    uniform float contrast;
    uniform float brightness;
    uniform vec3 tint;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 col = texel.rgb;
      // Contrast
      col = (col - 0.5) * contrast + 0.5;
      // Brightness
      col += brightness;
      // Warm tint in shadows
      float lum = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(col * tint, col, smoothstep(0.0, 0.5, lum));
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), texel.a);
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
function createEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture {
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
}

function createPikachuMaterials(envMap: THREE.Texture): PikachuMaterials {
  return {
    yellow: new THREE.MeshPhysicalMaterial({
      color: 0xFDD835, metalness: 0.0, roughness: 0.55, envMap, envMapIntensity: 0.25,
      clearcoat: 0.15, clearcoatRoughness: 0.3,
      sheen: 0.1, sheenRoughness: 0.5, sheenColor: new THREE.Color(0xFFEB3B),
    }),
    darkYellow: new THREE.MeshPhysicalMaterial({
      color: 0xC8A415, metalness: 0.0, roughness: 0.55, envMap, envMapIntensity: 0.2,
      clearcoat: 0.1, clearcoatRoughness: 0.35,
    }),
    cream: new THREE.MeshPhysicalMaterial({
      color: 0xFFFDE7, metalness: 0.0, roughness: 0.5, envMap, envMapIntensity: 0.2,
      clearcoat: 0.1, clearcoatRoughness: 0.3,
    }),
    red: new THREE.MeshPhysicalMaterial({
      color: 0xE53935, metalness: 0.0, roughness: 0.45, envMap, envMapIntensity: 0.2,
      emissive: 0xE53935, emissiveIntensity: 0.08,
      clearcoat: 0.15, clearcoatRoughness: 0.2,
    }),
    brown: new THREE.MeshPhysicalMaterial({
      color: 0x5D4037, metalness: 0.0, roughness: 0.55, envMap, envMapIntensity: 0.2,
      clearcoat: 0.1, clearcoatRoughness: 0.3,
    }),
    white: new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.0, roughness: 0.15, envMap, envMapIntensity: 0.2,
      emissive: 0xffffff, emissiveIntensity: 0.3,
      clearcoat: 0.3, clearcoatRoughness: 0.1,
    }),
    black: new THREE.MeshPhysicalMaterial({
      color: 0x0A0A0A, metalness: 0.05, roughness: 0.25, envMap, envMapIntensity: 0.2,
      clearcoat: 0.3, clearcoatRoughness: 0.15,
    }),
    mouth: new THREE.MeshPhysicalMaterial({
      color: 0x8B1A1A, metalness: 0.0, roughness: 0.5, envMap, envMapIntensity: 0.1,
      clearcoat: 0.1, clearcoatRoughness: 0.3,
    }),
    nose: new THREE.MeshPhysicalMaterial({
      color: 0x151515, metalness: 0.05, roughness: 0.3, envMap, envMapIntensity: 0.2,
      clearcoat: 0.25, clearcoatRoughness: 0.15,
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
}

function buildPikachu(mats: PikachuMaterials, detail: number): PikachuParts {
  const group = new THREE.Group();
  const headGroup = new THREE.Group();
  const seg = (n: number) => Math.max(8, Math.round(n * detail));

  // ── Body — round chubby torso, squatter for anime proportions ──
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.78, seg(48), seg(48)),
    mats.yellow,
  );
  body.scale.set(1.08, 1.02, 0.95);
  body.position.set(0, -0.32, 0);
  group.add(body);

  // Shoulder area — smoother transition to head
  const shoulders = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, seg(32), seg(32)),
    mats.yellow,
  );
  shoulders.scale.set(1.08, 0.55, 0.92);
  shoulders.position.set(0, 0.18, 0.02);
  group.add(shoulders);

  // Neck — subtle cylinder connecting head and body
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.38, 0.18, seg(16)),
    mats.yellow,
  );
  neck.position.set(0, 0.4, 0.02);
  group.add(neck);

  // Belly — lighter cream patch on the front
  const belly = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, seg(32), seg(32)),
    mats.cream,
  );
  belly.scale.set(0.85, 0.82, 0.38);
  belly.position.set(0, -0.32, 0.38);
  group.add(belly);

  // Belly border — subtle darkYellow ring at cream edge for definition
  const bellyRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.44, 0.015, seg(8), seg(24)),
    mats.darkYellow,
  );
  bellyRing.scale.set(0.82, 0.78, 0.15);
  bellyRing.position.set(0, -0.32, 0.42);
  group.add(bellyRing);

  // Back stripes — two brown horizontal stripes, wider and more visible
  for (const sy of [0.0, -0.22]) {
    const stripe = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.04, 0.58, seg(4), seg(10)),
      mats.brown,
    );
    stripe.rotation.z = PI / 2;
    stripe.position.set(0, -0.12 + sy, -0.68);
    stripe.rotation.x = 0.2;
    group.add(stripe);
  }

  // Lower body roundness — hip/bottom area for chubbier look
  const hips = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, seg(24), seg(24)),
    mats.yellow,
  );
  hips.scale.set(1.12, 0.52, 0.88);
  hips.position.set(0, -0.72, 0.02);
  group.add(hips);

  // ── Head — big round head, anime-accurate large head relative to body ──
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.84, seg(48), seg(48)),
    mats.yellow,
  );
  head.scale.set(1.12, 1.0, 0.92);
  head.position.set(0, 0.0, 0.06);
  headGroup.add(head);

  // Top-of-head tuft — subtle point on the crown
  const headTuft = new THREE.Mesh(
    new THREE.ConeGeometry(0.1, 0.14, seg(8)),
    mats.yellow,
  );
  headTuft.position.set(0, 0.8, -0.05);
  headGroup.add(headTuft);

  // Cheek bulges — rounder face with prominent cheek area, wider for anime look
  for (const sx of [-1, 1]) {
    const cheekBulge = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, seg(20), seg(20)),
      mats.yellow,
    );
    cheekBulge.scale.set(0.58, 0.52, 0.42);
    cheekBulge.position.set(sx * 0.48, -0.06, 0.44);
    headGroup.add(cheekBulge);
  }

  // Front face plate — flatter front for clearer facial features
  const facePlate = new THREE.Mesh(
    new THREE.SphereGeometry(0.72, seg(32), seg(32)),
    mats.yellow,
  );
  facePlate.scale.set(1.1, 1.0, 0.25);
  facePlate.position.set(0, -0.02, 0.52);
  headGroup.add(facePlate);

  // Back of head — smooth continuation
  const backHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, seg(24), seg(24)),
    mats.yellow,
  );
  backHead.scale.set(1.3, 0.85, 0.72);
  backHead.position.set(0, -0.03, -0.46);
  headGroup.add(backHead);

  // ── Ears — LONG pointed anime-accurate, sharp taper with black tips ──
  let leftEarGroup!: THREE.Group;
  let rightEarGroup!: THREE.Group;
  for (const sx of [-1, 1]) {
    const earGroup = new THREE.Group();

    // Ear base — wide attachment to head
    const earBase = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, seg(14), seg(14)),
      mats.yellow,
    );
    earBase.scale.set(1.15, 0.45, 0.65);
    earBase.position.set(0, 0.08, 0);
    earGroup.add(earBase);

    // Main ear body — long pointed shape, wider at base tapering to sharp point
    const earBody = new THREE.Mesh(
      new THREE.ConeGeometry(0.15, 0.85, seg(20)),
      mats.yellow,
    );
    earBody.position.set(0, 0.52, 0);
    earBody.scale.set(1.0, 1.0, 0.45);
    earGroup.add(earBody);

    // Ear mid section — fills out the lower/middle part
    const earMid = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, seg(16), seg(16)),
      mats.yellow,
    );
    earMid.scale.set(1.05, 2.2, 0.42);
    earMid.position.set(0, 0.38, 0);
    earGroup.add(earMid);

    // Ear upper taper — sharper cone narrowing to fine point
    const earUpper = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.55, seg(16)),
      mats.yellow,
    );
    earUpper.position.set(0, 0.82, 0);
    earUpper.scale.set(1.0, 1.0, 0.4);
    earGroup.add(earUpper);

    // Inner ear — warm darker yellow stripe
    const innerEarMat = new THREE.MeshPhysicalMaterial({
      color: 0xD4A017, metalness: 0.0, roughness: 0.45,
      clearcoat: 0.15, clearcoatRoughness: 0.3,
    });
    const innerEar = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, seg(12), seg(12)),
      innerEarMat,
    );
    innerEar.scale.set(0.7, 2.0, 0.18);
    innerEar.position.set(0, 0.38, 0.06);
    earGroup.add(innerEar);

    // Black tip — top ~35% of ear, larger and more prominent
    const earTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.085, 0.48, seg(12)),
      mats.black,
    );
    earTip.position.set(0, 0.98, 0);
    earTip.scale.set(1.0, 1.0, 0.42);
    earGroup.add(earTip);

    // Black tip accent — smooth sphere at very top for rounded point
    const earTipBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, seg(8), seg(8)),
      mats.black,
    );
    earTipBall.position.set(0, 1.2, 0);
    earGroup.add(earTipBall);

    earGroup.position.set(sx * 0.46, 0.58, -0.1);
    earGroup.rotation.z = sx * 0.35;
    earGroup.rotation.x = -0.08;
    headGroup.add(earGroup);
    if (sx === -1) leftEarGroup = earGroup;
    else rightEarGroup = earGroup;
  }

  // ── Eyes — BIG anime-style, mostly dark with prominent white highlights ──
  let leftEyelid!: THREE.Mesh;
  let rightEyelid!: THREE.Mesh;
  let leftPupil!: THREE.Mesh;
  let rightPupil!: THREE.Mesh;
  let leftEye!: THREE.Mesh;
  let rightEye!: THREE.Mesh;
  for (const sx of [-1, 1]) {
    // Eye socket — indent for depth
    const eyeSocket = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, seg(20), seg(20)),
      mats.yellow,
    );
    eyeSocket.scale.set(0.78, 1.12, 0.28);
    eyeSocket.position.set(sx * 0.3, 0.06, 0.66);
    headGroup.add(eyeSocket);

    // White of eye — thin border visible around edges
    const eyeWhiteMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, seg(28), seg(28)),
      mats.white,
    );
    eyeWhiteMesh.scale.set(0.78, 1.12, 0.48);
    eyeWhiteMesh.position.set(sx * 0.3, 0.07, 0.66);
    headGroup.add(eyeWhiteMesh);

    // Main eye — large dark circle filling most of the eye area (anime-accurate)
    const eyeDarkMat = new THREE.MeshPhysicalMaterial({
      color: 0x1A1008, metalness: 0.02, roughness: 0.25,
      clearcoat: 0.3, clearcoatRoughness: 0.12,
      envMap: mats.black.envMap, envMapIntensity: 0.15,
    });
    const eyeDark = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, seg(28), seg(28)),
      eyeDarkMat,
    );
    eyeDark.scale.set(0.82, 1.1, 0.48);
    eyeDark.position.set(sx * 0.3, 0.06, 0.69);
    headGroup.add(eyeDark);
    if (sx === -1) leftEye = eyeDark;
    else rightEye = eyeDark;

    // Pupil — slightly darker center (tracked for eye-look animation)
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, seg(24), seg(24)),
      mats.black,
    );
    pupil.scale.set(0.82, 1.05, 0.48);
    pupil.position.set(sx * 0.3, 0.055, 0.72);
    headGroup.add(pupil);
    if (sx === -1) leftPupil = pupil;
    else rightPupil = pupil;

    // Primary highlight — BIG bright white circle (anime signature)
    const hl1 = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, seg(14), seg(14)),
      mats.white,
    );
    hl1.position.set(sx * 0.3 + sx * 0.05, 0.14, 0.78);
    headGroup.add(hl1);

    // Secondary highlight — smaller, lower opposite corner
    const hl2 = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, seg(10), seg(10)),
      mats.white,
    );
    hl2.position.set(sx * 0.3 - sx * 0.045, -0.01, 0.78);
    headGroup.add(hl2);

    // Eye outline — dark border for crisp definition
    const eyeOutlineMat = new THREE.MeshBasicMaterial({
      color: 0x0A0804, transparent: true, opacity: 0.5,
      depthWrite: false, side: THREE.BackSide,
    });
    const eyeOutline = new THREE.Mesh(
      new THREE.SphereGeometry(0.23, seg(20), seg(20)),
      eyeOutlineMat,
    );
    eyeOutline.scale.set(0.8, 1.14, 0.5);
    eyeOutline.position.set(sx * 0.3, 0.07, 0.65);
    headGroup.add(eyeOutline);

    // Eyelid — yellow half-sphere for blinking
    const eyelid = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, seg(24), seg(12), 0, PI2, 0, PI * 0.5),
      mats.yellow,
    );
    eyelid.scale.set(0.78, 0.01, 0.52);
    eyelid.position.set(sx * 0.3, 0.18, 0.67);
    eyelid.rotation.x = -0.08;
    headGroup.add(eyelid);
    if (sx === -1) leftEyelid = eyelid;
    else rightEyelid = eyelid;
  }

  // ── Nose — small black triangle, anime-accurate ──
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.035, 0.03, seg(3)),
    mats.nose,
  );
  nose.rotation.x = PI / 2;
  nose.rotation.z = PI;
  nose.position.set(0, -0.02, 0.78);
  headGroup.add(nose);

  // ── Mouth — clear ω shape, Pikachu's signature smile ──
  const mouthLineMat = new THREE.MeshPhysicalMaterial({
    color: 0x0C0202, metalness: 0.0, roughness: 0.3,
    clearcoat: 0.3, clearcoatRoughness: 0.2,
  });

  // Left arc of the ω — wider, thicker for visibility
  const mouthMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.085, 0.032, seg(12), seg(24), PI * 0.82),
    mouthLineMat,
  );
  mouthMesh.position.set(-0.05, -0.12, 0.74);
  mouthMesh.rotation.z = PI;
  mouthMesh.rotation.x = 0.06;
  headGroup.add(mouthMesh);

  // Right arc of the ω
  const mouthR = new THREE.Mesh(
    new THREE.TorusGeometry(0.085, 0.032, seg(12), seg(24), PI * 0.82),
    mouthLineMat,
  );
  mouthR.position.set(0.05, -0.12, 0.74);
  mouthR.rotation.z = PI;
  mouthR.rotation.x = 0.06;
  headGroup.add(mouthR);

  // Left smile corner — upward curve
  const smileL = new THREE.Mesh(
    new THREE.TorusGeometry(0.04, 0.025, seg(8), seg(12), PI * 0.5),
    mouthLineMat,
  );
  smileL.position.set(-0.13, -0.08, 0.75);
  smileL.rotation.z = PI * 0.15;
  smileL.rotation.x = 0.04;
  headGroup.add(smileL);

  // Right smile corner — upward curve
  const smileR = new THREE.Mesh(
    new THREE.TorusGeometry(0.04, 0.025, seg(8), seg(12), PI * 0.5),
    mouthLineMat,
  );
  smileR.position.set(0.13, -0.08, 0.75);
  smileR.rotation.z = PI * 0.85;
  smileR.rotation.x = 0.04;
  headGroup.add(smileR);

  // Mouth interior — visible dark area behind the smile
  const mouthInterior = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, seg(16), seg(16)),
    mats.mouth,
  );
  mouthInterior.scale.set(1.5, 0.5, 0.35);
  mouthInterior.position.set(0, -0.13, 0.7);
  headGroup.add(mouthInterior);

  // Upper lip line — vertical groove from nose to mouth center
  const lipLine = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.012, 0.05, seg(4), seg(6)),
    mouthLineMat,
  );
  lipLine.position.set(0, -0.07, 0.77);
  headGroup.add(lipLine);

  // ── Tongue — pink visible inside the smile ──
  const tongueMat = new THREE.MeshPhysicalMaterial({
    color: 0xF06080, metalness: 0.0, roughness: 0.45,
    clearcoat: 0.2, clearcoatRoughness: 0.25,
  });
  const tongue = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, seg(10), seg(10)),
    tongueMat,
  );
  tongue.scale.set(1.3, 0.5, 0.8);
  tongue.position.set(0, -0.12, 0.68);
  headGroup.add(tongue);

  // ── Brow ridges — subtle yellow bumps above eyes ──
  for (const sx of [-1, 1]) {
    const brow = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, seg(10), seg(10)),
      mats.yellow,
    );
    brow.scale.set(1.8, 0.4, 0.5);
    brow.position.set(sx * 0.27, 0.2, 0.62);
    brow.rotation.z = sx * -0.1;
    headGroup.add(brow);
  }

  // ── Red Cheeks — BIG signature round red patches, anime-accurate ──
  const cheekMatL = mats.red.clone();
  const cheekMatR = mats.red.clone();
  const cheekGeo = new THREE.SphereGeometry(0.19, seg(24), seg(24));

  const cheekL = new THREE.Mesh(cheekGeo, cheekMatL);
  cheekL.scale.set(1.0, 0.92, 0.4);
  cheekL.position.set(-0.56, -0.06, 0.48);
  headGroup.add(cheekL);

  const cheekR = new THREE.Mesh(cheekGeo, cheekMatR);
  cheekR.scale.set(1.0, 0.92, 0.4);
  cheekR.position.set(0.56, -0.06, 0.48);
  headGroup.add(cheekR);

  // Cheek gradient edge — softer transition to yellow
  const cheekEdgeMat = new THREE.MeshPhysicalMaterial({
    color: 0xE8A020, metalness: 0.0, roughness: 0.4,
    transparent: true, opacity: 0.45,
    clearcoat: 0.2, clearcoatRoughness: 0.2,
  });
  for (const sx of [-1, 1]) {
    const cheekEdge = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, seg(20), seg(20)),
      cheekEdgeMat,
    );
    cheekEdge.scale.set(0.95, 0.85, 0.3);
    cheekEdge.position.set(sx * 0.56, -0.06, 0.47);
    headGroup.add(cheekEdge);
  }

  // Cheek glow halos — very subtle
  const cheekGlowMat = new THREE.MeshBasicMaterial({
    color: 0xFF6644, transparent: true, opacity: 0.04,
    depthWrite: false, side: THREE.DoubleSide,
  });
  const cheekGlowOuterMat = new THREE.MeshBasicMaterial({
    color: 0xFF4422, transparent: true, opacity: 0.015,
    depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  for (const sx of [-1, 1]) {
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.14, 0.22, seg(20)),
      cheekGlowMat,
    );
    halo.position.set(sx * 0.56, -0.06, 0.49);
    halo.rotation.y = sx * 0.3;
    headGroup.add(halo);

    const haloOuter = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.32, seg(20)),
      cheekGlowOuterMat,
    );
    haloOuter.position.set(sx * 0.56, -0.06, 0.48);
    haloOuter.rotation.y = sx * 0.3;
    headGroup.add(haloOuter);
  }

  // ── Chin — subtle definition under the mouth ──
  const chin = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, seg(16), seg(16)),
    mats.yellow,
  );
  chin.scale.set(1.0, 0.45, 0.5);
  chin.position.set(0, -0.18, 0.6);
  headGroup.add(chin);

  headGroup.position.set(0, 0.55, 0.0);
  group.add(headGroup);

  // ── Arms — short stubby with finger detail ──
  const armGeo = new THREE.CapsuleGeometry(0.11, 0.26, seg(8), seg(12));
  const leftArm = new THREE.Mesh(armGeo, mats.yellow);
  leftArm.position.set(-0.6, -0.12, 0.12);
  leftArm.rotation.z = 0.55;
  leftArm.rotation.x = -0.15;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, mats.yellow);
  rightArm.position.set(0.6, -0.12, 0.12);
  rightArm.rotation.z = -0.55;
  rightArm.rotation.x = -0.15;
  group.add(rightArm);

  // Paw hands with 3 fingers each
  for (const sx of [-1, 1]) {
    const pawBase = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, seg(12), seg(12)),
      mats.yellow,
    );
    pawBase.scale.set(1.1, 0.7, 0.95);
    const pawX = sx * 0.6 + sx * Math.cos(0.55) * 0.2;
    const pawY = -0.12 - Math.sin(0.55) * 0.2 - 0.03;
    const pawZ = 0.12 + 0.08;
    pawBase.position.set(pawX, pawY, pawZ);
    group.add(pawBase);

    for (let fi = 0; fi < 3; fi++) {
      const finger = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, seg(6), seg(6)),
        mats.yellow,
      );
      const fAngle = (fi - 1) * 0.35;
      finger.position.set(
        pawX + sx * Math.cos(fAngle) * 0.06,
        pawY - 0.04 + Math.sin(fAngle) * 0.02,
        pawZ + Math.abs(Math.cos(fAngle)) * 0.03,
      );
      finger.scale.set(0.9, 1.2, 0.85);
      group.add(finger);
    }
  }

  // ── Feet — large chunky oval, anime-style (wider, cuter) ──
  const footGeo = new THREE.CapsuleGeometry(0.19, 0.2, seg(10), seg(14));
  for (const sx of [-1, 1]) {
    const foot = new THREE.Mesh(footGeo, mats.yellow);
    foot.rotation.x = PI / 2;
    foot.rotation.z = sx * 0.1;
    foot.position.set(sx * 0.36, -1.0, 0.26);
    foot.scale.set(1.05, 1.0, 0.85);
    group.add(foot);

    // Toes — 3 bumps
    for (let ti = 0; ti < 3; ti++) {
      const toe = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, seg(8), seg(8)),
        mats.yellow,
      );
      toe.position.set(
        sx * 0.34 + (ti - 1) * 0.065,
        -1.1,
        0.4 + Math.abs(ti - 1) * -0.015,
      );
      toe.scale.set(0.9, 0.6, 1.15);
      group.add(toe);
    }

    // Sole
    const sole = new THREE.Mesh(
      new THREE.CircleGeometry(0.14, seg(12)),
      mats.darkYellow,
    );
    sole.position.set(sx * 0.34, -1.16, 0.24);
    sole.rotation.x = -PI / 2;
    group.add(sole);

    // Paw pads — small darker circles on soles
    for (let pi = 0; pi < 3; pi++) {
      const pad = new THREE.Mesh(
        new THREE.CircleGeometry(0.028, seg(8)),
        mats.darkYellow,
      );
      pad.position.set(
        sx * 0.34 + (pi - 1) * 0.042,
        -1.165,
        0.32 + Math.abs(pi - 1) * -0.01,
      );
      pad.rotation.x = -PI / 2;
      group.add(pad);
    }
    // Center pad — larger oval
    const centerPad = new THREE.Mesh(
      new THREE.CircleGeometry(0.038, seg(8)),
      mats.darkYellow,
    );
    centerPad.scale.set(1.2, 1, 1);
    centerPad.position.set(sx * 0.34, -1.165, 0.24);
    centerPad.rotation.x = -PI / 2;
    group.add(centerPad);
  }

  // ── Ground shadow — soft disc beneath Pikachu ──
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000, transparent: true, opacity: 0.14,
    depthWrite: false, side: THREE.DoubleSide,
  });
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.65, seg(24)),
    shadowMat,
  );
  shadow.position.set(0, -1.19, 0.18);
  shadow.rotation.x = -PI / 2;
  group.add(shadow);

  // ── Tail — iconic zigzag lightning bolt, large and prominent ──
  const tail = new THREE.Group();
  const shape = new THREE.Shape();
  // Wider, taller bolt silhouette — scaled up for anime accuracy
  shape.moveTo(0, 0);
  shape.lineTo(0.22, 0.36);
  shape.lineTo(-0.12, 0.42);
  shape.lineTo(0.28, 0.84);
  shape.lineTo(-0.14, 0.92);
  shape.lineTo(0.38, 1.6);
  shape.lineTo(0.58, 1.48);
  shape.lineTo(0.12, 0.9);
  shape.lineTo(0.46, 0.82);
  shape.lineTo(0.06, 0.36);
  shape.lineTo(0.35, 0.3);
  shape.lineTo(0.0, 0.0);
  const extSettings = { depth: 0.16, bevelEnabled: true, bevelThickness: 0.045, bevelSize: 0.045, bevelSegments: seg(4) };
  const tailMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, extSettings),
    mats.yellow,
  );
  tailMesh.position.set(-0.18, 0, -0.08);
  tail.add(tailMesh);

  // Dark yellow edge highlight on tail (backside)
  const tailEdge = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.006, bevelEnabled: false }),
    mats.darkYellow,
  );
  tailEdge.position.set(-0.18, 0, -0.086);
  tail.add(tailEdge);

  // Brown base connector — wider, smoother transition to body
  const tailBase = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.12, 0.24, seg(8), seg(12)),
    mats.brown,
  );
  tailBase.position.set(0.04, -0.06, 0.01);
  tail.add(tailBase);

  // Yellow connector sphere — smooth transition from base to bolt
  const tailConn = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, seg(10), seg(10)),
    mats.yellow,
  );
  tailConn.scale.set(1.0, 0.8, 0.8);
  tailConn.position.set(0.04, 0.1, 0.0);
  tail.add(tailConn);

  tail.position.set(0, -0.08, -0.64);
  tail.rotation.x = -0.4;
  tail.rotation.y = 0.12;
  group.add(tail);

  // ── Electric sparks — yellow lightning arcs around Pikachu ──
  const sparks = new THREE.Group();
  const sparkMats: THREE.MeshBasicMaterial[] = [];
  const sparkMeshes: THREE.Mesh[] = [];
  const sparkCount = Math.round(12 * detail);
  for (let i = 0; i < sparkCount; i++) {
    const sMat = new THREE.MeshBasicMaterial({
      color: i % 3 === 0 ? 0xFFFFDD : i % 5 === 0 ? 0xFFFFFF : 0xFFE44D,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    sparkMats.push(sMat);
    const sGeo = new THREE.BoxGeometry(0.012, 0.35 + Math.random() * 0.35, 0.004);
    const sMesh = new THREE.Mesh(sGeo, sMat);
    const angle = (i / sparkCount) * PI2;
    const r = 1.2 + Math.random() * 0.6;
    sMesh.position.set(Math.cos(angle) * r, -0.3 + Math.random() * 1.2, Math.sin(angle) * r);
    sMesh.rotation.set(Math.random() * PI, Math.random() * PI, Math.random() * PI);
    sparks.add(sMesh);
    sparkMeshes.push(sMesh);
    // Branch segment
    const bGeo = new THREE.BoxGeometry(0.008, 0.12 + Math.random() * 0.18, 0.003);
    const bMesh = new THREE.Mesh(bGeo, sMat);
    bMesh.position.set(
      sMesh.position.x + (Math.random() - 0.5) * 0.25,
      sMesh.position.y + (Math.random() - 0.5) * 0.25,
      sMesh.position.z + (Math.random() - 0.5) * 0.25,
    );
    bMesh.rotation.set(Math.random() * PI, Math.random() * PI, Math.random() * PI);
    sparks.add(bMesh);
    sparkMeshes.push(bMesh);
    // Second branch for denser look
    if (i % 2 === 0) {
      const b2Geo = new THREE.BoxGeometry(0.006, 0.08 + Math.random() * 0.1, 0.003);
      const b2Mesh = new THREE.Mesh(b2Geo, sMat);
      b2Mesh.position.set(
        bMesh.position.x + (Math.random() - 0.5) * 0.15,
        bMesh.position.y + (Math.random() - 0.5) * 0.15,
        bMesh.position.z + (Math.random() - 0.5) * 0.15,
      );
      b2Mesh.rotation.set(Math.random() * PI, Math.random() * PI, Math.random() * PI);
      sparks.add(b2Mesh);
      sparkMeshes.push(b2Mesh);
    }
    // Spark glow — small additive sphere at junction point
    if (i % 2 === 0) {
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xFFEE66,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      sparkMats.push(glowMat);
      const glowSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        glowMat,
      );
      glowSphere.position.copy(sMesh.position);
      sparks.add(glowSphere);
      sparkMeshes.push(glowSphere);
    }
  }
  // Cheek sparks — small bolts emanating from cheek positions
  for (const sx of [-1, 1]) {
    for (let ci = 0; ci < 3; ci++) {
      const csMat = new THREE.MeshBasicMaterial({
        color: 0xFFDD44, transparent: true, opacity: 0,
        depthWrite: false, blending: THREE.AdditiveBlending,
      });
      sparkMats.push(csMat);
      const csGeo = new THREE.BoxGeometry(0.008, 0.15 + Math.random() * 0.12, 0.003);
      const csMesh = new THREE.Mesh(csGeo, csMat);
      csMesh.position.set(
        sx * 0.58 + (Math.random() - 0.5) * 0.15,
        0.48 + (Math.random() - 0.5) * 0.15,
        0.52 + Math.random() * 0.15,
      );
      csMesh.rotation.set(Math.random() * PI, Math.random() * PI, sx * 0.5 + Math.random() * 0.5);
      sparks.add(csMesh);
      sparkMeshes.push(csMesh);
    }
  }
  group.add(sparks);

  // Electricity aura — very subtle wireframe
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0xFFDD44, transparent: true, opacity: 0, wireframe: true,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const aura = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.8, 1),
    auraMat,
  );
  group.add(aura);

  // ── Glass orb — very faint, almost invisible ──
  const glassOrb = new THREE.Mesh(
    new THREE.SphereGeometry(2.0, seg(64), seg(64)),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.015,
      metalness: 0.0,
      roughness: 0.05,
      envMapIntensity: 0.15,
      side: THREE.DoubleSide,
      depthWrite: false,
      transmission: 0.98,
      thickness: 0.2,
      ior: 1.3,
    }),
  );
  group.add(glassOrb);

  // Soft fill light for Pikachu visibility
  const pikaLight = new THREE.PointLight(0xFFF8E0, 0.6, 4.0, 1.2);
  pikaLight.position.set(0, 0.3, 1.0);
  group.add(pikaLight);

  // Secondary fill from behind
  const pikaBackLight = new THREE.PointLight(0xFFF0C0, 0.25, 3.0, 1.5);
  pikaBackLight.position.set(0, 0.5, -1.0);
  group.add(pikaBackLight);

  // Cheek glow lights — subtle
  const cheekLightL = new THREE.PointLight(0xCC2828, 0.08, 0.8, 2);
  cheekLightL.position.set(-0.56, 0.48, 0.48);
  group.add(cheekLightL);
  const cheekLightR = new THREE.PointLight(0xCC2828, 0.08, 0.8, 2);
  cheekLightR.position.set(0.56, 0.48, 0.48);
  group.add(cheekLightR);

  return { group, head: headGroup, leftEye, rightEye, leftPupil, rightPupil, leftEyelid, rightEyelid, leftEarGroup, rightEarGroup, cheekMatL, cheekMatR, tail, leftArm, rightArm, mouthMesh, tongue, sparks, sparkMats, sparkMeshes, auraMat };
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

    float alpha = (i2 * 0.04 + i3 * 0.015) * pulse * density;

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
// Mobile orb scene — holographic AI core (MAXIMUM QUALITY)
// ============================================================
function mountMobileOrb(container: HTMLElement): OrbHandle {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    failIfMajorPerformanceCaveat: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5));
  renderer.setClearColor(0x0a0806, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 6);
  camera.lookAt(0, 0, 0);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.22, 0.4, 0.65,
  ));
  // Gold vignette
  const mVignette = new ShaderPass(GOLD_VIGNETTE_SHADER);
  mVignette.uniforms.darkness.value = 0.7;
  composer.addPass(mVignette);
  composer.addPass(new OutputPass());

  function resize() {
    const w = container.clientWidth || 240;
    const h = container.clientHeight || w;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const group = new THREE.Group();
  scene.add(group);

  // ── Brighter cheerful lighting for mobile (2 lights + ambient) ──
  const mKey = new THREE.DirectionalLight(0xffffff, 4.0);
  mKey.position.set(2, 4, 5);
  scene.add(mKey);
  const mFill = new THREE.DirectionalLight(0xFFF0D0, 2.0);
  mFill.position.set(-3, 2, 4);
  scene.add(mFill);
  const mFront = new THREE.DirectionalLight(0xFFFAE8, 1.5);
  mFront.position.set(0, 1, 6);
  scene.add(mFront);
  const mAmbient = new THREE.AmbientLight(0x2a2010, 0.8);
  scene.add(mAmbient);

  // ────────────────────────────────────────────
  // CENTRAL OBJECT — PIKACHU (mobile, lower detail)
  // ────────────────────────────────────────────
  const envMap = createEnvMap(renderer);
  scene.environment = envMap;
  const pikaMats = createPikachuMaterials(envMap);
  const pika = buildPikachu(pikaMats, 0.6);
  const pikaGroup = pika.group;
  pikaGroup.scale.setScalar(0.95);
  group.add(pikaGroup);

  // ────────────────────────────────────────────
  // ORBITAL RINGS — gold halo, champagne, rose
  // ────────────────────────────────────────────
  // Primary gold halo — subtle ring
  const goldRGeo = new THREE.TorusGeometry(1.85, 0.035, 28, 220);
  const goldRMat = new THREE.MeshBasicMaterial({
    color: 0xdaa520, transparent: true, opacity: 0.45, depthWrite: false,
  });
  const goldRing = new THREE.Mesh(goldRGeo, goldRMat);
  goldRing.rotation.x = PI * 0.5;
  goldRing.rotation.z = 0.15;
  group.add(goldRing);

  // Glow ring behind the primary halo
  const haloGlowGeo = new THREE.TorusGeometry(1.85, 0.1, 24, 200);
  const haloGlowMat = new THREE.MeshBasicMaterial({
    color: 0xdaa520, transparent: true, opacity: 0.06, depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const haloGlow = new THREE.Mesh(haloGlowGeo, haloGlowMat);
  haloGlow.rotation.x = PI * 0.5;
  haloGlow.rotation.z = 0.15;
  group.add(haloGlow);

  const cyanRGeo = new THREE.TorusGeometry(1.35, 0.012, 16, 160);
  const cyanRMat = new THREE.MeshBasicMaterial({
    color: 0xf5e6c8, transparent: true, opacity: 0.2, depthWrite: false,
  });
  const cyanRing = new THREE.Mesh(cyanRGeo, cyanRMat);
  cyanRing.rotation.x = PI * 0.38;
  cyanRing.rotation.z = -0.3;
  group.add(cyanRing);

  const purpRGeo = new THREE.TorusGeometry(1.6, 0.01, 12, 140);
  const purpRMat = new THREE.MeshBasicMaterial({
    color: 0xc8956a, transparent: true, opacity: 0.25, depthWrite: false,
  });
  const purpRing = new THREE.Mesh(purpRGeo, purpRMat);
  purpRing.rotation.x = PI * 0.62;
  purpRing.rotation.z = 0.5;
  group.add(purpRing);

  // ── 4th ring — thin bright gold accent ──
  const accentRGeo = new THREE.TorusGeometry(1.1, 0.008, 10, 120);
  const accentRMat = new THREE.MeshBasicMaterial({
    color: 0xffd700, transparent: true, opacity: 0.35, depthWrite: false,
  });
  const accentRing = new THREE.Mesh(accentRGeo, accentRMat);
  accentRing.rotation.x = PI * 0.72;
  accentRing.rotation.z = -0.8;
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
  // ATMOSPHERE SHELL + OUTER GLOW — subtle, not overwhelming
  // ────────────────────────────────────────────
  const atmoGeo = new THREE.IcosahedronGeometry(1.4, 5);
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
    map: glowTexture(), color: 0x5a4218, transparent: true, opacity: 0.04,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const glow1 = new THREE.Sprite(glow1Mat);
  glow1.scale.setScalar(4.5);
  group.add(glow1);

  const glow2Mat = new THREE.SpriteMaterial({
    map: glowTexture(), color: 0x2a1c0a, transparent: true, opacity: 0.02,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const glow2 = new THREE.Sprite(glow2Mat);
  glow2.scale.setScalar(7.0);
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
    group.add(nd);
    nodeMeshes.push(nd);
    nodeOrbs.push({ angle, r, speed: 0.02 + Math.random() * 0.04, y: yy });

    const ngMat = new THREE.SpriteMaterial({
      map: glowTexture(), color: nColors[i], transparent: true, opacity: 0.25,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const ng = new THREE.Sprite(ngMat);
    ng.scale.setScalar(0.25);
    group.add(ng);
    nodeGlows.push(ng);

    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const lMat = new THREE.LineBasicMaterial({
      color: nColors[i], transparent: true, opacity: 0.1, depthWrite: false,
    });
    const line = new THREE.Line(lGeo, lMat);
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
  let time = 0, raf = 0;
  let amp = 0.06, ampTarget = 0.06;
  let glitchStr = 0, nextGlitch = 3 + Math.random() * 5, glitchTimer = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = 0.016;
    time += dt;
    amp += (ampTarget - amp) * 0.07;

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
    pikaGroup.rotation.y = Math.sin(time * 0.35) * 0.35;
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
    const sparkBurst = Math.max(0, Math.sin(time * 6.0)) > 0.92 ? 0.5 : 0;
    // Heartbeat cheek glow — "lub-dub" rhythm
    const hbPhase = (time * 1.2) % PI2;
    const lub = Math.max(0, Math.sin(hbPhase * 2.0)) > 0.85 ? 0.25 : 0;
    const dub = Math.max(0, Math.sin(hbPhase * 2.0 + 1.2)) > 0.9 ? 0.18 : 0;
    const cheekPulse = 0.08 + lub * 0.3 + dub * 0.2 + amp * 0.1 + sparkBurst * 0.3;
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
    const earPerk = sparkBurst > 0 ? -0.08 : hopActive ? -0.06 : 0;
    const earTwitchL = Math.sin(time * 2.5) * 0.05 + (Math.sin(time * 7.3) > 0.95 ? 0.12 : 0) + earPerk;
    const earTwitchR = Math.sin(time * 2.5 + 0.6) * 0.05 + (Math.sin(time * 8.1 + 1.0) > 0.95 ? 0.12 : 0) + earPerk;
    if (pika.leftEarGroup) pika.leftEarGroup.rotation.x = -0.12 + earTwitchL;
    if (pika.rightEarGroup) pika.rightEarGroup.rotation.x = -0.12 + earTwitchR;
    // Electric sparks — random flash pattern with bursts
    for (let si = 0; si < pika.sparkMats.length; si++) {
      const phase = Math.sin(time * 8.0 + si * 2.7) * Math.sin(time * 3.1 + si * 1.3);
      const burstBoost = sparkBurst > 0 ? 0.3 : 0;
      pika.sparkMats[si].opacity = phase > 0.5 ? (0.15 + phase * 0.25 + burstBoost) * (0.5 + amp * 0.2) : 0;
    }
    pika.sparks.rotation.y = time * 0.35;
    // Eye tracking — pupils occasionally look toward viewer, drift around
    const viewerLook = Math.sin(time * 0.08) > 0.7 ? 0.01 : 0;
    const lookX = Math.sin(time * 0.18) * 0.015 + viewerLook;
    const lookY = Math.sin(time * 0.13 + 0.7) * 0.01;
    if (pika.leftPupil) { pika.leftPupil.position.x = -0.3 + lookX; pika.leftPupil.position.y = 0.055 + lookY; }
    if (pika.rightPupil) { pika.rightPupil.position.x = 0.3 + lookX; pika.rightPupil.position.y = 0.055 + lookY; }
    // Tongue subtle wiggle — more active during hop
    const tongueWiggle = hopActive ? 0.008 : 0.003;
    if (pika.tongue) pika.tongue.position.y = -0.12 + Math.sin(time * 2.0) * tongueWiggle;
    // Mouth expression — opens slightly during hop (happy face)
    if (pika.mouthMesh) {
      const mouthOpen = hopActive ? 0.03 : 0;
      pika.mouthMesh.position.y = -0.12 - mouthOpen;
    }
    // Electricity aura — pulses during spark bursts
    pika.auraMat.opacity = sparkBurst > 0 ? 0.02 + Math.sin(time * 12) * 0.01 : 0;
    // Randomize spark rotations for more dynamic feel
    if (sparkBurst > 0) {
      for (let si = 0; si < Math.min(pika.sparkMeshes.length, 6); si++) {
        const idx = Math.floor(Math.sin(time * 20 + si * 3.7) * 0.5 + 0.5) * 3;
        if (idx < pika.sparkMeshes.length) {
          pika.sparkMeshes[idx].rotation.z += 0.15;
        }
      }
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
    group.rotation.y = time * 0.018;

    composer.render();
  }

  raf = requestAnimationFrame(frame);

  return {
    setEnergy(v: number) { ampTarget = Math.max(0, Math.min(1, v)); },
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      envMap.dispose();
      composer.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    },
    startBodyDetection() {},
    stopBodyDetection() {},
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
  renderer.setClearColor(0x0a0806, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.75;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0806, 0.025);

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
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.25, 0.4, 0.65,
  );
  composer.addPass(bloom);

  // Subtle chromatic aberration
  const chroma = new ShaderPass(CHROMATIC_SHADER);
  chroma.uniforms.amount.value = 0.002;
  composer.addPass(chroma);

  // Warm color grading
  const grade = new ShaderPass(COLOR_GRADE_SHADER);
  composer.addPass(grade);

  // Gold-tinted vignette
  const vignette = new ShaderPass(GOLD_VIGNETTE_SHADER);
  vignette.uniforms.darkness.value = 0.6;
  composer.addPass(vignette);

  // SMAA anti-aliasing (with FXAA prepared as fallback)
  const fxaa = new ShaderPass(FXAAShader);
  let smaa: SMAAPass | null = null;
  try {
    smaa = new SMAAPass();
    composer.addPass(smaa);
  } catch {
    composer.addPass(fxaa);
  }

  composer.addPass(new OutputPass());

  function resize() {
    const w = container.clientWidth || 240;
    const h = container.clientHeight || w;
    const pr = renderer.getPixelRatio();
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    if (smaa) smaa.setSize(w, h);
    fxaa.uniforms.resolution.value.set(1 / (w * pr), 1 / (h * pr));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const group = new THREE.Group();
  scene.add(group);

  // ── Bright cheerful lighting for Pikachu (MeshPhysicalMaterial) ──
  // Key light — warm white, upper right
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.5);
  keyLight.position.set(3, 4, 4);
  scene.add(keyLight);
  // Fill light — warm yellow, from left
  const fillLight = new THREE.DirectionalLight(0xFFE45C, 1.5);
  fillLight.position.set(-4, 1, 3);
  scene.add(fillLight);
  // Rim light — soft white, from behind
  const rimLight = new THREE.DirectionalLight(0xffeedd, 2.0);
  rimLight.position.set(0, 2, -5);
  scene.add(rimLight);
  // Bottom fill — subtle warm
  const bottomLight = new THREE.DirectionalLight(0xdaa520, 0.5);
  bottomLight.position.set(0, -3, 2);
  scene.add(bottomLight);
  // Ambient
  const ambientLight = new THREE.AmbientLight(0x1a1408, 0.4);
  scene.add(ambientLight);

  // ────────────────────────────────────────────
  // CENTRAL OBJECT — PIKACHU IN GLASS ORB
  // ────────────────────────────────────────────
  const envMap = createEnvMap(renderer);
  scene.environment = envMap;
  const pikaMats = createPikachuMaterials(envMap);
  const pika = buildPikachu(pikaMats, 1.0);
  const pikaGroup = pika.group;
  group.add(pikaGroup);

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
    group.add(nd);
    nodeMeshes.push(nd);
    nodeOrbs.push({ angle, r, speed: 0.015 + Math.random() * 0.03, y: yy });

    const ngMat = new THREE.SpriteMaterial({
      map: glowTexture(), color: nColors[i], transparent: true, opacity: 0.3,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const ng = new THREE.Sprite(ngMat);
    ng.scale.setScalar(0.35);
    group.add(ng);
    nodeGlows.push(ng);

    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const lMat = new THREE.LineBasicMaterial({
      color: nColors[i], transparent: true, opacity: 0.12, depthWrite: false,
    });
    const line = new THREE.Line(lGeo, lMat);
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

  const STAR_N = 700;
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

  // Mid-depth dust motes — 250
  const DUST_N = 250;
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
  let time = 0, raf = 0;
  let amp = 0.06, ampTarget = 0.06;
  let glitchStr = 0, nextGlitch = 3 + Math.random() * 5, glitchTimer = 0;

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = 0.016;
    time += dt;
    amp += (ampTarget - amp) * 0.07;

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
    pikaGroup.rotation.y = Math.sin(time * 0.35) * 0.35;
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
    const sparkBurst = Math.max(0, Math.sin(time * 6.0)) > 0.92 ? 0.5 : 0;
    // Heartbeat cheek glow — "lub-dub" rhythm
    const hbPhase = (time * 1.2) % PI2;
    const lub = Math.max(0, Math.sin(hbPhase * 2.0)) > 0.85 ? 0.25 : 0;
    const dub = Math.max(0, Math.sin(hbPhase * 2.0 + 1.2)) > 0.9 ? 0.18 : 0;
    const cheekPulse = 0.08 + lub * 0.3 + dub * 0.2 + amp * 0.1 + sparkBurst * 0.3;
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
    const earPerk = sparkBurst > 0 ? -0.08 : hopActive ? -0.06 : 0;
    const earTwitchL = Math.sin(time * 2.5) * 0.05 + (Math.sin(time * 7.3) > 0.95 ? 0.12 : 0) + earPerk;
    const earTwitchR = Math.sin(time * 2.5 + 0.6) * 0.05 + (Math.sin(time * 8.1 + 1.0) > 0.95 ? 0.12 : 0) + earPerk;
    if (pika.leftEarGroup) pika.leftEarGroup.rotation.x = -0.12 + earTwitchL;
    if (pika.rightEarGroup) pika.rightEarGroup.rotation.x = -0.12 + earTwitchR;
    // Electric sparks — random flash pattern with bursts
    for (let si = 0; si < pika.sparkMats.length; si++) {
      const phase = Math.sin(time * 8.0 + si * 2.7) * Math.sin(time * 3.1 + si * 1.3);
      const burstBoost = sparkBurst > 0 ? 0.3 : 0;
      pika.sparkMats[si].opacity = phase > 0.5 ? (0.15 + phase * 0.25 + burstBoost) * (0.5 + amp * 0.2) : 0;
    }
    pika.sparks.rotation.y = time * 0.35;
    // Eye tracking — pupils occasionally look toward viewer (mouse), drift around
    const viewerLookD = dMouseX * 0.008;
    const viewerLookYD = dMouseY * -0.005;
    const lookX = Math.sin(time * 0.18) * 0.015 + viewerLookD;
    const lookY = Math.sin(time * 0.13 + 0.7) * 0.01 + viewerLookYD;
    if (pika.leftPupil) { pika.leftPupil.position.x = -0.3 + lookX; pika.leftPupil.position.y = 0.055 + lookY; }
    if (pika.rightPupil) { pika.rightPupil.position.x = 0.3 + lookX; pika.rightPupil.position.y = 0.055 + lookY; }
    // Tongue subtle wiggle — more active during hop
    const tongueWiggle = hopActive ? 0.008 : 0.003;
    if (pika.tongue) pika.tongue.position.y = -0.12 + Math.sin(time * 2.0) * tongueWiggle;
    // Mouth expression — opens slightly during hop (happy face)
    if (pika.mouthMesh) {
      const mouthOpen = hopActive ? 0.03 : 0;
      pika.mouthMesh.position.y = -0.12 - mouthOpen;
    }
    // Electricity aura — pulses during spark bursts
    pika.auraMat.opacity = sparkBurst > 0 ? 0.02 + Math.sin(time * 12) * 0.01 : 0;
    // Randomize spark rotations for more dynamic feel
    if (sparkBurst > 0) {
      for (let si = 0; si < Math.min(pika.sparkMeshes.length, 6); si++) {
        const idx = Math.floor(Math.sin(time * 20 + si * 3.7) * 0.5 + 0.5) * 3;
        if (idx < pika.sparkMeshes.length) {
          pika.sparkMeshes[idx].rotation.z += 0.15;
        }
      }
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
    group.rotation.y = time * 0.012;

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

    composer.render();
  }

  raf = requestAnimationFrame(frame);

  return {
    setEnergy(v: number) { ampTarget = Math.max(0, Math.min(1, v)); },
    dispose() {
      cancelAnimationFrame(raf);
      stopBodyDetection();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onDeskMouseMove);
      envMap.dispose();
      renderer.dispose();
      composer.dispose();
      container.removeChild(renderer.domElement);
    },
    startBodyDetection,
    stopBodyDetection,
  };
}
