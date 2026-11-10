import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { parseMoney } from '../utils/money';

export type Summary = { subtotal: number; discount: number; shipping: number; vat: number; total: number };

export class CartPage extends BasePage {
  protected readonly path = '/cart';
  readonly rows: Locator;
  readonly empty: Locator;
  readonly couponInput: Locator;
  readonly applyCoupon: Locator;
  readonly couponMessage: Locator;
  readonly express: Locator;
  readonly standard: Locator;
  readonly checkoutButton: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.getByTestId('cart-row');
    this.empty = page.getByTestId('cart-empty');
    this.couponInput = page.getByLabel('Coupon code');
    this.applyCoupon = page.getByTestId('apply-coupon');
    this.couponMessage = page.getByTestId('coupon-message');
    this.express = page.getByTestId('shipping-express');
    this.standard = page.getByTestId('shipping-standard');
    this.checkoutButton = page.getByTestId('checkout-button');
    this.total = page.getByTestId('summary-total');
  }

  row(sku: string): Locator {
    return this.page.locator(`[data-testid="cart-row"][data-sku="${sku}"]`);
  }

  async applyCouponCode(code: string): Promise<void> {
    await this.couponInput.fill(code);
    const quote = this.page.waitForResponse((r) => r.url().endsWith('/api/cart/quote'));
    await this.applyCoupon.click();
    await quote;
  }

  async chooseShipping(method: 'standard' | 'express'): Promise<void> {
    const quote = this.page.waitForResponse((r) => r.url().endsWith('/api/cart/quote'));
    await (method === 'express' ? this.express : this.standard).check();
    await quote;
  }

  async setQuantity(sku: string, qty: number): Promise<void> {
    const input = this.page.locator(`[data-testid="cart-row"][data-sku="${sku}"]`).getByTestId('cart-item-qty');
    const done = this.page.waitForResponse((r) => r.url().includes('/api/cart/items/') && r.request().method() === 'PATCH');
    await input.fill(String(qty));
    await input.press('Tab'); // triggers "change"
    await done;
  }

  async remove(sku: string): Promise<void> {
    await this.page.locator(`[data-testid="cart-row"][data-sku="${sku}"]`).getByTestId('remove-item').click();
  }

  async summary(): Promise<Summary> {
    await expect(this.total).not.toHaveText('-'); // quote has been rendered
    const read = async (id: string) => parseMoney(await this.page.getByTestId(`summary-${id}`).innerText());
    return {
      subtotal: await read('subtotal'),
      discount: Math.abs(await read('discount')),
      shipping: await read('shipping'),
      vat: await read('vat'),
      total: await read('total'),
    };
  }
}
