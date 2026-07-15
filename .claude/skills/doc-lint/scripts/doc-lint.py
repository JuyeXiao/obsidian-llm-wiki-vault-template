#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Human-facing docs · consistency check (drift alarm, read-only, modifies nothing).

This vault's human-facing docs (README / CLAUDE.md / SYSTEM/DOCS/*) describe its
structure and features to a reader, and they drift out of sync silently as the
vault evolves. This script freezes the *machine-assertable* invariants into
checks. It only reports; you fix the docs.

Checks (few and strict — only high-value, low-false-positive ones):
  1. Skill registry: every .claude/skills/ directory is registered in CLAUDE.md,
     and every `/command` mentioned there has a matching directory.
  2. Cluster wiring: every INBOX/wiki/<cluster> folder has a route in
     TOPIC_TO_CLUSTER, and TOPIC_TO_CLUSTER / CLUSTER_HUB cover the same clusters
     (they must stay in sync or the wiki_hub field targets a nonexistent page).
  3. Path references: backtick-quoted vault paths in the core docs actually exist.
  4. Bilingual parity: SYSTEM/DOCS/*.md and SYSTEM/DOCS/zh/*.md are the same set
     of files with the same heading structure (this template ships EN + zh; the
     usual drift is editing one and forgetting the other).

Deliberately NOT checked (would be noise here):
  - Cluster *counts*: the template seeds 4 cluster routes but only ships content
    for some — "configured but not yet populated" is a valid state, not drift.
  - Plugins vs community-plugins.json: docs use display names, not plugin ids.
  - Hotkeys: this template ships no hotkey reference table.
  - Semantic drift (is a new feature documented? do two docs contradict?):
    needs judgement — see the SKILL's manual section.

Usage:
    python doc-lint.py          # run every check
Exit code: 0 = all consistent; 1 = drift found (see output).
"""

import re
import sys
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
except AttributeError:
    pass

VAULT = Path(__file__).resolve().parents[4]

SKILLS_DIR = VAULT / ".claude" / "skills"
CLAUDE_MD  = VAULT / "CLAUDE.md"
README     = VAULT / "README.md"
DOCS_EN    = VAULT / "SYSTEM" / "DOCS"
DOCS_ZH    = VAULT / "SYSTEM" / "DOCS" / "zh"
WIKI_DIR   = VAULT / "INBOX" / "wiki"
HELPERS    = VAULT / "SYSTEM" / "SCRIPTS" / "datacore_helpers.md"

# Check 3's scan surface: docs that describe the vault's *current* state.
PATH_SCAN_DOCS = [
    README,
    VAULT / "README.zh-CN.md",
    CLAUDE_MD,
    VAULT / "INBOX" / "schema" / "wiki-schema.md",
    VAULT / "SYSTEM" / "TAGS" / "tag-spec.md",
] + sorted(DOCS_EN.glob("*.md")) + sorted(DOCS_ZH.glob("*.md"))


def read(path):
    return path.read_text(encoding="utf-8")


def list_dirs(path):
    return sorted(p.name for p in path.iterdir() if p.is_dir())


def check_skill_registry():
    try:
        skills = list_dirs(SKILLS_DIR)
        claude = read(CLAUDE_MD)
    except OSError as e:
        return [f"read failed: {e}"]
    problems = []
    # Forward: every skill directory is registered (word-bounded, so /tag does not match /tag-lint)
    for s in skills:
        if not re.search(r"/" + re.escape(s) + r"(?![a-z0-9-])", claude):
            problems.append(f"skill /{s} is not registered in CLAUDE.md")
    # Reverse: every `/command` in CLAUDE.md has a directory
    known = set(skills)
    for cmd in sorted(set(re.findall(r"`/([a-z][a-z0-9-]+)`", claude))):
        if cmd not in known:
            problems.append(f"CLAUDE.md mentions /{cmd} but .claude/skills/ has no such directory")
    return problems


def check_cluster_wiring():
    try:
        clusters = list_dirs(WIKI_DIR)
        helpers = read(HELPERS)
    except OSError as e:
        return [f"read failed: {e}"]
    routed = set(re.findall(r'cluster:\s*"#wiki/([^"]+)"', helpers))
    hubbed = set(re.findall(r'"#wiki/([^"]+)":\s*"', helpers))
    problems = [f'wiki cluster "{c}" has no route in TOPIC_TO_CLUSTER (datacore_helpers.md)'
                for c in clusters if c not in routed]
    # The two maps must cover the same clusters, or wiki_hub points at nothing.
    for c in sorted(routed - hubbed):
        problems.append(f'cluster "{c}" is in TOPIC_TO_CLUSTER but missing from CLUSTER_HUB')
    for c in sorted(hubbed - routed):
        problems.append(f'cluster "{c}" is in CLUSTER_HUB but missing from TOPIC_TO_CLUSTER')
    return problems


def check_doc_paths():
    top_names = {"SYSTEM", "INBOX", "PARA", "ZETA", "DAILY", "HUB", "STICKY"}
    top = tuple(f"{t}/" for t in top_names) + (".claude/", ".obsidian/")
    placeholder = set("<>{}*…|")
    # Skip lines that are not existence claims: history, teaching examples, and
    # conditional mentions ("... if `X` exists", which is precisely how CLAUDE.md
    # describes the optional flat tag list).
    skip_line = re.compile(
        r"\bif\b[^.]*\bexists?\b|renamed|deleted|retired|deprecated|formerly|used to|"
        r"for example|e\.g\.|such as|put it in|place it in|"
        r"已改名|已删|已退役|已失效|已弃用|旧的|原为|放进|放在|示例|例如|比如|假设",
        re.I)
    problems = set()
    for doc in PATH_SCAN_DOCS:
        try:
            text = read(doc)
        except OSError:
            continue  # optional doc absent — not this check's business
        for line in text.splitlines():
            if skip_line.search(line):
                continue
            for tok in re.findall(r"`([^`\n]+)`", line):
                if not tok.startswith(top) or placeholder & set(tok) or ".." in tok:
                    continue
                segs = tok.rstrip("/").split("/")
                if all(s in top_names for s in segs):
                    continue  # `PARA/ZETA/DAILY/...` — a shorthand enumeration, not a path
                p = tok.rstrip("/")
                # Note references often omit the .md suffix (e.g. `HUB/Homepage`)
                if not (VAULT / p).exists() and not (VAULT / (p + ".md")).exists():
                    problems.add(f"{doc.name} references a nonexistent path: {tok}")
    return sorted(problems)


def check_bilingual_parity():
    try:
        en = {p.name for p in DOCS_EN.glob("*.md")}
        zh = {p.name for p in DOCS_ZH.glob("*.md")}
    except OSError as e:
        return [f"read failed: {e}"]
    problems = [f"SYSTEM/DOCS/{n} has no zh/ counterpart" for n in sorted(en - zh)]
    problems += [f"SYSTEM/DOCS/zh/{n} has no English counterpart" for n in sorted(zh - en)]
    for n in sorted(en & zh):
        h_en = re.findall(r"^#+ ", read(DOCS_EN / n), re.M)
        h_zh = re.findall(r"^#+ ", read(DOCS_ZH / n), re.M)
        if len(h_en) != len(h_zh):
            problems.append(
                f"{n}: heading count differs (EN {len(h_en)} vs zh {len(h_zh)}) "
                "— one language likely gained or lost a section")
    return problems


def main():
    checks = [
        ("1 · Skill registry", check_skill_registry()),
        ("2 · Wiki cluster wiring", check_cluster_wiring()),
        ("3 · Doc path references", check_doc_paths()),
        ("4 · Bilingual parity (EN ↔ zh)", check_bilingual_parity()),
    ]
    failed = 0
    for name, problems in checks:
        if problems:
            failed += 1
            print(f"✗ {name}")
            for p in problems:
                print(f"    - {p}")
        else:
            print(f"✓ {name}")

    print()
    if failed:
        print(f"{failed} item(s) drifted — sync the docs and re-run.")
        return 1
    print("All consistent.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
