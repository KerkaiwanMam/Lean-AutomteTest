# Progress & Backlog

_Last updated: 2026-11-23 (CL-015)_

## Status
| Item | Status |
|---|---|
| Course v1.0 (22 modules) | ✅ written · structure audit 22/22 |
| ShopLab + reference tests | ✅ green (Playwright 110, Robot 45, unit 12, Newman 29) · Bug Mode 13/13 caught |
| Content workflow & scripts | ✅ set up (CL-002) |
| Fact-check rounds 1-2 | done (CL-003, CL-010): queue 105 claims, todo 0 (22 verified, 12 corrected, 10 internal, 61 skip) · references: 60 total — 46 verified, 4 partially verified, 2 superseded, 8 candidate (6 books not opened, Google flaky blog, Marick origin) |
| Content audit vs 16-chapter roadmap | ✅ done (CL-012): `docs/audit/2026-11-10-content-audit-report.md` — 149 rows: Complete 71, Partial 47, Missing 19, Needs Correction 5, Outdated 3, Misplaced 2, Duplicate 2 |
| Master Curriculum v2.0 | 🟡 draft for approval (CL-012): `docs/02-master-curriculum.md` — 20 chapters; content-map rows ✅ 124 · ✏️ 11 · 🆕 38 · 📝 16 · ⛔ 0 (after CL-013; was 🆕 37 · ⛔ 1) · modules M01–M22 not yet edited or renumbered |
| LoanLab practice module | ✅ merged to `main` via PR #1 (CL-013, CL-014) · back office page + Postman folder + CI reporter on branch `feat/loanlab-officer` (CL-015) · local: unit 69, Playwright 165, Robot 51, newman 47 assertions all green · CI on `main`: 4 of 6 runs green, `playwright (2/2)` failed twice — cause not confirmed (logs need sign-in); likely the ShopLab registration avatar race fixed in CL-015 · not piloted with learners |

## Open decisions for the user (from CL-013)
- ~~Merge `feat/loanlab-officer`~~ merged as PR #2 (2026-11-27), CI green on the PR and on main · if `playwright (2/2)` fails again, the `github` reporter annotations name the test
- Capstone pass mark on LoanLab: proposed 10 of 13 seeded bugs, same as ShopLab
- Review the `design`-level rules in `REQUIREMENTS-LOANLAB.md` that were not part of the 8 confirmed answers (the rule "reversal `reference` identifies a duplicate" was confirmed by the user on 2026-11-16 and is no longer open) — remaining: officer may pay on a customer's behalf, principal range 1,000–1,000,000, check order of payment and reversal errors
- Build a Transfer page? Roadmap Ch 5 lists it; outside Appendix A. Needs rules first: source/target (own loan accounts only? other customers?), limits, fees, effect on EOD
- Master curriculum Appendix A stays a draft on purpose (section C is the Lab 2.6 exercise): ASM-01 and ASM-02 there and the state-transition paragraph in Ch 2 (§2.5, "POSTED → REVERSED เป็น valid transition เดียว") now differ from the built system because partial reversal was chosen — keep as the pre-review draft, or reword without giving the answer away?

## Open decisions for the user (from CL-012)
- Approve the 20-chapter structure (4 chapters added to the roadmap's 16)?
- Apply corrections AC-01..AC-14 to the module files? (texts are ready in the audit report, section 3)
- ~~Build the banking practice system "LoanLab" (master curriculum Appendix A)?~~ built in CL-013
- Bibliographic data for *Designing Data & AI Sovereignty* and *Software-Architekturmuster, Antimuster und Fallstricke* (not found by title)

## Backlog from the audit (priority order)
- **P0** apply AC-01..AC-14 · ~~build LoanLab~~ done (CL-013) · confirm structure
- **LoanLab follow-ups** ~~CI~~ (CL-014) · ~~Postman~~ · ~~officer UI~~ (CL-015) · Transfer page (needs rules) · confirm the CI shard 2/2 cause · run in Docker · pilot Lab 6.4, 12.4 and the banking capstone with learners
- **P1** write Ch 19 (Testing AI-based Applications) labs — needs an LLM-backed practice app and a vetted evaluation tool · fill Ch 3 gaps (Python file I/O, modules, exceptions, tuple/set; TS interface; JWT, OAuth, HTTPS, XML, Linux) · the 16 "📝 To write" subchapters listed in the master curriculum's Open Items
- **P2** Docker fundamentals with a real run · GitLab CI example pipeline · JSON validation and data-driven API tests in the Robot suite · rename module files to the new chapter numbers

## Backlog (priority order)
### P0
1. ~~Git init + first commit~~ ✅ done (CL-006): commit `372325d` on `main`, 169 files, local only — **not pushed** (no remote configured); author identity was set for that one commit only (`git config user.name/user.email` is still empty on this machine)
2. CI pipeline — **ทำงานบน Linux แล้ว (CL-008):** run `c26980a` เขียวทั้ง 5 jobs; run แรกแดงที่ `robot` (race ใน `Log Out`) แก้แล้วและยืนยันด้วย stress 8 process ×3 · run หลังแก้ `039c77d` (id 42827331070) เขียวทั้ง 5 jobs — แต่รันเขียวครั้งเดียวไม่พิสูจน์ว่าหายไม่เสถียร (run `c26980a` ก็เขียวทั้งที่โค้ดเดิม); หลักฐานจริงคือ stress 8 process ล้ม 2/2 → ผ่าน 3/3 · repo ตอนนี้เป็น **public** (ผู้ใช้เปลี่ยน) — ไฟล์เฉลย `docs/instructor/*` และ `*.solution*` เปิดสาธารณะอยู่ **ผู้ใช้ตัดสินใจเก็บ public (CL-009)** — หัวไฟล์เฉลยเปลี่ยนเป็น 'Spoiler' แล้ว
3. `docker build` of `practice-app/Dockerfile` — **partially verified (2026-11-10, CL-004):** Docker/Podman/WSL not installed on this machine, so no real image was built. Dockerfile steps were replayed natively (npm ci --omit=dev on only the COPY'd files, run with the image's env, health check, NODE_ENV=production hides hooks); `.dockerignore` added. Still to do on a machine with Docker: `docker build`, `docker run`, confirm the `node:24-alpine` tag, `wget` HEALTHCHECK, and the BUG_MODE=1 example in M16

### P1
4. ~~Fact-check round 2~~ done (CL-010). Left over: open the 6 books (REF-040..044, 047) to check bibliographic data and the Myers quote wording; get the Kuhn 2004 PDF to check the >70% figure before re-adding it; read the TMMi Model document; have a native-Thai QA reviewer read the course
5. ~~Files that labs say the instructor provides~~ ✅ done (CL-005): `flaky.spec.ts` (+ solution), `bad-checkout.spec.ts`, `pricing.csv` (+ solution), `docs/instructor/exercise-keys.md`
6. ~~Skills Assessments 1–4~~ done (CL-011): docs/assessments/ + tools/grade_suite.py + GRADING_BUGS mode + SA2 auto-checked challenge + instructor key. Left: try the grader on a Robot suite; pilot the rubrics on real learner work
7. Final exam question bank (60 questions, M22)
8. Lab solution guides for instructors
9. Native Thai QA reviewer pass (language + practice fit)

### P2
10. Run k6 · 11. ESLint/Prettier + Robocop/Robotidy configs · 12. Firefox/WebKit/mobile projects · 13. Robot Bug Mode result table · 14. Visual baselines from CI/Docker

### P3
Slides, online quizzes, GraphQL/WebSocket, mobile + Appium, capstone auto-grading (see `docs/00-project-plan.md`)
