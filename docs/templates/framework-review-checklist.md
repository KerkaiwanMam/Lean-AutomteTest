# Test Framework Review Checklist (score 0–2 each)

## Architecture
- [ ] Clear layers: tests → fixtures/keywords → page/service objects → data → utils → config
- [ ] Tests contain no selectors, URLs or raw HTTP calls
- [ ] Page/service objects contain no business assertions
- [ ] Single config source; environment switch via env vars only
- [ ] Secrets not in repo; masked in logs/reports

## Test quality
- [ ] Names describe behaviour and expected result
- [ ] Meaningful assertions (business outcome, not only "no error")
- [ ] Test design techniques visible (BVA, decision tables, state transitions)
- [ ] Right level of the pyramid for each rule
- [ ] Requirement/bug IDs traceable (tags/names)

## Reliability
- [ ] No fixed sleeps
- [ ] Tests isolated (own data), order-independent, parallel-safe
- [ ] Flaky rate measured; quarantine process exists
- [ ] Passes `--repeat-each=3` / repeated pabot runs

## Maintainability
- [ ] Locators resilient (role/label/test-id) and defined once
- [ ] Builders/factories for data; no copy-paste
- [ ] Lint/format in CI (ESLint/Prettier, Robocop/Robotidy)
- [ ] README lets a new member run the first test in ≤ 15 minutes

## Operations
- [ ] Runs in CI on every PR with artifacts (trace/log/report)
- [ ] JUnit/HTML reporting; failures easy to diagnose
- [ ] Runtime within budget (smoke < 5 min, regression < 30 min)
- [ ] Proven to go red when bugs exist (bug mode / mutation testing)

**Score:** __ / 40 · Top 5 recommendations (ordered by impact × effort):
