import { mountOrb } from '../orb/OrbScene';
import { mountFlowLines } from '../bg/flowLines';
import { loadState, saveState, addEvent, loadEvents, saveEvents, type AppState, type TextLang } from '../assistant/state';
import { askGemini, runTags } from '../assistant/gemini';
import { VoiceEngine } from '../assistant/voice';
import { AudioEngine } from '../assistant/audio';

export function mountApp(root: HTMLElement) {
  root.innerHTML = `
    <div class="app">
      <div class="chrome topL"><div class="wm">ALPHA ASSISTANT</div><div class="clk" id="clock">--:--</div></div>
      <div class="chrome topR">
        <button class="chip ghost" id="muteBtn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg></button>
        <button class="chip" id="settingsBtn"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> SETTINGS</button>
        <button class="chip ghost" id="newChat"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> NEW</button>
      </div>
      <div class="stage" id="stage"></div>

      <aside class="right-panel" id="rightPanel">
        <div class="rp-head">
          <span class="rp-title">OUTPUT</span>
          <div class="rp-connections" id="connections">
            <span class="conn-dot active" title="API"></span>
            <span class="conn-dot" id="connSpotify" title="Spotify"></span>
            <span class="conn-dot" id="connSocial" title="Social"></span>
          </div>
        </div>
        <div class="rp-body" id="rpBody"></div>
      </aside>

      <div class="dock">
        <div class="state" id="state">STANDBY</div>
        <div class="mac-dock" id="macDock">
          <button class="dock-item" data-q="What's the weather today?">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg></span>
            <span class="dl">Weather</span>
          </button>
          <button class="dock-item" data-q="Tell me a fun fact">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17H8v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/></svg></span>
            <span class="dl">Fun Fact</span>
          </button>
          <button class="dock-item" data-q="Play some music on Spotify">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5-1 4-1 4 1 4 1M7 12s2-1.5 5-1.5 5 1.5 5 1.5M6.5 9S9 7 12 7s5.5 2 5.5 2"/></svg></span>
            <span class="dl">Music</span>
          </button>
          <button class="dock-item" data-q="Search the web">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            <span class="dl">Search</span>
          </button>
          <button class="dock-item" data-q="Open my calendar">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
            <span class="dl">Calendar</span>
          </button>
          <button class="dock-item" data-q="Tell me a joke">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></span>
            <span class="dl">Joke</span>
          </button>
          <button class="dock-item" data-q="Play a video on YouTube">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><polygon points="10,8 16,12 10,16"/></svg></span>
            <span class="dl">Video</span>
          </button>
          <button class="dock-item" data-q="Translate to Hebrew">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg></span>
            <span class="dl">Translate</span>
          </button>
          <button class="dock-item" id="detectBtn">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2"/><circle cx="12" cy="10" r="3"/><path d="M7 18c0-2.8 2.2-5 5-5s5 2.2 5 5"/></svg></span>
            <span class="dl">Detect</span>
          </button>
        </div>
        <div class="bar">
          <button class="ic mic" id="micBtn" title="Hey Alpha"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></button>
          <div class="pill"><input id="input" type="text" placeholder="Type or speak to Alpha…" /></div>
          <button class="ic send" id="sendBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg></button>
        </div>
      </div>
      <div class="win" id="win"><div class="winbox">
        <div class="winhead"><span id="winTitle"></span><button id="winClose">✕</button></div>
        <div class="winbody" id="winBody"></div>
      </div></div>
      <div class="overlay" id="overlay"><div class="card">
        <h2>Alpha Assistant</h2>
        <p>Enter your free Gemini API key to activate. Stored locally only.</p>
        <label>Assistant name</label><input id="nameInput" value="ALPHA" />
        <label>Mic language</label>
        <select id="micSel"><option value="he">Hebrew</option><option value="en">English</option><option value="es">Español</option></select>
        <label>Voice language</label>
        <select id="replySel"><option value="en">English</option><option value="he">Hebrew</option><option value="es">Español</option></select>
        <label>Text reply language</label>
        <select id="textLangSel">
          <option value="auto">Same as voice</option>
          <option value="en">English</option>
          <option value="he">עברית</option>
          <option value="ar">العربية</option>
          <option value="ru">Русский</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
          <option value="de">Deutsch</option>
        </select>
        <label>Voice</label><select id="voiceSel"></select>
        <label>Background music</label><input type="range" id="ambSlider" min="0" max="100" value="40" />
        <label>Gemini API key</label><input id="keyInput" type="password" placeholder="AIza..." />

        <div class="settings-section">
          <div class="ss-title">CONNECTED SERVICES</div>
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

        <button class="go" id="saveBtn">Activate</button>
        <p style="margin-top:14px">Free key: <a href="https://aistudio.google.com/apikey" target="_blank">aistudio.google.com/apikey</a></p>
      </div></div>
    </div>
  `;

  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const state: AppState = loadState();
  const audio = new AudioEngine();
  audio.ambLevel = state.ambLevel;
  audio.sfxOn = state.sfxOn;

  const orb = mountOrb($('stage'));
  mountFlowLines(root.querySelector('.app')!);

  // Load social connections
  const socials = {
    spotify: localStorage.getItem('alpha_social_spotify') || '',
    tiktok: localStorage.getItem('alpha_social_tiktok') || '',
    insta: localStorage.getItem('alpha_social_insta') || '',
    fb: localStorage.getItem('alpha_social_fb') || '',
  };
  function updateConnIndicators() {
    $('connSpotify').classList.toggle('active', !!socials.spotify);
    $('connSocial').classList.toggle('active', !!(socials.tiktok || socials.insta || socials.fb));
    $('spotifyStatus').textContent = socials.spotify ? '● Connected' : '';
    $('spotifyStatus').className = 'social-status' + (socials.spotify ? ' on' : '');
    $('tiktokStatus').textContent = socials.tiktok ? '● Connected' : '';
    $('tiktokStatus').className = 'social-status' + (socials.tiktok ? ' on' : '');
    $('instaStatus').textContent = socials.insta ? '● Connected' : '';
    $('instaStatus').className = 'social-status' + (socials.insta ? ' on' : '');
    $('fbStatus').textContent = socials.fb ? '● Connected' : '';
    $('fbStatus').className = 'social-status' + (socials.fb ? ' on' : '');
  }

  function setStatus(s: 'armed' | 'listening' | 'thinking' | 'speaking' | '') {
    const label = { armed: 'SAY "HEY ALPHA"', listening: 'LISTENING', thinking: 'THINKING', speaking: 'SPEAKING', '': 'STANDBY' }[s];
    $('state').textContent = label;
    orb.setEnergy(s === 'speaking' ? 0.95 : s === 'listening' ? 0.5 : s === 'armed' ? 0.2 : 0.06);
  }

  const voice = new VoiceEngine(state, (text) => { addMsg(text, 'me'); ask(text); }, setStatus);

  function addMsg(text: string, who: 'me' | 'al' | 'sys') {
    const label = { me: 'YOU', al: state.name, sys: 'SYSTEM' }[who];
    // Chat log (bottom)
    const div = document.createElement('div');
    div.className = 'turn ' + who;
    div.innerHTML = `<span class="who">${label}</span><div class="txt"></div>`;
    const chatEl = $('chat');
    if (chatEl) {
      chatEl.appendChild(div);
      const txt = div.querySelector('.txt')!;
      if (who === 'al') {
        let i = 0;
        const tick = () => { txt.textContent = text.slice(0, i++); chatEl.scrollTop = chatEl.scrollHeight; if (i <= text.length) setTimeout(tick, 12); };
        tick();
      } else txt.textContent = text;
      chatEl.scrollTop = chatEl.scrollHeight;
    }
    // Right panel output
    const rp = $('rpBody');
    const rpDiv = document.createElement('div');
    rpDiv.className = 'rp-msg ' + who;
    const time = new Date();
    const ts = `${String(time.getHours()).padStart(2,'0')}:${String(time.getMinutes()).padStart(2,'0')}`;
    rpDiv.innerHTML = `<div class="rp-meta"><span class="rp-who">${label}</span><span class="rp-time">${ts}</span></div><div class="rp-text"></div>`;
    rp.appendChild(rpDiv);
    const rpTxt = rpDiv.querySelector('.rp-text')!;
    if (who === 'al') {
      let i = 0;
      const tick = () => { rpTxt.textContent = text.slice(0, i++); rp.scrollTop = rp.scrollHeight; if (i <= text.length) setTimeout(tick, 12); };
      tick();
    } else rpTxt.textContent = text;
    rp.scrollTop = rp.scrollHeight;
  }

  function openWin(title: string) { $('winTitle').textContent = title; $('win').classList.add('show'); audio.open(); }
  $('winClose').onclick = () => { $('win').classList.remove('show'); $('winBody').innerHTML = ''; };

  function openVideo(q: string) {
    openWin('Video · ' + q);
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
    const embedUrl = `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(q)}`;
    $('winBody').innerHTML =
      `<div class="yt-fallback">Can't see the video? <a href="${ytSearchUrl}" target="_blank" rel="noopener">Open in YouTube ↗</a></div>` +
      `<iframe src="${embedUrl}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"></iframe>`;
    const iframe = $('winBody').querySelector('iframe')!;
    iframe.onerror = () => {
      $('winBody').innerHTML =
        `<div class="pad" style="text-align:center;padding-top:60px">` +
        `<p style="margin-bottom:20px;color:var(--dim)">YouTube embedding is restricted.</p>` +
        `<a href="${ytSearchUrl}" target="_blank" rel="noopener" style="color:var(--cyan);font-size:16px;text-decoration:none;padding:12px 24px;border:1px solid rgba(95,230,255,.3);border-radius:12px">Open YouTube Search ↗</a></div>`;
    };
  }

  function openSpotify(q: string) {
    openWin('Spotify · ' + q);
    const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(q)}`;
    $('winBody').innerHTML =
      `<div class="spotify-embed">` +
      `<iframe src="https://open.spotify.com/embed/search/${encodeURIComponent(q)}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>` +
      `</div>` +
      `<div class="yt-fallback"><a href="${searchUrl}" target="_blank" rel="noopener">Open in Spotify ↗</a></div>`;
  }

  async function openSearch(q: string) {
    openWin('Search · ' + q);
    $('winBody').innerHTML = '<div class="pad">Searching…</div>';
    try {
      const r = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=8`);
      const d = await r.json();
      const items = d.query?.search || [];
      let html = '<div class="pad">';
      if (!items.length) html += '<div style="color:var(--dim)">No results found.</div>';
      for (const it of items)
        html += `<a href="https://en.wikipedia.org/?curid=${it.pageid}" target="_blank" style="display:block;color:var(--ink);padding:14px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;margin-bottom:8px;text-decoration:none;transition:.2s"><b>${it.title}</b><br><span style="color:var(--dim);font-size:13px">${it.snippet}…</span></a>`;
      html += `<a href="https://www.google.com/search?q=${encodeURIComponent(q)}" target="_blank" style="display:inline-block;margin-top:8px;color:var(--cyan);text-decoration:none;padding:8px 16px;border:1px solid rgba(95,230,255,.2);border-radius:8px">Continue on Google ↗</a></div>`;
      $('winBody').innerHTML = html;
    } catch { $('winBody').innerHTML = '<div class="pad" style="color:var(--dim)">Search error.</div>'; }
  }

  function renderCalendar() {
    const ev = loadEvents();
    let html = '<div class="pad"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">' +
      '<input id="evT" placeholder="Title" style="flex:1;min-width:140px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:10px;padding:10px;color:var(--ink)">' +
      '<input type="date" id="evD" style="background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:10px;padding:10px;color:var(--ink)">' +
      '<input type="time" id="evTime" style="background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:10px;padding:10px;color:var(--ink)">' +
      '<button id="evAdd" style="background:linear-gradient(135deg,var(--gold),#fff);border:none;border-radius:10px;padding:10px 18px;cursor:pointer;color:#04060d;font-weight:600">Add</button></div>';
    if (!ev.length) html += '<div style="color:var(--dim);font-style:italic">Calendar is empty.</div>';
    for (const e of ev)
      html += `<div style="display:flex;gap:12px;align-items:center;padding:12px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;margin-bottom:8px"><span style="color:var(--cyan);min-width:100px;font-size:13px">${e.date}${e.time ? ' · ' + e.time : ''}</span><span style="flex:1">${e.title}</span><button data-id="${e.id}" class="del" style="background:none;border:none;color:var(--dim);cursor:pointer;font-size:16px">✕</button></div>`;
    html += '</div>';
    $('winBody').innerHTML = html;
    $('evAdd').onclick = () => { const t = $<HTMLInputElement>('evT').value.trim(), d = $<HTMLInputElement>('evD').value; if (!t || !d) return; addEvent(t, d, $<HTMLInputElement>('evTime').value); renderCalendar(); };
    $('winBody').querySelectorAll<HTMLButtonElement>('.del').forEach(b => b.onclick = () => { saveEvents(loadEvents().filter(x => x.id !== b.dataset.id)); renderCalendar(); });
  }
  function openCalendar() { openWin('Calendar'); renderCalendar(); }

  async function ask(text: string) {
    if (!state.key) { openSetup(); return; }
    setStatus('thinking');
    try {
      const reply = await askGemini(state, text);
      const clean = runTags(reply, { onVideo: openVideo, onSearch: openSearch, onCalendar: openCalendar, onEvent: addEvent, onSpotify: openSpotify }) || 'Done.';
      audio.receive();
      addMsg(clean, 'al');
      voice.speak(clean);
    } catch (err: any) {
      if (voice.wakeOn) setTimeout(() => voice.setWake(true), 500);
      else setStatus('');
      addMsg(err.message || 'Connection error', 'sys');
    }
  }

  function send() {
    const input = $<HTMLInputElement>('input');
    const t = input.value.trim();
    if (!t) return;
    input.value = '';
    audio.send();
    addMsg(t, 'me');
    ask(t);
  }
  $('sendBtn').onclick = send;
  $('input').addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  $('micBtn').onclick = () => {
    audio.ensure();
    const turningOn = !voice.wakeOn;
    voice.setWake(turningOn);
    $('micBtn').classList.toggle('on', turningOn);
    if (turningOn) audio.micOn(); else audio.micOff();
  };
  $('muteBtn').onclick = () => { audio.toggleMute(); };
  $('newChat').onclick = () => { state.history = []; $('rpBody').innerHTML = ''; addMsg(state.name + ' ready.', 'al'); };

  // Detect button
  let detecting = false;
  $('detectBtn').onclick = () => {
    detecting = !detecting;
    if (detecting) { orb.startBodyDetection(); $('detectBtn').classList.add('active'); }
    else { orb.stopBodyDetection(); $('detectBtn').classList.remove('active'); }
  };

  // Dock items click
  document.querySelectorAll<HTMLButtonElement>('.dock-item[data-q]').forEach(btn => {
    btn.onclick = () => {
      const q = btn.dataset.q || '';
      if (!q) return;
      audio.send();
      addMsg(q, 'me');
      ask(q);
    };
  });

  // Mac dock magnification
  const dock = $('macDock');
  const dockItems = dock.querySelectorAll<HTMLButtonElement>('.dock-item');
  dock.addEventListener('mousemove', (e: MouseEvent) => {
    dockItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const dist = Math.abs(e.clientX - cx);
      const maxDist = 100;
      const scale = dist < maxDist ? 1 + (1 - dist / maxDist) * 0.5 : 1;
      const ty = dist < maxDist ? -(1 - dist / maxDist) * 14 : 0;
      item.style.transform = `scale(${scale}) translateY(${ty}px)`;
    });
  });
  dock.addEventListener('mouseleave', () => {
    dockItems.forEach(item => { item.style.transform = ''; });
  });

  function openSetup() {
    $<HTMLInputElement>('nameInput').value = state.name;
    $<HTMLInputElement>('keyInput').value = state.key;
    $<HTMLSelectElement>('micSel').value = state.micLang;
    $<HTMLSelectElement>('replySel').value = state.replyLang;
    $<HTMLSelectElement>('textLangSel').value = state.textLang;
    $<HTMLInputElement>('ambSlider').value = String(Math.round(audio.ambLevel * 100));
    $<HTMLInputElement>('spotifyId').value = socials.spotify;
    $<HTMLInputElement>('tiktokId').value = socials.tiktok;
    $<HTMLInputElement>('instaId').value = socials.insta;
    $<HTMLInputElement>('fbId').value = socials.fb;
    refreshVoiceList();
    $('overlay').classList.add('show');
  }
  function refreshVoiceList() {
    voice.loadVoices();
    const sel = $<HTMLSelectElement>('voiceSel');
    const list = voice.availableVoices();
    sel.innerHTML = list.map(v => `<option value="${v.name}">${v.name} (${v.lang})</option>`).join('') || '<option value="">No voice installed</option>';
  }
  $('settingsBtn').onclick = openSetup;
  $<HTMLSelectElement>('replySel').onchange = () => { state.replyLang = $<HTMLSelectElement>('replySel').value as any; refreshVoiceList(); };
  $<HTMLInputElement>('ambSlider').oninput = () => { audio.ensure(); audio.setAmbient(+$<HTMLInputElement>('ambSlider').value / 100); };
  $('saveBtn').onclick = () => {
    state.name = $<HTMLInputElement>('nameInput').value.trim() || 'ALPHA';
    state.key = $<HTMLInputElement>('keyInput').value.trim();
    state.micLang = $<HTMLSelectElement>('micSel').value as any;
    state.replyLang = $<HTMLSelectElement>('replySel').value as any;
    state.textLang = $<HTMLSelectElement>('textLangSel').value as TextLang;
    state.ambLevel = audio.ambLevel;
    voice.setMicLang(state.micLang);
    const vsel = $<HTMLSelectElement>('voiceSel').value;
    if (vsel) voice.setVoice(vsel);
    // Save social connections
    socials.spotify = $<HTMLInputElement>('spotifyId').value.trim();
    socials.tiktok = $<HTMLInputElement>('tiktokId').value.trim();
    socials.insta = $<HTMLInputElement>('instaId').value.trim();
    socials.fb = $<HTMLInputElement>('fbId').value.trim();
    localStorage.setItem('alpha_social_spotify', socials.spotify);
    localStorage.setItem('alpha_social_tiktok', socials.tiktok);
    localStorage.setItem('alpha_social_insta', socials.insta);
    localStorage.setItem('alpha_social_fb', socials.fb);
    updateConnIndicators();
    saveState(state);
    $('overlay').classList.remove('show');
    if (state.history.length === 0) addMsg(state.name + ' online. Talk to me or type.', 'al');
  };

  function pad(n: number) { return String(n).padStart(2, '0'); }
  setInterval(() => { const d = new Date(); $('clock').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`; }, 1000);

  updateConnIndicators();
  if (!state.key) openSetup();
  else addMsg(state.name + ' online. Talk to me or type.', 'al');
}
