# 00 — แผนงานโครงการ (Project Plan)

## 1. โจทย์ที่เรียบเรียงใหม่

> **สร้างหลักสูตร “Test Automation Engineer: จากศูนย์สู่ผู้เชี่ยวชาญ”** ในรูปแบบการเรียนการสอนแบบ CCNA / Cisco NetAcad หรือคอร์สของบริษัทชั้นนำ
> คือแบ่งเป็นโมดูล มีวัตถุประสงค์การเรียนรู้ ทฤษฎี แล็บลงมือทำ แบบทดสอบท้ายบท และการสอบวัดทักษะ (Skills Assessment)
>
> **เนื้อหาต้องครอบคลุม**
> 1. หลักการทดสอบซอฟต์แวร์ตั้งแต่พื้นฐาน (ทฤษฎี, เทคนิคออกแบบ test case, กระบวนการ, เอกสาร)
> 2. การใช้เครื่องมือ Automation หลัก — **Playwright** และ **Robot Framework** — รวมถึงเครื่องมืออื่นที่ใช้จริงในอุตสาหกรรม (API, Performance, Accessibility, Security, CI/CD)
> 3. ทักษะ **การออกแบบโครงสร้าง (Framework Design / Test Architecture)** เพื่อให้นำไปใช้ในบริษัทหรือโปรเจกต์จริงได้
> 4. ทักษะระดับผู้เชี่ยวชาญ: กลยุทธ์คุณภาพ, การวัดผล, การแก้ flaky test, การเป็น QA Lead
>
> **ข้อจำกัด:** ไม่ใช้เนื้อหาใดๆ จาก `sunline-eps-tests`
>
> **ต้องมีเว็บไซต์ตัวอย่างสำหรับฝึก** (สร้างขึ้นเอง) ที่รองรับการฝึกได้ครบทุกโมดูล ทั้ง UI, API, Database, กรณีทดสอบยากๆ (iframe, shadow DOM, dynamic element, upload/download ฯลฯ) และใช้กับเครื่องมือ automation ได้ทุกตัว
>
> **ให้ผู้ทำงาน (Claude)**: วางแผน จัดลำดับความสำคัญ เติมหัวข้อ/ทักษะที่ขาด ระบุส่วนที่จะเพิ่มในอนาคต แล้วลงมือสร้าง

---

## 2. ผลลัพธ์ที่ส่งมอบ (Deliverables)

| # | สิ่งที่ส่งมอบ | ตำแหน่ง | สถานะ |
|---|---|---|---|
| D1 | แผนงาน + การวิเคราะห์ช่องว่าง (เอกสารนี้) | `docs/00-project-plan.md` | ✅ |
| D2 | ภาพรวมหลักสูตร, Learning Path, เกณฑ์ประเมิน, Competency Matrix | `docs/01-course-overview.md` | ✅ |
| D3 | คู่มือ 22 โมดูล (ทฤษฎี + แล็บ + แบบทดสอบ) | `docs/modules/` | ✅ |
| D4 | เว็บฝึก **ShopLab** (E-commerce + Back-office + Elements Lab + REST API + SQLite) | `practice-app/` | ✅ |
| D5 | Reference Framework — Playwright (TypeScript, POM, fixtures, API, a11y) | `tests/playwright/` | ✅ |
| D6 | Reference Framework — Robot Framework (Browser lib, Requests, Database, custom Python library) | `tests/robot/` | ✅ |
| D7 | API collection (Postman/Newman) + Performance script (k6) | `tests/postman/`, `tests/performance/` | ✅ |
| D8 | CI/CD pipeline ตัวอย่าง (GitHub Actions) + Dockerfile | `.github/workflows/`, `practice-app/Dockerfile` | ✅ |
| D9 | Templates เอกสาร QA (Test Plan, Test Case, Bug Report, Strategy, Summary Report) | `docs/templates/` | ✅ |
| D10 | Cheat sheets + เฉลยสำหรับผู้สอน (Bug catalogue) | `docs/cheatsheets/`, `docs/instructor/` | ✅ |

---

## 3. การจัดลำดับความสำคัญ (Prioritization)

