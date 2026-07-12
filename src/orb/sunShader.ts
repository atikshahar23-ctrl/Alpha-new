// ═══════════════════════════════════════════════════════════════════════
// PHOTOREAL SUN — shared shader for the assistant's core, used by BOTH the
// main dashboard orb (src/orb/OrbScene.ts) and the office simulator's giant
// Alpha hologram (agents/Office3D.jsx). Owner reference: the boot cinematic's
// golden sun — "שמש אמיתי לחלוטין כמה שיותר".
//
// What makes it read as a real sun (all in one unlit fragment shader — a
// single draw call, identical on desktop and the owner's phone GPU):
//  • Granulation — domain-warped fbm convection cells (bright cell centers,
//    dark intergranular lanes) with a finer second layer riding on top.
//  • Supergranulation mottling at a lower frequency.
//  • Sunspots — low-frequency noise wells with a dark umbra and a warmer
//    penumbra ring, plus bright faculae (plage) hugging their boundaries.
//  • Limb darkening — the real photosphere effect (edge visibly dimmer/redder
//    than disc center), approximated with the standard linear law.
//  • Differential rotation — the surface pattern drifts faster at the equator
//    than at the poles, like the actual sun.
//  • Chromosphere rim — a thin warm-red glow hugging the limb.
//  • Voice reactivity — uAudioAmplitude flares the whole photosphere and
//    speeds the churn, so the star "speaks" with the assistant.
//
// ── PHONE-SAFETY: why the fragment shader samples a noise TEXTURE ──
// The first version computed Ashima simplex noise arithmetically in the
// fragment shader. On the owner's phone that rendered as a plain BLACK ball:
// GPUs that run fragment shaders in mediump (fp16, max ~65504) overflow the
// simplex permute polynomial ((x*34+1)*x on a 0..289 domain reaches ~2.8M)
// → Inf/NaN → black. Desktop fragments are highp, so it looked perfect there.
// The fix that works on EVERY device: bake tileable fbm noise into a small
// CanvasTexture once at startup (CPU-side, ~256², a few ms) and replace all
// in-shader noise arithmetic with texture lookups — every value the fragment
// shader touches then stays in the 0..~20 range, safe at any precision.
// (The VERTEX shader keeps its simplex displacement: GLSL ES mandates highp
// support in vertex shaders, so it cannot hit the fp16 overflow.)
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

