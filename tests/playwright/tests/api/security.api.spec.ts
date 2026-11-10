import { test, expect } from '../../src/fixtures/test';
import { buildCheckout, birthDateForAge, PRODUCTS } from '../../src/data/testData';
import { env } from '../../src/config/env';

test.describe('Authentication & authorization (REQ-AUTH, REQ-SEC)', () => {
  test('protected endpoints return 401 without a token', async ({ api }) => {
    for (const res of [await api.cart(), await api.orders(), await api.me()]) {
      expect(res.status()).toBe(401);
      expect((await res.json()).error.code).toBe('UNAUTHORIZED');
    }
  });

  test('customer cannot call admin endpoints (403)', async ({ userApi }) => {
    const res = await userApi.createProduct({ sku: 'HACK-001', name: 'nope', category: 'home', price: 1, stock: 1 });
    expect(res.status()).toBe(403);
    expect((await res.json()).error.code).toBe('FORBIDDEN');
  });

  test('a user cannot read another user\'s order — IDOR (BUG-08 guard)', async ({ userApi, newApi, api }) => {
    await userApi.addToCart(await userApi.productIdBySku(PRODUCTS.tshirt290), 1);
    const order = await (await userApi.checkout(buildCheckout())).json();

    const intruder = await newApi();
    await intruder.loginOrFail(await api.createUser());
    const res = await intruder.order(order.id);
    expect(res.status()).toBe(404); // 404 (not 403) so order ids cannot be enumerated
  });

  test('locked account is rejected with 423 (BUG-11 guard)', async ({ api }) => {
    const res = await api.login(env.users.locked);
    expect(res.status()).toBe(423);
    expect((await res.json()).error.code).toBe('ACCOUNT_LOCKED');
  });

  test('login errors do not reveal which part was wrong (BUG-13 guard)', async ({ api }) => {
    const unknownUser = await (await api.login({ username: 'ghost_user', password: 'Passw0rd!' })).json();
    const wrongPassword = await (await api.login({ username: 'jane', password: 'nope' })).json();
    expect(unknownUser.error.message).toBe(wrongPassword.error.message);
  });

  test('token is revoked after logout', async ({ playwright, newApi, freshUser }) => {
    const client = await newApi();
    const token = await client.loginOrFail(freshUser);
    const ctx = await playwright.request.newContext({ baseURL: env.baseURL, extraHTTPHeaders: { Authorization: `Bearer ${token}` } });
    expect((await ctx.get('/api/auth/me')).status()).toBe(200);
    expect((await ctx.post('/api/auth/logout')).status()).toBe(204);
    expect((await ctx.get('/api/auth/me')).status()).toBe(401);
    await ctx.dispose();
  });

  test('malformed JSON body returns 400 INVALID_JSON', async ({ request }) => {
    const res = await request.post('/api/auth/login', { headers: { 'Content-Type': 'application/json' }, data: '{"username": "x",' });
    expect(res.status()).toBe(400);
    expect((await res.json()).error.code).toBe('INVALID_JSON');
  });
});

test.describe('Registration API — boundary value analysis on age (REQ-REG-07)', () => {
  // age = 18..60 inclusive. Boundaries: 17 | 18 ... 60 | 61
  const cases: Array<[label: string, birthDate: string, expected: number]> = [
    ['17 (turns 18 tomorrow)', birthDateForAge(18, 1), 400],
    ['18 today', birthDateForAge(18), 201],
    ['60', birthDateForAge(60), 201],
    ['61 today', birthDateForAge(61), 400],
  ];
  for (const [label, birthDate, expected] of cases) {
    test(`age ${label} -> ${expected}`, async ({ request }) => {
      const username = `bva_${Math.random().toString(36).slice(2, 10)}`;
      const res = await request.post('/api/users/register', {
        data: {
          username, email: `${username}@example.test`, password: 'Str0ng!Pass', confirmPassword: 'Str0ng!Pass',
          fullName: 'Boundary Tester', phone: '0812345678', birthDate, province: 'Bangkok', acceptTerms: true,
        },
      });
      expect(res.status(), await res.text()).toBe(expected);
    });
  }
});
