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
| Reference frameworks | `tests/playwright/`, `tests/robot/` | 110 + 45 tests green; all 13 bugs caught in Bug Mode |
| Postman, k6, CI, Docker | `tests/postman/`, `tests/performance/`, `.github/workflows/`, `practice-app/Dockerfile` | k6, CI, Docker not yet executed |

## Content workflow (since 2026-11-10)
Defined in `CLAUDE.md`: audit & fact-check → scripts in `4. script folder` → verify against original → log in `1. memory folder/change-log.md`. Responses use the headings [Reference Added] / [Script / Tool Action] / [Verification & Analysis] / [Memory Log].
