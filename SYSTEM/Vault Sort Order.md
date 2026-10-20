---
sorting-spec: |-
  // Vault-wide sort order · custom-sort designated note  ( < = ascending, > = descending )

  // Global default: folders A-Z, files A-Z
  target-folder: /*
  /folders
   < a-z
  /:files
   < a-z

  // Root (logical order, not alphabetical)
  target-folder: /
  HUB
  PARA
  ZETA
  DAILY
  INBOX
  STICKY
  SYSTEM
  /:files
   < a-z

  // HUB
  target-folder: HUB
  Homepage
  Map of Content
  Mail Box
  PARA-Wiki Atlas
  Tag Navigator
  MOC

  // HUB/MOC
  target-folder: HUB/MOC
  Permanent MOC
  Literature MOC
  Projects MOC
  Areas MOC
  Sources MOC

  // PARA
  target-folder: PARA
  PROJECTS
  AREAS
  RESOURCES
  ARCHIVES
  WORKSTATION

  // PARA/AREAS/* : folders A-Z, files most-recently-modified first
  target-folder: PARA/AREAS/*
  /folders
   < a-z
  /:files
   > modified

  // PARA/PROJECTS/* : folders A-Z, files most-recently-modified first
  target-folder: PARA/PROJECTS/*
  /folders
   < a-z
  /:files
   > modified

  // PARA/RESOURCES (by frequency of use)
  target-folder: PARA/RESOURCES
  DOCUMENTATIONS
  MEETINGS
  CONTACTS
  CONCEPT MAP

  // ZETA
  target-folder: ZETA
  PERMANENT
  LITERATURE
  FLEETING
  REFERENCE

  // ZETA/LITERATURE : newest first
  target-folder: ZETA/LITERATURE
  /:files
   > created

  // DAILY (time buckets: fine -> coarse)
  target-folder: DAILY
  DAILY
  WEEKLY
  MONTHLY
  QUARTERLY
  YEARLY

  // DAILY buckets : newest date on top
  target-folder: DAILY/DAILY
  target-folder: DAILY/WEEKLY
  target-folder: DAILY/MONTHLY
  target-folder: DAILY/QUARTERLY
  target-folder: DAILY/YEARLY
  > a-z

  // INBOX (data flow: sources -> synthesis -> rules)
  target-folder: INBOX
  raw
  wiki
  schema

  // INBOX/raw (by activity)
  target-folder: INBOX/raw
  Clippings
  Podcasts
  Books
  Videos
  EverythingElse

  // INBOX/wiki (index/log pinned, clusters A-Z)
  target-folder: INBOX/wiki
  index
  log
  /folders
   < a-z

  // SYSTEM
  target-folder: SYSTEM
  TEMPLATE
  TAGS
  SCRIPTS
  DOCS
  BANNER
  DESIGN
  /:files
   < a-z

  // SYSTEM/DOCS
  target-folder: SYSTEM/DOCS
  getting-started
  structure
  llm-wiki
  tags
  dashboards
  interface
  agent-workflows
  by-need
  source-governance
  migration
  plugins
  plugin-licenses
  plugin-licenses.json
  asset-licenses
  zh
  assets
---

# Vault-wide Sort Order (custom-sort designated note)

This note is the **designated note** for the *Custom File Explorer sorting* plugin: the `sorting-spec` in its frontmatter defines the File Explorer display order across the whole vault, using multiple `target-folder` blocks. The plugin's `additionalSortspecFile` setting points to this file.

**How to use**
- Change the order: edit the frontmatter above, save, then click the plugin's ribbon icon (or run the `sort-on` command).
- `<` = ascending, `>` = descending. An explicit `target-folder` block overrides the global `/*` default (folders A-Z + files A-Z).
- Plugin & syntax docs: <https://github.com/SebastianMC/obsidian-custom-sort>

**Note**
- If it doesn't take effect: confirm the plugin is enabled, click the ribbon to refresh, and check indentation (the `sorting-spec` is a YAML block scalar — use spaces, not tabs).
