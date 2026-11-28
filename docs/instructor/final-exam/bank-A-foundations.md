# Final Exam Bank — Area A: Testing Foundations (M01–M04 · Ch 1–2)

> ⚠️ Spoiler (instructor key; this repository is public) · format: see [README.md](README.md)

### A-01
`area: A` · `module: M01` · `chapter: 1` · `level: K1` · `type: single` · `answer: B`

Developer เขียนเงื่อนไขค่าส่งในโค้ดเป็น `>` แทน `>=` สิ่งที่อยู่ในโค้ดนี้คืออะไร

- A) Error
- B) Defect
- C) Failure
- D) Incident

> **เหตุผล:** สิ่งผิดที่อยู่ในโค้ดคือ defect (bug/fault) · error คือความเข้าใจผิดของคนที่ทำให้เกิด defect · failure คืออาการที่ผู้ใช้เห็นตอนรัน · **อ้างอิง:** M01 §1

### A-02
`area: A` · `module: M01` · `chapter: 1` · `level: K2` · `type: single` · `answer: C`

ทีมรัน regression ชุดเดิม 200 cases ทุก release มา 1 ปีโดยไม่เจอบั๊กใหม่ แต่ผู้ใช้ยังรายงานบั๊กในส่วนเดียวกันอยู่ สถานการณ์นี้ตรงกับหลักการทดสอบข้อใดมากที่สุด

- A) Defects cluster together
- B) Early testing saves time and money
- C) Tests wear out
- D) Testing is context dependent

> **เหตุผล:** test ชุดเดิมซ้ำๆ จะหาบั๊กใหม่ไม่เจอ (pesticide paradox) ต้องปรับ/เพิ่ม test และทำ exploratory · **อ้างอิง:** M01 §2, REF-001

### A-03
`area: A` · `module: M01` · `chapter: 1` · `level: K2` · `type: single` · `answer: D`

ระบบ checkout ผ่านการทดสอบทุกข้อและไม่มีบั๊กค้าง แต่ยอดขายตกเพราะลูกค้าต้องกรอก 6 หน้าก่อนจ่ายเงินได้ ข้อใดอธิบายสถานการณ์นี้ได้ดีที่สุด

- A) Exhaustive testing is impossible
- B) Testing shows the presence, not the absence of defects
- C) Defects cluster together
- D) Absence-of-defects fallacy

> **เหตุผล:** ระบบไม่มีบั๊กแต่ไม่ตอบโจทย์ผู้ใช้ก็ไม่มีคุณค่า — absence-of-defects fallacy · **อ้างอิง:** M01 §2, REF-001

### A-04
`area: A` · `module: M01` · `chapter: 1` · `level: K2` · `type: multi` · `answer: A,C`

ฟอร์มสมัครสมาชิกของ ShopLab มี 11 ช่องและค่าที่เป็นไปได้แทบไม่จำกัด เมื่อทดสอบทุกค่าไม่ได้ ข้อใดคือแนวทางที่ถูกต้อง **(เลือก 2 ข้อ)**

- A) ใช้เทคนิคออกแบบ test เช่น EP และ BVA เพื่อเลือกค่าตัวแทน
- B) สุ่มค่าจำนวนมากที่สุดเท่าที่เวลาเอื้อ แล้วถือว่าครอบคลุม
- C) ใช้ความเสี่ยงกำหนดว่าช่องใดควรทดสอบลึกกว่าช่องอื่น
- D) ทดสอบเฉพาะ happy path เพราะ negative case ไม่มีที่สิ้นสุด

> **เหตุผล:** exhaustive testing เป็นไปไม่ได้ จึงเลือก test ด้วยเทคนิคออกแบบและความเสี่ยง · การสุ่มอย่างเดียวหรือทิ้ง negative case ไม่ใช่การเลือกอย่างมีเหตุผล · **อ้างอิง:** M01 §2, M02 §1

### A-05
`area: A` · `module: M01` · `chapter: 1` · `level: K1` · `type: single` · `answer: A`

คำถาม "Are we building the **right** product?" หมายถึงกิจกรรมใด

- A) Validation
- B) Verification
- C) Quality Control
- D) Regression testing

> **เหตุผล:** validation ตรวจว่าตรงความต้องการจริงของผู้ใช้ · verification ตรวจว่าทำตาม spec ถูกต้อง ("building the product right") · **อ้างอิง:** M01 §3

### A-06
`area: A` · `module: M01` · `chapter: 1` · `level: K2` · `type: single` · `answer: B`

