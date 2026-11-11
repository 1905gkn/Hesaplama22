import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {nativeInstanceSnapshot} from '../client/native-instance-snapshot.mjs';
import {prepareCadRenderCopy} from '../client/cad-render-copy.mjs';
import {nativeRenderBatches} from '../client/layout-3d-batching.mjs';

const assetRoot=process.env.MR_ASSET_DIR||'dist/mr';
const assets=new Map();
for(const [kind,names] of Object.entries({upright:['mr-ayak-top.glb'],traverse:['zs-travers.glb','mr-zs-travers.glb'],tray:['tava.glb','mr-tava.glb']})){
 const file=names.map(n=>path.join(assetRoot,n)).find(f=>fs.existsSync(f));
 assert.ok(file,'Actual MR CAD asset is available: '+kind);
 const bytes=fs.readFileSync(file),json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString().trim());
 // Exercise every real CAD part name after the same sanitization as GLTFLoader.
 // Geometry is a small fixture: this test validates finishes, not CAD decoding.
 const scene=new THREE.Group(),geometry=new THREE.BoxGeometry(1,1,1);
 for(const node of json.nodes.filter(n=>n.mesh!==undefined)){
  const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial());
  mesh.name=THREE.PropertyBinding.sanitizeNodeName(node.name);scene.add(mesh);
 }
 assets.set(kind,{scene});
}
const source=fs.readFileSync('client/mr-viewer.entry.js','utf8').replace(/^import .*;\r?\n/gm,'');
class Loader {setDRACOLoader(){return this}setMeshoptDecoder(){return this}async loadAsync(url){return assets.get(url.includes('ayak')?'upright':url.includes('travers')?'traverse':'tray')}}
class Draco {setDecoderPath(){}dispose(){}}
const context=vm.createContext({THREE,nativeInstanceSnapshot,prepareCadRenderCopy,GLTFLoader:Loader,DRACOLoader:Draco,MeshoptDecoder:{},window:{dispatchEvent(){}},CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail}},console});
const {api,finished,finishes}=vm.runInContext(source+';({api:window.RafexMRViewer,finished:loadFinishedPart,finishes:FINISHES})',context);
const meshes=object=>{const out=[];object.traverse(p=>{if(p.isMesh)out.push(p)});return out};
const before=meshes(assets.get('upright').scene).map(m=>({geometry:m.geometry,position:Array.from(m.geometry.attributes.position.array),color:m.material.color.getHex()}));
for(const selected of ['ral5010','pgv']){
 const frame=await finished('upright',selected),parts=meshes(frame.object);
 const posts=parts.filter(m=>m.name.includes('MRD350'));
 const braces=parts.filter(m=>m.name.includes('KP075')||m.name.includes('KP119'));
 assert.equal(posts.length,4,'All four original upright CAD pieces are present');
 assert.equal(braces.length,22,'All original horizontal and diagonal CAD pieces are present');
 for(const p of posts)assert.equal(p.material.color.getHex(),finishes[selected].color,'Upright follows selected finish');
 for(const p of braces){assert.equal(p.material.color.getHex(),finishes.pgv.color,'Braces remain galvanized for painted and PGV frames');assert.equal(p.material.roughness,finishes.pgv.roughness)}
 assert.ok(braces.every(p=>p.name.includes('_KP')),'Test exercises GLTFLoader-normalized underscore names');
 assert.equal(await finished('upright',selected),frame,'Finished templates retain caching');
}
for(const selected of ['ral1007','ral2004'])for(const p of meshes((await finished('traverse',selected)).object))assert.equal(p.material.color.getHex(),finishes[selected].color,'Beam finish remains independently selected');
const tray=await finished('tray');
for(const p of meshes(tray.object)){assert.equal(p.material.color.getHex(),finishes.pgv.color,'Material-free tray CAD no longer falls back to white');assert.equal(p.material.metalness,finishes.pgv.metalness)}
const after=meshes(assets.get('upright').scene);
before.forEach((p,i)=>{assert.equal(after[i].geometry,p.geometry);assert.deepEqual(Array.from(after[i].geometry.attributes.position.array),p.position,'Finishes preserve all CAD vertices');assert.equal(after[i].material.color.getHex(),p.color,'Cached original material is unchanged')});
const parts=await api.layoutAccessoryGeometry({modules:2,levels:4,width:2400,depth:800,uprightFinish:'ral5010',traverseFinish:'ral1007',accessories:[{type:'tray',width:300,levels:[1,2,3,4]}]});
assert.ok(parts.some(p=>p.name.includes('_KP')&&p.color===finishes.pgv.color),'Layout export retains galvanized braces');
const exportedTray=parts.find(p=>p.name.includes('RPMI'));
assert.ok(exportedTray,'Full native layout contains shelf trays');
assert.equal(exportedTray.color,finishes.pgv.color);assert.equal(exportedTray.roughness,finishes.pgv.roughness);assert.equal(exportedTray.metalness,finishes.pgv.metalness);
const {batches}=nativeRenderBatches([{id:1,system:'mr',x:0,z:0,angle:0}],new Map([['1',parts]]));
const trayBatch=batches.find(p=>p.name===exportedTray.name);
assert.equal(trayBatch.color,finishes.pgv.color);assert.equal(trayBatch.roughness,finishes.pgv.roughness);assert.equal(trayBatch.metalness,finishes.pgv.metalness,'Layout batching preserves metal finish rather than resetting it');
console.log('PASS MR finishes: real CAD diagonal names, RAL/PGV upright selection, beam colors, galvanized trays, unchanged vertices/cache and native layout material export.');
