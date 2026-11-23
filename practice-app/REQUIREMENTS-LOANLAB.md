# LoanLab — Software Requirements Specification (SRS)

> **LoanLab** คือโมดูลฝึก Retail Lending & Payment ที่อยู่ในแอปเดียวกับ ShopLab (หน้าเว็บ `/loanlab/`, API `/api/loanlab/*`)
> เอกสารนี้คือ requirement **ฉบับยืนยันแล้ว** ที่ใช้ออกแบบ test case, ทำ traceability matrix และเป็น oracle ของ reference tests
>
> ⚠️ **ระบบสมมติเพื่อการเรียนเท่านั้น** กฎทุกข้อเป็นข้อกำหนดของหลักสูตร ไม่ได้อ้างอิงกฎ ระเบียบ หรือระบบของธนาคารหรือสถาบันการเงินจริงแห่งใด
>
> ⚠️ **Spoiler สำหรับ Lab 2.6** — หมวด 9 ของไฟล์นี้มีคำตอบของ "คำถามเปิด" ใน Appendix A หมวด C ของ Master Curriculum ผู้เรียนควรทำ requirement review ของ Lab 2.6 ให้เสร็จก่อนอ่าน

**ที่มาของกฎ:** คอลัมน์ "ที่มา" บอกว่าข้อนั้นมาจาก Roadmap (`REQ-*` ใน Appendix A หมวด A), ข้อสมมติของหลักสูตร (`ASM-*` หมวด B), คำตอบที่ยืนยันแล้วของคำถามเปิด (`Q1`–`Q8` หมวด C และ `Q5+` ที่ตามมาจาก Q5) หรือเป็นรายละเอียดที่กำหนดตอนสร้างระบบ (`design`)

**ยืนยันโดย:** เจ้าของหลักสูตร วันที่ 2026-11-11 (Q1–Q8) และ 2026-11-16 (`Q5+` = กฎระบุ duplicate reversal ด้วย `reference` ซึ่งตามมาจาก Q5) · รายละเอียดระดับ `design` ข้ออื่นกำหนดโดยผู้สร้างระบบและรอการ review

## 0. คำศัพท์และข้อตกลงร่วม

| คำ | ความหมายใน LoanLab |
|---|---|
| Customer | ผู้ใช้ role `customer` (ใช้บัญชีผู้ใช้ชุดเดียวกับ ShopLab) |
| Officer | เจ้าหน้าที่ back office = ผู้ใช้ role `admin` |
| Account | บัญชีสินเชื่อของลูกค้า 1 คน มีได้หลายบัญชี · เลขบัญชี `LA-NNNNNN` |
| Loan | สัญญาสินเชื่อภายใต้ Account · เลขสัญญา `LN-NNNNNN` |
| Outstanding | ยอดหนี้คงเหลือของ Loan |
| Business date | วันทำการปัจจุบันของระบบ (ไม่ใช่นาฬิกาเครื่อง) รูปแบบ `YYYY-MM-DD` |
| EOD | End-of-day — การประมวลผลสิ้นวันทำการ |

- จำนวนเงินทุกค่าเป็นบาท มีทศนิยมได้ไม่เกิน 2 ตำแหน่ง (ASM-04) · API รับและส่งเป็น JSON number · ฐานข้อมูลเก็บเป็นสตางค์ (จำนวนเต็ม) ในคอลัมน์ `*_satang`
- รูปแบบ error เหมือน ShopLab: `{ "error": { "code", "message", "details?" } }`
- **ไม่อยู่ในขอบเขตของ version นี้:** ดอกเบี้ย ค่าธรรมเนียม ค่าปรับ ตารางผ่อนชำระ วันครบกำหนด และปฏิทินวันหยุด

## 1. Account — LL-ACC

