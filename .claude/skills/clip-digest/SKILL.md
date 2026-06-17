---
name: clip-digest
description: Digest clippings in INBOX/raw/Clippings into ZETA/LITERATURE literature notes — in a single read produce a summary / key points / key points with detail / core themes / article type, apply controlled tags from the tag library, and add a `reference` backlink to the original clipping; never touch the raw body. Triggers when the user says "digest clippings", "turn clippings into literature notes", "organize today's clippings into notes", "clip-digest", or invokes /clip-digest.
---

# Clip Digest (clippings → ZETA literature notes)

Digest a clipping in `INBOX/raw/Clippings/` into a single literature note under `ZETA/LITERATURE/`: the AI analysis (summary / key points / themes / type) happens **here**, not in a browser Web Clipper interpreter — it runs on your Claude Code subscription, batches well, costs the fewest tokens, and keeps the original clipping pristine and unchanged.

One link in the clipping pipeline:
**Clip (clean capture) → `/clip-digest` (this skill: literature note + tagging) → optional `/tag` (tag the raw, for wiki routing) → optional `/wiki-ingest` (cross-source synthesis)**.

## Iron rules

- **Create/edit notes only in `ZETA/LITERATURE/`**; treat `INBOX/raw/` as **read-only throughout** — never change its body, filename, or frontmatter.
- Every literature note must have: `type: literature_note` + a `reference:` backlink to the original clipping (traceability).
- Tagging follows the tag-system SSOT: controlled `topic/*` chosen **only** from [[tag-library]], **no fabrication**; merge, never overwrite manual values; **tag the literature note only, never the raw**.
- Stay faithful to the source, **no fabrication**, **do not restate verbatim / rewrite the whole article**, do not invent content not in the source; for code / tables / long quotes describe only their purpose and key logic — do not paste whole blocks.
- **Summarize the established way** (see step 3): `Key points` = the article's **core-argument outline** (5–8 items + support, reflecting the overall structure); `Key points with detail` = a **deep dive** point-by-point (main argument → concrete cases / data → source quote), making clear **what the author said, how they argued it, and with what support** — detailed, with real data and comparisons. **Linking back to the source relies only on the whole-article link in `## Source`; no per-section anchors in the body.**
- **No auto-commit, no auto-push**: commit with a concise message, exclude `.obsidian`/`DAILY`, and prompt the user to push when done.

## Step 0 · Required reading

- The three tagging specs: [[tag-spec]], [[tag-library]], [[keywords-summary-spec]] (under `SYSTEM/TAGS/`).
- The literature-note template: `SYSTEM/TEMPLATE/FORMAT/template_literature_note.md` — reuse its frontmatter fields and the **`# 🔗 Backlinks` datacorejsx block at the end** (copy verbatim, do not change).
- `ZETA/LITERATURE/` may still be empty — this skill establishes the convention and keeps it consistent.

## Step 1 · Select notes (three entry points, mirroring /tag)

1. **Specified**: a file / folder the user gives (e.g. a single clipping, or `INBOX/raw/Clippings/Articles`).
2. **Today's new**:
   ```bash
   grep -rlE "^created:.*<TODAY>" INBOX/raw/Clippings --include='*.md'
   ```
   `<TODAY>` = system currentDate (`YYYY-MM-DD`).
3. **Undigested**: the difference between existing literature-note `reference`s and the clipping list —
   ```bash
   # clipping titles already referenced by some literature note
   grep -rhoE "reference:.*\[\[.*\]\]" ZETA/LITERATURE --include='*.md'
   # compare against the .md filenames under INBOX/raw/Clippings; those not present = undigested
   ```

Process only sources with `type: clippings`.

## Step 2 · Digest (read once per note, produce everything)

- **Single note**: the main agent reads the clipping body directly → produces the step-3 sections + the step-4 three fields.
- **Batch**: fan-out read-only `Explore` sub-agents, each reading one note and returning a structured result (summary / key-points outline / key points with detail (per point: main argument · concrete cases/data · source quote) / core themes / article type & intent + suggested `topic` tags + keywords + summary); the main agent writes from that. **Sub-agents write no files.**
- Language follows the source (Chinese article → Chinese output). From the clipping's own frontmatter take `title` / `source` / `author` / `published` for the note's "Source" section, `reference`, and the `author` / `published` frontmatter fields (leave blank if the clipping has none).

