---
cssclasses:
  - hide-properties_editing
  - hide-properties_reading
  - no-inline
  - homepage
textArea1: ""
textArea2: ""
banner: "![[banner-home.png]]"
banner_y: 0.5
---

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));
const DateTime = H.DateTime;

const AREAS = [
  { label: "📁 Projects", path: "PARA/PROJECTS", note: "HUB/MOC/Projects MOC.md" },
  { label: "🗂 Areas", path: "PARA/AREAS", note: "HUB/MOC/Areas MOC.md" },
  { label: "📚 Resources", path: "PARA/RESOURCES" },
  { label: "🗃 Archives", path: "PARA/ARCHIVES" },
  { label: "🛠 Workstation", path: "PARA/WORKSTATION" },
  { label: "🧠 Permanent", path: "ZETA/PERMANENT" },
  { label: "📖 Literature", path: "ZETA/LITERATURE", note: "HUB/MOC/Literature MOC.md" },
  { label: "💭 Fleeting", path: "ZETA/FLEETING" },
  { label: "🔖 Reference", path: "ZETA/REFERENCE" },
  { label: "📥 Inbox", path: "INBOX", note: "HUB/MOC/Sources MOC.md" },
];

function openFolder(path) {
  const af = dc.app.vault.getAbstractFileByPath(path);
  if (!af) return;
  const fe = dc.app.internalPlugins.getPluginById && dc.app.internalPlugins.getPluginById("file-explorer");
  if (fe && fe.instance && fe.instance.revealInFolder) fe.instance.revealInFolder(af);
  else dc.app.workspace.openLinkText(path, "", false);
}

function openJournal(kind) {
  const list = (dc.app.commands.listCommands && dc.app.commands.listCommands()) || Object.values(dc.app.commands.commands || {});
  const re = kind === "day" ? /today/i : kind === "week" ? /week/i : /month/i;
  const cmd = list.find(c =>
    /journal/i.test(c.id) && /open/i.test(c.name) && re.test(c.name) &&
    !/(next|last|previous|yesterday|tomorrow)/i.test(c.name));
  if (cmd) { dc.app.commands.executeCommandById(cmd.id); return; }
  if (kind === "day") {
    dc.app.workspace.openLinkText("DAILY/DAILY/" + DateTime.now().toFormat("yyyy-MM-dd") + ".md", "", false);
  }
}

function Stat({ n, label }) {
  return <div style={{ textAlign: "center", minWidth: "60px", padding: "0 10px" }}>
    <div style={{ fontSize: "1.5em", fontWeight: 700, lineHeight: 1.1, color: "var(--text-normal)" }}>{n}</div>
    <div style={{ fontSize: "0.72em", color: "var(--text-muted)", marginTop: "3px", whiteSpace: "nowrap" }}>{label}</div>
  </div>;
}

function Bar({ label, pct }) {
  const p = Math.max(0, Math.min(100, pct));
  return <div style={{ flex: "1 1 150px", minWidth: "130px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78em", color: "var(--text-muted)", marginBottom: "4px" }}>
      <span>{label}</span><span>{p.toFixed(0)}%</span>
    </div>
    <div style={{ height: "7px", background: "var(--background-modifier-border)", borderRadius: "999px", overflow: "hidden" }}>
      <div style={{ width: p + "%", height: "100%", background: "var(--interactive-accent)" }} />
    </div>
  </div>;
}

function PeriodBtn({ label, onClick }) {
  return <button onClick={onClick} style={{
    padding: "6px 14px", borderRadius: "999px", border: "1px solid var(--background-modifier-border)",
    background: "var(--background-primary)", color: "var(--text-normal)", cursor: "pointer",
    fontSize: "0.85em", fontWeight: 600, whiteSpace: "nowrap"
  }}>{label}</button>;
}

