"use strict";

const fs = require("node:fs");
const path = require("node:path");


const SKIP_DIRECTORIES = new Set([".git", "node_modules"]);


function slash(value) {
  return String(value).replaceAll("\\", "/");
}


function normalizeNfc(value) {
  return String(value ?? "").normalize("NFC");
}


function caseFold(value) {
  return normalizeNfc(value).toLowerCase();
}


function unique(items) {
  return [...new Set(items)].sort((left, right) => left.localeCompare(right));
}


function cleanWikiTarget(text, stripMarkdownExtension) {
  let target = String(text ?? "").trim();
  if (target.startsWith("![[")) target = target.slice(1);
  if (target.startsWith("[[") && target.endsWith("]]")) {
    target = target.slice(2, -2);
  }
  target = target.split("|", 1)[0].split("#", 1)[0].trim();
  target = slash(target);
  if (stripMarkdownExtension && target.toLowerCase().endsWith(".md")) {
    target = target.slice(0, -3);
  }
  return normalizeNfc(target);
}


function normalizeWikiTarget(text) {
  return cleanWikiTarget(text, true);
}


function addMapValue(map, key, value) {
  const values = map.get(key) || [];
  values.push(value);
  map.set(key, values);
}


function buildMarkdownIndex(vaultRoot) {
  const root = path.resolve(vaultRoot);
  const byRelativePath = new Map();
  const byRelativePathExact = byRelativePath;
  const byRelativePathFold = new Map();
  const byBasename = new Map();
  const byBasenameExact = new Map();
  const records = [];

  function walk(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.isDirectory()
        && (SKIP_DIRECTORIES.has(entry.name) || entry.name.startsWith("."))
      ) continue;
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
        const relativePath = slash(path.relative(root, absolutePath));
        const withoutExtension = relativePath.slice(0, -3);
        const basename = path.posix.basename(withoutExtension);
        const record = {
          absolutePath,
          relativePath,
          withoutExtension,
          basename,
          normalizedRelativePath: normalizeNfc(relativePath),
          normalizedWithoutExtension: normalizeNfc(withoutExtension),
          normalizedBasename: normalizeNfc(basename),
          foldedRelativePath: caseFold(relativePath),
          foldedWithoutExtension: caseFold(withoutExtension),
          foldedBasename: caseFold(basename),
        };
        records.push(record);
        byRelativePath.set(record.normalizedWithoutExtension, record);
        addMapValue(byRelativePathFold, record.foldedWithoutExtension, record);
        addMapValue(byBasename, record.foldedBasename, record);
        addMapValue(byBasenameExact, record.normalizedBasename, record);
      }
    }
  }

  walk(root);
  records.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  for (const map of [byRelativePathFold, byBasename, byBasenameExact]) {
    for (const matches of map.values()) {
      matches.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
    }
  }
  return {
    byRelativePath,
    byRelativePathExact,
    byRelativePathFold,
    byBasename,
    byBasenameExact,
    records,
    vaultRoot: root,
  };
}


function isUnder(record, prefix) {
  const normalized = normalizeWikiTarget(prefix);
  const candidate = record.normalizedWithoutExtension;
  return caseFold(candidate) === caseFold(normalized)
    || caseFold(candidate).startsWith(`${caseFold(normalized)}/`);
}


function recordsUnder(index, prefix) {
  return index.records.filter((record) => isUnder(record, prefix));
}


function findMatches(target, index, options = {}, useCaseFold = false) {
  const normalizedTarget = normalizeNfc(target);
  const candidate = useCaseFold ? caseFold(normalizedTarget) : normalizedTarget;
  const matches = index.records.filter((record) => {
    const value = useCaseFold ? record.foldedWithoutExtension : record.normalizedWithoutExtension;
    const basename = useCaseFold ? record.foldedBasename : record.normalizedBasename;
    const targetMatches = candidate.includes("/")
      ? value === candidate || value.endsWith(`/${candidate}`)
      : basename === candidate;
    return targetMatches && (!options.under || isUnder(record, options.under));
  });
  return matches.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}


function resolutionForMatches(target, matches, mode, originalTarget) {
  if (matches.length === 0) {
    return {
      target,
      status: "missing",
      resolution: "missing",
      matches: [],
    };
  }
  if (matches.length > 1) {
    return {
      target,
      status: "ambiguous",
      resolution: "ambiguous",
      matches,
    };
  }
  const match = matches[0];
  const originalClean = cleanWikiTarget(originalTarget, false);
  const nfcChanged = originalClean !== normalizeNfc(originalClean)
    || match.withoutExtension !== match.normalizedWithoutExtension
    || match.basename !== match.normalizedBasename;
  const resolution = mode === "case-fold" ? "case-fold" : nfcChanged ? "nfc" : "exact";
  return {
    target,
    status: "resolved",
    resolution,
    matches,
    match,
    warning: mode === "case-fold"
      ? `case-fold fallback for [[${cleanWikiTarget(originalTarget, false)}]] → ${match.relativePath}`
      : undefined,
  };
}


