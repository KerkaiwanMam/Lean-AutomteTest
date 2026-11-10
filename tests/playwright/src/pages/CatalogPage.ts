import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { parseMoney } from '../utils/money';

export class CatalogPage extends BasePage {
  protected readonly path = '/';
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly category: Locator;
  readonly sort: Locator;
  readonly inStockOnly: Locator;
  readonly cards: Locator;
  readonly names: Locator;
  readonly prices: Locator;
  readonly summary: Locator;
  readonly emptyState: Locator;
  readonly loading: Locator;
  readonly error: Locator;
  readonly retry: Locator;
  readonly nextPage: Locator;
  readonly prevPage: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByTestId('search-input');
    this.searchButton = page.getByTestId('search-button');
    this.category = page.getByTestId('category-select');
    this.sort = page.getByTestId('sort-select');
    this.inStockOnly = page.getByTestId('in-stock-checkbox');
    this.cards = page.getByTestId('product-card');
    this.names = page.getByTestId('product-name');
    this.prices = page.getByTestId('product-price');
    this.summary = page.getByTestId('result-summary');
    this.emptyState = page.getByTestId('empty-state');
    this.loading = page.getByTestId('loading');
    this.error = page.getByTestId('catalog-error');
    this.retry = page.getByTestId('retry-button');
    this.nextPage = page.getByTestId('pagination-next');
    this.prevPage = page.getByTestId('pagination-prev');
  }

  /** Wait for the list to finish loading (spinner hidden and summary rendered). */
  async waitForResults(): Promise<void> {
    await this.loading.waitFor({ state: 'hidden' });
    await this.summary.or(this.error).filter({ hasText: /\S/ }).first().waitFor();
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await this.waitForResults();
  }

  async sortBy(value: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'rating_desc' | 'newest'): Promise<void> {
    await this.sort.selectOption(value);
    await this.waitForResults();
  }

  async filterCategory(category: string): Promise<void> {
    await this.category.selectOption(category);
    await this.waitForResults();
  }

  async productNames(): Promise<string[]> {
    return this.names.allInnerTexts();
  }

  async productPrices(): Promise<number[]> {
    return (await this.prices.allInnerTexts()).map(parseMoney);
  }

  cardBySku(sku: string): Locator {
    return this.page.locator(`[data-testid="product-card"][data-sku="${sku}"]`);
  }

  async addToCart(sku: string): Promise<void> {
    await this.cardBySku(sku).getByRole('button', { name: 'Add to cart' }).click();
  }
}
