import { test, expect } from '../../src/fixtures/test';

/**
 * ⚠️ SPOILER (instructor key; this repository is public) — solutions for tests/exercises/flaky.spec.ts (Lab 17.2).
 * Same delays as the learner file, so a pass here proves the fix is robust, not lucky.
 *
 *   npx playwright test tests/exercises/flaky.solution.spec.ts --project=exercises --repeat-each=20 --workers=8
 */

async function slowProducts(page: import('@playwright/test').Page, repeatEachIndex: number): Promise<void> {
  const delay = (repeatEachIndex % 4) * 400;
  await page.route('**/api/products?*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    await route.continue();
  });
}

test.describe('Lab 17.2 — solutions', () => {
  // Cause: TIMING — fixed sleep. Fix: web-first assertion waits exactly as long as needed.
  test('1. product list is shown', async ({ page, catalogPage }, testInfo) => {
    await slowProducts(page, testInfo.repeatEachIndex);
    await catalogPage.goto();
    await expect(catalogPage.cards).toHaveCount(8);
  });

  // Cause: TIMING — value read once before the list re-rendered. Fix: assertion that retries.
  test('2. sorting by price shows the cheapest product first', async ({ page, catalogPage }, testInfo) => {
    await slowProducts(page, testInfo.repeatEachIndex);
    await catalogPage.goto();
    await catalogPage.sort.selectOption('price_asc');
    await expect(catalogPage.names.first()).toHaveText('Jump Rope');
  });

  // Cause: SHARED DATA — the seeded "customer" cart keeps items between runs/workers.
  // Fix: a fresh user per test (fixture) and a relative expectation.
  test('3. customer adds one item to the cart', async ({ userApi }) => {
    await userApi.addToCart(await userApi.productIdBySku('SPRT-001'), 1);
    const cart = await (await userApi.cart()).json();
    expect(cart.count).toBe(1);
  });

  // Cause: LOCATOR too broad — "Start" also matches "Start progress" (substring match).
  // Fix: exact name (or a test id).
  test('4. progress bar can be started', async ({ page }) => {
    await page.goto('/lab');
    await page.getByRole('button', { name: 'Start', exact: true }).click();
    await expect(page.getByRole('progressbar', { name: 'Loading' })).toBeVisible();
  });

  // Cause: UI OVERLAY — the "Add product" modal is still open; its backdrop covers the page, so Playwright keeps
  // retrying "element intercepts pointer events" until the test times out.
  // Fix: finish (or cancel) the interaction you started and assert the modal is gone before moving on.
  test('5. export products after looking at the add form', async ({ adminPage: page }) => {
    await page.goto('/admin');
    await page.getByRole('tab', { name: 'Products' }).click();
    await page.getByRole('button', { name: '+ Add product' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();

    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Export CSV' }).click();
    expect((await download).suggestedFilename()).toBe('products.csv');
  });

  // Cause: EXTERNAL DEPENDENCY — /api/lab/flaky fails every 2nd call and depends on how many calls came before
  // (hidden order dependency on shared server state). Fix: retry the ACTION with toPass(); do not assume the position.
  test('6. the flaky dependency answers', async ({ request }) => {
    await expect(async () => {
      const res = await request.get('/api/lab/flaky');
      expect(res.status()).toBe(200);
    }).toPass({ timeout: 5_000 });
  });
});
