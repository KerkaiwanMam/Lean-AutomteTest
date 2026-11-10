"""Check that every course module follows the standard module format.

Usage:  python "4. script folder/audit_structure.py" [docs/modules/M01-....md ...]
Exit code 1 when a required section is missing or quiz questions/answers do not match.
"""
from __future__ import annotations

import re
import sys

from _common import ROOT, rel

REQUIRED = {
    "header": r"^> \*\*Level \d",
    "objectives": r"^## 🎯 Learning Objectives|^## 🎯 Objectives",
    "lab": r"^## 🧪 Lab",
    "quiz": r"^## ✅ Check Your Understanding",
    "answers": r"<details>",
    "checklist": r"^## 📋 ",
}


def audit(path):
    text = path.read_text(encoding="utf-8")
    problems = []
    # A module may opt out of sections on purpose:  <!-- audit-exempt: lab, quiz, answers (reason) -->
    exempt_m = re.search(r"<!--\s*audit-exempt:\s*([^>(]*)", text)
    exempt = {e.strip() for e in exempt_m.group(1).split(",")} if exempt_m else set()
    for name, pattern in REQUIRED.items():
        if name not in exempt and not re.search(pattern, text, re.M):
            problems.append(f"missing {name}")

    labs = len(re.findall(r"^## 🧪 Lab", text, re.M))
    objectives = 0
    m = re.search(r"^## 🎯[^\n]*\n(.*?)(?=^---|^## )", text, re.M | re.S)
    if m:
        objectives = len(re.findall(r"^\d+\. ", m.group(1), re.M))

    questions = answers = 0
    q = re.search(r"^## ✅ Check Your Understanding\n(.*?)<details>(.*?)</details>", text, re.M | re.S)
    if q:
        questions = len(re.findall(r"^\d+\. ", q.group(1), re.M))
        answers = len(re.findall(r"^\d+\. ", q.group(2), re.M))
        if questions != answers:
            problems.append(f"quiz {questions} questions vs {answers} answers")

    return {"file": rel(path), "objectives": objectives, "labs": labs, "questions": questions,
            "answers": answers, "words": len(text.split()), "problems": problems}


def main(argv):
    paths = [ROOT / a for a in argv] if argv else sorted((ROOT / "docs" / "modules").glob("M*.md"))
    rows = [audit(p) for p in paths]
    print(f"{'module':<52} {'obj':>3} {'labs':>4} {'quiz':>4} {'ans':>4} {'words':>6}  problems")
    for r in rows:
        print(f"{r['file']:<52} {r['objectives']:>3} {r['labs']:>4} {r['questions']:>4} {r['answers']:>4} {r['words']:>6}  "
              f"{'; '.join(r['problems']) or 'OK'}")
    bad = [r for r in rows if r["problems"]]
    print(f"\n{len(rows)} modules · {sum(r['labs'] for r in rows)} labs · {sum(r['questions'] for r in rows)} quiz questions · "
          f"{len(bad)} with problems")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
