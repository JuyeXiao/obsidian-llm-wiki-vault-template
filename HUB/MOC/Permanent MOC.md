---
type: moc
summary: Find permanent notes by title, summary, keywords, topic and actual viewpoint markers.
cssclasses: [hide-properties_editing, hide-properties_reading]
---

# Permanent Notes

Search a question, compare notes by topic, or find judgments that still need your input. **Unmarked does not mean confirmed.** See [[SYSTEM/DOCS/by-need|Choose a workflow]] and [[SYSTEM/DOCS/migration|Upgrade notes]].

```datacorejsx
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));
const P = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/permanent_moc_helpers.md", "Permanent MOC Helpers"));
const sv = value => String(value == null ? "" : value).trim();

function PagedTable({ rows, token, label }) {
  const [position, setPosition] = dc.useState({ token, page: 0 });
  const { page, total, shown } = P.pageWindow(rows, position, token);
  const columns = [
    { id: "title", title: "Title", value: row => row.p.$link },
    { id: "topics", title: "Topic", value: row => row.topics.join(", ") },
    { id: "status", title: "Viewpoint marker", value: row => row.status },
    { id: "summary", title: "Summary", value: row => row.summary || "—" }
  ];
  if (!rows.length) return H.emptyState("No matching permanent notes. Adjust or reset the filters.");
  return <div>
    <dc.Table columns={columns} rows={shown} paging={false} />
    {total > 1 && <nav aria-label={label + " pages"} style={{display:"flex",alignItems:"center",gap:"10px",margin:"8px 0"}}>
      <button type="button" aria-label={label + " previous page"} disabled={page === 0} onClick={()=>setPosition({token,page:page-1})}>Previous</button>
      <span aria-live="polite">Page {page + 1} of {total}</span>
      <button type="button" aria-label={label + " next page"} disabled={page === total-1} onClick={()=>setPosition({token,page:page+1})}>Next</button>
    </nav>}
  </div>;
}

return function PermanentDashboard() {
  const pages = dc.useQuery('@page and path("ZETA/PERMANENT")');
  const notes = dc.useMemo(() => pages.filter(p => sv(p.value("type")) === "permanent_note"), [pages]);
  const [query, setQuery] = dc.useState("");
  const [topic, setTopic] = dc.useState("");
  const [status, setStatus] = dc.useState("");
  const [sortKey, setSortKey] = dc.useState("modified");
  const [view, setView] = dc.useState("list");
  const [revision, setRevision] = dc.useState(0);
  const [reading, setReading] = dc.useState(false);
  const cache = dc.useMemo(() => P.createStatusCache(file => dc.app.vault.cachedRead(file)), []);
  dc.useEffect(() => {
    let cancelled = false;
    cache.prune(new Set(notes.map(p => p.$path)));
    const changed = notes.map(p => dc.app.vault.getAbstractFileByPath(p.$path)).filter(file => file?.stat && cache.needsRead(file));
    setReading(changed.length > 0);
    if (changed.length) Promise.all(changed.map(file => cache.load(file))).then(() => {
      if (!cancelled) { setRevision(r => r+1); setReading(false); }
    });
    return () => { cancelled = true; };
  }, [notes, cache]);

  const rows = dc.useMemo(() => notes.map(p => {
    const title = p.$name || p.$path.split("/").pop().replace(/\.md$/, "");
    const summary = sv(p.value("summary")), keywords = p.value("keywords");
    const topics = H.WIKI_CLUSTERS.filter(cluster => H.TOPIC_TO_CLUSTER.some(rule => rule.cluster === "#wiki/"+cluster && H.tagMatches(p.$tags,rule.topic)));
    return { p, title, summary, topics:topics.length ? topics : ["Uncategorized"],
      hay:[title,summary,Array.isArray(keywords)?keywords.join(" "):sv(keywords)].join(" ").toLowerCase(),
      modified:H.toDay(p.$mtime)?.toISODate() || "",
      status:dc.app.vault.getAbstractFileByPath(p.$path) ? cache.peek(p.$path) : "Read failed" };
  }), [notes, cache, revision]);
  const topics = [...new Set(rows.flatMap(row => row.topics))].sort();
  const filtered = dc.useMemo(() => P.filterRows(rows,query,topic,status,sortKey), [rows,query,topic,status,sortKey]);
  const token = JSON.stringify([query,topic,status,sortKey]);
  const reset = () => { setQuery(""); setTopic(""); setStatus(""); setSortKey("modified"); };
  const grouped = {};
  filtered.forEach(row => row.topics.forEach(t => (grouped[t] ||= []).push(row)));
  return <div style={{fontFamily:"var(--font-interface)"}}>
    <input aria-label="Search permanent title, summary and keywords" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search title / summary / keywords…" style={{width:"100%",marginBottom:"8px"}} />
    <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"8px"}}>
      <select aria-label="Filter by topic" value={topic} onChange={e=>setTopic(e.target.value)}>
        <option value="">All topics</option>{topics.map(t=><option key={t} value={t}>{t}</option>)}
      </select>
      <select aria-label="Filter by actual viewpoint marker" value={status} onChange={e=>setStatus(e.target.value)}>
        <option value="">All markers</option>{["Personal viewpoint pending","Open question","Unmarked","Loading","Read failed"].map(s=><option key={s} value={s}>{s}</option>)}
      </select>
      <select aria-label="Sort permanent notes" value={sortKey} onChange={e=>setSortKey(e.target.value)}><option value="modified">Recently modified</option><option value="title">Title A–Z</option></select>
      <button type="button" onClick={reset}>Reset filters</button>
    </div>
    <p aria-live="polite">{filtered.length} matching notes of {notes.length}{reading ? " · Reading markers…" : ""}</p>
    {rows.some(r=>r.status==="Read failed") && <p role="alert">Some notes could not be read. Filter by “Read failed” to inspect them.</p>}
    <div role="group" aria-label="Permanent note view" style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
      <button type="button" aria-pressed={view==="list"} onClick={()=>setView("list")}>List</button>
      <button type="button" aria-pressed={view==="topic"} onClick={()=>setView("topic")}>By topic</button>
    </div>
    {view === "list" ? <PagedTable rows={filtered} token={token} label="Permanent notes" /> : <div>
      <p>A note can appear in several topics; the result count counts each note once.</p>
      {!filtered.length && H.emptyState("No matching permanent notes. Adjust or reset the filters.")}
      {Object.keys(grouped).sort().map(t=><section key={t}><h3>{t} · {grouped[t].length}</h3><PagedTable rows={grouped[t]} token={token} label={t} /></section>)}
    </div>}
  </div>;
};
```
