import { chromium } from 'playwright';
const OUT='/tmp/claude-0/-home-user-Alpha-new/a931fec5-cd20-58a6-9a37-425577e8cedc/scratchpad/';
const BASE='http://localhost:4173/Alpha-new/';

// Noise from the sandbox: every outbound host is blocked here, and that is an
// environment fact, not a defect in the app. Everything else is a finding.
const NOISE=/TUNNEL_CONNECTION_FAILED|ERR_CONNECTION_RESET|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|net::ERR_ABORTED|Failed to load resource.*(404|403|429)|vibrate|chromestatus|Autoplay|AudioContext was not allowed|preload|favicon|ERR_CERT_AUTHORITY_INVALID|ERR_SSL/i;

const PAGES=[
  {f:'index.html',      name:'ALPHA (dashboard)', wait:6000},
  {f:'arena.html',      name:'NEXUS ARENA',       wait:12000, ready:'#loader.hide'},
  {f:'octopus.html',    name:'OCTOPUS',           wait:12000},
  {f:'neuro.html',      name:'NEURO-SOMATIC',     wait:6000},
  {f:'doggy.html',      name:'DOGGY LIFE',        wait:6000},
  {f:'lyrics.html',     name:'LYRICS',            wait:8000},
  {f:'heavyguard.html', name:'HEAVY GUARD',       wait:8000},
  {f:'agents.html',     name:'AGENTS',            wait:8000},
  {f:'agent.html',      name:'AGENT',             wait:6000},
  {f:'widget.html',     name:'WIDGET',            wait:4000},
  {f:'chat-widget.html',name:'CHAT WIDGET',       wait:4000},
];

const findings=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});

for(const view of [{w:1440,h:900,tag:'desktop'},{w:411,h:891,tag:'phone',mobile:true}]){
  for(const pg of PAGES){
    const ctx=await b.newContext({viewport:{width:view.w,height:view.h},
      isMobile:!!view.mobile, hasTouch:!!view.mobile});
    const p=await ctx.newPage();
    const errs=[];
    p.on('pageerror',e=>errs.push('THROW: '+e.message.slice(0,180)));
    // a loop that catches its own exceptions only ever reports via console
    p.on('console',m=>{
      if(m.type()!=='error') return;
      const t=m.text();
      if(NOISE.test(t)) return;
      errs.push('CONSOLE: '+t.slice(0,180));
    });
    let blank=false, title='';
    try{
      await p.goto(BASE+pg.f,{waitUntil:'domcontentloaded',timeout:30000});
      if(pg.ready) await p.waitForSelector(pg.ready,{timeout:40000}).catch(()=>errs.push('READY: '+pg.ready+' never appeared'));
      await p.waitForTimeout(pg.wait);
      title=await p.title();
      // a page that renders nothing is the failure a console watcher misses
      blank=await p.evaluate(()=>{
        const body=document.body;
        const txt=(body.innerText||'').trim().length;
        const cv=document.querySelector('canvas');
        let painted=false;
        if(cv){ try{ painted=cv.width>0&&cv.height>0; }catch(e){} }
        const vis=[...body.querySelectorAll('*')].filter(e=>{
          const r=e.getBoundingClientRect();
          return r.width>40&&r.height>20;
        }).length;
        return txt<12 && !painted && vis<3;
      });
    }catch(e){ errs.push('NAV: '+String(e.message).slice(0,160)); }
    const uniq=[...new Set(errs)];
    if(uniq.length||blank){
      findings.push({page:pg.name,view:view.tag,blank,errs:uniq});
      await p.screenshot({path:OUT+'sweep-'+pg.f.replace(/\W/g,'')+'-'+view.tag+'.png'}).catch(()=>{});
    }
    console.log(`${view.tag.padEnd(7)} ${pg.name.padEnd(20)} ${blank?'⛔ BLANK':uniq.length?'✗ '+uniq.length+' err':'✓'}${title?'':' (no title)'}`);
    uniq.slice(0,4).forEach(e=>console.log('        · '+e));
    await ctx.close();
  }
}
console.log('\n===== SUMMARY =====');
console.log(findings.length? JSON.stringify(findings,null,1) : 'no findings');
await b.close();
