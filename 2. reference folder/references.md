# Reference Index

> หนึ่งแถวต่อหนึ่งแหล่ง · อ้างใน change log และ `1. memory folder/fact-check-verdicts.csv` ด้วย ID (`REF-xxx`)
> **Status:** `candidate` = หลักสูตรอ้างแนวคิดมาแต่ยังไม่ได้เปิดอ่านยืนยัน · `verified YYYY-MM-DD` = เปิดอ่านแล้วตรงกับเนื้อหา · `superseded` = มีฉบับใหม่กว่า
> **Tier:** A = มาตรฐาน/เอกสารทางการ · B = หนังสือ/ตำราที่ได้รับการยอมรับ · C = งานวิชาการ peer-reviewed · D = บทความผู้เชี่ยวชาญ/ผู้ผลิต
> **How read:** direct = เปิดหน้า/ไฟล์ต้นฉบับ · via summary = อ่านผ่านบทคัดย่อ/หน้าสรุปของผู้เผยแพร่

## Standards & syllabi
| ID | Source | Tier | URL / Publisher | Used in | Status | Key facts confirmed |
|---|---|---|---|---|---|---|
| REF-001 | ISTQB CTFL Syllabus v4.0 (certification page) | A | https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0 | M01–M05 | verified 2026-11-10 (direct page; 7 principles via study notes) | 6 chapters: 1 Fundamentals · 2 SDLC · 3 Static · 4 Test Analysis & Design · 5 Managing Test Activities · 6 Test Tools; principle "Early testing saves time and money" has no multiplier |
| REF-002 | ISTQB CTAL-TAE Syllabus v2.0 (2024) | A | https://www.istqb.org/wp-content/uploads/2024/11/ISTQB_CTAL-TAE_Syllabus_v2.0.pdf | M05, M15–M18 | verified 2026-11-10 (direct PDF) | 8 chapters (3 = Test Automation Architecture); gTAA capabilities: generation (optional), definition, execution, adaptation; 4 interfaces |
| REF-003 | ISO/IEC/IEEE 29119 Software Testing | A | ISO | M02, M03 | candidate | |
| REF-004 | W3C WCAG 2.2 | A | https://www.w3.org/TR/WCAG22/ | M19 | candidate (POUR is common knowledge, not re-read) | |
| REF-005 | OWASP Top 10:2021 | A | https://owasp.org/Top10/ | M19 | superseded by REF-076 | |
| REF-006 | OWASP API Security Top 10 – 2023 | A | https://api-security.owasp.org/editions/2023/en/0x11-t10 | M13, M19 | verified 2026-11-10 (direct) | API1 BOLA · API2 Broken Authentication · API3 BOPLA (= 2019 Excessive Data Exposure + Mass Assignment) · API4 Unrestricted Resource Consumption · API5 BFLA · no Injection category |
| REF-007 | OpenAPI Specification 3.0.3 | A | https://spec.openapis.org/oas/v3.0.3 | M13 | candidate | |
| REF-008 | RFCP syllabus (old placeholder) | A | – | – | superseded by REF-079 | |
| REF-076 | OWASP Top 10:2025 | A | https://top10.owasp.org/2025 | M19 | verified 2026-11-10 (direct) | A01 Broken Access Control · A02 Security Misconfiguration · A03 Software Supply Chain Failures · A04 Cryptographic Failures · A05 Injection · A06 Insecure Design · A07 Authentication Failures · A08 Software or Data Integrity Failures · A09 Security Logging and Alerting Failures · A10 Mishandling of Exceptional Conditions |
| REF-077 | ISTQB Certified Tester Test Automation Strategy (CT-TAS) | A | https://www.istqb.org/certifications/certified-tester-test-automation-strategy | 01-overview | verified 2026-11-10 (via search summary of istqb.org pages) | Specialist stream; CTFL required; CTFL-AT recommended companion |
| REF-079 | Robot Framework Certified Professional (RFCP) syllabus | A | https://robotframework.org/robotframework-RFCP-syllabus/ | M11, M12, 01-overview | verified 2026-11-10 (via search summary) | Official syllabus by Robot Framework Foundation (v1.0.1, v1.1.0) |
| REF-080 | W3C WebDriver Level 1 Recommendation | A | https://www.w3.org/TR/2018/REC-webdriver1-20180605/ | M05 | verified 2026-11-10 (via search summary) | Recommendation 5 June 2018; derived from Selenium WebDriver |

