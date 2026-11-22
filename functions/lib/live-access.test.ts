import { describe, expect, it } from 'vitest';
import {
  createLiveSession,
  hasLiveSession,
  isSameOrigin,
  liveSessionCookie,
  verifyLiveCode,
} from './live-access';

const env = {
  LIVE_ACCESS_CODE: 'test-code',
  LIVE_ACCESS_SESSION_SECRET: 'test-session-secret-that-is-long-enough-for-tests',
};

describe('live access authorization', () => {
  it('accepts only the configured server-side code', async () => {
    await expect(verifyLiveCode('test-code', env)).resolves.toBe(true);
    await expect(verifyLiveCode('wrong-code', env)).resolves.toBe(false);
  });

  it('creates a refresh-safe signed session and rejects tampering or expiry', async () => {
    const now = Date.UTC(2026, 8, 23, 12);
    const session = await createLiveSession(env, 1, false, now);
    const request = new Request('https://3000studios.vip/live', {
      headers: { cookie: liveSessionCookie(session).split(';')[0] },
    });
    await expect(hasLiveSession(request, env, 1, now + 60_000)).resolves.toBe(true);
    const tampered = new Request('https://3000studios.vip/live', {
      headers: { cookie: `__Host-live_access=${session}x` },
    });
    await expect(hasLiveSession(tampered, env, 1, now + 60_000)).resolves.toBe(false);
    await expect(hasLiveSession(request, env, 1, now + 9 * 60 * 60 * 1000)).resolves.toBe(false);
    await expect(hasLiveSession(request, env, 2, now + 60_000)).resolves.toBe(false);
  });

  it('requires same-origin form submissions', () => {
    expect(
      isSameOrigin(
        new Request('https://3000studios.vip/live/unlock', {
          headers: { origin: 'https://3000studios.vip' },
        }),
      ),
    ).toBe(true);
    expect(
      isSameOrigin(
        new Request('https://3000studios.vip/live/unlock', {
          headers: { origin: 'https://attacker.example' },
        }),
      ),
    ).toBe(false);
  });
});
