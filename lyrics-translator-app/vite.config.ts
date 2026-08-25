import { defineConfig } from 'vite';

// Standalone, fully self-contained build for the "Lyrics Translator" product
// — deliberately decoupled from the main Alpha-new site (which force-
// unregisters every service worker on load; a real PWA/TWA needs its own
// origin where that isn't happening). base: './' so the built dist/ folder
// works unmodified from any path/domain it's hosted at.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
