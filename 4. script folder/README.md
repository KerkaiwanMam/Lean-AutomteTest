# 4. Script Folder — content tools

Python 3 standard library only. Run from the repository root.

| Script | Workflow step | What it does |
|---|---|---|
| `run_all.py` | 2, 3 | Runs all checks below and prints a summary — run before and after every edit |
| `content_inventory.py` | 1 | Lists every content file (roadmap input, docs, practice-app requirements, test suites) with size and structure signals; `--md` for a report table |
| `roadmap_coverage.py` | 1 | Searches the terms of each roadmap topic in the modules (or `--corpus FILE`) and writes `1. memory folder/roadmap-coverage.csv` — a keyword signal only, never an audit status |
| `audit_structure.py` | 3 | Every module has header, objectives, labs, quiz, answers, checklist; quiz questions = answers · `--curriculum` checks the master curriculum (8 sections per chapter, in order, status on every content-map row) |
| `md_toc.py` | 2, 3 | Writes or checks (`--check`) the table of contents between `<!-- TOC -->` markers |
| `check_links.py` | 3 | Broken relative links; `--urls` lists external URLs (candidates for the reference folder) |
| `text_lint.py` | 2 | Duplicate English/Thai words, non-canonical term spelling (uses `3. asset folder/glossary.md`), trailing spaces |
| `extract_claims.py` | 1 | Builds/updates `1. memory folder/fact-check-queue.csv` — keeps status/ref_ids between runs |
| `apply_verdicts.py` | 1, 4 | Applies `1. memory folder/fact-check-verdicts.csv` (rules matched by file + text snippet, so they survive edits) and lists remaining `todo` · a claim with `REF-xxx` on its own line is verified automatically when every cited source is verified in `references.md` |
| `exam_bank.py` | 2, 3 | Final exam bank (`docs/instructor/final-exam/`): `check` (format, answers, REF ids, blueprint quotas, excluded AC topics, bare option letters) · `stats` · `build --seed N` draws a 60-question form with shuffled options into the git-ignored `exam-forms/` |
| `compare_versions.py` | 3 | Original vs edited: word counts, headings added/removed, section order, links/REF IDs, similarity, `--diff` |
| `prompt-templates/` | 1, 3 | Reusable prompts: fact-check a claim, review narrative flow |

```bash
python "4. script folder/run_all.py"
python "4. script folder/run_all.py" docs/modules/M02-test-design-techniques.md
python "4. script folder/compare_versions.py" original.md docs/modules/M02-test-design-techniques.md --diff
python "4. script folder/content_inventory.py" --md
python "4. script folder/roadmap_coverage.py" --corpus docs/02-master-curriculum.md
python "4. script folder/md_toc.py" docs/02-master-curriculum.md        # after editing headings
python "4. script folder/extract_claims.py" && python "4. script folder/apply_verdicts.py"
python "4. script folder/exam_bank.py" check && python "4. script folder/exam_bank.py" build --seed 2027
```

Fact-check queue statuses: `todo` → `verified` / `corrected` / `outdated` / `unverifiable` / `skip` (not a factual claim).
