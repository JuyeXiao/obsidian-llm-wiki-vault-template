---
name: clip-digest
description: Digest INBOX/raw/Clippings into source-faithful ZETA/LITERATURE notes with controlled metadata and explicit raw references. Supports safe same-source updates. Trigger with "digest clippings", "turn clippings into literature notes", or /clip-digest.
---

# Clip Digest (clippings → literature notes)

## Required reading and scope

Read `SYSTEM/TEMPLATE/FORMAT/literature-note-spec.md`, `SYSTEM/TEMPLATE/FORMAT/template_literature_note.md`, `SYSTEM/DOCS/agent-workflows.md` and the three specs in `SYSTEM/TAGS/` before writing. The literature spec is the single source of truth for evidence, section structure, source identity and reruns; do not maintain a second skeleton here.

Write only authorized literature notes in `ZETA/LITERATURE/`. Raw bodies, filenames and frontmatter stay read-only. Tag only newly generated literature metadata; preserve human metadata on existing notes. A new vocabulary entry requires explicit authorization for the tag library and flat-list exception in `tag-spec.md`. No automatic staging, commit or push.

## Select and identify

Use the user's exact source set, or enumerate `type: clippings` sources by the requested `created` date in the user's date/time context. Missing/invalid dates are reported, not replaced by mtime. To find undigested sources, resolve existing literature `reference` values to raw paths across the whole vault; a basename comparison is insufficient. Check source URL/ID, existing targets and filename collisions using the shared literature contract before drafting.

## Digest and write

Read primary evidence; return as many supported points as it warrants, with locators and matched outline/detail numbering. Omit absent quotes, cases and numbers. Reuse the template's exact English headings, path-based selector and Backlinks block; output prose may follow the source language. Fill known metadata only. New `reference` and `## Source` links use the full raw path.

For same-source reruns, snapshot target/raw, protect annotations, metadata, connections and executable blocks, and patch only authorized generated paragraphs. Identity conflicts, missing/duplicate anchors or changed content before writing stop the affected write; never create `_2`. Read back and verify protected regions, references and evidence. A no-change rerun writes nothing.

## Report

Report created/updated/skipped/blocked paths and verification. Compare against the starting baseline so unrelated dirty files remain untouched. Git follows the shared authorization contract. Capture/tag on raw and Wiki ingest are independent stages, never implicit side effects of a literature-only request. Use the main agent unless the user authorizes delegation.

## Continue by need

Use `/distill` to form or refine a permanent note from literature, with a separate permanent-note write scope. `/wiki-ingest` can read the original raw directly; literature is not a mandatory intermediate layer. Neither step is implied by digest authorization. See `SYSTEM/DOCS/by-need.md` for copyable requests.
