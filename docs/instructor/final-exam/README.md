# Final Exam — Question Bank (instructor)

> ⚠️ **Spoiler** — ไฟล์ในโฟลเดอร์นี้มีเฉลย · repository นี้เป็น public จึงเป็นระบบเกียรติยศ ([assessments/README.md](../../assessments/README.md) ข้อ 1) · ผู้สอนควรเปลี่ยน/เพิ่มข้อของตัวเองก่อนใช้สอบจริง

ข้อสอบทฤษฎีปลายหลักสูตรตาม [M22 §3](../../modules/M22-capstone-and-career.md): **60 ข้อ · 90 นาที · ผ่านเมื่อได้ ≥ 45 คะแนน (75%)** · เป็นเงื่อนไขจบหลักสูตรคู่กับ Capstone (M22 Skills checklist)

| ไฟล์ | Area | โมดูล (บทใน Master Curriculum v2.0 draft) | ในคลัง | ต่อชุดสอบ |
|---|---|---|---|---|
| [bank-A-foundations.md](bank-A-foundations.md) | A — Testing foundations | M01–M04 (Ch 1–2, 4) | 21 | 14 |
| [bank-B-automation-foundations.md](bank-B-automation-foundations.md) | B — Automation foundations | M05–M08 (Ch 3–4, 6) | 15 | 10 |
| [bank-C-playwright-architecture.md](bank-C-playwright-architecture.md) | C — Playwright & architecture | M09, M10, M13, M15 (Ch 5–9) | 15 | 10 |
| [bank-D-robot-framework.md](bank-D-robot-framework.md) | D — Robot Framework | M11, M12, M17 (Ch 10–12) | 12 | 8 |
| [bank-E-engineering-ops.md](bank-E-engineering-ops.md) | E — Test engineering & ops | M14, M16–M19 (Ch 13–17) | 15 | 10 |
| [bank-F-leadership-ai-banking.md](bank-F-leadership-ai-banking.md) | F — Leadership, AI & banking capstone | M20–M22 + LoanLab (Ch 18, 20) | 12 | 8 |
| **รวม** | | | **90** | **60** |

## Blueprint

- **คลัง = 1.5 เท่าของชุดสอบในทุก area** เพื่อให้สุ่มได้หลายชุด (สอบซ่อมใช้ seed อื่น)
- **ระดับความรู้แบบ ISTQB K-level** (เป้าหมายของคลัง): K1 จำ 5–15% · K2 เข้าใจ 30–45% · K3 ประยุกต์ 35–50% · K4 วิเคราะห์ 8–15% — เน้น K3 เพราะเป็นหลักสูตรสายปฏิบัติ · ปัจจุบัน K1 6 · K2 38 · K3 37 · K4 9
- **ชนิดข้อ:** `single` (คำตอบเดียว) และ `multi` (**เลือก 2 ข้อ** ได้คะแนนเมื่อตอบถูกครบทั้งสองเท่านั้น) ไม่เกิน 10% ของคลัง
- **ข้อแบบ scenario ของ M22** (สาเหตุที่ test ล้มเฉพาะใน CI, ออกแบบ BVA, review โค้ดหา smell) ถูกแปลงเป็นข้อเลือกตอบ เช่น D-12, F-07, C-12 · ถ้าต้องการส่วนเขียนตอบ ให้ใช้โจทย์ใน Skills Assessment แทน

## ขอบเขตที่ยกเว้น (ชั่วคราว)

ไม่มีข้อสอบในหัวข้อที่รอการแก้ **AC-01..AC-14** ใน [audit report §3](../../audit/2026-11-10-content-audit-report.md) (test levels/types, STLC, coverage ของ state transition, ลำดับตัวแปร RF, การแปลง type ของ argument, listener `longname`, cache browser ใน CI, จำนวน worker ใน CI, เวอร์ชัน Python, นิยาม flaky rate, storageState, ชั่วโมงเรียน) และไม่มีข้อจาก **Ch 19 Testing AI-based Applications** ที่ยังไม่มีแล็บ — เพื่อไม่ให้ข้อสอบขัดกับเนื้อหาโมดูลที่ผู้เรียนอ่าน · `exam_bank.py check` เตือนถ้าข้อใดแตะหัวข้อเหล่านี้ · เมื่อแก้ AC แล้วค่อยเพิ่มข้อในหัวข้อนั้น

## LoanLab

