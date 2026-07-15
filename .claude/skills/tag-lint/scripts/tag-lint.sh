#!/usr/bin/env bash
# Tagging-system health check (deterministic checks, read-only, never modifies any file).
# Usage (at the vault root):
#   bash .claude/skills/tag-lint/scripts/tag-lint.sh                  # default scope: PARA + ZETA + INBOX/raw
#   bash .claude/skills/tag-lint/scripts/tag-lint.sh PARA/AREAS       # explicit scope
# Source of truth = SYSTEM/TAGS/tag-library.md (the flat list is rebuilt on every run).
# Reports each item; an item with no ✗ passes.
set -u
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)" || exit 1

SCRIPT_DIR=".claude/skills/tag-lint/scripts"
FLAT="SYSTEM/TAGS/tag-library.flat.txt"

# 0) Rebuild the flat list from the source of truth, so drift is always checked
#    against the current vocabulary (this also feeds the write-guard hook).
bash "$SCRIPT_DIR/build-taglist.sh" >/dev/null 2>&1 || { echo "✗ build-taglist failed"; exit 1; }

if [ "$#" -ge 1 ]; then SCOPE=("$@"); else SCOPE=(PARA ZETA "INBOX/raw"); fi
RX="(topic|task|area|project|wiki)/[^]\"',[:space:]]*"

# Take tags only from the frontmatter `tags:` field (both inline [a, b] and block
# `- a` lists); never scan the body. Otherwise directory trees in code fences
# (e.g. `project/`) and URLs in quotes get flagged as malformed/drift — and since
# raw bodies are read-only, they must be excluded at the lint side.
fm_tags() {
  find "$@" -name '*.md' -type f -exec awk '
    FNR==1 { fm=0; intags=0 }
    FNR==1 && /^---[[:space:]]*$/ { fm=1; next }
    fm==1 && /^---[[:space:]]*$/  { fm=0; intags=0; next }
    fm==1 && /^tags:/ { intags=1; v=$0; sub(/^tags:[[:space:]]*/,"",v); print v; next }
    fm==1 && intags==1 && /^[[:space:]]*-[[:space:]]*/ { v=$0; sub(/^[[:space:]]*-[[:space:]]*/,"",v); print v; next }
    fm==1 && intags==1 && /^[^[:space:]]/ { intags=0 }
  ' {} + 2>/dev/null
}

echo "════════ Tag health check (scope: ${SCOPE[*]}) ════════"

# DISTINCT: deduplicated token set of all frontmatter tags in scope (frontmatter only, see fm_tags)
DISTINCT=$(fm_tags "${SCOPE[@]}" | grep -oE "#?$RX" | sed 's/^#//' | grep -vE '[#`]' | LC_ALL=C sort -u | sed '/^$/d')
USED_TT=$(printf '%s\n' "$DISTINCT" | grep -E '^(topic|task)/')
MALFORMED=$(printf '%s\n' "$DISTINCT" | grep -E '/$|//|[#`]')

# 1) malformed: trailing slash / empty segment / type written as an array
echo ""; echo "── 1) Malformed tags (trailing slash / empty segment / type as array) ──"
[ -n "$MALFORMED" ] && printf '%s\n' "$MALFORMED" | sed 's/^/  ✗ /'
grep -rlE '^type:[[:space:]]*\[' "${SCOPE[@]}" --include='*.md' 2>/dev/null | sed 's/^/  ✗ type written as array: /'
echo "  (no ✗ = none malformed)"

# 2) drift: topic/task tags in use that are not in the source of truth
#    (malformed ones are already reported above, so they are excluded here)
echo ""; echo "── 2) Unregistered topic/task tags (drift: used but not in tag-library) ──"
DRIFT=$(comm -23 <(printf '%s\n' "$USED_TT" | LC_ALL=C sort -u) <(LC_ALL=C sort -u "$FLAT") \
        | grep -vE '/$|//|[#`]')
if [ -n "$DRIFT" ]; then printf '%s\n' "$DRIFT" | sed 's/^/  ✗ /'; fi
echo "  drift count: $(printf '%s\n' "$DRIFT" | sed '/^$/d' | wc -l)"

# 3) duplicate values within a single note's tags line (one grep+awk pass, no per-file spawn)
echo ""; echo "── 3) Duplicate values within a single note's tags ──"
grep -rn '^tags:' "${SCOPE[@]}" --include='*.md' 2>/dev/null | LC_ALL=C awk '
  { line=$0; delete cnt; out=""
    while (match(line, /(topic|task|area|project|wiki)\/[^]", ]+/)) {
      tok=substr(line,RSTART,RLENGTH); cnt[tok]++
      if(cnt[tok]==2) out=out" "tok
      line=substr(line,RSTART+RLENGTH) }
    if(out!=""){ p=$0; sub(/:.*/,"",p); print "  ✗ " p " :" out } }'
echo "  (no ✗ = no in-note duplicates)"

# 4) stats (info, not a failure)
echo ""; echo "── 4) Stats (info) ──"
N_MD=$(find "${SCOPE[@]}" -name '*.md' 2>/dev/null | wc -l)
HAS_TOPIC=$(grep -rlE 'topic/' "${SCOPE[@]}" --include='*.md' 2>/dev/null | LC_ALL=C sort)
echo "  .md in scope: $N_MD"
echo "  .md missing a topic tag: $(grep -rLE 'topic/' "${SCOPE[@]}" --include='*.md' 2>/dev/null | wc -l)"
echo "  has topic but no keywords: $(comm -12 <(printf '%s\n' "$HAS_TOPIC") <(grep -rLE '^keywords:[[:space:]]*[^[:space:]]' "${SCOPE[@]}" --include='*.md' 2>/dev/null | LC_ALL=C sort) | wc -l)"
echo "  has topic but no summary : $(comm -12 <(printf '%s\n' "$HAS_TOPIC") <(grep -rLE '^summary:[[:space:]]*[^[:space:]]' "${SCOPE[@]}" --include='*.md' 2>/dev/null | LC_ALL=C sort) | wc -l)"
echo "  defined but unused tags: $(comm -13 <(printf '%s\n' "$USED_TT" | LC_ALL=C sort -u) <(LC_ALL=C sort -u "$FLAT") | wc -l)"

echo ""; echo "════════ Done (no ✗ = all green; info is for human judgement) ════════"
