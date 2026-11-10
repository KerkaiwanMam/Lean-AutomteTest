# M01 — Software Testing Fundamentals

> **Level 1 · Foundations** · ⏱ 4 ชม. · Prerequisite: ไม่มี · ISTQB CTFL บทที่ 1

## 🎯 Learning Objectives
เมื่อจบโมดูลนี้ ผู้เรียนสามารถ:
1. อธิบายว่าทำไมต้องทดสอบ และแยก **error / defect / failure** ได้
2. อธิบาย **7 หลักการของการทดสอบ** และยกตัวอย่างจาก ShopLab ได้
3. แยก **QA, QC, Testing** และ **Verification vs Validation**
4. อธิบาย **ระดับ (levels)** และ **ประเภท (types)** ของการทดสอบ
5. อธิบาย **STLC** และตำแหน่งของ tester ใน SDLC

---

## 📖 1. ทำไมต้องทดสอบ

ซอฟต์แวร์ถูกสร้างโดยมนุษย์ มนุษย์ทำผิดพลาดได้เสมอ การทดสอบมีเป้าหมายเพื่อ:
- **ลดความเสี่ยง** ที่ระบบจะทำงานผิดเมื่อถึงมือผู้ใช้
- **ให้ข้อมูล** แก่ผู้ตัดสินใจ ("พร้อมขึ้น production หรือยัง?")
- **สร้างความมั่นใจ** ว่าระบบตรงตาม requirement และความต้องการจริงของผู้ใช้
- **ป้องกัน** ข้อผิดพลาด (เมื่อ tester เข้าร่วมตั้งแต่ช่วง requirement)

### Error → Defect → Failure

| คำ | ความหมาย | ตัวอย่างใน ShopLab |
|---|---|---|
| **Error (mistake)** | การกระทำผิดของคน | Dev เข้าใจผิดว่า "ส่งฟรีเมื่อยอด **เกิน** 1,000" |
| **Defect (bug, fault)** | ข้อบกพร่องในโค้ด/เอกสาร | เขียน `>` แทน `>=` ใน `pricing.js` |
| **Failure** | ระบบทำงานผิดที่สังเกตได้ | ลูกค้าซื้อ 1,000 ฿ พอดี แต่ถูกเก็บค่าส่ง 50 ฿ |

> Defect บางตัวไม่เคยเกิด failure (เช่น อยู่ใน code path ที่ไม่มีใครใช้) — และ failure บางอย่างไม่ได้เกิดจาก defect ในโค้ด (เช่น config ผิด, network ล่ม)

## 📖 2. 7 หลักการของการทดสอบ (Seven Testing Principles)

| # | หลักการ | ความหมาย | ตัวอย่าง ShopLab |
|---|---|---|---|
| 1 | Testing shows the presence, not the absence of defects | ทดสอบบอกได้ว่า "มีบั๊ก" แต่พิสูจน์ไม่ได้ว่า "ไม่มีบั๊ก" | test ผ่านหมด ≠ ไม่มีบั๊ก (ลองเปิด Bug Mode) |
| 2 | Exhaustive testing is impossible | ทดสอบทุก combination ไม่ได้ ต้องเลือกด้วยเทคนิคและความเสี่ยง | ฟอร์มสมัคร 11 ช่อง × ค่าที่เป็นไปได้ = อนันต์ → ใช้ EP/BVA |
| 3 | Early testing saves time and money | หาบั๊กยิ่งเร็ว ยิ่งแก้ง่ายและถูกกว่า (ISTQB ไม่ได้ให้ตัวเลข — ตัวเลข "แพงขึ้น 10–100 เท่า" ที่อ้างกันบ่อยมีหลักฐานอ่อน) | ทบทวน REQ-PRC-03 ว่า "≥" หรือ ">" ตั้งแต่ก่อนเขียนโค้ด |
| 4 | Defects cluster together | บั๊กมักกระจุกในบางโมดูล (Pareto 80/20) | pricing + cart มีกฎซับซ้อน → ทดสอบหนักกว่า |
| 5 | Tests wear out (pesticide paradox) | test ชุดเดิมซ้ำๆ จะหาบั๊กใหม่ไม่เจอ | ต้องเพิ่ม test ใหม่ / exploratory session |
| 6 | Testing is context dependent | ระบบต่างกัน วิธีทดสอบต่างกัน | ระบบธนาคาร vs เกมมือถือ |
| 7 | Absence-of-defects fallacy | ระบบไม่มีบั๊ก แต่ไม่ตอบโจทย์ผู้ใช้ ก็ไร้ค่า | checkout ไม่มีบั๊ก แต่ 6 ขั้นตอน ลูกค้าหนีหมด |

