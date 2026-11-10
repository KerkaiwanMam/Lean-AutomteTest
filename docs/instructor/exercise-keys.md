# ⚠️ Spoiler — Instructor Exercise Keys (Labs 12.2, 15.4, 17.2)

> **repo นี้เป็น public — ไฟล์นี้อ่านได้ทั่วไป** บอกผู้เรียนให้ลองทำเองก่อนเปิดไฟล์นี้ (หรือแจก repo ฉบับที่ตัด `docs/instructor/` และไฟล์ `*.solution*` ออกเมื่อสอนจริง) · ผลที่วัดได้: Windows 11, Chrome, 20 รอบ, 8 workers, 2026-11-10 (ตัวเลขอาจต่างบนเครื่องอื่น แต่ลำดับควรใกล้เคียง)

## Lab 17.2 — Fix the flaky (`tests/playwright/tests/exercises/flaky.spec.ts`)

รัน: `npm run test:exercises:flaky` (ผู้เรียน) · `npm run test:exercises:solutions` (เฉลย) — ทั้งสองต้องตั้ง `EXERCISES=1` ซึ่ง script ตั้งให้แล้ว

| # | Test | สาเหตุ (M17 §2) | อาการที่วัดได้ | วิธีแก้ | บทเรียน |
|---|---|---|---|---|---|
| 1 | product list is shown | Timing — `waitForTimeout(800)` | ผ่าน 14/20 (ช้า ≥ 800 ms → fail) | `await expect(cards).toHaveCount(8)` | sleep แพงเมื่อช้าและไม่พอเมื่อช้ากว่าที่เดา |
| 2 | sorting … cheapest first | Timing — อ่านค่าครั้งเดียว (`innerText`) | ผ่าน 13–15/20 | `await expect(names.first()).toHaveText('Jump Rope')` | อ่านค่าครั้งเดียวไม่ retry |
| 3 | customer adds one item | Shared data — บัญชี `customer` ร่วมกัน | ผ่าน 1/20 (ตะกร้าสะสม) | fixture `userApi` (user ใหม่ต่อ test) | สถานะรั่วข้ามรอบ/worker |
| 4 | progress bar can be started | Locator กว้าง — `name: 'Start'` ตรงทั้ง "Start" และ "Start progress" | ผ่าน 0/20 (strict mode violation) | `exact: true` หรือ test id | "เคยผ่าน" ก่อนหน้าจะมีปุ่มที่สองเพิ่ม |
| 5 | export after add form | Overlay — modal เปิดค้าง backdrop บัง link | ผ่าน 0/20 (`intercepts pointer events`, timeout 10 s) | ปิด modal (Cancel) + `toBeHidden()` ก่อนไปต่อ | จบสิ่งที่เปิดไว้ก่อนทำขั้นถัดไป |
| 6 | flaky dependency answers | Dependency ภายนอก + shared server state | ผ่าน 10/20 (ตอบสลับสำเร็จ/ล้มเหลว) | `expect(async () => …).toPass()` | retry **การกระทำ** ไม่ใช่ทั้ง test |

หมายเหตุ: test 4 และ 5 fail ทุกรอบในแอปปัจจุบัน (ไม่ใช่ intermittent จริง) — ใช้สอนว่า "test ที่เคยผ่านแล้วเริ่มแดง" เกิดจากหน้าเว็บโตขึ้น · test 1–2 ใช้ `testInfo.repeatEachIndex` ทำให้ช้าแบบทำซ้ำได้ (index 0 = ไม่ช้า = "ที่เครื่องฉันผ่าน")
ลองให้ผู้เรียนแก้ test 1 โดยเพิ่ม sleep เป็น 2000 ms แล้วอภิปรายว่าทำไมยังไม่ใช่ทางแก้ (ช้าลงทุกครั้ง และ 1200+ ms ที่ช้ากว่านั้นยังพัง)

