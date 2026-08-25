const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/GLTFLoader-D1yQsmO2.js","assets/modulepreload-polyfill-DIrsccGL.js","assets/three.module-B5e4EpOu.js"])))=>i.map(i=>d[i]);
import{$t as e,At as t,C as n,E as r,En as i,Fn as a,It as o,J as s,K as c,Ln as l,M as u,Mt as d,N as f,Nt as p,O as m,Pn as h,Pt as g,Qt as _,R as v,Xt as y,Yt as b,Zt as x,_ as S,_t as C,an as w,b as ee,bn as te,c as T,d as E,f as D,fn as ne,g as re,gt as O,h as k,it as ie,kt as A,ln as ae,mn as oe,mt as se,n as ce,pn as j,pt as le,qt as ue,rn as M,rt as N,t as P,tt as F,u as I,un as L,v as R,vn as z,vt as B,wn as de,xn as fe,y as pe}from"./three.module-B5e4EpOu.js";import{t as me}from"./preload-helper-DGuKeUGT.js";import{E as V,Gt as H,Wt as U,l as he}from"./main-D4aKo15L.js";import{a as ge,i as _e,n as ve,r as ye,t as be}from"./OutputPass-CrVK4wS5.js";import{a as W,i as G,l as K,n as xe,o as Se,r as Ce,t as we}from"./sunShader-Beudeg5Z.js";var Te={name:`FXAAShader`,uniforms:{tDiffuse:{value:null},resolution:{value:new h(1/1024,1/512)}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec2 resolution;
		varying vec2 vUv;

		#define EDGE_STEP_COUNT 6
		#define EDGE_GUESS 8.0
		#define EDGE_STEPS 1.0, 1.5, 2.0, 2.0, 2.0, 4.0
		const float edgeSteps[EDGE_STEP_COUNT] = float[EDGE_STEP_COUNT]( EDGE_STEPS );

		float _ContrastThreshold = 0.0312;
		float _RelativeThreshold = 0.063;
		float _SubpixelBlending = 1.0;

		vec4 Sample( sampler2D  tex2D, vec2 uv ) {

			return texture( tex2D, uv );

		}

		float SampleLuminance( sampler2D tex2D, vec2 uv ) {

			return dot( Sample( tex2D, uv ).rgb, vec3( 0.3, 0.59, 0.11 ) );

		}

		float SampleLuminance( sampler2D tex2D, vec2 texSize, vec2 uv, float uOffset, float vOffset ) {

			uv += texSize * vec2(uOffset, vOffset);
			return SampleLuminance(tex2D, uv);

		}

		struct LuminanceData {

			float m, n, e, s, w;
			float ne, nw, se, sw;
			float highest, lowest, contrast;

		};

		LuminanceData SampleLuminanceNeighborhood( sampler2D tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData l;
			l.m = SampleLuminance( tex2D, uv );
			l.n = SampleLuminance( tex2D, texSize, uv,  0.0,  1.0 );
			l.e = SampleLuminance( tex2D, texSize, uv,  1.0,  0.0 );
			l.s = SampleLuminance( tex2D, texSize, uv,  0.0, -1.0 );
			l.w = SampleLuminance( tex2D, texSize, uv, -1.0,  0.0 );

			l.ne = SampleLuminance( tex2D, texSize, uv,  1.0,  1.0 );
			l.nw = SampleLuminance( tex2D, texSize, uv, -1.0,  1.0 );
			l.se = SampleLuminance( tex2D, texSize, uv,  1.0, -1.0 );
			l.sw = SampleLuminance( tex2D, texSize, uv, -1.0, -1.0 );

			l.highest = max( max( max( max( l.n, l.e ), l.s ), l.w ), l.m );
			l.lowest = min( min( min( min( l.n, l.e ), l.s ), l.w ), l.m );
			l.contrast = l.highest - l.lowest;
			return l;

		}

		bool ShouldSkipPixel( LuminanceData l ) {

			float threshold = max( _ContrastThreshold, _RelativeThreshold * l.highest );
			return l.contrast < threshold;

		}

		float DeterminePixelBlendFactor( LuminanceData l ) {

			float f = 2.0 * ( l.n + l.e + l.s + l.w );
			f += l.ne + l.nw + l.se + l.sw;
			f *= 1.0 / 12.0;
			f = abs( f - l.m );
			f = clamp( f / l.contrast, 0.0, 1.0 );

			float blendFactor = smoothstep( 0.0, 1.0, f );
			return blendFactor * blendFactor * _SubpixelBlending;

		}

		struct EdgeData {

			bool isHorizontal;
			float pixelStep;
			float oppositeLuminance, gradient;

		};

		EdgeData DetermineEdge( vec2 texSize, LuminanceData l ) {

			EdgeData e;
			float horizontal =
				abs( l.n + l.s - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.se - 2.0 * l.e ) +
				abs( l.nw + l.sw - 2.0 * l.w );
			float vertical =
				abs( l.e + l.w - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.nw - 2.0 * l.n ) +
				abs( l.se + l.sw - 2.0 * l.s );
			e.isHorizontal = horizontal >= vertical;

			float pLuminance = e.isHorizontal ? l.n : l.e;
			float nLuminance = e.isHorizontal ? l.s : l.w;
			float pGradient = abs( pLuminance - l.m );
			float nGradient = abs( nLuminance - l.m );

			e.pixelStep = e.isHorizontal ? texSize.y : texSize.x;

			if (pGradient < nGradient) {

				e.pixelStep = -e.pixelStep;
				e.oppositeLuminance = nLuminance;
				e.gradient = nGradient;

			} else {

				e.oppositeLuminance = pLuminance;
				e.gradient = pGradient;

			}

			return e;

		}

		float DetermineEdgeBlendFactor( sampler2D  tex2D, vec2 texSize, LuminanceData l, EdgeData e, vec2 uv ) {

			vec2 uvEdge = uv;
			vec2 edgeStep;
			if (e.isHorizontal) {

				uvEdge.y += e.pixelStep * 0.5;
				edgeStep = vec2( texSize.x, 0.0 );

			} else {

				uvEdge.x += e.pixelStep * 0.5;
				edgeStep = vec2( 0.0, texSize.y );

			}

			float edgeLuminance = ( l.m + e.oppositeLuminance ) * 0.5;
			float gradientThreshold = e.gradient * 0.25;

			vec2 puv = uvEdge + edgeStep * edgeSteps[0];
			float pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
			bool pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !pAtEnd; i++ ) {

				puv += edgeStep * edgeSteps[i];
				pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
				pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			}

			if ( !pAtEnd ) {

				puv += edgeStep * EDGE_GUESS;

			}

			vec2 nuv = uvEdge - edgeStep * edgeSteps[0];
			float nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
			bool nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !nAtEnd; i++ ) {

				nuv -= edgeStep * edgeSteps[i];
				nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
				nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			}

			if ( !nAtEnd ) {

				nuv -= edgeStep * EDGE_GUESS;

			}

			float pDistance, nDistance;
			if ( e.isHorizontal ) {

				pDistance = puv.x - uv.x;
				nDistance = uv.x - nuv.x;

			} else {

				pDistance = puv.y - uv.y;
				nDistance = uv.y - nuv.y;

			}

			float shortestDistance;
			bool deltaSign;
			if ( pDistance <= nDistance ) {

				shortestDistance = pDistance;
				deltaSign = pLuminanceDelta >= 0.0;

			} else {

				shortestDistance = nDistance;
				deltaSign = nLuminanceDelta >= 0.0;

			}

			if ( deltaSign == ( l.m - edgeLuminance >= 0.0 ) ) {

				return 0.0;

			}

			return 0.5 - shortestDistance / ( pDistance + nDistance );

		}

		vec4 ApplyFXAA( sampler2D  tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData luminance = SampleLuminanceNeighborhood( tex2D, texSize, uv );
			if ( ShouldSkipPixel( luminance ) ) {

				return Sample( tex2D, uv );

			}

			float pixelBlend = DeterminePixelBlendFactor( luminance );
			EdgeData edge = DetermineEdge( texSize, luminance );
			float edgeBlend = DetermineEdgeBlendFactor( tex2D, texSize, luminance, edge, uv );
			float finalBlend = max( pixelBlend, edgeBlend );

			if (edge.isHorizontal) {

				uv.y += edge.pixelStep * finalBlend;

			} else {

				uv.x += edge.pixelStep * finalBlend;

			}

			return Sample( tex2D, uv );

		}

		void main() {

			gl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv );

		}`},q={1:3970708,2:2397788,3:5557932,4:16553540,5:16536140,6:15499820,7:6074012,8:9734892,9:6064844,10:3452484,11:8701516,12:3420756,13:13398548,14:16045644,15:14980644,16:13402716,17:14990940,18:14988900,19:11825852,20:10777132,21:15487564,22:11825700,23:13394612,24:10781380,25:16049748,26:16035372,27:13415940,28:16045604,29:11250637,30:9225932,31:6076108,32:12346052,33:13402844,34:10769044,35:16565924,36:16565940,37:14447148,38:13409868,39:16559780,40:16022164,41:9221868,42:11293356,43:9219636,44:16544260,45:16540260,46:15501876,47:15479348,48:6572668,49:10259132,50:12874308,51:12874308,52:16574084,53:16574084,54:16569932,55:9219796,56:16047796,57:16574132,58:12865875,59:15517300,60:5005972,61:7635652,62:5528196,63:16573996,64:13942284,65:16576044,66:7644836,67:9204404,68:8686228,69:6044164,70:13944404,71:5023356,72:7124708,73:7124708,74:11843228,75:11843228,76:13940316,77:14965292,78:14967340,79:14443132,80:14967404,81:9221796,82:15473156,83:8677924,84:12356180,85:13409876,86:13946604,87:15001332,88:9718428,89:12352188,90:10259140,91:8147588,92:13938380,93:8673900,94:8667788,95:8682108,96:16047620,97:16047620,98:16544308,99:15501900,100:16536100,101:13906500,102:16570028,103:7646772,104:12885580,105:9726548,106:13411972,107:13416060,108:16557721,109:15521388,110:12356300,111:8684204,112:9210516,113:16559788,114:6072012,115:10254964,116:7116468,117:7111324,118:15497796,119:14971460,120:13407788,121:6050460,122:1329780,123:6069836,124:16003676,125:12887572,126:16534068,127:12889740,128:14460492,129:16015900,130:2394796,131:3963556,132:12876516,133:13934156,134:6080228,135:16571988,136:12887660,137:819876,138:3972812,139:3972812,140:12878380,141:12356164,142:9732772,143:3431036,144:8169212,145:13938188,146:15491644,147:7635668,148:7644924,149:15507004,150:7090844,151:15499956},J=Math.PI,Y=J*2,Ee={uniforms:{tDiffuse:{value:null},offset:{value:1},darkness:{value:.65}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
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
  `},De={uniforms:{tDiffuse:{value:null},uStrength:{value:0}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float uStrength;
    varying vec2 vUv;
    void main() {
      vec2 dir = vUv - 0.5;
      vec2 off = dir * length(dir) * uStrength;
      float r = texture2D(tDiffuse, vUv - off).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv + off).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `},Oe={uniforms:{tDiffuse:{value:null},uStrength:{value:0}},vertexShader:`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float uStrength;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 hsv = texel.rgb;
      float maxc = max(max(hsv.r, hsv.g), hsv.b);
      vec3 boosted = mix(vec3(maxc), texel.rgb, 1.6); // punch up saturation
      const float bands = 5.0;
      vec3 toon = floor(boosted * bands) / bands;
      gl_FragColor = vec4(mix(texel.rgb, clamp(toon, 0.0, 1.0), uStrength), texel.a);
    }
  `};function ke(e,t,n){let r=new R,i=new Float32Array(e),a=new Float32Array(e),o=new Float32Array(e),s=new Float32Array(e);for(let r=0;r<e;r++)i[r]=Math.random(),a[r]=t+Math.random()*n,o[r]=.25+Math.random()*.5,s[r]=Math.random()*Y;r.setAttribute(`position`,new S(new Float32Array(e*3),3)),r.setAttribute(`aSeed`,new S(i,1)),r.setAttribute(`aRadius`,new S(a,1)),r.setAttribute(`aSpeed`,new S(o,1)),r.setAttribute(`aPhase`,new S(s,1));let c=new j({uniforms:{uTime:{value:0},uFill:{value:.35},uBurst:{value:0},uPx:{value:Math.min(window.devicePixelRatio||1,2)}},vertexShader:`
      attribute float aSeed;
      attribute float aRadius;
      attribute float aSpeed;
      attribute float aPhase;
      uniform float uTime;
      uniform float uFill;
      uniform float uBurst;
      uniform float uPx;
      varying float vGlow;
      void main() {
        const float H = 4.2;
        float fill = max(uFill, 0.06);
        float yN = fract(aSeed + uTime * 0.045 * (0.5 + aSpeed));
        float y = yN * H * fill - 1.9;
        float pinch = 1.0 - 0.38 * pow(yN, 2.0);      // tornado silhouette
        float ang = aPhase + uTime * aSpeed * (1.0 + uBurst * 1.5);
        float r = aRadius * pinch;
        vec4 mv = modelViewMatrix * vec4(cos(ang) * r, y, sin(ang) * r, 1.0);
        float tip = smoothstep(0.72, 1.0, yN);        // brightest at the live edge
        vGlow = (0.30 + 0.70 * tip) * (1.0 + uBurst * 2.2);
        gl_PointSize = (1.6 + aSeed * 2.2) * (1.0 + uBurst * 1.2) * uPx * (6.0 / max(0.5, -mv.z));
        gl_Position = projectionMatrix * mv;
      }
    `,fragmentShader:`
      varying float vGlow;
      void main() {
        float a = smoothstep(0.5, 0.08, length(gl_PointCoord - 0.5));
        vec3 col = mix(vec3(0.35, 0.22, 0.02), vec3(1.0, 0.85, 0.45), min(vGlow, 1.0));
        gl_FragColor = vec4(col * vGlow, a * 0.8);
      }
    `,transparent:!0,blending:2,depthWrite:!1}),l=new x(r,c);l.frustumCulled=!1;let u=0;return{points:l,update(e){u+=e,c.uniforms.uTime.value=u,c.uniforms.uBurst.value*=Math.max(0,1-e*2.2)},setFill(e){c.uniforms.uFill.value=Math.max(0,Math.min(1,e))},burst(){c.uniforms.uBurst.value=1},burstLevel(){return c.uniforms.uBurst.value},dispose(){r.dispose(),c.dispose()}}}var X=null;function Ae(){if(X)return X;let e=new f(new Uint8Array([70,70,70,255,165,165,165,255,255,255,255,255]),3,1,M);return e.magFilter=o,e.minFilter=o,e.needsUpdate=!0,X=e,e}function je(e,n){let r=Ae(),i=new F,a=new g({color:e,gradientMap:r}),o=new g({color:n,gradientMap:r}),s=new g({color:1842204,gradientMap:r}),c=new A(new re(.62,.28,.34),a);c.position.y=.22,i.add(c);let l=new A(new re(.3,.22,.3),o);l.position.set(-.06,.42,0),i.add(l);let d=new u(.11,.11,.08,14);[[-.2,-.19],[.2,-.19],[-.2,.19],[.2,.19]].forEach(([e,t])=>{let n=new A(d,s);n.rotation.z=Math.PI/2,n.position.set(e,.11,t),i.add(n)});let f=document.createElement(`canvas`);f.width=128,f.height=64;let p=f.getContext(`2d`);p.fillStyle=`#fff`,p.beginPath(),p.ellipse(38,32,22,22,0,0,Y),p.ellipse(90,32,22,22,0,0,Y),p.fill(),p.fillStyle=`#20242c`,p.beginPath(),p.ellipse(42,30,10,10,0,0,Y),p.ellipse(94,30,10,10,0,0,Y),p.fill();let m=new pe(f),h=new A(new b(.34,.17),new t({map:m,transparent:!0}));return h.position.set(.32,.25,0),h.rotation.y=J/2,i.add(h),i.scale.setScalar(.85),i}function Me(){let e=new F;e.position.set(0,-1.35,1.4),e.visible=!1;let t=[[4099831,16777215],[16734798,16769658],[16763196,3129201]].map((t,n)=>{let r=je(t[0],t[1]),i=new a((n-1)*1.15,0,0);return r.position.copy(i),e.add(r),{mesh:r,vel:new a,angVel:0,spawn:i}}),n=new w;return{group:e,update:e=>{t.forEach(t=>{t.vel.y-=6.4*e,t.mesh.position.addScaledVector(t.vel,e),t.mesh.rotation.y+=t.angVel*e,t.mesh.position.y<0&&(t.mesh.position.y=0,t.vel.y<0&&(t.vel.y*=-.55),t.vel.x*=.85,t.vel.z*=.85,t.angVel*=.85,Math.abs(t.vel.y)<.15&&Math.abs(t.vel.x)<.05&&Math.abs(t.vel.z)<.05&&(t.vel.set(0,0,0),t.angVel=0))})},handleTap:(r,i,a)=>{if(!e.visible)return;n.setFromCamera(new h(r,i),a);let o=n.intersectObjects(e.children,!0);if(!o.length)return;let s=o[0].object;for(;s&&s.parent!==e;)s=s.parent;let c=t.find(e=>e.mesh===s);c&&(c.vel.set((Math.random()-.5)*2.6,3.6+Math.random()*1.3,(Math.random()-.5)*1.6),c.angVel=(Math.random()-.5)*10)},setActive:n=>{e.visible=n,n&&t.forEach(e=>{e.mesh.position.copy(e.spawn),e.mesh.rotation.set(0,0,0),e.vel.set(0,0,0),e.angVel=0})}}}var Ne=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Pe=`
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
`,Fe=`
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
`,Ie=`
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
`,Le=`
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float d = length(c) * 2.0;
    float ring = smoothstep(0.9, 0.95, d) * smoothstep(1.0, 0.97, d);
    vec3 col = vec3(0.9, 0.75, 0.35);
    gl_FragColor = vec4(col, ring * uOpacity);
  }
