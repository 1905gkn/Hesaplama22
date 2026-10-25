import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {transformViewerSource} from './accessory-label-position-v389.mjs';
const source=fs.readFileSync(process.argv[2]||'dist/b2b-viewer.patched.entry.js','utf8');assert.equal(transformViewerSource(source),source);
const env={window:{dispatchEvent(){}},CustomEvent:class{}};vm.createContext(env);vm.runInContext(source.replace(/^import .*;\s*$/gm,'')+'\nwindow.Model=B2BViewer;',env);
for(const firstPalletPosition of ['ground','traverse'])for(const levels of [2,4,7,25])for(const palletHeight of [800,1200,1800]){
 const count=firstPalletPosition==='ground'?levels-1:levels,model=Object.create(env.window.Model.prototype),labels=[];
 model.options=model.normalizeOptions({levels,firstPalletPosition,palletHeight,accessories:[{type:'tray',levels:[count]}],palletHeights:Array.from({length:levels},(_,i)=>palletHeight+i*10)});model.accessoryLabelledV385=new Set();model.addDimensionLabel=(_l,_x,_y,height,text)=>labels.push({height,text});
 model.addUnmeasuredAccessoryLabelsV385({},0,0);assert.equal(labels.length,1);
 assert.equal(labels[0].text,'K'+count+'\nTavalı');assert.equal(labels[0].height,model.loadBottom(levels-1)+model.palletHeightAt(levels-1)/2);
 assert(labels[0].height>model.traverseTop(count-1),'Caption sits within final load rather than on its beam');
}
console.log('v389: last accessory caption at actual load centre for 2/4/7/25 floors, ground/elevated starts and varying/custom pallet heights; shared screen/PDF renderer');

