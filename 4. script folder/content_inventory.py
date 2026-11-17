"""Content inventory — list every tracked content file with size and structure signals.

Usage:  python "4. script folder/content_inventory.py" [--md]
Groups: roadmap input, course docs (modules, assessments, templates, cheat sheets, instructor),
practice app, reference test suites.  --md prints a markdown table (for pasting into a report).
A file's presence here says nothing about whether its content is complete or correct.
"""
from __future__ import annotations

import re
import sys

from _common import ROOT, rel

GROUPS = [
    ("Roadmap (baseline input)", ["2. reference folder/inputs/*.md"]),
    ("Course plan & overview", ["docs/0*.md", "README.md"]),
    ("Modules", ["docs/modules/*.md"]),
    ("Assessments", ["docs/assessments/*.md"]),
    ("Templates", ["docs/templates/*.md"]),
    ("Cheat sheets", ["docs/cheatsheets/*.md"]),
    ("Instructor keys", ["docs/instructor/*.md"]),
    ("Audit & curriculum", ["docs/audit/*.md"]),
    ("Practice app requirements", ["practice-app/REQUIREMENTS*.md"]),  # ShopLab + LoanLab
]
CODE_GROUPS = [
    ("Practice app source", "practice-app/src", (".js",)),
    ("Playwright reference suite", "tests/playwright", (".ts",)),
    ("Robot reference suite", "tests/robot", (".robot", ".resource", ".py", ".csv")),
    ("Postman / k6 / CI", "tests/postman", (".json",)),
]


def stats(path):
    text = path.read_text(encoding="utf-8", errors="replace")
    return {
        "file": rel(path),
        "lines": len(text.splitlines()),
        "words": len(text.split()),
        "h2": len(re.findall(r"^## ", text, re.M)),
        "labs": len(re.findall(r"^## 🧪 Lab", text, re.M)),
        "code": len(re.findall(r"^```", text, re.M)) // 2,
        "refs": len(set(re.findall(r"\bREF-\d+\b", text))),
    }


def main(argv):
    md = "--md" in argv
    total_files = total_words = 0
    for title, patterns in GROUPS:
        files = sorted(p for pat in patterns for p in ROOT.glob(pat))
        if not files:
            continue
        rows = [stats(p) for p in files]
        total_files += len(rows)
        total_words += sum(r["words"] for r in rows)
        if md:
            print(f"\n**{title}** ({len(rows)} files)\n")
            print("| File | Lines | Words | H2 | Labs | Code blocks |\n|---|---:|---:|---:|---:|---:|")
            for r in rows:
                print(f"| `{r['file']}` | {r['lines']} | {r['words']} | {r['h2']} | {r['labs']} | {r['code']} |")
        else:
            print(f"\n== {title} ({len(rows)} files) ==")
            for r in rows:
                print(f"{r['file']:<74} {r['lines']:>5} ln {r['words']:>6} w  h2={r['h2']:<3} labs={r['labs']:<2} code={r['code']}")
    print("\n**Executable assets**\n" if md else "\n== Executable assets ==")
    for title, folder, exts in CODE_GROUPS:
        files = [p for p in (ROOT / folder).rglob("*")
                 if p.is_file() and p.suffix in exts and "node_modules" not in p.parts and "results" not in p.parts]
        lines = sum(len(p.read_text(encoding="utf-8", errors="replace").splitlines()) for p in files)
        print(f"{'- ' if md else ''}{title}: {len(files)} files, {lines} lines (`{folder}`)")
    print(f"\n{total_files} markdown files · {total_words} words")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
