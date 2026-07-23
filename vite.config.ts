import { defineConfig } from 'vite';
import { resolve } from 'path';

// base/outDir are overridable via env vars so the exact same source can also
// be built for a second deployment target — a standalone Render Static Site
// with a Rewrite Rule proxying /api/* to the simulator's Node service —
// without touching the default GitHub Pages build at all. See
// `npm run build:render` below and README-combined-deploy.md.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/Alpha-new/',
  // Cloudflare Tunnel support (see config.yml at the repo root): cloudflared
  // proxies requests to the local dev/preview server with the tunnel's public
  // hostname in the Host header, which Vite rejects by default ("Blocked
  // request. This host is not allowed"). Strictly opt-in and scoped: with no
  // TUNNEL_HOST set, nothing changes — loopback bind + Vite's full
  // host-header (DNS-rebinding) protection stay as-is. Running
  //   TUNNEL_HOST=alpha.your-domain.com npm run dev   (or vite preview)
  // allows exactly that one hostname. Production (GitHub Pages/Render builds)
  // is unaffected either way.
  server: {
    host: !!process.env.TUNNEL_HOST,
    allowedHosts: process.env.TUNNEL_HOST ? [process.env.TUNNEL_HOST] : undefined,
  },
  preview: {
    host: !!process.env.TUNNEL_HOST,
    allowedHosts: process.env.TUNNEL_HOST ? [process.env.TUNNEL_HOST] : undefined,
  },
  define: {
    // Compile-time flag read by simulatorBridge.ts: true only in the
    // build:render target, where a same-origin /api/* Rewrite Rule means
    // getSimUrl() can default to location.origin with no manual Settings
    // URL at all. Never true in the default GitHub Pages build.
    __COMBINED_DEPLOY__: process.env.VITE_COMBINED_DEPLOY === '1',
  },
  build: {
    outDir: process.env.VITE_OUT_DIR || 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        heavyguard: resolve(__dirname, 'heavyguard.html'),
        agent: resolve(__dirname, 'agent.html'),
        agents: resolve(__dirname, 'agents.html'),
        lyrics: resolve(__dirname, 'lyrics.html'),
        widget: resolve(__dirname, 'widget.html'),
        chatwidget: resolve(__dirname, 'chat-widget.html'),
      },
    },
  },
});
