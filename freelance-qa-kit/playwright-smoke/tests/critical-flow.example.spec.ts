import { test, expect, type Page } from '@playwright/test';
import { targets } from '../src/targets';

/**
 * EXAMPLE critical flow + access control checks. Copy and edit per client: the locators below try common
 * English/Thai labels, but every site is different. Tests SKIP when the env values they need are empty.
 * Maps to checklist 02 sections A and C, and to test cases TC-01 / TC-04 in template 04.
 */

const needsLogin = !targets.user || !targets.password;

async function login(page: Page) {
  await page.goto(targets.loginPath);
  // Prefer role/label locators (Playwright best practices) — they survive AI regenerating the markup
  await page.getByLabel(/email|e-mail|username|user name|อีเมล|ชื่อผู้ใช้/i).first().fill(targets.user);
  await page.getByLabel(/password|รหัสผ่าน/i).first().fill(targets.password);
  await page.getByRole('button', { name: /log ?in|sign ?in|เข้าสู่ระบบ/i }).first().click();
  // Logged in = we left the login page
  await expect(page).not.toHaveURL(new RegExp(`${targets.loginPath}([?#]|$)`));
}

test.describe('critical flow (example)', () => {
  test.skip(needsLogin, 'set TEST_USER and TEST_PASSWORD (client test account) to run');

  test('@smoke test user can log in and reach the members page', async ({ page }) => {
    await login(page);
    if (targets.afterLoginPath) {
      const res = await page.goto(targets.afterLoginPath);
      expect(res!.status()).toBeLessThan(400);
      await expect(page).not.toHaveURL(new RegExp(targets.loginPath));
    }
    // TODO per client: continue the money flow here (TC-01), e.g. choose service → slot → confirm,
    // then assert the result is SAVED: reload, and check it is still listed.
  });

  test('wrong password is rejected', async ({ page }) => {
    await page.goto(targets.loginPath);
    await page.getByLabel(/email|e-mail|username|user name|อีเมล|ชื่อผู้ใช้/i).first().fill(targets.user);
    await page.getByLabel(/password|รหัสผ่าน/i).first().fill(`${targets.password}-wrong`);
    await page.getByRole('button', { name: /log ?in|sign ?in|เข้าสู่ระบบ/i }).first().click();
    await expect(page).toHaveURL(new RegExp(targets.loginPath));
  });
});

test.describe('access control', () => {
  /** Refused = 401/403/404, or the server sends the visitor to the login page. */
  function isRefused(status: number, finalUrl: string) {
    return [401, 403, 404].includes(status) || finalUrl.includes(targets.loginPath);
  }

  test('protected URLs refuse anonymous visitors', async ({ request }) => {
    test.skip(targets.protectedUrls.length === 0, 'set PROTECTED_URLS to run');
    const open: string[] = [];
    for (const url of targets.protectedUrls) {
      const res = await request.get(url);
      if (!isRefused(res.status(), res.url())) open.push(`${url} → HTTP ${res.status()}`);
    }
    expect(open, 'reachable without logging in').toEqual([]);
  });

  test("test user cannot open another user's data (IDOR)", async ({ page }) => {
    test.skip(needsLogin || targets.forbiddenUrls.length === 0, 'set TEST_USER, TEST_PASSWORD and FORBIDDEN_URLS to run');
    await login(page);
    // page.request shares the browser's cookies. Sites that keep the token in localStorage (e.g. Supabase)
    // need an Authorization header instead — check this one manually with Postman (TC-04).
    const open: string[] = [];
    for (const url of targets.forbiddenUrls) {
      const res = await page.request.get(url);
      if (!isRefused(res.status(), res.url())) open.push(`${url} → HTTP ${res.status()}`);
    }
    expect(open, "another user's data is reachable — report as High/Critical").toEqual([]);
  });
});
