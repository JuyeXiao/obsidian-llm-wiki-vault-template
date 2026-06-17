#!/usr/bin/env bash
# LLM Wiki health-check script (deterministic checks, read-only, never modifies raw/wiki).
# Usage: run at the vault root
#   bash .claude/skills/wiki-lint/scripts/wiki-lint.sh          # whole vault
#   bash .claude/skills/wiki-lint/scripts/wiki-lint.sh Career    # one cluster only (INBOX/wiki/Career/)
# Reports each item; an item with no ✗/•/⚠ below it passes.
set -u
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)" || exit 1

WIKI="INBOX/wiki"
RAW="INBOX/raw"
CLUSTER="${1:-}"

if [ -n "$CLUSTER" ]; then
  SCOPE="$WIKI/$CLUSTER"
  [ -d "$SCOPE" ] || { echo "✗ cluster folder not found: $SCOPE"; exit 1; }
else
  SCOPE="$WIKI"
fi

echo "════════ LLM Wiki health check (scope: $SCOPE) ════════"

# 1) Broken links: does every [[target]] (minus |alias / #anchor) in a wiki page have a same-named .md anywhere in the vault?
echo ""
echo "── 1) Broken links: page [[link]] does not resolve ──"
grep -rhoE '\[\[[^]|#]+' "$SCOPE" --include="*.md" --exclude=log.md 2>/dev/null \
  | sed -E 's/^\[\[//' | sort -u \
  | while IFS= read -r name; do
      [ -z "$name" ] && continue
      [ -z "$(find . -name "${name}.md" -print -quit 2>/dev/null)" ] && echo "  ✗ unresolved: [[$name]]"
    done
echo "  (no ✗ = 0 broken links)"

# 2) Orphan raw: a raw source not [[referenced]] by any wiki page (whitelist: Books = personal book index, by design not ingested)
echo ""
echo "── 2) Orphan raw sources: not referenced by any wiki page ──"
find "$RAW" -name "*.md" 2>/dev/null | while IFS= read -r f; do
  base=$(basename "$f" .md)
  case "$base" in Books) continue ;; esac
  grep -rqF "[[$base]]" "$WIKI" 2>/dev/null || echo "  • $base"
done
echo "  (whitelist skipped: Books)"

# 3) Page-name uniqueness: a wiki page basename should appear exactly once vault-wide (collisions with PARA/ZETA or each other break by-name linking)
echo ""
echo "── 3) Page-name collisions: with PARA/ZETA or each other ──"
find "$SCOPE" -name "*.md" ! -name "index.md" ! -name "log.md" 2>/dev/null | while IFS= read -r f; do
  base=$(basename "$f" .md)
  n=$(find . -name "$base.md" 2>/dev/null | wc -l)
  [ "$n" -ne 1 ] && echo "  ✗ collision($n): $base"
done
echo "  (no ✗ = page names unique vault-wide)"

# 4) Source resolution: do the plain - [[X]] lines in the ## Sources section resolve to raw (guarantees traceability)?
#    --exclude cluster-index MOCs (<cluster> Index.md): they use links for navigation, not as sources, so we don't misjudge page links as broken sources.
echo ""
echo "── 4) ## Sources links not resolving to raw ──"
grep -rhoE '^- \[\[[^]]+\]\]$' "$SCOPE" --include="*.md" --exclude='* Index.md' 2>/dev/null \
  | sed -E 's/^- \[\[//; s/\]\]$//' | sort -u \
  | while IFS= read -r name; do
      [ -z "$(find "$RAW" -name "${name}.md" -print -quit 2>/dev/null)" ] && echo "  ✗ source not in raw: [[$name]]"
    done
echo "  (no ✗ = all sources traceable)"

# 5) Tag hygiene: trailing-quote pollution in raw frontmatter tags (e.g. an unpaired trailing quote inside [topic/x, topic/y/data"]).
#    Matches only "a topic tag not preceded by \" that ends with \"" — i.e. an illegal stray trailing quote; a valid "topic/..." closing quote is excluded by the leading [^"]. Report only (raw is read-only).
echo ""
echo "── 5) raw tag trailing-quote pollution (report only; raw is read-only) ──"
grep -rhoE '[^"]topic/[^]",[:space:]]*"' "$RAW" --include="*.md" 2>/dev/null | sort -u | sed 's/^/  ⚠ /'
echo "  (no ⚠ = no trailing-quote pollution)"

echo ""
echo "════════ Health check complete (no ✗ = all green; • = orphan awaiting merge) ════════"
