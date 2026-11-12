import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // sockjs-client is written for a CommonJS/Node-ish environment and reads the
  // bare identifier `global`, which does not exist in a browser ES module. Vite
  // does not shim it, so importing the websocket service threw "global is not
  // defined" while the module graph was still evaluating — before React
  // rendered anything. The result was a blank white page on every route.
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      }
    }
  },
  // Mirrors the server proxy so `npm run preview` exercises the real production
  // bundle against a real backend. Defects like sprite paths that resolve only
  // under the dev server are invisible until the built output is run.
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      }
    }
  }
})
