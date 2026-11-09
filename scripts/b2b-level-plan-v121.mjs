export function physicalLevels(o) {
  const count=o.firstPalletPosition==='traverse'?o.levels:Math.max(0,o.levels-1),out=[];
  let bottom=Number(o.firstFloorGap)||0;
  for(let i=0;i<count;i++){
    const loadIndex=o.firstPalletPosition==='traverse'?i:i+1;
    if(Array.isArray(o.traverseBottoms)&&Number.isFinite(o.traverseBottoms[i]))bottom=o.traverseBottoms[i];
    else if(i===0&&o.firstPalletPosition!=='traverse')bottom=(o.palletHeights?.[0]??o.palletHeight??1200)+(o.levelClearances?.[0]??o.palletTraverseGap??200);
    else if(i>0){const previousLoad=loadIndex-1;bottom=out[i-1].bottom+out[i-1].beam+(o.palletHeights?.[previousLoad]??o.palletHeight??1200)+(o.levelClearances?.[previousLoad]??o.palletTraverseGap??200)}
    out.push({index:i,level:i+1,loadIndex,bottom,beam:o.traverseHeights?.[i]||o.traverseHeight||140});
  }
  return out;
}
export function automaticOptions(o) {
  return {...o,traverseBottoms:[],traverseHeights:[],palletHeights:[],levelClearances:[],...(o.firstPalletPosition==='traverse'?{firstFloorGap:200}:{})};
}
export function manualOptions(o,rows) {
  if(!Array.isArray(rows)||!rows.length)return o;
  const wanted=Math.max(1,Math.round(Number(o.levels)||rows.length));
  if(wanted!==rows.length){
    const origin=rows[0].firstPalletPosition||(rows.length>1&&Number(rows.at(-1).distance)===0?'ground':o.firstPalletPosition);
    const original=rows;rows=Array.from({length:wanted},(_,i)=>({...original[Math.min(i,original.length-1)],firstPalletPosition:origin}));
    rows.forEach((r,i)=>{if(origin!=='traverse'&&i===wanted-1)r.distance=0;else if(!(Number(r.distance)>0))r.distance=(Number(r.palletHeight)||o.palletHeight||1200)+(Number(o.palletTraverseGap)||200)+(i?(Number(String(rows[i-1].traverseType).match(/\d+/)?.[0])||o.traverseHeight||140):0);});
  }
  // Manual ground rows have a disabled final distance. Collection floors lift
  // the whole load stack; that sentinel is never a fourth zero-height bay.
  const collection=o.collectionLevels, floors=o.collectionFloors;
  if(collection?.enabled || (Array.isArray(floors)&&floors.length)){
    let start=0;
    if(Array.isArray(floors)&&floors.length)start=Number(floors.at(-1).top)||0;
    else {start=Math.max(0,Number(collection.groundGap)||0);for(const f of collection.floors||[])start+=(Number(f.zsHeight)||({ZS35:55,ZS55:75,ZS65:85})[String(f.traverse).split('|')[0]]||75)+Math.max(100,Number(f.height)||500);}
    const origin=rows[0].firstPalletPosition || (rows.length>1&&Number(rows.at(-1).distance)===0?'ground':o.firstPalletPosition);
    const base=manualOptions({...o,firstPalletPosition:origin,collectionLevels:null,collectionFloors:[]},rows);
    const count=Math.max(1,Number(o.levels)||rows.length), ground=origin!=='traverse', firstBeam=Number(o.traverseHeight)||140;
    const bottoms=Array.from({length:count},(_,i)=>i===0?start:ground?start+firstBeam+base.traverseBottoms[i-1]:start+base.traverseBottoms[i]-base.traverseBottoms[0]);
    const beams=Array.from({length:count},(_,i)=>ground?(i?base.traverseHeights[i-1]:firstBeam):base.traverseHeights[i]);
    return {...base,collectionLevels:collection,collectionFloors:floors,firstPalletPosition:'traverse',firstFloorGap:start,traverseBottoms:bottoms,traverseHeights:beams,levelClearances:bottoms.slice(1).map((b,i)=>Math.max(0,b-bottoms[i]-beams[i]-base.palletHeights[i]))};
  }
  const firstPalletPosition=o.firstPalletPosition==='traverse'?'traverse':'ground';
  o={...o,firstPalletPosition,traverseBottoms:[],traverseHeights:[],palletHeights:[],levelClearances:[]};
  const selected=rows.slice(0,o.levels);
  o.palletHeights=selected.map((r,i)=>firstPalletPosition==='ground'&&i===0&&Number(r.palletHeight)===0?0:Number(r.palletHeight)||o.palletHeight||1200);
  const traverseCount=firstPalletPosition==='traverse'?selected.length:Math.max(0,selected.length-1);
  let bottom=0;
  selected.slice(0,traverseCount).forEach((r,i)=>{
    bottom+=Number(r.distance)||0;
    o.traverseBottoms.push(bottom);o.traverseHeights.push(Number(String(r.traverseType).match(/\d+/)?.[0])||o.traverseHeight||140);
    if(firstPalletPosition==='traverse'){
      if(i)o.levelClearances[i-1]=Math.max(0,Number(r.distance)-o.traverseHeights[i-1]-o.palletHeights[i-1]);
    }else if(i===0)o.levelClearances[0]=Math.max(0,Number(r.distance)-o.palletHeights[0]);
    else o.levelClearances[i]=Math.max(0,Number(r.distance)-o.traverseHeights[i-1]-o.palletHeights[i]);
  });
  o.firstFloorGap=o.traverseBottoms[0]||0;return o;
}

