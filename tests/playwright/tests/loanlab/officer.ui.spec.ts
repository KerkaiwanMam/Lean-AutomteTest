import { test, expect } from '../../src/fixtures/loanlab';

/**
 * LoanLab back office (REQUIREMENTS-LOANLAB.md LL-RPT-06): create an account, walk it through the
 * account state machine and open a loan — in the browser, checked again through the API.
 * The accounts table lists EVERY customer (parallel tests add rows), so rows are located by account id.
 */
test.describe('LoanLab back office UI', () => {
  test('officer creates an account, activates it and opens a loan', async ({ adminPage, freshUser, loanApi }) => {
    await adminPage.goto('/loanlab/officer');
    await expect(adminPage.getByTestId('nav-officer')).toHaveAttribute('aria-current', 'page');

    // client-side validation first
    await adminPage.getByTestId('create-account').click();
    await expect(adminPage.getByTestId('error-username')).toHaveText('Customer username is required');

    // the server decides whether the customer exists
    await adminPage.getByTestId('account-username').fill('no_such_customer');
    await adminPage.getByTestId('account-holder').fill('Nobody Here');
    await adminPage.getByTestId('create-account').click();
    await expect(adminPage.getByTestId('account-error')).toHaveText('Customer not found');

    await adminPage.getByTestId('account-username').fill(freshUser.username);
    await adminPage.getByTestId('account-holder').fill('Back Office Customer');
    await adminPage.getByTestId('create-account').click();
    await expect(adminPage.getByTestId('officer-message')).toContainText('created with status PENDING');

    const [account] = (await (await loanApi.accounts()).json()).items;
    expect(account).toMatchObject({ status: 'PENDING', holderName: 'Back Office Customer', loans: [] });
    const row = adminPage.locator(`[data-testid="officer-account-row"][data-account-id="${account.id}"]`);
    await expect(row.getByTestId('officer-account-status')).toHaveText('PENDING');

    // a PENDING account offers only ACTIVE (LL-ACC-04) and cannot get a loan yet (LL-LOAN-01)
    await expect(row.getByTestId('status-select').locator('option')).toHaveText(['ACTIVE']);
    await expect(adminPage.getByTestId('loan-account').locator(`option[value="${account.id}"]`)).toHaveCount(0);
    await row.getByTestId('apply-status').click();
    await expect(row.getByTestId('officer-account-status')).toHaveText('ACTIVE');
    await expect(row.getByTestId('status-select').locator('option')).toHaveText(['FROZEN', 'CLOSED']);

    // open a loan; principal boundaries are checked before the request is sent (LL-LOAN-02)
    await adminPage.getByTestId('loan-account').selectOption(String(account.id));
    await adminPage.getByTestId('loan-principal').fill('999.99');
    await adminPage.getByTestId('open-loan').click();
    await expect(adminPage.getByTestId('error-principal')).toHaveText('Principal must be between 1,000.00 and 1,000,000.00');
    await adminPage.getByTestId('loan-principal').fill('25000');
    await adminPage.getByTestId('open-loan').click();
    await expect(adminPage.getByTestId('officer-message')).toContainText('with ฿25,000.00 outstanding');
    await expect(row.getByTestId('officer-account-loans')).toHaveText('1');

    // the customer sees the new loan through the API
    const [after] = (await (await loanApi.accounts()).json()).items;
    expect(after.status).toBe('ACTIVE');
    expect(after.loans).toEqual([expect.objectContaining({ principal: 25000, outstanding: 25000, status: 'ACTIVE' })]);
  });

  test('closing an account with a balance is refused and shown (LL-ACC-05)', async ({ adminPage, newLoan }) => {
    const { account } = await newLoan({ outstanding: 500 });
    await adminPage.goto('/loanlab/officer');
    const row = adminPage.locator(`[data-testid="officer-account-row"][data-account-id="${account.id}"]`);
    await row.getByTestId('status-select').selectOption('CLOSED');
    await row.getByTestId('apply-status').click();
    await expect(adminPage.getByTestId('officer-message')).toHaveText('An account with an outstanding loan balance cannot be closed');
    await expect(row.getByTestId('officer-account-status')).toHaveText('ACTIVE');
  });

  test('a customer gets no back office: no link, no data', async ({ userPage, newLoan }) => {
    await newLoan();
    await userPage.goto('/loanlab/');
    await expect(userPage.getByTestId('account-card')).toHaveCount(1);
    await expect(userPage.getByTestId('nav-officer')).toHaveCount(0);
    await userPage.goto('/loanlab/officer');
    await expect(userPage.getByTestId('officer-forbidden')).toBeVisible();
    await expect(userPage.getByTestId('officer-accounts-table')).toBeHidden();
  });
});
