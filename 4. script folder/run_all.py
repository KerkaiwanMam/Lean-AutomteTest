"""Run every content check in one go (use before and after each edit).

Usage:  python "4. script folder/run_all.py" [paths...]
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
STEPS = [
    ("Structure audit (modules)", ["audit_structure.py"], False),
    ("Links", ["check_links.py"], True),
    ("Text lint", ["text_lint.py"], True),
    ("Fact-check queue", ["extract_claims.py"], True),
]


def main(argv):
    results = []
    for title, cmd, takes_paths in STEPS:
        print(f"\n===== {title} =====", flush=True)
        args = [sys.executable, str(HERE / cmd[0]), *(argv if takes_paths else [])]
        code = subprocess.call(args, cwd=HERE.parent)
        results.append((title, code))
    print("\n===== Summary =====")
    for title, code in results:
        print(f"{'PASS' if code == 0 else 'FINDINGS'}  {title}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
