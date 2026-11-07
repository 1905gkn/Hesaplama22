import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from 'three';
import {konsolDimensions} from '../client/konsol-dimensions.mjs';
const rows=[{top:600,depth:800},{top:1900,depth:1500},{top:3000,depth:1000}];
const dims=konsolDimensions({baseDepth:1200},rows,160,4500,6000,160);
assert.deepEqual(dims.filter(d=>d.side==='right').map(d=>d.value),[160,440,1300,1100]);
assert.deepEqual(dims.filter(d=>d.side==='depth').map(d=>d.value),[1200,800,1500,1000]);
assert.equal(dims.find(d=>d.label==='Ayak boyu').value,4500);
const source=fs.readFileSync('client/konsol-viewer.entry.js','utf8');
assert.ok(source.includes('konsol-preview-v526'));
const ctx=vm.createContext({THREE,structuredClone,window:{dispatchEvent(){}},CustomEvent:class{},document:{createElement:()=>({width:0,height:0,getContext:()=>({fillRect(){},strokeRect(){},fillText(){},beginPath(){},roundRect(){},fill(){},stroke(){}})})}});
vm.runInContext(source.replace(/^import .*;\s*$/gm,'')+'\nwindow.TestViewer=KonsolViewer;window.setTestViewer=v=>savedMainViewer=v;',ctx);
const viewer=Object.create(ctx.window.TestViewer.prototype);viewer.canvas={id:'konsolCanvas'};viewer.scene=new THREE.Scene();viewer.options={};viewer.root=new THREE.Group();viewer.fitPerspective=()=>{};
viewer.update({uprightCount:5,spacing:1500,height:4500,armLength:1000,baseDepth:1200,levels:3,levelRows:rows.map((r,i)=>({depth:r.depth,distance:r.top-(rows[i-1]?.top||0),load:500})),loadType:'unpacked'},false);
ctx.window.setTestViewer(viewer);
for(const type of ['profile','pallet','unpacked','profile']){assert.ok(ctx.window.RafexKonsolViewer.setLoadType(type));assert.equal(viewer.options.loadType,type);assert.equal(viewer.root.getObjectByName('Konsol ölçüleri').userData.measurements.length,9);const loads=[];viewer.root.traverse(n=>{if(/Kutu profil|Paletli yük/.test(n.name))loads.push(n);});assert.equal(loads.length>0,type!=='unpacked');}
console.log('PASS v526: actual native geometry changes on product toggles; 9 dimensions use ground/base/variable arm tops and depths.');
