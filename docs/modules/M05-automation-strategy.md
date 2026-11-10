# M05 — Automation Strategy & Tool Selection

> **Level 2 · Automation Foundations** · ⏱ 4 ชม. · Prerequisite: Level 1 · ISTQB CTAL-TAE บทที่ 1–2

## 🎯 Learning Objectives
1. ตัดสินใจว่า test ใด **ควร / ไม่ควร** automate ด้วยเกณฑ์ที่วัดได้
2. คำนวณ **ROI** ของ automation แบบง่าย
3. เปรียบเทียบเครื่องมือ (Playwright, Robot Framework, Selenium, Cypress, Postman, k6…) และเลือกให้เหมาะกับบริบท
4. อธิบาย **Generic Test Automation Architecture (gTAA)**
5. วาง **automation roadmap** ระยะ 3–6 เดือนสำหรับทีม

---

## 📖 1. Automation ไม่ใช่การแทน tester
Automation = **การตรวจสอบซ้ำ (checking)** ที่รวดเร็วและแม่นยำ · Testing = **การคิด สำรวจ และเรียนรู้** ซึ่งยังต้องใช้คน
เป้าหมายของ automation: **feedback เร็ว**, **regression ไว้ใจได้**, ปลดคนไปทำงานที่ต้องใช้สมอง

## 📖 2. ควร automate อะไร — Automation Candidate Scoring

| เกณฑ์ (1–5) | คำถาม |
|---|---|
| ความถี่ | รันบ่อยแค่ไหน (ทุก PR? ทุก release?) |
| ความเสี่ยง/ผลกระทบ | ถ้าพัง ธุรกิจเสียหายแค่ไหน |
| ความเสถียรของฟีเจอร์ | UI/logic เปลี่ยนบ่อยไหม (เปลี่ยนบ่อย = คะแนนต่ำ) |
| ความง่ายในการ automate | มี locator/API/test data ไหม |
| เวลาที่ใช้แบบ manual | ยิ่งนาน/น่าเบื่อ ยิ่งคุ้ม |
| Determinism | ผลลัพธ์ตรวจสอบได้ชัดเจนไหม |

**ควร automate:** smoke, regression ของ flow หลัก (login, checkout), business rules (pricing), data-driven (หลายชุดข้อมูล), API, cross-browser
**ไม่ควร (หรือยังไม่ควร):** ฟีเจอร์ที่ UI ยังเปลี่ยนทุกวัน, usability/look & feel, ทดสอบครั้งเดียว, งานที่ต้องการวิจารณญาณ (exploratory), CAPTCHA/2FA จริง (ให้ใช้ test hook แทน)

## 📖 3. ROI แบบง่าย
```
ต้นทุน automation  = เวลาสร้าง + (เวลาดูแลต่อรอบ × จำนวนรอบ)
ต้นทุน manual      = เวลารัน manual × จำนวนรอบ
จุดคุ้มทุน (รอบ)    = เวลาสร้าง ÷ (เวลา manual − เวลาดูแลต่อรอบ)
```
ตัวอย่าง: regression checkout manual 2 ชม./รอบ · สร้าง automation 16 ชม. · ดูแล 0.25 ชม./รอบ → คุ้มทุนหลัง ≈ 9 รอบ (ถ้ารันทุกวัน = 2 สัปดาห์)
> ROI ที่ไม่ใช่ตัวเงิน: feedback ใน 10 นาทีแทน 2 วัน, ความมั่นใจในการ refactor, release ถี่ขึ้น

## 📖 4. เปรียบเทียบเครื่องมือ (2026)

| เครื่องมือ | ภาษา | จุดเด่น | ข้อจำกัด | เหมาะกับ |
|---|---|---|---|---|
| **Playwright** | TS/JS, Python, Java, .NET | auto-wait, multi-browser, API testing, trace viewer, เร็ว, parallel ในตัว | ต้องเขียนโค้ด | ทีมที่มี dev/SDET, web app สมัยใหม่ |
| **Robot Framework** | keyword (Python ข้างหลัง) | อ่านง่ายสำหรับ non-programmer, library เยอะ (Browser, Selenium, Requests, DB, SSH, Appium), report สวย | logic ซับซ้อนเขียนยาก, ต้องออกแบบ keyword ดีๆ | ทีม QA ผสม, องค์กรใหญ่, ทดสอบหลายระบบ (web+API+DB+mainframe/SSH) |
| **Selenium WebDriver** | หลายภาษา | มาตรฐาน W3C, ecosystem ใหญ่, Grid | ต้องจัดการ wait เอง, ช้ากว่า | legacy project, องค์กรที่ลงทุนไปแล้ว |
| **Cypress** | JS/TS | DX ดี, time-travel debug | multi-tab/iframe ข้าม origin จำกัด | frontend team |
| **Postman/Newman** | JS (scripts) | ง่าย, ใช้ร่วมกับ dev/BA | ไม่เหมาะกับ logic ซับซ้อน | API exploratory + smoke |
| **k6 / JMeter / Gatling** | JS / GUI / Scala | performance | – | load/stress |
| **Appium** | หลายภาษา | mobile native/hybrid | setup ยาก | mobile |

**เกณฑ์เลือกเครื่องมือ:** ทักษะของทีม · ภาษาที่ dev ใช้ (ช่วยกัน review ได้) · ประเภทแอป · การ integrate กับ CI/test management · ชุมชน/license · ความเร็ว · การรองรับ browser/device ที่ต้องการ

