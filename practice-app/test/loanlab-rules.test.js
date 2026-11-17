'use strict';
/**
 * Unit tests for the LoanLab payment and reversal rules (REQUIREMENTS-LOANLAB.md: LL-PAY, LL-REV, LL-ACC, LL-EOD).
 * Pure functions, no database and no server — the base of the test pyramid. Amounts are in satang.
 * Run: npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const config = require('../src/config');
const rules = require('../src/loanlab/rules');

const THB = (n) => Math.round(n * 100);
const pay = (over = {}) => rules.decidePayment({ accountStatus: 'ACTIVE', loanStatus: 'ACTIVE', outstanding: THB(10000), amount: THB(1000), ...over });
const payment = (over = {}) => ({ type: 'PAYMENT', status: 'POSTED', amount: THB(1000), reversedAmount: 0, businessDate: '2026-01-05', ...over });
const reverse = (over = {}) => rules.decideReversal({
  actorRole: 'admin', original: payment(), referenceUsed: false, businessDate: '2026-01-05',
  accountStatus: 'ACTIVE', loanStatus: 'ACTIVE', outstanding: THB(9000), amount: null, ...over,
});

test.beforeEach(() => config.reset());

// ---------- amounts (LL-PAY-02, ASM-04) ----------
test('parseAmount accepts numbers with at most 2 decimals and returns satang', () => {
  assert.equal(rules.parseAmount(500), 50000);
  assert.equal(rules.parseAmount(1234.56), 123456);
  assert.equal(rules.parseAmount(0.01), 1);
});

for (const bad of [0, -1, 500.005, '500', null, undefined, NaN, Infinity, 1e12]) {
  test(`parseAmount rejects ${String(bad)}`, () => assert.equal(rules.parseAmount(bad), null));
}

// ---------- payment decision table (LL-PAY-03..08) ----------
test('R1: account that is not ACTIVE cannot pay', () => {
  for (const accountStatus of ['PENDING', 'FROZEN', 'CLOSED']) {
    assert.equal(pay({ accountStatus }).code, 'ACCOUNT_NOT_ACTIVE', accountStatus);
  }
});

test('R2: a closed loan accepts no payment', () => {
  assert.equal(pay({ loanStatus: 'CLOSED', outstanding: 0 }).code, 'LOAN_CLOSED');
});

test('R3: overpayment is rejected', () => {
  const d = pay({ amount: THB(10000.01) });
  assert.deepEqual([d.ok, d.status, d.code], [false, 400, 'OVERPAYMENT']);
});

test('R4: below the minimum is rejected', () => {
  const d = pay({ amount: THB(499.99) });
  assert.deepEqual([d.ok, d.status, d.code], [false, 400, 'BELOW_MINIMUM']);
});

test('R5: partial payment reduces the balance and keeps the loan ACTIVE', () => {
  assert.deepEqual(pay({ amount: THB(500) }), { ok: true, newOutstanding: THB(9500), loanStatus: 'ACTIVE', full: false });
});

test('R6: full payment closes the loan', () => {
  assert.deepEqual(pay({ amount: THB(10000) }), { ok: true, newOutstanding: 0, loanStatus: 'CLOSED', full: true });
});

// Boundary value analysis around the 500.00 minimum and the outstanding balance
for (const [outstanding, amount, expected] of [
  [10000, 499.99, 'BELOW_MINIMUM'], [10000, 500, 'ok'], [10000, 500.01, 'ok'],
  [10000, 9999.99, 'ok'], [10000, 10000, 'ok'], [10000, 10000.01, 'OVERPAYMENT'],
  [500, 499.99, 'BELOW_MINIMUM'], [500, 500, 'ok'],
  [300, 299.99, 'BELOW_MINIMUM'], [300, 300, 'ok'], [300, 300.01, 'OVERPAYMENT'],
]) {
  test(`outstanding ${outstanding}, pay ${amount} -> ${expected}`, () => {
    const d = pay({ outstanding: THB(outstanding), amount: THB(amount) });
    assert.equal(d.ok ? 'ok' : d.code, expected);
  });
}

test('minimum payment is the smaller of 500.00 and the outstanding balance (LL-PAY-06)', () => {
  assert.equal(rules.minimumPayment(THB(10000)), THB(500));
  assert.equal(rules.minimumPayment(THB(500)), THB(500));
  assert.equal(rules.minimumPayment(THB(300)), THB(300));
});

test('a payment may leave a remainder below 500.00, which is then paid off exactly (LL-PAY-07)', () => {
  const first = pay({ outstanding: THB(700), amount: THB(500) });
  assert.equal(first.newOutstanding, THB(200));
  assert.equal(pay({ outstanding: first.newOutstanding, amount: THB(200) }).loanStatus, 'CLOSED');
});

test('check order: account status wins over amount errors (LL-PAY-11)', () => {
  assert.equal(pay({ accountStatus: 'FROZEN', amount: THB(1) }).code, 'ACCOUNT_NOT_ACTIVE');
  assert.equal(pay({ outstanding: THB(300), amount: THB(600) }).code, 'OVERPAYMENT');
});

// ---------- reversal (LL-REV) ----------
test('full reversal restores the balance and marks the payment REVERSED', () => {
  assert.deepEqual(reverse(), {
    ok: true, reversalAmount: THB(1000), newReversedAmount: THB(1000), paymentStatus: 'REVERSED', newOutstanding: THB(10000), loanStatus: 'ACTIVE',
  });
});

test('partial reversal restores only its own amount and marks the payment PARTIALLY_REVERSED', () => {
  const d = reverse({ amount: THB(400) });
  assert.deepEqual([d.reversalAmount, d.newReversedAmount, d.paymentStatus, d.newOutstanding], [THB(400), THB(400), 'PARTIALLY_REVERSED', THB(9400)]);
});

test('a second partial reversal can complete the payment; omitted amount means "what is left"', () => {
  const d = reverse({ original: payment({ status: 'PARTIALLY_REVERSED', reversedAmount: THB(400) }), outstanding: THB(9400) });
  assert.deepEqual([d.reversalAmount, d.paymentStatus, d.newOutstanding], [THB(600), 'REVERSED', THB(10000)]);
});

test('reversal amount above what is left is rejected', () => {
  const d = reverse({ original: payment({ status: 'PARTIALLY_REVERSED', reversedAmount: THB(400) }), amount: THB(600.01) });
  assert.deepEqual([d.status, d.code], [400, 'EXCEEDS_REVERSIBLE_AMOUNT']);
});

test('reversing the pay-off payment reopens a CLOSED loan (LL-LOAN-06)', () => {
  const d = reverse({ loanStatus: 'CLOSED', outstanding: 0 });
  assert.deepEqual([d.loanStatus, d.newOutstanding], ['ACTIVE', THB(1000)]);
});

test('only an officer can reverse', () => {
  const d = reverse({ actorRole: 'customer' });
  assert.deepEqual([d.status, d.code], [403, 'FORBIDDEN']);
});

test('a reversal must reference an existing PAYMENT (LL-REV-02)', () => {
  assert.equal(reverse({ original: null }).code, 'TRANSACTION_NOT_FOUND');
  assert.equal(reverse({ original: payment({ type: 'REVERSAL' }) }).code, 'NOT_REVERSIBLE');
});

test('duplicate reversal is rejected (LL-REV-09)', () => {
  assert.equal(reverse({ referenceUsed: true }).code, 'DUPLICATE_REVERSAL');
  assert.equal(reverse({ original: payment({ status: 'REVERSED', reversedAmount: THB(1000) }) }).code, 'ALREADY_REVERSED');
});

test('reversal is allowed only on the business date of the payment (LL-REV-05)', () => {
  assert.equal(reverse({ businessDate: '2026-01-06' }).code, 'REVERSAL_WINDOW_CLOSED');
});

test('reversal needs an ACTIVE or FROZEN account (LL-REV-06)', () => {
  assert.equal(reverse({ accountStatus: 'FROZEN' }).ok, true);
  assert.equal(reverse({ accountStatus: 'CLOSED' }).code, 'ACCOUNT_NOT_ELIGIBLE');
  assert.equal(reverse({ accountStatus: 'PENDING' }).code, 'ACCOUNT_NOT_ELIGIBLE');
});

// ---------- account state machine (LL-ACC-04, LL-ACC-05) ----------
test('account transitions: every pair that is not allowed is rejected', () => {
  for (const current of rules.ACCOUNT_STATUSES) {
    for (const next of rules.ACCOUNT_STATUSES) {
      const d = rules.decideAccountTransition({ current, next, hasBalance: false });
      assert.equal(d.ok, rules.ACCOUNT_TRANSITIONS[current].includes(next), `${current} -> ${next}`);
    }
  }
  assert.equal(rules.decideAccountTransition({ current: 'ACTIVE', next: 'CLOSED', hasBalance: true }).code, 'ACCOUNT_HAS_BALANCE');
  assert.equal(rules.decideAccountTransition({ current: 'ACTIVE', next: 'DELETED', hasBalance: false }).code, 'VALIDATION_ERROR');
});

// ---------- business dates and reconciliation (LL-EOD) ----------
test('T+1 is the next business day: Friday -> Monday', () => {
  assert.equal(rules.nextBusinessDay('2026-01-05'), '2026-01-06'); // Mon -> Tue
  assert.equal(rules.nextBusinessDay('2026-01-08'), '2026-01-09'); // Thu -> Fri
  assert.equal(rules.nextBusinessDay('2026-01-09'), '2026-01-12'); // Fri -> Mon
  assert.equal(rules.nextBusinessDay('2026-12-31'), '2027-01-01'); // year end, no holiday calendar
});

test('business days are Monday to Friday; malformed dates are not business days', () => {
  assert.equal(rules.isBusinessDay('2026-01-09'), true);
  assert.equal(rules.isBusinessDay('2026-01-10'), false);
  assert.equal(rules.isBusinessDay('2026-01-11'), false);
  assert.equal(rules.isBusinessDay('2026-02-30'), false);
  assert.equal(rules.isBusinessDay('09/01/2026'), false);
});

test('reconciliation: ledger must equal the stored balance exactly', () => {
  const ok = { id: 1, loanNo: 'LN-000001', opening: THB(10000), netPaid: THB(1500), outstanding: THB(8500) };
  const off = { id: 2, loanNo: 'LN-000002', opening: THB(10000), netPaid: THB(1500), outstanding: THB(8500.01) };
  assert.deepEqual(rules.reconcile([ok]), { status: 'BALANCED', breaks: [] });
  assert.deepEqual(rules.reconcile([ok, off]), {
    status: 'OUT_OF_BALANCE', breaks: [{ loanId: 2, loanNo: 'LN-000002', expected: 8500, actual: 8500.01, difference: 0.01 }],
  });
});

// ---------- every seeded defect really changes a decision ----------
test('bug mode really changes behaviour (LL-BUG-01..07, 09..13)', () => {
  config.set({ bugMode: true });
  assert.equal(pay({ amount: THB(500), outstanding: THB(600) }).code, 'BELOW_MINIMUM', 'LL-BUG-01');
  assert.equal(pay({ amount: THB(10000.01) }).ok, true, 'LL-BUG-02');
  assert.equal(pay({ accountStatus: 'FROZEN' }).ok, true, 'LL-BUG-03');
  assert.equal(pay({ outstanding: THB(300), amount: THB(300) }).code, 'BELOW_MINIMUM', 'LL-BUG-04');
  assert.equal(pay({ amount: THB(10000) }).loanStatus, 'ACTIVE', 'LL-BUG-05');
  assert.equal(reverse({ referenceUsed: true, original: payment({ status: 'REVERSED', reversedAmount: THB(1000) }) }).ok, true, 'LL-BUG-06');
  assert.equal(reverse().newOutstanding, THB(9000), 'LL-BUG-07');
  assert.equal(reverse({ actorRole: 'customer' }).ok, true, 'LL-BUG-09');
  assert.equal(reverse({ businessDate: '2026-01-06' }).ok, true, 'LL-BUG-10');
  assert.equal(rules.nextBusinessDay('2026-01-09'), '2026-01-10', 'LL-BUG-11');
  assert.equal(rules.reconcile([{ id: 1, loanNo: 'LN-000001', opening: 100, netPaid: 0, outstanding: 50 }]).status, 'BALANCED', 'LL-BUG-12');
  assert.equal(reverse({ amount: THB(400) }).paymentStatus, 'POSTED', 'LL-BUG-13');
});
