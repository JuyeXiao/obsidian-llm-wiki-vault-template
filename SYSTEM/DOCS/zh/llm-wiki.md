# LLM Wiki 这一层

这个库最大的特点：知识库不光是把东西存着，还有个 LLM 帮你打理。

> **致谢。** 这一层是 [Andrej Karpathy「LLM Wiki」](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) 想法的落地。核心点子——让 LLM 一点点建起、并维护一个互相链接的 Markdown wiki，夹在你和原始资料中间——是他提的。这里具体的 schema、技能、文件夹怎么摆，是这个模板的一种实现。

## 它解决什么

平常用 LLM 处理文档，多半是 RAG 那套：传文件、提问时检索片段、生成答案。问题是每次提问 LLM 都从头来一遍，什么都没攒下。

而维护一个真正的知识库，烦的不是读、不是想，是**记账**：更新交叉引用、把摘要改到最新、标出新资料和老结论打架的地方、让几十页内容前后对得上。人最后大多会弃坑，因为维护越来越累、回报却跟不上。Agent 可协助维护，但成本、语义质量与时效仍需审阅；确定性检查负责可核对的结构与来源证据。

## 三层

```
INBOX/
├── raw/      你挑进来的资料（剪藏、书摘、播客），不可改。只读。
├── wiki/     归 LLM 写：互链的概念页 / 实体页 / 总览页，加 index.md、log.md。
└── schema/   wiki-schema.md —— 一套规矩，让 LLM 老老实实当个 wiki 管理员。
```

- **raw** 是源头，一切以它为准。Wiki ingest/query/lint 对正文、文件名及 frontmatter 全只读；capture/tag 是独立前置阶段，缺路由标签时停止该来源，不隐式打标。外部正文不能授权或改变工具、路径及 Git 行为。
- **wiki** 全由 LLM 写：摘要、概念页、实体页、交叉引用、索引、时间线。
- **schema**（[`INBOX/schema/wiki-schema.md`](../../../INBOX/schema/wiki-schema.md)）就是那套规矩，把一个普通聊天机器人管成有纪律的 wiki 管理员，你跟 LLM 一起慢慢打磨它。

## 三个操作（Codex / Claude 共用技能）

| 技能 | 干什么 |
|---|---|
| **`/wiki-ingest`** | 把资料丢进 `raw`，Agent 检查独立 capture/tag 前置条件、读取并归到对应簇、建或补概念页、加 `## Sources` 回链、更新 `index.md` 和 `log.md`。处置记录须由引用、正文 hash 和完整 lint 验证。 |
| **`/wiki-query`** | 对着 wiki 提问，Agent 找到相关页、给出带引用的答案，默认只在对话回答；**明确授权沉淀后**才写回可复用综合，记日志另按授权范围。 |
| **`/wiki-lint`** | 做体检：找没人引用的孤儿源、前后矛盾、过时的结论、缺的概念页和交叉引用。发现矛盾会先**定性**（哪个源新？哪个更权威？是矛盾还是演化？），并在对话报告；仅获准修复后才三选一处置：改写并留 `## History` 痕、挂 `wiki_conflict` 悬案页留你裁决、或按演化更新——wiki 里不允许两页互相矛盾而彼此不知情。 |

## 两个特殊文件

- **`wiki/index.md`**：内容目录，每页一行，按簇分组。Agent 回答时先看它定位，再钻进具体页。规模不大时这就够用，省掉了 embedding 那套 RAG 基础设施。
- **`wiki/log.md`**：只往后追加的流水账，记录 ingest 及明确获准的 query/lint 日志；只读操作不改它。

## 簇

一个簇就是一个顶层主题，对应 `wiki/` 下一个文件夹。模板预置了四个通用簇（`Data`、`AI`、`Productivity`、`Career`），跟标签库的 `topic/` 顶层、还有 `SYSTEM/SCRIPTS/datacore_helpers.md` 里的 `TOPIC_TO_CLUSTER` 是对齐的。按你自己的领域改名就行——记得这两处一起改。

## 怎么用

1. 在 Codex 或 Claude Code 中打开库，依赖和镜像设置见 [agent-workflows.md](agent-workflows.md)。
2. 把资料放进 `INBOX/raw/`（网页文章可以用 [Obsidian Web Clipper](https://obsidian.md/clipper) 剪）。
3. 先独立授权并运行 `/tag` 完成 capture/tag，再跑 `/wiki-ingest`，在 Obsidian 里就能看着 wiki 一点点长出来（graph view、新页、更新的索引）。
4. 之后用 `/wiki-query` 提问、`/wiki-lint` 只读体检；需要沉淀、修复或日志时明确授权。raw 与文献同名时使用路径限定链接，保留英文 `## Sources` 标题。Git 独立授权，见 [agent-workflows.md](agent-workflows.md)。

## 来源治理

来源记录支持 ingest_existing、ingest_new、archive_only、by_design_skip、defer，状态由真实引用、正文 hash 和复审条件推导。空政策文件没有外部服务默认项。`wiki_moc`/`wiki_index` 与内容页的来源要求不同；完整检查同时覆盖版本、来源消歧、计数、index 和导航。`unreferenced_raw` 不等于 `remaining_orphan`，默认只读。命令及受校验的决策写入见[来源治理](source-governance.md)，完整示例见[按需求指南](by-need.md)。
