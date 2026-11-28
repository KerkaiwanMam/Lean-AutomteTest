import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { targets } from '../src/targets';

/**
 * Automated accessibility scan, WCAG 2.0/2.1 level A and AA (checklist 02 F).
 * Fails only on "serious" and "critical" impact; all violations are attached for the findings report.
 * Automated tools find only part of the issues — keyboard and manual checks are still required.
 */
for (const path of targets.smokePaths) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle').catch(() => {});

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    await test.info().attach('axe-results.json', {
      body: JSON.stringify(results.violations, null, 2),
      contentType: 'application/json',
    });

    const blocking = results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.impact} · ${v.id} · ${v.nodes.length} element(s) · ${v.helpUrl}`);

    expect(blocking, 'serious/critical axe violations').toEqual([]);
  });
}
