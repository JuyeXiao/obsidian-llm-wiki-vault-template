# 标签系统

每篇笔记三个 frontmatter 字段，一遍写齐，**只补不覆盖**：

| 字段 | 是什么 | 受控吗 |
|---|---|---|
| `tags` | 受控词表里的语义标签 | ✅ 从 [`tag-library.md`](../../TAGS/tag-library.md) 里选 |
| `keywords` | 自由、具体的词（人名、产品、技术） | ❌ 随便填 |
| `summary` | 一两句话的摘要 | ❌ 随便填 |

为什么要三个？受控的 `tags` 保证归类一致、靠得住（仪表盘和 wiki 路由都指着它）；自由的 `keywords` 补上固定词表覆盖不到的细节；`summary` 让每篇笔记能一眼扫过，也喂给仪表盘。

## 受控词表

唯一真源在 [`SYSTEM/TAGS/`](../../TAGS/)：

- **[tag-spec.md](../../TAGS/tag-spec.md)**：规则（命名空间、怎么命名、merge 怎么算、写哪些范围）。
- **[tag-library.md](../../TAGS/tag-library.md)**：实际的 `topic/*` 和 `task/*` 标签。**自带一份小而通用的种子，按你的领域往上加。**
- **[keywords-summary-spec.md](../../TAGS/keywords-summary-spec.md)**：`keywords` 和 `summary` 怎么写。

## 规则速览

- **topic 选 1–4 个、尽量具体**，而且**只能从**标签库里挑。需要新标签？挂到对的父类下，**顺手回写标签库**。
- **结构标签**（`area/…`、`project/…`、`wiki/…`）是从文件夹和 `type` 派生出来的——别去动。
- **只补不覆盖**：你手写的值留着，打标只填空缺或顺手改好一点。

## 怎么用

在 Claude Code 里对一篇笔记或一个文件夹跑 **`/tag`**——读一遍、三个字段一起写。见 [`.agents/skills/tag/SKILL.md`](../../../.agents/skills/tag/SKILL.md)。

隔段时间跑一次 **`/tag-lint`**，别让词表烂掉：它查 **drift**（用了却没回写进标签库的标签）、malformed 标签、单篇重复。Lint 用临时文件派生词表，不改库。获准修改词表后，明确运行 `bash .agents/skills/tag-lint/scripts/build-taglist.sh` 更新 hook 读取的 `SYSTEM/TAGS/tag-library.flat.txt`。修复和标签日志须有授权，Git 按 [agent-workflows.md](agent-workflows.md) 执行。
