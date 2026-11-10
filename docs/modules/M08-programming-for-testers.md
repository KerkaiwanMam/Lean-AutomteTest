# M08 — Programming for Testers (TypeScript & Python Essentials)

> **Level 2 · Automation Foundations** · ⏱ 10 ชม. · Prerequisite: M06

## 🎯 Learning Objectives
1. ใช้ตัวแปร, ชนิดข้อมูล, เงื่อนไข, loop, function, object/array ใน **TypeScript** และ **Python**
2. เข้าใจ **async/await และ Promise** (หัวใจของ Playwright)
3. ใช้ **class** และ **module (import/export)** เพื่อจัดโครงสร้างโค้ด
4. จัดการ **error (try/catch)** และอ่าน stack trace
5. เขียน function ช่วย (utility) ที่มี unit test

---

## 📖 1. TypeScript vs Python — เทียบกันเร็วๆ

| แนวคิด | TypeScript | Python |
|---|---|---|
| ตัวแปร | `const price = 999; let qty = 1;` | `price = 999` |
| ชนิดข้อมูล | `const name: string = 'Mouse'` | `name: str = "Mouse"` (type hint) |
| Array/List | `const skus: string[] = ['A', 'B']` | `skus = ["A", "B"]` |
| Object/Dict | `{ sku: 'ELEC-001', price: 499 }` | `{"sku": "ELEC-001", "price": 499}` |
| เงื่อนไข | `if (x >= 1000) {...} else {...}` | `if x >= 1000: ... else: ...` |
| Loop | `for (const p of products) {...}` | `for p in products: ...` |
| Function | `function add(a: number, b: number): number { return a + b; }` | `def add(a: int, b: int) -> int: return a + b` |
| Arrow / lambda | `const double = (n: number) => n * 2` | `double = lambda n: n * 2` |
| String template | `` `Total: ${total}` `` | `f"Total: {total}"` |
| map/filter | `prices.filter(p => p > 500).map(p => p * 1.07)` | `[p * 1.07 for p in prices if p > 500]` |
| Error | `try {...} catch (e) {...}` | `try: ... except Exception as e: ...` |

## 📖 2. ตัวอย่างจริงใน repo

**TypeScript — แปลงข้อความเงินเป็นตัวเลข** (`tests/playwright/src/utils/money.ts`)
```ts
export function parseMoney(text: string | null): number {
  const t = (text ?? '').trim();
  if (/^free$/i.test(t)) return 0;
  const n = Number(t.replace(/[^\d.-]/g, ''));
  if (Number.isNaN(n)) throw new Error(`Cannot parse money from "${text}"`);
  return n;
}
```

**Python — keyword เดียวกันใน Robot library** (`tests/robot/libraries/ShopLabLibrary.py`)
```python
@keyword("Parse Money")
def parse_money(self, text: str) -> float:
    text = (text or "").strip()
    if text.upper() == "FREE":
        return 0.0
    return float(re.sub(r"[^\d.\-]", "", text))
```

## 📖 3. Async / Await — ทำไม Playwright ต้อง `await` ทุกบรรทัด
Browser ทำงานแยกจากโค้ด test ทุกคำสั่ง (คลิก, กรอก, รอ) ใช้เวลา → คืนค่าเป็น **Promise**
```ts
// ❌ ลืม await: คลิกยังไม่เสร็จ แต่ไปบรรทัดถัดไปแล้ว → flaky / error แปลกๆ
page.getByRole('button', { name: 'Login' }).click();

// ✅
await page.getByRole('button', { name: 'Login' }).click();

// รอหลายอย่างพร้อมกัน (เช่น รอ tab ใหม่ที่เกิดจากการคลิก)
const [newTab] = await Promise.all([
  context.waitForEvent('page'),
  page.getByRole('link', { name: 'Open in new tab' }).click(),
]);
```
> ESLint rule `@typescript-eslint/no-floating-promises` ช่วยจับการลืม `await`

## 📖 4. Class และ Module — พื้นฐานของ Page Object
```ts
// src/pages/LoginPage.ts
export class LoginPage {
  readonly username: Locator;
  constructor(private readonly page: Page) {          // หรือกำหนดค่าใน constructor
    this.username = page.getByLabel('Username');
  }
  async login(user: Credentials): Promise<void> { ... }
}

// tests/ui/auth.spec.ts
import { LoginPage } from '../../src/pages/LoginPage';
```
หลักการ: **1 class = 1 หน้าที่**, ชื่อ method เป็น "สิ่งที่ผู้ใช้ทำ" (`login`, `addToCart`) ไม่ใช่ "click button 3"

