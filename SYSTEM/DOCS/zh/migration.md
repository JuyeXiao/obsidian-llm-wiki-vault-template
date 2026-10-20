# 升级已有库

先备份并盘点自己的本地变化，再按具体文件合并模板更新，保护人工内容、私人配置和无关暂存。迁移命令不会提交或推送。[English](../migration.md)

## 技能真源与 Hook

旧版直接编辑 `.claude/skills/`；现在唯一真源为 `.agents/skills/`，先把本地改进合并到真源，再生成 Claude 镜像。`AGENTS.md` 管共享规则，`CLAUDE.md` 导入共享入口并说明 Claude 发现机制，不维护两份独立技能正文。

```sh
python SYSTEM/SCRIPTS/sync_agent_skills.py --write
python SYSTEM/SCRIPTS/sync_agent_skills.py
python .agents/skills/doc-lint/scripts/doc-lint.py
```

生成会移除镜像内多余文件，所以先合并个人镜像改动；Python 运行缓存不参与镜像。个人权限、模型设置和本地配置不进入公开模板。向已有配置合并 hook 时逐项检查；共用检查器需要 Node，Claude 适配器还需 Python。实际命令/载荷限制见 [agent-workflows.md](agent-workflows.md)。直接调用测试不能证明 Agent 运行时已投递 hook。

## 五类导航入口

Permanent / Literature / Projects / Areas / Sources 取代旧全库表入口；Homepage、工具栏、QuickAdd 和排序已联动。`HUB/Map of Content.md` 保留为简短兼容导航页，旧链接仍有可用落点。Wiki 从其 index 开始。合并工具栏时保留个人动作，不整体覆盖插件配置。合并 `SYSTEM/Vault Sort Order.md` 后，在 Obsidian 执行 **sort-on** 刷新文件树。

Permanent MOC 读取真实待补观点/开放问题 callout，不从缺少标记推断确认。旧笔记未标记就显示 Unmarked；加标记或确认立场属于内容判断，不自动迁移。

## 链接与笔记归属

标题冲突时使用库相对完整路径，尤其 raw/文献同名场景。既有选择器用 `useLinks(true)` 保存路径，反向连接 helper 拒绝歧义短名。Wiki 正文可以翻译，但保留 `## Sources`。文献证据指向 raw，永久笔记指向精确文献；raw 进入 Wiki 不必经过文献层。

旧通用文献示例已换成原创 `Note-Taking Basics (example)` 链。在自己的库删除前先检查旧示例及其入链；经过用户编辑的笔记不能被模板示例覆盖。Distill 保护人工正文、元数据、批注和连接；可精准完善指定已有页，不必另造同题笔记。

## 版本、状态文件和检查

仅在不存在时创建空的版本 1 政策/决策文件，不用模板示例记录覆盖已有注册表。读完完整 schema 契约后再采用 `schema_version: 1`。未知版本报错，不静默跳过，也不提供历史账本自动导入。

有引用无决策的旧来源显示 `legacy_ingested`，逐项审阅，不能把全部 raw 手写成 satisfied。获授权后按公开正文 hash 规则（去 frontmatter、CRLF 归一）计算，保留其他记录，使用[来源治理](source-governance.md)的完整候选校验写入。页面按类型校验来源、计数、category、导航和 index；只在授权范围修复真实漂移。

```sh
node .agents/skills/wiki-lint/scripts/wiki-lint.js --json
node .agents/skills/wiki-lint/scripts/wiki-index.js --check
node --test .agents/skills/wiki-lint/scripts/wiki-lint.test.js
node --test SYSTEM/SCRIPTS/tests/*.test.cjs
python -B -m unittest discover -s SYSTEM/SCRIPTS/tests -p "test_*.py"
python -B -m unittest discover -s .agents/skills/vault-git/scripts -p "test_*.py"
```

Wiki 规则只有 Node 引擎一份；旧 `.agents/skills/wiki-lint/scripts/wiki-lint.sh` 和 `.py` 仅转发。脚本检查不覆盖真实 Obsidian 渲染或 Agent 推理；投入日常使用前，在隔离副本验收导航、关联保存、待补筛选、周期写入和 hook 警告投递。

## 插件精简：54 → 12

按[保留清单与 42 项可选对照](plugins.md)合并，不把用户的插件目录直接当作可删除模板数据。先备份被移除插件的个人设置，再决定是否卸载。合并启用清单和 Note Toolbar：Omnisearch → `global-search:open`，Quick Switcher++ → `switcher:open`；保留原快捷键组合，移除 Quick Explorer 快捷键。保留原生 Search、Quick Switcher 和 Files 核心插件。旧 Timeline 的 Tasks Manager 入口改指向 Mail Box，脚本和样式已退役；需要 Tasks 特有行为请单独安装配置。移除 Force note view mode 后使用原生视图切换；Homepage 仍按配置打开阅读模式。Home Tab 不再随库提供，新标签页回到原生空白页。

工具栏原有两个明暗模式命令合并为原生 `theme:toggle-light-dark`。移除一个指向不存在 QuickAdd 动作的旧快捷键；没有匹配且已启用的 choice 时不要恢复它。

本更新保留 Iconic/Banners/Style Settings 与原版本程序；没有升级其余插件或改写历史。新的许可清单只描述当前 12 个插件，旧提交/旧发布不会因本次删除自动消失。合并后在隔离副本验证核心工作流；可选插件自行安装后的行为不在默认验收中。
