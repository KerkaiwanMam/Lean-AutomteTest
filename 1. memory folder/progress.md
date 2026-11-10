# Progress & Backlog

_Last updated: 2026-11-10 (CL-010)_

## Status
| Item | Status |
|---|---|
| Course v1.0 (22 modules) | ✅ written · structure audit 22/22 |
| ShopLab + reference tests | ✅ green (Playwright 110, Robot 45, unit 12, Newman 29) · Bug Mode 13/13 caught |
| Content workflow & scripts | ✅ set up (CL-002) |
| Fact-check rounds 1-2 | done (CL-003, CL-010): queue 105 claims, todo 0 (22 verified, 12 corrected, 10 internal, 61 skip) · references: 60 total — 46 verified, 4 partially verified, 2 superseded, 8 candidate (6 books not opened, Google flaky blog, Marick origin) |

## Backlog (priority order)
### P0
1. ~~Git init + first commit~~ ✅ done (CL-006): commit `372325d` on `main`, 169 files, local only — **not pushed** (no remote configured); author identity was set for that one commit only (`git config user.name/user.email` is still empty on this machine)
2. CI pipeline — **ทำงานบน Linux แล้ว (CL-008):** run `c26980a` เขียวทั้ง 5 jobs; run แรกแดงที่ `robot` (race ใน `Log Out`) แก้แล้วและยืนยันด้วย stress 8 process ×3 · run หลังแก้ `039c77d` (id 42827331070) เขียวทั้ง 5 jobs — แต่รันเขียวครั้งเดียวไม่พิสูจน์ว่าหายไม่เสถียร (run `c26980a` ก็เขียวทั้งที่โค้ดเดิม); หลักฐานจริงคือ stress 8 process ล้ม 2/2 → ผ่าน 3/3 · repo ตอนนี้เป็น **public** (ผู้ใช้เปลี่ยน) — ไฟล์เฉลย `docs/instructor/*` และ `*.solution*` เปิดสาธารณะอยู่ **ผู้ใช้ตัดสินใจเก็บ public (CL-009)** — หัวไฟล์เฉลยเปลี่ยนเป็น 'Spoiler' แล้ว
3. `docker build` of `practice-app/Dockerfile` — **partially verified (2026-11-10, CL-004):** Docker/Podman/WSL not installed on this machine, so no real image was built. Dockerfile steps were replayed natively (npm ci --omit=dev on only the COPY'd files, run with the image's env, health check, NODE_ENV=production hides hooks); `.dockerignore` added. Still to do on a machine with Docker: `docker build`, `docker run`, confirm the `node:24-alpine` tag, `wget` HEALTHCHECK, and the BUG_MODE=1 example in M16

### P1
4. ~~Fact-check round 2~~ done (CL-010). Left over: open the 6 books (REF-040..044, 047) to check bibliographic data and the Myers quote wording; get the Kuhn 2004 PDF to check the >70% figure before re-adding it; read the TMMi Model document; have a native-Thai QA reviewer read the course
5. ~~Files that labs say the instructor provides~~ ✅ done (CL-005): `flaky.spec.ts` (+ solution), `bad-checkout.spec.ts`, `pricing.csv` (+ solution), `docs/instructor/exercise-keys.md`
6. Skills Assessments 1–4 (tasks + rubrics)
7. Final exam question bank (60 questions, M22)
8. Lab solution guides for instructors
9. Native Thai QA reviewer pass (language + practice fit)

### P2
10. Run k6 · 11. ESLint/Prettier + Robocop/Robotidy configs · 12. Firefox/WebKit/mobile projects · 13. Robot Bug Mode result table · 14. Visual baselines from CI/Docker

### P3
Slides, online quizzes, GraphQL/WebSocket, mobile + Appium, capstone auto-grading (see `docs/00-project-plan.md`)
