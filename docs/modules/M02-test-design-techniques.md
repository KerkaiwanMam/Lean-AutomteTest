# M02 — Test Design Techniques

> **Level 1 · Foundations** · ⏱ 8 ชม. · Prerequisite: M01 · ISTQB CTFL บทที่ 4
> โมดูลที่ **สำคัญที่สุด** ของหลักสูตร — automation ที่ดีเริ่มจาก test case ที่ดี

## 🎯 Learning Objectives
1. ใช้ **Equivalence Partitioning (EP)** และ **Boundary Value Analysis (BVA)** กับ field จริงได้
2. สร้าง **Decision Table** จาก business rule ที่มีหลายเงื่อนไข
3. วาด **State Transition Diagram/Table** และหา valid/invalid transitions
4. ใช้ **Pairwise testing** ลดจำนวน combination
5. ใช้เทคนิค **experience-based**: error guessing, exploratory testing, checklist
6. เลือกเทคนิคให้เหมาะกับความเสี่ยง และเขียน test case ที่ **automate ได้**

---

## 📖 1. ภาพรวมเทคนิค

| กลุ่ม | เทคนิค | ใช้เมื่อ |
|---|---|---|
| **Black-box** (จาก spec) | EP, BVA, Decision Table, State Transition, Pairwise, Use Case | มี requirement / ไม่ดูโค้ด |
| **White-box** (จากโค้ด) | Statement / Branch coverage | Unit test, วัดว่า test ครอบคลุมโค้ดแค่ไหน |
| **Experience-based** | Error guessing, Exploratory, Checklist | เสริม black-box, spec ไม่ครบ, เวลาจำกัด |

## 📖 2. Equivalence Partitioning (EP)

แบ่งค่าอินพุตเป็น "กลุ่ม" ที่ระบบน่าจะทำงานเหมือนกัน แล้วทดสอบ **ตัวแทน 1 ค่าต่อกลุ่ม**

**ตัวอย่าง REQ-REG-01 — username 4–20 ตัว [A-Za-z0-9_]**

| Partition | ตัวอย่าง | คาดหวัง |
|---|---|---|
| ✅ ความยาว 4–20, อักขระถูกต้อง | `tester_01` | ผ่าน |
| ❌ สั้นกว่า 4 | `abc` | error |
| ❌ ยาวกว่า 20 | `a` × 21 | error |
| ❌ มีอักขระต้องห้าม | `test-er`, `ทดสอบ`, `te st` | error |
| ❌ ว่าง | `` | error |
| ❌ ซ้ำกับที่มีอยู่ (ไม่สนตัวพิมพ์) | `CUSTOMER` | 409 |

> กฎ: invalid partition ให้ทดสอบ **ทีละตัว** (ถ้ารวมหลาย invalid ใน case เดียว จะไม่รู้ว่า error มาจากอะไร)

## 📖 3. Boundary Value Analysis (BVA)

บั๊กชอบอยู่ที่ "ขอบ" (`<` vs `<=`) — ทดสอบค่าที่ขอบและติดขอบ

- **2-value BVA:** ขอบ + ค่าถัดไปนอกขอบ → สำหรับช่วง 18–60: `17, 18, 60, 61`
- **3-value BVA:** ก่อนขอบ/ขอบ/หลังขอบ → `17, 18, 19, 59, 60, 61`

**ตัวอย่างใน ShopLab**

| Requirement | ค่าที่ต้องทดสอบ |
|---|---|
| REQ-REG-07 อายุ 18–60 | 17 (อีก 1 วันครบ 18), 18 วันนี้, 60, 61 วันนี้ |
| REQ-PRC-03 ส่งฟรีเมื่อ ≥ 1,000 | 999, **1000**, 1001 (สินค้า BOOK-002, ELEC-003, BOOK-001 ถูกตั้งราคาไว้ให้แล้ว) |
| REQ-CART-01 จำนวน 1–10 | 0, 1, 10, 11 |
| REQ-PRC-02 BIG500 ≥ 3,000 | 2,999 → ไม่ลด, 3,000 → ลด |
| REQ-ORD-04 COD ≤ 5,000 | total 5,000.00 / 5,000.01 |

