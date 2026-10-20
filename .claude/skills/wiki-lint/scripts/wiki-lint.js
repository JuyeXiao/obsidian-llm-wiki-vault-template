#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { buildMarkdownGraph, frontmatterField, resolveTarget } = require("./wiki-graph.js");
const { SCHEMA_VERSION, evaluateStates, isDate, isRawSource } = require("./wiki-state.js");
const { validateWikiContracts, resolvedSourcePaths } = require("./wiki-contract.js");
const { checkIndex } = require("./wiki-index.js");

function readJson(root, relative, errors) {
  try { return JSON.parse(fs.readFileSync(path.join(root, relative), "utf8").replace(/^\uFEFF/, "")); }
  catch (error) { errors.push(relative + ": " + error.message); return {}; }
}

function pollutedTags(markdown) {
  const fm = String(markdown).match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!fm) return false;
  let inTags = false;
  for (const line of fm[1].split(/\r?\n/)) {
    if (/^tags\s*:/i.test(line)) inTags = true;
    else if (/^\S/.test(line)) inTags = false;
    if (inTags && /(?<![\w"'])topic\/[^\s,\]"']+["']/.test(line)) return true;
  }
  return false;
}

function lintWiki(vaultRoot, options = {}) {
  const root = path.resolve(vaultRoot);
  const errors = [], warnings = [];
  const cluster = options.cluster || "";
  if (cluster && (/[\\/:]/.test(cluster) || cluster.startsWith(".") || !fs.existsSync(path.join(root, "INBOX/wiki", cluster)))) {
    throw new Error("Invalid Wiki cluster: " + cluster);
  }
  const graph = buildMarkdownGraph(root);
  const schema = graph.pages.find(p => p.record.relativePath === "INBOX/schema/wiki-schema.md");
  if (!schema || frontmatterField(schema.markdown, "schema_version") !== String(SCHEMA_VERSION)) {
    errors.push("Unsupported or missing Wiki schema_version; expected " + SCHEMA_VERSION);
  }
  const policies = readJson(root, "INBOX/schema/wiki-source-policies.json", errors);
  const registry = options.registry === undefined ? readJson(root, "INBOX/wiki/source-decisions.json", errors) : options.registry;
  const states = evaluateStates(root, graph, registry, policies, options);
  errors.push(...states.errors);
  const contract = validateWikiContracts(graph);
  errors.push(...contract.errors);
  const index = checkIndex(root, graph);
  errors.push(...index.errors);
  const wikiPages = graph.pages.filter(p => p.record.relativePath.startsWith("INBOX/wiki/"));
  for (const page of wikiPages) {
    const rel = page.record.relativePath;
    if (rel === "INBOX/wiki/log.md") continue;
    const type = frontmatterField(page.markdown, "type");
    if (!["wiki_index"].includes(type) && (graph.index.byBasename.get(page.record.foldedBasename) || []).length !== 1) {
      errors.push("Wiki name collision: " + rel);
    }
    const linked = new Set();
    for (const target of page.ordinaryLinks) {
      const resolved = resolveTarget(target, graph.index, { sourcePath: rel });
      if (resolved.status !== "resolved") errors.push("Unresolved or ambiguous navigation in " + rel + ": [[" + target + "]]");
      else linked.add(resolved.match.relativePath);
      if (resolved.warning) warnings.push(resolved.warning);
    }
    if (type === "wiki_moc") {
      const category = frontmatterField(page.markdown, "category");
      for (const member of wikiPages.filter(p => p.record.relativePath.startsWith("INBOX/wiki/" + category + "/") && !["wiki_index", "wiki_moc"].includes(frontmatterField(p.markdown, "type")))) {
        if (!linked.has(member.record.relativePath)) errors.push("MOC missing page: " + member.record.relativePath + " (" + rel + ")");
      }
    }
  }
  for (const page of graph.pages.filter(p => p.record.relativePath.startsWith("INBOX/raw/") && isRawSource(p.record))) {
    if (pollutedTags(page.markdown)) errors.push("Raw tag pollution (report only): " + page.record.relativePath);
  }
  for (const source of states.sources) {
    if (["blocked", "conflict", "stale"].includes(source.implementation_state)) errors.push(source.implementation_state + ": " + source.raw_path + " — " + source.state_reason);
    if (["pending", "review_due"].includes(source.implementation_state)) warnings.push(source.implementation_state + ": " + source.raw_path);
  }
  const pages = wikiPages.filter(p => p.record.basename !== "log" && (!cluster || p.record.relativePath.startsWith("INBOX/wiki/" + cluster + "/"))).map(p => ({
    path: p.record.relativePath,
    title: frontmatterField(p.markdown, "title"),
    type: frontmatterField(p.markdown, "type"),
    source_count: Number(frontmatterField(p.markdown, "source_count") || 0),
    source_paths: resolvedSourcePaths(p, graph.index, []),
  }));
  return {
    schema_version: SCHEMA_VERSION, cluster: cluster || null,
    errors: [...new Set(errors)], warnings: [...new Set(warnings)],
    info: ["Read-only unless --write-decisions is explicitly requested.", "Cluster filters pages only; validation and source state always use the full vault."],
    raw_summary: states.summary,
    decision_summary: { ...states.decision_summary, policy_count: Array.isArray(policies?.policies) ? policies.policies.length : 0 },
    index_summary: index.summary, pages, sources: states.sources,
  };
}

