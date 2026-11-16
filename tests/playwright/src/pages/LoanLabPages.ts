import type { Locator, Page } from '@playwright/test';

/**
 * Page object for the LoanLab pages (/loanlab/*). The pages are small, so one object covers the
 * navigation and the two forms; assertions stay in the tests.
 */
export class LoanLabPages {
  readonly page: Page;
  readonly businessDate: Locator;
  readonly amount: Locator;
  readonly outstanding: Locator;
  readonly minimumPayment: Locator;
  readonly paymentError: Locator;
  readonly paymentSuccess: Locator;

  constructor(page: Page) {
    this.page = page;
    this.businessDate = page.getByTestId('business-date');
    this.amount = page.getByTestId('amount');
    this.outstanding = page.getByTestId('outstanding');
    this.minimumPayment = page.getByTestId('minimum-payment');
    this.paymentError = page.getByTestId('payment-error');
    this.paymentSuccess = page.getByTestId('payment-success');
  }

  async openOverview(): Promise<void> {
    await this.page.goto('/loanlab/');
  }

  async openPayment(loanId: number): Promise<void> {
    await this.page.goto(`/loanlab/payment?loanId=${loanId}`);
  }

  async openTransaction(id: number): Promise<void> {
    await this.page.goto(`/loanlab/transaction?id=${id}`);
  }

  loanRow(loanId: number): Locator {
    return this.page.locator(`[data-testid="loan-row"][data-loan-id="${loanId}"]`);
  }

  async pay(amount: string): Promise<void> {
    await this.amount.fill(amount);
    await this.page.getByTestId('pay-button').click();
  }

  /** Fills the reverse form; the reference field is pre-filled by the page and left as it is. */
  async fillReversal({ amount, reason }: { amount?: string; reason: string }): Promise<void> {
    if (amount !== undefined) await this.page.getByTestId('reverse-amount').fill(amount);
    await this.page.getByTestId('reverse-reason').fill(reason);
  }
}
