---
cssclasses:
  - hide-properties_reading
tags: []
keywords: 
area: <% tp.file.title.replace(/^\d+\.\s*/, "") %>
category: 
summary: 
type: area_family_sub
created: <% tp.file.creation_date() %>
parent_area: <% tp.file.folder() %>
---

# <% tp.file.title.replace(/^\d+\.\s*/, "") %>

**Parent Area**: [[<% (function(){ try { const pf = app.vault.getAbstractFileByPath(tp.file.folder(true)); const pn = tp.file.folder(); if (pf && pf.children) { const idx = pf.children.find(f => f.extension === "md" && f.path !== tp.file.path(true) && f.basename.replace(/^\d+\.\s+/, "") === pn); if (idx) return idx.basename; } return pn; } catch (e) { return tp.file.folder(); } })() %>]]

# Overview

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));
return function AreaView() { return <H.AreaDashboard />; };
```

<%*
tp.hooks.on_all_templates_executed(async () => {
    const subAreaName = tp.file.title.replace(/^\d+\.\s*/, "");

    // Create a sub-folder inside the current folder and move the index note into it (works at any depth)
    setTimeout(async () => {
        try {
            const subFolderPath = tp.file.folder(true) + "/" + subAreaName;

            if (!await app.vault.adapter.exists(subFolderPath)) {
                await app.vault.createFolder(subFolderPath);
            }

            // Number prefix follows folder depth: 1 segment after AREAS = 2, 2 segments = 3, 3 segments = 4 ...
            const fparts = subFolderPath.split("/");
            const ai = fparts.indexOf("AREAS");
            const depth = fparts.length - 1 - ai;
            const number = depth + 1;

            const currentFile = app.vault.getAbstractFileByPath(tp.file.path(true));
            const newPath = subFolderPath + "/" + number + ". " + subAreaName + ".md";
            await app.fileManager.renameFile(currentFile, newPath);

            // Delay again so the full-path hierarchy tag is set after the move completes
            setTimeout(async () => {
                try {
                    const movedFile = app.vault.getAbstractFileByPath(newPath);
                    if (movedFile) {
                        const segs = subFolderPath.split("/").slice(ai + 1).map(s => s.toLowerCase().split(" ").join("_"));
                        const fullTag = "area/" + segs.join("/");
                        await app.fileManager.processFrontMatter(movedFile, (frontmatter) => {
                            frontmatter["tags"] = fullTag;
                        });
                        console.log(`Area sub tags set to: ${fullTag}`);
                    }
                } catch (tagError) {
                    console.error('Error setting tags:', tagError);
                }
            }, 200);

        } catch (error) {
            console.error('Error creating folder or moving file:', error);
        }
    }, 300);
});
-%>
