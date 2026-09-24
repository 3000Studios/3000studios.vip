import type { PagesEnv } from '../env';
import { hasLiveSession } from '../lib/live-access';
import { getLiveAccessState, updateLiveAccessState } from '../lib/live-access-store';

const NO_STORE = { 'cache-control': 'no-store, private' };

async function requireOwner(request: Request, env: PagesEnv): Promise<boolean> {
  const authorization = request.headers.get('authorization');
  if (!authorization?.toLowerCase().startsWith('bearer ')) return false;
  const apiBase = (env.API_BASE || env.VITE_API_BASE || 'https://api.3000studios.vip').replace(
    /\/$/,
    '',
  );
  const response = await fetch(`${apiBase}/auth/verify`, { headers: { authorization } });
  return response.ok;
}

export const onRequestGet: PagesFunction<PagesEnv> = async ({ request, env }) => {
  try {
    const state = await getLiveAccessState(env);
    const authorized =
      !state.protected || (await hasLiveSession(request, env, state.sessionVersion));
    return Response.json(
      {
        ok: true,
        protected: state.protected,
        rememberViewer: state.rememberViewer,
        authorized,
        updatedAt: state.updatedAt,
      },
      { headers: NO_STORE },
    );
  } catch {
    return Response.json(
      { ok: false, error: 'live_access_unavailable' },
      { status: 503, headers: NO_STORE },
    );
  }
};

export const onRequestPut: PagesFunction<PagesEnv> = async ({ request, env }) => {
  if (!(await requireOwner(request, env))) {
    return Response.json(
      { ok: false, error: 'owner_access_required' },
      { status: 401, headers: NO_STORE },
    );
  }
  const body = (await request.json().catch(() => ({}))) as {
    protected?: unknown;
    rememberViewer?: unknown;
    code?: unknown;
    revoke?: unknown;
  };
  const code = typeof body.code === 'string' ? body.code.trim() : undefined;
  if (code !== undefined && (code.length < 4 || code.length > 64)) {
    return Response.json(
      { ok: false, error: 'code_length_invalid' },
      { status: 400, headers: NO_STORE },
    );
  }
  const state = await updateLiveAccessState(env, {
    protected: typeof body.protected === 'boolean' ? body.protected : undefined,
    rememberViewer: typeof body.rememberViewer === 'boolean' ? body.rememberViewer : undefined,
    code,
    revoke: body.revoke === true,
  });
  return Response.json({ ok: true, ...state }, { headers: NO_STORE });
};
