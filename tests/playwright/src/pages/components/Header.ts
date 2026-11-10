import { Locator, Page } from '@playwright/test';

/** Component object: the header appears on every page, so it lives outside the page objects. */
export class Header {
  readonly cartCount: Locator;
  readonly username: Locator;
  readonly logoutButton: Locator;
  readonly loginLink: Locator;
  readonly adminLink: Locator;
  readonly bugBanner: Locator;

  constructor(page: Page) {
    this.cartCount = page.getByTestId('cart-count');
    this.username = page.getByTestId('nav-username');
    this.logoutButton = page.getByTestId('nav-logout');
    this.loginLink = page.getByTestId('nav-login');
    this.adminLink = page.getByTestId('nav-admin');
    this.bugBanner = page.getByTestId('bug-banner');
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
