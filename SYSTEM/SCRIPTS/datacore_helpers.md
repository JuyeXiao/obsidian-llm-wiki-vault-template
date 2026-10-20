---
type: reference
summary: Shared datacorejsx helpers / components / column defs / hooks for templates and dashboards
---

# Helpers

> Import in a template with `const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));`
> All pure functions / constants / render components / column defs / custom hooks live in this single code block.

```jsx
const DateTime = dc.luxon.DateTime;

// ============================================================
// Pure-function helpers
// ============================================================

function toDay(v) {
    if (v == null) return null;
    if (v && typeof v.startOf === "function") return v.startOf("day");
    const s = String(v);
    let dt = dc.coerce.date(s);
    if (!dt && /^\d{4}-\d{2}-\d{2}/.test(s)) dt = dc.coerce.date(s.slice(0, 10));
    return (dt && dt.startOf) ? dt.startOf("day") : null;
}

function fmtDate(v, fmt) {
    fmt = fmt || "MM-dd";
    if (v == null) return "-";
    if (v && typeof v.toFormat === "function") return v.toFormat(fmt);
    const s = String(v);
    let dt = dc.coerce.date(s);
    if (!dt && /^\d{4}-\d{2}-\d{2}/.test(s)) dt = dc.coerce.date(s.slice(0, 10));
    if (dt && dt.toFormat) return dt.toFormat(fmt);
    return s;
}

function daysFrom(v) {
    const dt = toDay(v);
    if (!dt) return "-";
    return Math.ceil(dt.diff(DateTime.now().startOf("day"), "days").days);
}

function num(v) { return (v == null || v === "") ? 0 : Number(v); }

function parseDueDate(text) {
    if (!text) return null;
    const m = text.match(/📅\s*(\d{4}-\d{2}-\d{2})/);
    if (!m) return null;
    const dt = dc.coerce.date(m[1]);
    return (dt && dt.isValid) ? dt : null;
}

function parseDoneDate(text) {
    if (!text) return null;
    const m = text.match(/✅\s*(\d{4}-\d{2}-\d{2})/);
    if (!m) return null;
    const dt = dc.coerce.date(m[1]);
    return (dt && dt.isValid) ? dt : null;
}

function parsePriority(text) {
    if (!text) return null;
    if (text.indexOf("🔺") >= 0) return { level: 1, label: "Highest", color: "#dc3545" };
    if (text.indexOf("⏫") >= 0) return { level: 2, label: "High",    color: "#fd7e14" };
    if (text.indexOf("🔼") >= 0) return { level: 3, label: "Medium",  color: "#0d6efd" };
    if (text.indexOf("🔽") >= 0) return { level: 4, label: "Low",     color: "#6c757d" };
    if (text.indexOf("⏬") >= 0) return { level: 5, label: "Lowest",  color: "#adb5bd" };
    return null;
}

function cleanText(text) {
    if (!text) return "";
    return text
        .replace(/📅\s*\d{4}-\d{2}-\d{2}/g, "")
        .replace(/🛫\s*\d{4}-\d{2}-\d{2}/g, "")
        .replace(/⏳\s*\d{4}-\d{2}-\d{2}/g, "")
        .replace(/✅\s*\d{4}-\d{2}-\d{2}/g, "")
        .replace(/[🔺⏫🔼🔽⏬]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function dateFromTaskFile(t) {
    if (!t.$file) return null;
    const name = t.$file.split("/").pop().replace(/\.md$/, "");
    const dt = DateTime.fromFormat(name, "yyyy-MM-dd");
    return dt.isValid ? dt.startOf("day") : null;
}

function hasTaskTag(t) {
    const tags = t.$tags || [];
    for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        if (tag === "#task" || tag.indexOf("#task/") === 0) return true;
    }
    return false;
}

// Detect a #habit task (optional). Templates use it to exclude habit-tracking
// tasks from task counts; in a vault with no habits it simply returns false.
function hasHabitTag(t) {
    const tags = t.$tags || [];
    for (let i = 0; i < tags.length; i++) {
        if (tags[i].indexOf("#habit") === 0) return true;
    }
    return false;
}

// ============================================================
// Constants
// ============================================================

const PRIORITY_COLOR = { "1":"#dc3545", "2":"#fd7e14", "3":"#0d6efd", "4":"#198754" };
const STATUS_COLOR   = { "1":"#6c757d", "2":"#0d6efd", "3":"#dc3545", "4":"#198754" };
const STATUS_CYCLE   = [" ", "/", "x", "-"];

// ============================================================
// PARA/ZETA <-> LLM Wiki bridge (topic tags -> wiki clusters)
// These are GENERIC SEED VALUES for the template. Adapt them to your own
// topic taxonomy and wiki cluster folders as your vault grows.
// A cluster name = the folder name under INBOX/wiki/<cluster>.
// Cluster names must be tag-safe (no spaces): they are used as #wiki/<cluster>.
// ============================================================

const WIKI_CLUSTERS = ["Data", "AI", "Productivity", "Career"];

// PARA topic/<…> prefix -> #wiki/<cluster> (prefix match via tagMatches; sub-tags included).
const TOPIC_TO_CLUSTER = [
    { topic: "#topic/data",         cluster: "#wiki/Data" },
    { topic: "#topic/ai",           cluster: "#wiki/AI" },
    { topic: "#topic/productivity", cluster: "#wiki/Productivity" },
    { topic: "#topic/career",       cluster: "#wiki/Career" },
];

// Cluster tag -> its "index page" basename (target for the wiki_hub field).
const CLUSTER_HUB = {
    "#wiki/Data":         "Data Index",
    "#wiki/AI":           "AI Index",
    "#wiki/Productivity": "Productivity Index",
    "#wiki/Career":       "Career Index",
};

// ============================================================
// Render components
// ============================================================

function chip(text, bg) {
    return <span style={{
        color: "#fff", background: bg, padding: "2px 8px",
        borderRadius: "10px", fontSize: "0.78em", fontWeight: 600, whiteSpace: "nowrap"
    }}>{text}</span>;
}

function renderDays(d) {
    if (d === "-" || d == null) return <span style={{opacity: 0.4}}>—</span>;
    const color = d < 0 ? "#dc3545" : d <= 3 ? "#fd7e14" : "var(--text-normal)";
    const bg    = d < 0 ? "#dc354520" : d <= 3 ? "#fd7e1420" : "transparent";
    const label = d < 0 ? (d + "d") : ("+" + d + "d");
    return <span style={{color, background: bg, padding: "2px 8px", borderRadius: "4px", fontWeight: 600, fontSize: "0.85em"}}>{label}</span>;
}

function renderCountdown(d) {
    if (d === null || d === undefined) return <span style={{opacity: 0.4}}>—</span>;
    const color = d < 0 ? "#dc3545" : d === 0 ? "#fd7e14" : "var(--text-normal)";
    const bg    = d < 0 ? "#dc354520" : d === 0 ? "#fd7e1420" : "transparent";
    const label = d < 0 ? (d + "d") : (d === 0 ? "today" : ("+" + d + "d"));
    return <span style={{color, background: bg, padding: "2px 8px", borderRadius: "4px", fontWeight: 600, fontSize: "0.85em"}}>{label}</span>;
}

function renderPriority(pr) {
    if (!pr || pr === "-") return <span style={{opacity: 0.4}}>—</span>;
    const numStr = String(pr).split(" ")[0];
    return chip(pr, PRIORITY_COLOR[numStr] || "var(--text-muted)");
}

function renderStatus(s) {
    if (!s || s === "-") return <span style={{opacity: 0.4}}>—</span>;
    const numStr = String(s).split(" ")[0];
    return chip(s, STATUS_COLOR[numStr] || "var(--text-muted)");
}

function renderTaskPriority(p) {
    if (!p) return <span style={{opacity: 0.4}}>—</span>;
    return <span style={{
        color: "#fff", background: p.color, padding: "1px 7px",
        borderRadius: "10px", fontSize: "0.78em", fontWeight: 600, whiteSpace: "nowrap"
    }}>{p.label}</span>;
}

function renderTaskText(t) {
    const s = (t.$status || " ").toLowerCase();
    const text = cleanText(t.$text);
    let style = {};
    if (s === "x") {
        style = { textDecoration: "line-through", opacity: 0.6 };
    } else if (s === "-") {
        style = { textDecoration: "line-through", opacity: 0.4, color: "var(--text-muted)" };
    } else if (s === "/") {
        style = { fontStyle: "italic", color: "var(--link-color)" };
    }
    return <span style={style}>{text}</span>;
}

// ============================================================
// Task interaction
// ============================================================

function getLine(t) {
    if (t.$position && t.$position.start != null) return t.$position.start;
    if (typeof t.$line === "number") return t.$line;
    return null;
}

function openTaskAtLine(t) {
    if (!t.$file) return;
    const line = getLine(t);
    dc.app.workspace.openLinkText(t.$file, "", false, {
        eState: { line: line == null ? 0 : line }
    });
}

function renderTaskFile(t) {
    if (!t.$file) return "";
    const name = t.$file.split("/").pop().replace(/\.md$/, "");
    return <a
        href="#"
        onClick={function (e) {
            e.preventDefault();
            e.stopPropagation();
            openTaskAtLine(t);
        }}
        className="internal-link"
        style={{cursor: "pointer"}}
    >{name}</a>;
}

function toggleTask(t) {
    if (!t.$file) return;
    const file = dc.app.vault.getAbstractFileByPath(t.$file);
    if (!file) return;
    const linePos = getLine(t);
    if (linePos == null) return;
    const cur = (t.$status || " ").toLowerCase();
    let idx = STATUS_CYCLE.indexOf(cur);
    if (idx === -1) idx = 0;
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    dc.app.vault.process(file, function (content) {
        const lines = content.split("\n");
        if (linePos < 0 || linePos >= lines.length) return content;
        let line = lines[linePos];
        line = line.replace(/^(\s*[-*+]\s*)\[.\]/, "$1[" + next + "]");
        if (next === "x") {
            if (!/✅\s*\d{4}-\d{2}-\d{2}/.test(line)) {
                const today = DateTime.now().toFormat("yyyy-MM-dd");
                line = line.replace(/\s+$/, "") + " ✅ " + today;
            }
        } else {
            line = line.replace(/\s*✅\s*\d{4}-\d{2}-\d{2}/g, "");
        }
        lines[linePos] = line;
        return lines.join("\n");
    });
}

function renderTaskStatus(status, t) {
    const s = (status || " ").toLowerCase();
    const isDone = s === "x";
    const display = s === " " ? "" : s;
    return <span
        className={"task-checkbox" + (isDone ? " is-done" : "")}
        data-task={s}
        onClick={function () { toggleTask(t); }}
        style={{
            display: "inline-block", width: "16px", height: "16px",
            border: "1.5px solid var(--text-muted)", borderRadius: "3px",
            textAlign: "center", lineHeight: "14px", fontSize: "11px", fontWeight: 700,
            cursor: "pointer", userSelect: "none", verticalAlign: "middle",
            background: isDone ? "var(--interactive-accent)" : "transparent",
            color: isDone ? "var(--text-on-accent)" : "var(--text-normal)"
        }}
    >{display}</span>;
}

// ============================================================
// Tab UI / table container
// ============================================================

function TabButton(props) {
    const active = !!props.active;
    return <button
        onClick={props.onClick}
        className={"dc-tab-btn" + (active ? " is-active" : "")}
        style={{
            padding: "5px 14px", border: "none", borderRadius: "999px",
            background: active ? "var(--interactive-accent)" : "transparent",
            color: active ? "var(--text-on-accent)" : "var(--text-muted)",
            fontWeight: active ? 600 : 500, fontSize: "0.9em",
            cursor: "pointer", transition: "background 0.18s ease, color 0.18s ease",
            display: "inline-flex", alignItems: "center", gap: "6px"
        }}
    >
        <span>{props.label}</span>
        <span style={{
            fontSize: "0.82em",
            background: active ? "rgba(255,255,255,0.18)" : "var(--background-modifier-border)",
            color: active ? "var(--text-on-accent)" : "var(--text-muted)",
            padding: "1px 7px", borderRadius: "999px", fontWeight: 600,
            minWidth: "18px", textAlign: "center"
        }}>{props.count}</span>
    </button>;
}

function emptyState(text) {
    return <div style={{
        padding: "20px 16px", color: "var(--text-faint)", fontStyle: "italic",
        fontSize: "0.9em", textAlign: "center", background: "var(--background-secondary)",
        border: "1px dashed var(--background-modifier-border)", borderTop: "none",
        borderRadius: "0 0 8px 8px", marginTop: "-1px"
    }}>{text}</div>;
}

// Sortable table: a column with sort:(obj)=>comparable becomes a clickable header;
// a column with defaultSort:"asc"|"desc" sets the initial sort.
// No defaultSort -> initial sortKey=null -> keep input order (backward compatible).
function SortableTable(props) {
    const rows = props.rows, cols = props.cols;
    const def = cols.find(function (c) { return c.defaultSort && typeof c.sort === "function"; });
    const [sortKey, setSortKey] = dc.useState(def ? def.id : null);
    const [sortDir, setSortDir] = dc.useState(def ? def.defaultSort : "desc");
    function onSort(id) {
        if (sortKey === id) setSortDir(sortDir === "asc" ? "desc" : "asc");
        else { setSortKey(id); setSortDir("desc"); }
    }
    function headerNode(col) {
        const active = sortKey === col.id;
        return <span onClick={function (e) { e.stopPropagation(); onSort(col.id); }}
            style={{cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
                    fontWeight: active ? 700 : undefined,
                    color: active ? "var(--text-accent)" : undefined}}>
            {col.title}<span style={{marginLeft: "3px", fontSize: "0.85em", opacity: active ? 0.9 : 0.35}}>
                {active ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</span></span>;
    }
    const viewCols = dc.useMemo(function () {
        return cols.map(function (c) {
            return (typeof c.sort === "function") ? Object.assign({}, c, { title: headerNode(c) }) : c;
        });
    }, [cols, sortKey, sortDir]);
    const sortedRows = dc.useMemo(function () {
        if (!sortKey) return rows;                                    // no active sort -> keep input order
        const col = cols.find(function (c) { return c.id === sortKey && typeof c.sort === "function"; });
        if (!col) return rows;
        const arr = rows.slice();
        arr.sort(function (a, b) {
            const va = col.sort(a), vb = col.sort(b);
            const ea = (va == null || va === ""), eb = (vb == null || vb === "");
            if (ea && eb) return 0; if (ea) return 1; if (eb) return -1;   // empties always last
            let c;
            if (typeof va === "string" || typeof vb === "string") c = String(va).localeCompare(String(vb));
            else c = va > vb ? 1 : (va < vb ? -1 : 0);                 // Luxon DateTime / number
            return sortDir === "asc" ? c : -c;
        });
        return arr;
    }, [rows, sortKey, sortDir]);
    const pageSize = props.paging || 10;
    return <div>
        <dc.Table columns={viewCols} rows={sortedRows} paging={sortedRows.length > 0 ? pageSize : false} scrollOnPaging={true} />
        {sortedRows.length === 0 && emptyState(props.emptyText)}
    </div>;
}

function tabTable(rows, cols, emptyText, paging) {
    if (cols && cols.some(function (c) { return typeof c.sort === "function"; }))
        return <SortableTable rows={rows} cols={cols} emptyText={emptyText} paging={paging} />;
    const pageSize = paging || 10;
    return <div>
        <dc.Table columns={cols} rows={rows} paging={rows.length > 0 ? pageSize : false} scrollOnPaging={true} />
        {rows.length === 0 && emptyState(emptyText)}
    </div>;
}

// ============================================================
// Shared column defs
// ============================================================

const meetingCols = [
    { id: "days", title: "Due in", width: "minimum",
      value: m => daysFrom(m.value("scheduled_date")),
      render: renderDays },
    { id: "meeting", title: "Meeting", value: m => m.$link },
    { id: "scheduled_date", title: "Date", width: "minimum",
      value: m => fmtDate(m.value("scheduled_date"), "MM-dd") },
    { id: "start_time", title: "Start", width: "minimum",
      value: m => m.value("start_time") || "-" },
    { id: "end_time", title: "End", width: "minimum",
      value: m => m.value("end_time") || "-" },
];

const projectCols = [
    { id: "days", title: "Due in", width: "minimum",
      value: p => daysFrom(p.value("Due_Date")),
      render: renderDays },
    { id: "project", title: "Project", value: p => p.$link },
    { id: "priority", title: "Priority", width: "minimum",
      value: p => p.value("Priority_Level") || "-",
      render: renderPriority },
    { id: "status", title: "Status", width: "minimum",
      value: p => p.value("Status") || "-",
      render: renderStatus },
    { id: "due_date", title: "Due", width: "minimum",
      value: p => fmtDate(p.value("Due_Date"), "MM-dd") },
];

const completedProjectCols = [
    { id: "project", title: "Project", value: p => p.$link },
    { id: "status", title: "Status", width: "minimum",
      value: p => p.value("Status") || "-",
      render: renderStatus },
    { id: "completed", title: "Completed Date", width: "minimum",
      value: p => fmtDate(p.value("Completion_Date"), "yyyy-MM-dd") },
];

const areaCols = [
    { id: "area", title: "Area", value: a => a.$link },
    { id: "category", title: "Category",
      value: a => a.value("category") || "-" },
    { id: "created", title: "Created", width: "minimum",
      value: a => fmtDate(a.value("created"), "yyyy-MM-dd") },
];

const checkCol = {
    id: "check", title: "", width: "minimum",
    value: t => t.$status,
    render: renderTaskStatus
};

const baseTaskCols = [
    checkCol,
    { id: "priority", title: "Priority", width: "minimum",
      value: t => parsePriority(t.$text),
      render: renderTaskPriority },
    { id: "task", title: "Task",
      value: t => cleanText(t.$text),
      render: (_text, t) => renderTaskText(t) },
    { id: "file", title: "Source", width: "minimum",
      value: t => renderTaskFile(t) },
];

const overdueTaskCols = [
    checkCol,
    { id: "days", title: "Due in", width: "minimum",
      value: t => {
          const due = parseDueDate(t.$text);
          if (!due) return null;
          return Math.ceil(due.startOf("day").diff(DateTime.now().startOf("day"), "days").days);
      },
      render: renderCountdown },
    { id: "priority", title: "Priority", width: "minimum",
      value: t => parsePriority(t.$text),
      render: renderTaskPriority },
    { id: "task", title: "Task",
      value: t => cleanText(t.$text),
      render: (_text, t) => renderTaskText(t) },
    { id: "file", title: "Source", width: "minimum",
      value: t => renderTaskFile(t) },
];

const doneTaskCols = [
    checkCol,
    { id: "done_date", title: "Date Done", width: "minimum",
      value: t => fmtDate(parseDoneDate(t.$text), "MM-dd") },
    { id: "task", title: "Task",
      value: t => cleanText(t.$text),
      render: (_text, t) => renderTaskText(t) },
    { id: "file", title: "Source", width: "minimum",
      value: t => renderTaskFile(t) },
];

// ============================================================
// Custom hooks
// ============================================================

function journalRangesOverlap(start, end, targetStart, targetEnd) {
    return Boolean(start && end && targetStart && targetEnd &&
        start.isValid !== false && end.isValid !== false && targetStart.isValid !== false && targetEnd.isValid !== false &&
        start <= end && targetStart <= targetEnd && start <= targetEnd && end >= targetStart);
}

function useJournalRange() {
    const current = dc.useCurrentFile();
    return dc.useMemo(function () {
        const rawStart = current.value("journal-start-date");
        const rawEnd   = current.value("journal-end-date");
        if (!rawStart || !rawEnd) return { start: null, end: null, ok: false, rawStart, rawEnd };
        function toDt(v) {
            if (v && typeof v.toFormat === "function") return v;  // already Luxon DateTime
            if (v instanceof Date) return DateTime.fromJSDate(v);  // native Date
            return dc.coerce.date(String(v));
        }
        const sDt = toDt(rawStart);
        const eDt = toDt(rawEnd);
        if (!sDt || !sDt.startOf || !sDt.isValid || !eDt || !eDt.startOf || !eDt.isValid || sDt > eDt) {
            return { start: null, end: null, ok: false, rawStart, rawEnd };
        }
        return { start: sDt.startOf("day"), end: eDt.endOf("day"), ok: true, rawStart, rawEnd };
    }, [current]);
}

// ============================================================
// Link / tag helpers (used by non-journal templates)
// ============================================================

// Read the full "#area/…" / "#contact/…" / "#project/…" tag off the current file.
function currentTag(current, prefix) {
    const want = "#" + prefix + "/";
    const tags = (current && current.$tags) || [];
    for (let i = 0; i < tags.length; i++) {
        if (tags[i].indexOf(want) === 0) return tags[i];
    }
    // fallback: read frontmatter "tags" (hook writes it as a string, e.g. "area/xxx")
    const fm = (current && current.value) ? current.value("tags") : null;
    if (fm != null) {
        const arr = Array.isArray(fm) ? fm : [fm];
        for (let i = 0; i < arr.length; i++) {
            let s = String(arr[i]);
            if (s.indexOf("#") === 0) s = s.slice(1);
            if (s.indexOf(prefix + "/") === 0) return "#" + s;
        }
    }
    return null;
}

// Does the tags array contain a tag or any of its sub-tags? (like the Tasks "tags include")
function tagMatches(tags, tag) {
    if (!tag || !tags) return false;
    for (let i = 0; i < tags.length; i++) {
        if (tags[i] === tag || tags[i].indexOf(tag + "/") === 0) return true;
    }
    return false;
}

function linkPath(c) {
    if (c == null) return null;
    const value = typeof c === "string" ? c : (c.path || c.$path);
    if (typeof value !== "string") return null;
    return value.trim().replace(/^\[\[/, "").replace(/\]\]$/, "")
        .split("|")[0].split("#")[0].replace(/\\/g, "/").replace(/\.md$/i, "");
}

function baseName(p) {
    if (!p) return null;
    return p.split("/").pop().replace(/\.md$/, "");
}

function connectionPath(p) {
    return typeof p === "string" ? p.replace(/\\/g, "/").replace(/\.md$/i, "") : null;
}

// Index the complete @page set; display aliases and filtered candidates cannot prove uniqueness.
function buildConnectionIndex(pages) {
    const exact = new Set(), bySuffix = new Map();
    for (const page of pages) {
        const path = connectionPath(page.$path);
        if (!path || exact.has(path)) continue;
        exact.add(path);
        const parts = path.split("/");
        for (let i = 0; i < parts.length; i++) {
            const suffix = parts.slice(i).join("/");
            if (!bySuffix.has(suffix)) bySuffix.set(suffix, new Set());
            bySuffix.get(suffix).add(path);
        }
    }
    return { exact, bySuffix };
}

function resolveConnectionTarget(target, sourcePath, index) {
    const path = linkPath(target);
    if (!path || !index || path.startsWith("/") || path.includes(":")) return null;
    if (path.startsWith("./") || path.startsWith("../")) {
        const source = connectionPath(sourcePath);
        if (!source) return null;
        const parts = source.split("/").slice(0, -1);
        for (const part of path.split("/")) {
            if (part === ".") continue;
            if (part === "..") {
                if (!parts.length) return null;
                parts.pop();
            } else if (part) parts.push(part);
        }
        const resolved = parts.join("/");
        return index.exact.has(resolved) ? resolved : null;
    }
    if (path.split("/").some(part => !part || part === "." || part === "..")) return null;
    if (path.includes("/") && index.exact.has(path)) return path;
    const matches = index.bySuffix.get(path);
    return matches && matches.size === 1 ? matches.values().next().value : null;
}

// Exact paths win; short names and suffix paths must be unique across the vault.
function connectionsInclude(page, current, index) {
    if (!page || !current) return false;
    const conns = page.value ? page.value("connections") : null;
    if (!conns) return false;
    const arr = Array.isArray(conns) ? conns : [conns];
    const curPath = connectionPath(current.$path);
    for (let i = 0; i < arr.length; i++) {
        const path = linkPath(arr[i]);
        if (!path) continue;
        if (index) {
            if (resolveConnectionTarget(path, page.$path, index) === curPath) return true;
        } else if (path.includes("/") && !path.startsWith("/") && !path.includes(":") &&
                   !path.split("/").some(part => !part || part === "." || part === "..") && path === curPath) {
            return true;
        }
    }
    return false;
}

// Current PARA/ZETA page -> the #wiki/<cluster> tags it maps to (deduped).
function wikiClusterTagsForPage(current) {
    const tags = (current && current.$tags) || [];
    const out = [];
    for (let i = 0; i < TOPIC_TO_CLUSTER.length; i++) {
        const rule = TOPIC_TO_CLUSTER[i];
        if (tagMatches(tags, rule.topic) && out.indexOf(rule.cluster) < 0) out.push(rule.cluster);
    }
    return out;
}

// "Related wiki" for the current page: manual pins (wiki_links) first, then topic-derived; deduped by basename.
// Returns { rows: [native wiki pages…], pinned: Set<basename for 📌 marker> }.
function relatedWikiRows(current, allWikiPages) {
    const rows = [], seen = {}, pinned = new Set();
    function add(p, isPin) {
        const bn = baseName(p.$path);
        if (!bn || seen[bn]) return;
        seen[bn] = true;
        if (isPin) pinned.add(bn);
        rows.push(p);                                    // native wiki page object
    }
    // 1) manual pins: frontmatter wiki_links: ["[[Page]]", …]
    const links = (current && current.value) ? current.value("wiki_links") : null;
    if (links) {
        const arr = Array.isArray(links) ? links : [links];
        for (let i = 0; i < arr.length; i++) {
            const name = baseName(linkPath(arr[i]));
            if (!name) continue;
            for (let j = 0; j < allWikiPages.length; j++) {
                if (baseName(allWikiPages[j].$path) === name) { add(allWikiPages[j], true); break; }
            }
        }
    }
    // 2) topic-derived: wiki pages matching this page's mapped cluster tags (excluding index/log)
    const clusterTags = wikiClusterTagsForPage(current);
    if (clusterTags.length > 0) {
        const derived = [];
        for (let i = 0; i < allWikiPages.length; i++) {
            const w = allWikiPages[i];
            if ((w.value("type") || "") === "wiki_index") continue;
            let hit = false;
            for (let j = 0; j < clusterTags.length; j++) {
                if (tagMatches(w.$tags, clusterTags[j])) { hit = true; break; }
            }
            if (hit) derived.push(w);
        }
        derived.sort(function (a, b) {
            const sa = num(a.value("source_count")), sb = num(b.value("source_count"));
            if (sb !== sa) return sb - sa;
            const ua = toDay(a.value("updated")), ub = toDay(b.value("updated"));
            if (!ua) return 1; if (!ub) return -1;
            return ua > ub ? -1 : (ua < ub ? 1 : 0);
        });
        for (let i = 0; i < derived.length; i++) add(derived[i], false);
    }
    return { rows: rows, pinned: pinned };
}

// ============================================================
// Link / component column defs
// ============================================================

const areaComponentCols = [
    { id: "name", title: "Name", value: p => p.$link,
      sort: p => (p.$name || baseName(p.$path) || "") },
    { id: "created", title: "Created", width: "minimum",
      value: p => fmtDate(p.value("created"), "yyyy-MM-dd"),
      sort: p => toDay(p.value("created")) },
    { id: "modified", title: "Modified", width: "minimum",
      value: p => fmtDate(p.$mtime, "yyyy-MM-dd"),
      sort: p => toDay(p.$mtime), defaultSort: "desc" },   // notes/sub-areas default to most-recently-modified
    { id: "summary", title: "Summary", value: p => p.value("summary") || "-" },
];

const areaSubComponentCols = [
    { id: "name", title: "Name", value: p => p.$link },
    { id: "area", title: "Area", width: "minimum", value: p => p.value("area") || "-" },
    { id: "created", title: "Created", width: "minimum",
      value: p => fmtDate(p.value("created"), "yyyy-MM-dd") },
    { id: "summary", title: "Summary", value: p => p.value("summary") || "-" },
];

const connectionDocCols = [
    { id: "name", title: "Name", value: p => p.$link },
    { id: "type", title: "Type", width: "minimum", value: p => p.value("type") || "-" },
    { id: "modified", title: "Modified", width: "minimum",
      value: p => fmtDate(p.$mtime, "yyyy-MM-dd") },
];

const connectionCols = [
    { id: "name", title: "Note", value: p => p.$link },
    { id: "type", title: "Type", width: "minimum", value: p => p.value("type") || "-" },
    { id: "created", title: "Created", width: "minimum",
      value: p => fmtDate(p.value("created"), "yyyy-MM-dd") },
];

// "Related Wiki" column factory (rows are native wiki pages; pinned = set of pinned basenames for 📌)
function makeWikiCols(pinned) {
    return [
        { id: "pin",  title: "",     width: "minimum",
          value: p => (pinned && pinned.has(baseName(p.$path))) ? "📌" : "" },
        { id: "name", title: "Name", value: p => p.$link,
          sort: p => (p.$name || baseName(p.$path) || "") },
        { id: "type", title: "Type", width: "minimum",
          value: p => String(p.value("type") || "").replace(/^wiki_/, "") || "-",
          sort: p => String(p.value("type") || "").replace(/^wiki_/, "") },
        { id: "cluster", title: "Cluster", width: "minimum", value: p => p.value("category") || "-",
          sort: p => String(p.value("category") || "") },
        { id: "sources", title: "Sources", width: "minimum", value: p => num(p.value("source_count")),
          sort: p => num(p.value("source_count")) },
        { id: "updated", title: "Updated", width: "minimum",
          value: p => fmtDate(p.value("updated"), "yyyy-MM-dd"),
          sort: p => toDay(p.value("updated")) },
    ];
}

// Atlas columns (rows are bare wiki / PARA pages)
const atlasWikiCols = [
    { id: "name", title: "Wiki Page", value: p => p.$link,
      sort: p => (p.$name || baseName(p.$path) || "") },
    { id: "type", title: "Type", width: "minimum",
      value: p => String(p.value("type") || "").replace(/^wiki_/, "") || "-",
      sort: p => String(p.value("type") || "").replace(/^wiki_/, "") },
    { id: "sources", title: "Sources", width: "minimum", value: p => num(p.value("source_count")),
      sort: p => num(p.value("source_count")) },
];
const atlasParaCols = [
    { id: "name", title: "PARA Page", value: p => p.$link,
      sort: p => (p.$name || baseName(p.$path) || "") },
    { id: "type", title: "Type", width: "minimum", value: p => p.value("type") || "-",
      sort: p => String(p.value("type") || "") },
    { id: "area", title: "Area", width: "minimum", value: p => p.value("area") || "-",
      sort: p => String(p.value("area") || "") },
];

// ============================================================
// Generic tabbed shell: tabs = [{ id, label, count, render: () => jsx }]
// ============================================================

function TabbedView(props) {
    const tabs = (props && props.tabs) || [];
    const initial = tabs.length > 0 ? tabs[0].id : null;
    const [active, setActive] = dc.useState(initial);
    let current = null;
    for (let i = 0; i < tabs.length; i++) {
        if (tabs[i].id === active) { current = tabs[i]; break; }
    }
    if (!current && tabs.length > 0) current = tabs[0];
    return <div>
        <div style={{display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap"}}>
            {tabs.map(function (t) {
                return <TabButton
                    key={t.id}
                    active={active === t.id}
                    onClick={function () { setActive(t.id); }}
                    label={t.label}
                    count={t.count} />;
            })}
        </div>
        {current && current.render()}
    </div>;
}

// ============================================================
// Area dashboard (depth-agnostic; finds direct children by folder path, backward-compatible types)
// ============================================================

function parentFolder(path) {
    if (!path) return "";
    const i = path.lastIndexOf("/");
    return i >= 0 ? path.slice(0, i) : "";
}

const AREA_CONTAINER_TYPES = ["area", "area_family", "area_family_sub"];
const AREA_LEAF_TYPES = ["area_note", "area_note_sub"];
function isAreaContainer(t) { return AREA_CONTAINER_TYPES.indexOf(t) >= 0; }
function isAreaLeaf(t) { return AREA_LEAF_TYPES.indexOf(t) >= 0; }

function AreaDashboard() {
    const current = dc.useCurrentFile();
    const allConnectionPages = dc.useQuery('@page');
    const connectionIndex = dc.useMemo(() => buildConnectionIndex(allConnectionPages), [allConnectionPages]);
    const selfFolder = parentFolder(current.$path);   // this area's own folder
    const tag = currentTag(current, "area");

    const allAreaPages = dc.useQuery('@page and path("PARA/AREAS")');
    const allProjects  = dc.useQuery('@page and path("PARA/PROJECTS")');
    const allDocs      = dc.useQuery('@page and (path("PARA/RESOURCES/DOCUMENTATIONS") or path("PARA/WORKSTATION"))');
    const allMeetings  = dc.useQuery('@page and path("PARA/RESOURCES/MEETINGS")');
    const allWikiPages = dc.useQuery('@page and path("INBOX/wiki")');
    const allTasks     = dc.useQuery('@task and !path("SYSTEM")');

    const data = dc.useMemo(function () {
        const notes = [], subAreas = [], projects = [], other = [], meetings = [], ongoing = [], done = [];
        for (let i = 0; i < allAreaPages.length; i++) {
            const p = allAreaPages[i];
            if (p.$path === current.$path) continue;
            const type = p.value("type") || "";
            const pf = parentFolder(p.$path);
            if (isAreaLeaf(type) && pf === selfFolder) {
                notes.push(p);                                  // direct notes
            } else if (isAreaContainer(type) && parentFolder(pf) === selfFolder) {
                subAreas.push(p);                               // direct sub-areas (index pages)
            }
        }
        for (let i = 0; i < allProjects.length; i++) {
            const p = allProjects[i];
            const type = p.value("type") || "";
            if (type !== "project_family" && type !== "project_note") continue;
            if (connectionsInclude(p, current, connectionIndex)) projects.push(p);
        }
        for (let i = 0; i < allDocs.length; i++) {
            const p = allDocs[i];
            const type = p.value("type") || "";
            if (type !== "documentation_note" && type !== "workstation_note") continue;
            if (connectionsInclude(p, current, connectionIndex)) other.push(p);
        }
        for (let i = 0; i < allMeetings.length; i++) {
            const m = allMeetings[i];
            if (String(m.value("type") || "").indexOf("meeting") < 0) continue;
            if (!tagMatches(m.$tags, tag)) continue;
            meetings.push(m);
        }
        for (let i = 0; i < allTasks.length; i++) {
            const t = allTasks[i];
            if (!tagMatches(t.$tags, tag)) continue;
            if ((t.$status || " ").toLowerCase() === "x") done.push(t);
            else ongoing.push(t);
        }
        const byCreatedDesc = function (a, b) {
            const da = toDay(a.value("created")), db = toDay(b.value("created"));
            if (!da) return 1; if (!db) return -1;
            return da > db ? -1 : (da < db ? 1 : 0);
        };
        notes.sort(byCreatedDesc);
        subAreas.sort(byCreatedDesc);
        meetings.sort(function (a, b) {
            const da = toDay(a.value("scheduled_date")), db = toDay(b.value("scheduled_date"));
            if (!da) return 1; if (!db) return -1;
            return da < db ? -1 : (da > db ? 1 : 0);
        });
        const wiki = relatedWikiRows(current, allWikiPages);
        return { notes, subAreas, projects, other, meetings, ongoing, done, wiki };
    }, [allAreaPages, allProjects, allDocs, allMeetings, allTasks, allWikiPages, selfFolder, tag, current, connectionIndex]);

    const tabs = [
        { id: "notes",    label: "Notes",        count: data.notes.length,
          render: () => tabTable(data.notes,    areaComponentCols, "No notes yet", 10) },
        { id: "subs",     label: "Sub-areas",    count: data.subAreas.length,
          render: () => tabTable(data.subAreas, areaComponentCols, "No sub-areas yet", 10) },
        { id: "projects", label: "Projects",     count: data.projects.length,
          render: () => tabTable(data.projects, projectCols, "No linked projects", 10) },
        { id: "other",    label: "Other",        count: data.other.length,
          render: () => tabTable(data.other,    connectionDocCols, "No linked docs", 10) },
        { id: "meetings", label: "Meetings",     count: data.meetings.length,
          render: () => tabTable(data.meetings, meetingCols, "No meetings", 10) },
        { id: "wiki",     label: "Related Wiki", count: data.wiki.rows.length,
          render: () => tabTable(data.wiki.rows, makeWikiCols(data.wiki.pinned), "No related wiki for this area", 10) },
        { id: "ongoing",  label: "Active",       count: data.ongoing.length,
          render: () => tabTable(data.ongoing,  baseTaskCols, "No active tasks", 10) },
        { id: "done",     label: "Done",         count: data.done.length,
          render: () => tabTable(data.done,     doneTaskCols, "No completed tasks", 10) },
    ];
    return <TabbedView tabs={tabs} />;
}

// ============================================================
// Related Wiki (PARA/ZETA -> wiki, derived + pin) / global Atlas
// ============================================================

// Single-page use: embedded in a project / permanent page to show its related wiki.
function RelatedWiki() {
    const current = dc.useCurrentFile();
    const allWikiPages = dc.useQuery('@page and path("INBOX/wiki")');
    const res = dc.useMemo(function () {
        return relatedWikiRows(current, allWikiPages);
    }, [current, allWikiPages]);
    return tabTable(res.rows, makeWikiCols(res.pinned), "No related wiki (no mapped topic; pin pages manually via wiki_links)", 10);
}

// Global use: HUB Atlas, one tab per cluster, two columns "wiki pages <-> linked PARA".
function WikiAtlas() {
    const allWikiPages = dc.useQuery('@page and path("INBOX/wiki")');
    const allAreas     = dc.useQuery('@page and path("PARA/AREAS")');
    const allProjects  = dc.useQuery('@page and path("PARA/PROJECTS")');

    const data = dc.useMemo(function () {
        const paraPages = [];
        for (let i = 0; i < allAreas.length; i++) {
            const t = allAreas[i].value("type") || "";
            if (t === "area_family" || t === "area_family_sub") paraPages.push(allAreas[i]);
        }
        for (let i = 0; i < allProjects.length; i++) {
            if ((allProjects[i].value("type") || "") === "project_family") paraPages.push(allProjects[i]);
        }
        const byCluster = {};
        for (let c = 0; c < WIKI_CLUSTERS.length; c++) {
            const clusterTag = "#wiki/" + WIKI_CLUSTERS[c];
            const wikiRows = [];
            for (let i = 0; i < allWikiPages.length; i++) {
                const w = allWikiPages[i];
                if ((w.value("type") || "") === "wiki_index") continue;
                if (tagMatches(w.$tags, clusterTag)) wikiRows.push(w);
            }
            wikiRows.sort(function (a, b) {
                const oa = (a.value("type") === "wiki_overview") ? 1 : 0;
                const ob = (b.value("type") === "wiki_overview") ? 1 : 0;
                if (oa !== ob) return ob - oa;                 // overview on top
                return num(b.value("source_count")) - num(a.value("source_count"));
            });
            const paraRows = [];
            for (let i = 0; i < paraPages.length; i++) {
                if (wikiClusterTagsForPage(paraPages[i]).indexOf(clusterTag) >= 0) paraRows.push(paraPages[i]);
            }
            byCluster[WIKI_CLUSTERS[c]] = { wiki: wikiRows, para: paraRows };
        }
        return byCluster;
    }, [allWikiPages, allAreas, allProjects]);

    const tabs = WIKI_CLUSTERS.map(function (c) {
        const d = data[c] || { wiki: [], para: [] };
        return {
            id: c, label: c, count: d.wiki.length,
            render: function () {
                return <div>
                    <div style={{margin: "4px 0 8px", fontWeight: 600, color: "var(--text-muted)"}}>📚 Wiki Pages ({d.wiki.length})</div>
                    {tabTable(d.wiki, atlasWikiCols, "No wiki pages in this cluster", 10)}
                    <div style={{margin: "16px 0 8px", fontWeight: 600, color: "var(--text-muted)"}}>🗂 Linked PARA ({d.para.length})</div>
                    {tabTable(d.para, atlasParaCols, "No PARA pages mapped to this cluster", 10)}
                </div>;
            }
        };
    });
    return <TabbedView tabs={tabs} />;
}

// ============================================================
// Files created today (daily-note widget)
// "Creation day" prefers frontmatter `created` (written by hand or by tagging,
// survives full-file rewrites); falls back to filesystem $ctime when missing.
// Excludes two classes that would be misjudged:
//   1) infrastructure rewritten wholesale by tooling (SYSTEM / INBOX/wiki / INBOX/schema)
//      — wiki-ingest / tagging rewrites reset $ctime to "today";
//   2) the periodic journals themselves (DAILY) — scaffold pages with no `created` field.
// ($ctime != birth date: a full rewrite resets it, so it can't be the sole signal.)
// ============================================================

const todayCreatedCols = [
    { id: "doc", title: "Created Today",
      value: p => <span>📄 <dc.Link link={p.$link} /></span> },
    { id: "summary", title: "Summary",
      value: p => p.value("summary") || "No summary" },
];

// Document "creation day": frontmatter created first, else $ctime; returns start-of-day or null.
function createdDay(p) {
    return toDay(p.value("created")) || toDay(p.$ctime);
}

function TodayCreatedFiles() {
    const current = dc.useCurrentFile();
    const noteDate = DateTime.fromFormat(current.$name, "yyyy-MM-dd");
    const dayStart = noteDate.startOf("day");
    const currentPath = current.$path;

    const candidates = dc.useQuery(
        '@page and !path("DAILY") and !path("SYSTEM") and !path("Templates") and !path("INBOX/wiki") and !path("INBOX/schema")'
    );

    const rows = dc.useMemo(function () {
        const filtered = [];
        for (let i = 0; i < candidates.length; i++) {
            const p = candidates[i];
            if (p.$path === currentPath) continue;
            const made = createdDay(p);
            if (made && made.toMillis() === dayStart.toMillis()) filtered.push(p);
        }
        filtered.sort(function (a, b) {                       // same day -> most recently modified first
            const ta = a.$mtime ? a.$mtime.toMillis() : 0;
            const tb = b.$mtime ? b.$mtime.toMillis() : 0;
            return tb - ta;
        });
        return filtered;
    }, [candidates]);

    return tabTable(rows, todayCreatedCols, "Nothing created today yet", 5);
}

// ============================================================
// Exports
// ============================================================

return {
    // luxon shortcut
    DateTime,
    // pure-function helpers
    toDay, fmtDate, daysFrom, num, journalRangesOverlap,
    parseDueDate, parseDoneDate, parsePriority, cleanText,
    dateFromTaskFile, hasTaskTag, hasHabitTag,
    // link / tag helpers
    currentTag, tagMatches, buildConnectionIndex, resolveConnectionTarget, connectionsInclude, wikiClusterTagsForPage, relatedWikiRows,
    parentFolder, isAreaContainer, isAreaLeaf,
    // constants
    PRIORITY_COLOR, STATUS_COLOR, STATUS_CYCLE, TOPIC_TO_CLUSTER, WIKI_CLUSTERS, CLUSTER_HUB,
    // render
    chip, renderDays, renderCountdown,
    renderPriority, renderStatus, renderTaskPriority, renderTaskText,
    // task
    getLine, openTaskAtLine, renderTaskFile, toggleTask, renderTaskStatus,
    // UI
    TabButton, TabbedView, emptyState, tabTable, SortableTable, AreaDashboard, RelatedWiki, WikiAtlas, TodayCreatedFiles,
    // columns
    meetingCols, projectCols, completedProjectCols, areaCols,
    checkCol, baseTaskCols, overdueTaskCols, doneTaskCols,
    areaComponentCols, areaSubComponentCols, connectionDocCols, connectionCols,
    makeWikiCols, atlasWikiCols, atlasParaCols,
    // hooks
    useJournalRange,
};
```

