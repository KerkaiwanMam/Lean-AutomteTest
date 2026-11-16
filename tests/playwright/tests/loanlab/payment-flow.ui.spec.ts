import { test, expect } from '../../src/fixtures/loanlab';
import { LoanLabPages } from '../../src/pages/LoanLabPages';

/**
 * LoanLab UI — hybrid flows (Roadmap Ch 8): arrange through the API/test hook, act in the browser,
 * verify in the browser AND through the API. Pages: account overview, payment, history, detail, reverse.
 */
test.describe('LoanLab UI', () => {
  test('customer pays a loan and sees it in the history @smoke', async ({ newLoan, loanApi, userPage }) => {
    const { loan } = await newLoan({ outstanding: 10000 });
    const ll = new LoanLabPages(userPage);

    await ll.openOverview();
    await expect(ll.businessDate).toHaveText(/^\d{4}-\d{2}-\d{2}$/);
    const row = ll.loanRow(loan.id);
    await expect(row.getByTestId('loan-outstanding')).toHaveText('฿10,000.00');
    await row.getByTestId('pay-link').click();

    // rule violation: the server message is shown and nothing is posted
    await expect(ll.minimumPayment).toHaveText('฿500.00');
    await ll.pay('499.99');
    await expect(ll.paymentError).toHaveText('Minimum payment is 500.00 THB');
    await expect(ll.outstanding).toHaveText('฿10,000.00');

    await ll.pay('1500.50');
    await expect(ll.paymentSuccess).toBeVisible();
    await expect(userPage.getByTestId('receipt-ref')).toHaveText(/^PM-\d{8}-\d{6}$/);
    await expect(userPage.getByTestId('receipt-balance')).toHaveText('฿8,499.50');
    await expect(ll.outstanding).toHaveText('฿8,499.50');
    expect((await loanApi.loanOrFail(loan.id)).outstanding).toBe(8499.5); // same answer from the API

    await userPage.getByTestId('view-history').click();
    const txn = userPage.getByTestId('txn-row');
    await expect(txn).toHaveCount(1);
    await expect(txn.getByTestId('txn-amount')).toHaveText('฿1,500.50');
    await expect(txn.getByTestId('txn-status')).toHaveText('POSTED');
    await expect(txn.getByTestId('txn-settlement')).toHaveText('Pending settlement');

    await txn.getByTestId('view-txn').click();
    await expect(userPage.getByTestId('txn-type')).toHaveText('PAYMENT');
    await expect(userPage.getByTestId('txn-reversible-amount')).toHaveText('฿1,500.50');
    await expect(userPage.getByTestId('reverse-link')).toBeHidden(); // officers only
  });

  test('"Pay full balance" closes the loan and the form disappears', async ({ newLoan, userPage }) => {
    const { loan } = await newLoan({ outstanding: 300 });
    const ll = new LoanLabPages(userPage);
    await ll.openPayment(loan.id);
    await userPage.getByTestId('pay-full').click();
    await expect(ll.amount).toHaveValue('300.00');
    await userPage.getByTestId('pay-button').click();
    await expect(userPage.getByTestId('payment-message')).toContainText('fully paid and closed');
    await expect(userPage.getByTestId('loan-status')).toHaveText('CLOSED');
    await expect(userPage.getByTestId('payment-form')).toBeHidden();
  });

  test('payment form validates the amount before calling the API', async ({ newLoan, userPage }) => {
    const { loan } = await newLoan();
    const ll = new LoanLabPages(userPage);
    await ll.openPayment(loan.id);
    await userPage.getByTestId('pay-button').click();
    await expect(userPage.getByTestId('error-amount')).toHaveText('Amount is required');
    await ll.pay('12.345');
    await expect(userPage.getByTestId('error-amount')).toHaveText('Enter an amount greater than 0 with at most 2 decimals');
  });

  test('a FROZEN account cannot pay from the UI', async ({ newLoan, userPage }) => {
    const { loan } = await newLoan({ accountStatus: 'FROZEN' });
    const ll = new LoanLabPages(userPage);
    await ll.openOverview();
    await expect(ll.loanRow(loan.id).getByTestId('pay-unavailable')).toBeVisible();
    await ll.openPayment(loan.id);
    await expect(userPage.getByTestId('payment-unavailable')).toContainText('FROZEN');
    await expect(userPage.getByTestId('payment-form')).toBeHidden();
  });

  test("another customer's loan is not shown (LL-BUG-08 guard)", async ({ userPage, hooks, api }) => {
    const other = await api.createUser();
    const { loan } = await hooks.createAccount(other.username);
    const ll = new LoanLabPages(userPage);
    await ll.openPayment(loan.id);
    await expect(userPage.getByTestId('load-error')).toHaveText('Loan not found');
    await ll.openOverview();
    await expect(userPage.getByTestId('no-accounts')).toBeVisible();
  });

  test('officer reverses part of a payment from the transaction detail', async ({ newLoan, loanApi, adminPage }) => {
    const { loan } = await newLoan();
    const { transaction } = await loanApi.payOrFail(loan.id, 1000);
    const ll = new LoanLabPages(adminPage);

    await ll.openTransaction(transaction.id);
    await adminPage.getByTestId('reverse-link').click();
    await expect(adminPage.getByTestId('reversible-amount')).toHaveText('฿1,000.00');

    // the confirmation is mandatory
    await ll.fillReversal({ amount: '400', reason: 'Customer paid twice' });
    await adminPage.getByTestId('reverse-button').click();
    await expect(adminPage.getByTestId('error-confirm')).toHaveText('Please confirm the reversal');

    await adminPage.getByTestId('reverse-confirm').check();
    await adminPage.getByTestId('reverse-button').click();
    await expect(adminPage.getByTestId('reverse-success')).toBeVisible();
    await expect(adminPage.getByTestId('reversal-amount')).toHaveText('฿400.00');
    await expect(adminPage.getByTestId('new-outstanding')).toHaveText('฿9,400.00');
    await expect(adminPage.getByTestId('original-status')).toHaveText('PARTIALLY_REVERSED');

    await ll.openTransaction(transaction.id);
    await expect(adminPage.getByTestId('txn-status')).toHaveText('PARTIALLY_REVERSED');
    await expect(adminPage.getByTestId('txn-reversible-amount')).toHaveText('฿600.00');
    await expect(adminPage.getByTestId('reversal-row')).toHaveCount(1);
    await expect(adminPage.getByTestId('reversal-reason')).toHaveText('Customer paid twice');
    expect((await loanApi.loanOrFail(loan.id)).outstanding).toBe(9400);
  });

  test('a customer who opens the reverse page gets no form', async ({ newLoan, loanApi, userPage }) => {
    const { loan } = await newLoan();
    const { transaction } = await loanApi.payOrFail(loan.id, 1000);
    await userPage.goto(`/loanlab/reverse?id=${transaction.id}`);
    await expect(userPage.getByTestId('reverse-forbidden')).toBeVisible();
    await expect(userPage.getByTestId('reverse-form')).toBeHidden();
  });

  test('LoanLab pages send an anonymous visitor to the login page and back', async ({ page, freshUser, newLoan }) => {
    await newLoan();
    await page.goto('/loanlab/');
    await expect(page).toHaveURL(/\/login\?next=%2Floanlab%2F$/);
    await page.getByTestId('username').fill(freshUser.username);
    await page.getByTestId('password').fill(freshUser.password);
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL(/\/loanlab\/$/);
    await expect(page.getByTestId('account-card')).toHaveCount(1);
  });
});
