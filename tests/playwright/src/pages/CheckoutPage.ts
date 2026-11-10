import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import type { Address, Card } from '../api/ShopLabApi';

export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout';
  readonly toPayment: Locator;
  readonly toReview: Locator;
  readonly placeOrder: Locator;
  readonly orderNumber: Locator;
  readonly orderStatus: Locator;
  readonly error: Locator;
  readonly currentStep: Locator;

  constructor(page: Page) {
    super(page);
    this.toPayment = page.getByTestId('to-payment');
    this.toReview = page.getByTestId('to-review');
    this.placeOrder = page.getByTestId('place-order');
    this.orderNumber = page.getByTestId('order-number');
    this.orderStatus = page.getByTestId('order-status');
    this.error = page.getByTestId('checkout-error');
    this.currentStep = page.locator('.steps li[aria-current="step"]');
  }

  fieldError(field: string): Locator {
    return this.page.getByTestId(`error-${field}`);
  }

  async fillAddress(a: Address): Promise<void> {
    await this.page.getByLabel('Full name').fill(a.fullName);
    await this.page.getByLabel('Phone').fill(a.phone);
    await this.page.getByLabel('Address').fill(a.line1);
    await this.page.getByLabel('District').fill(a.district);
    await this.page.getByLabel('Province').fill(a.province);
    await this.page.getByLabel('Postcode').fill(a.postcode);
    await this.toPayment.click();
  }

  async payByCard(c: Card): Promise<void> {
    await this.page.getByLabel('Credit / debit card').check();
    await this.page.getByLabel('Card number').fill(c.number);
    await this.page.getByLabel('Expiry (MM/YY)').fill(c.expiry);
    await this.page.getByLabel('CVV').fill(c.cvv);
    await this.page.getByLabel('Name on card').fill(c.name);
    await this.toReview.click();
  }

  async payByCod(): Promise<void> {
    await this.page.getByLabel(/Cash on delivery/).check();
    await this.toReview.click();
  }

  async confirm(): Promise<void> {
    await this.placeOrder.click();
  }
}
