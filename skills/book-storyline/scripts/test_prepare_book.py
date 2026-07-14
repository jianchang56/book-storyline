from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from prepare_book import safe_output_dir


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


if __name__ == "__main__":
    unittest.main()