> 💡 สังเกต: BVA ของ "อายุ" ขึ้นกับ **วันที่ทดสอบ** → test data ต้องคำนวณแบบ dynamic (`birthDateForAge()` ใน `tests/playwright/src/data/testData.ts`) — ห้าม hard-code วันเกิด

## 📖 4. Decision Table Testing

ใช้เมื่อผลลัพธ์ขึ้นกับ **หลายเงื่อนไขร่วมกัน** — ป้องกันการลืม combination

**ขั้นตอน**
1. ระบุ **conditions** (เงื่อนไข) และ **actions** (ผลลัพธ์)
2. สร้างตาราง 2ⁿ คอลัมน์ (n = จำนวนเงื่อนไข boolean)
3. **ยุบ (collapse)** คอลัมน์ที่ผลลัพธ์เหมือนกันและเงื่อนไขบางตัว "ไม่มีผล" (–)
4. แต่ละคอลัมน์ = 1 test case

**ตัวอย่าง: ค่าส่ง (REQ-PRC-03/04 + FREESHIP)**

| Conditions | R1 | R2 | R3 | R4 |
|---|---|---|---|---|
| Express? | Y | N | N | N |
| ใช้ FREESHIP? | – | Y | N | N |
| (Subtotal − Discount) ≥ 1000? | – | – | Y | N |
| **Action: ค่าส่ง** | **120** | **0** | **0** | **50** |

