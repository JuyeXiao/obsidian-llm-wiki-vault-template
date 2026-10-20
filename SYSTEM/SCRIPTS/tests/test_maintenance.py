"""Small fixture-only regressions; never write real raw/wiki/journals."""
import hashlib
from contextlib import contextmanager
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import time
import unittest

ROOT = Path(__file__).resolve().parents[3]


def load(name, relative):
    spec = importlib.util.spec_from_file_location(name, ROOT / relative)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


docs = load('doc_lint', '.agents/skills/doc-lint/scripts/doc-lint.py')


def hashes(root):
    return {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in root.rglob('*') if p.is_file()}


@contextmanager
def shell_fixture():
    temp = tempfile.TemporaryDirectory()
    try:
        yield temp.name
    finally:
        # WSL can briefly retain its Windows cwd after the child exits.
        for attempt in range(10):
            try:
                temp.cleanup()
                break
            except PermissionError:
                if attempt == 9:
                    raise
                time.sleep(0.2)


# The three batch-1 Wiki regressions now run in wiki-lint.test.js against the shared engine.


class ConfigTests(unittest.TestCase):
    def test_current_configs_and_journal_anchors(self):
        self.assertEqual(docs.check_config_targets(), [])
        self.assertEqual(docs.check_journal_contracts(), [])

    def test_missing_input_is_detected_and_dynamic_output_folders_are_allowed(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            configs = {
                'templater-obsidian': {'folder_templates': [{'folder': 'Created/on/demand', 'template': 'SYSTEM/missing.md'}]},
                'quickadd': {'choices': [{'templatePath': 'SYSTEM/exists.md', 'folder': {'folders': ['Created/later']}}]},
                'journals': {'journals': {}}, 'homepage': {'homepages': {}}, 'custom-sort': {},
            }
            for name, data in configs.items():
                p = root / '.obsidian/plugins' / name / 'data.json'
                p.parent.mkdir(parents=True)
                p.write_text(json.dumps(data), encoding='utf-8')
            (root / '.obsidian/community-plugins.json').write_text('[]', encoding='utf-8')
            (root / 'SYSTEM').mkdir()
            (root / 'SYSTEM/exists.md').write_text('template', encoding='utf-8')
            previous = docs.VAULT
            try:
                docs.VAULT = root
                problems = docs.check_config_targets()
            finally:
                docs.VAULT = previous
            self.assertEqual(problems, ['templater.folder_templates[0].template: referenced input file is missing'])


class TagLintTests(unittest.TestCase):
    def test_lint_keeps_stale_flat_and_log_untouched(self):
        bash = shutil.which('bash')
        self.assertIsNotNone(bash, 'Bash is required for the existing tag-lint workflow')
        with shell_fixture() as temp:
            root = Path(temp)
            scripts = root / '.agents/skills/tag-lint/scripts'
            scripts.mkdir(parents=True)
            for name in ('tag-lint.sh', 'build-taglist.sh'):
                shutil.copyfile(ROOT / '.agents/skills/tag-lint/scripts' / name, scripts / name)
            for folder in ('SYSTEM/TAGS', 'PARA', 'ZETA', 'INBOX/raw'):
                (root / folder).mkdir(parents=True, exist_ok=True)
            (root / 'SYSTEM/TAGS/tag-library.md').write_text('## topic/\n- **topic/data/sql**\n', encoding='utf-8')
            (root / 'SYSTEM/TAGS/tag-library.flat.txt').write_text('stale-content\n', encoding='utf-8')
            (root / 'SYSTEM/TAGS/tag-log.md').write_text('human log\n', encoding='utf-8')
            (root / 'PARA/Example.md').write_text('---\ntags: [topic/data/sql]\nkeywords: [query]\nsummary: example\n---\n', encoding='utf-8')
            before = hashes(root)
            result = subprocess.run([bash, '.agents/skills/tag-lint/scripts/tag-lint.sh'], cwd=root,
                                    capture_output=True, encoding='utf-8')
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertIn('drift count: 0', result.stdout)
            self.assertEqual(hashes(root), before)
            (root / 'PARA/Example.md').write_text('---\ntags: [topic/unknown/leaf]\n---\n', encoding='utf-8')
            before = hashes(root)
            result = subprocess.run([bash, '.agents/skills/tag-lint/scripts/tag-lint.sh'], cwd=root,
                                    capture_output=True, encoding='utf-8')
            self.assertEqual(result.returncode, 1, result.stderr)
            self.assertIn('drift count: 1', result.stdout)
            self.assertEqual(hashes(root), before)


if __name__ == '__main__':
    unittest.main()
