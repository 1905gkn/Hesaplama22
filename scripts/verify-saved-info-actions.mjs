import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync(new URL('./patch-common-system-previews-v115.mjs',import.meta.url),'utf8');
const registration=source.match(/window\.addEventListener\('click',function savedInfoClick\(event\)\{[\s\S]*?\},true\);/)?.[0];
assert(registration,'Unified info must run in window capture before legacy MR handlers');
let listener,opened=[],stopped=0;
const records=['b2b','mr','mekik2','drive','konsol'].map(system=>({drawing:{system}}));
vm.runInNewContext(registration,{
 window:{addEventListener:(type,handler,capture)=>{assert.equal(type,'click');assert.equal(capture,true);listener=handler},rafexFreeShowInfoV3:index=>opened.push(index)},
 entries:()=>records
});
function click(raw,match=true){listener({target:{closest:()=>match?{getAttribute:()=>raw}:null},preventDefault(){},stopImmediatePropagation(){stopped++}})}
for(let i=0;i<records.length;i++)click(String(i));
assert.deepEqual(opened,[0,1,2,3,4],'All systems use the selected saved record, independent of the active tab');
assert.equal(stopped,5,'Legacy module listeners must not intercept info clicks');
for(const invalid of [null,'','-1','99','abc'])click(invalid);
click('0',false);
assert.equal(opened.length,5,'Invalid records and unrelated actions are ignored');
console.log('Saved info actions: all five systems, capture routing and invalid records passed');
