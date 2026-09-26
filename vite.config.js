import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: false
  },
  server: {
    port: 5173,
    open: false,
    allowedHosts: true
  }
});
