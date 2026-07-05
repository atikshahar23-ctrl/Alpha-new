import { defineConfig } from 'vite';
import { resolve } from 'path';

// base/outDir are overridable via env vars so the exact same source can also
// be built for the combined single-origin deployment (mounted under a
// sub-path on the same Render service as the trading simulator's API),
// without touching the default GitHub Pages build at all — see
// `npm run build:combined` below and README-combined-deploy.md.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/Alpha-new/',
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
