# Weekly Notes

```calendar-timeline
mode: week
```

---

# 🧭 Weekly Plan & Goals

## 🧠 Weekly Theme

> One sentence to define this week's focus: what is the core direction I most want to move forward or finish?

-

## 🎯 Weekly MIT (1-3 most important things)

> Make them "concrete enough to act on directly". Each MIT should break down into at least one of the daily three things during the week.

1.
2.
3.

## 📅 Key Events / Deadlines

> Meetings, interviews, defenses, deadlines you cannot miss; lock them in a week ahead to avoid last-minute collisions.

- [ ]
- [ ]
- [ ]

---

# Overview

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

return function WeeklyOverviewView() {
    const range = H.useJournalRange();
    const allMeetings = dc.useQuery('@page and path("PARA/RESOURCES/MEETINGS") and type = "meeting"');
    const allProjects = dc.useQuery('@page and path("PARA/PROJECTS") and (type = "project_note" or type = "project_family") and Status != "4 Completed"');
    const allAreas    = dc.useQuery('@page and path("PARA/AREAS") and type = "area_family"');

    const meetingRows = dc.useMemo(function () {
        if (!range.ok) return [];
        const filtered = [];
        for (let i = 0; i < allMeetings.length; i++) {
            const m = allMeetings[i];
            const s = m.value("meeting_status");
            if (s !== false && s !== null && s !== undefined) continue;
            const day = H.toDay(m.value("scheduled_date"));
            if (!day) continue;
            if (day < range.start || day > range.end) continue;
            filtered.push(m);
        }
        filtered.sort(function (a, b) {
            const da = String(a.value("scheduled_date") || "9999-12-31");
            const db = String(b.value("scheduled_date") || "9999-12-31");
            return da < db ? -1 : (da > db ? 1 : 0);
        });
        return filtered;
    }, [allMeetings, range.start, range.end, range.ok]);

    const projectRows = dc.useMemo(function () {
        if (!range.ok) return [];
        const filtered = [];
        for (let i = 0; i < allProjects.length; i++) {
            const p = allProjects[i];
            const due = p.value("Due_Date");
            if (due != null) {
                const dueDay = H.toDay(due);
                if (!dueDay) continue;
                if (dueDay < range.start || dueDay > range.end) continue;
            }
            filtered.push(p);
        }
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
    }, [allProjects, range.start, range.end, range.ok]);

    const [tab, setTab] = dc.useState("projects");

    return <div>
        <div style={{display: "flex", gap: "6px", marginBottom: "12px"}}>
            <H.TabButton active={tab === "meetings"} onClick={() => setTab("meetings")} label="Meetings" count={meetingRows.length} />
            <H.TabButton active={tab === "projects"} onClick={() => setTab("projects")} label="Projects" count={projectRows.length} />
            <H.TabButton active={tab === "areas"}    onClick={() => setTab("areas")}    label="Areas"    count={allAreas.length} />
        </div>
        {tab === "meetings" && H.tabTable(meetingRows, H.meetingCols, "No meetings due this week", 5)}
        {tab === "projects" && H.tabTable(projectRows, H.projectCols, "No active projects this week", 5)}
        {tab === "areas"    && H.tabTable(allAreas,    H.areaCols,    "No area_family Areas yet", 5)}
    </div>;
}
```

---

## Tasks

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

return function WeeklyTasksView() {
    const range = H.useJournalRange();
    const allTasks = dc.useQuery('@task and !path("SYSTEM/TEMPLATE") and !path("Templates")');

    const partitioned = dc.useMemo(function () {
        if (!range.ok) return { dueThisWeek: [], completedThisWeek: [] };
        const dueThisWeek = [];
        const completedThisWeek = [];
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
                if (!done) continue;
                const day = done.startOf("day");
                if (day >= range.start && day <= range.end) completedThisWeek.push(t);
                continue;
            }
            if (status === "-") continue;
            const due = H.parseDueDate(text);
            if (!due) continue;
            const day = due.startOf("day");
            if (day >= range.start && day <= range.end) dueThisWeek.push(t);
        }
        const byPriority = function (a, b) {
            const pa = H.parsePriority(a.$text);
            const pb = H.parsePriority(b.$text);
            return (pa ? pa.level : 99) - (pb ? pb.level : 99);
        };
        dueThisWeek.sort(byPriority);
        completedThisWeek.sort(byPriority);
        return { dueThisWeek, completedThisWeek };
    }, [allTasks, range.start, range.end, range.ok]);

    const [tab, setTab] = dc.useState("due_week");

    return <div>
        <div style={{display: "flex", gap: "6px", marginBottom: "12px"}}>
            <H.TabButton active={tab === "due_week"}  onClick={() => setTab("due_week")}  label="Due This Week"       count={partitioned.dueThisWeek.length} />
            <H.TabButton active={tab === "done_week"} onClick={() => setTab("done_week")} label="Completed This Week" count={partitioned.completedThisWeek.length} />
        </div>
        {tab === "due_week"  && H.tabTable(partitioned.dueThisWeek,       H.baseTaskCols, "No tasks due this week", 10)}
        {tab === "done_week" && H.tabTable(partitioned.completedThisWeek, H.doneTaskCols, "Nothing completed this week yet", 10)}
    </div>;
}
```

---

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

const columns = [
    { id: "diary", title: "Daily Note",
      value: p => <span>📅 <dc.Link link={p.$link} /></span> },
    { id: "date", title: "Date", width: "minimum",
      value: p => p.value("journal-start-date") || "-" },
    { id: "summary", title: "Daily Summary",
      value: p => p.value("summary") || "No summary" },
];

return function WeeklyDailyNotesView() {
    const range = H.useJournalRange();
    const allDailies = dc.useQuery('@page and path("DAILY/DAILY")');

    const rows = dc.useMemo(function () {
        if (!range.ok) return [];
        const filtered = [];
        for (let i = 0; i < allDailies.length; i++) {
            const p = allDailies[i];
            const day = H.toDay(p.value("journal-start-date"));
            if (!day) continue;
            if (day < range.start || day > range.end) continue;
            filtered.push(p);
        }
        filtered.sort(function (a, b) {
            const da = String(a.value("journal-start-date") || "");
            const db = String(b.value("journal-start-date") || "");
            return da < db ? -1 : (da > db ? 1 : 0);
        });
        return filtered;
    }, [allDailies, range.start, range.end, range.ok]);

    return H.tabTable(rows, columns, "No daily notes this week yet", 10);
}
```

---

# ✅ Outcomes

## Key Deliverables Completed

> Against the MIT and key events at the top, the work / learning / life output you actually achieved.

-

## Unfinished / Pushed to Next Week

> Which MIT / key events didn't happen, with a short reason (where it stalled / squeezed by priorities / estimate was off).

-

## People & Moments Worth Noting

> Who you saw, what you discussed, any unexpected gains.

-

---

# 🔍 Reflection

## What Went Well (continue)

> Which behaviors / decision methods are worth keeping?

-

## What to Improve (change)

> What was the root cause of what didn't get done? What can be optimized in time allocation / attention management / task breakdown?

-

## One Key Takeaway

> If a month from now you could remember only one thing from this week, what would it be?

-

---

# 🗺️ Next Week

## 🧠 Next Week's Theme (one sentence)

-

## 🎯 Next Week's MIT (1-3)

> Copy these straight into the "Weekly MIT" at the top of next week's note.

1.
2.
3.

## 🗓️ Next Week's Key Milestones / Time Budget

> Rough split of work / learning / exercise / rest, so no single area eats all the time.

- Priorities:
- Time budget:
- Work-life balance point:
