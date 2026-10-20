"use strict";

const {
  frontmatterField,
  frontmatterValues,
  visibleMarkdownLines,
  resolveTarget,
} = require("./wiki-graph.js");
const { isRawSource } = require("./wiki-state.js");


const WIKI_TYPES = new Set([
  "wiki_moc",
  "wiki_overview",
  "wiki_summary",
  "wiki_concept",
  "wiki_entity",
  "wiki_conflict",
  "wiki_index",
]);
const CONTENT_TYPES = new Set([
  "wiki_overview",
  "wiki_summary",
  "wiki_concept",
  "wiki_entity",
  "wiki_conflict",
]);
const NORMAL_STATUSES = new Set(["draft", "stable"]);
const CONFLICT_STATUSES = new Set(["open", "resolved"]);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;


function isDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}


function sourceHeadingCount(markdown) {
  let count = 0;
  for (const { line } of visibleMarkdownLines(markdown)) {
    if (/^\s{0,3}##\s+Sources\s*(?:#+\s*)?$/.test(line)) count += 1;
  }
  return count;
}


function parsedSourceCount(markdown) {
  const value = frontmatterField(markdown, "source_count");
  return /^\d+$/.test(value) ? Number(value) : null;
}


function hasPrimaryTag(tags, category) {
  return (tags || []).includes("wiki/" + category);
}


function resolvedSourcePaths(page, index, errors) {
  const paths = new Set();
  for (const target of page.sourceLinks) {
    const resolution = resolveTarget(target, index, { under: "INBOX/raw", sourcePath: page.record.relativePath });
    const global = resolveTarget(target, index, { sourcePath: page.record.relativePath });
    if (resolution.status === "resolved") {
      if (!isRawSource(resolution.match)) {
        errors.push("Raw documentation is not source evidence: " + resolution.match.relativePath);
      } else if (global.status !== "resolved" || global.match.relativePath !== resolution.match.relativePath) {
        errors.push("Source is ambiguous across the vault: [[" + target + "]] (" + page.record.relativePath + ")");
      } else paths.add(resolution.match.relativePath);
      continue;
    }
    if (resolution.status === "ambiguous") {
      errors.push(
        "Ambiguous raw source: [[" + target + "]] (" + page.record.relativePath + ")",
      );
    } else {
      errors.push(
        "Unresolved raw source: [[" + target + "]] (" + page.record.relativePath + ")",
      );
    }
  }
  return [...paths].sort((left, right) => left.localeCompare(right));
}


function validateMetadata(page, type, errors) {
  const record = page.record;
  const title = frontmatterField(page.markdown, "title");
  const category = frontmatterField(page.markdown, "category");
  const tags = frontmatterValues(page.markdown, "tags");
  const parts = record.relativePath.split("/");
  const expectedCategory = parts[2] || "";

  if (!title || title !== record.basename) {
    errors.push(
      "title does not match filename: " + record.relativePath
        + " (title=" + (title || "<missing>") + ")",
    );
  }
  if (!category || category !== expectedCategory) {
    errors.push(
      "category does not match cluster folder: " + record.relativePath
        + " (category=" + (category || "<missing>") + ")",
    );
  }
  if (!hasPrimaryTag(tags, expectedCategory)) {
    errors.push("Missing primary cluster tag wiki/" + expectedCategory + ": " + record.relativePath);
  }

  const created = frontmatterField(page.markdown, "created");
  const updated = frontmatterField(page.markdown, "updated");
  if (!isDate(created) || !isDate(updated) || created > updated) {
    errors.push("Invalid or inverted created/updated dates: " + record.relativePath);
  }

  const status = frontmatterField(page.markdown, "status");
  const allowedStatuses = type === "wiki_conflict" ? CONFLICT_STATUSES : NORMAL_STATUSES;
  if (!allowedStatuses.has(status)) {
    errors.push("Invalid status for " + type + " contract: " + record.relativePath);
  }
}


function validateWikiContracts(graph) {
  const errors = [];
  const warnings = [];
  const byType = {};
  let sourceParityFailures = 0;
  const pages = (graph?.pages || []).filter((page) => {
    const relativePath = page.record.relativePath.toLowerCase();
    return relativePath === "inbox/wiki" || relativePath.startsWith("inbox/wiki/");
  });

  for (const page of pages) {
    const record = page.record;
    const type = frontmatterField(page.markdown, "type");
    byType[type || "(missing)"] = (byType[type || "(missing)"] || 0) + 1;
    if (!WIKI_TYPES.has(type)) {
      errors.push("Unknown or missing Wiki type: " + record.relativePath);
      continue;
    }

    const isIndex = type === "wiki_index";
    const isMoc = type === "wiki_moc";
    const sourceHeadings = sourceHeadingCount(page.markdown);
    const sourceCount = parsedSourceCount(page.markdown);
    const resolvedSources = resolvedSourcePaths(page, graph.index, errors);

    if (isIndex) {
      if (!["INBOX/wiki/index.md", "INBOX/wiki/log.md"].includes(record.relativePath)) {
        errors.push("wiki_index is reserved for index.md/log.md: " + record.relativePath);
      }
      if (sourceCount !== null && sourceCount !== 0) {
        errors.push("wiki_index source_count must be 0: " + record.relativePath);
      }
      if (sourceHeadings !== 0 || page.sourceLinks.length !== 0) {
        errors.push("wiki_index must not carry a Sources section: " + record.relativePath);
      }
      continue;
    }

    validateMetadata(page, type, errors);
    if (sourceCount === null) {
      errors.push("source_count is missing or not a nonnegative integer: " + record.relativePath);
    }
    if (isMoc) {
      if (sourceCount !== 0) {
        errors.push("wiki_moc source_count must be 0: " + record.relativePath);
      }
      if (sourceHeadings !== 0 || resolvedSources.length !== 0) {
        errors.push("wiki_moc must not carry raw sources: " + record.relativePath);
      }
      continue;
    }

    if (sourceHeadings !== 1) {
      errors.push(
        type + " requires exactly one ## Sources: " + record.relativePath,
      );
    }
    if (sourceCount === 0) {
      errors.push("source_count: 0 is reserved for wiki_moc/wiki_index: " + record.relativePath);
    }
    if (sourceCount !== null && sourceCount !== resolvedSources.length) {
      sourceParityFailures += 1;
      errors.push(
        "source_count differs from actual explicit raw sources: " + record.relativePath
          + " (frontmatter=" + sourceCount + "; actual=" + resolvedSources.length + ")",
      );
    }
    if (type === "wiki_overview" && sourceCount !== null && sourceCount <= 0) {
      errors.push("wiki_overview requires raw sources: " + record.relativePath);
    }
    if (type === "wiki_summary" && sourceCount !== null && sourceCount !== 1) {
      errors.push("wiki_summary requires exactly 1 raw source: " + record.relativePath);
    }
    if (["wiki_concept", "wiki_entity"].includes(type) && sourceCount !== null && sourceCount < 1) {
      errors.push(type + " requires at least 1 raw source: " + record.relativePath);
    }
    if (type === "wiki_conflict" && sourceCount !== null && sourceCount < 2) {
      errors.push("wiki_conflict requires at least 2 raw sources: " + record.relativePath);
    }
  }

  return {
    errors,
    warnings,
    summary: {
      page_count: pages.length,
      by_type: byType,
      source_parity_failures: sourceParityFailures,
    },
  };
}


module.exports = {
  validateWikiContracts,
  sourceHeadingCount,
  resolvedSourcePaths,
};
