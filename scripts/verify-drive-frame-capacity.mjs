import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {resolveDriveFrames,transform} from './drive-frame-capacity.mjs';
const html=transform(fs.readFileSync(process.argv[2]||'dist/index.html','utf8'));
const runtime=html.match(/<script data-drive-frame-capacity>([\s\S]*?)<\/script>/)[1];
const resolve=vm.runInNewContext(runtime+';rafexResolveDriveFrames');
for(const calculate of [resolve,resolveDriveFrames]){
 const entry=calculate(6800,21000,4);
 assert.equal(entry.tableHeight,7000);
 assert.equal(entry.load,5250);
 assert.equal(entry.primary.profile,'HR120.80.2,0');
 assert.equal(entry.primary.capacity,6539);
 assert.equal(entry.primary.unitWeight,5.04);
 assert.equal(entry.recommendedChoices.map(c=>c.profile).join(','),'HR120.80.2,0,HR127.105.2,0,HR140.120.2,0');
 assert.equal(calculate(6200,21000,4).tableHeight,7000);
 for(const [from,to] of [[6000,7000],[7000,8000],[8000,9000],[9000,10000],[10000,10500],[10500,11000],[11000,11500],[11500,12000],[12000,12500]]){
  assert.equal(calculate(from,21000,4).tableHeight,to);
  assert.equal(calculate(to-1,21000,4).tableHeight,to);
 }
 assert.equal(calculate(12500,21000,4).tableHeight,null);
 assert.equal(calculate(12501,21000,4).primary,null);
 assert.equal(calculate(6800,21000,0).primary,null);
 assert.equal(calculate(7000,6539.1,1).choices.some(c=>c.profile==='HR120.80.2,0'),false);
}
assert.match(html,/rafexResolveDriveFrames\(footCalculationHeight,totalPalletLoad,footCount\):m2ResolveFootProfiles/);
for(const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|type="module"|application\/json/.test(script[1])) new vm.Script(script[2]);
console.log('PASS Drive-In attached table, exact supported load, next height column, top three and no extrapolation.');
