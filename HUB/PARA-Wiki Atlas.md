---
title: PARA · Wiki Atlas
cssclasses:
  - hide-properties_editing
  - hide-properties_reading
---

# 🌉 PARA · Wiki Atlas

> [!info] What is this
> A two-way, side-by-side map of your hand-written **PARA** (areas / projects) and the **LLM Wiki** (`INBOX/wiki`), grouped by **topic clusters**: each cluster lists its wiki pages alongside the PARA areas / projects that map to it.
> The mapping is driven by the `topic/` tags shared by both systems (see `TOPIC_TO_CLUSTER` in `SYSTEM/SCRIPTS/datacore_helpers.md`). The wiki is maintained by the LLM and read-only for you; **this page is read-only and never modifies the wiki**.

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));
return function AtlasView() { return <H.WikiAtlas />; };
```
