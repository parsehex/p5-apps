import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: './',
  build: {
    chunkSizeWarningLimit: 1200,
  },
  plugins: [tailwindcss()],
});
