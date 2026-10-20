# Interface: toolbars & page tasks

Two interface features carried over from the original vault that are worth knowing about.

## Note Toolbar

Every note shows a small toolbar at the top, and which one you get depends on where the note lives — the [Note Toolbar](https://github.com/chrisgurney/obsidian-note-toolbar) plugin maps folders to toolbars.

- Inside `PARA/PROJECTS` and `PARA/AREAS`, the toolbar has buttons for creating the right kind of sub-note (project note, area note, documentation, …).
- Anywhere else you get a general toolbar: jump back to the HUB, open today's note, create a note, search, open Quick Switcher, toggle a page task, open settings.

To change what's on a toolbar or which folder maps to it, open the Note Toolbar plugin's settings.

## Page-level tasks

A checkbox task lives *inside* a note (`- [ ] #task …`). A **page task** is different: the whole note is the to-do. That's what `HUB/Mail Box.md` collects.

- **Make a note a task** — click **Toggle Page Task** on its toolbar. It writes a status field into the note's frontmatter, so the note itself becomes a to-do.
- **Work through them** — open `HUB/Mail Box.md`. It's an inbox-style list of your open notes and page tasks (plus unattended meetings), with name, path, and date filters.
- **Close one** — tick its checkbox in Mail Box; the note is marked done and stamped with a `closed` time. Flip the "Completions" toggle to review finished ones.

Reach for a page task when the *note itself* is the thing to act on — a project to push forward, an article to read, someone to follow up with — rather than a line item inside a note.

Mail Box requires an explicit supported page status, `file_state: unchecked_task`, or a dated meeting with boolean `meeting_status`. Ordinary notes with no status are excluded, as are SYSTEM/HUB/DAILY/INBOX, literature, permanent notes, archived projects and scratch areas. Field names are read/written case-insensitively while preserving spelling. Completed tasks can be restored from Completions; status tasks restore their prior status, and old closed-only page tasks regain `file_state`. Filters and shrinking task counts keep pagination in range.

Search and Quick Switcher buttons use native Obsidian commands; Omnisearch and Quick Switcher++ are not required. Homepage opens in Reading view; use native view controls elsewhere. Page tasks retain Iconic icons and do not require the Tasks plugin. See the [plugin list](plugins.md).
