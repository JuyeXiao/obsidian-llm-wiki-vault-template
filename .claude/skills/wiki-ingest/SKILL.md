---
name: wiki-ingest
description: Ingest new sources from INBOX/raw into the LLM Wiki (INBOX/wiki) — route by topic tag to a cluster, build/enrich concept pages as hubs, maintain index/log, run a mini-lint, and commit. Triggers when the user says "add this/these to the wiki", "ingest into the wiki", "ingest today's new clippings / add everything I clipped today", "incremental ingest", "ingest", or invokes /wiki-ingest (optionally with `today`).
---

# LLM Wiki · Ingest (absorb new sources)

Your job is to absorb sources in `INBOX/raw/` into interlinked synthesis pages under `INBOX/wiki/`. This skill is the **runbook**; the **single source of truth for the rules is [`INBOX/schema/wiki-schema.md`](INBOX/schema/wiki-schema.md)**.

## Iron rules (memorize first)
- **Write only to `INBOX/wiki/`**; `raw/` **body is read-only** (never edit/delete/rename source bodies). **Sole exception**: during ingest, use the `/tag` skill to fill the three frontmatter fields on the raw source (`tags`/`keywords`/`summary`, see §1). Never write to `PARA/ZETA/DAILY/HUB/SYSTEM`.
- Always link **by name `[[filename]]`** (filenames are unique vault-wide); wiki pages use a `wiki_*` `type`.
- Every wiki page body **must** contain a `## Sources` section linking back with `[[raw source]]` (so sources leave the island and stay traceable).
- **No automatic backup** after changing the vault: when done, commit and **prompt** that a push is possible (do not auto-push).

## Step 0 · Required reading
Read in order: [`INBOX/schema/wiki-schema.md`](INBOX/schema/wiki-schema.md) (rules; it governs), [`INBOX/wiki/index.md`](INBOX/wiki/index.md) (existing pages), [`INBOX/wiki/log.md`](INBOX/wiki/log.md) (progress).

## Source selection (decide what to ingest first)
Two entry points. Pick the `[NEW]` source set, then run them all through steps 1–7 below:
- **Specified note / cluster**: a note the user names, or a cluster via `grep -rlE "topic/<level1>/<level2>" INBOX/raw`.
- **Today's new** (`/wiki-ingest today`, "add everything I clipped today", "ingest today's new"): take sources whose frontmatter `created` is **today** (`<TODAY>` = system `currentDate`, e.g. `2026-06-01`):
  ```bash
  grep -rlE "^created:.*<TODAY>" INBOX/raw --include="*.md" | sort \
    | while IFS= read -r f; do b=$(basename "$f" .md); grep -rqF "[[$b]]" INBOX/wiki/ \
        && echo "[linked] $b" || echo "[NEW]    $b"; done
  ```
  Keep only `[NEW]`. **Today's new articles often span multiple clusters** → group by each one's `topic/<level2>`, run steps 1–4 per group; update each cluster group in `index.md` separately; write **one** `log.md` entry covering the whole batch; finish with **one mini-lint (whole vault, no cluster arg) + one commit**.
  > Limitation: this misses articles "imported today but with an older `created` date" — have the user **name those explicitly** for ingest (or switch to a git/mtime signal).

## Execution flow (a loop verified in practice)

### 1 · Route (run `/tag` first, then route)
Read the source → **first run the `/tag` tagging logic on that raw** (`/tag` follows [[tag-spec]] + [[tag-library]] + [[keywords-summary-spec]]: **merge, never overwrite; write only the three frontmatter fields `tags`/`keywords`/`summary`; never touch the body**; **reuse this same read from the ingest, do not re-read**). If a new source had no `topic`, this step assigns one (routing depends on topic) → then read frontmatter `topic/<level1>/<level2>` → place under `wiki/<cluster>/` (cluster name = the level-2 segment, activated by volume, see §1.1). Multiple level-2 tags → follow §2 "multi-membership": **one home cluster holds the page + multiple `wiki/<cluster>` tags + cross-cluster `[[links]]` from each cluster's pages; never duplicate the same concept**.

### 2 · Enumerate (for a whole cluster / batch)
```bash
grep -rlE "topic/<level1>/<level2>" INBOX/raw --include="*.md" | sort
```
Mark each source `[NEW] / [linked]` (linked = already `[[referenced]]` by some wiki page → **cross-link only, do not re-ingest**):
```bash
... | while IFS= read -r f; do b=$(basename "$f" .md); grep -rqF "[[$b]]" INBOX/wiki/ && echo "[linked] $b" || echo "[NEW]    $b"; done
```

