# M06 — Tester's Toolchain: Git, CLI, VS Code, Node & Python

> **Level 2 · Automation Foundations** · ⏱ 5 ชม. · Prerequisite: ไม่มี

## 🎯 Learning Objectives
1. ใช้ command line (PowerShell / bash) ทำงานพื้นฐานได้คล่อง
2. ใช้ **Git** ตาม workflow ของทีม: branch, commit, pull request, resolve conflict
3. ติดตั้งและจัดการ **Node.js (npm)** และ **Python (venv, pip)** แบบแยก environment
4. ตั้งค่า **VS Code** สำหรับงาน automation (extensions, debugger, formatter)
5. รัน ShopLab และ reference test suites ทั้งหมดบนเครื่องตัวเอง

---

## 📖 1. Command line ที่ต้องใช้บ่อย

| งาน | PowerShell (Windows) | bash (macOS/Linux/Git Bash) |
|---|---|---|
| อยู่ที่ไหน / ย้าย | `pwd`, `cd tests\playwright` | `pwd`, `cd tests/playwright` |
| ดูไฟล์ | `ls`, `cat file` | `ls -la`, `cat file` |
| ตั้ง env var ชั่วคราว | `$env:BUG_MODE="1"; npx playwright test` | `BUG_MODE=1 npx playwright test` |
| หา process ที่ใช้ port | `Get-NetTCPConnection -LocalPort 3000` | `lsof -i :3000` |
| เรียก API | `Invoke-RestMethod -Method Post http://localhost:3000/api/test/reset` | `curl -X POST http://localhost:3000/api/test/reset` |

## 📖 2. Git สำหรับ Automation Engineer

**Test code คือ production code** — ต้องอยู่ใน version control, ผ่าน code review, มี history

```bash
git clone <repo-url> && cd <repo>
git switch -c feature/TC-PRC-coupon-tests     # 1 branch ต่อ 1 งาน
# ... แก้โค้ด ...
git status && git diff                         # ตรวจก่อน commit เสมอ
git add tests/playwright/tests/ui/cart-pricing.spec.ts
git commit -m "test(cart): add decision-table tests for coupons (REQ-PRC-02)"
git push -u origin feature/TC-PRC-coupon-tests
# เปิด Pull Request → review → CI ผ่าน → merge
```

