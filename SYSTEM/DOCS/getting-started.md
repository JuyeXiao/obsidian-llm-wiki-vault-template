# Getting started

## 1. Get the vault

- Click **Use this template** on GitHub (or `git clone` the repo).
- In Obsidian: **Open folder as vault** → pick the folder.
- **Trust the vault / enable plugins** when prompted (the dashboards run Datacore JSX, which only runs in a trusted vault).

## 2. Install the plugins

The dashboards and templates depend on community plugins. They're preconfigured under `.obsidian/`, but install them from **Settings → Community plugins**:

- **Datacore** (required — every dashboard), **Dataview**, **Templater**, **Meta Bind**, a periodic-notes plugin (e.g. **Journals**), plus the quality-of-life plugins listed in `.obsidian/community-plugins.json`.

> If a dashboard shows an error, it's almost always a missing/disabled plugin or an untrusted vault. Enable the plugin and reload.

## 3. Make it yours

- Open **`HUB/Homepage.md`** — your home base.
- Create notes with **QuickAdd** (the fastest way): run `Multi - Project` or `Multi - Area` to scaffold a folder with its numbered container page (`1. <Project>` / `2. <Area>`) in one step; or the other QuickAdd commands (Fleeting, Permanent, Literature, Meeting, …). Each sets the correct `type` and fields, so the dashboards pick them up automatically. (You can also apply templates manually via Templater.)
- Adjust the tag vocabulary in [`SYSTEM/TAGS/tag-library.md`](../TAGS/tag-library.md) to your domains.

## 4. (Optional) Turn on the AI layer

Open the vault in [Claude Code](https://claude.com/claude-code) and try:

- `/tag` — tag a note (or a folder) with `tags` / `keywords` / `summary`.
- `/clip-digest` — turn a web clipping in `INBOX/raw/Clippings` into a literature note.
- `/wiki-ingest` — absorb a source into the LLM Wiki. See [llm-wiki.md](llm-wiki.md).
- `/morning-start`, `/daily-review`, `/weekly-start`, `/weekly-review`, `/monthly-start`, `/monthly-review` — guided planning & review of your daily / weekly / monthly notes.

## Notes

- **No automatic backup.** This vault ships without auto-commit. Use Git yourself: `git add` + commit, and push when you're ready.
- **Empty by design.** The template ships with structure and a few example notes, no personal content. Delete the examples and start writing.
