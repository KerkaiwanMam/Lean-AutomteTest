'use strict';
/**
 * LoanLab REST API — Retail Lending & Payment practice module (fictional training domain).
 * Requirements: practice-app/REQUIREMENTS-LOANLAB.md. Roles: customer = borrower, admin = back-office officer.
 */
const express = require('express');
const { db } = require('../db');
const config = require('../config');
const rules = require('../loanlab/rules');
const svc = require('../loanlab/service');
const { fail, requireAuth, requireAdmin } = require('../middleware');

const router = express.Router();
const REFERENCE_RE = /^[A-Za-z0-9_-]{4,40}$/;

const isOfficer = (req) => req.user.role === 'admin';
const sendDecision = (res, d) => fail(res, d.status, d.code, d.message);
const idOf = (value) => (Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : null);

/** LL-SEC-02: a customer sees only their own data; anything else looks like it does not exist. */
function canRead(req, ownerId) {
  return ownerId === req.user.id || isOfficer(req) || config.bug('LL-BUG-08');
}

function loadLoan(req, res, { forWrite = false } = {}) {
  const loan = svc.loanRow(idOf(req.params.id));
  const allowed = loan && (forWrite ? loan.user_id === req.user.id || isOfficer(req) : canRead(req, loan.user_id));
  if (!allowed) { fail(res, 404, 'NOT_FOUND', 'Loan not found'); return null; }
  return loan;
}

router.use('/loanlab', requireAuth);

router.get('/loanlab/business-date', (_req, res) => res.json({ businessDate: svc.businessDate() }));

// ---------- accounts ----------
router.get('/loanlab/accounts', (req, res) => {
  if (req.query.all === '1' && !isOfficer(req)) return fail(res, 403, 'FORBIDDEN', 'Officer role required');
  const all = req.query.all === '1';
  res.json({ businessDate: svc.businessDate(), items: svc.listAccounts(all ? null : req.user.id) });
});

