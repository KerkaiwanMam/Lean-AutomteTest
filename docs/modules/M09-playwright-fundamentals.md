# M09 — Playwright Fundamentals

> **Level 3 · Tools** · ⏱ 8 ชม. · Prerequisite: M07, M08 · Reference: `tests/playwright/`

## 🎯 Learning Objectives
1. ติดตั้งและตั้งค่า Playwright Test (`playwright.config.ts`)
2. ใช้ **locators**, **actions** และ **web-first assertions** ได้ถูกต้อง
3. อธิบาย **auto-waiting** และ **actionability checks** — และเลิกใช้ `waitForTimeout`
4. ใช้ **codegen**, **UI mode**, **trace viewer**, **debug mode**
5. จัดกลุ่ม test ด้วย `describe`, hooks, tags (`@smoke`) และรันแบบเลือกได้

---

## 📖 1. ติดตั้ง
```bash
npm init playwright@latest          # โปรเจกต์ใหม่ (เลือก TypeScript)
# หรือในโปรเจกต์นี้
cd tests/playwright && npm ci && npx playwright install chromium
npx playwright test                 # รันทั้งหมด
npx playwright test --ui            # UI mode (แนะนำตอนพัฒนา)
npx playwright show-report          # เปิด HTML report
```
> ใช้ Chrome ที่ติดตั้งในเครื่องแทน chromium ที่ดาวน์โหลด: `PW_CHANNEL=chrome npx playwright test` (config อ่านค่านี้)

## 📖 2. Anatomy ของ test
```ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('customer can log in @smoke', async ({ page }) => {
    await page.goto('/login');                                         // baseURL มาจาก config
    await page.getByLabel('Username').fill('customer');               // locator + action
    await page.getByLabel('Password', { exact: true }).fill('Passw0rd!');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL('/');                                 // web-first assertion
    await expect(page.getByTestId('nav-username')).toContainText('customer');
  });
});
```
- `{ page }` คือ **fixture** — Playwright สร้าง browser context ใหม่ (สะอาด ไม่มี cookie) ให้ทุก test
- **Arrange → Act → Assert** แยกให้ชัด

## 📖 3. Locators (สรุปจาก M07)
```ts
page.getByRole('button', { name: 'Add to cart' })
page.getByLabel('Coupon code')
page.getByPlaceholder('Type your nickname')
page.getByText('Hello World! Content loaded.')
page.getByTestId('summary-total')
page.locator('[data-testid="cart-row"][data-sku="ELEC-001"]')
// การกรองและ chain
page.getByTestId('product-card').filter({ hasText: 'Mouse' }).getByRole('button')
page.getByTestId('product-card').nth(0)       // .first() / .last()
```
Locator เป็น **lazy** — ยังไม่ค้นหาจนกว่าจะใช้ และค้นหาใหม่ทุกครั้ง (ไม่มี StaleElementException แบบ Selenium)

## 📖 4. Actions
`click()`, `dblclick()`, `click({ button: 'right' })`, `fill()`, `pressSequentially()` (พิมพ์ทีละตัว — สำหรับ autocomplete), `press('Enter')`, `check()`, `selectOption()`, `setInputFiles()`, `hover()`, `dragTo()`, `focus()`

**Actionability checks** — ก่อน `click()` Playwright รอให้ element: visible · stable (ไม่ขยับ) · receives events (ไม่มีอะไรบัง) · enabled · not inert — แต่ละ action ตรวจไม่เท่ากัน เช่น `fill()` ตรวจ visible · enabled · editable · not inert (ตารางเต็มใน docs "Auto-waiting / Actionability")
> เห็นใน log ของ failure จริงตอนสร้างหลักสูตร: `<a role="menuitem"> … subtree intercepts pointer events` — เมนู hover ยังเปิดค้างและบังปุ่มถัดไป → แก้โดยปิดเมนูก่อน (ดู `tests/lab/elements.spec.ts`)

## 📖 5. Web-first assertions (auto-retry)
```ts
await expect(locator).toBeVisible();            toBeHidden(), toBeEnabled(), toBeDisabled(), toBeChecked()
await expect(locator).toHaveText('…');          toContainText(), toHaveValue(), toHaveAttribute()
await expect(locator).toHaveCount(8);
await expect(page).toHaveURL(/\/cart/);         toHaveTitle()
await expect.poll(() => cartPage.summary()).toEqual(expected);   // retry ฟังก์ชันใดๆ
await expect(async () => { … }).toPass();       // retry ทั้งก้อน (ใช้อย่างระวัง)
```
❌ **ห้าม:** `expect(await locator.textContent()).toBe('x')` — อ่านค่า **ครั้งเดียว** ไม่ retry → flaky
✅ **ใช้:** `await expect(locator).toHaveText('x')` — retry จนผ่านหรือ timeout

**Soft assertions:** `expect.soft(...)` — fail แต่รันต่อ เหมาะกับตรวจหลาย field ในหน้าเดียว

## 📖 6. ห้าม sleep
```ts
await page.waitForTimeout(3000);   // ❌ ช้าเสมอ และยังอาจไม่พอ
await expect(page.getByText('Hello World! Content loaded.')).toBeVisible({ timeout: 10_000 }); // ✅
await page.waitForResponse(r => r.url().endsWith('/api/cart/quote'));                          // ✅ รอ network
```

