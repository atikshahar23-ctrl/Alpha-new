import { defineConfig } from 'vite';
import { resolve } from 'path';

// base/outDir are overridable via env vars so the exact same source can also
// be built for a second deployment target — a standalone Render Static Site
// with a Rewrite Rule proxying /api/* to the simulator's Node service —
// without touching the default GitHub Pages build at all. See
// `npm run build:render` below and README-combined-deploy.md.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/Alpha-new/',
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
        widget: resolve(__dirname, 'widget.html'),
        chatwidget: resolve(__dirname, 'chat-widget.html'),
      },
    },
  },
});
