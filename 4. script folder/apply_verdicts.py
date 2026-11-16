"""Apply fact-check verdicts to the queue (workflow step 1 → 4).

Usage:  python "4. script folder/apply_verdicts.py"
Reads   "1. memory folder/fact-check-verdicts.csv"  columns: file_suffix,match,status,ref_ids,note
Updates "1. memory folder/fact-check-queue.csv"

Matching: a rule applies to every queue row whose file ends with `file_suffix` and whose claim contains
`match` ("*" = every claim in that file). Rules are applied top to bottom, so put broad rules first and
specific rules after them. Rules match on text, not on IDs, so they keep working after the claim's
line moves or after extract_claims.py is re-run.

Inline citations: after the rules, a claim that was not matched by a specific rule and cites REF ids on its own
line becomes `verified` when every cited source is verified in "2. reference folder/references.md"; if any cited
source is still candidate / partially verified it stays `todo` with a note naming that source.

Statuses: todo · verified · corrected · internal (checked against this repo / test runs) · skip (not a factual claim)
"""
from __future__ import annotations

import csv
import re
import sys

from _common import ROOT

MEM = ROOT / "1. memory folder"
QUEUE = MEM / "fact-check-queue.csv"
VERDICTS = MEM / "fact-check-verdicts.csv"
REFERENCES = ROOT / "2. reference folder" / "references.md"
REF = re.compile(r"\bREF-\d+\b")


def reference_status():
    """REF id -> True when its row in references.md has a status cell starting with 'verified'."""
    status = {}
    for line in REFERENCES.read_text(encoding="utf-8").splitlines():
        cells = [c.strip() for c in line.strip("|").split("|")]
        if cells and re.fullmatch(r"REF-\d+", cells[0]):
            status[cells[0]] = any(c.startswith("verified") for c in cells[1:])
    return status


def main():
    with QUEUE.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
        fields = list(rows[0].keys()) if rows else []
    with VERDICTS.open(encoding="utf-8-sig", newline="") as f:
        rules = [r for r in csv.DictReader(f) if r["file_suffix"] and not r["file_suffix"].startswith("#")]

    cited = {row["id"]: sorted(set(REF.findall(row["claim"] + " " + row["ref_ids"]))) for row in rows}
    specific = set()
    unused = []
    for rule in rules:
        hit = 0
        for row in rows:
            if row["file"].endswith(rule["file_suffix"]) and (rule["match"] == "*" or rule["match"] in row["claim"]):
                row["status"], row["ref_ids"], row["note"] = rule["status"], rule["ref_ids"], rule["note"]
                if rule["match"] != "*":
                    specific.add(row["id"])
                hit += 1
        if hit == 0:
            unused.append(rule)

    ref_ok = reference_status()
    inline = 0
    for row in rows:
        ids = cited[row["id"]]
        if not ids or row["id"] in specific:
            continue
        weak = [i for i in ids if not ref_ok.get(i)]
        row["ref_ids"] = ";".join(ids)
        if weak:
            row["status"], row["note"] = "todo", "cites a source that is not verified yet: " + ", ".join(weak)
        else:
            row["status"], row["note"] = "verified", "inline citation"
            inline += 1

    with QUEUE.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    counts = {}
    for r in rows:
        counts[r["status"]] = counts.get(r["status"], 0) + 1
    print(f"{len(rows)} claims · {counts}")
    print(f"{inline} claim(s) verified through inline citations")
    for r in unused:
        print(f"UNUSED RULE  {r['file_suffix']} | {r['match'][:60]}")
    todo = [r for r in rows if r["status"] == "todo"]
    for r in todo:
        print(f"TODO  {r['file']}:{r['line']}  {r['claim'][:100]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
