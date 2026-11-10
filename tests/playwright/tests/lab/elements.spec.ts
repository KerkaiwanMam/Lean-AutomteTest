import { test, expect } from '../../src/fixtures/test';

/**
 * Elements Lab — techniques for "hard" UI. The lab has few data-testids on purpose:
 * we locate by role, label, text and (only when needed) CSS.
 */
test.describe('Elements Lab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lab');
  });

  test('JavaScript dialogs: alert, confirm, prompt', async ({ page }) => {
    const result = page.locator('#dialog-result');

    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Show alert' }).click();
    await expect(result).toHaveText('alert closed');

    page.once('dialog', (d) => d.dismiss());
    await page.getByRole('button', { name: 'Show confirm' }).click();
    await expect(result).toHaveText('dismissed');

    page.once('dialog', async (d) => {
      expect(d.type()).toBe('prompt');
      expect(d.defaultValue()).toBe('Tester');
      await d.accept('Playwright');
    });
    await page.getByRole('button', { name: 'Show prompt' }).click();
    await expect(result).toHaveText('Hello, Playwright');
  });

  test('dynamic loading — web-first assertions wait for us', async ({ page }) => {
    await page.getByRole('button', { name: 'Start', exact: true }).click();
    await expect(page.getByRole('progressbar', { name: 'Loading' })).toBeVisible();
    await expect(page.getByText('Hello World! Content loaded.')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'I am enabled now' })).toBeEnabled({ timeout: 5_000 });
    await expect(page.locator('#appeared')).toHaveText('I have appeared!');
    await page.getByRole('button', { name: 'Click to remove me' }).click();
    await expect(page.getByRole('button', { name: 'Click to remove me' })).toHaveCount(0);
  });

  test('progress bar reaches 100%', async ({ page }) => {
    await page.getByRole('button', { name: 'Start progress' }).click();
    await expect(page.getByRole('progressbar', { name: 'Upload progress' })).toHaveAttribute('aria-valuenow', '100');
    await expect(page.locator('#progress-text')).toHaveText('Complete!');
  });

  test('dynamic ids — locate by role and placeholder, never by generated id', async ({ page }) => {
    const card = page.locator('#dynamic-ids');
    await card.getByRole('button', { name: 'Save changes' }).click();
    await card.getByRole('button', { name: 'Save changes' }).click();
    await expect(card.locator('#dynamic-clicks')).toHaveText('2');
    await card.getByPlaceholder('Type your nickname').fill('QA Ninja');
    await expect(card.getByRole('textbox', { name: 'Nickname' })).toHaveValue('QA Ninja');
  });

  test('iframe and nested iframe', async ({ page }) => {
    const frame = page.frameLocator('#payment-frame');
    await frame.getByLabel('Card holder (inside iframe)').fill('Jane Tester');
    await frame.getByRole('button', { name: 'Submit inside frame' }).click();
    await expect(frame.getByRole('status')).toHaveText('Submitted: Jane Tester');
    await expect(page.locator('#frame-message')).toHaveText('Frame submitted for Jane Tester');

    const nested = frame.frameLocator('iframe[title="Nested frame"]');
    await nested.getByRole('button', { name: 'Click (nested frame)' }).click();
    await expect(nested.locator('#inner-out')).toHaveText('Nested frame clicked');
  });

  test('new tab and popup window', async ({ page, context }) => {
    const [tab] = await Promise.all([context.waitForEvent('page'), page.getByRole('link', { name: 'Open in new tab' }).click()]);
    await expect(tab.getByRole('heading', { level: 1 })).toHaveText('This is a new window');
    await expect(tab.locator('#window-kind')).toHaveText('Opened in a new tab');
    await tab.close();

    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Open popup' }).click();
    const popup = await popupPromise;
    await expect(popup.locator('#window-kind')).toHaveText('Opened as a popup');
  });

  test('hover menu, right-click and double-click', async ({ page }) => {
    await page.getByRole('button', { name: 'Account ▾' }).hover();
    await page.getByRole('menuitem', { name: 'Settings' }).click();
    await expect(page.locator('#mouse-result')).toHaveText('menu: Settings');
    // the hover menu stays open while the mouse is over it and would intercept the next click
    await page.getByRole('heading', { name: 'Elements Lab' }).hover();

    await page.getByRole('button', { name: 'Right-click me' }).click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Paste' }).click();
    await expect(page.locator('#mouse-result')).toHaveText('context: Paste');

    await page.getByRole('button', { name: 'Double-click me' }).dblclick();
    await expect(page.locator('#mouse-result')).toHaveText('double-clicked');
  });

  test('open shadow DOM is pierced automatically', async ({ page }) => {
    const host = page.locator('#open-shadow');
    await host.getByPlaceholder('Name inside open shadow').fill('Shadow Tester');
    await host.getByRole('button', { name: 'Greet' }).click();
    await expect(host.getByRole('status')).toHaveText('Hello, Shadow Tester!');
    // closed shadow roots are not reachable by locators
    await expect(page.locator('#closed-shadow').getByRole('button')).toHaveCount(0);
  });

  test('drag and drop between columns', async ({ page }) => {
    await page.getByText('Automate login').dragTo(page.getByTestId('col-done'));
    await expect(page.getByTestId('col-done')).toContainText('Automate login');
    await expect(page.locator('#done-count')).toHaveText('1');
  });

  test('custom dropdown, slider, autocomplete, switch', async ({ page }) => {
    await page.locator('#fruit-trigger').click();
    await page.getByRole('option', { name: 'Durian' }).click();
    await expect(page.locator('#fruit-value')).toHaveText('Durian');

    await page.getByLabel(/^Volume/).fill('80');
    await expect(page.locator('#volume-out')).toHaveText('80');

    await page.getByRole('combobox', { name: 'Country (autocomplete)' }).pressSequentially('Tha');
    await page.getByRole('option', { name: 'Thailand' }).click();
    await expect(page.getByRole('combobox', { name: 'Country (autocomplete)' })).toHaveValue('Thailand');

    await page.getByRole('switch', { name: 'Email notifications' }).check();
    await expect(page.getByRole('switch', { name: 'Email notifications' })).toBeChecked();

    await page.getByLabel('Skills (multi-select)').selectOption(['Playwright', 'k6']);
    await expect(page.getByLabel('Skills (multi-select)')).toHaveValues(['Playwright', 'k6']);
  });

  test('keyboard shortcuts', async ({ page }) => {
    const input = page.getByLabel('Press any key here');
    await input.press('Enter');
    await expect(page.locator('#key-result')).toHaveText('Enter');
    await input.press('Control+a');
    await expect(page.locator('#key-result')).toHaveText('Control+a');
  });

  test('table: sort by salary descending and filter', async ({ page }) => {
    const table = page.locator('#employees');
    const salaryHeader = table.getByRole('columnheader', { name: 'Salary' });
    await salaryHeader.click();
    await salaryHeader.click();
    await expect(salaryHeader).toHaveAttribute('aria-sort', 'descending');
    const salaries = (await table.locator('tbody tr td:nth-child(4)').allInnerTexts()).map((s) => Number(s.replace(/,/g, '')));
    expect(salaries).toEqual([...salaries].sort((a, b) => b - a));

    await page.getByLabel('Filter by name or department').fill('QA');
    for (const dept of await table.locator('tbody tr td:nth-child(3)').allInnerTexts()) expect(dept).toBe('QA');
  });

  test('upload files and download a file', async ({ page }) => {
    await page.getByLabel(/Choose up to 3 files/).setInputFiles([
      { name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('aaa') },
      { name: 'b.csv', mimeType: 'text/csv', buffer: Buffer.from('x,y\n1,2') },
    ]);
    await page.getByRole('button', { name: 'Upload' }).click();
    await expect(page.locator('#upload-result li')).toHaveText(['a.txt (3 bytes)', 'b.csv (7 bytes)']);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'employees.csv' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('employees.csv');
  });

  test('infinite scroll loads more items', async ({ page }) => {
    const feed = page.getByLabel('Feed');
    await expect(feed.locator('.feed-item')).toHaveCount(10);
    await feed.hover();
    await page.mouse.wheel(0, 2000);
    await expect(feed.locator('.feed-item')).toHaveCount(20);
  });

  test('transient toast can be asserted before it disappears', async ({ page }) => {
    await page.getByRole('button', { name: /Show toast/ }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Saved successfully' })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'Saved successfully' })).toBeHidden({ timeout: 5_000 });
  });

  test('flaky dependency — retry the action, not the whole test', async ({ page }) => {
    const result = page.locator('#flaky-result');
    await expect(async () => {
      await page.getByRole('button', { name: 'Call flaky API' }).click();
      await expect(result).toHaveText('Flaky endpoint succeeded', { timeout: 1_000 });
    }).toPass({ timeout: 10_000 });
  });
});
