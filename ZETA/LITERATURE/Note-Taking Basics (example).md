---
tags: [topic/productivity/note-taking]
keywords: [retrieval, questions, links]
summary: The original example proposes naming a future question and explaining the purpose of a link, while leaving effectiveness untested.
type: literature_note
published:
connections: []
created: 2026-01-05
reference: "[[INBOX/raw/Clippings/Note-Taking Basics (example)]]"
---

# Note-Taking Basics (example)

> Original example literature note. This is a source summary, not a reader's confirmed position.

**Select Connection:** `INPUT[inlineListSuggester(optionQuery("ZETA/PERMANENT"), optionQuery("ZETA/LITERATURE"), optionQuery("ZETA/FLEETING"), useLinks(true)):connections]`

## Source

[[INBOX/raw/Clippings/Note-Taking Basics (example)]] — original template text, not a third-party article.

## Summary

The source proposes naming the question a note may answer, preserving source context, and explaining each useful link. It explicitly provides no measured outcome or personal endorsement.

## Key Points

1. **Name the future question**: a specific question exposes missing conditions. Locator: raw “Write for a future question”.
2. **Explain the link and its limits**: a possible use is not evidence of success. Locators: raw “Link with a reason” and “Limits”.

## Key Points in Detail

1. **Name the future question**
   - The source contrasts an About-page evidence question with the broad word “writing”. This is a hypothetical example, not a tested comparison.
   - Source phrase: “retaining the source makes that condition checkable later.”
2. **Explain the link and its limits**
   - A note may inform a portfolio draft; the link itself does not prove improvement.
   - Reference-only material and unresolved claims need not become permanent notes. No quantitative result is available.

## Core Themes / Keywords

Questions, retrieval, source context, explicit connections, uncertain effectiveness.

## Article Type & Intent

Original instructional example demonstrating an evidence chain. Its method is proposed for consideration, not established as universally effective.

## My Annotations

# 🔗 Backlinks

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

return function Backlinks() {
    const current = dc.useCurrentFile();
    const all = dc.useQuery('@page');
    const connectionIndex = dc.useMemo(() => H.buildConnectionIndex(all), [all]);
    const rows = dc.useMemo(function () {
        const res = [];
        for (let i = 0; i < all.length; i++) {
            const p = all[i];
            if (p.$path === current.$path) continue;
            if (H.connectionsInclude(p, current, connectionIndex)) res.push(p);
        }
        return res;
    }, [all, current, connectionIndex]);
    return H.tabTable(rows, H.connectionCols, "No backlinks yet", 10);
}
```
