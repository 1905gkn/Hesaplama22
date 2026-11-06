import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {typeUseCount,transform} from './layout-reliability-v525.mjs';
const html=fs.readFileSync('dist/index.html','utf8'),portal=fs.readFileSync('portal.html','utf8');
const script=marker=>{const start=html.indexOf(marker);assert.ok(start>=0,marker);return html.slice(start,html.indexOf('</script>',start));};
const fn=(start,end)=>portal.slice(portal.indexOf('      function '+start),portal.indexOf('      function '+end));
const native=fn('b2bTypeLetter(','m2TypeColor(')+fn('m2PalletDepthLayout(','m2DxfPair(')+fn('m2CalculateFootLoad(','drawMekik2(');
function setup(system,duplicate=false,otherArea=false){
 const a={id:1,typeName:'A',rafexCatalogKey:system+':1',rafexSystem:system,plan:{feet:[1200,1200,1200],braces:[1200,1200]},depth:5,depthMm:6500,palD:1200,palletPositions:[0,1400,2650,3900,5300],firstPalletGap:200,palletGap:50,systemType:'fifo',widthMm:2000,w:200,h:650,x:0,y:0,angle:0,levels:4};
 const b={...structuredClone(a),id:2,typeName:'B',rafexCatalogKey:system+':2',depth:3,depthMm:3600,h:360,x:400,plan:{feet:[1000,1000],braces:[1600]}};
 const copy={...structuredClone(b),id:3},racks=[a,b,...(duplicate&&!otherArea?[copy]:[])];
 const status={classList:{remove(){}},setAttribute(){}};
 const ctx=vm.createContext({structuredClone,window:{rafexProjectTypesV133:[{id:1,name:'A',system,drawing:structuredClone(a)},{id:2,name:'B',system,drawing:structuredClone(b)}],rafexKatWireV392:{requiresNewType:()=>false}},m2LayoutState:{racks},m2SavedRackTypes:[],m2SelectedSavedType:null,m2UndoHistory:[],m2JoinFirstRackId:null,m2JoinMode:true,$:()=>status,document:{getElementById:()=>status},m2MultiSelect:{},m2ClearMultiSelection(){},m2ChooseJoinRack(){},m2CommitMultiSelection(){},m2UndoLastAction(){},m2RenderSavedRackTypes(){},m2RenderLayout(){},m2TypeColor:n=>n,m2PushUndo(){ctx.m2UndoHistory.push({});},m2RackInsideArea:()=>true,m2RackOverlapsExcept:()=>false});
 ctx.window.rafexTypeUseCountV525=r=>typeUseCount(r,otherArea?[{layout:{racks}},{layout:{racks:[copy]}}]:null,racks);
 vm.runInContext(native+script("(()=>{\n 'use strict';\n window.rafexCommitCustomTypeV184=")+script('/* depth-join-v523 */'),ctx);
 return {ctx,a,b};
}
for(const system of ['mekik2','drive'])for(const duplicate of [false,true])for(const otherArea of duplicate?[false,true]:[false]){
 const {ctx,a,b}=setup(system,duplicate,otherArea),before=JSON.stringify(a);
 ctx.m2ChooseJoinRack(a.id);ctx.m2CommitMultiSelection({rackId:b.id});
 assert.equal(b.typeName,duplicate?'C':'B');assert.equal(a.typeName,'A');
 assert.deepEqual(Array.from(b.palletPositions),[0,1400,2800]);assert.equal(b.palletGaps.at(-1),200);
 assert.equal(b.depth,3);assert.equal(b.depthMm,4000);assert.equal(b.hasExtra,true);
 assert.equal(b.sharedFootWith,a.id);assert.equal(b.sharedFootSide,'left');
 assert.deepEqual(Array.from(b.plan.feet),[1200,1200]);assert.deepEqual(Array.from(b.plan.braces),[1200,400]);
 const catalog=ctx.window.rafexProjectTypesV133;
 assert.equal(catalog.length,duplicate?3:2);assert.equal(catalog.find(t=>t.name===b.typeName).drawing.depthMm,4000);
 if(!duplicate)assert.equal(b.rafexCatalogKey,system+':2');
 assert.equal(ctx.m2UndoHistory.at(-1).joinCatalogV523.find(t=>t.name==='B').drawing.depthMm,3600);
 for(const type of ['filo','fifo'])for(const count of [1,2,3,4,5]){
  a.systemType=type;b.depth=count;
  const drawing=ctx.window.rafexDepthJoinV523.drawing(a,b);
  if(count>1)assert.ok(drawing.palletGaps.at(-1)>=(type==='fifo'||count===2?200:50));
  assert.ok(drawing.depthMm>=drawing.palletPositions.at(-1)+drawing.palD);
 }
 for(const tail of [99,100,101]){const p=ctx.window.rafexDepthJoinV523.plan(a,1200+tail);assert.equal(p.hasExtra,tail>100);}
}
assert.ok(html.includes('typeLetterScale:100*(window.rafexCommonTypeLetterScaleV65'));
assert.ok(html.includes('v.typeLetterScale??100'));
assert.ok(html.includes('height:clamp(510px,65vh,700px)!important'));
assert.equal(transform(html),html,'idempotent');
const server=fs.readFileSync('dist/server/index.js','utf8');
const serverHtml=Buffer.from(server.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/)[1],'base64').toString();
assert.ok(serverHtml.includes('data-layout-reliability="v525"'));
assert.ok(serverHtml.includes('positions[count-2]+palD+terminal.gaps[count-2]'));
console.log('PASS v525: both systems; singleton and duplicate types across areas; terminal gaps; common supports; 100 mm; catalog update/undo snapshot; project preferences; bounded canvas; both deployment HTML paths.');