QA อ่าน REQ-PRC-03 ก่อนเริ่มเขียนโค้ดแล้วถามว่า "ส่งฟรีเมื่อยอด ≥ 1,000 หรือ > 1,000" การกระทำนี้เป็นการทดสอบแบบใด และให้ประโยชน์ตามหลักการข้อใด

- A) Dynamic testing — Defects cluster together
- B) Static testing — Early testing saves time and money
- C) Static testing — Tests wear out
- D) Dynamic testing — Testing is context dependent

> **เหตุผล:** review เอกสารโดยไม่รันโปรแกรมคือ static testing · หาความกำกวมตั้งแต่ requirement ทำให้แก้ได้ถูกกว่า (ISTQB ไม่ได้ให้ตัวเลขคูณ) · **อ้างอิง:** M01 §1–2, REF-001, REF-066

### A-07
`area: A` · `module: M02` · `chapter: 2` · `level: K3` · `type: single` · `answer: C`

REQ-REG-01: username ยาว 4–20 ตัว ใช้ได้เฉพาะ `A-Z a-z 0-9 _` ชุด test ใดใช้ Equivalence Partitioning กับ **invalid partition** ได้ถูกต้องที่สุด

- A) `ab-` (สั้นเกินและมีอักขระต้องห้ามใน case เดียว)
- B) `tester_01`, `tester_02`, `tester_03`
- C) `abc` (สั้นเกิน) และ `test-er` (อักขระต้องห้าม) แยกเป็นคนละ case
- D) `a` × 21 และ `a` × 22 และ `a` × 23

> **เหตุผล:** invalid partition ควรทดสอบทีละตัว ถ้ารวมหลายตัวใน case เดียวจะไม่รู้ว่า error มาจากอะไร (ข้อ A) · ข้อ B อยู่ partition valid เดียวกัน · ข้อ D อยู่ partition "ยาวเกิน" เดียวกัน · **อ้างอิง:** M02 §2

### A-08
`area: A` · `module: M02` · `chapter: 2` · `level: K3` · `type: single` · `answer: B`

จำนวนสินค้าในตะกร้ารับได้ 1–10 ชิ้น (จำนวนเต็ม) ค่าทดสอบตาม **2-value BVA** คือข้อใด

- A) 1, 10
- B) 0, 1, 10, 11
- C) 0, 1, 2, 9, 10, 11
- D) 1, 5, 10

> **เหตุผล:** 2-value BVA ใช้ค่าขอบกับค่าที่ใกล้ที่สุดฝั่งตรงข้ามของขอบ: 0|1 และ 10|11 · ข้อ C คือ 3-value · **อ้างอิง:** M02 §3, REF-095

### A-09
`area: A` · `module: M02` · `chapter: 2` · `level: K3` · `type: single` · `answer: D`

REQ-REG-07: อายุต้องอยู่ระหว่าง 18–60 ปี (รวมขอบ) ค่าทดสอบตาม **3-value BVA** คือข้อใด

- A) 17, 18, 60, 61
- B) 18, 19, 59, 60
- C) 17, 18, 19, 60
- D) 17, 18, 19, 59, 60, 61

> **เหตุผล:** 3-value BVA ใช้ค่าขอบและเพื่อนบ้านทั้งสองฝั่งของแต่ละขอบ · ข้อ A คือ 2-value · **อ้างอิง:** M02 §3, REF-095

### A-10
`area: A` · `module: M02` · `chapter: 2` · `level: K3` · `type: single` · `answer: B`

ShopLab ส่งฟรีเมื่อยอดหลังหักส่วนลด **≥ 1,000.00 บาท** และราคามีทศนิยม 2 ตำแหน่ง คู่ค่าใดคือ 2-value BVA ของเกณฑ์นี้

- A) 999 และ 1,001
- B) 999.99 และ 1,000.00
- C) 1,000.00 และ 1,000.01
- D) 0.00 และ 1,000.00

> **เหตุผล:** ขอบคือ 1,000.00 และเพื่อนบ้านที่ใกล้ที่สุดฝั่งไม่ผ่านเกณฑ์คือ 999.99 (หน่วยเล็กที่สุดคือ 0.01) · ข้อ C ทั้งสองค่าอยู่ฝั่งเดียวกัน · **อ้างอิง:** M02 §3, REQUIREMENTS REQ-PRC-03, REF-095

### A-11
`area: A` · `module: M02` · `chapter: 2` · `level: K2` · `type: single` · `answer: C`

กฎธุรกิจมีเงื่อนไขแบบ true/false 3 ข้อ decision table แบบเต็ม (ก่อนยุบ) มีกี่ rule

- A) 3
- B) 6
- C) 8
- D) 9

