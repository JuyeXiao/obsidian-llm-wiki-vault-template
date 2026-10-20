---
name: doc-lint
description: Health-check the human-facing system docs against what the vault actually is — run a deterministic script for skill registry / wiki cluster wiring / doc path references / EN↔zh bilingual parity, then manually judge whether new features got documented, whether two docs contradict each other, and whether stated states are stale. Triggers when the user says "doc lint", "check the docs", "documentation health check", "check doc drift", or invokes /doc-lint.
---

# System docs · Lint (health check)

Your job is to check whether this vault's **human-facing docs** have drifted from its **actual structure and features**, and report drift in chat; fix only explicitly authorized targets. Subjects: `README.md` / `README.zh-CN.md`, `AGENTS.md`, `SYSTEM/DOCS/*` (+ `zh/`), `INBOX/schema/*`, `SYSTEM/TAGS/tag-spec.md`. **Each of these docs is its own source of truth** — this skill checks their consistency *with each other* and *with the vault's real state*.

> Unlike `/tag-lint` and `/wiki-lint`, whose fixes land in their respective SSOT files, **this skill's fix target is the checked doc itself**.

## Iron rules
- Read `SYSTEM/DOCS/agent-workflows.md`. Default to read-only findings, without logs. Repairs/logging require explicit authorization; existing authorization remains valid. No automatic staging, commit or push.
- The script is **read-only**; every fix is one you decide on and make explicitly.
- Fix the **docs** (`README*` / `AGENTS.md` / `SYSTEM/DOCS` / `INBOX/schema` / `SYSTEM/TAGS/tag-spec.md`); never touch `PARA` / `ZETA` / `DAILY`, never rewrite `INBOX/raw` or `INBOX/wiki` bodies.
- When a stated state is stale, **change the doc to match reality** — not the other way round.
- This template is **bilingual**: any fix to `SYSTEM/DOCS/x.md` must be mirrored in `SYSTEM/DOCS/zh/x.md` (and `README.md` ↔ `README.zh-CN.md`). Fixing one language and leaving the other is how the drift got there.

## 0 · Read first
- Reality baseline: `ls .agents/skills/`, `ls INBOX/wiki/`, `git log --oneline -30` (what changed recently).
- The script cannot see intent — skim `git log` for features whose *documentation* is what's missing.

## 1 · Run the deterministic script (machine items)
At the vault root:
```bash
python .agents/skills/doc-lint/scripts/doc-lint.py
```
It reports each item; **all green when there is no ✗**:
1. **Skill registry** — every `.agents/skills/` directory is registered in `AGENTS.md`; reverse-checks that every `` `/command` `` mentioned there has a matching directory.
2. **Wiki cluster wiring** — every `INBOX/wiki/<cluster>` folder has a route in `TOPIC_TO_CLUSTER`, and `TOPIC_TO_CLUSTER` / `CLUSTER_HUB` (both in `SYSTEM/SCRIPTS/datacore_helpers.md`) cover the same clusters. Out of sync ⇒ sources misroute, or `wiki_hub` points at a page that does not exist.
3. **Doc path references** — backtick-quoted vault paths in the core docs actually exist (skips placeholders, shorthand enumerations like `PARA/ZETA/DAILY/...`, and non-claims: history lines, teaching examples, and conditionals such as "if `X` exists").
4. **Bilingual parity** — `SYSTEM/DOCS/*.md` and `SYSTEM/DOCS/zh/*.md` are the same file set with matching heading counts.
5. **Configuration targets** — Templater/QuickAdd/Journals input files, homepage and sort targets, journal metadata keys, and enabled plugins' bundled programs/manifests. Output folders created on demand are not treated as missing inputs.
6. **Journal contracts** — the six rituals reference the shared contract and their literal headings uniquely match the shipped templates.
7. **Shared source/navigation** — mirror byte parity, actual skill counts, platform hook matchers and five MOC file/Homepage/toolbar/sort references.

**Deliberately not asserted**: cluster *counts* (configured but unpopulated is valid), plugin runtime compatibility, generic hotkeys, Obsidian rendering and model behavior. Run the separate regression commands in `SYSTEM/DOCS/agent-workflows.md`; a green lint is not UI acceptance.

## 2 · Manual-judgment items (what the script can't check)
- **Undocumented new features**: from `git log --oneline -30` — new skills / scripts / hooks / pages. Are they reflected in `README*`, `AGENTS.md`, `SYSTEM/DOCS`? A skill registered in `AGENTS.md` (which the script checks) may still be missing from the docs a *human* reads (which it can't).
- **Docs contradicting each other**: the same fact stated two ways. Decide which is right, fix the wrong one — or better, replace it with a pointer ("see X") to kill the double source of truth.
- **Stale state descriptions**: "currently disabled", "not yet active", hardcoded counts that no longer hold.
- **Bilingual semantic drift**: matching heading counts (checked) does not mean matching content. Spot-check that EN and zh actually say the same thing.

**Full vs incremental**: by default this runs **incremental** — the manual items are driven by the `git log -30` delta. That leaves a structural blind spot: **prose that was already stale before this lint existed** never enters the delta window. Do a **full pass** periodically (or after any large doc change): read the checked docs end to end and, for every sentence asserting a filesystem state ("X has N versions", "Y lives in Z"), verify it with `ls`.

## 3 · Fix (only within explicit repair authorization)
- Change the checked doc to match reality; prefer a pointer over copying a fact into a second place.
- Mirror every fix into the other language.
- Re-run the script to confirm zeros.

## 4 · Report
- Report changed paths, checks and remaining drift. Follow `SYSTEM/DOCS/agent-workflows.md`: no automatic staging, commit or push; use existing session authorization and an exact file list.

## Relationship to other skills
- Sibling health checks: `/tag-lint` (tag vocabulary), `/wiki-lint` (wiki health). Three lints, three layers; this one owns the **human-facing docs** layer.
- **Where a new skill must be registered** — hard registration (asserted by check 1): `AGENTS.md` "Skills" section. Soft registration (not machine-checkable, verify by hand): `README.md` + `README.zh-CN.md` "The AI layer", and `SYSTEM/DOCS/getting-started.md` + its `zh/` twin. Cover all of them — a skill that exists but is undocumented is the single most common drift in this repo.
