"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");

const {
  buildMarkdownGraph,
  caseFold,
  frontmatterField,
  recordsUnder,
  resolveTarget,
} = require("./wiki-graph.js");


const SCHEMA_VERSION = 1;
const DISPOSITIONS = [
  "ingest_existing",
  "ingest_new",
  "archive_only",
  "by_design_skip",
  "defer",
];
const INGEST_DISPOSITIONS = new Set(["ingest_existing", "ingest_new"]);
const IMPLEMENTATION_STATES = [
  "satisfied",
  "pending",
  "blocked",
  "conflict",
  "review_due",
  "stale",
  "legacy_ingested",
];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const HASH_PATTERN = /^[0-9a-f]{64}$/i;

function isRawSource(record) {
  return record.relativePath !== "INBOX/raw/README.md";
}


function normalizePath(value) {
  return String(value ?? "").replaceAll("\\", "/").replace(/^\.\//, "").normalize("NFC");
}


function isDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const parsed = new Date(value + "T00:00:00Z");
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}


function todayString(value) {
  if (value) return value;
  const now = new Date();
  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");
}


function extractBody(markdown) {
  const text = String(markdown);
  const frontmatter = text.match(/^\uFEFF?---\r?\n[\s\S]*?\r?\n(?:---|\.\.\.)(?:\r?\n|$)/);
  return frontmatter ? text.slice(frontmatter[0].length) : text;
}


function bodySha256(markdown) {
  // CRLF checkout conversions must not invalidate an unchanged source decision.
  return crypto.createHash("sha256").update(extractBody(markdown).replace(/\r\n/g, "\n"), "utf8").digest("hex");
}


function policyList(policies) {
  if (Array.isArray(policies)) return policies;
  if (policies && Array.isArray(policies.policies)) return policies.policies;
  return [];
}


function decisionList(registry) {
  if (registry && Array.isArray(registry.decisions)) return registry.decisions;
  return [];
}


function validatePolicies(policies) {
  const errors = [];
  const list = policies && policies.policies;
  if (!policies || typeof policies !== "object" || Array.isArray(policies)) {
    return { errors: ["policy document must be an object"], warnings: [] };
  }
  if (policies.schema_version !== SCHEMA_VERSION) {
    errors.push("unsupported policy schema_version: " + policies.schema_version);
  }
  if (!Array.isArray(list)) {
    errors.push("policies must be an array");
    return { errors, warnings: [] };
  }
  const ids = new Set();
  for (let index = 0; index < list.length; index += 1) {
    const policy = list[index];
    const label = "policies[" + index + "]";
    if (!policy || typeof policy !== "object" || Array.isArray(policy)) {
      errors.push(label + " must be an object");
      continue;
    }
    if (typeof policy.id !== "string" || !policy.id.trim()) {
      errors.push(label + ".id is required");
    } else if (ids.has(policy.id)) {
      errors.push(label + ".id is duplicated: " + policy.id);
    } else {
      ids.add(policy.id);
    }
    const match = policy.match;
    if (!match || typeof match !== "object") {
      errors.push(label + ".match is required");
    } else {
      const prefix = normalizePath(match.path_prefix);
      if (!prefix || prefix.split("/").some((part) => part === ".." || part === ".") || !(caseFold(prefix) === "inbox/raw" || caseFold(prefix).startsWith("inbox/raw/"))) {
        errors.push(label + ".match.path_prefix must be under INBOX/raw/");
      }
      if (typeof match.type !== "string" || !match.type.trim()) {
        errors.push(label + ".match.type is required");
      }
    }
    if (!DISPOSITIONS.includes(policy.default_disposition)) {
      errors.push(label + ".default_disposition is invalid");
    }
    if (typeof policy.reason_code !== "string" || !/^[a-z0-9_]+$/.test(policy.reason_code)) {
      errors.push(label + ".reason_code must be a lower snake-case code");
    }
    if (typeof policy.allow_explicit_override !== "boolean") {
      errors.push(label + ".allow_explicit_override must be boolean");
    }
    if (["ingest_existing", "ingest_new", "defer"].includes(policy.default_disposition)) {
      errors.push(label + ".default_disposition requires a per-source decision with targets or review conditions");
    }
  }
  return { errors, warnings: [] };
}


