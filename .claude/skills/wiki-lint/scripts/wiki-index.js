"use strict";

const fs = require("node:fs");
const path = require("node:path");

const {
  buildMarkdownGraph,
  frontmatterField,
  visibleMarkdownLines,
  resolveTarget,
} = require("./wiki-graph.js");
const { resolvedSourcePaths } = require("./wiki-contract.js");


const SHORT_TYPES = {
  wiki_moc: "moc",
  wiki_overview: "overview",
  wiki_summary: "summary",
  wiki_concept: "concept",
  wiki_entity: "entity",
  wiki_conflict: "conflict",
};


function indexPath(vaultRoot) {
  return path.join(path.resolve(vaultRoot), "INBOX", "wiki", "index.md");
}


function parseIndex(markdown) {
  const entries = [];
  const errors = [];
  let category = "";
  const lines = String(markdown).split(/\r?\n/);
  for (const { line, lineNumber } of visibleMarkdownLines(markdown)) {
    const lineIndex = lineNumber - 1;
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      category = heading[1].trim();
      continue;
    }
    if (!line.trimStart().startsWith("- [[")) continue;
    const match = line.match(/^(\s*-\s+\[\[([^\]]+)\]\]\s*·\s*)(\S+)(\s*·\s*)(.*)$/);
    if (!match) {
      errors.push("Cannot parse index entry at line " + (lineIndex + 1));
      continue;
    }
    const sourceSuffix = match[5].match(/^(.*?)(\s*·\s*)(\d+)\s+sources?\s*$/);
    entries.push({
      lineIndex,
      line,
      category,
      target: match[2].trim(),
      shortType: match[3].trim(),
      summary: sourceSuffix ? sourceSuffix[1].trim() : match[5].trim(),
      sourceCount: sourceSuffix ? Number(sourceSuffix[3]) : null,
      sourceSeparator: sourceSuffix ? sourceSuffix[2] : null,
      prefix: match[1],
      separator: match[4],
    });
  }
  return { entries, errors, lines };
}


function contentPages(graph) {
  return graph.pages.filter((page) => {
    const relativePath = page.record.relativePath.toLowerCase();
    return relativePath.startsWith("inbox/wiki/")
      && frontmatterField(page.markdown, "type") !== "wiki_index";
  });
}


function actualSourceCount(page, index, errors = []) {
  return resolvedSourcePaths(page, index, errors).length;
}


function checkIndex(vaultRoot, graphOverride = null) {
  const root = path.resolve(vaultRoot);
  const file = indexPath(root);
  if (!fs.existsSync(file)) {
    return {
      errors: ["Missing global index: INBOX/wiki/index.md"],
      warnings: [],
      entries: [],
      summary: { expected: 0, actual: 0, missing: 0, duplicates: 0 },
    };
  }

  const graph = graphOverride || buildMarkdownGraph(root);
  const parsed = parseIndex(fs.readFileSync(file, "utf8"));
  const errors = [...parsed.errors];
  const expectedPages = contentPages(graph);
  const expectedByPath = new Map(expectedPages.map((page) => [page.record.relativePath, page]));
  const seen = new Map();
  let duplicates = 0;

  for (const entry of parsed.entries) {
    const resolution = resolveTarget(entry.target, graph.index);
    if (resolution.status !== "resolved" || !expectedByPath.has(resolution.match.relativePath)) {
      errors.push("Index entry is not a unique Wiki content page: [[" + entry.target + "]]");
      continue;
    }
    const page = resolution.match;
    const relativePath = page.relativePath;
    if (seen.has(relativePath)) {
      duplicates += 1;
      errors.push("Duplicate index entry: " + relativePath);
      continue;
    }
    seen.set(relativePath, entry);
    const pageData = graph.pageByPath.get(page.absolutePath);
    const type = frontmatterField(pageData.markdown, "type");
    const expectedCategory = relativePath.split("/")[2];
    if (entry.category !== expectedCategory) {
      errors.push(
        "Index category mismatch: " + relativePath
          + " (index=" + entry.category + "; actual=" + expectedCategory + ")",
      );
    }
    if (entry.shortType !== SHORT_TYPES[type]) {
      errors.push(
        "Index short type mismatch: " + relativePath
          + " (index=" + entry.shortType + "; actual=" + SHORT_TYPES[type] + ")",
      );
    }
    const sourceCount = actualSourceCount(pageData, graph.index, errors);
    if (type === "wiki_moc") {
      if (entry.sourceCount !== null) {
        errors.push("MOC/index entry must omit a source count: " + relativePath);
      }
    } else if (entry.sourceCount !== sourceCount) {
      errors.push(
        "Index source count mismatch: " + relativePath
          + " (index=" + (entry.sourceCount ?? "<missing>") + "; actual=" + sourceCount + ")",
      );
    }
  }

  const missing = expectedPages.filter((page) => !seen.has(page.record.relativePath));
  for (const page of missing) errors.push("Index missing page: " + page.record.relativePath);
  return {
    errors,
    warnings: [],
    entries: parsed.entries,
    summary: {
      expected: expectedPages.length,
      actual: seen.size,
      missing: missing.length,
      duplicates,
    },
  };
}


function main(argv = process.argv.slice(2), vaultRoot = path.resolve(__dirname, "../../../..")) {
  if (argv.length > 1 || (argv[0] && argv[0] !== "--check")) {
    console.error("Usage: wiki-index.js [--check]");
    return 1;
  }
  const result = checkIndex(vaultRoot);
  console.log(JSON.stringify(result));
  return result.errors.length ? 1 : 0;
}

module.exports = { SHORT_TYPES, checkIndex, main, parseIndex, actualSourceCount };
if (require.main === module) process.exitCode = main();
