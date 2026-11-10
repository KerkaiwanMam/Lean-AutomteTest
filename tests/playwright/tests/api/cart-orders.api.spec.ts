import { test, expect } from '../../src/fixtures/test';
import { buildCheckout, CARDS, PRODUCTS } from '../../src/data/testData';
import { env } from '../../src/config/env';
import { schemaValidator, formatErrors } from '../../src/utils/contract';

test.describe('Cart API (REQ-CART)', () => {
  test('quantity boundaries: 1..10 per product (BUG-10 guard)', async ({ userApi }) => {
    const id = await userApi.productIdBySku(PRODUCTS.tshirt290);
    expect((await userApi.addToCart(id, 0)).status()).toBe(400);
    expect((await userApi.addToCart(id, 11)).status()).toBe(400);
    expect((await userApi.addToCart(id, 10)).status()).toBe(201);
    const over = await userApi.addToCart(id, 1); // 10 + 1
    expect(over.status()).toBe(400);
    expect((await over.json()).error.code).toBe('QTY_LIMIT');
  });

  test('out-of-stock product returns 409', async ({ userApi }) => {
    const res = await userApi.addToCart(await userApi.productIdBySku(PRODUCTS.webcamOutOfStock), 1);
    expect(res.status()).toBe(409);
    expect((await res.json()).error.code).toBe('OUT_OF_STOCK');
  });

  test('cart and quote match their contracts', async ({ userApi, request }) => {
    await userApi.addToCart(await userApi.productIdBySku(PRODUCTS.hub1000), 1);
    const cart = await (await userApi.cart()).json();
    const vCart = await schemaValidator(request, 'Cart');
    expect(vCart(cart), formatErrors(vCart)).toBe(true);

    const quote = await (await userApi.quote('SAVE10')).json();
    const vQuote = await schemaValidator(request, 'Quote');
    expect(vQuote(quote), formatErrors(vQuote)).toBe(true);
    expect(quote).toMatchObject({ subtotal: 1000, discount: 100, shipping: 50, vat: 66.5, total: 1016.5 });
  });
});

test.describe('Orders API (REQ-ORD)', () => {
  test('checkout creates a PAID order that matches the contract', async ({ userApi, request }) => {
    await userApi.addToCart(await userApi.productIdBySku(PRODUCTS.shoes3000), 1);
    const res = await userApi.checkout(buildCheckout({ couponCode: 'BIG500' }));
    expect(res.status()).toBe(201);
    const order = await res.json();
    const v = await schemaValidator(request, 'Order');
    expect(v(order), formatErrors(v)).toBe(true);
    expect(order).toMatchObject({ status: 'PAID', subtotal: 3000, discount: 500, shipping: 0, vat: 175, total: 2675 });
    expect((await (await userApi.cart()).json()).count).toBe(0); // cart emptied
  });

  test('checkout with an empty cart is rejected', async ({ userApi }) => {
    const res = await userApi.checkout(buildCheckout());
    expect(res.status()).toBe(400);
    expect((await res.json()).error.code).toBe('CART_EMPTY');
  });

  for (const [name, card, code] of [
    ['bad Luhn', CARDS.badLuhn, 'VALIDATION_ERROR'],
    ['expired', CARDS.expired, 'VALIDATION_ERROR'],
    ['declined', CARDS.declined, 'PAYMENT_DECLINED'],
  ] as const) {
    test(`card ${name} -> ${code}`, async ({ userApi }) => {
      await userApi.addToCart(await userApi.productIdBySku(PRODUCTS.tshirt290), 1);
      const res = await userApi.checkout(buildCheckout({ card }));
      expect((await res.json()).error.code).toBe(code);
    });
  }

  test('cash on delivery is limited to 5,000 THB', async ({ userApi }) => {
    await userApi.addToCart(await userApi.productIdBySku(PRODUCTS.monitor12900), 1);
    const res = await userApi.checkout(buildCheckout({ paymentMethod: 'cod', card: undefined }));
    expect(res.status()).toBe(400);
    expect((await res.json()).error.code).toBe('COD_LIMIT');
  });

  test('cancel restores stock (BUG-12 guard)', async ({ userApi }) => {
    const id = await userApi.productIdBySku(PRODUCTS.book999);
    const before = (await (await userApi.product(id)).json()).stock;
    await userApi.addToCart(id, 3);
    const order = await (await userApi.checkout(buildCheckout())).json();
    expect((await (await userApi.product(id)).json()).stock).toBe(before - 3);
    const cancelled = await userApi.cancelOrder(order.id);
    expect((await cancelled.json()).status).toBe('CANCELLED');
    expect((await (await userApi.product(id)).json()).stock).toBe(before);
  });

  // State transition table (Module 02): every pair that is NOT allowed must return 409
  const ALLOWED: Record<string, string[]> = {
    PENDING: ['PAID', 'CANCELLED'], PAID: ['SHIPPED', 'CANCELLED'], SHIPPED: ['DELIVERED'], DELIVERED: [], CANCELLED: [],
  };
  test('order state machine rejects invalid transitions', async ({ userApi, newApi }) => {
    const admin = await newApi();
    await admin.loginOrFail(env.users.admin);
    await userApi.addToCart(await userApi.productIdBySku(PRODUCTS.tshirt290), 1);
    const order = await (await userApi.checkout(buildCheckout({ paymentMethod: 'cod', card: undefined }))).json();
    expect(order.status).toBe('PENDING');

    // walk the happy path PENDING -> PAID -> SHIPPED -> DELIVERED and probe invalid moves at every step
    for (const next of ['PAID', 'SHIPPED', 'DELIVERED']) {
      const current = (await (await userApi.order(order.id)).json()).status as string;
      for (const target of Object.keys(ALLOWED).filter((s) => s !== current && !ALLOWED[current].includes(s))) {
        const res = await admin.setOrderStatus(order.id, target);
        expect(res.status(), `${current} -> ${target} must be rejected`).toBe(409);
      }
      expect((await admin.setOrderStatus(order.id, next)).status(), `${current} -> ${next}`).toBe(200);
    }
    expect((await userApi.cancelOrder(order.id)).status()).toBe(409); // delivered orders cannot be cancelled
  });
});
