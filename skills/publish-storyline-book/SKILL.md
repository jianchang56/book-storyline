---
name: publish-storyline-book
description: 将 Codex 或其他 Agent 生成的分章故事梗概发布为 Storyline 网站书籍，包括 metadata、全书速览、连续故事阶段、折叠目录数据和严格内容校验。Use when 用户要求把章节梗概加入 Storyline/Next.js 阅读网站、生成 5/20/60 分钟阅读档、制作故事阶段或分卷目录、批量发布 Codex 生成的书籍内容，或检查 content/books/书籍标识 目录是否完整一致。
---

# 发布 Storyline 书籍

把已经完成的分章梗概转换成稳定的网站内容包。保持内容生产与展示结构分离：原文梗概由 `book-storyline` 负责，本 skill 只组织、校验和发布。

## 工作流

1. 读取仓库 `AGENTS.md`、目标书籍目录和网站现有数据模型。
2. 若输入仍是原著正文，先使用 `book-storyline` 完成分章梗概；不要在本流程中凭记忆补写原著。
3. 按 `references/content-schema.md` 生成或更新：
   - `metadata.json`
   - `overview.md`
   - `story-arcs.json`
   - `chapters/*.md`
4. 让故事阶段连续覆盖全部章节。阶段边界应来自目标、地点、队伍状态或长期冲突的变化，不按固定十章机械切分。
5. 将三档阅读映射为：全书速览、故事阶段、全部章节。读者端连续展示，章节文件只作为内容和导航单位。
6. 运行确定性校验：

   ```powershell
   python skills/publish-storyline-book/scripts/validate_book.py content/books/<slug>
   ```

   有预处理清单时追加：

   ```powershell
   --manifest <工作目录>/manifest.json
   ```

7. 修改网站代码时，再运行仓库规定的格式、类型、测试和构建命令。

## 故事阶段规则

- 通常创建 6–12 个阶段；以读者能否快速理解全书路线为准。
- 每个阶段包含稳定 `id`、标题、起止章节和一段独立可读的摘要。
- 摘要保留阶段目标、主要阻碍、关键转折和结束状态，不复述每回细节。
- 相邻阶段不得重叠或缺章；最后阶段必须覆盖最终章。
- 阶段标题使用读者熟悉的剧情名称，不使用抽象技术名称或纯数字分组。

## 发布约束

- 不把章节拆成网页分页。
- 不在内容 JSON 中保存颜色、图标或布局类名等展示细节。
- 不因目录需要而擅自改写原回目。
- 不把未校验的章节数、阅读时长或阶段数写入营销文案。
- 不自动提交用户未授权的原文、临时工作目录或本地笔记。
