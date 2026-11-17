# Change Log

> รูปแบบต่อรายการ: **หัวข้อ/จุดที่แก้** · **เดิม → ใหม่** · **เหตุผล** · **อ้างอิง (REF-xxx)**
> ล่าสุดอยู่บนสุด

---

## 2026-11-16 — CL-014 · งานต่อเนื่องของ LoanLab (ยังไม่เสร็จ — หยุดเพราะ usage limit)

| # | จุดที่แก้ | เดิม | ใหม่ | เหตุผล | อ้างอิง |
|---|---|---|---|---|---|
| 1 | `.github/workflows/test.yml` job `playwright` | `--project=api --project=ui --project=ui-admin` | เพิ่ม `--project=loanlab --project=loanlab-eod` | ให้ reference tests ของ LoanLab รันบน CI | – |

**ยังไม่ได้ยืนยัน:** ยังไม่ได้รันคำสั่งแบบ `--shard` บนเครื่องนี้ และยังไม่ได้ push จึงยังไม่เคยรันบน CI · ยังไม่ได้ commit
**ยังไม่ได้เริ่ม:** หน้าจอ officer (สร้าง Account, เปิด Loan, เปลี่ยนสถานะ) พร้อม Playwright test · request ของ LoanLab ใน Postman collection (newman ติดตั้งในเครื่องแล้ว) · หน้า Transfer ยังต้องการกฎจากผู้ใช้

---

## 2026-11-16 — CL-013 · สร้าง LoanLab (โมดูลฝึก Retail Lending & Payment) ใน practice-app

**ที่มา:** gap G-1 / ข้อเสนอ P0-1 ของรายงาน audit (CL-012) — Roadmap ใช้โดเมน Banking แต่ไม่มีระบบฝึก ทำให้ Lab 6.4, Lab 12.4 และ 20.B ติดสถานะ ⛔
**การยืนยัน requirement:** คำถามเปิด 8 ข้อของ Appendix A หมวด C ไม่ได้ตัดสินเอง — เสนอคำตอบทีละข้อและผู้ใช้ยืนยันเมื่อ 2026-11-11 · ผู้ใช้เลือกตามข้อเสนอ 7 ข้อ และเลือกต่างจากข้อเสนอ 1 ข้อ คือ Q5 **อนุญาต partial reversal** · คำตอบทั้งหมดอยู่ใน `practice-app/REQUIREMENTS-LOANLAB.md` หมวด 9 เท่านั้น ไม่ได้ใส่ใน Appendix A
**ขอบเขต:** โค้ดและเอกสารของระบบฝึก + แถวสถานะใน master curriculum — **ไม่ได้แก้ข้อความสอนใน 22 modules** · ไม่ได้ใช้เนื้อหาใดจาก `sunline-eps-tests` · ยังไม่ได้ commit

| # | จุดที่แก้ | เดิม | ใหม่ | เหตุผล | อ้างอิง |
|---|---|---|---|---|---|
| 1 | `practice-app/REQUIREMENTS-LOANLAB.md` (ใหม่) | – | SRS ของ LoanLab: LL-ACC 7 ข้อ, LL-LOAN 6, LL-PAY 11 + decision table, LL-REV 10 + state table, LL-EOD 9, LL-SEC 4, LL-RPT 5, LL-TST 7 · ทุกข้อระบุที่มา (REQ/ASM ของ Appendix A, Q1–Q8 หรือ design) · หมวด 9 = คำตอบที่ยืนยันแล้ว | ต้องมี test basis ที่ไม่กำกวมก่อนสร้างระบบ | INP-001 (Roadmap Ch 2, 16), Appendix A |
| 2 | ผลของ Q5 ต่อข้อสมมติเดิม | ASM-01: สถานะ `POSTED`, `REVERSED` · ASM-02: reversal คืนยอดเท่ากับรายการเดิม | เพิ่มสถานะ `PARTIALLY_REVERSED` · reversal คืนยอดเท่ากับจำนวนที่ reverse · ใช้ `reference` ของคำขอระบุ duplicate (LL-REV-03, LL-REV-09 — **ผู้ใช้ยืนยันเมื่อ 2026-11-16** ที่มาในไฟล์ requirement เปลี่ยนจาก `design` เป็น `Q5+`) | ผู้ใช้เลือกให้ reverse บางส่วนได้ จึง reverse จำนวนเท่ากันสองครั้งอาจตั้งใจทั้งคู่ | – |
| 3 | `practice-app/src/loanlab/` (ใหม่): `rules.js`, `schema.js`, `service.js` | – | กฎเป็น pure function (เงินเป็นสตางค์จำนวนเต็ม) · ตาราง `ll_*` 5 ตาราง + seed · service ทำงานใน transaction เดียว | แยกกฎออกจาก I/O เพื่อ unit test ได้ ตามแบบ `pricing.js` | – |
| 4 | `practice-app/src/routes/loanlab.js`, `loanlab-testing.js` (ใหม่) · `server.js`, `db.js` | – | REST API 14 endpoints ใต้ `/api/loanlab/*` · test hooks 6 ตัวใต้ `/api/test/loanlab/*` ปิดเมื่อ `NODE_ENV=production` · `POST /api/test/reset` reset LoanLab ด้วย · ฐานข้อมูลเดิมที่ยังไม่มีตาราง LoanLab ถูกเติมให้โดยไม่ลบข้อมูล ShopLab | ข้อกำหนด testability ของ Appendix A หมวด D | – |
| 5 | `practice-app/src/config.js`, `routes/testing.js` | Bug catalogue มีชุดเดียว (`BUG-01..13`) | เพิ่ม `LOANLAB_BUGS` (`LL-BUG-01..13`) แยกชุด · `bugMode` และ `GRADING_BUGS` ใช้ได้กับทั้งสองชุด · `?reveal=1` เพิ่ม field `loanlabBugs` | ชุดของ ShopLab และคะแนนที่นับจากชุดนั้นต้องไม่เปลี่ยน | – |
| 6 | `practice-app/src/openapi.js` | 26 paths | 44 paths: เพิ่ม schema 10 ตัวและ path ของ LoanLab กับ test hooks | contract test และหน้า `/api-docs` | – |
| 7 | `practice-app/public/loanlab/` (ใหม่) | – | 5 หน้า: account overview, payment, payment history, transaction detail, reverse transaction + `loanlab.js`, `loanlab.css` · ใช้หน้า `/login` เดิม (`?next=/loanlab/`) · `data-testid` ทุก element ที่โต้ตอบได้ | หน้าจอตาม Roadmap Ch 5 · **ไม่ได้แก้หน้าและ CSS ของ ShopLab** เพื่อไม่ให้ visual baseline เปลี่ยน | INP-001 |
| 8 | `practice-app/test/loanlab-rules.test.js`, `loanlab-service.test.js` (ใหม่) | unit tests 16 ข้อ | 69 ข้อ (เพิ่ม 45 ข้อของกฎ และ 8 ข้อของ service บน SQLite ชั่วคราว) | Done criteria: unit test ของกฎ payment และ reversal | – |
| 9 | `tests/playwright/` (ใหม่): `src/api/LoanLabApi.ts`, `src/fixtures/loanlab.ts`, `src/pages/LoanLabPages.ts`, `src/data/loanlab.ts`, `tests/loanlab/*.spec.ts` 4 ไฟล์, `tests/loanlab-eod/eod.api.spec.ts` · แก้ `playwright.config.ts`, `package.json` | 110 tests | 162 tests: project `loanlab` (47 ข้อ รันขนาน) และ `loanlab-eod` (5 ข้อ รันหลังสุดแบบ serial) · script `npm run test:loanlab` | business date และ EOD เป็น state ร่วมของระบบ จึงแยก project แบบเดียวกับ `ui-admin` | – |
| 10 | `tests/robot/` (ใหม่): `resources/api/loanlab_api.resource`, `resources/pages/loanlab_page.resource`, `tests/loanlab/loanlab_acceptance.robot` · `.pabotsuitenames` เปลี่ยนเพราะมี suite ใหม่ | 45 tests | 51 tests: acceptance test แบบ BDD ผ่าน UI 1 ข้อ + API 5 ข้อ อยู่ในไฟล์เดียวเพื่อให้ปลอดภัยกับ pabot | Done criteria: acceptance test อย่างน้อย 1 ข้อ | – |
| 11 | `tools/grade_suite.py` | รับเฉพาะ `BUG-01..13` | รับ `LL-BUG-01..13` และ `--bugs loanlab` · `--bugs all` ยังหมายถึงชุด ShopLab เท่าเดิม | วัด detection rate ของ LoanLab ทีละบั๊ก | – |
| 12 | `docs/instructor/bug-catalogue.md` | มีเฉพาะ ShopLab | เพิ่มหมวด "⚠️ Spoiler — LoanLab Bug Catalogue" 13 แถว + teaching tips | เฉลยสำหรับผู้สอน แยกหมวดและติดป้าย spoiler | – |
| 13 | `docs/02-master-curriculum.md` Practice Systems | LoanLab "**ยังไม่ได้สร้าง**" | "พร้อมใช้ (v1 สร้าง 2026-11-14 · ยังไม่ได้ทดลองกับผู้เรียน)" + ข้อจำกัดของ v1 | สถานะจริง | – |
| 14 | เช่นเดียวกัน Lab 6.4 | "⛔ Blocked — ต้องมี LoanLab · ใช้ Lab 6.3 แทนชั่วคราว" | "พร้อมทำบน LoanLab ยกเว้นหน้า Transfer ซึ่ง LoanLab v1 ไม่มี" + reference spec | มี 5 จาก 6 หน้าของ Roadmap · Transfer อยู่นอก Appendix A | – |
| 15 | เช่นเดียวกัน Lab 12.4 | "⛔ Blocked — ต้องมี LoanLab" | "พร้อมทำบน LoanLab" + reference suite | สถานะจริง | – |
| 16 | เช่นเดียวกัน 20.B และตารางภาพรวม Ch 20 | "⛔ Blocked" · "⛔" | "🆕 Drafted — LoanLab v1 ครอบคลุมทั้ง 7 modules ..." · "🆕 บางส่วน" | ระบบพร้อม แต่ยังไม่ได้ทดลองกับผู้เรียน จึงไม่ใช้ ✅ | – |
| 17 | เช่นเดียวกัน Lab 8.5, Lab 10.5, หัวบท Ch 20, เกณฑ์ผ่าน 20.7, Open Items ข้อ 1 | ข้อความ "เมื่อมี LoanLab" / "กำหนดเมื่อสร้างชุดบั๊ก" | ชี้ไปที่ reference ของ LoanLab · เกณฑ์ที่เสนอ 10 จาก 13 "รอผู้สอนยืนยัน" | ให้ตรงสถานะจริง · เกณฑ์ผ่านเป็นการตัดสินใจของผู้สอน | – |
| 18 | เช่นเดียวกัน Appendix A | สถานะ "ระบบฝึกที่ยังไม่ได้สร้าง" · หมวด B "(ต้องยืนยันก่อนสร้างระบบ)" · หัวข้อ E "ระหว่างที่ยังไม่มี LoanLab" | ชี้ไปที่ requirement ฉบับยืนยันพร้อมคำเตือน spoiler · "(ฉบับร่างก่อน requirement review)" · "(สำหรับผู้เรียนที่ฝึกบน ShopLab มาก่อน)" · **หมวด A–D ไม่เปลี่ยน และหมวด C ยังไม่มีคำตอบ** | หมวด C ต้องคงเป็นโจทย์ของ Lab 2.6 | – |
| 19 | `README.md` | ไม่กล่าวถึง LoanLab · "unit tests ของ pricing (12 tests)" | เพิ่มลิงก์ requirement และย่อหน้า LoanLab · แก้คำอธิบาย unit tests | ผู้เรียนต้องหาทางเข้าได้ · ตัวเลขเดิมไม่ตรงแล้ว | – |
| 20 | `4. script folder/_common.py`, `content_inventory.py` | ตรวจเฉพาะ `practice-app/REQUIREMENTS.md` | รวม `REQUIREMENTS-LOANLAB.md` ใน links, text lint, claim extraction และ inventory | ไฟล์ requirement ใหม่ต้องผ่านเครื่องมือชุดเดียวกัน | – |
| 21 | `fact-check-verdicts.csv` · `glossary.md` · `project-context.md` | – | rule `internal` ของ `REQUIREMENTS-LOANLAB.md` และหมายเหตุของ bug catalogue · glossary: แก้ LoanLab, เพิ่ม Business date, EOD, Reversal · project-context: แถว LoanLab และวิธีรันบนเครื่องนี้ | – | – |

