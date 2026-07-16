# Storyline 仓库协作说明

## 项目目标

本仓库把 Codex 生成的故事梗概发布成网站和 GitHub 都可连续阅读的内容。内容生产与网站发布必须分成两个阶段：

1. 使用 `skills/book-storyline` 从用户指定原文中生成忠于原著的分章梗概。
2. 使用 `skills/publish-storyline-book` 将梗概整理成网站需要的元数据、全书速览、故事阶段和可校验目录。

不要让网站发布规则反向降低梗概质量，也不要把影视版、其他版本或模型记忆混入用户指定原文。

## 文档职责

- 根目录 `README.md` 面向读者和 Skill 使用者，只保留项目简介、线上入口、安装、基本用法、最短本地启动和反馈方式。
- 内容生产细节写入 `skills/book-storyline/SKILL.md` 及其 references，不在 README 重复维护。
- 网站内容结构、发布校验、前端原则和 Git 协作规则统一写在本文件。
- 面向 AI 的新流程应优先补充到 `AGENTS.md` 或对应 Skill，除非普通用户确实需要，否则不要加入 README。

公开发布前可用以下命令确认 Skill 能被安装器发现：

```powershell
npx skills add . --list
```

## 内容结构

每本已发布书籍必须包含：

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

- 分章文件可以继续作为内容生产、校验和失败重试的中间单位，但不放入最终发布目录。
- `README.md` 是 GitHub 入口页，链接三种阅读档。
- `00-overview.md` 是全书速览；`10-route.md` 是故事阶段路线；`20-full.md` 用 H2 连续包含全部回目。
- `00/10/20` 只表达 GitHub 展示顺序。实际阅读时间写入 `metadata.json`，不同书籍可以不同。
- 网站从三份 Markdown 解析内容，读者端仍在一个页面连续展示，不按回目分页。
- 完整档按回目顺序生成 `chapter-1` 等稳定锚点；路线档按注释中的 `arc-id` 生成稳定阶段锚点。
- 故事阶段必须连续覆盖全部章节，不得重叠、跳章或提前泄露后续阶段信息。

新增或更新书籍后运行：

```powershell
python skills/publish-storyline-book/scripts/validate_book.py content/<slug>
python skills/publish-storyline-book/scripts/generate_catalog.py content
python skills/publish-storyline-book/scripts/validate_library.py content
pnpm check
pnpm typecheck
pnpm test
pnpm build
```

若有预处理生成的 `manifest.json`，额外传入 `--manifest`，严格核对章节顺序和标题。

`content/catalog.json` 必须由所有书籍的 `metadata.json` 自动生成，不要手工维护。批量发布时先逐书校验，再生成目录，最后运行全书库校验。

## 前端原则

- 保持长文安静、清晰，新增控件不能遮挡正文或压缩可读宽度。
- 桌面端提供分阶段折叠目录，移动端提供底部工具栏和 Sheet。
- 阅读进度、续读位置、阅读档位、收藏、已读和排版设置优先保存在带版本号的 `localStorage` 数据中；没有账号系统时不要引入后端。
- 当前章节变化时更新 URL 锚点，分享链接必须能直接定位。
- 所有图标使用现有 Lucide 图标，交互目标至少 44px，并保留键盘焦点与 reduced-motion 支持。
- 长章节继续使用 `content-visibility`，避免一次交互导致整本书重复执行昂贵计算。

## Next.js 与 AI 开发工具

- 项目跟随 `16.3` 官方 preview，并通过根目录 `.mcp.json` 接入 `next-devtools-mcp`。
- 调试页面、路由、构建或缓存问题时，优先启动 `pnpm dev`，使用 Next.js MCP 提供的版本对应文档、编译问题、运行时错误和 Request Insights。
- `requestInsights`、RSC HMR cancellation、Turbopack Rust React Compiler 与 TypeScript 7 CLI 已启用；升级后必须同时运行类型检查、测试、生产构建和离线浏览器回归。
- 不要仅为追新启用 `cacheComponents` 或 Partial Prefetching；它们会改变 RSC 与预取缓存语义，启用前必须重新设计并验证 Service Worker 策略。
- 阅读专题根据 `catalog.json` 中的题材、章节数和阅读时长等元数据规则自动计算；专题定义不得保存书籍 slug 清单，新增书籍应在重新生成目录后自动进入符合条件的专题。

## 修改与提交

- 使用 `apply_patch` 修改文件。
- 保留用户已有的未跟踪文件，不要默认暂存、删除或覆盖。
- 按内容基础设施、内容数据、阅读体验等逻辑阶段分步提交。
- 提交前确认 `git status --short` 中没有混入无关文件。

## Git 与 GitHub 账号路由

执行任何需要 GitHub 身份认证的操作前，先运行 `git rev-parse --show-toplevel`。路径判断不区分大小写，并兼容 `D:\...` 与 `D:/...`。

- 仓库根目录位于 `D:\jianchang56` 或其子目录时，运行 `gh auth switch --hostname github.com --user jianchang56`，并用 `gh api user --jq .login` 验证为 `jianchang56`。预期提交身份为 `舰伥 <jianchang_56@qq.com>`。
- 其他目录使用 GitHub 账号 `justjavac`，验证登录名为 `justjavac`。预期提交身份为 `迷渡 <justjavac@gmail.com>`。

该规则适用于远程 Git 操作以及所有 `gh` 操作。不要输出认证 Token，不要擅自改写身份配置；账号切换或验证失败时停止远程操作。

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.
<!-- END:nextjs-agent-rules -->
