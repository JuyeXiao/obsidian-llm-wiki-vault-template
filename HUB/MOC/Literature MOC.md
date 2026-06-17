---
type: moc
summary: Literature dashboard — live search + topic/source facets + list/by-month views, unified browsing over every literature note in ZETA/LITERATURE.
cssclasses:
  - hide-properties_editing
  - hide-properties_reading
---

# 📖 Literature Notes

```datacorejsx
// ===== Literature dashboard =====
// Reuses the shared primitives from SYSTEM/SCRIPTS/datacore_helpers.md
// (chip / tabTable / TabbedView / fmtDate / toDay / tagMatches / TOPIC_TO_CLUSTER / WIKI_CLUSTERS).
// Dashboard logic is inlined in this MOC (not in the shared helpers) to avoid vault-wide cascading failures.
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

const QPATH = "ZETA/LITERATURE";
const PAGE_SIZE = 10;   // items per page in list view
// Cluster colors — keys must match WIKI_CLUSTERS / TOPIC_TO_CLUSTER in the helpers.
const CLUSTER_COLOR = {
  "Data": "#0d6efd", "AI": "#7048e8", "Productivity": "#20a779", "Career": "#d6336c",
  "Uncategorized": "#6c757d"
};

const sv = v => String(v == null ? "" : v).trim();
const titleOf = p => p.$name || sv(p.$path).split("/").pop().replace(/\.md$/, "");
const kwText  = p => { const k = p.value("keywords"); return Array.isArray(k) ? k.join(" ") : sv(k); };

// Map this note's topic tags to cluster names via TOPIC_TO_CLUSTER (deduped)
function clustersOf(p) {
  const out = [];
  for (let i = 0; i < H.TOPIC_TO_CLUSTER.length; i++) {
    const r = H.TOPIC_TO_CLUSTER[i];
    if (H.tagMatches(p.$tags, r.topic)) {
      const c = r.cluster.replace("#wiki/", "");
      if (out.indexOf(c) < 0) out.push(c);
    }
  }
  return out;
}

// reference like "[[Clippings/Title]]" → take the first segment as the source platform; no reference returns null
function platformOf(p) {
  const r = p.value("reference");
  const s = Array.isArray(r) ? (r[0] || "") : (r || "");
  const seg = sv(s).replace(/^\[\[/, "").replace(/\]\]$/, "").split("/");
  return seg.length > 1 ? seg[0] : null;
}

function renderClusters(cs) {
  return <div style={{display:"flex",gap:"4px",flexWrap:"wrap",justifyContent:"center",alignItems:"center"}}>
    {(cs && cs.length)
      ? cs.map((c,i)=><span key={i}>{H.chip(c, CLUSTER_COLOR[c]||"#5c6bc0")}</span>)
      : <span style={{opacity:0.4}}>—</span>}
  </div>;
}

function FacetChip(props){
  return <button onClick={props.onClick} style={{border:"none",cursor:"pointer",borderRadius:"999px",
    padding:"3px 10px",fontSize:"0.8em",fontWeight:600,
    background: props.active ? (props.color||"var(--interactive-accent)") : "var(--background-modifier-border)",
    color: props.active ? "#fff" : "var(--text-muted)"}}>{props.label}{props.count!=null?(" "+props.count):""}</button>;
}

function LiteratureDashboard() {
  const pages = dc.useQuery(`@page and path("${QPATH}")`);
  const [q, setQ] = dc.useState("");
  const [cluster, setCluster] = dc.useState(null);
  const [platform, setPlatform] = dc.useState(null);
  const [sortKey, setSortKey] = dc.useState("modified");  // "created" | "modified" | "title" (default: modified, new→old)
  const [sortDir, setSortDir] = dc.useState("desc");      // "asc" | "desc"

  // Header-click sort: same column toggles asc/desc; switching to a new column gives a sensible default (date desc new→old, title asc A→Z)
  function onSort(k) {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir(k === "title" ? "asc" : "desc"); }
  }
  function SortHeader(props) {
    const active = sortKey === props.k;
    return <span onClick={e=>{e.stopPropagation(); onSort(props.k);}}
      style={{cursor:"pointer",userSelect:"none",whiteSpace:"nowrap",
              fontWeight:active?700:undefined, color:active?"var(--text-accent)":undefined}}>
      {props.label}<span style={{marginLeft:"3px",fontSize:"0.85em",opacity:active?0.9:0.35}}>
        {active ? (sortDir==="asc"?"▲":"▼") : "⇅"}</span></span>;
  }

  // Derive: per note compute hay (search string) / clusters / platform (literature notes only, self-excluding this MOC)
  const idx = dc.useMemo(() => pages.filter(p => sv(p.value("type")) === "literature_note")
    .map(p => ({ p, hay:(titleOf(p)+" "+sv(p.value("summary"))+" "+kwText(p)).toLowerCase(),
                 clusters:clustersOf(p), platform:platformOf(p) })), [pages]);

  // Facet counts
  const facets = dc.useMemo(() => {
    const cC = {}; H.WIKI_CLUSTERS.forEach(c=>cC[c]=0); let un=0; const pC={};
    idx.forEach(r => { if(!r.clusters.length) un++; r.clusters.forEach(c=>{if(cC[c]!=null)cC[c]++;});
      if(r.platform) pC[r.platform]=(pC[r.platform]||0)+1; });
    return { cC, un, pC };
  }, [idx]);
  const platforms = Object.keys(facets.pC).sort((a,b)=>facets.pC[b]-facets.pC[a]);

  // Three-facet AND combination + new→old sort
  const filtered = dc.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = idx.filter(r => {
      if (needle && r.hay.indexOf(needle) < 0) return false;
      if (cluster) { if (cluster==="Uncategorized") { if (r.clusters.length) return false; }
                     else if (r.clusters.indexOf(cluster) < 0) return false; }
      if (platform && r.platform !== platform) return false;
      return true;
    });
    out.sort((a,b)=>{
      let c;
      if (sortKey==="title") { c = titleOf(a.p).localeCompare(titleOf(b.p)); }
      else {
        const da=H.toDay(sortKey==="modified"?a.p.$mtime:a.p.value("created"));
        const db=H.toDay(sortKey==="modified"?b.p.$mtime:b.p.value("created"));
        if(!da&&!db)return 0; if(!da)return 1; if(!db)return -1;   // empty dates always last
        c = da>db?1:(da<db?-1:0);                                  // ascending baseline
      }
      return sortDir==="asc" ? c : -c;                            // negate for descending
    });
    return out.map(r=>r.p);
  }, [idx, q, cluster, platform, sortKey, sortDir]);

  // Columns: the Source column only appears with ≥2 platforms
  const cols = dc.useMemo(() => {
    const c = [ {id:"title",title:<SortHeader k="title" label="Title" />,value:p=>p.$link},
                {id:"cluster",title:"Topic",value:p=>clustersOf(p),render:renderClusters} ];
    if (platforms.length >= 2) c.push({id:"platform",title:"Source",width:"minimum",value:p=>platformOf(p)||"—"});
    c.push({id:"created",title:<SortHeader k="created" label="Created" />,width:"minimum",value:p=>H.fmtDate(p.value("created"),"yyyy-MM-dd")});
    c.push({id:"modified",title:<SortHeader k="modified" label="Modified" />,width:"minimum",value:p=>H.fmtDate(p.$mtime,"yyyy-MM-dd")});
    c.push({id:"summary",title:"Summary",value:p=>sv(p.value("summary"))||"—"});
    return c;
  }, [platforms.length, sortKey, sortDir]);

  const listView = () => H.tabTable(filtered, cols, "No matching literature notes", PAGE_SIZE);
  const monthView = () => {
    if (!filtered.length) return H.emptyState("No matching literature notes");
    const g = {}; filtered.forEach(p=>{ const m=H.fmtDate(p.value("created"),"yyyy-MM"); (g[m]=g[m]||[]).push(p); });
    return <div>{Object.keys(g).sort((a,b)=>a<b?1:(a>b?-1:0)).map(m=>
      <div key={m} style={{marginBottom:"14px"}}>
        <div style={{fontWeight:700,color:"var(--text-accent)",margin:"6px 0"}}>{m} · {g[m].length}</div>
        {H.tabTable(g[m], cols, "", PAGE_SIZE)}</div>)}</div>;
  };

  return <div style={{fontFamily:"var(--font-interface)"}}>
    <div style={{fontSize:"1.3em",fontWeight:700,color:"var(--text-accent)",marginBottom:"8px"}}>📖 Literature Notes · {idx.length} total</div>
    <input type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search title / summary / keywords…"
      style={{width:"100%",boxSizing:"border-box",padding:"7px 12px",borderRadius:"8px",
      border:"1px solid var(--background-modifier-border)",background:"var(--background-primary)",
      color:"var(--text-normal)",fontSize:"0.95em",marginBottom:"8px"}} />
    <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"6px"}}>
      <FacetChip label="All" active={!cluster} onClick={()=>setCluster(null)} />
      {H.WIKI_CLUSTERS.filter(c=>facets.cC[c]>0).map(c=>
        <FacetChip key={c} label={c} count={facets.cC[c]} color={CLUSTER_COLOR[c]}
          active={cluster===c} onClick={()=>setCluster(cluster===c?null:c)} />)}
      {facets.un>0 && <FacetChip label="Uncategorized" count={facets.un} color={CLUSTER_COLOR["Uncategorized"]}
        active={cluster==="Uncategorized"} onClick={()=>setCluster(cluster==="Uncategorized"?null:"Uncategorized")} />}
    </div>
    {platforms.length >= 2 && <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"6px"}}>
      <FacetChip label="All Sources" active={!platform} onClick={()=>setPlatform(null)} />
      {platforms.map(pl=><FacetChip key={pl} label={pl} count={facets.pC[pl]}
        active={platform===pl} onClick={()=>setPlatform(platform===pl?null:pl)} />)}
    </div>}
    <div style={{marginTop:"6px"}}>
      <H.TabbedView tabs={[ {id:"list",label:"📋 List",count:filtered.length,render:listView},
                            {id:"month",label:"🗓 By Month",count:filtered.length,render:monthView} ]} />
    </div>
  </div>;
}
return LiteratureDashboard;
```
