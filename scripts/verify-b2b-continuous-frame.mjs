import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const source=fs.readFileSync('scripts/patch-common-drawing-upright-5010-v57.mjs','utf8');
const start=source.indexOf('  function refineB2BPlanSpacing('),end=source.indexOf('  function renderSharedFeet(',start);
const context=vm.createContext({isMrRack:r=>!!r.b2b?.mr});
vm.runInContext(source.slice(start,end),context);
function rect(x,y,height){return{attrs:{x,y,height},dataset:{},getAttribute(k){return this.attrs[k]},setAttribute(k,v){this.attrs[k]=Number(v)}}}
for(const double of [false,true]){
 const nodes=[rect(0,0,40),rect(100,0,40)];
 if(double)nodes.push(rect(0,50,40),rect(100,50,40));
 const group={querySelectorAll:s=>s.includes('merged')?nodes:[],appendChild(){throw Error('A single frame must never be split')}};
 context.refineB2BPlanSpacing(group,{b2bLayout:{rowCount:double?2:1}});
 assert.equal(nodes.length,double?4:2);
 if(!double)for(const node of nodes)assert.equal(node.attrs.height,40);
 else assert(nodes[2].attrs.y>nodes[0].attrs.y+nodes[0].attrs.height,'Real row gap retained');
}
const mr=rect(0,0,40);
context.refineB2BPlanSpacing({querySelectorAll:()=>[mr]},{b2bLayout:{},b2b:{mr:true}});
assert.equal(mr.attrs.height,40);
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'rafex-frame-test-'));
fs.mkdirSync(path.join(temp,'dist/server'),{recursive:true});
const file=path.join(temp,'dist/server/index.js');
fs.writeFileSync(file,"const HTML_BASE64 = '"+Buffer.from(fs.readFileSync('.tmp-cold-store-before.html','utf8')).toString('base64')+"';");
execFileSync(process.execPath,[path.resolve('scripts/patch-common-drawing-upright-5010-v57.mjs')],{cwd:temp});
const built=Buffer.from(fs.readFileSync(file,'utf8').match(/HTML_BASE64\s*=\s*['"]([^'"]+)/)[1],'base64').toString();
new vm.Script(built.match(/<script data-rafex-common-upright-5010="v57">([\s\S]*?)<\/script>/)[1]);
console.log('PASS: single-row frames remain continuous; real double-row gaps and MR unchanged.');
