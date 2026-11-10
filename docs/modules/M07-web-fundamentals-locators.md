# M07 — Web Fundamentals for Testers: DOM, Locators, HTTP, DevTools

> **Level 2 · Automation Foundations** · ⏱ 8 ชม. · Prerequisite: M06
> สาเหตุอันดับ 1 ของ test เปราะ = **locator ไม่ดี** · อันดับ 2 = **ไม่เข้าใจการโหลดแบบ async**

## 🎯 Learning Objectives
1. อ่านโครงสร้าง **HTML/DOM** และ **accessibility tree** ได้
2. เขียน **CSS selector** และ **XPath** ได้ และรู้ว่าเมื่อไหร่ "ไม่ควร" ใช้
3. ใช้ **locator strategy** ตามลำดับความทนทาน (role → label → text → test id → CSS → XPath)
4. อธิบาย **HTTP** (method, status, header, body), **cookie/session/token**, **CORS**
5. ใช้ **Chrome DevTools** (Elements, Console, Network, Application) เพื่อ debug และเก็บหลักฐาน

---

## 📖 1. HTML, DOM และ Accessibility Tree

```html
<form id="login-form" data-testid="login-form">
  <label for="username">Username</label>
  <input id="username" name="username" type="text" data-testid="username">
  <button type="submit" data-testid="login-button"><span>Login</span></button>
</form>
```
- **DOM** = ต้นไม้ของ element ที่ browser สร้าง (JavaScript เปลี่ยนได้ตลอดเวลา — ต่างจาก "View source")
- **Accessibility tree** = สิ่งที่ screen reader เห็น: *role* (`button`, `textbox`, `link`, `heading`) + *accessible name* ("Login")
  → Playwright `getByRole('button', { name: 'Login' })` ค้นจาก tree นี้ = ทดสอบแบบเดียวกับที่ผู้ใช้ "รับรู้" หน้าเว็บ

## 📖 2. Locator Strategy — เลือกอะไรก่อน

| ลำดับ | ประเภท | Playwright | Robot (Browser) | ทนทาน | หมายเหตุ |
|---|---|---|---|---|---|
| 1 | Role + name | `getByRole('button', {name:'Login'})` | `role=button[name="Login"]` | ⭐⭐⭐⭐ | ทดสอบ a11y ไปในตัว |
| 2 | Label | `getByLabel('Username')` | `id=username` / label | ⭐⭐⭐⭐ | form fields |
| 3 | Placeholder / Text | `getByPlaceholder()`, `getByText()` | `text=...`, `"..."` | ⭐⭐⭐ | ระวังข้อความเปลี่ยน/แปลภาษา |
| 4 | Test ID | `getByTestId('login-button')` | `data-testid=login-button` | ⭐⭐⭐⭐⭐ | ต้องตกลงกับ dev — เสถียรที่สุด |
| 5 | CSS | `locator('#username')`, `locator('.btn.primary')` | `css=...` | ⭐⭐ | class เปลี่ยนตาม design |
| 6 | XPath | `locator('//button[text()="Login"]')` | `xpath=...` | ⭐ | ยาว เปราะ ใช้เป็นทางเลือกสุดท้าย |

**ห้ามใช้:** id ที่สุ่ม (`#btn-x8k2f1`), index ลอยๆ (`div:nth-child(7)`), XPath แบบ absolute (`/html/body/div[2]/div/form/button`), class ที่สร้างโดย CSS-in-JS (`.css-1q2w3e`)
ฝึกได้ที่ ShopLab `/lab` การ์ด **3. Dynamic IDs & classes**

> ⚠️ **ระวัง accessible name ที่เปลี่ยนตาม state:** ปุ่ม Login เปลี่ยนเป็น "Signing in…" ระหว่างโหลด → `getByRole('button', {name:'Login'})` หาไม่เจอระหว่างนั้น — reference framework จึงใช้ `getByTestId('login-button')` (ดู `src/pages/LoginPage.ts`)

### CSS selector cheat sheet
```css
#id                     .class                   tag
[data-testid="cart-row"]                        [name^="field_"]   /* ขึ้นต้นด้วย */
[data-testid="cart-row"][data-sku="ELEC-001"]   /* หลาย attribute */
form#login-form > button                        /* ลูกโดยตรง */
.product-card .price                            /* ลูกหลาน */
tr:nth-child(2) td:nth-child(4)                 /* ตำแหน่ง — ใช้กับตารางที่ลำดับมีความหมาย */
```

