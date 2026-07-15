---
name: doc-lint
description: Health-check the human-facing system docs against what the vault actually is — run a deterministic script for skill registry / wiki cluster wiring / doc path references / EN↔zh bilingual parity, then manually judge whether new features got documented, whether two docs contradict each other, and whether stated states are stale. Triggers when the user says "doc lint", "check the docs", "documentation health check", "check doc drift", or invokes /doc-lint.
---

# System docs · Lint (health check)

Your job is to check whether this vault's **human-facing docs** have drifted from its **actual structure and features**, and to fix them. Subjects: `README.md` / `README.zh-CN.md`, `CLAUDE.md`, `SYSTEM/DOCS/*` (+ `zh/`), `INBOX/schema/*`, `SYSTEM/TAGS/tag-spec.md`. **Each of these docs is its own source of truth** — this skill checks their consistency *with each other* and *with the vault's real state*.

> Unlike `/tag-lint` and `/wiki-lint`, whose fixes land in their respective SSOT files, **this skill's fix target is the checked doc itself**.

## Iron rules
- The script is **read-only**; every fix is one you decide on and make explicitly.
- Fix the **docs** (`README*` / `CLAUDE.md` / `SYSTEM/DOCS` / `INBOX/schema` / `SYSTEM/TAGS/tag-spec.md`); never touch `PARA` / `ZETA` / `DAILY`, never rewrite `INBOX/raw` or `INBOX/wiki` bodies.
- When a stated state is stale, **change the doc to match reality** — not the other way round.
- This template is **bilingual**: any fix to `SYSTEM/DOCS/x.md` must be mirrored in `SYSTEM/DOCS/zh/x.md` (and `README.md` ↔ `README.zh-CN.md`). Fixing one language and leaving the other is how the drift got there.

## 0 · Read first
- Reality baseline: `ls .claude/skills/`, `ls INBOX/wiki/`, `git log --oneline -30` (what changed recently).
- The script cannot see intent — skim `git log` for features whose *documentation* is what's missing.

## 1 · Run the deterministic script (machine items)
At the vault root:
```bash
python .claude/skills/doc-lint/scripts/doc-lint.py
```
It reports each item; **all green when there is no ✗**:
1. **Skill registry** — every `.claude/skills/` directory is registered in `CLAUDE.md`; reverse-checks that every `` `/command` `` mentioned there has a matching directory.
2. **Wiki cluster wiring** — every `INBOX/wiki/<cluster>` folder has a route in `TOPIC_TO_CLUSTER`, and `TOPIC_TO_CLUSTER` / `CLUSTER_HUB` (both in `SYSTEM/SCRIPTS/datacore_helpers.md`) cover the same clusters. Out of sync ⇒ sources misroute, or `wiki_hub` points at a page that does not exist.
3. **Doc path references** — backtick-quoted vault paths in the core docs actually exist (skips placeholders, shorthand enumerations like `PARA/ZETA/DAILY/...`, and non-claims: history lines, teaching examples, and conditionals such as "if `X` exists").
4. **Bilingual parity** — `SYSTEM/DOCS/*.md` and `SYSTEM/DOCS/zh/*.md` are the same file set with matching heading counts.

**Deliberately not asserted** (would be noise): cluster *counts* (this template seeds 4 cluster routes but ships content for fewer — "configured, not yet populated" is valid, not drift); plugins vs `community-plugins.json` (docs use display names, not plugin ids); hotkeys (no hotkey table ships here).

## 2 · Manual-judgment items (what the script can't check)
- **Undocumented new features**: from `git log --oneline -30` — new skills / scripts / hooks / pages. Are they reflected in `README*`, `CLAUDE.md`, `SYSTEM/DOCS`? A skill registered in `CLAUDE.md` (which the script checks) may still be missing from the docs a *human* reads (which it can't).
- **Docs contradicting each other**: the same fact stated two ways. Decide which is right, fix the wrong one — or better, replace it with a pointer ("see X") to kill the double source of truth.
- **Stale state descriptions**: "currently disabled", "not yet active", hardcoded counts that no longer hold.
- **Bilingual semantic drift**: matching heading counts (checked) does not mean matching content. Spot-check that EN and zh actually say the same thing.

**Full vs incremental**: by default this runs **incremental** — the manual items are driven by the `git log -30` delta. That leaves a structural blind spot: **prose that was already stale before this lint existed** never enters the delta window. Do a **full pass** periodically (or after any large doc change): read the checked docs end to end and, for every sentence asserting a filesystem state ("X has N versions", "Y lives in Z"), verify it with `ls`.

## 3 · Fix (in scope)
- Change the checked doc to match reality; prefer a pointer over copying a fact into a second place.
- Mirror every fix into the other language.
- Re-run the script to confirm zeros.

## 4 · Record and commit
- If anything was fixed → `git add` the docs → commit with a concise message; do not stage `.obsidian`/`DAILY`; prompt that a push is possible.

## Relationship to other skills
- Sibling health checks: `/tag-lint` (tag vocabulary), `/wiki-lint` (wiki health). Three lints, three layers; this one owns the **human-facing docs** layer.
- **Where a new skill must be registered** — hard registration (asserted by check 1): `CLAUDE.md` "Skills" section. Soft registration (not machine-checkable, verify by hand): `README.md` + `README.zh-CN.md` "The AI layer", and `SYSTEM/DOCS/getting-started.md` + its `zh/` twin. Cover all of them — a skill that exists but is undocumented is the single most common drift in this repo.
