import { test, expect } from '../../src/fixtures/loanlab';
import { ACCOUNT_TRANSITIONS } from '../../src/data/loanlab';
import type { AccountStatus } from '../../src/api/LoanLabApi';
import { schemaValidator, formatErrors } from '../../src/utils/contract';

test.describe('LoanLab security (LL-SEC)', () => {
  test('every LoanLab endpoint needs a login (LL-SEC-01)', async ({ hooks, newLoan }) => {
    const { loan } = await newLoan();
    for (const res of [await hooks.accounts(), await hooks.loan(loan.id), await hooks.pay(loan.id, 500), await hooks.history(loan.id), await hooks.eodRuns()]) {
      expect(res.status(), res.url()).toBe(401);
    }
  });

  test("a customer cannot see or pay another customer's loan (LL-BUG-08 guard)", async ({ newLoan, loanApi, api, newLoanApi }) => {
    const { loan, account } = await newLoan();
    const { transaction } = await loanApi.payOrFail(loan.id, 1000);

    const intruder = await newLoanApi();
    await intruder.loginOrFail(await api.createUser());
    for (const res of [
      await intruder.loan(loan.id), await intruder.account(account.id), await intruder.history(loan.id),
      await intruder.transaction(transaction.id), await intruder.pay(loan.id, 500),
    ]) {
      expect(res.status(), res.url()).toBe(404);
    }
    expect((await (await intruder.accounts()).json()).items).toHaveLength(0);
    expect((await loanApi.loanOrFail(loan.id)).outstanding).toBe(9000);
  });

  test('officer-only operations answer 403 for a customer (LL-SEC-03)', async ({ newLoan, loanApi, freshUser }) => {
    const { account } = await newLoan();
    for (const res of [
      await loanApi.accounts(true),
      await loanApi.openAccount({ username: freshUser.username, holderName: 'Self Service' }),
      await loanApi.setAccountStatus(account.id, 'FROZEN'),
      await loanApi.openLoan({ accountId: account.id, principal: 5000 }),
      await loanApi.eodRuns(),
      await loanApi.eod(),
    ]) {
      expect(res.status(), res.url()).toBe(403);
    }
  });
});

test.describe('LoanLab accounts and loans (LL-ACC, LL-LOAN)', () => {
  test('officer creates an account: validation, PENDING status, contract', async ({ officerApi, freshUser, request }) => {
    const invalid = await officerApi.openAccount({ username: freshUser.username, holderName: 'A' });
    expect(invalid.status()).toBe(400);
    expect((await invalid.json()).error.details).toHaveProperty('holderName');
    expect((await (await officerApi.openAccount({ username: 'no_such_customer', holderName: 'Nobody' })).json()).error.code).toBe('CUSTOMER_NOT_FOUND');

    const res = await officerApi.openAccount({ username: freshUser.username, holderName: '  Fresh Customer  ' });
    expect(res.status()).toBe(201);
    const account = await res.json();
    const validate = await schemaValidator(request, 'LoanAccount');
    expect(validate(account), formatErrors(validate)).toBe(true);
    expect(account).toMatchObject({ status: 'PENDING', holderName: 'Fresh Customer', loans: [] });
    expect(account.accountNo).toMatch(/^LA-\d{6}$/);

    // a loan needs an ACTIVE account (LL-LOAN-01) and a principal within 1,000..1,000,000 (LL-LOAN-02)
    expect((await (await officerApi.openLoan({ accountId: account.id, principal: 5000 })).json()).error.code).toBe('ACCOUNT_NOT_ACTIVE');
    expect((await officerApi.setAccountStatus(account.id, 'ACTIVE')).status()).toBe(200);
    for (const principal of [999.99, 1000000.01, 5000.001]) {
      expect((await officerApi.openLoan({ accountId: account.id, principal })).status(), `principal ${principal}`).toBe(400);
    }
    const loan = await (await officerApi.openLoan({ accountId: account.id, principal: 1000 })).json();
    expect(loan).toMatchObject({ principal: 1000, outstanding: 1000, status: 'ACTIVE' });
    expect(loan.loanNo).toMatch(/^LN-\d{6}$/);
  });

  // State transition testing: from every status, every target that is NOT allowed must answer 409
  for (const from of Object.keys(ACCOUNT_TRANSITIONS) as AccountStatus[]) {
    test(`account state machine from ${from} rejects invalid transitions (LL-ACC-04)`, async ({ hooks, officerApi, freshUser }) => {
      const { account } = await hooks.createAccount(freshUser.username, { accountStatus: from, noLoan: true });
      for (const target of (Object.keys(ACCOUNT_TRANSITIONS) as AccountStatus[]).filter((s) => !ACCOUNT_TRANSITIONS[from].includes(s))) {
        const res = await officerApi.setAccountStatus(account.id, target);
        expect(res.status(), `${from} -> ${target}`).toBe(409);
        expect((await res.json()).error.code).toBe('INVALID_TRANSITION');
      }
      for (const target of ACCOUNT_TRANSITIONS[from].slice(0, 1)) {
        expect((await officerApi.setAccountStatus(account.id, target)).status(), `${from} -> ${target}`).toBe(200);
      }
    });
  }

  test('an account with an outstanding balance cannot be closed (LL-ACC-05)', async ({ newLoan, loanApi, officerApi }) => {
    const { account, loan } = await newLoan({ outstanding: 500 });
    const blocked = await officerApi.setAccountStatus(account.id, 'CLOSED');
    expect(blocked.status()).toBe(409);
    expect((await blocked.json()).error.code).toBe('ACCOUNT_HAS_BALANCE');
    await loanApi.payOrFail(loan.id, 500);
    expect((await (await officerApi.setAccountStatus(account.id, 'CLOSED')).json()).status).toBe('CLOSED');
  });
});
