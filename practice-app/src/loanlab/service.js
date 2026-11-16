'use strict';
/**
 * LoanLab persistence + orchestration. Every decision is taken by the pure functions in rules.js;
 * this file only loads rows, applies the decision inside one SQLite transaction and builds API views.
 */
const { db } = require('../db');
const rules = require('./rules');
const { accountNo, loanNo, txnRef } = require('./schema');

const thb = rules.toThb;
const now = () => new Date().toISOString();

function atomic(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

// ---------- business date ----------
const businessDate = () => db.prepare("SELECT value FROM ll_system WHERE key = 'business_date'").get().value;
const setBusinessDate = (date) => db.prepare("UPDATE ll_system SET value = ? WHERE key = 'business_date'").run(date);

// ---------- rows ----------
const LOAN_SQL = `SELECT l.*, a.account_no, a.status AS account_status, a.user_id, a.holder_name
  FROM ll_loans l JOIN ll_accounts a ON a.id = l.account_id`;
const TXN_SQL = `SELECT t.*, l.loan_no, l.account_id, a.user_id, o.txn_ref AS original_ref
  FROM ll_transactions t JOIN ll_loans l ON l.id = t.loan_id JOIN ll_accounts a ON a.id = l.account_id
  LEFT JOIN ll_transactions o ON o.id = t.original_txn_id`;

const accountRow = (id) => db.prepare(`SELECT a.*, u.username FROM ll_accounts a JOIN users u ON u.id = a.user_id WHERE a.id = ?`).get(id);
const loanRow = (id) => db.prepare(`${LOAN_SQL} WHERE l.id = ?`).get(id);
const txnRow = (id) => db.prepare(`${TXN_SQL} WHERE t.id = ?`).get(id);

// ---------- views (API shapes; money in THB) ----------
function loanView(l) {
  return {
    id: l.id, loanNo: l.loan_no, accountId: l.account_id, accountNo: l.account_no, accountStatus: l.account_status,
    principal: thb(l.principal_satang), outstanding: thb(l.outstanding_satang),
    minimumPayment: l.status === 'ACTIVE' ? thb(rules.minimumPayment(l.outstanding_satang)) : 0,
    status: l.status, createdAt: l.created_at, updatedAt: l.updated_at,
  };
}

function accountView(a) {
  const loans = db.prepare(`${LOAN_SQL} WHERE l.account_id = ? ORDER BY l.id`).all(a.id).map(loanView);
  return {
    id: a.id, accountNo: a.account_no, userId: a.user_id, username: a.username, holderName: a.holder_name,
    status: a.status, createdAt: a.created_at, updatedAt: a.updated_at, loans,
  };
}

function txnView(t) {
  const isPayment = t.type === 'PAYMENT';
  return {
    id: t.id, ref: t.txn_ref, type: t.type, loanId: t.loan_id, loanNo: t.loan_no,
    amount: thb(t.amount_satang), status: t.status,
    reversedAmount: isPayment ? thb(t.reversed_satang) : null,
    reversibleAmount: isPayment ? thb(Math.max(0, t.amount_satang - t.reversed_satang)) : null,
    originalTransactionId: t.original_txn_id, originalRef: t.original_ref || null,
    reference: t.reference, reason: t.reason,
    businessDate: t.business_date, settlementDate: t.settlement_date,
    balanceAfter: thb(t.balance_after_satang), createdAt: t.created_at,
  };
}

function txnDetail(t) {
  const view = txnView(t);
  if (t.type === 'PAYMENT') {
    view.reversals = db.prepare(`${TXN_SQL} WHERE t.original_txn_id = ? ORDER BY t.id`).all(t.id).map(txnView);
    view.reversibleToday = view.reversibleAmount > 0 && t.business_date === businessDate();
  }
  return view;
}

function eodView(r) {
  return {
    id: r.id, businessDate: r.business_date, nextBusinessDate: r.next_business_date, settledCount: r.settled_count,
    paymentsTotal: thb(r.payments_satang), reversalsTotal: thb(r.reversals_satang), netTotal: thb(r.payments_satang - r.reversals_satang),
    status: r.status, breaks: JSON.parse(r.breaks_json), runAt: r.run_at,
  };
}

// ---------- accounts & loans ----------
function listAccounts(userId = null) {
  const sql = `SELECT a.*, u.username FROM ll_accounts a JOIN users u ON u.id = a.user_id ${userId === null ? '' : 'WHERE a.user_id = ?'} ORDER BY a.id`;
  return (userId === null ? db.prepare(sql).all() : db.prepare(sql).all(userId)).map(accountView);
}

function createAccount({ userId, holderName, status = 'PENDING' }) {
  const at = now();
  const id = Number(db.prepare('INSERT INTO ll_accounts (user_id, holder_name, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
    .run(userId, holderName, status, at, at).lastInsertRowid);
  db.prepare('UPDATE ll_accounts SET account_no = ? WHERE id = ?').run(accountNo(id), id);
  return accountRow(id);
}

function changeAccountStatus(account, next) {
  const hasBalance = !!db.prepare('SELECT 1 FROM ll_loans WHERE account_id = ? AND outstanding_satang > 0').get(account.id);
  const decision = rules.decideAccountTransition({ current: account.status, next, hasBalance });
  if (!decision.ok) return decision;
  db.prepare('UPDATE ll_accounts SET status = ?, updated_at = ? WHERE id = ?').run(next, now(), account.id);
  return { ok: true, account: accountView(accountRow(account.id)) };
}

/** `outstanding` defaults to the principal; the test hook passes another value to build a state directly. */
function createLoan({ accountId, principal, outstanding = principal }) {
  const at = now();
  const id = Number(db.prepare(`INSERT INTO ll_loans (account_id, principal_satang, opening_satang, outstanding_satang, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(accountId, principal, outstanding, outstanding, outstanding === 0 ? 'CLOSED' : 'ACTIVE', at, at).lastInsertRowid);
  db.prepare('UPDATE ll_loans SET loan_no = ? WHERE id = ?').run(loanNo(id), id);
  return loanRow(id);
}

// ---------- payment ----------
function insertTxn({ type, loanId, amount, status = 'POSTED', originalId = null, reference = null, reason = null, date, balanceAfter, actorId }) {
  const id = Number(db.prepare(`INSERT INTO ll_transactions (type, loan_id, amount_satang, status, original_txn_id, reference, reason,
    business_date, balance_after_satang, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(type, loanId, amount, status, originalId, reference, reason, date, balanceAfter, actorId, now()).lastInsertRowid);
  db.prepare('UPDATE ll_transactions SET txn_ref = ? WHERE id = ?').run(txnRef(type, id, date), id);
  return id;
}

/** @param {{loan: object, amount: number, actorId: number}} p  loan = row from loanRow(); amount in satang */
function postPayment({ loan, amount, actorId }) {
  const decision = rules.decidePayment({
    accountStatus: loan.account_status, loanStatus: loan.status, outstanding: loan.outstanding_satang, amount,
  });
  if (!decision.ok) return decision;
  const id = atomic(() => {
    db.prepare('UPDATE ll_loans SET outstanding_satang = ?, status = ?, updated_at = ? WHERE id = ?')
      .run(decision.newOutstanding, decision.loanStatus, now(), loan.id);
    return insertTxn({ type: 'PAYMENT', loanId: loan.id, amount, date: businessDate(), balanceAfter: decision.newOutstanding, actorId });
  });
  return { ok: true, transaction: txnDetail(txnRow(id)), loan: loanView(loanRow(loan.id)) };
}

// ---------- reversal ----------
/** @param {{actor: {id:number, role:string}, originalId: number, amount: number|null, reference: string, reason: string}} p */
function reversePayment({ actor, originalId, amount, reference, reason }) {
  const original = txnRow(originalId);
  const loan = original ? loanRow(original.loan_id) : null;
  const referenceUsed = !!db.prepare("SELECT 1 FROM ll_transactions WHERE type = 'REVERSAL' AND reference = ?").get(reference);
  const today = businessDate();
  const decision = rules.decideReversal({
    actorRole: actor.role,
    original: original && { type: original.type, status: original.status, amount: original.amount_satang, reversedAmount: original.reversed_satang, businessDate: original.business_date },
    referenceUsed,
    businessDate: today,
    accountStatus: loan && loan.account_status,
    loanStatus: loan && loan.status,
    outstanding: loan && loan.outstanding_satang,
    amount,
  });
  if (!decision.ok) return decision;
  const id = atomic(() => {
    db.prepare('UPDATE ll_transactions SET reversed_satang = ?, status = ? WHERE id = ?').run(decision.newReversedAmount, decision.paymentStatus, original.id);
    db.prepare('UPDATE ll_loans SET outstanding_satang = ?, status = ?, updated_at = ? WHERE id = ?')
      .run(decision.newOutstanding, decision.loanStatus, now(), loan.id);
    return insertTxn({
      type: 'REVERSAL', loanId: loan.id, amount: decision.reversalAmount, originalId: original.id, reference, reason,
      date: today, balanceAfter: decision.newOutstanding, actorId: actor.id,
    });
  });
  return { ok: true, reversal: txnDetail(txnRow(id)), original: txnDetail(txnRow(original.id)), loan: loanView(loanRow(loan.id)) };
}

// ---------- reporting ----------
function listTransactions({ loanId = null, userId = null, type = null, status = null } = {}) {
  const where = [];
  const params = [];
  if (loanId !== null) { where.push('t.loan_id = ?'); params.push(loanId); }
  if (userId !== null) { where.push('a.user_id = ?'); params.push(userId); }
  if (type) { where.push('t.type = ?'); params.push(type); }
  if (status) { where.push('t.status = ?'); params.push(status); }
  return db.prepare(`${TXN_SQL} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY t.id DESC`).all(...params).map(txnView);
}

// ---------- end of day (LL-EOD-03..08) ----------
function runEod() {
  const date = businessDate();
  const next = rules.nextBusinessDay(date);
  const id = atomic(() => {
    // 1) settlement: T+1 for every payment of the day that still has a net amount
    const settled = db.prepare(`UPDATE ll_transactions SET settlement_date = ?
      WHERE type = 'PAYMENT' AND business_date = ? AND settlement_date IS NULL AND amount_satang - reversed_satang > 0`).run(next, date).changes;
    const sum = (type) => db.prepare('SELECT COALESCE(SUM(amount_satang), 0) AS s FROM ll_transactions WHERE type = ? AND business_date = ?').get(type, date).s;
    // 2) reconciliation: ledger versus stored balance for every loan
    const loans = db.prepare(`SELECT l.id, l.loan_no AS loanNo, l.opening_satang AS opening, l.outstanding_satang AS outstanding,
        COALESCE((SELECT SUM(t.amount_satang - t.reversed_satang) FROM ll_transactions t WHERE t.loan_id = l.id AND t.type = 'PAYMENT'), 0) AS netPaid
      FROM ll_loans l ORDER BY l.id`).all();
    const recon = rules.reconcile(loans);
    const runId = Number(db.prepare(`INSERT INTO ll_eod_runs (business_date, next_business_date, settled_count, payments_satang, reversals_satang, status, breaks_json, run_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(date, next, Number(settled), sum('PAYMENT'), sum('REVERSAL'), recon.status, JSON.stringify(recon.breaks), now()).lastInsertRowid);
    // 3) roll the business date
    setBusinessDate(next);
    return runId;
  });
  return eodView(db.prepare('SELECT * FROM ll_eod_runs WHERE id = ?').get(id));
}

const listEodRuns = () => db.prepare('SELECT * FROM ll_eod_runs ORDER BY id DESC').all().map(eodView);

module.exports = {
  businessDate, setBusinessDate, accountRow, loanRow, txnRow, loanView, accountView, txnView, txnDetail,
  listAccounts, createAccount, changeAccountStatus, createLoan, postPayment, reversePayment, listTransactions, runEod, listEodRuns,
};
