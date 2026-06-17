# Dashboards

The `HUB/` pages are **live [Datacore](https://github.com/blacksmithgu/datacore) dashboards** — they query your notes by `type` and tags instead of being hand-maintained lists. All of them share one helper module, [`SYSTEM/SCRIPTS/datacore_helpers.md`](../SCRIPTS/datacore_helpers.md), which defines the components, columns, and tables.

## The pages

- **`HUB/Homepage.md`** — your home base: navigation, stats, and quick access.
- **`HUB/Map of Content.md`** — a dynamic index of every note (including wiki pages), searchable and filterable.
- **`HUB/MOC/`** — Maps of Content per category (Projects, Areas, Literature, Sources).
- **`HUB/PARA-Wiki Atlas.md`** — the bridge view: per cluster, wiki pages alongside the PARA pages that map to them.
- **`HUB/Mail Box.md`** — page-level task tracking across the vault.

## Per-note dashboards

Area and Project notes embed their own dashboards (via the shared helpers): an Area page shows its sub-areas, notes, linked projects, meetings, related wiki, and tasks; a Project page shows its sub-notes and open tasks. These are driven by the note's `type` and tags — which is why **using the templates matters**.

## How it works (briefly)

- Notes carry a `type` (e.g. `area_family`, `project_note`, `wiki_concept`) and tags.
- The dashboards run `dc.useQuery(...)` over those, then render with shared components (`TabbedView`, sortable `Table`, chips).
- Empty vault = empty dashboards. As you add notes from templates, the dashboards fill in automatically.

> Customizing: edit `datacore_helpers.md` to change columns/labels globally, or a specific `HUB/*.md` page for that view. The `type` values are the contract between notes and dashboards — keep them consistent.
