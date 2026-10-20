---
title: Keywords & Summary Spec
type: documentation_note
---

# Keywords & Summary Spec

> Referenced by [[tag-spec]]. `/tag` (in the independent capture/tag stage) follow this when writing `keywords` / `summary`, produced **in the same read** as `tags`.

## keywords (free extraction, uncontrolled)

- **3–8 items** capturing the salient terms / proper nouns / specific techniques / entities in the text — the details that the controlled `tags` granularity can't cover (specific companies / products / papers / people / algorithm variants / tool versions).
- **Uncontrolled**: not limited to [[tag-library]]; but **don't repeat** concepts already expressed by `tags` (they're complementary).
- Language follows the source (mixed is fine); use **concrete noun phrases**, avoid vague words ("method", "technique", "analysis").
- Written to frontmatter `keywords` as a single-line inline array; purpose = fill blind spots of the controlled `tags`, improve search recall.

## summary

- **1–3 sentences / ~50–100 words**: what the piece is about and what it concludes — **not** a restatement of the title.
- Language follows the body; objective, no personal commentary.
- Written to frontmatter `summary`.

## merge semantics (both fields)

- Existing **human value** → **keep, don't overwrite**.
- **Empty** → fill.
- Clearly **stale / low-quality and not human-written** → may refresh (cautiously; bulk migration fills blanks only by default).
