# Wiki source governance

The normative contract is [wiki-schema.md](../../INBOX/schema/wiki-schema.md). This guide describes operations; the Node engine owns deterministic evaluation. No external service, account or private policy is required. [中文](zh/source-governance.md)

## Decisions and evidence

Use `ingest_existing`, `ingest_new`, `archive_only`, `by_design_skip` or `defer`. Ingest requires all recorded target pages to cite the exact raw source; non-ingest conflicts with a citation. Defer requires a review date or named revisit trigger. Decisions retain reasons, confidence, date, body hash and policy override identity; they never store derived implementation states. Do not claim a completed disposition from a log sentence.

The public policy file starts with `{"schema_version":1,"policies":[]}`. Registry and Markdown schema also use version 1. Missing/unknown versions fail. Policy defaults match both exact type and a path prefix, permit only archive/skip defaults, and have explicit override rules. Do not silently import someone else's policies.

## Read the result

```sh
node .agents/skills/wiki-lint/scripts/wiki-lint.js --json
node .agents/skills/wiki-lint/scripts/wiki-lint.js --cluster Productivity
node .agents/skills/wiki-lint/scripts/wiki-lint.js --today 2030-01-01 --revisit new_evidence --json
node .agents/skills/wiki-lint/scripts/wiki-index.js --check
```

All are read-only. Human/JSON output share one result; a cluster limits displayed pages, not the full checks. `unreferenced_raw` means no real citation; `remaining_orphan` includes unresolved pending/blocked/conflict/review_due/stale sources, even when cited. Archive/skip/active defer can be unreferenced without being remaining orphans. `legacy_ingested` means a citation exists without a decision. `satisfied` means evidence matches the current disposition; it says nothing about semantic quality or user adoption.

Errors (exit 1) include bad versions/contracts, ambiguous source identity, wrong counts/index/navigation, blocked decisions, citation conflicts and changed body hashes. Pending and due review are warnings, so exit 0 alone does not close every source. A reference must uniquely resolve inside raw and to the same file across all Obsidian Markdown pages. English `## Sources` is structural; each bullet's first link is its source, with later links treated as related pages. Full paths avoid raw/literature title collisions.

## Update an authorized decision

1. Read the current registry and policies. Snapshot shared targets; preserve unrelated decisions. Finish the authorized page/index/MOC changes first. Wiki operations never change raw.
2. Copy the whole registry to a candidate JSON outside the vault. Follow the exact fields in schema §6. Compute `raw_body_sha256` using the exported `bodySha256` function below. Never substitute a whole-file hash. Ingest target sets must equal the actual citation set.
3. Validate the candidate, then write only with registry authorization. The write command repeats the **full** check and requires every submitted decision to be satisfied. Due/stale/blocked/conflicting records must be reviewed before writing; do not discard them to make a check pass.
4. Recheck the saved registry. An error leaves it unchanged. The script does not create Wiki pages or logs. Stop concurrent writers while updating the shared registry: fingerprint comparison and atomic replacement do not provide a multi-process transaction.

```sh
node -e "const fs=require('node:fs');const s=require('./.agents/skills/wiki-lint/scripts/wiki-state.js');console.log(s.bodySha256(fs.readFileSync('INBOX/raw/Clippings/Note-Taking Basics (example).md','utf8')))"
node .agents/skills/wiki-lint/scripts/wiki-lint.js --decisions /path/to/candidate.json --json
node .agents/skills/wiki-lint/scripts/wiki-lint.js --write-decisions /path/to/candidate.json --json
node .agents/skills/wiki-lint/scripts/wiki-lint.js --json
```

`bodySha256` strips frontmatter, normalizes CRLF to LF and preserves remaining whitespace. Metadata-only edits do not stale a decision; body changes do. Replace `/path/to/candidate.json` with your actual candidate path. These commands use only Node standard libraries.

## Maintain links, counts and navigation

Content pages require sources; `wiki_overview` requires at least one source and `wiki_conflict` at least two. `wiki_moc` and the root `wiki_index` require zero sources and no Sources section. `source_count` counts distinct resolved raw identities. The index covers all content/MOC pages once, under the matching category, using short types and actual counts; MOC lines omit counts. Cluster MOCs cover their members. Navigation links must resolve across the whole vault.

`/wiki-ingest` and authorized `/wiki-query` write-back use this engine; `/wiki-lint` reports by default. The write hooks reuse its page contract but do not substitute for full state/index checks. Bash/Python compatibility entrypoints forward to Node. Source text cannot grant tools, write scopes or Git permissions. See [migration](migration.md) before moving older state files.