function resolveTarget(target, index, options = {}) {
  let normalized = normalizeWikiTarget(target);
  if (normalized.startsWith("/") || normalized.includes(":")) {
    return resolutionForMatches(normalized, [], "missing", target);
  }
  if (!normalized || normalized.startsWith("./") || normalized.startsWith("../")) {
    if (!options.sourcePath) return resolutionForMatches(normalized, [], "missing", target);
    normalized = normalized
      ? path.posix.normalize(path.posix.join(path.posix.dirname(options.sourcePath), normalized))
      : options.sourcePath.replace(/\.md$/i, "");
    if (normalized === ".." || normalized.startsWith("../")) {
      return resolutionForMatches(normalized, [], "missing", target);
    }
  } else if (normalized.split("/").some((part) => !part || part === "." || part === "..")) {
    return resolutionForMatches(normalized, [], "missing", target);
  }
  if (normalized.includes("/")) {
    const exact = index.byRelativePath.get(normalized);
    if (exact && (!options.under || isUnder(exact, options.under))) {
      return resolutionForMatches(normalized, [exact], "exact", target);
    }
  }
  const literal = cleanWikiTarget(target, false);
  const variants = [normalized];
  if (literal !== normalized) variants.push(literal);
  const doubleExtensionTarget = `${normalized}.md`;
  if (!variants.includes(doubleExtensionTarget)) variants.push(doubleExtensionTarget);

  for (const variant of variants) {
    const exactMatches = findMatches(variant, index, options, false);
    if (exactMatches.length) return resolutionForMatches(variant, exactMatches, "exact", target);
  }
  for (const variant of variants) {
    const foldedMatches = findMatches(variant, index, options, true);
    if (foldedMatches.length) return resolutionForMatches(variant, foldedMatches, "case-fold", target);
  }
  return resolutionForMatches(normalized, [], "missing", target);
}


function fenceStart(line) {
  const match = line.match(/^\s{0,3}(`{3,}|~{3,})/);
  if (!match) return null;
  return { marker: match[1][0], length: match[1].length };
}


function removeHtmlComments(line, state) {
  const visible = [];
  let cursor = 0;
  while (cursor < line.length) {
    if (state.inHtmlComment) {
      const close = line.indexOf("-->", cursor);
      if (close < 0) return visible.join("");
      state.inHtmlComment = false;
      cursor = close + 3;
      continue;
    }
    const open = line.indexOf("<!--", cursor);
    if (open < 0) {
      visible.push(line.slice(cursor));
      break;
    }
    visible.push(line.slice(cursor, open));
    state.inHtmlComment = true;
    cursor = open + 4;
  }
  return visible.join("");
}


function removeInlineCode(line) {
  let result = "";
  let cursor = 0;
  while (cursor < line.length) {
    if (line[cursor] !== "`") {
      result += line[cursor];
      cursor += 1;
      continue;
    }
    let delimiterLength = 1;
    while (line[cursor + delimiterLength] === "`") delimiterLength += 1;
    const delimiter = "`".repeat(delimiterLength);
    const close = line.indexOf(delimiter, cursor + delimiterLength);
    if (close < 0) break;
    cursor = close + delimiterLength;
  }
  return result;
}


function parseLineLinks(line, lineNumber, section, inSource) {
  const links = [];
  let cursor = 0;
  while (cursor < line.length) {
    const isEmbed = line.startsWith("![[", cursor);
    const isLink = isEmbed || line.startsWith("[[", cursor);
    if (!isLink) {
      cursor += 1;
      continue;
    }
    const openLength = isEmbed ? 3 : 2;
    const close = line.indexOf("]]", cursor + openLength);
    if (close < 0) break;
    const rawText = line.slice(cursor, close + 2);
    const target = normalizeWikiTarget(rawText);
    if (target || rawText.includes("#")) {
      links.push({
        rawText,
        target,
        line: lineNumber,
        section,
        isEmbed,
        inSource,
        indexOnLine: links.length,
      });
    }
    cursor = close + 2;
  }
  return links.map((link) => ({
    ...link,
    role: link.inSource && link.indexOnLine === 0 ? "source" : "relation",
  }));
}


function extractMarkdownLinks(markdown) {
  const links = [];
  let section = "";
  let inSource = false;
  for (const { line, lineNumber } of visibleMarkdownLines(markdown)) {
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*$/);
    if (heading) {
      section = heading[2].replace(/\s+#+\s*$/, "").trim();
      if (heading[1].length <= 2) inSource = heading[1].length === 2 && section === "Sources";
    }
    links.push(...parseLineLinks(line, lineNumber, section, inSource));
  }
  return links;
}