function findRecordByPath(index, value) {
  const normalized = normalizePath(value);
  return index?.records.find((record) => record.normalizedRelativePath === normalized) || null;
}


function findFoldedRecords(index, value) {
  const folded = caseFold(normalizePath(value));
  return (index?.records || []).filter((record) => record.foldedRelativePath === folded);
}


function validateTargetPath(target, index, label, errors) {
  if (typeof target !== "string" || !target.trim()) {
    errors.push(label + " must be a non-empty string");
    return;
  }
  const normalized = normalizePath(target);
  if (!(caseFold(normalized) === "inbox/wiki" || caseFold(normalized).startsWith("inbox/wiki/"))) {
    errors.push(label + " must be under INBOX/wiki/");
    return;
  }
  if (!normalized.toLowerCase().endsWith(".md")) {
    errors.push(label + " must end with .md");
    return;
  }
  if (index && !findRecordByPath(index, normalized)) {
    const folded = findFoldedRecords(index, normalized);
    errors.push(
      label + (folded.length ? " has a case/Unicode mismatch" : " does not exist") + ": " + target,
    );
  }
}


function validateRegistry(registry, context = {}) {
  const errors = [];
  const warnings = [];
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    return { errors: ["registry document must be an object"], warnings: [] };
  }
  if (registry.schema_version !== SCHEMA_VERSION) {
    errors.push("unsupported registry schema_version: " + registry.schema_version);
  }
  if (!Array.isArray(registry.decisions)) {
    errors.push("decisions must be an array");
    return { errors, warnings };
  }

  const index = context.index;
  const policies = policyList(context.policies);
  const policyIds = new Set(policies.map((policy) => policy && policy.id).filter(Boolean));
  const paths = new Set();
  let previousPath = null;
  for (let indexNumber = 0; indexNumber < registry.decisions.length; indexNumber += 1) {
    const decision = registry.decisions[indexNumber];
    const label = "decisions[" + indexNumber + "]";
    if (!decision || typeof decision !== "object" || Array.isArray(decision)) {
      errors.push(label + " must be an object");
      continue;
    }
    if (Object.hasOwn(decision, "implementation_state") || Object.hasOwn(decision, "state")) {
      errors.push(label + ": implementation state is derived, never stored in a decision");
    }
    const rawPath = normalizePath(decision.raw_path);
    if (typeof decision.raw_path !== "string" || !rawPath) {
      errors.push(label + ".raw_path is required");
    } else {
      if (caseFold(rawPath) !== "inbox/raw" && !caseFold(rawPath).startsWith("inbox/raw/")) {
        errors.push(label + ".raw_path must be under INBOX/raw/");
      }
      if (!rawPath.toLowerCase().endsWith(".md")) {
        errors.push(label + ".raw_path must end with .md");
      }
      if (!isRawSource({ relativePath: rawPath })) errors.push(label + ".raw_path is documentation, not a source");
      const key = caseFold(rawPath);
      if (paths.has(key)) errors.push(label + ".raw_path is duplicated: " + rawPath);
      paths.add(key);
      if (previousPath !== null && previousPath > rawPath) {
        errors.push("decisions must be sorted by raw_path");
      }
      previousPath = rawPath;
      if (index && !findRecordByPath(index, rawPath)) {
        const folded = findFoldedRecords(index, rawPath);
        errors.push(
          label + ".raw_path " + (folded.length ? "has a case/Unicode mismatch" : "does not exist") + ": " + rawPath,
        );
      }
    }

    if (!DISPOSITIONS.includes(decision.disposition)) {
      errors.push(label + ".disposition is invalid");
    }
    const isIngest = INGEST_DISPOSITIONS.has(decision.disposition);
    if (isIngest) {
      if (!Array.isArray(decision.target_wiki) || decision.target_wiki.length === 0) {
        errors.push(label + ".target_wiki is required for ingest disposition");
      } else {
        for (let targetIndex = 0; targetIndex < decision.target_wiki.length; targetIndex += 1) {
          validateTargetPath(
            decision.target_wiki[targetIndex],
            index,
            label + ".target_wiki[" + targetIndex + "]",
            errors,
          );
        }
      }
    } else if (decision.target_wiki !== undefined && decision.target_wiki !== null) {
      if (!Array.isArray(decision.target_wiki) || decision.target_wiki.length > 0) {
        errors.push(label + ".target_wiki is only allowed for ingest disposition");
      }
    }

    if (typeof decision.reason_code !== "string" || !/^[a-z0-9_]+$/.test(decision.reason_code)) {
      errors.push(label + ".reason_code must be a lower snake-case code");
    }
    if (typeof decision.reason !== "string" || !decision.reason.trim()) {
      errors.push(label + ".reason is required");
    }
    if (!["high", "medium", "low"].includes(decision.confidence)) {
      errors.push(label + ".confidence is invalid");
    }
    if (!isDate(decision.decided_at)) errors.push(label + ".decided_at must be YYYY-MM-DD");
    if (decision.review_after !== null && decision.review_after !== undefined && !isDate(decision.review_after)) {
      errors.push(label + ".review_after must be null or YYYY-MM-DD");
    }
    if (!Array.isArray(decision.revisit_on)) {
      errors.push(label + ".revisit_on must be an array");
    }
    if (Array.isArray(decision.revisit_on) && decision.revisit_on.some((value) => typeof value !== "string" || !value.trim())) {
      errors.push(label + ".revisit_on entries must be non-empty strings");
    }
    if (
      decision.disposition === "defer"
      && !isDate(decision.review_after)
      && (!Array.isArray(decision.revisit_on) || decision.revisit_on.length === 0)
    ) {
      errors.push(label + ".defer requires review_after or revisit_on");
    }
    if (typeof decision.raw_body_sha256 !== "string" || !HASH_PATTERN.test(decision.raw_body_sha256)) {
      errors.push(label + ".raw_body_sha256 must be a 64-character hex digest");
    }
    if (decision.overrides_policy !== null && decision.overrides_policy !== undefined) {
      if (typeof decision.overrides_policy !== "string" || !decision.overrides_policy.trim()) {
        errors.push(label + ".overrides_policy must be null or a policy id");
      } else if (!policyIds.has(decision.overrides_policy)) {
        errors.push(label + ".overrides_policy references an unknown policy");
      }
    }
  }
  return { errors, warnings };
}


