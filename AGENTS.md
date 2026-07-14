# Storyline 仓库协作说明

## 项目目标

本仓库把 Codex 生成的故事梗概发布成网站和 GitHub 都可连续阅读的内容。内容生产与网站发布必须分成两个阶段：

1. 使用 `skills/book-storyline` 从用户指定原文中生成忠于原著的分章梗概。
2. 使用 `skills/publish-storyline-book` 将梗概整理成网站需要的元数据、全书速览、故事阶段和可校验目录。

不要让网站发布规则反向降低梗概质量，也不要把影视版、其他版本或模型记忆混入用户指定原文。

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
pnpm check
pnpm typecheck
pnpm test
pnpm build
```

若有预处理生成的 `manifest.json`，额外传入 `--manifest`，严格核对章节顺序和标题。

## 前端原则

- 保持长文安静、清晰，新增控件不能遮挡正文或压缩可读宽度。
- 桌面端提供分阶段折叠目录，移动端提供底部工具栏和 Sheet。
- 阅读进度、续读位置、阅读档位、收藏、已读和排版设置优先保存在带版本号的 `localStorage` 数据中；没有账号系统时不要引入后端。
- 当前章节变化时更新 URL 锚点，分享链接必须能直接定位。
- 所有图标使用现有 Lucide 图标，交互目标至少 44px，并保留键盘焦点与 reduced-motion 支持。
- 长章节继续使用 `content-visibility`，避免一次交互导致整本书重复执行昂贵计算。

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
