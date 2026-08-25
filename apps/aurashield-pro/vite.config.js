import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Replit / cloud IDEs proxy the dev server through an external host,
// so we bind 0.0.0.0 and allow the proxied origin.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // Vite 5.x blocks unknown hosts by default on some setups.
    hmr: { clientPort: 443 },
    allowedHosts: true,
  },
  preview: { host: '0.0.0.0', port: 3000 },
});
