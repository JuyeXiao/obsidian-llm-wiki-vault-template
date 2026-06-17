---
name: tag
description: Tag notes — in a single read write tags (controlled, 1-4 chosen from the tag library) + keywords (free-form, 3-8) + summary (1-3 sentences), all merged without overwriting manual values. Triggers when the user says "tag this note/folder", "tag today's new notes", "batch-tag", "fill in keywords/summary", or invokes /tag.
---

# Tag (tagging + metadata fill-in)

Write `tags` / `keywords` / `summary` to a note's frontmatter. **The single source of truth is [[tag-spec]] + [[tag-library]] + [[keywords-summary-spec]]**.

## Iron rules
- Write only these three frontmatter fields, all **merged / never overwriting manual values**; do not fabricate tags (add one only when truly needed after exhausting the library, and write it back to [[tag-library]]).
- Do not touch the body / `type` / structural tags (`area/project/wiki` kept as-is). **For `raw`, write frontmatter only; never change the body or filename.**
- **Read once, write all three fields** (saves tokens).
- No automatic backup after changing the vault: when done, commit and **prompt** that a push is possible (do not auto-push).

## Step 0 · Required reading
[[tag-spec]] + [[tag-library]] + [[keywords-summary-spec]].

## Write scope / exclusions
- **Write**: `PARA` + `ZETA` + `INBOX/raw` (raw = frontmatter only).
- **Exclude**: `SYSTEM` / `DAILY` / `HUB` / `.claude` / `INBOX/wiki` / `INBOX/schema` / `docs` / root stray files / `.obsidian` / `.trash`.

## Selection entry points
- **Specified**: a note / folder the user gives.
- **Needs tagging = missing a `topic/` tag**: `grep -rL "topic/" <scope> --include='*.md'` (**a note with structural tags like `area/`, `project/` but no topic still counts as untagged — never skip it**).
- **Today's new**: frontmatter `created: <TODAY>` (`<TODAY>` = system currentDate).

## Folder awareness
First look at the containing folder / `type`: PARA → may already have area/project; ZETA / raw → usually topic only. Keep structural tags **as-is**; **add topic semantic tags regardless of whether structural tags exist already**; if a folder-implied structural tag is missing, only **suggest** it — do not force it.

## Flow
1. Read the three specs. For many notes, fan-out **read-only `Explore` sub-agents**: each returns the exact path + suggested `tags` (the most specific 1–4 from [[tag-library]]) + `keywords` (free-form, 3–8) + `summary` (1–3 sentences); sub-agents **do not write**.
2. The main agent merges into frontmatter: keep existing structure / manual values, de-duplicate, key order per the linter (`title→tags→keywords→area→…`), single-line inline arrays, ascending order.
3. Mini self-check: every tag written exists in [[tag-library]] (no drift); frontmatter is well-formed (valid inline arrays, no stray trailing quotes); no duplicate tags within a note.
4. `git add` (do not stage `.obsidian` / `DAILY`) → commit with a concise message → prompt that a push is possible.

## Notes
- If no suitable controlled tag fits → first exhaust [[tag-library]]; if a new tag is truly needed, name it per [[tag-spec]] §2, attach it to the right parent, and write it into [[tag-library]] (the library is maintained by hand — just edit it directly).
- `keywords` must not repeat what `tags` already express, and must not use generic words (see [[keywords-summary-spec]]).
- For many notes, prefer parallel reads via `Explore` sub-agents; the main agent does all writing and the commit.