**ผลตรวจหลังแก้ (รันจริงบนเครื่องนี้ Windows, Node 24.12, Chrome ที่ติดตั้งในเครื่อง):**
- `npm test --prefix practice-app` — 69 ผ่าน 0 ล้ม
- `npx playwright test` (ต้องตั้ง `PW_CHANNEL=chrome` เพราะเครื่องนี้ไม่มี Chromium ของ Playwright) — 162 ผ่าน: ของ ShopLab เดิม 110 ข้อไม่ได้แก้ และ LoanLab 52 ข้อ
- `robot --outputdir results tests` (`BROWSER_CHANNEL=chrome`) — 51 ผ่าน: เดิม 45 + LoanLab 6 · `pabot --processes 4 --exclude legacy` — 50 ผ่าน
- `tools/grade_suite.py --bugs loanlab` (เปิดบั๊กทีละตัว): Playwright `loanlab` + `loanlab-eod` จับได้ 13/13 · Robot `tests/loanlab` จับได้ 13/13 · baseline เขียวทั้งคู่
- `NODE_ENV=production`: test hooks ทั้งของ ShopLab และ LoanLab ตอบ 404 · `/api/loanlab/accounts` ตอบ 401 เมื่อไม่ login
- ตรวจหน้าเว็บในเบราว์เซอร์: login → account overview → ชำระต่ำกว่าขั้นต่ำ (ถูกปฏิเสธ) → ชำระปิดหนี้ 300.00 (Loan เป็น `CLOSED`)
- `run_all.py` ผ่านทั้ง 6 ขั้น — links เสีย 0 · text lint 0 · fact-check queue 427 claims, `todo` 9 รายการเท่ากับก่อนแก้ (ไม่มีรายการของ LoanLab)
- `compare_versions.py`: master curriculum similarity 98.8% ไม่มีหัวข้อหายหรือสลับลำดับ · bug catalogue มีแต่ส่วนที่เพิ่ม

**แหล่งอ้างอิง:** ไม่มีแหล่งภายนอกเพิ่ม — กฎทั้งหมดมาจาก Roadmap (INP-001), Appendix A และคำยืนยันของผู้ใช้ · LoanLab เป็นโดเมนสมมติ ไม่ได้อ้างกฎของธนาคารจริงแห่งใด

**สิ่งที่ไม่ได้ทำและไม่ได้ยืนยัน:** ไม่มีหน้า Transfer (Roadmap Ch 5 ระบุไว้ แต่อยู่นอก Appendix A) · UI ไม่มีหน้าสำหรับสร้าง Account, เปิด Loan และเปลี่ยนสถานะ (ทำได้ผ่าน API) · CI (`.github/workflows/test.yml`) ยังรันเฉพาะ project `api`, `ui`, `ui-admin` ของ Playwright — suite ของ Robot จะถูก pabot รันเองเพราะอยู่ใต้ `tests/` · ยังไม่ได้รันบน Linux/CI และ Docker · Postman collection ไม่มี request ของ LoanLab · ยังไม่ได้ทดลองกับผู้เรียน · เกณฑ์ผ่าน 10 จาก 13 เป็นข้อเสนอ

**ข้อผิดพลาดระหว่างทำที่แก้แล้ว:** (1) ข้อความบั๊กใน `config.js` มี apostrophe ที่ไม่ได้ escape ทำให้แอป start ไม่ได้ — พบจาก smoke test แรก (2) patch ของ `playwright.config.ts` รอบแรกทำให้ regex ของ project เหลือ `[\/]` ซึ่งไม่ตรงกับ path บน Windows — แก้เป็น `[\\/]` ก่อนรัน (3) pabot รอบแรกล้ม 50 ข้อเพราะเรียก `robot.exe` ของ Python นอก venv — ไม่เกี่ยวกับโค้ด แก้โดยใส่ `Scripts` ของ venv ใน PATH

