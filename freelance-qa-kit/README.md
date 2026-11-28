# Freelance Pre-launch QA Kit

ชุดเครื่องมือสำหรับรับงาน **ตรวจเว็บก่อนเปิดใช้จริง** ให้ลูกค้าที่สร้างเว็บด้วย AI (vibe coding, AI website builder)
หลักการ: **ทดสอบตามความเสี่ยง มีเพดานเวลา ส่งรายงานที่ลูกค้าตัดสินใจได้** — ไม่ทำ QA เต็มรูปแบบ

## ไฟล์ในชุด (ใช้ตามลำดับ)

| # | ไฟล์ | ใช้เมื่อ | เวลา |
|---|---|---|---|
| 01 | [`templates/01-intake-form.md`](templates/01-intake-form.md) | ก่อนรับงาน — ขอบเขต, flow ที่พังไม่ได้, บัญชีทดสอบ, **การอนุญาต** | 30 นาที |
| 02 | [`templates/02-risk-checklist.md`](templates/02-risk-checklist.md) | ให้คะแนนความเสี่ยงและเลือกสิ่งที่จะตรวจตามแพ็กเกจ | 30 นาที |
| 03 | [`templates/03-test-scenarios.md`](templates/03-test-scenarios.md) | แตก risk เป็น scenario + exploratory charter | 30 นาที |
| 04 | [`templates/04-test-cases.md`](templates/04-test-cases.md) | เขียน test case เฉพาะ scenario ระดับสูง (5–15 ข้อ) | 1 ชม. |
| 05 | [`templates/05-test-run-log.csv`](templates/05-test-run-log.csv) | Test run log — บันทึกผลการรันทุกรอบ (เปิดใน Google Sheets/Excel) | ระหว่างทดสอบ |
| – | [`tcm-generator/`](tcm-generator/README.md) | งานที่ scenario/step เยอะ (Launch/Deep Check): สร้าง test case จาก **Test Coverage Matrix** + step matrix อัตโนมัติ พร้อม coverage report, CSV import และโครง Playwright | 1–2 ชม. |
| – | [`playwright-smoke/`](playwright-smoke/README.md) | ตรวจอัตโนมัติ: smoke, มือถือ, accessibility, security พื้นฐาน, flow หลัก | 15 นาที–4 ชม. |
| 06 | [`templates/06-report-executive-summary.md`](templates/06-report-executive-summary.md) | รายงาน 1: Go / No-Go หน้าเดียว | 30 นาที |
| 07 | [`templates/07-report-findings.md`](templates/07-report-findings.md) | รายงาน 2: รายการข้อบกพร่องพร้อมขั้นตอนทำซ้ำและ prompt สำหรับสั่ง AI แก้ | ระหว่างทดสอบ |
| 08 | [`templates/08-report-coverage-matrix.md`](templates/08-report-coverage-matrix.md) | รายงาน 3: ตรวจอะไร / ไม่ได้ตรวจอะไร | 20 นาที |

**ความสัมพันธ์ของ ID:** Risk `R-xx` → Scenario `SC-xx` → Test case `TC-xx` → Finding `F-xx` — ทุก finding ย้อนกลับไปถึง risk ได้

## แพ็กเกจ

| แพ็กเกจ | ขอบเขต | เพดานเวลา |
|---|---|---|
| **Smoke Check** | critical flows + checklist A–D + Playwright smoke · รายงาน 06 (+ findings สั้น) | 3–4 ชม. |
| **Launch Check** | checklist A–H + test case ระดับสูง + Playwright ครบชุด · รายงาน 06–08 · retest 1 รอบ | 1–2 วัน |
| **Deep Check** | Launch + API/สิทธิ์ทุก role, accessibility ด้วยมือ, performance เบื้องต้นทุกหน้าหลัก | 3–5 วัน |

## มาตรฐานการทำงาน (ให้ได้ผลโดยไม่เวอร์)

1. **ไม่เริ่มงานจนกว่าจะได้การอนุญาตเป็นลายลักษณ์อักษร** (intake ส่วน D)
2. **แบ่งเวลาตามความเสี่ยง:** สูง ≈ 60% · กลาง ≈ 30% · ต่ำ ≈ 10% — ถ้าใกล้เพดานเวลา หยุดและบันทึกสิ่งที่ไม่ได้ตรวจใน 08 แทนการทำต่อฟรี
3. **Exploratory เป็นหลัก, script เฉพาะ critical path** — เว็บที่สร้างด้วย AI เปลี่ยนเร็ว test case ละเอียดทุกหน้าจะล้าสมัยทันที
4. **"สำเร็จ" ต้องพิสูจน์ที่ข้อมูล** ไม่ใช่ข้อความบนหน้าจอ — รีเฟรช, เปิดอีกบัญชี, ดูหลังร้าน
5. **แจ้ง Critical ทันที** ไม่ต้องรอส่งรายงาน (เช่น secret key หลุด → ให้ลูกค้า rotate key)
6. **ทุก finding มีหลักฐาน** และปิดข้อมูลส่วนบุคคล/token ก่อนส่ง
7. **Retest เพิ่มแถวใหม่ใน test run log** ไม่แก้ทับ — เห็นประวัติว่าแก้เมื่อไร
8. **หลังส่งงาน** ลบบัญชีทดสอบ ข้อมูล และหลักฐานตามที่ตกลงใน intake

## ที่มาของแนวทาง

- Risk-based testing, เทคนิคออกแบบ test, รูปแบบ defect report, exploratory testing แบบมี charter — ISTQB CTFL v4.0.1 (หัวข้อ 4.4.2, 5.2, 5.5)
- Locator, retry, trace และ accessibility testing — เอกสารทางการของ Playwright
- ตัวเลขข้อจำกัดของเครื่องมือ accessibility — Deque (2021), GOV.UK (2017) ดูรายละเอียดใน `reports/Test automation บริษัทชั้นนำ SDET.md`
- **ส่วนที่เป็นการออกแบบของเราเอง (ไม่มีแหล่งกำหนด):** แพ็กเกจและเพดานเวลา, สัดส่วนแบ่งเวลา, รายการ "จุดอ่อนของเว็บที่สร้างด้วย AI", เกณฑ์ Go/No-Go — ปรับตามที่วัดได้จากงานจริง
