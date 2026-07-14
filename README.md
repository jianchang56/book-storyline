# 书脉 / book-storyline

书脉把一本书的主要人物、关键转折和完整因果链整理成可连续阅读的故事梗概。你可以按自己的时间选择全书速览、故事路线或完整梗概。

## 在线阅读

[打开书脉：read.zeet.me](https://read.zeet.me)

- 全书速览：快速掌握核心故事。
- 故事路线：按阶段理解人物选择和剧情转折。
- 完整梗概：沿原著章节顺序连续读完整本书。

内容同时保存在 [`content/`](content/) 中，也可以直接在 GitHub 阅读。

## 使用 Agent Skill

安装 `book-storyline`：

```powershell
npx skills add jianchang56/book-storyline --skill book-storyline
```

在支持 Agent Skills 的工具中使用：

```text
使用 $book-storyline 按章节提取这本书的故事梗概，采用标准精简程度。
```

支持小说、古典文学、传记、纪实文学等内容，以及 TXT、Markdown、EPUB、DOCX、PDF、OCR 文本和分章目录。

## 本地运行

```powershell
pnpm install
pnpm dev
```

完整的内容生产、校验和发布规则见 [`AGENTS.md`](AGENTS.md)。

## 反馈

发现内容问题时，请[提交 GitHub Issue](https://github.com/jianchang56/book-storyline/issues/new)。

## License

[MIT](LICENSE)
