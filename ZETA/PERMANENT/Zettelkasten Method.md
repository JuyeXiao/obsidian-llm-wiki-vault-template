---
tags: [topic/productivity/note-taking]
keywords: [future question, evidence, purposeful links]
summary: "Example candidate judgment: a permanent note should explain a future use and retain the limits of its supporting source."
type: permanent_note
wiki_links: ["[[INBOX/wiki/Productivity/Note-Taking]]"]
connections: ["[[ZETA/LITERATURE/Note-Taking Basics (example)]]"]
created: 2026-01-06
---

# Zettelkasten Method

> Original example candidate, not a real user's confirmed position or experience.

**Select Connection:** `INPUT[inlineListSuggester(optionQuery("ZETA/PERMANENT"), optionQuery("ZETA/LITERATURE"), optionQuery("ZETA/FLEETING"), useLinks(true)):connections]`
**Select Wiki:** `INPUT[inlineListSuggester(optionQuery("INBOX/wiki")):wiki_links]`

> [!abstract] Core candidate judgment
> A permanent note can be easier to reuse when it names a future question and explains why each source or connection matters.

> [!todo] Personal viewpoint pending
> The usefulness of this method and the acceptable overhead remain for the reader to judge.

## Reasoning

**Source claim:** the example proposes a specific question, traceable source context and purposeful links. [[ZETA/LITERATURE/Note-Taking Basics (example)]] summarizes those claims and their limits.

**AI candidate interpretation:** keeping the intended use alongside the evidence could help a reader decide whether to reuse a note. This is a reasoned proposal, not a demonstrated result or an adopted personal belief.

**User-confirmed position:** none supplied in this example.

## Uses and limits

A hypothetical portfolio writer could consult this question when choosing evidence for an About page. It may be less useful for reference tables that are already easy to retrieve. If recording questions becomes repetitive overhead, the method should be simplified or rejected. No personal practice outcome is claimed.

## Open questions

What kind of note would actually become easier to retrieve? What counterexample would show the extra wording is unnecessary?

## Source literature

- [[ZETA/LITERATURE/Note-Taking Basics (example)]] — supplies the proposal, hypothetical use and explicit lack of outcome evidence.

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
