import { mountOrb, type OrbHandle } from '../orb/OrbScene';
import { mountFlowLines } from '../bg/flowLines';
import { loadState, saveState, addEvent, loadEvents, removeEvent, type AppState, type TextLang, type AIProvider, type VoiceGender } from '../assistant/state';
import { askAI, runTags } from '../assistant/gemini';
import { tryLocalCommand } from '../assistant/local';
import { VoiceEngine } from '../assistant/voice';
import { AudioEngine, type AmbientPreset } from '../assistant/audio';

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

      <aside class="left-panel" id="leftPanel">
        <div class="lp-head">
          <span class="lp-title">SYSTEM</span>
          <span class="lp-status" id="lpStatus">● ONLINE</span>
        </div>
        <div class="lp-section">
          <div class="lp-label">NEURAL ACTIVITY</div>
          <canvas id="neuralCanvas" class="neural-canvas"></canvas>
        </div>
        <div class="lp-section">
          <div class="lp-label">PERFORMANCE</div>
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
          <div class="lp-label">AI ENGINE</div>
          <div class="ai-status">
            <div class="ai-model" id="aiModelDisplay">GPT-4O MINI</div>
            <div class="ai-provider" id="aiProviderDisplay">VIA PUTER</div>
            <div class="ai-latency">
              <span class="latency-dot"></span>
              <span id="aiLatency">Ready</span>
            </div>
          </div>
        </div>
        <div class="lp-section">
          <div class="lp-label">AUDIO SPECTRUM</div>
          <canvas id="waveCanvas" class="wave-canvas"></canvas>
        </div>
        <div class="lp-section">
          <div class="lp-label">SESSION</div>
          <div class="quick-stats">
            <div class="qs"><span class="qs-val" id="msgCount">0</span><span class="qs-label">MSGS</span></div>
            <div class="qs"><span class="qs-val" id="tokenCount">0</span><span class="qs-label">TOKENS</span></div>
            <div class="qs"><span class="qs-val" id="uptimeVal">00:00</span><span class="qs-label">UPTIME</span></div>
          </div>
        </div>
      </aside>

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
          <button class="dock-item" id="calBtn">
            <span class="di"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
            <span class="dl">Calendar</span>
            <span class="cal-badge" id="calBadge"></span>
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
        <div class="fab-group">
          <button class="hg-fab" id="hgBtn" title="HeavyGuard OS">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span>HeavyGuard</span>
          </button>
          <a class="hg-fab trade-fab" id="tradeBtn" href="https://heavt-guard-simulator-1.onrender.com/" target="_blank" rel="noopener" title="Trading System">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
            <span>Trading</span>
          </a>
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
        <p>Works free out of the box via Puter — no API key required.</p>

        <div class="settings-section">
          <div class="ss-title">GENERAL</div>
          <label>Assistant name</label><input id="nameInput" value="ALPHA" />
          <div class="setting-row">
            <label>Sound effects</label>
            <label class="toggle"><input type="checkbox" id="sfxCheck" /><span class="toggle-slider"></span></label>
          </div>
          <div class="setting-row">
            <label>Haptic feedback</label>
            <label class="toggle"><input type="checkbox" id="hapticsCheck" /><span class="toggle-slider"></span></label>
          </div>
        </div>

        <div class="settings-section">
          <div class="ss-title">VOICE & LANGUAGE</div>
          <label>Mic language</label>
          <select id="micSel"><option value="he">Hebrew</option><option value="en">English</option><option value="es">Español</option></select>
          <label>Voice language</label>
          <select id="replySel"><option value="en">English</option><option value="he">Hebrew</option><option value="es">Español</option></select>
          <label>Text reply language</label>
          <select id="textLangSel">
            <option value="auto">Same as voice</option>
            <option value="en">English</option>
            <option value="he">Hebrew</option>
            <option value="ar">Arabic</option>
            <option value="ru">Russian</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
            <option value="de">German</option>
          </select>
          <label>Voice gender</label>
          <div class="gender-picker" id="genderPicker">
            <button class="gender-btn" data-g="female"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/></svg> Female</button>
            <button class="gender-btn" data-g="male"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="14" r="5"/><path d="M21 3l-6.5 6.5M21 3h-5M21 3v5"/></svg> Male</button>
            <button class="gender-btn" data-g="auto">Auto</button>
          </div>
          <label>Voice</label><select id="voiceSel"></select>
          <label>Speed <span id="speedVal" class="range-val">1.0x</span></label>
          <input type="range" id="speedSlider" min="50" max="200" value="100" step="5" />
          <label>Pitch <span id="pitchVal" class="range-val">1.0</span></label>
          <input type="range" id="pitchSlider" min="50" max="200" value="100" step="5" />
          <div class="setting-row">
            <label>Auto speak responses</label>
            <label class="toggle"><input type="checkbox" id="autoSpeakCheck" checked /><span class="toggle-slider"></span></label>
          </div>
          <button class="test-voice-btn" id="testVoiceBtn">Test voice</button>
        </div>

        <div class="settings-section">
          <div class="ss-title">AUDIO</div>
          <label>Ambient sound</label>
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
          <label>Volume <span id="ambVal" class="range-val">40%</span></label>
          <input type="range" id="ambSlider" min="0" max="100" value="40" />
        </div>

        <div class="settings-section">
          <div class="ss-title">AI ENGINE</div>
          <label>AI Provider</label>
          <select id="providerSel">
            <option value="puter">Puter — Free, no key</option>
            <option value="gemini">Gemini (Google)</option>
            <option value="grok">Grok (xAI)</option>
            <option value="openai">ChatGPT (OpenAI)</option>
          </select>
          <label>Puter model (free)</label>
          <select id="puterModelSel">
            <option value="gpt-4o-mini">GPT-4o mini (fast)</option>
            <option value="gpt-4o">GPT-4o (smartest)</option>
            <option value="o4-mini">o4-mini (reasoning)</option>
            <option value="claude-sonnet-4">Claude Sonnet 4</option>
            <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
          </select>
          <p style="margin:2px 0 10px;font-size:11px;color:var(--dim)">Puter is free — a one-time sign-in popup appears on first use. Keys below are optional fallbacks.</p>
          <label>Gemini API key</label><input id="keyInput" type="password" placeholder="AIza..." />
          <label>Grok API key</label><input id="grokKeyInput" type="password" placeholder="xai-..." />
          <label>OpenAI API key</label><input id="openaiKeyInput" type="password" placeholder="sk-..." />
        </div>

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

        <button class="go" id="saveBtn">Save</button>
      </div></div>
      <div class="hg-overlay" id="hgOverlay">
        <div class="hg-frame">
          <div class="hg-topbar">
            <span class="hg-topbar-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> HEAVYGUARD OS</span>
            <button class="hg-close" id="hgClose">✕</button>
          </div>
          <iframe id="hgIframe" class="hg-iframe" src="" allow="camera;microphone"></iframe>
        </div>
      </div>
      <div class="ar-overlay" id="arOverlay">
        <div class="ar-frame">
          <div class="ar-topbar">
            <span class="ar-topbar-title"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2"/><circle cx="12" cy="12" r="3"/></svg> AR CAMERA</span>
            <div class="ar-topbar-tools">
              <button class="ar-tool-btn" id="arAddBall" title="כדור">⚽</button>
              <button class="ar-tool-btn" id="arAddCube" title="קוביה">🔲</button>
              <button class="ar-tool-btn" id="arAddStar" title="כוכב">⭐</button>
              <button class="ar-tool-btn" id="arAddDiamond" title="יהלום">💎</button>
              <button class="ar-tool-btn ar-fx-btn" id="arFxFire" title="אש">🔥</button>
              <button class="ar-tool-btn ar-fx-btn" id="arFxWater" title="מים">💧</button>
              <button class="ar-tool-btn ar-fx-btn" id="arFxLaser" title="לייזר">⚡</button>
              <button class="ar-tool-btn ar-fx-btn" id="arFxSparkle" title="ניצוצות">✨</button>
              <button class="ar-tool-btn ar-fx-btn" id="arFxRainbow" title="קשת">🌈</button>
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
              <div class="ar-status" id="arStatus">Initializing camera…</div>
              <div class="ar-hand-indicator" id="arHandIndicator"></div>
            </div>
            <div class="ar-buttons" id="arButtons"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const state: AppState = loadState();
  const audio = new AudioEngine();
  audio.ambLevel = state.ambLevel;
  audio.ambPreset = (state.ambPreset || 'pad') as AmbientPreset;
  audio.sfxOn = state.sfxOn;

  let orb: OrbHandle;
  try {
    orb = mountOrb($('stage'));
  } catch {
    orb = { setEnergy() {}, dispose() {}, startBodyDetection() {}, stopBodyDetection() {} };
  }
  mountFlowLines(root.querySelector('.app')!);

  // AI capability nodes overlay
  {
    const isMob = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
    const stage = $('stage');
    const nodesEl = document.createElement('div');
    nodesEl.className = 'ai-nodes';
    const labels = isMob
      ? ['Memory','Calendar','Tasks','Search','Translate','Analytics','Assistant','Weather','Music','Notes']
      : ['Researcher','Strategist','Finance','Memory','Design','Calendar','Engineering','Social','Analytics','Ops','Developer','Sales','DM','Chief of Staff'];
    const cx = 50, cy = isMob ? 40 : 50;
    const rx = isMob ? 42 : 44, ry = isMob ? 28 : 40;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'ai-nodes-svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    nodesEl.appendChild(svg);
    const nodeQueries: Record<string, string> = {
      'Researcher': 'Help me research a topic',
      'Strategist': 'Help me plan a strategy',
      'Finance': 'Help me with financial analysis',
      'Memory': 'What do you remember about me?',
      'Design': 'Help me with design',
      'Engineering': 'Help me with engineering',
      'Social': 'Check my social media',
      'Analytics': 'Show me analytics and insights',
      'Ops': 'Help me with operations',
      'Developer': 'Help me write code',
      'Sales': 'Help me with sales strategy',
      'DM': 'Help me draft a message',
      'Chief of Staff': 'What are my priorities today?',
      'Tasks': 'Show me my tasks',
      'Search': 'Search the web for me',
      'Translate': 'Translate something for me',
      'Assistant': 'How can you help me?',
      'Weather': "What's the weather today?",
      'Music': 'Play some music',
      'Notes': 'Help me take notes',
    };
    labels.forEach((lbl, i) => {
      const a = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(a) * rx;
      const y = cy + Math.sin(a) * ry;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(cx)); line.setAttribute('y1', String(cy));
      line.setAttribute('x2', String(x)); line.setAttribute('y2', String(y));
      line.setAttribute('class', 'ai-node-line');
      svg.appendChild(line);
      const dot = document.createElement('div');
      dot.className = 'ai-node';
      dot.style.left = x + '%';
      dot.style.top = y + '%';
      dot.style.pointerEvents = 'all';
      dot.style.cursor = 'pointer';
      dot.innerHTML = `<span class="ai-node-dot"></span><span class="ai-node-lbl">${lbl}</span>`;
      dot.onclick = () => {
        if (lbl === 'Calendar') { openCalendar(); return; }
        const q = nodeQueries[lbl] || `Help me with ${lbl}`;
        audio.send();
        addMsg(q, 'me');
        ask(q);
      };
      nodesEl.appendChild(dot);
    });
    stage.appendChild(nodesEl);
  }

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

  function updateCalBadge() {
    const events = loadEvents();
    const badge = $('calBadge');
    if (events.length > 0) {
      badge.textContent = String(events.length);
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
  updateCalBadge();

  let lpMsgCount = 0;
  let lpTokenCount = 0;

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
    // Left panel counters
    lpMsgCount++;
    const mcEl = document.getElementById('msgCount');
    if (mcEl) mcEl.textContent = String(lpMsgCount);
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    lpTokenCount += Math.round(words * 1.3);
    const tcEl = document.getElementById('tokenCount');
    if (tcEl) tcEl.textContent = String(lpTokenCount);
  }

  function openWin(title: string) { $('winTitle').textContent = title; $('win').classList.add('show'); audio.open(); }
  $('winClose').onclick = () => { $('win').classList.remove('show'); $('winBody').innerHTML = ''; };

  function openVideo(q: string) {
    openWin('Video · ' + q);
    const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
    $('winBody').innerHTML = `<div class="pad" style="text-align:center">
      <div style="color:var(--dim);margin-bottom:12px;font-size:13px">Searching YouTube…</div>
    </div>`;
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=4&key=AIzaSyDummyKeyForFallback`)
      .then(() => {})
      .catch(() => {});
    const piped = `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(q)}&filter=videos`;
    fetch(piped).then(r => r.json()).then(d => {
      const items = (d.items || []).slice(0, 6);
      if (!items.length) throw new Error('no results');
      let html = '';
      for (const v of items) {
        const vid = (v.url || '').replace('/watch?v=', '');
        const embedUrl = `https://www.youtube-nocookie.com/embed${vid}`;
        const thumbUrl = v.thumbnail || `https://i.ytimg.com/vi${vid}/hqdefault.jpg`;
        html += `<div class="media-card" data-embed="${embedUrl}">
          <img src="${thumbUrl}" style="width:100%;border-radius:8px;cursor:pointer" onerror="this.style.display='none'" />
          <div style="padding:8px 0 4px;font-size:13px;font-weight:600;color:var(--ink)">${v.title || q}</div>
          <div style="font-size:11px;color:var(--dim)">${v.uploaderName || ''} · ${v.duration ? Math.floor(v.duration/60)+':'+String(v.duration%60).padStart(2,'0') : ''}</div>
        </div>`;
      }
      html += `<div style="text-align:center;margin-top:12px"><a href="${ytSearchUrl}" target="_blank" rel="noopener" style="color:var(--cyan);font-size:12px">חפש עוד ב-YouTube ↗</a></div>`;
      $('winBody').innerHTML = `<div class="pad media-grid">${html}</div>`;
      $('winBody').querySelectorAll<HTMLElement>('.media-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.onclick = () => {
          const embed = card.dataset.embed || '';
          $('winBody').innerHTML = `<iframe src="${embed}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="width:100%;height:100%;border:none"></iframe>`;
        };
      });
    }).catch(() => {
      $('winBody').innerHTML = `<div class="pad" style="text-align:center;padding-top:30px">
        <div style="font-size:40px;margin-bottom:16px">🎬</div>
        <div style="font-size:18px;font-weight:600;color:var(--ink);margin-bottom:8px">${q}</div>
        <div style="color:var(--dim);font-size:13px;margin-bottom:20px">לחץ לפתיחה ב-YouTube</div>
        <a href="${ytSearchUrl}" target="_blank" rel="noopener" class="media-link-btn">▶ YouTube</a>
      </div>`;
    });
  }

  function openSpotify(q: string) {
    openWin('Spotify · ' + q);
    const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(q)}`;
    $('winBody').innerHTML = `<div class="pad" style="text-align:center;padding-top:20px">
      <div style="font-size:40px;margin-bottom:16px">🎵</div>
      <div style="font-size:18px;font-weight:600;color:var(--ink);margin-bottom:8px">${q}</div>
      <div style="color:var(--dim);font-size:13px;margin-bottom:20px">Open in Spotify to listen</div>
      <a href="${searchUrl}" target="_blank" rel="noopener" class="media-link-btn" style="background:rgba(30,215,96,.15);border-color:rgba(30,215,96,.4);color:#1db954">▶ Spotify</a>
      <div style="margin-top:16px">
        <iframe src="https://open.spotify.com/embed/search/${encodeURIComponent(q)}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" style="width:100%;height:160px;border:none;border-radius:12px" onerror="this.style.display='none'"></iframe>
      </div>
    </div>`;
  }

  function openGDoc(url: string) {
    openWin('Google Doc');
    const embedUrl = url.replace(/\/edit.*$/, '/preview').replace(/\/view.*$/, '/preview');
    $('winBody').innerHTML = `<div style="display:flex;flex-direction:column;height:100%">
      <iframe src="${embedUrl}" style="flex:1;width:100%;border:none;border-radius:8px" allow="autoplay" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
      <div style="text-align:center;padding:8px">
        <a href="${url}" target="_blank" rel="noopener" class="media-link-btn">פתח ב-Google ↗</a>
      </div>
    </div>`;
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
      html += `<a href="https://www.google.com/search?q=${encodeURIComponent(q)}" target="_blank" style="display:inline-block;margin-top:8px;color:var(--cyan);text-decoration:none;padding:8px 16px;border:1px solid rgba(218,165,32,.2);border-radius:8px">Continue on Google ↗</a></div>`;
      $('winBody').innerHTML = html;
    } catch { $('winBody').innerHTML = '<div class="pad" style="color:var(--dim)">Search error.</div>'; }
  }

  function renderCalendar() {
    const ev = loadEvents();
    let html = '<div class="pad"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">' +
      '<input id="evT" placeholder="Title" style="flex:1;min-width:140px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:10px;padding:10px;color:var(--ink)">' +
      '<input type="date" id="evD" style="background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:10px;padding:10px;color:var(--ink)">' +
      '<input type="time" id="evTime" style="background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:10px;padding:10px;color:var(--ink)">' +
      '<button id="evAdd" style="background:linear-gradient(135deg,var(--gold),#fff);border:none;border-radius:10px;padding:10px 18px;cursor:pointer;color:#0a0806;font-weight:600">Add</button></div>';
    if (!ev.length) html += '<div style="color:var(--dim);font-style:italic">Calendar is empty.</div>';
    for (const e of ev) {
      const isHg = e.id.startsWith('hg:');
      const badge = isHg ? '<span style="font-size:9px;letter-spacing:1px;color:var(--gold);background:rgba(255,194,77,.1);padding:2px 6px;border-radius:4px;margin-left:6px">HG</span>' : '';
      html += `<div style="display:flex;gap:12px;align-items:center;padding:12px;background:rgba(255,255,255,.03);border:1px solid ${isHg ? 'rgba(255,194,77,.15)' : 'var(--line)'};border-radius:12px;margin-bottom:8px"><span style="color:var(--cyan);min-width:100px;font-size:13px">${e.date}${e.time ? ' · ' + e.time : ''}</span><span style="flex:1">${e.title}${badge}</span><button data-id="${e.id}" class="del" style="background:none;border:none;color:var(--dim);cursor:pointer;font-size:16px">✕</button></div>`;
    }
    html += '</div>';
    $('winBody').innerHTML = html;
    $('evAdd').onclick = () => { const t = $<HTMLInputElement>('evT').value.trim(), d = $<HTMLInputElement>('evD').value; if (!t || !d) return; addEvent(t, d, $<HTMLInputElement>('evTime').value); renderCalendar(); updateCalBadge(); };
    $('winBody').querySelectorAll<HTMLButtonElement>('.del').forEach(b => b.onclick = () => { removeEvent(b.dataset.id!); renderCalendar(); updateCalBadge(); });
  }
  function openCalendar() { openWin('Calendar'); renderCalendar(); }

  let asking = false;
  async function ask(text: string) {
    const localReply = tryLocalCommand(text);
    if (localReply) {
      audio.receive();
      addMsg(localReply, 'al');
      voice.speak(localReply);
      return;
    }
    const puterReady = typeof (window as any).puter !== 'undefined';
    const canAI = puterReady || state.key || state.grokKey || state.openaiKey;
    if (!canAI) { openSetup(); return; }
    if (asking) return;
    asking = true;
    setStatus('thinking');
    try {
      const reply = await askAI(state, text);
      const clean = runTags(reply, {
        onVideo: openVideo, onSearch: openSearch, onCalendar: openCalendar,
        onEvent: addEvent, onSpotify: openSpotify,
        onDiary: async (title: string, date: string) => {
          const tasks = await hgLoad('hg2:tasks');
          const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          tasks.unshift({ id, title, date, done: false, ts: Date.now() });
          const storage = (window as any).storage || (window as any).puter?.kv;
          if (storage) { try { await storage.set('hg2:tasks', JSON.stringify(tasks)); } catch {} }
          localStorage.setItem('hg2:tasks', JSON.stringify(tasks));
        },
        onHgSearch: hgSearchLicense,
        onHgEarnings: hgShowEarnings,
        onHgQuote: hgCreateQuote,
        onArCamera: openArCamera,
        onGDoc: openGDoc,
      }) || 'Done.';
      audio.receive();
      addMsg(clean, 'al');
      voice.speak(clean);
    } catch (err: any) {
      if (voice.wakeOn) setTimeout(() => voice.setWake(true), 500);
      else setStatus('');
      addMsg(err.message || 'Connection error', 'sys');
    } finally {
      asking = false;
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
    if (!voice.supported) {
      addMsg('Speech recognition is not supported in this browser.', 'al');
      return;
    }
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

  // HeavyGuard OS
  const hgBase = import.meta.env.BASE_URL || '/';
  function ensureHgIframe(): HTMLIFrameElement {
    const iframe = $<HTMLIFrameElement>('hgIframe');
    if (!iframe.src || iframe.src === 'about:blank' || !iframe.src.includes('heavyguard')) {
      iframe.src = hgBase + 'heavyguard.html';
    }
    return iframe;
  }
  $('hgBtn').onclick = () => {
    ensureHgIframe();
    $('hgOverlay').classList.add('show');
  };
  $('hgClose').onclick = () => { $('hgOverlay').classList.remove('show'); };

  window.addEventListener('message', (e) => {
    if (!e.data || e.data.source !== 'heavyguard') return;
    if (e.data.action === 'taskAdded') {
      addMsg(`נרשם ביומן: ${e.data.payload.title}`, 'sys');
    }
  });

  async function hgLoad(key: string): Promise<any[]> {
    const storage = (window as any).storage || (window as any).puter?.kv;
    if (storage) {
      try {
        const r = await storage.get(key);
        if (r && r.value != null) return JSON.parse(r.value);
      } catch {}
    }
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
  }

  const CONTRACTORS: Record<string, string> = {
    kobi: 'קובי', asi: 'אסי', sagi: 'שגיא מערכות',
    mb: 'm.b מערכות', sd: 'ס.ד מיגונים', hg: 'Heavy Guard',
  };
  function cName(id: string) { return CONTRACTORS[id] || id; }

  async function hgSearchLicense(query: string) {
    const q = query.replace(/[-\s]/g, '').toLowerCase();
    const index = await hgLoad('hg2:index');
    if (!index.length) {
      addMsg('אין נתונים ב-HeavyGuard. יש להוסיף רשומות תחילה.', 'sys');
      return;
    }
    const results = index.filter((r: any) => {
      const id = (r.idNumber || '').replace(/[-\s]/g, '').toLowerCase();
      const cust = (r.customer || '').toLowerCase();
      const veh = (r.vehicleType || '').toLowerCase();
      const mfr = (r.manufacturer || '').toLowerCase();
      return id.includes(q) || q.includes(id) || cust.includes(q) || veh.includes(q) || mfr.includes(q);
    }).map((r: any) => ({
      id: r.id, idNumber: r.idNumber, idType: r.idType,
      contractor: cName(r.contractor), contractorId: r.contractor,
      date: r.date, price: r.price, vehicleType: r.vehicleType,
      manufacturer: r.manufacturer, installType: r.installType,
      location: r.location, customer: r.customer, phone: r.phone,
    }));
    if (!results.length) {
      addMsg(`לא נמצאו תוצאות עבור: ${query}`, 'sys');
      return;
    }
    openWin(`HeavyGuard · חיפוש: ${query}`);
    let html = '<div class="pad">';
    for (const r of results) {
      html += `<div style="background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:var(--cyan);font-weight:600;font-size:18px;direction:ltr">${r.idNumber || '—'}</span>
          <span style="color:var(--dim);font-size:13px">${r.date || ''}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:13px">
          <span><span style="color:var(--dim)">סוג:</span> ${r.idType || ''}</span>
          <span><span style="color:var(--dim)">קבלן:</span> ${r.contractor || ''}</span>
          <span><span style="color:var(--dim)">רכב:</span> ${r.vehicleType || ''} ${r.manufacturer || ''}</span>
          <span><span style="color:var(--dim)">התקנה:</span> ${r.installType || ''}</span>
          <span><span style="color:var(--dim)">מחיר:</span> <span style="color:var(--gold)">₪${r.price || 0}</span></span>
          <span><span style="color:var(--dim)">מיקום:</span> ${r.location || ''}</span>
          ${r.customer ? `<span><span style="color:var(--dim)">לקוח:</span> ${r.customer}</span>` : ''}
          ${r.phone ? `<span><span style="color:var(--dim)">טלפון:</span> <a href="tel:${r.phone}" style="color:var(--cyan)">${r.phone}</a></span>` : ''}
        </div>
      </div>`;
    }
    html += '</div>';
    $('winBody').innerHTML = html;
  }

  async function hgShowEarnings(contractor: string, month: string) {
    const index = await hgLoad('hg2:index');
    if (!index.length) {
      addMsg('אין נתוני הכנסות ב-HeavyGuard.', 'sys');
      return;
    }
    const curMonth = new Date().toISOString().slice(0, 7);
    const effectiveMonth = month || curMonth;
    let filtered = index;
    if (contractor) {
      const cLow = contractor.toLowerCase();
      filtered = filtered.filter((r: any) => {
        const cid = (r.contractor || '').toLowerCase();
        const cn = cName(r.contractor).toLowerCase();
        return cid.includes(cLow) || cn.includes(cLow) || cLow.includes(cid) || cLow.includes(cn);
      });
    }
    const monthFiltered = filtered.filter((r: any) => (r.date || '').startsWith(effectiveMonth));
    const allTimeFiltered = filtered;
    const byContractor: Record<string, { total: number; count: number; jobs: any[] }> = {};
    for (const r of monthFiltered) {
      const cn = cName(r.contractor);
      if (!byContractor[cn]) byContractor[cn] = { total: 0, count: 0, jobs: [] };
      byContractor[cn].total += r.price || 0;
      byContractor[cn].count++;
      byContractor[cn].jobs.push({ date: r.date, price: r.price, type: r.installType, vehicle: r.vehicleType, id: r.idNumber });
    }
    const byContractorAll: Record<string, { total: number; count: number }> = {};
    for (const r of allTimeFiltered) {
      const cn = cName(r.contractor);
      if (!byContractorAll[cn]) byContractorAll[cn] = { total: 0, count: 0 };
      byContractorAll[cn].total += r.price || 0;
      byContractorAll[cn].count++;
    }
    const grandTotal = monthFiltered.reduce((s: number, r: any) => s + (r.price || 0), 0);
    const totalJobs = monthFiltered.length;
    const allTimeTotal = allTimeFiltered.reduce((s: number, r: any) => s + (r.price || 0), 0);
    const hebrewMonths = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
    const [y, m] = effectiveMonth.split('-');
    const monthLabel = `${hebrewMonths[parseInt(m) - 1]} ${y}`;

    openWin(`HeavyGuard · הכנסות · ${monthLabel}`);
    let html = '<div class="pad" style="direction:rtl">';
    html += `<div style="text-align:center;margin-bottom:20px;padding:16px;background:rgba(218,165,32,.06);border-radius:16px;border:1px solid rgba(218,165,32,.15)">
      <div style="font-size:11px;letter-spacing:2px;color:var(--dim);text-transform:uppercase;margin-bottom:4px">${monthLabel}</div>
      <div style="font-size:36px;font-weight:700;color:var(--gold);direction:ltr">₪${grandTotal.toLocaleString()}</div>
      <div style="color:var(--dim);font-size:13px;margin-top:4px">${totalJobs} עבודות החודש</div>
      ${allTimeTotal !== grandTotal ? `<div style="color:var(--dim);font-size:11px;margin-top:2px;opacity:.6">סה"כ כללי: ₪${allTimeTotal.toLocaleString()}</div>` : ''}
    </div>`;
    const entries = Object.entries(byContractor).sort((a, b) => (b[1] as any).total - (a[1] as any).total);
    if (!entries.length) {
      html += '<div style="text-align:center;color:var(--dim);padding:20px">אין עבודות לחודש זה</div>';
    }
    for (const [name, info] of entries) {
      const pct = grandTotal ? Math.round((info.total / grandTotal) * 100) : 0;
      const allTime = byContractorAll[name];
      const uid = 'ej_' + name.replace(/\s/g, '_');
      html += `<div style="background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-weight:600;font-size:15px">${name}</span>
          <span style="color:var(--gold);font-weight:700;font-size:18px;direction:ltr">₪${info.total.toLocaleString()}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <div style="flex:1;background:rgba(255,255,255,.06);border-radius:4px;height:8px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,var(--gold),var(--cyan));border-radius:4px;transition:width .5s"></div>
          </div>
          <span style="color:var(--dim);font-size:12px;min-width:60px;text-align:left">${pct}% · ${info.count} עבודות</span>
        </div>
        ${allTime ? `<div style="font-size:11px;color:var(--dim);opacity:.6">סה"כ כללי: ₪${allTime.total.toLocaleString()} (${allTime.count} עבודות)</div>` : ''}
        <button data-target="${uid}" style="margin-top:8px;background:none;border:1px solid var(--line);color:var(--cyan);padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;transition:.2s" class="earningsToggle">פרטי עבודות ▼</button>
        <div id="${uid}" style="display:none;margin-top:8px">
          ${info.jobs.map((j: any) => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(218,165,32,.05);font-size:12px">
            <span style="color:var(--dim)">${j.date || ''} · ${j.type || ''} · ${j.vehicle || ''}</span>
            <span style="color:var(--gold);direction:ltr">₪${(j.price || 0).toLocaleString()}</span>
          </div>`).join('')}
        </div>
      </div>`;
    }
    html += '</div>';
    $('winBody').innerHTML = html;
    $('winBody').querySelectorAll<HTMLButtonElement>('.earningsToggle').forEach(btn => {
      btn.onclick = () => {
        const target = document.getElementById(btn.dataset.target || '');
        if (target) {
          const open = target.style.display !== 'none';
          target.style.display = open ? 'none' : 'block';
          btn.textContent = open ? 'פרטי עבודות ▼' : 'הסתר ▲';
        }
      };
    });
  }

  async function hgCreateQuote(customer: string, phone: string, itemsStr: string) {
    const items = itemsStr.split(',').map(s => {
      const [desc, priceStr] = s.trim().split(':');
      return { description: (desc || '').trim(), price: parseFloat(priceStr) || 0, qty: 1 };
    }).filter(i => i.description);
    const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const newQuote = {
      id: uid, customer: customer || '', phone: phone || '', items,
      total: items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0),
      date: new Date().toISOString().slice(0, 10), status: 'draft', ts: Date.now(),
    };
    const quotes = await hgLoad('hg2:quotes');
    quotes.unshift(newQuote);
    const storage = (window as any).storage || (window as any).puter?.kv;
    if (storage) {
      try { await storage.set('hg2:quotes', JSON.stringify(quotes)); } catch {}
    }
    localStorage.setItem('hg2:quotes', JSON.stringify(quotes));
    addMsg(`הצעת מחיר נוצרה עבור ${customer || 'לקוח'}`, 'sys');
  }

  // AR Camera with object placement, hand physics, and effects
  let arStream: MediaStream | null = null;
  let arAnimFrame = 0;

  interface ArObj {
    x: number; y: number; vx: number; vy: number;
    r: number; type: 'ball' | 'cube' | 'star' | 'diamond';
    color: string; rotation: number; rotSpd: number;
    grabbed: boolean;
  }
  let arObjects: ArObj[] = [];
  let arHandPos = { x: -1, y: -1, pinching: false };
  let arGrabbed: ArObj | null = null;
  let arObjCtx: CanvasRenderingContext2D | null = null;

  type ArEffect = 'none' | 'fire' | 'water' | 'laser' | 'sparkle' | 'rainbow';
  let arCurrentFx: ArEffect = 'none';
  let arFxCtx: CanvasRenderingContext2D | null = null;

  interface FxParticle {
    x: number; y: number; vx: number; vy: number;
    life: number; maxLife: number; size: number;
    color: string; alpha: number;
  }
  let arFxParticles: FxParticle[] = [];
  let arLaserTrail: { x: number; y: number; t: number }[] = [];

  function spawnFxParticles(hx: number, hy: number, w: number, h: number) {
    const px = hx * w, py = hy * h;
    const count = arCurrentFx === 'laser' ? 1 : 4;
    for (let i = 0; i < count; i++) {
      const spread = 20 + Math.random() * 15;
      switch (arCurrentFx) {
        case 'fire': {
          arFxParticles.push({
            x: px + (Math.random() - 0.5) * spread, y: py + (Math.random() - 0.5) * spread,
            vx: (Math.random() - 0.5) * 3, vy: -2 - Math.random() * 5,
            life: 1, maxLife: 0.6 + Math.random() * 0.5, size: 6 + Math.random() * 10,
            color: ['#ff4400', '#ff7700', '#ffaa00', '#ffdd44', '#ff2200'][Math.floor(Math.random() * 5)],
            alpha: 0.9,
          });
          break;
        }
        case 'water': {
          arFxParticles.push({
            x: px + (Math.random() - 0.5) * spread, y: py,
            vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 4,
            life: 1, maxLife: 0.8 + Math.random() * 0.4, size: 4 + Math.random() * 6,
            color: ['#00aaff', '#44ccff', '#0088dd', '#66ddff', '#0066cc'][Math.floor(Math.random() * 5)],
            alpha: 0.7,
          });
          break;
        }
        case 'laser': {
          arLaserTrail.push({ x: px, y: py, t: Date.now() });
          if (arLaserTrail.length > 30) arLaserTrail.shift();
          break;
        }
        case 'sparkle': {
          arFxParticles.push({
            x: px + (Math.random() - 0.5) * spread * 2, y: py + (Math.random() - 0.5) * spread * 2,
            vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4,
            life: 1, maxLife: 0.5 + Math.random() * 0.5, size: 2 + Math.random() * 5,
            color: ['#fff', '#ffd700', '#ff69b4', '#00ffff', '#ff4444', '#44ff44'][Math.floor(Math.random() * 6)],
            alpha: 1,
          });
          break;
        }
        case 'rainbow': {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 3;
          const hue = (Date.now() / 10 + i * 60) % 360;
          arFxParticles.push({
            x: px + (Math.random() - 0.5) * spread, y: py + (Math.random() - 0.5) * spread,
            vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            life: 1, maxLife: 0.7 + Math.random() * 0.5, size: 5 + Math.random() * 7,
            color: `hsl(${hue},100%,60%)`,
            alpha: 0.85,
          });
          break;
        }
      }
    }
  }

  function drawFxParticles() {
    if (!arFxCtx) return;
    const cvs = arFxCtx.canvas;
    const ctx = arFxCtx;
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    if (arCurrentFx === 'laser' && arLaserTrail.length > 1) {
      const now = Date.now();
      arLaserTrail = arLaserTrail.filter(p => now - p.t < 500);
      if (arLaserTrail.length > 1) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (let w = 3; w >= 0; w--) {
          ctx.beginPath();
          const alpha = w === 3 ? 0.1 : w === 2 ? 0.2 : w === 1 ? 0.5 : 1;
          const width = w === 3 ? 20 : w === 2 ? 12 : w === 1 ? 6 : 2;
          ctx.strokeStyle = w === 0 ? '#fff' : `rgba(255,40,40,${alpha})`;
          ctx.lineWidth = width;
          ctx.shadowColor = '#ff0000';
          ctx.shadowBlur = w === 3 ? 30 : 0;
          ctx.moveTo(arLaserTrail[0].x, arLaserTrail[0].y);
          for (let i = 1; i < arLaserTrail.length; i++) {
            ctx.lineTo(arLaserTrail[i].x, arLaserTrail[i].y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    const dt = 1 / 60;
    for (let i = arFxParticles.length - 1; i >= 0; i--) {
      const p = arFxParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt / p.maxLife;

      if (arCurrentFx === 'fire') p.vy -= 0.15;
      if (arCurrentFx === 'water') p.vy += 0.1;

      if (p.life <= 0) {
        arFxParticles.splice(i, 1);
        continue;
      }

      const a = p.life * p.alpha;
      ctx.save();
      ctx.globalAlpha = a;

      if (arCurrentFx === 'sparkle') {
        ctx.translate(p.x, p.y);
        ctx.rotate(Date.now() / 200 + i);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        for (let s = 0; s < 4; s++) {
          ctx.fillRect(-p.size * 0.15, -p.size, p.size * 0.3, p.size * 2);
          ctx.rotate(Math.PI / 4);
        }
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (arCurrentFx === 'fire' ? (0.5 + p.life * 0.5) : 1), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        if (arCurrentFx === 'fire') {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 15;
        }
        ctx.fill();
      }
      ctx.restore();
    }

    if (arHandPos.x >= 0 && arCurrentFx !== 'none') {
      const cvs2 = arFxCtx.canvas;
      spawnFxParticles(arHandPos.x, arHandPos.y, cvs2.width, cvs2.height);
    }
  }

  function addArObject(type: ArObj['type']) {
    const colors = ['#daa520', '#f5e6c8', '#e8a040', '#c8956a', '#f0d090', '#d4a84d'];
    arObjects.push({
      x: 0.3 + Math.random() * 0.4,
      y: 0.15 + Math.random() * 0.3,
      vx: (Math.random() - 0.5) * 0.003,
      vy: 0,
      r: type === 'star' || type === 'diamond' ? 0.035 : 0.04,
      type,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: 0,
      rotSpd: (Math.random() - 0.5) * 0.05,
      grabbed: false,
    });
  }

  function drawArObjects() {
    if (!arObjCtx) return;
    const cvs = arObjCtx.canvas;
    arObjCtx.clearRect(0, 0, cvs.width, cvs.height);
    const w = cvs.width, h = cvs.height;

    for (const obj of arObjects) {
      if (!obj.grabbed) {
        obj.vy += 0.00015;
        obj.x += obj.vx;
        obj.y += obj.vy;
        obj.rotation += obj.rotSpd;

        if (obj.x - obj.r < 0) { obj.x = obj.r; obj.vx = Math.abs(obj.vx) * 0.7; }
        if (obj.x + obj.r > 1) { obj.x = 1 - obj.r; obj.vx = -Math.abs(obj.vx) * 0.7; }
        if (obj.y + obj.r > 0.95) { obj.y = 0.95 - obj.r; obj.vy = -Math.abs(obj.vy) * 0.6; obj.vx *= 0.95; }
        if (obj.y - obj.r < 0) { obj.y = obj.r; obj.vy = Math.abs(obj.vy) * 0.7; }
      }

      // Hand collision
      if (arHandPos.x >= 0) {
        const dx = obj.x - arHandPos.x;
        const dy = obj.y - arHandPos.y;
        const dist = Math.hypot(dx, dy);
        if (dist < obj.r + 0.03) {
          if (arHandPos.pinching && !arGrabbed) {
            arGrabbed = obj;
            obj.grabbed = true;
          }
          if (!obj.grabbed && dist > 0) {
            const force = 0.008 / Math.max(dist, 0.01);
            obj.vx += dx * force;
            obj.vy += dy * force;
            obj.rotSpd += (Math.random() - 0.5) * 0.03;
          }
        }
      }

      if (obj.grabbed && arGrabbed === obj) {
        if (!arHandPos.pinching) {
          obj.grabbed = false;
          arGrabbed = null;
          obj.vx = (Math.random() - 0.5) * 0.005;
          obj.vy = -0.002;
        } else {
          obj.x += (arHandPos.x - obj.x) * 0.3;
          obj.y += (arHandPos.y - obj.y) * 0.3;
          obj.vx = 0; obj.vy = 0;
        }
      }

      // Object-to-object collision
      for (const other of arObjects) {
        if (other === obj) continue;
        const ddx = obj.x - other.x, ddy = obj.y - other.y;
        const dd = Math.hypot(ddx, ddy);
        const minD = obj.r + other.r;
        if (dd < minD && dd > 0) {
          const nx = ddx / dd, ny = ddy / dd;
          const overlap = (minD - dd) * 0.5;
          obj.x += nx * overlap; obj.y += ny * overlap;
          other.x -= nx * overlap; other.y -= ny * overlap;
          const rel = (obj.vx - other.vx) * nx + (obj.vy - other.vy) * ny;
          if (rel < 0) {
            obj.vx -= rel * nx * 0.5; obj.vy -= rel * ny * 0.5;
            other.vx += rel * nx * 0.5; other.vy += rel * ny * 0.5;
          }
        }
      }

      const px = obj.x * w, py = obj.y * h, pr = obj.r * Math.min(w, h);
      const ctx = arObjCtx;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(obj.rotation);

      ctx.shadowColor = obj.color;
      ctx.shadowBlur = obj.grabbed ? 25 : 12;

      switch (obj.type) {
        case 'ball': {
          const grad = ctx.createRadialGradient(-pr * 0.3, -pr * 0.3, pr * 0.1, 0, 0, pr);
          grad.addColorStop(0, '#fff');
          grad.addColorStop(0.3, obj.color);
          grad.addColorStop(1, 'rgba(0,0,0,0.3)');
          ctx.beginPath(); ctx.arc(0, 0, pr, 0, Math.PI * 2);
          ctx.fillStyle = grad; ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
          break;
        }
        case 'cube': {
          ctx.fillStyle = obj.color;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(-pr, -pr, pr * 2, pr * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
          ctx.strokeRect(-pr, -pr, pr * 2, pr * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.15)';
          ctx.fillRect(-pr, -pr, pr * 2, pr);
          ctx.globalAlpha = 1;
          break;
        }
        case 'star': {
          ctx.fillStyle = obj.color;
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const a = (i * Math.PI * 2) / 10 - Math.PI / 2;
            const sr = i % 2 === 0 ? pr : pr * 0.45;
            ctx.lineTo(Math.cos(a) * sr, Math.sin(a) * sr);
          }
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
          break;
        }
        case 'diamond': {
          ctx.fillStyle = obj.color;
          ctx.beginPath();
          ctx.moveTo(0, -pr * 1.2);
          ctx.lineTo(pr * 0.8, 0);
          ctx.lineTo(0, pr * 1.2);
          ctx.lineTo(-pr * 0.8, 0);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-pr * 0.8, 0); ctx.lineTo(pr * 0.8, 0);
          ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke();
          break;
        }
      }
      ctx.restore();
    }

    drawFxParticles();
    arAnimFrame = requestAnimationFrame(drawArObjects);
  }

  function openArCamera() {
    $('arOverlay').classList.add('show');
    const video = $<HTMLVideoElement>('arVideo');
    const canvas = $<HTMLCanvasElement>('arCanvas');
    const objCanvas = $<HTMLCanvasElement>('arObjCanvas');
    const fxCanvas = $<HTMLCanvasElement>('arFxCanvas');
    const ctx = canvas.getContext('2d')!;
    arObjCtx = objCanvas.getContext('2d')!;
    arFxCtx = fxCanvas.getContext('2d')!;
    const statusEl = $('arStatus');
    const handIndicator = $('arHandIndicator');
    const buttonsEl = $('arButtons');

    const arBtns = [
      { label: 'חיפוש רכב', icon: '🔍', action: () => { const q = prompt('מספר רישוי:'); if (q) hgSearchLicense(q); } },
      { label: 'הכנסות', icon: '💰', action: () => hgShowEarnings('', new Date().toISOString().slice(0, 7)) },
      { label: 'צלם', icon: '📸', action: () => captureArPhoto() },
      { label: 'סגור', icon: '✕', action: closeArCamera },
    ];
    buttonsEl.innerHTML = '';
    arBtns.forEach((b, i) => {
      const btn = document.createElement('button');
      btn.className = 'ar-btn';
      btn.dataset.idx = String(i);
      btn.innerHTML = `<span class="ar-btn-icon">${b.icon}</span><span class="ar-btn-label">${b.label}</span>`;
      btn.onclick = b.action;
      buttonsEl.appendChild(btn);
    });

    statusEl.textContent = 'מאתחל מצלמה…';
    statusEl.style.opacity = '1';

    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        frameRate: { ideal: 30 },
      }
    }).then(stream => {
      arStream = stream;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        objCanvas.width = video.videoWidth;
        objCanvas.height = video.videoHeight;
        fxCanvas.width = video.videoWidth;
        fxCanvas.height = video.videoHeight;
        statusEl.textContent = 'מצלמה פעילה';
        setTimeout(() => { statusEl.style.opacity = '0'; }, 2000);
        drawArObjects();
        startHandTracking(video, canvas, ctx, handIndicator, arBtns);
      };
    }).catch(() => {
      statusEl.textContent = 'שגיאה: לא ניתן לגשת למצלמה';
    });
  }

  function closeArCamera() {
    $('arOverlay').classList.remove('show');
    if (arStream) { arStream.getTracks().forEach(t => t.stop()); arStream = null; }
    cancelAnimationFrame(arAnimFrame);
    arObjects = [];
    arGrabbed = null;
    arObjCtx = null;
    arFxCtx = null;
    arFxParticles = [];
    arLaserTrail = [];
    arCurrentFx = 'none';
    document.querySelectorAll('.ar-fx-btn').forEach(b => b.classList.remove('ar-fx-active'));
    $('arStatus').style.opacity = '1';
  }
  $('calBtn').onclick = () => openCalendar();
  $('arClose').onclick = closeArCamera;
  $('arAddBall').onclick = () => addArObject('ball');
  $('arAddCube').onclick = () => addArObject('cube');
  $('arAddStar').onclick = () => addArObject('star');
  $('arAddDiamond').onclick = () => addArObject('diamond');
  $('arClearObjs').onclick = () => { arObjects = []; arGrabbed = null; arFxParticles = []; arLaserTrail = []; };

  function setArEffect(fx: ArEffect) {
    arCurrentFx = arCurrentFx === fx ? 'none' : fx;
    arFxParticles = [];
    arLaserTrail = [];
    document.querySelectorAll('.ar-fx-btn').forEach(b => b.classList.remove('ar-fx-active'));
    if (arCurrentFx !== 'none') {
      document.getElementById(`arFx${fx.charAt(0).toUpperCase() + fx.slice(1)}`)?.classList.add('ar-fx-active');
    }
  }
  $('arFxFire').onclick = () => setArEffect('fire');
  $('arFxWater').onclick = () => setArEffect('water');
  $('arFxLaser').onclick = () => setArEffect('laser');
  $('arFxSparkle').onclick = () => setArEffect('sparkle');
  $('arFxRainbow').onclick = () => setArEffect('rainbow');

  function captureArPhoto() {
    const video = $<HTMLVideoElement>('arVideo');
    const c = document.createElement('canvas');
    c.width = video.videoWidth; c.height = video.videoHeight;
    const cx = c.getContext('2d')!;
    cx.save();
    cx.translate(c.width, 0);
    cx.scale(-1, 1);
    cx.drawImage(video, 0, 0);
    cx.restore();
    const fxC = $<HTMLCanvasElement>('arFxCanvas');
    cx.drawImage(fxC, 0, 0);
    const objC = $<HTMLCanvasElement>('arObjCanvas');
    cx.drawImage(objC, 0, 0);
    const handC = $<HTMLCanvasElement>('arCanvas');
    cx.drawImage(handC, 0, 0);
    const link = document.createElement('a');
    link.download = `AR_capture_${Date.now()}.png`;
    link.href = c.toDataURL('image/png');
    link.click();
  }

  function startHandTracking(
    video: HTMLVideoElement, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D,
    handIndicator: HTMLElement, arBtns: { label: string; action: () => void }[]
  ) {
    let lastTapTime = 0;
    const pointerEl = document.createElement('div');
    pointerEl.className = 'ar-pointer';
    $('arViewport').appendChild(pointerEl);

    const mpScript = document.createElement('script');
    mpScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/hands.min.js';
    mpScript.onload = () => {
      const camScript = document.createElement('script');
      camScript.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3/camera_utils.min.js';
      camScript.onload = () => initMediaPipeHands(video, canvas, ctx, pointerEl, handIndicator, arBtns);
      document.head.appendChild(camScript);
    };
    document.head.appendChild(mpScript);

    function initMediaPipeHands(
      vid: HTMLVideoElement, cvs: HTMLCanvasElement, c: CanvasRenderingContext2D,
      ptr: HTMLElement, indicator: HTMLElement, btns: { label: string; action: () => void }[]
    ) {
      const Hands = (window as any).Hands;
      const Camera = (window as any).Camera;
      if (!Hands || !Camera) {
        indicator.textContent = 'Hand tracking unavailable';
        return;
      }
      const hands = new Hands({ locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${f}` });
      hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.6 });

      hands.onResults((results: any) => {
        c.clearRect(0, 0, cvs.width, cvs.height);
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          for (let h = 0; h < results.multiHandLandmarks.length; h++) {
            const landmarks = results.multiHandLandmarks[h];
            const isRight = h === 0;
            indicator.textContent = results.multiHandLandmarks.length > 1 ? '✋✋ שתי ידיים' : '✋ יד מזוהה';
            indicator.style.color = '#daa520';

            c.strokeStyle = isRight ? 'rgba(218,165,32,0.6)' : 'rgba(200,149,106,0.6)';
            c.lineWidth = 2;
            const connections = [
              [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
              [5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],
              [13,17],[17,18],[18,19],[19,20],[0,17]
            ];
            for (const [a, b] of connections) {
              c.beginPath();
              c.moveTo(landmarks[a].x * cvs.width, landmarks[a].y * cvs.height);
              c.lineTo(landmarks[b].x * cvs.width, landmarks[b].y * cvs.height);
              c.stroke();
            }
            for (let i = 0; i < landmarks.length; i++) {
              const lm = landmarks[i];
              c.beginPath();
              c.arc(lm.x * cvs.width, lm.y * cvs.height, i === 8 || i === 4 ? 8 : 4, 0, Math.PI * 2);
              c.fillStyle = i === 8 ? 'rgba(245,230,200,0.9)' : i === 4 ? 'rgba(218,165,32,0.9)' : (isRight ? 'rgba(218,165,32,0.7)' : 'rgba(200,149,106,0.7)');
              c.fill();
            }

            if (h === 0) {
              const indexTip = landmarks[8];
              const thumbTip = landmarks[4];
              const viewRect = $('arViewport').getBoundingClientRect();
              const hx = indexTip.x;
              const hy = indexTip.y;
              ptr.style.left = (hx * viewRect.width) + 'px';
              ptr.style.top = (hy * viewRect.height) + 'px';
              ptr.style.opacity = '1';

              const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
              const pinching = pinchDist < 0.05;
              arHandPos = { x: hx, y: hy, pinching };

              if (pinching) {
                ptr.classList.add('pinch');
                const now = Date.now();
                if (now - lastTapTime > 600 && !arGrabbed) {
                  lastTapTime = now;
                  const arBtnEls = $('arButtons').querySelectorAll<HTMLButtonElement>('.ar-btn');
                  for (let i = 0; i < arBtnEls.length; i++) {
                    const rect = arBtnEls[i].getBoundingClientRect();
                    const relX = hx * viewRect.width + viewRect.left;
                    const relY = hy * viewRect.height + viewRect.top;
                    if (relX >= rect.left && relX <= rect.right && relY >= rect.top && relY <= rect.bottom) {
                      arBtnEls[i].classList.add('ar-btn-active');
                      setTimeout(() => arBtnEls[i].classList.remove('ar-btn-active'), 300);
                      btns[i].action();
                      break;
                    }
                  }
                }
              } else {
                ptr.classList.remove('pinch');
              }
            }

            // Second hand also pushes objects
            if (h === 1) {
              const idx2 = landmarks[8];
              for (const obj of arObjects) {
                const dx = obj.x - idx2.x, dy = obj.y - idx2.y;
                const dist = Math.hypot(dx, dy);
                if (dist < obj.r + 0.03 && dist > 0) {
                  const force = 0.008 / Math.max(dist, 0.01);
                  obj.vx += dx * force;
                  obj.vy += dy * force;
                }
              }
            }
          }
        } else {
          indicator.textContent = '👋 הראה יד למצלמה';
          indicator.style.color = 'var(--dim)';
          ptr.style.opacity = '0';
          arHandPos = { x: -1, y: -1, pinching: false };
          if (arGrabbed) { arGrabbed.grabbed = false; arGrabbed = null; }
        }
      });

      const cam = new Camera(vid, {
        onFrame: async () => { await hands.send({ image: vid }); },
        width: vid.videoWidth || 1920, height: vid.videoHeight || 1080,
      });
      cam.start();
    }
  }

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
    $<HTMLInputElement>('grokKeyInput').value = state.grokKey;
    $<HTMLInputElement>('openaiKeyInput').value = state.openaiKey;
    $<HTMLSelectElement>('providerSel').value = state.provider;
    $<HTMLSelectElement>('puterModelSel').value = state.puterModel;
    $<HTMLSelectElement>('micSel').value = state.micLang;
    $<HTMLSelectElement>('replySel').value = state.replyLang;
    $<HTMLSelectElement>('textLangSel').value = state.textLang;
    $<HTMLInputElement>('ambSlider').value = String(Math.round(audio.ambLevel * 100));
    $('ambVal').textContent = Math.round(audio.ambLevel * 100) + '%';
    $<HTMLSelectElement>('ambPresetSel').value = audio.ambPreset;
    $<HTMLInputElement>('speedSlider').value = String(Math.round((state.voiceSpeed || 1) * 100));
    $('speedVal').textContent = (state.voiceSpeed || 1).toFixed(1) + 'x';
    $<HTMLInputElement>('pitchSlider').value = String(Math.round((state.voicePitch || 1) * 100));
    $('pitchVal').textContent = (state.voicePitch || 1).toFixed(1);
    $<HTMLInputElement>('sfxCheck').checked = state.sfxOn;
    $<HTMLInputElement>('hapticsCheck').checked = state.haptics;
    $<HTMLInputElement>('autoSpeakCheck').checked = state.autoSpeak;
    $<HTMLInputElement>('spotifyId').value = socials.spotify;
    $<HTMLInputElement>('tiktokId').value = socials.tiktok;
    $<HTMLInputElement>('instaId').value = socials.insta;
    $<HTMLInputElement>('fbId').value = socials.fb;
    // Gender picker
    $('genderPicker').querySelectorAll('.gender-btn').forEach(b => {
      b.classList.toggle('active', (b as HTMLElement).dataset.g === state.voiceGender);
    });
    refreshVoiceList();
    $('overlay').classList.add('show');
  }
  function refreshVoiceList() {
    voice.loadVoices();
    const sel = $<HTMLSelectElement>('voiceSel');
    const list = voice.availableVoices();
    sel.innerHTML = list.map(v => {
      const g = voice.voiceGenderLabel(v);
      const quality = /natural|neural|enhanced|premium|wavenet|studio/i.test(v.name) ? ' HD' : '';
      return `<option value="${v.name}">[${g}]${quality} ${v.name} (${v.lang})</option>`;
    }).join('') || '<option value="">No voice available</option>';
  }
  $('settingsBtn').onclick = openSetup;
  $<HTMLSelectElement>('replySel').onchange = () => { state.replyLang = $<HTMLSelectElement>('replySel').value as any; refreshVoiceList(); };
  $<HTMLSelectElement>('ambPresetSel').onchange = () => {
    audio.ensure();
    const preset = $<HTMLSelectElement>('ambPresetSel').value as AmbientPreset;
    audio.setPreset(preset);
    state.ambPreset = preset;
  };
  $<HTMLInputElement>('ambSlider').oninput = () => {
    audio.ensure(); const v = +$<HTMLInputElement>('ambSlider').value;
    audio.setAmbient(v / 100); $('ambVal').textContent = v + '%';
  };
  $<HTMLInputElement>('speedSlider').oninput = () => {
    const v = +$<HTMLInputElement>('speedSlider').value / 100;
    $('speedVal').textContent = v.toFixed(1) + 'x';
  };
  $<HTMLInputElement>('pitchSlider').oninput = () => {
    const v = +$<HTMLInputElement>('pitchSlider').value / 100;
    $('pitchVal').textContent = v.toFixed(1);
  };
  $('genderPicker').addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.gender-btn') as HTMLElement;
    if (!btn) return;
    state.voiceGender = btn.dataset.g as VoiceGender;
    $('genderPicker').querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    refreshVoiceList();
  });
  $('testVoiceBtn').onclick = () => {
    const vsel = $<HTMLSelectElement>('voiceSel').value;
    if (vsel) voice.setVoice(vsel);
    state.voiceSpeed = +$<HTMLInputElement>('speedSlider').value / 100;
    state.voicePitch = +$<HTMLInputElement>('pitchSlider').value / 100;
    const testTexts: Record<string, string> = {
      he: 'שלום, אני אלפא, העוזר האישי שלך',
      en: 'Hello, I am Alpha, your personal assistant',
      es: 'Hola, soy Alpha, tu asistente personal',
    };
    voice.speak(testTexts[state.replyLang] || testTexts.en);
  };
  $('saveBtn').onclick = () => {
    state.name = $<HTMLInputElement>('nameInput').value.trim() || 'ALPHA';
    state.key = $<HTMLInputElement>('keyInput').value.trim();
    state.grokKey = $<HTMLInputElement>('grokKeyInput').value.trim();
    state.openaiKey = $<HTMLInputElement>('openaiKeyInput').value.trim();
    state.provider = $<HTMLSelectElement>('providerSel').value as AIProvider;
    state.puterModel = $<HTMLSelectElement>('puterModelSel').value;
    state.micLang = $<HTMLSelectElement>('micSel').value as any;
    state.replyLang = $<HTMLSelectElement>('replySel').value as any;
    state.textLang = $<HTMLSelectElement>('textLangSel').value as TextLang;
    state.ambLevel = audio.ambLevel;
    state.ambPreset = $<HTMLSelectElement>('ambPresetSel').value;
    audio.setPreset(state.ambPreset as AmbientPreset);
    state.voiceSpeed = +$<HTMLInputElement>('speedSlider').value / 100;
    state.voicePitch = +$<HTMLInputElement>('pitchSlider').value / 100;
    state.sfxOn = $<HTMLInputElement>('sfxCheck').checked;
    state.haptics = $<HTMLInputElement>('hapticsCheck').checked;
    state.autoSpeak = $<HTMLInputElement>('autoSpeakCheck').checked;
    audio.sfxOn = state.sfxOn;
    voice.setMicLang(state.micLang);
    const vsel = $<HTMLSelectElement>('voiceSel').value;
    if (vsel) voice.setVoice(vsel);
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
    updateAIDisplay();
    $('overlay').classList.remove('show');
    if (state.history.length === 0) addMsg(state.name + ' online. Talk to me or type.', 'al');
  };

  function pad(n: number) { return String(n).padStart(2, '0'); }
  function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 6) return 'GOOD NIGHT';
    if (h < 12) return 'GOOD MORNING';
    if (h < 17) return 'GOOD AFTERNOON';
    if (h < 21) return 'GOOD EVENING';
    return 'GOOD NIGHT';
  }
  setInterval(() => {
    const d = new Date();
    $('clock').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const wmEl = document.querySelector('.wm');
    if (wmEl) wmEl.textContent = getGreeting();
  }, 1000);

  // ===== LEFT PANEL ANIMATIONS =====

  // --- Neural Canvas ---
  const neuralCanvas = $<HTMLCanvasElement>('neuralCanvas');
  const nCtx = neuralCanvas.getContext('2d');
  interface NeuralNode { x: number; y: number; vx: number; vy: number; r: number; pulse: number; }
  const neuralNodes: NeuralNode[] = [];
  function initNeural() {
    const rect = neuralCanvas.getBoundingClientRect();
    neuralCanvas.width = rect.width * 2;
    neuralCanvas.height = rect.height * 2;
    neuralNodes.length = 0;
    for (let i = 0; i < 14; i++) {
      neuralNodes.push({
        x: Math.random() * neuralCanvas.width,
        y: Math.random() * neuralCanvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: 2 + Math.random() * 3,
        pulse: Math.random() * Math.PI * 2,
      });
    }
  }
  function drawNeural() {
    if (!nCtx) return;
    const w = neuralCanvas.width, h = neuralCanvas.height;
    nCtx.clearRect(0, 0, w, h);
    const time = Date.now() * 0.001;
    // Update positions
    for (const n of neuralNodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      n.pulse += 0.02;
    }
    // Draw connections
    for (let i = 0; i < neuralNodes.length; i++) {
      for (let j = i + 1; j < neuralNodes.length; j++) {
        const a = neuralNodes[i], b = neuralNodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 160) {
          const alpha = (1 - dist / 160) * 0.25;
          nCtx.strokeStyle = `rgba(218, 165, 32, ${alpha})`;
          nCtx.lineWidth = 0.8;
          nCtx.beginPath(); nCtx.moveTo(a.x, a.y); nCtx.lineTo(b.x, b.y); nCtx.stroke();
          // Pulse traveling along the line
          const pulsePos = (Math.sin(time * 2 + i + j) + 1) / 2;
          const px = a.x + (b.x - a.x) * pulsePos;
          const py = a.y + (b.y - a.y) * pulsePos;
          nCtx.fillStyle = `rgba(255, 194, 77, ${alpha * 1.5})`;
          nCtx.beginPath(); nCtx.arc(px, py, 1.5, 0, Math.PI * 2); nCtx.fill();
        }
      }
    }
    // Draw nodes
    for (const n of neuralNodes) {
      const glow = 0.5 + Math.sin(n.pulse) * 0.3;
      nCtx.fillStyle = `rgba(218, 165, 32, ${glow})`;
      nCtx.shadowColor = 'rgba(218, 165, 32, 0.4)';
      nCtx.shadowBlur = 8;
      nCtx.beginPath(); nCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2); nCtx.fill();
      nCtx.shadowBlur = 0;
    }
    requestAnimationFrame(drawNeural);
  }
  initNeural();
  drawNeural();

  // --- Wave Canvas ---
  const waveCanvas = $<HTMLCanvasElement>('waveCanvas');
  const wCtx = waveCanvas.getContext('2d');
  const waveBars = 32;
  const waveHeights: number[] = Array(waveBars).fill(0).map(() => Math.random() * 0.5);
  const waveTargets: number[] = Array(waveBars).fill(0).map(() => Math.random() * 0.5);
  function initWave() {
    const rect = waveCanvas.getBoundingClientRect();
    waveCanvas.width = rect.width * 2;
    waveCanvas.height = rect.height * 2;
  }
  function drawWave() {
    if (!wCtx) return;
    const w = waveCanvas.width, h = waveCanvas.height;
    wCtx.clearRect(0, 0, w, h);
    const barW = w / waveBars;
    for (let i = 0; i < waveBars; i++) {
      waveHeights[i] += (waveTargets[i] - waveHeights[i]) * 0.08;
      if (Math.random() < 0.02) waveTargets[i] = 0.1 + Math.random() * 0.8;
      const barH = waveHeights[i] * h * 0.85;
      const goldToCream = i / waveBars;
      const r = Math.round(218 + goldToCream * 37);
      const g = Math.round(165 + goldToCream * 65);
      const b = Math.round(32 + goldToCream * 112);
      wCtx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
      const x = i * barW + 1;
      wCtx.fillRect(x, h - barH, barW - 2, barH);
      // Glow cap
      wCtx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
      wCtx.fillRect(x, h - barH - 2, barW - 2, 2);
    }
    requestAnimationFrame(drawWave);
  }
  initWave();
  drawWave();

  // --- Metric Bars Animation ---
  setInterval(() => {
    const cpu = 30 + Math.random() * 55;
    const mem = 50 + Math.random() * 30;
    const net = 10 + Math.random() * 40;
    $('cpuBar').style.width = cpu + '%';
    $('cpuVal').textContent = Math.round(cpu) + '%';
    $('memBar').style.width = mem + '%';
    $('memVal').textContent = Math.round(mem) + '%';
    $('netBar').style.width = (net / 50 * 100) + '%';
    $('netVal').textContent = Math.round(net) + 'ms';
  }, 2000);

  // --- Uptime Timer ---
  const startTime = Date.now();
  setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    $('uptimeVal').textContent = pad(mins) + ':' + pad(secs);
  }, 1000);

  // --- AI Model Display ---
  function updateAIDisplay() {
    const modelNames: Record<string, string> = {
      'gpt-4o-mini': 'GPT-4O MINI',
      'gpt-4o': 'GPT-4O',
      'o4-mini': 'O4-MINI',
      'claude-sonnet-4': 'CLAUDE SONNET 4',
      'gemini-2.0-flash': 'GEMINI 2.0 FLASH',
    };
    const providerNames: Record<string, string> = {
      'puter': 'VIA PUTER',
      'gemini': 'VIA GOOGLE',
      'grok': 'VIA XAI',
      'openai': 'VIA OPENAI',
    };
    const pm = (state as any).puterModel as string || 'gpt-4o-mini';
    $('aiModelDisplay').textContent = modelNames[pm] || pm.toUpperCase();
    $('aiProviderDisplay').textContent = providerNames[state.provider] || state.provider.toUpperCase();
  }
  updateAIDisplay();

  updateConnIndicators();
  const puterAvailable = typeof (window as any).puter !== 'undefined';
  const canUseAI = puterAvailable || state.key || state.grokKey || state.openaiKey;
  if (!canUseAI) openSetup();
  else addMsg(state.name + ' online. Talk to me or type.', 'al');
}
