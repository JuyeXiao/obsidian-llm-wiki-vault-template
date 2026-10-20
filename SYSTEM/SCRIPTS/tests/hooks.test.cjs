const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = path.resolve(__dirname, '../../..');
const {extractEditedPaths, validatePayload} = require('../validate-vault-write.js');

function fixture(t) {
  const vault = fs.mkdtempSync(path.join(os.tmpdir(), 'public-hook-'));
  t.after(() => fs.rmSync(vault, {recursive:true,force:true,maxRetries:10,retryDelay:100}));
  const write = (p, text) => { const target=path.join(vault,p); fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,text); };
  write('PARA/Valid.md','---\ntags: [topic/data/sql]\nkeywords: [query]\nsummary: Original fixture.\n---\nBody');
  write('PARA/Invalid.md','---\ntags: [topic/unknown/leaf]\n---\nBody');
  write('SYSTEM/TAGS/tag-library.flat.txt','topic/data/sql\n');
  write('INBOX/raw/Clippings/Example.md','Original source');
  write('ZETA/LITERATURE/Example.md','Same title');
  write('INBOX/wiki/Data/Concept.md','---\ntitle: Concept\ntype: wiki_concept\ncategory: Data\ntags: [wiki/Data]\nsource_count: 1\ncreated: 2026-01-01\nupdated: 2026-01-01\nstatus: draft\n---\n## Sources\n- [[INBOX/raw/Clippings/Example]]\n');
  return {vault,write};
}

test('write payload extraction covers Write/Edit and structured/freeform apply_patch moves', () => {
  assert.deepEqual(extractEditedPaths({tool_input:{file_path:'PARA/X.md'}}), ['PARA/X.md']);
  const patch='*** Begin Patch\n*** Update File: PARA/Old.md\n*** Move to: PARA/New.md\n*** Add File: ZETA/New.md\n*** End Patch';
  for (const tool_input of [patch,{patch},{input:patch},{command:patch}]) {
    assert.deepEqual(extractEditedPaths({tool_input}),['PARA/Old.md','PARA/New.md','ZETA/New.md']);
  }
});

test('shared hook checks English sources, full-vault ambiguity, note fields and exemptions read-only', t => {
  const {vault,write}=fixture(t);
  const check=p=>validatePayload({tool_name:'Write',cwd:vault,tool_input:{file_path:p}},vault);
  assert.deepEqual(check('PARA/Valid.md'),[]);
  assert.match(check('PARA/Invalid.md').join('\n'),/missing keywords/);
  assert.match(check('PARA/Invalid.md').join('\n'),/tag drift/);
  const wiki='INBOX/wiki/Data/Concept.md';
  assert.deepEqual(check(wiki),[]);
  const valid=fs.readFileSync(path.join(vault,wiki),'utf8');
  write(wiki,valid.replace('INBOX/raw/Clippings/Example','Example'));
  assert.match(check(wiki).join('\n'),/ambiguous across the vault/);
  write(wiki,valid.replace('## Sources','## 来源'));
  assert.ok(check(wiki).length);
  for (const p of ['INBOX/raw/Clippings/Example.md','ZETA/FLEETING/Capture.md','PARA/WORKSTATION/Capture.md','ZETA/PERMANENT/Sketch.excalidraw.md']) {
    write(p,'No metadata'); assert.deepEqual(check(p),[]);
    assert.equal(fs.readFileSync(path.join(vault,p),'utf8'),'No metadata');
  }
  assert.deepEqual(check('../outside.md'),[]);
  assert.match(validatePayload({tool_name:'apply_patch',tool_input:{}},vault).join(''),/did not run/);
  assert.deepEqual(validatePayload({tool_name:'Edit',cwd:path.join(vault,'PARA'),tool_input:{path:'Valid.md'}},vault),[]);
});

test('both configured hook commands launch from root and nested Git directories and preserve written bytes', t => {
  const {vault,write}=fixture(t);
  const env={...process.env,PYTHONDONTWRITEBYTECODE:'1'};
  for(const key of ['GIT_DIR','GIT_WORK_TREE','GIT_INDEX_FILE','GIT_COMMON_DIR']) delete env[key];
  // Windows' system bash.exe can be WSL, with a different Node/Python PATH.
  const gitExe = process.platform === 'win32' ? spawnSync('where.exe',['git'],{encoding:'utf8'}).stdout.trim().split(/\r?\n/)[0] : '';
  const shells = process.platform === 'win32'
    ? [[path.resolve(path.dirname(gitExe),'../bin/bash.exe'),'-c'],['pwsh','-NoProfile','-NonInteractive','-Command']]
    : [['bash','-c']];
  assert.equal(spawnSync('git',['init','--quiet',vault],{env}).status,0);
  for (const rel of ['SYSTEM/SCRIPTS/validate-vault-write.js','.codex/hooks/validate-vault-write.js','.claude/hooks/validate-vault-write.py',
      ...['wiki-graph.js','wiki-contract.js','wiki-state.js'].map(n=>'.agents/skills/wiki-lint/scripts/'+n)]) write(rel,fs.readFileSync(path.join(root,rel)));
  for(const [config,names] of [['.codex/hooks.json',['Write','Edit','apply_patch']],['.claude/settings.json',['Write','Edit']]]) {
    const entries=JSON.parse(fs.readFileSync(path.join(root,config),'utf8')).hooks.PostToolUse;
    for(const name of names) assert.ok(entries.some(e=>new RegExp('^(?:'+e.matcher+')$').test(name)), name+' matcher missing');
    const command=entries[0].hooks[0].command;
    for(const shell of shells) for(const cwd of [vault,path.join(vault,'PARA')]) for(const [file,code] of [['PARA/Valid.md',0],['PARA/Invalid.md',2],['INBOX/wiki/Data/Concept.md',0]]) {
      const before=fs.readFileSync(path.join(vault,file));
      const input=JSON.stringify({tool_name:'Write',cwd,tool_input:{file_path:path.join(vault,file)}});
      // pwsh -Command otherwise maps any native nonzero exit to 1.
      const invocation=command+(shell[0]==='pwsh' ? '; exit $LASTEXITCODE' : '');
      const run=spawnSync(shell[0],[...shell.slice(1),invocation],{cwd,env,input,encoding:'utf8',timeout:30000});
      assert.equal(run.status,code,config+' '+run.error+' '+run.stderr);
      if(code===2) assert.match(run.stderr,/NOT reverted/); else assert.equal(run.stderr,'');
      assert.deepEqual(fs.readFileSync(path.join(vault,file)),before);
    }
    const malformed=spawnSync(shells[0][0],[...shells[0].slice(1),command],{cwd:vault,env,input:'invalid JSON',encoding:'utf8',timeout:30000});
    assert.equal(malformed.status,2); assert.match(malformed.stderr,/incomplete/);
    if(config.startsWith('.codex')) {
      const input=JSON.stringify({tool_name:'apply_patch',cwd:vault,tool_input:'*** Begin Patch\n*** Update File: PARA/Invalid.md\n*** End Patch'});
      const run=spawnSync(shells[0][0],[...shells[0].slice(1),command],{cwd:vault,env,input,encoding:'utf8',timeout:30000});
      assert.equal(run.status,2); assert.match(run.stderr,/missing keywords/);
    }
  }
});