> หลักสูตรนี้สอนทั้ง Playwright (code-first) และ Robot Framework (keyword-driven) เพราะในตลาดงานไทยพบทั้งสองแบบมาก และ Robot Browser library ใช้ Playwright เป็น engine — ความรู้ต่อยอดกันได้

## 📖 5. Generic Test Automation Architecture (gTAA)

```
┌───────────────────────────────────────────────────────────┐
│  Test Generation    — test cases, data, models            │
├───────────────────────────────────────────────────────────┤
│  Test Definition    — test scripts, keywords, BDD specs   │  tests/*.spec.ts, *.robot
├───────────────────────────────────────────────────────────┤
│  Test Execution     — runner, fixtures, parallel, report  │  Playwright Test, Robot/pabot
├───────────────────────────────────────────────────────────┤
│  Test Adaptation    — page objects, API clients, drivers  │  src/pages, src/api, resources/
└───────────────────────────────────────────────────────────┘
                     ▼   System Under Test (ShopLab)
```
> ISTQB CTAL-TAE **v2.0** (2024) เรียกทั้ง 4 ส่วนว่า **capabilities** ของ gTAA (ฉบับเก่าเรียก layers) และระบุว่า *Test Generation เป็น capability ที่ไม่บังคับ* นอกจากนี้ gTAA ยังกำหนด **interfaces** 4 ทาง คือ SUT, project management, test management และ configuration management (CI/CD, environments, testware)
หลักการสำคัญ: **แยกชั้น** — test ไม่ควรรู้ว่า locator คืออะไร หรือ HTTP เรียกอย่างไร (ลงลึกใน M15)

## 📖 6. Automation Roadmap ตัวอย่าง (ทีมเริ่มจากศูนย์)

| ช่วง | เป้าหมาย | ตัวชี้วัด |
|---|---|---|
| เดือน 1 | เลือก tool, PoC, framework skeleton, smoke 10 tests ใน CI | smoke รันทุก PR < 5 นาที |
| เดือน 2–3 | API tests ของ business rule หลัก, UI regression flow สำคัญ 30 tests | flaky rate < 2% |
| เดือน 4–6 | data-driven, cross-browser, report → test management, test data API | regression manual ลด 60% |
| ต่อเนื่อง | non-functional, contract tests, ขยายให้ dev เขียน test ร่วม | change failure rate ลด |

---

## 🧪 Lab 05.1 — Automation candidate scoring (45 นาที)
ให้คะแนน test case จาก Lab 02/03 อย่างน้อย 15 ตัว ตามตารางเกณฑ์ เลือก top 10 ที่จะ automate และระบุ **ชั้น** (unit/API/UI)

## 🧪 Lab 05.2 — Tool selection ADR (45 นาที)
เขียน **Architecture Decision Record** (ADR) 1 หน้า: "เลือกเครื่องมือ automation สำหรับบริษัท X" (บริบท: ทีม QA 5 คน เขียนโค้ดได้ 2 คน, ทดสอบ web + API + database, ใช้ Jenkins) — ระบุ options, decision, consequences

---

## ✅ Check Your Understanding
1. ฟีเจอร์ใหม่ที่ designer ยังปรับ layout ทุก sprint ควร automate UI ทันทีไหม? ทำอย่างไรแทน?
2. ทำไม "จำนวน test ที่ automate" ไม่ใช่ตัวชี้วัดที่ดีของความสำเร็จ?
3. ชั้นใดของ gTAA ที่ต้องแก้เมื่อ UI เปลี่ยน id ของปุ่ม?
4. ทีมมีแต่ manual tester ที่ไม่ถนัดโค้ด ต้องทดสอบ web + REST + SSH — เครื่องมือใดเหมาะ?

<details><summary>เฉลย</summary>

1. ยังไม่ควร automate UI — automate ที่ API/logic ก่อน และใช้ exploratory/manual กับ UI จนกว่าจะนิ่ง
2. test จำนวนมากที่ไม่จับบั๊ก/เปราะ/ช้า ไม่มีคุณค่า — ควรดู feedback time, bugs caught, flaky rate, maintenance cost
3. Test Adaptation layer (page object / locator) — test definition ไม่ต้องแก้
4. Robot Framework (Browser/Selenium + RequestsLibrary + SSHLibrary) — keyword อ่านง่าย มีคน 1–2 คนสร้าง keyword library ให้ทีม
</details>

## 📋 Skills Checklist
- [ ] ให้คะแนนและเลือก automation candidates ได้อย่างมีเหตุผล
- [ ] คำนวณจุดคุ้มทุนของ automation ได้
- [ ] เปรียบเทียบเครื่องมือหลักได้ และเขียน ADR ได้
- [ ] อธิบาย 4 ชั้นของ gTAA และ map กับ repo นี้ได้

## 🚀 Real-world Notes
- เริ่ม **PoC 1–2 สัปดาห์** กับ flow ที่ยากที่สุดของระบบจริง (login SSO, iframe ชำระเงิน) ก่อนตัดสินใจเครื่องมือ
- คุยกับ dev เรื่อง **testability** ตั้งแต่ต้น: `data-testid`, test hooks (reset/seed), feature flags, API สำหรับเตรียมข้อมูล — ShopLab คือตัวอย่างระบบที่ "ออกแบบมาให้ทดสอบได้"
