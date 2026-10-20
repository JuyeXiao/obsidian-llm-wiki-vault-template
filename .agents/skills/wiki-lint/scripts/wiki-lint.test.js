"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { buildMarkdownIndex, resolveTarget, extractSourceLinks, extractMarkdownLinks } = require("./wiki-graph.js");
const { bodySha256, deriveImplementationState, validateRegistry } = require("./wiki-state.js");
const { lintWiki, humanReport, writeDecisions, pollutedTags } = require("./wiki-lint.js");

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "public-wiki-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }));
  const write = (file, text) => { const p = path.join(root, file); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text, "utf8"); };
  const json = (file, data) => write(file, JSON.stringify(data, null, 2) + "\n");
  write("INBOX/schema/wiki-schema.md", "---\nschema_version: 1\n---\n# Schema\n");
  json("INBOX/schema/wiki-source-policies.json", { schema_version: 1, policies: [] });
  json("INBOX/wiki/source-decisions.json", { schema_version: 1, decisions: [] });
  write("INBOX/raw/README.md", "Instructions, not a source\n");
  write("INBOX/raw/Clippings/Example.md", "---\ntype: clippings\ntags: [topic/productivity/note-taking]\n---\nOriginal example.\n");
  write("ZETA/LITERATURE/Example.md", "Literature with the same name\n");
  write("INBOX/wiki/Productivity/Concept.md", page());
  write("INBOX/wiki/index.md", "---\ntype: wiki_index\n---\n# Index\n## Productivity\n- [[Concept]] · concept · A reusable idea · 1 source\n");
  write("INBOX/wiki/log.md", "---\ntype: wiki_index\n---\n# Log\n");
  const decision = (disposition = "ingest_existing", extra = {}) => ({
    raw_path: "INBOX/raw/Clippings/Example.md", disposition,
    ...(disposition.startsWith("ingest_") ? { target_wiki: ["INBOX/wiki/Productivity/Concept.md"] } : {}),
    reason_code: "example_review", reason: "Synthetic fixture, not a user position.", confidence: "high",
    decided_at: "2026-01-01", review_after: null, revisit_on: [], overrides_policy: null,
    raw_body_sha256: bodySha256(fs.readFileSync(path.join(root, "INBOX/raw/Clippings/Example.md"), "utf8")), ...extra,
  });
  return { root, write, json, decision, registry: (...decisions) => ({ schema_version: 1, decisions }) };
}

function page(extra = {}, body = "## Sources\n- [[INBOX/raw/Clippings/Example]] · Original example.\n") {
  const fields = { title: "Concept", type: "wiki_concept", category: "Productivity", tags: "[wiki/Productivity]", source_count: 1, created: "2026-01-01", updated: "2026-01-01", status: "draft", ...extra };
  return "---\n" + Object.entries(fields).map(([k, v]) => k + ": " + v).join("\n") + "\n---\n# Concept\n" + body;
}

function snapshot(root) {
  const result = {};
  function walk(folder) { for (const item of fs.readdirSync(folder, { withFileTypes: true })) {
    const file = path.join(folder, item.name);
    if (item.isDirectory()) walk(file); else result[path.relative(root, file)] = fs.readFileSync(file).toString("base64");
  } }
  walk(root); return result;
}

test("batch-1: path resolution preserves qualified, relative and ambiguous identities", t => {
  const { root, write } = fixture(t);
  write("ZETA/PERMANENT/Unique.md", "unique");
  const index = buildMarkdownIndex(root), sourcePath = "INBOX/wiki/Productivity/Concept.md";
  assert.equal(resolveTarget("Example", index, { sourcePath }).status, "ambiguous");
  for (const target of ["INBOX/raw/Clippings/Example.md#Section|Alias", "Clippings/Example", "../../raw/Clippings/Example"]) {
    assert.equal(resolveTarget(target, index, { sourcePath }).match.relativePath, "INBOX/raw/Clippings/Example.md");
  }
  assert.equal(resolveTarget("Unique", index).match.relativePath, "ZETA/PERMANENT/Unique.md");
  for (const target of ["../../../../Example", "/INBOX/raw/Clippings/Example", "https://example.invalid/x"]) assert.equal(resolveTarget(target, index, { sourcePath }).status, "missing");
});

