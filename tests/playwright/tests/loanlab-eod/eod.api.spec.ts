import { test, expect } from '../../src/fixtures/loanlab';
import { uniqueReference } from '../../src/api/LoanLabApi';
import { schemaValidator, formatErrors } from '../../src/utils/contract';

/**
 * LoanLab end-of-day (REQUIREMENTS-LOANLAB.md §5, LL-EOD) and the reversal window (LL-REV-05).
 *
 * TEST ISOLATION: the business date and EOD are state of the WHOLE system. These tests therefore
 *   - live in their own Playwright project (`loanlab-eod`) that starts only after `loanlab` has finished,
 *     so no payment-then-reversal test is cut in half by an EOD run, and
 *   - run one after another (serial mode) in this single file.
 * Reconciliation covers every loan in the database, so assertions look at THIS test's loan only.
 */
test.describe.configure({ mode: 'serial' });

const FRIDAY = '2026-01-09';
const MONDAY = '2026-01-12';
const REASON = 'End-of-day test reversal';

test.describe('LoanLab end of day (LL-EOD)', () => {
  test('business date hook accepts Monday-Friday only (LL-EOD-01)', async ({ hooks }) => {
    for (const bad of ['2026-01-10', '2026-01-11', '2026-02-30', '09/01/2026']) {
      expect((await hooks.setBusinessDate(bad)).status(), bad).toBe(400);
    }
    expect((await hooks.setBusinessDate(FRIDAY)).status()).toBe(200);
    expect(await hooks.businessDate()).toBe(FRIDAY);
  });

  test('EOD on a Friday settles T+1 on Monday and rolls the business date (LL-BUG-11 guard)', async ({ hooks, newLoan, loanApi, officerApi, request }) => {
    await hooks.setBusinessDate(FRIDAY);
    const { loan } = await newLoan();
    const kept = (await loanApi.payOrFail(loan.id, 1000)).transaction;
    const partly = (await loanApi.payOrFail(loan.id, 2000)).transaction;
    const undone = (await loanApi.payOrFail(loan.id, 500)).transaction;
    expect(kept.businessDate).toBe(FRIDAY);
    expect((await officerApi.reverse({ originalTransactionId: partly.id, reference: uniqueReference(), reason: REASON, amount: 500 })).status()).toBe(201);
    expect((await officerApi.reverse({ originalTransactionId: undone.id, reference: uniqueReference(), reason: REASON })).status()).toBe(201);

    const run = await hooks.runEod();
    const validate = await schemaValidator(request, 'EodRun');
    expect(validate(run), formatErrors(validate)).toBe(true);
    expect(run).toMatchObject({ businessDate: FRIDAY, nextBusinessDate: MONDAY });
    expect(run.breaks.filter((b) => b.loanId === loan.id)).toEqual([]);
    expect(await hooks.businessDate()).toBe(MONDAY);

    // settlement (LL-EOD-04): net amount > 0 settles on the next business day; a fully reversed payment does not settle
    expect((await loanApi.transactionOrFail(kept.id)).settlementDate).toBe(MONDAY);
    expect((await loanApi.transactionOrFail(partly.id)).settlementDate).toBe(MONDAY);
    expect((await loanApi.transactionOrFail(undone.id)).settlementDate).toBeNull();

    // LL-EOD-02: after the cut-off a new payment belongs to the next business date
    expect((await loanApi.payOrFail(loan.id, 500)).transaction.businessDate).toBe(MONDAY);

    // the officer can read the run (LL-EOD-09)
    const runs = (await (await officerApi.eodRuns()).json()).items;
    expect(runs[0]).toMatchObject({ id: run.id, businessDate: FRIDAY, nextBusinessDate: MONDAY });
  });

  test('a payment cannot be reversed after end-of-day (LL-BUG-10 guard)', async ({ hooks, newLoan, loanApi, officerApi }) => {
    const { loan } = await newLoan();
    const { transaction } = await loanApi.payOrFail(loan.id, 1000);
    await hooks.runEod();

    const res = await officerApi.reverse({ originalTransactionId: transaction.id, reference: uniqueReference(), reason: REASON });
    expect(res.status()).toBe(409);
    expect((await res.json()).error.code).toBe('REVERSAL_WINDOW_CLOSED');
    expect((await loanApi.loanOrFail(loan.id)).outstanding).toBe(9000);
    expect((await loanApi.transactionOrFail(transaction.id)).status).toBe('POSTED');
  });

  test('reconciliation reports a break when ledger and balance differ by 0.01 (LL-BUG-12 guard)', async ({ hooks, newLoan, loanApi }) => {
    const { loan } = await newLoan();
    await loanApi.payOrFail(loan.id, 1000);
    const before = await hooks.businessDate();
    expect((await hooks.forceOutstanding(loan.id, 9000.01)).status()).toBe(200); // fault injection: no ledger entry

    try {
      const run = await hooks.runEod();
      expect(run.status).toBe('OUT_OF_BALANCE');
      expect(run.breaks.filter((b) => b.loanId === loan.id)).toEqual([
        { loanId: loan.id, loanNo: loan.loanNo, expected: 9000, actual: 9000.01, difference: 0.01 },
      ]);
      expect(await hooks.businessDate(), 'EOD finishes and rolls the date even with a break (LL-EOD-06)').not.toBe(before);
    } finally {
      await hooks.forceOutstanding(loan.id, 9000); // leave the shared database balanced for the next test
    }
    const clean = await hooks.runEod();
    expect(clean.breaks.filter((b) => b.loanId === loan.id)).toEqual([]);
  });

  test('officer runs EOD from the account overview page', async ({ hooks, adminPage }) => {
    const before = await hooks.businessDate();
    await adminPage.goto('/loanlab/');
    await expect(adminPage.getByTestId('eod-date')).toHaveText(before);
    await adminPage.getByTestId('run-eod').click();
    await expect(adminPage.getByTestId('eod-message')).toContainText(`EOD for ${before} finished`);
    await expect(adminPage.getByTestId('eod-row').first().getByTestId('eod-business-date')).toHaveText(before);
    await expect(adminPage.getByTestId('business-date')).not.toHaveText(before);
  });
});