function matchPolicy(raw, policies) {
  const rawPath = normalizePath(raw?.raw_path);
  const rawType = raw?.type;
  if (!rawPath || typeof rawType !== "string" || !rawType) return null;
  const foldedRawPath = caseFold(rawPath);
  for (const policy of policyList(policies)) {
    const match = policy?.match;
    if (!match || typeof match.path_prefix !== "string" || typeof match.type !== "string") continue;
    const prefix = caseFold(normalizePath(match.path_prefix));
    const pathMatches = foldedRawPath === prefix
      || foldedRawPath.startsWith(prefix.endsWith("/") ? prefix : prefix + "/");
    if (pathMatches && rawType === match.type) return policy;
  }
  return null;
}


function buildCitationIndex(graph) {
  const citations = new Map();
  if (!graph || !graph.index || !Array.isArray(graph.pages)) return citations;
  for (const page of graph.pages) {
    if (!caseFold(page.record.relativePath).startsWith("inbox/wiki/")) continue;
    for (const target of page.sourceLinks) {
      if (["wiki_moc", "wiki_index"].includes(frontmatterField(page.markdown, "type"))) continue;
      const resolution = resolveTarget(target, graph.index, { under: "INBOX/raw", sourcePath: page.record.relativePath });
      if (resolution.status !== "resolved" || !isRawSource(resolution.match)) continue;
      const global = resolveTarget(target, graph.index, { sourcePath: page.record.relativePath });
      if (global.status !== "resolved" || global.match.relativePath !== resolution.match.relativePath) continue;
      const rawPath = resolution.match.relativePath;
      const key = caseFold(rawPath);
      if (!citations.has(key)) citations.set(key, new Set());
      citations.get(key).add(page.record.relativePath);
    }
  }
  return citations;
}