---

## 2026-11-10 — CL-012 · Content audit เทียบ Roadmap 16 Chapters + Master Curriculum v2.0

**ที่มา:** ผู้ใช้ส่ง Roadmap (`quality-engineering-test-automation-roadmap-revised.md`) และขอให้ audit เนื้อหาปัจจุบันก่อนรวมหลักสูตร
**ขอบเขตของรอบนี้:** สร้างเอกสารใหม่ 2 ฉบับและปรับเครื่องมือ — **ไม่ได้แก้ข้อความสอนใน 22 modules** (ข้อเสนอแก้ 14 รายการอยู่ในรายงาน รออนุมัติ)

| # | จุดที่แก้ | เดิม | ใหม่ | เหตุผล | อ้างอิง |
|---|---|---|---|---|---|
| 1 | `2. reference folder/inputs/` (ใหม่) | – | สำเนา Roadmap ต้นฉบับ ไม่แก้ไข (INP-001) | ใช้เป็นเกณฑ์เทียบและให้ script อ่านได้ | – |
| 2 | `docs/audit/2026-11-10-content-audit-report.md` (ใหม่) | – | Content inventory · audit 149 แถวราย Chapter (Complete 71, Partial 47, Missing 19, Needs Correction 5, Outdated 3, Misplaced 2, Duplicate 2) · รายการแก้ AC-01..AC-14 · gap analysis · improvement proposal · technical validation | Phase 1, 2, 3, 5 ของคำขอ | REF-097..REF-125 |
| 3 | `docs/02-master-curriculum.md` (ใหม่) | – | 6 Parts, 20 Chapters (Roadmap 16 + 4 บท: Automation Strategy, Test Data & Environment, Non-functional, แยก Testing AI) · แต่ละบทมี 8 ส่วน · content map 189 แถว (✅ 124, ✏️ 11, 🆕 37, 📝 16, ⛔ 1) · Appendix A ร่างข้อกำหนด LoanLab · Appendix B mapping 22 modules · Reading list 6 หมวด | Phase 4, 6 | REF-097..REF-125 |
| 4 | เนื้อหาที่แก้จาก module เดิม (เขียนไว้ใน master curriculum เท่านั้น) | M01 §4: 4 test levels และ test types แบบ Functional/Non-functional/Structural/Change-related | 5 test levels และ 4 test types ตาม CTFL v4.0.1 · confirmation/regression แยกหัวข้อ | syllabus ที่ module อ้างเปลี่ยนการจัดกลุ่ม (AC-01, AC-02) | REF-097 |
| 5 | เช่นเดียวกัน | M01 §5: STLC 6 ขั้น | เพิ่ม test process 7 กลุ่มกิจกรรมของ ISTQB | หัวบทอ้าง CTFL แต่ใช้แบบจำลองอื่น (AC-03) | REF-097 |
| 6 | เช่นเดียวกัน | M02 §5: 0-switch → all invalid → 1-switch | all states · valid transitions (0-switch) · all transitions | ชื่อเกณฑ์ตาม syllabus (AC-04) | REF-097 |
| 7 | เช่นเดียวกัน | M11 §4: "command line > variable file/section > resource" | command line > Variable section > resource และ variable files ที่ import | ไม่ตรง User Guide (AC-05) | REF-106 |
| 8 | เช่นเดียวกัน | M12 §2: argument "เป็น string เสมอ (ถ้าไม่มี type hint)" · quiz: "Robot 4+" | ตัวแปรส่งตามชนิดจริง · แปลงตาม type hint หรือ default value ตั้งแต่ RF 3.1 | ไม่ตรง User Guide (AC-06, AC-07) | REF-107 |
| 9 | เช่นเดียวกัน | M12 §6: `result.longname` | `result.full_name` | RF 7.0 เพิ่ม `full_name` มาแทน (AC-08) | REF-074 |
| 10 | เช่นเดียวกัน | M18 §5: cache `~/.cache/ms-playwright` · M18 §3: worker ≈ จำนวน CPU core | ไม่ cache browser binaries · เริ่มที่ 1 worker แล้วขยายด้วย sharding | ไม่ตรงคำแนะนำของ Playwright (AC-09, AC-10) | REF-098 |
| 11 | เช่นเดียวกัน | overview §8: Python 3.10+ · §3: "~140 ชั่วโมง" | Python 3.11+ · 158 ชม. (170 รวม SA) | README ของ Browser library · ผลรวมจริงของตาราง (AC-11, AC-14) | REF-109 |
| 12 | เช่นเดียวกัน | M17 §1 ไม่มีนิยาม flaky ของ Playwright · M10 §4 ไม่มี "หนึ่งบัญชีต่อ worker" | เพิ่มทั้งสองข้อ | เติมให้ตรงเอกสาร (AC-12, AC-13) | REF-102, REF-103 |
| 13 | `4. script folder/content_inventory.py` (ใหม่) | – | รายการไฟล์เนื้อหาทั้งหมดพร้อมขนาดและสัญญาณโครงสร้าง | ขั้น inventory ก่อน audit | – |
| 14 | `4. script folder/roadmap_coverage.py` (ใหม่) | – | ค้นคำของหัวข้อ Roadmap 203 หัวข้อใน modules (หรือ `--corpus` อื่น) → `1. memory folder/roadmap-coverage.csv` | สัญญาณเชิงกลรอบแรก — ไม่ใช่สถานะ | – |
| 15 | `4. script folder/md_toc.py` (ใหม่) | – | สร้างและตรวจ TOC ระหว่าง marker | Table of Contents ของ master curriculum | – |
| 16 | `audit_structure.py` | ตรวจได้เฉพาะ module | เพิ่ม `--curriculum`: ทุกบทมี 8 ส่วนตามลำดับ, objectives ≥ 3, ทุกแถว content map มีสถานะ | ตรวจโครงสร้างเอกสารใหม่ | – |
| 17 | `check_links.py` | ลิงก์ที่มี `%20` ถูกรายงานว่าเสีย | ถอดรหัส URL ก่อนตรวจไฟล์ | โฟลเดอร์ของโครงการมีช่องว่างในชื่อ | – |
| 18 | `extract_claims.py`, `apply_verdicts.py` | claim ที่มี REF กำกับในบรรทัดยังต้องเขียน rule ทีละข้อ | เก็บ REF ในบรรทัดเป็น inline citation · verified อัตโนมัติเมื่อทุกแหล่งเป็น verified ใน `references.md` · ถ้าแหล่งยังเป็น candidate คงเป็น todo พร้อมชื่อแหล่ง | เอกสารใหม่อ้าง REF ในบรรทัด | – |
| 19 | `run_all.py` | 4 ขั้น | 6 ขั้น (เพิ่ม structure audit และ TOC ของ master curriculum) | – | – |
| 20 | `references.md` | 60 แหล่ง | 89 แถว: เพิ่ม REF-097..REF-125 (29 แหล่ง: 24 เปิดอ่านหรือดึงข้อความโดยตรง, 4 เล่มตรวจเฉพาะบรรณานุกรมผ่านผลค้นหา, 1 candidate) · REF-074 เปลี่ยนเป็นอ่านจากต้นฉบับ · เพิ่มหมวด Project inputs และ "ค้นหาแล้วไม่พบ" | Phase 5 | – |
| 21 | `glossary.md` | 33 คำ | เพิ่ม 6 คำ (Test condition, Product/Project risk, First-run pass rate, Golden dataset, Facade, LoanLab) | คำใหม่ใน master curriculum | REF-097 |
| 22 | `fact-check-verdicts.csv` | – | เพิ่ม rule ของเอกสารใหม่ 2 ฉบับ | – | – |

