# M01b — Test Types in Practice: 10 ประเภทการทดสอบที่ใช้ในงานจริง

> **Level 1 · Foundations** · ⏱ 6 ชม. · Prerequisite: M01 · ภาคเสริมของ M01 §4 · ISTQB CTFL v4.0.1 §2.2, §5.1.6–5.1.7, §6.2

โมดูลนี้ขยาย "ประเภทการทดสอบ" 10 แบบที่ใช้เรียกกันในงาน QA จริง (โดยเฉพาะระบบธนาคารและระบบองค์กร) ให้ครบทั้งนิยาม สิ่งที่ต้องตรวจ ตัวอย่างใน ShopLab และ LoanLab และวิธีประยุกต์ใช้ในโปรเจกต์ แต่ละหัวข้อชี้ไปยังโมดูลที่สอนเชิงลึกต่อ

## 🎯 Learning Objectives
เมื่อจบโมดูลนี้ ผู้เรียนสามารถ:
1. อธิบาย 10 ประเภทการทดสอบ (Functional, UI, API, Database, Batch Process, File Interface, Integration, End-to-End, Regression, Automation) พร้อมตัวอย่างของตัวเองได้
2. บอกว่าแต่ละประเภทอยู่ในมิติใดตามภาษาของ ISTQB — test type, test level, change-related testing หรือช่องทางที่ทดสอบ
3. เลือกชั้นที่เหมาะสม (UI, API, database, file, batch) ในการทดสอบ business rule หนึ่งข้อ และให้เหตุผลได้
4. ออกแบบ test ของ batch job และ file interface ครอบคลุม input, processing, output, control total และการรันซ้ำ
5. วางแผน regression และ automation จาก impact analysis และความเสี่ยง

---

## 📖 0. แผนที่: 10 ประเภทนี้อยู่ตรงไหนในภาษาของ ISTQB

รายการ 10 ประเภทเป็นภาษาที่ใช้ในงานจริงและในประกาศรับสมัครงาน แต่ละคำตอบคำถามคนละมิติ ISTQB CTFL v4.0.1 แยกมิติเหล่านี้ไว้ดังนี้ (REF-097)

| ชื่อที่ใช้ในงาน | ISTQB จัดไว้ที่ไหน | ตอบคำถาม |
|---|---|---|
| Functional Testing | **Test type** (§2.2.2) | ทดสอบ "คุณลักษณะ" อะไร — ระบบทำ *อะไร* ได้ถูกต้องครบถ้วน |
| UI / API / Database / Batch / File Interface Testing | ไม่ใช่ test type ใน syllabus — เป็น **ช่องทางหรือชั้นของ test object** ที่เราใช้กระตุ้นและสังเกตระบบ (การจัดกลุ่มนี้เป็นของหลักสูตร) | ทดสอบ "ผ่านช่องทางไหน" |
| Integration Testing | **Test level**: component integration testing และ system integration testing (§2.2.1) | ทดสอบ "ในระดับไหน" — รอยต่อระหว่างส่วน |
| End-to-End Testing | ไม่ได้เป็น test level แยก — syllabus ระบุว่า system testing มักรวม "functional testing of end-to-end tasks" และวาง end-to-end tests ไว้ชั้นบนสุดของ test pyramid (§2.2.1, §5.1.6) | ทดสอบ "ขอบเขตกว้างแค่ไหน" — ทั้งกระบวนการ |
| Regression Testing | **Change-related testing** คู่กับ confirmation testing (§2.2.3) | ทดสอบ "เมื่อไร" — หลังมีการเปลี่ยนแปลง |
| Automation Testing | **Tool support / test automation** (§6) — เป็นวิธีรัน test ใช้ได้กับทุกประเภทข้างบน | ทดสอบ "ด้วยวิธีใด" |

**ผลที่ตามมา:** test case หนึ่งตัวมีได้หลายป้ายพร้อมกัน เช่น "automated **API** **regression** test ของ **functional** rule LL-PAY-06" — ไม่มีป้ายใดผิด เพราะแต่ละป้ายตอบคนละคำถาม

```
              ทดสอบอะไร          ผ่านช่องทางไหน           ระดับไหน                 เมื่อไร            ด้วยวิธีใด
           ┌────────────┐   ┌──────────────────┐   ┌────────────────────┐   ┌─────────────┐   ┌────────────┐
 LL-PAY-06 │ Functional │ + │ API               │ + │ System             │ + │ Regression  │ + │ Automated  │
           └────────────┘   │ (UI / DB / Batch │   │ (Integration / E2E) │   │ (หลังแก้โค้ด) │   │ (Playwright)│
                            │  / File)          │   └────────────────────┘   └─────────────┘   └────────────┘
                            └──────────────────┘
```

> 💬 **ตอนสัมภาษณ์:** ถ้าถูกถามว่า "Regression เป็น test type ไหม" ตอบตาม CTFL v4.0.1 ได้ว่า syllabus แยก confirmation และ regression testing ไว้เป็นหัวข้อของการทดสอบที่เกิดจากการเปลี่ยนแปลง ไม่ได้นับเป็นหนึ่งในสี่ test types (functional, non-functional, black-box, white-box) — แล้วจึงอธิบายว่าในงานจริงทีมมักเรียกรวมกันว่า "ประเภทการทดสอบ"

**รูปแบบของทุกหัวข้อด้านล่าง:** นิยาม → ทดสอบอะไร (checklist) → ตัวอย่างใน ShopLab/LoanLab → การประยุกต์ใช้ในงานจริง → ข้อผิดพลาดที่พบบ่อย → เรียนต่อที่โมดูลไหน · ข้อความที่มี REF-xxx มาจากแหล่งนั้น ส่วน checklist และคำแนะนำที่ไม่มี REF เป็นแนวปฏิบัติของหลักสูตร ตัวอย่างจาก ShopLab/LoanLab ตรวจกับ requirement และโค้ดใน repo

---

## 📖 1. Functional Testing — ความถูกต้องของ Function และ Business Rule

**นิยาม:** ทดสอบว่าระบบทำ "อะไร" ได้ตาม requirement · CTFL v4.0.1 §2.2.2 ระบุวัตถุประสงค์หลักไว้ 3 ข้อ คือตรวจ **functional completeness** (ครบ), **functional correctness** (ถูก) และ **functional appropriateness** (เหมาะกับงานของผู้ใช้) (REF-097) · functional testing ทำได้ทุก test level และทำผ่านช่องทางใดก็ได้ — UI, API หรือ unit

**ทดสอบอะไร**
- ทุก business rule มี test อย่างน้อยหนึ่งตัว (traceability: requirement ID → test case)
- **Positive** (ค่าที่ถูก), **negative** (ค่าที่ผิด, สิทธิ์ไม่พอ, สถานะไม่อนุญาต) และ **boundary** (ค่าขอบ)
- ผลลัพธ์ครบทุกด้าน: ข้อความตอบกลับ, ค่าที่คำนวณ, สถานะที่เปลี่ยน, ข้อมูลที่บันทึก — และสิ่งที่ **ต้องไม่เกิด** เมื่อถูกปฏิเสธ
- ลำดับการตรวจเงื่อนไข เมื่อ requirement กำหนดว่า error ใดต้องมาก่อน

**ตัวอย่างใน LoanLab — ยอดชำระขั้นต่ำ (LL-PAY-05, LL-PAY-06)**

กฎ: ยอดชำระขั้นต่ำ = ค่าที่น้อยกว่าระหว่าง 500.00 กับ outstanding และห้ามชำระเกิน outstanding ([REQUIREMENTS-LOANLAB.md](../../practice-app/REQUIREMENTS-LOANLAB.md) §3)

