import { test, expect, Locator, Page } from '@playwright/test';

/**
 * SA2 Part A — the checks for each locator. DO NOT EDIT (learners edit sa2-locators.spec.ts only).
 * Each target is navigated to first; the learner's function returns a Locator (it may hover/click to reveal it).
 */
export type Locate = (page: Page) => Locator | Promise<Locator>;
export type Answers = Record<'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8' | 'A9' | 'A10', Locate>;

export function defineChallenge(title: string, a: Answers): void {
  test.describe(title, () => {
    test('A1 Add to cart button of SKU SPRT-001', async ({ page }) => {
      await page.goto('/?search=Yoga');
      const l = await a.A1(page);
      await expect(l).toHaveCount(1);
      await expect(l).toHaveText('Add to cart');
      await expect(l).toHaveAttribute('data-product-id', '24');
    });

    test('A2 price of "Clean Code"', async ({ page }) => {
      await page.goto('/');
      const l = await a.A2(page);
      await expect(l).toHaveCount(1);
      await expect(l).toHaveText('฿1,001.00');
    });

    test('A3 password field (not the show-password checkbox)', async ({ page }) => {
      await page.goto('/login');
      const l = await a.A3(page);
      await expect(l).toHaveCount(1);
      await expect(l).toHaveAttribute('type', 'password');
      await expect(l).toHaveAttribute('autocomplete', 'current-password');
    });

    test('A4 "Save changes" button with random id/class', async ({ page }) => {
      await page.goto('/lab');
      const l = await a.A4(page);
      await expect(l).toHaveCount(1);
      await l.click();
      await expect(page.locator('#dynamic-clicks')).toHaveText('1');
    });

    test('A5 name input inside the open shadow root', async ({ page }) => {
      await page.goto('/lab');
      const l = await a.A5(page);
      await expect(l).toHaveCount(1);
      await expect(l).toHaveAttribute('placeholder', 'Name inside open shadow');
    });

    test('A6 "Submit inside frame" button in the iframe', async ({ page }) => {
      await page.goto('/lab');
      const l = await a.A6(page);
      await expect(l).toHaveCount(1);
      await expect(l).toHaveText('Submit inside frame');
    });

    test('A7 "Salary" column header', async ({ page }) => {
      await page.goto('/lab');
      const l = await a.A7(page);
      await expect(l).toHaveCount(1);
      await l.click();
      await expect(l).toHaveAttribute('aria-sort', 'ascending');
    });

    test('A8 "Billing" in the Account hover menu', async ({ page }) => {
      await page.goto('/lab');
      const l = await a.A8(page);
      await expect(l).toHaveCount(1);
      await expect(l).toBeVisible();
      await expect(l).toHaveText('Billing');
    });

    test('A9 "Mangosteen" in the custom dropdown', async ({ page }) => {
      await page.goto('/lab');
      const l = await a.A9(page);
      await expect(l).toHaveCount(1);
      await l.click();
      await expect(page.locator('#fruit-value')).toHaveText('Mangosteen');
    });

    test('A10 the whole employees row with ID 3', async ({ page }) => {
      await page.goto('/lab');
      const l = await a.A10(page);
      await expect(l).toHaveCount(1);
      await expect(l).toHaveJSProperty('tagName', 'TR');
      await expect(l).toContainText('Chai Chaiyo');
    });
  });
}
