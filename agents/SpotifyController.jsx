import React, { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, ListMusic, Music2, LogOut, RefreshCw } from "lucide-react";

/* ── Real Spotify account panel for the office simulator's phone ──────────
   Shares the exact same localStorage keys (`lt:*`) that lyrics.html's PKCE
   OAuth flow writes — connecting once in either place connects both, since
   they're same-origin pages. The actual authorize redirect can only happen
   from lyrics.html (that's the one Redirect URI registered in the user's
   Spotify dashboard), so this panel never starts its own OAuth handshake —
   it opens lyrics.html in a new tab for that, then picks up the token via
   a `storage` event the moment it lands (same-origin localStorage writes
   from another tab fire `storage` here automatically).
   Playback control requires Spotify Premium — Spotify's API itself enforces
   that (403/404), surfaced here as a plain-language hint, never a silent
   failure. */

const TOKEN_KEY = "lt:spotify_tokens";
const CLIENT_ID_KEY = "lt:spotify_client_id";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const POLL_MS = 4000;

const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { localStorage.removeItem(k); },
};

async function refreshAccessToken() {
  const clientId = store.get(CLIENT_ID_KEY);
  const tokens = store.get(TOKEN_KEY);
  if (!clientId || !tokens || !tokens.refresh_token) return null;
  const body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: tokens.refresh_token, client_id: clientId });
  try {
    const res = await fetch(TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
    if (!res.ok) return null;
    const data = await res.json();
    const next = { access_token: data.access_token, refresh_token: data.refresh_token || tokens.refresh_token, expires_at: Date.now() + data.expires_in * 1000 };
    store.set(TOKEN_KEY, next);
    return next.access_token;
  } catch { return null; }
}

async function getValidAccessToken() {
  const tokens = store.get(TOKEN_KEY);
  if (!tokens) return null;
  if (Date.now() > tokens.expires_at - 15000) return refreshAccessToken();
  return tokens.access_token;
}

async function spotifyFetch(path, opts = {}) {
  const token = await getValidAccessToken();
  if (!token) return null;
  try {
    return await fetch("https://api.spotify.com/v1" + path, { ...opts, headers: { ...(opts.headers || {}), Authorization: "Bearer " + token } });
  } catch { return null; }
}

function fmtTime(ms) {
  const s = Math.floor((ms || 0) / 1000);
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
}