## 📖 7. Configuration ที่สำคัญ (`playwright.config.ts`)
| ตั้งค่า | ความหมาย | ในโปรเจกต์นี้ |
|---|---|---|
| `baseURL` | URL ตั้งต้น | จาก `BASE_URL` env |
| `testIdAttribute` | attribute ของ `getByTestId` | `data-testid` |
| `timeout` / `expect.timeout` | เวลาสูงสุดต่อ test / ต่อ assertion | 30s / 5s |
| `retries` | รันซ้ำเมื่อ fail | CI = 1 |
| `trace`, `screenshot`, `video` | หลักฐานเมื่อ fail | retain-on-failure |
| `projects` | ชุดการรัน (browser/device/ประเภท test) | setup, api, ui, ui-admin, visual |
| `webServer` | start แอปให้อัตโนมัติ | start ShopLab ถ้ายังไม่รัน |

## 📖 8. เครื่องมือช่วย
- **Codegen:** `npx playwright codegen http://localhost:3000` — บันทึกการกระทำเป็นโค้ด + ปุ่ม *Pick locator* (ใช้เป็นจุดเริ่ม แล้ว refactor เข้ากับ POM เสมอ)
- **UI mode:** `--ui` — watch mode, time-travel, ดู DOM snapshot ทีละ step
- **Debug:** `--debug` หรือ `await page.pause()` — Playwright Inspector
- **Trace viewer:** `npx playwright show-trace test-results/…/trace.zip` — ดู action, DOM, network, console ย้อนหลัง (แนบกับ bug report ได้)
- **VS Code extension** — รัน/debug test จาก gutter, record new test

## 📖 9. Organizing & running
```bash
npx playwright test tests/ui/auth.spec.ts           # ไฟล์เดียว
npx playwright test -g "locked account"              # ตามชื่อ
npx playwright test --grep @smoke                    # ตาม tag
npx playwright test --project=api                    # ตาม project
npx playwright test --headed --workers=1             # เห็น browser, ทีละ test
npx playwright test --repeat-each=5                  # หา flaky
```
Hooks: `test.beforeEach`, `test.afterEach`, `test.beforeAll`, `test.afterAll` · `test.skip()`, `test.fixme()`, `test.fail()` (ใช้กับ known bug), `test.slow()`

---

## 💡 Worked Example
อ่าน `tests/playwright/tests/ui/auth.spec.ts` และ `tests/ui/catalog.spec.ts` แล้วตอบ: test ไหนใช้ **network mocking**? test ไหนพิสูจน์ว่า **ไม่ต้อง sleep** แม้ login ช้า 3 วินาที?

## 🧪 Lab 09.1 — Test แรก (60 นาที)
สร้างไฟล์ `tests/ui/my-first.spec.ts` (ไม่ใช้ POM): (1) ค้นหา "coffee" ต้องเจอ 1 รายการ (2) กรอง category home ต้องมี 5 (3) สินค้าหมดปุ่ม disabled (4) เปลี่ยนภาษาเป็น TH แล้วหัวข้อเป็น "สินค้า"

## 🧪 Lab 09.2 — Login suite (60 นาที)
เขียน login tests ครอบคลุม REQ-AUTH-01..05, 07 โดยใช้ `test.describe` + loop data-driven สำหรับ invalid credentials · รันด้วย `--repeat-each=3` ต้องผ่านทุกครั้ง

## 🧪 Lab 09.3 — Elements Lab I (60 นาที)
Automate การ์ด 1 (dialogs), 2 (dynamic loading), 6 (hover/right-click/double-click), 9 (form controls) — ห้ามใช้ `waitForTimeout`

## 🧪 Lab 09.4 — Debugging (30 นาที)
ทำให้ test หนึ่ง fail โดยตั้งใจ (เปลี่ยนค่าคาดหวัง) แล้วเปิด trace viewer อธิบายว่าเห็นอะไรบ้าง

---

## ✅ Check Your Understanding
1. `expect(await loc.isVisible()).toBe(true)` กับ `await expect(loc).toBeVisible()` ต่างกันอย่างไร?
2. Playwright รออะไรบ้างก่อน `click()`?
3. ถ้าต้องรอให้ API คำนวณราคาเสร็จก่อนอ่านยอด ควรใช้อะไร?
4. ใช้ codegen แล้ว commit โค้ดที่ได้ทันทีมีปัญหาอะไร?
5. `test.fail()` ใช้เมื่อไร?

<details><summary>เฉลย</summary>

1. แบบแรกตรวจครั้งเดียว ไม่ retry → flaky · แบบหลัง retry จนกว่าจะผ่านหรือ timeout
2. visible, stable, receives events (ไม่ถูกบัง), enabled, not inert — และ scroll เข้าหน้าจอให้
3. `page.waitForResponse(...)` คู่กับ action หรือ web-first assertion บนผลลัพธ์ (`toHaveText`) / `expect.poll`
4. locator อาจไม่ดี, ไม่มีโครงสร้าง (POM), มีค่าซ้ำ/hard-code, ไม่มี assertion ที่มีความหมาย
5. เมื่อรู้ว่ามีบั๊กอยู่ (known issue) — test จะ "ผ่าน" ถ้า fail และจะแจ้งเตือนเมื่อบั๊กถูกแก้แล้ว
</details>

## 📋 Skills Checklist
- [ ] เขียน test ด้วย role/label/test-id locators และ web-first assertions
- [ ] ไม่มี `waitForTimeout` ในโค้ดของตัวเอง
- [ ] ใช้ UI mode, codegen, trace viewer ได้
- [ ] รัน test แบบเลือก (grep, project, file) ได้

## 🚀 Real-world Notes
- เปิด `trace: 'retain-on-failure'` ใน CI เสมอ — คุ้มกว่า video
- ใน Windows ถ้าเห็น error `ffmpeg … Executable doesn't exist` ให้รัน `npx playwright install ffmpeg` (เจอจริงตอนสร้างหลักสูตรนี้)
