---
type: moc
summary: Areas dashboard — live search + level/category facets + list/by-category views, surveying every area index under PARA/AREAS (main areas + sub-areas, with direct note counts).
cssclasses:
  - hide-properties_editing
  - hide-properties_reading
---

# 🗂 Areas

```datacorejsx
// ===== Areas dashboard =====
// Reuses the shared primitives from SYSTEM/SCRIPTS/datacore_helpers.md
// (parentFolder / isAreaLeaf / chip / fmtDate / toDay / tabTable / TabbedView / emptyState).
// Note count = the number of direct leaf notes inside that area's folder, matching the "Notes" tab count of the AreaDashboard embedded in each area page.
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

const QPATH = "PARA/AREAS";
const PAGE_SIZE = 10;
const CAT_COLOR = {
  "Skills": "#0d6efd", "Career": "#d6336c", "Growth": "#20a779",
  "Health": "#37b24d", "Hobbies": "#9c36b5", "Uncategorized": "#6c757d"
};

const sv = v => String(v == null ? "" : v).trim();
const titleOf = p => p.$name || sv(p.$path).split("/").pop().replace(/\.md$/, "");
const kwText  = p => { const k = p.value("keywords"); return Array.isArray(k) ? k.join(" ") : sv(k); };

function FacetChip(props){
  return <button onClick={props.onClick} style={{border:"none",cursor:"pointer",borderRadius:"999px",
    padding:"3px 10px",fontSize:"0.8em",fontWeight:600,
    background: props.active ? (props.color||"var(--interactive-accent)") : "var(--background-modifier-border)",
    color: props.active ? "#fff" : "var(--text-muted)"}}>{props.label}{props.count!=null?(" "+props.count):""}</button>;
}

function AreaMocDashboard() {
  const pages = dc.useQuery(`@page and path("${QPATH}")`);
  const [q, setQ] = dc.useState("");
  const [level, setLevel] = dc.useState(null);   // "Main" | "Sub"
  const [cat, setCat] = dc.useState(null);        // category value, or "Uncategorized"

  // Direct leaf-note count: aggregated by parent folder
  const cnt = dc.useMemo(() => {
    const m = {};
    pages.forEach(p => { if (H.isAreaLeaf(sv(p.value("type")))) {
      const f = H.parentFolder(p.$path); m[f] = (m[f]||0)+1; } });
    return m;
  }, [pages]);
  const notesOf = p => cnt[H.parentFolder(p.$path)] || 0;

  // Area index pages only (main area_family / sub area_family_sub)
  const idx = dc.useMemo(() => pages
    .filter(p => { const t=sv(p.value("type")); return t==="area_family" || t==="area_family_sub"; })
    .map(p => ({ p, level: sv(p.value("type"))==="area_family" ? "Main" : "Sub",
                 cat: sv(p.value("category")),
                 hay:(titleOf(p)+" "+sv(p.value("summary"))+" "+kwText(p)+" "+sv(p.value("parent_area"))).toLowerCase() })),
    [pages]);

  // Facet counts
  const facets = dc.useMemo(() => {
    const lC = {"Main":0,"Sub":0}, cC = {};
    idx.forEach(r => { lC[r.level]++; const ck=r.cat||"Uncategorized"; cC[ck]=(cC[ck]||0)+1; });
    const cats = Object.keys(cC).sort((a,b)=>cC[b]-cC[a]);
    return { lC, cC, cats };
  }, [idx]);

  // Two-facet AND combination
  const filtered = dc.useMemo(() => {
    const needle = q.trim().toLowerCase();
    return idx.filter(r => {
      if (needle && r.hay.indexOf(needle) < 0) return false;
      if (level && r.level !== level) return false;
      if (cat) { if (cat==="Uncategorized") { if (r.cat) return false; } else if (r.cat !== cat) return false; }
      return true;
    }).map(r=>r.p);
  }, [idx, q, level, cat]);

  // Columns (with sort → tabTable auto-uses SortableTable; level sorts by type lexicographically, family before family_sub)
  const cols = [
    { id:"area", title:"Area", value:p=>p.$link, sort:p=>titleOf(p) },
    { id:"level", title:"Level", width:"minimum",
      value:p=>{ const t=sv(p.value("type")); return t==="area_family" ? "Main" : ("Sub · "+(sv(p.value("parent_area"))||"?")); },
      sort:p=>sv(p.value("type")) },
    { id:"cat", title:"Category", width:"minimum", value:p=>sv(p.value("category"))||"—", sort:p=>sv(p.value("category")) },
    { id:"notes", title:"Notes", width:"minimum", value:p=>notesOf(p), sort:p=>notesOf(p) },
    { id:"created", title:"Created", width:"minimum",
      value:p=>H.fmtDate(p.value("created"),"yyyy-MM-dd"), sort:p=>H.toDay(p.value("created")) },
    { id:"modified", title:"Modified", width:"minimum",
      value:p=>H.fmtDate(p.$mtime,"yyyy-MM-dd"), sort:p=>H.toDay(p.$mtime), defaultSort:"desc" },
    { id:"summary", title:"Summary", value:p=>sv(p.value("summary"))||"—" },
  ];

  const listView = () => H.tabTable(filtered, cols, "No matching areas", PAGE_SIZE);
  const catView = () => {
    if (!filtered.length) return H.emptyState("No matching areas");
    const g = {}; filtered.forEach(p=>{ const c=sv(p.value("category"))||"Uncategorized"; (g[c]=g[c]||[]).push(p); });
    return <div>{Object.keys(g).sort((a,b)=>g[b].length-g[a].length).map(c=>
      <div key={c} style={{marginBottom:"14px"}}>
        <div style={{fontWeight:700,margin:"6px 0"}}>{H.chip(c, CAT_COLOR[c]||"#5c6bc0")}
          <span style={{color:"var(--text-muted)",fontWeight:400,marginLeft:"6px"}}>· {g[c].length}</span></div>
        {H.tabTable(g[c], cols, "", PAGE_SIZE)}</div>)}</div>;
  };

  return <div style={{fontFamily:"var(--font-interface)"}}>
    <div style={{fontSize:"1.3em",fontWeight:700,color:"var(--text-accent)",marginBottom:"8px"}}>🗂 Areas · {idx.length} total (Main {facets.lC["Main"]} · Sub {facets.lC["Sub"]})</div>
    <input type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search title / summary / keywords / parent…"
      style={{width:"100%",boxSizing:"border-box",padding:"7px 12px",borderRadius:"8px",
      border:"1px solid var(--background-modifier-border)",background:"var(--background-primary)",
      color:"var(--text-normal)",fontSize:"0.95em",marginBottom:"8px"}} />
    <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"6px"}}>
      <FacetChip label="All Levels" active={!level} onClick={()=>setLevel(null)} />
      <FacetChip label="Main" count={facets.lC["Main"]} color="#7048e8"
        active={level==="Main"} onClick={()=>setLevel(level==="Main"?null:"Main")} />
      <FacetChip label="Sub" count={facets.lC["Sub"]} color="#1098ad"
        active={level==="Sub"} onClick={()=>setLevel(level==="Sub"?null:"Sub")} />
    </div>
    <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"6px"}}>
      <FacetChip label="All Categories" active={!cat} onClick={()=>setCat(null)} />
      {facets.cats.map(c=>
        <FacetChip key={c} label={c} count={facets.cC[c]} color={CAT_COLOR[c]}
          active={cat===c} onClick={()=>setCat(cat===c?null:c)} />)}
    </div>
    <div style={{marginTop:"6px"}}>
      <H.TabbedView tabs={[ {id:"list",label:"📋 List",count:filtered.length,render:listView},
                            {id:"cat",label:"🗂 By Category",count:filtered.length,render:catView} ]} />
    </div>
  </div>;
}
return AreaMocDashboard;
```
