"""Shared helpers for the content scripts (stdlib only)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_TARGETS = ["docs", "README.md", "practice-app/REQUIREMENTS.md"]

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def iter_markdown(targets: list[str] | None = None):
    """Yield markdown files under the given paths (relative to repo root)."""
    for t in targets or DEFAULT_TARGETS:
        p = (ROOT / t) if not Path(t).is_absolute() else Path(t)
        if p.is_file() and p.suffix == ".md":
            yield p
        elif p.is_dir():
            yield from sorted(p.rglob("*.md"))


def rel(p: Path) -> str:
    try:
        return p.relative_to(ROOT).as_posix()
    except ValueError:
        return p.as_posix()


def prose_lines(text: str):
    """Yield (line_no, line) for lines outside fenced code blocks, with inline `code` removed."""
    in_code = False
    for no, line in enumerate(text.splitlines(), start=1):
        if line.lstrip().startswith("```"):
            in_code = not in_code
            continue
        if in_code:
            continue
        yield no, re.sub(r"`[^`]*`", "", line)