### 3 · Distill (faithful, no fabrication)
Read each `[NEW]` source and **copy the exact basename verbatim** (needed for links). When there are many sources, **fan-out `Explore` sub-agents** by sub-topic (read-only; require them to return the exact basename + faithful key points + concept membership + cross-cluster links + **suggested `tags`/`keywords`/`summary` for that source**; state explicitly "no fabrication; resolve special filenames with Glob"). **Sub-agents read only, never write — the three raw frontmatter fields are merged in by the main agent** from the suggestions (§1 tags first). When a filename contains special characters (`()「」｜&…""` etc.), resolve the exact path with Glob before Read.

### 4 · Build / enrich pages
- **§2.1 three criteria for a concept page**: evergreen + reusable + nameable — all three must hold to create a standalone `wiki_concept`; otherwise merge into an existing page's `## Sources` or create a `wiki_summary`. **Multi-membership = prefer merging into an existing page** rather than starting a new one.
- **Pre-check page-name uniqueness before writing**: `find . -name "<intended page name>.md"`; if >0 (collides with PARA/ZETA or an existing page) → pick a more specific name.
- Body skeleton: `# Title` → `**Core**: one sentence` → `## Sections` → `## Relations` (cross-links between concepts + **cross-cluster backlinks**: edit the existing page's `## Relations` to add a line pointing back to the new page) → `## Sources` (`[[raw]]` wikilinks).
- **Recency markers (schema §2.3)**: volatile external claims (numbers / versions / prices / company news) carry an inline `(as of YYYY-MM, [[source]])`; inferences are marked `(inferred)`; evergreen concepts need no marker. Future reconcile passes use these to decide which claim is newer.
- Frontmatter template at the bottom.

### 5 · Update index / cluster index / log
- `index.md`: under that cluster's `## <cluster>` group, add/update a line `- [[page]] · <type> · <one sentence> · <N> sources` (create the heading if absent; use **bold** sub-headers for sub-topics).
- **`<cluster> Index.md` (cluster-level MOC, if one exists)**: add new concept pages to the right group (inline format `**Group**: [[A]] · [[B]]`). This is the graph hub that the PARA `wiki_hub` points to, and must stay in sync with cluster content; when opening a new cluster you may create one (type `wiki_overview`, `source_count: 0`, body listing all cluster pages inline).
- `log.md`: append one entry `## [YYYY-MM-DD] ingest | <cluster>` with notes below (which pages were created/enriched, which cross-cluster sources were reclaimed, mini-lint result).

### 6 · Mini-lint
```bash
bash .claude/skills/wiki-lint/scripts/wiki-lint.sh <cluster>
```
Goal: **0 broken links**, orphans only on the whitelist, page names unique, all sources resolve to raw. If the lint finds a raw orphan in this cluster → merge it into the appropriate page (pick up any real source that slipped through).

### 7 · Commit
```bash
git add INBOX/wiki/
git commit -m "wiki: ingest <cluster> …"   # commit with a concise message
```
Do **not** stage `.obsidian/*` or `DAILY/*` (app noise / user notes). After committing, **prompt the user that they can push**; do not auto-push.

## Page frontmatter template
```yaml
---
title: <page title>
type: wiki_concept        # wiki_concept | wiki_entity | wiki_overview | wiki_summary
category: <cluster>       # = containing folder name (home cluster)
tags: [wiki/<cluster>]    # cross-cluster pages add more wiki/<cluster>
source_count: <integer>
created: <YYYY-MM-DD>
updated: <YYYY-MM-DD>
status: stable            # draft | stable
---
```
- `wiki_overview` is for a "series of related sources" (series/column/book) reader's guide, **or** a cluster-level index MOC (`<cluster> Index`, body listing all cluster pages inline, `source_count: 0`); standalone articles merge into concept pages + an index group (§2.2).
- `wiki_entity` is for people/orgs/products/tools (e.g. [[Claude Code]]).

## Notes
- **No fabrication**: every key point must be findable in the source; when unsure, go back and Read that source.
- Many special characters in filenames → Glob first, then Read / link; the basenames in `## Sources` must match the raw filename **verbatim**.
- Do not re-ingest `[linked]` sources (cross-link instead); do not force a concept page for a single one-off article (§2.1 guards against proliferation).
- If an Edit to an existing page fails (`old_string` mismatch) → re-Read that section, adjust the anchor, retry; do not silently skip.

## Relationship to other wiki skills
- Health check: `/wiki-lint` (the mini-lint calls its script).
- Question answering + write-back: `/wiki-query`.
- Global rules and cluster layout: [`wiki-schema.md`](INBOX/schema/wiki-schema.md).