| ID | Requirement | ที่มา |
|---|---|---|
| LL-ACC-01 | Officer เท่านั้นที่สร้าง Account ให้ลูกค้าได้ (`POST /api/loanlab/accounts`) · customer ได้ 403 | REQ-ACC-01, Q6 |
| LL-ACC-02 | Validation ตอนสร้าง: `username` ต้องเป็นผู้ใช้ role `customer` ที่มีอยู่ (ไม่พบ = 404 `CUSTOMER_NOT_FOUND`) · `holderName` ยาว 2–100 ตัวอักษรหลังตัดช่องว่างหัวท้าย (ผิด = 400 `VALIDATION_ERROR`) | REQ-ACC-01, design |
| LL-ACC-03 | Account ใหม่ได้เลขบัญชี `LA-NNNNNN` ไม่ซ้ำ และมีสถานะ `PENDING` | Q3, design |
| LL-ACC-04 | สถานะมี 4 ค่า: `PENDING`, `ACTIVE`, `FROZEN`, `CLOSED` · transition ที่อนุญาต: `PENDING→ACTIVE`, `ACTIVE→FROZEN`, `FROZEN→ACTIVE`, `ACTIVE→CLOSED`, `FROZEN→CLOSED` · อย่างอื่นทั้งหมดตอบ 409 `INVALID_TRANSITION` (`CLOSED` เป็นสถานะสุดท้าย) | Q3 |
| LL-ACC-05 | ปิด Account (`→CLOSED`) ได้เมื่อไม่มี Loan ใดมี outstanding มากกว่า 0 · ถ้ายังมี ตอบ 409 `ACCOUNT_HAS_BALANCE` | Q3 |
| LL-ACC-06 | เปลี่ยนสถานะได้เฉพาะ Officer (`PATCH /api/loanlab/accounts/{id}/status`) | Q6, design |

### รายการที่แต่ละสถานะอนุญาต (LL-ACC-07, ที่มา Q3)

| สถานะ Account | เปิด Loan ใหม่ | ชำระเงิน | Reverse | ดูข้อมูลและประวัติ |
|---|---|---|---|---|
| `PENDING` | ไม่ได้ | ไม่ได้ | ไม่ได้ | ได้ |
| `ACTIVE` | ได้ | ได้ | ได้ | ได้ |
| `FROZEN` | ไม่ได้ | ไม่ได้ | ได้ | ได้ |
| `CLOSED` | ไม่ได้ | ไม่ได้ | ไม่ได้ | ได้ |

## 2. Loan — LL-LOAN

| ID | Requirement | ที่มา |
|---|---|---|
| LL-LOAN-01 | Officer เปิด Loan ภายใต้ Account ที่ `ACTIVE` (`POST /api/loanlab/loans`) · Account สถานะอื่นตอบ 409 `ACCOUNT_NOT_ACTIVE` | REQ-ACC-01, Q3 |
| LL-LOAN-02 | `principal` ต้องอยู่ระหว่าง 1,000.00 ถึง 1,000,000.00 บาท (รวมขอบ) ทศนิยมไม่เกิน 2 ตำแหน่ง | design, ASM-04 |
| LL-LOAN-03 | Loan ใหม่ได้เลข `LN-NNNNNN` · outstanding เริ่มต้นเท่ากับ principal · สถานะ `ACTIVE` | design |
| LL-LOAN-04 | สถานะ Loan มี 2 ค่า: `ACTIVE` และ `CLOSED` · outstanding ต้องไม่ติดลบ | Q2, Q3 |
| LL-LOAN-05 | เมื่อ outstanding เป็น 0.00 จากการชำระ Loan เปลี่ยนเป็น `CLOSED` **ในรายการเดียวกัน** และไม่รับชำระอีก | Q2 |
| LL-LOAN-06 | `CLOSED→ACTIVE` เกิดได้ทางเดียว คือ reverse รายการชำระของ Loan นั้นสำเร็จ (ดู LL-REV-07) | Q2 |

## 3. Payment — LL-PAY

`POST /api/loanlab/loans/{id}/payments` body `{ "amount": number }` → 201 `{ transaction, loan }`

