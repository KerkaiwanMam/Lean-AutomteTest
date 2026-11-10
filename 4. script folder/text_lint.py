"""Proofreading helper: duplicate words, term spelling, whitespace problems.

Usage:  python "4. script folder/text_lint.py" [paths...]      (default: docs, README.md, REQUIREMENTS.md)
Checks (outside code blocks and inline `code`):
  DUP-EN   repeated English word            "the the"
  DUP-TH   repeated Thai syllable run       "การทดสอบทดสอบ"
  TERM     non-canonical spelling of a term (list from 3. asset folder/glossary.md "Canonical spelling" column + built-ins)
  SPACE    trailing whitespace
Exit code 1 when any finding exists.
"""
from __future__ import annotations

import re
import sys

from _common import ROOT, iter_markdown, prose_lines, rel

BUILTIN_TERMS = ["Playwright", "Robot Framework", "TypeScript", "JavaScript", "GitHub", "GitLab", "Postman",
                 "Newman", "Selenium", "SeleniumLibrary", "DatabaseLibrary", "RequestsLibrary", "OpenAPI", "WebKit"]


def load_terms():
    terms = set(BUILTIN_TERMS)
    glossary = ROOT / "3. asset folder" / "glossary.md"
    if glossary.exists():
        for line in glossary.read_text(encoding="utf-8").splitlines():
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if len(cells) >= 2 and cells[1] and cells[1] not in ("Canonical spelling", "---") and not cells[1].startswith("-"):
                terms.add(cells[1].strip("`*"))
    return sorted(terms, key=len, reverse=True)


def load_allowlist():
    path = ROOT / "3. asset folder" / "lint-allowlist.txt"
    if not path.exists():
        return []
    return [l.strip() for l in path.read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#")]


ALLOW = load_allowlist()


def allowed(line: str, match: str) -> bool:
    compact = line.replace(" ", "")
    return any(match in phrase and phrase in compact for phrase in ALLOW)


DUP_EN = re.compile(r"\b([A-Za-z]{2,})\s+\1\b", re.I)
DUP_TH = re.compile(r"([ก-๎]{3,})\1")
URLISH = re.compile(r"\]\([^)]*\)|https?://\S+|[\w./-]+\.(md|ts|js|py|robot|resource|json|yml|html)\b")


def lint(path, terms):
    findings = []
    text = path.read_text(encoding="utf-8")
    for no, raw in enumerate(text.splitlines(), start=1):
        if raw != raw.rstrip():
            findings.append((no, "SPACE", "trailing whitespace"))
    for no, line in prose_lines(text):
        clean = URLISH.sub("", line)
        for m in DUP_EN.finditer(clean):
            findings.append((no, "DUP-EN", m.group(0)))
        for m in DUP_TH.finditer(clean):
            if not allowed(clean, m.group(0)):
                findings.append((no, "DUP-TH", m.group(0)))
        for term in terms:
            for m in re.finditer(re.escape(term), clean, re.I):
                before = clean[m.start() - 1:m.start()] if m.start() else ""
                after = clean[m.end():m.end() + 1]
                if m.group(0) != term and not before.isalnum() and not after.isalnum() and before not in "/.-_" and after not in "/.-_":
                    findings.append((no, "TERM", f"'{m.group(0)}' → '{term}'"))
    return findings


def main(argv):
    terms = load_terms()
    total = 0
    for path in iter_markdown(argv or None):
        for no, kind, msg in lint(path, terms):
            print(f"{rel(path)}:{no}: {kind:<6} {msg}")
            total += 1
    print(f"\n{total} finding(s)")
    return 1 if total else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
