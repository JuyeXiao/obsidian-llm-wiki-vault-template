# Retained plugin licenses and redistribution review

Review date: 2026-10-20. [中文](zh/plugin-licenses.md) · [Versioned evidence](plugin-licenses.json) · [Installation and optional plugins](plugins.md)

**The current scope is 12 retained plugins; bundle publication is still pending review.** The older 42 plugins and their bundled assets/notices have been removed from the current working tree. All 12 project licenses and per-plugin component notices are retained. Trimming did not change retained program bytes, upgrade plugins or rewrite earlier commits/releases.

## Notices retained

- Six MIT projects retain copyright, permission and warranty notices; one MIT-0 project's original text is retained for provenance.
- Four GPLv3 and one AGPLv3 projects retain full licenses and existing modification statements. Corresponding source and the selected delivery arrangements still require review; fixed source links alone do not establish fulfillment of all conditions.
- Each `THIRD-PARTY-NOTICES.txt` retains identified component texts, sources and open items. A project-level grant does not replace independently licensed dependency notices.
- The original template's MIT license does not cover third-party programs. Recheck changed versions, notices, assets and source access after a plugin update.

## Conditions still open

1. **Five source-delivery reviews:** Custom Sort, Note Toolbar, Meta Bind, Style Settings and Templater still lack accepted evidence of complete corresponding source/dependency closure and durable delivery arrangements.
2. **Two metadata conflicts:** Custom Sort and Style Settings have MIT package fields conflicting with GPL license texts. This inventory follows the license text without assuming an optional MIT grant.
3. **Dependency evidence:** Datacore, Dataview, Journals and Templater have multiple version candidates; the missing rusty_engine notice has now been restored from an upstream license-only commit with unchanged Rust source. See the JSON and per-plugin notices. The inventory is not a complete transitive SBOM or an exhaustive icon/asset review.
4. Themes, CSS and image provenance are covered in the [asset review](asset-licenses.md); earlier commits/releases have not been re-cleared.

Force note view mode, Paste URL into selection, Tag Wrangler, Smart Connections, Claudian and Enhancing Export have been removed. Their earlier unresolved conditions no longer concern inclusion of those programs in the **current working tree**. Removal does not establish upstream permission or withdraw the earlier 54-plugin evidence. Review optional user-installed plugins by their actual version before any redistribution; do not silently rebundle them.

## Source access checked

The five fixed GPL/AGPL source archives were successfully downloaded on 2026-10-20. Their file counts, SHA256 hashes, build entries and available lock files are recorded in `source_review` in the JSON and beside each plugin in its notice file. No downloaded code was executed and no dependencies were installed. Archive availability does not prove complete corresponding source or future availability. GPLv3 section 6(d) permits a separate source server with clear directions, while leaving the distributor responsible for continued source access; a local-only audit copy is not a public delivery channel.

The `@silentvoid13/rusty_engine@0.4.0` npm `gitHead` was compared with the upstream licensed commit: only `LICENSE.TXT` was added. Its AGPL text is now included in Templater's component notices. The WASM binary was not rebuilt. The two package metadata conflicts are preserved as evidence; the GPL license texts remain in force for this inventory.

## Evidence boundary

The table preserves fixed sources, versions, identified dependencies and hashes from the prior per-version review. `asset_verification` records release comparisons before notices were restored; `artifact_hashes` records files after that notice update. Trimming did not modify retained programs. No new build, exhaustive dependency inventory or author contact was performed. Original component terms control over this summary.

| Plugin ID | Version | Project license evidence | Local text | Fixed source | Open conditions |
|---|---|---|---|---|---|
| `custom-sort` | 3.1.6 | GPLv3 | [LICENSE](../../.obsidian/plugins/custom-sort/LICENSE.md) | [source](https://github.com/sebastianmc/obsidian-custom-sort/tree/284bfdf04055b3ec8a5587b133cfffe8ba157486) | CONFLICTING_METADATA, SOURCE_DISTRIBUTION |
| `datacore` | 0.1.29 | MIT | [LICENSE](../../.obsidian/plugins/datacore/LICENSE.txt) | [source](https://github.com/blacksmithgu/datacore/tree/6a1aa7317530d0c524dd3368f52f3032e7cf869e) | MULTIPLE_LOCK_VERSIONS |
| `dataview` | 0.5.68 | MIT | [LICENSE](../../.obsidian/plugins/dataview/LICENSE.txt) | [source](https://github.com/blacksmithgu/obsidian-dataview/tree/29b1ad87e1f2b964b4fa0c209f11d0622469bdb0) | MULTIPLE_LOCK_VERSIONS |
| `homepage` | 4.4.2 | MIT | [LICENSE](../../.obsidian/plugins/homepage/LICENSE.md) | [source](https://github.com/mirnovov/obsidian-homepage/tree/eaa5d29fc7a685aee2129f2e04122cd646349110) | full component inventory unverified |
| `iconic` | 1.1.9 | MIT-0 | [LICENSE](../../.obsidian/plugins/iconic/LICENSE) | [source](https://github.com/gfxholo/iconic/tree/d79c1ec50b83d67ba26a70f4dc8c212a414963ef) | full component inventory unverified |
| `journals` | 2.1.10 | MIT | [LICENSE](../../.obsidian/plugins/journals/LICENSE) | [source](https://github.com/srg-kostyrko/obsidian-journal/tree/21d5cbabc81af2ba9724d85eed46c84773754ac2) | MULTIPLE_LOCK_VERSIONS |
| `note-toolbar` | 1.32.15 | GPLv3 | [LICENSE](../../.obsidian/plugins/note-toolbar/LICENSE) | [source](https://github.com/chrisgurney/obsidian-note-toolbar/tree/3a42ed12e98ef24322690983dfd10416eb7f6927) | SOURCE_DISTRIBUTION |
| `obsidian-banners` | 1.3.3 | MIT | [LICENSE](../../.obsidian/plugins/obsidian-banners/LICENSE) | [source](https://github.com/noatpad/obsidian-banners/tree/b4601ca5481402e62cc0bc477abc717fddcb099d) | full component inventory unverified |
| `obsidian-meta-bind-plugin` | 1.4.12 | GPLv3 | [LICENSE](../../.obsidian/plugins/obsidian-meta-bind-plugin/LICENSE.txt) | [source](https://github.com/mprojectscode/obsidian-meta-bind-plugin/tree/6d41566765e19325150c508d3c1146074df78283) | SOURCE_DISTRIBUTION |
| `obsidian-style-settings` | 1.0.9 | GPLv3 | [LICENSE](../../.obsidian/plugins/obsidian-style-settings/LICENSE.md) | [source](https://github.com/obsidian-community/obsidian-style-settings/tree/4ebec6ae0131a9d5e8307bb5e26d59db5ba2e81c) | CONFLICTING_METADATA, SOURCE_DISTRIBUTION |
| `quickadd` | 2.12.2 | MIT | [LICENSE](../../.obsidian/plugins/quickadd/LICENSE) | [source](https://github.com/chhoumann/quickadd/tree/d38644d70a65735fe1fe347aa9a172d378b6c0a4) | full component inventory unverified |
| `templater-obsidian` | 2.20.5 | AGPLv3 | [LICENSE](../../.obsidian/plugins/templater-obsidian/LICENSE.TXT) | [source](https://github.com/silentvoid13/Templater/tree/e818dc6cd37aa9aecbfee49ab06ee343f8b12e01) | MULTIPLE_LOCK_VERSIONS, SOURCE_DISTRIBUTION |
