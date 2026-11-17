import type { APIRequestContext } from '@playwright/test';
import { test as base, expect } from './test';
import { env } from '../config/env';
import { LoanLabApi, Loan, LoanAccount, LoanSetup } from '../api/LoanLabApi';

type LoanLabFixtures = {
  /** Factory for isolated LoanLab API clients (own cookie jar each) */
  newLoanApi: () => Promise<LoanLabApi>;
  /** Anonymous client — enough for the test hooks (/api/test/loanlab/*) */
  hooks: LoanLabApi;
  /** Logged in as `freshUser`, the customer created for this test only */
  loanApi: LoanLabApi;
  /** Logged in as the seeded admin = back-office officer */
  officerApi: LoanLabApi;
  /** Test-data factory: account + loan for `freshUser` in any state, straight through the test hook */
  newLoan: (setup?: LoanSetup) => Promise<{ account: LoanAccount; loan: Loan }>;
};

/**
 * LoanLab fixtures on top of the ShopLab ones (freshUser, userPage, adminPage ...).
 * Every test gets its own customer and its own loan, so the `loanlab` project can run fully parallel.
 * Tests that touch the SYSTEM-WIDE business date or run EOD live in tests/loanlab-eod (see playwright.config.ts).
 */
export const test = base.extend<LoanLabFixtures>({
  newLoanApi: async ({ playwright }, use) => {
    const contexts: APIRequestContext[] = [];
    await use(async () => {
      const ctx = await playwright.request.newContext({ baseURL: env.baseURL });
      contexts.push(ctx);
      return new LoanLabApi(ctx);
    });
    await Promise.all(contexts.map((c) => c.dispose()));
  },

  hooks: async ({ newLoanApi }, use) => use(await newLoanApi()),

  loanApi: async ({ newLoanApi, freshUser }, use) => {
    const client = await newLoanApi();
    await client.loginOrFail(freshUser);
    await use(client);
  },

  officerApi: async ({ newLoanApi }, use) => {
    const client = await newLoanApi();
    await client.loginOrFail(env.users.admin);
    await use(client);
  },

  newLoan: async ({ hooks, freshUser }, use) => use((setup = {}) => hooks.createAccount(freshUser.username, setup)),
});

export { expect };
