'use strict';
/**
 * Unit tests for the pricing rules (REQ-PRC-01..07) — base of the test pyramid.
 * Run: npm test   (uses the built-in node:test runner, no extra dependencies)
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const config = require('../src/config');
const { quote } = require('../src/pricing');

const SAVE10 = { code: 'SAVE10', type: 'percent', value: 10, max_discount: 500, min_subtotal: 0, expires_at: '2099-12-31T23:59:59Z', active: 1 };
const BIG500 = { code: 'BIG500', type: 'fixed', value: 500, min_subtotal: 3000, expires_at: '2099-12-31T23:59:59Z', active: 1 };
const FREESHIP = { code: 'FREESHIP', type: 'freeship', value: 0, min_subtotal: 0, expires_at: '2099-12-31T23:59:59Z', active: 1 };
const EXPIRED = { code: 'EXPIRED20', type: 'percent', value: 20, min_subtotal: 0, expires_at: '2020-01-01T00:00:00Z', active: 1 };

test.beforeEach(() => config.reset());

test('empty cart costs nothing', () => {
  assert.deepEqual(
    { ...quote([]), shippingMethod: undefined, couponCode: undefined, couponError: undefined },
    { subtotal: 0, discount: 0, shipping: 0, vat: 0, total: 0, shippingMethod: undefined, couponCode: undefined, couponError: undefined },
  );
});

// Boundary value analysis around the free-shipping threshold (REQ-PRC-03)
for (const [subtotal, expectedShipping] of [[999, 50], [1000, 0], [1001, 0]]) {
  test(`standard shipping for subtotal ${subtotal} is ${expectedShipping}`, () => {
    assert.equal(quote([{ price: subtotal, qty: 1 }]).shipping, expectedShipping);
  });
}

test('express shipping is always 120', () => {
  assert.equal(quote([{ price: 5000, qty: 1 }], { shippingMethod: 'express' }).shipping, 120);
});

test('SAVE10 gives 10% capped at 500', () => {
  assert.equal(quote([{ price: 1000, qty: 1 }], { coupon: SAVE10 }).discount, 100);
  assert.equal(quote([{ price: 9000, qty: 1 }], { coupon: SAVE10 }).discount, 500);
});

test('BIG500 requires subtotal >= 3000', () => {
  assert.equal(quote([{ price: 2999, qty: 1 }], { coupon: BIG500 }).couponError, 'COUPON_MIN_SUBTOTAL');
  assert.equal(quote([{ price: 3000, qty: 1 }], { coupon: BIG500 }).discount, 500);
});

test('free-shipping threshold is checked AFTER discount', () => {
  // 1000 - 10% = 900 -> below threshold -> pay 50 shipping
  assert.equal(quote([{ price: 1000, qty: 1 }], { coupon: SAVE10 }).shipping, 50);
});

test('FREESHIP removes standard shipping only', () => {
  assert.equal(quote([{ price: 100, qty: 1 }], { coupon: FREESHIP }).shipping, 0);
  assert.equal(quote([{ price: 100, qty: 1 }], { coupon: FREESHIP, shippingMethod: 'express' }).shipping, 120);
});

test('expired coupon is rejected', () => {
  const q = quote([{ price: 100, qty: 1 }], { coupon: EXPIRED });
  assert.equal(q.couponError, 'COUPON_EXPIRED');
  assert.equal(q.discount, 0);
});

test('VAT 7% applies to (subtotal - discount + shipping)', () => {
  const q = quote([{ price: 1000, qty: 1 }], { coupon: SAVE10 });
  assert.equal(q.vat, 66.5); // (1000 - 100 + 50) * 0.07
  assert.equal(q.total, 1016.5);
});

test('bug mode really changes behaviour (BUG-01, BUG-02)', () => {
  config.set({ bugMode: true });
  assert.equal(quote([{ price: 1000, qty: 1 }]).shipping, 50, 'BUG-01 active');
  assert.equal(quote([{ price: 1000, qty: 1 }], { coupon: SAVE10 }).vat, 73.5, 'BUG-02 active');
});
