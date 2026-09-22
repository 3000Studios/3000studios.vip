import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const hero = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'src/data/homeHero.json'), 'utf8'),
) as {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
  kicker: string;
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  playLabel: string;
  playTitle: string;
  playSrc: string;
  playCover: string;
};

function homeShellHtml() {
  const ctaAttrs = hero.ctaHref.startsWith('http')
    ? ` href="${hero.ctaHref}" target="_blank" rel="noreferrer"`
    : ` href="${hero.ctaHref}"`;
  return `<div id="home-shell" class="homeShell">
  <img id="home-lcp" src="${hero.src}" srcset="${hero.srcSet}" sizes="${hero.sizes}" width="${hero.width}" height="${hero.height}" alt="" fetchpriority="high" decoding="async" />
  <div class="homeShellCopy">
    <p class="homeShellKicker">${hero.kicker}</p>
    <h1>${hero.headline}</h1>
    <p class="homeShellSub">${hero.sub}</p>
    <a class="homeShellCta"${ctaAttrs}>${hero.ctaLabel}</a>
    <button type="button" class="homeShellPlay" id="home-play-latest" data-src="${hero.playSrc}" data-title="${hero.playTitle}">${hero.playLabel}</button>
  </div>
</div>
<script>
(function(){
  var b=document.getElementById('home-play-latest');
  if(!b) return;
  b.addEventListener('click', function(){
    window.dispatchEvent(new CustomEvent('3000-play-track',{detail:{src:b.getAttribute('data-src'),title:b.getAttribute('data-title')}}));
    document.documentElement.classList.add('is-cinematic-active');
  });
})();
</script>`;
}

function homeShellCriticalCss() {
  return `#home-shell.homeShell{position:absolute;top:0;left:0;right:0;height:100svh;z-index:0;background:#05060a;color:#f4efe2;overflow:hidden;pointer-events:none}
#home-lcp{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;aspect-ratio:1/1}
#home-shell::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,6,10,.25) 0%,rgba(5,6,10,.55) 55%,rgba(5,6,10,.94) 100%)}
.homeShellCopy{position:relative;z-index:1;display:flex;flex-direction:column;justify-content:flex-end;min-height:100svh;max-width:42rem;padding:clamp(5rem,18vh,8rem) 1.25rem 6rem;box-sizing:border-box;pointer-events:auto}
.homeShellKicker{letter-spacing:.18em;text-transform:uppercase;font-size:.72rem;opacity:.8}
#home-shell h1{margin:.4rem 0;font:700 clamp(2.2rem,8vw,4.2rem)/1.05 Georgia,serif}
.homeShellSub{max-width:36rem;opacity:.88}
.homeShellCta,.homeShellPlay{display:inline-flex;align-items:center;min-height:44px;padding:0 1.1rem;margin-top:1rem;margin-right:.6rem;border-radius:999px;font-weight:800;text-decoration:none;width:fit-content;border:0;cursor:pointer}
.homeShellCta{background:#d4af37;color:#111}
.homeShellPlay{background:transparent;color:#f4efe2;border:1px solid rgba(212,175,55,.55)}
html.is-cinematic-active #home-lcp{opacity:.38;transition:opacity .8s ease}
html.is-app-ready #home-shell{background:transparent}
#root{position:relative;z-index:1;min-height:100svh;background:transparent;max-width:100%;overflow-x:clip;min-width:0}
html.is-home-lcp .vipSite,html.is-home-lcp .md-scope,html.is-home-lcp .md-hero{background:transparent!important}`;
}

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

const homeShellPlugin = {
  name: 'home-first-paint-shell',
  transformIndexHtml: {
    order: 'pre' as const,
    handler(html: string) {
      return html
        .replace('<!--HOME_SHELL_CSS-->', `<style>${homeShellCriticalCss()}</style>`)
        .replace('<!--HOME_SHELL-->', homeShellHtml());
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
  plugins: [react(), homeShellPlugin, pagesAssetLimitPlugin, sameOriginStylesPlugin],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-router-dom')) {
            return 'react';
          }
          // Keep framer-motion in the lazy route chunks that actually import it.
          // A dedicated manual chunk was being preloaded on Home even when unused.
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
