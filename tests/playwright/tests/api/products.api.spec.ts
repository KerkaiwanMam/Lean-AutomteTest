import { test, expect } from '../../src/fixtures/test';
import { schemaValidator, formatErrors } from '../../src/utils/contract';

test.describe('Products API', () => {
  test('GET /products matches the OpenAPI contract @smoke', async ({ api, request }) => {
    const res = await api.products();
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/json');
    const body = await res.json();
    const validate = await schemaValidator(request, 'ProductList');
    expect(validate(body), formatErrors(validate)).toBe(true);
    expect(body).toMatchObject({ total: 28, page: 1, pageSize: 8, totalPages: 4 });
  });

  test('pages do not overlap and cover every product (BUG-05 guard)', async ({ api }) => {
    const ids: number[] = [];
    for (let page = 1; page <= 4; page += 1) {
      const body = await (await api.products({ page, pageSize: 8 })).json();
      ids.push(...body.items.map((p: { id: number }) => p.id));
    }
    expect(ids).toHaveLength(28);
    expect(new Set(ids).size).toBe(28);
  });

  test('sort=price_asc is numeric (BUG-04 guard)', async ({ api }) => {
    const body = await (await api.products({ sort: 'price_asc', pageSize: 50 })).json();
    const prices = body.items.map((p: { price: number }) => p.price);
    expect(prices).toEqual([...prices].sort((a: number, b: number) => a - b));
  });

  test('search is case-insensitive (BUG-03 guard)', async ({ api }) => {
    const lower = await (await api.products({ search: 'coffee' })).json();
    const upper = await (await api.products({ search: 'COFFEE' })).json();
    expect(lower.total).toBe(1);
    expect(upper.items).toEqual(lower.items);
  });

  test('price range filter is inclusive on both ends', async ({ api }) => {
    const body = await (await api.products({ minPrice: 999, maxPrice: 1001, pageSize: 50 })).json();
    expect(body.items.map((p: { price: number }) => p.price).sort()).toEqual([1000, 1001, 999].sort());
  });

  // Equivalence partitions for query validation
  for (const [query, field] of [
    [{ page: 0 }, 'page'],
    [{ page: 'abc' }, 'page'],
    [{ pageSize: 51 }, 'pageSize'],
    [{ sort: 'cheapest' }, 'sort'],
    [{ category: 'toys' }, 'category'],
  ] as const) {
    test(`invalid query ${JSON.stringify(query)} -> 400 on "${field}"`, async ({ api }) => {
      const res = await api.products(query as Record<string, string | number>);
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.error.code).toBe('VALIDATION_ERROR');
      expect(body.error.details).toHaveProperty(field);
    });
  }

  test('unknown product returns 404 with the standard error shape', async ({ api, request }) => {
    const res = await api.product(99999);
    expect(res.status()).toBe(404);
    const validate = await schemaValidator(request, 'Error');
    expect(validate(await res.json()), formatErrors(validate)).toBe(true);
  });
});
