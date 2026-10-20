---
tags: []
keywords: 
summary:
type: permanent_note
wiki_links:
connections: 
created: <% tp.file.creation_date() %>
---

# <% tp.file.title %>

**Select Connection:** `INPUT[inlineListSuggester(optionQuery("ZETA/PERMANENT"), optionQuery("ZETA/LITERATURE"), optionQuery("ZETA/FLEETING"), useLinks(true)):connections]`
**Select Wiki:** `INPUT[inlineListSuggester(optionQuery("INBOX/wiki")):wiki_links]`

> [!abstract] Core claim or question
> State the reusable judgment, distinction or question. Label AI candidates explicitly.

> [!todo] Personal viewpoint pending
> Specify the judgment still awaiting the user's confirmation. Remove only within explicit confirmation scope.

## Reasoning

Connect each claim to a qualified literature link and distinguish source claims from candidate interpretation.

## Uses and limits

Name a concrete use, conditions, counterexamples and unknowns. Do not invent practice outcomes.

## Open questions

Keep unresolved questions when useful; omit this section if none remain.

## Source literature

Use qualified links such as `[[ZETA/LITERATURE/<title>]]` and describe each source's contribution.

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

# 🔗 Related Wiki

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));
return function RelatedWikiView() { return <H.RelatedWiki />; };
```