| TC | Outstanding | Amount | คาดหวัง | เทคนิค |
|---|---|---|---|---|
| F-01 | 10,000.00 | 499.99 | 400 `BELOW_MINIMUM` · outstanding ไม่เปลี่ยน | BVA |
| F-02 | 10,000.00 | 500.00 | 201 · outstanding 9,500.00 · Loan `ACTIVE` | BVA (จับ LL-BUG-01) |
| F-03 | 10,000.00 | 10,000.00 | 201 · outstanding 0.00 · Loan `CLOSED` | BVA + state transition |
| F-04 | 10,000.00 | 10,000.01 | 400 `OVERPAYMENT` | BVA |
| F-05 | 300.00 | 300.00 | 201 · ปิดหนี้ (ยอดต่ำกว่า 500 รับได้เฉพาะยอดปิดหนี้พอดี) | requirement review (Q1) |
| F-06 | 300.00 | 299.99 | 400 `BELOW_MINIMUM` | BVA |

reference test: `tests/playwright/tests/loanlab/payment.api.spec.ts` (decision table R1–R6)

**การประยุกต์ใช้ในงานจริง**
1. อ่าน BRD/user story แล้วแตกเป็น **test condition** ทีละกฎ ตั้ง ID ให้ตรงกับ requirement
2. กฎที่มีหลายเงื่อนไขใช้ **decision table** กฎที่มีตัวเลขใช้ **EP/BVA** กฎที่มีสถานะใช้ **state transition** (M02)
3. เขียนคำถามกลับไปหา BA เมื่อ requirement กำกวม เช่น "ขั้นต่ำ 500 รวม 500 หรือไม่" — LoanLab เก็บคำตอบไว้ในตาราง Q1–Q8 เป็นตัวอย่าง
4. ทำ traceability matrix เพื่อตอบผู้บริหารว่ากฎข้อใดยังไม่มี test

**ข้อผิดพลาดที่พบบ่อย:** ทดสอบเฉพาะ happy path · ตรวจแค่ข้อความ error แต่ไม่ตรวจว่ายอดเงินไม่เปลี่ยน · ไม่ทดสอบค่าขอบทั้งสองฝั่ง

**เรียนต่อ:** M02 Test Design Techniques · M03 traceability

---

## 📖 2. UI Testing — หน้าจอ การแสดงผล Validation และการใช้งาน

**นิยาม:** ทดสอบระบบผ่านหน้าจอแบบที่ผู้ใช้เห็นและใช้งานจริง — สิ่งที่แสดง, การกรอกและตรวจข้อมูลบนหน้าจอ, การนำทาง และความสะดวกในการใช้ · ครอบคลุมทั้งด้าน functional (ปุ่มทำงานถูก) และ non-functional เช่น usability และ accessibility (ISO/IEC 25010 ที่ CTFL อ้าง — REF-097)

**ทดสอบอะไร**

| ด้าน | ตัวอย่างสิ่งที่ตรวจ |
|---|---|
| การแสดงผล | รูปแบบเงิน (฿1,000.00), วันที่, ภาษาไทย/อังกฤษ, ข้อความยาวไม่ล้นกล่อง, ตัวเลขชิดขวา |
| Validation | required, ความยาว, รูปแบบ (อีเมล, เบอร์โทร), ข้อความ error อยู่ใต้ช่องที่ผิด, ข้อมูลที่กรอกแล้วไม่หาย |
| สถานะของหน้า | loading, empty state ("ยังไม่มีรายการ"), error state, ปุ่ม disabled ระหว่างส่ง (กันกดซ้ำ) |
| การนำทาง | ลิงก์/เมนูไปหน้าถูก, ปุ่ม back, หน้าที่ต้อง login เด้งไปหน้า login |
| Accessibility | ใช้คีย์บอร์ดได้, label ผูกกับช่อง, contrast (M19) |
| Responsive / browser | จอมือถือ, หลาย browser (M19) |

**ตัวอย่างใน ShopLab และ LoanLab**
- ShopLab หน้า Register มี validation ทั้งฝั่ง client และ server — UI test ตรวจว่าข้อความขึ้นถูกช่อง (`tests/playwright/tests/ui/registration.spec.ts`)
- LoanLab หน้า Payment แสดง hint ใต้ช่อง amount ("From ฿500.00 up to …") — UI test ตรวจว่าข้อความเปลี่ยนตาม outstanding (LL-PAY-06)

```ts
// UI test: ตรวจสิ่งที่ผู้ใช้เห็น ไม่ตรวจโครงสร้าง HTML
await page.getByLabel('Amount').fill('499.99');
await page.getByRole('button', { name: 'Pay' }).click();
await expect(page.getByRole('alert')).toContainText('500.00');
await expect(page.getByTestId('outstanding')).toHaveText('฿10,000.00');   // ยอดไม่เปลี่ยน
```
(locator ในตัวอย่างนี้เป็นแบบฝึก — ชื่อจริงดูใน `tests/playwright/src/pages/LoanLabPages.ts`)

**การประยุกต์ใช้ในงานจริง**
- ทำ **UI checklist ต่อหน้าจอ** (ตารางด้านบน) ใช้ซ้ำทุก sprint
- หน้าจอธนาคาร: เลขบัญชี/บัตรถูก mask, session timeout, กดยืนยันซ้ำแล้วไม่เกิดรายการซ้ำ, ข้อความไม่เปิดเผยข้อมูลเกินจำเป็น
- ตรวจ business rule ทุกค่าขอบที่ API ส่วน UI ตรวจเพียงว่าหน้าจอ "ต่อสาย" กับกฎถูก (แสดงผลและ error ถูกที่)

**ข้อผิดพลาดที่พบบ่อย:** เชื่อ validation ฝั่ง client — LoanLab ซ่อนปุ่มของ Account ที่ `FROZEN` ตั้งแต่ฝั่ง client ทำให้ UI-only suite มองไม่เห็น LL-BUG-03 (ฝั่ง server ยังรับชำระ) ต้องทดสอบที่ API ด้วย ([bug catalogue](../instructor/bug-catalogue.md)) · ใช้ locator ผูกกับ CSS ที่เปลี่ยนบ่อย · ใส่ `sleep` แทนการรอแบบมีเงื่อนไข

**เรียนต่อ:** M07 Locators · M09–M10 Playwright · M11–M12 Robot Framework · M19 accessibility/visual

---

## 📖 3. API Testing — การรับส่งข้อมูลและ Business Logic ผ่าน API

**นิยาม:** ทดสอบโดยเรียก API (เช่น HTTP/REST) โดยตรง ไม่ผ่านหน้าจอ ตรวจทั้งรูปแบบการรับส่ง (request/response, status code, schema) และ business logic ที่อยู่หลัง API · CTFL v4.0.1 วาง API testing ไว้ใน testing quadrant Q2 (business facing, support the team) (REF-097 §5.1.7)

**ทดสอบอะไร (checklist ต่อ endpoint)**
1. **Status code** ถูกต้องทุกกรณี: 200/201 สำเร็จ, 400 ข้อมูลผิด, 401 ไม่ได้ login, 403 ไม่มีสิทธิ์, 404 ไม่พบ, 409 ขัดกับสถานะ
2. **Response body และ schema** ตรงสัญญา (OpenAPI) — ชื่อ field, ชนิดข้อมูล, field ที่ห้ามส่งออก (เช่น password hash)
3. **Business logic** — กฎเดียวกับ functional testing แต่ทดสอบได้ครบทุกค่าขอบอย่างรวดเร็ว
4. **Error code และลำดับการตรวจ** — LoanLab กำหนดลำดับไว้ใน LL-PAY-11
5. **Authorization** — user A อ่านหรือแก้ข้อมูลของ user B ไม่ได้ (BOLA/IDOR)
6. **Side effect** — หลังเรียกแล้วข้อมูลเปลี่ยนตามคาด และ **ไม่เปลี่ยน** เมื่อถูกปฏิเสธ
7. **Idempotency / duplicate** — ส่งคำขอเดิมซ้ำแล้วไม่เกิดผลซ้ำ (LL-REV-09)

**ตัวอย่างใน LoanLab**

```ts
// API test: ชำระต่ำกว่าขั้นต่ำต้องถูกปฏิเสธ และต้องไม่มีอะไรเปลี่ยน (LL-PAY-06, LL-PAY-10)
const res = await request.post(`/api/loanlab/loans/${loan.id}/payments`, { data: { amount: 499.99 } });
expect(res.status()).toBe(400);
expect(await res.json()).toMatchObject({ error: { code: 'BELOW_MINIMUM' } });
const after = await (await request.get(`/api/loanlab/loans/${loan.id}`)).json();
expect(after.outstanding).toBe(loan.outstanding);
```
reference tests: `tests/playwright/tests/loanlab/payment.api.spec.ts`, `reversal.api.spec.ts`, `security-accounts.api.spec.ts` · Postman collection ใน `tests/postman/`

