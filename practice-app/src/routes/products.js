'use strict';
const express = require('express');
const { db } = require('../db');
const config = require('../config');
const { fail, requireAuth, requireAdmin } = require('../middleware');

const router = express.Router();
const CATEGORIES = ['books', 'electronics', 'fashion', 'home', 'sports'];
const SORTS = {
  name_asc: 'name COLLATE NOCASE ASC',
  name_desc: 'name COLLATE NOCASE DESC',
  price_asc: 'price ASC, id ASC',
  price_desc: 'price DESC, id ASC',
  rating_desc: 'rating DESC, id ASC',
  newest: 'id DESC',
};

const toProduct = (p) => ({
  id: p.id, sku: p.sku, name: p.name, nameTh: p.name_th, category: p.category, price: p.price,
  stock: p.stock, inStock: p.stock > 0, rating: p.rating, description: p.description, image: p.image, active: !!p.active,
});

router.get('/categories', (_req, res) => {
  const rows = db.prepare('SELECT category, COUNT(*) AS count FROM products WHERE active = 1 GROUP BY category ORDER BY category').all();
  res.json({ categories: rows });
});

router.get('/products', (req, res) => {
  const q = req.query;
  const page = q.page === undefined ? 1 : Number(q.page);
  const pageSize = q.pageSize === undefined ? 8 : Number(q.pageSize);
  const sort = q.sort || 'name_asc';
  const details = {};
  if (!Number.isInteger(page) || page < 1) details.page = 'page must be an integer >= 1';
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) details.pageSize = 'pageSize must be an integer 1-50';
  if (!SORTS[sort]) details.sort = `sort must be one of ${Object.keys(SORTS).join(', ')}`;
  if (q.category && !CATEGORIES.includes(q.category)) details.category = `category must be one of ${CATEGORIES.join(', ')}`;
  if (q.minPrice !== undefined && Number.isNaN(Number(q.minPrice))) details.minPrice = 'minPrice must be a number';
  if (q.maxPrice !== undefined && Number.isNaN(Number(q.maxPrice))) details.maxPrice = 'maxPrice must be a number';
  if (Object.keys(details).length) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid query', details);

  const where = [];
  const params = [];
  const includeInactive = q.includeInactive === '1' && req.user?.role === 'admin';
  if (!includeInactive) where.push('active = 1');
  if (q.search) {
    const term = String(q.search).trim();
    if (config.bug('BUG-03')) {
      where.push('(instr(name, ?) > 0 OR instr(name_th, ?) > 0 OR instr(sku, ?) > 0)');
      params.push(term, term, term);
    } else {
      where.push('(lower(name) LIKE ? OR name_th LIKE ? OR lower(sku) LIKE ?)');
      const like = `%${term.toLowerCase()}%`;
      params.push(like, `%${term}%`, like);
    }
  }
  if (q.category) { where.push('category = ?'); params.push(q.category); }
  if (q.minPrice !== undefined) { where.push('price >= ?'); params.push(Number(q.minPrice)); }
  if (q.maxPrice !== undefined) { where.push('price <= ?'); params.push(Number(q.maxPrice)); }
  if (q.inStock === 'true') where.push('stock > 0');

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  let orderSql = SORTS[sort];
  if (config.bug('BUG-04') && sort.startsWith('price')) orderSql = `CAST(price AS TEXT) ${sort === 'price_asc' ? 'ASC' : 'DESC'}`;
  let offset = (page - 1) * pageSize;
  if (config.bug('BUG-05') && page > 1) offset += 1;

  const total = db.prepare(`SELECT COUNT(*) AS n FROM products ${whereSql}`).get(...params).n;
  const rows = db.prepare(`SELECT * FROM products ${whereSql} ORDER BY ${orderSql} LIMIT ? OFFSET ?`).all(...params, pageSize, offset);
  res.json({ items: rows.map(toProduct), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
});

router.get('/products/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(req.params.id));
  if (!p || (!p.active && req.user?.role !== 'admin')) return fail(res, 404, 'NOT_FOUND', 'Product not found');
  const reviews = db.prepare(`SELECT r.id, r.rating, r.comment, r.created_at AS createdAt, u.username
    FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.product_id = ? ORDER BY r.id`).all(p.id);
  res.json({ ...toProduct(p), reviews });
});

