---
type: moc
summary: Sources dashboard — live search + source(by-folder)/topic-cluster facets + list/by-source views, unified browsing over every raw source in INBOX/raw (web clips / book highlights / podcasts / videos).
cssclasses:
  - hide-properties_editing
  - hide-properties_reading
---

# 🗃 Sources

```datacorejsx
// ===== Sources dashboard =====
// Reuses the shared primitives from SYSTEM/SCRIPTS/datacore_helpers.md
// (chip / tabTable / TabbedView / emptyState / fmtDate / toDay / tagMatches / TOPIC_TO_CLUSTER / WIKI_CLUSTERS).
// Read-only query over INBOX/raw (never writes raw, never touches the wiki). Dashboard logic is inlined in this MOC
// (not in the shared helpers), matching the Literature / Projects MOC convention, to avoid vault-wide cascading failures.
const H = await dc.require(dc.headerLink("SYSTEM/SCRIPTS/datacore_helpers.md", "Helpers"));

const QPATH = "INBOX/raw";
const PAGE_SIZE = 15;   // items per page in list view
// Cluster colors — keys must match WIKI_CLUSTERS / TOPIC_TO_CLUSTER in the helpers.
const CLUSTER_COLOR = {
  "Data": "#0d6efd", "AI": "#7048e8", "Productivity": "#20a779", "Career": "#d6336c",
  "Uncategorized": "#6c757d"
};
// Content folders ↔ friendly labels (color + actual relative folder, for chip/column hover provenance)
const SRC_ORDER  = ["Web Clips", "Book Highlights", "Podcasts", "Videos", "Other"];
const SRC_COLOR  = { "Web Clips":"#0d6efd", "Book Highlights":"#9c36b5", "Podcasts":"#fd7e14", "Videos":"#e8590c", "Other":"#6c757d" };
const SRC_FOLDER = { "Web Clips":"Clippings", "Book Highlights":"Books", "Podcasts":"Podcasts", "Videos":"Videos", "Other":"EverythingElse" };

const sv = v => String(v == null ? "" : v).trim();
const titleOf = p => p.$name || sv(p.$path).split("/").pop().replace(/\.md$/, "");
const kwText  = p => { const k = p.value("keywords"); return Array.isArray(k) ? k.join(" ") : sv(k); };

// Source (by folder): derived from path, 100% reliable
function sourceTypeOf(p) {
  const s = p.$path;
  if (s.includes("/Clippings/")) return "Web Clips";
  if (s.includes("/Books/"))     return "Book Highlights";
  if (s.includes("/Podcasts/"))  return "Podcasts";
  if (s.includes("/Videos/"))    return "Videos";
  return "Other";                                                // EverythingElse
}

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

function renderClusters(cs) {
  return <div style={{display:"flex",gap:"4px",flexWrap:"wrap",justifyContent:"center",alignItems:"center"}}>
    {(cs && cs.length)
      ? cs.map((c,i)=><span key={i}>{H.chip(c, CLUSTER_COLOR[c]||"#5c6bc0")}</span>)
      : <span style={{opacity:0.4}}>—</span>}
  </div>;
}

function FacetChip(props){
  return <button onClick={props.onClick} title={props.title||""} style={{border:"none",cursor:"pointer",borderRadius:"999px",
    padding:"3px 10px",fontSize:"0.8em",fontWeight:600,
    background: props.active ? (props.color||"var(--interactive-accent)") : "var(--background-modifier-border)",
    color: props.active ? "#fff" : "var(--text-muted)"}}>{props.label}{props.count!=null?(" "+props.count):""}</button>;
}

function SourceMOC() {
  const pages = dc.useQuery(`@page and path("${QPATH}")`);
  const [q, setQ] = dc.useState("");
  const [src, setSrc] = dc.useState(null);              // source (by folder), primary facet
  const [cluster, setCluster] = dc.useState(null);      // topic cluster, secondary facet
  const [sortKey, setSortKey] = dc.useState("created"); // "created" | "modified" | "title" (default: created, new→old)
  const [sortDir, setSortDir] = dc.useState("desc");    // "asc" | "desc"

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

  // Derive: per note compute hay (search string) / clusters / src (all sources under INBOX/raw)
  const idx = dc.useMemo(() => pages
    .map(p => ({ p,
      hay:(titleOf(p)+" "+sv(p.value("summary"))+" "+kwText(p)+" "+sv(p.value("category"))).toLowerCase(),
      clusters:clustersOf(p), src:sourceTypeOf(p) })), [pages]);

  // Facet counts (sources by SRC_ORDER; topic clusters by WIKI_CLUSTERS + Uncategorized)
  const facets = dc.useMemo(() => {
    const sC = {}; SRC_ORDER.forEach(s=>sC[s]=0);
    const cC = {}; H.WIKI_CLUSTERS.forEach(c=>cC[c]=0); let un=0;
    idx.forEach(r => {
      sC[r.src] = (sC[r.src]||0) + 1;
      if(!r.clusters.length) un++;
      r.clusters.forEach(c=>{if(cC[c]!=null)cC[c]++;});
    });
    return { sC, cC, un };
  }, [idx]);

  // Three-facet AND combination + sort
  const filtered = dc.useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = idx.filter(r => {
      if (needle && r.hay.indexOf(needle) < 0) return false;
      if (src && r.src !== src) return false;
      if (cluster) { if (cluster==="Uncategorized") { if (r.clusters.length) return false; }
                     else if (r.clusters.indexOf(cluster) < 0) return false; }
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
  }, [idx, q, src, cluster, sortKey, sortDir]);

  // Columns (title/created/modified have clickable sort headers; source/topic are facet columns with grouped views)
  const cols = dc.useMemo(() => [
    {id:"title",title:<SortHeader k="title" label="Title" />,value:p=>p.$link},
    {id:"src",title:"Source",width:"minimum",value:p=>sourceTypeOf(p),
      render:v=><span title={SRC_FOLDER[v]||""}>{H.chip(v, SRC_COLOR[v]||"#6c757d")}</span>},
    {id:"cluster",title:"Topic",value:p=>clustersOf(p),render:renderClusters},
    {id:"created",title:<SortHeader k="created" label="Created" />,width:"minimum",value:p=>H.fmtDate(p.value("created"),"yyyy-MM-dd")},
    {id:"modified",title:<SortHeader k="modified" label="Modified" />,width:"minimum",value:p=>H.fmtDate(p.$mtime,"yyyy-MM-dd")},
    {id:"summary",title:"Summary",value:p=>sv(p.value("summary"))||"—"},
  ], [sortKey, sortDir]);

  const listView = () => H.tabTable(filtered, cols, "No matching sources", PAGE_SIZE);
  const srcView = () => {
    if (!filtered.length) return H.emptyState("No matching sources");
    const g = {}; filtered.forEach(p=>{ const s=sourceTypeOf(p); (g[s]=g[s]||[]).push(p); });
    return <div>{SRC_ORDER.filter(s=>g[s]&&g[s].length).map(s=>
      <div key={s} style={{marginBottom:"14px"}}>
        <div style={{fontWeight:700,margin:"6px 0"}}>
          <span title={SRC_FOLDER[s]||""}>{H.chip(s, SRC_COLOR[s]||"#6c757d")}</span>
          <span style={{color:"var(--text-muted)",fontWeight:400,marginLeft:"6px"}}>· {g[s].length}</span></div>
        {H.tabTable(g[s], cols, "", PAGE_SIZE)}</div>)}</div>;
  };

  return <div style={{fontFamily:"var(--font-interface)"}}>
    <div style={{fontSize:"1.3em",fontWeight:700,color:"var(--text-accent)",marginBottom:"8px"}}>🗃 Sources · {idx.length} total</div>
    <input type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Search title / summary / keywords / category…"
      style={{width:"100%",boxSizing:"border-box",padding:"7px 12px",borderRadius:"8px",
      border:"1px solid var(--background-modifier-border)",background:"var(--background-primary)",
      color:"var(--text-normal)",fontSize:"0.95em",marginBottom:"8px"}} />
    {/* Primary facet: source (by folder) — first row at the very top */}
    <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"6px",alignItems:"center"}}>
      <span style={{fontSize:"0.78em",color:"var(--text-faint)",marginRight:"2px",whiteSpace:"nowrap"}}>Source</span>
      <FacetChip label="All" active={!src} onClick={()=>setSrc(null)} />
      {SRC_ORDER.filter(s=>facets.sC[s]>0).map(s=>
        <FacetChip key={s} label={s} count={facets.sC[s]} color={SRC_COLOR[s]} title={SRC_FOLDER[s]}
          active={src===s} onClick={()=>setSrc(src===s?null:s)} />)}
    </div>
    {/* Secondary facet: topic cluster */}
    <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"6px",alignItems:"center"}}>
      <span style={{fontSize:"0.78em",color:"var(--text-faint)",marginRight:"2px",whiteSpace:"nowrap"}}>Topic</span>
      <FacetChip label="All" active={!cluster} onClick={()=>setCluster(null)} />
      {H.WIKI_CLUSTERS.filter(c=>facets.cC[c]>0).map(c=>
        <FacetChip key={c} label={c} count={facets.cC[c]} color={CLUSTER_COLOR[c]}
          active={cluster===c} onClick={()=>setCluster(cluster===c?null:c)} />)}
      {facets.un>0 && <FacetChip label="Uncategorized" count={facets.un} color={CLUSTER_COLOR["Uncategorized"]}
        active={cluster==="Uncategorized"} onClick={()=>setCluster(cluster==="Uncategorized"?null:"Uncategorized")} />}
    </div>
    <div style={{marginTop:"6px"}}>
      <H.TabbedView tabs={[ {id:"list",label:"📋 List",count:filtered.length,render:listView},
                            {id:"src",label:"🗂 By Source",count:filtered.length,render:srcView} ]} />
    </div>
  </div>;
}
return SourceMOC;
```
