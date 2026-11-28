import { test, expect } from '@playwright/test';
import { targets } from '../src/targets';

/**
 * Mobile layout: no horizontal page scroll at phone width (checklist 02 E).
 * Runs at 375px in desktop-chrome, and at iPhone size in the mobile-safari project.
 */
test.use({ viewport: { width: 375, height: 812 } });

for (const path of targets.smokePaths) {
  test(`${path} has no horizontal scroll at 375px`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle').catch(() => {});

    const { scrollWidth, innerWidth, widest } = await page.evaluate(() => {
      // Name the widest element so the finding says WHAT overflows, not just that something does
      let widest = '';
      let max = 0;
      for (const el of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
        const right = el.getBoundingClientRect().right;
        if (right > max) {
          max = right;
          widest = `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''}`;
        }
      }
      return { scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth, widest };
    });

    expect(scrollWidth, `page is wider than the screen; widest element: ${widest}`).toBeLessThanOrEqual(innerWidth + 1);
  });
}