## Official tool documentation
| ID | Source | Tier | URL | Used in | Status | Key facts confirmed |
|---|---|---|---|---|---|---|
| REF-020 | Playwright docs (general) | A | https://playwright.dev/docs/intro | M09, M10 | candidate | |
| REF-070 | Playwright — Auto-waiting / Actionability | A | https://playwright.dev/docs/actionability | M09 | verified 2026-11-10 (direct) | click: visible, stable, receives events, enabled, not inert; fill: visible, enabled, editable, not inert |
| REF-071 | Playwright — Locators (Shadow DOM) | A | https://playwright.dev/docs/locators | M07, cheat sheet | verified 2026-11-10 (direct) | Locators pierce shadow DOM by default; not XPath; closed mode unsupported |
| REF-086 | Playwright — TestInfo (`repeatEachIndex`) | A | https://playwright.dev/docs/api/class-testinfo | M17 Lab 17.2 | verified 2026-11-10 (direct) | `repeatEachIndex` = unique repeat index in `--repeat-each` mode |
| REF-087 | robotframework-datadriver README | A | https://github.com/Snooz82/robotframework-datadriver | M12 Lab 12.2 | verified 2026-11-10 (direct; v1.11.2 run on this machine) | First column `*** Test Cases ***`; arg columns named like `${username}`; default dialect Excel-EU (`;`), default encoding cp1252; import `file=`, `dialect=` |
| REF-072 | Playwright — Test Agents | A | https://playwright.dev/docs/test-agents | M21 | verified 2026-11-10 (direct) | planner, generator, healer; healer may skip a test it thinks is broken |
| REF-021 | Robot Framework User Guide | A | https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html | M11, M12 | candidate | |
| REF-074 | Robot Framework 7.0 release notes | A | https://github.com/robotframework/robotframework/releases/tag/v7.0 | M11 | verified 2026-11-10 (via search summary) | Native VAR syntax (#3761), released 11 Jan 2024 |
| REF-081 | Robot Framework 4.0 release notes | A | https://github.com/robotframework/robotframework/blob/master/doc/releasenotes/rf-4.0rc2.rst | M12 | verified 2026-11-10 (via search summary) | Criticality removed; SKIP + --skiponfailure added; --noncritical deprecated alias |
| REF-022 | Robot Framework Browser library docs | A | https://marketsquare.github.io/robotframework-browser/Browser.html | M11, M12 | candidate (behaviour confirmed by running tests; Drag And Drop implementation read in site-packages) | |
| REF-023 | RequestsLibrary / DatabaseLibrary / Pabot docs | A | MarketSquare GitHub | M12–M14 | candidate | |
| REF-024 | Grafana k6 documentation | A | https://grafana.com/docs/k6/latest/ | M19 | candidate | |
| REF-025 | axe-core rules (Deque) | A | https://github.com/dequelabs/axe-core | M19 | candidate | |
| REF-026 | Microsoft PICT | A | https://github.com/microsoft/pict | M02 | verified 2026-11-10 (URL in course; tool exists) | |
| REF-027 | Postman / Newman docs | A | https://learning.postman.com/ | M13 | candidate | |
| REF-073 | Node.js — node:sqlite | A | https://nodejs.org/api/sqlite.html | README, overview | verified 2026-11-10 (direct) | Added v22.5.0; unflagged v22.13.0 / v23.4.0; stability 1.2 release candidate |
| REF-075 | ZAP — Baseline Scan | A | https://www.zaproxy.org/docs/docker/baseline-scan/ | M19 | verified 2026-11-10 (direct) | `ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t <url>`; passive, no attacks |

