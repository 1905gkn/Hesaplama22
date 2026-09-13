import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const table=JSON.parse(fs.readFileSync('client/travers-table.json','utf8'));
const source=fs.readFileSync('client/travers-calculator.js','utf8').replace('__RAFEX_MINI_TABLE__',fs.readFileSync('client/mini-rack-table.json','utf8')).replace('__RAFEX_TRAVERS_TABLE__',JSON.stringify(table));
const context={window:{}};
vm.runInNewContext(source,context);
assert.equal(new Set(table.records.map(r=>`${r.length}:${r.load}:${r.group}`)).size,880);
for(const length of table.lengths)for(const load of table.loads){const result=context.window.RafexTravers.recommend(length,load);assert.equal(result.length,4);for(const row of result)assert.deepEqual(JSON.parse(JSON.stringify(row)),table.records.find(r=>r.length===length&&r.load===load&&r.group===row.group));}
for(const pair of [[0,3000],[2700,0],[NaN,3000],[2700,5000]])assert.equal(context.window.RafexTravers.recommend(...pair),null);
const sample=context.window.RafexTravers.recommend(2700,3000);
assert.equal(sample[0].section,'CC125x50x1,50 ST37');assert.equal(sample[0].manual,true);assert.match(sample[0].note,/%6,65/);
assert.equal(sample[3].section,'Kutu50.140.1,50 ST52');assert.equal(sample[3].manual,false);
assert.equal(context.window.RafexTravers.recommend(3000,3000)[3].section,'Kutu50.140.2,00 ST52');
assert.equal(table.records.filter(r=>r.manual).length,1);
const mini=JSON.parse(fs.readFileSync('client/mini-rack-table.json','utf8'));
assert.equal(mini.records.length,812);
assert.equal(new Set(mini.records.map(r=>`${r.length}:${r.load}:${r.group}`)).size,812);
for(const [data,fn] of [[table,context.window.RafexTravers.recommend],[mini,context.window.RafexTravers.recommendMini]]) {
  for(let li=0;li<data.lengths.length;li++)for(let qi=0;qi<data.loads.length;qi++) {
    const L=data.lengths[li],Q=data.loads[qi];
    for(const [l,q] of [[L,Q],[(li?data.lengths[li-1]:0)+(L-(li?data.lengths[li-1]:0))/2,(qi?data.loads[qi-1]:0)+(Q-(qi?data.loads[qi-1]:0))/2]]) {
      const rows=fn(l,q);
      assert.equal(rows.length,data.groups.length);
      rows.forEach(r=>assert.deepEqual(JSON.parse(JSON.stringify(r)),data.records.find(x=>x.length===L&&x.load===Q&&x.group===r.group)));
    }
  }
  for(const pair of [[-1,200],[800,Infinity],[NaN,200],[data.lengths.at(-1)+.01,200],[800,data.loads.at(-1)+.01]])assert.equal(fn(...pair),null);
}
assert.equal(context.window.RafexTravers.recommend(2650,2950)[0].length,2700);
assert.equal(context.window.RafexTravers.recommend(2650,2950)[0].load,3000);
assert.equal(context.window.RafexTravers.recommendMini(2650,650)[0].load,700);
assert.equal(context.window.RafexTravers.recommendMini(2650,650)[0].length,2700);
assert.equal(mini.records.filter(r=>r.manual).length,0);
console.log('1692 kayıt ve tüm ara aralıklar doğrulandı; sınır aşımı reddediliyor, manuel istisna korunuyor.');
