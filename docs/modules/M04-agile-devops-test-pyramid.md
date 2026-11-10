# M04 — Agile, DevOps & the Test Pyramid

> **Level 1 · Foundations** · ⏱ 4 ชม. · Prerequisite: M01–M03

## 🎯 Learning Objectives
1. อธิบายบทบาท tester ใน Scrum/Kanban และกิจกรรม **3 Amigos**
2. เขียน **acceptance criteria** แบบ Given/When/Then (BDD)
3. อธิบาย **Test Pyramid / Testing Trophy** และวาง test ให้ถูกชั้น
4. อธิบาย **Shift-left / Shift-right** และ **Continuous Testing** ใน DevOps
5. ใช้ **Agile Testing Quadrants** วางแผนประเภทการทดสอบ

---

## 📖 1. Tester ใน Agile
- ทีมรับผิดชอบคุณภาพ **ร่วมกัน** — tester คือ "quality coach" ไม่ใช่ "ด่านสุดท้าย"
- งานทดสอบเกิด **ใน sprint เดียวกับการพัฒนา** (ไม่มี "testing sprint")
- **Definition of Done (DoD)** ควรมี: acceptance criteria ผ่าน, automated tests เขียนแล้วและผ่านใน CI, ไม่มีบั๊ก High ค้าง

### 3 Amigos (Business + Dev + Test)
คุย user story ก่อนเริ่มพัฒนา เพื่อหา **ตัวอย่างที่ชัดเจน** (Specification by Example)

**User story:** *As a customer I want to use a coupon so that I pay less*
คำถามที่ tester ควรถาม: คูปองใช้ซ้อนได้ไหม? ตัวพิมพ์เล็กได้ไหม? หมดอายุเวลาไหน (timezone)? ลดเกินยอดสินค้าได้ไหม? ส่วนลดคิดก่อนหรือหลัง VAT? ค่าส่งฟรีคิดจากยอดก่อนหรือหลังส่วนลด?

## 📖 2. BDD และ Gherkin
```gherkin
Feature: Coupons

  Scenario: Percentage coupon is capped
    Given a customer has a "27-inch 4K Monitor" (12,900 THB) in the cart
    When the customer applies coupon "SAVE10"
    Then the discount is 500.00 THB
    And the message "Coupon SAVE10 applied" is shown

  Scenario Outline: Free shipping threshold uses the discounted subtotal
    Given a cart with subtotal <subtotal> THB
    When the customer applies coupon "<coupon>"
    Then shipping is <shipping> THB
    Examples:
      | subtotal | coupon | shipping |
      | 1000     | none   | 0        |
      | 1000     | SAVE10 | 50       |
```
- BDD = **การสื่อสาร** ก่อน, เครื่องมือ (Cucumber, Behave, Robot Given/When/Then, playwright-bdd) ทีหลัง
- ดูตัวอย่าง Robot: `tests/robot/tests/ui/04_checkout_bdd.robot`
- ⚠️ อย่าเขียน Gherkin เป็น "click นี่ กรอกนั่น" (imperative) — เขียนเป็น **พฤติกรรมทางธุรกิจ** (declarative)

## 📖 3. Test Pyramid

```
            ▲  น้อย · ช้า · แพง · เปราะ
           ╱ ╲        UI / E2E  (5–10%)      tests/playwright/tests/ui
          ╱───╲
         ╱     ╲      Service / API / Integration (20–30%)   tests/*/api, db
        ╱───────╲
       ╱         ╲    Unit / Component (60–70%)   practice-app/test
      ╱───────────╲   มาก · เร็ว · ถูก · เสถียร
```

> สัดส่วน % ในภาพเป็นเพียงแนวทางคร่าวๆ ที่นิยมใช้ — ต้นแบบ (Mike Cohn, *Succeeding with Agile*, 2009) และ Martin Fowler ไม่ได้กำหนดตัวเลข บอกเพียงว่าควรมี test ชั้นล่าง "มากกว่ามาก" ชั้นบน

| ชั้น | ShopLab ตัวอย่าง | เวลา/test |
|---|---|---|
| Unit | `pricing.test.js` 12 tests | ~1 ms |
| API | `products.api.spec.ts` | ~10–50 ms |
| UI | `checkout.spec.ts` | ~1–3 s |

**Anti-pattern: Ice-cream cone** — มี UI test เยอะ, unit test น้อย → ช้า เปราะ ดูแลยาก
**Testing Trophy** (Kent C. Dodds) — เน้น integration มากกว่า สำหรับ frontend: static → unit → **integration** → e2e

> 💡 กฎง่ายๆ: **ทดสอบแต่ละ business rule ที่ชั้นต่ำสุดที่ทำได้** แล้วใช้ UI test เพื่อยืนยันว่า "ส่วนต่างๆ ต่อกันถูก" เท่านั้น

