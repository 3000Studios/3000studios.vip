import type { PagesEnv } from '../env';
import { getLiveFlagState, setLiveFlag } from '../lib/live-flag-store';
import { requireOwner } from './live-access';

const NO_STORE = { 'cache-control': 'no-store, private' };

/**
 * Token minted by the client on local passcode login (see src/lib/auth.tsx).
 * Accepting it here mirrors the admin panel itself: anyone who knows the
 * owner passcode can already open /admin and press Go Live. Remote tokens
 * are still verified via requireOwner.
 */
const LOCAL_OWNER_TOKEN = 'owner-token-5555-passcode';

function bearerToken(request: Request): string {
  const authorization = request.headers.get('authorization') ?? '';
  if (!authorization.toLowerCase().startsWith('bearer ')) return '';
  return authorization.slice(7).trim();
}

async function isOwner(request: Request, env: PagesEnv): Promise<boolean> {
  const token = bearerToken(request);
  if (!token) return false;
  if (token === LOCAL_OWNER_TOKEN) return true;
  try {
    return await requireOwner(request, env);
  } catch {
    return false;
  }
}

/**
 * GET /api/live-flag — public. Viewers poll this to learn whether the
 * studio is broadcasting. Live only while heartbeats are fresh.
 */
export const onRequestGet: PagesFunction<PagesEnv> = async ({ env }) => {
  try {
    const state = await getLiveFlagState(env);
    return Response.json({ ok: true, ...state }, { headers: NO_STORE });
  } catch {
    return Response.json(
      { ok: false, error: 'live_flag_unavailable' },
      { status: 503, headers: NO_STORE },
    );
  }
};

type LiveFlagBody = { live?: unknown };

/**
 * POST /api/live-flag — owner only. Body: { live: boolean }.
 * Broadcasters call this on Go Live and then every ~15s (heartbeat);
 * call with { live: false } on End. The flag auto-expires ~60s after the
 * last heartbeat so a crashed browser can't stick "live" on forever.
 */
export const onRequestPost: PagesFunction<PagesEnv> = async ({ request, env }) => {
  try {
    if (!(await isOwner(request, env))) {
      return Response.json(
        { ok: false, error: 'owner_access_required' },
        { status: 401, headers: NO_STORE },
      );
    }
    const body = (await request.json().catch(() => ({}))) as LiveFlagBody;
    const state = await setLiveFlag(env, body.live === true);
    return Response.json({ ok: true, ...state }, { headers: NO_STORE });
  } catch {
    return Response.json(
      { ok: false, error: 'live_flag_unavailable' },
      { status: 503, headers: NO_STORE },
    );
  }
};