// All fragment "noise" is fetched from the tileable fbm texture (uNoise,
// wrap-repeat both axes). nz() recenters to the simplex-like -1..1 range.
export const SUN_FRAG = /* glsl */`
  uniform sampler2D uNoise;
  uniform float uTime;
  uniform float uAudioAmplitude;
  uniform float uGain;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  float nz(vec2 p) { return texture2D(uNoise, p).r * 2.0 - 1.0; }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float mu = clamp(dot(n, viewDir), 0.0, 1.0);

    // ── Differential rotation: equator drifts faster than the poles ──
    float lat = (vUv.y - 0.5) * 3.14159265;
    float drift = uTime * (0.0022 + 0.0016 * cos(lat * 2.0));
    vec2 p = vec2(vUv.x + drift, vUv.y);

    float churn = uTime * (0.006 + uAudioAmplitude * 0.016);

    // ── Granulation: domain-warped convection cells + fine grain ──
    vec2 q = vec2(nz(p * 1.5), nz(p * 1.5 + vec2(0.37, 0.71)));
    float gran = nz(p * 4.0 + q * 0.12 + vec2(0.0, churn));
    float fine = nz(p * 9.0 + q * 0.07 - vec2(churn, 0.0));
    float fine2 = nz(p * 21.0 + q * 0.04 + vec2(churn * 0.7, 0.0)); // crisp cell grain
    float heat = 0.62 + 0.40 * gran + fine * 0.14 + fine2 * 0.09;

    // ── Supergranulation mottling ──
    heat += nz(p * 1.4 - vec2(churn * 0.4, 0.0)) * 0.15;

    // ── Sunspots: umbra / penumbra / faculae ──
    float spotN = nz(p * 0.8 + vec2(0.61, 0.13));
    float umbra    = smoothstep(0.42, 0.60, spotN);
    float penumbra = smoothstep(0.30, 0.44, spotN) - umbra;
    float facula   = smoothstep(0.20, 0.30, spotN) * (1.0 - smoothstep(0.30, 0.40, spotN));
    heat += facula * 0.45;
    heat *= 1.0 - umbra * 0.82;
    heat *= 1.0 - penumbra * 0.35;

    // ── Limb darkening (linear law, u≈0.62 like the real photosphere) ──
    heat *= 0.38 + 0.62 * pow(mu, 0.62);

    // ── Voice: the whole photosphere flares while the assistant speaks ──
    heat *= 1.0 + uAudioAmplitude * 0.55;

    // ── Blackbody-ish ramp: deep ember → orange → gold → white-hot ──
    vec3 col = mix(vec3(0.50, 0.11, 0.01), vec3(1.0, 0.44, 0.07), smoothstep(0.0, 0.45, heat));
    col = mix(col, vec3(1.0, 0.78, 0.30), smoothstep(0.35, 0.85, heat));
    col = mix(col, vec3(1.0, 0.98, 0.90), smoothstep(0.85, 1.35, heat));

    // ── Chromosphere rim: thin warm-red glow hugging the limb ──
    float rim = pow(1.0 - mu, 3.0);
    col += vec3(1.0, 0.34, 0.10) * rim * (0.65 + uAudioAmplitude * 0.8);

    // uGain < 1 tames the disc under a post-processing bloom chain (the sim's
    // UnrealBloomPass threshold is 0.4 — at full brightness the whole disc
    // blooms and clips to white, erasing all the surface detail).
    gl_FragColor = vec4(col * uGain, 1.0);
  }
`;

// Corona: an additive back-side shell with animated streamers — shares the
// SAME uniform objects as the core material, so advancing the core's uTime
// drives the corona for free (no second per-frame update site needed).
const CORONA_FRAG = /* glsl */`
  uniform sampler2D uNoise;
  uniform float uTime;
  uniform float uAudioAmplitude;
  uniform float uGain;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    // BackSide shell: the silhouette edge is where |dot| is small.
    float edge = 1.0 - abs(dot(n, viewDir));
    float streaks = 0.75 + 0.9 * (texture2D(uNoise, vUv * 1.8 + vec2(0.0, uTime * 0.008)).r - 0.5);
    float a = pow(edge, 2.2) * streaks * (0.5 + uAudioAmplitude * 0.7);
    gl_FragColor = vec4(vec3(1.0, 0.72, 0.32), a * uGain);
  }
`;

export interface SunUniforms {
  uTime: { value: number };
  uAudioAmplitude: { value: number };
  [key: string]: { value: unknown };
}

// ── Tileable fbm noise texture, generated once on the CPU ────────────────
// 256² · 4 octaves of periodic value noise (lattice wraps at every octave, so
// the texture tiles seamlessly under the shader's drifting/fract'd UVs).
let noiseTexture: THREE.Texture | null = null;
function getNoiseTexture(): THREE.Texture {
  if (noiseTexture) return noiseTexture;
  const S = 256;
  const cvs = document.createElement('canvas');
  cvs.width = cvs.height = S;
  const ctx = cvs.getContext('2d')!;
  const img = ctx.createImageData(S, S);
  // periodic lattice hash per octave
  const rand: number[][] = [];
  let seed = 1337;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const octaves = [4, 8, 16, 32]; // lattice periods (all divide S → tileable)
  octaves.forEach((per) => {
    const g: number[] = [];
    for (let i = 0; i < per * per; i++) g.push(rnd());
    rand.push(g);
  });
  const smooth = (t: number) => t * t * (3 - 2 * t);
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let v = 0, amp = 0.5;
      for (let o = 0; o < octaves.length; o++) {
        const per = octaves[o], g = rand[o];
        const fx = (x / S) * per, fy = (y / S) * per;
        const x0 = Math.floor(fx) % per, y0 = Math.floor(fy) % per;
        const x1 = (x0 + 1) % per, y1 = (y0 + 1) % per;
        const tx = smooth(fx - Math.floor(fx)), ty = smooth(fy - Math.floor(fy));
        const a = g[y0 * per + x0], b = g[y0 * per + x1];
        const c = g[y1 * per + x0], d = g[y1 * per + x1];
        v += amp * ((a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty);
        amp *= 0.5;
      }
      // v ∈ ~[0, 0.94] → normalize to full byte range around 0.5
      const px = Math.max(0, Math.min(255, Math.round(((v - 0.47) * 1.9 + 0.5) * 255)));
      const i = (y * S + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = px;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  noiseTexture = tex;
  return tex;
}

// gain < 1 is for scenes that run the sun through a bloom post-pass (the
// office sim) — it keeps the disc below the bloom threshold so the surface
// detail survives instead of clipping to a white ball.
export function buildSunMaterial(gain = 1.0): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAudioAmplitude: { value: 0.06 },
      uGain: { value: gain },
      uNoise: { value: getNoiseTexture() },
    },
    vertexShader: SUN_VERT,
    fragmentShader: SUN_FRAG,
  });
}

