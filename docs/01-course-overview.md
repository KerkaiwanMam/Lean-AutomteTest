# หลักสูตร Test Automation Engineer — จากศูนย์สู่ผู้เชี่ยวชาญ

> **QA Automation Academy** · รูปแบบการเรียนแบบ CCNA/NetAcad: โมดูล → ทฤษฎี → แล็บ → แบบทดสอบ → Skills Assessment
> เว็บฝึก: **ShopLab** (`practice-app/`) · Reference framework: `tests/playwright/`, `tests/robot/`

---

## 1. หลักสูตรนี้เหมาะกับใคร

| กลุ่มผู้เรียน | จุดเริ่ม | เส้นทางแนะนำ |
|---|---|---|
| Manual Tester ที่อยากทำ automation | เข้าใจการทดสอบ แต่เขียนโค้ดน้อย | M01–M22 ครบ (เน้น M06–M08 ให้แน่น) |
| นักศึกษา / เปลี่ยนสายงาน | ไม่มีพื้นฐาน | M01–M22 ครบ ตามลำดับ |
| Developer ที่อยากเป็น SDET | เขียนโค้ดเป็น แต่ไม่รู้หลักการทดสอบ | M01–M04 → ข้าม M06, M08 → M09–M22 |
| Automation Engineer ที่อยากเป็น Senior/Lead | ใช้เครื่องมือเป็นแล้ว | M02, M15–M22 |

## 2. ผลลัพธ์การเรียนรู้ของหลักสูตร (Course Learning Outcomes)

เมื่อจบหลักสูตร ผู้เรียนสามารถ:

1. **อธิบายและประยุกต์หลักการทดสอบ** (7 principles, STLC, risk-based testing) กับโปรเจกต์จริง
2. **ออกแบบ test case อย่างเป็นระบบ** ด้วย EP, BVA, Decision Table, State Transition, Pairwise
3. **เขียน automated test ที่เสถียร** ด้วย Playwright (TypeScript) และ Robot Framework (Browser/Requests/Database)
4. **ออกแบบ test framework** ที่ดูแลง่าย: layered architecture, Page Object/Component, fixtures, test data builders, config ต่อ environment
5. **ทดสอบ API และ database** รวมถึง contract testing
6. **นำ automation เข้า CI/CD** พร้อม parallel run, report, artifact และจัดการ flaky test
7. **ทดสอบ non-functional** เบื้องต้น: performance (k6), accessibility (axe), visual, security (OWASP)
8. **วางกลยุทธ์คุณภาพ** วัดผลด้วย metrics และสื่อสารกับทีม/ผู้บริหารได้ในฐานะ QA Lead

## 3. โครงสร้างหลักสูตร (5 Levels · 22 Modules · ~140 ชั่วโมง)

| Level | Module | ชื่อ | ชม.* | ความสำคัญ |
|---|---|---|---|---|
| **1 Foundations** | [M01](modules/M01-testing-fundamentals.md) | Software Testing Fundamentals | 4 | P0 |
| | [M02](modules/M02-test-design-techniques.md) | Test Design Techniques | 8 | P0 |
| | [M03](modules/M03-test-process-and-defects.md) | Test Process, Documentation & Defect Management | 5 | P0 |
| | [M04](modules/M04-agile-devops-test-pyramid.md) | Agile, DevOps & Test Pyramid | 4 | P0 |
| | | 🏁 **Skills Assessment 1** — ออกแบบ test suite จาก REQUIREMENTS.md | 3 | |
| **2 Automation Foundations** | [M05](modules/M05-automation-strategy.md) | Automation Strategy & Tool Selection | 4 | P0 |
| | [M06](modules/M06-toolchain-git-cli.md) | Tester's Toolchain: Git, CLI, VS Code | 5 | P1 |
| | [M07](modules/M07-web-fundamentals-locators.md) | Web Fundamentals: DOM, Locators, HTTP, DevTools | 8 | P0 |
| | [M08](modules/M08-programming-for-testers.md) | Programming for Testers (TypeScript & Python) | 10 | P1 |
| | | 🏁 **Skills Assessment 2** — locator challenge + script แรก | 2 | |
| **3 Tools** | [M09](modules/M09-playwright-fundamentals.md) | Playwright Fundamentals | 8 | P0 |
| | [M10](modules/M10-playwright-advanced.md) | Playwright Advanced | 10 | P0 |
| | [M11](modules/M11-robot-framework-fundamentals.md) | Robot Framework Fundamentals | 8 | P0 |
| | [M12](modules/M12-robot-framework-advanced.md) | Robot Framework Advanced | 8 | P0 |
| | [M13](modules/M13-api-testing.md) | API & Contract Testing | 8 | P1 |
| | [M14](modules/M14-database-data-testing.md) | Database & Data Testing | 4 | P1 |
| | | 🏁 **Skills Assessment 3** — automate ShopLab checkout ด้วย 2 เครื่องมือ | 4 | |
| **4 Engineering** | [M15](modules/M15-framework-architecture.md) | Test Framework Architecture & Design Patterns | 10 | P0 |
| | [M16](modules/M16-test-data-environments.md) | Test Data & Environment Management | 5 | P0 |
| | [M17](modules/M17-flaky-tests-debugging.md) | Reliability: Flaky Tests & Debugging | 5 | P1 |
| | [M18](modules/M18-ci-cd-reporting.md) | CI/CD, Docker, Parallelism & Reporting | 8 | P1 |
| | [M19](modules/M19-non-functional-testing.md) | Performance, Accessibility, Visual, Security, Mobile | 10 | P2 |
| | | 🏁 **Skills Assessment 4** — framework review + pipeline | 3 | |
| **5 Expert** | [M20](modules/M20-quality-strategy-leadership.md) | Quality Strategy, Metrics & Leadership | 6 | P2 |
| | [M21](modules/M21-ai-assisted-testing.md) | AI-Assisted Testing | 4 | P2 |
| | [M22](modules/M22-capstone-and-career.md) | Capstone Project, Final Exam & Career | 16 | P0 |