**Commit message** แนะนำรูปแบบ [Conventional Commits](https://www.conventionalcommits.org/): `test:`, `fix:`, `chore:`, `refactor:`, `ci:`
**.gitignore** — ห้าม commit: `node_modules/`, `.venv/`, report/result, video/trace, **ไฟล์ที่มีรหัสผ่าน (.env)** — ดู `.gitignore` ของ repo นี้

### Conflict
```
<<<<<<< HEAD
const TIMEOUT = 10_000;
=======
const TIMEOUT = 15_000;
>>>>>>> feature/slow-env
```
เลือก/รวมค่าที่ถูก → ลบ marker → `git add` → `git commit`

### Branching strategy ที่พบบ่อย
- **Trunk-based** — branch สั้น merge เข้า `main` บ่อย (เหมาะกับ CI/CD)
- **GitFlow** — `develop`, `release/*`, `hotfix/*` (องค์กรที่ release เป็นรอบ)
- Test code ควรอยู่ **repo เดียวกับแอป** (ถ้าทำได้) เพื่อให้ test เปลี่ยนพร้อมโค้ด

## 📖 3. Node.js และ Python environment

**Node.js** — `package.json` = รายการ dependency + scripts · `package-lock.json` = เวอร์ชันที่ล็อกจริง (commit เสมอ)
```bash
npm ci            # ติดตั้งตาม lock file (ใช้ใน CI)
npm install       # ติดตั้ง/อัปเดต (ตอนพัฒนา)
npm run <script>  # รัน script ใน package.json
npx <tool>        # รัน tool ที่ติดตั้งในโปรเจกต์
```

**Python** — ใช้ **virtual environment** แยกต่อโปรเจกต์เสมอ
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1        # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
rfbrowser init                       # ดาวน์โหลด Playwright สำหรับ Robot Browser library
```
> ⚠️ บทเรียนจริงจากการสร้างหลักสูตรนี้: รัน `pabot` โดย **ไม่ได้ activate venv** ทำให้ pabot ไปเรียก `robot` ของ Python ระบบซึ่งไม่มี RequestsLibrary → fail ทั้ง 44 tests ด้วย `No keyword with name 'Create Session' found` — **activate venv ก่อนเสมอ**

## 📖 4. VS Code setup
Extensions แนะนำ: **Playwright Test for VSCode** (รัน/debug/record test), **RobotCode** (Robot Framework LSP + debugger), **ESLint/Prettier**, **Python**, **GitLens**, **REST Client** หรือ **Thunder Client**, **EditorConfig**

Settings ที่มีประโยชน์: format on save, auto save, แสดง whitespace, ruler 120 ตัวอักษร

---

## 🧪 Lab 06.1 — ติดตั้งทุกอย่างและรัน repo (60 นาที)
ทำตาม [README Quick Start](../../README.md#quick-start) จน:
1. `npm test --prefix practice-app` → 12 passed
2. ShopLab เปิดได้ที่ http://localhost:3000
3. `npx playwright test` ใน `tests/playwright` → ผ่านทั้งหมด
4. `robot tests` ใน `tests/robot` (venv activated) → ผ่านทั้งหมด

## 🧪 Lab 06.2 — Git workflow (45 นาที)
1. สร้าง repo ของตัวเอง (GitHub/GitLab) เป็น "workspace" สำหรับทั้งหลักสูตร
2. สร้าง branch `lab/06-git` เพิ่มไฟล์ `notes/lab06.md` commit 3 ครั้งด้วย conventional commits
3. เปิด PR ให้เพื่อน review แล้ว merge
4. (Challenge) สร้าง conflict โดยตั้งใจ แล้ว resolve

## 🧪 Lab 06.3 — CLI กับ ShopLab API (30 นาที)
ใช้ curl หรือ `Invoke-RestMethod` ทำ: reset → login (เก็บ token) → ดู `/api/auth/me` → เปิด bug mode → ปิด bug mode

---

## ✅ Check Your Understanding
1. ทำไมใน CI ใช้ `npm ci` แทน `npm install`?
2. ไฟล์ใดต้อง commit: `package-lock.json`, `node_modules/`, `.env`, `playwright.config.ts`, `test-results/`?
3. ทำไมต้องใช้ venv แยกต่อโปรเจกต์?
4. ตั้งค่า `BASE_URL` ชั่วคราวใน PowerShell ก่อนรัน Playwright เขียนอย่างไร?

<details><summary>เฉลย</summary>

1. ติดตั้งตาม lock file แบบ reproducible, เร็วกว่า, fail ถ้า lock ไม่ตรงกับ package.json
2. commit: `package-lock.json`, `playwright.config.ts` · ห้าม: `node_modules/`, `.env`, `test-results/`
3. ป้องกันเวอร์ชัน library ชนกันระหว่างโปรเจกต์ และทำให้ทุกคน/CI ได้ environment เดียวกัน
4. `$env:BASE_URL="http://staging.example.test"; npx playwright test`
</details>

## 📋 Skills Checklist
- [ ] clone/branch/commit/push/PR/resolve conflict ได้
- [ ] สร้าง venv และติดตั้ง requirements ได้
- [ ] รันทุก suite ใน repo นี้ได้ด้วยตัวเอง

## 🚀 Real-world Notes
- ตั้ง **branch protection**: ห้าม push ตรง `main`, ต้องมี review 1 คน + CI ผ่าน
- ใช้ **pre-commit hooks** (husky / pre-commit) รัน lint/format ก่อน commit
- เก็บ secret ใน **CI secret store / vault** ไม่ใช่ใน repo — ถ้าเผลอ commit ต้อง **rotate** ทันที (ลบ commit ไม่พอ)
