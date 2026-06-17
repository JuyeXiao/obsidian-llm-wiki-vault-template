---
tags: [project]
keywords: []
area:
category:
summary:
type: project_note
wiki_links:
connections: 
created: <% tp.file.creation_date() %> 
Due_Date: 
Priority_Level: 
Status: 
---

# Components

**Select Connection:** `INPUT[inlineListSuggester(optionQuery(#area)):connections]`
**Select Wiki:** `INPUT[inlineListSuggester(optionQuery("INBOX/wiki")):wiki_links]`
**Due Date:** `INPUT[dateTime(defaultValue(null)):Due_Date]`
**Priority Level:** `INPUT[inlineSelect(option(1 Critical), option(2 High), option(3 Medium), option(4 Low)):Priority_Level]`
**Status:** `INPUT[inlineSelect(option(1 To Do), option(2 In Progress), option(3 Testing), option(4 Completed), option(5 Blocked)):Status]`

# Description

# 📁 Project Activity

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

return function ProjectDynamics() {
    const current = dc.useCurrentFile();
    const tag = H.currentTag(current, "project");

    const allProjects = dc.useQuery('@page and path("PARA/PROJECTS")');
    const allTasks = dc.useQuery('@task and !path("SYSTEM")');

    const data = dc.useMemo(function () {
        const notes = [], tasks = [];
        if (tag) {
            for (let i = 0; i < allProjects.length; i++) {
                const p = allProjects[i];
                if (p.$path === current.$path) continue;
                if ((p.value("type") || "") !== "project_note") continue;
                if (!H.tagMatches(p.$tags, tag)) continue;
                notes.push(p);
            }
            for (let i = 0; i < allTasks.length; i++) {
                const t = allTasks[i];
                if (!H.tagMatches(t.$tags, tag)) continue;
                const s = (t.$status || " ").toLowerCase();
                if (s !== "x" && s !== "-") tasks.push(t);
            }
        }
        return { notes, tasks };
    }, [allProjects, allTasks, tag, current]);

    if (!tag) return H.emptyState("No project tag found (the template hook should write #project/<folder>)");

    const tabs = [
        { id: "notes", label: "Project Notes", count: data.notes.length,
          render: () => H.tabTable(data.notes, H.projectCols, "No project notes yet", 10) },
        { id: "tasks", label: "Open Tasks", count: data.tasks.length,
          render: () => H.tabTable(data.tasks, H.baseTaskCols, "No open tasks", 10) },
    ];
    return <H.TabbedView tabs={tabs} />;
}
```

# 🔗 Related Wiki

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));
return function RelatedWikiView() { return <H.RelatedWiki />; };
```

<%* tp.hooks.on_all_templates_executed(async () => { const file = tp.file.find_tfile(tp.file.path(true)); const folder_name = tp.file.folder().toLowerCase().replace(/ /g, "_"); await app.fileManager.processFrontMatter(file, (frontmatter) => { frontmatter["tags"] = [`#project/${folder_name}`]; }); }); -%>
