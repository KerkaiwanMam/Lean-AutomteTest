"""Final exam question bank: check it, show its distribution, build a randomized exam form.

The bank lives in docs/instructor/final-exam/bank-*.md (format: see that folder's README.md).

Usage (from the repo root):
  python "4. script folder/exam_bank.py" check            # errors → exit 1, warnings are printed only
  python "4. script folder/exam_bank.py" stats            # distribution per area / level / type / answer letter
  python "4. script folder/exam_bank.py" build --seed 7   # writes exam-forms/form-7.md + form-7-key.md
  python "4. script folder/exam_bank.py" build --seed 7 --no-shuffle --out some/folder

`build` draws the per-area quota (FORM_QUOTA) at random with the seed, keeps the area order A→F,
shuffles the options of every question and rewrites option letters inside options and rationales
("ข้อ A", "แบบ B", "ข้อ A, B") so the key stays correct. The output folder is git-ignored: forms are
answer keys and must not be committed to the public repository.
"""
from __future__ import annotations

import argparse
import random
import re
import sys
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path

from _common import ROOT, rel

BANK_DIR = ROOT / "docs" / "instructor" / "final-exam"
REFS_FILE = ROOT / "2. reference folder" / "references.md"
MODULE_DIR = ROOT / "docs" / "modules"
DEFAULT_OUT = ROOT / "exam-forms"

# Blueprint (see docs/instructor/final-exam/README.md). Form = 60 questions, pass mark 45 (75 %).
FORM_QUOTA = {"A": 14, "B": 10, "C": 10, "D": 8, "E": 10, "F": 8}
BANK_FACTOR = 1.5                      # bank must hold ≥ 1.5 × the form quota per area
LEVEL_SHARE = {"K1": (0.05, 0.15), "K2": (0.30, 0.45), "K3": (0.35, 0.50), "K4": (0.08, 0.15)}
MULTI_MAX_SHARE = 0.10
LETTERS = "ABCD"
META_KEYS = ["area", "module", "chapter", "level", "type", "answer"]

# Topics that wait for audit corrections AC-01..AC-14 (docs/audit/2026-11-10-content-audit-report.md §3)
# plus Ch 19. A question that matches one of these may contradict the module text until it is corrected.
EXCLUDED_TOPICS = {
    "AC-01/02 test levels & types": r"test level|ระดับการทดสอบ|test type",
    "AC-03 STLC steps": r"\bSTLC\b",
    "AC-04 state-transition coverage": r"\b[01]-switch\b",
    "AC-05 RF variable priority": r"priority ของตัวแปร|variable priority",
    "AC-06/07 RF argument conversion": r"type hint|แปลง type",
    "AC-08 listener longname": r"\blongname\b|full_name",
    "AC-09 CI browser cache": r"ms-playwright|cache browser",
    "AC-10 CI worker count": r"workers:\s*\d|จำนวน worker",
    "AC-11 Python version": r"Python 3\.1\d",
    "AC-12 flaky-rate definition": r"flaky rate",
    "AC-13 storageState trade-off": r"storageState",
    "AC-14 course hours": r"ชั่วโมง",
    "Ch 19 testing AI-based apps": r"\bchapter: 19\b",
}

HEAD_RE = re.compile(r"^### ([A-F]-\d{2})\s*$")
META_RE = re.compile(r"`(\w+):\s*([^`]+)`")
OPT_RE = re.compile(r"^- ([A-D])\) (.+)$")
LETTER_REF_RE = re.compile(r"((?:ข้อ|แบบ)\s*)([A-D](?:\s*,\s*[A-D])*)(?![A-Za-z0-9])")
REF_ID_RE = re.compile(r"REF-\d{3}")
# A lone capital A-D (not part of a word, ID or code) — an option letter the remapper would miss.
BARE_LETTER_RE = re.compile(r"(?<!user )(?<![A-Za-z0-9_\-./#])[A-D](?![A-Za-z0-9_\-./:])")


@dataclass
class Question:
    qid: str
    file: Path
    line: int
    meta: dict = field(default_factory=dict)
    stem: list = field(default_factory=list)
    options: dict = field(default_factory=dict)
    rationale: str = ""

    @property
    def answers(self) -> list[str]:
        return [a.strip() for a in self.meta.get("answer", "").split(",") if a.strip()]


