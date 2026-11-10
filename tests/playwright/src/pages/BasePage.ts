import { Page } from '@playwright/test';
import { Header } from './components/Header';

/**
 * Base page: shared behaviour only. Keep it thin — "god base classes" are a common anti-pattern.
 * Page objects expose intent-revealing actions and locators; assertions stay in the tests
 * (except for small "isLoaded" style checks).
 */
export abstract class BasePage {
  readonly page: Page;
  readonly header: Header;
  protected abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);
  }

  async goto(query = ''): Promise<void> {
    await this.page.goto(`${this.path}${query}`);
  }
}
