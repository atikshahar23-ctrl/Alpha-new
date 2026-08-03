import { chromium } from 'playwright';
const BASE='http://localhost:4173/Alpha-new/';
const NOISE=/TUNNEL_CONNECTION_FAILED|ERR_CONNECTION_RESET|ERR_NAME_NOT_RESOLVED|net::ERR_ABORTED|Failed to load resource.*(404|403|429)|vibrate|chromestatus|Autoplay|AudioContext was not allowed|preload|favicon|ERR_CERT_AUTHORITY_INVALID|ERR_SSL/i;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
const bad=[];
function watch(p,tag){
  const errs=[];
  p.on('pageerror',e=>{ errs.push('THROW '+e.message.slice(0,150)); });
  p.on('console',m=>{ if(m.type()==='error'&&!NOISE.test(m.text())) errs.push('CONSOLE '+m.text().slice(0,150)); });
  return {errs, check(step){ if(errs.length){ errs.splice(0).forEach(e=>bad.push(`[${tag}] ${step}: ${e}`)); } }};
}
const step=async(w,name,fn)=>{
  try{ await fn(); }
  catch(e){
    let extra='';
    const m=/locator\('([^']+)'\)/.exec(String(e.message));
    if(m&&w.page){
      try{
        extra=' | '+JSON.stringify(await w.page.evaluate(sel=>{
          const el=document.querySelector(sel);
          if(!el) return 'selector matches nothing';
          const r=el.getBoundingClientRect(), cs=getComputedStyle(el);
          const top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
          return {rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
            display:cs.display,vis:cs.visibility,op:cs.opacity,pe:cs.pointerEvents,
            onTop: top? (top.id||top.className||top.tagName) : null,
            inView: r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth};
        },m[1]));
      }catch(_){}
    }
    bad.push(`[${w.tag}] ${name}: FAILED ${String(e.message).split('\n')[0].slice(0,90)}${extra}`);
  }
  w.check(name);
};

