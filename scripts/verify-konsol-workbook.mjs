import assert from 'node:assert/strict';
import fs from 'node:fs';
import {evaluateKonsolWorkbook,recommendKonsolWorkbook} from '../client/konsol-workbook-engine.mjs';
const {profiles}=JSON.parse(fs.readFileSync('data/konsol-workbook.json','utf8'));
const u=profiles.find(p=>p.name==='IPE 270'),a=profiles.find(p=>p.name==='NPI 140');
// Source's saved geometry is inconsistent, but its exact cached calculation is a regression fixture.
const r=evaluateKonsolWorkbook(u,a,{arm:1000,height:1500,first:600,gap:700,levels:5,load:1500,base:1000});
for(const [key,value] of Object.entries({columnUsage:.6400971598855691,armUsage:.5999419519277676,local:1.741006948621554,total:8.15}))assert.ok(Math.abs(r[key]-value)<1e-9,`${key}: ${r[key]} vs ${value}`);
const s={arm:1000,gap:1000,levels:4,load:1000,count:2,sides:1,base:1000};
const low=recommendKonsolWorkbook(profiles,s),high=recommendKonsolWorkbook(profiles,{...s,load:6000}),tall=recommendKonsolWorkbook(profiles,{...s,gap:2000});
assert.ok(low.valid&&high.valid&&tall.valid);assert.ok(high.choice.mass>=low.choice.mass);assert.ok(tall.choice.mass>=low.choice.mass);
assert.equal(recommendKonsolWorkbook(profiles,{...s,load:1e9}).valid,false);
assert.equal(recommendKonsolWorkbook(profiles,{...s,sides:2}).valid,false);
assert.equal(recommendKonsolWorkbook(profiles,{...s,count:0}).valid,false);
console.log('PASS: four Excel cached results, load/gap sensitivity, overload and missing-input rejection.');
console.log([low,high,tall].map(r=>({load:r.load,gap:r.gap,u:r.choice.u.name,a:r.choice.a.name})));
