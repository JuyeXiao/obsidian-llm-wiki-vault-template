# 仪表盘

`HUB/` 下的页面都是**实时的 [Datacore](https://github.com/blacksmithgu/datacore) 仪表盘**——按 `type` 和标签去查你的笔记，而不是手工维护的列表。它们共用一个 helper 模块 [`SYSTEM/SCRIPTS/datacore_helpers.md`](../../SCRIPTS/datacore_helpers.md)，组件、列、表格都定义在那儿。

## 都有哪些页

- **`HUB/Homepage.md`**：起点，放导航、统计和快捷入口。
- **`HUB/Map of Content.md`**：全部笔记（含 wiki 页）的动态索引，能搜能筛。
- **`HUB/MOC/`**：各类别的内容地图（项目、领域、文献、素材源）。
- **`HUB/PARA-Wiki Atlas.md`**：桥接视图，按簇把 wiki 页和映射到它的 PARA 页摆在一起。
- **`HUB/Mail Box.md`**：全库的页面级任务清单。

## 笔记里也内嵌仪表盘

领域页和项目页各自带一个仪表盘（用的是同一套 helper）：领域页会列出它的子区域、笔记、关联项目、会议、相关 wiki 和任务；项目页列子笔记和没完成的任务。这些都靠笔记的 `type` 和标签驱动——所以**用模板新建很重要**。

## 大致原理

- 笔记带着 `type`（像 `area_family`、`project_note`、`wiki_concept`）和标签。
- 仪表盘对它们跑 `dc.useQuery(...)`，再用共用组件（`TabbedView`、可排序的 `Table`、chip）渲染出来。
- 空库就是空仪表盘。你用模板建的笔记越多，仪表盘自动填得越满。

> 想改：动 `datacore_helpers.md` 是全局改列和文案，动某个 `HUB/*.md` 只影响那一个视图。`type` 的值是笔记和仪表盘之间的约定——保持一致就行。
