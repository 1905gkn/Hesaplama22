import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {transform} from './free-wall-start-v509.mjs';
const html=fs.readFileSync('dist/index.html','utf8');assert.equal(transform(html),html);
function cut(name){const i=html.indexOf('function '+name+'(');assert(i>=0,name);const rest=html.slice(i),next=rest.slice(10).search(/\n\s*function /),script=rest.indexOf('</script>');return rest.slice(0,script>=0?Math.min(next+10,script):next+10);}
const element={textContent:'',value:'1000',classList:{add(){},remove(){}}};const doc={getElementById:()=>element};
const c=vm.createContext({window:{},document:doc,$:()=>element,m2LayoutState:{mode:'idle',points:[],racks:[{id:1,x:900,y:900}],pathBreaks:[],scale:1},m2PushUndo(){},m2RenderLayout(){},m2ClearMultiSelection(){},m2SetAutoFillControlsActive(){},m2AutoFillDraft:{rackId:1},m2LayoutTool:'dimension',m2SeismicDraft:null,m2ProtectionDraft:null,m2SymbolDrag:null,m2NoteDrag:null,m2DimensionDrag:null,fmt:String});
vm.runInContext(['m2CurrentDrawPoint','m2SnapOrtho','m2InsertFreePoint','m2StartFreeArea','m2ResumeFreeArea','m2AddMeasuredSegment'].map(cut).join('\n'),c);
const at=(x,y)=>vm.runInContext('m2InsertFreePoint(m2SnapOrtho({x:'+x+',y:'+y+'}))',c);
c.m2StartFreeArea();assert.equal(c.m2CurrentDrawPoint(),null);at(123,234);assert.equal(c.m2CurrentDrawPoint().x,123);assert.equal(c.m2CurrentDrawPoint().y,234);at(345,240);assert.equal(c.m2CurrentDrawPoint().y,234,'Subsequent wall remains orthogonal');assert.equal(c.m2LayoutState.racks.length,1);
// Start again from arbitrary empty space, preserving the previous wall without an unwanted connecting segment.
c.m2LayoutState.mode='idle';c.m2StartFreeArea();assert.equal(c.m2CurrentDrawPoint(),null);at(700,600);assert.equal(c.m2CurrentDrawPoint().x,700);assert.equal(c.m2CurrentDrawPoint().y,600);assert.equal(c.m2LayoutState.pathBreaks[0],1);assert.equal(c.m2LayoutState.points[0].x,123);
c.m2LayoutState.mode='idle';c.m2ResumeFreeArea(0);assert.equal(c.m2CurrentDrawPoint().x,123,'Existing endpoint resume still works');
// Preserve the closing edge of a previously completed polygon before drawing an independent wall.
c.m2LayoutState={mode:'idle',points:[{x:0,y:0},{x:100,y:0},{x:100,y:100}],racks:[],pathBreaks:[],closed:true};c.m2StartFreeArea();assert.equal(c.m2LayoutState.points.length,4);at(400,500);assert.equal(c.m2LayoutState.pathBreaks[0],3);assert.equal(c.m2LayoutState.points[3].x,0);
// Real native pointer handler: dimensions, racks and symbols cannot steal a wall click.
const i=html.indexOf('svg.onpointerdown = (event) => {'),j=html.indexOf('svg.onpointermove =',i);c.svg={};c.m2SvgPoint=e=>({x:e.clientX,y:e.clientY});vm.runInContext(html.slice(i,j),c);
for(const hit of ['[data-dimension-key]','[data-layout-symbol]','[data-rack]',null]){c.m2LayoutState={mode:'draw',points:[],pathBreaks:[],racks:[],freeWallStartV509:true};c.svg.onpointerdown({clientX:55,clientY:77,target:{closest:s=>s===hit?{dataset:{}}:null}});assert.equal(c.m2LayoutState.points.length,1);assert.equal(c.m2LayoutState.points[0].x,55);}
console.log('PASS v509: arbitrary empty start, preserved walls/racks, no unwanted joining line, closed polygon edge preserved, endpoint resume, overlay/rack/symbol click priority and orthogonal continuation.');
