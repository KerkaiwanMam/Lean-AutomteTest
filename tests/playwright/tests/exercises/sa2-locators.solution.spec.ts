import { defineChallenge } from './sa2-challenge';

/**
 * ⚠️ SPOILER (instructor key; this repository is public) — SA2 Part A reference answers.
 * Other resilient answers are fine; these follow the role → label → test id → text → CSS order from M07.
 *
 *   npx playwright test tests/exercises/sa2-locators.solution.spec.ts --project=exercises   (EXERCISES=1)
 */
defineChallenge('SA2 locators — key', {
  // card identified by its business key (data-sku), then the button by role + name
  A1: (page) => page.locator('[data-testid="product-card"][data-sku="SPRT-001"]').getByRole('button', { name: 'Add to cart' }),
  // filter the card by its visible name, then the price test id
  A2: (page) => page.getByTestId('product-card').filter({ hasText: 'Clean Code' }).getByTestId('product-price'),
  // exact label: "Password" alone would also match "Show password"
  A3: (page) => page.getByLabel('Password', { exact: true }),
  // role + accessible name ignores the random id/class
  A4: (page) => page.getByRole('button', { name: 'Save changes' }),
  // locators pierce OPEN shadow roots automatically (not with XPath)
  A5: (page) => page.locator('#open-shadow').getByPlaceholder('Name inside open shadow'),
  // switch into the frame first
  A6: (page) => page.frameLocator('#payment-frame').getByRole('button', { name: 'Submit inside frame' }),
  // column header role, exact name inside the employees table
  A7: (page) => page.locator('#employees').getByRole('columnheader', { name: 'Salary' }),
  // reveal the menu by hovering its button, then use the menuitem role
  A8: async (page) => {
    await page.getByRole('button', { name: 'Account ▾' }).hover();
    return page.getByRole('menuitem', { name: 'Billing' });
  },
  // open the custom listbox, then pick the option by role
  A9: async (page) => {
    await page.locator('#fruit-trigger').click();
    return page.getByRole('option', { name: 'Mangosteen' });
  },
  // a row that HAS a first cell whose exact text is "3" (not "13", "23"…)
  A10: (page) => page.locator('#employees tbody tr').filter({ has: page.getByRole('cell', { name: '3', exact: true }) }),
});
