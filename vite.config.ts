
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    lib: {
      entry: 'index.tsx',
      name: 'BiaChat',
      fileName: () => 'assets/bia-chat.js',
      formats: ['es']
    },
    rollupOptions: {
      output: {
        extend: true,
      }
    }
  }
});
