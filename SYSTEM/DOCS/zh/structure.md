# 结构与思路

两套手写的系统（PARA、ZETA），加一套归 LLM 管的系统（wiki）。把它们分开，正是这个库的关键。

## PARA：跟「做事」有关

全在 `PARA/` 下，放工作、技能、有产出的东西。

- **项目（Projects）**：有截止、有终点的事（每个项目自带一个仪表盘页）。
- **领域（Areas）**：长期维护、没有终点的方向（每个领域自动变成一个主题仪表盘）。
- **资源（Resources）**：给前面这些兜底的材料（文档、概念图、会议、联系人）。
- **归档（Archives）**：不再活跃的项目或领域，整组挪进来。
- **速记（Workstation）**：跟 PARA 有关的随手记（像闪念，但归 PARA）。

## ZETA：跟「想法」有关（卡片盒）

全在 `ZETA/` 下，放概念和思考，**不**跟 PARA 的事情绑在一起。

- **永久（Permanent）**：想透了、能长期留着的笔记。
- **文献（Literature）**：读外部东西（文章、书、播客）记下的笔记。
- **闪念（Fleeting）**：临时冒出来的念头。
- **参考（Reference）**：引用和出处。

## INBOX：LLM Wiki

`raw → wiki → schema`，归 LLM 管的一套系统，跟上面两套各自独立。见 [llm-wiki.md](llm-wiki.md)。

## 为什么要分开

> PARA 放**你要做的事**，ZETA 放**你琢磨的东西**。

平时只在各自系统**内部**连链接，跨系统的链接要少、要刻意。这样两张关系图各自清爽，项目的图不会跟想法的图缠成一团。LLM Wiki 是第三张并行的图——想连的时候刻意去连（比如在项目页里 pin 几个相关 wiki 页），而不是自动搅在一起。

## 时间与导航

- `DAILY/`：日 / 周 / 月 / 季 / 年记，由你的周期笔记插件管。
- `HUB/`：主页和 Permanent / Literature / Projects / Areas / Sources 五类 MOC，用实时的 Datacore 仪表盘把这些串起来。见 [dashboards.md](dashboards.md)。

## 笔记类型

每篇笔记的 frontmatter 里都有一个 `type`（像 `project_note`、`area_note`、`literature_note`、`wiki_concept`）。**这个字段很关键，仪表盘全靠它来查。** 用 `SYSTEM/TEMPLATE/FORMAT/` 里的模板新建，`type` 和字段都会自动设好。

**容器页的命名约定**：每个 Project / Area 文件夹里有一个容器页（`project_family` / `area_family`），名字带数字前缀——`1. <项目>` / `2. <领域>`——好让它排在文件夹最前面；同文件夹里其它笔记就是它的子笔记（`project_note` / `area_note`）。例子看 `PARA/PROJECTS/Portfolio Website/` 和 `PARA/AREAS/Data Analysis/`。

原 Map of Content 保留为兼容导航页。原始来源可以独立进入文献或 Wiki；文献再由 `/distill` 形成永久笔记，项目/领域通过明确关联使用它们。
