# Storyline 书籍内容模式

## metadata.json

必须包含：`slug`、`title`、`author`、`era`、`subtitle`、`description`、`genres`、`readingMinutes`、`chapterCount`、`coverTone`、`publishedAt`。

- `chapterCount` 必须与 `chapters/*.md` 数量一致。
- `readingMinutes` 表示完整档预计阅读时间。
- `slug` 必须与目录名一致。

## overview.md

第一行使用一级标题，其余内容为约 5 分钟可读完的全书主线。至少保留开端、核心旅程和结局，不按章节逐条罗列。

## chapters

- 文件名使用从 `0001.md` 开始的四位连续数字。
- 第一行必须是原章节完整标题，例如 `# 第一回　完整回目`。
- 标题后至少有一个非空段落。
- 网站按文件名顺序加载并生成 `chapter-1` 等锚点。

## story-arcs.json

根节点为数组，每项格式：

```json
{
  "id": "wukong-origin",
  "title": "石猴出世与大闹天宫",
  "startChapter": 1,
  "endChapter": 7,
  "summary": "阶段目标、主要阻碍、关键转折和结束状态。"
}
```

约束：

- `id` 使用小写字母、数字和连字符，书内唯一。
- 第一项从第 1 章开始，后一项从前一项结束章节加 1 开始。
- 最后一项结束章节等于 `metadata.chapterCount`。
- `title` 和 `summary` 不得为空。
- 只保存语义数据；颜色、图标、展开状态由前端决定。

## 阅读档映射

| 档位 | 数据来源 | 目标 |
| --- | --- | --- |
| 5 分钟 | `overview.md` | 快速理解全书结局与主线 |
| 20 分钟 | `story-arcs.json` | 理解阶段目标、转折和承接 |
| 完整档 | `chapters/*.md` | 按原回目连续阅读完整梗概 |