| ID | Requirement | ที่มา |
|---|---|---|
| LL-PAY-01 | ผู้ชำระได้คือลูกค้าเจ้าของ Loan หรือ Officer (ชำระแทน) · Loan ของคนอื่นตอบ 404 | REQ-SEC-01, design |
| LL-PAY-02 | `amount` ต้องเป็นตัวเลขมากกว่า 0 และมีทศนิยมไม่เกิน 2 ตำแหน่ง · ผิด = 400 `VALIDATION_ERROR` | ASM-04 |
| LL-PAY-03 | ชำระได้เมื่อ Account เป็น `ACTIVE` เท่านั้น · สถานะอื่น = 409 `ACCOUNT_NOT_ACTIVE` | REQ-PAY-03 |
| LL-PAY-04 | ชำระได้เมื่อ Loan เป็น `ACTIVE` · `CLOSED` = 409 `LOAN_CLOSED` | Q2 |
| LL-PAY-05 | ห้ามชำระเกิน outstanding · เกิน = 400 `OVERPAYMENT` | REQ-PAY-02 |
| LL-PAY-06 | ยอดชำระขั้นต่ำ = **ค่าที่น้อยกว่าระหว่าง 500.00 กับ outstanding** · ต่ำกว่า = 400 `BELOW_MINIMUM` · ผลคือเมื่อ outstanding ต่ำกว่า 500 จำนวนเดียวที่รับคือยอดปิดหนี้พอดี | REQ-PAY-01, Q1 |
| LL-PAY-07 | Partial payment: outstanding ลดลงเท่ากับ amount และ Loan ยังเป็น `ACTIVE` · ยอดคงเหลือหลังชำระต่ำกว่า 500 ได้ | REQ-PAY-04, Q1 |
| LL-PAY-08 | Full payment (amount = outstanding): outstanding เป็น 0.00 และ Loan เป็น `CLOSED` | REQ-PAY-04, Q2 |
| LL-PAY-09 | ทุกการชำระที่สำเร็จบันทึกเป็น transaction: `type=PAYMENT`, `status=POSTED`, `businessDate` = business date ขณะทำรายการ, `balanceAfter`, เลขอ้างอิง `PM-YYYYMMDD-NNNNNN` | ASM-01, REQ-RPT-01, Q7 |
| LL-PAY-10 | การชำระที่ถูกปฏิเสธต้องไม่เปลี่ยน outstanding และไม่สร้าง transaction | design |
| LL-PAY-11 | ลำดับการตรวจ (ข้อแรกที่ผิดคือ error ที่ตอบ): LL-PAY-02 → ไม่พบ Loan (404) → LL-PAY-03 → LL-PAY-04 → LL-PAY-05 → LL-PAY-06 | design |

### Decision table (สำหรับ Lab 2.6 และ reference test `payment.api.spec.ts`)

| Rule | Account | Loan | amount เทียบ outstanding | amount เทียบ min(500, outstanding) | ผลลัพธ์ |
|---|---|---|---|---|---|
| R1 | ไม่ใช่ `ACTIVE` | – | – | – | 409 `ACCOUNT_NOT_ACTIVE` |
| R2 | `ACTIVE` | `CLOSED` | – | – | 409 `LOAN_CLOSED` |
| R3 | `ACTIVE` | `ACTIVE` | มากกว่า | – | 400 `OVERPAYMENT` |
| R4 | `ACTIVE` | `ACTIVE` | ไม่เกิน | ต่ำกว่า | 400 `BELOW_MINIMUM` |
| R5 | `ACTIVE` | `ACTIVE` | น้อยกว่า | ไม่ต่ำกว่า | 201 partial — Loan `ACTIVE` |
| R6 | `ACTIVE` | `ACTIVE` | เท่ากับ | ไม่ต่ำกว่า | 201 full — Loan `CLOSED` |

ค่าขอบที่ควรทดสอบ: outstanding 10,000 → 499.99 / 500.00 / 500.01 / 9,999.99 / 10,000.00 / 10,000.01 · outstanding 300 → 299.99 / 300.00 / 300.01 · outstanding 500 → 499.99 / 500.00

## 4. Reversal — LL-REV

