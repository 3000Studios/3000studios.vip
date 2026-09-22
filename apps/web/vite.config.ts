import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { rmSync } from 'node:fs';

const pagesAssetLimitPlugin = {
  name: 'pages-asset-limit',
  closeBundle() {
    // Keep the lossless studio master in source control, but do not copy it to
    // Pages: it exceeds Pages' per-file asset limit. The public player uses
    // the MP3 release rendition instead.
    rmSync(new URL('./dist/media/BIG_OLD_HANDS_Tore_up_the_hole_Krust.wav', import.meta.url), {
      force: true,
    });
  },
};


const adsenseHtmlGuardPlugin = {
  name: 'adsense-html-guard',
  enforce: 'post' as const,
  transformIndexHtml: {
    order: 'post' as const,
    handler(html: string) {
      // Vite leaves %VITE_ADSENSE_CLIENT_ID% when the env var is unset. Do not
      // ship that literal (or an empty publisher meta) — omit the tag instead.
      return html
        .replace(/\s*<meta\s+name="google-adsense-account"\s+content="%VITE_ADSENSE_CLIENT_ID%"\s*\/?>/i, '')
        .replace(/\s*<meta\s+name="google-adsense-account"\s+content=""\s*\/?>/i, '');
    },
  },
};

const sameOriginStylesPlugin = {
  name: 'same-origin-styles',
  enforce: 'post' as const,
  transformIndexHtml: {
    order: 'post' as const,
    handler(html: string) {
      // Vite adds crossorigin to generated stylesheet links. The production
      // stylesheet is same-origin, so remove the unnecessary CORS request mode;
      // it has caused Chrome to abort the CSS request before applying the sheet.
      return html.replace(
        /<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/g,
        '<link rel="stylesheet" href="$1">',
      );
    },
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pagesAssetLimitPlugin, sameOriginStylesPlugin, adsenseHtmlGuardPlugin],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-router-dom')) {
            return 'react';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three';
          }
          if (id.includes('node_modules/dashjs') || id.includes('node_modules/hls.js')) {
            return 'video-players';
          }
          if (id.includes('node_modules/howler')) {
            return 'audio';
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
});
