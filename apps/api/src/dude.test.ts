import { describe, expect, it } from 'vitest';
import { buildDudeSystemPrompt, isOwnerEmailAllowed, isSyncTokenAllowed, toDudeMessages } from './dude';

describe('DUDE cloud agent helpers', () => {
  it('only allows the configured owner email', () => {
    expect(isOwnerEmailAllowed('mr.jwswain@gmail.com', 'MR.JWSWAIN@gmail.com')).toBe(true);
    expect(isOwnerEmailAllowed('intruder@example.com', 'mr.jwswain@gmail.com')).toBe(false);
    expect(isOwnerEmailAllowed(null, 'mr.jwswain@gmail.com')).toBe(false);
  });

  it('allows a configured machine sync token without hardcoding it', () => {
    expect(isSyncTokenAllowed('abc123', 'abc123')).toBe(true);
    expect(isSyncTokenAllowed('abc123', 'wrong')).toBe(false);
    expect(isSyncTokenAllowed('', 'abc123')).toBe(false);
  });

  it('builds a creator-aware system prompt without exposing secrets', () => {
    const prompt = buildDudeSystemPrompt('mr.jwswain@gmail.com');
    expect(prompt).toContain('mr.jwswain@gmail.com');
    expect(prompt).toContain('creator');
    expect(prompt).not.toContain('token');
    expect(prompt).not.toContain('secret');
  });

  it('keeps chat messages bounded and normalized for Workers AI', () => {
    const messages = toDudeMessages({
      ownerEmail: 'mr.jwswain@gmail.com',
      message: '  check fleet health  ',
      history: [
        { role: 'user', content: 'old one' },
        { role: 'assistant', content: 'old two' },
        { role: 'system', content: 'ignored' },
      ],
    });

    expect(messages[0]?.role).toBe('system');
    expect(messages.at(-1)).toEqual({ role: 'user', content: 'check fleet health' });
    expect(messages.some((entry) => entry.content === 'ignored')).toBe(false);
  });
});