**การประยุกต์ใช้ในงานจริง**
- เริ่มทดสอบได้ **ก่อนหน้าจอเสร็จ** เมื่อมี API spec (shift-left)
- ใช้ API **เตรียมข้อมูล** ให้ UI test (login, สร้างบัญชี) เพื่อให้ UI test สั้นและเสถียร
- ทำ **contract test** ระหว่างทีมที่ให้และใช้ API เมื่อหลายทีมพัฒนาแยกกัน (M13 §6)
- ระบบธนาคาร: ทดสอบ BOLA ทุก endpoint ที่รับเลขบัญชีหรือเลขสัญญา เพราะผลกระทบสูง

**ข้อผิดพลาดที่พบบ่อย:** ตรวจแค่ status 200 · ไม่ตรวจข้อมูลหลังถูกปฏิเสธ · ใช้ user คนเดียวทดสอบสิทธิ์ · test พึ่งลำดับกันเอง

**เรียนต่อ:** M13 API & Contract Testing

---

## 📖 4. Database Testing — ความถูกต้องและครบถ้วนของข้อมูล

**นิยาม:** ตรวจข้อมูลที่ระบบบันทึกจริงในฐานข้อมูล ว่าถูกต้อง ครบถ้วน และสอดคล้องกันทุกตาราง หลังจากระบบทำงานผ่าน UI, API หรือ batch · หลักการคือ **กระทำผ่านช่องทางปกติ แล้วพิสูจน์ผลที่ database** (ไม่เขียนข้อมูลตรงเพื่อข้ามกฎธุรกิจ ยกเว้นตอนเตรียมข้อมูลที่ตั้งใจ)

**ทดสอบอะไร**

| ด้าน | คำถาม | ตัวอย่าง SQL check |
|---|---|---|
| Correctness | ค่าที่บันทึกถูกไหม | ยอดใน `orders.total` = ผลคำนวณตาม REQ-PRC-06 |
| Completeness | บันทึกครบทุกแถว/ทุก field ไหม | order มี `order_items` ครบทุกสินค้าในตะกร้า |
| Integrity | ไม่มีแถวกำพร้า, FK ถูก | reversal ทุกรายการชี้ไปที่ payment ที่มีอยู่จริง |
| Constraint | กฎของ schema ทำงาน | `outstanding_satang >= 0`, `txn_ref` UNIQUE |
| Consistency | ยอดสรุปตรงกับยอดรายการ | ledger = outstanding (ด้านล่าง) |
| Security / PDPA | ข้อมูลอ่อนไหวถูกป้องกัน | password เก็บเป็น hash ไม่ใช่ข้อความจริง |
| ไม่เกิดผลเมื่อถูกปฏิเสธ | รายการที่ไม่ผ่านต้องไม่ทิ้งร่องรอย | จำนวนแถวใน `ll_transactions` เท่าเดิม |

**ตัวอย่างใน LoanLab** (SQLite `practice-app/data/shoplab.db` — LoanLab เก็บเงินเป็น **สตางค์แบบจำนวนเต็ม** เพื่อเลี่ยงปัญหาทศนิยมของ floating point)

```sql
-- 1) Reconciliation: ยอดเปิด − ยอดชำระสุทธิ ต้องเท่ากับ outstanding ทุกสัญญา (กฎเดียวกับ LL-EOD-05)
SELECT l.loan_no, l.outstanding_satang,
       l.opening_satang - COALESCE(SUM(t.amount_satang - t.reversed_satang), 0) AS expected_satang
FROM ll_loans l
LEFT JOIN ll_transactions t ON t.loan_id = l.id AND t.type = 'PAYMENT'
GROUP BY l.id
HAVING expected_satang <> l.outstanding_satang;          -- ผลที่ถูก: 0 แถว

-- 2) Integrity: reversal ทุกรายการต้องอ้างถึง PAYMENT ที่มีอยู่จริง
SELECT t.txn_ref FROM ll_transactions t
LEFT JOIN ll_transactions o ON o.id = t.original_txn_id
WHERE t.type = 'REVERSAL' AND (o.id IS NULL OR o.type <> 'PAYMENT');   -- ผลที่ถูก: 0 แถว
```
ทั้งสอง query รันกับ database ของ practice app ได้ผล 0 แถว (ตรวจเมื่อ 2026-11-28) · reference suite: `tests/robot/tests/db/database_checks.robot`

**การประยุกต์ใช้ในงานจริง**
- เขียน **query ชุดตรวจหลังทำรายการ** แนบไว้ใน test case แบบ "Expected DB state"
- ทดสอบ **data migration**: นับแถว, SUM ยอดเงิน, สุ่มเทียบรายแถวระหว่างระบบเก่าและใหม่
- ขอบัญชี **read-only** สำหรับ test, ไม่ใช้ข้อมูลลูกค้าจริงใน test environment (PDPA — M14 §6, M16)

**ข้อผิดพลาดที่พบบ่อย:** ตรวจเฉพาะหน้าจอแล้วสรุปว่าบันทึกถูก · เขียน SQL ตรวจที่ใช้ตรรกะเดียวกับโค้ดที่ถูกทดสอบ (ผิดเหมือนกันก็ผ่านเหมือนกัน) · ลืมตรวจกรณีที่ต้อง "ไม่มีแถวใหม่"

**เรียนต่อ:** M14 Database & Data Testing

---

## 📖 5. Batch Process Testing — Batch Job และผลลัพธ์ของการประมวลผล

**นิยาม:** batch job คืองานที่รันได้โดยไม่มีผู้ใช้โต้ตอบ มักรันตามเวลาที่ตั้งไว้หรือเมื่อมีความต้องการ ตัวอย่างคลาสสิกคือโปรแกรมที่อ่านไฟล์ขนาดใหญ่แล้วสร้างรายงาน (IBM z/OS Basic Skills — REF-127) · Batch process testing จึงตรวจว่างานที่รันเป็นรอบ **เลือกข้อมูลถูก ประมวลผลถูก ให้ผลลัพธ์ครบ และรันซ้ำหรือรันต่อหลังล้มได้อย่างปลอดภัย**

**ทำไมยากกว่าการทดสอบหน้าจอ:** ไม่มีหน้าจอให้ดู ผลกระจายอยู่ในหลายตาราง ไฟล์ และ log · ขึ้นกับ **วันที่ของระบบ** (business date) · ใช้ข้อมูลจำนวนมาก · รันตามลำดับกับ job อื่น

**ทดสอบอะไร (checklist)**

| ด้าน | คำถาม |
|---|---|
| Input selection | เลือกเฉพาะรายการที่ควรเลือกไหม (ตามวันที่ตัดรอบ, สถานะ) — รายการที่ไม่ควรถูกเลือกต้องไม่ถูกแตะ |
| Processing | คำนวณถูกทุกกรณี รวมกรณีขอบ (ยอด 0, ถูก reverse ครบ, สิ้นเดือน, วันศุกร์ → จันทร์) |
| Output | ตาราง ไฟล์ และรายงานที่สร้างครบและถูก |
| Control total | จำนวนรายการและยอดรวมที่ job รายงาน ตรงกับข้อมูลจริง |
| Status และ log | job รายงานสำเร็จ/ล้มเหลวถูก มี log ที่ใช้สืบสวนได้ |
| Re-run / idempotency | รันซ้ำแล้วไม่ประมวลผลซ้ำ (เช่น ไม่ settle รายการเดิมสองครั้ง) |
| Failure และ restart | ล้มกลางทางแล้วข้อมูลไม่ค้างครึ่งเดียว และรันต่อได้ |
| Empty / volume | ไม่มีข้อมูลให้ประมวลผล และข้อมูลจำนวนมากในเวลาที่กำหนด (batch window) |
| Dependency | job ที่ต้องรันก่อน/หลังกันรันตามลำดับ |

