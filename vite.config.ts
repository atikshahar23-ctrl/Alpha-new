import { defineConfig } from 'vite';

// IMPORTANT for GitHub Pages:
// If you deploy to https://<user>.github.io/<repo>/ set base to '/<repo>/'.
// If you deploy to a custom domain or to https://<user>.github.io/ (user/org page), use '/'.
export default defineConfig({
  base: '/Alpha-new/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