## 📖 3. QA vs QC vs Testing · Verification vs Validation

- **Quality Assurance (QA)** — มุ่ง *กระบวนการ* ป้องกันไม่ให้เกิดบั๊ก (code review, standard, training)
- **Quality Control (QC)** — มุ่ง *ผลิตภัณฑ์* ตรวจหาบั๊ก (testing เป็นส่วนหนึ่งของ QC)
- **Verification** — "Are we building the product **right**?" ตรงตาม spec ไหม
- **Validation** — "Are we building the **right** product?" ตรงความต้องการผู้ใช้ไหม

## 📖 4. Test Levels และ Test Types

**Test levels** (ทดสอบ "อะไร" ในระดับไหน)

| Level | ทดสอบอะไร | ใครทำ | ShopLab |
|---|---|---|---|
| Unit / Component | ฟังก์ชัน/คลาสเดียว | Developer | `practice-app/test/pricing.test.js` |
| Integration | การเชื่อมต่อระหว่างส่วน | Dev/Tester | API + database (`tests/robot/tests/db`) |
| System | ระบบทั้งระบบ end-to-end | Tester | `tests/playwright/tests/ui/checkout.spec.ts` |
| Acceptance (UAT) | ตรงความต้องการธุรกิจ | Business/User | BDD scenario `04_checkout_bdd.robot` |

**Test types** (ทดสอบ "คุณลักษณะ" ใด)
- **Functional** — ทำงานถูกต้องตาม requirement
- **Non-functional** — performance, security, usability, accessibility, compatibility
- **Structural (white-box)** — ครอบคลุมโค้ด (coverage)
- **Change-related** — **confirmation testing** (retest บั๊กที่แก้) และ **regression testing** (ส่วนอื่นยังไม่พัง) ← automation มีค่ามากที่สุดตรงนี้

**Static vs Dynamic testing**
- *Static*: ไม่รันโค้ด — review requirement, code review, lint
- *Dynamic*: รันโปรแกรมแล้วตรวจผล

## 📖 5. Software Testing Life Cycle (STLC)

```
Requirement   →  Test       →  Test Case   →  Environment  →  Test        →  Test
Analysis         Planning       Design          Setup           Execution       Closure
(อ่าน REQ,      (scope,        (เทคนิค M02,    (ShopLab,       (manual +       (report,
 ถามคำถาม)       ความเสี่ยง)     traceability)   test data)      automation)     lessons learned)
```

Tester ที่ดี **เริ่มทำงานตั้งแต่ requirement** ไม่ใช่รอจนโค้ดเสร็จ (shift-left)

## 📖 6. คุณสมบัติของ Tester / Automation Engineer ที่ดี
- **ความอยากรู้ (curiosity)** และคิดแบบ "ถ้า...จะเกิดอะไรขึ้น?"
- **สงสัยอย่างมีเหตุผล (professional skepticism)** — ไม่เชื่อจนกว่าจะเห็นหลักฐาน
- **สื่อสารเชิงบวก** — รายงานบั๊กที่ "ระบบ" ไม่ใช่ "คน"
- **ทักษะเทคนิค** — อ่านโค้ด, ใช้ DevTools, เขียน automation
- **เข้าใจธุรกิจ** — รู้ว่าอะไรสำคัญต่อผู้ใช้และบริษัท

---