`,Re=null;function ze(){if(Re)return Re;let e=document.createElement(`canvas`);e.width=128,e.height=128;let t=e.getContext(`2d`),n=t.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);return n.addColorStop(0,`rgba(255,255,255,1)`),n.addColorStop(.2,`rgba(255,255,255,0.8)`),n.addColorStop(.5,`rgba(255,255,255,0.25)`),n.addColorStop(.8,`rgba(255,255,255,0.04)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,128,128),Re=new pe(e),Re}var Be=null;function Ve(){if(Be)return Be;let e=document.createElement(`canvas`);e.width=256,e.height=256;let t=e.getContext(`2d`);t.clearRect(0,0,256,256);let n=t.createRadialGradient(256/2,256/2,0,256/2,256/2,256/2);n.addColorStop(0,`rgba(255,240,210,0.9)`),n.addColorStop(.25,`rgba(255,225,170,0.35)`),n.addColorStop(.6,`rgba(218,165,32,0.06)`),n.addColorStop(1,`rgba(218,165,32,0)`),t.fillStyle=n,t.fillRect(0,0,256,256);let r=t.createLinearGradient(0,256/2-4,256,132);return r.addColorStop(0,`rgba(255,235,190,0)`),r.addColorStop(.5,`rgba(255,235,190,0.5)`),r.addColorStop(1,`rgba(255,235,190,0)`),t.fillStyle=r,t.fillRect(0,256/2-3,256,6),Be=new pe(e),Be}function He(e){try{let t=new P(e),n=new ne;n.background=new r(657414),n.add(new N(16772829,657414,.8));let i=new y(16772829,15,30);i.position.set(5,5,5),n.add(i);let a=new y(14329120,10,30);a.position.set(-5,3,-3),n.add(a);let o=new y(16771264,8,30);o.position.set(0,-2,6),n.add(o);let s=t.fromScene(n,0,.1,100).texture;return t.dispose(),s}catch{return null}}function Ue(e){let t=e??void 0,n=+!!e;return{yellow:new d({color:16635957,metalness:0,roughness:.52,...t?{envMap:t,envMapIntensity:.3*n}:{},clearcoat:.18,clearcoatRoughness:.3,sheen:.2,sheenRoughness:.42,sheenColor:new r(16770426),emissive:new r(16635957),emissiveIntensity:.02}),darkYellow:new d({color:13149205,metalness:0,roughness:.58,...t?{envMap:t,envMapIntensity:.18*n}:{},clearcoat:.08,clearcoatRoughness:.38,emissive:new r(13149205),emissiveIntensity:.01}),cream:new d({color:16776679,metalness:0,roughness:.48,...t?{envMap:t,envMapIntensity:.2*n}:{},clearcoat:.12,clearcoatRoughness:.3,emissive:new r(16776679),emissiveIntensity:.02}),red:new d({color:15022389,metalness:0,roughness:.45,...t?{envMap:t,envMapIntensity:.2*n}:{},emissive:new r(15022389),emissiveIntensity:.06,clearcoat:.14,clearcoatRoughness:.2}),brown:new d({color:6111287,metalness:0,roughness:.6,...t?{envMap:t,envMapIntensity:.18*n}:{},clearcoat:.08,clearcoatRoughness:.4}),white:new d({color:16777215,metalness:0,roughness:.18,...t?{envMap:t,envMapIntensity:.2*n}:{},emissive:new r(16777215),emissiveIntensity:.12,clearcoat:.28,clearcoatRoughness:.1}),black:new d({color:657930,metalness:.06,roughness:.22,...t?{envMap:t,envMapIntensity:.25*n}:{},clearcoat:.35,clearcoatRoughness:.12}),mouth:new d({color:9116186,metalness:0,roughness:.5,...t?{envMap:t,envMapIntensity:.12*n}:{},clearcoat:.1,clearcoatRoughness:.3}),nose:new d({color:1381653,metalness:.06,roughness:.28,...t?{envMap:t,envMapIntensity:.22*n}:{},clearcoat:.28,clearcoatRoughness:.12}),pink:new d({color:16027569,metalness:0,roughness:.58,...t?{envMap:t,envMapIntensity:.12*n}:{},clearcoat:.06,clearcoatRoughness:.48,emissive:new r(16027569),emissiveIntensity:.03}),tongue:new d({color:15753344,metalness:0,roughness:.4,...t?{envMap:t,envMapIntensity:.1*n}:{},clearcoat:.16,clearcoatRoughness:.24,emissive:new r(15220832),emissiveIntensity:.04})}}function We(e,r){let i=new F,a=new F,o=e=>Math.max(8,Math.round(e*r)),l=e.yellow,f=e.brown,p=e.black,h=e.cream,g=new A(new z(.68,o(48),o(48)),l);g.scale.set(1.1,1,.88),g.position.set(0,-.32,0),i.add(g);let _=new A(new z(.52,o(32),o(32)),h);_.scale.set(.88,.85,.32),_.position.set(0,-.28,.38),i.add(_);let v=new A(new z(.5,o(24),o(24)),l);v.scale.set(1.22,.62,.98),v.position.set(0,-.66,0),i.add(v);let b=new A(new z(.45,o(32),o(32)),l);b.scale.set(.92,.5,.78),b.position.set(0,.2,0),i.add(b);for(let[e,t,n]of[[.02,.6,0],[-.22,.52,.01]]){let r=new A(new ee(.048,t,o(6),o(12)),f);r.rotation.z=J/2,r.position.set(n,-.18+e,-.56),r.rotation.x=.14,r.scale.set(1,1,.62),i.add(r)}let x=new A(new z(.72,o(48),o(48)),l);x.scale.set(1.24,1.06,.94),x.position.set(0,.02,.04),a.add(x);for(let e of[-1,1]){let t=new A(new z(.32,o(20),o(20)),l);t.scale.set(.62,.56,.48),t.position.set(e*.54,-.13,.33),a.add(t)}let S,C;for(let t of[-1,1]){let r=new F,i=new A(new z(.16,o(24),o(24)),l);i.scale.set(1.05,3.4,.6),i.position.set(0,.42,0),r.add(i);let s=new A(new m(.12,.7,o(16)),l);s.position.set(0,.9,0),s.scale.set(1.05,1,.6),r.add(s);let c=new A(new z(.14,o(16),o(16)),p);c.scale.set(.9,1.5,.55),c.position.set(0,.96,0),r.add(c);let u=new A(new m(.1,.5,o(14)),p);u.position.set(0,1.22,0),u.scale.set(.9,1,.55),r.add(u);let d=new A(new n(.1,o(16)),e.pink);d.scale.set(.85,2.6,1),d.position.set(0,.44,.08),d.rotation.x=-.12,r.add(d),r.position.set(t*.46,.52,-.04),r.rotation.z=-t*.2,r.rotation.x=-.1,a.add(r),t===-1?S=r:C=r}let w=document.createElement(`canvas`);w.width=2048,w.height=2048;let T=w.getContext(`2d`);T.clearRect(0,0,2048,2048);let E=(e,t,n,r,i)=>{T.fillStyle=i,T.beginPath(),T.ellipse(e*4,t*4,n*4,r*4,0,0,Y),T.fill()};T.save(),T.translate(712,872),T.rotate(.08),T.fillStyle=`#0A0804`,T.beginPath(),T.ellipse(0,0,184,248,0,0,Y),T.fill(),T.restore(),T.save(),T.translate(334*4,872),T.rotate(-.08),T.fillStyle=`#0A0804`,T.beginPath(),T.ellipse(0,0,184,248,0,0,Y),T.fill(),T.restore();for(let[e,t,n]of[[178,218,.08],[334,218,-.08]]){T.save(),T.translate(e*4,t*4),T.rotate(n);let r=T.createRadialGradient(0,0,40,0,0,148);r.addColorStop(0,`rgba(8,4,1,1)`),r.addColorStop(.36,`rgba(52,26,6,0.95)`),r.addColorStop(.6,`rgba(98,56,16,0.72)`),r.addColorStop(.82,`rgba(42,20,4,0.5)`),r.addColorStop(1,`rgba(8,4,1,0)`),T.fillStyle=r,T.beginPath(),T.ellipse(0,0,160,216,0,0,Y),T.fill(),T.restore()}E(196,196,18,22,`#FFFFFF`),E(350,196,18,22,`#FFFFFF`),E(166,232,9,11,`#FFFFFF`),E(318,232,9,11,`#FFFFFF`),E(185,204,5,5,`rgba(255,255,255,0.65)`),E(339,204,5,5,`rgba(255,255,255,0.65)`),E(174,238,4,3,`rgba(180,200,220,0.45)`),E(328,238,4,3,`rgba(180,200,220,0.45)`);let D=(e,t)=>{let n=T.createRadialGradient(e*4,t*4,16,e*4,t*4,224);n.addColorStop(0,`rgba(245, 82, 78, 0.92)`),n.addColorStop(.4,`rgba(229, 57, 53, 0.72)`),n.addColorStop(.72,`rgba(229, 57, 53, 0.28)`),n.addColorStop(1,`rgba(229, 57, 53, 0)`),T.fillStyle=n,T.beginPath(),T.ellipse(e*4,t*4,232,200,0,0,Y),T.fill();let r=T.createRadialGradient(e*4,(t-6)*4,0,e*4,t*4,88);r.addColorStop(0,`rgba(255,160,140,0.55)`),r.addColorStop(1,`rgba(255,100,90,0)`),T.fillStyle=r,T.beginPath(),T.ellipse(e*4,t*4,88,72,0,0,Y),T.fill()};D(108,298),D(404,298),T.fillStyle=`#1A1008`,T.beginPath(),T.moveTo(256*4,286*4),T.lineTo(996,298*4),T.lineTo(263*4,298*4),T.closePath(),T.fill(),T.strokeStyle=`#1A0505`,T.lineWidth=16,T.lineCap=`round`,T.lineJoin=`round`,T.beginPath(),T.moveTo(792,314*4),T.quadraticCurveTo(860,348*4,996,332*4),T.quadraticCurveTo(256*4,318*4,263*4,332*4),T.quadraticCurveTo(297*4,348*4,314*4,314*4),T.stroke(),T.save(),T.strokeStyle=`#0E0804`,T.lineWidth=40,T.lineCap=`round`,T.beginPath(),T.moveTo(544,716),T.quadraticCurveTo(704,632,888,692),T.stroke(),T.beginPath(),T.moveTo(292*4,692),T.quadraticCurveTo(336*4,632,376*4,716),T.stroke(),T.restore();let ne=T.createRadialGradient(256*4,320,0,256*4,560,800);ne.addColorStop(0,`rgba(255,255,220,0.12)`),ne.addColorStop(.6,`rgba(255,240,180,0.04)`),ne.addColorStop(1,`rgba(255,240,180,0)`),T.fillStyle=ne,T.fillRect(0,0,2048,2048);let re=T.createRadialGradient(256*4,320*4,160,256*4,280*4,960);re.addColorStop(0,`rgba(20,10,2,0)`),re.addColorStop(.7,`rgba(20,10,2,0)`),re.addColorStop(1,`rgba(20,10,2,0.22)`),T.fillStyle=re,T.fillRect(0,0,2048,2048),T.globalCompositeOperation=`destination-in`;let O=T.createRadialGradient(1024,1024,0,1024,1024,1024);O.addColorStop(0,`rgba(255,255,255,1)`),O.addColorStop(.85,`rgba(255,255,255,1)`),O.addColorStop(1,`rgba(255,255,255,0)`),T.fillStyle=O,T.fillRect(0,0,2048,2048),T.globalCompositeOperation=`source-over`;let k=new pe(w);k.colorSpace=L;let ae=new A(new n(.8,o(48)),new t({map:k,transparent:!0,depthWrite:!1,depthTest:!1,side:0}));ae.renderOrder=2,ae.position.set(0,0,.72),a.add(ae);let se,ce,j,ue,M,N,P=new t({visible:!1});for(let e of[-1,1]){let t=new A(new z(.001,4,4),P);t.position.set(e*.19,.02,.72),a.add(t),e===-1?M=t:N=t;let n=new A(new z(.001,4,4),P);n.position.set(e*.19,-.04,.72),a.add(n),e===-1?j=n:ue=n;let r=new A(new z(.22,o(24),o(12),0,Y,0,J*.5),l);r.scale.set(.85,.01,.45),r.position.set(e*.19,.14,.72),r.rotation.x=-.08,a.add(r),e===-1?se=r:ce=r}let I=new A(new z(.001,4,4),new t({visible:!1}));I.position.set(0,-.18,.72),a.add(I);let B=new A(new z(.03,o(12),o(12)),e.tongue);B.scale.set(1.5,.55,.9),B.position.set(0,-.2,.715),a.add(B);let de=new d({color:15022389,roughness:.5,emissive:15022389,emissiveIntensity:.3,transparent:!0,opacity:.18,depthWrite:!1,depthTest:!1}),me=new d({color:15022389,roughness:.5,emissive:15022389,emissiveIntensity:.3,transparent:!0,opacity:.18,depthWrite:!1,depthTest:!1}),V=new n(.12,o(24)),H=new A(V,de);H.renderOrder=3,H.position.set(-.44,-.1,.722),a.add(H);let U=new A(V,me);U.renderOrder=3,U.position.set(.44,-.1,.722),a.add(U),a.position.set(0,.5,.04),i.add(a);let he=new A(new u(.28,.34,.22,o(20)),l);he.position.set(0,.28,.04),i.add(he);let ge=new ee(.11,.3,o(8),o(12)),_e=new A(ge,l);_e.position.set(-.82,.04,.26),_e.rotation.z=.78,_e.rotation.x=.14,i.add(_e);let ve=new A(ge,l);ve.position.set(.82,.04,.26),ve.rotation.z=-.78,ve.rotation.x=.14,i.add(ve);for(let e of[-1,1]){let t=e*.82+e*Math.cos(.78)*.2,n=.04-Math.sin(.78)*.2-.02;for(let r=0;r<3;r++){let a=new A(new z(.025,o(6),o(6)),l),s=(r-1)*.4;a.position.set(t+e*Math.cos(s)*.05,n-.03+Math.sin(s)*.02,.33+Math.abs(Math.cos(s))*.02),i.add(a)}}let ye=new ee(.18,.2,o(10),o(14));for(let e of[-1,1]){let t=new A(ye,l);t.rotation.x=J/2,t.rotation.z=e*.08,t.position.set(e*.32,-.95,.26),t.scale.set(1.05,1,.78),i.add(t);for(let t=0;t<3;t++){let n=new A(new z(.04,o(8),o(8)),l);n.position.set(e*.32+(t-1)*.06,-1.05,.42),n.scale.set(.85,.55,1.1),i.add(n)}}let be=new t({color:0,transparent:!0,opacity:.15,depthWrite:!1,side:2}),W=new A(new n(.6,o(24)),be);W.position.set(0,-1.12,.16),W.rotation.x=-J/2,i.add(W);let G=new F,K=new oe;K.moveTo(0,0),K.lineTo(.2,.32),K.lineTo(-.1,.38),K.lineTo(.25,.78),K.lineTo(-.12,.86),K.lineTo(.35,1.5),K.lineTo(.52,1.4),K.lineTo(.1,.84),K.lineTo(.42,.76),K.lineTo(.05,.32),K.lineTo(.32,.26),K.lineTo(0,0);let xe=new A(new c(K,{depth:.14,bevelEnabled:!0,bevelThickness:.04,bevelSize:.04,bevelSegments:o(3)}),l);xe.position.set(-.16,0,-.07),G.add(xe);let Se=new A(new ee(.1,.2,o(8),o(12)),f);Se.position.set(.04,-.04,.01),G.add(Se),G.position.set(.08,-.06,-.52),G.rotation.x=.72,G.rotation.y=.18,G.rotation.z=-.38,i.add(G);let Ce=new F,we=[],Te=[],q=Math.round(10*r);function Ee(e,t){let n=[];for(let r=0;r<=t;r++){let i=r/t,a=r===0||r===t?0:(Math.random()-.5)*e*.35,o=r===0||r===t?0:(Math.random()-.5)*e*.18;n.push(a,i*e-e*.5,o)}let r=new R;return r.setAttribute(`position`,new s(n,3)),r}for(let e=0;e<q;e++){let n=new t({color:e%3==0?16777181:16770125,transparent:!0,opacity:0,depthWrite:!1,blending:2});we.push(n);let r=.28+Math.random()*.28,i=new le(Ee(r,Math.round(5+Math.random()*4)),n),a=e/q*Y,o=1.05+Math.random()*.55;i.position.set(Math.cos(a)*o,-.35+Math.random()*1.1,Math.sin(a)*o),i.rotation.set(Math.random()*J,Math.random()*J,Math.random()*J),Ce.add(i),Te.push(i);let s=new t({color:16777215,transparent:!0,opacity:0,depthWrite:!1,blending:2});we.push(s);let c=new le(Ee(r*.45,3),s);c.position.set(i.position.x+(Math.random()-.5)*.18,i.position.y+(Math.random()-.5)*.18,i.position.z+(Math.random()-.5)*.18),c.rotation.set(Math.random()*J,Math.random()*J,Math.random()*J),Ce.add(c),Te.push(c)}for(let e of[-1,1])for(let n=0;n<3;n++){let r=new t({color:n===0?16777215:16768324,transparent:!0,opacity:0,depthWrite:!1,blending:2});we.push(r);let i=new le(Ee(.1+Math.random()*.08,4),r);i.position.set(e*.48+(Math.random()-.5)*.1,.4+(Math.random()-.5)*.1,.52+Math.random()*.1),i.rotation.set(Math.random()*J*.5,Math.random()*J,e*.4),Ce.add(i),Te.push(i)}i.add(Ce);let De=new t({color:16768324,transparent:!0,opacity:0,wireframe:!0,depthWrite:!1,blending:2}),Oe=new A(new ie(1.6,1),De);i.add(Oe);let ke=new A(new z(2,4,4),new t({visible:!1}));i.add(ke);let X=new y(16776688,2.2,5,1);X.position.set(0,.5,2.5),i.add(X);let Ae=new y(16775392,1,4.5,1.2);Ae.position.set(0,2.2,.5),i.add(Ae);let je=new y(16769200,.7,3.5,1.5);je.position.set(1.8,.8,.8),i.add(je);let Me=[],Ne=Math.round(12*r);for(let e=0;e<Ne;e++){let t=e%3==0?16777215:e%3==1?16769072:16763904,n=new fe({map:ze(),color:t,transparent:!0,opacity:.7,blending:2,depthWrite:!1});Me.push(n);let r=new te(n),i=e/Ne*Y+Math.random()*.5,a=1+Math.random()*.65,o=.18+Math.random()*.22;r.scale.setScalar(o),r.position.set(Math.cos(i)*a,-.35+Math.random()*1.1,Math.sin(i)*a),Ce.add(r)}return{group:i,head:a,leftEye:M,rightEye:N,leftPupil:j,rightPupil:ue,leftEyelid:se,rightEyelid:ce,leftEarGroup:S,rightEarGroup:C,cheekMatL:de,cheekMatR:me,tail:G,leftArm:_e,rightArm:ve,mouthMesh:I,tongue:B,sparks:Ce,sparkMats:we,sparkMeshes:Te,auraMat:De,coronaMats:Me}}function Ge(){let e=0,t=Math.random()*100,n=Math.random()*100,r=Math.random()*100;return{addTrauma(t){e=Math.min(1,e+t)},update(i,a){e=Math.max(0,e-i*1.6);let o=e*e,s=Math.sin(a*22+t)*.6+Math.sin(a*22*2.3+t*1.7)*.4,c=Math.sin(a*22*1.15+n)*.6+Math.sin(a*22*2.7+n*1.3)*.4,l=Math.sin(a*22*.9+r)*.6+Math.sin(a*22*2.1+r*1.9)*.4;return{x:s*o*.06,y:c*o*.05,roll:l*o*.05}}}}function Ke(e){let t=e.map(e=>e.intensity);return{update(n){if(n>=2.6&&n<3.1){let n=Math.random()<.5?.12+Math.random()*.18:.85+Math.random()*.3;e.forEach((e,r)=>{e.intensity=t[r]*n})}else if(n>=3.1&&n<4){let r=n-3.1,i=1+2.4*Math.exp(-r*7);e.forEach((e,n)=>{e.intensity=t[n]*i})}else e.forEach((e,n)=>{e.intensity=t[n]})},settle(){e.forEach((e,n)=>{e.intensity=t[n]})}}}function qe(t,n){let r,i;try{r=new D,t.add(r),i=new e(r),i.setRefDistance(3),i.setRolloffFactor(1.5),n.add(i)}catch{return null}let a=r.context,o=a.createGain();o.gain.value=1e-4;let s=a.createBiquadFilter();s.type=`lowpass`,s.frequency.value=55,s.Q.value=8,s.connect(o),i.setNodeSource(o);let c=new E(i,256);function l(e){let t=a.createBuffer(1,Math.max(1,Math.floor(a.sampleRate*e)),a.sampleRate),n=t.getChannelData(0);for(let e=0;e<n.length;e++)n[e]=Math.random()*2-1;return t}function u(){a.state!==`running`&&a.resume().catch(()=>{});let e=a.currentTime,t=a.createBufferSource();t.buffer=l(3.4);let n=a.createGain();n.gain.setValueAtTime(1e-4,e),n.gain.exponentialRampToValueAtTime(.9,e+3),t.connect(n).connect(s),t.start(e),t.stop(e+3.4),s.frequency.setValueAtTime(55,e),s.frequency.exponentialRampToValueAtTime(70,e+1.2),s.frequency.exponentialRampToValueAtTime(240,e+2.9);let r=a.createOscillator();r.type=`sawtooth`,r.frequency.setValueAtTime(60,e),r.frequency.exponentialRampToValueAtTime(340,e+3);let i=a.createGain();i.gain.setValueAtTime(1e-4,e),i.gain.exponentialRampToValueAtTime(.32,e+3),r.connect(i).connect(o),r.start(e),r.stop(e+3.2),o.gain.setValueAtTime(1e-4,e),o.gain.exponentialRampToValueAtTime(.9,e+2.5);let c=e+2.6;for(let e=0;e<6;e++)o.gain.setValueAtTime(e%2==0?.22:.9,c+e*.08);o.gain.setValueAtTime(.9,c+.5);let u=e+3.1,d=a.createBufferSource();d.buffer=l(.6);let f=a.createBiquadFilter();f.type=`lowpass`,f.frequency.setValueAtTime(400,u),f.frequency.exponentialRampToValueAtTime(60,u+.5);let p=a.createGain();p.gain.setValueAtTime(1.3,u),p.gain.exponentialRampToValueAtTime(1e-4,u+.9),d.connect(f).connect(p).connect(o),d.start(u),d.stop(u+.9);let m=a.createOscillator();m.type=`sine`,m.frequency.setValueAtTime(90,u),m.frequency.exponentialRampToValueAtTime(30,u+.4);let h=a.createGain();h.gain.setValueAtTime(1,u),h.gain.exponentialRampToValueAtTime(1e-4,u+.6),m.connect(h).connect(o),m.start(u),m.stop(u+.7),o.gain.setValueAtTime(.9,u),o.gain.exponentialRampToValueAtTime(1e-4,u+2.2)}return{analyser:c,ignite:u,isRunning(){return a.state===`running`},unlock(){a.state!==`running`&&a.resume().catch(()=>{})},dispose(){try{t.remove(r)}catch{}try{n.remove(i)}catch{}}}}function Je(e,t){if(!e||e.isRunning())return t(),()=>{};let n=()=>{window.removeEventListener(`pointerdown`,r),window.removeEventListener(`keydown`,r),window.removeEventListener(`touchstart`,r)},r=()=>{n(),e.unlock(),t()};return window.addEventListener(`pointerdown`,r),window.addEventListener(`keydown`,r),window.addEventListener(`touchstart`,r),n}function Ye(e,t){let n=.06+.025*Math.sin(t*1.05),r=e*(.45+.55*(.55*Math.abs(Math.sin(t*12.7))+.45*Math.abs(Math.sin(t*21.3+1.7))));return Math.min(1.25,n+r)}function Xe(e,t){let n=new F,r=new Float32Array(e*3),i=[];for(let n=0;n<e;n++){let e=1.7+Math.random()*1.7,a=Math.random()*Math.PI*2,o=Math.acos(2*Math.random()-1),s=e*Math.sin(o)*Math.cos(a),c=e*Math.sin(o)*Math.sin(a),l=e*Math.cos(o);r[n*3]=s,r[n*3+1]=c,r[n*3+2]=l,i.length<t&&i.push([s,c,l])}let a=new R;a.setAttribute(`position`,new S(r,3));let o=new _({color:16769440,size:.03,transparent:!0,opacity:.6,blending:2,depthWrite:!1,sizeAttenuation:!0,fog:!1});n.add(new x(a,o));let c=[];for(let[e,t,n]of i){let r=e*.26,i=t*.26,a=n*.26,o=(e+r)/2-t*.14,s=(t+i)/2+e*.14,l=(n+a)/2;c.push(e,t,n,o,s,l,o,s,l,r,i,a)}let l=new R;l.setAttribute(`position`,new s(c,3));let u=new se({color:8381439,transparent:!0,opacity:.18,blending:2,depthWrite:!1,fog:!1});n.add(new O(l,u));let d=0;return{group:n,update(e,t,r){n.rotation.y+=e*.12,n.rotation.x=Math.sin(r*.16)*.16,d+=(+(t>.5)-d)*Math.min(1,e*3),n.scale.setScalar(1-d*.2-t*.05),o.opacity=.4+t*.5,o.size=.03+t*.02,u.opacity=.14+d*.5+t*.28}}}function Ze(e=96){let t=new F,n=Se(),r=new A(new z(1.1,e,e),n);t.add(r);let i=W(1.1*1.28,n.uniforms);t.add(i);let a=(()=>{try{return localStorage.getItem(`alpha_mood`)===`goat`}catch{return!1}})(),o=G(1.55,1,a?we.cageInner:15255930,.13);t.add(o);let s=G(1.95,1,a?we.cageOuter:5892351,.12);t.add(s);let c=Xe(e>=100?2200:900,e>=100?150:80);t.add(c.group);let l=new y(a?we.light:14990435,1.6,9);return t.add(l),{group:t,core:r,coreMat:n,wire:o,wire2:s,tendrils:c,light:l,setPalette:e=>{Ce(n,e,i.material),K(o,e.cageInner),K(s,e.cageOuter),l.color.setHex(e.light)}}}var Qe=`
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
`,$e=`
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
`,et=`
  attribute float aT;
  varying float vT;
  void main() {
    vT = aT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,tt=`
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
`;function nt(){try{let e=new(window.AudioContext||window.webkitAudioContext),t=e.currentTime,n=e.createGain();n.gain.setValueAtTime(.9,t),n.connect(e.destination);let r=e.createOscillator();r.type=`sine`,r.frequency.setValueAtTime(1800,t),r.frequency.exponentialRampToValueAtTime(1200,t+.08),r.frequency.setValueAtTime(1100,t+.1),r.frequency.linearRampToValueAtTime(1050,t+.55),r.frequency.exponentialRampToValueAtTime(560,t+.88);let i=e.createOscillator();i.type=`sawtooth`,i.frequency.setValueAtTime(480,t),i.frequency.exponentialRampToValueAtTime(140,t+.85);let a=e.createGain();a.gain.setValueAtTime(920,t),a.gain.exponentialRampToValueAtTime(60,t+.88),i.connect(a),a.connect(r.frequency);let o=e.createOscillator();o.frequency.value=11;let s=e.createGain();s.gain.setValueAtTime(0,t),s.gain.linearRampToValueAtTime(.35,t+.12),s.gain.setValueAtTime(.35,t+.55),s.gain.linearRampToValueAtTime(0,t+.88),o.connect(s);let c=e.createGain();c.gain.value=1,s.connect(c);let l=e.createOscillator();l.frequency.value=8.5;let u=e.createGain();u.gain.setValueAtTime(0,t),u.gain.linearRampToValueAtTime(38,t+.1),u.gain.setValueAtTime(38,t+.55),u.gain.exponentialRampToValueAtTime(5,t+.88),l.connect(u),u.connect(r.frequency);let d=e.createBiquadFilter();d.type=`bandpass`,d.frequency.setValueAtTime(2400,t),d.frequency.exponentialRampToValueAtTime(820,t+.12),d.frequency.setValueAtTime(820,t+.55),d.frequency.exponentialRampToValueAtTime(680,t+.88),d.Q.value=2.8;let f=e.createGain();f.gain.setValueAtTime(0,t),f.gain.linearRampToValueAtTime(1,t+.008),f.gain.setValueAtTime(.92,t+.04),f.gain.setValueAtTime(.9,t+.55),f.gain.exponentialRampToValueAtTime(.001,t+.9),r.connect(f),f.connect(d);let p=e.createGain();p.gain.value=0,s.connect(p.gain),d.connect(p),p.connect(n),d.connect(n);let m=Math.ceil(e.sampleRate*.9),h=e.createBuffer(1,m,e.sampleRate),g=h.getChannelData(0);for(let e=0;e<m;e++)g[e]=Math.random()*2-1;let _=e.createBufferSource();_.buffer=h;let v=e.createBiquadFilter();v.type=`highpass`,v.frequency.value=3e3,v.Q.value=.4;let y=e.createGain();y.gain.setValueAtTime(.3,t),y.gain.setValueAtTime(.18,t+.1),y.gain.setValueAtTime(.12,t+.55),y.gain.exponentialRampToValueAtTime(.001,t+.88),_.connect(v),v.connect(y),y.connect(n),r.start(t),r.stop(t+.92),l.start(t),l.stop(t+.92),i.start(t),i.stop(t+.92),o.start(t),o.stop(t+.92),_.start(t),setTimeout(()=>{try{e.close()}catch{}},2500)}catch{}}function rt(e,t,n){let r=document.createElement(`div`);r.style.cssText=`position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:9;`,getComputedStyle(e).position===`static`&&(e.style.position=`relative`),e.appendChild(r);let i=!1,a=!1,o=0,s=0;function c(){if(!i)return;let e=Math.min((performance.now()-o)/2200,1);n(e),e>=1&&!a?(a=!0,i=!1,nt(),r.style.transition=`opacity 0.08s ease-in`,r.style.opacity=`1`,setTimeout(()=>{r.style.transition=`opacity 1.4s ease-out`,r.style.opacity=`0`,setTimeout(()=>{a=!1,n(0)},1400)},140)):e<1&&(s=requestAnimationFrame(c))}function l(){a||(i=!0,o=performance.now(),s=requestAnimationFrame(c))}function u(){a||(i=!1,cancelAnimationFrame(s),n(0))}return t.addEventListener(`mousedown`,l),t.addEventListener(`mouseup`,u),t.addEventListener(`mouseleave`,u),t.addEventListener(`touchstart`,e=>{e.preventDefault(),l()},{passive:!1}),t.addEventListener(`touchend`,u),t.addEventListener(`touchcancel`,u),()=>{t.removeEventListener(`mousedown`,l),t.removeEventListener(`mouseup`,u),t.removeEventListener(`mouseleave`,u),r.parentNode&&r.parentNode.removeChild(r)}}var it={robot:`ar-models/robot.glb`,pikachu:`pikachu.glb?v=5`,charmander:`ar-models/charmander.glb`,squirtle:`ar-models/squirtle.glb`,meowth:`ar-models/meowth.glb`,bulbasaur:`ar-models/bulbasaur.glb`,eevee:`ar-models/eevee.glb`,mewtwo:`ar-models/mewtwo.glb`,articuno:`ar-models/articuno.glb`,suicune:`ar-models/suicune.glb`,raikou:`ar-models/raikou.glb`,entei:`ar-models/entei.glb`,moltres:`ar-models/moltres.glb`,zapdos:`ar-models/zapdos.glb`,lugia:`ar-models/lugia.glb`,"ho-oh":`ar-models/ho-oh.glb`};for(let e of V)it[e.id]=`ar-models/${e.id}.glb`;var at=Object.keys(it),ot={robot:656928,pikachu:788996,charmander:1312771,squirtle:266268,meowth:1050132,bulbasaur:332812,eevee:1314054,mewtwo:919064,articuno:267556,suicune:267804,raikou:1314820,entei:1705731,moltres:1837315,zapdos:1446402,lugia:528416,"ho-oh":1576451,alphabrain:1182978};function st(e){return ot[e]??656928}var ct={pikachu:16766515,charmander:16742954,squirtle:3388927,meowth:12741631,bulbasaur:6280781,eevee:14723162,mewtwo:11559167,articuno:6737151,suicune:4183752,raikou:16766515,entei:16734760,moltres:16742936,zapdos:16773197,lugia:9418495,"ho-oh":16756768,alphabrain:14990435};function lt(e){return ct[e]??14329120}var ut={pikachu:25,charmander:4,squirtle:7,meowth:52,bulbasaur:1,eevee:133,mewtwo:150,articuno:144,suicune:245,raikou:243,entei:244,moltres:146,zapdos:145,lugia:249,"ho-oh":250};for(let e of V)ut[e.id]=e.dex;var dt=null,ft=!0;function pt(e){ft=e,e||ht()}function mt(e){if(dt&&=(dt.pause(),dt.src=``,null),!ft)return;let t=ut[e];if(!t)return;let n=new Audio(`https://cdn.jsdelivr.net/gh/PokeAPI/cries@main/cries/pokemon/latest/${t}.ogg`);n.volume=.55,n.play().catch(()=>{}),dt=n}function ht(){dt&&=(dt.pause(),dt.src=``,null)}var gt={pikachu:{color:16772642,count:30,size:.05,speed:.012,upward:!0},charmander:{color:16737826,count:35,size:.05,speed:.014,upward:!0},squirtle:{color:4504575,count:28,size:.06,speed:.008,upward:!1},meowth:{color:13404415,count:22,size:.05,speed:.01,upward:!0},bulbasaur:{color:5627204,count:30,size:.07,speed:.009,upward:!0},eevee:{color:14527061,count:22,size:.05,speed:.01,upward:!0},mewtwo:{color:13395711,count:32,size:.06,speed:.011,upward:!0},articuno:{color:10083839,count:35,size:.05,speed:.007,upward:!1},suicune:{color:3394764,count:30,size:.06,speed:.008,upward:!1},raikou:{color:16772642,count:28,size:.04,speed:.015,upward:!0},entei:{color:16733474,count:38,size:.05,speed:.013,upward:!0},moltres:{color:16746513,count:40,size:.05,speed:.014,upward:!0},zapdos:{color:16776994,count:32,size:.04,speed:.016,upward:!0},lugia:{color:11189247,count:25,size:.06,speed:.008,upward:!1},"ho-oh":{color:16750882,count:38,size:.05,speed:.013,upward:!0}},_t={pikachu:`electric`,charmander:`fire`,squirtle:`water`,meowth:`normal`,bulbasaur:`grass`,eevee:`normal`,mewtwo:`psychic`,articuno:`ice`,suicune:`water`,raikou:`electric`,entei:`fire`,moltres:`fire`,zapdos:`electric`,lugia:`psychic`,"ho-oh":`fire`};for(let e of V)_t[e.id]=e.attack;var vt={electric:[255,238,34],fire:[255,88,20],water:[50,180,255],grass:[70,210,60],psychic:[210,60,255],ice:[160,230,255],normal:[220,190,80]};function yt(e,t,n){let r=gt[t];if(!r)return null;let i=n?Math.ceil(r.count*.55):r.count,a=new Float32Array(i*3),o=new Float32Array(i*3),s=()=>(Math.random()-.5)*2;for(let e=0;e<i;e++){let t=Math.random()*Math.PI*2,n=Math.random()*Math.PI,i=1.7+Math.random()*.5;a[e*3]=i*Math.sin(n)*Math.cos(t),a[e*3+1]=i*Math.sin(n)*Math.sin(t),a[e*3+2]=i*Math.cos(n);let c=r.speed*(.5+Math.random()*.8);o[e*3]=s()*c*.4,o[e*3+1]=r.upward?c*(.4+Math.random()*.6):s()*c,o[e*3+2]=s()*c*.4}let c=new R;c.setAttribute(`position`,new S(a,3));let l=new x(c,new _({color:r.color,size:r.size,transparent:!0,opacity:.75,depthWrite:!1,blending:2,sizeAttenuation:!0}));return e.add(l),{pts:l,pos:a,vel:o,count:i}}function bt(e,t){for(let n=0;n<e.count;n++){e.pos[n*3]+=e.vel[n*3],e.pos[n*3+1]+=e.vel[n*3+1],e.pos[n*3+2]+=e.vel[n*3+2];let r=e.pos[n*3],i=e.pos[n*3+1],a=e.pos[n*3+2];if(Math.sqrt(r*r+i*i+a*a)>3||t.upward&&i>2.8||!t.upward&&i<-2.8){let t=Math.random()*Math.PI*2,r=Math.random()*Math.PI,i=1.6+Math.random()*.3;e.pos[n*3]=i*Math.sin(r)*Math.cos(t),e.pos[n*3+1]=i*Math.sin(r)*Math.sin(t),e.pos[n*3+2]=i*Math.cos(r)}}e.pts.geometry.attributes.position.needsUpdate=!0}function xt(e,t){e&&(t.remove(e.pts),e.pts.geometry.dispose(),e.pts.material.dispose())}function St(e,t){let n=new r(t),i={h:0,s:0,l:0};n.getHSL(i);for(let t of e)t.mat.color.setHSL(i.h,Math.min(1,t.baseS*.4+i.s*.6),t.baseL)}function Ct(e,t){let[n,i,a]=vt[t],o=new r(n/255,i/255,a/255),s=[];if(e.traverse(e=>{if(!e.isMesh)return;let t=Array.isArray(e.material)?e.material:e.material?[e.material]:[];for(let e of t)e&&e.emissive&&(s.push({m:e,oe:e.emissive.clone(),oi:e.emissiveIntensity??1}),e.emissive.copy(o),e.emissiveIntensity=2.2)}),!s.length)return;let c=performance.now();function l(e){let t=Math.min(1,(e-c)/500);for(let e of s)e.m.emissive.copy(o).lerp(e.oe,t),e.m.emissiveIntensity=2.2*(1-t)+e.oi*t;if(t<1)requestAnimationFrame(l);else for(let e of s)e.m.emissive.copy(e.oe),e.m.emissiveIntensity=e.oi}requestAnimationFrame(l)}function wt(e,t){let n=_t[t]||`normal`,[r,i,a]=vt[n],o=e.getContext(`2d`);if(!o)return;let s=o,c=e.width,l=e.height,u=c/2,d=l*.44,f=Math.min(c,l)*.36,p=performance.now();e.__atkRaf&&=(cancelAnimationFrame(e.__atkRaf),0);let m=[],h=n===`normal`?14:24;for(let e=0;e<h;e++){let t=e/h*Math.PI*2+Math.random()*.4,r=f*.006*(.5+Math.random());m.push({x:u+(Math.random()-.5)*f*.2,y:d+(Math.random()-.5)*f*.2,vx:Math.cos(t)*r,vy:Math.sin(t)*r+(n===`fire`?-r*1.2:0),r:3+Math.random()*5,a:t,life:Math.random()*.4})}let g=[];if(n===`electric`)for(let e=0;e<5;e++){let t=e/5*Math.PI*2,n=[];for(let e=0;e<=7;e++){let r=e/7,i=(1-r)*f*.35;n.push([u+Math.cos(t)*f*1.5*(1-r)+(Math.random()-.5)*i,d+Math.sin(t)*f*1.5*(1-r)+(Math.random()-.5)*i])}g.push({pts:n})}let _=[];if(n===`ice`)for(let e=0;e<8;e++)_.push(e/8*Math.PI*2);let v=[];if(n===`grass`)for(let e=0;e<12;e++)v.push(Math.random()*Math.PI*2);function y(t){let o=Math.min(1,(t-p)/1500);s.clearRect(0,0,c,l);let h=o>.7?(1-o)/.3:1;for(let e of m)e.life+=.018,e.life>1&&(--e.life,e.x=u+(Math.random()-.5)*f*.3,e.y=d+(Math.random()-.5)*f*.3),o>.05&&(e.x+=e.vx,e.y+=e.vy),n===`water`&&(e.vy+=.15),n===`fire`&&(e.vy+=.04);if(n===`electric`){let e=s.createRadialGradient(u,d,0,u,d,f*.6);if(e.addColorStop(0,`rgba(${r},${i},${a},${.4*h})`),e.addColorStop(1,`rgba(255,238,34,0)`),s.fillStyle=e,s.beginPath(),s.arc(u,d,f*.6,0,Math.PI*2),s.fill(),o<.6){let e=o<.1?o/.1:o>.4?(.6-o)/.2:1;for(let t of g){s.shadowColor=`rgb(${r},${i},${a})`,s.shadowBlur=12,s.strokeStyle=`rgba(255,255,255,${e*h})`,s.lineWidth=2.5,s.beginPath(),s.moveTo(t.pts[0][0],t.pts[0][1]);for(let e=1;e<t.pts.length;e++)s.lineTo(t.pts[e][0],t.pts[e][1]);s.stroke(),s.strokeStyle=`rgba(${r},${i},${a},${.5*e*h})`,s.lineWidth=6,s.beginPath(),s.moveTo(t.pts[0][0],t.pts[0][1]);for(let e=1;e<t.pts.length;e++)s.lineTo(t.pts[e][0],t.pts[e][1]);s.stroke(),s.shadowBlur=0}}for(let e of m)s.fillStyle=`rgba(${r},${i},${a},${Math.max(0,1-e.life)*h})`,s.beginPath(),s.arc(e.x,e.y,e.r*(1-e.life*.6),0,Math.PI*2),s.fill()}else if(n===`fire`){let e=f*o*1.3,t=s.createRadialGradient(u,d,0,u,d,e);t.addColorStop(0,`rgba(255,240,200,${.9*h})`),t.addColorStop(.35,`rgba(${r},${i},${a},${.7*h})`),t.addColorStop(.7,`rgba(200,40,0,${.3*h})`),t.addColorStop(1,`rgba(200,40,0,0)`),s.fillStyle=t,s.beginPath(),s.arc(u,d,e,0,Math.PI*2),s.fill();for(let e of m){let t=Math.max(0,1-e.life*1.2)*h;if(t<=0)continue;let n=e.life;s.fillStyle=`rgba(${Math.round(255-n*120)},${Math.round(i*(1-n*.7))},${Math.round(n<.3?40:0)},${t})`,s.beginPath(),s.arc(e.x,e.y,e.r*(1-n*.5),0,Math.PI*2),s.fill()}}else if(n===`water`){for(let e=0;e<3;e++){let t=Math.max(0,o-e*.2);if(t<=0)continue;let n=f*t*1.6;s.strokeStyle=`rgba(${r},${i},${a},${(t<.3?t/.3:(1-t)*h)*.8})`,s.lineWidth=3-e,s.shadowColor=`rgba(${r},${i},${a},0.6)`,s.shadowBlur=8,s.beginPath(),s.arc(u,d,n,0,Math.PI*2),s.stroke(),s.shadowBlur=0}for(let e of m)s.fillStyle=`rgba(${r},${i},${a},${Math.max(0,1-e.life)*h*.7})`,s.beginPath(),s.arc(e.x,e.y,e.r*.7,0,Math.PI*2),s.fill()}else if(n===`grass`){let e=s.createRadialGradient(u,d,0,u,d,f*.5);e.addColorStop(0,`rgba(${r},${i},${a},${.3*h})`),e.addColorStop(1,`rgba(70,210,60,0)`),s.fillStyle=e,s.beginPath(),s.arc(u,d,f*.5,0,Math.PI*2),s.fill(),v.forEach((e,t)=>{let n=t/v.length*Math.PI*2,c=f*.2+f*o*1.1,l=u+Math.cos(n)*c,p=d+Math.sin(n)*c,m=o<.7?Math.min(1,o/.2)*h:(1-o)/.3*h;s.save(),s.translate(l,p),s.rotate(e+o*Math.PI*1.5),s.fillStyle=`rgba(${r},${i},${a},${m*.85})`,s.beginPath(),s.moveTo(0,-(12+f*.025)),s.bezierCurveTo(8,-4,8,4,0,12+f*.025),s.bezierCurveTo(-8,4,-8,-4,0,-(12+f*.025)),s.fill(),s.restore()})}else if(n===`psychic`){for(let e=0;e<2;e++){let t=Math.max(0,o-e*.15),n=f*.3+f*t*1.2,c=(t<.3?t/.3:1-t)*h;s.save(),s.translate(u,d),s.rotate(t*Math.PI*(e===0?2:-1.5)),s.strokeStyle=`rgba(${r},${i},${a},${c*.9})`,s.lineWidth=2.5,s.setLineDash([8,6]),s.shadowColor=`rgba(${r},${i},${a},0.8)`,s.shadowBlur=14,s.beginPath(),s.arc(0,0,n,0,Math.PI*2),s.stroke(),s.shadowBlur=0,s.setLineDash([]),s.restore()}for(let e of m){let t=f*.7*(1-e.life*.4),n=u+Math.cos(e.a+o*Math.PI*3)*t,c=d+Math.sin(e.a+o*Math.PI*3)*t;s.fillStyle=`rgba(${r},${i},${a},${Math.max(0,1-e.life*1.5)*h*.8})`,s.beginPath(),s.arc(n,c,e.r*.6,0,Math.PI*2),s.fill()}let e=s.createRadialGradient(u,d,0,u,d,f*.45);e.addColorStop(0,`rgba(255,200,255,${.35*h})`),e.addColorStop(1,`rgba(210,60,255,0)`),s.fillStyle=e,s.beginPath(),s.arc(u,d,f*.45,0,Math.PI*2),s.fill()}else if(n===`ice`){let e=(o<.4?o/.4:(1-o)/.6)*h;for(let t=0;t<6;t++){let n=t/6*Math.PI*2+o*.5;s.strokeStyle=`rgba(${r},${i},${a},${e*.9})`,s.lineWidth=2,s.shadowColor=`rgba(${r},${i},${a},0.7)`,s.shadowBlur=8,s.beginPath(),s.moveTo(u,d),s.lineTo(u+Math.cos(n)*f*.4,d+Math.sin(n)*f*.4),s.stroke(),s.shadowBlur=0}for(let e=0;e<8;e++){let t=_[e]+o*.3,n=f*.3+f*o*1.3,c=u+Math.cos(t)*n,l=d+Math.sin(t)*n,p=(o<.6?1:(1-o)/.4)*h;s.save(),s.translate(c,l),s.rotate(t+Math.PI/2),s.fillStyle=`rgba(${r},${i},${a},${p*.85})`,s.beginPath(),s.moveTo(0,-(f*.08)),s.lineTo(f*.03,0),s.lineTo(0,f*.08),s.lineTo(-f*.03,0),s.closePath(),s.fill(),s.restore()}for(let e of m)s.fillStyle=`rgba(${r},${i},${a},${Math.max(0,1-e.life)*h*.6})`,s.beginPath(),s.arc(e.x,e.y,e.r*.5,0,Math.PI*2),s.fill()}else{for(let e=0;e<8;e++){let t=e/8*Math.PI*2,n=f*Math.min(1,o*3)*1.2;s.strokeStyle=`rgba(${r},${i},${a},${(o<.3?o/.3:(1-o)/.7)*h*.8})`,s.lineWidth=2.5,s.beginPath(),s.moveTo(u+Math.cos(t)*f*.2,d+Math.sin(t)*f*.2),s.lineTo(u+Math.cos(t)*n,d+Math.sin(t)*n),s.stroke()}for(let e of m){let t=Math.max(0,1-e.life*1.4)*h;s.fillStyle=`rgba(${r},${i},${a},${t*.7})`,s.beginPath(),s.arc(e.x,e.y,e.r*(1-e.life*.5),0,Math.PI*2),s.fill(),s.save(),s.translate(e.x,e.y),s.rotate(e.a+o*3),s.fillStyle=`rgba(255,255,200,${t*.6})`;for(let n=0;n<4;n++){let r=n/4*Math.PI*2;s.beginPath(),s.moveTo(0,0),s.lineTo(Math.cos(r)*e.r*1.5,Math.sin(r)*e.r*1.5),s.lineWidth=1.5,s.strokeStyle=`rgba(255,255,200,${t*.5})`,s.stroke()}s.restore()}}o<1?e.__atkRaf=requestAnimationFrame(y):(s.clearRect(0,0,c,l),e.__atkRaf=0)}e.__atkRaf=requestAnimationFrame(y)}function Tt(e){let t=new r(16720920),n=[];if(e.traverse(e=>{if(!e.isMesh)return;let r=Array.isArray(e.material)?e.material:e.material?[e.material]:[];for(let e of r)e&&e.emissive&&(n.push({m:e,oe:e.emissive.clone(),oi:e.emissiveIntensity??1}),e.emissive.copy(t),e.emissiveIntensity=1.6)}),!n.length)return;let i=performance.now();function a(e){let r=Math.min(1,(e-i)/550);for(let e of n)e.m.emissive.copy(t).lerp(e.oe,r),e.m.emissiveIntensity=1.6*(1-r)+e.oi*r;if(r<1)requestAnimationFrame(a);else for(let e of n)e.m.emissive.copy(e.oe),e.m.emissiveIntensity=e.oi}requestAnimationFrame(a)}function Et(e,t){let n=[],r=Array.isArray(t)?t:[t],i=e=>{for(;e;){if(r.indexOf(e)>=0)return!0;e=e.parent}return!1};return e.traverse(e=>{if(i(e))return;let t=Array.isArray(e.material)?e.material:e.material?[e.material]:[];for(let e of t)if(e&&e.color&&(e.isLineBasicMaterial||e.isMeshBasicMaterial)){let t={h:0,s:0,l:0};e.color.getHSL(t),n.push({mat:e,baseL:t.l,baseS:t.s})}}),n}var Dt=`char_xform_v1`;function Ot(e){let t={robot:{x:0,y:0,z:0},pikachu:{x:0,y:Math.PI,z:0},charizard:{x:0,y:0,z:0},charmander:{x:0,y:Math.PI,z:0},squirtle:{x:-Math.PI/2,y:0,z:Math.PI},meowth:{x:0,y:Math.PI,z:0},bulbasaur:{x:0,y:Math.PI,z:0},eevee:{x:0,y:Math.PI,z:0},mewtwo:{x:0,y:Math.PI,z:0},articuno:{x:0,y:Math.PI,z:0},suicune:{x:-Math.PI/2,y:0,z:Math.PI},raikou:{x:0,y:Math.PI,z:0},entei:{x:0,y:Math.PI,z:0},moltres:{x:0,y:Math.PI,z:0},zapdos:{x:0,y:Math.PI,z:0},lugia:{x:0,y:Math.PI,z:0},"ho-oh":{x:0,y:Math.PI,z:0},alphabrain:{x:0,y:0,z:0}}[e]??{x:0,y:Math.PI,z:0};return{x:t.x,y:t.y,z:t.z,s:1,px:0,py:0,pz:0}}function kt(e){return U(Dt,{})[e]??Ot(e)}function At(e,t,n,r,i,o,s,c,l){e.rotation.set(n,r,i),e.scale.setScalar(t*o),e.position.set(0,0,0),e.updateMatrixWorld(!0);let u=new k().setFromObject(e).getCenter(new a);e.position.set(-u.x+s,-u.y+c,-u.z+l)}function jt(e,t){let n=U(Dt,{});n[e]=t,H(Dt,n)}function Mt(e){let t=U(Dt,{});e in t&&(delete t[e],H(Dt,t))}var Nt=`char_xform_pin_v1`;function Pt(e){return U(Nt,{})[e]??null}function Ft(e,t){let n=U(Nt,{});n[e]=t,H(Nt,n)}function It(e){return!!U(Nt,{})[e]}var Lt=new WeakMap,Rt=new WeakMap;function zt(e){switch(e){case`electric`:return[new r(16773222),new r(16777215)];case`fire`:return[new r(16738840),new r(16765503)];case`water`:return[new r(3516415),new r(10938879)];case`grass`:return[new r(5230698),new r(13303695)];case`ice`:return[new r(9431551),new r(16777215)];case`psychic`:return[new r(12734463),new r(16750054)];default:return[new r(14990435),new r(16773824)]}}var Bt=null;function Vt(){if(Bt)return Bt;let e=document.createElement(`canvas`);e.width=e.height=64;let t=e.getContext(`2d`),n=t.createRadialGradient(32,32,0,32,32,32);return n.addColorStop(0,`rgba(255,255,255,1)`),n.addColorStop(.35,`rgba(255,255,255,.55)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,64,64),Bt=new pe(e),Bt}var Ht=new Set([`articuno`,`moltres`,`zapdos`,`entei`,`raikou`,`suicune`,`lugia`,`ho-oh`,`mewtwo`]);function Ut(e,n){let r=e.__aura;if(r){try{e.remove(r.points),r.points.geometry.dispose(),r.points.material.dispose(),r.ring&&(e.remove(r.ring),r.ring.geometry.dispose(),r.ring.material.dispose())}catch{}e.__aura=null}if(n===`robot`||n===`none`||n===`alphabrain`)return;let i=_t[n]||`normal`,a=Ht.has(n),o=typeof document<`u`&&document.documentElement.classList.contains(`perf-lite`),s=typeof window<`u`&&(matchMedia(`(max-width: 900px)`).matches||`ontouchstart`in window),c=Math.round((o?30:s?42:70)*(a?o||s?1.3:1.55:1)),l=1.45,u=2.6,d=-1.25,f=new Float32Array(c*3),p=new Float32Array(c*3),m=[],[h,g]=zt(i);for(let e=0;e<c;e++){let t=Math.random()*Math.PI*2,n=l*(.35+Math.random()*.65),r=d+Math.random()*u;m.push({ang:t,rad:n,y:r,sp:.3+Math.random()*.9,ph:Math.random()*Math.PI*2}),f[e*3]=Math.cos(t)*n,f[e*3+1]=r,f[e*3+2]=Math.sin(t)*n;let i=Math.random()<.5?h:g;p[e*3]=i.r,p[e*3+1]=i.g,p[e*3+2]=i.b}let v=new R;v.setAttribute(`position`,new S(f,3)),v.setAttribute(`color`,new S(p,3));let y=new _({size:i===`electric`?.085:.12,map:Vt(),vertexColors:!0,transparent:!0,depthWrite:!1,blending:2,opacity:.85,sizeAttenuation:!0,toneMapped:!1}),b=new x(v,y);b.frustumCulled=!1,e.add(b);let C;a&&(C=new A(new ae(1.05,1.32,64),new t({color:h.clone().lerp(g,.4),transparent:!0,opacity:.5,side:2,depthWrite:!1,blending:2,toneMapped:!1})),C.rotation.x=-Math.PI/2,C.position.y=-1.23,C.frustumCulled=!1,e.add(C));let w=0,ee=0;e.__aura={points:b,ring:C,update:(e,t)=>{if(C&&(C.rotation.z+=e*.5,C.material.opacity=.4+Math.sin(t*1.4)*.18),s){if(w+=e,!(ee++&1))return;e=w,w=0}let n=v.attributes.position;for(let r=0;r<c;r++){let a=m[r],o=0,s=0,c=0;switch(i){case`fire`:a.y+=a.sp*e*.95,a.y>1.35&&(a.y=d,a.ang=Math.random()*Math.PI*2,a.rad=l*(.2+Math.random()*.5));{let e=1-(a.y-d)/u*.65;o=Math.cos(a.ang)*a.rad*e+Math.sin(t*3+a.ph)*.05,s=a.y,c=Math.sin(a.ang)*a.rad*e}break;case`water`:a.y+=a.sp*e*.5,a.y>1.35&&(a.y=d),o=Math.cos(a.ang)*a.rad+Math.sin(t*2+a.ph)*.08,s=a.y,c=Math.sin(a.ang)*a.rad+Math.cos(t*2+a.ph)*.08;break;case`grass`:a.y-=a.sp*e*.4,a.y<d&&(a.y=1.35),a.ang+=e*.5*Math.sin(t+a.ph),o=Math.cos(a.ang)*a.rad,s=a.y,c=Math.sin(a.ang)*a.rad;break;case`ice`:a.y-=a.sp*e*.28,a.y<d&&(a.y=1.35),o=Math.cos(a.ang)*a.rad,s=a.y+Math.sin(t*1.5+a.ph)*.03,c=Math.sin(a.ang)*a.rad;break;case`electric`:o=Math.cos(a.ang)*a.rad+(Math.random()-.5)*.18,s=a.y+(Math.random()-.5)*.18,c=Math.sin(a.ang)*a.rad+(Math.random()-.5)*.18;break;case`psychic`:{a.ang+=e*1.1;let n=a.rad+Math.sin(t*1.5+a.ph)*.15;o=Math.cos(a.ang)*n,s=a.y+Math.sin(t*1.2+a.ph)*.2,c=Math.sin(a.ang)*n}break;default:o=Math.cos(a.ang)*a.rad,s=a.y+Math.sin(t*1.1+a.ph)*.18,c=Math.sin(a.ang)*a.rad}n.setXYZ(r,o,s,c)}n.needsUpdate=!0,i===`electric`&&(y.opacity=.55+Math.random()*.45)}}}function Wt(e,n,r){let i=new F;i.position.copy(n),e.add(i);let o=new ae(.1,.17,48),s=new t({color:r,transparent:!0,opacity:.9,side:2,depthWrite:!1,blending:2,toneMapped:!1}),c=new A(o,s);i.add(c);let l=new Float32Array(90),u=[];for(let e=0;e<30;e++){let e=Math.random()*Math.PI*2,t=(Math.random()-.5)*Math.PI,n=1.4+Math.random()*1.8;u.push(new a(Math.cos(e)*Math.cos(t),Math.sin(t),Math.sin(e)*Math.cos(t)).multiplyScalar(n))}let d=new R;d.setAttribute(`position`,new S(l,3));let f=new _({color:r,size:.13,map:Vt(),transparent:!0,depthWrite:!1,blending:2,toneMapped:!1}),p=new x(d,f);p.frustumCulled=!1,i.add(p);let m=performance.now(),h=t=>{let n=Math.min(1,(t-m)/640);c.scale.setScalar(1+n*8),s.opacity=.9*(1-n);let r=d.attributes.position;for(let e=0;e<30;e++)r.setXYZ(e,u[e].x*n,u[e].y*n,u[e].z*n);r.needsUpdate=!0,f.opacity=1-n,n<1?requestAnimationFrame(h):(e.remove(i),o.dispose(),s.dispose(),d.dispose(),f.dispose())};requestAnimationFrame(h)}function Gt(e,n,i,o=`pikachu`,s){let c=it[o]||it.pikachu;me(async()=>{let{GLTFLoader:e}=await import(`./GLTFLoader-D1yQsmO2.js`).then(e=>e.n);return{GLTFLoader:e}},__vite__mapDeps([0,1,2])).then(({GLTFLoader:n})=>{new n().load(i+c,n=>{e.traverse(e=>{if(e instanceof A){let n=Array.isArray(e.material)?e.material[0]:e.material;n instanceof d&&(e.visible=!1),n instanceof t&&n.map&&(e.visible=!1)}});let c=Rt.get(e);c&&e.remove(c);let l=n.scene,u=ut[o]??(o.indexOf(`pikachu`)===0?25:0),f=q[u],m=[];if(l.traverse(e=>{if(e instanceof A){e.geometry.computeVertexNormals();let t=Array.isArray(e.material)?e.material:[e.material],n=[];for(let e of t){if(!e)continue;e.side=2;let t=e;if(t.map)t.map.colorSpace=L,o===`charizard`&&(t.emissiveMap=t.map,t.emissive.setRGB(1,1,1),t.emissiveIntensity=.55,t.roughness=1,t.metalness=0,t.needsUpdate=!0);else if(o===`robot`){let n=(e.name||``).toLowerCase();n.indexOf(`001`)>=0||n.indexOf(`002`)>=0?(t.color.setRGB(.1,.11,.14),t.metalness=.5,t.roughness=.5):(t.color.setRGB(.94,.95,.97),t.metalness=.18,t.roughness=.42),t.emissive&&t.emissive.setRGB(0,0,0),t.envMapIntensity=1,t.needsUpdate=!0}else t.color&&(f!==void 0&&t.color.setHex(f),t.color.multiplyScalar(.7),t.roughness=1,t.metalness=0,t.emissive&&t.emissive.setRGB(0,0,0),t.envMapIntensity=.3,n.push(t))}n.length&&m.push({mesh:e,mats:n}),e.castShadow=!0}}),o===`robot`){l.updateMatrixWorld(!0);let e=[];l.traverse(t=>{if(t instanceof A){let n=new k().setFromObject(t).getSize(new a),r=[n.x,n.y,n.z].sort((e,t)=>e-t);r[2]>1e-4&&r[0]<r[2]*.06&&e.push(t)}}),e.forEach(e=>e.parent&&e.parent.remove(e))}let h=kt(o);l.rotation.set(h.x,h.y,h.z),l.scale.setScalar(1),l.position.set(0,0,0),l.updateMatrixWorld(!0);let g=new k().setFromObject(l),_=g.getSize(new a),v=g.getCenter(new a);if(m.length&&u>=1&&u<=151){let e=g.min.x,t=g.min.y,n=Math.max(1e-4,_.x),r=Math.max(1e-4,_.y),o=new a;for(let{mesh:i}of m){let a=i.geometry,s=a.attributes.position,c=new Float32Array(s.count*2);for(let a=0;a<s.count;a++)o.fromBufferAttribute(s,a).applyMatrix4(i.matrixWorld),c[a*2]=(o.x-e)/n,c[a*2+1]=(o.y-t)/r;a.setAttribute(`uv`,new S(c,2))}let s=new de().load(`${i}pokemon-sprites/${u}.png`);s.colorSpace=L,s.magFilter=C,s.minFilter=B,s.anisotropy=4;for(let{mats:e}of m)for(let t of e)t.map=s,t.color.setRGB(1,1,1),t.emissiveMap=s,t.emissive.setRGB(1,1,1),t.emissiveIntensity=.6,t.needsUpdate=!0}let y=2.5/Math.max(_.y,_.x*.8,_.z*.8);if(Lt.set(l,{s:y,cx:-v.x*y,cy:-v.y*y,cz:-v.z*y}),l.scale.setScalar(y*h.s),l.position.set(-v.x*y+h.px,-v.y*y+h.py,-v.z*y+h.pz),o===`robot`){l.updateMatrixWorld(!0);let e=new k().setFromObject(l),t=e.getSize(new a),n=Math.max(.035,t.y*.045),i=new p({color:0,emissive:new r(1616127),emissiveIntensity:3.2,toneMapped:!1,roughness:.2,metalness:0}),o=(e.min.x+e.max.x)/2,s=e.max.y-t.y*.17,c=e.max.z;for(let e of[-1,1]){let r=new A(new z(n,18,18),i),u=new a(o+e*t.x*.12,s,c);l.worldToLocal(u),r.position.copy(u),l.add(r)}}let b=e.__mixer;if(b){try{b.stopAllAction(),b.uncacheRoot(b.getRoot())}catch{}e.__mixer=null}if(n.animations&&n.animations.length){let t=new I(l);n.animations.forEach(e=>{t.clipAction(e).play()}),e.__mixer=t}e.add(l),Rt.set(e,l),Ut(e,o),s?.(l)},void 0,e=>console.warn(`[OrbScene] ${c} load failed:`,e))})}function Kt(e,t,n,i){let o=null,s=null,c=0,l=0;function u(){return o?Promise.resolve(o):s||(s=me(async()=>{let{GLTFLoader:e}=await import(`./GLTFLoader-D1yQsmO2.js`).then(e=>e.n);return{GLTFLoader:e}},__vite__mapDeps([0,1,2])).then(({GLTFLoader:t})=>new Promise(i=>{new t().load(n+`ar-models/pokeball.glb`,t=>{let n=t.scene;n.traverse(e=>{if(!e.isMesh)return;e.geometry.computeVertexNormals();let t=e=>{e.roughness=.18,e.metalness=.85,e.envMapIntensity=1.4,e.side=0};Array.isArray(e.material)?e.material.forEach(t):e.material&&t(e.material)});let s=new k().setFromObject(n),c=s.getSize(new a),l=s.getCenter(new a),u=1.5/Math.max(c.x,c.y,c.z),d=new F;n.scale.setScalar(u),n.position.set(-l.x*u,-l.y*u,-l.z*u);let f=new A(new z(.18,20,20),new p({color:528408,emissive:new r(10479359),emissiveIntensity:2.6,roughness:.15,metalness:0,toneMapped:!1}));f.position.set(0,0,.74);let m=new y(10479359,1.4,2.2,1.4);m.position.copy(f.position),d.add(f),d.add(m),d.__gem=f,d.add(n),d.visible=!1,e.add(d),o=d,i(d)},void 0,()=>i(null))})).catch(()=>null),s)}function d(e,t){let n=i,r=new a(e*2-1,-(t*2-1),.5).unproject(n).sub(n.position).normalize(),o=(2.3-n.position.z)/r.z;return n.position.clone().add(r.multiplyScalar(o))}function f(e,t){i&&u().then(n=>{n&&(cancelAnimationFrame(l),n.visible=!0,n.scale.setScalar(.95),n.position.copy(d(e,t)),n.rotation.y+=.06,n.rotation.x=.2)})}function m(){o&&(o.visible=!1)}function h(t,n=30){u().then(r=>{if(!r||!i){t&&t();return}r.visible=!0;let o=r.position.clone(),s=new a(0,0,0),c=Math.max(0,Math.min(1,(n-20)/80)),u=520-c*260,d=.35+c*.9,f=.3+c*.7,p=performance.now();cancelAnimationFrame(l);let m=n=>{let i=Math.min(1,(n-p)/u),c=i*i*(3-2*i);if(r.position.lerpVectors(o,s,c),r.position.y+=Math.sin(i*Math.PI)*d,r.scale.setScalar(.95*(1-c)+.2*c),r.rotation.y+=.45*f,r.rotation.x+=.22*f,i<1)l=requestAnimationFrame(m);else{r.visible=!1;try{Wt(e,new a(0,0,0),10479359)}catch{}try{t&&t()}catch{}}};l=requestAnimationFrame(m)})}return Object.assign(function(n,r){let i=!1,s=!1,l=()=>{if(!i){i=!0,t.visible=!0;try{Wt(e,o?o.position.clone():new a(0,0,0),10479359)}catch{}try{n&&n()}catch{}}},d=()=>{if(!s){s=!0,o&&(o.visible=!1);try{r&&r()}catch{}}},f=setTimeout(l,1500),p=setTimeout(()=>{l(),d()},2700);t.visible=!1,u().then(e=>{if(!e){clearTimeout(f),clearTimeout(p),l(),d();return}e.visible=!0,e.position.set(0,0,0),e.scale.setScalar(.01),e.rotation.set(0,0,0);let t=performance.now();cancelAnimationFrame(c);let n=r=>{let a=(r-t)/1e3;if(a<.5){let t=1-(1-a/.5)**3;e.position.y=-2.4+2.4*t,e.scale.setScalar(.3+.9*t),e.rotation.y=a*16,e.rotation.x=.25}else if(a<1.05)e.position.y=0,e.scale.setScalar(1.2),e.rotation.z=Math.sin((a-.5)*22)*.42*Math.max(0,1-(a-.5)/.55),e.rotation.y+=.05;else if(a<1.5){i||(clearTimeout(f),l());let t=(a-1.05)/.45;e.scale.setScalar(1.2*(1-t)),e.rotation.y+=.3,e.position.y=t*.4}else{clearTimeout(p),d();return}c=requestAnimationFrame(n)};c=requestAnimationFrame(n)})},{hold:f,throwIt:h,release:m})}function qt(e){let n=new ce({antialias:!0,alpha:!0,powerPreference:`high-performance`,failIfMajorPerformanceCaveat:!1}),r=!1,a=0,o=Math.min(window.innerWidth,window.innerHeight)>=700,s=()=>{let e=Math.min(window.devicePixelRatio||1,r?1:o?1.25:2);return a>=2?Math.min(e,1):e};n.setPixelRatio(s()),n.setClearColor(st(`alphabrain`),0),n.toneMapping=4,n.toneMappingExposure=.65,e.dataset.orbMode=`mobile`,e.appendChild(n.domElement);let c=new ne,u=new ue(50,1,.1,100);u.position.set(0,0,6),u.lookAt(0,0,0);let f=u.quaternion.clone(),p=null,m=null,g=null,_=null,y=null,C=!1;try{let t=Math.min(window.devicePixelRatio||1,2);p=new _e(n,new l(Math.max(1,Math.floor((e.clientWidth||window.innerWidth)*t)),Math.max(1,Math.floor((e.clientHeight||window.innerHeight)*t)),{samples:2})),p.addPass(new ye(c,u)),m=new ve(new h(window.innerWidth*t,window.innerHeight*t),.05,.5,.86),p.addPass(m);let r=new ge(Ee);r.uniforms.darkness.value=.7,p.addPass(r),_=new ge(De),p.addPass(_),y=new ge(Oe),p.addPass(y),g=new ge(Te),p.addPass(g),p.addPass(new be),p.render(),C=!0}catch{p=null,m=null,_=null,g=null,C=!1}let w=ke(1200,1.55,.4);c.add(w.points);function ee(){let t=e.clientWidth||window.innerWidth,r=e.clientHeight||window.innerHeight,i=s();n.setPixelRatio(i),n.setSize(t,r,!0),p&&p.setSize(t*i,r*i),g&&g.uniforms.resolution.value.set(1/(t*i),1/(r*i)),u.aspect=t/r,u.updateProjectionMatrix()}ee(),window.addEventListener(`resize`,ee);let E=new F;c.add(E);let D=new v(16775392,2.2);D.position.set(2,3,5),c.add(D);let re=new v(16771168,.9);re.position.set(-3,2,4),c.add(re);let O=new v(16775912,.7);O.position.set(0,1,6),c.add(O);let k=new v(16769200,.5);k.position.set(0,2,-4),c.add(k);let ae=new T(1708552,.6);c.add(ae);let oe=He(n);oe&&(c.environment=oe);let M=Ue(oe),N=We(M,1),P=N.group;P.scale.setScalar(.95),E.add(P),P.traverse(e=>{if(e instanceof A){let n=Array.isArray(e.material)?e.material[0]:e.material;n instanceof d&&(e.visible=!1),n instanceof t&&n.map&&(e.visible=!1)}});let I=Ze(48);E.add(I.group),P.visible=!1;let L=`alphabrain`,z=null,B=null,de=Me();E.add(de.group);let pe=0,me=!1,V=e=>{let t=n.domElement.getBoundingClientRect(),r=(e.clientX-t.left)/t.width*2-1,i=-((e.clientY-t.top)/t.height)*2+1;de.handleTap(r,i,u)},H=Ge(),U=qe(u,I.group),W=Ke([D,re,O,k,ae]),G=!1,K=null,Se=!1,Ce=Je(U,()=>{G=!0}),q=Kt(E,P,`/Alpha-new/`,u),X=new i(1.85,.035,28,220),Ae=new t({color:14329120,transparent:!0,opacity:0,depthWrite:!1}),je=new A(X,Ae);je.visible=!1,E.add(je);let Ne=new i(1.85,.1,24,200),Pe=new t({color:14329120,transparent:!0,opacity:0,depthWrite:!1,blending:2}),Re=new A(Ne,Pe);Re.visible=!1,E.add(Re);let Be=new i(1.35,.012,16,160),Ve=new t({color:16115400,transparent:!0,opacity:0,depthWrite:!1}),Xe=new A(Be,Ve);Xe.visible=!1,E.add(Xe);let et=new i(1.6,.01,12,140),tt=new t({color:13145450,transparent:!0,opacity:0,depthWrite:!1}),nt=new A(et,tt);nt.visible=!1,E.add(nt);let it=new i(1.1,.008,10,120),at=new t({color:16766720,transparent:!0,opacity:0,depthWrite:!1}),ot=new A(it,at);ot.visible=!1,E.add(ot);let ct=[],ut=new b(1,1);for(let e=0;e<3;e++){let t=new j({uniforms:{uOpacity:{value:0}},vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,fragmentShader:Le,transparent:!0,depthWrite:!1,side:2}),n=new A(ut,t);n.rotation.x=-J*.5,n.position.y=0,E.add(n),ct.push({mesh:n,mat:t,phase:e/3})}let dt=new ie(1.6,3),ft=new j({uniforms:{uTime:{value:0},uEnergy:{value:0}},vertexShader:Qe,fragmentShader:$e,transparent:!0,depthWrite:!1,side:1}),pt=new A(dt,ft);E.add(pt);let vt=new fe({map:ze(),color:5915160,transparent:!0,opacity:.015,depthWrite:!1,blending:2}),Dt=new te(vt);Dt.scale.setScalar(4),E.add(Dt);let Nt=new fe({map:ze(),color:2759690,transparent:!0,opacity:.008,depthWrite:!1,blending:2}),Rt=new te(Nt);Rt.scale.setScalar(6),E.add(Rt);let zt=[],Bt=[],Vt=[],Ht=[],Wt=[14329120,16115400,14329120,13145450,15782032,14329120,16115400,13936717,13145450,15782032];for(let e=0;e<10;e++){let n=e/10*Y,r=2+e%3*.3,i=new A(new ie(.04,1),new t({color:Wt[e],transparent:!0,opacity:.8,depthWrite:!1})),a=(Math.random()-.5)*.8;i.position.set(Math.cos(n)*r,a,Math.sin(n)*r),i.visible=!1,E.add(i),Bt.push(i),zt.push({angle:n,r,speed:.02+Math.random()*.04,y:a});let o=new te(new fe({map:ze(),color:Wt[e],transparent:!0,opacity:.25,depthWrite:!1,blending:2}));o.scale.setScalar(.25),o.visible=!1,E.add(o),Vt.push(o);let s=new R;s.setAttribute(`position`,new S(new Float32Array(6),3));let c=new le(s,new se({color:Wt[e],transparent:!0,opacity:.1,depthWrite:!1}));c.visible=!1,E.add(c),Ht.push({geo:s})}let qt=new Float32Array(180),Jt=new Float32Array(60),Yt=new Float32Array(60),Xt=new Float32Array(180),Zt=[];for(let e=0;e<60;e++){let t=Math.random()*Y,n=1.3+Math.random()*2.2,r=(Math.random()-.5)*.6;qt[e*3]=Math.cos(t)*n,qt[e*3+1]=(Math.random()-.5)*2.5,qt[e*3+2]=Math.sin(t)*n,Jt[e]=Math.random(),Yt[e]=.8+Math.random()*2;let i=Math.random();i>.8?(Xt[e*3]=1,Xt[e*3+1]=.85,Xt[e*3+2]=.5):i>.6?(Xt[e*3]=.95,Xt[e*3+1]=.9,Xt[e*3+2]=.82):(Xt[e*3]=.85,Xt[e*3+1]=.68,Xt[e*3+2]=.3),Zt.push({a:t,r:n,spd:.05+Math.random()*.12,y0:qt[e*3+1],tilt:r})}let Qt=new R;Qt.setAttribute(`position`,new S(qt,3)),Qt.setAttribute(`aPhase`,new S(Jt,1)),Qt.setAttribute(`aSize`,new S(Yt,1)),Qt.setAttribute(`aColor`,new S(Xt,3));let $t=new j({uniforms:{uTime:{value:0}},vertexShader:Fe,fragmentShader:Ie,transparent:!0,depthWrite:!1}),en=new x(Qt,$t);E.add(en);let tn=(()=>{try{return localStorage.getItem(`alpha:orb_minimal`)!==`0`}catch{return!0}})();if(tn){let e=new Set([P,I.group,de.group]);E.children.forEach(t=>{e.has(t)||(t.visible=!1)}),I.tendrils.group.visible=!1,w.points.visible=!1}let nn=0,rn=rt(e,n.domElement,e=>{nn=e}),an=0,on=0,sn=!1,cn=0,ln=n.domElement;function un(e){sn=!0,cn=e,on=0}function dn(e){if(!sn)return;let t=e-cn;cn=e,on=t*.012,an+=on}function fn(){sn=!1}ln.addEventListener(`mousedown`,e=>un(e.clientX)),ln.addEventListener(`mousemove`,e=>dn(e.clientX)),ln.addEventListener(`mouseup`,fn),ln.addEventListener(`mouseleave`,fn),ln.addEventListener(`touchstart`,e=>{e.touches[0]&&un(e.touches[0].clientX)},{passive:!0}),ln.addEventListener(`touchmove`,e=>{e.touches[0]&&dn(e.touches[0].clientX)},{passive:!0}),ln.addEventListener(`touchend`,fn);let Z=0,pn=0,mn=.06,hn=.06,gn=null,_n=0,vn=3+Math.random()*5,yn=0,bn=0,xn=0,Sn=0,Cn=0,wn=0;function Tn(e){if(pn=requestAnimationFrame(Tn),document.hidden||document.body.classList.contains(`bg-paused`)||document.documentElement.classList.contains(`booting`))return;let t=bn?(e-bn)/1e3:.016,i=Math.min(t,.05);bn=e,Z+=i;{let e=P.__mixer;e&&e.update(i)}{let e=P.__aura;e&&e.update(i,Z)}if(!r&&a<2&&(Cn+=t,xn+=t,Sn++,Cn>3&&xn>=1)){let e=Sn/xn;xn=0,Sn=0,e<55?(e<40||++wn>=2)&&(wn=0,a++,ee()):wn=0}mn+=(hn-mn)*.07,sn||(on*=.92,an+=on),m&&(m.strength=.08+nn*2),n.toneMappingExposure=.9+nn*2.5,yn+=i,yn>=vn&&(_n=.4+Math.random()*.6,vn=yn+2+Math.random()*6),_n*=.93,_n<.01&&(_n=0),$t.uniforms.uTime.value=Z;let o=Math.sin(Z*.45)*.04;P.rotation.y=Math.sin(Z*.35)*.35+an,P.rotation.z=o;let s=Z%8,l=s>7.4&&s<7.8,d=l?Math.sin((s-7.4)/.4*J)*.15:0;P.position.y=Math.sin(Z*.7)*.06+d;let h=1+Math.sin(Z*1.2)*.02,g=1+Math.max(0,Math.sin(Z*3))*.008,v=l?1+Math.sin((s-7.4)/.4*J)*.04:1;P.scale.set(.95*h*(1/g)*(1/v),.95*h*g*v,.95*h),I.core.rotation.y+=i*.25,I.core.rotation.x+=i*.08,I.wire.rotation.y-=i*.18,I.wire.rotation.x+=i*.05,I.wire2.rotation.y+=i*.12,I.wire2.rotation.z-=i*.09;let b=gn?Math.max(0,Math.min(1,gn())):0,x=Ye(Math.max(mn,b),Z);if(I.coreMat.uniforms.uTime.value=Z,I.coreMat.uniforms.uAudioAmplitude.value=x,I.tendrils.update(i,x,Z),G&&(G=!1,K=Z,U?.ignite()),K!==null){let e=Z-K,t=U?U.analyser.getAverageFrequency()/255:Math.min(1,e/3);e<3.1?H.addTrauma(t*i*2.4):Se||(Se=!0,H.addTrauma(1),_&&(_.uniforms.uStrength.value=.05)),W.update(e);let n=e<3.1?t*.85:Math.max(0,2*Math.exp(-(e-3.1)*2));I.coreMat.uniforms.uAudioAmplitude.value=Math.max(x,n),e>6.5&&(K=null,W.settle())}_&&x>.6&&(_.uniforms.uStrength.value=Math.max(_.uniforms.uStrength.value,(x-.6)*.03)),_&&(_.uniforms.uStrength.value*=Math.max(0,1-i*3.2)),w.update(i),tn&&(w.points.visible=w.burstLevel()>.03),u.quaternion.copy(f);let S=H.update(i,Z);if(u.rotateX(S.y),u.rotateY(S.x),u.rotateZ(S.roll),N.head){let e=Z%12,t=e>5&&e<7?Math.sin((e-5)/2*J)*.12:0;N.head.rotation.y=Math.sin(Z*.5+.5)*.14,N.head.rotation.z=Math.sin(Z*.3)*.05+t,N.head.rotation.x=Math.sin(Z*.25)*.04+(t>0?-.03:0)}let te=Z%5,T=te>4.2?Math.sin((te-4.2)/.8*J):0,D=T>.25?.5:0,ne=Z*1.2%Y,re=Math.max(0,Math.sin(ne*2))>.85?.25:0,O=Math.max(0,Math.sin(ne*2+1.2))>.9?.18:0,k=.08+re*.3+O*.2+mn*.1+D*.3+nn*1.5;if(N.cheekMatL.emissiveIntensity=k,N.cheekMatR.emissiveIntensity=k,N.tail){let e=Z%6>5?2.5:1;N.tail.rotation.z=Math.sin(Z*1.8*e)*.18+Math.sin(Z*4.2)*.04,N.tail.rotation.y=.15+Math.sin(Z*2.5)*.12+Math.cos(Z*3.8)*.05,N.tail.rotation.x=-.45+Math.sin(Z*1.2)*.05}let ie=Z%10,A=ie>8.5&&ie<10?Math.sin((ie-8.5)/1.5*J)*.65:0;N.leftArm&&(N.leftArm.rotation.z=.55+Math.sin(Z*1.2)*.18-A),N.rightArm&&(N.rightArm.rotation.z=-.55+Math.sin(Z*1.2+1)*.18);let ae=3.5+Math.sin(Z*.1)*.5,oe=Z%ae,se=oe>.35&&oe<.65,ce=oe<.15||se,j=ce?se?(oe-.35)/.3:oe/.15:0,le=ce?Math.max(.01,1-Math.sin(j*J)*.99):Math.max(.01,D>0?.4:l?.35:0);N.leftEyelid&&(N.leftEyelid.scale.y=le),N.rightEyelid&&(N.rightEyelid.scale.y=le);let ue=nn*-.12,M=D>0?-.08:l?-.06:ue,F=Math.sin(Z*2.5)*.05+(Math.sin(Z*7.3)>.95?.12:0)+M,R=Math.sin(Z*2.5+.6)*.05+(Math.sin(Z*8.1+1)>.95?.12:0)+M;N.leftEarGroup&&(N.leftEarGroup.rotation.x=-.12+F),N.rightEarGroup&&(N.rightEarGroup.rotation.x=-.12+R);let z=nn*8;for(let e=0;e<N.sparkMats.length;e++){let t=Math.sin(Z*8+e*2.7)*Math.sin(Z*3.1+e*1.3),n=.12+Math.abs(t)*.3,r=Math.sin(Z*45+e*2.7)*.5+.5;N.sparkMats[e].opacity=Math.min(1,Math.max(n,T*(.55+r*.45))+nn*(.4+r*z*.1))}N.sparks.rotation.y+=i*(.35+T*6+nn*12);let fe=Math.sin(Z*.08)>.7?.01:0,V=Math.sin(Z*.18)*.015+fe,he=Math.sin(Z*.13+.7)*.01;N.leftPupil&&(N.leftPupil.position.x=-.32+V,N.leftPupil.position.y=.055+he),N.rightPupil&&(N.rightPupil.position.x=.32+V,N.rightPupil.position.y=.055+he);let ge=l?.008:.003;if(N.tongue&&(N.tongue.position.y=-.12+Math.sin(Z*2)*ge),N.mouthMesh){let e=l?.03:0;N.mouthMesh.position.y=-.12-e}N.auraMat.opacity=Math.max(.04+Math.sin(Z*4)*.02,Math.max(T*(.15+Math.sin(Z*30)*.05),nn*(.4+Math.sin(Z*40)*.1)));for(let e=0;e<N.coronaMats.length;e++){let t=Math.sin(Z*5.5+e*2.1)*Math.cos(Z*3.2+e*1.4),n=.3+Math.abs(t)*.55;N.coronaMats[e].opacity=Math.min(1,n+T*.9+nn*2)}je.rotation.z=.15+Z*.1,Ae.opacity=.4+Math.sin(Z*.8)*.05+mn*.05,Re.rotation.z=je.rotation.z,Pe.opacity=.05+Math.sin(Z*.8)*.02+mn*.03,Xe.rotation.z=-.3-Z*.14,Ve.opacity=.15+Math.sin(Z*.7)*.05,nt.rotation.z=.5+Z*.06,nt.rotation.x=J*.62+Math.sin(Z*.2)*.1,tt.opacity=.2+Math.sin(Z*.6)*.08+mn*.12,ot.rotation.z=-.8+Z*.18,ot.rotation.y=Math.sin(Z*.15)*.2,at.opacity=.3+Math.sin(Z*1)*.1,ft.uniforms.uTime.value=Z,ft.uniforms.uEnergy.value=mn;for(let e=0;e<3;e++){let t=ct[e],n=(Z*.3+t.phase)%1,r=1.5+n*4;t.mesh.scale.set(r,r,1),t.mat.uniforms.uOpacity.value=(1-n)*.15*(.5+mn)}Dt.scale.setScalar(4+Math.sin(Z*.8)*.5+mn*.8),vt.opacity=.15+mn*.12+Math.sin(Z*.6)*.03,Rt.scale.setScalar(6.5+Math.sin(Z*.5)*.6),Nt.opacity=.07+mn*.05;for(let e=0;e<10;e++){let t=zt[e];t.angle+=t.speed*i;let n=Math.cos(t.angle)*t.r,r=t.y+Math.sin(Z*.25+e*.9)*.2,a=Math.sin(t.angle)*t.r;Bt[e].position.set(n,r,a),Bt[e].rotation.y=Z*2,Bt[e].rotation.x=Z*1.5,Vt[e].position.set(n,r,a),Vt[e].scale.setScalar(.2+Math.sin(Z*1.2+e)*.05+mn*.06);let o=Ht[e].geo.attributes.position;o.setXYZ(0,0,0,0),o.setXYZ(1,n,r,a),o.needsUpdate=!0}let _e=Qt.attributes.position;for(let e=0;e<60;e++){let t=Zt[e];t.a+=t.spd*i,_e.setXYZ(e,Math.cos(t.a)*t.r,t.y0+Math.sin(Z*.35+e*.7)*.3+Math.sin(t.a*2)*t.tilt,Math.sin(t.a)*t.r)}if(_e.needsUpdate=!0,E.position.y=Math.sin(Z*.2)*.12+Math.sin(Z*.07)*.05,E.position.x=Math.sin(Z*.15+1)*.06,E.rotation.y=Math.sin(Z*.25)*.12,B){let e=gt[L];e&&bt(B,e)}if(me&&de.update(i),y&&(y.uniforms.uStrength.value+=(pe-y.uniforms.uStrength.value)*Math.min(1,i*4)),C&&p&&!r&&a===0)try{p.render()}catch{C=!1}else n.render(c,u)}pn=requestAnimationFrame(Tn);let En=Et(E,[P,I.group]);function Dn(e){St(En,lt(e))}return Dn(`alphabrain`),{setEnergy(e){hn=Math.max(0,Math.min(1,e))},attachAudioLevel(e){gn=e},setGoatTheme(e){I.setPalette(e?we:xe)},pulseGlitch(e=.12){_&&(_.uniforms.uStrength.value=Math.max(_.uniforms.uStrength.value,e))},setRevenueFill(e){w.setFill(e)},revenueIngest(){w.burst()},setOrikiMode(e){me=e,pe=+!!e,de.setActive(e),e?n.domElement.addEventListener(`pointerdown`,V):n.domElement.removeEventListener(`pointerdown`,V)},pikaEmote(e){he(e),(e===`excited`||e===`happy`)&&(hn=.85,setTimeout(()=>{hn=.06},1200)),e===`surprised`&&(hn=.7,setTimeout(()=>{hn=.06},800)),e===`curious`&&(hn=.45,setTimeout(()=>{hn=.06},900)),e===`sad`&&(hn=.15,setTimeout(()=>{hn=.06},1500))},dispose(){cancelAnimationFrame(pn),ht(),xt(B,c),rn(),Ce(),U?.dispose(),window.removeEventListener(`resize`,ee),n.domElement.removeEventListener(`pointerdown`,V),w.dispose(),oe&&oe.dispose(),p&&p.dispose(),n.dispose(),e.removeChild(n.domElement)},startBodyDetection(){},stopBodyDetection(){},setCharacter(e){if(ht(),xt(B,c),B=null,L=e,e===`alphabrain`){I.group.visible=!0,P.visible=!1,Ut(P,`none`),n.setClearColor(st(`alphabrain`),0),Dn(`alphabrain`);return}if(I.group.visible=!1,e===`none`){P.visible=!1,Ut(P,`none`),n.setClearColor(st(`none`),0);return}P.visible=!0,n.setClearColor(st(e),0),Dn(e),B=yt(c,e,!0),Gt(P,M,`/Alpha-new/`,e,t=>{z=t,Tt(t),mt(e)})},throwPokeball:q,pokeballHold:(e,t)=>q.hold(e,t),pokeballThrow:(e,t)=>q.throwIt(e,t),pokeballRelease:()=>q.release(),setPerfMode(e){r=e,ee()},getCharacterTransform(){return kt(L)},setCharacterTransform(e,t,n,r,i,a,o){if((L===`robot`||L===`alphabrain`)&&(e=0),jt(L,{x:e,y:t,z:n,s:r,px:i,py:a,pz:o}),z){let s=Lt.get(z);At(z,s?s.s:1,e,t,n,r,i,a,o)}},resetCharacterTransform(){Mt(L);let e=Pt(L),t=e??Ot(L);if(z){let n=Lt.get(z);At(z,n?n.s:1,t.x,t.y,t.z,e?t.s:1,e?t.px:0,e?t.py:0,e?t.pz:0)}},pinCharacterTransform(){let e=kt(L);Ft(L,e)},hasPinnedTransform(){return It(L)},attackCharacter(e){mt(L);let t=_t[L]||`normal`;z&&Ct(z,t),e.width=e.offsetWidth||300,e.height=e.offsetHeight||300,wt(e,L)}}}function Jt(e){let n=`auto`;try{n=localStorage.getItem(`alpha_display_mode`)||`auto`}catch{}let r=(navigator.maxTouchPoints||0)>0&&/Mac/i.test(navigator.userAgent),o=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||r||window.innerWidth<768,s=n===`mobile`?!0:n===`desktop`?!1:o;if(s)return qt(e);let c=new ce({antialias:!0,alpha:!0,powerPreference:`high-performance`,failIfMajorPerformanceCaveat:!1}),u=(navigator.maxTouchPoints||0)>1&&(window.devicePixelRatio||1)>=1.5&&Math.min(window.innerWidth,window.innerHeight)>=700,f=typeof document<`u`&&document.documentElement.classList.contains(`perf-lite`),p=u||f,m=0,g=()=>{let e=p||u?1:2,t=Math.min(window.devicePixelRatio||1,e);return m>=2?Math.min(t,1):t};c.setPixelRatio(g()),c.setClearColor(st(`alphabrain`),0),c.toneMapping=4,c.toneMappingExposure=.75,e.dataset.orbMode=`desktop`,e.appendChild(c.domElement);let _=new ne,y=new ue(50,1,.1,200);y.position.set(0,.4,6),y.lookAt(0,0,0);let C=0,w=0,ee=e=>{C=(e.clientX/window.innerWidth-.5)*2,w=(e.clientY/window.innerHeight-.5)*2};window.addEventListener(`mousemove`,ee);let E=g(),D=new _e(c,new l(Math.max(1,Math.floor((e.clientWidth||window.innerWidth)*E)),Math.max(1,Math.floor((e.clientHeight||window.innerHeight)*E)),{samples:2}));D.addPass(new ye(_,y));let re=new ve(new h(window.innerWidth*E,window.innerHeight*E),.07,.4,.86);D.addPass(re);let O=new ge(Ee);O.uniforms.darkness.value=.5,D.addPass(O);let k=new ge(De);D.addPass(k);let ae=new ge(Oe);D.addPass(ae);let oe=new ge(Te);D.addPass(oe),D.addPass(new be);let M=ke(2200,2.35,.55);_.add(M.points);function N(){let t=e.clientWidth||window.innerWidth,n=e.clientHeight||window.innerHeight,r=g();c.setPixelRatio(r),c.setSize(t,n,!0),D.setSize(t*r,n*r),oe.uniforms.resolution.value.set(1/(t*r),1/(n*r)),y.aspect=t/n,y.updateProjectionMatrix()}N(),window.addEventListener(`resize`,N);let P=new F;_.add(P);let I=new v(16777215,4.5);I.position.set(3,5,4),_.add(I);let L=new v(16770140,2.2);L.position.set(-4,1,3),_.add(L);let B=new v(16775408,2.8);B.position.set(0,2,-5),_.add(B);let de=new v(14329120,.8);de.position.set(0,-3,2),_.add(de);let pe=new T(2760200,1);_.add(pe);let me=He(c);me&&(_.environment=me);let V=Ue(me),H=We(V,1),U=H.group;P.add(U),U.traverse(e=>{if(e instanceof A){let n=Array.isArray(e.material)?e.material[0]:e.material;n instanceof d&&(e.visible=!1),n instanceof t&&n.map&&(e.visible=!1)}});let W=Ze(s?64:128),G=Me();P.add(G.group);let K=0,Se=!1,Ce=e=>{let t=c.domElement.getBoundingClientRect(),n=(e.clientX-t.left)/t.width*2-1,r=-((e.clientY-t.top)/t.height)*2+1;G.handleTap(n,r,y)};P.add(W.group),U.visible=!1;let q=`alphabrain`,X=null,Ae=Ge(),je=qe(y,W.group),Re=Ke([I,L,B,de,pe]),Be=!1,Xe=null,nt=!1,it=Je(je,()=>{Be=!0}),at=null,ot=Kt(P,U,`/Alpha-new/`,y),ct=[],ut=[{r:2.3,thick:.07,segs:260,color:14329120,op:.95,rx:J*.5,rz:.15},{r:1.9,thick:.015,segs:200,color:16115400,op:.35,rx:J*.38,rz:-.3},{r:2.7,thick:.008,segs:160,color:13145450,op:.22,rx:J*.62,rz:.5},{r:1.7,thick:.006,segs:140,color:15782032,op:.15,rx:J*.7,rz:-.8}];for(let e of ut){let n=new i(e.r,e.thick,24,e.segs),r=new t({color:e.color,transparent:!0,opacity:e.op,depthWrite:!1}),a=new A(n,r);a.rotation.x=e.rx,a.rotation.z=e.rz,a.visible=!1,P.add(a),ct.push({mesh:a,mat:r})}let dt=new i(2.3,.2,24,220),ft=new t({color:14329120,transparent:!0,opacity:.16,depthWrite:!1,blending:2}),pt=new A(dt,ft);pt.rotation.x=J*.5,pt.rotation.z=.15,pt.visible=!1,P.add(pt);let vt=[],Dt=new b(1,1);for(let e=0;e<4;e++){let t=new j({uniforms:{uOpacity:{value:0}},vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,fragmentShader:Le,transparent:!0,depthWrite:!1,side:2}),n=new A(Dt,t);n.rotation.x=-J*.5,P.add(n),vt.push({mesh:n,mat:t,phase:e/4})}let Nt=[];for(let e=0;e<8;e++){let t=Math.acos(2*((e+.5)/8)-1),n=e*2.399963,r=new a(Math.sin(t)*Math.cos(n),Math.cos(t),Math.sin(t)*Math.sin(n)).normalize(),i=new Float32Array(75),o=new Float32Array(25),s=new a(-r.z,.4,r.x).normalize();for(let e=0;e<=24;e++){let t=e/24,n=1.32+t*1.4,a=Math.sin(t*J)*.5,c=r.clone().multiplyScalar(n).addScaledVector(s,a);i[e*3]=c.x,i[e*3+1]=c.y,i[e*3+2]=c.z,o[e]=t}let c=new R;c.setAttribute(`position`,new S(i,3)),c.setAttribute(`aT`,new S(o,1));let l=new j({uniforms:{uTime:{value:0},uOpacity:{value:0}},vertexShader:et,fragmentShader:tt,transparent:!0,depthWrite:!1,blending:2}),u=new le(c,l);P.add(u),Nt.push({mat:l,baseDir:r,phase:e/8})}let Rt=[],zt=[{color:16771248,scale:1.6,off:new a(1.6,.9,.4),speed:1.1},{color:14329120,scale:2.4,off:new a(-1.4,-.7,.6),speed:.7},{color:16115400,scale:1.2,off:new a(.4,1.5,-.5),speed:.9}];for(let e of zt){let t=new fe({map:Ve(),color:e.color,transparent:!0,opacity:0,depthWrite:!1,blending:2}),n=new te(t);n.scale.setScalar(e.scale),n.position.copy(e.off),P.add(n),Rt.push({sprite:n,mat:t,baseScale:e.scale,off:e.off,speed:e.speed})}let Bt=new fe({map:ze(),color:4862480,transparent:!0,opacity:.05,depthWrite:!1,blending:2}),Vt=new te(Bt);Vt.scale.setScalar(4),P.add(Vt);let Ht=new fe({map:ze(),color:2759690,transparent:!0,opacity:.025,depthWrite:!1,blending:2}),Wt=new te(Ht);Wt.scale.setScalar(6),P.add(Wt);let Jt=[],Yt=[],Xt=[],Zt=[],Qt=[14329120,16115400,13936717,13145450,15782032,14329120,16115400,13936717,13145450,15782032,14329120,13145450,16115400,15782032];for(let e=0;e<14;e++){let n=e/14*Y,r=3+e%3*.4,i=new A(new ie(.06,1),new t({color:Qt[e],transparent:!0,opacity:.85,depthWrite:!1})),a=(Math.random()-.5)*1;i.position.set(Math.cos(n)*r,a,Math.sin(n)*r),i.visible=!1,P.add(i),Yt.push(i),Jt.push({angle:n,r,speed:.015+Math.random()*.03,y:a});let o=new te(new fe({map:ze(),color:Qt[e],transparent:!0,opacity:.3,depthWrite:!1,blending:2}));o.scale.setScalar(.35),o.visible=!1,P.add(o),Xt.push(o);let s=new R;s.setAttribute(`position`,new S(new Float32Array(6),3));let c=new le(s,new se({color:Qt[e],transparent:!0,opacity:.12,depthWrite:!1}));c.visible=!1,P.add(c),Zt.push({geo:s})}let $t=new b(20,20,1,1),en=new j({uniforms:{uTime:{value:0},uEnergy:{value:0}},vertexShader:Ne,fragmentShader:Pe,transparent:!0,depthWrite:!1,side:2}),tn=new A($t,en);tn.rotation.x=-J/2,tn.position.y=-2,P.add(tn);let nn=[],rn=[1,1.5,2,2.6,3.2,4],an=[14329120,16115400,14329120,13145450,15782032,14329120];for(let e=0;e<rn.length;e++){let n=new i(rn[e],.005,8,180),r=new t({color:an[e],transparent:!0,opacity:.2-e*.025,depthWrite:!1}),a=new A(n,r);a.rotation.x=J*.5,a.position.y=-2,P.add(a),nn.push({mesh:a,mat:r})}let on=[],sn=[],cn=[],ln=[];for(let e=0;e<=300;e++){let t=e/300,n=-2.5+t*5,r=1.8+Math.sin(t*J*2)*.15,i=t*J*8;on.push(r*Math.cos(i),n,r*Math.sin(i)),sn.push(r*Math.cos(i+J),n,r*Math.sin(i+J));let a=1.45+Math.cos(t*J*2)*.12,o=-t*J*8+J*.5;cn.push(a*Math.cos(o),n,a*Math.sin(o)),ln.push(a*Math.cos(o+J),n,a*Math.sin(o+J))}function un(e,t,n){let r=new R;return r.setAttribute(`position`,new S(new Float32Array(e),3)),new le(r,new se({color:t,transparent:!0,opacity:n,depthWrite:!1}))}let dn=un(on,14329120,.15),fn=un(sn,16115400,.1),Z=un(cn,13145450,.1),pn=un(ln,15782032,.08),mn=dn.material,hn=fn.material,gn=Z.material,_n=pn.material,vn=new F;vn.add(dn),vn.add(fn);let yn=new F;yn.add(Z),yn.add(pn),P.add(vn),P.add(yn);let bn=new Float32Array(600),xn=new Float32Array(200),Sn=new Float32Array(200),Cn=new Float32Array(600),wn=[];for(let e=0;e<200;e++){let t=Math.random()*Y,n=1.8+Math.random()*3.5,r=(Math.random()-.5)*.6;bn[e*3]=Math.cos(t)*n,bn[e*3+1]=(Math.random()-.5)*4,bn[e*3+2]=Math.sin(t)*n,xn[e]=Math.random(),Sn[e]=1+Math.random()*2.5;let i=Math.random();i>.8?(Cn[e*3]=1,Cn[e*3+1]=.85,Cn[e*3+2]=.5):i>.6?(Cn[e*3]=.95,Cn[e*3+1]=.9,Cn[e*3+2]=.82):(Cn[e*3]=.85,Cn[e*3+1]=.68,Cn[e*3+2]=.3),wn.push({a:t,r:n,spd:.03+Math.random()*.08,y0:bn[e*3+1],tilt:r})}let Tn=new R;Tn.setAttribute(`position`,new S(bn,3)),Tn.setAttribute(`aPhase`,new S(xn,1)),Tn.setAttribute(`aSize`,new S(Sn,1)),Tn.setAttribute(`aColor`,new S(Cn,3));let En=new j({uniforms:{uTime:{value:0}},vertexShader:Fe,fragmentShader:Ie,transparent:!0,depthWrite:!1}),Dn=new x(Tn,En);P.add(Dn);let On=new z(1.8,64,64),kn=new j({uniforms:{uTime:{value:0},uEnergy:{value:0}},vertexShader:Qe,fragmentShader:$e,transparent:!0,depthWrite:!1,side:1,blending:2}),An=new A(On,kn);P.add(An);let jn=new Float32Array(500*3),Mn=new Float32Array(500),Nn=new Float32Array(500),Pn=new Float32Array(500*3),Fn=[];for(let e=0;e<500;e++){let t=Math.random()*Y,n=Math.acos(2*Math.random()-1),r=1.38+Math.random()*.12;jn[e*3]=r*Math.sin(n)*Math.cos(t),jn[e*3+1]=r*Math.cos(n),jn[e*3+2]=r*Math.sin(n)*Math.sin(t),Mn[e]=Math.random(),Nn[e]=.3+Math.random()*1,Math.random()>.85?(Pn[e*3]=1,Pn[e*3+1]=.88,Pn[e*3+2]=.55):(Pn[e*3]=.85,Pn[e*3+1]=.7,Pn[e*3+2]=.35),Fn.push({theta:t,phi:n,r,thetaSpd:(Math.random()-.5)*.3,phiSpd:(Math.random()-.5)*.12})}let In=new R;In.setAttribute(`position`,new S(jn,3)),In.setAttribute(`aPhase`,new S(Mn,1)),In.setAttribute(`aSize`,new S(Nn,1)),In.setAttribute(`aColor`,new S(Pn,3));let Ln=new j({uniforms:{uTime:{value:0}},vertexShader:Fe,fragmentShader:Ie,transparent:!0,depthWrite:!1,blending:1}),Rn=new x(In,Ln);P.add(Rn);let zn=new F;_.add(zn);let Bn=new Float32Array(300*3),Vn=new Float32Array(300),Hn=new Float32Array(300),Un=new Float32Array(300*3);for(let e=0;e<300;e++){let t=Math.random()*Y,n=Math.acos(2*Math.random()-1),r=14+Math.random()*20;Bn[e*3]=r*Math.sin(n)*Math.cos(t),Bn[e*3+1]=r*Math.cos(n),Bn[e*3+2]=r*Math.sin(n)*Math.sin(t),Vn[e]=Math.random(),Hn[e]=.3+Math.random()*1.4;let i=Math.random();i>.7?(Un[e*3]=1,Un[e*3+1]=.9,Un[e*3+2]=.6):i>.4?(Un[e*3]=.9,Un[e*3+1]=.8,Un[e*3+2]=.5):(Un[e*3]=.7,Un[e*3+1]=.6,Un[e*3+2]=.35)}let Wn=new R;Wn.setAttribute(`position`,new S(Bn,3)),Wn.setAttribute(`aPhase`,new S(Vn,1)),Wn.setAttribute(`aSize`,new S(Hn,1)),Wn.setAttribute(`aColor`,new S(Un,3));let Gn=new j({uniforms:{uTime:{value:0}},vertexShader:Fe,fragmentShader:Ie,transparent:!0,depthWrite:!1}),Kn=new x(Wn,Gn);zn.add(Kn);let qn=new Float32Array(300),Jn=new Float32Array(100),Yn=new Float32Array(100),Xn=new Float32Array(300),Zn=[];for(let e=0;e<100;e++){let t=Math.random()*Y,n=5+Math.random()*8;qn[e*3]=Math.cos(t)*n,qn[e*3+1]=(Math.random()-.5)*8,qn[e*3+2]=Math.sin(t)*n,Jn[e]=Math.random(),Yn[e]=.5+Math.random()*1,Xn[e*3]=.8,Xn[e*3+1]=.65,Xn[e*3+2]=.3,Zn.push({a:t,r:n,spd:.01+Math.random()*.03,y0:qn[e*3+1]})}let Qn=new R;Qn.setAttribute(`position`,new S(qn,3)),Qn.setAttribute(`aPhase`,new S(Jn,1)),Qn.setAttribute(`aSize`,new S(Yn,1)),Qn.setAttribute(`aColor`,new S(Xn,3));let $n=new j({uniforms:{uTime:{value:0}},vertexShader:Fe,fragmentShader:Ie,transparent:!0,depthWrite:!1}),er=new x(Qn,$n);_.add(er);let tr=(()=>{try{return localStorage.getItem(`alpha:orb_minimal`)!==`0`}catch{return!0}})();if(tr){let e=new Set([U,W.group,G.group]);P.children.forEach(t=>{e.has(t)||(t.visible=!1)}),zn.visible=!1,er.visible=!1,W.tendrils.group.visible=!1,M.points.visible=!1}let nr=!1,rr=null,ir=null,ar=null,or=null,sr=null,cr=null;function lr(){let e=document.createElement(`div`);e.id=`holisticOverlay`,e.style.cssText=`position:fixed;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;pointer-events:none;`;let t=document.createElement(`canvas`);t.style.cssText=`width:60%;height:70%;max-width:640px;max-height:480px;border-radius:16px;border:1px solid rgba(218,165,32,.2);box-shadow:0 0 40px rgba(218,165,32,.1);background:transparent;`,e.appendChild(t);let n=document.createElement(`button`);n.textContent=`✕`,n.style.cssText=`position:absolute;top:20px;right:20px;width:36px;height:36px;border-radius:10px;background:rgba(10,8,6,.7);border:1px solid rgba(218,165,32,.2);color:#daa520;font-size:16px;cursor:pointer;pointer-events:all;z-index:10;backdrop-filter:blur(10px);`,n.onclick=()=>fr(),e.appendChild(n);let r=document.createElement(`div`);r.style.cssText=`position:absolute;top:20px;left:50%;transform:translateX(-50%);font-family:"Space Grotesk",sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#daa520;opacity:.7;background:rgba(10,8,6,.6);padding:6px 16px;border-radius:8px;border:1px solid rgba(218,165,32,.15);backdrop-filter:blur(10px);`,r.textContent=`BODY DETECTION`,e.appendChild(r);let i=document.createElement(`div`);return i.id=`holisticStatus`,i.style.cssText=`position:absolute;bottom:20px;left:50%;transform:translateX(-50%);font-family:"Space Grotesk",sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#daa520;opacity:.6;background:rgba(10,8,6,.6);padding:5px 14px;border-radius:8px;border:1px solid rgba(218,165,32,.15);backdrop-filter:blur(10px);`,i.textContent=`INITIALIZING...`,e.appendChild(i),document.body.appendChild(e),cr=e,ir=t,ar=t.getContext(`2d`),{cvs:t,status:i}}async function ur(){for(let e of[`https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js`,`https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js`,`https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js`])document.querySelector(`script[src="${e}"]`)||await new Promise((t,n)=>{let r=document.createElement(`script`);r.src=e,r.crossOrigin=`anonymous`,r.onload=()=>t(),r.onerror=()=>n(Error(`Failed to load: `+e)),document.head.appendChild(r)});return!0}async function dr(){if(nr)return;nr=!0;let{cvs:e,status:t}=lr();try{await ur(),t.textContent=`LOADING MODEL...`;let n=window,r=document.createElement(`video`);r.style.display=`none`,document.body.appendChild(r),rr=r;let i=new n.Holistic({locateFile:e=>`https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${e}`});or=i,i.setOptions({modelComplexity:1,smoothLandmarks:!0,refineFaceLandmarks:!0}),i.onResults(r=>{if(!ar||!ir)return;let i=e.width=e.clientWidth*(window.devicePixelRatio||1),a=e.height=e.clientHeight*(window.devicePixelRatio||1),o=ar;o.clearRect(0,0,i,a),o.save(),o.globalAlpha=.15,r.image&&o.drawImage(r.image,0,0,i,a),o.restore(),r.poseLandmarks&&(n.drawConnectors(o,r.poseLandmarks,n.POSE_CONNECTIONS,{color:`#daa520`,lineWidth:2}),n.drawLandmarks(o,r.poseLandmarks,{color:`#f5e6c8`,fillColor:`#f5e6c8`,lineWidth:1,radius:3})),r.faceLandmarks&&n.drawConnectors(o,r.faceLandmarks,n.FACEMESH_TESSELATION,{color:`rgba(218,165,32,0.3)`,lineWidth:.5}),r.leftHandLandmarks&&n.drawConnectors(o,r.leftHandLandmarks,n.HAND_CONNECTIONS,{color:`#c8956a`,lineWidth:1.5}),r.rightHandLandmarks&&n.drawConnectors(o,r.rightHandLandmarks,n.HAND_CONNECTIONS,{color:`#daa520`,lineWidth:1.5}),t.textContent=`TRACKING ACTIVE`,t.style.color=`#daa520`});let a=new n.Camera(r,{onFrame:async()=>{await i.send({image:r})},width:640,height:480});sr=a,await a.start(),t.textContent=`CAMERA READY`}catch(e){t.textContent=`ERROR: `+(e.message||`Camera failed`),t.style.color=`#ff5d73`}}function fr(){if(nr=!1,sr){try{sr.stop()}catch{}sr=null}if(or){try{or.close()}catch{}or=null}rr&&=(rr.remove(),null),cr&&=(cr.remove(),null),ir=null,ar=null}let pr=0,mr=rt(e,c.domElement,e=>{pr=e}),hr=0,gr=0,_r=!1,vr=0,yr=c.domElement;function br(e){_r=!0,vr=e,gr=0}function xr(e){if(!_r)return;let t=e-vr;vr=e,gr=t*.012,hr+=gr}function Sr(){_r=!1}yr.addEventListener(`mousedown`,e=>br(e.clientX)),yr.addEventListener(`mousemove`,e=>xr(e.clientX)),yr.addEventListener(`mouseup`,Sr),yr.addEventListener(`mouseleave`,Sr),yr.addEventListener(`touchstart`,e=>{e.touches[0]&&br(e.touches[0].clientX)},{passive:!0}),yr.addEventListener(`touchmove`,e=>{e.touches[0]&&xr(e.touches[0].clientX)},{passive:!0}),yr.addEventListener(`touchend`,Sr);let Q=0,Cr=0,$=.06,wr=.06,Tr=null,Er=0,Dr=3+Math.random()*5,Or=0,kr=0,Ar=0,jr=0,Mr=0,Nr=0;function Pr(e){if(Cr=requestAnimationFrame(Pr),document.hidden||document.body.classList.contains(`bg-paused`)||document.documentElement.classList.contains(`booting`))return;let t=kr?(e-kr)/1e3:.016,n=Math.min(t,.05);kr=e,Q+=n;{let e=U.__mixer;e&&e.update(n)}{let e=U.__aura;e&&e.update(n,Q)}if(!p&&m<2&&(Mr+=t,Ar+=t,jr++,Mr>3&&Ar>=1)){let e=jr/Ar;Ar=0,jr=0;let t=u?1:2;e<55?(e<40||++Nr>=t)&&(Nr=0,m++,N()):Nr=0}$+=(wr-$)*.07,_r||(gr*=.92,hr+=gr),re.strength=.2+pr*4.5,c.toneMappingExposure=.75+pr*2.5,Or+=n,Or>=Dr&&(Er=.4+Math.random()*.6,Dr=Or+2+Math.random()*6),Er*=.93,Er<.01&&(Er=0),En.uniforms.uTime.value=Q,en.uniforms.uTime.value=Q,en.uniforms.uEnergy.value=$;let r=Math.sin(Q*.45)*.04;U.rotation.y=Math.sin(Q*.35)*.35+hr,U.rotation.z=r;let i=Q%8,a=i>7.4&&i<7.8,o=a?Math.sin((i-7.4)/.4*J)*.15:0;U.position.y=Math.sin(Q*.7)*.06+o;let s=1+Math.sin(Q*1.2)*.02,l=1+Math.max(0,Math.sin(Q*3))*.008,d=a?1+Math.sin((i-7.4)/.4*J)*.04:1;U.scale.set(1/l*s*(1/d),s*l*d,s),W.core.rotation.y+=n*.25,W.core.rotation.x+=n*.08,W.wire.rotation.y-=n*.18,W.wire.rotation.x+=n*.05,W.wire2.rotation.y+=n*.12,W.wire2.rotation.z-=n*.09;let f=Tr?Math.max(0,Math.min(1,Tr())):0,h=Ye(Math.max($,f),Q);if(W.coreMat.uniforms.uTime.value=Q,W.coreMat.uniforms.uAudioAmplitude.value=h,W.tendrils.update(n,h,Q),Be&&(Be=!1,Xe=Q,je?.ignite()),Xe!==null){let e=Q-Xe,t=je?je.analyser.getAverageFrequency()/255:Math.min(1,e/3);e<3.1?Ae.addTrauma(t*n*2.4):nt||(nt=!0,Ae.addTrauma(1),k.uniforms.uStrength.value=.05),Re.update(e);let r=e<3.1?t*.85:Math.max(0,2*Math.exp(-(e-3.1)*2));W.coreMat.uniforms.uAudioAmplitude.value=Math.max(h,r),e>6.5&&(Xe=null,Re.settle())}if(h>.6&&(k.uniforms.uStrength.value=Math.max(k.uniforms.uStrength.value,(h-.6)*.03)),k.uniforms.uStrength.value*=Math.max(0,1-n*3.2),M.update(n),tr&&(M.points.visible=M.burstLevel()>.03),H.head){let e=Q%12,t=e>5&&e<7?Math.sin((e-5)/2*J)*.12:0;H.head.rotation.y=Math.sin(Q*.5+.5)*.14,H.head.rotation.z=Math.sin(Q*.3)*.05+t,H.head.rotation.x=Math.sin(Q*.25)*.04+(t>0?-.03:0)}let g=Q%5,v=g>4.2?Math.sin((g-4.2)/.8*J):0,b=v>.25?.5:0,x=Q*1.2%Y,S=Math.max(0,Math.sin(x*2))>.85?.25:0,ee=Math.max(0,Math.sin(x*2+1.2))>.9?.18:0,te=.08+S*.3+ee*.2+$*.1+b*.3+pr*1.5;if(H.cheekMatL.emissiveIntensity=te,H.cheekMatR.emissiveIntensity=te,H.tail){let e=Q%6>5?2.5:1;H.tail.rotation.z=Math.sin(Q*1.8*e)*.18+Math.sin(Q*4.2)*.04,H.tail.rotation.y=.15+Math.sin(Q*2.5)*.12+Math.cos(Q*3.8)*.05,H.tail.rotation.x=-.45+Math.sin(Q*1.2)*.05}let T=Q%10,E=T>8.5&&T<10?Math.sin((T-8.5)/1.5*J)*.65:0;H.leftArm&&(H.leftArm.rotation.z=.55+Math.sin(Q*1.2)*.18-E),H.rightArm&&(H.rightArm.rotation.z=-.55+Math.sin(Q*1.2+1)*.18);let ne=3.5+Math.sin(Q*.1)*.5,O=Q%ne,ie=O>.35&&O<.65,A=O<.15||ie,oe=A?ie?(O-.35)/.3:O/.15:0,se=A?Math.max(.01,1-Math.sin(oe*J)*.99):Math.max(.01,b>0?.4:a?.35:0);H.leftEyelid&&(H.leftEyelid.scale.y=se),H.rightEyelid&&(H.rightEyelid.scale.y=se);let ce=pr*-.12,j=b>0?-.08:a?-.06:ce,le=Math.sin(Q*2.5)*.05+(Math.sin(Q*7.3)>.95?.12:0)+j,ue=Math.sin(Q*2.5+.6)*.05+(Math.sin(Q*8.1+1)>.95?.12:0)+j;H.leftEarGroup&&(H.leftEarGroup.rotation.x=-.12+le),H.rightEarGroup&&(H.rightEarGroup.rotation.x=-.12+ue);let F=pr*8;for(let e=0;e<H.sparkMats.length;e++){let t=Math.sin(Q*8+e*2.7)*Math.sin(Q*3.1+e*1.3),n=.12+Math.abs(t)*.3,r=Math.sin(Q*45+e*2.7)*.5+.5;H.sparkMats[e].opacity=Math.min(1,Math.max(n,v*(.55+r*.45))+pr*(.4+r*F*.1))}H.sparks.rotation.y+=n*(.35+v*6+pr*12);let I=C*.008,L=w*-.005,R=Math.sin(Q*.18)*.015+I,z=Math.sin(Q*.13+.7)*.01+L;H.leftPupil&&(H.leftPupil.position.x=-.32+R,H.leftPupil.position.y=.055+z),H.rightPupil&&(H.rightPupil.position.x=.32+R,H.rightPupil.position.y=.055+z);let B=a?.008:.003;if(H.tongue&&(H.tongue.position.y=-.12+Math.sin(Q*2)*B),H.mouthMesh){let e=a?.03:0;H.mouthMesh.position.y=-.12-e}H.auraMat.opacity=Math.max(.04+Math.sin(Q*4)*.02,Math.max(v*(.15+Math.sin(Q*30)*.05),pr*(.4+Math.sin(Q*40)*.1)));for(let e=0;e<H.coronaMats.length;e++){let t=Math.sin(Q*5.5+e*2.1)*Math.cos(Q*3.2+e*1.4),n=.3+Math.abs(t)*.55;H.coronaMats[e].opacity=Math.min(1,n+v*.9+pr*2)}ct[0].mesh.rotation.z=.15+Q*.07,ct[0].mat.opacity=.9+Math.sin(Q*.6)*.06+$*.04,pt.rotation.z=ct[0].mesh.rotation.z,ft.opacity=.14+Math.sin(Q*.6)*.04+$*.08,ct[1].mesh.rotation.z=-.3-Q*.1,ct[1].mat.opacity=.22+Math.sin(Q*.5)*.04,ct[2].mesh.rotation.z=.5+Q*.04,ct[2].mesh.rotation.x=J*.62+Math.sin(Q*.15)*.08,ct[2].mat.opacity=.12+Math.sin(Q*.45)*.03+$*.04,ct[3].mesh.rotation.z=-.8+Q*.12,ct[3].mat.opacity=.08+Math.sin(Q*.55)*.02;for(let e=0;e<4;e++){let t=vt[e],n=(Q*.25+t.phase)%1,r=2+n*6;t.mesh.scale.set(r,r,1),t.mat.uniforms.uOpacity.value=(1-n)*.06*(.5+$)}for(let e=0;e<8;e++){let t=Nt[e];t.mat.uniforms.uTime.value=Q+t.phase*6.28,t.mat.uniforms.uOpacity.value=(.1+$*.25)*(.5+.5*Math.sin(Q*.8+e))}for(let e=0;e<Rt.length;e++){let t=Rt[e],n=.5+.5*Math.sin(Q*t.speed+e*1.7);t.mat.opacity=(.05+$*.18)*(.4+n*.6),t.sprite.scale.setScalar(t.baseScale*(.9+n*.2+$*.3)),t.sprite.position.set(t.off.x+Math.sin(Q*.2+e)*.1,t.off.y+Math.cos(Q*.18+e)*.1,t.off.z)}Vt.scale.setScalar(3.5+Math.sin(Q*.6)*.3+$*.4),Bt.opacity=.04+$*.03+Math.sin(Q*.5)*.01,Wt.scale.setScalar(5.5+Math.sin(Q*.4)*.3),Ht.opacity=.02+$*.015,kn.uniforms.uTime.value=Q,kn.uniforms.uEnergy.value=$,An.rotation.y=Q*.03,Ln.uniforms.uTime.value=Q;let de=In.attributes.position;for(let e=0;e<500;e++){let t=Fn[e];t.theta+=t.thetaSpd*n,t.phi+=t.phiSpd*n*.5,de.setXYZ(e,t.r*Math.sin(t.phi)*Math.cos(t.theta),t.r*Math.cos(t.phi),t.r*Math.sin(t.phi)*Math.sin(t.theta))}de.needsUpdate=!0;for(let e=0;e<14;e++){let t=Jt[e];t.angle+=t.speed*n;let r=Math.cos(t.angle)*t.r,i=t.y+Math.sin(Q*.2+e*.7)*.25,a=Math.sin(t.angle)*t.r;Yt[e].position.set(r,i,a),Yt[e].rotation.y=Q*1.5,Yt[e].rotation.x=Q*1,Xt[e].position.set(r,i,a),Xt[e].scale.setScalar(.18+Math.sin(Q*1+e)*.04+$*.03);let o=Zt[e].geo.attributes.position;o.setXYZ(0,0,0,0),o.setXYZ(1,r,i,a),o.needsUpdate=!0}for(let e=0;e<nn.length;e++)nn[e].mesh.rotation.z=Q*(.03+e*.015)*(e%2==0?1:-1),nn[e].mat.opacity=.09-e*.0125+$*.04;vn.rotation.y=Q*.1,yn.rotation.y=-Q*.08,mn.opacity=.09+$*.07+Math.sin(Q*1.2)*.024,hn.opacity=.06+$*.06+Math.sin(Q*1.2+1)*.018,gn.opacity=.06+$*.05+Math.sin(Q*1+2)*.018,_n.opacity=.04+$*.04+Math.sin(Q*1+3)*.012;let fe=Tn.attributes.position;for(let e=0;e<200;e++){let t=wn[e];t.a+=t.spd*n,fe.setXYZ(e,Math.cos(t.a)*t.r,t.y0+Math.sin(Q*.3+e*.5)*.4+Math.sin(t.a*2)*t.tilt,Math.sin(t.a)*t.r)}fe.needsUpdate=!0,P.position.y=Math.sin(Q*.15)*.1+Math.sin(Q*.06)*.04,P.position.x=Math.sin(Q*.12+1)*.05,P.rotation.y=Math.sin(Q*.22)*.1;let pe=C*.9,me=.4+w*-.6;y.position.x+=(pe-y.position.x)*.035,y.position.y+=(me-y.position.y)*.035,y.lookAt(0,0,0);let V=Ae.update(n,Q);y.rotateX(V.y),y.rotateY(V.x),y.rotateZ(V.roll),Gn.uniforms.uTime.value=Q,zn.rotation.y=Q*.004,zn.rotation.x=Math.sin(Q*.015)*.02,$n.uniforms.uTime.value=Q;let he=Qn.attributes.position;for(let e=0;e<100;e++){let t=Zn[e];t.a+=t.spd*n,he.setXYZ(e,Math.cos(t.a)*t.r,t.y0+Math.sin(Q*.12+e*.3)*.6,Math.sin(t.a)*t.r)}if(he.needsUpdate=!0,at){let e=gt[q];e&&bt(at,e)}Se&&G.update(n),ae.uniforms.uStrength.value+=(K-ae.uniforms.uStrength.value)*Math.min(1,n*4),p||m>0?c.render(_,y):D.render()}Cr=requestAnimationFrame(Pr);let Fr=Et(P,[U,W.group]);function Ir(e){St(Fr,lt(e))}return Ir(`alphabrain`),{setEnergy(e){wr=Math.max(0,Math.min(1,e))},attachAudioLevel(e){Tr=e},setGoatTheme(e){W.setPalette(e?we:xe)},pulseGlitch(e=.12){k.uniforms.uStrength.value=Math.max(k.uniforms.uStrength.value,e)},setRevenueFill(e){M.setFill(e)},revenueIngest(){M.burst()},setOrikiMode(e){Se=e,K=+!!e,G.setActive(e),e?c.domElement.addEventListener(`pointerdown`,Ce):c.domElement.removeEventListener(`pointerdown`,Ce)},pikaEmote(e){he(e),e===`excited`||e===`happy`?(wr=.85,setTimeout(()=>{wr=.06},1200)):e===`surprised`?(wr=.7,setTimeout(()=>{wr=.06},800)):e===`curious`?(wr=.45,setTimeout(()=>{wr=.06},900)):e===`sad`&&(wr=.15,setTimeout(()=>{wr=.06},1500))},dispose(){cancelAnimationFrame(Cr),ht(),xt(at,_),mr(),fr(),it(),je?.dispose(),window.removeEventListener(`resize`,N),window.removeEventListener(`mousemove`,ee),c.domElement.removeEventListener(`pointerdown`,Ce),M.dispose(),me&&me.dispose(),c.dispose(),D.dispose(),e.removeChild(c.domElement)},startBodyDetection:dr,stopBodyDetection:fr,setCharacter(e){if(ht(),xt(at,_),at=null,q=e,e===`alphabrain`){W.group.visible=!0,U.visible=!1,Ut(U,`none`),c.setClearColor(st(`alphabrain`),0),Ir(`alphabrain`);return}if(W.group.visible=!1,e===`none`){U.visible=!1,Ut(U,`none`),c.setClearColor(st(`none`),0);return}U.visible=!0,c.setClearColor(st(e),0),Ir(e),at=yt(_,e,!1),Gt(U,V,`/Alpha-new/`,e,t=>{X=t,Tt(t),mt(e)})},throwPokeball:ot,pokeballHold:(e,t)=>ot.hold(e,t),pokeballThrow:(e,t)=>ot.throwIt(e,t),pokeballRelease:()=>ot.release(),setPerfMode(e){p=e,N()},getCharacterTransform(){return kt(q)},setCharacterTransform(e,t,n,r,i,a,o){if((q===`robot`||q===`alphabrain`)&&(e=0),jt(q,{x:e,y:t,z:n,s:r,px:i,py:a,pz:o}),X){let s=Lt.get(X);At(X,s?s.s:1,e,t,n,r,i,a,o)}},resetCharacterTransform(){Mt(q);let e=Pt(q),t=e??Ot(q);if(X){let n=Lt.get(X);At(X,n?n.s:1,t.x,t.y,t.z,e?t.s:1,e?t.px:0,e?t.py:0,e?t.pz:0)}},pinCharacterTransform(){let e=kt(q);Ft(q,e)},hasPinnedTransform(){return It(q)},attackCharacter(e){mt(q);let t=_t[q]||`normal`;X&&Ct(X,t),e.width=e.offsetWidth||400,e.height=e.offsetHeight||400,wt(e,q)}}}export{at as CHARACTER_NAMES,Jt as mountOrb,pt as setCryEnabled};