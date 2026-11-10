# M18 — CI/CD, Docker, Parallelism & Reporting

> **Level 4 · Engineering** · ⏱ 8 ชม. · Prerequisite: M15–M17 · Reference: `.github/workflows/test.yml`, `practice-app/Dockerfile`

## 🎯 Learning Objectives
1. ออกแบบ **pipeline** ที่ให้ feedback เร็ว (stages, triggers, quality gates)
2. เขียน pipeline บน **GitHub Actions** (และรู้ความเทียบเท่าใน GitLab CI / Jenkins / Azure DevOps)
3. รัน test แบบ **parallel และ sharded**, เก็บ **artifacts** (report, trace, video)
4. ทำ **reporting**: HTML, JUnit XML, Allure, Robot report, dashboard, การแจ้งเตือน
5. ใช้ **Docker** ใน pipeline และเข้าใจ caching

---

## 📖 1. Pipeline design
```
 PR opened ──▶ lint + unit (1–2 นาที) ──▶ API tests (2–3 นาที) ──▶ UI smoke (5 นาที) ──▶ ✅ merge allowed
 merge main ─▶ full regression (sharded, 10–20 นาที) ──▶ deploy staging ──▶ smoke on staging
 nightly   ──▶ cross-browser + visual + a11y + performance ──▶ report + Slack/Teams
```
หลักการ: **fail fast** (test เร็ว/ถูกรันก่อน) · **ทุก job สร้าง env ของตัวเอง** · **artifact ทุกครั้งที่ fail** · **ห้ามมี "sometimes red" pipeline**

## 📖 2. GitHub Actions — อ่าน reference workflow
```yaml
on: { push: { branches: [main] }, pull_request: {}, workflow_dispatch: {inputs: {bug_mode: …}}, schedule: [{ cron: '0 1 * * 1-5' }] }
jobs:
  unit:        # node:test ของ pricing
  playwright:  # needs: unit · matrix shard [1/2, 2/2] · upload playwright-report + test-results
  robot:       # needs: unit · start ShopLab · pabot 4 processes · upload results
  api-newman:  # newman + junit reporter
```
จุดที่ควรสังเกต
- `concurrency` ยกเลิก run เก่าเมื่อ push ใหม่ (ประหยัดเวลา)
- `workflow_dispatch` input `bug_mode` — **ทดลองว่า pipeline แดงจริงเมื่อมีบั๊ก** (pipeline ที่ไม่เคยแดง น่าสงสัย)
- `if: ${{ !cancelled() }}` → upload artifact แม้ test fail
- `webServer` ใน Playwright config start ShopLab ให้เอง · Robot job start ด้วย `npm start &` + `wait-on`

**เทียบเครื่องมือ CI**
| GitHub Actions | GitLab CI | Jenkins | Azure DevOps |
|---|---|---|---|
| `jobs.<id>.steps` | `stages` + jobs | `pipeline { stages {} }` (Jenkinsfile) | `stages/jobs/steps` (YAML) |
| `strategy.matrix` | `parallel: matrix` | `matrix {}` / parallel stages | `strategy: matrix` |
| `actions/upload-artifact` | `artifacts:` | `archiveArtifacts`, `junit` | `PublishTestResults`, `PublishPipelineArtifact` |
| secrets | CI/CD variables (masked) | Credentials | Library / Key Vault |

## 📖 3. Parallelism & Sharding
| ระดับ | Playwright | Robot |
|---|---|---|
| ในเครื่องเดียว | `workers: N`, `fullyParallel` | `pabot --processes N` (`--testlevelsplit`) |
| ข้ามเครื่อง | `--shard=i/n` + `merge-reports` (blob reporter) | แบ่ง suite ตาม tag/โฟลเดอร์ ต่อ job + `rebot --merge` |

```bash
# รวม report ของ shard (Playwright)
npx playwright test --shard=1/4 --reporter=blob     # ทุก shard
npx playwright merge-reports --reporter html ./all-blob-reports
```
⚠️ Parallel ได้เฉพาะเมื่อ test **isolated** (M16) · จำนวน worker ใน CI ควร ≈ จำนวน CPU core

## 📖 4. Reporting
| ผู้อ่าน | ต้องการ | เครื่องมือ |
|---|---|---|
| Developer ที่ทำ PR | test ไหน fail, ทำไม, trace | Playwright HTML + trace, Robot log.html, PR annotations |
| QA Lead | แนวโน้ม pass/flaky/duration | Allure TestOps, ReportPortal, Grafana |
| PO/ผู้บริหาร | พร้อมปล่อยไหม, ความเสี่ยง | Test summary report (M03), dashboard |
| Test management | ผลต่อ test case/requirement | JUnit XML → Xray/Zephyr/TestRail/Azure Test Plans |