## Books
| ID | Source | Tier | Publisher | Used in | Status |
|---|---|---|---|---|---|
| REF-040 | Myers, Sandler, Badgett — *The Art of Software Testing*, 3rd ed. | B | Wiley, 2011 | M01, M02 | candidate |
| REF-041 | Crispin & Gregory — *Agile Testing* | B | Addison-Wesley, 2009 | M04 | candidate (quadrant origin confirmed via REF-085) |
| REF-042 | Crispin & Gregory — *More Agile Testing* | B | Addison-Wesley, 2014 | M04, M20 | candidate |
| REF-043 | Kaner, Bach, Pettichord — *Lessons Learned in Software Testing* | B | Wiley, 2002 | M01, M03 | candidate |
| REF-044 | Hendrickson — *Explore It!* | B | Pragmatic Bookshelf, 2013 | M02 | candidate |
| REF-045 | Cohn — *Succeeding with Agile* | B | Addison-Wesley, 2009 | M04 | verified 2026-11-10 via REF-063 (origin of the test pyramid) |
| REF-046 | Forsgren, Humble, Kim — *Accelerate* | B | IT Revolution, 2018 | M04, M20 | candidate (original four metrics; current set in REF-068) |
| REF-047 | Adzic — *Specification by Example* | B | Manning, 2011 | M04 | candidate |
| REF-066 | Bossavit — *The Leprechauns of Software Engineering* | B | Leanpub | M01 | verified 2026-11-10 (via reviews/summaries) — argues the evidence for the exponential defect-cost curve is weak |

## Academic / industry research & expert articles
| ID | Source | Tier | Venue | Used in | Status | Key facts confirmed |
|---|---|---|---|---|---|---|
| REF-060 | Kuhn, Wallace, Gallo — "Software Fault Interactions and Implications for Software Testing" | C | IEEE TSE 30(6):418–421, 2004 | M02 | verified 2026-11-10 (via abstract summary + REF-067) | > 70% of medical-device failures triggered by 1–2 conditions; none above 6 |
| REF-067 | NIST — Interactions involved in software failures | A | https://csrc.nist.gov/projects/automated-combinatorial-testing-for-software/combinatorial-methods-in-testing/interactions-involved-in-software-failures | M02 | verified 2026-11-10 (direct) | "most failures were caused by one or two parameters, with progressively fewer by three or more"; 1–6 factors |
| REF-061 | Luo et al. — "An Empirical Analysis of Flaky Tests" | C | FSE 2014 | M17 | candidate | |
| REF-062 | Google Testing Blog — "Flaky Tests at Google and How We Mitigate Them" | D | 2016 | M17 | candidate | |
| REF-063 | Martin Fowler — "TestPyramid" (bliki) | D | https://martinfowler.com/bliki/TestPyramid.html | M04 | verified 2026-11-10 (direct) | Pyramid from Cohn 2009; no fixed percentages |
| REF-064 | Kent C. Dodds — "The Testing Trophy and Testing Classifications" | D | https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications | M04 | verified 2026-11-10 (direct) | Static → Unit → Integration → E2E; "Mostly integration" |
| REF-065 | Marick — Agile testing matrix (2003 blog series) | D | exampler.com | M04 | candidate (origin confirmed via REF-085) | |
| REF-068 | CD Foundation — "DORA's 5 metrics" | D | https://cd.foundation/blog/2025/10/16/dora-5-metrics/ | M04, M20 | verified 2026-11-10 (direct) | Throughput: lead time, deployment frequency, failed deployment recovery time · Instability: change failure rate, rework rate |
| REF-069 | Deque — "Automated testing study identifies 57 percent of digital accessibility issues" | D | https://www.deque.com/blog/automated-testing-study-identifies-57-percent-of-digital-accessibility-issues | M19 | verified 2026-11-10 (direct) | 57% by issue volume, > 2,000 audits / 13,000 pages / ~300,000 issues; earlier belief 20–30%; vendor data |
| REF-082 | TMMi Foundation — TMMi model (5 staged levels) | A | tmmi.org | M20 | verified 2026-11-10 (via search summary) | Initial, Managed, Defined, Measured/Management & Measurement, Optimization |
| REF-083 | Sogeti — TPI NEXT | B | Sogeti | M20 | verified 2026-11-10 (via search summary) | Continuous model, 16 key areas |
| REF-084 | Applitools docs — Visual AI | D | https://applitools.com/docs/autonomous/visual-ai | M21 | verified 2026-11-10 (via search summary) | Vendor states it ignores rendering noise; no independent benchmark found |
| REF-085 | Lisa Crispin — "The testing quadrants – we got it wrong" (and Gojko Adžić critique) | D | Goodreads author blog / gojko.net 2013 | M04 | verified 2026-11-10 (via search summary) | Quadrants adapted by Crispin & Gregory from Brian Marick's matrix |
