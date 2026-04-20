import { describe, expect, it } from 'vitest';
import { extractCanonical, extractRobots, extractTitle } from './seo';

describe('seo extraction', () => {
  it('extracts title/canonical/robots', () => {
    const html = `
      <html>
        <head>
          <title> Apex Citadel </title>
          <link rel="canonical" href="https://example.com/" />
          <meta name="robots" content="noindex,nofollow" />
        </head>
        <body>ok</body>
      </html>
    `;
    expect(extractTitle(html)).toBe('Apex Citadel');
    expect(extractCanonical(html)).toBe('https://example.com/');
    expect(extractRobots(html)).toBe('noindex,nofollow');
  });
});

