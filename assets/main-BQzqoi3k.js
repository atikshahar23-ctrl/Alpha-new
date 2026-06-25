import{t as e}from"./preload-helper-AjHucr8l.js";import{t}from"./heavyguard-rGViojVG.js";var n=`attached`,r=1e3,i=1001,a=1002,o=1003,s=1004,c=1005,l=1006,u=1007,d=1008,f=1009,p=1010,m=1011,h=1012,g=1013,_=1014,v=1015,y=1016,b=1017,x=1018,S=1020,C=35902,w=35899,T=1021,E=1022,D=1023,O=1026,k=1027,A=1028,ee=1029,te=1030,j=1031,ne=1033,M=33776,N=33777,re=33778,ie=33779,ae=35840,oe=35841,P=35842,se=35843,ce=36196,F=37492,le=37496,ue=37488,de=37489,fe=37490,pe=37491,I=37808,L=37809,me=37810,he=37811,ge=37812,_e=37813,ve=37814,ye=37815,R=37816,be=37817,xe=37818,Se=37819,Ce=37820,z=37821,we=36492,Te=36494,B=36495,Ee=36283,De=36284,Oe=36285,V=36286,ke=2300,H=2301,U=2302,Ae=2303,je=2400,Me=2401,Ne=2402,Pe=2500,Fe=3200,Ie=`srgb`,Le=`srgb-linear`,Re=`linear`,ze=`srgb`,Be=7680,Ve=35044,He=2e3;function Ue(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function We(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Ge(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Ke(){let e=Ge(`canvas`);return e.style.display=`block`,e}var qe={},Je=null;function Ye(...e){let t=`THREE.`+e.shift();Je?Je(`log`,t,...e):console.log(t,...e)}function Xe(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function W(...e){e=Xe(e);let t=`THREE.`+e.shift();if(Je)Je(`warn`,t,...e);else{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function G(...e){e=Xe(e);let t=`THREE.`+e.shift();if(Je)Je(`error`,t,...e);else{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Ze(...e){let t=e.join(` `);t in qe||(qe[t]=!0,W(...e))}function Qe(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var $e={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},et=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},tt=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),nt=1234567,rt=Math.PI/180,it=180/Math.PI;function at(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(tt[e&255]+tt[e>>8&255]+tt[e>>16&255]+tt[e>>24&255]+`-`+tt[t&255]+tt[t>>8&255]+`-`+tt[t>>16&15|64]+tt[t>>24&255]+`-`+tt[n&63|128]+tt[n>>8&255]+`-`+tt[n>>16&255]+tt[n>>24&255]+tt[r&255]+tt[r>>8&255]+tt[r>>16&255]+tt[r>>24&255]).toLowerCase()}function ot(e,t,n){return Math.max(t,Math.min(n,e))}function st(e,t){return(e%t+t)%t}function ct(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function lt(e,t,n){return e===t?0:(n-e)/(t-e)}function ut(e,t,n){return(1-n)*e+n*t}function K(e,t,n,r){return ut(e,t,1-Math.exp(-n*r))}function dt(e,t=1){return t-Math.abs(st(e,t*2)-t)}function ft(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function pt(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function mt(e,t){return e+Math.floor(Math.random()*(t-e+1))}function ht(e,t){return e+Math.random()*(t-e)}function gt(e){return e*(.5-Math.random())}function _t(e){e!==void 0&&(nt=e);let t=nt+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function vt(e){return e*rt}function yt(e){return e*it}function bt(e){return(e&e-1)==0&&e!==0}function xt(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function St(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function Ct(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:W(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function wt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`Invalid component type.`)}}function Tt(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`Invalid component type.`)}}var Et={DEG2RAD:rt,RAD2DEG:it,generateUUID:at,clamp:ot,euclideanModulo:st,mapLinear:ct,inverseLerp:lt,lerp:ut,damp:K,pingpong:dt,smoothstep:ft,smootherstep:pt,randInt:mt,randFloat:ht,randFloatSpread:gt,seededRandom:_t,degToRad:vt,radToDeg:yt,isPowerOfTwo:bt,ceilPowerOfTwo:xt,floorPowerOfTwo:St,setQuaternionFromProperEuler:Ct,normalize:Tt,denormalize:wt},q=class e{static{e.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=ot(this.x,e.x,t.x),this.y=ot(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=ot(this.x,e,t),this.y=ot(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ot(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(ot(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Dt=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:W(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ot(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},J=class e{static{e.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(kt.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(kt.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=ot(this.x,e.x,t.x),this.y=ot(this.y,e.y,t.y),this.z=ot(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=ot(this.x,e,t),this.y=ot(this.y,e,t),this.z=ot(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ot(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ot.copy(this).projectOnVector(e),this.sub(Ot)}reflect(e){return this.sub(Ot.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(ot(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ot=new J,kt=new Dt,At=class e{static{e.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(jt.makeScale(e,t)),this}rotate(e){return this.premultiply(jt.makeRotation(-e)),this}translate(e,t){return this.premultiply(jt.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},jt=new At,Mt=new At().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Nt=new At().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Pt(){let e={enabled:!0,workingColorSpace:Le,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=It(e.r),e.g=It(e.g),e.b=It(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Lt(e.r),e.g=Lt(e.g),e.b=Lt(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Re:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return Ze(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return Ze(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Le]:{primaries:t,whitePoint:r,transfer:Re,toXYZ:Mt,fromXYZ:Nt,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Ie},outputColorSpaceConfig:{drawingBufferColorSpace:Ie}},[Ie]:{primaries:t,whitePoint:r,transfer:ze,toXYZ:Mt,fromXYZ:Nt,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Ie}}}),e}var Ft=Pt();function It(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Lt(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var Rt,zt=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Rt===void 0&&(Rt=Ge(`canvas`)),Rt.width=e.width,Rt.height=e.height;let t=Rt.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Rt}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Ge(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=It(i[e]/255)*255;return n.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(It(t[e]/255)*255):t[e]=It(t[e]);return{data:t,width:e.width,height:e.height}}else return W(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Bt=0,Vt=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Bt++}),this.uuid=at(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Ht(r[t].image)):e.push(Ht(r[t]))}else e=Ht(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Ht(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?zt.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(W(`Texture: Unable to serialize Texture.`),{})}var Ut=0,Wt=new J,Gt=class e extends et{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=i,a=i,o=l,s=d,c=D,u=f,p=e.DEFAULT_ANISOTROPY,m=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ut++}),this.uuid=at(),this.name=``,this.source=new Vt(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=a,this.magFilter=o,this.minFilter=s,this.anisotropy=p,this.format=c,this.internalFormat=null,this.type=u,this.offset=new q(0,0),this.repeat=new q(1,1),this.center=new q(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new At,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=m,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Wt).x}get height(){return this.source.getSize(Wt).y}get depth(){return this.source.getSize(Wt).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){W(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){W(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case r:e.x-=Math.floor(e.x);break;case i:e.x=e.x<0?0:1;break;case a:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case r:e.y-=Math.floor(e.y);break;case i:e.y=e.y<0?0:1;break;case a:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Gt.DEFAULT_IMAGE=null,Gt.DEFAULT_MAPPING=300,Gt.DEFAULT_ANISOTROPY=1;var Kt=class e{static{e.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=ot(this.x,e.x,t.x),this.y=ot(this.y,e.y,t.y),this.z=ot(this.z,e.z,t.z),this.w=ot(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=ot(this.x,e,t),this.y=ot(this.y,e,t),this.z=ot(this.z,e,t),this.w=ot(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(ot(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},qt=class extends et{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:l,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Kt(0,0,e,t),this.scissorTest=!1,this.viewport=new Kt(0,0,e,t),this.textures=[];let r=new Gt({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:l,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Vt(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this}dispose(){this.dispatchEvent({type:`dispose`})}},Jt=class extends qt{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Yt=class extends Gt{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=o,this.minFilter=o,this.wrapR=i,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Xt=class extends Gt{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=o,this.minFilter=o,this.wrapR=i,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Zt=class e{static{e.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinant()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();let t=this.elements,n=e.elements,r=1/Qt.setFromMatrixColumn(e,0).length(),i=1/Qt.setFromMatrixColumn(e,1).length(),a=1/Qt.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(en,e,tn)}lookAt(e,t,n){let r=this.elements;return an.subVectors(e,t),an.lengthSq()===0&&(an.z=1),an.normalize(),nn.crossVectors(n,an),nn.lengthSq()===0&&(Math.abs(n.z)===1?an.x+=1e-4:an.z+=1e-4,an.normalize(),nn.crossVectors(n,an)),nn.normalize(),rn.crossVectors(an,nn),r[0]=nn.x,r[4]=rn.x,r[8]=an.x,r[1]=nn.y,r[5]=rn.y,r[9]=an.y,r[2]=nn.z,r[6]=rn.z,r[10]=an.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],ee=r[10],te=r[14],j=r[3],ne=r[7],M=r[11],N=r[15];return i[0]=a*x+o*T+s*k+c*j,i[4]=a*S+o*E+s*A+c*ne,i[8]=a*C+o*D+s*ee+c*M,i[12]=a*w+o*O+s*te+c*N,i[1]=l*x+u*T+d*k+f*j,i[5]=l*S+u*E+d*A+f*ne,i[9]=l*C+u*D+d*ee+f*M,i[13]=l*w+u*O+d*te+f*N,i[2]=p*x+m*T+h*k+g*j,i[6]=p*S+m*E+h*A+g*ne,i[10]=p*C+m*D+h*ee+g*M,i[14]=p*w+m*O+h*te+g*N,i[3]=_*x+v*T+y*k+b*j,i[7]=_*S+v*E+y*A+b*ne,i[11]=_*C+v*D+y*ee+b*M,i[15]=_*w+v*O+y*te+b*N,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinant();if(i===0)return n.set(1,1,1),t.identity(),this;let a=Qt.set(r[0],r[1],r[2]).length(),o=Qt.set(r[4],r[5],r[6]).length(),s=Qt.set(r[8],r[9],r[10]).length();i<0&&(a=-a),$t.copy(this);let c=1/a,l=1/o,u=1/s;return $t.elements[0]*=c,$t.elements[1]*=c,$t.elements[2]*=c,$t.elements[4]*=l,$t.elements[5]*=l,$t.elements[6]*=l,$t.elements[8]*=u,$t.elements[9]*=u,$t.elements[10]*=u,t.setFromRotationMatrix($t),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=He,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=He,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Qt=new J,$t=new Zt,en=new J(0,0,0),tn=new J(1,1,1),nn=new J,rn=new J,an=new J,on=new Zt,sn=new Dt,cn=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(ot(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-ot(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(ot(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-ot(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(ot(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-ot(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:W(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return on.makeRotationFromQuaternion(e),this.setFromRotationMatrix(on,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return sn.setFromEuler(this),this.setFromQuaternion(sn,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};cn.DEFAULT_ORDER=`XYZ`;var ln=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!=0}},un=0,dn=new J,fn=new Dt,pn=new Zt,mn=new J,hn=new J,gn=new J,_n=new Dt,vn=new J(1,0,0),yn=new J(0,1,0),bn=new J(0,0,1),xn={type:`added`},Sn={type:`removed`},Cn={type:`childadded`,child:null},wn={type:`childremoved`,child:null},Tn=class e extends et{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:un++}),this.uuid=at(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new J,n=new cn,r=new Dt,i=new J(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Zt},normalMatrix:{value:new At}}),this.matrix=new Zt,this.matrixWorld=new Zt,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ln,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return fn.setFromAxisAngle(e,t),this.quaternion.multiply(fn),this}rotateOnWorldAxis(e,t){return fn.setFromAxisAngle(e,t),this.quaternion.premultiply(fn),this}rotateX(e){return this.rotateOnAxis(vn,e)}rotateY(e){return this.rotateOnAxis(yn,e)}rotateZ(e){return this.rotateOnAxis(bn,e)}translateOnAxis(e,t){return dn.copy(e).applyQuaternion(this.quaternion),this.position.add(dn.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(vn,e)}translateY(e){return this.translateOnAxis(yn,e)}translateZ(e){return this.translateOnAxis(bn,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(pn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?mn.copy(e):mn.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),hn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?pn.lookAt(hn,mn,this.up):pn.lookAt(mn,hn,this.up),this.quaternion.setFromRotationMatrix(pn),r&&(pn.extractRotation(r.matrixWorld),fn.setFromRotationMatrix(pn),this.quaternion.premultiply(fn.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(G(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(xn),Cn.child=e,this.dispatchEvent(Cn),Cn.child=null):G(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Sn),wn.child=e,this.dispatchEvent(wn),wn.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),pn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),pn.multiply(e.parent.matrixWorld)),e.applyMatrix4(pn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(xn),Cn.child=e,this.dispatchEvent(Cn),Cn.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(hn,e,gn),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(hn,_n,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==``&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),this.static!==!1&&(r.static=this.static),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material);if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}};Tn.DEFAULT_UP=new J(0,1,0),Tn.DEFAULT_MATRIX_AUTO_UPDATE=!0,Tn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var En=class extends Tn{constructor(){super(),this.isGroup=!0,this.type=`Group`}},Dn={type:`move`},On=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new En,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new En,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new J,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new J),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new En,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new J,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new J,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Dn)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new En;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},kn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},An={h:0,s:0,l:0},jn={h:0,s:0,l:0};function Mn(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var Y=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ie){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ft.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=Ft.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ft.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=Ft.workingColorSpace){if(e=st(e,1),t=ot(t,0,1),n=ot(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Mn(i,r,e+1/3),this.g=Mn(i,r,e),this.b=Mn(i,r,e-1/3)}return Ft.colorSpaceToWorking(this,r),this}setStyle(e,t=Ie){function n(t){t!==void 0&&parseFloat(t)<1&&W(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:W(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);W(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ie){let n=kn[e.toLowerCase()];return n===void 0?W(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=It(e.r),this.g=It(e.g),this.b=It(e.b),this}copyLinearToSRGB(e){return this.r=Lt(e.r),this.g=Lt(e.g),this.b=Lt(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ie){return Ft.workingToColorSpace(Nn.copy(this),e),Math.round(ot(Nn.r*255,0,255))*65536+Math.round(ot(Nn.g*255,0,255))*256+Math.round(ot(Nn.b*255,0,255))}getHexString(e=Ie){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ft.workingColorSpace){Ft.workingToColorSpace(Nn.copy(this),t);let n=Nn.r,r=Nn.g,i=Nn.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4;break}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=Ft.workingColorSpace){return Ft.workingToColorSpace(Nn.copy(this),t),e.r=Nn.r,e.g=Nn.g,e.b=Nn.b,e}getStyle(e=Ie){Ft.workingToColorSpace(Nn.copy(this),e);let t=Nn.r,n=Nn.g,r=Nn.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(An),this.setHSL(An.h+e,An.s+t,An.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(An),e.getHSL(jn);let n=ut(An.h,jn.h,t),r=ut(An.s,jn.s,t),i=ut(An.l,jn.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Nn=new Y;Y.NAMES=kn;var Pn=class extends Tn{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new cn,this.environmentIntensity=1,this.environmentRotation=new cn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Fn=new J,In=new J,Ln=new J,Rn=new J,zn=new J,Bn=new J,Vn=new J,Hn=new J,Un=new J,Wn=new J,Gn=new Kt,Kn=new Kt,qn=new Kt,Jn=class e{constructor(e=new J,t=new J,n=new J){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Fn.subVectors(e,t),r.cross(Fn);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Fn.subVectors(r,t),In.subVectors(n,t),Ln.subVectors(e,t);let a=Fn.dot(Fn),o=Fn.dot(In),s=Fn.dot(Ln),c=In.dot(In),l=In.dot(Ln),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Rn)===null?!1:Rn.x>=0&&Rn.y>=0&&Rn.x+Rn.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Rn)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Rn.x),s.addScaledVector(a,Rn.y),s.addScaledVector(o,Rn.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return Gn.setScalar(0),Kn.setScalar(0),qn.setScalar(0),Gn.fromBufferAttribute(e,t),Kn.fromBufferAttribute(e,n),qn.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Gn,i.x),a.addScaledVector(Kn,i.y),a.addScaledVector(qn,i.z),a}static isFrontFacing(e,t,n,r){return Fn.subVectors(n,t),In.subVectors(e,t),Fn.cross(In).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Fn.subVectors(this.c,this.b),In.subVectors(this.a,this.b),Fn.cross(In).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;zn.subVectors(r,n),Bn.subVectors(i,n),Hn.subVectors(e,n);let s=zn.dot(Hn),c=Bn.dot(Hn);if(s<=0&&c<=0)return t.copy(n);Un.subVectors(e,r);let l=zn.dot(Un),u=Bn.dot(Un);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(zn,a);Wn.subVectors(e,i);let f=zn.dot(Wn),p=Bn.dot(Wn);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Bn,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Vn.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Vn,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(zn,a).addScaledVector(Bn,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Yn=class{constructor(e=new J(1/0,1/0,1/0),t=new J(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Zn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Zn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Zn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Zn):Zn.fromBufferAttribute(r,t),Zn.applyMatrix4(e.matrixWorld),this.expandByPoint(Zn);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Qn.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Qn.copy(e.boundingBox)),Qn.applyMatrix4(e.matrixWorld),this.union(Qn)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Zn),Zn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ar),or.subVectors(this.max,ar),$n.subVectors(e.a,ar),er.subVectors(e.b,ar),tr.subVectors(e.c,ar),nr.subVectors(er,$n),rr.subVectors(tr,er),ir.subVectors($n,tr);let t=[0,-nr.z,nr.y,0,-rr.z,rr.y,0,-ir.z,ir.y,nr.z,0,-nr.x,rr.z,0,-rr.x,ir.z,0,-ir.x,-nr.y,nr.x,0,-rr.y,rr.x,0,-ir.y,ir.x,0];return!lr(t,$n,er,tr,or)||(t=[1,0,0,0,1,0,0,0,1],!lr(t,$n,er,tr,or))?!1:(sr.crossVectors(nr,rr),t=[sr.x,sr.y,sr.z],lr(t,$n,er,tr,or))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Zn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Zn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Xn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Xn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Xn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Xn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Xn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Xn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Xn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Xn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Xn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Xn=[new J,new J,new J,new J,new J,new J,new J,new J],Zn=new J,Qn=new Yn,$n=new J,er=new J,tr=new J,nr=new J,rr=new J,ir=new J,ar=new J,or=new J,sr=new J,cr=new J;function lr(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){cr.fromArray(e,a);let o=i.x*Math.abs(cr.x)+i.y*Math.abs(cr.y)+i.z*Math.abs(cr.z),s=t.dot(cr),c=n.dot(cr),l=r.dot(cr);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var ur=new J,dr=new q,fr=0,pr=class extends et{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:fr++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Ve,this.updateRanges=[],this.gpuType=v,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)dr.fromBufferAttribute(this,t),dr.applyMatrix3(e),this.setXY(t,dr.x,dr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)ur.fromBufferAttribute(this,t),ur.applyMatrix3(e),this.setXYZ(t,ur.x,ur.y,ur.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)ur.fromBufferAttribute(this,t),ur.applyMatrix4(e),this.setXYZ(t,ur.x,ur.y,ur.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ur.fromBufferAttribute(this,t),ur.applyNormalMatrix(e),this.setXYZ(t,ur.x,ur.y,ur.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ur.fromBufferAttribute(this,t),ur.transformDirection(e),this.setXYZ(t,ur.x,ur.y,ur.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=wt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Tt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=wt(t,this.array)),t}setX(e,t){return this.normalized&&(t=Tt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=wt(t,this.array)),t}setY(e,t){return this.normalized&&(t=Tt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=wt(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Tt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=wt(t,this.array)),t}setW(e,t){return this.normalized&&(t=Tt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Tt(t,this.array),n=Tt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=Tt(t,this.array),n=Tt(n,this.array),r=Tt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=Tt(t,this.array),n=Tt(n,this.array),r=Tt(r,this.array),i=Tt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:`dispose`})}},mr=class extends pr{constructor(e,t,n){super(new Uint16Array(e),t,n)}},hr=class extends pr{constructor(e,t,n){super(new Uint32Array(e),t,n)}},gr=class extends pr{constructor(e,t,n){super(new Float32Array(e),t,n)}},_r=new Yn,vr=new J,yr=new J,br=class{constructor(e=new J,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?_r.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;vr.subVectors(e,this.center);let t=vr.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(vr,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(yr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(vr.copy(e.center).add(yr)),this.expandByPoint(vr.copy(e.center).sub(yr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},xr=0,Sr=new Zt,Cr=new Tn,wr=new J,Tr=new Yn,Er=new Yn,Dr=new J,Or=class e extends et{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:xr++}),this.uuid=at(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ue(e)?hr:mr)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new At().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Sr.makeRotationFromQuaternion(e),this.applyMatrix4(Sr),this}rotateX(e){return Sr.makeRotationX(e),this.applyMatrix4(Sr),this}rotateY(e){return Sr.makeRotationY(e),this.applyMatrix4(Sr),this}rotateZ(e){return Sr.makeRotationZ(e),this.applyMatrix4(Sr),this}translate(e,t,n){return Sr.makeTranslation(e,t,n),this.applyMatrix4(Sr),this}scale(e,t,n){return Sr.makeScale(e,t,n),this.applyMatrix4(Sr),this}lookAt(e){return Cr.lookAt(e),Cr.updateMatrix(),this.applyMatrix4(Cr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(wr).negate(),this.translate(wr.x,wr.y,wr.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new gr(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&W(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Yn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){G(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new J(-1/0,-1/0,-1/0),new J(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Tr.setFromBufferAttribute(n),this.morphTargetsRelative?(Dr.addVectors(this.boundingBox.min,Tr.min),this.boundingBox.expandByPoint(Dr),Dr.addVectors(this.boundingBox.max,Tr.max),this.boundingBox.expandByPoint(Dr)):(this.boundingBox.expandByPoint(Tr.min),this.boundingBox.expandByPoint(Tr.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&G(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new br);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){G(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new J,1/0);return}if(e){let n=this.boundingSphere.center;if(Tr.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Er.setFromBufferAttribute(n),this.morphTargetsRelative?(Dr.addVectors(Tr.min,Er.min),Tr.expandByPoint(Dr),Dr.addVectors(Tr.max,Er.max),Tr.expandByPoint(Dr)):(Tr.expandByPoint(Er.min),Tr.expandByPoint(Er.max))}Tr.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Dr.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Dr));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Dr.fromBufferAttribute(a,t),o&&(wr.fromBufferAttribute(e,t),Dr.add(wr)),r=Math.max(r,n.distanceToSquared(Dr))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&G(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){G(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv;this.hasAttribute(`tangent`)===!1&&this.setAttribute(`tangent`,new pr(new Float32Array(4*n.count),4));let a=this.getAttribute(`tangent`),o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new J,s[e]=new J;let c=new J,l=new J,u=new J,d=new q,f=new q,p=new q,m=new J,h=new J;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new J,y=new J,b=new J,x=new J;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0)n=new pr(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new J,i=new J,a=new J,o=new J,s=new J,c=new J,l=new J,u=new J;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Dr.fromBufferAttribute(e,t),Dr.normalize(),e.setXYZ(t,Dr.x,Dr.y,Dr.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new pr(a,r,i)}if(this.index===null)return W(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:`dispose`})}},kr=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=Ve,this.updateRanges=[],this.version=0,this.uuid=at()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=at()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=at()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Ar=new J,jr=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Ar.fromBufferAttribute(this,t),Ar.applyMatrix4(e),this.setXYZ(t,Ar.x,Ar.y,Ar.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ar.fromBufferAttribute(this,t),Ar.applyNormalMatrix(e),this.setXYZ(t,Ar.x,Ar.y,Ar.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ar.fromBufferAttribute(this,t),Ar.transformDirection(e),this.setXYZ(t,Ar.x,Ar.y,Ar.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=wt(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Tt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Tt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=wt(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=wt(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=wt(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=wt(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Tt(t,this.array),n=Tt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Tt(t,this.array),n=Tt(n,this.array),r=Tt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Tt(t,this.array),n=Tt(n,this.array),r=Tt(r,this.array),i=Tt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){Ye(`InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new pr(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Ye(`InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Mr=0,Nr=class extends et{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Mr++}),this.uuid=at(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Y(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Be,this.stencilZFail=Be,this.stencilZPass=Be,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){W(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){W(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,this.name!==``&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Pr=class extends Nr{constructor(e){super(),this.isSpriteMaterial=!0,this.type=`SpriteMaterial`,this.color=new Y(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Fr,Ir=new J,Lr=new J,Rr=new J,zr=new q,Br=new q,Vr=new Zt,Hr=new J,Ur=new J,Wr=new J,Gr=new q,Kr=new q,qr=new q,Jr=class extends Tn{constructor(e=new Pr){if(super(),this.isSprite=!0,this.type=`Sprite`,Fr===void 0){Fr=new Or;let e=new kr(new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),5);Fr.setIndex([0,1,2,0,2,3]),Fr.setAttribute(`position`,new jr(e,3,0,!1)),Fr.setAttribute(`uv`,new jr(e,2,3,!1))}this.geometry=Fr,this.material=e,this.center=new q(.5,.5),this.count=1}raycast(e,t){e.camera===null&&G(`Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.`),Lr.setFromMatrixScale(this.matrixWorld),Vr.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Rr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Lr.multiplyScalar(-Rr.z);let n=this.material.rotation,r,i;n!==0&&(i=Math.cos(n),r=Math.sin(n));let a=this.center;Yr(Hr.set(-.5,-.5,0),Rr,a,Lr,r,i),Yr(Ur.set(.5,-.5,0),Rr,a,Lr,r,i),Yr(Wr.set(.5,.5,0),Rr,a,Lr,r,i),Gr.set(0,0),Kr.set(1,0),qr.set(1,1);let o=e.ray.intersectTriangle(Hr,Ur,Wr,!1,Ir);if(o===null&&(Yr(Ur.set(-.5,.5,0),Rr,a,Lr,r,i),Kr.set(0,1),o=e.ray.intersectTriangle(Hr,Wr,Ur,!1,Ir),o===null))return;let s=e.ray.origin.distanceTo(Ir);s<e.near||s>e.far||t.push({distance:s,point:Ir.clone(),uv:Jn.getInterpolation(Ir,Hr,Ur,Wr,Gr,Kr,qr,new q),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Yr(e,t,n,r,i,a){zr.subVectors(e,n).addScalar(.5).multiply(r),i===void 0?Br.copy(zr):(Br.x=a*zr.x-i*zr.y,Br.y=i*zr.x+a*zr.y),e.copy(t),e.x+=Br.x,e.y+=Br.y,e.applyMatrix4(Vr)}var Xr=new J,Zr=new J,Qr=new J,$r=new J,ei=new J,ti=new J,ni=new J,ri=class{constructor(e=new J,t=new J(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Xr)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Xr.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Xr.copy(this.origin).addScaledVector(this.direction,t),Xr.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){Zr.copy(e).add(t).multiplyScalar(.5),Qr.copy(t).sub(e).normalize(),$r.copy(this.origin).sub(Zr);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Qr),o=$r.dot(this.direction),s=-$r.dot(Qr),c=$r.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0)if(u=a*s-o,d=a*o-s,p=i*l,u>=0)if(d>=-p)if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c);else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(Zr).addScaledVector(Qr,d),f}intersectSphere(e,t){Xr.subVectors(e.center,this.origin);let n=Xr.dot(this.direction),r=Xr.dot(Xr)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Xr)!==null}intersectTriangle(e,t,n,r,i){ei.subVectors(t,e),ti.subVectors(n,e),ni.crossVectors(ei,ti);let a=this.direction.dot(ni),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;$r.subVectors(this.origin,e);let s=o*this.direction.dot(ti.crossVectors($r,ti));if(s<0)return null;let c=o*this.direction.dot(ei.cross($r));if(c<0||s+c>a)return null;let l=-o*$r.dot(ni);return l<0?null:this.at(l/a,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ii=class extends Nr{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new Y(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new cn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},ai=new Zt,oi=new ri,si=new br,ci=new J,li=new J,ui=new J,di=new J,fi=new J,pi=new J,mi=new J,hi=new J,X=class extends Tn{constructor(e=new Or,t=new ii){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){pi.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(fi.fromBufferAttribute(s,e),a?pi.addScaledVector(fi,r):pi.addScaledVector(fi.sub(t),r))}t.add(pi)}return t}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),si.copy(n.boundingSphere),si.applyMatrix4(i),oi.copy(e.ray).recast(e.near),!(si.containsPoint(oi.origin)===!1&&(oi.intersectSphere(si,ci)===null||oi.origin.distanceToSquared(ci)>(e.far-e.near)**2))&&(ai.copy(i).invert(),oi.copy(e.ray).applyMatrix4(ai),!(n.boundingBox!==null&&oi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,oi)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null)if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=_i(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=_i(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}else if(s!==void 0)if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=_i(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=_i(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}};function gi(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;hi.copy(s),hi.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(hi);return l<n.near||l>n.far?null:{distance:l,point:hi.clone(),object:e}}function _i(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,li),e.getVertexPosition(c,ui),e.getVertexPosition(l,di);let u=gi(e,t,n,r,li,ui,di,mi);if(u){let e=new J;Jn.getBarycoord(mi,li,ui,di,e),i&&(u.uv=Jn.getInterpolatedAttribute(i,s,c,l,e,new q)),a&&(u.uv1=Jn.getInterpolatedAttribute(a,s,c,l,e,new q)),o&&(u.normal=Jn.getInterpolatedAttribute(o,s,c,l,e,new J),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new J,materialIndex:0};Jn.getNormal(li,ui,di,t.normal),u.face=t,u.barycoord=e}return u}var vi=new Kt,yi=new Kt,bi=new Kt,xi=new Kt,Si=new Zt,Ci=new J,wi=new br,Ti=new Zt,Ei=new ri,Di=class extends X{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type=`SkinnedMesh`,this.bindMode=n,this.bindMatrix=new Zt,this.bindMatrixInverse=new Zt,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Yn),this.boundingBox.makeEmpty();let t=e.getAttribute(`position`);for(let e=0;e<t.count;e++)this.getVertexPosition(e,Ci),this.boundingBox.expandByPoint(Ci)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new br),this.boundingSphere.makeEmpty();let t=e.getAttribute(`position`);for(let e=0;e<t.count;e++)this.getVertexPosition(e,Ci),this.boundingSphere.expandByPoint(Ci)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,r=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),wi.copy(this.boundingSphere),wi.applyMatrix4(r),e.ray.intersectsSphere(wi)!==!1&&(Ti.copy(r).invert(),Ei.copy(e.ray).applyMatrix4(Ti),!(this.boundingBox!==null&&Ei.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Ei)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new Kt,t=this.geometry.attributes.skinWeight;for(let n=0,r=t.count;n<r;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r===1/0?e.set(1,0,0,0):e.multiplyScalar(r),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===`attached`?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===`detached`?this.bindMatrixInverse.copy(this.bindMatrix).invert():W(`SkinnedMesh: Unrecognized bindMode: `+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,r=this.geometry;yi.fromBufferAttribute(r.attributes.skinIndex,e),bi.fromBufferAttribute(r.attributes.skinWeight,e),t.isVector4?(vi.copy(t),t.set(0,0,0,0)):(vi.set(...t,1),t.set(0,0,0)),vi.applyMatrix4(this.bindMatrix);for(let e=0;e<4;e++){let r=bi.getComponent(e);if(r!==0){let i=yi.getComponent(e);Si.multiplyMatrices(n.bones[i].matrixWorld,n.boneInverses[i]),t.addScaledVector(xi.copy(vi).applyMatrix4(Si),r)}}return t.isVector4&&(t.w=vi.w),t.applyMatrix4(this.bindMatrixInverse)}},Oi=class extends Tn{constructor(){super(),this.isBone=!0,this.type=`Bone`}},ki=class extends Gt{constructor(e=null,t=1,n=1,r,i,a,s,c,l=o,u=o,d,f){super(null,a,s,c,l,u,r,i,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Ai=new Zt,ji=new Zt,Mi=class e{constructor(e=[],t=[]){this.uuid=at(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){W(`Skeleton: Number of inverse bone matrices does not match amount of bones.`),this.boneInverses=[];for(let e=0,t=this.bones.length;e<t;e++)this.boneInverses.push(new Zt)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let t=new Zt;this.bones[e]&&t.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(t)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let t=this.bones[e];t&&t.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let t=this.bones[e];t&&(t.parent&&t.parent.isBone?(t.matrix.copy(t.parent.matrixWorld).invert(),t.matrix.multiply(t.matrixWorld)):t.matrix.copy(t.matrixWorld),t.matrix.decompose(t.position,t.quaternion,t.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,r=this.boneTexture;for(let r=0,i=e.length;r<i;r++){let i=e[r]?e[r].matrixWorld:ji;Ai.multiplyMatrices(i,t[r]),Ai.toArray(n,r*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new e(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new ki(t,e,e,D,v);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let n=this.bones[t];if(n.name===e)return n}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,r=e.bones.length;n<r;n++){let r=e.bones[n],i=t[r];i===void 0&&(W(`Skeleton: No bone found with UUID:`,r),i=new Oi),this.bones.push(i),this.boneInverses.push(new Zt().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:`Skeleton`,generator:`Skeleton.toJSON`},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let r=0,i=t.length;r<i;r++){let i=t[r];e.bones.push(i.uuid);let a=n[r];e.boneInverses.push(a.toArray())}return e}},Ni=class extends pr{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Pi=new Zt,Fi=new Zt,Ii=[],Li=new Yn,Ri=new Zt,zi=new X,Bi=new br,Vi=class extends X{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Ni(new Float32Array(n*16),16),this.previousInstanceMatrix=null,this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,Ri)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Yn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Pi),Li.copy(e.boundingBox).applyMatrix4(Pi),this.boundingBox.union(Li)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new br),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Pi),Bi.copy(e.boundingSphere).applyMatrix4(Pi),this.boundingSphere.union(Bi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.previousInstanceMatrix!==null&&(this.previousInstanceMatrix=e.previousInstanceMatrix.clone()),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(zi.geometry=this.geometry,zi.material=this.material,zi.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Bi.copy(this.boundingSphere),Bi.applyMatrix4(n),e.ray.intersectsSphere(Bi)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,Pi),Fi.multiplyMatrices(n,Pi),zi.matrixWorld=Fi,zi.raycast(e,Ii);for(let e=0,n=Ii.length;e<n;e++){let n=Ii[e];n.instanceId=i,n.object=this,t.push(n)}Ii.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Ni(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new ki(new Float32Array(r*this.count),r,this.count,A,v));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){this.dispatchEvent({type:`dispose`}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Hi=new J,Ui=new J,Wi=new At,Gi=class{constructor(e=new J(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=Hi.subVectors(n,t).cross(Ui.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(Hi),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Wi.getNormalMatrix(e),r=this.coplanarPoint(Hi).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Ki=new br,qi=new q(.5,.5),Ji=new J,Yi=class{constructor(e=new Gi,t=new Gi,n=new Gi,r=new Gi,i=new Gi,a=new Gi){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=He,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ki.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ki.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ki)}intersectsSprite(e){return Ki.center.set(0,0,0),Ki.radius=.7071067811865476+qi.distanceTo(e.center),Ki.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ki)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(Ji.x=r.normal.x>0?e.max.x:e.min.x,Ji.y=r.normal.y>0?e.max.y:e.min.y,Ji.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Ji)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Xi=class extends Nr{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new Y(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Zi=new J,Qi=new J,$i=new Zt,ea=new ri,ta=new br,na=new J,ra=new J,ia=class extends Tn{constructor(e=new Or,t=new Xi){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)Zi.fromBufferAttribute(t,e-1),Qi.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=Zi.distanceTo(Qi);e.setAttribute(`lineDistance`,new gr(n,1))}else W(`Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ta.copy(n.boundingSphere),ta.applyMatrix4(r),ta.radius+=i,e.ray.intersectsSphere(ta)===!1)return;$i.copy(r).invert(),ea.copy(e.ray).applyMatrix4($i);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=aa(this,e,ea,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=aa(this,e,ea,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=aa(this,e,ea,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=aa(this,e,ea,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function aa(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(Zi.fromBufferAttribute(s,i),Qi.fromBufferAttribute(s,a),n.distanceSqToSegment(Zi,Qi,na,ra)>r)return;na.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(na);if(!(c<t.near||c>t.far))return{distance:c,point:ra.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var oa=new J,sa=new J,ca=class extends ia{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)oa.fromBufferAttribute(t,e),sa.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+oa.distanceTo(sa);e.setAttribute(`lineDistance`,new gr(n,1))}else W(`LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},la=class extends ia{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type=`LineLoop`}},ua=class extends Nr{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new Y(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},da=new Zt,fa=new ri,pa=new br,ma=new J,ha=class extends Tn{constructor(e=new Or,t=new ua){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),pa.copy(n.boundingSphere),pa.applyMatrix4(r),pa.radius+=i,e.ray.intersectsSphere(pa)===!1)return;da.copy(r).invert(),fa.copy(e.ray).applyMatrix4(da);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);ma.fromBufferAttribute(l,n),ga(ma,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)ma.fromBufferAttribute(l,a),ga(ma,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function ga(e,t,n,r,i,a,o){let s=fa.distanceSqToPoint(e);if(s<n){let n=new J;fa.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var _a=class extends Gt{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},va=class extends Gt{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},ya=class extends Gt{constructor(e,t,n=_,r,i,a,s=o,c=o,l,u=O,d=1){if(u!==1026&&u!==1027)throw Error(`DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:d},r,i,a,s,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Vt(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},ba=class extends ya{constructor(e,t=_,n=301,r,i,a=o,s=o,c,l=O){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,r,i,a,s,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},xa=class extends Gt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Sa=class e extends Or{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new gr(c,3)),this.setAttribute(`normal`,new gr(l,3)),this.setAttribute(`uv`,new gr(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new J;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},Ca=class e extends Or{constructor(e=1,t=1,n=4,r=8,i=1){super(),this.type=`CapsuleGeometry`,this.parameters={radius:e,height:t,capSegments:n,radialSegments:r,heightSegments:i},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),r=Math.max(3,Math.floor(r)),i=Math.max(1,Math.floor(i));let a=[],o=[],s=[],c=[],l=t/2,u=Math.PI/2*e,d=t,f=2*u+d,p=n*2+i,m=r+1,h=new J,g=new J;for(let _=0;_<=p;_++){let v=0,y=0,b=0,x=0;if(_<=n){let t=_/n,r=t*Math.PI/2;y=-l-e*Math.cos(r),b=e*Math.sin(r),x=-e*Math.cos(r),v=t*u}else if(_<=n+i){let r=(_-n)/i;y=-l+r*t,b=e,x=0,v=u+r*d}else{let t=(_-n-i)/n,r=t*Math.PI/2;y=l+e*Math.sin(r),b=e*Math.cos(r),x=e*Math.sin(r),v=u+d+t*u}let S=Math.max(0,Math.min(1,v/f)),C=0;_===0?C=.5/r:_===p&&(C=-.5/r);for(let e=0;e<=r;e++){let t=e/r,n=t*Math.PI*2,i=Math.sin(n),a=Math.cos(n);g.x=-b*a,g.y=y,g.z=b*i,o.push(g.x,g.y,g.z),h.set(-b*a,x,b*i),h.normalize(),s.push(h.x,h.y,h.z),c.push(t+C,S)}if(_>0){let e=(_-1)*m;for(let t=0;t<r;t++){let n=e+t,r=e+t+1,i=_*m+t,o=_*m+t+1;a.push(n,r,i),a.push(r,o,i)}}}this.setIndex(a),this.setAttribute(`position`,new gr(o,3)),this.setAttribute(`normal`,new gr(s,3)),this.setAttribute(`uv`,new gr(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},wa=class e extends Or{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new J,l=new q;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new gr(a,3)),this.setAttribute(`normal`,new gr(o,3)),this.setAttribute(`uv`,new gr(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Ta=class e extends Or{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new gr(u,3)),this.setAttribute(`normal`,new gr(d,3)),this.setAttribute(`uv`,new gr(f,2));function _(){let a=new J,_=new J,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new q,m=new J,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Ea=class e extends Ta{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Da=class e extends Or{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new gr(i,3)),this.setAttribute(`normal`,new gr(i.slice(),3)),this.setAttribute(`uv`,new gr(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new J,r=new J,i=new J;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new J;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new J;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new J,t=new J,n=new J,r=new J,o=new q,s=new q,c=new q;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},Oa=class{constructor(){this.type=`Curve`,this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){W(`Curve: .getPoint() not implemented.`)}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,r=this.getPoint(0),i=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),i+=n.distanceTo(r),t.push(i),r=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),r=0,i=n.length,a;a=t||e*n[i-1];let o=0,s=i-1,c;for(;o<=s;)if(r=Math.floor(o+(s-o)/2),c=n[r]-a,c<0)o=r+1;else if(c>0)s=r-1;else{s=r;break}if(r=s,n[r]===a)return r/(i-1);let l=n[r],u=n[r+1]-l,d=(a-l)/u;return(r+d)/(i-1)}getTangent(e,t){let n=1e-4,r=e-n,i=e+n;r<0&&(r=0),i>1&&(i=1);let a=this.getPoint(r),o=this.getPoint(i),s=t||(a.isVector2?new q:new J);return s.copy(o).sub(a).normalize(),s}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new J,r=[],i=[],a=[],o=new J,s=new Zt;for(let t=0;t<=e;t++){let n=t/e;r[t]=this.getTangentAt(n,new J)}i[0]=new J,a[0]=new J;let c=Number.MAX_VALUE,l=Math.abs(r[0].x),u=Math.abs(r[0].y),d=Math.abs(r[0].z);l<=c&&(c=l,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),o.crossVectors(r[0],n).normalize(),i[0].crossVectors(r[0],o),a[0].crossVectors(r[0],i[0]);for(let t=1;t<=e;t++){if(i[t]=i[t-1].clone(),a[t]=a[t-1].clone(),o.crossVectors(r[t-1],r[t]),o.length()>2**-52){o.normalize();let e=Math.acos(ot(r[t-1].dot(r[t]),-1,1));i[t].applyMatrix4(s.makeRotationAxis(o,e))}a[t].crossVectors(r[t],i[t])}if(t===!0){let t=Math.acos(ot(i[0].dot(i[e]),-1,1));t/=e,r[0].dot(o.crossVectors(i[0],i[e]))>0&&(t=-t);for(let n=1;n<=e;n++)i[n].applyMatrix4(s.makeRotationAxis(r[n],t*n)),a[n].crossVectors(r[n],i[n])}return{tangents:r,normals:i,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:`Curve`,generator:`Curve.toJSON`}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},ka=class extends Oa{constructor(e=0,t=0,n=1,r=1,i=0,a=Math.PI*2,o=!1,s=0){super(),this.isEllipseCurve=!0,this.type=`EllipseCurve`,this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=r,this.aStartAngle=i,this.aEndAngle=a,this.aClockwise=o,this.aRotation=s}getPoint(e,t=new q){let n=t,r=Math.PI*2,i=this.aEndAngle-this.aStartAngle,a=Math.abs(i)<2**-52;for(;i<0;)i+=r;for(;i>r;)i-=r;i<2**-52&&(i=a?0:r),this.aClockwise===!0&&!a&&(i===r?i=-r:i-=r);let o=this.aStartAngle+e*i,s=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let e=Math.cos(this.aRotation),t=Math.sin(this.aRotation),n=s-this.aX,r=c-this.aY;s=n*e-r*t+this.aX,c=n*t+r*e+this.aY}return n.set(s,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Aa=class extends ka{constructor(e,t,n,r,i,a){super(e,t,n,n,r,i,a),this.isArcCurve=!0,this.type=`ArcCurve`}};function ja(){let e=0,t=0,n=0,r=0;function i(i,a,o,s){e=i,t=o,n=-3*i+3*a-2*o-s,r=2*i-2*a+o+s}return{initCatmullRom:function(e,t,n,r,a){i(t,n,a*(n-e),a*(r-t))},initNonuniformCatmullRom:function(e,t,n,r,a,o,s){let c=(t-e)/a-(n-e)/(a+o)+(n-t)/o,l=(n-t)/o-(r-t)/(o+s)+(r-n)/s;c*=o,l*=o,i(t,n,c,l)},calc:function(i){let a=i*i,o=a*i;return e+t*i+n*a+r*o}}}var Ma=new J,Na=new J,Pa=new ja,Fa=new ja,Ia=new ja,La=class extends Oa{constructor(e=[],t=!1,n=`centripetal`,r=.5){super(),this.isCatmullRomCurve3=!0,this.type=`CatmullRomCurve3`,this.points=e,this.closed=t,this.curveType=n,this.tension=r}getPoint(e,t=new J){let n=t,r=this.points,i=r.length,a=(i-+!this.closed)*e,o=Math.floor(a),s=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/i)+1)*i:s===0&&o===i-1&&(o=i-2,s=1);let c,l;this.closed||o>0?c=r[(o-1)%i]:(Na.subVectors(r[0],r[1]).add(r[0]),c=Na);let u=r[o%i],d=r[(o+1)%i];if(this.closed||o+2<i?l=r[(o+2)%i]:(Ma.subVectors(r[i-1],r[i-2]).add(r[i-1]),l=Ma),this.curveType===`centripetal`||this.curveType===`chordal`){let e=this.curveType===`chordal`?.5:.25,t=c.distanceToSquared(u)**+e,n=u.distanceToSquared(d)**+e,r=d.distanceToSquared(l)**+e;n<1e-4&&(n=1),t<1e-4&&(t=n),r<1e-4&&(r=n),Pa.initNonuniformCatmullRom(c.x,u.x,d.x,l.x,t,n,r),Fa.initNonuniformCatmullRom(c.y,u.y,d.y,l.y,t,n,r),Ia.initNonuniformCatmullRom(c.z,u.z,d.z,l.z,t,n,r)}else this.curveType===`catmullrom`&&(Pa.initCatmullRom(c.x,u.x,d.x,l.x,this.tension),Fa.initCatmullRom(c.y,u.y,d.y,l.y,this.tension),Ia.initCatmullRom(c.z,u.z,d.z,l.z,this.tension));return n.set(Pa.calc(s),Fa.calc(s),Ia.calc(s)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new J().fromArray(n))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Ra(e,t,n,r,i){let a=(r-t)*.5,o=(i-n)*.5,s=e*e,c=e*s;return(2*n-2*r+a+o)*c+(-3*n+3*r-2*a-o)*s+a*e+n}function za(e,t){let n=1-e;return n*n*t}function Ba(e,t){return 2*(1-e)*e*t}function Va(e,t){return e*e*t}function Ha(e,t,n,r){return za(e,t)+Ba(e,n)+Va(e,r)}function Ua(e,t){let n=1-e;return n*n*n*t}function Wa(e,t){let n=1-e;return 3*n*n*e*t}function Ga(e,t){return 3*(1-e)*e*e*t}function Ka(e,t){return e*e*e*t}function qa(e,t,n,r,i){return Ua(e,t)+Wa(e,n)+Ga(e,r)+Ka(e,i)}var Ja=class extends Oa{constructor(e=new q,t=new q,n=new q,r=new q){super(),this.isCubicBezierCurve=!0,this.type=`CubicBezierCurve`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new q){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(qa(e,r.x,i.x,a.x,o.x),qa(e,r.y,i.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Ya=class extends Oa{constructor(e=new J,t=new J,n=new J,r=new J){super(),this.isCubicBezierCurve3=!0,this.type=`CubicBezierCurve3`,this.v0=e,this.v1=t,this.v2=n,this.v3=r}getPoint(e,t=new J){let n=t,r=this.v0,i=this.v1,a=this.v2,o=this.v3;return n.set(qa(e,r.x,i.x,a.x,o.x),qa(e,r.y,i.y,a.y,o.y),qa(e,r.z,i.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Xa=class extends Oa{constructor(e=new q,t=new q){super(),this.isLineCurve=!0,this.type=`LineCurve`,this.v1=e,this.v2=t}getPoint(e,t=new q){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new q){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Za=class extends Oa{constructor(e=new J,t=new J){super(),this.isLineCurve3=!0,this.type=`LineCurve3`,this.v1=e,this.v2=t}getPoint(e,t=new J){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new J){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Qa=class extends Oa{constructor(e=new q,t=new q,n=new q){super(),this.isQuadraticBezierCurve=!0,this.type=`QuadraticBezierCurve`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new q){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(Ha(e,r.x,i.x,a.x),Ha(e,r.y,i.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},$a=class extends Oa{constructor(e=new J,t=new J,n=new J){super(),this.isQuadraticBezierCurve3=!0,this.type=`QuadraticBezierCurve3`,this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new J){let n=t,r=this.v0,i=this.v1,a=this.v2;return n.set(Ha(e,r.x,i.x,a.x),Ha(e,r.y,i.y,a.y),Ha(e,r.z,i.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},eo=class extends Oa{constructor(e=[]){super(),this.isSplineCurve=!0,this.type=`SplineCurve`,this.points=e}getPoint(e,t=new q){let n=t,r=this.points,i=(r.length-1)*e,a=Math.floor(i),o=i-a,s=r[a===0?a:a-1],c=r[a],l=r[a>r.length-2?r.length-1:a+1],u=r[a>r.length-3?r.length-1:a+2];return n.set(Ra(o,s.x,c.x,l.x,u.x),Ra(o,s.y,c.y,l.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let n=this.points[t];e.points.push(n.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let n=e.points[t];this.points.push(new q().fromArray(n))}return this}},to=Object.freeze({__proto__:null,ArcCurve:Aa,CatmullRomCurve3:La,CubicBezierCurve:Ja,CubicBezierCurve3:Ya,EllipseCurve:ka,LineCurve:Xa,LineCurve3:Za,QuadraticBezierCurve:Qa,QuadraticBezierCurve3:$a,SplineCurve:eo}),no=class extends Oa{constructor(){super(),this.type=`CurvePath`,this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?`LineCurve`:`LineCurve3`;this.curves.push(new to[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),r=this.getCurveLengths(),i=0;for(;i<r.length;){if(r[i]>=n){let e=r[i]-n,a=this.curves[i],o=a.getLength(),s=o===0?0:1-e/o;return a.getPointAt(s,t)}i++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,r=this.curves.length;n<r;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let r=0,i=this.curves;r<i.length;r++){let a=i[r],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,s=a.getPoints(o);for(let e=0;e<s.length;e++){let r=s[e];n&&n.equals(r)||(t.push(r),n=r)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(n.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let n=this.curves[t];e.curves.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let n=e.curves[t];this.curves.push(new to[n.type]().fromJSON(n))}return this}},ro=class extends no{constructor(e){super(),this.type=`Path`,this.currentPoint=new q,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Xa(this.currentPoint.clone(),new q(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,r){let i=new Qa(this.currentPoint.clone(),new q(e,t),new q(n,r));return this.curves.push(i),this.currentPoint.set(n,r),this}bezierCurveTo(e,t,n,r,i,a){let o=new Ja(this.currentPoint.clone(),new q(e,t),new q(n,r),new q(i,a));return this.curves.push(o),this.currentPoint.set(i,a),this}splineThru(e){let t=new eo([this.currentPoint.clone()].concat(e));return this.curves.push(t),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,r,i,a){let o=this.currentPoint.x,s=this.currentPoint.y;return this.absarc(e+o,t+s,n,r,i,a),this}absarc(e,t,n,r,i,a){return this.absellipse(e,t,n,n,r,i,a),this}ellipse(e,t,n,r,i,a,o,s){let c=this.currentPoint.x,l=this.currentPoint.y;return this.absellipse(e+c,t+l,n,r,i,a,o,s),this}absellipse(e,t,n,r,i,a,o,s){let c=new ka(e,t,n,r,i,a,o,s);if(this.curves.length>0){let e=c.getPoint(0);e.equals(this.currentPoint)||this.lineTo(e.x,e.y)}this.curves.push(c);let l=c.getPoint(1);return this.currentPoint.copy(l),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},io=class extends ro{constructor(e){super(e),this.uuid=at(),this.type=`Shape`,this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,r=this.holes.length;n<r;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(n.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let n=this.holes[t];e.holes.push(n.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let n=e.holes[t];this.holes.push(new ro().fromJSON(n))}return this}};function ao(e,t,n=2){let r=t&&t.length,i=r?t[0]*n:e.length,a=oo(e,0,i,n,!0),o=[];if(!a||a.next===a.prev)return o;let s,c,l;if(r&&(a=mo(e,t,a,n)),e.length>80*n){s=e[0],c=e[1];let t=s,r=c;for(let a=n;a<i;a+=n){let n=e[a],i=e[a+1];n<s&&(s=n),i<c&&(c=i),n>t&&(t=n),i>r&&(r=i)}l=Math.max(t-s,r-c),l=l===0?0:32767/l}return co(a,o,n,s,c,l,0),o}function oo(e,t,n,r,i){let a;if(i===Ro(e,t,n,r)>0)for(let i=t;i<n;i+=r)a=Fo(i/r|0,e[i],e[i+1],a);else for(let i=n-r;i>=t;i-=r)a=Fo(i/r|0,e[i],e[i+1],a);return a&&Do(a,a.next)&&(Io(a),a=a.next),a}function so(e,t){if(!e)return e;t||=e;let n=e,r;do if(r=!1,!n.steiner&&(Do(n,n.next)||Eo(n.prev,n,n.next)===0)){if(Io(n),n=t=n.prev,n===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function co(e,t,n,r,i,a,o){if(!e)return;!o&&a&&yo(e,r,i,a);let s=e;for(;e.prev!==e.next;){let c=e.prev,l=e.next;if(a?uo(e,r,i,a):lo(e)){t.push(c.i,e.i,l.i),Io(e),e=l.next,s=l.next;continue}if(e=l,e===s){o?o===1?(e=fo(so(e),t),co(e,t,n,r,i,a,2)):o===2&&po(e,t,n,r,i,a):co(so(e),t,n,r,i,a,1);break}}}function lo(e){let t=e.prev,n=e,r=e.next;if(Eo(t,n,r)>=0)return!1;let i=t.x,a=n.x,o=r.x,s=t.y,c=n.y,l=r.y,u=Math.min(i,a,o),d=Math.min(s,c,l),f=Math.max(i,a,o),p=Math.max(s,c,l),m=r.next;for(;m!==t;){if(m.x>=u&&m.x<=f&&m.y>=d&&m.y<=p&&wo(i,s,a,c,o,l,m.x,m.y)&&Eo(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function uo(e,t,n,r){let i=e.prev,a=e,o=e.next;if(Eo(i,a,o)>=0)return!1;let s=i.x,c=a.x,l=o.x,u=i.y,d=a.y,f=o.y,p=Math.min(s,c,l),m=Math.min(u,d,f),h=Math.max(s,c,l),g=Math.max(u,d,f),_=xo(p,m,t,n,r),v=xo(h,g,t,n,r),y=e.prevZ,b=e.nextZ;for(;y&&y.z>=_&&b&&b.z<=v;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&wo(s,u,c,d,l,f,y.x,y.y)&&Eo(y.prev,y,y.next)>=0||(y=y.prevZ,b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&wo(s,u,c,d,l,f,b.x,b.y)&&Eo(b.prev,b,b.next)>=0))return!1;b=b.nextZ}for(;y&&y.z>=_;){if(y.x>=p&&y.x<=h&&y.y>=m&&y.y<=g&&y!==i&&y!==o&&wo(s,u,c,d,l,f,y.x,y.y)&&Eo(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;b&&b.z<=v;){if(b.x>=p&&b.x<=h&&b.y>=m&&b.y<=g&&b!==i&&b!==o&&wo(s,u,c,d,l,f,b.x,b.y)&&Eo(b.prev,b,b.next)>=0)return!1;b=b.nextZ}return!0}function fo(e,t){let n=e;do{let r=n.prev,i=n.next.next;!Do(r,i)&&Oo(r,n,n.next,i)&&Mo(r,i)&&Mo(i,r)&&(t.push(r.i,n.i,i.i),Io(n),Io(n.next),n=e=i),n=n.next}while(n!==e);return so(n)}function po(e,t,n,r,i,a){let o=e;do{let e=o.next.next;for(;e!==o.prev;){if(o.i!==e.i&&To(o,e)){let s=Po(o,e);o=so(o,o.next),s=so(s,s.next),co(o,t,n,r,i,a,0),co(s,t,n,r,i,a,0);return}e=e.next}o=o.next}while(o!==e)}function mo(e,t,n,r){let i=[];for(let n=0,a=t.length;n<a;n++){let o=oo(e,t[n]*r,n<a-1?t[n+1]*r:e.length,r,!1);o===o.next&&(o.steiner=!0),i.push(So(o))}i.sort(ho);for(let e=0;e<i.length;e++)n=go(i[e],n);return n}function ho(e,t){let n=e.x-t.x;return n===0&&(n=e.y-t.y,n===0&&(n=(e.next.y-e.y)/(e.next.x-e.x)-(t.next.y-t.y)/(t.next.x-t.x))),n}function go(e,t){let n=_o(e,t);if(!n)return t;let r=Po(n,e);return so(r,r.next),so(n,n.next)}function _o(e,t){let n=t,r=e.x,i=e.y,a=-1/0,o;if(Do(e,n))return n;do{if(Do(e,n.next))return n.next;if(i<=n.y&&i>=n.next.y&&n.next.y!==n.y){let e=n.x+(i-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(e<=r&&e>a&&(a=e,o=n.x<n.next.x?n:n.next,e===r))return o}n=n.next}while(n!==t);if(!o)return null;let s=o,c=o.x,l=o.y,u=1/0;n=o;do{if(r>=n.x&&n.x>=c&&r!==n.x&&Co(i<l?r:a,i,c,l,i<l?a:r,i,n.x,n.y)){let t=Math.abs(i-n.y)/(r-n.x);Mo(n,e)&&(t<u||t===u&&(n.x>o.x||n.x===o.x&&vo(o,n)))&&(o=n,u=t)}n=n.next}while(n!==s);return o}function vo(e,t){return Eo(e.prev,e,t.prev)<0&&Eo(t.next,e,e.next)<0}function yo(e,t,n,r){let i=e;do i.z===0&&(i.z=xo(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,bo(i)}function bo(e){let t,n=1;do{let r=e,i;e=null;let a=null;for(t=0;r;){t++;let o=r,s=0;for(let e=0;e<n&&(s++,o=o.nextZ,o);e++);let c=n;for(;s>0||c>0&&o;)s!==0&&(c===0||!o||r.z<=o.z)?(i=r,r=r.nextZ,s--):(i=o,o=o.nextZ,c--),a?a.nextZ=i:e=i,i.prevZ=a,a=i;r=o}a.nextZ=null,n*=2}while(t>1);return e}function xo(e,t,n,r,i){return e=(e-n)*i|0,t=(t-r)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function So(e){let t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function Co(e,t,n,r,i,a,o,s){return(i-o)*(t-s)>=(e-o)*(a-s)&&(e-o)*(r-s)>=(n-o)*(t-s)&&(n-o)*(a-s)>=(i-o)*(r-s)}function wo(e,t,n,r,i,a,o,s){return!(e===o&&t===s)&&Co(e,t,n,r,i,a,o,s)}function To(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!jo(e,t)&&(Mo(e,t)&&Mo(t,e)&&No(e,t)&&(Eo(e.prev,e,t.prev)||Eo(e,t.prev,t))||Do(e,t)&&Eo(e.prev,e,e.next)>0&&Eo(t.prev,t,t.next)>0)}function Eo(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function Do(e,t){return e.x===t.x&&e.y===t.y}function Oo(e,t,n,r){let i=Ao(Eo(e,t,n)),a=Ao(Eo(e,t,r)),o=Ao(Eo(n,r,e)),s=Ao(Eo(n,r,t));return!!(i!==a&&o!==s||i===0&&ko(e,n,t)||a===0&&ko(e,r,t)||o===0&&ko(n,e,r)||s===0&&ko(n,t,r))}function ko(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function Ao(e){return e>0?1:e<0?-1:0}function jo(e,t){let n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&Oo(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function Mo(e,t){return Eo(e.prev,e,e.next)<0?Eo(e,t,e.next)>=0&&Eo(e,e.prev,t)>=0:Eo(e,t,e.prev)<0||Eo(e,e.next,t)<0}function No(e,t){let n=e,r=!1,i=(e.x+t.x)/2,a=(e.y+t.y)/2;do n.y>a!=n.next.y>a&&n.next.y!==n.y&&i<(n.next.x-n.x)*(a-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}function Po(e,t){let n=Lo(e.i,e.x,e.y),r=Lo(t.i,t.x,t.y),i=e.next,a=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,a.next=r,r.prev=a,r}function Fo(e,t,n,r){let i=Lo(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function Io(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function Lo(e,t,n){return{i:e,x:t,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Ro(e,t,n,r){let i=0;for(let a=t,o=n-r;a<n;a+=r)i+=(e[o]-e[a])*(e[a+1]+e[o+1]),o=a;return i}var zo=class{static triangulate(e,t,n=2){return ao(e,t,n)}},Bo=class e{static area(e){let t=e.length,n=0;for(let r=t-1,i=0;i<t;r=i++)n+=e[r].x*e[i].y-e[i].x*e[r].y;return n*.5}static isClockWise(t){return e.area(t)<0}static triangulateShape(e,t){let n=[],r=[],i=[];Vo(e),Ho(n,e);let a=e.length;t.forEach(Vo);for(let e=0;e<t.length;e++)r.push(a),a+=t[e].length,Ho(n,t[e]);let o=zo.triangulate(n,r);for(let e=0;e<o.length;e+=3)i.push(o.slice(e,e+3));return i}};function Vo(e){let t=e.length;t>2&&e[t-1].equals(e[0])&&e.pop()}function Ho(e,t){for(let n=0;n<t.length;n++)e.push(t[n].x),e.push(t[n].y)}var Uo=class e extends Or{constructor(e=new io([new q(.5,.5),new q(-.5,.5),new q(-.5,-.5),new q(.5,-.5)]),t={}){super(),this.type=`ExtrudeGeometry`,this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let n=this,r=[],i=[];for(let t=0,n=e.length;t<n;t++){let n=e[t];a(n)}this.setAttribute(`position`,new gr(r,3)),this.setAttribute(`uv`,new gr(i,2)),this.computeVertexNormals();function a(e){let a=[],o=t.curveSegments===void 0?12:t.curveSegments,s=t.steps===void 0?1:t.steps,c=t.depth===void 0?1:t.depth,l=t.bevelEnabled===void 0?!0:t.bevelEnabled,u=t.bevelThickness===void 0?.2:t.bevelThickness,d=t.bevelSize===void 0?u-.1:t.bevelSize,f=t.bevelOffset===void 0?0:t.bevelOffset,p=t.bevelSegments===void 0?3:t.bevelSegments,m=t.extrudePath,h=t.UVGenerator===void 0?Wo:t.UVGenerator,g,_=!1,v,y,b,x;if(m){g=m.getSpacedPoints(s),_=!0,l=!1;let e=m.isCatmullRomCurve3?m.closed:!1;v=m.computeFrenetFrames(s,e),y=new J,b=new J,x=new J}l||(p=0,u=0,d=0,f=0);let S=e.extractPoints(o),C=S.shape,w=S.holes;if(!Bo.isClockWise(C)){C=C.reverse();for(let e=0,t=w.length;e<t;e++){let t=w[e];Bo.isClockWise(t)&&(w[e]=t.reverse())}}function T(e){let t=e[0];for(let n=1;n<=e.length;n++){let r=n%e.length,i=e[r],a=i.x-t.x,o=i.y-t.y,s=a*a+o*o,c=Math.max(Math.abs(i.x),Math.abs(i.y),Math.abs(t.x),Math.abs(t.y));if(s<=10000000000000001e-36*c*c){e.splice(r,1),n--;continue}t=i}}T(C),w.forEach(T);let E=w.length,D=C;for(let e=0;e<E;e++){let t=w[e];C=C.concat(t)}function O(e,t,n){return t||G(`ExtrudeGeometry: vec does not exist`),e.clone().addScaledVector(t,n)}let k=C.length;function A(e,t,n){let r,i,a,o=e.x-t.x,s=e.y-t.y,c=n.x-e.x,l=n.y-e.y,u=o*o+s*s,d=o*l-s*c;if(Math.abs(d)>2**-52){let d=Math.sqrt(u),f=Math.sqrt(c*c+l*l),p=t.x-s/d,m=t.y+o/d,h=n.x-l/f,g=n.y+c/f,_=((h-p)*l-(g-m)*c)/(o*l-s*c);r=p+o*_-e.x,i=m+s*_-e.y;let v=r*r+i*i;if(v<=2)return new q(r,i);a=Math.sqrt(v/2)}else{let e=!1;o>2**-52?c>2**-52&&(e=!0):o<-(2**-52)?c<-(2**-52)&&(e=!0):Math.sign(s)===Math.sign(l)&&(e=!0),e?(r=-s,i=o,a=Math.sqrt(u)):(r=o,i=s,a=Math.sqrt(u/2))}return new q(r/a,i/a)}let ee=[];for(let e=0,t=D.length,n=t-1,r=e+1;e<t;e++,n++,r++)n===t&&(n=0),r===t&&(r=0),ee[e]=A(D[e],D[n],D[r]);let te=[],j,ne=ee.concat();for(let e=0,t=E;e<t;e++){let t=w[e];j=[];for(let e=0,n=t.length,r=n-1,i=e+1;e<n;e++,r++,i++)r===n&&(r=0),i===n&&(i=0),j[e]=A(t[e],t[r],t[i]);te.push(j),ne=ne.concat(j)}let M;if(p===0)M=Bo.triangulateShape(D,w);else{let e=[],t=[];for(let n=0;n<p;n++){let r=n/p,i=u*Math.cos(r*Math.PI/2),a=d*Math.sin(r*Math.PI/2)+f;for(let t=0,n=D.length;t<n;t++){let n=O(D[t],ee[t],a);P(n.x,n.y,-i),r===0&&e.push(n)}for(let e=0,n=E;e<n;e++){let n=w[e];j=te[e];let o=[];for(let e=0,t=n.length;e<t;e++){let t=O(n[e],j[e],a);P(t.x,t.y,-i),r===0&&o.push(t)}r===0&&t.push(o)}}M=Bo.triangulateShape(e,t)}let N=M.length,re=d+f;for(let e=0;e<k;e++){let t=l?O(C[e],ne[e],re):C[e];_?(b.copy(v.normals[0]).multiplyScalar(t.x),y.copy(v.binormals[0]).multiplyScalar(t.y),x.copy(g[0]).add(b).add(y),P(x.x,x.y,x.z)):P(t.x,t.y,0)}for(let e=1;e<=s;e++)for(let t=0;t<k;t++){let n=l?O(C[t],ne[t],re):C[t];_?(b.copy(v.normals[e]).multiplyScalar(n.x),y.copy(v.binormals[e]).multiplyScalar(n.y),x.copy(g[e]).add(b).add(y),P(x.x,x.y,x.z)):P(n.x,n.y,c/s*e)}for(let e=p-1;e>=0;e--){let t=e/p,n=u*Math.cos(t*Math.PI/2),r=d*Math.sin(t*Math.PI/2)+f;for(let e=0,t=D.length;e<t;e++){let t=O(D[e],ee[e],r);P(t.x,t.y,c+n)}for(let e=0,t=w.length;e<t;e++){let t=w[e];j=te[e];for(let e=0,i=t.length;e<i;e++){let i=O(t[e],j[e],r);_?P(i.x,i.y+g[s-1].y,g[s-1].x+n):P(i.x,i.y,c+n)}}}ie(),ae();function ie(){let e=r.length/3;if(l){let e=0,t=k*e;for(let e=0;e<N;e++){let n=M[e];se(n[2]+t,n[1]+t,n[0]+t)}e=s+p*2,t=k*e;for(let e=0;e<N;e++){let n=M[e];se(n[0]+t,n[1]+t,n[2]+t)}}else{for(let e=0;e<N;e++){let t=M[e];se(t[2],t[1],t[0])}for(let e=0;e<N;e++){let t=M[e];se(t[0]+k*s,t[1]+k*s,t[2]+k*s)}}n.addGroup(e,r.length/3-e,0)}function ae(){let e=r.length/3,t=0;oe(D,t),t+=D.length;for(let e=0,n=w.length;e<n;e++){let n=w[e];oe(n,t),t+=n.length}n.addGroup(e,r.length/3-e,1)}function oe(e,t){let n=e.length;for(;--n>=0;){let r=n,i=n-1;i<0&&(i=e.length-1);for(let e=0,n=s+p*2;e<n;e++){let n=k*e,a=k*(e+1);ce(t+r+n,t+i+n,t+i+a,t+r+a)}}}function P(e,t,n){a.push(e),a.push(t),a.push(n)}function se(e,t,i){F(e),F(t),F(i);let a=r.length/3,o=h.generateTopUV(n,r,a-3,a-2,a-1);le(o[0]),le(o[1]),le(o[2])}function ce(e,t,i,a){F(e),F(t),F(a),F(t),F(i),F(a);let o=r.length/3,s=h.generateSideWallUV(n,r,o-6,o-3,o-2,o-1);le(s[0]),le(s[1]),le(s[3]),le(s[1]),le(s[2]),le(s[3])}function F(e){r.push(a[e*3+0]),r.push(a[e*3+1]),r.push(a[e*3+2])}function le(e){i.push(e.x),i.push(e.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return Go(t,n,e)}static fromJSON(t,n){let r=[];for(let e=0,i=t.shapes.length;e<i;e++){let i=n[t.shapes[e]];r.push(i)}let i=t.options.extrudePath;return i!==void 0&&(t.options.extrudePath=new to[i.type]().fromJSON(i)),new e(r,t.options)}},Wo={generateTopUV:function(e,t,n,r,i){let a=t[n*3],o=t[n*3+1],s=t[r*3],c=t[r*3+1],l=t[i*3],u=t[i*3+1];return[new q(a,o),new q(s,c),new q(l,u)]},generateSideWallUV:function(e,t,n,r,i,a){let o=t[n*3],s=t[n*3+1],c=t[n*3+2],l=t[r*3],u=t[r*3+1],d=t[r*3+2],f=t[i*3],p=t[i*3+1],m=t[i*3+2],h=t[a*3],g=t[a*3+1],_=t[a*3+2];return Math.abs(s-u)<Math.abs(o-l)?[new q(o,1-c),new q(l,1-d),new q(f,1-m),new q(h,1-_)]:[new q(s,1-c),new q(u,1-d),new q(p,1-m),new q(g,1-_)]}};function Go(e,t,n){if(n.shapes=[],Array.isArray(e))for(let t=0,r=e.length;t<r;t++){let r=e[t];n.shapes.push(r.uuid)}else n.shapes.push(e.uuid);return n.options=Object.assign({},t),t.extrudePath!==void 0&&(n.options.extrudePath=t.extrudePath.toJSON()),n}var Ko=class e extends Da{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},qo=class e extends Or{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new gr(p,3)),this.setAttribute(`normal`,new gr(m,3)),this.setAttribute(`uv`,new gr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Jo=class e extends Or{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new J,d=new J,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=0;f===0&&a===0?v=.5/t:f===n&&s===Math.PI&&(v=-.5/t);for(let n=0;n<=t;n++){let s=n/t;u.x=-e*Math.cos(r+s*i)*Math.sin(a+_*o),u.y=e*Math.cos(a+_*o),u.z=e*Math.sin(r+s*i)*Math.sin(a+_*o),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(s+v,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new gr(p,3)),this.setAttribute(`normal`,new gr(m,3)),this.setAttribute(`uv`,new gr(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},Yo=class e extends Or{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2,a=0,o=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);let s=[],c=[],l=[],u=[],d=new J,f=new J,p=new J;for(let s=0;s<=n;s++){let m=a+s/n*o;for(let a=0;a<=r;a++){let o=a/r*i;f.x=(e+t*Math.cos(m))*Math.cos(o),f.y=(e+t*Math.cos(m))*Math.sin(o),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(o),d.y=e*Math.sin(o),p.subVectors(f,d).normalize(),l.push(p.x,p.y,p.z),u.push(a/r),u.push(s/n)}}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,a=(r+1)*(e-1)+t,o=(r+1)*e+t;s.push(n,i,o),s.push(i,a,o)}this.setIndex(s),this.setAttribute(`position`,new gr(c,3)),this.setAttribute(`normal`,new gr(l,3)),this.setAttribute(`uv`,new gr(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}};function Xo(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Qo(i))i.isRenderTargetTexture?(W(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i))if(Qo(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice();else t[n][r]=i}}return t}function Zo(e){let t={};for(let n=0;n<e.length;n++){let r=Xo(e[n]);for(let e in r)t[e]=r[e]}return t}function Qo(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function $o(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function es(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Ft.workingColorSpace}var ts={clone:Xo,merge:Zo},ns=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,rs=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,is=class extends Nr{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ns,this.fragmentShader=rs,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Xo(e.uniforms),this.uniformsGroups=$o(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},as=class extends is{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},os=class extends Nr{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new Y(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Y(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new q(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new cn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},ss=class extends os{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:``,PHYSICAL:``},this.type=`MeshPhysicalMaterial`,this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new q(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ot(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Y(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Y(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Y(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:``,PHYSICAL:``},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}},cs=class extends Nr{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=Fe,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},ls=class extends Nr{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function us(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function ds(e){function t(t,n){return e[t]-e[n]}let n=e.length,r=Array(n);for(let e=0;e!==n;++e)r[e]=e;return r.sort(t),r}function fs(e,t,n){let r=e.length,i=new e.constructor(r);for(let a=0,o=0;o!==r;++a){let r=n[a]*t;for(let n=0;n!==t;++n)i[o++]=e[r+n]}return i}function ps(e,t,n,r){let i=1,a=e[0];for(;a!==void 0&&a[r]===void 0;)a=e[i++];if(a===void 0)return;let o=a[r];if(o!==void 0)if(Array.isArray(o))do o=a[r],o!==void 0&&(t.push(a.time),n.push(...o)),a=e[i++];while(a!==void 0);else if(o.toArray!==void 0)do o=a[r],o!==void 0&&(t.push(a.time),o.toArray(n,n.length)),a=e[i++];while(a!==void 0);else do o=a[r],o!==void 0&&(t.push(a.time),n.push(o)),a=e[i++];while(a!==void 0)}var ms=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`call to abstract method`)}intervalChanged_(){}},hs=class extends ms{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:je,endingEnd:je}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case Me:i=e,o=2*t-n;break;case Ne:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case Me:a=e,s=2*n-t;break;case Ne:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},gs=class extends ms{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},_s=class extends ms{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},vs=class extends ms{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.settings||this.DefaultSettings_,u=l.inTangents,d=l.outTangents;if(!u||!d){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let f=o*2,p=e-1;for(let l=0;l!==o;++l){let o=a[c+l],m=a[s+l],h=p*f+l*2,g=d[h],_=d[h+1],v=e*f+l*2,y=u[v],b=u[v+1],x=(n-t)/(r-t),S,C,w,T,E;for(let e=0;e<8;e++){S=x*x,C=S*x,w=1-x,T=w*w,E=T*w;let e=E*t+3*T*x*g+3*w*S*y+C*r-n;if(Math.abs(e)<1e-10)break;let i=3*T*(g-t)+6*w*x*(y-g)+3*S*(r-y);if(Math.abs(i)<1e-10)break;x-=e/i,x=Math.max(0,Math.min(1,x))}i[l]=E*o+3*T*x*_+3*w*S*b+C*m}return i}},ys=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=us(t,this.TimeBufferType),this.values=us(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:us(e.times,Array),values:us(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new _s(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new gs(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new hs(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new vs(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.settings=this.settings),t}setInterpolation(e){let t;switch(e){case ke:t=this.InterpolantFactoryMethodDiscrete;break;case H:t=this.InterpolantFactoryMethodLinear;break;case U:t=this.InterpolantFactoryMethodSmooth;break;case Ae:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t);return W(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ke;case this.InterpolantFactoryMethodLinear:return H;case this.InterpolantFactoryMethodSmooth:return U;case this.InterpolantFactoryMethodBezier:return Ae}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(G(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(G(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){G(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){G(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&We(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){G(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===U,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0]))if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};ys.prototype.ValueTypeName=``,ys.prototype.TimeBufferType=Float32Array,ys.prototype.ValueBufferType=Float32Array,ys.prototype.DefaultInterpolation=H;var bs=class extends ys{constructor(e,t,n){super(e,t,n)}};bs.prototype.ValueTypeName=`bool`,bs.prototype.ValueBufferType=Array,bs.prototype.DefaultInterpolation=ke,bs.prototype.InterpolantFactoryMethodLinear=void 0,bs.prototype.InterpolantFactoryMethodSmooth=void 0;var xs=class extends ys{constructor(e,t,n,r){super(e,t,n,r)}};xs.prototype.ValueTypeName=`color`;var Ss=class extends ys{constructor(e,t,n,r){super(e,t,n,r)}};Ss.prototype.ValueTypeName=`number`;var Cs=class extends ms{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Dt.slerpFlat(i,0,a,c-o,a,c,s);return i}},ws=class extends ys{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Cs(this.times,this.values,this.getValueSize(),e)}};ws.prototype.ValueTypeName=`quaternion`,ws.prototype.InterpolantFactoryMethodSmooth=void 0;var Ts=class extends ys{constructor(e,t,n){super(e,t,n)}};Ts.prototype.ValueTypeName=`string`,Ts.prototype.ValueBufferType=Array,Ts.prototype.DefaultInterpolation=ke,Ts.prototype.InterpolantFactoryMethodLinear=void 0,Ts.prototype.InterpolantFactoryMethodSmooth=void 0;var Es=class extends ys{constructor(e,t,n,r){super(e,t,n,r)}};Es.prototype.ValueTypeName=`vector`;var Ds=class{constructor(e=``,t=-1,n=[],r=Pe){this.name=e,this.tracks=n,this.duration=t,this.blendMode=r,this.uuid=at(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,r=1/(e.fps||1);for(let e=0,i=n.length;e!==i;++e)t.push(ks(n[e]).scale(r));let i=new this(e.name,e.duration,t,e.blendMode);return i.uuid=e.uuid,i.userData=JSON.parse(e.userData||`{}`),i}static toJSON(e){let t=[],n=e.tracks,r={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let e=0,r=n.length;e!==r;++e)t.push(ys.toJSON(n[e]));return r}static CreateFromMorphTargetSequence(e,t,n,r){let i=t.length,a=[];for(let e=0;e<i;e++){let o=[],s=[];o.push((e+i-1)%i,e,(e+1)%i),s.push(0,1,0);let c=ds(o);o=fs(o,1,c),s=fs(s,1,c),!r&&o[0]===0&&(o.push(i),s.push(s[0])),a.push(new Ss(`.morphTargetInfluences[`+t[e].name+`]`,o,s).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let t=e;n=t.geometry&&t.geometry.animations||t.animations}for(let e=0;e<n.length;e++)if(n[e].name===t)return n[e];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let r={},i=/^([\w-]*?)([\d]+)$/;for(let t=0,n=e.length;t<n;t++){let n=e[t],a=n.name.match(i);if(a&&a.length>1){let e=a[1],t=r[e];t||(r[e]=t=[]),t.push(n)}}let a=[];for(let e in r)a.push(this.CreateFromMorphTargetSequence(e,r[e],t,n));return a}static parseAnimation(e,t){if(W(`AnimationClip: parseAnimation() is deprecated and will be removed with r185`),!e)return G(`AnimationClip: No animation in JSONLoader data.`),null;let n=function(e,t,n,r,i){if(n.length!==0){let a=[],o=[];ps(n,a,o,r),a.length!==0&&i.push(new e(t,a,o))}},r=[],i=e.name||`default`,a=e.fps||30,o=e.blendMode,s=e.length||-1,c=e.hierarchy||[];for(let e=0;e<c.length;e++){let i=c[e].keys;if(!(!i||i.length===0))if(i[0].morphTargets){let e={},t;for(t=0;t<i.length;t++)if(i[t].morphTargets)for(let n=0;n<i[t].morphTargets.length;n++)e[i[t].morphTargets[n]]=-1;for(let n in e){let e=[],a=[];for(let r=0;r!==i[t].morphTargets.length;++r){let r=i[t];e.push(r.time),a.push(+(r.morphTarget===n))}r.push(new Ss(`.morphTargetInfluence[`+n+`]`,e,a))}s=e.length*a}else{let a=`.bones[`+t[e].name+`]`;n(Es,a+`.position`,i,`pos`,r),n(ws,a+`.quaternion`,i,`rot`,r),n(Es,a+`.scale`,i,`scl`,r)}}return r.length===0?null:new this(i,s,r,o)}resetDuration(){let e=this.tracks,t=0;for(let n=0,r=e.length;n!==r;++n){let e=this.tracks[n];t=Math.max(t,e.times[e.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e&&=this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function Os(e){switch(e.toLowerCase()){case`scalar`:case`double`:case`float`:case`number`:case`integer`:return Ss;case`vector`:case`vector2`:case`vector3`:case`vector4`:return Es;case`color`:return xs;case`quaternion`:return ws;case`bool`:case`boolean`:return bs;case`string`:return Ts}throw Error(`THREE.KeyframeTrack: Unsupported typeName: `+e)}function ks(e){if(e.type===void 0)throw Error(`THREE.KeyframeTrack: track type undefined, can not parse`);let t=Os(e.type);if(e.times===void 0){let t=[],n=[];ps(e.keys,t,n,`value`),e.times=t,e.values=n}return t.parse===void 0?new t(e.name,e.times,e.values,e.interpolation):t.parse(e)}var As={enabled:!1,files:{},add:function(e,t){this.enabled!==!1&&(js(e)||(this.files[e]=t))},get:function(e){if(this.enabled!==!1&&!js(e))return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}};function js(e){try{let t=e.slice(e.indexOf(`:`)+1);return new URL(t).protocol===`blob:`}catch{return!1}}var Ms=new class{constructor(e,t,n){let r=this,i=!1,a=0,o=0,s,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(e){o++,i===!1&&r.onStart!==void 0&&r.onStart(e,a,o),i=!0},this.itemEnd=function(e){a++,r.onProgress!==void 0&&r.onProgress(e,a,o),a===o&&(i=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(e){r.onError!==void 0&&r.onError(e)},this.resolveURL=function(e){return s?s(e):e},this.setURLModifier=function(e){return s=e,this},this.addHandler=function(e,t){return c.push(e,t),this},this.removeHandler=function(e){let t=c.indexOf(e);return t!==-1&&c.splice(t,2),this},this.getHandler=function(e){for(let t=0,n=c.length;t<n;t+=2){let n=c[t],r=c[t+1];if(n.global&&(n.lastIndex=0),n.test(e))return r}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||=new AbortController,this._abortController}},Ns=class{constructor(e){this.manager=e===void 0?Ms:e,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,i){n.load(e,r,t,i)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Ns.DEFAULT_MATERIAL_NAME=`__DEFAULT`;var Ps={},Fs=class extends Error{constructor(e,t){super(e),this.response=t}},Is=class extends Ns{constructor(e){super(e),this.mimeType=``,this.responseType=``,this._abortController=new AbortController}load(e,t,n,r){e===void 0&&(e=``),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=As.get(`file:${e}`);if(i!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(i),this.manager.itemEnd(e)},0);return}if(Ps[e]!==void 0){Ps[e].push({onLoad:t,onProgress:n,onError:r});return}Ps[e]=[],Ps[e].push({onLoad:t,onProgress:n,onError:r});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?`include`:`same-origin`,signal:typeof AbortSignal.any==`function`?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,s=this.responseType;fetch(a).then(t=>{if(t.status===200||t.status===0){if(t.status===0&&W(`FileLoader: HTTP Status 0 received.`),typeof ReadableStream>`u`||t.body===void 0||t.body.getReader===void 0)return t;let n=Ps[e],r=t.body.getReader(),i=t.headers.get(`X-File-Size`)||t.headers.get(`Content-Length`),a=i?parseInt(i):0,o=a!==0,s=0,c=new ReadableStream({start(e){t();function t(){r.read().then(({done:r,value:i})=>{if(r)e.close();else{s+=i.byteLength;let r=new ProgressEvent(`progress`,{lengthComputable:o,loaded:s,total:a});for(let e=0,t=n.length;e<t;e++){let t=n[e];t.onProgress&&t.onProgress(r)}e.enqueue(i),t()}},t=>{e.error(t)})}}});return new Response(c)}else throw new Fs(`fetch for "${t.url}" responded with ${t.status}: ${t.statusText}`,t)}).then(e=>{switch(s){case`arraybuffer`:return e.arrayBuffer();case`blob`:return e.blob();case`document`:return e.text().then(e=>new DOMParser().parseFromString(e,o));case`json`:return e.json();default:if(o===``)return e.text();{let t=/charset="?([^;"\s]*)"?/i.exec(o),n=t&&t[1]?t[1].toLowerCase():void 0,r=new TextDecoder(n);return e.arrayBuffer().then(e=>r.decode(e))}}}).then(t=>{As.add(`file:${e}`,t);let n=Ps[e];delete Ps[e];for(let e=0,r=n.length;e<r;e++){let r=n[e];r.onLoad&&r.onLoad(t)}}).catch(t=>{let n=Ps[e];if(n===void 0)throw this.manager.itemError(e),t;delete Ps[e];for(let e=0,r=n.length;e<r;e++){let r=n[e];r.onError&&r.onError(t)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},Ls=new WeakMap,Rs=class extends Ns{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=As.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)i.manager.itemStart(e),setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0);else{let e=Ls.get(a);e===void 0&&(e=[],Ls.set(a,e)),e.push({onLoad:t,onError:r})}return a}let o=Ge(`img`);function s(){l(),t&&t(this);let n=Ls.get(this)||[];for(let e=0;e<n.length;e++){let t=n[e];t.onLoad&&t.onLoad(this)}Ls.delete(this),i.manager.itemEnd(e)}function c(t){l(),r&&r(t),As.remove(`image:${e}`);let n=Ls.get(this)||[];for(let e=0;e<n.length;e++){let r=n[e];r.onError&&r.onError(t)}Ls.delete(this),i.manager.itemError(e),i.manager.itemEnd(e)}function l(){o.removeEventListener(`load`,s,!1),o.removeEventListener(`error`,c,!1)}return o.addEventListener(`load`,s,!1),o.addEventListener(`error`,c,!1),e.slice(0,5)!==`data:`&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),As.add(`image:${e}`,o),i.manager.itemStart(e),o.src=e,o}},zs=class extends Ns{constructor(e){super(e)}load(e,t,n,r){let i=new Gt,a=new Rs(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(e){i.image=e,i.needsUpdate=!0,t!==void 0&&t(i)},n,r),i}},Bs=class extends Tn{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new Y(e),this.intensity=t}dispose(){this.dispatchEvent({type:`dispose`})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Vs=class extends Bs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(Tn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Y(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Hs=new Zt,Us=new J,Ws=new J,Gs=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new q(512,512),this.mapType=f,this.map=null,this.mapPass=null,this.matrix=new Zt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Yi,this._frameExtents=new q(1,1),this._viewportCount=1,this._viewports=[new Kt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;Us.setFromMatrixPosition(e.matrixWorld),t.position.copy(Us),Ws.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ws),t.updateMatrixWorld(),Hs.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Hs,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===2001||t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Hs)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ks=new J,qs=new Dt,Js=new J,Ys=class extends Tn{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Zt,this.projectionMatrix=new Zt,this.projectionMatrixInverse=new Zt,this.coordinateSystem=He,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ks,qs,Js),Js.x===1&&Js.y===1&&Js.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ks,qs,Js.set(1,1,1)).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorld.decompose(Ks,qs,Js),Js.x===1&&Js.y===1&&Js.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ks,qs,Js.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Xs=new J,Zs=new q,Qs=new q,$s=class extends Ys{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=it*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(rt*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return it*2*Math.atan(Math.tan(rt*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Xs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Xs.x,Xs.y).multiplyScalar(-e/Xs.z),Xs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Xs.x,Xs.y).multiplyScalar(-e/Xs.z)}getViewSize(e,t){return this.getViewBounds(e,Zs,Qs),t.subVectors(Qs,Zs)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(rt*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},ec=class extends Gs{constructor(){super(new $s(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=it*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height*this.aspect,i=e.distance||t.far;(n!==t.fov||r!==t.aspect||i!==t.far)&&(t.fov=n,t.aspect=r,t.far=i,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},tc=class extends Bs{constructor(e,t,n=0,r=Math.PI/3,i=0,a=2){super(e,t),this.isSpotLight=!0,this.type=`SpotLight`,this.position.copy(Tn.DEFAULT_UP),this.updateMatrix(),this.target=new Tn,this.distance=n,this.angle=r,this.penumbra=i,this.decay=a,this.map=null,this.shadow=new ec}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},nc=class extends Gs{constructor(){super(new $s(90,1,.5,500)),this.isPointLightShadow=!0}},rc=class extends Bs{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type=`PointLight`,this.distance=n,this.decay=r,this.shadow=new nc}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},ic=class extends Ys{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},ac=class extends Gs{constructor(){super(new ic(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},oc=class extends Bs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(Tn.DEFAULT_UP),this.updateMatrix(),this.target=new Tn,this.shadow=new ac}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},sc=class extends Bs{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type=`AmbientLight`}},cc=class{static extractUrlBase(e){let t=e.lastIndexOf(`/`);return t===-1?`./`:e.slice(0,t+1)}static resolveURL(e,t){return typeof e!=`string`||e===``?``:(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,`$1`)),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}},lc=new WeakMap,uc=class extends Ns{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>`u`&&W(`ImageBitmapLoader: createImageBitmap() not supported.`),typeof fetch>`u`&&W(`ImageBitmapLoader: fetch() not supported.`),this.options={premultiplyAlpha:`none`},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,r){e===void 0&&(e=``),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=As.get(`image-bitmap:${e}`);if(a!==void 0){if(i.manager.itemStart(e),a.then){a.then(n=>{lc.has(a)===!0?(r&&r(lc.get(a)),i.manager.itemError(e),i.manager.itemEnd(e)):(t&&t(n),i.manager.itemEnd(e))});return}setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0);return}let o={};o.credentials=this.crossOrigin===`anonymous`?`same-origin`:`include`,o.headers=this.requestHeader,o.signal=typeof AbortSignal.any==`function`?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let s=fetch(e,o).then(function(e){return e.blob()}).then(function(e){return createImageBitmap(e,Object.assign(i.options,{colorSpaceConversion:`none`}))}).then(function(n){As.add(`image-bitmap:${e}`,n),t&&t(n),i.manager.itemEnd(e)}).catch(function(t){r&&r(t),lc.set(s,t),As.remove(`image-bitmap:${e}`),i.manager.itemError(e),i.manager.itemEnd(e)});As.add(`image-bitmap:${e}`,s),i.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},dc=-90,fc=1,pc=class extends Tn{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new $s(dc,fc,e,t);r.layers=this.layers,this.add(r);let i=new $s(dc,fc,e,t);i.layers=this.layers,this.add(i);let a=new $s(dc,fc,e,t);a.layers=this.layers,this.add(a);let o=new $s(dc,fc,e,t);o.layers=this.layers,this.add(o);let s=new $s(dc,fc,e,t);s.layers=this.layers,this.add(s);let c=new $s(dc,fc,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},mc=class extends $s{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},hc=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=gc.bind(this),e.addEventListener(`visibilitychange`,this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener(`visibilitychange`,this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e===void 0?performance.now():e)-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function gc(){this._document.hidden===!1&&this.reset()}var _c=`\\[\\]\\.:\\/`,vc=RegExp(`[\\[\\]\\.:\\/]`,`g`),yc=`[^\\[\\]\\.:\\/]`,bc=`[^`+_c.replace(`\\.`,``)+`]`,xc=`((?:WC+[\\/:])*)`.replace(`WC`,yc),Sc=`(WCOD+)?`.replace(`WCOD`,bc),Cc=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,yc),wc=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,yc),Tc=RegExp(`^`+xc+Sc+Cc+wc+`$`),Ec=[`material`,`materials`,`bones`,`map`],Dc=class{constructor(e,t,n){let r=n||Oc.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Oc=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(vc,``)}static parseTrackName(e){let t=Tc.exec(e);if(t===null)throw Error(`PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Ec.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){W(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){G(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){G(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){G(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){G(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){G(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){G(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){G(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;G(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){G(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){G(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Oc.Composite=Dc,Oc.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Oc.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Oc.prototype.GetterByBindingType=[Oc.prototype._getValue_direct,Oc.prototype._getValue_array,Oc.prototype._getValue_arrayElement,Oc.prototype._getValue_toArray],Oc.prototype.SetterByBindingTypeAndVersioning=[[Oc.prototype._setValue_direct,Oc.prototype._setValue_direct_setNeedsUpdate,Oc.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Oc.prototype._setValue_array,Oc.prototype._setValue_array_setNeedsUpdate,Oc.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Oc.prototype._setValue_arrayElement,Oc.prototype._setValue_arrayElement_setNeedsUpdate,Oc.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Oc.prototype._setValue_fromArray,Oc.prototype._setValue_fromArray_setNeedsUpdate,Oc.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]],class e{static{e.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}};function kc(e,t,n,r){let i=Ac(r);switch(n){case T:return e*t;case A:return e*t/i.components*i.byteLength;case ee:return e*t/i.components*i.byteLength;case te:return e*t*2/i.components*i.byteLength;case j:return e*t*2/i.components*i.byteLength;case E:return e*t*3/i.components*i.byteLength;case D:return e*t*4/i.components*i.byteLength;case ne:return e*t*4/i.components*i.byteLength;case M:case N:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case re:case ie:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case oe:case se:return Math.max(e,16)*Math.max(t,8)/4;case ae:case P:return Math.max(e,8)*Math.max(t,8)/2;case ce:case F:case ue:case de:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case le:case fe:case pe:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case I:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case L:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case me:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case he:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case ge:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case _e:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case ve:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case ye:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case R:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case be:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case xe:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Se:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Ce:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case z:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case we:case Te:case B:return Math.ceil(e/4)*Math.ceil(t/4)*16;case Ee:case De:return Math.ceil(e/4)*Math.ceil(t/4)*8;case Oe:case V:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Ac(e){switch(e){case f:case p:return{byteLength:1,components:1};case h:case m:case y:return{byteLength:2,components:1};case b:case x:return{byteLength:2,components:4};case _:case g:case v:return{byteLength:4,components:1};case C:case w:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`184`}})),typeof window<`u`&&(window.__THREE__?W(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`184`);function jc(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Mc(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var Nc={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = inverseTransformDirection( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},Z={common:{diffuse:{value:new Y(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new At},alphaMap:{value:null},alphaMapTransform:{value:new At},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new At}},envmap:{envMap:{value:null},envMapRotation:{value:new At},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new At}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new At}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new At},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new At},normalScale:{value:new q(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new At},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new At}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new At}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new At}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Y(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new J},probesMax:{value:new J},probesResolution:{value:new J}},points:{diffuse:{value:new Y(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new At},alphaTest:{value:0},uvTransform:{value:new At}},sprite:{diffuse:{value:new Y(16777215)},opacity:{value:1},center:{value:new q(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new At},alphaMap:{value:null},alphaMapTransform:{value:new At},alphaTest:{value:0}}},Pc={basic:{uniforms:Zo([Z.common,Z.specularmap,Z.envmap,Z.aomap,Z.lightmap,Z.fog]),vertexShader:Nc.meshbasic_vert,fragmentShader:Nc.meshbasic_frag},lambert:{uniforms:Zo([Z.common,Z.specularmap,Z.envmap,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.fog,Z.lights,{emissive:{value:new Y(0)},envMapIntensity:{value:1}}]),vertexShader:Nc.meshlambert_vert,fragmentShader:Nc.meshlambert_frag},phong:{uniforms:Zo([Z.common,Z.specularmap,Z.envmap,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.fog,Z.lights,{emissive:{value:new Y(0)},specular:{value:new Y(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Nc.meshphong_vert,fragmentShader:Nc.meshphong_frag},standard:{uniforms:Zo([Z.common,Z.envmap,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.roughnessmap,Z.metalnessmap,Z.fog,Z.lights,{emissive:{value:new Y(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Nc.meshphysical_vert,fragmentShader:Nc.meshphysical_frag},toon:{uniforms:Zo([Z.common,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.gradientmap,Z.fog,Z.lights,{emissive:{value:new Y(0)}}]),vertexShader:Nc.meshtoon_vert,fragmentShader:Nc.meshtoon_frag},matcap:{uniforms:Zo([Z.common,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.fog,{matcap:{value:null}}]),vertexShader:Nc.meshmatcap_vert,fragmentShader:Nc.meshmatcap_frag},points:{uniforms:Zo([Z.points,Z.fog]),vertexShader:Nc.points_vert,fragmentShader:Nc.points_frag},dashed:{uniforms:Zo([Z.common,Z.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Nc.linedashed_vert,fragmentShader:Nc.linedashed_frag},depth:{uniforms:Zo([Z.common,Z.displacementmap]),vertexShader:Nc.depth_vert,fragmentShader:Nc.depth_frag},normal:{uniforms:Zo([Z.common,Z.bumpmap,Z.normalmap,Z.displacementmap,{opacity:{value:1}}]),vertexShader:Nc.meshnormal_vert,fragmentShader:Nc.meshnormal_frag},sprite:{uniforms:Zo([Z.sprite,Z.fog]),vertexShader:Nc.sprite_vert,fragmentShader:Nc.sprite_frag},background:{uniforms:{uvTransform:{value:new At},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Nc.background_vert,fragmentShader:Nc.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new At}},vertexShader:Nc.backgroundCube_vert,fragmentShader:Nc.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Nc.cube_vert,fragmentShader:Nc.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Nc.equirect_vert,fragmentShader:Nc.equirect_frag},distance:{uniforms:Zo([Z.common,Z.displacementmap,{referencePosition:{value:new J},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Nc.distance_vert,fragmentShader:Nc.distance_frag},shadow:{uniforms:Zo([Z.lights,Z.fog,{color:{value:new Y(0)},opacity:{value:1}}]),vertexShader:Nc.shadow_vert,fragmentShader:Nc.shadow_frag}};Pc.physical={uniforms:Zo([Pc.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new At},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new At},clearcoatNormalScale:{value:new q(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new At},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new At},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new At},sheen:{value:0},sheenColor:{value:new Y(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new At},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new At},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new At},transmissionSamplerSize:{value:new q},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new At},attenuationDistance:{value:0},attenuationColor:{value:new Y(0)},specularColor:{value:new Y(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new At},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new At},anisotropyVector:{value:new q},anisotropyMap:{value:null},anisotropyMapTransform:{value:new At}}]),vertexShader:Nc.meshphysical_vert,fragmentShader:Nc.meshphysical_frag};var Fc={r:0,b:0,g:0},Ic=new Zt,Lc=new At;Lc.set(-1,0,0,0,1,0,0,0,1);function Rc(e,t,n,r,i,a){let o=new Y(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new X(new Sa(1,1,1),new is({name:`BackgroundCubeMaterial`,uniforms:Xo(Pc.backgroundCube.uniforms),vertexShader:Pc.backgroundCube.vertexShader,fragmentShader:Pc.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Ic.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isCubeTexture&&i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Lc),l.material.toneMapped=Ft.getTransfer(i.colorSpace)!==ze,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new X(new qo(2,2),new is({name:`BackgroundMaterial`,uniforms:Xo(Pc.background.uniforms),vertexShader:Pc.background.vertexShader,fragmentShader:Pc.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=Ft.getTransfer(i.colorSpace)!==ze,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(Fc,es(e)),n.buffers.color.setClear(Fc.r,Fc.g,Fc.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function zc(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Bc(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function Vc(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return!(t!==1023&&r.convert(t)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(W(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`);n.reversedDepthBuffer===!0&&f===!1&&W(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function Hc(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Gi,s=new At,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var Uc=4,Wc=[.125,.215,.35,.446,.526,.582],Gc=20,Kc=256,qc=new ic,Jc=new Y,Yc=null,Xc=0,Zc=0,Qc=!1,$c=new J,el=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=$c}=i;Yc=this._renderer.getRenderTarget(),Xc=this._renderer.getActiveCubeFace(),Zc=this._renderer.getActiveMipmapLevel(),Qc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=sl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ol(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Yc,Xc,Zc),this._renderer.xr.enabled=Qc,e.scissorTest=!1,rl(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Yc=this._renderer.getRenderTarget(),Xc=this._renderer.getActiveCubeFace(),Zc=this._renderer.getActiveMipmapLevel(),Qc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:l,minFilter:l,generateMipmaps:!1,type:y,format:D,colorSpace:Le,depthBuffer:!1},r=nl(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=nl(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=tl(r)),this._blurMaterial=al(r,e,t),this._ggxMaterial=il(r,e,t)}return r}_compileMaterial(e){let t=new X(new Or,e);this._renderer.compile(t,qc)}_sceneToCubeUV(e,t,n,r,i){let a=new $s(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(Jc),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new X(new Sa,new ii({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(Jc),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;rl(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=sl()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ol());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;rl(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,qc)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(0+c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-Uc?n-d+Uc:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,rl(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,qc),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,rl(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,qc)}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&G(`blur direction must be either latitudinal or longitudinal!`);let l=this._lodMeshes[r];l.material=c;let u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/(2*Gc-1),p=i/f,m=isFinite(i)?1+Math.floor(3*p):Gc;m>Gc&&W(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Gc}`);let h=[],g=0;for(let e=0;e<Gc;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];rl(t,3*v*(r>_-Uc?r-_+Uc:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,qc)}};function tl(e){let t=[],n=[],r=[],i=e,a=e-Uc+1+Wc.length;for(let o=0;o<a;o++){let a=2**i;t.push(a);let s=1/a;o>e-Uc?s=Wc[o-e+Uc-1]:o===0&&(s=0),n.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new Or;h.setAttribute(`position`,new pr(f,3)),h.setAttribute(`uv`,new pr(p,2)),h.setAttribute(`faceIndex`,new pr(m,1)),r.push(new X(h,null)),i>Uc&&i--}return{lodMeshes:r,sizeLods:t,sigmas:n}}function nl(e,t,n){let r=new Jt(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function rl(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function il(e,t,n){return new is({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:Kc,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:cl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function al(e,t,n){let r=new Float32Array(Gc),i=new J(0,1,0);return new is({name:`SphericalGaussianBlur`,defines:{n:Gc,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:cl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function ol(){return new is({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:cl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function sl(){return new is({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:cl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function cl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}var ll=class extends Jt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new _a(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Sa(5,5,5),i=new is({name:`CubemapFromEquirect`,uniforms:Xo(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new X(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=l),new pc(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function ul(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304)if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}else{let r=n.image;if(r&&r.height>0){let i=new ll(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}else return null}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new el(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new el(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function dl(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Ze(`WebGLRenderer: `+e+` extension not supported.`),t}}}function fl(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?hr:mr)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function pl(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function ml(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:G(`WebGLInfo: Unknown draw mode:`,r);break}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function hl(e,t,n){let r=new WeakMap,i=new Kt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new Yt(h,p,m,u);g.type=v,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new q(p,m)},r.set(o,d);function y(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function gl(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var _l={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function vl(e,t,n,r,i){let a=new Jt(t,n,{type:e,depthBuffer:r,stencilBuffer:i,depthTexture:r?new ya(t,n):void 0}),o=new Jt(t,n,{type:y,depthBuffer:!1,stencilBuffer:!1}),s=new Or;s.setAttribute(`position`,new gr([-1,3,0,-1,-1,0,3,-1,0],3)),s.setAttribute(`uv`,new gr([0,2,0,0,2,0],2));let c=new as({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),l=new X(s,c),u=new ic(-1,1,1,-1,0,1),d=null,f=null,p=!1,m,h=null,g=[],_=!1;this.setSize=function(e,t){a.setSize(e,t),o.setSize(e,t);for(let n=0;n<g.length;n++){let r=g[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){g=e,_=g.length>0&&g[0].isRenderPass===!0;let t=a.width,n=a.height;for(let e=0;e<g.length;e++){let r=g[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(p||e.toneMapping===0&&g.length===0)return!1;if(h=t,t!==null){let e=t.width,n=t.height;(a.width!==e||a.height!==n)&&this.setSize(e,n)}return _===!1&&e.setRenderTarget(a),m=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return _},this.end=function(e,t){e.toneMapping=m,p=!0;let n=a,r=o;for(let i=0;i<g.length;i++){let a=g[i];if(a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1)){let e=n;n=r,r=e}}if(d!==e.outputColorSpace||f!==e.toneMapping){d=e.outputColorSpace,f=e.toneMapping,c.defines={},Ft.getTransfer(d)===`srgb`&&(c.defines.SRGB_TRANSFER=``);let t=_l[f];t&&(c.defines[t]=``),c.needsUpdate=!0}c.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(h),e.render(l,u),h=null,p=!1},this.isCompositing=function(){return p},this.dispose=function(){a.depthTexture&&a.depthTexture.dispose(),a.dispose(),o.dispose(),s.dispose(),c.dispose()}}var yl=new Gt,bl=new ya(1,1),xl=new Yt,Sl=new Xt,Cl=new _a,wl=[],Tl=[],El=new Float32Array(16),Dl=new Float32Array(9),Ol=new Float32Array(4);function kl(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=wl[i];if(a===void 0&&(a=new Float32Array(i),wl[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Al(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function jl(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Ml(e,t){let n=Tl[t];n===void 0&&(n=new Int32Array(t),Tl[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Nl(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Pl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Al(n,t))return;e.uniform2fv(this.addr,t),jl(n,t)}}function Fl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Al(n,t))return;e.uniform3fv(this.addr,t),jl(n,t)}}function Il(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Al(n,t))return;e.uniform4fv(this.addr,t),jl(n,t)}}function Ll(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Al(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),jl(n,t)}else{if(Al(n,r))return;Ol.set(r),e.uniformMatrix2fv(this.addr,!1,Ol),jl(n,r)}}function Rl(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Al(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),jl(n,t)}else{if(Al(n,r))return;Dl.set(r),e.uniformMatrix3fv(this.addr,!1,Dl),jl(n,r)}}function zl(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Al(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),jl(n,t)}else{if(Al(n,r))return;El.set(r),e.uniformMatrix4fv(this.addr,!1,El),jl(n,r)}}function Bl(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Vl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Al(n,t))return;e.uniform2iv(this.addr,t),jl(n,t)}}function Hl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Al(n,t))return;e.uniform3iv(this.addr,t),jl(n,t)}}function Ul(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Al(n,t))return;e.uniform4iv(this.addr,t),jl(n,t)}}function Wl(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Gl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Al(n,t))return;e.uniform2uiv(this.addr,t),jl(n,t)}}function Kl(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Al(n,t))return;e.uniform3uiv(this.addr,t),jl(n,t)}}function ql(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Al(n,t))return;e.uniform4uiv(this.addr,t),jl(n,t)}}function Jl(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(bl.compareFunction=n.isReversedDepthBuffer()?518:515,a=bl):a=yl,n.setTexture2D(t||a,i)}function Yl(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Sl,i)}function Xl(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Cl,i)}function Zl(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||xl,i)}function Ql(e){switch(e){case 5126:return Nl;case 35664:return Pl;case 35665:return Fl;case 35666:return Il;case 35674:return Ll;case 35675:return Rl;case 35676:return zl;case 5124:case 35670:return Bl;case 35667:case 35671:return Vl;case 35668:case 35672:return Hl;case 35669:case 35673:return Ul;case 5125:return Wl;case 36294:return Gl;case 36295:return Kl;case 36296:return ql;case 35678:case 36198:case 36298:case 36306:case 35682:return Jl;case 35679:case 36299:case 36307:return Yl;case 35680:case 36300:case 36308:case 36293:return Xl;case 36289:case 36303:case 36311:case 36292:return Zl}}function $l(e,t){e.uniform1fv(this.addr,t)}function eu(e,t){let n=kl(t,this.size,2);e.uniform2fv(this.addr,n)}function tu(e,t){let n=kl(t,this.size,3);e.uniform3fv(this.addr,n)}function nu(e,t){let n=kl(t,this.size,4);e.uniform4fv(this.addr,n)}function ru(e,t){let n=kl(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function iu(e,t){let n=kl(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function au(e,t){let n=kl(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function ou(e,t){e.uniform1iv(this.addr,t)}function su(e,t){e.uniform2iv(this.addr,t)}function cu(e,t){e.uniform3iv(this.addr,t)}function lu(e,t){e.uniform4iv(this.addr,t)}function uu(e,t){e.uniform1uiv(this.addr,t)}function du(e,t){e.uniform2uiv(this.addr,t)}function fu(e,t){e.uniform3uiv(this.addr,t)}function pu(e,t){e.uniform4uiv(this.addr,t)}function mu(e,t,n){let r=this.cache,i=t.length,a=Ml(n,i);Al(r,a)||(e.uniform1iv(this.addr,a),jl(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?bl:yl;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function hu(e,t,n){let r=this.cache,i=t.length,a=Ml(n,i);Al(r,a)||(e.uniform1iv(this.addr,a),jl(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Sl,a[e])}function gu(e,t,n){let r=this.cache,i=t.length,a=Ml(n,i);Al(r,a)||(e.uniform1iv(this.addr,a),jl(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Cl,a[e])}function _u(e,t,n){let r=this.cache,i=t.length,a=Ml(n,i);Al(r,a)||(e.uniform1iv(this.addr,a),jl(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||xl,a[e])}function vu(e){switch(e){case 5126:return $l;case 35664:return eu;case 35665:return tu;case 35666:return nu;case 35674:return ru;case 35675:return iu;case 35676:return au;case 5124:case 35670:return ou;case 35667:case 35671:return su;case 35668:case 35672:return cu;case 35669:case 35673:return lu;case 5125:return uu;case 36294:return du;case 36295:return fu;case 36296:return pu;case 35678:case 36198:case 36298:case 36306:case 35682:return mu;case 35679:case 36299:case 36307:return hu;case 35680:case 36300:case 36308:case 36293:return gu;case 36289:case 36303:case 36311:case 36292:return _u}}var yu=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Ql(t.type)}},bu=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=vu(t.type)}},xu=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Su=/(\w+)(\])?(\[|\.)?/g;function Cu(e,t){e.seq.push(t),e.map[t.id]=t}function wu(e,t,n){let r=e.name,i=r.length;for(Su.lastIndex=0;;){let a=Su.exec(r),o=Su.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Cu(n,l===void 0?new yu(s,e,t):new bu(s,e,t));break}else{let e=n.map[s];e===void 0&&(e=new xu(s),Cu(n,e)),n=e}}}var Tu=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);wu(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Eu(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Du=37297,Ou=0;function ku(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Au=new At;function ju(e){Ft._getMatrix(Au,Ft.workingColorSpace,e);let t=`mat3( ${Au.elements.map(e=>e.toFixed(4))} )`;switch(Ft.getTransfer(e)){case Re:return[t,`LinearTransferOETF`];case ze:return[t,`sRGBTransferOETF`];default:return W(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Mu(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+ku(e.getShaderSource(t),r)}else return i}function Nu(e,t){let n=ju(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var Pu={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Fu(e,t){let n=Pu[t];return n===void 0?(W(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Iu=new J;function Lu(){return Ft.getLuminanceCoefficients(Iu),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Iu.x.toFixed(4)}, ${Iu.y.toFixed(4)}, ${Iu.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Ru(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Vu).join(`
`)}function zu(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Bu(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Vu(e){return e!==``}function Hu(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Uu(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Wu=/^[ \t]*#include +<([\w\d./]+)>/gm;function Gu(e){return e.replace(Wu,qu)}var Ku=new Map;function qu(e,t){let n=Nc[t];if(n===void 0){let e=Ku.get(t);if(e!==void 0)n=Nc[e],W(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return Gu(n)}var Ju=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Yu(e){return e.replace(Ju,Xu)}function Xu(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Zu(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var Qu={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function $u(e){return Qu[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var ed={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function td(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:ed[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var nd={302:`ENVMAP_MODE_REFRACTION`};function rd(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:nd[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var id={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function ad(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:id[e.combine]||`ENVMAP_BLENDING_NONE`}function od(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function sd(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=$u(n),l=td(n),u=rd(n),d=ad(n),f=od(n),p=Ru(n),m=zu(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Vu).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Vu).join(`
`),_.length>0&&(_+=`
`)):(g=[Zu(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Vu).join(`
`),_=[Zu(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.numLightProbeGrids>0?`#define USE_LIGHT_PROBES_GRID`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Nc.tonemapping_pars_fragment,n.toneMapping===0?``:Fu(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Nc.colorspace_pars_fragment,Nu(`linearToOutputTexel`,n.outputColorSpace),Lu(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Vu).join(`
`)),o=Gu(o),o=Hu(o,n),o=Uu(o,n),s=Gu(s),s=Hu(s,n),s=Uu(s,n),o=Yu(o),s=Yu(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Eu(i,i.VERTEX_SHADER,y),S=Eu(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1)if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Mu(i,x,`vertex`),n=Mu(i,S,`fragment`);G(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}else o===``?(s===``||c===``)&&(u=!1):W(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Tu(i,h),T=Bu(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Du)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Ou++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var cd=0,ld=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new ud(e),t.set(e,n)),n}},ud=class{constructor(e){this.id=cd++,this.code=e,this.usedTimes=0}};function dd(e){return e===1030||e===37490||e===36285}function fd(e,t,n,r,i,a){let o=new ln,s=new ld,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h,g){let _=u.fog,v=h.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=x&&x.mapping===306?x.image.height:null,C=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&W(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(C){let e=Pc[C];D=e.vertexShader,O=e.fragmentShader}else D=i.vertexShader,O=i.fragmentShader,s.update(i),k=s.getVertexShaderID(i),A=s.getFragmentShaderID(i);let ee=e.getRenderTarget(),te=e.state.buffers.depth.getReversed(),j=h.isInstancedMesh===!0,ne=h.isBatchedMesh===!0,M=!!i.map,N=!!i.matcap,re=!!x,ie=!!i.aoMap,ae=!!i.lightMap,oe=!!i.bumpMap,P=!!i.normalMap,se=!!i.displacementMap,ce=!!i.emissiveMap,F=!!i.metalnessMap,le=!!i.roughnessMap,ue=i.anisotropy>0,de=i.clearcoat>0,fe=i.dispersion>0,pe=i.iridescence>0,I=i.sheen>0,L=i.transmission>0,me=ue&&!!i.anisotropyMap,he=de&&!!i.clearcoatMap,ge=de&&!!i.clearcoatNormalMap,_e=de&&!!i.clearcoatRoughnessMap,ve=pe&&!!i.iridescenceMap,ye=pe&&!!i.iridescenceThicknessMap,R=I&&!!i.sheenColorMap,be=I&&!!i.sheenRoughnessMap,xe=!!i.specularMap,Se=!!i.specularColorMap,Ce=!!i.specularIntensityMap,z=L&&!!i.transmissionMap,we=L&&!!i.thicknessMap,Te=!!i.gradientMap,B=!!i.alphaMap,Ee=i.alphaTest>0,De=!!i.alphaHash,Oe=!!i.extensions,V=0;i.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(V=e.toneMapping);let ke={shaderID:C,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:O,defines:i.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:ne,batchingColor:ne&&h._colorsTexture!==null,instancing:j,instancingColor:j&&h.instanceColor!==null,instancingMorph:j&&h.morphTexture!==null,outputColorSpace:ee===null?e.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:Ft.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:M,matcap:N,envMap:re,envMapMode:re&&x.mapping,envMapCubeUVHeight:S,aoMap:ie,lightMap:ae,bumpMap:oe,normalMap:P,displacementMap:se,emissiveMap:ce,normalMapObjectSpace:P&&i.normalMapType===1,normalMapTangentSpace:P&&i.normalMapType===0,packedNormalMap:P&&i.normalMapType===0&&dd(i.normalMap.format),metalnessMap:F,roughnessMap:le,anisotropy:ue,anisotropyMap:me,clearcoat:de,clearcoatMap:he,clearcoatNormalMap:ge,clearcoatRoughnessMap:_e,dispersion:fe,iridescence:pe,iridescenceMap:ve,iridescenceThicknessMap:ye,sheen:I,sheenColorMap:R,sheenRoughnessMap:be,specularMap:xe,specularColorMap:Se,specularIntensityMap:Ce,transmission:L,transmissionMap:z,thicknessMap:we,gradientMap:Te,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:B,alphaTest:Ee,alphaHash:De,combine:i.combine,mapUv:M&&m(i.map.channel),aoMapUv:ie&&m(i.aoMap.channel),lightMapUv:ae&&m(i.lightMap.channel),bumpMapUv:oe&&m(i.bumpMap.channel),normalMapUv:P&&m(i.normalMap.channel),displacementMapUv:se&&m(i.displacementMap.channel),emissiveMapUv:ce&&m(i.emissiveMap.channel),metalnessMapUv:F&&m(i.metalnessMap.channel),roughnessMapUv:le&&m(i.roughnessMap.channel),anisotropyMapUv:me&&m(i.anisotropyMap.channel),clearcoatMapUv:he&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:ge&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:_e&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:ve&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:ye&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:R&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:be&&m(i.sheenRoughnessMap.channel),specularMapUv:xe&&m(i.specularMap.channel),specularColorMapUv:Se&&m(i.specularColorMap.channel),specularIntensityMapUv:Ce&&m(i.specularIntensityMap.channel),transmissionMapUv:z&&m(i.transmissionMap.channel),thicknessMapUv:we&&m(i.thicknessMap.channel),alphaMapUv:B&&m(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(P||ue),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!v.attributes.uv&&(M||B),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&P===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:te,skinning:h.isSkinnedMesh===!0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:g.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:V,decodeVideoTexture:M&&i.map.isVideoTexture===!0&&Ft.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:ce&&i.emissiveMap.isVideoTexture===!0&&Ft.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Oe&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Oe&&i.extensions.multiDraw===!0||ne)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return ke.vertexUv1s=c.has(1),ke.vertexUv2s=c.has(2),ke.vertexUv3s=c.has(3),c.clear(),ke}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=Pc[t];n=ts.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new sd(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function pd(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function md(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function hd(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function gd(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||md),r.length>1&&r.sort(t||hd),i.length>1&&i.sort(t||hd)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function _d(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new gd,e.set(t,[i])):n>=r.length?(i=new gd,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function vd(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new J,color:new Y};break;case`SpotLight`:n={position:new J,direction:new J,color:new Y,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new J,color:new Y,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new J,skyColor:new Y,groundColor:new Y};break;case`RectAreaLight`:n={color:new Y,position:new J,halfWidth:new J,halfHeight:new J};break}return e[t.id]=n,n}}}function yd(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new q};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new q};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new q,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=n,n}}}var bd=0;function xd(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Sd(e){let t=new vd,n=yd(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new J);let i=new J,a=new Zt,o=new Zt;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(xd);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=null;if(y.shadow&&y.shadow.map&&(C=y.shadow.map.texture.format===1030?y.shadow.map.texture:y.shadow.map.depthTexture||y.shadow.map.texture),y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=Z.LTC_FLOAT_1,r.rectAreaLTC2=Z.LTC_FLOAT_2):(r.rectAreaLTC1=Z.LTC_HALF_1,r.rectAreaLTC2=Z.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=bd++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function Cd(e){let t=new Sd(e),n=[],r=[],i=[];function a(e){d.camera=e,n.length=0,r.length=0,i.length=0}function o(e){n.push(e)}function s(e){r.push(e)}function c(e){i.push(e)}function l(){t.setup(n)}function u(e){t.setupView(n,e)}let d={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:s,pushLightProbeGrid:c}}function wd(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Cd(e),t.set(n,[a])):r>=i.length?(a=new Cd(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Td=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Ed=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Dd=[new J(1,0,0),new J(-1,0,0),new J(0,1,0),new J(0,-1,0),new J(0,0,1),new J(0,0,-1)],Od=[new J(0,-1,0),new J(0,-1,0),new J(0,0,1),new J(0,0,-1),new J(0,-1,0),new J(0,-1,0)],kd=new Zt,Ad=new J,jd=new J;function Md(e,t,n){let r=new Yi,i=new q,a=new q,s=new Kt,c=new cs,u=new ls,d={},f=n.maxTextureSize,p={0:1,1:0,2:2},m=new is({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new q},radius:{value:4}},vertexShader:Td,fragmentShader:Ed}),h=m.clone();h.defines.HORIZONTAL_PASS=1;let g=new Or;g.setAttribute(`position`,new pr(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new X(g,m),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let S=this.type;this.render=function(t,n,c){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||t.length===0)return;this.type===2&&(W(`WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead.`),this.type=1);let u=e.getRenderTarget(),d=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),m=e.state;m.setBlending(0),m.buffers.depth.getReversed()===!0?m.buffers.color.setClear(0,0,0,0):m.buffers.color.setClear(1,1,1,1),m.buffers.depth.setTest(!0),m.setScissorTest(!1);let h=S!==this.type;h&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let u=0,d=t.length;u<d;u++){let d=t[u],p=d.shadow;if(p===void 0){W(`WebGLShadowMap:`,d,`has no shadow.`);continue}if(p.autoUpdate===!1&&p.needsUpdate===!1)continue;i.copy(p.mapSize);let g=p.getFrameExtents();i.multiply(g),a.copy(p.mapSize),(i.x>f||i.y>f)&&(i.x>f&&(a.x=Math.floor(f/g.x),i.x=a.x*g.x,p.mapSize.x=a.x),i.y>f&&(a.y=Math.floor(f/g.y),i.y=a.y*g.y,p.mapSize.y=a.y));let b=e.state.buffers.depth.getReversed();if(p.camera._reversedDepth=b,p.map===null||h===!0){if(p.map!==null&&(p.map.depthTexture!==null&&(p.map.depthTexture.dispose(),p.map.depthTexture=null),p.map.dispose()),this.type===3){if(d.isPointLight){W(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}p.map=new Jt(i.x,i.y,{format:te,type:y,minFilter:l,magFilter:l,generateMipmaps:!1}),p.map.texture.name=d.name+`.shadowMap`,p.map.depthTexture=new ya(i.x,i.y,v),p.map.depthTexture.name=d.name+`.shadowMapDepth`,p.map.depthTexture.format=O,p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=o,p.map.depthTexture.magFilter=o}else d.isPointLight?(p.map=new ll(i.x),p.map.depthTexture=new ba(i.x,_)):(p.map=new Jt(i.x,i.y),p.map.depthTexture=new ya(i.x,i.y,_)),p.map.depthTexture.name=d.name+`.shadowMap`,p.map.depthTexture.format=O,this.type===1?(p.map.depthTexture.compareFunction=b?518:515,p.map.depthTexture.minFilter=l,p.map.depthTexture.magFilter=l):(p.map.depthTexture.compareFunction=null,p.map.depthTexture.minFilter=o,p.map.depthTexture.magFilter=o);p.camera.updateProjectionMatrix()}let x=p.map.isWebGLCubeRenderTarget?6:1;for(let t=0;t<x;t++){if(p.map.isWebGLCubeRenderTarget)e.setRenderTarget(p.map,t),e.clear();else{t===0&&(e.setRenderTarget(p.map),e.clear());let n=p.getViewport(t);s.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),m.viewport(s)}if(d.isPointLight){let e=p.camera,n=p.matrix,r=d.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Ad.setFromMatrixPosition(d.matrixWorld),e.position.copy(Ad),jd.copy(e.position),jd.add(Dd[t]),e.up.copy(Od[t]),e.lookAt(jd),e.updateMatrixWorld(),n.makeTranslation(-Ad.x,-Ad.y,-Ad.z),kd.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),p._frustum.setFromProjectionMatrix(kd,e.coordinateSystem,e.reversedDepth)}else p.updateMatrices(d);r=p.getFrustum(),T(n,c,p.camera,d,this.type)}p.isPointLightShadow!==!0&&this.type===3&&C(p,c),p.needsUpdate=!1}S=this.type,x.needsUpdate=!1,e.setRenderTarget(u,d,p)};function C(n,r){let a=t.update(b);m.defines.VSM_SAMPLES!==n.blurSamples&&(m.defines.VSM_SAMPLES=n.blurSamples,h.defines.VSM_SAMPLES=n.blurSamples,m.needsUpdate=!0,h.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new Jt(i.x,i.y,{format:te,type:y})),m.uniforms.shadow_pass.value=n.map.depthTexture,m.uniforms.resolution.value=n.mapSize,m.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,m,b,null),h.uniforms.shadow_pass.value=n.mapPass.texture,h.uniforms.resolution.value=n.mapSize,h.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,h,b,null)}function w(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?u:c,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=d[e];r===void 0&&(r={},d[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,E)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?p[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function T(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=w(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=w(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)T(c[e],i,a,o,s)}function E(e){e.target.removeEventListener(`dispose`,E);for(let t in d){let n=d[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Nd(e,t){function n(){let t=!1,n=new Kt,r=null,i=new Kt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?F(e.DEPTH_TEST):le(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=$e[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?F(e.STENCIL_TEST):le(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new Y(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,ee=null,te=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),j=!1,ne=0,M=e.getParameter(e.VERSION);M.indexOf(`WebGL`)===-1?M.indexOf(`OpenGL ES`)!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(M)[1]),j=ne>=2):(ne=parseFloat(/^WebGL (\d)/.exec(M)[1]),j=ne>=1);let N=null,re={},ie=e.getParameter(e.SCISSOR_BOX),ae=e.getParameter(e.VIEWPORT),oe=new Kt().fromArray(ie),P=new Kt().fromArray(ae);function se(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let ce={};ce[e.TEXTURE_2D]=se(e.TEXTURE_2D,e.TEXTURE_2D,1),ce[e.TEXTURE_CUBE_MAP]=se(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),ce[e.TEXTURE_2D_ARRAY]=se(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),ce[e.TEXTURE_3D]=se(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),F(e.DEPTH_TEST),o.setFunc(3),he(!1),ge(1),F(e.CULL_FACE),L(0);function F(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function le(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function ue(t,n){return f[t]===n?!1:(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function de(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function fe(t){return h===t?!1:(e.useProgram(t),h=t,!0)}let pe={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};pe[103]=e.MIN,pe[104]=e.MAX;let I={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function L(t,n,r,i,a,o,s,c,l,u){if(t===0){g===!0&&(le(e.BLEND),g=!1);return}if(g===!1&&(F(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:G(`WebGLState: Invalid blending: `,t);break}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:G(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:G(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:G(`WebGLState: Invalid blending: `,t);break}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}return}a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(pe[n],pe[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(I[r],I[i],I[o],I[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function me(t,n){t.side===2?le(e.CULL_FACE):F(e.CULL_FACE);let r=t.side===1;n&&(r=!r),he(r),t.blending===1&&t.transparent===!1?L(0):L(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),ve(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?F(e.SAMPLE_ALPHA_TO_COVERAGE):le(e.SAMPLE_ALPHA_TO_COVERAGE)}function he(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function ge(t){t===0?le(e.CULL_FACE):(F(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function _e(t){t!==k&&(j&&e.lineWidth(t),k=t)}function ve(t,n,r){t?(F(e.POLYGON_OFFSET_FILL),(A!==n||ee!==r)&&(A=n,ee=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):le(e.POLYGON_OFFSET_FILL)}function ye(t){t?F(e.SCISSOR_TEST):le(e.SCISSOR_TEST)}function R(t){t===void 0&&(t=e.TEXTURE0+te-1),N!==t&&(e.activeTexture(t),N=t)}function be(t,n,r){r===void 0&&(r=N===null?e.TEXTURE0+te-1:N);let i=re[r];i===void 0&&(i={type:void 0,texture:void 0},re[r]=i),(i.type!==t||i.texture!==n)&&(N!==r&&(e.activeTexture(r),N=r),e.bindTexture(t,n||ce[t]),i.type=t,i.texture=n)}function xe(){let t=re[N];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Se(){try{e.compressedTexImage2D(...arguments)}catch(e){G(`WebGLState:`,e)}}function Ce(){try{e.compressedTexImage3D(...arguments)}catch(e){G(`WebGLState:`,e)}}function z(){try{e.texSubImage2D(...arguments)}catch(e){G(`WebGLState:`,e)}}function we(){try{e.texSubImage3D(...arguments)}catch(e){G(`WebGLState:`,e)}}function Te(){try{e.compressedTexSubImage2D(...arguments)}catch(e){G(`WebGLState:`,e)}}function B(){try{e.compressedTexSubImage3D(...arguments)}catch(e){G(`WebGLState:`,e)}}function Ee(){try{e.texStorage2D(...arguments)}catch(e){G(`WebGLState:`,e)}}function De(){try{e.texStorage3D(...arguments)}catch(e){G(`WebGLState:`,e)}}function Oe(){try{e.texImage2D(...arguments)}catch(e){G(`WebGLState:`,e)}}function V(){try{e.texImage3D(...arguments)}catch(e){G(`WebGLState:`,e)}}function ke(t){return d[t]===void 0?e.getParameter(t):d[t]}function H(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function U(t){oe.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),oe.copy(t))}function Ae(t){P.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),P.copy(t))}function je(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Me(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Ne(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},N=null,re={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new Y(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,ee=null,oe.set(0,0,e.canvas.width,e.canvas.height),P.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:F,disable:le,bindFramebuffer:ue,drawBuffers:de,useProgram:fe,setBlending:L,setMaterial:me,setFlipSided:he,setCullFace:ge,setLineWidth:_e,setPolygonOffset:ve,setScissorTest:ye,activeTexture:R,bindTexture:be,unbindTexture:xe,compressedTexImage2D:Se,compressedTexImage3D:Ce,texImage2D:Oe,texImage3D:V,pixelStorei:H,getParameter:ke,updateUBOMapping:je,uniformBlockBinding:Me,texStorage2D:Ee,texStorage3D:De,texSubImage2D:z,texSubImage3D:we,compressedTexSubImage2D:Te,compressedTexSubImage3D:B,scissor:U,viewport:Ae,reset:Ne}}function Pd(e,t,n,f,p,m,h){let g=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,_=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),v=new q,y=new WeakMap,b=new Set,x,S=new WeakMap,C=!1;try{C=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function w(e,t){return C?new OffscreenCanvas(e,t):Ge(`canvas`)}function T(e,t,n){let r=1,i=ke(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1)if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);x===void 0&&(x=w(n,a));let o=t?w(n,a):x;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),W(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}else return`data`in e&&W(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e;return e}function E(e){return e.generateMipmaps}function D(t){e.generateMipmap(t)}function O(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function A(n,r,i,a,o,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];W(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c;a&&(c=t.get(`EXT_texture_norm16`),c||W(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=r;if(r===e.RED&&(i===e.FLOAT&&(l=e.R32F),i===e.HALF_FLOAT&&(l=e.R16F),i===e.UNSIGNED_BYTE&&(l=e.R8),i===e.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),i===e.SHORT&&c&&(l=c.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.R8UI),i===e.UNSIGNED_SHORT&&(l=e.R16UI),i===e.UNSIGNED_INT&&(l=e.R32UI),i===e.BYTE&&(l=e.R8I),i===e.SHORT&&(l=e.R16I),i===e.INT&&(l=e.R32I)),r===e.RG&&(i===e.FLOAT&&(l=e.RG32F),i===e.HALF_FLOAT&&(l=e.RG16F),i===e.UNSIGNED_BYTE&&(l=e.RG8),i===e.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),i===e.SHORT&&c&&(l=c.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RG8UI),i===e.UNSIGNED_SHORT&&(l=e.RG16UI),i===e.UNSIGNED_INT&&(l=e.RG32UI),i===e.BYTE&&(l=e.RG8I),i===e.SHORT&&(l=e.RG16I),i===e.INT&&(l=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGB8UI),i===e.UNSIGNED_SHORT&&(l=e.RGB16UI),i===e.UNSIGNED_INT&&(l=e.RGB32UI),i===e.BYTE&&(l=e.RGB8I),i===e.SHORT&&(l=e.RGB16I),i===e.INT&&(l=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(l=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(l=e.RGBA16UI),i===e.UNSIGNED_INT&&(l=e.RGBA32UI),i===e.BYTE&&(l=e.RGBA8I),i===e.SHORT&&(l=e.RGBA16I),i===e.INT&&(l=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),i===e.SHORT&&c&&(l=c.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(l=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(l=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?Re:Ft.getTransfer(o);i===e.FLOAT&&(l=e.RGBA32F),i===e.HALF_FLOAT&&(l=e.RGBA16F),i===e.UNSIGNED_BYTE&&(l=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),i===e.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(l=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(l=e.RGB5_A1)}return(l===e.R16F||l===e.R32F||l===e.RG16F||l===e.RG32F||l===e.RGBA16F||l===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),l}function ee(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,W(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function te(e,t){return E(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function j(e){let t=e.target;t.removeEventListener(`dispose`,j),M(t),t.isVideoTexture&&y.delete(t),t.isHTMLTexture&&b.delete(t)}function ne(e){let t=e.target;t.removeEventListener(`dispose`,ne),re(t)}function M(e){let t=f.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=S.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&N(e),Object.keys(r).length===0&&S.delete(n)}f.remove(e)}function N(t){let n=f.get(t);e.deleteTexture(n.__webglTexture);let r=t.source,i=S.get(r);delete i[n.__cacheKey],h.memory.textures--}function re(t){let n=f.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),f.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let r=t.textures;for(let t=0,n=r.length;t<n;t++){let n=f.get(r[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),h.memory.textures--),f.remove(r[t])}f.remove(t)}let ie=0;function ae(){ie=0}function oe(){return ie}function P(e){ie=e}function se(){let e=ie;return e>=p.maxTextures&&W(`WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+p.maxTextures),ie+=1,e}function ce(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function F(t,r){let i=f.get(t);if(t.isVideoTexture&&Oe(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&i.__version!==t.version){let e=t.image;if(e===null)W(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)W(`WebGLRenderer: Texture marked for update but image is incomplete`);else{_e(i,t,r);return}}else t.isExternalTexture&&(i.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,i.__webglTexture,e.TEXTURE0+r)}function le(t,r){let i=f.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&i.__version!==t.version){_e(i,t,r);return}else t.isExternalTexture&&(i.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D_ARRAY,i.__webglTexture,e.TEXTURE0+r)}function ue(t,r){let i=f.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&i.__version!==t.version){_e(i,t,r);return}n.bindTexture(e.TEXTURE_3D,i.__webglTexture,e.TEXTURE0+r)}function de(t,r){let i=f.get(t);if(t.isCubeDepthTexture!==!0&&t.version>0&&i.__version!==t.version){ve(i,t,r);return}n.bindTexture(e.TEXTURE_CUBE_MAP,i.__webglTexture,e.TEXTURE0+r)}let fe={[r]:e.REPEAT,[i]:e.CLAMP_TO_EDGE,[a]:e.MIRRORED_REPEAT},pe={[o]:e.NEAREST,[s]:e.NEAREST_MIPMAP_NEAREST,[c]:e.NEAREST_MIPMAP_LINEAR,[l]:e.LINEAR,[u]:e.LINEAR_MIPMAP_NEAREST,[d]:e.LINEAR_MIPMAP_LINEAR},I={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function L(n,r){if(r.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(r.magFilter===1006||r.magFilter===1007||r.magFilter===1005||r.magFilter===1008||r.minFilter===1006||r.minFilter===1007||r.minFilter===1005||r.minFilter===1008)&&W(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,fe[r.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,fe[r.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,fe[r.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,pe[r.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,pe[r.minFilter]),r.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,I[r.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(r.magFilter===1003||r.minFilter!==1005&&r.minFilter!==1008||r.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(r.anisotropy>1||f.get(r).__currentAnisotropy){let i=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,i.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(r.anisotropy,p.getMaxAnisotropy())),f.get(r).__currentAnisotropy=r.anisotropy}}}function me(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,j));let i=n.source,a=S.get(i);a===void 0&&(a={},S.set(i,a));let o=ce(n);if(o!==t.__cacheKey){a[o]===void 0&&(a[o]={texture:e.createTexture(),usedTimes:0},h.memory.textures++,r=!0),a[o].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&N(n)),t.__cacheKey=o,t.__webglTexture=a[o].texture}return r}function he(e,t,n){return Math.floor(Math.floor(e/n)/t)}function ge(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=he(n.start,r.width,4),c=he(t.start,r.width,4);n.start<=i+1&&a===c&&he(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function _e(t,r,i){let a=e.TEXTURE_2D;(r.isDataArrayTexture||r.isCompressedArrayTexture)&&(a=e.TEXTURE_2D_ARRAY),r.isData3DTexture&&(a=e.TEXTURE_3D);let o=me(t,r),s=r.source;n.bindTexture(a,t.__webglTexture,e.TEXTURE0+i);let c=f.get(s);if(s.version!==c.__version||o===!0){if(n.activeTexture(e.TEXTURE0+i),!(typeof ImageBitmap<`u`&&r.image instanceof ImageBitmap)){let t=Ft.getPrimaries(Ft.workingColorSpace),i=r.colorSpace===``?null:Ft.getPrimaries(r.colorSpace),a=r.colorSpace===``||t===i?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,r.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,r.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,a)}n.pixelStorei(e.UNPACK_ALIGNMENT,r.unpackAlignment);let t=T(r.image,!1,p.maxTextureSize);t=V(r,t);let l=m.convert(r.format,r.colorSpace),u=m.convert(r.type),d=A(r.internalFormat,l,u,r.normalized,r.colorSpace,r.isVideoTexture);L(a,r);let f,h=r.mipmaps,g=r.isVideoTexture!==!0,_=c.__version===void 0||o===!0,v=s.dataReady,y=te(r,t);if(r.isDepthTexture)d=ee(r.format===k,r.type),_&&(g?n.texStorage2D(e.TEXTURE_2D,1,d,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,d,t.width,t.height,0,l,u,null));else if(r.isDataTexture)if(h.length>0){g&&_&&n.texStorage2D(e.TEXTURE_2D,y,d,h[0].width,h[0].height);for(let t=0,r=h.length;t<r;t++)f=h[t],g?v&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,l,u,f.data):n.texImage2D(e.TEXTURE_2D,t,d,f.width,f.height,0,l,u,f.data);r.generateMipmaps=!1}else g?(_&&n.texStorage2D(e.TEXTURE_2D,y,d,t.width,t.height),v&&ge(r,t,l,u)):n.texImage2D(e.TEXTURE_2D,0,d,t.width,t.height,0,l,u,t.data);else if(r.isCompressedTexture)if(r.isCompressedArrayTexture){g&&_&&n.texStorage3D(e.TEXTURE_2D_ARRAY,y,d,h[0].width,h[0].height,t.depth);for(let i=0,a=h.length;i<a;i++)if(f=h[i],r.format!==1023)if(l!==null)if(g){if(v)if(r.layerUpdates.size>0){let t=kc(f.width,f.height,r.format,r.type);for(let a of r.layerUpdates){let r=f.data.subarray(a*t/f.data.BYTES_PER_ELEMENT,(a+1)*t/f.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,a,f.width,f.height,1,l,r)}r.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,f.width,f.height,t.depth,l,f.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,i,d,f.width,f.height,t.depth,0,f.data,0,0);else W(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`);else g?v&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,i,0,0,0,f.width,f.height,t.depth,l,u,f.data):n.texImage3D(e.TEXTURE_2D_ARRAY,i,d,f.width,f.height,t.depth,0,l,u,f.data)}else{g&&_&&n.texStorage2D(e.TEXTURE_2D,y,d,h[0].width,h[0].height);for(let t=0,i=h.length;t<i;t++)f=h[t],r.format===1023?g?v&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,l,u,f.data):n.texImage2D(e.TEXTURE_2D,t,d,f.width,f.height,0,l,u,f.data):l===null?W(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):g?v&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,f.width,f.height,l,f.data):n.compressedTexImage2D(e.TEXTURE_2D,t,d,f.width,f.height,0,f.data)}else if(r.isDataArrayTexture)if(g){if(_&&n.texStorage3D(e.TEXTURE_2D_ARRAY,y,d,t.width,t.height,t.depth),v)if(r.layerUpdates.size>0){let i=kc(t.width,t.height,r.format,r.type);for(let a of r.layerUpdates){let r=t.data.subarray(a*i/t.data.BYTES_PER_ELEMENT,(a+1)*i/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,a,t.width,t.height,1,l,u,r)}r.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,l,u,t.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,d,t.width,t.height,t.depth,0,l,u,t.data);else if(r.isData3DTexture)g?(_&&n.texStorage3D(e.TEXTURE_3D,y,d,t.width,t.height,t.depth),v&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,l,u,t.data)):n.texImage3D(e.TEXTURE_3D,0,d,t.width,t.height,t.depth,0,l,u,t.data);else if(r.isFramebufferTexture){if(_)if(g)n.texStorage2D(e.TEXTURE_2D,y,d,t.width,t.height);else{let r=t.width,i=t.height;for(let t=0;t<y;t++)n.texImage2D(e.TEXTURE_2D,t,d,r,i,0,l,u,null),r>>=1,i>>=1}}else if(r.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),b.add(r),n.onpaint=e=>{let t=e.changedElements;for(let e of b)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}let i=e.RGBA,a=e.RGBA,o=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,i,a,o,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(h.length>0){if(g&&_){let t=ke(h[0]);n.texStorage2D(e.TEXTURE_2D,y,d,t.width,t.height)}for(let t=0,r=h.length;t<r;t++)f=h[t],g?v&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,l,u,f):n.texImage2D(e.TEXTURE_2D,t,d,l,u,f);r.generateMipmaps=!1}else if(g){if(_){let r=ke(t);n.texStorage2D(e.TEXTURE_2D,y,d,r.width,r.height)}v&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,l,u,t)}else n.texImage2D(e.TEXTURE_2D,0,d,l,u,t);E(r)&&D(a),c.__version=s.version,r.onUpdate&&r.onUpdate(r)}t.__version=r.version}function ve(t,r,i){if(r.image.length!==6)return;let a=me(t,r),o=r.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+i);let s=f.get(o);if(o.version!==s.__version||a===!0){n.activeTexture(e.TEXTURE0+i);let t=Ft.getPrimaries(Ft.workingColorSpace),c=r.colorSpace===``?null:Ft.getPrimaries(r.colorSpace),l=r.colorSpace===``||t===c?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,r.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,r.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,r.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,l);let u=r.isCompressedTexture||r.image[0].isCompressedTexture,d=r.image[0]&&r.image[0].isDataTexture,f=[];for(let e=0;e<6;e++)!u&&!d?f[e]=T(r.image[e],!0,p.maxCubemapSize):f[e]=d?r.image[e].image:r.image[e],f[e]=V(r,f[e]);let h=f[0],g=m.convert(r.format,r.colorSpace),_=m.convert(r.type),v=A(r.internalFormat,g,_,r.normalized,r.colorSpace),y=r.isVideoTexture!==!0,b=s.__version===void 0||a===!0,x=o.dataReady,S=te(r,h);L(e.TEXTURE_CUBE_MAP,r);let C;if(u){y&&b&&n.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,h.width,h.height);for(let t=0;t<6;t++){C=f[t].mipmaps;for(let i=0;i<C.length;i++){let a=C[i];r.format===1023?y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,i,0,0,a.width,a.height,g,_,a.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,i,v,a.width,a.height,0,g,_,a.data):g===null?W(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):y?x&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,i,0,0,a.width,a.height,g,a.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,i,v,a.width,a.height,0,a.data)}}}else{if(C=r.mipmaps,y&&b){C.length>0&&S++;let t=ke(f[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,S,v,t.width,t.height)}for(let t=0;t<6;t++)if(d){y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,f[t].width,f[t].height,g,_,f[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,f[t].width,f[t].height,0,g,_,f[t].data);for(let r=0;r<C.length;r++){let i=C[r].image[t].image;y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,g,_,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,v,i.width,i.height,0,g,_,i.data)}}else{y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,_,f[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,v,g,_,f[t]);for(let r=0;r<C.length;r++){let i=C[r];y?x&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,g,_,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,v,g,_,i.image[t])}}}E(r)&&D(e.TEXTURE_CUBE_MAP),s.__version=o.version,r.onUpdate&&r.onUpdate(r)}t.__version=r.version}function ye(t,r,i,a,o,s){let c=m.convert(i.format,i.colorSpace),l=m.convert(i.type),u=A(i.internalFormat,c,l,i.normalized,i.colorSpace),d=f.get(r),p=f.get(i);if(p.__renderTarget=r,!d.__hasExternalTextures){let t=Math.max(1,r.width>>s),i=Math.max(1,r.height>>s);o===e.TEXTURE_3D||o===e.TEXTURE_2D_ARRAY?n.texImage3D(o,s,u,t,i,r.depth,0,c,l,null):n.texImage2D(o,s,u,t,i,0,c,l,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),De(r)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,a,o,p.__webglTexture,0,Ee(r)):(o===e.TEXTURE_2D||o>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&o<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,a,o,p.__webglTexture,s),n.bindFramebuffer(e.FRAMEBUFFER,null)}function R(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=ee(n.stencilBuffer,a),s=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;De(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Ee(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Ee(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,s,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let a=t[i],o=m.convert(a.format,a.colorSpace),s=m.convert(a.type),c=A(a.internalFormat,o,s,a.normalized,a.colorSpace);De(n)?g.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,Ee(n),c,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,Ee(n),c,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,c,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function be(t,r,i){let a=r.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(r.depthTexture&&r.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let o=f.get(r.depthTexture);if(o.__renderTarget=r,(!o.__webglTexture||r.depthTexture.image.width!==r.width||r.depthTexture.image.height!==r.height)&&(r.depthTexture.image.width=r.width,r.depthTexture.image.height=r.height,r.depthTexture.needsUpdate=!0),a){if(o.__webglInit===void 0&&(o.__webglInit=!0,r.depthTexture.addEventListener(`dispose`,j)),o.__webglTexture===void 0){o.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,o.__webglTexture),L(e.TEXTURE_CUBE_MAP,r.depthTexture);let t=m.convert(r.depthTexture.format),i=m.convert(r.depthTexture.type),a;r.depthTexture.format===1026?a=e.DEPTH_COMPONENT24:r.depthTexture.format===1027&&(a=e.DEPTH24_STENCIL8);for(let n=0;n<6;n++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0,a,r.width,r.height,0,t,i,null)}}else F(r.depthTexture,0);let s=o.__webglTexture,c=Ee(r),l=a?e.TEXTURE_CUBE_MAP_POSITIVE_X+i:e.TEXTURE_2D,u=r.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(r.depthTexture.format===1026)De(r)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,u,l,s,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,u,l,s,0);else if(r.depthTexture.format===1027)De(r)?g.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,u,l,s,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,u,l,s,0);else throw Error(`Unknown depthTexture format`)}function xe(t){let r=f.get(t),i=t.isWebGLCubeRenderTarget===!0;if(r.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(r.__depthDisposeCallback&&r.__depthDisposeCallback(),e){let t=()=>{delete r.__boundDepthTexture,delete r.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),r.__depthDisposeCallback=t}r.__boundDepthTexture=e}if(t.depthTexture&&!r.__autoAllocateDepthBuffer)if(i)for(let e=0;e<6;e++)be(r.__webglFramebuffer[e],t,e);else{let e=t.texture.mipmaps;e&&e.length>0?be(r.__webglFramebuffer[0],t,0):be(r.__webglFramebuffer,t,0)}else if(i){r.__webglDepthbuffer=[];for(let i=0;i<6;i++)if(n.bindFramebuffer(e.FRAMEBUFFER,r.__webglFramebuffer[i]),r.__webglDepthbuffer[i]===void 0)r.__webglDepthbuffer[i]=e.createRenderbuffer(),R(r.__webglDepthbuffer[i],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=r.__webglDepthbuffer[i];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let i=t.texture.mipmaps;if(i&&i.length>0?n.bindFramebuffer(e.FRAMEBUFFER,r.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,r.__webglFramebuffer),r.__webglDepthbuffer===void 0)r.__webglDepthbuffer=e.createRenderbuffer(),R(r.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,i=r.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,i),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,i)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function Se(t,n,r){let i=f.get(t);n!==void 0&&ye(i.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),r!==void 0&&xe(t)}function Ce(t){let r=t.texture,i=f.get(t),a=f.get(r);t.addEventListener(`dispose`,ne);let o=t.textures,s=t.isWebGLCubeRenderTarget===!0,c=o.length>1;if(c||(a.__webglTexture===void 0&&(a.__webglTexture=e.createTexture()),a.__version=r.version,h.memory.textures++),s){i.__webglFramebuffer=[];for(let t=0;t<6;t++)if(r.mipmaps&&r.mipmaps.length>0){i.__webglFramebuffer[t]=[];for(let n=0;n<r.mipmaps.length;n++)i.__webglFramebuffer[t][n]=e.createFramebuffer()}else i.__webglFramebuffer[t]=e.createFramebuffer()}else{if(r.mipmaps&&r.mipmaps.length>0){i.__webglFramebuffer=[];for(let t=0;t<r.mipmaps.length;t++)i.__webglFramebuffer[t]=e.createFramebuffer()}else i.__webglFramebuffer=e.createFramebuffer();if(c)for(let t=0,n=o.length;t<n;t++){let n=f.get(o[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),h.memory.textures++)}if(t.samples>0&&De(t)===!1){i.__webglMultisampledFramebuffer=e.createFramebuffer(),i.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,i.__webglMultisampledFramebuffer);for(let n=0;n<o.length;n++){let r=o[n];i.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,i.__webglColorRenderbuffer[n]);let a=m.convert(r.format,r.colorSpace),s=m.convert(r.type),c=A(r.internalFormat,a,s,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),l=Ee(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,l,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,i.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(i.__webglDepthRenderbuffer=e.createRenderbuffer(),R(i.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(s){n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture),L(e.TEXTURE_CUBE_MAP,r);for(let n=0;n<6;n++)if(r.mipmaps&&r.mipmaps.length>0)for(let a=0;a<r.mipmaps.length;a++)ye(i.__webglFramebuffer[n][a],t,r,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,a);else ye(i.__webglFramebuffer[n],t,r,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);E(r)&&D(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(c){for(let r=0,a=o.length;r<a;r++){let a=o[r],s=f.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,s.__webglTexture),L(c,a),ye(i.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+r,c,0),E(a)&&D(c)}n.unbindTexture()}else{let o=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(o=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(o,a.__webglTexture),L(o,r),r.mipmaps&&r.mipmaps.length>0)for(let n=0;n<r.mipmaps.length;n++)ye(i.__webglFramebuffer[n],t,r,e.COLOR_ATTACHMENT0,o,n);else ye(i.__webglFramebuffer,t,r,e.COLOR_ATTACHMENT0,o,0);E(r)&&D(o),n.unbindTexture()}t.depthBuffer&&xe(t)}function z(e){let t=e.textures;for(let r=0,i=t.length;r<i;r++){let i=t[r];if(E(i)){let t=O(e),r=f.get(i).__webglTexture;n.bindTexture(t,r),D(t),n.unbindTexture()}}}let we=[],Te=[];function B(t){if(t.samples>0){if(De(t)===!1){let r=t.textures,i=t.width,a=t.height,o=e.COLOR_BUFFER_BIT,s=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,c=f.get(t),l=r.length>1;if(l)for(let t=0;t<r.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,c.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,c.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,c.__webglMultisampledFramebuffer);let u=t.texture.mipmaps;u&&u.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,c.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,c.__webglFramebuffer);for(let n=0;n<r.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(o|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(o|=e.STENCIL_BUFFER_BIT)),l){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,c.__webglColorRenderbuffer[n]);let t=f.get(r[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,i,a,0,0,i,a,o,e.NEAREST),_===!0&&(we.length=0,Te.length=0,we.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(we.push(s),Te.push(s),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Te)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,we))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),l)for(let t=0;t<r.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,c.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,c.__webglColorRenderbuffer[t]);let i=f.get(r[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,c.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,i,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,c.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&_){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function Ee(e){return Math.min(p.maxSamples,e.samples)}function De(e){let n=f.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function Oe(e){let t=h.render.frame;y.get(e)!==t&&(y.set(e,t),e.update())}function V(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Ft.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&W(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):G(`WebGLTextures: Unsupported texture color space:`,n)),t}function ke(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(v.width=e.naturalWidth||e.width,v.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(v.width=e.displayWidth,v.height=e.displayHeight):(v.width=e.width,v.height=e.height),v}this.allocateTextureUnit=se,this.resetTextureUnits=ae,this.getTextureUnits=oe,this.setTextureUnits=P,this.setTexture2D=F,this.setTexture2DArray=le,this.setTexture3D=ue,this.setTextureCube=de,this.rebindTextures=Se,this.setupRenderTarget=Ce,this.updateRenderTargetMipmap=z,this.updateMultisampleRenderTarget=B,this.setupDepthRenderbuffer=xe,this.setupFrameBufferTexture=ye,this.useMultisampledRTT=De,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function Fd(e,t){function n(n,r=``){let i,a=Ft.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779)if(a===`srgb`)if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===35840||n===35841||n===35842||n===35843)if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491)if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821)if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===36492||n===36494||n===36495)if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===36283||n===36284||n===36285||n===36286)if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Id=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ld=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Rd=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new xa(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new is({vertexShader:Id,fragmentShader:Ld,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new X(new qo(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},zd=class extends et{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,p=null,m=null,h=typeof XRWebGLBinding<`u`,g=new Rd,v={},y=t.getContextAttributes(),b=null,x=null,C=[],w=[],T=new q,E=null,A=new $s;A.viewport=new Kt;let ee=new $s;ee.viewport=new Kt;let te=[A,ee],j=new mc,ne=null,M=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new On,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new On,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new On,C[e]=t),t.getHandSpace()};function N(e){let t=w.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function re(){r.removeEventListener(`select`,N),r.removeEventListener(`selectstart`,N),r.removeEventListener(`selectend`,N),r.removeEventListener(`squeeze`,N),r.removeEventListener(`squeezestart`,N),r.removeEventListener(`squeezeend`,N),r.removeEventListener(`end`,re),r.removeEventListener(`inputsourceschange`,ie);for(let e=0;e<C.length;e++){let t=w[e];t!==null&&(w[e]=null,C[e].disconnect(t))}ne=null,M=null,g.reset();for(let e in v)delete v[e];e.setRenderTarget(b),p=null,d=null,u=null,r=null,x=null,ue.stop(),n.isPresenting=!1,e.setPixelRatio(E),e.setSize(T.width,T.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&W(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&W(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?p:d},this.getBinding=function(){return u===null&&h&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return m},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(b=e.getRenderTarget(),r.addEventListener(`select`,N),r.addEventListener(`selectstart`,N),r.addEventListener(`selectend`,N),r.addEventListener(`squeeze`,N),r.addEventListener(`squeezestart`,N),r.addEventListener(`squeezeend`,N),r.addEventListener(`end`,re),r.addEventListener(`inputsourceschange`,ie),y.xrCompatible!==!0&&await t.makeXRCompatible(),E=e.getPixelRatio(),e.getSize(T),h&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;y.depth&&(o=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=y.stencil?k:O,a=y.stencil?S:_);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),x=new Jt(d.textureWidth,d.textureHeight,{format:D,type:f,depthTexture:new ya(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:i};p=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),x=new Jt(p.framebufferWidth,p.framebufferHeight,{format:D,type:f,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),ue.setContext(r),ue.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function ie(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=w.indexOf(n);r>=0&&(w[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=w.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=w.length){w.push(n),r=e;break}else if(w[e]===null){w[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}let ae=new J,oe=new J;function P(e,t,n){ae.setFromMatrixPosition(t.matrixWorld),oe.setFromMatrixPosition(n.matrixWorld);let r=ae.distanceTo(oe),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function se(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;g.texture!==null&&(g.depthNear>0&&(t=g.depthNear),g.depthFar>0&&(n=g.depthFar)),j.near=ee.near=A.near=t,j.far=ee.far=A.far=n,(ne!==j.near||M!==j.far)&&(r.updateRenderState({depthNear:j.near,depthFar:j.far}),ne=j.near,M=j.far),j.layers.mask=e.layers.mask|6,A.layers.mask=j.layers.mask&-5,ee.layers.mask=j.layers.mask&-3;let i=e.parent,a=j.cameras;se(j,i);for(let e=0;e<a.length;e++)se(a[e],i);a.length===2?P(j,A,ee):j.projectionMatrix.copy(A.projectionMatrix),ce(e,j,i)};function ce(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=it*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return j},this.getFoveation=function(){if(!(d===null&&p===null))return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(j)},this.getCameraTexture=function(e){return v[e]};let F=null;function le(t,i){if(l=i.getViewerPose(c||a),m=i,l!==null){let t=l.views;p!==null&&(e.setRenderTargetFramebuffer(x,p.framebuffer),e.setRenderTarget(x));let i=!1;t.length!==j.cameras.length&&(j.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(p!==null)a=p.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(x,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(x))}let o=te[n];o===void 0&&(o=new $s,o.layers.enable(n),o.viewport=new Kt,te[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(j.matrix.copy(o.matrix),j.matrix.decompose(j.position,j.quaternion,j.scale)),i===!0&&j.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&h){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&g.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&h){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new xa,v[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=w[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}F&&F(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),m=null}let ue=new jc;ue.setAnimationLoop(le),this.setAnimationLoop=function(e){F=e},this.dispose=function(){}}},Bd=new Zt,Vd=new At;Vd.set(-1,0,0,0,1,0,0,0,1);function Hd(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,es(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Bd.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(Vd),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Ud(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return G(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):ArrayBuffer.isView(o)?i.__data.set(new o.constructor(o.buffer,o.byteOffset,i.__data.length)):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return typeof i==`number`||typeof i==`boolean`?r[a]=i:ArrayBuffer.isView(i)?r[a]=i.slice():r[a]=i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(ArrayBuffer.isView(i))return!0;else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?W(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(t.boundary=16,t.storage=e.byteLength):W(`WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var Wd=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Gd=null;function Kd(){return Gd===null&&(Gd=new ki(Wd,16,16,te,y),Gd.name=`DFG_LUT`,Gd.minFilter=l,Gd.magFilter=l,Gd.wrapS=i,Gd.wrapT=i,Gd.generateMipmaps=!1,Gd.needsUpdate=!0),Gd}var qd=class{constructor(e={}){let{canvas:t=Ke(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:p=!1,outputBufferType:m=f}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);g=n.getContextAttributes().alpha}else g=a;let v=m,C=new Set([ne,j,ee]),w=new Set([f,_,h,S,b,x]),T=new Uint32Array(4),E=new Int32Array(4),D=new J,O=null,k=null,A=[],te=[],M=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let N=this,re=!1,ie=null;this._outputColorSpace=Ie;let ae=0,oe=0,P=null,se=-1,ce=null,F=new Kt,le=new Kt,ue=null,de=new Y(0),fe=0,pe=t.width,I=t.height,L=1,me=null,he=null,ge=new Kt(0,0,pe,I),_e=new Kt(0,0,pe,I),ve=!1,ye=new Yi,R=!1,be=!1,xe=new Zt,Se=new J,Ce=new Kt,z={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},we=!1;function Te(){return P===null?L:1}let B=n;function Ee(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r184`),t.addEventListener(`webglcontextlost`,et,!1),t.addEventListener(`webglcontextrestored`,tt,!1),t.addEventListener(`webglcontextcreationerror`,nt,!1),B===null){let t=`webgl2`;if(B=Ee(t,e),B===null)throw Ee(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw G(`WebGLRenderer: `+e.message),e}let De,Oe,V,ke,H,U,Ae,je,Me,Ne,Pe,Fe,Le,Re,ze,Be,Ve,Ue,We,Ge,qe,Je,Xe;function Ze(){De=new dl(B),De.init(),qe=new Fd(B,De),Oe=new Vc(B,De,e,qe),V=new Nd(B,De),Oe.reversedDepthBuffer&&p&&V.buffers.depth.setReversed(!0),ke=new ml(B),H=new pd,U=new Pd(B,De,V,H,Oe,qe,ke),Ae=new ul(N),je=new Mc(B),Je=new zc(B,je),Me=new fl(B,je,ke,Je),Ne=new gl(B,Me,je,Je,ke),Ue=new hl(B,Oe,U),ze=new Hc(H),Pe=new fd(N,Ae,De,Oe,Je,ze),Fe=new Hd(N,H),Le=new _d,Re=new wd(De),Ve=new Rc(N,Ae,V,Ne,g,s),Be=new Md(N,Ne,Oe),Xe=new Ud(B,ke,Oe,V),We=new Bc(B,De,ke),Ge=new pl(B,De,ke),ke.programs=Pe.programs,N.capabilities=Oe,N.extensions=De,N.properties=H,N.renderLists=Le,N.shadowMap=Be,N.state=V,N.info=ke}Ze(),v!==1009&&(M=new vl(v,t.width,t.height,r,i));let $e=new zd(N,B);this.xr=$e,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let e=De.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=De.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return L},this.setPixelRatio=function(e){e!==void 0&&(L=e,this.setSize(pe,I,!1))},this.getSize=function(e){return e.set(pe,I)},this.setSize=function(e,n,r=!0){if($e.isPresenting){W(`WebGLRenderer: Can't change size while VR device is presenting.`);return}pe=e,I=n,t.width=Math.floor(e*L),t.height=Math.floor(n*L),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),M!==null&&M.setSize(t.width,t.height),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(pe*L,I*L).floor()},this.setDrawingBufferSize=function(e,n,r){pe=e,I=n,L=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(v===1009){G(`THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);return}if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){W(`THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}M.setEffects(e||[])},this.getCurrentViewport=function(e){return e.copy(F)},this.getViewport=function(e){return e.copy(ge)},this.setViewport=function(e,t,n,r){e.isVector4?ge.set(e.x,e.y,e.z,e.w):ge.set(e,t,n,r),V.viewport(F.copy(ge).multiplyScalar(L).round())},this.getScissor=function(e){return e.copy(_e)},this.setScissor=function(e,t,n,r){e.isVector4?_e.set(e.x,e.y,e.z,e.w):_e.set(e,t,n,r),V.scissor(le.copy(_e).multiplyScalar(L).round())},this.getScissorTest=function(){return ve},this.setScissorTest=function(e){V.setScissorTest(ve=e)},this.setOpaqueSort=function(e){me=e},this.setTransparentSort=function(e){he=e},this.getClearColor=function(e){return e.copy(Ve.getClearColor())},this.setClearColor=function(){Ve.setClearColor(...arguments)},this.getClearAlpha=function(){return Ve.getClearAlpha()},this.setClearAlpha=function(){Ve.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(P!==null){let t=P.texture.format;e=C.has(t)}if(e){let e=P.texture.type,t=w.has(e),n=Ve.getClearColor(),r=Ve.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(T[0]=i,T[1]=a,T[2]=o,T[3]=r,B.clearBufferuiv(B.COLOR,0,T)):(E[0]=i,E[1]=a,E[2]=o,E[3]=r,B.clearBufferiv(B.COLOR,0,E))}else r|=B.COLOR_BUFFER_BIT}t&&(r|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&B.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),ie=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,et,!1),t.removeEventListener(`webglcontextrestored`,tt,!1),t.removeEventListener(`webglcontextcreationerror`,nt,!1),Ve.dispose(),Le.dispose(),Re.dispose(),H.dispose(),Ae.dispose(),Ne.dispose(),Je.dispose(),Xe.dispose(),Pe.dispose(),$e.dispose(),$e.removeEventListener(`sessionstart`,lt),$e.removeEventListener(`sessionend`,ut),K.stop()};function et(e){e.preventDefault(),Ye(`WebGLRenderer: Context Lost.`),re=!0}function tt(){Ye(`WebGLRenderer: Context Restored.`),re=!1;let e=ke.autoReset,t=Be.enabled,n=Be.autoUpdate,r=Be.needsUpdate,i=Be.type;Ze(),ke.autoReset=e,Be.enabled=t,Be.autoUpdate=n,Be.needsUpdate=r,Be.type=i}function nt(e){G(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function rt(e){let t=e.target;t.removeEventListener(`dispose`,rt),it(t)}function it(e){at(e),H.remove(e)}function at(e){let t=H.get(e).programs;t!==void 0&&(t.forEach(function(e){Pe.releaseProgram(e)}),e.isShaderMaterial&&Pe.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=z);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=bt(e,t,n,r,i);V.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Me.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Je.setup(i,r,s,n,c);let h,g=We;if(c!==null&&(h=je.get(c),g=Ge,g.setIndex(h)),i.isMesh)r.wireframe===!0?(V.setLineWidth(r.wireframeLinewidth*Te()),g.setMode(B.LINES)):g.setMode(B.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),V.setLineWidth(e*Te()),i.isLineSegments?g.setMode(B.LINES):i.isLineLoop?g.setMode(B.LINE_LOOP):g.setMode(B.LINE_STRIP)}else i.isPoints?g.setMode(B.POINTS):i.isSprite&&g.setMode(B.TRIANGLES);if(i.isBatchedMesh)if(De.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?je.get(c).bytesPerElement:1,o=H.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(B,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function ot(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,gt(e,t,n),e.side=0,e.needsUpdate=!0,gt(e,t,n),e.side=2):gt(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),k=Re.get(n),k.init(t),te.push(k),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(k.pushLight(e),e.castShadow&&k.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(k.pushLight(e),e.castShadow&&k.pushShadow(e))}),k.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t)if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];ot(a,n,e),r.add(a)}else ot(t,n,e),r.add(t)}),k=te.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){H.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}De.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let st=null;function ct(e){st&&st(e)}function lt(){K.stop()}function ut(){K.start()}let K=new jc;K.setAnimationLoop(ct),typeof self<`u`&&K.setContext(self),this.setAnimationLoop=function(e){st=e,$e.setAnimationLoop(e),e===null?K.stop():K.start()},$e.addEventListener(`sessionstart`,lt),$e.addEventListener(`sessionend`,ut),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){G(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(re===!0)return;ie!==null&&ie.renderStart(e,t);let n=$e.enabled===!0&&$e.isPresenting===!0,r=M!==null&&(P===null||n)&&M.begin(N,P);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),$e.enabled===!0&&$e.isPresenting===!0&&(M===null||M.isCompositing()===!1)&&($e.cameraAutoUpdate===!0&&$e.updateCamera(t),t=$e.getCamera()),e.isScene===!0&&e.onBeforeRender(N,e,t,P),k=Re.get(e,te.length),k.init(t),k.state.textureUnits=U.getTextureUnits(),te.push(k),xe.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),ye.setFromProjectionMatrix(xe,He,t.reversedDepth),be=this.localClippingEnabled,R=ze.init(this.clippingPlanes,be),O=Le.get(e,A.length),O.init(),A.push(O),$e.enabled===!0&&$e.isPresenting===!0){let e=N.xr.getDepthSensingMesh();e!==null&&dt(e,t,-1/0,N.sortObjects)}dt(e,t,0,N.sortObjects),O.finish(),N.sortObjects===!0&&O.sort(me,he),we=$e.enabled===!1||$e.isPresenting===!1||$e.hasDepthSensing()===!1,we&&Ve.addToRenderList(O,e),this.info.render.frame++,R===!0&&ze.beginShadows();let i=k.state.shadowsArray;if(Be.render(i,e,t),R===!0&&ze.endShadows(),this.info.autoReset===!0&&this.info.reset(),(r&&M.hasRenderPass())===!1){let n=O.opaque,r=O.transmissive;if(k.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];pt(n,r,e,a)}we&&Ve.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];ft(O,e,n,n.viewport)}}else r.length>0&&pt(n,r,e,t),we&&Ve.render(e),ft(O,e,t)}P!==null&&oe===0&&(U.updateMultisampleRenderTarget(P),U.updateRenderTargetMipmap(P)),r&&M.end(N),e.isScene===!0&&e.onAfterRender(N,e,t),Je.resetDefaultState(),se=-1,ce=null,te.pop(),te.length>0?(k=te[te.length-1],U.setTextureUnits(k.state.textureUnits),R===!0&&ze.setGlobalState(N.clippingPlanes,k.state.camera)):k=null,A.pop(),O=A.length>0?A[A.length-1]:null,ie!==null&&ie.renderEnd()};function dt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLightProbeGrid)k.pushLightProbeGrid(e);else if(e.isLight)k.pushLight(e),e.castShadow&&k.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||ye.intersectsSprite(e)){r&&Ce.setFromMatrixPosition(e.matrixWorld).applyMatrix4(xe);let t=Ne.update(e),i=e.material;i.visible&&O.push(e,t,i,n,Ce.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||ye.intersectsObject(e))){let t=Ne.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),Ce.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),Ce.copy(e.boundingSphere.center)),Ce.applyMatrix4(e.matrixWorld).applyMatrix4(xe)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&O.push(e,t,s,n,Ce.z,o)}}else i.visible&&O.push(e,t,i,n,Ce.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)dt(i[e],t,n,r)}function ft(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;k.setupLightsView(n),R===!0&&ze.setGlobalState(N.clippingPlanes,n),r&&V.viewport(F.copy(r)),i.length>0&&mt(i,t,n),a.length>0&&mt(a,t,n),o.length>0&&mt(o,t,n),V.buffers.depth.setTest(!0),V.buffers.depth.setMask(!0),V.buffers.color.setMask(!0),V.setPolygonOffset(!1)}function pt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(k.state.transmissionRenderTarget[r.id]===void 0){let e=De.has(`EXT_color_buffer_half_float`)||De.has(`EXT_color_buffer_float`);k.state.transmissionRenderTarget[r.id]=new Jt(1,1,{generateMipmaps:!0,type:e?y:f,minFilter:d,samples:Math.max(4,Oe.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ft.workingColorSpace})}let a=k.state.transmissionRenderTarget[r.id],o=r.viewport||F;a.setSize(o.z*N.transmissionResolutionScale,o.w*N.transmissionResolutionScale);let s=N.getRenderTarget(),c=N.getActiveCubeFace(),l=N.getActiveMipmapLevel();N.setRenderTarget(a),N.getClearColor(de),fe=N.getClearAlpha(),fe<1&&N.setClearColor(16777215,.5),N.clear(),we&&Ve.render(n);let u=N.toneMapping;N.toneMapping=0;let p=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),k.setupLightsView(r),R===!0&&ze.setGlobalState(N.clippingPlanes,r),mt(e,n,r),U.updateMultisampleRenderTarget(a),U.updateRenderTargetMipmap(a),De.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,ht(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(U.updateMultisampleRenderTarget(a),U.updateRenderTargetMipmap(a))}N.setRenderTarget(s,c,l),N.setClearColor(de,fe),p!==void 0&&(r.viewport=p),N.toneMapping=u}function mt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&ht(o,t,n,s,l,c)}}function ht(e,t,n,r,i,a){e.onBeforeRender(N,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(N,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,N.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,N.renderBufferDirect(n,t,r,i,e,a),i.side=2):N.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(N,t,n,r,i,a)}function gt(e,t,n){t.isScene!==!0&&(t=z);let r=H.get(e),i=k.state.lights,a=k.state.shadowsArray,o=i.state.version,s=Pe.getParameters(e,i.state,a,t,n,k.state.lightProbeGridArray),c=Pe.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Ae.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,rt),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return vt(e,s),d}else s.uniforms=Pe.getUniforms(e),ie!==null&&e.isNodeMaterial&&ie.build(e,n,s),e.onBeforeCompile(s,N),d=Pe.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=ze.uniform),vt(e,s),r.needsLights=St(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.lightProbeGrid=k.state.lightProbeGridArray.length>0,r.currentProgram=d,r.uniformsList=null,d}function _t(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Tu.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function vt(e,t){let n=H.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function yt(e,t){if(e.length===0)return null;if(e.length===1)return e[0].texture===null?null:e[0];D.setFromMatrixPosition(t.matrixWorld);for(let t=0,n=e.length;t<n;t++){let n=e[t];if(n.texture!==null&&n.boundingBox.containsPoint(D))return n}return null}function bt(e,t,n,r,i){t.isScene!==!0&&(t=z),U.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=P===null?N.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:Ft.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Ae.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(h=N.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=H.get(r),y=k.state.lights;if(R===!0&&(be===!0||e!==ce)){let t=e===ce&&r.id===se;ze.setState(r,e,t)}let b=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?b=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==ze.numPlanes||v.numIntersection!==ze.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h&&v.morphTargetsCount===_?!!v.lightProbeGrid!=k.state.lightProbeGridArray.length>0&&(b=!0):b=!0:b=!0:b=!0:(b=!0,v.__version=r.version);let x=v.currentProgram;b===!0&&(x=gt(r,t,i),ie&&r.isNodeMaterial&&ie.onUpdateProgram(r,x,v));let S=!1,C=!1,w=!1,T=x.getUniforms(),E=v.uniforms;if(V.useProgram(x.program)&&(S=!0,C=!0,w=!0),r.id!==se&&(se=r.id,C=!0),v.needsLights){let e=yt(k.state.lightProbeGridArray,i);v.lightProbeGrid!==e&&(v.lightProbeGrid=e,C=!0)}if(S||ce!==e){V.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),T.setValue(B,`projectionMatrix`,e.projectionMatrix),T.setValue(B,`viewMatrix`,e.matrixWorldInverse);let t=T.map.cameraPosition;t!==void 0&&t.setValue(B,Se.setFromMatrixPosition(e.matrixWorld)),Oe.logarithmicDepthBuffer&&T.setValue(B,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&T.setValue(B,`isOrthographic`,e.isOrthographicCamera===!0),ce!==e&&(ce=e,C=!0,w=!0)}if(v.needsLights&&(y.state.directionalShadowMap.length>0&&T.setValue(B,`directionalShadowMap`,y.state.directionalShadowMap,U),y.state.spotShadowMap.length>0&&T.setValue(B,`spotShadowMap`,y.state.spotShadowMap,U),y.state.pointShadowMap.length>0&&T.setValue(B,`pointShadowMap`,y.state.pointShadowMap,U)),i.isSkinnedMesh){T.setOptional(B,i,`bindMatrix`),T.setOptional(B,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),T.setValue(B,`boneTexture`,e.boneTexture,U))}i.isBatchedMesh&&(T.setOptional(B,i,`batchingTexture`),T.setValue(B,`batchingTexture`,i._matricesTexture,U),T.setOptional(B,i,`batchingIdTexture`),T.setValue(B,`batchingIdTexture`,i._indirectTexture,U),T.setOptional(B,i,`batchingColorTexture`),i._colorsTexture!==null&&T.setValue(B,`batchingColorTexture`,i._colorsTexture,U));let D=n.morphAttributes;if((D.position!==void 0||D.normal!==void 0||D.color!==void 0)&&Ue.update(i,n,x),(C||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,T.setValue(B,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(E.envMapIntensity.value=t.environmentIntensity),E.dfgLUT!==void 0&&(E.dfgLUT.value=Kd()),C){if(T.setValue(B,`toneMappingExposure`,N.toneMappingExposure),v.needsLights&&xt(E,w),a&&r.fog===!0&&Fe.refreshFogUniforms(E,a),Fe.refreshMaterialUniforms(E,r,L,I,k.state.transmissionRenderTarget[e.id]),v.needsLights&&v.lightProbeGrid){let e=v.lightProbeGrid;E.probesSH.value=e.texture,E.probesMin.value.copy(e.boundingBox.min),E.probesMax.value.copy(e.boundingBox.max),E.probesResolution.value.copy(e.resolution)}Tu.upload(B,_t(v),E,U)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Tu.upload(B,_t(v),E,U),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&T.setValue(B,`center`,i.center),T.setValue(B,`modelViewMatrix`,i.modelViewMatrix),T.setValue(B,`normalMatrix`,i.normalMatrix),T.setValue(B,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Xe.update(n,x),Xe.bind(n,x)}}return x}function xt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function St(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return ae},this.getActiveMipmapLevel=function(){return oe},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(e,t,n){let r=H.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),H.get(e.texture).__webglTexture=t,H.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=H.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let Ct=B.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){P=e,ae=t,oe=n;let r=null,i=!1,a=!1;if(e){let o=H.get(e);if(o.__useDefaultFramebuffer!==void 0){V.bindFramebuffer(B.FRAMEBUFFER,o.__webglFramebuffer),F.copy(e.viewport),le.copy(e.scissor),ue=e.scissorTest,V.viewport(F),V.scissor(le),V.setScissorTest(ue),se=-1;return}else if(o.__webglFramebuffer===void 0)U.setupRenderTarget(e);else if(o.__hasExternalTextures)U.rebindTextures(e,H.get(e.texture).__webglTexture,H.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&H.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);U.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=H.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&U.useMultisampledRTT(e)===!1?H.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,F.copy(e.viewport),le.copy(e.scissor),ue=e.scissorTest}else F.copy(ge).multiplyScalar(L).floor(),le.copy(_e).multiplyScalar(L).floor(),ue=ve;if(n!==0&&(r=Ct),V.bindFramebuffer(B.FRAMEBUFFER,r)&&V.drawBuffers(e,r),V.viewport(F),V.scissor(le),V.setScissorTest(ue),i){let r=H.get(e.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=H.get(e.textures[t]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=H.get(e.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,t.__webglTexture,n)}se=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){G(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=H.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){V.bindFramebuffer(B.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(e.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+s),!Oe.textureFormatReadable(c)){G(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!Oe.textureTypeReadable(l)){G(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&B.readPixels(t,n,r,i,qe.convert(c),qe.convert(l),a)}finally{let e=P===null?null:H.get(P).__webglFramebuffer;V.bindFramebuffer(B.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=H.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c)if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){V.bindFramebuffer(B.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(e.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+s),!Oe.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!Oe.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,d),B.bufferData(B.PIXEL_PACK_BUFFER,a.byteLength,B.STREAM_READ),B.readPixels(t,n,r,i,qe.convert(l),qe.convert(u),0);let f=P===null?null:H.get(P).__webglFramebuffer;V.bindFramebuffer(B.FRAMEBUFFER,f);let p=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await Qe(B,p,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,d),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,a),B.deleteBuffer(d),B.deleteSync(p),a}else throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;U.setTexture2D(e,0),B.copyTexSubImage2D(B.TEXTURE_2D,n,0,0,o,s,i,a),V.unbindTexture()};let wt=B.createFramebuffer(),Tt=B.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=qe.convert(t.format),_=qe.convert(t.type),v;t.isData3DTexture?(U.setTexture3D(t,0),v=B.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(U.setTexture2DArray(t,0),v=B.TEXTURE_2D_ARRAY):(U.setTexture2D(t,0),v=B.TEXTURE_2D),V.activeTexture(B.TEXTURE0),V.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,t.flipY),V.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),V.pixelStorei(B.UNPACK_ALIGNMENT,t.unpackAlignment);let y=V.getParameter(B.UNPACK_ROW_LENGTH),b=V.getParameter(B.UNPACK_IMAGE_HEIGHT),x=V.getParameter(B.UNPACK_SKIP_PIXELS),S=V.getParameter(B.UNPACK_SKIP_ROWS),C=V.getParameter(B.UNPACK_SKIP_IMAGES);V.pixelStorei(B.UNPACK_ROW_LENGTH,h.width),V.pixelStorei(B.UNPACK_IMAGE_HEIGHT,h.height),V.pixelStorei(B.UNPACK_SKIP_PIXELS,l),V.pixelStorei(B.UNPACK_SKIP_ROWS,u),V.pixelStorei(B.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=H.get(e),r=H.get(t),h=H.get(n.__renderTarget),g=H.get(r.__renderTarget);V.bindFramebuffer(B.READ_FRAMEBUFFER,h.__webglFramebuffer),V.bindFramebuffer(B.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,H.get(e).__webglTexture,i,d+n),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,H.get(t).__webglTexture,a,m+n)),B.blitFramebuffer(l,u,o,s,f,p,o,s,B.DEPTH_BUFFER_BIT,B.NEAREST);V.bindFramebuffer(B.READ_FRAMEBUFFER,null),V.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||H.has(e)){let n=H.get(e),r=H.get(t);V.bindFramebuffer(B.READ_FRAMEBUFFER,wt),V.bindFramebuffer(B.DRAW_FRAMEBUFFER,Tt);for(let e=0;e<c;e++)w?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,n.__webglTexture,i),T?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,r.__webglTexture,a),i===0?T?B.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):B.copyTexSubImage2D(v,a,f,p,l,u,o,s):B.blitFramebuffer(l,u,o,s,f,p,o,s,B.COLOR_BUFFER_BIT,B.NEAREST);V.bindFramebuffer(B.READ_FRAMEBUFFER,null),V.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?B.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?B.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):B.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):B.texSubImage2D(B.TEXTURE_2D,a,f,p,o,s,g,_,h);V.pixelStorei(B.UNPACK_ROW_LENGTH,y),V.pixelStorei(B.UNPACK_IMAGE_HEIGHT,b),V.pixelStorei(B.UNPACK_SKIP_PIXELS,x),V.pixelStorei(B.UNPACK_SKIP_ROWS,S),V.pixelStorei(B.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&B.generateMipmap(v),V.unbindTexture()},this.initRenderTarget=function(e){H.get(e).__webglFramebuffer===void 0&&U.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?U.setTextureCube(e,0):e.isData3DTexture?U.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?U.setTexture2DArray(e,0):U.setTexture2D(e,0),V.unbindTexture()},this.resetState=function(){ae=0,oe=0,P=null,V.reset(),Je.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return He}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Ft._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ft._getUnpackColorSpace()}},Jd={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},Yd=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},Xd=new ic(-1,1,1,-1,0,1),Zd=new class extends Or{constructor(){super(),this.setAttribute(`position`,new gr([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new gr([0,2,0,0,2,0],2))}},Qd=class{constructor(e){this._mesh=new X(Zd,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Xd)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},$d=class extends Yd{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof is?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=ts.clone(e.uniforms),this.material=new is({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new Qd(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},ef=class extends Yd{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},tf=class extends Yd{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},nf=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new q);this._width=n.width,this._height=n.height,t=new Jt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:y}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new $d(Jd),this.copyPass.material.blending=0,this.timer=new hc}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}ef!==void 0&&(r instanceof ef?n=!0:r instanceof tf&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new q);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},rf=class extends Yd{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new Y}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},af={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Y(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},of=class e extends Yd{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e===void 0?new q(256,256):new q(e.x,e.y),this.clearColor=new Y(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Jt(i,a,{type:y}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new Jt(i,a,{type:y});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new Jt(i,a,{type:y});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),i=Math.round(i/2),a=Math.round(a/2)}let o=af;this.highPassUniforms=ts.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new is({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let s=[6,10,14,18,22];i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(s[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new q(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new J(1,1,1),new J(1,1,1),new J(1,1,1),new J(1,1,1),new J(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=ts.clone(Jd.uniforms),this.blendMaterial=new is({uniforms:this.copyUniforms,vertexShader:Jd.vertexShader,fragmentShader:Jd.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Y,this._oldClearAlpha=1,this._basic=new ii,this._fsQuad=new Qd(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new q(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);return new is({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new q(.5,.5)},direction:{value:new q(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new is({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};of.BlurDirectionX=new q(1,0),of.BlurDirectionY=new q(0,1);var sf={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},cf=class extends Yd{constructor(){super(),this.isOutputPass=!0,this.uniforms=ts.clone(sf.uniforms),this.material=new as({name:sf.name,uniforms:this.uniforms,vertexShader:sf.vertexShader,fragmentShader:sf.fragmentShader}),this._fsQuad=new Qd(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Ft.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},lf={name:`FXAAShader`,uniforms:{tDiffuse:{value:null},resolution:{value:new q(1/1024,1/512)}},vertexShader:`

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

		}`},uf=.6,df=1.25,ff=!0,pf=null,mf=null;function hf(e){mf=e}var gf={i:[320,2500,3100],a:[820,1300,2600],u:[330,950,2400],e:[560,1900,2550]},_f=1.45;function vf(e,t){let n=Math.max(1,Math.ceil(e.sampleRate*t)),r=e.createBuffer(1,n,e.sampleRate),i=r.getChannelData(0);for(let e=0;e<n;e++)i[e]=Math.random()*2-1;return r}function yf(e,t,n,r){let i=n===`ch`?.075:.022,a=e.createBufferSource();a.buffer=vf(e,i+.03);let o=e.createBiquadFilter();n===`p`?(o.type=`lowpass`,o.frequency.value=1400,o.Q.value=.7):n===`k`?(o.type=`bandpass`,o.frequency.value=1900,o.Q.value=1.1):(o.type=`highpass`,o.frequency.value=2600,o.Q.value=.6);let s=e.createGain(),c=uf*(n===`ch`?.55:.4);s.gain.setValueAtTime(1e-4,r),s.gain.linearRampToValueAtTime(c,r+(n===`ch`?.02:.005)),s.gain.exponentialRampToValueAtTime(1e-4,r+i),a.connect(o),o.connect(s),s.connect(t),a.start(r),a.stop(r+i+.03)}function bf(e,t,n,r,i,a,o){let s=df,c=gf[n],l=e.createOscillator();l.type=`sawtooth`,l.frequency.setValueAtTime(r*s,o),l.frequency.exponentialRampToValueAtTime(Math.max(40,i*s),o+a);let u=e.createOscillator();u.type=`square`,u.frequency.setValueAtTime(r*s,o),u.frequency.exponentialRampToValueAtTime(Math.max(40,i*s),o+a),u.detune.value=8;let d=e.createGain();d.gain.value=.25;let f=e.createOscillator();f.type=`sine`,f.frequency.value=6.5;let p=e.createGain();p.gain.value=r*s*.018,f.connect(p),p.connect(l.frequency),p.connect(u.frequency);let m=e.createGain();m.gain.setValueAtTime(1e-4,o),m.gain.linearRampToValueAtTime(uf,o+.018),m.gain.setValueAtTime(uf*.92,o+a*.55),m.gain.exponentialRampToValueAtTime(1e-4,o+a);let h=[1,.65,.28],g=e.createGain();l.connect(g),u.connect(d),d.connect(g);for(let t=0;t<3;t++){let n=e.createBiquadFilter();n.type=`bandpass`,n.frequency.value=c[t]*_f,n.Q.value=7+t*2.5;let r=e.createGain();r.gain.value=h[t],g.connect(n),n.connect(r),r.connect(m)}m.connect(t),l.start(o),l.stop(o+a+.03),u.start(o),u.stop(o+a+.03),f.start(o),f.stop(o+a+.03)}function xf(e,t,n,r,i,a,o,s){let c=s;return n&&(yf(e,t,n,c),c+=n===`ch`?.07:.02),bf(e,t,r,i,a,o,c),c+o}function Sf(e,t){let n=0;n=xf(e,t,`p`,`i`,360,430,.12,n),n=xf(e,t,`k`,`a`,430,350,.15,n),n+=.1,n=xf(e,t,`p`,`i`,370,440,.12,n),n=xf(e,t,`k`,`a`,440,360,.16,n)}function Cf(e,t){let n=0;n=xf(e,t,`p`,`i`,360,420,.11,n),n=xf(e,t,`k`,`a`,420,380,.12,n),n=xf(e,t,`ch`,`u`,360,560,.3,n)}function wf(e,t){let n=0;n=xf(e,t,`p`,`i`,380,450,.12,n),n=xf(e,t,`k`,`a`,450,360,.15,n)}function Tf(e,t){let n=0;n=xf(e,t,`p`,`i`,380,450,.1,n),n=xf(e,t,`k`,`a`,450,380,.12,n),n+=.07,n=xf(e,t,`p`,`i`,400,470,.1,n),n=xf(e,t,`k`,`a`,470,400,.12,n),n+=.07,n=xf(e,t,`p`,`i`,420,620,.26,n)}function Ef(e,t){let n=0;n=xf(e,t,`p`,`i`,370,460,.1,n),n=xf(e,t,`k`,`a`,460,370,.12,n),n+=.04,n=xf(e,t,`p`,`i`,440,590,.16,n)}function Df(e,t){let n=0;n=xf(e,t,`p`,`i`,330,350,.13,n),n=xf(e,t,`k`,`a`,350,320,.13,n),n=xf(e,t,`ch`,`u`,280,450,.32,n)}function Of(e,t){xf(e,t,`ch`,`u`,200,148,.72,0)}function kf(e,t){let n=0;for(let r=0;r<3;r++){let i=420+r*45;n=xf(e,t,`p`,`i`,i,i+75,.07,n),n+=.04}}function Af(e,t){let n=0;n=xf(e,t,`p`,`i`,340,490,.34,n),n=xf(e,t,`k`,`a`,490,420,.12,n),n=xf(e,t,`ch`,`u`,420,360,.22,n)}function jf(e,t){let n=0;n=xf(e,t,`p`,`i`,360,410,.11,n),n=xf(e,t,`k`,`a`,410,370,.12,n),n=xf(e,t,`ch`,`u`,350,320,.14,n),n+=.05,n=xf(e,t,`p`,`i`,450,560,.15,n)}var Mf=0;function Nf(e){if(!ff)return;let t=Date.now();if(!(t-Mf<1400)){Mf=t;try{let t=new(window.AudioContext||window.webkitAudioContext),n=t.createGain();n.gain.value=1;let r=t.createBiquadFilter();switch(r.type=`lowpass`,r.frequency.value=6500,r.Q.value=.4,n.connect(r),r.connect(t.destination),e){case`happy`:Math.random()<.6?Ef(t,n):jf(t,n);break;case`curious`:Df(t,n);break;case`excited`:Math.random()<.55?Tf(t,n):Af(t,n);break;case`sad`:Of(t,n);break;case`surprised`:kf(t,n);break;default:wf(t,n)}setTimeout(()=>{try{t.close()}catch{}},2500)}catch{}}}function Pf(){mf?.();try{let e=new(window.AudioContext||window.webkitAudioContext),t=e.createGain();t.gain.value=1;let n=e.createBiquadFilter();n.type=`lowpass`,n.frequency.value=6500,n.Q.value=.4,t.connect(n),n.connect(e.destination);let r=Math.random();r<.42?Sf(e,t):r<.74?Cf(e,t):r<.9?wf(e,t):Tf(e,t),setTimeout(()=>{try{e.close()}catch{}},2500)}catch{}}function Ff(){ff&&Pf()}function If(){pf&&clearTimeout(pf);let e=18e3+Math.random()*28e3;pf=setTimeout(()=>{Ff(),If()},e)}function Lf(){If()}function Rf(){pf&&=(clearTimeout(pf),null)}function zf(e){uf=Math.max(0,Math.min(1,e))}function Bf(e){df=Math.max(.5,Math.min(8,e))}function Vf(e){ff=e,e?Lf():Rf()}function Hf(){Pf()}var Uf=Math.PI,Wf=Uf*2,Gf={uniforms:{tDiffuse:{value:null},offset:{value:1},darkness:{value:.65}},vertexShader:`
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
  `},Kf=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,qf=`
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
`,Jf=`
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
`,Yf=`
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
`,Xf=`
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float d = length(c) * 2.0;
    float ring = smoothstep(0.9, 0.95, d) * smoothstep(1.0, 0.97, d);
    vec3 col = vec3(0.9, 0.75, 0.35);
    gl_FragColor = vec4(col, ring * uOpacity);
  }
`,Zf=null;function Qf(){if(Zf)return Zf;let e=document.createElement(`canvas`);e.width=128,e.height=128;let t=e.getContext(`2d`),n=t.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);return n.addColorStop(0,`rgba(255,255,255,1)`),n.addColorStop(.2,`rgba(255,255,255,0.8)`),n.addColorStop(.5,`rgba(255,255,255,0.25)`),n.addColorStop(.8,`rgba(255,255,255,0.04)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,128,128),Zf=new va(e),Zf}var $f=null;function ep(){if($f)return $f;let e=document.createElement(`canvas`);e.width=256,e.height=256;let t=e.getContext(`2d`);t.clearRect(0,0,256,256);let n=t.createRadialGradient(256/2,256/2,0,256/2,256/2,256/2);n.addColorStop(0,`rgba(255,240,210,0.9)`),n.addColorStop(.25,`rgba(255,225,170,0.35)`),n.addColorStop(.6,`rgba(218,165,32,0.06)`),n.addColorStop(1,`rgba(218,165,32,0)`),t.fillStyle=n,t.fillRect(0,0,256,256);let r=t.createLinearGradient(0,256/2-4,256,132);return r.addColorStop(0,`rgba(255,235,190,0)`),r.addColorStop(.5,`rgba(255,235,190,0.5)`),r.addColorStop(1,`rgba(255,235,190,0)`),t.fillStyle=r,t.fillRect(0,256/2-3,256,6),$f=new va(e),$f}function tp(e){try{let t=new el(e),n=new Pn;n.background=new Y(657414),n.add(new Vs(16772829,657414,.8));let r=new rc(16772829,15,30);r.position.set(5,5,5),n.add(r);let i=new rc(14329120,10,30);i.position.set(-5,3,-3),n.add(i);let a=new rc(16771264,8,30);a.position.set(0,-2,6),n.add(a);let o=t.fromScene(n,0,.1,100).texture;return t.dispose(),o}catch{return null}}function np(e){let t=e??void 0,n=+!!e;return{yellow:new ss({color:16635957,metalness:0,roughness:.52,...t?{envMap:t,envMapIntensity:.3*n}:{},clearcoat:.18,clearcoatRoughness:.3,sheen:.2,sheenRoughness:.42,sheenColor:new Y(16770426),emissive:new Y(16635957),emissiveIntensity:.02}),darkYellow:new ss({color:13149205,metalness:0,roughness:.58,...t?{envMap:t,envMapIntensity:.18*n}:{},clearcoat:.08,clearcoatRoughness:.38,emissive:new Y(13149205),emissiveIntensity:.01}),cream:new ss({color:16776679,metalness:0,roughness:.48,...t?{envMap:t,envMapIntensity:.2*n}:{},clearcoat:.12,clearcoatRoughness:.3,emissive:new Y(16776679),emissiveIntensity:.02}),red:new ss({color:15022389,metalness:0,roughness:.45,...t?{envMap:t,envMapIntensity:.2*n}:{},emissive:new Y(15022389),emissiveIntensity:.06,clearcoat:.14,clearcoatRoughness:.2}),brown:new ss({color:6111287,metalness:0,roughness:.6,...t?{envMap:t,envMapIntensity:.18*n}:{},clearcoat:.08,clearcoatRoughness:.4}),white:new ss({color:16777215,metalness:0,roughness:.18,...t?{envMap:t,envMapIntensity:.2*n}:{},emissive:new Y(16777215),emissiveIntensity:.12,clearcoat:.28,clearcoatRoughness:.1}),black:new ss({color:657930,metalness:.06,roughness:.22,...t?{envMap:t,envMapIntensity:.25*n}:{},clearcoat:.35,clearcoatRoughness:.12}),mouth:new ss({color:9116186,metalness:0,roughness:.5,...t?{envMap:t,envMapIntensity:.12*n}:{},clearcoat:.1,clearcoatRoughness:.3}),nose:new ss({color:1381653,metalness:.06,roughness:.28,...t?{envMap:t,envMapIntensity:.22*n}:{},clearcoat:.28,clearcoatRoughness:.12}),pink:new ss({color:16027569,metalness:0,roughness:.58,...t?{envMap:t,envMapIntensity:.12*n}:{},clearcoat:.06,clearcoatRoughness:.48,emissive:new Y(16027569),emissiveIntensity:.03}),tongue:new ss({color:15753344,metalness:0,roughness:.4,...t?{envMap:t,envMapIntensity:.1*n}:{},clearcoat:.16,clearcoatRoughness:.24,emissive:new Y(15220832),emissiveIntensity:.04})}}function rp(e,t){let n=new En,r=new En,i=e=>Math.max(8,Math.round(e*t)),a=e.yellow,o=e.brown,s=e.black,c=e.cream,l=new X(new Jo(.68,i(48),i(48)),a);l.scale.set(1.1,1,.88),l.position.set(0,-.32,0),n.add(l);let u=new X(new Jo(.52,i(32),i(32)),c);u.scale.set(.88,.85,.32),u.position.set(0,-.28,.38),n.add(u);let d=new X(new Jo(.5,i(24),i(24)),a);d.scale.set(1.22,.62,.98),d.position.set(0,-.66,0),n.add(d);let f=new X(new Jo(.45,i(32),i(32)),a);f.scale.set(.92,.5,.78),f.position.set(0,.2,0),n.add(f);for(let[e,t,r]of[[.02,.6,0],[-.22,.52,.01]]){let a=new X(new Ca(.048,t,i(6),i(12)),o);a.rotation.z=Uf/2,a.position.set(r,-.18+e,-.56),a.rotation.x=.14,a.scale.set(1,1,.62),n.add(a)}let p=new X(new Jo(.72,i(48),i(48)),a);p.scale.set(1.24,1.06,.94),p.position.set(0,.02,.04),r.add(p);for(let e of[-1,1]){let t=new X(new Jo(.32,i(20),i(20)),a);t.scale.set(.62,.56,.48),t.position.set(e*.54,-.13,.33),r.add(t)}let m,h;for(let t of[-1,1]){let n=new En,o=new X(new Jo(.16,i(24),i(24)),a);o.scale.set(1.05,3.4,.6),o.position.set(0,.42,0),n.add(o);let c=new X(new Ea(.12,.7,i(16)),a);c.position.set(0,.9,0),c.scale.set(1.05,1,.6),n.add(c);let l=new X(new Jo(.14,i(16),i(16)),s);l.scale.set(.9,1.5,.55),l.position.set(0,.96,0),n.add(l);let u=new X(new Ea(.1,.5,i(14)),s);u.position.set(0,1.22,0),u.scale.set(.9,1,.55),n.add(u);let d=new X(new wa(.1,i(16)),e.pink);d.scale.set(.85,2.6,1),d.position.set(0,.44,.08),d.rotation.x=-.12,n.add(d),n.position.set(t*.46,.52,-.04),n.rotation.z=-t*.2,n.rotation.x=-.1,r.add(n),t===-1?m=n:h=n}let g=document.createElement(`canvas`);g.width=2048,g.height=2048;let _=g.getContext(`2d`);_.clearRect(0,0,2048,2048);let v=(e,t,n,r,i)=>{_.fillStyle=i,_.beginPath(),_.ellipse(e*4,t*4,n*4,r*4,0,0,Wf),_.fill()};_.save(),_.translate(712,872),_.rotate(.08),_.fillStyle=`#0A0804`,_.beginPath(),_.ellipse(0,0,184,248,0,0,Wf),_.fill(),_.restore(),_.save(),_.translate(334*4,872),_.rotate(-.08),_.fillStyle=`#0A0804`,_.beginPath(),_.ellipse(0,0,184,248,0,0,Wf),_.fill(),_.restore();for(let[e,t,n]of[[178,218,.08],[334,218,-.08]]){_.save(),_.translate(e*4,t*4),_.rotate(n);let r=_.createRadialGradient(0,0,40,0,0,148);r.addColorStop(0,`rgba(8,4,1,1)`),r.addColorStop(.36,`rgba(52,26,6,0.95)`),r.addColorStop(.6,`rgba(98,56,16,0.72)`),r.addColorStop(.82,`rgba(42,20,4,0.5)`),r.addColorStop(1,`rgba(8,4,1,0)`),_.fillStyle=r,_.beginPath(),_.ellipse(0,0,160,216,0,0,Wf),_.fill(),_.restore()}v(196,196,18,22,`#FFFFFF`),v(350,196,18,22,`#FFFFFF`),v(166,232,9,11,`#FFFFFF`),v(318,232,9,11,`#FFFFFF`),v(185,204,5,5,`rgba(255,255,255,0.65)`),v(339,204,5,5,`rgba(255,255,255,0.65)`),v(174,238,4,3,`rgba(180,200,220,0.45)`),v(328,238,4,3,`rgba(180,200,220,0.45)`);let y=(e,t)=>{let n=_.createRadialGradient(e*4,t*4,16,e*4,t*4,224);n.addColorStop(0,`rgba(245, 82, 78, 0.92)`),n.addColorStop(.4,`rgba(229, 57, 53, 0.72)`),n.addColorStop(.72,`rgba(229, 57, 53, 0.28)`),n.addColorStop(1,`rgba(229, 57, 53, 0)`),_.fillStyle=n,_.beginPath(),_.ellipse(e*4,t*4,232,200,0,0,Wf),_.fill();let r=_.createRadialGradient(e*4,(t-6)*4,0,e*4,t*4,88);r.addColorStop(0,`rgba(255,160,140,0.55)`),r.addColorStop(1,`rgba(255,100,90,0)`),_.fillStyle=r,_.beginPath(),_.ellipse(e*4,t*4,88,72,0,0,Wf),_.fill()};y(108,298),y(404,298),_.fillStyle=`#1A1008`,_.beginPath(),_.moveTo(256*4,286*4),_.lineTo(996,298*4),_.lineTo(263*4,298*4),_.closePath(),_.fill(),_.strokeStyle=`#1A0505`,_.lineWidth=16,_.lineCap=`round`,_.lineJoin=`round`,_.beginPath(),_.moveTo(792,314*4),_.quadraticCurveTo(860,348*4,996,332*4),_.quadraticCurveTo(256*4,318*4,263*4,332*4),_.quadraticCurveTo(297*4,348*4,314*4,314*4),_.stroke(),_.save(),_.strokeStyle=`#0E0804`,_.lineWidth=40,_.lineCap=`round`,_.beginPath(),_.moveTo(544,716),_.quadraticCurveTo(704,632,888,692),_.stroke(),_.beginPath(),_.moveTo(292*4,692),_.quadraticCurveTo(336*4,632,376*4,716),_.stroke(),_.restore();let b=_.createRadialGradient(256*4,320,0,256*4,560,800);b.addColorStop(0,`rgba(255,255,220,0.12)`),b.addColorStop(.6,`rgba(255,240,180,0.04)`),b.addColorStop(1,`rgba(255,240,180,0)`),_.fillStyle=b,_.fillRect(0,0,2048,2048);let x=_.createRadialGradient(256*4,320*4,160,256*4,280*4,960);x.addColorStop(0,`rgba(20,10,2,0)`),x.addColorStop(.7,`rgba(20,10,2,0)`),x.addColorStop(1,`rgba(20,10,2,0.22)`),_.fillStyle=x,_.fillRect(0,0,2048,2048),_.globalCompositeOperation=`destination-in`;let S=_.createRadialGradient(1024,1024,0,1024,1024,1024);S.addColorStop(0,`rgba(255,255,255,1)`),S.addColorStop(.85,`rgba(255,255,255,1)`),S.addColorStop(1,`rgba(255,255,255,0)`),_.fillStyle=S,_.fillRect(0,0,2048,2048),_.globalCompositeOperation=`source-over`;let C=new va(g);C.colorSpace=Ie;let w=new X(new wa(.8,i(48)),new ii({map:C,transparent:!0,depthWrite:!1,depthTest:!1,side:0}));w.renderOrder=2,w.position.set(0,0,.72),r.add(w);let T,E,D,O,k,A,ee=new ii({visible:!1});for(let e of[-1,1]){let t=new X(new Jo(.001,4,4),ee);t.position.set(e*.19,.02,.72),r.add(t),e===-1?k=t:A=t;let n=new X(new Jo(.001,4,4),ee);n.position.set(e*.19,-.04,.72),r.add(n),e===-1?D=n:O=n;let o=new X(new Jo(.22,i(24),i(12),0,Wf,0,Uf*.5),a);o.scale.set(.85,.01,.45),o.position.set(e*.19,.14,.72),o.rotation.x=-.08,r.add(o),e===-1?T=o:E=o}let te=new X(new Jo(.001,4,4),new ii({visible:!1}));te.position.set(0,-.18,.72),r.add(te);let j=new X(new Jo(.03,i(12),i(12)),e.tongue);j.scale.set(1.5,.55,.9),j.position.set(0,-.2,.715),r.add(j);let ne=new ss({color:15022389,roughness:.5,emissive:15022389,emissiveIntensity:.3,transparent:!0,opacity:.18,depthWrite:!1,depthTest:!1}),M=new ss({color:15022389,roughness:.5,emissive:15022389,emissiveIntensity:.3,transparent:!0,opacity:.18,depthWrite:!1,depthTest:!1}),N=new wa(.12,i(24)),re=new X(N,ne);re.renderOrder=3,re.position.set(-.44,-.1,.722),r.add(re);let ie=new X(N,M);ie.renderOrder=3,ie.position.set(.44,-.1,.722),r.add(ie),r.position.set(0,.5,.04),n.add(r);let ae=new X(new Ta(.28,.34,.22,i(20)),a);ae.position.set(0,.28,.04),n.add(ae);let oe=new Ca(.11,.3,i(8),i(12)),P=new X(oe,a);P.position.set(-.82,.04,.26),P.rotation.z=.78,P.rotation.x=.14,n.add(P);let se=new X(oe,a);se.position.set(.82,.04,.26),se.rotation.z=-.78,se.rotation.x=.14,n.add(se);for(let e of[-1,1]){let t=e*.82+e*Math.cos(.78)*.2,r=.04-Math.sin(.78)*.2-.02;for(let o=0;o<3;o++){let s=new X(new Jo(.025,i(6),i(6)),a),c=(o-1)*.4;s.position.set(t+e*Math.cos(c)*.05,r-.03+Math.sin(c)*.02,.33+Math.abs(Math.cos(c))*.02),n.add(s)}}let ce=new Ca(.18,.2,i(10),i(14));for(let e of[-1,1]){let t=new X(ce,a);t.rotation.x=Uf/2,t.rotation.z=e*.08,t.position.set(e*.32,-.95,.26),t.scale.set(1.05,1,.78),n.add(t);for(let t=0;t<3;t++){let r=new X(new Jo(.04,i(8),i(8)),a);r.position.set(e*.32+(t-1)*.06,-1.05,.42),r.scale.set(.85,.55,1.1),n.add(r)}}let F=new ii({color:0,transparent:!0,opacity:.15,depthWrite:!1,side:2}),le=new X(new wa(.6,i(24)),F);le.position.set(0,-1.12,.16),le.rotation.x=-Uf/2,n.add(le);let ue=new En,de=new io;de.moveTo(0,0),de.lineTo(.2,.32),de.lineTo(-.1,.38),de.lineTo(.25,.78),de.lineTo(-.12,.86),de.lineTo(.35,1.5),de.lineTo(.52,1.4),de.lineTo(.1,.84),de.lineTo(.42,.76),de.lineTo(.05,.32),de.lineTo(.32,.26),de.lineTo(0,0);let fe=new X(new Uo(de,{depth:.14,bevelEnabled:!0,bevelThickness:.04,bevelSize:.04,bevelSegments:i(3)}),a);fe.position.set(-.16,0,-.07),ue.add(fe);let pe=new X(new Ca(.1,.2,i(8),i(12)),o);pe.position.set(.04,-.04,.01),ue.add(pe),ue.position.set(.08,-.06,-.52),ue.rotation.x=.72,ue.rotation.y=.18,ue.rotation.z=-.38,n.add(ue);let I=new En,L=[],me=[],he=Math.round(10*t);function ge(e,t){let n=[];for(let r=0;r<=t;r++){let i=r/t,a=r===0||r===t?0:(Math.random()-.5)*e*.35,o=r===0||r===t?0:(Math.random()-.5)*e*.18;n.push(a,i*e-e*.5,o)}let r=new Or;return r.setAttribute(`position`,new gr(n,3)),r}for(let e=0;e<he;e++){let t=new ii({color:e%3==0?16777181:16770125,transparent:!0,opacity:0,depthWrite:!1,blending:2});L.push(t);let n=.28+Math.random()*.28,r=new ia(ge(n,Math.round(5+Math.random()*4)),t),i=e/he*Wf,a=1.05+Math.random()*.55;r.position.set(Math.cos(i)*a,-.35+Math.random()*1.1,Math.sin(i)*a),r.rotation.set(Math.random()*Uf,Math.random()*Uf,Math.random()*Uf),I.add(r),me.push(r);let o=new ii({color:16777215,transparent:!0,opacity:0,depthWrite:!1,blending:2});L.push(o);let s=new ia(ge(n*.45,3),o);s.position.set(r.position.x+(Math.random()-.5)*.18,r.position.y+(Math.random()-.5)*.18,r.position.z+(Math.random()-.5)*.18),s.rotation.set(Math.random()*Uf,Math.random()*Uf,Math.random()*Uf),I.add(s),me.push(s)}for(let e of[-1,1])for(let t=0;t<3;t++){let n=new ii({color:t===0?16777215:16768324,transparent:!0,opacity:0,depthWrite:!1,blending:2});L.push(n);let r=new ia(ge(.1+Math.random()*.08,4),n);r.position.set(e*.48+(Math.random()-.5)*.1,.4+(Math.random()-.5)*.1,.52+Math.random()*.1),r.rotation.set(Math.random()*Uf*.5,Math.random()*Uf,e*.4),I.add(r),me.push(r)}n.add(I);let _e=new ii({color:16768324,transparent:!0,opacity:0,wireframe:!0,depthWrite:!1,blending:2}),ve=new X(new Ko(1.6,1),_e);n.add(ve);let ye=new X(new Jo(2,4,4),new ii({visible:!1}));n.add(ye);let R=new rc(16776688,2.2,5,1);R.position.set(0,.5,2.5),n.add(R);let be=new rc(16775392,1,4.5,1.2);be.position.set(0,2.2,.5),n.add(be);let xe=new rc(16769200,.7,3.5,1.5);xe.position.set(1.8,.8,.8),n.add(xe);let Se=[],Ce=Math.round(12*t);for(let e=0;e<Ce;e++){let t=e%3==0?16777215:e%3==1?16769072:16763904,n=new Pr({map:Qf(),color:t,transparent:!0,opacity:.7,blending:2,depthWrite:!1});Se.push(n);let r=new Jr(n),i=e/Ce*Wf+Math.random()*.5,a=1+Math.random()*.65,o=.18+Math.random()*.22;r.scale.setScalar(o),r.position.set(Math.cos(i)*a,-.35+Math.random()*1.1,Math.sin(i)*a),I.add(r)}return{group:n,head:r,leftEye:k,rightEye:A,leftPupil:D,rightPupil:O,leftEyelid:T,rightEyelid:E,leftEarGroup:m,rightEarGroup:h,cheekMatL:ne,cheekMatR:M,tail:ue,leftArm:P,rightArm:se,mouthMesh:te,tongue:j,sparks:I,sparkMats:L,sparkMeshes:me,auraMat:_e,coronaMats:Se}}var ip=`
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
`,ap=`
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
`,op=`
  attribute float aT;
  varying float vT;
  void main() {
    vT = aT;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,sp=`
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
`;function cp(){try{let e=new(window.AudioContext||window.webkitAudioContext),t=e.currentTime,n=e.createGain();n.gain.setValueAtTime(.9,t),n.connect(e.destination);let r=e.createOscillator();r.type=`sine`,r.frequency.setValueAtTime(1800,t),r.frequency.exponentialRampToValueAtTime(1200,t+.08),r.frequency.setValueAtTime(1100,t+.1),r.frequency.linearRampToValueAtTime(1050,t+.55),r.frequency.exponentialRampToValueAtTime(560,t+.88);let i=e.createOscillator();i.type=`sawtooth`,i.frequency.setValueAtTime(480,t),i.frequency.exponentialRampToValueAtTime(140,t+.85);let a=e.createGain();a.gain.setValueAtTime(920,t),a.gain.exponentialRampToValueAtTime(60,t+.88),i.connect(a),a.connect(r.frequency);let o=e.createOscillator();o.frequency.value=11;let s=e.createGain();s.gain.setValueAtTime(0,t),s.gain.linearRampToValueAtTime(.35,t+.12),s.gain.setValueAtTime(.35,t+.55),s.gain.linearRampToValueAtTime(0,t+.88),o.connect(s);let c=e.createGain();c.gain.value=1,s.connect(c);let l=e.createOscillator();l.frequency.value=8.5;let u=e.createGain();u.gain.setValueAtTime(0,t),u.gain.linearRampToValueAtTime(38,t+.1),u.gain.setValueAtTime(38,t+.55),u.gain.exponentialRampToValueAtTime(5,t+.88),l.connect(u),u.connect(r.frequency);let d=e.createBiquadFilter();d.type=`bandpass`,d.frequency.setValueAtTime(2400,t),d.frequency.exponentialRampToValueAtTime(820,t+.12),d.frequency.setValueAtTime(820,t+.55),d.frequency.exponentialRampToValueAtTime(680,t+.88),d.Q.value=2.8;let f=e.createGain();f.gain.setValueAtTime(0,t),f.gain.linearRampToValueAtTime(1,t+.008),f.gain.setValueAtTime(.92,t+.04),f.gain.setValueAtTime(.9,t+.55),f.gain.exponentialRampToValueAtTime(.001,t+.9),r.connect(f),f.connect(d);let p=e.createGain();p.gain.value=0,s.connect(p.gain),d.connect(p),p.connect(n),d.connect(n);let m=Math.ceil(e.sampleRate*.9),h=e.createBuffer(1,m,e.sampleRate),g=h.getChannelData(0);for(let e=0;e<m;e++)g[e]=Math.random()*2-1;let _=e.createBufferSource();_.buffer=h;let v=e.createBiquadFilter();v.type=`highpass`,v.frequency.value=3e3,v.Q.value=.4;let y=e.createGain();y.gain.setValueAtTime(.3,t),y.gain.setValueAtTime(.18,t+.1),y.gain.setValueAtTime(.12,t+.55),y.gain.exponentialRampToValueAtTime(.001,t+.88),_.connect(v),v.connect(y),y.connect(n),r.start(t),r.stop(t+.92),l.start(t),l.stop(t+.92),i.start(t),i.stop(t+.92),o.start(t),o.stop(t+.92),_.start(t),setTimeout(()=>{try{e.close()}catch{}},2500)}catch{}}function lp(e,t,n){let r=document.createElement(`div`);r.style.cssText=`position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:9;`,getComputedStyle(e).position===`static`&&(e.style.position=`relative`),e.appendChild(r);let i=!1,a=!1,o=0,s=0;function c(){if(!i)return;let e=Math.min((performance.now()-o)/2200,1);n(e),e>=1&&!a?(a=!0,i=!1,cp(),r.style.transition=`opacity 0.08s ease-in`,r.style.opacity=`1`,setTimeout(()=>{r.style.transition=`opacity 1.4s ease-out`,r.style.opacity=`0`,setTimeout(()=>{a=!1,n(0)},1400)},140)):e<1&&(s=requestAnimationFrame(c))}function l(){a||(i=!0,o=performance.now(),s=requestAnimationFrame(c))}function u(){a||(i=!1,cancelAnimationFrame(s),n(0))}return t.addEventListener(`mousedown`,l),t.addEventListener(`mouseup`,u),t.addEventListener(`mouseleave`,u),t.addEventListener(`touchstart`,e=>{e.preventDefault(),l()},{passive:!1}),t.addEventListener(`touchend`,u),t.addEventListener(`touchcancel`,u),()=>{t.removeEventListener(`mousedown`,l),t.removeEventListener(`mouseup`,u),t.removeEventListener(`mouseleave`,u),r.parentNode&&r.parentNode.removeChild(r)}}function up(t,n,r){e(async()=>{let{GLTFLoader:e}=await import(`./GLTFLoader-Brz2JhdU.js`);return{GLTFLoader:e}},[]).then(({GLTFLoader:e})=>{new e().load(r+`pikachu.glb?v=3`,e=>{t.traverse(e=>{if(e instanceof X){let t=Array.isArray(e.material)?e.material[0]:e.material;t instanceof ss&&(e.visible=!1),t instanceof ii&&t.map&&(e.visible=!1)}});let r=e.scene,i=n.yellow.clone();i.side=2,r.traverse(e=>{e instanceof X&&(e.geometry.computeVertexNormals(),e.material=i,e.castShadow=!0)}),r.scale.set(1.3,-1.3,1.3),r.rotation.y=Math.PI,r.position.set(0,-.1,0),t.add(r)},void 0,e=>console.warn(`[OrbScene] pikachu.glb load failed:`,e))})}function dp(e){let t=new qd({antialias:!0,alpha:!1,powerPreference:`high-performance`,failIfMajorPerformanceCaveat:!1});t.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),t.setClearColor(657414,1),t.toneMapping=4,t.toneMappingExposure=.65,e.appendChild(t.domElement);let n=new Pn,r=new $s(50,1,.1,100);r.position.set(0,0,6),r.lookAt(0,0,0);let i=null,a=null,o=null,s=!1;try{let c=Math.min(window.devicePixelRatio||1,2);i=new nf(t,new Jt(Math.max(1,Math.floor((e.clientWidth||window.innerWidth)*c)),Math.max(1,Math.floor((e.clientHeight||window.innerHeight)*c)),{samples:4})),i.addPass(new rf(n,r)),a=new of(new q(window.innerWidth*c,window.innerHeight*c),.08,.5,.78),i.addPass(a);let l=new $d(Gf);l.uniforms.darkness.value=.7,i.addPass(l),o=new $d(lf),i.addPass(o),i.addPass(new cf),i.render(),s=!0}catch{i=null,a=null,o=null,s=!1}function c(){let n=e.clientWidth||window.innerWidth,a=e.clientHeight||window.innerHeight,s=Math.min(window.devicePixelRatio||1,2);t.setPixelRatio(s),t.setSize(n,a,!0),i&&i.setSize(n*s,a*s),o&&o.uniforms.resolution.value.set(1/(n*s),1/(a*s)),r.aspect=n/a,r.updateProjectionMatrix()}c(),window.addEventListener(`resize`,c);let l=new En;n.add(l);let u=new oc(16775392,2.2);u.position.set(2,3,5),n.add(u);let d=new oc(16771168,.9);d.position.set(-3,2,4),n.add(d);let f=new oc(16775912,.7);f.position.set(0,1,6),n.add(f);let p=new oc(16769200,.5);p.position.set(0,2,-4),n.add(p);let m=new sc(1708552,.6);n.add(m);let h=tp(t);h&&(n.environment=h);let g=np(h),_=rp(g,1),v=_.group;v.scale.setScalar(.95),l.add(v),up(v,g,`/Alpha-new/`);let y=new Yo(1.85,.035,28,220),b=new ii({color:14329120,transparent:!0,opacity:0,depthWrite:!1}),x=new X(y,b);x.visible=!1,l.add(x);let S=new Yo(1.85,.1,24,200),C=new ii({color:14329120,transparent:!0,opacity:0,depthWrite:!1,blending:2}),w=new X(S,C);w.visible=!1,l.add(w);let T=new Yo(1.35,.012,16,160),E=new ii({color:16115400,transparent:!0,opacity:0,depthWrite:!1}),D=new X(T,E);D.visible=!1,l.add(D);let O=new Yo(1.6,.01,12,140),k=new ii({color:13145450,transparent:!0,opacity:0,depthWrite:!1}),A=new X(O,k);A.visible=!1,l.add(A);let ee=new Yo(1.1,.008,10,120),te=new ii({color:16766720,transparent:!0,opacity:0,depthWrite:!1}),j=new X(ee,te);j.visible=!1,l.add(j);let ne=[],M=new qo(1,1);for(let e=0;e<3;e++){let t=new is({uniforms:{uOpacity:{value:0}},vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,fragmentShader:Xf,transparent:!0,depthWrite:!1,side:2}),n=new X(M,t);n.rotation.x=-Uf*.5,n.position.y=0,l.add(n),ne.push({mesh:n,mat:t,phase:e/3})}let N=new Ko(1.6,3),re=new is({uniforms:{uTime:{value:0},uEnergy:{value:0}},vertexShader:ip,fragmentShader:ap,transparent:!0,depthWrite:!1,side:1}),ie=new X(N,re);l.add(ie);let ae=new Pr({map:Qf(),color:5915160,transparent:!0,opacity:.015,depthWrite:!1,blending:2}),oe=new Jr(ae);oe.scale.setScalar(4),l.add(oe);let P=new Pr({map:Qf(),color:2759690,transparent:!0,opacity:.008,depthWrite:!1,blending:2}),se=new Jr(P);se.scale.setScalar(6),l.add(se);let ce=[],F=[],le=[],ue=[],de=[14329120,16115400,14329120,13145450,15782032,14329120,16115400,13936717,13145450,15782032];for(let e=0;e<10;e++){let t=e/10*Wf,n=2+e%3*.3,r=new X(new Ko(.04,1),new ii({color:de[e],transparent:!0,opacity:.8,depthWrite:!1})),i=(Math.random()-.5)*.8;r.position.set(Math.cos(t)*n,i,Math.sin(t)*n),r.visible=!1,l.add(r),F.push(r),ce.push({angle:t,r:n,speed:.02+Math.random()*.04,y:i});let a=new Jr(new Pr({map:Qf(),color:de[e],transparent:!0,opacity:.25,depthWrite:!1,blending:2}));a.scale.setScalar(.25),a.visible=!1,l.add(a),le.push(a);let o=new Or;o.setAttribute(`position`,new pr(new Float32Array(6),3));let s=new ia(o,new Xi({color:de[e],transparent:!0,opacity:.1,depthWrite:!1}));s.visible=!1,l.add(s),ue.push({geo:o})}let fe=new Float32Array(180),pe=new Float32Array(60),I=new Float32Array(60),L=new Float32Array(180),me=[];for(let e=0;e<60;e++){let t=Math.random()*Wf,n=1.3+Math.random()*2.2,r=(Math.random()-.5)*.6;fe[e*3]=Math.cos(t)*n,fe[e*3+1]=(Math.random()-.5)*2.5,fe[e*3+2]=Math.sin(t)*n,pe[e]=Math.random(),I[e]=.8+Math.random()*2;let i=Math.random();i>.8?(L[e*3]=1,L[e*3+1]=.85,L[e*3+2]=.5):i>.6?(L[e*3]=.95,L[e*3+1]=.9,L[e*3+2]=.82):(L[e*3]=.85,L[e*3+1]=.68,L[e*3+2]=.3),me.push({a:t,r:n,spd:.05+Math.random()*.12,y0:fe[e*3+1],tilt:r})}let he=new Or;he.setAttribute(`position`,new pr(fe,3)),he.setAttribute(`aPhase`,new pr(pe,1)),he.setAttribute(`aSize`,new pr(I,1)),he.setAttribute(`aColor`,new pr(L,3));let ge=new is({uniforms:{uTime:{value:0}},vertexShader:Jf,fragmentShader:Yf,transparent:!0,depthWrite:!1}),_e=new ha(he,ge);l.add(_e);let ve=0,ye=lp(e,t.domElement,e=>{ve=e}),R=0,be=0,xe=.06,Se=.06,Ce=0,z=3+Math.random()*5,we=0,Te=0;function B(e){if(be=requestAnimationFrame(B),document.hidden||document.body.classList.contains(`bg-paused`)||e-Te<33)return;Te=e;let o=.016;R+=o,xe+=(Se-xe)*.07,a&&(a.strength=.08+ve*2),t.toneMappingExposure=.9+ve*2.5,we+=o,we>=z&&(Ce=.4+Math.random()*.6,z=we+2+Math.random()*6),Ce*=.93,Ce<.01&&(Ce=0),ge.uniforms.uTime.value=R;let c=Math.sin(R*.45)*.04;v.rotation.y=Math.sin(R*.35)*.35,v.rotation.z=c;let u=R%8,d=u>7.4&&u<7.8,f=d?Math.sin((u-7.4)/.4*Uf)*.15:0;v.position.y=Math.sin(R*.7)*.06+f;let p=1+Math.sin(R*1.2)*.02,m=1+Math.max(0,Math.sin(R*3))*.008,h=d?1+Math.sin((u-7.4)/.4*Uf)*.04:1;if(v.scale.set(.95*p*(1/m)*(1/h),.95*p*m*h,.95*p),_.head){let e=R%12,t=e>5&&e<7?Math.sin((e-5)/2*Uf)*.12:0;_.head.rotation.y=Math.sin(R*.5+.5)*.14,_.head.rotation.z=Math.sin(R*.3)*.05+t,_.head.rotation.x=Math.sin(R*.25)*.04+(t>0?-.03:0)}let g=R%5,y=g>4.2?Math.sin((g-4.2)/.8*Uf):0,S=y>.25?.5:0,T=R*1.2%Wf,O=Math.max(0,Math.sin(T*2))>.85?.25:0,ee=Math.max(0,Math.sin(T*2+1.2))>.9?.18:0,M=.08+O*.3+ee*.2+xe*.1+S*.3+ve*1.5;if(_.cheekMatL.emissiveIntensity=M,_.cheekMatR.emissiveIntensity=M,_.tail){let e=R%6>5?2.5:1;_.tail.rotation.z=Math.sin(R*1.8*e)*.18+Math.sin(R*4.2)*.04,_.tail.rotation.y=.15+Math.sin(R*2.5)*.12+Math.cos(R*3.8)*.05,_.tail.rotation.x=-.45+Math.sin(R*1.2)*.05}let N=R%10,ie=N>8.5&&N<10?Math.sin((N-8.5)/1.5*Uf)*.65:0;_.leftArm&&(_.leftArm.rotation.z=.55+Math.sin(R*1.2)*.18-ie),_.rightArm&&(_.rightArm.rotation.z=-.55+Math.sin(R*1.2+1)*.18);let de=3.5+Math.sin(R*.1)*.5,fe=R%de,pe=fe>.35&&fe<.65,I=fe<.15||pe,L=I?pe?(fe-.35)/.3:fe/.15:0,_e=I?Math.max(.01,1-Math.sin(L*Uf)*.99):Math.max(.01,S>0?.4:d?.35:0);_.leftEyelid&&(_.leftEyelid.scale.y=_e),_.rightEyelid&&(_.rightEyelid.scale.y=_e);let ye=ve*-.12,Ee=S>0?-.08:d?-.06:ye,De=Math.sin(R*2.5)*.05+(Math.sin(R*7.3)>.95?.12:0)+Ee,Oe=Math.sin(R*2.5+.6)*.05+(Math.sin(R*8.1+1)>.95?.12:0)+Ee;_.leftEarGroup&&(_.leftEarGroup.rotation.x=-.12+De),_.rightEarGroup&&(_.rightEarGroup.rotation.x=-.12+Oe);let V=ve*8;for(let e=0;e<_.sparkMats.length;e++){let t=Math.sin(R*8+e*2.7)*Math.sin(R*3.1+e*1.3),n=.12+Math.abs(t)*.3,r=Math.sin(R*45+e*2.7)*.5+.5;_.sparkMats[e].opacity=Math.min(1,Math.max(n,y*(.55+r*.45))+ve*(.4+r*V*.1))}_.sparks.rotation.y+=o*(.35+y*6+ve*12);let ke=Math.sin(R*.08)>.7?.01:0,H=Math.sin(R*.18)*.015+ke,U=Math.sin(R*.13+.7)*.01;_.leftPupil&&(_.leftPupil.position.x=-.32+H,_.leftPupil.position.y=.055+U),_.rightPupil&&(_.rightPupil.position.x=.32+H,_.rightPupil.position.y=.055+U);let Ae=d?.008:.003;if(_.tongue&&(_.tongue.position.y=-.12+Math.sin(R*2)*Ae),_.mouthMesh){let e=d?.03:0;_.mouthMesh.position.y=-.12-e}_.auraMat.opacity=Math.max(.04+Math.sin(R*4)*.02,Math.max(y*(.15+Math.sin(R*30)*.05),ve*(.4+Math.sin(R*40)*.1)));for(let e=0;e<_.coronaMats.length;e++){let t=Math.sin(R*5.5+e*2.1)*Math.cos(R*3.2+e*1.4),n=.3+Math.abs(t)*.55;_.coronaMats[e].opacity=Math.min(1,n+y*.9+ve*2)}x.rotation.z=.15+R*.1,b.opacity=.4+Math.sin(R*.8)*.05+xe*.05,w.rotation.z=x.rotation.z,C.opacity=.05+Math.sin(R*.8)*.02+xe*.03,D.rotation.z=-.3-R*.14,E.opacity=.15+Math.sin(R*.7)*.05,A.rotation.z=.5+R*.06,A.rotation.x=Uf*.62+Math.sin(R*.2)*.1,k.opacity=.2+Math.sin(R*.6)*.08+xe*.12,j.rotation.z=-.8+R*.18,j.rotation.y=Math.sin(R*.15)*.2,te.opacity=.3+Math.sin(R*1)*.1,re.uniforms.uTime.value=R,re.uniforms.uEnergy.value=xe;for(let e=0;e<3;e++){let t=ne[e],n=(R*.3+t.phase)%1,r=1.5+n*4;t.mesh.scale.set(r,r,1),t.mat.uniforms.uOpacity.value=(1-n)*.15*(.5+xe)}oe.scale.setScalar(4+Math.sin(R*.8)*.5+xe*.8),ae.opacity=.15+xe*.12+Math.sin(R*.6)*.03,se.scale.setScalar(6.5+Math.sin(R*.5)*.6),P.opacity=.07+xe*.05;for(let e=0;e<10;e++){let t=ce[e];t.angle+=t.speed*o;let n=Math.cos(t.angle)*t.r,r=t.y+Math.sin(R*.25+e*.9)*.2,i=Math.sin(t.angle)*t.r;F[e].position.set(n,r,i),F[e].rotation.y=R*2,F[e].rotation.x=R*1.5,le[e].position.set(n,r,i),le[e].scale.setScalar(.2+Math.sin(R*1.2+e)*.05+xe*.06);let a=ue[e].geo.attributes.position;a.setXYZ(0,0,0,0),a.setXYZ(1,n,r,i),a.needsUpdate=!0}let je=he.attributes.position;for(let e=0;e<60;e++){let t=me[e];t.a+=t.spd*o,je.setXYZ(e,Math.cos(t.a)*t.r,t.y0+Math.sin(R*.35+e*.7)*.3+Math.sin(t.a*2)*t.tilt,Math.sin(t.a)*t.r)}if(je.needsUpdate=!0,l.position.y=Math.sin(R*.2)*.12+Math.sin(R*.07)*.05,l.position.x=Math.sin(R*.15+1)*.06,l.rotation.y=Math.sin(R*.25)*.12,s&&i)try{i.render()}catch{s=!1}s||t.render(n,r)}return be=requestAnimationFrame(B),{setEnergy(e){Se=Math.max(0,Math.min(1,e))},pikaEmote(e){Nf(e),(e===`excited`||e===`happy`)&&(Se=.85,setTimeout(()=>{Se=.06},1200)),e===`surprised`&&(Se=.7,setTimeout(()=>{Se=.06},800)),e===`curious`&&(Se=.45,setTimeout(()=>{Se=.06},900)),e===`sad`&&(Se=.15,setTimeout(()=>{Se=.06},1500))},dispose(){cancelAnimationFrame(be),ye(),window.removeEventListener(`resize`,c),h&&h.dispose(),i&&i.dispose(),t.dispose(),e.removeChild(t.domElement)},startBodyDetection(){},stopBodyDetection(){}}}function fp(e){if(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||window.innerWidth<768)return dp(e);let t=new qd({antialias:!0,alpha:!1,powerPreference:`high-performance`,failIfMajorPerformanceCaveat:!1});t.setPixelRatio(window.devicePixelRatio||1),t.setClearColor(657414,1),t.toneMapping=4,t.toneMappingExposure=.75,e.appendChild(t.domElement);let n=new Pn,r=new $s(50,1,.1,200);r.position.set(0,.4,6),r.lookAt(0,0,0);let i=0,a=0,o=e=>{i=(e.clientX/window.innerWidth-.5)*2,a=(e.clientY/window.innerHeight-.5)*2};window.addEventListener(`mousemove`,o);let s=window.devicePixelRatio||1,c=new nf(t,new Jt(Math.max(1,Math.floor((e.clientWidth||window.innerWidth)*s)),Math.max(1,Math.floor((e.clientHeight||window.innerHeight)*s)),{samples:4}));c.addPass(new rf(n,r));let l=new of(new q(window.innerWidth*s,window.innerHeight*s),.2,.4,.7);c.addPass(l);let u=new $d(Gf);u.uniforms.darkness.value=.5,c.addPass(u);let d=new $d(lf);c.addPass(d),c.addPass(new cf);function f(){let n=e.clientWidth||window.innerWidth,i=e.clientHeight||window.innerHeight,a=window.devicePixelRatio||1;t.setPixelRatio(a),t.setSize(n,i,!0),c.setSize(n*a,i*a),d.uniforms.resolution.value.set(1/(n*a),1/(i*a)),r.aspect=n/i,r.updateProjectionMatrix()}f(),window.addEventListener(`resize`,f);let p=new En;n.add(p);let m=new oc(16777215,4.5);m.position.set(3,5,4),n.add(m);let h=new oc(16770140,2.2);h.position.set(-4,1,3),n.add(h);let g=new oc(16775408,2.8);g.position.set(0,2,-5),n.add(g);let _=new oc(14329120,.8);_.position.set(0,-3,2),n.add(_);let v=new sc(2760200,1);n.add(v);let y=tp(t);y&&(n.environment=y);let b=np(y),x=rp(b,1),S=x.group;p.add(S),up(S,b,`/Alpha-new/`);let C=[],w=[{r:2.3,thick:.07,segs:260,color:14329120,op:.95,rx:Uf*.5,rz:.15},{r:1.9,thick:.015,segs:200,color:16115400,op:.35,rx:Uf*.38,rz:-.3},{r:2.7,thick:.008,segs:160,color:13145450,op:.22,rx:Uf*.62,rz:.5},{r:1.7,thick:.006,segs:140,color:15782032,op:.15,rx:Uf*.7,rz:-.8}];for(let e of w){let t=new Yo(e.r,e.thick,24,e.segs),n=new ii({color:e.color,transparent:!0,opacity:e.op,depthWrite:!1}),r=new X(t,n);r.rotation.x=e.rx,r.rotation.z=e.rz,r.visible=!1,p.add(r),C.push({mesh:r,mat:n})}let T=new Yo(2.3,.2,24,220),E=new ii({color:14329120,transparent:!0,opacity:.16,depthWrite:!1,blending:2}),D=new X(T,E);D.rotation.x=Uf*.5,D.rotation.z=.15,D.visible=!1,p.add(D);let O=[],k=new qo(1,1);for(let e=0;e<4;e++){let t=new is({uniforms:{uOpacity:{value:0}},vertexShader:`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,fragmentShader:Xf,transparent:!0,depthWrite:!1,side:2}),n=new X(k,t);n.rotation.x=-Uf*.5,p.add(n),O.push({mesh:n,mat:t,phase:e/4})}let A=[];for(let e=0;e<8;e++){let t=Math.acos(2*((e+.5)/8)-1),n=e*2.399963,r=new J(Math.sin(t)*Math.cos(n),Math.cos(t),Math.sin(t)*Math.sin(n)).normalize(),i=new Float32Array(75),a=new Float32Array(25),o=new J(-r.z,.4,r.x).normalize();for(let e=0;e<=24;e++){let t=e/24,n=1.32+t*1.4,s=Math.sin(t*Uf)*.5,c=r.clone().multiplyScalar(n).addScaledVector(o,s);i[e*3]=c.x,i[e*3+1]=c.y,i[e*3+2]=c.z,a[e]=t}let s=new Or;s.setAttribute(`position`,new pr(i,3)),s.setAttribute(`aT`,new pr(a,1));let c=new is({uniforms:{uTime:{value:0},uOpacity:{value:0}},vertexShader:op,fragmentShader:sp,transparent:!0,depthWrite:!1,blending:2}),l=new ia(s,c);p.add(l),A.push({mat:c,baseDir:r,phase:e/8})}let ee=[],te=[{color:16771248,scale:1.6,off:new J(1.6,.9,.4),speed:1.1},{color:14329120,scale:2.4,off:new J(-1.4,-.7,.6),speed:.7},{color:16115400,scale:1.2,off:new J(.4,1.5,-.5),speed:.9}];for(let e of te){let t=new Pr({map:ep(),color:e.color,transparent:!0,opacity:0,depthWrite:!1,blending:2}),n=new Jr(t);n.scale.setScalar(e.scale),n.position.copy(e.off),p.add(n),ee.push({sprite:n,mat:t,baseScale:e.scale,off:e.off,speed:e.speed})}let j=new Pr({map:Qf(),color:4862480,transparent:!0,opacity:.05,depthWrite:!1,blending:2}),ne=new Jr(j);ne.scale.setScalar(4),p.add(ne);let M=new Pr({map:Qf(),color:2759690,transparent:!0,opacity:.025,depthWrite:!1,blending:2}),N=new Jr(M);N.scale.setScalar(6),p.add(N);let re=[],ie=[],ae=[],oe=[],P=[14329120,16115400,13936717,13145450,15782032,14329120,16115400,13936717,13145450,15782032,14329120,13145450,16115400,15782032];for(let e=0;e<14;e++){let t=e/14*Wf,n=3+e%3*.4,r=new X(new Ko(.06,1),new ii({color:P[e],transparent:!0,opacity:.85,depthWrite:!1})),i=(Math.random()-.5)*1;r.position.set(Math.cos(t)*n,i,Math.sin(t)*n),r.visible=!1,p.add(r),ie.push(r),re.push({angle:t,r:n,speed:.015+Math.random()*.03,y:i});let a=new Jr(new Pr({map:Qf(),color:P[e],transparent:!0,opacity:.3,depthWrite:!1,blending:2}));a.scale.setScalar(.35),a.visible=!1,p.add(a),ae.push(a);let o=new Or;o.setAttribute(`position`,new pr(new Float32Array(6),3));let s=new ia(o,new Xi({color:P[e],transparent:!0,opacity:.12,depthWrite:!1}));s.visible=!1,p.add(s),oe.push({geo:o})}let se=new qo(20,20,1,1),ce=new is({uniforms:{uTime:{value:0},uEnergy:{value:0}},vertexShader:Kf,fragmentShader:qf,transparent:!0,depthWrite:!1,side:2}),F=new X(se,ce);F.rotation.x=-Uf/2,F.position.y=-2,p.add(F);let le=[],ue=[1,1.5,2,2.6,3.2,4],de=[14329120,16115400,14329120,13145450,15782032,14329120];for(let e=0;e<ue.length;e++){let t=new Yo(ue[e],.005,8,180),n=new ii({color:de[e],transparent:!0,opacity:.2-e*.025,depthWrite:!1}),r=new X(t,n);r.rotation.x=Uf*.5,r.position.y=-2,p.add(r),le.push({mesh:r,mat:n})}let fe=[],pe=[],I=[],L=[];for(let e=0;e<=300;e++){let t=e/300,n=-2.5+t*5,r=1.8+Math.sin(t*Uf*2)*.15,i=t*Uf*8;fe.push(r*Math.cos(i),n,r*Math.sin(i)),pe.push(r*Math.cos(i+Uf),n,r*Math.sin(i+Uf));let a=1.45+Math.cos(t*Uf*2)*.12,o=-t*Uf*8+Uf*.5;I.push(a*Math.cos(o),n,a*Math.sin(o)),L.push(a*Math.cos(o+Uf),n,a*Math.sin(o+Uf))}function me(e,t,n){let r=new Or;return r.setAttribute(`position`,new pr(new Float32Array(e),3)),new ia(r,new Xi({color:t,transparent:!0,opacity:n,depthWrite:!1}))}let he=me(fe,14329120,.15),ge=me(pe,16115400,.1),_e=me(I,13145450,.1),ve=me(L,15782032,.08),ye=he.material,R=ge.material,be=_e.material,xe=ve.material,Se=new En;Se.add(he),Se.add(ge);let Ce=new En;Ce.add(_e),Ce.add(ve),p.add(Se),p.add(Ce);let z=new Float32Array(600),we=new Float32Array(200),Te=new Float32Array(200),B=new Float32Array(600),Ee=[];for(let e=0;e<200;e++){let t=Math.random()*Wf,n=1.8+Math.random()*3.5,r=(Math.random()-.5)*.6;z[e*3]=Math.cos(t)*n,z[e*3+1]=(Math.random()-.5)*4,z[e*3+2]=Math.sin(t)*n,we[e]=Math.random(),Te[e]=1+Math.random()*2.5;let i=Math.random();i>.8?(B[e*3]=1,B[e*3+1]=.85,B[e*3+2]=.5):i>.6?(B[e*3]=.95,B[e*3+1]=.9,B[e*3+2]=.82):(B[e*3]=.85,B[e*3+1]=.68,B[e*3+2]=.3),Ee.push({a:t,r:n,spd:.03+Math.random()*.08,y0:z[e*3+1],tilt:r})}let De=new Or;De.setAttribute(`position`,new pr(z,3)),De.setAttribute(`aPhase`,new pr(we,1)),De.setAttribute(`aSize`,new pr(Te,1)),De.setAttribute(`aColor`,new pr(B,3));let Oe=new is({uniforms:{uTime:{value:0}},vertexShader:Jf,fragmentShader:Yf,transparent:!0,depthWrite:!1}),V=new ha(De,Oe);p.add(V);let ke=new Jo(1.8,64,64),H=new is({uniforms:{uTime:{value:0},uEnergy:{value:0}},vertexShader:ip,fragmentShader:ap,transparent:!0,depthWrite:!1,side:1,blending:2}),U=new X(ke,H);p.add(U);let Ae=new Float32Array(500*3),je=new Float32Array(500),Me=new Float32Array(500),Ne=new Float32Array(500*3),Pe=[];for(let e=0;e<500;e++){let t=Math.random()*Wf,n=Math.acos(2*Math.random()-1),r=1.38+Math.random()*.12;Ae[e*3]=r*Math.sin(n)*Math.cos(t),Ae[e*3+1]=r*Math.cos(n),Ae[e*3+2]=r*Math.sin(n)*Math.sin(t),je[e]=Math.random(),Me[e]=.3+Math.random()*1,Math.random()>.85?(Ne[e*3]=1,Ne[e*3+1]=.88,Ne[e*3+2]=.55):(Ne[e*3]=.85,Ne[e*3+1]=.7,Ne[e*3+2]=.35),Pe.push({theta:t,phi:n,r,thetaSpd:(Math.random()-.5)*.3,phiSpd:(Math.random()-.5)*.12})}let Fe=new Or;Fe.setAttribute(`position`,new pr(Ae,3)),Fe.setAttribute(`aPhase`,new pr(je,1)),Fe.setAttribute(`aSize`,new pr(Me,1)),Fe.setAttribute(`aColor`,new pr(Ne,3));let Ie=new is({uniforms:{uTime:{value:0}},vertexShader:Jf,fragmentShader:Yf,transparent:!0,depthWrite:!1,blending:1}),Le=new ha(Fe,Ie);p.add(Le);let Re=new En;n.add(Re);let ze=new Float32Array(300*3),Be=new Float32Array(300),Ve=new Float32Array(300),He=new Float32Array(300*3);for(let e=0;e<300;e++){let t=Math.random()*Wf,n=Math.acos(2*Math.random()-1),r=14+Math.random()*20;ze[e*3]=r*Math.sin(n)*Math.cos(t),ze[e*3+1]=r*Math.cos(n),ze[e*3+2]=r*Math.sin(n)*Math.sin(t),Be[e]=Math.random(),Ve[e]=.3+Math.random()*1.4;let i=Math.random();i>.7?(He[e*3]=1,He[e*3+1]=.9,He[e*3+2]=.6):i>.4?(He[e*3]=.9,He[e*3+1]=.8,He[e*3+2]=.5):(He[e*3]=.7,He[e*3+1]=.6,He[e*3+2]=.35)}let Ue=new Or;Ue.setAttribute(`position`,new pr(ze,3)),Ue.setAttribute(`aPhase`,new pr(Be,1)),Ue.setAttribute(`aSize`,new pr(Ve,1)),Ue.setAttribute(`aColor`,new pr(He,3));let We=new is({uniforms:{uTime:{value:0}},vertexShader:Jf,fragmentShader:Yf,transparent:!0,depthWrite:!1}),Ge=new ha(Ue,We);Re.add(Ge);let Ke=new Float32Array(300),qe=new Float32Array(100),Je=new Float32Array(100),Ye=new Float32Array(300),Xe=[];for(let e=0;e<100;e++){let t=Math.random()*Wf,n=5+Math.random()*8;Ke[e*3]=Math.cos(t)*n,Ke[e*3+1]=(Math.random()-.5)*8,Ke[e*3+2]=Math.sin(t)*n,qe[e]=Math.random(),Je[e]=.5+Math.random()*1,Ye[e*3]=.8,Ye[e*3+1]=.65,Ye[e*3+2]=.3,Xe.push({a:t,r:n,spd:.01+Math.random()*.03,y0:Ke[e*3+1]})}let W=new Or;W.setAttribute(`position`,new pr(Ke,3)),W.setAttribute(`aPhase`,new pr(qe,1)),W.setAttribute(`aSize`,new pr(Je,1)),W.setAttribute(`aColor`,new pr(Ye,3));let G=new is({uniforms:{uTime:{value:0}},vertexShader:Jf,fragmentShader:Yf,transparent:!0,depthWrite:!1}),Ze=new ha(W,G);n.add(Ze);let Qe=!1,$e=null,et=null,tt=null,nt=null,rt=null,it=null;function at(){let e=document.createElement(`div`);e.id=`holisticOverlay`,e.style.cssText=`position:fixed;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;pointer-events:none;`;let t=document.createElement(`canvas`);t.style.cssText=`width:60%;height:70%;max-width:640px;max-height:480px;border-radius:16px;border:1px solid rgba(218,165,32,.2);box-shadow:0 0 40px rgba(218,165,32,.1);background:transparent;`,e.appendChild(t);let n=document.createElement(`button`);n.textContent=`✕`,n.style.cssText=`position:absolute;top:20px;right:20px;width:36px;height:36px;border-radius:10px;background:rgba(10,8,6,.7);border:1px solid rgba(218,165,32,.2);color:#daa520;font-size:16px;cursor:pointer;pointer-events:all;z-index:10;backdrop-filter:blur(10px);`,n.onclick=()=>ct(),e.appendChild(n);let r=document.createElement(`div`);r.style.cssText=`position:absolute;top:20px;left:50%;transform:translateX(-50%);font-family:"Space Grotesk",sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#daa520;opacity:.7;background:rgba(10,8,6,.6);padding:6px 16px;border-radius:8px;border:1px solid rgba(218,165,32,.15);backdrop-filter:blur(10px);`,r.textContent=`BODY DETECTION`,e.appendChild(r);let i=document.createElement(`div`);return i.id=`holisticStatus`,i.style.cssText=`position:absolute;bottom:20px;left:50%;transform:translateX(-50%);font-family:"Space Grotesk",sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:#daa520;opacity:.6;background:rgba(10,8,6,.6);padding:5px 14px;border-radius:8px;border:1px solid rgba(218,165,32,.15);backdrop-filter:blur(10px);`,i.textContent=`INITIALIZING...`,e.appendChild(i),document.body.appendChild(e),it=e,et=t,tt=t.getContext(`2d`),{cvs:t,status:i}}async function ot(){for(let e of[`https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js`,`https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js`,`https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js`])document.querySelector(`script[src="${e}"]`)||await new Promise((t,n)=>{let r=document.createElement(`script`);r.src=e,r.crossOrigin=`anonymous`,r.onload=()=>t(),r.onerror=()=>n(Error(`Failed to load: `+e)),document.head.appendChild(r)});return!0}async function st(){if(Qe)return;Qe=!0;let{cvs:e,status:t}=at();try{await ot(),t.textContent=`LOADING MODEL...`;let n=window,r=document.createElement(`video`);r.style.display=`none`,document.body.appendChild(r),$e=r;let i=new n.Holistic({locateFile:e=>`https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${e}`});nt=i,i.setOptions({modelComplexity:1,smoothLandmarks:!0,refineFaceLandmarks:!0}),i.onResults(r=>{if(!tt||!et)return;let i=e.width=e.clientWidth*(window.devicePixelRatio||1),a=e.height=e.clientHeight*(window.devicePixelRatio||1),o=tt;o.clearRect(0,0,i,a),o.save(),o.globalAlpha=.15,r.image&&o.drawImage(r.image,0,0,i,a),o.restore(),r.poseLandmarks&&(n.drawConnectors(o,r.poseLandmarks,n.POSE_CONNECTIONS,{color:`#daa520`,lineWidth:2}),n.drawLandmarks(o,r.poseLandmarks,{color:`#f5e6c8`,fillColor:`#f5e6c8`,lineWidth:1,radius:3})),r.faceLandmarks&&n.drawConnectors(o,r.faceLandmarks,n.FACEMESH_TESSELATION,{color:`rgba(218,165,32,0.3)`,lineWidth:.5}),r.leftHandLandmarks&&n.drawConnectors(o,r.leftHandLandmarks,n.HAND_CONNECTIONS,{color:`#c8956a`,lineWidth:1.5}),r.rightHandLandmarks&&n.drawConnectors(o,r.rightHandLandmarks,n.HAND_CONNECTIONS,{color:`#daa520`,lineWidth:1.5}),t.textContent=`TRACKING ACTIVE`,t.style.color=`#daa520`});let a=new n.Camera(r,{onFrame:async()=>{await i.send({image:r})},width:640,height:480});rt=a,await a.start(),t.textContent=`CAMERA READY`}catch(e){t.textContent=`ERROR: `+(e.message||`Camera failed`),t.style.color=`#ff5d73`}}function ct(){if(Qe=!1,rt){try{rt.stop()}catch{}rt=null}if(nt){try{nt.close()}catch{}nt=null}$e&&=($e.remove(),null),it&&=(it.remove(),null),et=null,tt=null}let lt=0,ut=lp(e,t.domElement,e=>{lt=e}),K=0,dt=0,ft=.06,pt=.06,mt=0,ht=3+Math.random()*5,gt=0,_t=0;function vt(e){if(dt=requestAnimationFrame(vt),document.hidden||document.body.classList.contains(`bg-paused`)||e-_t<33)return;_t=e;let n=.016;K+=n,ft+=(pt-ft)*.07,l.strength=.2+lt*4.5,t.toneMappingExposure=.75+lt*2.5,gt+=n,gt>=ht&&(mt=.4+Math.random()*.6,ht=gt+2+Math.random()*6),mt*=.93,mt<.01&&(mt=0),Oe.uniforms.uTime.value=K,ce.uniforms.uTime.value=K,ce.uniforms.uEnergy.value=ft;let o=Math.sin(K*.45)*.04;S.rotation.y=Math.sin(K*.35)*.35,S.rotation.z=o;let s=K%8,u=s>7.4&&s<7.8,d=u?Math.sin((s-7.4)/.4*Uf)*.15:0;S.position.y=Math.sin(K*.7)*.06+d;let f=1+Math.sin(K*1.2)*.02,m=1+Math.max(0,Math.sin(K*3))*.008,h=u?1+Math.sin((s-7.4)/.4*Uf)*.04:1;if(S.scale.set(1/m*f*(1/h),f*m*h,f),x.head){let e=K%12,t=e>5&&e<7?Math.sin((e-5)/2*Uf)*.12:0;x.head.rotation.y=Math.sin(K*.5+.5)*.14,x.head.rotation.z=Math.sin(K*.3)*.05+t,x.head.rotation.x=Math.sin(K*.25)*.04+(t>0?-.03:0)}let g=K%5,_=g>4.2?Math.sin((g-4.2)/.8*Uf):0,v=_>.25?.5:0,y=K*1.2%Wf,b=Math.max(0,Math.sin(y*2))>.85?.25:0,w=Math.max(0,Math.sin(y*2+1.2))>.9?.18:0,T=.08+b*.3+w*.2+ft*.1+v*.3+lt*1.5;if(x.cheekMatL.emissiveIntensity=T,x.cheekMatR.emissiveIntensity=T,x.tail){let e=K%6>5?2.5:1;x.tail.rotation.z=Math.sin(K*1.8*e)*.18+Math.sin(K*4.2)*.04,x.tail.rotation.y=.15+Math.sin(K*2.5)*.12+Math.cos(K*3.8)*.05,x.tail.rotation.x=-.45+Math.sin(K*1.2)*.05}let k=K%10,te=k>8.5&&k<10?Math.sin((k-8.5)/1.5*Uf)*.65:0;x.leftArm&&(x.leftArm.rotation.z=.55+Math.sin(K*1.2)*.18-te),x.rightArm&&(x.rightArm.rotation.z=-.55+Math.sin(K*1.2+1)*.18);let P=3.5+Math.sin(K*.1)*.5,se=K%P,F=se>.35&&se<.65,ue=se<.15||F,de=ue?F?(se-.35)/.3:se/.15:0,fe=ue?Math.max(.01,1-Math.sin(de*Uf)*.99):Math.max(.01,v>0?.4:u?.35:0);x.leftEyelid&&(x.leftEyelid.scale.y=fe),x.rightEyelid&&(x.rightEyelid.scale.y=fe);let pe=lt*-.12,I=v>0?-.08:u?-.06:pe,L=Math.sin(K*2.5)*.05+(Math.sin(K*7.3)>.95?.12:0)+I,me=Math.sin(K*2.5+.6)*.05+(Math.sin(K*8.1+1)>.95?.12:0)+I;x.leftEarGroup&&(x.leftEarGroup.rotation.x=-.12+L),x.rightEarGroup&&(x.rightEarGroup.rotation.x=-.12+me);let he=lt*8;for(let e=0;e<x.sparkMats.length;e++){let t=Math.sin(K*8+e*2.7)*Math.sin(K*3.1+e*1.3),n=.12+Math.abs(t)*.3,r=Math.sin(K*45+e*2.7)*.5+.5;x.sparkMats[e].opacity=Math.min(1,Math.max(n,_*(.55+r*.45))+lt*(.4+r*he*.1))}x.sparks.rotation.y+=n*(.35+_*6+lt*12);let ge=i*.008,_e=a*-.005,ve=Math.sin(K*.18)*.015+ge,z=Math.sin(K*.13+.7)*.01+_e;x.leftPupil&&(x.leftPupil.position.x=-.32+ve,x.leftPupil.position.y=.055+z),x.rightPupil&&(x.rightPupil.position.x=.32+ve,x.rightPupil.position.y=.055+z);let we=u?.008:.003;if(x.tongue&&(x.tongue.position.y=-.12+Math.sin(K*2)*we),x.mouthMesh){let e=u?.03:0;x.mouthMesh.position.y=-.12-e}x.auraMat.opacity=Math.max(.04+Math.sin(K*4)*.02,Math.max(_*(.15+Math.sin(K*30)*.05),lt*(.4+Math.sin(K*40)*.1)));for(let e=0;e<x.coronaMats.length;e++){let t=Math.sin(K*5.5+e*2.1)*Math.cos(K*3.2+e*1.4),n=.3+Math.abs(t)*.55;x.coronaMats[e].opacity=Math.min(1,n+_*.9+lt*2)}C[0].mesh.rotation.z=.15+K*.07,C[0].mat.opacity=.9+Math.sin(K*.6)*.06+ft*.04,D.rotation.z=C[0].mesh.rotation.z,E.opacity=.14+Math.sin(K*.6)*.04+ft*.08,C[1].mesh.rotation.z=-.3-K*.1,C[1].mat.opacity=.22+Math.sin(K*.5)*.04,C[2].mesh.rotation.z=.5+K*.04,C[2].mesh.rotation.x=Uf*.62+Math.sin(K*.15)*.08,C[2].mat.opacity=.12+Math.sin(K*.45)*.03+ft*.04,C[3].mesh.rotation.z=-.8+K*.12,C[3].mat.opacity=.08+Math.sin(K*.55)*.02;for(let e=0;e<4;e++){let t=O[e],n=(K*.25+t.phase)%1,r=2+n*6;t.mesh.scale.set(r,r,1),t.mat.uniforms.uOpacity.value=(1-n)*.06*(.5+ft)}for(let e=0;e<8;e++){let t=A[e];t.mat.uniforms.uTime.value=K+t.phase*6.28,t.mat.uniforms.uOpacity.value=(.1+ft*.25)*(.5+.5*Math.sin(K*.8+e))}for(let e=0;e<ee.length;e++){let t=ee[e],n=.5+.5*Math.sin(K*t.speed+e*1.7);t.mat.opacity=(.05+ft*.18)*(.4+n*.6),t.sprite.scale.setScalar(t.baseScale*(.9+n*.2+ft*.3)),t.sprite.position.set(t.off.x+Math.sin(K*.2+e)*.1,t.off.y+Math.cos(K*.18+e)*.1,t.off.z)}ne.scale.setScalar(3.5+Math.sin(K*.6)*.3+ft*.4),j.opacity=.04+ft*.03+Math.sin(K*.5)*.01,N.scale.setScalar(5.5+Math.sin(K*.4)*.3),M.opacity=.02+ft*.015,H.uniforms.uTime.value=K,H.uniforms.uEnergy.value=ft,U.rotation.y=K*.03,Ie.uniforms.uTime.value=K;let Te=Fe.attributes.position;for(let e=0;e<500;e++){let t=Pe[e];t.theta+=t.thetaSpd*n,t.phi+=t.phiSpd*n*.5,Te.setXYZ(e,t.r*Math.sin(t.phi)*Math.cos(t.theta),t.r*Math.cos(t.phi),t.r*Math.sin(t.phi)*Math.sin(t.theta))}Te.needsUpdate=!0;for(let e=0;e<14;e++){let t=re[e];t.angle+=t.speed*n;let r=Math.cos(t.angle)*t.r,i=t.y+Math.sin(K*.2+e*.7)*.25,a=Math.sin(t.angle)*t.r;ie[e].position.set(r,i,a),ie[e].rotation.y=K*1.5,ie[e].rotation.x=K*1,ae[e].position.set(r,i,a),ae[e].scale.setScalar(.18+Math.sin(K*1+e)*.04+ft*.03);let o=oe[e].geo.attributes.position;o.setXYZ(0,0,0,0),o.setXYZ(1,r,i,a),o.needsUpdate=!0}for(let e=0;e<le.length;e++)le[e].mesh.rotation.z=K*(.03+e*.015)*(e%2==0?1:-1),le[e].mat.opacity=.09-e*.0125+ft*.04;Se.rotation.y=K*.1,Ce.rotation.y=-K*.08,ye.opacity=.09+ft*.07+Math.sin(K*1.2)*.024,R.opacity=.06+ft*.06+Math.sin(K*1.2+1)*.018,be.opacity=.06+ft*.05+Math.sin(K*1+2)*.018,xe.opacity=.04+ft*.04+Math.sin(K*1+3)*.012;let B=De.attributes.position;for(let e=0;e<200;e++){let t=Ee[e];t.a+=t.spd*n,B.setXYZ(e,Math.cos(t.a)*t.r,t.y0+Math.sin(K*.3+e*.5)*.4+Math.sin(t.a*2)*t.tilt,Math.sin(t.a)*t.r)}B.needsUpdate=!0,p.position.y=Math.sin(K*.15)*.1+Math.sin(K*.06)*.04,p.position.x=Math.sin(K*.12+1)*.05,p.rotation.y=Math.sin(K*.22)*.1;let V=i*.9,ke=.4+a*-.6;r.position.x+=(V-r.position.x)*.035,r.position.y+=(ke-r.position.y)*.035,r.lookAt(0,0,0),We.uniforms.uTime.value=K,Re.rotation.y=K*.004,Re.rotation.x=Math.sin(K*.015)*.02,G.uniforms.uTime.value=K;let Ae=W.attributes.position;for(let e=0;e<100;e++){let t=Xe[e];t.a+=t.spd*n,Ae.setXYZ(e,Math.cos(t.a)*t.r,t.y0+Math.sin(K*.12+e*.3)*.6,Math.sin(t.a)*t.r)}Ae.needsUpdate=!0,c.render()}return dt=requestAnimationFrame(vt),{setEnergy(e){pt=Math.max(0,Math.min(1,e))},pikaEmote(e){Nf(e),e===`excited`||e===`happy`?(pt=.85,setTimeout(()=>{pt=.06},1200)):e===`surprised`?(pt=.7,setTimeout(()=>{pt=.06},800)):e===`curious`?(pt=.45,setTimeout(()=>{pt=.06},900)):e===`sad`&&(pt=.15,setTimeout(()=>{pt=.06},1500))},dispose(){cancelAnimationFrame(dt),ut(),ct(),window.removeEventListener(`resize`,f),window.removeEventListener(`mousemove`,o),y&&y.dispose(),t.dispose(),c.dispose(),e.removeChild(t.domElement)},startBodyDetection:st,stopBodyDetection:ct}}function pp(e){let t=document.createElement(`canvas`);t.className=`flow-bg`,e.prepend(t);let n=t.getContext(`2d`),r=0,i=0,a=1,o=0,s=0,c=0,l=0,u=0,d=e=>{s=(e.clientX/window.innerWidth-.5)*2,c=(e.clientY/window.innerHeight-.5)*2};window.addEventListener(`mousemove`,d);let f=[],p=[],m=[],h=[],g=[],_=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||window.innerWidth<768,v=_?14:28,y=_?50:160,b=_?16:40,x=_?5:8,S=_?80:200,C=Math.PI*2;function w(){a=Math.min(window.devicePixelRatio||1,2.5);let e=window.innerWidth,o=window.innerHeight;t.width=Math.round(e*a),t.height=Math.round(o*a),t.style.width=e+`px`,t.style.height=o+`px`,n.setTransform(a,0,0,a,0,0);let s=f.length===0;r=e,i=o,s?E():T()}function T(){D()}function E(){f.length=0,p.length=0,m.length=0,h.length=0,g.length=0;for(let e=0;e<v;e++){let t=10+Math.floor(Math.random()*5),n=[],a=i*(.05+Math.random()*.9),o=i*(.12+Math.random()*.28),s=Math.random()*C,c=Math.random()*C;for(let e=0;e<t;e++){let i=e/(t-1),l=a+Math.sin(i*Math.PI*1.6+s)*o+Math.sin(i*Math.PI*3.3+c)*o*.35;n.push({x:i*(r+700)-350,y:l})}let l=e%4,u=l===0,d=l===2;f.push({points:n,speed:.08+Math.random()*.22,offset:Math.random()*C,width:.5+Math.random()*1.9,opacity:.025+Math.random()*.06,hue:d?33:u?45:43+Math.random()*6,sat:u?28:d?75:68,light:u?86:d?62:60,depth:.3+Math.random()*1.5,dashPhase:Math.random()*100,dashSpeed:18+Math.random()*40,pulsePhase:Math.random()*C,pulseSpeed:.4+Math.random()*.9})}for(let e=0;e<y;e++)O();D();for(let e=0;e<x;e++){let e=(_?220:320)+Math.random()*(_?260:420),t=Math.random()*r,n=Math.random()*i;h.push({x:t,y:n,baseX:t,baseY:n,radius:e,baseRadius:e,opacity:.008+Math.random()*.012,hue:Math.random()<.5?43:33,driftX:60+Math.random()*140,driftY:40+Math.random()*100,driftPhaseX:Math.random()*C,driftPhaseY:Math.random()*C,scalePhase:Math.random()*C,scaleSpeed:.04+Math.random()*.08,depth:.15+Math.random()*.5})}for(let e=0;e<S;e++){let e=Math.random();g.push({x:Math.random()*r,y:Math.random()*i,size:e>.92?1.6:e>.6?1:.6,baseOpacity:e>.92?.5:e>.6?.32:.18,twinklePhase:Math.random()*C,twinkleSpeed:.5+Math.random()*2.2,warm:+(Math.random()<.4),depth:.1+Math.random()*.6})}}function D(){m.length=0;let e=Math.ceil(Math.sqrt(r/Math.max(i,1)*b))+1,t=Math.ceil(b/Math.max(e-1,1))+1,n=r/(e-1),a=i/(t-1),o=0;for(let r=0;r<t&&o<b;r++)for(let t=0;t<e&&o<b;t++){let e=(Math.random()-.5)*n*.6,i=(Math.random()-.5)*a*.6,s=t*n+e+r%2*n*.5,c=r*a+i;m.push({x:s,y:c,size:16+Math.random()*42,opacity:.014+Math.random()*.026,phase:Math.random()*C,waveDist:s+c,neighbors:[]}),o++}let s=Math.min(r,i)*.22+120,c=s*s;for(let e=0;e<m.length;e++){let t=m[e];for(let n=e+1;n<m.length;n++){let e=m[n],r=t.x-e.x,i=t.y-e.y;r*r+i*i<c&&t.neighbors.push(n)}}}function O(){let e=Math.random(),t=e<.55?0:e<.85?1:2,n=.2+Math.random()*1.6,a=Math.random()*r,o=Math.random()*i,s,c,l,u,d,f=0,m=0;t===0?(s=(Math.random()-.5)*.9,c=-.25-Math.random()*.7,l=.5+Math.random()*1.1,u=.1+Math.random()*.16,d=140+Math.random()*260):t===1?(s=(Math.random()-.5)*.25,c=-.05-Math.random()*.2,l=1.4+Math.random()*1.8,u=.08+Math.random()*.14,d=300+Math.random()*400,f=6+Math.random()*18,m=(Math.random()<.5?-1:1)*(.4+Math.random()*1.1)):(s=(Math.random()-.5)*.12,c=-.02-Math.random()*.08,l=3+Math.random()*4.5,u=.04+Math.random()*.07,d=500+Math.random()*600);let h=.5+n*.4,g=Math.random();p.push({x:a,y:o,px:a,py:o,vx:s,vy:c,size:l*h,baseSize:l*h,opacity:u*(.4+n*.4),hue:g>.7?45:g>.35?43:33,sat:g>.7?40:78,light:g>.7?82:66,life:0,maxLife:d,depth:n,kind:t,pulsePhase:Math.random()*C,pulseSpeed:.6+Math.random()*1.8,orbitRadius:f,orbitSpeed:m,orbitPhase:Math.random()*C,ox:a,oy:o})}function k(e,t,r){n.beginPath();for(let i=0;i<6;i++){let a=Math.PI/3*i-Math.PI/6,o=e+r*Math.cos(a),s=t+r*Math.sin(a);i===0?n.moveTo(o,s):n.lineTo(o,s)}n.closePath()}function A(e,t,r,i){let a=e.points;n.beginPath(),n.moveTo(a[0].x+r,a[0].y+i);for(let o=0;o<a.length-1;o++){let s=a[o],c=a[o+1],l=Math.sin(t*e.speed*1.3+e.offset+o*.8)*22,u=(s.x+c.x)/2+r,d=(s.y+c.y)/2+i+l;n.quadraticCurveTo(s.x+r,s.y+i+l*.5,u,d)}let o=a[a.length-1];n.lineTo(o.x+r,o.y+i)}function ee(e,t){let r=Math.sin(t*e.speed+e.offset),i=Math.cos(t*e.speed*.7+e.offset+1.5),a=l*e.depth*28,o=u*e.depth*20,s=r*32+i*16+o,c=.65+.35*Math.sin(t*e.pulseSpeed+e.pulsePhase);n.lineCap=`round`,n.lineJoin=`round`;let d=[7.5,5,3.2,2,1.1,.55],f=[.05,.09,.16,.3,.6,1];for(let r=0;r<6;r++){A(e,t,a,s),n.lineWidth=e.width*d[r];let i=e.opacity*f[r]*c,o=r>=4?12:r>=3?6:0;if(n.strokeStyle=`hsla(${e.hue}, ${e.sat}%, ${Math.min(e.light+o,95)}%, ${i})`,r>=4){let r=14+e.width*6,i=22+e.width*8;n.setLineDash([r,i]),n.lineDashOffset=-(t*e.dashSpeed+e.dashPhase*10)}else n.setLineDash([]);n.stroke()}n.setLineDash([])}function te(e,t){let r=l*e.depth*30,i=u*e.depth*24;e.x=e.baseX+Math.sin(t*.06+e.driftPhaseX)*e.driftX+r,e.y=e.baseY+Math.cos(t*.045+e.driftPhaseY)*e.driftY+i;let a=1+Math.sin(t*e.scaleSpeed+e.scalePhase)*.22;e.radius=e.baseRadius*a;let o=e.opacity*(.7+.3*Math.sin(t*.1+e.scalePhase)),s=n.createRadialGradient(e.x,e.y,0,e.x,e.y,e.radius);s.addColorStop(0,`hsla(${e.hue}, 70%, 60%, ${o})`),s.addColorStop(.45,`hsla(${e.hue}, 65%, 55%, ${o*.45})`),s.addColorStop(1,`transparent`),n.fillStyle=s,n.fillRect(e.x-e.radius,e.y-e.radius,e.radius*2,e.radius*2)}function j(e){let t=i*.7,a=i-t;if(a<=0)return;let o=r*.5+l*40,s=t-a*.15,c=`rgba(218, 165, 32,`,u=l*18;n.lineWidth=1;for(let e=0;e<=9;e++){let i=e/9,o=t+i*i*a;n.strokeStyle=`${c} ${.04*(.35+i*.65)})`,n.beginPath(),n.moveTo(0,o),n.lineTo(r,o),n.stroke()}for(let e=0;e<=16;e++){let t=e/16*r*1.6-r*.3+u;n.strokeStyle=`${c} 0.03)`,n.beginPath(),n.moveTo(o,s),n.lineTo(t,i),n.stroke()}let d=e*.18%1,f=t+d*d*a,p=.12*(1-d),m=n.createLinearGradient(0,f-24,0,f+6);m.addColorStop(0,`rgba(218, 165, 32, 0)`),m.addColorStop(1,`rgba(245, 220, 170, ${p})`),n.fillStyle=m,n.fillRect(0,f-24,r,30)}function ne(e){for(let t=0;t<g.length;t++){let r=g[t],i=.5+.5*Math.sin(e*r.twinkleSpeed+r.twinklePhase),a=r.baseOpacity*(.35+.65*i),o=r.x+l*r.depth*6,s=r.y+u*r.depth*6;r.warm?n.fillStyle=`rgba(245, 215, 150, ${a})`:n.fillStyle=`rgba(240, 238, 230, ${a})`,n.beginPath(),n.arc(o,s,r.size*(.8+i*.4),0,C),n.fill()}}function M(e){let t=Math.sin(e*.25)*.3+.55,a=r*.5+l*20,o=i*.4+u*16,s=n.createRadialGradient(a,o,0,a,o,r*.7);s.addColorStop(0,`rgba(218, 165, 32, ${.014*t})`),s.addColorStop(.25,`rgba(232, 200, 140, ${.009*t})`),s.addColorStop(.55,`rgba(245, 230, 200, ${.005*t})`),s.addColorStop(1,`transparent`),n.fillStyle=s,n.fillRect(0,0,r,i);let c=Math.cos(e*.18)*.3+.5,d=r*.72+l*14,f=i*.78+u*12,p=n.createRadialGradient(d,f,0,d,f,r*.55);p.addColorStop(0,`rgba(120, 85, 30, ${.012*c})`),p.addColorStop(.5,`rgba(80, 55, 20, ${.006*c})`),p.addColorStop(1,`transparent`),n.fillStyle=p,n.fillRect(0,0,r,i)}function N(e){let t=Math.min(r,i)*.5+200,a=e*90%(r+i+t);n.lineWidth=.6;for(let t=0;t<m.length;t++){let r=m[t],i=r.x+l*14,a=r.y+u*10;for(let t=0;t<r.neighbors.length;t++){let o=m[r.neighbors[t]],s=o.x+l*14,c=o.y+u*10;n.strokeStyle=`rgba(218, 165, 32, ${.012*(.4+.6*Math.sin(e*.5+r.phase))})`,n.beginPath(),n.moveTo(i,a),n.lineTo(s,c),n.stroke()}}for(let r=0;r<m.length;r++){let i=m[r],o=i.x+l*14,s=i.y+u*10,c=Math.abs(i.waveDist-a),d=c<t?1-c/t:0,f=.5+.5*Math.sin(e*.45+i.phase),p=i.opacity*(.4+.6*f),h=p*(.35+d*1.6),g=p*(.8+d*1.2),_=n.createRadialGradient(o,s,0,o,s,i.size),v=d>.3?45:43;_.addColorStop(0,`hsla(${v}, 70%, ${60+d*20}%, ${h})`),_.addColorStop(1,`hsla(33, 70%, 50%, 0)`),k(o,s,i.size),n.fillStyle=_,n.fill(),n.strokeStyle=`hsla(43, 65%, ${58+d*22}%, ${g})`,n.lineWidth=.5+d*.8,n.stroke()}}function re(e,t){let r=.75+.25*Math.sin(t*e.pulseSpeed+e.pulsePhase);e.size=e.baseSize*r;let i=ie(e),a=l*e.depth*12,o=u*e.depth*9,s=e.x+a,c=e.y+o;if(e.kind!==2){let t=e.px+a,r=e.py+o,s=n.createRadialGradient(t,r,0,t,r,e.size*2.2);s.addColorStop(0,`hsla(${e.hue}, ${e.sat}%, ${e.light}%, ${e.opacity*i*.18})`),s.addColorStop(1,`transparent`),n.fillStyle=s,n.fillRect(t-e.size*2.2,r-e.size*2.2,e.size*4.4,e.size*4.4)}let d=e.size*3.5,f=n.createRadialGradient(s,c,0,s,c,d),p=e.opacity*i;f.addColorStop(0,`hsla(${e.hue}, ${e.sat}%, ${Math.min(e.light+10,92)}%, ${p})`),f.addColorStop(.25,`hsla(${e.hue}, ${e.sat}%, ${e.light}%, ${p*.55})`),f.addColorStop(.55,`hsla(${e.hue}, ${e.sat}%, ${e.light-6}%, ${p*.2})`),f.addColorStop(1,`transparent`),n.fillStyle=f,n.fillRect(s-d,c-d,d*2,d*2)}function ie(e){let t=e.life/e.maxLife;return t<.1?t/.1:t>.8?(1-t)/.2:1}let ae=0,oe=0;function P(e){if(o=requestAnimationFrame(P),document.hidden||document.body.classList.contains(`bg-paused`)||e-oe<33.333333333333336)return;oe=e,ae||=e;let t=(e-ae)/1e3;l+=(s-l)*.06,u+=(c-u)*.06,n.clearRect(0,0,r,i),M(t),ne(t),n.globalCompositeOperation=`lighter`;for(let e=0;e<h.length;e++)te(h[e],t);j(t),N(t);for(let e=0;e<f.length;e++)ee(f[e],t);for(let e=p.length-1;e>=0;e--){let n=p[e];if(n.px=n.x,n.py=n.y,n.kind===1&&n.orbitRadius>0?(n.ox+=n.vx,n.oy+=n.vy,n.orbitPhase+=n.orbitSpeed*.02,n.x=n.ox+Math.cos(n.orbitPhase)*n.orbitRadius,n.y=n.oy+Math.sin(n.orbitPhase)*n.orbitRadius):(n.x+=n.vx,n.y+=n.vy),n.life++,n.life>=n.maxLife||n.y<-20||n.x<-20||n.x>r+20){p.splice(e,1),O();continue}re(n,t)}n.globalCompositeOperation=`source-over`}return w(),window.addEventListener(`resize`,w),o=requestAnimationFrame(P),{dispose(){cancelAnimationFrame(o),window.removeEventListener(`resize`,w),window.removeEventListener(`mousemove`,d),t.remove()}}}var mp=`alpha_key`,hp=`alpha_grok`,gp=`alpha_openai`,_p=`alpha_provider`,vp=`alpha_putermodel`,yp=`alpha_name`,bp=`alpha_micLang`,xp=`alpha_replyLang`,Sp=`alpha_textLang`,Cp=`alpha_amb`,wp=`alpha_ambpreset`,Tp=`alpha_sfx`,Ep=`alpha_wake`,Dp=`alpha_voice`,Op=`alpha_vgender`,kp=`alpha_vspeed`,Ap=`alpha_vpitch`,jp=`alpha_vvolume`,Mp=`alpha_theme`,Np=`alpha_fontsize`,Pp=`alpha_haptics`,Fp=`alpha_autospeak`,Ip=`alpha_uilang`,Lp=`alpha_pikavoice`,Rp=`alpha_pikavol`,zp=`alpha_pikapitch`;function Bp(){let e=parseFloat(localStorage.getItem(Cp)||``);isNaN(e)&&(e=.4);let t=parseFloat(localStorage.getItem(kp)||``);isNaN(t)&&(t=1);let n=parseFloat(localStorage.getItem(Ap)||``);isNaN(n)&&(n=1);let r=parseFloat(localStorage.getItem(jp)||``);isNaN(r)&&(r=1);let i=parseInt(localStorage.getItem(Np)||``);return isNaN(i)&&(i=14),{key:localStorage.getItem(mp)||``,grokKey:localStorage.getItem(hp)||``,openaiKey:localStorage.getItem(gp)||``,provider:localStorage.getItem(_p)||`puter`,puterModel:localStorage.getItem(vp)||`gpt-4o-mini`,name:localStorage.getItem(yp)||`ALPHA`,micLang:localStorage.getItem(bp)||`he`,replyLang:localStorage.getItem(xp)||`en`,textLang:localStorage.getItem(Sp)||`auto`,history:[],voiceOn:localStorage.getItem(Dp)!==`0`,voiceGender:localStorage.getItem(Op)||`female`,voiceSpeed:t,voicePitch:n,voiceVolume:r,ambLevel:e,ambPreset:localStorage.getItem(wp)||`pad`,sfxOn:localStorage.getItem(Tp)!==`0`,wakeOn:localStorage.getItem(Ep)===`1`,theme:localStorage.getItem(Mp)||`dark`,fontSize:i,haptics:localStorage.getItem(Pp)!==`0`,autoSpeak:localStorage.getItem(Fp)!==`0`,uiLang:localStorage.getItem(Ip)||`he`,pikaVoiceOn:localStorage.getItem(Lp)!==`0`,pikaVolume:(()=>{let e=parseFloat(localStorage.getItem(Rp)||``);return isNaN(e)?.6:e})(),pikaPitch:(()=>{let e=parseFloat(localStorage.getItem(zp)||``);return isNaN(e)?2:e})()}}function Vp(e){localStorage.setItem(mp,e.key),localStorage.setItem(hp,e.grokKey),localStorage.setItem(gp,e.openaiKey),localStorage.setItem(_p,e.provider),localStorage.setItem(vp,e.puterModel),localStorage.setItem(yp,e.name),localStorage.setItem(bp,e.micLang),localStorage.setItem(xp,e.replyLang),localStorage.setItem(Sp,e.textLang),localStorage.setItem(Cp,e.ambLevel.toFixed(2)),localStorage.setItem(wp,e.ambPreset),localStorage.setItem(Tp,e.sfxOn?`1`:`0`),localStorage.setItem(Ep,e.wakeOn?`1`:`0`),localStorage.setItem(Dp,e.voiceOn?`1`:`0`),localStorage.setItem(Op,e.voiceGender),localStorage.setItem(kp,e.voiceSpeed.toFixed(2)),localStorage.setItem(Ap,e.voicePitch.toFixed(2)),localStorage.setItem(jp,e.voiceVolume.toFixed(2)),localStorage.setItem(Mp,e.theme),localStorage.setItem(Np,String(e.fontSize)),localStorage.setItem(Pp,e.haptics?`1`:`0`),localStorage.setItem(Fp,e.autoSpeak?`1`:`0`),localStorage.setItem(Ip,e.uiLang),localStorage.setItem(Lp,e.pikaVoiceOn?`1`:`0`),localStorage.setItem(Rp,e.pikaVolume.toFixed(2)),localStorage.setItem(zp,e.pikaPitch.toFixed(2))}function Hp(){try{return JSON.parse(localStorage.getItem(`alpha_events`)||`[]`)}catch{return[]}}function Up(){let e=Hp(),t=[];try{t=JSON.parse(localStorage.getItem(`hg2:tasks`)||`[]`).filter(e=>e.date&&!e.done).map(e=>({id:`hg:`+e.id,title:e.title,date:e.date,time:``}))}catch{}let n=new Set(e.map(e=>e.title.toLowerCase()+`|`+e.date)),r=t.filter(e=>!n.has(e.title.toLowerCase()+`|`+e.date));return[...e,...r].sort((e,t)=>(e.date+e.time).localeCompare(t.date+t.time))}function Wp(e){localStorage.setItem(`alpha_events`,JSON.stringify(e.filter(e=>!e.id.startsWith(`hg:`))))}function Gp(e){if(e.startsWith(`hg:`)){let t=e.slice(3);try{let e=JSON.parse(localStorage.getItem(`hg2:tasks`)||`[]`);localStorage.setItem(`hg2:tasks`,JSON.stringify(e.filter(e=>e.id!==t)))}catch{}}else Wp(Hp().filter(t=>t.id!==e))}function Kp(e,t,n){let r=Hp();r.push({id:Date.now()+`_`+Math.random(),title:e,date:t,time:n||``}),r.sort((e,t)=>(e.date+e.time).localeCompare(t.date+t.time)),localStorage.setItem(`alpha_events`,JSON.stringify(r));try{let n=JSON.parse(localStorage.getItem(`hg2:tasks`)||`[]`);if(!n.some(n=>n.title===e&&n.date===t)){let r=Date.now().toString(36)+Math.random().toString(36).slice(2,6);n.unshift({id:r,title:e,date:t,done:!1,ts:Date.now()}),localStorage.setItem(`hg2:tasks`,JSON.stringify(n))}}catch{}return Up()}function qp(){let e=new Date().toISOString().slice(0,10),t=Up().filter(t=>t.date>=e).slice(0,10);return t.length?t.map(e=>`${e.date} ${e.time} ${e.title}`).join(` ; `):`empty`}function Jp(){try{return JSON.parse(localStorage.getItem(`alpha_tasks`)||`[]`)}catch{return[]}}function Yp(e){localStorage.setItem(`alpha_tasks`,JSON.stringify(e))}function Xp(e,t=`med`){let n=Jp();return n.push({id:Date.now()+`_`+Math.random(),text:e,done:!1,created:new Date().toISOString().slice(0,10),priority:t}),Yp(n),n}function Zp(e){let t=Jp(),n=t.find(t=>t.id===e);return n&&(n.done=!n.done),Yp(t),t}function Qp(e){let t=Jp().filter(t=>t.id!==e);return Yp(t),t}function $p(){try{return JSON.parse(localStorage.getItem(`alpha_notes`)||`[]`)}catch{return[]}}function em(e){let t=$p();t.unshift(e),t.length>50&&(t.length=50),localStorage.setItem(`alpha_notes`,JSON.stringify(t))}function tm(){localStorage.setItem(`alpha_notes`,`[]`)}var nm={business:{id:`business`,label:`Business`,hue:38,icon:`M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9v.01M9 12v.01M9 15v.01`,keywords:{heavyguard:3,install:2,installation:2,contractor:2,quote:3,quotation:2,invoice:2,client:2,customer:2,schedule:1.5,inventory:2,stock:2,scania:2.5,volvo:2.5,truck:1.5,camera:1.5,fleet:2,marketing:2,tiktok:2,facebook:2,instagram:1.5,hashtag:2,campaign:2,viral:2,"הצעת מחיר":3,קבלן:3,התקנה:2.5,לקוח:2,מלאי:2,סקאניה:2.5,וולוו:2.5,משאית:2,מצלמה:1.5,שיווק:2,פוסט:1.5,קמפיין:2,רכב:1.5,חשבונית:2},systemFragment:`ACTIVE MODULE: BUSINESS OPS (HeavyGuard). Act as a sharp operations + marketing partner for a field-installation business (360° truck cameras, trackers, security for Scania/Volvo etc.). Help with CRM, scheduling, inventory, quotes, and marketing copy. Use [[HG_SEARCH]], [[HG_EARNINGS]], [[HG_QUOTE]], [[DIARY]] when relevant. Be concrete and commercial.`},trading:{id:`trading`,label:`Trading`,hue:145,icon:`M3 17l6-6 4 4 8-8M14 7h7v7`,keywords:{trade:3,trading:3,crypto:2.5,bitcoin:2.5,btc:2.5,eth:2,ethereum:2,binance:3,tradingview:2.5,bot:2,market:1.5,price:1.5,chart:1.5,polymarket:3,prediction:2,position:2,portfolio:2,profit:1.5,loss:1.5,stock:1.5,forex:2,leverage:2,signal:2,webhook:2,alert:1.5,מסחר:3,קריפטו:2.5,ביטקוין:2.5,מטבע:1.5,שוק:1.5,גרף:1.5,בוט:2,תחזית:2,רווח:1.5,הפסד:1.5,פוזיציה:2,תיק:1.5,התראה:1.5},systemFragment:`ACTIVE MODULE: FINANCIAL / ALGO-TRADING. Act as a disciplined FinTech analyst. Discuss markets, bots, prediction markets (Polymarket), thresholds and risk. NEVER give reckless financial advice; frame ideas as analysis, flag risk. You can read public market data widgets but cannot execute trades from the chat.`},creative:{id:`creative`,label:`Creative`,hue:280,icon:`M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586M11 13a2 2 0 100-4 2 2 0 000 4z`,keywords:{lyrics:3,rap:3,hip:2,hop:2,verse:2.5,hook:2.5,chorus:2.5,bar:1.5,rhyme:2.5,beat:2,song:2,music:2,melody:1.5,mixing:2,mastering:2,write:1.2,writing:1.2,story:1.5,poem:2,lyric:3,flow:1.5,studio:1.5,שיר:2.5,מילים:2,ראפ:3,היפ:2,בית:1.5,פזמון:2.5,חרוז:2.5,ביט:2,מנגינה:1.5,מוזיקה:2,כתיבה:1.2,סטודיו:1.5,לחן:1.5},systemFragment:`ACTIVE MODULE: CREATIVE STUDIO. Act as a world-class creative collaborator and lyricist (rap/hip-hop structure: intro, verse, hook, bridge, outro). Help write, refine, and structure lyrics, and craft prompts for AI music generation + mastering. Keep rhythm, internal rhyme, and flow in mind. Be bold and original.`},personal:{id:`personal`,label:`Personal`,hue:200,icon:`M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10`,keywords:{family:2.5,kid:2,child:2,son:2,daughter:2,wife:2,home:1.5,reminder:2,errand:2,grocery:2,doctor:1.5,appointment:1.5,birthday:2,personal:2,life:1.2,weekend:1.5,vacation:1.5,health:1.5,gym:1.5,משפחה:2.5,ילד:2,ילדה:2,בן:1.5,בת:1.5,אישה:2,בית:1.5,תזכורת:2,קניות:2,רופא:1.5,פגישה:1.2,יום:1,הולדת:2,חופש:1.5,בריאות:1.5},systemFragment:`ACTIVE MODULE: PERSONAL & LIFE. Act as a warm, organized chief-of-staff for personal life: family scheduling, kids’ activities, household reminders, health and errands. Use [[EVENT]] and [[CALENDAR]] to manage the calendar. Be caring, concise, and practical.`}},rm=Object.values(nm);function im(e){return e===`general`?null:nm[e]||null}var am=`general`,om=1.2;function sm(e){let t=e.toLowerCase(),n={};for(let e of rm){let r=0;for(let[n,i]of Object.entries(e.keywords))t.includes(n.toLowerCase())&&(r+=i);n[e.id]=r}let r=`general`,i=0;for(let[e,t]of Object.entries(n))t>i&&(i=t,r=e);let a;a=i>=om?r:i>0&&am!==`general`?am:i>0?r:am;let o=Object.values(n).sort((e,t)=>t-e),s=(o[0]||0)-(o[1]||0),c=Math.max(0,Math.min(1,(i>0?.4:0)+s/6)),l=a!==am;return am=a,{module:a,confidence:c,scores:n,switched:l}}var cm=`alpha_brain_memory_v1`,lm=200;function um(){return{profile:{name:``,role:``,business:``,location:``,preferences:[]},facts:[],projects:[],summary:``,updated:Date.now()}}var dm=null;function fm(){if(dm)return dm;try{let e=localStorage.getItem(cm);if(e){let t=JSON.parse(e);return dm={...um(),...t,profile:{...um().profile,...t.profile}},dm}}catch{}return dm=um(),dm}function pm(e){e.updated=Date.now(),dm=e;try{localStorage.setItem(cm,JSON.stringify(e))}catch{}}function mm(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}function hm(e,t=`general`,n=.6){let r=e.trim();if(!r)return;let i=fm(),a=r.toLowerCase();i.facts.some(e=>e.text.toLowerCase()===a)||(i.facts.unshift({id:mm(),text:r,module:t,ts:Date.now(),weight:n}),i.facts.length>lm&&(i.facts.length=lm),pm(i))}function gm(e){let t=fm();t.facts=t.facts.filter(t=>t.id!==e),pm(t)}function _m(e,t=6,n){let r=fm(),i=vm(e),a=Date.now();return r.facts.map(e=>{let t=vm(e.text),r=0;for(let e of i)t.includes(e)&&r++;let o=(a-e.ts)/864e5,s=Math.exp(-o/45),c=n&&e.module===n?.5:0;return{f:e,score:r*1+e.weight*.8+s*.4+c}}).filter(e=>e.score>.3).sort((e,t)=>t.score-e.score).slice(0,t).map(e=>e.f)}function vm(e){return e.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,` `).split(/\s+/).filter(e=>e.length>2)}function ym(e,t,n=``){let r=fm(),i={id:mm(),module:t,title:e.trim(),status:`active`,notes:n,ts:Date.now()};return r.projects.unshift(i),pm(r),i}function bm(e){let t=fm();t.projects=t.projects.filter(t=>t.id!==e),pm(t)}function xm(e){let t=fm();t.profile={...t.profile,...e},pm(t)}function Sm(e){let t=fm();t.summary=e.slice(0,1200),pm(t)}function Cm(e,t,n=1400){let r=fm(),i=[],a=r.profile,o=[a.name&&`name: ${a.name}`,a.role&&`role: ${a.role}`,a.business&&`business: ${a.business}`,a.location&&`location: ${a.location}`,a.preferences.length&&`prefs: ${a.preferences.join(`, `)}`].filter(Boolean);o.length&&i.push(`USER PROFILE — ${o.join(`; `)}.`),a.name&&i.push(`Address the user warmly by their name ("${a.name}") naturally in replies, without overusing it.`);let s=r.projects.filter(e=>e.status===`active`).slice(0,8);s.length&&i.push(`ACTIVE PROJECTS — `+s.map(e=>`[${e.module}] ${e.title}${e.notes?` (`+e.notes+`)`:``}`).join(`; `)+`.`);let c=_m(e,8,t);c.length&&i.push(`RELEVANT MEMORY — `+c.map(e=>e.text).join(` • `)+`.`),r.summary&&i.push(`CONVERSATION SO FAR — `+r.summary);let l=i.join(`
`);return l.length>n&&(l=l.slice(0,n)+`…`),l}var wm=[/\b(?:remember that|note that|keep in mind|for the record)\b\s+(.+)/i,/\b(?:my|i'm|i am|i prefer|i like|i work|i drive|i own)\b.+/i,/\b(?:תזכור ש|תזכרי ש|זכור ש|שים לב ש|לידיעתך)\b\s*(.+)/,/\b(?:אני|שלי|אני מעדיף|אני אוהב|אני עובד|אני נוהג)\b.+/];function Tm(e,t){let n=e.trim();if(n.length<6||n.length>240)return null;for(let e of wm){let r=e.exec(n);if(r){let e=(r[1]||r[0]).trim(),n=fm().facts.length;return hm(e,t,.7),fm().facts.length>n?e:null}}return null}var Em=`alpha_leads_v1`,Dm=[{id:`lead`,label:`New Lead`,hue:200},{id:`contacted`,label:`Contacted`,hue:45},{id:`quoted`,label:`Quoted`,hue:38},{id:`won`,label:`Won`,hue:140},{id:`lost`,label:`Lost`,hue:0}];function Om(e){return Dm.find(t=>t.id===e)?.label||e}function km(e){return Dm.find(t=>t.id===e)?.hue??200}function Am(){try{return JSON.parse(localStorage.getItem(Em)||`[]`)}catch{return[]}}function jm(e){localStorage.setItem(Em,JSON.stringify(e))}function Mm(e){let t={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),name:e.name||``,phone:e.phone||``,vehicle:e.vehicle||``,service:e.service||``,value:e.value||0,status:e.status||`lead`,followUp:e.followUp||``,notes:e.notes||``,created:Date.now()},n=Am();return n.unshift(t),jm(n),t}function Nm(e,t){let n=Am(),r=n.findIndex(t=>t.id===e);r>=0&&(n[r]={...n[r],...t},jm(n))}function Pm(e){jm(Am().filter(t=>t.id!==e))}function Fm(e){let t=[`lead`,`contacted`,`quoted`,`won`],n=Am(),r=n.find(t=>t.id===e);if(!r)return;let i=t.indexOf(r.status);r.status=i<0||i>=t.length-1?`won`:t[i+1],jm(n)}function Im(){try{return JSON.parse(localStorage.getItem(`hg2:quotes`)||`[]`).map(e=>({status:`draft`,...e}))}catch{return[]}}function Lm(e){localStorage.setItem(`hg2:quotes`,JSON.stringify(e))}function Rm(e,t){let n=Im(),r=n.findIndex(t=>t.id===e);r>=0&&(n[r].status=t,Lm(n))}function zm(e){Lm(Im().filter(t=>t.id!==e))}function Bm(){let e=Am(),t=Im(),n=[];try{n=JSON.parse(localStorage.getItem(`hg2:index`)||`[]`)}catch{}let r=e.filter(e=>e.status===`won`),i=e.filter(e=>e.status===`lost`),a=e.filter(e=>e.status===`lead`||e.status===`contacted`||e.status===`quoted`),o=t.filter(e=>e.status===`accepted`),s=r.reduce((e,t)=>e+(t.value||0),0)+o.reduce((e,t)=>e+(t.total||0),0)+n.reduce((e,t)=>e+(t.price||0),0),c=a.reduce((e,t)=>e+(t.value||0),0),l=r.length+i.length,u=l?r.length/l:0,d=[],f=new Date;for(let e=5;e>=0;e--){let t=new Date(f.getFullYear(),f.getMonth()-e,1).toISOString().slice(0,7),i=0;for(let e of n)(e.date||``).startsWith(t)&&(i+=e.price||0);for(let e of r)new Date(e.created).toISOString().slice(0,7)===t&&(i+=e.value||0);for(let e of o)(e.date||``).startsWith(t)&&(i+=e.total||0);d.push({month:t,total:i})}return{realised:s,pipeline:c,winRate:u,openLeads:a.length,byMonth:d}}function Vm(){let e=new Date().toISOString().slice(0,10);return Am().filter(t=>t.followUp&&t.followUp<=e&&t.status!==`won`&&t.status!==`lost`).sort((e,t)=>e.followUp.localeCompare(t.followUp))}var Hm=`alpha_habits_v1`;function Um(){try{return JSON.parse(localStorage.getItem(Hm)||`[]`)}catch{return[]}}function Wm(e){localStorage.setItem(Hm,JSON.stringify(e))}function Gm(e,t=`✓`){let n={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),name:e,icon:t,done:[],created:Date.now()},r=Um();return r.push(n),Wm(r),n}function Km(e){Wm(Um().filter(t=>t.id!==e))}function qm(e){let t=new Date().toISOString().slice(0,10),n=Um(),r=n.find(t=>t.id===e);r&&(r.done=r.done.includes(t)?r.done.filter(e=>e!==t):[...r.done,t],Wm(n))}function Jm(e){return e.done.includes(new Date().toISOString().slice(0,10))}function Ym(e){let t=new Set(e.done),n=0,r=new Date;for(t.has(r.toISOString().slice(0,10))||r.setDate(r.getDate()-1);t.has(r.toISOString().slice(0,10));)n++,r.setDate(r.getDate()-1);return n}var Xm=`alpha_expenses_v1`,Zm=[`Food`,`Transport`,`Bills`,`Shopping`,`Health`,`Fun`,`Other`];function Qm(){try{return JSON.parse(localStorage.getItem(Xm)||`[]`)}catch{return[]}}function $m(e){localStorage.setItem(Xm,JSON.stringify(e))}function eh(e,t,n){let r={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),label:e,amount:t,category:n,date:new Date().toISOString().slice(0,10)},i=Qm();return i.unshift(r),$m(i),r}function th(e){$m(Qm().filter(t=>t.id!==e))}function nh(){let e=new Date().toISOString().slice(0,7),t=Qm().filter(t=>t.date.startsWith(e)),n=t.reduce((e,t)=>e+t.amount,0),r={};for(let e of t)r[e.category]=(r[e.category]||0)+e.amount;return{monthTotal:n,byCategory:Object.entries(r).map(([e,t])=>({category:e,total:t})).sort((e,t)=>t.total-e.total)}}var rh=`alpha_pomodoro_v1`;function ih(){try{return JSON.parse(localStorage.getItem(rh)||`[]`)}catch{return[]}}function ah(){let e=new Date().toISOString().slice(0,10),t=ih(),n=t.find(t=>t.date===e);n?(n.completed++,n.focus+=25):t.push({date:e,focus:25,completed:1}),localStorage.setItem(rh,JSON.stringify(t))}function oh(){let e=new Date().toISOString().slice(0,10),t=ih().find(t=>t.date===e);return{completed:t?.completed||0,focusMin:t?.focus||0}}function sh(){let e=ih(),t=new Date(new Date().getTime()-7*864e5).toISOString().slice(0,10),n=e.filter(e=>e.date>=t),r=n.reduce((e,t)=>e+t.completed,0),i=n.reduce((e,t)=>e+t.focus,0),a=0,o=new Date,s=new Set(e.map(e=>e.date));for(;s.has(o.toISOString().slice(0,10));)a++,o.setDate(o.getDate()-1);return{totalSessions:r,totalFocus:i,streak:a}}var ch=`alpha_mood_v1`,lh=`alpha_water_v1`,uh=`alpha_sleep_v1`,dh={great:`🤩`,good:`😊`,okay:`😐`,low:`😔`,bad:`😞`},fh=[`great`,`good`,`okay`,`low`,`bad`];function ph(){try{return JSON.parse(localStorage.getItem(ch)||`[]`)}catch{return[]}}function mh(e,t=``,n=3){let r=ph(),i=new Date().toISOString().slice(0,10),a=r.findIndex(e=>e.date===i);a>=0?r[a]={date:i,mood:e,note:t,energy:n}:r.unshift({date:i,mood:e,note:t,energy:n}),localStorage.setItem(ch,JSON.stringify(r))}function hh(){let e=new Date().toISOString().slice(0,10);return ph().find(t=>t.date===e)||null}function gh(){let e=ph(),t={great:5,good:4,okay:3,low:2,bad:1},n=e.slice(0,7),r=n.length?n.reduce((e,n)=>e+t[n.mood],0)/n.length:0;return{days:e.length,avg:Math.round(r*10)/10}}function _h(){let e=new Date().toISOString().slice(0,10);try{return JSON.parse(localStorage.getItem(lh)||`{}`)[e]||0}catch{return 0}}function vh(e=1){let t=new Date().toISOString().slice(0,10),n={};try{n=JSON.parse(localStorage.getItem(lh)||`{}`)}catch{}return n[t]=(n[t]||0)+e,localStorage.setItem(lh,JSON.stringify(n)),n[t]}function yh(){try{return JSON.parse(localStorage.getItem(uh)||`[]`)}catch{return[]}}function bh(e,t){let n=yh(),r=new Date().toISOString().slice(0,10),i=n.findIndex(e=>e.date===r);i>=0?n[i]={date:r,hours:e,quality:t}:n.unshift({date:r,hours:e,quality:t}),localStorage.setItem(uh,JSON.stringify(n))}function xh(){let e=yh().slice(0,7);return e.length?{hours:Math.round(e.reduce((e,t)=>e+t.hours,0)/e.length*10)/10,quality:Math.round(e.reduce((e,t)=>e+t.quality,0)/e.length*10)/10}:{hours:0,quality:0}}var Sh=`alpha_goals_v1`;function Ch(){try{return JSON.parse(localStorage.getItem(Sh)||`[]`)}catch{return[]}}function wh(e){localStorage.setItem(Sh,JSON.stringify(e))}function Th(e,t,n,r=[],i=``){let a={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),title:e,timeframe:t,category:n,milestones:r.map(e=>({text:e,done:!1})),created:new Date().toISOString().slice(0,10),deadline:i||``,notes:``},o=Ch();return o.unshift(a),wh(o),a}function Eh(e){wh(Ch().filter(t=>t.id!==e))}function Dh(e,t){let n=Ch(),r=n.find(t=>t.id===e);r&&r.milestones[t]&&(r.milestones[t].done=!r.milestones[t].done,wh(n))}function Oh(e,t){let n=Ch(),r=n.find(t=>t.id===e);r&&(r.milestones.push({text:t,done:!1}),wh(n))}function kh(e){return e.milestones.length?e.milestones.filter(e=>e.done).length/e.milestones.length:0}function Ah(){let e=Ch(),t=e.length;if(!t)return{total:0,completed:0,avgProgress:0};let n=e.filter(e=>kh(e)===1).length,r=e.reduce((e,t)=>e+kh(t),0)/t;return{total:t,completed:n,avgProgress:Math.round(r*100)}}var jh=`alpha_invoices_v1`,Mh=0;function Nh(){try{return JSON.parse(localStorage.getItem(jh)||`[]`)}catch{return[]}}function Ph(e){localStorage.setItem(jh,JSON.stringify(e))}function Fh(){return Mh||=Nh().reduce((e,t)=>{let n=parseInt(t.number.replace(/\D/g,``));return n>e?n:e},0),Mh++,`INV-${String(Mh).padStart(4,`0`)}`}function Ih(e,t,n={}){let r=t.reduce((e,t)=>e+t.price*t.qty,0),i=n.taxRate??.17,a=Math.round(r*i),o={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),number:Fh(),customer:e,phone:n.phone||``,email:n.email||``,address:n.address||``,items:t,subtotal:r,tax:a,total:r+a,date:new Date().toISOString().slice(0,10),dueDate:n.dueDate||``,status:`draft`,notes:n.notes||``,created:Date.now()},s=Nh();return s.unshift(o),Ph(s),o}function Lh(e,t){let n=Nh(),r=n.find(t=>t.id===e);r&&(r.status=t,Ph(n))}function Rh(e){Ph(Nh().filter(t=>t.id!==e))}function zh(e,t=`HeavyGuard`){let n=e.items.map(e=>`<tr><td style="padding:8px;border-bottom:1px solid #eee">${e.description}</td>
     <td style="padding:8px;text-align:center;border-bottom:1px solid #eee">${e.qty}</td>
     <td style="padding:8px;text-align:right;border-bottom:1px solid #eee">₪${e.price.toLocaleString()}</td>
     <td style="padding:8px;text-align:right;border-bottom:1px solid #eee">₪${(e.price*e.qty).toLocaleString()}</td></tr>`).join(``);return`<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
body{font-family:system-ui,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#333}
h1{color:#daa520;font-size:28px;margin-bottom:4px}
.inv-header{display:flex;justify-content:space-between;margin-bottom:30px}
.inv-num{font-size:14px;color:#666}
.inv-meta{text-align:right}
table{width:100%;border-collapse:collapse;margin:20px 0}
th{background:#f8f6f0;padding:10px 8px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#666;border-bottom:2px solid #daa520}
.totals{text-align:right;margin-top:20px}
.totals .total{font-size:24px;color:#daa520;font-weight:bold}
.footer{margin-top:40px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#999}
@media print{body{padding:20px}}
</style></head><body>
<div class="inv-header">
  <div><h1>${t}</h1><div class="inv-num">${e.number}</div></div>
  <div class="inv-meta"><div><strong>Date:</strong> ${e.date}</div>
    ${e.dueDate?`<div><strong>Due:</strong> ${e.dueDate}</div>`:``}
    <div style="margin-top:8px;padding:4px 12px;background:${e.status===`paid`?`#e8f5e9`:`#fff8e1`};border-radius:4px;display:inline-block;font-weight:600">${e.status.toUpperCase()}</div>
  </div>
</div>
<div><strong>Bill to:</strong> ${e.customer}${e.phone?` · ${e.phone}`:``}${e.email?` · ${e.email}`:``}</div>
${e.address?`<div>${e.address}</div>`:``}
<table><thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead><tbody>${n}</tbody></table>
<div class="totals">
  <div>Subtotal: ₪${e.subtotal.toLocaleString()}</div>
  <div>VAT (17%): ₪${e.tax.toLocaleString()}</div>
  <div class="total">Total: ₪${e.total.toLocaleString()}</div>
</div>
${e.notes?`<div style="margin-top:20px;padding:12px;background:#f8f6f0;border-radius:8px"><strong>Notes:</strong> ${e.notes}</div>`:``}
<div class="footer">Generated by Alpha Assistant · ${t}</div>
</body></html>`}function Bh(e,t=`HeavyGuard`){let n=zh(e,t),r=window.open(``,`_blank`);r&&(r.document.write(n),r.document.close(),setTimeout(()=>r.print(),500))}function Vh(e,t=`HeavyGuard`){return new Promise(n=>{let r=`#DAA520`,i=`#333333`,a=`#888888`,o=`#EEEEEE`,s=200+e.items.length*32+160+(e.notes?60:0),c=Math.max(500,s),l=document.createElement(`canvas`);l.width=800*2,l.height=c*2;let u=l.getContext(`2d`);u.scale(2,2),u.fillStyle=`#FFFFFF`,u.fillRect(0,0,800,c),u.fillStyle=r,u.fillRect(0,0,800,6),u.fillStyle=r,u.font=`bold 28px system-ui, sans-serif`,u.fillText(t,40,70),u.fillStyle=a,u.font=`13px system-ui, sans-serif`,u.fillText(e.number,40,90),u.textAlign=`right`,u.fillStyle=i,u.font=`13px system-ui, sans-serif`,u.fillText(`תאריך: ${e.date}`,760,70),e.dueDate&&u.fillText(`לתשלום: ${e.dueDate}`,760,88);let d=e.status===`paid`?`#4CAF50`:e.status===`overdue`?`#F44336`:`#FFC107`;u.fillStyle=d+`22`,u.beginPath(),u.roundRect(680,95,80,22,4),u.fill(),u.fillStyle=d,u.font=`bold 11px system-ui, sans-serif`,u.fillText(e.status.toUpperCase(),720,110),u.textAlign=`left`;let f=130;u.strokeStyle=o,u.lineWidth=1,u.beginPath(),u.moveTo(40,f),u.lineTo(760,f),u.stroke(),f+=16,u.fillStyle=a,u.font=`12px system-ui, sans-serif`,u.fillText(`לקוח`,40,f),f+=18,u.fillStyle=i,u.font=`bold 15px system-ui, sans-serif`,u.fillText(e.customer,40,f),e.phone&&(u.fillStyle=a,u.font=`13px system-ui, sans-serif`,u.fillText(e.phone,40+u.measureText(e.customer).width+12,f)),f+=24,u.fillStyle=`#F8F6F0`,u.fillRect(40,f,720,30),u.fillStyle=a,u.font=`bold 11px system-ui, sans-serif`,u.fillText(`תיאור`,48,f+20),u.textAlign=`center`,u.fillText(`כמות`,460,f+20),u.textAlign=`right`,u.fillText(`מחיר`,640,f+20),u.fillText(`סה"כ`,752,f+20),u.textAlign=`left`,u.strokeStyle=r,u.lineWidth=1.5,u.beginPath(),u.moveTo(40,f+30),u.lineTo(760,f+30),u.stroke(),f+=30,u.font=`13px system-ui, sans-serif`;for(let t of e.items)f+=32,u.fillStyle=i,u.fillText(t.description.slice(0,40),48,f),u.textAlign=`center`,u.fillText(String(t.qty),460,f),u.textAlign=`right`,u.fillText(`₪${t.price.toLocaleString()}`,640,f),u.fillText(`₪${(t.price*t.qty).toLocaleString()}`,752,f),u.textAlign=`left`,u.strokeStyle=o,u.lineWidth=.5,u.beginPath(),u.moveTo(40,f+8),u.lineTo(760,f+8),u.stroke();f+=24,u.textAlign=`right`,u.fillStyle=a,u.font=`13px system-ui, sans-serif`,u.fillText(`לפני מע"מ: ₪${e.subtotal.toLocaleString()}`,760,f),f+=20,u.fillText(`מע"מ (17%): ₪${e.tax.toLocaleString()}`,760,f),f+=24,u.strokeStyle=r,u.lineWidth=1,u.beginPath(),u.moveTo(560,f-4),u.lineTo(760,f-4),u.stroke(),u.fillStyle=r,u.font=`bold 20px system-ui, sans-serif`,u.fillText(`סה"כ לתשלום: ₪${e.total.toLocaleString()}`,760,f+18),u.textAlign=`left`,f+=40,e.notes&&(u.fillStyle=`#F8F6F0`,u.fillRect(40,f,720,44),u.fillStyle=i,u.font=`12px system-ui, sans-serif`,u.fillText(e.notes.slice(0,90),50,f+26),f+=52),f=c-24,u.strokeStyle=o,u.lineWidth=1,u.beginPath(),u.moveTo(40,f-8),u.lineTo(760,f-8),u.stroke(),u.fillStyle=a,u.font=`11px system-ui, sans-serif`,u.fillText(`Generated by Alpha Assistant · ${t}`,40,f),l.toBlob(e=>n(e),`image/png`)})}async function Hh(e,t=`HeavyGuard`){let n=await Vh(e,t),r=new File([n],`${e.number}.png`,{type:`image/png`}),i=e.phone.replace(/\D/g,``).replace(/^0/,`972`);if(navigator.canShare?.({files:[r]}))await navigator.share({files:[r],title:`חשבונית ${e.number}`});else{let t=URL.createObjectURL(n),r=document.createElement(`a`);r.href=t,r.download=`${e.number}.png`,r.click(),URL.revokeObjectURL(t),i.length>=10&&window.open(`https://wa.me/${i}`,`_blank`)}}function Uh(){let e=Nh(),t=e.filter(e=>e.status===`paid`),n=e.filter(e=>e.status!==`paid`&&e.status!==`draft`);return{total:e.length,paid:t.length,outstanding:n.length,revenue:t.reduce((e,t)=>e+t.total,0)}}var Wh=`alpha_contacts_v1`;function Gh(){try{return JSON.parse(localStorage.getItem(Wh)||`[]`)}catch{return[]}}function Kh(e){localStorage.setItem(Wh,JSON.stringify(e))}function qh(e){let t=Gh(),n={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),name:e.name||``,phone:e.phone||``,email:e.email||``,company:e.company||``,tags:e.tags||[],notes:e.notes||``,interactions:[],created:new Date().toISOString().slice(0,10),starred:!1};return t.unshift(n),Kh(t),n}function Jh(e){Kh(Gh().filter(t=>t.id!==e))}function Yh(e){let t=e.toLowerCase();return Gh().filter(e=>e.name.toLowerCase().includes(t)||e.phone.includes(t)||e.email.toLowerCase().includes(t)||e.company.toLowerCase().includes(t)||e.tags.some(e=>e.toLowerCase().includes(t)))}function Xh(){let e=Gh(),t=e.filter(e=>e.starred).length,n=e.filter(e=>e.interactions.length>0).length,r=new Set(e.flatMap(e=>e.tags));return{total:e.length,starred:t,withInteractions:n,tagCount:r.size}}var Zh=`alpha_timetracker_v1`,Qh=`alpha_timer_active`;function $h(){try{return JSON.parse(localStorage.getItem(Zh)||`[]`)}catch{return[]}}function eg(e){localStorage.setItem(Zh,JSON.stringify(e))}function tg(){try{let e=localStorage.getItem(Qh);return e?JSON.parse(e):null}catch{return null}}function ng(e,t=``){let n={project:e,description:t,startTime:Date.now()};return localStorage.setItem(Qh,JSON.stringify(n)),n}function rg(){let e=tg();if(!e)return null;let t=Date.now(),n=Math.round((t-e.startTime)/6e4),r={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),project:e.project,description:e.description,startTime:e.startTime,endTime:t,duration:n,date:new Date().toISOString().slice(0,10)},i=$h();return i.unshift(r),eg(i),localStorage.removeItem(Qh),r}function ig(e){eg($h().filter(t=>t.id!==e))}function ag(){let e=new Date().toISOString().slice(0,10),t=$h().filter(t=>t.date===e),n=t.reduce((e,t)=>e+t.duration,0),r=new Map;for(let e of t)r.set(e.project,(r.get(e.project)||0)+e.duration);return{total:n,byProject:Array.from(r.entries()).map(([e,t])=>({project:e,minutes:t})).sort((e,t)=>t.minutes-e.minutes)}}function og(){let e=new Date(new Date().getTime()-7*864e5).toISOString().slice(0,10),t=$h().filter(t=>t.date>=e),n=t.reduce((e,t)=>e+t.duration,0),r=new Map;for(let e of t)r.set(e.date,(r.get(e.date)||0)+e.duration);return{total:n,byDay:Array.from(r.entries()).map(([e,t])=>({date:e,minutes:t})).sort((e,t)=>e.date.localeCompare(t.date))}}function sg(e){let t=Math.floor(e/60),n=e%60;return t===0?`${n}m`:`${t}h ${n}m`}var cg=`alpha_sentiment_v1`,lg=`great.awesome.love.amazing.perfect.wonderful.excellent.happy.good.nice.fantastic.brilliant.super.thanks.beautiful.excited.glad.enjoy.best.win.won.success.מעולה.אחלה.מדהים.טוב.יופי.תודה.אהבתי.נהדר.שמח`.split(`.`),ug=`bad.terrible.hate.awful.horrible.worst.angry.upset.sad.frustrated.annoyed.disappointed.fail.failed.problem.broken.wrong.error.stuck.lost.stress.tired.sick.גרוע.נורא.עצוב.כועס.מתוסכל.בעיה.שבור.נכשל`.split(`.`);function dg(e){let t=e.toLowerCase().split(/\s+/),n=0,r=0;for(let e of t)lg.some(t=>e.includes(t))&&n++,ug.some(t=>e.includes(t))&&r++;let i=n+r;return i===0?{score:0,magnitude:0}:{score:(n-r)/i,magnitude:Math.min(i/t.length,1)}}function fg(e){let{score:t,magnitude:n}=dg(e);if(n<.05)return;let r=pg();r.push({ts:Date.now(),score:t,magnitude:n}),r.length>200&&r.splice(0,r.length-200),localStorage.setItem(cg,JSON.stringify(r))}function pg(){try{return JSON.parse(localStorage.getItem(cg)||`[]`)}catch{return[]}}function mg(e=7){let t=pg(),n=Date.now(),r=[];for(let i=e-1;i>=0;i--){let e=n-(i+1)*864e5,a=n-i*864e5,o=t.filter(t=>t.ts>=e&&t.ts<a);o.length?r.push(o.reduce((e,t)=>e+t.score,0)/o.length):r.push(0)}return r}function hg(){let e=pg();if(!e.length)return{label:`Neutral`,score:0};let t=e.slice(-20),n=t.reduce((e,t)=>e+t.score,0)/t.length;return{label:n>.3?`Positive`:n<-.3?`Negative`:`Neutral`,score:n}}function gg(e){let t=[];if(e===`business`)try{let e=Bm(),n=Vm(),r=Am().filter(e=>e.status!==`won`&&e.status!==`lost`).length,i=Uh();t.push(`BUSINESS STATE — realised ₪${e.realised.toLocaleString()}, pipeline ₪${e.pipeline.toLocaleString()}, win rate ${Math.round(e.winRate*100)}%, ${r} open leads, ${n.length} follow-up(s) due`+(n.length?` (${n.slice(0,3).map(e=>e.name||e.phone).join(`, `)})`:``)+(i.total?`, ${i.total} invoices (${i.paid} paid, ${i.outstanding} outstanding, ₪${i.revenue.toLocaleString()} collected)`:``)+`.`);let a=Xh();a.total&&t.push(`CRM: ${a.total} contacts (${a.starred} starred).`)}catch{}if(e===`personal`||e===`general`)try{let e=new Date().toISOString().slice(0,10),n=Up().filter(t=>t.date===e),r=Jp().filter(e=>!e.done),i=Um(),a=i.filter(Jm).length,o=nh(),s=oh(),c=hh(),l=_h(),u=xh(),d=Ah(),f=[];n.length&&f.push(`${n.length} event(s) today (${n.slice(0,3).map(e=>e.title).join(`, `)})`),r.length&&f.push(`${r.length} open task(s) (${r.slice(0,3).map(e=>e.text).join(`, `)})`),i.length&&f.push(`habits ${a}/${i.length} done`),o.monthTotal&&f.push(`₪${o.monthTotal.toLocaleString()} spent this month`),s.completed&&f.push(`${s.completed} focus sessions today (${s.focusMin}min)`),c&&f.push(`mood: ${dh[c.mood]} ${c.mood}`),l&&f.push(`${l} glasses of water`),u.hours&&f.push(`sleep avg: ${u.hours}h`),d.total&&f.push(`${d.total} goals (${d.avgProgress}% avg progress)`);let p=ag();p.total&&f.push(`${sg(p.total)} tracked today`);try{let e=hg();e.label!==`Neutral`&&f.push(`conversation mood: ${e.label}`)}catch{}f.length&&t.push(`PERSONAL STATE — `+f.join(`; `)+`.`)}catch{}return t.join(`
`)}var _g=``;function vg(e){let t=sm(e),n=im(t.module),r=Tm(e,t.module),i=Cm(e,t.module),a=gg(t.module);return _g=[n?n.systemFragment:``,a,i].filter(Boolean).join(`

`),{module:t.module,switched:t.switched,confidence:t.confidence,captured:r}}function yg(){return _g}function bg(e){let t=e.filter(e=>e.role===`user`).slice(-6);t.length&&Sm(t.map(e=>e.parts.map(e=>e.text).join(` `).slice(0,80)).join(` → `))}var xg=`alpha_chat_history_v1`,Sg=100;function Cg(){try{return JSON.parse(localStorage.getItem(xg)||`[]`)}catch{return[]}}function wg(e,t){let n=Cg();n.push({text:e,who:t,ts:Date.now()}),n.length>Sg&&n.splice(0,n.length-Sg),localStorage.setItem(xg,JSON.stringify(n))}function Tg(){localStorage.removeItem(xg)}var Eg=[[/\b(lead|leads|customer|client|prospect)\b/i,`Sales/Leads`],[/\b(invoice|payment|paid|billing)\b/i,`Invoicing`],[/\b(task|todo|to-do|deadline)\b/i,`Tasks`],[/\b(goal|objective|milestone|target)\b/i,`Goals`],[/\b(expense|cost|spending|budget)\b/i,`Expenses`],[/\b(event|calendar|meeting|schedule|appointment)\b/i,`Calendar`],[/\b(camera|tracker|install|vehicle|truck|scania|volvo)\b/i,`HeavyGuard`],[/\b(habit|streak|routine|daily)\b/i,`Habits`],[/\b(report|analytics|summary|brief)\b/i,`Reports`],[/\b(note|memo|remember|remind)\b/i,`Notes`],[/\b(music|lyrics|song|beat|rap)\b/i,`Creative`],[/\b(trade|crypto|bitcoin|market|stock)\b/i,`Trading`],[/\b(health|sleep|mood|water|wellness)\b/i,`Wellness`],[/\b(contact|phone|email|company)\b/i,`Contacts`],[/\b(quote|proposal|offer)\b/i,`Quotes`],[/\b(לקוח|ליד|מכירה|עסקה)\b/,`Sales/Leads`],[/\b(חשבונית|תשלום|חוב)\b/,`Invoicing`],[/\b(משימה|מטלה)\b/,`Tasks`],[/\b(מצלמה|מערכת|התקנה|משאית)\b/,`HeavyGuard`]];function Dg(e){let t=e||Cg(),n=new Map;for(let e of t)if(e.who!==`sys`){for(let[t,r]of Eg)if(t.test(e.text)){let t=n.get(r);t?(t.count++,t.lastMentioned=Math.max(t.lastMentioned,e.ts)):n.set(r,{topic:r,count:1,lastMentioned:e.ts})}}return Array.from(n.values()).sort((e,t)=>t.count-e.count)}function Og(){let e=Dg();if(!e.length)return``;let t=e.slice(0,5).map(e=>e.topic).join(`, `),n=Cg(),r=n.filter(e=>e.who===`me`).slice(-5),i=r.length?`Recent focus: ${Dg(r).slice(0,3).map(e=>e.topic).join(`, `)||`general conversation`}`:``,a=[`Session topics: ${t}`];return i&&a.push(i),a.push(`${n.length} messages in session`),a.join(`. `)+`.`}var kg=[`gemini-2.0-flash`,`gemini-1.5-flash`,`gemini-1.5-flash-8b`],Ag=0,jg=!1,Mg=[0,0,0],Ng=5e3,Pg={en:`ALWAYS reply in fluent, natural, warm English. Short, conversational sentences like a person speaking aloud.`,he:`ענה תמיד בעברית טבעית, רהוטה ונקייה — דיבור אנושי וזורם, לא מילולי ולא רובוטי. משפטים קצרים כמו בשיחה.`,ar:`أجب دائماً بالعربية الفصحى السلسة والطبيعية. جمل قصيرة وحوارية.`,ru:`Всегда отвечай на естественном, тёплом русском языке. Короткие, разговорные предложения.`,fr:`Réponds toujours en français naturel, chaleureux et fluide. Phrases courtes et conversationnelles.`,es:`Responde siempre en español natural, cálido y fluido. Frases cortas y conversacionales.`,de:`Antworte immer auf natürlichem, warmem Deutsch. Kurze, gesprächige Sätze.`};function Fg(e){let t=new Date,n=t.toISOString().slice(0,10),r=n.slice(0,7),i=t.toLocaleDateString(`en-US`,{weekday:`long`}),a=Pg[e.textLang===`auto`?e.replyLang:e.textLang]||Pg.en;return`You are ${e.name}, an elite personal AI assistant — superhuman, proactive, and deeply integrated with the user's life and business. ${a} Keep responses concise and action-oriented. No long lists or tables unless asked.
Today is ${i}, ${n}. Current month: ${r}.

CAPABILITIES — Control the app via tags at the END of your reply (never mention them in spoken text):
[[VIDEO: search terms]] · [[SEARCH: query]] · [[SPOTIFY: song or artist name]]
[[EVENT: title | YYYY-MM-DD | HH:MM]] · [[CALENDAR]]
[[TASK: task text | priority(low/med/high)]] · [[NOTE: text to save]]
[[DIARY: task title | YYYY-MM-DD]] · [[AR_CAMERA]] · [[GDOC: full URL]]
[[TIMER_START: project name]] · [[TIMER_STOP]]
[[HG_SEARCH: plate/chassis number]] · [[HG_EARNINGS: contractor | YYYY-MM]] · [[HG_QUOTE: customer | phone | item:price, item:price]]
[[HG_REPORT: idNumber | idType | contractor | date(YYYY-MM-DD) | price | vehicleType | manufacturer | installType | location | customer | phone]]

HEAVYGUARD INTEGRATION — Field installation management for vehicle security (trackers, cameras, radios for Scania/Volvo etc.). Contractors: קובי, אסי, שגיא מערכות, m.b מערכות, ס.ד מיגונים, Heavy Guard.
Use [[HG_SEARCH:]] for license lookups, [[HG_EARNINGS: | ${r}]] for income, [[HG_QUOTE:]] for quotes.
When the user reports completing an installation (e.g. "דיווחתי התקנה", "סיימנו התקנה", "הותקן"), emit [[HG_REPORT:]] with all available fields. The reportedAt timestamp is set automatically — do NOT include it in the tag.

USER'S ECOSYSTEM — You manage:
• CRM pipeline with lead tracking, follow-ups, and revenue analytics
• Contact management with tags, notes, and interaction history
• Invoice generation with VAT calculation
• Task management with priority levels
• Calendar with HeavyGuard diary sync
• Habit tracking with streak counting
• Expense tracking with categories and monthly summaries
• Pomodoro focus sessions
• Wellness (mood, water, sleep tracking)
• Goal setting with milestones
• Long-term memory that remembers facts and preferences
• Google Drive cloud backup

When briefing the user, be proactive: mention overdue follow-ups, upcoming events, pending tasks, and actionable insights. Think like a chief of staff who anticipates needs.

Calendar: ${qp()}.${Ig()}${Lg()}`}function Ig(){try{let e=Og();return e?`\nConversation context: ${e}`:``}catch{return``}}function Lg(){try{let e=yg();return e?`\n\n=== MASTER BRAIN CONTEXT ===\n${e}`:``}catch{return``}}async function Rg(e,t){let n=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${e}:generateContent`,{method:`POST`,headers:{"Content-Type":`application/json`,"x-goog-api-key":t.key},body:JSON.stringify({system_instruction:{parts:[{text:Fg(t)}]},contents:t.history.slice(-8),generationConfig:{temperature:.8,maxOutputTokens:500}})});if(!n.ok){let t=n.status,r=``,i=!1;try{let a=(await n.json())?.error?.message||``,o=a.toLowerCase();t===429||o.includes(`quota`)||o.includes(`rate`)?(i=!0,r=`${e} quota exceeded`):t===401||t===403||o.includes(`credential`)||o.includes(`not found`)||o.includes(`not supported`)?(i=!0,r=`${e} not available`):r=t===400?`Bad request — check your Gemini API key.`:a||`Error ${t}`}catch{r=`Error ${t}`}return{ok:!1,canFallback:i,msg:r}}return{ok:!0,reply:((await n.json()).candidates?.[0]?.content?.parts||[]).map(e=>e.text||``).join(``).trim()||`…`}}async function zg(e){let t=Date.now(),n=[Ag,...kg.map((e,t)=>t).filter(e=>e!==Ag)];for(let r of n){if(t<Mg[r])continue;let n=await Rg(kg[r],e);if(n.ok)return Ag=r,n.reply;if(!n.canFallback)throw Error(n.msg);Mg[r]=Date.now()+Ng}throw Error(`GEMINI_EXHAUSTED`)}async function Bg(e){if(!e.grokKey)throw Error(`PROVIDER_NO_KEY`);let t=[{role:`system`,content:Fg(e)},...e.history.slice(-8).map(e=>({role:e.role===`user`?`user`:`assistant`,content:e.parts.map(e=>e.text).join(``)}))],n=await fetch(`https://api.x.ai/v1/chat/completions`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${e.grokKey}`},body:JSON.stringify({model:`grok-3-mini`,messages:t,temperature:.8,max_tokens:500})});if(!n.ok){let e=n.status;if(e===429)throw Error(`PROVIDER_EXHAUSTED`);let t=`Grok error ${e}`;try{t=(await n.json())?.error?.message||t}catch{}throw Error(e===401||e===403?`PROVIDER_EXHAUSTED`:t)}return(await n.json()).choices?.[0]?.message?.content?.trim()||`…`}async function Vg(e){if(!e.openaiKey)throw Error(`PROVIDER_NO_KEY`);let t=[{role:`system`,content:Fg(e)},...e.history.slice(-8).map(e=>({role:e.role===`user`?`user`:`assistant`,content:e.parts.map(e=>e.text).join(``)}))],n=await fetch(`https://api.openai.com/v1/chat/completions`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${e.openaiKey}`},body:JSON.stringify({model:`gpt-4o-mini`,messages:t,temperature:.8,max_tokens:500})});if(!n.ok){let e=n.status;if(e===429)throw Error(`PROVIDER_EXHAUSTED`);let t=`OpenAI error ${e}`;try{t=(await n.json())?.error?.message||t}catch{}throw Error(e===401||e===403?`PROVIDER_EXHAUSTED`:t)}return(await n.json()).choices?.[0]?.message?.content?.trim()||`…`}function Hg(e){if(!e)return``;if(typeof e==`string`)return e.trim();let t=e.message?.content??e.content??e.text;if(typeof t==`string`)return t.trim();if(Array.isArray(t))return t.map(e=>typeof e==`string`?e:e?.text||``).join(``).trim();if(typeof e.toString==`function`){let t=e.toString();if(t&&t!==`[object Object]`)return t.trim()}return``}async function Ug(e){let t=window.puter;if(!t?.ai?.chat)throw Error(`PROVIDER_EXHAUSTED`);let n=[{role:`system`,content:Fg(e)},...e.history.slice(-8).map(e=>({role:e.role===`user`?`user`:`assistant`,content:e.parts.map(e=>e.text).join(``)}))];try{let r=Hg(await t.ai.chat(n,{model:e.puterModel||`gpt-4o-mini`}));if(!r)throw Error(`PROVIDER_EXHAUSTED`);return r}catch(e){throw e?.message===`PROVIDER_EXHAUSTED`?e:Error(`PROVIDER_EXHAUSTED`)}}var Wg=[`puter`,`gemini`,`grok`,`openai`];async function Gg(e,t){return e===`puter`?Ug(t):e===`gemini`?zg(t):e===`grok`?Bg(t):Vg(t)}function Kg(e,t){return e===`puter`?window.puter!==void 0:e===`gemini`?!!t.key:e===`grok`?!!t.grokKey:!!t.openaiKey}async function qg(e,t){if(jg)throw Error(`Please wait for the current request to finish.`);jg=!0,e.history.push({role:`user`,parts:[{text:t}]});try{let t=e.provider,n=[t,...Wg.filter(n=>n!==t&&Kg(n,e))];for(let t of n)if(Kg(t,e))try{let n=await Gg(t,e);return e.history.push({role:`model`,parts:[{text:n}]}),n}catch(t){if(t.message===`GEMINI_EXHAUSTED`||t.message===`PROVIDER_EXHAUSTED`||t.message===`PROVIDER_NO_KEY`)continue;throw e.history.pop(),t}throw e.history.pop(),Error(`All providers exhausted. Try again later or add more API keys in settings.`)}finally{jg=!1}}function Jg(e,t){let n=/\[\[(VIDEO|SEARCH|EVENT|CALENDAR|SPOTIFY|DIARY|HG_SEARCH|HG_EARNINGS|HG_QUOTE|HG_REPORT|AR_CAMERA|GDOC|TASK|NOTE|TIMER_START|TIMER_STOP)\s*:?\s*([^\]]*)\]\]/g,r;for(;r=n.exec(e);){let e=r[1],n=r[2].trim();if(e===`VIDEO`)t.onVideo(n);else if(e===`SEARCH`)t.onSearch(n);else if(e===`CALENDAR`)t.onCalendar();else if(e===`SPOTIFY`)t.onSpotify(n);else if(e===`DIARY`&&t.onDiary){let e=n.split(`|`).map(e=>e.trim());e[0]&&t.onDiary(e[0],e[1]||new Date().toISOString().slice(0,10))}else if(e===`EVENT`){let e=n.split(`|`).map(e=>e.trim());e[0]&&e[1]&&t.onEvent(e[0],e[1],e[2]||``)}else if(e===`HG_SEARCH`&&t.onHgSearch)t.onHgSearch(n);else if(e===`HG_EARNINGS`&&t.onHgEarnings){let e=n.split(`|`).map(e=>e.trim());t.onHgEarnings(e[0]||``,e[1]||``)}else if(e===`HG_QUOTE`&&t.onHgQuote){let e=n.split(`|`).map(e=>e.trim());t.onHgQuote(e[0]||``,e[1]||``,e[2]||``)}else if(e===`HG_REPORT`&&t.onHgReport)t.onHgReport(n.split(`|`).map(e=>e.trim()));else if(e===`AR_CAMERA`&&t.onArCamera)t.onArCamera();else if(e===`GDOC`&&t.onGDoc)t.onGDoc(n);else if(e===`TASK`&&t.onTask){let e=n.split(`|`).map(e=>e.trim());t.onTask(e[0]||``,e[1]||`med`)}else e===`NOTE`&&t.onNote?t.onNote(n):e===`TIMER_START`&&t.onTimerStart?t.onTimerStart(n||`General`):e===`TIMER_STOP`&&t.onTimerStop&&t.onTimerStop()}return e.replace(n,``).trim()}function Yg(e=6){let t=Am(),n=new Date,r=[];for(let i=e-1;i>=0;i--){let e=new Date(n.getFullYear(),n.getMonth()-i,1),a=e.toISOString().slice(0,7),o=e.toLocaleDateString(`en`,{month:`short`}),s=t.filter(e=>e.status===`won`&&new Date(e.created).toISOString().slice(0,7)===a).reduce((e,t)=>e+(t.value||0),0);r.push({label:o,value:s})}return r}function Xg(e=6){let t=Qm(),n=new Date,r=[];for(let i=e-1;i>=0;i--){let e=new Date(n.getFullYear(),n.getMonth()-i,1),a=e.toISOString().slice(0,7),o=e.toLocaleDateString(`en`,{month:`short`}),s=t.filter(e=>e.date?.startsWith(a)).reduce((e,t)=>e+(t.amount||0),0);r.push({label:o,value:s})}return r}function Zg(){let e=Jp(),t=e.filter(e=>e.done).length;return{total:e.length,done:t,rate:e.length?Math.round(t/e.length*100):0}}function Qg(){let e=Qm(),t=new Map;for(let n of e){let e=n.category||`Other`;t.set(e,(t.get(e)||0)+(n.amount||0))}return Array.from(t.entries()).map(([e,t])=>({category:e,total:t})).sort((e,t)=>t.total-e.total)}function $g(){let e=Am(),t=new Map;for(let n of e){let e=n.status||`new`;t.set(e,(t.get(e)||0)+1)}return Array.from(t.entries()).map(([e,t])=>({status:e,count:t})).sort((e,t)=>t.count-e.count)}function e_(){let e=new Date().toISOString().slice(0,10),t=new Date,n=[`${t.getHours()<12?`Good morning`:t.getHours()<17?`Good afternoon`:`Good evening`}! Here's your daily briefing for ${e}:`],r=Up().filter(t=>t.date===e);r.length?n.push(`📅 ${r.length} event(s) today: ${r.map(e=>`${e.time||``} ${e.title}`.trim()).join(`, `)}`):n.push(`📅 No events scheduled for today`);let i=Jp().filter(e=>!e.done),a=i.filter(e=>e.priority===`high`);i.length&&n.push(`✓ ${i.length} open task(s)${a.length?` (${a.length} high priority)`:``}`);try{let e=Bm();e.pipeline>0&&n.push(`💰 Pipeline: ₪${e.pipeline.toLocaleString()}, Realised: ₪${e.realised.toLocaleString()}`)}catch{}try{let e=Uh();e.outstanding>0&&n.push(`📄 ${e.outstanding} unpaid invoice(s)`)}catch{}let o=Am().filter(t=>t.followUp&&t.followUp<=e&&t.status!==`won`&&t.status!==`lost`);o.length&&n.push(`📋 ${o.length} follow-up(s) due: ${o.slice(0,3).map(e=>e.name||e.phone).join(`, `)}`);try{let e=Gh();e.length&&n.push(`👥 ${e.length} contacts in CRM`)}catch{}let s=Qm().filter(t=>t.date?.startsWith(e.slice(0,7)));if(s.length){let e=s.reduce((e,t)=>e+(t.amount||0),0);n.push(`💸 ₪${e.toLocaleString()} spent this month (${s.length} transactions)`)}return n.join(`
`)}function t_(){let e=new Date(new Date().getTime()-7*864e5).toISOString().slice(0,10),t=[`📊 WEEKLY REPORT`],n=Jp(),r=n.filter(e=>e.done).length;t.push(`Tasks: ${r} completed, ${n.length-r} remaining`);let i=Am(),a=new Date(e).getTime(),o=i.filter(e=>e.created>=a).length,s=i.filter(e=>e.status===`won`&&e.created>=a),c=s.reduce((e,t)=>e+(t.value||0),0);t.push(`Leads: ${o} new, ${s.length} won (₪${c.toLocaleString()})`);let l=Nh().filter(t=>t.date&&t.date>=e);if(l.length){let e=l.reduce((e,t)=>e+(t.total||0),0);t.push(`Invoices: ${l.length} created (₪${e.toLocaleString()})`)}return t.join(`
`)}var n_=`alpha_score_streak`;function r_(){try{return JSON.parse(localStorage.getItem(n_)||`{"days":0,"lastDate":""}`)}catch{return{days:0,lastDate:``}}}function i_(e){let t=new Date().toISOString().slice(0,10),n=r_();if(n.lastDate===t)return n.days;if(e>=40){let e=new Date(Date.now()-864e5).toISOString().slice(0,10),r=n.lastDate===e?n.days+1:1;return localStorage.setItem(n_,JSON.stringify({days:r,lastDate:t})),r}return n.days}function a_(){let e=0,t=0,n=0,r=0,i=0,a=0;try{let t=Jp(),n=t.filter(e=>e.done).length,r=t.length||1;e=Math.min(Math.round(n/r*20),20)}catch{}try{let e=Um();if(e.length){let n=e.filter(Jm).length;t=Math.min(Math.round(n/e.length*15),15)}}catch{}try{let e=oh();n=Math.min(e.completed*5,15),ag().total>=60&&(n=Math.min(n+5,15))}catch{}try{let e=Bm(),t=Am();e.realised>0&&(r+=5),e.pipeline>0&&(r+=3),t.some(e=>e.status!==`won`&&e.status!==`lost`)&&(r+=2),t.filter(e=>e.followUp&&e.followUp>new Date().toISOString().slice(0,10)).length&&(r+=5),r=Math.min(r,20)}catch{}try{let e=Ah();i=Math.min(Math.round(e.avgProgress/100*15),15)}catch{}try{let e=_h();e>=6?a+=5:e>=3&&(a+=3),a=Math.min(a,15)}catch{}let o=e+t+n+r+i+a,s=i_(o);return{total:Math.min(o+s,100),tasks:e,habits:t,focus:n,business:r,goals:i,wellness:a,streak:s}}function o_(e){return e>=90?`Legendary`:e>=75?`Elite`:e>=60?`Strong`:e>=40?`Growing`:e>=20?`Starting`:`Warming up`}function s_(e){return e>=75?`#4dff91`:e>=50?`#daa520`:e>=25?`#f0d090`:`#ff5d73`}var c_=[`Hey! How can I help?`,`Hello! What can I do for you?`,`Hi there! Ready to help.`],l_=[`היי! איך אפשר לעזור?`,`שלום! מה אפשר לעשות בשבילך?`,`אהלן! מוכן לעזור.`];function u_(e){return e[Math.floor(Math.random()*e.length)]}function d_(e){return/[֐-׿]/.test(e)}function f_(e,t){let n=e.filter(e=>!e.done),r=e.filter(e=>e.done);if(!e.length)return t?`אין משימות. אמור "הוסף משימה" כדי להוסיף.`:`No tasks yet. Say "add task" to create one.`;let i=t?`📋 משימות (${n.length} פתוחות):\n`:`📋 Tasks (${n.length} open):\n`;for(let e of n){let t=e.priority===`high`?`🔴`:e.priority===`med`?`🟡`:`🟢`;i+=`${t} ${e.text}\n`}return r.length&&(i+=t?`\n✅ הושלמו: ${r.length}`:`\n✅ Completed: ${r.length}`),i}function p_(e,t){let n=t?[`ראשון`,`שני`,`שלישי`,`רביעי`,`חמישי`,`שישי`,`שבת`]:[`Sunday`,`Monday`,`Tuesday`,`Wednesday`,`Thursday`,`Friday`,`Saturday`],r=t?[`ינואר`,`פברואר`,`מרץ`,`אפריל`,`מאי`,`יוני`,`יולי`,`אוגוסט`,`ספטמבר`,`אוקטובר`,`נובמבר`,`דצמבר`]:[`January`,`February`,`March`,`April`,`May`,`June`,`July`,`August`,`September`,`October`,`November`,`December`];return t?`יום ${n[e.getDay()]}, ${e.getDate()} ${r[e.getMonth()]} ${e.getFullYear()}`:`${n[e.getDay()]}, ${r[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`}function m_(e){let t=e.replace(/[^0-9+\-*/().%^ ]/g,``).trim();if(!t||t.length<2)return null;try{let e=t.replace(/\^/g,`**`),n=Function(`"use strict"; return (${e})`)();if(typeof n==`number`&&isFinite(n))return String(Math.round(n*1e10)/1e10)}catch{}return null}function h_(e){return Math.random()>.5?e?`עץ! 🪙`:`Heads! 🪙`:e?`פלי! 🪙`:`Tails! 🪙`}function g_(e){let t=Math.floor(Math.random()*6)+1,n=[`⚀`,`⚁`,`⚂`,`⚃`,`⚄`,`⚅`];return e?`${n[t-1]} יצא ${t}`:`${n[t-1]} Rolled ${t}`}function __(e,t){return String(Math.floor(Math.random()*(t-e+1))+e)}var v_=[`Why do programmers prefer dark mode? Because light attracts bugs.`,`I told my computer I needed a break... now it won't stop sending me vacation ads.`,`Why was the JavaScript developer sad? Because he didn't Node how to Express himself.`,`What do you call 8 hobbits? A hobbyte.`,`Why do Java developers wear glasses? Because they can't C#.`],y_=[`למה המתכנת לא יוצא מהבית? כי הוא לא רוצה לעשות push.`,`מה ההבדל בין HTML למנהל? HTML יודע לסגור תגיות.`,`למה מתכנתים מעדיפים חושך? כי אור מושך באגים.`,`מה עושה מתכנת שלא יודע לשחות? הוא מחפש pool.`],b_=[`Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible.`,`Octopuses have three hearts and blue blood.`,`A day on Venus is longer than a year on Venus.`,`Bananas are berries, but strawberries aren't.`,`The shortest war in history lasted 38 minutes (Britain vs Zanzibar, 1896).`,`A group of flamingos is called a "flamboyance."`,`The inventor of the Pringles can is buried in one.`],x_=[`דבש לא מתקלקל לעולם. נמצא דבש בן 3000 שנה בקברים במצרים.`,`לתמנון יש שלושה לבבות ודם כחול.`,`יום על נוגה ארוך יותר משנה על נוגה.`,`בננות הן פירות יער, אבל תותים לא.`,`המלחמה הקצרה בהיסטוריה נמשכה 38 דקות.`];function S_(e){let t=e.trim(),n=t.toLowerCase(),r=d_(t);if(/^(hi|hello|hey|שלום|היי|אהלן|בוקר טוב|ערב טוב|מה קורה|מה נשמע)/i.test(t))return u_(r?l_:c_);if(/\b(what time|the time|מה השעה|כמה שעה|time now)\b/i.test(n)){let e=new Date,t=`${String(e.getHours()).padStart(2,`0`)}:${String(e.getMinutes()).padStart(2,`0`)}`;return r?`השעה עכשיו ${t}`:`It's currently ${t}`}if(/\b(what date|today'?s? date|what day|מה התאריך|איזה יום|תאריך)\b/i.test(n))return p_(new Date,r);if(/^[\d(].*[+\-*/^%]/.test(t.replace(/\s/g,``))||/\b(calculate|calc|חשב|תחשב)\b/i.test(n)){let e=m_(t.replace(/^(calculate|calc|חשב|תחשב)\s*/i,``));if(e)return r?`התוצאה: ${e}`:`Result: ${e}`}if(/^(add task|new task|הוסף משימה|משימה חדשה)\s*[:\-]?\s*/i.test(t)){let e=t.replace(/^(add task|new task|הוסף משימה|משימה חדשה)\s*[:\-]?\s*/i,``).trim();if(!e)return r?`מה המשימה? לדוגמה: "הוסף משימה לקנות חלב"`:`What's the task? Example: "add task buy groceries"`;let n=/\b(urgent|important|דחוף|חשוב|high)\b/i.test(e)?`high`:`med`;return Xp(e.replace(/\b(urgent|important|דחוף|חשוב)\b/i,``).trim(),n),r?`✅ המשימה נוספה: "${e}"`:`✅ Task added: "${e}"`}if(/\b(my tasks|show tasks|list tasks|המשימות שלי|הצג משימות|רשימת משימות|tasks)\b/i.test(n))return f_(Jp(),r);if(/^(done|complete|finish|סיימתי|הושלם|בוצע)\s+/i.test(t)){let e=t.replace(/^(done|complete|finish|סיימתי|הושלם|בוצע)\s+/i,``).trim().toLowerCase(),n=Jp().find(t=>!t.done&&t.text.toLowerCase().includes(e));return n?(Zp(n.id),r?`✅ "${n.text}" סומנה כהושלמה!`:`✅ "${n.text}" marked as done!`):r?`לא מצאתי משימה כזו.`:`Couldn't find that task.`}if(/^(delete task|remove task|מחק משימה|הסר משימה)\s+/i.test(t)){let e=t.replace(/^(delete task|remove task|מחק משימה|הסר משימה)\s+/i,``).trim().toLowerCase(),n=Jp().find(t=>t.text.toLowerCase().includes(e));return n?(Qp(n.id),r?`🗑️ המשימה "${n.text}" נמחקה.`:`🗑️ Task "${n.text}" removed.`):r?`לא מצאתי משימה כזו.`:`Couldn't find that task.`}if(/^(note|remember|save note|שמור|תזכור|הערה)\s*[:\-]?\s+/i.test(t)){let e=t.replace(/^(note|remember|save note|שמור|תזכור|הערה)\s*[:\-]?\s*/i,``).trim();return e?(em(e),r?`📝 נשמר: "${e}"`:`📝 Noted: "${e}"`):r?`מה לשמור?`:`What should I note?`}if(/\b(my notes|show notes|list notes|ההערות שלי|הצג הערות)\b/i.test(n)){let e=$p();return e.length?(r?`📝 הערות:
`:`📝 Notes:
`)+e.slice(0,10).map((e,t)=>`${t+1}. ${e}`).join(`
`):r?`אין הערות שמורות.`:`No saved notes.`}if(/\b(clear notes|delete notes|מחק הערות|נקה הערות)\b/i.test(n))return tm(),r?`🗑️ כל ההערות נמחקו.`:`🗑️ All notes cleared.`;if(/^(today|what's today|היום|מה יש היום|מה קורה היום)\b/i.test(n)){let e=new Date().toISOString().slice(0,10),t=Up().filter(t=>t.date===e),n=Jp().filter(e=>!e.done),i=`📅 ${p_(new Date,r)}\n\n`;return t.length&&(i+=r?`🗓️ אירועים היום:
`:`🗓️ Today's events:
`,t.forEach(e=>{i+=`• ${e.time?e.time+` — `:``}${e.title}\n`}),i+=`
`),n.length&&(i+=r?`📋 משימות פתוחות: ${n.length}\n`:`📋 Open tasks: ${n.length}\n`,n.slice(0,4).forEach(e=>{i+=`• ${e.text}\n`}),n.length>4&&(i+=(r?`  ועוד ${n.length-4}...`:`  and ${n.length-4} more...`)+`
`)),!t.length&&!n.length&&(i+=r?`אין אירועים או משימות פתוחות היום 🌟`:`No events or open tasks today 🌟`),i.trim()}if(/\b(my calendar|my schedule|my events|לוח שנה|היומן שלי|אירועים)\b/i.test(n)){let e=new Date().toISOString().slice(0,10),t=Up().filter(t=>t.date>=e);if(!t.length)return r?`📅 היומן ריק.`:`📅 Calendar is empty.`;let n=r?`📅 אירועים קרובים:
`:`📅 Upcoming events:
`;for(let e of t.slice(0,8))n+=`• ${e.date}${e.time?` `+e.time:``} — ${e.title}\n`;return n.trim()}if(/^(add event|new event|הוסף אירוע|אירוע חדש)\s/i.test(t)){let e=t.replace(/^(add event|new event|הוסף אירוע|אירוע חדש)\s*/i,``).trim(),n=e.match(/(\d{4}-\d{2}-\d{2})/),i=e.match(/(\d{1,2}:\d{2})/),a=e.replace(/\d{4}-\d{2}-\d{2}/,``).replace(/\d{1,2}:\d{2}/,``).replace(/[,|]/g,``).trim();return!a||!n?r?`ציין כותרת ותאריך (YYYY-MM-DD). לדוגמה: "הוסף אירוע פגישה 2026-06-25 14:00"`:`Please include a title and date (YYYY-MM-DD). Example: "add event meeting 2026-06-25 14:00"`:(Kp(a,n[1],i?.[1]||``),r?`📅 האירוע נוסף: "${a}" ב-${n[1]}${i?` `+i[1]:``}`:`📅 Event added: "${a}" on ${n[1]}${i?` at `+i[1]:``}`)}if(/\b(flip|coin|heads|tails|הטל מטבע|מטבע|עץ או פלי)\b/i.test(n))return h_(r);if(/\b(roll|dice|die|הטל קובייה|קובייה)\b/i.test(n))return g_(r);if(/\b(random number|random between|מספר אקראי)\b/i.test(n)){let e=t.match(/\d+/g),n=__(e?.[0]?parseInt(e[0]):1,e?.[1]?parseInt(e[1]):100);return r?`🎲 מספר אקראי: ${n}`:`🎲 Random number: ${n}`}if(/\b(joke|tell me a joke|בדיחה|תספר בדיחה|ספר בדיחה)\b/i.test(n))return u_(r?y_:v_);if(/\b(fun fact|fact|עובדה|עובדה מעניינת)\b/i.test(n))return u_(r?x_:b_);if(/^(timer|set timer|טיימר|הגדר טיימר)\s+(\d+)\s*(min|minutes|דקות|sec|seconds|שניות)?/i.test(t)){let e=t.match(/(\d+)\s*(min|minutes|דקות|sec|seconds|שניות)?/i);if(e){let t=parseInt(e[1]),n=/sec|seconds|שניות/i.test(e[2]||``),i=n?t*1e3:t*6e4;return setTimeout(()=>{try{new Notification(r?`⏰ הטיימר נגמר!`:`⏰ Timer done!`,{body:`${t} ${n?r?`שניות`:`seconds`:r?`דקות`:`minutes`}`})}catch{}},i),Notification.permission==="default"&&Notification.requestPermission(),r?`⏱️ טיימר הוגדר ל-${t} ${n?`שניות`:`דקות`}. תקבל התראה.`:`⏱️ Timer set for ${t} ${n?`seconds`:`minutes`}. You'll be notified.`}}if(/\b(briefing|brief me|daily brief|תדריך|סיכום יומי|morning brief)\b/i.test(n))return e_();if(/\b(weekly report|week report|דוח שבועי|סיכום שבועי)\b/i.test(n))return t_();if(/^(start timer|track time|start tracking|התחל מעקב|התחל טיימר)\s*/i.test(t)){let e=t.replace(/^(start timer|track time|start tracking|התחל מעקב|התחל טיימר)\s*/i,``).trim()||`General`;return tg()?r?`⏱️ כבר יש טיימר פעיל. עצור אותו קודם.`:`⏱️ A timer is already running. Stop it first.`:(ng(e),r?`⏱️ מעקב זמן התחיל: ${e}`:`⏱️ Time tracking started: ${e}`)}if(/\b(stop timer|stop tracking|עצור טיימר|עצור מעקב)\b/i.test(n)){let e=rg();return e?r?`⏱️ נעצר! ${e.project} — ${sg(e.duration)}`:`⏱️ Stopped! ${e.project} — ${sg(e.duration)}`:r?`אין טיימר פעיל.`:`No active timer.`}if(/\b(time today|tracked time|זמן היום|מעקב זמן)\b/i.test(n)){let e=ag();if(!e.total)return r?`⏱️ לא נרשם זמן היום.`:`⏱️ No time tracked today.`;let t=e.byProject.map(e=>`• ${e.project}: ${sg(e.minutes)}`).join(`
`);return r?`⏱️ סה"כ היום: ${sg(e.total)}\n${t}`:`⏱️ Today total: ${sg(e.total)}\n${t}`}if(/\b(my score|alpha score|הציון שלי|ביצועים|score)\b/i.test(n)){let e=a_(),t=o_(e.total);return r?`⚡ ציון אלפא: ${e.total}/100 (${t})\nמשימות: ${e.tasks}/20 | הרגלים: ${e.habits}/15 | מיקוד: ${e.focus}/15\nעסקי: ${e.business}/20 | יעדים: ${e.goals}/15 | בריאות: ${e.wellness}/15${e.streak?`\n🔥 רצף: ${e.streak} ימים`:``}`:`⚡ Alpha Score: ${e.total}/100 (${t})\nTasks: ${e.tasks}/20 | Habits: ${e.habits}/15 | Focus: ${e.focus}/15\nBusiness: ${e.business}/20 | Goals: ${e.goals}/15 | Wellness: ${e.wellness}/15${e.streak?`\n🔥 Streak: ${e.streak} days`:``}`}if(/\b(revenue|sales|income|הכנסות|מכירות|pipeline|פייפליין)\b/i.test(n))try{let e=Bm(),t=Am().filter(e=>e.status!==`won`&&e.status!==`lost`).length;return r?`💰 סיכום עסקי:\nהכנסות: ₪${e.realised.toLocaleString()}\nפייפליין: ₪${e.pipeline.toLocaleString()}\nשיעור סגירה: ${Math.round(e.winRate*100)}%\nלידים פתוחים: ${t}`:`💰 Business summary:\nRevenue: ₪${e.realised.toLocaleString()}\nPipeline: ₪${e.pipeline.toLocaleString()}\nWin rate: ${Math.round(e.winRate*100)}%\nOpen leads: ${t}`}catch{return r?`אין נתונים עסקיים עדיין.`:`No business data yet.`}if(/\b(expenses|spending|my spending|הוצאות|כמה הוצאתי)\b/i.test(n))try{let e=nh(),t=r?`💸 הוצאות החודש: ₪${e.monthTotal.toLocaleString()}\n`:`💸 This month: ₪${e.monthTotal.toLocaleString()}\n`;return e.byCategory.length&&(t+=e.byCategory.slice(0,5).map(e=>`• ${e.category}: ₪${e.total.toLocaleString()}`).join(`
`)),t}catch{return r?`אין הוצאות.`:`No expenses recorded.`}if(/\b(my goals|goals|יעדים|המטרות שלי)\b/i.test(n))try{let e=Ah(),t=Ch();if(!t.length)return r?`🎯 אין יעדים. הוסף ביעדים בלוח הבקרה.`:`🎯 No goals set. Add goals in the cockpit.`;let n=r?`🎯 יעדים: ${e.total} (${e.completed} הושלמו, ${e.avgProgress}% ממוצע)\n`:`🎯 Goals: ${e.total} (${e.completed} done, ${e.avgProgress}% avg)\n`;return n+=t.slice(0,5).map(e=>{let t=e.milestones.filter(e=>e.done).length,n=e.milestones.length;return`• ${e.title} [${n?Math.round(t/n*100):0}%]`}).join(`
`),n}catch{return r?`שגיאה בטעינת יעדים.`:`Error loading goals.`}if(/^(find contact|search contact|חפש איש קשר|מצא)\s+/i.test(t)){let e=t.replace(/^(find contact|search contact|חפש איש קשר|מצא)\s*/i,``).trim();if(!e)return r?`מה לחפש?`:`Who to find?`;let n=Yh(e);return n.length?(r?`📇 נמצאו:
`:`📇 Found:
`)+n.slice(0,5).map(e=>`• ${e.name||`Unnamed`}${e.phone?` · `+e.phone:``}${e.company?` · `+e.company:``}`).join(`
`):r?`לא נמצאו תוצאות.`:`No contacts found.`}if(/\b(status|my status|סטטוס|מה המצב)\b/i.test(n)){let e=Jp().filter(e=>!e.done).length,t=new Date().toISOString().slice(0,10),n=Up().filter(e=>e.date===t),i=a_(),a=tg(),o=r?`📊 סטטוס נוכחי:
`:`📊 Current status:
`;if(o+=r?`• משימות פתוחות: ${e}\n`:`• Open tasks: ${e}\n`,o+=r?`• אירועים היום: ${n.length}\n`:`• Events today: ${n.length}\n`,o+=r?`• ציון אלפא: ${i.total}/100\n`:`• Alpha Score: ${i.total}/100\n`,a){let e=Math.round((Date.now()-a.startTime)/6e4);o+=r?`• טיימר פעיל: ${a.project} (${e}d)\n`:`• Active timer: ${a.project} (${e}m)\n`}return o.trim()}if(/\b(mood|מצב רוח|איך אני מרגיש|אני מרגיש)\b/i.test(n)){let e=Object.entries({great:`great`,מעולה:`great`,מצוין:`great`,נהדר:`great`,good:`good`,טוב:`good`,"בסדר גמור":`good`,okay:`okay`,סבבה:`okay`,בסדר:`okay`,low:`low`,"לא טוב":`low`,"לא נהדר":`low`,bad:`bad`,רע:`bad`,גרוע:`bad`}).find(([e])=>n.includes(e));if(e){mh(e[1]);let t=dh[e[1]];return r?`${t} מצב רוח נרשם: ${e[0]}`:`${t} Mood logged: ${e[0]}`}let t=hh();return r?t?`${dh[t.mood]} מצב הרוח היום: ${t.mood} | אנרגיה: ${t.energy}/5`:`לא נרשם מצב רוח היום. תגיד "מצב רוח טוב" לרישום.`:t?`${dh[t.mood]} Today's mood: ${t.mood} | Energy: ${t.energy}/5`:`No mood logged today. Say "mood good" to log it.`}if(/\b(water|שתיתי מים|שתה מים|מים|כוס מים)\b/i.test(n)){let e=vh(1),t=`💧`.repeat(Math.min(e,8))+`○`.repeat(Math.max(0,8-e));return r?`💧 ${e} כוסות מים היום (יעד: 8)\n${t}`:`💧 ${e} glasses of water today (goal: 8)\n${t}`}let i=t.match(/\b(?:ישנתי|slept|sleep)\s+(\d+(?:\.\d+)?)\s*(?:שעות|hours?)?/i);if(i){let e=parseFloat(i[1]);bh(e,3);let t=xh();return r?`😴 ${e} שעות שינה נרשמו. ממוצע שבועי: ${t.hours} שעות`:`😴 ${e} hours of sleep logged. Weekly avg: ${t.hours} hours`}if(/^(מה יש מחר|מחר)\b/i.test(n)){let e=new Date(Date.now()+864e5).toISOString().slice(0,10),t=Up().filter(t=>t.date===e);if(!t.length)return`אין אירועים מתוכננים למחר.`;let n=`📅 מחר:
`;return t.forEach(e=>{n+=`• ${e.time?e.time+` — `:``}${e.title}\n`}),n.trim()}return/^(פיקאצ'ו|פיקצו|pikachu|pika)\b/i.test(n)?r?`פיקה פיקה! ⚡`:`Pika pika! ⚡`:/\b(help|what can you do|מה אתה יכול|עזרה|יכולות)\b/i.test(n)?r?`🤖 הנה מה שאני יכול לעשות בלי אינטרנט:
• "הוסף משימה ..." — ניהול משימות
• "המשימות שלי" — הצג משימות
• "סיימתי ..." — סמן משימה כהושלמה
• "שמור ..." — שמור הערה / "ההערות שלי"
• "הוסף אירוע ... 2026-07-01 14:00" — יומן
• "היומן שלי" — הצג אירועים
• "הכנסות" / "הוצאות" — סיכום פיננסי
• "יעדים" — הצג יעדים
• "חפש איש קשר ..." — חיפוש
• "סטטוס" — סיכום מהיר
• "הציון שלי" — ציון אלפא
• "תדריך" — סיכום יומי
• "מה השעה" / "חשב ..." / "טיימר 5 דקות"
ולשאלות מורכבות — AI.`:`🤖 Here's what I can do offline:
• "add task ..." / "my tasks" / "done ..."
• "note ..." / "my notes"
• "add event ... 2026-07-01 14:00" / "my calendar"
• "revenue" / "expenses" — financial summary
• "my goals" — goal progress
• "find contact ..." — contact search
• "status" — quick overview
• "my score" — Alpha Score
• "briefing" — daily brief
• "what time" / "calculate ..." / "timer 5 min"
• "joke" / "fun fact" / "flip coin" / "roll dice"
For complex questions — I'll use AI.`:null}var C_=class{rec=null;recRunning=!1;suppress=!1;commandMode=!1;cmdTimer;silenceTimer;speechBuffer=``;voices=[];chosenVoice=null;state;onTranscript;onStateChange;recRetries=0;wakeOn=!1;constructor(e,t,n){this.state=e,this.onTranscript=t,this.onStateChange=n;let r=window.SpeechRecognition||window.webkitSpeechRecognition;r&&(this.rec=new r,this.rec.lang=e.micLang===`he`?`he-IL`:e.micLang===`es`?`es-ES`:`en-US`,this.rec.continuous=!0,this.rec.interimResults=!0,this.rec.maxAlternatives=1,this.rec.onresult=e=>{if(this.suppress)return;let t=``,n=``;for(let r=e.resultIndex;r<e.results.length;r++)e.results[r].isFinal?t+=e.results[r][0].transcript+` `:n+=e.results[r][0].transcript;n&&this.commandMode&&this.onStateChange(`listening`),n&&this.resetSilenceTimer(),t&&this.handleSpeech(t)},this.rec.onend=()=>{this.recRunning=!1,this.recRetries=0,this.commandMode&&this.speechBuffer.trim()&&this.flushBuffer(),this.wakeOn&&!this.suppress&&setTimeout(()=>this.startRec(),250)},this.rec.onerror=e=>{this.recRunning=!1,e.error===`not-allowed`||e.error===`service-not-allowed`?(this.wakeOn=!1,this.onStateChange(``)):this.wakeOn&&!this.suppress&&this.recRetries<5&&(this.recRetries++,setTimeout(()=>this.startRec(),500*this.recRetries))}),this.loadVoices(),`speechSynthesis`in window&&(speechSynthesis.onvoiceschanged=()=>this.loadVoices())}get supported(){return!!this.rec}startRec(){if(!(!this.rec||this.recRunning||!this.wakeOn))try{this.rec.start(),this.recRunning=!0}catch{}}stopRec(){if(this.rec)try{this.rec.stop()}catch{}}enterCommandMode(){this.commandMode=!0,this.speechBuffer=``,this.onStateChange(`listening`),clearTimeout(this.cmdTimer),this.cmdTimer=window.setTimeout(()=>{this.speechBuffer.trim()?this.flushBuffer():(this.commandMode=!1,this.wakeOn&&this.onStateChange(`armed`))},2e4)}resetSilenceTimer(){clearTimeout(this.silenceTimer),this.commandMode&&(this.silenceTimer=window.setTimeout(()=>{this.speechBuffer.trim()&&this.flushBuffer()},2e3))}flushBuffer(){let e=this.speechBuffer.trim();this.speechBuffer=``,this.commandMode=!1,clearTimeout(this.cmdTimer),clearTimeout(this.silenceTimer),e&&this.onTranscript(e)}hasWake(e){let t=e.toLowerCase();return t.includes(`alpha`)||t.includes(`alfa`)||t.includes(`elpha`)||t.includes(`אלפא`)||t.includes(`אלפה`)}stripWake(e){return e.replace(/(hey|hi|hello|ok|okay)?\s*(alpha|alfa|elpha)\b[\s,.:!?-]*/i,``).replace(/(היי|הי|הליי|אלו)?\s*(אלפא|אלפה)[\s,.:!?-]*/,``).replace(/^[\s,.:!?-]+/,``).trim()}handleSpeech(e){let t=e.trim();if(t){if(this.commandMode){this.speechBuffer+=` `+t,this.resetSilenceTimer();return}if(this.hasWake(t)){let e=this.stripWake(t);this.enterCommandMode(),e.length>1&&(this.speechBuffer=e,this.resetSilenceTimer())}}}setWake(e){e&&!this.rec||(this.wakeOn=e,this.state.wakeOn=e,e?(this.startRec(),this.enterCommandMode()):(this.commandMode=!1,this.speechBuffer=``,clearTimeout(this.cmdTimer),clearTimeout(this.silenceTimer),this.onStateChange(``),this.stopRec()))}isFemaleVoice(e){let t=e.toLowerCase();return/female|woman|aria|jenny|jane|michelle|sonia|libby|samantha|zira|eva|joanna|amy|emma|salli|carmit|lucia|elena|conchita|lupe|penelope|paulina|monica|tessa|karen|moira|fiona|veena|ioana|sara|laura|alice|amelie|anna|catarina|damayanti|kanya|kyoko|mei-jia|melina|milena|nora|o-ren|sin-ji|tian-tian|ting-ting|yuna|zosia/.test(t)}isMaleVoice(e){let t=e.toLowerCase();return/\bmale\b|david|mark|guy|james|ryan|daniel|thomas|oliver|jorge|diego|enrique|rishi|alex|fred|junior|liam/.test(t)}scoreVoice(e){let t=0,n=e.name.toLowerCase(),r=this.state.replyLang;if(!e.lang.toLowerCase().startsWith(r))return-100;/premium|studio/.test(n)&&(t+=20),/natural|neural/.test(n)&&(t+=15),/enhanced|online|wavenet/.test(n)&&(t+=12),/compact|espeak/.test(n)&&(t-=10),/google/.test(n)&&(t+=5),/microsoft/.test(n)&&(t+=4),/apple/.test(n)&&(t+=3);let i=this.state.voiceGender;return i===`female`?(this.isFemaleVoice(n)&&(t+=8),this.isMaleVoice(n)&&(t-=8)):i===`male`&&(this.isMaleVoice(n)&&(t+=8),this.isFemaleVoice(n)&&(t-=8)),r===`en`&&(/aria|jenny|michelle/.test(n)&&(t+=4),/david|mark|ryan/.test(n)&&(t+=4),e.lang===`en-US`?t+=2:e.lang===`en-GB`&&(t+=1)),r===`he`&&/carmit|hebrew/.test(n)&&(t+=4),r===`es`&&/lucia|elena|jorge|paulina|monica/.test(n)&&(t+=4),t}langVoices(){return this.voices.filter(e=>e.lang.toLowerCase().startsWith(this.state.replyLang)).sort((e,t)=>this.scoreVoice(t)-this.scoreVoice(e))}loadVoices(){this.voices=speechSynthesis.getVoices();let e=this.state.voiceGender||`auto`,t=localStorage.getItem(`alpha_voice_`+this.state.replyLang+`_`+e),n=this.langVoices();this.chosenVoice=t&&n.find(e=>e.name===t)||n[0]||this.voices[0]||null}availableVoices(){return this.langVoices()}voiceGenderLabel(e){return this.isFemaleVoice(e.name)?`F`:this.isMaleVoice(e.name)?`M`:`?`}setVoice(e){let t=this.state.voiceGender||`auto`;localStorage.setItem(`alpha_voice_`+this.state.replyLang+`_`+t,e),this.chosenVoice=this.voices.find(t=>t.name===e)||this.chosenVoice}speak(e){if(!this.state.voiceOn||!this.state.autoSpeak||!(`speechSynthesis`in window)){this.wakeOn?this.enterCommandMode():this.onStateChange(``);return}speechSynthesis.cancel(),!this.chosenVoice&&this.voices.length===0&&this.loadVoices();let t=new SpeechSynthesisUtterance(e);this.chosenVoice?(t.voice=this.chosenVoice,t.lang=this.chosenVoice.lang):t.lang=this.state.replyLang===`he`?`he-IL`:this.state.replyLang===`es`?`es-ES`:`en-US`,t.rate=this.state.voiceSpeed||1,t.pitch=this.state.voicePitch==null?1:this.state.voicePitch,t.volume=this.state.voiceVolume==null?1:this.state.voiceVolume;let n=!1,r=()=>{n||(n=!0,this.suppress=!1,this.wakeOn?(setTimeout(()=>this.startRec(),250),this.enterCommandMode()):this.onStateChange(``))};t.onstart=()=>{this.suppress=!0,this.stopRec(),this.onStateChange(`speaking`)},t.onend=r,t.onerror=()=>r(),speechSynthesis.speak(t),setTimeout(()=>{n||(speechSynthesis.cancel(),r())},3e4)}preview(e,t){if(!(`speechSynthesis`in window))return;speechSynthesis.cancel(),!this.chosenVoice&&this.voices.length===0&&this.loadVoices();let n=new SpeechSynthesisUtterance(e),r=this.chosenVoice;t?.voiceName&&(r=this.voices.find(e=>e.name===t.voiceName)||r),r?(n.voice=r,n.lang=r.lang):n.lang=this.state.replyLang===`he`?`he-IL`:this.state.replyLang===`es`?`es-ES`:`en-US`,n.rate=t?.rate==null?this.state.voiceSpeed||1:t.rate,n.pitch=t?.pitch==null?this.state.voicePitch==null?1:this.state.voicePitch:t.pitch,n.volume=t?.volume==null?this.state.voiceVolume==null?1:this.state.voiceVolume:t.volume;let i=this.suppress;this.suppress=!0,this.stopRec(),n.onstart=()=>{this.onStateChange(`speaking`)};let a=()=>{this.suppress=i,this.wakeOn?(setTimeout(()=>this.startRec(),250),this.onStateChange(`armed`)):this.onStateChange(``)};n.onend=a,n.onerror=()=>a(),speechSynthesis.speak(n)}setMicLang(e){this.rec&&(this.rec.lang=e===`he`?`he-IL`:e===`es`?`es-ES`:`en-US`)}},w_={D4:293.66,E4:329.63,G4:392,A4:440,B4:493.88,D5:587.33,E5:659.25,G5:783.99,A5:880,B5:987.77},T_=class{ac=null;master=null;sfxBus=null;ambGain=null;ambNodes=[];muted=!1;sfxOn=!0;ambLevel=.4;ambPreset=`pad`;ambPrev=.4;ensure(){if(!this.ac)try{this.ac=new(window.AudioContext||window.webkitAudioContext),this.master=this.ac.createGain(),this.master.gain.value=+!this.muted,this.master.connect(this.ac.destination),this.sfxBus=this.ac.createGain(),this.sfxBus.gain.value=1,this.sfxBus.connect(this.master);let e=this.ac.createDelay();e.delayTime.value=.24;let t=this.ac.createGain();t.gain.value=.22;let n=this.ac.createGain();n.gain.value=.18,this.sfxBus.connect(e),e.connect(t),t.connect(e),e.connect(n),n.connect(this.master),this.startAmbient(this.ambPreset),this.boot()}catch{}}note(e,t=1.4,n=.1,r=0){if(!this.ac||!this.sfxBus)return;let i=this.ac.currentTime+r,a=this.ac.createOscillator(),o=this.ac.createOscillator(),s=this.ac.createGain(),c=this.ac.createGain();a.type=`sine`,o.type=`sine`,a.frequency.value=e,o.frequency.value=e*2.004,c.gain.value=.28,s.gain.setValueAtTime(0,i),s.gain.linearRampToValueAtTime(n,i+.014),s.gain.exponentialRampToValueAtTime(1e-4,i+t),a.connect(s),o.connect(c),c.connect(s),s.connect(this.sfxBus),a.start(i),o.start(i),a.stop(i+t+.05),o.stop(i+t+.05)}boot(){this.sfxOn&&[[w_.D5,0,.13],[w_.E5,.13,.13],[w_.G5,.26,.13],[w_.A5,.4,.14]].forEach(([e,t,n])=>this.note(e,1.8,n,t))}send(){this.sfxOn&&this.note(w_.G5,1.1,.12)}receive(){this.sfxOn&&(this.note(w_.E5,1.2,.12),this.note(w_.A5,1.4,.11,.12))}micOn(){this.sfxOn&&(this.note(w_.A4,1,.12),this.note(w_.E5,1.2,.11,.1))}micOff(){this.sfxOn&&(this.note(w_.E5,1,.11),this.note(w_.A4,1.2,.1,.1))}open(){this.sfxOn&&(this.note(w_.D5,1.4,.1),this.note(w_.A5,1.6,.09,.06))}test(){this.note(w_.G5,1.3,.14),this.note(w_.B5,1.5,.1,.1)}stopAmbientNodes(){for(let e of this.ambNodes){try{e.stop()}catch{}try{e.disconnect()}catch{}}this.ambNodes=[]}noise(e){let t=this.ac,n=t.sampleRate*e,r=t.createBuffer(1,n,t.sampleRate),i=r.getChannelData(0);for(let e=0;e<n;e++)i[e]=Math.random()*2-1;return r}loopNoise(e,t,n,r=1){let i=this.ac,a=i.createBufferSource();a.buffer=this.noise(4),a.loop=!0;let o=i.createBiquadFilter();o.type=e,o.frequency.value=t,o.Q.value=r;let s=i.createGain();return s.gain.value=n,a.connect(o),o.connect(s),s.connect(this.ambGain),a.start(),this.ambNodes.push(a),{src:a,filter:o,gain:s}}startAmbient(e){if(!this.ac||!this.master)return;if(this.stopAmbientNodes(),this.ambPreset=e,this.ambGain||(this.ambGain=this.ac.createGain(),this.ambGain.gain.value=0,this.ambGain.connect(this.master)),e===`off`){this.ambGain.gain.linearRampToValueAtTime(0,this.ac.currentTime+.5);return}let t=this.ambLevel*.06;switch(e){case`pad`:this.buildPad();break;case`rain`:this.buildRain();break;case`ocean`:this.buildOcean();break;case`wind`:this.buildWind();break;case`cafe`:this.buildCafe();break;case`fireplace`:this.buildFireplace();break;case`night`:this.buildNight();break;case`stream`:this.buildStream();break}this.ambGain.gain.linearRampToValueAtTime(t,this.ac.currentTime+2)}buildPad(){let e=this.ac,t=e.createBiquadFilter();t.type=`lowpass`,t.frequency.value=240,t.connect(this.ambGain),[55,82.5,110].forEach((n,r)=>{let i=e.createOscillator();i.type=`sine`,i.frequency.value=n,i.detune.value=r*4,i.connect(t),i.start(),this.ambNodes.push(i)});let n=e.createOscillator();n.frequency.value=.06;let r=e.createGain();r.gain.value=.01,n.connect(r),r.connect(this.ambGain.gain),n.start(),this.ambNodes.push(n)}buildRain(){this.loopNoise(`bandpass`,800,.7,.8),this.loopNoise(`highpass`,2e3,.2,.5),this.loopNoise(`bandpass`,400,.3,.6);let e=this.ac,t=e.createOscillator();t.frequency.value=.08;let n=e.createGain();n.gain.value=.15,t.connect(n),n.connect(this.ambGain.gain),t.start(),this.ambNodes.push(t)}buildOcean(){this.loopNoise(`lowpass`,300,.6,.4),this.loopNoise(`bandpass`,150,.35,.3);let e=this.ac,t=e.createOscillator();t.type=`sine`,t.frequency.value=.12;let n=e.createGain();n.gain.value=.4,t.connect(n),n.connect(this.ambGain.gain),t.start(),this.ambNodes.push(t);let r=e.createOscillator();r.type=`sine`,r.frequency.value=.04;let i=e.createGain();i.gain.value=.2,r.connect(i),i.connect(this.ambGain.gain),r.start(),this.ambNodes.push(r)}buildWind(){this.loopNoise(`bandpass`,500,.5,.3),this.loopNoise(`bandpass`,1200,.15,.4);let e=this.ac,t=e.createOscillator();t.frequency.value=.05;let n=e.createGain();n.gain.value=.3,t.connect(n),n.connect(this.ambGain.gain),t.start(),this.ambNodes.push(t)}buildCafe(){this.loopNoise(`bandpass`,600,.3,.5),this.loopNoise(`bandpass`,1500,.1,.8),this.loopNoise(`lowpass`,250,.2,.3);let e=this.ac,t=e.createOscillator();t.frequency.value=.03;let n=e.createGain();n.gain.value=.08,t.connect(n),n.connect(this.ambGain.gain),t.start(),this.ambNodes.push(t);let r=()=>{if(!this.ac||this.ambPreset!==`cafe`)return;let e=3+Math.random()*8;setTimeout(()=>{if(!this.ac||this.ambPreset!==`cafe`)return;let e=2e3+Math.random()*3e3,t=this.ac.createOscillator();t.type=`sine`,t.frequency.value=e;let n=this.ac.createGain(),i=this.ac.currentTime;n.gain.setValueAtTime(0,i),n.gain.linearRampToValueAtTime(.03,i+.01),n.gain.exponentialRampToValueAtTime(1e-4,i+.4),t.connect(n),n.connect(this.ambGain),t.start(i),t.stop(i+.5),r()},e*1e3)};r()}buildFireplace(){this.loopNoise(`bandpass`,200,.5,.3),this.loopNoise(`bandpass`,80,.3,.5),this.loopNoise(`highpass`,3e3,.08,.4);let e=this.ac,t=e.createOscillator();t.frequency.value=.15;let n=e.createGain();n.gain.value=.25,t.connect(n),n.connect(this.ambGain.gain),t.start(),this.ambNodes.push(t);let r=()=>{if(!this.ac||this.ambPreset!==`fireplace`)return;let e=.5+Math.random()*2;setTimeout(()=>{if(!this.ac||this.ambPreset!==`fireplace`)return;let e=this.ac.createBufferSource();e.buffer=this.noise(.08);let t=this.ac.createBiquadFilter();t.type=`bandpass`,t.frequency.value=1e3+Math.random()*3e3,t.Q.value=2;let n=this.ac.createGain(),i=this.ac.currentTime;n.gain.setValueAtTime(0,i),n.gain.linearRampToValueAtTime(.06*Math.random(),i+.005),n.gain.exponentialRampToValueAtTime(1e-4,i+.08),e.connect(t),t.connect(n),n.connect(this.ambGain),e.start(i),e.stop(i+.1),r()},e*1e3)};r()}buildNight(){this.loopNoise(`bandpass`,3500,.08,2),this.loopNoise(`lowpass`,200,.15,.3);let e=()=>{if(!this.ac||this.ambPreset!==`night`)return;let t=.3+Math.random()*1.5;setTimeout(()=>{if(!this.ac||this.ambPreset!==`night`)return;let t=3800+Math.random()*1200,n=this.ac.currentTime;for(let e=0;e<3;e++){let r=this.ac.createOscillator();r.type=`sine`,r.frequency.value=t+Math.random()*200;let i=this.ac.createGain(),a=n+e*.06;i.gain.setValueAtTime(0,a),i.gain.linearRampToValueAtTime(.012,a+.008),i.gain.exponentialRampToValueAtTime(1e-4,a+.04),r.connect(i),i.connect(this.ambGain),r.start(a),r.stop(a+.05)}e()},t*1e3)};e()}buildStream(){this.loopNoise(`bandpass`,1200,.35,.5),this.loopNoise(`bandpass`,600,.4,.4),this.loopNoise(`highpass`,3e3,.08,.3);let e=this.ac,t=e.createOscillator();t.frequency.value=.07;let n=e.createGain();n.gain.value=.15,t.connect(n),n.connect(this.ambGain.gain),t.start(),this.ambNodes.push(t);let r=e.createOscillator();r.frequency.value=.2;let i=e.createGain();i.gain.value=.08,r.connect(i),i.connect(this.ambGain.gain),r.start(),this.ambNodes.push(r)}setAmbient(e){this.ambLevel=Math.max(0,Math.min(1,e)),e>0&&(this.ambPrev=e),this.ambGain&&this.ac&&this.ambGain.gain.linearRampToValueAtTime(this.ambLevel*.06,this.ac.currentTime+.3)}setPreset(e){e!==this.ambPreset&&this.startAmbient(e)}toggleAmbient(){this.setAmbient(this.ambLevel>0?0:this.ambPrev||.4)}toggleMute(){this.muted=!this.muted,this.master&&(this.master.gain.value=+!this.muted)}},E_=`alpha_proactive_seen_v1`,D_=6e4;function O_(){try{return JSON.parse(localStorage.getItem(E_)||`{}`)}catch{return{}}}function k_(e){try{localStorage.setItem(E_,JSON.stringify(e))}catch{}}function A_(e,t){try{`Notification`in window&&(Notification.permission===`granted`?new Notification(e,{body:t}):Notification.permission==="default"&&Notification.requestPermission())}catch{}}function j_(){try{return JSON.parse(localStorage.getItem(`alpha_price_alerts`)||`[]`)}catch{return[]}}function M_(e){localStorage.setItem(`alpha_price_alerts`,JSON.stringify(e))}async function N_(e){try{let t=await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${encodeURIComponent(e)}`);if(!t.ok)return null;let n=await t.json();return parseFloat(n.price)}catch{return null}}function P_(e,t){let n=new Date().toISOString().slice(0,10),r=[];try{r=JSON.parse(localStorage.getItem(`alpha_leads_v1`)||`[]`)}catch{}for(let i of r)if(!(!i.followUp||i.status===`won`||i.status===`lost`)&&i.followUp<=n){let n=`followup:`+i.id+`:`+i.followUp;if(!t[n]){t[n]=Date.now();let r=i.name||i.phone||`lead`;e(`Follow-up due`,`${r}${i.vehicle?` · `+i.vehicle:``}`),A_(`📋 Follow-up due`,r)}}}function F_(e,t){let n=new Date(Date.now()+864e5).toISOString().slice(0,10),r=[];try{let e=JSON.parse(localStorage.getItem(`alpha_events`)||`[]`),t=JSON.parse(localStorage.getItem(`hg2:tasks`)||`[]`).filter(e=>!e.done&&e.date).map(e=>({id:`hg:`+e.id,title:e.title,date:e.date}));r=[...e,...t]}catch{}for(let i of r)if(i.date===n){let n=`install:`+i.id;t[n]||(t[n]=Date.now(),e(`Tomorrow`,`${i.title} (${i.date})`),A_(`📅 Tomorrow`,`${i.title}`))}}async function I_(e){let t=j_().filter(e=>!e.fired);if(!t.length)return;let n=!1;for(let r of t){let t=await N_(r.symbol);if(t==null)continue;let i=r.above!=null&&t>=r.above,a=r.below!=null&&t<=r.below;if(i||a){r.fired=!0,n=!0;let a=i?`above ${r.above}`:`below ${r.below}`;e(`${r.symbol} ${a}`,`Now ${t}. ${r.note||``}`.trim()),A_(`📈 ${r.symbol}`,`${a} — now ${t}`)}}n&&M_(j_().map(e=>t.find(t=>t.id===e.id)||e))}function L_(e,t){try{let n=JSON.parse(localStorage.getItem(`alpha_tasks`)||`[]`).filter(e=>!e.done&&e.priority===`high`);if(n.length>=3){let r=`hightasks:`+new Date().toISOString().slice(0,10);t[r]||(t[r]=Date.now(),e(`High priority tasks`,`${n.length} high-priority tasks need attention`),A_(`⚡ High Priority`,`${n.length} tasks need your attention`))}}catch{}}function R_(e,t){try{let n=JSON.parse(localStorage.getItem(`alpha_goals_v1`)||`[]`),r=new Date(Date.now()+3*864e5).toISOString().slice(0,10);for(let i of n)if(i.deadline&&i.deadline<=r){let n=`goal:`+i.id;t[n]||(t[n]=Date.now(),e(`Goal deadline approaching`,i.title),A_(`🎯 Goal deadline`,i.title))}}catch{}}function z_(e,t){try{let n=JSON.parse(localStorage.getItem(`alpha_invoices_v1`)||`[]`),r=new Date().toISOString().slice(0,10);for(let i of n)if(i.status!==`paid`&&i.dueDate&&i.dueDate<=r){let n=`invdue:`+i.id;t[n]||(t[n]=Date.now(),e(`Invoice overdue`,`${i.number} — ${i.customer}`),A_(`📄 Invoice overdue`,`${i.number} — ${i.customer}`))}}catch{}}function B_(e){let t=async()=>{let t=O_();try{F_(e,t)}catch{}try{P_(e,t)}catch{}try{L_(e,t)}catch{}try{R_(e,t)}catch{}try{z_(e,t)}catch{}try{await I_(e)}catch{}k_(t)};setTimeout(t,8e3),setInterval(t,D_)}var V_=`alpha_smart_notes_v1`;function H_(){try{return JSON.parse(localStorage.getItem(V_)||`[]`)}catch{return[]}}function U_(e){localStorage.setItem(V_,JSON.stringify(e))}function W_(e,t=`General`){let n=H_(),r=new Date().toISOString(),i={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),text:e.trim(),category:t,pinned:!1,created:r.slice(0,10),updated:r.slice(0,10)};return n.unshift(i),U_(n),i}function G_(e){U_(H_().filter(t=>t.id!==e))}function K_(e){let t=H_(),n=t.find(t=>t.id===e);n&&(n.pinned=!n.pinned,U_(t))}var q_=[`General`,`Ideas`,`Work`,`Personal`,`Reference`,`Meeting`,`Research`],J_=`alpha_recurring_v1`;function Y_(){try{return JSON.parse(localStorage.getItem(J_)||`[]`)}catch{return[]}}function X_(e){localStorage.setItem(J_,JSON.stringify(e))}function Z_(e,t,n=`med`){let r=Y_(),i={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),text:e.trim(),frequency:t,priority:n,lastGenerated:``,active:!0};return r.unshift(i),X_(r),i}function Q_(e){X_(Y_().filter(t=>t.id!==e))}function $_(e){let t=Y_(),n=t.find(t=>t.id===e);n&&(n.active=!n.active,X_(t))}function ev(){let e=new Date().toISOString().slice(0,10),t=new Date,n=Y_(),r=Jp(),i=0;for(let a of n){if(!a.active||a.lastGenerated===e)continue;let n=!1;a.frequency===`daily`?n=!0:a.frequency===`weekly`?n=a.dayOfWeek==null?t.getDay()===0:t.getDay()===a.dayOfWeek:a.frequency===`monthly`&&(n=a.dayOfMonth==null?t.getDate()===1:t.getDate()===a.dayOfMonth),n&&(r.some(t=>t.text===a.text&&t.created===e&&!t.done)||(Xp(a.text,a.priority),a.lastGenerated=e,i++))}return i&&X_(n),i}function tv(){let e=Bm(),t=Am(),n=Vm(),r=Uh(),i=Xh();return`
BUSINESS PERFORMANCE REPORT
Generated: ${new Date().toLocaleString()}
${`═`.repeat(40)}

REVENUE
  Realised:    ₪${e.realised.toLocaleString()}
  Pipeline:    ₪${e.pipeline.toLocaleString()}
  Win Rate:    ${Math.round(e.winRate*100)}%

LEADS
  Total:       ${t.length}
  Open:        ${e.openLeads}
  Follow-ups:  ${n.length} due

INVOICES
  Total:       ${r.total}
  Paid:        ${r.paid}
  Outstanding: ${r.outstanding}
  Collected:   ₪${r.revenue.toLocaleString()}

CONTACTS
  Total:       ${i.total}
  Starred:     ${i.starred}

MONTHLY REVENUE (Last 6 Months)
${e.byMonth.map(e=>`  ${e.month}: ₪${e.total.toLocaleString()}`).join(`
`)}
`.trim()}function nv(){let e=Jp(),t=e.filter(e=>!e.done).length,n=e.filter(e=>e.done).length,r=Ah(),i=sh(),a=oh(),o=nh(),s=ag(),c=og();return`
PERSONAL PROGRESS REPORT
Generated: ${new Date().toLocaleString()}
${`═`.repeat(40)}

TASKS
  Open:        ${t}
  Completed:   ${n}
  Rate:        ${e.length?Math.round(n/e.length*100):0}%

GOALS
  Active:      ${r.total}
  Completed:   ${r.completed}
  Avg Progress:${r.avgProgress}%

FOCUS
  Today:       ${a.completed} sessions (${a.focusMin}min)
  This Week:   ${i.totalSessions} sessions
  Streak:      ${i.streak} days

TIME TRACKED
  Today:       ${sg(s.total)}
  This Week:   ${sg(c.total)}

EXPENSES
  This Month:  ₪${o.monthTotal.toLocaleString()}
${o.byCategory.map(e=>`  ${e.category}: ₪${e.total.toLocaleString()}`).join(`
`)}
`.trim()}function rv(e){let t;t=e===`business`?tv():e===`personal`?nv():tv()+`

`+nv();let n=new Blob([t],{type:`text/plain`}),r=URL.createObjectURL(n),i=document.createElement(`a`);i.href=r,i.download=`alpha_${e}_report_${new Date().toISOString().slice(0,10)}.txt`,i.click(),URL.revokeObjectURL(r)}var iv={width:120,height:32,stroke:`#daa520`,fill:`rgba(218,165,32,.15)`,strokeWidth:1.5,showDots:!1,showArea:!0};function av(e,t={}){let n={...iv,...t};if(!e.length)return``;let r=Math.max(...e,1),i=Math.min(...e,0),a=r-i||1,o=n.width-4,s=n.height-4,c=e.map((t,n)=>[2+n/Math.max(e.length-1,1)*o,2+s-(t-i)/a*s]),l=c.map((e,t)=>`${t===0?`M`:`L`}${e[0].toFixed(1)},${e[1].toFixed(1)}`).join(` `),u=``;n.showArea&&c.length>1&&(u=`<path d="${l} L${c[c.length-1][0].toFixed(1)},${(2+s).toFixed(1)} L${c[0][0].toFixed(1)},${(2+s).toFixed(1)} Z" fill="${n.fill}" stroke="none"/>`);let d=``;return n.showDots&&(d=c.map(e=>`<circle cx="${e[0].toFixed(1)}" cy="${e[1].toFixed(1)}" r="2" fill="${n.stroke}"/>`).join(``)),`<svg width="${n.width}" height="${n.height}" viewBox="0 0 ${n.width} ${n.height}" xmlns="http://www.w3.org/2000/svg">${u}<path d="${l}" fill="none" stroke="${n.stroke}" stroke-width="${n.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>${d}</svg>`}function ov(e,t={}){let n=t.size||40,r=t.width||3,i=(n-r)/2,a=n/2,o=2*Math.PI*i,s=o*(1-Math.min(e,100)/100),c=t.stroke||(e>=100?`#4dff91`:e>=50?`#daa520`:`#ff5d73`);return`<svg width="${n}" height="${n}" viewBox="0 0 ${n} ${n}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${a}" cy="${a}" r="${i}" fill="none" stroke="${t.bg||`rgba(255,255,255,.06)`}" stroke-width="${r}"/>
    <circle cx="${a}" cy="${a}" r="${i}" fill="none" stroke="${c}" stroke-width="${r}" stroke-linecap="round"
      stroke-dasharray="${o.toFixed(1)}" stroke-dashoffset="${s.toFixed(1)}"
      transform="rotate(-90 ${a} ${a})"/>
    <text x="${a}" y="${a+4}" text-anchor="middle" font-size="11" font-weight="600" fill="${c}">${Math.round(e)}%</text>
  </svg>`}var sv=[{id:`fu-first`,name:`First Follow-up`,category:`follow-up`,body:`Hi {{name}},

Thank you for our conversation. I wanted to follow up regarding {{service}}.

Would you like to schedule a time to discuss the details? I'm available at your convenience.

Best regards`,variables:[`name`,`service`]},{id:`fu-reminder`,name:`Gentle Reminder`,category:`follow-up`,body:`Hi {{name}},

Just a gentle reminder about {{topic}}. Let me know if you need any additional information.

Looking forward to hearing from you.`,variables:[`name`,`topic`]},{id:`fu-closing`,name:`Deal Closing`,category:`follow-up`,body:`Hi {{name}},

I wanted to check in on the quote for {{service}} (₪{{amount}}). Are you ready to move forward? I can schedule the installation for {{date}} if that works.

Let me know!`,variables:[`name`,`service`,`amount`,`date`]},{id:`email-intro`,name:`Business Introduction`,category:`email`,body:`Subject: {{subject}}

Dear {{name}},

I hope this message finds you well. My name is {{sender}} and I specialize in {{specialty}}.

I'd love the opportunity to discuss how we can help with {{need}}.

Best regards,
{{sender}}`,variables:[`subject`,`name`,`sender`,`specialty`,`need`]},{id:`email-thanks`,name:`Thank You`,category:`email`,body:`Hi {{name}},

Thank you for choosing us for {{service}}. It was a pleasure working with you.

If you ever need anything in the future, don't hesitate to reach out. We'd also appreciate a referral if you know anyone who could benefit from our services.

Warm regards`,variables:[`name`,`service`]},{id:`quote-simple`,name:`Simple Quote`,category:`quote`,body:`QUOTE
Date: {{date}}
Customer: {{name}}
Phone: {{phone}}

Items:
{{items}}

Subtotal: ₪{{subtotal}}
VAT (17%): ₪{{vat}}
Total: ₪{{total}}

Valid for 30 days.
Payment: bank transfer or credit card.`,variables:[`date`,`name`,`phone`,`items`,`subtotal`,`vat`,`total`]}],cv=`alpha_templates_v1`;function lv(){try{return JSON.parse(localStorage.getItem(cv)||`[]`)}catch{return[]}}function uv(e){localStorage.setItem(cv,JSON.stringify(e))}function dv(){return[...sv,...lv()]}function fv(e){return dv().filter(t=>t.category===e)}function pv(e){return dv().find(t=>t.id===e)}function mv(e,t,n){let r={id:`tpl_`+Date.now().toString(36),name:e,category:t,body:n,variables:gv(n)},i=lv();return i.push(r),uv(i),r}function hv(e){uv(lv().filter(t=>t.id!==e))}function gv(e){let t=e.match(/\{\{(\w+)\}\}/g)||[];return[...new Set(t.map(e=>e.slice(2,-2)))]}function _v(e,t){let n=pv(e);if(!n)return``;let r=n.body;for(let[e,n]of Object.entries(t))r=r.replace(RegExp(`\\{\\{${e}\\}\\}`,`g`),n);return r}var vv=[{key:`alpha_leads_v1`,validator:e=>Array.isArray(e)},{key:`alpha_tasks`,validator:e=>Array.isArray(e)},{key:`alpha_events`,validator:e=>Array.isArray(e)},{key:`alpha_habits_v1`,validator:e=>Array.isArray(e)},{key:`alpha_expenses_v1`,validator:e=>Array.isArray(e)},{key:`alpha_goals_v1`,validator:e=>Array.isArray(e)},{key:`alpha_invoices_v1`,validator:e=>Array.isArray(e)},{key:`alpha_contacts_v1`,validator:e=>Array.isArray(e)},{key:`alpha_smart_notes_v1`,validator:e=>Array.isArray(e)},{key:`alpha_recurring_v1`,validator:e=>Array.isArray(e)},{key:`alpha_timetracker_v1`,validator:e=>Array.isArray(e)},{key:`alpha_pomodoro_v1`,validator:e=>Array.isArray(e)},{key:`alpha_brain_memory_v1`,validator:e=>e&&typeof e==`object`&&`profile`in e},{key:`alpha_chat_history_v1`,validator:e=>Array.isArray(e)},{key:`alpha_sentiment_v1`,validator:e=>Array.isArray(e)}];function yv(){let e=0,t=[],n=[],r=0;for(let i of vv){let a=localStorage.getItem(i.key);if(!a){n.push(i.key);continue}r+=a.length;try{let n=JSON.parse(a);i.validator(n)?e++:t.push(i.key)}catch{t.push(i.key)}}return{healthy:e,corrupted:t,empty:n,totalSize:r}}function bv(e){try{let t=vv.find(t=>t.key===e);if(!t)return!1;let n=localStorage.getItem(e);if(!n)return!0;try{let e=JSON.parse(n);if(t.validator(e))return!0}catch{}return localStorage.setItem(e+`_backup_`+Date.now(),n),e===`alpha_brain_memory_v1`?localStorage.setItem(e,JSON.stringify({profile:{name:``,role:``,business:``,location:``,preferences:[]},facts:[],projects:[],summary:``,updated:Date.now()})):localStorage.setItem(e,`[]`),!0}catch{return!1}}function xv(){let e=0;for(let t=0;t<localStorage.length;t++){let n=localStorage.key(t);n&&(e+=n.length+(localStorage.getItem(n)?.length||0))}let t=5*1024*1024;return{used:e,available:t,percent:Math.round(e/t*100)}}var Sv=`https://www.googleapis.com/auth/drive.file`,Cv=`Alpha Assistant Backup`,wv=`alpha_gdrive_token`,Tv=`alpha_gdrive_last_sync`,Ev=`alpha_gdrive_client_id`,Dv=[`alpha_leads_v1`,`alpha_habits_v1`,`alpha_expenses_v1`,`alpha_events`,`alpha_tasks`,`alpha_notes`,`hg2:index`,`hg2:quotes`,`hg2:tasks`,`alpha_brain_memory_v1`,`alpha_pomodoro_v1`,`alpha_mood_v1`,`alpha_water_v1`,`alpha_sleep_v1`,`alpha_goals_v1`,`alpha_invoices_v1`,`alpha_contacts_v1`,`alpha_smart_notes_v1`,`alpha_recurring_v1`,`alpha_timetracker_v1`,`alpha_chat_history_v1`,`alpha_sentiment_v1`,`alpha_templates_v1`],Ov=null,kv=null,Av=!1;function jv(){return localStorage.getItem(Ev)||``}function Mv(e){localStorage.setItem(Ev,e.trim())}function Nv(){let e=Fv();return!!e&&e.expires_at>Date.now()}function Pv(){return localStorage.getItem(Tv)||``}function Fv(){if(Ov&&Ov.expires_at>Date.now())return Ov;try{let e=localStorage.getItem(wv);return e?(Ov=JSON.parse(e),Ov&&Ov.expires_at>Date.now()?Ov:null):null}catch{return null}}function Iv(e){Ov=e,localStorage.setItem(wv,JSON.stringify(e))}function Lv(){Ov=null,kv=null,localStorage.removeItem(wv)}function Rv(){return new Promise((e,t)=>{if(window.google?.accounts?.oauth2){e();return}let n=document.createElement(`script`);n.src=`https://accounts.google.com/gsi/client`,n.onload=()=>e(),n.onerror=()=>t(Error(`Failed to load Google Identity Services`)),document.head.appendChild(n)})}async function zv(){let e=jv();if(!e)throw Error(`NO_CLIENT_ID`);await Rv();let t=window.google;if(!t?.accounts?.oauth2)throw Error(`GIS_LOAD_FAILED`);return new Promise(n=>{t.accounts.oauth2.initTokenClient({client_id:e,scope:Sv,callback:e=>{if(e.error){n(!1);return}Iv({access_token:e.access_token,expires_at:Date.now()+(e.expires_in||3600)*1e3}),n(!0)}}).requestAccessToken()})}async function Bv(e,t={}){let n=Fv();if(!n)throw Error(`NOT_AUTHENTICATED`);let r={Authorization:`Bearer ${n.access_token}`,...t.headers||{}},i=await fetch(`https://www.googleapis.com/drive/v3${e}`,{...t,headers:r});if(!i.ok)throw i.status===401?(Lv(),Error(`TOKEN_EXPIRED`)):Error(`Drive API error: ${i.status}`);return(i.headers.get(`content-type`)||``).includes(`json`)?i.json():i.text()}async function Vv(){if(kv)return kv;let e=await Bv(`/files?q=${encodeURIComponent(`name='${Cv}' and mimeType='application/vnd.google-apps.folder' and trashed=false`)}&fields=files(id,name)&spaces=drive`);if(e.files&&e.files.length>0)return kv=e.files[0].id,kv;let t=Fv();return kv=(await(await fetch(`https://www.googleapis.com/drive/v3/files`,{method:`POST`,headers:{Authorization:`Bearer ${t.access_token}`,"Content-Type":`application/json`},body:JSON.stringify({name:Cv,mimeType:`application/vnd.google-apps.folder`})})).json()).id,kv}async function Hv(e,t){let n=`name='${e}' and '${t}' in parents and trashed=false`;return(await Bv(`/files?q=${encodeURIComponent(n)}&fields=files(id)&spaces=drive`)).files?.[0]?.id||null}async function Uv(e,t,n){let r=await Hv(e,n),i=Fv();if(r)await fetch(`https://www.googleapis.com/upload/drive/v3/files/${r}?uploadType=media`,{method:`PATCH`,headers:{Authorization:`Bearer ${i.access_token}`,"Content-Type":`application/json`},body:t});else{let r={name:e,parents:[n],mimeType:`application/json`},a=new FormData;a.append(`metadata`,new Blob([JSON.stringify(r)],{type:`application/json`})),a.append(`file`,new Blob([t],{type:`application/json`})),await fetch(`https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,{method:`POST`,headers:{Authorization:`Bearer ${i.access_token}`},body:a})}}async function Wv(e){let t=Fv();return(await fetch(`https://www.googleapis.com/drive/v3/files/${e}?alt=media`,{headers:{Authorization:`Bearer ${t.access_token}`}})).text()}async function Gv(e){if(Av)return{ok:!1,error:`Sync already in progress`};Av=!0;try{if(!Nv())return{ok:!1,error:`Not connected to Google Drive`};let t=await Vv();e?.(`Uploading data…`);let n={};for(let e of Dv){let t=localStorage.getItem(e);t&&(n[e]=t)}return await Uv(`alpha_backup.json`,JSON.stringify({version:1,timestamp:Date.now(),data:n},null,2),t),localStorage.setItem(Tv,new Date().toISOString()),e?.(`Sync complete ✓`),{ok:!0}}catch(e){return{ok:!1,error:e.message||`Unknown error`}}finally{Av=!1}}async function Kv(e){if(Av)return{ok:!1,error:`Sync already in progress`};Av=!0;try{if(!Nv())return{ok:!1,error:`Not connected to Google Drive`};let t=await Vv();e?.(`Downloading data…`);let n=await Hv(`alpha_backup.json`,t);if(!n)return{ok:!1,error:`No backup found on Google Drive`};let r=await Wv(n),i=JSON.parse(r);if(!i.data)return{ok:!1,error:`Invalid backup format`};let a=0;for(let[e,t]of Object.entries(i.data))Dv.includes(e)&&typeof t==`string`&&(localStorage.setItem(e,t),a++);return localStorage.setItem(Tv,new Date().toISOString()),e?.(`Restored ${a} tables ✓`),{ok:!0,tables:a}}catch(e){return{ok:!1,error:e.message||`Unknown error`}}finally{Av=!1}}function qv(){let e={};for(let t of Dv){let n=localStorage.getItem(t);n&&(e[t]=n)}return JSON.stringify({version:1,timestamp:Date.now(),data:e},null,2)}function Jv(e){try{let t=JSON.parse(e);if(!t.data)return{ok:!1,tables:0,error:`Invalid format`};let n=0;for(let[e,r]of Object.entries(t.data))Dv.includes(e)&&typeof r==`string`&&(localStorage.setItem(e,r),n++);return{ok:!0,tables:n}}catch(e){return{ok:!1,tables:0,error:e.message}}}function Yv(){let e=qv(),t=new Blob([e],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`alpha_backup_${new Date().toISOString().slice(0,10)}.json`,r.click(),URL.revokeObjectURL(n)}function Xv(){return new Promise(e=>{let t=document.createElement(`input`);t.type=`file`,t.accept=`.json`,t.onchange=async()=>{let n=t.files?.[0];if(!n){e({ok:!1,tables:0,error:`No file selected`});return}e(Jv(await n.text()))},t.click()})}var Zv=`https://www.googleapis.com/auth/calendar`,Qv=`alpha_gcal_token`,$v=`alpha_gcal_last_sync`,ey=`primary`,ty=null;function ny(){if(ty&&ty.expires_at>Date.now())return ty;try{let e=localStorage.getItem(Qv);return e?(ty=JSON.parse(e),ty&&ty.expires_at>Date.now()?ty:null):null}catch{return null}}function ry(e){ty=e,localStorage.setItem(Qv,JSON.stringify(e))}function iy(){let e=ny();return!!e&&e.expires_at>Date.now()}function ay(){return localStorage.getItem($v)||``}function oy(){ty=null,localStorage.removeItem(Qv)}function sy(){return new Promise((e,t)=>{if(window.google?.accounts?.oauth2){e();return}let n=document.createElement(`script`);n.src=`https://accounts.google.com/gsi/client`,n.onload=()=>e(),n.onerror=()=>t(Error(`Failed to load Google Identity Services`)),document.head.appendChild(n)})}async function cy(){let e=jv();if(!e)throw Error(`NO_CLIENT_ID`);await sy();let t=window.google;if(!t?.accounts?.oauth2)throw Error(`GIS_LOAD_FAILED`);return new Promise(n=>{t.accounts.oauth2.initTokenClient({client_id:e,scope:Zv,callback:e=>{if(e.error){n(!1);return}ry({access_token:e.access_token,expires_at:Date.now()+(e.expires_in||3600)*1e3}),n(!0)}}).requestAccessToken()})}async function ly(e,t={}){let n=ny();if(!n)throw Error(`NOT_AUTHENTICATED`);let r={Authorization:`Bearer ${n.access_token}`,...t.headers||{}},i=await fetch(`https://www.googleapis.com/calendar/v3${e}`,{...t,headers:r});if(!i.ok)throw i.status===401?(oy(),Error(`TOKEN_EXPIRED`)):Error(`Calendar API error: ${i.status}`);return(i.headers.get(`content-type`)||``).includes(`json`)?i.json():i.text()}async function uy(){let e=new Date,t=new Date(e.getTime()-168*3600*1e3).toISOString(),n=new Date(e.getTime()+1440*3600*1e3).toISOString(),r=new URLSearchParams({timeMin:t,timeMax:n,singleEvents:`true`,orderBy:`startTime`,maxResults:`500`}).toString();return((await ly(`/calendars/${encodeURIComponent(ey)}/events?${r}`)).items||[]).map(e=>({id:e.id,summary:e.summary||``,start:(e.start?.date||e.start?.dateTime||``).slice(0,10),end:(e.end?.date||e.end?.dateTime||``).slice(0,10)}))}async function dy(e,t,n){let r=n?{dateTime:`${t}T${n}:00`,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone}:{date:t},i=n?{dateTime:`${t}T${String(parseInt(n.split(`:`)[0])+1).padStart(2,`0`)}:${n.split(`:`)[1]}:00`,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone}:{date:t},a=ny(),o=await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(ey)}/events`,{method:`POST`,headers:{Authorization:`Bearer ${a.access_token}`,"Content-Type":`application/json`},body:JSON.stringify({summary:e,start:r,end:i})});if(!o.ok)throw Error(`Create event failed: ${o.status}`);return(await o.json()).id}async function fy(e){if(!iy())return{ok:!1,pushed:0,pulled:0,error:`Not connected to Google Calendar`};try{e?.(`Fetching Google Calendar events…`);let t=await uy(),n=new Set(t.map(e=>(e.summary||``).toLowerCase()+`|`+e.start));e?.(`Pushing local events to Google…`);let r=[];try{r.push(...JSON.parse(localStorage.getItem(`alpha_events`)||`[]`))}catch{}let i=[];try{i.push(...JSON.parse(localStorage.getItem(`hg2:tasks`)||`[]`))}catch{}let a=[];for(let e of r){if(!e.date)continue;let t=e.title.toLowerCase()+`|`+e.date;n.has(t)||a.push({title:e.title,date:e.date,time:e.time||``})}for(let e of i){if(!e.date||e.done)continue;let t=e.title.toLowerCase()+`|`+e.date;n.has(t)||a.push({title:e.title,date:e.date,time:``})}let o=0;for(let e of a)try{await dy(e.title,e.date,e.time),o++}catch{}e?.(`Pulling Google events into Alpha…`);let s=[];try{s.push(...JSON.parse(localStorage.getItem(`alpha_events`)||`[]`))}catch{}let c=new Set(s.map(e=>e.title.toLowerCase()+`|`+e.date)),l=0,u=new Date().toISOString().slice(0,10);for(let e of t){if(!e.start||e.start<u)continue;let t=e.summary.toLowerCase()+`|`+e.start;if(!c.has(t)){s.push({id:Date.now()+`_gcal_`+e.id,title:e.summary,date:e.start,time:``}),c.add(t);try{let t=JSON.parse(localStorage.getItem(`hg2:tasks`)||`[]`);t.some(t=>t.title===e.summary&&t.date===e.start)||(t.unshift({id:Date.now().toString(36)+`_gcal`,title:e.summary,date:e.start,done:!1,ts:Date.now()}),localStorage.setItem(`hg2:tasks`,JSON.stringify(t)))}catch{}l++}}return s.sort((e,t)=>(e.date+e.time).localeCompare(t.date+t.time)),localStorage.setItem(`alpha_events`,JSON.stringify(s)),localStorage.setItem($v,new Date().toISOString()),e?.(`Sync complete: ↑${o} pushed, ↓${l} pulled`),{ok:!0,pushed:o,pulled:l}}catch(e){return{ok:!1,pushed:0,pulled:0,error:e.message||`Unknown error`}}}function py(e,t,n){let r=n?t.replace(/-/g,``)+`T`+n.replace(`:`,``)+`00`:t.replace(/-/g,``),i=n?r.slice(0,9)+String(parseInt(r.slice(9,11))+1).padStart(2,`0`)+r.slice(11):r;return`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(e)}&dates=${r}/${i}`}var my=t({mountCockpit:()=>_y});function hy(){return localStorage.getItem(`alpha_uilang`)||`he`}function Q(e,t){return hy()===`he`?e:t}var $=(e,t,n)=>{let r=document.createElement(e);return t&&(r.className=t),n!=null&&(r.innerHTML=n),r},gy=e=>e.replace(/[&<>"]/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`})[e]);function _y(e,t){let n=$(`div`,`cockpit-overlay`);n.innerHTML=`
    <div class="cockpit">
      <div class="cp-head">
        <div class="cp-title"><span class="cp-glyph">◆</span> ${Q(`מוח ראשי`,`MASTER BRAIN`)}</div>
        <button class="cp-close" id="cpClose">✕</button>
      </div>
      <div class="cp-tabs" id="cpTabs"></div>
      <div class="cp-body" id="cpBody"></div>
    </div>`,e.appendChild(n),n.addEventListener(`click`,e=>{e.target===n&&u()}),n.querySelector(`#cpClose`).onclick=()=>u();let r=n.querySelector(`#cpTabs`),i=n.querySelector(`#cpBody`),a=[{id:`business`,label:Q(`עסקים`,`Business`),hue:38},{id:`trading`,label:Q(`מסחר`,`Trading`),hue:145},{id:`creative`,label:Q(`יצירתי`,`Creative`),hue:280},{id:`personal`,label:Q(`אישי`,`Personal`),hue:200},{id:`memory`,label:Q(`זיכרון`,`Memory`),hue:45},{id:`advanced`,label:Q(`מתקדם`,`Advanced`),hue:20}],o=`business`;a.forEach(e=>{let t=$(`button`,`cp-tab`);t.textContent=e.label,t.style.setProperty(`--tab-hue`,String(e.hue)),t.onclick=()=>{o=e.id,s(),c()},t._tab=e.id,r.appendChild(t)});function s(){r.querySelectorAll(`.cp-tab`).forEach(e=>{e.classList.toggle(`active`,e._tab===o)})}function c(){i.innerHTML=``,o===`business`?Cy(i,t,u):o===`trading`?wy(i,t,u):o===`creative`?Ty(i,t,u):o===`personal`?Ey(i,t,u):o===`memory`?Dy(i):o===`advanced`&&Oy(i,t,u)}function l(){n.classList.add(`show`),s(),c()}function u(){n.classList.remove(`show`)}return{open:l,close:u}}function vy(e,t){let n=$(`div`,`cp-card`);return n.appendChild($(`div`,`cp-card-title`,gy(e))),t&&n.appendChild($(`div`,`cp-card-sub`,gy(t))),n}function yy(e,t){let n=$(`div`,`cp-field`);return n.appendChild($(`label`,`cp-label`,gy(e))),n.appendChild(t),n}function by(e,t=!1){let n=$(`button`,`cp-btn`+(t?` primary`:``));return n.textContent=e,n}function xy(e=``,t=``){let n=$(`input`,`cp-input`);return n.placeholder=e,n.value=t,n}function Sy(e=``,t=4){let n=$(`textarea`,`cp-textarea`);return n.placeholder=e,n.rows=t,n}function Cy(e,t,n){let r=vy(Q(`לוח הכנסות`,`Revenue Dashboard`),Q(`ביצוע מול צינור · 6 חודשים`,`Realised vs. pipeline · last 6 months`)),i=Bm(),a=$(`div`,`cp-kpis`);a.innerHTML=`<div class="cp-kpi"><span class="cp-kpi-val">₪${i.realised.toLocaleString()}</span><span class="cp-kpi-lbl">${Q(`מומש`,`Realised`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">₪${i.pipeline.toLocaleString()}</span><span class="cp-kpi-lbl">${Q(`צינור`,`Pipeline`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${Math.round(i.winRate*100)}%</span><span class="cp-kpi-lbl">${Q(`אחוז סגירה`,`Win rate`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${i.openLeads}</span><span class="cp-kpi-lbl">${Q(`לידים פתוחים`,`Open leads`)}</span></div>`,r.appendChild(a);let o=i.byMonth.map(e=>e.total);if(o.some(e=>e>0)){let e=$(`div`,``);e.style.cssText=`margin:8px 0;display:flex;align-items:center;gap:12px`,e.innerHTML=`<span style="font-size:11px;color:var(--dim)">${Q(`מגמת 6 חודשים`,`6-month trend`)}</span>${av(o,{width:160,height:36,showDots:!0})}`,r.appendChild(e)}let s=Math.max(1,...i.byMonth.map(e=>e.total)),c=$(`div`,`cp-chart`);i.byMonth.forEach(e=>{let t=$(`div`,`cp-bar`),n=$(`div`,`cp-bar-fill`);n.style.height=`${Math.max(3,e.total/s*100)}%`,t.appendChild(n),t.appendChild($(`span`,`cp-bar-lbl`,e.month.slice(5))),t.title=`${e.month}: ₪${e.total.toLocaleString()}`,c.appendChild(t)}),r.appendChild(c);let l=by(Q(`תובנות הכנסה AI`,`AI revenue insights`));l.onclick=()=>{t.ask(`Act as my business CFO. Here are my numbers: realised revenue ₪${i.realised.toLocaleString()}, open pipeline ₪${i.pipeline.toLocaleString()}, win rate ${Math.round(i.winRate*100)}%, ${i.openLeads} open leads, last 6 months: ${i.byMonth.map(e=>e.month+`=₪`+e.total).join(`, `)}. Give me 3 concrete actions to grow revenue this month.`),n()},r.appendChild(l),e.appendChild(r);let u=Vm();if(u.length){let t=vy(Q(`⏰ מעקבים ממתינים`,`⏰ Follow-ups due`),`${u.length} ${Q(`לידים לטיפול`,`lead(s) need a touch`)}`),n=$(`div`,`cp-list`);u.forEach(e=>{let t=$(`div`,`cp-row`);if(t.innerHTML=`<span class="cp-row-main">${gy(e.name||`Lead`)}</span><span class="cp-row-sub">${gy(e.vehicle||e.service||``)}</span><span class="cp-row-tag" style="color:#ff5d73">${gy(e.followUp)}</span>`,e.phone){let n=$(`a`,`cp-x`);n.textContent=`📞`,n.href=`tel:${e.phone}`,t.appendChild(n)}n.appendChild(t)}),t.appendChild(n),e.appendChild(t)}let d=vy(Q(`צינור מכירות`,`Sales Pipeline`),Q(`עקוב אחרי כל ליד מהשיחה הראשונה`,`Track every lead from first call to win`)),f=xy(Q(`לקוח / חברה`,`Customer / company`)),p=xy(Q(`טלפון`,`Phone`)),m=xy(Q(`רכב — למשל Scania R450`,`Vehicle — e.g. Scania R450`)),h=xy(Q(`שירות — למשל מצלמה 360° + גשש`,`Service — e.g. 360° camera + tracker`)),g=xy(Q(`שווי עסקה (₪)`,`Deal value (₪)`)),_=$(`input`,`cp-input`);_.type=`date`;let v=by(Q(`הוסף ליד`,`Add lead`),!0),y=$(`div`,`cp-list`),b={lead:`→ Contacted`,contacted:`→ Quoted`,quoted:`→ Won`,won:`Won ✓`,lost:`Lost`},x=()=>{y.innerHTML=``;let r=Am();if(!r.length){y.appendChild($(`div`,`cp-empty`,Q(`אין לידים עדיין. הוסף את הראשון למעלה.`,`No leads yet. Add your first above.`)));return}r.forEach(r=>{let i=$(`div`,`cp-row`),a=km(r.status);if(i.innerHTML=`<span class="cp-row-main">${gy(r.name||`Lead`)}`+(r.value?` <span class="cp-row-sub">₪${r.value.toLocaleString()}</span>`:``)+`</span><span class="cp-row-tag" style="color:hsl(${a},70%,60%)">${gy(Om(r.status))}</span>`,r.status!==`won`&&r.status!==`lost`){let a=$(`button`,`cp-x`);a.textContent=b[r.status],a.style.color=`var(--cyan)`,a.style.fontSize=`11px`,a.onclick=()=>{Fm(r.id),x(),e.replaceChildren(),Cy(e,t,n)},i.appendChild(a)}if(r.status!==`lost`&&r.status!==`won`){let e=$(`button`,`cp-x`,`✕`);e.title=`Mark lost`,e.onclick=()=>{Nm(r.id,{status:`lost`}),x()},i.appendChild(e)}let o=$(`button`,`cp-x`,`🗑`);o.title=`Delete`,o.onclick=()=>{Pm(r.id),x()},i.appendChild(o),y.appendChild(i)})};v.onclick=()=>{!f.value.trim()&&!p.value.trim()||(Mm({name:f.value.trim(),phone:p.value.trim(),vehicle:m.value.trim(),service:h.value.trim(),value:parseFloat(g.value)||0,followUp:_.value}),[f,p,m,h,g].forEach(e=>e.value=``),_.value=``,e.replaceChildren(),Cy(e,t,n))},d.appendChild(yy(Q(`לקוח`,`Customer`),f));let S=$(`div`,`cp-inline`);S.append(p,g),d.appendChild(S),d.appendChild(yy(Q(`רכב`,`Vehicle`),m)),d.appendChild(yy(Q(`שירות`,`Service`),h)),d.appendChild(yy(Q(`מעקב הבא`,`Next follow-up`),_)),d.appendChild(v),d.appendChild(y),x(),e.appendChild(d);let C=vy(Q(`הצעות מחיר`,`Quotes`),Q(`הצעות שמורות · עדכן סטטוס`,`Saved quotes · update status to feed revenue`)),w=$(`div`,`cp-list`),T=()=>{w.innerHTML=``;let r=Im();if(!r.length){w.appendChild($(`div`,`cp-empty`,Q(`אין הצעות עדיין. צור אחת למטה.`,`No quotes yet. Create one below.`)));return}r.slice(0,15).forEach(r=>{let i=$(`div`,`cp-row`),a={draft:200,sent:45,accepted:140,rejected:0}[r.status]??200;i.innerHTML=`<span class="cp-row-main">${gy(r.customer||`Customer`)} <span class="cp-row-sub">₪${(r.total||0).toLocaleString()}</span></span>`;let o=$(`select`,`cp-mini-sel`);[`draft`,`sent`,`accepted`,`rejected`].forEach(e=>{let t=$(`option`);t.value=e,t.textContent=e,r.status===e&&(t.selected=!0),o.appendChild(t)}),o.style.color=`hsl(${a},70%,60%)`,o.onchange=()=>{Rm(r.id,o.value),e.replaceChildren(),Cy(e,t,n)},i.appendChild(o);let s=$(`button`,`cp-x`,`✕`);s.onclick=()=>{zm(r.id),T()},i.appendChild(s),w.appendChild(i)})};C.appendChild(w),T(),e.appendChild(C);let E=vy(Q(`חשבוניות`,`Invoices`),Q(`חשבוניות מקצועיות כולל מע"מ`,`Professional invoices with VAT`)),D=Uh(),O=$(`div`,`cp-kpis`);O.innerHTML=`<div class="cp-kpi"><span class="cp-kpi-val">${D.total}</span><span class="cp-kpi-lbl">${Q(`סה"כ`,`Total`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${D.paid}</span><span class="cp-kpi-lbl">${Q(`שולם`,`Paid`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${D.outstanding}</span><span class="cp-kpi-lbl">${Q(`ממתין`,`Outstanding`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">₪${D.revenue.toLocaleString()}</span><span class="cp-kpi-lbl">${Q(`הכנסה`,`Revenue`)}</span></div>`,E.appendChild(O);let k=xy(Q(`שם לקוח *`,`Customer name *`)),A=xy(Q(`טלפון (לוואטסאפ)`,`Phone (WhatsApp)`));A.type=`tel`;let ee=Sy(Q(`פריט בכל שורה — פורמטים אפשריים:
מצלמה 360° - 4500
התקנה 800
שירות x2 - 350`,`One item per line — accepted formats:
360° camera - 4500
Installation 800
Service x2 - 350`),4),te=xy(Q(`הערות (אופציונלי)`,`Notes (optional)`)),j=by(Q(`💾 שמור חשבונית`,`💾 Save invoice`),!0),ne=$(`div`,`cp-note`),M=$(`div`,`cp-list`);function N(e){let t=e.match(/^(.+?)[\-\:]\s*([\d,\.]+)\s*(?:x\s*(\d+))?$/i);if(t)return{description:t[1].trim(),price:parseFloat(t[2].replace(/,/g,``))||0,qty:parseInt(t[3]||`1`)||1};let n=e.match(/^(.*?)\s*(?:x\s*(\d+))?\s*([\d,\.]+)\s*[₪$]?\s*$/i);return n&&n[3]?{description:(n[1]||e).trim(),price:parseFloat(n[3].replace(/,/g,``))||0,qty:parseInt(n[2]||`1`)||1}:{description:e.trim(),price:0,qty:1}}function re(e){let t=e.items.map(e=>`• ${e.description}${e.qty>1?` x${e.qty}`:``} — ₪${(e.price*e.qty).toLocaleString()}`).join(`
`);return encodeURIComponent(`חשבונית ${e.number} — ${e.customer}\nתאריך: ${e.date}\n\n${t}\n\nלפני מע"מ: ₪${e.subtotal.toLocaleString()}\nמע"מ (17%): ₪${e.tax.toLocaleString()}\nסה"כ לתשלום: ₪${e.total.toLocaleString()}`+(e.notes?`\n\n${e.notes}`:``))}let ie=()=>{M.innerHTML=``;let e=Nh();if(!e.length){M.appendChild($(`div`,`cp-empty`,Q(`אין חשבוניות עדיין.`,`No invoices yet.`)));return}e.forEach(e=>{let t={draft:200,sent:45,paid:140,overdue:0}[e.status]??200,n={draft:Q(`טיוטה`,`Draft`),sent:Q(`נשלח`,`Sent`),paid:Q(`שולם`,`Paid`),overdue:Q(`באיחור`,`Overdue`)}[e.status]??e.status,r=$(`div`,`cp-row`);r.style.cssText=`flex-direction:column;align-items:stretch;gap:6px;padding:12px`,r.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600;font-size:13px">${gy(e.number)} · ${gy(e.customer)}</span><span style="font-size:18px;font-weight:700;color:var(--gold)">₪${e.total.toLocaleString()}</span></div><div style="display:flex;gap:8px;align-items:center;font-size:12px;color:var(--dim)"><span>${e.date}</span><span style="padding:2px 8px;border-radius:20px;background:hsl(${t},60%,20%);color:hsl(${t},70%,65%)">${n}</span>`+(e.items.length?`<span>${e.items.map(e=>e.description.slice(0,18)).join(` · `)}</span>`:``)+`</div><div style="display:flex;gap:6px;flex-wrap:wrap">`;let i=r.querySelector(`div:last-child`),a=$(`select`,`cp-mini-sel`);[`draft`,`sent`,`paid`,`overdue`].forEach(t=>{let n=$(`option`);n.value=t,n.textContent={draft:Q(`טיוטה`,`Draft`),sent:Q(`נשלח`,`Sent`),paid:Q(`שולם`,`Paid`),overdue:Q(`באיחור`,`Overdue`)}[t],e.status===t&&(n.selected=!0),a.appendChild(n)}),a.style.color=`hsl(${t},70%,60%)`,a.onchange=()=>{Lh(e.id,a.value),ie()},i.appendChild(a);let o=$(`button`,`cp-x`,`📄`);o.title=Q(`הדפס / PDF`,`Print / PDF`),o.onclick=()=>Bh(e),i.appendChild(o);let s=re(e),c=e.phone?`https://wa.me/${e.phone.replace(/\D/g,``).replace(/^0/,`972`)}?text=${s}`:`https://wa.me/?text=${s}`,l=$(`button`,`cp-x`,`💬`);l.title=Q(`שלח בוואטסאפ`,`Send via WhatsApp`),l.onclick=()=>{window.open(c,`_blank`)},i.appendChild(l);let u=$(`button`,`cp-x`,`🖼`);u.title=Q(`שמור כתמונה + וואטסאפ`,`Save image + WhatsApp`),u.onclick=()=>Hh(e),i.appendChild(u);let d=$(`button`,`cp-x`,`✕`);d.onclick=()=>{confirm(Q(`למחוק חשבונית זו?`,`Delete this invoice?`))&&(Rh(e.id),ie())},i.appendChild(d),M.appendChild(r)})};j.onclick=()=>{if(ne.textContent=``,ne.style.color=`#ff5d73`,!k.value.trim()){ne.textContent=Q(`⚠ הכנס שם לקוח.`,`⚠ Enter a customer name.`);return}let e=ee.value.split(`
`).map(e=>e.trim()).filter(Boolean);if(!e.length){ne.textContent=Q(`⚠ הוסף לפחות פריט אחד.`,`⚠ Add at least one item.`);return}let t=e.map(N).filter(e=>e.description);if(!t.length){ne.textContent=Q(`⚠ לא ניתן לפרסר. דוגמה: מצלמה 360 - 4500`,`⚠ Cannot parse. Example: Camera - 4500`);return}if(t.every(e=>e.price===0)){ne.textContent=Q(`⚠ כל הפריטים במחיר 0. דוגמה: מצלמה 360 - 4500`,`⚠ All items are ₪0. Example: Camera - 4500`);return}try{let e=Ih(k.value.trim(),t,{notes:te.value.trim(),phone:A.value.trim()});k.value=``,A.value=``,ee.value=``,te.value=``,ne.style.color=`#4caf50`,ne.textContent=Q(`✓ חשבונית ${e.number} נשמרה! (סה"כ ₪${e.total.toLocaleString()})`,`✓ Invoice ${e.number} saved! (Total ₪${e.total.toLocaleString()})`),ie();let n=re(e),r=e.phone.replace(/\D/g,``).replace(/^0/,`972`),i=r.length>=10?`https://wa.me/${r}?text=${n}`:`https://wa.me/?text=${n}`;setTimeout(()=>{confirm(Q(`לשלוח את החשבונית בוואטסאפ עכשיו?`,`Send invoice via WhatsApp now?`))&&window.open(i,`_blank`)},200)}catch{ne.textContent=Q(`שגיאה בשמירה — נסה שוב`,`Save error — try again`)}},E.appendChild(yy(Q(`לקוח`,`Customer`),k)),E.appendChild(yy(Q(`טלפון`,`Phone`),A)),E.appendChild(yy(Q(`פריטים`,`Items`),ee)),E.appendChild(yy(Q(`הערות`,`Notes`),te)),E.appendChild(j),E.appendChild(ne),E.appendChild(M),ie(),e.appendChild(E);let ae=vy(Q(`מנוע שיווק`,`Marketing Engine`),Q(`תוכן ויראלי AI לטיקטוק / פייסבוק`,`AI viral content for TikTok / Facebook`)),oe=xy(Q(`נושא — למשל התקנת מצלמה 360° על סקאניה`,`Topic — e.g. 360° camera install on a Scania`)),P=$(`select`,`cp-input`);[`TikTok`,`Facebook`,`Instagram Reels`].forEach(e=>{let t=$(`option`);t.value=e,t.textContent=e,P.appendChild(t)});let se=$(`select`,`cp-input`);[`Go viral`,`Generate leads`,`Build trust`,`Showcase a job`].forEach(e=>{let t=$(`option`);t.value=e,t.textContent=e,se.appendChild(t)});let ce=by(Q(`צור אסטרטגיית תוכן`,`Generate content strategy`),!0);ce.onclick=()=>{let e=oe.value.trim()||`360° truck camera installation`,r=`Act as a viral social media strategist for a heavy-vehicle safety installation business. Platform: ${P.value}. Goal: ${se.value}. Topic: "${e}". Give me: 1) a 3-second hook, 2) a short punchy caption, 3) a shot-list for a 15-30s video, 4) 12 optimized hashtags. Keep it tight and ready to post.`;t.ask(r),n()},ae.appendChild(yy(Q(`נושא`,`Topic`),oe)),ae.appendChild(yy(Q(`פלטפורמה`,`Platform`),P)),ae.appendChild(yy(Q(`מטרה`,`Goal`),se)),ae.appendChild(ce),e.appendChild(ae);let F=vy(Q(`הצעה מהירה`,`Quick Quote`),Q(`הצעת מחיר → נשמר ל-HeavyGuard`,`Natural-language quote → saved to HeavyGuard`)),le=xy(Q(`שם לקוח`,`Customer name`)),ue=xy(Q(`טלפון`,`Phone`)),de=Sy(`One per line — e.g.
360 camera system: 4500
Installation: 800`,4),fe=by(Q(`צור הצעה`,`Create quote`),!0),pe=$(`div`,`cp-note`);fe.onclick=()=>{let e=de.value.split(`
`).map(e=>e.trim()).filter(Boolean).map(e=>{let[t,n]=e.split(`:`);return{description:(t||``).trim(),price:parseFloat(n)||0,qty:1}}).filter(e=>e.description);if(!e.length){pe.textContent=Q(`הוסף לפחות שורה אחת.`,`Add at least one line item.`);return}let n=e.reduce((e,t)=>e+t.price,0),r={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),customer:le.value.trim(),phone:ue.value.trim(),items:e,total:n,date:new Date().toISOString().slice(0,10),status:`draft`,ts:Date.now()},i=[];try{i=JSON.parse(localStorage.getItem(`hg2:quotes`)||`[]`)}catch{}i.unshift(r),localStorage.setItem(`hg2:quotes`,JSON.stringify(i)),pe.textContent=`✅ Quote for ${r.customer||`customer`} — ₪${n.toLocaleString()} saved.`,t.addMsgSys(`הצעת מחיר נשמרה: ${r.customer||`לקוח`} · ₪${n.toLocaleString()}`),le.value=``,ue.value=``,de.value=``},F.appendChild(yy(Q(`לקוח`,`Customer`),le)),F.appendChild(yy(Q(`טלפון`,`Phone`),ue)),F.appendChild(yy(Q(`פריטים`,`Line items`),de)),F.appendChild(fe),F.appendChild(pe),e.appendChild(F);let I=vy(Q(`אנשי קשר`,`Contacts`),Q(`אנשים וחברות שאתה עובד איתם`,`People & companies you work with`)),L=()=>{let e=Gh(),t=``;t=e.length?e.slice(0,20).map(e=>{let t=e.tags.length?e.tags.map(e=>`<span class="cp-row-tag">${gy(e)}</span>`).join(` `):``;return`<div class="cp-row" data-cid="${e.id}">
          <span class="cp-row-main">${e.starred?`★ `:``}${gy(e.name||`Unnamed`)}</span>
          <span class="cp-row-sub">${gy(e.phone)}${e.company?` · `+gy(e.company):``}</span>
          ${t}
          <button class="cp-row-del" data-del="${e.id}">✕</button>
        </div>`}).join(``):`<div class="cp-note" style="text-align:center;padding:16px;color:var(--dim)">${Q(`אין אנשי קשר עדיין. הוסף את הראשון למטה.`,`No contacts yet. Add your first one below.`)}</div>`,me.innerHTML=t,me.querySelectorAll(`[data-del]`).forEach(e=>{e.onclick=t=>{t.stopPropagation(),Jh(e.dataset.del),L()}})},me=$(`div`,`cp-list`);I.appendChild(me);let he=xy(Q(`שם`,`Name`)),ge=xy(Q(`טלפון`,`Phone`)),_e=xy(Q(`חברה`,`Company`)),ve=xy(Q(`תגיות (מופרדות בפסיק)`,`Tags (comma separated)`)),ye=by(Q(`הוסף איש קשר`,`Add contact`),!0);ye.onclick=()=>{!he.value.trim()&&!ge.value.trim()||(qh({name:he.value.trim(),phone:ge.value.trim(),company:_e.value.trim(),tags:ve.value.split(`,`).map(e=>e.trim()).filter(Boolean)}),he.value=``,ge.value=``,_e.value=``,ve.value=``,L(),t.addMsgSys(`Contact added: ${he.value||ge.value}`))},I.appendChild(yy(Q(`שם`,`Name`),he)),I.appendChild(yy(Q(`טלפון`,`Phone`),ge)),I.appendChild(yy(Q(`חברה`,`Company`),_e)),I.appendChild(yy(Q(`תגיות`,`Tags`),ve)),I.appendChild(ye),L(),e.appendChild(I);let R=vy(Q(`אנליטיקה`,`Analytics`),Q(`מגמות ותובנות`,`Trends and insights`)),be=Yg(),xe=Xg(),Se=Math.max(1,...be.map(e=>e.value)),Ce=Math.max(1,...xe.map(e=>e.value)),z=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">`;z+=`<div><div class="cp-card-sub" style="margin-bottom:8px">${Q(`מגמת הכנסה`,`Revenue trend`)}</div><div class="cp-chart">`,be.forEach(e=>{let t=Math.max(3,e.value/Se*100);z+=`<div class="cp-bar"><div class="cp-bar-fill" style="height:${t}%"></div><span class="cp-bar-lbl">${e.label}</span></div>`}),z+=`</div></div>`,z+=`<div><div class="cp-card-sub" style="margin-bottom:8px">${Q(`מגמת הוצאות`,`Expense trend`)}</div><div class="cp-chart">`,xe.forEach(e=>{let t=Math.max(3,e.value/Ce*100);z+=`<div class="cp-bar"><div class="cp-bar-fill" style="height:${t}%;background:linear-gradient(180deg,#ff5d73,#c94455)"></div><span class="cp-bar-lbl">${e.label}</span></div>`}),z+=`</div></div></div>`;let we=Qg();if(we.length){z+=`<div style="margin-top:12px"><div class="cp-card-sub" style="margin-bottom:8px">${Q(`הוצאות לפי קטגוריה`,`Expenses by category`)}</div>`;let e=Math.max(1,we[0]?.total||1);we.slice(0,6).forEach(t=>{let n=Math.round(t.total/e*100);z+=`<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <span style="width:80px;font-size:12px;color:var(--dim)">${gy(t.category)}</span>
        <div style="flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:3px"><div style="height:100%;width:${n}%;background:var(--gold);border-radius:3px"></div></div>
        <span style="font-size:12px;color:var(--ink)">₪${t.total.toLocaleString()}</span>
      </div>`}),z+=`</div>`}let Te=Zg(),B=$g();z+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px">`,z+=`<div class="cp-kpi"><span class="cp-kpi-val">${Te.rate}%</span><span class="cp-kpi-lbl">${Q(`השלמת משימות`,`Task completion`)}</span></div>`,B.length&&(z+=`<div class="cp-kpi"><span class="cp-kpi-val">${B.map(e=>`${e.count} ${e.status}`).join(`, `)}</span><span class="cp-kpi-lbl">${Q(`לידים לפי סטטוס`,`Leads by status`)}</span></div>`),z+=`</div>`;let Ee=be.map(e=>e.value),De=xe.map(e=>e.value);(Ee.some(e=>e>0)||De.some(e=>e>0))&&(z+=`<div style="display:flex;gap:16px;margin-top:12px;align-items:center">`,Ee.some(e=>e>0)&&(z+=`<div style="display:flex;align-items:center;gap:6px"><span style="font-size:11px;color:var(--dim)">Rev</span>${av(Ee,{width:80,height:24})}</div>`),De.some(e=>e>0)&&(z+=`<div style="display:flex;align-items:center;gap:6px"><span style="font-size:11px;color:var(--dim)">Exp</span>${av(De,{width:80,height:24,stroke:`#ff5d73`,fill:`rgba(255,93,115,.15)`})}</div>`),z+=`<div>${ov(Te.rate,{size:36})}</div>`,z+=`</div>`),R.innerHTML+=z;let Oe=by(Q(`תדריך יומי AI`,`AI Daily Briefing`));Oe.onclick=()=>{t.ask(e_()),n()},R.appendChild(Oe),e.appendChild(R);let V=vy(Q(`תבניות`,`Templates`),Q(`הודעות מוכנות למעקבים ומיילים`,`Pre-built messages for follow-ups and emails`)),ke=$(`select`,`cp-input`);[`follow-up`,`email`,`quote`,`general`].forEach(e=>{let t=$(`option`);t.value=e,t.textContent=e.charAt(0).toUpperCase()+e.slice(1),ke.appendChild(t)});let H=$(`div`,`cp-list`),U=()=>{H.innerHTML=``;let e=fv(ke.value);if(!e.length){H.appendChild($(`div`,`cp-empty`,Q(`אין תבניות בקטגוריה זו.`,`No templates in this category.`)));return}e.forEach(e=>{let r=$(`div`,`cp-row`);r.style.cursor=`pointer`,r.innerHTML=`<span class="cp-row-main">${gy(e.name)}</span><span class="cp-row-sub">${e.variables.length} fields</span>`;let i=$(`button`,`cp-x`,`▶`);if(i.title=`Use template`,i.onclick=r=>{r.stopPropagation();let i={};for(let t of e.variables){let e=prompt(`${t}:`);if(e===null)return;i[t]=e}let a=_v(e.id,i);t.ask(`Here's a message I need you to review, improve, and format nicely:\n\n${a}`),n()},r.appendChild(i),e.id.startsWith(`tpl_`)){let t=$(`button`,`cp-x`,`✕`);t.onclick=t=>{t.stopPropagation(),hv(e.id),U()},r.appendChild(t)}H.appendChild(r)})};ke.onchange=()=>U(),V.appendChild(yy(Q(`קטגוריה`,`Category`),ke)),V.appendChild(H),U();let Ae=xy(Q(`שם תבנית`,`Template name`)),je=Sy(Q(`גוף תבנית — השתמש ב-{{משתנה}} לשדות`,`Template body — use {{variable}} for fields`),3),Me=by(Q(`שמור תבנית מותאמת`,`Save custom template`));Me.onclick=()=>{!Ae.value.trim()||!je.value.trim()||(mv(Ae.value.trim(),ke.value,je.value),Ae.value=``,je.value=``,U())},V.appendChild(yy(Q(`תבנית חדשה`,`New template`),Ae)),V.appendChild(je),V.appendChild(Me),e.appendChild(V)}function wy(e,t,n){let r=vy(Q(`שוק חי`,`Live Market`),Q(`פיד מחירים ציבורי · Binance`,`Public price feed · Binance`)),i=xy(Q(`סמל — למשל BTCUSDT`,`Symbol — e.g. BTCUSDT`),`BTCUSDT`),a=$(`div`,`cp-bignum`,`—`),o=by(Q(`קבל מחיר`,`Get price`)),s=by(Q(`אוטומטי ⟳`,`Auto ⟳`)),c=null,l=async()=>{a.textContent=`…`;try{let e=await(await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(i.value.trim().toUpperCase())}`)).json();if(e.lastPrice){let t=parseFloat(e.priceChangePercent);a.innerHTML=`$${parseFloat(e.lastPrice).toLocaleString()} <span class="cp-chg ${t>=0?`up`:`down`}">${t>=0?`▲`:`▼`} ${Math.abs(t).toFixed(2)}%</span>`}else a.textContent=Q(`סמל לא נמצא`,`Symbol not found`)}catch{a.textContent=Q(`פיד לא זמין`,`Feed unavailable`)}};o.onclick=l,s.onclick=()=>{c?(clearInterval(c),c=null,s.classList.remove(`on`)):(l(),c=setInterval(l,5e3),s.classList.add(`on`))};let u=$(`div`,`cp-inline`);u.append(o,s),r.appendChild(yy(Q(`סמל`,`Symbol`),i)),r.appendChild(a),r.appendChild(u),e.appendChild(r);let d=vy(Q(`התראות מחיר`,`Price Alerts`),Q(`התראות אוטומטיות בחציית סף`,`Proactive notifications on threshold cross`)),f=xy(Q(`סמל`,`Symbol`),`BTCUSDT`),p=xy(Q(`התראה מעל ($)`,`Alert above ($)`)),m=xy(Q(`התראה מתחת ($)`,`Alert below ($)`)),h=xy(Q(`הערה (אופציונלי)`,`Note (optional)`)),g=by(Q(`הוסף התראה`,`Add alert`),!0),_=$(`div`,`cp-list`),v=()=>{_.innerHTML=``;let e=j_();if(!e.length){_.appendChild($(`div`,`cp-empty`,Q(`אין התראות.`,`No alerts set.`)));return}e.forEach(e=>{let t=$(`div`,`cp-row`),n=[e.above==null?``:`≥ ${e.above}`,e.below==null?``:`≤ ${e.below}`].filter(Boolean).join(` / `);t.innerHTML=`<span class="cp-row-main">${gy(e.symbol)}</span><span class="cp-row-sub">${gy(n)}${e.fired?` · fired`:``}</span>`;let r=$(`button`,`cp-x`,`✕`);r.onclick=()=>{M_(j_().filter(t=>t.id!==e.id)),v()},t.appendChild(r),_.appendChild(t)})};g.onclick=()=>{let e={id:Date.now().toString(36),symbol:f.value.trim().toUpperCase()||`BTCUSDT`,above:p.value?parseFloat(p.value):void 0,below:m.value?parseFloat(m.value):void 0,note:h.value.trim()};e.above==null&&e.below==null||(M_([...j_(),e]),p.value=``,m.value=``,h.value=``,`Notification`in window&&Notification.permission==="default"&&Notification.requestPermission(),v())},d.appendChild(yy(Q(`סמל`,`Symbol`),f));let y=$(`div`,`cp-inline`);y.append(p,m),d.appendChild(y),d.appendChild(yy(Q(`הערה`,`Note`),h)),d.appendChild(g),d.appendChild(_),v(),e.appendChild(d);let b=vy(Q(`ווב-הוק בוט`,`Bot Webhook`),Q(`הפעל סקריפט מסחר מוגדר`,`Trigger a predefined trading script`)),x=xy(Q(`כתובת Webhook (למשל Replit)`,`Webhook URL (e.g. Replit / TradingView relay)`),localStorage.getItem(`alpha_webhook_url`)||``),S=Sy(`{ "action": "run", "strategy": "alpha-1" }`,3),C=by(Q(`הפעל webhook`,`Trigger webhook`),!0),w=$(`div`,`cp-note`);C.onclick=async()=>{let e=x.value.trim();if(!e){w.textContent=Q(`הכנס כתובת webhook.`,`Enter a webhook URL.`);return}localStorage.setItem(`alpha_webhook_url`,e),w.textContent=`Sending…`;try{let t={};try{t=JSON.parse(S.value||`{}`)}catch{}await fetch(e,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(t)}),w.textContent=`✅ Triggered (response opaque if CORS-restricted).`}catch{w.textContent=`⚠️ Request sent / blocked by CORS. For secure key handling, route through a backend relay.`}},b.appendChild(yy(Q(`כתובת`,`URL`),x)),b.appendChild(yy(Q(`תוכן`,`Payload`),S)),b.appendChild(C),b.appendChild(w),b.appendChild($(`div`,`cp-warn`,`⚠ API keys must never live in the frontend. Point this at a serverless relay (Cloudflare Worker / Replit) that holds the secret and forwards the call.`)),e.appendChild(b);let T=vy(Q(`שווקי חיזוי`,`Prediction Markets`),Q(`ניטור Polymarket`,`Polymarket monitor`)),E=by(Q(`נתח שוק`,`Analyze a market`),!0);E.onclick=()=>{t.ask(`Act as a prediction-markets analyst. Explain how to monitor a Polymarket market for significant probability shifts and what thresholds are worth an alert.`),n()},T.appendChild(E),e.appendChild(T)}function Ty(e,t,n){let r=vy(Q(`סטודיו מילים`,`Lyrics Studio`),Q(`מבנה ראפ / היפ-הופ · נשמר אוטומטית`,`Rap / hip-hop structure · auto-saved`)),i=$(`div`,`cp-inline cp-wrap`),a=Sy(`Drop your bars here…`,12);a.value=localStorage.getItem(`alpha_lyrics`)||``,a.oninput=()=>localStorage.setItem(`alpha_lyrics`,a.value),[`[Intro]`,`[Verse]`,`[Hook]`,`[Bridge]`,`[Outro]`].forEach(e=>{let t=by(e);t.onclick=()=>{let t=a.selectionStart;a.value=a.value.slice(0,t)+`\n${e}\n`+a.value.slice(t),localStorage.setItem(`alpha_lyrics`,a.value),a.focus()},i.appendChild(t)}),r.appendChild(i),r.appendChild(a);let o=$(`div`,`cp-inline`),s=by(Q(`כתיבה משותפת AI`,`AI co-write`),!0);s.onclick=()=>{let e=a.value.trim();t.ask(`Act as an elite rap lyricist. Here are my lyrics:\n\n${e||`(empty — start me off)`}\n\nKeep my voice and theme. Improve the flow, add internal rhyme, and write the next 8 bars in the same style.`),n()};let c=by(Q(`לטש חרוזים`,`Polish rhymes`));c.onclick=()=>{t.ask(`Tighten the rhyme scheme and flow of these lyrics without changing the meaning:\n\n${a.value.trim()}`),n()},o.append(s,c),r.appendChild(o),e.appendChild(r);let l=vy(Q(`פרומפט מוזיקה AI`,`AI Music Prompt`),Q(`ל-Suno / Udio + הערות מאסטרינג`,`For Suno / Udio + mastering notes`)),u=xy(Q(`ז'אנר / ויב — למשל dark trap, 140bpm`,`Genre / vibe — e.g. dark trap, 140bpm, melodic`)),d=by(Q(`צור פרומפט מוזיקה`,`Generate music prompt`),!0);d.onclick=()=>{t.ask(`Create a detailed AI-music-generation prompt (for Suno/Udio) for a ${u.value.trim()||`trap`} track using these lyrics as the hook reference:\n\n${(localStorage.getItem(`alpha_lyrics`)||``).slice(0,600)}\n\nInclude: BPM, key, instrumentation, mood, song structure, and 3 mastering tips for a loud, clean mix.`),n()},l.appendChild(yy(Q(`ז'אנר / ויב`,`Genre / vibe`),u)),l.appendChild(d),e.appendChild(l)}function Ey(e,t,n){let r=a_(),i=vy(Q(`ציון Alpha`,`Alpha Score`),o_(r.total)),a=s_(r.total);i.innerHTML+=`<div style="display:flex;align-items:center;gap:16px;margin:8px 0">
    ${ov(r.total,{size:56,stroke:a,width:4})}
    <div style="flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:4px">
      <div style="font-size:11px;color:var(--dim)">Tasks <span style="color:${a}">${r.tasks}/20</span></div>
      <div style="font-size:11px;color:var(--dim)">Habits <span style="color:${a}">${r.habits}/15</span></div>
      <div style="font-size:11px;color:var(--dim)">Focus <span style="color:${a}">${r.focus}/15</span></div>
      <div style="font-size:11px;color:var(--dim)">Business <span style="color:${a}">${r.business}/20</span></div>
      <div style="font-size:11px;color:var(--dim)">Goals <span style="color:${a}">${r.goals}/15</span></div>
      <div style="font-size:11px;color:var(--dim)">Wellness <span style="color:${a}">${r.wellness}/15</span></div>
    </div>
  </div>`,r.streak>0&&(i.innerHTML+=`<div style="font-size:12px;color:var(--gold);text-align:center">🔥 ${r.streak}-day streak</div>`),e.appendChild(i);let o=vy(Q(`תדריך יומי`,`Daily Briefing`),Q(`היום שלך במבט חטוף`,`Your day at a glance`)),s=new Date().toISOString().slice(0,10),c=Up().filter(e=>e.date===s),l=Jp().filter(e=>!e.done),u=Um(),d=u.filter(Jm).length,f=$(`div`,`cp-kpis`);f.innerHTML=`<div class="cp-kpi"><span class="cp-kpi-val">${c.length}</span><span class="cp-kpi-lbl">${Q(`אירועים היום`,`Events today`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${l.length}</span><span class="cp-kpi-lbl">${Q(`משימות פתוחות`,`Open tasks`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${d}/${u.length}</span><span class="cp-kpi-lbl">${Q(`הרגלים`,`Habits`)}</span></div>`,o.appendChild(f);let p=by(Q(`תדרך אותי על היום`,`Brief me on my day`),!0);p.onclick=()=>{let e=c.map(e=>`${e.time||``} ${e.title}`).join(`; `)||`none`,r=l.slice(0,8).map(e=>e.text).join(`; `)||`none`;t.ask(`Act as my chief of staff. Give me a short, motivating morning briefing for today. Events: ${e}. Open tasks: ${r}. Habits done: ${d}/${u.length}. Prioritise what matters and suggest the single most important focus for today.`),n()},o.appendChild(p),e.appendChild(o);let m=vy(Q(`משימות`,`Tasks`),Q(`משימות מהירות עם עדיפות`,`Quick to-dos with priority`)),h=xy(Q(`מה צריך לעשות?`,`What needs doing?`)),g=$(`select`,`cp-input`);[[`med`,`Medium`],[`high`,`High`],[`low`,`Low`]].forEach(([e,t])=>{let n=$(`option`);n.value=e,n.textContent=t,g.appendChild(n)});let _=by(Q(`הוסף משימה`,`Add task`),!0),v=$(`div`,`cp-list`),y=()=>{v.innerHTML=``;let e=Jp().sort((e,t)=>Number(e.done)-Number(t.done));if(!e.length){v.appendChild($(`div`,`cp-empty`,Q(`אין משימות. הוסף אחת למעלה.`,`No tasks. Add one above.`)));return}e.slice(0,20).forEach(e=>{let t=$(`div`,`cp-row`),n={high:0,med:45,low:200}[e.priority]??45,r=$(`button`,`cp-check`+(e.done?` on`:``),e.done?`✓`:``);r.onclick=()=>{Zp(e.id),y()},t.appendChild(r);let i=$(`span`,`cp-row-main`,gy(e.text));e.done&&(i.style.opacity=`.45`,i.style.textDecoration=`line-through`),t.appendChild(i),t.appendChild($(`span`,`cp-row-tag`,e.priority)).setAttribute(`style`,`color:hsl(${n},70%,60%)`);let a=$(`button`,`cp-x`,`✕`);a.onclick=()=>{Qp(e.id),y()},t.appendChild(a),v.appendChild(t)})};_.onclick=()=>{h.value.trim()&&(Xp(h.value.trim(),g.value),h.value=``,y())},h.addEventListener(`keydown`,e=>{e.key===`Enter`&&_.click()});let b=$(`div`,`cp-inline`);b.append(h,g),m.appendChild(b),m.appendChild(_),m.appendChild(v),y(),e.appendChild(m);let x=vy(Q(`הרגלים`,`Habits`),Q(`בנה רצפים · הקש לסימון היום`,`Build streaks · tap to mark done today`)),S=xy(Q(`הרגל חדש — למשל ספורט, קריאה`,`New habit — e.g. Gym, Read, No sugar`)),C=by(Q(`הוסף הרגל`,`Add habit`),!0),w=$(`div`,`cp-list`),T=()=>{w.innerHTML=``;let e=Um();if(!e.length){w.appendChild($(`div`,`cp-empty`,Q(`אין הרגלים עדיין.`,`No habits yet.`)));return}e.forEach(e=>{let t=$(`div`,`cp-row`),n=Jm(e),r=$(`button`,`cp-check`+(n?` on`:``),n?`✓`:``);r.onclick=()=>{qm(e.id),T()},t.appendChild(r),t.appendChild($(`span`,`cp-row-main`,gy(e.name)));let i=Ym(e);t.appendChild($(`span`,`cp-row-tag`,i>0?`🔥 ${i}d`:`—`));let a=$(`button`,`cp-x`,`✕`);a.onclick=()=>{Km(e.id),T()},t.appendChild(a),w.appendChild(t)})};C.onclick=()=>{S.value.trim()&&(Gm(S.value.trim()),S.value=``,T())},S.addEventListener(`keydown`,e=>{e.key===`Enter`&&C.click()}),x.appendChild(yy(Q(`הרגל`,`Habit`),S)),x.appendChild(C),x.appendChild(w),T(),e.appendChild(x);let E=vy(Q(`הוצאות`,`Expenses`),Q(`החודש · לפי קטגוריה`,`This month · by category`)),D=nh();if(E.appendChild($(`div`,`cp-bignum`,`₪${D.monthTotal.toLocaleString()}`)),D.byCategory.length){let e=Math.max(1,...D.byCategory.map(e=>e.total)),t=$(`div`,`cp-catbars`);D.byCategory.forEach(n=>{let r=$(`div`,`cp-catbar`);r.innerHTML=`<span class="cp-catbar-lbl">${gy(n.category)}</span><div class="cp-catbar-track"><div class="cp-catbar-fill" style="width:${n.total/e*100}%"></div></div><span class="cp-catbar-val">₪${n.total.toLocaleString()}</span>`,t.appendChild(r)}),E.appendChild(t)}let O=xy(Q(`מה — למשל דלק`,`What — e.g. Diesel`)),k=xy(Q(`סכום (₪)`,`Amount (₪)`)),A=$(`select`,`cp-input`);Zm.forEach(e=>{let t=$(`option`);t.value=e,t.textContent=e,A.appendChild(t)});let ee=by(Q(`רשום הוצאה`,`Log expense`),!0),te=$(`div`,`cp-list`),j=()=>{te.innerHTML=``,Qm().slice(0,8).forEach(r=>{let i=$(`div`,`cp-row`);i.innerHTML=`<span class="cp-row-main">${gy(r.label)} <span class="cp-row-sub">${gy(r.category)}</span></span><span class="cp-row-tag">₪${r.amount.toLocaleString()}</span>`;let a=$(`button`,`cp-x`,`✕`);a.onclick=()=>{th(r.id),e.replaceChildren(),Ey(e,t,n)},i.appendChild(a),te.appendChild(i)})};ee.onclick=()=>{let r=parseFloat(k.value);!O.value.trim()||isNaN(r)||(eh(O.value.trim(),r,A.value),e.replaceChildren(),Ey(e,t,n))};let ne=$(`div`,`cp-inline`);ne.append(O,k),E.appendChild(ne),E.appendChild(A),E.appendChild(ee),E.appendChild(te),j(),e.appendChild(E);let M=vy(Q(`משפחה וחיים`,`Family & Life`),Q(`לוח שנה משותף + Google Calendar`,`Shared calendar + Google Calendar`)),N=xy(Q(`אירוע — למשל שיעור שחייה של מאיה`,`Event — e.g. Maya swimming class`)),re=$(`input`,`cp-input`);re.type=`date`;let ie=$(`input`,`cp-input`);ie.type=`time`;let ae=by(Q(`➕ הוסף`,`Add to calendar`),!0),oe=$(`div`,`cp-list`),P=$(`div`,`cp-inline`);P.style.cssText=`gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center;`;let se=$(`span`,``);se.style.cssText=`font-size:11px;color:var(--dim);flex:1;min-width:120px;`;let ce=by(``,!1);ce.style.cssText+=`font-size:12px;padding:6px 12px;`;let F=by(Q(`🔄 סנכרן`,`🔄 Sync Now`),!1);F.style.cssText+=`font-size:12px;padding:6px 12px;`;let le=()=>{let e=iy();se.textContent=e?Q(`מחובר ✓${ay()?`  סונכרן: `+ay().slice(0,10):``}`,`Connected ✓${ay()?`  last: `+ay().slice(0,10):``}`):Q(`לא מחובר ל-Google Calendar`,`Not connected to Google Calendar`),ce.textContent=e?Q(`🔌 התנתק`,`🔌 Disconnect`):Q(`🔗 חבר Google Calendar`,`🔗 Connect Google Calendar`),F.style.display=e?``:`none`};le(),ce.onclick=async()=>{if(iy()){oy(),le();return}ce.textContent=Q(`מתחבר…`,`Connecting…`);try{await cy()||(se.textContent=Q(`חיבור נכשל`,`Connection failed`))}catch(e){se.textContent=e.message===`NO_CLIENT_ID`?Q(`הכנס Client ID של Google בהגדרות הסנכרון`,`Enter Google Client ID in sync settings`):Q(`שגיאה: `+e.message,`Error: `+e.message)}le()},F.onclick=async()=>{F.textContent=Q(`מסנכרן…`,`Syncing…`),F.setAttribute(`disabled`,``);let e=await fy(e=>{se.textContent=e});F.textContent=Q(`🔄 סנכרן`,`🔄 Sync Now`),F.removeAttribute(`disabled`),e.ok?(se.textContent=Q(`✓ סונכרן — ↑${e.pushed} ↓${e.pulled}`,`✓ Synced — ↑${e.pushed} pushed ↓${e.pulled} pulled`),ue()):se.textContent=Q(`שגיאה: `+e.error,`Error: `+e.error),le()},P.append(se,ce,F),M.appendChild(P);let ue=()=>{oe.innerHTML=``;let e=new Date().toISOString().slice(0,10),t=Up().filter(t=>t.date>=e).slice(0,10);if(!t.length){oe.appendChild($(`div`,`cp-empty`,Q(`אין אירועים קרובים.`,`Nothing upcoming.`)));return}t.forEach(e=>{let t=$(`div`,`cp-row`);t.style.gap=`6px`;let n=$(`span`,`cp-row-main`,gy(e.title)),r=$(`span`,`cp-row-tag`,gy(e.date)+(e.time?` `+gy(e.time):``)),i=$(`a`,``);i.setAttribute(`href`,py(e.title,e.date,e.time)),i.setAttribute(`target`,`_blank`),i.setAttribute(`rel`,`noopener`),i.setAttribute(`title`,Q(`פתח ב-Google Calendar`,`Open in Google Calendar`)),i.style.cssText=`color:var(--dim);font-size:13px;text-decoration:none;opacity:.6;cursor:pointer;transition:opacity .2s;flex-shrink:0;`,i.textContent=`📅`,i.onmouseenter=()=>{i.style.opacity=`1`},i.onmouseleave=()=>{i.style.opacity=`.6`},t.append(n,r,i),oe.appendChild(t)})};ae.onclick=()=>{!N.value.trim()||!re.value||(Kp(N.value.trim(),re.value,ie.value),N.value=``,ue())},M.appendChild(yy(Q(`אירוע`,`Event`),N));let de=$(`div`,`cp-inline`);de.append(re,ie),M.appendChild(de),M.appendChild(ae),M.appendChild(oe),ue(),e.appendChild(M);let fe=vy(Q(`טיימר מיקוד`,`Focus Timer`),Q(`טכניקת פומודורו · 25 דקות עבודה / 5 דקות הפסקה`,`Pomodoro technique · 25 min work / 5 min break`)),pe=oh(),I=sh(),L=$(`div`,`cp-kpis`);L.innerHTML=`<div class="cp-kpi"><span class="cp-kpi-val">${pe.completed}</span><span class="cp-kpi-lbl">${Q(`היום`,`Today`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${pe.focusMin}m</span><span class="cp-kpi-lbl">${Q(`מיקוד`,`Focus`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${I.totalSessions}</span><span class="cp-kpi-lbl">${Q(`השבוע`,`This week`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${I.streak}d</span><span class="cp-kpi-lbl">${Q(`רצף`,`Streak`)}</span></div>`,fe.appendChild(L);let me=$(`div`,`cp-bignum`,`25:00`);me.style.textAlign=`center`,fe.appendChild(me);let he=null,ge=1500,_e=!1,ve=$(`div`,`cp-inline`);ve.style.justifyContent=`center`;let ye=by(Q(`התחל מיקוד`,`Start focus`),!0),R=by(Q(`איפוס`,`Reset`)),be=()=>{let e=Math.floor(ge/60),t=ge%60;me.textContent=`${String(e).padStart(2,`0`)}:${String(t).padStart(2,`0`)}`,_e?me.style.color=`var(--cyan)`:me.style.color=`var(--ink)`};ye.onclick=()=>{if(he){clearInterval(he),he=null,ye.textContent=_e?`Start break`:`Start focus`;return}ye.textContent=`Pause`,he=setInterval(()=>{ge--,be(),ge<=0&&(clearInterval(he),he=null,_e?(_e=!1,ge=1500,ye.textContent=`Start focus`,t.addMsgSys(`☕ Break over! Ready for another round?`)):(ah(),t.addMsgSys(`🍅 Focus session complete! Take a break.`),_e=!0,ge=300,ye.textContent=`Start break`),be(),e.replaceChildren(),Ey(e,t,n))},1e3)},R.onclick=()=>{he&&=(clearInterval(he),null),_e=!1,ge=1500,ye.textContent=`Start focus`,be()},ve.append(ye,R),fe.appendChild(ve),e.appendChild(fe);let xe=vy(Q(`מעקב זמן`,`Time Tracker`),Q(`מעקב שעות על פרויקטים`,`Track hours on projects`)),Se=ag(),Ce=og(),z=$(`div`,`cp-kpis`);z.innerHTML=`<div class="cp-kpi"><span class="cp-kpi-val">${sg(Se.total)}</span><span class="cp-kpi-lbl">${Q(`היום`,`Today`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${sg(Ce.total)}</span><span class="cp-kpi-lbl">${Q(`השבוע`,`This week`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${Se.byProject.length}</span><span class="cp-kpi-lbl">${Q(`פרויקטים`,`Projects`)}</span></div>`,xe.appendChild(z);let we=tg(),Te=xy(we?we.project:`Project name`),B=xy(`Description (optional)`),Ee=by(we?Q(`עצור מעקב`,`Stop tracking`):Q(`התחל מעקב`,`Start tracking`),!0);if(we){let e=Math.round((Date.now()-we.startTime)/6e4);xe.appendChild($(`div`,`cp-bignum`,`${sg(e)} running`)),Te.value=we.project,Te.disabled=!0}Ee.onclick=()=>{if(tg()){let e=rg();e&&t.addMsgSys(`⏱️ Tracked ${sg(e.duration)} on ${e.project}`)}else{if(!Te.value.trim())return;ng(Te.value.trim(),B.value.trim())}e.replaceChildren(),Ey(e,t,n)},xe.appendChild(yy(Q(`פרויקט`,`Project`),Te)),xe.appendChild(yy(Q(`תיאור`,`Description`),B)),xe.appendChild(Ee);let De=$(`div`,`cp-list`),Oe=$h().slice(0,10);Oe.forEach(r=>{let i=$(`div`,`cp-row`);i.innerHTML=`<span class="cp-row-main">${gy(r.project)}</span><span class="cp-row-sub">${r.description||r.date}</span><span class="cp-row-tag">${sg(r.duration)}</span>`;let a=$(`button`,`cp-x`,`✕`);a.onclick=()=>{ig(r.id),e.replaceChildren(),Ey(e,t,n)},i.appendChild(a),De.appendChild(i)}),!Oe.length&&!we&&De.appendChild($(`div`,`cp-empty`,Q(`אין רשומות זמן עדיין.`,`No time entries yet.`))),xe.appendChild(De),e.appendChild(xe);let V=vy(Q(`בריאות`,`Wellness`),Q(`מצב רוח · אנרגיה · מים · שינה`,`Mood · Energy · Water · Sleep`)),ke=hh(),H=gh(),U=$(`div`,`cp-kpis`);U.innerHTML=`<div class="cp-kpi"><span class="cp-kpi-val">${ke?dh[ke.mood]:`—`}</span><span class="cp-kpi-lbl">${Q(`מצב רוח`,`Mood`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${_h()}</span><span class="cp-kpi-lbl">${Q(`מים 💧`,`Water 💧`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${xh().hours||`—`}h</span><span class="cp-kpi-lbl">${Q(`ממוצע שינה`,`Avg sleep`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${H.avg||`—`}</span><span class="cp-kpi-lbl">${Q(`ממוצע שבועי`,`Week avg`)}</span></div>`,V.appendChild(U);let Ae=$(`div`,`cp-inline`);Ae.style.justifyContent=`center`,Ae.style.gap=`12px`,fh.forEach(r=>{let i=$(`button`,`cp-btn`+(ke?.mood===r?` primary`:``));i.textContent=dh[r],i.style.fontSize=`20px`,i.style.minWidth=`44px`,i.onclick=()=>{mh(r),e.replaceChildren(),Ey(e,t,n)},Ae.appendChild(i)}),V.appendChild($(`div`,`cp-label`,Q(`איך אתה מרגיש?`,`How are you feeling?`))),V.appendChild(Ae);let je=by(Q(`+ כוס מים 💧`,`+ Water glass 💧`));je.onclick=()=>{vh(),e.replaceChildren(),Ey(e,t,n)},V.appendChild(je);let Me=$(`div`,`cp-inline`),Ne=xy(Q(`שעות שינה`,`Hours slept`));Ne.type=`number`,Ne.min=`0`,Ne.max=`24`,Ne.step=`0.5`;let Pe=$(`select`,`cp-input`);[[5,`Great`],[4,`Good`],[3,`Okay`],[2,`Poor`],[1,`Bad`]].forEach(([e,t])=>{let n=$(`option`);n.value=String(e),n.textContent=t,Pe.appendChild(n)});let Fe=by(Q(`רשום שינה`,`Log sleep`));Fe.onclick=()=>{let r=parseFloat(Ne.value);r&&(bh(r,parseInt(Pe.value)||3),e.replaceChildren(),Ey(e,t,n))},Me.append(Ne,Pe,Fe),V.appendChild($(`div`,`cp-label`,Q(`יומן שינה`,`Sleep log`))),V.appendChild(Me);let Ie=by(Q(`תובנות בריאות AI`,`AI wellness insights`),!0);Ie.onclick=()=>{let e=`Mood: ${ke?ke.mood+(ke.note?` - `+ke.note:``):`not logged`}, Water: ${_h()} glasses, Sleep avg: ${xh().hours}h (quality ${xh().quality}/5), Week mood avg: ${H.avg}/5`;t.ask(`Act as a wellness coach. Here are my wellness stats: ${e}. Give me 3 personalized tips to improve my wellbeing today. Be warm and actionable.`),n()},V.appendChild(Ie),e.appendChild(V);let Le=vy(Q(`יעדים`,`Goals`),Q(`מעקב יעדים רבעוניים וחודשיים`,`Track quarterly & monthly objectives`)),Re=Ah();if(Re.total>0){let e=$(`div`,`cp-kpis`);e.innerHTML=`<div class="cp-kpi"><span class="cp-kpi-val">${Re.total}</span><span class="cp-kpi-lbl">${Q(`יעדים`,`Goals`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${Re.completed}</span><span class="cp-kpi-lbl">${Q(`הושלמו`,`Done`)}</span></div><div class="cp-kpi"><span class="cp-kpi-val">${Re.avgProgress}%</span><span class="cp-kpi-lbl">${Q(`התקדמות`,`Progress`)}</span></div>`,Le.appendChild(e)}let ze=xy(Q(`יעד — למשל סגור 10 עסקאות הרבעון`,`Goal — e.g. Close 10 deals this quarter`)),Be=$(`select`,`cp-input`);[`week`,`month`,`quarter`,`year`].forEach(e=>{let t=$(`option`);t.value=e,t.textContent=e.charAt(0).toUpperCase()+e.slice(1),Be.appendChild(t)}),Be.value=`month`;let Ve=$(`select`,`cp-input`);[`business`,`personal`,`health`,`creative`,`financial`].forEach(e=>{let t=$(`option`);t.value=e,t.textContent=e.charAt(0).toUpperCase()+e.slice(1),Ve.appendChild(t)});let He=xy(Q(`אבני דרך (מופרדות בפסיק, אופציונלי)`,`Milestones (comma separated, optional)`)),Ue=by(Q(`הוסף יעד`,`Add goal`),!0),We=$(`div`,`cp-list`),Ge=()=>{We.innerHTML=``;let e=Ch();if(!e.length){We.appendChild($(`div`,`cp-empty`,Q(`אין יעדים עדיין. הגדר את הראשון למעלה.`,`No goals yet. Set your first above.`)));return}e.forEach(e=>{let t=kh(e),n=$(`div`,`cp-row`);n.style.flexWrap=`wrap`;let r={business:38,personal:200,health:145,creative:280,financial:45}[e.category]??200;n.innerHTML=`<span class="cp-row-main" style="flex:1;min-width:120px">${gy(e.title)}</span><span class="cp-row-tag" style="color:hsl(${r},70%,60%)">${e.category} · ${e.timeframe}</span><span class="cp-row-sub">${Math.round(t*100)}%</span>`;let i=$(`div`,`cp-catbar-track`);i.style.width=`100%`,i.style.margin=`4px 0`;let a=$(`div`,`cp-catbar-fill`);if(a.style.width=`${t*100}%`,t===1&&(a.style.background=`linear-gradient(90deg, #4dff91, #39e75f)`),i.appendChild(a),n.appendChild(i),e.milestones.length){let t=$(`div`,``);t.style.cssText=`width:100%;display:flex;flex-direction:column;gap:4px;margin-top:4px`,e.milestones.forEach((n,r)=>{let i=$(`div`,`cp-inline`);i.style.gap=`6px`;let a=$(`button`,`cp-check`+(n.done?` on`:``),n.done?`✓`:``);a.onclick=()=>{Dh(e.id,r),Ge()},i.appendChild(a);let o=$(`span`,``,gy(n.text));o.style.fontSize=`12px`,n.done&&(o.style.opacity=`.45`,o.style.textDecoration=`line-through`),i.appendChild(o),t.appendChild(i)}),n.appendChild(t)}let o=$(`button`,`cp-x`,`+`);o.title=`Add milestone`,o.onclick=()=>{let t=prompt(`New milestone:`);t?.trim()&&(Oh(e.id,t.trim()),Ge())},n.appendChild(o);let s=$(`button`,`cp-x`,`✕`);s.onclick=()=>{Eh(e.id),Ge()},n.appendChild(s),We.appendChild(n)})};Ue.onclick=()=>{if(!ze.value.trim())return;let e=He.value.split(`,`).map(e=>e.trim()).filter(Boolean);Th(ze.value.trim(),Be.value,Ve.value,e),ze.value=``,He.value=``,Ge()},Le.appendChild(yy(Q(`יעד`,`Goal`),ze));let Ke=$(`div`,`cp-inline`);Ke.append(Be,Ve),Le.appendChild(Ke),Le.appendChild(yy(Q(`אבני דרך`,`Milestones`),He)),Le.appendChild(Ue),Le.appendChild(We),Ge(),e.appendChild(Le);let qe=vy(Q(`סיעור מוחות → משימות`,`Brain Dump → Tasks`),Q(`ממוין אוטומטית לעסקים / מסחר / אישי`,`Auto-sorted into Business / Trading / Personal`)),Je=Sy(`One idea per line. I’ll tag each as Business, Trading, Creative or Personal…`,5),Ye=by(Q(`לכוד ומיין`,`Capture & categorize`),!0),Xe=$(`div`,`cp-list`);Ye.onclick=()=>{Xe.innerHTML=``;let e=Je.value.split(`
`).map(e=>e.trim()).filter(Boolean);if(!e.length)return;let n={};e.forEach(e=>{let t=sm(e),r=t.module===`general`?`personal`:t.module;n[r]=(n[r]||0)+1,Xp(`[${r}] ${e}`,`med`);let i=$(`div`,`cp-row`),a=rm.find(e=>e.id===r);i.innerHTML=`<span class="cp-row-main">${gy(e)}</span><span class="cp-row-tag" style="color:hsl(${a?.hue??200},70%,60%)">${r}</span>`,Xe.appendChild(i)}),t.addMsgSys(`Captured ${e.length} item(s): `+Object.entries(n).map(([e,t])=>`${t} ${e}`).join(`, `)),Je.value=``},qe.appendChild(Je),qe.appendChild(Ye),qe.appendChild(Xe),e.appendChild(qe);let W=vy(Q(`פתקים חכמים`,`Smart Notes`),Q(`פתקים ממויינים עם הצמדה`,`Categorized notes with pinning`)),G=Sy(`Quick note…`,3),Ze=$(`select`,`cp-input`);q_.forEach(e=>{let t=$(`option`);t.value=e,t.textContent=e,Ze.appendChild(t)});let Qe=by(Q(`שמור פתק`,`Save note`),!0),$e=$(`div`,`cp-list`),et=()=>{$e.innerHTML=``;let e=H_(),t=e.filter(e=>e.pinned),n=e.filter(e=>!e.pinned);[...t,...n].slice(0,15).forEach(e=>{let t=$(`div`,`cp-row`);t.style.flexWrap=`wrap`,t.innerHTML=`<span class="cp-row-main" style="flex:1;min-width:100px">${e.pinned?`📌 `:``}${gy(e.text.slice(0,60))}</span><span class="cp-row-tag">${gy(e.category)}</span><span class="cp-row-sub">${e.created}</span>`;let n=$(`button`,`cp-x`,e.pinned?`★`:`☆`);n.title=`Pin/unpin`,n.onclick=()=>{K_(e.id),et()},t.appendChild(n);let r=$(`button`,`cp-x`,`✕`);r.onclick=()=>{G_(e.id),et()},t.appendChild(r),$e.appendChild(t)}),e.length||$e.appendChild($(`div`,`cp-empty`,Q(`אין פתקים עדיין.`,`No notes yet.`)))};Qe.onclick=()=>{G.value.trim()&&(W_(G.value.trim(),Ze.value),G.value=``,et())},W.appendChild(G),W.appendChild(Ze),W.appendChild(Qe),W.appendChild($e),et(),e.appendChild(W);let tt=vy(Q(`משימות חוזרות`,`Recurring Tasks`),Q(`יצירת משימות אוטומטית לפי לוח זמנים`,`Auto-generate tasks on schedule`)),nt=xy(Q(`שם משימה`,`Task name`)),rt=$(`select`,`cp-input`);[`daily`,`weekly`,`monthly`].forEach(e=>{let t=$(`option`);t.value=e,t.textContent=e.charAt(0).toUpperCase()+e.slice(1),rt.appendChild(t)});let it=$(`select`,`cp-input`);[[`med`,`Medium`],[`high`,`High`],[`low`,`Low`]].forEach(([e,t])=>{let n=$(`option`);n.value=e,n.textContent=t,it.appendChild(n)});let at=by(Q(`הוסף משימה חוזרת`,`Add recurring`),!0),ot=$(`div`,`cp-list`),st=()=>{ot.innerHTML=``;let e=Y_();if(!e.length){ot.appendChild($(`div`,`cp-empty`,Q(`אין משימות חוזרות.`,`No recurring tasks.`)));return}e.forEach(e=>{let t=$(`div`,`cp-row`);t.innerHTML=`<span class="cp-row-main">${gy(e.text)}</span><span class="cp-row-tag">${e.frequency}</span><span class="cp-row-sub" style="opacity:${e.active?1:.4}">${e.active?`Active`:`Paused`}</span>`;let n=$(`button`,`cp-x`,e.active?`⏸`:`▶`);n.onclick=()=>{$_(e.id),st()},t.appendChild(n);let r=$(`button`,`cp-x`,`✕`);r.onclick=()=>{Q_(e.id),st()},t.appendChild(r),ot.appendChild(t)})};at.onclick=()=>{nt.value.trim()&&(Z_(nt.value.trim(),rt.value,it.value),nt.value=``,st())},tt.appendChild(yy(Q(`משימה`,`Task`),nt));let ct=$(`div`,`cp-inline`);ct.append(rt,it),tt.appendChild(ct),tt.appendChild(at),tt.appendChild(ot),st(),e.appendChild(tt)}function Dy(e){let t=fm(),n=vy(Q(`פרופיל`,`Profile`),Q(`זהות ארוכת טווח שהעוזר זוכר`,`Long-term identity the assistant remembers`)),r=xy(`Name`,t.profile.name),i=xy(`Role`,t.profile.role),a=xy(`Business`,t.profile.business),o=xy(`Location`,t.profile.location),s=xy(`Preferences (comma separated)`,t.profile.preferences.join(`, `)),c=by(Q(`שמור פרופיל`,`Save profile`),!0),l=$(`div`,`cp-note`);c.onclick=()=>{xm({name:r.value.trim(),role:i.value.trim(),business:a.value.trim(),location:o.value.trim(),preferences:s.value.split(`,`).map(e=>e.trim()).filter(Boolean)}),l.textContent=Q(`✅ נשמר. העוזר ישתמש בזה בכל תשובה.`,`✅ Saved. The assistant will use this in every reply.`)},[[Q(`שם`,`Name`),r],[Q(`תפקיד`,`Role`),i],[Q(`עסק`,`Business`),a],[Q(`מיקום`,`Location`),o],[Q(`העדפות`,`Preferences`),s]].forEach(([e,t])=>n.appendChild(yy(e,t))),n.appendChild(c),n.appendChild(l),e.appendChild(n);let u=vy(Q(`עובדות שנזכרו`,`Remembered Facts`),`${t.facts.length} ${Q(`שמורות`,`stored`)}`),d=xy(Q(`למד אותי משהו לזכור…`,`Teach me something to remember…`)),f=by(Q(`זכור`,`Remember`),!0),p=$(`div`,`cp-list`),m=()=>{p.innerHTML=``;let e=fm().facts.slice(0,30);if(!e.length){p.appendChild($(`div`,`cp-empty`,Q(`אין עובדות עדיין.`,`No facts yet.`)));return}e.forEach(e=>{let t=$(`div`,`cp-row`);t.innerHTML=`<span class="cp-row-main">${gy(e.text)}</span><span class="cp-row-tag">${gy(e.module)}</span>`;let n=$(`button`,`cp-x`,`✕`);n.onclick=()=>{gm(e.id),m()},t.appendChild(n),p.appendChild(t)})};f.onclick=()=>{d.value.trim()&&(hm(d.value.trim(),`general`,.8),d.value=``,m())},u.appendChild(yy(Q(`עובדה חדשה`,`New fact`),d)),u.appendChild(f),u.appendChild(p),m(),e.appendChild(u);let h=vy(Q(`פרויקטים פעילים`,`Active Projects`),Q(`מעקב חוצה מודולים`,`Tracked across modules`)),g=xy(Q(`שם פרויקט`,`Project title`)),_=$(`select`,`cp-input`);rm.forEach(e=>{let t=$(`option`);t.value=e.id,t.textContent=e.label,_.appendChild(t)});let v=by(Q(`הוסף פרויקט`,`Add project`),!0),y=$(`div`,`cp-list`),b=()=>{y.innerHTML=``;let e=fm().projects;if(!e.length){y.appendChild($(`div`,`cp-empty`,Q(`אין פרויקטים.`,`No projects.`)));return}e.forEach(e=>{let t=$(`div`,`cp-row`);t.innerHTML=`<span class="cp-row-main">${gy(e.title)}</span><span class="cp-row-tag">${gy(e.module)} · ${gy(e.status)}</span>`;let n=$(`button`,`cp-x`,`✕`);n.onclick=()=>{bm(e.id),b()},t.appendChild(n),y.appendChild(t)})};v.onclick=()=>{g.value.trim()&&(ym(g.value.trim(),_.value),g.value=``,b())},h.appendChild(yy(Q(`כותרת`,`Title`),g)),h.appendChild(yy(Q(`מודול`,`Module`),_)),h.appendChild(v),h.appendChild(y),b(),e.appendChild(h);let x=vy(Q(`איפוס`,`Reset`),Q(`מחק זיכרון ארוך טווח`,`Wipe long-term memory`)),S=by(Q(`נקה את כל הזיכרון`,`Clear all memory`));S.onclick=()=>{let t=fm();t.facts=[],t.projects=[],t.summary=``,pm(t),e.innerHTML=``,Dy(e)},x.appendChild(S),e.appendChild(x)}function Oy(e,t,n){let r=vy(Q(`ראייה`,`Vision`),Q(`ניתוח תמונה — תא נהג, תרשים או גרף`,`Analyze a photo — truck cabin, diagram, or chart`)),i=$(`input`,`cp-input`);i.type=`file`,i.accept=`image/*`;let a=xy(`What should I look for?`,`Describe this and give actionable insights`),o=$(`img`,`cp-preview`);o.style.display=`none`;let s=by(Q(`נתח תמונה`,`Analyze image`),!0),c=$(`div`,`cp-note`),l=``;i.onchange=()=>{let e=i.files?.[0];if(!e)return;let t=new FileReader;t.onload=()=>{l=t.result,o.src=l,o.style.display=`block`},t.readAsDataURL(e)},s.onclick=async()=>{if(!l){c.textContent=Q(`בחר תמונה קודם.`,`Choose an image first.`);return}let e=window.puter;if(!e?.ai?.chat){c.textContent=`Vision needs the Puter engine (default). Open settings and ensure provider = Puter.`;return}c.textContent=`Analyzing…`;try{let r=await e.ai.chat(a.value.trim()||`Describe this image and give actionable insights.`,l),i=typeof r==`string`?r:r?.message?.content||r?.text||JSON.stringify(r);t.addMsgSys(`👁 `+(i||`No description returned.`)),n()}catch{c.textContent=`Vision request failed.`}},r.appendChild(yy(Q(`תמונה`,`Image`),i)),r.appendChild(o),r.appendChild(yy(Q(`שאלה`,`Question`),a)),r.appendChild(s),r.appendChild(c),e.appendChild(r);let u=vy(Q(`מסמכים`,`Documents`),Q(`העלה PDF או קובץ טקסט ושאל עליו`,`Drop a PDF or text file and query it`)),d=$(`input`,`cp-input`);d.type=`file`,d.accept=`.pdf,.txt,.md,.csv`;let f=xy(Q(`שאלה על המסמך`,`Question about the document`),Q(`סכם את הנקודות העיקריות`,`Summarize the key points`)),p=by(Q(`פרסר ושאל`,`Parse & ask`),!0),m=$(`div`,`cp-note`),h=``;d.onchange=async()=>{let e=d.files?.[0];if(e){m.textContent=Q(`קורא…`,`Reading…`);try{h=e.type===`application/pdf`||e.name.endsWith(`.pdf`)?await jy(e):await e.text(),m.textContent=Q(`נטענו ${h.length.toLocaleString()} תווים מ-${e.name}.`,`Loaded ${h.length.toLocaleString()} chars from ${e.name}.`)}catch{m.textContent=Q(`לא ניתן לקרוא את הקובץ.`,`Could not read that file.`)}}},p.onclick=()=>{if(!h){m.textContent=Q(`טען מסמך קודם.`,`Load a document first.`);return}let e=h.slice(0,6e3);t.ask(`${f.value.trim()||`Summarize`} — based on this document:\n\n"""${e}"""`),n()},u.appendChild(yy(Q(`קובץ`,`File`),d)),u.appendChild(yy(Q(`שאלה`,`Question`),f)),u.appendChild(p),u.appendChild(m),e.appendChild(u);let g=vy(Q(`בריאות נתונים`,`Data Health`),Q(`שלמות אחסון ושימוש`,`Storage integrity and usage`)),_=yv(),v=xv();if(g.innerHTML+=`<div class="cp-kpis">
    <div class="cp-kpi"><span class="cp-kpi-val" style="color:${_.corrupted.length?`#ff5d73`:`#4dff91`}">${_.healthy}</span><span class="cp-kpi-lbl">${Q(`תקין`,`Healthy`)}</span></div>
    <div class="cp-kpi"><span class="cp-kpi-val" style="color:${_.corrupted.length?`#ff5d73`:`var(--dim)`}">${_.corrupted.length}</span><span class="cp-kpi-lbl">${Q(`פגום`,`Corrupted`)}</span></div>
    <div class="cp-kpi"><span class="cp-kpi-val">${_.empty.length}</span><span class="cp-kpi-lbl">${Q(`ריק`,`Empty`)}</span></div>
    <div class="cp-kpi"><span class="cp-kpi-val">${v.percent}%</span><span class="cp-kpi-lbl">${Q(`אחסון`,`Storage`)}</span></div>
  </div>`,g.innerHTML+=`<div style="margin:8px 0"><div style="height:6px;background:rgba(255,255,255,.06);border-radius:3px"><div style="height:100%;width:${v.percent}%;background:${v.percent>80?`#ff5d73`:`var(--gold)`};border-radius:3px"></div></div><div style="font-size:11px;color:var(--dim);margin-top:4px">${(v.used/1024).toFixed(1)} KB / ${(v.available/1024).toFixed(0)} KB</div></div>`,_.corrupted.length){let r=by(Q(`תקן אחסונים פגומים`,`Repair corrupted stores`));r.onclick=()=>{let r=0;for(let e of _.corrupted)bv(e)&&r++;t.addMsgSys(`Data repair: ${r}/${_.corrupted.length} stores fixed.`),e.replaceChildren(),Oy(e,t,n)},g.appendChild(r)}e.appendChild(g);let y=vy(Q(`מצב רוח שיחה`,`Conversation Mood`),Q(`מעקב סנטימנט מהשיחות שלך`,`Sentiment tracking from your conversations`)),b=hg(),x=mg(7),S=b.score>.3?`😊`:b.score<-.3?`😟`:`😐`;y.innerHTML+=`<div style="display:flex;align-items:center;gap:16px;margin:8px 0">
    <span style="font-size:28px">${S}</span>
    <div>
      <div style="font-size:14px;color:var(--ink)">${b.label}</div>
      <div style="font-size:11px;color:var(--dim)">Score: ${b.score.toFixed(2)} (7-day avg)</div>
    </div>
    <div style="margin-left:auto">${av(x.map(e=>(e+1)*50),{width:100,height:28,stroke:b.score>0?`#4dff91`:`#ff5d73`,fill:b.score>0?`rgba(77,255,145,.15)`:`rgba(255,93,115,.15)`,showDots:!0})}</div>
  </div>`,e.appendChild(y);let C=vy(Q(`דוחות`,`Reports`),Q(`צור והורד דוחות מעוצבים`,`Generate and download formatted reports`)),w=by(Q(`דוח עסקי`,`Business Report`));w.onclick=()=>rv(`business`);let T=by(Q(`דוח אישי`,`Personal Report`));T.onclick=()=>rv(`personal`);let E=by(Q(`דוח מלא`,`Full Report`),!0);E.onclick=()=>rv(`full`);let D=by(Q(`ניתוח AI של הנתונים שלי`,`AI analysis of my data`));D.onclick=()=>{t.ask(`Act as my strategic advisor. Analyze these metrics:\n\n${tv()}\n\n${nv()}\n\nGive me 5 actionable recommendations for this week. Be specific and data-driven.`),n()};let O=$(`div`,`cp-inline`);O.append(w,T,E),C.appendChild(O),C.appendChild(D),e.appendChild(C)}var ky=`https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs`,Ay=`https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;async function jy(t){let n=window;if(!n.pdfjsLib){let t=ky,r=await e(()=>import(t),[]);n.pdfjsLib=r,r.GlobalWorkerOptions.workerSrc=Ay}let r=await t.arrayBuffer(),i=await n.pdfjsLib.getDocument({data:r}).promise,a=``;for(let e=1;e<=Math.min(i.numPages,30);e++){let t=await(await i.getPage(e)).getTextContent();a+=t.items.map(e=>e.str).join(` `)+`
`}return a}function My(e,t){let n=e.toLowerCase(),r=t.toLowerCase();if(n===r)return 10;if(n.startsWith(r))return 8;if(n.includes(r))return 5;let i=r.split(/\s+/),a=i.filter(e=>n.includes(e)).length;return a>0?a/i.length*4:0}function Ny(e,t=20){if(!e.trim())return[];let n=[];try{for(let t of Am()){let r=My(`${t.name} ${t.phone} ${t.vehicle} ${t.service} ${t.notes}`,e);r>0&&n.push({type:`lead`,title:t.name||t.phone,subtitle:`${t.vehicle} · ${t.service} · ₪${t.value}`,score:r,data:t})}}catch{}try{for(let t of Jp()){let r=My(t.text,e);r>0&&n.push({type:`task`,title:t.text,subtitle:`${t.priority} · ${t.done?`done`:`open`}`,score:r,data:t})}}catch{}try{for(let t of Up()){let r=My(t.title,e);r>0&&n.push({type:`event`,title:t.title,subtitle:`${t.date} ${t.time||``}`,score:r,data:t})}}catch{}try{for(let t of Um()){let r=My(t.name,e);r>0&&n.push({type:`habit`,title:t.name,subtitle:`${t.done.length} completions`,score:r,data:t})}}catch{}try{for(let t of Qm()){let r=My(`${t.label} ${t.category}`,e);r>0&&n.push({type:`expense`,title:t.label,subtitle:`₪${t.amount} · ${t.category} · ${t.date}`,score:r,data:t})}}catch{}try{for(let t of Nh()){let r=My(`${t.customer} ${t.number} ${t.notes}`,e);r>0&&n.push({type:`invoice`,title:`${t.number} — ${t.customer}`,subtitle:`₪${t.total} · ${t.status}`,score:r,data:t})}}catch{}try{for(let t of Ch()){let r=My(`${t.title} ${t.milestones.map(e=>e.text).join(` `)}`,e);r>0&&n.push({type:`goal`,title:t.title,subtitle:`${t.timeframe} · ${t.category}`,score:r,data:t})}}catch{}try{for(let t of $p()){let r=My(t,e);r>0&&n.push({type:`note`,title:t.slice(0,80),subtitle:`note`,score:r,data:t})}for(let t of H_()){let r=My(`${t.text} ${t.category}`,e);r>0&&n.push({type:`note`,title:t.text.slice(0,80),subtitle:`${t.category}${t.pinned?` · 📌`:``} · ${t.created}`,score:r+ +!!t.pinned,data:t})}}catch{}try{for(let t of Gh()){let r=My(`${t.name} ${t.phone} ${t.email} ${t.company} ${t.tags.join(` `)}`,e);r>0&&n.push({type:`contact`,title:t.name||t.phone,subtitle:`${t.company||``}${t.tags.length?` · `+t.tags.join(`, `):``}`.trim()||`contact`,score:r,data:t})}}catch{}try{let t=JSON.parse(localStorage.getItem(`hg2:quotes`)||`[]`);for(let r of t){let t=My(`${r.customer||``} ${(r.items||[]).map(e=>e.description).join(` `)}`,e);t>0&&n.push({type:`quote`,title:r.customer||`Quote`,subtitle:`₪${r.total||0} · ${r.status||`draft`}`,score:t,data:r})}}catch{}return n.sort((e,t)=>t.score-e.score).slice(0,t)}var Py={lead:`👤`,task:`✓`,event:`📅`,habit:`🔥`,expense:`💰`,invoice:`📄`,goal:`🎯`,note:`📝`,quote:`💼`,contact:`📇`},Fy=`alpha_recent_searches`,Iy=10;function Ly(e){let t=e.trim();if(!t||t.length<2)return;let n=[];try{n=JSON.parse(localStorage.getItem(Fy)||`[]`)}catch{}n=n.filter(e=>e!==t),n.unshift(t),n.length>Iy&&(n.length=Iy),localStorage.setItem(Fy,JSON.stringify(n))}function Ry(){try{return JSON.parse(localStorage.getItem(Fy)||`[]`)}catch{return[]}}function zy(){let e=[];try{let t=Jp().filter(e=>!e.done&&e.priority===`high`);for(let n of t.slice(0,3))e.push({type:`task`,title:n.text,subtitle:`High priority`,score:10,data:n})}catch{}try{let t=new Date().toISOString().slice(0,10),n=Up().filter(e=>e.date===t);for(let t of n.slice(0,2))e.push({type:`event`,title:t.title,subtitle:`Today ${t.time||``}`,score:9,data:t})}catch{}try{let t=Am().filter(e=>e.followUp&&e.followUp<=new Date().toISOString().slice(0,10)&&e.status!==`won`&&e.status!==`lost`);for(let n of t.slice(0,2))e.push({type:`lead`,title:n.name||n.phone,subtitle:`Follow-up due`,score:8,data:n})}catch{}return e}var By=[];function Vy(e,t,n){By.push({keys:e,label:t,action:n})}function Hy(){document.addEventListener(`keydown`,e=>{if(!(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)){for(let t of By)if(Uy(e,t.keys)){e.preventDefault(),t.action();return}}})}function Uy(e,t){let n=t.toLowerCase().split(`+`).map(e=>e.trim()),r=n.includes(`ctrl`)||n.includes(`cmd`),i=n.includes(`shift`),a=n.includes(`alt`),o=n.filter(e=>![`ctrl`,`cmd`,`shift`,`alt`].includes(e))[0];return r&&!(e.ctrlKey||e.metaKey)||i&&!e.shiftKey||a&&!e.altKey||!r&&(e.ctrlKey||e.metaKey)?!1:e.key.toLowerCase()===o}function Wy(){return By.map(e=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04)">
      <span style="color:var(--dim)">${e.label}</span>
      <kbd style="background:rgba(255,255,255,.06);padding:2px 8px;border-radius:4px;font-size:12px;font-family:monospace;color:var(--gold)">${e.keys}</kbd>
    </div>`).join(``)}var Gy=null;function Ky(){return Gy||(Gy=document.createElement(`div`),Gy.className=`toast-container`,Gy.id=`toastContainer`,document.body.appendChild(Gy),Gy)}var qy={info:`ℹ️`,success:`✅`,warning:`⚠️`,error:`❌`};function Jy(e){let t=Ky(),n=document.createElement(`div`);n.className=`toast`,n.innerHTML=`
    <span class="toast-icon">${e.icon||qy[e.type||`info`]||`ℹ️`}</span>
    <div class="toast-body">
      <div class="toast-title">${e.title}</div>
      ${e.text?`<div class="toast-text">${e.text}</div>`:``}
    </div>
    <button class="toast-close">✕</button>
  `;let r=()=>{n.classList.add(`leaving`),setTimeout(()=>n.remove(),300)};n.querySelector(`.toast-close`).addEventListener(`click`,r),t.appendChild(n);let i=e.duration??4e3;i>0&&setTimeout(r,i),t.children.length>5&&t.firstElementChild?.remove()}function Yy(e,t){Jy({type:`info`,title:e,text:t})}var Xy={appTitle:{he:`אלפא עוזר אישי`,en:`ALPHA ASSISTANT`},settings:{he:`הגדרות`,en:`SETTINGS`},newChat:{he:`חדש`,en:`NEW`},system:{he:`מערכת`,en:`SYSTEM`},online:{he:`● מחובר`,en:`● ONLINE`},neuralActivity:{he:`פעילות עצבית`,en:`NEURAL ACTIVITY`},performance:{he:`ביצועים`,en:`PERFORMANCE`},aiEngine:{he:`מנוע AI`,en:`AI ENGINE`},ready:{he:`מוכן`,en:`Ready`},audioSpectrum:{he:`ספקטרום שמע`,en:`AUDIO SPECTRUM`},session:{he:`סשן`,en:`SESSION`},msgs:{he:`הודעות`,en:`MSGS`},tokens:{he:`טוקנים`,en:`TOKENS`},uptime:{he:`זמן פעיל`,en:`UPTIME`},liveStatus:{he:`סטטוס חי`,en:`LIVE STATUS`},output:{he:`פלט`,en:`OUTPUT`},standby:{he:`המתנה`,en:`STANDBY`},weather:{he:`מזג אוויר`,en:`Weather`},funFact:{he:`עובדה`,en:`Fun Fact`},music:{he:`מוזיקה`,en:`Music`},search:{he:`חיפוש`,en:`Search`},calendar:{he:`יומן`,en:`Calendar`},joke:{he:`בדיחה`,en:`Joke`},video:{he:`וידאו`,en:`Video`},translate:{he:`תרגום`,en:`Translate`},detect:{he:`זיהוי`,en:`Detect`},heavyguard:{he:`הביגארד`,en:`HeavyGuard`},trading:{he:`מסחר`,en:`Trading`},inputPlaceholder:{he:`הקלד או דבר עם אלפא…`,en:`Type or speak to Alpha…`},searchPlaceholder:{he:`חפש הכל…`,en:`Search everything…`},quickActions:{he:`פעולות מהירות`,en:`Quick Actions`},quickTask:{he:`✓ משימה מהירה`,en:`✓ Quick Task`},quickNote:{he:`📝 הערה מהירה`,en:`📝 Quick Note`},startTimer:{he:`⏱ התחל טיימר`,en:`⏱ Start Timer`},briefing:{he:`📊 תדריך`,en:`📊 Briefing`},fabSearch:{he:`🔍 חיפוש`,en:`🔍 Search`},settingsTitle:{he:`אלפא עוזר אישי`,en:`Alpha Assistant`},settingsDesc:{he:`עובד בחינם מהקופסה דרך Puter — לא צריך מפתח API.`,en:`Works free out of the box via Puter — no API key required.`},general:{he:`כללי`,en:`GENERAL`},assistantName:{he:`שם העוזר`,en:`Assistant name`},soundEffects:{he:`אפקטי סאונד`,en:`Sound effects`},haptic:{he:`משוב רטט`,en:`Haptic feedback`},voiceLang:{he:`קול ושפה`,en:`VOICE & LANGUAGE`},micLang:{he:`שפת מיקרופון`,en:`Mic language`},voiceLangLabel:{he:`שפת דיבור`,en:`Voice language`},textReplyLang:{he:`שפת תשובת טקסט`,en:`Text reply language`},sameAsVoice:{he:`כמו הקול`,en:`Same as voice`},voiceGender:{he:`מגדר קול`,en:`Voice gender`},female:{he:`נקבה`,en:`Female`},male:{he:`זכר`,en:`Male`},auto:{he:`אוטומטי`,en:`Auto`},voice:{he:`קול`,en:`Voice`},speed:{he:`מהירות`,en:`Speed`},pitch:{he:`גובה צליל`,en:`Pitch`},autoSpeak:{he:`דיבור אוטומטי`,en:`Auto speak responses`},testVoice:{he:`בדוק קול`,en:`Test voice`},audio:{he:`שמע`,en:`AUDIO`},ambientSound:{he:`צליל סביבה`,en:`Ambient sound`},volume:{he:`עוצמה`,en:`Volume`},aiEngineTitle:{he:`מנוע AI`,en:`AI ENGINE`},aiProvider:{he:`ספק AI`,en:`AI Provider`},puterFree:{he:`Puter — חינם, בלי מפתח`,en:`Puter — Free, no key`},puterModel:{he:`מודל Puter (חינם)`,en:`Puter model (free)`},puterDesc:{he:`Puter בחינם — חלון התחברות חד-פעמי יופיע בשימוש ראשון. מפתחות למטה הם אופציונליים.`,en:`Puter is free — a one-time sign-in popup appears on first use. Keys below are optional fallbacks.`},geminiKey:{he:`מפתח Gemini API`,en:`Gemini API key`},grokKey:{he:`מפתח Grok API`,en:`Grok API key`},openaiKey:{he:`מפתח OpenAI API`,en:`OpenAI API key`},cloudSync:{he:`סנכרון ענן`,en:`CLOUD SYNC`},cloudSyncDesc:{he:`סנכרן את כל הנתונים ל-Google Drive. דורש Google OAuth Client ID מ-`,en:`Sync all your data to Google Drive. Requires a Google OAuth Client ID from `},connectDrive:{he:`חבר Google Drive`,en:`Connect Google Drive`},backupDrive:{he:`גיבוי ל-Drive`,en:`Backup to Drive`},restoreDrive:{he:`שחזור מ-Drive`,en:`Restore from Drive`},noGoogle:{he:`אין חשבון Google? ייצא/ייבא קובץ גיבוי ישירות:`,en:`No Google account? Export/import a backup file directly:`},exportJson:{he:`ייצוא JSON`,en:`Export JSON`},importJson:{he:`ייבוא JSON`,en:`Import JSON`},connectedServices:{he:`שירותים מחוברים`,en:`CONNECTED SERVICES`},shortcuts:{he:`קיצורי מקלדת`,en:`KEYBOARD SHORTCUTS`},save:{he:`שמור`,en:`Save`},heavyguardOs:{he:`הביגארד OS`,en:`HEAVYGUARD OS`},arCamera:{he:`מצלמת AR`,en:`AR CAMERA`},initCamera:{he:`מאתחל מצלמה…`,en:`Initializing camera…`},uiLanguage:{he:`שפת מערכת`,en:`System language`},pikachuVoice:{he:`פיקאצ'ו`,en:`PIKACHU`},pikaVoiceOn:{he:`קול פיקאצ'ו`,en:`Pikachu voice`},pikaVolume:{he:`עוצמת קול פיקאצ'ו`,en:`Pikachu volume`},pikaPitch:{he:`גובה קול פיקאצ'ו`,en:`Pikachu pitch`},pikaSpeakNow:{he:`פיקה פיקה!`,en:`Pika Pika!`},voiceStudio:{he:`🎙️ אולפן קול`,en:`🎙️ VOICE STUDIO`},voiceStyle:{he:`סגנון קול מהיר`,en:`Quick voice style`},voiceVolume:{he:`עוצמת קול`,en:`Voice volume`},voiceTestLabel:{he:`משפט לבדיקה`,en:`Test phrase`},voiceTestPh:{he:`כתוב טקסט לשמיעה…`,en:`Type text to hear…`},playVoice:{he:`▶ השמע`,en:`▶ Play`},resetVoice:{he:`↺ אפס`,en:`↺ Reset`},vpNatural:{he:`טבעי`,en:`Natural`},vpCalm:{he:`רגוע ועמוק`,en:`Calm & deep`},vpEnergetic:{he:`אנרגטי`,en:`Energetic`},vpFast:{he:`מהיר`,en:`Fast`},vpClear:{he:`איטי וברור`,en:`Slow & clear`},vpDeep:{he:`עמוק`,en:`Deep`},vpRobot:{he:`רובוט`,en:`Robot`},vpChipmunk:{he:`צ'יפמאנק`,en:`Chipmunk`},vpWhisper:{he:`לחישה`,en:`Whisper`},armed:{he:`אמור "היי אלפא"`,en:`SAY "HEY ALPHA"`},listening:{he:`מקשיב`,en:`LISTENING`},thinking:{he:`חושב`,en:`THINKING`},speaking:{he:`מדבר`,en:`SPEAKING`},you:{he:`אתה`,en:`YOU`},systemLabel:{he:`מערכת`,en:`SYSTEM`},connected:{he:`● מחובר`,en:`● Connected`},goodNight:{he:`לילה טוב`,en:`Good night`},goodMorning:{he:`בוקר טוב`,en:`Good morning`},goodAfternoon:{he:`צהריים טובים`,en:`Good afternoon`},goodEvening:{he:`ערב טוב`,en:`Good evening`},onlineMsg:{he:`מחובר. דבר אליי או הקלד.`,en:`online. Talk to me or type.`},howCanIHelp:{he:`איך אפשר לעזור?`,en:`How can I help?`},eventsToday:{he:`אירועים היום`,en:`events today`},openTasks:{he:`משימות פתוחות`,en:`open tasks`},youHave:{he:`יש לך`,en:`You have`},and:{he:`ו-`,en:`and`},welcomeSub:{he:`ה-AI האישי שלך. איך לקרוא לך?`,en:`your personal AI. What should I call you?`},letsBegin:{he:`בוא נתחיל`,en:`Let's begin`},skipForNow:{he:`דלג לעת עתה`,en:`Skip for now`},niceToMeet:{he:`נעים להכיר. אני`,en:`Great to meet you. I'm`},askAnything:{he:`— שאל אותי הכל, או פתח את המוח למודולים שלך.`,en:`— ask me anything, or open the Brain for your modules.`},speechNotSupported:{he:`זיהוי דיבור לא נתמך בדפדפן זה.`,en:`Speech recognition is not supported in this browser.`},readyMsg:{he:`מוכן.`,en:`ready.`},connectionError:{he:`שגיאת חיבור`,en:`Connection error`},taskAdded:{he:`משימה נוספה`,en:`Task added`},noteSaved:{he:`הערה נשמרה.`,en:`Note saved.`},timerStarted:{he:`טיימר התחיל`,en:`Timer started`},timerStopped:{he:`הופסק`,en:`Stopped`},noResults:{he:`לא נמצאו תוצאות.`,en:`No results found.`},continueGoogle:{he:`המשך בגוגל ↗`,en:`Continue on Google ↗`},searchError:{he:`שגיאת חיפוש.`,en:`Search error.`},calendarEmpty:{he:`היומן ריק.`,en:`Calendar is empty.`}};function Zy(e,t){return Xy[e]?.[t]??Xy[e]?.en??e}function Qy(t){t.innerHTML=`
    <div class="app">
      <div class="chrome topL"><img class="brand-logo" src="/Alpha-new/heavyguard-logo.png" alt="HeavyGuard" /><div class="topL-txt"><div class="wm" data-i18n="appTitle">אלפא עוזר אישי</div><div class="clk" id="clock">--:--</div><div class="build-ver" id="buildVer">v9 ⚡</div></div></div>
      <div class="chrome topR">
        <button class="chip ghost" id="searchBtn" aria-label="Search (Ctrl+K)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
        <button class="chip ghost" id="muteBtn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg></button>
        <button class="chip" id="settingsBtn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> <span data-i18n="settings">הגדרות</span></button>
        <button class="chip ghost" id="newChat"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> <span data-i18n="newChat">חדש</span></button>
      </div>
      <div class="stage" id="stage"></div>

      <aside class="left-panel" id="leftPanel">
        <div class="lp-head">
          <span class="lp-title" data-i18n="system">מערכת</span>
          <span class="lp-status" id="lpStatus" data-i18n="online">● מחובר</span>
        </div>
        <div class="lp-section">
          <div class="lp-label" data-i18n="neuralActivity">פעילות עצבית</div>
          <canvas id="neuralCanvas" class="neural-canvas"></canvas>
        </div>
        <div class="lp-section">
          <div class="lp-label" data-i18n="performance">ביצועים</div>
          <div class="metric-grid">
            <div class="metric">
              <span class="metric-label">CPU</span>
              <div class="metric-bar"><div class="metric-fill" id="cpuBar" style="width:42%"></div></div>
              <span class="metric-val" id="cpuVal">42%</span>
            </div>
            <div class="metric">
              <span class="metric-label">MEM</span>
              <div class="metric-bar"><div class="metric-fill" id="memBar" style="width:67%"></div></div>
              <span class="metric-val" id="memVal">67%</span>
            </div>
            <div class="metric">
              <span class="metric-label">NET</span>
              <div class="metric-bar"><div class="metric-fill net" id="netBar" style="width:23%"></div></div>
              <span class="metric-val" id="netVal">23ms</span>
            </div>
          </div>
        </div>
        <div class="lp-section">
          <div class="lp-label" data-i18n="aiEngine">מנוע AI</div>
          <div class="ai-status">
            <div class="ai-model" id="aiModelDisplay">GPT-4O MINI</div>
            <div class="ai-provider" id="aiProviderDisplay">דרך PUTER</div>
            <div class="ai-latency">
              <span class="latency-dot"></span>
              <span id="aiLatency" data-i18n="ready">מוכן</span>
            </div>
          </div>
        </div>
        <div class="lp-section">
          <div class="lp-label" data-i18n="audioSpectrum">ספקטרום שמע</div>
          <canvas id="waveCanvas" class="wave-canvas"></canvas>
        </div>
        <div class="lp-section">
          <div class="lp-label" data-i18n="session">סשן</div>
          <div class="quick-stats">
            <div class="qs"><span class="qs-val" id="msgCount">0</span><span class="qs-label" data-i18n="msgs">הודעות</span></div>
            <div class="qs"><span class="qs-val" id="tokenCount">0</span><span class="qs-label" data-i18n="tokens">טוקנים</span></div>
            <div class="qs"><span class="qs-val" id="uptimeVal">00:00</span><span class="qs-label" data-i18n="uptime">זמן פעיל</span></div>
          </div>
        </div>
        <div class="lp-section">
          <div class="lp-label" data-i18n="liveStatus">סטטוס חי</div>
          <div class="live-widgets" id="liveWidgets"></div>
        </div>
      </aside>

      <aside class="right-panel" id="rightPanel">
        <div class="rp-head">
          <span class="rp-title" data-i18n="output">פלט</span>
          <div class="rp-connections" id="connections">
            <span class="conn-dot active" title="API"></span>
            <span class="conn-dot" id="connSpotify" title="Spotify"></span>
            <span class="conn-dot" id="connSocial" title="Social"></span>
          </div>
        </div>
        <div class="rp-body" id="rpBody"></div>
      </aside>

      <div class="dock">
        <div class="state" id="state" data-i18n="standby">המתנה</div>
        <div class="mac-dock" id="macDock">
          <button class="dock-item" data-q="What's the weather today?">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg></span>
            <span class="dl" data-i18n="weather">מזג אוויר</span>
          </button>
          <button class="dock-item" data-q="Tell me a fun fact">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/></svg></span>
            <span class="dl" data-i18n="funFact">עובדה</span>
          </button>
          <button class="dock-item" data-q="Play some music on Spotify">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5-1 4-1 4 1 4 1M7 12s2-1.5 5-1.5 5 1.5 5 1.5M6.5 9S9 7 12 7s5.5 2 5.5 2"/></svg></span>
            <span class="dl" data-i18n="music">מוזיקה</span>
          </button>
          <button class="dock-item" data-q="Search the web">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            <span class="dl" data-i18n="search">חיפוש</span>
          </button>
          <button class="dock-item" id="calBtn">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
            <span class="dl" data-i18n="calendar">יומן</span>
            <span class="cal-badge" id="calBadge"></span>
          </button>
          <button class="dock-item" data-q="Tell me a joke">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></span>
            <span class="dl" data-i18n="joke">בדיחה</span>
          </button>
          <button class="dock-item" data-q="Play a video on YouTube">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10,8 16,12 10,16"/></svg></span>
            <span class="dl" data-i18n="video">וידאו</span>
          </button>
          <button class="dock-item" data-q="Translate to Hebrew">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></span>
            <span class="dl" data-i18n="translate">תרגום</span>
          </button>
          <button class="dock-item" id="detectBtn">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2"/><circle cx="12" cy="10" r="3"/><path d="M7 18c0-2.8 2.2-5 5-5s5 2.2 5 5"/></svg></span>
            <span class="dl" data-i18n="detect">זיהוי</span>
          </button>
        </div>
        <div class="fab-group">
          <button class="hg-fab" id="hgBtn" title="HeavyGuard OS">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span data-i18n="heavyguard">הביגארד</span>
          </button>
          <a class="hg-fab trade-fab" id="tradeBtn" href="https://heavt-guard-simulator-1.onrender.com/" target="_blank" rel="noopener" title="מערכת מסחר">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
            <span data-i18n="trading">מסחר</span>
          </a>
        </div>
        <div class="bar">
          <button class="ic mic" id="micBtn" title="Hey Alpha"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>
          <div class="pill"><input id="input" type="text" placeholder="הקלד או דבר עם אלפא…" /></div>
          <button class="ic send" id="sendBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg></button>
        </div>
      </div>
      <div class="win" id="win"><div class="winbox">
        <div class="winhead"><span id="winTitle"></span><button id="winClose">✕</button></div>
        <div class="winbody" id="winBody"></div>
      </div></div>
      <div class="overlay" id="overlay"><div class="card">
        <h2 data-i18n="settingsTitle">אלפא עוזר אישי</h2>
        <p data-i18n="settingsDesc">עובד בחינם מהקופסה דרך Puter — לא צריך מפתח API.</p>

        <div class="settings-section">
          <div class="ss-title" data-i18n="general">כללי</div>
          <label data-i18n="uiLanguage">שפת מערכת</label>
          <select id="uiLangSel">
            <option value="he">עברית</option>
            <option value="en">English</option>
          </select>
          <label data-i18n="assistantName">שם העוזר</label><input id="nameInput" value="ALPHA" />
          <div class="setting-row">
            <label data-i18n="soundEffects">אפקטי סאונד</label>
            <label class="toggle"><input type="checkbox" id="sfxCheck" /><span class="toggle-slider"></span></label>
          </div>
          <div class="setting-row">
            <label data-i18n="haptic">משוב רטט</label>
            <label class="toggle"><input type="checkbox" id="hapticsCheck" /><span class="toggle-slider"></span></label>
          </div>
        </div>

        <div class="settings-section">
          <div class="ss-title" data-i18n="voiceLang">קול ושפה</div>
          <label data-i18n="micLang">שפת מיקרופון</label>
          <select id="micSel"><option value="he">Hebrew</option><option value="en">English</option><option value="es">Español</option></select>
          <label data-i18n="voiceLangLabel">שפת דיבור</label>
          <select id="replySel"><option value="en">English</option><option value="he">Hebrew</option><option value="es">Español</option></select>
          <label data-i18n="textReplyLang">שפת תשובת טקסט</label>
          <select id="textLangSel">
            <option value="auto" data-i18n="sameAsVoice">כמו הקול</option>
            <option value="en">English</option>
            <option value="he">Hebrew</option>
            <option value="ar">Arabic</option>
            <option value="ru">Russian</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
          </select>
        </div>

        <div class="settings-section voice-studio">
          <div class="ss-title" data-i18n="voiceStudio">🎙️ אולפן קול</div>

          <label data-i18n="voiceStyle">סגנון קול מהיר</label>
          <div class="voice-presets" id="voicePresets">
            <button class="vp-chip" data-preset="natural" data-i18n="vpNatural">טבעי</button>
            <button class="vp-chip" data-preset="calm" data-i18n="vpCalm">רגוע ועמוק</button>
            <button class="vp-chip" data-preset="energetic" data-i18n="vpEnergetic">אנרגטי</button>
            <button class="vp-chip" data-preset="fast" data-i18n="vpFast">מהיר</button>
            <button class="vp-chip" data-preset="clear" data-i18n="vpClear">איטי וברור</button>
            <button class="vp-chip" data-preset="deep" data-i18n="vpDeep">עמוק</button>
            <button class="vp-chip" data-preset="robot" data-i18n="vpRobot">רובוט</button>
            <button class="vp-chip" data-preset="chipmunk" data-i18n="vpChipmunk">צ'יפמאנק</button>
            <button class="vp-chip" data-preset="whisper" data-i18n="vpWhisper">לחישה</button>
          </div>

          <label data-i18n="voiceGender">מגדר קול</label>
          <div class="gender-picker" id="genderPicker">
            <button class="gender-btn" data-g="female"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg> נקבה</button>
            <button class="gender-btn" data-g="male"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="14" r="5"/><path d="M21 3l-6.5 6.5M21 3h-5M21 3v5"/></svg> זכר</button>
            <button class="gender-btn" data-g="auto">אוטומטי</button>
          </div>

          <label data-i18n="voice">קול</label>
          <div class="voice-row">
            <select id="voiceSel"></select>
            <button class="voice-play-btn" id="voicePlayBtn" title="השמע">▶</button>
          </div>

          <label><span data-i18n="speed">מהירות</span> <span id="speedVal" class="range-val">1.0x</span></label>
          <input type="range" id="speedSlider" min="50" max="250" value="100" step="5" />

          <label><span data-i18n="pitch">גובה צליל</span> <span id="pitchVal" class="range-val">1.0</span></label>
          <input type="range" id="pitchSlider" min="0" max="200" value="100" step="5" />

          <label><span data-i18n="voiceVolume">עוצמת קול</span> <span id="voiceVolVal" class="range-val">100%</span></label>
          <input type="range" id="voiceVolSlider" min="0" max="100" value="100" />

          <div class="setting-row">
            <label data-i18n="autoSpeak">דיבור אוטומטי</label>
            <label class="toggle"><input type="checkbox" id="autoSpeakCheck" checked /><span class="toggle-slider"></span></label>
          </div>

          <label data-i18n="voiceTestLabel">משפט לבדיקה</label>
          <input id="voiceTestText" type="text" data-i18n-ph="voiceTestPh" placeholder="כתוב טקסט לשמיעה..." />
          <div class="voice-btn-row">
            <button class="test-voice-btn" id="testVoiceBtn" data-i18n="playVoice">▶ השמע</button>
            <button class="test-voice-btn vstudio-reset" id="resetVoiceBtn" data-i18n="resetVoice">↺ אפס</button>
          </div>
        </div>

        <div class="settings-section">
          <div class="ss-title" data-i18n="audio">שמע</div>
          <label data-i18n="ambientSound">צליל סביבה</label>
          <select id="ambPresetSel">
            <option value="pad">Soft Pad — רקע רך</option>
            <option value="rain">Rain — גשם</option>
            <option value="ocean">Ocean Waves — גלי ים</option>
            <option value="wind">Gentle Wind — רוח</option>
            <option value="cafe">Café — בית קפה</option>
            <option value="fireplace">Fireplace — אח</option>
            <option value="night">Night Crickets — צרצרים</option>
            <option value="stream">Forest Stream — נחל ביער</option>
            <option value="off">Off — כבוי</option>
          </select>
          <label><span data-i18n="volume">עוצמה</span> <span id="ambVal" class="range-val">40%</span></label>
          <input type="range" id="ambSlider" min="0" max="100" value="40" />
        </div>

        <div class="settings-section">
          <div class="ss-title" data-i18n="pikachuVoice">פיקאצ'ו</div>
          <div class="setting-row">
            <label data-i18n="pikaVoiceOn">קול פיקאצ'ו</label>
            <label class="toggle"><input type="checkbox" id="pikaVoiceCheck" checked /><span class="toggle-slider"></span></label>
          </div>
          <label><span data-i18n="pikaVolume">עוצמת קול פיקאצ'ו</span> <span id="pikaVolVal" class="range-val">60%</span></label>
          <input type="range" id="pikaVolSlider" min="0" max="100" value="60" />
          <label><span data-i18n="pikaPitch">גובה קול פיקאצ'ו</span> <span id="pikaPitchVal" class="range-val">1.4</span></label>
          <input type="range" id="pikaPitchSlider" min="50" max="800" value="140" />
          <button class="test-voice-btn" id="pikaSpeakBtn" data-i18n="pikaSpeakNow">פיקה פיקה!</button>
        </div>

        <div class="settings-section">
          <div class="ss-title" data-i18n="aiEngineTitle">מנוע AI</div>
          <label data-i18n="aiProvider">ספק AI</label>
          <select id="providerSel">
            <option value="puter" data-i18n="puterFree">Puter — חינם, בלי מפתח</option>
            <option value="gemini">Gemini (Google)</option>
            <option value="grok">Grok (xAI)</option>
            <option value="openai">ChatGPT (OpenAI)</option>
          </select>
          <label data-i18n="puterModel">מודל Puter (חינם)</label>
          <select id="puterModelSel">
            <option value="gpt-4o-mini">GPT-4o mini (fast)</option>
            <option value="gpt-4o">GPT-4o (smartest)</option>
            <option value="o4-mini">o4-mini (reasoning)</option>
            <option value="claude-sonnet-4">Claude Sonnet 4</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
          </select>
          <p style="margin:2px 0 10px;font-size:11px;color:var(--dim)" data-i18n="puterDesc">Puter בחינם — חלון התחברות חד-פעמי יופיע בשימוש ראשון. מפתחות למטה הם אופציונליים.</p>
          <label data-i18n="geminiKey">מפתח Gemini API</label><input id="keyInput" type="password" placeholder="AIza..." />
          <label data-i18n="grokKey">מפתח Grok API</label><input id="grokKeyInput" type="password" placeholder="xai-..." />
          <label data-i18n="openaiKey">מפתח OpenAI API</label><input id="openaiKeyInput" type="password" placeholder="sk-..." />
        </div>

        <div class="settings-section">
          <div class="ss-title" data-i18n="cloudSync">סנכרון ענן</div>
          <p style="margin:0 0 10px;font-size:11px;color:var(--dim);line-height:1.5">סנכרן את כל הנתונים ל-Google Drive. דורש Google OAuth Client ID מ-<a href="https://console.cloud.google.com/apis/credentials" target="_blank" style="color:var(--gold)">Google Cloud Console</a>.</p>
          <label>Google OAuth Client ID</label>
          <input id="driveClientId" type="text" placeholder="xxxx.apps.googleusercontent.com" style="font-size:11px" />
          <div style="display:flex;gap:8px;margin:10px 0;flex-wrap:wrap">
            <button class="cloud-btn" id="driveConnectBtn" data-i18n="connectDrive">חבר Google Drive</button>
            <button class="cloud-btn" id="driveUploadBtn" disabled data-i18n="backupDrive">גיבוי ל-Drive</button>
            <button class="cloud-btn" id="driveDownloadBtn" disabled data-i18n="restoreDrive">שחזור מ-Drive</button>
          </div>
          <div class="cloud-status" id="driveStatus"></div>
          <div style="border-top:1px solid rgba(218,165,32,.08);margin:12px 0;padding-top:10px">
            <p style="font-size:11px;color:var(--dim);margin-bottom:8px" data-i18n="noGoogle">אין חשבון Google? ייצא/ייבא קובץ גיבוי ישירות:</p>
            <div style="display:flex;gap:8px">
              <button class="cloud-btn" id="localExportBtn" data-i18n="exportJson">ייצוא JSON</button>
              <button class="cloud-btn" id="localImportBtn" data-i18n="importJson">ייבוא JSON</button>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <div class="ss-title" data-i18n="connectedServices">שירותים מחוברים</div>
          <div class="social-grid">
            <div class="social-item" id="socialSpotify">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5-1 4-1 4 1 4 1M7 12s2-1.5 5-1.5 5 1.5 5 1.5M6.5 9S9 7 12 7s5.5 2 5.5 2"/></svg>
              <span>Spotify</span>
              <input type="text" id="spotifyId" placeholder="Username or URI" />
              <span class="social-status" id="spotifyStatus"></span>
            </div>
            <div class="social-item" id="socialTiktok">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12a4 4 0 104 4V4a5 5 0 005 5"/></svg>
              <span>TikTok</span>
              <input type="text" id="tiktokId" placeholder="@username" />
              <span class="social-status" id="tiktokStatus"></span>
            </div>
            <div class="social-item" id="socialInsta">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg>
              <span>Instagram</span>
              <input type="text" id="instaId" placeholder="@username" />
              <span class="social-status" id="instaStatus"></span>
            </div>
            <div class="social-item" id="socialFb">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              <span>Facebook</span>
              <input type="text" id="fbId" placeholder="Profile URL" />
              <span class="social-status" id="fbStatus"></span>
            </div>
          </div>
        </div>

        <div class="settings-section">
          <div class="ss-title" data-i18n="shortcuts">קיצורי מקלדת</div>
          <div id="shortcutsList" style="font-size:13px"></div>
        </div>

        <button class="go" id="saveBtn" data-i18n="save">שמור</button>
      </div></div>
      <div class="hg-overlay" id="hgOverlay">
        <div class="hg-frame">
          <div class="hg-topbar">
            <span class="hg-topbar-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> הביגארד OS</span>
            <button class="hg-close" id="hgClose">✕</button>
          </div>
          <iframe id="hgIframe" class="hg-iframe" src="" allow="camera;microphone"></iframe>
        </div>
      </div>
      <div class="search-overlay" id="searchOverlay">
        <div class="search-card">
          <div class="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input id="searchInput" type="text" placeholder="חפש הכל…" autocomplete="off" />
            <kbd class="search-esc">ESC</kbd>
          </div>
          <div class="search-results" id="searchResults"></div>
        </div>
      </div>
      <button class="fab" id="fabBtn" title="פעולות מהירות">+</button>
      <div class="fab-menu" id="fabMenu">
        <button class="fab-item" data-action="task" data-i18n="quickTask">✓ משימה מהירה</button>
        <button class="fab-item" data-action="note" data-i18n="quickNote">📝 הערה מהירה</button>
        <button class="fab-item" data-action="timer" data-i18n="startTimer">⏱ התחל טיימר</button>
        <button class="fab-item" data-action="briefing" data-i18n="briefing">📊 תדריך</button>
        <button class="fab-item" data-action="search" data-i18n="fabSearch">🔍 חיפוש</button>
      </div>
      <div class="ar-overlay" id="arOverlay">
        <div class="ar-frame">
          <div class="ar-topbar">
            <span class="ar-topbar-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2"/><circle cx="12" cy="12" r="3"/></svg> מצלמת AR</span>
            <div class="ar-topbar-tools">
              <button class="ar-tool-btn" id="arAddBall" title="כדור">⚽</button>
              <button class="ar-tool-btn" id="arAddCube" title="קוביה">🔲</button>
              <button class="ar-tool-btn" id="arAddStar" title="כוכב">⭐</button>
              <button class="ar-tool-btn" id="arAddDiamond" title="יהלום">💎</button>
              <button class="ar-tool-btn" id="arAddCoin" title="מטבע">🪙</button>
              <button class="ar-tool-btn" id="arAddPortal" title="פורטל">🌀</button>
              <button class="ar-tool-btn ar-fx-btn" id="arFxFire" title="אש">🔥</button>
              <button class="ar-tool-btn ar-fx-btn" id="arFxWater" title="מים">💧</button>
              <button class="ar-tool-btn ar-fx-btn" id="arFxLaser" title="לייזר">⚡</button>
              <button class="ar-tool-btn ar-fx-btn" id="arFxSparkle" title="ניצוצות">✨</button>
              <button class="ar-tool-btn ar-fx-btn" id="arFxRainbow" title="קשת">🌈</button>
              <button class="ar-tool-btn" id="arAddGravity" title="כוח משיכה">🌑</button>
              <button class="ar-tool-btn" id="arAddTrampoline" title="טרמפולינה">🔼</button>
              <button class="ar-tool-btn" id="arClearObjs" title="נקה הכל">🗑️</button>
            </div>
            <button class="ar-close" id="arClose">✕</button>
          </div>
          <div class="ar-viewport" id="arViewport">
            <video id="arVideo" autoplay playsinline muted></video>
            <canvas id="arCanvas"></canvas>
            <canvas id="arFxCanvas"></canvas>
            <canvas id="arObjCanvas"></canvas>
            <div class="ar-hud" id="arHud">
              <div class="ar-status" id="arStatus">מאתחל מצלמה…</div>
              <div class="ar-hand-indicator" id="arHandIndicator"></div>
            </div>
            <div class="ar-game-bar" id="arGameBar">
              <button class="ar-game-btn" id="arGameCatch" title="Catch coins!">🎮 Catch</button>
              <button class="ar-game-btn" id="arGameTarget" title="Hit targets!">🎯 Target</button>
              <button class="ar-game-btn" id="arGameZen" title="Zen mode">🧘 Zen</button>
            </div>
            <div class="ar-buttons" id="arButtons"></div>
          </div>
        </div>
      </div>
    </div>
  `;let n=e=>document.getElementById(e),r=Bp(),i=new T_;i.ambLevel=r.ambLevel,i.ambPreset=r.ambPreset||`pad`,i.sfxOn=r.sfxOn,zf(r.pikaVolume),Bf(r.pikaPitch),Vf(r.pikaVoiceOn);let a;try{a=fp(n(`stage`))}catch{a={setEnergy(){},pikaEmote(){},dispose(){},startBodyDetection(){},stopBodyDetection(){}}}hf(()=>{a.setEnergy(.95),setTimeout(()=>a.setEnergy(.06),900)}),pp(t.querySelector(`.app`));function o(e){t.querySelectorAll(`[data-i18n]`).forEach(t=>{let n=t.dataset.i18n,r=Zy(n,e);t.tagName===`INPUT`?t.placeholder=r:t.textContent=r}),t.querySelectorAll(`[data-i18n-ph]`).forEach(t=>{t.placeholder=Zy(t.dataset.i18nPh,e)});let r=n(`input`);r&&(r.placeholder=Zy(`inputPlaceholder`,e));let i=document.getElementById(`searchInput`);i&&(i.placeholder=Zy(`searchPlaceholder`,e));let a=document.getElementById(`fabBtn`);a&&(a.title=Zy(`quickActions`,e)),document.documentElement.dir=e===`he`?`rtl`:`ltr`,document.documentElement.lang=e}o(r.uiLang),n(`uiLangSel`).value=r.uiLang,n(`uiLangSel`).addEventListener(`change`,()=>{r.uiLang=n(`uiLangSel`).value,o(r.uiLang),Vp(r)});let s=null,c=null;async function l(){if(s){s.open();return}c||=e(()=>Promise.resolve().then(()=>my).then(e=>(s=e.mountCockpit(t.querySelector(`.app`),{ask:e=>{w(e,`me`),M(e)},addMsgSys:e=>w(e,`sys`)}),s)),void 0).catch(e=>(console.error(`cockpit mount failed`,e),null)),(await c)?.open()}(function(){let e=[`#hgOverlay`,`#arOverlay`,`.cockpit-overlay`],t=()=>{let t=e.some(e=>{let t=document.querySelector(e);return t&&t.classList.contains(`show`)});document.body.classList.toggle(`bg-paused`,t||document.hidden)},n=new MutationObserver(t);e.forEach(e=>{let t=document.querySelector(e);t&&n.observe(t,{attributes:!0,attributeFilter:[`class`]})}),document.addEventListener(`visibilitychange`,t),setTimeout(()=>{let e=document.querySelector(`.cockpit-overlay`);e&&n.observe(e,{attributes:!0,attributeFilter:[`class`]}),t()},0),t()})();let u=document.createElement(`button`);u.className=`chip module-chip`,u.id=`moduleChip`,u.innerHTML=`<span class="mc-dot"></span><span class="mc-label">${r.uiLang===`he`?`מוח`:`BRAIN`}</span>`,u.title=r.uiLang===`he`?`פתח לוח בקרה ראשי`:`Open Master Brain cockpit`,u.onclick=()=>l();let d=t.querySelector(`.topR`);d&&d.insertBefore(u,d.firstChild);function f(e){let t=im(e),n=u.querySelector(`.mc-label`),i=u.querySelector(`.mc-dot`);t?(n.textContent=t.label.toUpperCase(),i.style.background=`hsl(${t.hue}, 70%, 55%)`,i.style.boxShadow=`0 0 8px hsla(${t.hue}, 70%, 55%, .6)`,u.classList.add(`active`)):(n.textContent=r.uiLang===`he`?`מוח`:`BRAIN`,i.style.background=`var(--gold)`,i.style.boxShadow=`0 0 8px rgba(218,165,32,.5)`)}try{B_((e,t)=>w(`🔔 ${e} — ${t}`,`sys`))}catch{}try{let e=ev();e>0&&w(`📋 נוצרו ${e} משימות חוזרות להיום.`,`sys`)}catch{}try{let e=yv();if(e.corrupted.length){let t=0;for(let n of e.corrupted)bv(n)&&t++;w(`⚠️ שלמות נתונים: ${e.corrupted.length} מאגרים היו פגומים, ${t} תוקנו אוטומטית.`,`sys`)}}catch{}{let e=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||window.innerWidth<768,t=n(`stage`),r=document.createElement(`div`);r.className=`ai-nodes`;let a=e?[`Memory`,`Calendar`,`Tasks`,`Search`,`Translate`,`Analytics`,`Assistant`,`Weather`,`Music`,`Notes`]:[`Researcher`,`Strategist`,`Finance`,`Memory`,`Design`,`Calendar`,`Engineering`,`Social`,`Analytics`,`Ops`,`Developer`,`Sales`,`DM`,`Chief of Staff`],o=e?40:50,s=e?42:44,c=e?28:40,l=document.createElementNS(`http://www.w3.org/2000/svg`,`svg`);l.setAttribute(`class`,`ai-nodes-svg`),l.setAttribute(`viewBox`,`0 0 100 100`),l.setAttribute(`preserveAspectRatio`,`none`),r.appendChild(l);let u={Researcher:`Help me research a topic`,Strategist:`Help me plan a strategy`,Finance:`Help me with financial analysis`,Memory:`What do you remember about me?`,Design:`Help me with design`,Engineering:`Help me with engineering`,Social:`Check my social media`,Analytics:`Show me analytics and insights`,Ops:`Help me with operations`,Developer:`Help me write code`,Sales:`Help me with sales strategy`,DM:`Help me draft a message`,"Chief of Staff":`What are my priorities today?`,Tasks:`Show me my tasks`,Search:`Search the web for me`,Translate:`Translate something for me`,Assistant:`How can you help me?`,Weather:`What's the weather today?`,Music:`Play some music`,Notes:`Help me take notes`};a.forEach((e,t)=>{let n=t/a.length*Math.PI*2-Math.PI/2,d=50+Math.cos(n)*s,f=o+Math.sin(n)*c,p=document.createElementNS(`http://www.w3.org/2000/svg`,`line`);p.setAttribute(`x1`,`50`),p.setAttribute(`y1`,String(o)),p.setAttribute(`x2`,String(d)),p.setAttribute(`y2`,String(f)),p.setAttribute(`class`,`ai-node-line`),l.appendChild(p);let m=document.createElement(`div`);m.className=`ai-node`,m.style.left=d+`%`,m.style.top=f+`%`,m.style.pointerEvents=`all`,m.style.cursor=`pointer`,m.innerHTML=`<span class="ai-node-dot"></span><span class="ai-node-lbl">${e}</span>`,m.onclick=()=>{if(e===`Calendar`){j();return}let t=u[e]||`Help me with ${e}`;i.send(),w(t,`me`),M(t)},r.appendChild(m)}),t.appendChild(r)}let p={spotify:localStorage.getItem(`alpha_social_spotify`)||``,tiktok:localStorage.getItem(`alpha_social_tiktok`)||``,insta:localStorage.getItem(`alpha_social_insta`)||``,fb:localStorage.getItem(`alpha_social_fb`)||``};function m(){n(`connSpotify`).classList.toggle(`active`,!!p.spotify),n(`connSocial`).classList.toggle(`active`,!!(p.tiktok||p.insta||p.fb)),n(`spotifyStatus`).textContent=p.spotify?`● מחובר`:``,n(`spotifyStatus`).className=`social-status`+(p.spotify?` on`:``),n(`tiktokStatus`).textContent=p.tiktok?`● מחובר`:``,n(`tiktokStatus`).className=`social-status`+(p.tiktok?` on`:``),n(`instaStatus`).textContent=p.insta?`● מחובר`:``,n(`instaStatus`).className=`social-status`+(p.insta?` on`:``),n(`fbStatus`).textContent=p.fb?`● מחובר`:``,n(`fbStatus`).className=`social-status`+(p.fb?` on`:``)}function h(e){let t={armed:Zy(`armed`,r.uiLang),listening:Zy(`listening`,r.uiLang),thinking:Zy(`thinking`,r.uiLang),speaking:Zy(`speaking`,r.uiLang),"":Zy(`standby`,r.uiLang)}[e];n(`state`).textContent=t,a.setEnergy(e===`speaking`?.95:e===`listening`?.5:e===`armed`?.2:.06),e===`listening`&&a.pikaEmote(`curious`)}let g=new C_(r,e=>{w(e,`me`),M(e)},h);function _(){let e=Up(),t=n(`calBadge`);e.length>0?(t.textContent=String(e.length),t.style.display=`flex`):t.style.display=`none`}_();let v=0,y=0;function b(e){return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/^### (.+)$/gm,`<strong style="display:block;font-size:15px;color:var(--white-glow);margin:6px 0 2px">$1</strong>`).replace(/^## (.+)$/gm,`<strong style="display:block;font-size:16px;color:var(--gold);margin:8px 0 3px;letter-spacing:.3px">$1</strong>`).replace(/^# (.+)$/gm,`<strong style="display:block;font-size:17px;color:var(--gold);margin:10px 0 4px;letter-spacing:.4px">$1</strong>`).replace(/\*\*(.+?)\*\*/g,`<strong>$1</strong>`).replace(/\*(.+?)\*/g,`<em>$1</em>`).replace(/`(.+?)`/g,`<code style="background:rgba(255,255,255,.1);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:.9em">$1</code>`).replace(/^(\d+)\. (.+)$/gm,`<span style="display:block;padding-left:2px"><span style="color:var(--gold);font-weight:600;min-width:18px;display:inline-block">$1.</span> $2</span>`).replace(/^[-•] (.+)$/gm,`<span style="display:block;padding-left:4px"><span style="color:var(--gold);margin-right:6px">•</span>$1</span>`).replace(/^• (.+)$/gm,`<span style="display:block;padding-left:4px"><span style="color:var(--gold);margin-right:6px">•</span>$1</span>`).replace(/\n/g,`<br>`)}let x=null;function S(){let e=n(`chat`);if(!e)return;C(),x=document.createElement(`div`),x.className=`turn al typing-turn`;let t=r.name;x.innerHTML=`<span class="who">${t}</span><div class="txt"><div class="typing-dots"><span></span><span></span><span></span></div></div>`,e.appendChild(x),e.scrollTop=e.scrollHeight}function C(){x&&=(x.remove(),null),n(`chat`)?.querySelectorAll(`.typing-turn`).forEach(e=>e.remove())}function w(e,t){t===`al`&&C();let i={me:Zy(`you`,r.uiLang),al:r.name,sys:Zy(`systemLabel`,r.uiLang)}[t],a=document.createElement(`div`);a.className=`turn `+t,a.innerHTML=`<span class="who">${i}</span><div class="txt"></div>`;let o=n(`chat`);if(o){o.appendChild(a);let n=a.querySelector(`.txt`);if(t===`al`){let t=e.length>180?5:10,r=0,i=()=>{n.innerHTML=b(e.slice(0,r++)),o.scrollTop=o.scrollHeight,r<=e.length&&setTimeout(i,t)};i()}else n.innerHTML=b(e);o.scrollTop=o.scrollHeight}let s=n(`rpBody`),c=document.createElement(`div`);c.className=`rp-msg `+t;let l=new Date;c.innerHTML=`<div class="rp-meta"><span class="rp-who">${i}</span><span class="rp-time">${`${String(l.getHours()).padStart(2,`0`)}:${String(l.getMinutes()).padStart(2,`0`)}`}</span></div><div class="rp-text"></div>`,s.appendChild(c);let u=c.querySelector(`.rp-text`);if(t===`al`){let t=e.length>180?5:10,n=0,r=()=>{u.innerHTML=b(e.slice(0,n++)),s.scrollTop=s.scrollHeight,n<=e.length&&setTimeout(r,t)};r()}else u.innerHTML=b(e);s.scrollTop=s.scrollHeight,v++;let d=document.getElementById(`msgCount`);d&&(d.textContent=String(v));let f=e.split(/\s+/).filter(e=>e.length>0).length;y+=Math.round(f*1.3);let p=document.getElementById(`tokenCount`);p&&(p.textContent=String(y)),wg(e,t),t===`me`&&fg(e)}function T(e){n(`winTitle`).textContent=e,n(`win`).classList.add(`show`),i.open()}n(`winClose`).onclick=()=>{n(`win`).classList.remove(`show`),n(`winBody`).innerHTML=``};function E(e){T(`Video · `+e);let t=`https://www.youtube.com/results?search_query=${encodeURIComponent(e)}`;n(`winBody`).innerHTML=`<div class="pad" style="text-align:center">
      <div style="color:var(--dim);margin-bottom:12px;font-size:13px">מחפש ב-YouTube…</div>
    </div>`,fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(e)}&type=video&maxResults=4&key=AIzaSyDummyKeyForFallback`).then(()=>{}).catch(()=>{});let r=`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(e)}&filter=videos`;fetch(r).then(e=>e.json()).then(r=>{let i=(r.items||[]).slice(0,6);if(!i.length)throw Error(`no results`);let a=``;for(let t of i){let n=(t.url||``).replace(`/watch?v=`,``),r=`https://www.youtube-nocookie.com/embed${n}`,i=t.thumbnail||`https://i.ytimg.com/vi${n}/hqdefault.jpg`;a+=`<div class="media-card" data-embed="${r}">
          <img src="${i}" style="width:100%;border-radius:8px;cursor:pointer" onerror="this.style.display='none'" />
          <div style="padding:8px 0 4px;font-size:13px;font-weight:600;color:var(--ink)">${t.title||e}</div>
          <div style="font-size:11px;color:var(--dim)">${t.uploaderName||``} · ${t.duration?Math.floor(t.duration/60)+`:`+String(t.duration%60).padStart(2,`0`):``}</div>
        </div>`}a+=`<div style="text-align:center;margin-top:12px"><a href="${t}" target="_blank" rel="noopener" style="color:var(--cyan);font-size:12px">חפש עוד ב-YouTube ↗</a></div>`,n(`winBody`).innerHTML=`<div class="pad media-grid">${a}</div>`,n(`winBody`).querySelectorAll(`.media-card`).forEach(e=>{e.style.cursor=`pointer`,e.onclick=()=>{let t=e.dataset.embed||``;n(`winBody`).innerHTML=`<iframe src="${t}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="width:100%;height:100%;border:none"></iframe>`}})}).catch(()=>{n(`winBody`).innerHTML=`<div class="pad" style="text-align:center;padding-top:30px">
        <div style="font-size:40px;margin-bottom:16px">🎬</div>
        <div style="font-size:18px;font-weight:600;color:var(--ink);margin-bottom:8px">${e}</div>
        <div style="color:var(--dim);font-size:13px;margin-bottom:20px">לחץ לפתיחה ב-YouTube</div>
        <a href="${t}" target="_blank" rel="noopener" class="media-link-btn">▶ YouTube</a>
      </div>`})}function D(e){T(`Spotify · `+e);let t=`https://open.spotify.com/search/${encodeURIComponent(e)}`;n(`winBody`).innerHTML=`<div class="pad" style="text-align:center;padding-top:20px">
      <div style="font-size:40px;margin-bottom:16px">🎵</div>
      <div style="font-size:18px;font-weight:600;color:var(--ink);margin-bottom:8px">${e}</div>
      <div style="color:var(--dim);font-size:13px;margin-bottom:20px">לחץ להאזנה ב-Spotify</div>
      <a href="${t}" target="_blank" rel="noopener" class="media-link-btn" style="background:rgba(30,215,96,.15);border-color:rgba(30,215,96,.4);color:#1db954">▶ Spotify</a>
      <div style="margin-top:16px">
        <iframe src="https://open.spotify.com/embed/search/${encodeURIComponent(e)}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="width:100%;height:160px;border:none;border-radius:12px" onerror="this.style.display='none'"></iframe>
      </div>
    </div>`}function O(e){T(`Google Doc`);let t=e.replace(/\/edit.*$/,`/preview`).replace(/\/view.*$/,`/preview`);n(`winBody`).innerHTML=`<div style="display:flex;flex-direction:column;height:100%">
      <iframe src="${t}" style="flex:1;width:100%;border:none;border-radius:8px" allow="autoplay" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
      <div style="text-align:center;padding:8px">
        <a href="${e}" target="_blank" rel="noopener" class="media-link-btn">פתח ב-Google ↗</a>
      </div>
    </div>`}async function k(e){T(`Search · `+e),n(`winBody`).innerHTML=`<div class="pad">מחפש…</div>`;try{let t=(await(await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(e)}&format=json&origin=*&srlimit=8`)).json()).query?.search||[],r=`<div class="pad">`;t.length||(r+=`<div style="color:var(--dim)">לא נמצאו תוצאות.</div>`);for(let e of t)r+=`<a href="https://en.wikipedia.org/?curid=${e.pageid}" target="_blank" style="display:block;color:var(--ink);padding:14px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;margin-bottom:8px;text-decoration:none;transition:.2s"><b>${e.title}</b><br><span style="color:var(--dim);font-size:13px">${e.snippet}…</span></a>`;r+=`<a href="https://www.google.com/search?q=${encodeURIComponent(e)}" target="_blank" style="display:inline-block;margin-top:8px;color:var(--cyan);text-decoration:none;padding:8px 16px;border:1px solid rgba(218,165,32,.2);border-radius:8px">המשך בגוגל ↗</a></div>`,n(`winBody`).innerHTML=r}catch{n(`winBody`).innerHTML=`<div class="pad" style="color:var(--dim)">שגיאת חיפוש.</div>`}}let A=new Date().getFullYear(),ee=new Date().getMonth();function te(e){let t=Up(),i=new Date().toISOString().slice(0,10),a=A,o=ee,s=[`ינואר`,`פברואר`,`מרץ`,`אפריל`,`מאי`,`יוני`,`יולי`,`אוגוסט`,`ספטמבר`,`אוקטובר`,`נובמבר`,`דצמבר`],c=[`א`,`ב`,`ג`,`ד`,`ה`,`ו`,`ש`],l=new Date(a,o,1).getDay(),u=new Date(a,o+1,0).getDate(),d=new Set(t.map(e=>e.date)),f=`<div style="padding:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <button id="calPrev" style="background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:8px;color:var(--ink);padding:6px 12px;cursor:pointer;font-size:16px">‹</button>
        <span style="font-size:17px;font-weight:600;color:var(--ink)">${s[o]} ${a}</span>
        <button id="calNext" style="background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:8px;color:var(--ink);padding:6px 12px;cursor:pointer;font-size:16px">›</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:8px;text-align:center">
        ${c.map(e=>`<div style="color:var(--dim);font-size:11px;padding:4px">${e}</div>`).join(``)}
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">
        ${Array(l).fill(`<div></div>`).join(``)}`;for(let t=1;t<=u;t++){let n=`${a}-${String(o+1).padStart(2,`0`)}-${String(t).padStart(2,`0`)}`,r=n===i,s=n===e,c=d.has(n);f+=`<button data-date="${n}" style="aspect-ratio:1;background:${s?`var(--gold)`:r?`rgba(218,165,32,.18)`:`rgba(255,255,255,.03)`};border:${r&&!s?`1px solid rgba(218,165,32,.5)`:`1px solid transparent`};border-radius:8px;color:${s?`#0a0806`:`var(--ink)`};cursor:pointer;font-size:13px;font-weight:${r||s?`700`:`400`};position:relative;padding:0">
        ${t}${c?`<span style="position:absolute;bottom:3px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:${s?`#0a0806`:`var(--gold)`}"></span>`:``}
      </button>`}if(f+=`</div>`,e){let n=t.filter(t=>t.date===e);f+=`<div style="margin-top:16px;border-top:1px solid var(--line);padding-top:16px">
        <div style="font-size:13px;color:var(--dim);margin-bottom:10px">${e}</div>
        ${n.length===0?`<div style="color:var(--dim);font-style:italic;margin-bottom:12px">אין אירועים</div>`:``}
        ${n.map(e=>`<div style="display:flex;gap:10px;align-items:center;padding:10px;background:rgba(255,255,255,.03);border:1px solid ${e.id.startsWith(`hg:`)?`rgba(255,194,77,.15)`:`var(--line)`};border-radius:10px;margin-bottom:6px">
            ${e.time?`<span style="color:var(--cyan);font-size:12px;min-width:40px">${e.time}</span>`:``}
            <span style="flex:1;font-size:14px">${e.title}</span>
            <button data-id="${e.id}" class="del" style="background:none;border:none;color:var(--dim);cursor:pointer;font-size:15px">✕</button>
          </div>`).join(``)}
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <input id="evT" placeholder="${r.uiLang===`he`?`כותרת אירוע`:`Event title`}" style="flex:1;min-width:120px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:8px;padding:8px 10px;color:var(--ink);font-size:13px">
          <input type="time" id="evTime" style="background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:8px;padding:8px 10px;color:var(--ink);font-size:13px">
          <button id="evAdd" style="background:linear-gradient(135deg,var(--gold),#c8953a);border:none;border-radius:8px;padding:8px 16px;cursor:pointer;color:#0a0806;font-weight:600;font-size:13px">+</button>
        </div>
      </div>`}f+=`</div>`,n(`winBody`).innerHTML=f,n(`calPrev`).onclick=()=>{ee===0?(ee=11,A--):ee--,te(e)},n(`calNext`).onclick=()=>{ee===11?(ee=0,A++):ee++,te(e)},n(`winBody`).querySelectorAll(`[data-date]`).forEach(e=>{e.onclick=()=>te(e.dataset.date)});let p=document.getElementById(`evAdd`);p&&(p.onclick=()=>{let t=n(`evT`).value.trim(),r=n(`evTime`).value;!t||!e||(Kp(t,e,r),_(),te(e))}),n(`winBody`).querySelectorAll(`.del`).forEach(t=>{t.onclick=()=>{Gp(t.dataset.id),_(),te(e)}})}function j(){A=new Date().getFullYear(),ee=new Date().getMonth(),T(r.uiLang===`he`?`לוח שנה`:`Calendar`),te(new Date().toISOString().slice(0,10))}let ne=!1;async function M(e){let t=S_(e);if(t){i.receive(),a.pikaEmote(`excited`),w(t,`al`),g.speak(t);return}if(!(window.puter!==void 0||r.key||r.grokKey||r.openaiKey)){Re();return}if(!ne){ne=!0,h(`thinking`),S();try{let t=vg(e);if(f(t.module),t.switched&&t.module!==`general`){let e=im(t.module);e&&w(`▸ ${e.label} module`,`sys`)}if(t.captured){let e=t.captured.length>70?t.captured.slice(0,70)+`…`:t.captured;Yy(r.uiLang===`he`?`💾 נשמר בזיכרון`:`💾 Saved to memory`,e)}}catch{}try{let t=Jg(await qg(r,e),{onVideo:E,onSearch:k,onCalendar:j,onEvent:Kp,onSpotify:D,onDiary:async(e,t)=>{let n=await ae(`hg2:tasks`),r=Date.now().toString(36)+Math.random().toString(36).slice(2,6);n.unshift({id:r,title:e,date:t,done:!1,ts:Date.now()});let i=window.storage||window.puter?.kv;if(i)try{await i.set(`hg2:tasks`,JSON.stringify(n))}catch{}localStorage.setItem(`hg2:tasks`,JSON.stringify(n))},onHgSearch:se,onHgEarnings:ce,onHgQuote:F,onHgReport:async e=>{let[t,n,r,i,a,o,s,c,l,u,d]=e,f={id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),idNumber:t||``,idType:n||``,contractor:r||``,date:i||new Date().toISOString().slice(0,10),price:parseFloat(a)||0,vehicleType:o||``,manufacturer:s||``,installType:c||``,location:l||``,customer:u||``,phone:d||``,reportedAt:new Date().toISOString()},p=await ae(`hg2:index`);p.unshift(f);let m=window.storage||window.puter?.kv;if(m)try{await m.set(`hg2:index`,JSON.stringify(p))}catch{}localStorage.setItem(`hg2:index`,JSON.stringify(p));let h=new Date(f.reportedAt).toLocaleString(`he-IL`,{timeZone:`Asia/Jerusalem`,hour:`2-digit`,minute:`2-digit`,day:`2-digit`,month:`2-digit`,year:`numeric`});w(`✅ התקנה נשמרה — ${f.idNumber||`ללא מספר`} · דווח ב-${h}`,`sys`)},onArCamera:Ae,onGDoc:O,onTask:(e,t)=>{e&&(Xp(e,t||`med`),w(`✅ ${Zy(`taskAdded`,r.uiLang)}: "${e}"`,`sys`))},onNote:e=>{e&&(em(e),w(`📝 ${Zy(`noteSaved`,r.uiLang)}`,`sys`))},onTimerStart:e=>{ng(e),w(`⏱️ ${Zy(`timerStarted`,r.uiLang)}: ${e}`,`sys`)},onTimerStop:()=>{let e=rg();e&&w(`⏱️ ${Zy(`timerStopped`,r.uiLang)}: ${e.project} — ${sg(e.duration)}`,`sys`)}})||`Done.`;i.receive(),a.pikaEmote(Math.random()<.65?`happy`:`excited`),w(t,`al`),g.speak(t);try{bg(r.history)}catch{}}catch(e){C(),a.pikaEmote(`sad`),g.wakeOn?setTimeout(()=>g.setWake(!0),500):h(``),w(e.message||Zy(`connectionError`,r.uiLang),`sys`)}finally{ne=!1}}}function N(){let e=n(`input`),t=e.value.trim();t&&(e.value=``,i.send(),w(t,`me`),M(t))}n(`sendBtn`).onclick=N,n(`input`).addEventListener(`keydown`,e=>{e.key===`Enter`&&N()}),n(`micBtn`).onclick=()=>{if(!g.supported){w(Zy(`speechNotSupported`,r.uiLang),`al`);return}i.ensure();let e=!g.wakeOn;g.setWake(e),n(`micBtn`).classList.toggle(`on`,e),e?i.micOn():i.micOff()},n(`muteBtn`).onclick=()=>{i.toggleMute()},n(`newChat`).onclick=()=>{r.history=[],n(`rpBody`).innerHTML=``,n(`chat`).innerHTML=``,Tg(),w(r.name+` `+Zy(`readyMsg`,r.uiLang),`al`)};let re=!1;n(`detectBtn`).onclick=()=>{re=!re,re?(a.startBodyDetection(),n(`detectBtn`).classList.add(`active`)):(a.stopBodyDetection(),n(`detectBtn`).classList.remove(`active`))};function ie(){let e=n(`hgIframe`);return(!e.src||e.src===`about:blank`||!e.src.includes(`heavyguard`))&&(e.src=`/Alpha-new/heavyguard.html`),e}n(`hgBtn`).onclick=()=>{ie(),n(`hgOverlay`).classList.add(`show`)},n(`hgClose`).onclick=()=>{n(`hgOverlay`).classList.remove(`show`)},window.addEventListener(`message`,e=>{!e.data||e.data.source!==`heavyguard`||e.data.action===`taskAdded`&&w(`נרשם ביומן: ${e.data.payload.title}`,`sys`)});async function ae(e){let t=window.storage||window.puter?.kv;if(t)try{let n=await t.get(e);if(n&&n.value!=null)return JSON.parse(n.value)}catch{}try{return JSON.parse(localStorage.getItem(e)||`[]`)}catch{return[]}}let oe={kobi:`קובי`,asi:`אסי`,sagi:`שגיא מערכות`,mb:`m.b מערכות`,sd:`ס.ד מיגונים`,hg:`Heavy Guard`};function P(e){return oe[e]||e}async function se(e){let t=e.replace(/[-\s]/g,``).toLowerCase(),r=await ae(`hg2:index`);if(!r.length){w(`אין נתונים ב-HeavyGuard. יש להוסיף רשומות תחילה.`,`sys`);return}let i=r.filter(e=>{if(e.status===`running`)return!1;let n=(e.idNumber||``).replace(/[-\s]/g,``).toLowerCase(),r=(e.customer||``).toLowerCase(),i=(e.vehicleType||``).toLowerCase(),a=(e.manufacturer||``).toLowerCase();return n.includes(t)||t.includes(n)||r.includes(t)||i.includes(t)||a.includes(t)}).map(e=>({id:e.id,idNumber:e.idNumber,idType:e.idType,contractor:P(e.contractor),contractorId:e.contractor,date:e.date,price:e.price,vehicleType:e.vehicleType,manufacturer:e.manufacturer,installType:e.installType,location:e.location,customer:e.customer,phone:e.phone,reportedAt:e.reportedAt||``}));if(!i.length){w(`לא נמצאו תוצאות עבור: ${e}`,`sys`);return}T(`HeavyGuard · חיפוש: ${e}`);let a=`<div class="pad">`;for(let e of i){let t=e.reportedAt?new Date(e.reportedAt).toLocaleString(`he-IL`,{timeZone:`Asia/Jerusalem`,hour:`2-digit`,minute:`2-digit`,day:`2-digit`,month:`2-digit`,year:`numeric`}):``;a+=`<div style="background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:var(--cyan);font-weight:600;font-size:18px;direction:ltr">${e.idNumber||`—`}</span>
          <span style="color:var(--dim);font-size:13px">${e.date||``}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:13px">
          <span><span style="color:var(--dim)">סוג:</span> ${e.idType||``}</span>
          <span><span style="color:var(--dim)">קבלן:</span> ${e.contractor||``}</span>
          <span><span style="color:var(--dim)">רכב:</span> ${e.vehicleType||``} ${e.manufacturer||``}</span>
          <span><span style="color:var(--dim)">התקנה:</span> ${e.installType||``}</span>
          <span><span style="color:var(--dim)">מחיר:</span> <span style="color:var(--gold)">₪${e.price||0}</span></span>
          <span><span style="color:var(--dim)">מיקום:</span> ${e.location||``}</span>
          ${e.customer?`<span><span style="color:var(--dim)">לקוח:</span> ${e.customer}</span>`:``}
          ${e.phone?`<span><span style="color:var(--dim)">טלפון:</span> <a href="tel:${e.phone}" style="color:var(--cyan)">${e.phone}</a></span>`:``}
          ${t?`<span style="grid-column:1/-1;color:var(--dim);font-size:11px;margin-top:4px;border-top:1px solid var(--line);padding-top:4px">⏱ דווח: ${t}</span>`:``}
        </div>
      </div>`}a+=`</div>`,n(`winBody`).innerHTML=a}async function ce(e,t){let r=await ae(`hg2:index`);if(!r.length){w(`אין נתוני הכנסות ב-HeavyGuard.`,`sys`);return}let i=new Date().toISOString().slice(0,7),a=t||i,[o,s]=a.split(`-`).map(Number),c=new Date(o,s-2,1),l=new Date(o,s,1),u=`${c.getFullYear()}-${String(c.getMonth()+1).padStart(2,`0`)}`,d=`${l.getFullYear()}-${String(l.getMonth()+1).padStart(2,`0`)}`,f=a===i,p=r.filter(e=>e.status!==`running`);if(e){let t=e.toLowerCase();p=p.filter(e=>{let n=(e.contractor||``).toLowerCase(),r=P(e.contractor).toLowerCase();return n.includes(t)||r.includes(t)||t.includes(n)||t.includes(r)})}let m=p.filter(e=>(e.date||``).startsWith(a)),h=p.filter(e=>(e.date||``).startsWith(i)),g=p,_={};for(let e of m){let t=P(e.contractor);_[t]||(_[t]={total:0,count:0,jobs:[]}),_[t].total+=e.price||0,_[t].count++,_[t].jobs.push({date:e.date,price:e.price,type:e.installType,vehicle:e.vehicleType,id:e.idNumber})}let v={};for(let e of h){let t=P(e.contractor);v[t]||(v[t]={total:0,count:0}),v[t].total+=e.price||0,v[t].count++}let y={};for(let e of g){let t=P(e.contractor);y[t]||(y[t]={total:0,count:0}),y[t].total+=e.price||0,y[t].count++}let b=m.reduce((e,t)=>e+(t.price||0),0),x=h.reduce((e,t)=>e+(t.price||0),0),S=m.length,C=g.reduce((e,t)=>e+(t.price||0),0),E=[`ינואר`,`פברואר`,`מרץ`,`אפריל`,`מאי`,`יוני`,`יולי`,`אוגוסט`,`ספטמבר`,`אוקטובר`,`נובמבר`,`דצמבר`],[D,O]=a.split(`-`),k=`${E[parseInt(O)-1]} ${D}`,[A,ee]=i.split(`-`),te=`${E[parseInt(ee)-1]} ${A}`;T(`HeavyGuard · הכנסות · ${k}`);let j=`<div class="pad" style="direction:rtl">`;j+=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;padding:6px 10px">
      <button id="earPrev" style="background:none;border:none;color:var(--cyan);font-size:22px;cursor:pointer;padding:4px 10px;border-radius:8px;line-height:1" title="חודש קודם">◀</button>
      <span style="font-weight:600;font-size:15px">${k}</span>
      <button id="earNext" style="background:none;border:none;color:${f?`rgba(255,255,255,.15)`:`var(--cyan)`};font-size:22px;cursor:pointer;padding:4px 10px;border-radius:8px;line-height:1" ${f?`disabled`:``} title="חודש הבא">▶</button>
    </div>`,j+=`<div style="text-align:center;margin-bottom:20px;padding:16px;background:rgba(218,165,32,.06);border-radius:16px;border:1px solid rgba(218,165,32,.15)">
      <div style="font-size:11px;letter-spacing:2px;color:var(--dim);text-transform:uppercase;margin-bottom:4px">${k}</div>
      <div style="font-size:36px;font-weight:700;color:var(--gold);direction:ltr">₪${b.toLocaleString()}</div>
      <div style="color:var(--dim);font-size:13px;margin-top:4px">${S} עבודות</div>
      ${f?``:`<div style="color:var(--cyan);font-size:12px;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,.06)">${te} (החודש): ₪${x.toLocaleString()} · ${h.length} עבודות</div>`}
      ${C===b?``:`<div style="color:var(--dim);font-size:11px;margin-top:4px;opacity:.6">סה"כ כללי: ₪${C.toLocaleString()}</div>`}
    </div>`;let ne=Object.entries(_).sort((e,t)=>t[1].total-e[1].total);ne.length||(j+=`<div style="text-align:center;color:var(--dim);padding:20px">אין עבודות לחודש זה</div>`);for(let[e,t]of ne){let n=b?Math.round(t.total/b*100):0,r=y[e],i=v[e],a=`ej_`+e.replace(/\s/g,`_`);j+=`<div style="background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-weight:600;font-size:15px">${e}</span>
          <span style="color:var(--gold);font-weight:700;font-size:18px;direction:ltr">₪${t.total.toLocaleString()}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <div style="flex:1;background:rgba(255,255,255,.06);border-radius:4px;height:8px;overflow:hidden">
            <div style="width:${n}%;height:100%;background:linear-gradient(90deg,var(--gold),var(--cyan));border-radius:4px;transition:width .5s"></div>
          </div>
          <span style="color:var(--dim);font-size:12px;min-width:60px;text-align:left">${n}% · ${t.count} עבודות</span>
        </div>
        ${!f&&i?`<div style="font-size:12px;color:var(--cyan);margin-bottom:6px;padding:5px 10px;background:rgba(0,212,255,.06);border-radius:8px;display:inline-block">${te}: ₪${i.total.toLocaleString()} (${i.count} עבודות)</div>`:``}
        ${r?`<div style="font-size:11px;color:var(--dim);opacity:.6">סה"כ כללי: ₪${r.total.toLocaleString()} (${r.count} עבודות)</div>`:``}
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
        <button data-target="${a}" style="background:none;border:1px solid var(--line);color:var(--cyan);padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;transition:.2s" class="earningsToggle">פרטי עבודות ▼</button>
        <button data-send="${a}" data-name="${e}" style="background:none;border:1px solid rgba(218,165,32,.4);color:var(--gold);padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;transition:.2s" class="earningsSend">📤 שלח דוח לקבלן</button>
        </div>
        <div id="${a}" style="display:none;margin-top:8px">
          ${t.jobs.map(e=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(218,165,32,.05);font-size:12px">
            <span style="color:var(--dim)">${e.date||``} · ${e.type||``} · ${e.vehicle||``}</span>
            <span style="color:var(--gold);direction:ltr">₪${(e.price||0).toLocaleString()}</span>
          </div>`).join(``)}
        </div>
      </div>`}j+=`</div>`,n(`winBody`).innerHTML=j;let M=document.getElementById(`earPrev`),N=document.getElementById(`earNext`);M&&(M.onclick=()=>ce(e,u)),N&&!f&&(N.onclick=()=>ce(e,d)),n(`winBody`).querySelectorAll(`.earningsToggle`).forEach(e=>{e.onclick=()=>{let t=document.getElementById(e.dataset.target||``);if(t){let n=t.style.display!==`none`;t.style.display=n?`none`:`block`,e.textContent=n?`פרטי עבודות ▼`:`הסתר ▲`}}}),n(`winBody`).querySelectorAll(`.earningsSend`).forEach(e=>{e.onclick=async()=>{let t=e.dataset.name||``,n=_[t];if(!n)return;let r=[];r.push(`דוח עבודות — ${t}`),r.push(`חודש: ${k}`),r.push(`────────────────────`),[...n.jobs].sort((e,t)=>(e.date||``).localeCompare(t.date||``)).forEach((e,t)=>{let n=e.date?new Date(e.date).toLocaleDateString(`he-IL`,{day:`2-digit`,month:`2-digit`,year:`numeric`}):`—`,i=[e.type,e.vehicle].filter(Boolean).join(` · `)||`התקנה`,a=e.id?` (${e.id})`:``;r.push(`${t+1}. ${n} · ${i}${a} — ₪${(e.price||0).toLocaleString()}`)}),r.push(`────────────────────`),r.push(`סה"כ ${n.count} עבודות: ₪${n.total.toLocaleString()}`),r.push(``),r.push(`* לפני הוצאת חשבונית — נא לאשר את הנתונים.`);let i=r.join(`
`);try{navigator.share?await navigator.share({title:`דוח ${t} · ${k}`,text:i}):(await navigator.clipboard.writeText(i),w(`📋 הדוח של ${t} הועתק — אפשר להדביק בוואטסאפ`,`sys`))}catch{window.open(`https://wa.me/?text=${encodeURIComponent(i)}`,`_blank`)}}})}async function F(e,t,n){let r=n.split(`,`).map(e=>{let[t,n]=e.trim().split(`:`);return{description:(t||``).trim(),price:parseFloat(n)||0,qty:1}}).filter(e=>e.description),i={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),customer:e||``,phone:t||``,items:r,total:r.reduce((e,t)=>e+(t.price||0)*(t.qty||1),0),date:new Date().toISOString().slice(0,10),status:`draft`,ts:Date.now()},a=await ae(`hg2:quotes`);a.unshift(i);let o=window.storage||window.puter?.kv;if(o)try{await o.set(`hg2:quotes`,JSON.stringify(a))}catch{}localStorage.setItem(`hg2:quotes`,JSON.stringify(a)),w(`הצעת מחיר נוצרה עבור ${e||`לקוח`}`,`sys`)}let le=null,ue=0,de=[],fe={x:-1,y:-1,pinching:!1},pe={x:-1,y:-1,pinching:!1},I=null,L=null,me=0,he=0,ge=0,_e=`sandbox`,ve=!1,ye=0,R=0,be=[],xe=`none`,Se=[],Ce=null,z=`none`,we=null,Te=[],B=[];function Ee(e,t,n,r){let i=e*n,a=t*r,o=z===`laser`?1:4;for(let e=0;e<o;e++){let t=20+Math.random()*15;switch(z){case`fire`:Te.push({x:i+(Math.random()-.5)*t,y:a+(Math.random()-.5)*t,vx:(Math.random()-.5)*3,vy:-2-Math.random()*5,life:1,maxLife:.6+Math.random()*.5,size:6+Math.random()*10,color:[`#ff4400`,`#ff7700`,`#ffaa00`,`#ffdd44`,`#ff2200`][Math.floor(Math.random()*5)],alpha:.9});break;case`water`:Te.push({x:i+(Math.random()-.5)*t,y:a,vx:(Math.random()-.5)*2,vy:2+Math.random()*4,life:1,maxLife:.8+Math.random()*.4,size:4+Math.random()*6,color:[`#00aaff`,`#44ccff`,`#0088dd`,`#66ddff`,`#0066cc`][Math.floor(Math.random()*5)],alpha:.7});break;case`laser`:B.push({x:i,y:a,t:Date.now()}),B.length>30&&B.shift();break;case`sparkle`:Te.push({x:i+(Math.random()-.5)*t*2,y:a+(Math.random()-.5)*t*2,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4,life:1,maxLife:.5+Math.random()*.5,size:2+Math.random()*5,color:[`#fff`,`#ffd700`,`#ff69b4`,`#00ffff`,`#ff4444`,`#44ff44`][Math.floor(Math.random()*6)],alpha:1});break;case`rainbow`:{let n=Math.random()*Math.PI*2,r=1+Math.random()*3,o=(Date.now()/10+e*60)%360;Te.push({x:i+(Math.random()-.5)*t,y:a+(Math.random()-.5)*t,vx:Math.cos(n)*r,vy:Math.sin(n)*r,life:1,maxLife:.7+Math.random()*.5,size:5+Math.random()*7,color:`hsl(${o},100%,60%)`,alpha:.85});break}}}}function De(){if(!we)return;let e=we.canvas,t=we;if(t.clearRect(0,0,e.width,e.height),z===`laser`&&B.length>1){let e=Date.now();if(B=B.filter(t=>e-t.t<500),B.length>1){t.save(),t.lineCap=`round`,t.lineJoin=`round`;for(let e=3;e>=0;e--){t.beginPath();let n=e===3?.1:e===2?.2:e===1?.5:1,r=e===3?20:e===2?12:e===1?6:2;t.strokeStyle=e===0?`#fff`:`rgba(255,40,40,${n})`,t.lineWidth=r,t.shadowColor=`#ff0000`,t.shadowBlur=e===3?30:0,t.moveTo(B[0].x,B[0].y);for(let e=1;e<B.length;e++)t.lineTo(B[e].x,B[e].y);t.stroke()}t.restore()}}for(let e=Te.length-1;e>=0;e--){let n=Te[e];if(n.x+=n.vx,n.y+=n.vy,n.life-=.016666666666666666/n.maxLife,z===`fire`&&(n.vy-=.15),z===`water`&&(n.vy+=.1),n.life<=0){Te.splice(e,1);continue}let r=n.life*n.alpha;if(t.save(),t.globalAlpha=r,z===`sparkle`){t.translate(n.x,n.y),t.rotate(Date.now()/200+e),t.fillStyle=n.color,t.shadowColor=n.color,t.shadowBlur=8;for(let e=0;e<4;e++)t.fillRect(-n.size*.15,-n.size,n.size*.3,n.size*2),t.rotate(Math.PI/4)}else t.beginPath(),t.arc(n.x,n.y,n.size*(z===`fire`?.5+n.life*.5:1),0,Math.PI*2),t.fillStyle=n.color,z===`fire`&&(t.shadowColor=n.color,t.shadowBlur=15),t.fill();t.restore()}if(fe.x>=0&&z!==`none`){let e=we.canvas;Ee(fe.x,fe.y,e.width,e.height)}}function Oe(e){let t={ball:[`#daa520`,`#f5e6c8`,`#e8a040`,`#c8956a`,`#f0d090`],cube:[`#daa520`,`#c8956a`,`#d4a84d`,`#e8a040`,`#f0d090`],star:[`#ffd700`,`#fff`,`#ff69b4`,`#44ff44`,`#00ffff`],diamond:[`#00ffff`,`#ff69b4`,`#ffd700`,`#a855f7`,`#44ff44`],coin:[`#ffd700`,`#ffaa00`,`#daa520`],bomb:[`#333`,`#555`,`#222`],portal:[`#a855f7`,`#7c3aed`,`#6d28d9`]},n={ball:0,cube:0,star:0,diamond:0,coin:10,bomb:-20,portal:0},r=t[e]||t.ball;de.push({x:.3+Math.random()*.4,y:e===`coin`?-.05:.15+Math.random()*.3,vx:(Math.random()-.5)*.003,vy:e===`coin`?.002:0,r:e===`coin`?.025:e===`bomb`?.03:e===`star`||e===`diamond`?.035:.04,type:e,color:r[Math.floor(Math.random()*r.length)],rotation:0,rotSpd:(Math.random()-.5)*.05,grabbed:!1,hp:e===`bomb`?1:3,age:0,points:n[e]||0,glow:0,trail:[]})}function V(){if(_e===`catch`){let e=Math.random();Oe(e<.6?`coin`:e<.85?`star`:`bomb`)}else if(_e===`target`){let e=Math.random();Oe(e<.5?`diamond`:e<.8?`star`:`coin`)}}function ke(e,t,n,r){be.push({x:e,y:t,text:n,life:1,color:r})}function H(e,t,n,r){for(let i=0;i<20;i++){let i=Math.random()*Math.PI*2,a=2+Math.random()*6;Te.push({x:e*n,y:t*r,vx:Math.cos(i)*a,vy:Math.sin(i)*a,life:1,maxLife:.4+Math.random()*.3,size:4+Math.random()*8,color:[`#ff4400`,`#ff7700`,`#ffaa00`,`#ff2200`][Math.floor(Math.random()*4)],alpha:1})}}function U(){if(!L)return;let e=L.canvas;L.clearRect(0,0,e.width,e.height);let t=e.width,n=e.height,r=1/60;ve&&(ye-=r,R-=r,R<=0&&(V(),R=_e===`catch`?.8+Math.random()*.6:1.5+Math.random()),ye<=0&&(ve=!1,ke(.5,.4,`GAME OVER! Score: ${me}`,`#ffd700`)),ge-=r,ge<=0&&(he=0));for(let e of Se){let r=L;r.save();let i=r.createRadialGradient(e.x*t,e.y*n,0,e.x*t,e.y*n,e.r*Math.min(t,n));i.addColorStop(0,`hsla(${e.hue}, 100%, 60%, 0.15)`),i.addColorStop(.7,`hsla(${e.hue}, 100%, 60%, 0.05)`),i.addColorStop(1,`transparent`),r.fillStyle=i,r.beginPath(),r.arc(e.x*t,e.y*n,e.r*Math.min(t,n),0,Math.PI*2),r.fill(),r.restore()}if(Ce){let e=L,r=Ce.x*t,i=Ce.y*n,a=Ce.w*t;e.save();let o=e.createLinearGradient(r-a/2,i,r+a/2,i);o.addColorStop(0,`rgba(218,165,32,0.1)`),o.addColorStop(.5,`rgba(218,165,32,0.4)`),o.addColorStop(1,`rgba(218,165,32,0.1)`),e.fillStyle=o,e.fillRect(r-a/2,i-3,a,6),e.shadowColor=`#daa520`,e.shadowBlur=Ce.active?20:8,e.strokeStyle=`#daa520`,e.lineWidth=2,e.beginPath(),e.moveTo(r-a/2,i),e.quadraticCurveTo(r,Ce.active?i-12:i+4,r+a/2,i),e.stroke(),e.restore(),Ce.active=!1}for(let e=de.length-1;e>=0;e--){let i=de[e];if(i.age+=r,i.glow=Math.sin(i.age*4)*.3+.7,!i.grabbed){i.vy+=15e-5,i.x+=i.vx,i.y+=i.vy,i.rotation+=i.rotSpd;for(let e of Se){let t=e.x-i.x,n=e.y-i.y,r=Math.hypot(t,n);if(r<e.r&&r>.01){let a=e.strength*3e-4/r;i.vx+=t*a,i.vy+=n*a}}if(Ce){let e=Ce.y,t=Ce.x,n=Ce.w/2;i.y+i.r>e-.01&&i.y+i.r<e+.02&&i.x>t-n&&i.x<t+n&&i.vy>0&&(i.vy=-Math.abs(i.vy)*1.8-.008,Ce.active=!0)}if(i.x-i.r<0&&(i.x=i.r,i.vx=Math.abs(i.vx)*.7),i.x+i.r>1&&(i.x=1-i.r,i.vx=-Math.abs(i.vx)*.7),i.y+i.r>.95&&(i.y=.95-i.r,i.vy=-Math.abs(i.vy)*.6,i.vx*=.95),i.y-i.r<0&&(i.y=i.r,i.vy=Math.abs(i.vy)*.7),ve&&i.type===`coin`&&i.y>.98){de.splice(e,1);continue}}(i.type===`star`||i.type===`coin`||i.type===`diamond`)&&(i.trail.push({x:i.x,y:i.y,t:Date.now()}),i.trail.length>8&&i.trail.shift());let a=[fe,pe];for(let r of a){if(r.x<0)continue;let a=i.x-r.x,o=i.y-r.y,s=Math.hypot(a,o);if(s<i.r+.04){if(ve&&(i.type===`coin`||i.type===`star`||i.type===`diamond`)){let r=i.type===`coin`?10:i.type===`star`?25:50;he++,ge=2;let a=Math.min(he,10);me+=r*a,ke(i.x,i.y,`+${r*a}`,i.type===`coin`?`#ffd700`:`#00ffff`),he>=5&&ke(i.x,i.y-.05,`${he}x COMBO!`,`#ff69b4`),H(i.x,i.y,t,n),de.splice(e,1);continue}if(ve&&i.type===`bomb`){me=Math.max(0,me-20),he=0,ke(i.x,i.y,`-20`,`#ff4444`),H(i.x,i.y,t,n),de.splice(e,1);continue}if(r===fe&&r.pinching&&!I&&(I=i,i.grabbed=!0),!i.grabbed&&s>0){let e=.008/Math.max(s,.01);i.vx+=a*e,i.vy+=o*e,i.rotSpd+=(Math.random()-.5)*.03}}}if(i.grabbed&&I===i)if(fe.pinching)i.x+=(fe.x-i.x)*.3,i.y+=(fe.y-i.y)*.3,i.vx=0,i.vy=0;else{i.grabbed=!1;let e=(fe.x-i.x)*.5,t=(fe.y-i.y)*.5;I=null,i.vx=e||(Math.random()-.5)*.005,i.vy=t||-.002}for(let e of de){if(e===i)continue;let r=i.x-e.x,a=i.y-e.y,o=Math.hypot(r,a),s=i.r+e.r;if(o<s&&o>0){if((i.type===`portal`||e.type===`portal`)&&i.type!==e.type){let r=i.type===`portal`?e:i,a=i.type===`portal`?i:e;r.x=Math.random()*.6+.2,r.y=Math.random()*.4+.1,r.vx*=.5,r.vy*=.5,H(a.x,a.y,t,n);continue}let c=r/o,l=a/o,u=(s-o)*.5;i.x+=c*u,i.y+=l*u,e.x-=c*u,e.y-=l*u;let d=(i.vx-e.vx)*c+(i.vy-e.vy)*l;d<0&&(i.vx-=d*c*.5,i.vy-=d*l*.5,e.vx+=d*c*.5,e.vy+=d*l*.5)}}if(i.trail.length>1){let e=L;e.save();for(let r=0;r<i.trail.length-1;r++){let a=i.trail[r],o=r/i.trail.length*.3;e.beginPath(),e.arc(a.x*t,a.y*n,i.r*Math.min(t,n)*.3*(r/i.trail.length),0,Math.PI*2),e.fillStyle=i.color.replace(`)`,`,${o})`).replace(`rgb`,`rgba`),i.color.startsWith(`#`)&&(e.fillStyle=`rgba(218,165,32,${o})`),e.fill()}e.restore()}let o=i.x*t,s=i.y*n,c=i.r*Math.min(t,n),l=L;switch(l.save(),l.translate(o,s),l.rotate(i.rotation),l.shadowColor=i.color,l.shadowBlur=i.grabbed?25:12*i.glow,i.type){case`ball`:{let e=l.createRadialGradient(-c*.3,-c*.3,c*.1,0,0,c);e.addColorStop(0,`#fff`),e.addColorStop(.3,i.color),e.addColorStop(1,`rgba(0,0,0,0.3)`),l.beginPath(),l.arc(0,0,c,0,Math.PI*2),l.fillStyle=e,l.fill(),l.strokeStyle=`rgba(255,255,255,0.3)`,l.lineWidth=1.5,l.stroke();break}case`cube`:l.fillStyle=i.color,l.globalAlpha=.85,l.fillRect(-c,-c,c*2,c*2),l.strokeStyle=`rgba(255,255,255,0.5)`,l.lineWidth=2,l.strokeRect(-c,-c,c*2,c*2),l.fillStyle=`rgba(255,255,255,0.15)`,l.fillRect(-c,-c,c*2,c),l.globalAlpha=1;break;case`star`:l.fillStyle=i.color,l.beginPath();for(let e=0;e<10;e++){let t=e*Math.PI*2/10-Math.PI/2,n=e%2==0?c:c*.45;l.lineTo(Math.cos(t)*n,Math.sin(t)*n)}l.closePath(),l.fill(),l.strokeStyle=`rgba(255,255,255,0.4)`,l.lineWidth=1.5,l.stroke();break;case`diamond`:l.fillStyle=i.color,l.beginPath(),l.moveTo(0,-c*1.2),l.lineTo(c*.8,0),l.lineTo(0,c*1.2),l.lineTo(-c*.8,0),l.closePath(),l.fill(),l.strokeStyle=`rgba(255,255,255,0.4)`,l.lineWidth=1.5,l.stroke(),l.beginPath(),l.moveTo(-c*.8,0),l.lineTo(c*.8,0),l.strokeStyle=`rgba(255,255,255,0.2)`,l.stroke();break;case`coin`:{let e=Math.sin(i.age*6)*.2+.8;l.shadowColor=`#ffd700`,l.shadowBlur=20*e;let t=l.createRadialGradient(-c*.2,-c*.2,0,0,0,c);t.addColorStop(0,`#fff8dc`),t.addColorStop(.3,`#ffd700`),t.addColorStop(1,`#b8860b`),l.beginPath(),l.arc(0,0,c,0,Math.PI*2),l.fillStyle=t,l.fill(),l.strokeStyle=`rgba(255,255,255,0.6)`,l.lineWidth=2,l.stroke(),l.fillStyle=`#b8860b`,l.font=`bold ${c}px sans-serif`,l.textAlign=`center`,l.textBaseline=`middle`,l.fillText(`₪`,0,1);break}case`bomb`:{l.shadowColor=`#ff4400`,l.shadowBlur=10+Math.sin(i.age*8)*8;let e=l.createRadialGradient(-c*.2,-c*.2,0,0,0,c);e.addColorStop(0,`#666`),e.addColorStop(.5,`#333`),e.addColorStop(1,`#111`),l.beginPath(),l.arc(0,0,c,0,Math.PI*2),l.fillStyle=e,l.fill(),l.strokeStyle=`#ff4400`,l.lineWidth=2,l.stroke(),l.beginPath(),l.moveTo(0,-c),l.lineTo(c*.15,-c*1.4),l.strokeStyle=`#aaa`,l.lineWidth=3,l.stroke(),Math.sin(i.age*12)>0&&(l.beginPath(),l.arc(c*.15,-c*1.5,4,0,Math.PI*2),l.fillStyle=`#ff4400`,l.fill());break}case`portal`:{let e=i.age*3;for(let t=3;t>=0;t--){let n=c*(.4+t*.25);l.beginPath(),l.arc(0,0,n,0,Math.PI*2),l.strokeStyle=`hsla(${(e*30+t*40)%360}, 80%, 60%, ${.3+t*.15})`,l.lineWidth=3-t*.5,l.setLineDash([4+t*2,4+t*2]),l.lineDashOffset=e*20*(t%2==0?1:-1),l.stroke(),l.setLineDash([])}l.shadowColor=`#a855f7`,l.shadowBlur=25,l.beginPath(),l.arc(0,0,c*.2,0,Math.PI*2),l.fillStyle=`rgba(168,85,247,0.6)`,l.fill();break}}l.restore()}let i=L;for(let e=be.length-1;e>=0;e--){let a=be[e];if(a.life-=r*1.5,a.y-=.001,a.life<=0){be.splice(e,1);continue}i.save(),i.globalAlpha=a.life,i.font=`bold ${Math.round(18+a.life*14)}px "Space Grotesk", sans-serif`,i.textAlign=`center`,i.fillStyle=a.color,i.shadowColor=a.color,i.shadowBlur=12,i.fillText(a.text,a.x*t,a.y*n),i.restore()}(ve||me>0)&&(i.save(),i.font=`bold 28px "Space Grotesk", sans-serif`,i.fillStyle=`#ffd700`,i.shadowColor=`#ffd700`,i.shadowBlur=12,i.textAlign=`left`,i.fillText(`Score: ${me}`,20,40),he>1&&(i.font=`bold 18px "Space Grotesk", sans-serif`,i.fillStyle=`#ff69b4`,i.fillText(`${he}x Combo`,20,65)),ve&&(i.textAlign=`right`,i.font=`bold 24px "Space Grotesk", sans-serif`,i.fillStyle=ye<5?`#ff4444`:`#fff`,i.fillText(`${Math.ceil(ye)}s`,t-20,40)),i.restore()),xe!==`none`&&(i.save(),i.font=`32px sans-serif`,i.textAlign=`right`,i.fillText({peace:`✌️`,fist:`✊`,palm:`🖐️`,thumbsUp:`👍`,pointUp:`☝️`}[xe]||``,t-20,n-20),i.restore()),De(),ue=requestAnimationFrame(U)}function Ae(){n(`arOverlay`).classList.add(`show`);let e=n(`arVideo`),t=n(`arCanvas`),r=n(`arObjCanvas`),i=n(`arFxCanvas`),a=t.getContext(`2d`);L=r.getContext(`2d`),we=i.getContext(`2d`);let o=n(`arStatus`),s=n(`arHandIndicator`),c=n(`arButtons`),l=[{label:`חיפוש רכב`,icon:`🔍`,action:()=>{let e=prompt(`מספר רישוי:`);e&&se(e)}},{label:`הכנסות`,icon:`💰`,action:()=>ce(``,new Date().toISOString().slice(0,7))},{label:`צלם`,icon:`📸`,action:()=>Pe()},{label:`סגור`,icon:`✕`,action:je}];c.innerHTML=``,l.forEach((e,t)=>{let n=document.createElement(`button`);n.className=`ar-btn`,n.dataset.idx=String(t),n.innerHTML=`<span class="ar-btn-icon">${e.icon}</span><span class="ar-btn-label">${e.label}</span>`,n.onclick=e.action,c.appendChild(n)}),o.textContent=`מאתחל מצלמה…`,o.style.opacity=`1`,navigator.mediaDevices.getUserMedia({video:{facingMode:`user`,width:{ideal:1920,min:1280},height:{ideal:1080,min:720},frameRate:{ideal:30}}}).then(n=>{le=n,e.srcObject=n,e.onloadedmetadata=()=>{t.width=e.videoWidth,t.height=e.videoHeight,r.width=e.videoWidth,r.height=e.videoHeight,i.width=e.videoWidth,i.height=e.videoHeight,o.textContent=`מצלמה פעילה`,setTimeout(()=>{o.style.opacity=`0`},2e3),U(),Fe(e,t,a,s,l)}}).catch(()=>{o.textContent=`שגיאה: לא ניתן לגשת למצלמה`})}function je(){n(`arOverlay`).classList.remove(`show`),le&&=(le.getTracks().forEach(e=>e.stop()),null),cancelAnimationFrame(ue),de=[],I=null,L=null,we=null,Te=[],B=[],z=`none`,Se=[],Ce=null,be=[],me=0,he=0,ve=!1,xe=`none`,pe={x:-1,y:-1,pinching:!1},document.querySelectorAll(`.ar-fx-btn`).forEach(e=>e.classList.remove(`ar-fx-active`)),n(`arStatus`).style.opacity=`1`}n(`calBtn`).onclick=()=>j(),n(`arClose`).onclick=je,n(`arAddBall`).onclick=()=>Oe(`ball`),n(`arAddCube`).onclick=()=>Oe(`cube`),n(`arAddStar`).onclick=()=>Oe(`star`),n(`arAddDiamond`).onclick=()=>Oe(`diamond`),n(`arAddCoin`).onclick=()=>Oe(`coin`),n(`arAddPortal`).onclick=()=>Oe(`portal`),n(`arAddGravity`).onclick=()=>{Se.push({x:.3+Math.random()*.4,y:.3+Math.random()*.3,r:.12+Math.random()*.08,strength:1+Math.random(),hue:Math.random()*360})},n(`arAddTrampoline`).onclick=()=>{Ce={x:.5,y:.85,w:.3,active:!1}},n(`arClearObjs`).onclick=()=>{de=[],I=null,Te=[],B=[],Se=[],Ce=null,be=[],me=0,he=0,ve=!1};function Me(e){de=[],I=null,Te=[],B=[],Se=[],Ce=null,be=[],me=0,he=0,ge=0,_e=e,ve=!0,ye=e===`zen`?999:30,R=.5,e===`catch`&&(Ce={x:.5,y:.88,w:.35,active:!1}),ke(.5,.4,e===`catch`?`CATCH THE COINS!`:e===`target`?`HIT THE TARGETS!`:`ZEN MODE`,`#ffd700`)}n(`arGameCatch`).onclick=()=>Me(`catch`),n(`arGameTarget`).onclick=()=>Me(`target`),n(`arGameZen`).onclick=()=>Me(`zen`);function Ne(e){z=z===e?`none`:e,Te=[],B=[],document.querySelectorAll(`.ar-fx-btn`).forEach(e=>e.classList.remove(`ar-fx-active`)),z!==`none`&&document.getElementById(`arFx${e.charAt(0).toUpperCase()+e.slice(1)}`)?.classList.add(`ar-fx-active`)}n(`arFxFire`).onclick=()=>Ne(`fire`),n(`arFxWater`).onclick=()=>Ne(`water`),n(`arFxLaser`).onclick=()=>Ne(`laser`),n(`arFxSparkle`).onclick=()=>Ne(`sparkle`),n(`arFxRainbow`).onclick=()=>Ne(`rainbow`);function Pe(){let e=n(`arVideo`),t=document.createElement(`canvas`);t.width=e.videoWidth,t.height=e.videoHeight;let r=t.getContext(`2d`);r.save(),r.translate(t.width,0),r.scale(-1,1),r.drawImage(e,0,0),r.restore();let i=n(`arFxCanvas`);r.drawImage(i,0,0);let a=n(`arObjCanvas`);r.drawImage(a,0,0);let o=n(`arCanvas`);r.drawImage(o,0,0);let s=document.createElement(`a`);s.download=`AR_capture_${Date.now()}.png`,s.href=t.toDataURL(`image/png`),s.click()}function Fe(e,t,r,i,a){let o=0,s=document.createElement(`div`);s.className=`ar-pointer`,n(`arViewport`).appendChild(s);let c=document.createElement(`script`);c.src=`https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.min.js`,c.onload=()=>{let n=document.createElement(`script`);n.src=`https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.min.js`,n.onload=()=>l(e,t,r,s,i,a),document.head.appendChild(n)},document.head.appendChild(c);function l(e,t,r,i,a,s){let c=window.Hands,l=window.Camera;if(!c||!l){a.textContent=`Hand tracking unavailable`;return}let u=new c({locateFile:e=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${e}`});u.setOptions({maxNumHands:2,modelComplexity:1,minDetectionConfidence:.7,minTrackingConfidence:.6}),u.onResults(e=>{if(r.clearRect(0,0,t.width,t.height),e.multiHandLandmarks&&e.multiHandLandmarks.length>0)for(let c=0;c<e.multiHandLandmarks.length;c++){let l=e.multiHandLandmarks[c],u=c===0;a.textContent=e.multiHandLandmarks.length>1?`✋✋ שתי ידיים`:`✋ יד מזוהה`,a.style.color=`#daa520`,r.strokeStyle=u?`rgba(218,165,32,0.6)`:`rgba(200,149,106,0.6)`,r.lineWidth=2;for(let[e,n]of[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]])r.beginPath(),r.moveTo(l[e].x*t.width,l[e].y*t.height),r.lineTo(l[n].x*t.width,l[n].y*t.height),r.stroke();for(let e=0;e<l.length;e++){let n=l[e];r.beginPath(),r.arc(n.x*t.width,n.y*t.height,e===8||e===4?8:4,0,Math.PI*2),r.fillStyle=e===8?`rgba(245,230,200,0.9)`:e===4?`rgba(218,165,32,0.9)`:u?`rgba(218,165,32,0.7)`:`rgba(200,149,106,0.7)`,r.fill()}if(c===0){let e=l[8],t=l[4],r=l[12],a=l[16],c=l[20],u=l[0],d=n(`arViewport`).getBoundingClientRect(),f=e.x,p=e.y;i.style.left=f*d.width+`px`,i.style.top=p*d.height+`px`,i.style.opacity=`1`;let m=Math.hypot(e.x-t.x,e.y-t.y)<.05;fe={x:f,y:p,pinching:m};let h=e.y<l[6].y,g=r.y<l[10].y,_=a.y<l[14].y,v=c.y<l[18].y,y=t.y<l[3].y&&Math.abs(t.x-u.x)>.04;if(xe=h&&g&&!_&&!v?`peace`:!h&&!g&&!_&&!v&&!y?`fist`:h&&g&&_&&v?`palm`:y&&!h&&!g?`thumbsUp`:h&&!g&&!_&&!v?`pointUp`:`none`,xe===`palm`&&z===`none`){for(let e of de)if(!e.grabbed){let t=e.x-f,n=e.y-p,r=Math.hypot(t,n);r<.3&&r>.01&&(e.vx+=t/r*.003,e.vy+=n/r*.003)}}if(xe===`fist`){for(let e of de)if(!e.grabbed){let t=f-e.x,n=p-e.y,r=Math.hypot(t,n);r<.25&&r>.01&&(e.vx+=t/r*.002,e.vy+=n/r*.002)}}if(m){i.classList.add(`pinch`);let e=Date.now();if(e-o>600&&!I){o=e;let t=n(`arButtons`).querySelectorAll(`.ar-btn`);for(let e=0;e<t.length;e++){let n=t[e].getBoundingClientRect(),r=f*d.width+d.left,i=p*d.height+d.top;if(r>=n.left&&r<=n.right&&i>=n.top&&i<=n.bottom){t[e].classList.add(`ar-btn-active`),setTimeout(()=>t[e].classList.remove(`ar-btn-active`),300),s[e].action();break}}}}else i.classList.remove(`pinch`)}if(c===1){let e=l[8],t=l[4],n=Math.hypot(e.x-t.x,e.y-t.y)<.05;pe={x:e.x,y:e.y,pinching:n};for(let t of de){let n=t.x-e.x,r=t.y-e.y,i=Math.hypot(n,r);if(i<t.r+.03&&i>0){let e=.008/Math.max(i,.01);t.vx+=n*e,t.vy+=r*e}}}}else a.textContent=`👋 הראה יד למצלמה`,a.style.color=`var(--dim)`,i.style.opacity=`0`,fe={x:-1,y:-1,pinching:!1},I&&=(I.grabbed=!1,null)}),new l(e,{onFrame:async()=>{await u.send({image:e})},width:e.videoWidth||1920,height:e.videoHeight||1080}).start()}}document.querySelectorAll(`.dock-item[data-q]`).forEach(e=>{e.onclick=()=>{let t=e.dataset.q||``;t&&(i.send(),w(t,`me`),M(t))}});let Ie=n(`macDock`),Le=Ie.querySelectorAll(`.dock-item`);Ie.addEventListener(`mousemove`,e=>{Le.forEach(t=>{let n=t.getBoundingClientRect(),r=n.left+n.width/2,i=Math.abs(e.clientX-r),a=i<100?1+(1-i/100)*.5:1,o=i<100?-(1-i/100)*14:0;t.style.transform=`scale(${a}) translateY(${o}px)`})}),Ie.addEventListener(`mouseleave`,()=>{Le.forEach(e=>{e.style.transform=``})});function Re(){n(`nameInput`).value=r.name,n(`keyInput`).value=r.key,n(`grokKeyInput`).value=r.grokKey,n(`openaiKeyInput`).value=r.openaiKey,n(`providerSel`).value=r.provider,n(`puterModelSel`).value=r.puterModel,n(`micSel`).value=r.micLang,n(`replySel`).value=r.replyLang,n(`textLangSel`).value=r.textLang,n(`ambSlider`).value=String(Math.round(i.ambLevel*100)),n(`ambVal`).textContent=Math.round(i.ambLevel*100)+`%`,n(`ambPresetSel`).value=i.ambPreset,n(`speedSlider`).value=String(Math.round((r.voiceSpeed||1)*100)),n(`speedVal`).textContent=(r.voiceSpeed||1).toFixed(1)+`x`,n(`pitchSlider`).value=String(Math.round((r.voicePitch==null?1:r.voicePitch)*100)),n(`pitchVal`).textContent=(r.voicePitch==null?1:r.voicePitch).toFixed(1),n(`voiceVolSlider`).value=String(Math.round((r.voiceVolume==null?1:r.voiceVolume)*100)),n(`voiceVolVal`).textContent=Math.round((r.voiceVolume==null?1:r.voiceVolume)*100)+`%`,n(`sfxCheck`).checked=r.sfxOn,n(`hapticsCheck`).checked=r.haptics,n(`autoSpeakCheck`).checked=r.autoSpeak,n(`pikaVoiceCheck`).checked=r.pikaVoiceOn,n(`pikaVolSlider`).value=String(Math.round(r.pikaVolume*100)),n(`pikaVolVal`).textContent=Math.round(r.pikaVolume*100)+`%`,n(`pikaPitchSlider`).value=String(Math.round(r.pikaPitch*100)),n(`pikaPitchVal`).textContent=r.pikaPitch.toFixed(1),n(`driveClientId`).value=jv(),Be(),n(`spotifyId`).value=p.spotify,n(`tiktokId`).value=p.tiktok,n(`instaId`).value=p.insta,n(`fbId`).value=p.fb,n(`genderPicker`).querySelectorAll(`.gender-btn`).forEach(e=>{e.classList.toggle(`active`,e.dataset.g===r.voiceGender)}),ze(),n(`overlay`).classList.add(`show`)}function ze(){g.loadVoices();let e=n(`voiceSel`);e.innerHTML=g.availableVoices().map(e=>{let t=g.voiceGenderLabel(e),n=/natural|neural|enhanced|premium|wavenet|studio/i.test(e.name)?` HD`:``;return`<option value="${e.name}">[${t}]${n} ${e.name} (${e.lang})</option>`}).join(``)||`<option value="">No voice available</option>`}n(`settingsBtn`).onclick=Re,(function(){let e=`alpha_settings_collapsed_v1`,t=[`audio`,`aiEngineTitle`,`cloudSync`,`connectedServices`,`shortcuts`],r;try{r=JSON.parse(localStorage.getItem(e)||`null`)||t}catch{r=t.slice()}n(`overlay`).querySelectorAll(`.settings-section`).forEach(t=>{let n=t.querySelector(`.ss-title`);if(!n)return;let i=n.dataset.i18n||n.textContent||``;r.includes(i)&&t.classList.add(`collapsed`),n.addEventListener(`click`,()=>{t.classList.toggle(`collapsed`);let n=t.classList.contains(`collapsed`);r=r.filter(e=>e!==i),n&&r.push(i);try{localStorage.setItem(e,JSON.stringify(r))}catch{}})})})();function Be(){let e=Nv(),t=n(`driveConnectBtn`);t.textContent=e?`✓ Connected`:`Connect Google Drive`,t.classList.toggle(`cloud-connected`,e),n(`driveUploadBtn`).disabled=!e,n(`driveDownloadBtn`).disabled=!e;let r=Pv();n(`driveStatus`).textContent=r?`Last sync: ${new Date(r).toLocaleString()}`:``}n(`driveConnectBtn`).onclick=async()=>{let e=n(`driveClientId`).value.trim();if(!e){n(`driveStatus`).textContent=`Enter a Client ID first`;return}Mv(e),n(`driveStatus`).textContent=`Connecting…`;try{let e=await zv();n(`driveStatus`).textContent=e?`Connected ✓`:`Connection cancelled`,Be()}catch(e){n(`driveStatus`).textContent=e.message===`NO_CLIENT_ID`?`Enter a Client ID`:`Connection failed: `+e.message}},n(`driveUploadBtn`).onclick=async()=>{let e=await Gv(e=>{n(`driveStatus`).textContent=e});e.ok||(n(`driveStatus`).textContent=`Error: `+e.error),Be()},n(`driveDownloadBtn`).onclick=async()=>{if(!confirm(`שים לב: פעולה זו תחליף את הנתונים המקומיים בגיבוי מהענן. להמשיך?`))return;let e=await Kv(e=>{n(`driveStatus`).textContent=e});e.ok?setTimeout(()=>location.reload(),1500):n(`driveStatus`).textContent=`שגיאה: `+e.error},n(`localExportBtn`).onclick=()=>Yv(),n(`localImportBtn`).onclick=async()=>{let e=await Xv();e.ok?(alert(`שוחזרו ${e.tables} טבלאות. טוען מחדש…`),location.reload()):alert(`ייבוא נכשל: `+e.error)};let Ve=n(`searchOverlay`),He=n(`searchInput`),Ue=n(`searchResults`);function We(){Ve.classList.add(`show`),He.value=``;let e=``,t=Ry();t.length&&(e+=`<div class="search-hint">Recent</div>`,e+=t.slice(0,5).map(e=>`<div class="search-item search-recent" data-query="${e}"><span class="search-icon">🕐</span><div class="search-text"><span class="search-title">${e}</span></div></div>`).join(``));let n=zy();n.length&&(e+=`<div class="search-hint">Quick access</div>`,e+=n.map(e=>`<div class="search-item" data-type="${e.type}"><span class="search-icon">${Py[e.type]}</span><div class="search-text"><span class="search-title">${e.title}</span><span class="search-sub">${e.subtitle}</span></div><span class="search-type">${e.type}</span></div>`).join(``)),e||=`<div class="search-hint">Search leads, tasks, events, invoices, goals, notes…</div>`,Ue.innerHTML=e,Ue.querySelectorAll(`.search-recent`).forEach(e=>{e.onclick=()=>{He.value=e.dataset.query||``,He.dispatchEvent(new Event(`input`))}}),setTimeout(()=>He.focus(),100)}function Ge(){Ve.classList.remove(`show`)}n(`searchBtn`).onclick=We,Ve.addEventListener(`click`,e=>{e.target===Ve&&Ge()}),document.addEventListener(`keydown`,e=>{(e.metaKey||e.ctrlKey)&&e.key===`k`&&(e.preventDefault(),We()),e.key===`Escape`&&Ve.classList.contains(`show`)&&Ge()});let Ke=null;He.addEventListener(`input`,()=>{clearTimeout(Ke),Ke=setTimeout(()=>{let e=He.value.trim();if(!e){Ue.innerHTML=`<div class="search-hint">Type to search across all your data…</div>`;return}Ly(e);let t=Ny(e);if(!t.length){Ue.innerHTML=`<div class="search-hint">No results found.</div>`;return}Ue.innerHTML=t.map(e=>`<div class="search-item" data-type="${e.type}"><span class="search-icon">${Py[e.type]}</span><div class="search-text"><span class="search-title">${e.title}</span><span class="search-sub">${e.subtitle}</span></div><span class="search-type">${e.type}</span></div>`).join(``)},150)});let qe=n(`fabBtn`),Je=n(`fabMenu`),Ye=!1;qe.onclick=()=>{Ye=!Ye,Je.classList.toggle(`show`,Ye),qe.textContent=Ye?`✕`:`+`,qe.style.transform=Ye?`rotate(45deg)`:``},Je.addEventListener(`click`,e=>{let t=e.target.closest(`.fab-item`);if(!t)return;let n=t.dataset.action;if(Ye=!1,Je.classList.remove(`show`),qe.textContent=`+`,qe.style.transform=``,n===`task`){let e=prompt(`Quick task:`);e?.trim()&&(Xp(e.trim()),w(`✅ Task added: "${e.trim()}"`,`sys`))}else if(n===`note`){let e=prompt(`Quick note:`);e?.trim()&&(em(e.trim()),w(`📝 ${Zy(`noteSaved`,r.uiLang)}`,`sys`))}else if(n===`timer`){let e=prompt(`Project name:`);e?.trim()&&(ng(e.trim()),w(`⏱️ Timer started: ${e.trim()}`,`sys`))}else n===`briefing`?w(e_(),`sys`):n===`search`&&We()}),document.addEventListener(`click`,e=>{Ye&&!e.target.closest(`.fab, .fab-menu, #fabBtn, #fabMenu`)&&(Ye=!1,Je.classList.remove(`show`),qe.textContent=`+`,qe.style.transform=``)}),Vy(`Ctrl+K`,`Search`,We),Vy(`Ctrl+B`,`Daily Briefing`,()=>{w(e_(),`sys`)}),Vy(`Ctrl+.`,`Settings`,Re),Hy();try{let e=document.getElementById(`shortcutsList`);e&&(e.innerHTML=Wy())}catch{}n(`replySel`).onchange=()=>{r.replyLang=n(`replySel`).value,ze()},n(`ambPresetSel`).onchange=()=>{i.ensure();let e=n(`ambPresetSel`).value;i.setPreset(e),r.ambPreset=e},n(`ambSlider`).oninput=()=>{i.ensure();let e=+n(`ambSlider`).value;i.setAmbient(e/100),n(`ambVal`).textContent=e+`%`},n(`speedSlider`).oninput=()=>{let e=n(`speedSlider`).value/100;n(`speedVal`).textContent=e.toFixed(1)+`x`,r.voiceSpeed=e},n(`pitchSlider`).oninput=()=>{let e=n(`pitchSlider`).value/100;n(`pitchVal`).textContent=e.toFixed(1),r.voicePitch=e},n(`voiceVolSlider`).oninput=()=>{let e=n(`voiceVolSlider`).value/100;n(`voiceVolVal`).textContent=Math.round(e*100)+`%`,r.voiceVolume=e};let Xe={natural:{rate:1,pitch:1,vol:1},calm:{rate:.88,pitch:.8,vol:.95},energetic:{rate:1.25,pitch:1.25,vol:1},fast:{rate:1.6,pitch:1.05,vol:1},clear:{rate:.8,pitch:1,vol:1},deep:{rate:.92,pitch:.55,vol:1},robot:{rate:.9,pitch:.4,vol:1},chipmunk:{rate:1.4,pitch:2,vol:1},whisper:{rate:.95,pitch:1.15,vol:.4}};function W(e,t,i){n(`speedSlider`).value=String(Math.round(e*100)),n(`speedVal`).textContent=e.toFixed(1)+`x`,n(`pitchSlider`).value=String(Math.round(t*100)),n(`pitchVal`).textContent=t.toFixed(1),n(`voiceVolSlider`).value=String(Math.round(i*100)),n(`voiceVolVal`).textContent=Math.round(i*100)+`%`,r.voiceSpeed=e,r.voicePitch=t,r.voiceVolume=i}function G(){let e=n(`voiceTestText`).value.trim();if(e)return e;let t={he:`שלום, אני אלפא, העוזר האישי שלך. ככה אני נשמע.`,en:`Hello, I am Alpha, your personal assistant. This is how I sound.`,es:`Hola, soy Alpha, tu asistente personal. Así sueno.`};return t[r.replyLang]||t.en}n(`voicePresets`).addEventListener(`click`,e=>{let t=e.target.closest(`.vp-chip`);if(!t)return;let r=Xe[t.dataset.preset];if(!r)return;n(`voicePresets`).querySelectorAll(`.vp-chip`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),W(r.rate,r.pitch,r.vol);let i=n(`voiceSel`).value;i&&g.setVoice(i),g.preview(G(),{rate:r.rate,pitch:r.pitch,volume:r.vol})}),n(`voicePlayBtn`).onclick=()=>{let e=n(`voiceSel`).value;e&&g.setVoice(e),g.preview(G(),{rate:r.voiceSpeed,pitch:r.voicePitch,volume:r.voiceVolume,voiceName:e})},n(`resetVoiceBtn`).onclick=()=>{n(`voicePresets`).querySelectorAll(`.vp-chip`).forEach(e=>e.classList.remove(`active`)),W(1,1,1),g.preview(G(),{rate:1,pitch:1,volume:1})},n(`pikaSpeakBtn`).onclick=()=>{Hf()},n(`pikaVoiceCheck`).onchange=e=>{r.pikaVoiceOn=e.target.checked,Vf(r.pikaVoiceOn),localStorage.setItem(`alpha_pikavoice`,r.pikaVoiceOn?`1`:`0`)},n(`pikaVolSlider`).oninput=e=>{let t=e.target.value/100;n(`pikaVolVal`).textContent=Math.round(t*100)+`%`,zf(t),r.pikaVolume=t,localStorage.setItem(`alpha_pikavol`,t.toFixed(2))},n(`pikaPitchSlider`).oninput=e=>{let t=e.target.value/100;n(`pikaPitchVal`).textContent=t.toFixed(1),Bf(t),r.pikaPitch=t,localStorage.setItem(`alpha_pikapitch`,t.toFixed(2))},n(`genderPicker`).addEventListener(`click`,e=>{let t=e.target.closest(`.gender-btn`);t&&(r.voiceGender=t.dataset.g,n(`genderPicker`).querySelectorAll(`.gender-btn`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),ze())}),n(`testVoiceBtn`).onclick=()=>{let e=n(`voiceSel`).value;e&&g.setVoice(e),r.voiceSpeed=n(`speedSlider`).value/100,r.voicePitch=n(`pitchSlider`).value/100,r.voiceVolume=n(`voiceVolSlider`).value/100,g.preview(G(),{rate:r.voiceSpeed,pitch:r.voicePitch,volume:r.voiceVolume,voiceName:e})},n(`saveBtn`).onclick=()=>{r.name=n(`nameInput`).value.trim()||`ALPHA`,r.key=n(`keyInput`).value.trim(),r.grokKey=n(`grokKeyInput`).value.trim(),r.openaiKey=n(`openaiKeyInput`).value.trim(),r.provider=n(`providerSel`).value,r.puterModel=n(`puterModelSel`).value,r.micLang=n(`micSel`).value,r.replyLang=n(`replySel`).value,r.textLang=n(`textLangSel`).value,r.ambLevel=i.ambLevel,r.ambPreset=n(`ambPresetSel`).value,i.setPreset(r.ambPreset),r.voiceSpeed=n(`speedSlider`).value/100,r.voicePitch=n(`pitchSlider`).value/100,r.voiceVolume=n(`voiceVolSlider`).value/100,r.sfxOn=n(`sfxCheck`).checked,r.haptics=n(`hapticsCheck`).checked,r.autoSpeak=n(`autoSpeakCheck`).checked,i.sfxOn=r.sfxOn,r.pikaVoiceOn=n(`pikaVoiceCheck`).checked,r.pikaVolume=n(`pikaVolSlider`).value/100,r.pikaPitch=n(`pikaPitchSlider`).value/100,Vf(r.pikaVoiceOn),zf(r.pikaVolume),Bf(r.pikaPitch),g.setMicLang(r.micLang);let e=n(`voiceSel`).value;e&&g.setVoice(e),Mv(n(`driveClientId`).value.trim()),p.spotify=n(`spotifyId`).value.trim(),p.tiktok=n(`tiktokId`).value.trim(),p.insta=n(`instaId`).value.trim(),p.fb=n(`fbId`).value.trim(),localStorage.setItem(`alpha_social_spotify`,p.spotify),localStorage.setItem(`alpha_social_tiktok`,p.tiktok),localStorage.setItem(`alpha_social_insta`,p.insta),localStorage.setItem(`alpha_social_fb`,p.fb),m(),Vp(r),dt(),n(`overlay`).classList.remove(`show`),r.history.length===0&&w(r.name+` `+Zy(`onlineMsg`,r.uiLang),`al`)};function Ze(e){return String(e).padStart(2,`0`)}function Qe(){let e=new Date().getHours();return e<6?`GOOD NIGHT`:e<12?`GOOD MORNING`:e<17?`GOOD AFTERNOON`:e<21?`GOOD EVENING`:`GOOD NIGHT`}setInterval(()=>{let e=new Date;n(`clock`).textContent=`${Ze(e.getHours())}:${Ze(e.getMinutes())}`;let t=document.querySelector(`.wm`);t&&(t.textContent=Qe())},1e3);let $e=n(`neuralCanvas`),et=$e.getContext(`2d`),tt=[];function nt(){let e=$e.getBoundingClientRect();$e.width=e.width*2,$e.height=e.height*2,tt.length=0;for(let e=0;e<14;e++)tt.push({x:Math.random()*$e.width,y:Math.random()*$e.height,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6,r:2+Math.random()*3,pulse:Math.random()*Math.PI*2})}function rt(){if(!et)return;let e=$e.width,t=$e.height;et.clearRect(0,0,e,t);let n=Date.now()*.001;for(let n of tt)n.x+=n.vx,n.y+=n.vy,(n.x<0||n.x>e)&&(n.vx*=-1),(n.y<0||n.y>t)&&(n.vy*=-1),n.pulse+=.02;for(let e=0;e<tt.length;e++)for(let t=e+1;t<tt.length;t++){let r=tt[e],i=tt[t],a=Math.hypot(r.x-i.x,r.y-i.y);if(a<160){let o=(1-a/160)*.25;et.strokeStyle=`rgba(218, 165, 32, ${o})`,et.lineWidth=.8,et.beginPath(),et.moveTo(r.x,r.y),et.lineTo(i.x,i.y),et.stroke();let s=(Math.sin(n*2+e+t)+1)/2,c=r.x+(i.x-r.x)*s,l=r.y+(i.y-r.y)*s;et.fillStyle=`rgba(255, 194, 77, ${o*1.5})`,et.beginPath(),et.arc(c,l,1.5,0,Math.PI*2),et.fill()}}for(let e of tt)et.fillStyle=`rgba(218, 165, 32, ${.5+Math.sin(e.pulse)*.3})`,et.shadowColor=`rgba(218, 165, 32, 0.4)`,et.shadowBlur=8,et.beginPath(),et.arc(e.x,e.y,e.r,0,Math.PI*2),et.fill(),et.shadowBlur=0;setTimeout(rt,66)}nt(),rt();let it=n(`waveCanvas`),at=it.getContext(`2d`),ot=Array(32).fill(0).map(()=>Math.random()*.5),st=Array(32).fill(0).map(()=>Math.random()*.5);function ct(){let e=it.getBoundingClientRect();it.width=e.width*2,it.height=e.height*2}function lt(){if(!at)return;let e=it.width,t=it.height;at.clearRect(0,0,e,t);let n=e/32;for(let e=0;e<32;e++){ot[e]+=(st[e]-ot[e])*.08,Math.random()<.02&&(st[e]=.1+Math.random()*.8);let r=ot[e]*t*.85,i=e/32,a=Math.round(218+i*37),o=Math.round(165+i*65),s=Math.round(32+i*112);at.fillStyle=`rgba(${a}, ${o}, ${s}, 0.7)`;let c=e*n+1;at.fillRect(c,t-r,n-2,r),at.fillStyle=`rgba(${a}, ${o}, ${s}, 0.3)`,at.fillRect(c,t-r-2,n-2,2)}setTimeout(lt,66)}ct(),lt(),setInterval(()=>{let e=30+Math.random()*55,t=50+Math.random()*30,r=10+Math.random()*40;n(`cpuBar`).style.width=e+`%`,n(`cpuVal`).textContent=Math.round(e)+`%`,n(`memBar`).style.width=t+`%`,n(`memVal`).textContent=Math.round(t)+`%`,n(`netBar`).style.width=r/50*100+`%`,n(`netVal`).textContent=Math.round(r)+`ms`},2e3);let ut=Date.now();setInterval(()=>{let e=Math.floor((Date.now()-ut)/1e3),t=Math.floor(e/60),r=e%60;n(`uptimeVal`).textContent=Ze(t)+`:`+Ze(r)},1e3);function K(){let e=n(`liveWidgets`);if(e)try{let t=Jp().filter(e=>!e.done).length,n=Up(),r=new Date().toISOString().slice(0,10),i=n.filter(e=>e.date===r).length,a=``;try{let e=tg();e&&(a=`<div class="lw-item"><span class="lw-icon">⏱</span><span class="lw-val">${Math.round((Date.now()-e.startTime)/6e4)}m</span><span class="lw-lbl">${e.project}</span></div>`)}catch{}let o=``;try{let e=hg();o=`<div class="lw-item"><span class="lw-icon">${e.score>.3?`😊`:e.score<-.3?`😟`:`😐`}</span><span class="lw-val">${e.label}</span><span class="lw-lbl">Mood</span></div>`}catch{}let s=``;try{let e=a_();s=`<div class="lw-item"><span class="lw-icon">⚡</span><span class="lw-val">${e.total}</span><span class="lw-lbl">${o_(e.total)}</span></div>`}catch{}e.innerHTML=s+`<div class="lw-item"><span class="lw-icon">✓</span><span class="lw-val">${t}</span><span class="lw-lbl">Tasks</span></div><div class="lw-item"><span class="lw-icon">📅</span><span class="lw-val">${i}</span><span class="lw-lbl">Today</span></div>`+a+o}catch{}}K(),setInterval(K,3e4);function dt(){let e={"gpt-4o-mini":`GPT-4O MINI`,"gpt-4o":`GPT-4O`,"o4-mini":`O4-MINI`,"claude-sonnet-4":`CLAUDE SONNET 4`,"gemini-2.0-flash":`GEMINI 2.0 FLASH`},t={puter:`VIA PUTER`,gemini:`VIA GOOGLE`,grok:`VIA XAI`,openai:`VIA OPENAI`},i=r.puterModel||`gpt-4o-mini`;n(`aiModelDisplay`).textContent=e[i]||i.toUpperCase(),n(`aiProviderDisplay`).textContent=t[r.provider]||r.provider.toUpperCase()}dt(),m();function ft(){let e=new Date().getHours();return Zy(e<5?`goodNight`:e<12?`goodMorning`:e<18?`goodAfternoon`:`goodEvening`,r.uiLang)}function pt(){let e=fm().profile.name;if(!e)return`${r.name} ${Zy(`onlineMsg`,r.uiLang)}`;let t=Jp().filter(e=>!e.done).length,n=new Date().toISOString().slice(0,10),i=Up().filter(e=>e.date===n).length,a=[`${ft()}, ${e}.`];if(t>0||i>0){let e=[];i&&e.push(`${i} ${Zy(`eventsToday`,r.uiLang)}`),t&&e.push(`${t} ${Zy(`openTasks`,r.uiLang)}`),a.push(`${Zy(`youHave`,r.uiLang)} ${e.join(` ${Zy(`and`,r.uiLang)} `)}.`)}return a.push(Zy(`howCanIHelp`,r.uiLang)),a.join(` `)}function mt(){let e=document.createElement(`div`);e.className=`welcome-overlay show`,e.innerHTML=`
      <div class="welcome-card">
        <div class="welcome-orb">◆</div>
        <h2 class="welcome-title">${ft()} 👋</h2>
        <p class="welcome-sub">${r.uiLang===`he`?`אני`:`I'm`} <b>${r.name}</b>, ${Zy(`welcomeSub`,r.uiLang)}</p>
        <input class="welcome-input" id="welcomeName" placeholder="${r.uiLang===`he`?`השם שלך`:`Your name`}" autocomplete="off" />
        <button class="welcome-go" id="welcomeGo">${Zy(`letsBegin`,r.uiLang)}</button>
        <button class="welcome-skip" id="welcomeSkip">${Zy(`skipForNow`,r.uiLang)}</button>
      </div>`,t.querySelector(`.app`).appendChild(e);let n=e.querySelector(`#welcomeName`);setTimeout(()=>n.focus(),350);let i=t=>{let n=t.trim();n&&xm({name:n}),e.classList.remove(`show`),setTimeout(()=>e.remove(),400);let i=n?`${ft()}, ${n}! ${Zy(`niceToMeet`,r.uiLang)} ${r.name} ${Zy(`askAnything`,r.uiLang)}`:pt();w(i,`al`),g.speak(i)};e.querySelector(`#welcomeGo`).onclick=()=>i(n.value),e.querySelector(`#welcomeSkip`).onclick=()=>i(``),n.addEventListener(`keydown`,e=>{e.key===`Enter`&&i(n.value)})}let ht=Cg();if(ht.length>0){let e=ht.slice(-20);for(let t of e){let e={me:Zy(`you`,r.uiLang),al:r.name,sys:Zy(`systemLabel`,r.uiLang)}[t.who],i=n(`chat`),a=document.createElement(`div`);a.className=`turn `+t.who,a.innerHTML=`<span class="who">${e}</span><div class="txt">${t.text}</div>`,i&&i.appendChild(a)}let t=n(`chat`);t&&(t.scrollTop=t.scrollHeight)}if(fm().profile.name?ht.length===0&&w(pt(),`al`):mt(),!(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||window.innerWidth<768)){let e=0,n=0,r=0,i=0;document.addEventListener(`mousemove`,t=>{e=(t.clientX/window.innerWidth-.5)*2,n=(t.clientY/window.innerHeight-.5)*2});let a=t.querySelector(`.left-panel`),o=t.querySelector(`.right-panel`),s=t.querySelector(`.dock`),c=t.querySelector(`.topL`),l=t.querySelector(`.topR`);function u(){r+=(e-r)*.06,i+=(n-i)*.06;let t=i*-.8,d=r*1.2;a&&(a.style.transform=`perspective(1200px) rotateY(${d*.6}deg) rotateX(${t*.5}deg) translateZ(8px)`),o&&(o.style.transform=`perspective(1200px) rotateY(${d*.5}deg) rotateX(${t*.4}deg) translateZ(6px)`),s&&(s.style.transform=`translateX(-50%) perspective(1200px) rotateX(${t*-1.2}deg) translateZ(12px)`),c&&(c.style.transform=`perspective(1200px) rotateY(${d*.3}deg) translateZ(4px)`),l&&(l.style.transform=`perspective(1200px) rotateY(${d*.3}deg) translateZ(4px)`),requestAnimationFrame(u)}requestAnimationFrame(u)}}Qy(document.getElementById(`app`)),`serviceWorker`in navigator&&(navigator.serviceWorker.getRegistrations().then(e=>{e.forEach(e=>e.unregister())}),caches.keys().then(e=>{e.forEach(e=>caches.delete(e))}));export{Mi as $,Nr as A,s as B,ca as C,Le as D,u as E,ss as F,rc as G,Tn as H,os as I,Oc as J,ha as K,a as L,Zt as M,X as N,Ns as O,ii as P,Ie as Q,o as R,la as S,d as T,ic as U,Ss as V,$s as W,ws as X,Dt as Y,r as Z,ms as _,Or as a,q as at,ia as b,Ft as c,En as d,Di as et,uc as f,jr as g,kr as h,pr as i,zs as it,Et as j,cc as k,oc as l,Vi as m,Oi as n,tc as nt,i as o,J as ot,Ni as p,ua as q,Yn as r,Gt as rt,Y as s,Es as st,Ds as t,br as tt,Is as u,ke as v,l as w,Xi as x,H as y,c as z};