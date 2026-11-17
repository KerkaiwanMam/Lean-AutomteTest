'use strict';
/**
 * Integration tests for LoanLab (rules + SQLite, no HTTP): payment, reversal, end-of-day.
 * The database lives in a temporary folder, so `npm test` never touches practice-app/data.
 * (node:test runs every test file in its own process, which keeps this environment variable local.)
 */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

process.env.SHOPLAB_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'loanlab-test-'));

const test = require('node:test');
const assert = require('node:assert/strict');
const config = require('../src/config');
const { db, reset } = require('../src/db');
const svc = require('../src/loanlab/service');

const THB = (n) => Math.round(n * 100);
const admin = () => db.prepare("SELECT id, role FROM users WHERE username = 'admin'").get();
const customer = () => db.prepare("SELECT id, role FROM users WHERE username = 'customer'").get();

/** A fresh ACTIVE account + loan for the seeded customer. */
function newLoan(outstanding = 10000, status = 'ACTIVE') {
  const account = svc.createAccount({ userId: customer().id, holderName: 'Unit Test', status });
  return svc.createLoan({ accountId: account.id, principal: THB(Math.max(outstanding, 1000)), outstanding: THB(outstanding) });
}
const payLoan = (loan, amount) => svc.postPayment({ loan: svc.loanRow(loan.id), amount: THB(amount), actorId: customer().id });
const reverseTxn = (id, reference, amount = null) => svc.reversePayment({
  actor: admin(), originalId: id, amount: amount === null ? null : THB(amount), reference, reason: 'unit test reversal',
});

test.beforeEach(() => { reset(); config.reset(); });
test.after(() => { db.close(); fs.rmSync(process.env.SHOPLAB_DATA_DIR, { recursive: true, force: true }); });

test('seed data is consistent: every seeded loan reconciles', () => {
  assert.equal(svc.businessDate(), '2026-01-05');
  const jane = svc.listAccounts(db.prepare("SELECT id FROM users WHERE username = 'jane'").get().id);
  assert.deepEqual(jane[0].loans.map((l) => [l.outstanding, l.status]), [[18500, 'ACTIVE'], [300, 'ACTIVE'], [0, 'CLOSED']]);
  assert.equal(svc.runEod().status, 'BALANCED');
});

test('payment is recorded with the business date and the balance after', () => {
  const loan = newLoan();
  const r = payLoan(loan, 1500.5);
  assert.equal(r.ok, true);
  assert.equal(r.loan.outstanding, 8499.5);
  assert.match(r.transaction.ref, /^PM-20260105-\d{6}$/);
  assert.deepEqual(
    [r.transaction.type, r.transaction.status, r.transaction.amount, r.transaction.businessDate, r.transaction.settlementDate, r.transaction.balanceAfter],
    ['PAYMENT', 'POSTED', 1500.5, '2026-01-05', null, 8499.5],
  );
});

test('a rejected payment changes nothing (LL-PAY-10)', () => {
  const loan = newLoan();
  assert.equal(payLoan(loan, 499.99).code, 'BELOW_MINIMUM');
  assert.equal(svc.loanRow(loan.id).outstanding_satang, THB(10000));
  assert.equal(svc.listTransactions({ loanId: loan.id }).length, 0);
});

test('partial reversals add up; the duplicate and the excess are rejected without side effects', () => {
  const loan = newLoan();
  const { transaction } = payLoan(loan, 1000);
  const first = reverseTxn(transaction.id, 'UT-0001', 400);
  assert.deepEqual([first.original.status, first.original.reversedAmount, first.original.reversibleAmount, first.loan.outstanding], ['PARTIALLY_REVERSED', 400, 600, 9400]);

  assert.equal(reverseTxn(transaction.id, 'UT-0001', 400).code, 'DUPLICATE_REVERSAL');
  assert.equal(reverseTxn(transaction.id, 'UT-0002', 600.01).code, 'EXCEEDS_REVERSIBLE_AMOUNT');
  assert.equal(svc.loanRow(loan.id).outstanding_satang, THB(9400));

  const rest = reverseTxn(transaction.id, 'UT-0003');
  assert.deepEqual([rest.reversal.amount, rest.original.status, rest.loan.outstanding], [600, 'REVERSED', 10000]);
  assert.equal(reverseTxn(transaction.id, 'UT-0004').code, 'ALREADY_REVERSED');
  assert.equal(svc.listTransactions({ loanId: loan.id, type: 'REVERSAL' }).length, 2);
  assert.equal(svc.txnDetail(svc.txnRow(transaction.id)).reversals.length, 2);
});

