import { test, expect, Page } from '@playwright/test';

/**
 * LAB 15.4 — Refactor kata (learner file).
 *
 * This file is GREEN but badly written. Your job: refactor it into a clean suite that is still green
 * and tests the same behaviour. Use the 8 framework smells in M15 §7 and the review checklist in
 * docs/templates/framework-review-checklist.md.
 *
 *   npx playwright test tests/exercises/bad-checkout.spec.ts --project=exercises      (must pass before AND after)
 *   (PowerShell: $env:EXERCISES="1"; npx playwright test ...)
 *
 * Rules: keep the three behaviours; you may add files (pages, fixtures, data builders); you may NOT delete a
 * check, and you must add the checks that are missing. Do not look at the instructor key before you try.
 */

async function doClick(page: Page, selector: string) {
  await page.locator(selector).click();
}

let orderNumber = '';

test.describe.configure({ mode: 'serial' });

test.describe('checkout stuff', () => {
  test('test1', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(1000);
    await page.locator('#username').fill('jane');
    await page.locator('#password').fill('Passw0rd!');
    await page.locator('//*[@id="login-button"]').click();
    await page.waitForTimeout(2000);

    await page.request.delete('http://localhost:3000/api/cart');

    await page.goto('http://localhost:3000/?search=Yoga');
    await page.waitForTimeout(2000);
    await page.locator('(//button[text()="Add to cart"])[1]').click();
    await page.waitForTimeout(1000);

    await page.goto('http://localhost:3000/cart');
    await page.waitForTimeout(2000);
    const total = await page.locator('[data-testid="summary-total"]').innerText();
    expect(total).toBe('฿791.80');
    await doClick(page, '[data-testid="checkout-button"]');
    await page.waitForTimeout(1000);

    await page.locator('#fullName').fill('Jane Doe');
    await page.locator('#phone').fill('0898765432');
    await page.locator('#line1').fill('99 Sukhumvit Rd');
    await page.locator('#district').fill('Watthana');
    await page.locator('#province').fill('Bangkok');
    await page.locator('#postcode').fill('10110');
    await doClick(page, '[data-testid="to-payment"]');
    await page.waitForTimeout(500);

    await page.locator('#cardNumber').fill('4242424242424242');
    await page.locator('#cardExpiry').fill('1230');
    await page.locator('#cardCvv').fill('123');
    await page.locator('#cardName').fill('JANE DOE');
    await doClick(page, '[data-testid="to-review"]');
    await page.waitForTimeout(1500);

    await doClick(page, '[data-testid="place-order"]');
    await page.waitForTimeout(3000);
    orderNumber = await page.locator('#order-number').innerText();
    console.log('order is', orderNumber);
  });

  test('test2', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(1000);
    await page.locator('#username').fill('jane');
    await page.locator('#password').fill('Passw0rd!');
    await page.locator('//*[@id="login-button"]').click();
    await page.waitForTimeout(2000);

    await page.goto('http://localhost:3000/orders');
    await page.waitForTimeout(2000);
    const rows = await page.locator('[data-testid="order-row"]').count();
    let found = false;
    for (let i = 0; i < rows; i++) {
      const t = await page.locator('[data-testid="order-no"]').nth(i).innerText();
      if (t === orderNumber) {
        found = true;
      }
    }
    expect(found).toBe(true);
  });

  test('test3', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(1000);
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('Admin123!');
    await page.locator('//*[@id="login-button"]').click();
    await page.waitForTimeout(2000);

    await page.locator('//button[@id="tab-orders"]').click();
    await page.waitForTimeout(1000);
    await page.locator('//button[@id="tab-users"]').click();
    await page.waitForTimeout(1000);
    await page.locator('//button[@id="tab-dashboard"]').click();
    console.log('admin looked at stuff');
  });
});
