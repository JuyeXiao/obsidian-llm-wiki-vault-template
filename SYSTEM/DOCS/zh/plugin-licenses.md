# 当前打包插件的许可与再分发审查

审阅日期：2026-10-20。[English](../plugin-licenses.md) · [固定版本证据](../plugin-licenses.json) · [安装与可选插件](plugins.md)

**当前范围为 12 个保留插件，尚未获得整包发布放行。** 旧版的 42 个插件及其随库资产/声明已退出当前工作树；12 个项目许可证和逐插件组件声明完整保留，保留插件的程序字节未因精简而变化。此次没有升级插件，也没有改写旧提交或旧发布。

## 保留的声明

- 6 个 MIT 项目保留版权、许可及免责声明；1 个 MIT-0 项目保留原文以供溯源。
- 4 个 GPLv3 和 1 个 AGPLv3 项目保留完整许可证及原有修改说明；对应源码及所选交付安排仍待核对，不能把固定源码链接当作义务已全部完成。
- 每个插件的 `THIRD-PARTY-NOTICES.txt` 保留已识别组件的原文、来源及未决项。插件可能包含独立许可的依赖；项目级许可不能代替它们。
- 原创模板的 MIT 许可不覆盖这些第三方程序。更新插件后需重新核对版本、声明、资产与源码访问条件。

## 当前剩余条件

1. **5 个项目的源码交付**：Custom Sort、Note Toolbar、Meta Bind、Style Settings、Templater 的完整对应源码/依赖闭合与持续可用的交付安排未完成验收。
2. **2 处元数据矛盾**：Custom Sort、Style Settings 的 package MIT 字段与 GPL 许可证正文矛盾；本清单按许可证正文记录，不推定 MIT 是可任选的授权。
3. **依赖证据**：Datacore、Dataview、Journals、Templater 存在多版本候选；Templater 的 rusty_engine 缺失声明现已从上游仅增加许可证、Rust 源码不变的提交中补齐。逐项详情在 JSON 与插件 notice 中。现有清单不是完整传递 SBOM，也未完成全部图标/资产核验。
4. 主题、CSS 与图片来源见[资产审查](asset-licenses.md)；没有重新验收旧提交/旧发布的许可。

Force note view mode、Paste URL into selection、Tag Wrangler、Smart Connections、Claudian 及 Enhancing Export 等已移除，其先前未决条件不再是**当前工作树包含这些代码**的问题。这不表示其上游许可已获确认，也不撤回旧版 54 插件审查证据。用户自行安装可选插件后，另按所装版本审阅；不得把它们悄悄重新打包。

## 已核对源码访问

2026-10-20 已成功下载 5 个固定 GPL/AGPL 源码归档；文件数、SHA256、构建入口与可用锁文件写入 JSON 的 `source_review`，并放入各插件旁的 notice。未执行下载的源码、未安装依赖。下载成功不等于完整对应源码或未来持续可用。GPLv3 第 6(d) 条允许使用另一源码服务器并提供清晰指引，但分发者仍需保证源码持续可访问；只保存在本地审计目录不等于公开交付。

`@silentvoid13/rusty_engine@0.4.0` 的 npm `gitHead` 与上游带许可的提交相比，仅增加 `LICENSE.TXT`。已将 AGPL 正文补入 Templater 的组件声明；没有重新构建 WASM。两处 package 元数据矛盾继续保留，清单仍按 GPL 正文处理。

## 证据范围

本表保留前次逐版本审查的固定源码、版本、已识别依赖和 hash。`asset_verification` 记录先前补声明前的上游发布物对比，`artifact_hashes` 记录补声明后的文件 hash；精简没有修改保留程序。没有重新运行构建、完成全部依赖清单或联系作者。原始组件声明优先于本摘要。

