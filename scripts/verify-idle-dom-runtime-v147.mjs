import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {transform} from './patch-idle-dom-performance-v147.mjs';
const html=fs.readFileSync(process.argv[2]||'.tmp-v109/build/dist/index.html','utf8');
assert(html.includes('/* idle-dom-performance-v147:'));
assert.equal(transform(html),html);
let count=0;
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
  if(/\bsrc\s*=|type=["'](?:module|application\/)/i.test(match[1])||!match[2].trim())continue;
  new vm.Script(match[2],{filename:'inline-'+(++count)+'.js'});
}
console.log(`v147: ${count} inline scripts parsed; patch is idempotent.`);
