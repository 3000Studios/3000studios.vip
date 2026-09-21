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
    });
  }

  for (const w of widths) {
    test(`music no overflow ${w}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto('/music', { waitUntil: 'domcontentloaded' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 8);
      expect(overflow).toBe(false);
    });
  }
});
