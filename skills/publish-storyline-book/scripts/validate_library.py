#!/usr/bin/env python3
"""Validate every published Storyline book and the generated catalog."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from generate_catalog import collect_books
from validate_book import validate_book


def read_catalog(path: Path) -> list[dict[str, Any]]:
    try:
        catalog = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise ValueError(f"missing file: {path}") from None
    except json.JSONDecodeError as error:
        raise ValueError(f"invalid JSON in {path}: {error}") from error
    if not isinstance(catalog, list) or not all(isinstance(book, dict) for book in catalog):
        raise ValueError("catalog.json must contain an array of objects")
    slugs = [book.get("slug") for book in catalog]
    if any(not isinstance(slug, str) or not slug for slug in slugs):
        raise ValueError("every catalog entry must have a non-empty slug")
    if len(slugs) != len(set(slugs)):
        raise ValueError("catalog.json contains duplicate slugs")
    return catalog


def validate_library(content_dir: Path, catalog_path: Path) -> int:
    expected_catalog = collect_books(content_dir)
    if not expected_catalog:
        raise ValueError("no published books found")
    for book in expected_catalog:
        validate_book(content_dir / book["slug"], None)

    actual_catalog = read_catalog(catalog_path)
    if actual_catalog != expected_catalog:
        raise ValueError(
            "catalog.json is out of date; run generate_catalog.py before validating the library"
        )
    return len(expected_catalog)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("content_dir", nargs="?", type=Path, default=Path("content"))
    parser.add_argument("--catalog", type=Path)
    args = parser.parse_args()
    content_dir = args.content_dir.resolve()
    catalog_path = args.catalog.resolve() if args.catalog else content_dir / "catalog.json"
    if not content_dir.is_dir():
        print(f"[ERROR] content directory not found: {content_dir}", file=sys.stderr)
        return 1
    try:
        count = validate_library(content_dir, catalog_path)
    except (OSError, ValueError) as error:
        print(f"[ERROR] {error}", file=sys.stderr)
        return 1
    print(f"[OK] validated {count} books and {catalog_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