ใช้หลัก **MoSCoW** ร่วมกับ “ลำดับการพึ่งพา” (สิ่งที่โมดูลอื่นต้องใช้ ต้องสร้างก่อน)

| ลำดับ | ความสำคัญ | งาน | เหตุผล |
|---|---|---|---|
| 1 | **P0 Must** | เว็บฝึก ShopLab + Reset API + Seed data | ทุกแล็บพึ่งพาสิ่งนี้ ถ้าไม่มีเว็บที่ deterministic ก็สอน automation ไม่ได้ |
| 2 | **P0 Must** | หลักการทดสอบ + Test Design Techniques (M01–M04) | Automation ที่ดีเริ่มจาก test case ที่ดี — คนส่วนใหญ่ข้ามส่วนนี้แล้วได้ script ที่ไม่มีคุณค่า |
| 3 | **P0 Must** | Playwright + Robot Framework (M09–M12) | เครื่องมือหลักตามโจทย์ |
| 4 | **P0 Must** | Framework Design & Architecture (M15–M16) | โจทย์เน้น “ทักษะ design โครงสร้าง” และ “ใช้ในบริษัทได้จริง” |
| 5 | **P1 Should** | Web/HTTP fundamentals, Programming for testers (M06–M08) | พื้นฐานที่ทำให้เขียน locator และ debug ได้ด้วยตัวเอง |
| 6 | **P1 Should** | API + Database testing (M13–M14) | งานจริงในบริษัทจำนวนมากเป็น API/Integration และ business rule ทดสอบที่ API ได้เร็วและเสถียรกว่า UI |
| 7 | **P1 Should** | Flaky tests, CI/CD, Reporting (M17–M18) | แยก “คนเขียน script” ออกจาก “Automation Engineer” |
| 8 | **P2 Could** | Non-functional: Performance, A11y, Visual, Security, Mobile (M19) | ขยายขอบเขตสู่ระดับผู้เชี่ยวชาญ |
| 9 | **P2 Could** | Quality Leadership, AI in Testing (M20–M21) | ระดับ Senior/Lead |
| 10 | **P0 Must** | Capstone + Skills Assessment (M22) | พิสูจน์ว่าทำได้จริง (เหมือน Practical Exam ของ CCNA) |

---

## 4. การวิเคราะห์ช่องว่าง (Gap Analysis) — หัวข้อ/ทักษะที่เพิ่มเข้ามา

โจทย์เดิมระบุ “หลักการ test + Robot + Playwright + อื่นๆ + design โครงสร้าง” — สิ่งที่มักขาดหายในคอร์สทั่วไป และถูกเพิ่มในหลักสูตรนี้:

| หัวข้อที่เพิ่ม | ทำไมสำคัญ | อยู่ในโมดูล |
|---|---|---|
| Test Design Techniques เชิงลึก (EP, BVA, Decision Table, State Transition, Pairwise) | เป็นทักษะที่แยก Tester มืออาชีพออกจากคนคลิกตาม | M02 |
| การเขียน Bug Report และ Defect Lifecycle | ทักษะสื่อสารที่ใช้ทุกวัน | M03 |
| Web fundamentals: DOM, HTTP, Cookie/Session, DevTools | ไม่เข้าใจเว็บ = เขียน locator/debug ไม่ได้ | M07 |
| Locator Strategy (และการคุยกับ Dev เรื่อง `data-testid`) | สาเหตุอันดับ 1 ของ test เปราะ | M07, M09 |
| Git workflow + Code Review สำหรับ test code | Test code คือ production code | M06, M20 |
| Test Data Management & Environment Strategy | สาเหตุอันดับ 2 ของ flaky test | M16 |
| Flaky Test Analysis & Quarantine | ปัญหาจริงในทุกบริษัท | M17 |
| API Contract Testing (OpenAPI / JSON Schema) | ลดการพึ่ง UI test ที่ช้า | M13 |
| Database Verification | ตรวจว่าข้อมูลถูกบันทึกจริง | M14 |
| CI/CD, Docker, Parallel/Sharding, Reporting | Automation ที่ไม่ได้รันใน pipeline = ไม่มีคุณค่า | M18 |
| Accessibility (axe), Visual Regression, Performance (k6), Security (OWASP) | ทักษะระดับผู้เชี่ยวชาญ/ค่าตัวสูง | M19 |
| Metrics, ROI, Risk-based Testing, Test Strategy | ทักษะระดับ Lead | M20 |
| AI-assisted Testing (Copilot/Claude, Playwright MCP, self-healing) — และข้อควรระวัง | เทรนด์ปี 2025–2026 | M21 |
| Portfolio, Interview Prep, Career Path | ช่วยให้นำไปใช้หางาน/เลื่อนตำแหน่ง | M22 |
| **Bug Mode** ในเว็บฝึก — บั๊กที่ฝังไว้ให้หา | ฝึก exploratory testing และพิสูจน์ว่า automation “จับบั๊กได้จริง” | ทุกโมดูล |

