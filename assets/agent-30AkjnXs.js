import{r as e}from"./modulepreload-polyfill-DIrsccGL.js";import{t}from"./preload-helper-DGuKeUGT.js";import{a as n,i as r,n as i,r as a,s as o,t as s}from"./jsx-runtime-BeRM4PoA.js";import{a as c,c as l,i as u,l as d,o as f,s as p,t as m,u as h}from"./leadsCloud-ePzU60dR.js";import{a as g,c as _,d as v,f as y,i as b,l as x,n as S,o as C,r as w,s as T,t as E,u as D}from"./index.esm-C9BaDQMK.js";import{a as O,i as k,n as A,o as ee,r as j,t as te}from"./users-eO_WFH9I.js";import{i as ne,n as M,r as re,t as N}from"./x-B2LgX9CR.js";import{t as P}from"./send-LI6_KKMU.js";import{t as ie}from"./shield-D7UlRTnb.js";import{t as ae}from"./star-y_9BQ_Uw.js";var oe=r(`briefcase`,[[`path`,{d:`M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16`,key:`jecpp`}],[`rect`,{width:`20`,height:`14`,x:`2`,y:`6`,rx:`2`,key:`i6l2r4`}]]),se=r(`git-merge`,[[`circle`,{cx:`18`,cy:`18`,r:`3`,key:`1xkwt0`}],[`circle`,{cx:`6`,cy:`6`,r:`3`,key:`1lh9wr`}],[`path`,{d:`M6 21V9a9 9 0 0 0 9 9`,key:`7kw0sc`}]]),ce=r(`handshake`,[[`path`,{d:`m11 17 2 2a1 1 0 1 0 3-3`,key:`efffak`}],[`path`,{d:`m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4`,key:`9pr0kb`}],[`path`,{d:`m21 3 1 11h-2`,key:`1tisrp`}],[`path`,{d:`M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3`,key:`1uvwmv`}],[`path`,{d:`M3 4h8`,key:`1ep09j`}]]),le=r(`layout-dashboard`,[[`rect`,{width:`7`,height:`9`,x:`3`,y:`3`,rx:`1`,key:`10lvy0`}],[`rect`,{width:`7`,height:`5`,x:`14`,y:`3`,rx:`1`,key:`16une8`}],[`rect`,{width:`7`,height:`9`,x:`14`,y:`12`,rx:`1`,key:`1hutg5`}],[`rect`,{width:`7`,height:`5`,x:`3`,y:`16`,rx:`1`,key:`ldoo1y`}]]),ue=r(`maximize-2`,[[`path`,{d:`M15 3h6v6`,key:`1q9fwt`}],[`path`,{d:`m21 3-7 7`,key:`1l2asr`}],[`path`,{d:`m3 21 7-7`,key:`tjx5ai`}],[`path`,{d:`M9 21H3v-6`,key:`wtvkvv`}]]),de=r(`monitor`,[[`rect`,{width:`20`,height:`14`,x:`2`,y:`3`,rx:`2`,key:`48i651`}],[`line`,{x1:`8`,x2:`16`,y1:`21`,y2:`21`,key:`1svkeh`}],[`line`,{x1:`12`,x2:`12`,y1:`17`,y2:`21`,key:`vw1qmm`}]]),fe=r(`palette`,[[`path`,{d:`M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z`,key:`e79jfc`}],[`circle`,{cx:`13.5`,cy:`6.5`,r:`.5`,fill:`currentColor`,key:`1okk4w`}],[`circle`,{cx:`17.5`,cy:`10.5`,r:`.5`,fill:`currentColor`,key:`f64h9f`}],[`circle`,{cx:`6.5`,cy:`12.5`,r:`.5`,fill:`currentColor`,key:`qy21gx`}],[`circle`,{cx:`8.5`,cy:`7.5`,r:`.5`,fill:`currentColor`,key:`fotxhn`}]]),pe=r(`user-round`,[[`circle`,{cx:`12`,cy:`8`,r:`5`,key:`1hypcn`}],[`path`,{d:`M20 21a8 8 0 0 0-16 0`,key:`rfgkzh`}]]),F=e(o(),1),me=e(n(),1),he=`itai:fbconfig`,ge=()=>{try{return localStorage.getItem(he)||``}catch{return``}};function _e(e){try{localStorage.setItem(he,(e||``).trim())}catch{}L=null}function ve(){try{let e=JSON.parse(ge());return e&&e.projectId&&e.apiKey?e:null}catch{return null}}var I=()=>!!ve(),L=null;function ye(){if(L)return L;let e=ve();if(!e)return null;try{return L=g(C().length?C()[0]:T(e)),L}catch{return null}}var R={"itai:crm":`crm`,"itai:deals":`deals`,"itai:customers":`customers`,"itai:samsonix":`samsonix`,"itai:saminbox":`saminbox`};function be(){try{let e=new URLSearchParams((location.hash||``).replace(/^#/,``)).get(`cfg`);if(e&&!I()){let t=decodeURIComponent(escape(atob(decodeURIComponent(e))));localStorage.setItem(he,t),L=null}}catch{}}function xe(){try{return encodeURIComponent(btoa(unescape(encodeURIComponent(ge()))))}catch{return``}}async function Se(e,t){let n=ye(),r=R[e];if(!n||!r)return!1;try{return await w(b(n,`itai`,r),{v:t??null,ts:Date.now()}),!0}catch{return!1}}async function Ce(e,t,n){let r=ye(),i=R[e];if(!r||!i)return!1;try{return await w(b(r,`itai`,i),{v:{[t]:n}},{merge:!0}),!0}catch{return!1}}async function we(e){let t=ye(),n=R[e];if(!t||!n)return null;try{let e=await E(b(t,`itai`,n));return e.exists()?e.data().v??null:null}catch{return null}}function Te(e,t=Object.keys(R)){let n=ye();if(!n)return()=>{};let r=[];for(let i of t){let t=R[i];try{r.push(S(b(n,`itai`,t),t=>{try{e(i,t.exists()?t.data().v??null:null)}catch{}},()=>{}))}catch{}}return()=>{r.forEach(e=>{try{e()}catch{}})}}var z=s(),B=`Heavy Guard`,Ee=.18,De=[`חדש`,`פנייה ראשונה`,`בתהליך`,`הצעה נשלחה`,`לקוח`,`אבד`],Oe={חדש:`#8E9BAB`,"פנייה ראשונה":`#6FD3F0`,בתהליך:`#E4BC63`,"הצעה נשלחה":`#8b5cf6`,לקוח:`#3FD79A`,אבד:`#FF5C50`},V=[`צפון`,`מרכז`,`דרום`,`שרון`,`שפלה`,`ירושלים`],ke=[`שיחה`,`וואטסאפ`,`מייל`,`פגישה`,`הודעה`,`אחר`],Ae=[`חיובי`,`אין מענה`,`שלילי`,`מעניין`,`לחזור`],je=[`פתוח`,`נסגר`,`אבד`],H={פתוח:`#E4BC63`,נסגר:`#3FD79A`,אבד:`#FF5C50`},U=`itai:crm`,W=`itai:deals`,G=`itai:customers`,Me=(e,t)=>{try{let n=localStorage.getItem(e);return n?JSON.parse(n):t}catch{return t}},K=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}},q=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6),J=e=>`₪`+(Number(e)||0).toLocaleString(`he-IL`),Ne=e=>{let t=(e||``).trim().replace(/\s+/g,` `);return t.length>3&&t[0]===`ה`&&(t=t.slice(1)),t.toLowerCase()},Pe=e=>(e||``).replace(/\D/g,``).replace(/^972/,`0`);function Fe(e){let t=e||[],n=t.map((e,t)=>t),r=e=>n[e]===e?e:n[e]=r(n[e]),i=(e,t)=>{let i=r(e),a=r(t);i!==a&&(n[i]=a)},a={},o={};t.forEach((e,t)=>{let n=Pe(e.phone);n&&n.length>=7&&(a[n]===void 0?a[n]=t:i(t,a[n]));let r=Ne(e.name);r&&(o[r]===void 0?o[r]=t:i(t,o[r]))});let s={};t.forEach((e,t)=>{let n=r(t);(s[n]=s[n]||[]).push(e)});let c=[];return Object.values(s).forEach(e=>{if(e.length===1){c.push(e[0]);return}let t=0,n=0,r=!1,i=[];e.forEach(e=>{let a=e.notes||``,o=a.match(/(\d+)\s*התקנות/),s=a.match(/הכנסה\s*₪?([\d,]+)/);o||s||/Heavy ?Guard/i.test(a)?(r=!0,o&&(t+=parseInt(o[1],10)||0),s&&(n+=parseInt(s[1].replace(/,/g,``),10)||0)):a.trim()&&i.push(a.trim())});let a=[...e].sort((e,t)=>!!t.phone-+!!e.phone||(t.name||``).length-(e.name||``).length)[0],o=t=>e.map(e=>e[t]).find(e=>e&&String(e).trim())||``,s=[];r&&s.push(`${t} התקנות Heavy Guard · הכנסה ${J(n)}`),i.length&&s.push(...i),c.push({...a,phone:o(`phone`),email:o(`email`),city:o(`city`),region:o(`region`)||a.region||``,notes:s.join(` · `)})}),c}var Y=()=>new Date().toISOString().slice(0,10),X=e=>{try{let t=new Date(e);return`${String(t.getDate()).padStart(2,`0`)}/${String(t.getMonth()+1).padStart(2,`0`)}/${t.getFullYear()}`}catch{return e}},Ie={name:`Heavy Guard`,brand:`HEAVY GUARD`,address:`דן 7, ראשל"צ`,taxId:`305794067`,phone:`054-771-9070`},Le=[`דמי מנוי בכרטיס אשראי לחברת סמסוניקס +₪60+מע"מ`,`התקנה בבית הלקוח`,`אחריות לשנה על המוצרים וההתקנה`],Re=`ניתן לשלם באשראי או בהעברה בנקאית לחשבון 1087434, בנק לאומי (10) סניף 739. עד 3 תשלומים ללא ריבית.`,ze=()=>{try{let e=JSON.parse(localStorage.getItem(`hg2:quoteseq`)||`387`);return e=(Number(e)||387)+1,localStorage.setItem(`hg2:quoteseq`,JSON.stringify(e)),e}catch{return Math.floor(Date.now()/1e3)%1e5}},Be=(e=new Date)=>`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,`0`)}`,Ve=e=>`tel:${(e||``).replace(/\s/g,``)}`,He=e=>{let t=(e||``).trim();return t?/^https?:\/\//i.test(t)?t:`https://${t}`:``},Z=(e,t)=>{let n=(e||``).replace(/\D/g,``);return n.startsWith(`0`)&&(n=`972`+n.slice(1)),`https://wa.me/${n}?text=${encodeURIComponent(t||``)}`},Ue=(e,t=0)=>{let n=e.reduce((e,t)=>e+(Number(t.price)||0)*(Number(t.qty)||1),0),r=Math.max(0,Math.min(15,Number(t)||0)),i=Math.round(n*r/100),a=n-i,o=Math.round(a*Ee);return{gross:n,discount:i,discountPct:r,subtotal:a,vat:o,total:a+o}},We=async e=>{try{return await navigator.clipboard.writeText(e),!0}catch{try{let t=document.createElement(`textarea`);return t.value=e,t.style.position=`fixed`,t.style.opacity=`0`,document.body.appendChild(t),t.select(),document.execCommand(`copy`),t.remove(),!0}catch{return!1}}},Ge=async(e,t)=>{let n=(e||``).replace(/\s/g,``);t(await We(n)?`המספר הועתק ✓ פתח את Me והדבק לחיפוש`:`העתק ידנית: `+n)},Ke={ירושלים:[31.7683,35.2137],"תל אביב יפו":[32.0853,34.7818],"תל אביב":[32.0853,34.7818],חיפה:[32.794,34.9896],"ראשון לציון":[31.973,34.8066],"פתח תקווה":[32.084,34.8878],אשדוד:[31.8014,34.6435],נתניה:[32.3215,34.8532],"באר שבע":[31.252,34.7915],"בני ברק":[32.0807,34.8338],חולון:[32.0167,34.7795],"רמת גן":[32.07,34.8245],אשקלון:[31.6688,34.5715],רחובות:[31.8928,34.8113],"בת ים":[32.0231,34.7503],"כפר סבא":[32.175,34.907],הרצליה:[32.1624,34.8447],חדרה:[32.434,34.9196],מודיעין:[31.898,35.0104],נצרת:[32.7019,35.2978],רמלה:[31.9288,34.8667],לוד:[31.9514,34.8953],רעננה:[32.1848,34.8713],רהט:[31.392,34.7544],אילת:[29.5577,34.9519],עכו:[32.9281,35.0818],נהריה:[33.0085,35.095],"קרית אתא":[32.811,35.113],"קרית גת":[31.61,34.7642],"קרית ביאליק":[32.8307,35.0865],"קרית מוצקין":[32.838,35.076],"קרית ים":[32.848,35.068],טבריה:[32.7959,35.53],צפת:[32.9646,35.496],דימונה:[31.0707,35.0327],אופקים:[31.3147,34.62],שדרות:[31.5249,34.5963],"נס ציונה":[31.9293,34.7986],יבנה:[31.8783,34.739],טייבה:[32.266,35.009],טירה:[32.234,34.951],"אום אל פחם":[32.516,35.153],"כפר קאסם":[32.114,34.976],"באקה אל גרביה":[32.417,35.037],טמרה:[32.852,35.198],סחנין:[32.865,35.298],שפרעם:[32.806,35.169],"מעלות תרשיחא":[33.016,35.27],כרמיאל:[32.917,35.292],עפולה:[32.6078,35.2897],"בית שאן":[32.4969,35.4997],"בית שמש":[31.7497,34.9886],"מגדל העמק":[32.675,35.241],יקנעם:[32.658,35.11],"נוף הגליל":[32.709,35.317],ערד:[31.259,35.212],נתיבות:[31.422,34.595],"קרית שמונה":[33.207,35.57],"זכרון יעקב":[32.572,34.953],"פרדס חנה כרכור":[32.475,34.974],אזור:[32.029,34.8],גבעתיים:[32.072,34.812],"אור יהודה":[32.03,34.853],יהוד:[32.033,34.889],"ראש העין":[32.0956,34.956],טורעאן:[32.779,35.376],דבורייה:[32.696,35.376],עראבה:[32.851,35.337],"מעלה אדומים":[31.773,35.298],"גבעת שמואל":[32.078,34.848],"כפר יונה":[32.317,34.934],קצרין:[32.992,35.69],אריאל:[32.105,35.188],"מודיעין עילית":[31.932,35.042],אלעד:[32.052,34.951],שוהם:[31.999,34.947],גדרה:[31.813,34.779],"גן יבנה":[31.788,34.706],"קרית מלאכי":[31.73,34.744],"מזכרת בתיה":[31.852,34.839],"קרית עקרון":[31.87,34.82],"באר יעקב":[31.943,34.835],"אור עקיבא":[32.508,34.917],בנימינה:[32.515,34.948],קיסריה:[32.5,34.897],חריש:[32.462,35.048],"אבן יהודה":[32.271,34.888],"תל מונד":[32.251,34.917],"קדימה צורן":[32.279,34.922],פרדסיה:[32.303,34.915],"ראש העין":[32.0956,34.956],"אבו גוש":[31.806,35.11],"מבשרת ציון":[31.799,35.15],"ביתר עילית":[31.696,35.118],"טירת כרמל":[32.761,34.972],נשר:[32.766,35.044],"קרית טבעון":[32.72,35.123],רכסים:[32.741,35.09],"כפר כנא":[32.747,35.342],ריינה:[32.722,35.316],משהד:[32.735,35.365],"כפר מנדא":[32.81,35.257],מגאר:[32.89,35.408],ראמה:[32.937,35.368],"דיר חנא":[32.862,35.364],"כפר יאסיף":[32.955,35.164],ירכא:[32.958,35.209],"אבו סנאן":[32.956,35.173],חורפיש:[33.019,35.345],"בית ג'ן":[32.967,35.38],פקיעין:[32.978,35.334],"כפר קרע":[32.506,35.047],ערערה:[32.492,35.101],"ג'ת":[32.406,35.056],קלנסווה:[32.286,34.981],"ג'לג'וליה":[32.153,34.953],"כפר ברא":[32.108,34.974],אכסאל:[32.675,35.338],יפיע:[32.69,35.273],שעב:[32.865,35.201],כאבול:[32.868,35.212],"ג'סר א זרקא":[32.536,34.913],פוריידיס:[32.601,34.951],"תל אביב":[32.0853,34.7818],"ראש פינה":[32.969,35.542],יבנאל:[32.708,35.504],שלומי:[33.073,35.145],"כפר ורדים":[32.987,35.288],"מעלה אדומים":[31.773,35.298],ירוחם:[30.987,34.929],"מצפה רמון":[30.609,34.801],"תל שבע":[31.262,34.841],חורה:[31.3,34.941],כסייפה:[31.237,35.085],"ערערה בנגב":[31.253,34.985],להבים:[31.372,34.817],מיתר:[31.319,34.93],עומר:[31.264,34.847],"גן יבנה ":[31.788,34.706],"יקנעם עילית":[32.658,35.11],"נצרת עילית":[32.709,35.317]},qe=e=>(e||``).replace(/^ישוב\s+/,``).replace(/^עיריית\s+/,``).replace(/^מ\.?א\.?\s+/,``).trim(),Je=e=>Ke[qe(e)]||null,Ye=(e,t=.006)=>{let n=0,r=String(e);for(let e=0;e<r.length;e++)n=n*31+r.charCodeAt(e)>>>0;return[(n%1e3/1e3-.5)*t,((n>>10)%1e3/1e3-.5)*t]},Xe=`itai:geocache`,Q=null,$=()=>{if(Q)return Q;try{Q=JSON.parse(localStorage.getItem(Xe)||`{}`)}catch{Q={}}return Q},Ze=(e,t)=>{let n=$();n[e]=t;try{localStorage.setItem(Xe,JSON.stringify(n))}catch{}},Qe=e=>`${(e.addr||``).trim()}|${qe(e.city)}`,$e=e=>!!$()[Qe(e)],et=0;async function tt(e,t){let n=`${(e||``).trim()}|${qe(t)}`,r=$();if(r[n])return r[n];if(!e||!e.trim())return null;let i=Math.max(0,1100-(Date.now()-et));i&&await new Promise(e=>setTimeout(e,i)),et=Date.now();try{let r=encodeURIComponent(`${e}, ${t}, ישראל`),i=await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=il&q=${r}`,{headers:{Accept:`application/json`}});if(!i.ok)return null;let a=await i.json();if(a&&a[0]){let e=[parseFloat(a[0].lat),parseFloat(a[0].lon)];return Ze(n,e),e}}catch{}return null}var nt=e=>{let t=$()[Qe(e)];if(t)return t;let n=Je(e.city);if(!n)return null;let r=Ye(e.id);return[n[0]+r[0],n[1]+r[1]]},rt=e=>{let t=$()[Qe(e)]||Je(e.city);return t?`https://waze.com/ul?ll=${t[0]},${t[1]}&navigate=yes`:`https://waze.com/ul?q=${encodeURIComponent([e.addr,e.city].filter(Boolean).join(` `))}&navigate=yes`},it=e=>{let t=document.createElement(`link`);t.rel=`stylesheet`,t.href=e,document.head.appendChild(t)},at=e=>new Promise((t,n)=>{let r=document.createElement(`script`);r.src=e,r.onload=t,r.onerror=n,document.head.appendChild(r)}),ot=null,st=()=>window.L&&window.L.markerClusterGroup?Promise.resolve(window.L):ot||(ot=(async()=>{window.L||(it(`https://unpkg.com/leaflet@1.9.4/dist/leaflet.css`),await at(`https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`));try{it(`https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css`),it(`https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css`),await at(`https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js`)}catch{}return window.L})(),ot),ct=`hg2:pricelist`,lt=[{id:`p1`,name:`איתוראן 2 מערכות`,price:300},{id:`p2`,name:`איתוראן 3 מערכות`,price:400},{id:`p3`,name:`מצלמת רוורס + מסך`,price:1e3},{id:`p4`,name:`סט מסך חכם 4 מצלמות`,price:3500},{id:`p5`,name:`פוינטר TOP רב קודן`,price:150}],ut=()=>{try{let e=localStorage.getItem(ct),t=e?JSON.parse(e):null;return Array.isArray(t)&&t.length?t:lt}catch{return lt}};function dt(){let[e,t]=(0,F.useState)(ut);return(0,F.useEffect)(()=>{let e=()=>t(ut());window.addEventListener(`focus`,e),document.addEventListener(`visibilitychange`,e);let n=setInterval(e,5e3);return()=>{window.removeEventListener(`focus`,e),document.removeEventListener(`visibilitychange`,e),clearInterval(n)}},[]),e}var ft=`https://heavygurad.com`,pt=`https://www.facebook.com/share/18k1Sn62EM/`,mt=`https://www.tiktok.com/@heavy.guard?_r=1&_t=ZS-97cp13u5MKV`,ht={gold:{name:`זהב`,dot:`#C2912E`,vars:{}},ocean:{name:`אוקיינוס`,dot:`#1B7E9C`,vars:{"--gold":`#1B7E9C`,"--gold2":`#13607A`,"--champ":`#0E5066`,"--cyan":`#0E5066`,"--s7":`#BFD9E4`,"--s8":`#E9F3F8`,"--void":`#F1F8FB`,"--s9":`#FFFFFF`,"--s4":`#3E6B7D`,"--silver":`#0B2A35`,"--gold-rgb":`27,126,156`,"--card-rgb":`255,255,255`,"--card2-rgb":`233,243,248`}},emerald:{name:`אמרלד`,dot:`#1E9A60`,vars:{"--gold":`#1E9A60`,"--gold2":`#15784A`,"--champ":`#0F5E39`,"--cyan":`#0F5E39`,"--s7":`#BFE3CE`,"--s8":`#E8F5EE`,"--void":`#F0FAF4`,"--s9":`#FFFFFF`,"--s4":`#3D7A5C`,"--silver":`#0B2E1C`,"--gold-rgb":`30,154,96`,"--card-rgb":`255,255,255`,"--card2-rgb":`232,245,238`}},royal:{name:`מלכותי`,dot:`#6D4FC4`,vars:{"--gold":`#6D4FC4`,"--gold2":`#553BA0`,"--champ":`#3F2B7A`,"--cyan":`#3F2B7A`,"--s7":`#D6CCEE`,"--s8":`#EEE9F8`,"--void":`#F5F2FB`,"--s9":`#FFFFFF`,"--s4":`#6D5AA8`,"--silver":`#211545`,"--gold-rgb":`109,79,196`,"--card-rgb":`255,255,255`,"--card2-rgb":`238,233,248`}},crimson:{name:`בורדו`,dot:`#C0392B`,vars:{"--gold":`#C0392B`,"--gold2":`#9B2D22`,"--champ":`#7A241B`,"--cyan":`#7A241B`,"--s7":`#E8C9C4`,"--s8":`#FBEBE8`,"--void":`#FCF3F1`,"--s9":`#FFFFFF`,"--s4":`#A85A4C`,"--silver":`#3D0F09`,"--gold-rgb":`192,57,43`,"--card-rgb":`255,255,255`,"--card2-rgb":`251,235,232`}}};function gt(){let[e,n]=(0,F.useState)(()=>{try{let e=(location.hash||``).replace(/^#/,``);if([`home`,`leads`,`deals`,`custs`,`map`,`showroom`].includes(e))return e}catch{}return`home`}),[r,i]=(0,F.useState)(()=>Me(U,{})),[a,o]=(0,F.useState)(()=>Me(W,[])),[s,c]=(0,F.useState)(()=>Me(G,[])),[l,d]=(0,F.useState)(null),[p,h]=(0,F.useState)(null),[g,_]=(0,F.useState)(()=>{try{return localStorage.getItem(`itai:theme`)||`gold`}catch{return`gold`}}),y=e=>{_(e);try{localStorage.setItem(`itai:theme`,e)}catch{}},b=(ht[g]||ht.gold).vars,[x,S]=(0,F.useState)([]);(0,F.useEffect)(()=>{m().then(e=>{if(e){S(e);return}t(()=>import(`./leadsData-DUYuyAcz.js`).then(e=>S(e.default)),[])})},[]);let C=(0,F.useMemo)(()=>x.map(e=>({...e,crmStatus:r[e.id]?.crmStatus||(e.xStatus===`לקוח`?`לקוח`:`חדש`),crmNotes:r[e.id]?.crmNotes||``,outreach:r[e.id]?.outreach||[]})),[r,x]),w=(0,F.useCallback)(e=>{d(e),setTimeout(()=>d(null),2600)},[]),T=(e,t)=>{K(e,t),Se(e,t)};(0,F.useEffect)(()=>(be(),Te((e,t)=>{if(t!=null){if(e===U)K(U,t),i(t);else if(e===W){let e=Array.isArray(t)?t:Object.values(t);K(W,e),o(e)}else if(e===G){let e=Array.isArray(t)?t:Object.values(t);K(G,e),c(e)}}},[U,W,G])),[]),(0,F.useEffect)(()=>{let e=typeof window<`u`&&window.storage||null,t=e=>{try{let t=localStorage.getItem(e);return t?JSON.parse(t):[]}catch{return[]}},n=n=>e?e.get(n).then(e=>e&&e.value!=null?JSON.parse(e.value):t(n)).catch(()=>t(n)):Promise.resolve(t(n));Promise.all([n(`hg2:index`),n(`hg2:customers`)]).then(([e,t])=>{let n=Ne,r={};(e||[]).filter(e=>e.customer?.trim()||e.phone?.trim()).forEach(e=>{let t=(e.customer||``).trim(),i=(e.phone||``).trim(),a=n(t)||`#`+i;r[a]||(r[a]={name:t||`(ללא שם)`,phone:i,city:e.location||``,revenue:0,count:0}),r[a].count++,r[a].revenue+=Number(e.price)||0,i&&!r[a].phone&&(r[a].phone=i),t&&(t.length>(r[a].name||``).length||r[a].name===`(ללא שם)`)&&(r[a].name=t)}),(t||[]).forEach(e=>{let t=(e.name||``).trim(),i=(e.phone||``).trim(),a=n(t)||`#`+i;r[a]?i&&!r[a].phone&&(r[a].phone=i):r[a]={name:t,phone:i,city:e.city||e.location||``,revenue:0,count:0,rawNotes:e.notes||``}});let i=Object.values(r).filter(e=>e.name&&e.name!==`(ללא שם)`);i.length&&c(e=>{let t=i.filter(t=>!e.some(e=>t.phone&&t.phone===e.phone||t.name&&n(e.name)===n(t.name))).map(e=>({id:q(),name:e.name,phone:e.phone,email:``,city:e.city||``,notes:e.count>0?`${e.count} התקנות Heavy Guard · הכנסה ${J(e.revenue)}`:e.rawNotes||``,source:`HeavyGuard`}));if(!t.length)return e;let r=[...t,...e];return K(G,r),Se(G,r),setTimeout(()=>w(`✓ יובאו ${t.length} לקוחות מ-Heavy Guard`),60),r})}).catch(()=>{})},[]),(0,F.useEffect)(()=>{let e=setTimeout(()=>{c(e=>{let t=Fe(e);return t.length===e.length?e:(K(G,t),Se(G,t),setTimeout(()=>w(`✓ אוחדו ${e.length-t.length} כפילויות לקוחות`),60),t)})},1800);return()=>clearTimeout(e)},[]);let E=(0,F.useCallback)((e,t)=>{i(n=>{let r={...n,[e]:{...n[e],...t}};return T(U,r),r})},[]),D=(0,F.useCallback)((e,t)=>{i(n=>{let r=n[e]||{},i={...n,[e]:{...r,outreach:[t,...r.outreach||[]]}};return T(U,i),i})},[]),O=(0,F.useCallback)(e=>{o(t=>{let n=t.some(t=>t.id===e.id)?t.map(t=>t.id===e.id?e:t):[e,...t];return T(W,n),n})},[]),k=(0,F.useCallback)(e=>{o(t=>{let n=t.filter(t=>t.id!==e);return T(W,n),n})},[]),A=(0,F.useCallback)(e=>{c(t=>{let n=e=>(e||``).trim().toLowerCase();if(e.phone&&t.some(t=>t.phone===e.phone)||e.name&&t.some(t=>n(t.name)===n(e.name)))return t;let r=[{...e,id:e.id||q()},...t];return T(G,r),r})},[]),j=(0,F.useCallback)(e=>{c(t=>{if(e.id&&t.some(t=>t.id===e.id)){let n=t.map(t=>t.id===e.id?e:t);return T(G,n),n}let n=e=>(e||``).trim().toLowerCase();if(e.phone&&t.some(t=>t.phone===e.phone)||e.name&&t.some(t=>n(t.name)===n(e.name)))return t;let r=[{...e,id:q()},...t];return T(G,r),r})},[]),te=(0,F.useCallback)(e=>{c(t=>{let n=t.filter(t=>t.id!==e);return T(G,n),n})},[]),ne=(0,F.useCallback)(()=>{let e=Fe(s),t=s.length-e.length;return t>0&&(c(e),T(G,e)),t},[s]),M=(0,F.useCallback)((e,t)=>{O({...e,status:`נסגר`,wonAt:Y()}),E(e.leadId,{crmStatus:`לקוח`}),(t||e.name)&&A({name:e.name||t?.n,phone:e.phone||(t?.phones||[])[0]||``,email:t?.e||``,city:t?.city||``,notes:`נסגרה עסקה: ${J(e.total)}`,source:`עסקה`}),w(`מזל טוב! העסקה נסגרה והלקוח נוסף 🎉`)},[O,E,A,w]);return typeof location<`u`&&/(^|[#&])samform/.test(location.hash||``)?(0,z.jsxs)(`div`,{className:`ag`,style:b,children:[(0,z.jsx)(on,{}),(0,z.jsx)(an,{showToast:w}),l&&(0,z.jsx)(`div`,{className:`ag-toast`,children:l})]}):(0,z.jsxs)(`div`,{className:`ag`,style:b,children:[(0,z.jsx)(on,{}),e===`home`&&(0,z.jsx)(_t,{leads:C,deals:a,custs:s,go:n,onNewDeal:()=>h({}),showToast:w,theme:g,setTheme:y,onCatalogQuote:e=>h({deal:{items:[{desc:e.name,qty:1,price:Number(e.price)||0}],status:`פתוח`}})}),e===`leads`&&(0,z.jsx)(vt,{leads:C,updateCrm:E,addOutreach:D,onDeal:e=>h({lead:e}),dealsFor:e=>a.filter(t=>t.leadId===e),showToast:w}),e===`deals`&&(0,z.jsx)(xt,{deals:a,leads:C,onEdit:e=>h({deal:e}),onNew:()=>h({}),onWin:M,onRemove:k,showToast:w}),e===`custs`&&(0,z.jsx)(Tt,{custs:s,onSave:j,onRemove:te,onMerge:ne,showToast:w}),e===`map`&&(0,z.jsx)(Bt,{leads:C,custs:s,deals:a,showToast:w}),e===`showroom`&&(0,z.jsx)(Zt,{showToast:w,onQuote:e=>h({deal:{items:[{desc:e.name,qty:1,price:Number(e.price)||0}],status:`פתוח`}})}),(0,z.jsxs)(`nav`,{className:`ag-nav`,children:[(0,z.jsxs)(`div`,{className:`ag-nav-brand`,children:[(0,z.jsx)(`img`,{src:u,alt:`HeavyGuard`,className:`ag-nav-brand-logo`}),(0,z.jsxs)(`div`,{className:`ag-nav-brand-txt`,children:[(0,z.jsx)(`b`,{children:`Heavy Guard`}),(0,z.jsx)(`span`,{children:`CRM`})]})]}),(0,z.jsxs)(`button`,{className:e===`home`?`on`:``,onClick:()=>n(`home`),children:[(0,z.jsx)(le,{size:20}),(0,z.jsx)(`span`,{children:`בקרה`})]}),(0,z.jsxs)(`button`,{className:e===`leads`?`on`:``,onClick:()=>n(`leads`),children:[(0,z.jsx)(f,{size:20}),(0,z.jsx)(`span`,{children:`לידים`})]}),(0,z.jsxs)(`button`,{className:e===`deals`?`on`:``,onClick:()=>n(`deals`),children:[(0,z.jsx)(ce,{size:20}),(0,z.jsx)(`span`,{children:`עסקאות`})]}),(0,z.jsxs)(`button`,{className:e===`custs`?`on`:``,onClick:()=>n(`custs`),children:[(0,z.jsx)(pe,{size:20}),(0,z.jsx)(`span`,{children:`לקוחות`})]}),(0,z.jsxs)(`button`,{className:e===`showroom`?`on`:``,onClick:()=>n(`showroom`),children:[(0,z.jsx)(ee,{size:20}),(0,z.jsx)(`span`,{children:`שורום`})]}),(0,z.jsxs)(`button`,{className:`ag-nav-exit`,onClick:()=>{try{window.close()}catch{}setTimeout(()=>{w(`אפשר לסגור את הכרטיסייה/הדפדפן עכשיו`)},150)},children:[(0,z.jsx)(v,{size:20}),(0,z.jsx)(`span`,{children:`יציאה`})]})]}),p&&(0,z.jsx)(Ct,{lead:p.lead,deal:p.deal,leads:C,onClose:()=>h(null),onSave:e=>{O(e),h(null),w(`העסקה נשמרה`)},showToast:w}),l&&(0,z.jsx)(`div`,{className:`ag-toast`,children:l})]})}function _t({leads:e,deals:t,custs:n,go:r,onNewDeal:a,showToast:o,theme:s,setTheme:c,onCatalogQuote:l}){let[f,p]=(0,F.useState)(!1),[m,h]=(0,F.useState)(!1),[g,_]=(0,F.useState)(!1),[y,b]=(0,F.useState)(!1),S=Be(),C=t.filter(e=>e.status===`פתוח`),w=t.filter(e=>e.status===`נסגר`&&(e.wonAt||``).startsWith(S)),T=C.reduce((e,t)=>e+(t.total||0),0),E=w.reduce((e,t)=>e+(t.total||0),0),D=e.filter(e=>[`פנייה ראשונה`,`בתהליך`,`הצעה נשלחה`].includes(e.crmStatus)).length,k=t.filter(e=>e.status===`נסגר`),A=t.length?Math.round(k.length/t.length*100):0;return(0,z.jsxs)(`div`,{className:`ag-flow`,children:[(0,z.jsxs)(`header`,{className:`ag-head`,children:[(0,z.jsx)(`img`,{src:u,className:`ag-logo`,alt:``}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`div`,{className:`ag-title`,children:`מערכת CRM`}),(0,z.jsxs)(`div`,{className:`ag-sub`,children:[B,` — ניהול לידים ועסקאות`]})]}),(0,z.jsxs)(`div`,{className:`ag-links`,children:[(0,z.jsx)(`a`,{className:`ag-soc home`,href:`/Alpha-new/`,title:`חזרה לאלפא`,"aria-label":`חזרה לאלפא`,children:(0,z.jsx)(re,{size:15})}),(0,z.jsxs)(`a`,{className:`ag-site`,href:ft,target:`_blank`,rel:`noreferrer`,title:`heavygurad.com`,children:[(0,z.jsx)(`img`,{src:u,alt:``}),(0,z.jsx)(`span`,{children:`האתר`})]}),(0,z.jsx)(`a`,{className:`ag-soc fb`,href:pt,target:`_blank`,rel:`noreferrer`,title:`Facebook — עבודות`,"aria-label":`Facebook`,children:(0,z.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`17`,height:`17`,fill:`currentColor`,children:(0,z.jsx)(`path`,{d:`M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z`})})}),(0,z.jsx)(`a`,{className:`ag-soc tt`,href:mt,target:`_blank`,rel:`noreferrer`,title:`TikTok — עבודות`,"aria-label":`TikTok`,children:(0,z.jsx)(`svg`,{viewBox:`0 0 24 24`,width:`16`,height:`16`,fill:`currentColor`,children:(0,z.jsx)(`path`,{d:`M16.5 3c.3 2.3 1.6 3.7 3.8 3.9v2.5c-1.3.1-2.5-.3-3.8-1v5.9c0 4.6-3.7 6.9-7 5.4-2.6-1.2-3.4-4.6-1.6-6.9 1-1.3 2.6-2 4.5-1.7v2.6c-.4-.1-.8-.2-1.3-.1-1 .1-1.7.8-1.7 1.8 0 1.2 1.1 2 2.3 1.7 1-.3 1.5-1.1 1.5-2.2V3h2.6z`})})}),(0,z.jsx)(`button`,{className:`ag-soc send`,onClick:async()=>{let e=`הנה עבודות וההמלצות שלנו ב-${B} 🚛🛡️\nאתר: ${ft}\nFacebook: ${pt}\nTikTok: ${mt}`;try{if(navigator.share){await navigator.share({title:B,text:e});return}}catch{return}let t=await We(e);o&&o(t?`הקישורים הועתקו — הדבק ושלח ללקוח`:`העתקה נכשלה`)},title:`שלח עבודות ללקוח`,"aria-label":`שלח עבודות`,children:(0,z.jsx)(P,{size:15})}),(0,z.jsx)(`button`,{className:`ag-soc theme`,onClick:()=>p(!0),title:`צבע הפלטפורמה`,"aria-label":`צבעים`,children:(0,z.jsx)(fe,{size:15})}),(0,z.jsx)(`button`,{className:`ag-soc cloud`+(I()?` on`:``),onClick:()=>b(!0),title:`מסד נתונים משותף`,"aria-label":`ענן`,children:(0,z.jsx)(x,{size:15})})]})]}),y&&(0,z.jsx)(tn,{onClose:()=>b(!1),showToast:o}),f&&(0,z.jsx)(`div`,{className:`ag-modal`,onClick:e=>{e.target===e.currentTarget&&p(!1)},children:(0,z.jsxs)(`div`,{className:`ag-sheet sm`,children:[(0,z.jsxs)(`div`,{className:`ag-sheet-head`,children:[(0,z.jsx)(`b`,{children:`צבע הפלטפורמה · מצב רוח`}),(0,z.jsx)(`button`,{onClick:()=>p(!1),children:(0,z.jsx)(N,{size:20})})]}),(0,z.jsx)(`div`,{className:`ag-sheet-body`,children:(0,z.jsx)(`div`,{className:`ag-theme-grid`,children:Object.entries(ht).map(([e,t])=>(0,z.jsxs)(`button`,{className:`ag-theme-opt`+(s===e?` on`:``),onClick:()=>{c(e),o(`ערכת צבע: `+t.name)},children:[(0,z.jsx)(`span`,{className:`ag-theme-dot`,style:{background:t.dot}}),(0,z.jsx)(`span`,{children:t.name})]},e))})})]})}),(0,z.jsxs)(`div`,{className:`ag-kpis`,children:[(0,z.jsxs)(`button`,{className:`ag-kpi`,onClick:()=>r(`leads`),children:[(0,z.jsx)(`b`,{children:e.length.toLocaleString()}),(0,z.jsx)(`span`,{children:`לידים במאגר`})]}),(0,z.jsxs)(`button`,{className:`ag-kpi`,onClick:()=>r(`leads`),children:[(0,z.jsx)(`b`,{children:D.toLocaleString()}),(0,z.jsx)(`span`,{children:`בתהליך`})]}),(0,z.jsxs)(`button`,{className:`ag-kpi`,onClick:()=>r(`deals`),children:[(0,z.jsx)(`b`,{className:`cy`,children:C.length}),(0,z.jsx)(`span`,{children:`עסקאות פתוחות`})]}),(0,z.jsxs)(`button`,{className:`ag-kpi`,onClick:()=>r(`custs`),children:[(0,z.jsx)(`b`,{className:`ok`,children:n.length}),(0,z.jsx)(`span`,{children:`לקוחות`})]})]}),(0,z.jsxs)(`div`,{className:`ag-card big`,children:[(0,z.jsxs)(`div`,{className:`ag-card-row`,children:[(0,z.jsxs)(`span`,{children:[(0,z.jsx)(oe,{size:15}),` שווי צבר פתוח`]}),(0,z.jsx)(`b`,{className:`cy`,children:J(T)})]}),(0,z.jsxs)(`div`,{className:`ag-card-row`,children:[(0,z.jsxs)(`span`,{children:[(0,z.jsx)(i,{size:15}),` נסגר החודש`]}),(0,z.jsx)(`b`,{className:`ok`,children:J(E)})]}),(0,z.jsxs)(`div`,{className:`ag-card-row`,children:[(0,z.jsxs)(`span`,{children:[(0,z.jsx)(ne,{size:15}),` אחוז סגירה`]}),(0,z.jsxs)(`b`,{children:[A,`%`]})]})]}),(0,z.jsxs)(`button`,{className:`ag-cta`,onClick:a,children:[(0,z.jsx)(M,{size:20}),` עסקה חדשה`]}),(0,z.jsx)(zt,{leads:e,deals:t,custs:n,go:r,onNewDeal:a,showToast:o}),(0,z.jsxs)(`button`,{className:`ag-mapcard`,onClick:()=>r(`map`),children:[(0,z.jsx)(`div`,{className:`ag-mapcard-glow`}),(0,z.jsxs)(`div`,{className:`ag-mapcard-txt`,children:[(0,z.jsxs)(`b`,{children:[(0,z.jsx)(O,{size:15}),` מפת העסקים · ארץ ישראל`]}),(0,z.jsx)(`span`,{children:`צפה בלקוחות והלידים על המפה ותכנן מסלול פגישות`})]}),(0,z.jsx)(v,{size:22})]}),(0,z.jsxs)(`div`,{className:`ag-tools2`,children:[(0,z.jsxs)(`button`,{className:`ag-tool`,onClick:()=>h(!0),children:[(0,z.jsx)(d,{size:20}),(0,z.jsx)(`b`,{children:`טופס סמסוניקס`}),(0,z.jsx)(`span`,{children:`החתמת לקוח · DVR`})]}),(0,z.jsxs)(`button`,{className:`ag-tool`,onClick:()=>_(!0),children:[(0,z.jsx)(oe,{size:20}),(0,z.jsx)(`b`,{children:`קטלוג מוצרים`}),(0,z.jsx)(`span`,{children:`מחירון חי`})]})]}),m&&(0,z.jsx)(Kt,{onClose:()=>h(!1),showToast:o}),g&&(0,z.jsx)(Qt,{onClose:()=>_(!1),onQuote:e=>{l(e),_(!1),o(`נוסף להצעה: `+e.name)}}),(0,z.jsx)(rn,{showToast:o}),(0,z.jsx)(`div`,{className:`ag-secttl`,children:`עסקאות אחרונות`}),t.length===0&&(0,z.jsxs)(`div`,{className:`ag-empty`,children:[(0,z.jsx)(ce,{size:32}),(0,z.jsx)(`div`,{children:`אין עדיין עסקאות`}),(0,z.jsx)(`p`,{children:`פתח ליד וצור הצעת מחיר כדי להתחיל`})]}),t.slice(0,5).map(e=>(0,z.jsxs)(`button`,{className:`ag-deal-row`,onClick:()=>r(`deals`),children:[(0,z.jsx)(`span`,{className:`ag-dot`,style:{background:H[e.status]}}),(0,z.jsxs)(`div`,{className:`ag-deal-mid`,children:[(0,z.jsx)(`b`,{children:e.name||`ללא שם`}),(0,z.jsxs)(`span`,{children:[e.items.length,` פריטים · `,e.createdAt]})]}),(0,z.jsx)(`div`,{className:`ag-deal-val`,children:J(e.total)})]},e.id))]})}function vt({leads:e,updateCrm:t,addOutreach:n,onDeal:r,dealsFor:i,showToast:a}){let[o,s]=(0,F.useState)(``),[c,l]=(0,F.useState)(``),[u,d]=(0,F.useState)(``),[p,m]=(0,F.useState)(null),[h,g]=(0,F.useState)(0),_=(0,F.useMemo)(()=>e.filter(e=>{if(c&&e.geo!==c||u&&e.crmStatus!==u)return!1;if(o){let t=o.toLowerCase();return(e.n||``).toLowerCase().includes(t)||(e.city||``).toLowerCase().includes(t)||(e.sector||``).toLowerCase().includes(t)||(e.phones||[]).some(e=>e.includes(t))}return!0}),[e,o,c,u]),v=_.slice(0,(h+1)*50),y=p?e.find(e=>e.id===p):null;return y?(0,z.jsx)(bt,{lead:y,onBack:()=>m(null),onStatus:e=>t(y.id,{crmStatus:e}),onNotes:e=>t(y.id,{crmNotes:e}),onOutreach:e=>n(y.id,e),onDeal:()=>r(y),deals:i(y.id),showToast:a}):(0,z.jsxs)(`div`,{className:`ag-flow`,children:[(0,z.jsx)(`header`,{className:`ag-head sm`,children:(0,z.jsxs)(`div`,{children:[(0,z.jsx)(`div`,{className:`ag-title`,children:`ניהול לידים`}),(0,z.jsxs)(`div`,{className:`ag-sub`,children:[_.length.toLocaleString(),` תוצאות`]})]})}),(0,z.jsxs)(`div`,{className:`ag-searchbox`,children:[(0,z.jsx)(j,{size:15}),(0,z.jsx)(`input`,{value:o,onChange:e=>{s(e.target.value),g(0)},placeholder:`חיפוש שם, עיר, תחום, טלפון…`,dir:`rtl`}),o&&(0,z.jsx)(`button`,{onClick:()=>s(``),children:(0,z.jsx)(N,{size:14})})]}),(0,z.jsxs)(`div`,{className:`ag-chips`,children:[(0,z.jsx)(`button`,{className:c?``:`on`,onClick:()=>{l(``),g(0)},children:`הכל`}),V.map(e=>(0,z.jsx)(`button`,{className:c===e?`on`:``,onClick:()=>{l(e),g(0)},children:e},e))]}),(0,z.jsxs)(`div`,{className:`ag-chips sm`,children:[(0,z.jsx)(`button`,{className:u?``:`on`,onClick:()=>{d(``),g(0)},children:`כל הסטטוסים`}),De.map(e=>(0,z.jsx)(`button`,{className:u===e?`on`:``,style:{"--sc":Oe[e]},onClick:()=>{d(e),g(0)},children:e},e))]}),v.map(e=>(0,z.jsx)(yt,{lead:e,onClick:()=>m(e.id)},e.id)),_.length>v.length&&(0,z.jsxs)(`button`,{className:`ag-more`,onClick:()=>g(e=>e+1),children:[`טען עוד · `,(_.length-v.length).toLocaleString(),` נותרו`]}),_.length===0&&(0,z.jsxs)(`div`,{className:`ag-empty`,children:[(0,z.jsx)(f,{size:32}),(0,z.jsx)(`div`,{children:`אין תוצאות`})]})]})}function yt({lead:e,onClick:t}){let n=Oe[e.crmStatus]||`#8E9BAB`;return(0,z.jsxs)(`button`,{className:`ag-card lead`,onClick:t,children:[(0,z.jsxs)(`div`,{className:`ag-card-top`,children:[(0,z.jsx)(`div`,{className:`ag-card-name`,children:e.n}),(0,z.jsx)(`span`,{className:`ag-badge`,style:{background:n+`22`,color:n,border:`1px solid ${n}55`},children:e.crmStatus})]}),(0,z.jsxs)(`div`,{className:`ag-card-meta`,children:[e.city&&(0,z.jsxs)(`span`,{children:[(0,z.jsx)(O,{size:11}),e.city]}),(e.phones||[])[0]&&(0,z.jsxs)(`span`,{children:[(0,z.jsx)(k,{size:11}),e.phones[0]]}),e.outreach?.length>0&&(0,z.jsxs)(`span`,{className:`ag-act`,children:[(0,z.jsx)(h,{size:10}),e.outreach.length]})]}),e.sector&&(0,z.jsx)(`div`,{className:`ag-card-sector`,children:e.sector})]})}function bt({lead:e,onBack:t,onStatus:n,onNotes:r,onOutreach:i,onDeal:a,deals:o,showToast:s}){let[u,f]=(0,F.useState)(e.crmNotes||``),[p,m]=(0,F.useState)(!1),[h,g]=(0,F.useState)(`שיחה`),[_,b]=(0,F.useState)(`חיובי`),[S,C]=(0,F.useState)(``);return(0,z.jsxs)(`div`,{className:`ag-flow`,children:[(0,z.jsxs)(`header`,{className:`ag-head sm`,children:[(0,z.jsx)(`button`,{className:`ag-back`,onClick:t,children:(0,z.jsx)(v,{size:22})}),(0,z.jsxs)(`div`,{style:{flex:1,minWidth:0},children:[(0,z.jsx)(`div`,{className:`ag-title`,style:{fontSize:16},children:e.n}),(0,z.jsx)(`div`,{className:`ag-sub`,children:[e.city,e.geo].filter(Boolean).join(` · `)})]})]}),(0,z.jsx)(`div`,{className:`ag-pipeline`,children:De.map(t=>(0,z.jsx)(`button`,{className:`ag-pipe`+(e.crmStatus===t?` on`:``),style:{"--sc":Oe[t]},onClick:()=>n(t),children:t},t))}),(0,z.jsxs)(`button`,{className:`ag-cta`,onClick:a,children:[(0,z.jsx)(d,{size:18}),` צור / שלח הצעת מחיר`]}),o.length>0&&(0,z.jsxs)(`div`,{className:`ag-section`,children:[(0,z.jsxs)(`div`,{className:`ag-section-ttl`,children:[`עסקאות לליד זה (`,o.length,`)`]}),o.map(e=>(0,z.jsxs)(`div`,{className:`ag-deal-row flat`,children:[(0,z.jsx)(`span`,{className:`ag-dot`,style:{background:H[e.status]}}),(0,z.jsxs)(`div`,{className:`ag-deal-mid`,children:[(0,z.jsx)(`b`,{children:e.status}),(0,z.jsxs)(`span`,{children:[e.items.length,` פריטים · `,e.createdAt]})]}),(0,z.jsx)(`div`,{className:`ag-deal-val`,children:J(e.total)})]},e.id))]}),(0,z.jsxs)(`div`,{className:`ag-section`,children:[(0,z.jsxs)(`div`,{className:`ag-section-ttl`,children:[`טלפונים`,(e.phones||[]).length>1?` (${e.phones.length})`:``]}),(e.phones||[]).length===0&&(0,z.jsx)(`div`,{className:`ag-empty sm`,children:`אין מספרי טלפון לליד זה`}),(e.phones||[]).map((e,t)=>(0,z.jsxs)(`div`,{className:`ag-phone`,children:[(0,z.jsx)(k,{size:14,className:`ag-phone-ic`}),(0,z.jsx)(`span`,{className:`ag-phone-num`,dir:`ltr`,children:e}),(0,z.jsxs)(`a`,{href:Ve(e),className:`ag-phone-btn`,children:[(0,z.jsx)(k,{size:13}),` חייג`]}),(0,z.jsxs)(`button`,{onClick:()=>Ge(e,s),className:`ag-phone-btn me`,children:[(0,z.jsx)(D,{size:13}),` Me · העתק`]})]},t)),e.e&&(0,z.jsxs)(`a`,{href:`mailto:${e.e}`,className:`ag-info`,children:[(0,z.jsx)(l,{size:13}),(0,z.jsx)(`span`,{className:`ag-trunc`,children:e.e})]}),e.addr&&(0,z.jsxs)(`div`,{className:`ag-info`,children:[(0,z.jsx)(O,{size:13}),e.addr,`, `,e.city]}),e.w&&(0,z.jsxs)(`a`,{href:He(e.w),target:`_blank`,rel:`noopener noreferrer`,className:`ag-info ag-link`,children:[(0,z.jsx)(x,{size:13}),(0,z.jsx)(`span`,{className:`ag-trunc`,children:e.w})]})]}),(0,z.jsxs)(`div`,{className:`ag-section`,children:[(0,z.jsx)(`div`,{className:`ag-section-ttl`,children:`פרטי עסק`}),e.sector&&(0,z.jsxs)(`div`,{className:`ag-info`,children:[(0,z.jsx)(y,{size:13}),e.sector]}),e.emp&&(0,z.jsxs)(`div`,{className:`ag-info`,children:[(0,z.jsx)(te,{size:13}),e.emp,` מועסקים`]}),e.rev&&(0,z.jsxs)(`div`,{className:`ag-info`,children:[(0,z.jsx)(c,{size:13}),`מחזור: ₪`,Number(e.rev).toLocaleString(),` אלף`]}),e.activity&&(0,z.jsxs)(`div`,{className:`ag-info`,children:[(0,z.jsx)(A,{size:13}),e.activity.replace(/;/g,` · `)]})]}),(e.mgrs||[]).length>0&&(0,z.jsxs)(`div`,{className:`ag-section`,children:[(0,z.jsxs)(`div`,{className:`ag-section-ttl`,children:[`אנשי קשר (`,e.mgrs.length,`)`]}),(e.phones||[]).length>0&&(0,z.jsx)(`div`,{className:`ag-note-line`,children:`המספרים הם קווי העסק — חייג/שלח וואטסאפ אל איש הקשר דרכם`}),e.mgrs.slice(0,12).map((t,n)=>{let r=(e.phones||[])[0];return(0,z.jsxs)(`div`,{className:`ag-person`,children:[(0,z.jsxs)(`div`,{className:`ag-person-top`,children:[(0,z.jsx)(`span`,{className:`ag-mgr-name`,children:t.n}),t.r&&(0,z.jsx)(`span`,{className:`ag-mgr-role`,children:t.r})]}),r&&(0,z.jsxs)(`div`,{className:`ag-person-phone`,dir:`ltr`,children:[(0,z.jsx)(k,{size:11}),` `,r]}),(0,z.jsxs)(`div`,{className:`ag-person-acts`,children:[r&&(0,z.jsxs)(`a`,{href:Ve(r),className:`ag-person-btn`,children:[(0,z.jsx)(k,{size:12}),` חייג`]}),r&&(0,z.jsxs)(`button`,{onClick:()=>Ge(r,s),className:`ag-person-btn me`,children:[(0,z.jsx)(D,{size:12}),` Me · העתק`]}),t.e&&(0,z.jsxs)(`a`,{href:`mailto:${t.e}`,className:`ag-person-btn`,children:[(0,z.jsx)(l,{size:12}),` מייל`]})]})]},n)})]}),(0,z.jsxs)(`div`,{className:`ag-section`,children:[(0,z.jsx)(`div`,{className:`ag-section-ttl`,children:`הערות`}),(0,z.jsx)(`textarea`,{className:`ag-textarea`,value:u,onChange:e=>f(e.target.value),placeholder:`הערות אישיות על הליד…`,rows:3,dir:`rtl`}),(0,z.jsx)(`button`,{className:`ag-btn`,onClick:()=>{r(u),s(`ההערות נשמרו`)},children:`שמור הערות`})]}),(0,z.jsxs)(`div`,{className:`ag-section`,children:[(0,z.jsxs)(`div`,{className:`ag-section-ttl-row`,children:[(0,z.jsxs)(`span`,{className:`ag-section-ttl`,children:[`יומן פניות (`,e.outreach.length,`)`]}),(0,z.jsx)(`button`,{className:`ag-mini`,onClick:()=>m(e=>!e),children:`+ פנייה`})]}),p&&(0,z.jsxs)(`div`,{className:`ag-addform`,children:[(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsx)(`select`,{value:h,onChange:e=>g(e.target.value),className:`ag-select`,children:ke.map(e=>(0,z.jsx)(`option`,{children:e},e))}),(0,z.jsx)(`select`,{value:_,onChange:e=>b(e.target.value),className:`ag-select`,children:Ae.map(e=>(0,z.jsx)(`option`,{children:e},e))})]}),(0,z.jsx)(`textarea`,{value:S,onChange:e=>C(e.target.value),placeholder:`פרטי הפנייה…`,rows:2,className:`ag-textarea`,dir:`rtl`}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsx)(`button`,{className:`ag-btn`,onClick:()=>{if(!S.trim()){s(`הוסף פרטי פנייה`);return}i({id:q(),type:h,result:_,notes:S.trim(),date:Y()}),C(``),m(!1),s(`הפנייה נרשמה`)},children:`שמור`}),(0,z.jsx)(`button`,{className:`ag-btn ghost`,onClick:()=>m(!1),children:`ביטול`})]})]}),e.outreach.length===0&&!p&&(0,z.jsx)(`div`,{className:`ag-empty sm`,children:`אין פניות מתועדות עדיין`}),e.outreach.map(e=>(0,z.jsxs)(`div`,{className:`ag-out`,children:[(0,z.jsxs)(`div`,{className:`ag-out-h`,children:[(0,z.jsx)(`span`,{className:`ag-out-t`,children:e.type}),(0,z.jsx)(`span`,{className:`ag-out-r`,children:e.result}),(0,z.jsx)(`span`,{className:`ag-out-d`,children:e.date})]}),(0,z.jsx)(`div`,{className:`ag-out-n`,children:e.notes})]},e.id))]})]})}function xt({deals:e,leads:t,onEdit:n,onNew:r,onWin:i,onRemove:o,showToast:s}){let[c,l]=(0,F.useState)(``),u=c?e.filter(e=>e.status===c):e,d=e.filter(e=>e.status===`פתוח`).reduce((e,t)=>e+(t.total||0),0);return(0,z.jsxs)(`div`,{className:`ag-flow`,children:[(0,z.jsx)(`header`,{className:`ag-head sm`,children:(0,z.jsxs)(`div`,{children:[(0,z.jsx)(`div`,{className:`ag-title`,children:`עסקאות`}),(0,z.jsxs)(`div`,{className:`ag-sub`,children:[`צבר פתוח: `,J(d)]})]})}),(0,z.jsxs)(`button`,{className:`ag-cta`,onClick:r,children:[(0,z.jsx)(M,{size:18}),` עסקה חדשה`]}),(0,z.jsxs)(`div`,{className:`ag-chips sm`,children:[(0,z.jsx)(`button`,{className:c?``:`on`,onClick:()=>l(``),children:`הכל`}),je.map(e=>(0,z.jsx)(`button`,{className:c===e?`on`:``,style:{"--sc":H[e]},onClick:()=>l(e),children:e},e))]}),u.length===0&&(0,z.jsxs)(`div`,{className:`ag-empty`,children:[(0,z.jsx)(ce,{size:32}),(0,z.jsx)(`div`,{children:`אין עסקאות`}),(0,z.jsx)(`p`,{children:`לחץ "עסקה חדשה" כדי לבנות הצעת מחיר`})]}),u.map(e=>{let r=t.find(t=>t.id===e.leadId);return(0,z.jsxs)(`div`,{className:`ag-card deal`,children:[(0,z.jsxs)(`div`,{className:`ag-card-top`,children:[(0,z.jsx)(`div`,{className:`ag-card-name`,children:e.name||`ללא שם`}),(0,z.jsx)(`span`,{className:`ag-badge`,style:{background:H[e.status]+`22`,color:H[e.status],border:`1px solid ${H[e.status]}55`},children:e.status})]}),(0,z.jsxs)(`div`,{className:`ag-card-meta`,children:[(0,z.jsxs)(`span`,{children:[e.items.length,` פריטים`]}),(0,z.jsx)(`span`,{children:e.createdAt}),(0,z.jsx)(`b`,{className:`ag-deal-val`,children:J(e.total)})]}),(0,z.jsxs)(`div`,{className:`ag-deal-acts`,children:[(0,z.jsxs)(`a`,{className:`ag-abtn wa`,href:Z(e.phone,St(e)),target:`_blank`,rel:`noreferrer`,children:[(0,z.jsx)(_,{size:14}),` שלח`]}),(0,z.jsxs)(`button`,{className:`ag-abtn`,onClick:()=>n(e),children:[(0,z.jsx)(p,{size:14}),` ערוך`]}),e.status!==`נסגר`&&(0,z.jsxs)(`button`,{className:`ag-abtn ok`,onClick:()=>i(e,r),children:[(0,z.jsx)(ne,{size:14}),` נסגר!`]}),(0,z.jsx)(`button`,{className:`ag-abtn d`,onClick:()=>o(e.id),children:(0,z.jsx)(a,{size:14})})]})]},e.id)})]})}function St(e){let t=[`שלום ${e.name||``},`,`הצעת מחיר מ-${B}:`,``];return e.items.forEach(e=>{let n=(Number(e.price)||0)*(Number(e.qty)||1);t.push(`• ${e.desc} ${(Number(e.qty)||1)>1?`x`+e.qty:``} — ${J(n)}`)}),t.push(``),e.discount>0&&t.push(`מחיר מלא: ${J(e.gross)}`,`הנחה ${e.discountPct}%: −${J(e.discount)}`),t.push(`סכום ביניים: ${J(e.subtotal)}`,`מע"מ (18%): ${J(e.vat)}`,`סה"כ לתשלום: ${J(e.total)}`),e.note&&t.push(``,e.note),t.push(``,`בברכה, איתי`),t.join(`
`)}function Ct({lead:e,deal:t,leads:n,onClose:r,onSave:i,showToast:a}){let[o,s]=(0,F.useState)(t?.name||e?.n||``),[c,l]=(0,F.useState)(t?.phone||(e?.phones||[])[0]||``),[u,f]=(0,F.useState)(t?.leadId||e?.id||``),[p,m]=(0,F.useState)(t?.items?.length?t.items:[{desc:``,qty:1,price:``}]),[h,g]=(0,F.useState)(t?.note||``),[_,v]=(0,F.useState)(t?.status||`פתוח`),[y,b]=(0,F.useState)(t?.discountPct||0),[x,S]=(0,F.useState)(``),[C,w]=(0,F.useState)(!1),T=dt(),E=e=>m(t=>[...t.filter(e=>e.desc.trim()||e.price),{desc:e.name,qty:1,price:e.price}]),D=Ue(p,y),O=(e,t,n)=>m(r=>r.map((r,i)=>i===e?{...r,[t]:n}:r)),k=()=>m(e=>[...e,{desc:``,qty:1,price:``}]),A=e=>m(t=>t.filter((t,n)=>n!==e)),ee=(0,F.useMemo)(()=>{if(!x.trim())return[];let e=x.toLowerCase();return n.filter(t=>(t.n||``).toLowerCase().includes(e)||(t.phones||[]).some(t=>t.includes(e))).slice(0,6)},[x,n]),j=()=>({id:t?.id||q(),leadId:u,name:o.trim(),phone:c.trim(),items:p.filter(e=>e.desc.trim()||e.price),gross:D.gross,discountPct:D.discountPct,discount:D.discount,subtotal:D.subtotal,vat:D.vat,total:D.total,status:_,note:h.trim(),createdAt:t?.createdAt||Y(),wonAt:t?.wonAt||null});return(0,z.jsxs)(`div`,{className:`ag-modal`,onClick:e=>{e.target===e.currentTarget&&r()},children:[(0,z.jsxs)(`div`,{className:`ag-sheet`,children:[(0,z.jsxs)(`div`,{className:`ag-sheet-head`,children:[(0,z.jsx)(`b`,{children:t?.id?`עריכת עסקה`:`עסקה חדשה`}),(0,z.jsx)(`button`,{onClick:r,children:(0,z.jsx)(N,{size:20})})]}),(0,z.jsxs)(`div`,{className:`ag-sheet-body`,children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`שם לקוח / עסק`}),(0,z.jsx)(`input`,{className:`ag-input`,value:o,onChange:e=>s(e.target.value),placeholder:`שם`,dir:`rtl`}),!e&&!t&&(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`קשר לליד קיים (אופציונלי)`}),(0,z.jsx)(`input`,{className:`ag-input`,value:x,onChange:e=>S(e.target.value),placeholder:`חפש ליד לפי שם/טלפון…`,dir:`rtl`}),ee.map(e=>(0,z.jsxs)(`button`,{className:`ag-link-opt`,onClick:()=>{f(e.id),s(e.n),l((e.phones||[])[0]||``),S(``)},children:[e.n,` · `,(e.phones||[])[0]||``]},e.id))]}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`טלפון`}),(0,z.jsx)(`input`,{className:`ag-input`,value:c,onChange:e=>l(e.target.value),placeholder:`050…`,dir:`ltr`}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`מחירון Heavy Guard · לחיצה מוסיפה פריט`}),(0,z.jsx)(`div`,{className:`ag-chips`,children:T.map(e=>(0,z.jsxs)(`button`,{type:`button`,onClick:()=>E(e),children:[e.name,` · `,J(e.price)]},e.id||e.name))}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`פריטי הצעה`}),p.map((e,t)=>(0,z.jsxs)(`div`,{className:`ag-item`,children:[(0,z.jsx)(`input`,{className:`ag-input desc`,value:e.desc,onChange:e=>O(t,`desc`,e.target.value),placeholder:`תיאור פריט/שירות`,dir:`rtl`}),(0,z.jsx)(`input`,{className:`ag-input qty`,type:`number`,min:`1`,value:e.qty,onChange:e=>O(t,`qty`,e.target.value),placeholder:`כמ'`}),(0,z.jsx)(`input`,{className:`ag-input price`,type:`number`,min:`0`,value:e.price,onChange:e=>O(t,`price`,e.target.value),placeholder:`₪`,dir:`ltr`}),p.length>1&&(0,z.jsx)(`button`,{className:`ag-item-del`,onClick:()=>A(t),children:(0,z.jsx)(N,{size:14})})]},t)),(0,z.jsxs)(`button`,{className:`ag-additem`,onClick:k,children:[(0,z.jsx)(M,{size:14}),` הוסף פריט`]}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`הנחה ללקוח`}),(0,z.jsx)(`div`,{className:`ag-chips sm nowrap ag-disc`,children:[0,5,10,15].map(e=>(0,z.jsx)(`button`,{className:y===e?`on`:``,onClick:()=>b(e),children:e===0?`ללא`:e+`%`},e))}),(0,z.jsxs)(`div`,{className:`ag-totbox`,children:[D.discount>0&&(0,z.jsxs)(`div`,{className:`ag-totrow`,children:[(0,z.jsx)(`span`,{children:`מחיר מלא`}),(0,z.jsx)(`b`,{children:J(D.gross)})]}),D.discount>0&&(0,z.jsxs)(`div`,{className:`ag-totrow disc`,children:[(0,z.jsxs)(`span`,{children:[`הנחה `,D.discountPct,`%`]}),(0,z.jsxs)(`b`,{children:[`−`,J(D.discount)]})]}),(0,z.jsxs)(`div`,{className:`ag-totrow`,children:[(0,z.jsx)(`span`,{children:`סכום ביניים`}),(0,z.jsx)(`b`,{children:J(D.subtotal)})]}),(0,z.jsxs)(`div`,{className:`ag-totrow`,children:[(0,z.jsx)(`span`,{children:`מע"מ 18%`}),(0,z.jsx)(`b`,{children:J(D.vat)})]}),(0,z.jsxs)(`div`,{className:`ag-totrow grand`,children:[(0,z.jsx)(`span`,{children:`סה"כ`}),(0,z.jsx)(`b`,{children:J(D.total)})]})]}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`סטטוס`}),(0,z.jsx)(`div`,{className:`ag-chips sm nowrap`,children:je.map(e=>(0,z.jsx)(`button`,{className:_===e?`on`:``,style:{"--sc":H[e]},onClick:()=>v(e),children:e},e))}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`הערה להצעה (אופציונלי)`}),(0,z.jsx)(`textarea`,{className:`ag-textarea`,value:h,onChange:e=>g(e.target.value),rows:2,placeholder:`תנאים, תוקף הצעה…`,dir:`rtl`})]}),(0,z.jsxs)(`div`,{className:`ag-sheet-foot`,children:[(0,z.jsxs)(`button`,{className:`ag-btn ghost`,onClick:()=>{if(!o.trim()){a(`הזן שם לקוח/עסק`);return}w(!0)},children:[(0,z.jsx)(d,{size:15}),` מעוצבת`]}),(0,z.jsx)(`button`,{className:`ag-btn`,onClick:()=>{if(!o.trim()){a(`הזן שם לקוח/עסק`);return}i(j())},children:`שמור`}),(0,z.jsxs)(`button`,{className:`ag-btn wa`,onClick:()=>{if(!c.trim()){a(`הזן טלפון לשליחה`);return}let e=j();i(e),window.open(Z(c,St(e)),`_blank`)},children:[(0,z.jsx)(P,{size:15}),` וואטסאפ`]})]})]}),C&&(0,z.jsx)(wt,{deal:j(),onClose:()=>w(!1),showToast:a})]})}function wt({deal:e,onClose:t,showToast:n}){let r=Ie,i=(0,F.useMemo)(()=>ze(),[]),a=Y(),o=(0,F.useMemo)(()=>{let e=new Date;return e.setDate(e.getDate()+7),e.toISOString().slice(0,10)},[]),s=(e.items||[]).filter(e=>(e.desc||``).trim()||e.price).map(e=>({name:e.desc,qty:Number(e.qty)||1,price:Number(e.price)||0})),c=Le.concat(e.note?[e.note]:[]),l=Re,f=()=>{let t=`*הצעת מחיר מספר ${i}* — ${r.name}\nלכבוד: ${e.name||``}\nתאריך: ${X(a)}\nבתוקף עד: ${X(o)}\n\n`;return s.forEach(e=>{t+=`• ${e.name}${e.qty>1?` ×`+e.qty:``} — ${J(e.price*e.qty)}\n`}),t+=`\nסה"כ לפני מע"מ: ${J(e.subtotal)}\n*סה"כ כולל 18% מע"מ: ${J(e.total)}*\n\n${l}\n\n${r.name} · ${r.address} · נייד ${r.phone}`,t};return(0,z.jsx)(`div`,{className:`ag-modal`,onClick:e=>{e.target===e.currentTarget&&t()},children:(0,z.jsxs)(`div`,{className:`ag-sheet`,children:[(0,z.jsxs)(`div`,{className:`ag-sheet-head ag-quote-noprint`,children:[(0,z.jsx)(`b`,{children:`הצעת מחיר · Heavy Guard`}),(0,z.jsx)(`button`,{onClick:t,children:(0,z.jsx)(N,{size:20})})]}),(0,z.jsx)(`div`,{className:`ag-sheet-body`,children:(0,z.jsxs)(`div`,{className:`hg2-quotedoc`,id:`quotedoc`,children:[(0,z.jsxs)(`div`,{className:`hg2-qd-band`,children:[(0,z.jsxs)(`div`,{className:`hg2-qd-brand`,children:[(0,z.jsx)(`img`,{src:u,alt:``,className:`hg2-qd-logo`}),(0,z.jsx)(`div`,{className:`hg2-qd-name`,children:r.brand}),(0,z.jsxs)(`div`,{className:`hg2-qd-co`,children:[`עוסק מורשה `,r.taxId,(0,z.jsx)(`br`,{}),`נייד: `,r.phone,(0,z.jsx)(`br`,{}),r.address]})]}),(0,z.jsxs)(`div`,{className:`hg2-qd-titlebox`,children:[(0,z.jsx)(`div`,{className:`hg2-qd-title`,children:`הצעת מחיר`}),(0,z.jsxs)(`div`,{className:`hg2-qd-num`,children:[`הצעת מחיר מספר `,i]}),(0,z.jsx)(`div`,{className:`hg2-qd-meta`,children:(0,z.jsxs)(`b`,{children:[`לכבוד: `,e.name||`—`]})}),(0,z.jsxs)(`div`,{className:`hg2-qd-meta`,children:[`תאריך: `,X(a)]}),(0,z.jsxs)(`div`,{className:`hg2-qd-meta`,children:[`בתוקף עד: `,X(o)]})]})]}),(0,z.jsxs)(`table`,{className:`hg2-qd-table`,children:[(0,z.jsx)(`thead`,{children:(0,z.jsxs)(`tr`,{children:[(0,z.jsx)(`th`,{children:`תיאור הפריט`}),(0,z.jsx)(`th`,{children:`מחיר ליחידה`}),(0,z.jsx)(`th`,{children:`כמות`}),(0,z.jsx)(`th`,{children:`סה"כ`})]})}),(0,z.jsx)(`tbody`,{children:s.map((e,t)=>(0,z.jsxs)(`tr`,{children:[(0,z.jsx)(`td`,{children:e.name}),(0,z.jsx)(`td`,{children:J(e.price)}),(0,z.jsx)(`td`,{children:e.qty}),(0,z.jsx)(`td`,{children:J(e.price*e.qty)})]},t))})]}),(0,z.jsxs)(`div`,{className:`hg2-qd-sums`,children:[(0,z.jsxs)(`div`,{children:[(0,z.jsx)(`span`,{children:`סה"כ לפני מע"מ`}),(0,z.jsx)(`b`,{children:J(e.subtotal)})]}),(0,z.jsxs)(`div`,{className:`tot`,children:[(0,z.jsxs)(`span`,{children:[`סה"כ כולל `,18,`% מע"מ`]}),(0,z.jsx)(`b`,{children:J(e.total)})]})]}),(0,z.jsx)(`div`,{className:`hg2-qd-sec`,children:`הערות:`}),(0,z.jsx)(`ul`,{className:`hg2-qd-list`,children:c.map((e,t)=>(0,z.jsx)(`li`,{children:e},t))}),(0,z.jsx)(`div`,{className:`hg2-qd-sec`,children:`דרכי תשלום:`}),(0,z.jsx)(`div`,{className:`hg2-qd-pay`,children:l}),(0,z.jsx)(`div`,{className:`hg2-qd-foot`,children:`כאן לשירותכם וזמינים לשאלות ובירורים.`}),(0,z.jsx)(`div`,{className:`hg2-qd-bottomband`})]})}),(0,z.jsxs)(`div`,{className:`ag-sheet-foot ag-quote-noprint`,children:[(0,z.jsxs)(`button`,{className:`ag-btn ghost`,onClick:async()=>{n(await We(f())?`ההצעה הועתקה`:`העתקה נכשלה`)},children:[(0,z.jsx)(D,{size:15}),` העתק`]}),(0,z.jsxs)(`button`,{className:`ag-btn`,onClick:()=>window.print(),children:[(0,z.jsx)(d,{size:15}),` הדפס / PDF`]}),e.phone&&(0,z.jsxs)(`a`,{className:`ag-btn wa`,href:Z(e.phone,f()),target:`_blank`,rel:`noreferrer`,children:[(0,z.jsx)(P,{size:15}),` וואטסאפ`]})]})]})})}function Tt({custs:e,onSave:t,onRemove:n,onMerge:r,showToast:i}){let[o,s]=(0,F.useState)(!1),[c,l]=(0,F.useState)(null),[u,d]=(0,F.useState)(``),[f,m]=(0,F.useState)(``),h=(0,F.useMemo)(()=>e.length-Fe(e).length,[e]),g=()=>{let e=r();i(e>0?`✓ אוחדו ${e} כפילויות לקוחות`:`לא נמצאו כפילויות`)},_=(0,F.useMemo)(()=>{let t=e;return u&&(t=t.filter(e=>(e.name||``).toLowerCase().includes(u.toLowerCase())||(e.phone||``).includes(u)||(e.city||``).includes(u))),f&&(t=t.filter(e=>(e.region||``)===f)),t},[e,u,f]),v=(0,F.useMemo)(()=>{let e={};return _.forEach(t=>{let n=t.region||`כללי`;e[n]||(e[n]=[]),e[n].push(t)}),e},[_]),y=V.filter(t=>e.some(e=>e.region===t)),b=[...V,`כללי`].filter(e=>v[e]);return(0,z.jsxs)(`div`,{className:`ag-flow`,children:[(0,z.jsx)(`header`,{className:`ag-head sm`,children:(0,z.jsxs)(`div`,{children:[(0,z.jsx)(`div`,{className:`ag-title`,children:`לקוחות`}),(0,z.jsxs)(`div`,{className:`ag-sub`,children:[e.length,` לקוחות`,y.length>0?` · ${y.length} אזורים`:``]})]})}),(0,z.jsxs)(`div`,{className:`ag-cust-ctas`,children:[(0,z.jsxs)(`button`,{className:`ag-cta`,onClick:()=>{l(null),s(!0)},children:[(0,z.jsx)(M,{size:18}),` לקוח חדש`]}),h>0&&(0,z.jsxs)(`button`,{className:`ag-cta ghost warn`,onClick:g,children:[(0,z.jsx)(se,{size:16}),` מזג `,h,` כפילויות`]})]}),(0,z.jsxs)(`div`,{className:`ag-searchbox`,children:[(0,z.jsx)(j,{size:15}),(0,z.jsx)(`input`,{value:u,onChange:e=>d(e.target.value),placeholder:`חיפוש לקוח…`,dir:`rtl`}),u&&(0,z.jsx)(`button`,{onClick:()=>d(``),children:(0,z.jsx)(N,{size:14})})]}),y.length>0&&(0,z.jsxs)(`div`,{className:`ag-chips sm`,children:[(0,z.jsx)(`button`,{className:f?``:`on`,onClick:()=>m(``),children:`הכל`}),y.map(t=>(0,z.jsxs)(`button`,{className:f===t?`on`:``,onClick:()=>m(t),children:[t,` `,(0,z.jsxs)(`span`,{className:`cust-chip-cnt`,children:[`(`,e.filter(e=>e.region===t).length,`)`]})]},t))]}),_.length===0&&(0,z.jsxs)(`div`,{className:`ag-empty`,children:[(0,z.jsx)(pe,{size:32}),(0,z.jsx)(`div`,{children:`אין עדיין לקוחות`}),(0,z.jsx)(`p`,{children:`לקוחות נוצרים אוטומטית כשסוגרים עסקה, או הוסף ידנית`})]}),b.map(e=>(0,z.jsxs)(`div`,{className:`cust-region-group`,children:[(0,z.jsxs)(`div`,{className:`cust-region-hdr`,children:[(0,z.jsx)(O,{size:13}),(0,z.jsx)(`span`,{children:e}),(0,z.jsx)(`span`,{className:`cust-region-cnt`,children:v[e].length})]}),v[e].map(e=>(0,z.jsxs)(`div`,{className:`ag-card cust compact`,children:[(0,z.jsxs)(`div`,{className:`ag-cust-mid`,children:[(0,z.jsx)(`b`,{children:e.name}),(0,z.jsxs)(`span`,{dir:`ltr`,children:[e.phone||`—`,e.city?` · `+e.city:``]}),e.notes&&(0,z.jsx)(`span`,{className:`ag-cust-note`,children:e.notes})]}),(0,z.jsxs)(`div`,{className:`ag-cust-acts`,children:[e.phone&&(0,z.jsx)(`button`,{className:`ag-wa me`,title:`העתק ל-Me`,onClick:()=>Ge(e.phone,i),children:(0,z.jsx)(D,{size:15})}),e.phone&&(0,z.jsx)(`a`,{className:`ag-wa tel`,href:Ve(e.phone),children:(0,z.jsx)(k,{size:15})}),(0,z.jsx)(`button`,{className:`ag-icbtn`,onClick:()=>{l(e),s(!0)},children:(0,z.jsx)(p,{size:14})}),(0,z.jsx)(`button`,{className:`ag-icbtn d`,onClick:()=>{n(e.id),i(`הלקוח נמחק`)},children:(0,z.jsx)(a,{size:14})})]})]},e.id))]},e)),o&&(0,z.jsx)(Et,{initial:c,onClose:()=>s(!1),onSave:e=>{t(e),s(!1),i(c?`הלקוח עודכן`:`הלקוח נוסף`)}})]})}function Et({initial:e,onClose:t,onSave:n}){let[r,i]=(0,F.useState)(e||{name:``,phone:``,email:``,city:``,region:``,notes:``}),a=(e,t)=>i(n=>({...n,[e]:t}));return(0,z.jsx)(`div`,{className:`ag-modal`,onClick:e=>{e.target===e.currentTarget&&t()},children:(0,z.jsxs)(`div`,{className:`ag-sheet sm`,children:[(0,z.jsxs)(`div`,{className:`ag-sheet-head`,children:[(0,z.jsx)(`b`,{children:e?`עריכת לקוח`:`לקוח חדש`}),(0,z.jsx)(`button`,{onClick:t,children:(0,z.jsx)(N,{size:20})})]}),(0,z.jsxs)(`div`,{className:`ag-sheet-body`,children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`שם`}),(0,z.jsx)(`input`,{className:`ag-input`,value:r.name,onChange:e=>a(`name`,e.target.value),dir:`rtl`}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`טלפון`}),(0,z.jsx)(`input`,{className:`ag-input`,value:r.phone,onChange:e=>a(`phone`,e.target.value),dir:`ltr`}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`אימייל`}),(0,z.jsx)(`input`,{className:`ag-input`,value:r.email,onChange:e=>a(`email`,e.target.value),dir:`ltr`}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`עיר`}),(0,z.jsx)(`input`,{className:`ag-input`,value:r.city,onChange:e=>a(`city`,e.target.value),dir:`rtl`}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`אזור`}),(0,z.jsxs)(`select`,{className:`ag-input`,value:r.region||``,onChange:e=>a(`region`,e.target.value),dir:`rtl`,children:[(0,z.jsx)(`option`,{value:``,children:`— בחר אזור —`}),V.map(e=>(0,z.jsx)(`option`,{value:e,children:e},e))]}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`הערות`}),(0,z.jsx)(`textarea`,{className:`ag-textarea`,value:r.notes,onChange:e=>a(`notes`,e.target.value),rows:2,dir:`rtl`})]}),(0,z.jsxs)(`div`,{className:`ag-sheet-foot`,children:[(0,z.jsx)(`button`,{className:`ag-btn ghost`,onClick:t,children:`ביטול`}),(0,z.jsx)(`button`,{className:`ag-btn`,onClick:()=>r.name.trim()&&n(r),children:`שמור`})]})]})})}var Dt=e=>{if(!e)return 9999;let t=(Date.now()-new Date(e).getTime())/864e5;return isNaN(t)?9999:Math.floor(t)},Ot=[`💪 איתי, אתה עושה עבודה מדהימה — כל שיחה מקרבת אותך לסגירה!`,`🎯 כל 'לא' שאתה מקבל הוא צעד אחד לקראת ה'כן' הבא. תמשיך!`,`🏆 אנשים שמתמידים סוגרים עסקאות — ואתה מתמיד, איתי.`,`🚀 המספרים שלך מדברים — המשך ככה ואתה סוגר חודש מצוין!`,`📈 כל מעקב שאתה עושה הוא השקעה שחוזרת אליך. תמשיך!`,`⭐ איתי, שתדע שאתה בקצב מנצח. המשך לדחוף!`,`🔥 מכירות זה ספורט — וה-training שלך עובד. קדימה!`,`✨ כל ליד הוא הזדמנות. עם הגישה שלך, רובם הופכים ללקוחות.`],kt=()=>Ot[Math.floor(Math.random()*Ot.length)];function At(e,t){let{leads:n,deals:r,custs:i,go:a,onNewDeal:o}=t,s=(e||``).trim().toLowerCase(),c=r.filter(e=>e.status===`פתוח`),l=c.reduce((e,t)=>e+(t.total||0),0),u=r.filter(e=>e.status===`נסגר`&&(e.wonAt||``).startsWith(Be())),d=n.filter(e=>[`פנייה ראשונה`,`בתהליך`].includes(e.crmStatus)&&Dt((e.outreach||[])[0]?.date)>=3),f=n.filter(e=>e.crmStatus===`הצעה נשלחה`),p=n.filter(e=>[`בתהליך`,`הצעה נשלחה`].includes(e.crmStatus)),m=(...e)=>e.some(e=>s.includes(e)),h=()=>Math.random()<.28?`

`+kt():``;return!s||m(`עזרה`,`פקודות`,`מה אתה`,`?`)?{text:`איתי, אני העוזר האישי שלך 🤝 נסה: "מעקבים להיום", "הצעות שנשלחו", "לידים חמים", "עסקאות פתוחות", "סיכום", "פתח מסלול", "הצעת מחיר חדשה".`}:m(`נסח`,`הודעה`,`וואטסאפ`,`טקסט`,`מה לכתוב`)?{text:`איתי, הנה הצעה להודעת מעקב:\n"שלום, כאן איתי מ-${B} 🛡️ רציתי לבדוק אם הספקתם לעבור על ההצעה למערכות המיגון לרכב. אשמח לענות על כל שאלה ולהתאים לכם פתרון. מתי נוח לדבר?"\n(להצעות חכמות ומותאמות — הוסף מפתח Groq חינמי בהגדרות.)`}:m(`מעקב`,`לבדוק`,`היום`,`תזכור`)?{text:(d.length?`איתי, יש ${d.length} לידים שמחכים למעקב (3+ ימים ללא פנייה). הבולטים: ${d.slice(0,3).map(e=>e.n).join(` · `)}.`:`אין מעקבים דחופים כרגע — כל הכבוד, איתי! 👏`)+h(),action:{label:`פתח לידים`,run:()=>a(`leads`)}}:m(`נשלח`,`הצעות`)||m(`הצעה`)&&!m(`חדש`,`צור`)?{text:(f.length?`איתי, ${f.length} הצעות מחיר ממתינות לתשובה. שווה לחזור אליהן: ${f.slice(0,3).map(e=>e.n).join(` · `)}.`:`אין כרגע הצעות שנשלחו וממתינות.`)+h(),action:{label:`פתח לידים`,run:()=>a(`leads`)}}:m(`חם`,`לוהט`)?{text:(p.length?`איתי, יש לך ${p.length} לידים חמים (בתהליך/הצעה נשלחה). תעדף אותם: ${p.slice(0,4).map(e=>e.n).join(` · `)}.`:`אין כרגע לידים חמים.`)+h(),action:{label:`פתח לידים`,run:()=>a(`leads`)}}:m(`עסקא`,`פתוח`,`צבר`)?{text:`איתי, ${c.length} עסקאות פתוחות בשווי ${J(l)}. נסגרו החודש: ${u.length}.`+h(),action:{label:`פתח עסקאות`,run:()=>a(`deals`)}}:m(`לקוח`)?{text:`איתי, יש לך ${i.length} לקוחות פעילים.`+h(),action:{label:`פתח לקוחות`,run:()=>a(`custs`)}}:m(`מסלול`,`מפה`,`נסיע`,`פגיש`)?{text:`פותח את מפת העסקים — בחר עיר ואבנה לך מסלול פגישות יעיל, איתי. 🗺️`,action:{label:`פתח מפה`,run:()=>a(`map`)}}:m(`הצעת מחיר`,`חדש`,`צור`,`בנה הצעה`)?(o&&o(),{text:`פתחתי עסקה חדשה, איתי — בחר פריטים מהמחירון והוסף הנחה אם צריך. 📝`}):m(`סיכום`,`דוח`,`מצב`,`בוקר טוב`,`מה המצב`)?{text:`איתי, הנה הסיכום שלך: ${n.length.toLocaleString()} לידים · ${d.length} מעקבים להיום · ${f.length} הצעות ממתינות · ${c.length} עסקאות פתוחות (${J(l)}) · ${i.length} לקוחות.`+h()}:{text:`לא הבנתי את הפקודה. כתוב "עזרה" כדי לראות מה אני יודע לעשות. (טיפ: עם מפתח Groq חינמי אני הופך ל-AI מלא.)`}}var jt=[`מעקבים להיום`,`הצעות שנשלחו`,`לידים חמים`,`עסקאות פתוחות`,`סיכום`,`פתח מסלול`],Mt=()=>{try{return localStorage.getItem(`alpha_groq`)||``}catch{return``}},Nt=()=>!!Mt();function Pt({leads:e,deals:t,custs:n}){let r=t.filter(e=>e.status===`פתוח`),i=r.reduce((e,t)=>e+(t.total||0),0),a=t.filter(e=>e.status===`נסגר`&&(e.wonAt||``).startsWith(Be())),o=e.filter(e=>[`פנייה ראשונה`,`בתהליך`].includes(e.crmStatus)&&Dt((e.outreach||[])[0]?.date)>=3).length,s=e.filter(e=>e.crmStatus===`הצעה נשלחה`).length,c=e.filter(e=>[`בתהליך`,`הצעה נשלחה`].includes(e.crmStatus)).length,l=ut().map(e=>`${e.name} ₪${e.price}`).join(`, `);return`אתה העוזר האישי החכם של איתי — איש מכירות בכיר ב-${B} (מערכות מיגון, איתור ובטיחות לרכבים כבדים: איתוראן, מצלמות רוורס, מסכים חכמים, פוינטר רב-קודן וכו'). פנה אליו תמיד בשם "איתי". דבר עברית טבעית, קצרה וממוקדת מכירות, בטון מקצועי, אנרגטי וחם. אתה עוזר ב: ניסוח הודעות מעקב/וואטסאפ ללקוח, טיפול בהתנגדויות מחיר, ניסוח הצעות ותמחור, תעדוף לידים, בניית תוכנית יום, וטיפים לסגירת עסקאות. כשרלוונטי תן צעד פעולה קונקרטי אחד. פעם בכמה תשובות (לא בכל אחת), סיים במשפט קצר ומחזק למוטיבציה כדי לעודד את איתי — כמו מאמן מכירות שמאמין בו.
היום ${Y()}. נתוני ה-CRM החיים של איתי: ${e.length.toLocaleString()} לידים, ${o} מעקבים להיום, ${s} הצעות שנשלחו וממתינות, ${c} לידים חמים, ${r.length} עסקאות פתוחות בשווי ${J(i)}, נסגרו החודש ${a.length}, ${n.length} לקוחות.
מחירון Heavy Guard: ${l}.
אם המשתמש מבקש לנווט במערכת, הוסף בסוף התשובה תג מתאים (ואל תזכיר אותו בטקסט): [[GO:home]] לבקרה, [[GO:leads]] ללידים, [[GO:deals]] לעסקאות, [[GO:custs]] ללקוחות, [[GO:map]] למפה/מסלולים, [[NEWDEAL]] לפתיחת הצעת מחיר חדשה.`}var Ft=/\[\[(GO:(?:home|leads|deals|custs|map)|NEWDEAL)\]\]/g;function It(e,{go:t,onNewDeal:n}){let r;for(Ft.lastIndex=0;r=Ft.exec(e);){let e=r[1];e===`NEWDEAL`?n&&n():t(e.split(`:`)[1])}return e.replace(Ft,``).trim()}var Lt=[`llama-3.3-70b-versatile`,`llama-3.1-8b-instant`,`gemma2-9b-it`,`llama3-70b-8192`];async function Rt(e,t,n){let r=Mt();if(!r)throw Error(`NO_KEY`);let i=[{role:`system`,content:e},...t.slice(-6),{role:`user`,content:n}],a=0;for(let e of Lt){let t=await fetch(`https://api.groq.com/openai/v1/chat/completions`,{method:`POST`,headers:{"Content-Type":`application/json`,Authorization:`Bearer ${r}`},body:JSON.stringify({model:e,messages:i,temperature:.7,max_tokens:700})});if(t.ok)return(await t.json()).choices?.[0]?.message?.content?.trim()||``;if(a=t.status,t.status===401||t.status===403)break}throw Error(`Groq `+a)}function zt({leads:e,deals:t,custs:n,go:r,onNewDeal:i,showToast:a}){let o=Nt(),[s,c]=(0,F.useState)([{from:`bot`,text:o?`שלום איתי! 👋 אני העוזר החכם שלך. אני מכיר את נתוני ה-CRM שלך בזמן אמת — בקש ממני לנסח הודעת מעקב, לטפל בהתנגדות מחיר, לתעדף לידים, לבנות תוכנית יום או כל שאלת מכירות. `+kt():`שלום איתי! 👋 אני העוזר האישי שלך. כרגע אני במצב פקודות מהירות — כדי לפתוח AI חכם וחינמי הוסף מפתח Groq בהגדרות של Alpha. כתוב "עזרה" לפקודות. `+kt()}]),[l,u]=(0,F.useState)(``),[d,f]=(0,F.useState)(!1),p=F.useRef([]),m=e=>c(t=>[...t.slice(-8),e]),h=async a=>{let s=(a??l).trim();if(!(!s||d)){if(m({from:`me`,text:s}),u(``),!o){let a=At(s,{leads:e,deals:t,custs:n,go:r,onNewDeal:i});m({from:`bot`,text:a.text,action:a.action});return}f(!0);try{let a=await Rt(Pt({leads:e,deals:t,custs:n}),p.current,s),o=It(a,{go:r,onNewDeal:i})||`✔`;p.current=[...p.current.slice(-6),{role:`user`,content:s},{role:`assistant`,content:a}],m({from:`bot`,text:o})}catch(a){let o=At(s,{leads:e,deals:t,custs:n,go:r,onNewDeal:i});m({from:`bot`,text:(String(a.message).includes(`Groq`)?`ה-AI עמוס כרגע, עניתי במצב מהיר: `:``)+o.text,action:o.action})}finally{f(!1)}}};return(0,z.jsxs)(`div`,{className:`ag-assist`,children:[(0,z.jsxs)(`div`,{className:`ag-assist-h`,children:[(0,z.jsx)(`span`,{className:`ag-assist-orb`}),` `,(0,z.jsx)(`b`,{children:`עוזר אישי`}),(0,z.jsx)(`i`,{children:o?`AI חינם · Groq`:`פקודות מהירות`})]}),(0,z.jsxs)(`div`,{className:`ag-assist-log`,children:[s.map((e,t)=>(0,z.jsxs)(`div`,{className:`ag-msg `+e.from,children:[(0,z.jsx)(`span`,{children:e.text}),e.action&&(0,z.jsxs)(`button`,{className:`ag-msg-act`,onClick:()=>e.action.run(),children:[e.action.label,` ←`]}),e.from===`bot`&&t>0&&(0,z.jsx)(`button`,{className:`ag-msg-copy`,title:`העתק`,onClick:async()=>{let t=await We(e.text);a&&a(t?`הועתק ✓`:`העתקה נכשלה`)},children:(0,z.jsx)(D,{size:12})})]},t)),d&&(0,z.jsx)(`div`,{className:`ag-msg bot ag-typing`,children:(0,z.jsx)(`span`,{children:`חושב…`})})]}),(0,z.jsx)(`div`,{className:`ag-assist-quick`,children:jt.map(e=>(0,z.jsx)(`button`,{disabled:d,onClick:()=>h(e),children:e},e))}),(0,z.jsxs)(`div`,{className:`ag-assist-in`,children:[(0,z.jsx)(`input`,{value:l,onChange:e=>u(e.target.value),onKeyDown:e=>e.key===`Enter`&&h(),placeholder:o?`שאל אותי כל דבר על מכירות…`:`כתוב פקודה…`,dir:`rtl`,disabled:d}),(0,z.jsx)(`button`,{onClick:h,disabled:d,children:(0,z.jsx)(P,{size:16})})]})]})}function Bt({leads:e,custs:t,deals:n,showToast:r}){let i=F.useRef(null),a=F.useRef(null),[o,s]=(0,F.useState)(`all`),[c,l]=(0,F.useState)(``),[u,d]=(0,F.useState)(!1),[f,p]=(0,F.useState)(!1),[m,h]=(0,F.useState)(``),[g,_]=(0,F.useState)(0),[v,y]=(0,F.useState)(!1),[b,x]=(0,F.useState)({done:0,total:0}),S=(0,F.useMemo)(()=>new Set(n.map(e=>e.leadId)),[n]),C=e=>c&&e.geo!==c?!1:o===`active`?[`פנייה ראשונה`,`בתהליך`,`הצעה נשלחה`,`לקוח`].includes(e.crmStatus)||S.has(e.id):!0,w=(0,F.useMemo)(()=>e.filter(e=>C(e)).filter(e=>nt(e)).map(e=>({id:e.id,n:e.n,city:e.city,geo:e.geo,addr:e.addr,status:e.crmStatus,phone:(e.phones||[])[0]||``,phones:e.phones||[],email:e.e||``,web:e.w||``,sector:e.sector||``,emp:e.emp||``,rev:e.rev||``,ll:nt(e)})),[e,o,c,S,g]);(0,F.useEffect)(()=>{let t=!0,n=e.filter(e=>C(e)&&(e.addr||``).trim()&&!$e(e));if(!n.length){y(!1),x({done:0,total:0});return}return y(!0),x({done:0,total:n.length}),(async()=>{let e=0,r=0;for(let i of n){if(!t)return;let a=await tt(i.addr,i.city);if(!t)return;r++,x({done:r,total:n.length}),a&&(e++,e%4==0&&_(e=>e+1))}t&&(_(e=>e+1),y(!1))})(),()=>{t=!1}},[o,c,e,S]);let T=(0,F.useMemo)(()=>{let e={};return w.forEach(t=>{t.city&&(e[t.city]=(e[t.city]||0)+1)}),Object.entries(e).sort((e,t)=>t[1]-e[1]).slice(0,40)},[w]),E=(0,F.useMemo)(()=>m?w.filter(e=>e.city===m):[],[w,m]),D=()=>{let e=E.slice(0,10);if(!e.length)return;let t=e=>encodeURIComponent([e.addr,e.city].filter(Boolean).join(` `)||e.n),n=t(e[e.length-1]),r=e.slice(0,-1).map(t).join(`%7C`),i=`https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${n}${r?`&waypoints=${r}`:``}`;window.open(i,`_blank`)};(0,F.useEffect)(()=>{let e=!0;return st().then(t=>{!e||i.current||(i.current=t.map(`ag-map`,{zoomControl:!0,attributionControl:!1}).setView([31.6,34.9],7.4),p(!0))}).catch(()=>r(`טעינת המפה נכשלה — בדוק חיבור לאינטרנט`)),()=>{e=!1,i.current&&=(i.current.remove(),null)}},[]);let k=F.useRef(null);return(0,F.useEffect)(()=>{let e=window.L,t=i.current;!e||!t||(k.current&&=(t.removeLayer(k.current),null),k.current=u?e.tileLayer(`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`,{maxZoom:19}):e.tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`,{maxZoom:20}),k.current.addTo(t))},[u,f]),(0,F.useEffect)(()=>{let e=window.L,n=i.current;if(!e||!n)return;a.current&&n.removeLayer(a.current);let o=e.markerClusterGroup?e.markerClusterGroup({chunkedLoading:!0,maxClusterRadius:50,spiderfyOnMaxZoom:!0}):e.layerGroup();window.__agMe=e=>Ge(e,r);let s=e=>String(e||``).replace(/'/g,`\\'`).replace(/</g,`&lt;`),c=e=>e?/^https?:\/\//.test(e)?e:`https://`+e:``;w.forEach(t=>{let n=Oe[t.status]||`#C2912E`,r=e.divIcon({className:`ag-pin`,html:`<span style="background:${n}"></span>`,iconSize:[16,16]}),i=e.marker(t.ll,{icon:r}),a=`tel:${(t.phone||``).replace(/\s/g,``)}`,l=c(t.web),u=$e(t),d=[];t.sector&&d.push(`<div style="font-size:11.5px;color:#5a4d28;margin-top:3px">🏷️ ${s(t.sector)}</div>`),(t.addr||t.city)&&d.push(`<div style="font-size:11.5px;color:#5a4d28">📍 ${s([t.addr,t.city].filter(Boolean).join(`, `))}${t.addr?u?` <span style="color:#2E9E5B;font-weight:700">· מיקום מדויק</span>`:` <span style="color:#B4841F;font-weight:700">· ממתין לדיוק כתובת (כרגע מרכז העיר)</span>`:``}</div>`),t.emp&&d.push(`<div style="font-size:11.5px;color:#5a4d28">👥 ${s(t.emp)} מועסקים</div>`),t.rev&&d.push(`<div style="font-size:11.5px;color:#5a4d28">💰 מחזור: ₪${Number(t.rev).toLocaleString()} אלף</div>`),t.phones.length>1&&d.push(`<div dir="ltr" style="font-size:11px;color:#917E50">${s(t.phones.slice(1,4).join(` · `))}</div>`);let f=`<div style="font-family:Heebo,Arial;direction:rtl;min-width:210px;max-width:250px">
        <b style="font-size:14px;color:#2C2510">${s(t.n)}</b>
        <span style="display:inline-block;background:${n}22;color:${n};border:1px solid ${n}66;border-radius:20px;padding:1px 8px;font-size:10px;font-weight:700;margin-right:5px">${s(t.status)}</span>
        ${d.join(``)}
        ${t.phone?`<div dir="ltr" style="margin:6px 0 2px;font-weight:800;font-size:13px;color:#2C2510">${s(t.phone)}</div>`:``}
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">
          ${l?`<a href="${s(l)}" target="_blank" rel="noreferrer" style="background:#C2912E;color:#241A06;border-radius:7px;padding:5px 10px;text-decoration:none;font-size:11px;font-weight:800">🌐 אתר</a>`:``}
          ${t.phone?`<a href="${a}" style="background:#1B7E9C;color:#fff;border-radius:7px;padding:5px 10px;text-decoration:none;font-size:11px;font-weight:700">חייג</a>`:``}
          <a href="${rt(t)}" target="_blank" style="background:#33CCFF;color:#062a36;border-radius:7px;padding:5px 10px;text-decoration:none;font-size:11px;font-weight:700">Waze</a>
          ${t.email?`<a href="mailto:${s(t.email)}" style="background:#F5EDD9;color:#917E50;border:1px solid #E6D4A8;border-radius:7px;padding:5px 10px;text-decoration:none;font-size:11px;font-weight:700">מייל</a>`:``}
          ${t.phone?`<button onclick="window.__agMe('${s(t.phone)}')" style="background:#FBF3DF;color:#A2761F;border:1px solid #C2912E;border-radius:7px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer">Me · העתק</button>`:``}
        </div></div>`;i.bindPopup(f),o.addLayer(i)}),t.forEach(t=>{let n=Je(t.city);if(!n)return;let r=Ye(t.id||t.name||`c`,.004),i=[n[0]+r[0],n[1]+r[1]],a=e.divIcon({className:`ag-pin-cust`,html:`<span>★</span>`,iconSize:[22,22]}),c=e.marker(i,{icon:a,zIndexOffset:500}),l=`tel:${(t.phone||``).replace(/\s/g,``)}`,u=`<div style="font-family:Heebo,Arial;direction:rtl;min-width:180px;max-width:230px">
        <b style="font-size:14px;color:#2C2510">★ ${s(t.name)}</b>
        <span style="display:inline-block;background:#C2912E22;color:#C2912E;border:1px solid #C2912E66;border-radius:20px;padding:1px 8px;font-size:10px;font-weight:700;margin-right:5px">לקוח</span>
        ${t.city?`<div style="font-size:11.5px;color:#5a4d28;margin-top:3px">📍 ${s(t.city)}${t.region?` · `+s(t.region):``}</div>`:``}
        ${t.phone?`<div dir="ltr" style="margin:6px 0 2px;font-weight:800;font-size:13px;color:#2C2510">${s(t.phone)}</div>`:``}
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px">
          ${t.phone?`<a href="${l}" style="background:#1B7E9C;color:#fff;border-radius:7px;padding:5px 10px;text-decoration:none;font-size:11px;font-weight:700">חייג</a>`:``}
          ${t.phone?`<button onclick="window.__agMe('${s(t.phone)}')" style="background:#FBF3DF;color:#A2761F;border:1px solid #C2912E;border-radius:7px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer">Me · העתק</button>`:``}
        </div></div>`;c.bindPopup(u),o.addLayer(c)}),o.addTo(n),a.current=o},[w,t,f]),(0,z.jsxs)(`div`,{className:`ag-flow map`,children:[(0,z.jsxs)(`header`,{className:`ag-head sm`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`div`,{className:`ag-title`,children:`מפת העסקים`}),(0,z.jsxs)(`div`,{className:`ag-sub`,children:[w.length.toLocaleString(),` עסקים`,v?` · מדייק כתובות מדויקות… (${b.done.toLocaleString()}/${b.total.toLocaleString()})`:` · מיקום מדויק לפי כתובת`]})]}),(0,z.jsx)(`button`,{className:`ag-mini`+(u?` on`:``),onClick:()=>d(e=>!e),children:u?`🛰 לוויין`:`🗺 מפה`})]}),(0,z.jsxs)(`div`,{className:`ag-chips sm`,children:[(0,z.jsx)(`button`,{className:o===`active`?`on`:``,onClick:()=>s(`active`),children:`פעילים`}),(0,z.jsx)(`button`,{className:o===`all`?`on`:``,onClick:()=>s(`all`),children:`כל המאגר`}),(0,z.jsx)(`span`,{className:`ag-chip-sep`}),(0,z.jsx)(`button`,{className:c?``:`on`,onClick:()=>l(``),children:`כל הארץ`}),V.map(e=>(0,z.jsx)(`button`,{className:c===e?`on`:``,onClick:()=>l(e),children:e},e))]}),(0,z.jsx)(`div`,{id:`ag-map`,className:`ag-map`}),(0,z.jsxs)(`div`,{className:`ag-section`,children:[(0,z.jsx)(`div`,{className:`ag-section-ttl`,children:`🧭 תכנון מסלול פגישות`}),(0,z.jsxs)(`select`,{className:`ag-select`,value:m,onChange:e=>h(e.target.value),children:[(0,z.jsx)(`option`,{value:``,children:`בחר עיר לבניית מסלול…`}),T.map(([e,t])=>(0,z.jsxs)(`option`,{value:e,children:[e,` (`,t,`)`]},e))]}),m&&(0,z.jsxs)(z.Fragment,{children:[(0,z.jsxs)(`div`,{className:`ag-route-list`,children:[E.slice(0,10).map((e,t)=>(0,z.jsxs)(`div`,{className:`ag-route-row`,children:[(0,z.jsx)(`span`,{className:`ag-route-n`,children:t+1}),(0,z.jsxs)(`div`,{className:`ag-route-mid`,children:[(0,z.jsx)(`b`,{children:e.n}),(0,z.jsx)(`span`,{children:[e.addr,e.city].filter(Boolean).join(`, `)})]}),(0,z.jsx)(`a`,{className:`ag-route-waze`,href:rt(e),target:`_blank`,rel:`noreferrer`,children:`Waze`})]},e.id)),E.length>10&&(0,z.jsxs)(`div`,{className:`ag-note-line`,children:[`מציג 10 תחנות ראשונות מתוך `,E.length]})]}),(0,z.jsxs)(`button`,{className:`ag-btn`,onClick:D,children:[(0,z.jsx)(O,{size:15}),` פתח מסלול ב-Google Maps`]})]})]})]})}var Vt=[{id:`2gb`,label:`שימוש בשרת + גלישה 2GB לחודש 39 ש"ח + מע"מ (מומלץ עד 2 משתמשים)`},{id:`4gb`,label:`שימוש בשרת + גלישה 4GB לחודש 49 ש"ח + מע"מ (מומלץ עד 4 משתמשים)`},{id:`10gb`,label:`שימוש בשרת + גלישה 10GB לחודש 59 ש"ח + מע"מ (מעל 5 משתמשים)`}],Ht=`itai:samsonix`;function Ut(e,t,n){let r=e=>`<span style="display:inline-block;width:14px;height:14px;border:1.5px solid #222;vertical-align:middle;text-align:center;line-height:12px;font-size:10px;flex-shrink:0">${e?`✓`:``}</span>`,i=t&&(t.num||``).replace(/\D/g,``).match(/.{1,4}/g)||[],a=e=>i[e]||``,o=t&&t.expiry||``,s=t&&t.cvv||``,[c=`___`,l=`___`,u=`2026`]=n.split(`/`);return`<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<title>Samsonix DVR · ${e.fullName||``}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;color:#111;font-size:12.5px;
       padding:20px 28px;max-width:780px;margin:0 auto;direction:rtl}
  /* logo */
  .logo-area{display:flex;align-items:flex-end;gap:5px}
  .logo-slash{font-size:32px;font-weight:900;font-style:italic;color:#111;line-height:1}
  .logo-word{font-size:21px;font-weight:900;letter-spacing:.5px;color:#111;line-height:1}
  .logo-sub{font-size:7.5px;letter-spacing:3px;color:#444;display:block;margin-top:2px}
  /* date sits below logo, left-aligned */
  .date-row{margin-top:4px;font-size:12px;direction:rtl}
  .date-row span{display:inline-block;border-bottom:1px solid #333;min-width:36px;text-align:center;margin:0 2px}
  /* centred underlined title */
  .form-title{text-align:center;font-size:15px;font-weight:700;text-decoration:underline;
               margin:12px 0 10px}
  /* regular paragraphs */
  .para{font-size:12.5px;line-height:1.85;margin-bottom:7px;direction:rtl}
  /* two-column block: installer box RIGHT, payment text LEFT */
  .two-col{display:flex;direction:rtl;gap:14px;margin:10px 0 8px;align-items:flex-start}
  .installer-col{flex:0 0 auto;min-width:150px;text-align:right}
  .installer-lbl{font-size:12px;text-decoration:underline;margin-bottom:4px}
  .installer-box{border:2px solid #2e7d32;width:150px;height:60px;
                 display:flex;align-items:center;justify-content:center;
                 font-weight:700;font-size:13px}
  .payment-col{flex:1;font-size:12.5px;line-height:1.85}
  /* checkboxes */
  .ck{display:flex;align-items:center;gap:7px;margin:5px 0;font-size:12.5px}
  /* warning */
  .warn{font-size:12px;margin:6px 0}
  /* customer fields */
  .fields{margin-top:10px}
  .fl{margin:7px 0;font-size:12.5px}
  .ul{display:inline-block;border-bottom:1px solid #333;min-width:230px}
  /* credit card */
  .cc-seg{display:inline-block;border-bottom:1px solid #333;min-width:54px;
          text-align:center;font-size:12.5px}
  /* bottom row */
  .bottom{display:flex;direction:rtl;gap:18px;margin-top:16px;align-items:flex-end}
  .sig-box{border:2px solid #2e7d32;width:155px;min-height:70px;flex-shrink:0;
           display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4px}
  .sig-box img{max-width:140px;max-height:58px}
  .sig-name{font-size:9.5px;color:#555;margin-top:3px}
  .contact-txt{font-size:13px;font-weight:700;line-height:1.9;text-align:center;flex:1}
  /* footer */
  .ft{margin-top:14px;border-top:1px solid #bbb;padding-top:7px;
      font-size:10px;text-align:center;color:#444;line-height:1.9;direction:ltr}
  @media print{@page{size:A4;margin:7mm}body{padding:0}}
</style></head><body>

<!-- ── HEADER: logo (left) ────────────────────────────────────── -->
<div style="display:flex;justify-content:space-between;align-items:flex-start">
  <div>
    <div class="logo-area">
      <span class="logo-slash">&#47;</span>
      <div>
        <span class="logo-word">samsonix</span>
        <span class="logo-sub">ENJOY YOUR DRIVE</span>
      </div>
    </div>
    <div class="date-row">
      <span>${c}</span> / <span>${l}</span> / <span style="min-width:52px">${u}</span>
      &nbsp;&nbsp;תאריך :
    </div>
  </div>
</div>

<!-- ── TITLE ──────────────────────────────────────────────────── -->
<div class="form-title">שימוש בשרת לצפייה ב DVR</div>

<!-- ── INTRO paragraphs ───────────────────────────────────────── -->
<p class="para">הננו שמחים שבחרתם והתקנת מערכת DVR עם מצלמות לצפייה מרחוק ובהקלטות שהוקלטו לזיכרון הפנימי.</p>
<p class="para">המערכת היא המתקדמת ביותר כוללת זיכרון פנימי ומאפשרת צפייה מרחוק ובהקלטות שהוקלטו לזיכרון הפנימי כאשר המערכת במצב online ובאזור קליטה סלולרי תקין.</p>

<!-- ── TWO-COLUMN: שם המתקין (right) | payment text (left) ───── -->
<div class="two-col">
  <div class="installer-col">
    <div class="installer-lbl">שם המתקין</div>
    <div class="installer-box">Heavy Guard</div>
  </div>
  <div class="payment-col">
    על מנת לצפות מרחוק דרך אפליקציה ו/או במחשב בבית נדרש תשלום חודשי לשרת - עגן .<br>
    למערכת מסופק כרטיס גלישה.* &nbsp;(אופציה ברכישת המערכת)<br>
    ניתן לבטל הוראה זו בהודעה בכתב של 7 ימים מראש.
  </div>
</div>

<!-- ── PLAN CHECKBOXES ────────────────────────────────────────── -->
<div style="margin:8px 0;font-size:12.5px">נא לסמן ב&nbsp;✓&nbsp; את התשלום המבוקש.</div>
<div class="ck">${r(e.plan===`2gb`)}&nbsp; שימוש בשרת + גלישה 2GB לחודש 39 ש"ח + מע"מ (מומלץ-עד 2 משתמשים ו/או עד 1T )</div>
<div class="ck">${r(e.plan===`4gb`)}&nbsp; שימוש בשרת + גלישה 4GB לחודש 49 ש"ח + מע"מ (מומלץ-עד 4 משתמשים ו/או עד 2T )</div>
<div class="ck">${r(e.plan===`10gb`)}&nbsp; שימוש בשרת + גלישה 10GB לחודש 59 ש"ח + מע"מ (מומלץ-מעל 5 משתמשים ו/או עד 4T )</div>

<div class="warn">***שימוש חורג מהחבילה החודשית <u>לא</u> מאפשרת צפייה מרחוק ו/או צפייה בהקלטות***</div>

<div class="ck">${r(e.audio===`none`)}&nbsp; <u>ללא הקלטת קול</u> – כל המצלמות ללא מיקרופון</div>
<div class="ck">${r(e.audio===`with`)}&nbsp; <u>עם הקלטת קול</u> – הוספת מיקרופון לחלל הפנימי של הרכב <b>בעלות נוספת</b></div>

<!-- ── CUSTOMER FIELDS ────────────────────────────────────────── -->
<div class="fields">
  <div class="fl">שם מלא של בעל הכרטיס:&nbsp;<span class="ul">${e.fullName||``}</span></div>
  <div class="fl">מס ת"ז של בעל הכרטיס:&nbsp;<span class="ul">${e.idNum||``}</span></div>

  <div class="fl" style="margin-top:10px">
    מס כרטיס אשראי:&nbsp;
    <span style="direction:ltr;display:inline-block;unicode-bidi:isolate">
      <span class="cc-seg">${a(0)}</span>&nbsp;-&nbsp;
      <span class="cc-seg">${a(1)}</span>&nbsp;-&nbsp;
      <span class="cc-seg">${a(2)}</span>&nbsp;-&nbsp;
      <span class="cc-seg">${a(3)}</span>
    </span>
  </div>
  <div class="fl">
    תוקף:&nbsp;
    <span style="direction:ltr;display:inline-block;unicode-bidi:isolate">
      <span class="cc-seg" style="min-width:44px">${o.split(`/`)[0]||``}</span>
      &nbsp;/&nbsp;
      <span class="cc-seg" style="min-width:44px">${o.split(`/`)[1]||``}</span>
    </span>
    &nbsp;&nbsp;&nbsp;&nbsp;
    3 הספרות בגב הכרטיס(CVV):&nbsp;<span class="cc-seg" style="min-width:44px">${s||``}</span>
  </div>

  <div class="fl" style="margin-top:8px">כתובת המייל:&nbsp;<span class="ul" style="direction:ltr">${e.email||``}</span></div>
  <div class="fl">
    מס טלפון איש קשר:&nbsp;
    <span style="display:inline-block;border-bottom:1px solid #333;min-width:140px;direction:ltr">${e.phone||``}</span>
    &nbsp;&nbsp;שם&nbsp;
    <span style="display:inline-block;border-bottom:1px solid #333;min-width:100px">${e.contactName||``}</span>
  </div>
  <div class="fl">שם החברה – לחשבונית&nbsp;<span class="ul">${e.company||``}</span></div>
  <div class="fl">ע.מ/ח.פ.&nbsp;<span class="ul" style="direction:ltr">${e.bizNum||``}</span></div>

  <div class="fl" style="margin-top:6px">
    מספר רכב :&nbsp;
    <span style="display:inline-block;border-bottom:1px solid #333;min-width:130px;direction:ltr">${e.veh1||``}</span>
    &nbsp;&nbsp;סוג רכב&nbsp;
    <span style="display:inline-block;border-bottom:1px solid #333;min-width:110px">${e.veh1Type||``}</span>
  </div>
  <div class="fl">
    מספר רכב :&nbsp;
    <span style="display:inline-block;border-bottom:1px solid #333;min-width:130px;direction:ltr">${e.veh2||``}</span>
    &nbsp;&nbsp;סוג רכב&nbsp;
    <span style="display:inline-block;border-bottom:1px solid #333;min-width:110px">${e.veh2Type||``}</span>
  </div>
  ${e.veh3||e.veh3Type?`<div class="fl">
    מספר רכב :&nbsp;
    <span style="display:inline-block;border-bottom:1px solid #333;min-width:130px;direction:ltr">${e.veh3||``}</span>
    &nbsp;&nbsp;סוג רכב&nbsp;
    <span style="display:inline-block;border-bottom:1px solid #333;min-width:110px">${e.veh3Type||``}</span>
  </div>`:``}
  ${e.veh4||e.veh4Type?`<div class="fl">
    מספר רכב :&nbsp;
    <span style="display:inline-block;border-bottom:1px solid #333;min-width:130px;direction:ltr">${e.veh4||``}</span>
    &nbsp;&nbsp;סוג רכב&nbsp;
    <span style="display:inline-block;border-bottom:1px solid #333;min-width:110px">${e.veh4Type||``}</span>
  </div>`:``}

  <div style="margin:8px 0;font-size:12.5px">בברכה</div>
</div>

<!-- ── BOTTOM: sig box (right) | contact text (center-left) ───── -->
<div class="bottom">
  <div class="sig-box">
    ${e.sigDataUrl?`<img src="${e.sigDataUrl}" alt="חתימה"/>`:``}
    ${e.fullName?`<div class="sig-name">${e.fullName}</div>`:``}
  </div>
  <div class="contact-txt">קונטקט ליון<br>שיווק ומכירות</div>
</div>

<!-- ── FOOTER ─────────────────────────────────────────────────── -->
<div class="ft">
  המצודה 31, אזור, 5800174 טל׳: 03-5662259-03 פקס 5568999<br>
  St. Hametzuda 31, Azur, 5800174, Israel &nbsp; Tel: 03-5662259-03<br>
  Website: http://www.samsonix.com &nbsp; Email: info@samsonix.com
</div>
<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),400));<\/script>
</body></html>`}function Wt(e,t){let n=X(Y()),r=window.open(``,`_blank`);return r?(r.document.write(Ut(e,t,n)),r.document.close(),!0):!1}function Gt({onChange:e}){let t=F.useRef(null),n=F.useRef(!1);F.useEffect(()=>{let e=t.current;if(!e)return;e.width=e.getBoundingClientRect().width,e.height=150;let n=e.getContext(`2d`);n.strokeStyle=`#16313a`,n.lineWidth=2.2,n.lineCap=`round`},[]);let r=e=>{let n=t.current.getBoundingClientRect(),r=e.touches?e.touches[0]:e;return[r.clientX-n.left,r.clientY-n.top]},i=e=>{e.preventDefault(),n.current=!0;let i=t.current.getContext(`2d`),[a,o]=r(e);i.beginPath(),i.moveTo(a,o)},a=e=>{if(!n.current)return;e.preventDefault();let i=t.current.getContext(`2d`),[a,o]=r(e);i.lineTo(a,o),i.stroke()},o=()=>{n.current&&(n.current=!1,e(t.current.toDataURL(`image/png`)))};return(0,z.jsxs)(`div`,{className:`ag-sig`,children:[(0,z.jsx)(`canvas`,{ref:t,className:`ag-sig-c`,onMouseDown:i,onMouseMove:a,onMouseUp:o,onMouseLeave:o,onTouchStart:i,onTouchMove:a,onTouchEnd:o}),(0,z.jsx)(`button`,{type:`button`,className:`ag-sig-clear`,onClick:()=>{let n=t.current;n.getContext(`2d`).clearRect(0,0,n.width,n.height),e(``)},children:`נקה חתימה`})]})}function Kt({onClose:e,showToast:t}){let[n,r]=(0,F.useState)({plan:`4gb`,audio:`none`,bsd:!1,fullName:``,idNum:``,email:``,phone:``,contactName:``,company:``,bizNum:``,veh1:``,veh1Type:``,veh2:``,veh2Type:``,veh3:``,veh3Type:``,veh4:``,veh4Type:``,sigDataUrl:``}),[i,a]=(0,F.useState)({num:``,expiry:``,cvv:``}),o=(e,t)=>r(n=>({...n,[e]:t})),s=()=>{if(!n.fullName.trim()||!n.idNum.trim()||!n.veh1.trim()){t(`מלא שם, ת"ז ומספר רכב`);return}if(!n.sigDataUrl){t(`חסרה חתימת לקוח`);return}if(!Wt(n,i)){t(`חסום חלונות קופצים — אפשר אותם`);return}try{let e=JSON.parse(localStorage.getItem(Ht)||`[]`);e.unshift({id:q(),savedAt:Y(),fullName:n.fullName,phone:n.phone,plan:n.plan,veh1:n.veh1}),localStorage.setItem(Ht,JSON.stringify(e.slice(0,200)))}catch{}t(`הטופס מוכן להדפסה/חתימה ✓`),e()},c=(e,t,r={})=>(0,z.jsx)(`input`,{className:`ag-input`,value:n[e],onChange:t=>o(e,t.target.value),placeholder:t,...r});return(0,z.jsx)(`div`,{className:`ag-modal`,onClick:t=>{t.target===t.currentTarget&&e()},children:(0,z.jsxs)(`div`,{className:`ag-sheet`,children:[(0,z.jsxs)(`div`,{className:`ag-sheet-head`,children:[(0,z.jsx)(`b`,{children:`טופס החתמה · סמסוניקס DVR`}),(0,z.jsx)(`button`,{onClick:e,children:(0,z.jsx)(N,{size:20})})]}),(0,z.jsxs)(`div`,{className:`ag-sheet-body`,children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`חבילת מנוי`}),(0,z.jsx)(`div`,{className:`ag-chips sm nowrap`,children:Vt.map(e=>(0,z.jsx)(`button`,{className:n.plan===e.id?`on`:``,onClick:()=>o(`plan`,e.id),children:e.id.toUpperCase()},e.id))}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`הקלטת קול`}),(0,z.jsxs)(`div`,{className:`ag-chips sm nowrap`,children:[(0,z.jsx)(`button`,{className:n.audio===`none`?`on`:``,onClick:()=>o(`audio`,`none`),children:`ללא קול`}),(0,z.jsx)(`button`,{className:n.audio===`with`?`on`:``,onClick:()=>o(`audio`,`with`),children:`עם קול`}),(0,z.jsx)(`button`,{className:n.bsd?`on`:``,onClick:()=>o(`bsd`,!n.bsd),children:`BSD + 4 מצלמות`})]}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`שם מלא של בעל הכרטיס *`}),c(`fullName`,`שם מלא`),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`ת"ז *`}),c(`idNum`,`ת"ז`,{dir:`ltr`})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`טלפון`}),c(`phone`,`05X`,{dir:`ltr`})]})]}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`מייל`}),c(`email`,`name@mail.com`,{dir:`ltr`}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`שם חברה`}),c(`company`,`חברה`)]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`ע.מ / ח.פ`}),c(`bizNum`,`מספר`,{dir:`ltr`})]})]}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`מספר רכב *`}),c(`veh1`,`מספר`,{dir:`ltr`})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`סוג רכב`}),c(`veh1Type`,`סוג`)]})]}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`רכב 2`}),c(`veh2`,`מספר`,{dir:`ltr`})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`סוג רכב 2`}),c(`veh2Type`,`סוג`)]})]}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`רכב 3`}),c(`veh3`,`מספר`,{dir:`ltr`})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`סוג רכב 3`}),c(`veh3Type`,`סוג`)]})]}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`רכב 4`}),c(`veh4`,`מספר`,{dir:`ltr`})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`סוג רכב 4`}),c(`veh4Type`,`סוג`)]})]}),(0,z.jsxs)(`div`,{className:`ag-sam-pay`,children:[(0,z.jsx)(`div`,{className:`ag-lbl`,style:{marginTop:0},children:`פרטי תשלום (הוראת קבע) 🔒 לא נשמרים`}),(0,z.jsx)(`input`,{className:`ag-input`,value:i.num,onChange:e=>a({...i,num:e.target.value}),placeholder:`מספר כרטיס אשראי`,dir:`ltr`,inputMode:`numeric`,autoComplete:`off`}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsx)(`input`,{className:`ag-input`,value:i.expiry,onChange:e=>a({...i,expiry:e.target.value}),placeholder:`תוקף MM/YY`,dir:`ltr`,autoComplete:`off`}),(0,z.jsx)(`input`,{className:`ag-input`,value:i.cvv,onChange:e=>a({...i,cvv:e.target.value}),placeholder:`CVV`,dir:`ltr`,inputMode:`numeric`,autoComplete:`off`})]})]}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`חתימת הלקוח *`}),(0,z.jsx)(Gt,{onChange:e=>o(`sigDataUrl`,e)})]}),(0,z.jsxs)(`div`,{className:`ag-sheet-foot`,children:[(0,z.jsxs)(`button`,{className:`ag-btn ghost`,onClick:()=>{if(!I()){t(`חבר קודם מסד נתונים (כפתור הענן)`);return}if(!n.phone.trim()){t(`הזן טלפון לקוח לשליחת הקישור`);return}window.open(Z(n.phone,`שלום, למילוי טופס המנוי לסמסוניקס: ${en(n.phone)}`),`_blank`)},children:[(0,z.jsx)(P,{size:15}),` שלח קישור ללקוח`]}),(0,z.jsxs)(`button`,{className:`ag-btn`,onClick:s,children:[(0,z.jsx)(d,{size:15}),` הפק טופס לחתימה`]})]})]})})}function qt({id:e,cat:t,size:n=80}){let r=`0 0 120 90`,i=120/90*n,a=n;if(e===`C11`||e===`12EV`)return(0,z.jsxs)(`svg`,{width:i,height:a,viewBox:r,fill:`none`,children:[(0,z.jsx)(`rect`,{x:`22`,y:`14`,width:`66`,height:`8`,rx:`2`,fill:`#1a1a1a`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`rect`,{x:`24`,y:`16`,width:`62`,height:`5`,rx:`1`,fill:`#222`}),(0,z.jsx)(`rect`,{x:`18`,y:`21`,width:`74`,height:`52`,rx:`4`,fill:`#1c1c1c`,stroke:`#444`,strokeWidth:`1.5`}),(0,z.jsx)(`rect`,{x:`22`,y:`25`,width:`66`,height:`44`,rx:`3`,fill:`#141414`}),(0,z.jsx)(`rect`,{x:`90`,y:`30`,width:`12`,height:`32`,rx:`2`,fill:`#1a1a1a`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`circle`,{cx:`96`,cy:`37`,r:`3`,fill:`#111`,stroke:`#444`,strokeWidth:`1`}),(0,z.jsx)(`circle`,{cx:`96`,cy:`55`,r:`3`,fill:`#111`,stroke:`#444`,strokeWidth:`1`}),[28,36,44,52,60,68].map(e=>[31,47].map(t=>(0,z.jsx)(`circle`,{cx:e,cy:t,r:`2.2`,fill:`#ddd`,opacity:`0.85`},e+`-`+t))),(0,z.jsx)(`circle`,{cx:`50`,cy:`39`,r:`13`,fill:`#0a0a0a`,stroke:`#555`,strokeWidth:`1.5`}),(0,z.jsx)(`circle`,{cx:`50`,cy:`39`,r:`9`,fill:`#080808`,stroke:`#888`,strokeWidth:`1`}),(0,z.jsx)(`circle`,{cx:`50`,cy:`39`,r:`5.5`,fill:`#050505`}),(0,z.jsx)(`circle`,{cx:`47`,cy:`36`,r:`2`,fill:`white`,opacity:`0.15`}),(0,z.jsx)(`rect`,{x:`30`,y:`72`,width:`50`,height:`5`,rx:`2`,fill:`#1a1a1a`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`rect`,{x:`38`,y:`76`,width:`8`,height:`8`,rx:`1`,fill:`#151515`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`rect`,{x:`64`,y:`76`,width:`8`,height:`8`,rx:`1`,fill:`#151515`,stroke:`#333`,strokeWidth:`1`})]});if(e===`C500`)return(0,z.jsxs)(`svg`,{width:i,height:a,viewBox:r,fill:`none`,children:[(0,z.jsx)(`rect`,{x:`25`,y:`18`,width:`70`,height:`10`,rx:`3`,fill:`#cc2200`}),(0,z.jsx)(`rect`,{x:`27`,y:`20`,width:`66`,height:`6`,rx:`2`,fill:`#ee3311`,opacity:`0.7`}),(0,z.jsx)(`rect`,{x:`20`,y:`27`,width:`80`,height:`34`,rx:`5`,fill:`#1c1c1c`,stroke:`#444`,strokeWidth:`1.5`}),(0,z.jsx)(`rect`,{x:`24`,y:`31`,width:`72`,height:`26`,rx:`4`,fill:`#141414`}),(0,z.jsx)(`circle`,{cx:`45`,cy:`44`,r:`11`,fill:`#0a0a0a`,stroke:`#555`,strokeWidth:`1.5`}),(0,z.jsx)(`circle`,{cx:`45`,cy:`44`,r:`7.5`,fill:`#080808`,stroke:`#777`,strokeWidth:`1`}),(0,z.jsx)(`circle`,{cx:`45`,cy:`44`,r:`4.5`,fill:`#050505`}),(0,z.jsx)(`circle`,{cx:`42.5`,cy:`41.5`,r:`1.8`,fill:`white`,opacity:`0.18`}),(0,z.jsx)(`rect`,{x:`26`,y:`39`,width:`12`,height:`3`,rx:`1.5`,fill:`#333`}),(0,z.jsx)(`rect`,{x:`72`,y:`38`,width:`18`,height:`4`,rx:`2`,fill:`#1a1a1a`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`rect`,{x:`80`,y:`36`,width:`8`,height:`8`,rx:`2`,fill:`#222`,stroke:`#444`,strokeWidth:`1`}),(0,z.jsx)(`rect`,{x:`30`,y:`59`,width:`60`,height:`3`,rx:`1.5`,fill:`#222`})]});if(e===`C190`)return(0,z.jsxs)(`svg`,{width:i,height:a,viewBox:r,fill:`none`,children:[(0,z.jsx)(`path`,{d:`M100 50 Q108 50 110 55 Q112 60 108 62 L95 62`,stroke:`#333`,strokeWidth:`3`,fill:`none`}),(0,z.jsx)(`ellipse`,{cx:`87`,cy:`50`,rx:`12`,ry:`14`,fill:`#1a1a1a`,stroke:`#444`,strokeWidth:`1.5`}),[44,48,52,56].map(e=>(0,z.jsx)(`rect`,{x:`80`,y:e,width:`14`,height:`2`,rx:`1`,fill:`#111`,stroke:`#333`,strokeWidth:`0.5`},e)),(0,z.jsx)(`rect`,{x:`38`,y:`26`,width:`42`,height:`7`,rx:`2`,fill:`#cc2200`}),(0,z.jsx)(`rect`,{x:`15`,y:`32`,width:`78`,height:`28`,rx:`10`,fill:`#1c1c1c`,stroke:`#444`,strokeWidth:`1.5`}),(0,z.jsx)(`rect`,{x:`19`,y:`36`,width:`70`,height:`20`,rx:`8`,fill:`#141414`}),(0,z.jsx)(`circle`,{cx:`30`,cy:`46`,r:`11`,fill:`#0a0a0a`,stroke:`#666`,strokeWidth:`1.5`}),(0,z.jsx)(`circle`,{cx:`30`,cy:`46`,r:`7.5`,fill:`#070707`,stroke:`#999`,strokeWidth:`1`}),(0,z.jsx)(`circle`,{cx:`30`,cy:`46`,r:`4.5`,fill:`#040404`}),(0,z.jsx)(`circle`,{cx:`27.5`,cy:`43.5`,r:`2`,fill:`white`,opacity:`0.15`})]});if(e===`C600`)return(0,z.jsxs)(`svg`,{width:i,height:a,viewBox:r,fill:`none`,children:[(0,z.jsx)(`rect`,{x:`30`,y:`18`,width:`60`,height:`7`,rx:`3`,fill:`#cc2200`}),(0,z.jsx)(`rect`,{x:`32`,y:`19`,width:`56`,height:`4`,rx:`2`,fill:`#ee3311`,opacity:`0.6`}),(0,z.jsx)(`rect`,{x:`28`,y:`24`,width:`64`,height:`44`,rx:`8`,fill:`#1c1c1c`,stroke:`#444`,strokeWidth:`1.5`}),(0,z.jsx)(`rect`,{x:`32`,y:`28`,width:`56`,height:`36`,rx:`6`,fill:`#141414`}),(0,z.jsx)(`rect`,{x:`20`,y:`38`,width:`10`,height:`8`,rx:`2`,fill:`#1a1a1a`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`rect`,{x:`90`,y:`38`,width:`10`,height:`8`,rx:`2`,fill:`#1a1a1a`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`46`,r:`16`,fill:`#0a0a0a`,stroke:`#666`,strokeWidth:`2`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`46`,r:`12`,fill:`#070707`,stroke:`#888`,strokeWidth:`1.5`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`46`,r:`8.5`,fill:`#050505`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`46`,r:`12`,fill:`none`,stroke:`#4466ff`,strokeWidth:`1`,opacity:`0.4`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`46`,r:`10`,fill:`none`,stroke:`#66aaff`,strokeWidth:`0.8`,opacity:`0.3`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`46`,r:`8.5`,fill:`none`,stroke:`#aa66ff`,strokeWidth:`0.7`,opacity:`0.25`}),(0,z.jsx)(`circle`,{cx:`56.5`,cy:`42.5`,r:`3`,fill:`white`,opacity:`0.12`})]});if(e===`R19`||e===`R13`)return(0,z.jsxs)(`svg`,{width:i,height:a,viewBox:r,fill:`none`,children:[(0,z.jsx)(`rect`,{x:`45`,y:`68`,width:`30`,height:`12`,rx:`2`,fill:`#1a1a1a`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`77`,r:`5`,fill:`#111`,stroke:`#444`,strokeWidth:`1.5`}),(0,z.jsx)(`rect`,{x:`42`,y:`55`,width:`12`,height:`18`,rx:`2`,fill:`#1c1c1c`,stroke:`#444`,strokeWidth:`1`}),(0,z.jsx)(`rect`,{x:`66`,y:`55`,width:`12`,height:`18`,rx:`2`,fill:`#1c1c1c`,stroke:`#444`,strokeWidth:`1`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`42`,r:`28`,fill:`#1c1c1c`,stroke:`#444`,strokeWidth:`1.5`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`42`,r:`24`,fill:`#141414`}),Array.from({length:11},(e,t)=>{let n=t/11*Math.PI*2-Math.PI/2;return(0,z.jsx)(`circle`,{cx:60+18*Math.cos(n),cy:42+18*Math.sin(n),r:`2.5`,fill:`#ddd`,opacity:`0.85`},t)}),(0,z.jsx)(`circle`,{cx:`60`,cy:`42`,r:`9`,fill:`#0a0a0a`,stroke:`#666`,strokeWidth:`1.5`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`42`,r:`6`,fill:`#070707`,stroke:`#4488ff`,strokeWidth:`1`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`42`,r:`3.5`,fill:`#040404`}),(0,z.jsx)(`circle`,{cx:`57.5`,cy:`39.5`,r:`1.5`,fill:`white`,opacity:`0.2`})]});if(e===`T15`)return(0,z.jsxs)(`svg`,{width:i,height:a,viewBox:r,fill:`none`,children:[(0,z.jsx)(`rect`,{x:`25`,y:`62`,width:`70`,height:`10`,rx:`3`,fill:`#1a1a1a`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`rect`,{x:`30`,y:`69`,width:`12`,height:`10`,rx:`2`,fill:`#151515`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`rect`,{x:`78`,y:`69`,width:`12`,height:`10`,rx:`2`,fill:`#151515`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`path`,{d:`M22 62 Q22 20 60 18 Q98 20 98 62 Z`,fill:`#1c1c1c`,stroke:`#444`,strokeWidth:`1.5`}),(0,z.jsx)(`path`,{d:`M26 62 Q26 24 60 22 Q94 24 94 62 Z`,fill:`#141414`}),Array.from({length:9},(e,t)=>{let n=t/9*Math.PI+.15;return(0,z.jsx)(`circle`,{cx:60+28*Math.cos(n),cy:58-28*Math.sin(n),r:`2.2`,fill:`#ddd`,opacity:`0.8`},t)}),(0,z.jsx)(`circle`,{cx:`60`,cy:`46`,r:`11`,fill:`#0a0a0a`,stroke:`#555`,strokeWidth:`1.5`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`46`,r:`7.5`,fill:`#070707`,stroke:`#777`,strokeWidth:`1`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`46`,r:`4.5`,fill:`#040404`}),(0,z.jsx)(`circle`,{cx:`57.5`,cy:`43.5`,r:`1.8`,fill:`white`,opacity:`0.15`})]});if(t?.includes(`מסך`)||e?.includes(`T70`)||e?.includes(`T90`)||e?.includes(`T10`)||t?.includes(`BSD`)){let n=e?.includes(`T10`)||t?.includes(`BSD`);return(0,z.jsxs)(`svg`,{width:i,height:a,viewBox:r,fill:`none`,children:[(0,z.jsx)(`rect`,{x:`8`,y:`10`,width:`104`,height:`9`,rx:`2`,fill:`#1a1a1a`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`rect`,{x:`10`,y:`11`,width:`100`,height:`6`,rx:`1.5`,fill:`#222`}),(0,z.jsx)(`rect`,{x:`8`,y:`18`,width:`104`,height:`52`,rx:`3`,fill:`#1c1c1c`,stroke:`#444`,strokeWidth:`1.5`}),(0,z.jsx)(`rect`,{x:`11`,y:`21`,width:`98`,height:`43`,rx:`2`,fill:n?`#0a1020`:`#061018`}),n?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(`rect`,{x:`13`,y:`23`,width:`46`,height:`19`,rx:`1`,fill:`#0d1a2a`}),(0,z.jsx)(`rect`,{x:`61`,y:`23`,width:`46`,height:`19`,rx:`1`,fill:`#0a1420`}),(0,z.jsx)(`rect`,{x:`13`,y:`44`,width:`46`,height:`18`,rx:`1`,fill:`#0d1828`}),(0,z.jsx)(`rect`,{x:`61`,y:`44`,width:`46`,height:`18`,rx:`1`,fill:`#0a1620`}),(0,z.jsx)(`rect`,{x:`13`,y:`23`,width:`94`,height:`2`,fill:`none`}),(0,z.jsx)(`line`,{x1:`60`,y1:`23`,x2:`60`,y2:`62`,stroke:`#1a2a3a`,strokeWidth:`1`}),(0,z.jsx)(`line`,{x1:`13`,y1:`43`,x2:`107`,y2:`43`,stroke:`#1a2a3a`,strokeWidth:`1`}),(0,z.jsx)(`rect`,{x:`20`,y:`28`,width:`28`,height:`12`,rx:`1`,fill:`#0f2035`,opacity:`0.8`}),(0,z.jsx)(`rect`,{x:`67`,y:`28`,width:`28`,height:`12`,rx:`1`,fill:`#0f2035`,opacity:`0.8`}),(0,z.jsx)(`rect`,{x:`15`,y:`46`,width:`10`,height:`10`,rx:`2`,fill:`#1a3a5a`}),(0,z.jsx)(`rect`,{x:`27`,y:`46`,width:`10`,height:`10`,rx:`2`,fill:`#2a4a1a`}),(0,z.jsx)(`rect`,{x:`39`,y:`46`,width:`10`,height:`10`,rx:`2`,fill:`#3a1a1a`}),(0,z.jsx)(`rect`,{x:`51`,y:`46`,width:`7`,height:`10`,rx:`2`,fill:`#1a2a4a`})]}):(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(`rect`,{x:`13`,y:`23`,width:`94`,height:`39`,rx:`1`,fill:`#0d2040`}),(0,z.jsx)(`rect`,{x:`13`,y:`48`,width:`94`,height:`14`,rx:`1`,fill:`#111a0a`}),(0,z.jsx)(`path`,{d:`M55 62 L60 42 L65 62`,fill:`#333`,opacity:`0.5`}),(0,z.jsx)(`rect`,{x:`55`,y:`55`,width:`10`,height:`2`,rx:`1`,fill:`#fff`,opacity:`0.4`})]}),(0,z.jsx)(`rect`,{x:`11`,y:`65`,width:`98`,height:`7`,rx:`1`,fill:`#111`}),[18,28,38,48,58,68,78,88,98].map(e=>(0,z.jsx)(`rect`,{x:e,y:`67`,width:`6`,height:`3`,rx:`1`,fill:`#2a2a2a`},e)),(0,z.jsx)(`rect`,{x:`0`,y:`26`,width:`10`,height:`16`,rx:`3`,fill:`#1a1a1a`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`rect`,{x:`110`,y:`26`,width:`10`,height:`16`,rx:`3`,fill:`#1a1a1a`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`rect`,{x:`48`,y:`72`,width:`24`,height:`4`,rx:`2`,fill:`#1a1a1a`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`rect`,{x:`54`,y:`75`,width:`12`,height:`8`,rx:`2`,fill:`#151515`,stroke:`#333`,strokeWidth:`1`})]})}return e===`15EV`?(0,z.jsxs)(`svg`,{width:i,height:a,viewBox:r,fill:`none`,children:[(0,z.jsx)(`rect`,{x:`10`,y:`52`,width:`100`,height:`16`,rx:`4`,fill:`#1a1a1a`,stroke:`#333`,strokeWidth:`1`}),(0,z.jsx)(`ellipse`,{cx:`60`,cy:`52`,rx:`50`,ry:`30`,fill:`#1c1c1c`,stroke:`#444`,strokeWidth:`1.5`}),(0,z.jsx)(`ellipse`,{cx:`60`,cy:`52`,rx:`45`,ry:`25`,fill:`#141414`}),Array.from({length:8},(e,t)=>{let n=t/8*Math.PI*2;return(0,z.jsx)(`circle`,{cx:60+30*Math.cos(n),cy:52+30*Math.sin(n)*.55,r:`2.2`,fill:`#ddd`,opacity:`0.8`},t)}),(0,z.jsx)(`circle`,{cx:`60`,cy:`52`,r:`11`,fill:`#0a0a0a`,stroke:`#555`,strokeWidth:`1.5`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`52`,r:`7.5`,fill:`#070707`,stroke:`#777`,strokeWidth:`1`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`52`,r:`4.5`,fill:`#040404`}),(0,z.jsx)(`circle`,{cx:`57.5`,cy:`49.5`,r:`1.8`,fill:`white`,opacity:`0.15`})]}):(0,z.jsxs)(`svg`,{width:i,height:a,viewBox:r,fill:`none`,children:[(0,z.jsx)(`path`,{d:`M60 12 L88 26 L88 52 C88 68 75 78 60 84 C45 78 32 68 32 52 L32 26 Z`,fill:`#111122`,stroke:`rgba(var(--gold-rgb),0.6)`,strokeWidth:`2`}),(0,z.jsx)(`path`,{d:`M60 18 L83 30 L83 52 C83 65 72 73 60 78 C48 73 37 65 37 52 L37 30 Z`,fill:`#0d0d20`}),(0,z.jsx)(`circle`,{cx:`60`,cy:`48`,r:`12`,fill:`#0a0a18`,stroke:`rgba(var(--gold-rgb),0.4)`,strokeWidth:`1.5`}),(0,z.jsx)(`path`,{d:`M53 48 L57 52 L68 41`,stroke:`rgba(var(--gold-rgb),0.9)`,strokeWidth:`2.5`,strokeLinecap:`round`,strokeLinejoin:`round`})]})}var Jt=[{id:`T15`,cat:`מצלמת דש`,tags:[`IP69K`,`2כ`,`AHD 2MP`],price:null,desc:`Sony AHD 2MP מצלמת דש ממוגנת IP69K, ראיית לילה LED 20 מטר, מסגרת קטנה לרכב כבד.`},{id:`C11`,cat:`מצלמה אחורית`,tags:[`ראיית לילה`,`WDR`,`18 LED`],price:null,desc:`Sony AHD 2MP אחורית, 18 נוריות LED 20 מטר, Smart D WDR, מותאמת לאוטובוסים וטרקטורים.`},{id:`15EV`,cat:`מצלמה צדדית/גלגל`,tags:[`IP69K`,`130°`,`2כ`],price:null,desc:`Sony AHD 2MP CMOS שדה ראייה 130°, IP69K מלא, ראיית לילה, לאוטובוסים ורכבי שיווע.`},{id:`12EV`,cat:`מצלמה אחורית`,tags:[`IP69K`,`1080P`,`עמיד`],price:null,desc:`Sony AHD 2MP 1080P IP69K, עמידה לאבק ומים, ראיית לילה, מסגרת אלומיניום קשיחה.`},{id:`C500`,cat:`מצלמה קדמית`,tags:[`DVR`,`20M LED`,`IP69K`],price:null,desc:`Sony AHD 2MP קדמית, ראיית לילה LED 20 מטר, כבל 25 מטר, מתאים לאוטובוסים וחשמלית.`},{id:`C190`,cat:`מצלמה קדמית/אחורית`,tags:[`WDR`,`127°`,`1080P`],price:null,desc:`AHD 1080P קדמית/אחורית כפולה, שדה ראייה 127°, WDR מתקדם לתאורה קשה, מוגנת מלאה.`},{id:`C600`,cat:`מצלמה קדמית`,tags:[`Starvis`,`IP67`,`AHD 2MP`],price:null,desc:`Sony Starvis AHD 2MP קדמית IP67, איכות תמונה גבוהה בתאורה נמוכה, עמידה בחוץ מלאה.`},{id:`R19`,cat:`מצלמת רוורס`,tags:[`IP69K`,`11 LED`,`2כ`],price:null,desc:`Sony AHD 2MP רוורס, 11 נוריות LED חיצוניות IP69K, ראיית לילה מוארת, למשאיות ורכבי משא.`}],Yt=[{id:`T7070M`,cat:`מסך DVR 7"`,tags:[`7"`,`4 מצלמות`,`DVR`],price:null,desc:`מסך 7 אינץ' דיגיטלי, תמיכה ב-4 מצלמות AHD, ממשק פשוט, מתאים להתקנה בלוח מחוונים.`},{id:`T9052`,cat:`מסך DVR 9"`,tags:[`9"`,`DVR`,`IPS`],price:null,desc:`מסך 9 אינץ' IPS איכותי, חיבור DVR, תמיכה ב-4 מצלמות, מתאים לאוטובוסים ורכבים גדולים.`},{id:`T10548SD`,cat:`מסך BSD 10.1"`,tags:[`BSD`,`6 מצלמות`,`DVR`,`DMS`],price:1,desc:`מסך BSD 10.1" IPS, 4 מצלמות AHD, הקלטה DVR 256GB, תוכנת BSD/DMS — הפתרון המלא לרכב כבד.`}],Xt=[{id:`SYS_BASIC`,cat:`חבילה בסיסית`,tags:[`מסך 7"`,`2 מצלמות`,`רוורס`],price:null,desc:`מסך 7 אינץ' + מצלמת רוורס + מצלמה אחורית, חיבור מלא, התקנה כולל.`},{id:`SYS_4CAM`,cat:`חבילת 4 מצלמות`,tags:[`מסך 9"`,`4 מצלמות`,`DVR`],price:null,desc:`מסך 9 אינץ' DVR + 4 מצלמות AHD (קדמית, אחורית, 2 צדדיות) + הקלטה.`},{id:`SYS_BSD`,cat:`חבילת BSD מלאה`,tags:[`BSD`,`6 מצלמות`,`DMS`,`DVR`],price:null,desc:`מסך BSD 10.1" + עד 6 מצלמות + DVR + תוכנת BSD/DMS + מצלמת נהג. פתרון בטיחות מלא.`},{id:`SYS_ITURAN`,cat:`איתוראן + מיגון`,tags:[`GPS`,`איתוראן`,`מיגון`],price:null,desc:`מערכת איתוראן GPS למעקב ואיתור בזמן אמת, שדרוג מוצרי מיגון משלימים.`}];function Zt({showToast:e,onQuote:t}){let[n,r]=(0,F.useState)(`cameras`),[i,a]=(0,F.useState)(null),[o,s]=(0,F.useState)(!1),c=dt(),l=e=>{let t=c.find(t=>(t.name||``).toLowerCase().includes(e.toLowerCase()));return t?t.price:null},u=n===`cameras`?Jt:n===`monitors`?Yt:Xt,d=n=>{let r=l(n.id)||0;t({name:`${n.id} – ${n.cat}`,price:r}),e(`${n.id} נוסף להצעה ✓`)};return o&&i?(0,z.jsx)(`div`,{className:`sr-present`,onClick:()=>s(!1),children:(0,z.jsxs)(`div`,{className:`sr-present-inner`,onClick:e=>e.stopPropagation(),children:[(0,z.jsx)(`button`,{className:`sr-present-close`,onClick:()=>s(!1),children:(0,z.jsx)(N,{size:22})}),(0,z.jsx)(`div`,{className:`sr-present-badge`,children:i.cat}),(0,z.jsx)(`div`,{className:`sr-present-id`,children:i.id}),(0,z.jsx)(`div`,{className:`sr-present-icon`,children:(0,z.jsx)(qt,{id:i.id,cat:i.cat,size:140})}),(0,z.jsx)(`div`,{className:`sr-present-tags`,children:i.tags.map(e=>(0,z.jsx)(`span`,{className:`sr-tag big`,children:e},e))}),(0,z.jsx)(`div`,{className:`sr-present-desc`,children:i.desc}),l(i.id)&&(0,z.jsxs)(`div`,{className:`sr-present-price`,children:[J(l(i.id)),` `,(0,z.jsx)(`small`,{children:`+ מע"מ`})]})]})}):(0,z.jsxs)(`div`,{className:`ag-view`,children:[(0,z.jsxs)(`div`,{className:`sr-header`,children:[(0,z.jsxs)(`div`,{className:`sr-header-top`,children:[(0,z.jsx)(ie,{size:18}),` `,(0,z.jsx)(`span`,{children:`שורום מוצרים · Heavy Guard`})]}),(0,z.jsx)(`div`,{className:`sr-header-sub`,children:`הצג מוצרים ללקוח · לחץ על מוצר למצב הצגה`})]}),(0,z.jsxs)(`div`,{className:`sr-tabs`,children:[(0,z.jsxs)(`button`,{className:n===`cameras`?`on`:``,onClick:()=>r(`cameras`),children:[(0,z.jsx)(ee,{size:14}),` מצלמות`]}),(0,z.jsxs)(`button`,{className:n===`monitors`?`on`:``,onClick:()=>r(`monitors`),children:[(0,z.jsx)(de,{size:14}),` מסכים`]}),(0,z.jsxs)(`button`,{className:n===`systems`?`on`:``,onClick:()=>r(`systems`),children:[(0,z.jsx)(ae,{size:14}),` חבילות`]})]}),(0,z.jsx)(`div`,{className:`sr-grid`,children:u.map(e=>(0,z.jsxs)(`div`,{className:`sr-card`,onClick:()=>{a(e),s(!0)},children:[(0,z.jsxs)(`div`,{className:`sr-img-area`,children:[(0,z.jsx)(qt,{id:e.id,cat:e.cat,size:80}),(0,z.jsx)(`div`,{className:`sr-img-badge`,children:e.cat}),(0,z.jsx)(`button`,{className:`sr-expand sr-expand-abs`,onClick:t=>{t.stopPropagation(),a(e),s(!0)},title:`הצג ללקוח`,children:(0,z.jsx)(ue,{size:13})})]}),(0,z.jsxs)(`div`,{className:`sr-card-body`,children:[(0,z.jsx)(`div`,{className:`sr-card-head`,style:{padding:0,paddingTop:2},children:(0,z.jsx)(`div`,{className:`sr-card-info`,children:(0,z.jsx)(`div`,{className:`sr-model`,children:e.id})})}),(0,z.jsx)(`div`,{className:`sr-tags-row`,children:e.tags.map(e=>(0,z.jsx)(`span`,{className:`sr-tag`,children:e},e))}),(0,z.jsx)(`div`,{className:`sr-desc`,children:e.desc}),l(e.id)&&(0,z.jsxs)(`div`,{className:`sr-price`,children:[J(l(e.id)),` `,(0,z.jsx)(`small`,{children:`+ מע"מ`})]}),(0,z.jsxs)(`div`,{className:`sr-card-foot`,children:[(0,z.jsxs)(`button`,{className:`sr-quote-btn`,onClick:t=>{t.stopPropagation(),d(e)},children:[(0,z.jsx)(M,{size:13}),` להצעת מחיר`]}),(0,z.jsxs)(`button`,{className:`sr-show-btn`,onClick:t=>{t.stopPropagation(),a(e),s(!0)},children:[(0,z.jsx)(ue,{size:13}),` הצג ללקוח`]})]})]})]},e.id))})]})}function Qt({onClose:e,onQuote:t}){let n=dt(),[r,i]=(0,F.useState)(``),a=r?n.filter(e=>(e.name||``).toLowerCase().includes(r.toLowerCase())):n;return(0,z.jsx)(`div`,{className:`ag-modal`,onClick:t=>{t.target===t.currentTarget&&e()},children:(0,z.jsxs)(`div`,{className:`ag-sheet`,children:[(0,z.jsxs)(`div`,{className:`ag-sheet-head`,children:[(0,z.jsx)(`b`,{children:`קטלוג מוצרים · Heavy Guard`}),(0,z.jsx)(`button`,{onClick:e,children:(0,z.jsx)(N,{size:20})})]}),(0,z.jsxs)(`div`,{className:`ag-sheet-body`,children:[(0,z.jsxs)(`div`,{className:`ag-searchbox`,children:[(0,z.jsx)(j,{size:15}),(0,z.jsx)(`input`,{value:r,onChange:e=>i(e.target.value),placeholder:`חיפוש מוצר…`,dir:`rtl`}),r&&(0,z.jsx)(`button`,{onClick:()=>i(``),children:(0,z.jsx)(N,{size:14})})]}),(0,z.jsxs)(`div`,{className:`ag-cat-note`,children:[`מסונכרן חי מהמחירון של Heavy Guard · `,n.length,` מוצרים`]}),(0,z.jsxs)(`div`,{className:`ag-cat-grid`,children:[a.map(e=>(0,z.jsxs)(`div`,{className:`ag-cat-card`,children:[(0,z.jsx)(`div`,{className:`ag-cat-ic`,children:(0,z.jsx)(A,{size:18})}),(0,z.jsxs)(`div`,{className:`ag-cat-mid`,children:[(0,z.jsx)(`b`,{children:e.name}),(0,z.jsxs)(`span`,{children:[J(e.price),` `,(0,z.jsx)(`em`,{children:`+ מע"מ`})]})]}),(0,z.jsxs)(`button`,{className:`ag-cat-add`,onClick:()=>t(e),children:[(0,z.jsx)(M,{size:15}),` להצעה`]})]},e.id||e.name)),a.length===0&&(0,z.jsx)(`div`,{className:`ag-empty sm`,children:`לא נמצאו מוצרים`})]})]})]})})}var $t=e=>{try{return new URLSearchParams((location.hash||``).replace(/^#/,``).replace(/&/g,`&`)).get(e)||``}catch{return``}};function en(e){let t=`${location.origin+location.pathname}#samform&to=${encodeURIComponent((e||``).replace(/\D/g,``))}`,n=xe();return n&&(t+=`&cfg=${n}`),t}function tn({onClose:e,showToast:t}){let[n,r]=(0,F.useState)(ge());return(0,z.jsx)(`div`,{className:`ag-modal`,onClick:t=>{t.target===t.currentTarget&&e()},children:(0,z.jsxs)(`div`,{className:`ag-sheet sm`,children:[(0,z.jsxs)(`div`,{className:`ag-sheet-head`,children:[(0,z.jsx)(`b`,{children:`מסד נתונים משותף · ענן`}),(0,z.jsx)(`button`,{onClick:e,children:(0,z.jsx)(N,{size:20})})]}),(0,z.jsxs)(`div`,{className:`ag-sheet-body`,children:[(0,z.jsxs)(`div`,{className:`ag-cat-note`,style:{lineHeight:1.6},children:[`חבר מסד Firebase חינמי כדי ששניכם תראו ותערכו את אותם נתונים בזמן אמת. פתח פרויקט ב-`,(0,z.jsx)(`b`,{children:`console.firebase.google.com`}),` → ⚙ Project settings → Your apps → Web → העתק את אובייקט `,(0,z.jsx)(`b`,{children:`firebaseConfig`}),` והדבק כאן. גם הפעל `,(0,z.jsx)(`b`,{children:`Firestore Database`}),` (מצב בדיקה). חינם, בלי כרטיס אשראי.`]}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`firebaseConfig (JSON)`}),(0,z.jsx)(`textarea`,{className:`ag-textarea`,value:n,onChange:e=>r(e.target.value),rows:8,dir:`ltr`,placeholder:`{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  "appId": "..."
}`}),(0,z.jsxs)(`div`,{className:`ag-cat-note`,children:[`סטטוס: `,I()?`מחובר 🟢`:`לא מחובר ⚪`]})]}),(0,z.jsxs)(`div`,{className:`ag-sheet-foot`,children:[(0,z.jsx)(`button`,{className:`ag-btn ghost`,onClick:e,children:`סגור`}),(0,z.jsx)(`button`,{className:`ag-btn`,onClick:()=>{let r=n.trim();if(r)try{let e=JSON.parse(r);if(!e.projectId||!e.apiKey){t(`ההגדרות חסרות apiKey/projectId`);return}}catch{t(`ההגדרות אינן JSON תקין`);return}_e(r),t(r?`הענן חובר ✓ רענן כדי לסנכרן`:`הענן נותק`),e()},children:`שמור`})]})]})})}function nn(e){let t=X(e.savedAt||Y()),n=window.open(``,`_blank`);if(!n)return!1;let r=e.cardNum||e.expiry?{num:e.cardNum||``,expiry:e.expiry||``,cvv:e.cvv||``}:null;return n.document.write(Ut(e,r,t)),n.document.close(),!0}function rn({showToast:e}){let[t,n]=(0,F.useState)([]),[r,i]=(0,F.useState)(null),[o,s]=(0,F.useState)(null);(0,F.useEffect)(()=>{if(I())return we(`itai:saminbox`).then(e=>{e&&n(Object.values(e).sort((e,t)=>(t.ts||0)-(e.ts||0)))}),Te((e,t)=>{e===`itai:saminbox`&&t&&n(Object.values(t).sort((e,t)=>(t.ts||0)-(e.ts||0)))},[`itai:saminbox`])},[]);let c=async r=>{if(!window.confirm(`למחוק לצמיתות את הטופס של ${r.fullName||`הלקוח`}?`))return;let a=t.filter(e=>e.id!==r.id);n(a),i(null);let o={};a.forEach(e=>{o[e.id]=e});try{await Se(`itai:saminbox`,o),e(`הטופס נמחק ✓`)}catch{n(t),e(`המחיקה נכשלה`)}};return!I()||!t.length?null:(0,z.jsxs)(`div`,{className:`ag-section`,children:[(0,z.jsxs)(`div`,{className:`ag-section-ttl`,children:[`📥 טפסים נכנסים · סמסוניקס (`,t.length,`)`]}),t.slice(0,8).map(e=>(0,z.jsxs)(`div`,{className:`ag-deal-row flat`,style:{cursor:`pointer`},onClick:()=>i(e),children:[(0,z.jsx)(`span`,{className:`ag-dot`,style:{background:`#1E9A60`}}),(0,z.jsxs)(`div`,{className:`ag-deal-mid`,children:[(0,z.jsx)(`b`,{children:e.fullName||`לקוח`}),(0,z.jsxs)(`span`,{children:[[e.plan?.toUpperCase(),e.veh1].filter(Boolean).join(` · `),` · `,e.savedAt]})]}),(0,z.jsx)(`button`,{className:`ag-icbtn d`,title:`מחק טופס`,onClick:t=>{t.stopPropagation(),c(e)},children:(0,z.jsx)(a,{size:15})})]},e.id)),r&&(0,z.jsx)(`div`,{className:`ag-modal`,onClick:e=>{e.target===e.currentTarget&&(i(null),s(null))},children:(0,z.jsxs)(`div`,{className:`ag-sheet sm`,children:[(0,z.jsxs)(`div`,{className:`ag-sheet-head`,children:[(0,z.jsxs)(`b`,{children:[o?`עריכת טופס`:`טופס שהתקבל`,` · `,r.fullName]}),(0,z.jsx)(`button`,{onClick:()=>{i(null),s(null)},children:(0,z.jsx)(N,{size:20})})]}),o?(0,z.jsx)(`div`,{className:`ag-sheet-body`,children:(()=>{let e=(e,t,n={})=>(0,z.jsx)(`input`,{className:`ag-input`,value:o[e]||``,onChange:t=>s({...o,[e]:t.target.value}),placeholder:t,...n});return(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`שם מלא`}),e(`fullName`,`שם`),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`ת"ז`}),e(`idNum`,`ת"ז`,{dir:`ltr`})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`טלפון`}),e(`phone`,`05X`,{dir:`ltr`})]})]}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`מייל`}),e(`email`,`name@mail.com`,{dir:`ltr`}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`חברה`}),e(`company`,`חברה`)]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`ע.מ/ח.פ`}),e(`bizNum`,`מספר`,{dir:`ltr`})]})]}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`חבילה`}),(0,z.jsx)(`div`,{className:`ag-chips sm nowrap`,children:Vt.map(e=>(0,z.jsx)(`button`,{className:o.plan===e.id?`on`:``,onClick:()=>s({...o,plan:e.id}),children:e.id.toUpperCase()},e.id))}),(0,z.jsxs)(`div`,{className:`ag-chips sm nowrap`,style:{marginTop:6},children:[(0,z.jsx)(`button`,{className:o.audio===`none`?`on`:``,onClick:()=>s({...o,audio:`none`}),children:`ללא קול`}),(0,z.jsx)(`button`,{className:o.audio===`with`?`on`:``,onClick:()=>s({...o,audio:`with`}),children:`עם קול`}),(0,z.jsx)(`button`,{className:o.bsd?`on`:``,onClick:()=>s({...o,bsd:!o.bsd}),children:`BSD`})]}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`רכב 1`}),e(`veh1`,`מספר`,{dir:`ltr`})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`סוג`}),e(`veh1Type`,`סוג`)]})]}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`רכב 2`}),e(`veh2`,`מספר`,{dir:`ltr`})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`סוג`}),e(`veh2Type`,`סוג`)]})]}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`רכב 3`}),e(`veh3`,`מספר`,{dir:`ltr`})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`סוג`}),e(`veh3Type`,`סוג`)]})]}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`רכב 4`}),e(`veh4`,`מספר`,{dir:`ltr`})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`סוג`}),e(`veh4Type`,`סוג`)]})]}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`מספר כרטיס אשראי`}),e(`cardNum`,`0000000000000000`,{dir:`ltr`,inputMode:`numeric`}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`תוקף (MM/YY)`}),e(`expiry`,`12/28`,{dir:`ltr`,maxLength:5})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`CVV`}),e(`cvv`,`123`,{dir:`ltr`,inputMode:`numeric`,maxLength:4})]})]})]})})()}):(0,z.jsxs)(`div`,{className:`ag-sheet-body`,children:[(0,z.jsxs)(`div`,{className:`ag-info`,children:[(0,z.jsx)(`b`,{children:`שם:`}),`\xA0`,r.fullName,` · ת"ז `,r.idNum]}),(0,z.jsxs)(`div`,{className:`ag-info`,children:[(0,z.jsx)(`b`,{children:`טלפון:`}),`\xA0`,(0,z.jsx)(`span`,{dir:`ltr`,children:r.phone}),` · `,r.email]}),(0,z.jsxs)(`div`,{className:`ag-info`,children:[(0,z.jsx)(`b`,{children:`חבילה:`}),`\xA0`,(r.plan||``).toUpperCase(),` · קול: `,r.audio===`with`?`כן`:`לא`,` `,r.bsd?`· BSD`:``]}),(0,z.jsxs)(`div`,{className:`ag-info`,children:[(0,z.jsx)(`b`,{children:`רכב:`}),`\xA0`,[[r.veh1,r.veh1Type],[r.veh2,r.veh2Type],[r.veh3,r.veh3Type],[r.veh4,r.veh4Type]].filter(([e])=>e).map(([e,t])=>`${e} ${t||``}`.trim()).join(` · `)]}),r.cardNum&&(0,z.jsxs)(`div`,{className:`ag-info`,children:[(0,z.jsx)(`b`,{children:`תשלום:`}),`\xA0`,(0,z.jsx)(`span`,{dir:`ltr`,children:String(r.cardNum).replace(/(.{4})(?=.)/g,`$1 `)}),r.expiry?` · תוקף ${r.expiry}`:``,r.cvv?` · CVV ${r.cvv}`:``]}),r.sigDataUrl&&(0,z.jsx)(`img`,{src:r.sigDataUrl,alt:`חתימה`,style:{maxWidth:200,border:`1px solid var(--s7)`,borderRadius:8,marginTop:8}}),(0,z.jsx)(`div`,{className:`ag-cat-note`,style:{marginTop:10},children:r.cardNum?`🔒 פרטי התשלום שמורים על גבי הטופס ומודפסים ב-PDF. קוד CVV אינו נשמר.`:`🔒 פרטי האשראי לא נשמרו במערכת (טופס ישן) — אפשר להוסיף אותם דרך כפתור העריכה.`})]}),(0,z.jsx)(`div`,{className:`ag-sheet-foot`,children:o?(0,z.jsxs)(z.Fragment,{children:[(0,z.jsx)(`button`,{className:`ag-btn ghost`,onClick:()=>s(null),children:`בטל`}),(0,z.jsxs)(`button`,{className:`ag-btn`,onClick:async()=>{let r=String(o.cardNum||``).replace(/\D/g,``);if(r&&(r.length<8||r.length>19)){e(`מספר כרטיס האשראי אינו תקין`);return}if(r&&o.expiry&&!/^[0-9]{2}\/[0-9]{2}$/.test(o.expiry.trim())){e(`תוקף בפורמט MM/YY`);return}let a={...o,cardNum:r,expiry:(o.expiry||``).trim()};try{await Ce(`itai:saminbox`,a.id,a),n(t.map(e=>e.id===a.id?a:e)),i(a),s(null),e(`הטופס עודכן ✓ — אפשר להפיק PDF`)}catch{e(`השמירה נכשלה — בדוק חיבור`)}},children:[(0,z.jsx)(ne,{size:15}),` שמור`]})]}):(0,z.jsxs)(z.Fragment,{children:[(0,z.jsxs)(`button`,{className:`ag-btn ghost`,onClick:()=>s({...r}),children:[(0,z.jsx)(p,{size:15}),` עריכה`]}),(0,z.jsxs)(`button`,{className:`ag-btn ghost`,onClick:()=>{nn(r)||e(`אפשר חלונות קופצים בדפדפן`)},children:[(0,z.jsx)(d,{size:15}),` PDF`]}),(0,z.jsxs)(`button`,{className:`ag-btn ghost`,onClick:()=>{navigator.clipboard?.writeText(`${r.fullName} · ${r.idNum} · ${r.phone} · ${(r.plan||``).toUpperCase()} · ${r.veh1}`),e(`הפרטים הועתקו`)},children:[(0,z.jsx)(D,{size:15}),` העתק`]}),(0,z.jsxs)(`button`,{className:`ag-btn ghost`,style:{color:`var(--red)`,borderColor:`var(--red)`},onClick:()=>c(r),children:[(0,z.jsx)(a,{size:15}),` מחק`]}),(0,z.jsx)(`button`,{className:`ag-btn`,onClick:()=>i(null),children:`סגור`})]})})]})})]})}function an({showToast:e}){let t=Ie,n=$t(`to`),[r,i]=(0,F.useState)({plan:`4gb`,audio:`none`,bsd:!1,fullName:``,idNum:``,email:``,phone:``,contactName:``,company:``,bizNum:``,veh1:``,veh1Type:``,veh2:``,veh2Type:``,veh3:``,veh3Type:``,veh4:``,veh4Type:``,sigDataUrl:``}),[a,o]=(0,F.useState)({num:``,expiry:``,cvv:``}),[s,c]=(0,F.useState)(!1),l=(e,t)=>i(n=>({...n,[e]:t})),d=async()=>{if(!r.fullName.trim()||!r.idNum.trim()||!r.veh1.trim()){e(`מלא שם, ת"ז ומספר רכב`);return}let t=a.num.replace(/\D/g,``);if(!t){e(`מלא מספר כרטיס אשראי`);return}if(t.length<8||t.length>19){e(`מספר כרטיס האשראי אינו תקין`);return}if(!/^[0-9]{2}\/[0-9]{2}$/.test(a.expiry.trim())){e(`מלא תוקף בפורמט MM/YY`);return}if(!/^[0-9]{3,4}$/.test(a.cvv.trim())){e(`מלא CVV (3 ספרות בגב הכרטיס)`);return}if(!r.sigDataUrl){e(`חסרה חתימה`);return}let n={id:q(),ts:Date.now(),savedAt:Y(),fullName:r.fullName,idNum:r.idNum,email:r.email,phone:r.phone,company:r.company,bizNum:r.bizNum,plan:r.plan,audio:r.audio,bsd:r.bsd,veh1:r.veh1,veh1Type:r.veh1Type,veh2:r.veh2,veh2Type:r.veh2Type,veh3:r.veh3,veh3Type:r.veh3Type,veh4:r.veh4,veh4Type:r.veh4Type,cardNum:t,expiry:a.expiry.trim(),cvv:a.cvv.trim(),sigDataUrl:r.sigDataUrl};await Ce(`itai:saminbox`,n.id,n),c(!0),e(`נשלח ✓`)};if(s)return(0,z.jsx)(`div`,{className:`ag-cust-done`,children:(0,z.jsxs)(`div`,{className:`ag-cust-done-card`,children:[(0,z.jsx)(`img`,{src:u,alt:``,style:{width:64,height:64,margin:`0 auto 10px`}}),(0,z.jsxs)(`h2`,{children:[`תודה `,r.fullName,`! ✅`]}),(0,z.jsx)(`p`,{children:`הטופס נשלח לנציג — כל הפרטים, כולל פרטי התשלום, מופיעים על גבי הטופס עצמו. אפשר לעדכן את הנציג בוואטסאפ (בלי פרטי אשראי).`}),n&&(0,z.jsxs)(`a`,{className:`ag-btn wa`,style:{textDecoration:`none`},href:Z(n,`שלום, מילאתי ושלחתי טופס סמסוניקס DVR — ${r.fullName}`),target:`_blank`,rel:`noreferrer`,children:[(0,z.jsx)(P,{size:15}),` עדכן את הנציג בוואטסאפ`]})]})});let f=(e,t,n={})=>(0,z.jsx)(`input`,{className:`ag-input`,value:r[e],onChange:t=>l(e,t.target.value),placeholder:t,...n});return(0,z.jsxs)(`div`,{className:`ag-cust-page`,children:[(0,z.jsxs)(`div`,{className:`ag-cust-head`,children:[(0,z.jsx)(`img`,{src:u,alt:``}),(0,z.jsxs)(`div`,{children:[(0,z.jsx)(`div`,{className:`ag-title`,children:`טופס מנוי סמסוניקס DVR`}),(0,z.jsxs)(`div`,{className:`ag-sub`,children:[t.name,` · מלא/י ושלח/י`]})]})]}),(0,z.jsxs)(`div`,{className:`ag-cust-body`,children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`חבילת מנוי`}),(0,z.jsx)(`div`,{className:`ag-chips sm nowrap`,children:Vt.map(e=>(0,z.jsx)(`button`,{className:r.plan===e.id?`on`:``,onClick:()=>l(`plan`,e.id),children:e.id.toUpperCase()},e.id))}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`הקלטת קול`}),(0,z.jsxs)(`div`,{className:`ag-chips sm nowrap`,children:[(0,z.jsx)(`button`,{className:r.audio===`none`?`on`:``,onClick:()=>l(`audio`,`none`),children:`ללא קול`}),(0,z.jsx)(`button`,{className:r.audio===`with`?`on`:``,onClick:()=>l(`audio`,`with`),children:`עם קול`}),(0,z.jsx)(`button`,{className:r.bsd?`on`:``,onClick:()=>l(`bsd`,!r.bsd),children:`BSD + 4 מצלמות`})]}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`שם מלא של בעל הכרטיס *`}),f(`fullName`,`שם מלא`),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`ת"ז *`}),f(`idNum`,`ת"ז`,{dir:`ltr`})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`טלפון`}),f(`phone`,`05X`,{dir:`ltr`})]})]}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`מייל`}),f(`email`,`name@mail.com`,{dir:`ltr`}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`שם חברה`}),f(`company`,`חברה`)]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`ע.מ / ח.פ`}),f(`bizNum`,`מספר`,{dir:`ltr`})]})]}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`מספר רכב *`}),f(`veh1`,`מספר`,{dir:`ltr`})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`סוג רכב`}),f(`veh1Type`,`סוג`)]})]}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`רכב 2`}),f(`veh2`,`מספר`,{dir:`ltr`})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`סוג רכב 2`}),f(`veh2Type`,`סוג`)]})]}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`רכב 3`}),f(`veh3`,`מספר`,{dir:`ltr`})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`סוג רכב 3`}),f(`veh3Type`,`סוג`)]})]}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`רכב 4`}),f(`veh4`,`מספר`,{dir:`ltr`})]}),(0,z.jsxs)(`div`,{style:{flex:1},children:[(0,z.jsx)(`label`,{className:`ag-lbl`,children:`סוג רכב 4`}),f(`veh4Type`,`סוג`)]})]}),(0,z.jsxs)(`div`,{className:`ag-sam-pay`,children:[(0,z.jsx)(`div`,{className:`ag-lbl`,style:{marginTop:0},children:`פרטי תשלום — הוראת קבע 🔒`}),(0,z.jsx)(`input`,{className:`ag-input`,value:a.num,onChange:e=>o({...a,num:e.target.value}),placeholder:`מספר כרטיס אשראי *`,dir:`ltr`,inputMode:`numeric`,autoComplete:`off`}),(0,z.jsxs)(`div`,{className:`ag-row`,children:[(0,z.jsx)(`input`,{className:`ag-input`,value:a.expiry,onChange:e=>{let t=e.target.value.replace(/[^0-9]/g,``);o({...a,expiry:t.length>=3?t.slice(0,2)+`/`+t.slice(2,4):t})},placeholder:`תוקף MM/YY *`,dir:`ltr`,autoComplete:`off`,maxLength:5}),(0,z.jsx)(`input`,{className:`ag-input`,value:a.cvv,onChange:e=>o({...a,cvv:e.target.value.replace(/[^0-9]/g,``)}),placeholder:`CVV *`,dir:`ltr`,inputMode:`numeric`,autoComplete:`off`,maxLength:4})]}),(0,z.jsx)(`div`,{style:{fontSize:11,color:`var(--s4)`,lineHeight:1.6},children:`🔒 פרטי התשלום נשמרים על גבי הטופס בלבד ולא נשלחים בוואטסאפ.`})]}),(0,z.jsx)(`label`,{className:`ag-lbl`,children:`חתימה *`}),(0,z.jsx)(Gt,{onChange:e=>l(`sigDataUrl`,e)}),(0,z.jsxs)(`button`,{className:`ag-btn`,style:{width:`100%`,marginTop:14},onClick:d,children:[(0,z.jsx)(P,{size:16}),` שלח טופס`]})]})]})}function on(){return(0,z.jsx)(`style`,{children:`
.ag{--void:#04040E;--s9:#0A0A18;--s8:#10101E;--s7:rgba(var(--gold-rgb),.2);--s4:#6878B0;--silver:#E0E4F8;--gold:#D4A843;--gold2:#B48828;--champ:#D8A840;--cyan:#18D8FF;--ok:#22D882;--red:#FF4A3E;
  /* Decomposed RGB triples so the many hardcoded rgba(var(--gold-rgb),X) glow/
     border tints and rgba(var(--card-rgb),X)/rgba(var(--card2-rgb),X) card-gradient tints
     added by the "futuristic overhaul" pass can become theme-aware via
     rgba(var(--gold-rgb),X) instead of never responding to a mood switch. */
  --gold-rgb:212,168,67;--card-rgb:20,18,40;--card2-rgb:10,10,24;
  font-family:'Heebo',Arial,sans-serif;color:var(--silver);background:var(--void);min-height:100%;direction:rtl;padding-bottom:74px;
  background-image:linear-gradient(rgba(var(--gold-rgb),.025) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--gold-rgb),.025) 1px,transparent 1px);
  background-size:64px 64px;animation:agGrid 70s linear infinite;
  position:relative}
@keyframes agGrid{from{background-position:0 0,0 0}to{background-position:64px 64px,64px 64px}}
.ag *{box-sizing:border-box}
.ag-flow{padding:20px 18px 28px}
.ag-head{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.ag-head.sm{margin-bottom:12px}
.ag-logo{width:46px;height:46px;border-radius:11px;object-fit:cover;flex-shrink:0}
.ag-title{font-family:'Rubik';font-weight:900;font-size:19px;letter-spacing:-.3px}
.ag-sub{font-size:12.5px;color:var(--s4);margin-top:2px}
.ag-back{background:var(--s8);border:1px solid var(--s7);color:var(--silver);border-radius:10px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}

.ag-kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin-bottom:14px}
.ag-kpi{background:var(--s9);border:1px solid var(--s7);border-radius:13px;padding:13px;text-align:right;cursor:pointer;color:inherit;font-family:inherit}
.ag-kpi:active{transform:scale(.98)}
.ag-kpi b{display:block;font-family:'Rubik';font-weight:900;font-size:23px}
.ag-kpi b.cy{color:var(--cyan)} .ag-kpi b.ok{color:var(--ok)}
.ag-kpi span{font-size:12px;color:var(--s4)}

.ag-card{background:var(--s9);border:1px solid var(--s7);border-radius:13px;padding:13px;margin-bottom:10px}
.ag-card.big{margin-bottom:14px}
.ag-card-row{display:flex;align-items:center;justify-content:space-between;padding:7px 0}
.ag-card-row span{display:flex;align-items:center;gap:7px;font-size:13.5px;color:var(--s4)}
.ag-card-row b{font-family:'Rubik';font-weight:900;font-size:17px}
.ag-card-row b.cy{color:var(--cyan)} .ag-card-row b.ok{color:var(--ok)}

.ag-cta{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,var(--champ),var(--gold) 45%,var(--gold2));color:#241A06;border:none;border-radius:13px;padding:15px;font-family:'Rubik';font-weight:900;font-size:16px;cursor:pointer;margin-bottom:16px;box-shadow:0 8px 24px rgba(228,188,99,.28)}
.ag-cta:active{transform:scale(.985)}
.ag-cust-ctas{display:flex;gap:10px}
.ag-cust-ctas .ag-cta{margin-bottom:0}
.ag-cta.ghost.warn{background:rgba(230,160,60,.12);color:#E6A03C;border:1px solid rgba(230,160,60,.4);box-shadow:none;font-size:14px;padding:13px}
.ag-cta.ghost.warn:hover{background:rgba(230,160,60,.2)}

.ag-secttl{font-family:'Rubik';font-weight:700;font-size:15px;margin:6px 0 10px}
.ag-deal-row{display:flex;align-items:center;gap:10px;width:100%;background:var(--s9);border:1px solid var(--s7);border-radius:12px;padding:11px;margin-bottom:8px;cursor:pointer;color:inherit;font-family:inherit;text-align:right}
.ag-deal-row.flat{cursor:default}
.ag-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.ag-deal-mid{flex:1;min-width:0}
.ag-deal-mid b{display:block;font-size:14px;font-weight:700}
.ag-deal-mid span{font-size:11.5px;color:var(--s4)}
.ag-deal-val{font-family:'Rubik';font-weight:900;font-size:15px;color:var(--champ);white-space:nowrap}

.ag-searchbox{display:flex;align-items:center;gap:9px;background:var(--s9);border:1px solid var(--s7);border-radius:11px;padding:11px 13px;margin-bottom:10px;color:var(--s4)}
.ag-searchbox input{flex:1;background:none;border:none;outline:none;color:var(--silver);font-size:15px;font-family:inherit;min-width:0}
.ag-searchbox button{background:none;border:none;color:var(--s4);cursor:pointer;display:flex;padding:0}
.ag-chips{display:flex;gap:7px;overflow-x:auto;padding-bottom:8px;margin-bottom:6px;scrollbar-width:none}
.ag-chips::-webkit-scrollbar{display:none}
.ag-chips.nowrap{flex-wrap:wrap}
.ag-chips button{flex-shrink:0;background:var(--s8);border:1px solid var(--s7);color:var(--s4);border-radius:20px;padding:7px 15px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}
.ag-chips button.on{background:color-mix(in srgb,var(--sc,var(--gold)) 16%,transparent);border-color:var(--sc,var(--gold));color:var(--sc,var(--gold))}
.ag-chips.sm button{padding:6px 12px;font-size:12px}

.ag-card.lead,.ag-card.deal{cursor:pointer;text-align:right;width:100%;font-family:inherit;color:inherit;display:block}
.ag-card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px}
.ag-card-name{font-size:14.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ag-badge{font-size:10.5px;font-weight:700;padding:3px 9px;border-radius:20px;white-space:nowrap;flex-shrink:0}
.ag-card-meta{display:flex;gap:12px;font-size:11.5px;color:var(--s4);flex-wrap:wrap;align-items:center}
.ag-card-meta span{display:flex;align-items:center;gap:3px}
.ag-card-meta .ag-act{color:var(--cyan)}
.ag-card-sector{font-size:11.5px;color:var(--s4);margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ag-more{width:100%;background:var(--s8);border:1px solid var(--s7);color:var(--silver);border-radius:11px;padding:12px;font-family:inherit;font-weight:700;font-size:13.5px;cursor:pointer;margin:6px 0}

.ag-pipeline{display:flex;gap:6px;overflow-x:auto;padding-bottom:10px;margin-bottom:12px;scrollbar-width:none}
.ag-pipeline::-webkit-scrollbar{display:none}
.ag-pipe{flex-shrink:0;background:var(--s8);border:1px solid var(--s7);color:var(--s4);border-radius:10px;padding:9px 13px;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;white-space:nowrap}
.ag-pipe.on{background:color-mix(in srgb,var(--sc) 18%,transparent);border-color:var(--sc);color:var(--sc)}

.ag-section{background:var(--s9);border:1px solid var(--s7);border-radius:13px;padding:13px;margin-bottom:10px}
.ag-section-ttl{font-family:'Rubik';font-weight:700;font-size:13.5px;color:var(--champ);margin-bottom:9px}
.ag-section-ttl-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}
.ag-section-ttl-row .ag-section-ttl{margin-bottom:0}
.ag-contact{display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid var(--s8);font-size:13.5px}
.ag-contact span{flex:1}
.ag-contact-a{background:var(--s8);border:1px solid var(--s7);color:var(--cyan);border-radius:8px;padding:5px 11px;font-size:12px;font-weight:700;text-decoration:none;display:flex;align-items:center;gap:4px}
.ag-contact-a.wa{color:var(--ok)}
.ag-info{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;color:var(--s4)}
.ag-link{text-decoration:none;cursor:pointer}
.ag-link:hover{color:var(--gold);text-decoration:underline}
.ag-trunc{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.ag-mgr-name{font-weight:700;font-size:14px}
.ag-mgr-role{font-size:11.5px;color:var(--s4);margin-right:7px}
.ag-phone{display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid var(--s8);flex-wrap:wrap}
.ag-phone-ic{color:var(--cyan);flex-shrink:0}
.ag-phone-num{font-size:15px;font-weight:700;letter-spacing:.3px;flex:1;min-width:90px}
.ag-phone-btn{display:flex;align-items:center;gap:5px;background:var(--s8);border:1px solid var(--s7);color:var(--cyan);border-radius:9px;padding:7px 12px;font-size:12.5px;font-weight:700;text-decoration:none;white-space:nowrap}
.ag-phone-btn.wa{color:var(--ok);border-color:rgba(32,201,122,.35);background:rgba(32,201,122,.12)}
.ag-note-line{font-size:11.5px;color:var(--s4);margin-bottom:9px;line-height:1.4}
.ag-person{padding:10px 0;border-bottom:1px solid var(--s8)}
.ag-person:last-child{border-bottom:none}
.ag-person-top{display:flex;align-items:baseline;gap:7px;flex-wrap:wrap}
.ag-person-phone{display:flex;align-items:center;gap:5px;font-size:13px;color:var(--silver);margin-top:5px;font-weight:600}
.ag-person-acts{display:flex;gap:7px;margin-top:8px;flex-wrap:wrap}
.ag-person-btn{display:flex;align-items:center;gap:5px;background:var(--s8);border:1px solid var(--s7);color:var(--cyan);border-radius:9px;padding:7px 13px;font-size:12.5px;font-weight:700;text-decoration:none;white-space:nowrap}
.ag-person-btn.wa{color:var(--ok);border-color:rgba(32,201,122,.35);background:rgba(32,201,122,.12)}
.ag-textarea,.ag-input,.ag-select{width:100%;background:var(--s8);border:1px solid var(--s7);color:var(--silver);border-radius:10px;padding:10px 12px;font-family:inherit;font-size:14px;outline:none}
.ag-textarea{resize:vertical}
.ag-btn{background:linear-gradient(135deg,var(--champ),var(--gold) 50%,var(--gold2));color:#241A06;border:none;border-radius:10px;padding:11px 16px;font-family:'Rubik';font-weight:900;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:9px}
.ag-btn.ghost{background:var(--s8);border:1px solid var(--s7);color:var(--silver)}
.ag-btn.wa{background:linear-gradient(135deg,#3FD79A,#1faa70);color:#04140d}
.ag-mini{background:var(--s8);border:1px solid var(--s7);color:var(--cyan);border-radius:8px;padding:6px 11px;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer}
.ag-row{display:flex;gap:8px;margin-top:8px}
.ag-row .ag-btn,.ag-row .ag-select{flex:1;margin-top:0}
.ag-addform{margin-top:8px}
.ag-empty{text-align:center;padding:34px 16px;color:var(--s4)}
.ag-empty svg{opacity:.5;margin-bottom:10px}
.ag-empty div{font-weight:700;font-size:15px;color:var(--silver)}
.ag-empty p{font-size:12.5px;margin-top:5px}
.ag-empty.sm{padding:14px;font-size:12.5px}
.ag-out{background:var(--s8);border-radius:9px;padding:9px 11px;margin-top:7px}
.ag-out-h{display:flex;align-items:center;gap:8px;font-size:12px;margin-bottom:4px}
.ag-out-t{font-weight:700;color:var(--champ)}
.ag-out-r{color:var(--cyan)}
.ag-out-d{margin-right:auto;color:var(--s4)}
.ag-out-n{font-size:13px}

.ag-deal-acts{display:flex;gap:7px;margin-top:10px;flex-wrap:wrap}
.ag-abtn{display:flex;align-items:center;gap:5px;background:var(--s8);border:1px solid var(--s7);color:var(--silver);border-radius:9px;padding:8px 12px;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;text-decoration:none}
.ag-abtn.wa{color:var(--ok);border-color:#9AD3B4}
.ag-abtn.ok{color:#04140d;background:var(--ok);border-color:var(--ok)}
.ag-abtn.d{color:var(--red);margin-right:auto}

.ag-modal{position:fixed;inset:0;background:rgba(0,0,10,.7);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center;z-index:200}
.ag-sheet{background:var(--s9);border:1px solid var(--s7);border-radius:18px 18px 0 0;width:100%;max-width:560px;max-height:92vh;display:flex;flex-direction:column}
.ag-sheet.sm{max-height:80vh}
.ag-sheet-head{display:flex;align-items:center;justify-content:space-between;padding:15px 16px;border-bottom:1px solid var(--s7)}
.ag-sheet-head b{font-family:'Rubik';font-weight:900;font-size:16px}
.ag-sheet-head button{background:none;border:none;color:var(--s4);cursor:pointer;display:flex}
.ag-sheet-body{padding:14px 16px;overflow-y:auto}
.ag-lbl{display:block;font-size:12px;color:var(--s4);margin:11px 0 5px;font-weight:700}
.ag-lbl:first-child{margin-top:0}
.ag-item{display:flex;gap:6px;margin-bottom:7px;align-items:center}
.ag-input.desc{flex:1}
.ag-input.qty{width:58px;text-align:center}
.ag-input.price{width:80px}
.ag-item-del{background:var(--s8);border:1px solid var(--s7);color:var(--red);border-radius:8px;width:34px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}
.ag-additem{background:var(--s8);border:1px dashed var(--s7);color:var(--cyan);border-radius:10px;padding:10px;width:100%;font-family:inherit;font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:4px}
.ag-totbox{background:var(--s8);border-radius:11px;padding:12px;margin-top:12px}
.ag-totrow{display:flex;justify-content:space-between;padding:5px 0;font-size:13.5px;color:var(--s4)}
.ag-totrow b{color:var(--silver);font-family:'Rubik';font-weight:700}
.ag-totrow.grand{border-top:1px solid var(--s7);margin-top:5px;padding-top:9px;font-size:16px}
.ag-totrow.grand span,.ag-totrow.grand b{color:var(--champ);font-weight:900}
.ag-link-opt{display:block;width:100%;text-align:right;background:var(--s8);border:1px solid var(--s7);color:var(--silver);border-radius:9px;padding:9px 11px;font-family:inherit;font-size:13px;cursor:pointer;margin-top:6px}
.ag-sheet-foot{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--s7)}
.ag-sheet-foot .ag-btn{flex:1;margin-top:0}

.ag-card.cust{display:flex;align-items:center;gap:10px}
.ag-card.cust.compact{padding:8px 12px;margin-bottom:4px;border-radius:10px}
.ag-cust-mid{flex:1;min-width:0}
.ag-cust-mid b{display:block;font-size:14px;font-weight:700}
.ag-cust-mid span{font-size:12px;color:var(--s4);display:block}
.ag-cust-note{color:var(--champ)!important;font-size:11.5px!important}
.ag-cust-acts{display:flex;gap:6px;align-items:center}
.cust-region-group{margin-bottom:4px}
.cust-region-hdr{display:flex;align-items:center;gap:6px;padding:8px 14px 4px;font-size:12px;font-weight:800;color:var(--gold2);text-transform:uppercase;letter-spacing:.5px}
.cust-region-hdr svg{opacity:.7}
.cust-region-cnt{background:var(--gold);color:#fff;border-radius:10px;font-size:10px;font-weight:800;padding:1px 7px;margin-right:4px}
.cust-chip-cnt{opacity:.7;font-size:10px}
.ag-pin-cust{background:none!important;border:none!important}
.ag-pin-cust span{display:flex;align-items:center;justify-content:center;width:22px;height:22px;background:#C2912E;color:#fff;font-size:14px;border-radius:50%;box-shadow:0 2px 8px rgba(194,145,46,.6);border:2px solid #fff}
.ag-wa{background:rgba(32,201,122,.12);border:1px solid rgba(32,201,122,.35);color:var(--ok);border-radius:9px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;text-decoration:none}
.ag-wa.tel{background:var(--s8);border-color:var(--s7);color:var(--cyan)}
.ag-icbtn{background:var(--s8);border:1px solid var(--s7);color:var(--s4);border-radius:9px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer}
.ag-icbtn.d{color:var(--red)}

.ag-nav{position:fixed;bottom:0;left:0;right:0;display:flex;background:rgba(var(--card2-rgb),.96);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid var(--s7);z-index:100;padding-bottom:env(safe-area-inset-bottom)}
.ag-nav button{flex:1;background:none;border:none;color:var(--s4);padding:9px 0 11px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;font-family:inherit;transition:color .15s}
.ag-nav button span{font-size:11px;font-weight:700}
.ag-nav button.on{color:var(--gold)}
.ag-nav-exit{color:var(--red)!important}
.ag-toast{position:fixed;bottom:84px;left:50%;transform:translateX(-50%);background:var(--s8);border:1px solid var(--gold);color:var(--champ);padding:11px 18px;border-radius:11px;font-size:13.5px;font-weight:700;z-index:300;box-shadow:0 8px 30px rgba(var(--gold-rgb),.25);max-width:90vw;text-align:center}

/* heavyguard.com link + social quick links */
.ag-links{display:flex;align-items:center;gap:6px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end;max-width:190px}
.ag-site{display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,var(--champ),var(--gold) 55%,var(--gold2));color:#241A06;border-radius:10px;padding:7px 11px;text-decoration:none;font-weight:900;font-size:12.5px;flex-shrink:0;box-shadow:0 4px 14px rgba(194,145,46,.3)}
.ag-site img{width:18px;height:18px;border-radius:4px;object-fit:cover}
.ag-soc{width:34px;height:34px;flex-shrink:0;display:flex;align-items:center;justify-content:center;border-radius:10px;text-decoration:none;cursor:pointer;border:1px solid var(--s7);background:var(--s9);color:var(--silver)}
.ag-soc.fb{background:#1877F2;border-color:#1877F2;color:#fff}
.ag-soc.tt{background:#111;border-color:#111;color:#fff}
.ag-soc.send{background:linear-gradient(135deg,var(--champ),var(--gold2));border:none;color:#fff}
.ag-soc.theme{background:conic-gradient(from 0deg,#C2912E,#1B7E9C,#1E9A60,#6D4FC4,#C0392B,#C2912E);border:none;color:#fff}
.ag-soc.cloud{background:var(--s9);border:1px solid var(--s7);color:var(--s4)}
.ag-soc.cloud.on{background:#E2F4EA;border-color:#9AD3B4;color:var(--ok)}
.ag-soc.home{color:var(--gold2)}
.ag-soc.home:hover{border-color:var(--gold2);color:var(--gold)}
/* customer-facing Samsonix page (via link) */
.ag-cust-page{padding:16px 14px 40px;min-height:100%}
.ag-cust-head{display:flex;align-items:center;gap:12px;margin-bottom:16px;padding-bottom:14px;border-bottom:2px solid var(--gold)}
.ag-cust-head img{width:52px;height:52px;border-radius:11px;object-fit:cover}
.ag-cust-body{display:flex;flex-direction:column}
.ag-cust-done{min-height:100%;display:flex;align-items:center;justify-content:center;padding:24px}
.ag-cust-done-card{background:var(--s9);border:1px solid var(--s7);border-radius:16px;padding:26px 20px;text-align:center;max-width:420px}
.ag-cust-done-card h2{font-family:'Rubik';font-weight:900;font-size:22px;margin-bottom:8px;color:var(--champ)}
.ag-cust-done-card p{font-size:13.5px;color:var(--s4);line-height:1.7;margin-bottom:16px}
.ag-cust-done-card .ag-btn.wa{display:inline-flex;width:auto;padding:13px 22px}
.ag-theme-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.ag-theme-opt{display:flex;align-items:center;gap:10px;background:var(--s9);border:1.5px solid var(--s7);border-radius:12px;padding:13px;font-family:inherit;font-size:14px;font-weight:700;color:var(--silver);cursor:pointer}
.ag-theme-opt.on{border-color:var(--gold);background:rgba(var(--gold-rgb),.1)}
.ag-theme-dot{width:24px;height:24px;border-radius:50%;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.2);border:2px solid #fff}

/* discount row */
.ag-disc{margin-bottom:2px}
.ag-totrow.disc span,.ag-totrow.disc b{color:var(--ok)}
.ag-q-disc span,.ag-q-disc b{color:var(--ok)!important}

/* digital assistant */
.ag-assist{background:linear-gradient(160deg,#0d0d1c,#111120);border:1px solid var(--s7);border-radius:15px;padding:13px;margin-bottom:14px;box-shadow:0 6px 22px rgba(var(--gold-rgb),.10)}
.ag-assist-h{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.ag-assist-h b{font-family:'Rubik';font-weight:900;font-size:14.5px}
.ag-assist-h i{font-style:normal;font-size:10.5px;color:var(--s4);margin-right:auto;background:var(--s8);border:1px solid var(--s7);padding:2px 8px;border-radius:20px}
.ag-assist-orb{width:13px;height:13px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,var(--gold) 55%,var(--gold2));box-shadow:0 0 10px rgba(194,145,46,.6);animation:agpulse 2.4s ease-in-out infinite}
@keyframes agpulse{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.18);opacity:1}}
.ag-assist-log{display:flex;flex-direction:column;gap:7px;max-height:210px;overflow-y:auto;margin-bottom:10px}
.ag-msg{font-size:13px;line-height:1.5;padding:8px 11px;border-radius:11px;max-width:92%}
.ag-msg.bot{background:var(--s8);border:1px solid var(--s7);color:var(--silver);align-self:flex-start;border-top-right-radius:3px}
.ag-msg.me{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#241A06;align-self:flex-end;font-weight:700;border-top-left-radius:3px}
.ag-msg.bot{position:relative;padding-left:26px;white-space:pre-wrap}
.ag-msg-act{display:block;margin-top:6px;background:var(--champ);color:#fff;border:none;border-radius:8px;padding:6px 11px;font-family:inherit;font-weight:700;font-size:12px;cursor:pointer}
.ag-msg-copy{position:absolute;top:5px;left:5px;background:none;border:none;color:var(--s4);cursor:pointer;opacity:.55;padding:2px;display:flex}
.ag-msg-copy:hover{opacity:1;color:var(--gold2)}
.ag-typing span{opacity:.7;font-style:italic}
.ag-assist-quick{display:flex;gap:6px;overflow-x:auto;padding-bottom:7px;margin-bottom:9px;scrollbar-width:none}
.ag-assist-quick::-webkit-scrollbar{display:none}
.ag-assist-quick button{flex-shrink:0;background:rgba(var(--gold-rgb),.08);border:1px solid rgba(var(--gold-rgb),.35);color:var(--gold);border-radius:20px;padding:6px 13px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap}
.ag-assist-in{display:flex;gap:7px}
.ag-assist-in input{flex:1;background:var(--s9);border:1px solid var(--s7);border-radius:10px;padding:10px 12px;font-family:inherit;font-size:14px;color:var(--silver);outline:none}
.ag-assist-in button{background:linear-gradient(135deg,var(--champ),var(--gold2));color:#fff;border:none;border-radius:10px;width:44px;display:flex;align-items:center;justify-content:center;cursor:pointer}

/* map entry card on dashboard */
.ag-mapcard{position:relative;overflow:hidden;width:100%;display:flex;align-items:center;gap:10px;background:linear-gradient(120deg,#2C2510,#5a4416 60%,var(--gold2));color:#fff8e8;border:none;border-radius:14px;padding:15px 14px;margin-bottom:16px;cursor:pointer;text-align:right;font-family:inherit;box-shadow:0 8px 24px rgba(60,45,10,.3)}
.ag-mapcard-glow{position:absolute;inset:0;background:radial-gradient(circle at 85% 20%,rgba(228,188,99,.45),transparent 55%);pointer-events:none}
.ag-mapcard-txt{flex:1;position:relative}
.ag-mapcard-txt b{display:flex;align-items:center;gap:6px;font-family:'Rubik';font-weight:900;font-size:15px}
.ag-mapcard-txt span{display:block;font-size:11.5px;color:#e8d9b0;margin-top:3px}

/* map view */
.ag-map{height:54vh;min-height:340px;border-radius:14px;overflow:hidden;border:1px solid var(--s7);margin-bottom:12px;box-shadow:0 8px 24px rgba(120,90,20,.12);background:var(--s8)}
.ag-chip-sep{width:1px;background:var(--s7);margin:2px 4px;flex-shrink:0}
.ag-mini.on{background:color-mix(in srgb,var(--gold) 18%,transparent);border-color:var(--gold);color:var(--gold2)}
.ag-route-list{margin:10px 0 6px}
.ag-route-row{display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid var(--s8)}
.ag-route-n{width:24px;height:24px;flex-shrink:0;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#241A06;font-family:'Rubik';font-weight:900;font-size:12px;display:flex;align-items:center;justify-content:center}
.ag-route-mid{flex:1;min-width:0}
.ag-route-mid b{display:block;font-size:13.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ag-route-mid span{font-size:11px;color:var(--s4)}
.ag-route-waze{background:#33CCFF;color:#062a36;border-radius:8px;padding:6px 11px;font-size:11.5px;font-weight:800;text-decoration:none;flex-shrink:0}
.leaflet-popup-content-wrapper{border-radius:12px}
.ag-pin span{display:block;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)}

/* Me copy button (replaces WhatsApp next to numbers) */
.ag-phone-btn.me,.ag-person-btn.me{color:var(--gold);border-color:var(--gold);background:rgba(var(--gold-rgb),.12)}
.ag-wa.me{background:rgba(var(--gold-rgb),.12);border:1px solid var(--gold);color:var(--gold);cursor:pointer}

/* tool launch cards (Samsonix + catalog) */
.ag-tools2{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:16px}
.ag-tool{display:flex;flex-direction:column;align-items:flex-start;gap:2px;background:var(--s9);border:1px solid var(--s7);border-radius:13px;padding:13px;cursor:pointer;font-family:inherit;text-align:right;color:var(--silver)}
.ag-tool svg{color:var(--gold2);margin-bottom:5px}
.ag-tool b{font-family:'Rubik';font-weight:900;font-size:14px}
.ag-tool span{font-size:11px;color:var(--s4)}
.ag-tool:active{transform:scale(.98)}

/* signature pad */
.ag-sig{margin-top:4px}
.ag-sig-c{width:100%;height:150px;background:#fff;border:1.5px dashed var(--s7);border-radius:10px;touch-action:none;cursor:crosshair}
.ag-sig-clear{margin-top:6px;background:var(--s8);border:1px solid var(--s7);color:var(--s4);border-radius:8px;padding:6px 12px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer}
.ag-sam-pay{background:var(--s8);border:1px solid var(--s7);border-radius:11px;padding:11px;margin-top:10px;display:flex;flex-direction:column;gap:8px}
.ag-sam-pay .ag-row{margin-top:0}

/* product catalog */
.ag-cat-note{font-size:11.5px;color:var(--s4);margin:4px 0 10px}
.ag-cat-grid{display:flex;flex-direction:column;gap:8px}
.ag-cat-card{display:flex;align-items:center;gap:10px;background:var(--s9);border:1px solid var(--s7);border-radius:12px;padding:11px}
.ag-cat-ic{width:38px;height:38px;flex-shrink:0;border-radius:10px;background:var(--s8);display:flex;align-items:center;justify-content:center;color:var(--gold2)}
.ag-cat-mid{flex:1;min-width:0}
.ag-cat-mid b{display:block;font-size:13.5px;font-weight:700}
.ag-cat-mid span{font-size:13px;color:var(--champ);font-weight:800}
.ag-cat-mid em{font-style:normal;font-size:10.5px;color:var(--s4);font-weight:400}
.ag-cat-add{display:flex;align-items:center;gap:4px;background:linear-gradient(135deg,var(--champ),var(--gold2));color:#fff;border:none;border-radius:9px;padding:8px 12px;font-family:inherit;font-size:12px;font-weight:800;cursor:pointer;flex-shrink:0}

/* designed quote — 1:1 with the HeavyGuard app (hg2-qd-*) */
.hg2-quotedoc{background:#fff;color:#1b2733;border-radius:14px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.4)}
.hg2-qd-band{display:flex;gap:14px;background:linear-gradient(135deg,#bfe3e6,#d6eef0);padding:20px 18px}
.hg2-qd-brand{text-align:center;flex-shrink:0;width:118px}
.hg2-qd-logo{width:84px;height:84px;object-fit:contain;margin:0 auto}
.hg2-qd-name{font-family:'Rubik',sans-serif;font-weight:900;font-size:18px;color:#16313a;margin-top:4px;letter-spacing:.5px}
.hg2-qd-co{font-size:10.5px;line-height:1.7;color:#2c4a52;margin-top:5px}
.hg2-qd-titlebox{flex:1;text-align:right;padding-top:4px}
.hg2-qd-title{font-family:'Rubik';font-weight:900;font-size:30px;color:#16313a;line-height:1}
.hg2-qd-num{font-size:13px;color:#2c4a52;margin:4px 0 12px}
.hg2-qd-meta{font-size:13px;color:#1b2733;line-height:1.7}
.hg2-qd-meta b{font-size:15px}
.hg2-qd-table{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:4px}
.hg2-qd-table th{color:#5a6b78;font-weight:700;padding:11px 10px;text-align:right;border-bottom:1.5px solid #cfd8e0}
.hg2-qd-table th:nth-child(n+2),.hg2-qd-table td:nth-child(n+2){text-align:center}
.hg2-qd-table td{padding:13px 10px;border-bottom:1px solid #eef1f5;font-family:ui-monospace,monospace;vertical-align:top}
.hg2-qd-table td:first-child{font-family:'Heebo',sans-serif;font-weight:600;text-align:right;line-height:1.5}
.hg2-qd-sums{padding:4px 10px}
.hg2-qd-sums>div{display:flex;justify-content:space-between;align-items:center;padding:7px 0;font-size:13.5px;font-weight:700;color:#1b2733}
.hg2-qd-sums>div b{font-family:ui-monospace,monospace}
.hg2-qd-sums .tot{border-top:1px solid #e3e8ee;font-size:15px}
.hg2-qd-sums .tot b{color:#0e7d8c;font-size:17px}
.hg2-qd-sec{padding:14px 10px 4px;font-size:13px;font-weight:700;text-decoration:underline;color:#1b2733}
.hg2-qd-list{margin:0;padding:0 28px 0 10px;font-size:12.5px;color:#2c4a52;line-height:1.9}
.hg2-qd-pay{padding:2px 10px;font-size:12.5px;color:#2c4a52;line-height:1.6}
.hg2-qd-foot{text-align:center;font-size:12.5px;color:#5a6b78;padding:16px 10px}
.hg2-qd-bottomband{height:18px;background:linear-gradient(135deg,#bfe3e6,#d6eef0)}
@media print{
  body *{visibility:hidden!important}
  .hg2-quotedoc,.hg2-quotedoc *{visibility:visible!important}
  .hg2-quotedoc{position:absolute;inset:0;margin:0;box-shadow:none;border-radius:0}
  .ag-quote-noprint{display:none!important}
  /* Without this, most browsers default to "background graphics off" for
     print/PDF and silently drop the cyan header band + bottom band gradient
     backgrounds — the quote prints with those bands missing/wrong-colored
     instead of matching what's shown on screen. */
  .hg2-quotedoc,.hg2-quotedoc *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
}

/* ── ShowroomView ── */
.sr-header{background:linear-gradient(135deg,#0a0a14,#111122);border:1px solid rgba(var(--gold-rgb),.3);border-radius:16px;padding:16px;margin-bottom:14px}
.sr-header-top{display:flex;align-items:center;gap:8px;font-weight:800;font-size:16px;color:var(--gold);letter-spacing:.02em;margin-bottom:4px}
.sr-header-sub{font-size:12px;color:rgba(var(--gold-rgb),.6);padding-right:26px}
.sr-tabs{display:flex;gap:6px;margin-bottom:14px}
.sr-tabs button{flex:1;padding:9px 4px;border-radius:10px;border:1px solid var(--s7);background:var(--s9);color:var(--s4);cursor:pointer;font-family:inherit;font-size:13px;display:flex;align-items:center;justify-content:center;gap:5px;font-weight:600;transition:all .15s}
.sr-tabs button.on{background:linear-gradient(135deg,#1a1200,#2a2000);border-color:var(--gold);color:var(--gold);font-weight:800}
.sr-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-bottom:16px}
@media(max-width:480px){.sr-grid{grid-template-columns:1fr}}
.sr-card{background:linear-gradient(160deg,#0e0e1a,#080810);border:1px solid rgba(var(--gold-rgb),.2);border-radius:16px;padding:0;cursor:pointer;transition:border-color .2s,transform .15s;display:flex;flex-direction:column;overflow:hidden}
.sr-card:hover{border-color:rgba(var(--gold-rgb),.55);transform:translateY(-2px)}
.sr-card:active{transform:scale(.98)}
.sr-img-area{position:relative;background:radial-gradient(ellipse at 50% 60%,#0f0f28,#06060f);display:flex;align-items:center;justify-content:center;height:96px;border-bottom:1px solid rgba(var(--gold-rgb),.18)}
.sr-img-badge{position:absolute;bottom:6px;left:8px;font-size:9.5px;font-weight:700;color:rgba(var(--gold-rgb),.75);letter-spacing:.04em;text-transform:uppercase;background:rgba(0,0,0,.5);padding:2px 6px;border-radius:4px}
.sr-expand-abs{position:absolute;top:6px;right:6px;background:rgba(0,0,0,.4);border:1px solid rgba(var(--gold-rgb),.25);color:rgba(var(--gold-rgb),.5);cursor:pointer;padding:4px;border-radius:6px;transition:all .15s;display:flex;align-items:center}
.sr-expand-abs:hover{color:var(--gold);border-color:rgba(var(--gold-rgb),.7);background:rgba(0,0,0,.7)}
.sr-card-head{display:flex;align-items:flex-start;gap:10px;padding:10px 12px 0}
.sr-card-info{flex:1;min-width:0}
.sr-model{font-family:'Rubik',sans-serif;font-weight:900;font-size:18px;color:#f5e8c0;letter-spacing:.02em;line-height:1.1}
.sr-cat{font-size:11px;color:rgba(var(--gold-rgb),.65);font-weight:600;margin-top:2px}
.sr-expand{background:none;border:none;color:rgba(var(--gold-rgb),.4);cursor:pointer;padding:4px;flex-shrink:0;border-radius:6px;transition:color .15s}
.sr-expand:hover{color:var(--gold)}
.sr-card-body{padding:0 12px 12px;display:flex;flex-direction:column;gap:7px;flex:1}
.sr-tags-row{display:flex;flex-wrap:wrap;gap:4px}
.sr-tag{display:inline-block;background:rgba(var(--gold-rgb),.12);border:1px solid rgba(var(--gold-rgb),.3);color:#f0d28a;border-radius:6px;padding:2px 7px;font-size:10px;font-weight:700;letter-spacing:.01em}
.sr-tag.big{font-size:14px;padding:6px 14px;border-radius:10px}
.sr-desc{font-size:11.5px;color:rgba(220,210,190,.7);line-height:1.55}
.sr-price{font-size:16px;font-weight:800;color:var(--gold);font-family:'Rubik',sans-serif}
.sr-card-foot{display:flex;gap:6px;margin-top:2px}
.sr-quote-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:4px;background:rgba(var(--gold-rgb),.12);border:1px solid rgba(var(--gold-rgb),.25);color:var(--gold);border-radius:8px;padding:7px;font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .15s}
.sr-quote-btn:hover{background:rgba(var(--gold-rgb),.22)}
.sr-show-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:4px;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1a0e00;border:none;border-radius:8px;padding:7px;font-size:11.5px;font-weight:800;cursor:pointer;font-family:inherit}
/* Presentation (fullscreen) mode */
.sr-present{position:fixed;inset:0;z-index:9999;background:linear-gradient(160deg,#020210,#080818,#020210);display:flex;align-items:center;justify-content:center;padding:24px}
.sr-present-inner{position:relative;max-width:480px;width:100%;text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px}
.sr-present-close{position:absolute;top:-16px;right:-16px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:18px}
.sr-present-badge{font-size:13px;font-weight:700;color:rgba(var(--gold-rgb),.7);letter-spacing:.06em;text-transform:uppercase}
.sr-present-id{font-family:'Rubik',sans-serif;font-weight:900;font-size:52px;color:#f5e8c0;letter-spacing:.04em;line-height:1;text-shadow:0 0 40px rgba(var(--gold-rgb),.4)}
.sr-present-icon{color:rgba(var(--gold-rgb),.5);margin:8px 0}
.sr-present-tags{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
.sr-present-desc{font-size:15px;color:rgba(220,210,190,.8);line-height:1.7;max-width:380px}
.sr-present-price{font-family:'Rubik',sans-serif;font-size:28px;font-weight:900;color:var(--gold)}

/* ── Brand header (hidden on mobile, shown in sidebar on desktop) ── */
.ag-nav-brand{display:none}

/* ── Desktop sidebar layout ── */
@media(min-width:768px){
  .ag{padding-bottom:0;padding-right:240px}
  .ag-flow{max-width:900px;margin:0 auto}
  .ag-nav{
    flex-direction:column;
    right:0;left:auto;bottom:0;top:0;
    width:240px;
    border-top:none;
    border-left:1px solid var(--s7);
    padding:0 0 16px;
    overflow-y:auto;
    align-items:stretch
  }
  .ag-nav-brand{
    display:flex;align-items:center;gap:10px;
    padding:16px 18px;
    border-bottom:1px solid var(--s7);
    margin-bottom:8px;
    background:linear-gradient(135deg,rgba(var(--gold-rgb),.1),transparent)
  }
  .ag-nav-brand-logo{width:36px;height:36px;border-radius:9px;object-fit:cover;flex-shrink:0}
  .ag-nav-brand-txt{flex:1;text-align:right}
  .ag-nav-brand-txt b{display:block;font-family:'Rubik';font-weight:900;font-size:14px;color:var(--gold);line-height:1.2}
  .ag-nav-brand-txt span{font-size:10px;color:var(--s4);letter-spacing:.08em;text-transform:uppercase}
  .ag-nav button{
    flex:none;
    flex-direction:row;
    justify-content:flex-end;
    padding:11px 18px;
    gap:10px;
    border-radius:0;
    text-align:right
  }
  .ag-nav button span{font-size:13px;font-weight:700}
  .ag-nav button.on{
    background:linear-gradient(90deg,transparent,rgba(var(--gold-rgb),.12));
    border-right:3px solid var(--gold)
  }
  .ag-nav-exit{margin-top:auto}
  .ag-toast{bottom:24px;right:260px;left:auto;transform:none}
  .ag-kpis{grid-template-columns:repeat(4,1fr)}
  .ag-modal{align-items:center}
  .ag-sheet{border-radius:18px;max-width:680px;max-height:88vh}
  .ag-cust-page{max-width:760px;margin:0 auto}
  .sr-grid{grid-template-columns:repeat(3,1fr)}
  .ag-mapcard{max-width:700px}
  .ag-map{height:60vh;min-height:420px}
}

/* ═══════════════════════════════════════════════
   FUTURISTIC DESIGN SYSTEM — PREMIUM OVERRIDES
   ═══════════════════════════════════════════════ */

/* ── Keyframes ── */
@keyframes agShimmer{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes agBorderPulse{0%,100%{opacity:.35}50%{opacity:1}}
@keyframes agGlowPulse{0%,100%{box-shadow:0 0 0 0 rgba(var(--gold-rgb),0)}50%{box-shadow:0 0 22px 4px rgba(var(--gold-rgb),.25)}}
@keyframes agCardFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes agCtaShine{0%{background-position:200% center}100%{background-position:-200% center}}
@keyframes agNavGlow{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes agSpotlight{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes agKpiShimmer{0%,100%{border-color:rgba(var(--gold-rgb),.2)}50%{border-color:rgba(var(--gold-rgb),.7);box-shadow:0 0 18px 2px rgba(var(--gold-rgb),.2)}}
@keyframes agToolHover{0%{box-shadow:0 4px 16px rgba(var(--gold-rgb),0)}100%{box-shadow:0 4px 28px rgba(var(--gold-rgb),.35)}}
@keyframes agSrBorderFlow{0%{border-color:rgba(var(--gold-rgb),.18)}50%{border-color:rgba(var(--gold-rgb),.65)}100%{border-color:rgba(var(--gold-rgb),.18)}}
@keyframes agPresentOrb{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.85;transform:scale(1.12)}}
@keyframes agMsgGlow{0%,100%{box-shadow:0 0 0 0 rgba(24,216,255,0)}50%{box-shadow:0 0 16px 2px rgba(24,216,255,.18)}}
@keyframes agCyanLine{from{background-position:0 0}to{background-position:200% 0}}

/* ── KPI Cards — holographic shimmer ── */
.ag-kpi{
  background:linear-gradient(160deg,rgba(var(--card-rgb),.98),rgba(var(--card2-rgb),.98));
  border:1px solid rgba(var(--gold-rgb),.35);
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  box-shadow:0 4px 20px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.04);
  transition:transform .2s,box-shadow .2s,border-color .2s;
  animation:agKpiShimmer 4s ease-in-out infinite;
  position:relative;overflow:hidden
}
.ag-kpi::before{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 30%,rgba(var(--gold-rgb),.06) 50%,transparent 70%);background-size:200% 100%;animation:agShimmer 6s linear infinite;pointer-events:none}
.ag-kpi:hover{transform:translateY(-3px) scale(1.025);box-shadow:0 8px 32px rgba(var(--gold-rgb),.2),inset 0 1px 0 rgba(255,255,255,.06)}
.ag-kpi:active{transform:scale(.97)}

/* ── Main Cards — deep glass ── */
.ag-card{
  background:linear-gradient(160deg,rgba(var(--card-rgb),.97),rgba(var(--card2-rgb),.97));
  border:1px solid rgba(var(--gold-rgb),.2);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  box-shadow:0 2px 16px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.03);
  transition:border-color .2s,box-shadow .2s,transform .15s
}
.ag-card:hover{border-color:rgba(var(--gold-rgb),.45);box-shadow:0 6px 28px rgba(var(--gold-rgb),.12)}
.ag-card.lead:hover,.ag-card.deal:hover{transform:translateY(-2px)}

/* ── Deal rows — neon hover ── */
.ag-deal-row{
  background:linear-gradient(160deg,rgba(14,12,28,.97),rgba(var(--card2-rgb),.97));
  border:1px solid rgba(var(--gold-rgb),.18);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  transition:border-color .2s,box-shadow .2s,transform .15s
}
.ag-deal-row:hover{border-color:rgba(var(--gold-rgb),.5);box-shadow:0 4px 20px rgba(var(--gold-rgb),.12);transform:translateX(-2px)}

/* ── Sections — glass panels ── */
.ag-section{
  background:linear-gradient(160deg,rgba(var(--card-rgb),.97),rgba(var(--card2-rgb),.97));
  border:1px solid rgba(var(--gold-rgb),.2);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  box-shadow:0 4px 24px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.03)
}

/* ── CTA Button — flowing shimmer ── */
.ag-cta{
  background:linear-gradient(270deg,var(--gold2),var(--champ),#fff5cc,var(--champ),var(--gold2));
  background-size:300% 100%;
  animation:agCtaShine 3.5s linear infinite;
  box-shadow:0 8px 32px rgba(228,188,99,.4),0 2px 0 rgba(255,255,255,.15) inset;
  letter-spacing:.02em;
  transition:transform .15s,box-shadow .15s
}
.ag-cta:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(228,188,99,.55)}
.ag-cta:active{transform:scale(.985);animation-play-state:paused}

/* ── Primary Button — gold glow ── */
.ag-btn:not(.ghost):not(.wa){
  background:linear-gradient(135deg,var(--champ),var(--gold) 50%,var(--gold2));
  box-shadow:0 4px 18px rgba(var(--gold-rgb),.35);
  transition:transform .15s,box-shadow .2s
}
.ag-btn:not(.ghost):not(.wa):hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(var(--gold-rgb),.5)}
.ag-btn:not(.ghost):not(.wa):active{transform:scale(.97)}

/* ── Search box — focus glow ring ── */
.ag-searchbox{
  background:linear-gradient(160deg,rgba(14,12,28,.97),rgba(var(--card2-rgb),.97));
  border:1px solid rgba(var(--gold-rgb),.25);
  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  transition:border-color .2s,box-shadow .2s
}
.ag-searchbox:focus-within{border-color:rgba(var(--gold-rgb),.75);box-shadow:0 0 0 3px rgba(var(--gold-rgb),.12),0 4px 20px rgba(var(--gold-rgb),.1)}

/* ── Inputs ── */
.ag-textarea,.ag-input,.ag-select{
  background:linear-gradient(160deg,rgba(var(--card2-rgb),.97),rgba(var(--card2-rgb),.97));
  border:1px solid rgba(var(--gold-rgb),.2);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  transition:border-color .2s,box-shadow .2s
}
.ag-textarea:focus,.ag-input:focus,.ag-select:focus{border-color:rgba(var(--gold-rgb),.65);box-shadow:0 0 0 3px rgba(var(--gold-rgb),.1)}

/* ── Bottom Nav — aurora border ── */
.ag-nav{
  background:rgba(var(--card2-rgb),.97);
  border-top:1px solid transparent;
  border-image:linear-gradient(90deg,transparent,rgba(var(--gold-rgb),.6),transparent) 1;
  box-shadow:0 -8px 40px rgba(0,0,0,.6),0 -1px 0 rgba(var(--gold-rgb),.08);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)
}
.ag-nav button.on{
  color:var(--gold);
  text-shadow:0 0 12px rgba(var(--gold-rgb),.8)
}
.ag-nav button.on svg{filter:drop-shadow(0 0 5px rgba(var(--gold-rgb),.6))}

/* ── Bottom sheet / Modal ── */
.ag-modal{background:rgba(0,0,10,.8);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
.ag-sheet{
  background:linear-gradient(160deg,rgba(var(--card2-rgb),.99),rgba(var(--card2-rgb),.99));
  border:1px solid rgba(var(--gold-rgb),.25);
  box-shadow:0 -16px 60px rgba(0,0,0,.7),0 0 0 1px rgba(var(--gold-rgb),.08),inset 0 1px 0 rgba(255,255,255,.04);
  backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)
}
.ag-sheet-head{border-bottom:1px solid rgba(var(--gold-rgb),.18)}
.ag-sheet-foot{border-top:1px solid rgba(var(--gold-rgb),.18)}

/* ── Toast ── */
.ag-toast{
  background:linear-gradient(135deg,rgba(var(--card2-rgb),.98),rgba(var(--card2-rgb),.98));
  border:1px solid rgba(var(--gold-rgb),.5);
  box-shadow:0 8px 40px rgba(var(--gold-rgb),.3);
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)
}

/* ── Showroom cards — holographic ── */
.sr-card{
  background:linear-gradient(160deg,rgba(var(--card2-rgb),.98),rgba(var(--card2-rgb),.98));
  border:1px solid rgba(var(--gold-rgb),.22);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
  box-shadow:0 4px 20px rgba(0,0,0,.5);
  transition:border-color .3s,transform .2s,box-shadow .3s;
  animation:agSrBorderFlow 5s ease-in-out infinite
}
.sr-card:hover{
  border-color:rgba(var(--gold-rgb),.7);
  transform:translateY(-4px);
  box-shadow:0 12px 40px rgba(var(--gold-rgb),.22),0 4px 16px rgba(0,0,0,.5);
  animation-play-state:paused
}

/* ── Showroom image area — deep glow ── */
.sr-img-area{
  background:radial-gradient(ellipse at 50% 60%,rgba(var(--card-rgb),.9),rgba(var(--card2-rgb),1));
  position:relative
}
.sr-img-area::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 90%,rgba(var(--gold-rgb),.12),transparent 60%);pointer-events:none}

/* ── Showroom presentation — cosmic ── */
.sr-present{
  background:radial-gradient(ellipse at 50% 30%,rgba(var(--card-rgb),.98),rgba(var(--card2-rgb),1));
  position:relative;overflow:hidden
}
.sr-present::before{
  content:'';position:absolute;inset:0;
  background-image:
    radial-gradient(circle at 20% 20%,rgba(var(--gold-rgb),.06) 0%,transparent 40%),
    radial-gradient(circle at 80% 80%,rgba(24,216,255,.05) 0%,transparent 40%),
    linear-gradient(rgba(var(--gold-rgb),.018) 1px,transparent 1px),
    linear-gradient(90deg,rgba(var(--gold-rgb),.018) 1px,transparent 1px);
  background-size:100% 100%,100% 100%,56px 56px,56px 56px;
  animation:agGrid 80s linear infinite;
  pointer-events:none
}
.sr-present-id{text-shadow:0 0 60px rgba(var(--gold-rgb),.5),0 0 120px rgba(var(--gold-rgb),.2)}
.sr-present-price{text-shadow:0 0 30px rgba(var(--gold-rgb),.5)}

/* ── AI assistant panel ── */
.ag-assist{
  background:linear-gradient(160deg,rgba(var(--card2-rgb),.98),rgba(var(--card2-rgb),.98));
  border:1px solid rgba(var(--gold-rgb),.25);
  box-shadow:0 6px 30px rgba(var(--gold-rgb),.12),inset 0 1px 0 rgba(255,255,255,.04);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)
}

/* ── AI bot messages — holographic ── */
.ag-msg.bot{
  background:linear-gradient(160deg,rgba(var(--card-rgb),.97),rgba(var(--card2-rgb),.97));
  border:1px solid rgba(24,216,255,.2);
  color:var(--silver);
  box-shadow:0 2px 12px rgba(24,216,255,.06);
  animation:agMsgGlow 3s ease-in-out infinite
}

/* ── Tool launch cards ── */
.ag-tool{
  background:linear-gradient(160deg,rgba(14,12,28,.98),rgba(var(--card2-rgb),.98));
  border:1px solid rgba(var(--gold-rgb),.2);
  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  transition:border-color .2s,box-shadow .25s,transform .2s
}
.ag-tool:hover{
  border-color:rgba(var(--gold-rgb),.65);
  box-shadow:0 8px 30px rgba(var(--gold-rgb),.2),0 0 0 1px rgba(var(--gold-rgb),.1);
  transform:translateY(-3px)
}
.ag-tool:active{transform:scale(.97)}

/* ── Map card ── */
.ag-mapcard{
  background:linear-gradient(120deg,rgba(44,37,16,.97),rgba(90,68,22,.97),rgba(60,45,10,.97));
  box-shadow:0 8px 32px rgba(60,45,10,.5),0 0 0 1px rgba(var(--gold-rgb),.12);
  transition:box-shadow .2s,transform .15s
}
.ag-mapcard:hover{transform:translateY(-2px);box-shadow:0 14px 44px rgba(60,45,10,.6),0 0 24px rgba(var(--gold-rgb),.15)}

/* ── Customer chips active state ── */
.ag-chips button.on{
  background:color-mix(in srgb,var(--sc,var(--gold)) 20%,transparent);
  border-color:var(--sc,var(--gold));
  color:var(--sc,var(--gold));
  box-shadow:0 0 12px rgba(var(--gold-rgb),.2)
}

/* ── Pipeline filter pills ── */
.ag-pipe.on{
  background:color-mix(in srgb,var(--sc) 20%,transparent);
  border-color:var(--sc);
  color:var(--sc);
  box-shadow:0 0 14px rgba(var(--gold-rgb),.15)
}

/* ── Back button ── */
.ag-back{
  background:linear-gradient(160deg,rgba(var(--card-rgb),.97),rgba(var(--card2-rgb),.97));
  border:1px solid rgba(var(--gold-rgb),.25);
  backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
  transition:border-color .2s,box-shadow .2s
}
.ag-back:hover{border-color:rgba(var(--gold-rgb),.6);box-shadow:0 0 16px rgba(var(--gold-rgb),.2)}

/* ── Quote document — glass header ── */
.hg2-qd-band{background:linear-gradient(135deg,#c2e8eb,#d8f0f2);box-shadow:0 4px 20px rgba(0,0,0,.15)}

/* ── More button ── */
.ag-more{
  background:linear-gradient(160deg,rgba(var(--card2-rgb),.97),rgba(var(--card2-rgb),.97));
  border:1px solid rgba(var(--gold-rgb),.2);
  transition:border-color .2s,box-shadow .2s
}
.ag-more:hover{border-color:rgba(var(--gold-rgb),.5);box-shadow:0 4px 18px rgba(var(--gold-rgb),.1)}

/* ── Section title gold text glow ── */
.ag-section-ttl{text-shadow:0 0 14px rgba(var(--gold-rgb),.4)}

/* ── KPI numbers glow ── */
.ag-kpi b.cy{text-shadow:0 0 16px rgba(24,216,255,.5)}
.ag-kpi b.ok{text-shadow:0 0 16px rgba(34,216,130,.5)}

/* ── Action buttons on cards ── */
.ag-abtn{
  background:linear-gradient(160deg,rgba(14,12,28,.97),rgba(var(--card2-rgb),.97));
  border:1px solid rgba(var(--gold-rgb),.2);
  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  transition:border-color .15s,box-shadow .15s,transform .1s
}
.ag-abtn:hover{border-color:rgba(var(--gold-rgb),.5);box-shadow:0 4px 16px rgba(var(--gold-rgb),.15);transform:translateY(-1px)}

/* ── Desktop sidebar — glow border ── */
@media(min-width:768px){
  .ag-nav{
    border-left:1px solid transparent;
    border-image:linear-gradient(180deg,transparent,rgba(var(--gold-rgb),.5),transparent) 1;
    box-shadow:-8px 0 40px rgba(0,0,0,.6)
  }
  .ag-nav button.on{
    background:linear-gradient(90deg,transparent,rgba(var(--gold-rgb),.15));
    border-right:3px solid var(--gold);
    box-shadow:inset -3px 0 12px rgba(var(--gold-rgb),.1)
  }
}
`})}var sn=document.getElementById(`root`);sn&&me.createRoot(sn).render(F.createElement(gt));