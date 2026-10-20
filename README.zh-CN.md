# Obsidian LLM-Wiki Vault

一个把 [PARA](https://fortelabs.com/blog/para/) 和[卡片盒笔记法](https://zh.wikipedia.org/wiki/卡片盒筆記法)跟一层 AI 结合起来的 Obsidian 库模板：一个由 Codex 或 [Claude Code](https://claude.com/claude-code) 帮着维护的 wiki，再加一组会自己保持更新的 [Datacore](https://github.com/blacksmithgu/datacore) 仪表盘。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) ![Obsidian](https://img.shields.io/badge/Obsidian-vault-7c3aed) [English](README.md) · 中文

![Architecture](SYSTEM/DOCS/assets/architecture.svg)

> 这是个模板，只有骨架——目录结构、各类笔记模板、仪表盘、标签系统，还有那套 AI 工作流，包含通用示例笔记，以及遵循各自许可证的第三方插件和主题程序。clone 或下载 ZIP 后在 Obsidian 打开，再加入自己的内容。

## 有什么不一样

市面上大多数所谓的「PARA 库」，说白了就是一套文件夹结构。这个库的不同，在于那层 AI——知识库不再只是堆在那儿，而是有个 LLM 帮你打理。

- **LLM Wiki**：一套 `raw → wiki → schema` 的机制，靠 Codex/Claude 共用技能（`ingest` / `query` / `lint`）运转。你把资料丢进去，它读完写成一堆互相链接的 wiki 页，顺手帮你交叉引用、去重、保持前后一致。思路来自 [Karpathy 的「LLM Wiki」](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)。
- **标签系统**：每篇笔记三个 frontmatter 字段——`tags`（从受控词表里挑）、`keywords`（随手填）、`summary`（一句话摘要）。读一遍正文就一次写齐，而且只补空缺，不会覆盖你手写的内容。
- **Datacore 仪表盘**：主页、各种 MOC、每个领域和项目的页面，都是实时从笔记里查出来的，不用手动维护任何列表。
- **PARA × 卡片盒**：要做的事（PARA）和脑子里的想法（ZETA）分两摊放，各管各的。
- **笔记模板**：项目、领域、文献、永久、闪念、会议，再加日/周/月记，每种都有现成的。
- **笔记工具栏和页面任务**：每篇笔记顶部有一条按文件夹切换的工具栏；整篇笔记也能当成待办，统一在 Mail Box 里处理。见 [SYSTEM/DOCS/zh/interface.md](SYSTEM/DOCS/zh/interface.md)。

## 目录结构

```
PARA/      要做的事：项目 · 领域 · 资源 · 归档 · 速记
ZETA/      要琢磨的想法（卡片盒）：永久 · 文献 · 闪念 · 参考
INBOX/     LLM Wiki：raw（不可变的源）· wiki（LLM 维护）· schema（规则）
DAILY/     时间笔记：日 · 周 · 月 · 季 · 年
HUB/       导航：主页 · Permanent / Literature / Projects / Areas / Sources 五类 MOC
SYSTEM/    模板 · 标签系统 · 脚本 · 文档（English + 中文）
.agents/   共用技能源（16 个技能）
.claude/   生成的技能镜像 + Claude hook
.codex/    Codex 写入校验 hook
```

PARA 和 ZETA 为什么要分开，见 [SYSTEM/DOCS/zh/structure.md](SYSTEM/DOCS/zh/structure.md)。

## 那层 AI

下列 **16 个技能** 在 `.agents/skills/` 共用一份真源，供 Codex 与 Claude Code 使用；Claude 读取生成镜像。见 [Agent 安装](SYSTEM/DOCS/zh/agent-workflows.md)。

| 系统 | 干什么 | 技能 | 规则（唯一真源） |
|---|---|---|---|
| **LLM Wiki** | 把 `INBOX/raw` 里的资料整理成 `INBOX/wiki` 里互相链接的综合页 | `/wiki-ingest` · `/wiki-query` · `/wiki-lint` | [INBOX/schema/wiki-schema.md](INBOX/schema/wiki-schema.md) |
| **标签系统** | 给笔记的 frontmatter 写 `tags` / `keywords` / `summary` | `/tag` · `/tag-lint` | [SYSTEM/TAGS/tag-spec.md](SYSTEM/TAGS/tag-spec.md) |
| **剪藏消化** | 把网页剪藏整理成 `ZETA/LITERATURE` 里的文献笔记 | `/clip-digest` | [文献契约](SYSTEM/TEMPLATE/FORMAT/literature-note-spec.md) |
| **永久笔记** | 从文献新建或精准完善已有页，保护用户观点归属 | `/distill` | [按需求指南](SYSTEM/DOCS/zh/by-need.md) |
| **手动备份** | 默认只读 Git 盘点与分组，明确授权后精确提交/推送 | `/vault-git` | [Agent 契约](SYSTEM/DOCS/zh/agent-workflows.md) |
| **日志复盘** | 带着你做日 / 周 / 月笔记的规划和复盘 | `/morning-start` · `/daily-review` · `/weekly-start` · `/weekly-review` · `/monthly-start` · `/monthly-review` | [周期笔记契约](SYSTEM/DOCS/zh/agent-workflows.md) |
| **红队挑战** | 用**你自己的库内历史**（复盘、决策、归档项目、既有立场）反驳你当前的想法；只读、不奉承 | `/vault-challenge` | — |
| **文档体检** | 拿这些文档跟库的实际状态对账——技能登记 / 簇接线 / 路径引用 / 中英对齐 | `/doc-lint` | — |

两个 Agent 的**写入校验 hook** 共用一个检查器，仅处理已匹配的 Write/Edit/apply_patch 载荷。Wiki 按类型检查 `## Sources` 和真实计数，PARA/ZETA 检查打标字段。Hook 仅警告，不回滚，也不覆盖任意 shell 写入。完整来源状态/index 另行检查。见[安装与运行限制](SYSTEM/DOCS/zh/agent-workflows.md)。

完整说明见 [SYSTEM/DOCS/zh/llm-wiki.md](SYSTEM/DOCS/zh/llm-wiki.md)。

## 上手

1. 克隆[仓库](https://github.com/JuyeXiao/obsidian-llm-wiki-vault-template)，或点 **Code → Download ZIP** 并解压，再作为库打开。安装不依赖 **Use this template** 按钮。
2. 弹窗问的时候**信任此库**——仪表盘要跑 Datacore 的 JSX。
3. **检查并启用所需的已打包社区插件**（见[插件](#插件)）：程序与配置均随库交付，仅在副本确实缺少依赖时补装。
4. 打开 **`HUB/Homepage.md`**，这就是你的起点。
5. AI 层可选：在 Codex 或 Claude Code 中打开库，按[需求指南](SYSTEM/DOCS/zh/by-need.md)选择文章 → 文献 → 永久笔记或 raw → Wiki，捕获来源后独立运行 `/tag` 补路由标签，再请求 `/wiki-ingest`；`/clip-digest` 另建文献笔记。Query/lint 默认只读，内容写入不授权 Git 交付。

继续阅读[上手](SYSTEM/DOCS/zh/getting-started.md) · [按需求与原创示例](SYSTEM/DOCS/zh/by-need.md) · [来源治理](SYSTEM/DOCS/zh/source-governance.md) · [旧版迁移](SYSTEM/DOCS/zh/migration.md)。

维护需要 Node.js 18+、Python 3.10+、Git；现有标签脚本还需 Bash、ripgrep、sed、awk。Agent 安装/账号由用户配置，无需新增依赖包，详见[依赖与检查](SYSTEM/DOCS/zh/agent-workflows.md)。

## 插件

默认打包并启用 **12 个插件**，保留其现有版本：

- **7 个功能依赖**：Datacore、Dataview、Meta Bind、Templater、Journals、QuickAdd、Note Toolbar。
- **导航与外观**：Homepage、Custom Sort、Iconic、Banners、Style Settings。
- 旧版其余 **42 个插件已移除**，按需从上游安装。搜索和快速切换改用 Obsidian 原生入口；Codex/Claude 技能不依赖 Obsidian 内的 AI 插件。

查看[完整清单与安装说明](SYSTEM/DOCS/zh/plugins.md)及[迁移说明](SYSTEM/DOCS/zh/migration.md)。插件程序和必要配置在 `.obsidian/plugins/`，启用清单为 `.obsidian/community-plugins.json`。

> **再分发审查仍待完成**：保留插件的许可证与组件声明均保留，但 5 个项目的源码交付、2 处许可元数据矛盾及部分依赖证据仍待核对。见[当前 12 插件许可审查](SYSTEM/DOCS/zh/plugin-licenses.md)。模板的 MIT 许可不覆盖第三方代码。

## 几点设计取舍

- **PARA 和 ZETA 分开。** 要做的事、技能归 PARA，想法、概念归 ZETA。平时只在各自系统里连链接，跨系统的链接是要刻意去建的。
- **为什么让 LLM 来维护 wiki。** 维护知识库最累的不是读、不是想，而是记账那摊活儿：更新交叉引用、把摘要改新、标出前后矛盾。Agent 提出内容，确定性检查核对来源、计数和决策；语义审阅和明确维护仍然必要。详见 [SYSTEM/DOCS/zh/llm-wiki.md](SYSTEM/DOCS/zh/llm-wiki.md)。
- **用仪表盘代替手写索引。** 笔记带上 `type` 和标签，Datacore 就能实时生成视图，省得自己维护列表。

## 致谢

- 最早是在 DuskWasHere 的 [dusk-obsidian-vault](https://github.com/DuskWasHere/dusk-obsidian-vault)（MIT）基础上改的，后来做了大量重构和扩展。
- LLM Wiki 这一层的思路来自 [Karpathy 的「LLM Wiki」](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)。

- AnuPpuccin 主题及其片段来自 [AnubisNekhet](https://github.com/AnubisNekhet/AnuPpuccin)；[支持作者](https://www.buymeacoffee.com/anubisnekhet)。

## 许可

[MIT](LICENSE)，覆盖原创的模板内容（结构、模板、脚本、文档）。第三方插件、主题、字体各自遵循自己的许可证。

主题、CSS 和图片的声明及证据范围见[资产来源说明](SYSTEM/DOCS/zh/asset-licenses.md)。
