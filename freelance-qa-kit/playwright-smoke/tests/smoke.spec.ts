import { test, expect, type Page } from '@playwright/test';
import { targets } from '../src/targets';

/**
 * Smoke: every key page loads, has a title and visible content, and does not throw errors.
 * Maps to checklist 02 sections A and E.
 */

type Problem = { kind: string; detail: string };

/** Collects console errors, uncaught exceptions and broken same-origin requests while a page loads. */
function watch(page: Page): Problem[] {
  const problems: Problem[] = [];
  const origin = new URL(targets.baseURL).origin;

  page.on('pageerror', (err) => problems.push({ kind: 'uncaught exception', detail: err.message }));
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    if (targets.ignoreConsole?.test(msg.text())) return;
    // The browser logs every 4xx/5xx response as "Failed to load resource". Network problems are judged by the
    // 'response' handler below instead — an expected 401 from a "who am I?" call is not a bug.
    if (msg.text().startsWith('Failed to load resource')) return;
    problems.push({ kind: 'console error', detail: msg.text() });
  });
  page.on('requestfailed', (req) => {
    // ERR_ABORTED = the page navigated away (e.g. a redirect to login) before the request finished; not a bug
    if (req.url().startsWith(origin) && req.failure()?.errorText !== 'net::ERR_ABORTED') {
      problems.push({ kind: 'request failed', detail: `${req.url()} (${req.failure()?.errorText})` });
    }
  });
  page.on('response', (res) => {
    if (!res.url().startsWith(origin)) return;
    const type = res.request().resourceType();
    const brokenAsset = res.status() === 404 && ['script', 'stylesheet', 'image', 'font'].includes(type);
    if (res.status() >= 500 || brokenAsset) {
      problems.push({ kind: `HTTP ${res.status()} (${type})`, detail: res.url() });
    }
  });
  return problems;
}

for (const path of targets.smokePaths) {
  test(`@smoke ${path} loads without errors`, async ({ page }) => {
    const problems = watch(page);

    const response = await page.goto(path);
    expect(response, 'no response — is BASE_URL correct?').not.toBeNull();
    expect(response!.status(), `HTTP status of ${path}`).toBeLessThan(400);

    await page.waitForLoadState('networkidle').catch(() => {
      /* sites with polling/websockets never go idle; the checks below still run */
    });

    await expect(page, 'page needs a <title> (SEO + browser tab)').toHaveTitle(/\S/);
    await expect(page.locator('body'), 'page renders visible text').toContainText(/\S/);

    // AI builders sometimes leave template text behind (checklist 02 E)
    const text = await page.locator('body').innerText();
    expect.soft(text, 'leftover placeholder text').not.toMatch(/lorem ipsum|your (company|brand) name|\bTODO\b/i);

    await test.info().attach('problems.json', {
      body: JSON.stringify(problems, null, 2),
      contentType: 'application/json',
    });
    expect(problems, 'console errors / broken requests (details in problems.json)').toEqual([]);
  });
}
