from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from prepare_book import safe_output_dir, split_chapters


class SafeOutputDirTest(unittest.TestCase):
    def test_rejects_output_parent_of_input_before_force_removal(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            output = Path(temp_dir) / "book"
            output.mkdir()
            input_path = output / "source.txt"
            input_path.write_text("source", encoding="utf-8")

            with self.assertRaisesRegex(ValueError, "包含输入路径"):
                safe_output_dir(input_path, output, force=True)

            self.assertEqual(input_path.read_text(encoding="utf-8"), "source")


class SplitChaptersTest(unittest.TestCase):
    def test_recognizes_part_book_and_act_headings(self) -> None:
        chapters, used_fallback = split_chapters(
            "Part I\nFirst\n\nBook II: Return\nSecond\n\n第三幕\nThird",
            "fallback",
            allow_single_chapter=False,
        )

        self.assertFalse(used_fallback)
        self.assertEqual([title for title, _ in chapters], ["Part I", "Book II: Return", "第三幕"])

    def test_requires_explicit_single_chapter_confirmation(self) -> None:
        with self.assertRaisesRegex(ValueError, "allow-single-chapter"):
            split_chapters("没有章节标题的正文", "单章", allow_single_chapter=False)

        chapters, used_fallback = split_chapters(
            "没有章节标题的正文",
            "单章",
            allow_single_chapter=True,
        )
        self.assertTrue(used_fallback)
        self.assertEqual(chapters[0][0], "单章")


if __name__ == "__main__":
    unittest.main()
