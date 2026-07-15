#!/usr/bin/env python3
"""Generate content/catalog.json from published book metadata."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


REQUIRED_FIELDS = {
    "slug",
    "title",
    "author",
    "subtitle",
    "genres",
    "readingMinutes",
    "chapterCount",
    "coverTone",
    "publishedAt",
}


def read_metadata(book_dir: Path) -> dict[str, Any]:
    path = book_dir / "metadata.json"
    try:
        metadata = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        raise ValueError(f"invalid JSON in {path}: {error}") from error
    if not isinstance(metadata, dict):
        raise ValueError(f"{path} must contain an object")
    missing = sorted(REQUIRED_FIELDS - metadata.keys())
    if missing:
        raise ValueError(f"{path} missing fields: {', '.join(missing)}")
    if metadata["slug"] != book_dir.name:
        raise ValueError(f"metadata slug must match directory: {book_dir}")
    return metadata


def collect_books(content_dir: Path) -> list[dict[str, Any]]:
    books: list[dict[str, Any]] = []
    for book_dir in sorted(
        path for path in content_dir.iterdir() if path.is_dir() and not path.name.startswith((".", "_"))
    ):
        metadata_path = book_dir / "metadata.json"
        if not metadata_path.is_file():
            raise ValueError(f"missing file: {metadata_path}")
        metadata = read_metadata(book_dir)
        book = {
            "slug": metadata["slug"],
            "title": metadata["title"],
            "author": metadata["author"],
            "tagline": metadata["subtitle"],
            "genres": metadata["genres"],
            "readingMinutes": metadata["readingMinutes"],
            "chapterCount": metadata["chapterCount"],
            "coverTone": metadata["coverTone"],
            "publishedAt": metadata["publishedAt"],
            "status": "published",
        }
        if "collectionTags" in metadata:
            book["collectionTags"] = metadata["collectionTags"]
        books.append(book)
    books.sort(key=lambda book: book["slug"])
    books.sort(key=lambda book: book["publishedAt"], reverse=True)
    return books


def format_catalog(books: list[dict[str, Any]]) -> str:
    lines = ["["]
    fields = [
        "slug",
        "title",
        "author",
        "tagline",
        "genres",
        "collectionTags",
        "readingMinutes",
        "chapterCount",
        "coverTone",
        "publishedAt",
        "status",
    ]
    for book_index, book in enumerate(books):
        lines.append("  {")
        present_fields = [field for field in fields if field in book]
        for field_index, field in enumerate(present_fields):
            comma = "," if field_index < len(present_fields) - 1 else ""
            value = json.dumps(book[field], ensure_ascii=False)
            lines.append(f"    {json.dumps(field)}: {value}{comma}")
        lines.append("  }," if book_index < len(books) - 1 else "  }")
    lines.append("]")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("content_dir", nargs="?", type=Path, default=Path("content"))
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    content_dir = args.content_dir.resolve()
    output = args.output.resolve() if args.output else content_dir / "catalog.json"
    if not content_dir.is_dir():
        raise SystemExit(f"[ERROR] content directory not found: {content_dir}")
    try:
        books = collect_books(content_dir)
    except (OSError, ValueError) as error:
        raise SystemExit(f"[ERROR] {error}") from error
    if not books:
        raise SystemExit("[ERROR] no published books found")
    output.write_text(format_catalog(books), encoding="utf-8", newline="\n")
    print(f"[OK] generated {output} with {len(books)} books")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
