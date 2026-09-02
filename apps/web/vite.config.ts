import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { rmSync } from 'node:fs'

const pagesAssetLimitPlugin = {
  name: 'pages-asset-limit',
  closeBundle() {
    // Keep the lossless studio master in source control, but do not copy it to
    // Pages: it exceeds Pages' per-file asset limit. The public player uses
    // the MP3 release rendition instead.
    rmSync(new URL('./dist/media/BIG_OLD_HANDS_Tore_up_the_hole_Krust.wav', import.meta.url), { force: true })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pagesAssetLimitPlugin],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-router-dom')) {
            return 'react';
          }
          return undefined;
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
