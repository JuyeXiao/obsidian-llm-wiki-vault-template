# 按需求选择入口

从当前问题出发。Homepage 和工具栏统一提供 **Permanent / Literature / Projects / Areas / Sources** 五类导航；Wiki 知识入口是 `INBOX/wiki/index.md`。[English](../by-need.md)

## 我要处理文章

输入：忠实捕获到 `INBOX/raw/Clippings/` 的 Markdown 原文，从 Sources MOC 找到它。`/clip-digest` 创建或安全更新文献笔记，raw 只读。先确认捕获质量；只有网址不能代替可读证据。缺路由标签时，`/tag` 是独立授权的元数据步骤。

```text
/clip-digest 读取 INBOX/raw/Clippings/Note-Taking Basics (example).md 并更新对应文献笔记。保留 My Annotations 和既有元数据。不写 raw 或 Wiki，不暂存、提交、推送。
```

## 我要形成或完善自己的观点

输入：文献笔记，以及你正在思考的问题或立场。`/distill` 生成永久笔记，或精准修改指定的已有笔记。来源主张、AI 候选判断、用户已确认立场保持区分，不编造个人证据。日期、标签、篇数仅用于初筛，没有固定月度配额。

```text
/distill 根据 ZETA/LITERATURE/Note-Taking Basics (example).md，形成一篇讨论何时值得保留一个链接的永久笔记。我的立场尚未确认，保留待补观点标记、用途、边界和开放问题。确认标题不冲突后仅保存新永久笔记。不改来源，不执行 Git。
```

```text
/distill 仅完善 ZETA/PERMANENT/Zettelkasten Method.md，沿用其现有文献来源。我想说清临时任务笔记的适用边界，不编造我的经历，也不把这次请求当作我认同整篇观点。保留人工正文、元数据、批注和连接，只追问尚不明确的信息。
```

Permanent MOC 搜索标题、摘要、关键词，按主题和真实正文标记筛选，提供列表、按主题视图与分页。`Personal viewpoint pending` 和 `Open question` 对应明确 callout；**Unmarked 不等于已确认**。读取失败单独显示，不推断用户立场。

## 我要查知识

输入一个问题。`/wiki-query` 在会话中给出带引用的回答，必要时追溯 raw，默认不写文件或日志。

```text
/wiki-query Wiki 对有用途的链接支持哪些判断，哪些尚未经验证？仅在会话中带引用回答，不改文件或 Git。
```

已有捕获与路由标签的来源可由 `/wiki-ingest` 直接进入 Wiki。文献消化是并行的阅读工作流，不是 Wiki 的必经中间层。

```text
/wiki-ingest 仅处理 INBOX/raw/Clippings/Note-Taking Basics (example).md。有依据时复用现有页，维护受影响的 index、导航、ingest log 和来源决策记录。选择明确处置并通过完整 lint 验证。raw 和人工笔记只读，不操作 Git。
```

## 我要关联项目或领域

输入一个项目/领域页和确实有用途的永久笔记或 Wiki 目标。使用页面关联选择器，或明确授权写入那条连接。来源工作流不会顺带改项目。原创项目示例 `PARA/PROJECTS/Portfolio Website/1. Portfolio Website.md` 同时演示两种关系，明确属于假设设计，不声称你的实践效果。

```text
在 PARA/PROJECTS/Portfolio Website/1. Portfolio Website.md 增加到 ZETA/PERMANENT/Zettelkasten Method.md 的显式关联，说明这只是待评估的候选原则。保留其他字段和链接，不改来源或 Git。
```

## 我要检查和备份

`/wiki-lint`、`/tag-lint`、`/doc-lint` 和裸调用 `/vault-git` 都只读。Git 盘点仅依据本地 tracking ref，不等于实时远端状态。提交与推送分别需要明确范围；推送前审阅整段待上传历史。

```text
/vault-git 只盘点工作区、暂存区、未跟踪文件和本地记录的未推送提交，按用途与依赖建议分组。不暂存、提交、fetch 或推送。
```

```sh
python SYSTEM/SCRIPTS/sync_agent_skills.py
node .agents/skills/wiki-lint/scripts/wiki-lint.js --json
python .agents/skills/doc-lint/scripts/doc-lint.py
python .agents/skills/vault-git/scripts/inspect_git.py
```

## 跟着原创示例走一遍

作者原创链路为 raw `Note-Taking Basics (example)` → 同名文献 → 永久笔记 `Zettelkasten Method`。raw 也直接支持 Wiki `Note-Taking`，由 `Productivity Hub` 和 index 导航。Portfolio Website 项目显式关联永久笔记和 Wiki。示例没有真实用户经历或已确认立场。

raw/文献故意同名以演示消歧：`[[Note-Taking Basics (example)]]` 不安全，应使用实际来源段中的完整路径。`source-decisions.json` 仅含原创示例的一条 `ingest_existing` 记录，状态由真实引用和正文 hash 推导。删除示例时同时处理其链接、index/MOC 条目和决策，再运行完整 lint；不能仅因用户笔记沿用了示例文件名就删除它。

继续阅读[来源治理](source-governance.md)、[迁移](migration.md)和 [Agent 安装与限制](agent-workflows.md)。
