# Content Audit Report — Quality Engineering & Test Automation

> **วันที่ตรวจ:** 2026-11-10 · **ผู้ตรวจ:** Claude (ตาม workflow 4 ขั้นใน `CLAUDE.md`)
> **ครอบคลุม:** Phase 1 Content Audit · Phase 2 Gap Analysis · Phase 3 Improvement Proposal · Phase 5 Reference & Technical Validation
> **ผลลัพธ์ที่ต่อจากรายงานนี้:** [Master Curriculum v2.0](../02-master-curriculum.md) (Phase 4 และ 6)

## 0. ขอบเขต วิธีตรวจ และข้อจำกัด

### 0.1 ไฟล์ที่ได้รับ และบทบาทของแต่ละไฟล์

| # | ไฟล์ | บทบาท | หมายเหตุ |
|---|---|---|---|
| 1 | `quality-engineering-test-automation-roadmap-revised.md` (แนบมา 1 ไฟล์ · 800 บรรทัด) | **Roadmap หลัก** — โครงสร้าง 16 Chapters ที่ใช้เป็นเกณฑ์เทียบ | เก็บสำเนาไว้ที่ `2. reference folder/inputs/` โดยไม่แก้ไข |
| 2 | เนื้อหาใน repository นี้ (`docs/`, `practice-app/`, `tests/`) | **เนื้อหาที่ต้อง Audit** — หลักสูตร v1.0 จำนวน 22 modules พร้อมเว็บฝึก ShopLab และ reference framework | ไม่ได้แนบมาในข้อความ แต่เป็นเนื้อหาปัจจุบันของโครงการตาม `1. memory folder/project-context.md` |

**ข้อสังเกต:** ในข้อความมีไฟล์แนบเพียง 1 ไฟล์ คือ Roadmap จึงถือว่า "เนื้อหาการเรียนที่มีอยู่ในปัจจุบัน" หมายถึงหลักสูตรใน repository นี้ หากมีเอกสารชุดอื่นที่ต้องการให้ตรวจด้วย (เช่น สไลด์ หรือโน้ตนอก repository) ยังไม่ได้รับและไม่ได้นำมาประเมิน

หนังสือ 2 เล่มที่ระบุในคำสั่ง (*Designing Data & AI Sovereignty* และ *Software-Architekturmuster, Antimuster und Fallstricke*) **ไม่ได้รับไฟล์หรือข้อมูลบรรณานุกรม** และค้นหาชื่อตรงตัวไม่พบ (ดูหัวข้อ 8.3)

### 0.2 วิธีตรวจ

1. อ่านเนื้อหาเต็มของ Roadmap, 22 modules, `00-project-plan.md`, `01-course-overview.md` และ `references.md` (ไม่ได้ตัดสินจากชื่อหัวข้อ)
2. รัน `content_inventory.py` (รายการไฟล์) และ `roadmap_coverage.py` (สัญญาณเชิงกลว่าคำใน Roadmap ปรากฏใน module ใด) — ใช้เป็นจุดเริ่มเท่านั้น สถานะทุกแถวในรายงานนี้กำหนดจากการอ่านเนื้อหา
3. ตรวจข้อเท็จจริงกับเอกสารทางการที่เปิดอ่านใน session นี้ (หัวข้อ 8) — รายการใดไม่ได้เปิดอ่านจะระบุว่า "ยังไม่ได้ตรวจ"

### 0.3 นิยามสถานะ

| สถานะ | ความหมายในรายงานนี้ |
|---|---|
| Complete | มีคำอธิบาย ตัวอย่าง และแบบฝึก ครบพอสำหรับหัวข้อนั้น และไม่พบข้อผิดพลาด |
| Partial | มีเนื้อหา แต่ขาดรายละเอียด ขาดแบบฝึก หรือกล่าวถึงเพียงชื่อ |
| Missing | ไม่มีเนื้อหา |
| Duplicate | อธิบายซ้ำมากกว่าหนึ่งที่ |
| Needs Correction | ไม่ตรงกับเอกสารทางการที่ตรวจ |
| Outdated | ถูกต้องตามเอกสารรุ่นเก่า แต่ไม่ตรงกับรุ่นปัจจุบัน |
| Misplaced | มีเนื้อหา แต่อยู่ผิดลำดับการเรียนเมื่อเทียบกับ Roadmap |

### 0.4 ข้อจำกัด

- ไม่ได้รันชุดทดสอบ (Playwright, Robot, Newman) ซ้ำในรอบนี้ — ตัวอย่างโค้ดในหลักสูตรถูกประเมินโดยการอ่านและเทียบเอกสาร ผลการรันล่าสุดอยู่ใน `1. memory folder/progress.md`
- Docker ยังไม่เคยถูกรันจริงบนเครื่องนี้ (บันทึกเดิม CL-004) เนื้อหา Docker จึงยังไม่ผ่านการยืนยันด้วยการรัน
- หนังสือทั้งหมดตรวจได้เฉพาะข้อมูลบรรณานุกรม ไม่ได้เปิดอ่านเนื้อหา

---

## 1. Content Inventory

รันด้วย `python "4. script folder/content_inventory.py"` (เพิ่ม `--md` เพื่อดูรายไฟล์)

| กลุ่ม | จำนวน | ขนาด | บทบาทในการ Audit |
|---|---:|---|---|
| Roadmap (baseline) | 1 ไฟล์ | 800 บรรทัด | เกณฑ์เทียบ |
| Modules M01–M22 | 22 ไฟล์ | 73 labs · 97 quiz | เนื้อหาหลักที่ตรวจ |
| Plan และ overview | 2 ไฟล์ (+ README) | — | ตรวจโครงสร้างและลำดับ |
| Skills Assessments | 5 ไฟล์ | SA1–SA4 | ตรวจความสอดคล้องกับ Deliverable ของ Roadmap |
| Templates · Cheat sheets · Instructor keys | 6 · 3 · 3 ไฟล์ | — | เอกสารประกอบ |
| `practice-app/REQUIREMENTS.md` | 1 ไฟล์ | 119 บรรทัด | Test basis ของแบบฝึก (โดเมน e-commerce) |
| ShopLab source | 16 ไฟล์ | 1,547 บรรทัด | System under test |
| Playwright reference suite | 33 ไฟล์ | 2,179 บรรทัด | ตัวอย่างอ้างอิง |
| Robot Framework reference suite | 20 ไฟล์ | 869 บรรทัด | ตัวอย่างอ้างอิง |

**การจับคู่เบื้องต้น Roadmap ↔ Modules**

| Roadmap Chapter | Modules ที่เกี่ยวข้อง |
|---|---|
| 1 Principles & QE | M01, M04, M20 §1–2, M03 §1–2 |
| 2 Test Analysis & Design | M02, M03 §3–5, M04 §1–2 |
| 3 Programming & Technical | M06, M08, M07 §4–5, M14 §3 |
| 4 Playwright Architecture | M09 |
| 5 Locator Strategy | M07 §1–3, M09 §3–6 |
| 6 Architecture & Patterns | M10 §1–2, M15 |
| 7 API Testing with Playwright | M13, M10 §3, M14 §4 |
| 8 Debugging, Reporting, Maintenance | M09 §8, M17 §4, M18 §4, M10 §7–8 |
| 9 Robot Fundamentals | M11 |
| 10 Advanced Robot Design | M12 §1–4, §6 |
| 11 Robot Browser library | M11 §5–6, M17 §4 |
| 12 Robot API & Parallel | M13 §5, M14 §4, M12 §5 |
| 13 CI/CD & Test Operations | M18, M06 §2, M16 §5–6 |
| 14 Reliability & Optimization | M17, M16 §2, M20 §3 |
| 15 AI-Assisted QE | M21 |
| 16 Capstone | M22 |
| *(ไม่มีใน Roadmap)* | M05 Automation Strategy · M16 Test Data & Environments · M19 Non-functional · M20 §4–6 Leadership · M14 §5 Data testing |

