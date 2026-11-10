# Locator Strategy Cheat Sheet

## Priority (most → least resilient)
1. **Role + accessible name** — `getByRole('button', { name: 'Add to cart' })` · Robot: `role=button[name="Add to cart"]`
2. **Label** — `getByLabel('Coupon code')`
3. **Test id** (agreed with devs) — `getByTestId('summary-total')` · Robot: `data-testid=summary-total`
4. **Placeholder / visible text** — `getByPlaceholder()`, `getByText()` (watch for i18n & copy changes)
5. **CSS with stable attributes** — `[data-sku="ELEC-001"]`, `[name="email"]`
6. **XPath** — last resort (tables by content, sibling relations)

## Never
- Generated ids/classes: `#btn-x8k2f1`, `.css-1q2w3e`, `.sc-bdVaJa`
- Absolute XPath: `/html/body/div[2]/div/form/button`
- Pure position: `div:nth-child(7)` (unless position *is* the meaning, e.g. table column)
- Text that changes with state (button "Login" → "Signing in…") when asserting state

## Tables
```ts
// row by content, then cell
page.getByRole('row').filter({ hasText: 'ELEC-001' }).getByRole('cell').nth(3)
page.locator('[data-testid="cart-row"][data-sku="ELEC-001"] [data-testid="cart-item-total"]')
```
```xpath
//tr[td[normalize-space()="ELEC-001"]]/td[4]
```

## Special contexts
| Context | Playwright | Robot Browser |
|---|---|---|
| iframe | `page.frameLocator('#payment-frame').getByLabel(...)` | `id=payment-frame >>> id=card-holder` |
| nested iframe | `.frameLocator('iframe[title="Nested frame"]')` | `id=a >>> css=iframe >>> id=b` |
| open shadow DOM | automatic (not with XPath) | automatic (not with XPath) |
| closed shadow DOM | not reachable — ask devs | not reachable |
| new tab | `context.waitForEvent('page')` | `Switch Page    NEW` |

## Testability request to developers (copy/paste)
> Please add `data-testid` to interactive elements and key outputs (buttons, inputs, totals, status badges, table rows with `data-<business-key>`), keep them stable across redesigns, use semantic HTML (`<button>`, `<label for>`), and give every icon-only button an accessible name.

## Debug locators
- DevTools Elements → `Ctrl+F` → CSS/XPath · Console: `$$('css')`, `$x('//xpath')`
- `npx playwright codegen <url>` → **Pick locator**
- Playwright Inspector: `npx playwright test --debug` → hover elements