test('pay-off closes the loan; reversing it reopens the loan', () => {
  const loan = newLoan(300);
  const paid = payLoan(loan, 300);
  assert.deepEqual([paid.loan.outstanding, paid.loan.status], [0, 'CLOSED']);
  assert.equal(payLoan(loan, 500).code, 'LOAN_CLOSED');
  const back = reverseTxn(paid.transaction.id, 'UT-0010');
  assert.deepEqual([back.loan.outstanding, back.loan.status], [300, 'ACTIVE']);
});

test('EOD on a Friday settles on Monday, rolls the date and closes the reversal window', () => {
  svc.setBusinessDate('2026-01-09'); // Friday
  const loan = newLoan();
  const kept = payLoan(loan, 1000).transaction;
  const partly = payLoan(loan, 2000).transaction;
  const undone = payLoan(loan, 500).transaction;
  reverseTxn(partly.id, 'UT-0020', 500);
  reverseTxn(undone.id, 'UT-0021');

  const run = svc.runEod();
  assert.deepEqual(
    [run.businessDate, run.nextBusinessDate, run.settledCount, run.paymentsTotal, run.reversalsTotal, run.netTotal, run.status],
    ['2026-01-09', '2026-01-12', 2, 3500, 1000, 2500, 'BALANCED'],
  );
  assert.equal(svc.businessDate(), '2026-01-12');
  assert.equal(svc.txnRow(kept.id).settlement_date, '2026-01-12');
  assert.equal(svc.txnRow(partly.id).settlement_date, '2026-01-12');
  assert.equal(svc.txnRow(undone.id).settlement_date, null, 'a fully reversed payment is not settled');
  assert.equal(reverseTxn(kept.id, 'UT-0022').code, 'REVERSAL_WINDOW_CLOSED');
  assert.equal(payLoan(loan, 500).transaction.businessDate, '2026-01-12', 'after the cut-off = next business date');
});

test('reconciliation reports a break when the stored balance differs from the ledger', () => {
  const loan = newLoan();
  payLoan(loan, 1000);
  db.prepare('UPDATE ll_loans SET outstanding_satang = outstanding_satang + 1 WHERE id = ?').run(loan.id); // 0.01 THB off
  const run = svc.runEod();
  assert.equal(run.status, 'OUT_OF_BALANCE');
  assert.deepEqual(run.breaks, [{ loanId: loan.id, loanNo: loan.loan_no, expected: 9000, actual: 9000.01, difference: 0.01 }]);
  assert.equal(svc.businessDate(), '2026-01-06', 'EOD still rolls the date');
});

test('account status: closing needs a zero balance; a FROZEN account cannot pay', () => {
  const loan = newLoan(500);
  const account = () => svc.accountRow(loan.account_id);
  assert.equal(svc.changeAccountStatus(account(), 'CLOSED').code, 'ACCOUNT_HAS_BALANCE');
  assert.equal(svc.changeAccountStatus(account(), 'FROZEN').ok, true);
  assert.equal(payLoan(loan, 500).code, 'ACCOUNT_NOT_ACTIVE');
  assert.equal(svc.changeAccountStatus(account(), 'ACTIVE').ok, true);
  assert.equal(payLoan(loan, 500).loan.status, 'CLOSED');
  assert.equal(svc.changeAccountStatus(account(), 'CLOSED').account.status, 'CLOSED');
  assert.equal(svc.changeAccountStatus(account(), 'ACTIVE').code, 'INVALID_TRANSITION');
});