---

## 2. Phase 1 — Content Audit ราย Chapter

### 2.1 สรุปสถานะราย Chapter

| Ch | Chapter | สถานะรวม | เหตุผลสั้น |
|---:|---|---|---|
| 1 | Software Testing Principles & QE | Partial | หลักการครบ แต่ test levels/types ใช้การจัดกลุ่มรุ่นเก่า, SDLC models และ static testing บาง, risk-based testing อยู่ท้ายหลักสูตร |
| 2 | Test Analysis & Test Design | Partial | 5 เทคนิคหลักครบและมีแบบฝึก · Use Case Testing และ Requirement Review ขาด |
| 3 | Programming & Technical Foundations | Partial | TypeScript พอใช้ · Python ขาดหลายหัวข้อ (file I/O, modules) · ไม่มี XML, JWT/OAuth |
| 4 | Playwright Architecture | Partial | การใช้งานครบ · ไม่มีคำอธิบายสถาปัตยกรรมและ process model |
| 5 | Locator Strategy | Complete | เนื้อหาตรงกับเอกสาร Playwright · โจทย์ workshop เป็นโดเมนอื่น |
| 6 | Test Architecture & Design Patterns | Partial | Pattern หลักครบ · Facade ขาด, Strategy และ SOLID ไม่ครบ |
| 7 | API Testing with Playwright | Complete | ครบทุกหัวข้อ รวม contract และ security |
| 8 | Debugging, Reporting & Maintenance | Partial | เครื่องมือครบ · การจับ console/network error และการจำแนกประเภท defect ยังบาง |
| 9 | Robot Framework Fundamentals | Partial | Syntax ครบ · standard libraries บาง · มี 1 จุดต้องแก้ |
| 10 | Advanced Robot Framework Design | Partial | โครงสร้างและ data-driven ครบ · มี 3 จุดต้องแก้ · custom reporting บาง |
| 11 | Browser Automation with Robot | Partial | Keyword ครบ · ไม่มีสถาปัตยกรรมของ Browser library |
| 12 | Robot API & Parallel Execution | Partial | RequestsLibrary และ pabot ครบ · JSON validation ฝั่ง Robot ขาด |
| 13 | CI/CD & Test Operations | Partial | Pipeline ครบ · Docker เป็นเพียงคำสั่ง · มี 2 จุดไม่ตรงคำแนะนำทางการ |
| 14 | Reliability & Optimization | Partial | Flaky ครบและมีแบบฝึกดี · การ optimize regression และ metric บางตัวขาด |
| 15 | AI-Assisted QE | Partial | ส่วน A ครบ · ส่วน B (ทดสอบระบบ AI) มีเพียงหัวข้อ ไม่มีแบบฝึกและไม่มีแหล่งอ้างอิง |
| 16 | Capstone — Banking | Missing (โดเมน) | โครง capstone และ rubric ครบ แต่เป็น ShopLab ไม่มีระบบ Lending & Payment |

### 2.2 รายละเอียดรายหัวข้อ

**Chapter 1 — Software Testing Principles & Quality Engineering**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| SDLC | Partial | M01 §5 | กล่าวถึงตำแหน่ง tester ใน SDLC บรรทัดเดียว ไม่มีคำอธิบาย SDLC models |
| Waterfall, Agile, Scrum, DevOps | Partial | M04 §1, §5 | Agile/Scrum/DevOps ครบ · Waterfall และ V-model ไม่มี |
| Software Testing Principles | Complete | M01 §2 | ชื่อหลักการตรงกับ CTFL v4.0.1 ทั้ง 7 ข้อ (REF-097) |
| Verification vs. Validation | Complete | M01 §3 | |
| Static vs. Dynamic Testing | Partial | M01 §4 | 3 บรรทัด ไม่มี review types และกระบวนการ review |
| Test Levels และ Test Types | Outdated | M01 §4 | ดู AC-01, AC-02 |
| Shift Left / Shift Right | Complete | M04 §5 | |
| Test Pyramid, Testing Quadrants | Complete | M04 §3–4 | มีหมายเหตุเรื่องตัวเลขสัดส่วนแล้ว |
| Risk-Based Testing | Misplaced | M20 §1 | เนื้อหาดี แต่อยู่ Level 5 · ไม่แยก product risk กับ project risk |
| Quality Engineering และบทบาท QA | Partial | M01 §3, M04 §1 | มี QA/QC และ whole-team แต่ไม่นิยาม Quality Engineering |
| Test process (STLC) | Needs Correction | M01 §5 | ดู AC-03 |
| Workshop: Loan Payment test strategy | Missing | — | มี Lab 20.1 (ShopLab) และ template กลยุทธ์ 14 บรรทัด |

**Chapter 2 — Test Analysis & Test Design Techniques**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| Equivalence Partitioning | Complete | M02 §2, Lab 02.1 | |
| Boundary Value Analysis | Complete | M02 §3 | นิยาม 2-value และ 3-value ตรงกับ CTFL v4.0.1 §4.2.2 |
| Decision Table Testing | Complete | M02 §4, Lab 02.2 | มี automation ต่อยอด |
| State Transition Testing | Partial | M02 §5, Lab 02.3 | เนื้อหาถูก แต่ชื่อ coverage ไม่ครบตาม syllabus (AC-04) |
| Pairwise Testing | Complete | M02 §6 | ตัวเลข 96 combinations, 66 คู่, ขั้นต่ำ 12 ตรวจคำนวณซ้ำแล้วถูกต้อง |
| Use Case Testing | Missing | M02 §1 | มีเพียงชื่อในตาราง |
| Error Guessing, Exploratory Testing | Complete | M02 §7, Lab 02.4 | |
| Requirement Review | Partial | M04 §1, M01 Lab 01.2 | มี 3 Amigos แต่ไม่มีเทคนิค review และเกณฑ์ requirement ที่ทดสอบได้ |
| Acceptance Criteria | Complete | M04 §1–2 | |
| Test Condition vs. Scenario vs. Case | Partial | M02 §8 | ใช้คำทั้งสาม แต่ไม่นิยามความต่าง |
| Traceability Matrix | Complete | M03 §3, Lab 03.2 | |
| Defect Lifecycle, Severity vs. Priority | Complete | M03 §4–5 | |
| Positive, Negative, Edge Case | Partial | M02 §2, §7 | ใช้ในตัวอย่าง ไม่มีนิยาม |
| Workshop: Loan Payment | Missing | — | แบบฝึกทั้งหมดอิง REQUIREMENTS ของ ShopLab |