return function Hero() {
  const now = DateTime.now();
  const pages = dc.useQuery('@page and !path("SYSTEM/TEMPLATE") and !path("Templates")');
  const tasks = dc.useQuery('@task and !path("SYSTEM/TEMPLATE") and !path("Templates")');

  const stats = dc.useMemo(function () {
    const tagSet = new Set();
    let earliest = null;
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      const tg = p.$tags || [];
      for (let j = 0; j < tg.length; j++) tagSet.add(tg[j]);
      const ct = p.$ctime;
      if (ct && ct.toMillis && (!earliest || ct < earliest)) earliest = ct;
    }
    let open = 0;
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      if (!H.hasTaskTag(t)) continue;
      const s = (t.$status || " ").toLowerCase();
      if (s === "x" || s === "-") continue;
      if (!/\S/.test(H.cleanText(t.$text || ""))) continue;
      open++;
    }
    const days = earliest ? Math.max(1, Math.ceil(now.diff(earliest, "days").days)) : 0;
    return { docs: pages.length, tags: tagSet.size, open, days };
  }, [pages, tasks]);

  const yStart = now.startOf("year"), yEnd = now.endOf("year");
  const yearPct = now.diff(yStart).toMillis() / yEnd.diff(yStart).toMillis() * 100;
  const monthPct = ((now.day - 1) + now.hour / 24) / now.daysInMonth * 100;
  const weekPct = ((now.weekday - 1) + now.hour / 24) / 7 * 100;
  const dayPct = (now.hour + now.minute / 60) / 24 * 100;

  const hr = now.hour;
  const greet = hr < 5 ? "Working late" : hr < 11 ? "Good morning" : hr < 13 ? "Good noon" : hr < 18 ? "Good afternoon" : hr < 23 ? "Good evening" : "Working late";

  const card = { background: "var(--background-secondary)", border: "1px solid var(--background-modifier-border)", borderRadius: "16px", padding: "18px 22px", marginBottom: "16px" };

  return <div style={card}>
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "10px" }}>
      <div>
        <span style={{ fontSize: "1.55em", fontWeight: 700, color: "var(--text-normal)" }}>{greet} 👋</span>
        <span style={{ marginLeft: "12px", color: "var(--text-muted)" }}>{now.toFormat("cccc, MMMM d, yyyy")}</span>
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <PeriodBtn label="📅 Today" onClick={() => openJournal("day")} />
        <PeriodBtn label="🗓 This Week" onClick={() => openJournal("week")} />
        <PeriodBtn label="📆 This Month" onClick={() => openJournal("month")} />
      </div>
    </div>

    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", margin: "16px 0", padding: "14px 0", borderTop: "1px solid var(--background-modifier-border)", borderBottom: "1px solid var(--background-modifier-border)" }}>
      <Stat n={stats.docs} label="Notes" />
      <Stat n={stats.tags} label="Tags" />
      <Stat n={stats.open} label="Open Tasks" />
      <Stat n={stats.days} label="Days Active" />
      <Stat n={yearPct.toFixed(1) + "%"} label="Year Elapsed" />
    </div>

    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "14px" }}>
      <Bar label="Today" pct={dayPct} />
      <Bar label="Week" pct={weekPct} />
      <Bar label="Month" pct={monthPct} />
      <Bar label="Year" pct={yearPct} />
    </div>

    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
      {AREAS.map((a, i) => (
        <span key={i} onClick={() => a.note ? dc.app.workspace.openLinkText(a.note, "", false) : openFolder(a.path)} title={a.note ? ("Open " + a.note) : ("Open " + a.path)}
          style={{
            padding: "4px 10px", borderRadius: "999px", cursor: "pointer", fontSize: "0.8em",
            background: "var(--background-primary)", color: "var(--text-muted)",
            border: "1px solid var(--background-modifier-border)", whiteSpace: "nowrap"
          }}>{a.label}</span>
      ))}
    </div>
  </div>;
}
```

> [!multi-column]
>
>> [!note]+ 🧭 HUB
>> - [[HUB/MOC/Permanent MOC|🧠 Permanent]]
>> - [[HUB/MOC/Literature MOC|📖 Literature]]
>> - [[HUB/MOC/Projects MOC|📁 Projects]]
>> - [[HUB/MOC/Areas MOC|🗂 Areas]]
>> - [[HUB/MOC/Sources MOC|🗃 Sources]]
>> - [[Mail Box|📬 Mail Box]]
>> - [[Tag Navigator|🏷 Tag Navigator]]
>
>> [!abstract]+ 📚 Quick Links
>> - Add your most-used notes here.
>
>> [!quote]+ ✨ Quote of the Day
>> The best time to plant a tree was 20 years ago. The second best time is now.

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));
const DateTime = H.DateTime;

function Card({ title, children }) {
  return <div style={{ background: "var(--background-secondary)", border: "1px solid var(--background-modifier-border)", borderRadius: "16px", padding: "14px 16px" }}>
    <div style={{ fontWeight: 700, color: "var(--interactive-accent)", marginBottom: "10px", fontSize: "1.02em" }}>{title}</div>
    {children}
  </div>;
}

function relTime(dt) {
  if (!dt || !dt.toRelative) return "";
  const r = dt.toRelative();
  return r || "";
}

return function Activity() {
  const today = DateTime.now().startOf("day");
  const tasks = dc.useQuery('@task and !path("SYSTEM/TEMPLATE") and !path("Templates")');
  const pages = dc.useQuery('@page and !path("SYSTEM") and !path("Templates")');

  const part = dc.useMemo(function () {
    const dueToday = [], overdue = [], noDue = [];
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      if (!H.hasTaskTag(t)) continue;
      if (!/\S/.test(H.cleanText(t.$text || ""))) continue;
      const s = (t.$status || " ").toLowerCase();
      if (s === "x" || s === "-") continue;
      const due = H.parseDueDate(t.$text);
      if (!due) { noDue.push(t); continue; }
      const d = due.startOf("day");
      if (d.equals(today)) dueToday.push(t);
      else if (d < today) overdue.push(t);
    }
    const byP = (a, b) => ((H.parsePriority(a.$text) || {}).level || 99) - ((H.parsePriority(b.$text) || {}).level || 99);
    dueToday.sort(byP); overdue.sort(byP); noDue.sort(byP);
    return { dueToday, overdue, noDue };
  }, [tasks]);

  const recent = dc.useMemo(function () {
    const ex = ["SYSTEM/", "HUB/", "DAILY/", "STICKY/", "INBOX/"];
    const arr = [];
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      if (ex.some(e => p.$path.startsWith(e))) continue;
      if (!p.$mtime || !p.$mtime.toMillis) continue;
      arr.push(p);
    }
    arr.sort((a, b) => b.$mtime.toMillis() - a.$mtime.toMillis());
    return arr.slice(0, 8);
  }, [pages]);

  const [tab, setTab] = dc.useState("due_today");

  function fileLink(p) {
    return <a href="#" className="internal-link" style={{ textDecoration: "none" }}
      onClick={(e) => { e.preventDefault(); dc.app.workspace.openLinkText(p.$path, "", false); }}>{p.$name}</a>;
  }

  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px", marginBottom: "16px" }}>
    <Card title="✅ Tasks">
      <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
        <H.TabButton active={tab === "due_today"} onClick={() => setTab("due_today")} label="Due Today" count={part.dueToday.length} />
        <H.TabButton active={tab === "overdue"} onClick={() => setTab("overdue")} label="Overdue" count={part.overdue.length} />
        <H.TabButton active={tab === "no_due"} onClick={() => setTab("no_due")} label="No Date" count={part.noDue.length} />
      </div>
      {tab === "due_today" && H.tabTable(part.dueToday, H.baseTaskCols, "No tasks due today 🎉", 6)}
      {tab === "overdue" && H.tabTable(part.overdue, H.overdueTaskCols, "No overdue tasks 👍", 6)}
      {tab === "no_due" && H.tabTable(part.noDue, H.baseTaskCols, "No undated tasks", 6)}
    </Card>

    <Card title="🕐 Recently Edited">
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {recent.length === 0 && H.emptyState("No recent files")}
        {recent.map((p, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px", padding: "5px 6px", borderRadius: "6px" }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📄 {fileLink(p)}</span>
            <span style={{ fontSize: "0.76em", color: "var(--text-faint)", whiteSpace: "nowrap" }}>{relTime(p.$mtime)}</span>
          </div>
        ))}
      </div>
    </Card>
  </div>;
}
```

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));
const DateTime = H.DateTime;
const WEEKS = 18;

return function ActivityHeatmap() {
  const pages = dc.useQuery('@page and !path("SYSTEM")');

  const counts = dc.useMemo(function () {
    const m = {};
    for (let i = 0; i < pages.length; i++) {
      const ct = pages[i].$ctime;
      if (!ct || !ct.toFormat) continue;
      const key = ct.toFormat("yyyy-MM-dd");
      m[key] = (m[key] || 0) + 1;
    }
    return m;
  }, [pages]);

  const today = DateTime.now().startOf("day");
  const start = today.minus({ days: (WEEKS - 1) * 7 + (today.weekday - 1) });
  const cols = [];
  let total = 0;
  for (let w = 0; w < WEEKS; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const day = start.plus({ days: w * 7 + d });
      const key = day.toFormat("yyyy-MM-dd");
      const future = day > today;
      const n = future ? -1 : (counts[key] || 0);
      if (n > 0) total += n;
      days.push({ key, n, day, isToday: day.equals(today) });
    }
    cols.push(days);
  }

  const level = (n) => n < 0 ? -1 : n === 0 ? 0 : n <= 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4;
  const cellBg = (n) => level(n) <= 0 ? (level(n) < 0 ? "transparent" : "var(--background-modifier-border)") : "var(--interactive-accent)";
  const cellOp = (n) => { const lv = level(n); return lv < 0 ? 0 : lv === 0 ? 0.45 : (0.25 + 0.1875 * lv); };

  const monthLabels = cols.map((days, ci) => {
    const m = days[0].day.month;
    const prev = ci > 0 ? cols[ci - 1][0].day.month : -1;
    return m !== prev ? days[0].day.toFormat("MMM") : "";
  });

  const legend = [
    { bg: "var(--background-modifier-border)", op: 0.45 },
    { bg: "var(--interactive-accent)", op: 0.4375 },
    { bg: "var(--interactive-accent)", op: 0.625 },
    { bg: "var(--interactive-accent)", op: 0.8125 },
    { bg: "var(--interactive-accent)", op: 1 },
  ];

  return <div style={{ background: "var(--background-secondary)", border: "1px solid var(--background-modifier-border)", borderRadius: "16px", padding: "14px 16px", marginBottom: "16px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px", flexWrap: "wrap", gap: "6px" }}>
      <span style={{ fontWeight: 700, color: "var(--interactive-accent)" }}>📊 Note Activity · Last {WEEKS} Weeks</span>
      <span style={{ fontSize: "0.78em", color: "var(--text-muted)" }}>{total} notes created</span>
    </div>

    <div style={{ overflowX: "auto", paddingBottom: "4px" }}>
      <div style={{ display: "inline-block" }}>
        <div style={{ display: "flex", gap: "3px", height: "13px", marginBottom: "3px" }}>
          {monthLabels.map((lab, ci) => (
            <div key={ci} style={{ width: "13px", fontSize: "0.62em", color: "var(--text-faint)", whiteSpace: "nowrap" }}>{lab}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "3px" }}>
          {cols.map((days, ci) => (
            <div key={ci} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {days.map((c, di) => (
                <div key={di}
                  title={c.n >= 0 ? (c.key + " · " + c.n + " notes") : ""}
                  onClick={() => { if (c.n >= 0) dc.app.workspace.openLinkText("DAILY/DAILY/" + c.key + ".md", "", false); }}
                  style={{
                    width: "13px", height: "13px", borderRadius: "3px",
                    background: cellBg(c.n), opacity: cellOp(c.n),
                    outline: c.isToday ? "2px solid var(--text-normal)" : "none", outlineOffset: "-1px",
                    cursor: c.n > 0 ? "pointer" : "default"
                  }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end", marginTop: "8px", fontSize: "0.72em", color: "var(--text-faint)" }}>
      <span>Less</span>
      {legend.map((g, i) => (
        <div key={i} style={{ width: "11px", height: "11px", borderRadius: "3px", background: g.bg, opacity: g.op }} />
      ))}
      <span>More</span>
    </div>
  </div>;
}
```
