# Storyline 书籍内容模式

发布目录统一使用 `content/<slug>/`。章节可以继续作为生产和校验的中间单位，但网站和 GitHub 使用三份带顺序前缀的连续 Markdown 成品。

```text
content/<slug>/
├── README.md
├── 00-overview.md
├── 10-route.md
├── 20-full.md
└── metadata.json
```

可以按需增加 `assets/` 和 `source/`，不要把临时生成文件放进发布目录。

## metadata.json

必须包含：`slug`、`title`、`author`、`era`、`subtitle`、`description`、`genres`、`readingMinutes`、`chapterCount`、`coverTone`、`publishedAt`、`readingModes`。

- `chapterCount` 必须与 `20-full.md` 中的二级回目标题数量一致。
- `readingMinutes` 表示完整档预计阅读时间。
- `slug` 必须与目录名一致。
- `readingModes` 按 `overview`、`journey`、`complete` 顺序列出文件、标题和实际预计阅读分钟数。
- 分钟数可以因书籍而异，不能编码进文件名。

## README.md

作为 GitHub 入口页，简要介绍作品，并链接三种阅读档。必须存在且包含正文。

## 00-overview.md

第一行使用一级标题，其余内容为短时间可读完的全书主线。至少保留开端、核心旅程和结局，不按章节逐条罗列。

## 10-route.md

第一行使用一级标题。每个故事阶段使用带机器可读注释的三级标题：

```markdown
### 01 石猴出世与大闹天宫 <!-- arc-id=wukong-origin start=1 end=7 -->

阶段目标、主要阻碍、关键转折和结束状态。
```

约束：

- `arc-id` 使用小写字母、数字和连字符，书内唯一。
- 第一项从第 1 章开始，后一项紧接前一项，最后一项结束于 `metadata.chapterCount`。
- 标题和摘要不得为空。
- 只保存语义数据；颜色、图标、展开状态由前端决定。

## 20-full.md

- 第一行使用一级标题；每一回使用二级标题，例如 `## 第一回　完整回目`。
- 回目标题后至少有一个非空段落。
- 按原文顺序包含全部回目，网站按顺序生成 `chapter-1` 等稳定锚点。

## 阅读档映射

| 档位 | 数据来源 | 目标 |
| --- | --- | --- |
| 全书速览 | `00-overview.md` | 快速理解全书结局与主线 |
| 故事路线 | `10-route.md` | 理解阶段目标、转折和承接 |
| 完整档 | `20-full.md` | 按原回目连续阅读完整梗概 |