- **JUnit XML** เป็น "ภาษากลาง" — Playwright `['junit', { outputFile }]`, Robot `--xunit xunit.xml`, Newman `--reporters junit`
- **Allure:** `allure-playwright`, `allure-robotframework` → report รวมหลายเครื่องมือ พร้อม history
- **แจ้งเตือน:** Slack/Teams webhook เมื่อ main แดง — สั้น กดลิงก์ไปหา report ได้ทันที

## 📖 5. Docker ใน pipeline
- Build image ของแอปครั้งเดียว ใช้ทุก job (ลดเวลาและ "build ต่างกัน")
- รัน test ใน **image ของ Playwright** (`mcr.microsoft.com/playwright:v<version>-noble` — tag มีตัว `v` นำหน้าเลขเวอร์ชัน และควรตรึงให้ตรงกับเวอร์ชัน Playwright ของโปรเจกต์) → browser/font ตรงกันทุกเครื่อง (สำคัญมากกับ visual test)
- `services:` ใน GitHub Actions/GitLab เพื่อรัน DB/mock คู่กับ job
- Cache: `actions/setup-node` cache npm, `actions/setup-python` cache pip, cache `~/.cache/ms-playwright`

## 📖 6. Quality gates
- PR: unit + API + UI smoke ต้องผ่าน · ไม่มี test ใหม่ที่ flaky · (optional) coverage ไม่ลด
- Release: regression ผ่าน ≥ 98% (ที่เหลือมี ticket + approve) · ไม่มีบั๊ก Critical · performance thresholds ผ่าน (k6) · a11y serious = 0
- ใช้ **branch protection rules** บังคับ required checks

---

## 🧪 Lab 18.1 — Pipeline ของตัวเอง (90 นาที)
นำ framework จาก Lab 15.2 ขึ้น GitHub (หรือ GitLab) สร้าง pipeline: install → start ShopLab → smoke → full → upload artifacts · ทำให้ PR แสดงสถานะ

## 🧪 Lab 18.2 — Red pipeline drill (30 นาที)
รัน workflow ด้วย `bug_mode: true` (หรือ env `BUG_MODE=1`) — ยืนยันว่า pipeline **แดง** และ report ชี้บั๊กได้ชัด · เขียน message Slack สรุปที่ทีมอ่านแล้วทำต่อได้

## 🧪 Lab 18.3 — Sharding & merge (45 นาที)
แบ่ง Playwright เป็น 3 shards ด้วย blob reporter แล้ว merge เป็น HTML report เดียว · เทียบเวลารวม

## 🧪 Lab 18.4 — Allure (45 นาที, optional)
เพิ่ม `allure-playwright` และ `allure-robotframework` สร้าง report รวม

---

## ✅ Check Your Understanding
1. ทำไมต้องอัปโหลด artifact แม้ test ผ่าน/ไม่ผ่าน?
2. Sharding ต่างจาก workers อย่างไร?
3. ทำไมควรทดสอบว่า pipeline "แดงได้"?
4. JUnit XML มีประโยชน์อย่างไรในองค์กรที่ใช้หลายเครื่องมือ?
5. ทำไม visual test ควรรันใน Docker image เดียวกันทุกครั้ง?

<details><summary>เฉลย</summary>

1. เมื่อ fail ต้องมีหลักฐาน debug (trace/log) โดยไม่ต้องรันซ้ำ; เมื่อผ่านใช้เป็นหลักฐาน/ประวัติ (retention สั้นได้)
2. workers = ขนานในเครื่องเดียว · shard = แบ่ง test ข้ามหลายเครื่อง/job
3. pipeline ที่ตั้งค่าผิด (เช่น ไม่รัน test, ignore exit code) จะเขียวตลอด = ความมั่นใจปลอม
4. เป็นรูปแบบกลางที่ CI/test management แทบทุกตัวอ่านได้ → รวมผล Playwright/Robot/Newman ได้
5. font rendering, anti-aliasing, OS ต่างกันทำให้ screenshot ต่างกัน → false failure
</details>

## 📋 Skills Checklist
- [ ] เขียน CI pipeline ที่ start แอป + รัน test + เก็บ artifacts
- [ ] ใช้ parallel/sharding ได้
- [ ] ส่งผลเป็น JUnit/HTML/Allure ได้
- [ ] ออกแบบ quality gates ของ PR และ release
