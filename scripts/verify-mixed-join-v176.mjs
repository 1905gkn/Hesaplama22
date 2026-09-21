import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {mixedJoin,mixedJoinPosition,transform} from './patch-mixed-join-v176.mjs';
const make=(id,rows,x)=>({id,x,y:100,w:100,h:rows===2?90:40,angle:0,footProfile:'HR90.80.2,0',b2b:{},b2bLayout:{rowCount:rows,frameDepth:1100}});
for(const row of ['1','2'])for(const reverse of [false,true]){
 const double=make(1,2,100),single=make(2,1,300);let undo=0,prompts=0;
 const ctx={first:reverse?single:double,second:reverse?double:single,window:{prompt:()=>{prompts++;return row}},document:{getElementById:()=>({classList:{remove(){}},setAttribute(){}})},m2B2BFootWidth:()=>10,m2RackInsideArea:()=>true,m2RackOverlapsExcept:()=>false,m2PushUndo:()=>undo++,m2RenderLayout(){},m2LayoutState:{scale:1,racks:[double,single]},m2JoinMode:true,m2JoinFirstRackId:1};
 const run=()=>vm.runInNewContext(mixedJoinPosition.toString()+';'+mixedJoin.toString()+';mixedJoin(first,second)',ctx);
 assert.equal(run(),true);assert.equal(single.x,190);assert.equal(single.y,row==='1'?100:150);assert.equal(single.sharedFootWith,1);assert.equal(single.sharedFootSide,'left');assert.equal(undo,1);assert.equal(prompts,1);
 assert.equal(ctx.m2LayoutState.racks.reduce((n,r)=>n+2*r.b2bLayout.rowCount-(r.sharedFootWith?r.b2bLayout.rowCount:0),0),5);
}
for(const scenario of ['cancel','different','wall','sameRows']){
 const a=make(1,2,100),b=make(2,1,300);if(scenario==='different')b.footProfile='HR120.80.3,0';if(scenario==='sameRows')b.b2bLayout.rowCount=2;
 const before=JSON.stringify([a,b]);let prompts=0;
 const ctx={first:a,second:b,window:{prompt:()=>{prompts++;return scenario==='cancel'?null:'1'}},document:{getElementById:()=>({})},m2B2BFootWidth:()=>10,m2RackInsideArea:()=>false,m2RackOverlapsExcept:()=>false,m2PushUndo:()=>assert.fail('Unexpected mutation'),m2LayoutState:{scale:1,racks:[a,b]}};
 vm.runInNewContext(mixedJoinPosition.toString()+';'+mixedJoin.toString()+';mixedJoin(first,second)',ctx);
 assert.equal(JSON.stringify([a,b]),before);if(['different','sameRows'].includes(scenario))assert.equal(prompts,0);
}
const html=transform(fs.readFileSync('outputs/live-after-v170.html','utf8'));assert.equal(transform(html),html);
for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(match[1].trim())new vm.Script(match[1]);
console.log('PASS: upper/lower alignment, both selection orders, one shared foot (5 total), cancel/mismatch/wall safety, unchanged same-row flow, script syntax.');
