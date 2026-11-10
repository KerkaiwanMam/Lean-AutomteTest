import { test, expect } from '../../src/fixtures/test';
import { buildAddress, buildCheckout, CARDS, PRODUCTS } from '../../src/data/testData';

test.describe('Checkout (REQ-ORD)', () => {
  test('customer buys a product end-to-end with a card @smoke', async ({ userPage: page, userApi, catalogPage, cartPage, checkoutPage }) => {
    const productId = await userApi.productIdBySku(PRODUCTS.book1001);
    const stockBefore = (await (await userApi.product(productId)).json()).stock;

    // Act — through the UI, like a real customer
    await catalogPage.goto();
    await catalogPage.search('Clean Code');
    await catalogPage.addToCart(PRODUCTS.book1001);
    await expect(catalogPage.header.cartCount).toHaveText('1');
    await catalogPage.header.cartCount.click();
    await expect(cartPage.rows).toHaveCount(1);
    await cartPage.checkoutButton.click();

    await checkoutPage.fillAddress(buildAddress());
    await checkoutPage.payByCard(CARDS.valid);
    await expect(page.getByTestId('review-total')).toHaveText('฿1,071.07'); // (1001 + 0 shipping) * 1.07
    await checkoutPage.confirm();

    // Assert — UI
    await expect(checkoutPage.orderNumber).toHaveText(/^SL-\d{8}-\d{4}$/);
    await expect(checkoutPage.orderStatus).toHaveText('PAID');
    await expect(checkoutPage.header.cartCount).toHaveText('0');

    // Assert — back-end state via API (UI is not enough!)
    const orders = (await (await userApi.orders()).json()).items;
    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({ status: 'PAID', total: 1071.07, paymentLast4: '4242' });
    const stockAfter = (await (await userApi.product(productId)).json()).stock;
    expect(stockAfter).toBe(stockBefore - 1);
  });

  test('declined card shows an error and creates no order', async ({ userPage: page, userApi, checkoutPage }) => {
    await userApi.addToCart(await userApi.productIdBySku(PRODUCTS.tshirt290), 1);
    await page.goto('/checkout');
    await checkoutPage.fillAddress(buildAddress());
    await checkoutPage.payByCard(CARDS.declined);
    await checkoutPage.confirm();
    await expect(checkoutPage.error).toHaveText('Payment was declined by the bank');
    expect((await (await userApi.orders()).json()).items).toHaveLength(0);
  });

  test('cash on delivery order starts as PENDING', async ({ userPage: page, userApi, checkoutPage }) => {
    await userApi.addToCart(await userApi.productIdBySku(PRODUCTS.tshirt290), 2);
    await page.goto('/checkout');
    await checkoutPage.fillAddress(buildAddress());
    await checkoutPage.payByCod();
    await checkoutPage.confirm();
    await expect(checkoutPage.orderStatus).toHaveText('PENDING');
  });

  test('invalid address keeps the customer on step 1', async ({ userPage: page, userApi, checkoutPage }) => {
    await userApi.addToCart(await userApi.productIdBySku(PRODUCTS.tshirt290), 1);
    await page.goto('/checkout');
    await checkoutPage.fillAddress(buildAddress({ postcode: '1011', phone: '12345' }));
    await expect(checkoutPage.fieldError('address.postcode')).toHaveText('Postcode must be 5 digits');
    await expect(checkoutPage.fieldError('address.phone')).toHaveText('Phone must be 10 digits starting with 0');
    await expect(checkoutPage.currentStep).toHaveText('1. Address');
  });

  test('cancelling an order (confirm dialog) restores stock (BUG-12 guard)', async ({ userPage: page, userApi }) => {
    const productId = await userApi.productIdBySku(PRODUCTS.mouse499);
    const stock0 = (await (await userApi.product(productId)).json()).stock;
    await userApi.addToCart(productId, 2);
    const order = await (await userApi.checkout(buildCheckout())).json();
    expect((await (await userApi.product(productId)).json()).stock).toBe(stock0 - 2);

    await page.goto(`/order?id=${order.id}`);
    page.once('dialog', (d) => d.accept()); // window.confirm
    await page.getByTestId('cancel-order').click();

    await expect(page.getByTestId('order-status')).toHaveText('CANCELLED');
    await expect(page.getByTestId('cancel-order')).toBeHidden();
    expect((await (await userApi.product(productId)).json()).stock).toBe(stock0);
  });

  test('invoice can be downloaded as CSV', async ({ userPage: page, userApi }) => {
    await userApi.addToCart(await userApi.productIdBySku(PRODUCTS.tshirt290), 1);
    const order = await (await userApi.checkout(buildCheckout())).json();
    await page.goto(`/order?id=${order.id}`);
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('download-invoice').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(`invoice-${order.orderNo}.csv`);
    const content = await (await download.createReadStream()).toArray();
    expect(Buffer.concat(content).toString()).toContain('FASH-001,"Cotton T-Shirt",290,1,290');
  });
});
