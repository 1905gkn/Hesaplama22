import assert from 'node:assert/strict';
import vm from 'node:vm';
import {planMarkGeometry as geometry,planMarkSvg as svg,installPlanMarks,transform} from './plan-marks-v480.mjs';
assert.deepEqual(geometry('mark-circle',{x:10,y:20},{x:13,y:24}),{x:5,y:15,w:10,h:10,ax:.5,ay:.5,bx:1,by:.5});
assert.equal(geometry('mark-rect',{x:1,y:2},{x:1,y:2}),null);
const reverse=geometry('mark-arrow',{x:100,y:80},{x:10,y:20});assert.equal(reverse.ax,1);assert.equal(reverse.bx,0);
const rendered=svg({...reverse,type:'mark-arrow',id:1,color:'#112233',stroke:4,text:'<script>alert(1)</script>\nOk',labelSize:14},{x:5,y:-3});
assert(rendered.includes('fill="none"'));assert(rendered.includes('stroke="#112233"'));assert(rendered.includes('stroke-width="4"'));assert(rendered.includes('data-dimension-key="mark-label:1"'));assert(!rendered.includes('<script>'));assert(rendered.includes('&lt;script&gt;'));assert(rendered.includes('<tspan'));
const listeners={},fields={},snapshots=[];
const classes={add(){},remove(){}},svgNode={classList:classes,setPointerCapture(){},releasePointerCapture(){}},layer={querySelector(){return null;},append(){}};
const modalNodes={'.m2-symbol-choices':{},'[data-mark-settings]':{},'.m2-symbol-visibility':{},'[onclick="m2CreateSymbol()"]':{}};
fields.m2SymbolModal={querySelector(key){return modalNodes[key]||null;}};
for(const [id,value] of Object.entries({rafexMarkColor480:'#2266aa',rafexMarkStroke480:'3',rafexMarkText480:'Yükleme alanı',m2AnnotationFontSize:'12'}))fields[id]={value};
fields.m2SymbolSizes={};fields.m2FloorStatus={textContent:''};fields.m2LayoutSvg=svgNode;fields.m2LayoutContent=layer;
const context={window:{},document:{createElementNS(){return {style:{},setAttribute(){},querySelector(){return null;},querySelectorAll(){return [];}};},getElementById:id=>fields[id],addEventListener(name,fn){(listeners[name]??=[]).push(fn);}},m2SymbolChoice:'mark-arrow',m2LayoutState:{points:[],racks:[]},m2LayoutSymbols:[],m2DimensionOffsets:{},m2DimensionFontSizes:{},
m2OpenSymbolDialog(){},m2ChooseSymbol(type){context.m2SymbolChoice=type;},m2CreateSymbol(){throw Error('physical creation used');},m2CloseSymbolDialog(){},m2ClearAllSelections(){},m2SetLayoutTool(value){context.m2LayoutTool=value;},m2InitLayoutEditor(){},m2SvgPoint:event=>({x:event.clientX,y:event.clientY}),m2RenderLayout(){},
m2PushUndo(){snapshots.push(JSON.stringify({symbols:context.m2LayoutSymbols,offsets:context.m2DimensionOffsets}));}};
vm.createContext(context);vm.runInContext('('+installPlanMarks.toString()+')('+geometry.toString()+','+svg.toString()+')',context);
let nextId=0;
function click(x,y,shiftKey=false){const pointerId=++nextId,event={clientX:x,clientY:y,pointerId,button:0,shiftKey,target:{closest:()=>svgNode},preventDefault(){},stopImmediatePropagation(){}};for(const fn of listeners.pointerdown)fn(event);for(const fn of listeners.pointerup)fn(event);}
context.m2CreateSymbol();click(10,20);click(100,90);assert.equal(context.m2LayoutSymbols.length,1);
assert(!context.window.rafexPlanMarksV480.svg(context.m2LayoutSymbols).includes('Yükleme alanı'),'label must wait for third click');
const arrow=context.m2LayoutSymbols[0];assert.equal(arrow.blocking,false);assert.equal(arrow.color,'#2266aa');assert.equal(arrow.stroke,3);click(160,150);
let output=context.window.rafexPlanMarksV480.svg(context.m2LayoutSymbols);assert(output.includes('x="160" y="150"'));assert(output.includes('font-size:12px'));
context.m2SymbolChoice='mark-circle';fields.rafexMarkText480.value='';context.m2CreateSymbol();click(200,200);click(230,240);assert.equal(context.m2LayoutSymbols[1].w,100);assert.equal(context.m2LayoutSymbols[1].x,150);
context.m2SymbolChoice='mark-rect';context.m2CreateSymbol();click(300,300);click(340,320,true);assert.equal(context.m2LayoutSymbols[2].w,40);assert.equal(context.m2LayoutSymbols[2].h,40);
const saved=JSON.stringify(context.m2LayoutSymbols),offsets=JSON.stringify(context.m2DimensionOffsets);context.m2LayoutSymbols=JSON.parse(saved);context.m2DimensionOffsets=JSON.parse(offsets);assert.equal(context.window.rafexPlanMarksV480.svg(context.m2LayoutSymbols).includes('Yükleme alanı'),true);
const count=context.m2LayoutSymbols.length;context.m2CreateSymbol();click(2,3);listeners.keydown[0]({key:'Escape',preventDefault(){},stopImmediatePropagation(){}});click(40,50);assert.equal(context.m2LayoutSymbols.length,count);
context.m2LayoutSymbols=JSON.parse(snapshots.at(-1)).symbols;assert.equal(context.m2LayoutSymbols.length,2,'undo must preserve earlier marks');
assert.equal(snapshots.length,3);
const fixture='m2LayoutSymbols.forEach((symbol)=>{\n          const selected=1;\n}); html += m2UserNotes.map((note) => note); function m2SymbolDistanceGuides(symbol){} </body>';
const transformed=transform(fixture);assert.equal(transform(transformed),transformed);assert(transformed.includes('?.svg(m2LayoutSymbols)'));assert(transformed.includes('isMark(symbol))return ""'));
for(const match of transformed.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
console.log('PASS: arrow direction, center-radius circle, corner rectangle/Shift-square, color/stroke/text, drawing without area + separate third-click label placement, empty text, cancellation, undo, JSON reload, movable label keys, safe SVG and idempotent injection.');
