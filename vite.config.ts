import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/Alpha-new/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        heavyguard: resolve(__dirname, 'heavyguard.html'),
        widget: resolve(__dirname, 'widget.html'),
      },
    },
  },
});
