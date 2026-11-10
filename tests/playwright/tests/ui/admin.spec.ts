import { test, expect } from '../../src/fixtures/test';
import { buildCheckout, PRODUCTS, randomSku } from '../../src/data/testData';

test.describe('Back office (REQ-ADM)', () => {
  test('admin creates a product that customers can find', async ({ adminPage: page, catalogPage }) => {
    const sku = randomSku();
    const name = `Automation Book ${sku}`;
    await page.goto('/admin');
    await page.getByRole('tab', { name: 'Products' }).click();
    await page.getByRole('button', { name: '+ Add product' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByLabel('SKU').fill(sku);
    await dialog.getByLabel('Category').selectOption('books');
    await dialog.getByLabel('Name (EN)').fill(name);
    await dialog.getByLabel('Price').fill('1234.5');
    await dialog.getByLabel('Stock').fill('7');
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).toBeHidden();
    const row = page.locator(`[data-testid="admin-product-row"][data-sku="${sku}"]`);
    await expect(row.getByTestId('admin-product-price')).toHaveText('฿1,234.50');

    await catalogPage.goto();
    await catalogPage.search(sku);
    await expect(catalogPage.names).toHaveText([name]);
  });

  test('product form shows server-side validation errors', async ({ adminPage: page }) => {
    await page.goto('/admin');
    await page.getByRole('tab', { name: 'Products' }).click();
    await page.getByRole('button', { name: '+ Add product' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('SKU').fill('bad-sku');
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog.getByTestId('error-sku')).toHaveText('SKU format must be AAAA-999');
    await expect(dialog.getByTestId('error-category')).not.toBeEmpty();
    await expect(dialog.getByTestId('product-form-error')).toHaveText('Invalid input');
  });

  test('deleting a product asks for confirmation in a custom modal', async ({ adminPage: page, api }) => {
    const sku = randomSku();
    const admin = api;
    await admin.loginOrFail({ username: 'admin', password: 'Admin123!' });
    expect((await admin.createProduct({ sku, name: `To delete ${sku}`, category: 'home', price: 10, stock: 1 })).status()).toBe(201);

    await page.goto('/admin');
    await page.getByRole('tab', { name: 'Products' }).click();
    await page.getByTestId('admin-product-filter').fill(sku);
    const row = page.locator(`[data-testid="admin-product-row"][data-sku="${sku}"]`);
    await row.getByRole('button', { name: 'Delete' }).click();

    const confirm = page.getByRole('alertdialog');
    await expect(confirm).toContainText(`Delete product ${sku}`);
    await confirm.getByRole('button', { name: 'Yes, delete' }).click();
    await expect(row.getByRole('cell', { name: 'No', exact: true })).toBeVisible();
  });

  test('admin moves an order through the state machine', async ({ adminPage: page, userApi }) => {
    await userApi.addToCart(await userApi.productIdBySku(PRODUCTS.tshirt290), 1);
    const order = await (await userApi.checkout(buildCheckout())).json();

    await page.goto('/admin');
    await page.getByRole('tab', { name: 'Orders' }).click();
    const row = page.locator(`[data-testid="admin-order-row"][data-order-no="${order.orderNo}"]`);
    await expect(row.getByTestId('admin-order-status')).toHaveText('PAID');

    await row.getByLabel(`New status for ${order.orderNo}`).selectOption('SHIPPED');
    await row.getByRole('button', { name: 'Update' }).click();
    await expect(row.getByTestId('admin-order-status')).toHaveText('SHIPPED');

    await row.getByLabel(`New status for ${order.orderNo}`).selectOption('DELIVERED');
    await row.getByRole('button', { name: 'Update' }).click();
    await expect(row.getByTestId('admin-order-status')).toHaveText('DELIVERED');
    await expect(row).toContainText('final');
  });

  test('tabs support keyboard navigation (a11y)', async ({ adminPage: page }) => {
    await page.goto('/admin');
    await page.getByRole('tab', { name: 'Dashboard' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Products' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toBeVisible();
  });

  test('customer gets 403 on the back office', async ({ userPage: page }) => {
    await page.goto('/admin');
    await expect(page.getByTestId('admin-forbidden')).toBeVisible();
    await expect(page.getByRole('tab')).toHaveCount(0);
  });
});