**ตัวอย่างใน LoanLab — End-of-day (LL-EOD)**

EOD ของวัน T ทำ 3 ขั้นตามลำดับ: settlement → reconciliation → เลื่อน business date (LL-EOD-03) · ในโค้ด ทั้ง 3 ขั้นอยู่ใน database transaction เดียว (`atomic()` ใน `practice-app/src/loanlab/service.js`) จึงไม่ค้างครึ่งทาง

| TC | Arrange | Act | Assert | กฎ / บั๊กที่จับ |
|---|---|---|---|---|
| B-01 | business date = ศุกร์, ชำระ 1 รายการ | รัน EOD | `settlementDate` = จันทร์ · business date ใหม่ = จันทร์ | LL-EOD-04, LL-EOD-07 · LL-BUG-11 |
| B-02 | ชำระแล้ว reverse ครบ | รัน EOD | รายการนั้น `settlementDate` = null · `settledCount` ไม่นับรายการนี้ | LL-EOD-04 |
| B-03 | บังคับ outstanding ต่างจาก ledger 0.01 (test hook LL-TST-04) | รัน EOD | status `OUT_OF_BALANCE` · break มี `loanNo`, `expected`, `actual`, `difference` · EOD ยังเลื่อนวัน | LL-EOD-05, LL-EOD-06 · LL-BUG-12 |
| B-04 | ชำระวัน T | รัน EOD แล้ว reverse | 409 `REVERSAL_WINDOW_CLOSED` | LL-REV-05 · LL-BUG-10 |
| B-05 | วันที่ไม่มีรายการเลย | รัน EOD | `settledCount` 0, ยอดรวม 0, status `BALANCED` | empty input |
| B-06 | ชำระ 3 รายการ (1 รายการ reverse บางส่วน) | รัน EOD | `paymentsTotal`, `reversalsTotal`, `netTotal` ตรงกับ SUM จาก database | control total (LL-EOD-08) |

reference tests: `tests/playwright/tests/loanlab-eod/eod.api.spec.ts` (B-01, B-03, B-04) · Robot `tests/robot/tests/loanlab/loanlab_acceptance.robot` · B-02, B-05, B-06 เป็นแบบฝึกใน Lab 01b.2

**ขั้นตอนทดสอบ batch ที่ใช้ได้ทั่วไป**
```
1. Arrange   เตรียมข้อมูลทุกกลุ่ม: ควรถูกเลือก / ไม่ควรถูกเลือก / กรณีขอบ   + จดยอดตั้งต้น (count, SUM)
2. Set date  ตั้ง business date หรือนาฬิกาของระบบ (test hook, config)  — อย่ารอให้ถึงวันจริง
3. Trigger   สั่งรัน job ผ่าน scheduler, command line, SSH หรือ test hook
4. Wait      รอจน job จบ (poll สถานะ) — ไม่ใช้ sleep ตายตัว
5. Assert    สถานะ job + log + ข้อมูลใน DB + ไฟล์/รายงานที่ออก + control total
6. Re-run    รันซ้ำหรือจำลองล้มกลางทาง แล้วตรวจว่าไม่มีผลซ้ำหรือค้าง
```

**การประยุกต์ใช้ในงานจริง (ระบบธนาคาร)** — งานที่มักเป็น batch: ปิดยอดสิ้นวัน, คิดดอกเบี้ยค้างรับรายวัน, จัดชั้นหนี้ค้างชำระตามจำนวนวัน, สร้าง statement สิ้นเดือน, ส่งไฟล์ให้หน่วยงานภายนอก · ทีม QA ควรขอให้ dev มี **testability hook** อย่างน้อย 3 อย่าง: ตั้ง business date, สั่งรัน job แบบ on-demand, อ่านผลการรันย้อนหลัง (LoanLab มีครบใน LL-TST-05, LL-TST-06 และ `GET /api/loanlab/eod-runs`) · เพราะ business date เป็น state ร่วมของทั้งระบบ test ของ batch ต้องไม่รันขนานกับ test อื่นที่พึ่งวันที่ (ดู project `loanlab-eod` ใน `tests/playwright/playwright.config.ts`)

**ข้อผิดพลาดที่พบบ่อย:** ตรวจแค่ว่า job "จบโดยไม่ error" · เตรียมเฉพาะข้อมูลที่ควรถูกเลือก · ทดสอบเฉพาะวันธรรมดากลางเดือน · ลืมทดสอบการรันซ้ำ · รัน batch test ขนานกับ test อื่นจนผลไม่แน่นอน (M17)

**เรียนต่อ:** M12 (Robot SSHLibrary สำหรับ server/batch job) · M14 (reconciliation) · M16 (test hooks, เวลาของระบบ)

---

## 📖 6. File Interface Testing — การรับส่งข้อมูลผ่านไฟล์ระหว่างระบบ

**นิยาม:** ทดสอบการแลกเปลี่ยนข้อมูลระหว่างระบบในรูปไฟล์ (CSV, fixed-width, XML/JSON, feed file) ทั้ง **ฝั่งสร้างไฟล์ (outbound)** — ไฟล์ถูกรูปแบบ ข้อมูลครบและถูก — และ **ฝั่งรับไฟล์ (inbound)** — อ่านถูก ตรวจข้อมูลผิดได้ จัดการแถวที่ผิดตามที่ตกลง · test basis หลักคือ **interface specification** ที่สองระบบตกลงกัน (ชื่อไฟล์, ตำแหน่ง, layout, encoding, กฎการ reject)

**รูปแบบ CSV ตาม RFC 4180** (REF-126 — เป็น RFC ประเภท Informational ที่บันทึกแนวปฏิบัติที่ใช้กันทั่วไป ไม่ใช่มาตรฐานบังคับ สเปกของ interface จึงมีผลเหนือกว่า)
- แต่ละ record อยู่คนละบรรทัด คั่นด้วย CRLF · บรรทัดสุดท้ายจะมีตัวขึ้นบรรทัดหรือไม่ก็ได้
- มี header บรรทัดแรกได้ (optional) · ทุกบรรทัดควรมีจำนวน field เท่ากัน
- ช่องว่างนับเป็นส่วนของ field ห้ามตัดทิ้ง
- field ที่มี comma, ตัวขึ้นบรรทัด หรือ double quote ควรอยู่ใน double quote และ double quote ภายในเขียนซ้ำสองตัว เช่น `"Mug, ""Big"""`
- MIME type `text/csv` มี parameter เสริม `charset` และ `header`

**ทดสอบอะไร (checklist)**

| ด้าน | ตัวอย่างสิ่งที่ตรวจ |
|---|---|
| ชื่อและตำแหน่งไฟล์ | naming convention (เช่น มีวันที่ในชื่อ), folder ต้นทาง/ปลายทาง, ย้ายไป archive หลังประมวลผล |
| Encoding | UTF-8 มี/ไม่มี BOM, ภาษาไทยอ่านได้ทั้งสองฝั่ง |
| โครงสร้าง | delimiter, quoting, ตัวขึ้นบรรทัด, จำนวน field ต่อบรรทัด, header ตรงชื่อและลำดับ |
| Field format | ความยาว/การเติมช่อง (fixed-width), รูปแบบวันที่, ทศนิยม, field บังคับ |
| Header / trailer | จำนวน record และยอดรวมใน trailer ตรงกับเนื้อไฟล์ (control total) |
| ข้อมูลผิด | แถวผิดถูก reject พร้อมเหตุผลและเลขบรรทัด · reject ทั้งไฟล์หรือรายแถวตามสเปก |
| ไฟล์ผิดปกติ | ไฟล์ว่าง, มีแต่ header, ไฟล์ตัดกลางทาง, ไฟล์ใหญ่, ส่งไฟล์เดิมซ้ำ |
| Source-to-target | ค่าทุก field ในไฟล์ตรงกับข้อมูลต้นทาง (mapping document) และถูกบันทึกถูกที่ปลายทาง |

**ตัวอย่างใน ShopLab — Import/Export สินค้า CSV (REQ-ADM-03)**

