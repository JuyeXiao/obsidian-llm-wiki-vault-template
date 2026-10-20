# AGENTS.md

Shared rules for Codex and Claude Code in this public vault template.

## Repository overview

This is an Obsidian vault **template** for personal knowledge management, built on two complementary methodologies plus an AI layer:

- **PARA** — Projects, Areas, Resources, Archives (action-oriented work).
- **Zettelkasten (ZETA)** — Permanent, Literature, Fleeting, Reference (idea-oriented thinking).
- **LLM Wiki** — an LLM-owned knowledge base in `INBOX/` (`raw` → `wiki` → `schema`).

This is a knowledge-management template, not an application build. Shared dashboard logic and maintenance scripts have regression tests; run the relevant tests and doc/configuration checks described in `SYSTEM/DOCS/agent-workflows.md`.

## Structure & navigation

- `HUB/Homepage.md` — primary entry point (Datacore dashboard).
- `HUB/MOC/` — Permanent, Literature, Projects, Areas and Sources dashboards.
- `HUB/Map of Content.md` — compatibility navigation page for older links.
- `PARA/` — Projects / Areas / Resources / Archives / Workstation.
- `ZETA/` — Permanent / Literature / Fleeting / Reference.
- `INBOX/` — the LLM Wiki system (see below).
- `DAILY/` — Daily / Weekly / Monthly / Quarterly / Yearly journals.
- `SYSTEM/` — `TEMPLATE/` (note templates), `TAGS/` (tag system SSOT), `SCRIPTS/` (`datacore_helpers.md` powers the dashboards).
- `SYSTEM/DOCS/` — human-facing documentation (English + `SYSTEM/DOCS/zh/`).

## Conventions

- **Note `type` frontmatter is load-bearing**: dashboards query by `type` (e.g. `area_family`, `project_note`, `wiki_concept`). Don't rename type values without updating `SYSTEM/SCRIPTS/datacore_helpers.md` and the templates.
- **Linking**: PARA links within PARA, ZETA within ZETA; cross-system links are intentional. Use bare `[[links]]` only when vault-unique; use vault-relative paths for ambiguous names and raw/literature pairs.
- **Content language** can be anything; the **structure, templates, and docs are English-first**.
- **Authorization / manual backup**: read `SYSTEM/DOCS/agent-workflows.md`. Content writes do not authorize staging, commit or push. Query/lint default to read-only without logs. Preserve unrelated staged/dirty work and concurrent changes; authorized commits use an exact file list, never directory staging. Existing authorization remains valid. Journal reviews have no automatic Git exception.

## LLM Wiki system (`INBOX/`)

A system **owned and maintained by the LLM**, separate from the human-written PARA/ZETA:

- `INBOX/raw/` — immutable sources (clippings / books / podcasts). **Entirely read-only to Wiki ingest/query/lint**, including frontmatter and filenames. Capture/tag is an independently authorized prerequisite.
- `INBOX/wiki/` — LLM-authored, interlinked synthesis pages + `index.md` + `log.md`. The user reads; the LLM writes.
- `INBOX/schema/wiki-schema.md` — the operating rules.

**Before any ingest / query / lint on `raw` or `wiki`, read [`INBOX/schema/wiki-schema.md`](INBOX/schema/wiki-schema.md) and follow it.** Core rule: the wiki workflow only writes `INBOX/wiki/`, never modifies `raw/` bodies, filenames or frontmatter, and never writes `PARA/ZETA/DAILY/HUB/SYSTEM`. Wiki page `type` uses the `wiki_*` namespace.

## Tagging system (`SYSTEM/TAGS/` · `/tag`)

Writes three frontmatter fields: `tags` (controlled, from the tag library), `keywords` (free), `summary`. **Single source of truth = `SYSTEM/TAGS/`**: [`tag-spec.md`](SYSTEM/TAGS/tag-spec.md) + `tag-library.md` + `keywords-summary-spec.md`.

**Before any tagging / lint on `PARA` / `ZETA` / `INBOX/raw`, read `SYSTEM/TAGS/tag-spec.md` and follow it.** Core rule: merge (never overwrite human values); write only the three frontmatter fields, not the body; new tags must be added back to `tag-library.md`. Write scope is `PARA` / `ZETA` / `INBOX/raw`, excluding `SYSTEM` / `DAILY` / `HUB` / `.agents` / `.codex` / `.claude` / `docs` / `INBOX/wiki` / `INBOX/schema`.

## Skills (`.agents/skills/`)

`.agents/skills/` is the only editable skill source. `.claude/skills/` is a generated, byte-identical mirror. Run `python SYSTEM/SCRIPTS/sync_agent_skills.py --write` after source edits, then the mirror check and `/doc-lint`. Never edit mirror bodies independently.

- **Permanent thinking**: `/distill` (new notes or precise updates; user viewpoint ownership).
- **Manual backup**: `/vault-git` (bare invocation is read-only; explicit scoped authorization for commit and push).

- **LLM Wiki**: `/wiki-ingest`, `/wiki-query`, `/wiki-lint`
- **Tagging**: `/tag`, `/tag-lint` (read-only vocabulary health check; rebuilding `SYSTEM/TAGS/tag-library.flat.txt` for the write-guard is a separate authorized action)
- **Docs**: `/doc-lint` (health-check these human-facing docs against the vault's real state — skill registry / wiki cluster wiring / path references / EN↔zh parity)
- **Clip digest**: `/clip-digest` (turns `INBOX/raw/Clippings` into `ZETA/LITERATURE` literature notes)
- **Journaling rituals**: `/morning-start`, `/daily-review`, `/weekly-start`, `/weekly-review`, `/monthly-start`, `/monthly-review` (guided planning & review of the periodic notes in `DAILY/`)
- **Red team**: `/vault-challenge` (argues against the user's current claim using their own vault history — DAILY reviews / PARA decisions & archives / PERMANENT positions; four-part output, **strictly read-only, never writes DAILY**; saves to `STICKY/` only when the user explicitly asks)

## Write validation and maintenance

Codex uses `.codex/hooks.json`; Claude uses `.claude/settings.json`. Both launch the shared `SYSTEM/SCRIPTS/validate-vault-write.js` checker through platform entrypoints. It checks touched Markdown and warns without reverting writes. Read `SYSTEM/DOCS/agent-workflows.md` for supported payloads, runtime limits and exact checks. Shell/file-writing tools outside the configured matchers are not automatically covered.

Wiki validation uses the same English `## Sources` parser and page contract as full lint. PARA/ZETA validation uses `SYSTEM/TAGS/tag-spec.md` and `tag-library.flat.txt`; raw, quick capture and Excalidraw exemptions stay explicit. Correct warnings, never bypass them.

New structural pages must be added to `SYSTEM/Vault Sort Order.md`; ask the user to run **sort-on** after navigation changes. New literature/raw files already use metadata sorting.

Use existing dependencies or standard libraries. Tests belong in isolated fixtures or temporary Git repositories; never use a personal vault as a fixture. Keep raw/literature/Wiki content, user positions, Git actions and actual UI/agent acceptance separate. Default to the main agent; do not delegate unless the user requests it.
