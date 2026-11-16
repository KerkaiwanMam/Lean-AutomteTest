"""Check that every course module follows the standard module format.

Usage:  python "4. script folder/audit_structure.py" [docs/modules/M01-....md ...]
        python "4. script folder/audit_structure.py" --curriculum [docs/02-master-curriculum.md]
The --curriculum mode checks that every chapter of the master curriculum has the 8 standard sections
in order, at least 3 objectives, and a status mark on every content-map row.
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


CHAPTER_SECTIONS = ["Learning Objectives", "Content Map", "Concepts & Technical Deep Dive", "Design:",
                    "Practical Example", "Workshop", "Engineering Assignment & Deliverables", "Recommended Reading"]
STATUS_MARKS = ["✅", "✏️", "🆕", "📝", "⛔"]


def audit_curriculum(path):
    """Check a master-curriculum file: every '## Chapter N' has the 8 standard sections, in order."""
    text = path.read_text(encoding="utf-8")
    chapters = re.split(r"^## Chapter ", text, flags=re.M)[1:]
    bad = 0
    totals = dict.fromkeys(STATUS_MARKS, 0)
    print(f"{'chapter':<62} {'obj':>3} {'rows':>4} {'labs':>4}  " + " ".join(STATUS_MARKS) + "  problems")
    for i, block in enumerate(chapters, start=1):
        block = re.split(r"^# ", block, flags=re.M)[0]          # stop at the next part/appendix heading
        title = block.splitlines()[0].strip()
        heads = re.findall(r"^### (.+)$", block, re.M)
        problems, pos = [], -1
        if not title.startswith(f"{i} "):
            problems.append(f"expected chapter {i}")
        for want in CHAPTER_SECTIONS:
            idx = next((k for k, h in enumerate(heads) if want in h), None)
            if idx is None:
                problems.append(f"missing '{want}'")
            elif idx < pos:
                problems.append(f"'{want}' out of order")
            else:
                pos = idx
        if any(not h.startswith(f"{i}.") for h in heads):
            problems.append("section number does not match chapter")

        def section(name):
            m = re.search(rf"^### [^\n]*{re.escape(name)}[^\n]*\n(.*?)(?=^### |\Z)", block, re.M | re.S)
            return m.group(1) if m else ""
        objectives = len(re.findall(r"^\d+\. ", section("Learning Objectives"), re.M))
        cmap = [l for l in section("Content Map").splitlines() if re.match(rf"^\| {i}\.[A-Z] ", l)]
        labs = len(re.findall(rf"^\| (?:{i}\.\d+|\d) \|", section("Workshop"), re.M))
        marks = {s: sum(1 for l in cmap if s in l.rsplit("|", 2)[-2]) for s in STATUS_MARKS}
        for s in STATUS_MARKS:
            totals[s] += marks[s]
        if objectives < 3:
            problems.append(f"only {objectives} objectives")
        if not cmap:
            problems.append("empty content map")
        if any(sum(1 for s in STATUS_MARKS if s in l.rsplit('|', 2)[-2]) == 0 for l in cmap):
            problems.append("content-map row without status")
        bad += bool(problems)
        print(f"{title[:62]:<62} {objectives:>3} {len(cmap):>4} {labs:>4}  "
              + " ".join(f"{marks[s]:>2}" for s in STATUS_MARKS) + f"  {'; '.join(problems) or 'OK'}")
    print(f"\n{len(chapters)} chapters · content-map rows by status: "
          + " · ".join(f"{s} {totals[s]}" for s in STATUS_MARKS) + f" · {bad} chapter(s) with problems")
    return 1 if bad else 0


def main(argv):
    if argv and argv[0] == "--curriculum":
        return audit_curriculum(ROOT / (argv[1] if len(argv) > 1 else "docs/02-master-curriculum.md"))
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
