'use strict';
const { db } = require('./db');
const { verifyToken } = require('./security');
const config = require('./config');

const COOKIE_NAME = 'sl_token';

/** Consistent error shape for every API response: { error: { code, message, details? } } */
function fail(res, status, code, message, details) {
  return res.status(status).json({ error: { code, message, ...(details ? { details } : {}) } });
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

function tokenFrom(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return readCookie(req, COOKIE_NAME);
}

/** Populates req.user when a valid token is present (cookie or Authorization: Bearer). */
function authenticate(req, _res, next) {
  const token = tokenFrom(req);
  const payload = verifyToken(token);
  if (payload) {
    const user = db.prepare('SELECT id, username, email, full_name, role, status FROM users WHERE id = ?').get(payload.uid);
    if (user && (user.status === 'active' || config.bug('BUG-11'))) {
      req.user = user;
      req.token = token;
    }
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return fail(res, 401, 'UNAUTHORIZED', 'Login required');
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return fail(res, 401, 'UNAUTHORIZED', 'Login required');
  if (req.user.role !== 'admin') return fail(res, 403, 'FORBIDDEN', 'Admin role required');
  next();
}

/** Artificial latency + random failures, controlled by /api/test/config */
function chaos(req, res, next) {
  const { latencyMs, failureRate } = config.get();
  const go = () => {
    const isProductList = req.method === 'GET' && req.path === '/products';
    if (isProductList && failureRate > 0 && Math.random() < failureRate) {
      return fail(res, 503, 'SERVICE_UNAVAILABLE', 'Random failure injected by chaos config');
    }
    next();
  };
  if (latencyMs > 0 && !req.path.startsWith('/test/')) setTimeout(go, latencyMs);
  else go();
}

module.exports = { fail, authenticate, requireAuth, requireAdmin, chaos, COOKIE_NAME };
