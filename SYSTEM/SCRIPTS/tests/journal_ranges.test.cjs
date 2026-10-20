const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const root = path.resolve(__dirname, '../../..');
const helper = fs.readFileSync(path.join(root, 'SYSTEM/SCRIPTS/datacore_helpers.md'), 'utf8');
const code = helper.slice(helper.indexOf('function journalRangesOverlap('), helper.indexOf('function useJournalRange()'));
const overlap = vm.runInNewContext(code + '\njournalRangesOverlap');
const day = iso => ({isValid: true, valueOf: () => Date.parse(iso)});
test('monthly range includes cross-month and cross-year weeks without including disjoint weeks', () => {
    assert.equal(overlap(day('2026-09-28'), day('2026-10-04'), day('2026-10-01'), day('2026-10-31')), true);
    assert.equal(overlap(day('2026-12-28'), day('2027-01-03'), day('2027-01-01'), day('2027-01-31')), true);
    assert.equal(overlap(day('2026-09-21'), day('2026-09-27'), day('2026-10-01'), day('2026-10-31')), false);
    assert.equal(overlap(day('2026-10-04'), day('2026-09-28'), day('2026-10-01'), day('2026-10-31')), false);
    assert.equal(overlap(null, day('2026-10-04'), day('2026-10-01'), day('2026-10-31')), false);
    assert.equal(overlap({isValid: false}, day('2026-10-04'), day('2026-10-01'), day('2026-10-31')), false);
});
test('journal range rejects missing, invalid, trailing-text and inverted metadata', () => {
    const hook = helper.slice(helper.indexOf('function useJournalRange()'), helper.indexOf('// Link / tag helpers'));
    const parsed = iso => /^\d{4}-\d{2}-\d{2}$/.test(iso) ? {
        ...day(iso), startOf() { return this; }, endOf() { return this; },
    } : null;
    const range = (start, end) => vm.runInNewContext(hook + '\nuseJournalRange()', {
        dc: {
            useCurrentFile: () => ({ value: key => key === 'journal-start-date' ? start : end }),
            useMemo: fn => fn(), coerce: { date: parsed },
        },
    });
    assert.equal(range('2026-09-28', '2026-10-04').ok, true);
    for (const [start, end] of [[null, '2026-10-04'], ['invalid', '2026-10-04'],
        ['2026-09-28 invalid', '2026-10-04'], ['2026-10-04', '2026-09-28']]) {
        assert.equal(range(start, end).ok, false);
    }
});
test('period templates use metadata and the shared range contract', () => {
    const daily = fs.readFileSync(path.join(root, 'SYSTEM/TEMPLATE/FORMAT/template_daily_note.md'), 'utf8');
    const monthly = fs.readFileSync(path.join(root, 'SYSTEM/TEMPLATE/FORMAT/template_monthly_note.md'), 'utf8');
    assert.match(daily, /noteDate = H\.toDay\(current\.value\("journal-start-date"\)\)/);
    assert.match(monthly, /H\.journalRangesOverlap\(start, end, range.start, range.end\)/);
    assert.doesNotMatch(monthly, /monthRef|day.month !==/);
});
