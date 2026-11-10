import { test, expect } from '../../src/fixtures/test';
import { PRODUCTS } from '../../src/data/testData';
import { expectedQuote } from '../../src/utils/money';

/**
 * Data-driven test built from the pricing DECISION TABLE (Module 02, REQ-PRC-01..07).
 * Arrange through the API (fast), act + assert through the UI (what the customer sees).
 * The expected values come from an independent oracle (expectedQuote), not from the app.
 */
type Row = {
  id: string;
  items: Array<[sku: string, qty: number]>;
  coupon?: string;
  shipping?: 'standard' | 'express';
  expectDiscount: number;
  freeShipCoupon?: boolean;
  message?: string;
  guards?: string;
};

const DECISION_TABLE: Row[] = [
  { id: 'R1', items: [[PRODUCTS.book999, 1]], expectDiscount: 0 },
  { id: 'R2', items: [[PRODUCTS.hub1000, 1]], expectDiscount: 0, guards: 'BUG-01' },
  { id: 'R3', items: [[PRODUCTS.book1001, 1]], expectDiscount: 0 },
  { id: 'R4', items: [[PRODUCTS.hub1000, 1]], coupon: 'SAVE10', expectDiscount: 100, message: 'Coupon SAVE10 applied', guards: 'BUG-02' },
  { id: 'R5', items: [[PRODUCTS.monitor12900, 1]], coupon: 'SAVE10', expectDiscount: 500, message: 'Coupon SAVE10 applied' },
  { id: 'R6', items: [[PRODUCTS.shoes3000, 1]], coupon: 'BIG500', expectDiscount: 500 },
  { id: 'R7', items: [[PRODUCTS.tshirt290, 1]], coupon: 'BIG500', expectDiscount: 0, message: 'Subtotal is too low for this coupon' },
  { id: 'R8', items: [[PRODUCTS.tshirt290, 1]], coupon: 'FREESHIP', expectDiscount: 0, freeShipCoupon: true },
  { id: 'R9', items: [[PRODUCTS.tshirt290, 1]], coupon: 'EXPIRED20', expectDiscount: 0, message: 'Coupon has expired', guards: 'BUG-07' },
  { id: 'R10', items: [[PRODUCTS.tshirt290, 1]], coupon: 'NOPE', expectDiscount: 0, message: 'Coupon code is invalid' },
  { id: 'R11', items: [[PRODUCTS.mouse499, 1]], shipping: 'express', expectDiscount: 0 },
  { id: 'R12', items: [[PRODUCTS.mouse499, 2], [PRODUCTS.tshirt290, 1]], expectDiscount: 0 },
];

test.describe('Cart pricing — decision table (REQ-PRC)', () => {
  for (const row of DECISION_TABLE) {
    test(`${row.id}: ${row.items.map(([s, q]) => `${q}×${s}`).join(' + ')} coupon=${row.coupon ?? '-'} ship=${row.shipping ?? 'standard'}${row.guards ? ` (${row.guards} guard)` : ''}`,
      async ({ userApi, userPage, cartPage }) => {
        let subtotal = 0;
        for (const [sku, qty] of row.items) {
          const id = await userApi.productIdBySku(sku);
          const res = await userApi.addToCart(id, qty);
          expect(res.status()).toBe(201);
          subtotal = (await res.json()).subtotal;
        }

        await cartPage.goto();
        await expect(cartPage.rows).toHaveCount(row.items.length);
        if (row.shipping === 'express') await cartPage.chooseShipping('express');
        if (row.coupon) await cartPage.applyCouponCode(row.coupon);
        if (row.message) await expect(cartPage.couponMessage).toHaveText(row.message);

        const expected = expectedQuote(subtotal, row.expectDiscount, row.shipping ?? 'standard', row.freeShipCoupon);
        await expect.poll(() => cartPage.summary()).toEqual(expected);
        void userPage;
      });
  }
});

test.describe('Cart editing', () => {
  test('changing quantity recalculates the line total', async ({ userApi, userPage, cartPage }) => {
    await userApi.addToCart(await userApi.productIdBySku(PRODUCTS.mouse499), 1);
    await cartPage.goto();
    await cartPage.setQuantity(PRODUCTS.mouse499, 3);
    await expect(cartPage.row(PRODUCTS.mouse499).getByTestId('cart-item-total')).toHaveText('฿1,497.00');
    await expect(cartPage.header.cartCount).toHaveText('3');
    void userPage;
  });

  test('removing the last item shows the empty cart', async ({ userApi, userPage, cartPage }) => {
    await userApi.addToCart(await userApi.productIdBySku(PRODUCTS.tshirt290), 1);
    await cartPage.goto();
    await cartPage.remove(PRODUCTS.tshirt290);
    await expect(cartPage.empty).toBeVisible();
    void userPage;
  });

  test('quantity above 10 is rejected', async ({ userApi, userPage, cartPage }) => {
    await userApi.addToCart(await userApi.productIdBySku(PRODUCTS.tshirt290), 10);
    await cartPage.goto();
    await cartPage.setQuantity(PRODUCTS.tshirt290, 11);
    await expect(userPage.getByTestId('toast')).toHaveText('Quantity must be 1-10');
    await expect(cartPage.row(PRODUCTS.tshirt290).getByTestId('cart-item-qty')).toHaveValue('10');
  });
});
