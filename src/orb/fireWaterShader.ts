export const vertexShader = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uAmp;

  vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

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
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
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

  float fbm(vec3 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * snoise(p); p *= 2.03; a *= 0.48; }
    return v;
  }

  void main(){
    vec3 p = normalize(vPos);

    float boundaryNoise = fbm(p * 1.8 + vec3(0.0, uTime * 0.06, 0.0)) * 0.5;
    float side = p.y + boundaryNoise;
    float mixT = smoothstep(-0.4, 0.4, side);

    // Fire hemisphere — intense plasma
    vec3 firePos = p * 3.0 + vec3(0.0, -uTime * (1.4 + uAmp * 1.2), 0.0);
    float fireN = fbm(firePos) * 0.5 + fbm(firePos * 2.5 + 5.0) * 0.5;
    fireN = pow(max(fireN + 0.5, 0.0), 1.5 - uAmp * 0.5);
    vec3 fireDark = vec3(0.4, 0.02, 0.08);
    vec3 fireMid  = vec3(1.0, 0.25, 0.05);
    vec3 fireHot  = vec3(1.0, 0.85, 0.4);
    vec3 fireWhite = vec3(1.0, 0.98, 0.95);
    vec3 fireCol = mix(fireDark, fireMid, clamp(fireN * 1.4, 0.0, 1.0));
    fireCol = mix(fireCol, fireHot, clamp((fireN - 0.45) * 2.5, 0.0, 1.0));
    fireCol = mix(fireCol, fireWhite, clamp((fireN - 0.75) * 4.0, 0.0, 1.0));

    // Water hemisphere — deep ocean caustics
    vec3 waterPos = p * 3.5 + vec3(uTime * 0.2, uTime * 0.08, -uTime * 0.15);
    float waterN = fbm(waterPos) * 0.5 + fbm(waterPos * 1.8 - 3.0) * 0.5;
    float caustic = pow(abs(sin((waterN * 3.5 + uTime * 0.7) * 3.14159)), 2.5);
    float caustic2 = pow(abs(sin((waterN * 2.1 - uTime * 0.5) * 3.14159)), 3.0);
    vec3 waterDeep = vec3(0.005, 0.04, 0.18);
    vec3 waterMid  = vec3(0.02, 0.35, 0.7);
    vec3 waterLit  = vec3(0.5, 0.92, 1.0);
    vec3 waterBright = vec3(0.85, 1.0, 1.0);
    vec3 waterCol = mix(waterDeep, waterMid, clamp(waterN * 1.3 + 0.4, 0.0, 1.0));
    waterCol = mix(waterCol, waterLit, caustic * (0.6 + uAmp * 0.5));
    waterCol = mix(waterCol, waterBright, caustic2 * 0.3);

    vec3 col = mix(waterCol, fireCol, mixT);

    // Energetic seam where fire meets water
    float seam = 1.0 - smoothstep(0.0, 0.4, abs(side));
    float seamPulse = 0.6 + 0.4 * sin(uTime * 2.0 + snoise(p * 4.0) * 3.0);
    col += vec3(1.0, 0.95, 0.85) * seam * (0.7 + uAmp * 0.8) * seamPulse;

    // Electric arcs along seam
    float arc = pow(seam, 3.0) * pow(abs(snoise(p * 8.0 + uTime * 2.0)), 6.0) * 4.0;
    col += vec3(0.7, 0.9, 1.0) * arc * (1.0 + uAmp * 2.0);

    // Fresnel rim glow
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 2.5);
    vec3 rimCol = mix(vec3(0.2, 0.5, 1.0), vec3(1.0, 0.4, 0.2), mixT);
    col += fresnel * rimCol * (0.4 + uAmp * 0.6);

    // Subsurface scattering simulation
    float sss = pow(max(dot(normalize(vNormal), vec3(0.0, 1.0, 0.5)), 0.0), 3.0);
    col += sss * vec3(1.0, 0.6, 0.3) * 0.15 * (1.0 + uAmp);

    // HDR bloom contribution
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col += col * max(lum - 0.8, 0.0) * 1.5;

    gl_FragColor = vec4(col, 1.0);
  }
`;
