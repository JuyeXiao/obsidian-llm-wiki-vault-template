# Structure & philosophy

Two human-written systems (PARA, ZETA) plus an LLM-owned one (the wiki). Keeping them separate is the whole point.

## PARA — action-oriented

Everything under `PARA/`. For work, skills, and things with an outcome.

- **Projects** — time-bound, has a finish line (each becomes its own dashboard page).
- **Areas** — ongoing responsibilities with no end date (each Area auto-becomes a topic dashboard).
- **Resources** — supporting material (documentation, concept maps, meetings, contacts).
- **Archives** — inactive Projects/Areas, moved here as a group.
- **Workstation** — quick PARA-related capture (like Fleeting, but for PARA).

## ZETA — idea-oriented (Zettelkasten)

Everything under `ZETA/`. For concepts and thinking, **not** tied to PARA work.

- **Permanent** — deeply processed, evergreen notes.
- **Literature** — notes on external sources (articles, books, podcasts).
- **Fleeting** — quick thoughts.
- **Reference** — citations and pointers.

## INBOX — the LLM Wiki

`raw` → `wiki` → `schema`. An LLM-owned system, separate from the two above. See [llm-wiki.md](llm-wiki.md).

## The separation principle

> PARA holds **things you do**. ZETA holds **things you think about**.

Link **within** each system by default; cross-system links should be intentional and few. This keeps each graph coherent: your project graph doesn't get tangled with your idea graph. The LLM Wiki is a third, parallel graph — connect it to PARA/ZETA deliberately (e.g. a project page pinning related wiki pages), not automatically.

## Time & navigation

- `DAILY/` — Daily / Weekly / Monthly / Quarterly / Yearly journals (managed by your periodic-notes plugin).
- `HUB/` — the Homepage, Map of Content, and Maps of Content (MOCs) that tie everything together with live Datacore dashboards. See [dashboards.md](dashboards.md).

## Note types

Every note carries a `type` in frontmatter (e.g. `project_note`, `area_note`, `literature_note`, `wiki_concept`). **This is load-bearing** — the dashboards query by `type`. Use the templates in `SYSTEM/TEMPLATE/FORMAT/` so the right `type` and fields are set automatically.

**Folder-note convention**: each Project / Area folder holds a container page (`project_family` / `area_family`) named with a numeric prefix — `1. <Project>` / `2. <Area>` — so it sorts to the top of its folder. The folder's other notes are its children (`project_note` / `area_note`). See the examples under `PARA/PROJECTS/Portfolio Website/` and `PARA/AREAS/Data Analysis/`.
