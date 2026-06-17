# The LLM Wiki layer

The headline feature of this vault: a knowledge base an LLM helps **maintain**, not just store.

> **Credit.** This layer is a concrete implementation of [Andrej Karpathy's "LLM Wiki" pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). The idea — let an LLM incrementally build and maintain an interlinked Markdown wiki that sits between you and your raw sources — is his. The specific schema, skills, and folder layout here are this template's instantiation of it.

## The problem it solves

The usual way to use an LLM over your documents is RAG: upload files, retrieve chunks at query time, generate an answer. The LLM rediscovers everything from scratch on every question — nothing accumulates.

The tedious part of keeping a real knowledge base isn't reading or thinking — it's the **bookkeeping**: updating cross-references, keeping summaries current, flagging when a new source contradicts an old claim, keeping dozens of pages consistent. Humans abandon wikis because maintenance grows faster than value. An LLM doesn't get bored and can touch 15 files in one pass, so the wiki stays maintained because maintenance is nearly free.

## Three layers

```
INBOX/
├── raw/      Immutable sources you curate (clippings, books, podcasts). Read-only.
├── wiki/     LLM-owned: interlinked concept/entity/overview pages + index.md + log.md.
└── schema/   wiki-schema.md — the rules that make the LLM a disciplined wiki maintainer.
```

- **raw** is your source of truth. The LLM reads it but never rewrites it.
- **wiki** is written entirely by the LLM: summaries, concept pages, entity pages, cross-references, an index, a timeline.
- **schema** ([`INBOX/schema/wiki-schema.md`](../../INBOX/schema/wiki-schema.md)) is the configuration that turns a generic chatbot into a disciplined wiki maintainer. You and the LLM co-evolve it.

## Three operations (Claude Code skills)

| Skill | What it does |
|---|---|
| **`/wiki-ingest`** | Drop a source into `raw`; the agent reads it, tags it, routes it to a cluster, builds/enriches concept pages, adds `## Sources` back-links, updates `index.md` and `log.md`. One source may touch 10–15 pages. |
| **`/wiki-query`** | Ask a question against the wiki; the agent locates relevant pages, synthesizes a cited answer, and **files valuable answers back** as new pages so exploration compounds. |
| **`/wiki-lint`** | Health check: find orphan sources, contradictions, stale claims, missing concept pages, missing cross-references. |

## Two special files

- **`wiki/index.md`** — a content catalog: one line per page, grouped by cluster. The agent reads it first when answering, then drills into pages. Avoids embedding-based RAG infrastructure at small/medium scale.
- **`wiki/log.md`** — an append-only timeline of ingest/query/lint passes.

## Clusters

A cluster is a top-level theme = one folder under `wiki/`. This template seeds four generic clusters (`Data`, `AI`, `Productivity`, `Career`) that line up with the `topic/` roots in the tag library and the `TOPIC_TO_CLUSTER` map in `SYSTEM/SCRIPTS/datacore_helpers.md`. Rename them to fit your domains — just keep those two places in sync.

## How to use it

1. Open the vault in [Claude Code](https://claude.com/claude-code).
2. Put a source into `INBOX/raw/` (the [Obsidian Web Clipper](https://obsidian.md/clipper) is handy for web articles).
3. Run `/wiki-ingest`. Watch the wiki grow in Obsidian (graph view, the new pages, the updated index).
4. Later, `/wiki-query` to ask questions; `/wiki-lint` periodically to keep it healthy.
