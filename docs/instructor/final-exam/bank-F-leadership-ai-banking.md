# Final Exam Bank — Area F: Leadership, AI & Banking Capstone (M20, M21, M22 + LoanLab · Ch 18, 20)

> ⚠️ Spoiler (instructor key; this repository is public) · format: see [README.md](README.md)
>
> ข้อ F-06..F-12 ใช้กฎของ **LoanLab** ซึ่งเป็นระบบสมมติเพื่อการเรียนเท่านั้น ([REQUIREMENTS-LOANLAB.md](../../../practice-app/REQUIREMENTS-LOANLAB.md)) ไม่ใช่กฎของธนาคารจริง · ใน stem ต้องบอกผู้สอบว่า "ตามกฎของ LoanLab" เสมอ และแจก requirement ให้เปิดดูได้ระหว่างสอบ

### F-01
`area: F` · `module: M20` · `chapter: 18` · `level: K2` · `type: single` · `answer: B`

ผู้จัดการตั้ง KPI ทีม QA ว่า "ต้องมี test case เพิ่ม 200 ข้อต่อไตรมาส" ข้อใดอธิบายปัญหาได้ดีที่สุด

- A) ไม่มีปัญหา จำนวน test ยิ่งมากคุณภาพยิ่งดี
- B) จำนวน test ไม่บอกว่าจับบั๊กได้หรือลดความเสี่ยงได้ และกระตุ้นให้เขียน test ซ้ำซ้อน · ควรดู defect leakage, risk coverage หรือ detection rate (เช่น Bug Mode)
- C) ควรเปลี่ยนเป็น "pass rate ต้อง 100%"
- D) ควรวัดจำนวนบรรทัดของ test code แทน

> **เหตุผล:** metric ที่วัดปริมาณถูกเล่นได้ง่าย · pass rate 100% อาจแปลว่า test ไม่จับอะไร · **อ้างอิง:** M20 §3

### F-02
`area: F` · `module: M20` · `chapter: 18` · `level: K1` · `type: single` · `answer: D`

ข้อใด **ไม่ใช่** หนึ่งใน 5 DORA metrics ปัจจุบัน

- A) Change lead time
- B) Deployment frequency
- C) Change failure rate
- D) Test coverage percentage

> **เหตุผล:** 5 ตัวคือ lead time, deployment frequency, failed deployment recovery time (throughput) และ change failure rate, deployment rework rate (instability) · **อ้างอิง:** M04 §5, M20 §3, REF-068

### F-03
`area: F` · `module: M20` · `chapter: 18` · `level: K3` · `type: single` · `answer: A`

ตาม risk-based testing ของหลักสูตร กฎ pricing/coupon/VAT ของ ShopLab (likelihood สูง, impact สูง) ควรทดสอบอย่างไร

- A) unit + API decision table ครอบคลุมทุกกฎ และ UI เพียง 1 flow
- B) UI E2E ทุกชุดค่าผสมของคูปองและการส่ง
- C) manual exploratory ต่อ release เท่านั้น
- D) ไม่ต้องทดสอบอัตโนมัติ เพราะกฎเปลี่ยนบ่อย

> **เหตุผล:** ความเสี่ยงสูง → ทดสอบลึกและอัตโนมัติ ที่ชั้นล่างซึ่งเร็วและเสถียร · UI E2E ทุกชุดช้าและเปราะ · **อ้างอิง:** M20 §1, M04 (test pyramid)

### F-04
`area: F` · `module: M21` · `chapter: 18` · `level: K2` · `type: single` · `answer: C`

AI healer เสนอแก้ test ที่ล้ม โดยเปลี่ยน `expect(total).toHaveText('฿1,016.50')` เป็น `'฿1,066.50'` ให้ตรงกับหน้าจอ ทีมควรทำอย่างไร

- A) รับการแก้ เพราะ healer อ่านค่าจริงจากหน้าจอ
- B) รับการแก้และเพิ่ม `retries: 2`
- C) ไม่รับจนกว่าคนจะตรวจว่าค่าใหม่ถูกตามกฎธุรกิจ — การล้มนี้อาจเป็นบั๊กจริง (เช่น VAT ผิด) ที่ healer กำลังซ่อน
- D) ลบ test นี้ เพราะเปราะ

