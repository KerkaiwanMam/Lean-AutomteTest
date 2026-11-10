"""Check relative links between markdown files and list external URLs (for the reference folder).

Usage:  python "4. script folder/check_links.py" [paths...]  [--urls]
Exit code 1 when a relative link points to a missing file.
"""
from __future__ import annotations

import re
import sys

from _common import iter_markdown, rel

LINK = re.compile(r"\]\(([^)\s]+)\)")


def main(argv):
    show_urls = "--urls" in argv
    targets = [a for a in argv if a != "--urls"]
    broken, urls = [], {}
    for path in iter_markdown(targets or None):
        for no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            for m in LINK.finditer(line):
                target = m.group(1)
                if target.startswith(("http://", "https://")):
                    urls.setdefault(target, []).append(f"{rel(path)}:{no}")
                    continue
                if target.startswith(("#", "mailto:")):
                    continue
                file_part = target.split("#", 1)[0]
                if file_part and not (path.parent / file_part).exists():
                    broken.append(f"{rel(path)}:{no}: {target}")
    for b in broken:
        print("BROKEN", b)
    if show_urls:
        for u, where in sorted(urls.items()):
            print(f"URL    {u}  ({len(where)}× e.g. {where[0]})")
    print(f"\n{len(broken)} broken relative link(s) · {len(urls)} unique external URL(s)")
    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
