# Thailand: test automation / QA / SDET practice and expectations at leading companies

Method note: Evidence level is marked per item. "Fetched" means I opened the page and read it this session. "Snippet-only" means the claim comes from a web-search result summary and the page was NOT opened (or failed to open); treat as unverified. Many Thai job pages (JobThai, JobsDB, Breezy, Greenhouse, KKP, SCB careers) were closed, 403, 404 or redirect-looping when fetched, so job-requirement evidence is thin. No salary figure here comes from an official source. Search tool is US-only, so Thai-language coverage is weaker than it should be. Research was stopped after exceeding the recommended tool-call budget; the gaps below are real gaps, not exhaustively searched.

## 1. What do Thai job postings for QA Automation / SDET require?

### Takeaway
Fetched postings from Bangkok employers consistently ask for Playwright (preferred) with Cypress/Selenium as alternatives, JavaScript/TypeScript or Python, API testing (Postman, REST Assured, Playwright API), CI/CD with Git, and risk-based test strategy. ISTQB appears as "nice to have" or in Thai-bank group contexts, never (in what I could read) as a hard requirement. I could NOT produce a statistically meaningful count; only a handful of postings were fully read.

### Cited Findings
Fetched (read in full this session):
- Manatal (Bangkok HR-tech SaaS), Senior QA Engineer, on-site Bangkok: 4+ years in QA; JavaScript/TypeScript; UI/API/integration/E2E tests with "Playwright preferred, Cypress, Selenium or similar"; API tools Postman, REST Assured or Playwright API; CI/CD, Git, pull-request workflows; risk-based test strategy; functional and non-functional testing (reliability, performance, security, accessibility); supports CI/CD quality gates; SQL and AI-assisted QA tools nice to have; fluent English required; Agile environment; no ISTQB mention; no salary — [Manatal Senior QA Engineer](https://careers.manatal.com/jobs/cd647b94-3c22-4724-b145-0095881b6d7d)
- Talance (client: Bangkok IT consultancy and venture builder), Senior QA Engineer (AI-Augmented Automation): 2+ years automation; Playwright preferred, Selenium or Robot Framework; Python/JavaScript; CI/CD QA pipeline; API and performance testing; practical use of AI tools for test design and test code; soft skills listed: problem-solving, communication, collaboration; no ISTQB, no salary — [Talance posting](https://careers-page.com/talance-jobs/job/4R7R4657)
- Pattern across the two fetched postings: AI-assisted testing is now an explicit requirement or nice-to-have in 2026-era Bangkok postings (inference from 2 postings, small sample).

Snippet-only (from search-result summaries; pages not opened or not readable; UNVERIFIED):
- A Bangkok QA Engineer posting lists ISTQB Foundation as "preferred"; a senior role asks for ISTQB Advanced or equivalent; a Thai-language posting asks for test-automation certification (ISTQB-TAE); an EPAM Bangkok role lists ISTQB Advanced Test Automation Engineer as nice-to-have — search summary of [a Bangkok query result set](https://www.monster.co.th/job/quality-assurance-automation-tester-epam-thailand-48146667) (EPAM link is the one identifiable source; the others were not individually identified in the summary)
- Sertis (Bangkok data/AI company) Senior QA Engineer: Pytest, Playwright, Locust in CI/CD (Locust, not k6, for load) — summary of [Sertis Greenhouse posting](https://job-boards.greenhouse.io/sertis/jobs/8147758002) (page itself failed to show details; the Sertis careers listing I fetched shows no QA role currently, so the posting may be closed)
- ATA IT (Bangkok, owned by National Bank of Canada per search summary) Senior SDET: Playwright or Selenium, Java, REST Assured, GitHub Actions — [4dayweek listing](https://4dayweek.io/job/senior-sdet-at-ata-it-650c8150)
- Ajaib Senior SDET (lead-level; k6, JMeter, Gatling, OWASP, GitHub Actions/GitLab CI/Jenkins) — appeared in a Bangkok-focused search but Ajaib is an Indonesian company; location unconfirmed — [search result set](https://th.jobsdb.com/performance-testing-engineer-jobs/in-Bangkok)
- Thai-language JobsDB result summary (not a statistic): Software Tester salary listings of about THB 30,000-45,000/month (Khlong San), 20,000-45,000 (Bang Na), Automate QA Engineer 1-year contract THB 45,000-60,000 with 3+ years; a junior role listing JMeter and k6 at THB 20,000-27,000. Tool mentions across Thai postings: Playwright, Cypress, Robot Framework, Postman, SoapUI, RestAssured, JMeter, K6, LoadRunner, Jenkins, SQL, Git, JS/TS/Python/Java — [JobsDB automate tester search](https://th.jobsdb.com/th/automate-tester-jobs) (page returned 403 to me; figures are from the search summary only)
- Central Group: a Blognone job post lists "QA Automation" at Central Technology Office requiring experience leading test-automation teams and defining technical test strategy; undated, may be stale — [Blognone](https://blognone.com/node/101802). A WorkVenture Central Technology Office software tester page is marked expired.
- Makro PRO / Lotus's (CP Axtra group, not Central) have Senior Software Test Engineer / Lead Software QA / automation section-manager listings (tool-building and frameworks) — [Makro PRO via Workable](https://jobs.workable.com/jobs/b9eedbde-e222-4692-8c62-349744958f52.md) (404 when I fetched; snippet-only)
- SCB TechX (search summaries): QA roles asking 3+ years building automated frameworks with Selenium or Cypress; Tech QA Manager role focused on QA tooling, automation, AI solutions; QA Engineer Team Lead requiring 1+ year leading manual and automation teams; Associate Software QA Engineer entry-level — [SCB TechX Breezy board](https://scb-techx-co-ltd.breezy.hr/p/958f4b5f9b9e-software-qa-manager-2025) (Breezy page showed "no longer accepting candidates"; summaries only), [SCBX Automation QA Engineer, Cloud COE](https://www.scbx.com/en/?p=20650) (fetch failed on redirects)
- KKP (Kiatnakin Phatra) Bangkok QA Automation Engineer / Senior QA Automation Engineer postings exist (Selenium, Appium or Robot Framework, CI/CD per search summary) — [KKP careers](https://careers.kkpfg.com/job/Bangkok-Senior-Quality-Assurance-Automation-Engineer/36908544) (filled when fetched)
- LINE Thailand QA Engineer postings (Playwright/Cypress/Jest named in summary) — [LINE careers](https://careers.linecorp.com/jobs/2929) (403 to me; snippet-only)
- Agoda: Bangkok "Software Tester" 10- and 12-month contract roles exist; one is described as exploratory-testing focused (summary only) — [Agoda careers](https://careersatagoda.com/job/8027947-software-tester-bangkok-based-10-months-contract/) (403)
- Grab: the SDET/QA postings found are Malaysia-based (Petaling Jaya) and name Python/JS/Go, BDD frameworks such as Playwright, Selenium, Cucumber, 2+ years; no Grab Thailand QA/SDET posting found (Grab Thailand listings found were support operations) — [Grab SmartRecruiters](https://www.smartrecruiters.com/Grab/744000102973942)

### Inferences
- Playwright is displacing Selenium as the "preferred" tool in newer Bangkok postings; Selenium persists in Java-centric and bank-group roles. (Based on 2 fetched + several snippet-only postings; moderate confidence.)
- The modern profile is "SDET-lite": TS/JS or Python coding, API plus UI automation, CI quality gates, risk-based strategy, and AI-assisted testing.
- Performance testing (JMeter/k6/Locust) is typically a secondary or "nice to have" skill, not the headline requirement.

### Gaps
- No real count of postings by tool: I could not scrape JobsDB/JobThai/LinkedIn; their pages were 403 or closed. A proper count needs manual job-board queries (e.g., "Playwright" vs "Cypress" vs "Selenium" result totals on th.jobsdb.com) done in a browser.
- Banking-domain knowledge as an explicit requirement: not confirmed in any fetched posting. The SCB TechX, KKP and KBTG postings that might state it could not be read.
- Appium/mobile, Thai-language soft-skill wording (e.g., communication in Thai/English) not verified from full posting text.

## 2. What do company blogs, talks, meetups and conferences say about testing approach?

### Takeaway
Publicly readable evidence is thin. The strongest primary evidence is KBTG's and SCB TechX's ISTQB Platinum Partner announcements (organizational scale and certification emphasis) and one detailed LINE MAN Wongnai conference deck on Android UI test infrastructure. I found no readable engineering-blog posts on QA from KBTG, Wongnai, or LINE Thailand, and the one Agoda QA post I located could not be opened.

### Cited Findings
KBTG:
- KBTG signed a partnership with ISTQB (reported 5 Apr 2024); described as the first Thai organization certified as an ISTQB Platinum Partner. Says its Software Quality Management unit has 200+ staff, all trained and examined, holding ISTQB Foundation and Advanced certificates, 300+ certificates total. Goal stated as pushing software testing standards nationally and internationally and delivering quality products to KASIKORNBANK customers (Thai-language press release) — [Thaipublica](https://thaipublica.org/2024/04/kbtg-x-istqb-kasikorn-business-technology-group-international-software-testing-qualifications-board-pr-05042024/) (fetched)
- ISTQB's own page announces KBTG joining the Partner Program at Platinum level; structured data date 3 Apr 2024; no headcount or quotes on the page — [ISTQB](https://www.istqb.org/kasikorn-business-technology-group-from-thailand-joins-istqb-partner-program-at-the-platinum-level) (fetched)
- A KBTG "Data QA" posting exists on JobsDB (hybrid; no automation detail visible) — snippet-only, no URL retrieved.
- Searches for KBTG test-automation articles on Medium (medium.com/kbtg-life) returned nothing relevant; I did not open the KBTG Medium publication directly. KBTG's tool stack for QA: not found.

SCB TechX:
- Achieved ISTQB Platinum Partner status (article dated 2 Dec 2025); software quality management team holds ISTQB Foundation and Advanced; some staff are among the first in Thailand with the CT-GenAI (Generative AI Testing) and CT-ATT (Agile Technical Testing) credentials; framed under its "Talent-First" strategy; headcount not stated — [SCB TechX news](https://scbtechx.io/news/others/scb-techx-achieves-platinum-partner-certification-the-highest-recognition-in-thailand-from-istqbstrengthening-global-standards-in-software-development/) (fetched)
- Quote attributed to Sitthichai Udomchokpiti, President of the Thailand Software Testing Board (the Thai ISTQB member board), calling Platinum "the highest recognition in Thailand" — same page.

LINE MAN Wongnai / LINE:
- Talk "Building the automated Android UI testing in Continuous integration at LINE MAN Wongnai" by Somkiat Khitwongwattana (Android GDE), 13 Jul 2023: moved from an unstable, hard-to-scale setup to GitLab CI + GitLab Runner with Genymotion device images on AWS EC2, created and destroyed per job with Terraform; shell/ADB/uiautomator scripts; Firebase Test Lab and Smartphone Test Farm (STF) were evaluated and not chosen; ~10 minutes of setup/teardown overhead; security risk noted when exposing Genymotion publicly; all Android apps migrated — [Speaker Deck](https://speakerdeck.com/akexorcist/building-the-automated-android-ui-testing-in-continuous-integration-at-line-man-wongnai) (fetched; event name not stated)
- LINE MAN Wongnai careers has Software Engineer in Test (SET) roles, including Platform-Testing Tools, senior SET (Search), and LINE Pay SET; summaries mention Cypress, XCTest, Espresso, Kotlin/Java/Swift/JS-TS, test automation for Telepharmacy across mobile and backend, and a QA intern team covering Web, iOS and Android — [LMWN careers](https://careers.lmwn.com/development/7-jobs), [Breezy SET senior search](https://wongnai-media-co-ltd.breezy.hr/p/a071aaee59cb-senior-software-engineer-in-test-search) (listing pages were closed or nav-only when fetched; snippet-only)
- No Wongnai Engineering Medium post on QA found in search.

Agoda:
- A Medium post "A Day in the Life of a Quality Assurance Engineer at Agoda" (Agoda Engineering, Aug 2024 per search summary, author Lead Quality Engineer Arvinder Kaur) says QA at Agoda goes beyond testing and mentions test strategy, frameworks and automation — [Medium](https://medium.com/agoda-engineering/a-day-in-the-life-of-a-quality-assurance-engineer-at-agoda-bb052f0a6082) (403 on fetch; snippet-only)
- A Careers at Agoda post says engineers use Jest for React, NUnit/xUnit for C#, and run unit, integration, end-to-end and Selenium tests, plus a global site test system for production errors — [Careers at Agoda](https://careersatagoda.com/blog/full-stack-engineer-life-at-agoda/) (snippet-only; not opened)

Events and community:
- BrowserStack Software Testing/QA Meetup Bangkok (in-person series; one session 8 Aug 2026 on modern architectures and AI in testing) — [Meetup](https://www.meetup.com/browserstack-software-testing-qa-meetup-bangkok/) (snippet-only)
- Test Automation Summit Bangkok, 11 Jun 2026, organized by Testingmind; theme "Human-Centric Quality: AI-Driven, Sustainable, and Secure Testing"; ISTQB Conference Network recognized; no speakers or companies named on the listing — [CreateWith](https://www.createwith.com/event/bangkok-test-automation-summit-bangkok-june-11-2026-jun-2026) (fetched)
- Thoughtworks Thailand meetup on chatbot testing; ThaiPy meetup on Python test automation and reporting; "Testathon Bangkok" Medium post — [Thoughtworks Thailand meetup](https://www.meetup.com/thoughtworks-thailand-meetup-group/events/314451348/), [Testathon Bangkok](https://medium.com/ta-tonthongkam/testathon-bangkok-first-time-in-thailand-46a8d8fe41fe) (snippet-only)
- Thailand Software Testing Board (THSTB) is the Thai ISTQB member board per search summary; its president is Sitthichai Udomchokpiti (confirmed by the SCB TechX page above). Exam/training offerings, e.g., Software Park Thailand course on ISTQB and ISO/IEC 25040 — [Software Park](https://www.swpark.or.th/course-detail?cid=498) (snippet-only).
- Manao Software claims to be Thailand's first ISTQB Gold Partner (company claim) — [AustCham Thailand](https://www.austchamthailand.com/resources/advance-blog/18-years-strong-manao-software-becomes-thailands-first-istqbr-gold-certified) (snippet-only)

Companies with nothing found: Lazada Thailand, Robinhood (SCBX), True Digital, Krungthai/Krungthai Next, other Thai fintech (e.g., Ascend Money, Bitkub beyond a listing URL) — no blog, talk or readable posting retrieved. The Ascend Group "QA Automation" job page (ascendcorp.com) returned a 403.

### Inferences
- Thai banks' tech arms (KBTG, SCB TechX) publicly signal QA maturity primarily through ISTQB-certified headcount and partner status, which suggests ISTQB is valued in these two organizations even if it is not a posting requirement. (Inference from two press releases.)
- LINE MAN Wongnai shows engineering depth in mobile UI test infrastructure (self-built device farm on CI), implying SET roles there touch CI infrastructure, not just test scripts. (One talk; moderate confidence.)
- Agoda appears to use a layered pyramid (unit, integration, E2E/Selenium) plus production monitoring — low confidence since snippet-only.

### Gaps
- TSQA / Thailand Software Testing Board events calendar, Agile Thailand, DevOps Thailand conference QA tracks: not located.
- YouTube/Thai conference talks (e.g., from KBTG, Agoda, Grab) not searched effectively; the search tool is US-only.
- Agoda, KBTG Medium, and LINE Engineering blogs need direct browser access (403s).
- Lazada, Robinhood, True Digital, Krungthai, Central: no practice evidence beyond job-board existence; state explicitly as "nothing published found", not "nothing exists".

## 3. Salary ranges and career ladders

### Takeaway
No official salary bands or published career ladders were found. Only job-board postings and search-summary figures exist, all UNVERIFIED.

### Cited Findings
- JobsDB Thailand snippets (unverified, from search summary): Software Tester THB 30,000-45,000/month; QA/Software Tester THB 20,000-45,000; Automate QA Engineer, 1-year contract, THB 45,000-60,000 with 3+ years; junior automation role with JMeter/k6 THB 20,000-27,000 — [JobsDB](https://th.jobsdb.com/th/automate-tester-jobs) (403 to fetch; aggregator, unverified)
- Seniority tiers visible from titles at SCB TechX: Associate Software QA Engineer, QA Engineer, QA Engineer Team Lead, Tech QA Manager / Software QA Manager — [SCB TechX Breezy](https://scb-techx-co-ltd.breezy.hr/p/958f4b5f9b9e-software-qa-manager-2025) (titles only, from search summaries). Similar ladders appear at Makro PRO (Senior Software Test Engineer, Lead Software QA).
- Manatal posting and Talance posting contain no salary.

### Inferences
- Mid-level automation roles plausibly sit around THB 45,000-60,000+ in Bangkok, but this is a single aggregator data point.

### Gaps
- No Glassdoor/Payscale/Levels-style data was read; no company-published ladder (KBTG, SCB TechX, LINE MAN Wongnai) found.

## 4. Regulatory context for Thai banking/fintech testing

### Takeaway
BOT IT-risk material exists and is evolving (draft group-level IT risk rules consulted Dec 2025-Jan 2026), but I found no text that specifically governs test data, masking, or test-environment segregation. PDPA applies to financial institutions; ISO 27001 / PCI DSS test-data handling was not researched from sources.

### Cited Findings
- BOT's IT risk supervision page (payment-systems context): in 2021 it issued IT risk management criteria and minimum cyber risk guidelines ("cyber hygiene") for e-payment providers; the page does not mention test data, penetration testing, cloud or outsourcing detail; it names confidentiality, integrity, availability as principles and mentions governance of significant IT changes — [BOT IT risk supervision](https://www.bot.or.th/th/our-roles/payment-systems/information-technology-risk-supervision.html) (fetched)
- BOT public hearing on a draft notification "หลักเกณฑ์การกำกับดูแลความเสี่ยงด้านเทคโนโลยีสารสนเทศ (IT Risk) สำหรับกลุ่มธุรกิจทางการเงิน": comment period 25 Dec 2025 to 30 Jan 2026; aimed at the parent company of a financial business group overseeing group entities and IT support companies. Page text does not mention testing, change management, or test environments; those would be in the linked draft PDF, which I did not read — [BOT public hearing](https://www.bot.or.th/th/laws-and-rules/public-hearing/public-hearing-202506121.html) (fetched)
- BOT issued PDPA-readiness guidance for the banking sector ahead of PDPA enforcement on 1 June 2022 (search summary of news coverage) — [Infoquest](https://www.infoquest.co.th/2021/67818) (snippet-only)
- SEC Thailand documents (a different regulator) mention penetration-test requirements for small securities-business operators exposed to public networks — [SEC](https://publish.sec.or.th/nrs/10474s.pdf) (snippet-only)
- A GSB (Government Savings Bank) infographic says banks must assess IT risk at least annually — [GSB PDF](https://www.gsb.or.th/media/2025/12/Infographic-นโยบาย-IT-Risk.pdf) (snippet-only)

### Inferences
- For course content, "test data must not be real customer PII" can be justified through PDPA general principles, but I have NOT found a BOT or PDPA clause saying so for test data specifically; do not attribute it to a regulator without reading the primary text (PDPA B.E. 2562 text, BOT IT Risk Policy for FIs).

### Gaps
- BOT "Policy on IT Risk" / IT Risk Management guidelines for banks (full text): not read.
- PDPA articles on purpose limitation and pseudonymization applied to test data; PDPC guidelines: not read.
- ISO/IEC 27001 Annex A (test information, secure development) and PCI DSS Requirement 6.5.5 (live PANs not used in pre-production): known from general knowledge, NOT verified from a source in this session.
- Thai-language BOT guideline on cloud, outsourcing, and penetration testing (e.g., TLPT/red-team schemes): not researched.
