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
          <button class="dock-item" data-q="Open my calendar" id="calBtn">
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
              <button class="ar-tool-btn" id="arAddBall" title="Add Ball">⚽</button>
              <button class="ar-tool-btn" id="arAddCube" title="Add Cube">🔲</button>
              <button class="ar-tool-btn" id="arAddStar" title="Add Star">⭐</button>
              <button class="ar-tool-btn" id="arAddDiamond" title="Add Diamond">💎</button>
              <button class="ar-tool-btn" id="arClearObjs" title="Clear All">🗑️</button>
            </div>
            <button class="ar-close" id="arClose">✕</button>
          </div>
          <div class="ar-viewport" id="arViewport">
            <video id="arVideo" autoplay playsinline></video>
            <canvas id="arCanvas"></canvas>
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
        onDiary: (title: string, date: string) => {
          const iframe = $<HTMLIFrameElement>('hgIframe');
          if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({ source: 'alpha-ai', action: 'addTask', payload: { title, date } }, '*');
          } else {
            const tasks = JSON.parse(localStorage.getItem('hg2:tasks') || '[]');
            const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
            tasks.unshift({ id, title, date, done: false, ts: Date.now() });
            localStorage.setItem('hg2:tasks', JSON.stringify(tasks));
          }
        },
        onHgSearch: hgSearchLicense,
        onHgEarnings: hgShowEarnings,
        onHgQuote: hgCreateQuote,
        onArCamera: openArCamera,
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

  type HgCallback = (data: any) => void;
  const hgCallbacks: Record<string, HgCallback[]> = {};
  function hgSend(action: string, payload: any, responseAction: string): Promise<any> {
    return new Promise((resolve) => {
      if (!hgCallbacks[responseAction]) hgCallbacks[responseAction] = [];
      hgCallbacks[responseAction].push(resolve);
      const iframe = ensureHgIframe();
      const trySend = () => {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage({ source: 'alpha-ai', action, payload }, '*');
        }
      };
      if (iframe.src && iframe.src.includes('heavyguard')) trySend();
      else setTimeout(trySend, 1000);
      setTimeout(() => resolve(null), 5000);
    });
  }

  window.addEventListener('message', (e) => {
    if (!e.data || e.data.source !== 'heavyguard') return;
    if (e.data.action === 'taskAdded') {
      addMsg(`נרשם ביומן: ${e.data.payload.title}`, 'sys');
    }
    const cbs = hgCallbacks[e.data.action];
    if (cbs && cbs.length) {
      const cb = cbs.shift()!;
      cb(e.data.payload);
    }
  });

  async function hgSearchLicense(query: string) {
    const results = await hgSend('searchLicense', { query }, 'searchResults');
    if (!results || !results.length) {
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
    const data = await hgSend('getEarnings', { contractor, month }, 'earningsData');
    if (!data) { addMsg('לא ניתן לטעון נתוני הכנסות', 'sys'); return; }
    const monthLabel = data.month === 'all' ? 'כל התקופה' : data.month;
    openWin(`HeavyGuard · הכנסות · ${monthLabel}`);
    let html = '<div class="pad">';
    html += `<div style="text-align:center;margin-bottom:16px">
      <div style="font-size:32px;font-weight:700;color:var(--gold)">₪${(data.grandTotal || 0).toLocaleString()}</div>
      <div style="color:var(--dim);font-size:13px">${data.totalJobs || 0} עבודות · ${monthLabel}</div>
    </div>`;
    const entries = Object.entries(data.byContractor || {}) as [string, any][];
    for (const [name, info] of entries) {
      const pct = data.grandTotal ? Math.round((info.total / data.grandTotal) * 100) : 0;
      html += `<div style="background:rgba(255,255,255,.03);border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-weight:600">${name}</span>
          <span style="color:var(--gold);font-weight:600">₪${info.total.toLocaleString()}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="flex:1;background:rgba(255,255,255,.06);border-radius:4px;height:6px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,var(--cyan),var(--gold));border-radius:4px"></div>
          </div>
          <span style="color:var(--dim);font-size:12px;min-width:40px">${pct}% · ${info.count} עבודות</span>
        </div>
      </div>`;
    }
    html += '</div>';
    $('winBody').innerHTML = html;
  }

  async function hgCreateQuote(customer: string, phone: string, itemsStr: string) {
    const items = itemsStr.split(',').map(s => {
      const [desc, priceStr] = s.trim().split(':');
      return { description: (desc || '').trim(), price: parseFloat(priceStr) || 0, qty: 1 };
    }).filter(i => i.description);
    await hgSend('addQuote', { customer, phone, items }, 'quoteAdded');
    addMsg(`הצעת מחיר נוצרה עבור ${customer || 'לקוח'}`, 'sys');
  }

  // AR Camera with object placement and hand physics
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

  function addArObject(type: ArObj['type']) {
    const colors = ['#5fe6ff', '#ffc24d', '#ff5d73', '#4dff91', '#b06aff', '#ff9f43'];
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

    arAnimFrame = requestAnimationFrame(drawArObjects);
  }

  function openArCamera() {
    $('arOverlay').classList.add('show');
    const video = $<HTMLVideoElement>('arVideo');
    const canvas = $<HTMLCanvasElement>('arCanvas');
    const objCanvas = $<HTMLCanvasElement>('arObjCanvas');
    const ctx = canvas.getContext('2d')!;
    arObjCtx = objCanvas.getContext('2d')!;
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
      video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
    }).then(stream => {
      arStream = stream;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        objCanvas.width = video.videoWidth;
        objCanvas.height = video.videoHeight;
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
    $('arStatus').style.opacity = '1';
  }
  $('arClose').onclick = closeArCamera;
  $('arAddBall').onclick = () => addArObject('ball');
  $('arAddCube').onclick = () => addArObject('cube');
  $('arAddStar').onclick = () => addArObject('star');
  $('arAddDiamond').onclick = () => addArObject('diamond');
  $('arClearObjs').onclick = () => { arObjects = []; arGrabbed = null; };

  function captureArPhoto() {
    const video = $<HTMLVideoElement>('arVideo');
    const c = document.createElement('canvas');
    c.width = video.videoWidth; c.height = video.videoHeight;
    const cx = c.getContext('2d')!;
    cx.drawImage(video, 0, 0);
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
            indicator.style.color = '#5fe6ff';

            c.strokeStyle = isRight ? 'rgba(95,230,255,0.6)' : 'rgba(176,106,255,0.6)';
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
              c.fillStyle = i === 8 ? 'rgba(255,194,77,0.9)' : i === 4 ? 'rgba(255,93,115,0.9)' : (isRight ? 'rgba(95,230,255,0.7)' : 'rgba(176,106,255,0.7)');
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
        width: 1280, height: 720,
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
          nCtx.strokeStyle = `rgba(95, 230, 255, ${alpha})`;
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
      nCtx.fillStyle = `rgba(95, 230, 255, ${glow})`;
      nCtx.shadowColor = 'rgba(95, 230, 255, 0.4)';
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
      const cyanToGold = i / waveBars;
      const r = Math.round(95 + cyanToGold * 160);
      const g = Math.round(230 - cyanToGold * 36);
      const b = Math.round(255 - cyanToGold * 178);
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
