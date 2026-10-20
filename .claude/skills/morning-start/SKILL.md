---
name: morning-start
description: Morning kickoff — pull yesterday's "Tomorrow's Top 3" into today's daily note "Today's Top 3", glance at this week's MIT, and confirm the day's plan. Triggers when the user says "start my day", "morning start", "good morning", or runs /morning-start.
---

# Morning Start

Read `SYSTEM/DOCS/agent-workflows.md` before this ritual. Its journal selection, exact-anchor, evidence, protected-content, pre-write conflict and idempotent update rules apply to every step below. Use Journals/Templater to create and render the note; if absent, keep a chat draft and report the missing target. Match the requested period using `journal-start-date` / `journal-end-date` in the user's date/time environment, not the filename. Draft/maintenance modes never write journals. No automatic staging, commit or push.


Help the user start the day by setting today's focus. Keep it to a ~2-minute ritual.

1. Open today's daily note (`DAILY/DAILY/<today>.md`); if missing, follow the shared missing-target rule.
2. Read **yesterday's** daily note `## 🗺️ Tomorrow's Top 3` and **this week's** weekly note (`DAILY/WEEKLY`) `## 🎯 Weekly MIT (1-3 most important things)`.
3. Propose today's `## 🎯 Today's Top 3` from those, resolve only unconfirmed choices with the user, and write them into today's note.
4. Briefly confirm any fixed events/meetings today.

Only edit today's `## 🎯 Today's Top 3`. Don't touch other sections.
