#!/usr/bin/env bash
# Generate the flat tag list `SYSTEM/TAGS/tag-library.flat.txt` from the single
# source of truth `SYSTEM/TAGS/tag-library.md` (used by tag-lint.sh for drift
# checks, and by the write-guard hook for its topic-tag early warning).
# Reads tag-library.md, writes tag-library.flat.txt, touches nothing else.
# Usage (at the vault root):
#   bash .claude/skills/tag-lint/scripts/build-taglist.sh
#
# Parsing rule: a tag is any full path written either **bold** or in `backticks`,
# under the `topic/` or `task/` namespace, with at least one segment after the
# root. Bare roots (`topic/`, `task/`) and prose mentions are ignored by design.
set -u
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)" || exit 1

LIB="SYSTEM/TAGS/tag-library.md"
OUT="SYSTEM/TAGS/tag-library.flat.txt"
[ -f "$LIB" ] || { echo "✗ source of truth not found: $LIB"; exit 1; }

# Take only the tag sections (skip the intro prose, which mentions `topic/` too).
LC_ALL=C awk '/^## (topic|task)\//{intree=1} intree' "$LIB" \
  | grep -oE '(\*\*|`)(topic|task)/[a-z0-9][a-z0-9/-]*(\*\*|`)' \
  | sed -E 's/^(\*\*|`)//; s/(\*\*|`)$//' \
  | LC_ALL=C sort -u > "$OUT"

echo "✓ wrote $OUT: $(wc -l < "$OUT") tags"
