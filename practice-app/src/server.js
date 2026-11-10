'use strict';
const path = require('node:path');
const express = require('express');
const multer = require('multer');
const { ensureSeeded, UPLOAD_DIR } = require('./db');
const { authenticate, chaos, fail } = require('./middleware');
const openapi = require('./openapi');
const pkg = require('../package.json');

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

ensureSeeded();

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- API ----
const api = express.Router();
api.use(chaos);
api.use(authenticate);
api.get('/health', (_req, res) => res.json({ status: 'ok', app: 'ShopLab', version: pkg.version, time: new Date().toISOString() }));
api.get('/openapi.json', (_req, res) => res.json(openapi));
if (!IS_PROD) api.use(require('./routes/testing'));
api.use(require('./routes/auth'));
api.use(require('./routes/users'));
api.use(require('./routes/products'));
api.use(require('./routes/cart'));
api.use(require('./routes/orders'));
api.use(require('./routes/admin'));
api.use(require('./routes/lab'));
api.use((req, res) => fail(res, 404, 'NOT_FOUND', `No route for ${req.method} ${req.baseUrl}${req.path}`));
app.use('/api', api);

// ---- Static UI ----
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'] }));

// ---- Errors ----
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  if (err instanceof multer.MulterError) return fail(res, 400, err.code, err.message);
  if (err.code === 'INVALID_FILE_TYPE') return fail(res, 400, err.code, err.message);
  if (err.type === 'entity.parse.failed') return fail(res, 400, 'INVALID_JSON', 'Request body is not valid JSON');
  console.error(err);
  return fail(res, 500, 'INTERNAL_ERROR', 'Something went wrong');
});

function start(port = PORT) {
  return app.listen(port, () => {
    console.log(`ShopLab running at http://localhost:${port}`);
    console.log(`  API docs : http://localhost:${port}/api-docs`);
    console.log(`  Bug mode : ${require('./config').get().bugMode ? 'ON' : 'off'}`);
    console.log(`  Test hooks ${IS_PROD ? 'DISABLED (production)' : 'enabled: POST /api/test/reset, /api/test/config'}`);
  });
}

if (require.main === module) start();

module.exports = { app, start };