function visibleMarkdownLines(markdown) {
  const lines = String(markdown).split(/\r?\n/);
  const visible = [];
  let inFrontmatter = lines[0]?.replace(/^\uFEFF/, "").trim() === "---";
  let fence = null;
  let inHtmlComment = false;

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];
    if (inFrontmatter) {
      if (lineNumber > 1 && ["---", "..."].includes(line.trim())) inFrontmatter = false;
      continue;
    }

    const marker = fenceStart(line);
    if (fence) {
      if (marker && marker.marker === fence.marker && marker.length >= fence.length) fence = null;
      continue;
    }
    if (marker) {
      fence = marker;
      continue;
    }

    const visibleLine = removeInlineCode(removeHtmlComments(line, { get inHtmlComment() { return inHtmlComment; }, set inHtmlComment(value) { inHtmlComment = value; } }));
    visible.push({ line: visibleLine, lineNumber });
  }
  return visible;
}


function extractWikiLinks(markdown) {
  return unique(extractMarkdownLinks(markdown).map((link) => link.target));
}


function partitionPageLinks(markdown) {
  const links = extractMarkdownLinks(markdown);
  return {
    ordinaryLinks: unique(links.filter((link) => link.role !== "source").map((link) => link.target)),
    sourceLinks: unique(links.filter((link) => link.role === "source").map((link) => link.target)),
  };
}


function extractSourceLinks(markdown) {
  const seen = new Set();
  const links = [];
  for (const link of extractMarkdownLinks(markdown)) {
    if (link.role !== "source" || seen.has(link.target)) continue;
    seen.add(link.target);
    links.push(link.target);
  }
  return links;
}


function frontmatterField(markdown, key) {
  const match = String(markdown).match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)(?:\r?\n|$)/);
  if (!match) return "";
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator < 0 || line.slice(0, separator).trim() !== key) continue;
    return line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
  }
  return "";
}

// shortcut: supports scalar and flat list metadata; use a YAML parser if nested metadata becomes contractual.
function frontmatterValues(markdown, key) {
  const match = String(markdown).match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)(?:\r?\n|$)/);
  if (!match) return null;
  const lines = match[1].split(/\r?\n/);
  const clean = (value) => value.trim().replace(/^['"]|['"]$/g, "");
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith(key + ":")) continue;
    const value = lines[i].slice(key.length + 1).trim();
    if (value.startsWith("[") && value.endsWith("]")) return value.slice(1, -1).split(",").map(clean).filter(Boolean);
    if (value) return [clean(value)];
    const values = [];
    for (const line of lines.slice(i + 1)) {
      const item = line.match(/^\s+-\s+(.+)$/);
      if (item) values.push(clean(item[1]));
      else if (line.trim()) break;
    }
    return values;
  }
  return null;
}


function isNavigationPage(record, markdown) {
  return ["wiki_moc", "wiki_index"].includes(frontmatterField(markdown, "type"));
}


function buildMarkdownGraph(vaultRoot) {
  const index = buildMarkdownIndex(vaultRoot);
  const pages = [];
  const pageByPath = new Map();
  const edges = [];
  for (const record of index.records) {
    const markdown = fs.readFileSync(record.absolutePath, "utf8");
    const links = extractMarkdownLinks(markdown);
    const partitioned = {
      ordinaryLinks: unique(links.filter((link) => link.role !== "source").map((link) => link.target)),
      sourceLinks: unique(links.filter((link) => link.role === "source").map((link) => link.target)),
    };
    const page = { record, markdown, links, ...partitioned };
    pages.push(page);
    pageByPath.set(record.absolutePath, page);
    for (const link of links) {
      const resolution = resolveTarget(link.rawText, index, { sourcePath: record.relativePath });
      edges.push({
        sourceFile: record.relativePath,
        line: link.line,
        section: link.section,
        rawText: link.rawText,
        target: link.target,
        resolution: resolution.resolution,
        status: resolution.status,
        role: link.role,
        isEmbed: link.isEmbed,
        targetFile: resolution.match?.relativePath,
        warning: resolution.warning,
      });
    }
  }
  return { index, pages, pageByPath, edges };
}


module.exports = {
  buildMarkdownGraph,
  buildMarkdownIndex,
  caseFold,
  cleanWikiTarget,
  extractMarkdownLinks,
  extractSourceLinks,
  extractWikiLinks,
  frontmatterField,
  frontmatterValues,
  isNavigationPage,
  normalizeWikiTarget,
  partitionPageLinks,
  recordsUnder,
  resolveTarget,
  unique,
  visibleMarkdownLines,
};
