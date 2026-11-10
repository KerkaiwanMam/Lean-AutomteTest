import { test as base, expect, APIRequestContext, Page } from '@playwright/test';
import { ShopLabApi } from '../api/ShopLabApi';
import { env, Credentials } from '../config/env';
import { LoginPage } from '../pages/LoginPage';
import { CatalogPage } from '../pages/CatalogPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { RegisterPage } from '../pages/RegisterPage';

type Fixtures = {
  /** API client with NO logged-in user (its own cookie jar) */
  api: ShopLabApi;
  /** Factory for extra, isolated API clients (e.g. "user A" and "user B" in one test) */
  newApi: () => Promise<ShopLabApi>;
  /** A brand-new customer account created for this test only (isolation for parallel runs) */
  freshUser: Credentials & { id: number };
  /** API client already logged in as `freshUser` — use it to arrange data */
  userApi: ShopLabApi;
  /** Browser page already logged in as `freshUser` (cookie injected, no UI login = fast) */
  userPage: Page;
  /** Browser page logged in as the seeded admin */
  adminPage: Page;
  loginPage: LoginPage;
  catalogPage: CatalogPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  registerPage: RegisterPage;
};

export const test = base.extend<Fixtures>({
  // Each API client gets its own APIRequestContext so cookies never leak between "users".
  newApi: async ({ playwright }, use) => {
    const contexts: APIRequestContext[] = [];
    await use(async () => {
      const ctx = await playwright.request.newContext({ baseURL: env.baseURL });
      contexts.push(ctx);
      return new ShopLabApi(ctx);
    });
    await Promise.all(contexts.map((c) => c.dispose()));
  },

  api: async ({ newApi }, use) => use(await newApi()),

  freshUser: async ({ api }, use) => use(await api.createUser()),

  userApi: async ({ newApi, freshUser }, use) => {
    const client = await newApi();
    await client.loginOrFail(freshUser);
    await use(client);
  },

  userPage: async ({ page, userApi }, use) => {
    await page.context().addCookies([{ name: 'sl_token', value: userApi.authToken as string, url: env.baseURL }]);
    await use(page);
  },

  adminPage: async ({ page, newApi }, use) => {
    const admin = await newApi();
    const token = await admin.loginOrFail(env.users.admin);
    await page.context().addCookies([{ name: 'sl_token', value: token, url: env.baseURL }]);
    await use(page);
  },

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  catalogPage: async ({ page }, use) => use(new CatalogPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  registerPage: async ({ page }, use) => use(new RegisterPage(page)),
});

export { expect };
