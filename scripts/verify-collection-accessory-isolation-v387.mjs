import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {transform,transformViewerSource} from './collection-accessory-isolation-v387.mjs';
const html=fs.readFileSync(process.argv[2],'utf8'),source=fs.readFileSync(process.argv[3],'utf8');assert.equal(transform(html),html);assert.equal(transformViewerSource(source),source);
const env={};vm.createContext(env);vm.runInContext(source.slice(source.indexOf('function b2bAccessoryNotesV384'),source.indexOf('/* end-accessory-notes-v384 */')),env);
const options={levels:4,firstPalletPosition:'traverse',accessories:[{type:'tray',levels:[1]},{type:'hTraverse',levels:[1]},{type:'palletStop',levels:[1]}],collectionFloors:[{bottom:100,zsHeight:75}]};
assert.deepEqual(Array.from(env.b2bAccessoryNotesV384(options,175,i=>175+i*1300)),['Toplama katı'],'Collection never lists ordinary accessories, even at coincident height');
assert.deepEqual(Array.from(env.b2bAccessoryNotesV384({...options,collectionFloors:[]},175,i=>175+i*1300)),['Tavalı','H travers','Palet dayama'],'Ordinary system levels retain accessories');
const ground=html.match(/const groundV151=\(\)=>[^;]+;/)?.[0],values=html.match(/const levelValuesV151=\(type,count=levelCount\(\)\)=>[^\n]+;/)?.[0];assert(ground&&values);
const ui={appliedCollection:{enabled:true},document:{getElementById:()=>({value:'ground'})},levelCount:()=>4};vm.createContext(ui);vm.runInContext(ground+values+'\nresult=levelValuesV151;',ui);
for(const type of ['tray','hTraverse','palletStop'])assert.deepEqual(Array.from(ui.result(type)),[1,2,3,4],'Only four system floors; collection floors never added');
ui.appliedCollection.enabled=false;assert.deepEqual(Array.from(ui.result('palletStop')),[0,1,2,3]);assert.deepEqual(Array.from(ui.result('tray')),[1,2,3]);
const valid=html.match(/const validLevels=\(\)=>[^\n]+;/)?.[0];assert(valid);const custom={window:{rafexAccessoryLevelsV121:()=>[1,2,3,4,5,6,25]},levelCount:()=>4};vm.createContext(custom);vm.runInContext(valid+'\nresult=validLevels();',custom);assert.deepEqual(Array.from(custom.result),[1,2,3,4]);
let count=0;for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(m[1].trim()){new vm.Script(m[1]);count++;}
console.log('v387: collection-only captions, coincident heights isolated, only system floors selectable, ground semantics preserved, custom floor bounds and '+count+' inline scripts passed');

