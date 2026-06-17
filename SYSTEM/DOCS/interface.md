# Interface: toolbars & page tasks

Two interface features carried over from the original vault that are worth knowing about.

## Note Toolbar

Every note shows a small toolbar at the top, and which one you get depends on where the note lives — the [Note Toolbar](https://github.com/chrisgurney/obsidian-note-toolbar) plugin maps folders to toolbars.

- Inside `PARA/PROJECTS` and `PARA/AREAS`, the toolbar has buttons for creating the right kind of sub-note (project note, area note, documentation, …).
- Anywhere else you get a general toolbar: jump back to the HUB, open today's note, create a note, search, see recent files, toggle a page task, open settings.

To change what's on a toolbar or which folder maps to it, open the Note Toolbar plugin's settings.

## Page-level tasks

A checkbox task lives *inside* a note (`- [ ] #task …`). A **page task** is different: the whole note is the to-do. That's what `HUB/Mail Box.md` collects.

- **Make a note a task** — click **Toggle Page Task** on its toolbar. It writes a status field into the note's frontmatter, so the note itself becomes a to-do.
- **Work through them** — open `HUB/Mail Box.md`. It's an inbox-style list of your open notes and page tasks (plus unattended meetings), with name, path, and date filters.
- **Close one** — tick its checkbox in Mail Box; the note is marked done and stamped with a `closed` time. Flip the "Completions" toggle to review finished ones.

Reach for a page task when the *note itself* is the thing to act on — a project to push forward, an article to read, someone to follow up with — rather than a line item inside a note.
