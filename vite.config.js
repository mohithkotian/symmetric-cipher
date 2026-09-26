import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    sourcemap: false,
    rollupOptions: {
      input: {
        main: 'index.html',
        attacker: 'attacker.html',
        aes: 'aes.html'
      }
    }
  },
  server: {
    port: 5173,
    open: false,
    allowedHosts: true
  }
});
