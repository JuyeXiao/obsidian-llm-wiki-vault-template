const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = path.resolve(__dirname, '../../..');
const helper = fs.readFileSync(path.join(root, 'SYSTEM/SCRIPTS/datacore_helpers.md'), 'utf8');
const source = helper.split('# Mail Box Helpers')[1].split(/```jsx\r?\n/)[1].split('```')[0];
const H = vm.runInNewContext('(function(){' + source + '})()', {
    dc: { luxon: { DateTime: { now: () => ({ toFormat: () => '2026-10-19T08:00' }) } } },
});
// Match the bundled Datacore FrontmatterEntry structure, including lowercased index keys.
const page = (fm = {}, $path = 'PARA/PROJECTS/Example.md') => ({
    $path,
    $frontmatter: Object.fromEntries(Object.entries(fm).map(([key, value]) => [key.toLowerCase(), { key, value, raw: value }])),
});
const apply = (fm, action) => { H.applyFrontmatterUpdates(fm, action.updates); return fm; };

test('ordinary, null, blank and unrelated status pages are not tasks', () => {
    for (const fm of [{}, { Status: null }, { Status: '' }, { status: 'draft' }, { meeting_status: null }, { meeting_status: false }]) {
        assert.equal(H.mailboxIncludes(page(fm), false), false, JSON.stringify(fm));
    }
    assert.equal(H.mailboxIncludes(page({Status: '2 In Progress'}), false), true);
    assert.equal(H.mailboxIncludes(page({file_state: 'unchecked_task'}), false), true);
    assert.equal(H.mailboxIncludes(page({meeting_status: false, scheduled_date: '2026-10-19'}), false), true);
});
test('excluded folders and hidden paths stay out; path input is literal text', () => {
    for (const folder of H.MAILBOX_EXCLUDED_FOLDERS) {
        assert.equal(H.mailboxIncludes(page({Status: '1 To Do'}, folder + '/Example.md'), false), false);
    }
    assert.equal(H.mailboxIncludes(page({Status: '1 To Do'}, '.claude/Example.md'), false), false);
    assert.equal(H.mailboxIncludes(page({Status: '1 To Do'}), false, 'PROJECTS'), true);
    assert.equal(H.mailboxIncludes(page({Status: '1 To Do'}), false, '") OR true'), false);
});
test('status tasks complete and restore prior state without changing key casing', () => {
    const fm = {Status: '2 In Progress', Notes: 'human'};
    apply(fm, H.getEntryUpdate(page(fm)));
    assert.equal(fm.Status, '4 Completed');
    assert.equal(fm.status, undefined);
    assert.equal(fm._previous_status, '2 In Progress');
    assert.equal(H.mailboxIncludes(page(fm), false), false);
    assert.equal(H.mailboxIncludes(page(fm), true), true);
    apply(fm, H.getEntryUpdate(page(fm)));
    assert.deepEqual(fm, {Status: '2 In Progress', Notes: 'human'});
});
test('page tasks round-trip and legacy closed-only tasks can be restored', () => {
    const fm = {File_State: 'unchecked_task', Notes: 'keep'};
    apply(fm, H.getEntryUpdate(page(fm)));
    assert.equal(fm.File_State, 'unchecked_task');
    assert.equal(H.isEntryChecked(page(fm)), true);
    apply(fm, H.getEntryUpdate(page(fm)));
    assert.deepEqual(fm, {File_State: 'unchecked_task', Notes: 'keep'});
    const legacy = {Closed: '2026-07-15T10:00'};
    apply(legacy, H.getEntryUpdate(page(legacy)));
    assert.deepEqual(legacy, {file_state: 'unchecked_task'});
});
test('meetings complete and restore; true status works without closed timestamp', () => {
    const fm = {Meeting_Status: false, Scheduled_Date: '2026-10-19'};
    apply(fm, H.getEntryUpdate(page(fm)));
    assert.equal(fm.Meeting_Status, true);
    assert.equal(H.isEntryChecked(page({Meeting_Status: true, Scheduled_Date: '2026-10-19'})), true);
    apply(fm, H.getEntryUpdate(page(fm)));
    assert.deepEqual(fm, {Meeting_Status: false, Scheduled_Date: '2026-10-19'});
    assert.equal(H.isEntryChecked(page({meeting_status: true, scheduled_date: '2026-10-19', file_state: 'unchecked_task'})), true);
});
test('deletion is case-insensitive; duplicate-case keys stop before any mutation', () => {
    const fm = {CLOSED: 'old', Status: '4 Completed'};
    H.applyFrontmatterUpdates(fm, {closed: undefined, status: '1 To Do'});
    assert.deepEqual(fm, {Status: '1 To Do'});
    const conflict = {Status: '1 To Do', status: '2 In Progress', Closed: 'old'};
    assert.throws(() => H.applyFrontmatterUpdates(conflict, {closed: undefined, status: '4 Completed'}), /Conflicting/);
    assert.deepEqual(conflict, {Status: '1 To Do', status: '2 In Progress', Closed: 'old'});
});
test('live frontmatter update preserves latest status and rejects stale completion state', async () => {
    const fm = {Status: '5 Blocked', note: 'latest'};
    const app = {vault: {getAbstractFileByPath: () => ({})}, fileManager: {processFrontMatter: async (_, update) => update(fm)}};
    const action = await H.toggleEntry(app, page({Status: '2 In Progress'}));
    assert.equal(action.icon, 'lucide-check-circle');
    assert.equal(fm._previous_status, '5 Blocked');
    assert.equal(fm.note, 'latest');
    await assert.rejects(H.toggleEntry(app, page({Status: '1 To Do'})), /state changed/);
    const missing = {vault: {getAbstractFileByPath: () => null}};
    await assert.rejects(H.toggleEntry(missing, page()), /no longer exists/);
});
test('pagination clamps after shrink/empty results and the view resets changed filters', () => {
    assert.equal(H.clampPage(5, 2), 2);
    assert.equal(H.clampPage(5, 0), 1);
    assert.equal(H.clampPage(-2, 3), 1);
    assert.equal(H.clampPage(NaN, 3), 1);
    const view = fs.readFileSync(path.join(root, 'HUB/Mail Box.md'), 'utf8');
    assert.match(view, /H\.mailboxIncludes\(entry, showCompleted, pathFilter\)/);
    assert.match(view, /const start = \(effectivePage - 1\) \* itemsPerPage/);
    assert.match(view, /setCurrentPage\(1\).*\[nameFilter, pathFilter, showCompleted, dateFilter/);
    assert.match(view, /setCurrentPage\(effectivePage\)/);
    assert.match(view, /key=\{entry\.\$path\}/);
    assert.match(view, /aria-label=\{isChecked \? 'Restore task'/);
    assert.match(view, /role="alert"/);
    assert.doesNotMatch(view, /OR status = null|OR meeting_status = null|isCompleted/);
});
