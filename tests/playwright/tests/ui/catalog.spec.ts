import { test, expect } from '../../src/fixtures/test';

test.describe('Product catalog (REQ-CAT)', () => {
  test('first page shows 8 of 28 products @smoke', async ({ catalogPage }) => {
    await catalogPage.goto();
    await catalogPage.waitForResults();
    await expect(catalogPage.cards).toHaveCount(8);
    await expect(catalogPage.summary).toHaveText('Showing 1–8 of 28 products');
  });

  test('search is case-insensitive (BUG-03 guard)', async ({ catalogPage }) => {
    await catalogPage.goto();
    await catalogPage.search('KEYBOARD');
    await expect(catalogPage.names).toHaveText(['Mechanical Keyboard']);
  });

  test('search by Thai name', async ({ catalogPage }) => {
    await catalogPage.goto();
    await catalogPage.search('เมาส์');
    await expect(catalogPage.names).toHaveText(['Wireless Mouse']);
  });

  test('search with no match shows empty state', async ({ catalogPage }) => {
    await catalogPage.goto();
    await catalogPage.search('zzz-not-a-product');
    await expect(catalogPage.emptyState).toBeVisible();
    await expect(catalogPage.cards).toHaveCount(0);
  });

  test('category filter only shows that category', async ({ catalogPage }) => {
    await catalogPage.goto();
    await catalogPage.filterCategory('books');
    await expect(catalogPage.cards).toHaveCount(6);
    for (const card of await catalogPage.cards.all()) {
      await expect(card.locator('.tag').first()).toHaveText('books');
    }
  });

  test('sort by price ascending is numeric (BUG-04 guard)', async ({ catalogPage }) => {
    await catalogPage.goto();
    await catalogPage.sortBy('price_asc');
    const prices = await catalogPage.productPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(prices[0]).toBe(150);
  });

  test('paging through results shows every product exactly once (BUG-05 guard)', async ({ catalogPage }) => {
    await catalogPage.goto();
    await catalogPage.waitForResults();
    const seen: string[] = [];
    for (;;) {
      seen.push(...(await catalogPage.productNames()));
      if (await catalogPage.nextPage.isDisabled()) break;
      await catalogPage.nextPage.click();
      await catalogPage.waitForResults();
    }
    expect(seen).toHaveLength(28);
    expect(new Set(seen).size).toBe(28);
  });

  test('filters are deep-linkable through the URL', async ({ page, catalogPage }) => {
    await catalogPage.goto('?category=sports&sort=price_desc');
    await catalogPage.waitForResults();
    await expect(catalogPage.category).toHaveValue('sports');
    await expect(catalogPage.names.first()).toHaveText('Dumbbell Set 10kg');
    await expect(page).toHaveURL(/category=sports/);
  });

  test('out-of-stock product cannot be added', async ({ catalogPage }) => {
    await catalogPage.goto();
    await catalogPage.search('Webcam');
    const card = catalogPage.cardBySku('ELEC-006');
    await expect(card.getByTestId('out-of-stock')).toBeVisible();
    await expect(card.getByRole('button', { name: 'Add to cart' })).toBeDisabled();
  });

  test('server error shows a retry option (network mocking)', async ({ page, catalogPage }) => {
    // Force the API to fail ONCE, then let real traffic through.
    await page.route('**/api/products?*', (route) => route.fulfill({
      status: 503, contentType: 'application/json',
      body: JSON.stringify({ error: { code: 'SERVICE_UNAVAILABLE', message: 'Service temporarily unavailable' } }),
    }), { times: 1 });
    await catalogPage.goto();
    await expect(catalogPage.error).toContainText('Service temporarily unavailable');

    await catalogPage.retry.click();
    await expect(catalogPage.cards).toHaveCount(8);
  });

  test('guest clicking "Add to cart" is sent to login', async ({ page, catalogPage }) => {
    await catalogPage.goto();
    await catalogPage.waitForResults();
    await catalogPage.cards.first().getByRole('button', { name: 'Add to cart' }).click();
    await expect(page).toHaveURL(/\/login\?next=/);
  });

  test('logged-in customer adds a product and the cart badge updates', async ({ userPage, catalogPage }) => {
    await catalogPage.goto();
    await catalogPage.search('Yoga');
    await catalogPage.addToCart('SPRT-001');
    await expect(userPage.getByTestId('toast')).toHaveText('Added to cart');
    await expect(catalogPage.header.cartCount).toHaveText('1');
  });
});
