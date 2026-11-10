'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const seed = require('./seed-data');
const { hashPassword } = require('./security');
const { quote } = require('./pricing');

const DATA_DIR = process.env.SHOPLAB_DATA_DIR || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'shoplab.db');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

const SCHEMA = `
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  username        TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  full_name       TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('customer','admin')),
  status          TEXT NOT NULL CHECK (status IN ('active','locked')),
  phone           TEXT,
  birth_date      TEXT,
  gender          TEXT,
  province        TEXT,
  interests       TEXT,
  avatar          TEXT,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL
);

CREATE TABLE products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  sku         TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  name_th     TEXT NOT NULL,
  category    TEXT NOT NULL,
  price       REAL NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL CHECK (stock >= 0),
  rating      REAL NOT NULL DEFAULT 0,
  description TEXT,
  image       TEXT,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL
);

CREATE TABLE coupons (
  code         TEXT PRIMARY KEY,
  type         TEXT NOT NULL CHECK (type IN ('percent','fixed','freeship')),
  value        REAL NOT NULL,
  max_discount REAL,
  min_subtotal REAL NOT NULL DEFAULT 0,
  expires_at   TEXT,
  active       INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE cart_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty        INTEGER NOT NULL,
  UNIQUE (user_id, product_id)
);

CREATE TABLE orders (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no        TEXT UNIQUE,
  user_id         INTEGER NOT NULL REFERENCES users(id),
  status          TEXT NOT NULL CHECK (status IN ('PENDING','PAID','SHIPPED','DELIVERED','CANCELLED')),
  payment_method  TEXT NOT NULL CHECK (payment_method IN ('card','cod')),
  payment_last4   TEXT,
  shipping_method TEXT NOT NULL,
  coupon_code     TEXT,
  subtotal        REAL NOT NULL,
  discount        REAL NOT NULL,
  shipping        REAL NOT NULL,
  vat             REAL NOT NULL,
  total           REAL NOT NULL,
  address_json    TEXT NOT NULL,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

CREATE TABLE order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  sku        TEXT NOT NULL,
  name       TEXT NOT NULL,
  price      REAL NOT NULL,
  qty        INTEGER NOT NULL
);

CREATE TABLE reviews (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`;

const SEED_TIME = '2026-01-01T00:00:00Z';

function orderNo(id, createdAt) {
  return `SL-${createdAt.slice(0, 10).replace(/-/g, '')}-${String(id).padStart(4, '0')}`;
}

function reset() {
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec(SCHEMA);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('BEGIN');
  try {
    const insUser = db.prepare(`INSERT INTO users (username, password_hash, email, full_name, role, status, phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    // fixed salt => identical hashes after every reset (deterministic DB snapshots)
    for (const u of seed.users) {
      insUser.run(u.username, hashPassword(u.password, `seed${u.username}`), u.email, u.full_name, u.role, u.status, u.phone, SEED_TIME);
    }

    const insProduct = db.prepare(`INSERT INTO products (sku, name, name_th, category, price, stock, rating, description, image, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const p of seed.products) {
      insProduct.run(p.sku, p.name, p.name_th, p.category, p.price, p.stock, p.rating, p.description, p.image, p.active, SEED_TIME);
    }

    const insCoupon = db.prepare(`INSERT INTO coupons (code, type, value, max_discount, min_subtotal, expires_at, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const c of seed.coupons) {
      insCoupon.run(c.code, c.type, c.value, c.max_discount, c.min_subtotal, c.expires_at, c.active);
    }

    const userId = (username) => db.prepare('SELECT id FROM users WHERE username = ?').get(username).id;
    const productBySku = (sku) => db.prepare('SELECT * FROM products WHERE sku = ?').get(sku);
    const couponByCode = (code) => (code ? db.prepare('SELECT * FROM coupons WHERE code = ?').get(code) : null);

    const insOrder = db.prepare(`INSERT INTO orders (user_id, status, payment_method, payment_last4, shipping_method, coupon_code,
      subtotal, discount, shipping, vat, total, address_json, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const insItem = db.prepare('INSERT INTO order_items (order_id, product_id, sku, name, price, qty) VALUES (?, ?, ?, ?, ?, ?)');
    for (const o of seed.orders) {
      const items = o.items.map(([sku, qty]) => ({ ...productBySku(sku), qty }));
      const q = quote(items, { coupon: couponByCode(o.coupon), shippingMethod: o.shipping_method, now: new Date(o.created_at) });
      const { lastInsertRowid } = insOrder.run(userId(o.user), o.status, o.payment_method, o.payment_method === 'card' ? '4242' : null,
        o.shipping_method, q.couponCode, q.subtotal, q.discount, q.shipping, q.vat, q.total, JSON.stringify(seed.address), o.created_at, o.created_at);
      db.prepare('UPDATE orders SET order_no = ? WHERE id = ?').run(orderNo(lastInsertRowid, o.created_at), lastInsertRowid);
      for (const it of items) insItem.run(lastInsertRowid, it.id, it.sku, it.name, it.price, it.qty);
    }

    const insReview = db.prepare('INSERT INTO reviews (product_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)');
    for (const r of seed.reviews) insReview.run(productBySku(r.sku).id, userId(r.user), r.rating, r.comment, r.created_at);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  for (const f of fs.readdirSync(UPLOAD_DIR)) fs.rmSync(path.join(UPLOAD_DIR, f), { force: true });
}

function ensureSeeded() {
  const hasUsers = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  if (!hasUsers) reset();
}

module.exports = { db, reset, ensureSeeded, orderNo, DB_PATH, UPLOAD_DIR };
