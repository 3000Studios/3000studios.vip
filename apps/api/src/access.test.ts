import { describe, expect, it } from 'vitest';
import { requireOwnerAccess } from './access';

describe('requireOwnerAccess', () => {
  it('fails closed when Cloudflare Access verification is not configured', async () => {
    const result = await requireOwnerAccess(new Request('https://example.test'), {
      APP_ENV: 'production',
      DB: {} as D1Database,
    });

    expect(result).toEqual({ ok: false, status: 503, error: 'owner_access_not_configured' });
  });

  it('rejects a request without a signed Access assertion', async () => {
    const result = await requireOwnerAccess(new Request('https://example.test'), {
      APP_ENV: 'production',
      DB: {} as D1Database,
      CF_ACCESS_TEAM_DOMAIN: 'https://example.cloudflareaccess.com',
      CF_ACCESS_AUD: 'test-audience',
      OWNER_EMAIL: 'owner@example.test',
    });

    expect(result).toEqual({ ok: false, status: 401, error: 'owner_access_required' });
  });
});
