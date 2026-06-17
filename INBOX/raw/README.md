---
title: Raw Sources
---

# INBOX/raw — Immutable Sources

This is the drop zone for the source material the **LLM Wiki** absorbs: web clippings, book notes, podcast transcripts, and anything else you want the wiki to read. Subfolders:

- `Books/` — book notes / highlights
- `Clippings/` — web articles (e.g. captured with the Obsidian Web Clipper)
- `Podcasts/` — podcast transcripts / show notes
- `Videos/` — video notes
- `EverythingElse/` — anything that doesn't fit above

**Rules**
- These files are **immutable**: the LLM reads from them but never edits the body or filename. The only exception is adding the three tagging frontmatter fields (`tags` / `keywords` / `summary`) during ingest. See [[wiki-schema]].
- **This template ships with no third-party content.** Add your own sources here. Don't commit copyrighted full text to a public repo — keep private sources out of version control (or in a separate private vault) if needed.
