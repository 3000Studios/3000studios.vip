export function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(match[1].trim()).slice(0, 180) : null;
}

export function extractCanonical(html: string): string | null {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i);
  if (!match) return null;
  const tag = match[0];
  const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
  return hrefMatch ? hrefMatch[1].trim().slice(0, 500) : null;
}

export function extractRobots(html: string): string | null {
  const match = html.match(/<meta[^>]+name=["']robots["'][^>]*>/i);
  if (!match) return null;
  const tag = match[0];
  const contentMatch = tag.match(/content=["']([^"']+)["']/i);
  return contentMatch ? contentMatch[1].trim().slice(0, 200) : null;
}

function decodeHtml(s: string): string {
  return s
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

