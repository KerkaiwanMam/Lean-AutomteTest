'use strict';
const path = require('node:path');
const express = require('express');
const multer = require('multer');
const { db, UPLOAD_DIR } = require('../db');
const config = require('../config');
const { hashPassword } = require('../security');
const { fail } = require('../middleware');
const { publicUser } = require('./auth');

const router = express.Router();

const PROVINCES = ['Bangkok', 'Chiang Mai', 'Khon Kaen', 'Phuket', 'Chon Buri', 'Songkhla', 'Nakhon Ratchasima', 'Other'];
const GENDERS = ['male', 'female', 'other', 'unspecified'];
const INTERESTS = ['electronics', 'books', 'fashion', 'home', 'sports'];

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, `avatar-${Date.now()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 1024 * 1024 }, // 1 MB
  fileFilter: (_req, file, cb) => {
    if (['image/png', 'image/jpeg'].includes(file.mimetype)) return cb(null, true);
    const err = new Error('Avatar must be PNG or JPEG');
    err.code = 'INVALID_FILE_TYPE';
    cb(err);
  },
});

/** Age in full years on `today` for a YYYY-MM-DD birth date */
function ageOn(birthDate, today = new Date()) {
  const [y, m, d] = birthDate.split('-').map(Number);
  let age = today.getFullYear() - y;
  const beforeBirthday = today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d);
  if (beforeBirthday) age -= 1;
  return age;
}

function validateRegistration(b) {
  const e = {};
  const minAge = config.bug('BUG-06') ? 17 : 18;
  if (!/^[A-Za-z0-9_]{4,20}$/.test(b.username || '')) e.username = 'Username must be 4-20 characters: letters, digits or _';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(b.email || '')) e.email = 'Email is invalid';
  const pw = b.password || '';
  if (pw.length < 8 || pw.length > 64) e.password = 'Password must be 8-64 characters';
  else if (!/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/\d/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) {
    e.password = 'Password needs upper, lower, digit and special character';
  }
  if (b.confirmPassword !== b.password) e.confirmPassword = 'Passwords do not match';
  const name = (b.fullName || '').trim();
  if (name.length < 2 || name.length > 100) e.fullName = 'Full name must be 2-100 characters';
  if (!/^0\d{9}$/.test(b.phone || '')) e.phone = 'Phone must be 10 digits starting with 0';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.birthDate || '') || Number.isNaN(Date.parse(b.birthDate))) {
    e.birthDate = 'Birth date is required (YYYY-MM-DD)';
  } else {
    const age = ageOn(b.birthDate);
    if (age < minAge || age > 60) e.birthDate = 'Age must be between 18 and 60';
  }
  if (b.gender && !GENDERS.includes(b.gender)) e.gender = 'Invalid gender';
  if (!PROVINCES.includes(b.province)) e.province = 'Please select a province';
  const interests = [].concat(b.interests || []).filter(Boolean);
  if (interests.some((i) => !INTERESTS.includes(i))) e.interests = 'Invalid interest';
  if (!(b.acceptTerms === true || b.acceptTerms === 'true' || b.acceptTerms === 'on')) e.acceptTerms = 'You must accept the terms';
  return { errors: e, interests };
}

router.post('/users/register', upload.single('avatar'), (req, res) => {
  const b = req.body || {};
  const { errors, interests } = validateRegistration(b);
  if (Object.keys(errors).length) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid input', errors);

  if (db.prepare('SELECT 1 FROM users WHERE lower(username) = lower(?)').get(b.username)) {
    return fail(res, 409, 'USERNAME_TAKEN', 'Username is already taken', { username: 'Username is already taken' });
  }
  if (db.prepare('SELECT 1 FROM users WHERE lower(email) = lower(?)').get(b.email)) {
    return fail(res, 409, 'EMAIL_TAKEN', 'Email is already registered', { email: 'Email is already registered' });
  }

  const avatar = req.file ? `/uploads/${req.file.filename}` : null;
  const { lastInsertRowid } = db.prepare(`INSERT INTO users (username, password_hash, email, full_name, role, status, phone,
      birth_date, gender, province, interests, avatar, created_at)
      VALUES (?, ?, ?, ?, 'customer', 'active', ?, ?, ?, ?, ?, ?, ?)`)
    .run(b.username, hashPassword(b.password), b.email.toLowerCase(), b.fullName.trim(), b.phone, b.birthDate,
      b.gender || 'unspecified', b.province, interests.join(','), avatar, new Date().toISOString());
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid);
  res.status(201).json({ user: { ...publicUser(user), avatar } });
});

router.get('/meta/register', (_req, res) => res.json({ provinces: PROVINCES, genders: GENDERS, interests: INTERESTS }));

module.exports = router;
module.exports.ageOn = ageOn;
