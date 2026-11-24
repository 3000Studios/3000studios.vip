import { describe, expect, it } from 'vitest';
import { buildDailyPost, dailyPostExists, dailySitemapXml, listDailyPosts, DAILY_START } from './dailyBlog';
import { heroForDate } from './dailyHero';
import { MUSIC_VIDEOS } from './videoCatalog';

describe('daily auto blog', () => {
  it('builds the same post for the same date', () => {
    expect(buildDailyPost('2026-11-30')).toEqual(buildDailyPost('2026-11-30'));
  });
  it('gives each day a unique title and a short description', () => {
    const posts = listDailyPosts(new Date('2027-03-01T12:00:00Z'));
    expect(new Set(posts.map((p) => p.title)).size).toBe(posts.length);
    for (const p of posts) {
      expect(p.description.length).toBeLessThanOrEqual(160);
      expect(p.sections).toHaveLength(4);
      expect(p.faq).toHaveLength(3);
    }
  });
  it('only publishes from the start date through today', () => {
    const now = new Date('2026-12-01T12:00:00Z');
    expect(dailyPostExists(DAILY_START, now)).toBe(true);
    expect(dailyPostExists('2026-11-23', now)).toBe(false);
    expect(dailyPostExists('2026-12-02', now)).toBe(false);
    expect(dailyPostExists('2026-02-30', now)).toBe(false);
    expect(dailySitemapXml(now)).toContain('/blog/daily/2026-12-01');
  });
  it('never uses an explicit video as the hero', () => {
    const explicit = new Set(MUSIC_VIDEOS.filter((v) => v.explicit).map((v) => (v.preview.type === 'youtube' ? v.preview.videoId : '')));
    for (let d = 0; d < 120; d += 1) {
      const key = new Date(Date.parse('2026-11-24T00:00:00Z') + d * 86_400_000).toISOString().slice(0, 10);
      const h = heroForDate(key);
      if (h.kind === 'youtube') expect(explicit.has(h.videoId)).toBe(false);
    }
  });
});
