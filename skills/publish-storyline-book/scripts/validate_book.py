#!/usr/bin/env python3
"""Validate a Storyline content/books/<slug> directory."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


ARC_ID_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
CHAPTER_FILE_PATTERN = re.compile(r"^\d{4}\.md$")
REQUIRED_METADATA = {
    "slug",
    "title",
    "author",
    "era",
    "subtitle",
    "description",
    "genres",
    "readingMinutes",
    "chapterCount",
    "coverTone",
    "publishedAt",
}


def read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise ValueError(f"missing file: {path}") from None
    except json.JSONDecodeError as error:
        raise ValueError(f"invalid JSON in {path}: {error}") from error


def heading_and_body(path: Path) -> tuple[str, str]:
    source = path.read_text(encoding="utf-8").replace("\r\n", "\n").strip()
    first_line, _, body = source.partition("\n")
    if not first_line.startswith("# "):
        raise ValueError(f"{path} must start with a level-one heading")
    if not body.strip():
        raise ValueError(f"{path} must contain body text")
    return first_line[2:].strip(), body.strip()


def validate_metadata(book_dir: Path) -> dict[str, Any]:
    metadata = read_json(book_dir / "metadata.json")
    if not isinstance(metadata, dict):
        raise ValueError("metadata.json must contain an object")
    missing = sorted(REQUIRED_METADATA - metadata.keys())
    if missing:
        raise ValueError(f"metadata.json missing fields: {', '.join(missing)}")
    if metadata["slug"] != book_dir.name:
        raise ValueError("metadata slug must match the book directory name")
    if not isinstance(metadata["chapterCount"], int) or metadata["chapterCount"] < 1:
        raise ValueError("metadata chapterCount must be a positive integer")
    if not isinstance(metadata["readingMinutes"], int) or metadata["readingMinutes"] < 1:
        raise ValueError("metadata readingMinutes must be a positive integer")
    if not isinstance(metadata["genres"], list) or not metadata["genres"]:
        raise ValueError("metadata genres must be a non-empty array")
    return metadata


def validate_chapters(book_dir: Path, chapter_count: int) -> list[str]:
    chapters_dir = book_dir / "chapters"
    if not chapters_dir.is_dir():
        raise ValueError(f"missing directory: {chapters_dir}")
    files = sorted(path for path in chapters_dir.iterdir() if path.is_file())
    unexpected = [path.name for path in files if not CHAPTER_FILE_PATTERN.fullmatch(path.name)]
    if unexpected:
        raise ValueError(f"unexpected chapter filenames: {', '.join(unexpected)}")
    expected_names = [f"{index:04d}.md" for index in range(1, chapter_count + 1)]
    actual_names = [path.name for path in files]
    if actual_names != expected_names:
        raise ValueError("chapter files must be continuous from 0001.md to chapterCount")
    return [heading_and_body(path)[0] for path in files]


def validate_arcs(book_dir: Path, chapter_count: int) -> None:
    arcs = read_json(book_dir / "story-arcs.json")
    if not isinstance(arcs, list) or not arcs:
        raise ValueError("story-arcs.json must contain a non-empty array")
    expected_start = 1
    seen_ids: set[str] = set()
    for index, arc in enumerate(arcs, start=1):
        if not isinstance(arc, dict):
            raise ValueError(f"story arc {index} must be an object")
        arc_id = arc.get("id")
        title = arc.get("title")
        summary = arc.get("summary")
        start = arc.get("startChapter")
        end = arc.get("endChapter")
        if not isinstance(arc_id, str) or not ARC_ID_PATTERN.fullmatch(arc_id):
            raise ValueError(f"story arc {index} has an invalid id")
        if arc_id in seen_ids:
            raise ValueError(f"duplicate story arc id: {arc_id}")
        seen_ids.add(arc_id)
        if not isinstance(title, str) or not title.strip():
            raise ValueError(f"story arc {index} must have a title")
        if not isinstance(summary, str) or not summary.strip():
            raise ValueError(f"story arc {index} must have a summary")
        if start != expected_start or not isinstance(end, int) or end < start:
            raise ValueError(f"story arc {index} does not continue from chapter {expected_start}")
        expected_start = end + 1
    if expected_start != chapter_count + 1:
        raise ValueError(f"story arcs must end at chapter {chapter_count}")


def validate_manifest(manifest_path: Path, headings: list[str]) -> None:
    manifest = read_json(manifest_path)
    chapters = manifest.get("chapters") if isinstance(manifest, dict) else None
    if not isinstance(chapters, list) or len(chapters) != len(headings):
        raise ValueError("manifest chapter count does not match published chapters")
    for index, (chapter, heading) in enumerate(zip(chapters, headings, strict=True), start=1):
        expected = chapter.get("title") if isinstance(chapter, dict) else None
        normalized_heading = re.sub(r"[\s\u3000]+", " ", heading).strip()
        normalized_expected = (
            re.sub(r"[\s\u3000]+", " ", expected).strip() if isinstance(expected, str) else None
        )
        if normalized_expected != normalized_heading:
            raise ValueError(f"manifest title mismatch at chapter {index}: {heading!r} != {expected!r}")


def validate_book(book_dir: Path, manifest_path: Path | None) -> None:
    if not book_dir.is_dir():
        raise ValueError(f"book directory not found: {book_dir}")
    metadata = validate_metadata(book_dir)
    heading_and_body(book_dir / "overview.md")
    headings = validate_chapters(book_dir, metadata["chapterCount"])
    validate_arcs(book_dir, metadata["chapterCount"])
    if manifest_path is not None:
        validate_manifest(manifest_path, headings)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("book_dir", type=Path)
    parser.add_argument("--manifest", type=Path)
    args = parser.parse_args()
    try:
        validate_book(args.book_dir.resolve(), args.manifest.resolve() if args.manifest else None)
    except (OSError, ValueError) as error:
        print(f"[ERROR] {error}", file=sys.stderr)
        return 1
    print(f"[OK] validated {args.book_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
