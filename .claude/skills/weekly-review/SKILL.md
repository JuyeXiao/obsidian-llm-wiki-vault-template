---
name: weekly-review
description: Weekly review — guide the user through this week's "Outcomes / Reflection / Next Week" sections. Triggers when the user says "weekly review", "review my week", or runs /weekly-review.
---

# Weekly Review

Read `SYSTEM/DOCS/agent-workflows.md` before this ritual. Its journal selection, exact-anchor, evidence, protected-content, pre-write conflict and idempotent update rules apply to every step below. Use Journals/Templater to create and render the note; if absent, keep a chat draft and report the missing target. Match the requested period using `journal-start-date` / `journal-end-date` in the user's date/time environment, not the filename. Draft/maintenance modes never write journals. No automatic staging, commit or push.


Guide the user to fill this week's weekly note (`DAILY/WEEKLY`), one section at a time. Ask conversationally; write answers into the matching sections only.

1. `# ✅ Outcomes` — key deliverables completed, unfinished / pushed to next week, people & moments worth noting.
2. `# 🔍 Reflection` — what went well (continue), what to improve (change), one key takeaway.
3. `# 🗺️ Next Week` — next week's theme, 1–3 MIT, key milestones / time budget.

The "Next Week" MIT carry straight into next Monday's `/weekly-start`.