**Chapter 3 — Programming & Technical Foundations**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| TS: variables, types, functions, array/object, conditions, loops | Complete | M08 §1 | เป็นตารางเทียบสองภาษา กระชับมาก |
| TS: classes, modules, async/await, Promise | Complete | M08 §3–4 | |
| TS: error handling | Partial | M08 §1 | บรรทัดเดียวในตาราง |
| TS: interfaces และ types | Partial | M08 §6 | กล่าวถึง `type` หนึ่งครั้ง ไม่มี `interface` |
| npm และ package.json | Complete | M06 §3 | |
| Python: variables, functions, list, dict | Complete | M08 §1 | |
| Python: tuple, set | Missing | — | |
| Python: classes และ OOP | Partial | M08 §2, M12 §2 | เห็นจากตัวอย่าง library เท่านั้น |
| Python: exception handling | Partial | M08 §1 | บรรทัดเดียว |
| Python: modules และ packages | Missing | — | มีเพียง venv/pip ใน M06 |
| Python: อ่านเขียน JSON / CSV | Missing | — | Lab 08.2 เรียก API แต่ไม่อ่านไฟล์ข้อมูล |
| Git และ GitHub | Complete | M06 §2, Lab 06.2 | |
| Linux Command Line | Partial | M06 §1 | ตารางเทียบ PowerShell กับ bash 5 แถว |
| HTTP / HTTPS | Partial | M07 §4 | HTTP ครบ · ไม่มี TLS/HTTPS |
| REST API | Partial | M07 §4, M13 | ใช้งานได้ แต่ไม่อธิบายหลัก REST |
| JSON และ XML | Partial | M08 §5 | JSON มี · XML ไม่มี |
| SQL และ Database | Misplaced | M14 §2–3 | เนื้อหาครบ แต่อยู่ Level 3 หลังเครื่องมือ |
| Session, Cookie, JWT, OAuth | Partial | M07 §4 | Cookie กับ token มี · โครงสร้าง JWT และ OAuth flow ไม่มี |
| Environment Variables | Complete | M06 §1, M15 §6 | |

**Chapter 4 — Introduction to Playwright Architecture**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| Browser Automation Architecture | Missing | — | M05 กล่าวถึง WebDriver เท่านั้น |
| Browser, Browser Context, Page | Partial | M09 §2 | บอกว่าแต่ละ test ได้ context ใหม่ แต่ไม่อธิบายลำดับชั้น |
| Test Runner, Configuration | Complete | M09 §1, §7 | |
| Test Discovery and Execution | Partial | M09 §9, M10 §7 | มีคำสั่งรัน · ไม่มี worker process model |
| Assertions, Locators, Auto-waiting | Complete | M09 §3–6 | actionability ตรงกับเอกสาร (REF-070) |
| Test Isolation | Complete | M09 §2, M16 §2 | |
| Projects และ Browser Configuration | Complete | M09 §7, M10 §7 | |
| Workshop: Login, Search, CRUD, Form | Partial | Lab 09.1–09.3 | ไม่มีแบบฝึก CRUD โดยตรง |

**Chapter 5 — Locator Strategy & Reliable Test Design**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| `getByRole` … `getByTestId` | Complete | M07 §2, M09 §3 | ลำดับความสำคัญตรงกับเอกสาร Playwright (REF-071) |
| CSS Selector และ XPath | Complete | M07 §2 | |
| Chaining และ Filtering | Complete | M07 §2, M09 §3 | |
| Assertions, Auto-waiting, Waiting Strategy | Complete | M09 §5–6, M17 §3 | |
| Dropdown, Dialog, Table, Dynamic Elements | Complete | M10 §6, Lab 09.3, 10.4 | |
| เนื้อหา locator ซ้ำ 3 ที่ | Duplicate | M07 §2, M09 §3, cheat sheet | M09 ระบุว่าเป็นบทสรุปจาก M07 — ยอมรับได้เมื่อรวมบท |
| Workshop: Internet Banking UI | Missing | — | มี SA2 และ Elements Lab แทน |

**Chapter 6 — Test Architecture & Design Patterns**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| Page Object Model | Complete | M10 §1, M15 §4.1 | |
| Fixture Pattern, Dependency Injection | Complete | M10 §2, M15 §4.4 | |
| Factory, Builder | Complete | M15 §4.3 | รวมอยู่หัวข้อเดียว |
| Strategy Pattern | Partial | M15 §4.6 | ประโยคเดียว ไม่มีตัวอย่างโค้ด |
| Facade Pattern | Missing | — | Service Object (M15 §4.2) ทำหน้าที่คล้าย Facade แต่ไม่ได้ระบุชื่อ |
| SOLID | Partial | M15 §5 | อธิบาย S, O, D · ไม่มี L และ I ทั้งที่ใช้คำว่า SOLID |
| Anti-patterns 9 ข้อ | Complete | M15 §7, Lab 15.4 | Excessive inheritance อยู่ใน M10 Real-world Notes |
| Workshop: โครงสร้าง project | Complete | Lab 15.2, SA4 | |
| POM, โครงสร้าง layer ซ้ำ | Duplicate | M10 §1 กับ M15 §4.1 · M12 §1 กับ M15 §3 · gTAA ใน M05 §5 | มีการอ้างข้ามบทอยู่แล้ว |

**Chapter 7 — API Testing with Playwright**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| `APIRequestContext`, HTTP methods | Complete | M13 §4, M10 §2, M07 §4 | การแยก context ต่อผู้ใช้ตรงกับเอกสาร (REF-104) |
| Headers, Authentication | Complete | M13 §2, §7 | |
| Request/Response/Status validation | Complete | M13 §2 | |
| JSON Schema Validation | Complete | M13 §4, §6 | |
| API Test Data Management | Complete | M16 §1 | |
| Database Validation | Complete | M14 | |
| UI + API Hybrid, Pre/Post-condition | Complete | M10 §3 | |

**Chapter 8 — Debugging, Reporting & Test Maintenance**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| Trace Viewer, Screenshot, Video, HTML Report | Complete | M09 §7–8, M17 §4 | |
| Console Logs, Network Errors | Partial | M17 §4 | ดูผ่าน trace ได้ แต่ไม่มีวิธีจับ console error หรือ request ที่ล้มเหลวเป็น assertion |
| Debugging Test Failure, Retries | Complete | M17 §4–5 | ควรเพิ่มนิยาม "flaky" ของ Playwright (AC-12) |
| Tags, Annotations, Projects, Cross-browser | Complete | M10 §7–8, M19 §5 | |
| แยก Product / Test / Environment Defect | Partial | M17 §2 | มีหมวดสาเหตุ แต่ไม่มีขั้นตอน triage ที่จำแนก 3 ประเภทนี้ |
| Test Maintenance | Partial | M20 §4 | มี code review checklist ไม่มีแนวทางเลิกใช้หรือปรับปรุง test |

**Chapter 9 — Robot Framework Fundamentals**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| Architecture, Suite, Test Case, Keywords, Settings | Complete | M11 §1, §3 | |
| Variables | Needs Correction | M11 §4 | ลำดับ priority ไม่ตรง User Guide (AC-05) |
| Built-in Libraries | Partial | M11 §1 | ระบุชื่อ Collections เท่านั้น ไม่มี BuiltIn, String, OperatingSystem, DateTime |
| Setup/Teardown, Tags | Complete | M11 §6, M12 §7 | |
| Assertions | Partial | M11 §5 | Assertion ของ Browser library ครบ · `Should …` ของ BuiltIn ไม่ได้สอน |
| Control Structures | Complete | M11 §7 | |
| Test Templates | Complete | M12 §3 | อยู่ในบท Advanced |

