# 主题、CSS 与图片来源

审阅日期：2026-10-20。[English](../asset-licenses.md) · [插件声明](plugin-licenses.md)

本页记录当前随模板打包的资产，保留原作者署名。第三方条款独立于模板的 MIT 许可。本轮补齐已确认缺失的声明并记录剩余不确定性，不宣称完成全面法律审计或全部第三方资产的重新构建。

| 资产 | 证据与保留声明 |
|---|---|
| Minimal 7.7.18 | `theme.css` 与[固定上游源码](https://github.com/kepano/obsidian-minimal/tree/8ff51e864beb30c72a0d04f1d4338f20d6581109)逐字节一致。已补齐缺失的 [MIT 许可](../../../.obsidian/themes/Minimal/LICENSE)及[来源声明](../../../.obsidian/themes/Minimal/THIRD-PARTY-NOTICES.txt)。 |
| AnuPpuccin 1.5.0 | 保留 [GPL 许可](../../../.obsidian/themes/AnuPpuccin/LICENSE)、作者 README、可编辑 SCSS 和 Makefile。本地文件与 [v1.5.0 参考版本](https://github.com/AnubisNekhet/AnuPpuccin/tree/93edd678ee5f2e090479f1807dfe13c71fc22720)存在差异；尚未完整确认原有改动来源及编译产物与源码的一致性，见[声明](../../../.obsidian/themes/AnuPpuccin/THIRD-PARTY-NOTICES.txt)。 |
| MCL Gallery Cards / Multi Column / Wide Views | 作者 Faiz Khuzaimah（@efemkay），[GPL-3.0 来源](https://github.com/efemkay/obsidian-modular-css-layout/tree/1db5920dfb5d557570aac37a5e368b82613daef7)。Gallery Cards 规范化换行后一致，Wide Views 逐字节一致；Multi Column 仅草稿版本注释不同。保留可编辑 CSS 并补入 GPL 正文。 |
| AnuPpuccin CSS 片段 | `custom-background`、`custom-rainbow-colors`、`notion-cards` 明确声明 AGPLv3；`its-frontmatter`、`extended-colorschemes` 来自 GPL 主题。保留原始头注释和可编辑 SCSS；rainbow 片段含继承的差异。 |
| Minimal Cards 3.0.0 | MIT；保留 @kepano 署名。与 AnuPpuccin 参考版本中的片段规范化换行后一致，片段声明中补入 MIT 正文。 |
| Gradient Callouts | 原注释署名 Elevict。除换行外，与原始 [Dusk 模板归档](https://github.com/DuskWasHere/dusk-obsidian-vault/tree/69fd1e725e21557b9eb7d706ccaa0834288085cb)中的副本一致；独立作者授权尚未确认，不把 Dusk 的 MIT 许可推定为已解决此项。 |
| 模板 CSS | `base`、`datacore-classes`、`datacore-table-polish`、`file-explorer-wrap`、`homepage`、`mobile`、`show-hover-title` 随模板维护，保留根目录 [LICENSE](../../../LICENSE)及已有署名。 |
| 4 张 `SYSTEM/BANNER/banner-*.png` | 维护者确认属于生成图片，并非下载的第三方插画。本轮未核对具体生成工具、生成记录或服务条款；图片未改动。 |
| `SYSTEM/DESIGN/search.gif` | 与原始 Dusk 归档逐字节一致，保留 Dusk 署名及根目录 MIT 声明。 |
| 结构 SVG | 作为模板原创文档随根目录 MIT 许可维护。 |

CSS 完整许可正文及逐文件对应关系见 [snippets/THIRD-PARTY-NOTICES.txt](../../../.obsidian/snippets/THIRD-PARTY-NOTICES.txt)。AnuPpuccin 作者为 [AnubisNekhet](https://github.com/AnubisNekhet/AnuPpuccin)，可[支持作者](https://www.buymeacoffee.com/anubisnekhet)；Minimal 作者为 [@kepano](https://github.com/kepano)，可[支持作者](https://www.buymeacoffee.com/kepano)。

已检查的 CSS/SCSS 未发现独立字体文件、`@font-face` 或常见内嵌/远端字体载荷。主题 README 中推荐字体不等于随库打包字体。此检查不覆盖 Obsidian 或操作系统安装的字体。

本轮保留主题上游预览图片及继承的源码/缓存，没有重做外观或清理这些文件，也不因此宣称拥有第三方素材的独立著作权。全部上游图片溯源及 AnuPpuccin 重建验证不在此次有限审查内；若单独再分发修改后的主题或片段，应一并保留其声明和对应源码。
