# 插件：精简默认依赖与按需安装

[English](../plugins.md) · [按版本许可审查](plugin-licenses.md)

模板打包并启用 **12 个插件**：7 个功能依赖、Homepage 与 Custom Sort，以及 Iconic、Banners、Style Settings 三个外观辅助。保留原有版本、程序、声明与必要配置；旧版另外 42 个插件不再打包或启用。这次不批量升级插件。

## 保留的插件

| 插件 | ID | 打包版本 | 用途 |
|---|---|---|---|
| Custom File Explorer sorting | `custom-sort` | 3.1.6 | 文件树策展顺序 |
| Datacore | `datacore` | 0.1.29 | 仪表盘、五类 MOC、Mail Box、关联展示 |
| Dataview | `dataview` | 0.5.68 | Meta Bind 目录候选查询及已有 Dataview 视图 |
| Homepage | `homepage` | 4.4.2 | 启动时打开主页 |
| Iconic | `iconic` | 1.1.9 | 文件与页面任务图标 |
| Journals | `journals` | 2.1.10 | 周期笔记、日期范围和日历导航 |
| Note Toolbar | `note-toolbar` | 1.32.15 | 按目录显示工具栏与导航 |
| Banners | `obsidian-banners` | 1.3.3 | 保留已有页面横幅 |
| Meta Bind | `obsidian-meta-bind-plugin` | 1.4.12 | 关联选择器与元数据输入 |
| Style Settings | `obsidian-style-settings` | 1.0.9 | 保留已有主题及 CSS 选项 |
| QuickAdd | `quickadd` | 2.12.2 | 新建笔记和捕获命令 |
| Templater | `templater-obsidian` | 2.20.5 | 模板渲染与页面任务命令 |

## 按需安装

