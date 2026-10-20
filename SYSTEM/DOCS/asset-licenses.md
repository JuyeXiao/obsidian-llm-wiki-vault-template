# Theme, CSS and image provenance

Reviewed 2026-10-20. [中文](zh/asset-licenses.md) · [Plugin notices](plugin-licenses.md)

This records the assets currently shipped with the template. Original author headers are preserved. Third-party terms apply independently of the template's MIT license. This review restored confirmed missing notices and recorded remaining uncertainty; it does not claim exhaustive legal clearance or a clean rebuild of every third-party asset.

| Asset | Evidence and retained notice |
|---|---|
| Minimal 7.7.18 | `theme.css` matches [fixed upstream source](https://github.com/kepano/obsidian-minimal/tree/8ff51e864beb30c72a0d04f1d4338f20d6581109) byte for byte. The missing [MIT license](../../.obsidian/themes/Minimal/LICENSE) and [source notice](../../.obsidian/themes/Minimal/THIRD-PARTY-NOTICES.txt) are restored. |
| AnuPpuccin 1.5.0 | [GPL license](../../.obsidian/themes/AnuPpuccin/LICENSE), author README, editable SCSS and Makefile are retained. The local tree differs from the [v1.5.0 reference](https://github.com/AnubisNekhet/AnuPpuccin/tree/93edd678ee5f2e090479f1807dfe13c71fc22720); its original changes and exact compiled-source correspondence have not been fully established. See [notice](../../.obsidian/themes/AnuPpuccin/THIRD-PARTY-NOTICES.txt). |
| MCL Gallery Cards / Multi Column / Wide Views | Faiz Khuzaimah (@efemkay), [GPL-3.0 source](https://github.com/efemkay/obsidian-modular-css-layout/tree/1db5920dfb5d557570aac37a5e368b82613daef7). Gallery Cards matches after line-ending normalization; Wide Views matches exactly. Multi Column differs only in its draft version comment. Editable CSS and full GPL text are supplied. |
| AnuPpuccin CSS snippets | `custom-background`, `custom-rainbow-colors` and `notion-cards` explicitly declare AGPLv3. `its-frontmatter` and `extended-colorschemes` come from the GPL theme. Their original headers and editable SCSS are retained. The local rainbow snippet contains inherited changes. |
| Minimal Cards 3.0.0 | MIT; @kepano's header is retained. Matches the snippet in the AnuPpuccin version reference after line-ending normalization. The full MIT text is supplied with the snippet notices. |
| Gradient Callouts | The header credits Elevict. The file matches the copy in the original [Dusk template archive](https://github.com/DuskWasHere/dusk-obsidian-vault/tree/69fd1e725e21557b9eb7d706ccaa0834288085cb), apart from line endings. A separate author permission notice has not been confirmed; Dusk's MIT license is not asserted to resolve it. |
| Template CSS | `base`, `datacore-classes`, `datacore-table-polish`, `file-explorer-wrap`, `homepage`, `mobile` and `show-hover-title` are maintained with the template. Root [LICENSE](../../LICENSE) and existing credits are retained. |
| Four `SYSTEM/BANNER/banner-*.png` images | The maintainer confirmed they were generated, rather than downloaded third-party illustrations. No generator, generation records or provider-specific terms were reviewed. Images were not changed. |
| `SYSTEM/DESIGN/search.gif` | Matches the original Dusk archive after byte comparison. Dusk attribution and the root MIT notice are retained. |
| Architecture SVG | Maintained with the original template documentation under the root MIT license. |

The full CSS license texts and file mappings are in [snippets/THIRD-PARTY-NOTICES.txt](../../.obsidian/snippets/THIRD-PARTY-NOTICES.txt). AnuPpuccin is by [AnubisNekhet](https://github.com/AnubisNekhet/AnuPpuccin); [support the author](https://www.buymeacoffee.com/anubisnekhet). Minimal is by [@kepano](https://github.com/kepano); [support the author](https://www.buymeacoffee.com/kepano).

No standalone font files, `@font-face` declarations or common embedded/remote font payloads were found in the inspected CSS/SCSS. Fonts recommended in a theme README are not bundled font files. The scan does not cover fonts installed with Obsidian or the operating system.

The theme's upstream preview images and inherited source/cache files were retained without redesign or cleanup. Their presence is not a new claim of independent asset authorship. Complete upstream artwork provenance and AnuPpuccin rebuild verification remain outside this bounded review. If redistributing a modified theme or snippet separately, carry its own notices and corresponding source with it.
