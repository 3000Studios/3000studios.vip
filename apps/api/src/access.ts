import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Env } from './env';

const jwksByTeamDomain = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(teamDomain: string) {
  const normalized = teamDomain.replace(/\/$/, '');
  let jwks = jwksByTeamDomain.get(normalized);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${normalized}/cdn-cgi/access/certs`));
    jwksByTeamDomain.set(normalized, jwks);
  }
  return jwks;
}

/**
 * Fail closed. A CF Access header can be spoofed on an unprotected Worker, so
 * its signature, issuer, audience, and owner identity are always verified.
 */
export async function requireOwnerAccess(request: Request, env: Env): Promise<{ ok: true; email: string } | { ok: false; status: number; error: string }> {
  const teamDomain = env.CF_ACCESS_TEAM_DOMAIN?.trim().replace(/\/$/, '');
  const audience = env.CF_ACCESS_AUD?.trim();
  const ownerEmail = env.OWNER_EMAIL?.trim().toLowerCase();
  if (!teamDomain || !audience || !ownerEmail) {
    return { ok: false, status: 503, error: 'owner_access_not_configured' };
  }

  const token = request.headers.get('cf-access-jwt-assertion');
  if (!token) return { ok: false, status: 401, error: 'owner_access_required' };

  try {
    const { payload } = await jwtVerify(token, getJwks(teamDomain), { issuer: teamDomain, audience });
    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    if (!email || email !== ownerEmail) return { ok: false, status: 403, error: 'owner_access_denied' };
    return { ok: true, email };
  } catch {
    return { ok: false, status: 403, error: 'owner_access_denied' };
  }
}
