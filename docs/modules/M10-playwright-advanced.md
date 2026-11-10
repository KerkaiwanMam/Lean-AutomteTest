# M10 — Playwright Advanced

> **Level 3 · Tools** · ⏱ 10 ชม. · Prerequisite: M09 · Reference: `tests/playwright/src/`

## 🎯 Learning Objectives
1. สร้าง **Page Object Model** และ **component objects**
2. เขียน **custom fixtures** (เช่น `userPage`, `adminPage`, `userApi`) ด้วย `test.extend`
3. ใช้ **API testing ใน Playwright** และใช้ API **เตรียมข้อมูล** ให้ UI test
4. จัดการ **authentication state** (cookie injection / storageState)
5. ใช้ **network interception/mocking** (`page.route`)
6. จัดการ **iframe, multiple tabs, downloads, uploads, dialogs, shadow DOM**
7. ตั้งค่า **projects, parallelism, sharding, retries, tags**

---

## 📖 1. Page Object Model (POM)
```
tests/playwright/src/pages/
├── BasePage.ts            ← goto(), header (component)
├── components/Header.ts   ← ส่วนที่อยู่ทุกหน้า
├── LoginPage.ts
├── CatalogPage.ts
├── CartPage.ts            ← summary() คืนตัวเลข ไม่ใช่ข้อความ
├── CheckoutPage.ts
└── RegisterPage.ts
```
**หลักการ POM ที่ดี**
1. Page object **ไม่ assert** (ยกเว้น wait/ready check) — test เป็นคน assert
2. Method = **intent ของผู้ใช้** (`applyCouponCode('SAVE10')`) ไม่ใช่ `clickApplyButton()`
3. expose **Locator** ให้ test assert ได้ (`cartPage.total`)
4. คืน **ข้อมูลที่มีความหมาย** (`summary(): Promise<{subtotal, discount, …}>`)
5. ซ่อนรายละเอียด UI เช่น "ต้องรอ API quote เสร็จ" ไว้ใน page object (`waitForResponse`)

## 📖 2. Custom Fixtures — Dependency Injection ของ test
ดู `src/fixtures/test.ts`:
```ts
export const test = base.extend<Fixtures>({
  newApi:    async ({ playwright }, use) => { /* สร้าง APIRequestContext แยก cookie jar ต่อ client */ },
  freshUser: async ({ api }, use) => use(await api.createUser()),          // user ใหม่ทุก test
  userApi:   async ({ newApi, freshUser }, use) => { … loginOrFail … },
  userPage:  async ({ page, userApi }, use) => {                            // browser ที่ login แล้ว
    await page.context().addCookies([{ name: 'sl_token', value: userApi.authToken!, url: env.baseURL }]);
    await use(page);
  },
  cartPage:  async ({ page }, use) => use(new CartPage(page)),
});
```
ใช้งาน: `test('…', async ({ userPage, userApi, cartPage }) => { … })` — Playwright สร้างเฉพาะ fixture ที่ test ขอ และ **teardown อัตโนมัติ**

> 🔑 **บทเรียน design:** ตอนแรกทุก client ใช้ `request` fixture ร่วมกัน → login ของ user A ทำให้ client "anonymous" มี cookie ไปด้วย → test 401 เพี้ยน แก้โดยให้ทุก client มี `APIRequestContext` ของตัวเอง (`newApi`)

## 📖 3. API testing และ Hybrid tests
```ts
// Arrange ผ่าน API (เร็ว) → Act/Assert ผ่าน UI (สิ่งที่ลูกค้าเห็น) → Verify ผ่าน API (สถานะจริงหลังบ้าน)
await userApi.addToCart(await userApi.productIdBySku('ELEC-003'), 1);
await cartPage.goto();
await cartPage.applyCouponCode('SAVE10');
await expect.poll(() => cartPage.summary()).toEqual(expectedQuote(1000, 100));
```
ดู `tests/ui/checkout.spec.ts` — หลังซื้อผ่าน UI ตรวจ `GET /api/orders` และ stock ที่ลดลง (UI แสดงถูกไม่ได้แปลว่าบันทึกถูก)