`POST /api/loanlab/reversals` body `{ "originalTransactionId": integer, "reference": string, "reason": string, "amount"?: number }` → 201 `{ reversal, original, loan }`

| ID | Requirement | ที่มา |
|---|---|---|
| LL-REV-01 | Officer เท่านั้นที่ reverse ได้ ไม่ต้องมีผู้อนุมัติคนที่สอง · customer = 403 `FORBIDDEN` | Q6 |
| LL-REV-02 | ต้องอ้างอิงรายการเดิม: `originalTransactionId` เป็น required (ไม่มี = 400 `VALIDATION_ERROR`) · ไม่พบรายการ = 404 `TRANSACTION_NOT_FOUND` · รายการที่อ้างต้องเป็น `PAYMENT` — reverse รายการ `REVERSAL` ไม่ได้ (409 `NOT_REVERSIBLE`) | REQ-REV-01 |
| LL-REV-03 | `reason` เป็น required ยาว 5–200 ตัวอักษร · `reference` (เลขอ้างอิงคำขอ reverse) เป็น required ยาว 4–40 ตัว ใช้ได้เฉพาะ `A-Z a-z 0-9 - _` | Q6, Q5+ |
| LL-REV-04 | **Partial reversal ทำได้** · `amount` เป็น optional: ไม่ส่ง = reverse ยอดที่ยัง reverse ได้ทั้งหมด · ถ้าส่งต้องมากกว่า 0 ทศนิยมไม่เกิน 2 ตำแหน่ง และไม่เกิน (amount ของรายการเดิม − ยอดที่ reverse ไปแล้ว) · เกิน = 400 `EXCEEDS_REVERSIBLE_AMOUNT` | Q5 |
| LL-REV-05 | Reverse ได้เฉพาะวันทำการเดียวกับรายการเดิม (ก่อน EOD ของวันนั้น) · หลังจากนั้น = 409 `REVERSAL_WINDOW_CLOSED` | Q4 |
| LL-REV-06 | Account ต้องเป็น `ACTIVE` หรือ `FROZEN` · สถานะอื่น = 409 `ACCOUNT_NOT_ELIGIBLE` | Q3 |
| LL-REV-07 | ผลของ reversal ที่สำเร็จ: outstanding เพิ่มเท่ากับจำนวนที่ reverse · `reversedAmount` ของรายการเดิมเพิ่มเท่ากัน · สถานะรายการเดิมเป็น `PARTIALLY_REVERSED` เมื่อ reverse ยังไม่ครบ และ `REVERSED` เมื่อครบ · ถ้า Loan เป็น `CLOSED` ให้กลับเป็น `ACTIVE` | ASM-02 (แก้ตาม Q5), Q2 |
| LL-REV-08 | Reversal ที่สำเร็จบันทึกเป็น transaction ใหม่: `type=REVERSAL`, `status=POSTED`, `originalTransactionId`, `reference`, `reason`, `balanceAfter`, เลขอ้างอิง `RV-YYYYMMDD-NNNNNN` | REQ-REV-01, REQ-RPT-01 |
| LL-REV-09 | Duplicate reversal ถูกปฏิเสธ: `reference` ที่เคยใช้แล้ว = 409 `DUPLICATE_REVERSAL` · รายการเดิมที่เป็น `REVERSED` แล้ว = 409 `ALREADY_REVERSED` · ทั้งสองกรณี outstanding และ transaction ต้องไม่เปลี่ยน | REQ-REV-02, ASM-03, Q5+ |
| LL-REV-10 | ลำดับการตรวจ: สิทธิ์ (401/403) → validation (400) → 404 → `NOT_REVERSIBLE` → `DUPLICATE_REVERSAL` → `ALREADY_REVERSED` → `REVERSAL_WINDOW_CLOSED` → `ACCOUNT_NOT_ELIGIBLE` → `EXCEEDS_REVERSIBLE_AMOUNT` | design |

### State table ของรายการชำระ (`type=PAYMENT`)

