from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from migrate_legacy_book import format_route
from script_utils import iter_book_dirs
from update_reading_minutes import update_book
from validate_book import validate_book, validate_full, validate_manifest, validate_metadata


def valid_metadata(slug: str) -> dict[str, object]:
    return {
        "readingModes": [
            {
                "id": "overview",
                "file": "00-overview.md",
                "title": "全书速览",
                "readingMinutes": 1,
            },
            {
                "id": "journey",
                "file": "10-route.md",
                "title": "故事路线",
                "readingMinutes": 1,
            },
            {
                "id": "complete",
                "file": "20-full.md",
                "title": "完整梗概",
                "readingMinutes": 1,
            },
        ],
        "slug": slug,
        "title": "示例书",
        "author": "示例作者",
        "era": "现代",
        "subtitle": "示例副标题",
        "description": "示例描述",
        "genres": ["小说"],
        "readingMinutes": 1,
        "chapterCount": 1,
        "coverTone": "jade",
        "publishedAt": "2026-07-18",
    }


def write_valid_book(book_dir: Path) -> None:
    book_dir.mkdir()
    (book_dir / "metadata.json").write_text(
        json.dumps(valid_metadata(book_dir.name), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (book_dir / "README.md").write_text(
        "# 示例\n\n- [1 分钟](00-overview.md)\n- [1 分钟](10-route.md)\n- [1 分钟](20-full.md)\n",
        encoding="utf-8",
    )
    (book_dir / "00-overview.md").write_text("# 速览\n\n正文。\n", encoding="utf-8")
    (book_dir / "10-route.md").write_text(
        "# 路线\n\n### 01 开端 <!-- arc-id=start start=1 end=1 -->\n\n正文。\n",
        encoding="utf-8",
    )
    (book_dir / "20-full.md").write_text(
        "# 完整\n\n## 第一章\n\n正文。\n",
        encoding="utf-8",
    )


class PublishScriptsTest(unittest.TestCase):
    def test_update_minutes_uses_mode_ids_instead_of_json_key_order(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            book_dir = Path(temp_dir) / "example"
            write_valid_book(book_dir)

            update_book(book_dir, check=False)

            metadata = json.loads((book_dir / "metadata.json").read_text(encoding="utf-8"))
            minutes_by_id = {
                mode["id"]: mode["readingMinutes"] for mode in metadata["readingModes"]
            }
            self.assertEqual(metadata["readingMinutes"], minutes_by_id["complete"])
            self.assertEqual(set(minutes_by_id), {"overview", "journey", "complete"})

    def test_book_directory_iteration_skips_drafts(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            content_dir = Path(temp_dir)
            (content_dir / "published").mkdir()
            (content_dir / "_draft").mkdir()
            (content_dir / ".notes").mkdir()

            self.assertEqual([path.name for path in iter_book_dirs(content_dir)], ["published"])

    def test_metadata_requires_string_fields_and_iso_date(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            book_dir = Path(temp_dir) / "example"
            write_valid_book(book_dir)
            metadata = valid_metadata("example")
            metadata["era"] = 2026
            (book_dir / "metadata.json").write_text(json.dumps(metadata), encoding="utf-8")

            with self.assertRaisesRegex(ValueError, "metadata era"):
                validate_metadata(book_dir)

    def test_fenced_code_headings_do_not_count_as_chapters(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            book_dir = Path(temp_dir) / "example"
            write_valid_book(book_dir)
            (book_dir / "20-full.md").write_text(
                "# 完整\n\n## 第一章\n\n正文。\n\n```markdown\n## 不是章节\n```\n",
                encoding="utf-8",
            )

            self.assertEqual(validate_full(book_dir, 1), ["第一章"])

    def test_route_template_has_no_redundant_level_two_heading(self) -> None:
        route = format_route(
            "示例书",
            [
                {
                    "id": "start",
                    "title": "开端",
                    "startChapter": 1,
                    "endChapter": 1,
                    "summary": "正文。",
                }
            ],
        )

        self.assertNotIn("\n## 故事路线\n", route)
        self.assertIn("### 01 开端", route)

    def test_manifest_requires_count_indexes_and_titles(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            manifest = Path(temp_dir) / "manifest.json"
            manifest.write_text(
                json.dumps(
                    {
                        "chapter_count": 1,
                        "chapters": [{"index": 2, "title": "第一章"}],
                    },
                    ensure_ascii=False,
                ),
                encoding="utf-8",
            )

            with self.assertRaisesRegex(ValueError, "index mismatch"):
                validate_manifest(manifest, ["第一章"])

    def test_required_manifest_blocks_unverified_publication(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            book_dir = Path(temp_dir) / "example"
            write_valid_book(book_dir)

            with self.assertRaisesRegex(ValueError, "source manifest is required"):
                validate_book(book_dir, None, require_manifest=True)


if __name__ == "__main__":
    unittest.main()
