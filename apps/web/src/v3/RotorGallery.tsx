import { useEffect, useRef } from 'react';
import './rotor.css';

/**
 * RotorGallery — native React port of the Framer "Rotor" gallery module
 * (https://framer.com/m/RotorGallery-8thy.js@AmybVXNOQnQnhRYVNLmF).
 *
 * The original is a Framer code component: it imports `addPropertyControls`,
 * `RenderTarget` and `useIsStaticRenderer` from the "framer" runtime package,
 * which only exists inside Framer's editor/site runtime, so the module file
 * itself cannot run on this stack. This component recreates the module's
 * exact mechanics in the site's own stack (React + CSS 3D):
 *
 *  - Cards sit on a reel that rotates about the X axis:
 *    item transform = rotateX(globalRotation - itemAngle) translateZ(radius),
 *    driven by a single `--global-rotation` CSS variable written from a rAF
 *    loop (no React re-render per frame).
 *  - The whole reel is tilted by the camera angles (Cam X -25deg, Cam Z
 *    -100deg by default), which is what makes the reel sweep diagonally and
 *    the card faces read near-upright on screen.
 *  - Each card is double-sided (front/back faces, backface-visibility hidden)
 *    with a 1px thickness, exactly like the original's ffg-face pair.
 *  - Auto-rotation: one revolution per `speedSec` (module default 35s).
 *    Hover slows to 0.35x when `slowOnHover` is on (module HOVER_SPEED_FACTOR).
 *    Dragging rotates at 0.4deg/px (module DRAG_DEG_PER_PX) with inertia
 *    friction 0.95 (module INERTIA_FRICTION); a real drag suppresses the
 *    click on release, like the original's click-capture guard.
 *
 * Site-integration choices (documented, deliberate): portrait cards sized for
 * the 9:16 promo thumbnails, a title/number chip on the front face so promos
 * are identifiable, drag + slow-on-hover enabled (both are first-class module
 * options), rotation pauses off-screen / on keyboard focus / for
 * prefers-reduced-motion users.
 */

export type RotorGalleryItem = {
  image: string;
  link?: string;
  title?: string;
};

type RotorGalleryProps = {
  items: RotorGalleryItem[];
  /** Seconds per full revolution (module "Speed", default 35). */
  speedSec?: number;
  /** Module "Card W" — the card box width; on screen this is the card height. */
  cardWidth?: number;
  /** Module "Card H" — the card box height; on screen this is the card width. */
  cardHeight?: number;
  /** Module "Gap" — reel radius in px. Auto-sized from the item count when omitted. */
  radiusPx?: number;
  /** Module "Perspective" (default 2500). */
  perspective?: number;
  camX?: number;
  camY?: number;
  camZ?: number;
  slowOnHover?: boolean;
  enableDrag?: boolean;
  openInNewTab?: boolean;
  ariaLabel?: string;
};

const HOVER_SPEED_FACTOR = 0.35; // module constant
const DRAG_DEG_PER_PX = 0.4; // module constant
const INERTIA_FRICTION = 0.95; // module constant
const HALF_THICK_PX = 0.5; // module "Thickness" default 1px

