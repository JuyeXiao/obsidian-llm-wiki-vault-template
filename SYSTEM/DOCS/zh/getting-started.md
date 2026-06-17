# 上手指南

## 1. 拿到这个库

- 在 GitHub 点 **Use this template**（或 `git clone`）。
- 在 Obsidian 里选「打开文件夹作为库」，指向这个文件夹。
- 弹窗问的时候**信任此库 / 启用插件**——仪表盘要跑 Datacore 的 JSX，只在受信任的库里才会运行。

## 2. 装插件

仪表盘和模板依赖一些社区插件，配置已经在 `.obsidian/` 里了，但插件本身要从「设置 → 第三方插件」自己装：

- **Datacore**（必需，所有仪表盘都靠它）、**Dataview**、**Templater**、**Meta Bind**、一个周期笔记插件（比如 **Journals**），还有 `.obsidian/community-plugins.json` 里列的那些小插件。

> 仪表盘要是报错，基本都是某个插件没装、没启用，或者库没信任。装上、启用、重载一下就好。

## 3. 改成你自己的

- 先打开 **`HUB/Homepage.md`**，这是你的起点。
- 新建笔记最省事的是 **QuickAdd**：跑 `Multi - Project` 或 `Multi - Area`，一步就建好文件夹加带编号的容器页（`1. <项目>` / `2. <领域>`）；闪念、永久、文献、会议这些类型也各有一个命令。每个都会把 `type` 和字段设好，仪表盘自动就能收到。（想手动套模板的话，用 Templater 也行。）
- 去 [`SYSTEM/TAGS/tag-library.md`](../../TAGS/tag-library.md) 把标签词表换成你自己领域的。

## 4.（可选）把 AI 这层用起来

在 [Claude Code](https://claude.com/claude-code) 里打开这个库，试试：

- `/tag`——给一篇笔记或一整个文件夹写 `tags` / `keywords` / `summary`。
- `/clip-digest`——把 `INBOX/raw/Clippings` 里的网页剪藏整理成文献笔记。
- `/wiki-ingest`——把资料吸收进 LLM Wiki，详见 [llm-wiki.md](llm-wiki.md)。
- `/morning-start`、`/daily-review`、`/weekly-start`、`/weekly-review`、`/monthly-start`、`/monthly-review`——带你做日 / 周 / 月笔记的规划和复盘。

## 备注

- **没有自动备份。** 这个库不带自动提交，自己用 Git 管：`git add`、commit，想好了再 push。
- **本来就是空的。** 模板只有结构和几篇示例笔记，没有个人内容。把示例删了，开始写自己的就行。
