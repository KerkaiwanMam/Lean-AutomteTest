import { test, expect } from '../../src/fixtures/loanlab';
import type { AccountStatus } from '../../src/api/LoanLabApi';
import { schemaValidator, formatErrors } from '../../src/utils/contract';

/**
 * LoanLab payment rules at API level — the decision table of REQUIREMENTS-LOANLAB.md §3 (LL-PAY-03..08).
 * Each row arranges its own account + loan through the test hook, so rows are independent and run in parallel.
 */
type Row = {
  rule: string; note: string; accountStatus: AccountStatus; outstanding: number; amount: number;
  status: number; code?: string; after?: number; loanStatus?: 'ACTIVE' | 'CLOSED';
};

const DECISION_TABLE: Row[] = [
  // R1 — account is not ACTIVE (LL-PAY-03)
  { rule: 'R1', note: 'PENDING account', accountStatus: 'PENDING', outstanding: 10000, amount: 1000, status: 409, code: 'ACCOUNT_NOT_ACTIVE' },
  { rule: 'R1', note: 'FROZEN account (LL-BUG-03 guard)', accountStatus: 'FROZEN', outstanding: 10000, amount: 1000, status: 409, code: 'ACCOUNT_NOT_ACTIVE' },
  { rule: 'R1', note: 'CLOSED account', accountStatus: 'CLOSED', outstanding: 10000, amount: 1000, status: 409, code: 'ACCOUNT_NOT_ACTIVE' },
  // R2 — loan is CLOSED (LL-PAY-04)
  { rule: 'R2', note: 'closed loan', accountStatus: 'ACTIVE', outstanding: 0, amount: 500, status: 409, code: 'LOAN_CLOSED' },
  // R3 — overpayment (LL-PAY-05)
  { rule: 'R3', note: '0.01 above the balance (LL-BUG-02 guard)', accountStatus: 'ACTIVE', outstanding: 10000, amount: 10000.01, status: 400, code: 'OVERPAYMENT' },
  { rule: 'R3', note: 'small balance, 0.01 above', accountStatus: 'ACTIVE', outstanding: 300, amount: 300.01, status: 400, code: 'OVERPAYMENT' },
  // R4 — below the minimum = min(500, outstanding) (LL-PAY-06)
  { rule: 'R4', note: '0.01 below 500', accountStatus: 'ACTIVE', outstanding: 10000, amount: 499.99, status: 400, code: 'BELOW_MINIMUM' },
  { rule: 'R4', note: 'small balance, not the exact pay-off', accountStatus: 'ACTIVE', outstanding: 300, amount: 299.99, status: 400, code: 'BELOW_MINIMUM' },
  // R5 — partial payment (LL-PAY-07)
  { rule: 'R5', note: 'exactly the minimum (LL-BUG-01 guard)', accountStatus: 'ACTIVE', outstanding: 10000, amount: 500, status: 201, after: 9500, loanStatus: 'ACTIVE' },
  { rule: 'R5', note: '0.01 above the minimum', accountStatus: 'ACTIVE', outstanding: 10000, amount: 500.01, status: 201, after: 9499.99, loanStatus: 'ACTIVE' },
  { rule: 'R5', note: '0.01 below the balance', accountStatus: 'ACTIVE', outstanding: 10000, amount: 9999.99, status: 201, after: 0.01, loanStatus: 'ACTIVE' },
  // R6 — full payment closes the loan (LL-PAY-08)
  { rule: 'R6', note: 'full payment (LL-BUG-05 guard)', accountStatus: 'ACTIVE', outstanding: 10000, amount: 10000, status: 201, after: 0, loanStatus: 'CLOSED' },
  { rule: 'R6', note: 'exact pay-off below 500 (LL-BUG-04 guard)', accountStatus: 'ACTIVE', outstanding: 300, amount: 300, status: 201, after: 0, loanStatus: 'CLOSED' },
  { rule: 'R6', note: 'balance equal to the minimum', accountStatus: 'ACTIVE', outstanding: 500, amount: 500, status: 201, after: 0, loanStatus: 'CLOSED' },
];

