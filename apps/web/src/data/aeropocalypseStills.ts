/**
 * AEROPOCALYPSE: ONLINE — gameplay stills for the theater page gallery.
 *
 * DROP-IN PROCESS for new capture stills (from the capture session's
 * ~/workspace/thunderdome/captures-v2-2026-11-14/stills/ output):
 *   1. Copy the still into apps/web/public/media/aeropocalypse/stills/
 *   2. Add an entry below pointing at /media/aeropocalypse/stills/<file>
 *   3. Rebuild + redeploy — the gallery section renders only when this
 *      list is non-empty (no empty placeholder section ever ships).
 */
export interface AeroStill {
  src: string;
  alt: string;
  caption: string;
}

export const AERO_STILLS: AeroStill[] = [
  {
    src: '/media/aeropocalypse/stills/stage-01-combat.jpg',
    alt: 'Stage 01 combat over the Neon Outpost — the hero jet under fire in the new HUD',
    caption: 'Stage 01 · Neon Outpost — live combat in the new HUD.',
  },
  {
    src: '/media/aeropocalypse/stills/stage-01-formation.jpg',
    alt: 'Stage 01 — enemy formation closing over the neon city',
    caption: 'Stage 01 · Neon Outpost — the formation closes in.',
  },
  {
    src: '/media/aeropocalypse/stills/stage-select.jpg',
    alt: 'Stage Select — 25 sectors, Stage 01 Neon Outpost, boss Neon Overlord',
    caption: 'Stage Select — 25 sectors deep, every one ends in a boss.',
  },
];
