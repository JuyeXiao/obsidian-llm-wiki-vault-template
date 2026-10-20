# Dashboards

The `HUB/` pages are **live [Datacore](https://github.com/blacksmithgu/datacore) dashboards** — they query your notes by `type` and tags instead of being hand-maintained lists. They reuse the helper module, [`SYSTEM/SCRIPTS/datacore_helpers.md`](../SCRIPTS/datacore_helpers.md), which defines the components, columns, and tables.

## The pages

- **`HUB/Homepage.md`** — your home base: navigation, stats, and quick access.
- **`HUB/Map of Content.md`** — a compatibility navigation page pointing old links to the five MOCs.
- **`HUB/MOC/`** — the five type entrances: Permanent, Literature, Projects, Areas, Sources.
- **`HUB/PARA-Wiki Atlas.md`** — the bridge view: per cluster, wiki pages alongside the PARA pages that map to them.
- **`HUB/Mail Box.md`** — page-level task tracking across the vault.

## Per-note dashboards

Area and Project notes embed their own dashboards (via the shared helpers): an Area page shows its sub-areas, notes, linked projects, meetings, related wiki, and tasks; a Project page shows its sub-notes and open tasks. These are driven by the note's `type` and tags — which is why **using the templates matters**.

## How it works (briefly)

- Notes carry a `type` (e.g. `area_family`, `project_note`, `wiki_concept`) and tags.
- The dashboards run `dc.useQuery(...)` over those, then render with shared components (`TabbedView`, sortable `Table`, chips).
- Empty vault = empty dashboards. As you add notes from templates, the dashboards fill in automatically.

> Customizing: edit `datacore_helpers.md` to change columns/labels globally, or a specific `HUB/*.md` page for that view. The `type` values are the contract between notes and dashboards — keep them consistent.

Relation selectors query note directories and use `useLinks(true)` to store path-qualified links. Backlinks resolve exact paths first; short names and suffix paths must be unique across the entire vault. Aliases, anchors and relative paths preserve target identity; ambiguous names are not guessed. Monthly weekly summaries use overlapping journal date ranges, including cross-month weeks.

Permanent MOC also uses `SYSTEM/SCRIPTS/permanent_moc_helpers.md` to read real body markers. It searches title/summary/keywords, filters topics and pending viewpoints, and offers list/topic views, pagination, empty states and labeled native controls. Unmarked never means confirmed; read failures are visible. See [Choose a workflow](by-need.md).
