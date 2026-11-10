# M20 — Quality Strategy, Metrics & Leadership

> **Level 5 · Expert** · ⏱ 6 ชม. · Prerequisite: Level 4

## 🎯 Learning Objectives
1. เขียน **Test Strategy** ระดับผลิตภัณฑ์/องค์กร แบบ **risk-based**
2. เลือก **metrics** ที่ขับเคลื่อนพฤติกรรมที่ดี และหลีกเลี่ยง vanity metrics
3. ทำ **code review** ของ test code ด้วย checklist
4. ประเมินระดับ **test maturity** ของทีมและวาง roadmap ปรับปรุง
5. **สื่อสาร** คุณภาพกับผู้บริหาร, mentor ทีม, จัดการ stakeholder

---

## 📖 1. Risk-based Testing
**Risk = Likelihood × Impact** · ทดสอบหนัก/ลึก/อัตโนมัติก่อน ในพื้นที่เสี่ยงสูง

| พื้นที่ ShopLab | Likelihood | Impact | Risk | แนวทาง |
|---|---|---|---|---|
| Pricing/coupon/VAT | สูง (กฎซับซ้อน) | สูง (เงิน, กฎหมายภาษี) | 🔴 | unit + API decision table + UI 1 flow |
| Checkout/payment | กลาง | สูงมาก | 🔴 | E2E smoke ทุก PR + contract กับ payment |
| Access control | กลาง | สูงมาก (data breach) | 🔴 | API security suite ทุก PR |
| Catalog search/sort | กลาง | กลาง | 🟠 | API + UI regression |
| Admin import CSV | กลาง | กลาง | 🟠 | API + data checks |
| Language toggle | ต่ำ | ต่ำ | 🟢 | manual exploratory ต่อ release |

จัด **risk workshop** กับ PO/dev/ops ทุก release ใหญ่ — ใช้ product risk register

## 📖 2. Test Strategy document
หัวข้อ (ดู [test-strategy-template.md](../templates/test-strategy-template.md)): ขอบเขตและเป้าหมายคุณภาพ · risk profile · test levels & types ต่อชั้น · automation strategy (pyramid, tools, ownership) · environments & data · CI/CD & quality gates · NFR (performance, security, a11y) · defect management · metrics & reporting · roles & skills · continuous improvement

## 📖 3. Metrics ที่ดี vs แย่
| ✅ ใช้ได้ (outcome/flow) | ❌ ระวัง (vanity/เล่นเกมได้) |
|---|---|
| Defect leakage / escaped defects (ตาม severity) | จำนวน test case |
| Feedback time ของ pipeline (PR → ผล) | จำนวนบั๊กที่ tester แต่ละคนพบ |
| Flaky rate และ MTTR ของ test ที่พัง | % automation (ถ้าไม่ดูคุณภาพ test) |
| Change failure rate, lead time (DORA) | code coverage เป็นเป้าหมายตายตัว |
| Requirement/risk coverage | pass rate 100% (อาจแปลว่า test ไม่จับอะไร) |
| **Mutation score / bug-mode detection rate** | |

> 🔑 **Bug Mode detection rate** ของ ShopLab คือ "mutation testing แบบง่าย": ฝังบั๊ก 13 ตัว → suite จับได้กี่ตัว? reference framework จับได้ **13/13** — นี่คือหลักฐานคุณค่าของ test ที่ดีกว่า "จำนวน test"
> ระดับมืออาชีพ: mutation testing จริงด้วย **Stryker** (JS/TS), **mutmut** (Python), **PIT** (Java)

## 📖 4. Code review ของ test code
Checklist (ใช้ใน PR):
- [ ] ชื่อ test บอกพฤติกรรม + ผลที่คาดหวัง
- [ ] มี assertion ที่ตรวจผลทางธุรกิจ (ไม่ใช่แค่ "ไม่ error")
- [ ] ไม่มี hard-coded wait / magic numbers / credentials
- [ ] locator ทนทาน (role/label/testid) อยู่ใน page object
- [ ] test อิสระ ข้อมูลของตัวเอง cleanup ถูก
- [ ] ทดสอบที่ชั้นที่เหมาะสม (ไม่ใช่ UI ทุกอย่าง)
- [ ] รันผ่านด้วย `--repeat-each` (สำหรับ test ใหม่)
- [ ] ถ้าเป็น regression ของบั๊ก: อ้าง bug ID และเคย fail กับโค้ดที่มีบั๊ก

