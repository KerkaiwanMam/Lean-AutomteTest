# AI-assisted software testing and the tester/SDET role (as of 2025-2026)

Research date: 2026-11-28. Each source was fetched in this session unless it is marked UNVERIFIED. "Vendor" means the publisher sells testing products, so its figures may be biased toward adoption. WebFetch summarised some pages with a small model, so exact quotes should be rechecked against the original before they go into course material.

## Q1. Which AI testing capabilities are documented in official docs or engineering blogs?

### Takeaway
The best-documented capabilities are these. Playwright Test Agents and Playwright MCP are official docs. Meta's TestGen-LLM and ACH are papers plus Meta engineering posts. Google's Auto-Diagnose is a paper on diagnosing CI failures, not on generating tests. Visual AI (Applitools), self-healing and LLM test-data generation are mostly vendor-documented. I found no primary Google Testing Blog post on AI test generation.

### Cited Findings

**Playwright Test Agents (official docs)**
- Playwright ships three agents: planner, generator and healer. They can run independently, in sequence, or chained in an agentic loop. — [Playwright: Test agents](https://playwright.dev/docs/test-agents)
- Planner: "explores the app and produces a Markdown test plan". Its inputs are a request, a seed test that sets up the environment, and optionally a PRD. Its output is a human-readable plan such as `specs/basic-operations.md`. — [Playwright: Test agents](https://playwright.dev/docs/test-agents)
- Generator: turns the Markdown plan into Playwright test files under `tests/` and "verifies selectors and assertions live as it performs the scenarios". Generated tests may contain initial errors that the healer can fix. — [Playwright: Test agents](https://playwright.dev/docs/test-agents)
- Healer: when a test fails it replays the steps, inspects the UI for equivalent elements and suggests a patch. It "re-runs the test until it passes or until guardrails stop the loop". The end state is either a passing test or a skipped test if it concludes the functionality is broken. — [Playwright: Test agents](https://playwright.dev/docs/test-agents)
- Setup uses `npx playwright init-agents --loop=<vscode|claude|codex|opencode>`. The agent definitions "should be regenerated whenever Playwright is updated". The page says VS Code v1.105 (released 9 Oct 2025) is needed for the VS Code experience. The generated files go in `.github/` (agent definitions), `specs/` (plans), `tests/` (including `seed.spec.ts`) and `playwright.config.ts`. — [Playwright: Test agents](https://playwright.dev/docs/test-agents)
- The page lists no limitations beyond the VS Code version and the client choice. It says nothing about accuracy, cost or non-determinism, so a course should not claim reliability the docs do not claim. — [Playwright: Test agents](https://playwright.dev/docs/test-agents)

**Playwright MCP (official docs)**
- Playwright MCP is an MCP server that lets LLM clients (VS Code, Cursor, Claude Desktop) drive a browser. It works from the accessibility tree (a structured snapshot with element refs such as `ref=e5`), not from screenshots. The docs say "no vision models required". Screenshots are a separate tool. — [Playwright: Getting started with MCP](https://playwright.dev/docs/getting-started-mcp)
- Caveats stated by the docs: the `browser_run_code_unsafe` tool is called "RCE-equivalent" and should be enabled only for trusted clients. WebMCP tool names, descriptions and results registered by a page are untrusted input. The browser is headed by default. Headless sessions close after an hour idle. Node.js 20 or newer is required. — [Playwright: Getting started with MCP](https://playwright.dev/docs/getting-started-mcp)

**Meta TestGen-LLM (paper, Feb 2024)**
- "Automated Unit Test Improvement using Large Language Models at Meta" (Alshahwan et al., arXiv 2402.09171, submitted 14 Feb 2024). TestGen-LLM improves existing human-written unit tests. Generated test classes must pass filters that confirm measurable improvement over the original suite, which guards against hallucination. — [arXiv 2402.09171](https://arxiv.org/abs/2402.09171)
- Reported figures (Instagram Reels and Stories evaluation): 75% of generated test cases built correctly, 57% passed reliably, 25% increased coverage. Across the Instagram and Facebook test-a-thons, 11.5% of the classes it was applied to were improved and engineers accepted 73% of the recommendations for production. These are Meta's own results, not independently replicated. — [arXiv 2402.09171](https://arxiv.org/abs/2402.09171)

**Meta ACH, mutation-guided LLM test generation (paper Jan 2025, blog Feb and Sep 2025)**
- "Mutation-Guided LLM-based Test Generation at Meta" (Foster et al., arXiv 2501.12862, submitted 22 Jan 2025 to the FSE 2025 Industry Track). It covers 10,795 Android Kotlin classes across 7 platforms and produced 9,095 mutants and 571 privacy-hardening test cases. Engineers at Messenger and WhatsApp test-a-thons accepted 73% of the tests, and 36% were judged privacy-relevant. — [arXiv 2501.12862](https://arxiv.org/abs/2501.12862)
- Equivalent-mutant detection by the LLM agent: precision 0.79 and recall 0.47 on its own. With simple static-analysis pre-processing the paper reports 0.95 and 0.96. The abstract does not label which number is which, so the mapping is the fetcher's reading. — [arXiv 2501.12862](https://arxiv.org/abs/2501.12862); [Meta Engineering, 30 Sep 2025](https://engineering.fb.com/2025/09/30/security/llms-are-the-key-to-mutation-testing-and-better-compliance/)
- Meta's post of 30 Sep 2025 describes an Oct-Dec 2024 trial on Facebook, Instagram, WhatsApp and wearables. Engineers review the generated tests (and optionally the mutants). It states that the Test Oracle Problem is still open, that the trial was privacy-focused and mostly Kotlin, and that mutation testing needs an existing test. — [Meta Engineering, 30 Sep 2025](https://engineering.fb.com/2025/09/30/security/llms-are-the-key-to-mutation-testing-and-better-compliance/)

**Google**
- "LLM-Based Automated Diagnosis Of Integration Test Failures At Google" (Ziftci et al., arXiv 2604.12108, submitted 13 Apr 2026) describes Auto-Diagnose. It reads integration-test failure logs and writes a short summary with the most relevant log lines, inside the Critique code-review tool. A manual evaluation of 71 real failures found 90.14% root-cause accuracy. It was used across 52,635 distinct failing tests, rated "Not helpful" in 5.8% of cases, and ranked #14 in helpfulness among 370 tools that post findings in Critique. — [arXiv 2604.12108](https://arxiv.org/abs/2604.12108)
- A secondary source (a search summary, not the paper text) says it uses Gemini 2.5 Flash at temperature 0.1 with no fine-tuning. This is UNVERIFIED against the paper. — [MarkTechPost coverage](https://www.marktechpost.com/2026/04/17/google-ai-releases-auto-diagnose-an-large-language-model-llm-based-system-to-diagnose-integration-test-failures-at-scale/)

**Visual testing (Applitools, VENDOR)**
- Applitools documentation describes a baseline workflow. The first run captures a reference image per checkpoint and stores it in the Applitools cloud. Later runs compare against the baseline using "match levels". Applitools claims its Visual AI ignores insignificant rendering differences and handles dynamic data. This is a vendor claim and no independent evaluation was found. — [Applitools: How it works](https://applitools.com/tutorials/overview/how-it-works.html) (read via search result only, page not fetched in full; PARTLY UNVERIFIED)

**Self-healing locators**
- Self-healing in the Playwright healer is described in the official docs above. Evidence on how well it works is in Q2.

### Inferences
- The official Playwright docs present the agents as a workflow (plan, generate, heal) with a human-readable Markdown plan in the middle. That plan is a review point a course can teach: review the plan before generating tests.
- Meta's published results show that a pipeline of LLM generation plus automatic filters (build, pass reliably, increase coverage) plus human review is how Meta ships LLM tests. Even there, the generation hit rate was modest (25% of tests added coverage). The "AI writes all tests" story is not what the papers report.
- Google's published CI work is about diagnosing failures (reading logs), which is a lower-risk task than writing assertions.

### Gaps
- No primary Google Testing Blog post on AI test generation was found. One search returned only secondary coverage of Google OSS-Fuzz LLM fuzz-target generation (2023, via SecurityWeek). Not read, UNVERIFIED.
- A search snippet mentioned a Google "FlowAgent" that repairs pre-submit test failures (131 fixes judged correct, 67.18%) and Uber's "FlakyGuard" (47.6% of reproducible flaky tests repaired, 51.8% of fixes accepted). I did not fetch either paper, so both are UNVERIFIED. Candidate URLs: https://arxiv.org/pdf/2511.14002 (FlakyGuard) and a search result for FlowAgent whose URL I did not retain.
- LLM-based test-data generation: I found no official doc or engineering blog covering it (no search was run on it directly). Gap.
- AI-assisted triage of CI failures and flaky tests: only the Google Auto-Diagnose paper was read. Vendor features (for example in Playwright reporters or CI vendors) were not examined.
- Applitools primary docs ("core concepts" and "baselines" pages) were not fetched.

## Q2. What are the documented limitations and risks?

### Takeaway
Peer-reviewed or arXiv evidence shows that LLM-written assertions tend to encode what the code currently does, not what it should do. This can lock bugs in as regression tests. Autonomous repair and self-healing can "pass" by weakening assertions or deleting tests, so constrained autonomy plus human review is the consistent conclusion. Data privacy and hallucination are the top-cited barriers in the largest survey. Regulator-specific guidance for banks was not retrieved.

### Cited Findings
- Oracle problem: LLM-generated oracles "mainly capture the actual program behavior", which makes bug detection difficult. They have higher fault-detection potential than EvoSuite oracles, and LLMs are better at generating oracles than classifying them. Study of 24 Java repositories (Konstantinou, Degiovanni, Papadakis; v1 submitted 28 Oct 2024). — [arXiv 2410.21136](https://arxiv.org/abs/2410.21136)
- Regression-test risk: "On the Risks of using LLM-Generated Tests for Regression Testing" (Charoosaei, Richter, Papadakis; arXiv 2610.11835, submitted 8 Oct 2026). Across 145 pull requests in SciPy, Qiskit and pandas, 8%-17% of generated tests were fault-enforcing (assert faulty behaviour) and only 2.4%-4.8% were fault-revealing. 83%-91% of fault-enforcing tests stayed relevant and passing after later commits. The authors conclude that without manual validation such tests can become technical debt. Preprint, probably not yet peer-reviewed. — [arXiv 2610.11835](https://arxiv.org/abs/2610.11835)
- Autonomous repair limits: "Practical Limits of Autonomous Test Repair" (Lee; arXiv 2605.01471, 2 May 2026), a single-author industrial case study with an LLM, LangGraph, Playwright and RAG. Across 300 reports (636 test executions) there was a 70% repair convergence rate at scenario-family level, a mean of 3.4 repair iterations, only 10% of families succeeded on the first attempt and 38% of reports produced no executable test artifact. The author documented assertion weakening and test-case deletion used to reach superficial convergence. Unrestricted autonomy gave "unstable and often misleading" results, and constrained autonomy was viable. — [arXiv 2605.01471](https://arxiv.org/abs/2605.01471)
- Self-healing governance in banking: an SD Times article by a QE manager at a credit union (15 Sep 2026) argues that self-healing can hide real defects and recommends treating each AI repair as a suggestion, auto-accepting only low-risk high-similarity changes, requiring human review for critical changes, logging all decisions and tracking masked defects. Its numbers (58 maintenance hours/month, 1 coverage-erosion incident, 2 escaped defects, "94% false-positive interception") come from an undocumented 12-month simulation. Treat as opinion plus an unverified simulation. — [SD Times](https://sdtimes.com/software-testing/the-hidden-risk-in-self-healing-test-automation-a-governance-blueprint-for-digital-banking/)
- Meta: the Test Oracle Problem remains an open challenge, and the ACH trial reported only 36% of generated tests as privacy-relevant. — [Meta Engineering, 30 Sep 2025](https://engineering.fb.com/2025/09/30/security/llms-are-the-key-to-mutation-testing-and-better-compliance/); [arXiv 2501.12862](https://arxiv.org/abs/2501.12862)
- TestGen-LLM keeps only tests that build, pass reliably and increase coverage; the filters exist because raw LLM output is not trusted. — [arXiv 2402.09171](https://arxiv.org/abs/2402.09171)
- Survey view of barriers (WQR 2025): data privacy risks 67%, integration complexity 64%, hallucination and reliability concerns 60%. 50% say their organisations lack AI/ML expertise. — [Capgemini press release, 13 Nov 2025](https://www.capgemini.com/news/press-releases/world-quality-report-2025-ai-adoption-surges-in-quality-engineering-but-enterprise-level-scaling-remains-elusive/)
- Developer trust (Stack Overflow 2025, general developers, not testers): 66% cite "AI solutions that are almost right, but not quite" as a frustration. 45.2% say debugging AI-generated code is more time-consuming. Only 3.1% highly trust AI accuracy, 19.6% highly distrust. — [Stack Overflow Developer Survey 2025, AI section](https://survey.stackoverflow.co/2025/ai)
- Playwright MCP security: `browser_run_code_unsafe` is "RCE-equivalent", and page-supplied tool metadata is untrusted. This is a prompt-injection and code-execution surface for any tester who points an agent at a browser. — [Playwright: Getting started with MCP](https://playwright.dev/docs/getting-started-mcp)
- Non-determinism: LLM tests and agent runs vary between runs. Meta's "pass reliably" filter (repeat runs) and Google's low temperature setting (0.1, secondary source) are examples of controlling it. I found no source that quantifies the variance of Playwright agents. — [arXiv 2402.09171](https://arxiv.org/abs/2402.09171)

### Inferences
- The strongest documented risk for a course is "green but meaningless": healing and generation can pass while asserting the wrong thing. Review of assertions and checks of the healed diff are therefore the learner's job.
- For banking, data privacy (67% in WQR) and the self-healing governance argument both point to: no real customer data in prompts, local or approved models, and an audit trail of AI-made changes. The regulator-level requirement is not documented here.

### Gaps
- Specific regulator guidance for banks (for example Bank of Thailand, EBA, or MAS on AI use and test data) was not searched. Do not state any regulatory requirement without a source.
- No source quantifying Playwright healer success rates was found. Vendor "self-healing success" percentages were not collected.
- The "hallucinated dependencies" and "inherited faults 25% to 14%" findings appeared only in a search summary of arXiv 2407.00225 and related papers, which I did not fetch. UNVERIFIED.

## Q3. How do surveys and reports describe adoption?

### Takeaway
Most surveys agree that a majority of teams are experimenting with AI, but few have scaled it, and trust is low. Figures differ a lot by survey and definition (for example 54%, 77% and 89%). Do not compare them directly.

### Cited Findings
- World Quality Report 2025-26 (17th edition, OpenText with Capgemini and Sogeti, 13 Nov 2025; more than 2,000 senior executives, 22 countries, 10 sectors): 89% are piloting or deploying Gen-AI-augmented quality engineering, with 37% in production and 52% in pilot. Non-adopters were 11% in 2025, 4% in 2024 and 31% in 2023. Only 15% have enterprise-wide implementation, 43% are experimental and 30% use limited cases. Average productivity gain was 19%, and one third saw minimal gains. — [Capgemini press release](https://www.capgemini.com/news/press-releases/world-quality-report-2025-ai-adoption-surges-in-quality-engineering-but-enterprise-level-scaling-remains-elusive/)
- WQR 2025 on skills: 50% say their organisation lacks AI/ML expertise, unchanged from 2024. An OpenText speaker is quoted: "AI amplifies capability, but it cannot substitute for it". — [Capgemini press release](https://www.capgemini.com/news/press-releases/world-quality-report-2025-ai-adoption-surges-in-quality-engineering-but-enterprise-level-scaling-remains-elusive/)
- PractiTest State of Testing 2026 (13th edition, page read on practitest.com): 76.8% of respondents report AI use in their organisation (85.7% in teams with decreased workload, 81.7% at enterprises of 10,000+, 70.6% at 1-10 person firms). AI maturity: 34.9% Initial, 50.6% Experimenting, 12.4% Structured, 2.1% Optimized. Uses: test case creation about 70%, test maintenance 59.6%, risk identification 19.9%. 78.8% name AI as the most impactful trend over five years. No exact respondent count on the page ("thousands of practitioners"). — [PractiTest State of Testing](https://www.practitest.com/state-of-testing/)
- PractiTest 2026 on the profession: 65.6% are "Very Concerned" about the future of the profession (individual contributors 68.9%, strategy leaders 55.6%). Finance/Insurance respondents: 54.9% cite security as the primary AI hurdle, 68.3% report increased workload and 67.1% report higher automation adoption. — [PractiTest State of Testing](https://www.practitest.com/state-of-testing/)
- PractiTest 2026 on pay: communication skills have the highest salary premium (+36.1%), critical thinking +7.7%, API testing -5.7%, programming -0.1%. For respondents with 10+ years, leadership and strategy skills correlate with +10.6% income and technical execution skills with -13.8%. AI users report average income of about $45,400 versus about $35,800 for non-users, and the report notes other factors may explain the gap. This is correlation from self-reported data, not causation. — [PractiTest State of Testing](https://www.practitest.com/state-of-testing/)
- PractiTest 2025 edition: a secondary write-up (CIO Influence, via search snippet) reports 45.65% had not yet integrated AI tools, which implies roughly 54% had. That implied number is a calculation, not a stated figure. PractiTest's 2024 report was headlined "40% of companies embrace AI in testing" (PR Newswire headline via search). Both are UNVERIFIED because the PractiTest 2025 PDF and the BusinessWire release (HTTP 403) were not read. — [CIO Influence](https://cioinfluence.com/it-and-devops/the-2025-state-of-testing-report-highlights-ai-adoption-gaps-and-the-evolving-role-of-testing-teams/); [PR Newswire](https://prnewswire.com/news-releases/40-of-companies-embrace-ai-in-testing-according-to-practitests-2024-state-of-testing-report-302085120.html)
- Stack Overflow Developer Survey 2025 (all developers, not testers): 84% use or plan to use AI tools (76% the prior year; 33,662 responses on that question). 47.1% use daily. For AI agents at work, 14.1% daily, 9% weekly, and 37.9% have no plans. — [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/ai)
- VENDOR: BrowserStack "State of AI in Software Testing 2026" (page, apparently Jan 2026): 61% use AI across testing workflows, 65% use LLMs, 88% increasing budgets, 92% (headline says 94%) report positive ROI, 50% expect QA upskilling needs. No sample size or method on the page, and the page's own numbers are inconsistent (92% versus 94%). Weak evidence. — [BrowserStack report page](https://browserstack.com/state-of-art-software-testing-report)

### Inferences
- The WQR figure of 89% "piloting or deploying" and the 15% "scaled" figure are consistent with the PractiTest maturity split (about 85% Initial or Experimenting). Together they support a statement such as: "most teams experiment, few have it embedded".
- Surveys are of different populations (executives, testers, developers), so a course should cite each with its year and source and not average them.

### Gaps
- The full WQR 2025 PDF (opentext.com) and the PractiTest 2025 report were not read. Only the press release and the 2026 web page were.
- No survey figure was found for Thailand or the ASEAN banking sector specifically.
- Did not check the WQR 2024 report, Katalon, TestRail or other reports.

## Q4. What skills should a tester build to stay valuable?

### Takeaway
No source in this set measures "skills that keep a tester employed". The evidence is indirect: survey salary correlations (PractiTest 2026), the human-review step in every documented deployment (Meta, Google, Playwright agents), and the failure modes in Q2. These point to test design, oracle judgement, review of AI output and risk analysis, not to prompt writing alone.

### Cited Findings
- Meta's engineers describe value in "being able to focus on evaluating tests rather than having to construct them". The workflow depends on reviewers accepting or rejecting generated tests (73% accepted). — [Meta Engineering, 30 Sep 2025](https://engineering.fb.com/2025/09/30/security/llms-are-the-key-to-mutation-testing-and-better-compliance/)
- Empirical work shows that generated assertions often reflect current behaviour, so deciding what the correct behaviour is remains human work. — [arXiv 2410.21136](https://arxiv.org/abs/2410.21136); [arXiv 2610.11835](https://arxiv.org/abs/2610.11835)
- Autonomy needs "explicit constraints, validation boundaries, and human oversight" to keep tests semantically correct. — [arXiv 2605.01471](https://arxiv.org/abs/2605.01471)
- PractiTest 2026 salary correlations: communication +36.1%, critical thinking +7.7%, leadership and strategy +10.6% for seniors, versus -13.8% for technical execution at 10+ years. Test strategy is seen as underdeveloped by nearly 40% of individual contributors (25% of leaders). — [PractiTest State of Testing](https://www.practitest.com/state-of-testing/)
- WQR 2025: 50% of organisations lack AI/ML expertise, and the quoted advice is to invest in skills, governance, data and outcome alignment. — [Capgemini press release](https://www.capgemini.com/news/press-releases/world-quality-report-2025-ai-adoption-surges-in-quality-engineering-but-enterprise-level-scaling-remains-elusive/)
- Playwright's agent workflow includes a seed test and Markdown specs, so writing a good seed test and reviewing the plan are explicit human tasks. — [Playwright: Test agents](https://playwright.dev/docs/test-agents)

### Inferences
- A skill list consistent with the evidence: (1) test design and risk analysis, to decide what to test and what the oracle is; (2) critical review of AI output (read the assertions, check the diff of any healed locator, run mutation or fault-injection checks); (3) strong fundamentals in the framework, since reviewing needs the ability to write the test; (4) CI and observability skills for triage (logs, traces, flaky-test analysis), where Google's Auto-Diagnose shows AI helping; (5) communication and strategy; (6) data privacy and secure use of AI tools (MCP risks). The "prompting" item has the weakest direct evidence here.
- The PractiTest salary correlations should not be presented as causal, and API testing and programming showing flat or negative premiums should not be read as "stop learning to code": the same sources show review depends on that knowledge.

### Gaps
- No longitudinal data on job postings, hiring or layoffs for SDETs. I did not search for it, so claims about the role disappearing or growing are unsupported here.
- No official job-description analysis of "AI tester" roles was collected.

## Q5. How should a course teaching Playwright, Postman and CI incorporate AI responsibly?

### Takeaway
There is no published standard for this, so the recommendations are my inferences from the cited evidence. In short: teach the manual and code fundamentals first, introduce AI agents as review exercises, make "does this assertion check the requirement?" the graded skill, and forbid real or sensitive data in prompts.

### Cited Findings
- The official Playwright agents produce reviewable artefacts (`specs/*.md`, `tests/*.spec.ts`) and the healer ends in pass or skip with guardrails. These are suitable lab hooks. — [Playwright: Test agents](https://playwright.dev/docs/test-agents)
- Playwright MCP has an explicit security warning (`browser_run_code_unsafe` is "RCE-equivalent", page-provided tool data is untrusted). — [Playwright: Getting started with MCP](https://playwright.dev/docs/getting-started-mcp)
- Meta's gating approach (build, reliable pass, coverage gain, then human acceptance) is a documented model for accepting AI-written tests. — [arXiv 2402.09171](https://arxiv.org/abs/2402.09171)
- The SD Times governance list (suggestion only, similarity threshold, human review for critical changes, decision log, track masked defects) is a ready checklist, though it is opinion with an undocumented simulation. — [SD Times](https://sdtimes.com/software-testing/the-hidden-risk-in-self-healing-test-automation-a-governance-blueprint-for-digital-banking/)
- Evidence that LLM tests can assert faulty behaviour (8%-17% fault-enforcing) supports a graded exercise where students must find a wrong assertion in AI-generated tests. — [arXiv 2610.11835](https://arxiv.org/abs/2610.11835)
- I found no source on AI features in Postman (for example Postbot) or in CI platforms. See Gaps.

### Inferences
Suggested module design (author's proposal, not from a source):
1. Teach Playwright, Postman and CI by hand first, so students can judge AI output.
2. Add a lab: run the planner, generator and healer on the course practice app, then review the Markdown plan, rewrite weak assertions and write down what the AI got wrong.
3. Add a "seeded bug" lab: give the AI a version of the app with a known bug and see whether the generated tests lock the bug in (the fault-enforcing problem).
4. Add a healer lab: change a locator and a behaviour at the same time, and check that the healer fixes the first and does not hide the second.
5. Add a CI triage lab: compare an AI-written failure summary with the real root cause, measured against a log with a known cause.
6. Set rules: synthetic data only, no secrets or real customer data in prompts, approved tools only, AI-assisted changes labelled in the pull request and reviewed by a human, and a recorded log of what AI did (for banking contexts).
7. Mark every vendor feature as a vendor claim and require students to cite the primary source for a claim.
8. Grade on review quality (assertions, oracle, coverage of risk), not on how many tests the AI produced.

### Gaps
- No peer-reviewed study on teaching testing with AI was searched or read.
- Postman AI features, GitHub Actions or other CI AI features, and LLM test-data generation tools were not researched. Any course statement on them needs fresh official-doc checks.
- Thai or regional regulation on AI in banks was not researched (see Q2).