test("batch-1: Sources excludes code, comments and later sections; raw pollution only reads frontmatter", () => {
  const text = '# Page\n- [[Not a source]]\n```md\n## Sources\n- [[Example]]\n```\n<!-- ## Sources\n[[hidden]] -->\n## Sources\n- [[raw]] · [[relation]]\n# Next\n- [[Not raw]]';
  assert.deepEqual(extractSourceLinks(text), ["raw"]);
  assert.equal(extractMarkdownLinks(text).find(l => l.target === "relation").role, "relation");
  assert.equal(pollutedTags('---\ntags: ["topic/data/sql"]\n---\nstray topic/data/sql"'), false);
  assert.equal(pollutedTags('---\ntags:\n  - topic/data/sql"\n---'), true);
});

test("batch-1: lint is read-only and rejects same-name raw/literature ambiguity and path escapes", t => {
  const { root, write } = fixture(t);
  const before = snapshot(root), good = lintWiki(root);
  assert.deepEqual(good.errors, []);
  assert.equal(good.raw_summary.referenced_raw, 1);
  assert.deepEqual(snapshot(root), before);
  write("INBOX/wiki/Productivity/Concept.md", page({}, "## Sources\n- [[Example]]\n"));
  const failedBefore = snapshot(root), bad = lintWiki(root);
  assert.ok(bad.errors.some(e => /ambiguous/i.test(e)));
  assert.equal(bad.raw_summary.referenced_raw, 0);
  assert.deepEqual(snapshot(root), failedBefore);
  assert.throws(() => lintWiki(root, { cluster: "../../raw" }), /Invalid Wiki cluster/);
});

test("five dispositions derive from actual citations, not declarations", t => {
  const { root, write, json, decision, registry } = fixture(t);
  for (const disposition of ["ingest_existing", "ingest_new"]) {
    json("INBOX/wiki/source-decisions.json", registry(decision(disposition)));
    assert.equal(lintWiki(root).sources[0].implementation_state, "satisfied");
  }
  for (const disposition of ["archive_only", "by_design_skip", "defer"]) {
    const d = decision(disposition, disposition === "defer" ? { review_after: "2030-01-01" } : {});
    json("INBOX/wiki/source-decisions.json", registry(d));
    assert.equal(lintWiki(root).sources[0].implementation_state, "conflict");
  }
  write("INBOX/wiki/Productivity/Concept.md", page({ type: "wiki_moc", source_count: 0 }, "Navigation only\n"));
  write("INBOX/wiki/index.md", "---\ntype: wiki_index\n---\n## Productivity\n- [[Concept]] · moc · Navigation\n");
  for (const disposition of ["archive_only", "by_design_skip", "defer"]) {
    json("INBOX/wiki/source-decisions.json", registry(decision(disposition, disposition === "defer" ? { review_after: "2030-01-01" } : {})));
    const r = lintWiki(root, { today: "2026-01-02" });
    assert.deepEqual(r.errors, []);
    assert.equal(r.sources[0].implementation_state, "satisfied");
    assert.equal(r.raw_summary.unreferenced_raw, 1);
    assert.equal(r.raw_summary.remaining_orphan, 0);
  }
  json("INBOX/wiki/source-decisions.json", registry(decision("defer", { review_after: "2026-01-02", revisit_on: ["new_evidence"] })));
  assert.equal(lintWiki(root, { today: "2026-01-02" }).sources[0].implementation_state, "review_due");
  assert.equal(lintWiki(root, { today: "2026-01-01", revisitTriggers: ["new_evidence"] }).sources[0].implementation_state, "review_due");
});

test("hash changes detect body edits but ignore frontmatter and checkout CRLF", t => {
  const { root, write, json, decision, registry } = fixture(t);
  json("INBOX/wiki/source-decisions.json", registry(decision()));
  const file = path.join(root, "INBOX/raw/Clippings/Example.md");
  const text = fs.readFileSync(file, "utf8");
  assert.equal(bodySha256(text), bodySha256(text.replace(/\n/g, "\r\n")));
  write("INBOX/raw/Clippings/Example.md", text.replace("clippings", "article"));
  assert.equal(lintWiki(root).sources[0].implementation_state, "satisfied");
  write("INBOX/raw/Clippings/Example.md", text + "New evidence.\n");
  assert.equal(lintWiki(root).sources[0].implementation_state, "stale");
  assert.ok(lintWiki(root).errors.some(e => e.startsWith("stale:")));
});

