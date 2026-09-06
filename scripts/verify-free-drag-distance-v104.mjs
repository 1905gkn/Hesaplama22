import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {transform,helpers} from './patch-free-drag-distance-v104.mjs';
const html=fs.readFileSync(process.argv[2]||'.tmp-cold-store-before.html','utf8');
const patched=transform(html);
assert.equal(transform(patched),patched);
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'rafex-drag-build-'));
fs.mkdirSync(path.join(fixture,'dist/server'),{recursive:true});
const file=path.join(fixture,'dist/server/index.js');
fs.writeFileSync(file,`const HTML_BASE64 = '${Buffer.from(html).toString('base64')}';`);
execFileSync(process.execPath,[path.resolve('scripts/patch-free-drag-distance-v104.mjs')],{cwd:fixture});
assert.equal(Buffer.from(fs.readFileSync(file,'utf8').match(/HTML_BASE64 = '([^']+)'/)[1],'base64').toString(),patched,'Production entrypoint must write optimized code');
function fn(name){
  const start=html.indexOf('      function '+name+'(');
  assert(start>=0,name+' missing');
  const end=html.indexOf('\n      }',start);
  assert(end>=0,name+' end missing');
  const source=html.slice(start,end+8);
  new vm.Script(source);return source;
}
const originalPrepare=fn('m2PerfDistancePrepare'),originalNearest=fn('m2PerfLiveNearestRackGap');
function create(racks,optimized){
  const calls={bounds:0,signatures:0};
  const state={racks:structuredClone(racks),drag:null,points:[{x:0,y:0},{x:1000,y:0},{x:1000,y:650},{x:0,y:650}],closed:true,scale:.01};
  const context=vm.createContext({window:{},m2LayoutState:state,m2LayoutSymbols:[],calls,
    m2RackBounds:(r)=>{calls.bounds++;const w=(r.angle===90?r.h:r.w),h=(r.angle===90?r.w:r.h);return{left:r.x,right:r.x+w,top:r.y,bottom:r.y+h};},
    m2SymbolBounds:s=>({left:s.x,right:s.x+s.w,top:s.y,bottom:s.y+s.h}),
    m2RackClearanceMm:()=>100,
  });
  vm.runInContext(`const m2PerfDistanceIndex={signature:'',cellSize:50,activeComputes:0,bounds:new Map(),grid:new Map(),nearest:new Map(),columnNearest:new Map(),wallMeasurements:new Map(),stats:{rebuilds:0}};
    function m2CombinedRackBounds(r){const members=r.joinGroup?m2LayoutState.racks.filter(x=>x.joinGroup===r.joinGroup):[r],b=members.map(m2RackBounds);return{left:Math.min(...b.map(x=>x.left)),right:Math.max(...b.map(x=>x.right)),top:Math.min(...b.map(x=>x.top)),bottom:Math.max(...b.map(x=>x.bottom))};}
    function m2PerfDistanceCellKey(x,y){return x+':'+y;}
    ${fn('m2PerfDistanceSignature').replace('const rackPart=', 'calls.signatures++;const rackPart=')}
    ${fn('m2PerfLiveGapCandidate')}
    ${optimized?originalPrepare.replace('function m2PerfDistancePrepare(', 'function m2PerfDistancePrepareBaseV104(')+helpers:originalPrepare+originalNearest}
    globalThis.prepare=m2PerfDistancePrepare;globalThis.nearest=m2PerfLiveNearestRackGap;globalThis.table=m2PerfDistanceIndex;
  `,context);
  return{context,state,calls};
}
function canonical(table){return JSON.stringify({bounds:Array.from(table.bounds).sort((a,b)=>a[0]-b[0]),grid:Array.from(table.grid,([k,v])=>[k,[...v].sort((a,b)=>a-b)]).sort((a,b)=>a[0].localeCompare(b[0]))});}
function result(gap){return gap?JSON.stringify({id:gap.other.id,direction:gap.direction,distance:gap.distance,ax:gap.ax,ay:gap.ay,bx:gap.bx,by:gap.by,clearanceMm:gap.clearanceMm}):'null';}
let seed=17;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
function layout(n){return Array.from({length:n},(_,i)=>({id:i+1,x:(i%26)*35+rand()*4,y:Math.floor(i/26)*34+rand()*4,w:10+rand()*12,h:12+rand()*15,angle:i%7===0?90:0,staged:i%31===0,freePlacement:i%43===0,joinGroup:i<3?'joined':''}));}
const report=[];
for(const n of [390,1200]){
  const racks=layout(n),base=create(racks,false),fast=create(racks,true);
  for(const mode of ['single','joined','selectionGroup','symbols']){
    for(const env of [base,fast]){env.state.drag={id:5,groupMembers:mode==='single'?[]:[{id:5},{id:6},{id:7}],selectionGroup:mode==='selectionGroup',symbolMembers:mode==='symbols'?[{id:1}]:[]};for(const id of [5,6,7])env.state.racks[id-1].joinGroup=mode==='joined'?'moving-group':'';env.context.m2LayoutSymbols=mode==='symbols'?[{id:1,type:'column',x:300,y:300,w:20,h:20}]:[];}
    for(let frame=0;frame<30;frame++){
      for(const env of [base,fast]){for(const id of [5,...(mode==='single'?[]:[6,7])]){const rack=env.state.racks[id-1];rack.x+=.83;rack.y+=frame%2?.47:-.12;}if(mode==='symbols')env.context.m2LayoutSymbols[0].x+=.2;}
      base.context.prepare();fast.context.prepare();
      assert.equal(canonical(fast.context.table),canonical(base.context.table),`${n} ${mode} ${frame}: index differs`);
      assert.equal(result(fast.context.nearest(fast.state.racks[4])),result(base.context.nearest(base.state.racks[4])),`${n} ${mode} ${frame}: gap differs`);
    }
    for(const env of [base,fast]){env.state.drag=null;env.context.prepare();}
    assert.equal(canonical(fast.context.table),canonical(base.context.table),'release index differs');
  }
  const timings={};
  for(const [name,optimized] of [['before',false],['after',true]]){
    const env=create(racks,optimized);env.state.drag={id:5};env.context.prepare();env.calls.bounds=0;env.calls.signatures=0;
    const start=performance.now();
    for(let i=0;i<150;i++){env.state.racks[4].x+=.05;env.context.prepare();env.context.prepare();env.context.nearest(env.state.racks[4]);env.context.prepare();}
    timings[name]={ms:Number((performance.now()-start).toFixed(2)),...env.calls};
  }
  report.push({racks:n,...timings});
}
console.log(JSON.stringify({pass:true,checks:'Exact gap and spatial grid parity for 390/1200 racks, rotated racks, groups, moving columns and release; idempotent patch; whole modified script compiles',benchmark:report},null,2));