> **เหตุผล:** อย่าให้ healer แก้ assertion ให้ผ่านโดยไม่มีคนตรวจ · oracle ต้องมาจาก requirement ไม่ใช่จากหน้าจอ · **อ้างอิง:** M21 §3, Lab 21.2

### F-05
`area: F` · `module: M21` · `chapter: 18` · `level: K1` · `type: single` · `answer: B`

Playwright test agents ประกอบด้วย agent ใดบ้าง

- A) recorder, runner, reporter
- B) planner, generator, healer
- C) crawler, fuzzer, judge
- D) tester, reviewer, approver

> **เหตุผล:** planner สร้างแผนจากการสำรวจ · generator สร้าง test · healer เสนอแก้ test ที่พัง · **อ้างอิง:** M21 §3, REF-072

### F-06
`area: F` · `module: M22` · `chapter: 20` · `level: K3` · `type: single` · `answer: C`

ตามกฎของ LoanLab: Loan `ACTIVE` มี outstanding 300.00 ลูกค้าชำระ 299.99 ผลคือข้อใด

- A) 200 — ชำระบางส่วนได้ outstanding เหลือ 0.01
- B) 400 `OVERPAYMENT`
- C) 400 `BELOW_MINIMUM` — ขั้นต่ำคือค่าที่น้อยกว่าระหว่าง 500.00 กับ outstanding = 300.00
- D) 409 `LOAN_CLOSED`

> **เหตุผล:** เมื่อ outstanding ต่ำกว่า 500 จำนวนเดียวที่รับคือยอดปิดหนี้พอดี · **อ้างอิง:** LL-PAY-06, Q1

### F-07
`area: F` · `module: M22` · `chapter: 20` · `level: K3` · `type: single` · `answer: A`

ตามกฎของ LoanLab: Loan มี outstanding 10,000.00 ชุดค่าใดเป็น **2-value BVA** ของ amount ที่ครบทั้งขอบล่าง (ขั้นต่ำ) และขอบบน (ห้ามเกิน outstanding)

- A) 499.99, 500.00, 10,000.00, 10,000.01
- B) 0, 500, 10,000
- C) 499.99, 500.00, 500.01, 9,999.99, 10,000.00
- D) 1.00, 5,000.00, 10,000.00

> **เหตุผล:** 2-value = ค่าที่ขอบ + ค่าถัดไปนอกขอบ โดยใช้ความละเอียดของเงิน 0.01 · ข้อ C เป็นแบบ 3-value ที่ไม่ครบ (ขาด 10,000.01) · **อ้างอิง:** M02 §3, LL-PAY-05, LL-PAY-06

### F-08
`area: F` · `module: M22` · `chapter: 20` · `level: K3` · `type: single` · `answer: D`

ตามกฎของ LoanLab: รายการชำระ 1,000.00 ถูก reverse 400.00 สำเร็จ (reference `RV-A1`) แล้ว officer ส่ง reverse อีก 700.00 ด้วย reference `RV-A2` ในวันทำการเดียวกัน ผลคือข้อใด

- A) 200 — รายการเดิมเป็น `REVERSED`
- B) 409 `DUPLICATE_REVERSAL`
- C) 409 `ALREADY_REVERSED`
- D) 400 `EXCEEDS_REVERSIBLE_AMOUNT` — reverse ได้อีกไม่เกิน 600.00 และรายการเดิมยังเป็น `PARTIALLY_REVERSED`

> **เหตุผล:** reference ไม่ซ้ำ จึงไม่ใช่ duplicate · ยังไม่ reverse ครบจึงไม่ใช่ already reversed · ยอดเกิน 1,000 − 400 · **อ้างอิง:** LL-REV-04, LL-REV-07, LL-REV-09, LL-REV-10

### F-09
`area: F` · `module: M22` · `chapter: 20` · `level: K3` · `type: single` · `answer: B`

ตามกฎของ LoanLab: Account เป็น `FROZEN` · Loan เป็น `CLOSED` · ลูกค้าชำระ amount มากกว่า outstanding (amount เป็นตัวเลขถูกรูปแบบ) ระบบควรตอบ error ใด

- A) 400 `OVERPAYMENT`
- B) 409 `ACCOUNT_NOT_ACTIVE`
- C) 409 `LOAN_CLOSED`
- D) 400 `VALIDATION_ERROR`