import รับไฟล์ `sku,name,category,price,stock` แถวที่ผิดรายงานเลขบรรทัด · export ส่งไฟล์ UTF-8 พร้อม BOM เพื่อให้ Excel แสดงภาษาไทยได้

| TC | ไฟล์ที่ส่ง | คาดหวัง |
|---|---|---|
| FI-01 | 1 แถวถูก + 5 แถวผิด (SKU, name ว่าง, category, price ติดลบ, stock ทศนิยม) | `created: 1` · errors บรรทัด 3–7 พร้อมเหตุผล · แถวที่ผิดไม่ถูกบันทึก |
| FI-02 | SKU เดิมซ้ำด้วยราคาใหม่ | `updated: 1` ไม่สร้างสินค้าซ้ำ |
| FI-03 | ไม่มีคอลัมน์ `stock` | 400 `INVALID_CSV` ทั้งไฟล์ |
| FI-04 | ไม่แนบไฟล์ / ผู้ใช้ไม่ใช่ admin | 400 `FILE_REQUIRED` / 403 |
| FI-05 | สินค้าชื่อ `Mug, "Big"` แล้ว export | ไฟล์มี BOM, header ถูก, field ถูก quote ตามกฎ RFC 4180 และทุกบรรทัดมี 7 field |

reference test: `tests/playwright/tests/ui/file-interface.admin.spec.ts` (ครบ FI-01 ถึง FI-05 · ไฟล์นี้อยู่ใน project `ui-admin` เพราะแก้ข้อมูลสินค้าที่ test อื่นใช้ร่วม)

**ข้อสังเกตจากการอ่านโค้ด (`practice-app/src/routes/admin.js`)** — ใช้ฝึกเทียบสเปกกับของจริง
1. parser ของ import ตัดช่องว่างหน้า/หลังทุก field ซึ่งต่างจาก RFC 4180 ที่ถือว่าช่องว่างเป็นส่วนของข้อมูล
2. parser แยกบรรทัดก่อนอ่าน quote จึงรับ field ที่มีตัวขึ้นบรรทัดอยู่ใน quote ไม่ได้
3. export ใช้ LF ไม่ใช่ CRLF
4. เลขบรรทัดใน error นับหลังตัดบรรทัดว่างทิ้ง ถ้าไฟล์มีบรรทัดว่างคั่น เลขบรรทัดที่รายงานจะไม่ตรงกับไฟล์ (ลองแล้ว 2026-11-28: header, บรรทัดว่าง, แถวผิดที่บรรทัด 3 → ระบบตอบ `line: 2`)

ทั้ง 4 ข้อยังไม่ใช่ defect จนกว่าจะเทียบกับสเปกของ interface — REQUIREMENTS.md ไม่ได้กำหนดเรื่องเหล่านี้ ข้อ 1–3 ควรถามเจ้าของ requirement ส่วนข้อ 4 ขัดกับเจตนา "รายงานเลขบรรทัด" ของ REQ-ADM-03 จึงควรเขียน bug report (M03)

**ตัวอย่าง fixed-width feed file พร้อม header/trailer** (ไฟล์สมมติสำหรับฝึก)
```
H20260105LOANLAB   PAYMENTS
D000001LN-000001  000000050000
D000002LN-000002  000000125050
T0000020000000175050
```
สิ่งที่ตรวจ: ทุกบรรทัดยาวเท่ากันตาม layout · `T` บอก 2 record และยอดรวม 1,750.50 บาท (175050 สตางค์) ตรงกับผลบวกของบรรทัด `D` · วันที่ใน `H` = business date ที่ส่งไฟล์

**การประยุกต์ใช้ในงานจริง** — ไฟล์ส่งหน่วยงานกำกับ, ไฟล์จาก payment network, ไฟล์ระหว่าง core banking กับระบบรายงาน · เตรียม **ชุดไฟล์ทดสอบ** ที่ตั้งชื่อตามกรณี (`valid_2rows.csv`, `missing_column.csv`, `bom_thai.csv`, `duplicate_file.csv`) เก็บใน repo · ตรวจฝั่งรับด้วย DB query และฝั่งส่งด้วย script ที่อ่านไฟล์แล้วเทียบกับ database

**ข้อผิดพลาดที่พบบ่อย:** เปิดไฟล์ด้วย Excel แล้วบันทึกทับ (Excel เปลี่ยนรูปแบบวันที่ ตัดเลข 0 นำหน้า) · ตรวจแค่ไฟล์ถูกสร้าง ไม่ตรวจค่าในไฟล์ · ไม่ทดสอบการส่งไฟล์เดิมซ้ำ

**เรียนต่อ:** M14 §5 (ETL/report/feed file) · M08 (อ่าน/เขียนไฟล์ด้วยโค้ด)

---

## 📖 7. Integration Testing — การทำงานร่วมกันระหว่างหลาย Module หรือหลายระบบ

**นิยาม** (CTFL v4.0.1 §2.2.1 — REF-097) แบ่งเป็นสองระดับ
- **Component integration testing** — ทดสอบ interface และการทำงานร่วมกันระหว่าง component ภายในระบบ ขึ้นกับ integration strategy เช่น bottom-up, top-down หรือ big-bang
- **System integration testing** — ทดสอบ interface ระหว่างระบบที่ทดสอบกับระบบอื่นและ external services ต้องใช้ test environment ที่ใกล้เคียง production

**ทดสอบอะไร**
- **Data mapping** — field ที่ส่งไปถึงปลายทางครบ ชนิดและหน่วยถูก (บาท vs สตางค์, timezone)
- **Interface contract** — จำนวน ชนิด และลำดับของ parameter ตรงกัน (CTFL ยก incorrect interface specifications เป็นตัวอย่าง defect ที่หาได้ง่ายหรือถูกกว่าด้วย static testing จึงควร review สเปกของ interface ก่อนรัน test — REF-097 §3.1.3)
- **Error handling** — ระบบปลายทางล่ม, ตอบช้า (timeout), ตอบ error — ฝั่งเราจัดการถูกไหม retry ซ้ำแล้วเกิดรายการซ้ำไหม
- **ลำดับและเวลา** — ข้อความมาไม่เรียง, มาซ้ำ, ระบบ async ตอบทีหลัง
- **Security ข้ามระบบ** — token/credential ส่งต่อถูกต้อง

**ตัวอย่างใน ShopLab และ LoanLab**
| ระดับ | ตัวอย่าง | reference |
|---|---|---|
| Component integration | API ของ ShopLab กับ database — สั่งซื้อผ่าน API แล้วตรวจ `orders` และ `order_items` | `tests/robot/tests/db/database_checks.robot` |
| Component integration | payment service ของ LoanLab กับ EOD — รายการชำระของวันนั้นถูก settle | `eod.api.spec.ts` |
| System integration (จำลอง) | ShopLab กับผู้ให้บริการชำระเงิน — ใน practice app เป็น fake จึงใช้ฝึกแนวคิด stub/mock | M16 §4 |

**การประยุกต์ใช้ในงานจริง**
- วาด **interface diagram** ก่อนวางแผน: ระบบไหนส่งอะไรให้ใคร ผ่านช่องทางใด (API, file, message queue)
- ระบบภายนอกยังไม่พร้อมใช้ stub / mock / service virtualization ทดสอบฝั่งเราไปก่อน แล้วทดสอบกับ sandbox ของจริงชุดเล็ก
- ทีมที่แยกกันพัฒนาใช้ contract testing กัน interface เปลี่ยนโดยไม่บอก (M13 §6)
- ระบบธนาคาร: mobile app ↔ API gateway ↔ core banking ↔ payment switch — ทุกเส้นคือ test condition

**ข้อผิดพลาดที่พบบ่อย:** ทดสอบแต่ละระบบผ่านแล้วถือว่าต่อกันได้ · ทดสอบเฉพาะตอนปลายทางตอบปกติ · mock ทุกอย่างจนไม่เคยต่อของจริง

**เรียนต่อ:** M13 §6 contract · M16 mock และ environment

---

## 📖 8. End-to-End Testing — กระบวนการธุรกิจตั้งแต่ต้นจนจบ

