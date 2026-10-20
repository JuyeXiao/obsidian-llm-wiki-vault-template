# Plugins: a compact default and optional installs

[中文](zh/plugins.md) · [Versioned license review](plugin-licenses.md)

The template bundles and enables **12 plugins**: seven workflow dependencies, Homepage and Custom Sort, and three appearance helpers (Iconic, Banners, Style Settings). Their existing versions, programs, notices and required settings are retained. The other 42 plugins from the older bundle are no longer shipped or enabled. This is not a bulk plugin upgrade.

## Included plugins

| Plugin | ID | Bundled version | Purpose |
|---|---|---|---|
| Custom File Explorer sorting | `custom-sort` | 3.1.6 | Curated file-explorer order |
| Datacore | `datacore` | 0.1.29 | Dashboards, five MOCs, Mail Box and relation views |
| Dataview | `dataview` | 0.5.68 | Meta Bind directory queries and existing Dataview views |
| Homepage | `homepage` | 4.4.2 | Open the configured home page at startup |
| Iconic | `iconic` | 1.1.9 | File and page-task icons |
| Journals | `journals` | 2.1.10 | Periodic notes, date ranges and calendar navigation |
| Note Toolbar | `note-toolbar` | 1.32.15 | Folder toolbars and navigation |
| Banners | `obsidian-banners` | 1.3.3 | Existing page banners |
| Meta Bind | `obsidian-meta-bind-plugin` | 1.4.12 | Relation selectors and metadata inputs |
| Style Settings | `obsidian-style-settings` | 1.0.9 | Existing theme and snippet options |
| QuickAdd | `quickadd` | 2.12.2 | Note creation and capture commands |
| Templater | `templater-obsidian` | 2.20.5 | Template rendering and page-task command |

## Optional installation

Install only a feature you need: **Settings → Community plugins → Browse → search by plugin name → Install → Enable**. Use the upstream repository below if a plugin is not listed; review its instructions and terms. See [Obsidian's official installation guide](https://obsidian.md/help/community-plugins). Optional installation is performed in your own vault; the template does not install these automatically or configure accounts.

- Search and quick switching use Obsidian's built-in commands. `Mod+Shift+F` opens vault search; `Mod+Shift+S` opens Quick Switcher. The old Quick Explorer shortcut is removed; use the built-in file explorer.
- Use Markdown checkboxes for line tasks and Mail Box for page tasks. Install Tasks for its additional query/recurrence features. The old Timeline code was retired; its Tasks Manager note links to Mail Box.
- Core Wiki, tag, distill and Git skills run in your own Codex/Claude Code environment. They do not require Smart Connections, AI Providers or Claudian. Claudian is an optional separate interface, not the Claude CLI itself.
- JS Engine is not required by the shipped Meta Bind input selectors or ordinary view fields. Install it only when adding Meta Bind JavaScript views/actions or JS Engine code blocks.
- No Charts, Charts View, Tracker, Tabs, Kanban or Advanced Canvas content is required by the current examples. Install one only for content you add.
- Homepage opens in Reading view. Folder-based view forcing is removed; use Obsidian's native Reading/Live Preview/Source mode controls. Home Tab is removed, so new tabs use the native empty view.

The list below is a migration reference, not an endorsement or a requirement. Optional plugins have not been accepted as part of the reduced bundle; check current compatibility and licensing before redistributing any added code.

| Optional plugin | ID | Upstream installation and terms |
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

## Updating an older copy

Back up personal plugin settings before uninstalling. Merge the enabled list, toolbar and hotkeys; do not erase unrelated user settings. Removed plugin directories may contain user configuration. The current template removes their programs and bundled settings, but does not rewrite old Git commits or releases. See [migration](migration.md).

Keep the 12 bundled versions while testing this update. Re-run document/configuration checks and test dashboards, relation saving, Mail Box, journals and toolbar navigation after changing plugins. Keep all notices for redistributed code; the [license review](plugin-licenses.md) still has open source-delivery/dependency conditions.
