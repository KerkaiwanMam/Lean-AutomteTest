import { test, expect } from '../../src/fixtures/test';
import { env } from '../../src/config/env';

test.describe('Authentication (REQ-AUTH)', () => {
  test('customer can log in and log out @smoke', async ({ page, loginPage, freshUser }) => {
    await loginPage.goto();
    await loginPage.login(freshUser);

    await expect(page).toHaveURL('/');
    await expect(loginPage.header.username).toContainText(freshUser.username);

    await loginPage.header.logout();
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.header.loginLink).toBeVisible();
  });

  test('admin is redirected to the back office after login', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(env.users.admin);
    await expect(page).toHaveURL('/admin');
    await expect(page.getByRole('heading', { name: 'Back Office' })).toBeVisible();
  });

  test('required fields are validated on the client', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submit.click();
    await expect(loginPage.usernameError).toHaveText('Username is required');
    await expect(loginPage.passwordError).toHaveText('Password is required');
  });

  // BUG-13: error messages must not reveal whether the account exists (user enumeration)
  for (const [title, username, password] of [
    ['wrong password', 'customer', 'WrongPass1!'],
    ['unknown user', 'nobody_here', 'Passw0rd!'],
  ] as const) {
    test(`generic error message for ${title}`, async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login({ username, password });
      await expect(loginPage.error).toHaveText('Invalid username or password');
    });
  }

  test('locked account cannot log in (BUG-11 guard)', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(env.users.locked);
    await expect(loginPage.error).toContainText('Account is locked');
    await expect(page).toHaveURL(/\/login/);
  });

  test('account is locked after 5 wrong passwords', async ({ loginPage, freshUser }) => {
    await loginPage.goto();
    for (let i = 1; i <= 4; i += 1) {
      await loginPage.login({ username: freshUser.username, password: `wrong-${i}` });
      await expect(loginPage.error).toHaveText('Invalid username or password');
    }
    await loginPage.login({ username: freshUser.username, password: 'wrong-5' });
    await expect(loginPage.error).toContainText('Account is locked');
  });

  test('slow login is handled by auto-waiting, not sleeps', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login({ username: 'slow', password: 'Passw0rd!' });
    await expect(loginPage.submit).toBeDisabled(); // button shows "Signing in…" while waiting
    await expect(page).toHaveURL('/', { timeout: 10_000 });
  });

  test('protected page redirects to login and back', async ({ page, loginPage, freshUser }) => {
    await page.goto('/cart');
    await expect(page).toHaveURL('/login?next=%2Fcart');
    await loginPage.login(freshUser);
    await expect(page).toHaveURL('/cart');
  });

  test('password can be revealed', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.password.fill('Secret123!');
    await expect(loginPage.password).toHaveAttribute('type', 'password');
    await loginPage.showPassword.check();
    await expect(loginPage.password).toHaveAttribute('type', 'text');
  });
});
