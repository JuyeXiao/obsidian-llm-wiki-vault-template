#!/usr/bin/env python3
# =============================================================================
# validate-vault-write.py - vault write-rule validator (PostToolUse hook, warning-only)
# =============================================================================
# Claude Code PostToolUse hook (matcher: Write|Edit). Checks whether a just-written
# .md file follows this vault's two rule sets. Warning-only: the write is NOT
# reverted (exit 2 feeds the warnings back to Claude so it can fix the note).
#
# Checked zones (everything else passes silently):
#   INBOX/wiki/** (except index.md / log.md) -- per INBOX/schema/wiki-schema.md:
#     1. frontmatter exists
#     2. type is in the wiki_* namespace
#     3. tags contain at least one wiki/<cluster> tag
#     4. body has a "## Sources" section (exempt: cluster indexes with
#        source_count: 0, wiki_conflict, wiki_index)
#   PARA/** and ZETA/** (minus the exemptions below) -- per SYSTEM/TAGS/tag-spec.md:
#     5. the three frontmatter fields tags / keywords / summary are present
#     6. every topic/* tag exists in SYSTEM/TAGS/tag-library.flat.txt
#        (drift early-warning; skipped silently if that file doesn't exist --
#        generate it from tag-library.md to activate this check)
#
# Documented exemptions (a documented exception is law; an undocumented one is rot):
#   - ZETA/FLEETING/**, PARA/WORKSTATION/** (quick-capture zones: speed first,
#     enrichment happens at tagging time)
#   - *.excalidraw.md (visual files, not knowledge notes)
#   - INBOX/raw/** (managed by the tagging/cleaning pipelines, not this hook)
#
# Exit codes: 0 = pass / out of scope (silent); 2 = warnings (stderr fed to Claude)
# =============================================================================
import json
import re
import sys
from pathlib import Path

try:
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass


def parse_frontmatter(text: str):
    """Return (frontmatter_raw, body); (None, text) when there is no frontmatter."""
    if not text.startswith("---"):
        return None, text
    m = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n?(.*)$", text, re.DOTALL)
    if not m:
        return None, text
    return m.group(1), m.group(2)


def field_values(fm: str, key: str):
    """Values of a frontmatter key: inline array / scalar / multi-line list.
    None when the key is absent; [] when present but empty."""
    lines = fm.splitlines()
    for i, line in enumerate(lines):
        m = re.match(rf"^{key}:\s*(.*)$", line)
        if not m:
            continue
        rest = m.group(1).strip()
        if rest.startswith("["):  # inline array
            inner = rest.strip("[]")
            return [v.strip().strip("'\"") for v in inner.split(",") if v.strip()]
        if rest:  # scalar
            return [rest.strip().strip("'\"")]
        vals = []  # multi-line list
        for nxt in lines[i + 1:]:
            mm = re.match(r"^\s+-\s+(.*)$", nxt)
            if mm:
                vals.append(mm.group(1).strip().strip("'\""))
            elif nxt.strip() == "":
                continue
            else:
                break
        return vals
    return None


def main():
    try:
        # Force UTF-8 on stdin (Windows defaults to a legacy codepage, which
        # garbles non-ASCII paths and silently skips validation)
        payload = json.loads(sys.stdin.buffer.read().decode("utf-8", errors="replace"))
    except Exception:
        return 0
    fp = (payload.get("tool_input") or {}).get("file_path") or ""
    if not fp or not fp.endswith(".md") or fp.endswith(".excalidraw.md"):
        return 0

    vault = Path.cwd()
    try:
        rel = Path(fp).resolve().relative_to(vault.resolve())
    except ValueError:
        return 0  # outside the vault
    path = vault / rel
    if not path.is_file():
        return 0
    parts = rel.parts
    rp = rel.as_posix()

    in_wiki = rp.startswith("INBOX/wiki/") and rp not in (
        "INBOX/wiki/index.md",
        "INBOX/wiki/log.md",
    )
    in_para_zeta = parts[0] in ("PARA", "ZETA") and not (
        rp.startswith("ZETA/FLEETING/") or rp.startswith("PARA/WORKSTATION/")
    )
    if not (in_wiki or in_para_zeta):
        return 0

    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return 0

    name = rel.name
    warns = []
    fm, body = parse_frontmatter(text)
    if fm is None:
        warns.append(f"{name} has no frontmatter (--- block)")

    if in_wiki and fm is not None:
        types = field_values(fm, "type") or []
        wtype = types[0] if types else ""
        if not wtype.startswith("wiki_"):
            warns.append(f"{name} type should use the wiki_* namespace (currently '{wtype or 'missing'}'), see wiki-schema section 2")
        tags = field_values(fm, "tags") or []
        if not any(t.startswith("wiki/") for t in tags):
            warns.append(f"{name} tags are missing a wiki/<cluster> tag, see wiki-schema section 2")
        sc = field_values(fm, "source_count")
        exempt = (sc and sc[0] == "0") or wtype in ("wiki_conflict", "wiki_index")
        if not exempt and not re.search(r"^##\s+Sources\s*$", body, re.MULTILINE):
            warns.append(f"{name} body is missing a '## Sources' backlink section (wiki-schema linking rule; cluster indexes / conflict pages are exempt)")

    if in_para_zeta and fm is not None:
        for key in ("tags", "keywords", "summary"):
            vals = field_values(fm, key)
            if vals is None or vals == []:
                warns.append(f"{name} frontmatter is missing {key} (the three tagging fields, see SYSTEM/TAGS/tag-spec.md)")
        # topic tag drift early-warning (active only when the flat tag list exists)
        taglist = vault / "SYSTEM" / "TAGS" / "tag-library.flat.txt"
        tags = field_values(fm, "tags") or []
        topic_tags = [t for t in tags if t.startswith("topic/")]
        if topic_tags and taglist.is_file():
            known = set(
                ln.strip() for ln in taglist.read_text(encoding="utf-8", errors="replace").splitlines() if ln.strip()
            )
            for t in topic_tags:
                if t not in known:
                    warns.append(f"{name} tag '{t}' is not in the tag library (drift) -- new tags must be written back to tag-library.md")

    if warns:
        print("Vault write-rule warnings (warning-only, the write was NOT reverted):", file=sys.stderr)
        for w in warns:
            print(f"  - {w}", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
