# Test Strategy — <Product>

1. **Purpose & quality goals** — what "good enough" means for this product (business goals, SLAs, compliance)
2. **Context** — architecture, users, release cadence, team structure
3. **Risk profile** — risk matrix (likelihood × impact) of product areas; review cadence
4. **Test levels & types** — per level: objective, owner, tools, entry/exit
5. **Automation strategy** — pyramid with target ratios, what to automate / not, tool choices (ADR links), framework architecture, ownership & review rules
6. **Test data & environments** — data strategy (seed, factories, masking/PDPA), environment list & parity, test-hooks policy
7. **CI/CD & quality gates** — what runs on PR / merge / nightly / release; gate thresholds
8. **Non-functional testing** — performance, security, accessibility, compatibility: targets + approach
9. **Defect management** — workflow, severity/priority definitions, triage cadence, RCA for critical bugs
10. **Metrics & reporting** — chosen metrics with targets, dashboards, audience
11. **Roles & skills** — RACI, training plan
12. **Continuous improvement** — retrospectives, maturity goals, tool evaluation
