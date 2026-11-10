# 4. Script Folder — content tools

Python 3 standard library only. Run from the repository root.

| Script | Workflow step | What it does |
|---|---|---|
| `run_all.py` | 2, 3 | Runs all checks below and prints a summary — run before and after every edit |
| `audit_structure.py` | 3 | Every module has header, objectives, labs, quiz, answers, checklist; quiz questions = answers |
| `check_links.py` | 3 | Broken relative links; `--urls` lists external URLs (candidates for the reference folder) |
| `text_lint.py` | 2 | Duplicate English/Thai words, non-canonical term spelling (uses `3. asset folder/glossary.md`), trailing spaces |
| `extract_claims.py` | 1 | Builds/updates `1. memory folder/fact-check-queue.csv` — keeps status/ref_ids between runs |
| `apply_verdicts.py` | 1, 4 | Applies `1. memory folder/fact-check-verdicts.csv` (rules matched by file + text snippet, so they survive edits) and lists remaining `todo` |
| `compare_versions.py` | 3 | Original vs edited: word counts, headings added/removed, section order, links/REF IDs, similarity, `--diff` |
| `prompt-templates/` | 1, 3 | Reusable prompts: fact-check a claim, review narrative flow |

```bash
python "4. script folder/run_all.py"
python "4. script folder/run_all.py" docs/modules/M02-test-design-techniques.md
python "4. script folder/compare_versions.py" original.md docs/modules/M02-test-design-techniques.md --diff
```

Fact-check queue statuses: `todo` → `verified` / `corrected` / `outdated` / `unverifiable` / `skip` (not a factual claim).
