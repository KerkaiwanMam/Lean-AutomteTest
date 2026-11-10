"""Build the fact-check queue: pull out sentences that make checkable factual claims.

Usage:  python "4. script folder/extract_claims.py" [paths...]
Writes/updates  "1. memory folder/fact-check-queue.csv"  (columns: id,file,line,category,claim,status,ref_ids,note)
Existing status/ref_ids/note are kept when the same claim is found again, so the queue can be worked on over time.
"""
from __future__ import annotations

import csv
import hashlib
import re
import sys

from _common import ROOT, iter_markdown, prose_lines, rel

QUEUE = ROOT / "1. memory folder" / "fact-check-queue.csv"
FIELDS = ["id", "file", "line", "category", "claim", "status", "ref_ids", "note"]

CATEGORIES = [
    ("standard", r"\b(ISTQB|CTFL|CTAL|TAE|RFCP|WCAG|OWASP|DORA|TMMi|TPI|POUR|W3C|PDPA|ISO ?\d+)\b"),
    ("version", r"\bv?\d+\.\d+(\.\d+)?\b|\bNode(\.js)? ?\d+|Python ?3\.\d+|RF ?\d+\b"),
    ("statistic", r"\d+\s?%|\d+[–-]\d+\s?%|\b\d+x\b|เท่า"),
    ("attribution", r"\((Kent C\. Dodds|Brian Marick|Crispin|Gregory|Myers|Dijkstra|Microsoft)[^)]*\)|งานวิจัย|research"),
    ("tool-feature", r"\b(Playwright|Robot Framework|Browser library|SeleniumLibrary|Cypress|k6|JMeter|Gatling|Appium|"
                     r"Allure|Pact|Stryker|Healenium|Applitools|axe(-core)?|ZAP|Newman)\b.*\b(supports?|รองรับ|ไม่มี|มี|ใช้|is|are|"
                     r"cannot|can't|automatically|อัตโนมัติ)\b"),
]


def claim_id(file, text):
    return hashlib.sha1(f"{file}|{text}".encode()).hexdigest()[:10]


def extract(path):
    for no, line in prose_lines(path.read_text(encoding="utf-8")):
        s = line.strip().strip("|").strip()
        if len(s) < 15 or s.startswith(("#", "- [ ]", "<")) or re.fullmatch(r"[-|: ]+", s):
            continue
        for cat, pattern in CATEGORIES:
            if re.search(pattern, s, re.I):
                yield no, cat, re.sub(r"\s+", " ", s)[:300]
                break


def main(argv):
    old = {}
    if QUEUE.exists():
        with QUEUE.open(encoding="utf-8-sig", newline="") as f:
            old = {r["id"]: r for r in csv.DictReader(f)}
    rows = []
    for path in iter_markdown(argv or None):
        for no, cat, text in extract(path):
            cid = claim_id(rel(path), text)
            prev = old.get(cid, {})
            rows.append({"id": cid, "file": rel(path), "line": no, "category": cat, "claim": text,
                         "status": prev.get("status", "todo"), "ref_ids": prev.get("ref_ids", ""), "note": prev.get("note", "")})
    QUEUE.parent.mkdir(parents=True, exist_ok=True)
    with QUEUE.open("w", encoding="utf-8-sig", newline="") as f:   # BOM so Excel shows Thai correctly
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(rows)
    by_cat, by_status = {}, {}
    for r in rows:
        by_cat[r["category"]] = by_cat.get(r["category"], 0) + 1
        by_status[r["status"]] = by_status.get(r["status"], 0) + 1
    print(f"{len(rows)} claims → {rel(QUEUE)}")
    print("by category:", by_cat)
    print("by status:  ", by_status)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
