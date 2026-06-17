# Obsidian LLM-Wiki Vault

An Obsidian vault template that pairs [PARA](https://fortelabs.com/blog/para/) and [Zettelkasten](https://en.wikipedia.org/wiki/Zettelkasten) with an AI layer: a wiki that [Claude Code](https://claude.com/claude-code) helps maintain, plus [Datacore](https://github.com/blacksmithgu/datacore) dashboards that stay up to date on their own.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) ![Obsidian](https://img.shields.io/badge/Obsidian-vault-7c3aed) English · [中文](README.zh-CN.md)

![Architecture](SYSTEM/DOCS/assets/architecture.svg)

> A template: it ships with the structure, note templates, dashboards, tagging system, and AI workflows — but no personal notes and no third-party content. Click **Use this template** (or clone it), open it in Obsidian, and fill it with your own work.

## What's different

Most "PARA vaults" are just a folder layout. What sets this one apart is the AI layer — the knowledge base doesn't only sit there, an LLM helps look after it.

- **LLM Wiki** — a `raw → wiki → schema` setup run by a few Claude Code skills (`ingest` / `query` / `lint`). You drop sources in; the agent reads them, writes interlinked wiki pages, and keeps them cross-referenced, deduplicated, and current. Based on [Karpathy's "LLM Wiki" pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).
- **Tagging** — three frontmatter fields per note: `tags` (from a controlled vocabulary), `keywords` (free), and `summary`. Written in one pass over the note, and only filled in — never overwriting what you wrote by hand.
- **Datacore dashboards** — the Homepage, the Maps of Content, and each area/project page are queried live from your notes, so there's no list to maintain by hand.
- **PARA × Zettelkasten** — things to do (PARA) and things to think about (ZETA) live as two separate systems.
- **Templates** for every note type: projects, areas, literature, permanent, fleeting, meetings, and daily/weekly/monthly journals.
- **Note toolbar and page tasks** — a per-folder toolbar at the top of every note, plus whole notes that act as to-dos, collected in the Mail Box. See [SYSTEM/DOCS/interface.md](SYSTEM/DOCS/interface.md).

## Structure

```
PARA/      Things to do: Projects · Areas · Resources · Archives · Workstation
ZETA/      Things to think about (Zettelkasten): Permanent · Literature · Fleeting · Reference
INBOX/     LLM Wiki: raw (immutable sources) · wiki (LLM-owned) · schema (rules)
DAILY/     Journals: Daily · Weekly · Monthly · Quarterly · Yearly
HUB/       Navigation: Homepage · Map of Content · MOCs · dashboards
SYSTEM/    Templates · tag system · scripts · docs (English + 中文)
.claude/   Claude Code skills (the AI layer)
```

For why PARA and ZETA are kept apart, see [SYSTEM/DOCS/structure.md](SYSTEM/DOCS/structure.md).

## The AI layer

Two subsystems, both run through [Claude Code](https://claude.com/claude-code):

| System | What it does | Skills | Rules (SSOT) |
|---|---|---|---|
| **LLM Wiki** | Turns the sources in `INBOX/raw` into an interlinked synthesis in `INBOX/wiki` | `/wiki-ingest` · `/wiki-query` · `/wiki-lint` | [INBOX/schema/wiki-schema.md](INBOX/schema/wiki-schema.md) |
| **Tagging** | Writes `tags` / `keywords` / `summary` into a note's frontmatter | `/tag` | [SYSTEM/TAGS/tag-spec.md](SYSTEM/TAGS/tag-spec.md) |
| **Clip digest** | Turns a web clipping into a literature note in `ZETA/LITERATURE` | `/clip-digest` | — |
| **Journaling** | Walks you through planning and reviewing your daily / weekly / monthly notes | `/morning-start` · `/daily-review` · `/weekly-start` · `/weekly-review` · `/monthly-start` · `/monthly-review` | — |

Full walkthrough: [SYSTEM/DOCS/llm-wiki.md](SYSTEM/DOCS/llm-wiki.md).

## Getting started

1. Click **Use this template** (or `git clone`), then open the folder as a vault in Obsidian.
2. **Trust the vault** when asked — the dashboards run Datacore JSX.
3. **Install the community plugins** the dashboards depend on (see [Plugins](#plugins)). They're preconfigured but not bundled.
4. Open **`HUB/Homepage.md`** — that's your starting point.
5. Optional: to use the AI layer, open the vault in Claude Code and try `/wiki-ingest`, `/tag`, or `/clip-digest`.

More detail: [SYSTEM/DOCS/getting-started.md](SYSTEM/DOCS/getting-started.md).

## Plugins

Core dependencies (already configured under `.obsidian/`; install them from Community Plugins):

- **[Datacore](https://github.com/blacksmithgu/datacore)** (required — every dashboard runs on it), **[Dataview](https://github.com/blacksmithgu/obsidian-dataview)**, **[Templater](https://github.com/SilentVoid13/Templater)**, **[Meta Bind](https://github.com/mProjectsCode/obsidian-meta-bind-plugin)**, a periodic-notes plugin (e.g. **Journals**), plus a few quality-of-life plugins. The full list is in `.obsidian/community-plugins.json`.

> The plugin code under `.obsidian/plugins/` belongs to each plugin's author and follows its own license; this repo's MIT license covers only the original template content.

## Notes on the design

- **PARA vs ZETA.** Keep work and skills (PARA) apart from ideas and concepts (ZETA). By default you link within each system; cross-links are something you make deliberately.
- **Why let an LLM maintain the wiki.** The tiring part of a knowledge base isn't the reading or thinking — it's the bookkeeping: updating cross-references, keeping summaries current, flagging contradictions. An LLM does that for next to nothing, which is the only reason the wiki actually stays current. See [SYSTEM/DOCS/llm-wiki.md](SYSTEM/DOCS/llm-wiki.md).
- **Dashboards instead of hand-written indexes.** Notes carry a `type` and tags; Datacore turns that into live views, so you never maintain a list yourself.

## Credits

- Started from [dusk-obsidian-vault](https://github.com/DuskWasHere/dusk-obsidian-vault) by DuskWasHere (MIT), then heavily restructured and extended.
- The LLM Wiki layer follows [Andrej Karpathy's "LLM Wiki" gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

## License

[MIT](LICENSE) — covers the original template content (structure, templates, scripts, docs). Third-party plugins, themes, and fonts stay under their own licenses.
