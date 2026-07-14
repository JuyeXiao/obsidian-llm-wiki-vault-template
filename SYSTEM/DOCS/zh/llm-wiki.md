# LLM Wiki 这一层

这个库最大的特点：知识库不光是把东西存着，还有个 LLM 帮你打理。

> **致谢。** 这一层是 [Andrej Karpathy「LLM Wiki」](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) 想法的落地。核心点子——让 LLM 一点点建起、并维护一个互相链接的 Markdown wiki，夹在你和原始资料中间——是他提的。这里具体的 schema、技能、文件夹怎么摆，是这个模板的一种实现。

## 它解决什么

平常用 LLM 处理文档，多半是 RAG 那套：传文件、提问时检索片段、生成答案。问题是每次提问 LLM 都从头来一遍，什么都没攒下。

而维护一个真正的知识库，烦的不是读、不是想，是**记账**：更新交叉引用、把摘要改到最新、标出新资料和老结论打架的地方、让几十页内容前后对得上。人最后大多会弃坑，因为维护越来越累、回报却跟不上。LLM 不嫌烦、一次能改十几个文件，维护成本几乎为零——wiki 也就能一直保持新鲜。

## 三层

```
INBOX/
├── raw/      你挑进来的资料（剪藏、书摘、播客），不可改。只读。
├── wiki/     归 LLM 写：互链的概念页 / 实体页 / 总览页，加 index.md、log.md。
└── schema/   wiki-schema.md —— 一套规矩，让 LLM 老老实实当个 wiki 管理员。
```

- **raw** 是源头，一切以它为准。LLM 只读，绝不改。
- **wiki** 全由 LLM 写：摘要、概念页、实体页、交叉引用、索引、时间线。
- **schema**（[`INBOX/schema/wiki-schema.md`](../../../INBOX/schema/wiki-schema.md)）就是那套规矩，把一个普通聊天机器人管成有纪律的 wiki 管理员，你跟 LLM 一起慢慢打磨它。

## 三个操作（Claude Code 技能）

| 技能 | 干什么 |
|---|---|
| **`/wiki-ingest`** | 把资料丢进 `raw`，Agent 读它、打标、归到对应簇、建或补概念页、加 `## 来源` 回链、更新 `index.md` 和 `log.md`。一篇资料可能牵动十几页。 |
| **`/wiki-query`** | 对着 wiki 提问，Agent 找到相关页、给出带引用的答案，还会把**有价值的答案回填**成新页，让探索的成果也攒下来。 |
| **`/wiki-lint`** | 做体检：找没人引用的孤儿源、前后矛盾、过时的结论、缺的概念页和交叉引用。发现矛盾会先**定性**（哪个源新？哪个更权威？是矛盾还是演化？），再三选一处置：改写并留 `## History` 痕、挂 `wiki_conflict` 悬案页留你裁决、或按演化更新——wiki 里不允许两页互相矛盾而彼此不知情。 |

## 两个特殊文件

- **`wiki/index.md`**：内容目录，每页一行，按簇分组。Agent 回答时先看它定位，再钻进具体页。规模不大时这就够用，省掉了 embedding 那套 RAG 基础设施。
- **`wiki/log.md`**：只往后追加的流水账，记每次 ingest / query / lint。

## 簇

一个簇就是一个顶层主题，对应 `wiki/` 下一个文件夹。模板预置了四个通用簇（`Data`、`AI`、`Productivity`、`Career`），跟标签库的 `topic/` 顶层、还有 `SYSTEM/SCRIPTS/datacore_helpers.md` 里的 `TOPIC_TO_CLUSTER` 是对齐的。按你自己的领域改名就行——记得这两处一起改。

## 怎么用

1. 在 [Claude Code](https://claude.com/claude-code) 里打开这个库。
2. 把资料放进 `INBOX/raw/`（网页文章可以用 [Obsidian Web Clipper](https://obsidian.md/clipper) 剪）。
3. 跑 `/wiki-ingest`，在 Obsidian 里就能看着 wiki 一点点长出来（graph view、新页、更新的索引）。
4. 之后用 `/wiki-query` 提问，时不时跑 `/wiki-lint` 做个体检。
