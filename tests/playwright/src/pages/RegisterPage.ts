import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type Registration = {
  username: string; email: string; password: string; confirmPassword?: string; fullName: string;
  phone: string; birthDate: string; province: string; gender?: 'male' | 'female' | 'other'; interests?: string[];
  acceptTerms?: boolean; avatarPath?: string;
};

export class RegisterPage extends BasePage {
  protected readonly path = '/register';
  readonly submit: Locator;
  readonly success: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    super(page);
    this.submit = page.getByTestId('register-button');
    this.success = page.getByTestId('register-success');
    this.error = page.getByTestId('register-error');
  }

  fieldError(field: string): Locator {
    return this.page.getByTestId(`error-${field}`);
  }

  async fill(r: Registration): Promise<void> {
    const p = this.page;
    await p.getByTestId('reg-username').fill(r.username);
    await p.getByTestId('reg-email').fill(r.email);
    await p.getByTestId('reg-password').fill(r.password);
    await p.getByTestId('reg-confirm-password').fill(r.confirmPassword ?? r.password);
    await p.getByTestId('reg-fullname').fill(r.fullName);
    await p.getByTestId('reg-phone').fill(r.phone);
    await p.getByTestId('reg-birthdate').fill(r.birthDate);
    if (r.gender) await p.getByRole('radio', { name: new RegExp(`^${r.gender}$`, 'i') }).check();
    await p.getByTestId('reg-province').selectOption(r.province);
    for (const i of r.interests ?? []) await p.getByTestId(`interest-${i}`).check();
    if (r.avatarPath) await p.getByTestId('reg-avatar').setInputFiles(r.avatarPath);
    if (r.acceptTerms ?? true) await p.getByTestId('reg-terms').check();
  }

  async register(r: Registration): Promise<void> {
    await this.fill(r);
    await this.submit.click();
  }
}
