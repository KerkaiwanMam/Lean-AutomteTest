# ⚠️ Spoiler — ShopLab Bug Catalogue (Bug Mode, instructor key)

> **repo นี้เป็น public — ไฟล์นี้อ่านได้ทั่วไป** ผู้เรียนควรหาบั๊กเองก่อนเปิดไฟล์นี้ (หรือแจก repo ฉบับที่ตัด `docs/instructor/` ออกก่อน Capstone) · เปิด Bug Mode: `POST /api/test/config {"bugMode": true}` หรือ `BUG_MODE=1`
> รายการสั้นแบบ machine-readable: `GET /api/test/config?reveal=1`

| ID | Area | Defect | Requirement | Technique that finds it | Where in code | Reference tests that catch it |
|---|---|---|---|---|---|---|
| BUG-01 | Pricing | Free shipping uses `>` not `>=` (1,000 pays 50) | REQ-PRC-03 | BVA (999/1000/1001) | `src/pricing.js` | PW `cart-pricing.spec.ts` R2 · RF `03_cart_pricing.robot` R2 · unit test |
| BUG-02 | Pricing | VAT computed on subtotal before discount | REQ-PRC-05 | Decision table + oracle | `src/pricing.js` | PW R4, `cart-orders.api` quote · RF R4/R5/R6, `orders_api` totals |
| BUG-03 | Catalogue | Search is case-sensitive | REQ-CAT-02 | EP (case variants) | `routes/products.js` | PW `catalog.spec`, `products.api` · RF `02_catalog` |
| BUG-04 | Catalogue | Price sort compares as text | REQ-CAT-04 | Sorting oracle | `routes/products.js` | PW `catalog.spec`, `products.api` · RF `02_catalog`, `products_api` |
| BUG-05 | Catalogue | Pagination skips one product | REQ-CAT-05 | Completeness check across pages | `routes/products.js` | PW `catalog.spec`, `products.api` · RF `products_api` |
| BUG-06 | Registration | Age 17 accepted | REQ-REG-07 | BVA (17/18/60/61) | `routes/users.js` | PW `registration.spec`, `security.api` BVA |
| BUG-07 | Pricing | Expired coupon accepted | REQ-PRC-02/07 | EP (coupon states) | `src/pricing.js` | PW R9 · RF R9 |
| BUG-08 | Security | IDOR — read another user's order | REQ-SEC-01 | Two-user authz test | `routes/orders.js` | PW `security.api` · RF `orders_api` |
| BUG-09 | Security | Stored XSS in review comments | REQ-SEC-03 | Error guessing / OWASP | `public/product.html` | PW `registration.spec` › reviews |
| BUG-10 | Cart | API accepts qty 11 | REQ-CART-01 | BVA at API level | `routes/cart.js` | PW `cart-orders.api`, `cart-pricing.spec` qty>10 · RF `orders_api` |
| BUG-11 | Auth | Locked account can log in | REQ-AUTH-04 | State transition (account) | `routes/auth.js`, `middleware.js` | PW `auth.spec`, `security.api` · RF `01_login` |
| BUG-12 | Orders | Cancel does not restore stock | REQ-ORD-06 | State + data verification | `routes/orders.js` | PW `checkout.spec`, `cart-orders.api` · RF `orders_api` |
| BUG-13 | Security | Login message reveals username existence | REQ-AUTH-03 | Error guessing / security | `routes/auth.js` | PW `auth.spec`, `security.api` · RF `01_login` |
| (visual) | UI | Lab card 15 shifts 6px + button colour changes | – | Visual regression | `public/css/style.css` `.bug-visual` | PW `visual.spec` (opt-in project) |

