# Daily Note

```calendar-nav
```

<% tp.web.daily_quote() %>

---

## 🎯 Today's Top 3

> Your 1–3 most important things today (pull from this week's MIT). Set in the morning — see the `/morning-start` skill.

1. 
2. 
3. 

---

## Tasks

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

return function TasksTodayView() {
    const current = dc.useCurrentFile();
    const noteDate = H.toDay(current.value("journal-start-date"));
    const todayStart = noteDate && noteDate.isValid ? noteDate.startOf("day") : null;

    const allTasks = dc.useQuery('@task and !path("SYSTEM/TEMPLATE") and !path("Templates")');

    const partitioned = dc.useMemo(function () {
        if (!todayStart) return { dueToday: [], overdue: [], noDueDate: [], completedToday: [] };
        const dueToday = [];
        const overdue = [];
        const noDueDate = [];
        const completedToday = [];
        for (let i = 0; i < allTasks.length; i++) {
            const t = allTasks[i];
            if (!H.hasTaskTag(t)) continue;
            if (H.hasHabitTag(t)) continue;
            const text = t.$text || "";
            const clean = H.cleanText(text);
            if (!/\S/.test(clean)) continue;
            const status = (t.$status || " ").toLowerCase();
            if (status === "x") {
                const done = H.parseDoneDate(text);
                if (done && done.startOf("day").equals(todayStart)) completedToday.push(t);
                continue;
            }
            if (status === "-") continue;
            const due = H.parseDueDate(text);
            if (!due) { noDueDate.push(t); continue; }
            const dueDay = due.startOf("day");
            if (dueDay.equals(todayStart)) dueToday.push(t);
            else if (dueDay < todayStart) overdue.push(t);
        }
        const byPriority = function (a, b) {
            const pa = H.parsePriority(a.$text);
            const pb = H.parsePriority(b.$text);
            return (pa ? pa.level : 99) - (pb ? pb.level : 99);
        };
        dueToday.sort(byPriority);
        overdue.sort(byPriority);
        noDueDate.sort(byPriority);
        completedToday.sort(byPriority);
        return { dueToday, overdue, noDueDate, completedToday };
    }, [allTasks, todayStart]);

    const [tab, setTab] = dc.useState("due_today");

    return <div>
        <div style={{display: "flex", gap: "6px", marginBottom: "12px"}}>
            <H.TabButton active={tab === "due_today"} onClick={() => setTab("due_today")} label="Due Today"   count={partitioned.dueToday.length} />
            <H.TabButton active={tab === "overdue"}   onClick={() => setTab("overdue")}   label="Overdue"     count={partitioned.overdue.length} />
            <H.TabButton active={tab === "no_due"}    onClick={() => setTab("no_due")}    label="No Due Date" count={partitioned.noDueDate.length} />
            <H.TabButton active={tab === "completed"} onClick={() => setTab("completed")} label="Completed"   count={partitioned.completedToday.length} />
        </div>
        {tab === "due_today" && H.tabTable(partitioned.dueToday,       H.baseTaskCols,    "No tasks due today", 5)}
        {tab === "overdue"   && H.tabTable(partitioned.overdue,        H.overdueTaskCols, "No overdue tasks", 5)}
        {tab === "no_due"    && H.tabTable(partitioned.noDueDate,      H.baseTaskCols,    "No tasks without a due date", 5)}
        {tab === "completed" && H.tabTable(partitioned.completedToday, H.baseTaskCols,    "Nothing completed yet today", 5)}
    </div>;
}
```

---

# Overview

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

return function OverviewView() {
    const allMeetings = dc.useQuery('@page and path("PARA/RESOURCES/MEETINGS") and type = "meeting"');
    const allProjects = dc.useQuery('@page and path("PARA/PROJECTS") and (type = "project_note" or type = "project_family") and Status != "4 Completed"');
    const allAreas    = dc.useQuery('@page and path("PARA/AREAS") and type = "area_family"');

    const meetingRows = dc.useMemo(function () {
        const filtered = [];
        for (let i = 0; i < allMeetings.length; i++) {
            const m = allMeetings[i];
            const s = m.value("meeting_status");
            if (s !== false && s !== null && s !== undefined) continue;
            filtered.push(m);
        }
        filtered.sort(function (a, b) {
            const da = String(a.value("scheduled_date") || "9999-12-31");
            const db = String(b.value("scheduled_date") || "9999-12-31");
            return da < db ? -1 : (da > db ? 1 : 0);
        });
        return filtered;
    }, [allMeetings]);

    const projectRows = dc.useMemo(function () {
        const filtered = allProjects.slice();
        filtered.sort(function (a, b) {
            const da = String(a.value("Due_Date") || "9999-12-31");
            const db = String(b.value("Due_Date") || "9999-12-31");
            if (da !== db) return da < db ? -1 : 1;
            const pa = String(a.value("Priority_Level") || "zzz");
            const pb = String(b.value("Priority_Level") || "zzz");
            if (pa !== pb) return pa < pb ? -1 : 1;
            const sa = String(a.value("Status") || "");
            const sb = String(b.value("Status") || "");
            if (sa !== sb) return sa < sb ? 1 : -1;
            return 0;
        });
        return filtered;
    }, [allProjects]);

    const [tab, setTab] = dc.useState("projects");

    return <div>
        <div style={{display: "flex", gap: "6px", marginBottom: "12px"}}>
            <H.TabButton active={tab === "meetings"} onClick={() => setTab("meetings")} label="Meetings" count={meetingRows.length} />
            <H.TabButton active={tab === "projects"} onClick={() => setTab("projects")} label="Projects" count={projectRows.length} />
            <H.TabButton active={tab === "areas"}    onClick={() => setTab("areas")}    label="Areas"    count={allAreas.length} />
        </div>
        {tab === "meetings" && H.tabTable(meetingRows, H.meetingCols, "No upcoming meetings", 5)}
        {tab === "projects" && H.tabTable(projectRows, H.projectCols, "No active projects", 5)}
        {tab === "areas"    && H.tabTable(allAreas,    H.areaCols,    "No area_family Areas yet", 5)}
    </div>;
}
```

---

# New Tasks

# Notes

# Log

---

## 🔍 Daily Review

> Fill in at the end of the day — see the `/daily-review` skill.

- **Done / progress:** 
- **Learned / insight:** 
- **Mood & energy:** 

## 🗺️ Tomorrow's Top 3

> Decide tonight; copy these into tomorrow's "Today's Top 3".

1. 
2. 
3. 

---

## Created Today

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));
return function CreatedToday() { return <H.TodayCreatedFiles />; };
```
