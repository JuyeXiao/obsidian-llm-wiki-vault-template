# Monthly Notes

```calendar-timeline
mode: month
```

---

# 🧭 Monthly Plan & Goals

## 🧠 Monthly Theme

> One sentence to define this month's focus: what is the core direction I most want to move forward or finish?

-

## 🎯 Monthly OKR

> O is the qualitative direction ("what"); each KR must be **quantifiable, verifiable, and independently completable**. Fill in the goals at the start of the month, and add completion status in the same place at month-end.

### **O:** (write this month's qualitative objective here)

- **KR1:** (KR1's quantifiable target + month-end status)
- **KR2:** (KR2's quantifiable target + month-end status)
- **KR3:** (KR3's quantifiable target + month-end status)

## 📅 Key Events / Deadlines This Month

> Meetings, interviews, defenses, deadlines, big milestones you cannot miss; lock them in at the start of the month to avoid collisions.

- [ ]
- [ ]
- [ ]
- [ ]
- [ ]

---

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

return function MonthlyOverviewView() {
    const range = H.useJournalRange();
    const allMeetings = dc.useQuery('@page and path("PARA/RESOURCES/MEETINGS") and type = "meeting"');
    const allProjects = dc.useQuery('@page and path("PARA/PROJECTS") and (type = "project_note" or type = "project_family")');
    const allAreas    = dc.useQuery('@page and path("PARA/AREAS") and type = "area_family"');
    const allTasks    = dc.useQuery('@task and !path("SYSTEM/TEMPLATE") and !path("Templates")');

    const taskPartition = dc.useMemo(function () {
        if (!range.ok) return { dueMonth: [], doneMonth: [] };
        const dueMonth = [];
        const doneMonth = [];
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
                if (day >= range.start && day <= range.end) doneMonth.push(t);
                continue;
            }
            if (status === "-") continue;
            const due = H.parseDueDate(text);
            if (!due) continue;
            const day = due.startOf("day");
            if (day >= range.start && day <= range.end) dueMonth.push(t);
        }
        const byPriority = function (a, b) {
            const pa = H.parsePriority(a.$text);
            const pb = H.parsePriority(b.$text);
            return (pa ? pa.level : 99) - (pb ? pb.level : 99);
        };
        dueMonth.sort(byPriority);
        doneMonth.sort(byPriority);
        return { dueMonth, doneMonth };
    }, [allTasks, range.start, range.end, range.ok]);

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

    const projectPartition = dc.useMemo(function () {
        if (!range.ok) return { active: [], completed: [] };
        const active = [];
        const completed = [];
        for (let i = 0; i < allProjects.length; i++) {
            const p = allProjects[i];
            const status = p.value("Status");
            if (status === "4 Completed") {
                const compDay = H.toDay(p.value("Completion_Date"));
                if (!compDay) continue;
                if (compDay < range.start || compDay > range.end) continue;
                completed.push(p);
            } else {
                const dueDay = H.toDay(p.value("Due_Date"));
                if (!dueDay) continue;
                if (dueDay < range.start || dueDay > range.end) continue;
                active.push(p);
            }
        }
        active.sort(function (a, b) {
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
        completed.sort(function (a, b) {
            const da = String(a.value("Completion_Date") || "");
            const db = String(b.value("Completion_Date") || "");
            return da < db ? 1 : (da > db ? -1 : 0);
        });
        return { active, completed };
    }, [allProjects, range.start, range.end, range.ok]);
    const activeProjectRows = projectPartition.active;
    const completedProjectRows = projectPartition.completed;

    function overviewContent() {
        return <div>
            <dc.Table columns={H.baseTaskCols} rows={taskPartition.dueMonth} paging={taskPartition.dueMonth.length > 0 ? 10 : false} scrollOnPaging={true} />
            {taskPartition.dueMonth.length === 0 && H.emptyState("No open tasks this month")}
            <div style={{margin: "16px 0 8px"}}><strong>Completed Tasks</strong></div>
            <dc.Table columns={H.doneTaskCols} rows={taskPartition.doneMonth} paging={taskPartition.doneMonth.length > 0 ? 10 : false} scrollOnPaging={true} />
            {taskPartition.doneMonth.length === 0 && H.emptyState("Nothing completed this month yet")}
        </div>;
    }

    const [tab, setTab] = dc.useState("overview");

    return <div>
        <div style={{display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap"}}>
            <H.TabButton active={tab === "overview"}  onClick={() => setTab("overview")}  label="Overview"          count={taskPartition.dueMonth.length + taskPartition.doneMonth.length} />
            <H.TabButton active={tab === "meetings"}  onClick={() => setTab("meetings")}  label="Meetings"          count={meetingRows.length} />
            <H.TabButton active={tab === "active"}    onClick={() => setTab("active")}    label="Active Projects"   count={activeProjectRows.length} />
            <H.TabButton active={tab === "completed"} onClick={() => setTab("completed")} label="Completed Projects" count={completedProjectRows.length} />
            <H.TabButton active={tab === "areas"}     onClick={() => setTab("areas")}     label="Areas"             count={allAreas.length} />
        </div>
        {tab === "overview"  && overviewContent()}
        {tab === "meetings"  && H.tabTable(meetingRows,          H.meetingCols,          "No meetings due this month", 10)}
        {tab === "active"    && H.tabTable(activeProjectRows,    H.projectCols,          "No active projects this month", 10)}
        {tab === "completed" && H.tabTable(completedProjectRows, H.completedProjectCols, "No completed projects this month", 10)}
        {tab === "areas"     && H.tabTable(allAreas,             H.areaCols,             "No area_family Areas yet", 10)}
    </div>;
}
```

---

# 📖 Weekly Summaries

> The most valuable weekly information aggregated for this month; refer to it when filling in "✅ Outcomes" below.

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

const columns = [
    { id: "weekly",  title: "Weekly Note", value: p => p.$link },
    { id: "summary", title: "Weekly Summary", value: p => p.value("summary") || "-" },
];

return function MonthlyWeeklySummariesView() {
    const range = H.useJournalRange();

    const allWeeklies = dc.useQuery('@page and path("DAILY/WEEKLY")');

    const rows = dc.useMemo(function () {
        if (!range.ok) return [];
        const filtered = [];
        for (let i = 0; i < allWeeklies.length; i++) {
            const p = allWeeklies[i];
            const start = H.toDay(p.value("journal-start-date"));
            const end = H.toDay(p.value("journal-end-date"));
            if (!H.journalRangesOverlap(start, end, range.start, range.end)) continue;
            filtered.push(p);
        }
        filtered.sort(function (a, b) {
            const da = String(a.value("journal-start-date") || "");
            const db = String(b.value("journal-start-date") || "");
            return da < db ? -1 : (da > db ? 1 : 0);
        });
        return filtered;
    }, [allWeeklies, range.start, range.end, range.ok]);

    return H.tabTable(rows, columns, "No weekly notes this month yet", 10);
}
```

---

# ✅ Outcomes

## Key Deliverables Completed

> Against the OKR and key events at the top, your actual output this month in work / learning / projects / life.

-

## Unfinished / Pushed to Next Month

> Which OKR / key events didn't happen? Briefly note why (where it stalled / squeezed by priorities / estimate was off).

-

## Big Events Recap

> What happened this month worth recording? Which milestones were started or finished?

-

## 📊 Health / Finance / Life Snapshot

> One line each on the actual state of health + finance + life rhythm (data-first, not commentary).

- Health (exercise consistency / sleep / energy):
- Finance (income / spending / non-essential spending):
- Life rhythm (work-life balance / key relationship updates):

---

# 🔍 Reflection

## Multi-dimensional Review

> Give each dimension a quick gut-feel 1-5 score for the month, plus one concrete note.

- Work:
- Family:
- Health:
- Finance:
- Relationships:
- Growth:

## What Went Well (continue)

> Which behaviors / decision methods are worth keeping?

-

## What to Improve (change)

> What was the root cause of what didn't get done? What can be optimized in time allocation / attention management / priority management?

-

## New Self-awareness

> Any new discovery about yourself this month? What potential did you tap / what blind spot did you see?

-

## One Key Takeaway

> A year from now you can remember only one thing from this month — what is it?

-

---

# 🗺️ Next Month

## 🧠 Next Month's Theme (one sentence)

-

## 🎯 Next Month's OKR Draft

> Roughly draft at month-end, refine at the start of next month. Copy straight into "🎯 Monthly OKR" at the top of next month's note.

### **O:**

- **KR1:**
- **KR2:**
- **KR3:**

## 🗓️ Next Month's Key Milestones / Time Budget

> Rough split of work / learning / exercise / rest + unmissable milestones, so no single area eats everything.

- Priorities:
- Time budget:
- Work-life balance point:
- Key milestones (known big events / big deadlines):