**Chapter 10 — Advanced Robot Framework Design**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| Resource Files, Variable Files, Reusable Keywords | Complete | M12 §1 | |
| Data-driven, Test Templates | Complete | M12 §3, Lab 12.2 | DataDriver ตรวจแล้ว (REF-087) |
| Custom Python Libraries | Needs Correction | M12 §2 | คำอธิบายเรื่องชนิดของ argument ไม่ครบ (AC-06, AC-07) |
| Environment Configuration | Complete | M11 §4 | |
| Test Data Management | Partial | M12 §3 | มีเฉพาะไฟล์ CSV |
| Error Handling | Partial | M11 §7 | มี TRY/EXCEPT · ไม่มีพฤติกรรม teardown และ `Run Keyword And Expect Error` |
| Listener API | Outdated | M12 §6 | ตัวอย่างใช้ `longname` (AC-08) |
| Custom Reporting | Partial | M11 §8, M18 §4 | มี rebot และ xunit · ไม่มีการปรับแต่งผลลัพธ์ |

**Chapter 11 — Browser Automation with Robot Framework**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| Browser library Architecture | Missing | — | มีเพียงวลี "Playwright engine" |
| Browser, Context, Page | Complete | M11 §5–6 | |
| Locator Strategy, Keywords, UI Assertions | Complete | M11 §5, M07 §2 | |
| Browser Session Management | Partial | `common.resource` | ทำ cookie injection ในโค้ดอ้างอิง แต่บทเรียนไม่ได้อธิบาย |
| Reusable UI Keywords | Complete | M12 §1 | |
| Debugging และ Screenshots | Complete | M11 §8, M17 §4 | |
| ข้อกำหนดเวอร์ชัน Python | Outdated | `01-course-overview.md` §8 | ดู AC-11 |

**Chapter 12 — API Automation & Parallel Execution**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| RequestsLibrary, REST API, Authentication | Complete | M13 §5 | |
| JSON Validation | Missing | — | Schema validation ทำเฉพาะฝั่ง Playwright |
| Database Testing | Complete | M14 §4 | |
| Data-driven API Testing | Partial | M12 §3 | Template ใช้กับ UI pricing ไม่มีตัวอย่าง API |
| Pabot, Parallel Execution | Complete | M12 §5, Lab 12.4 | ตัวเลือกตรงกับเอกสาร (REF-023) |
| Logs และ Reports | Complete | M11 §8 | |
| Test Data Isolation | Complete | M12 §5, M16 §2 | |

**Chapter 13 — CI/CD & Test Automation Operations**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| Git Workflow | Complete | M06 §2 | |
| GitHub Actions หรือ GitLab CI | Partial | M18 §2 | GitHub Actions ครบ · GitLab เป็นตารางเทียบ 4 แถว |
| Pipeline Architecture, Execution Strategy | Complete | M18 §1, §6 | |
| Docker Fundamentals | Partial | M16 §6, M18 §5 | เป็นคำสั่ง ไม่มีแนวคิด image, container, layer, volume และยังไม่เคยรันจริง |
| Environment Management | Complete | M16 §5 | |
| Secrets Management | Complete | M06, M15 §6 | |
| Smoke และ Regression | Complete | M18 §1, M12 §7 | |
| Parallel Execution | Needs Correction | M18 §3 | คำแนะนำจำนวน worker ไม่ตรงเอกสาร (AC-10) |
| Test Artifacts, Automated Reporting | Complete | M18 §2, §4 | |
| Cache ใน pipeline | Needs Correction | M18 §5 | แนะนำ cache browser (AC-09) |

**Chapter 14 — Reliability Engineering & Test Optimization**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| Flaky Tests, Reliability, Failure Analysis | Complete | M17 §1–2, §6 | มี case study จากการสร้างจริง 7 กรณี |
| Test Isolation, Parallel Conflicts | Complete | M16 §2, M17 §2 | |
| Environment Stability | Partial | M16 §5 | มี environment parity ไม่มีการตรวจความพร้อมก่อนรัน |
| Execution Optimization | Partial | M18 §3 | มี sharding ไม่มีการเลือกรันตามการเปลี่ยนแปลง |
| Dependency Management | Partial | M16 §7 | มี mock ของระบบภายนอก ไม่มีเรื่องเวอร์ชันเครื่องมือ |
| Regression Test Optimization | Missing | — | ไม่มีการจัดลำดับ ตัดทอน หรือทบทวนชุด regression |
| Test Maintenance Strategy | Partial | M17 §5 | มี quarantine ไม่มีรอบทบทวนชุดทดสอบ |
| Metric: First-run Pass Rate | Missing | — | |
| Metric: Flaky Rate, Execution Time, Failure Rate | Complete | M17 §1, M03 §6, M20 §3 | |
| Metric: Defect Detection | Complete | M20 §3 | ใช้ Bug Mode detection rate และ defect leakage |
| Metric: Maintenance Effort | Partial | M05 §3 | อยู่ในสูตร ROI ไม่มีวิธีเก็บข้อมูล |

**Chapter 15 — AI-Assisted Quality Engineering**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| A. AI ช่วยงาน QA 8 งาน | Complete | M21 §1–2, Lab 21.1–21.3 | Documentation และ Defect Analysis มีน้อยกว่างานอื่น |
| วิธีตรวจผลลัพธ์จาก AI | Complete | M21 §4, §6 | |
| LLM Testing, Non-deterministic Testing | Partial | M21 §5 | 4 bullet ไม่มีแบบฝึก |
| Prompt Testing | Missing | — | |
| Prompt Injection, Hallucination, AI Security | Partial | M21 §5 | ระบุชื่อเท่านั้น ไม่อ้าง OWASP Top 10 for LLM Applications |
| RAG Testing | Missing | — | |
| AI Output Validation, Model Evaluation, Golden Dataset | Partial | M21 §5 | มีแนวคิด eval set หนึ่งบรรทัด |
| Human-in-the-loop | Partial | M21 §5 | |
| Privacy และ Data Governance | Partial | M21 §6, M14 §6 | มีนโยบายทีมและ PDPA ไม่มี NIST AI RMF |
| ตัวอย่าง Banking AI Assistant | Missing | — | |
| Deliverable: AI Evaluation Tests | Missing | — | ไม่มีแบบฝึกทดสอบระบบ AI |

**Chapter 16 — Final Capstone**

| หัวข้อใน Roadmap | สถานะ | หลักฐาน | ข้อสังเกต |
|---|---|---|---|
| โครง capstone, rubric, presentation | Complete | M22 §1–4 | ใช้ Bug Mode detection rate เป็นหลักฐานคุณค่าของ test |
| Module Account, Loan, Payment, Reversal, EOD | Missing | — | ShopLab ไม่มีโดเมนนี้ · order state machine ใกล้เคียง Reversal เพียงบางส่วน |
| Security, Reporting | Partial | M13 §7, M19 §4 | มีในโดเมน ShopLab |
| Playwright และ Robot ทั้งคู่ | Partial | M22 §1 | Capstone ให้เลือกเครื่องมือหลักหนึ่งตัว |
| Automation Architecture Document | Partial | M22 §1 | กำหนด ADR ≥ 2 และ README ไม่มีเอกสารสถาปัตยกรรมรวม |
| AI-assisted Test Design Workflow | Missing | — | |

### 2.3 จำนวนแถวตามสถานะ

จากตารางในหัวข้อ 2.2 รวม 149 แถว: **Complete 71 · Partial 47 · Missing 19 · Needs Correction 5 · Outdated 3 · Misplaced 2 · Duplicate 2** (นับด้วยสคริปต์ ไม่ได้นับมือ)

อ่านตัวเลขนี้อย่างระวัง: แถวที่เป็น Complete ส่วนใหญ่อยู่ใน Chapter 5–7 และ 9–14 ส่วน Missing กระจุกอยู่ที่ 3 เรื่อง คือโดเมน Banking, การทดสอบระบบ AI และ Python พื้นฐาน