### XPath ที่ควรรู้ (สำหรับกรณีจำเป็น)
```xpath
//button[normalize-space()="Save changes"]
//tr[td[2]="ELEC-001"]/td[4]                  ← หา cell ในแถวที่มีค่า X (ตาราง)
//label[contains(.,"Username")]/following-sibling::input
//*[@data-testid="product-card"][.//text()[contains(.,"Mouse")]]
```

### Chaining & filtering (แนวทางสมัยใหม่แทน XPath ยาวๆ)
```ts
page.getByTestId('cart-row').filter({ hasText: 'Wireless Mouse' }).getByRole('button', { name: /Remove/ })
page.locator('[data-testid="product-card"][data-sku="ELEC-001"]').getByRole('button', { name: 'Add to cart' })
```

## 📖 3. Shadow DOM, iframe และ window
- **Shadow DOM** — component ห่อ DOM ไว้ข้างใน: *open* root → Playwright/Browser lib เจาะเข้าได้อัตโนมัติ (**ยกเว้น XPath** ซึ่งไม่เจาะ shadow root), *closed* root → เข้าไม่ได้ ต้องคุยกับ dev
- **iframe** — เอกสารแยก ต้องสลับ context (`frameLocator`, Browser lib `>>>`)
- **New tab/popup** — เป็น page ใหม่ ต้องรอ event (`context.waitForEvent('page')`)
ฝึกทั้งหมดที่ `/lab` การ์ด 4, 5, 7

## 📖 4. HTTP พื้นฐาน

```
POST /api/auth/login HTTP/1.1               ← method + path
Host: localhost:3000
Content-Type: application/json              ← headers
{"username":"customer","password":"…"}      ← body

HTTP/1.1 200 OK                              ← status
Set-Cookie: sl_token=eyJ…; HttpOnly; SameSite=Lax
Content-Type: application/json; charset=utf-8
{"token":"eyJ…","user":{…}}
```

| Method | ใช้ทำ | Idempotent? |
|---|---|---|
| GET | อ่าน | ✅ |
| POST | สร้าง / action | ❌ |
| PUT | แทนที่ทั้งก้อน | ✅ |
| PATCH | แก้บางส่วน | ⚠️ ขึ้นกับการออกแบบ |
| DELETE | ลบ | ✅ |

| Status | ความหมาย | ShopLab ตัวอย่าง |
|---|---|---|
| 200/201/204 | สำเร็จ / สร้างแล้ว / ไม่มี body | login, add to cart, logout |
| 400 | input ผิด | `VALIDATION_ERROR`, `INVALID_JSON` |
| 401 | ยังไม่ยืนยันตัวตน | เรียก `/api/cart` โดยไม่ login |
| 402 | ชำระเงินไม่สำเร็จ | บัตร 4000…0002 |
| 403 | ไม่มีสิทธิ์ | customer เรียก `/api/admin/*` |
| 404 | ไม่พบ | product 99999 / order ของคนอื่น |
| 409 | ขัดแย้งกับสถานะ | stock ไม่พอ, เปลี่ยนสถานะ order ผิด |
| 423 | ถูกล็อก | บัญชี locked |
| 5xx | server ผิดพลาด | chaos `failureRate` → 503 |

### Cookie vs Token
- ShopLab login คืน **token** ใน body *และ* ตั้ง **cookie `sl_token` (HttpOnly)** — browser ส่ง cookie อัตโนมัติ, API client ส่ง `Authorization: Bearer <token>`
- เคล็ดลับ automation: **login ผ่าน API แล้วฉีด cookie** เข้า browser = เร็วและเสถียรกว่า login ผ่าน UI ทุก test (ดู fixture `userPage`)
- บทเรียนจาก Postman: cookie jar ส่ง cookie อัตโนมัติ ทำให้ test "ไม่มี token → 401" ได้ 200 — ต้องปิด cookie ใน request นั้น

