# CLAUDE.md

Guidance for Claude Code (claude.com/claude-code) when working in this vault.

## Repository overview

This is an Obsidian vault **template** for personal knowledge management, built on two complementary methodologies plus an AI layer:

- **PARA** — Projects, Areas, Resources, Archives (action-oriented work).
- **Zettelkasten (ZETA)** — Permanent, Literature, Fleeting, Reference (idea-oriented thinking).
- **LLM Wiki** — an LLM-owned knowledge base in `INBOX/` (`raw` → `wiki` → `schema`).

It is not a software project: there is no build, test, or deploy step. Work is content organization, linking, and Markdown.

## Structure & navigation

- `HUB/Homepage.md` — primary entry point (Datacore dashboard).
- `HUB/Map of Content.md` — dynamic index of all notes (includes wiki pages).
- `PARA/` — Projects / Areas / Resources / Archives / Workstation.
- `ZETA/` — Permanent / Literature / Fleeting / Reference.
- `INBOX/` — the LLM Wiki system (see below).
- `DAILY/` — Daily / Weekly / Monthly / Quarterly / Yearly journals.
- `SYSTEM/` — `TEMPLATE/` (note templates), `TAGS/` (tag system SSOT), `SCRIPTS/` (`datacore_helpers.md` powers the dashboards).
- `SYSTEM/DOCS/` — human-facing documentation (English + `SYSTEM/DOCS/zh/`).

## Conventions

- **Note `type` frontmatter is load-bearing**: dashboards query by `type` (e.g. `area_family`, `project_note`, `wiki_concept`). Don't rename type values without updating `SYSTEM/SCRIPTS/datacore_helpers.md` and the templates.
- **Linking**: PARA links within PARA, ZETA within ZETA; cross-system links are intentional. Use by-name `[[links]]`.
- **Content language** can be anything; the **structure, templates, and docs are English-first**.
- **Manual backup**: there is no auto-commit. After changing the vault, `git add` + commit with a concise message, and **prompt before pushing** (don't auto-push).

## LLM Wiki system (`INBOX/`)

A system **owned and maintained by the LLM**, separate from the human-written PARA/ZETA:

- `INBOX/raw/` — immutable sources (clippings / books / podcasts). **Read-only** (the only write is adding the three tagging frontmatter fields during ingest).
- `INBOX/wiki/` — LLM-authored, interlinked synthesis pages + `index.md` + `log.md`. The user reads; the LLM writes.
- `INBOX/schema/wiki-schema.md` — the operating rules.

**Before any ingest / query / lint on `raw` or `wiki`, read [`INBOX/schema/wiki-schema.md`](INBOX/schema/wiki-schema.md) and follow it.** Core rule: the wiki workflow only writes `INBOX/wiki/`, never modifies `raw/` bodies, and never writes `PARA/ZETA/DAILY/HUB/SYSTEM`. Wiki page `type` uses the `wiki_*` namespace.

## Tagging system (`SYSTEM/TAGS/` · `/tag`)

Writes three frontmatter fields: `tags` (controlled, from the tag library), `keywords` (free), `summary`. **Single source of truth = `SYSTEM/TAGS/`**: [`tag-spec.md`](SYSTEM/TAGS/tag-spec.md) + `tag-library.md` + `keywords-summary-spec.md`.

**Before any tagging / lint on `PARA` / `ZETA` / `INBOX/raw`, read `SYSTEM/TAGS/tag-spec.md` and follow it.** Core rule: merge (never overwrite human values); write only the three frontmatter fields, not the body; new tags must be added back to `tag-library.md`. Write scope is `PARA` / `ZETA` / `INBOX/raw`, excluding `SYSTEM` / `DAILY` / `HUB` / `.claude` / `docs` / `INBOX/wiki` / `INBOX/schema`.

## Skills (`.claude/skills/`)

- **LLM Wiki**: `/wiki-ingest`, `/wiki-query`, `/wiki-lint`
- **Tagging**: `/tag`
- **Clip digest**: `/clip-digest` (turns `INBOX/raw/Clippings` into `ZETA/LITERATURE` literature notes)
- **Journaling rituals**: `/morning-start`, `/daily-review`, `/weekly-start`, `/weekly-review`, `/monthly-start`, `/monthly-review` (guided planning & review of the periodic notes in `DAILY/`)
- **Red team**: `/vault-challenge` (argues against the user's current claim using their own vault history — DAILY reviews / PARA decisions & archives / PERMANENT positions; four-part output, **strictly read-only, never writes DAILY**; saves to `STICKY/` only when the user explicitly asks)

There is also a **write-guard hook** (`.claude/hooks/validate-vault-write.py`, wired as a PostToolUse Write|Edit hook in `.claude/settings.json`): writes to `INBOX/wiki` are checked for a `wiki_*` type / a `wiki/<cluster>` tag / a `## Sources` section; writes to `PARA`/`ZETA` are checked for the three tagging fields (plus topic-tag drift, if `SYSTEM/TAGS/tag-library.flat.txt` exists). **Warning-only** (exit 2 feeds warnings back without reverting the write) — when you see its warnings, fix the note rather than working around it; `ZETA/FLEETING`, `PARA/WORKSTATION`, `*.excalidraw.md` and `INBOX/raw` are exempt.