\* ชั่วโมงรวมทฤษฎี + แล็บ (ไม่รวมการบ้าน)

## 4. รูปแบบของแต่ละโมดูล

ทุกโมดูลมีโครงสร้างเดียวกัน (เหมือน chapter ของ NetAcad):

1. **🎯 Learning Objectives** — สิ่งที่ต้องทำได้หลังจบบท (วัดผลได้)
2. **📖 Theory** — แนวคิด + เหตุผลว่า "ทำไม"
3. **💡 Worked Example** — ตัวอย่างบน ShopLab อ้างอิงโค้ดใน reference framework
4. **🧪 Labs** — โจทย์ลงมือทำบน ShopLab พร้อมเกณฑ์ผ่าน
5. **✅ Check Your Understanding** — แบบทดสอบท้ายบท (เฉลยซ่อนใน `<details>`)
6. **📋 Skills Checklist** — checklist ประเมินตนเอง
7. **🚀 Real-world Notes** — ข้อควรรู้เมื่อทำในบริษัทจริง

## 5. การประเมินผล

| องค์ประกอบ | น้ำหนัก | รายละเอียด |
|---|---|---|
| Quizzes ท้ายโมดูล | 15% | ผ่านที่ ≥ 80% (ทำซ้ำได้) |
| Labs | 25% | ส่งโค้ด/เอกสาร ตาม checklist ของแต่ละแล็บ |
| Skills Assessments (4 ครั้ง) | 25% | งานปฏิบัติจับเวลา เหมือน Practical Exam |
| Capstone Project | 35% | สร้าง framework ครบวงจร + นำเสนอ (ดู M22) |

**เกณฑ์จบหลักสูตร:** คะแนนรวม ≥ 75% และ Capstone ต้องจับบั๊กใน Bug Mode ได้ ≥ 10 จาก 13 ตัว

## 6. Competency Matrix (ใช้ประเมินตนเอง / ใช้ในการสัมภาษณ์งาน)

| ทักษะ | Junior | Mid | Senior | Lead / Expert |
|---|---|---|---|---|
| Test design | ใช้ EP/BVA ได้ | ใช้ decision table, state transition ได้เหมาะสม | เลือกเทคนิคตามความเสี่ยง | สอน/รีวิว test design ของทีม |
| Automation coding | เขียน test ตามตัวอย่าง | เขียน test เสถียร ใช้ POM/fixtures | ออกแบบ framework ใหม่ได้ | กำหนด standard, code review |
| Locators & waits | ใช้ locator ที่ tool แนะนำ | เลือก locator ทนทาน ไม่ใช้ sleep | วิเคราะห์ flaky root cause | วาง testability guideline ร่วมกับ dev |
| API/DB | เรียก API ด้วย Postman | เขียน API test อัตโนมัติ | contract test, data setup ผ่าน API | ออกแบบ test strategy ระดับระบบ |
| CI/CD | รัน test บนเครื่อง | รันบน pipeline อ่าน report ได้ | parallel/sharding, quarantine | quality gate, DORA/metrics |
| Non-functional | รู้จัก | รัน axe/k6 ตามตัวอย่าง | ออกแบบ performance scenario | รับผิดชอบ NFR ของผลิตภัณฑ์ |
| Communication | เขียน bug report ชัด | รายงานผลทดสอบ | นำ 3-amigos, risk workshop | สื่อสารกับผู้บริหาร, mentor |