## 📖 5. Chrome DevTools สำหรับ tester
- **Elements** — ดู DOM จริง, ทดสอบ selector: `Ctrl+F` ใน Elements แล้วพิมพ์ CSS/XPath, ดู Accessibility pane
- **Console** — `$$('[data-testid="product-card"]').length`, `$x('//button')`, ดู JS error
- **Network** — ดู request/response, status, timing, **Copy as cURL**, export **HAR** แนบ bug, throttling (Slow 3G)
- **Application** — cookie, localStorage (`sl_lang`), sessionStorage (`sl_coupon`)
- **Recorder / Lighthouse** — บันทึก flow, ตรวจ performance/a11y เบื้องต้น

---

## 🧪 Lab 07.1 — Locator challenge (60 นาที)
ที่หน้า `/lab` เขียน locator (Playwright syntax หรือ CSS) สำหรับ 15 element โดย **ห้ามใช้ id ที่สุ่ม** — เช่น ปุ่ม "Save changes" ในการ์ด 3, ช่องชื่อใน open shadow DOM, แถวที่ 3 ของตาราง employees, ลิงก์ Settings ในเมนู hover, ปุ่ม Greet ใน closed shadow (อธิบายว่าทำไมทำไม่ได้)
ทดสอบด้วย `npx playwright codegen http://localhost:3000/lab` (ปุ่ม "Pick locator") หรือ DevTools

## 🧪 Lab 07.2 — DevTools investigation (45 นาที)
1. เปิด Network แล้ว login → บันทึก request/response ของ `/api/auth/login`, หา cookie ที่ถูกตั้ง
2. ใส่คูปอง SAVE10 ในตะกร้า → หา request ที่คำนวณราคา และ "Copy as cURL" มารันใน terminal
3. เปิด chaos `{"latencyMs": 2000}` → สังเกต spinner และ timing ใน Network
4. เปิด chaos `{"failureRate": 1}` → หน้า catalog แสดงอะไร? status code อะไร? (ปิด chaos หลังจบ)

## 🧪 Lab 07.3 — HTTP ด้วยมือ (30 นาที)
ใช้ curl/Postman ทำให้ได้ status ครบ: 200, 201, 204, 400, 401, 403, 404, 409, 423 — จดคำสั่งที่ใช้

---

## ✅ Check Your Understanding
1. เรียงลำดับความทนทาน: XPath absolute, `getByRole`, `getByTestId`, `.btn.primary`
2. ทำไม `getByRole` ช่วยตรวจ accessibility ไปในตัว?
3. 401 กับ 403 ต่างกันอย่างไร?
4. ปุ่มใน closed shadow root automate ได้อย่างไร?
5. ทำไมควร login ผ่าน API แทน UI ในเกือบทุก test?

<details><summary>เฉลย</summary>

1. `getByTestId` ≈ `getByRole` > `.btn.primary` > XPath absolute
2. ถ้า element ไม่มี role/accessible name ที่ถูกต้อง (เช่น `<div onclick>` หรือปุ่มไม่มีข้อความ) test จะหาไม่เจอ → บังคับให้ UI เข้าถึงได้
3. 401 = ยังไม่ได้ยืนยันตัวตน/token ไม่ valid · 403 = รู้ว่าเป็นใครแต่ไม่มีสิทธิ์
4. ด้วย locator ปกติไม่ได้ — ขอ dev เปลี่ยนเป็น open/เพิ่ม test hook, หรือทดสอบผ่าน API/component test; ทางเลี่ยงคือคลิกด้วย coordinate/keyboard (เปราะ)
5. เร็วกว่า, ไม่ขึ้นกับ UI login ที่อาจพัง, test โฟกัสสิ่งที่ต้องการทดสอบ — เก็บ UI login ไว้ใน test ของ login เท่านั้น
</details>

## 📋 Skills Checklist
- [ ] เขียน locator ที่ทนทานได้ทุกประเภทใน Elements Lab
- [ ] อธิบาย HTTP method/status/header และ cookie vs token
- [ ] ใช้ DevTools Network เก็บหลักฐาน (HAR, cURL) ได้

## 🚀 Real-world Notes
- เสนอ **Testability guideline** ให้ทีม dev: ใส่ `data-testid` ใน element ที่มี interaction, ห้ามลบ/เปลี่ยนชื่อโดยไม่แจ้ง, ใช้ semantic HTML (`<button>` ไม่ใช่ `<div>`)
- ใน React/Vue/Angular เพิ่ม `data-testid` ได้ง่าย และสามารถตัดออกตอน build production ได้ถ้าต้องการ
