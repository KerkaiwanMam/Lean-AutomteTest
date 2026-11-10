'use strict';
const express = require('express');
const { db, orderNo } = require('../db');
const config = require('../config');
const { quote } = require('../pricing');
const { fail, requireAuth } = require('../middleware');
const { cartItems, findCoupon } = require('./cart');

const router = express.Router();
const COD_LIMIT = 5000;
const DECLINED_CARD = '4000000000000002';

// Order state machine (REQ-ORD-05). Key = current status, value = allowed next statuses.
const TRANSITIONS = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

function luhn(num) {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i -= 1) {
    let d = Number(num[i]);
    if (dbl) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

function orderView(o) {
  const items = db.prepare('SELECT product_id AS productId, sku, name, price, qty FROM order_items WHERE order_id = ? ORDER BY id').all(o.id)
    .map((i) => ({ ...i, lineTotal: Math.round(i.price * i.qty * 100) / 100 }));
  return {
    id: o.id, orderNo: o.order_no, userId: o.user_id, status: o.status, paymentMethod: o.payment_method, paymentLast4: o.payment_last4,
    shippingMethod: o.shipping_method, couponCode: o.coupon_code, subtotal: o.subtotal, discount: o.discount, shipping: o.shipping,
    vat: o.vat, total: o.total, address: JSON.parse(o.address_json), createdAt: o.created_at, updatedAt: o.updated_at, items,
  };
}

function restoreStock(orderId) {
  for (const it of db.prepare('SELECT product_id, qty FROM order_items WHERE order_id = ?').all(orderId)) {
    db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(it.qty, it.product_id);
  }
}

function changeStatus(order, next) {
  if (!TRANSITIONS[order.status].includes(next)) return false;
  db.exec('BEGIN');
  try {
    db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').run(next, new Date().toISOString(), order.id);
    if (next === 'CANCELLED' && !config.bug('BUG-12')) restoreStock(order.id);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return true;
}

function validateCheckout(b) {
  const e = {};
  const a = b.address || {};
  if (!a.fullName || String(a.fullName).trim().length < 2) e['address.fullName'] = 'Full name is required';
  if (!/^0\d{9}$/.test(a.phone || '')) e['address.phone'] = 'Phone must be 10 digits starting with 0';
  if (!a.line1 || !String(a.line1).trim()) e['address.line1'] = 'Address is required';
  if (!a.district || !String(a.district).trim()) e['address.district'] = 'District is required';
  if (!a.province || !String(a.province).trim()) e['address.province'] = 'Province is required';
  if (!/^\d{5}$/.test(a.postcode || '')) e['address.postcode'] = 'Postcode must be 5 digits';
  if (!['standard', 'express'].includes(b.shippingMethod)) e.shippingMethod = 'Must be standard or express';
  if (!['card', 'cod'].includes(b.paymentMethod)) e.paymentMethod = 'Must be card or cod';
  if (b.paymentMethod === 'card') {
    const c = b.card || {};
    const num = String(c.number || '').replace(/\s/g, '');
    if (!/^\d{16}$/.test(num) || !luhn(num)) e['card.number'] = 'Card number is invalid';
    const m = /^(\d{2})\/(\d{2})$/.exec(c.expiry || '');
    if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) {
      e['card.expiry'] = 'Expiry must be MM/YY';
    } else {
      const endOfMonth = new Date(2000 + Number(m[2]), Number(m[1]), 1);
      if (endOfMonth <= new Date()) e['card.expiry'] = 'Card has expired';
    }
    if (!/^\d{3}$/.test(c.cvv || '')) e['card.cvv'] = 'CVV must be 3 digits';
    if (!c.name || !String(c.name).trim()) e['card.name'] = 'Name on card is required';
  }
  return e;
}

router.use('/orders', requireAuth);

router.post('/orders', (req, res) => {
  const b = req.body || {};
  const items = cartItems(req.user.id);
  if (!items.length) return fail(res, 400, 'CART_EMPTY', 'Cart is empty');
  const errors = validateCheckout(b);
  if (Object.keys(errors).length) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid input', errors);

  const q = quote(items, { coupon: findCoupon(b.couponCode), shippingMethod: b.shippingMethod });
  if (q.couponError) return fail(res, 400, q.couponError, 'Coupon cannot be applied');
  if (b.paymentMethod === 'cod' && q.total > COD_LIMIT) return fail(res, 400, 'COD_LIMIT', `Cash on delivery is limited to ${COD_LIMIT} THB`);
  for (const it of items) {
    if (it.qty > it.stock) return fail(res, 409, 'INSUFFICIENT_STOCK', `Only ${it.stock} left for ${it.sku}`, { sku: it.sku });
  }
  const cardNumber = String(b.card?.number || '').replace(/\s/g, '');
  if (b.paymentMethod === 'card' && cardNumber === DECLINED_CARD) return fail(res, 402, 'PAYMENT_DECLINED', 'Payment was declined by the bank');

  const now = new Date().toISOString();
  db.exec('BEGIN');
  let orderId;
  try {
    const status = b.paymentMethod === 'card' ? 'PAID' : 'PENDING';
    const a = b.address;
    const address = { fullName: a.fullName, phone: a.phone, line1: a.line1, district: a.district, province: a.province, postcode: a.postcode };
    orderId = Number(db.prepare(`INSERT INTO orders (user_id, status, payment_method, payment_last4, shipping_method, coupon_code,
      subtotal, discount, shipping, vat, total, address_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(req.user.id, status, b.paymentMethod, b.paymentMethod === 'card' ? cardNumber.slice(-4) : null, b.shippingMethod, q.couponCode,
        q.subtotal, q.discount, q.shipping, q.vat, q.total, JSON.stringify(address), now, now).lastInsertRowid);
    db.prepare('UPDATE orders SET order_no = ? WHERE id = ?').run(orderNo(orderId, now), orderId);
    const insItem = db.prepare('INSERT INTO order_items (order_id, product_id, sku, name, price, qty) VALUES (?, ?, ?, ?, ?, ?)');
    for (const it of items) {
      insItem.run(orderId, it.productId, it.sku, it.name, it.price, it.qty);
      db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(it.qty, it.productId);
    }
    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  res.status(201).json(orderView(db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId)));
});

router.get('/orders', (req, res) => {
  const all = req.query.all === '1' && req.user.role === 'admin';
  const where = [];
  const params = [];
  if (!all) { where.push('user_id = ?'); params.push(req.user.id); }
  if (req.query.status) { where.push('status = ?'); params.push(String(req.query.status).toUpperCase()); }
  const sql = `SELECT * FROM orders ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC, id DESC`;
  res.json({ items: db.prepare(sql).all(...params).map(orderView) });
});

function loadOwnOrder(req, res) {
  const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(Number(req.params.id));
  const allowed = o && (o.user_id === req.user.id || req.user.role === 'admin' || config.bug('BUG-08'));
  if (!allowed) { fail(res, 404, 'NOT_FOUND', 'Order not found'); return null; }
  return o;
}

router.get('/orders/:id', (req, res) => {
  const o = loadOwnOrder(req, res);
  if (o) res.json(orderView(o));
});

router.post('/orders/:id/cancel', (req, res) => {
  const o = loadOwnOrder(req, res);
  if (!o) return;
  if (!changeStatus(o, 'CANCELLED')) return fail(res, 409, 'INVALID_TRANSITION', `Order in status ${o.status} cannot be cancelled`);
  res.json(orderView(db.prepare('SELECT * FROM orders WHERE id = ?').get(o.id)));
});

router.get('/orders/:id/invoice.csv', (req, res) => {
  const o = loadOwnOrder(req, res);
  if (!o) return;
  const v = orderView(o);
  const lines = ['sku,name,price,qty,line_total', ...v.items.map((i) => `${i.sku},"${i.name.replace(/"/g, '""')}",${i.price},${i.qty},${i.lineTotal}`),
    `,,,subtotal,${v.subtotal}`, `,,,discount,${v.discount}`, `,,,shipping,${v.shipping}`, `,,,vat,${v.vat}`, `,,,total,${v.total}`];
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${v.orderNo}.csv"`);
  res.send(lines.join('\n'));
});

module.exports = router;
module.exports.orderView = orderView;
module.exports.changeStatus = changeStatus;
module.exports.TRANSITIONS = TRANSITIONS;
module.exports.luhn = luhn;