| สถานะปัจจุบัน | Reverse บางส่วน (ยังไม่ครบ) | Reverse จนครบ | Reverse เมื่อครบแล้ว |
|---|---|---|---|
| `POSTED` | → `PARTIALLY_REVERSED` | → `REVERSED` | – |
| `PARTIALLY_REVERSED` | → `PARTIALLY_REVERSED` | → `REVERSED` | – |
| `REVERSED` | – | – | ปฏิเสธ 409 `ALREADY_REVERSED` |

รายการ `type=REVERSAL` มีสถานะเดียวคือ `POSTED`

## 5. End-of-day — LL-EOD

| ID | Requirement | ที่มา |
|---|---|---|
| LL-EOD-01 | ระบบมี business date 1 ค่า เป็นวันจันทร์–ศุกร์เสมอ · ไม่มีปฏิทินวันหยุด และไม่มีเวลาตัดรอบตามนาฬิกา | Q7 |
| LL-EOD-02 | Transaction ทุกรายการใช้ business date ขณะทำรายการ · "หลังตัดรอบ" หมายถึงหลัง EOD ของวันนั้นรันแล้ว รายการที่ทำหลังจากนั้นเป็นของวันทำการถัดไป | Q7 |
| LL-EOD-03 | EOD ของวัน T ทำ 3 ขั้นตามลำดับ: settlement → reconciliation → เลื่อน business date | REQ-EOD-01 |
| LL-EOD-04 | Settlement (T+1): รายการ `PAYMENT` ของวัน T ที่มียอดสุทธิ (amount − reversedAmount) มากกว่า 0 ได้ `settlementDate` = วันทำการถัดจาก T (ศุกร์ → จันทร์) · รายการที่ถูก reverse ครบไม่ถูก settle (`settlementDate` เป็น null) | REQ-EOD-01, Q7 |
| LL-EOD-05 | Reconciliation ต่อ Loan ทุกสัญญา: ยอดที่คาดไว้ = opening balance − ผลรวมยอดสุทธิของรายการ `PAYMENT` ทั้งหมดของ Loan · ต้องเท่ากับ outstanding ที่เก็บไว้ **พอดี (ส่วนต่างที่ยอมรับ = 0.00)** · ไม่เท่า = break | REQ-EOD-01, Q8 |
| LL-EOD-06 | ผลของ EOD run: `BALANCED` เมื่อไม่มี break, `OUT_OF_BALANCE` เมื่อมี พร้อมรายการ break (`loanNo`, `expected`, `actual`, `difference`) · มี break แล้ว EOD ยังรันจนจบและเลื่อน business date | Q8 |
| LL-EOD-07 | หลัง EOD business date = วันทำการถัดไป (ศุกร์ → จันทร์) | Q7 |
| LL-EOD-08 | EOD run บันทึก `businessDate`, `nextBusinessDate`, `settledCount`, `paymentsTotal`, `reversalsTotal`, `netTotal` ของวันนั้น | REQ-EOD-01, design |
| LL-EOD-09 | Officer เท่านั้นที่สั่งรัน EOD (`POST /api/loanlab/eod`) และอ่านผล (`GET /api/loanlab/eod-runs`) ได้ | Q6, design |

## 6. Security — LL-SEC

| ID | Requirement | ที่มา |
|---|---|---|
| LL-SEC-01 | ทุก endpoint ใต้ `/api/loanlab/*` ต้อง login (ไม่ login = 401) · ใช้ authentication เดียวกับ ShopLab (REQ-AUTH-01..07 รวมบัญชี `locked` ใช้งานไม่ได้) | REQ-SEC-01 |
| LL-SEC-02 | Customer เห็นได้เฉพาะ Account, Loan และ transaction ของตัวเอง · ของคนอื่นตอบ 404 (ไม่เปิดเผยว่ามีอยู่) | REQ-SEC-01 |
| LL-SEC-03 | รายการของ Officer เท่านั้น: สร้าง Account, เปลี่ยนสถานะ Account, เปิด Loan, reverse, รัน EOD, อ่านผล EOD, ดูข้อมูลของลูกค้าทุกคน (`?all=1`) · customer เรียก = 403 | REQ-SEC-01, Q6 |
| LL-SEC-04 | Test hooks (`/api/test/loanlab/*`) ต้องปิดเมื่อ `NODE_ENV=production` | Appendix A หมวด D |