## 📖 5. ข้อมูลแบบ JSON — ภาษากลางของ API
```ts
const res = await request.post('/api/auth/login', { data: { username, password } });
const body = await res.json();          // object
expect(body.user.role).toBe('customer');
```
```python
resp = requests.post(f"{BASE_URL}/api/auth/login", json={"username": u, "password": p})
assert resp.json()["user"]["role"] == "customer"
```

## 📖 6. Clean code สำหรับ test
- ชื่อตัวแปร/function สื่อความหมาย: `expectedTotal` ไม่ใช่ `x2`
- **ไม่มี magic number** — `const FREE_SHIPPING_THRESHOLD = 1000`
- function สั้น ทำอย่างเดียว · DRY แต่ **อย่า DRY จนอ่าน test ไม่ออก** (DAMP: Descriptive And Meaningful Phrases ใน test)
- ใช้ TypeScript `strict` mode และ type ของข้อมูล (`type Address = {...}`) — editor ช่วยเตือนก่อนรัน

---

## 🧪 Lab 08.1 — Kata: pricing oracle (90 นาที)
เขียน function `expectedQuote(subtotal, discount, shippingMethod, freeShipCoupon)` ทั้ง TS และ Python ตาม REQ-PRC แล้วเขียน unit test ≥ 8 cases (ใช้ `node:test` หรือ `pytest`) — เทียบกับ `src/utils/money.ts` ของ reference

## 🧪 Lab 08.2 — Script แรกที่คุย API (60 นาที)
เขียนสคริปต์ (TS ด้วย `fetch` หรือ Python ด้วย `requests`) ที่: reset → สร้าง user → login → เพิ่มสินค้า 3 ชิ้น → ขอ quote → พิมพ์ตารางสรุป → assert ว่า total ถูกต้องตาม oracle จาก Lab 08.1

## 🧪 Lab 08.3 — Async debugging (30 นาที)
ลบ `await` ออกจาก 1 บรรทัดใน `tests/playwright/tests/ui/auth.spec.ts` รันแล้วอ่าน error — อธิบายสิ่งที่เกิดขึ้น แล้วคืนค่าเดิม

---

## ✅ Check Your Understanding
1. ผลลัพธ์ของ `[3, 1, 10].sort()` ใน JavaScript คืออะไร และเกี่ยวกับบั๊กใดใน ShopLab?
2. `0.1 + 0.2 === 0.3` ใน JS เป็น true หรือ false? ส่งผลต่อการทดสอบราคาอย่างไร?
3. ทำไม Page Object method ควรคืนค่า `Promise<void>` และต้องถูก `await`?
4. DRY vs DAMP ใน test code ต่างกันอย่างไร?

<details><summary>เฉลย</summary>

1. `[1, 10, 3]` — sort แบบ string! ตรงกับ BUG-04 (sort ราคาเป็นข้อความ) → ใน test ต้อง `sort((a, b) => a - b)`
2. false (floating point) — ต้องปัดทศนิยม (`round2`) หรือใช้ `toBeCloseTo` เมื่อเทียบเงิน
3. เพราะเป็น async operation กับ browser; ถ้าไม่ await ลำดับการทำงานจะผิดและ error จะไม่ถูกจับ
4. DRY = ไม่ซ้ำ (เหมาะกับ framework code), DAMP = อ่านแล้วเข้าใจทันที (เหมาะกับ test body) — ยอมซ้ำเล็กน้อยใน test เพื่อความชัดเจน
</details>

## 📋 Skills Checklist
- [ ] เขียน function + unit test ได้ทั้ง TS และ Python
- [ ] อธิบายและใช้ async/await ได้ถูกต้อง
- [ ] เขียน class และ import/export ระหว่างไฟล์ได้
- [ ] เรียก REST API จากโค้ดและตรวจ JSON ได้

## 🚀 Real-world Notes
- เลือกภาษา automation ให้ **ตรงกับภาษาของทีม dev** ถ้าทำได้ — dev ช่วย review และแก้ test ได้
- ฝึกต่อด้วย kata สั้นๆ ทุกวัน (Exercism, Codewars) 20 นาที ดีกว่าเรียนทีเดียว 5 ชั่วโมง
