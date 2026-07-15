# Tagging system

Every note gets three frontmatter fields, written in a single pass and **merged, never overwritten**:

| field | what | controlled? |
|---|---|---|
| `tags` | semantic tags from a controlled vocabulary | ✅ from [`tag-library.md`](../TAGS/tag-library.md) |
| `keywords` | free, specific terms (names, products, techniques) | ❌ free |
| `summary` | a 1–3 sentence summary of the note | ❌ free |

Why three? Controlled `tags` give you reliable, consistent grouping (the dashboards and the wiki routing depend on them); free `keywords` catch the specifics a fixed vocabulary can't; `summary` makes every note skimmable and feeds the dashboards.

## The controlled vocabulary

The single source of truth is [`SYSTEM/TAGS/`](../TAGS/):

- **[tag-spec.md](../TAGS/tag-spec.md)** — the rules (namespaces, naming, merge semantics, write scope).
- **[tag-library.md](../TAGS/tag-library.md)** — the actual `topic/*` and `task/*` tags. **This ships as a small generic seed — extend it to your own domains.**
- **[keywords-summary-spec.md](../TAGS/keywords-summary-spec.md)** — how to write `keywords` and `summary`.

## Rules in brief

- **topic: 1–4, most specific**, picked **only** from the tag library. Need a new one? Add it under the right parent **and write it back to the library**.
- **Structural tags** (`area/…`, `project/…`, `wiki/…`) are derived from folders/`type` — leave them alone.
- **Merge, don't overwrite**: human-written values are kept; the tagger only fills blanks or improves.

## Using it

Run **`/tag`** in Claude Code on a note or folder — it reads once and writes all three fields. See [`.claude/skills/tag/SKILL.md`](../../.claude/skills/tag/SKILL.md).

Run **`/tag-lint`** now and then to keep the vocabulary honest. It flags **drift** (tags in use that were never written back to the library), malformed tags, and in-note duplicates. It also rebuilds `SYSTEM/TAGS/tag-library.flat.txt`, which the write-guard hook reads to warn about drift at write time — the hook silently skips that check when the file is missing, so keep it committed.
