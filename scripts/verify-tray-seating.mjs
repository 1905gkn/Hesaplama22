import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let THREE;try{THREE=require('three');}catch{THREE=require('../../Hesaplama22/node_modules/three');}
const files=Object.fromEntries(['scripts/build.sh','client/b2b-viewer.entry.js','client/b2b-accessories.js'].map(p=>[p,fs.readFileSync(p,'utf8').replaceAll('\r\n','\n')]));
files['client/b2b-accessories.js']=files['client/b2b-accessories.js'].replace('b2b-accessories-v2','b2b-accessories-v1');
const fakeFs={readFileSync:p=>files[p],writeFileSync:(p,v)=>files[p]=v};
for(const name of ['apply-b2b-accessory-fixes.js','apply-b2b-accessory-placement-v2.js','apply-b2b-accessory-fit-v3.js','apply-b2b-h-traverse-lower-v5.js'])vm.runInNewContext(fs.readFileSync('scripts/'+name,'utf8'),{require:()=>fakeFs,console});
const built=files['scripts/build.sh'];
assert.ok(built.includes('traySpan.seatZ + 17 + 50 - trayBounds.max.z'));
assert.ok(!built.includes('tray.position.y += 11'));
const start=built.indexOf('            if (traySpan) {');
assert.ok(start>=0);
const body=built.slice(start,built.indexOf('            section.add(tray);',start));
for(const beamHeight of [80,110,125,140,160])for(const level of [500,1500,3000]){
 const tray=new THREE.Mesh(new THREE.BoxGeometry(200,1107,45));
 tray.position.set(200,700,-level);
 const traySpan={seatZ:-(level+beamHeight)};
 vm.runInNewContext(body,{THREE,tray,traySpan});
 tray.updateMatrixWorld(true);
 const bounds=new THREE.Box3().setFromObject(tray);
 assert.equal(bounds.max.z-17-50,traySpan.seatZ);
 assert.equal(tray.position.y,700);
}
console.log('PASS: production patch chain; tray seating at 15 beam/level combinations, requested 50 mm drop and no lateral offset.');