> **เหตุผล:** ลำดับการตรวจ (ข้อแรกที่ผิดคือ error ที่ตอบ): validation → 404 → account ACTIVE → loan ACTIVE → overpayment → minimum · test ที่มีหลายเงื่อนไขผิดพร้อมกันคือวิธีตรวจลำดับนี้ · **อ้างอิง:** LL-PAY-11, decision table R1

### F-10
`area: F` · `module: M22` · `chapter: 20` · `level: K2` · `type: single` · `answer: C`

ตามกฎของ LoanLab: วันศุกร์มีรายการชำระ 2 รายการ — P1 ไม่ถูก reverse · P2 ถูก reverse ครบ · หลัง EOD ของวันศุกร์ ข้อใดถูกต้อง

- A) ทั้งสองรายการได้ `settlementDate` เป็นวันเสาร์
- B) P1 ได้ `settlementDate` เป็นวันเสาร์ · P2 เป็นวันจันทร์
- C) P1 ได้ `settlementDate` เป็นวันจันทร์ · P2 มี `settlementDate` เป็น null
- D) ทั้งสองรายการได้ `settlementDate` เป็นวันจันทร์

> **เหตุผล:** T+1 คือวันทำการถัดไป (ศุกร์ → จันทร์) · รายการที่ยอดสุทธิเป็น 0 ไม่ถูก settle · **อ้างอิง:** LL-EOD-04, Q7

### F-11
`area: F` · `module: M22` · `chapter: 20` · `level: K4` · `type: single` · `answer: A`

ใน reference suite ของ LoanLab test EOD (เลื่อน business date) ถูกแยกไว้ใน project `loanlab-eod` ที่ `dependencies: ['loanlab']` เหตุผลของการออกแบบนี้คือข้อใด

- A) business date เป็นสถานะระดับระบบที่ทุก test ใช้ร่วม · ถ้า EOD รันขนานกับ test อื่น test ที่ชำระแล้วค่อย reverse อาจถูกตัดกลางคันจน reverse ไม่ได้ (window ปิด) จึงให้รันหลังสุดแบบต่อเนื่อง
- B) EOD test ช้า จึงแยกเพื่อให้ report อ่านง่าย
- C) EOD test ใช้ browser คนละตัว
- D) Playwright บังคับว่า test ที่เรียก test hook ต้องอยู่คนละ project

> **เหตุผล:** isolation ของสถานะร่วมระดับระบบ (เหมือน `__init__` ของ pabot ที่ reset DB) · `freshUser` แยกข้อมูลของผู้ใช้ได้ แต่แยก business date ไม่ได้ · **อ้างอิง:** REQUIREMENTS-LOANLAB.md §8 (ข้อควรระวังเรื่อง test isolation), `tests/playwright/playwright.config.ts`, LL-REV-05

### F-12
`area: F` · `module: M22` · `chapter: 20` · `level: K3` · `type: multi` · `answer: B,C`

ตามกฎของ LoanLab: รายการชำระ 1,000.00 test ใดออกแบบถูกต้องตามกฎ duplicate reversal **(เลือก 2 ข้อ)**

- A) reverse 300.00 สองครั้งด้วย reference ต่างกัน → ครั้งที่สองต้องได้ `DUPLICATE_REVERSAL` เพราะยอดเท่ากัน
- B) reverse 300.00 ด้วย `RV-X1` สำเร็จ แล้วส่งซ้ำด้วย `RV-X1` → 409 `DUPLICATE_REVERSAL` และ outstanding กับรายการ transaction ไม่เปลี่ยน
- C) reverse 300.00 สองครั้งด้วย reference ต่างกัน → สำเร็จทั้งคู่ รายการเดิมเป็น `PARTIALLY_REVERSED` (reverse แล้ว 600.00)
- D) reverse ครบ 1,000.00 แล้วส่งใหม่ด้วย reference ใหม่ → 200

> **เหตุผล:** LoanLab ใช้ `reference` ของคำขอเป็นตัวระบุ duplicate เพราะการ reverse ยอดเท่ากันสองครั้งอาจตั้งใจทั้งคู่ · ข้อ D ต้องได้ 409 `ALREADY_REVERSED` · **อ้างอิง:** LL-REV-07, LL-REV-09, Q5+
