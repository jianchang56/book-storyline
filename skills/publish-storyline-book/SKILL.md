---
name: publish-storyline-book
description: 将 Codex 或其他 Agent 生成的分章故事梗概发布为 Storyline 网站和 GitHub 都可连续阅读的书籍内容，包括 metadata、README、全书速览、故事路线、完整连续梗概和严格内容校验。Use when 用户要求把章节梗概加入 Storyline/Next.js 阅读网站、生成多种阅读深度、制作故事阶段或折叠目录、将多章节 Markdown 合并为单文件、批量发布 Codex 生成的书籍内容，或检查 content/书籍标识 目录是否完整一致。
---

# 发布 Storyline 书籍

把已经完成的分章梗概转换成稳定的网站内容包。保持内容生产与展示结构分离：原文梗概由 `book-storyline` 负责，本 skill 只组织、校验和发布。

## 工作流

1. 读取仓库 `AGENTS.md`、目标书籍目录和网站现有数据模型。
2. 若输入仍是原著正文，先使用 `book-storyline` 完成分章梗概；不要在本流程中凭记忆补写原著。
3. 按 `references/content-schema.md` 生成或更新：
   - `README.md`
   - `00-overview.md`
   - `10-route.md`
   - `20-full.md`
   - `metadata.json`
4. 保留章节作为内容生产、失败重试和 manifest 校验单位，但把发布成品合并到 `20-full.md`。每回使用 H2，确保网站仍能生成稳定的 `chapter-N` 锚点。
5. 让故事阶段连续覆盖全部章节。阶段边界来自目标、地点、队伍状态或长期冲突的变化，不按固定章数机械切分。
6. 按每分钟 400 个有效文字、向上取整且最低 1 分钟估算三档阅读时间。运行 `scripts/update_reading_minutes.py content/<slug 的上级目录>` 同步 `metadata.json` 和 Markdown 中展示的分钟数。保持 `00/10/20` 顺序前缀稳定，不把分钟数写进文件名。
7. 运行单本确定性校验：

   ```powershell
   python skills/publish-storyline-book/scripts/validate_book.py content/<slug>
   ```

   有预处理清单时追加：

   ```powershell
   --manifest <工作目录>/manifest.json
   ```

   由 `prepare_book.py` 处理的新书必须追加 `--require-manifest`；没有原文清单时不得把精简阶段自报成原书章节。

8. 更新自动目录并校验全书库：

   ```powershell
   python skills/publish-storyline-book/scripts/generate_catalog.py content
   python skills/publish-storyline-book/scripts/validate_library.py content
   ```

   批量发布或正文有改动时，生成目录前先同步并检查阅读时间：

   ```powershell
   python skills/publish-storyline-book/scripts/update_reading_minutes.py content
   python skills/publish-storyline-book/scripts/update_reading_minutes.py content --check
   ```

9. 修改网站代码时，再运行仓库规定的格式、类型、测试和构建命令。

## 迁移旧内容

旧书籍仍使用 `overview.md`、`story-arcs.json` 和 `chapters/*.md` 时，先运行：

```powershell
python skills/publish-storyline-book/scripts/migrate_legacy_book.py content/books/<slug> content/<slug>
```

速览或路线不是默认 5/20 分钟时，追加 `--overview-minutes` 和 `--route-minutes`。

校验新目录并确认网站读取正常后，再删除旧目录。不要在迁移前手工重写已经校验过的章节正文。

## 故事阶段规则

- 长篇通常创建 6–12 个阶段，且阶段数不得超过章节数；短篇、戏剧或章节较少的作品按实际结构减少，以读者能否快速理解全书路线为准。
- 在阶段 H3 注释中保存稳定 `arc-id`、起止章节；正文保存一段独立可读的摘要。
- 摘要保留阶段目标、主要阻碍、关键转折和结束状态，不复述每回细节。
- 相邻阶段不得重叠或缺章；最后阶段必须覆盖最终章。
- 阶段标题使用读者熟悉的剧情名称，不使用抽象技术名称或纯数字分组。

## 发布约束

- 不把章节拆成网页分页。
- 不在内容文件中保存颜色、图标或布局类名等展示细节。
- 不因目录需要而擅自改写原回目。
- 不把未校验的章节数、阅读时长或阶段数写入营销文案。
- 不自动提交用户未授权的原文、临时工作目录或本地笔记。
- 不手工编辑 `content/catalog.json`；始终从各书 `metadata.json` 重新生成。