// ═══ ARENA ═══
{
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  const p=await ctx.newPage(); const w=watch(p,'arena'); w.tag='arena'; w.page=p;
  await p.goto(BASE+'arena.html',{waitUntil:'domcontentloaded'});
  await p.waitForSelector('#loader.hide',{timeout:45000});
  await p.waitForTimeout(5000); w.check('boot');

  // every centre mode
  const modes=await p.evaluate(()=>window.__naCenterModes);
  for(const m of modes){
    await step(w,'centre:'+m,async()=>{
      await p.evaluate(mm=>{window.__naSettings.centerMode=mm;},m);
      await p.waitForTimeout(1400);
      const fail=await p.evaluate(()=>window.__gfx.loopFailN);
      if(fail>0) throw new Error('render loop failed, loopFailN='+fail);
    });
  }
  await p.evaluate(()=>{window.__naSettings.centerMode='classic';});

  // every panel opens and closes
  for(const [btn,close] of [['btnChart','#chartClose'],['btnLog','#logClose'],['btnPortfolio','#pfClose'],
      ['btnRecs','#recsClose'],['btnAp','#apClose'],['btnOrd','#ordClose'],['btnPerf','#perfClose'],
      ['btnLab','#labClose'],['btnTools','#toolsClose'],['btnMap','#mapClose'],['btnCandle','#candleClose']]){
    await step(w,'panel:'+btn,async()=>{
      await p.click('#'+btn); await p.waitForTimeout(700);
      const vis=await p.isVisible(close).catch(()=>false);
      if(!vis) throw new Error('close control '+close+' not visible after opening');
      await p.click(close); await p.waitForTimeout(300);
    });
  }
  // chart styles + tools
  await step(w,'chart:styles',async()=>{
    await p.click('#btnChart'); await p.waitForTimeout(1500);
    const styles=await p.$$eval('#cpStyles .cst',ns=>ns.map(n=>n.dataset.cs));
    for(const st of styles){ await p.click(`.cst[data-cs="${st}"]`); await p.waitForTimeout(320); }
  });
  await step(w,'chart:zoom+replay',async()=>{
    await p.click('#ctZoomIn'); await p.click('#ctZoomOut');
    await p.click('#ctBack'); await p.click('#ctFwd'); await p.click('#ctLive');
    await p.click('#ctPlay'); await p.waitForTimeout(1600); await p.click('#ctPlay');
    await p.click('#ctFit');
  });
  await step(w,'chart:drawtools',async()=>{
    for(const t of ['hline','trend','rect','ruler','none']){
      await p.click(`.ct[data-tool="${t}"]`); await p.waitForTimeout(200);
      const box=await p.locator('#chartCv').boundingBox();
      await p.mouse.move(box.x+box.width*0.3,box.y+box.height*0.4);
      await p.mouse.down(); await p.mouse.move(box.x+box.width*0.6,box.y+box.height*0.6,{steps:5}); await p.mouse.up();
      await p.waitForTimeout(200);
    }
    await p.click('#ctUndo'); await p.click('#ctClear');
  });
  await step(w,'chart:backtest',async()=>{ await p.click('#ctBt'); await p.waitForTimeout(2500); await p.click('#chartClose'); });
  await step(w,'lab:compare',async()=>{
    await p.click('#btnLab'); await p.waitForTimeout(600);
    await p.click('#labRunAll'); await p.waitForTimeout(2500);
    await p.click('.lab-row[data-s="trend"] .lab-ed'); await p.waitForTimeout(500);
    await p.click('#labCancel'); await p.click('#labClose');
  });
  await step(w,'trade:open+manage+close',async()=>{
    const snap=async()=>p.evaluate(()=>({
      open:Object.keys(JSON.parse(localStorage.getItem('na:positions')||'{}')).length,
      bal:(JSON.parse(localStorage.getItem('na:wallet')||'{"balance":0}')).balance,
      sugVisible:getComputedStyle(document.getElementById('sugBox')).display,
      toast:(document.getElementById('toast')||{}).textContent,
    }));
    console.log('   before trade:',JSON.stringify(await snap()));
    await p.click('#btnLong'); await p.waitForTimeout(900);
    let st=await snap();
    console.log('   after click1:',JSON.stringify(st));
    // the entry button lives inside the suggestion box, which is hidden the
    // moment a position exists — only click again if the risk guard blocked
    // the first one
    if(st.open===0){
      await p.click('#btnLong'); await p.waitForTimeout(1200);
      st=await snap();
      console.log('   after confirm:',JSON.stringify(st));
    }
    const n=st.open;
    if(n<1) throw new Error('no position opened after two clicks');
    // the sim moves fast: a position can hit its stop or target between two
    // clicks, which legitimately hides the manage buttons
    const still=async()=>(await snap()).open>0;
    if(await still()){ await p.click('#btnHalf'); await p.waitForTimeout(600); }
    if(await still()){ await p.click('#btnBE'); await p.waitForTimeout(600); }
    if(await still()){ await p.click('#btnClose'); await p.waitForTimeout(900); }
    const left=(await snap()).open;
    if(left>0) throw new Error('position still open after close ('+left+')');
  });
  await step(w,'markets:stocks',async()=>{
    await p.click('#mkStock').catch(async()=>{ await p.click('text=מניות'); });
    await p.waitForTimeout(4000);
  });
  await step(w,'markets:back-to-crypto',async()=>{
    await p.click('#mkCrypto').catch(async()=>{ await p.click('text=קריפטו'); });
    await p.waitForTimeout(4000);
  });
  await step(w,'timeframes',async()=>{
    for(const tf of ['5m','15m','1h','1m']){
      await p.evaluate(t=>{ const el=[...document.querySelectorAll('#tfRow .pill')].find(x=>x.dataset&&x.dataset.tf===t); if(el) el.click(); },tf).catch(()=>{});
      await p.waitForTimeout(1200);
    }
  });
  await step(w,'toggles:visual',async()=>{
    for(const id of ['btnSig','btnTail','btnShield','btnFx','btnSnd','btnComm','btnCockpit','btnCinema']){
      await p.click('#'+id); await p.waitForTimeout(400);
    }
    for(const id of ['btnComm','btnCockpit','btnCinema']){ await p.click('#'+id); await p.waitForTimeout(300); }
  });
  await step(w,'walk mode',async()=>{ await p.click('#btnWalk'); await p.waitForTimeout(2000); await p.click('#btnWalk'); await p.waitForTimeout(800); });
  await step(w,'settings:all rows',async()=>{
    await p.click('#btnSettings'); await p.waitForTimeout(800);
    const n=await p.$$eval('#settingsBody input,#settingsBody select',ns=>ns.length);
    if(!n) throw new Error('settings panel rendered no controls');
    await p.$$eval('#settingsBody input[type=checkbox]',ns=>ns.slice(0,6).forEach(x=>x.click()));
    await p.waitForTimeout(900);
    await p.$$eval('#settingsBody input[type=checkbox]',ns=>ns.slice(0,6).forEach(x=>x.click()));
    await p.waitForTimeout(900);
    await p.keyboard.press('Escape');
  });
  await step(w,'export csv',async()=>{
    const csv=await p.evaluate(()=>window.__naTools.csv());
    if(typeof csv!=='string'||csv.split('\n')[0].indexOf('symbol')<0) throw new Error('CSV header malformed');
  });
  await ctx.close();
}