## Lab 15.4 — Refactor kata (`tests/playwright/tests/exercises/bad-checkout.spec.ts`)

รัน: `npm run test:exercises:kata` (เขียว 3/3 ก่อน refactor ~29 วินาที เพราะ sleep)

| Smell (M15 §7) | ที่อยู่ในไฟล์ | แนวแก้ |
|---|---|---|
| God test (แทน God page object) | `test1` ทำ login → ตะกร้า → ชำระเงิน → ยืนยัน ในก้อนเดียว | แยก page objects + fixtures; test เหลือ Arrange/Act/Assert |
| Test inter-dependency | `orderNumber` ตัวแปร module + `mode: 'serial'`; `test2` ต้องรันหลัง `test1` | `test2` สร้าง order เองผ่าน API (`userApi.checkout`) |
| Hard-coded waits | `waitForTimeout` 16 จุด | auto-wait / web-first assertions / `waitForResponse` |
| Assertion-free test | `test3` (admin) คลิก 3 แท็บแล้ว log | assert ว่า panel/ตารางแต่ละแท็บแสดง; ไม่ควรเหลือ `console.log` |
| Over-abstraction | `doClick(page, selector)` ห่อ `locator().click()` โดยไม่เพิ่มคุณค่า | ลบ แล้วใช้ page object ที่สื่อเจตนา (`cartPage.checkout()`) |
| Copy-paste locators | login ซ้ำ 3 ครั้ง; ที่อยู่/บัตรกรอกทีละช่อง | `LoginPage`, `CheckoutPage.fillAddress/payByCard`, data builders |
| Shared mutable state | ใช้บัญชี `jane` ร่วม + ลบตะกร้าด้วย HTTP ดิบกลาง test | `freshUser` fixture; ไม่ต้องล้างตะกร้า |
| Logic in tests | `for` + `if (found)` หา order ใน `test2` | `expect(orderRow).toBeVisible()` หรือ `toContainText` |

อื่นๆ ที่ควรเห็น: URL/รหัสผ่านฝังในโค้ด (ใช้ `env.ts` + baseURL), XPath แบบ index (`(//button…)[1]`) และ XPath ของ `#id`, ค่า magic `'฿791.80'` (ใช้ oracle `expectedQuote(690, 0)`), ชื่อ test `test1/2/3` ไม่สื่อพฤติกรรม, `waitForTimeout` + `innerText` อ่านครั้งเดียว, ไม่ตรวจสถานะ order `PAID`, `cardExpiry` พิมพ์ `1230` (ฟอร์มจัดรูปเป็น 12/30)
เกณฑ์ผ่านที่แนะนำ: ผ่าน `--repeat-each=3 --workers=4`, ไม่มี `waitForTimeout`, ไม่มี URL/รหัสผ่านใน spec, ทุก test มี assertion ทางธุรกิจ, review checklist ≥ 32/40

## Lab 12.2 — DataDriver (`tests/robot/data/pricing.csv`)

เฉลย: `tests/robot/solutions/06_pricing_datadriver.robot` (ต้อง `pip install robotframework-datadriver`)
- ปกติ: 11/11 ผ่าน (มี R3 และ R10 เพิ่มจากชุด template เดิม 9 แถว)
- Bug Mode: fail 5/11 — R2 (BUG-01), R4 (BUG-02), R5, R6 (ผลกระทบจากการคิด VAT ผิด), R9 (BUG-07)
- ข้อผิดพลาดที่ผู้เรียนมักเจอ: คอลัมน์แรกไม่ใช่ `*** Test Cases ***`, ชื่อคอลัมน์ไม่ตรง argument (`${sku}` ต้องมี `${}`), encoding ของไฟล์ (ค่าเริ่มต้นของ DataDriver คือ cp1252 และ dialect ค่าเริ่มต้นใช้ `;` — จึงต้องระบุ `dialect=excel encoding=utf-8`), keyword template อยู่ใน suite อื่นที่ import ไม่ถึง
