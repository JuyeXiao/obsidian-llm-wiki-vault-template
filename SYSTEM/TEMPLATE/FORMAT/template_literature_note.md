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

**Select Connection:** `INPUT[inlineListSuggester(optionQuery("ZETA/PERMANENT"), optionQuery("ZETA/LITERATURE"), optionQuery("ZETA/FLEETING"), useLinks(true)):connections]`

## Source
<!-- Use the full raw path. See literature-note-spec.md for evidence and safe updates. -->

## Summary

## Key Points
<!-- Evidence determines the point count; match the detail numbering. Omit unsupported cases/quotes. -->
1. **<core point>**: .
   - Support / source locator: .

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
