import { defineChallenge } from './sa2-challenge';

/**
 * SA2 Part A — Locator challenge (learner file). See docs/assessments/SA2-locators-first-script.md
 *
 * Replace every page.locator('TODO') with your locator. Each function receives the page AFTER navigation
 * and must return ONE element. You may hover or click inside the function to reveal the element first.
 * Do not edit sa2-challenge.ts.
 *
 *   PowerShell: $env:EXERCISES="1"   ·   bash: export EXERCISES=1
 *   npx playwright test tests/exercises/sa2-locators.spec.ts --project=exercises
 */
defineChallenge('SA2 locators', {
  A1: (page) => page.locator('TODO'), // "/" (searched for "Yoga"): Add to cart button of SKU SPRT-001
  A2: (page) => page.locator('TODO'), // "/": price of "Clean Code"
  A3: (page) => page.locator('TODO'), // "/login": the password field
  A4: (page) => page.locator('TODO'), // "/lab": "Save changes" (id and class change on every load)
  A5: (page) => page.locator('TODO'), // "/lab": name input inside the OPEN shadow root
  A6: (page) => page.locator('TODO'), // "/lab": "Submit inside frame" (inside an iframe)
  A7: (page) => page.locator('TODO'), // "/lab": "Salary" column header of the employees table
  A8: async (page) => page.locator('TODO'), // "/lab": "Billing" in the Account menu (shown on hover)
  A9: async (page) => page.locator('TODO'), // "/lab": "Mangosteen" in the custom fruit dropdown (open it first)
  A10: (page) => page.locator('TODO'), // "/lab": the whole table row whose ID cell is 3
});
