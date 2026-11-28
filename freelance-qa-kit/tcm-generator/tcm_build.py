#!/usr/bin/env python3
"""TCM generator: Test Coverage Matrix + step matrix -> test cases, coverage report, import CSV, Playwright skeletons.

Inputs (CSV, UTF-8; edit in Google Sheets or any Excel version):
  conditions.csv  Test Coverage Matrix: one row per condition value (dimension, value, technique, risk_id, note)
  steps.csv       Step library: each step and its default expected result, written ONCE
  scenarios.csv   One row per scenario. Columns "cond:<dimension>" pick a condition value; one column per step_id
                  marks the steps the scenario uses: "x" = use the step's default expected result,
                  "x|<text>" = use the step with an expected result for THIS scenario (e.g. a negative case).
                  Steps run in column order. A blank scenario_id becomes <feature>-NNN.

Outputs (in --out, default ./out):
  test-cases.csv     one row per step, with empty execution columns (round, status, actual, finding_id ...)
  import-generic.csv one row per step for Jira/Xray/TestRail CSV importers (map the columns in the importer)
  test-data-prep.csv conditions + test data each scenario needs
  coverage.md        condition values never used, step usage, negative ratio, automation backlog
  playwright/*.spec.ts  test.fixme() skeletons with one test.step() per step, for Automatable/Automated scenarios

Usage (from the repo root):
  python "freelance-qa-kit/tcm-generator/tcm_build.py"            # example input -> out/
  python "freelance-qa-kit/tcm-generator/tcm_build.py" --input jobs/acme/input --out jobs/acme/out
  python "freelance-qa-kit/tcm-generator/tcm_build.py" --check    # validate only; exit 1 on errors

Python 3 standard library only.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path

HERE = Path(__file__).resolve().parent

NEGATIVE = {"Y", "N"}
PRIORITY = {"High", "Medium", "Low"}
TEST_TYPE = {"Smoke", "Regression", "Non-regression", "Functional", "Security", "UI", "A11y", "Performance"}
AUTOMATION = {"Manual", "Automatable", "Automated"}
MAX_TITLE = 255  # common test-management summary limit

EXEC_COLUMNS = ["round", "status", "actual", "finding_id", "evidence", "browser", "tester", "run_date"]


@dataclass
class Step:
    step_id: str
    screen: str
    section: str
    action: str
    expected: str
    user_story: str

    @property
    def name(self) -> str:
        where = f"{self.screen} : {self.section}" if self.section else self.screen
        return f"{where} / {self.action}"


@dataclass
class Scenario:
    row: int
    scenario_id: str
    feature: str
    title: str
    negative: str
    priority: str
    test_type: str
    automation: str
    user_story: str
    test_data: str
    conditions: dict[str, str] = field(default_factory=dict)
    steps: list[tuple[Step, str]] = field(default_factory=list)  # (step, expected for this scenario)

    @property
    def summary(self) -> str:
        return f"{self.scenario_id} {self.title}"

    @property
    def condition_text(self) -> str:
        return "; ".join(f"{k}={v}" for k, v in self.conditions.items() if v)


class Problems:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def error(self, where: str, msg: str) -> None:
        self.errors.append(f"{where}: {msg}")

    def warn(self, where: str, msg: str) -> None:
        self.warnings.append(f"{where}: {msg}")


def read_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    if not path.exists():
        sys.exit(f"ERROR: missing input file {path}")
    with path.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        header = [h.strip() for h in (reader.fieldnames or [])]
        rows = [{(k or "").strip(): (v or "").strip() for k, v in r.items()} for r in reader]
    return header, [r for r in rows if any(r.values())]


def load(input_dir: Path, p: Problems):
    # 1. Test Coverage Matrix
    _, cond_rows = read_csv(input_dir / "conditions.csv")
    conditions: dict[str, dict[str, dict[str, str]]] = defaultdict(dict)  # dimension -> value -> row
    for i, r in enumerate(cond_rows, start=2):
        dim, val = r.get("dimension", ""), r.get("value", "")
        if not dim or not val:
            p.error(f"conditions.csv row {i}", "dimension and value are required")
            continue
        if val in conditions[dim]:
            p.error(f"conditions.csv row {i}", f"duplicate value {dim}={val}")
        conditions[dim][val] = r

    # 2. Step library
    _, step_rows = read_csv(input_dir / "steps.csv")
    steps: dict[str, Step] = {}
    for i, r in enumerate(step_rows, start=2):
        sid = r.get("step_id", "")
        if not sid:
            p.error(f"steps.csv row {i}", "step_id is required")
            continue
        if sid in steps:
            p.error(f"steps.csv row {i}", f"duplicate step_id {sid}")
        if not r.get("screen") or not r.get("action"):
            p.error(f"steps.csv row {i}", f"{sid}: screen and action are required")
        if not r.get("expected"):
            p.warn(f"steps.csv row {i}", f"{sid}: no default expected result — every scenario must override it")
        steps[sid] = Step(sid, r.get("screen", ""), r.get("section", ""), r.get("action", ""),
                          r.get("expected", ""), r.get("user_story", ""))

    # 3. Scenarios (E2E scenario + step matrix)
    header, scen_rows = read_csv(input_dir / "scenarios.csv")
    cond_cols = [h for h in header if h.startswith("cond:")]
    step_cols = [h for h in header if h in steps]
    known = {"scenario_id", "feature", "title", "negative", "priority", "test_type", "automation",
             "user_story", "test_data"}
    for h in header:
        if h and h not in known and h not in cond_cols and h not in steps:
            p.error("scenarios.csv header", f'column "{h}" is not a known field, a cond:<dimension> or a step_id in steps.csv')
    for c in cond_cols:
        if c[5:] not in conditions:
            p.error("scenarios.csv header", f'"{c}": dimension "{c[5:]}" is not in conditions.csv')

    scenarios: list[Scenario] = []
    counters: Counter[str] = Counter()
    seen_ids: set[str] = set()
    for i, r in enumerate(scen_rows, start=2):
        where = f"scenarios.csv row {i}"
        feature = r.get("feature", "") or "TC"
        if re.search(r"\s", feature):
            p.error(where, f'feature "{feature}" must not contain spaces (used in IDs and labels)')
        counters[feature] += 1
        sid = r.get("scenario_id") or f"{feature}-{counters[feature]:03d}"
        if sid in seen_ids:
            p.error(where, f"duplicate scenario_id {sid}")
        seen_ids.add(sid)

        s = Scenario(i, sid, feature, r.get("title", ""), r.get("negative", "N").upper() or "N",
                     r.get("priority", "") or "High", r.get("test_type", "") or "Functional",
                     r.get("automation", "") or "Manual", r.get("user_story", ""), r.get("test_data", ""))
        if not s.title:
            p.error(where, f"{sid}: title is required")
        if len(s.summary) > MAX_TITLE:
            p.error(where, f"{sid}: summary is {len(s.summary)} characters (max {MAX_TITLE})")
        if "__" in s.summary:
            p.error(where, f'{sid}: summary must not contain "__"')
        for value, allowed, name in ((s.negative, NEGATIVE, "negative"), (s.priority, PRIORITY, "priority"),
                                     (s.test_type, TEST_TYPE, "test_type"), (s.automation, AUTOMATION, "automation")):
            if value not in allowed:
                p.error(where, f'{sid}: {name} "{value}" is not one of {sorted(allowed)}')

        for c in cond_cols:
            dim, val = c[5:], r.get(c, "")
            s.conditions[dim] = val
            if val and dim in conditions and val not in conditions[dim]:
                p.error(where, f'{sid}: {dim}="{val}" is not a value in conditions.csv ({", ".join(conditions[dim])})')

        for col in step_cols:
            cell = r.get(col, "")
            if not cell:
                continue
            mark, _, override = cell.partition("|")
            if mark.strip().lower() != "x":
                p.error(where, f'{sid}: step {col} cell "{cell}" must be "x" or "x|<expected result>"')
                continue
            expected = override.strip() or steps[col].expected
            if not expected:
                p.error(where, f"{sid}: step {col} has no expected result (no default in steps.csv, no override)")
            s.steps.append((steps[col], expected))
        if not s.steps:
            p.error(where, f"{sid}: no steps marked")
        if s.negative == "Y" and not any(exp != st.expected for st, exp in s.steps):
            p.warn(where, f"{sid}: negative scenario uses only default (positive) expected results — add an x|<expected> override")
        scenarios.append(s)

    return conditions, steps, step_cols, scenarios


def write_csv(path: Path, header: list[str], rows: list[list[str]]) -> None:
    # utf-8-sig so Excel shows Thai correctly
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)


def build_test_cases(scenarios: list[Scenario], release: str) -> tuple[list[str], list[list[str]]]:
    header = ["tc_id", "step_no", "summary", "description", "step_id", "step", "test_data", "expected",
              "priority", "test_type", "negative", "automation", "user_story", "release"] + EXEC_COLUMNS
    rows = []
    for s in scenarios:
        description = s.title + (f"\nConditions: {s.condition_text}" if s.condition_text else "")
        for n, (st, expected) in enumerate(s.steps, start=1):
            first = n == 1
            rows.append([
                s.scenario_id, f"Step {n}", s.summary if first else "", description if first else "",
                st.step_id, st.name, s.test_data if first else "", expected,
                s.priority, s.test_type, s.negative, s.automation,
                st.user_story or s.user_story, release,
            ] + [""] * len(EXEC_COLUMNS))
    return header, rows


def build_import(scenarios: list[Scenario], release: str) -> tuple[list[str], list[list[str]]]:
    # Generic shape most test-management CSV importers accept after column mapping:
    # one row per step, the test ID repeated so the importer groups steps into one test.
    header = ["Test ID", "Summary", "Description", "Labels", "Priority", "Step No", "Action", "Data",
              "Expected Result", "Requirement", "Fix Version", "Automation Status", "Test Type"]
    rows = []
    for s in scenarios:
        labels = ",".join(x for x in (s.feature, f"negative" if s.negative == "Y" else "", s.test_type.lower()) if x)
        for n, (st, expected) in enumerate(s.steps, start=1):
            first = n == 1
            rows.append([
                s.scenario_id, s.summary if first else "",
                (s.title + (f"\nConditions: {s.condition_text}" if s.condition_text else "")) if first else "",
                labels if first else "", s.priority if first else "", str(n), st.name,
                s.test_data if first else "", expected, st.user_story or s.user_story,
                release if first else "", s.automation if first else "", s.test_type if first else "",
            ])
    return header, rows


def build_data_prep(scenarios: list[Scenario]) -> tuple[list[str], list[list[str]]]:
    return (["scenario_id", "summary", "conditions", "test_data"],
            [[s.scenario_id, s.summary, s.condition_text, s.test_data] for s in scenarios])


def build_coverage(conditions, steps, scenarios: list[Scenario], p: Problems) -> str:
    lines = ["# Coverage report", "", "> Generated by `tcm_build.py` — do not edit; change the input CSVs and regenerate.", ""]
    total_steps = sum(len(s.steps) for s in scenarios)
    neg = sum(1 for s in scenarios if s.negative == "Y")
    lines += [
        "## Summary", "",
        "| Item | Count |", "|---|---|",
        f"| Scenarios | {len(scenarios)} |",
        f"| Test steps (rows in test-cases.csv) | {total_steps} |",
        f"| Negative scenarios | {neg} ({(neg / len(scenarios) * 100 if scenarios else 0):.0f}%) |",
        f"| Expected results overridden per scenario | {sum(1 for s in scenarios for st, e in s.steps if e != st.expected)} |",
        "",
    ]

    lines += ["## Condition coverage (Test Coverage Matrix)", "",
              "| Dimension | Value | Technique | Risk | Used by | |", "|---|---|---|---|---|---|"]
    unused = 0
    for dim, values in conditions.items():
        for val, row in values.items():
            users = [s.scenario_id for s in scenarios if s.conditions.get(dim) == val]
            flag = "✅" if users else "⚠️ not covered"
            unused += 0 if users else 1
            lines.append(f"| {dim} | {val} | {row.get('technique', '')} | {row.get('risk_id', '')} | "
                         f"{', '.join(users) or '–'} | {flag} |")
            if not users:
                p.warn("coverage", f"condition {dim}={val} is not used by any scenario")
    lines += ["", f"**Uncovered condition values: {unused}**", ""]

    lines += ["## Step usage", "", "| Step | Name | Used by | Overrides |", "|---|---|---|---|"]
    for sid, st in steps.items():
        users = [s.scenario_id for s in scenarios if any(x.step_id == sid for x, _ in s.steps)]
        overrides = sum(1 for s in scenarios for x, e in s.steps if x.step_id == sid and e != x.expected)
        lines.append(f"| {sid} | {st.name} | {', '.join(users) or '⚠️ unused'} | {overrides} |")
    lines.append("")

    by_auto = Counter(s.automation for s in scenarios)
    lines += ["## Automation status", "", "| Status | Scenarios |", "|---|---|"]
    lines += [f"| {k} | {by_auto.get(k, 0)} |" for k in ("Manual", "Automatable", "Automated")]
    backlog = [s for s in scenarios if s.automation == "Automatable"]
    if backlog:
        lines += ["", "**Automation backlog (Automatable → skeletons in `playwright/`):**", ""]
        lines += [f"- {s.summary} ({s.priority})" for s in backlog]
    lines.append("")

    by_type = Counter(s.test_type for s in scenarios)
    lines += ["## Test type", "", "| Type | Scenarios |", "|---|---|"]
    lines += [f"| {k} | {v} |" for k, v in sorted(by_type.items())]
    lines.append("")

    if p.warnings:
        lines += ["## Warnings", ""] + [f"- {w}" for w in p.warnings] + [""]
    return "\n".join(lines)


def ts(text: str) -> str:
    """A TypeScript string literal (JSON strings are valid TS)."""
    return json.dumps(text, ensure_ascii=False)


def build_playwright(scenarios: list[Scenario]) -> dict[str, str]:
    files: dict[str, list[Scenario]] = defaultdict(list)
    for s in scenarios:
        if s.automation in ("Automatable", "Automated"):
            files[s.feature].append(s)
    out = {}
    for feature, items in files.items():
        body = [
            "// GENERATED by tcm_build.py from scenarios.csv + steps.csv.",
            "// Copy into playwright-smoke/tests/, then implement each step and change test.fixme to test.",
            "import { test, expect } from '@playwright/test';",
            "",
            f"test.describe({ts(feature)}, () => {{",
        ]
        for s in items:
            tags = [f"@{s.test_type.lower()}", f"@priority-{s.priority.lower()}"]
            if s.negative == "Y":
                tags.append("@negative")
            body.append(f"  test.fixme({ts(s.summary)}, {{ tag: {json.dumps(tags)} }}, async ({{ page }}) => {{")
            if s.condition_text:
                body.append(f"    // Conditions: {s.condition_text}")
            if s.test_data:
                body.append(f"    // Test data: {s.test_data}")
            for n, (st, expected) in enumerate(s.steps, start=1):
                body += [
                    f"    await test.step({ts(f'Step {n} · {st.step_id} · {st.name}')}, async () => {{",
                    f"      // Expected: {expected}",
                    "      // TODO: actions with getByRole/getByLabel, then a web-first assertion, e.g.",
                    "      // await expect(page.getByRole('heading', { name: '...' })).toBeVisible();",
                    "    });",
                ]
            body += ["  });", ""]
        body += ["});", "", "void expect; // keeps the import when no step is implemented yet", ""]
        out[f"{feature.lower()}.spec.ts"] = "\n".join(body)
    return out


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--input", type=Path, default=HERE / "input", help="folder with conditions.csv, steps.csv, scenarios.csv")
    ap.add_argument("--out", type=Path, default=HERE / "out", help="output folder (created; files overwritten)")
    ap.add_argument("--release", default="", help="release/version label written to every test case")
    ap.add_argument("--check", action="store_true", help="validate the input only")
    args = ap.parse_args(argv)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    p = Problems()
    conditions, steps, _, scenarios = load(args.input, p)
    coverage = build_coverage(conditions, steps, scenarios, p)  # adds coverage warnings

    for w in p.warnings:
        print(f"WARN  {w}")
    for e in p.errors:
        print(f"ERROR {e}")
    if p.errors:
        print(f"\n{len(p.errors)} error(s) — nothing written. Fix the input CSVs and run again.")
        return 1
    total_steps = sum(len(s.steps) for s in scenarios)
    print(f"OK    {len(scenarios)} scenarios · {total_steps} steps · {len(steps)} library steps · "
          f"{sum(len(v) for v in conditions.values())} condition values · {len(p.warnings)} warning(s)")
    if args.check:
        return 0

    out = args.out
    (out / "playwright").mkdir(parents=True, exist_ok=True)
    write_csv(out / "test-cases.csv", *build_test_cases(scenarios, args.release))
    write_csv(out / "import-generic.csv", *build_import(scenarios, args.release))
    write_csv(out / "test-data-prep.csv", *build_data_prep(scenarios))
    (out / "coverage.md").write_text(coverage, encoding="utf-8")
    specs = build_playwright(scenarios)
    for old in (out / "playwright").glob("*.spec.ts"):
        if old.name not in specs:
            old.unlink()  # remove skeletons of features that no longer have automatable scenarios
    for name, text in specs.items():
        (out / "playwright" / name).write_text(text, encoding="utf-8")
    print(f"WROTE {out}: test-cases.csv, import-generic.csv, test-data-prep.csv, coverage.md, "
          f"playwright/ ({len(specs)} spec file(s))")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
