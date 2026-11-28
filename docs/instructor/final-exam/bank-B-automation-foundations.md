# Final Exam Bank — Area B: Automation Foundations (M05–M08 · Ch 3, 4, 6)

> ⚠️ Spoiler (instructor key; this repository is public) · format: see [README.md](README.md)

### B-01
`area: B` · `module: M05` · `chapter: 4` · `level: K2` · `type: single` · `answer: C`

ทีมเพิ่งเริ่มทำ automation รายการใดควร automate **ก่อน**

- A) หน้าโปรไฟล์ใหม่ที่ designer ยังปรับ layout ทุก sprint
- B) การตรวจว่าสีและฟอนต์ "ดูสวย"
- C) Regression ของการคำนวณราคา checkout ที่รันทุก release และกระทบเงินลูกค้า
- D) การทดสอบที่ทำครั้งเดียวก่อนย้ายระบบ

> **เหตุผล:** ผู้สมัครที่ดีคือรันบ่อย ความเสี่ยงสูง ฟีเจอร์นิ่ง และตรวจผลได้ชัด · UI ที่ยังเปลี่ยนบ่อย งานที่ต้องใช้วิจารณญาณ และงานครั้งเดียวไม่คุ้ม · **อ้างอิง:** M05 §2

### B-02
`area: B` · `module: M05` · `chapter: 4` · `level: K3` · `type: single` · `answer: B`

Regression ชุดหนึ่งใช้เวลา manual 2 ชม./รอบ · สร้าง automation 16 ชม. · ดูแล 0.25 ชม./รอบ จะคุ้มทุนหลังประมาณกี่รอบ

- A) 8 รอบ
- B) ประมาณ 9–10 รอบ
- C) 16 รอบ
- D) 64 รอบ

> **เหตุผล:** จุดคุ้มทุน = 16 ÷ (2 − 0.25) ≈ 9.14 รอบ · **อ้างอิง:** M05 §3

### B-03
`area: B` · `module: M05` · `chapter: 4` · `level: K2` · `type: single` · `answer: D`

Developer เปลี่ยน id ของปุ่ม Login ตาม generic Test Automation Architecture (gTAA) ส่วนใดของ automation ควรต้องแก้

- A) Test generation
- B) Test definition (ไฟล์ test case)
- C) Test execution (runner และ report)
- D) Test adaptation (page object / ตัวเชื่อมกับ SUT)

> **เหตุผล:** test adaptation คือส่วนที่เชื่อมกับ SUT ผ่าน UI/API · ถ้าแยกชั้นถูก test case ไม่ต้องแก้ · **อ้างอิง:** M05 §5, REF-002

### B-04
`area: B` · `module: M05` · `chapter: 4` · `level: K2` · `type: single` · `answer: A`

ระบบที่ต้องทดสอบมี flow หลักที่เปิด tab ใหม่และเปลี่ยนไปอีก domain ระหว่างทาง ข้อเท็จจริงใดเกี่ยวกับ Cypress ที่ต้องนำมาพิจารณา

- A) Cypress ควบคุมได้ทีละ browser หลาย tab ต้องใช้ plugin `@cypress/puppeteer` และการข้าม origin ต้องใช้ `cy.origin`
- B) Cypress ไม่สามารถทดสอบเว็บที่เขียนด้วย JavaScript
- C) Cypress รองรับหลาย tab ได้ในตัวเหมือน Playwright
- D) Cypress ใช้ได้กับ API testing เท่านั้น

> **เหตุผล:** ตามหน้า Trade-offs ของ Cypress · ข้อจำกัดนี้เป็นเกณฑ์สำคัญในการเลือกเครื่องมือ · **อ้างอิง:** M05 §4, REF-088

### B-05
`area: B` · `module: M06` · `chapter: 3` · `level: K2` · `type: single` · `answer: C`

ทำไม CI pipeline ควรใช้ `npm ci` แทน `npm install`

- A) `npm ci` ติดตั้งเวอร์ชันล่าสุดของทุก package เสมอ
- B) `npm ci` ไม่ต้องมี package-lock.json
- C) `npm ci` ติดตั้งตาม lock file และจบด้วย error ถ้า lock ไม่ตรงกับ package.json
- D) `npm ci` แก้ package.json ให้ตรงกับ lock file อัตโนมัติ

> **เหตุผล:** `npm ci` ต้องมี lock file, ไม่เขียนทับ package.json/lock และล้มเมื่อไม่ตรงกัน จึงได้การติดตั้งที่ทำซ้ำได้ · **อ้างอิง:** M06 §3, REF-089

