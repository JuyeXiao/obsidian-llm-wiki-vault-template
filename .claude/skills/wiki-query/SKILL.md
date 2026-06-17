---
name: wiki-query
description: Answer questions using the LLM Wiki (INBOX/wiki) — locate relevant pages via the index, read them (tracing back to raw when needed), synthesize an answer with [[citations]], and write valuable new syntheses back as wiki pages. Triggers when the user says "ask the wiki", "wiki query", "look it up in the wiki", "answer from the wiki", "check the wiki about…", or invokes /wiki-query.
---

# LLM Wiki · Query (ask + write-back)

Your job is to answer from `INBOX/wiki/` and to settle **valuable new syntheses** back into the wiki. This skill is the **runbook**; the **single source of truth for the rules is [`INBOX/schema/wiki-schema.md`](INBOX/schema/wiki-schema.md)**.

## Iron rules (memorize first)
- Answering is read-only; **write-back goes only to `INBOX/wiki/`**; `raw/` is read-only; link **by name `[[link]]`**; wiki pages use a `wiki_*` `type`.
- Write-back pages must include a `## Sources` section linking back to raw. No auto-push after changing the vault (prompt after committing).

## Step 0 · Required reading
Read [`INBOX/wiki/index.md`](INBOX/wiki/index.md) to orient; rules are governed by [`INBOX/schema/wiki-schema.md`](INBOX/schema/wiki-schema.md).

## Execution flow

### 1 · Locate
Read `index.md` (or the global `HUB/Map of Content.md`) to find relevant pages by cluster/keyword. When a match is uncertain, `grep -rl "<keyword>" INBOX/wiki/` helps locate it.

### 2 · Read
Read the matched wiki pages; when information is insufficient or a detail needs verifying, **trace back** to the `raw` originals pointed to by its `## Sources`.

### 3 · Answer
Synthesize an answer **with `[[citations]]`** pointing to the wiki pages used (so the user can jump there, and it stays traceable). Distinguish "already in the wiki" from "my added inference".

### 4 · Write-back (only when valuable)
If the answer produced an **evergreen, reusable** new synthesis (§2.1):
- Create a new page (`wiki_concept`/`wiki_entity`/`wiki_summary`, frontmatter same as the ingest template) or merge into an existing page; pre-check uniqueness with `find . -name "<page name>.md"`.
- Body: `**Core**` → sections → `## Relations` (cross-links) → `## Sources` (raw wikilinks).
- Update the `index.md` group line (`log.md` optional — only for a large multi-page synthesis).
- Mini-lint: `bash .claude/skills/wiki-lint/scripts/wiki-lint.sh <cluster>` (0 broken links).
- Commit: `git add INBOX/wiki/` → commit with a concise message; do not stage `.obsidian`/`DAILY`; prompt that a push is possible.
> If the answer is mere retrieval/restatement with no new synthesis value → **do not write back** (avoid diluting the wiki).

## Notes
- Stay faithful to sources; anything not in the wiki and not traced back to raw evidence must be labeled "inference / external knowledge", not disguised as wiki content.
- Cross-cluster questions: cite relevant pages from multiple clusters together (knowledge is a graph).

## Relationship to other wiki skills
- Absorbing new sources: `/wiki-ingest`. Health check: `/wiki-lint`.
