"""Isolated real Git regressions; writes only temporary directories, no network or real vault index. Unicode fixture names deliberately test NUL-safe path handling."""

import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

import inspect_git


class InspectGitTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="vault-git-test-")
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name).resolve()
        self.repo = self.base / "vault"
        self.repo.mkdir()
        environment = {"GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": os.devnull,
                       "GIT_TERMINAL_PROMPT": "0"}
        self.env_patch = patch.dict(os.environ, environment)
        self.env_patch.start()
        self.addCleanup(self.env_patch.stop)
        self.run_git("init", "--initial-branch=main")
        self.configure(self.repo)

    def run_git(self, *args, repo=None, ok=True):
        result = subprocess.run(["git", *args], cwd=repo or self.repo,
                                capture_output=True, timeout=30)
        if ok and result.returncode:
            self.fail(result.stderr.decode("utf-8", errors="replace"))
        return result

    def configure(self, repo):
        self.run_git("config", "user.name", "Local Fixture", repo=repo)
        self.run_git("config", "user.email", "test@example.invalid", repo=repo)
        self.run_git("config", "core.autocrlf", "false", repo=repo)
        self.run_git("config", "core.hooksPath", str(self.base / "no-hooks"), repo=repo)

    def write(self, name, content, repo=None):
        path = (repo or self.repo) / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8", newline="\n")
        return path

    def commit(self, name="note.md", content="初始\n", repo=None):
        self.write(name, content, repo=repo)
        self.run_git("--literal-pathspecs", "add", "--", name, repo=repo)
        self.run_git("commit", "-m", "Fixture commit", repo=repo)

    def report(self):
        return inspect_git.inspect(self.repo)

    def bare_remote(self):
        self.commit()
        remote = self.base / "remote.git"
        self.run_git("init", "--bare", "--initial-branch=main", str(remote))
        self.run_git("remote", "add", "origin", str(remote))
        self.run_git("push", "--no-follow-tags", "-u", "origin", "HEAD:refs/heads/main")
        return remote

    def test_unborn_no_upstream_and_detached(self):
        report = self.report()
        self.assertTrue(report["unborn"])
        self.assertEqual(report["branch"], "main")
        self.assertIsNone(report["ahead"])
        self.assertIsNone(report["outgoing_commits"])
        self.commit()
        self.run_git("checkout", "--detach")
        report = self.report()
        self.assertTrue(report["detached"])
        self.assertFalse(report["unborn"])
        self.assertIsNone(report["upstream"])

    def test_paths_staged_unstaged_deleted_and_ignored(self):
        name = "中文 空格/[草稿] $记录.md"
        self.commit(name)
        self.commit("删除.md")
        self.write(name, "暂存版本\n")
        self.run_git("--literal-pathspecs", "add", "--", name)
        oid = self.run_git("rev-parse", ":" + name).stdout.decode().strip()
        self.write(name, "继续编辑\n")
        (self.repo / "删除.md").unlink()
        self.write("未跟踪 子目录/新笔记.md", "新内容")
        self.write(".gitignore", "ignored/\n")
        self.write("ignored/secret.txt", "不应报告其内容")
        index = (self.repo / ".git/index").read_bytes()
        report = self.report()
        entries = {item["path"]: item for item in report["changes"]}
        self.assertNotIn("ignored/secret.txt", entries)
        self.assertEqual(entries[name]["xy"], "MM")
        self.assertEqual(entries[name]["index_entries"][0]["oid"], oid)
        self.assertEqual(entries[name]["index_entries"][0]["size_bytes"], len("暂存版本\n".encode()))
        self.assertEqual(entries[name]["worktree"]["sha256"], hashlib.sha256("继续编辑\n".encode()).hexdigest())
        self.assertEqual(entries["删除.md"]["xy"], " D")
        self.assertEqual(report["counts"]["staged"], 1)
        self.assertEqual(report["counts"]["unstaged"], 2)
        self.assertEqual(report["counts"]["untracked"], 2)
        self.assertEqual(index, (self.repo / ".git/index").read_bytes())
        self.assertTrue(report["stable_during_scan"])

    def test_rename_then_edit_keeps_both_paths(self):
        self.commit("旧 文件.md")
        self.run_git("mv", "--", "旧 文件.md", "新 文件.md")
        self.write("新 文件.md", "再写\n")
        item = self.report()["changes"][0]
        self.assertEqual(item["xy"], "RM")
        self.assertEqual(item["path"], "新 文件.md")
        self.assertEqual(item["original_path"], "旧 文件.md")
        self.assertEqual(item["original_worktree"]["kind"], "missing")

    def test_snapshots_detect_same_status_new_content(self):
        self.commit()
        self.write("note.md", "第一次")
        first = self.report()
        self.assertEqual(first["snapshot_id"], self.report()["snapshot_id"])
        self.write("note.md", "第二次")
        second = self.report()
        self.assertEqual(first["counts"], second["counts"])
        self.assertNotEqual(first["snapshot_id"], second["snapshot_id"])

    def test_edit_during_scan_marks_snapshot_unstable(self):
        self.commit()
        path = self.write("note.md", "扫描开始")
        original = inspect_git.fingerprint
        calls = 0

        def edit_after_first_read(candidate):
            nonlocal calls
            result = original(candidate)
            if candidate == path:
                calls += 1
                if calls == 1:
                    path.write_text("扫描途中再写入", encoding="utf-8")
            return result

        with patch.object(inspect_git, "fingerprint", side_effect=edit_after_first_read):
            self.assertFalse(self.report()["stable_during_scan"])

    def test_merge_conflicts_and_lock_are_reported_without_repair(self):
        self.commit()
        self.run_git("checkout", "-b", "side")
        self.commit(content="另一路\n")
        self.run_git("checkout", "main")
        self.commit(content="主分支\n")
        self.assertNotEqual(self.run_git("merge", "side", ok=False).returncode, 0)
        lock = self.repo / ".git/index.lock"
        lock.write_bytes(b"held-by-another-process")
        report = self.report()
        self.assertEqual(report["conflicts"], ["note.md"])
        self.assertIn("MERGE_HEAD", report["operations"])
        self.assertIn("index.lock", report["operations"])
        self.assertEqual(lock.read_bytes(), b"held-by-another-process")
        self.assertEqual(len(report["changes"][0]["index_entries"]), 3)

    def test_local_push_outgoing_commits_and_idempotent_inspection(self):
        remote = self.bare_remote()
        self.commit("后来.md")
        before = self.report()
        self.assertEqual((before["ahead"], before["behind"]), (1, 0))
        self.assertEqual(len(before["outgoing_commits"]), 1)
        self.assertFalse(before["remote_verified"])
        self.run_git("push", "--no-follow-tags", "origin", before["head"] + ":refs/heads/main")
        remote_sha = self.run_git("ls-remote", str(remote), "refs/heads/main").stdout.split()[0].decode()
        self.assertEqual(before["head"], remote_sha)
        after = self.report()
        self.assertEqual((after["ahead"], after["behind"]), (0, 0))
        self.assertEqual(after["outgoing_commits"], [])
        self.assertEqual(after["snapshot_id"], self.report()["snapshot_id"])

    def test_stale_upstream_then_behind_and_divergence(self):
        remote = self.bare_remote()
        other = self.base / "other"
        self.run_git("clone", str(remote), str(other))
        self.configure(other)
        self.commit("远端.md", repo=other)
        self.run_git("push", "origin", "HEAD:refs/heads/main", repo=other)
        stale = self.report()
        self.assertEqual(stale["behind"], 0)
        self.assertFalse(stale["remote_verified"])
        self.run_git("fetch", "--no-tags", "origin")
        behind = self.report()
        self.assertEqual((behind["ahead"], behind["behind"]), (0, 1))
        self.commit("本地.md")
        diverged = self.report()
        self.assertEqual((diverged["ahead"], diverged["behind"]), (1, 1))
        self.assertNotEqual(self.run_git("push", "origin", "HEAD:refs/heads/main", ok=False).returncode, 0)
        self.assertEqual(diverged["head"], self.report()["head"])

    def test_missing_upstream_is_unknown_not_zero(self):
        self.bare_remote()
        self.run_git("update-ref", "-d", "refs/remotes/origin/main")
        report = self.report()
        self.assertEqual(report["upstream_state"], "missing_local_ref")
        self.assertIsNone(report["ahead"])
        self.assertIsNone(report["outgoing_commits"])

    def test_cli_and_repo_from_nested_directory(self):
        self.commit()
        nested = self.repo / "sub"
        nested.mkdir()
        script = Path(inspect_git.__file__).resolve()
        result = subprocess.run([sys.executable, str(script), "--repo", str(nested)],
                                capture_output=True, timeout=30)
        self.assertEqual(result.returncode, 0)
        report = json.loads(result.stdout)
        self.assertEqual(Path(report["repo_root"]), self.repo)
        failed = subprocess.run([sys.executable, str(script), "--repo", str(self.base)],
                                capture_output=True, timeout=30)
        self.assertEqual(failed.returncode, 2)
        self.assertIn("error", json.loads(failed.stdout))


if __name__ == "__main__":
    unittest.main()
