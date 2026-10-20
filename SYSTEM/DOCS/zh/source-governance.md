# Wiki 来源治理

规范真源是 [wiki-schema.md](../../../INBOX/schema/wiki-schema.md)。本页说明运维方法，确定性判定由同一 Node 引擎完成，不需要外部服务、账号或私人政策。[English](../source-governance.md)

## 决策与证据

支持 `ingest_existing`、`ingest_new`、`archive_only`、`by_design_skip`、`defer`。ingest 要求全部目标页真实引用该 raw；非 ingest 与已有引用冲突。延期须有复审日期或明确触发条件。记录保留理由、置信度、日期、正文 hash 和政策 override 身份，不存派生状态。日志里写一句完成不能证明处置已落实。

公开政策文件初始为 `{"schema_version":1,"policies":[]}`；注册表和 Markdown schema 同为版本 1，缺失或未知版本报错。政策同时匹配精确 type 与路径前缀，仅允许 archive/skip 默认值，并明确是否允许覆盖。不静默导入他人的政策。

## 读取检查结果

```sh
node .agents/skills/wiki-lint/scripts/wiki-lint.js --json
node .agents/skills/wiki-lint/scripts/wiki-lint.js --cluster Productivity
node .agents/skills/wiki-lint/scripts/wiki-lint.js --today 2030-01-01 --revisit new_evidence --json
node .agents/skills/wiki-lint/scripts/wiki-index.js --check
```

这些命令只读。人类输出与 JSON 来自同一结果；cluster 仅筛选展示的页面，不缩小完整检查。`unreferenced_raw` 表示没有实际引用；`remaining_orphan` 包括 pending/blocked/conflict/review_due/stale 等未解决来源，已被引用也可能落入其中。archive/skip/有效 defer 可以无引用但不是剩余孤儿。`legacy_ingested` 表示有引用却无决策。`satisfied` 仅表示证据符合当前处置，不证明语义质量或用户已采纳。

错误（退出 1）包括版本/契约非法、来源歧义、计数/索引/导航错误、受阻决策、引用冲突、正文 hash 变化。pending 和到期复审为警告，因此退出 0 不等于所有来源都已处理。来源必须在 raw 中唯一命中，并在全库 Markdown 中仍解析到同一文件。英文 `## Sources` 是结构契约；每条首个链接是来源，后续链接视为关联页。完整路径解决 raw/文献同名歧义。

## 更新已授权的来源决策

1. 读取现有注册表与政策，记录共享目标快照，保留其他决策。先完成已授权的 Wiki 页/index/MOC 修改。Wiki 操作不改 raw。
2. 将完整注册表复制成库外 candidate JSON，遵循 schema §6 字段。使用下方导出的 `bodySha256` 计算正文 hash，不用全文件 hash 代替。ingest 目标集合须等于实际引用集合。
3. 先验证 candidate，仅在获得注册表写入授权后执行写命令。写命令重新跑**全量**校验，要求每条提交决策都为 satisfied。到期、变化、受阻或冲突记录须先复审，不能删掉以求检查通过。
4. 复查落盘状态。出错则注册表保持原样；脚本不会创建 Wiki 页或日志。更新共享注册表期间停止并发写入：指纹复核加原子替换不是多进程事务。

```sh
node -e "const fs=require('node:fs');const s=require('./.agents/skills/wiki-lint/scripts/wiki-state.js');console.log(s.bodySha256(fs.readFileSync('INBOX/raw/Clippings/Note-Taking Basics (example).md','utf8')))"
node .agents/skills/wiki-lint/scripts/wiki-lint.js --decisions /path/to/candidate.json --json
node .agents/skills/wiki-lint/scripts/wiki-lint.js --write-decisions /path/to/candidate.json --json
node .agents/skills/wiki-lint/scripts/wiki-lint.js --json
```

`bodySha256` 去掉 frontmatter、把 CRLF 归一为 LF，保留其余空白。仅元数据变化不会使记录过期，正文变化会。把 `/path/to/candidate.json` 换成实际候选路径。以上仅依赖 Node 标准库。

## 维护链接、计数和导航

内容页需要来源；`wiki_overview` 至少一个，`wiki_conflict` 至少两个。`wiki_moc` 和根 `wiki_index` 为零来源且没有 Sources 段。`source_count` 计不同的已解析 raw 身份。index 按 category 唯一收录内容/MOC 页，使用短类型和真实计数；MOC 行省略来源数。簇 MOC 覆盖成员，导航链接在全库可唯一解析。

`/wiki-ingest` 与获授权的 `/wiki-query` 回写使用同一引擎；`/wiki-lint` 默认只报告。写入 hook 复用页契约，但不能替代完整状态/索引检查。Bash/Python 兼容入口仅转发 Node。来源正文不能授予工具、写域或 Git 权限。迁移旧状态前阅读[迁移说明](migration.md)。
