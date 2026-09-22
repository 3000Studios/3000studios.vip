import { test, expect } from 'playwright/test';

const routes = ['/', '/music', '/song/not-giving-up-tonight', '/video', '/live'];
const widths = [320, 390, 768, 1024, 1440, 1920];

test.describe('smoke', () => {
  for (const route of routes) {
    test(`${route} loads`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      const res = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(res?.ok() || res?.status() === 304).toBeTruthy();
      expect(errors.filter((m) => !m.includes('play()'))).toEqual([]);
      const broken = await page.evaluate(() =>
        [...document.images].filter((img) => img.naturalWidth === 0 && img.src && !img.src.startsWith('data:')).map((img) => img.src),
      );
      expect(broken.filter((s) => s.includes('/media/covers/'))).toEqual([]);
    });
  }

  test('home static hero is in first HTML', async ({ page }) => {
    const res = await page.goto('/', { waitUntil: 'commit' });
    expect(res?.ok()).toBeTruthy();
    const html = await res!.text();
    expect(html).toContain('id="home-lcp"');
    expect(html).toContain('id="home-shell"');
    expect(html).toContain('3000 Studios');
    expect(html).toContain('id="home-play-latest"');
  });

  test('home discography appears after scroll', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('#discography')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('#discography').getByRole('button', { name: 'Play' }).first()).toBeVisible();
  });

  test('NGUT mp3 and player control exist', async ({ page }) => {
    const audio = await page.request.head('/media/not-giving-up-tonight.mp3');
    expect(audio.ok()).toBeTruthy();
    await page.goto('/song/not-giving-up-tonight', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('main').getByRole('button', { name: 'Play', exact: true })).toBeVisible();
  });

  for (const w of widths) {
    test(`music no overflow ${w}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto('/music', { waitUntil: 'domcontentloaded' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 8);
      expect(overflow).toBe(false);
    });
  }
});
