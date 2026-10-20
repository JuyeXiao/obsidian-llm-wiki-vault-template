---
name: vault-git
description: Inspect this vault's worktree, index, untracked files and locally recorded outgoing commits; suggest groups by purpose and dependencies. Commit or push only within explicit session authorization. A bare /vault-git is read-only.
---

# Vault Git

## Scope

Read `AGENTS.md` and current authorization. The target is the vault containing this skill; verify `git rev-parse --show-toplevel`, not whichever unrelated repository happens to be the caller's cwd. Creating or testing this skill does not authorize delivery.

| Request | Behavior |
|---|---|
| `/vault-git`, inspect changes | Local read-only inventory, diff review and grouping suggestions |
| Commit the suggested group | Reuse the concrete reviewed file list and current authorization; recheck before staging |
| Inspect and commit in groups | Inventory the requested scope, explain groups and execute; no repeated approval per group |
| Commit and push | Also review the entire outgoing history and verify the remote |
| Push existing commits only | Upload authorized history; do not include worktree changes |

Explicit limits prevail. Ambiguous “sync/backup” starts with inspection; do not infer pull or push. This tool never edits notes, config, `.gitignore`, skills or audit history; never cleans up or schedules work. Journal reviews have **no automatic commit/push exception**.

## Inventory and evidence

From the vault root:

```sh
python .agents/skills/vault-git/scripts/inspect_git.py
```

Standard-library Python and Git only. Exit 0 means inventory obtained; exit 2 means inspection failed. `--repo <path>` is for an explicitly named target or temporary-repository testing. The script does not fetch, stage, commit or push.

- `changes` records XY status, rename source, worktree size/SHA256 and staged blob/size. Staged and unstaged counts may overlap.
- `head`, `upstream`, `ahead`, `behind`, `outgoing_commits` use **local refs only**. `remote_verified=false` is not evidence of remote synchronization. Missing/invalid upstream yields null counts, not zero.
- `operations` and `conflicts` report locks, merge/rebase/cherry-pick states and conflicts. Stop Git writes while present; do not repair, remove a lock or unstage anything. Detached/unborn branches, submodules and nested repositories need an explicit plan.
- `stable_during_scan=false` or read errors require a new inventory. Even a stable scan is not a write lock; use `snapshot_id`, file hashes, HEAD and index for subsequent checks.
- Ignored files are excluded; a clean tree is not a complete vault backup. Do not force-add ignored data.

Review actual worktree and staged differences, new-file contents and relevant local history. Use `--no-ext-diff --no-textconv` and literal pathspecs. Do not paste secrets or whole private notes into chat; report suspicious field/path locations only.

## Group by purpose and dependencies

Give group name, purpose, precise files/count, dependency reason and retained items. One group is fine when coherent. Shared Wiki pages/index/log/decisions and skill source/mirror/docs usually belong together. A shared file with mixed changes needs independently reviewed hunks; otherwise retain it and dependent unfinished work. Do not ingest every plan or plugin file just because it is dirty.

Review `.obsidian` content by meaning (intentional configuration, plugin updates, runtime state, sensitive data) under existing ignore rules. Check both rename ends, deletions, unusual sizes and unclear configuration changes. Keep concurrent new changes outside the original inventory unless separately included. Under existing autonomous grouping authorization this list is an execution explanation, not another approval request.

## Authorized commit

1. Freeze initial candidates and group paths/hunks. Inspect the index first. Any unrelated staged content stops commit and remains intact; do not reset, unstage or stash. Review related staged content too. Whole-file add must not overwrite a person's partial staging choice.
2. Before each group, recheck HEAD, index, file fingerprints and contents. Re-read changed candidates; new files remain for another pass. Stop a group if files keep changing or the reviewed snapshot no longer applies.
3. Stage an exact literal allowlist: `git --literal-pathspecs add -- <file1> <file2>`. Include old paths for renames/deletions. Larger lists use a temporary UTF-8 NUL-separated `--pathspec-from-file` with `--pathspec-file-nul`. Never use `git add .`, `git add -A`, directory staging or force-add. Review patch and final index blob for hunk staging.
4. Compare the actual staged path **set** and complete staged content with the authorized set. Inspect deletions, sizes and sensitive fields. Any mismatch stops the commit without cleanup. Concurrent worktree edits are not automatically re-added.
5. Run proportionate checks: relevant code tests, skill mirror/doc checks, source/link checks for content. Reuse unchanged prior validation. Run `git -c core.whitespace=cr-at-eol diff --cached --check`; report historical source whitespace instead of rewriting source text.
6. Recheck HEAD/index/set immediately before commit. Use a concise content-focused message; no coauthor/generated-by trailer. Verify the resulting commit's file set, blobs and tree against the reviewed index. If a hook changes files or commit fails, stop that group; no automatic amend, bypass or retry that absorbs new changes.

No reset, clean, stash or history rewriting. A final worktree with clearly retained changes is valid.

## Authorized push and verification

1. Identify the explicit target or existing upstream; inspect remote push URLs/multiple-target settings. Resolve missing/ambiguous targets; never change configuration or silently upload to more than one repository.
2. Fetch the intended branch and recompute ahead/behind. Fetch only refreshes local tracking refs; failed fetch leaves remote state unverified. Stop on remote-ahead/divergence; no pull/rebase/merge/force push.
3. Review **every commit from the actual target remote branch to HEAD**, including older pending commits and sensitive/large files. A normal push cannot skip an unpublished ancestor. New-group authorization does not automatically cover unrelated old history; explicit authorization to push all existing commits does.
4. Freeze the reviewed SHA and verify no operation/conflict is pending. Push that SHA with one explicit refspec and tag following disabled: `git -c push.followTags=false push --no-follow-tags <remote> <sha>:refs/heads/<branch>`. No force/mirror/all/branch deletion.
5. Read the remote branch with `git ls-remote`. Report success only for the verified SHA or a proven descendant. If push times out, read the remote before retrying. Preserve local commits on failure; do not change credentials/proxies/protocol or retry indefinitely.

## Report and maintenance

Inspection: branch, scan time, worktree/index/untracked counts, outgoing commits with evidence freshness, group rationale and retained paths. Execution: actual commit SHAs/file counts, push target and remote evidence, remaining changes and passed/failed/not-run checks. A successful local commit is distinct from a verified push. No change means no empty commit.

Run regression tests only in temporary repositories and local bare remotes:

```sh
python -B -m unittest discover -s .agents/skills/vault-git/scripts -p "test_*.py" -v
```

After skill edits regenerate the Claude mirror and run `/doc-lint`. A real-vault smoke test uses inspection only; deterministic Git tests do not prove an agent follows every authorization boundary.
