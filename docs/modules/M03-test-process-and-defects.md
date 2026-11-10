# M03 — Test Process, Documentation & Defect Management

> **Level 1 · Foundations** · ⏱ 5 ชม. · Prerequisite: M01–M02 · ISTQB CTFL บทที่ 5

## 🎯 Learning Objectives
1. เขียน **Test Plan** แบบกระชับที่ใช้ได้จริง
2. สร้าง **Requirement Traceability Matrix (RTM)**
3. เขียน **Bug Report** คุณภาพสูง แยก **Severity vs Priority** ได้
4. อธิบาย **Defect Life Cycle** และการทำงานกับ Jira/Azure DevOps
5. อ่านและรายงาน **test metrics** พื้นฐาน + เขียน Test Summary Report

---

## 📖 1. เอกสารหลักของงานทดสอบ

| เอกสาร | ตอบคำถาม | Template |
|---|---|---|
| Test Strategy | องค์กร/ผลิตภัณฑ์ทดสอบ "อย่างไร" โดยรวม (ยาวนาน) | [test-strategy-template.md](../templates/test-strategy-template.md) |
| Test Plan | release/sprint นี้ทดสอบ อะไร ใคร เมื่อไหร่ ความเสี่ยง | [test-plan-template.md](../templates/test-plan-template.md) |
| Test Case / Scenario | ทดสอบอย่างไร ทีละขั้น | [test-case-template.md](../templates/test-case-template.md) |
| Bug Report | พบปัญหาอะไร ทำซ้ำอย่างไร | [bug-report-template.md](../templates/bug-report-template.md) |
| Test Summary Report | ผลเป็นอย่างไร พร้อมปล่อยไหม | [test-summary-report-template.md](../templates/test-summary-report-template.md) |

> ในทีม Agile เอกสาร "เบา" ลง แต่ไม่หายไป — Test Plan อาจเป็นหน้า Confluence 1 หน้า, test case อาจเป็น Gherkin/automation code ที่ผูกกับ user story

## 📖 2. Test Plan ที่ใช้ได้จริง (ไม่ใช่เอกสารยาว 40 หน้า)
หัวข้อขั้นต่ำ: **Scope (in/out)** · **Approach** (level, type, manual/auto) · **Risks & mitigations** · **Environments & data** · **Entry/Exit criteria** · **Schedule & roles** · **Deliverables**

**ตัวอย่าง Exit criteria:** test case priority High ผ่าน 100% · ไม่มีบั๊ก Critical/High ค้าง · regression automation ผ่าน ≥ 98% · performance p95 < 500 ms

## 📖 3. Requirement Traceability Matrix (RTM)

| Requirement | Test cases | Automated | Status |
|---|---|---|---|
| REQ-AUTH-03 | TC-AUTH-005, TC-AUTH-006 | `auth.spec.ts` › generic error message… | ✅ Pass |
| REQ-PRC-03 | TC-PRC-001..003 | `cart-pricing.spec.ts` › R1–R3 | ✅ Pass |
| REQ-ORD-06 | TC-ORD-010 | `cart-orders.api.spec.ts` › cancel restores stock | ❌ Fail (BUG-12) |

ประโยชน์: รู้ว่า requirement ใด **ยังไม่มี test** (coverage gap) และเมื่อ requirement เปลี่ยน รู้ว่าต้องแก้ test ไหน

> 💡 ใน automation ใส่ requirement ID ลงใน **ชื่อ test หรือ tag** (`@REQ-PRC-03`, `[Tags] REQ-PRC-03`) แล้ว generate RTM จาก report อัตโนมัติ

## 📖 4. Bug Report ที่ดี

**หลัก: คนอ่านต้องทำซ้ำได้ใน 2 นาที โดยไม่ต้องถามกลับ**

```
Title:        [Cart] Standard shipping charged when subtotal is exactly 1,000 THB
Environment:  ShopLab v1.0.0 · local · Chrome 142 · Windows 11 · Bug Mode ON
Requirement:  REQ-PRC-03 (free shipping when subtotal − discount ≥ 1,000)
Severity:     Major          Priority: High
Preconditions: logged in as a new customer, empty cart
Steps:
  1. Add "USB-C Hub 7-in-1" (ELEC-003, ฿1,000) × 1 to cart
  2. Open /cart, keep "Standard" shipping
Expected:     Shipping = FREE, Total = ฿1,070.00
Actual:       Shipping = ฿50.00, Total = ฿1,123.50
Evidence:     screenshot.png, HAR / API response of POST /api/cart/quote
Notes:        999 → 50 (correct), 1001 → FREE (correct) → boundary issue (">" instead of ">=")?
```

**ข้อห้าม:** ชื่อกำกวม ("ตะกร้าพัง"), รวมหลายบั๊กใน report เดียว, ใช้อารมณ์/โทษคน, ไม่มี expected

### Severity vs Priority

| | ความหมาย | ใครกำหนด |
|---|---|---|
| **Severity** | ผลกระทบทางเทคนิคต่อระบบ (Critical/Major/Minor/Trivial) | Tester |
| **Priority** | ความเร่งด่วนในการแก้ (P1–P4) | PO/Business |

ตัวอย่าง: โลโก้บริษัทสะกดผิดบนหน้าแรก → Severity *Trivial* แต่ Priority *High* · ระบบ crash เมื่อใช้ภาษาที่ไม่มีผู้ใช้ → Severity *Critical* แต่ Priority *Low*