def parse_bank(files: list[Path]) -> list[Question]:
    questions: list[Question] = []
    for f in files:
        cur: Question | None = None
        for no, raw in enumerate(f.read_text(encoding="utf-8").splitlines(), start=1):
            m = HEAD_RE.match(raw)
            if m:
                cur = Question(m.group(1), f, no)
                questions.append(cur)
                continue
            if cur is None:
                continue
            if not cur.meta and raw.startswith("`area:"):
                cur.meta = {k: v.strip() for k, v in META_RE.findall(raw)}
                continue
            om = OPT_RE.match(raw)
            if om and not cur.rationale:
                cur.options[om.group(1)] = om.group(2)
                continue
            if raw.startswith("> **เหตุผล:**"):
                cur.rationale = raw[2:].strip()
                continue
            if cur.meta and not cur.options:
                cur.stem.append(raw)
    for q in questions:
        while q.stem and not q.stem[0].strip():
            q.stem.pop(0)
        while q.stem and not q.stem[-1].strip():
            q.stem.pop()
    return questions


def bank_files() -> list[Path]:
    return sorted(BANK_DIR.glob("bank-*.md"))


def check(questions: list[Question]) -> int:
    errors: list[str] = []
    warnings: list[str] = []
    known_refs = set(REF_ID_RE.findall(REFS_FILE.read_text(encoding="utf-8"))) if REFS_FILE.exists() else set()
    modules = {p.name[:3] for p in MODULE_DIR.glob("M*.md")}
    seen: dict[str, Question] = {}

    for q in questions:
        where = f"{rel(q.file)}:{q.line} {q.qid}"
        if q.qid in seen:
            errors.append(f"{where}: duplicate id (first at line {seen[q.qid].line})")
        seen[q.qid] = q
        missing = [k for k in META_KEYS if k not in q.meta]
        if missing:
            errors.append(f"{where}: metadata missing {missing}")
            continue
        if q.meta["area"] != q.qid[0]:
            errors.append(f"{where}: area {q.meta['area']} does not match id")
        if q.meta["module"] not in modules:
            errors.append(f"{where}: unknown module {q.meta['module']}")
        if q.meta["level"] not in LEVEL_SHARE:
            errors.append(f"{where}: level must be K1..K4")
        if sorted(q.options) != list(LETTERS):
            errors.append(f"{where}: needs options A-D exactly once, found {sorted(q.options)}")
        ans = q.answers
        if any(a not in LETTERS for a in ans):
            errors.append(f"{where}: answer {ans} not in A-D")
        qtype = q.meta["type"]
        stem_text = "\n".join(q.stem)
        if qtype == "single" and len(ans) != 1:
            errors.append(f"{where}: single-answer question needs exactly 1 answer")
        elif qtype == "multi":
            if len(ans) != 2:
                errors.append(f"{where}: multi question needs exactly 2 answers")
            if "เลือก 2 ข้อ" not in stem_text:
                errors.append(f"{where}: multi question stem must say (เลือก 2 ข้อ)")
        elif qtype not in ("single", "multi"):
            errors.append(f"{where}: type must be single or multi")
        if not q.stem:
            errors.append(f"{where}: empty stem")
        if not q.rationale or "**อ้างอิง:**" not in q.rationale:
            errors.append(f"{where}: rationale with **อ้างอิง:** is required")
        for ref in REF_ID_RE.findall(q.rationale):
            if ref not in known_refs:
                errors.append(f"{where}: {ref} is not in references.md")
        if "LL-" in q.rationale and "ตามกฎของ LoanLab" not in stem_text and "LoanLab" not in stem_text:
            errors.append(f"{where}: LoanLab rule used but the stem does not say it is LoanLab's (fictional) rule")
        for part in [q.rationale, *q.options.values()]:
            bare = BARE_LETTER_RE.findall(LETTER_REF_RE.sub("", re.sub(r"`[^`]*`", "", part)))
            if bare:
                errors.append(f"{where}: bare option letter {bare} — write 'ข้อ X' so build can remap it")
        if len(set(q.options.values())) != len(q.options):
            errors.append(f"{where}: two options have the same text")
        body = " ".join([stem_text, *q.options.values(), f"chapter: {q.meta['chapter']}"])
        for topic, pattern in EXCLUDED_TOPICS.items():
            if re.search(pattern, body, flags=re.IGNORECASE):
                warnings.append(f"{where}: touches excluded topic '{topic}' — check against the module text")

    valid = [q for q in questions if all(k in q.meta for k in META_KEYS)]
    per_area = Counter(q.meta["area"] for q in valid)
    for area, quota in FORM_QUOTA.items():
        need = int(quota * BANK_FACTOR + 0.999)
        if per_area[area] < need:
            errors.append(f"area {area}: {per_area[area]} questions, bank needs ≥ {need} (form quota {quota} × {BANK_FACTOR})")
    total = len(valid) or 1
    levels = Counter(q.meta["level"] for q in valid)
    for lvl, (lo, hi) in LEVEL_SHARE.items():
        share = levels[lvl] / total
        if not lo <= share <= hi:
            warnings.append(f"level {lvl}: {share:.0%} of the bank, blueprint {lo:.0%}–{hi:.0%}")
    multi = sum(q.meta["type"] == "multi" for q in valid) / total
    if multi > MULTI_MAX_SHARE:
        warnings.append(f"multi-answer questions: {multi:.0%}, blueprint ≤ {MULTI_MAX_SHARE:.0%}")

    for w in warnings:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")
    print(f"\n{len(questions)} questions in {len(bank_files())} files · {len(errors)} errors · {len(warnings)} warnings")
    return 1 if errors else 0


