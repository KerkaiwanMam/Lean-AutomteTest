"""Bug-detection grader for Skills Assessments and the Capstone (Python 3 standard library only).

It runs a learner's test command against a fresh ShopLab:
  1. baseline  — no planted defect: the suite MUST pass (exit code 0), otherwise the result is invalid;
  2. once per planted defect — ShopLab is restarted with GRADING_BUGS=<id>, so exactly one defect is
     active and the suite cannot switch it off. A non-zero exit code means the suite detected it.

Usage (from the repository root):
  python tools/grade_suite.py --cwd tests/playwright --cmd "npx playwright test --project=api"
  python tools/grade_suite.py --cwd tests/robot --cmd "robot --outputdir {out} --exclude legacy tests" --bugs BUG-01,BUG-07
  python tools/grade_suite.py ... --report grading/student-01        (writes report.md + result.json + logs)

The command receives BASE_URL=http://localhost:<port> and START_SERVER=0 in its environment.
`{out}` and `{base_url}` in --cmd are replaced with a per-run output folder and the base URL.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "practice-app"
ALL_BUGS = [f"BUG-{i:02d}" for i in range(1, 14)]

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def wait_healthy(base_url: str, timeout: float = 30) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"{base_url}/api/health", timeout=2) as r:
                if r.status == 200:
                    return True
        except OSError:
            time.sleep(0.3)
    return False


def start_app(port: int, grading_bug: str | None, data_dir: Path, log_path: Path) -> subprocess.Popen:
    env = {**os.environ, "PORT": str(port), "SHOPLAB_DATA_DIR": str(data_dir)}
    env.pop("BUG_MODE", None)
    if grading_bug:
        env["GRADING_BUGS"] = grading_bug
    else:
        env.pop("GRADING_BUGS", None)
    log = open(log_path, "w", encoding="utf-8")
    return subprocess.Popen(
        ["node", "--no-warnings=ExperimentalWarning", "src/server.js"],
        cwd=APP, env=env, stdout=log, stderr=subprocess.STDOUT,
    )


def stop_app(proc: subprocess.Popen) -> None:
    proc.terminate()
    try:
        proc.wait(timeout=10)
    except subprocess.TimeoutExpired:
        proc.kill()


def run_once(label: str, grading_bug: str | None, args, report_dir: Path) -> dict:
    base_url = f"http://localhost:{args.port}"
    run_dir = report_dir / label
    run_dir.mkdir(parents=True, exist_ok=True)
    data_dir = Path(tempfile.mkdtemp(prefix="shoplab-grade-"))
    app = start_app(args.port, grading_bug, data_dir, run_dir / "shoplab.log")
    try:
        if not wait_healthy(base_url):
            return {"run": label, "bug": grading_bug, "status": "app-did-not-start", "exit": None, "seconds": 0}
        cmd = args.cmd.replace("{out}", str(run_dir / "out")).replace("{base_url}", base_url)
        env = {**os.environ, "BASE_URL": base_url, "START_SERVER": "0"}
        env.pop("BUG_MODE", None)
        started = time.time()
        with open(run_dir / "suite.log", "w", encoding="utf-8") as log:
            try:
                code = subprocess.run(cmd, shell=True, cwd=ROOT / args.cwd, env=env, stdout=log,
                                      stderr=subprocess.STDOUT, timeout=args.timeout).returncode
            except subprocess.TimeoutExpired:
                code = "timeout"
        return {"run": label, "bug": grading_bug, "exit": code, "seconds": round(time.time() - started, 1),
                "status": "ok"}
    finally:
        stop_app(app)
        shutil.rmtree(data_dir, ignore_errors=True)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--cmd", required=True, help="test command to run (shell syntax)")
    ap.add_argument("--cwd", default=".", help="folder to run the command in, relative to the repo root")
    ap.add_argument("--bugs", default="all", help="'all' or a comma list such as BUG-01,BUG-07")
    ap.add_argument("--port", type=int, default=3100)
    ap.add_argument("--timeout", type=int, default=1200, help="seconds per suite run")
    ap.add_argument("--report", default=None, help="folder for report.md, result.json and logs")
    args = ap.parse_args()

    bugs = ALL_BUGS if args.bugs == "all" else [b.strip().upper() for b in args.bugs.split(",") if b.strip()]
    unknown = [b for b in bugs if b not in ALL_BUGS]
    if unknown:
        ap.error(f"unknown bug ids: {unknown}")
    report_dir = Path(args.report or (ROOT / "grading" / datetime.now().strftime("%Y%m%d-%H%M%S"))).resolve()
    report_dir.mkdir(parents=True, exist_ok=True)

    print(f"Grading: {args.cmd}\n  cwd={args.cwd}  bugs={','.join(bugs)}  report={report_dir}\n")
    baseline = run_once("baseline", None, args, report_dir)
    print(f"baseline (no defect)  exit={baseline['exit']}  {baseline['seconds']}s  -> "
          f"{'GREEN' if baseline['exit'] == 0 else 'NOT GREEN — results invalid'}")

    results = []
    for bug in bugs:
        r = run_once(bug, bug, args, report_dir)
        r["detected"] = r["status"] == "ok" and r["exit"] not in (0, None)
        results.append(r)
        print(f"{bug}  exit={r['exit']}  {r['seconds']}s  -> {'DETECTED' if r['detected'] else 'missed'}")

    detected = [r["bug"] for r in results if r["detected"]]
    valid = baseline["exit"] == 0
    summary = {
        "command": args.cmd, "cwd": args.cwd, "valid": valid, "baseline": baseline,
        "detected": detected, "missed": [r["bug"] for r in results if not r["detected"]],
        "score": f"{len(detected)}/{len(results)}", "runs": results,
    }
    (report_dir / "result.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    lines = [
        "# Bug-detection report", "",
        f"- Command: `{args.cmd}` (cwd `{args.cwd}`)",
        f"- Baseline (no defect): exit {baseline['exit']} — {'valid' if valid else '**INVALID: suite is not green without defects**'}",
        f"- Detected: **{len(detected)}/{len(results)}**", "",
        "| Defect | Exit code | Seconds | Result |", "|---|---|---|---|",
        *[f"| {r['bug']} | {r['exit']} | {r['seconds']} | {'detected' if r['detected'] else 'missed'} |" for r in results],
        "", "Logs: one folder per run (`suite.log`, `shoplab.log`).",
    ]
    (report_dir / "report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\n{'VALID' if valid else 'INVALID'}  detected {len(detected)}/{len(results)}: {', '.join(detected) or '-'}")
    print(f"report: {report_dir / 'report.md'}")
    return 0 if valid else 2


if __name__ == "__main__":
    sys.exit(main())
