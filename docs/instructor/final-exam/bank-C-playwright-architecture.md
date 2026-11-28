# Final Exam Bank — Area C: Playwright & Test Architecture (M09, M10, M13, M15 · Ch 5–9)

> ⚠️ Spoiler (instructor key; this repository is public) · format: see [README.md](README.md)

### C-01
`area: C` · `module: M09` · `chapter: 5` · `level: K2` · `type: single` · `answer: B`

สองบรรทัดนี้ต่างกันอย่างไร
```ts
expect(await page.getByTestId('summary-total').textContent()).toBe('฿1,016.50');   // (1)
await expect(page.getByTestId('summary-total')).toHaveText('฿1,016.50');           // (2)
```

- A) ไม่ต่างกัน ทั้งสองรอให้ข้อความถูกต้อง
- B) (1) อ่านค่าครั้งเดียวไม่ retry · (2) retry จนตรงหรือหมดเวลา expect timeout
- C) (1) retry · (2) อ่านครั้งเดียว
- D) (2) ใช้ได้เฉพาะ Chromium

> **เหตุผล:** web-first assertion (2) retry อัตโนมัติ · แบบ (1) เป็นต้นเหตุ flaky ที่พบบ่อยเมื่อค่ายังไม่ถูก render · **อ้างอิง:** M09 §5, REF-094

### C-02
`area: C` · `module: M09` · `chapter: 5` · `level: K1` · `type: single` · `answer: D`

ก่อน `locator.click()` Playwright รอตรวจ actionability หลายข้อ ข้อใด **ไม่ใช่** การตรวจของ `click()`

- A) Visible
- B) Stable
- C) Receives events (ไม่มีอะไรบัง)
- D) Editable

> **เหตุผล:** click ตรวจ visible, stable, receives events, enabled, not inert · editable เป็นการตรวจของ `fill()`/`clear()` · **อ้างอิง:** M09 §4, REF-070

### C-03
`area: C` · `module: M09` · `chapter: 9` · `level: K3` · `type: single` · `answer: A`

หลังกดปุ่ม Apply coupon หน้าเว็บเรียก `POST /api/cart/quote` แล้วจึงอัปเดตยอด ข้อใดคือวิธีรอที่ดีที่สุดก่อนอ่านยอดรวม

- A) เริ่ม `page.waitForResponse('**/api/cart/quote')` ก่อนคลิก แล้ว await หลังคลิก (หรือ assert ยอดด้วย `toHaveText`)
- B) `await page.waitForTimeout(3000)`
- C) `await page.waitForLoadState('networkidle')` ทุกครั้งหลังคลิก
- D) เพิ่ม `retries: 3` ใน config

> **เหตุผล:** รอเหตุการณ์ที่เจาะจงหรือผลลัพธ์ที่ retry ได้ · sleep ช้าเสมอและอาจไม่พอ · networkidle ไม่เจาะจงและไม่แนะนำ · **อ้างอิง:** M09 §6, M17 §3

### C-04
`area: C` · `module: M09` · `chapter: 6` · `level: K3` · `type: single` · `answer: C`

`page.getByRole('button', { name: 'Start' }).click()` บนหน้า `/lab` ล้มด้วย strict mode violation เพราะ resolve ได้ 2 element สาเหตุและวิธีแก้คือข้อใด

- A) หน้าโหลดช้า — เพิ่ม timeout
- B) ปุ่มยังไม่ enabled — ใส่ `force: true`
- C) ชื่อ "Start" จับคู่แบบ substring กับปุ่ม "Start progress" ด้วย — ใช้ `exact: true` หรือ test id
- D) Playwright ไม่รองรับ role button — เปลี่ยนเป็น XPath

> **เหตุผล:** locator เป็น strict และ `name` จับคู่แบบ substring โดยปริยาย · `.first()` จะซ่อนปัญหาแทนที่จะแก้ · **อ้างอิง:** M09 §3, M17 §2, REF-020

### C-05
`area: C` · `module: M09` · `chapter: 9` · `level: K2` · `type: single` · `answer: B`

ใน CI ทำไมหลักสูตรแนะนำ `trace: 'retain-on-failure'`

- A) เพื่อให้ test รันเร็วขึ้น
- B) เพื่อเก็บ DOM snapshot, network, console และ action ทีละขั้นของ test ที่ล้มไว้ debug โดยไม่ต้องรันซ้ำ
- C) เพื่อให้ test ที่ล้ม retry อัตโนมัติ
- D) เพื่อส่งผลเข้า Jira

> **เหตุผล:** trace viewer ย้อนดูทุกขั้นได้ · เก็บเฉพาะตอนล้มเพื่อลดพื้นที่ · **อ้างอิง:** M09 §7

