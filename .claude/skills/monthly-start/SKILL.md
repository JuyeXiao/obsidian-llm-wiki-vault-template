---
name: monthly-start
description: Month kickoff — carry last month's "Next Month" draft into this month's "Monthly Plan & Goals" (Theme / OKR / key events). Triggers when the user says "start my month", "monthly start", or runs /monthly-start.
---

# Monthly Start

Read `SYSTEM/DOCS/agent-workflows.md` before this ritual. Its journal selection, exact-anchor, evidence, protected-content, pre-write conflict and idempotent update rules apply to every step below. Use Journals/Templater to create and render the note; if absent, keep a chat draft and report the missing target. Match the requested period using `journal-start-date` / `journal-end-date` in the user's date/time environment, not the filename. Draft/maintenance modes never write journals. No automatic staging, commit or push.


1. Open this month's monthly note (`DAILY/MONTHLY`); if missing, follow the shared missing-target rule.
2. Read **last month's** monthly note `# 🗺️ Next Month` (Theme / OKR draft / milestones).
3. Propose this month's `# 🧭 Monthly Plan & Goals` — Monthly Theme, Monthly OKR (O + KRs), key events/deadlines; resolve unconfirmed choices and apply the approved patch.

Keep it short. Only fill the planning sections; leave the review sections for the monthly review.
