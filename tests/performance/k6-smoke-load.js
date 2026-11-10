/**
 * k6 performance test for ShopLab (Module 19).
 * Install k6: https://k6.io/docs/get-started/installation/  (winget install k6 / choco install k6 / brew install k6)
 *
 *   k6 run tests/performance/k6-smoke-load.js                      # smoke: 1 user, 30 s
 *   k6 run -e PROFILE=load tests/performance/k6-smoke-load.js      # load: ramp to 20 users
 *   k6 run -e BASE_URL=http://staging.example.test tests/performance/k6-smoke-load.js
 *
 * Practise: turn on latency (POST /api/test/config {"latencyMs":300}) and watch the thresholds fail.
 */
import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const PROFILES = {
  smoke: { vus: 1, duration: '30s' },
  load: {
    stages: [
      { duration: '30s', target: 10 },
      { duration: '1m', target: 20 },
      { duration: '30s', target: 0 },
    ],
  },
};

export const options = {
  ...PROFILES[__ENV.PROFILE || 'smoke'],
  thresholds: {
    http_req_failed: ['rate<0.01'], // < 1% errors
    http_req_duration: ['p(95)<500'], // 95% of requests < 500 ms
    'http_req_duration{name:checkout}': ['p(95)<800'],
    checks: ['rate>0.99'],
  },
};

const json = { headers: { 'Content-Type': 'application/json' } };

export function setup() {
  // one user per virtual user would be more realistic; keep it simple for the lab
  const res = http.post(`${BASE_URL}/api/test/users`, '{}', json);
  check(res, { 'test user created': (r) => r.status === 201 });
  return res.json();
}

export default function (user) {
  group('browse', () => {
    const list = http.get(`${BASE_URL}/api/products?page=1&pageSize=8`, { tags: { name: 'list' } });
    check(list, { 'list 200': (r) => r.status === 200, 'has items': (r) => r.json('items').length > 0 });
    const search = http.get(`${BASE_URL}/api/products?search=book`, { tags: { name: 'search' } });
    check(search, { 'search 200': (r) => r.status === 200 });
    sleep(1); // think time
  });

  group('buy', () => {
    const login = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(user), { ...json, tags: { name: 'login' } });
    check(login, { 'login 200': (r) => r.status === 200 });
    const auth = { headers: { ...json.headers, Authorization: `Bearer ${login.json('token')}` } };
    http.post(`${BASE_URL}/api/cart/items`, JSON.stringify({ productId: 14, qty: 1 }), { ...auth, tags: { name: 'add-to-cart' } });
    const order = http.post(`${BASE_URL}/api/orders`, JSON.stringify({
      shippingMethod: 'standard', paymentMethod: 'cod',
      address: { fullName: 'Load Tester', phone: '0812345678', line1: '1 Perf Rd', district: 'X', province: 'Bangkok', postcode: '10110' },
    }), { ...auth, tags: { name: 'checkout' } });
    check(order, { 'order created': (r) => r.status === 201 });
    sleep(1);
  });
}