### C-06
`area: C` · `module: M10` · `chapter: 5` · `level: K3` · `type: single` · `answer: A`

ปุ่มเปิด `window.prompt()` ลำดับโค้ดใดถูกต้อง

- A) `page.once('dialog', d => d.accept('Playwright'))` แล้วจึง `await button.click()`
- B) `await button.click()` แล้วจึง `page.once('dialog', d => d.accept('Playwright'))`
- C) `await page.keyboard.type('Playwright')` หลังคลิก
- D) `await page.getByRole('dialog').fill('Playwright')`

> **เหตุผล:** ต้องลงทะเบียน handler ก่อน action ที่ทำให้ dialog เปิด · native dialog ไม่ใช่ element ใน DOM · **อ้างอิง:** M10 §6

### C-07
`area: C` · `module: M10` · `chapter: 5` · `level: K3` · `type: single` · `answer: D`

ลิงก์ "Open in new tab" เปิดหน้าใหม่ โค้ดใดได้ object ของหน้าใหม่อย่างเชื่อถือได้

- A) `await link.click(); const tab = context.pages()[1];`
- B) `await link.click(); await page.waitForTimeout(1000); const tab = context.pages().at(-1);`
- C) `const tab = await context.newPage(); await link.click();`
- D) `const [tab] = await Promise.all([context.waitForEvent('page'), link.click()]);`

> **เหตุผล:** เริ่มรอ event ก่อน/พร้อมกับ action เพื่อไม่พลาด event · ข้อ C สร้างหน้าว่างใหม่ไม่ใช่หน้าที่ลิงก์เปิด · **อ้างอิง:** M10 §6, M08 §3

### C-08
`area: C` · `module: M10` · `chapter: 8` · `level: K3` · `type: single` · `answer: B`

ต้องการทดสอบปุ่ม Retry ของหน้า catalog: ให้ `GET /api/products` ล้มด้วย 503 **ครั้งเดียว** แล้วปล่อยให้คำขอถัดไปไปถึง server จริง ข้อใดถูกต้อง

- A) `await page.route('**/api/products?*', r => r.abort())`
- B) `await page.route('**/api/products?*', r => r.fulfill({ status: 503, json: {...} }), { times: 1 })`
- C) ตั้ง chaos `failureRate: 1` ของทั้ง server ไว้ตลอด test
- D) `await page.unroute('**/api/products?*')` ก่อนเปิดหน้า

> **เหตุผล:** `fulfill` จำลอง response และ `times: 1` ใช้ route เพียงครั้งเดียว · chaos ของ server กระทบ test อื่นที่รันขนาน · **อ้างอิง:** M10 §5, `tests/ui/catalog.spec.ts`

### C-09
`area: C` · `module: M10` · `chapter: 7` · `level: K2` · `type: single` · `answer: C`

fixture `freshUser` (สร้างผู้ใช้ใหม่ผ่าน `POST /api/test/users` ทุก test) ช่วยอะไรมากที่สุด

- A) ทำให้ test ไม่ต้อง login
- B) ลดจำนวน request ไปที่ server
- C) ทำให้แต่ละ test มีตะกร้า/order ของตัวเอง จึงรันขนานกันได้โดยข้อมูลไม่ชน
- D) แทน page object ได้

> **เหตุผล:** isolation ของข้อมูลคือเงื่อนไขของ `fullyParallel` · บัญชีร่วมกันทำให้ test ชนกัน · **อ้างอิง:** M10 §2, M16 §2

### C-10
`area: C` · `module: M10` · `chapter: 8` · `level: K4` · `type: single` · `answer: A`

ใน framework หนึ่ง API client "ไม่ได้ login" กับ client ของ user A สร้างจาก fixture `request` ตัวเดียวกัน หลัง user A login แล้ว test "ไม่มี token ต้องได้ 401" กลับได้ 200 การแก้ที่ถูกต้องคือข้อใด

- A) ให้แต่ละ client มี `APIRequestContext` ของตัวเอง (`playwright.request.newContext()`) เพื่อแยก cookie
- B) เพิ่ม `retries: 1`
- C) logout ทุกครั้งก่อน assert
- D) เปลี่ยนไปใช้ `fetch` ของ Node

> **เหตุผล:** `request` fixture มี cookie jar เดียว cookie จาก login จึงติดไปกับ client อื่น · บทเรียนจริงตอนสร้าง fixture `newApi` ของ reference · **อ้างอิง:** M10 §2

### C-11
`area: C` · `module: M15` · `chapter: 7` · `level: K2` · `type: single` · `answer: D`

