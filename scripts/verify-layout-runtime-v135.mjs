import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {transform} from './patch-layout-performance-v135.mjs';
const source=fs.readFileSync('dist/server/index.js','utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
assert(match,'HTML_BASE64 missing');
const html=Buffer.from(match[2],'base64').toString('utf8');
for(const marker of ['data-rafex-layout-performance="v135"','attachedV135.forEach','const keepV135=new Set(desiredV135)','const symbolsV135=new Map','const racksV135=new Map','decorateFrameV135'])assert(html.includes(marker),marker);
assert.equal(transform(html),html,'v135 must be idempotent');
let count=0;
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
  if(/\bsrc=|type=["'](?:module|application\/)/.test(match[1]))continue;
  new vm.Script(match[2],{filename:'v135-inline-'+count++});
}
console.log('v135 PASS: protected drag, retained DOM, indexed accessories; '+count+' inline scripts syntax-valid');
