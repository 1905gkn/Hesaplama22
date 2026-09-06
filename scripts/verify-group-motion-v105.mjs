import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {helpers} from './patch-free-drag-distance-v104.mjs';
const html=fs.readFileSync('.tmp-cold-store-before.html','utf8');
const original=html.slice(html.indexOf('      function m2GroupTranslationValid('),html.indexOf('      function m2SmoothGroupTranslation('));
const updated=helpers.slice(0,helpers.indexOf('      const m2DragDistanceV104='));
const racks=Array.from({length:504},(_,i)=>({id:i+1,x:20+i%28*30,y:20+Math.floor(i/28)*32,w:20,h:10,angle:i%3===0?90:0}));
const origins=racks.slice(280,308).map(({id,x,y})=>({id,x,y}));
const bounds=(r,x=r.x,y=r.y,a=r.angle)=>{const w=a%180?r.h:r.w,h=a%180?r.w:r.h,cx=x+r.w/2,cy=y+r.h/2;return{left:cx-w/2,right:cx+w/2,top:cy-h/2,bottom:cy+h/2};};
function context(newCode){
  const list=structuredClone(racks),state={racks:list,drag:{}},stats={scans:0,bounds:0};
  const ctx={m2LayoutState:state,m2RackBounds:(...args)=>{stats.bounds++;return bounds(...args)},m2RackInsideArea:(r,x,y,a)=>{const b=bounds(r,x,y,a);return b.left>=0&&b.right<=1000&&b.top>=0&&b.bottom<=650},m2RackOverlapsBlockingSymbol:(r,x,y)=>x<120&&y>350&&y<370,m2PerfCollisionCandidates:()=>list};
  ctx.m2RackOverlapsExcept=(r,x,y,a,ids)=>{stats.scans++;const excluded=new Set(ids.map(Number)),b=bounds(r,x,y,a);return ctx.m2RackOverlapsBlockingSymbol(r,x,y,a)||list.some(o=>{if(o.id===r.id||excluded.has(o.id))return false;const c=ctx.m2RackBounds(o);return b.left<c.right&&b.right>c.left&&b.top<c.bottom&&b.bottom>c.top})};
  vm.createContext(ctx);
  // Run both old/new collision loops in the same VM realm for a fair comparison.
  vm.runInContext(`function m2RackOverlapsExcept(r,x,y,a,ids){const excluded=new Set(ids.map(Number)),b=m2RackBounds(r,x,y,a);return m2RackOverlapsBlockingSymbol(r,x,y,a)||m2PerfCollisionCandidates(b).some(o=>{if(o.id===r.id||excluded.has(Number(o.id)))return false;const c=m2RackBounds(o);return b.left<c.right&&b.right>c.left&&b.top<c.bottom&&b.bottom>c.top})}`,ctx);
  vm.runInContext(newCode?original.replaceAll('function m2GroupTranslationValid(','function m2GroupTranslationValidBaseV105(').replaceAll('function m2ApplyGroupTranslation(','function m2ApplyGroupTranslationBaseV105(')+updated:original,ctx);
  return {ctx,stats};
}
const old=context(false),next=context(true);
for(let x=-40;x<=40;x+=4)for(let y=-40;y<=40;y+=4)assert.equal(next.ctx.m2GroupTranslationValid(origins,x,y),old.ctx.m2GroupTranslationValid(origins,x,y),`parity ${x},${y}`);
for(const [x,y] of [[1,2],[2,3],[-1,-2]]){old.ctx.m2ApplyGroupTranslation(origins,x,y);next.ctx.m2ApplyGroupTranslation(origins,x,y);assert.deepEqual(next.ctx.m2LayoutState.racks,old.ctx.m2LayoutState.racks);}
next.ctx.m2LayoutState.drag=null;assert.equal(next.ctx.m2GroupTranslationValid(origins,3,4),old.ctx.m2GroupTranslationValid(origins,3,4));
const timings=[];
for(const optimized of [false,true]){const {ctx,stats}=context(optimized),start=performance.now();for(let i=0;i<150;i++){ctx.m2GroupTranslationValid(origins,i%3,i%4);ctx.m2ApplyGroupTranslation(origins,i%3,i%4);}timings.push({optimized,ms:+(performance.now()-start).toFixed(2),...stats});}
console.log(JSON.stringify({pass:true,racks:504,moving:28,checks:'441 collision/wall/rotation cases, group positions, release fallback',timings},null,2));
