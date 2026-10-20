---
tags: []
keywords: 
summary:
type: fleeting_note
connections: 
created: <% tp.file.creation_date() %>
---

# <% tp.file.title %>

**Select Connection:** `INPUT[inlineListSuggester(optionQuery("ZETA/PERMANENT"), optionQuery("ZETA/LITERATURE"), optionQuery("ZETA/FLEETING"), useLinks(true)):connections]`

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
