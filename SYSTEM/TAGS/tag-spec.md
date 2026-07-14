---
title: Tag Spec
type: documentation_note
---

# Tag Spec · the tagging system's rules (single source of truth)

> [!important] Instructions for the agent
> Before *any* tagging / migration / lint on `PARA` / `ZETA` / `INBOX/raw`, read this file + [[tag-library]] + [[keywords-summary-spec]] and follow them strictly.

## 0. What this is / relation to the LLM Wiki

The tagging system writes three frontmatter fields: `tags` (controlled semantic tags), `keywords` (free), `summary`. The controlled vocabulary's **single source of truth = [[tag-library]]** (the `topic/` + `task/` namespaces). It sits next to the **LLM Wiki**: the wiki *reads* a raw source's `topic` tags for routing and never writes raw; the tagging system *writes* raw's frontmatter. After ingest, the wiki skill can tag in the same read.

## 1. Namespaces & field boundaries

| field / namespace | nature | how tagging treats it |
|---|---|---|
| `tags` → `topic/*` | semantic (controlled, from [[tag-library]]) | pick 1–4 most specific; may add new |
| `tags` → `task/*` | task (controlled) | usually not managed by tagging; keep |
| `tags` → `area/*` · `project/*` · `wiki/*` | structural / location (derived from folder / `type`) | **keep as-is, never add/remove** (unless the user asks) |
| `type` | note type (`area_note` / `project_note` / `wiki_*` / `literature_note`…) | **tagging never changes it** |
| `keywords` | free extraction (see [[keywords-summary-spec]]) | merge / fill |
| `summary` | summary (see [[keywords-summary-spec]]) | merge / fill |

## 2. topic naming rules

- Hierarchical: `topic/<l1>/<l2>/<leaf>`.
- This template uses **lowercase English slugs** at the leaf level (e.g. `topic/data/sql`, `topic/ai/llm`).
- Avoid synonym duplication: if a parent already names a concept, the child should be a sub-category / specific method / specific tool, not its translation.

## 3. Tagging rules (hard)

- **topic: 1–4, most specific** (deepest matching node); **pick only from [[tag-library]]**, **never invent on the fly**.
- Add a **new** tag only when nothing fits: attach it under the correct parent per §2 → **write it back to [[tag-library]]** → tell the user (otherwise the vocabulary drifts out of sync).
- **Merge / never overwrite**: keep existing human `tags` / `keywords` / `summary`; only fill or improve, never delete or re-tag wholesale.
- **One read, three fields**: read the body once and produce `tags` + `keywords` + `summary` together (saves tokens).
- **Keep structural tags**; always add a `topic/` semantic tag even if `area/` or `project/` already exist (missing topic = untagged).

## 4. Write scope & exclusions

- **Write**: `PARA` + `ZETA` + `INBOX/raw` (raw: **frontmatter only**, never body or filename).
- **Exclude**: `SYSTEM` / `DAILY` / `HUB` / `.claude` / `docs` / `INBOX/wiki` / `INBOX/schema` / root loose files / `.obsidian` / `.trash`.

## 5. Frontmatter format

- **Key order**: `title → tags → keywords → area → area_category → category → summary → type`.
- `tags` / `keywords`: **single-line inline array** `[a, b]`, sorted, deduped.
- Don't break existing formatting; no forced lint (this template keeps lint-on-save off).

## 6. Other

- `raw/` body & filename are **never** changed (only the three frontmatter fields).
- New tags must be **written back to [[tag-library]]**.
- **False-absence rule**: before asserting "the tag library has no match", search it exhaustively ([[tag-library]] full text, including synonyms / parent categories / English variants) — never conclude from memory. Wrongly deciding "it's missing" creates duplicate near-synonym tags, the main source of drift.
- No auto backup: after a change, `git add` + commit with a concise message, and **prompt before pushing**.
