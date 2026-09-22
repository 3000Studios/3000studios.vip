import { describe, expect, it } from 'vitest';
import { slugify } from 'studio-os';

describe('release-machine', () => {
  it('uses studio-os slugify', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
});
