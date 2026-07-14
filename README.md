# book-storyline

`book-storyline` 是一个用于按章节提取书籍故事梗概的 Agent Skill。它会先梳理原文事件链，再删除不推动情节的风景、修辞、名单和重复描写，输出忠于原文、前后连贯的章节梗概。

## 主要能力

- 保留完整章号和章节标题。
- 按原文顺序整理事件的起因、转折和结果。
- 区分重要人物与仅短暂出场的无关人物。
- 支持简要、标准、详细三档精简程度。
- 支持长篇书籍分批处理和断点续作。
- 检查人物身份、关系、物品、能力和伏笔的跨章节一致性。
- 对没有连续故事线的书籍改为提取章节内容梗概，不强行制造剧情。

## 支持的书籍与格式

适用于小说、古典文学、传记、回忆录、纪实文学、历史叙事及部分非叙事书籍。

| 格式 | 处理方式 |
| --- | --- |
| TXT、Markdown | 直接读取，检测常见中文编码并识别章节 |
| 分章目录 | 自然排序文件并生成统一章节清单 |
| EPUB | 按 OPF spine 顺序提取 XHTML 正文 |
| DOCX | 先通过文档处理能力提取正文和标题层级 |
| PDF | 先提取文字，复杂排版结合页面渲染核对 |
| 扫描件、图片 | 先进行 OCR，并标记无法确认的内容 |

## 安装

从 GitHub 仓库安装：

```powershell
npx skills add jianchang56/storyline --skill book-storyline
```

在仓库本地安装：

```powershell
npx skills add . --skill book-storyline
```

查看是否能够被安装器发现：

```powershell
npx skills add . --list
```

## 使用

安装后，在支持 Agent Skills 的工具中调用：

```text
使用 $book-storyline 提取这本书前十章的故事梗概，采用标准精简程度，输出为 Markdown。
```

其他示例：

```text
使用 $book-storyline 提取这个分章目录中的全部情节，只删除风景、诗词和重复打斗描写。
```

```text
使用 $book-storyline 将这本传记按章节整理为简要内容梗概。
```

## 精简程度

- `简要`：保留核心目标、主要阻碍、最大转折和结果。
- `标准`：保留完整主因果链、重要决定和所有改变局势的事件，默认使用此档。
- `详细`：保留几乎所有具有后续影响的场景和信息，只删除明确的非叙事内容与重复表达。

## 预处理脚本

Skill 自带一个仅依赖 Python 标准库的预处理脚本，可处理 TXT、Markdown、分章目录和 EPUB：

```powershell
python skills/book-storyline/scripts/prepare_book.py <输入文件或目录> <工作目录> --compression standard
```

脚本会生成：

```text
工作目录/
├── chapters/       # 标准化后的有序章节
├── manifest.json   # 章节标题、来源、顺序、编码和校验信息
└── state.json      # 长篇处理进度与跨章节一致性状态
```

该脚本只负责预处理，不会自动生成故事梗概。梗概仍由 Agent 按照 Skill 中的事件账本、筛选和回查流程完成。

## 项目结构

```text
skills/book-storyline/
├── SKILL.md
├── references/
│   ├── genre-rules.md
│   └── quality-and-state.md
└── scripts/
    └── prepare_book.py
```

## License

本项目采用 [MIT License](LICENSE)。

## 书脉网站

仓库根目录同时包含一个基于 Next.js 的阅读网站，用于展示经过 `book-storyline` skill 整理的故事梗概。内容可以按章节文件保存，但书籍页面会将全部章节合并为连续长文，并保留目录锚点、阅读进度和断点续读。

线上阅读：<https://read.zeet.me>

### 本地开发

```powershell
pnpm install
pnpm dev
```

打开 <http://localhost:3000>。

### 校验

```powershell
python skills/publish-storyline-book/scripts/generate_catalog.py content
python skills/publish-storyline-book/scripts/validate_library.py content
pnpm check
pnpm typecheck
pnpm test
pnpm build
```

### 网站内容结构

```text
content/<slug>/
├── README.md
├── 00-overview.md
├── 10-route.md
├── 20-full.md
├── metadata.json
├── assets/        # 可选
└── source/        # 可选
```

`README.md` 方便在 GitHub 直接进入三种阅读档；`00/10/20` 前缀只用于稳定文件顺序，实际预计阅读时间保存在 `metadata.json`。当前网站内置《西游记》一百回完整故事梗概，内容集中在三份 Markdown 中，读者端仍保留阶段目录、回目锚点和单页连续阅读体验。

全站书籍列表保存在自动生成的 `content/catalog.json` 中。新增或更新书籍后重新生成目录并运行全书库校验，不要在前端代码中手工登记书籍。