**ผลตรวจหลังแก้ (รันจริง):** `run_all.py` ผ่านทั้ง 6 ขั้น — modules 22/22 · master curriculum 20/20 บท · TOC ตรง · broken links 0 · text lint 0 (แก้ 6 จุดที่พบระหว่างทาง) · fact-check queue 396 claims: verified 91 (69 จาก inline citation), corrected 12, internal 24, skip 260, **todo 9**
**todo 9 รายการ:** 4 รายการคือข้อความที่เอกสารระบุเองว่ายังไม่ตรวจ (Use Case Testing, protocol ของ Playwright, Trace Viewer, เครื่องมือ AI evaluation) · 5 รายการอ้างแหล่งที่ยังเป็น candidate หรือ partially verified (REF-021, REF-023, REF-041, REF-044, REF-082)
**ความครบถ้วนเทียบ Roadmap:** `roadmap_coverage.py --corpus docs/02-master-curriculum.md` → 203 หัวข้อ ไม่มีหัวข้อใดที่หาคำไม่พบ (เป็นสัญญาณจากคำค้น ไม่ใช่หลักฐานว่าเนื้อหาครบ) · หลักคิด 6 ข้อ วิธีสอน 6 ขั้น และเกณฑ์ประเมิน 7 ข้อของ Roadmap ถูกคงไว้ในหัวข้อ Learning Philosophy
**สิ่งที่ไม่ได้ทำและไม่ได้ยืนยัน:** ไม่ได้รันชุดทดสอบซ้ำ · Docker และ k6 ยังไม่เคยรัน · หนังสือตรวจเฉพาะบรรณานุกรม · หนังสือ 2 เล่มที่ผู้ใช้ระบุค้นไม่พบ · ระบบฝึก Banking (LoanLab) และระบบที่มี LLM ยังไม่มี · ชั่วโมงเรียน 187 ชม. เป็นการประมาณ
**ข้อผิดพลาดระหว่างทำที่แก้แล้ว:** patch ของ `extract_claims.py` และ `apply_verdicts.py` รอบแรกเขียน `\b` ใน regex กลายเป็นอักขระ backspace ทำให้ inline citation ได้ 0 รายการ — พบจากผลรันและแก้แล้ว (หลังแก้ได้ 69) · rule ที่ไม่ถูกใช้ 10 ข้อใน `apply_verdicts.py` มีอยู่ก่อนรอบนี้ (ตรวจกับ HEAD แล้วได้ 10 เท่ากัน)

---

## 2026-11-10 — CL-011 · Skills Assessments 1–4 + grader วัดการจับบั๊ก

| # | จุดที่แก้ | เดิม | ใหม่ | เหตุผล | อ้างอิง |
|---|---|---|---|---|---|
| 1 | `practice-app/src/config.js` | Bug Mode เปิด/ปิดได้ทั้ง 13 ตัวพร้อมกันเท่านั้น | env `GRADING_BUGS=BUG-xx[,..]` เปิดเฉพาะบั๊กที่ระบุ, suite ที่ถูกตรวจปิดไม่ได้, `/api/test/config` คืน `activeBugs`; แถบ BUG MODE ไม่แสดง | ให้ตรวจได้ว่า suite จับบั๊กแต่ละตัวได้หรือไม่ (mutation-style) และให้ SA1 ฝังบั๊ก 1 ตัวแบบไม่บอก | – |
| 2 | `practice-app/public/product.html` | BUG-09 (XSS) อ่านเฉพาะ `bugMode` | อ่าน `activeBugs` ด้วย | BUG-09 อยู่ฝั่ง browser จึงต้องรู้โหมด grading | – |
| 3 | `practice-app/test/config.test.js` (ใหม่) | – | 4 unit tests ของ grading mode | ยืนยันว่าเปิดแค่บั๊กที่ระบุและปิดไม่ได้ | – |
| 4 | `tools/grade_suite.py` (ใหม่) | – | รัน baseline + ทีละบั๊ก บน ShopLab ที่ start ใหม่ทุกรอบ (port/data dir แยก) → `report.md`, `result.json`, log ต่อรอบ | เกณฑ์ SA3 / Capstone (เดิมเป็นงาน roadmap v2.0 "auto-grading") | – |
| 5 | `docs/assessments/` (ใหม่) | หลักสูตรอ้างถึง SA1–SA4 แต่ไม่มีไฟล์ | README (กติกา/สภาพแวดล้อม/grader) + SA1–SA4 (โจทย์, งานที่ส่ง, rubric, เงื่อนไขบังคับ) | Backlog P1 #6 | – |
| 6 | SA2 Part A | – | `sa2-challenge.ts` (assertions) + `sa2-locators.spec.ts` (ผู้เรียน) + `sa2-locators.solution.spec.ts` (เฉลย) | ตรวจอัตโนมัติได้ ผู้เรียนแก้เฉพาะ locator | REF-071, REF-020 |
| 7 | `docs/instructor/assessment-keys.md` (ใหม่) | – | บั๊กที่ฝังใน SA1 (หลัก + สำรอง), ค่าเงิน decision table, เฉลย SA2, บั๊กในขอบเขต SA3, จุดอ่อนจริงของ reference Robot suite สำหรับ SA4 | answer key (repo public → ติดป้าย Spoiler) | – |
| 8 | Overview, README, `.gitignore` | – | ลิงก์ไป SA ทั้ง 4 + grader; ignore `grading/` | – | – |

**ผลที่ยืนยันด้วยการรันจริง:**
- Unit tests ShopLab: 16/16 (เพิ่ม 4)
- Grader กับ reference Playwright `--project=api`: baseline เขียว · จับได้ **10/13** — พลาด BUG-01, BUG-07, BUG-09
- Grader กับ `--project=ui` เฉพาะ 3 ตัวนั้น: baseline เขียว · จับได้ **3/3**; BUG-09 ถูกจับโดย test ที่ตั้งใจไว้ (`review text is shown as plain text`)
- SA2 เฉลย: **30/30** (10 ข้อ × 3 รอบ) · template ผู้เรียน: ล้ม 10/10 ตามตั้งใจ · `tsc` ผ่าน · ชุดปกติยังเป็น 110 tests
- ค่าเงินทุกค่าใน instructor key คำนวณด้วย `pricing.js` (R1–R9, SA2 Part B = total 1,923.11)

**ข้อจำกัด:**
- Grader กับ Robot (`tests/api`, BUG-10/BUG-12): baseline เขียว, จับได้ 2/2 และล้มที่ test ที่ตรงกับบั๊ก — แต่ยังไม่ได้รัน Robot ครบ 13 บั๊ก และ Playwright ทั้งชุดก็รันแยก (api 13 บั๊ก + ui 3 บั๊ก) ไม่ใช่ทั้งชุดในรอบเดียว
- SA1, SA3 Part 2–3 และ SA4 ตรวจด้วย rubric โดยผู้สอน ยังไม่มีตัวอย่างงานของผู้เรียนจริงมาทดลองให้คะแนน
- Grader ถือว่า "suite ล้ม = จับได้" จึงต้องดู baseline และ log ประกอบ (เขียนไว้ใน README ของ assessments)

---

## 2026-11-10 — CL-010 · Fact-check รอบที่ 2 (คิว 105 claims → todo 0)

**ขอบเขต:** (a) เปิดอ่านต้นฉบับโดยตรงของแหล่งที่รอบ 1 อ่านแค่สรุป (b) ตรวจพฤติกรรมเครื่องมือที่เขียนไว้ในโมดูล (c) แหล่งที่ยังเป็น candidate (d) ข้อเท็จจริงในข้อความธรรมดาที่สคริปต์จับไม่ได้
**ผลรวมแหล่งอ้างอิง:** 60 แหล่ง — ยืนยันแล้ว 46 · ยืนยันบางส่วน 4 · ถูกแทนที่ 2 · ยังไม่ได้เปิด 8 (หนังสือ 6 เล่มที่ไม่มีให้เปิด, บล็อก Google, ที่มา Marick)
**ผลคิว:** skip 61 · verified 22 · corrected 12 · internal 10 · todo 0

