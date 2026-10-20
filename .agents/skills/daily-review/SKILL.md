---
name: daily-review
description: Evening daily review — guide the user through filling today's daily note "Daily Review" and "Tomorrow's Top 3". Triggers when the user says "daily review", "review my day", "evening reflection", or runs /daily-review.
---

# Daily Review

Read `SYSTEM/DOCS/agent-workflows.md` before this ritual. Its journal selection, exact-anchor, evidence, protected-content, pre-write conflict and idempotent update rules apply to every step below. Use Journals/Templater to create and render the note; if absent, keep a chat draft and report the missing target. Match the requested period using `journal-start-date` / `journal-end-date` in the user's date/time environment, not the filename. Draft/maintenance modes never write journals. No automatic staging, commit or push.


Guide the user to close out the day in today's daily note (`DAILY/DAILY/<today>.md`). Ask briefly, one thing at a time, then write the answers into the note.

1. `## 🔍 Daily Review` — **Done / progress**, **Learned / insight**, **Mood & energy**.
2. `## 🗺️ Tomorrow's Top 3` — the 1–3 most important things for tomorrow.

Keep questions short and conversational. Only edit these two sections; don't rewrite the rest of the note.