## 7. แผนการเรียน 12 สัปดาห์ (part-time ~12 ชม./สัปดาห์)

| สัปดาห์ | โมดูล | ผลงานที่ต้องส่ง |
|---|---|---|
| 1 | M01, M02 (ครึ่งแรก) | Lab 02.1–02.2 |
| 2 | M02 (ต่อ), M03, M04 | Test plan + test cases ของ ShopLab · **SA1** |
| 3 | M05, M06 | Automation candidate list, repo แรกบน Git |
| 4 | M07, M08 | Locator challenge · **SA2** |
| 5 | M09 | Playwright: login + catalog tests |
| 6 | M10 | Playwright: POM, fixtures, API setup, mocking |
| 7 | M11, M12 | Robot: keyword-driven + data-driven + custom library |
| 8 | M13, M14 | API + DB suite · **SA3** |
| 9 | M15, M16 | Refactor framework ตาม architecture review |
| 10 | M17, M18 | Pipeline + report · **SA4** |
| 11 | M19, M20, M21 | a11y/perf report, test strategy document |
| 12 | M22 | Capstone + presentation |

## 8. เตรียมเครื่องสำหรับแล็บ (Lab Environment)

| เครื่องมือ | เวอร์ชันขั้นต่ำ | ใช้ใน |
|---|---|---|
| Node.js | 22.13+ (แนะนำ 24 LTS) | ShopLab, Playwright |
| Python | 3.10+ (แนะนำ 3.12+) | Robot Framework |
| Git | 2.40+ | ทุกโมดูล |
| VS Code + extensions: Playwright Test, Robot Code, ESLint | ล่าสุด | ทุกโมดูล |
| Google Chrome | ล่าสุด | UI tests |
| Postman / Newman | ล่าสุด | M13 |
| k6 | ล่าสุด | M19 |
| Docker Desktop (optional) | ล่าสุด | M18 |

ขั้นตอนติดตั้งดูที่ [README.md](../README.md#quick-start)

## 9. การใช้ ShopLab ในการเรียน

- **Reset ข้อมูลก่อนเริ่มแล็บทุกครั้ง:** `POST /api/test/reset` (หรือ `npm run reset --prefix practice-app`)
- **Requirement ของระบบ:** [practice-app/REQUIREMENTS.md](../practice-app/REQUIREMENTS.md) — ใช้แทนเอกสาร BRD/SRS ในบริษัทจริง
- **Bug Mode:** เปิดด้วย `POST /api/test/config {"bugMode": true}` — มีบั๊กฝังไว้ 13 ตัว (ผู้สอนดูเฉลยที่ [instructor/bug-catalogue.md](instructor/bug-catalogue.md))
- **Chaos:** `{"latencyMs": 800}` ทำให้ API ช้า · `{"failureRate": 0.3}` ทำให้ list สินค้า fail 30% — ใช้ฝึก waits/retry/flaky
- **Elements Lab:** `/lab` — รวม UI ที่ automate ยาก 15 แบบ
- **API docs:** `/api-docs` และ `/api/openapi.json`

## 10. การจับคู่กับใบรับรอง (Certification Mapping)

| ใบรับรอง | โมดูลที่ครอบคลุม |
|---|---|
| ISTQB Certified Tester Foundation Level (CTFL v4) | M01–M05 |
| ISTQB Test Automation Engineering (CTAL-TAE) | M05, M15–M18, M20 |
| ISTQB Foundation Level Agile Tester (CTFL-AT) | M04 |
| ISTQB Test Automation Strategy (CT-TAS, Specialist — ต้องมี Foundation Level v4.0 หรือรุ่นก่อนหน้า และประสบการณ์ที่เหมาะสม) | M05, M20 |
| Robot Framework Certified Professional (RFCP) — Robot Framework Foundation | M11, M12 |
| Playwright — ไม่พบใบรับรองทางการจาก Microsoft/ทีม Playwright (มีเฉพาะของผู้ให้บริการรายอื่น) — ใช้ Capstone เป็น portfolio | M09, M10, M22 |