## 📖 5. Defect Life Cycle
```
New → Open/Triaged → In Progress → Fixed/Resolved → Ready for Retest → Verified → Closed
        │                                                  │
        ├─▶ Rejected / Not a bug / Duplicate / Won't fix    └─▶ Reopened (retest fail)
        └─▶ Deferred (แก้ release ถัดไป)
```
- ทุกบั๊กที่ "Fixed" ต้องมี **confirmation test** และควรได้ **regression test อัตโนมัติ** เพื่อไม่ให้กลับมาอีก
- **Root cause analysis (RCA)** สำหรับบั๊ก Critical — ถาม "ทำไม" 5 ครั้ง

## 📖 6. Test Metrics พื้นฐาน
| Metric | สูตร | ใช้ตอบ |
|---|---|---|
| Test execution progress | executed / planned | ทดสอบไปถึงไหน |
| Pass rate | passed / executed | คุณภาพ build ปัจจุบัน |
| Defect density | defects / size (story, KLOC) | โมดูลไหนเสี่ยง |
| Defect leakage | bugs พบใน prod / bugs ทั้งหมด | ประสิทธิภาพการทดสอบ |
| Requirement coverage | REQ ที่มี test / REQ ทั้งหมด | ช่องโหว่ |
| Automation coverage | regression cases ที่ automate / ทั้งหมด | ความคืบหน้า automation |

> ⚠️ ระวัง metric ที่ถูก "เล่นเกม" ได้ เช่น จำนวน test case หรือจำนวนบั๊กต่อคน (ดูเพิ่มเติม M20)

---

## 🧪 Lab 03.1 — Test Plan 1 หน้า (45 นาที)
เขียน Test Plan สำหรับ "ShopLab release 1.1: เพิ่มคูปอง + checkout ใหม่" ด้วย template — ต้องมีความเสี่ยง ≥ 5 ข้อพร้อม mitigation

## 🧪 Lab 03.2 — RTM (45 นาที)
ทำ RTM ของ REQ-AUTH, REQ-CART, REQ-PRC ผูกกับ test case จาก Lab 02 และ test ที่มีอยู่ใน `tests/playwright` — ระบุ requirement ที่ยังไม่มี test

## 🧪 Lab 03.3 — Bug Bash + Bug Reports (60 นาที, Bug Mode ON)
หาบั๊ก ≥ 5 ตัว เขียน bug report ตาม template แนบหลักฐาน (screenshot + API response จาก DevTools)
**เกณฑ์ผ่าน:** เพื่อนร่วมชั้นทำซ้ำบั๊กได้จาก report โดยไม่ต้องถาม · severity/priority สมเหตุสมผล

## 🧪 Lab 03.4 — Test Summary Report (30 นาที)
รัน `npx playwright test` ทั้งใน Bug Mode ปิด/เปิด แล้วเขียน summary report ว่า "พร้อมปล่อยหรือไม่ เพราะอะไร"

---

## ✅ Check Your Understanding
1. บั๊ก "ปุ่ม Checkout หายบน iPhone SE" — severity/priority ควรเป็นอย่างไร? ตอบพร้อมเหตุผล
2. RTM ช่วยอะไรเมื่อ requirement REQ-PRC-03 เปลี่ยนเป็น "ส่งฟรีเมื่อ ≥ 1,500"?
3. Exit criteria ต่างจาก Entry criteria อย่างไร? ยกตัวอย่างอย่างละ 1
4. Dev ปิดบั๊กเป็น "Cannot reproduce" — tester ควรทำอย่างไร?
5. Defect leakage สูงขึ้นจาก 5% เป็น 20% บอกอะไร?

<details><summary>เฉลย</summary>

1. Severity: Critical/Major (ผู้ใช้กลุ่มหนึ่งซื้อไม่ได้เลย) · Priority: ขึ้นกับสัดส่วนผู้ใช้ iPhone SE — มักเป็น High
2. หา test case/automation ที่ผูกกับ REQ-PRC-03 ได้ทันที เพื่อแก้ค่าคาดหวังและ boundary (1,499/1,500/1,501)
3. Entry = เงื่อนไขก่อนเริ่มทดสอบ (เช่น build deploy บน test env แล้ว, smoke ผ่าน) · Exit = เงื่อนไขหยุด/พร้อมปล่อย (เช่น ไม่มีบั๊ก Critical ค้าง)
4. ตรวจ environment/data/ขั้นตอนที่ต่างกัน, เพิ่มหลักฐาน (video, trace, HAR, log, timestamp), นัด pair กับ dev ทำซ้ำด้วยกัน
5. การทดสอบก่อนปล่อยหลุดบั๊กมากขึ้น — ต้องทบทวน coverage, test data, environment parity, หรือเวลาทดสอบที่ถูกบีบ
</details>

## 📋 Skills Checklist
- [ ] เขียน Test Plan 1 หน้าที่มี risk + entry/exit criteria
- [ ] ทำ RTM และหา coverage gap ได้
- [ ] เขียน bug report ที่คนอื่นทำซ้ำได้ทันที
- [ ] อธิบาย severity vs priority พร้อมตัวอย่าง

## 🚀 Real-world Notes
- เครื่องมือที่พบบ่อย: **Jira + Xray/Zephyr**, **Azure DevOps Test Plans**, **TestRail**, **Qase** — หลักการเหมือนกัน
- แนบ **Playwright trace** (`trace.zip`) หรือ **Robot log.html** กับบั๊ก ช่วยให้ dev แก้เร็วขึ้นมาก
- ประชุม **bug triage** สั้นๆ ทุกวัน/สัปดาห์ ร่วมกับ PO และ dev lead
