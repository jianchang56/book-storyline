#!/usr/bin/env python3
"""Migrate the legacy multi-file book folder into three reading Markdown files."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from script_utils import configure_utf8_stdio


def write_output(path: Path, content: str) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as handle:
        handle.write(content)


def format_metadata(metadata: dict[str, object]) -> str:
    source = json.dumps(metadata, ensure_ascii=False, indent=2)
    compact_genres = json.dumps(metadata["genres"], ensure_ascii=False)
    return re.sub(r'  "genres": \[\n(?:    .+\n)+  \]', f'  "genres": {compact_genres}', source) + "\n"


def format_route(title: str, arcs: list[dict[str, object]]) -> str:
    route_lines = [f"# 《{title}》：故事路线", ""]
    for index, arc in enumerate(arcs, start=1):
        route_lines.extend([
            f"### {index:02d} {arc['title']} <!-- arc-id={arc['id']} start={arc['startChapter']} end={arc['endChapter']} -->",
            "",
            str(arc["summary"]),
            "",
        ])
    return "\n".join(route_lines).rstrip() + "\n"


def main() -> int:
    configure_utf8_stdio()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("legacy_dir", type=Path)
    parser.add_argument("target_dir", type=Path)
    parser.add_argument("--overview-minutes", type=int, default=5)
    parser.add_argument("--route-minutes", type=int, default=20)
    args = parser.parse_args()
    source = args.legacy_dir.resolve()
    target = args.target_dir.resolve()
    metadata = json.loads((source / "metadata.json").read_text(encoding="utf-8"))
    arcs = json.loads((source / "story-arcs.json").read_text(encoding="utf-8"))
    overview_lines = (source / "overview.md").read_text(encoding="utf-8").strip().splitlines()
    overview_body = "\n".join(overview_lines[1:]).strip()

    target.mkdir(parents=True, exist_ok=True)
    metadata["readingModes"] = [
        {
            "id": "overview",
            "file": "00-overview.md",
            "title": "全书速览",
            "readingMinutes": args.overview_minutes,
        },
        {
            "id": "journey",
            "file": "10-route.md",
            "title": "故事路线",
            "readingMinutes": args.route_minutes,
        },
        {"id": "complete", "file": "20-full.md", "title": "完整梗概", "readingMinutes": metadata["readingMinutes"]},
    ]
    write_output(target / "metadata.json", format_metadata(metadata))
    write_output(
        target / "00-overview.md",
        f"# 《{metadata['title']}》：{args.overview_minutes} 分钟全书速览\n\n{overview_body}\n",
    )

    write_output(target / "10-route.md", format_route(str(metadata["title"]), arcs))

    full_lines = [f"# 《{metadata['title']}》：完整梗概", ""]
    for chapter_index in range(1, metadata["chapterCount"] + 1):
        chapter_lines = (source / "chapters" / f"{chapter_index:04d}.md").read_text(encoding="utf-8").strip().splitlines()
        full_lines.extend([f"## {chapter_lines[0][2:].strip()}", "", "\n".join(chapter_lines[1:]).strip(), ""])
    write_output(target / "20-full.md", "\n".join(full_lines).rstrip() + "\n")

    readme = f"""# 《{metadata['title']}》故事梗概

{metadata['description']}

## 三种阅读方式

- [{args.overview_minutes} 分钟全书速览](00-overview.md)
- [{args.route_minutes} 分钟故事路线](10-route.md)
- [完整梗概（约 {metadata['readingMinutes']} 分钟）](20-full.md)

## 作品信息

- 作者：{metadata['author']}
- 时代：{metadata['era']}
- 章节：{metadata['chapterCount']} 回
- 类型：{'、'.join(metadata['genres'])}
"""
    write_output(target / "README.md", readme)
    print(f"[OK] migrated {source} -> {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
