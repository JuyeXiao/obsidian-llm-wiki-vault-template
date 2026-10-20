#!/usr/bin/env node
"use strict";
// Warning-only: reports the completed write; never edits or reverts a note.
const fs = require("node:fs");
const path = require("node:path");
const { buildMarkdownIndex, extractMarkdownLinks, partitionPageLinks, frontmatterValues } = require("../../.agents/skills/wiki-lint/scripts/wiki-graph.js");
const { validateWikiContracts } = require("../../.agents/skills/wiki-lint/scripts/wiki-contract.js");
const ROOT = path.resolve(__dirname, "../..");

function extractEditedPaths(payload) {
  const input = payload?.tool_input || {};
  const paths = new Set();
  if (typeof input === "object") {
    for (const value of [input.file_path, input.path]) if (typeof value === "string" && value.trim()) paths.add(value.trim());
  }
  const patch = typeof input === "string" ? input : input.patch || input.input || input.command || "";
  for (const line of String(patch).split(/\r?\n/)) {
    const match = line.match(/^\*\*\* (?:(?:Update|Add) File|Move to): (.+)$/) || line.match(/^\+\+\+ b\/(.+)$/);
    if (match) paths.add(match[1].trim());
  }
  return [...paths];
}

function validateFile(vault, inputPath, cwd = vault) {
  const target = path.resolve(cwd, inputPath);
  const outside = p => p === ".." || p.startsWith(".." + path.sep) || path.isAbsolute(p);
  if (outside(path.relative(vault, target)) || !target.toLowerCase().endsWith(".md") || target.endsWith(".excalidraw.md") || !fs.existsSync(target)) return [];
  const realVault = fs.realpathSync(vault), realTarget = fs.realpathSync(target);
  const relative = path.relative(realVault, realTarget);
  if (outside(relative)) return ["Write target resolves outside the vault; validation skipped"];
  const rel = relative.split(path.sep).join("/");
  const lower = rel.toLowerCase();
  const wiki = lower.startsWith("inbox/wiki/");
  const note = /^(para|zeta)\//.test(lower) && !lower.startsWith("zeta/fleeting/") && !lower.startsWith("para/workstation/");
  if (!wiki && !note) return [];
  const markdown = fs.readFileSync(realTarget, "utf8");
  if (!/^\uFEFF?---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(markdown)) return [rel + ": missing frontmatter"];
  if (wiki) {
    const index = buildMarkdownIndex(realVault);
    const record = index.records.find(r => r.absolutePath === realTarget || r.relativePath.toLowerCase() === lower);
    if (!record) return [rel + ": cannot index written page"];
    return validateWikiContracts({ index, pages: [{ record, markdown, links: extractMarkdownLinks(markdown), ...partitionPageLinks(markdown) }] }).errors;
  }
  const warnings = [];
  for (const key of ["tags", "keywords", "summary"]) {
    if (!frontmatterValues(markdown, key)?.length) warnings.push(rel + ": missing " + key);
  }
  const taglist = path.join(realVault, "SYSTEM/TAGS/tag-library.flat.txt");
  if (fs.existsSync(taglist)) {
    const known = new Set(fs.readFileSync(taglist, "utf8").split(/\r?\n/));
    for (const tag of frontmatterValues(markdown, "tags") || []) {
      if (tag.startsWith("topic/") && !known.has(tag)) warnings.push(rel + ": tag drift " + tag + "; see SYSTEM/TAGS/tag-spec.md");
    }
  }
  return warnings;
}

function validatePayload(payload, vault = ROOT) {
  if (!payload || typeof payload !== "object") throw new Error("Invalid hook payload");
  const cwd = path.resolve(payload.cwd || vault);
  const files = extractEditedPaths(payload);
  if (!files.length && /^(Write|Edit|apply_patch)$/.test(payload.tool_name || "")) return ["No supported edited path in hook payload; validation did not run"];
  return files.flatMap(file => validateFile(vault, file, cwd));
}

function runHook() {
  try {
    const warnings = validatePayload(JSON.parse(fs.readFileSync(0, "utf8")));
    if (!warnings.length) return 0;
    console.error("Vault write warnings (write was NOT reverted):\n" + warnings.map(w => "- " + w).join("\n"));
  } catch (error) { console.error("Vault hook validation incomplete (write was NOT reverted): " + error.message); }
  return 2;
}

module.exports = { extractEditedPaths, validateFile, validatePayload, runHook };
if (require.main === module) process.exitCode = runHook();