router.post('/loanlab/accounts', requireAdmin, (req, res) => {
  const b = req.body || {};
  const details = {};
  const holderName = typeof b.holderName === 'string' ? b.holderName.trim() : '';
  if (!b.username || typeof b.username !== 'string') details.username = 'Username is required';
  if (holderName.length < 2 || holderName.length > 100) details.holderName = 'Holder name must be 2-100 characters';
  if (Object.keys(details).length) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid input', details);
  const customer = db.prepare("SELECT id FROM users WHERE username = ? AND role = 'customer'").get(b.username.trim());
  if (!customer) return fail(res, 404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
  res.status(201).json(svc.accountView(svc.createAccount({ userId: customer.id, holderName })));
});

router.get('/loanlab/accounts/:id', (req, res) => {
  const account = svc.accountRow(idOf(req.params.id));
  if (!account || !canRead(req, account.user_id)) return fail(res, 404, 'NOT_FOUND', 'Account not found');
  res.json(svc.accountView(account));
});

router.patch('/loanlab/accounts/:id/status', requireAdmin, (req, res) => {
  const account = svc.accountRow(idOf(req.params.id));
  if (!account) return fail(res, 404, 'NOT_FOUND', 'Account not found');
  const result = svc.changeAccountStatus(account, String((req.body || {}).status || '').toUpperCase());
  if (!result.ok) return sendDecision(res, result);
  res.json(result.account);
});

// ---------- loans ----------
router.post('/loanlab/loans', requireAdmin, (req, res) => {
  const b = req.body || {};
  const details = {};
  const principal = rules.parseAmount(b.principal);
  if (!idOf(b.accountId)) details.accountId = 'accountId is required';
  if (principal === null || principal < rules.MIN_PRINCIPAL || principal > rules.MAX_PRINCIPAL) {
    details.principal = 'Principal must be between 1,000.00 and 1,000,000.00 with at most 2 decimals';
  }
  if (Object.keys(details).length) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid input', details);
  const account = svc.accountRow(idOf(b.accountId));
  if (!account) return fail(res, 404, 'NOT_FOUND', 'Account not found');
  if (account.status !== 'ACTIVE') return fail(res, 409, 'ACCOUNT_NOT_ACTIVE', `A loan can be opened only under an ACTIVE account (current: ${account.status})`);
  res.status(201).json(svc.loanView(svc.createLoan({ accountId: account.id, principal })));
});

router.get('/loanlab/loans/:id', (req, res) => {
  const loan = loadLoan(req, res);
  if (loan) res.json(svc.loanView(loan));
});

// ---------- payment (LL-PAY) ----------
router.post('/loanlab/loans/:id/payments', (req, res) => {
  const amount = rules.parseAmount((req.body || {}).amount);
  if (amount === null) {
    return fail(res, 400, 'VALIDATION_ERROR', 'Invalid input', { amount: 'Amount must be a number greater than 0 with at most 2 decimals' });
  }
  const loan = loadLoan(req, res, { forWrite: true });
  if (!loan) return;
  const result = svc.postPayment({ loan, amount, actorId: req.user.id });
  if (!result.ok) return sendDecision(res, result);
  res.status(201).json({ transaction: result.transaction, loan: result.loan });
});

// ---------- reporting (LL-RPT) ----------
function historyFilters(req, res) {
  const type = req.query.type ? String(req.query.type).toUpperCase() : null;
  const status = req.query.status ? String(req.query.status).toUpperCase() : null;
  if (type && !['PAYMENT', 'REVERSAL'].includes(type)) { fail(res, 400, 'VALIDATION_ERROR', 'type must be PAYMENT or REVERSAL'); return null; }
  if (status && !['POSTED', 'PARTIALLY_REVERSED', 'REVERSED'].includes(status)) {
    fail(res, 400, 'VALIDATION_ERROR', 'status must be POSTED, PARTIALLY_REVERSED or REVERSED');
    return null;
  }
  return { type, status };
}

router.get('/loanlab/loans/:id/transactions', (req, res) => {
  const filters = historyFilters(req, res);
  if (!filters) return;
  const loan = loadLoan(req, res);
  if (!loan) return;
  res.json({ loan: svc.loanView(loan), items: svc.listTransactions({ loanId: loan.id, ...filters }) });
});

router.get('/loanlab/transactions', (req, res) => {
  if (req.query.all === '1' && !isOfficer(req)) return fail(res, 403, 'FORBIDDEN', 'Officer role required');
  const filters = historyFilters(req, res);
  if (!filters) return;
  res.json({ items: svc.listTransactions({ userId: req.query.all === '1' ? null : req.user.id, ...filters }) });
});

router.get('/loanlab/transactions/:id', (req, res) => {
  const txn = svc.txnRow(idOf(req.params.id));
  if (!txn || !canRead(req, txn.user_id)) return fail(res, 404, 'NOT_FOUND', 'Transaction not found');
  res.json(svc.txnDetail(txn));
});

// ---------- reversal (LL-REV) ----------
router.post('/loanlab/reversals', (req, res) => {
  if (!isOfficer(req) && !config.bug('LL-BUG-09')) return fail(res, 403, 'FORBIDDEN', 'Only an officer can reverse a payment');
  const b = req.body || {};
  const details = {};
  const originalId = idOf(b.originalTransactionId);
  const reason = typeof b.reason === 'string' ? b.reason.trim() : '';
  const hasAmount = b.amount !== undefined && b.amount !== null;
  const amount = hasAmount ? rules.parseAmount(b.amount) : null;
  if (!originalId) details.originalTransactionId = 'The original transaction is required';
  if (typeof b.reference !== 'string' || !REFERENCE_RE.test(b.reference)) details.reference = 'Reference must be 4-40 characters: letters, digits, - or _';
  if (reason.length < 5 || reason.length > 200) details.reason = 'Reason must be 5-200 characters';
  if (hasAmount && amount === null) details.amount = 'Amount must be a number greater than 0 with at most 2 decimals';
  if (Object.keys(details).length) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid input', details);

  const result = svc.reversePayment({ actor: req.user, originalId, amount, reference: b.reference, reason });
  if (!result.ok) return sendDecision(res, result);
  res.status(201).json({ reversal: result.reversal, original: result.original, loan: result.loan });
});

// ---------- end of day (LL-EOD) ----------
router.post('/loanlab/eod', requireAdmin, (_req, res) => res.status(201).json(svc.runEod()));
router.get('/loanlab/eod-runs', requireAdmin, (_req, res) => res.json({ businessDate: svc.businessDate(), items: svc.listEodRuns() }));

module.exports = router;
