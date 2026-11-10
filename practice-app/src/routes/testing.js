'use strict';
/**
 * Test-support endpoints ("test hooks"). Real projects often expose something similar in
 * non-production environments to reset/seed data quickly. They MUST be disabled in production —
 * server.js only mounts this router when NODE_ENV !== 'production'.
 */
const crypto = require('node:crypto');
const express = require('express');
const { db, reset } = require('../db');
const config = require('../config');
const { hashPassword, clearRevoked } = require('../security');
const { fail } = require('../middleware');

const router = express.Router();

router.post('/test/reset', (_req, res) => {
  reset();
  clearRevoked();
  const keepConfig = _req.query.keepConfig === '1';
  if (!keepConfig) config.reset();
  res.json({ ok: true, config: config.get() });
});

router.get('/test/config', (req, res) => {
  const body = config.get();
  if (req.query.reveal === '1') body.bugs = config.BUGS;
  res.json(body);
});

router.post('/test/config', (req, res) => {
  const b = req.body || {};
  if (b.bugMode !== undefined && typeof b.bugMode !== 'boolean') return fail(res, 400, 'VALIDATION_ERROR', 'bugMode must be boolean');
  res.json(config.set(b));
});

/**
 * Test-data factory: create a fresh, unique user in one call.
 * Lets parallel tests work with their own account instead of sharing "customer".
 */
router.post('/test/users', (req, res) => {
  const b = req.body || {};
  const suffix = crypto.randomBytes(4).toString('hex');
  const username = b.username || `user_${suffix}`;
  const password = b.password || 'Passw0rd!';
  const role = b.role === 'admin' ? 'admin' : 'customer';
  if (db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)) return fail(res, 409, 'USERNAME_TAKEN', 'Username is already taken');
  const { lastInsertRowid } = db.prepare(`INSERT INTO users (username, password_hash, email, full_name, role, status, phone, created_at)
    VALUES (?, ?, ?, ?, ?, 'active', '0800000000', ?)`)
    .run(username, hashPassword(password), b.email || `${username}@shoplab.test`, b.fullName || `Test ${username}`, role, new Date().toISOString());
  res.status(201).json({ id: Number(lastInsertRowid), username, password, role });
});

module.exports = router;