function validateProduct(b, partial) {
  const e = {};
  const has = (k) => b[k] !== undefined;
  if (!partial || has('sku')) if (!/^[A-Z]{4}-\d{3}$/.test(b.sku || '')) e.sku = 'SKU format must be AAAA-999';
  if (!partial || has('name')) if (!b.name || String(b.name).trim().length < 2 || String(b.name).length > 100) e.name = 'Name must be 2-100 characters';
  if (!partial || has('category')) if (!CATEGORIES.includes(b.category)) e.category = `Category must be one of ${CATEGORIES.join(', ')}`;
  if (!partial || has('price')) if (typeof b.price !== 'number' || !(b.price >= 0) || b.price > 1000000) e.price = 'Price must be a number 0-1,000,000';
  if (!partial || has('stock')) if (!Number.isInteger(b.stock) || b.stock < 0) e.stock = 'Stock must be an integer >= 0';
  return e;
}

router.post('/products', requireAdmin, (req, res) => {
  const b = req.body || {};
  const errors = validateProduct(b, false);
  if (Object.keys(errors).length) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid input', errors);
  if (db.prepare('SELECT 1 FROM products WHERE sku = ?').get(b.sku)) return fail(res, 409, 'SKU_TAKEN', 'SKU already exists');
  const { lastInsertRowid } = db.prepare(`INSERT INTO products (sku, name, name_th, category, price, stock, rating, description, image, active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, 1, ?)`).run(b.sku, b.name.trim(), (b.nameTh || b.name).trim(), b.category, b.price, b.stock,
    b.description || '', `/img/${b.category}.svg`, new Date().toISOString());
  res.status(201).json(toProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(lastInsertRowid)));
});

router.put('/products/:id', requireAdmin, (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(req.params.id));
  if (!p) return fail(res, 404, 'NOT_FOUND', 'Product not found');
  const b = req.body || {};
  const errors = validateProduct(b, true);
  if (Object.keys(errors).length) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid input', errors);
  if (b.sku && b.sku !== p.sku && db.prepare('SELECT 1 FROM products WHERE sku = ?').get(b.sku)) return fail(res, 409, 'SKU_TAKEN', 'SKU already exists');
  const next = {
    sku: b.sku ?? p.sku, name: b.name ?? p.name, name_th: b.nameTh ?? p.name_th, category: b.category ?? p.category,
    price: b.price ?? p.price, stock: b.stock ?? p.stock, description: b.description ?? p.description,
    active: b.active === undefined ? p.active : (b.active ? 1 : 0),
  };
  db.prepare(`UPDATE products SET sku=?, name=?, name_th=?, category=?, price=?, stock=?, description=?, active=?, image=? WHERE id=?`)
    .run(next.sku, next.name, next.name_th, next.category, next.price, next.stock, next.description, next.active, `/img/${next.category}.svg`, p.id);
  res.json(toProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(p.id)));
});

router.delete('/products/:id', requireAdmin, (req, res) => {
  const info = db.prepare('UPDATE products SET active = 0 WHERE id = ?').run(Number(req.params.id));
  if (!info.changes) return fail(res, 404, 'NOT_FOUND', 'Product not found');
  res.status(204).end();
});

router.post('/products/:id/reviews', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ? AND active = 1').get(Number(req.params.id));
  if (!p) return fail(res, 404, 'NOT_FOUND', 'Product not found');
  const { rating, comment } = req.body || {};
  const e = {};
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) e.rating = 'Rating must be an integer 1-5';
  if (typeof comment !== 'string' || !comment.trim() || comment.length > 500) e.comment = 'Comment must be 1-500 characters';
  if (Object.keys(e).length) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid input', e);
  const { lastInsertRowid } = db.prepare('INSERT INTO reviews (product_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(p.id, req.user.id, rating, comment.trim(), new Date().toISOString());
  res.status(201).json({ id: Number(lastInsertRowid), rating, comment: comment.trim(), username: req.user.username });
});

module.exports = router;
module.exports.toProduct = toProduct;
module.exports.CATEGORIES = CATEGORIES;