| # | จุดที่แก้ | เดิม | ใหม่ | เหตุผล | อ้างอิง |
|---|---|---|---|---|---|
| 1 | M02 §6 Pairwise | "…(ในข้อมูลอุปกรณ์การแพทย์ > 70%) … ไม่พบเกิน 6 ปัจจัย … ประมาณ **12–16 cases**" | ใช้เฉพาะที่หน้า NIST ระบุ (ส่วนใหญ่ 1–2 ปัจจัย; เกือบทั้งหมด 1–6 ปัจจัย) + ผลคำนวณจริง: 96 combination, 66 คู่, ชุด pairwise **12–15 cases** (ขั้นต่ำ 12) | ตัวเลข 70% **ไม่อยู่ใน abstract** และเปิด PDF ต้นฉบับไม่ได้ (ดาวน์โหลดได้เป็นหน้า HTML ของ archive) จึงถอดออกแทนที่จะอ้างลอยๆ; "12–16" คลาดจากที่คำนวณได้ | REF-060, REF-067 |
| 2 | M11 เฉลยข้อ 1 (`Fill Secret`) | "ค่าไม่ถูกเขียนลงใน log.html/output.xml" | ไม่บันทึกใน log ของ Robot **แต่ถ้าเปิด Playwright debug log ค่าลับจะโผล่เป็นข้อความธรรมดา** + 3 วิธีส่งค่า (`$var`, `%ENV`, ชนิด `Secret` ของ RF 7.4+) | ซอร์สของ Browser library v21.0.0 ระบุข้อยกเว้นนี้ — ข้อความเดิมเป็นจริงเพียงบางส่วนและอาจทำให้เข้าใจว่าปลอดภัยเสมอ | REF-022 |
| 3 | M18 §5 Docker | `mcr.microsoft.com/playwright:<version>-noble` | `…:v<version>-noble` (tag มี `v` นำหน้า) + ตรึงให้ตรงกับเวอร์ชัน Playwright | เอกสาร Playwright Docker ระบุรูปแบบ `v<version>-<codename>` | REF-091 |
| 4 | M05 ตารางเครื่องมือ (Cypress) | "multi-tab/iframe ข้าม origin จำกัด" | "ควบคุมได้ทีละ browser (หลาย tab ต้องใช้ plugin `@cypress/puppeteer`) · 1 superdomain ต่อ test (ข้าม origin ใช้ `cy.origin`)" | ข้อความเดิมคลุมเครือ/ไม่ตรงถ้อยคำของ trade-offs page; (ส่วน iframe ข้าม origin อ่านจาก trade-offs ไม่ได้จึงตัดออก) | REF-088 |
| 5 | M19 §3 Visual | "ปิด animation (`animations: 'disabled'`)" | เพิ่ม "ซึ่งเป็นค่าเริ่มต้นของ `toHaveScreenshot` อยู่แล้ว" | API reference ระบุว่า `"disabled"` เป็น default | REF-092 |
| 6 | 01-course-overview (CT-TAS) | "ต้องมี CTFL ก่อน" | "ต้องมี Foundation Level v4.0 หรือรุ่นก่อนหน้า และประสบการณ์ที่เหมาะสม" | ตามหน้า ISTQB (ยืนยันตรง) | REF-077 |
| 7 | M20 §5 (TMMi) | ระบุชื่อ 5 ระดับเป็นข้อเท็จจริง | เพิ่มว่า "ชื่อระดับอ้างจากแหล่งรอง ยังไม่ได้ตรวจกับเอกสาร TMMi Model ฉบับเต็ม" | หน้า tmmi.org ไม่ได้ระบุชื่อระดับ (แหล่งรองให้ชื่อ Measured / Management and Measurement ต่างกัน) | REF-082 |
| 8 | `3. asset folder/quotes.md` | Q1, Q2 สถานะ candidate | `verified (แหล่งรอง)` + ข้อควรระวัง: เลขหน้าของ Dijkstra ต่างกันตามฉบับ (EWD249 หน้า 7 ตาม Wikiquote; หน้า 6 ในฉบับ 1972); Myers อ้างจากบทวิจารณ์ (3rd ed. หน้า 6) ยังไม่ได้เปิดหนังสือ | ยืนยันได้เพียงว่าคำพูดมีที่มา ไม่ใช่ถ้อยคำเป๊ะจากต้นฉบับ | REF-096, REF-040 |

**ยืนยันแล้วว่าถูกต้อง (ไม่ต้องแก้):**
- **มาตรฐาน/เอกสารทางการ:** W3C WebDriver (Recommendation 5 มิ.ย. 2018, "derived from Selenium WebDriver") · RF 4.0 (ยกเลิก criticality, `--skiponfailure`, `--noncritical/--critical` เป็น alias ที่เลิกใช้) · RF 7.0 (`VAR`, `scope=SUITE`, วางจำหน่าย 11 ม.ค. 2024) · CT-TAS (Specialist; ข้อสอบ 40 ข้อ/ผ่าน 32/60 นาที) · RFCP (ผู้ออก Robot Framework Foundation, v1.1.0) · OpenAPI 3.0.3 + `nullable` · POUR ตามหน้า WAI · ISO 29119 (Part 1:2022; Parts 2–4:2021)
- **พฤติกรรมเครื่องมือ:** Playwright — sharding/blob/`merge-reports`, ตัวเลือกของ `toHaveScreenshot` (animations/fullPage/mask/maxDiffPixelRatio/maxDiffPixels/threshold), `page.clock.setFixedTime`, `expect.soft/poll/toPass/toHaveValues`, locators เป็น strict และ query DOM ใหม่ทุกครั้ง · pabot (`--processes`, `--testlevelsplit`, `Acquire Lock`, `Run Setup Only Once`) · k6 thresholds · axe tags · npm ci · Postman cookie jar · Browser library keywords
- **อื่นๆ:** นิยาม 2-value/3-value BVA ใน M02 ตรง ISTQB · ตัวอย่าง JS ใน M08 (`[3,1,10].sort()` → `[1,10,3]`, `0.1+0.2===0.3` → false) รันจริง · Luo et al. (3 สาเหตุหลัก) · Accelerate 4 metrics · Bossavit
- **ยืนยันจากการรันจริงของเรา:** `page.route(..., {times: 1})`, `protocolProfileBehavior.disableCookies`, ลำดับการทำงานของ pabot กับ venv

**Verification (ขั้นที่ 3):** `compare_versions.py` กับ backup — ไฟล์ที่แก้ 7 ไฟล์ + quotes.md เหมือนต้นฉบับ 98.1–99.7% (quotes.md 81% เพราะไฟล์เล็ก), ไม่มีหัวข้อหาย/เพิ่ม, ไม่มีตัวเลข "12–16" เหลือค้าง · `run_all.py` ผ่านทั้ง 4 ชุด

**ข้อจำกัดที่ยังเหลือ:**
- แหล่งที่ยืนยัน "via search summary": ISO 29119, Luo et al., Accelerate, ISTQB BVA white paper, TMMi/TPI NEXT, Healenium, mutation tools (Stryker/PIT/mutmut), Playwright MCP — เป็นเพียงว่า "มีอยู่จริงและตรงโดยรวม" ไม่ได้อ่านต้นฉบับเต็ม
- หนังสือ 6 เล่ม (REF-040…044, 047) ไม่ได้เปิด — หลักสูตรอ้างเป็นหลักการ/บรรณานุกรม ไม่ได้ยกข้อความตรง ยกเว้นคำพูด Myers (ดู quotes.md)
- ข้อความธรรมดาที่ไม่มีตัวเลข/ชื่อมาตรฐานยังตรวจได้เฉพาะที่สุ่มอ่าน (ประมาณ 20 ข้อ) ไม่ได้อ่านทั้งหมดทุกบรรทัด
- ภาษาไทยยังไม่ผ่านผู้ตรวจที่เป็นเจ้าของภาษา

---

## 2026-11-10 — CL-009 · ผู้ใช้ตัดสินใจ: เก็บ repo เป็น Public

