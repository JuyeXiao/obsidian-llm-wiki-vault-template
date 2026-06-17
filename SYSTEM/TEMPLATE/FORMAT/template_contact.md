---
title: 
tags: []
type: contact
aliases: []
company: 
email: 
location: 
phone:
last_contact:
relationship:
---

# Personal Notes

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

return function ContactOverview() {
    const current = dc.useCurrentFile();
    const tag = H.currentTag(current, "contact");

    const allMeetings = dc.useQuery('@page and path("PARA/RESOURCES/MEETINGS")');
    const allTasks = dc.useQuery('@task and !path("SYSTEM")');

    const data = dc.useMemo(function () {
        const meetings = [], ongoing = [], done = [];
        if (tag) {
            for (let i = 0; i < allMeetings.length; i++) {
                const m = allMeetings[i];
                if (String(m.value("type") || "").indexOf("meeting") < 0) continue;
                if (!H.tagMatches(m.$tags, tag)) continue;
                meetings.push(m);
            }
            for (let i = 0; i < allTasks.length; i++) {
                const t = allTasks[i];
                if (!H.tagMatches(t.$tags, tag)) continue;
                if ((t.$status || " ").toLowerCase() === "x") done.push(t);
                else ongoing.push(t);
            }
        }
        meetings.sort(function (a, b) {
            const da = H.toDay(a.value("scheduled_date")), db = H.toDay(b.value("scheduled_date"));
            if (!da) return 1; if (!db) return -1;
            return da < db ? -1 : (da > db ? 1 : 0);
        });
        return { meetings, ongoing, done };
    }, [allMeetings, allTasks, tag]);

    if (!tag) return H.emptyState("No contact tag found (the template hook should write contact/<name>)");

    const tabs = [
        { id: "meetings", label: "Meetings", count: data.meetings.length,
          render: () => H.tabTable(data.meetings, H.meetingCols, "No meetings yet", 10) },
        { id: "ongoing", label: "Active", count: data.ongoing.length,
          render: () => H.tabTable(data.ongoing, H.baseTaskCols, "No active tasks", 10) },
        { id: "done", label: "Done", count: data.done.length,
          render: () => H.tabTable(data.done, H.doneTaskCols, "No completed tasks", 10) },
    ];
    return <H.TabbedView tabs={tabs} />;
}
```

<%* tp.hooks.on_all_templates_executed(async () => { const file = tp.file.find_tfile(tp.file.path(true)); const formatted_title = tp.file.title.split(" ").map(word => word.toLowerCase()).join("_"); await app.fileManager.processFrontMatter(file, (frontmatter) => { frontmatter["tags"] = `contact/${formatted_title}`; }); }); -%>