---

## 3. รายการที่ต้องแก้ไข (Needs Correction และ Outdated)

ทุกข้อมีข้อความเดิม ปัญหา ข้อความที่เสนอ และแหล่งอ้างอิง — **ยังไม่ได้แก้ในไฟล์ module** รอการอนุมัติ ส่วน Master Curriculum ใช้ข้อความที่แก้แล้ว

| ID | ตำแหน่ง | ข้อความเดิม | ปัญหา | ข้อความที่เสนอ | REF |
|---|---|---|---|---|---|
| AC-01 | M01 §4 Test levels | 4 ระดับ: Unit/Component, Integration, System, Acceptance | CTFL v4.0.1 §2.2.1 ระบุ **5 ระดับ** โดยแยก integration เป็นสองระดับ | Component · Component integration · System · System integration · Acceptance (พร้อมหมายเหตุว่า acceptance มีหลายรูปแบบ เช่น UAT, operational, contractual, regulatory, alpha, beta) | REF-097 |
| AC-02 | M01 §4 Test types | Functional, Non-functional, Structural (white-box), Change-related | CTFL v4.0.1 §2.2.2 ระบุ **4 test types**: functional, non-functional, black-box, white-box · confirmation กับ regression testing เป็นหัวข้อแยก (§2.2.3) ไม่ใช่ test type | จัดเป็น 4 types ตาม syllabus และย้าย confirmation/regression ไปหัวข้อ "การทดสอบที่เกิดจากการเปลี่ยนแปลง" (การจัดกลุ่มเดิมน่าจะมาจาก syllabus รุ่นก่อน — ยังไม่ได้เปิดรุ่นเก่ายืนยัน) | REF-097 |
| AC-03 | M01 §5 STLC | 6 ขั้น: Requirement Analysis → Planning → Design → Environment Setup → Execution → Closure | หัวบทอ้าง CTFL บทที่ 1 แต่ syllabus อธิบาย test process เป็น **7 กลุ่มกิจกรรม** และระบุว่ามักทำแบบวนซ้ำหรือขนานกัน | คงแผนภาพ STLC ไว้เป็น "แบบจำลองที่ใช้ในอุตสาหกรรม" และเพิ่มกิจกรรมตาม ISTQB: test planning · test monitoring and control · test analysis · test design · test implementation · test execution · test completion | REF-097 |
| AC-04 | M02 §5 coverage | 0-switch → all invalid transitions → 1-switch | CTFL v4.0.1 §4.2.4 ใช้ 3 เกณฑ์: all states · valid transitions (0-switch) · all transitions (valid + invalid) · 1-switch ไม่อยู่ใน CTFL | ใช้ชื่อ 3 เกณฑ์ตาม syllabus และระบุว่า 1-switch เป็นเนื้อหาระดับสูงกว่า Foundation | REF-097 |
| AC-05 | M11 §4 | "command line (`--variable`) > variable file/section > ค่าใน resource" | User Guide: Variable section ของไฟล์ test **สูงกว่า** resource และ variable files ที่ import ซึ่งอยู่ลำดับต่ำสุดร่วมกัน | "command line > Variable section ในไฟล์ test > resource และ variable files ที่ import · ตัวแปรที่ตั้งระหว่างรันจะทับค่าเดิมใน scope ที่ตั้ง" | REF-106 |
| AC-06 | M12 §2 | "argument จาก Robot เป็น string เสมอ (ถ้าไม่มี type hint)" | User Guide: (1) ค่าที่ส่งเป็นตัวแปรจะถูกส่งตามชนิดจริง (2) ถ้าไม่มี type hint Robot Framework 3.1+ จะแปลงตามชนิดของ **default value** — ตัวอย่างในบทเอง (`discount=0`, `free_ship_coupon=False`) จึงถูกแปลงอัตโนมัติ | "ค่าที่พิมพ์ตรงๆ ใน test data เป็น string · ตัวแปรส่งตามชนิดจริง · Robot แปลงชนิดให้ตาม type hint หรือตามชนิดของ default value" | REF-107 |
| AC-07 | M12 quiz ข้อ 2 | "Robot 4+ แปลงตาม type hint ให้ถ้ามี" | การแปลงอัตโนมัติเริ่มตั้งแต่ Robot Framework **3.1** | แก้เป็น "Robot Framework 3.1+" | REF-107 |
| AC-08 | M12 §6 listener | `result.longname` | RF 7.0 เพิ่ม `full_name` "to replace `longname`" (หลักสูตรกำหนด RF ≥ 7.3) | ใช้ `result.full_name` · สถานะการเลิกใช้ `longname` ยังไม่ได้ตรวจ | REF-074 |
| AC-09 | M18 §5 | "cache `~/.cache/ms-playwright`" | เอกสาร Playwright CI: ไม่แนะนำให้ cache browser binaries เพราะเวลา restore ใกล้เคียงเวลาดาวน์โหลด และ dependency ระดับ OS cache ไม่ได้ | ตัดคำแนะนำนี้ · คง cache npm/pip · ถ้าจำเป็นต้อง cache ให้ผูก key กับเวอร์ชัน Playwright | REF-098 |
| AC-10 | M18 §3 | "จำนวน worker ใน CI ควร ≈ จำนวน CPU core" | เอกสาร Playwright CI แนะนำ `workers: 1` ใน CI เพื่อความเสถียร และใช้ sharding เมื่อต้องการขนานมากขึ้น · เครื่อง self-hosted กำลังสูงเพิ่ม worker ได้ | "เริ่มที่ 1 worker ต่อ job แล้วขยายด้วย sharding · เพิ่ม worker เมื่อวัดแล้วว่าเครื่อง CI รับไหวและ flaky rate ไม่เพิ่ม" (reference config ใช้ 2 — ควรบันทึกเหตุผลเป็น ADR) | REF-098 |
| AC-11 | `01-course-overview.md` §8 | Python "3.10+ (แนะนำ 3.12+)" | README ของ Browser library ปัจจุบันรองรับ Python 3.11 ขึ้นไป | แก้ขั้นต่ำเป็น 3.11 · เพิ่มทางเลือกติดตั้ง `robotframework-browser[bb]` กับ `rfbrowser install` ที่ไม่ต้องติดตั้ง Node.js เอง | REF-109 |
| AC-12 | M17 §1 | นิยาม flaky rate ของหลักสูตรเอง | ไม่ผิด แต่ไม่เชื่อมกับการจำแนกของ Playwright: passed (ผ่านรอบแรก) · flaky (ล้มรอบแรก ผ่านเมื่อ retry) · failed | เพิ่มนิยามนี้ และใช้ผูกกับ metric First-run Pass Rate ของ Roadmap | REF-102 |
| AC-13 | M10 §4 ตาราง authentication | storageState = "user ร่วมกันทุก test → ข้อมูลชนกัน" | เอกสารมี 2 ระดับ: shared account (แนะนำเมื่อ test ไม่แก้ state ฝั่ง server) และ **one account per parallel worker** (แนะนำเมื่อ test แก้ state ฝั่ง server) ซึ่งตารางไม่ได้กล่าวถึง | เพิ่มแถว "หนึ่งบัญชีต่อ worker" และระบุให้เก็บไฟล์ไว้ใน `playwright/.auth` ซึ่งต้องอยู่ใน `.gitignore` | REF-103 |
| AC-14 | `01-course-overview.md` §3 หัวตาราง | "~140 ชั่วโมง" | ชั่วโมงในตารางเดียวกันรวมได้ 158 ชม. (22 modules) และ 170 ชม. เมื่อรวม Skills Assessment 4 ครั้ง · แผน 12 สัปดาห์ × 12 ชม. = 144 ชม. จึงไม่พอ | แก้หัวตารางเป็น "~158 ชั่วโมง (170 รวม Skills Assessment)" และปรับแผนรายสัปดาห์ | ตรวจภายใน |