# Mail Box Helpers

Shared page-task semantics for the Mail Box. Only explicit task state is actionable.

```jsx
const MAILBOX_EXCLUDED_FOLDERS = [
    "SYSTEM", "HUB", "DAILY", "INBOX", "ZETA/LITERATURE",
    "ZETA/PERMANENT", "ZETA/FLEETING/IDEAS", "PARA/ARCHIVES", "STICKY"
];
const MAILBOX_STATUS_VALUES = ["1 To Do", "1 Todo", "2 In Progress", "3 Testing", "4 Completed", "5 Blocked"];

function frontmatterKey(frontmatter, key) {
    const keys = Object.keys(frontmatter).filter(k => k.toLowerCase() === key.toLowerCase());
    if (keys.length > 1) throw new Error(`Conflicting frontmatter keys: ${key}`);
    return keys[0] || key;
}

function mailboxValue(entry, key) {
    const fm = entry.$frontmatter || {};
    const value = fm[frontmatterKey(fm, key)];
    // Datacore stores FrontmatterEntry objects; processFrontMatter supplies raw values.
    return value && typeof value === "object" && "key" in value && "value" in value ? value.value : value;
}

function mailboxKind(entry) {
    if (MAILBOX_STATUS_VALUES.includes(mailboxValue(entry, "status"))) return "status";
    if (typeof mailboxValue(entry, "meeting_status") === "boolean" && mailboxValue(entry, "scheduled_date")) return "meeting";
    if (mailboxValue(entry, "file_state") === "unchecked_task") return "file_state";
    // Legacy page tasks removed file_state when completed; closed is their remaining marker.
    if (mailboxValue(entry, "closed")) return "legacy";
    return null;
}

function isEntryChecked(entry) {
    const kind = mailboxKind(entry);
    if (!kind) return false;
    return Boolean(mailboxValue(entry, "closed")) ||
        (kind === "status" && mailboxValue(entry, "status") === "4 Completed") ||
        (kind === "meeting" && mailboxValue(entry, "meeting_status") === true);
}

function mailboxIncludes(entry, showCompleted, pathFilter = "") {
    const path = entry.$path || "";
    if (path.split("/").some(part => part.startsWith("."))) return false;
    if (MAILBOX_EXCLUDED_FOLDERS.some(folder => path === folder || path.startsWith(folder + "/"))) return false;
    if (pathFilter && !path.toLowerCase().includes(pathFilter.toLowerCase())) return false;
    return Boolean(mailboxKind(entry)) && isEntryChecked(entry) === showCompleted;
}

function buildMailboxQuery() {
    return "@page AND " + MAILBOX_EXCLUDED_FOLDERS.map(folder => `!path("${folder}")`).join(" AND ");
}

function getEntryUpdate(entry) {
    const kind = mailboxKind(entry);
    if (!kind) return null;
    const checked = isEntryChecked(entry);
    const updates = { closed: checked ? undefined : dc.luxon.DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm") };
    if (kind === "status") {
        const previous = mailboxValue(entry, "_previous_status");
        updates.status = checked
            ? (MAILBOX_STATUS_VALUES.includes(previous) && previous !== "4 Completed" ? previous : "1 To Do")
            : "4 Completed";
        updates._previous_status = checked ? undefined : mailboxValue(entry, "status");
    } else if (kind === "meeting") {
        updates.meeting_status = !checked;
    } else {
        updates.file_state = "unchecked_task";
    }
    return { updates, icon: checked ? "circle" : "lucide-check-circle" };
}

function applyFrontmatterUpdates(frontmatter, updates) {
    // Resolve all keys before mutating so conflicting casing never leaves a partial update.
    const entries = Object.entries(updates).map(([key, value]) => [frontmatterKey(frontmatter, key), value]);
    for (const [key, value] of entries) {
        if (value === undefined) delete frontmatter[key];
        else frontmatter[key] = value;
    }
}

async function toggleEntry(app, entry) {
    const file = app.vault.getAbstractFileByPath(entry.$path);
    if (!file) throw new Error("The task file no longer exists.");
    let action = null;
    await app.fileManager.processFrontMatter(file, frontmatter => {
        const current = { $frontmatter: frontmatter };
        if (mailboxKind(current) !== mailboxKind(entry) || isEntryChecked(current) !== isEntryChecked(entry)) {
            throw new Error("Task state changed; refresh the Mail Box before toggling it.");
        }
        action = getEntryUpdate(current);
        if (action) applyFrontmatterUpdates(frontmatter, action.updates);
    });
    return action;
}

function getFullPath(path) { return path.split("/").slice(0, -1).join(" > "); }
function formatDate(date) { return date ? date.toFormat("yyyy-MM-dd") : ""; }
function clampPage(currentPage, totalPages) {
    const page = Number.isFinite(currentPage) ? Math.floor(currentPage) : 1;
    return Math.max(1, Math.min(page, Math.max(1, totalPages)));
}

return {
    MAILBOX_EXCLUDED_FOLDERS, mailboxValue, mailboxKind, mailboxIncludes,
    buildMailboxQuery, isEntryChecked, getEntryUpdate, applyFrontmatterUpdates,
    toggleEntry, getFullPath, formatDate, clampPage,
};
```