ตารางเต็ม (รวมคูปองทุกแบบ) อยู่ใน [REQUIREMENTS.md](../../practice-app/REQUIREMENTS.md#decision-table-ตัวอย่างสำหรับ-module-02) และถูก automate เป็น data-driven test ใน:
- Playwright: `tests/playwright/tests/ui/cart-pricing.spec.ts` (`DECISION_TABLE`)
- Robot: `tests/robot/tests/ui/03_cart_pricing.robot` (`Test Template`)

## 📖 5. State Transition Testing

ใช้กับระบบที่มี "สถานะ" เช่น order, บัญชีผู้ใช้, workflow อนุมัติ

**Order (REQ-ORD-05)**
```
            pay(admin)            ship              deliver
 [PENDING] ───────────▶ [PAID] ─────────▶ [SHIPPED] ─────────▶ [DELIVERED]
     │  ▲ (COD)            │ (card: สร้างเป็น PAID ทันที)
     │ cancel              │ cancel
     ▼                     ▼
 [CANCELLED] ◀─────────────┘
```

**State table** — ช่องว่าง = invalid transition (ต้องได้ 409)

| From \ To | PENDING | PAID | SHIPPED | DELIVERED | CANCELLED |
|---|---|---|---|---|---|
| PENDING | – | ✅ | ❌ | ❌ | ✅ |
| PAID | ❌ | – | ✅ | ❌ | ✅ |
| SHIPPED | ❌ | ❌ | – | ✅ | ❌ |
| DELIVERED | ❌ | ❌ | ❌ | – | ❌ |
| CANCELLED | ❌ | ❌ | ❌ | ❌ | – |

ระดับความครอบคลุม: **0-switch** (ทุก transition ที่ valid 1 ครั้ง) → **all invalid transitions** → **1-switch** (ทุกคู่ transition ต่อกัน)
ดู automation: `order state machine rejects invalid transitions` ใน `tests/playwright/tests/api/cart-orders.api.spec.ts`

**สถานะบัญชีผู้ใช้ (REQ-AUTH-05):** active → (ผิด 5 ครั้ง) → locked → (admin unlock) → active

## 📖 6. Pairwise (All-pairs) Testing

เมื่อมีหลายพารามิเตอร์ จำนวน combination ระเบิด เช่น
Browser(3) × Language(2) × Payment(2) × Shipping(2) × Coupon(4) = **96 cases**

งานวิจัยของ NIST (Kuhn, Wallace & Gallo, IEEE TSE 2004) พบว่า failure ส่วนใหญ่เกิดจาก **ปัจจัยเดียวหรือสองปัจจัย** ยิ่งต้องใช้หลายปัจจัยร่วมกันยิ่งพบน้อยลง และเกือบทั้งหมดเกี่ยวข้องกับไม่เกิน 6 ปัจจัย (ตัวเลข "ส่วนใหญ่" ที่แน่นอนขึ้นกับชุดข้อมูลที่ศึกษา) → ใช้ pairwise ครอบคลุมทุก "คู่" ได้ด้วย case จำนวนน้อยมาก — ตัวอย่างข้างบน (96 combination, 66 คู่) คำนวณจริงได้ชุดทดสอบ **12–15 cases** (ขั้นต่ำเชิงทฤษฎี = 4 × 3 = 12 จากสองพารามิเตอร์ที่มีจำนวนค่ามากที่สุด)

เครื่องมือ: [PICT (Microsoft)](https://github.com/microsoft/pict), allpairspy (Python), pairwise.org

```text
# pict model (shoplab.txt)
Browser:  Chromium, Firefox, WebKit
Language: EN, TH
Payment:  card, cod
Shipping: standard, express
Coupon:   none, SAVE10, BIG500, FREESHIP
```

## 📖 7. Experience-based Techniques

- **Error guessing** — checklist จากประสบการณ์: ค่าว่าง, ช่องว่างหน้า/หลัง, ภาษาไทย/emoji, ทศนิยม, ค่าลบ, ข้อความยาวมาก, double-click, back button, refresh ระหว่าง checkout, เปิด 2 แท็บ, session หมดอายุ, timezone, เลขทศนิยมปัดเศษ
- **Exploratory testing** — เรียน + ออกแบบ + รัน พร้อมกัน แบบมี **charter** และ **time-box**
  ```
  Charter: Explore  <พื้นที่>   with  <ทรัพยากร/เทคนิค>   to discover  <ข้อมูล/ความเสี่ยง>
  เช่น     Explore  coupons     with  ค่าแปลกๆ + 2 tabs    to discover  การใช้คูปองซ้อน/ผิดเงื่อนไข
  ```
- **Checklist-based** — เช่น checklist ฟอร์ม, checklist accessibility

## 📖 8. จาก test condition สู่ test case ที่ automate ได้

Test case ที่ดีต้อง **ชัดเจน, ทำซ้ำได้, ตรวจสอบได้, อิสระต่อกัน**

```
ID:            TC-PRC-004
Requirement:   REQ-PRC-02, REQ-PRC-03, REQ-PRC-05
Title:         SAVE10 ทำให้ยอดต่ำกว่าเกณฑ์ส่งฟรี → เก็บค่าส่ง และคิด VAT หลังหักส่วนลด
Precondition:  ผู้ใช้ใหม่ login แล้ว, ตะกร้าว่าง
Test data:     ELEC-003 (1,000 ฿) × 1, coupon SAVE10, standard
Steps:         1. เพิ่ม ELEC-003 ลงตะกร้า  2. เปิด /cart  3. ใส่ SAVE10 → Apply
Expected:      Discount 100.00 · Shipping 50.00 · VAT 66.50 · Total 1,016.50
               ข้อความ "Coupon SAVE10 applied"
Priority:      High          Automation: Yes (UI + API)
```

---

## 🧪 Lab 02.1 — EP + BVA ฟอร์มสมัครสมาชิก (60 นาที)
ออกแบบ test conditions สำหรับ REQ-REG-01 ถึง REQ-REG-07 ด้วย EP และ BVA
**ส่ง:** ตาราง (field / partition / ค่าตัวแทน / คาดหวัง) ≥ 30 แถว
**เกณฑ์ผ่าน:** ครอบคลุมทุก field, มี BVA ของ username length (3/4/20/21), password length (7/8/64/65), age (17/18/60/61)

## 🧪 Lab 02.2 — Decision table ของราคา (60 นาที)
สร้าง decision table เต็มของ REQ-PRC (คูปอง 5 แบบ × shipping 2 แบบ × threshold) แล้วยุบให้เหลือน้อยที่สุด
**เกณฑ์ผ่าน:** ทุก rule มีค่าคาดหวัง subtotal/discount/shipping/VAT/total ที่คำนวณถูก — ตรวจกับ `POST /api/cart/quote`

## 🧪 Lab 02.3 — State transition ของ order (45 นาที)
วาด diagram, ทำ state table, เขียน test cases 0-switch + invalid transitions ทั้งหมด แล้วทดสอบด้วย Postman/curl ตาม `/api-docs`

## 🧪 Lab 02.4 — Exploratory session (45 นาที, Bug Mode ON)
ใช้ charter 2 ข้อที่เขียนเอง จด session notes (เวลา, สิ่งที่ทำ, บั๊ก, คำถาม)
**เกณฑ์ผ่าน:** พบบั๊กใน Bug Mode ≥ 4 ตัว พร้อมระบุ requirement ที่ถูกละเมิด

---

## ✅ Check Your Understanding
1. ช่อง "จำนวน" รับ 1–10 — ค่า 2-value BVA มีอะไรบ้าง?
2. เงื่อนไข boolean 4 ตัว decision table เต็มมีกี่คอลัมน์?
3. ทำไมไม่ควรรวม invalid partition หลายตัวใน test case เดียว?
4. Order สถานะ SHIPPED ลูกค้ากด cancel ควรได้ผลอย่างไร? ใช้เทคนิคใดค้นหา case นี้?
5. ระบบมีพารามิเตอร์ 6 ตัว ตัวละ 3 ค่า ต้องการลดจำนวน case — ใช้เทคนิคใด?
6. ทำไม test อายุ 18 ปีห้ามใช้วันเกิดแบบ hard-code `2008-01-01`?

<details><summary>เฉลย</summary>

1. 0, 1, 10, 11
2. 2⁴ = 16 คอลัมน์ (ก่อนยุบ)
3. ถ้า fail จะไม่รู้ว่าเกิดจาก input ตัวไหน และ input ตัวแรกที่ invalid อาจ "บัง" (mask) การตรวจตัวอื่น
4. ต้องถูกปฏิเสธ (409 INVALID_TRANSITION) — State transition testing (invalid transition)
5. Pairwise / combinatorial testing (เช่น PICT)
6. เพราะอายุเปลี่ยนตามวันที่รัน test — test จะเริ่ม fail เองเมื่อเวลาผ่านไป (time bomb) ต้องคำนวณจาก "วันนี้"
</details>

## 📋 Skills Checklist
- [ ] ใช้ EP/BVA กับ field ตัวเลข ข้อความ วันที่ ได้
- [ ] สร้างและยุบ decision table ได้
- [ ] วาด state diagram + state table และหา invalid transitions ได้
- [ ] เขียน exploratory charter และ session notes ได้
- [ ] เขียน test case ที่มี precondition, data, expected ชัดเจนพอจะ automate

## 🚀 Real-world Notes
- เขียน decision table **ร่วมกับ BA/PO** — มักพบว่า requirement ไม่ครบ (เช่น "ใช้ FREESHIP กับ express ได้ไหม?") นี่คือ shift-left ที่มีค่ามาก
- เก็บ decision table เป็น **data file** (CSV/JSON) แล้วให้ automation อ่าน → BA แก้ตาราง test ก็อัปเดตตาม
- อย่าทดสอบทุกอย่างผ่าน UI — BVA ของ field ควรทดสอบที่ API/unit level (เร็วกว่ามาก — ดูเวลาต่อ test ในตาราง pyramid ของ M04) แล้วเก็บ UI ไว้ 1–2 case
