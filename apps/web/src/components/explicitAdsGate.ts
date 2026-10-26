/**
 * Ads-off gate for explicit song routes (Crew C, VIP-1000X program).
 *
 * AdSense policy risk: explicit tracks must never load ad scripts or render
 * ad units. This module is the single app-side check consulted by
 * ConsentManager (script loader) and AdSenseUnit (unit renderer).
 *
 * RECONCILED with Crew B's final landing (2026-10-26):
 *  - Crew B's `src/data/explicit-routes.json` is FINAL:
 *    ["/song/cum-on-my-face", "/song/fuhk-u"]. It is picked up at build
 *    time via import.meta.glob below — those two routes are always gated.
 *  - Crew B also set `explicit: true` flags in the data on: Cum on My
 *    Face, Fuhk U (publishedSongs), and in music.ts on Lick My Balls
 *    (feature + jazz + remix), Simp Bitch, Fuck Redlights, Do Ya Think
 *    My Shit's Messy, Squash That Mother; Simp Bitch + Street Hookers
 *    shorts are flagged in the shorts data (no /song route exists for
 *    the Street Hookers title — its slug below is inert until one does).
 *  - FALLBACK_EXPLICIT_SLUGS therefore mirrors exactly Crew B's flagged
 *    set as a belt-and-braces net (in case the JSON is ever dropped),
 *    and isExplicitSong() honours the data `explicit` flag directly.
 *  - redirects.json (Crew B/A, worker-applied) does not affect this gate:
 *    neither redirect source nor target is an explicit route.
 *
 * Accepted explicit-routes.json shapes:
 *   ["/song/<slug>", ...] | { routes: [...] } | { slugs: [...] }
 */

type ExplicitRoutesFile =
  | string[]
  | { routes?: string[]; slugs?: string[]; paths?: string[] };

const globbed = import.meta.glob('../data/explicit-routes.json', {
  eager: true,
}) as Record<string, { default?: ExplicitRoutesFile } | ExplicitRoutesFile>;

function slugsFromFile(): string[] {
  const out: string[] = [];
  for (const mod of Object.values(globbed)) {
    const data = ((mod as { default?: ExplicitRoutesFile }).default ??
      mod) as ExplicitRoutesFile;
    const lists: (string[] | undefined)[] = Array.isArray(data)
      ? [data]
      : [data.routes, data.slugs, data.paths];
    for (const list of lists) {
      for (const entry of list ?? []) {
        const slug = entry.replace(/^\/song\//, '').replace(/\/$/, '').trim();
        if (slug) out.push(slug);
      }
    }
  }
  return out;
}

export const FALLBACK_EXPLICIT_SLUGS: readonly string[] = [
  // Named in the Boss's 2026-10-26 audit:
  'cum-on-my-face',
  'simp-bitch',
  'street-hookers-dont-smell-real-nice',
  // Profanity-titled rollout tracks found in src/data/music.ts (Crew C grep):
  'lick-my-balls-jazz',
  'lick-my-balls-remix',
  'fuck-redlights',
  'do-ya-think-my-shits-messy',
  'fuhk-u',
  // Flagged explicit:true by Crew B in src/data/music.ts:
  'squash-that-mother',
];

export const EXPLICIT_SONG_SLUGS: ReadonlySet<string> = new Set([
  ...FALLBACK_EXPLICIT_SLUGS,
  ...slugsFromFile(),
]);

/** True when a /song/<slug> pathname belongs to an explicit-flagged track. */
export function isExplicitRoute(pathname: string): boolean {
  const match = pathname.match(/^\/song\/([^/]+)\/?$/);
  if (!match) return false;
  let slug = match[1];
  try {
    slug = decodeURIComponent(slug);
  } catch {
    /* keep raw slug */
  }
  return EXPLICIT_SONG_SLUGS.has(slug.toLowerCase());
}

/** True when a song data entry carries Crew B's `explicit: true` flag. */
export function isExplicitSong(song: unknown): boolean {
  if (!song || typeof song !== 'object') return false;
  const entry = song as { explicit?: unknown; slug?: unknown };
  if (entry.explicit === true) return true;
  return typeof entry.slug === 'string' && EXPLICIT_SONG_SLUGS.has(entry.slug);
}

/** Ads (script + units) are allowed only off explicit routes. */
export function adsAllowedOnRoute(pathname: string): boolean {
  return !isExplicitRoute(pathname);
}
