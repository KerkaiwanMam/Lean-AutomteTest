# QA Automation Academy — Test Automation Engineer: Zero to Expert

หลักสูตร Test Automation แบบ CCNA/NetAcad (โมดูล → ทฤษฎี → แล็บ → แบบทดสอบ → Skills Assessment)
สอนหลักการทดสอบตั้งแต่พื้นฐาน, **Playwright**, **Robot Framework**, API/DB/Performance/A11y/Security testing, **การออกแบบโครงสร้าง framework** และ CI/CD — พร้อมเว็บฝึก **ShopLab** ที่สร้างขึ้นเพื่อหลักสูตรนี้โดยเฉพาะ

| เริ่มที่ | ลิงก์ |
|---|---|
| แผนงาน, ลำดับความสำคัญ, gap analysis, roadmap | [docs/00-project-plan.md](docs/00-project-plan.md) |
| ภาพรวมหลักสูตร, learning path, การประเมิน, competency matrix | [docs/01-course-overview.md](docs/01-course-overview.md) |
| คู่มือ 22 โมดูล | [docs/modules/](docs/modules/) |
| Requirement ของเว็บฝึก (ใช้ออกแบบ test) | [practice-app/REQUIREMENTS.md](practice-app/REQUIREMENTS.md) |
| Templates / Cheat sheets | [docs/templates/](docs/templates/) · [docs/cheatsheets/](docs/cheatsheets/) |
| เฉลยบั๊กสำหรับผู้สอน | [docs/instructor/bug-catalogue.md](docs/instructor/bug-catalogue.md) |

---

## Quick Start

**ต้องมี:** Node.js ≥ 22.13 (แนะนำ 24), Python ≥ 3.10, Git, Google Chrome

### 1) เว็บฝึก ShopLab
```bash
cd practice-app
npm ci
npm test            # unit tests ของ pricing (12 tests)
npm start           # http://localhost:3000
```
- `/` ร้านค้า · `/lab` Elements Lab (15 UI patterns ที่ automate ยาก) · `/admin` back office · `/api-docs` API · `/a11y.html` หน้าฝึก accessibility
- บัญชีทดสอบ: `customer` / `Passw0rd!` · `jane` / `Passw0rd!` · `admin` / `Admin123!` · `locked` · `slow` (ดู `practice-app/src/seed-data.js`)
- Reset ข้อมูล: `curl -X POST http://localhost:3000/api/test/reset`
- **Bug Mode** (บั๊กฝังไว้ 13 ตัว): `npm run start:bugs` หรือ `POST /api/test/config {"bugMode": true}`
- Chaos: `POST /api/test/config {"latencyMs": 1000, "failureRate": 0.3}`
- Docker: `docker build -t shoplab ./practice-app && docker run --rm -p 3000:3000 shoplab`

### 2) Playwright (TypeScript)
```bash
cd tests/playwright
npm ci
npx playwright install chromium        # หรือใช้ Chrome ในเครื่อง: PW_CHANNEL=chrome
npm test                               # api + ui + ui-admin (start ShopLab ให้อัตโนมัติถ้ายังไม่รัน)
npm run test:bugs                      # รันกับ Bug Mode → ต้องแดง
npm run report                         # HTML report
```
PowerShell: `$env:PW_CHANNEL="chrome"; npm test`