test("registry rejects unknown versions, duplicates, forged state and invalid defer", t => {
  const { root, json, registry, decision } = fixture(t);
  for (const r of [{ ...registry(), schema_version: 99 }, registry(decision(), decision()), registry(decision("defer")), registry(decision("archive_only", { implementation_state: "satisfied" }))]) {
    json("INBOX/wiki/source-decisions.json", r);
    assert.ok(lintWiki(root).errors.length);
  }
  assert.ok(validateRegistry({ schema_version: 1, decisions: [null] }).errors.length);
});

test("schema and policy versions fail closed; policies need both path and type", t => {
  const { root, write, json } = fixture(t);
  write("INBOX/schema/wiki-schema.md", "---\nschema_version: 2\n---\n");
  assert.ok(lintWiki(root).errors.some(e => /schema_version/.test(e)));
  write("INBOX/schema/wiki-schema.md", "---\nschema_version: 1\n---\n");
  json("INBOX/schema/wiki-source-policies.json", { schema_version: 99, policies: [] });
  assert.ok(lintWiki(root).errors.some(e => /policy schema_version/.test(e)));
  json("INBOX/schema/wiki-source-policies.json", { schema_version: 1, policies: [{ id: "fixture", match: { path_prefix: "INBOX/raw/Clippings", type: "different" }, default_disposition: "archive_only", reason_code: "example", allow_explicit_override: false }] });
  assert.equal(lintWiki(root).sources[0].implementation_state, "legacy_ingested");
});

test("ingest requires every target citation; forbidden policy overrides conflict", () => {
  const decision = { disposition: "ingest_new", target_wiki: ["a", "b"] };
  assert.equal(deriveImplementationState({ decision, citations: ["a"], targetExists: true }).state, "blocked");
  assert.equal(deriveImplementationState({ decision, citations: ["a", "b", "c"] }).state, "conflict");
  assert.equal(deriveImplementationState({ decision, citations: [], targetExists: false }).state, "blocked");
  assert.equal(deriveImplementationState({ decision: { ...decision, overrides_policy: "p" }, policy: { id: "p", default_disposition: "archive_only", allow_explicit_override: false } }).state, "conflict");
});

test("English titles and page type source requirements use real source cardinality", t => {
  const { root, write } = fixture(t);
  for (const fields of [{ source_count: 2 }, { source_count: 0 }, { type: "wiki_conflict", status: "open" }, { type: "wiki_moc" }, { type: "wiki_index" }, { tags: "[wiki/ProductivityExtra]" }, { created: "2026-02-30" }, { title: "Wrong name" }]) {
    write("INBOX/wiki/Productivity/Concept.md", page(fields));
    assert.ok(lintWiki(root).errors.length, JSON.stringify(fields));
  }
  write("INBOX/wiki/Productivity/Concept.md", page({}, "```md\n## Sources\n- [[wrong]]\n```\n## Sources\n- [[INBOX/raw/Clippings/Example]]\n"));
  assert.deepEqual(lintWiki(root).errors, []);
});

test("index checks missing/duplicate rows, category, short type, count and ignored examples", t => {
  const { root, write } = fixture(t);
  const base = "---\ntype: wiki_index\n---\n## Productivity\n";
  for (const body of ["", "- [[Concept]] · concept · Summary · 2 sources\n", "- [[Concept]] · wiki_concept · Summary · 1 source\n", "- [[Concept]] · concept · Summary · 1 source\n- [[Concept]] · concept · Twice · 1 source\n"]) {
    write("INBOX/wiki/index.md", base + body);
    assert.ok(lintWiki(root).errors.some(e => /index/i.test(e)));
  }
  write("INBOX/wiki/index.md", base + "```md\n- [[Missing]] · concept · ignored\n```\n- [[Concept]] · concept · Summary · 1 source\n");
  assert.deepEqual(lintWiki(root).errors, []);
});

test("MOC coverage and body navigation are checked without counting them as sources", t => {
  const { root, write } = fixture(t);
  write("INBOX/wiki/Productivity/Topic Hub.md", page({ title: "Topic Hub", type: "wiki_moc", source_count: 0 }, "No members\n"));
  assert.ok(lintWiki(root).errors.some(e => e.startsWith("MOC missing")));
  write("INBOX/wiki/Productivity/Concept.md", page({}, "[[Missing]]\n## Sources\n- [[INBOX/raw/Clippings/Example]]\n"));
  assert.ok(lintWiki(root).errors.some(e => /navigation/.test(e)));
});

