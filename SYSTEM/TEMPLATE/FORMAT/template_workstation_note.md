---
tags: []
keywords: 
summary:
type: workstation_note
connections: 
created: <% tp.file.creation_date() %>
---

# <% tp.file.title %>

**Select Connection:** `INPUT[inlineListSuggester(optionQuery("PARA/PROJECTS"), optionQuery("PARA/AREAS"), optionQuery("PARA/WORKSTATION"), optionQuery("PARA/RESOURCES/DOCUMENTATIONS"), useLinks(true)):connections]`

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
    return H.tabTable(rows, H.connectionCols, "No notes reference this note yet", 10);
}
```
