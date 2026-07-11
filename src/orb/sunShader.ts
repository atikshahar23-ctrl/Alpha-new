// ═══════════════════════════════════════════════════════════════════════
// THE SUN — shared core for the assistant's avatar, used by BOTH the main
// dashboard orb (src/orb/OrbScene.ts) and the office simulator's giant
// Alpha hologram (agents/Office3D.jsx).
//
// The photosphere FILL is the owner's own uploaded sun (extracted from
// uploads Sun.glb → public/sun-surface.jpg, a 2:1 equirectangular surface
// map) — it replaced the earlier fully-procedural shader per explicit
// request. The shader wraps that texture with what a flat texture can't do
// on its own:
//  • Differential rotation — the surface drifts faster at the equator than
//    at the poles, like the real sun (plus a counter-drifting second sample
//    blended in so the surface visibly boils instead of reading as a
//    rotating wallpaper).
//  • Limb darkening — edges dimmer than disc center, sells the sphere.
//  • Chromosphere rim + voice flaring — uAudioAmplitude brightens the whole
//    disc and the rim while the assistant speaks.
// Unlit ShaderMaterial → a single draw call, renders identically on the
// owner's phone GPU (no PBR/light dependence).
// ═══════════════════════════════════════════════════════════════════════
import * as THREE from 'three';

const NOISE = /* glsl */`
  // Ashima Arts / Stefan Gustavson 3D simplex noise (MIT-licensed, webgl-noise)
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  float fbm4(vec3 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * snoise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
`;

export const SUN_VERT = /* glsl */`
  ${NOISE}
  uniform float uTime;
  uniform float uAudioAmplitude;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vObjDir;

  void main() {
    // The photosphere is nearly a perfect sphere — displacement stays subtle:
    // a slow breathing swell plus a voice ripple that only surfaces on speech.
    float breathe = fbm4(normal * 1.6 + vec3(0.0, uTime * 0.10, 0.0));
    float ripple  = fbm4(normal * 4.5 + vec3(uTime * 0.8, uTime * 0.6, uTime * 1.0));
    vec3 displaced = position + normal * (breathe * 0.015 + ripple * 0.05 * uAudioAmplitude);
    vUv = uv;
    vObjDir = normalize(position);
    vNormal = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(displaced, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

export const SUN_FRAG = /* glsl */`
  uniform sampler2D uMap;
  uniform float uTime;
  uniform float uAudioAmplitude;
  uniform float uGain;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float mu = clamp(dot(n, viewDir), 0.0, 1.0);

    // ── Differential rotation: equator drifts faster than the poles ──
    float lat = (vUv.y - 0.5) * 3.14159265;
    float churn = 1.0 + uAudioAmplitude * 1.5; // the surface boils harder while speaking
    vec2 uv = vec2(vUv.x + uTime * (0.0045 + 0.0035 * cos(lat * 2.0)) * churn, vUv.y);
    vec3 col = texture2D(uMap, uv).rgb;

    // Counter-drifting second sample, blended in — the two layers slide
    // against each other so the surface churns instead of spinning rigidly.
    vec2 uv2 = vec2(vUv.x - uTime * 0.0028 * churn, vUv.y);
    col = mix(col, texture2D(uMap, uv2).rgb, 0.35);

    // ── Limb darkening (the real photosphere effect — sells the sphere) ──
    col *= 0.52 + 0.48 * pow(mu, 0.62);

    // ── Voice: the whole disc flares while the assistant speaks ──
    col *= 1.0 + uAudioAmplitude * 0.6;

    // ── Chromosphere rim: thin warm glow hugging the limb ──
    col += vec3(1.0, 0.38, 0.12) * pow(1.0 - mu, 3.0) * (0.55 + uAudioAmplitude * 0.8);

    // uGain < 1 tames the disc under a post-processing bloom chain (the sim's
    // UnrealBloomPass threshold is 0.4 — at full brightness the bright cells
    // bloom to a detail-less white ball).
    gl_FragColor = vec4(col * uGain, 1.0);
  }
`;

// Corona: an additive back-side shell with animated streamers — shares the
// SAME uniform objects as the core material, so advancing the core's uTime
// drives the corona for free (no second per-frame update site needed).
const CORONA_FRAG = /* glsl */`
  ${NOISE}
  uniform float uTime;
  uniform float uAudioAmplitude;
  uniform float uGain;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vObjDir;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    // BackSide shell: the silhouette edge is where |dot| is small.
    float edge = 1.0 - abs(dot(n, viewDir));
    float streaks = 0.75 + 0.45 * fbm4(normalize(vObjDir) * 4.0 + vec3(0.0, uTime * 0.05, 0.0));
    float a = pow(edge, 2.2) * streaks * (0.5 + uAudioAmplitude * 0.7);
    gl_FragColor = vec4(vec3(1.0, 0.72, 0.32), a * uGain);
  }
`;

export interface SunUniforms {
  uTime: { value: number };
  uAudioAmplitude: { value: number };
  [key: string]: { value: unknown };
}

// Single shared texture — both surfaces (dashboard orb + sim hologram) reuse
// the same GPU upload instead of decoding the JPEG twice.
let sunTexture: THREE.Texture | null = null;
let sunTexLoaded = false;
// Materials created BEFORE the JPEG finished decoding — they get the real
// texture swapped in on load, then the list is dropped (so the sim's
// mount/unmount cycles never accumulate references here).
let pendingSunMats: THREE.ShaderMaterial[] = [];
function getSunTexture(): THREE.Texture {
  if (sunTexture) return sunTexture;
  // 1×1 warm placeholder so the core is never black while the JPEG decodes.
  const px = new Uint8Array([255, 140, 40, 255]);
  const fallback = new THREE.DataTexture(px, 1, 1);
  fallback.needsUpdate = true;
  sunTexture = fallback;
  const base = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
  new THREE.TextureLoader().load(base + 'sun-surface.jpg', (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping; // uv.x drifts forever — no seam pop
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.anisotropy = 4;
    sunTexture = tex;
    sunTexLoaded = true;
    pendingSunMats.forEach((m) => { m.uniforms.uMap.value = tex; });
    pendingSunMats = [];
  });
  return sunTexture;
}

// gain < 1 is for scenes that run the sun through a bloom post-pass (the
// office sim) — it keeps the disc below the bloom threshold so the surface
// detail survives instead of clipping to a white ball.
export function buildSunMaterial(gain = 1.0): THREE.ShaderMaterial {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAudioAmplitude: { value: 0.06 },
      uGain: { value: gain },
      uMap: { value: getSunTexture() },
    },
    vertexShader: SUN_VERT,
    fragmentShader: SUN_FRAG,
  });
  if (!sunTexLoaded) pendingSunMats.push(mat);
  return mat;
}

export function buildSunCorona(radius: number, sharedUniforms: SunUniforms): THREE.Mesh {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: sharedUniforms.uTime,
      uAudioAmplitude: sharedUniforms.uAudioAmplitude,
      uGain: sharedUniforms.uGain || { value: 1.0 },
    },
    vertexShader: SUN_VERT,
    fragmentShader: CORONA_FRAG,
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(radius * 1.22, 48, 48), mat);
}
