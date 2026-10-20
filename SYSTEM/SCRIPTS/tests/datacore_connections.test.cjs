const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = path.resolve(__dirname, '../../..');
const markdown = fs.readFileSync(path.join(root, 'SYSTEM/SCRIPTS/datacore_helpers.md'), 'utf8');
const source = markdown.slice(markdown.indexOf('function linkPath(c)'), markdown.indexOf('// Current PARA/ZETA page'));
const H = vm.runInNewContext(source + '\n({buildConnectionIndex, resolveConnectionTarget, connectionsInclude})', {}, { timeout: 1000 });
const raw = 'INBOX/raw/Clippings/Example.md';
const lit = 'ZETA/LITERATURE/Example.md';
const all = [raw, lit, 'ZETA/PERMANENT/Unique.md', 'PARA/AREAS/Neighbor.md', 'Other/Clippings/Example.md'].map($path => ({ $path }));
const index = H.buildConnectionIndex(all);
const page = value => ({ $path: 'PARA/AREAS/Source.md', value: () => value });

test('explicit literature path never matches same-named raw, including legacy calls', () => {
    for (const ix of [undefined, index]) {
        assert.equal(H.connectionsInclude(page('[[ZETA/LITERATURE/Example]]'), { $path: raw }, ix), false);
        assert.equal(H.connectionsInclude(page('[[ZETA/LITERATURE/Example]]'), { $path: lit }, ix), true);
    }
});
test('short names and suffixes require uniqueness across the entire vault', () => {
    assert.equal(H.resolveConnectionTarget('Unique', page().$path, index), 'ZETA/PERMANENT/Unique');
    assert.equal(H.resolveConnectionTarget('Example', page().$path, index), null);
    assert.equal(H.resolveConnectionTarget('LITERATURE/Example', page().$path, index), 'ZETA/LITERATURE/Example');
    assert.equal(H.resolveConnectionTarget('Clippings/Example', page().$path, index), null);
    assert.equal(H.connectionsInclude(page('Unique'), { $path: 'ZETA/PERMANENT/Unique.md' }), false);
});
test('aliases, anchors, link objects, extensions and backslashes retain identity', () => {
    for (const value of [`[[${raw}#Section|Display]]`, { path: raw + '#^block' }, { $path: raw.replaceAll('/', '\\') }]) {
        assert.equal(H.connectionsInclude(page([value]), { $path: raw }, index), true);
        assert.equal(H.connectionsInclude(page([value]), { $path: lit }, index), false);
    }
});
test('relative paths resolve from the referring page and cannot escape the vault', () => {
    assert.equal(H.resolveConnectionTarget('./Neighbor', page().$path, index), 'PARA/AREAS/Neighbor');
    assert.equal(H.resolveConnectionTarget('../../ZETA/PERMANENT/Unique', page().$path, index), 'ZETA/PERMANENT/Unique');
    assert.equal(H.resolveConnectionTarget('../../../ZETA/PERMANENT/Unique', page().$path, index), null);
});
test('missing, external, malformed and wrong-case targets never match', () => {
    for (const target of ['', null, 'Missing', '/ZETA/PERMANENT/Unique', 'https://example.com', 'C:/Example', 'zeta/PERMANENT/Unique', 'ZETA//PERMANENT/Unique']) {
        assert.equal(H.resolveConnectionTarget(target, page().$path, index), null);
    }
});
test('root basename collisions and display aliases do not defeat ambiguity checks', () => {
    const ix = H.buildConnectionIndex([...all, all[0], { $path: 'Example.md' }, { $path: 'Alias.md', value: () => ['Unique'] }]);
    assert.equal(ix.exact.size, all.length + 2);
    assert.equal(H.resolveConnectionTarget('Example', 'PARA/Source.md', ix), null);
    assert.equal(H.resolveConnectionTarget('../Example', 'PARA/Source.md', ix), 'Example');
    assert.equal(H.resolveConnectionTarget('Unique', 'PARA/Source.md', ix), 'ZETA/PERMANENT/Unique');
});
test('AreaDashboard and all backlink templates build one complete-page index', () => {
    const area = markdown.slice(markdown.indexOf('function AreaDashboard()'), markdown.indexOf('function RelatedWiki()'));
    assert.match(area, /allConnectionPages = dc\.useQuery\('@page'\)/);
    assert.equal((area.match(/buildConnectionIndex\(allConnectionPages\)/g) || []).length, 1);
    assert.equal((area.match(/connectionsInclude\(p, current, connectionIndex\)/g) || []).length, 2);
    const folder = path.join(root, 'SYSTEM/TEMPLATE/FORMAT');
    for (const file of fs.readdirSync(folder).filter(f => f.endsWith('.md'))) {
        const content = fs.readFileSync(path.join(folder, file), 'utf8');
        assert.doesNotMatch(content, /optionQuery\(#(?:permanent_note|literature_note|fleeting_note|area|project|contact)/, file);
        if (content.includes('H.connectionsInclude(')) {
            assert.match(content, /H\.buildConnectionIndex\(all\)/, file);
            assert.match(content, /H\.connectionsInclude\(p, current, connectionIndex\)/, file);
            assert.match(content, /\[all, current, connectionIndex\]/, file);
        }
        for (const selector of content.matchAll(/INPUT\[inlineListSuggester\([^\n]+:(?:connections|attendees)\]/g)) {
            assert.match(selector[0], /useLinks\(true\)/, file);
        }
    }
});