export function buildSunCorona(radius: number, sharedUniforms: SunUniforms): THREE.Mesh {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: sharedUniforms.uTime,
      uAudioAmplitude: sharedUniforms.uAudioAmplitude,
      uGain: sharedUniforms.uGain || { value: 1.0 },
      uNoise: { value: getNoiseTexture() },
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

// Glowing node markers at every vertex of a wireframe cage (owner reference:
// small bright dots sitting on the cage's lattice points) — one InstancedMesh,
// one extra draw call regardless of vertex count. Return it as a CHILD of the
// wire mesh at the call site so it inherits that mesh's rotation for free —
// no separate per-frame sync needed.
export function buildWireNodes(geometry: THREE.BufferGeometry, nodeRadius: number, color: number): THREE.InstancedMesh {
  const pos = geometry.attributes.position;
  const seen = new Map<string, THREE.Vector3>();
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const key = `${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)}`;
    if (!seen.has(key)) seen.set(key, v.clone());
  }
  const verts = Array.from(seen.values());
  const mesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(nodeRadius, 8, 8),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }),
    verts.length,
  );
  const m = new THREE.Matrix4();
  verts.forEach((p, i) => { m.makeTranslation(p.x, p.y, p.z); mesh.setMatrixAt(i, m); });
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

// Radiating light-ray starburst (owner reference: gold streaks shooting
// outward from the sun) — baked once into a canvas texture (a handful of
// tapered wedges at varied angles/lengths) and shown as a single camera-
// facing additive sprite. No per-frame cost, no shader, phone-safe by
// construction (same technique as the existing radial-gradient glow sprites).
let rayTexture: THREE.Texture | null = null;
function getRayTexture(): THREE.Texture {
  if (rayTexture) return rayTexture;
  const S = 512;
  const cvs = document.createElement('canvas');
  cvs.width = cvs.height = S;
  const ctx = cvs.getContext('2d')!;
  ctx.translate(S / 2, S / 2);
  const rays = 14;
  for (let i = 0; i < rays; i++) {
    const ang = (i / rays) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
    const len = S * 0.5 * (0.55 + Math.random() * 0.42);
    const baseW = 2.5 + Math.random() * 5;
    ctx.save();
    ctx.rotate(ang);
    const grad = ctx.createLinearGradient(0, 0, len, 0);
    grad.addColorStop(0, 'rgba(255,222,150,0.9)');
    grad.addColorStop(0.35, 'rgba(255,190,100,0.38)');
    grad.addColorStop(1, 'rgba(255,170,80,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -baseW);
    ctx.lineTo(len, -0.6);
    ctx.lineTo(len, 0.6);
    ctx.lineTo(0, baseW);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(cvs);
  rayTexture = tex;
  return tex;
}
export function buildRaySprite(color = 0xffdb8c, scale = 9): THREE.Sprite {
  const mat = new THREE.SpriteMaterial({
    map: getRayTexture(), color, transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.setScalar(scale);
  return sprite;
}
