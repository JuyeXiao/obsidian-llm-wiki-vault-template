---
tags: []
keywords: 
summary:
type: fleeting_note
connections: 
created: <% tp.file.creation_date() %>
---

# <% tp.file.title %>

**Select Connection:** `INPUT[inlineListSuggester(optionQuery(#permanent_note), optionQuery(#literature_note), optionQuery(#fleeting_note)):connections]`

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
