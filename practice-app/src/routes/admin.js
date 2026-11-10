'use strict';
const express = require('express');
const multer = require('multer');
const { db } = require('../db');
const { fail, requireAdmin } = require('../middleware');
const { orderView, changeStatus } = require('./orders');
const { CATEGORIES } = require('./products');

const router = express.Router();
const csvUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 512 * 1024 } });

router.use('/admin', requireAdmin);

router.get('/admin/stats', (_req, res) => {
  const one = (sql) => db.prepare(sql).get().n;
  res.json({
    users: one('SELECT COUNT(*) AS n FROM users'),
    products: one('SELECT COUNT(*) AS n FROM products WHERE active = 1'),
    outOfStock: one('SELECT COUNT(*) AS n FROM products WHERE active = 1 AND stock = 0'),
    orders: one('SELECT COUNT(*) AS n FROM orders'),
    revenue: db.prepare("SELECT COALESCE(SUM(total), 0) AS n FROM orders WHERE status IN ('PAID','SHIPPED','DELIVERED')").get().n,
  });
});

router.get('/admin/users', (_req, res) => {
  const users = db.prepare(`SELECT id, username, email, full_name AS fullName, role, status, phone, failed_attempts AS failedAttempts,
    created_at AS createdAt FROM users ORDER BY id`).all();
  res.json({ items: users });
});

router.patch('/admin/users/:id', (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body || {};
  if (!['active', 'locked'].includes(status)) return fail(res, 400, 'VALIDATION_ERROR', 'status must be active or locked');
  if (id === req.user.id) return fail(res, 400, 'CANNOT_LOCK_SELF', 'You cannot change your own status');
  const info = db.prepare('UPDATE users SET status = ?, failed_attempts = 0 WHERE id = ?').run(status, id);
  if (!info.changes) return fail(res, 404, 'NOT_FOUND', 'User not found');
  res.json(db.prepare('SELECT id, username, status FROM users WHERE id = ?').get(id));
});

router.patch('/admin/orders/:id/status', (req, res) => {
  const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(Number(req.params.id));
  if (!o) return fail(res, 404, 'NOT_FOUND', 'Order not found');
  const next = String(req.body?.status || '').toUpperCase();
  if (!changeStatus(o, next)) return fail(res, 409, 'INVALID_TRANSITION', `Cannot change status from ${o.status} to ${next || '(empty)'}`);
  res.json(orderView(db.prepare('SELECT * FROM orders WHERE id = ?').get(o.id)));
});

const csvCell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));

router.get('/admin/products/export.csv', (_req, res) => {
  const rows = db.prepare('SELECT sku, name, name_th, category, price, stock, active FROM products ORDER BY id').all();
  const csv = ['sku,name,name_th,category,price,stock,active', ...rows.map((r) => Object.values(r).map(csvCell).join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
  res.send(`﻿${csv}`); // BOM so Excel shows Thai correctly
});

/** Very small CSV parser that supports quoted cells. */
function parseCsv(text) {
  const rows = [];
  for (const line of text.replace(/^﻿/, '').split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i += 1; } else if (ch === '"') quoted = false; else cur += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { cells.push(cur); cur = ''; } else cur += ch;
    }
    cells.push(cur);
    rows.push(cells.map((c) => c.trim()));
  }
  return rows;
}

router.post('/admin/products/import', csvUpload.single('file'), (req, res) => {
  if (!req.file) return fail(res, 400, 'FILE_REQUIRED', 'Upload a CSV file in field "file"');
  const rows = parseCsv(req.file.buffer.toString('utf8'));
  const header = (rows.shift() || []).map((h) => h.toLowerCase());
  const required = ['sku', 'name', 'category', 'price', 'stock'];
  const missing = required.filter((h) => !header.includes(h));
  if (missing.length) return fail(res, 400, 'INVALID_CSV', `Missing columns: ${missing.join(', ')}`);

  const result = { created: 0, updated: 0, errors: [] };
  rows.forEach((cells, idx) => {
    const r = Object.fromEntries(header.map((h, i) => [h, cells[i]]));
    const line = idx + 2;
    const price = Number(r.price);
    const stock = Number(r.stock);
    if (!/^[A-Z]{4}-\d{3}$/.test(r.sku || '')) return result.errors.push({ line, message: 'Invalid SKU' });
    if (!r.name) return result.errors.push({ line, message: 'Name is required' });
    if (!CATEGORIES.includes(r.category)) return result.errors.push({ line, message: 'Invalid category' });
    if (!(price >= 0)) return result.errors.push({ line, message: 'Invalid price' });
    if (!Number.isInteger(stock) || stock < 0) return result.errors.push({ line, message: 'Invalid stock' });
    const exists = db.prepare('SELECT id FROM products WHERE sku = ?').get(r.sku);
    if (exists) {
      db.prepare('UPDATE products SET name=?, name_th=?, category=?, price=?, stock=?, active=1 WHERE id=?')
        .run(r.name, r.name_th || r.name, r.category, price, stock, exists.id);
      result.updated += 1;
    } else {
      db.prepare(`INSERT INTO products (sku, name, name_th, category, price, stock, rating, description, image, active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, '', ?, 1, ?)`).run(r.sku, r.name, r.name_th || r.name, r.category, price, stock, `/img/${r.category}.svg`, new Date().toISOString());
      result.created += 1;
    }
    return undefined;
  });
  res.json(result);
});

module.exports = router;
