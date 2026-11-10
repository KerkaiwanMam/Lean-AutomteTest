"""Step 3 helper — compare an original document with the edited version.

Usage:  python "4. script folder/compare_versions.py" ORIGINAL EDITED [--diff]
Reports: word/line counts, headings removed/added (completeness & flow), links and reference IDs
removed/added, and (with --diff) a unified diff.
"""
from __future__ import annotations

import difflib
import re
import sys
from pathlib import Path

import _common  # noqa: F401  (utf-8 stdout)


def outline(text):
    return [l.strip() for l in text.splitlines() if l.startswith("#")]


def links(text):
    return set(re.findall(r"\]\(([^)\s]+)\)", text)) | set(re.findall(r"\bREF-\d+\b", text))


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    a, b = Path(argv[0]).read_text(encoding="utf-8"), Path(argv[1]).read_text(encoding="utf-8")
    print(f"words  {len(a.split()):>6} → {len(b.split()):>6}   lines {len(a.splitlines()):>5} → {len(b.splitlines()):>5}")
    oa, ob = outline(a), outline(b)
    for h in oa:
        if h not in ob:
            print(f"HEADING REMOVED  {h}")
    for h in ob:
        if h not in oa:
            print(f"HEADING ADDED    {h}")
    order_a = [h for h in oa if h in ob]
    order_b = [h for h in ob if h in oa]
    if order_a != order_b:
        print("WARNING  section order changed — check narrative flow")
    la, lb = links(a), links(b)
    for x in sorted(la - lb):
        print(f"LINK/REF REMOVED {x}")
    for x in sorted(lb - la):
        print(f"LINK/REF ADDED   {x}")
    ratio = difflib.SequenceMatcher(None, a, b).ratio()
    print(f"similarity {ratio:.1%}")
    if "--diff" in argv:
        sys.stdout.writelines(difflib.unified_diff(a.splitlines(True), b.splitlines(True), argv[0], argv[1]))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
