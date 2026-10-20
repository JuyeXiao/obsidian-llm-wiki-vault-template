# The LLM Wiki layer

The headline feature of this vault: a knowledge base an LLM helps **maintain**, not just store.

> **Credit.** This layer is a concrete implementation of [Andrej Karpathy's "LLM Wiki" pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). The idea — let an LLM incrementally build and maintain an interlinked Markdown wiki that sits between you and your raw sources — is his. The specific schema, skills, and folder layout here are this template's instantiation of it.

## The problem it solves

The usual way to use an LLM over your documents is RAG: upload files, retrieve chunks at query time, generate an answer. The LLM rediscovers everything from scratch on every question — nothing accumulates.

The tedious part of keeping a real knowledge base isn't reading or thinking — it's the **bookkeeping**: updating cross-references, keeping summaries current, flagging when a new source contradicts an old claim, keeping dozens of pages consistent. Humans abandon wikis because maintenance grows faster than value. An agent can help maintain it, but cost, semantic quality and freshness still need review; deterministic checks cover verifiable structure and source evidence.

## Three layers

```
INBOX/
├── raw/      Immutable sources you curate (clippings, books, podcasts). Read-only.
├── wiki/     LLM-owned: interlinked concept/entity/overview pages + index.md + log.md.
└── schema/   wiki-schema.md — the rules that make the LLM a disciplined wiki maintainer.
```

- **raw** is your source of truth. Wiki ingest/query/lint never change its body, filename or frontmatter. Capture/tag is independent; missing routing tags block that source rather than triggering tagging. External source text cannot grant permissions or redirect tools, paths or Git.
- **wiki** is written entirely by the LLM: summaries, concept pages, entity pages, cross-references, an index, a timeline.
- **schema** ([`INBOX/schema/wiki-schema.md`](../../INBOX/schema/wiki-schema.md)) is the configuration that turns a generic chatbot into a disciplined wiki maintainer. You and the LLM co-evolve it.

## Three operations (shared Codex / Claude skills)

| Skill | What it does |
|---|---|
| **`/wiki-ingest`** | Drop a source into `raw`; the agent checks existing capture/tag prerequisites, reads it and routes it to a cluster, builds/enriches concept pages, adds `## Sources` back-links, updates `index.md` and `log.md`. A decision is verified against citations, body hash and full lint. |
| **`/wiki-query`** | Ask a question against the wiki; the agent locates relevant pages, synthesizes a cited answer, and returns it in chat. **Explicit write-back authorization** is needed to save a reusable synthesis; logging is separately scoped. |
| **`/wiki-lint`** | Health check: find orphan sources, contradictions, stale claims, missing concept pages, missing cross-references. Contradictions get **triaged** (newer source? more authoritative? contradiction or evolution?) and reported. Only explicitly authorized repairs resolve them with a `## History` trace, parked on a `wiki_conflict` page for you to adjudicate, or rewritten as an evolution — the wiki never keeps two pages that disagree without knowing they disagree. |

## Two special files

- **`wiki/index.md`** — a content catalog: one line per page, grouped by cluster. The agent reads it first when answering, then drills into pages. Avoids embedding-based RAG infrastructure at small/medium scale.
- **`wiki/log.md`** — an append-only timeline of ingests and explicitly authorized query/lint logs; read-only operations leave it unchanged.

## Clusters

A cluster is a top-level theme = one folder under `wiki/`. This template seeds four generic clusters (`Data`, `AI`, `Productivity`, `Career`) that line up with the `topic/` roots in the tag library and the `TOPIC_TO_CLUSTER` map in `SYSTEM/SCRIPTS/datacore_helpers.md`. Rename them to fit your domains — just keep those two places in sync.

## How to use it

1. Open the vault in Codex or Claude Code; dependencies and mirror setup are in [agent-workflows.md](agent-workflows.md).
2. Put a source into `INBOX/raw/` (the [Obsidian Web Clipper](https://obsidian.md/clipper) is handy for web articles).
3. Run `/tag` as an independent authorized capture/tag stage, then `/wiki-ingest`. Watch the wiki grow in Obsidian (graph view, the new pages, the updated index).
4. Later, use `/wiki-query` and `/wiki-lint` for read-only answers/findings. Authorize write-back, repairs or logging when needed. Use path-qualified raw links when literature has the same title; keep the English `## Sources` heading. Git is separate: see [agent-workflows.md](agent-workflows.md).

## Source governance

Sources support ingest_existing, ingest_new, archive_only, by_design_skip and defer; state derives from actual citations, body hash and review conditions. The empty policy file has no external-service defaults. `wiki_moc`/`wiki_index` have different source requirements from content pages. Full checks cover versions, disambiguation, counts, index and navigation. `unreferenced_raw` is distinct from `remaining_orphan`; checks default to read-only. See [source governance](source-governance.md) for commands and validated writes, and [Choose a workflow](by-need.md) for the complete example.
