'use strict';
const crypto = require('node:crypto');

const SECRET = process.env.SHOPLAB_SECRET || 'shoplab-practice-secret-change-me';
const TOKEN_TTL_SECONDS = 60 * 60 * 8; // 8 hours
const revoked = new Set(); // tokens invalidated by logout

function hashPassword(password, salt = crypto.randomBytes(8).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 32);
  return crypto.timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
}

const b64url = (buf) => Buffer.from(buf).toString('base64url');

/** Minimal JWT-like token: base64url(payload).signature */
function signToken(payload) {
  const body = b64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS }));
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || revoked.has(token)) return null;
  const [body, sig] = String(token).split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

const revokeToken = (token) => token && revoked.add(token);
const clearRevoked = () => revoked.clear();

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, revokeToken, clearRevoked };
