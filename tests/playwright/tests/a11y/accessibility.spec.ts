import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../src/fixtures/test';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('Accessibility (axe-core, WCAG 2.1 AA)', () => {
  test('broken lab page has the expected violations', async ({ page }) => {
    await page.goto('/a11y.html');
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    const ids = results.violations.map((v) => v.id);
    expect(ids).toEqual(expect.arrayContaining(['image-alt', 'button-name', 'link-name', 'html-has-lang', 'color-contrast']));
  });

  test('fixed lab page has no violations', async ({ page }) => {
    await page.goto('/a11y-fixed.html');
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(results.violations).toEqual([]);
  });

  for (const path of ['/login', '/register']) {
    test(`${path} has no serious or critical violations`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact ?? ''));
      // attach the full report for debugging
      await test.info().attach(`axe${path.replace('/', '-')}.json`, { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      expect(serious.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
    });
  }
});
