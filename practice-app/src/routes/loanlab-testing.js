'use strict';
/**
 * LoanLab test hooks (REQUIREMENTS-LOANLAB.md, LL-TST). Mounted by server.js only when
 * NODE_ENV !== 'production', next to the ShopLab hooks in routes/testing.js.
 *
 * Hooks build a state DIRECTLY and do not apply the business rules — that is the point: a test can
 * start from "FROZEN account with 300.00 outstanding" without walking there through the UI.
 */
const express = require('express');
const { db, resetLoanLab } = require('../db');
const rules = require('../loanlab/rules');
const svc = require('../loanlab/service');
const { fail } = require('../middleware');

const router = express.Router();

/** amount >= 0 with at most 2 decimals → satang, otherwise null */
const balanceOf = (value) => (value === 0 ? 0 : rules.parseAmount(value));

router.post('/test/loanlab/reset', (_req, res) => {
  resetLoanLab();
  res.json({ ok: true, businessDate: svc.businessDate() });
});

/**
 * Test-data factory: one account (and by default one loan) for an existing customer, in any state.
 * Body: { username, accountStatus = 'ACTIVE', outstanding = 10000, principal = max(outstanding, 1000), holderName, noLoan = false }
 * outstanding 0 creates a CLOSED loan.
 */
router.post('/test/loanlab/accounts', (req, res) => {
  const b = req.body || {};
  const details = {};
  const status = String(b.accountStatus || 'ACTIVE').toUpperCase();
  const outstanding = b.outstanding === undefined ? 1000000 : balanceOf(b.outstanding);
  const principal = b.principal === undefined ? Math.max(outstanding || 0, rules.MIN_PRINCIPAL) : rules.parseAmount(b.principal);
  if (!b.username || typeof b.username !== 'string') details.username = 'username of an existing customer is required';
  if (!rules.ACCOUNT_STATUSES.includes(status)) details.accountStatus = `accountStatus must be one of ${rules.ACCOUNT_STATUSES.join(', ')}`;
  if (outstanding === null) details.outstanding = 'outstanding must be a number >= 0 with at most 2 decimals';
  if (principal === null || (outstanding !== null && principal < outstanding)) details.principal = 'principal must be a valid amount that is not below outstanding';
  if (Object.keys(details).length) return fail(res, 400, 'VALIDATION_ERROR', 'Invalid input', details);
  const user = db.prepare("SELECT id, full_name FROM users WHERE username = ? AND role = 'customer'").get(b.username);
  if (!user) return fail(res, 404, 'CUSTOMER_NOT_FOUND', 'Customer not found');

  const account = svc.createAccount({ userId: user.id, holderName: b.holderName || user.full_name, status });
  const loan = b.noLoan ? null : svc.createLoan({ accountId: account.id, principal, outstanding });
  res.status(201).json({ account: svc.accountView(svc.accountRow(account.id)), loan: loan && svc.loanView(loan) });
});

/** Fault injection: overwrite the stored balance WITHOUT a ledger entry, to simulate a reconciliation break. */
router.patch('/test/loanlab/loans/:id', (req, res) => {
  const loan = svc.loanRow(Number(req.params.id));
  if (!loan) return fail(res, 404, 'NOT_FOUND', 'Loan not found');
  const outstanding = balanceOf((req.body || {}).outstanding);
  if (outstanding === null) return fail(res, 400, 'VALIDATION_ERROR', 'outstanding must be a number >= 0 with at most 2 decimals');
  db.prepare('UPDATE ll_loans SET outstanding_satang = ?, updated_at = ? WHERE id = ?').run(outstanding, new Date().toISOString(), loan.id);
  res.json(svc.loanView(svc.loanRow(loan.id)));
});

router.get('/test/loanlab/business-date', (_req, res) => res.json({ businessDate: svc.businessDate() }));

router.post('/test/loanlab/business-date', (req, res) => {
  const date = (req.body || {}).date;
  if (!rules.isBusinessDay(date)) return fail(res, 400, 'VALIDATION_ERROR', 'date must be YYYY-MM-DD and a business day (Monday-Friday)');
  svc.setBusinessDate(date);
  res.json({ businessDate: svc.businessDate() });
});

router.post('/test/loanlab/eod', (_req, res) => res.status(201).json(svc.runEod()));

module.exports = router;