**นิยาม:** ทดสอบกระบวนการทางธุรกิจหนึ่งเส้นทางตั้งแต่ต้นจนจบ ผ่านทุกระบบที่เกี่ยวข้อง แบบที่ผู้ใช้จริงทำ · ใน CTFL v4.0.1 อยู่ภายใต้ system testing ("functional testing of end-to-end tasks") และเป็นชั้นบนสุดของ test pyramid — test ชั้นนี้ช้ากว่าและตรวจ functionality ชิ้นใหญ่ จึงมักต้องการเพียงไม่กี่ตัว (REF-097 §2.2.1, §5.1.6)

**ทดสอบอะไร**
- เส้นทางที่ **สร้างรายได้หรือมีความเสี่ยงสูงสุด** (critical user journey)
- ข้อมูลไหลข้ามขั้นตอนถูก — ค่าที่ขั้นแรกสร้าง ขั้นสุดท้ายเห็นถูก
- หลายบทบาทในกระบวนการเดียว (ลูกค้า, เจ้าหน้าที่, batch)
- ผลสุดท้ายในทุกช่องทาง: หน้าจอ, database, ไฟล์/รายงาน

**ตัวอย่างใน LoanLab — วงจรการชำระหนี้หนึ่งรอบ**
```
Officer เปิด Account + Loan (Back Office)
  → Customer login → ชำระบางส่วน → เห็น "Pending settlement"
  → Officer reverse บางส่วน → สถานะ PARTIALLY_REVERSED
  → Officer รัน EOD → history แสดงวันที่ settle (T+1) และยอดคงเหลือถูก
```
reference: `tests/playwright/tests/loanlab/payment-flow.ui.spec.ts`, `officer.ui.spec.ts`, `eod.api.spec.ts` (ชิ้นส่วนของวงจรนี้) · ShopLab: `tests/playwright/tests/ui/checkout.spec.ts` และ `tests/robot/tests/ui/04_checkout_bdd.robot`

**การประยุกต์ใช้ในงานจริง**
- เลือก E2E **5–10 เส้นทาง** จาก risk analysis (M20) — ไม่ใช่ทุกกฎ
- เตรียมข้อมูลด้วย API/test hook แล้วใช้ UI เฉพาะขั้นที่ต้องพิสูจน์จากมุมผู้ใช้
- กำหนดเจ้าของ environment และข้อมูลของทุกระบบในเส้นทาง เพราะ E2E ล้มบ่อยจาก environment มากกว่าจากโค้ด
- รัน E2E smoke หลัง deploy ทุกครั้ง และชุดเต็มก่อน release

**ข้อผิดพลาดที่พบบ่อย:** ใช้ E2E ทดสอบทุกค่าขอบ (ช้าและเปราะ — "ice-cream cone" ใน M04) · E2E ยาวมากจนล้มแล้วไม่รู้ว่าขั้นไหนผิด · test พึ่งข้อมูลจาก test ก่อนหน้า

**เรียนต่อ:** M04 Test Pyramid · M10 Playwright advanced · M20 risk-based testing

---

## 📖 9. Regression Testing — ยืนยันว่าการเปลี่ยนแปลงไม่ทำให้ของเดิมพัง

**นิยาม** (CTFL v4.0.1 §2.2.3 — REF-097)
- **Confirmation testing** ยืนยันว่า defect เดิมถูกแก้แล้ว — รัน test ที่เคยล้มเพราะ defect นั้น และ/หรือเพิ่ม test ใหม่ครอบส่วนที่แก้
- **Regression testing** ยืนยันว่าการเปลี่ยนแปลง (รวมถึงการแก้บั๊กที่ผ่าน confirmation แล้ว) ไม่ก่อผลเสีย ผลเสียอาจเกิดใน component เดียวกัน, component อื่นในระบบ หรือแม้แต่ระบบอื่นที่เชื่อมต่อ และอาจเกี่ยวกับ environment ด้วย
- syllabus แนะนำให้ทำ **impact analysis** ก่อน เพื่อหาขอบเขตของ regression · regression suite รันหลายครั้งและโตขึ้นทุก release จึงเหมาะกับ automation · เมื่อใช้ CI ควรรวม automated regression tests ไว้ใน pipeline

**ทดสอบอะไร — เลือกชุด regression**
| ชุด | เมื่อไร | เนื้อหา |
|---|---|---|
| Smoke | ทุก build/deploy | เส้นทางหลักไม่กี่ตัว ตอบว่า "ระบบพร้อมทดสอบต่อไหม" (`@smoke` ใน repo) |
| Risk-based / targeted | ทุก PR | test ของส่วนที่ impact analysis ชี้ + ส่วนเสี่ยงสูง |
| Full | ก่อน release / nightly | ทุก test อัตโนมัติ + manual ที่ยังไม่ automate |

**ตัวอย่างใน repo — "bug guard"** ทุกบั๊กที่ฝังไว้มี test ที่ตั้งชื่อว่า guard เช่น `'a payment cannot be reversed after end-of-day (LL-BUG-10 guard)'` และ `'sort=price_asc is numeric (BUG-04 guard)'` — test เหล่านี้เป็น confirmation test ตอนแก้บั๊ก และเป็น regression test ตลอดไปหลังจากนั้น (ลองเปิด Bug Mode แล้วรัน: guard ต้องล้ม)

**Impact analysis แบบง่าย** — การเปลี่ยน `nextBusinessDay()` ใน `rules.js` กระทบอะไรบ้าง
```
nextBusinessDay()  →  settlementDate (LL-EOD-04)  →  หน้า History "settled on" (LL-RPT-04)
                   →  business date ใหม่ (LL-EOD-07) →  หน้าต่าง reverse (LL-REV-05)
                   →  เลขอ้างอิง PM-YYYYMMDD ของวันถัดไป (LL-PAY-09)
⇒ regression ที่ต้องรัน: eod.api.spec, reversal.api.spec, payment-flow.ui.spec + unit test ของ rules
```

**การประยุกต์ใช้ในงานจริง**
- เก็บ mapping "module ↔ test" (tag หรือ folder) เพื่อเลือก regression จาก diff ได้เร็ว
- ทุก production incident ได้ test ใหม่หนึ่งตัวเข้า regression suite
- ทบทวน suite เป็นระยะ — ลบ test ซ้ำ ปรับ test ที่ไม่เคยหาบั๊ก (pesticide paradox ใน M01)

**ข้อผิดพลาดที่พบบ่อย:** รัน full regression ทุกครั้งจน feedback ช้า · ไม่มี impact analysis จึงพลาดระบบที่เชื่อมต่อ · เก็บ test ที่ flaky ไว้ใน suite จนทีมเลิกเชื่อผล (M17)

**เรียนต่อ:** M05 · M17 flaky tests · M18 CI/CD

---

## 📖 10. Automation Testing — ใช้ Script และเครื่องมือรัน test

**นิยาม:** การใช้ script หรือเครื่องมือรัน test, เตรียมข้อมูล, เทียบผล และรายงานแทนการทำด้วยมือ · ไม่ใช่ประเภทการทดสอบแยก แต่เป็น **วิธีรัน** ที่ใช้ได้กับทุกประเภทข้างต้น — automated UI test, automated API test, automated batch test

**ประโยชน์และความเสี่ยงตาม CTFL v4.0.1 §6.2** (REF-097 — สรุปความ)

| ประโยชน์ที่อาจได้ | ความเสี่ยงที่อาจเกิด |
|---|---|
| ลดงานซ้ำด้วยมือ เช่น รัน regression, กรอกข้อมูลเดิม, เทียบผลที่คาดกับผลจริง | คาดหวังประโยชน์ของเครื่องมือเกินจริง |
| ลดความผิดพลาดของคนด้วยความสม่ำเสมอและทำซ้ำได้ | ประมาณเวลา ค่าใช้จ่าย และแรงในการนำเครื่องมือมาใช้และดูแล script ต่ำเกินไป |
| วัดผลได้เป็นกลางขึ้น (เช่น coverage) และวัดสิ่งที่คนคำนวณเองยาก | ใช้เครื่องมือในงานที่ทดสอบด้วยมือเหมาะกว่า |
| เข้าถึงข้อมูลการทดสอบเพื่อบริหารและรายงานได้ง่าย | พึ่งเครื่องมือมากเกินไปจนละการคิดวิเคราะห์ของคน |
| รันเร็วขึ้น พบ defect เร็วขึ้น feedback เร็วขึ้น | พึ่งผู้ขายเครื่องมือที่อาจเลิกกิจการ เลิกพัฒนา หรือดูแลไม่ดี |
| tester มีเวลาออกแบบ test ที่ลึกและได้ผลมากขึ้น | ใช้ open source ที่อาจถูกทิ้ง หรือต้องอัปเดตบ่อย |

