import type { CSSProperties } from 'react';
import DOMPurify from 'dompurify';
import type { StreamOverlayLayer } from '../lib/streamScene';

/** DOM overlays for public live window (CSS/HTML/image/iframe). */
export function StreamOverlayLayers({ layers }: { layers: StreamOverlayLayer[] }) {
  const visible = [...layers].filter((l) => l.visible).sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="streamOverlayRoot" aria-hidden="true">
      {visible.map((layer) => {
        const box: CSSProperties = {
          position: 'absolute',
          left: `${layer.x}%`,
          top: `${layer.y}%`,
          width: `${layer.w}%`,
          height: `${layer.h}%`,
          zIndex: layer.zIndex,
          opacity: layer.opacity,
          pointerEvents: 'none',
          overflow: 'hidden',
        };
        if (layer.type === 'image') {
          return (
            <div key={layer.id} className="streamOverlayLayer" style={box}>
              <img
                src={layer.content}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          );
        }
        if (layer.type === 'iframe') {
          return (
            <div key={layer.id} className="streamOverlayLayer" style={box}>
              <iframe
                title={layer.name}
                src={layer.content}
                style={{ width: '100%', height: '100%', border: 0, pointerEvents: 'none' }}
                sandbox="allow-scripts"
                allow=""
                loading="lazy"
              />
            </div>
          );
        }
        if (layer.type === 'html') {
          const sanitized = DOMPurify.sanitize(layer.content, {
            ALLOWED_TAGS: [
              'div',
              'span',
              'p',
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'strong',
              'em',
              'b',
              'i',
              'u',
              's',
              'small',
              'br',
              'hr',
              'img',
              'a',
            ],
            ALLOWED_ATTR: ['class', 'style', 'href', 'target', 'rel', 'src', 'alt', 'title'],
          });
          return (
            <div
              key={layer.id}
              className="streamOverlayLayer streamOverlayHtml"
              style={{ ...box, ...parseInlineStyle(layer.style) }}
              dangerouslySetInnerHTML={{ __html: sanitized }}
            />
          );
        }
        // css: inject style tag + empty box host
        const safeCss = sanitizeOverlayCss(layer.content);
        return (
          <div key={layer.id} className="streamOverlayLayer" style={box} data-layer={layer.id}>
            <style>{scopeCss(safeCss, layer.id)}</style>
            <div
              className={`stream-css-host-${layer.id.replace(/[^a-zA-Z0-9_-]/g, '')}`}
              style={parseInlineStyle(layer.style)}
            />
          </div>
        );
      })}
    </div>
  );
}

function parseInlineStyle(style?: string): CSSProperties {
  if (!style?.trim()) return {};
  const out: Record<string, string> = {};
  style.split(';').forEach((part) => {
    const [k, ...rest] = part.split(':');
    if (!k || !rest.length) return;
    const key = k.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[key] = rest.join(':').trim();
  });
  return out as CSSProperties;
}

const ALLOWED_CSS_PROPERTIES = new Set([
  'color',
  'background',
  'background-color',
  'border',
  'border-radius',
  'box-shadow',
  'font-size',
  'font-weight',
  'font-family',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'text-shadow',
  'opacity',
  'transform',
  'animation',
  'animation-name',
  'animation-duration',
  'animation-timing-function',
  'animation-delay',
  'animation-iteration-count',
  'animation-direction',
  'animation-fill-mode',
  'filter',
  'backdrop-filter',
  'padding',
  'margin',
  'width',
  'height',
  'display',
  'position',
  'top',
  'left',
  'right',
  'bottom',
  'z-index',
  'overflow',
  'white-space',
  'word-break',
]);

const FORBIDDEN_CSS_PATTERNS = [
  /@import\s+/gi,
  /@font-face\s*/gi,
  /url\s*\(/gi,
  /expression\s*\(/gi,
  /behavior\s*:/gi,
  /-moz-binding\s*:/gi,
];

/**
 * Drop network-bearing and dangerous CSS while preserving visual styling and
 * keyframe animations. This is a defense-in-depth layer; overlay content is
 * owner-edited but rendered on a public page.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function sanitizeOverlayCss(css: string): string {
  for (const pattern of FORBIDDEN_CSS_PATTERNS) {
    if (pattern.test(css)) {
      // Strip the forbidden construct entirely.
      css = css.replace(pattern, '/* blocked */');
    }
  }

  // Remove declarations with disallowed properties.
  return css
    .replace(/([^{};]+)\{([^}]*)\}/g, (_match, selector: string, body: string) => {
      const cleanDecls = body
        .split(';')
        .map((decl: string) => decl.trim())
        .filter((decl: string) => {
          if (!decl) return false;
          const prop = decl.split(':')[0]?.trim().toLowerCase() || '';
          return ALLOWED_CSS_PROPERTIES.has(prop);
        });
      if (!cleanDecls.length) return '';
      return `${selector.trim()} { ${cleanDecls.join('; ')}; }`;
    })
    .trim();
}

/** Prefix selectors lightly so custom CSS is less global-leaky */
function scopeCss(css: string, id: string): string {
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, '');
  // Allow @keyframes as-is; prefix simple selectors with host class when possible
  return css.replace(/(^|})\s*([^{@}]+)\s*\{/g, (_m, brace, sel) => {
    const trimmed = String(sel).trim();
    if (trimmed.startsWith('@') || trimmed.includes('keyframes')) return `${brace} ${trimmed} {`;
    return `${brace} .stream-css-host-${safe} ${trimmed}, .stream-css-host-${safe} {`;
  });
}