## 📖 5. Test maturity
| ระดับ | ลักษณะ |
|---|---|
| 1 Initial | manual ล้วน, ทดสอบท้าย project |
| 2 Managed | มี test plan/case, bug tracking, automation บางส่วนรันมือ |
| 3 Defined | automation ใน CI, pyramid, test data strategy |
| 4 Measured | metrics, quality gates, flaky management, NFR อัตโนมัติ |
| 5 Optimizing | whole-team quality, shift-left/right, data-driven improvement |
ตารางนี้เป็นฉบับย่อของหลักสูตร โดยตั้งชื่อระดับตาม **TMMi** (5 ระดับแบบ staged: Initial, Managed, Defined, Measured, Optimization — ต้องผ่านทุก process area ของระดับหนึ่งก่อนขึ้นระดับถัดไป) ส่วนคำอธิบายแต่ละระดับเป็นตัวอย่างของหลักสูตรเอง ไม่ใช่นิยามทางการ · อีกโมเดลคือ **TPI NEXT** (Sogeti) แบบ continuous ที่ประเมินและปรับปรุงทีละ key area ได้

## 📖 6. Leadership & communication
- **รายงานผู้บริหาร:** 1 หน้า — สถานะ (🟢🟠🔴), ความเสี่ยงหลัก 3 ข้อ, สิ่งที่ต้องการให้ตัดสินใจ — ไม่ใช่ตาราง pass/fail 500 แถว
- **พูดภาษาธุรกิจ:** "บั๊ก VAT ทำให้ใบกำกับภาษีผิด เสี่ยงค่าปรับสรรพากร" ดีกว่า "BUG-02 severity major"
- **Mentoring:** pair testing, code review ที่สอน (ถาม "ทำไม" แทนสั่ง), lunch & learn
- **Influencing dev:** testability, `data-testid`, unit test, test hooks — แสดงข้อมูลว่าประหยัดเวลาได้เท่าไร
- **ประมาณการงานทดสอบ:** three-point (O+4M+P)/6, เผื่อ environment/data/บั๊กรอบแก้

---

## 🧪 Lab 20.1 — Test Strategy (90 นาที)
เขียน Test Strategy ของ ShopLab (≤ 5 หน้า) ด้วย template — ต้องมี risk matrix, pyramid ที่มีตัวเลข, quality gates, metrics 5 ตัวพร้อมเป้าหมาย

## 🧪 Lab 20.2 — Detection rate (45 นาที)
รัน suite ของตัวเอง (จาก Lab 15.2) ใน Bug Mode — คำนวณ detection rate ต่อ BUG-ID · บั๊กที่จับไม่ได้ เพิ่ม test ให้จับได้ · สรุปเป็น 1 slide

## 🧪 Lab 20.3 — Review a PR (30 นาที)
review PR ของเพื่อน (จาก Lab 18.1) ด้วย checklist หัวข้อ 4 ให้ comment ≥ 5 ข้อแบบสร้างสรรค์

## 🧪 Lab 20.4 — Executive update (30 นาที)
สมมติพรุ่งนี้ release: Bug Mode ON = production candidate → เขียน email 150 คำถึง CTO ว่าควรปล่อยหรือไม่

---

## ✅ Check Your Understanding
1. ทำไม "จำนวน test case" เป็น metric ที่อันตราย?
2. Risk สูงแต่ automation ยาก ควรทำอย่างไร?
3. Mutation testing วัดอะไร?
4. รายงานผู้บริหารควรมีอะไรบ้าง?

<details><summary>เฉลย</summary>

1. กระตุ้นให้สร้าง test ซ้ำซ้อน/คุณค่าต่ำ ไม่สะท้อนความสามารถในการจับบั๊ก
2. ทดสอบเชิงลึกแบบ manual/exploratory + ผลักดัน testability (hook, API) + automate ที่ชั้นล่างแทน
3. ความสามารถของ test suite ในการ "จับ" การเปลี่ยนแปลงโค้ดที่ผิด (คุณภาพของ test ไม่ใช่ของโค้ด)
4. สถานะรวม, ความเสี่ยงสำคัญ + ผลกระทบทางธุรกิจ, ข้อเสนอ/สิ่งที่ต้องการตัดสินใจ, แนวโน้ม
</details>

## 📋 Skills Checklist
- [ ] เขียน risk-based test strategy ได้
- [ ] เลือกและนำเสนอ metrics ที่มีความหมาย
- [ ] review test code อย่างเป็นระบบ
- [ ] สื่อสารสถานะคุณภาพกับผู้บริหารได้
