'use strict';
/**
 * Pure pricing logic (no I/O) — the bottom of the test pyramid.
 * See practice-app/test/pricing.test.js for unit tests and REQUIREMENTS.md (REQ-PRC-*) for rules.
 */
const config = require('./config');

const VAT_RATE = 0.07;
const FREE_SHIPPING_THRESHOLD = 1000;
const SHIPPING_FEES = { standard: 50, express: 120 };

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Validate a coupon against a subtotal.
 * @returns {{ok: true, coupon: object} | {ok: false, error: string}}
 */
function checkCoupon(coupon, subtotal, now = new Date()) {
  if (!coupon || !coupon.active) return { ok: false, error: 'COUPON_INVALID' };
  const expired = coupon.expires_at && new Date(coupon.expires_at) < now;
  if (expired && !config.bug('BUG-07')) return { ok: false, error: 'COUPON_EXPIRED' };
  if (subtotal < (coupon.min_subtotal || 0)) return { ok: false, error: 'COUPON_MIN_SUBTOTAL' };
  return { ok: true, coupon };
}

/**
 * @param {Array<{price:number, qty:number}>} items
 * @param {{coupon?: object|null, shippingMethod?: 'standard'|'express', now?: Date}} opts
 */
function quote(items, { coupon = null, shippingMethod = 'standard', now = new Date() } = {}) {
  if (!SHIPPING_FEES[shippingMethod]) throw new Error('INVALID_SHIPPING_METHOD');
  const subtotal = round2(items.reduce((sum, i) => sum + i.price * i.qty, 0));

  let discount = 0;
  let couponError = null;
  let freeShipCoupon = false;
  if (coupon) {
    const check = checkCoupon(coupon, subtotal, now);
    if (!check.ok) {
      couponError = check.error;
    } else if (coupon.type === 'percent') {
      discount = subtotal * (coupon.value / 100);
      if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
    } else if (coupon.type === 'fixed') {
      discount = Math.min(coupon.value, subtotal);
    } else if (coupon.type === 'freeship') {
      freeShipCoupon = true;
    }
  }
  discount = round2(discount);
  const afterDiscount = round2(subtotal - discount);

  let shipping = 0;
  if (items.length > 0) {
    if (shippingMethod === 'express') {
      shipping = SHIPPING_FEES.express;
    } else {
      const qualifies = config.bug('BUG-01')
        ? afterDiscount > FREE_SHIPPING_THRESHOLD
        : afterDiscount >= FREE_SHIPPING_THRESHOLD;
      shipping = qualifies || freeShipCoupon ? 0 : SHIPPING_FEES.standard;
    }
  }

  const vatBase = config.bug('BUG-02') ? subtotal + shipping : afterDiscount + shipping;
  const vat = round2(vatBase * VAT_RATE);
  const total = round2(afterDiscount + shipping + vat);

  return {
    subtotal,
    discount,
    shipping,
    vat,
    total,
    shippingMethod,
    couponCode: coupon && !couponError ? coupon.code : null,
    couponError,
  };
}

module.exports = { quote, checkCoupon, round2, VAT_RATE, FREE_SHIPPING_THRESHOLD, SHIPPING_FEES };