| # | จุดที่แก้ | เดิม | ใหม่ | เหตุผล |
|---|---|---|---|---|
| 1 | หัวไฟล์เฉลย 6 แห่ง (`README.md` บรรทัด 76, `docs/instructor/bug-catalogue.md`, `docs/instructor/exercise-keys.md`, `flaky.solution.spec.ts`, `06_pricing_datadriver.robot`) | "🔒 Instructor Only / อย่าแจกไฟล์นี้ / ผู้สอนเท่านั้น" | "⚠️ Spoiler … repo นี้เป็น public" + คำแนะนำให้ผู้เรียนลองเองก่อน หรือแจก repo ฉบับตัดเฉลยตอนสอนจริง | ข้อความเดิมไม่ตรงความจริงเมื่อ repo เป็น public — ทำให้ผู้สอนเข้าใจผิดว่าไฟล์ถูกซ่อน |

ไม่ได้ย้ายหรือลบไฟล์เฉลย (ผู้ใช้เลือกเก็บ public) · หมายเหตุสำหรับอนาคต: ถ้าจะซ่อนเฉลยภายหลัง ต้องเขียนประวัติ Git ใหม่ (ลบไฟล์ใน commit ใหม่ไม่พอ)

---

## 2026-11-10 — CL-008 · อ่านผล pipeline รอบแรก + แก้ Robot test ที่ไม่เสถียร

**ผล GitHub Actions (อ่านผ่าน API สาธารณะหลัง repo เป็น public):** run `757272b` = failure (เฉพาะ job `robot` ขั้น pabot; `unit`, `playwright` ×2, `api-newman` ผ่าน) · run `c26980a` = **success ทั้ง 5 jobs** (โค้ด test เหมือนกัน) → pipeline ใช้งานบน Linux ได้ แต่มี test ไม่เสถียรหนึ่งตัว
**หาสาเหตุ:** log/artifact ของ GitHub ต้องล็อกอิน (HTTP 403) จึงอ่านข้อความ error จริงไม่ได้ → จำลองบนเครื่องด้วย `pabot --processes 8` (CI มี CPU น้อยกว่า) → ล้ม **2/2 รอบ** ที่ test เดียว `Valid Customer Can Log In And Out`: `page.waitForNavigation: Timeout 10000ms exceeded` · **หมายเหตุ:** นี่คือการจำลองที่ให้อาการเดียวกัน ไม่ใช่การยืนยัน log ของรอบที่แดงจริงบน CI

| # | จุดที่แก้ | เดิม | ใหม่ | เหตุผล | อ้างอิง |
|---|---|---|---|---|---|
| 1 | `tests/robot/resources/pages/login_page.resource` › `Log Out` | `Click ${NAV_LOGOUT}` แล้ว `Wait For Navigation ${BASE_URL}/login` | `Click` แล้ว `Get Url == ${BASE_URL}/login` + comment อธิบาย | เริ่มรอ **หลัง** action: ถ้าหน้าเปลี่ยนเสร็จก่อน keyword รอเก้อจน timeout; `Get Url` เป็น assertion ที่ retry | – |
| 2 | `tests/robot/tests/ui/01_login.robot` › `Admin Lands On Back Office` | `Wait For Navigation ${BASE_URL}/admin` หลัง `Submit Credentials` | `Get Url == ${BASE_URL}/admin` | รูปแบบเดียวกัน (ยังไม่เคยล้ม แต่เสี่ยง) | – |
| 3 | `docs/modules/M17-flaky-tests-debugging.md` §6 | ไม่มี | เพิ่มแถวกรณีศึกษา "เริ่มรอหลัง action" | ใช้เป็นตัวอย่างจริงของ race | – |

**ผลหลังแก้:** `pabot --processes 8` ×3 รอบ = **44/44 ผ่านทุกรอบ** (ก่อนแก้ล้ม 2/2) · Playwright ไม่ได้รันซ้ำเพราะไม่ได้แก้ไฟล์ฝั่งนั้น

---

## 2026-11-10 — CL-007 · เชื่อม GitHub และ push (ผู้ใช้ให้ repo)

| # | จุดที่ทำ | รายละเอียด |
|---|---|---|
| 1 | Remote | `origin` = `https://github.com/KerkaiwanMam/Lean-AutomteTest.git` (ใช้ชื่อตามที่ผู้ใช้ให้ทุกตัวอักษร — สะกด "Automte") |
| 2 | ตรวจก่อน push | `gh` ไม่ได้ติดตั้ง · API แบบไม่ล็อกอินตอบ 404 → repo เป็น private หรือไม่มี · `git ls-remote` (อ่านอย่างเดียว) ผ่านโดยไม่มี error และไม่มี ref → repo มีจริง เข้าถึงได้ และว่างเปล่า |
| 3 | Push | `git push -u origin main` สำเร็จ; `origin/main` = `757272b` (ตรวจด้วย ls-remote) · ไม่ได้ใช้ force |
| 4 | ผล pipeline | **ยังไม่เห็น** — เปิด github.com ใน browser pane ไม่ได้ (ไม่ได้รับอนุญาต) และไม่มี `gh`; ไม่ได้ดึง token จาก credential store มาเรียก API เอง |
| 5 | ความเสี่ยงที่ระบุไว้ | repo เป็น private จึงไม่เปิดเผย `docs/instructor/*`; ถ้าจะเปิดเป็น public ต้องย้ายไฟล์เฉลยออกก่อน |

---

## 2026-11-10 — CL-006 · Git commit แรก (ผู้ใช้สั่ง "Commit now")

| # | จุดที่ทำ | รายละเอียด |
|---|---|---|
| 1 | `git init -b main` | repo ใหม่ที่ root ของโปรเจกต์ |
| 2 | Commit `372325d` | 169 ไฟล์ — หลักสูตร, ShopLab, Playwright/Robot, Postman, k6, CI, Dockerfile, โฟลเดอร์ 1–4 + `CLAUDE.md` · ไม่มี node_modules / .venv / ฐานข้อมูล / ผลรัน (ตรวจรายการ staged ก่อน commit) |
| 3 | Identity | ตั้งเฉพาะ commit นี้ด้วย `-c user.name/user.email` (ไม่แก้ git config ของเครื่อง) · message ลงท้ายด้วย Co-Authored-By ตามกติกา |
| 4 | สิ่งที่ไม่ได้ทำ | ไม่ push (ยังไม่มี remote) · ไม่ตั้ง `.gitattributes` — Git เตือน LF→CRLF ตอน checkout บน Windows แต่ blob ใน repo เป็น LF |

---

## 2026-11-10 — CL-005 · สร้างไฟล์โจทย์ที่แล็บอ้างถึง (Backlog P1 #5)

| # | จุดที่แก้ | เดิม | ใหม่ | เหตุผล | อ้างอิง |
|---|---|---|---|---|---|
| 1 | `tests/playwright/tests/exercises/flaky.spec.ts` + `flaky.solution.spec.ts` | ไม่มี (M17 Lab 17.2 บอกว่า "instructor ให้ไฟล์") | โจทย์ 6 tests + เฉลย; project `exercises` แบบ opt-in (`EXERCISES=1`) | ผู้เรียนทำแล็บไม่ได้ถ้าไม่มีไฟล์ | REF-086 |
| 2 | `tests/playwright/tests/exercises/bad-checkout.spec.ts` | ไม่มี (M15 Lab 15.4) | test เขียว 3 ตัวที่มี smell ครบ 8 แบบ | โจทย์ refactor ต้องเริ่มจากของที่ผ่านอยู่ | – |
| 3 | `tests/robot/data/pricing.csv` + `tests/robot/solutions/06_pricing_datadriver.robot` | ไม่มี (M12 Lab 12.2) | CSV 11 แถว + เฉลย; `requirements.txt` เพิ่มบรรทัด optional | แล็บ DataDriver ต้องมีข้อมูลและเฉลยที่ยืนยันแล้ว | REF-087 |
| 4 | `docs/instructor/exercise-keys.md` | ไม่มี | เฉลย + ผลวัดจริงของทั้ง 3 แล็บ | ผู้สอนต้องมี answer key | – |
| 5 | M12 Lab 12.2, M15 Lab 15.4, M17 Lab 17.2 | ประโยคเดียว "instructor ให้…" | ระบุไฟล์ คำสั่งรัน เป้าหมาย เกณฑ์ผ่าน | ให้ผู้เรียนเริ่มได้เอง | REF-086, REF-087 |
| 6 | `playwright.config.ts`, `package.json` | – | project `exercises` (opt-in) + scripts `test:exercises:*` | ไม่ให้โจทย์ที่ตั้งใจพังปนกับชุดทดสอบปกติ — ยืนยันแล้ว `--list` ยังเป็น 110 tests | – |