ข้อ F-06..F-12 ใช้กฎของ LoanLab ซึ่ง **เป็นระบบสมมติเพื่อการเรียนเท่านั้น** ไม่ใช่กฎของธนาคารจริง · stem ต้องเขียนว่า "ตามกฎของ LoanLab" (script ตรวจให้) · แจก [REQUIREMENTS-LOANLAB.md](../../../practice-app/REQUIREMENTS-LOANLAB.md) ให้เปิดดูระหว่างสอบได้ เพราะข้อสอบวัดการประยุกต์กฎ ไม่ใช่การท่องกฎ

## รูปแบบของแต่ละข้อ

````markdown
### C-04
`area: C` · `module: M09` · `chapter: 6` · `level: K3` · `type: single` · `answer: C`

<stem — ข้อความ/โค้ดของโจทย์ · ข้อ multi ต้องมี "(เลือก 2 ข้อ)">

- A) …
- B) …
- C) …
- D) …

> **เหตุผล:** <ทำไมข้อที่ถูกจึงถูก และตัวลวงผิดตรงไหน> · **อ้างอิง:** M09 §3, REF-020
````

กติกาที่ script ตรวจ: ID ไม่ซ้ำ · metadata ครบ 6 คีย์ · ตัวเลือก A–D ครบและข้อความไม่ซ้ำ · จำนวนคำตอบตรงกับชนิด · มีเหตุผลและ `**อ้างอิง:**` · REF-xxx ต้องมีใน [references.md](<../../../2. reference folder/references.md>) · module ต้องมีอยู่จริง · **ถ้าอ้างถึงตัวเลือกอื่นในเหตุผลหรือในตัวเลือก ต้องเขียนว่า "ข้อ X" หรือ "แบบ X"** เพื่อให้การสลับตัวเลือกแก้ตัวอักษรตามได้ (ชื่อ "user A/B" ไม่นับ)

## การสร้างชุดสอบ

```bash
python "4. script folder/exam_bank.py" check          # ต้องได้ 0 errors
python "4. script folder/exam_bank.py" stats          # การกระจายตาม area / level / type / ตัวอักษรคำตอบ
python "4. script folder/exam_bank.py" build --seed 2027   # → exam-forms/form-2027.md + form-2027-key.md
```

- สุ่มข้อตามโควตาของแต่ละ area ด้วย seed (seed เดิม = ชุดเดิมทุกครั้ง) · เรียงตาม area A→F · **สลับตัวเลือก** ทุกข้อและแก้ตัวอักษรในเฉลย/เหตุผลให้ตรง (`--no-shuffle` เพื่อปิด)
- `exam-forms/` ถูก git-ignore — **อย่า commit ชุดสอบหรือเฉลยที่สร้างแล้ว** ลง repository สาธารณะ
- ให้คะแนน: ข้อละ 1 คะแนน · ข้อ multi ต้องถูกครบ · ผ่าน ≥ 45/60 · สอบซ่อมใช้ seed ใหม่ (ข้อซ้ำกับชุดแรกได้บางส่วนเพราะคลังมี 1.5 เท่า)

## การตรวจคำตอบที่ทำแล้ว (2026-11-28)

- ข้อที่มีตัวเลขของ ShopLab (A-12 ยอด VAT/ส่ง, A-15 pairwise) คำนวณจาก `practice-app/src/pricing.js` และตารางในโมดูล
- ข้อ LoanLab F-06..F-10 และ F-12 รันจริงกับ API ของ LoanLab บนเครื่อง (test hooks) — ผลตรงกับเฉลยทุกข้อ: `BELOW_MINIMUM`, `OVERPAYMENT`, `EXCEEDS_REVERSIBLE_AMOUNT` + `PARTIALLY_REVERSED`, `ACCOUNT_NOT_ACTIVE` เมื่อผิดหลายเงื่อนไข, settlement ศุกร์ → จันทร์ และรายการที่ reverse ครบได้ `settlementDate` = null, `DUPLICATE_REVERSAL` / `ALREADY_REVERSED`
- C-04: หน้า `/lab` มีปุ่ม "Start" และ "Start progress" จริง
- สร้างชุดสอบ seed 1–50 แล้วตรวจว่าเฉลยหลังสลับตัวเลือกชี้ไปที่ข้อความคำตอบเดิมทุกข้อ (0 mismatch)
- **ยังไม่ได้ทำ:** ทดลองกับผู้เรียนจริง (ความยาก/ค่าอำนาจจำแนก), ให้ผู้ตรวจภาษาไทยอ่าน
