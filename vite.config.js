import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração do Vite para o BF Music.
// base: './' é essencial para o Electron carregar os assets com caminho relativo (file://)
export default defineConfig({
  root: 'src',
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
