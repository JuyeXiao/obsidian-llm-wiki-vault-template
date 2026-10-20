#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate the Claude mirror from .agents/skills; check-only unless --write."""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path


IGNORED_DIRS = {"__pycache__"}
IGNORED_SUFFIXES = {".pyc", ".pyo"}


def included_files(root: Path) -> dict[Path, Path]:
    """Return relative -> absolute files, excluding runtime caches."""
    files: dict[Path, Path] = {}
    for path in root.rglob("*"):
        relative = path.relative_to(root)
        if any(part in IGNORED_DIRS for part in relative.parts):
            continue
        if path.is_file() and path.suffix not in IGNORED_SUFFIXES:
            files[relative] = path
    return files


def compare_trees(source: Path, mirror: Path) -> list[str]:
    source_files = included_files(source)
    mirror_files = included_files(mirror) if mirror.exists() else {}
    problems: list[str] = []

    for relative in sorted(source_files.keys() - mirror_files.keys()):
        problems.append(f"Missing mirror file: {relative.as_posix()}")
    for relative in sorted(mirror_files.keys() - source_files.keys()):
        problems.append(f"Extra mirror file: {relative.as_posix()}")
    for relative in sorted(source_files.keys() & mirror_files.keys()):
        if source_files[relative].read_bytes() != mirror_files[relative].read_bytes():
            problems.append(f"Mirror differs: {relative.as_posix()}")
    return problems


def sync_trees(source: Path, mirror: Path) -> None:
    source_files = included_files(source)
    mirror.mkdir(parents=True, exist_ok=True)
    mirror_files = included_files(mirror)

    for relative, source_path in sorted(source_files.items()):
        target = mirror / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        if not target.exists() or source_path.read_bytes() != target.read_bytes():
            shutil.copy2(source_path, target)

    for relative in sorted(mirror_files.keys() - source_files.keys(), reverse=True):
        (mirror / relative).unlink()

    directories = sorted(
        (path for path in mirror.rglob("*") if path.is_dir()),
        key=lambda path: len(path.parts),
        reverse=True,
    )
    for directory in directories:
        if directory.name in IGNORED_DIRS:
            continue
        try:
            directory.rmdir()
        except OSError:
            pass


def resolve_roots(vault: Path) -> tuple[Path, Path]:
    vault = vault.resolve()
    source = (vault / ".agents" / "skills").resolve()
    mirror = (vault / ".claude" / "skills").resolve()
    if source.parent.parent != vault or mirror.parent.parent != vault:
        raise ValueError("Skill directories must stay inside the specified vault")
    if not source.is_dir():
        raise ValueError(f"Missing skill source: {source}")
    return source, mirror


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--vault", type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument("--write", action="store_true", help="Write the Claude mirror; default is check-only")
    args = parser.parse_args(argv)

    try:
        source, mirror = resolve_roots(args.vault)
        if args.write:
            sync_trees(source, mirror)
        problems = compare_trees(source, mirror)
    except (OSError, ValueError) as error:
        print(f"ERROR {error}")
        return 2

    if problems:
        for problem in problems:
            print(f"FAIL {problem}")
        print("Run python SYSTEM/SCRIPTS/sync_agent_skills.py --write to regenerate.")
        return 1

    print(f"OK Claude skill mirror matches ({len(included_files(source))} files)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
