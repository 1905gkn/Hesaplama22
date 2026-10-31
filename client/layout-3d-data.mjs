const positive=(v,f)=>Number.isFinite(Number(v))&&Number(v)>0?Number(v):f;
export function layoutSnapshot(state,optionsFor=()=>({})){
 const scale=positive(state.scale,.04),unit=1/(scale*1000);
 return {points:(state.points||[]).map(p=>({x:p.x*unit,z:p.y*unit})),closed:!!state.closed,breaks:[...(state.pathBreaks||[])],racks:(state.racks||[]).map(r=>{
  const o=optionsFor(r)||{},b=r.b2b||{},width=positive(r.widthMm,r.w/scale)/1000,depth=positive(r.depthMm,r.h/scale)/1000;
  const height=positive(o.footHeight,positive(r.sideUprightHeight,positive(r.totalRackHeight,positive(b.footHeight,5000))))/1000;
  const levels=Math.max(1,Math.min(30,Math.round(positive(r.levels,positive(b.levels,4))))),palletHeight=positive(o.palletHeight,positive(r.palletHeight,1200))/1000;
  const floors=[];let y=o.firstPalletPosition==='traverse'?positive(o.firstFloorGap,200)/1000:0;
  for(let i=0;i<levels;i++){if(Array.isArray(o.traverseBottoms)&&Number.isFinite(o.traverseBottoms[i]))y=Number(o.traverseBottoms[i])/1000;floors.push(y);y+=positive(b.customLevels?.[i]?.interval,positive(r.levelH,(positive(o.palletHeights?.[i],palletHeight*1000)+Number(o.levelClearances?.[i]??o.palletTraverseGap??200)+positive(o.traverseHeight,100))))/1000;}
  return {footColor:String(b.footColor||o.footColor||'ral5010'),beamColor:String(b.traverseColor||o.traverseColor||'ral1007'),id:r.id,name:String(r.typeName||r.blockName||'Raf'),x:(Number(r.x)+Number(r.w)/2)*unit,z:(Number(r.y)+Number(r.h)/2)*unit,angle:-(Number(r.angle)||0)*Math.PI/180,width,depth,height,rows:Math.max(1,Math.min(2,Number(r.b2bLayout?.rowCount)||(b.rowType==='double'?2:1))),rowGap:Math.max(0,Number(r.b2bLayout?.rowGap??b.rowGap??200))/1000,frameDepth:positive(r.b2bLayout?.frameDepth,1100)/1000,frameHeights:o.frameHeights||[],floors,palletHeight,pallets:Math.max(1,Math.min(12,Number(r.bays)||Number(b.palletCount)||3)),deep:!r.b2bLayout,footPitch:positive(r.footLy,1200)/1000};
 })};
}