// ═══ OCTOPUS ═══
{
  const ctx=await b.newContext({viewport:{width:1400,height:900}});
  const p=await ctx.newPage(); const w=watch(p,'octopus'); w.tag='octopus';
  await p.goto(BASE+'octopus.html',{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(12000); w.check('boot');
  await step(w,'refresh',async()=>{ await p.click('#refreshBtn'); await p.waitForTimeout(9000); });
  await step(w,'open analysis',async()=>{
    const n=await p.$$eval('.cluster',ns=>ns.length);
    if(!n) throw new Error('no story cards rendered at all');
    await p.locator('.cluster').first().click(); await p.waitForTimeout(2500);
    await p.click('#anaClose').catch(()=>p.keyboard.press('Escape'));
  });
  await step(w,'bookmark + follow',async()=>{
    await p.locator('.cluster .c-star').first().click(); await p.waitForTimeout(400);
    await p.locator('.cluster .c-follow').first().click(); await p.waitForTimeout(400);
  });
  await step(w,'search + filters',async()=>{
    await p.fill('#searchBox','a'); await p.waitForTimeout(700);
    await p.fill('#searchBox',''); await p.waitForTimeout(500);
    for(const h of ['1','6','24','0']){ await p.click(`.tchip.tf[data-h="${h}"]`).catch(()=>{}); await p.waitForTimeout(400); }
  });
  await step(w,'settings',async()=>{
    await p.click('#settingsBtn').catch(()=>{});
    await p.waitForTimeout(900);
    await p.keyboard.press('Escape');
  });
  await ctx.close();
}

// ═══ NEURO ═══
{
  const ctx=await b.newContext({viewport:{width:1280,height:900}});
  const p=await ctx.newPage(); const w=watch(p,'neuro'); w.tag='neuro';
  await p.goto(BASE+'neuro.html',{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(5000); w.check('boot');
  await step(w,'settings tab',async()=>{ await p.getByText('הגדרות',{exact:true}).first().click(); await p.waitForTimeout(900); });
  await step(w,'audio on + modes',async()=>{
    await p.locator('section').first().locator('button').first().click();
    await p.waitForTimeout(2500);
    for(const m of ['מונאורלי','איזוכרוני','בינאורלי']){
      await p.getByText(m,{exact:true}).first().click(); await p.waitForTimeout(1200);
    }
  });
  await step(w,'noise + protocol',async()=>{
    await p.getByText('גלי ים',{exact:true}).first().click(); await p.waitForTimeout(900);
    await p.getByText('ירידה לשינה',{exact:true}).first().click(); await p.waitForTimeout(2500);
    await p.getByText('ללא פרוטוקול',{exact:true}).first().click(); await p.waitForTimeout(800);
  });
  await step(w,'session start/stop',async()=>{
    await p.getByText('קונסולה',{exact:true}).first().click(); await p.waitForTimeout(700);
    await p.getByText('התחל מפגש',{exact:true}).first().click().catch(()=>{});
    await p.waitForTimeout(3000);
    await p.getByText('סיים מפגש',{exact:true}).first().click().catch(()=>{});
    await p.waitForTimeout(1200);
  });
  await step(w,'history tab',async()=>{ await p.getByText('מפגשים',{exact:true}).first().click(); await p.waitForTimeout(1200); });
  await step(w,'audio off',async()=>{
    await p.getByText('הגדרות',{exact:true}).first().click(); await p.waitForTimeout(600);
    await p.locator('section').first().locator('button').first().click(); await p.waitForTimeout(1500);
  });
  await ctx.close();
}

// ═══ DOGGY + LYRICS + DASHBOARD ═══
for(const [file,tag,acts] of [
  ['doggy.html','doggy', async(p,w)=>{
    await step(w,'navigate tabs',async()=>{
      const btns=await p.$$('nav button, [role=tab], button');
      for(const btn of btns.slice(0,10)){ await btn.click().catch(()=>{}); await p.waitForTimeout(500); }
    });
  }],
  ['lyrics.html','lyrics', async(p,w)=>{
    await step(w,'dance chips',async()=>{
      const chips=await p.$$('.chip, .style-chip, button');
      for(const c of chips.slice(0,12)){ await c.click().catch(()=>{}); await p.waitForTimeout(400); }
    });
  }],
  ['index.html','dashboard', async(p,w)=>{
    await step(w,'open cards',async()=>{
      const cards=await p.$$('.card, .app-card, a[href$=".html"]');
      console.log('   dashboard cards found:',cards.length);
      for(const c of cards.slice(0,6)){
        const href=await c.getAttribute('href').catch(()=>null);
        if(href) continue;                       // do not navigate away
        await c.click().catch(()=>{}); await p.waitForTimeout(500);
      }
    });
  }],
]){
  const ctx=await b.newContext({viewport:{width:1280,height:900}});
  const p=await ctx.newPage(); const w=watch(p,tag); w.tag=tag;
  await p.goto(BASE+file,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(7000); w.check('boot');
  await acts(p,w);
  await ctx.close();
}

console.log('\n═══════ FINDINGS ═══════');
if(!bad.length) console.log('none — every flow completed with no errors');
else [...new Set(bad)].forEach(x=>console.log(' • '+x));
await b.close();
