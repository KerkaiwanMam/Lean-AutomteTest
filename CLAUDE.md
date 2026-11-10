# Working rules for this project (QA Automation Academy)

## Never
- Never use content from `sunline-eps-tests`.

## Folder roles
| Folder | Contents |
|---|---|
| `1. memory folder/` | Project context, change logs, progress summary (`project-context.md`, `change-log.md`, `progress.md`) |
| `2. reference folder/` | Reliable sources used for fact-checking (`references.md` = master index, one row per source, with ID `REF-xxx`) |
| `3. asset folder/` | Glossary, quotes, short notes (`glossary.md`, `quotes.md`, `notes/`) |
| `4. script folder/` | Tools and prompt templates for checking/formatting/extracting content (see its README) |

## 4-step workflow — apply EVERY time the user sends a document or content
1. **Content audit & fact-check** — compare against highly reliable sources (official docs, standards, syllabi, books, academic work). Add every new source to `2. reference folder/references.md` with an ID.
2. **Tool utilization** — run, create or improve scripts in `4. script folder/` to process the work (structure audit, lint, claim extraction, link check). Prefer improving an existing script over a one-off command.
3. **Outcome verification** — compare the edited content with the original: completeness, narrative flow, correctness of references. Re-run the scripts after editing.
4. **Change logging** — append to `1. memory folder/change-log.md`: (1) section/spot changed (2) original vs edited text (3) reason (4) reference IDs from `2. reference folder`. Update `progress.md`.

## Response format (every content submission)
1. **[Reference Added]** — sources used (saved in `2. reference folder`)
2. **[Script / Tool Action]** — scripts run/created from `4. script folder`
3. **[Verification & Analysis]** — summary of the correctness check
4. **[Memory Log]** — change history (saved in `1. memory folder`)

## Conventions
- Course text: Thai with English technical terms. Module format: Objectives → Theory → Worked example → Labs → Quiz (answers in `<details>`) → Skills checklist → Real-world notes.
- Only claim a source says something after reading it in this session; mark unverified items as such.
- Scripts: Python 3 standard library only, run from the repo root, e.g. `python "4. script folder/audit_structure.py"`.
