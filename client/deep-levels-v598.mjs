// Uses the existing shuttle traverse catalogue; no extrapolated capacities.
export const deepTraverseCatalog598=[{grade:'ST37',profile:'50×50×1,5',capacity:1047},{grade:'ST37',profile:'50×60×1,5',capacity:1338},{grade:'ST37',profile:'50×70×1,5',capacity:1652},{grade:'ST52',profile:'50×50×1,5',capacity:1072},{grade:'ST52',profile:'50×60×1,5',capacity:1643},{grade:'ST52',profile:'50×70×1,5',capacity:2366}];
export function driveGroundClearance(config,baseHeight,railHeight){
 if(config?.groundPallet!==true)return 0;
 const h=Number(config.groundPalletHeight??config.levelSpecs?.[0]?.palletHeight??baseHeight)||1200;
 return h+(Number(railHeight)===170?280:260);
}
export function deepLevelModel598(r,specs,catalog=deepTraverseCatalog598){
 if(!specs?.length)return null;
 const n=(v,f)=>v!==null&&v!==''&&Number.isFinite(Number(v))?Number(v):f,levels=Math.max(1,Math.min(30,Math.round(n(r.levels,1)))),drive=r.rafexSystem==='drive'||r.systemType==='drive',count=Math.max(1,r.plan?.feet?.length||1),divisor=Math.max(1,count*2-(drive?0:r.systemType==='fifo'?(r.hasExtra?1:2):(r.hasExtra?0:1))),errors=[];let y=n(r.firstRailHeight,430);
 const floors=[];
 for(let i=0;i<levels;i++){const s=specs[i]||{},weight=n(s.palletWeight,n(r.palletWeight,1000)),palletHeight=n(s.palletHeight,n(r.palletHeight,1200));

  const load=weight*Math.max(1,n(r.depth,1))/divisor,choices=catalog.filter(t=>t.capacity>=load).sort((a,b)=>a.capacity-b.capacity),mode=s.selectionMode==='manual'?'manual':'auto',selected=mode==='manual'?catalog.find(t=>t.grade+'|'+t.profile===s.traverseType):choices.find(t=>t.grade==='ST37')||choices[0],traverseType=selected?selected.grade+'|'+selected.profile:'',traverseHeight=selected?Number(selected.profile.split('×')[1]):50;
  const assembly=drive?(n(r.railHeight,170)===170?280:260):210+traverseHeight;
  const lower=i?floors[i-1]:null;
  if(lower)y=lower.y+lower.palletHeight+assembly+150;
  const explicit=n(s.height,null);if(explicit!==null)y=explicit;
  if(drive&&i===0)y=Math.max(y,driveGroundClearance(r.driveCustomizationV521,r.palletHeight,r.railHeight));
  if(lower&&y<lower.y+lower.palletHeight+assembly)errors.push('K'+(i+1)+': alt palet ile travers/ray bölümü çakışıyor.');
  if(weight<0||palletHeight<300||palletHeight>3000||y<0)errors.push('K'+(i+1)+': geçersiz yük veya yükseklik.');if(!selected)errors.push('K'+(i+1)+': bu yük için katalogda travers önerisi yok.');else if(selected.capacity<load)errors.push('K'+(i+1)+': seçilen travers kapasitesi kat yükünü karşılamıyor.');
  const floor={index:i,y,palletWeight:weight,palletHeight,traverseType,traverseHeight,selectionMode:mode,load,divisor,capacity:selected?.capacity||0,choices:choices.map(t=>t.grade+'|'+t.profile)};floors.push(floor);
 }
 const totalPalletLoad=floors.reduce((s,f,i)=>s+(r.footLoadStart==='first'&&i===0?0:f.palletWeight*Math.max(1,n(r.depth,1))),0),top=floors.at(-1),automatic=Math.ceil((drive?Math.max(...floors.map(f=>f.y+f.palletHeight))+220:Math.max(...floors.map(f=>f.y+f.palletHeight/2)))/50)*50;
 return {floors,errors,totalPalletLoad,automatic,topLoad:Math.max(...floors.map(f=>f.y+f.palletHeight)),minimum:drive?automatic:top.y};
}

// Keep the rail seat fixed while changing only the box-profile depth.
const profileCache598=new WeakMap();
export function beamProfileGeometry598(source,height,axis='y'){
 if(!(height>0))return source;let variants=profileCache598.get(source);if(!variants){variants=new Map();profileCache598.set(source,variants);}const key=axis+':'+height;if(!variants.has(key)){source.computeBoundingBox();const b=source.boundingBox,span=b.max[axis]-b.min[axis],g=source.clone(),p=g.attributes.position,set='set'+axis.toUpperCase(),get='get'+axis.toUpperCase();for(let i=0;i<p.count;i++)p[set](i,b.max[axis]+(p[get](i)-b.max[axis])*height/span);g.computeBoundingBox();g.computeBoundingSphere();variants.set(key,g);}return variants.get(key);
}