syllabus ระบุความเสี่ยงไว้มากกว่าในตารางนี้ — อ่านรายการเต็มใน §6.2

**ทดสอบอะไร — ควร automate อะไรก่อน**
1. **Regression ที่รันบ่อย** และผลตัดสินได้ชัด
2. กฎที่มีค่าขอบมาก — ทำที่ **API/unit** ก่อน UI (test pyramid)
3. การเตรียมข้อมูลและ environment (factory, test hook)
4. งานที่ทำด้วยมือไม่ได้หรือไม่คุ้ม: ตรวจไฟล์ใหญ่, เทียบ database หลายพันแถว, load test

สิ่งที่ยังควรทำด้วยมือ: exploratory testing, usability, ฟีเจอร์ที่ยังเปลี่ยนทุกวัน

**ตัวอย่างใน repo — กฎเดียว ทดสอบอัตโนมัติหลายชั้น**
| ชั้น | LL-PAY-06 (ขั้นต่ำ) | เครื่องมือ |
|---|---|---|
| Unit | `minimumPayment()` ใน `practice-app/test/` | Node test runner |
| API | decision table R4–R6 | Playwright `payment.api.spec.ts`, Robot, Newman |
| UI | ชำระเต็มจำนวนผ่านหน้าเว็บ 1 กรณี | Playwright `payment-flow.ui.spec.ts` |
| CI | รันทุก push | GitHub Actions (M18) |

**การประยุกต์ใช้ในงานจริง** — เริ่มจาก smoke + API regression ของ flow เสี่ยงสูง, วาง framework (M15), ต่อเข้า CI (M18), วัดผลด้วย defect ที่จับได้และเวลาที่ประหยัด ไม่ใช่จำนวน script (M05 ROI)

**ข้อผิดพลาดที่พบบ่อย:** automate test case manual ทีละขั้นตรงตัวจนได้ UI test ยาวเปราะ · ไม่มีใครดูแล script เมื่อระบบเปลี่ยน · ปล่อย test flaky ไว้

**เรียนต่อ:** M05 strategy · M08 programming · M09–M12 tools · M15 framework · M18 CI/CD

---

## 📖 11. Worked Example: ฟีเจอร์ "ชำระหนี้" ผ่าน 10 มุมมอง

ฟีเจอร์เดียวกันของ LoanLab ทดสอบได้ทั้ง 10 แบบ แต่ละแบบจับปัญหาคนละชนิด

| ประเภท | Test ตัวอย่าง | ปัญหาที่จับได้ |
|---|---|---|
| Functional | ชำระ 500.00 จาก outstanding 10,000 ต้องผ่าน | ใช้ `>` แทน `>=` (LL-BUG-01) |
| UI | กรอก 499.99 แล้วเห็นข้อความใต้ช่อง ยอดบนหน้าไม่เปลี่ยน | error ไม่แสดง, รูปแบบเงินผิด |
| API | POST payment จาก Account `FROZEN` ต้องได้ 409 | server รับชำระทั้งที่หน้าเว็บซ่อนปุ่ม (LL-BUG-03) |
| Database | หลังชำระ ledger = outstanding และมีแถว `PAYMENT` หนึ่งแถว | บันทึกยอดไม่ตรงหรือแถวซ้ำ |
| Batch | ชำระวันศุกร์ รัน EOD แล้ว settle วันจันทร์ | T+1 นับวันปฏิทิน (LL-BUG-11) |
| File interface | ไฟล์รายการชำระประจำวัน: trailer นับ 2 record ยอดรวมตรง | ยอดรวมในไฟล์ไม่ตรงกับ database (แบบฝึก — LoanLab ยังไม่มีไฟล์นี้) |
| Integration | payment ที่ reverse ครบต้องไม่ถูก settle ใน EOD | สองส่วนตีความสถานะไม่ตรงกัน |
| End-to-End | เปิดสัญญา → ชำระ → reverse บางส่วน → EOD → history ถูก | ขั้นใดขั้นหนึ่งส่งข้อมูลผิดให้ขั้นถัดไป |
| Regression | หลังแก้ `nextBusinessDay()` รัน eod/reversal/payment-flow | การแก้หนึ่งจุดทำให้หน้าต่าง reverse ผิด |
| Automation | ทั้งหมดข้างบน (ยกเว้นไฟล์) อยู่ใน CI รันทุก push | ของที่เคยถูก กลับมาพังโดยไม่มีใครรู้ |

---

## 🧪 Lab 01b.1 — จัดหมวดและเลือกชั้นที่ทดสอบ (30 นาที)
สำหรับกฎ 6 ข้อนี้: REQ-PRC-03 (ส่งฟรี), REQ-ADM-03 (import CSV), LL-PAY-03 (Account ต้อง ACTIVE), LL-REV-09 (duplicate reversal), LL-EOD-04 (T+1), LL-RPT-04 (แสดง "Pending settlement")
1. ระบุว่าควรทดสอบหลักที่ชั้นใด (unit / API / UI / DB / batch / file) และชั้นใดควรมี test เสริม
2. ระบุป้ายทั้ง 5 มิติของ test หลักแต่ละตัว (ทดสอบอะไร · ช่องทาง · ระดับ · เมื่อไร · วิธีรัน)
3. เปรียบเทียบคำตอบกับเพื่อน 1 คน แล้วเขียนเหตุผลของข้อที่เห็นต่าง

**เกณฑ์ผ่าน:** ทุกกฎมีชั้นหลักพร้อมเหตุผล · LL-PAY-03 ต้องมี API test (เพราะ UI ซ่อนปุ่มเอง)

## 🧪 Lab 01b.2 — Batch: ออกแบบและเขียน test ของ EOD (60 นาที)
1. อ่าน LL-EOD-01 ถึง LL-EOD-09 ใน [REQUIREMENTS-LOANLAB.md](../../practice-app/REQUIREMENTS-LOANLAB.md)
2. ออกแบบ test ตาม checklist ใน §5 อย่างน้อย 6 ตัว ต้องมี: input selection, control total, empty input และกรณีวันศุกร์
3. เขียน B-02 (reverse ครบแล้วไม่ถูก settle) และ B-06 (control total) เป็น API test ใน project `loanlab-eod` โดยใช้ test hook ตั้ง business date และสั่งรัน EOD
4. เปิด `GRADING_BUGS=LL-BUG-11` แล้วรัน — test วันศุกร์ของคุณต้องล้ม

**เกณฑ์ผ่าน:** test ใหม่ 2 ตัวผ่านเมื่อไม่มีบั๊ก และไม่พึ่งลำดับการรันกับ test อื่น

## 🧪 Lab 01b.3 — File interface: ทดสอบ CSV import/export (60 นาที)
1. เตรียมชุดไฟล์ทดสอบ 6 ไฟล์ใน `tests/playwright/data/csv/` (ถูกต้อง, ขาดคอลัมน์, แถวผิด 3 แบบ, ภาษาไทยพร้อม BOM, มีบรรทัดว่างคั่น, field มี comma)
2. ส่งแต่ละไฟล์ด้วย Postman หรือ `curl` (login เป็น admin) แล้วจดผลจริงเทียบกับที่คาด
3. ไฟล์ที่มีบรรทัดว่างคั่น: เลขบรรทัดที่รายงานตรงกับไฟล์หรือไม่ — ถ้าไม่ตรง เขียน bug report ตาม template (M03) ระบุ REQ-ADM-03
4. เทียบคำตอบกับ reference test `tests/playwright/tests/ui/file-interface.admin.spec.ts`

