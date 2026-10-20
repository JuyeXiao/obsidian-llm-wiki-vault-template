---
name: tag-lint
description: Read-only tag health check for malformed tags, drift and duplicates, followed by manual review of near-synonyms. Repairs and logging require explicit authorization. Triggers on "lint tags", "tag health check", "find unregistered tags", or /tag-lint.
---

# Tagging system · Lint (health check)

Your job is to check the health of the controlled tag vocabulary and propose fixes. This skill is the **runbook**; the **single source of truth for the rules is [`SYSTEM/TAGS/tag-spec.md`](SYSTEM/TAGS/tag-spec.md)** + [`tag-library.md`](SYSTEM/TAGS/tag-library.md).

## Iron rules
- Read `SYSTEM/DOCS/agent-workflows.md`. Default to read-only findings in chat; repairs and logging require explicit authorization. No automatic staging, commit or push.
- The script is **read-only** and changes no files; every fix is one you decide on and make explicitly.
- Fixes write **only frontmatter** (`tags` / `keywords` / `summary`) — never note bodies. `INBOX/raw` bodies are read-only.
- **Never overwrite human-authored values**; merge only.
- A tag is legitimate only once it is **written back to [`tag-library.md`](SYSTEM/TAGS/tag-library.md)**. Fixing drift means either correcting the note *or* adopting the tag into the library — decide which, don't leave it dangling.
- Authorized note fixes are limited to the three tagging fields in `PARA` / `ZETA` / `INBOX/raw`. Explicit vocabulary/log authorization may additionally cover the tag library, generated flat list or tag log under `SYSTEM/TAGS`; no other SYSTEM writes.

## Execution flow

### 1 · Run the deterministic script (machine-checkable items)
Run at the vault root (no arg = default scope `PARA` + `ZETA` + `INBOX/raw`):
```bash
bash .agents/skills/tag-lint/scripts/tag-lint.sh                 # default scope
bash .agents/skills/tag-lint/scripts/tag-lint.sh PARA/AREAS      # explicit scope
```
It derives the current vocabulary in a temporary file without changing `SYSTEM/TAGS/tag-library.flat.txt`, then reports each item; **all green when there is no ✗**. Findings return exit 1; informational stats do not fail the check:
1. **Malformed tags** — trailing slash / empty segment (`//`) / `type` written as an array.
2. **Drift** — a `topic/*` or `task/*` tag is in use but is not in `tag-library.md`. This is the main check.
3. **In-note duplicates** — the same tag appears twice on one note's `tags` line.
4. **Stats** (info, never a failure) — notes in scope, notes missing a topic tag, has-topic-but-no-keywords/summary, defined-but-unused tags.

> The flat list is a **build artifact** — never hand-edit it. After an authorized vocabulary change, explicitly run `bash .agents/skills/tag-lint/scripts/build-taglist.sh` to update the flat file; then rerun lint.

### 2 · Manual-judgment items (what the script can't check)
- **Near-synonym merges**: the library grew two tags meaning the same thing (`topic/ai/llm` vs a newly drifted `topic/ai/large-language-models`). Pick the standard name, retag the notes, delete the loser from the library.
- **Adopt or reject a drifted tag**: is it a genuine new domain (→ adopt into the library under the right parent per tag-spec §2) or a careless variant of an existing tag (→ retag the note)?
- **Depth and balance**: a `topic/*` root with dozens of children wants sub-grouping; one with a single child may not deserve to exist.
- **False-absence rule** (tag-spec §5): before concluding "the library has no match", search it exhaustively — synonyms, parent categories, variant spellings. Wrongly deciding a tag is missing is the main source of drift.

### 3 · Fix (only within explicit repair authorization)
- **Drift → adopt**: add the tag to `tag-library.md` under the correct parent, re-run the script (drift should drop to 0).
- **Drift → reject**: retag the offending notes to the standard tag (`grep -rl` to find them all).
- **Malformed**: fix the frontmatter of the named notes.
- **Duplicates**: remove the repeat, keep one.
- Re-run the script after fixing to confirm zeros.

### 4 · Report and optional log
- Return findings in chat. Only with explicit logging authorization, append one entry to [`SYSTEM/TAGS/tag-log.md`](SYSTEM/TAGS/tag-log.md): `## [YYYY-MM-DD] lint | <scope>` with findings, fixes, and remaining items (including anything deliberately left alone, and why).
- Follow `SYSTEM/DOCS/agent-workflows.md`: no automatic staging, commit or push; use existing session authorization and an exact file list.

## Notes
- `tag-library.flat.txt` is a tracked generated artifact; include its authorized changes in an explicitly authorized commit: the write-guard hook (`.claude/hooks/validate-vault-write.py`) reads it for its topic-tag drift early warning, and silently skips that check when the file is absent. A stale or missing flat list means the hook stops catching drift at write time.
- `defined but unused tags` is expected to be large in a fresh vault — the seed library is deliberately broader than the demo content. It is not a defect.
- Green baseline: 0 malformed / 0 drift / 0 duplicates — use it as a regression reference.

## Relationship to other skills
- Tagging notes: `/tag` (this skill checks what that one writes). Both obey `SYSTEM/TAGS/tag-spec.md`.
- Sibling health checks: `/wiki-lint` (LLM Wiki), `/doc-lint` (human-facing docs). Three lints, three layers.
- The tagging system **writes** `raw` frontmatter; the wiki system **reads** `raw` topic tags to route sources into clusters — so drift here silently misroutes `/wiki-ingest`.
