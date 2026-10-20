#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Human-facing docs · consistency check (drift alarm, read-only, modifies nothing).

This vault's human-facing docs (README / AGENTS.md / SYSTEM/DOCS/*) describe its
structure and features to a reader, and they drift out of sync silently as the
vault evolves. This script freezes the *machine-assertable* invariants into
checks. It only reports; you fix the docs.

Checks (few and strict — only high-value, low-false-positive ones):
  1. Skill registry: every .agents/skills/ directory is registered in AGENTS.md,
     and every `/command` mentioned there has a matching directory.
  2. Cluster wiring: every INBOX/wiki/<cluster> folder has a route in
     TOPIC_TO_CLUSTER, and TOPIC_TO_CLUSTER / CLUSTER_HUB cover the same clusters
     (they must stay in sync or the wiki_hub field targets a nonexistent page).
  3. Path references: backtick-quoted vault paths in the core docs actually exist.
  4. Bilingual parity: SYSTEM/DOCS/*.md and SYSTEM/DOCS/zh/*.md are the same set
     of files with the same heading structure (this template ships EN + zh; the
     usual drift is editing one and forgetting the other).
  5. Configuration input files, bundled enabled plugins and journal metadata.
  6. Six journal skills' exact template anchors and shared contract reference.

Deliberately NOT checked (would be noise here):
  - Cluster *counts*: the template seeds 4 cluster routes but only ships content
    for some — "configured but not yet populated" is a valid state, not drift.
  - Plugin runtime compatibility and Obsidian UI behavior.
  - Hotkeys: this template ships no hotkey reference table.
  - Semantic drift (is a new feature documented? do two docs contradict?):
    needs judgement — see the SKILL's manual section.

Usage:
    python doc-lint.py          # run every check
Exit code: 0 = all consistent; 1 = drift found (see output).
"""

import json
import importlib.util
import re
import sys
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
except AttributeError:
    pass

VAULT = Path(__file__).resolve().parents[4]

SKILLS_DIR = VAULT / ".agents" / "skills"
AGENTS_MD  = VAULT / "AGENTS.md"
README     = VAULT / "README.md"
DOCS_EN    = VAULT / "SYSTEM" / "DOCS"
DOCS_ZH    = VAULT / "SYSTEM" / "DOCS" / "zh"
WIKI_DIR   = VAULT / "INBOX" / "wiki"
HELPERS    = VAULT / "SYSTEM" / "SCRIPTS" / "datacore_helpers.md"

# Check 3's scan surface: docs that describe the vault's *current* state.
PATH_SCAN_DOCS = [
    README,
    VAULT / "README.zh-CN.md",
    AGENTS_MD,
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
        claude = read(AGENTS_MD)
    except OSError as e:
        return [f"read failed: {e}"]
    problems = []
    # Forward: every skill directory is registered (word-bounded, so /tag does not match /tag-lint)
    for s in skills:
        if not re.search(r"/" + re.escape(s) + r"(?![a-z0-9-])", claude):
            problems.append(f"skill /{s} is not registered in AGENTS.md")
    # Reverse: every `/command` in AGENTS.md has a directory
    known = set(skills)
    for cmd in sorted(set(re.findall(r"`/([a-z][a-z0-9-]+)`", claude))):
        if cmd not in known:
            problems.append(f"AGENTS.md mentions /{cmd} but .agents/skills/ has no such directory")
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
    top = tuple(f"{t}/" for t in top_names) + (".agents/", ".claude/", ".codex/", ".obsidian/")
    placeholder = set("<>{}*…|")
    # Skip lines that are not existence claims: history, teaching examples, and
    # conditional mentions ("... if `X` exists", which is precisely how AGENTS.md
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


def check_config_targets():
    """Check static input files, not output folders that QuickAdd creates on demand."""
    problems = []
    plugins = VAULT / '.obsidian/plugins'

    def load(path):
        try:
            return json.loads(read(path))
        except (OSError, ValueError) as error:
            problems.append(f'{path.relative_to(VAULT)}: cannot read JSON ({type(error).__name__})')
            return {}

    def target(value, location):
        if not isinstance(value, str) or not value or '{{' in value:
            return
        path = VAULT / value
        if not path.is_file() and not (VAULT / (value + '.md')).is_file():
            # Report the location only; configuration values may be private.
            problems.append(f'{location}: referenced input file is missing')

    templater = load(plugins / 'templater-obsidian/data.json')
    for group in ('folder_templates', 'file_templates'):
        for i, entry in enumerate(templater.get(group, [])):
            target(entry.get('template'), f'templater.{group}[{i}].template')
    for group in ('enabled_templates_hotkeys', 'startup_templates'):
        for i, value in enumerate(templater.get(group, [])):
            target(value, f'templater.{group}[{i}]')

    def quickadd_targets(value, location='quickadd'):
        if isinstance(value, dict):
            for key, item in value.items():
                if key in ('templatePath', 'template', 'path', 'File path') and isinstance(item, str):
                    target(item, location + '.' + key)
                else:
                    quickadd_targets(item, location + '.' + key)
        elif isinstance(value, list):
            for i, item in enumerate(value):
                quickadd_targets(item, location + f'[{i}]')

    quickadd_targets(load(plugins / 'quickadd/data.json'))
    journals = load(plugins / 'journals/data.json')
    for name, journal in journals.get('journals', {}).items():
        for i, value in enumerate(journal.get('templates', [])):
            target(value, f'journals.{name}.templates[{i}]')
        fm = journal.get('frontmatter', {})
        if not fm.get('addStartDate') or not fm.get('addEndDate'):
            problems.append(f'journals.{name}: required range metadata is disabled')
        if fm.get('startDateField') not in ('', 'journal-start-date') or fm.get('endDateField') not in ('', 'journal-end-date'):
            problems.append(f'journals.{name}: range metadata keys differ from dashboard contract')
    homepages = load(plugins / 'homepage/data.json')
    for name, home in homepages.get('homepages', {}).items():
        if home.get('kind') == 'File':
            target(home.get('value'), f'homepage.{name}.value')
    sort = load(plugins / 'custom-sort/data.json')
    target(sort.get('additionalSortspecFile'), 'custom-sort.additionalSortspecFile')
    enabled = load(VAULT / '.obsidian/community-plugins.json')
    if not isinstance(enabled, list):
        problems.append('community-plugins.json must be a list')
    else:
        for plugin in enabled:
            for filename in ('manifest.json', 'main.js'):
                if not (plugins / plugin / filename).is_file():
                    problems.append(f'enabled plugin {plugin}: missing {filename}')
    return problems


def check_journal_contracts():
    periods = {'morning-start': 'daily', 'daily-review': 'daily', 'weekly-start': 'weekly',
               'weekly-review': 'weekly', 'monthly-start': 'monthly', 'monthly-review': 'monthly'}
    problems = []
    for skill, period in periods.items():
        text = read(SKILLS_DIR / skill / 'SKILL.md')
        template = read(VAULT / f'SYSTEM/TEMPLATE/FORMAT/template_{period}_note.md')
        if 'SYSTEM/DOCS/agent-workflows.md' not in text:
            problems.append(f'{skill}: missing shared journal contract')
        # The morning skill also reads the current weekly MIT.
        if skill == 'morning-start':
            template += read(VAULT / 'SYSTEM/TEMPLATE/FORMAT/template_weekly_note.md')
        for heading in re.findall(r'`(#{1,6} [^`]+)`', text):
            if len(re.findall('^' + re.escape(heading) + '$', template, re.M)) != 1:
                problems.append(f'{skill}: missing or duplicate exact template anchor: {heading}')
    return problems


def check_shared_skills_and_navigation():
    problems = []
    spec = importlib.util.spec_from_file_location('skill_mirror', VAULT / 'SYSTEM/SCRIPTS/sync_agent_skills.py')
    sync = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(sync)
    problems.extend(sync.compare_trees(VAULT / '.agents/skills', VAULT / '.claude/skills'))
    skills = list_dirs(SKILLS_DIR)
    for doc in [README, VAULT / 'README.zh-CN.md', DOCS_EN / 'agent-workflows.md', DOCS_ZH / 'agent-workflows.md']:
        expected = rf'\*\*{len(skills)}(?: skills| 个技能)\*\*'
        if not re.search(expected, read(doc)):
            problems.append(f'{doc.name}: skill count differs from actual {len(skills)}')
    for config, names in [('.codex/hooks.json', ['Write', 'Edit', 'apply_patch']), ('.claude/settings.json', ['Write', 'Edit'])]:
        try:
            data = json.loads(read(VAULT / config))
            entries = data['hooks']['PostToolUse']
            for name in names:
                if not any(re.fullmatch(entry['matcher'], name) for entry in entries):
                    problems.append(f'{config}: missing {name} matcher')
        except (OSError, ValueError, KeyError, TypeError) as error:
            problems.append(f'{config}: invalid hook config ({type(error).__name__})')
    toolbar = json.loads(read(VAULT / '.obsidian/plugins/note-toolbar/data.json'))
    links = []
    for bar in toolbar['toolbars']:
        for item in bar['items']:
            if item.get('linkAttr', {}).get('type') == 'file':
                target = item.get('link', '')
                links.append(target)
                if target and not (VAULT / target).is_file() and not (VAULT / (target + '.md')).is_file():
                    problems.append('note-toolbar: missing file target ' + target)
    home = read(VAULT / 'HUB/Homepage.md')
    order = read(VAULT / 'SYSTEM/Vault Sort Order.md')
    for name in ['Permanent', 'Literature', 'Projects', 'Areas', 'Sources']:
        relative = f'HUB/MOC/{name} MOC.md'
        if not (VAULT / relative).is_file() or relative not in links or relative[:-3] not in home or f'  {name} MOC\n' not in order:
            problems.append(f'{name} MOC: file/home/toolbar/sort wiring differs')
    if '@AGENTS.md' not in read(VAULT / 'CLAUDE.md'):
        problems.append('CLAUDE.md does not import shared AGENTS.md')
    return problems


def main():
    checks = [
        ("1 · Skill registry", check_skill_registry()),
        ("2 · Wiki cluster wiring", check_cluster_wiring()),
        ("3 · Doc path references", check_doc_paths()),
        ("4 · Bilingual parity (EN ↔ zh)", check_bilingual_parity()),
        ("5 · Config input targets and bundled dependencies", check_config_targets()),
        ("6 · Journal skill anchors and shared contracts", check_journal_contracts()),
        ("7 · Shared skill mirror, counts, hook matchers and navigation", check_shared_skills_and_navigation()),
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
