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

    // Animated energy field
    vec3 energyPos = p * 3.5 + vec3(uTime * 0.15, uTime * 0.1, -uTime * 0.12);
    float energyN = fbm(energyPos) * 0.5 + fbm(energyPos * 2.0 + 3.0) * 0.5;

    // Cellular crystalline structure
    float cell = pow(abs(sin((energyN * 4.0 + uTime * 0.5) * 3.14159)), 2.0);
    float cell2 = pow(abs(sin((energyN * 2.5 - uTime * 0.3) * 3.14159)), 2.5);

    // Cyan-turquoise energy core palette
    vec3 deep = vec3(0.01, 0.08, 0.2);
    vec3 mid  = vec3(0.05, 0.45, 0.65);
    vec3 bright = vec3(0.3, 0.85, 1.0);
    vec3 hot = vec3(0.7, 1.0, 1.0);
    vec3 white = vec3(0.95, 1.0, 1.0);

    vec3 col = mix(deep, mid, clamp(energyN * 1.3 + 0.5, 0.0, 1.0));
    col = mix(col, bright, cell * (0.6 + uAmp * 0.5));
    col = mix(col, hot, cell2 * 0.4);
    col = mix(col, white, clamp((energyN - 0.4) * 1.5, 0.0, 1.0) * cell * 0.5);

    // Inner glow concentration
    float core = pow(max(1.0 - length(vPos) * 1.4, 0.0), 1.5);
    col += vec3(0.2, 0.8, 1.0) * core * (0.4 + uAmp * 0.6);

    // Subtle warm accents
    float warmZone = smoothstep(0.0, 0.8, p.y) * 0.12;
    col += vec3(0.8, 0.5, 0.1) * warmZone * (energyN * 0.5 + 0.5);

    // Energy pulse waves
    float pulse = sin(length(vPos) * 12.0 - uTime * 3.0) * 0.5 + 0.5;
    col += vec3(0.1, 0.6, 0.8) * pulse * 0.08 * (1.0 + uAmp * 2.0);

    // Fresnel rim glow
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 2.5);
    col += fresnel * vec3(0.3, 0.8, 1.0) * (0.5 + uAmp * 0.8);

    // HDR bloom
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col += col * max(lum - 0.7, 0.0) * 1.8;

    gl_FragColor = vec4(col, 1.0);
  }
`;
