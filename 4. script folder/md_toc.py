"""Regenerate the table of contents between <!-- TOC --> and <!-- /TOC --> in a markdown file.

Usage:  python "4. script folder/md_toc.py" FILE.md [--depth 2] [--check]
--depth N  include headings up to level N (default 2).  --check  exit 1 if the TOC is out of date.
Anchors follow GitHub's rules (lowercase, punctuation dropped, spaces to hyphens, -1/-2 for repeats).
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

import _common  # noqa: F401  (utf-8 stdout)

START, END = "<!-- TOC -->", "<!-- /TOC -->"


def slug(title, seen):
    s = re.sub(r"[`*_]", "", title).strip().lower()
    s = re.sub(r"[^\w\s\-฀-๿]", "", s, flags=re.U)
    s = re.sub(r"\s", "-", s)
    n = seen.get(s, 0)
    seen[s] = n + 1
    return s if n == 0 else f"{s}-{n}"


def build(text, depth):
    lines, seen, in_code = [], {}, False
    body = text.split(END, 1)[1] if END in text else text
    for line in body.splitlines():
        if line.lstrip().startswith("```"):
            in_code = not in_code
            continue
        m = None if in_code else re.match(r"^(#{1,6}) (.+?)\s*$", line)
        if not m:
            continue
        level, title = len(m.group(1)), m.group(2)
        anchor = slug(title, seen)
        if level <= depth:
            lines.append(f"{'  ' * (level - 1)}- [{title}](#{anchor})")
    return "\n".join(lines)


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    depth = int(argv[argv.index("--depth") + 1]) if "--depth" in argv else 2
    path = Path(argv[0])
    text = path.read_text(encoding="utf-8")
    if START not in text or END not in text:
        print(f"{path}: no {START} … {END} markers")
        return 2
    head, rest = text.split(START, 1)
    _, tail = rest.split(END, 1)
    new = f"{head}{START}\n{build(text, depth)}\n{END}{tail}"
    if "--check" in argv:
        print("TOC up to date" if new == text else "TOC out of date")
        return 0 if new == text else 1
    path.write_text(new, encoding="utf-8", newline="\n")
    print(f"{path}: TOC written ({new.count('](#')} entries)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
