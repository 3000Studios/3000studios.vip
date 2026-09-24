const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[character] || character,
  );

export function liveGatePage(message = '', retryAfter = 0): string {
  const notice = message ? `<p class="notice" role="alert">${escapeHtml(message)}</p>` : '';
  const wait = retryAfter > 0 ? `<p class="wait">Try again in ${retryAfter} seconds.</p>` : '';
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Unlock Live Stream · 3000 Studios</title>
<style>
:root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:#050505;color:#fff}
*{box-sizing:border-box}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 50% 15%,#342500 0,#090700 38%,#020202 75%)}
main{width:min(100%,430px);padding:clamp(26px,7vw,42px);border:1px solid #8f711e;border-radius:24px;background:rgba(8,8,8,.94);box-shadow:0 24px 80px #000,0 0 40px #d8ab2130;text-align:center}
.brand{color:#f3ca53;letter-spacing:.2em;font-weight:850;font-size:.78rem}.lock{font-size:2.3rem;margin:18px 0 6px}h1{font-size:clamp(1.6rem,7vw,2.35rem);margin:.2em 0}.sub{color:#c7c7c7;line-height:1.55;margin:0 0 24px}
label{display:block;text-align:left;font-weight:700;margin:0 0 8px}input{width:100%;min-height:52px;border:1px solid #6d5a25;border-radius:12px;background:#111;color:#fff;font:inherit;font-size:1.25rem;padding:12px 15px;text-align:center;letter-spacing:.15em}input:focus{outline:3px solid #f3ca5366;border-color:#f3ca53}
button{width:100%;min-height:52px;margin-top:14px;border:0;border-radius:12px;background:linear-gradient(135deg,#f7d260,#b8860b);color:#090600;font:inherit;font-weight:900;cursor:pointer}button:focus-visible{outline:3px solid #fff;outline-offset:3px}.notice{color:#ffaaaa;font-weight:750}.wait{color:#f3ca53}a{color:#e9ca70}
</style></head><body><main><div class="brand">3000 STUDIOS</div><div class="lock" aria-hidden="true">🔒</div><h1>Private live stream</h1><p class="sub">Enter the temporary access code to watch. Authorization is checked securely before the stream is served.</p>${notice}${wait}
<form method="post" action="/live/unlock"><label for="code">Access code</label><input id="code" name="code" type="password" inputmode="numeric" autocomplete="one-time-code" required autofocus ${retryAfter > 0 ? 'disabled' : ''}><button type="submit" ${retryAfter > 0 ? 'disabled' : ''}>Unlock stream</button></form>
<p><a href="/">Return home</a></p></main></body></html>`;
}
