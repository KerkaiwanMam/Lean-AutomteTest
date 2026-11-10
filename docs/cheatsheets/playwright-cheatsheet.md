# Playwright Cheat Sheet (TypeScript)

## CLI
```bash
npx playwright test                         # all (this repo: api + ui + ui-admin)
npx playwright test tests/ui/auth.spec.ts   # one file
npx playwright test -g "locked account"     # by title
npx playwright test --grep @smoke           # by tag
npx playwright test --project=api           # by project
npx playwright test --ui                    # UI mode
npx playwright test --headed --workers=1    # watch it
npx playwright test --debug                 # inspector
npx playwright test --repeat-each=10        # flaky hunt
npx playwright test --shard=1/3             # CI sharding
npx playwright test --update-snapshots      # visual baselines
npx playwright codegen http://localhost:3000
npx playwright show-report
npx playwright show-trace test-results/<dir>/trace.zip
```
PowerShell env vars: `$env:PW_CHANNEL="chrome"; $env:BUG_MODE="1"; npx playwright test`

## Locators
```ts
page.getByRole('button', { name: 'Save', exact: true })
page.getByLabel('Username')
page.getByPlaceholder('Search products')
page.getByText('Hello World!')
page.getByTestId('cart-count')                    // testIdAttribute: data-testid
page.locator('[data-testid="cart-row"][data-sku="ELEC-001"]')
locator.filter({ hasText: 'Mouse' }) / .filter({ has: page.getByRole('button') })
locator.first() / .last() / .nth(2)
locator.or(other) / locator.and(other)
page.frameLocator('#payment-frame').getByLabel('Card holder')
```

## Actions
```ts
await l.click(); await l.dblclick(); await l.click({ button: 'right' });
await l.fill('text'); await l.pressSequentially('Tha'); await l.press('Enter');
await l.check(); await l.selectOption('books'); await l.selectOption(['a', 'b']);
await l.setInputFiles('file.png'); await l.setInputFiles({ name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('x') });
await l.hover(); await src.dragTo(dst); await l.scrollIntoViewIfNeeded();
```

## Assertions (auto-retry)
```ts
await expect(l).toBeVisible() / toBeHidden() / toBeEnabled() / toBeDisabled() / toBeChecked()
await expect(l).toHaveText('x') / toContainText('x') / toHaveValue('x') / toHaveValues([...])
await expect(l).toHaveAttribute('aria-selected', 'true') / toHaveCount(8) / toHaveClass(/active/)
await expect(page).toHaveURL('/cart') / toHaveTitle(/ShopLab/)
await expect(l).toHaveScreenshot('name.png')
await expect.poll(() => fn()).toEqual(value)
await expect(async () => { ... }).toPass({ timeout: 10_000 })
expect.soft(value).toBe(x)
```

## Events
```ts
page.once('dialog', d => d.accept('text'));
const [tab] = await Promise.all([context.waitForEvent('page'), link.click()]);
const popup = page.waitForEvent('popup'); await btn.click(); await popup;
const dl = page.waitForEvent('download'); await link.click(); (await dl).suggestedFilename();
await page.waitForResponse(r => r.url().endsWith('/api/cart/quote') && r.ok());
```

## Network
```ts
await page.route('**/api/products?*', r => r.fulfill({ status: 503, json: { error: { code: 'X', message: 'Y' } } }), { times: 1 });
await page.route('**/api/products/1', async r => { const res = await r.fetch(); r.fulfill({ res, json: { ...(await res.json()), stock: 0 } }); });
await page.route(/\.(png|svg)$/, r => r.abort());
```

## API
```ts
const res = await request.post('/api/auth/login', { data: { username, password } });
expect(res.status()).toBe(200); const body = await res.json();
const ctx = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { Authorization: `Bearer ${token}` } });
```

## Fixtures
```ts
export const test = base.extend<{ cartPage: CartPage }>({
  cartPage: async ({ page }, use) => { await use(new CartPage(page)); /* teardown here */ },
});
```

## Annotations
```ts
test.skip(cond, 'reason'); test.fixme(); test.fail(); test.slow();
test('x', { tag: ['@smoke'], annotation: { type: 'issue', description: 'BUG-12' } }, async () => {});
test.describe.configure({ mode: 'serial' });   // only when unavoidable
```