### B-06
`area: B` · `module: M06` · `chapter: 3` · `level: K3` · `type: multi` · `answer: A,D`

ไฟล์ใดใน repo ของ Playwright framework **ควร** commit เข้า Git **(เลือก 2 ข้อ)**

- A) `package-lock.json`
- B) `node_modules/`
- C) `.env` ที่มีรหัสผ่านของ staging
- D) `playwright.config.ts`

> **เหตุผล:** lock file และ config คือส่วนของโปรเจกต์ที่ต้องทำซ้ำได้ · `node_modules/` สร้างใหม่ได้ · secret ห้ามอยู่ใน repo (ถ้าเผลอ commit ต้อง rotate) · **อ้างอิง:** M06 §2

### B-07
`area: B` · `module: M06` · `chapter: 3` · `level: K4` · `type: single` · `answer: B`

`pabot` รันชุด Robot แล้วทุก test ล้มด้วย `No keyword with name 'Create Session' found` ทั้งที่ `robot` ในเครื่องเดียวกันรันผ่าน สาเหตุที่น่าจะเป็นที่สุดคือข้อใด

- A) RequestsLibrary ไม่รองรับการรันขนาน
- B) ไม่ได้ activate virtual environment ทำให้ pabot ไปเรียก `robot` ของ Python ระบบที่ไม่มี RequestsLibrary
- C) ต้องเพิ่ม `--testlevelsplit` ทุกครั้ง
- D) ShopLab ยังไม่ได้ start

> **เหตุผล:** เป็นกรณีจริงตอนสร้างหลักสูตร: pabot เรียก `robot` จาก PATH · ถ้า ShopLab ไม่รันจะได้ connection error ไม่ใช่ "No keyword" · **อ้างอิง:** M06 §3, M12 §5

### B-08
`area: B` · `module: M07` · `chapter: 3` · `level: K2` · `type: single` · `answer: A`

ผู้ใช้ที่ login แล้วด้วย role customer เรียก `GET /api/admin/users` และผู้ที่ยังไม่ login เรียก `GET /api/cart` ควรได้ status ใดตามลำดับ

- A) 403 และ 401
- B) 401 และ 403
- C) 404 และ 401
- D) 403 และ 404

> **เหตุผล:** 401 = ยังยืนยันตัวตนไม่ได้ · 403 = รู้ว่าเป็นใครแต่ไม่มีสิทธิ์ · **อ้างอิง:** M07 §4, REQUIREMENTS REQ-SEC-02

### B-09
`area: B` · `module: M07` · `chapter: 6` · `level: K3` · `type: single` · `answer: C`

ปุ่ม "Save changes" ในการ์ด Dynamic IDs ของ `/lab` เปลี่ยน id และ class ทุกครั้งที่โหลดหน้า locator ใดทนทานที่สุด

- A) `page.locator('#btn-x8k2f1')`
- B) `page.locator('/html/body/main/div/section[3]/div/button')`
- C) `page.getByRole('button', { name: 'Save changes' })`
- D) `page.locator('div:nth-child(3) > button')`

> **เหตุผล:** role + accessible name ไม่ขึ้นกับ id ที่สุ่ม · XPath absolute และตำแหน่งลอยๆ เปราะเมื่อโครงสร้างเปลี่ยน · **อ้างอิง:** M07 §2, REF-071

### B-10
`area: B` · `module: M07` · `chapter: 6` · `level: K2` · `type: single` · `answer: B`

ทำไมการใช้ `getByRole` จึงช่วยตรวจ accessibility ไปในตัว

- A) เพราะ `getByRole` รัน axe-core ทุกครั้ง
- B) เพราะค้นจาก accessibility tree ถ้า element ไม่มี role หรือชื่อที่เข้าถึงได้ (เช่น `<div onclick>`) test จะหาไม่เจอ
- C) เพราะ `getByRole` เร็วกว่า CSS selector
- D) เพราะ screen reader ใช้ Playwright

> **เหตุผล:** locator ตาม role ใช้ข้อมูลเดียวกับที่เทคโนโลยีช่วยเหลือ (assistive technology) เห็น · **อ้างอิง:** M07 §1–2

### B-11
`area: B` · `module: M07` · `chapter: 6` · `level: K3` · `type: single` · `answer: D`

