import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {transform,transformViewerSource} from './accessory-labels-v384.mjs';
const html=fs.readFileSync(process.argv[2],'utf8'),source=fs.readFileSync(process.argv[3],'utf8');
assert.equal(transform(html),html);assert.equal(transformViewerSource(source),source);
assert(html.includes('id="b2bDimension-accessories"'));assert(html.includes('let b2bDimensionVisibility = { accessories:true'));
const from=source.indexOf('function b2bAccessoryNotesV384'),to=source.indexOf('/* end-accessory-notes-v384 */');
const context={};vm.createContext(context);vm.runInContext(source.slice(from,to),context);
const notes=(o,h)=>Array.from(context.b2bAccessoryNotesV384(o,h,i=>200+i*1300));
const base={levels:5,firstPalletPosition:'traverse',dimensions:{accessories:true},accessories:[{type:'tray',levels:[1,3]},{type:'hTraverse',levels:[2]},{type:'palletStop',levels:[1]}]};
assert.deepEqual(notes(base,200),['Tavalı','Palet dayama']);assert.deepEqual(notes(base,1500),['H travers']);assert.deepEqual(notes(base,2800),['Tavalı']);assert.deepEqual(notes(base,4100),[]);
assert.deepEqual(notes({...base,dimensions:{accessories:false}},200),[]);
assert.deepEqual(notes({...base,tunnelHeight:2000},200),[]);assert.deepEqual(notes({...base,tunnelHeight:2000},2800),['Tavalı']);
assert.deepEqual(notes({...base,collectionFloors:[{bottom:0,zsHeight:75}]},75),['Toplama katı']);
assert.deepEqual(notes(JSON.parse(JSON.stringify(base)),200),['Tavalı','Palet dayama']);
assert(source.includes('accessories: options.dimensions?.accessories !== false'));
let count=0;for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(match[1].trim()){new vm.Script(match[1]);count++;}
console.log('v384: per-level notes, visibility, surviving tunnel floors, collection floors, save roundtrip, PDF inheritance; '+count+' scripts parse');