**เกณฑ์ผ่าน:** ทุกไฟล์มีผลคาด/ผลจริง · bug report มีขั้นตอนทำซ้ำและไฟล์แนบ

## 🧪 Lab 01b.4 — Database: พิสูจน์ผลหลังทำรายการ (30 นาที)
1. ชำระหนี้หนึ่งรายการผ่านหน้าเว็บ LoanLab แล้ว reverse บางส่วนผ่าน Back Office
2. รัน query ทั้งสองตัวใน §4 ด้วย SQLite client (เปิดแบบ read-only) — ต้องได้ 0 แถว
3. เขียน query ที่สาม: payment ที่สถานะ `PARTIALLY_REVERSED` ต้องมี `0 < reversed_satang < amount_satang`
4. ใช้ test hook LL-TST-04 บังคับ outstanding ให้ต่าง 0.01 แล้วรัน query ที่ 1 อีกครั้ง — ต้องเจอ 1 แถว

**เกณฑ์ผ่าน:** query ที่สามถูก และอธิบายได้ว่าทำไม query ที่ 1 จับ break ได้

---

## ✅ Check Your Understanding
1. "Regression testing" และ "API testing" ตอบคำถามคนละมิติอย่างไร ยกตัวอย่าง test หนึ่งตัวที่เป็นทั้งสองอย่าง
2. ตาม CTFL v4.0.1 functional testing มีวัตถุประสงค์หลัก 3 ข้อ คืออะไร
3. หน้าเว็บ LoanLab ซ่อนปุ่ม Pay ของ Account ที่ `FROZEN` ทีมรัน UI test ผ่านหมด ทำไมยังสรุปว่า LL-PAY-03 ถูกไม่ได้
4. Batch job รายงาน "SUCCESS" ทุกวัน ทำไมยังไม่พอ ต้องตรวจอะไรเพิ่มอย่างน้อย 3 อย่าง
5. ไฟล์ CSV มี field `Mug, "Big"` ต้องเขียนในไฟล์อย่างไรตาม RFC 4180 และถ้าสเปกของ interface กำหนดต่างจาก RFC 4180 ควรยึดอะไร
6. Component integration testing ต่างจาก system integration testing อย่างไร ยกตัวอย่างจาก LoanLab หรืองานธนาคาร
7. ทำไมทีมไม่ควรเขียน E2E test สำหรับทุกค่าขอบของยอดชำระ
8. แก้ฟังก์ชัน `nextBusinessDay()` แล้ว ควรเลือก regression test อย่างไร และ syllabus แนะนำให้ทำอะไรก่อน
9. ยกประโยชน์ 2 ข้อและความเสี่ยง 2 ข้อของ test automation ตาม CTFL v4.0.1 §6.2

<details><summary>เฉลย</summary>

1. API testing บอก **ช่องทาง** ที่ทดสอบ ส่วน regression testing บอก **เหตุผลและจังหวะ** ที่รัน (หลังมีการเปลี่ยนแปลง) · ตัวอย่าง: `'a payment cannot be reversed after end-of-day (LL-BUG-10 guard)'` เป็น API test ที่รันเป็น regression ทุก push
2. **Functional completeness, functional correctness, functional appropriateness** (§2.2.2)
3. UI test พิสูจน์แค่ว่าหน้าจอไม่ให้กด แต่ server อาจยังรับคำขอที่ส่งตรง (LL-BUG-03) — กฎทางธุรกิจต้องทดสอบที่ API ด้วย และ validation ฝั่ง client ไม่ใช่การป้องกัน
4. ตรวจ เช่น: เลือกรายการถูก (และไม่แตะรายการที่ไม่ควรแตะ) · ผลใน database และไฟล์/รายงานถูก · control total (count/SUM) ตรง · รันซ้ำไม่เกิดผลซ้ำ · กรณีขอบของวันที่ · log ใช้สืบสวนได้ (ตอบ 3 ข้อใดก็ได้ที่มีเหตุผล)
5. `"Mug, ""Big"""` — ครอบด้วย double quote เพราะมี comma และเขียน double quote ภายในซ้ำสองตัว · RFC 4180 เป็นเอกสาร Informational สเปกของ interface ที่สองระบบตกลงกันเป็น test basis ที่ต้องยึด
6. Component integration = interface ระหว่าง component ภายในระบบ (payment service กับ EOD ใน LoanLab) · system integration = interface กับระบบอื่นหรือ external service (LoanLab กับ core banking หรือ payment gateway) ต้องใช้ environment ใกล้ production
7. E2E ช้าและเปราะ ตรวจ functionality ชิ้นใหญ่ จึงควรมีน้อยตัว (ชั้นบนของ pyramid) · ค่าขอบทดสอบที่ API/unit ได้เร็ว เสถียร และบอกตำแหน่งที่ผิดชัดกว่า
8. ทำ **impact analysis** ก่อน (syllabus แนะนำ) เพื่อหาส่วนที่ได้รับผล: settlement, business date, หน้าต่าง reverse, เลขอ้างอิง, หน้า history → รัน `eod.api.spec`, `reversal.api.spec`, `payment-flow.ui.spec` และ unit test ของ rules
9. ประโยชน์ เช่น ลดงานซ้ำด้วยมือ, ความสม่ำเสมอ, feedback เร็วขึ้น, tester มีเวลาออกแบบ test ลึกขึ้น · ความเสี่ยง เช่น คาดหวังเกินจริง, ประมาณการดูแล script ต่ำไป, ใช้ในงานที่ manual เหมาะกว่า, พึ่งเครื่องมือจนละการคิดของคน, พึ่งผู้ขายหรือ open source ที่อาจถูกทิ้ง
</details>

## 📋 Skills Checklist
- [ ] อธิบาย 10 ประเภทได้ พร้อมตัวอย่างจาก ShopLab/LoanLab และจากงานของตัวเอง
- [ ] ระบุป้าย 5 มิติ (ทดสอบอะไร · ช่องทาง · ระดับ · เมื่อไร · วิธีรัน) ของ test หนึ่งตัวได้
- [ ] เลือกชั้นที่เหมาะสมในการทดสอบ business rule และอธิบายเหตุผลตาม test pyramid ได้
- [ ] ออกแบบ test ของ batch job ครบ input / processing / output / control total / re-run
- [ ] ทดสอบไฟล์ CSV ตาม checklist และอ่านกฎของ RFC 4180 ได้
- [ ] เขียน SQL ตรวจ reconciliation และ integrity หลังทำรายการได้
- [ ] ทำ impact analysis ง่ายๆ แล้วเลือกชุด regression ได้

## 🚀 Real-world Notes
- ประกาศรับสมัครงาน QA ในไทยมักเขียนรายการแบบ 10 ประเภทนี้ — ตอนสัมภาษณ์ให้เล่าเป็น **เรื่องเดียวที่ต่อกัน** (ฟีเจอร์หนึ่ง → ทดสอบที่ชั้นไหน → regression อย่างไร → automate อะไร) จะดีกว่าท่องนิยามทีละข้อ
- งานระบบธนาคารและประกัน **batch และ file interface** มักเป็นส่วนที่มีความเสี่ยงสูงแต่มีคนทดสอบน้อย เพราะไม่มีหน้าจอ — tester ที่อ่าน SQL, อ่าน log และเขียน script ตรวจไฟล์ได้มีค่ามาก
- ขอ **interface specification และ mapping document** ตั้งแต่วันแรกของโปรเจกต์ที่มีไฟล์หรือระบบภายนอก ถ้ายังไม่มีเอกสาร ให้ร่างเองแล้วให้ทั้งสองทีมยืนยัน — นั่นคือ static testing ที่หาบั๊กได้ถูกที่สุด
- อย่ารายงานความคืบหน้าว่า "automate ได้ 300 cases" ให้รายงานว่า "regression ของ flow ชำระเงินรันอัตโนมัติทุก push ใช้เวลา 6 นาที และจับบั๊กได้ 4 ตัวในเดือนนี้"
