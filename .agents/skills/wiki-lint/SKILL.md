---
name: wiki-lint
description: Health-check the LLM Wiki (INBOX/wiki) — run a deterministic script for broken links / orphan sources / page-name collisions / source traceability / tag pollution, then manually check for contradictions, staleness, and gaps, and report in chat; repairs and logging require explicit authorization. Triggers when the user says "lint the wiki", "wiki health check", "check the wiki", "find orphan sources", "find broken links", or invokes /wiki-lint.
---

# LLM Wiki · Lint (health check)

Your job is to check the health of `INBOX/wiki/` and propose fixes. This skill is the **runbook**; the **single source of truth for the rules is [`INBOX/schema/wiki-schema.md`](INBOX/schema/wiki-schema.md)**.

## Iron rules (memorize first)
- Read `INBOX/schema/wiki-schema.md` first, then `SYSTEM/DOCS/agent-workflows.md`. Default to read-only findings in chat, without logs. Explicitly authorized fixes only write their named Wiki targets. Raw bodies, filenames and frontmatter are entirely read-only; tag cleanup belongs to an independently authorized capture/tag stage.
- Fixes also follow the ingest conventions: use uniquely resolved links, path-qualified for ambiguous source names, `wiki_*` type, `## Sources` backlinks.

## Execution flow

### 1 · Run the deterministic script (machine-checkable items)
Run at the vault root (Node.js 18+):
```bash
node .agents/skills/wiki-lint/scripts/wiki-lint.js
node .agents/skills/wiki-lint/scripts/wiki-lint.js --json
node .agents/skills/wiki-lint/scripts/wiki-lint.js --cluster Productivity --json
```
The Node engine is shared by ingest, query, hooks and index checks. Bash/Python entrypoints only forward arguments. A cluster filters displayed pages; validation and source state always cover the full vault. Exit 1 means errors; warnings need review, even with exit 0. Human and JSON output use the same result.

Checks include full-vault navigation, raw-only **and** full-vault source identity, English `## Sources`, page types/cardinality, `source_count`, index coverage/type/count, cluster MOC coverage, versioned policy/registry contracts, decision/reference conflicts, body hash changes and deferred reviews. Unknown schema/policy/registry versions fail explicitly. Raw tag pollution is reported, never repaired here. Only `INBOX/raw/README.md` is documentation excluded from raw inventory; no filename whitelist silently exempts other sources.

Read `SYSTEM/DOCS/source-governance.md`. Distinguish `unreferenced_raw` (no actual citation) from `remaining_orphan` (no citation and no effective decision/policy). Inspect each derived state and reason. Never persist an invented `satisfied` state. A previously cited source without a decision is `legacy_ingested`, not a complete decision record.

### 2 · Manual-judgment items (what the script can't check)
Read the relevant pages and judge: **contradictions** between pages, **stale** conclusions, **orphan wiki pages** (no uniquely resolved inbound links, not merely zero basename grep matches), **missing concept pages / cross-references**, data or sources that could be added.
When you find a contradiction, triage it with the schema §4 **three reconcile questions**: which source is newer (§2.3 recency markers / source dates)? Which is more authoritative (primary research / official docs > industry reporting > blogs / transcripts > opinion)? Genuine contradiction or **evolution** (change over time is not a contradiction)?

### 3 · Fix (only within explicit repair authorization)
Without repair authorization, report proposals only. Existing session authorization remains valid. Reread targets before writing and stop affected writes on conflicts.
- **Unreferenced raw** → propose `ingest_existing`, `ingest_new`, `archive_only`, `by_design_skip` or `defer` with evidence; only ingest selected sources within the explicit authorization.
- **Page contradiction (reconcile)** → dispose per [`wiki-schema.md`](INBOX/schema/wiki-schema.md) §4, one of three ways: **clear winner** → rewrite the stale page + leave a `## History` trace (`Previously stated X per [[old source]] (as of YYYY-MM); updated to Y per [[new source]] in YYYY-MM`); **genuinely ambiguous** → create a `wiki_conflict` page (`status: open`, both claims + evidence + sources, each conflicting page links to it) for the human to adjudicate; **evolution** → update to current state + keep the timeline. **Never silently overwrite an old claim without a trace**; add §2.3 recency markers to whatever you touch.
- **Broken link / source not resolving** → resolve the exact target path first; qualify ambiguous raw links. Never rename raw to fix a Wiki link.
- **Collision** → rename the Wiki page to something more specific and update inbound links within the authorized Wiki targets. Report links outside Wiki for a separate task; do not edit raw or other systems.
- **Tag pollution** → **report only** to the user (raw is read-only).
- After content repairs, re-run the full check. Preserve existing decisions when building a candidate registry. Use `--decisions <candidate.json>` for read-only validation. Only with explicit registry-write authorization use `--write-decisions <candidate.json>`; it validates the full vault and requires every submitted decision to be satisfied before replacing the registry. Never edit derived states by hand. Concurrent changes stop the replacement; do not retry blindly.

### 4 · Report and optional log
- Return findings and skipped sources in chat. Only if logging is explicitly authorized, append one entry to [`INBOX/wiki/log.md`](INBOX/wiki/log.md): `## [YYYY-MM-DD] lint | <scope>` with findings, fixes, remaining items (including explicit skip/archive/defer decisions), and any new questions to ask / sources to find.
- Follow `SYSTEM/DOCS/agent-workflows.md`: no automatic staging, commit or push; use existing session authorization and an exact file list.

## Notes
- Default checking is read-only, including raw, decisions and logs. `--write-decisions` is the only state-writing option and still requires authorization.
- Archive/skip decisions need a reason and matching body hash; defer needs a review date or named trigger. Existing citations conflict with archive/skip/defer. Use an empty policy file until a user authorizes a specific policy; there are no external-service defaults.
- Zero errors is a deterministic baseline, not proof of semantic correctness, UI behavior or approval. Review pending/review-due sources and retain unresolved questions.

## Relationship to other wiki skills
- Absorbing new sources: `/wiki-ingest` (its mini-lint reuses this script). Question answering + authorized write-back: `/wiki-query`.