function targetExists(decision, index) {
  if (!decision || !INGEST_DISPOSITIONS.has(decision.disposition)) return true;
  if (!Array.isArray(decision.target_wiki) || decision.target_wiki.length === 0) return false;
  return decision.target_wiki.every((target) => Boolean(findRecordByPath(index, target)));
}


function isReviewDue(decision, today, revisitTriggers) {
  if (!decision || decision.disposition !== "defer") return false;
  if (isDate(decision.review_after) && decision.review_after <= today) return true;
  const triggers = new Set(Array.isArray(revisitTriggers) ? revisitTriggers : []);
  return Array.isArray(decision.revisit_on) && decision.revisit_on.some((trigger) => triggers.has(trigger));
}


function deriveImplementationState(input = {}) {
  const raw = input.raw || {};
  const decision = input.decision || null;
  const policy = input.policy || null;
  const citations = [...new Set(input.citations || [])];
  const today = todayString(input.today);
  const policyDisposition = policy?.default_disposition || null;
  const decisionDisposition = decision?.disposition || null;
  const disposition = decisionDisposition || policyDisposition || null;
  const result = (state, reason) => ({
    state,
    disposition,
    policy_id: policy?.id || null,
    citations,
    reason,
  });

  if (
    decision
    && typeof decision.raw_body_sha256 === "string"
    && typeof raw.body_sha256 === "string"
    && decision.raw_body_sha256 !== raw.body_sha256
  ) {
    return result("stale", "raw body hash changed");
  }
  if (decision && policy && decisionDisposition !== policyDisposition && !policy.allow_explicit_override) {
    return result("conflict", "policy forbids an explicit override");
  }
  if (
    decision
    && policy
    && decisionDisposition !== policyDisposition
    && decision.overrides_policy !== policy.id
  ) {
    return result("conflict", "decision differs from policy without explicit override");
  }
  if (decision && INGEST_DISPOSITIONS.has(decisionDisposition) && input.targetExists === false) {
    return result("blocked", "ingest target does not exist");
  }

  if (citations.length > 0) {
    if (!decision && !policy) return result("legacy_ingested", "citation exists without registry decision");
    if (INGEST_DISPOSITIONS.has(disposition)) {
      const targets = new Set((decision?.target_wiki || []).map((target) => normalizePath(target)));
      const cited = new Set(citations.map((target) => normalizePath(target)));
      const targetsAllCited = [...targets].every((target) => cited.has(target));
      const citationsAllTargeted = [...cited].every((target) => targets.has(target));
      if (targetsAllCited && citationsAllTargeted) {
        return result("satisfied", "ingest citation matches target");
      }
      return result(
        citationsAllTargeted ? "blocked" : "conflict",
        citationsAllTargeted ? "ingest target is not fully cited" : "citation is outside ingest target",
      );
    }
    return result("conflict", "non-ingest disposition has a citation");
  }

  if (INGEST_DISPOSITIONS.has(disposition)) {
    return result("blocked", "ingest disposition has no citation");
  }
  if (decision?.disposition === "defer" && isReviewDue(decision, today, input.revisitTriggers)) {
    return result("review_due", "defer review date or trigger is due");
  }
  if (decision || policy) {
    return result("satisfied", "non-ingest disposition is effective");
  }
  return result("pending", "no decision or matching policy");
}