XPath `//tr[td[normalize-space()="ELEC-001"]]/td[4]` ชี้ไปที่อะไร

- A) แถวที่ 4 ของตาราง
- B) cell แรกที่มีข้อความ ELEC-001
- C) ทุก cell ในคอลัมน์ที่ 4 ของตาราง
- D) cell ที่ 4 ของแถวที่มี cell ข้อความ "ELEC-001"

> **เหตุผล:** `tr[td[...]]` เลือกแถวที่มี cell ตรงเงื่อนไข แล้ว `/td[4]` เลือก cell ที่ 4 ของแถวนั้น — รูปแบบที่ใช้หา cell ในตารางจากค่าคีย์ · **อ้างอิง:** M07 §2

### B-12
`area: B` · `module: M07` · `chapter: 8` · `level: K4` · `type: single` · `answer: A`

ใน Newman request "Cart without token" ไม่มี header Authorization แต่ได้ 200 แทน 401 หลังจาก request Login ทำงานไปก่อน สาเหตุคือข้อใด

- A) Cookie jar เก็บ `sl_token` จาก login แล้วส่งไปกับ request ถัดไปโดยอัตโนมัติ
- B) ShopLab ไม่ตรวจสิทธิ์ของ `/api/cart`
- C) Newman แนบ Authorization header จาก request ก่อนหน้าเสมอ
- D) API cache ผลของ request ก่อนหน้า

> **เหตุผล:** login ตั้ง cookie และ cookie jar ส่งให้อัตโนมัติ · แก้โดยปิด cookie ของ request นั้น (`disableCookies`) · test แบบ "ไม่ได้ login" ต้องมั่นใจว่าไม่มี credential แอบติดไป · **อ้างอิง:** M07 §4, M13 §3, REF-027

### B-13
`area: B` · `module: M08` · `chapter: 3` · `level: K3` · `type: single` · `answer: C`

ใน JavaScript `[3, 1, 10].sort()` ได้ผลลัพธ์ใด และเกี่ยวข้องกับบั๊กใดของ ShopLab

- A) `[1, 3, 10]` — ไม่มีบั๊ก
- B) `[10, 3, 1]` — การแบ่งหน้า
- C) `[1, 10, 3]` — การเรียงราคาแบบข้อความ (BUG-04)
- D) `[3, 1, 10]` — การค้นหา

> **เหตุผล:** `sort()` ไม่มี comparator จะเรียงแบบ string · การตรวจลำดับราคาใน test ต้องใช้ `sort((a, b) => a - b)` · **อ้างอิง:** M08 quiz ข้อ 1 (รันจริงแล้ว)

### B-14
`area: B` · `module: M08` · `chapter: 3` · `level: K3` · `type: single` · `answer: B`

test เทียบยอดเงินด้วย `expect(0.1 + 0.2).toBe(0.3)` แล้วล้ม วิธีแก้ที่เหมาะสมคือข้อใด

- A) เปลี่ยนเป็น `toBeTruthy()`
- B) ปัดเป็นทศนิยม 2 ตำแหน่งก่อนเทียบ หรือใช้ `toBeCloseTo`
- C) แปลงเป็น string แล้วตัดตัวท้ายออก
- D) เพิ่ม `retries: 2`

> **เหตุผล:** floating point ทำให้ `0.1 + 0.2` = 0.30000000000000004 · เงินควรปัดหรือเก็บเป็นหน่วยย่อยจำนวนเต็ม (เช่น สตางค์แบบ LoanLab) · **อ้างอิง:** M08 quiz ข้อ 2, REQUIREMENTS-LOANLAB §0

### B-15
`area: B` · `module: M08` · `chapter: 3` · `level: K2` · `type: single` · `answer: A`

ผลที่เป็นไปได้มากที่สุดเมื่อลืม `await` หน้า `page.getByRole('button', { name: 'Login' }).click()` คือข้อใด

- A) บรรทัดถัดไปทำงานก่อนการคลิกเสร็จ ทำให้ test ล้มแบบไม่คงที่หรือ error ไม่ถูกจับ
- B) Playwright รอให้อัตโนมัติจึงไม่มีผลอะไร
- C) TypeScript compile ไม่ผ่านทุกครั้ง
- D) Test ข้ามบรรทัดนี้ไปเลย

> **เหตุผล:** action คืน Promise · ไม่ await = ลำดับการทำงานผิด · ใช้ lint `no-floating-promises` ช่วยจับ · **อ้างอิง:** M08 §3
