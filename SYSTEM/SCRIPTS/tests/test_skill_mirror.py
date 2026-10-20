"""Mirror generation is tested only in temporary vaults."""
import importlib.util
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[3]
spec = importlib.util.spec_from_file_location('sync_skills', ROOT / 'SYSTEM/SCRIPTS/sync_agent_skills.py')
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


class MirrorTests(unittest.TestCase):
    def test_check_is_read_only_and_write_repairs_missing_different_extra_files(self):
        with tempfile.TemporaryDirectory() as temp:
            vault = Path(temp)
            source = vault / '.agents/skills'
            mirror = vault / '.claude/skills'
            for folder in (source / 'sample/scripts', mirror / 'sample', mirror / 'retired'):
                folder.mkdir(parents=True)
            (source / 'sample/SKILL.md').write_bytes(b'Original skill\n')
            (source / 'sample/scripts/run.py').write_bytes(b'print("fixture")\n')
            (mirror / 'sample/SKILL.md').write_bytes(b'Stale\n')
            (mirror / 'retired/SKILL.md').write_bytes(b'Extra\n')
            (source / 'sample/scripts/__pycache__').mkdir()
            (source / 'sample/scripts/__pycache__/run.pyc').write_bytes(b'cache')
            before = {p: p.read_bytes() for p in mirror.rglob('*') if p.is_file()}
            self.assertEqual(len(sync.compare_trees(source, mirror)), 3)
            self.assertEqual({p: p.read_bytes() for p in mirror.rglob('*') if p.is_file()}, before)
            self.assertEqual(sync.resolve_roots(vault), (source, mirror))
            sync.sync_trees(source, mirror)
            self.assertEqual(sync.compare_trees(source, mirror), [])
            self.assertFalse((mirror / 'retired').exists())
            self.assertFalse((mirror / 'sample/scripts/__pycache__').exists())
            self.assertEqual((source / 'sample/SKILL.md').read_bytes(), b'Original skill\n')
            stamp = (mirror / 'sample/SKILL.md').stat().st_mtime_ns
            sync.sync_trees(source, mirror)
            self.assertEqual((mirror / 'sample/SKILL.md').stat().st_mtime_ns, stamp)

    def test_missing_source_fails_instead_of_erasing_mirror(self):
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaises(ValueError):
                sync.resolve_roots(Path(temp))


if __name__ == '__main__':
    unittest.main()
