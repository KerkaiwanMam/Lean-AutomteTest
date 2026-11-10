'use strict';
/** Helper endpoints used by the Elements Lab page (lab.html). */
const express = require('express');
const multer = require('multer');
const { fail } = require('../middleware');

const router = express.Router();
const memUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 3 } });

router.get('/lab/delay', (req, res) => {
  const ms = Math.min(Number(req.query.ms) || 2000, 15000);
  setTimeout(() => res.json({ message: `Loaded after ${ms} ms`, ms }), ms);
});

let counter = 0;
/** Fails every other call — a deliberately flaky dependency. */
router.get('/lab/flaky', (_req, res) => {
  counter += 1;
  if (counter % 2 === 0) return fail(res, 500, 'FLAKY', 'Flaky endpoint failed this time, try again');
  res.json({ message: 'Flaky endpoint succeeded', attempt: counter });
});

const FIRST = ['Anan', 'Benja', 'Chai', 'Dao', 'Ek', 'Fah', 'Gun', 'Hathai', 'Itt', 'Jira'];
const LAST = ['Srisuk', 'Wong', 'Chaiyo', 'Rattanakul', 'Boonmee'];
const DEPTS = ['QA', 'Dev', 'Ops', 'HR', 'Sales'];
const employees = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `${FIRST[i % 10]} ${LAST[i % 5]}`,
  department: DEPTS[(i * 3) % 5],
  salary: 20000 + ((i * 7919) % 60) * 1000,
  startDate: `20${String(15 + (i % 10)).padStart(2, '0')}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
}));

router.get('/lab/employees', (_req, res) => res.json({ items: employees }));

router.get('/lab/feed', (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const totalPages = 5;
  const items = page > totalPages ? [] : Array.from({ length: 10 }, (_, i) => ({ id: (page - 1) * 10 + i + 1, text: `Feed item #${(page - 1) * 10 + i + 1}` }));
  setTimeout(() => res.json({ page, totalPages, items }), 400);
});

router.get('/lab/download', (req, res) => {
  const type = req.query.type || 'txt';
  const files = {
    txt: ['sample.txt', 'text/plain', 'Hello from ShopLab!\nThis file is used for download tests.\n'],
    csv: ['employees.csv', 'text/csv', ['id,name,department,salary', ...employees.slice(0, 5).map((e) => `${e.id},${e.name},${e.department},${e.salary}`)].join('\n')],
    json: ['data.json', 'application/json', JSON.stringify({ app: 'ShopLab', items: employees.slice(0, 3) }, null, 2)],
  };
  const f = files[type];
  if (!f) return fail(res, 400, 'VALIDATION_ERROR', 'type must be txt, csv or json');
  res.setHeader('Content-Type', f[1]);
  res.setHeader('Content-Disposition', `attachment; filename="${f[0]}"`);
  res.send(f[2]);
});

router.post('/lab/upload', memUpload.array('files', 3), (req, res) => {
  const files = (req.files || []).map((f) => ({ name: f.originalname, size: f.size, type: f.mimetype }));
  if (!files.length) return fail(res, 400, 'FILE_REQUIRED', 'Select at least one file');
  res.json({ files });
});

module.exports = router;
