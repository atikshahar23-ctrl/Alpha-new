import{E as e,Fn as t,J as n,Qt as r,U as i,Zt as a,b as o,gt as s,it as c,kt as l,mt as u,pn as d,tt as f,v as p,vn as m,y as h}from"./three.module-B5e4EpOu.js";var g=`
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
`,_=`
  float cyberPulse(float t, float amp) {
    return 1.0 + sin(t * 1.4) * 0.03 + sin(t * 0.53) * 0.015 + amp * 0.06;
  }
`,v={heart:16775910,mid:16758848,rim:16741145,halo:16762713,cageInner:15255930,cageOuter:5892351,light:14990435},y={heart:16777215,mid:4432341,rim:1929128,halo:8176874,cageInner:16777215,cageOuter:4432341,light:4432341};function b(){try{return localStorage.getItem(`alpha_mood`)===`goat`}catch{return!1}}function x(t=1){let n=b()?y:v;return new d({uniforms:{uTime:{value:0},uAudioAmplitude:{value:.06},uGain:{value:t},uHeart:{value:new e(n.heart)},uMid:{value:new e(n.mid)},uRim:{value:new e(n.rim)}},vertexShader:`
      uniform float uTime;
      uniform float uAudioAmplitude;
      varying vec3 vNormalW;
      varying vec3 vViewDirW;
      varying float vDisp;
      ${g}
      ${_}
      void main() {
        float pulse = cyberPulse(uTime, uAudioAmplitude);
        // Two octaves of slow simplex noise push each vertex along its
        // normal — the silhouette itself boils instead of reading as a
        // rigid CG sphere.
        float n = snoise(normal * 2.2 + vec3(0.0, uTime * 0.25, 0.0)) * 0.6
                + snoise(normal * 5.5 + vec3(uTime * 0.45)) * 0.4;
        vDisp = n;
        vec3 displaced = position * pulse + normal * n * 0.085 * pulse;
        vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
        vNormalW  = normalize(mat3(modelMatrix) * normal);
        vViewDirW = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,fragmentShader:`
      precision highp float;
      uniform float uTime;
      uniform float uAudioAmplitude;
      uniform float uGain;
      uniform vec3 uHeart;
      uniform vec3 uMid;
      uniform vec3 uRim;
      varying vec3 vNormalW;
      varying vec3 vViewDirW;
      varying float vDisp;
      ${_}
      void main() {
        float pulse = cyberPulse(uTime, uAudioAmplitude);
        // Facing ratio: 1 at the disc center, 0 at the limb.
        float facing = clamp(dot(normalize(vNormalW), normalize(vViewDirW)), 0.0, 1.0);
        // Hot heart -> saturated limb, like an over-exposed star.
        vec3 heart = uHeart;
        vec3 gold  = uMid;
        vec3 rim   = uRim;
        vec3 col = mix(rim, gold, smoothstep(0.0, 0.4, facing));
        col = mix(col, heart, smoothstep(0.55, 0.95, facing));
        // The interpolated vertex noise doubles as granulation shading.
        col *= 0.92 + vDisp * 0.22;
        col *= (1.05 + 0.3 * (pulse - 1.0) * 10.0) * uGain;
        gl_FragColor = vec4(col, 1.0);
      }
    `})}function S(t,n){return new l(new m(t,48,48),new d({uniforms:{uTime:n.uTime,uAudioAmplitude:n.uAudioAmplitude,uColor:{value:new e(b()?y.halo:v.halo)}},side:1,transparent:!0,depthWrite:!1,blending:2,vertexShader:`
        varying vec3 vNormalW; varying vec3 vViewDirW;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vNormalW  = normalize(mat3(modelMatrix) * normal);
          vViewDirW = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,fragmentShader:`
        precision highp float;
        uniform float uTime;
        uniform float uAudioAmplitude;
        uniform vec3 uColor;
        varying vec3 vNormalW; varying vec3 vViewDirW;
        ${_}
        void main() {
          float pulse = cyberPulse(uTime, uAudioAmplitude);
          float rim = 1.0 - clamp(dot(normalize(-vNormalW), normalize(vViewDirW)), 0.0, 1.0);
          float a = pow(rim, 3.4) * 0.32 * pulse;
          gl_FragColor = vec4(uColor, a);
        }
      `}))}var C=null;function w(){if(C)return C;let e=document.createElement(`canvas`);e.width=e.height=64;let t=e.getContext(`2d`),n=t.createRadialGradient(32,32,0,32,32,32);return n.addColorStop(0,`rgba(255,255,255,1)`),n.addColorStop(.35,`rgba(255,255,255,.85)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,64,64),C=new h(e),C}function T(e,o,l,d){let m=new f,h=new c(e,o);m.add(new s(new i(h),new u({color:l,transparent:!0,opacity:.38,blending:2,depthWrite:!1})));let g=h.attributes.position,_=new Set,v=[],y=new t;for(let e=0;e<g.count;e++){y.fromBufferAttribute(g,e);let t=`${y.x.toFixed(3)},${y.y.toFixed(3)},${y.z.toFixed(3)}`;_.has(t)||(_.add(t),v.push(y.x,y.y,y.z))}h.dispose();let b=new p;return b.setAttribute(`position`,new n(v,3)),m.add(new a(b,new r({color:l,size:d,map:w(),transparent:!0,opacity:.95,blending:2,depthWrite:!1,sizeAttenuation:!0}))),m}function E(e,t){e.traverse(e=>{let n=e.material;n&&n.color&&n.color.setHex(t)})}function D(e,t,n){e.uniforms.uHeart.value.setHex(t.heart),e.uniforms.uMid.value.setHex(t.mid),e.uniforms.uRim.value.setHex(t.rim),n&&n.uniforms.uColor&&n.uniforms.uColor.value.setHex(t.halo)}function O(e){return new d({uniforms:{uTime:e.uTime,uAudioAmplitude:e.uAudioAmplitude},transparent:!0,depthWrite:!1,side:2,blending:2,vertexShader:`
      varying vec3 vNormalW;
      varying vec3 vViewDirW;
      varying float vLocalY;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vNormalW  = normalize(mat3(modelMatrix) * normal);
        vViewDirW = normalize(cameraPosition - worldPos.xyz);
        vLocalY = position.y;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,fragmentShader:`
      precision highp float;
      uniform float uTime;
      uniform float uAudioAmplitude;
      varying vec3 vNormalW;
      varying vec3 vViewDirW;
      varying float vLocalY;
      ${_}
      void main() {
        float pulse = cyberPulse(uTime, uAudioAmplitude);
        float fresnel = pow(1.0 - clamp(dot(normalize(vNormalW), normalize(vViewDirW)), 0.0, 1.0), 2.2);
        vec3 gold = vec3(1.0, 0.78, 0.28);
        vec3 cyan = vec3(0.25, 0.92, 1.0);
        vec3 col = mix(gold, cyan, fresnel);
        // A scanline band sweeps her body continuously — faster and
        // brighter while she "speaks" (uAudioAmplitude), settling to a
        // slow idle sweep when silent.
        float speed = 0.35 + uAudioAmplitude * 1.6;
        float scanY = fract(vLocalY * 0.55 - uTime * speed);
        float scan = smoothstep(0.97, 1.0, scanY) + smoothstep(0.05, 0.0, scanY) * 0.6;
        // Kept deliberately dim in the body (mostly-transparent construct,
        // not a solid figure) — many overlapping additive-blended limb
        // meshes stack fast, so headroom here is what keeps her reading as
        // glowing edges + a scanline sweep instead of a blown-out white
        // silhouette once bloom picks it up.
        float body = 0.16 + fresnel * 0.38;
        float glow = (body + scan * (0.45 + uAudioAmplitude * 1.1)) * pulse * (0.65 + uAudioAmplitude * 0.55);
        gl_FragColor = vec4(col * glow, clamp(0.14 + fresnel * 0.3 + scan * 0.26, 0.0, 0.55));
      }
    `})}function k(e){let t=O(e),n=new f,r=(e,t)=>new o(e,t,4,8),i=e=>new m(e,12,12),a=new l(i(.155),t);a.position.y=2.32,n.add(a);let s=new l(r(.055,.08),t);s.position.y=2.16,n.add(s);let c=new l(r(.21,.5),t);c.position.y=1.78,n.add(c);let u=new l(i(.2),t);u.position.y=1.38,u.scale.set(1,.72,.85),n.add(u);let d=new l(r(.09,.46),t);d.position.set(-.1,1.02,.02),d.rotation.z=.03,n.add(d);let p=new l(r(.075,.46),t);p.position.set(-.1,.54,.02),n.add(p);let h=new l(i(.09),t);h.position.set(-.1,.08,.08),h.scale.set(1,.6,1.5),n.add(h);let g=new l(r(.09,.46),t);g.position.set(.11,1,-.03),g.rotation.z=-.08,n.add(g);let _=new l(r(.075,.46),t);_.position.set(.15,.53,-.05),_.rotation.z=-.05,n.add(_);let v=new l(i(.09),t);v.position.set(.16,.08,.02),v.scale.set(1,.6,1.5),n.add(v);let y=new f;y.position.set(-.27,1.95,0),n.add(y);let b=new l(r(.065,.34),t);b.position.y=-.2,b.rotation.z=.18,y.add(b);let x=new l(r(.055,.32),t);x.position.set(-.06,-.52,0),x.rotation.z=.1,y.add(x);let S=new l(i(.06),t);S.position.set(-.09,-.78,0),y.add(S);let C=new f;C.position.set(.27,1.95,0),n.add(C);let w=new l(r(.065,.34),t);w.position.y=-.17,C.add(w);let T=new l(r(.055,.32),t);T.position.set(0,-.35,0),C.add(T);let E=new l(i(.065),t);return E.position.set(0,-.5,0),C.add(E),C.rotation.z=-1.15,C.rotation.x=.35,{group:n,update:e=>{n.rotation.y=Math.sin(e*.18)*.05,C.rotation.z=-1.15+Math.sin(e*.6)*.04,y.rotation.z=.18+Math.sin(e*.5+1.3)*.02,a.rotation.y=Math.sin(e*.4)*.06}}}export{S as a,b as c,T as i,E as l,v as n,x as o,D as r,k as s,y as t};