**รายการที่ตรวจแล้วไม่ต้องแก้** (ยืนยันกับเอกสารใน session นี้): ชื่อ 7 testing principles · นิยาม 2-value/3-value BVA · สูตร risk = likelihood × impact (CTFL เรียกว่าแนวทางเชิงปริมาณ) · ที่มาของ test pyramid และ testing quadrants · ลำดับความสำคัญของ locator · การแยก `APIRequestContext` ต่อผู้ใช้ · พฤติกรรม worker หลัง test fail · `VAR` (RF 7.0) และ `Secret` (RF 7.4)

---

## 4. เนื้อหาซ้ำซ้อน และเนื้อหาผิดลำดับ

| ประเภท | รายการ | ข้อเสนอ |
|---|---|---|
| Duplicate | Locator strategy: M07 §2, M09 §3, `locator-cheatsheet.md` | รวมเป็นบทเดียว (Master Ch 6) และให้ cheat sheet เป็นฉบับย่อ |
| Duplicate | Page Object Model: M10 §1 และ M15 §4.1 | สอนครั้งเดียวในบท Architecture (Master Ch 7) · บท Playwright อ้างถึง |
| Duplicate | โครงสร้าง layer: M05 §5 (gTAA), M12 §1, M15 §2–3 | คง gTAA ไว้บท Strategy และให้บทอื่นอ้างแผนภาพเดียวกัน |
| Duplicate | Authentication strategy: M07 §4, M10 §4, M15 §9 | รวมไว้บท Architecture พร้อม ADR ตัวอย่าง |
| Duplicate | Wait strategy: M09 §6 และ M17 §3 | บท Locator สอนวิธีใช้ · บท Reliability สอนการวินิจฉัย |
| Duplicate (ใน Roadmap) | "Test Data Management" อยู่ใน Ch 7, 10, 12 · "Parallel Execution" อยู่ใน Ch 12, 13, 14 · "Test Isolation" อยู่ใน Ch 4, 14 | กำหนดบทเจ้าของหัวข้อหนึ่งบท บทอื่นอ้างถึง |
| Misplaced | Risk-Based Testing อยู่ M20 (Level 5) | ย้ายมาบทที่ 1 ตาม Roadmap เพราะใช้กำหนดความลึกของ test ตั้งแต่ต้น |
| Misplaced | SQL และ database อยู่ M14 หลังเครื่องมือ | พื้นฐาน SQL ย้ายไปบท Technical Foundations · การตรวจข้อมูลคงไว้บท Test Data |
| Misplaced | API testing (M13) อยู่หลัง Robot Framework | Roadmap วาง API ไว้ในช่วง Playwright — ใช้ลำดับของ Roadmap |
| Misplaced | Test Templates อยู่บท Robot Advanced | Roadmap วางไว้ทั้ง Ch 9 และ 10 — แนะนำเบื้องต้นใน Ch 9 และลงลึกใน Ch 10 |

---

## 5. การตรวจตัว Roadmap เอง

| # | ตำแหน่ง | ข้อสังเกต | ข้อเสนอ |
|---|---|---|---|
| R-1 | เลขหัวข้อ | "# 3" และ "# 4" ถูกใช้ซ้ำอย่างละสองครั้ง | เรียงเลขใหม่ใน Master Curriculum |
| R-2 | เวลาเรียน | 16 สัปดาห์ × 6.5–7.5 ชม. = 104–120 ชม. ขณะที่ชั่วโมงของ 22 modules เดิมรวมได้ 158 ชม. และ Skills Assessment อีก 12 ชม. (ดู AC-14) · Chapter 3 สัปดาห์เดียวต้องครอบคลุมสองภาษา, Git, Linux, HTTP, SQL, authentication | เสนอสามแผนใน Master Curriculum: 16 สัปดาห์แบบเข้ม · 24 สัปดาห์ · 28 สัปดาห์ตามเวลาต่อสัปดาห์ของ Roadmap |
| R-3 | หนังสือ *Software Test Automation* | ลำดับผู้เขียนที่ถูกคือ Mark Fewster และ Dorothy Graham · พิมพ์ปี 1999 | ใช้เป็นหนังสือแนวคิด และจับคู่กับ ISTQB CTAL-TAE v2.0 (2024) สำหรับแนวปฏิบัติปัจจุบัน |
| R-4 | Chapter 2 | Use Case Testing และ Pairwise ไม่อยู่ใน CTFL v4.0.1 §4.2 (มี 4 เทคนิค) | คงไว้ได้ แต่ระบุระดับให้ชัดว่าเกิน Foundation |
| R-5 | Chapter 14 metric "Defect Detection" | นิยามกว้าง วัดไม่ได้โดยตรง | ใช้ defect leakage (escaped defects) และ detection rate จากบั๊กที่ฝังไว้ |
| R-6 | Chapter 15 | รวมสองทักษะ (ใช้ AI ช่วยงาน และทดสอบระบบ AI) 20 หัวข้อไว้ในสัปดาห์เดียว | แยกเป็นสองบท |
| R-7 | โดเมน | Workshop และ capstone ต้องใช้ระบบ Banking ที่ยังไม่มี | ดูข้อเสนอ P0-1 |
| R-8 | หัวข้อที่ไม่มีใน Roadmap | Automation strategy และ ROI · web/DOM fundamentals · test data และ environment · non-functional testing · การประเมินผลผู้เรียน | เพิ่มตามเหตุผลในหัวข้อ 6.2 |
| R-9 | ลิงก์อ้างอิง 11 รายการ | ตอบ HTTP 200 ทั้งหมด (ตรวจ 2026-11-10) | — |

---

## 6. Phase 2 — Gap Analysis

### 6.1 สิ่งที่ Roadmap ต้องการ แต่เนื้อหาปัจจุบันยังไม่มีหรือไม่ครบ

| ลำดับ | ช่องว่าง | ผลกระทบ | Roadmap Ch |
|---|---|---|---|
| G-1 | ไม่มีระบบฝึกโดเมน Banking (Account, Loan, Payment, Reversal, EOD) | Workshop ของ Ch 1, 2, 5, 11 และ capstone ทำตาม Roadmap ไม่ได้ | 1, 2, 5, 11, 16 |
| G-2 | การทดสอบระบบ AI: prompt testing, RAG, golden dataset, prompt injection ไม่มีแบบฝึก | Deliverable "AI Evaluation Tests" ส่งไม่ได้ | 15 |
| G-3 | Python: file I/O (JSON/CSV), modules, tuple/set, exception | Workshop Ch 3 ข้อ 1 ทำไม่ได้จากบทเรียน | 3 |
| G-4 | สถาปัตยกรรมของ Playwright และ Browser library | ผู้เรียนใช้เครื่องมือได้แต่อธิบายการทำงานไม่ได้ | 4, 11 |
| G-5 | SDLC models, static testing, requirement review, use case testing | พื้นฐานไม่ครบตาม Ch 1–2 | 1, 2 |
| G-6 | JWT, OAuth, HTTPS, XML, Linux | พื้นฐานเทคนิคไม่ครบ | 3 |
| G-7 | Facade, Strategy (ตัวอย่าง), SOLID ครบ 5 ข้อ | รายการ pattern ไม่ครบตาม Ch 6 | 6 |
| G-8 | Regression optimization และ First-run Pass Rate | รายงาน Deliverable ของ Ch 14 ขาดตัวชี้วัดหลัก | 14 |
| G-9 | Docker fundamentals และ GitLab CI | ทำ pipeline บน GitLab หรืออธิบาย container ไม่ได้ | 13 |
| G-10 | JSON validation และ data-driven API ใน Robot Framework | Ch 12 ไม่ครบ | 12 |

