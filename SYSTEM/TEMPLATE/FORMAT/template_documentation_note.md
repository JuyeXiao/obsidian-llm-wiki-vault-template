---
tags: 
keywords: 
area: 
category:
summary:
type: documentation_note
connections: 
created: <% tp.file.creation_date() %>
reference: 
---
**Select Connection:** `INPUT[inlineListSuggester(optionQuery("PARA/PROJECTS"), optionQuery("PARA/AREAS"), useLinks(true)):connections]`

# Overview

## Summary

## Details

## Related

# 🔗 Referenced By

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

return function ReferencedBy() {
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
    return H.tabTable(rows, H.connectionCols, "No notes reference this document yet", 10);
}
```
