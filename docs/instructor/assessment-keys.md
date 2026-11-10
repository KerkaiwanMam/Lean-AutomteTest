# ⚠️ Spoiler — Skills Assessment Keys (SA1–SA4, instructor key)

> **repo นี้เป็น public — ไฟล์นี้อ่านได้ทั่วไป** ผู้เรียนควรทำ SA เองก่อน ถ้าใช้สอบจริงให้แจก repo ฉบับที่ตัด `docs/instructor/` และไฟล์ `*.solution*` ออก
> ค่าเงินทุกค่าในไฟล์นี้คำนวณด้วย `practice-app/src/pricing.js` ของ ShopLab (ไม่ได้คิดมือ) เมื่อ 2026-11-10

## SA1 — Test Design

### บั๊กที่ฝังสำหรับสอบ
| ชุด | คำสั่ง | บั๊ก | อาการที่ผู้เรียนควรรายงาน |
|---|---|---|---|
| หลัก | `GRADING_BUGS=BUG-07` | คูปองหมดอายุใช้ได้ | ใส่ `EXPIRED20` แล้วได้ส่วนลด 20% (ควรขึ้น "Coupon has expired") |
| สำรอง (สอบซ่อม) | `GRADING_BUGS=BUG-01` | ส่งฟรีใช้ `>` แทน `>=` | ซื้อ ELEC-003 (1,000 ฿) แล้วโดนค่าส่ง 50 ฿ |
| สำรอง 2 | `GRADING_BUGS=BUG-06` | อายุ 17 สมัครได้ | สมัครด้วยวันเกิดที่จะครบ 18 ในวันพรุ่งนี้แล้วสำเร็จ |

### T1 — ค่าที่ต้องมี (ตัวอย่างขั้นต่ำ)
| Field | BVA ที่ต้องเห็น |
|---|---|
| username (4–20) | ความยาว 3 / 4 / 20 / 21 · อักขระต้องห้าม (`-`, ช่องว่าง, ภาษาไทย) แยกทีละแถว · ซ้ำแบบตัวพิมพ์ต่าง (`CUSTOMER`) |
| password (8–64) | 7 / 8 / 64 / 65 · ขาดแต่ละประเภทตัวอักษรทีละแถว |
| phone | 9 / 10 / 11 หลัก · ไม่ขึ้นต้น 0 · มีตัวอักษร |
| อายุ 18–60 | 2-value: 17, 18, 60, 61 · 3-value: 17, 18, 19, 59, 60, 61 · วันเกิดคำนวณจาก "วันนี้" (เช่น `birthDateForAge(18, 1)` = อีก 1 วันครบ 18) |

### T2 — Decision table (ค่าคำนวณจริง)
| Rule | ข้อมูล | Coupon | Ship | Subtotal | Discount | Shipping | VAT | Total | หมายเหตุ |
|---|---|---|---|---|---|---|---|---|---|
| R1 | BOOK-002 ×1 | – | standard | 999.00 | 0.00 | 50.00 | 73.43 | 1,122.43 | ต่ำกว่าเกณฑ์ส่งฟรี |
| R2 | ELEC-003 ×1 | – | standard | 1,000.00 | 0.00 | 0.00 | 70.00 | 1,070.00 | ขอบพอดี (BUG-01) |
| R3 | ELEC-003 ×1 | SAVE10 | standard | 1,000.00 | 100.00 | 50.00 | 66.50 | 1,016.50 | ส่วนลดทำให้ต่ำกว่าเกณฑ์; VAT หลังส่วนลด |
| R4 | ELEC-004 ×1 | SAVE10 | standard | 12,900.00 | 500.00 | 0.00 | 868.00 | 13,268.00 | เพดาน 500 |
| R5 | FASH-003 ×1 | BIG500 | standard | 3,000.00 | 500.00 | 0.00 | 175.00 | 2,675.00 | ขอบขั้นต่ำ 3,000 |
| R6 | FASH-001 ×1 | BIG500 | standard | 290.00 | 0.00 | 50.00 | 23.80 | 363.80 | `COUPON_MIN_SUBTOTAL` |
| R7 | FASH-001 ×1 | FREESHIP | standard | 290.00 | 0.00 | 0.00 | 20.30 | 310.30 | |
| R8 | ELEC-001 ×1 | – | express | 499.00 | 0.00 | 120.00 | 43.33 | 662.33 | express คิดเสมอ |
| R9 | FASH-001 ×1 | EXPIRED20 | standard | 290.00 | 0.00 | 50.00 | 23.80 | 363.80 | `COUPON_EXPIRED` (BUG-07) |

