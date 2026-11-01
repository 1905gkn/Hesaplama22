import {driveInUprightHeight} from './drive-in-height.mjs';
const num=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
const pos=(v,f)=>num(v)>0?Number(v):f;
const count=(v,f,max=100)=>Math.max(1,Math.min(max,Math.round(pos(v,f))));
export function rackSystem(r){
 if(r.konsol||r.spec?.system==='konsol'||r.layoutView==='konsol-top')return 'konsol';
 if(r.b2b?.mr||r.plan?.mr||r.b2bLayout?.palletType==='mr')return 'mr';
 const tag=String(r.rafexSystem||r.systemType||r.rackDetail?.system||'').toLowerCase();
 if(['drive','drivein','drive-in'].includes(tag))return 'drive';
 if(['konsol','cantilever'].includes(tag))return 'konsol';if(tag==='mr')return 'mr';
 if(r.b2b||r.b2bLayout||tag==='b2b')return 'b2b';return 'mekik2';
}
export function layoutSnapshot(state,optionsFor=()=>({})){
 const scale=pos(state.scale,.04),unit=1/(scale*1000);
 return {selectedId:state.selected,showAreaDimensions:!!state.showAreaDimensions,edgeDimensions:[...(state.edgeDimensions||[])],points:(state.points||[]).map(p=>({x:p.x*unit,z:p.y*unit})),closed:!!state.closed,breaks:[...(state.pathBreaks||[])],racks:(state.racks||[]).map(r=>{
  const system=rackSystem(r),o=optionsFor(r,system)||{};if(system==='mekik2'||system==='drive')r={...r,...o,id:r.id,x:r.x,y:r.y,w:r.w,h:r.h,angle:r.angle};const b=r.b2b||{},k=r.konsol||r.spec||{},l=r.b2bLayout||{};
  const width=(system==='b2b'&&Number(o.sectionWidth)>0?Number(o.sectionWidth)+2*pos(o.footWidth,pos(r.footType,100)):pos(r.widthMm,pos(r.totalWidth,r.w/scale)))/1000,depth=pos(r.depthMm,pos(r.railLength,r.h/scale))/1000;
  const levels=count(o.levels||k.levels||r.levels||b.levels,4,30),palletHeight=pos(o.palletHeight,pos(r.palletHeight,pos(b.palletHeight,1200)))/1000;
  const height=system==='drive'?driveInUprightHeight(r)/1000:pos(system==='konsol'?o.height||k.height:o.uprightHeight||o.footHeight,pos(r.sideUprightHeight,pos(r.totalRackHeight,pos(b.footHeight,5000))))/1000;
  const foot=pos(o.footWidth,pos(r.footType,system==='mr'?60:100))/1000,beam=pos(o.traverseHeight,pos(r.traverseHeight,system==='mr'?75:100))/1000;
  const floors=[],beamYs=[],heights=[];
  if(system==='b2b'){
   const first=o.firstPalletPosition||b.firstPalletPosition||'ground';let previousTop=0;
   for(let i=0;i<levels;i++){
    const ground=first!=='traverse'&&i===0,idx=first==='traverse'?i:i-1;
    let beamY=ground?null:(Number.isFinite(o.traverseBottoms?.[idx])?o.traverseBottoms[idx]/1000:i===0?num(o.firstFloorGap??b.firstFloorGap,200)/1000:previousTop+num(o.levelClearances?.[i-1]??o.palletTraverseGap,200)/1000);
    const ph=pos(o.palletHeights?.[i],pos(b.customLevels?.[i]?.palletHeight,palletHeight*1000))/1000;
    if(!ground&&b.customLevels?.[i-1]?.interval>0&&!Number.isFinite(o.traverseBottoms?.[idx]))beamY=floors[i-1]+b.customLevels[i-1].interval/1000-beam;
    const y=ground?0:beamY+pos(o.traverseHeights?.[idx],beam*1000)/1000;floors.push(y);beamYs.push(beamY);heights.push(ph);previousTop=y+ph;
   }
  }else for(let i=0;i<levels;i++){
   const y=system==='mr'?(num(o.firstTraverse??b.firstTraverse??r.firstRailHeight,200)+i*pos(o.levelGap||b.levelGap||r.levelH,1000))/1000:system==='konsol'?height*(i+1)/(levels+1):(num(r.firstRailHeight,430)+i*pos(r.levelH,palletHeight*1000+380))/1000;
   floors.push(y);beamYs.push(y-beam);heights.push(palletHeight);
  }
  const positions=(r.palletPositions||[]).map(v=>num(v)/1000).filter(v=>v>=0&&v<depth),palletDepth=pos(o.palletDepth,pos(l.palletDepth,pos(r.palD,1200)))/1000;
  const footZ=[],footFrames=[];let cursor=0;for(let i=0;i<(r.plan?.feet||[]).length;i++){const f=num(r.plan.feet[i])/1000;if(f>0){footZ.push(cursor,cursor+f);footFrames.push([cursor,cursor+f]);cursor+=f}cursor+=num(r.plan.braces?.[i])/1000;}
  return {system,id:r.id,name:String(r.typeName||r.blockName||'Raf'),typeColor:String(r.typeColor||'#247fba'),x:(num(r.x)+num(r.w)/2)*unit,z:(num(r.y)+num(r.h)/2)*unit,angle:-num(r.angle)*Math.PI/180,width,depth,height,levels,foot,beam,floors,beamYs,palletHeights:heights,palletHeight,palletDepth,railHeight:pos(r.railHeight,170)/1000,palletWidth:pos(o.palletWidth,pos(l.palletWidth,pos(r.palW,800)))/1000,
   footColor:String(system==='konsol'?'pgv':b.uprightFinish||b.footColor||r.mekikFootColor||o.footColor||'ral5010'),beamColor:String(k.armColor||b.traverseFinish||b.traverseColor||r.mekikTraverseColor||o.traverseColor||'ral1007'),
   rows:count((o.rowType?o.rowType==='double'?2:1:l.rowCount)||(b.rowType==='double'?2:1),1,2),rowGap:num(o.rowGap??l.rowGap??b.rowGap,200)/1000,frameDepth:((b.palletOverhang??l.palletOverhang)!=null?Math.max(100,palletDepth*1000-2*num(b.palletOverhang??l.palletOverhang,50)):pos(l.frameDepth,Math.max(100,palletDepth*1000-2*num(o.frontPalletGap,50))))/1000,frameHeights:structuredClone(o.frameHeights||[]),
   pallets:count(o.palletCount||l.palletCount||b.palletCount||r.bays,3,12),bays:count(r.bays,1),modules:count(o.modules||b.modules,1),positions,footZ,footFrames,
   uprightCount:count(o.uprightCount||k.count||r.plan?.feet?.length,5),spacing:pos(o.spacing||k.spacing||r.palW,1500)/1000,arm:pos(o.armLength||k.arm||k.armLength||r.palD,1200)/1000,baseDepth:pos(o.baseDepth||k.baseDepth||k.arm,1200)/1000,doubleSided:o.doubleSided??(k.side==='double'||k.doubleSided===true),productHeight:pos(o.productHeight||k.productHeight,300)/1000,loadType:o.loadType||k.loadType||'profile',
   accessories:structuredClone(o.accessories||b.accessories||[]),tunnelHeight:num(b.tunnelHeight??o.tunnelHeight)/1000};
 })};
}