| 插件 ID | 版本 | 项目许可证据 | 本地原文 | 固定源码 | 未决条件 |
|---|---|---|---|---|---|
| `custom-sort` | 3.1.6 | GPLv3 | [LICENSE](../../../.obsidian/plugins/custom-sort/LICENSE.md) | [source](https://github.com/sebastianmc/obsidian-custom-sort/tree/284bfdf04055b3ec8a5587b133cfffe8ba157486) | CONFLICTING_METADATA, SOURCE_DISTRIBUTION |
| `datacore` | 0.1.29 | MIT | [LICENSE](../../../.obsidian/plugins/datacore/LICENSE.txt) | [source](https://github.com/blacksmithgu/datacore/tree/6a1aa7317530d0c524dd3368f52f3032e7cf869e) | MULTIPLE_LOCK_VERSIONS |
| `dataview` | 0.5.68 | MIT | [LICENSE](../../../.obsidian/plugins/dataview/LICENSE.txt) | [source](https://github.com/blacksmithgu/obsidian-dataview/tree/29b1ad87e1f2b964b4fa0c209f11d0622469bdb0) | MULTIPLE_LOCK_VERSIONS |
| `homepage` | 4.4.2 | MIT | [LICENSE](../../../.obsidian/plugins/homepage/LICENSE.md) | [source](https://github.com/mirnovov/obsidian-homepage/tree/eaa5d29fc7a685aee2129f2e04122cd646349110) | 组件总清单未完整核验 |
| `iconic` | 1.1.9 | MIT-0 | [LICENSE](../../../.obsidian/plugins/iconic/LICENSE) | [source](https://github.com/gfxholo/iconic/tree/d79c1ec50b83d67ba26a70f4dc8c212a414963ef) | 组件总清单未完整核验 |
| `journals` | 2.1.10 | MIT | [LICENSE](../../../.obsidian/plugins/journals/LICENSE) | [source](https://github.com/srg-kostyrko/obsidian-journal/tree/21d5cbabc81af2ba9724d85eed46c84773754ac2) | MULTIPLE_LOCK_VERSIONS |
| `note-toolbar` | 1.32.15 | GPLv3 | [LICENSE](../../../.obsidian/plugins/note-toolbar/LICENSE) | [source](https://github.com/chrisgurney/obsidian-note-toolbar/tree/3a42ed12e98ef24322690983dfd10416eb7f6927) | SOURCE_DISTRIBUTION |
| `obsidian-banners` | 1.3.3 | MIT | [LICENSE](../../../.obsidian/plugins/obsidian-banners/LICENSE) | [source](https://github.com/noatpad/obsidian-banners/tree/b4601ca5481402e62cc0bc477abc717fddcb099d) | 组件总清单未完整核验 |
| `obsidian-meta-bind-plugin` | 1.4.12 | GPLv3 | [LICENSE](../../../.obsidian/plugins/obsidian-meta-bind-plugin/LICENSE.txt) | [source](https://github.com/mprojectscode/obsidian-meta-bind-plugin/tree/6d41566765e19325150c508d3c1146074df78283) | SOURCE_DISTRIBUTION |
| `obsidian-style-settings` | 1.0.9 | GPLv3 | [LICENSE](../../../.obsidian/plugins/obsidian-style-settings/LICENSE.md) | [source](https://github.com/obsidian-community/obsidian-style-settings/tree/4ebec6ae0131a9d5e8307bb5e26d59db5ba2e81c) | CONFLICTING_METADATA, SOURCE_DISTRIBUTION |
| `quickadd` | 2.12.2 | MIT | [LICENSE](../../../.obsidian/plugins/quickadd/LICENSE) | [source](https://github.com/chhoumann/quickadd/tree/d38644d70a65735fe1fe347aa9a172d378b6c0a4) | 组件总清单未完整核验 |
| `templater-obsidian` | 2.20.5 | AGPLv3 | [LICENSE](../../../.obsidian/plugins/templater-obsidian/LICENSE.TXT) | [source](https://github.com/silentvoid13/Templater/tree/e818dc6cd37aa9aecbfee49ab06ee343f8b12e01) | MULTIPLE_LOCK_VERSIONS, SOURCE_DISTRIBUTION |
