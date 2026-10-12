import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const clone=value=>JSON.parse(JSON.stringify(value));
const runtime=fs.readFileSync('client/replace-rack-type-v319.js','utf8');
const portal=fs.readFileSync('portal.html','utf8');
const geometry=portal.slice(portal.indexOf('      function m2PointInArea('),portal.indexOf('      function m2RackOverlaps('));
const symbolBounds=portal.match(/      function m2SymbolBounds\([^\n]+/)[0];
const uprightHeight=portal.slice(portal.indexOf('      function m2B2BCalculatedFootHeight('),portal.indexOf('      function m2Rack3DOptions('));
function fixture(){
 const drawing={totalWidth:1000,railLength:500,widthMm:1000,depthMm:500,footType:120,footProfile:'P',sideUprightHeight:3000,b2b:{},b2bLayout:{rowCount:1},layoutView:'b2b-top'};
 const target={id:1,name:'A',__rafexSystem:'b2b',drawing:clone(drawing)};
 const source={id:2,name:'B',__rafexSystem:'b2b',drawing:{...clone(drawing),totalWidth:1500,widthMm:1500,levels:5}};
 const rack={...clone(drawing),id:7,typeName:'A',rafexSystem:'b2b',rafexCatalogKey:'b2b:1',x:50,y:50,w:40,h:20,angle:0};
 const layout={scale:.04,closed:true,points:[{x:0,y:0},{x:1000,y:0},{x:1000,y:650},{x:0,y:650}],symbols:[],racks:[rack]};
 let areas={activeAreaId:'one',areas:[{id:'one',name:'Depo',layout}]};
 const active={marker:'active'},symbols=[{marker:'symbols'}];
 const context={window:{rafexProjectTypesV133:[target,source],rafexProjectIdentityV133:{uuid:'p'},rafexAreaDocument:()=>clone(areas),rafexReplaceAreaDocumentV319:next=>{areas=next;}},document:{getElementById:()=>null},m2LayoutState:active,m2LayoutSymbols:symbols,m2UndoHistory:[],m2UpdateUndoButton:()=>{},m2RenderSavedRackTypes:()=>{},m2TypeColor:()=> 'red',m2SavedRackTypes:[]};
 vm.createContext(context);
 vm.runInContext('const m2WallMeasurementInset=1;const b2bTraverseHeight=()=>140;\n'+geometry+'\n'+uprightHeight+'\n'+symbolBounds+'\n'+runtime.slice(0,runtime.indexOf('  const previousUndo'))+'window.apply=applyReplacement;})();',context);
 return {context,target,source,rack,layout,get areas(){return areas;},apply:()=>context.window.apply(target,source),assertRestored:()=>{assert.equal(context.m2LayoutState,active);assert.equal(context.m2LayoutSymbols,symbols);}};
}
function rejects(f,pattern){const before=JSON.stringify(f.areas),types=JSON.stringify(f.context.window.rafexProjectTypesV133);assert.throws(f.apply,pattern);assert.equal(JSON.stringify(f.areas),before);assert.equal(JSON.stringify(f.context.window.rafexProjectTypesV133),types);assert.equal(f.context.m2UndoHistory.length,0);f.assertRestored();}
{
 const f=fixture();assert.equal(f.apply(),1);assert.equal(f.areas.areas[0].layout.racks[0].w,60);assert.equal(f.areas.areas[0].layout.racks[0].typeName,'A');assert.equal(f.context.m2UndoHistory.length,1);f.assertRestored();
}
{
 const f=fixture();f.layout.racks.push({...clone(f.rack),id:8,rafexCatalogKey:'b2b:2',typeName:'B',x:95});rejects(f,/çakışıyor/);
}
{
 const f=fixture();f.rack.x=945;rejects(f,/sınır/);
}
{
 const f=fixture();f.rack.angle=90;f.rack.y=620;rejects(f,/sınır/);
}
{
 const f=fixture();f.layout.symbols.push({id:8,type:'column',blocking:true,x:95,y:50,w:10,h:20,angle:0});rejects(f,/kolon/);
}
{
 const f=fixture();f.rack.joinGroup='group';rejects(f,/Birleşik/);
}
{
 const f=fixture();f.layout.racks.push({...clone(f.rack),id:8,rafexCatalogKey:'b2b:2',sharedFootWith:7,x:200});rejects(f,/Birleşik/);
}
{
 const f=fixture();f.rack.joinGroup='group';f.source.drawing.totalWidth=1000;f.source.drawing.widthMm=1000;delete f.source.drawing.levels;assert.equal(f.apply(),1);f.assertRestored();
}
{
 const f=fixture();f.rack.joinGroup='group';f.source.drawing.totalWidth=1000;f.source.drawing.widthMm=1000;f.source.drawing.sideUprightHeight=4000;rejects(f,/Birleşik/);
}
{
 const f=fixture();const second=clone(f.layout);second.racks[0].x=945;f.areas.areas.push({id:'two',name:'Sevkiyat',layout:second});rejects(f,/Sevkiyat/);
}
{
 const f=fixture();f.source.drawing.b2bLayout.rowCount=2;rejects(f,/sıra/);
}
{
 const f=fixture();f.layout.closed=false;f.layout.openFinished=true;f.layout.points=[{x:100,y:0},{x:100,y:200}];rejects(f,/duvar/);
}
{
 const f=fixture();f.layout.points=[{x:0,y:0},{x:100,y:0},{x:100,y:100},{x:85,y:100},{x:85,y:60},{x:75,y:60},{x:75,y:100},{x:0,y:100}];f.rack.x=45;f.rack.y=65;f.source.drawing.totalWidth=1250;rejects(f,/duvar/);
}
console.log('PASS: replacement accepts valid geometry, preserves name/undo, rejects rack/column/wall/boundary collisions and incompatible joins/rows in all areas without partial mutation.');