只安装确实需要的功能：**设置 → 第三方插件 → 浏览 → 按插件名称搜索 → 安装 → 启用**。若未列入社区目录，先阅读下表上游仓库的安装方式及条款。参见 [Obsidian 官方安装说明](https://obsidian.md/help/community-plugins)。可选插件由用户在自己的库中安装；模板不自动安装，也不配置账号。

- 搜索与快速切换改用 Obsidian 原生命令：`Mod+Shift+F` 搜索全库，`Mod+Shift+S` 打开快速切换器。移除旧 Quick Explorer 快捷键，浏览文件使用原生文件列表。
- 行内任务用 Markdown 复选框，页面任务用 Mail Box。需要额外任务查询或重复任务时再安装 Tasks。旧 Timeline 脚本已退役，Tasks Manager 页面保留并指向 Mail Box。
- Wiki、打标、distill、Git 技能运行在自己的 Codex/Claude Code 环境中，不依赖 Smart Connections、AI Providers 或 Claudian。Claudian 是可选的独立界面，不等于 Claude CLI。
- 当前 Meta Bind 输入选择器和普通 view 字段不需要 JS Engine；添加 Meta Bind JavaScript 视图/动作或 JS Engine 代码块时再安装。
- 当前示例不要求 Charts、Charts View、Tracker、Tabs、Kanban 或 Advanced Canvas 内容；只为自己新增的内容安装所需插件。
- Homepage 以阅读模式打开。不再按目录强制视图，用 Obsidian 原生阅读/实时预览/源码模式切换；移除 Home Tab 后新标签页使用原生空白视图。

以下是旧版迁移对照，并非推荐全部安装。可选插件未纳入精简版验收；添加后先检查当前兼容性，再分发其代码前另核许可。

| 可选插件 | ID | 上游安装说明与条款 |
|---|---|---|
| Advanced Canvas | `advanced-canvas` | [GitHub](https://github.com/developer-mike/obsidian-advanced-canvas) |
| AI Providers | `ai-providers` | [GitHub](https://github.com/pfrankov/obsidian-ai-providers) |
| Commander | `cmdr` | [GitHub](https://github.com/jsmorabito/obsidian-commander) |
| Colored Tags | `colored-tags` | [GitHub](https://github.com/pfrankov/obsidian-colored-tags) |
| Quick Switcher++ | `darlal-switcher-plus` | [GitHub](https://github.com/darlal/obsidian-switcher-plus) |
| Editing Toolbar | `editing-toolbar` | [GitHub](https://github.com/pkm-er/obsidian-editing-toolbar) |
| Floating Search | `float-search` | [GitHub](https://github.com/quorafind/Obsidian-Float-Search) |
| floating toc | `floating-toc` | [GitHub](https://github.com/pkm-er/obsidian-floating-toc-plugin) |
| Home tab | `home-tab` | [GitHub](https://github.com/olrenso/obsidian-home-tab) |
| Image Converter | `image-converter` | [GitHub](https://github.com/xryul/obsidian-image-converter) |
| JS Engine | `js-engine` | [GitHub](https://github.com/mprojectscode/obsidian-js-engine-plugin) |
| Keyboard Analyzer | `keyboard-analyzer` | [GitHub](https://github.com/noname-oni/obsidian-keyboard-analyzer) |
| Natural Language Dates | `nldates-obsidian` | [GitHub](https://github.com/argenos/nldates-obsidian) |
| Charts | `obsidian-charts` | [GitHub](https://github.com/phibr0/obsidian-charts) |
| Charts View | `obsidian-chartsview-plugin` | [GitHub](https://github.com/caronchen/obsidian-chartsview-plugin) |
| Custom Frames | `obsidian-custom-frames` | [GitHub](https://github.com/ellpeck/ObsidianCustomFrames) |
| Enhancing Export | `obsidian-enhancing-export` | [GitHub](https://github.com/mokeyish/obsidian-enhancing-export) |
| Iconize | `obsidian-icon-folder` | [GitHub](https://github.com/florianwoelki/obsidian-iconize) |
| Image Toolkit | `obsidian-image-toolkit` | [GitHub](https://github.com/obsidian-community/obsidian-image-toolkit) |
| Importer | `obsidian-importer` | [GitHub](https://github.com/obsidianmd/obsidian-importer) |
| Kanban | `obsidian-kanban` | [GitHub](https://github.com/obsidian-community/obsidian-kanban) |
| Linter | `obsidian-linter` | [GitHub](https://github.com/platers/obsidian-linter) |
| List Callouts | `obsidian-list-callouts` | [GitHub](https://github.com/mgmeyers/obsidian-list-callouts) |
| Tasks | `obsidian-tasks-plugin` | [GitHub](https://github.com/obsidian-tasks-group/obsidian-tasks) |
| Tracker | `obsidian-tracker` | [GitHub](https://github.com/pyrochlore/obsidian-tracker) |
| Trash Explorer | `obsidian-trash-explorer` | [GitHub](https://github.com/proog/obsidian-trash-explorer) |
| Force note view mode | `obsidian-view-mode-by-frontmatter` | [GitHub](https://github.com/bwydoogh/obsidian-force-view-mode-of-note) |
| BRAT | `obsidian42-brat` | [GitHub](https://github.com/tfthacker/obsidian42-brat) |
| Omnisearch | `omnisearch` | [GitHub](https://github.com/scambier/obsidian-omnisearch) |
| PDF++ | `pdf-plus` | [GitHub](https://github.com/ryotaushio/obsidian-pdf-plus) |
| Pomodoro Timer | `pomodoro-timer` | [GitHub](https://github.com/eatgrass/obsidian-pomodoro-timer) |
| Quick Explorer | `quick-explorer` | [GitHub](https://github.com/pjeby/quick-explorer) |
| Claudian | `realclaudian` | [GitHub](https://github.com/yishentu/claudian) |
| Recent Files | `recent-files-obsidian` | [GitHub](https://github.com/tgrosinger/recent-files-obsidian) |
| Settings Search | `settings-search` | [GitHub](https://github.com/javalent/settings-search) |
| Smart Connections | `smart-connections` | [GitHub](https://github.com/brianpetro/obsidian-smart-connections) |
| Status Bar Organizer | `statusbar-organizer` | [GitHub](https://github.com/opisek/obsidian-statusbar-organizer) |
| Advanced Tables | `table-editor-obsidian` | [GitHub](https://github.com/tgrosinger/advanced-tables-obsidian) |
| Tabs | `tabs` | [GitHub](https://github.com/xhuajin/obsidian-tabs) |
| Tag Wrangler | `tag-wrangler` | [GitHub](https://github.com/pjeby/tag-wrangler) |
| Paste URL into selection | `url-into-selection` | [GitHub](https://github.com/denolehov/obsidian-url-into-selection) |
| Various Complements | `various-complements` | [GitHub](https://github.com/tadashi-aikawa/obsidian-various-complements-plugin) |

## 升级已有副本

卸载前备份个人插件设置。按项合并启用清单、工具栏与快捷键，不清除无关用户设置。被移除目录可能含用户配置；当前模板删除对应程序和随库设置，但不改写旧 Git 提交或旧发布。参见[迁移说明](migration.md)。

验证这次更新时保留 12 个现有版本；更换插件后重新检查文档/配置，并验证仪表盘、关联保存、Mail Box、周期笔记及工具栏。再分发代码时保留全部声明；[许可审查](plugin-licenses.md)中仍有源码交付及依赖条件待闭合。