## Teaching tips
- **Lab 01.2 / 02.4 / 03.3:** let learners find bugs manually first — then show that a good regression suite would have caught them automatically.
- **Capstone scoring:** run the learner suite in normal mode (must be green) and in bug mode; map each failing test to a BUG-ID. A failure that is not explained by a BUG-ID in bug mode = possible false positive (ask the learner).
- **Discussion:** which bugs are invisible to UI-only suites? (BUG-10 qty 11 via API, BUG-08 IDOR) → pyramid & API testing argument.
- **Chaos settings** for M17: `{"latencyMs": 1500}`, `{"failureRate": 0.3}`; `GET /api/lab/flaky` fails every 2nd call.

---

# ⚠️ Spoiler — LoanLab Bug Catalogue (Bug Mode, instructor key)

> **Spoiler สำหรับ capstone โดเมน Banking (Ch 20) และ Lab ของ LoanLab** — ผู้เรียนควรหาบั๊กด้วย test ของตัวเองก่อนเปิดส่วนนี้
> LoanLab เป็นระบบสมมติเพื่อการเรียน · requirement: [`practice-app/REQUIREMENTS-LOANLAB.md`](../../practice-app/REQUIREMENTS-LOANLAB.md)
> เปิดทั้งชุดพร้อมบั๊กของ ShopLab: `POST /api/test/config {"bugMode": true}` หรือ `BUG_MODE=1` · เปิดทีละตัวเพื่อให้คะแนน: `GRADING_BUGS=LL-BUG-03` หรือ `python tools/grade_suite.py ... --bugs loanlab`
> รายการแบบ machine-readable: `GET /api/test/config?reveal=1` (field `loanlabBugs`) · ชุดบั๊กของ ShopLab (`BUG-01` ถึง `BUG-13`) และคะแนนที่นับจากชุดนั้นไม่เปลี่ยน

| ID | Area | Defect | Requirement | Technique that finds it | Where in code | Reference tests that catch it |
|---|---|---|---|---|---|---|
| LL-BUG-01 | Payment | Payment of exactly 500.00 is rejected (`>` instead of `>=`) | LL-PAY-06 | BVA (499.99 / 500.00 / 500.01) | `src/loanlab/rules.js` `decidePayment` | PW `payment.api.spec` R5 · RF `Payment Decision Table` · unit test |
| LL-BUG-02 | Payment | Overpayment accepted, balance floored at 0 | LL-PAY-05 | BVA at the balance (10,000.00 / 10,000.01) | `src/loanlab/rules.js` `decidePayment` | PW `payment.api.spec` R3 · RF `Payment Decision Table` |
| LL-BUG-03 | Payment | FROZEN account can pay | LL-PAY-03, LL-ACC-07 | Decision table / state (account status) | `src/loanlab/rules.js` `decidePayment` | PW `payment.api.spec` R1 · RF `Payment Decision Table` |
| LL-BUG-04 | Payment | Exact pay-off below 500.00 rejected | LL-PAY-06 | Requirement review (Q1) + BVA on a small balance | `src/loanlab/rules.js` `minimumPayment` | PW `payment.api.spec` R6, `payment-flow.ui.spec` pay full · RF `Payment Decision Table` |
| LL-BUG-05 | Loan | Full payment leaves the loan ACTIVE | LL-LOAN-05, LL-PAY-08 | State transition (loan) | `src/loanlab/rules.js` `decidePayment` | PW `payment.api.spec` R6 · RF `Payment Decision Table` |
| LL-BUG-06 | Reversal | Duplicate reversal processed again (balance restored twice) | LL-REV-09 | Error guessing: repeat the same request; state table (REVERSED) | `src/loanlab/rules.js` `decideReversal` | PW `reversal.api.spec` duplicate · RF `Officer Reverses A Payment In Two Parts` |
| LL-BUG-07 | Reversal | Reversal does not restore the outstanding balance | LL-REV-07 | State + data verification; reconciliation | `src/loanlab/rules.js` `decideReversal` | PW `reversal.api.spec` full / partial · RF `Officer Reverses A Payment In Two Parts` |
| LL-BUG-08 | Security | IDOR — read another customer's loan, history, transaction | LL-SEC-02 | Two-user authorization test | `src/routes/loanlab.js` `canRead` | PW `security-accounts.api.spec`, `payment-flow.ui.spec` · RF `Customer Cannot Reverse Or Read ...` |
| LL-BUG-09 | Security | Customer can post a reversal | LL-REV-01, LL-SEC-03 | Role-based authorization test | `src/routes/loanlab.js`, `rules.js` `decideReversal` | PW `reversal.api.spec` customer · RF `Customer Cannot Reverse Or Read ...` |
| LL-BUG-10 | Reversal / EOD | Payment can be reversed after end-of-day | LL-REV-05 | Time-dependent state: act, run EOD, act again | `src/loanlab/rules.js` `decideReversal` | PW `eod.api.spec` · RF `End Of Day Settles ...` |
| LL-BUG-11 | EOD | T+1 uses the next calendar day (Friday settles on Saturday) | LL-EOD-04, LL-EOD-07 | BVA on dates (Thursday / Friday) | `src/loanlab/rules.js` `nextBusinessDay` | PW `eod.api.spec` Friday · RF `End Of Day Settles ...` |
| LL-BUG-12 | EOD | Reconciliation always reports BALANCED | LL-EOD-05, LL-EOD-06 | Fault injection: force a 0.01 difference, then run EOD | `src/loanlab/rules.js` `reconcile` | PW `eod.api.spec` break · RF `End Of Day Settles ...` |
| LL-BUG-13 | Reporting | Partially reversed payment keeps status POSTED | LL-REV-07, LL-RPT-04 | State transition (payment) | `src/loanlab/rules.js` `decideReversal` | PW `reversal.api.spec` partial, `payment-flow.ui.spec` officer · RF `Officer Reverses A Payment In Two Parts` |

