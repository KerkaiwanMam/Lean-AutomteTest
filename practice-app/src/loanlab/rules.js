'use strict';
/**
 * LoanLab business rules — pure functions, no I/O (the bottom of the test pyramid).
 * Requirements: practice-app/REQUIREMENTS-LOANLAB.md (LL-PAY, LL-REV, LL-ACC, LL-EOD).
 * Unit tests:   practice-app/test/loanlab-rules.test.js
 *
 * Money is handled in SATANG (integer, 1 THB = 100 satang) so that sums and comparisons are exact.
 * LoanLab is fictional training material: none of these rules describes a real bank.
 */
const config = require('../config');

const MIN_PAYMENT = 50000; // 500.00 THB
const MIN_PRINCIPAL = 100000; // 1,000.00 THB
const MAX_PRINCIPAL = 100000000; // 1,000,000.00 THB
const MAX_AMOUNT_THB = 1e9;

const ACCOUNT_STATUSES = ['PENDING', 'ACTIVE', 'FROZEN', 'CLOSED'];
const LOAN_STATUSES = ['ACTIVE', 'CLOSED'];

// Account state machine (LL-ACC-04). Key = current status, value = allowed next statuses.
const ACCOUNT_TRANSITIONS = {
  PENDING: ['ACTIVE'],
  ACTIVE: ['FROZEN', 'CLOSED'],
  FROZEN: ['ACTIVE', 'CLOSED'],
  CLOSED: [],
};

const toThb = (satang) => satang / 100;
const fail = (status, code, message) => ({ ok: false, status, code, message });
const fmt = (satang) => toThb(satang).toFixed(2);

/**
 * LL-PAY-02 / ASM-04: a JSON number, greater than 0, with at most 2 decimal places.
 * @returns {number|null} the amount in satang, or null when the value is not a valid amount
 */
function parseAmount(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > MAX_AMOUNT_THB) return null;
  const satang = Math.round(value * 100);
  if (Math.abs(value * 100 - satang) > 1e-6) return null; // more than 2 decimals
  return satang;
}

/** LL-PAY-06: the smaller of 500.00 and the outstanding balance. */
function minimumPayment(outstanding) {
  if (config.bug('LL-BUG-04')) return MIN_PAYMENT;
  return Math.min(MIN_PAYMENT, outstanding);
}

/**
 * Decide a payment (LL-PAY-03..08). All amounts in satang. Checks run in the order of LL-PAY-11.
 * @param {{accountStatus:string, loanStatus:string, outstanding:number, amount:number}} p
 */
function decidePayment({ accountStatus, loanStatus, outstanding, amount }) {
  const accountOk = accountStatus === 'ACTIVE' || (config.bug('LL-BUG-03') && accountStatus === 'FROZEN');
  if (!accountOk) return fail(409, 'ACCOUNT_NOT_ACTIVE', `Payments are accepted only when the account is ACTIVE (current: ${accountStatus})`);
  if (loanStatus !== 'ACTIVE') return fail(409, 'LOAN_CLOSED', 'This loan is closed and accepts no payments');
  if (amount > outstanding && !config.bug('LL-BUG-02')) {
    return fail(400, 'OVERPAYMENT', `Amount exceeds the outstanding balance of ${fmt(outstanding)} THB`);
  }
  const minimum = minimumPayment(outstanding);
  const belowMinimum = config.bug('LL-BUG-01') && minimum === MIN_PAYMENT ? amount <= minimum : amount < minimum;
  if (belowMinimum) return fail(400, 'BELOW_MINIMUM', `Minimum payment is ${fmt(minimum)} THB`);

  const newOutstanding = Math.max(0, outstanding - amount);
  const closes = newOutstanding === 0 && !config.bug('LL-BUG-05');
  return { ok: true, newOutstanding, loanStatus: closes ? 'CLOSED' : 'ACTIVE', full: newOutstanding === 0 };
}

/**
 * Decide a reversal (LL-REV-01..09). Amounts in satang. Checks run in the order of LL-REV-10.
 * @param {object} p
 * @param {string} p.actorRole            role of the logged-in user
 * @param {object|null} p.original        { type, status, amount, reversedAmount, businessDate }
 * @param {boolean} p.referenceUsed       true when the request reference was used by an earlier reversal
 * @param {string} p.businessDate         current system business date
 * @param {string} p.accountStatus
 * @param {string} p.loanStatus
 * @param {number} p.outstanding
 * @param {number|null} p.amount          requested amount, or null for "everything that is left"
 */