def stats(questions: list[Question]) -> int:
    def table(title, counter, keys=None):
        keys = keys or sorted(counter)
        print(f"{title}: " + " · ".join(f"{k} {counter[k]}" for k in keys))

    table("Area", Counter(q.meta.get("area") for q in questions), list(FORM_QUOTA))
    table("Level", Counter(q.meta.get("level") for q in questions), list(LEVEL_SHARE))
    table("Type", Counter(q.meta.get("type") for q in questions))
    table("Answer letter", Counter(a for q in questions for a in q.answers), list(LETTERS))
    table("Module", Counter(q.meta.get("module") for q in questions))
    print(f"Form: {sum(FORM_QUOTA.values())} questions, quota per area {FORM_QUOTA}")
    return 0


def remap_letters(text: str, mapping: dict[str, str]) -> str:
    def repl(m):
        letters = re.sub(r"[A-D]", lambda x: mapping[x.group(0)], m.group(2))
        return m.group(1) + letters
    return LETTER_REF_RE.sub(repl, text)


def build(questions: list[Question], seed: int, out: Path, shuffle: bool) -> int:
    rng = random.Random(seed)
    picked: list[Question] = []
    for area, quota in FORM_QUOTA.items():
        pool = sorted((q for q in questions if q.meta.get("area") == area), key=lambda q: q.qid)
        if len(pool) < quota:
            print(f"ERROR area {area}: only {len(pool)} questions for a quota of {quota}")
            return 1
        picked.extend(sorted(rng.sample(pool, quota), key=lambda q: q.qid))

    paper = [f"# Final Exam — Form {seed}", "",
             f"{len(picked)} ข้อ · 90 นาที · ผ่านเมื่อได้ ≥ {round(len(picked) * 0.75)} คะแนน (75%) · "
             "ข้อละ 1 คะแนน · ข้อ \"เลือก 2 ข้อ\" ได้คะแนนเมื่อตอบถูกครบทั้งสองตัวเลือกเท่านั้น", "",
             "> ข้อที่อ้างถึง LoanLab ใช้กฎของระบบสมมติเพื่อการเรียน (REQUIREMENTS-LOANLAB.md ที่แจกให้) ไม่ใช่กฎของธนาคารจริง", ""]
    key = [f"# Final Exam — Form {seed} — Answer key (instructor only)", "",
           "| # | Bank ID | Answer | Area | Level |", "|---|---|---|---|---|"]
    notes = ["", "## Rationale", ""]
    for n, q in enumerate(picked, start=1):
        order = list(LETTERS)
        if shuffle:
            rng.shuffle(order)
        # new letter i shows the option that was order[i]; mapping old → new
        mapping = {old: LETTERS[i] for i, old in enumerate(order)}
        paper += [f"### {n}.", "", *[remap_letters(s, mapping) for s in q.stem], ""]
        for i, old in enumerate(order):
            paper.append(f"- {LETTERS[i]}) {remap_letters(q.options[old], mapping)}")
        paper.append("")
        new_ans = ",".join(sorted(mapping[a] for a in q.answers))
        key.append(f"| {n} | {q.qid} | {new_ans} | {q.meta['area']} | {q.meta['level']} |")
        notes.append(f"**{n}. ({q.qid}) {new_ans}** — {remap_letters(q.rationale, mapping)}")
        notes.append("")

    out.mkdir(parents=True, exist_ok=True)
    (out / f"form-{seed}.md").write_text("\n".join(paper), encoding="utf-8")
    (out / f"form-{seed}-key.md").write_text("\n".join(key + notes), encoding="utf-8")
    print(f"Wrote {rel(out / f'form-{seed}.md')} and {rel(out / f'form-{seed}-key.md')} ({len(picked)} questions)")
    return 0


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check")
    sub.add_parser("stats")
    b = sub.add_parser("build")
    b.add_argument("--seed", type=int, required=True)
    b.add_argument("--out", type=Path, default=DEFAULT_OUT)
    b.add_argument("--no-shuffle", action="store_true")
    args = ap.parse_args(argv)
    questions = parse_bank(bank_files())
    if args.cmd == "check":
        return check(questions)
    if args.cmd == "stats":
        return stats(questions)
    if check(questions):
        print("Fix the errors above before building a form.")
        return 1
    return build(questions, args.seed, args.out, not args.no_shuffle)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
