# Test Plan — <Project / Release>

| Item | Value |
|---|---|
| Version / Date | v0.1 · YYYY-MM-DD |
| Author / Reviewers | |
| Related | User stories, REQUIREMENTS.md, Test Strategy |

## 1. Scope
**In scope:** features / requirement IDs (e.g. REQ-PRC-01..07, REQ-ORD-01..08)
**Out of scope:** (and why — e.g. real payment gateway integration, load > 50 VU)

## 2. Approach
| Level / Type | What | Manual / Automated | Tool | Owner |
|---|---|---|---|---|
| Unit | pricing rules | Auto | node:test | Dev |
| API | cart / orders / authz | Auto | Playwright request / RequestsLibrary | QA |
| UI E2E | login, checkout smoke | Auto | Playwright / Robot Browser | QA |
| Exploratory | coupons, checkout edge cases | Manual (charters) | – | QA |
| Non-functional | p95 < 500 ms, WCAG AA | Auto | k6, axe | QA |

## 3. Risks & Mitigations
| # | Risk | L | I | Mitigation |
|---|---|---|---|---|
| 1 | VAT/discount miscalculated | H | H | decision-table tests at unit + API + 1 UI |
| 2 | Test environment unstable | M | H | Docker env per CI job, health check |
| 3 | | | | |

## 4. Environments & Test Data
URLs, versions, accounts (reference to secret store), data strategy (seed + factory), reset procedure.

## 5. Entry Criteria
- Build deployed to test environment, smoke passes
- Requirements reviewed, open questions answered

## 6. Exit Criteria
- 100% High-priority test cases executed and passed
- No open Critical/High defects (or accepted by PO in writing)
- Automated regression pass rate ≥ 98%, no flaky test in the gate
- NFR thresholds met

## 7. Schedule & Roles
| Activity | Start | End | Who |
|---|---|---|---|

## 8. Deliverables
Test cases / automated suites, RTM, bug reports, Test Summary Report
