# Obsidian LLM-Wiki Vault

An Obsidian vault template that pairs [PARA](https://fortelabs.com/blog/para/) and [Zettelkasten](https://en.wikipedia.org/wiki/Zettelkasten) with an AI layer: a wiki that Codex or [Claude Code](https://claude.com/claude-code) helps maintain, plus [Datacore](https://github.com/blacksmithgu/datacore) dashboards that stay up to date on their own.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE) ![Obsidian](https://img.shields.io/badge/Obsidian-vault-7c3aed) English · [中文](README.zh-CN.md)

![Architecture](SYSTEM/DOCS/assets/architecture.svg)

> A template: it ships with the structure, note templates, dashboards, tagging system, and AI workflows — with generic example notes and bundled third-party plugin/theme code under its own licenses. Clone it or download the ZIP, open it in Obsidian, and add your own work.

## What's different

Most "PARA vaults" are just a folder layout. What sets this one apart is the AI layer — the knowledge base doesn't only sit there, an LLM helps look after it.

- **LLM Wiki** — a `raw → wiki → schema` setup run by shared Codex/Claude skills (`ingest` / `query` / `lint`). You drop sources in; the agent reads them, writes interlinked wiki pages, and keeps them cross-referenced, deduplicated, and current. Based on [Karpathy's "LLM Wiki" pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).
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
HUB/       Navigation: Homepage · Permanent / Literature / Projects / Areas / Sources MOCs
SYSTEM/    Templates · tag system · scripts · docs (English + 中文)
.agents/   Shared skill source (16 skills)
.claude/   Generated skill mirror + Claude hook
.codex/    Codex write-validation hook
```

For why PARA and ZETA are kept apart, see [SYSTEM/DOCS/structure.md](SYSTEM/DOCS/structure.md).

## The AI layer

The **16 skills** below share one source in `.agents/skills/` for Codex and Claude Code. Claude uses a generated mirror. See [agent setup](SYSTEM/DOCS/agent-workflows.md).

| System | What it does | Skills | Rules (SSOT) |
|---|---|---|---|
| **LLM Wiki** | Turns the sources in `INBOX/raw` into an interlinked synthesis in `INBOX/wiki` | `/wiki-ingest` · `/wiki-query` · `/wiki-lint` | [INBOX/schema/wiki-schema.md](INBOX/schema/wiki-schema.md) |
| **Tagging** | Writes `tags` / `keywords` / `summary` into a note's frontmatter | `/tag` · `/tag-lint` | [SYSTEM/TAGS/tag-spec.md](SYSTEM/TAGS/tag-spec.md) |
| **Clip digest** | Turns a web clipping into a literature note in `ZETA/LITERATURE` | `/clip-digest` | [Literature contract](SYSTEM/TEMPLATE/FORMAT/literature-note-spec.md) |
| **Permanent thinking** | Forms a new note or precisely refines an existing one; preserves user viewpoint ownership | `/distill` | [By need](SYSTEM/DOCS/by-need.md) |
| **Manual backup** | Read-only Git inventory and grouping; exact commit/push only when authorized | `/vault-git` | [Agent contract](SYSTEM/DOCS/agent-workflows.md) |
| **Journaling** | Walks you through planning and reviewing your daily / weekly / monthly notes | `/morning-start` · `/daily-review` · `/weekly-start` · `/weekly-review` · `/monthly-start` · `/monthly-review` | [Journal contract](SYSTEM/DOCS/agent-workflows.md) |
| **Red team** | Argues against your current idea using **your own vault history** (reviews, decisions, archived projects, positions); read-only, never agreeable | `/vault-challenge` | — |
| **Docs** | Checks these docs against what the vault actually is — registry / cluster wiring / path references / EN↔zh parity | `/doc-lint` | — |

Both agents have **warning-only write hooks**, wired to one shared checker for matched Write/Edit/apply_patch payloads. Wiki contracts include type-specific `## Sources` and real counts; PARA/ZETA checks require tagging fields. Hooks never revert a write and do not cover arbitrary shell writes. Full source-state/index checks run separately. See [setup and runtime limits](SYSTEM/DOCS/agent-workflows.md).

Full walkthrough: [SYSTEM/DOCS/llm-wiki.md](SYSTEM/DOCS/llm-wiki.md).

## Getting started

1. Clone [the repository](https://github.com/JuyeXiao/obsidian-llm-wiki-vault-template) or use **Code → Download ZIP** and extract it; open that folder as a vault in Obsidian. Installation does not require a **Use this template** button.
2. **Trust the vault** when asked — the dashboards run Datacore JSX.
3. **Review and enable the bundled community plugins** needed for your workflows (see [Plugins](#plugins)); plugin programs and configuration are included. Install a missing dependency only if your copy lacks it.
4. Open **`HUB/Homepage.md`** — that's your starting point.
5. Optional: open the vault in Codex or Claude Code. See [Choose a workflow](SYSTEM/DOCS/by-need.md) for article → literature → permanent and raw → Wiki examples. Capture a source, run `/tag` for its routing metadata, then request `/wiki-ingest`; `/clip-digest` creates a separate literature note. Query/lint are read-only by default. Content writes never authorize Git delivery.

More detail: [Getting started](SYSTEM/DOCS/getting-started.md) · [By need and original example](SYSTEM/DOCS/by-need.md) · [Source governance](SYSTEM/DOCS/source-governance.md) · [Upgrade an older vault](SYSTEM/DOCS/migration.md).

Maintenance uses Node.js 18+, Python 3.10+ and Git; existing tag scripts also need Bash, ripgrep, sed and awk. Use your own agent installation/account. No new package install is required; see [dependencies and checks](SYSTEM/DOCS/agent-workflows.md).

## Plugins

The default bundle enables **12 plugins**, retaining their existing versions:

- **Seven workflow dependencies:** Datacore, Dataview, Meta Bind, Templater, Journals, QuickAdd and Note Toolbar.
- **Navigation and appearance:** Homepage, Custom Sort, Iconic, Banners and Style Settings.
- The other **42 plugins have been removed** from the older bundle; install optional features upstream when needed. Search and Quick Switcher use native Obsidian commands. Codex/Claude skills do not require an in-vault AI plugin.

See the [full list and installation guide](SYSTEM/DOCS/plugins.md) and [migration notes](SYSTEM/DOCS/migration.md). Programs and required settings are in `.obsidian/plugins/`; `.obsidian/community-plugins.json` is the enabled list.

> **Redistribution review remains pending:** retained licenses and component notices are included, but five projects' source-delivery conditions, two license-metadata conflicts and dependency evidence remain open. See the [current 12-plugin license review](SYSTEM/DOCS/plugin-licenses.md). The template's MIT license does not cover third-party code.

## Notes on the design

- **PARA vs ZETA.** Keep work and skills (PARA) apart from ideas and concepts (ZETA). By default you link within each system; cross-links are something you make deliberately.
- **Why let an LLM maintain the wiki.** The tiring part of a knowledge base isn't the reading or thinking — it's the bookkeeping: updating cross-references, keeping summaries current, flagging contradictions. The agent proposes content; deterministic checks verify sources, counts and decisions. Semantic review and explicit maintenance still matter. See [SYSTEM/DOCS/llm-wiki.md](SYSTEM/DOCS/llm-wiki.md).
- **Dashboards instead of hand-written indexes.** Notes carry a `type` and tags; Datacore turns that into live views, so you never maintain a list yourself.

## Credits

- Started from [dusk-obsidian-vault](https://github.com/DuskWasHere/dusk-obsidian-vault) by DuskWasHere (MIT), then heavily restructured and extended.
- The LLM Wiki layer follows [Andrej Karpathy's "LLM Wiki" gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

- The AnuPpuccin theme and its snippets are by [AnubisNekhet](https://github.com/AnubisNekhet/AnuPpuccin); [support the author](https://www.buymeacoffee.com/anubisnekhet).

## License

[MIT](LICENSE) — covers the original template content (structure, templates, scripts, docs). Third-party plugins, themes, and fonts stay under their own licenses.

See [theme, CSS and image provenance](SYSTEM/DOCS/asset-licenses.md) for retained notices and review limits.
