"""Roadmap coverage signal — which roadmap topics are mentioned in the course modules, and where.

Usage:  python "4. script folder/roadmap_coverage.py" [ROADMAP.md] [--csv OUT.csv] [--all]
        --corpus PATH   search this file or folder of .md files instead of docs/modules (e.g. the master curriculum)

For every topic bullet / table row of each "## Chapter N" in the roadmap, the English terms are
searched (case-insensitive) in docs/modules/*.md.  Output per topic: modules that mention it and
how often.  This is a MECHANICAL FIRST PASS: a hit proves a term appears, not that the topic is
taught completely or correctly, and "none" may be a wording difference.  The audit status
(Complete / Partial / Missing ...) must be decided by reading the content.
"""
from __future__ import annotations

import csv
import re
import sys
from pathlib import Path

from _common import ROOT

DEFAULT_ROADMAP = ROOT / "2. reference folder" / "inputs" / "quality-engineering-test-automation-roadmap-revised.md"
SKIP_SECTION = re.compile(r"Workshop|Pipeline|วิธีตรวจสอบ|ตัวอย่าง|Design Principles|แนวทางแบ่งหน้าที่|สิ่งที่ต้องสร้าง|Mindset|แนวคิดที่ต้องอธิบาย")
STOP = {"vs", "and", "or", "the", "of", "in", "a", "to", "for", "with", "as", "qa", "ui", "api", "test", "tests", "testing"}
TERM = re.compile(r"[A-Za-z][A-Za-z0-9.+#_/\- ]*[A-Za-z0-9+#]|[A-Za-z]")


def parse_roadmap(text):
    """Yield (chapter_no, chapter_title, section, topic)."""
    chapter = section = None
    in_code = False
    for line in text.splitlines():
        if line.startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        m = re.match(r"^## Chapter (\d+): (.+)", line)
        if m:
            chapter, section = (int(m.group(1)), m.group(2).strip()), ""
            continue
        if re.match(r"^#{1,2} ", line):
            chapter = None
            continue
        if chapter is None:
            continue
        if line.startswith("### "):
            section = line[4:].strip()
            continue
        if SKIP_SECTION.search(section or ""):
            continue
        m = re.match(r"^\s*(?:-|\d+\.)\s+(.*)", line)
        if m:
            yield chapter[0], chapter[1], section, m.group(1).strip()
            continue
        if line.startswith("|") and not re.match(r"^\|\s*-", line):
            cell = line.strip("|").split("|")[0].strip()
            if cell and cell not in {"เทคนิค", "Pattern", "Metric", "งาน", "Module", "แนวคิด", "ส่วนประกอบ"}:
                yield chapter[0], chapter[1], section, cell


def keywords(topic):
    topic = topic.replace("`", "").replace("**", "")
    terms = []
    for raw in TERM.findall(topic):
        for part in re.split(r"\s+vs\.?\s+|\s*/\s*|,\s*", raw):
            part = part.strip(" .-")
            if len(part) >= 3 and part.lower() not in STOP:
                terms.append(part)
    return terms


def search(term, corpus):
    pattern = re.compile(re.escape(term).replace(r"\ ", r"[\s\-]?").replace(r"\-", r"[\s\-]?"), re.I)
    hits = {}
    for name, text in corpus.items():
        n = len(pattern.findall(text))
        if n:
            hits[name] = n
    return hits


def main(argv):
    out = None
    if "--csv" in argv:
        i = argv.index("--csv")
        out = Path(argv[i + 1])
        argv = argv[:i] + argv[i + 2:]
    corpus_arg = None
    if "--corpus" in argv:
        i = argv.index("--corpus")
        corpus_arg = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]
    show_all = "--all" in argv
    args = [a for a in argv if not a.startswith("--")]
    roadmap = Path(args[0]) if args else DEFAULT_ROADMAP
    if corpus_arg:
        cp = Path(corpus_arg)
        files = [cp] if cp.is_file() else sorted(cp.glob("*.md"))
        corpus = {p.stem[:12]: p.read_text(encoding="utf-8") for p in files}
    else:
        corpus = {p.name[:3]: p.read_text(encoding="utf-8") for p in sorted((ROOT / "docs" / "modules").glob("M*.md"))}

    rows, per_chapter = [], {}
    for no, title, section, topic in parse_roadmap(roadmap.read_text(encoding="utf-8")):
        terms = keywords(topic)
        merged = {}
        for t in terms:
            for mod, n in search(t, corpus).items():
                merged[mod] = merged.get(mod, 0) + n
        total = sum(merged.values())
        words_only = False
        if terms and total == 0:
            # No exact phrase: fall back to "every significant word of a term occurs in the same module".
            for t in terms:
                words = [w for w in re.findall(r"[A-Za-z][A-Za-z0-9+#]+", t) if len(w) >= 4 and w.lower() not in STOP]
                for mod, text in corpus.items() if words else ():
                    counts = [len(re.findall(r"\b" + re.escape(w), text, re.I)) for w in words]
                    if all(counts):
                        merged[mod] = merged.get(mod, 0) + min(counts)
            total = sum(merged.values())
            words_only = total > 0
        signal = ("manual" if not terms else "none" if total == 0 else "words" if words_only
                  else "weak" if total < 3 else "found")
        top = " ".join(f"{m}({n})" for m, n in sorted(merged.items(), key=lambda kv: -kv[1])[:4])
        rows.append([no, title, section, topic, "; ".join(terms), signal, total, top])
        c = per_chapter.setdefault((no, title), {"found": 0, "weak": 0, "words": 0, "none": 0, "manual": 0})
        c[signal] += 1

    print(f"{'ch':>2}  {'chapter':<58} found weak words none manual   (found/weak = exact phrase, words = same module)")
    for (no, title), c in sorted(per_chapter.items()):
        print(f"{no:>2}  {title[:58]:<58} {c['found']:>5} {c['weak']:>4} {c['words']:>5} {c['none']:>4} {c['manual']:>6}")
    print(f"\n{len(rows)} roadmap topics · signal is keyword presence only — read the content before assigning a status\n")
    for r in rows:
        if show_all or r[5] in {"none", "manual"}:
            print(f"[{r[5]:<6}] Ch{r[0]:<2} {r[3][:60]:<60} {r[7]}")
    if out:
        out.parent.mkdir(parents=True, exist_ok=True)
        with out.open("w", encoding="utf-8-sig", newline="") as f:
            w = csv.writer(f)
            w.writerow(["chapter", "chapter_title", "section", "topic", "search_terms", "signal", "hits", "top_modules"])
            w.writerows(rows)
        print(f"\nwrote {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