## 7. Reporting — LL-RPT

| ID | Requirement | ที่มา |
|---|---|---|
| LL-RPT-01 | Transaction history ของ Loan เรียงจากใหม่ไปเก่า แสดง เลขอ้างอิง, type, amount, status, business date, settlement date และ balance after | REQ-RPT-01 |
| LL-RPT-02 | กรอง history ตาม `type` (`PAYMENT`, `REVERSAL`) และ `status` ได้ | REQ-RPT-01 |
| LL-RPT-03 | Transaction detail ของ `PAYMENT` แสดง reversed amount, ยอดที่ยัง reverse ได้ และรายการ reversal ทั้งหมดของมัน · ของ `REVERSAL` แสดงเลขอ้างอิงรายการเดิม, reference และ reason | REQ-RPT-01, Q5 |
| LL-RPT-04 | Payment status ที่แสดง: `POSTED`, `PARTIALLY_REVERSED`, `REVERSED` · settlement แสดง "Pending settlement" เมื่อยังไม่ผ่าน EOD และวันที่ settle เมื่อผ่านแล้ว | REQ-RPT-01, ASM-01 (แก้ตาม Q5) |
| LL-RPT-05 | Account overview แสดง business date, Account พร้อมสถานะ และ Loan พร้อม outstanding และสถานะ | REQ-RPT-01, REQ-ACC-01 |
| LL-RPT-06 | หน้า Back Office (`/loanlab/officer`, Officer เท่านั้น) แสดง Account ของลูกค้าทุกคน · สร้าง Account (LL-ACC-01..03), เปลี่ยนสถานะได้เฉพาะ transition ที่อนุญาต (LL-ACC-04..06) และเปิด Loan ใต้ Account ที่ `ACTIVE` (LL-LOAN-01..03) · customer เปิดหน้านี้แล้วเห็นข้อความปฏิเสธ ไม่เห็นข้อมูล | REQ-ACC-01, Q6, design |

## 8. Testability — LL-TST

Test hooks ใช้ได้เมื่อ `NODE_ENV` ไม่ใช่ `production` และไม่ต้อง login

| ID | Hook | ใช้ทำอะไร |
|---|---|---|
| LL-TST-01 | `POST /api/test/reset` | Reset ทั้ง ShopLab และ LoanLab กลับเป็น seed (business date = `2026-01-05`) |
| LL-TST-02 | `POST /api/test/loanlab/reset` | Reset เฉพาะข้อมูล LoanLab |
| LL-TST-03 | `POST /api/test/loanlab/accounts` | สร้าง Account และ Loan ในสถานะและยอดที่กำหนดในครั้งเดียว: `{ username, accountStatus?, outstanding?, principal?, noLoan? }` |
| LL-TST-04 | `PATCH /api/test/loanlab/loans/{id}` | บังคับค่า outstanding โดยไม่ลง transaction เพื่อจำลอง reconciliation break |
| LL-TST-05 | `GET` / `POST /api/test/loanlab/business-date` | อ่านและกำหนด business date (ต้องเป็นวันจันทร์–ศุกร์) |
| LL-TST-06 | `POST /api/test/loanlab/eod` | สั่งรัน EOD ของ business date ปัจจุบัน |
| LL-TST-07 | `POST /api/test/config {"bugMode": true}` หรือ `GRADING_BUGS=LL-BUG-nn` | เปิดบั๊กที่ฝังไว้ทั้งชุด หรือทีละตัวสำหรับการให้คะแนน |

> **ข้อควรระวังเรื่อง test isolation:** business date และ EOD เป็น state ร่วมของทั้งระบบ test ที่รัน EOD หรือเปลี่ยน business date ต้องไม่รันขนานกับ test ที่ชำระแล้ว reverse (ดูวิธีแยกใน `tests/playwright/playwright.config.ts` project `loanlab-eod`)