**ผลที่ยืนยันด้วยการรันจริง:**
- `flaky.spec.ts` ×20 (8 workers): test 1 = 14/20, 2 = 15/20, 3 = 1/20, 4 = 0/20, 5 = 0/20, 6 = 10/20 · `flaky.solution.spec.ts` ×20 = **120/120 ผ่าน**
- `bad-checkout.spec.ts`: เขียว 3/3 (รัน 4 ครั้ง ~28–29 วินาที) · `tsc --noEmit` ผ่าน
- `06_pricing_datadriver.robot`: ปกติ 11/11 ผ่าน · Bug Mode fail 5/11 (R2, R4, R5, R6, R9)

**ข้อผิดพลาดของตัวเองที่แก้ระหว่างทาง:** (1) test 5 เดิม (hover menu overlay) ผ่าน 20/20 เพราะแอปถูกแก้ไปแล้ว ไม่ใช่โจทย์จริง → เปลี่ยนเป็น modal ที่เปิดค้าง; ลองอีกแบบ (context menu บังปุ่มข้างๆ) ก็ผ่านเช่นกัน จึงไม่ใช้ (2) สร้างไฟล์ log หลุดนอกโฟลเดอร์โปรเจกต์ครั้งหนึ่ง ลบแล้ว

**ข้อจำกัด:** test 4–5 fail ทุกรอบ (ไม่ได้ intermittent จริง) — ระบุไว้ใน exercise-keys แล้ว

---

## 2026-11-10 — CL-004 · ตรวจ Dockerfile ของ ShopLab (ไม่มีเนื้อหาหลักสูตรเปลี่ยน)

| # | จุดที่แก้ | เดิม | ใหม่ | เหตุผล | อ้างอิง |
|---|---|---|---|---|---|
| 1 | `practice-app/.dockerignore` | ไม่มี | ตัด `node_modules`, `data`, `test`, Dockerfile ออกจาก build context | ไม่มีไฟล์นี้ `docker build` จะส่ง node_modules และฐานข้อมูล SQLite ทั้งก้อนเข้า context | – |
| 2 | `practice-app/Dockerfile` | ไม่มี comment เรื่อง test hooks | เพิ่ม comment: hooks เปิดโดยตั้งใจ ตั้ง `NODE_ENV=production` เพื่อปิด | ผู้ใช้ image ควรรู้ว่า `/api/test/*` เปิดอยู่ (REQ-SEC-05) | – |

**ผลการตรวจ:** Docker/Podman/WSL ไม่ได้ติดตั้งในเครื่อง จึง **ยังไม่ได้ build image จริง** · replay ขั้นตอนใน Dockerfile แบบ native ผ่าน: `npm ci --omit=dev` จากไฟล์ที่ COPY เท่านั้น → รันด้วย env ของ image → `/api/health` 200, หน้า `/` และ `/lab` 200, `BUG_MODE=1` เปิด bug mode ได้ · `NODE_ENV=production` → `/api/test/reset` ตอบ 404 ตามที่ comment ระบุ

---

## 2026-11-10 — CL-003 · Fact-check รอบที่ 1 (คิว 103 claims → todo 0)

**ผลรวม:** verified 22 · corrected 10 จุดใน claim + 6 จุดที่ตรวจเพิ่มนอกคิว · internal 10 · skip 61 (ไม่ใช่ข้อเท็จจริง: การออกแบบหลักสูตร, roadmap, คำสั่งแล็บ, คำถาม quiz)
**เครื่องมือ:** `extract_claims.py` → `apply_verdicts.py` (ใหม่) → `compare_versions.py` → `run_all.py` · verdicts อยู่ใน `fact-check-verdicts.csv`

| # | จุดที่แก้ | เดิม | ใหม่ | เหตุผล | อ้างอิง |
|---|---|---|---|---|---|
| 1 | M01 หลักการข้อ 3 | "หาบั๊กตอน requirement ถูกกว่าตอน production หลายสิบเท่า" | "หาบั๊กยิ่งเร็ว ยิ่งแก้ง่ายและถูกกว่า (ISTQB ไม่ได้ให้ตัวเลข — ตัวเลข 10–100 เท่า ที่อ้างกันบ่อยมีหลักฐานอ่อน)" | หลักการใน syllabus ไม่มีตัวเลขคูณ; หลักฐานของ cost curve ถูกวิจารณ์ว่าอ่อน | REF-001, REF-066 |
| 2 | M02 §6 Pairwise | "งานวิจัยพบว่าบั๊กส่วนใหญ่เกิดจาก interaction ของ 2 ปัจจัย" | "NIST (Kuhn et al. 2004): failure ส่วนใหญ่เกิดจากปัจจัยเดียวหรือสองปัจจัย (> 70% ในข้อมูลอุปกรณ์การแพทย์) ไม่พบเกิน 6 … ขั้นต่ำ 3 × 4 = 12" | ข้อความเดิมคลาดเคลื่อน (ละ "ปัจจัยเดียว") และไม่ระบุแหล่ง | REF-060, REF-067 |
| 3 | M02 Real-world notes | "(เร็วกว่า 100 เท่า)" | "(เร็วกว่ามาก — ดูเวลาต่อ test ในตาราง pyramid ของ M04)" | ตัวเลขคูณไม่มีการวัดรองรับ | – |
| 4 | M04 §3 Test pyramid | (ไม่มีหมายเหตุ) | เพิ่มหมายเหตุ: สัดส่วน % เป็นแนวทางคร่าวๆ; Cohn/Fowler ไม่ได้กำหนดตัวเลข | ป้องกันผู้เรียนเข้าใจว่า 60–70% เป็นมาตรฐาน | REF-045, REF-063 |
| 5 | M04 §5 DORA | 4 metrics รวม "time to restore" | 5 metrics 2 กลุ่ม (Throughput / Instability) + ชื่อใหม่ failed deployment recovery time + rework rate | DORA ปรับโมเดลแล้ว | REF-068, REF-046 |
| 6 | M05 §5 gTAA | อธิบายเป็น 4 "ชั้น" | เพิ่มหมายเหตุ: CTAL-TAE v2.0 เรียก capabilities, Test Generation ไม่บังคับ, มี 4 interfaces | ให้ตรง syllabus ฉบับปัจจุบัน | REF-002 |
| 7 | M07 §3 + locator cheat sheet | "open root → เจาะเข้าได้อัตโนมัติ" | เพิ่ม "(ยกเว้น XPath)" | docs ระบุว่า XPath ไม่เจาะ shadow root | REF-071 |
| 8 | M09 §4 + เฉลยข้อ 2 | "attached · visible · stable · enabled · รับ event ได้" | "visible · stable · receives events · enabled · not inert" + ตัวอย่าง fill() | รายการทางการไม่มี "attached" แยก และมี "not inert"; แต่ละ action ตรวจต่างกัน | REF-070 |
| 9 | M13 §1 | "เร็วกว่า UI 10–100 เท่า" | "เร็วกว่า UI มาก (ไม่ต้องเปิด browser และ render หน้า)" | ตัวเลขไม่มีการวัด | – |
| 10 | M13 §7 ตาราง OWASP API | หมวดตามชื่อฉบับ 2019 (Excessive data exposure, Mass assignment, Injection แยกแถว) | หมวดตามฉบับ 2023: API1, API2, API3 (รวม 2 หมวดเดิม), API4, API5 + หมายเหตุว่า Injection ไม่อยู่ใน API 2023 | ใช้ชื่อหมวดฉบับปัจจุบัน | REF-006 |
| 11 | M16 §1 ตาราง | "เร็วกว่า UI 50 เท่า" | "เร็วกว่าคลิกผ่าน UI มาก" | ตัวเลขไม่มีการวัด | – |
| 12 | M19 §2 a11y | "อัตโนมัติ (จับได้ ~30–50%)" | "Deque 2021: ~57% ของจำนวนปัญหา (ข้อมูลผู้ผลิต); นับตาม success criteria ต่ำกว่า (20–30%)" + ปรับเฉลยข้อ 2 | ตัวเลขเดิมไม่มีแหล่ง | REF-069 |
| 13 | M19 §4 ตาราง OWASP Top 10 | รหัสฉบับ 2021 (A02 Crypto, A03 Injection, A04 Insecure Design, A05 Misconfig, A07 Identification & Auth) | รหัสฉบับ 2025 (A02 Misconfig, A04 Crypto, A05 Injection, A06 Insecure Design, A07 Authentication Failures) + เพิ่มแถว A10 Mishandling of Exceptional Conditions + ปรับเฉลยข้อ 4 | OWASP Top 10:2025 ออกแล้ว | REF-076 |
| 14 | 01-course-overview ตาราง certification | "ISTQB Agile Tester / Test Automation Strategy" แถวเดียว · "Playwright (ไม่มีใบรับรองทางการ)" | แยก CTFL-AT และ CT-TAS (Specialist ต้องมี CTFL) · RFCP ระบุผู้ออก · Playwright "ไม่พบใบรับรองทางการจาก Microsoft/ทีม Playwright (มีของรายอื่น)" | ชื่อและเงื่อนไขใบรับรองให้ถูกต้อง | REF-077, REF-079 |
| 15 | 00-project-plan ตาราง priority | "งานจริงในบริษัท > 50% เป็น API/Integration" | "งานจริงจำนวนมากเป็น API/Integration และ business rule ทดสอบที่ API ได้เร็วและเสถียรกว่า" | ตัวเลขไม่มีแหล่ง | – |
| 16 | M20 §5 Test maturity | "อ้างอิงโมเดล: TMMi, TPI NEXT" | ระบุว่าเป็นฉบับย่อของหลักสูตร ชื่อระดับตาม TMMi (staged) และ TPI NEXT เป็นแบบ continuous | ไม่ให้เข้าใจว่าเป็นนิยามทางการของ TMMi | REF-082, REF-083 |
| 17 | M21 §4 | "Applitools แยกการเปลี่ยนที่มีความหมายกับ noise ได้ดีกว่า pixel diff" | "ผู้ผลิตระบุว่า … ยังไม่พบ benchmark อิสระ ควรทดลองกับหน้าจริง" | เป็นคำกล่าวอ้างของผู้ผลิต | REF-084 |
| 18 | M22 บรรทัด 5 | "เทียบเท่า "Practical Skills Exam" ของ CCNA" | "เทียบได้กับการสอบภาคปฏิบัติ (skills exam) ในหลักสูตร CCNA" | ยังไม่ได้ยืนยันชื่อการสอบที่แน่นอน | – |

