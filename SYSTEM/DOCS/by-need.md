# Choose a workflow

Start from the question you have. The five type dashboards are **Permanent / Literature / Projects / Areas / Sources**, available from Homepage and the note toolbar. Wiki knowledge starts at `INBOX/wiki/index.md`. [中文](zh/by-need.md)

## Process an article

Input: a faithfully captured Markdown source in `INBOX/raw/Clippings/`. Open Sources MOC to find it. `/clip-digest` creates or safely updates a literature note; raw stays read-only. Review capture quality first; a URL alone is not readable source evidence. `/tag` is a separately authorized metadata step when routing tags are missing.

```text
/clip-digest Read INBOX/raw/Clippings/Note-Taking Basics (example).md and update its matching literature note. Preserve My Annotations and existing metadata. Do not write raw or Wiki. Do not stage, commit or push.
```

## Form or refine my own view

Input: one or more literature notes and the question or position you want to explore. `/distill` produces a permanent note or a precise patch to the named existing note. Source claims, AI candidates and your confirmed position stay distinct. Missing personal evidence remains missing. Dates/tags/counts are only selection aids; no monthly quota applies.

```text
/distill From ZETA/LITERATURE/Note-Taking Basics (example).md, propose a permanent note about when a link earns its place. My position is not yet confirmed. Keep an explicit pending-viewpoint marker, uses and limits, and open questions. Save only the new permanent note after resolving title collisions. Do not edit sources or run Git.
```

```text
/distill Refine only ZETA/PERMANENT/Zettelkasten Method.md using its existing literature source. I want the boundary for temporary task notes clarified; do not invent my experience or treat this request as adoption of the claim. Preserve manual text, metadata, annotations and existing links. Ask only what is still unclear.
```

Permanent MOC searches title, summary and keywords, filters topics and actual body markers, and offers a list or topic view with pagination. `Personal viewpoint pending` and `Open question` are explicit callouts; **Unmarked never means confirmed**. Read failures are visible, not counted as confirmation.

## Find knowledge

Input: a question. `/wiki-query` returns a cited answer in chat and traces claims to raw when needed. It does not log or save by default.

```text
/wiki-query What does this Wiki support about purposeful links, and what remains untested? Answer with citations only; no files or Git changes.
```

For an already captured/tagged source, `/wiki-ingest` takes raw directly to Wiki. Literature is a parallel reading workflow, not a required intermediate layer.

```text
/wiki-ingest Handle only INBOX/raw/Clippings/Note-Taking Basics (example).md. Reuse existing pages where justified; maintain affected index, navigation, ingest log and source decision record. Choose an explicit disposition and verify it with full lint. Raw and human notes stay read-only; no Git operations.
```

## Connect a project or area

Input: a project/area page and an explicitly useful permanent or Wiki target. Use the page's relation selectors or authorize that exact link. Existing source workflows do not implicitly edit projects. The original example project at `PARA/PROJECTS/Portfolio Website/1. Portfolio Website.md` demonstrates both relations as a hypothetical design choice, not a claim about your work.

```text
In PARA/PROJECTS/Portfolio Website/1. Portfolio Website.md, add an explicit link to ZETA/PERMANENT/Zettelkasten Method.md and explain it as a candidate principle to evaluate. Preserve other fields and links. No source or Git changes.
```

## Check and back up

`/wiki-lint`, `/tag-lint`, `/doc-lint` and bare `/vault-git` are read-only. The Git inspector reports local tracking refs, not live remote truth. Commit and push require distinct scoped authorization; the skill reviews the entire outgoing history before an authorized push.

```text
/vault-git Inspect only. Show staged, unstaged, untracked and locally recorded unpushed commits; suggest groups by purpose and dependencies. Do not stage, commit, fetch or push.
```

```sh
python SYSTEM/SCRIPTS/sync_agent_skills.py
node .agents/skills/wiki-lint/scripts/wiki-lint.js --json
python .agents/skills/doc-lint/scripts/doc-lint.py
python .agents/skills/vault-git/scripts/inspect_git.py
```

## Follow the original example

The author-written example chain is raw `Note-Taking Basics (example)` → same-titled literature → permanent `Zettelkasten Method`. Raw also directly supports Wiki `Note-Taking`, catalogued by `Productivity Hub` and the Wiki index. The Portfolio Website project explicitly connects to the permanent and Wiki notes. All content is illustrative; there is no claimed user experience or confirmed user stance.

The same raw/literature filename intentionally demonstrates ambiguity: `[[Note-Taking Basics (example)]]` is unsafe. Follow the full path in each real source link. `source-decisions.json` contains the original example's single `ingest_existing` record; its satisfaction is computed from actual citations and body hash. To remove examples, remove their links, index/MOC entries and decision together, then run full lint. Never delete user notes merely because they inherited an example filename.

See [source governance](source-governance.md), [migration](migration.md), and [agent setup and limits](agent-workflows.md).
