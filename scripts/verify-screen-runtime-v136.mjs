import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const source=fs.readFileSync('dist/server/index.js','utf8');
const encoded=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
assert.ok(encoded,'worker HTML exists');
const html=Buffer.from(encoded[2],'base64').toString();
assert.equal(html.split('data-rafex-screen-session="v136"').length-1,1);
assert.equal(html.split('<script data-rafex-manual-free-output="v32">').length-1,1);
assert.ok(html.includes('sessionsV136=new Map()'));
assert.ok(html.includes('data-rafex-ready-v136="summary"'));
let count=0;
for(const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  if(/\bsrc\s*=|type=["'](?:module|application\/)/.test(script[1]))continue;
  new vm.Script(script[2],{filename:'final-inline-'+count++});
}
console.log('PASS v136: single output owner, scoped sessions and '+count+' syntax-valid inline scripts');