## 🧪 Lab 01.1 — สำรวจ ShopLab (Exploratory tour, 45 นาที)
1. รัน ShopLab (`npm start --prefix practice-app`) เปิด http://localhost:3000
2. ใช้ "tour" 3 แบบ ใช้เวลาแบบละ 10 นาที:
   - **Money tour** — ทำตามเส้นทางที่สร้างรายได้: ค้นหา → ใส่ตะกร้า → ใช้คูปอง → ชำระเงิน
   - **Landmark tour** — เยี่ยมทุกหน้าในเมนู
   - **Bad-neighbourhood tour** — ลองค่าแปลกๆ: จำนวน 0, 11, -1, ข้อความยาวมาก, ภาษาไทย, emoji
3. จดลงตาราง: *ฟีเจอร์ที่พบ / คำถามที่สงสัย / สิ่งที่ดูผิดปกติ*

**เกณฑ์ผ่าน:** ระบุฟีเจอร์ ≥ 15 อย่าง และคำถามต่อ requirement ≥ 5 ข้อ

## 🧪 Lab 01.2 — หา defect ด้วยตา (Bug Mode, 30 นาที)
1. เปิด Bug Mode: `curl -X POST http://localhost:3000/api/test/config -H "Content-Type: application/json" -d "{\"bugMode\":true}"`
2. อ่าน [REQUIREMENTS.md](../../practice-app/REQUIREMENTS.md) หมวด REQ-CAT และ REQ-PRC
3. พยายามหา failure ให้ได้อย่างน้อย 3 อย่าง จดว่าเป็น failure ของ requirement ข้อไหน
4. ปิด Bug Mode (`{"bugMode": false}`)

> 💡 ถามตัวเอง: ถ้าบั๊กเหล่านี้ถูกแก้แล้ว อีก 3 เดือนมีคนแก้โค้ดจนบั๊กกลับมา — เราจะรู้ได้อย่างไร? (คำตอบ: regression automation → Level 3)

---

## ✅ Check Your Understanding
1. ลูกค้ารายงานว่า "ซื้อของ 1,000 บาทพอดีแต่โดนค่าส่ง" — นี่คือ error, defect หรือ failure?
2. ทีมรัน regression ชุดเดิม 200 cases มา 1 ปี ไม่เจอบั๊กใหม่เลย แต่ผู้ใช้ยังเจอบั๊ก — ขัดกับหลักการข้อใด?
3. "ระบบผ่านการทดสอบทั้งหมด ไม่มีบั๊ก แต่ยอดขายตก เพราะลูกค้าหาปุ่มชำระเงินไม่เจอ" — หลักการข้อใด?
4. การรัน test ทั้งหมดซ้ำหลังแก้บั๊ก 1 ตัว เรียกว่าอะไร?
5. Unit test ของ `pricing.js` อยู่ test level ไหน และใครควรเขียน?

<details><summary>เฉลย</summary>

1. **Failure** (สิ่งที่ผู้ใช้สังเกตเห็น) — defect คือ `>` ในโค้ด, error คือความเข้าใจผิดของ dev
2. **Pesticide paradox** (tests wear out) — ต้องปรับปรุง/เพิ่ม test และทำ exploratory
3. **Absence-of-defects fallacy**
4. **Regression testing** (ส่วนการทดสอบบั๊กที่แก้เองเรียก confirmation testing / retest)
5. **Unit/Component level** — โดยทั่วไป developer เขียน แต่ tester ช่วยออกแบบ case (เช่น boundary 999/1000/1001)
</details>

## 📋 Skills Checklist
- [ ] อธิบาย error/defect/failure พร้อมตัวอย่างของตัวเองได้
- [ ] ท่อง 7 principles และยกตัวอย่างได้ทุกข้อ
- [ ] แยก test level vs test type ได้
- [ ] รัน ShopLab, reset ข้อมูล, เปิด/ปิด Bug Mode ได้

## 🚀 Real-world Notes
- ในบริษัท "QA" มักใช้เรียกตำแหน่ง tester แม้งานจริงจะเป็น QC — อย่าติดกับคำ ให้ดูหน้าที่
- เมื่อเริ่มโปรเจกต์ใหม่ ให้ขอ **requirement + สิทธิ์เข้าระบบ test + ช่องทางคุยกับ dev/BA** ใน 3 วันแรก
- Tester ที่มีค่าที่สุดคือคนที่ "ถามคำถามที่ไม่มีใครถาม" ตั้งแต่ช่วง requirement
