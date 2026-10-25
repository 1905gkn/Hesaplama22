import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {transformViewerSource} from './elevated-accessory-labels-v390.mjs';
const source=fs.readFileSync(process.argv[2]||'dist/b2b-viewer.patched.entry.js','utf8');assert.equal(transformViewerSource(source),source);
const env={window:{dispatchEvent(){}},CustomEvent:class{},THREE:{Group:class{add(){}},Vector3:class{constructor(x,y,z){Object.assign(this,{x,y,z})}}}};vm.createContext(env);vm.runInContext(source.replace(/^import .*;\s*$/gm,'')+'\nwindow.Model=B2BViewer;',env);
for(const levels of [2,4,7,25])for(const traverseIncluded of [false,true]){
 const model=Object.create(env.window.Model.prototype),labels=[];
 model.options=model.normalizeOptions({levels,firstPalletPosition:'traverse',palletHeight:1200,accessories:[{type:'hTraverse',levels:Array.from({length:levels},(_,i)=>i+1)},{type:'palletStop',levels:Array.from({length:levels},(_,i)=>i+1)}],dimensions:{traverseIncluded,levels:true,markers:false,eye:false,depth:false}});
 model.content={add(){}};model.addLine=()=>{};model.addPoint=()=>{};model.addDimensionLabel=(_l,_x,_y,height,text)=>labels.push({height,text});
 model.addDimensions(2700);
 const first=labels.find(l=>l.text.startsWith(traverseIncluded?'Z – K1':'Z+TRAVERS'));assert(first);assert(!first.text.includes('H travers'));assert(!first.text.includes('Palet dayama'));
 const firstFloor=labels.find(l=>l.text.startsWith(traverseIncluded?'K1 – K2':'K1 – K2'));assert(firstFloor?.text.includes('H travers'));assert(firstFloor.text.includes('Palet dayama'));
 const last=labels.find(l=>l.text==='K'+levels+'\nH travers\nPalet dayama');assert(last,'Final accessory floor must remain visible');assert.equal(last.height,model.loadBottom(levels-1)+model.palletHeightAt(levels-1)/2);
 assert.equal(labels.filter(l=>l.text.includes('H travers')).length,levels,'Every physical level annotated exactly once');
}
console.log('v390: full native dimension pass; elevated Z gap empty, K1–K2 owns first accessories, final caption visible and centred, 2/4/7/25 levels and both measurement modes');