function humanReport(report) {
  return ["LLM Wiki check (schema " + report.schema_version + ")",
    ...report.errors.map(e => "ERROR: " + e), ...report.warnings.map(w => "WARNING: " + w),
    "Raw: " + JSON.stringify(report.raw_summary), "Index: " + JSON.stringify(report.index_summary),
    ...report.sources.map(s => s.raw_path + " → " + s.implementation_state + " (" + (s.disposition || "no decision") + ")"),
    report.errors.length + " error(s); raw and log unchanged."].join("\n");
}

function inputFingerprint(root) {
  const graph = buildMarkdownGraph(root);
  const files = graph.index.records.map(r => r.relativePath).concat(["INBOX/schema/wiki-source-policies.json", "INBOX/wiki/source-decisions.json"]);
  const hash = crypto.createHash("sha256");
  for (const file of files.sort()) {
    hash.update(file + "\0");
    hash.update(fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file)) : "MISSING");
  }
  return hash.digest("hex");
}

function writeDecisions(root, registry, options = {}) {
  const before = inputFingerprint(root);
  const report = lintWiki(root, { ...options, registry });
  const stored = readJson(root, "INBOX/wiki/source-decisions.json", report.errors);
  if (stored?.schema_version !== SCHEMA_VERSION) report.errors.push("Cannot replace an unknown registry version; review migration first");
  if (report.errors.length) return report;
  // Every submitted decision must be effective; unrelated pending raw may remain.
  for (const decision of registry.decisions) {
    const source = report.sources.find(s => s.raw_path === decision.raw_path);
    if (!source || source.implementation_state !== "satisfied") report.errors.push("Decision is not satisfied: " + decision.raw_path);
  }
  if (report.errors.length) return report;
  const destination = path.join(root, "INBOX/wiki/source-decisions.json");
  const next = JSON.stringify(registry, null, 2) + "\n";
  if (fs.readFileSync(destination, "utf8") === next) return report;
  const temp = destination + "." + crypto.randomUUID() + ".tmp";
  try {
    fs.writeFileSync(temp, next, { encoding: "utf8", flag: "wx" });
    if (inputFingerprint(root) !== before) throw new Error("Vault changed during validation; decisions were not replaced");
    fs.renameSync(temp, destination);
  } finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
  return report;
}

function main(argv = process.argv.slice(2), root = path.resolve(__dirname, "../../../..")) {
  const options = {};
  let json = false, candidate = null, write = false;
  try {
    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];
      if (arg === "--json") { json = true; continue; }
      if (["--cluster", "--today", "--revisit", "--decisions", "--write-decisions"].includes(arg)) {
        const value = argv[++i];
        if (!value || value.startsWith("--")) throw new Error(arg + " requires a value");
        if (arg === "--cluster") { if (options.cluster) throw new Error("Duplicate cluster"); options.cluster = value; }
        if (arg === "--today") { if (!isDate(value)) throw new Error("Invalid --today date"); options.today = value; }
        if (arg === "--revisit") (options.revisitTriggers ||= []).push(value);
        if (arg === "--decisions" || arg === "--write-decisions") {
          if (candidate) throw new Error("Only one decisions input is allowed");
          candidate = value; write = arg === "--write-decisions";
        }
      } else if (!arg.startsWith("-") && !options.cluster) options.cluster = arg;
      else throw new Error("Unknown or duplicate argument: " + arg);
    }
    if (candidate) options.registry = JSON.parse(fs.readFileSync(candidate, "utf8").replace(/^\uFEFF/, ""));
    const report = write ? writeDecisions(root, options.registry, options) : lintWiki(root, options);
    console.log(json ? JSON.stringify(report, null, 2) : humanReport(report));
    return report.errors.length ? 1 : 0;
  } catch (error) {
    const report = { schema_version: SCHEMA_VERSION, errors: [error.message], warnings: [], info: [], raw_summary: {}, decision_summary: {}, index_summary: {}, pages: [], sources: [] };
    console.log((json || argv.includes("--json")) ? JSON.stringify(report) : humanReport(report));
    return 1;
  }
}

module.exports = { lintWiki, humanReport, writeDecisions, pollutedTags, main };
if (require.main === module) process.exitCode = main();
