from __future__ import annotations

import sys
from pathlib import Path


def configure_utf8_stdio() -> None:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")


def iter_book_dirs(content_dir: Path) -> list[Path]:
    return sorted(
        path
        for path in content_dir.iterdir()
        if path.is_dir() and not path.name.startswith((".", "_"))
    )
