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
    gl_FragColor = vec4(color, alpha * 0.16);
  }
`;

// ============================================================
// Mobile holographic orb shaders — 5-octave FBM, chromatic fresnel, SSS
// ============================================================
const MOBILE_ORB_VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  varying vec3 vLocalPos;
  uniform float uTime;
  uniform float uEnergy;

  void main() {
    vec3 pos = position;

    // Multi-octave organic surface displacement
    float disp = sin(pos.x * 8.0 + uTime * 1.5) * sin(pos.y * 6.0 + uTime * 1.2) * sin(pos.z * 7.0 + uTime) * 0.025;
    disp += sin(pos.x * 15.0 - uTime * 2.0) * sin(pos.z * 12.0 + uTime * 1.5) * 0.012 * (1.0 + uEnergy * 3.0);
    disp += sin(pos.y * 20.0 + uTime * 0.7) * sin(pos.x * 18.0 - uTime * 1.0) * 0.006;
    // Breathing pulse
    float breathe = sin(uTime * 0.8) * 0.008 + sin(uTime * 1.5) * 0.004;
    pos += normal * (disp + breathe);

    vNormal = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    vLocalPos = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const MOBILE_ORB_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uEnergy;
  uniform float uGlitch;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  varying vec3 vLocalPos;

  float h3(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
  }
  float n3(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(mix(h3(i), h3(i+vec3(1,0,0)), f.x),
                   mix(h3(i+vec3(0,1,0)), h3(i+vec3(1,1,0)), f.x), f.y),
               mix(mix(h3(i+vec3(0,0,1)), h3(i+vec3(1,0,1)), f.x),
                   mix(h3(i+vec3(0,1,1)), h3(i+vec3(1,1,1)), f.x), f.y), f.z);
  }
  // 5-octave FBM
  float fbm3(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += n3(p) * a;
      p = p * 2.1 + vec3(0.11, 0.23, 0.07);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 vd = normalize(cameraPosition - vWorldPos);
    vec3 n = normalize(vNormal);
    float nd = max(dot(n, vd), 0.0);
    float fresnel = pow(1.0 - nd, 3.2);
    // Chromatic fresnel — separate exponents per channel
    float fr = pow(1.0 - nd, 2.6);
    float fg = pow(1.0 - nd, 3.2);
    float fb = pow(1.0 - nd, 4.0);
    vec3 chromaFres = vec3(fr, fg, fb);

    vec3 fp = vLocalPos * 3.5 + vec3(uTime*0.15, uTime*0.1, uTime*0.12);
    float e1 = fbm3(fp);
    float e2 = fbm3(fp * 1.4 + vec3(0.0, uTime*0.08, 0.0));
    float ep = e1 * 0.6 + e2 * 0.4;

    // Animated energy veins
    float veins = smoothstep(0.45, 0.55, fbm3(vLocalPos * 6.0 + vec3(0.0, uTime * 0.4, 0.0)));

    vec2 hu = vUv * 18.0;
    vec2 hg = fract(hu) - 0.5;
    float hex = smoothstep(0.03, 0.0, abs(abs(hg.x) + abs(hg.y)*0.577 - 0.5));

    // Improved scan lines — sharper, multi-frequency
    float s1 = smoothstep(0.42, 0.5, fract(vWorldPos.y*15.0 - uTime*0.6)) * 0.25;
    float s2 = smoothstep(0.45, 0.5, fract(vWorldPos.y*8.0 + uTime*0.3)) * 0.15;
    float s3 = smoothstep(0.48, 0.5, fract(-vWorldPos.y*25.0 - uTime*1.2)) * 0.08;
    float sc = s1 + s2 + s3;

    vec3 obsidian = vec3(0.06, 0.04, 0.02);
    vec3 warmGold = vec3(0.65, 0.48, 0.16);
    vec3 gold = vec3(0.95, 0.75, 0.25);
    vec3 brightGold = vec3(1.0, 0.85, 0.35);
    vec3 pearl = vec3(1.0, 0.97, 0.92);
    vec3 champagne = vec3(0.80, 0.68, 0.40);

    float cs = sin(uTime*0.3 + vWorldPos.y*2.0)*0.5+0.5;
    vec3 col = mix(obsidian, warmGold * 0.5, ep * 0.8);
    col = mix(col, champagne * 0.6, ep * ep * 0.6);
    col = mix(col, gold, fresnel * cs * 0.2 + uEnergy * 0.12);

    // Subsurface scattering approximation — warm light through the shell
    float sss = pow(max(dot(n, -vd), 0.0), 2.5) * 0.18;
    col += warmGold * sss;
    col += champagne * sss * 0.5;

    // Chromatic fresnel rim
    col += gold * chromaFres * 0.32;
    col += pearl * fresnel * 0.15;
    col += brightGold * pow(fresnel, 2.0) * 0.2;

    col += brightGold * veins * 0.25;
    col += warmGold * 0.2 * hex * 0.3;
    col += gold * sc * 0.2;

    float hotSpot = pow(ep, 3.0) * 1.2;
    col += pearl * hotSpot * 0.12;
    col += brightGold * hotSpot * 0.08;

    float gl = step(0.98, fract(sin(floor(vWorldPos.y*50.0 + uTime*3.0)) * 43758.5));
    col += pearl * 0.4 * gl * (uGlitch * 0.5 + uEnergy * 0.25);

    float pulse = 0.92 + sin(uTime*1.2)*0.05 + uEnergy*0.15;
    col *= pulse;

    float alpha = 0.55 + fresnel*0.35 + ep*0.12 + sc*0.05 + hex*0.04 + veins*0.06;
    alpha *= pulse;
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.92));
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
    vAlpha = 0.35 + sin(uTime * 1.5 + aPhase * 3.14) * 0.15;
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
// Desktop enhanced vertex shader — 7-octave displacement, quintic noise
// ============================================================
const DESKTOP_ORB_VERT = /* glsl */`
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  varying vec3 vLocalPos;
  varying float vDisp;
  uniform float uTime;
  uniform float uEnergy;

  float dHash(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
  }
  float dNoise(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f*f*f*(f*(f*6.0-15.0)+10.0); // quintic
    return mix(mix(mix(dHash(i), dHash(i+vec3(1,0,0)), f.x),
                   mix(dHash(i+vec3(0,1,0)), dHash(i+vec3(1,1,0)), f.x), f.y),
               mix(mix(dHash(i+vec3(0,0,1)), dHash(i+vec3(1,0,1)), f.x),
                   mix(dHash(i+vec3(0,1,1)), dHash(i+vec3(1,1,1)), f.x), f.y), f.z);
  }

  void main() {
    vec3 pos = position;
    float n1 = dNoise(pos * 5.0 + uTime * 0.8) * 0.025;
    float n2 = dNoise(pos * 10.0 - uTime * 1.2) * 0.012;
    float n3 = dNoise(pos * 20.0 + uTime * 0.5) * 0.005;
    float n4 = dNoise(pos * 35.0 - uTime * 0.3) * 0.0025;
    float disp = n1 + n2 + n3 + n4;
    disp += dNoise(pos * 3.0 + uTime * 2.0) * 0.015 * uEnergy;
    float breathe = sin(uTime * 0.8) * 0.008 + sin(uTime * 1.5) * 0.004;
    float total = disp + breathe;
    pos += normal * total;

    vDisp = disp;
    vNormal = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    vLocalPos = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// ============================================================
// Desktop enhanced fragment shader — 7-octave FBM, GGX specular,
// volumetric SSS, caustics, micro-detail, chromatic fresnel, lava veins,
// energy crackling
// ============================================================
const DESKTOP_ORB_FRAG = /* glsl */`
  uniform float uTime;
  uniform float uEnergy;
  uniform float uGlitch;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  varying vec3 vLocalPos;
  varying float vDisp;

  float dh3(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
  }
  float dn3(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f*f*f*(f*(f*6.0-15.0)+10.0); // quintic interpolation
    return mix(mix(mix(dh3(i), dh3(i+vec3(1,0,0)), f.x),
                   mix(dh3(i+vec3(0,1,0)), dh3(i+vec3(1,1,0)), f.x), f.y),
               mix(mix(dh3(i+vec3(0,0,1)), dh3(i+vec3(1,0,1)), f.x),
                   mix(dh3(i+vec3(0,1,1)), dh3(i+vec3(1,1,1)), f.x), f.y), f.z);
  }
  // 7-octave FBM
  float dfbm(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 7; i++) {
      v += dn3(p) * a;
      p = p * 2.05 + vec3(0.13, 0.27, 0.08);
      a *= 0.52;
    }
    return v;
  }
  vec2 dVoronoi(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    float d1 = 1.0, d2 = 1.0;
    for (int x = -1; x <= 1; x++)
    for (int y = -1; y <= 1; y++)
    for (int z = -1; z <= 1; z++) {
      vec3 nb = vec3(x, y, z);
      vec3 r = nb + fract(sin(dot(i + nb, vec3(127.1, 311.7, 74.7))) * 43758.5) - f;
      float d = dot(r, r);
      if (d < d1) { d2 = d1; d1 = d; }
      else if (d < d2) { d2 = d; }
    }
    return vec2(sqrt(d1), sqrt(d2));
  }

  // GGX/Trowbridge-Reitz normal distribution for specular highlight
  float ggx(float ndh, float rough) {
    float a = rough * rough;
    float a2 = a * a;
    float d = (ndh * ndh) * (a2 - 1.0) + 1.0;
    return a2 / (3.14159265 * d * d);
  }

  void main() {
    vec3 vd = normalize(cameraPosition - vWorldPos);
    vec3 n = normalize(vNormal);
    float ndv = max(dot(n, vd), 0.0);

    // Chromatic fresnel — different exponent per channel for color separation
    float frR = pow(1.0 - ndv, 2.4);
    float frG = pow(1.0 - ndv, 3.0);
    float frB = pow(1.0 - ndv, 3.8);
    vec3 chromaFres = vec3(frR, frG, frB);
    float fresnel = frG;

    // 7-octave triple-domain FBM
    vec3 fp = vLocalPos * 4.0 + vec3(uTime * 0.1, uTime * 0.07, uTime * 0.08);
    float e1 = dfbm(fp);
    float e2 = dfbm(fp * 1.3 + vec3(0.0, uTime * 0.05, uTime * 0.03));
    float e3 = dfbm(fp * 0.7 - vec3(uTime * 0.025, 0.0, uTime * 0.04));
    float ep = e1 * 0.45 + e2 * 0.35 + e3 * 0.2;

    // Voronoi veins
    vec2 vor = dVoronoi(vLocalPos * 5.0 + uTime * 0.06);
    float veins = smoothstep(0.08, 0.0, vor.y - vor.x) * 0.5;

    // Heat distortion / lava flow inside the veins — animated turbulence
    float lavaFlow = dfbm(vLocalPos * 8.0 + vec3(0.0, -uTime * 0.6, uTime * 0.2));
    float lava = veins * (0.5 + 0.5 * sin(lavaFlow * 12.0 - uTime * 3.0));

    // Animated caustic patterns — interfering wave fronts on the surface
    float ca = sin(vLocalPos.x * 14.0 + uTime * 1.3 + ep * 6.0);
    float cb = sin(vLocalPos.y * 16.0 - uTime * 1.0 + ep * 5.0);
    float cc = sin(vLocalPos.z * 12.0 + uTime * 0.8 + ep * 7.0);
    float caustic = pow(max((ca + cb + cc) / 3.0 * 0.5 + 0.5, 0.0), 4.0);

    // Energy crackling / lightning — sharp animated filaments
    float crackBase = dfbm(vLocalPos * 10.0 + vec3(uTime * 0.9, uTime * 0.5, -uTime * 0.7));
    float crackle = smoothstep(0.78, 0.83, crackBase) * (0.6 + 0.4 * sin(uTime * 14.0));
    crackle *= (0.4 + uEnergy * 0.8);

    // Micro-detail noise layer for surface roughness
    float micro = dn3(vLocalPos * 60.0 + uTime * 0.2) * 0.5 + dn3(vLocalPos * 120.0) * 0.25;
    float roughness = clamp(0.35 + micro * 0.4 + vDisp * 4.0, 0.12, 0.85);

    // Hex grid
    vec2 hu = vUv * 22.0;
    vec2 hg = fract(hu) - 0.5;
    float hex = smoothstep(0.03, 0.0, abs(abs(hg.x) + abs(hg.y) * 0.577 - 0.5));
    float hexP = sin(uTime * 0.3 + hu.x * 0.5 + hu.y * 0.7) * 0.5 + 0.5;
    hex *= 0.3 + hexP * 0.7;

    // Scan lines
    float s1 = smoothstep(0.42, 0.5, fract(vWorldPos.y * 18.0 - uTime * 0.4)) * 0.15;
    float s2 = smoothstep(0.45, 0.5, fract(vWorldPos.y * 10.0 + uTime * 0.2)) * 0.08;
    float sc = s1 + s2;

    // Palette (gold / warm obsidian / pearl / champagne / rose gold)
    vec3 obsidian = vec3(0.06, 0.04, 0.02);
    vec3 warmGold = vec3(0.65, 0.48, 0.16);
    vec3 brightGold = vec3(0.95, 0.75, 0.25);
    vec3 pearl = vec3(1.0, 0.97, 0.92);
    vec3 champagne = vec3(0.80, 0.68, 0.40);
    vec3 roseGold = vec3(0.78, 0.52, 0.38);
    vec3 lavaHot = vec3(1.0, 0.62, 0.18);

    vec3 col = mix(obsidian, warmGold * 0.4, ep * 0.8);
    col = mix(col, champagne * 0.5, ep * ep * 0.6);

    // Veins + lava flow
    col += brightGold * veins * 0.45;
    col += pearl * veins * 0.15;
    col += lavaHot * lava * 0.35;

    // Caustics shimmer
    col += champagne * caustic * 0.18;
    col += pearl * caustic * caustic * 0.1;

    // Volumetric subsurface scattering — depth-dependent color (warm core,
    // cooler-pearl shallow), driven by back-facing transmission
    float back = pow(max(dot(n, -vd), 0.0), 2.2);
    float depthMix = clamp(ep + back, 0.0, 1.0);
    vec3 sssColor = mix(roseGold, warmGold, depthMix);
    sssColor = mix(sssColor, champagne, caustic * 0.5);
    col += sssColor * back * 0.22;

    // GGX-style specular highlight (key light from upper-right)
    vec3 lightDir = normalize(vec3(0.6, 0.8, 0.5));
    vec3 hvec = normalize(lightDir + vd);
    float ndh = max(dot(n, hvec), 0.0);
    float spec = ggx(ndh, roughness);
    float ndl = max(dot(n, lightDir), 0.0);
    col += pearl * spec * ndl * 0.5;
    col += brightGold * spec * ndl * 0.25;

    // Chromatic fresnel rim
    col += brightGold * chromaFres * 0.16;
    col += pearl * fresnel * 0.06;
    col += roseGold * frR * 0.05;

    col += warmGold * 0.2 * hex * 0.18;
    col += brightGold * sc * 0.1;

    // Energy crackling / lightning
    col += pearl * crackle * 0.35;
    col += brightGold * crackle * 0.2;

    float hotSpot = pow(e1, 4.0) * 0.5;
    col += pearl * hotSpot * 0.06;
    col += brightGold * hotSpot * 0.04;

    float cs = sin(uTime * 0.2 + vWorldPos.y * 2.5) * 0.5 + 0.5;
    col = mix(col, brightGold, fresnel * cs * 0.1 + uEnergy * 0.06);

    float gl = step(0.985, fract(sin(floor(vWorldPos.y * 50.0 + uTime * 3.0)) * 43758.5));
    col += pearl * 0.4 * gl * (uGlitch * 0.5 + uEnergy * 0.2);

    float pulse = 0.92 + sin(uTime * 0.8) * 0.04 + uEnergy * 0.08;
    col *= pulse;

    // Higher dynamic range — let bloom catch the hottest points
    col += brightGold * pow(max(spec * ndl, caustic) , 2.0) * 0.4;

    float alpha = 0.55 + fresnel * 0.3 + ep * 0.12 + sc * 0.03 + hex * 0.02
                + veins * 0.1 + caustic * 0.04 + crackle * 0.06;
    alpha *= pulse;
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.92));
  }
`;

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

    float alpha = (i2 * 0.12 + i3 * 0.04) * pulse * density;

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
    0.5, 0.4, 0.55,
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

  // ────────────────────────────────────────────
  // CENTRAL ORB — shader sphere (subdivision 7)
  // ────────────────────────────────────────────
  const orbGeo = new THREE.IcosahedronGeometry(1.0, 7);
  const orbMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uEnergy: { value: 0 }, uGlitch: { value: 0 } },
    vertexShader: MOBILE_ORB_VERT,
    fragmentShader: MOBILE_ORB_FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  group.add(orb);

  // ── Inner bright core — hot golden center ──
  const coreGeo = new THREE.IcosahedronGeometry(0.35, 5);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x6b4a18, transparent: true, opacity: 0.45, depthWrite: false,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // ── Inner core glow — bright center light ──
  const coreGlowMat = new THREE.SpriteMaterial({
    map: glowTexture(), color: 0xdaa520, transparent: true, opacity: 0.2,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const coreGlow = new THREE.Sprite(coreGlowMat);
  coreGlow.scale.setScalar(1.8);
  group.add(coreGlow);

  // ── Wireframe cage A — fine grid ──
  const wireAGeo = new THREE.IcosahedronGeometry(1.04, 3);
  const wireAMat = new THREE.MeshBasicMaterial({
    color: 0xd4a84d, wireframe: true, transparent: true, opacity: 0.08, depthWrite: false,
  });
  const wireA = new THREE.Mesh(wireAGeo, wireAMat);
  group.add(wireA);

  // ── Wireframe cage B — coarse grid, opposite rotation ──
  const wireBGeo = new THREE.IcosahedronGeometry(1.07, 2);
  const wireBMat = new THREE.MeshBasicMaterial({
    color: 0xf0e0c0, wireframe: true, transparent: true, opacity: 0.05, depthWrite: false,
  });
  const wireB = new THREE.Mesh(wireBGeo, wireBMat);
  group.add(wireB);

  // ────────────────────────────────────────────
  // ORBITAL RINGS — gold, champagne, rose
  // ────────────────────────────────────────────
  const goldRGeo = new THREE.TorusGeometry(1.45, 0.035, 24, 200);
  const goldRMat = new THREE.MeshBasicMaterial({
    color: 0xdaa520, transparent: true, opacity: 0.8, depthWrite: false,
  });
  const goldRing = new THREE.Mesh(goldRGeo, goldRMat);
  goldRing.rotation.x = PI * 0.5;
  goldRing.rotation.z = 0.15;
  group.add(goldRing);

  const cyanRGeo = new THREE.TorusGeometry(1.25, 0.015, 16, 160);
  const cyanRMat = new THREE.MeshBasicMaterial({
    color: 0xf5e6c8, transparent: true, opacity: 0.4, depthWrite: false,
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
  // SCAN PLANE — horizontal sweep
  // ────────────────────────────────────────────
  const scanGeo = new THREE.PlaneGeometry(3.5, 0.025);
  const scanMat = new THREE.MeshBasicMaterial({
    color: 0xdaa520, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide,
  });
  const scanPlane = new THREE.Mesh(scanGeo, scanMat);
  scanPlane.position.z = 0.1;
  group.add(scanPlane);

  // ────────────────────────────────────────────
  // DATA STREAM LINES — vertical flowing lines around the orb
  // ────────────────────────────────────────────
  const STREAM_N = 8;
  const streams: { line: THREE.Line; mat: THREE.LineBasicMaterial; baseX: number; baseZ: number }[] = [];
  for (let i = 0; i < STREAM_N; i++) {
    const a = (i / STREAM_N) * PI2;
    const r = 1.0 + (i % 3) * 0.15;
    const pts: number[] = [];
    const segs = 30;
    for (let j = 0; j <= segs; j++) {
      const t = j / segs;
      pts.push(Math.cos(a) * r, -1.5 + t * 3.0, Math.sin(a) * r);
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const sMat = new THREE.LineBasicMaterial({
      color: i % 2 === 0 ? 0xdaa520 : 0xf5e6c8,
      transparent: true, opacity: 0.06, depthWrite: false,
    });
    const sLine = new THREE.Line(sGeo, sMat);
    group.add(sLine);
    streams.push({ line: sLine, mat: sMat, baseX: Math.cos(a) * r, baseZ: Math.sin(a) * r });
  }

  // ────────────────────────────────────────────
  // ATMOSPHERE SHELL + OUTER GLOW
  // ────────────────────────────────────────────
  const atmoGeo = new THREE.IcosahedronGeometry(1.2, 5);
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
    map: glowTexture(), color: 0x5a4218, transparent: true, opacity: 0.14,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const glow1 = new THREE.Sprite(glow1Mat);
  glow1.scale.setScalar(4.5);
  group.add(glow1);

  const glow2Mat = new THREE.SpriteMaterial({
    map: glowTexture(), color: 0x2a1c0a, transparent: true, opacity: 0.07,
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

    orbMat.uniforms.uTime.value = time;
    orbMat.uniforms.uEnergy.value = amp;
    orbMat.uniforms.uGlitch.value = glitchStr;
    pMat.uniforms.uTime.value = time;

    orb.rotation.y = time * 0.12;
    orb.rotation.x = Math.sin(time * 0.08) * 0.1;
    const breath = 1 + Math.sin(time * 1.2) * 0.025 + amp * 0.08;
    orb.scale.setScalar(breath);

    core.rotation.y = -time * 0.4;
    core.rotation.x = time * 0.25;
    const cp = 0.9 + Math.sin(time * 2.5) * 0.15 + amp * 0.5;
    core.scale.setScalar(0.35 * cp);
    coreMat.opacity = 0.5 + Math.sin(time * 2.0) * 0.15 + amp * 0.25;
    coreGlow.scale.setScalar(1.6 + Math.sin(time * 1.5) * 0.3 + amp * 0.4);
    coreGlowMat.opacity = 0.18 + Math.sin(time * 1.8) * 0.06 + amp * 0.12;

    wireA.rotation.y = time * 0.1;
    wireA.rotation.z = Math.sin(time * 0.12) * 0.12;
    wireAMat.opacity = 0.06 + amp * 0.05 + Math.sin(time * 0.9) * 0.025;
    wireB.rotation.y = -time * 0.07;
    wireB.rotation.x = time * 0.05;
    wireBMat.opacity = 0.04 + amp * 0.04;

    goldRing.rotation.z = 0.15 + time * 0.1;
    goldRMat.opacity = 0.75 + Math.sin(time * 0.8) * 0.1 + amp * 0.15;
    cyanRing.rotation.z = -0.3 - time * 0.14;
    cyanRMat.opacity = 0.35 + Math.sin(time * 0.7) * 0.1;
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

    const scanRange = 2.5;
    scanPlane.position.y = Math.sin(time * 0.5) * scanRange * 0.5;
    scanMat.opacity = 0.25 + amp * 0.3 + Math.sin(time * 3) * 0.1;

    for (let i = 0; i < STREAM_N; i++) {
      const s = streams[i];
      const wave = Math.sin(time * 1.5 + i * 0.8) * 0.5 + 0.5;
      s.mat.opacity = 0.03 + wave * 0.08 + amp * 0.04;
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
    0.35, 0.4, 0.5,
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

  // ────────────────────────────────────────────
  // CENTRAL ORB — high-quality shader sphere (subdivision 8)
  // ────────────────────────────────────────────
  const orbGeo = new THREE.IcosahedronGeometry(1.3, 8);
  const orbMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uEnergy: { value: 0 }, uGlitch: { value: 0 } },
    vertexShader: DESKTOP_ORB_VERT,
    fragmentShader: DESKTOP_ORB_FRAG,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const orb = new THREE.Mesh(orbGeo, orbMat);
  group.add(orb);

  // Inner bright core — hot golden center (subdivision 5)
  const coreGeo = new THREE.IcosahedronGeometry(0.5, 5);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x6b4a18, transparent: true, opacity: 0.18, depthWrite: false,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Desktop core glow sprite
  const dCoreGlowMat = new THREE.SpriteMaterial({
    map: glowTexture(), color: 0xdaa520, transparent: true, opacity: 0.07,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const dCoreGlow = new THREE.Sprite(dCoreGlowMat);
  dCoreGlow.scale.setScalar(2.0);
  group.add(dCoreGlow);

  // Wireframe cages — 4 layers, higher subdivision
  const wireframes: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; dir: number }[] = [];
  const wSizes = [1.36, 1.42, 1.48, 1.54];
  const wSubs = [4, 3, 2, 1];
  const wColors = [0xd4a84d, 0xf0e0c0, 0xc8956a, 0xf0d090];
  const wOps = [0.05, 0.035, 0.025, 0.018];
  for (let i = 0; i < 4; i++) {
    const wGeo = new THREE.IcosahedronGeometry(wSizes[i], wSubs[i]);
    const wMat = new THREE.MeshBasicMaterial({
      color: wColors[i], wireframe: true, transparent: true, opacity: wOps[i], depthWrite: false,
    });
    const wMesh = new THREE.Mesh(wGeo, wMat);
    group.add(wMesh);
    wireframes.push({ mesh: wMesh, mat: wMat, dir: i % 2 === 0 ? 1 : -1 });
  }

  // ────────────────────────────────────────────
  // ORBITAL RINGS — gold (thick), champagne, rose, extra thin
  // ────────────────────────────────────────────
  const rings: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }[] = [];
  const rData = [
    { r: 2.0, thick: 0.04, segs: 240, color: 0xdaa520, op: 0.75, rx: PI * 0.5, rz: 0.15 },
    { r: 1.7, thick: 0.015, segs: 200, color: 0xf5e6c8, op: 0.35, rx: PI * 0.38, rz: -0.3 },
    { r: 2.3, thick: 0.008, segs: 160, color: 0xc8956a, op: 0.22, rx: PI * 0.62, rz: 0.5 },
    { r: 1.5, thick: 0.006, segs: 140, color: 0xf0d090, op: 0.15, rx: PI * 0.7, rz: -0.8 },
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
  // SCAN PLANE — horizontal sweep
  // ────────────────────────────────────────────
  const scanGeo = new THREE.PlaneGeometry(5, 0.03);
  const scanMat = new THREE.MeshBasicMaterial({
    color: 0xdaa520, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide,
  });
  const scanPlane = new THREE.Mesh(scanGeo, scanMat);
  scanPlane.position.z = 0.1;
  group.add(scanPlane);

  // ────────────────────────────────────────────
  // DATA STREAM LINES — 12 vertical lines
  // ────────────────────────────────────────────
  const STREAM_N = 12;
  const streams: { line: THREE.Line; mat: THREE.LineBasicMaterial }[] = [];
  for (let i = 0; i < STREAM_N; i++) {
    const a = (i / STREAM_N) * PI2;
    const r = 1.5 + (i % 3) * 0.2;
    const pts: number[] = [];
    for (let j = 0; j <= 40; j++) {
      const t = j / 40;
      pts.push(Math.cos(a) * r, -2.5 + t * 5.0, Math.sin(a) * r);
    }
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const sMat = new THREE.LineBasicMaterial({
      color: i % 2 === 0 ? 0xdaa520 : 0xf5e6c8,
      transparent: true, opacity: 0.05, depthWrite: false,
    });
    const sLine = new THREE.Line(sGeo, sMat);
    group.add(sLine);
    streams.push({ line: sLine, mat: sMat });
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

    orbMat.uniforms.uTime.value = time;
    orbMat.uniforms.uEnergy.value = amp;
    orbMat.uniforms.uGlitch.value = glitchStr;
    pMat.uniforms.uTime.value = time;
    gridMat.uniforms.uTime.value = time;
    gridMat.uniforms.uEnergy.value = amp;

    orb.rotation.y = time * 0.08;
    orb.rotation.x = Math.sin(time * 0.06) * 0.08;
    const breath = 1 + Math.sin(time * 1.0) * 0.02 + amp * 0.06;
    orb.scale.setScalar(breath);

    core.rotation.y = -time * 0.35;
    core.rotation.x = time * 0.2;
    const cp = 0.85 + Math.sin(time * 2.2) * 0.08 + amp * 0.25;
    core.scale.setScalar(0.5 * cp);
    coreMat.opacity = 0.15 + Math.sin(time * 1.8) * 0.05 + amp * 0.1;
    dCoreGlow.scale.setScalar(1.8 + Math.sin(time * 1.5) * 0.25 + amp * 0.3);
    dCoreGlowMat.opacity = 0.06 + Math.sin(time * 1.3) * 0.02 + amp * 0.04;

    for (let i = 0; i < wireframes.length; i++) {
      const wf = wireframes[i];
      wf.mesh.rotation.y = time * (0.08 - i * 0.02) * wf.dir;
      wf.mesh.rotation.z = Math.sin(time * 0.1 + i) * 0.1;
      wf.mat.opacity = wOps[i] * 0.8 + amp * 0.02 + Math.sin(time * 0.8 + i) * 0.015;
    }

    rings[0].mesh.rotation.z = 0.15 + time * 0.07;
    rings[0].mat.opacity = 0.45 + Math.sin(time * 0.6) * 0.06 + amp * 0.08;
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

    scanPlane.position.y = Math.sin(time * 0.4) * 3.0 * 0.5;
    scanMat.opacity = 0.1 + amp * 0.12 + Math.sin(time * 2.5) * 0.04;

    for (let i = 0; i < STREAM_N; i++) {
      const wave = Math.sin(time * 1.2 + i * 0.6) * 0.5 + 0.5;
      streams[i].mat.opacity = 0.01 + wave * 0.03 + amp * 0.015;
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
      renderer.dispose();
      composer.dispose();
      container.removeChild(renderer.domElement);
    },
    startBodyDetection,
    stopBodyDetection,
  };
}