### 6.2 สิ่งที่เนื้อหาปัจจุบันมี แต่ Roadmap ไม่ครอบคลุม — ข้อเสนอให้คงไว้

| เนื้อหา | แหล่ง | เหตุผลที่ควรอยู่ในหลักสูตร |
|---|---|---|
| Automation strategy, เกณฑ์เลือกสิ่งที่จะ automate, ROI, gTAA | M05 | Roadmap มีหลัก "Automate the Right Things" แต่ไม่มีบทที่สอนวิธีตัดสินใจ · ตรงกับ ISTQB CTAL-TAE v2.0 (REF-002) |
| Test data, database verification, environment | M14, M16 | Roadmap มีหลัก "Isolation Before Parallelization" แต่กระจายหัวข้อไว้ 3 บทโดยไม่มีบทเจ้าของ |
| Non-functional testing | M19 | Capstone ของ Roadmap มี module Security และโดเมนการเงินต้องการ performance · CTFL จัด non-functional เป็นหนึ่งในสี่ test types |
| Web fundamentals (DOM, accessibility tree, DevTools) | M07 | เป็นความรู้ก่อนเรียน locator |
| Test process, test plan, metrics, เอกสาร | M03 | Deliverable ของ Roadmap หลายบทเป็นเอกสาร แต่ไม่มีบทสอนเขียน |
| Skills Assessments และ Bug Mode grader | `docs/assessments/` | Roadmap มีเกณฑ์ประเมิน 7 ข้อ แต่ไม่มีเครื่องมือวัด |
| Leadership, test maturity, career | M20 §5–6, M22 §5–7 | สนับสนุนเส้นทางอาชีพท้าย Roadmap |

### 6.3 การพิจารณา Advanced Topics

| หัวข้อ | สถานะปัจจุบัน | การตัดสินใจ | เหตุผล |
|---|---|---|---|
| Risk-Based Testing | มี (M20) | ย้ายไปบทที่ 1 | ใช้ตั้งแต่ต้น |
| Requirements Engineering | Partial | เพิ่มเป็น subchapter ในบทที่ 2 | เฉพาะส่วนที่ tester ใช้: review และ testability ของ requirement |
| Exploratory Testing | Complete | คงไว้ | |
| Testability | Partial (M05, M07, M16) | เพิ่ม subchapter ในบท Automation Strategy | เป็นเงื่อนไขของ automation ที่ดูแลได้ |
| Test Strategy | Complete | คงไว้ | |
| Test Coverage | Partial | เพิ่ม subchapter ในบทที่ 2 | แยก requirement coverage, risk coverage, code coverage และข้อจำกัด |
| Mutation Testing | กล่าวถึง (M20) | เพิ่ม subchapter ในบท Reliability | ใช้วัดคุณภาพของ test · Bug Mode เป็นตัวอย่างอยู่แล้ว |
| Contract Testing | Complete (schema-based) | คงไว้ · Pact เป็นแนวคิด | ShopLab เป็น service เดียว ยังไม่มีคู่ consumer–provider ให้ฝึก |
| Performance, Security Testing | Complete (M19) | คงไว้เป็นบท Non-functional | |
| Automation Framework Architecture, Design Patterns, DI, Test Isolation, Parallel, Flaky | Complete | คงไว้ | |
| Test Data Architecture | Complete (M16) | ยกเป็นบท | |
| SOLID, Clean Code | Partial | เติมให้ครบในบท Architecture | |
| Observability and Diagnostics | Partial | เพิ่ม subchapter ในบท Debugging | การแนบหลักฐานและการอ่านสัญญาณจากระบบ |
| Git, CI/CD, Environment, Secrets | Complete | คงไว้ | |
| Docker, Linux | Partial | เติมพื้นฐาน | |
| Test Environment Architecture, Monitoring and Reporting | Partial | รวมในบท Test Data และบท CI/CD | |
| AI-assisted Test Design, Human-in-the-loop | Complete, Partial | คงไว้และเติม | |
| LLM Testing, Prompt Testing, RAG Evaluation, Hallucination, AI Security, Non-deterministic Testing, AI Evaluation Frameworks | Partial ถึง Missing | แยกเป็นบทใหม่ | มีมาตรฐานรองรับแล้ว (REF-110 ถึง REF-113) |
| **ไม่เพิ่ม** | Mobile/Appium, GraphQL, WebSocket, microservices | อยู่นอกเป้าหมายของ Roadmap และไม่มีระบบฝึกรองรับ — คงไว้ใน backlog P3 เดิม | |

---

## 7. Phase 3 — Improvement Proposal

| ลำดับ | ข้อเสนอ | เหตุผล | ขนาดงาน |
|---|---|---|---|
| **P0-1** | สร้างระบบฝึกโดเมน Lending & Payment (ชื่อชั่วคราว LoanLab) ตามข้อกำหนดใน Master Curriculum ภาคผนวก A — เป็น module ใหม่ใน `practice-app` ที่ใช้ test hooks และ Bug Mode แบบเดียวกับ ShopLab | ปิด G-1 ซึ่งกระทบ 5 บทและ capstone | ใหญ่ (แยกเป็นงานของตัวเอง) |
| **P0-2** | แก้ 14 รายการในหัวข้อ 3 (AC-01 ถึง AC-14) ในไฟล์ module และ overview | ความถูกต้องทางเทคนิคมาก่อนปริมาณ | เล็ก |
| **P0-3** | ใช้ Master Curriculum v2.0 (20 บท) เป็นโครงสร้างหลัก และจับคู่ module เดิมด้วยตาราง mapping | รวม Roadmap กับเนื้อหาเดิมโดยไม่ทิ้งของที่ถูกต้อง | ทำแล้วในรอบนี้ (ระดับโครงสร้าง) |
| **P1-1** | เขียนเนื้อหาเต็มของบท Testing AI-based Applications พร้อมแบบฝึก eval | ปิด G-2 | กลาง |
| **P1-2** | เติมบท Programming: Python file I/O, modules, exception, TypeScript interface · บท Technical: JWT, OAuth, HTTPS, XML, Linux | ปิด G-3, G-6 | กลาง |
| **P1-3** | เติมสถาปัตยกรรม Playwright และ Browser library, Facade/Strategy/SOLID, First-run Pass Rate, regression optimization | ปิด G-4, G-7, G-8 | เล็กถึงกลาง (ร่างแรกอยู่ใน Master Curriculum แล้ว) |
| **P1-4** | เติม SDLC models, static testing, requirement review, use case testing | ปิด G-5 | เล็ก (ร่างแรกอยู่ใน Master Curriculum แล้ว) |
| **P2-1** | Docker fundamentals พร้อมรันจริง และ pipeline ตัวอย่างบน GitLab CI | ปิด G-9 · Docker ยังไม่เคยรันบนเครื่องนี้ | กลาง |
| **P2-2** | JSON validation และ data-driven API ใน Robot reference suite | ปิด G-10 | เล็ก |
| **P2-3** | ย้ายและเปลี่ยนชื่อไฟล์ module ให้ตรงเลขบทใหม่ | ทำหลังอนุมัติโครงสร้าง เพราะกระทบลิงก์ทั้ง repository | กลาง |
| **P3** | เปิดอ่านหนังสือเพื่อยืนยันเนื้อหา · native Thai reviewer · final exam bank | ค้างจาก backlog เดิม | — |

