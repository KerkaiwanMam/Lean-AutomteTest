import { test, expect } from '../../src/fixtures/test';
import type { APIRequestContext } from '@playwright/test';
import { randomSku } from '../../src/data/testData';
import { env } from '../../src/config/env';

/**
 * File Interface Testing (M01b §6): the product CSV import and export of ShopLab (REQ-ADM-03).
 * These tests drive the file interface through HTTP only — no browser page is opened.
 *
 * The file is named `*.admin.spec.ts` on purpose: it changes the shared product catalogue, so it runs
 * in the `ui-admin` project (after the read-only UI tests), like admin.spec.ts. Every product it
 * creates is soft-deleted at the end, so the "28 active products" assertions elsewhere stay true.
 */

const HEADER = 'sku,name,category,price,stock';
const csvFile = (text: string) => ({ name: 'products.csv', mimeType: 'text/csv', buffer: Buffer.from(text, 'utf8') });

test.describe('Product CSV interface (REQ-ADM-03)', () => {
  let token: string;
  const created: number[] = [];

  test.beforeEach(async ({ newApi }) => {
    token = await (await newApi()).loginOrFail(env.users.admin);
  });

  test.afterEach(async ({ request }) => {
    for (const id of created.splice(0)) {
      await request.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    }
  });

  const importCsv = (request: APIRequestContext, text: string, auth = token) =>
    request.post('/api/admin/products/import', { multipart: { file: csvFile(text) }, headers: { Authorization: `Bearer ${auth}` } });

  test('valid rows are created, each invalid row is reported by its line number and not saved', async ({ request, api }) => {
    const [ok, noName, badCat, badPrice, badStock] = Array.from({ length: 5 }, randomSku);
    const file = [
      HEADER,
      `${ok},Import Mug,home,250,10`,     // line 2 — valid
      'bad-sku,Broken,home,10,1',          // line 3
      `${noName},,home,10,1`,              // line 4
      `${badCat},Lamp,toys,10,1`,          // line 5
      `${badPrice},Lamp,home,-1,1`,        // line 6
      `${badStock},Lamp,home,10,1.5`,      // line 7
    ].join('\r\n');

    const res = await importCsv(request, file);
    expect(res.status(), await res.text()).toBe(200);
    expect(await res.json()).toEqual({
      created: 1,
      updated: 0,
      errors: [
        { line: 3, message: 'Invalid SKU' },
        { line: 4, message: 'Name is required' },
        { line: 5, message: 'Invalid category' },
        { line: 6, message: 'Invalid price' },
        { line: 7, message: 'Invalid stock' },
      ],
    });

    // Target side of the interface: the valid row landed, the rejected rows did not.
    const id = await api.productIdBySku(ok);
    created.push(id);
    expect(await (await api.product(id)).json()).toMatchObject({ sku: ok, name: 'Import Mug', category: 'home', price: 250, stock: 10 });
    for (const sku of [noName, badCat, badPrice, badStock]) {
      expect((await (await api.products({ search: sku })).json()).total, `${sku} must not be imported`).toBe(0);
    }
  });

  test('importing the same SKU again updates the product instead of creating a duplicate', async ({ request, api }) => {
    const sku = randomSku();
    expect(await (await importCsv(request, `${HEADER}\n${sku},Desk Fan,home,990,3`)).json()).toMatchObject({ created: 1, updated: 0 });
    const id = await api.productIdBySku(sku);
    created.push(id);

    expect(await (await importCsv(request, `${HEADER}\n${sku},Desk Fan,home,1090,7`)).json()).toMatchObject({ created: 0, updated: 1 });
    expect(await (await api.product(id)).json()).toMatchObject({ price: 1090, stock: 7 });
    expect((await (await api.products({ search: sku })).json()).total).toBe(1);
  });

  test('a file without a required column is rejected as a whole', async ({ request }) => {
    const res = await importCsv(request, `sku,name,category,price\n${randomSku()},No Stock Column,home,10`);
    expect(res.status()).toBe(400);
    expect(await res.json()).toMatchObject({ error: { code: 'INVALID_CSV' } });
    expect((await res.json()).error.message).toContain('stock');
  });

  test('a request without a file and a non-admin caller are refused', async ({ request, userApi }) => {
    const noFile = await request.post('/api/admin/products/import', { headers: { Authorization: `Bearer ${token}` } });
    expect(noFile.status()).toBe(400);
    expect(await noFile.json()).toMatchObject({ error: { code: 'FILE_REQUIRED' } });

    const customer = await importCsv(request, `${HEADER}\n${randomSku()},X,home,1,1`, userApi.authToken as string);
    expect(customer.status()).toBe(403);
  });

  test('export is UTF-8 with BOM and quotes a field that holds a comma or a double quote (RFC 4180 rules 6–7)', async ({ request, api }) => {
    const sku = randomSku();
    // Inside a quoted CSV field a double quote is written twice: "Mug, ""Big""" means  Mug, "Big"
    await importCsv(request, `${HEADER}\n${sku},"Mug, ""Big""",home,250,5`);
    const id = await api.productIdBySku(sku);
    created.push(id);
    expect((await (await api.product(id)).json()).name).toBe('Mug, "Big"');

    const res = await request.get('/api/admin/products/export.csv', { headers: { Authorization: `Bearer ${token}` } });
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('text/csv');
    expect(res.headers()['content-disposition']).toContain('products.csv');

    const bytes = await res.body();
    expect([...bytes.subarray(0, 3)], 'UTF-8 BOM so Excel shows Thai text').toEqual([0xef, 0xbb, 0xbf]);
    const lines = bytes.subarray(3).toString('utf8').split('\n');
    expect(lines[0]).toBe('sku,name,name_th,category,price,stock,active');
    expect(lines).toContain(`${sku},"Mug, ""Big""","Mug, ""Big""",home,250,5,1`);
    // Every record has as many fields as the header (counted outside quoted fields).
    const fields = (line: string) => line.replace(/"(?:[^"]|"")*"/g, 'Q').split(',').length;
    for (const line of lines.filter(Boolean)) expect(fields(line), line).toBe(7);
  });
});
