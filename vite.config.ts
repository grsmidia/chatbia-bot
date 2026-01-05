
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    // Garante que o build gere o index.html e os assets
    outDir: 'dist',
    rollupOptions: {
      output: {
        // Força o nome do arquivo JS principal para ser sempre o mesmo
        entryFileNames: `assets/bia-chat.js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