**ลำดับที่แนะนำ:** P0-2 → P0-1 → P1-1 → P1-2 → P1-3/P1-4 → P2

---

## 8. Phase 5 — Reference & Technical Validation

### 8.1 แหล่งที่เปิดอ่านใน session นี้ (2026-11-10)

รายละเอียดเต็มและข้อเท็จจริงที่ยืนยันอยู่ใน `2. reference folder/references.md`

| REF | แหล่ง | วิธีอ่าน | ใช้ยืนยัน |
|---|---|---|---|
| REF-097 | ISTQB CTFL Syllabus v4.0.1 (PDF) | ดึงข้อความจากไฟล์ทางการ | AC-01 ถึง AC-04, principles, BVA, risk, pyramid, quadrants |
| REF-098 | Playwright — Continuous Integration | เปิดหน้าโดยตรง | AC-09, AC-10 |
| REF-099 | Playwright — Best Practices | เปิดหน้าโดยตรง | หลักการในบท Locator |
| REF-100 | Playwright — Isolation | เปิดหน้าโดยตรง | Browser context |
| REF-101 | Playwright — Parallelism | เปิดหน้าโดยตรง | Worker process model |
| REF-102 | Playwright — Retries | เปิดหน้าโดยตรง | AC-12 |
| REF-103 | Playwright — Authentication | เปิดหน้าโดยตรง | AC-13 |
| REF-104 | Playwright — API testing | เปิดหน้าโดยตรง | บท API |
| REF-105 | Playwright — Release notes | เปิดหน้าโดยตรง (100,000 อักขระแรก) | เวอร์ชันล่าสุด 1.65 |
| REF-106 | Robot Framework User Guide — Variables | ไฟล์ต้นฉบับบน GitHub | AC-05 |
| REF-107 | Robot Framework User Guide — Creating test libraries | ไฟล์ต้นฉบับบน GitHub (100,000 อักขระแรก) | AC-06, AC-07 |
| REF-074 | Robot Framework 7.0 release notes | ไฟล์ต้นฉบับบน GitHub (เดิมอ่านผ่านบทสรุป) | AC-08 |
| REF-109 | Robot Framework Browser — architecture และ README | เปิดหน้าโดยตรง | AC-11, สถาปัตยกรรม |
| REF-110 | OWASP Top 10 for LLM Applications 2025 | เปิดหน้าโดยตรง | บท Testing AI |
| REF-111 | NIST AI RMF 1.0 และ AI 600-1 | เปิดหน้าโดยตรง | บท Testing AI |
| REF-112, REF-113 | ISTQB CT-AI v2.0 · CT-GenAI v1.1 | เปิดหน้าโดยตรง | Certification mapping |
| REF-114 ถึง REF-120 | TypeScript Handbook · Python `csv` · GitHub secrets · GitLab JUnit reports · Pact · Stryker · Ragas paper | เปิดหน้าโดยตรง | เนื้อหาใหม่ในบทที่เกี่ยวข้อง |
| REF-121 ถึง REF-124 | หนังสือ 4 เล่มของ Roadmap | ข้อมูลบรรณานุกรมจากผลค้นหา | Reading list |

### 8.2 เวอร์ชันที่อ้างอิง

| เครื่องมือ | เวอร์ชันในหลักสูตร | เวอร์ชันที่พบในเอกสาร (2026-11-10) | ข้อสังเกต |
|---|---|---|---|
| Playwright | `@playwright/test ^1.65.0` | 1.65 (release notes) · หน้า CI แสดง image `v1.64.1-noble` | ตรงกัน |
| Robot Framework | `>=7.3` | User Guide อ้างถึง 7.4 (`Secret`) | ไม่ขัดแย้ง |
| robotframework-browser | `>=19.0` | Release notes ที่พบถึง 20.2.0 · ต้องการ Python 3.11+ และ Node.js 22/24/26 LTS | ดู AC-11 |
| ISTQB CTFL | v4.0 | v4.0.1 (errata 15 ก.ย. 2024) | ใช้ v4.0.1 |
| OWASP Top 10 (web) | 2025 | — | ตรวจแล้วในรอบก่อน (REF-076) |

### 8.3 รายการที่ยังยืนยันไม่ได้

| รายการ | สถานะ |
|---|---|
| *Designing Data & AI Sovereignty* | ค้นหาชื่อตรงตัวไม่พบ ไม่ทราบผู้เขียนและสำนักพิมพ์ — ไม่ได้ใส่ใน reading list · จากชื่อ เนื้อหาน่าจะเกี่ยวกับ data governance ซึ่งเกี่ยวข้องกับหลักสูตรเพียงหัวข้อ Privacy และ Data Governance ของบท AI (เป็นการคาดจากชื่อเท่านั้น) |
| *Software-Architekturmuster, Antimuster und Fallstricke* | ค้นหาชื่อภาษาเยอรมันตรงตัวไม่พบ — ต้องการ ISBN หรือชื่อผู้เขียนเพื่อตรวจ · ถ้าเป็นหนังสือด้าน architecture patterns จะเกี่ยวกับบท Test Architecture ในเชิงแนวคิด ไม่ใช่เนื้อหาหลัก |
| ชื่อระดับของ TMMi | ยังอ้างจากแหล่งรอง (ค้างจาก CL-010) |
| หนังสือทุกเล่ม | ตรวจเฉพาะบรรณานุกรม ไม่ได้เปิดอ่านเนื้อหา |
| สถานะ deprecated ของ `longname` ใน Robot Framework | release notes บอกเพียงว่า `full_name` มาแทน |
| *The Practical Test Pyramid* และ Playwright Fixtures, Trace Viewer | ลิงก์ใช้งานได้ แต่ไม่ได้เปิดอ่านเนื้อหาในรอบนี้ |
| เนื้อหา Docker ทั้งหมด | ยังไม่เคยรันจริง |
| เครื่องมือ AI evaluation นอกจาก Ragas (เช่น เครื่องมือ eval เชิงพาณิชย์) | ไม่ได้ตรวจ จึงไม่ระบุชื่อใน Master Curriculum |

---

## 9. วิธีทำซ้ำผลการตรวจ

```bash
python "4. script folder/content_inventory.py" --md
python "4. script folder/roadmap_coverage.py" --csv "1. memory folder/roadmap-coverage.csv"
python "4. script folder/audit_structure.py" --curriculum docs/02-master-curriculum.md
python "4. script folder/run_all.py"
```

ผล `roadmap_coverage.py` (203 หัวข้อ): พบวลีตรงตัว 71 · พบวลีน้อยกว่า 3 ครั้ง 31 · พบคำครบใน module เดียวกัน 70 · ไม่พบ 31 — ตัวเลขนี้เป็นสัญญาณจากคำค้นเท่านั้น ไม่ใช่สถานะของเนื้อหา

จำนวนแถวตามสถานะในหัวข้อ 2.2 (นับด้วยสคริปต์จากตารางในไฟล์นี้ 149 แถว): Complete 71 · Partial 47 · Missing 19 · Needs Correction 5 · Outdated 3 · Misplaced 2 · Duplicate 2
