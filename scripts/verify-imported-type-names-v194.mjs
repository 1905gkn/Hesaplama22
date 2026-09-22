import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {mergeRackCatalog,catalogRecordFingerprint} from '../scripts/stable-rack-catalog.mjs';
const ctx={window:{rafexMergeRackCatalog:mergeRackCatalog}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('client/imported-type-names.js','utf8'),ctx);
const api=ctx.window.rafexImportedNamesV194, row=(id,name,width)=>({id,name,__rafexSystem:'b2b',drawing:{width}});
const entries=[row(-1,'source',100),row(-2,'source',200),row(-3,'source',300)];api.defaults([],entries);assert.deepEqual(entries.map(e=>e.importName),['A','B','C']);
entries[0].importName=' c ';assert.throws(()=>api.apply([],entries),/zaten/);entries[2].importName='a';const result=api.apply([],entries);assert.deepEqual(result.entries.map(e=>e.name),['C','B','A']);assert.equal(result.entries[0].__rafexSnapshot.rafexGlobalTypeLetter,'C');assert.equal(result.entries[0].drawing.width,100);
entries[0].importName='';assert.throws(()=>api.apply([],entries),/boş/);entries[0].importName='D';assert.throws(()=>api.apply([row(8,'D',800)],entries),/zaten/);entries[0].importName='E';assert.equal(api.apply([row(8,'D',800)],entries).entries.length,4);
console.log('PASS defaults, swaps, case/whitespace duplicates, blank names, existing catalog conflict and snapshot persistence');