export function RotorGallery({
  items,
  speedSec = 35,
  cardWidth = 190,
  cardHeight = 300,
  radiusPx,
  perspective = 2500,
  camX = -25,
  camY = 0,
  camZ = -100,
  slowOnHover = false,
  enableDrag = false,
  openInNewTab = false,
  ariaLabel = 'Rotating gallery',
}: RotorGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const hoveredRef = useRef(false);
  const focusPauseRef = useRef(false);
  const visibleRef = useRef(true);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startAngle: number;
    lastX: number;
    velocity: number; // deg per frame
    moved: number;
  }>({ active: false, startX: 0, startAngle: 0, lastX: 0, velocity: 0, moved: 0 });
  const didDragRef = useRef(false);

  const total = items.length;
  // Auto radius: adjacent cards should overlap in a cascade like the module's
  // default setup (radius 150 vs 200px cards) — target chord ≈ 0.52 * the
  // card's tangent extent (cardWidth), solved from chord = 2R*sin(pi/N).
  const radius =
    radiusPx ??
    (total > 1
      ? Math.round((cardWidth * 0.52) / (2 * Math.sin(Math.PI / total)))
      : 150);

  /* Responsive scale — the module's "Scale Mode": fit the reel's design width
     (its diameter plus a card) into the actual container width. */
  useEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    if (!root || !scene) return;
    const designWidth = radius * 2 + cardHeight;
    const apply = () => {
      const w = root.clientWidth;
      if (w > 0) {
        const s = Math.min(1, Math.max(0.26, w / designWidth));
        scene.style.transform = `scale(${s})`;
      }
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(root);
    return () => ro.disconnect();
  }, [radius, cardHeight]);

  /* Pause when the section is off-screen — 56 preserve-3d cards are not free. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries[0]?.isIntersecting ?? true;
      },
      { rootMargin: '120px' },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  /* The rotation loop — mirrors the module's rAF driver. */
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last: number | null = null;
    const degPerMs = 360 / Math.max(1, speedSec * 1000);
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (last === null) {
        last = t;
        return;
      }
      const deltaMs = t - last;
      last = t;
      if (!visibleRef.current) return;
      const drag = dragRef.current;
      if (drag.active) return; // pointermove owns the angle while dragging
      if (Math.abs(drag.velocity) > 0.002) {
        // Inertia after a flick — friction applied per ~60fps frame.
        angleRef.current += drag.velocity * (deltaMs / 16.667);
        drag.velocity *= Math.pow(INERTIA_FRICTION, deltaMs / 16.667);
        scene.style.setProperty('--global-rotation', `${angleRef.current}deg`);
        return;
      }
      if (reducedMotion || focusPauseRef.current) return;
      const factor = slowOnHover && hoveredRef.current ? HOVER_SPEED_FACTOR : 1;
      angleRef.current -= deltaMs * degPerMs * factor; // module direction: -1
      scene.style.setProperty('--global-rotation', `${angleRef.current}deg`);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [speedSec, slowOnHover]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!enableDrag) return;
    const drag = dragRef.current;
    drag.active = true;
    drag.startX = e.clientX;
    drag.lastX = e.clientX;
    drag.startAngle = angleRef.current;
    drag.velocity = 0;
    drag.moved = 0;
    didDragRef.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!enableDrag || !drag.active) return;
    const dx = e.clientX - drag.startX;
    drag.moved = Math.max(drag.moved, Math.abs(dx));
    angleRef.current = drag.startAngle + dx * DRAG_DEG_PER_PX;
    drag.velocity = (e.clientX - drag.lastX) * DRAG_DEG_PER_PX;
    drag.lastX = e.clientX;
    sceneRef.current?.style.setProperty(
      '--global-rotation',
      `${angleRef.current}deg`,
    );
    if (drag.moved > 6) didDragRef.current = true;
  };

  const endDrag = () => {
    dragRef.current.active = false;
  };

  const onClickCapture = (e: React.SyntheticEvent) => {
    if (didDragRef.current) {
      e.preventDefault();
      e.stopPropagation();
      didDragRef.current = false;
    }
  };

  return (
    <div
      ref={rootRef}
      className="rotor-root"
      role="region"
      aria-label={ariaLabel}
      style={{ perspective: `${perspective}px` }}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
        endDrag();
      }}
      onFocus={() => {
        focusPauseRef.current = true;
      }}
      onBlur={() => {
        focusPauseRef.current = false;
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
    >
      <div ref={sceneRef} className="rotor-scene">
        <div
          className="rotor-list"
          style={
            {
              transform: `rotateX(${camX}deg) rotateY(${camY}deg) rotateZ(${camZ}deg)`,
              '--card-w': `${cardWidth}px`,
              '--card-h': `${cardHeight}px`,
            } as React.CSSProperties
          }
        >
          {items.map((item, index) => {
            const itemAngle = (index / Math.max(1, total)) * 360;
            const face = (
              <>
                <div
                  className="rotor-face rotor-face--front"
                  style={{ transform: `rotateZ(90deg) translateZ(${HALF_THICK_PX}px)` }}
                >
                  <img
                    src={item.image}
                    alt={item.title ? `${item.title} — YouTube video thumbnail` : ''}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                  {item.title && (
                    <span className="rotor-chip">
                      <span className="rotor-chip-num">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="rotor-chip-title">{item.title}</span>
                    </span>
                  )}
                </div>
                <div
                  className="rotor-face rotor-face--back"
                  style={{
                    transform: `rotateZ(90deg) rotateY(180deg) translateZ(${HALF_THICK_PX}px)`,
                  }}
                >
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              </>
            );
            const itemStyle = {
              transform: `rotateX(calc(var(--global-rotation) - ${itemAngle}deg)) translateZ(${radius}px)`,
            } as React.CSSProperties;
            return item.link ? (
              <div key={index} className="rotor-item" style={itemStyle}>
                <a
                  className="rotor-cardlink"
                  href={item.link}
                  {...(openInNewTab
                    ? { target: '_blank', rel: 'noreferrer' }
                    : {})}
                  aria-label={item.title ? `Watch ${item.title}` : undefined}
                >
                  {face}
                </a>
              </div>
            ) : (
              <div key={index} className="rotor-item" style={itemStyle}>
                <div className="rotor-cardlink">{face}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
