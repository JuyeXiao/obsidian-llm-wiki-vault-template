---
name: monthly-review
description: Monthly review — guide the user through this month's "Outcomes / Reflection / Next Month" sections. Triggers when the user says "monthly review", "review my month", or runs /monthly-review.
---

# Monthly Review

Read `SYSTEM/DOCS/agent-workflows.md` before this ritual. Its journal selection, exact-anchor, evidence, protected-content, pre-write conflict and idempotent update rules apply to every step below. Use Journals/Templater to create and render the note; if absent, keep a chat draft and report the missing target. Match the requested period using `journal-start-date` / `journal-end-date` in the user's date/time environment, not the filename. Draft/maintenance modes never write journals. No automatic staging, commit or push.


Guide the user to fill this month's monthly note (`DAILY/MONTHLY`), one section at a time. Ask conversationally; write answers into the matching sections only.

1. `# ✅ Outcomes` — key deliverables, unfinished / pushed to next month, big events recap, health / finance / life snapshot.
2. `# 🔍 Reflection` — multi-dimensional review, what went well, what to improve, new self-awareness, one key takeaway.
3. `# 🗺️ Next Month` — next month's theme, OKR draft, key milestones / time budget.

The "Next Month" OKR draft carries straight into next month's `/monthly-start`.