test.describe('LoanLab payment decision table (LL-PAY)', () => {
  for (const row of DECISION_TABLE) {
    const outcome = row.code ?? `${row.after} left, loan ${row.loanStatus}`;
    test(`${row.rule} ${row.note}: outstanding ${row.outstanding}, pay ${row.amount} -> ${row.status} ${outcome}`, async ({ newLoan, loanApi }) => {
      const { loan } = await newLoan({ accountStatus: row.accountStatus, outstanding: row.outstanding });

      const res = await loanApi.pay(loan.id, row.amount);
      const body = await res.json();
      expect(res.status(), JSON.stringify(body)).toBe(row.status);

      const stored = await loanApi.loanOrFail(loan.id);
      const history = (await (await loanApi.history(loan.id)).json()).items;
      if (row.code) {
        // LL-PAY-10: a rejected payment changes nothing
        expect(body.error.code).toBe(row.code);
        expect(stored.outstanding).toBe(row.outstanding);
        expect(history).toHaveLength(0);
      } else {
        expect(body.loan).toMatchObject({ outstanding: row.after, status: row.loanStatus });
        expect(stored).toMatchObject({ outstanding: row.after, status: row.loanStatus });
        // LL-PAY-09: the payment is recorded as a POSTED transaction with the balance after it
        expect(history).toHaveLength(1);
        expect(history[0]).toMatchObject({ type: 'PAYMENT', status: 'POSTED', amount: row.amount, balanceAfter: row.after, settlementDate: null });
        expect(history[0].ref).toMatch(/^PM-\d{8}-\d{6}$/);
      }
    });
  }
});

test.describe('LoanLab payment — amount format and follow-up rules', () => {
  for (const [name, amount] of [
    ['three decimals', 500.005], ['zero', 0], ['negative', -500], ['text', '500'], ['missing', undefined],
  ] as const) {
    test(`amount ${name} is a validation error (LL-PAY-02)`, async ({ newLoan, loanApi }) => {
      const { loan } = await newLoan();
      const res = await loanApi.pay(loan.id, amount);
      expect(res.status()).toBe(400);
      expect((await res.json()).error).toMatchObject({ code: 'VALIDATION_ERROR', details: { amount: expect.any(String) } });
    });
  }

  test('a payment may leave less than 500, which is then paid off exactly (LL-PAY-07)', async ({ newLoan, loanApi }) => {
    const { loan } = await newLoan({ outstanding: 700 });
    expect((await loanApi.payOrFail(loan.id, 500)).loan).toMatchObject({ outstanding: 200, minimumPayment: 200, status: 'ACTIVE' });
    expect((await loanApi.pay(loan.id, 199.99)).status()).toBe(400);
    expect((await loanApi.payOrFail(loan.id, 200)).loan).toMatchObject({ outstanding: 0, status: 'CLOSED' });
    expect((await (await loanApi.pay(loan.id, 500)).json()).error.code).toBe('LOAN_CLOSED');
  });

  test('check order: OVERPAYMENT is reported before BELOW_MINIMUM (LL-PAY-11)', async ({ newLoan, loanApi }) => {
    const { loan } = await newLoan({ outstanding: 300 });
    expect((await (await loanApi.pay(loan.id, 400)).json()).error.code).toBe('OVERPAYMENT');
  });

  test('payment response and loan match their contracts', async ({ newLoan, loanApi, request }) => {
    const { loan } = await newLoan();
    const body = await loanApi.payOrFail(loan.id, 1234.56);
    const vPayment = await schemaValidator(request, 'PaymentResponse');
    expect(vPayment(body), formatErrors(vPayment)).toBe(true);
    const vLoan = await schemaValidator(request, 'Loan');
    expect(vLoan(await loanApi.loanOrFail(loan.id)), formatErrors(vLoan)).toBe(true);
    expect(body.loan.outstanding).toBe(8765.44);
  });
});
