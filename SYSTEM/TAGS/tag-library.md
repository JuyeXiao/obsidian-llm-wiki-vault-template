---
title: Tag Library
type: documentation_note
---

# Tag Library · controlled vocabulary (single source of truth)

> The controlled `topic/*` and `task/*` tags. `/tag` picks **only** from this list; any new tag must be **added back here** (otherwise the controlled vocabulary drifts out of sync).
>
> **This is a generic seed.** It is intentionally small — extend it to match your own domains as your vault grows. The top-level `topic/` roots here (`data`, `ai`, `productivity`, `career`) line up with the wiki clusters in `SYSTEM/SCRIPTS/datacore_helpers.md` (`TOPIC_TO_CLUSTER`); if you rename them, update that map too.

## topic/ — semantic tags

- **topic/data** — data analysis & related work
  - `topic/data/analysis` · `topic/data/sql` · `topic/data/visualization` · `topic/data/statistics`
- **topic/ai** — artificial intelligence
  - `topic/ai/machine-learning` · `topic/ai/llm` · `topic/ai/prompt-engineering` · `topic/ai/agents`
- **topic/productivity** — productivity & learning
  - `topic/productivity/note-taking` · `topic/productivity/time-management` · `topic/productivity/learning` · `topic/productivity/writing`
- **topic/career** — career & professional growth
  - `topic/career/interview` · `topic/career/job-search` · `topic/career/communication`
- **topic/product** — product & design
  - `topic/product/ux` · `topic/product/growth`
- **topic/engineering** — software engineering
  - `topic/engineering/python` · `topic/engineering/web`
- **topic/mindset** — mental models & decision making
- **topic/health** — health & well-being
- **topic/reading** — books & reading

## task/ — task tags (optional, controlled)

- `task/todo` · `task/idea` · `task/reference` · `task/draft`