PO เปลี่ยนเกณฑ์ส่งฟรีจาก 1,000 เป็น 1,500 ใน framework ที่แยกชั้นถูกต้อง ส่วนใดควรต้องแก้

- A) Page object ของหน้า cart
- B) Fixture `userPage`
- C) ทุก test body ที่ตรวจยอดรวม
- D) Oracle/test data ที่คำนวณค่าคาดหวัง (และค่าขอบในตาราง test)

> **เหตุผล:** กฎธุรกิจอยู่ใน oracle (`expectedQuote`) และตารางข้อมูล · page object ไม่ควรมีกฎธุรกิจ · **อ้างอิง:** M15 §2, M15 quiz ข้อ 1

### C-12
`area: C` · `module: M15` · `chapter: 7` · `level: K4` · `type: multi` · `answer: B,C`

โค้ดต่อไปนี้มี framework smell ใดบ้าง **(เลือก 2 ข้อ)**
```ts
let orderNumber = '';
test.describe.configure({ mode: 'serial' });
test('test1', async ({ page }) => { /* …checkout… */ orderNumber = await page.locator('#order-number').innerText(); });
test('test2', async ({ page }) => {
  const rows = await page.getByTestId('order-row').count();
  let found = false;
  for (let i = 0; i < rows; i++) if ((await page.getByTestId('order-no').nth(i).innerText()) === orderNumber) found = true;
  expect(found).toBe(true);
});
```

- A) Over-abstraction
- B) Test inter-dependency (test2 ใช้ค่าที่ test1 สร้าง)
- C) Logic in tests (loop + if แทน assertion)
- D) God page object

> **เหตุผล:** test2 พึ่ง `orderNumber` จาก test1 และหา order ด้วย loop/if แทน `expect(row).toBeVisible()` · ไม่มี wrapper เกินจำเป็นหรือ page object ใหญ่ในโค้ดนี้ · **อ้างอิง:** M15 §7, Lab 15.4

### C-13
`area: C` · `module: M15` · `chapter: 7` · `level: K2` · `type: single` · `answer: A`

`buildCheckout({ paymentMethod: 'cod', card: undefined })` เป็นตัวอย่างของ pattern ใด และให้ประโยชน์อะไร

- A) Builder — มีค่าเริ่มต้นครบ test ระบุเฉพาะค่าที่สำคัญต่อ case นั้น ทำให้เห็นเจตนาชัด
- B) Singleton — ใช้ object เดียวทั้ง suite
- C) Page Object — ห่อ locator ของหน้า checkout
- D) Screenplay — แยก Actor กับ Task

> **เหตุผล:** test data builder ลดค่าซ้ำและทำให้ test อ่านง่าย · **อ้างอิง:** M15 §4.3

### C-14
`area: C` · `module: M13` · `chapter: 8` · `level: K3` · `type: single` · `answer: B`

API ของ order ถูกใช้โดยทั้งเว็บและแอปมือถือ การเปลี่ยนแปลงใดเป็น **breaking change** ที่ contract test ควรจับได้

- A) เพิ่ม field ใหม่ `estimatedDelivery` ใน response
- B) เปลี่ยนชื่อ field `orderNo` เป็น `orderNumber`
- C) เพิ่ม endpoint ใหม่ `GET /api/orders/{id}/tracking`
- D) เพิ่ม optional query parameter ใหม่

> **เหตุผล:** ลบ/เปลี่ยนชื่อ/เปลี่ยน type ของ field ทำให้ consumer พัง · การเพิ่มของใหม่โดยทั่วไปเข้ากันได้ย้อนหลัง · **อ้างอิง:** M13 §6, REF-007

### C-15
`area: C` · `module: M13` · `chapter: 8` · `level: K3` · `type: single` · `answer: C`

ข้อใดคือการออกแบบ test สำหรับ IDOR / BOLA ของ `GET /api/orders/{id}` ใน ShopLab ที่ถูกต้อง

- A) user A ดู order ของตัวเองต้องได้ 200
- B) ไม่ login แล้วเรียกต้องได้ 401
- C) user A สร้าง order แล้ว user B (login แยก) เรียก id นั้นต้องได้ 404
- D) admin เรียก order ของทุกคนต้องได้ 403

> **เหตุผล:** IDOR ต้องมี 2 ผู้ใช้ · ShopLab ตอบ 404 เพื่อไม่เปิดเผยว่ามี order id นั้น · ข้อ A, B ทดสอบเรื่องอื่น · ข้อ D ขัดกับ requirement · **อ้างอิง:** M13 §7, REQUIREMENTS REQ-SEC-01, REF-006