export default function SpotifyPanel({ visible = true }) {
  const [connected, setConnected] = useState(!!store.get(TOKEN_KEY));
  const [view, setView] = useState("player"); // player | playlists
  const [now, setNow] = useState(null); // { name, artists, art, isPlaying, progressMs, durationMs }
  const [hint, setHint] = useState("");
  const [playlists, setPlaylists] = useState(null); // null = not loaded yet
  const [plLoading, setPlLoading] = useState(false);
  const hintTimer = useRef(0);
  const pollTimer = useRef(0);

  const showHint = useCallback((msg) => {
    setHint(msg);
    clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHint(""), 5000);
  }, []);

  // Pick up a connection made in the lyrics.html tab the instant it happens —
  // `storage` fires in every OTHER same-origin tab/window, which is exactly
  // this one, the moment that tab's PKCE exchange writes the token.
  useEffect(() => {
    const onStorage = (e) => { if (e.key === TOKEN_KEY) setConnected(!!store.get(TOKEN_KEY)); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const pollOnce = useCallback(async () => {
    const res = await spotifyFetch("/me/player/currently-playing");
    if (!res) { setConnected(!!store.get(TOKEN_KEY)); return; }
    if (res.status === 204) { setNow((n) => (n ? { ...n, isPlaying: false } : null)); return; }
    if (!res.ok) return;
    const data = await res.json();
    if (!data || !data.item) return;
    setNow({
      id: data.item.id,
      name: data.item.name,
      artists: data.item.artists.map((a) => a.name).join(", "),
      art: (data.item.album.images[0] && data.item.album.images[0].url) || "",
      isPlaying: data.is_playing,
      progressMs: data.progress_ms,
      durationMs: data.item.duration_ms,
    });
  }, []);

  useEffect(() => {
    if (!visible || !connected) return;
    pollOnce();
    pollTimer.current = setInterval(pollOnce, POLL_MS);
    return () => clearInterval(pollTimer.current);
  }, [visible, connected, pollOnce]);

  const loadPlaylists = useCallback(async () => {
    setPlLoading(true);
    const res = await spotifyFetch("/me/playlists?limit=50");
    setPlLoading(false);
    if (!res || !res.ok) { setPlaylists([]); return; }
    const data = await res.json();
    setPlaylists((data.items || []).map((p) => ({
      id: p.id, name: p.name, uri: p.uri,
      image: (p.images && p.images[0] && p.images[0].url) || "",
      tracks: p.tracks ? p.tracks.total : 0,
    })));
  }, []);

  useEffect(() => {
    if (view === "playlists" && playlists === null && connected) loadPlaylists();
  }, [view, playlists, connected, loadPlaylists]);

  async function afterControl(res) {
    if (res && (res.ok || res.status === 204)) { setTimeout(pollOnce, 250); return true; }
    if (res && res.status === 404) showHint("אין מכשיר ספוטיפיי פעיל — פתח ספוטיפיי בטלפון/מחשב, נגן משהו, ונסה שוב.");
    else if (res && res.status === 403) showHint("שליטה בנגן דורשת חשבון Spotify Premium.");
    else showHint("הפעולה נכשלה — נסה שוב.");
    return false;
  }
  const playPause = async () => {
    const wasPlaying = !!(now && now.isPlaying);
    setNow((n) => (n ? { ...n, isPlaying: !wasPlaying } : n)); // optimistic
    const ok = await afterControl(await spotifyFetch(wasPlaying ? "/me/player/pause" : "/me/player/play", { method: "PUT" }));
    if (!ok) setNow((n) => (n ? { ...n, isPlaying: wasPlaying } : n));
  };
  const skipPrev = () => afterControl(spotifyFetch("/me/player/previous", { method: "POST" })).then(() => {});
  const skipNext = () => afterControl(spotifyFetch("/me/player/next", { method: "POST" })).then(() => {});
  const seekTo = async (ratio) => {
    if (!now || !now.durationMs) return;
    const posMs = Math.round(ratio * now.durationMs);
    setNow((n) => (n ? { ...n, progressMs: posMs } : n));
    await afterControl(await spotifyFetch("/me/player/seek?position_ms=" + posMs, { method: "PUT" }));
  };
  const playPlaylist = async (uri) => {
    const ok = await afterControl(await spotifyFetch("/me/player/play", {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context_uri: uri }),
    }));
    if (ok) { showHint("▶ מנגן את הפלייליסט"); setView("player"); }
  };
  const disconnect = () => {
    store.del(TOKEN_KEY);
    setConnected(false); setNow(null); setPlaylists(null);
    showHint("נותק — זה מנתק גם את מסך 'מילים בתרגום חי', כי שניהם משתמשים באותו חיבור.");
  };
  const openConnect = () => {
    const base = import.meta.env.BASE_URL || "/";
    window.open(base + "lyrics.html", "_blank", "noopener");
    showHint("נפתחה לשונית חדשה — התחבר שם, וכאן זה יתעדכן אוטומטית.");
  };

  if (!connected) {
    return (
      <div className="off3-spotify-connect">
        <Music2 size={28} />
        <p>התחבר לספוטיפיי כדי לשלוט בנגן ולראות את הפלייליסטים שלך — ישירות מהטלפון שבמשרד.</p>
        <button className="off3-phone-act" onClick={openConnect}>🔗 התחבר לספוטיפיי</button>
        <button className="off3-phone-back" onClick={() => setConnected(!!store.get(TOKEN_KEY))}><RefreshCw size={12} /> כבר התחברתי — בדוק שוב</button>
        {hint && <p className="off3-phone-empty">{hint}</p>}
      </div>
    );
  }

  return (
    <div className="off3-spotify-panel">
      <div className="off3-spotify-tabs">
        <button className={view === "player" ? "on" : ""} onClick={() => setView("player")}><Music2 size={13} /> מתנגן עכשיו</button>
        <button className={view === "playlists" ? "on" : ""} onClick={() => setView("playlists")}><ListMusic size={13} /> פלייליסטים</button>
      </div>

      {view === "player" && (
        <div className="off3-spotify-now">
          {now ? (
            <>
              <div className="off3-spotify-now-row">
                {now.art ? <img className="off3-spotify-art" src={now.art} alt="" /> : <div className="off3-spotify-art off3-spotify-art-ph"><Music2 size={20} /></div>}
                <div className="off3-spotify-now-info">
                  <b>{now.name}</b>
                  <span>{now.artists}</span>
                </div>
              </div>
              <div
                className="off3-spotify-progress"
                onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seekTo(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))); }}
                title="לחץ כדי לדלג לנקודה בשיר"
              >
                <i style={{ width: `${now.durationMs ? Math.min(100, (now.progressMs / now.durationMs) * 100) : 0}%` }} />
              </div>
              <div className="off3-spotify-time">{fmtTime(now.progressMs)} / {fmtTime(now.durationMs)}</div>
              <div className="off3-spotify-ctl">
                <button onClick={skipPrev} title="השיר הקודם"><SkipBack size={18} /></button>
                <button className="off3-spotify-play" onClick={playPause} title="נגן / השהה">
                  {now.isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button onClick={skipNext} title="השיר הבא"><SkipForward size={18} /></button>
              </div>
            </>
          ) : (
            <p className="off3-phone-empty">אין כרגע שיר מתנגן — פתח ספוטיפיי והתחל לנגן משהו.</p>
          )}
          {hint && <p className="off3-phone-empty">{hint}</p>}
          <button className="off3-phone-back off3-spotify-disconnect" onClick={disconnect}><LogOut size={12} /> ניתוק</button>
        </div>
      )}

      {view === "playlists" && (
        <div className="off3-spotify-playlists">
          {plLoading && <p className="off3-phone-empty">טוען פלייליסטים…</p>}
          {!plLoading && playlists && playlists.length === 0 && <p className="off3-phone-empty">לא נמצאו פלייליסטים בחשבון.</p>}
          {!plLoading && playlists && playlists.map((p) => (
            <button key={p.id} className="off3-spotify-pl-item" onClick={() => playPlaylist(p.uri)}>
              {p.image ? <img src={p.image} alt="" /> : <div className="off3-spotify-pl-ph"><ListMusic size={16} /></div>}
              <span className="off3-spotify-pl-name">{p.name}</span>
              <em>{p.tracks} שירים</em>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
