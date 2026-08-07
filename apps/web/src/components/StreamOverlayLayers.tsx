import type { CSSProperties } from 'react';
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
              <img src={layer.content} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          );
        }
        if (layer.type === 'html') {
          return (
            <div
              key={layer.id}
              className="streamOverlayLayer streamOverlayHtml"
              style={{ ...box, ...(parseInlineStyle(layer.style)) }}
              dangerouslySetInnerHTML={{ __html: layer.content }}
            />
          );
        }
        // css: inject style tag + empty box host
        return (
          <div key={layer.id} className="streamOverlayLayer" style={box} data-layer={layer.id}>
            <style>{scopeCss(layer.content, layer.id)}</style>
            <div className={`stream-css-host-${layer.id.replace(/[^a-zA-Z0-9_-]/g, '')}`} style={parseInlineStyle(layer.style)} />
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
