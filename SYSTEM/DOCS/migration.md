# Upgrade an existing vault

Back up your own vault and inspect its local changes before applying the template update. Merge named files; preserve manual content, private settings and unrelated staged work. No migration command commits or pushes. [中文](zh/migration.md)

## Shared skill source and hooks

Older releases edited `.claude/skills/`. The sole source is now `.agents/skills/`; preserve any local skill improvements there before generating the Claude mirror. `AGENTS.md` owns shared rules; `CLAUDE.md` imports it and explains Claude discovery. Do not maintain two independent bodies.

```sh
python SYSTEM/SCRIPTS/sync_agent_skills.py --write
python SYSTEM/SCRIPTS/sync_agent_skills.py
python .agents/skills/doc-lint/scripts/doc-lint.py
```

Generation removes extra files from the mirror; first merge personal mirror changes into the source. It excludes Python runtime caches. Keep your own permissions, model settings and local configuration out of the public template. Review the platform hook entries before merging into existing configs; the shared checker needs Node, and the Claude adapter needs Python. See [agent-workflows.md](agent-workflows.md) for actual command/payload limits. Direct tests do not establish runtime delivery in either agent.

## Five navigation entrances

Permanent / Literature / Projects / Areas / Sources replace the old all-notes entry. Homepage, toolbar, QuickAdd and sort order point to these pages. `HUB/Map of Content.md` remains a small compatibility page, so old links still open somewhere useful. Wiki search starts at its index. Merge toolbar changes with your own actions instead of replacing your whole plugin settings file. After merging `SYSTEM/Vault Sort Order.md`, run **sort-on** in Obsidian to refresh the explorer.

Permanent MOC reads real pending/open-question callouts and does not infer confirmation from their absence. Existing unmarked notes remain Unmarked; adding a marker or confirming a position is a content decision, not an automatic migration.

## Links and note ownership

Use vault-relative links whenever a title collides, especially raw/literature pairs. Existing selectors store `useLinks(true)` paths; backlink helpers reject ambiguous bare names. Keep `## Sources` in Wiki pages even if prose is translated. Literature evidence points to raw; permanent evidence points to exact literature; raw need not pass through literature before Wiki ingestion.

The generic older literature example was replaced by the original `Note-Taking Basics (example)` chain. In your own vault, inspect any old example or inbound link before removing it; a user-edited note must not be replaced by a template sample. Distill preserves existing manual text, metadata, annotations and connections; use it to refine one named note rather than duplicating it.

## Versions, state files and checks

Create the empty version-1 policy/decision documents only when you have none. Do not overwrite an existing registry with the template's example record. Adopt `schema_version: 1` only after reviewing the whole schema contract. Unknown versions fail; there is no silent skip or historical-ledger importer.

Old citations without decisions become `legacy_ingested`. Review them individually; do not mark every raw as satisfied. For approved decisions compute the public body hash (frontmatter removed, CRLF normalized), preserve unrelated records and use the validated candidate-write command in [source governance](source-governance.md). Page metadata now has enforced type-specific sources, count, category and navigation/index rules. Fix genuine drift within your authorized scope.

```sh
node .agents/skills/wiki-lint/scripts/wiki-lint.js --json
node .agents/skills/wiki-lint/scripts/wiki-index.js --check
node --test .agents/skills/wiki-lint/scripts/wiki-lint.test.js
node --test SYSTEM/SCRIPTS/tests/*.test.cjs
python -B -m unittest discover -s SYSTEM/SCRIPTS/tests -p "test_*.py"
python -B -m unittest discover -s .agents/skills/vault-git/scripts -p "test_*.py"
```

Node is the only Wiki rules engine. Older `.agents/skills/wiki-lint/scripts/wiki-lint.sh` and `.py` commands forward to it. Script checks do not cover live Obsidian rendering or real agent reasoning: verify navigation, relation saving, pending filters, journal writes and warning delivery in an isolated test vault before adopting the update for daily work.

## Plugin reduction: 54 → 12

Merge the [retained list and 42 optional entries](plugins.md); do not treat a user’s plugin directory as disposable template data. Back up removed plugins’ personal settings before deciding to uninstall them. Merge the enabled list and Note Toolbar: Omnisearch → `global-search:open`, Quick Switcher++ → `switcher:open`; preserve their key combinations and remove the Quick Explorer shortcut. Keep the native Search, Quick Switcher and Files core plugins enabled. The legacy Timeline Tasks Manager now links to Mail Box; its script/style are retired. Install/configure Tasks separately for its specific behavior. After removing Force note view mode, use native view controls; Homepage still opens in Reading view. Home Tab is no longer bundled, so new tabs return to the native empty view.

The toolbar's separate light/dark commands are replaced by the native `theme:toggle-light-dark` command. An orphaned QuickAdd hotkey is removed; do not restore it without a matching enabled choice.

Iconic/Banners/Style Settings and existing plugin versions are retained. No plugin upgrade or history rewrite occurs. The new license inventory describes only the current 12 plugins; old commits/releases do not disappear with this deletion. Test core workflows in an isolated copy after merging; optional additions are outside default acceptance.