**Reference suite detection (วัดจริงด้วย `tools/grade_suite.py --bugs loanlab` เมื่อ 2026-11-14 เปิดบั๊กทีละตัว):** Playwright projects `loanlab` + `loanlab-eod` จับได้ 13 จาก 13 · Robot `tests/loanlab` จับได้ 13 จาก 13 · baseline ไม่มีบั๊กผ่านทั้งสองชุด (บันทึกใน CL-013)

**Capstone pass mark (LoanLab):** detection ≥ 10 จาก 13 (`LL-BUG-01` ถึง `LL-BUG-13`) วัดแบบเปิดบั๊กทีละตัวด้วย `python tools/grade_suite.py ... --bugs loanlab` — เท่ากับเกณฑ์ของ ShopLab (ยืนยัน 2026-11-28)

**Teaching tips (LoanLab)**
- บั๊กที่ UI-only suite มองไม่เห็น: LL-BUG-03 และ LL-BUG-09 (หน้าเว็บซ่อนฟอร์มเองตั้งแต่ฝั่ง client), LL-BUG-02 ถ้าไม่ลองค่าเกินยอด, LL-BUG-10 ถึง LL-BUG-12 ถ้าไม่ควบคุม business date ผ่าน test hook → ใช้คุยเรื่อง test pyramid และ testability
- LL-BUG-04 หาไม่เจอถ้าไม่เคยตั้งคำถามตอน requirement review (Lab 2.6 ข้อ 1) → ตัวอย่างว่า test design เริ่มที่การอ่าน requirement
- LL-BUG-07 และ LL-BUG-02 ทำให้ reconciliation ของ EOD รายงาน break ด้วย → ตัวอย่าง control ที่จับความผิดพลาดได้แม้ไม่มี test ตรงจุดนั้น
- business date และ EOD เป็น state ร่วมของทั้งระบบ — test ที่รัน EOD ต้องแยกจาก test ที่ชำระแล้ว reverse (ดู project `loanlab-eod` ใน `tests/playwright/playwright.config.ts` และคำอธิบาย suite ใน `tests/robot/tests/loanlab/loanlab_acceptance.robot`)