> **เหตุผล:** 2³ = 8 combination · หลังยุบ rule ที่เงื่อนไขบางข้อไม่มีผลจะเหลือน้อยกว่านี้ · **อ้างอิง:** M02 §4

### A-12
`area: A` · `module: M02` · `chapter: 2` · `level: K3` · `type: single` · `answer: A`

ตะกร้ามี USB-C Hub ราคา 1,000.00 บาท 1 ชิ้น ใช้คูปอง SAVE10 (ลด 10% สูงสุด 500) ส่งแบบ standard ตาม REQ-PRC ค่าส่งและ VAT ที่ถูกต้องคือข้อใด

- A) ค่าส่ง 50.00 · VAT 66.50
- B) ค่าส่ง 0.00 · VAT 63.00
- C) ค่าส่ง 50.00 · VAT 73.50
- D) ค่าส่ง 0.00 · VAT 70.00

> **เหตุผล:** ยอดหลังส่วนลด 900 < 1,000 จึงเสียค่าส่ง 50 · VAT 7% ของ (1,000 − 100 + 50) = 66.50 · ข้อ C คือผลของบั๊กที่คิด VAT ก่อนหักส่วนลด · **อ้างอิง:** REQUIREMENTS REQ-PRC-03/05, ค่าจาก `pricing.js`

### A-13
`area: A` · `module: M02` · `chapter: 2` · `level: K3` · `type: single` · `answer: C`

ตาม state machine ของ order ใน ShopLab (REQ-ORD-05) admin ส่งคำขอเปลี่ยนสถานะใดแล้ว **ต้อง** ได้ 409 INVALID_TRANSITION

- A) PENDING → PAID
- B) PAID → CANCELLED
- C) SHIPPED → CANCELLED
- D) SHIPPED → DELIVERED

> **เหตุผล:** จาก SHIPPED ไปได้ทางเดียวคือ DELIVERED · invalid transition ต้องถูกทดสอบด้วยว่าระบบปฏิเสธ · **อ้างอิง:** M02 §5, REQUIREMENTS REQ-ORD-05

### A-14
`area: A` · `module: M02` · `chapter: 2` · `level: K2` · `type: single` · `answer: B`

เหตุผลหลักที่ pairwise testing ได้ผลในทางปฏิบัติคือข้อใด

- A) ระบบส่วนใหญ่มีพารามิเตอร์ไม่เกิน 2 ตัว
- B) ข้อมูลงานวิจัยพบว่า failure ส่วนใหญ่เกิดจากปัจจัยเดียวหรือสองปัจจัยร่วมกัน
- C) pairwise ทดสอบครบทุก combination แต่ใช้เวลาน้อยกว่า
- D) ทุก failure เกิดจาก interaction ของสองปัจจัยพอดี

> **เหตุผล:** NIST (Kuhn et al.) พบว่า failure ส่วนใหญ่เกิดจาก 1–2 ปัจจัย ยิ่งหลายปัจจัยยิ่งพบน้อย · pairwise ไม่ได้ครบทุก combination · **อ้างอิง:** M02 §6, REF-060, REF-067

### A-15
`area: A` · `module: M02` · `chapter: 2` · `level: K3` · `type: single` · `answer: B`

พารามิเตอร์ทดสอบ: Browser 3 ค่า · Language 2 · Payment 2 · Shipping 2 · Coupon 4 ชุด pairwise ใดๆ ต้องมี **อย่างน้อย** กี่ case

- A) 8
- B) 12
- C) 24
- D) 96

> **เหตุผล:** ต้องครอบคลุมทุกคู่ของสองพารามิเตอร์ที่มีค่ามากที่สุด (Coupon 4 × Browser 3 = 12 คู่) จึงต่ำกว่า 12 ไม่ได้ · 96 คือ combination ทั้งหมด · คำนวณจริงได้ชุด 12–15 cases · **อ้างอิง:** M02 §6

### A-16
`area: A` · `module: M02` · `chapter: 2` · `level: K2` · `type: single` · `answer: D`

ข้อใดเป็น exploratory testing charter ที่เขียนถูกรูปแบบที่สุด

- A) ทดสอบคูปองให้ครบทุกแบบภายในวันนี้
- B) คลิกปุ่ม Apply แล้วตรวจว่าขึ้นข้อความ "Coupon SAVE10 applied"
- C) หาบั๊กให้ได้อย่างน้อย 5 ตัว
- D) Explore คูปอง with ค่าแปลกๆ และการเปิด 2 tab to discover การใช้คูปองซ้อนหรือผิดเงื่อนไข

