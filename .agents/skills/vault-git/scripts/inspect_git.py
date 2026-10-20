#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Read-only local Git inventory as JSON; no fetch, index or worktree writes."""

from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import sys


class InspectionError(Exception):
    pass


def git(repo: Path, *args: str, optional: bool = False, data: bytes | None = None):
    env = dict(os.environ, GIT_OPTIONAL_LOCKS="0", GIT_TERMINAL_PROMPT="0",
               GIT_NO_LAZY_FETCH="1")
    # An explicit --repo must not inherit an alternate index/worktree.
    for key in ("GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_COMMON_DIR"):
        env.pop(key, None)
    result = subprocess.run(
        ["git", "--no-optional-locks", "-c", "core.fsmonitor=false", *args],
        cwd=repo, env=env, input=data, capture_output=True, timeout=30,
    )
    if result.returncode:
        if optional:
            return None
        # Do not echo stderr: configuration errors can contain credential URLs.
        raise InspectionError(f"Git {args[0]} failed (exit {result.returncode})")
    return result.stdout


def decode(value: bytes) -> str:
    return value.decode("utf-8", errors="surrogateescape")


def hash_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def fingerprint(path: Path) -> dict:
    try:
        before = path.lstat()
        if stat.S_ISLNK(before.st_mode):
            target = os.fsencode(os.readlink(path))
            return {"kind": "symlink", "size_bytes": len(target),
                    "sha256": hashlib.sha256(target).hexdigest()}
        if not stat.S_ISREG(before.st_mode):
            return {"kind": "directory_or_special", "size_bytes": None, "sha256": None}
        digest = hash_file(path)
        after = path.stat()
        stable = (before.st_size, before.st_mtime_ns, before.st_ino) == (
            after.st_size, after.st_mtime_ns, after.st_ino)
        return {"kind": "file", "size_bytes": after.st_size, "sha256": digest,
                "stable_during_read": stable}
    except FileNotFoundError:
        return {"kind": "missing", "size_bytes": None, "sha256": None}
    except OSError as error:
        return {"kind": "unreadable", "size_bytes": None, "sha256": None,
                "error": type(error).__name__}


def status(repo: Path) -> bytes:
    return git(repo, "status", "--porcelain=v1", "-z", "--untracked-files=all",
               "--ignore-submodules=none")


def parse_status(raw: bytes) -> list[dict]:
    parts = iter(raw.split(b"\0"))
    changes = []
    for entry in parts:
        if not entry:
            continue
        xy = entry[:2].decode("ascii")
        item = {"path": decode(entry[3:]), "xy": xy,
                "staged": xy[0] not in " ?!", "unstaged": xy[1] not in " ?!",
                "untracked": xy == "??",
                "conflict": "U" in xy or xy in ("AA", "DD")}
        if "R" in xy or "C" in xy:
            item["original_path"] = decode(next(parts))
        changes.append(item)
    return changes


def git_path(repo: Path, name: str) -> Path:
    value = Path(decode(git(repo, "rev-parse", "--git-path", name)).strip())
    return value if value.is_absolute() else repo / value


def head(repo: Path) -> str | None:
    value = git(repo, "rev-parse", "--verify", "HEAD", optional=True)
    return decode(value).strip() if value else None


