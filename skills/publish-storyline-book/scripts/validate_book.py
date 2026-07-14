#!/usr/bin/env python3
"""Validate a Storyline content/<slug> continuous Markdown book directory."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


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
    "readingModes",
}
READING_MODE_FILES = {
    "overview": "00-overview.md",
    "journey": "10-route.md",
    "complete": "20-full.md",
}
ARC_HEADING_PATTERN = re.compile(
    r"^###\s+(.+?)\s+<!--\s*arc-id=([a-z0-9]+(?:-[a-z0-9]+)*)\s+start=(\d+)\s+end=(\d+)\s*-->\s*$",
    re.MULTILINE,
)
CHAPTER_HEADING_PATTERN = re.compile(r"^##\s+(.+?)\s*$", re.MULTILINE)


def read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise ValueError(f"missing file: {path}") from None
    except json.JSONDecodeError as error:
        raise ValueError(f"invalid JSON in {path}: {error}") from error


def read_markdown(path: Path) -> str:
    try:
        source = path.read_text(encoding="utf-8").replace("\r\n", "\n").strip()
    except FileNotFoundError:
        raise ValueError(f"missing file: {path}") from None
    if not source:
        raise ValueError(f"{path} must not be empty")
    return source


def heading_and_body(path: Path) -> tuple[str, str]:
    source = read_markdown(path)
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

    modes = metadata["readingModes"]
    mode_ids = [mode.get("id") for mode in modes if isinstance(mode, dict)] if isinstance(modes, list) else []
    if mode_ids != list(READING_MODE_FILES):
        raise ValueError("metadata readingModes must be ordered overview, journey, complete")
    for mode in modes:
        if not isinstance(mode, dict):
            raise ValueError("each reading mode must be an object")
        mode_id = mode.get("id")
        if mode.get("file") != READING_MODE_FILES.get(mode_id):
            raise ValueError(f"reading mode {mode_id!r} must use its canonical Markdown filename")
        if not isinstance(mode.get("title"), str) or not mode["title"].strip():
            raise ValueError(f"reading mode {mode_id!r} must have a title")
        if not isinstance(mode.get("readingMinutes"), int) or mode["readingMinutes"] < 1:
            raise ValueError(f"reading mode {mode_id!r} readingMinutes must be positive")
    if modes[-1]["readingMinutes"] != metadata["readingMinutes"]:
        raise ValueError("complete reading mode must match metadata readingMinutes")
    return metadata


def paragraphs(source: str) -> list[str]:
    return [
        paragraph.replace("\n", " ").strip()
        for paragraph in re.split(r"\n\s*\n", source.strip())
        if paragraph.strip()
    ]


def validate_route(book_dir: Path, chapter_count: int) -> None:
    route_path = book_dir / READING_MODE_FILES["journey"]
    source = read_markdown(route_path)
    heading_and_body(route_path)
    matches = list(ARC_HEADING_PATTERN.finditer(source))
    if not matches:
        raise ValueError("10-route.md must contain at least one arc heading with metadata")

    expected_start = 1
    seen_ids: set[str] = set()
    for index, match in enumerate(matches, start=1):
        body_end = matches[index].start() if index < len(matches) else len(source)
        if not paragraphs(source[match.end() : body_end]):
            raise ValueError(f"story arc {index} must contain a summary")
        arc_id = match.group(2)
        start = int(match.group(3))
        end = int(match.group(4))
        if arc_id in seen_ids:
            raise ValueError(f"duplicate story arc id: {arc_id}")
        seen_ids.add(arc_id)
        if start != expected_start or end < start:
            raise ValueError(f"story arc {index} does not continue from chapter {expected_start}")
        expected_start = end + 1
    if expected_start != chapter_count + 1:
        raise ValueError(f"story arcs must end at chapter {chapter_count}")


def validate_full(book_dir: Path, chapter_count: int) -> list[str]:
    full_path = book_dir / READING_MODE_FILES["complete"]
    source = read_markdown(full_path)
    heading_and_body(full_path)
    matches = list(CHAPTER_HEADING_PATTERN.finditer(source))
    if len(matches) != chapter_count:
        raise ValueError(f"20-full.md must contain exactly {chapter_count} level-two chapter headings")
    headings: list[str] = []
    for index, match in enumerate(matches, start=1):
        body_end = matches[index].start() if index < len(matches) else len(source)
        if not paragraphs(source[match.end() : body_end]):
            raise ValueError(f"chapter {index} must contain body text")
        headings.append(match.group(1).strip())
    return headings


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
    readme = read_markdown(book_dir / "README.md")
    for filename in READING_MODE_FILES.values():
        if f"({filename})" not in readme:
            raise ValueError(f"README.md must link to {filename}")
    heading_and_body(book_dir / READING_MODE_FILES["overview"])
    validate_route(book_dir, metadata["chapterCount"])
    headings = validate_full(book_dir, metadata["chapterCount"])
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
