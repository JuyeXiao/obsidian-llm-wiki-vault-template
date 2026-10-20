const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const source = fs.readFileSync(path.join(root, 'SYSTEM/SCRIPTS/permanent_moc_helpers.md'), 'utf8').match(/```js\r?\n([\s\S]*?)\r?\n```/)[1];
const P = new Function(source)();

test('viewpoint filters use actual markers, never infer confirmation from absence', () => {
  assert.equal(P.viewpointStatus('> [!todo] Personal viewpoint pending\n> AI candidate'), 'Personal viewpoint pending');
  assert.equal(P.viewpointStatus('> [!question] Open question'), 'Open question');
  assert.equal(P.viewpointStatus('```md\n> [!todo] Personal viewpoint pending\n```'), 'Unmarked');
  assert.equal(P.viewpointStatus('<!-- > [!todo] Personal viewpoint pending -->'), 'Unmarked');
  assert.equal(P.viewpointStatus('A finished-looking note.'), 'Unmarked');
});

test('marker cache refreshes changed notes, retries failed reads and rejects stale async completion', async () => {
  let calls = 0;
  const file = {path:'note.md',stat:{mtime:1,size:1}};
  const cache = P.createStatusCache(async () => { calls++; return '> [!todo] Personal viewpoint pending'; });
  assert.equal(cache.peek(file.path),'Loading');
  await cache.load(file); await cache.load(file);
  assert.equal(calls,1);
  file.stat.mtime++;
  await cache.load(file); assert.equal(calls,2);
  let resolveOld;
  const race = P.createStatusCache(f => f.stat.mtime===1 ? new Promise(resolve=>{resolveOld=resolve;}) : 'no marker');
  const first=race.load({path:'note.md',stat:{mtime:1,size:1}});
  await Promise.resolve();
  await race.load({path:'note.md',stat:{mtime:2,size:1}});
  resolveOld('> [!todo] Personal viewpoint pending'); await first;
  assert.equal(race.peek('note.md'),'Unmarked');
  const failed=P.createStatusCache(()=>Promise.reject(new Error('read')));
  await failed.load(file);
  assert.equal(failed.peek(file.path),'Read failed'); assert.equal(failed.needsRead(file),true);
  cache.prune(new Set()); assert.equal(cache.peek(file.path),'Loading');
});

test('search combines title/summary/keywords with topic and marker; pagination resets and clamps', () => {
  const rows=Array.from({length:23},(_,i)=>({title:'Note '+i,hay:'note '+i+' reuse idea',topics:['Productivity'],status:i%2?'Unmarked':'Personal viewpoint pending',modified:'2026-01-01'}));
  assert.equal(P.filterRows(rows,'REUSE idea','Productivity','Unmarked','title').length,11);
  assert.equal(P.filterRows(rows,'reuse','Data','','title').length,0);
  assert.equal(P.pageWindow(rows,{token:'old',page:2},'new').page,0);
  assert.equal(P.pageWindow(rows.slice(0,2),{token:'same',page:2},'same').page,0);
  assert.equal(P.pageWindow([], {token:'x',page:7},'x').shown.length,0);
  assert.equal(P.pageWindow(rows,{token:'x',page:2},'x').shown.length,3);
});

test('MOC wires real reads, five-way navigation and native accessible controls without private batch data', () => {
  const moc=fs.readFileSync(path.join(root,'HUB/MOC/Permanent MOC.md'),'utf8');
  assert.match(moc,/cachedRead/); assert.match(moc,/aria-label="Filter by actual viewpoint marker"/);
  assert.match(moc,/aria-pressed/); assert.match(moc,/paging=\{false\}/);
  assert.doesNotMatch(moc,/BATCH_PATHS|\.planning/);
});