## 📖 4. Authentication strategies
| วิธี | ข้อดี | ข้อเสีย |
|---|---|---|
| Login ผ่าน UI ทุก test | สมจริง | ช้ามาก, login พัง = ทุก test พัง |
| **storageState** (login ครั้งเดียวใน setup project แล้วบันทึกไฟล์) | เร็ว, เป็นทางการของ Playwright | user ร่วมกันทุก test → ข้อมูลชนกันเมื่อรัน parallel |
| **API login + inject cookie ต่อ test** (โปรเจกต์นี้) | เร็ว + user แยกต่อ test | ต้องมี API/test hook สร้าง user |

```ts
// storageState pattern (สำหรับอ้างอิง)
setup('authenticate', async ({ page }) => {
  await page.goto('/login'); /* … login … */
  await page.context().storageState({ path: '.auth/admin.json' });
});
// project: { name: 'admin-tests', use: { storageState: '.auth/admin.json' }, dependencies: ['setup'] }
```

## 📖 5. Network interception & mocking
```ts
// จำลอง server error 1 ครั้ง แล้วปล่อยผ่าน (tests/ui/catalog.spec.ts)
await page.route('**/api/products?*', route => route.fulfill({ status: 503, json: { error: { code: 'SERVICE_UNAVAILABLE', message: '…' } } }), { times: 1 });

// แก้ response จริง
await page.route('**/api/products/1', async route => {
  const res = await route.fetch(); const json = await res.json();
  await route.fulfill({ res, json: { ...json, stock: 0 } });
});

// บล็อกสิ่งที่ไม่จำเป็น (analytics, รูป) เพื่อความเร็ว
await page.route(/\.(png|jpg|svg)$/, route => route.abort());
```
ใช้ทดสอบ: error state, edge case ที่สร้างยากจาก backend, third-party ที่ไม่เสถียร · ⚠️ อย่า mock จนไม่ได้ทดสอบระบบจริงเลย

## 📖 6. สถานการณ์ยาก (ดู `tests/lab/elements.spec.ts`)
| สถานการณ์ | API |
|---|---|
| Dialog alert/confirm/prompt | `page.once('dialog', d => d.accept('text'))` — ตั้งก่อน action |
| iframe / nested | `page.frameLocator('#payment-frame').frameLocator('iframe')` |
| New tab / popup | `context.waitForEvent('page')` / `page.waitForEvent('popup')` |
| Download | `const p = page.waitForEvent('download'); await link.click(); const d = await p;` → `d.suggestedFilename()`, `d.path()` |
| Upload | `setInputFiles(path)` หรือ `{ name, mimeType, buffer }` (สร้างไฟล์ใน memory) |
| Shadow DOM (open) | locator ปกติเจาะให้อัตโนมัติ |
| Drag & drop | `source.dragTo(target)` |
| Infinite scroll | `page.mouse.wheel()` + `toHaveCount` |
| Flaky dependency | `expect(async () => {…}).toPass()` — retry *การกระทำ* ไม่ใช่ทั้ง test |

## 📖 7. Projects, parallel, sharding
```ts
projects: [
  { name: 'setup', testMatch: /global\.setup\.ts/ },                 // reset DB ครั้งเดียว
  { name: 'api', dependencies: ['setup'], … },
  { name: 'ui',  dependencies: ['setup'], testIgnore: /admin/ … },
  { name: 'ui-admin', dependencies: ['ui'] },                         // แก้ข้อมูลกลาง → รันหลัง
]
```
- `fullyParallel: true` — ทุก test รันขนานกันได้ → **ต้องอิสระต่อกัน** (ข้อมูลไม่ชน)
- `--shard=1/4` — แบ่งงานข้ามเครื่องใน CI (ดู `.github/workflows/test.yml`)
- `test.describe.configure({ mode: 'serial' })` — ใช้เมื่อจำเป็นจริงๆ เท่านั้น

> 🔑 **บทเรียนจริง:** admin test สร้างสินค้าใหม่ระหว่างที่ catalog test นับ "28 products" → fail แบบสุ่ม แก้โดยแยก admin tests เป็น project `ui-admin` ที่รัน **หลัง** `ui`