function evaluateStates(vaultRoot, graph, registry, policies, options = {}) {
  const actualGraph = graph || buildMarkdownGraph(vaultRoot);
  const index = actualGraph.index;
  const policyDocument = policies;
  const registryDocument = registry;
  const policyValidation = validatePolicies(policyDocument);
  const registryValidation = validateRegistry(registryDocument, {
    index,
    policies: policyDocument,
  });
  const decisionMap = new Map();
  for (const decision of decisionList(registryDocument)) {
    if (typeof decision?.raw_path === "string") {
      decisionMap.set(caseFold(normalizePath(decision.raw_path)), decision);
    }
  }
  const citations = buildCitationIndex(actualGraph);
  const sources = [];
  const rawRecords = recordsUnder(index, "INBOX/raw").filter(isRawSource);
  for (const record of rawRecords) {
    const markdown = fs.readFileSync(record.absolutePath, "utf8");
    const raw = {
      raw_path: record.relativePath,
      type: frontmatterField(markdown, "type") || null,
      body_sha256: bodySha256(markdown),
    };
    const decision = decisionMap.get(record.foldedRelativePath) || null;
    const policy = matchPolicy(raw, policyDocument);
    const citedWiki = [...(citations.get(record.foldedRelativePath) || new Set())]
      .sort((left, right) => left.localeCompare(right));
    const state = deriveImplementationState({
      raw,
      decision,
      policy,
      citations: citedWiki,
      targetExists: targetExists(decision, index),
      today: options.today,
      revisitTriggers: options.revisitTriggers,
    });
    sources.push({
      raw_path: raw.raw_path,
      type: raw.type,
      body_sha256: raw.body_sha256,
      cited_wiki: citedWiki,
      citation_count: citedWiki.length,
      disposition: state.disposition,
      policy_id: state.policy_id,
      implementation_state: state.state,
      state_reason: state.reason,
    });
  }

  const summary = {
    raw_total: sources.length,
    referenced_raw: sources.filter((source) => source.citation_count > 0).length,
    unreferenced_raw: sources.filter((source) => source.citation_count === 0).length,
    ingest_existing: 0,
    ingest_new: 0,
    archive_only: 0,
    by_design_skip: 0,
    defer_active: 0,
    defer_due: 0,
    pending: 0,
    blocked: 0,
    conflict: 0,
    stale: 0,
    legacy_ingested: 0,
    remaining_orphan: 0,
  };
  for (const source of sources) {
    if (source.disposition === "defer") {
      if (source.implementation_state === "review_due") summary.defer_due += 1;
      else summary.defer_active += 1;
    } else if (Object.hasOwn(summary, source.disposition)) {
      summary[source.disposition] += 1;
    }
    if (Object.hasOwn(summary, source.implementation_state)) summary[source.implementation_state] += 1;
    if (["pending", "blocked", "conflict", "review_due", "stale"].includes(source.implementation_state)) {
      summary.remaining_orphan += 1;
    }
  }
  const decisionSummary = { total: decisionList(registryDocument).length, by_disposition: {} };
  for (const decision of decisionList(registryDocument)) {
    if (!decision || !decision.disposition) continue;
    decisionSummary.by_disposition[decision.disposition] = (decisionSummary.by_disposition[decision.disposition] || 0) + 1;
  }
  return {
    schema_version: SCHEMA_VERSION,
    sources,
    summary,
    decision_summary: decisionSummary,
    errors: [...policyValidation.errors, ...registryValidation.errors],
    warnings: [...policyValidation.warnings, ...registryValidation.warnings],
    citations,
  };
}


module.exports = {
  DISPOSITIONS,
  IMPLEMENTATION_STATES,
  SCHEMA_VERSION,
  bodySha256,
  buildCitationIndex,
  deriveImplementationState,
  evaluateStates,
  extractBody,
  matchPolicy,
  validatePolicies,
  validateRegistry,
  isRawSource,
  isDate,
};