function decideReversal({ actorRole, original, referenceUsed, businessDate, accountStatus, loanStatus, outstanding, amount = null }) {
  if (actorRole !== 'admin' && !config.bug('LL-BUG-09')) return fail(403, 'FORBIDDEN', 'Only an officer can reverse a payment');
  if (!original) return fail(404, 'TRANSACTION_NOT_FOUND', 'Original transaction not found');
  if (original.type !== 'PAYMENT') return fail(409, 'NOT_REVERSIBLE', 'Only a payment can be reversed');

  const duplicateAllowed = config.bug('LL-BUG-06');
  if (referenceUsed && !duplicateAllowed) return fail(409, 'DUPLICATE_REVERSAL', 'This reversal reference has already been processed');
  const remaining = original.amount - original.reversedAmount;
  if (remaining <= 0 && !duplicateAllowed) return fail(409, 'ALREADY_REVERSED', 'This payment has already been fully reversed');
  if (original.businessDate !== businessDate && !config.bug('LL-BUG-10')) {
    return fail(409, 'REVERSAL_WINDOW_CLOSED', `A payment can be reversed only on its own business date (${original.businessDate})`);
  }
  if (!['ACTIVE', 'FROZEN'].includes(accountStatus)) {
    return fail(409, 'ACCOUNT_NOT_ELIGIBLE', `Reversal is not allowed when the account is ${accountStatus}`);
  }
  // LL-BUG-06 replays the request against the original amount instead of what is left
  const reversalAmount = amount === null ? (remaining > 0 ? remaining : original.amount) : amount;
  if (reversalAmount > remaining && !duplicateAllowed) {
    return fail(400, 'EXCEEDS_REVERSIBLE_AMOUNT', `Only ${fmt(remaining)} THB of this payment can still be reversed`);
  }

  const newReversedAmount = original.reversedAmount + reversalAmount;
  let paymentStatus = newReversedAmount >= original.amount ? 'REVERSED' : 'PARTIALLY_REVERSED';
  if (paymentStatus === 'PARTIALLY_REVERSED' && config.bug('LL-BUG-13')) paymentStatus = original.status;
  const restores = !config.bug('LL-BUG-07');
  return {
    ok: true,
    reversalAmount,
    newReversedAmount,
    paymentStatus,
    newOutstanding: restores ? outstanding + reversalAmount : outstanding,
    loanStatus: restores ? 'ACTIVE' : loanStatus,
  };
}

/** LL-ACC-04 / LL-ACC-05. `hasBalance` = some loan of the account still has an outstanding balance. */
function decideAccountTransition({ current, next, hasBalance }) {
  if (!ACCOUNT_STATUSES.includes(next)) return fail(400, 'VALIDATION_ERROR', `status must be one of ${ACCOUNT_STATUSES.join(', ')}`);
  if (!ACCOUNT_TRANSITIONS[current].includes(next)) return fail(409, 'INVALID_TRANSITION', `Account cannot go from ${current} to ${next}`);
  if (next === 'CLOSED' && hasBalance) return fail(409, 'ACCOUNT_HAS_BALANCE', 'An account with an outstanding loan balance cannot be closed');
  return { ok: true };
}

// ---------- business dates (LL-EOD-01, LL-EOD-04, LL-EOD-07) ----------
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(s) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return null;
  const d = new Date(`${s}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s ? null : d;
}

/** Monday–Friday; LoanLab has no holiday calendar. */
function isBusinessDay(s) {
  const d = parseDate(s);
  if (!d) return false;
  const day = d.getUTCDay();
  return day >= 1 && day <= 5;
}

/** T+1: the next business day after `s` (Friday → Monday). */
function nextBusinessDay(s) {
  const d = parseDate(s);
  if (!d) throw new Error('INVALID_DATE');
  do {
    d.setUTCDate(d.getUTCDate() + 1);
  } while (!config.bug('LL-BUG-11') && (d.getUTCDay() === 0 || d.getUTCDay() === 6));
  return d.toISOString().slice(0, 10);
}

/**
 * LL-EOD-05 / LL-EOD-06: ledger versus stored balance, zero tolerance.
 * @param {Array<{id:number, loanNo:string, opening:number, outstanding:number, netPaid:number}>} loans (satang)
 */
function reconcile(loans) {
  const breaks = [];
  for (const l of loans) {
    const expected = l.opening - l.netPaid;
    if (expected !== l.outstanding) {
      breaks.push({ loanId: l.id, loanNo: l.loanNo, expected: toThb(expected), actual: toThb(l.outstanding), difference: toThb(l.outstanding - expected) });
    }
  }
  if (config.bug('LL-BUG-12')) return { status: 'BALANCED', breaks: [] };
  return { status: breaks.length ? 'OUT_OF_BALANCE' : 'BALANCED', breaks };
}

module.exports = {
  parseAmount, minimumPayment, decidePayment, decideReversal, decideAccountTransition,
  isBusinessDay, nextBusinessDay, reconcile, toThb,
  MIN_PAYMENT, MIN_PRINCIPAL, MAX_PRINCIPAL, ACCOUNT_STATUSES, LOAN_STATUSES, ACCOUNT_TRANSITIONS,
};
