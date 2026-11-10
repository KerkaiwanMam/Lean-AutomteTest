import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Credentials } from '../config/env';

export class LoginPage extends BasePage {
  protected readonly path = '/login';
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly error: Locator;
  readonly usernameError: Locator;
  readonly passwordError: Locator;
  readonly showPassword: Locator;

  constructor(page: Page) {
    super(page);
    // Prefer user-facing locators (label / role). They double as a basic accessibility check.
    this.username = page.getByLabel('Username');
    this.password = page.getByLabel('Password', { exact: true });
    // test id (not role+name) because the button's text changes to "Signing in…" while loading
    this.submit = page.getByTestId('login-button');
    this.error = page.getByTestId('login-error');
    this.usernameError = page.getByTestId('error-username');
    this.passwordError = page.getByTestId('error-password');
    this.showPassword = page.getByLabel('Show password');
  }

  async login({ username, password }: Credentials): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }
}
