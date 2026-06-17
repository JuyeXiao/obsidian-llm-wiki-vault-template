---
name: wiki-lint
description: Health-check the LLM Wiki (INBOX/wiki) — run a deterministic script for broken links / orphan sources / page-name collisions / source traceability / tag pollution, then manually check for contradictions, staleness, and gaps, and record the result in the log. Triggers when the user says "lint the wiki", "wiki health check", "check the wiki", "find orphan sources", "find broken links", or invokes /wiki-lint.
---

# LLM Wiki · Lint (health check)

Your job is to check the health of `INBOX/wiki/` and propose fixes. This skill is the **runbook**; the **single source of truth for the rules is [`INBOX/schema/wiki-schema.md`](INBOX/schema/wiki-schema.md)**.

## Iron rules (memorize first)
- Checking and fixing **write only to `INBOX/wiki/`**; `raw/` is read-only (tag pollution etc. is **reported only**, not fixed in raw; cleanup needs user confirmation).
- Fixes also follow the ingest conventions: link **by name `[[link]]`**, `wiki_*` type, `## Sources` backlinks.

## Execution flow

### 1 · Run the deterministic script (machine-checkable items)
Run at the vault root (no arg = whole vault; with a cluster name = that cluster only):
```bash
bash .claude/skills/wiki-lint/scripts/wiki-lint.sh            # whole vault
bash .claude/skills/wiki-lint/scripts/wiki-lint.sh Career     # single cluster
```
The script reports each item; **all green when there is no ✗**:
1. **Broken links** — a `[[target]]` in a page has no same-named `.md` anywhere in the vault (usually a mistyped basename / inconsistent special characters).
2. **Orphan raw** — a `raw` source not `[[referenced]]` by any wiki page (whitelist skips `Books`). A `•` item is a stray source awaiting merge.
3. **Page-name collisions** — a wiki page name appears ≠1 times vault-wide (collisions with PARA/ZETA break by-name linking).
4. **Source not resolving to raw** — a `[[X]]` in `## Sources` is not in `raw` (fake/mistyped source).
5. **Tag pollution** — trailing-quote pollution in `raw` frontmatter `topic/…"` (**reported only**).

### 2 · Manual-judgment items (what the script can't check)
Read the relevant pages and judge: **contradictions** between pages, **stale** conclusions, **orphan wiki pages** (no inbound links — `grep -rc "[[<page name>]]" INBOX/wiki` is 0), **missing concept pages / cross-references**, data or sources that could be added.

### 3 · Fix (within scope)
- **Orphan raw (`•`)** → merge into the appropriate concept page per [`/wiki-ingest`](.claude/skills/wiki-ingest/SKILL.md) conventions (prefer merging into an existing page rather than starting a new one).
- **Broken link / source not resolving** → fix the basename (Glob for the exact name first).
- **Collision** → rename the wiki page to something more specific + update every `[[]]` referencing it (`grep -rl` to find them all).
- **Tag pollution** → **report only** to the user (raw is read-only).
- Re-run the script after fixing to confirm zeros.

### 4 · Record and commit
- Append one entry to [`INBOX/wiki/log.md`](INBOX/wiki/log.md): `## [YYYY-MM-DD] lint | <scope>` with findings, fixes, remaining items (including by-design whitelist skips like `Books`), and any new questions to ask / sources to find.
- If anything was fixed → `git add INBOX/wiki/` → commit with a concise message; do not stage `.obsidian`/`DAILY`; prompt that a push is possible.

## Notes
- The script is read-only and changes no files; every write is an explicit fix you decide on.
- Not every "orphan raw" must be picked up: long-tail / pure-index items (like `Books`) can be skipped by design, but say so in the log — don't silently ignore them.
- Green baseline: 0 broken links / orphans only on the whitelist / 0 collisions / all sources traceable — use it as a regression reference.

## Relationship to other wiki skills
- Absorbing new sources: `/wiki-ingest` (its step 6 mini-lint reuses this script). Question answering + write-back: `/wiki-query`.
