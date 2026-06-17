---
tags: []
keywords:
area: <% tp.file.folder() %>
category:
summary: 
type: area_note
created: <% tp.file.creation_date() %>
---

# <% tp.file.title %>

# Overview

<%* tp.hooks.on_all_templates_executed(async () => {
    const file = tp.file.find_tfile(tp.file.path(true));
    const parts = tp.file.folder(true).split("/");
    const i = parts.indexOf("AREAS");
    const segs = parts.slice(i + 1).map(s => s.toLowerCase().split(" ").join("_"));
    const noteSlug = tp.file.title.split(" ").map(w => w.toLowerCase()).join("_");
    await app.fileManager.processFrontMatter(file, (frontmatter) => {
        frontmatter["tags"] = "area/" + segs.concat(noteSlug).join("/");
    });
}); -%>
