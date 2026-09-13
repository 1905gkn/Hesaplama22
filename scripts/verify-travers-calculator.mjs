import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const table=JSON.parse(fs.readFileSync('client/travers-table.json','utf8'));
const source=fs.readFileSync('client/travers-calculator.js','utf8').replace('__RAFEX_TRAVERS_TABLE__',JSON.stringify(table));
const context={window:{}};
vm.runInNewContext(source,context);
assert.equal(new Set(table.records.map(r=>`${r.length}:${r.load}:${r.group}`)).size,880);
for(const length of table.lengths)for(const load of table.loads){const result=context.window.RafexTravers.recommend(length,load);assert.equal(result.length,4);for(const row of result)assert.deepEqual(JSON.parse(JSON.stringify(row)),table.records.find(r=>r.length===length&&r.load===load&&r.group===row.group));}
for(const pair of [[0,3000],[2700,0],[2700,3001],[2701,3000],[NaN,3000],[2700,5000]])assert.equal(context.window.RafexTravers.recommend(...pair),null);
const sample=context.window.RafexTravers.recommend(2700,3000);
assert.equal(sample[0].section,'CC125x50x1,50 ST37');assert.equal(sample[0].manual,true);assert.match(sample[0].note,/%6,65/);
assert.equal(sample[3].section,'Kutu50.140.1,50 ST52');assert.equal(sample[3].manual,false);
assert.equal(context.window.RafexTravers.recommend(3000,3000)[3].section,'Kutu50.140.2,00 ST52');
assert.equal(table.records.filter(r=>r.manual).length,1);
console.log('880 kayıt eşleşti; sınırlar, boy/yük ayrımı ve tek manuel istisna doğrulandı.');