## Step 3 · Write the literature note

File: `ZETA/LITERATURE/<original title, safe_name>.md` (same title as the source). Write to the structure below (replace Templater placeholders with real values):

```markdown
---
tags: [topic/...]
keywords: [...]
summary: <one sentence>
type: literature_note
author: <article author, from the clipping frontmatter; blank if none>
published: <article publish date YYYY-MM-DD, from the clipping frontmatter; blank if none>
connections:
reference: "[[<original clipping title>]]"
created: <TODAY>
---

# <Title>

**Select Connection:** `INPUT[inlineListSuggester(optionQuery(#permanent_note), optionQuery(#literature_note), optionQuery(#fleeting_note)):connections]`

## Source
[[<original clipping title>]] · <platform> (author [[<author>]])

## Summary
<2–3 sentences: what it covers, what the conclusion is>

## Key points
<the article's core-argument outline: 5–8 items, in the source's logical order, reflecting "core arguments + overall structure"; **numbered**, in **one-to-one order with "Key points with detail"**.>
1. **<core argument>**: <one sentence stating it>.
   - Support: <argument / case / data>.
2. …

## Key points with detail
<one-to-one with "Key points" by number, deep-diving each. **"Concrete cases / data" MUST be split into labeled sub-items** (one aspect per line: `- **aspect**: …`), not piled into one paragraph — this is the key to clarity.>
1. **<point>**
   - **Main argument**: <the author's reasoning / mechanism / framework — how and why (1–3 sentences)>
   - **Concrete cases / data**:
     - **<aspect>**: <number / comparison / case / step>
     - **<aspect>**: <…>
   - **Source quote**: <a memorable line or cited authority, if any; omit if none>
2. …

## Core themes / keywords
<3–5 core themes or keywords>

## Article type & intent
This article's type is **<news / tutorial / commentary / experience sharing / business analysis / theory review… (multiple labels allowed)>**. Its main intent is **<for whom + what the author wants the reader to understand / master / do>**.

## My notes
<leave blank — for the user's own thoughts and extensions>

(Copy the literature-note template's "# 🔗 Backlinks" datacorejsx block here, verbatim, unchanged)
```

Key points:
- Both `reference` and `## Source` link back to the original clipping (whole article); if a same-named raw file creates link ambiguity, qualify with a path `[[Articles/<title>]]`. **No per-section anchors in the body** — linking back relies only on `## Source`.
- `## My notes` is **always left blank** (the user's own space).
- The datacore backlinks block at the end comes from the template read in step 0 — **copy it verbatim**.

## Step 4 · Tag (apply /tag rules, tag the literature note only)

In the same read of the article, fill all three frontmatter fields on the **literature note**:
- `tags`: 1–4 controlled `topic/*`, chosen **only from [[tag-library]]**; only after exhausting it with no match, add a new one → write it back to [[tag-library]] + notify the user.
- `keywords`: 3–8 free-form keywords; `summary`: 1–3 sentences.
- Merge, never overwrite manual values; ascending order, single-line inline arrays; key order per the linter (`tags→keywords→summary→type…`).
- **Do not touch the raw**. To tag the raw (for wiki routing), run `/tag` separately.

## Step 5 · git

```bash
git add ZETA/LITERATURE/
git commit -m "lit: digest clippings → literature notes <scope>"   # concise message
```
When done, **prompt the user that they can push** (do not auto-push); do not stage `.obsidian` / `DAILY`.

## Notes

- Raw immutability is the hard line: after a run, `git status` should show **only `ZETA/LITERATURE/` changes** — `INBOX/raw` must have no changes whatsoever.
- Older clippings whose body **already contains** a summary/key points (generated by an earlier interpreter template) can still get a literature note (adding a notes slot and connections), but need not be re-digested.
- Filename safety: handle `/ : ? *` etc. in titles with a `safe_name` approach.

## Relationship to other skills

- **/tag**: this skill tags the literature notes it **creates**; tagging raw clippings is still `/tag`'s job (both follow the same SSOT).
- **/wiki-ingest**: this skill produces **per-article, human-facing** literature notes (with a notes slot and ZETA connections); wiki-ingest does **cross-source LLM synthesis** into `INBOX/wiki`. Complementary, not overlapping.
- **Web Clipper**: the clipper only does clean capture; AI analysis is moved into this skill to save API / tokens.
