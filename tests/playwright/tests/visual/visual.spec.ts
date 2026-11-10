import { test, expect } from '../../src/fixtures/test';

/**
 * Visual regression (opt-in: npm run test:visual).
 * First run creates the baseline:  npx playwright test --project=visual --update-snapshots
 * Baselines depend on OS/fonts/browser — generate them in the same environment that runs CI (e.g. Docker).
 */
test.describe('Visual regression', () => {
  test('lab visual card matches the baseline', async ({ page }) => {
    await page.goto('/lab#visual');
    const card = page.getByTestId('visual-card');
    await expect(card).toHaveScreenshot('visual-card.png', { maxDiffPixelRatio: 0.01 });
  });

  test('login page matches the baseline (dynamic parts masked)', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveScreenshot('login.png', { fullPage: true, mask: [page.getByTestId('cart-count')] });
  });
});
