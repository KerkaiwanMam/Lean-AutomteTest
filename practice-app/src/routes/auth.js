'use strict';
const express = require('express');
const { db } = require('../db');
const config = require('../config');
const { verifyPassword, signToken, revokeToken } = require('../security');
const { fail, requireAuth, COOKIE_NAME } = require('../middleware');

const router = express.Router();
const MAX_FAILED_ATTEMPTS = 5;
const SLOW_USER_DELAY_MS = 3000;

const publicUser = (u) => ({ id: u.id, username: u.username, email: u.email, fullName: u.full_name, role: u.role, status: u.status });

router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  const details = {};
  if (!username || typeof username !== 'string') details.username = 'Username is required';
  if (!password || typeof password !== 'string') details.password = 'Password is required';
  if (Object.keys(details).length) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid input', details);

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());
  if (user && user.username === 'slow') await new Promise((r) => setTimeout(r, SLOW_USER_DELAY_MS));

  if (!user) {
    const msg = config.bug('BUG-13') ? 'User not found' : 'Invalid username or password';
    return fail(res, 401, 'INVALID_CREDENTIALS', msg);
  }
  if (user.status === 'locked' && !config.bug('BUG-11')) {
    return fail(res, 423, 'ACCOUNT_LOCKED', 'Account is locked. Please contact support.');
  }
  if (!verifyPassword(password, user.password_hash)) {
    const attempts = user.failed_attempts + 1;
    const lock = attempts >= MAX_FAILED_ATTEMPTS && user.role !== 'admin';
    db.prepare('UPDATE users SET failed_attempts = ?, status = ? WHERE id = ?').run(attempts, lock ? 'locked' : user.status, user.id);
    if (lock) return fail(res, 423, 'ACCOUNT_LOCKED', 'Too many failed attempts. Account is locked.');
    const msg = config.bug('BUG-13') ? 'Wrong password' : 'Invalid username or password';
    return fail(res, 401, 'INVALID_CREDENTIALS', msg, { remainingAttempts: MAX_FAILED_ATTEMPTS - attempts });
  }

  db.prepare('UPDATE users SET failed_attempts = 0 WHERE id = ?').run(user.id);
  const token = signToken({ uid: user.id, role: user.role });
  res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', path: '/' });
  res.json({ token, user: publicUser(user) });
});

router.post('/auth/logout', (req, res) => {
  revokeToken(req.token);
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.status(204).end();
});

router.get('/auth/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: { ...publicUser(user), phone: user.phone, avatar: user.avatar } });
});

module.exports = router;
module.exports.publicUser = publicUser;
