import { test, expect } from '../../src/fixtures/test';
import { ShopLabApi } from '../../src/api/ShopLabApi';

/**
 * LAB 17.2 — "Fix the flaky" (learner file).
 *
 * Six tests, six different root causes. Every test has a bug in the TEST, not in ShopLab.
 *
 *   npx playwright test tests/exercises/flaky.spec.ts --project=exercises --repeat-each=20 --workers=8
 *   (PowerShell: $env:EXERCISES="1"; npx playwright test tests/exercises/flaky.spec.ts --project=exercises ...)
 *
 * Your goal: make every test pass 20/20 times under that command WITHOUT raising timeouts,
 * and without deleting the assertion. Hints: M17 §2–§3 (cause categories, wait strategy).
 *
 * To make timing problems reproducible, tests 1 and 2 slow ShopLab down by an amount that depends on
 * testInfo.repeatEachIndex (0, 1, 2, 3 …). Run once (--repeat-each=1): index 0 = no delay = "works on my machine".
 */

const CUSTOMER = { username: 'customer', password: 'Passw0rd!' };

/** Delay GET /api/products by a repeatable amount: index 0 → 0 ms, 1 → 400 ms, 2 → 800 ms, 3 → 1200 ms, 4 → 0 ms … */
async function slowProducts(page: import('@playwright/test').Page, repeatEachIndex: number): Promise<void> {
  const delay = (repeatEachIndex % 4) * 400;
  await page.route('**/api/products?*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    await route.continue();
  });
}

test.describe('Lab 17.2 — fix the flaky tests', () => {
  test('1. product list is shown', async ({ page }, testInfo) => {
    await slowProducts(page, testInfo.repeatEachIndex);
    await page.goto('/');
    await page.waitForTimeout(800);
    expect(await page.getByTestId('product-card').count()).toBe(8);
  });

  test('2. sorting by price shows the cheapest product first', async ({ page }, testInfo) => {
    await slowProducts(page, testInfo.repeatEachIndex);
    await page.goto('/');
    await page.getByTestId('sort-select').selectOption('price_asc');
    const first = await page.getByTestId('product-name').first().innerText();
    expect(first).toBe('Jump Rope');
  });

  test('3. customer adds one item to the cart', async ({ request }) => {
    const api = new ShopLabApi(request);
    await api.loginOrFail(CUSTOMER);
    await api.addToCart(await api.productIdBySku('SPRT-001'), 1);
    const cart = await (await api.cart()).json();
    expect(cart.count).toBe(1);
  });

  test('4. progress bar can be started', async ({ page }) => {
    await page.goto('/lab');
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.getByRole('progressbar', { name: 'Loading' })).toBeVisible();
  });

  test('5. export products after looking at the add form', async ({ adminPage: page }) => {
    test.setTimeout(10_000); // keep the lab fast: the failure is a click that can never succeed
    await page.goto('/admin');
    await page.getByRole('tab', { name: 'Products' }).click();
    await page.getByRole('button', { name: '+ Add product' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Export CSV' }).click();
    expect((await download).suggestedFilename()).toBe('products.csv');
  });

  test('6. the flaky dependency answers', async ({ request }) => {
    const res = await request.get('/api/lab/flaky');
    expect(res.status()).toBe(200);
  });
});