## 📖 8. Tags, annotations, test.info()
```ts
test('checkout @smoke @REQ-ORD-01', …)                          // --grep @smoke
test('…', { tag: ['@regression'], annotation: { type: 'issue', description: 'JIRA-123' } }, …)
await test.info().attach('axe-report.json', { body, contentType: 'application/json' });
```

---

## 🧪 Lab 10.1 — Refactor สู่ POM (90 นาที)
นำ test จาก Lab 09 มา refactor ใช้ page objects + fixtures ของตัวเอง (ห้าม copy จาก reference ทั้งไฟล์ — เขียนเองแล้วค่อยเทียบ)

## 🧪 Lab 10.2 — Data-driven pricing (60 นาที)
เขียน decision table จาก Lab 02.2 เป็น array แล้ว generate test ด้วย loop · Arrange ผ่าน API · Assert ผ่าน UI · ทุก row ต้องผ่านใน Bug Mode OFF และ row R2/R4/R9 ต้อง fail ใน Bug Mode ON

## 🧪 Lab 10.3 — Mocking (45 นาที)
(1) จำลอง 503 แล้วทดสอบปุ่ม Retry (2) แก้ response ให้สินค้า id=1 stock = 0 แล้วตรวจว่าปุ่ม Add to cart disabled (3) ทำให้ `/api/cart/quote` ช้า 3 วินาทีด้วย `route` + delay แล้วตรวจว่า UI ยังถูกต้อง

## 🧪 Lab 10.4 — Elements Lab II (60 นาที)
Automate การ์ด 4 (iframe), 5 (new tab/popup), 7 (shadow), 8 (DnD), 11 (table sort/filter), 12 (upload/download), 13 (infinite scroll)

---

## ✅ Check Your Understanding
1. Page object ควรมี `expect()` ไหม? ข้อยกเว้นคืออะไร?
2. fixture `freshUser` ช่วยให้รัน parallel ได้อย่างไร?
3. ข้อเสียของ storageState ที่แชร์ user เดียวทุก test?
4. `page.route` กับ `context.route` ต่างกันอย่างไร?
5. เมื่อไรควรใช้ `toPass()` และเมื่อไรไม่ควร?

<details><summary>เฉลย</summary>

1. โดยทั่วไปไม่ควร — ยกเว้น wait/ready check ภายใน (เช่น รอ spinner หาย, รอ summary render) ซึ่งเป็นส่วนของการ "ใช้หน้า" ให้ถูก
2. แต่ละ test มี user/ตะกร้า/order ของตัวเอง → ไม่แย่งข้อมูลกัน
3. test ที่แก้ตะกร้า/order ของ user เดียวกันจะชนกันเมื่อรันพร้อมกัน; สถานะค้างจาก test ก่อนหน้า
4. page.route มีผลเฉพาะ page นั้น · context.route มีผลทุก page ใน context (รวม popup/tab ใหม่)
5. ใช้กับ dependency ที่ flaky โดยธรรมชาติและการ retry เป็นพฤติกรรมที่ผู้ใช้ทำจริง (กดใหม่) — ไม่ควรใช้ซ่อน flaky ที่เกิดจาก test เขียนไม่ดี
</details>

## 📋 Skills Checklist
- [ ] สร้าง POM + component + fixtures ของตัวเอง
- [ ] ใช้ API เตรียมข้อมูลและตรวจสถานะหลังบ้าน
- [ ] mock network ได้ทั้ง fulfill/abort/modify
- [ ] จัดการ iframe/tab/download/upload/dialog ได้
- [ ] ออกแบบ projects ให้ test ที่แก้ข้อมูลกลางไม่กระทบ test อื่น

## 🚀 Real-world Notes
- ถ้าระบบจริงใช้ SSO/OAuth (Azure AD, Google) — ขอ **test tenant / bypass endpoint** หรือ token จาก API ของ identity provider; อย่า automate หน้า login ของ third party
- อย่าใส่ทุกอย่างใน `BasePage` — ใช้ composition (component objects) ดีกว่า inheritance ลึกๆ