test("human/JSON share results, cluster uses full graph and failures remain JSON", t => {
  const { root } = fixture(t);
  const report = lintWiki(root), scoped = lintWiki(root, { cluster: "Productivity" });
  assert.deepEqual(scoped.sources, report.sources);
  assert.deepEqual(scoped.errors, report.errors);
  assert.ok(humanReport(report).includes(JSON.stringify(report.raw_summary)));
  const script = "process.exitCode=require(process.argv[1]).main(process.argv.slice(3),process.argv[2])";
  for (const args of [["--json"], ["--unknown", "--json"], ["--today", "invalid", "--json"]]) {
    const run = spawnSync(process.execPath, ["-e", script, path.join(__dirname, "wiki-lint.js"), root, ...args], { encoding: "utf8" });
    const value = JSON.parse(run.stdout);
    assert.equal(value.schema_version, 1);
    assert.equal(run.status, value.errors.length ? 1 : 0);
  }
});

test("decision writer runs full validation and leaves all files intact on failure", t => {
  const { root, write, registry, decision } = fixture(t);
  const before = snapshot(root);
  assert.ok(writeDecisions(root, registry(decision("archive_only"))).errors.length);
  assert.deepEqual(snapshot(root), before);
  write("INBOX/wiki/index.md", "---\ntype: wiki_index\n---\n# Broken index\n");
  const broken = snapshot(root);
  assert.ok(writeDecisions(root, registry(decision())).errors.length);
  assert.deepEqual(snapshot(root), broken);
  write("INBOX/wiki/index.md", Buffer.from(before["INBOX\\wiki\\index.md"] || before["INBOX/wiki/index.md"], "base64").toString());
  assert.deepEqual(writeDecisions(root, registry(decision())).errors, []);
  assert.equal(lintWiki(root).sources[0].implementation_state, "satisfied");
  const after = snapshot(root);
  assert.deepEqual(Object.keys(after).filter(k => before[k] !== after[k]), [path.join("INBOX", "wiki", "source-decisions.json")]);
});

test("null documents and raw documentation never become successful source decisions", t => {
  const {root,write,json,registry,decision}=fixture(t);
  json('INBOX/wiki/source-decisions.json',null);
  assert.ok(lintWiki(root).errors.some(e=>/registry document/.test(e)));
  json('INBOX/wiki/source-decisions.json',registry());
  json('INBOX/schema/wiki-source-policies.json',null);
  assert.ok(lintWiki(root).errors.some(e=>/policy document/.test(e)));
  json('INBOX/schema/wiki-source-policies.json',{schema_version:1,policies:[]});
  write('INBOX/wiki/Productivity/Concept.md',page({},'## Sources\n- [[INBOX/raw/README]]\n'));
  assert.ok(lintWiki(root).errors.some(e=>/documentation/.test(e)));
  json('INBOX/wiki/source-decisions.json',registry(decision('archive_only',{raw_path:'INBOX/raw/README.md'})));
  assert.ok(lintWiki(root).errors.some(e=>/documentation/.test(e)));
});

test("decision writer rejects unknown stored versions and concurrent changes before replacement", t => {
  const {root,write,json,registry,decision}=fixture(t);
  json('INBOX/wiki/source-decisions.json',{schema_version:99,decisions:[]});
  const before=snapshot(root);
  assert.ok(writeDecisions(root,registry(decision())).errors.some(e=>/unknown registry/.test(e)));
  assert.deepEqual(snapshot(root),before);
  json('INBOX/wiki/source-decisions.json',registry());
  const saved=fs.writeFileSync;
  try {
    fs.writeFileSync=function(file,...args) {
      saved(file,...args);
      if(String(file).endsWith('.tmp')) saved(path.join(root,'INBOX/raw/Clippings/Example.md'),'Concurrent source update');
    };
    assert.throws(()=>writeDecisions(root,registry(decision())),/Vault changed during validation/);
  } finally { fs.writeFileSync=saved; }
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'INBOX/wiki/source-decisions.json'))),registry());
  assert.equal(fs.readdirSync(path.join(root,'INBOX/wiki')).some(f=>f.endsWith('.tmp')),false);
});
