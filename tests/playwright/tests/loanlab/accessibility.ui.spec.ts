import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { test, expect } from '../../src/fixtures/loanlab';

/**
 * LoanLab pages meet the same bar as ShopLab's main pages (REQ-NFR-02):
 * no serious or critical WCAG 2.1 AA violations reported by axe-core.
 */
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function seriousViolations(page: Page) {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  return results.violations
    .filter((v) => ['serious', 'critical'].includes(v.impact ?? ''))
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

test.describe('LoanLab accessibility (axe-core, WCAG 2.1 AA)', () => {
  test('customer pages have no serious or critical violations', async ({ newLoan, loanApi, userPage }) => {
    const { loan } = await newLoan();
    const { transaction } = await loanApi.payOrFail(loan.id, 1000);
    for (const [path, ready] of [
      ['/loanlab/', 'account-card'],
      [`/loanlab/payment?loanId=${loan.id}`, 'payment-form'],
      [`/loanlab/history?loanId=${loan.id}`, 'txn-row'],
      [`/loanlab/transaction?id=${transaction.id}`, 'txn-detail'],
    ] as const) {
      await userPage.goto(path);
      await expect(userPage.getByTestId(ready).first()).toBeVisible();
      expect(await seriousViolations(userPage), path).toEqual([]);
    }
  });

  test('officer pages have no serious or critical violations', async ({ newLoan, loanApi, adminPage }) => {
    const { loan } = await newLoan();
    const { transaction } = await loanApi.payOrFail(loan.id, 1000);
    for (const [path, ready] of [
      ['/loanlab/officer', 'officer-account-row'],
      [`/loanlab/reverse?id=${transaction.id}`, 'reverse-form'],
    ] as const) {
      await adminPage.goto(path);
      await expect(adminPage.getByTestId(ready).first()).toBeVisible();
      expect(await seriousViolations(adminPage), path).toEqual([]);
    }
  });
});