ข้อมูล seed: `customer` มี 1 Account `ACTIVE` กับ Loan 50,000.00 · `jane` มี Account `ACTIVE` กับ Loan 3 สัญญา (มีประวัติชำระและ reverse, ยอดคงเหลือ 300.00, และสัญญาที่ปิดแล้ว) · `locked` มี Account `FROZEN`

## 9. ภาคผนวก — คำตอบที่ยืนยันแล้วของคำถามเปิด (Appendix A หมวด C)

| # | คำถาม | คำตอบที่ยืนยัน | Requirement |
|---|---|---|---|
| Q1 | ยอดคงเหลือต่ำกว่า 500 ปิดหนี้อย่างไร | ขั้นต่ำ = ค่าที่น้อยกว่าระหว่าง 500 กับ outstanding จึงชำระยอดปิดหนี้พอดีได้ · ชำระแล้วเหลือต่ำกว่า 500 ได้ | LL-PAY-06, LL-PAY-07 |
| Q2 | Full payment เปลี่ยนสถานะ Loan หรือไม่ | เปลี่ยนเป็น `CLOSED` ทันทีในรายการเดียวกัน · reverse รายการนั้นทำให้กลับเป็น `ACTIVE` | LL-LOAN-05, LL-LOAN-06, LL-PAY-08 |
| Q3 | Account มีสถานะใดบ้าง อนุญาตรายการใด | `PENDING`, `ACTIVE`, `FROZEN`, `CLOSED` ตามตารางในหมวด 1 | LL-ACC-04..07 |
| Q4 | Reverse หลัง EOD ได้หรือไม่ | ไม่ได้ — ได้เฉพาะวันทำการเดียวกัน | LL-REV-05 |
| Q5 | Reverse บางส่วนได้หรือไม่ | **ได้** — จึงเพิ่มสถานะ `PARTIALLY_REVERSED` (แก้ ASM-01) และ reversal คืนยอดเท่ากับจำนวนที่ reverse (แก้ ASM-02) | LL-REV-04, LL-REV-07 |
| Q6 | ใคร reverse ได้ ต้องมีผู้อนุมัติหรือไม่ | Officer เท่านั้น ไม่มีผู้อนุมัติคนที่สอง ต้องระบุ reason | LL-REV-01, LL-REV-03 |
| Q7 | T+1 คือวันทำการหรือวันปฏิทิน รายการหลังตัดรอบเป็นของวันใด | วันทำการ จันทร์–ศุกร์ ไม่มีปฏิทินวันหยุด · EOD คือจุดตัดรอบ ไม่ใช้เวลาตามนาฬิกา | LL-EOD-01, LL-EOD-02, LL-EOD-04 |
| Q8 | Reconciliation เทียบอะไรกับอะไร ยอมรับส่วนต่างได้หรือไม่ | Ledger (opening − ยอดชำระสุทธิ) เทียบกับ outstanding ที่เก็บไว้ ต่อ Loan · ส่วนต่างที่ยอมรับ = 0 · มี break แล้ว EOD ยังจบและเลื่อนวัน | LL-EOD-05, LL-EOD-06 |

**ผลต่อข้อสมมติเดิม (Appendix A หมวด B):** ASM-01 เพิ่มสถานะ `PARTIALLY_REVERSED` · ASM-02 เปลี่ยนเป็น "คืนยอดเท่ากับจำนวนที่ reverse" · ASM-03 และ ASM-04 คงเดิม

**ข้อที่กำหนดเพิ่มเพราะ Q5** (`Q5+` — เจ้าของหลักสูตรยืนยันเมื่อ 2026-11-16): เมื่อ reverse บางส่วนได้ การ reverse จำนวนเท่ากันสองครั้งอาจเป็นรายการที่ตั้งใจทั้งคู่ ระบบจึงใช้ `reference` ของคำขอเป็นตัวระบุ duplicate (LL-REV-03, LL-REV-09)
