# Project Context — QA Automation Academy

**Goal:** a complete, CCNA/NetAcad-style Thai course "Test Automation Engineer: Zero to Expert" (testing principles → Playwright & Robot Framework → framework design → CI/CD → non-functional → leadership), with a self-built practice website (ShopLab) usable for every module and for real-company practice.

**Hard rule:** no content from `sunline-eps-tests`.

## What exists (v1.0, 2026-11-10)
| Area | Location | Notes |
|---|---|---|
| Plan, priorities, gap analysis, roadmap | `docs/00-project-plan.md` | |
| Course overview, assessment, competency matrix | `docs/01-course-overview.md` | |
| 22 modules (5 levels) | `docs/modules/` | 73 labs · 97 quiz questions |
| Templates / cheat sheets / bug catalogue | `docs/templates/`, `docs/cheatsheets/`, `docs/instructor/` | |
| ShopLab practice app | `practice-app/` | Express 5 + node:sqlite, Bug Mode (13 bugs), chaos, Elements Lab, OpenAPI |
| LoanLab practice module (since CL-013) | `practice-app/src/loanlab/`, `src/routes/loanlab*.js`, `public/loanlab/`, `REQUIREMENTS-LOANLAB.md` | Fictional retail lending & payment domain inside the same app and login: Account, Loan, Payment, Reversal (partial allowed), EOD (T+1, reconciliation), test hooks, 13 seeded bugs `LL-BUG-01..13` (same bugMode / GRADING_BUGS switches). Money stored in satang. Never present a LoanLab rule as a real bank's rule |
| Reference frameworks | `tests/playwright/`, `tests/robot/` | ShopLab: 110 + 45 tests green; all 13 bugs caught in Bug Mode · LoanLab: 52 Playwright (projects `loanlab`, `loanlab-eod`) + 6 Robot (`tests/loanlab`), 13/13 LL bugs caught one at a time by each |
| Postman, k6, CI, Docker | `tests/postman/`, `tests/performance/`, `.github/workflows/`, `practice-app/Dockerfile` | k6, CI, Docker not yet executed |

## Roadmap alignment (since 2026-11-10, CL-012)
- Baseline: the user's 16-chapter "Quality Engineering & Test Automation" roadmap (banking domain, TypeScript + Python, Playwright + Robot Framework) — unchanged copy in `2. reference folder/inputs/`.
- `docs/audit/2026-11-10-content-audit-report.md` — audit of the 22 modules against the roadmap, corrections AC-01..AC-14 (proposed, not applied), gap analysis, proposal.
- `docs/02-master-curriculum.md` — Master Curriculum v2.0 (draft): 6 parts, 20 chapters, each with 8 fixed sections; maps every module to a chapter; Appendix A = draft spec of the banking practice system "LoanLab" (built in CL-013; the appendix stays a draft on purpose because its section C is the exercise of Lab 2.6 — the confirmed rules and the answers live only in `practice-app/REQUIREMENTS-LOANLAB.md`).
- This machine has no Playwright-bundled Chromium: run browser tests with `PW_CHANNEL=chrome` (Playwright) and `BROWSER_CHANNEL=chrome` (Robot); `pabot` needs the venv's `Scripts` folder on PATH.
- The modules keep their M01–M22 names until the structure is approved.

## Content workflow (since 2026-11-10)
Defined in `CLAUDE.md`: audit & fact-check → scripts in `4. script folder` → verify against original → log in `1. memory folder/change-log.md`. Responses use the headings [Reference Added] / [Script / Tool Action] / [Verification & Analysis] / [Memory Log].
