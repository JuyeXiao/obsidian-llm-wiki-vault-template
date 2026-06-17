// area_context_note.js — QuickAdd UserScript
// Create a documentation / workstation note within an area/project context:
//   · Placed under PARA/RESOURCES/DOCUMENTATIONS/<root>/ or PARA/WORKSTATION/<root>/ (<root> = current area/project root name)
//   · Keeps the documentation_note / workstation_note type and layout
//   · Injects the area field + structural tag (area/<root> or project/<root>) + connections (pointing to the family note) + category
//   · Not inside an area/project → falls back to the global folder, no area tag added
// kind comes from the calling macro's settings["Kind"]: documentation | workstation
//
// Implementation note: write the full content directly into the target folder with vault.create (the target lives in a
// DOCUMENTATIONS/WORKSTATION sub-folder whose Templater folder template is exactly the doc/workstation template, so even if
// processed it keeps the same layout); then wait a tick before injecting the area frontmatter, so it lands after any folder
// template processing. Everything is wrapped in try/catch; on failure no temp file is left behind.

function slug(s) { return String(s).toLowerCase().split(" ").join("_"); }

async function ensureFolder(app, folder) {
  const parts = folder.split("/");
  let cur = "";
  for (const p of parts) {
    cur = cur ? cur + "/" + p : p;
    if (!app.vault.getAbstractFileByPath(cur)) {
      try { await app.vault.createFolder(cur); } catch (e) { /* concurrent / already exists, ignore */ }
    }
  }
}

module.exports = {
  entry: async (params, settings) => {
    const app = params.app;
    const api = params.quickAddApi;
    const kind = ((settings && settings["Kind"]) || "documentation").trim().toLowerCase();
    const isDoc = kind !== "workstation";

    const tplPath = isDoc
      ? "SYSTEM/TEMPLATE/FORMAT/template_documentation_note.md"
      : "SYSTEM/TEMPLATE/FORMAT/template_workstation_note.md";
    const globalBase = isDoc ? "PARA/RESOURCES/DOCUMENTATIONS" : "PARA/WORKSTATION";

    // 1. Resolve the active file's area/project context
    let ctx = null; // {kind, root, famPath, famName}
    const af = app.workspace.getActiveFile();
    if (af) {
      let m = af.path.match(/^PARA\/AREAS\/([^/]+)\//);
      if (m) ctx = { kind: "area", root: m[1], famPath: `PARA/AREAS/${m[1]}/2. ${m[1]}.md`, famName: `2. ${m[1]}` };
      else {
        m = af.path.match(/^PARA\/PROJECTS\/([^/]+)\//);
        if (m) ctx = { kind: "project", root: m[1], famPath: `PARA/PROJECTS/${m[1]}/1. ${m[1]}.md`, famName: `1. ${m[1]}` };
      }
    }

    // 2. Get the name
    const name = await api.inputPrompt(`New ${isDoc ? "Documentation" : "Workstation"} note name`);
    if (!name) return;
    const safeName = name.replace(/[\\/:*?"<>|]/g, "·").trim();
    if (!safeName) { new Notice("Invalid name"); return; }

    // 3. Target folder (ensure it exists and validate)
    const targetFolder = ctx ? `${globalBase}/${ctx.root}` : globalBase;
    await ensureFolder(app, targetFolder);
    if (!app.vault.getAbstractFileByPath(targetFolder)) { new Notice("Could not create target folder: " + targetFolder); return; }
    const targetPath = `${targetFolder}/${safeName}.md`;
    if (app.vault.getAbstractFileByPath(targetPath)) { new Notice("Already exists: " + targetPath); return; }

    // 4. Read the template body and replace Templater tokens
    const tpl = app.vault.getAbstractFileByPath(tplPath);
    if (!tpl) { new Notice("Template not found: " + tplPath); return; }
    let body = await app.vault.read(tpl);
    const created = window.moment ? window.moment().format("YYYY-MM-DD HH:mm")
                                  : new Date().toISOString().slice(0, 16).replace("T", " ");
    body = body
      .replace(/<%\s*tp\.file\.creation_date\([^)]*\)\s*%>/g, created)
      .replace(/<%\s*tp\.file\.title\s*%>/g, safeName);

    // 5. Create directly at the target
    let file;
    try {
      file = await app.vault.create(targetPath, body);
    } catch (e) {
      new Notice("Creation failed: " + (e && e.message ? e.message : e));
      return;
    }

    // 6. Inject area frontmatter (wait a tick, so it lands after any folder template processing)
    if (ctx) {
      const tag = `${ctx.kind}/${slug(ctx.root)}`;
      let category = "";
      const fam = app.vault.getAbstractFileByPath(ctx.famPath);
      if (fam) {
        const fmc = app.metadataCache.getFileCache(fam);
        if (fmc && fmc.frontmatter && fmc.frontmatter.category) category = fmc.frontmatter.category;
      }
      await new Promise((r) => setTimeout(r, 250));
      try {
        await app.fileManager.processFrontMatter(file, (fm) => {
          fm.area = ctx.root;
          if (category) fm.category = category;
          let t = fm.tags;
          if (!Array.isArray(t)) t = (t === null || t === undefined || t === "") ? [] : [t];
          if (!t.includes(tag)) t.push(tag);
          fm.tags = t;
          fm.connections = [`[[${ctx.famPath}|${ctx.famName}]]`];
        });
      } catch (e) { new Notice("Failed to write area tag: " + (e && e.message ? e.message : e)); }
    }

    // 7. Open
    await app.workspace.getLeaf("tab").openFile(file);
    new Notice(`Created ${isDoc ? "Documentation" : "Workstation"}: ${targetPath}`);
  },
  settings: {
    name: "Area Context Note",
    author: "vault",
    options: {
      "Kind": { type: "text", defaultValue: "documentation", placeholder: "documentation | workstation" }
    }
  }
};