## 📖 4. Agile Testing Quadrants (Brian Marick / Crispin & Gregory)

| | Supporting the team | Critiquing the product |
|---|---|---|
| **Business-facing** | Q2: Functional tests, story tests, BDD, prototypes *(auto + manual)* | Q3: Exploratory, usability, UAT, A/B *(manual)* |
| **Technology-facing** | Q1: Unit, component tests *(automated)* | Q4: Performance, security, load, a11y *(tools)* |

## 📖 5. DevOps & Continuous Testing
```
 Plan → Code → Build → Test → Release → Deploy → Operate → Monitor
          ▲ lint, unit   ▲ API, UI, contract    ▲ smoke   ▲ synthetic monitoring, logs
     shift-left ◀──────────────────────────────────────▶ shift-right
```
- **Shift-left:** ทดสอบเร็วขึ้น — review requirement, unit test, API test ใน PR
- **Shift-right:** ทดสอบ/สังเกตใน production — feature flags, canary release, monitoring, synthetic tests
- **Quality gates:** PR merge ไม่ได้ถ้า test fail / coverage ลด / มี vulnerability ร้ายแรง
- **DORA metrics** (ปัจจุบันมี 5 ตัว 2 กลุ่ม): *Throughput* — change lead time, deployment frequency, failed deployment recovery time (ชื่อเดิม "time to restore service") · *Instability* — change failure rate, deployment rework rate (ตัวที่เพิ่มใหม่) — automation ช่วยได้ทุกตัว

---

## 🧪 Lab 04.1 — 3 Amigos role-play (45 นาที, กลุ่ม 3 คน)
สำหรับ user story "สั่งซื้อแบบเก็บเงินปลายทาง (COD)" — แบ่งบท PO/Dev/Tester หาคำถาม ≥ 8 ข้อ แล้วเขียน acceptance criteria แบบ Gherkin ≥ 4 scenarios (เทียบกับ REQ-ORD-04/05)

## 🧪 Lab 04.2 — จัดชั้น pyramid (30 นาที)
รายการต่อไปนี้ควรทดสอบชั้นไหน (unit/API/UI) — อธิบายเหตุผล:
(a) VAT ปัดเศษ 2 ตำแหน่ง (b) ปุ่ม Add to cart disabled เมื่อหมด (c) IDOR order ของคนอื่น (d) BVA อายุ 17/18/60/61 (e) user flow ซื้อของครบวงจร (f) export CSV มี BOM (g) tab ของ admin ใช้ลูกศรได้

## 🧪 Lab 04.3 — วิเคราะห์ reference framework (30 นาที)
นับจำนวน test แต่ละชั้นใน repo นี้ (`practice-app/test`, `tests/playwright/tests/api`, `tests/playwright/tests/ui`, `tests/robot`) — เป็น pyramid หรือไม่? เสนอการปรับ 3 ข้อ

---

## ✅ Check Your Understanding
1. ทำไม UI test ควรมีจำนวนน้อยที่สุดใน pyramid?
2. "Given I click the login button, When I type admin in field #username…" ผิดหลัก BDD อย่างไร?
3. Performance test อยู่ quadrant ไหน?
4. ยกตัวอย่าง shift-right testing 2 อย่าง
5. ใครรับผิดชอบคุณภาพในทีม Scrum?

<details><summary>เฉลย</summary>

1. ช้า, แพงในการดูแล, เปราะ (UI เปลี่ยนบ่อย), debug ยาก — ให้ feedback ช้า
2. เป็น imperative/UI-level — ควรเขียนเป็นพฤติกรรม เช่น "Given a registered customer, When they log in, Then they see their account"
3. Q4 (Technology-facing, critiquing the product)
4. Canary/feature-flag release + monitoring, synthetic monitoring (รัน smoke test กับ production เป็นระยะ), A/B testing, chaos engineering
5. ทั้งทีม (whole-team approach) — tester ช่วยนำและให้ความรู้
</details>

## 📋 Skills Checklist
- [ ] เขียน acceptance criteria แบบ Given/When/Then ที่เป็น declarative
- [ ] วาด test pyramid ของโปรเจกต์และระบุ anti-pattern ได้
- [ ] อธิบาย shift-left/right และ quality gate

## 🚀 Real-world Notes
- ถ้าทีมยังไม่มี unit test เลย **อย่าเริ่มด้วยการเขียน UI test 500 ตัว** — เริ่มจาก smoke UI 10–20 ตัว + API tests แล้วผลักดัน dev เรื่อง unit test
- เสนอให้ใส่ "automated tests merged" ใน DoD — เป็นการเปลี่ยนแปลงที่มีผลมากที่สุดต่อวัฒนธรรมคุณภาพ
