"""Read-only contracts for the compact distribution and its native replacements."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[3]
RETAINED = {
    'datacore', 'dataview', 'obsidian-meta-bind-plugin', 'templater-obsidian',
    'journals', 'quickadd', 'note-toolbar', 'homepage', 'custom-sort',
    'iconic', 'obsidian-banners', 'obsidian-style-settings',
}


def load(relative):
    return json.loads((ROOT / relative).read_text(encoding='utf-8-sig'))


class PluginBundleTests(unittest.TestCase):
    def test_programs_enabled_list_and_license_inventory_agree(self):
        plugins = ROOT / '.obsidian/plugins'
        self.assertEqual({p.name for p in plugins.iterdir() if p.is_dir() and any(p.iterdir())}, RETAINED)
        enabled = load('.obsidian/community-plugins.json')
        self.assertEqual(set(enabled), RETAINED)
        self.assertEqual(len(enabled), len(RETAINED))
        inventory = load('SYSTEM/DOCS/plugin-licenses.json')['plugins']
        self.assertEqual({p['id'] for p in inventory}, RETAINED)
        for record in inventory:
            with self.subTest(plugin=record['id']):
                folder = plugins / record['id']
                self.assertTrue((folder / 'main.js').is_file())
                self.assertEqual(load((folder / 'manifest.json').relative_to(ROOT))['version'],
                                 record['version'])
                self.assertTrue((ROOT / record['license_file']).is_file())
                self.assertTrue((ROOT / record['notice_file']).is_file())

    def test_command_providers_exist_and_native_search_is_enabled(self):
        core = load('.obsidian/core-plugins.json')
        providers = RETAINED | {k for k, enabled in core.items() if enabled} | {'app', 'editor', 'workspace', 'theme'}
        commands = set(load('.obsidian/hotkeys.json'))
        for bar in load('.obsidian/plugins/note-toolbar/data.json')['toolbars']:
            for item in bar['items']:
                command = item.get('linkAttr', {}).get('commandId')
                if command:
                    commands.add(command)
        quickadd_choices = set()
        def collect(value):
            if isinstance(value, dict):
                if value.get('command') is True and value.get('id'):
                    quickadd_choices.add('quickadd:choice:' + value['id'])
                if value.get('commandId'):
                    commands.add(value['commandId'])
                for child in value.values():
                    collect(child)
            elif isinstance(value, list):
                for child in value:
                    collect(child)
        collect(load('.obsidian/plugins/quickadd/data.json'))
        self.assertEqual({c.split(':')[0] for c in commands} - providers, set())
        self.assertEqual({c for c in commands if c.startswith('quickadd:choice:')} - quickadd_choices, set())
        for key in ('global-search', 'switcher', 'file-explorer'):
            self.assertTrue(core[key])
        keys = load('.obsidian/hotkeys.json')
        self.assertEqual(keys['global-search:open'], [{'modifiers': ['Mod', 'Shift'], 'key': 'F'}])
        self.assertEqual(keys['switcher:open'], [{'modifiers': ['Mod', 'Shift'], 'key': 'S'}])

    def test_retired_timeline_has_a_working_destination(self):
        folder = ROOT / 'SYSTEM/TEMPLATE/CSS/Timeline'
        self.assertFalse((folder / 'view.js').exists())
        self.assertFalse((folder / 'view.css').exists())
        self.assertIn('[[HUB/Mail Box|Mail Box]]', (folder / 'Tasks Manager.md').read_text('utf-8'))
        self.assertTrue((ROOT / 'HUB/Mail Box.md').is_file())


if __name__ == '__main__':
    unittest.main()
