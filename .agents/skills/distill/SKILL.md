---
name: distill
description: Form a new permanent note from literature, or precisely improve an existing permanent note. Preserve the distinction between source claims, AI candidates and the user's confirmed position. Use for distill, crystallize an idea, form a viewpoint, or improve a permanent note.
---

# Distill: new or existing permanent notes

Literature records what a source says. Permanent notes preserve a reusable understanding, judgment, distinction or open question that the user chooses to keep. Wiki is a parallel synthesis layer; it is not a required intermediate step.

## Scope and ownership

- Write only the authorized files in `ZETA/PERMANENT/`. Literature, raw and Wiki remain entirely read-only, including metadata and backlinks. An explicitly authorized vocabulary addition is separate and follows `SYSTEM/TAGS/tag-spec.md`.
- Read `AGENTS.md`, `SYSTEM/TEMPLATE/FORMAT/template_permanent_note.md`, `SYSTEM/TAGS/tag-spec.md`, `SYSTEM/TAGS/tag-library.md` and `SYSTEM/TAGS/keywords-summary-spec.md` first. Use existing tags; do not invent them to finish a draft.
- Separate **source claim**, **AI candidate interpretation**, and **user-confirmed position**. Never invent personal experience, measured results, feedback, adoption or first-person claims. An unanswered question is not agreement.
- Reuse the user's statements and authorization in this session. Ask only about unresolved information that affects the wording, claim or write scope. Historical drafts and missing markers do not establish adoption.
- New literature links in `connections` and the body always use `[[ZETA/LITERATURE/<title>]]`. Resolve them across the entire vault, since raw and literature may have the same name.
- Do not delegate unless requested. There is no monthly quota, minimum source count or fixed per-call limit. Work within the requested batch and available evidence; do not create notes to meet a number.
- Content authorization does not authorize staging, commit or push; follow `SYSTEM/DOCS/agent-workflows.md`.

## 1. Find a concrete question

Entry points: a named source, a topic, a request for candidates, or an exact existing permanent-note path.

Read complete frontmatter to shortlist literature by topic/date/count. These organize reading only; they are not maturity thresholds. A missing date is unknown, never replaced by mtime. A source already linked to a permanent note may still support a different question or new evidence. A link does not prove a question is covered or that the user agrees.

Search existing permanent notes by title, aliases, body and connections before proposing a new file. Read every source actually used, including human annotations, and compare likely duplicate notes. Explain:

| Criterion | Evidence to provide |
|---|---|
| Question | What specific distinction or judgment would this note preserve? |
| New understanding | What is added beyond the existing note: a claim, condition, counterexample or open question? |
| Evidence | Which source passage supports each claim? Repeated summaries of one source are not independent evidence. |
| Relevance | Which current question or stated use makes this useful? If unknown, say so. |

Recommend new candidate / precise update / defer / reference only / no change. A single sufficient source can qualify; many weak sources do not make a strong claim. Do not manufacture a candidate when there is no useful addition.

## 2. Resolve only the gaps

For a new note, propose its question, exact path, outline, source contributions, use and boundaries. Distinguish what the user has already expressed from what the AI proposes. Ask only the missing questions about position, experience, conditions or use; allow the user to leave an open question. A request to save the outline as a candidate permits a draft, not a confirmed viewpoint.

For an existing note, read the full body, frontmatter, annotations and relevant sources. Show **already clear / unresolved / exact proposed edits**. Do not ask again for settled positions or experiences. If evidence conflicts with human text, show the conflict and seek the missing decision; do not silently change the author's position. If the new question is independent, explain why a separate note may be warranted before switching scope.

Reuse already explicit wording and scope approval. If there is no new evidence, understanding or user expression, report no change and write nothing.

## 3. Write the smallest authorized change

### New note

Use the permanent template's fields, selectors and both Datacore blocks without replacing the existing connection helper wiring. Include a core claim or question, reasoning with qualified literature links, concrete use, conditions/limits/counterexamples, and open questions when useful. Unknown limits remain unknown; no invented practice story is needed.

Until the corresponding position is explicitly confirmed, keep this actual body marker (outside code fences):

```markdown
> [!todo] Personal viewpoint pending
> AI candidate interpretation; specify which judgment still needs the user's decision.
```

Fill `connections` with the literature substantively used; the literature Backlinks view will find it without writing literature. `wiki_links` is optional and deliberate; it never changes the Wiki page. Do not turn uses into forced tasks.

### Existing note

- Edit only approved paragraphs and necessary fields in the original file. Preserve manual wording, comments, quotes, code, selectors, Datacore blocks and unrelated sections. Unknown authorship is treated as protected content.
- Preserve frontmatter verbatim by default: `created`, tags, keywords, summary, aliases, custom fields, existing connections and their order. Do not serialize/reformat the whole header, refresh dates or remove old/non-literature connections. Append only necessary, authorized new links.
- If summary conflicts with new text, propose the specific change instead of overwriting it. Equivalent uses/limits already present do not need forced new headings.
- Partial confirmation narrows the pending marker; it does not clear unresolved judgments. Remove the marker only when the user explicitly confirms the relevant position and its removal. Finishing a draft, source checks or lint is not confirmation. A user can explicitly choose to retain an open question.
- Read target and sources again immediately before writing; compare with saved content/hash. Reconcile new changes rather than overwriting a concurrent edit. An existing new-note path switches to the update workflow, never `_2` or destructive replacement.

## 4. Verify and report

Compare the diff to the authorized paragraphs/fields; check source identity, supporting passages, full-vault link resolution and marker scope. Confirm all source files remain unchanged. Report created / improved / no-change / deferred files, still-unconfirmed judgments and actual Git state. Structural checks do not prove factual truth, real-world effectiveness, model compliance or Obsidian rendering.

Browse results in `HUB/MOC/Permanent MOC.md`. **Unmarked is not confirmed.** The dashboard filters actual markers and displays loading/read failures separately.
