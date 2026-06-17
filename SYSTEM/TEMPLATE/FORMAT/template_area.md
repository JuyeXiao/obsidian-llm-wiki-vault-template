---
cssclasses:
  - hide-properties_reading
tags: []
keywords: 
area: <% tp.file.folder() %>
category: 
summary: 
type: area_family
banner: "![[banner-area.png]]"
banner_y: 0.5
created: <% tp.file.creation_date() %>
---

# [[2. <%tp.file.folder() %>]]

# Overview

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));
return function AreaView() { return <H.AreaDashboard />; };
```

<%* tp.hooks.on_all_templates_executed(async () => {
    const file = tp.file.find_tfile(tp.file.path(true));
    const parts = tp.file.folder(true).split("/");
    const i = parts.indexOf("AREAS");
    const segs = parts.slice(i + 1).map(s => s.toLowerCase().split(" ").join("_"));
    await app.fileManager.processFrontMatter(file, (frontmatter) => {
        frontmatter["tags"] = "area/" + segs.join("/");
    });
}); -%>
