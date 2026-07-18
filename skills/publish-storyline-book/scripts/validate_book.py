#!/usr/bin/env python3
"""Validate a Storyline content/<slug> continuous Markdown book directory."""

from __future__ import annotations

import argparse
from datetime import date
import json
import re
import sys
from pathlib import Path
from typing import Any

from script_utils import configure_utf8_stdio


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
COVER_TONES = {
    "amber",
    "charcoal",
    "cinnabar",
    "forest",
    "heather",
    "indigo",
    "ivory",
    "jade",
    "lilac",
    "midnight",
    "ocean",
    "ochre",
    "plum",
    "rose",
    "sage",
    "sand",
    "slate",
    "steel",
    "stone",
    "sunset",
    "teal",
}
ARC_HEADING_PATTERN = re.compile(
    r"^###\s+(.+?)\s+<!--\s*arc-id=([a-z0-9]+(?:-[a-z0-9]+)*)\s+start=(\d+)\s+end=(\d+)\s*-->\s*$",
    re.MULTILINE,
)
CHAPTER_HEADING_PATTERN = re.compile(r"^##\s+(.+?)\s*$", re.MULTILINE)


def without_fenced_code(source: str) -> str:
    result: list[str] = []
    fence_character: str | None = None
    fence_length = 0
    for line in source.splitlines(keepends=True):
        match = re.match(r"^\s*(`{3,}|~{3,})", line)
        if fence_character is None and match:
            fence_character = match.group(1)[0]
            fence_length = len(match.group(1))
        elif (
            fence_character is not None
            and re.match(rf"^\s*{re.escape(fence_character)}{{{fence_length},}}\s*$", line.rstrip("\r\n"))
        ):
            fence_character = None
            fence_length = 0
        if fence_character is not None or match:
            result.append("".join("\n" if character == "\n" else " " for character in line))
        else:
            result.append(line)
    return "".join(result)


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
    for field in ("slug", "title", "author", "era", "subtitle", "description", "publishedAt"):
        if not isinstance(metadata[field], str) or not metadata[field].strip():
            raise ValueError(f"metadata {field} must be a non-empty string")
    try:
        date.fromisoformat(metadata["publishedAt"])
    except ValueError:
        raise ValueError("metadata publishedAt must use YYYY-MM-DD") from None
    if not isinstance(metadata["chapterCount"], int) or metadata["chapterCount"] < 1:
        raise ValueError("metadata chapterCount must be a positive integer")
    if not isinstance(metadata["readingMinutes"], int) or metadata["readingMinutes"] < 1:
        raise ValueError("metadata readingMinutes must be a positive integer")
    if (
        not isinstance(metadata["genres"], list)
        or not metadata["genres"]
        or any(not isinstance(genre, str) or not genre.strip() for genre in metadata["genres"])
    ):
        raise ValueError("metadata genres must be a non-empty array of strings")
    if len(metadata["genres"]) != len(set(metadata["genres"])):
        raise ValueError("metadata genres must not contain duplicates")
    collection_tags = metadata.get("collectionTags")
    if collection_tags is not None:
        if (
            not isinstance(collection_tags, list)
            or not collection_tags
            or any(not isinstance(tag, str) or not tag.strip() for tag in collection_tags)
        ):
            raise ValueError("metadata collectionTags must be a non-empty array of strings")
        if len(collection_tags) != len(set(collection_tags)):
            raise ValueError("metadata collectionTags must not contain duplicates")
    if metadata["coverTone"] not in COVER_TONES:
        raise ValueError(f"metadata coverTone must be one of: {', '.join(sorted(COVER_TONES))}")

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
    structural_source = without_fenced_code(source)
    if CHAPTER_HEADING_PATTERN.search(structural_source):
        raise ValueError("10-route.md must not contain level-two headings")
    matches = list(ARC_HEADING_PATTERN.finditer(structural_source))
    if not matches:
        raise ValueError("10-route.md must contain at least one arc heading with metadata")

    expected_start = 1
    seen_ids: set[str] = set()
    for index, match in enumerate(matches, start=1):
        body_end = matches[index].start() if index < len(matches) else len(source)
        if not paragraphs(source[match.end() : body_end]):
            raise ValueError(f"story arc {index} must contain a summary")
        arc_id = match.group(2)
        if not match.group(1).startswith(f"{index:02d} "):
            raise ValueError(f"story arc {index} must use display number {index:02d}")
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
    structural_source = without_fenced_code(source)
    if len(re.findall(r"^#\s+.+$", structural_source, re.MULTILINE)) != 1:
        raise ValueError("20-full.md must contain exactly one level-one heading")
    matches = list(CHAPTER_HEADING_PATTERN.finditer(structural_source))
    if len(matches) != chapter_count:
        raise ValueError(f"20-full.md must contain exactly {chapter_count} level-two chapter headings")
    headings: list[str] = []
    for index, match in enumerate(matches, start=1):
        body_end = matches[index].start() if index < len(matches) else len(source)
        if not paragraphs(source[match.end() : body_end]):
            raise ValueError(f"chapter {index} must contain body text")
        headings.append(match.group(1).strip())
    return headings


def validate_manifest(
    manifest_path: Path,
    headings: list[str],
    *,
    require_detection: bool = False,
) -> None:
    manifest = read_json(manifest_path)
    chapters = manifest.get("chapters") if isinstance(manifest, dict) else None
    chapter_count = manifest.get("chapter_count") if isinstance(manifest, dict) else None
    if chapter_count != len(headings):
        raise ValueError("manifest chapter_count does not match published chapters")
    if require_detection and manifest.get("chapter_detection") not in {
        "epub-spine",
        "file-boundaries",
        "single-chapter-opt-in",
        "text-headings",
    }:
        raise ValueError("manifest must record a supported chapter_detection method")
    if not isinstance(chapters, list) or len(chapters) != len(headings):
        raise ValueError("manifest chapter count does not match published chapters")
    for index, (chapter, heading) in enumerate(zip(chapters, headings, strict=True), start=1):
        if not isinstance(chapter, dict) or chapter.get("index") != index:
            raise ValueError(f"manifest chapter index mismatch at chapter {index}")
        expected = chapter.get("title") if isinstance(chapter, dict) else None
        normalized_heading = re.sub(r"[\s\u3000]+", " ", heading).strip()
        normalized_expected = (
            re.sub(r"[\s\u3000]+", " ", expected).strip() if isinstance(expected, str) else None
        )
        if normalized_expected != normalized_heading:
            raise ValueError(f"manifest title mismatch at chapter {index}: {heading!r} != {expected!r}")


def validate_book(
    book_dir: Path,
    manifest_path: Path | None,
    *,
    require_manifest: bool = False,
) -> None:
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
    embedded_manifest = book_dir / "source" / "manifest.json"
    effective_manifest = manifest_path or (embedded_manifest if embedded_manifest.is_file() else None)
    if require_manifest and effective_manifest is None:
        raise ValueError("a source manifest is required for this publication")
    if effective_manifest is not None:
        validate_manifest(effective_manifest, headings, require_detection=require_manifest)


def main() -> int:
    configure_utf8_stdio()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("book_dir", type=Path)
    parser.add_argument("--manifest", type=Path)
    parser.add_argument("--require-manifest", action="store_true")
    args = parser.parse_args()
    try:
        validate_book(
            args.book_dir.resolve(),
            args.manifest.resolve() if args.manifest else None,
            require_manifest=args.require_manifest,
        )
    except (OSError, ValueError) as error:
        print(f"[ERROR] {error}", file=sys.stderr)
        return 1
    print(f"[OK] validated {args.book_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
