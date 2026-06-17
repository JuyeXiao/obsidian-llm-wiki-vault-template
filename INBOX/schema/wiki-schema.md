---
title: LLM Wiki Schema
type: wiki_schema
cssclasses: [hide-properties_editing, hide-properties_reading]
---

# LLM Wiki Schema

> [!important] Instructions for the LLM agent
> This is the configuration file (schema) for this vault's **LLM Wiki system**. **Read this file first** before doing *any* ingest / query / lint operation on `INBOX/raw` or `INBOX/wiki`, and follow it strictly. The idea behind this system comes from Andrej Karpathy's "LLM Wiki" pattern — see [[llm-wiki]] for the concept and credit.

## 0. What this is / relation to PARA·ZETA

- This is a knowledge base **owned and written by the LLM, read-only for the human**: `raw` (immutable sources) → `wiki` (the LLM's incrementally synthesized, interlinked pages).
- It is a **separate system** from the human-written `PARA/` and `ZETA/`.
- **Hard rules**: the wiki workflow **only writes to `INBOX/wiki/`**; it **never edits / deletes / renames** the body or filename of anything in `raw/`. The **only exception**: during ingest it may add the three frontmatter fields (`tags` / `keywords` / `summary`) to a raw source via `/tag` (see §4). Query / lint treat `raw` as strictly read-only. **Never write** to `PARA/ZETA/DAILY/HUB/SYSTEM`. Cross-linking PARA notes with this content is a *separate task*, not part of this system.

## 1. Directory layout

```
INBOX/
├── raw/       # Immutable sources: clippings / book notes / podcasts / etc. Read-only.
│   ├── Books/  Clippings/  Podcasts/  Videos/  EverythingElse/
├── wiki/      # LLM-owned synthesis pages. The LLM writes; you read.
│   ├── index.md / log.md      # global catalog + timeline, at the wiki root
│   └── <cluster>/             # one folder per topic cluster (folder name = category)
└── schema/    # this config (wiki-schema.md)
```

### 1.1 Topic clusters & routing

- A **cluster = a second-level `topic/` theme**, mapped to one **flat** folder `wiki/<cluster>/` (not the whole nested tag tree).
- **Activate by volume** (only create a cluster once it has enough sources). Generic seed clusters for this template: `Data`, `AI`, `Productivity`, `Career`. Adapt them to your own taxonomy.
- The long tail (niche topics) **stays in `raw`** until it's worth its own cluster.
- **Routing**: on ingest, read the source's `topic/<l1>/<l2>` tag → file it under the matching `wiki/<cluster>/`. A source with several second-level tags → see §2 "multi-home".
- The `category` frontmatter takes the **primary cluster** name (= its folder name).

## 2. Wiki page types & frontmatter

Every wiki page must carry the frontmatter below. `type` **must** use the `wiki_*` namespace (so it never collides with PARA types or gets swept up by the `PARA/AREAS` dashboard):

```yaml
---
title: <page title>
type: wiki_concept        # see table
category: <cluster, e.g. Data>
tags: [wiki/<cluster>]     # wiki/ namespace; cross-cluster pages may list several wiki/<cluster>
source_count: <int>        # number of raw sources this page cites, shown in the index
created: YYYY-MM-DD
updated: YYYY-MM-DD
status: draft | stable
---
```

| type            | purpose                                   | structure |
| --------------- | ----------------------------------------- | --------- |
| `wiki_overview` | **overview / entry point** for a cluster  | grouped by sub-topic; lists the cluster's core pages and all sources `[[…]]` + one line each |
| `wiki_concept`  | a **reusable concept** (e.g. AARRR)       | definition → key points → relations to other concepts → `## Sources` |
| `wiki_entity`   | an **entity** (person/org/product/tool)   | what it is → key facts → related pages → `## Sources` |
| `wiki_summary`  | **single-source summary** (1 raw → 1 page, optional) | summary → key points → `## Sources` (pointing at that raw) |
| `wiki_index`    | `index.md` / `log.md` only                | see §3 |

> [!warning] Linking rules
> - Always link **by name** `[[filename]]` (filenames are unique in this vault). Do **not** use fragile full-path links.
> - New wiki pages go under their cluster folder `wiki/<category>/`; **filenames must be vault-unique** — for a same-named concept across clusters, pick a more specific name.
> - Every wiki page body **must** contain a `## Sources` section linking back to the `[[raw source]]` it synthesizes — this keeps sources out of graph isolation and keeps everything traceable.
> - Concept / entity pages should actively **cross-link** with `[[…]]`.

> [!warning] Multi-home (a source / concept spanning clusters)
> Knowledge is a graph, not a tree. Multi-homing is done **with links + tags, never by copying**:
> - **Source spans clusters** → keep one copy in `raw`; let **pages in multiple clusters `[[link]]`** it.
> - **Concept spans clusters** → build the concept page **once**, in its **primary cluster** folder + tag it with **multiple** `wiki/<cluster>` + cross-link from each cluster's pages. **Never duplicate** a concept (the copies would diverge and contradict).
> - **Primary cluster** = the concept's most central home; picking wrong just moves a file, it doesn't break links (by-name links are folder-independent).

### 2.1 When to promote something into a `wiki_concept` page

Create a standalone `wiki_concept` only when all three hold:
- **Evergreen**: a general mental model / method that holds independent of any one article's example.
- **Reused / recurring**: expected to be cited or deepened by **multiple** sources — reuse is the *primary* signal.
- **Nameable**: has a clear term.

**Counter-examples (do NOT make a standalone page)**: a single article's one-off case → fold into the cluster `wiki_overview` or a `wiki_summary`; a point that appears once and won't recur → leave it in the source/summary until it recurs.

### 2.2 When to build an overview

- `wiki_overview` is built **only for a coherent set of sources** (a series / column / book), not for a single article.
- **Standalone articles are folded into existing concept pages on ingest** (into their `## Sources`, enriching points as needed); only add a new concept page when existing ones don't fit.
- A new **series** of sources → a new sibling overview; don't pour unrelated articles into an existing series overview.

## 3. Two special files

**`wiki/index.md` (content catalog)**: one line per wiki page — `[[page]] · <type> · <one line> · <source count>`, grouped by `category`. Updated on every ingest.

**`wiki/log.md` (timeline, append-only)**: entries formatted `## [YYYY-MM-DD] ingest|query|lint | title`, with optional notes below. Greppable: `grep "^## \[" log.md | tail`.

> Global search still goes through `HUB/Map of Content.md` (dynamic Datacore, already includes wiki pages); the wiki's own navigation goes through `index.md`.

## 4. The three workflow SOPs

### Ingest (absorb a new source)
1. The source is already in `raw/`. Read it; confirm key points and classification with the user.
2. **Run `/tag` first (same read, saves tokens)**: apply `/tag` to that raw file (follow [[tag-spec]] + [[tag-library]] + [[keywords-summary-spec]]; **merge, never overwrite; write only the three frontmatter fields; never touch the body**). If a new clipping has no `topic`, this step assigns one (routing depends on it).
3. **Route by the source's `topic/.../<l2>` tag** to `wiki/<cluster>/` (§1.1); multi-tag sources follow §2 multi-home.
4. In that cluster: build/enrich `wiki_concept`/`wiki_entity` per §2.1; add a `wiki_summary` if useful; maintain the cluster `wiki_overview` entry.
5. Complete each page's frontmatter + `## Sources` back-links + cross-links.
6. Update `index.md`; append an `ingest` entry to `log.md`.

### Query (ask questions)
1. Read `index.md` (or Map of Content) to locate relevant pages → read them (trace back to raw if needed).
2. Synthesize an answer with `[[citations]]`.
3. **File valuable answers back** as new wiki pages (concept/entity/summary); update the index (log optional).

### Lint (health check)
1. Scan `raw/` for orphan sources **not yet cited by any wiki page**.
2. Check for: contradictions between pages, stale claims superseded by newer sources, orphan wiki pages (no inbound links), missing concept pages, missing cross-references, data gaps a web search could fill.
3. **Data hygiene**: clean stray-quote pollution in source frontmatter tags (e.g. a trailing `"`), which interferes with topic-based routing/clustering.
4. Suggest new questions to investigate / new sources to find; record results in `log.md`.

## 5. Other hard rules

- `raw/` body & filenames are read-only: never edit / delete / rename source bodies. **Only exception**: ingest writes the three frontmatter fields via `/tag`. Query / lint keep `raw` strictly read-only.
- Wiki page `type` must be `wiki_*`; only write `INBOX/wiki/`.
- No automatic backup (this template ships without auto-commit): after a change, remind the user or run `git add` + commit yourself, and **prompt before pushing**.