---

## 5. การออกแบบเว็บฝึก ShopLab (Design Decisions)

| การตัดสินใจ | ทางเลือกที่เลือก | เหตุผล |
|---|---|---|
| ประเภทเว็บ | E-commerce + Admin back-office | ทุกคนเข้าใจ domain, มี business rule ให้ออกแบบ test เยอะ (ส่วนลด, ภาษี, ค่าส่ง, สิทธิ์ผู้ใช้) |
| Stack | Node.js + Express + SQLite (`node:sqlite` built-in) + HTML/JS ล้วน | ไม่ต้อง build, ไม่ต้องติดตั้ง DB, เปิดอ่าน source ได้ง่าย |
| ข้อมูล | Seed คงที่ + `POST /api/test/reset` | Test ต้อง deterministic และ isolate กันได้ |
| Locator | หน้าหลักมี `data-testid`; บางหน้า (Elements Lab) จงใจไม่มี | ฝึกทั้งแบบ “ดี” และ “ยากแบบโลกจริง” |
| Bug Mode | เปิด/ปิดผ่าน `POST /api/test/config` หรือ env `BUG_MODE=1` | ใช้สอน regression: test ต้อง pass ตอนปิด และ fail ตอนเปิด |
| Chaos | ตั้ง latency / random failure ได้ | ฝึกการรอ (waits), retry, flaky analysis |
| API | REST + OpenAPI spec + Bearer token | ฝึก API testing, contract testing, ใช้ API เตรียมข้อมูลให้ UI test |
| ภาษา | UI ภาษาไทย/อังกฤษ สลับได้ | ฝึก i18n testing |

---

## 6. Roadmap การพัฒนาต่อ (ส่วนที่วางแผนจะเพิ่ม)

| เฟส | สิ่งที่จะเพิ่ม | ประโยชน์ |
|---|---|---|
| v1.1 | วิดีโอ/สไลด์ประกอบต่อโมดูล, แบบทดสอบออนไลน์ | ใช้สอนในห้องเรียนได้ทันที |
| v1.2 | GraphQL endpoint + WebSocket (แชทสด/แจ้งเตือน) ใน ShopLab | ฝึก GraphQL และ real-time testing |
| v1.3 | Mobile app (React Native/Flutter) ที่เรียก API เดียวกัน + Appium labs | ขยายสู่ Mobile Automation |
| v1.4 | Microservices + Message Queue (Kafka/RabbitMQ) จำลอง | ฝึก integration/contract testing (Pact) |
| v1.5 | Test management integration (Jira/Xray, TestRail) ตัวอย่าง | เชื่อมกับกระบวนการบริษัท |
| v2.0 | ระบบ auto-grading สำหรับ Capstone (รัน test ของผู้เรียนกับ Bug Mode แล้วให้คะแนน) | ประเมินผลแบบอัตโนมัติ |

---

## 7. Definition of Done

- [x] เว็บ ShopLab รันได้ด้วยคำสั่งเดียว (`npm start`) และ reset ข้อมูลได้
- [x] Reference test suite ของ Playwright และ Robot Framework รันผ่านกับ ShopLab (Bug Mode ปิด)
- [x] เมื่อเปิด Bug Mode test บางตัวต้อง fail (พิสูจน์ว่า test มีคุณค่า)
- [x] ทุกโมดูลมี: Learning Objectives → ทฤษฎี → ตัวอย่าง → Lab (บน ShopLab) → Quiz → Checklist
- [x] ไม่มีเนื้อหาจาก `sunline-eps-tests`
