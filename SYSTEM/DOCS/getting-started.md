# Getting started

## 1. Get the vault

- Run `git clone https://github.com/JuyeXiao/obsidian-llm-wiki-vault-template.git`, or choose **Code → Download ZIP** and extract it including the hidden `.obsidian/` directory. Installation does not depend on the GitHub Template setting.
- In Obsidian: **Open folder as vault** → pick the folder.
- **Trust the vault / enable plugins** when prompted (the dashboards run Datacore JSX, which only runs in a trusted vault).

## 2. Check the bundled plugins

Plugin programs and settings are bundled under `.obsidian/plugins/`. Review **Settings → Community plugins** and the enabled IDs in `.obsidian/community-plugins.json`. Keep the required plugins enabled; reinstall only a genuinely missing dependency, without bulk-updating the bundle:

- **Datacore**: dashboards, page tasks and backlink views.
- **Dataview + Meta Bind**: directory-based relation selectors that save explicit wikilinks.
- **Journals + Templater**: periodic-note creation, metadata and template rendering. Journals uses the templates in its settings; Templater ignores automatic creation under DAILY to avoid double application.
- **QuickAdd + Note Toolbar**: the shipped creation/capture commands and toolbar.
- **Homepage + Custom Sort + Iconic + Banners + Style Settings**: retained navigation, sorting and appearance. The bundle contains **12 plugins**; 42 older extras were removed. Search/Quick Switcher use native commands; see [optional installation](plugins.md) for other features. Third-party programs retain their own licenses.

> If a dashboard fails, first check the named plugin, trust setting and referenced helper/template path; preserve the actual error for diagnosis. A successful file check does not prove the Obsidian UI works.

## 3. Make it yours

- Open **`HUB/Homepage.md`** — your home base.
- Create notes with **QuickAdd** (the fastest way): run `Multi - Project` or `Multi - Area` to scaffold a folder with its numbered container page (`1. <Project>` / `2. <Area>`) in one step; or the other QuickAdd commands (Fleeting, Permanent, Literature, Meeting, …). Each sets the correct `type` and fields, so the dashboards pick them up automatically. (You can also apply templates manually via Templater.)
- Create the daily/weekly/monthly note through the configured **Journals** command before running a ritual. Confirm rendered content and `journal-start-date` / `journal-end-date`. **Capture - Add to Daily Task** only appends to an existing daily note; it no longer creates a journal without metadata. See [agent-workflows.md](agent-workflows.md).
- Adjust the tag vocabulary in [`SYSTEM/TAGS/tag-library.md`](../TAGS/tag-library.md) to your domains.

## 4. (Optional) Turn on the AI layer

Open the vault in Codex or Claude Code; both use the same 16 skills. Prepare Node.js 18+, Python 3.10+, Git and the tag-script tools, and check the mirror as described in [agent-workflows.md](agent-workflows.md). Try:

- `/tag` — tag a note (or a folder) with `tags` / `keywords` / `summary`.
- `/clip-digest` — turn a web clipping in `INBOX/raw/Clippings` into a literature note.
- `/distill` — form a permanent note from literature or precisely refine a named existing note.
- `/vault-git` — bare invocation inventories only; no staging, commit or push.
- `/wiki-ingest` — absorb an already captured/tagged source into the LLM Wiki. See [llm-wiki.md](llm-wiki.md).
- `/morning-start`, `/daily-review`, `/weekly-start`, `/weekly-review`, `/monthly-start`, `/monthly-review` — guided planning & review of your daily / weekly / monthly notes.

## Notes

- **No automatic Git delivery.** Content writes (including reviews) do not authorize staging/commit/push. Query/lint default to read-only and do not log. Explicitly authorize each required stage; existing authorization remains valid. An authorized commit uses exact filenames after preserving unrelated staged/dirty work; push is separate. See [agent-workflows.md](agent-workflows.md).
- **Empty by design.** The template ships with structure and a few example notes, no personal content. The original example demonstrates a complete chain. Follow [migration](migration.md) when removing its links and decisions; [Choose a workflow](by-need.md) provides copyable requests.
