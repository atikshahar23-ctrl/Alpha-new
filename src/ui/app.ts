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
        <button class="chip ghost" id="muteBtn">🔊</button>
        <button class="chip" id="settingsBtn">⚙ SETTINGS</button>
        <button class="chip ghost" id="newChat">+ NEW</button>
      </div>
      <div class="stage" id="stage"></div>
      <div class="dock">
        <div class="state" id="state">STANDBY</div>
        <div class="log" id="chat"></div>
        <div class="bar">
          <button class="ic mic" id="micBtn" title="Hey Alpha">🎙</button>
          <div class="pill"><input id="input" type="text" placeholder="Type or speak to Alpha…" /></div>
          <button class="ic send" id="sendBtn">↑</button>
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
        <select id="micSel"><option value="he">Hebrew</option><option value="en">English</option></select>
        <label>Voice language</label>
        <select id="replySel"><option value="en">English</option><option value="he">Hebrew</option></select>
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

  function setStatus(s: 'armed' | 'listening' | 'thinking' | 'speaking' | '') {
    const label = { armed: 'SAY "HEY ALPHA"', listening: 'LISTENING', thinking: 'THINKING', speaking: 'SPEAKING', '': 'STANDBY' }[s];
    $('state').textContent = label;
    orb.setEnergy(s === 'speaking' ? 0.95 : s === 'listening' ? 0.5 : s === 'armed' ? 0.2 : 0.06);
  }

  const voice = new VoiceEngine(state, (text) => { addMsg(text, 'me'); ask(text); }, setStatus);

  function addMsg(text: string, who: 'me' | 'al' | 'sys') {
    const label = { me: 'YOU', al: state.name, sys: 'SYSTEM' }[who];
    const div = document.createElement('div');
    div.className = 'turn ' + who;
    div.innerHTML = `<span class="who">${label}</span><div class="txt"></div>`;
    $('chat').appendChild(div);
    const txt = div.querySelector('.txt')!;
    if (who === 'al') {
      let i = 0;
      const tick = () => { txt.textContent = text.slice(0, i++); $('chat').scrollTop = $('chat').scrollHeight; if (i <= text.length) setTimeout(tick, 12); };
      tick();
    } else txt.textContent = text;
    $('chat').scrollTop = $('chat').scrollHeight;
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
      '<button id="evAdd" style="background:linear-gradient(135deg,var(--cyan),var(--purple));border:none;border-radius:10px;padding:10px 18px;cursor:pointer;color:#fff;font-weight:600">Add</button></div>';
    if (!ev.length) html += '<div style="color:var(--dim);font-style:italic">Calendar is empty.</div>';
    for (const e of ev)
      html += `<div style="display:flex;gap:12px;align-items:center;padding:12px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;margin-bottom:8px"><span style="color:var(--cyan);min-width:100px;font-size:13px">${e.date}${e.time ? ' · ' + e.time : ''}</span><span style="flex:1">${e.title}</span><button data-id="${e.id}" class="del" style="background:none;border:none;color:var(--dim);cursor:pointer;font-size:16px">🗑</button></div>`;
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
      setStatus(voice.wakeOn ? 'armed' : '');
      const s = String(err);
      addMsg(s.includes('400') || s.includes('403') ? 'Invalid Gemini key — check Settings.' : 'Connection error: ' + err.message, 'sys');
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
  $('muteBtn').onclick = () => { audio.toggleMute(); $('muteBtn').textContent = audio.muted ? '🔇' : '🔊'; };
  $('newChat').onclick = () => { state.history = []; $('chat').innerHTML = ''; addMsg(state.name + ' ready.', 'al'); };

  function openSetup() {
    $<HTMLInputElement>('nameInput').value = state.name;
    $<HTMLInputElement>('keyInput').value = state.key;
    $<HTMLSelectElement>('micSel').value = state.micLang;
    $<HTMLSelectElement>('replySel').value = state.replyLang;
    $<HTMLSelectElement>('textLangSel').value = state.textLang;
    $<HTMLInputElement>('ambSlider').value = String(Math.round(audio.ambLevel * 100));
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
    saveState(state);
    $('overlay').classList.remove('show');
    if (state.history.length === 0) addMsg(state.name + ' online. Talk to me or type.', 'al');
  };

  function pad(n: number) { return String(n).padStart(2, '0'); }
  setInterval(() => { const d = new Date(); $('clock').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`; }, 1000);

  if (!state.key) openSetup();
  else addMsg(state.name + ' online. Talk to me or type.', 'al');
}