> **เหตุผล:** charter ระบุ พื้นที่ (Explore) · ทรัพยากร/เทคนิค (with) · ข้อมูลที่ต้องการค้นพบ (to discover) · ข้อ B เป็น scripted test case · **อ้างอิง:** M02 §7, REF-044

### A-17
`area: A` · `module: M03` · `chapter: 2` · `level: K2` · `type: single` · `answer: A`

ชื่อบริษัทบนหน้าแรกของเว็บสะกดผิด ระบบยังทำงานได้ครบทุกฟังก์ชัน การจัดระดับที่เหมาะสมที่สุดคือข้อใด

- A) Severity ต่ำ · Priority สูง
- B) Severity สูง · Priority ต่ำ
- C) Severity สูง · Priority สูง
- D) Severity ต่ำ · Priority ต่ำ

> **เหตุผล:** ผลกระทบทางเทคนิคน้อย (severity ต่ำ) แต่กระทบภาพลักษณ์ธุรกิจจึงต้องรีบแก้ (priority สูง) · priority กำหนดร่วมกับ PO · **อ้างอิง:** M03 §4

### A-18
`area: A` · `module: M03` · `chapter: 2` · `level: K3` · `type: single` · `answer: C`

ข้อใดเป็นชื่อ bug report ที่ดีที่สุด

- A) ตะกร้าพัง
- B) Dev คำนวณค่าส่งผิดอีกแล้ว
- C) [Cart] Standard shipping charged when subtotal is exactly 1,000 THB
- D) บั๊กค่าส่ง ด่วนมาก!!!

> **เหตุผล:** ชื่อที่ดีระบุพื้นที่ สิ่งที่ผิด และเงื่อนไข ใช้ภาษาเป็นกลาง ไม่โทษคน · **อ้างอิง:** M03 §4, `templates/bug-report-template.md`

### A-19
`area: A` · `module: M03` · `chapter: 2` · `level: K2` · `type: single` · `answer: B`

PO เปลี่ยน REQ-PRC-03 เป็น "ส่งฟรีเมื่อยอด ≥ 1,500" Requirement Traceability Matrix ช่วยอะไรมากที่สุด

- A) บอกว่าควรให้ dev คนไหนแก้โค้ด
- B) ชี้ test case และ automated test ที่ผูกกับ REQ-PRC-03 ซึ่งต้องแก้ค่าคาดหวังและค่าขอบ
- C) บอก severity ของบั๊กที่จะเกิดขึ้น
- D) แทน test plan ได้ทั้งฉบับ

> **เหตุผล:** RTM โยง requirement ↔ test ทำให้รู้ทันทีว่า test ใดได้รับผลกระทบ (ขอบใหม่ 1,499.99/1,500.00) · **อ้างอิง:** M03 §3

### A-20
`area: A` · `module: M04` · `chapter: 1` · `level: K2` · `type: single` · `answer: A`

ตามหลัก test pyramid กฎ "VAT ปัดทศนิยม 2 ตำแหน่ง" ควรทดสอบอย่างละเอียดที่ชั้นใด

- A) Unit test ของฟังก์ชันคำนวณราคา
- B) UI test ทุกหน้าที่แสดงราคา
- C) Manual exploratory test เท่านั้น
- D) Performance test

> **เหตุผล:** ทดสอบกฎธุรกิจที่ชั้นต่ำที่สุดที่ทำได้ (เร็วและเสถียร) แล้วใช้ UI test ยืนยันว่าส่วนต่างๆ ต่อกันถูกเพียงไม่กี่ case · **อ้างอิง:** M04 §3, REF-063

### A-21
`area: A` · `module: M04` · `chapter: 1` · `level: K4` · `type: single` · `answer: D`

ข้อใดเป็น Gherkin scenario ที่ดีที่สุดสำหรับใช้สื่อสารกับฝ่ายธุรกิจ

- A) `Given I click "#login" When I type "customer" in "#username" Then I see ".nav-username"`
- B) `Given the database table orders is empty When POST /api/orders returns 201 Then SELECT COUNT(*) = 1`
- C) `Given I open the browser When I wait 3 seconds Then the page loads`
- D) `Given a customer has a 12,900 THB monitor in the cart When they apply coupon "SAVE10" Then the discount is 500.00 THB`

> **เหตุผล:** BDD ควรเขียนแบบ declarative ด้วยภาษาธุรกิจ ไม่ใช่ขั้นตอน UI/เทคนิค (imperative) · ข้อ D ยังแสดงเพดานส่วนลด 500 ซึ่งเป็นกฎที่ต้องการสื่อ · **อ้างอิง:** M04 §2