**คำถามถึง PO ที่ควรได้คะแนน:** FREESHIP ใช้กับ express ได้ไหม (REQ-PRC-04 ตอบแล้ว — ถ้าถามข้อนี้ให้ชี้กลับว่า requirement มีคำตอบ) · คูปองหมดอายุ "เวลาไหนของวัน/timezone อะไร" · ใช้คูปองซ้อนได้ไหม (REQ-PRC-02 ระบุ 1 ใบ) · ส่วนลด fixed เกินยอดสินค้าได้ไหม · ปัดเศษ VAT แบบใด (ระบุแล้วว่า 2 ตำแหน่ง แต่ไม่ระบุวิธีปัด)

### T3 — State table
Valid: PENDING→PAID, PENDING→CANCELLED, PAID→SHIPPED, PAID→CANCELLED, SHIPPED→DELIVERED (5 ข้อ = 0-switch) · Invalid: อีก 15 คู่ (ไม่นับ state เดิม→state เดิม) ต้องได้ **409 INVALID_TRANSITION** · DELIVERED และ CANCELLED เป็น final

## SA2 — Locators + First Script
- Part A: เฉลย `tests/playwright/tests/exercises/sa2-locators.solution.spec.ts` — **ผ่าน 10/10** (ตรวจแล้ว ดู change log CL-011) คำตอบอื่นที่ทนทานก็ได้คะแนน
- ข้อที่ผู้เรียนพลาดบ่อย: A3 `getByLabel('Password')` เจอ 2 element (รวม "Show password") ต้อง `exact: true` · A10 `hasText: '3'` เจอหลายแถว (13, 23…) ต้องเทียบ cell แบบ exact · A6 ลืม `frameLocator`
- Part B ค่าที่ถูกต้อง (ELEC-001 ×2 + BOOK-002 ×1, SAVE10, standard): **subtotal 1,997.00 · discount 199.70 · shipping 0.00 (FREE) · VAT 125.81 · total 1,923.11**

## SA3 — บั๊กในขอบเขต (ห้ามแจกผู้เรียน)
**BUG-01, BUG-02, BUG-07, BUG-10, BUG-12** (ตะกร้า ราคา และ order)
```bash
python tools/grade_suite.py --cwd <path>/playwright --cmd "npx playwright test" --bugs BUG-01,BUG-02,BUG-07,BUG-10,BUG-12 --report grading/<student>-pw
python tools/grade_suite.py --cwd <path>/robot --cmd "robot --outputdir {out} tests" --bugs BUG-01,BUG-02,BUG-07,BUG-10,BUG-12 --report grading/<student>-rf
```
**ผลของ reference (ตรวจจริง 2026-11-10):** Playwright เฉพาะ project `api` จับได้ 10/13 — **พลาด BUG-01, BUG-07, BUG-09** (ทั้งสามมี test เฉพาะที่ชั้น UI; BUG-09 เป็น XSS ฝั่ง browser ที่ API test มองไม่เห็น) — ใช้เป็นตัวอย่างอธิบายว่าทำไมต้องมีหลายชั้น
ผู้เรียนที่เขียนเฉพาะ API มักพลาด BUG-01/BUG-07 ถ้าไม่ได้ทดสอบขอบ 1,000 และคูปองหมดอายุที่ API `/cart/quote`

## SA4 — จุดอ่อนจริงของ reference Robot suite (ใช้เทียบกับ review ของผู้เรียน)
ผู้เรียนที่ดีควรพบอย่างน้อย 3 ข้อ:
1. **ไม่มี lint/format** (Robocop/Robotidy) ใน repo หรือ CI
2. **DB suite ผูกกับไฟล์ SQLite ในเครื่อง** (`DB_PATH` ใน `variables.py`) → ใช้กับ ShopLab ที่รันใน container/อีกเครื่องไม่ได้
3. **`__init__.robot` reset ข้อมูล** → ต้องจำส่ง `RESET_DATA:False` เมื่อใช้ pabot (กับดักที่เอกสารเตือนไว้ แต่ไม่ได้ป้องกันในโค้ด)
4. **oracle ราคาซ้ำสองที่** (`ShopLabLibrary.Expected Quote` และ `money.ts` ของ Playwright) → แก้กฎแล้วอาจลืมแก้อีกที่
5. SKU และบัญชี seed (`customer`, `jane`) ฝังอยู่ใน test โดยตรง; negative login ใช้บัญชี seed ร่วม (เพิ่ม `failed_attempts`)
6. ไม่มี tag สำหรับ quarantine flaky test และไม่มี tag requirement ID แบบสม่ำเสมอ
7. legacy Selenium suite ต้องมี Chrome + driver และถูกตัดออกด้วย tag เท่านั้น
ข้อที่ **ไม่ควร** ให้คะแนนเป็นจุดอ่อน: การใช้ `Get Url` แทน `Wait For Navigation` (ตั้งใจแก้ race แล้ว, CL-008) และ `browser.resource` (ตั้งใจแก้ปัญหา import ซ้ำ)