def inspect(repo: Path) -> dict:
    root = Path(decode(git(repo, "rev-parse", "--show-toplevel")).strip()).resolve()
    started = datetime.now(timezone.utc).isoformat()
    head_before = head(root)
    index_path = git_path(root, "index")
    index_before = fingerprint(index_path)
    raw = status(root)
    changes = parse_status(raw)
    relevant = {item[key] for item in changes for key in ("path", "original_path") if key in item}

    staged = {}
    for entry in git(root, "ls-files", "--stage", "-z").split(b"\0"):
        if not entry:
            continue
        metadata, name = entry.split(b"\t", 1)
        path = decode(name)
        if path in relevant:
            mode, oid, stage = metadata.decode("ascii").split()
            staged.setdefault(path, []).append({"mode": mode, "oid": oid, "stage": int(stage)})
    oids = sorted({blob["oid"] for entries in staged.values() for blob in entries
                   if blob["mode"] != "160000" and set(blob["oid"]) != {"0"}})
    sizes = {}
    if oids:
        checked = git(root, "cat-file", "--batch-check=%(objectname) %(objecttype) %(objectsize)",
                      data=("\n".join(oids) + "\n").encode("ascii"))
        for line in checked.splitlines():
            fields = line.decode("ascii").split()
            if len(fields) == 3:
                sizes[fields[0]] = int(fields[2])
    for item in changes:
        item["worktree"] = fingerprint(root / item["path"])
        item["index_entries"] = staged.get(item["path"], [])
        for blob in item["index_entries"]:
            blob["size_bytes"] = sizes.get(blob["oid"])
        if "original_path" in item:
            item["original_worktree"] = fingerprint(root / item["original_path"])
        item["requires_repository_review"] = (
            item["worktree"]["kind"] == "directory_or_special"
            or any(blob["mode"] == "160000" for blob in item["index_entries"]))

    branch_raw = git(root, "symbolic-ref", "--quiet", "--short", "HEAD", optional=True)
    branch = decode(branch_raw).strip() if branch_raw else None
    upstream = None
    upstream_state = "not_configured"
    ahead = behind = outgoing = None
    if branch:
        ref = "refs/heads/" + branch
        meta = decode(git(root, "for-each-ref", "--format=%(upstream)\t%(upstream:remotename)\t%(upstream:remoteref)", ref)).strip("\r\n")
        if meta and meta.split("\t")[0]:
            tracking, remote, remote_ref = meta.split("\t")
            upstream = {"tracking_ref": tracking, "remote": remote, "remote_ref": remote_ref}
            upstream_oid = git(root, "rev-parse", "--verify", tracking, optional=True)
            upstream_state = "local_ref_available" if upstream_oid else "missing_local_ref"
            if upstream_oid and head_before:
                upstream["oid"] = decode(upstream_oid).strip()
                counts = git(root, "rev-list", "--left-right", "--count",
                             head_before + "..." + upstream["oid"])
                ahead, behind = map(int, counts.split())
                log = git(root, "log", "--reverse", "--format=%H%x00%s", "-z",
                          upstream["oid"] + ".." + head_before)
                fields = log.split(b"\0")
                outgoing = [{"sha": decode(fields[i]), "subject": decode(fields[i + 1])}
                            for i in range(0, len(fields) - 1, 2)]

    operations = [name for name in ("MERGE_HEAD", "rebase-merge", "rebase-apply",
                                    "CHERRY_PICK_HEAD", "REVERT_HEAD", "sequencer", "BISECT_LOG",
                                    "index.lock") if git_path(root, name).exists()]
    head_after = head(root)
    raw_after = status(root)
    index_after = fingerprint(index_path)
    stable = (head_before == head_after and raw == raw_after and index_before == index_after
              and index_before.get("stable_during_read", True))
    for item in changes:
        for key in ("worktree", "original_worktree"):
            file_state = item.get(key, {})
            if file_state.get("kind") == "unreadable" or not file_state.get("stable_during_read", True):
                stable = False
        # Recheck fingerprints for edits with unchanged XY status; this is not atomic.
        if fingerprint(root / item["path"]) != item["worktree"]:
            stable = False

    counters = Counter(item["xy"] for item in changes)
    snapshot = {"head": head_before, "index_sha256": index_before["sha256"], "changes": changes}
    snapshot_id = hashlib.sha256(json.dumps(snapshot, sort_keys=True, ensure_ascii=True).encode()).hexdigest()
    return {
        "schema_version": 1, "repo_root": str(root), "scanned_at_utc": started,
        "head": head_before, "branch": branch, "detached": branch is None,
        "unborn": head_before is None, "upstream": upstream, "upstream_state": upstream_state,
        "remote_verified": False, "remote_evidence": "local_refs_only_no_network",
        "ahead": ahead, "behind": behind, "outgoing_commits": outgoing,
        "operations": operations, "conflicts": [item["path"] for item in changes if item["conflict"]],
        "counts": {"changed_paths": len(changes), "staged": sum(i["staged"] for i in changes),
                   "unstaged": sum(i["unstaged"] for i in changes),
                   "untracked": sum(i["untracked"] for i in changes), "by_xy": dict(counters)},
        "ignored_files_included": False, "stable_during_scan": bool(stable),
        "snapshot_id": snapshot_id, "index_sha256": index_before["sha256"], "changes": changes,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[4],
                        help="Repository or a directory inside it; defaults to this skill's vault")
    args = parser.parse_args(argv)
    try:
        report = inspect(args.repo.resolve())
    except (InspectionError, OSError, subprocess.TimeoutExpired) as error:
        message = str(error) if isinstance(error, InspectionError) else type(error).__name__
        print(json.dumps({"error": message}, ensure_ascii=False))
        return 2
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
    sys.exit(main())
