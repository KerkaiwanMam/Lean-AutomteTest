import { test, expect } from '../../src/fixtures/loanlab';
import { uniqueReference } from '../../src/api/LoanLabApi';

/**
 * LoanLab reversal rules (REQUIREMENTS-LOANLAB.md §4, LL-REV): officer only, must reference the original
 * payment, partial reversal allowed, duplicate rejected. No test here runs EOD — see tests/loanlab-eod.
 */
const REASON = 'Posted to the wrong loan';

test.describe('LoanLab reversal (LL-REV)', () => {
  test('full reversal restores the balance and marks the payment REVERSED (LL-BUG-07 guard)', async ({ newLoan, loanApi, officerApi }) => {
    const { loan } = await newLoan();
    const { transaction } = await loanApi.payOrFail(loan.id, 1500);

    const res = await officerApi.reverse({ originalTransactionId: transaction.id, reference: uniqueReference(), reason: REASON });
    expect(res.status(), await res.text()).toBe(201);
    const body = await res.json();
    expect(body.reversal).toMatchObject({ type: 'REVERSAL', status: 'POSTED', amount: 1500, originalTransactionId: transaction.id, balanceAfter: 10000 });
    expect(body.reversal.ref).toMatch(/^RV-\d{8}-\d{6}$/);
    expect(body.original).toMatchObject({ status: 'REVERSED', reversedAmount: 1500, reversibleAmount: 0 });
    expect(await loanApi.loanOrFail(loan.id)).toMatchObject({ outstanding: 10000, status: 'ACTIVE' });
  });

  test('partial reversals add up: POSTED -> PARTIALLY_REVERSED -> REVERSED (LL-BUG-13 guard)', async ({ newLoan, loanApi, officerApi }) => {
    const { loan } = await newLoan();
    const { transaction } = await loanApi.payOrFail(loan.id, 1000);

    const first = await (await officerApi.reverse({ originalTransactionId: transaction.id, reference: uniqueReference(), reason: REASON, amount: 400 })).json();
    expect(first.original).toMatchObject({ status: 'PARTIALLY_REVERSED', reversedAmount: 400, reversibleAmount: 600 });
    expect(first.loan.outstanding).toBe(9400);

    // more than what is left is rejected and changes nothing
    const tooMuch = await officerApi.reverse({ originalTransactionId: transaction.id, reference: uniqueReference(), reason: REASON, amount: 600.01 });
    expect(tooMuch.status()).toBe(400);
    expect((await tooMuch.json()).error.code).toBe('EXCEEDS_REVERSIBLE_AMOUNT');

    // no amount = everything that is left
    const rest = await (await officerApi.reverse({ originalTransactionId: transaction.id, reference: uniqueReference(), reason: REASON })).json();
    expect(rest.reversal.amount).toBe(600);
    expect(rest.original).toMatchObject({ status: 'REVERSED', reversedAmount: 1000 });
    expect(rest.loan.outstanding).toBe(10000);

    // reporting (LL-RPT-02, LL-RPT-03)
    const detail = await loanApi.transactionOrFail(transaction.id);
    expect(detail.reversals?.map((r) => r.amount)).toEqual([400, 600]);
    const reversals = (await (await loanApi.history(loan.id, { type: 'REVERSAL' })).json()).items;
    expect(reversals).toHaveLength(2);
  });

  test('duplicate reversal is rejected and the balance does not change (LL-BUG-06 guard)', async ({ newLoan, loanApi, officerApi }) => {
    const { loan } = await newLoan();
    const { transaction } = await loanApi.payOrFail(loan.id, 1000);
    const request = { originalTransactionId: transaction.id, reference: uniqueReference(), reason: REASON, amount: 400 };
    expect((await officerApi.reverse(request)).status()).toBe(201);

    // the same request again (same reference) = duplicate
    const again = await officerApi.reverse(request);
    expect(again.status()).toBe(409);
    expect((await again.json()).error.code).toBe('DUPLICATE_REVERSAL');
    expect((await loanApi.loanOrFail(loan.id)).outstanding).toBe(9400);

    // a payment that is already fully reversed cannot be reversed again, even with a new reference
    expect((await officerApi.reverse({ originalTransactionId: transaction.id, reference: uniqueReference(), reason: REASON })).status()).toBe(201);
    const third = await officerApi.reverse({ originalTransactionId: transaction.id, reference: uniqueReference(), reason: REASON });
    expect(third.status()).toBe(409);
    expect((await third.json()).error.code).toBe('ALREADY_REVERSED');
    expect((await loanApi.loanOrFail(loan.id)).outstanding).toBe(10000);
    expect((await (await loanApi.history(loan.id, { type: 'REVERSAL' })).json()).items).toHaveLength(2);
  });

  test('a reversal must reference an existing payment (LL-REV-02)', async ({ newLoan, loanApi, officerApi }) => {
    const { loan } = await newLoan();
    const { transaction } = await loanApi.payOrFail(loan.id, 1000);

    const missing = await officerApi.reverse({ reference: uniqueReference(), reason: REASON });
    expect(missing.status()).toBe(400);
    expect((await missing.json()).error.details).toHaveProperty('originalTransactionId');

    const unknown = await officerApi.reverse({ originalTransactionId: 99999999, reference: uniqueReference(), reason: REASON });
    expect(unknown.status()).toBe(404);
    expect((await unknown.json()).error.code).toBe('TRANSACTION_NOT_FOUND');

    // a reversal cannot itself be reversed
    const done = await (await officerApi.reverse({ originalTransactionId: transaction.id, reference: uniqueReference(), reason: REASON })).json();
    const reverseTheReversal = await officerApi.reverse({ originalTransactionId: done.reversal.id, reference: uniqueReference(), reason: REASON });
    expect(reverseTheReversal.status()).toBe(409);
    expect((await reverseTheReversal.json()).error.code).toBe('NOT_REVERSIBLE');
  });

  test('reference and reason are mandatory (LL-REV-03)', async ({ newLoan, loanApi, officerApi }) => {
    const { loan } = await newLoan();
    const { transaction } = await loanApi.payOrFail(loan.id, 1000);
    const res = await officerApi.reverse({ originalTransactionId: transaction.id, reference: 'no', reason: 'x' });
    expect(res.status()).toBe(400);
    expect(Object.keys((await res.json()).error.details).sort()).toEqual(['reason', 'reference']);
    expect((await loanApi.loanOrFail(loan.id)).outstanding).toBe(9000);
  });

  test('a customer cannot reverse a payment, not even their own (LL-BUG-09 guard)', async ({ newLoan, loanApi }) => {
    const { loan } = await newLoan();
    const { transaction } = await loanApi.payOrFail(loan.id, 1000);
    const res = await loanApi.reverse({ originalTransactionId: transaction.id, reference: uniqueReference(), reason: REASON });
    expect(res.status()).toBe(403);
    expect((await loanApi.loanOrFail(loan.id)).outstanding).toBe(9000);
    expect((await loanApi.transactionOrFail(transaction.id)).status).toBe('POSTED');
  });

  test('reversing the pay-off payment reopens the loan (LL-LOAN-06)', async ({ newLoan, loanApi, officerApi }) => {
    const { loan } = await newLoan({ outstanding: 300 });
    const { transaction, loan: closed } = await loanApi.payOrFail(loan.id, 300);
    expect(closed.status).toBe('CLOSED');
    const body = await (await officerApi.reverse({ originalTransactionId: transaction.id, reference: uniqueReference(), reason: REASON, amount: 100 })).json();
    expect(body.loan).toMatchObject({ outstanding: 100, status: 'ACTIVE', minimumPayment: 100 });
  });

  test('reversal is allowed on a FROZEN account but not on a CLOSED one (LL-REV-06)', async ({ newLoan, loanApi, officerApi }) => {
    const { loan, account } = await newLoan({ outstanding: 500 });
    const { transaction } = await loanApi.payOrFail(loan.id, 500);
    expect((await officerApi.setAccountStatus(account.id, 'FROZEN')).status()).toBe(200);
    expect((await officerApi.reverse({ originalTransactionId: transaction.id, reference: uniqueReference(), reason: REASON, amount: 100 })).status()).toBe(201);

    // pay the 100 back, close the account, then try to reverse again
    expect((await officerApi.setAccountStatus(account.id, 'ACTIVE')).status()).toBe(200);
    await loanApi.payOrFail(loan.id, 100);
    expect((await officerApi.setAccountStatus(account.id, 'CLOSED')).status()).toBe(200);
    const res = await officerApi.reverse({ originalTransactionId: transaction.id, reference: uniqueReference(), reason: REASON, amount: 100 });
    expect(res.status()).toBe(409);
    expect((await res.json()).error.code).toBe('ACCOUNT_NOT_ELIGIBLE');
  });
});
