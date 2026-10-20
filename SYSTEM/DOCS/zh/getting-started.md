# 上手指南

## 1. 拿到这个库

- 运行 `git clone https://github.com/JuyeXiao/obsidian-llm-wiki-vault-template.git`，或点 **Code → Download ZIP** 并解压，保留隐藏的 `.obsidian/` 目录。安装不依赖 GitHub Template 设置。
- 在 Obsidian 里选「打开文件夹作为库」，指向这个文件夹。
- 弹窗问的时候**信任此库 / 启用插件**——仪表盘要跑 Datacore 的 JSX，只在受信任的库里才会运行。

## 2. 检查已打包插件

插件程序和设置均已打包在 `.obsidian/plugins/`。检查「设置 → 第三方插件」及 `.obsidian/community-plugins.json` 的启用 ID，保留必要插件；仅补装副本确实缺少的依赖，不要求批量更新：

- **Datacore**：仪表盘、页面任务及反向连接。
- **Dataview + Meta Bind**：按目录选候选并保存明确路径链接。
- **Journals + Templater**：创建周期笔记、写元数据及渲染模板。Journals 使用自身配置中的模板，Templater 对 DAILY 忽略自动创建触发，避免重复套模板。
- **QuickAdd + Note Toolbar**：随库创建/捕获命令和工具栏。
- **Homepage + Custom Sort + Iconic + Banners + Style Settings**：保留导航、排序和现有外观。随库共 **12 个插件**；另外 42 个旧插件已移除。搜索/快速切换使用原生入口，其它功能参见[按需安装](plugins.md)。第三方程序遵循各自许可证。

> 仪表盘报错时，先核对所指插件、信任设置及 helper/模板路径，并保留实际错误供排查。文件检查通过不能证明 Obsidian 界面可用。

## 3. 改成你自己的

- 先打开 **`HUB/Homepage.md`**，这是你的起点。
- 新建笔记最省事的是 **QuickAdd**：跑 `Multi - Project` 或 `Multi - Area`，一步就建好文件夹加带编号的容器页（`1. <项目>` / `2. <领域>`）；闪念、永久、文献、会议这些类型也各有一个命令。每个都会把 `type` 和字段设好，仪表盘自动就能收到。（想手动套模板的话，用 Templater 也行。）
- 运行规划/复盘前，先用配置好的 **Journals** 命令创建日/周/月记，检查内容已渲染且带有 `journal-start-date` / `journal-end-date`。**Capture - Add to Daily Task** 只向已有日记追加，不再创建缺元数据的日记。见 [agent-workflows.md](agent-workflows.md)。
- 去 [`SYSTEM/TAGS/tag-library.md`](../../TAGS/tag-library.md) 把标签词表换成你自己领域的。

## 4.（可选）把 AI 这层用起来

在 Codex 或 Claude Code 中打开库，共用 16 个技能。先按 [agent-workflows.md](agent-workflows.md) 备好 Node.js 18+、Python 3.10+、Git 及标签脚本所需工具，并检查镜像。试试：

- `/tag`——给一篇笔记或一整个文件夹写 `tags` / `keywords` / `summary`。
- `/clip-digest`——把 `INBOX/raw/Clippings` 里的网页剪藏整理成文献笔记。
- `/distill`——从文献形成永久笔记，或精准完善指定已有页。
- `/vault-git`——裸调用只盘点，不暂存、提交或推送。
- `/wiki-ingest`——把已独立捕获和打标的资料吸收进 LLM Wiki，详见 [llm-wiki.md](llm-wiki.md)。
- `/morning-start`、`/daily-review`、`/weekly-start`、`/weekly-review`、`/monthly-start`、`/monthly-review`——带你做日 / 周 / 月笔记的规划和复盘。

## 备注

- **不自动 Git 交付。** 内容写入（含复盘）不授权暂存/提交/推送；query/lint 默认只读且不记日志。按需要明确阶段授权，已有授权持续有效。获准提交后先保护无关 staged/dirty，再按精确文件清单暂存；push 另行授权。见 [agent-workflows.md](agent-workflows.md)。
- **本来就是空的。** 模板只有结构和几篇示例笔记，没有个人内容。原创示例演示完整链，删除前按[迁移说明](migration.md)同步处理关联和决策；[按需求指南](by-need.md)提供可复制口令。