### 3) Robot Framework
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1           # macOS/Linux: source .venv/bin/activate   ← ห้ามลืม!
pip install -r requirements.txt
rfbrowser init                         # หรือ: rfbrowser init --skip-browsers แล้วตั้ง BROWSER_CHANNEL=chrome
cd tests/robot
robot --outputdir results tests                                     # ShopLab ต้องรันอยู่
robot --outputdir results --variable BUG_MODE:True --exclude legacy tests   # Bug Mode
curl -X POST http://localhost:3000/api/test/reset
pabot --processes 4 --outputdir results --variable RESET_DATA:False --exclude legacy tests
```

### 4) อื่นๆ
```bash
newman run tests/postman/ShopLab.postman_collection.json -e tests/postman/local.postman_environment.json
k6 run tests/performance/k6-smoke-load.js
```

---

## โครงสร้าง Repository
```
.
├── docs/
│   ├── 00-project-plan.md            แผนงาน + priority + gap analysis + roadmap
│   ├── 01-course-overview.md         หลักสูตร, การประเมิน, competency matrix, ตารางเรียน 12 สัปดาห์
│   ├── modules/M01…M22               คู่มือการสอน (ทฤษฎี + labs + quiz + checklist)
│   ├── templates/                    test plan/case/strategy/summary, bug report, framework review
│   ├── cheatsheets/                  Playwright, Robot Framework, Locators
│   └── instructor/bug-catalogue.md   เฉลย Bug Mode (ผู้สอนเท่านั้น)
├── practice-app/                     ShopLab: Express 5 + SQLite (node:sqlite) + HTML/JS
│   ├── src/                          server, routes, pricing, config (bug mode/chaos), openapi
│   ├── public/                       UI: shop, cart, checkout, orders, admin, lab, a11y, api-docs
│   ├── test/pricing.test.js          unit tests (node:test)
│   ├── REQUIREMENTS.md               SRS พร้อม requirement IDs
│   └── Dockerfile
├── tests/
│   ├── playwright/                   reference framework (TS): config/ api/ pages/ fixtures/ data/ utils/
│   ├── robot/                        reference framework: libraries/ resources/ tests/{ui,api,db,legacy}
│   ├── postman/                      collection + environment (Newman)
│   └── performance/                  k6 smoke/load
├── .github/workflows/test.yml        CI: unit → Playwright (sharded) + Robot (pabot) + Newman
└── requirements.txt                  Python deps สำหรับ Robot Framework
```

## หลักสูตร 22 โมดูล

| Level | Modules |
|---|---|
| 1 Foundations | [M01 Testing Fundamentals](docs/modules/M01-testing-fundamentals.md) · [M02 Test Design Techniques](docs/modules/M02-test-design-techniques.md) · [M03 Process & Defects](docs/modules/M03-test-process-and-defects.md) · [M04 Agile/DevOps/Pyramid](docs/modules/M04-agile-devops-test-pyramid.md) |
| 2 Automation Foundations | [M05 Strategy & Tools](docs/modules/M05-automation-strategy.md) · [M06 Git/CLI/Env](docs/modules/M06-toolchain-git-cli.md) · [M07 Web, Locators, HTTP](docs/modules/M07-web-fundamentals-locators.md) · [M08 Programming](docs/modules/M08-programming-for-testers.md) |
| 3 Tools | [M09 Playwright Fundamentals](docs/modules/M09-playwright-fundamentals.md) · [M10 Playwright Advanced](docs/modules/M10-playwright-advanced.md) · [M11 Robot Fundamentals](docs/modules/M11-robot-framework-fundamentals.md) · [M12 Robot Advanced](docs/modules/M12-robot-framework-advanced.md) · [M13 API & Contract](docs/modules/M13-api-testing.md) · [M14 Database & Data](docs/modules/M14-database-data-testing.md) |
| 4 Engineering | [M15 Framework Architecture](docs/modules/M15-framework-architecture.md) · [M16 Test Data & Environments](docs/modules/M16-test-data-environments.md) · [M17 Flaky & Debugging](docs/modules/M17-flaky-tests-debugging.md) · [M18 CI/CD & Reporting](docs/modules/M18-ci-cd-reporting.md) · [M19 Non-functional](docs/modules/M19-non-functional-testing.md) |
| 5 Expert | [M20 Strategy & Leadership](docs/modules/M20-quality-strategy-leadership.md) · [M21 AI-Assisted Testing](docs/modules/M21-ai-assisted-testing.md) · [M22 Capstone & Career](docs/modules/M22-capstone-and-career.md) |

## ผลการตรวจสอบ (verified 2026-11-10, Windows 11, Chrome)

| Suite | Normal mode | Bug Mode |
|---|---|---|
| Unit (`node:test`) | 12/12 ✅ | – |
| Playwright api + ui + ui-admin | 110/110 ✅ (incl. setup) | 30 failed — **ครบทั้ง 13 BUG-IDs** ✅ |
| Playwright visual (opt-in) | 3/3 ✅ หลังสร้าง baseline | การ์ด visual ถูกจับได้ ✅ |
| Robot Framework (Browser, Requests, Database, Selenium) | 45/45 ✅ · pabot ×4: 44/44 ใน 32 วินาที (จาก 93) | guard tests fail ตามคาด ✅ |
| Newman | 29/29 assertions ✅ | – |

> ไม่มีเนื้อหาจาก `sunline-eps-tests` ในหลักสูตรนี้ · ShopLab เป็นแอปฝึกที่สร้างขึ้นใหม่ทั้งหมด ไม่ใช่ร้านค้าจริง
