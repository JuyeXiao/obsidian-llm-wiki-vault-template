---
tags: []
keywords: 
summary:
type: literature_note
published:
connections: 
created: <% tp.file.creation_date() %>
reference: 
---

# <% tp.file.title %>

**Select Connection:** `INPUT[inlineListSuggester(optionQuery(#permanent_note), optionQuery(#literature_note), optionQuery(#fleeting_note)):connections]`

## Source
<!-- [[Original clipping title]] · platform (author [[x]]); this single link is the only way back to the source -->

## Summary

## Key Points
<!-- Outline of core points: 5-8 items, numbered, matching the numbering in the next section -->
1. **<core point>**: .
   - Support: .

## Key Points in Detail
<!-- Matches the numbering in Key Points; break "concrete examples / data" into labelled sub-items (one aspect per line) -->
1. **<point>**
   - **Main argument**:
   - **Concrete example / data**:
     - **<aspect>**:
   - **Quote from source**:

## Core Themes / Keywords

## Article Type & Intent
<!-- This article is of type **X**. Its main intent is **Y**. -->

## My Annotations

# 🔗 Backlinks

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

return function Backlinks() {
    const current = dc.useCurrentFile();
    const all = dc.useQuery('@page');
    const rows = dc.useMemo(function () {
        const res = [];
        for (let i = 0; i < all.length; i++) {
            const p = all[i];
            if (p.$path === current.$path) continue;
            if (H.connectionsInclude(p, current)) res.push(p);
        }
        return res;
    }, [all, current]);
    return H.tabTable(rows, H.connectionCols, "No backlinks yet", 10);
}
```
