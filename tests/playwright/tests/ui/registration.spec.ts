import { test, expect } from '../../src/fixtures/test';
import { birthDateForAge } from '../../src/data/testData';
import type { Registration } from '../../src/pages/RegisterPage';

// 1x1 transparent PNG — generated in memory, no fixture file needed
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

const unique = () => `u${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`.slice(0, 20);
const validUser = (overrides: Partial<Registration> = {}): Registration => {
  const username = unique();
  return {
    username, email: `${username}@example.test`, password: 'Str0ng!Pass', fullName: 'New Tester', phone: '0891234567',
    birthDate: birthDateForAge(30), province: 'Chiang Mai', gender: 'female', interests: ['books', 'sports'], ...overrides,
  };
};

test.describe('Registration (REQ-REG)', () => {
  test('new customer registers with an avatar and can log in @smoke', async ({ page, registerPage, loginPage }) => {
    const user = validUser();
    await registerPage.goto();
    await registerPage.fill(user);
    await page.getByTestId('reg-avatar').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: PNG });
    await expect(page.getByTestId('avatar-preview')).toBeVisible();
    await registerPage.submit.click();

    await expect(registerPage.success).toContainText(`Account ${user.username} created`);
    await page.getByTestId('go-to-login').click();
    await loginPage.login({ username: user.username, password: user.password });
    await expect(loginPage.header.username).toContainText(user.username);
  });

  test('empty form shows every required-field error', async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.submit.click();
    for (const field of ['username', 'email', 'password', 'fullName', 'phone', 'birthDate', 'province', 'acceptTerms']) {
      await expect(registerPage.fieldError(field), `error for ${field}`).not.toBeEmpty();
    }
  });

  test('password confirmation must match', async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.register(validUser({ confirmPassword: 'Different1!' }));
    await expect(registerPage.fieldError('confirmPassword')).toHaveText('Passwords do not match');
  });

  test('user younger than 18 is rejected by the server (BUG-06 guard)', async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.register(validUser({ birthDate: birthDateForAge(18, 1) })); // turns 18 tomorrow
    await expect(registerPage.fieldError('birthDate')).toHaveText('Age must be between 18 and 60');
    await expect(registerPage.success).toBeHidden();
  });

  test('duplicate username is rejected', async ({ registerPage }) => {
    await registerPage.goto();
    await registerPage.register(validUser({ username: 'customer' }));
    await expect(registerPage.fieldError('username')).toHaveText('Username is already taken');
  });

  test('non-image avatar is rejected on the client', async ({ page, registerPage }) => {
    await registerPage.goto();
    await page.getByTestId('reg-avatar').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
    await expect(registerPage.fieldError('avatar')).toHaveText('Avatar must be PNG or JPEG');
  });
});

test.describe('Product reviews', () => {
  test('review text is shown as plain text, not HTML (BUG-09 guard)', async ({ userPage: page }) => {
    await page.goto('/product?id=1');
    const payload = '<img src=x onerror="window.__xss=1"><b>bold</b>';
    await page.getByLabel('Comment').fill(payload);
    await page.getByTestId('review-submit').click();
    await expect(page.getByTestId('review-text').last()).toHaveText(payload);
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
  });
});
