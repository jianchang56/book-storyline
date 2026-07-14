#!/usr/bin/env python3
"""把 TXT、Markdown、分章目录或 EPUB 预处理为有序章节和状态文件。"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import sys
import zipfile
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import unquote
from xml.etree import ElementTree as ET


TEXT_SUFFIXES = {".txt", ".md", ".markdown"}
CHAPTER_RE = re.compile(
    r"^(?:#{1,6}\s*)?(?:"
    r"第[零〇一二三四五六七八九十百千万两\d]+(?:章|回|节|卷)(?:\s+.*)?|"
    r"chapter\s+[\divxlcdm]+(?:\s*[:：.\-—]\s*.*)?|"
    r"(?:prologue|epilogue|preface|introduction|序章|楔子|引子|尾声|后记|番外)(?:\s*[:：.\-—]\s*.*)?"
    r")\s*$",
    re.IGNORECASE,
)


def natural_key(value: str) -> list[object]:
    return [int(part) if part.isdigit() else part.casefold() for part in re.split(r"(\d+)", value)]


def read_text(path: Path) -> tuple[str, str]:
    return decode_bytes(path.read_bytes(), str(path))


def decode_bytes(data: bytes, source: str) -> tuple[str, str]:
    for encoding in ("utf-8-sig", "utf-8", "gb18030", "big5"):
        try:
            return data.decode(encoding), encoding
        except UnicodeDecodeError:
            continue
    raise ValueError(f"无法可靠识别文本编码: {source}")


def normalize_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n").replace("\u00a0", " ")
    lines = [line.rstrip() for line in text.split("\n")]
    return "\n".join(lines).strip() + "\n"


def split_chapters(text: str, fallback_title: str) -> list[tuple[str, str]]:
    lines = text.splitlines()
    headings = [(index, line.strip().lstrip("#").strip()) for index, line in enumerate(lines) if CHAPTER_RE.match(line.strip())]
    if not headings:
        return [(fallback_title, normalize_text(text))]

    chapters: list[tuple[str, str]] = []
    for position, (start, title) in enumerate(headings):
        end = headings[position + 1][0] if position + 1 < len(headings) else len(lines)
        body = "\n".join(lines[start + 1 : end]).strip()
        chapters.append((title, normalize_text(body)))
    return chapters


class XHTMLTextExtractor(HTMLParser):
    BLOCK_TAGS = {"p", "div", "section", "article", "br", "li", "h1", "h2", "h3", "h4", "h5", "h6"}

    def __init__(self) -> None:
        super().__init__()
        self.parts: list[str] = []
        self.heading_parts: list[str] = []
        self.heading_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag in self.BLOCK_TAGS:
            self.parts.append("\n")
        if tag in {"h1", "h2", "h3"} and not self.heading_parts:
            self.heading_depth = 1
        elif self.heading_depth:
            self.heading_depth += 1

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in self.BLOCK_TAGS:
            self.parts.append("\n")
        if self.heading_depth:
            self.heading_depth -= 1

    def handle_data(self, data: str) -> None:
        self.parts.append(data)
        if self.heading_depth and data.strip():
            self.heading_parts.append(data.strip())

    def result(self) -> tuple[str, str | None]:
        text = "".join(self.parts)
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n\s*\n+", "\n\n", text)
        heading = " ".join(self.heading_parts).strip() or None
        return normalize_text(text), heading


def xml_local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def extract_epub(path: Path) -> list[tuple[str, str, str]]:
    chapters: list[tuple[str, str, str]] = []
    with zipfile.ZipFile(path) as archive:
        container = ET.fromstring(archive.read("META-INF/container.xml"))
        rootfile = next((element for element in container.iter() if xml_local_name(element.tag) == "rootfile"), None)
        if rootfile is None or not rootfile.attrib.get("full-path"):
            raise ValueError("EPUB 缺少有效的 OPF rootfile")

        opf_path = PurePosixPath(rootfile.attrib["full-path"])
        opf = ET.fromstring(archive.read(str(opf_path)))
        manifest: dict[str, str] = {}
        spine: list[str] = []
        for element in opf.iter():
            name = xml_local_name(element.tag)
            if name == "item" and element.attrib.get("id") and element.attrib.get("href"):
                manifest[element.attrib["id"]] = element.attrib["href"]
            elif name == "itemref" and element.attrib.get("idref"):
                spine.append(element.attrib["idref"])

        for idref in spine:
            href = manifest.get(idref)
            if not href:
                continue
            item_path = opf_path.parent / PurePosixPath(unquote(href.split("#", 1)[0]))
            raw = archive.read(str(item_path))
            html, _ = decode_bytes(raw, str(item_path))
            parser = XHTMLTextExtractor()
            parser.feed(html)
            text, heading = parser.result()
            if text.strip():
                chapters.append((heading or PurePosixPath(href).stem, text, str(item_path)))

    if not chapters:
        raise ValueError("EPUB spine 中没有提取到正文")
    return chapters


def collect_text_sources(path: Path) -> list[tuple[str, str, str, str]]:
    collected: list[tuple[str, str, str, str]] = []
    paths = [path] if path.is_file() else sorted(
        (item for item in path.rglob("*") if item.is_file() and item.suffix.lower() in TEXT_SUFFIXES),
        key=lambda item: natural_key(str(item.relative_to(path))),
    )
    for item in paths:
        if item.suffix.lower() not in TEXT_SUFFIXES:
            raise ValueError(f"不支持的文件类型: {item.suffix}")
        text, encoding = read_text(item)
        for title, body in split_chapters(text, item.stem):
            collected.append((title, body, str(item), encoding))
    if not collected:
        raise ValueError(f"没有找到支持的文本文件: {path}")
    return collected


def safe_output_dir(input_path: Path, output_path: Path, force: bool) -> None:
    input_resolved = input_path.resolve()
    output_resolved = output_path.resolve()
    if (
        output_resolved == input_resolved
        or input_resolved in output_resolved.parents
        or output_resolved in input_resolved.parents
    ):
        raise ValueError("输出目录不能等于输入路径、位于输入目录内部或包含输入路径")
    if output_path.exists():
        if not force:
            raise FileExistsError(f"输出目录已存在，请使用 --force: {output_path}")
        shutil.rmtree(output_path)
    output_path.mkdir(parents=True)


def prepare(input_path: Path, output_path: Path, compression: str, force: bool) -> None:
    input_path = input_path.resolve()
    output_path = output_path.resolve()
    if not input_path.exists():
        raise FileNotFoundError(input_path)
    safe_output_dir(input_path, output_path, force)

    if input_path.is_file() and input_path.suffix.lower() == ".epub":
        raw_chapters = [(title, text, source, "utf-8") for title, text, source in extract_epub(input_path)]
        source_type = "epub"
    else:
        raw_chapters = collect_text_sources(input_path)
        source_type = "directory" if input_path.is_dir() else input_path.suffix.lower().lstrip(".")

    chapters_dir = output_path / "chapters"
    chapters_dir.mkdir()
    manifest_chapters = []
    for index, (title, text, source, encoding) in enumerate(raw_chapters, start=1):
        filename = f"{index:04d}.md"
        content = f"# {title}\n\n{text.strip()}\n"
        (chapters_dir / filename).write_text(content, encoding="utf-8")
        manifest_chapters.append(
            {
                "index": index,
                "title": title,
                "source": source,
                "output_file": f"chapters/{filename}",
                "characters": len(text),
                "sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
                "detected_encoding": encoding,
            }
        )

    generated_at = datetime.now(timezone.utc).isoformat()
    manifest = {
        "schema_version": 1,
        "source": str(input_path),
        "source_type": source_type,
        "generated_at": generated_at,
        "chapter_count": len(manifest_chapters),
        "chapters": manifest_chapters,
    }
    state = {
        "schema_version": 1,
        "source": str(input_path),
        "manifest": "manifest.json",
        "compression": compression,
        "completed_chapters": [],
        "characters": {},
        "important_items": {},
        "unresolved_conflicts": [],
        "terminology_notes": {},
        "source_uncertainties": [],
        "last_updated": generated_at,
    }
    (output_path / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (output_path / "state.json").write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="书籍文件或分章目录")
    parser.add_argument("output", type=Path, help="标准化输出目录")
    parser.add_argument("--compression", choices=("brief", "standard", "detailed"), default="standard")
    parser.add_argument("--force", action="store_true", help="覆盖已存在的输出目录")
    return parser.parse_args()


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    args = parse_args()
    try:
        prepare(args.input, args.output, args.compression, args.force)
    except (OSError, ValueError, zipfile.BadZipFile, ET.ParseError) as error:
        print(f"错误: {error}", file=sys.stderr)
        return 1
    print(f"已生成标准化章节、manifest.json 和 state.json：{args.output.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
