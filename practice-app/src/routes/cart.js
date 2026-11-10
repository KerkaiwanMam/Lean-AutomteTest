'use strict';
const express = require('express');
const { db } = require('../db');
const config = require('../config');
const { quote } = require('../pricing');
const { fail, requireAuth } = require('../middleware');

const router = express.Router();
const MAX_QTY = 10;

function cartItems(userId) {
  return db.prepare(`SELECT p.id AS productId, p.sku, p.name, p.name_th AS nameTh, p.price, p.stock, p.image, c.qty
    FROM cart_items c JOIN products p ON p.id = c.product_id WHERE c.user_id = ? ORDER BY c.id`).all(userId)
    .map((i) => ({ ...i, lineTotal: Math.round(i.price * i.qty * 100) / 100 }));
}

function cartView(userId) {
  const items = cartItems(userId);
  return {
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: Math.round(items.reduce((s, i) => s + i.lineTotal, 0) * 100) / 100,
  };
}

function validQty(qty) {
  if (!Number.isInteger(qty) || qty < 1) return false;
  return config.bug('BUG-10') ? true : qty <= MAX_QTY;
}

router.use('/cart', requireAuth);

router.get('/cart', (req, res) => res.json(cartView(req.user.id)));

router.post('/cart/items', (req, res) => {
  const { productId, qty = 1 } = req.body || {};
  const p = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(Number(productId));
  if (!p) return fail(res, 404, 'NOT_FOUND', 'Product not found');
  if (!validQty(qty)) return fail(res, 400, 'VALIDATION_ERROR', `Quantity must be 1-${MAX_QTY}`, { qty: `Quantity must be 1-${MAX_QTY}` });
  const existing = db.prepare('SELECT qty FROM cart_items WHERE user_id = ? AND product_id = ?').get(req.user.id, p.id);
  const newQty = (existing?.qty || 0) + qty;
  if (!validQty(newQty)) return fail(res, 400, 'QTY_LIMIT', `Maximum ${MAX_QTY} per product in cart`);
  if (p.stock === 0) return fail(res, 409, 'OUT_OF_STOCK', 'Product is out of stock');
  if (newQty > p.stock) return fail(res, 409, 'INSUFFICIENT_STOCK', `Only ${p.stock} left in stock`);
  db.prepare(`INSERT INTO cart_items (user_id, product_id, qty) VALUES (?, ?, ?)
    ON CONFLICT(user_id, product_id) DO UPDATE SET qty = excluded.qty`).run(req.user.id, p.id, newQty);
  res.status(201).json(cartView(req.user.id));
});

router.patch('/cart/items/:productId', (req, res) => {
  const productId = Number(req.params.productId);
  const row = db.prepare(`SELECT c.qty, p.stock FROM cart_items c JOIN products p ON p.id = c.product_id
    WHERE c.user_id = ? AND c.product_id = ?`).get(req.user.id, productId);
  if (!row) return fail(res, 404, 'NOT_IN_CART', 'Product is not in cart');
  const { qty } = req.body || {};
  if (!validQty(qty)) return fail(res, 400, 'VALIDATION_ERROR', `Quantity must be 1-${MAX_QTY}`, { qty: `Quantity must be 1-${MAX_QTY}` });
  if (qty > row.stock) return fail(res, 409, 'INSUFFICIENT_STOCK', `Only ${row.stock} left in stock`);
  db.prepare('UPDATE cart_items SET qty = ? WHERE user_id = ? AND product_id = ?').run(qty, req.user.id, productId);
  res.json(cartView(req.user.id));
});

router.delete('/cart/items/:productId', (req, res) => {
  const info = db.prepare('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?').run(req.user.id, Number(req.params.productId));
  if (!info.changes) return fail(res, 404, 'NOT_IN_CART', 'Product is not in cart');
  res.json(cartView(req.user.id));
});

router.delete('/cart', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.status(204).end();
});

function findCoupon(code) {
  if (!code) return null;
  return db.prepare('SELECT * FROM coupons WHERE code = ?').get(String(code).trim().toUpperCase()) || { code, active: 0 };
}

router.post('/cart/quote', (req, res) => {
  const { couponCode, shippingMethod = 'standard' } = req.body || {};
  if (!['standard', 'express'].includes(shippingMethod)) {
    return fail(res, 400, 'VALIDATION_ERROR', 'Invalid shipping method', { shippingMethod: 'Must be standard or express' });
  }
  res.json(quote(cartItems(req.user.id), { coupon: findCoupon(couponCode), shippingMethod }));
});

module.exports = router;
module.exports.cartItems = cartItems;
module.exports.findCoupon = findCoupon;
