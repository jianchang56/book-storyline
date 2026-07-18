#!/usr/bin/env python3
"""Estimate and synchronize reading minutes from published Markdown content."""

from __future__ import annotations

import argparse
import copy
import json
import math
import re
from pathlib import Path
from typing import Any

from script_utils import configure_utf8_stdio, iter_book_dirs


CHARS_PER_MINUTE = 400
MODE_FILES = ("00-overview.md", "10-route.md", "20-full.md")
MINUTES_PATTERN = re.compile(r"\d+\s*分钟")


def count_readable_characters(markdown: str) -> int:
    text = re.sub(r"<!--.*?-->", "", markdown, flags=re.DOTALL)
    text = re.sub(r"!\[([^]]*)]\([^)]+\)", r"\1", text)
    text = re.sub(r"\[([^]]+)]\([^)]+\)", r"\1", text)
    return sum(character.isalnum() for character in text)


def estimate_minutes(markdown: str) -> int:
    return max(1, math.ceil(count_readable_characters(markdown) / CHARS_PER_MINUTE))


def update_metadata_minutes(metadata: dict[str, Any], minutes: list[int]) -> dict[str, Any]:
    updated = copy.deepcopy(metadata)
    modes = updated.get("readingModes")
    if (
        not isinstance(modes, list)
        or len(modes) != 3
        or any(not isinstance(mode, dict) for mode in modes)
    ):
        raise ValueError("metadata readingModes must contain three objects")
    modes_by_id = {
        mode.get("id"): mode for mode in modes if isinstance(mode.get("id"), str)
    }
    if set(modes_by_id) != {"overview", "journey", "complete"}:
        raise ValueError("metadata readingModes must contain overview, journey, complete")

    updated["readingMinutes"] = minutes[2]
    for mode_id, value in zip(("overview", "journey", "complete"), minutes, strict=True):
        modes_by_id[mode_id]["readingMinutes"] = value
    return updated


def synchronize_markdown_minutes(book_dir: Path, minutes: list[int], *, check: bool) -> bool:
    changed = False
    readme_path = book_dir / "README.md"
    readme = readme_path.read_text(encoding="utf-8")
    updated_readme = readme
    for filename, value in zip(MODE_FILES, minutes, strict=True):
        lines = updated_readme.splitlines(keepends=True)
        updated_readme = "".join(
            MINUTES_PATTERN.sub(f"{value} 分钟", line) if f"]({filename})" in line else line
            for line in lines
        )
    if updated_readme != readme:
        changed = True
        if not check:
            readme_path.write_text(updated_readme, encoding="utf-8", newline="\n")

    for filename, value in zip(MODE_FILES, minutes, strict=True):
        path = book_dir / filename
        markdown = path.read_text(encoding="utf-8")
        first_line, separator, remainder = markdown.partition("\n")
        updated_first_line = MINUTES_PATTERN.sub(f"{value} 分钟", first_line)
        updated_markdown = updated_first_line + separator + remainder
        if updated_markdown != markdown:
            changed = True
            if not check:
                path.write_text(updated_markdown, encoding="utf-8", newline="\n")
    return changed


def update_book(book_dir: Path, *, check: bool) -> tuple[bool, list[int]]:
    metadata_path = book_dir / "metadata.json"
    metadata: dict[str, Any] = json.loads(metadata_path.read_text(encoding="utf-8"))
    if metadata.get("slug") != book_dir.name:
        raise ValueError(f"metadata slug must match directory: {book_dir}")

    minutes = [
        estimate_minutes((book_dir / filename).read_text(encoding="utf-8"))
        for filename in MODE_FILES
    ]
    updated_metadata = update_metadata_minutes(metadata, minutes)
    changed = updated_metadata != metadata
    if changed and not check:
        metadata_path.write_text(
            json.dumps(updated_metadata, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
            newline="\n",
        )
    changed = synchronize_markdown_minutes(book_dir, minutes, check=check) or changed
    return changed, minutes


def main() -> int:
    configure_utf8_stdio()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("content_dir", nargs="?", type=Path, default=Path("content"))
    parser.add_argument("--check", action="store_true", help="fail when stored estimates are stale")
    args = parser.parse_args()
    content_dir = args.content_dir.resolve()

    changed_books: list[str] = []
    try:
        book_dirs = iter_book_dirs(content_dir)
        for book_dir in book_dirs:
            changed, minutes = update_book(book_dir, check=args.check)
            if changed:
                changed_books.append(book_dir.name)
            print(f"{book_dir.name}: overview={minutes[0]}, journey={minutes[1]}, complete={minutes[2]}")
    except (OSError, ValueError, json.JSONDecodeError) as error:
        raise SystemExit(f"[ERROR] {error}") from error

    if args.check and changed_books:
        raise SystemExit(f"[ERROR] stale reading estimates: {', '.join(changed_books)}")
    action = "checked" if args.check else "updated"
    print(f"[OK] {action} {len(book_dirs)} books; {len(changed_books)} changed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
