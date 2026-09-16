// new-tiktok-game.mjs — TikTok Games Factory scaffolder (never-stop loop)
// Usage: node scripts/new-tiktok-game.mjs <slug> "<Title>" "<emoji>"
// Creates apps/web/public/tiktok-games/<slug>.html from the viral template.
import { writeFileSync, existsSync } from 'node:fs';
const [slug, title = 'New Hustle', emoji = '🎮'] = process.argv.slice(2);
if (!slug) { console.error('Usage: node scripts/new-tiktok-game.mjs <slug> "<Title>" "<emoji>"'); process.exit(1); }
const path = new URL(`../apps/web/public/tiktok-games/${slug}.html`, import.meta.url);
if (existsSync(path)) { console.error('Exists: ' + path); process.exit(1); }
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
<title>${title} — TikTok Game | 3000 Studios</title>
<meta name="description" content="${title} — free 30-second vertical TikTok mini-game. Clip it and tag @3000studios.vip" />
<link rel="canonical" href="https://3000studios.vip/tiktok-games/${slug}.html" />
<style>
:root{color-scheme:dark;--pink:#FE2C55;--cyan:#25F4EE}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
body{margin:0;background:#010204;color:#fff;font-family:Inter,system-ui,sans-serif;text-align:center}
.wrap{max-width:460px;margin:0 auto;padding:16px}.eyebrow{color:var(--cyan);font-size:.7rem;font-weight:800;letter-spacing:.15em}
#score{font-size:2.4rem;font-weight:900}#stage{width:100%;max-width:420px;height:480px;margin:10px auto;background:#05070f;border:1px solid #1c2340;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;touch-action:none}
button{background:var(--pink);color:#fff;border:0;font-weight:800;padding:14px;border-radius:12px;width:100%;font-size:1rem;margin-top:8px}
button.ghost{background:#1a2140}#cap{font-size:.78rem;color:#a7a7b3;background:#070a16;border-radius:10px;padding:10px;margin-top:10px}
a{color:var(--cyan);font-size:.85rem}
</style>
</head>
<body>
<div class="wrap">
<div class="eyebrow">TIKTOK GAME • @3000STUDIOS.VIP</div>
<h1>${emoji} ${title.toUpperCase()}</h1>
<div id="score">0</div>
<div id="stage">YOUR GAME HERE — score on tap. Keep it 30s + clip-ready.</div>
<button id="play">▶ START</button>
<div id="cap">Caption: I scored __ on ${title} ${emoji} Beat me @3000studios.vip #minigames #3000studios</div>
<button class="ghost" id="copy">COPY CAPTION</button>
<div style="margin-top:8px"><a href="./">← all games</a> • <a href="https://www.tiktok.com/@3000studios.vip" target="_blank" rel="noopener">tiktok</a></div>
</div>
<script>
let s=0;const S=document.getElementById('score'),st=document.getElementById('stage');
st.addEventListener('pointerdown',()=>{s++;S.textContent=s;st.textContent='Score '+s+' — keep going! 🔥';});
document.getElementById('play').onclick=()=>{s=0;S.textContent='0';st.textContent='GO! Tap fast for 30s! ⏱';};
document.getElementById('copy').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('cap').textContent)};
</script>
<!-- ADSENSE: ${slug} bottom banner slot -->
</body>
</html>
`;
writeFileSync(path, html);
console.log('Created: apps/web/public/tiktok-games/' + slug + '.html');
console.log('Next: add hub card in tiktok-games/index.html + sitemap.xml entry, then commit → push main.');
