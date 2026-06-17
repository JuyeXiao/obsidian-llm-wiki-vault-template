---
name: morning-start
description: Morning kickoff — pull yesterday's "Tomorrow's Top 3" into today's daily note "Today's Top 3", glance at this week's MIT, and confirm the day's plan. Triggers when the user says "start my day", "morning start", "good morning", or runs /morning-start.
---

# Morning Start

Help the user start the day by setting today's focus. Keep it to a ~2-minute ritual.

1. Open today's daily note (`DAILY/DAILY/<today>.md`); if it doesn't exist, create it from the daily template.
2. Read **yesterday's** daily note `## 🗺️ Tomorrow's Top 3` and **this week's** weekly note (`DAILY/WEEKLY`) `## 🎯 Weekly MIT`.
3. Propose today's `## 🎯 Today's Top 3` from those, confirm/adjust with the user, and write them into today's note.
4. Briefly confirm any fixed events/meetings today.

Only edit today's `## 🎯 Today's Top 3`. Don't touch other sections.
