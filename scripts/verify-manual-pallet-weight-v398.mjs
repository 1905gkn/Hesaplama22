import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {manualPalletWeightsV398,namePalletVariantsV398,transform,transformViewerSource} from './manual-pallet-weight-v398.mjs';
const input=process.argv[2]||'dist/index.html',viewerPath=process.argv[3]||'dist/b2b-viewer.patched.entry.js';
let html=fs.readFileSync(input,'utf8'),viewer=fs.readFileSync(viewerPath,'utf8');
html=transform(html);viewer=transformViewerSource(viewer);
assert.equal(transform(html),html);assert.equal(transformViewerSource(viewer),viewer);
assert(html.includes('Her kata palet başına ağırlık girin (kg/palet).'));
assert(html.includes("setLabel(weight,level(i)+' palet ağırlığı (kg/palet)')"));
const collector=html.match(/const rows=\[\.\.\.dialog\.querySelectorAll\('\.level-row'\)\]\.map\(row=>\(\{distance:Number\(row\.querySelector\('\[data-distance\]'\)\.value\),weight:[^\n]+/)[0];
const fields={'[data-distance]':{value:'1500'},'[data-weight]':{value:'800'},'[data-pallet]':{value:'1200'},'[data-traverse]':{value:'CC140',dataset:{}}};
const savedRow=vm.runInNewContext(collector+'\nrows[0]',{o:{palletCount:3},dialog:{querySelectorAll:()=>[{querySelector:key=>fields[key]}]}});
assert.equal(savedRow.weight,2400,'800 kg per pallet × 3 must retain 2400 kg structural load');
assert.deepEqual(manualPalletWeightsV398([savedRow],3),[800],'Saved/reopened label stays 800 kg');
assert(html.includes("load=(Number(loadRow?.querySelector('[data-weight]')?.value)||0)*Math.max(1,Number(dialog.dataset.palletCount)||1)"));
assert.deepEqual(manualPalletWeightsV398([{weight:3000},{weight:2400},{weight:0},{palletWeight:650}],3),[1000,800,0,650]);
const script=html.match(/<script data-manual-pallet-weight="v398">([\s\S]*?)<\/script>/)[1];
const paintCalls=[];const env={window:{dispatchEvent(){}},CustomEvent:class{},Intl,console,document:{documentElement:{lang:'tr'},createElement(){return {getContext(){return {clearRect(){paintCalls.push('clear');},fillText(){paintCalls.push('text');},beginPath(){},roundRect(){},fill(){paintCalls.push('background');}};}};}}};vm.createContext(env);vm.runInContext(script,env);
const report=html.match(/<script data-pallet-rows="v395">([\s\S]*?)<\/script>/)[1];vm.runInContext(report,env);
const a={name:'A',drawing:{levels:4,palD:1200,palW:800,palletHeight:1200,b2b:{palletCount:3,manualLevelSpecs:[{palletHeight:1200,weight:3000},{palletHeight:1200,weight:2400},{palletHeight:1200,weight:3000},{palletHeight:1200,weight:1800}]}}};
const rows=namePalletVariantsV398(env.window.rafexPalletRowsV395([a,a]));assert.deepEqual(rows.map(r=>r.name),['A1','A2','A3']);assert.deepEqual(Array.from(rows,r=>r.drawing.palletWeight),[1000,800,600]);
const single={name:'B',drawing:{palD:1200,palW:800,palletHeight:1200,palletWeight:900}};assert.equal(namePalletVariantsV398([single])[0].name,'B');
const start=html.indexOf('manualOptions=function manualOptions'),end=html.indexOf('},copy=',start);assert(start>0&&end>start);vm.runInContext('var '+html.slice(start,end+1)+';',env);
const opts=env.manualOptions({levels:4,palletCount:3,palletHeight:1200,firstPalletPosition:'traverse'},a.drawing.b2b.manualLevelSpecs);assert.deepEqual(Array.from(opts.palletWeights),[1000,800,1000,600]);
const require=createRequire(path.resolve(fs.existsSync('node_modules/three')?'package.json':'Hesaplama22/package.json'));env.THREE=await import(pathToFileURL(require.resolve('three')).href);vm.runInContext(viewer.replace(/^import .*;\s*$/gm,'')+'\nwindow.TestViewer=B2BViewer;',env);
const model=Object.create(env.window.TestViewer.prototype);model.options=model.normalizeOptions({...opts,palletWidth:800,palletDepth:1200,sectionWidth:2700});model.models={pallet:new env.THREE.Group()};model.applyUserPalletMaterials=()=>{};
const labels=[];model.addPalletWeightV398=(layer,x,y,z,kg)=>labels.push({x,y,z,kg});const group=new env.THREE.Group();model.addLoads(group,1);
assert.equal(labels.length,12);assert.deepEqual(labels.map(l=>l.kg),[1000,1000,1000,800,800,800,1000,1000,1000,600,600,600]);assert(labels.every(l=>Number.isFinite(l.z)));
model.options=model.normalizeOptions({levels:2});labels.length=0;model.addLoads(new env.THREE.Group(),1);assert.equal(labels.length,0,'Automatic mode must not show stale manual weights');
model.options=model.normalizeOptions({levels:2,palletCount:3,palletWeight:900});labels.length=0;model.addLoads(new env.THREE.Group(),1);assert.equal(labels.length,6);assert(labels.every(label=>label.kg===900),'Initial calculation displays its per-pallet weight on every pallet');
const labelGroup=new env.THREE.Group(),load=new env.THREE.Mesh(new env.THREE.BoxGeometry(800,1200,1200));load.position.set(400,550,-600);labelGroup.add(load);env.window.TestViewer.prototype.addPalletWeightV398.call(model,labelGroup,400,550,-600,900,800,load);const sprite=labelGroup.children[1];assert(sprite.isMesh&&!sprite.isSprite,'Weight is fixed to pallet face, never camera-facing');assert.equal(sprite.material.depthTest,true);assert.equal(sprite.userData.palletWeight,900);assert.equal(sprite.position.y,1151);assert.equal(sprite.rotation.x,-Math.PI/2);assert.deepEqual(paintCalls,['clear','text'],'No panel, watermark or white background behind kg');
assert(html.includes('data-visible-pallet-weight="v400"'));
assert.equal(labelGroup.children.length,3,'Both exposed pallet faces carry kg text');const opposite=labelGroup.children[2];assert.equal(opposite.position.y,-51);assert.equal(opposite.rotation.x,Math.PI/2);assert.equal(opposite.rotation.z,Math.PI);assert.equal(opposite.material.depthTest,true);

const oriented=Object.create(env.window.TestViewer.prototype);
oriented.content=new env.THREE.Group();
oriented.models={module:new env.THREE.Group(),pallet:new env.THREE.Mesh(new env.THREE.BoxGeometry(800,1200,1200))};
for(const name of ['stripFrameSupports','preserveUprightThickness','applyRackMaterials','resizeEndFrames','addTraverses','addAccessories','addStraightTies','addDimensions','addGround','fitCamera','applyUserPalletMaterials'])oriented[name]=()=>{};
let checkedLabels=0;
for(const rowType of ['single','double'])for(const manual of [false,true]){
 oriented.options=oriented.normalizeOptions({rowType,moduleCount:1,levels:4,palletCount:3,palletWeight:1000,palletWeights:manual?[600,800,1000,1200]:[],showPallets:true,sectionWidth:2700,palletWidth:800,palletDepth:1200,palletHeight:1200});
 oriented.update(oriented.options,true);
 const labels=[];oriented.content.traverse(label=>{if(label.userData.palletWeight!=null)labels.push(label);});
 assert.equal(labels.length,4*3*2*(rowType==='double'?2:1));
 for(const label of labels){
  const right=new env.THREE.Vector3(1,0,0).transformDirection(label.matrixWorld);
  const normal=new env.THREE.Vector3(0,0,1).transformDirection(label.matrixWorld);
  const screenRight=new env.THREE.Vector3(0,1,0).cross(normal).normalize();
  assert(right.dot(screenRight)>.99,'Text reads left-to-right on both faces of both rows');
  assert.equal(label.material.side,env.THREE.FrontSide,'Mirrored reverse of a text face must not render');
  checkedLabels++;
 }
}
assert.equal(checkedLabels,144);
console.log('PASS: 144 actual labels across single/double rows and manual/default kg are upright and read left-to-right on both faces.');

for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(match[1].trim())new vm.Script(match[1]);
console.log('PASS: manual per-pallet kg labels, three variants A1/A2/A3, duplicate suppression, automatic-mode reset and runtime syntax.');