**ยืนยันแล้ว ไม่ต้องแก้:** CTFL บทที่ 1/4/5 (M01–M03), CTAL-TAE บทที่ 1–2 และ 3 (M05, M15), 7 principles, Testing Trophy, ที่มาของ quadrants, Node ≥ 22.13, RF 7 VAR, RF 4 `--skiponfailure`, ZAP baseline, WebDriver W3C, Playwright test agents, RFCP

**Verification (ขั้นที่ 3):** `compare_versions.py` กับ backup ทั้ง 15 ไฟล์ — similarity 92–99.9%, ไม่มีหัวข้อหาย, ลำดับ section ไม่เปลี่ยน (เปลี่ยนชื่อหัวข้อ M13 §7 โดยตั้งใจ) · `run_all.py` ผ่านทั้ง 4 ตรวจ

**ข้อจำกัด:** `extract_claims.py` จับเฉพาะประโยคที่มีตัวเลข/ชื่อมาตรฐาน/ชื่อเครื่องมือ — ข้อเท็จจริงที่เขียนเป็นข้อความธรรมดาอาจหลุดคิว (เช่น ตาราง 7 principles ถูกตรวจเพิ่มด้วยมือ) · แหล่งที่ระบุ "via search summary" ยังไม่ได้เปิดอ่านต้นฉบับเต็ม

---

## 2026-11-10 — CL-002 · ตั้งระบบ workflow 4 ขั้นตอน + baseline audit

| # | จุดที่แก้ | เดิม | ใหม่ | เหตุผล | อ้างอิง |
|---|---|---|---|---|---|
| 1 | โครงสร้างโปรเจกต์ | ไม่มี | `1. memory folder`, `2. reference folder`, `3. asset folder`, `4. script folder` | ผู้ใช้กำหนดโครงสร้างการจัดเก็บและ workflow | – |
| 2 | `CLAUDE.md` (ใหม่) | ไม่มี | กติกา workflow 4 ขั้น + รูปแบบการตอบ + ห้ามใช้ sunline-eps-tests | ให้ทุก session ทำตามโดยอัตโนมัติ | – |
| 3 | `4. script folder/` | ไม่มี | `audit_structure.py`, `text_lint.py`, `extract_claims.py`, `check_links.py`, `compare_versions.py`, `run_all.py`, prompt templates | เครื่องมือสำหรับขั้นที่ 1–3 | – |
| 4 | `text_lint.py` | ตรวจคำไทยซ้ำแบบ regex ตรงๆ → false positive 3 จุด | เพิ่ม allowlist จาก `3. asset folder/lint-allowlist.txt` และตรวจขอบคำของ term ทั้งหน้าและหลัง | ภาษาไทยไม่มีเว้นวรรค ขอบคำที่ถูกต้องดูเหมือนคำซ้ำ: "ยกตัวอย่าง\|อย่างละ" (M03:115), "ทำไม\|ทำไม่ได้" (M07:123), "เป้าหมาย\|ตายตัว" (M20:37) — ตรวจด้วยตาแล้วถูกต้องทั้งหมด | – |
| 5 | `docs/modules/M22-capstone-and-career.md` บรรทัด 2 | (ไม่มีบรรทัดนี้) | `<!-- audit-exempt: lab, quiz, answers (capstone module …) -->` | M22 ตั้งใจไม่มี lab/quiz ท้ายบท เพราะ capstone + final exam แทน; ทำเครื่องหมายให้ audit รู้ แทนการแก้เนื้อหา | – |
| 6 | `2. reference folder/references.md` | ไม่มี | ดัชนีแหล่งอ้างอิง 31 รายการ (REF-001…065) สถานะ `candidate` | รวมแหล่งที่หลักสูตรอ้างแนวคิดมา เพื่อใช้ fact-check ต่อ — **ยังไม่ได้เปิดอ่านยืนยัน** | REF-001…065 |
| 7 | `3. asset folder/glossary.md`, `quotes.md` | ไม่มี | ศัพท์ 33 คำ (มีคอลัมน์ canonical spelling ให้ lint ใช้), quote 2 รายการ สถานะ candidate | คลังคำศัพท์และวัตถุดิบกลาง | REF-040 |
| 8 | `1. memory folder/fact-check-queue.csv` | ไม่มี | 105 claims จากเอกสารทั้งหมด สถานะ `todo` | คิวงาน fact-check ขั้นที่ 1 | – |

**ผล baseline (หลังแก้):** structure 22/22 OK · broken links 0 · text lint 0 · fact-check queue 105 todo
**เนื้อหาหลักสูตร:** ไม่มีการเปลี่ยนข้อความสอน (มีเพียง comment ใน M22)

---

## 2026-11-10 — CL-001 · สร้างหลักสูตร v1.0
สร้าง plan, overview, 22 modules, templates, cheat sheets, ShopLab, reference frameworks (Playwright/Robot), Postman, k6, CI, Dockerfile.
แก้ระหว่างทาง (จากผลการรันจริง): header ShopLab ลบ `aria-label` ที่ไม่ตรงข้อความ (axe `label-content-name-mismatch`), เมนู hover blur หลังคลิก, แยก project `ui-admin`, Robot `browser.resource`, Newman `disableCookies`, visual project แบบ opt-in, tsconfig สำหรับ TypeScript 7
