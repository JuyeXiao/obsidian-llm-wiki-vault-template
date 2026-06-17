---
type: moc
summary: Projects dashboard — live search + status/category facets + list/by-status views, surveying every project under PARA/PROJECTS (command center: due-in / priority / status / deadline).
cssclasses:
  - hide-properties_editing
  - hide-properties_reading
---

# 📁 Projects

```datacorejsx
// ===== Projects dashboard =====
// Reuses the shared primitives from SYSTEM/SCRIPTS/datacore_helpers.md
// (STATUS_COLOR / renderStatus / renderPriority / renderDays / daysFrom / fmtDate / toDay / tabTable / TabbedView / emptyState).
// Dashboard logic is inlined in this MOC (not in the shared helpers), matching the Literature MOC convention, to avoid vault-wide cascading failures.
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

const QPATH = "PARA/PROJECTS";
const PAGE_SIZE = 10;
const CAT_COLOR = {
  "Skills": "#0d6efd", "Career": "#d6336c", "Growth": "#20a779",
  "Health": "#37b24d", "Hobbies": "#9c36b5", "Uncategorized": "#6c757d"
};

const sv = v => String(v == null ? "" : v).trim();
const titleOf = p => p.$name || sv(p.$path).split("/").pop().replace(/\.md$/, "");
const kwText  = p => { const k = p.value("keywords"); return Array.isArray(k) ? k.join(" ") : sv(k); };
const numOf   = s => sv(s).split(" ")[0];   // "2 In Progress" → "2"; empty → ""

function FacetChip(props){
  return <button onClick={props.onClick} style={{border:"none",cursor:"pointer",borderRadius:"999px",
    padding:"3px 10px",fontSize:"0.8em",fontWeight:600,
    background: props.active ? (props.color||"var(--interactive-accent)") : "var(--background-modifier-border)",
    color: props.active ? "#fff" : "var(--text-muted)"}}>{props.label}{props.count!=null?(" "+props.count):""}</button>;
}

function ProjectDashboard() {
  const pages = dc.useQuery(`@page and path("${QPATH}")`);
  const [q, setQ] = dc.useState("");
  const [status, setStatus] = dc.useState(null);   // raw Status value, or "No Status"
  const [cat, setCat] = dc.useState(null);          // category value, or "Uncategorized"

  // Project index pages only (exclude project_note sub-notes / README)
  const idx = dc.useMemo(() => pages.filter(p => sv(p.value("type")) === "project_family")
    .map(p => ({ p, hay:(titleOf(p)+" "+sv(p.value("summary"))+" "+kwText(p)).toLowerCase(),
                 status: sv(p.value("Status")), cat: sv(p.value("category")) })), [pages]);

  // Facet counts (data-driven: statuses ordered by leading digit, "No Status" last; categories by frequency)
  const facets = dc.useMemo(() => {
    const sC = {}, cC = {};
    idx.forEach(r => { const sk=r.status||"No Status"; sC[sk]=(sC[sk]||0)+1;
                       const ck=r.cat||"Uncategorized";   cC[ck]=(cC[ck]||0)+1; });
    const statuses = Object.keys(sC).sort((a,b)=>{
      if(a==="No Status")return 1; if(b==="No Status")return -1; return numOf(a).localeCompare(numOf(b)); });
    const cats = Object.keys(cC).sort((a,b)=>cC[b]-cC[a]);
    return { sC, cC, statuses, cats };
  }, [idx]);

  // Two-facet AND combination
  const filtered = dc.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return idx.filter(r => {
      if (needle && r.hay.indexOf(needle) < 0) return false;
      if (status) { if (status==="No Status") { if (r.status) return false; } else if (r.status !== status) return false; }
      if (cat)    { if (cat==="Uncategorized")   { if (r.cat)    return false; } else if (r.cat !== cat)       return false; }
      return true;
    }).map(r=>r.p);
  }, [idx, q, status, cat]);

  // Columns (with sort → tabTable auto-uses SortableTable, headers clickable; empty values always last)
  const cols = [
    { id:"days", title:"Due in", width:"minimum",
      value:p=>H.daysFrom(p.value("Due_Date")), render:H.renderDays,
      sort:p=>{ const d=H.daysFrom(p.value("Due_Date")); return typeof d==="number"?d:null; } },
    { id:"project", title:"Project", value:p=>p.$link, sort:p=>titleOf(p) },
    { id:"priority", title:"Priority", width:"minimum",
      value:p=>p.value("Priority_Level")||"-", render:H.renderPriority,
      sort:p=>numOf(p.value("Priority_Level"))||null },
    { id:"status", title:"Status", width:"minimum",
      value:p=>p.value("Status")||"-", render:H.renderStatus,
      sort:p=>numOf(p.value("Status"))||null },
    { id:"due", title:"Due", width:"minimum",
      value:p=>H.fmtDate(p.value("Due_Date"),"MM-dd"), sort:p=>H.toDay(p.value("Due_Date")) },
    { id:"created", title:"Created", width:"minimum",
      value:p=>H.fmtDate(p.value("created"),"yyyy-MM-dd"), sort:p=>H.toDay(p.value("created")) },
    { id:"modified", title:"Modified", width:"minimum",
      value:p=>H.fmtDate(p.$mtime,"yyyy-MM-dd"), sort:p=>H.toDay(p.$mtime), defaultSort:"desc" },
    { id:"summary", title:"Summary", value:p=>sv(p.value("summary"))||"—" },
  ];

  const listView = () => H.tabTable(filtered, cols, "No matching projects", PAGE_SIZE);
  const statusView = () => {
    if (!filtered.length) return H.emptyState("No matching projects");
    const g = {}; filtered.forEach(p=>{ const s=sv(p.value("Status"))||"No Status"; (g[s]=g[s]||[]).push(p); });
    // Group order: In Progress(2) → Todo(1) → others → No Status → Completed(4) last
    const ord = k => { if(k==="No Status")return 90; const n=parseInt(numOf(k),10);
                       if(isNaN(n))return 80; if(n===4)return 99; if(n===2)return 1; if(n===1)return 2; return 10+n; };
    return <div>{Object.keys(g).sort((a,b)=>ord(a)-ord(b)).map(s=>
      <div key={s} style={{marginBottom:"14px"}}>
        <div style={{fontWeight:700,margin:"6px 0"}}>{H.renderStatus(s==="No Status"?"-":s)}
          <span style={{color:"var(--text-muted)",fontWeight:400,marginLeft:"6px"}}>· {g[s].length}</span></div>
        {H.tabTable(g[s], cols, "", PAGE_SIZE)}</div>)}</div>;
  };

  return <div style={{fontFamily:"var(--font-interface)"}}>
    <div style={{fontSize:"1.3em",fontWeight:700,color:"var(--text-accent)",marginBottom:"8px"}}>📁 Projects · {idx.length} total</div>
    <input type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search title / summary / keywords…"
      style={{width:"100%",boxSizing:"border-box",padding:"7px 12px",borderRadius:"8px",
      border:"1px solid var(--background-modifier-border)",background:"var(--background-primary)",
      color:"var(--text-normal)",fontSize:"0.95em",marginBottom:"8px"}} />
    <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"6px"}}>
      <FacetChip label="All Statuses" active={!status} onClick={()=>setStatus(null)} />
      {facets.statuses.map(s=>
        <FacetChip key={s} label={s} count={facets.sC[s]}
          color={s==="No Status"?"#6c757d":H.STATUS_COLOR[numOf(s)]}
          active={status===s} onClick={()=>setStatus(status===s?null:s)} />)}
    </div>
    <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"6px"}}>
      <FacetChip label="All Categories" active={!cat} onClick={()=>setCat(null)} />
      {facets.cats.map(c=>
        <FacetChip key={c} label={c} count={facets.cC[c]} color={CAT_COLOR[c]}
          active={cat===c} onClick={()=>setCat(cat===c?null:c)} />)}
    </div>
    <div style={{marginTop:"6px"}}>
      <H.TabbedView tabs={[ {id:"list",label:"📋 List",count:filtered.length,render:listView},
                            {id:"status",label:"🗂 By Status",count:filtered.length,render:statusView} ]} />
    </div>
  </div>;
}
return ProjectDashboard;
```
