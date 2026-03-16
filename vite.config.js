import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('firebase/firestore') || id.includes('@firebase/firestore')) return 'vendor-firebase-firestore';
          if (id.includes('firebase/storage') || id.includes('@firebase/storage')) return 'vendor-firebase-storage';
          if (id.includes('firebase/auth') || id.includes('@firebase/auth')) return 'vendor-firebase-auth';
          if (id.includes('firebase/app') || id.includes('@firebase/app') || id.includes('@firebase/component') || id.includes('@firebase/util')) return 'vendor-firebase-core';
          if (id.includes('firebase')) return 'vendor-firebase-core';
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
