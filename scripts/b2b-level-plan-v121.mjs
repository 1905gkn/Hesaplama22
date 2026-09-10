export function physicalLevels(o) {
  const count=o.firstPalletPosition==='traverse'?o.levels:Math.max(0,o.levels-1),out=[];
  let bottom=Number(o.firstFloorGap)||0;
  for(let i=0;i<count;i++){
    const loadIndex=o.firstPalletPosition==='traverse'?i:i+1;
    if(Array.isArray(o.traverseBottoms)&&Number.isFinite(o.traverseBottoms[i]))bottom=o.traverseBottoms[i];
    else if(i===0&&o.firstPalletPosition!=='traverse')bottom=(o.palletHeights?.[0]||o.palletHeight||1200)+(o.levelClearances?.[0]??o.palletTraverseGap??200);
    else if(i>0){const previousLoad=loadIndex-1;bottom=out[i-1].bottom+out[i-1].beam+(o.palletHeights?.[previousLoad]||o.palletHeight||1200)+(o.levelClearances?.[previousLoad]??o.palletTraverseGap??200)}
    out.push({index:i,level:i+1,loadIndex,bottom,beam:o.traverseHeights?.[i]||o.traverseHeight||140});
  }
  return out;
}
export function manualOptions(o,rows) {
  if(!Array.isArray(rows)||!rows.length)return o;
  o={...o,firstPalletPosition:'traverse',traverseBottoms:[],traverseHeights:[],palletHeights:[],levelClearances:[]};
  let bottom=0;
  rows.slice(0,o.levels).forEach((r,i)=>{
    bottom+=Number(r.distance)||0;
    o.traverseBottoms.push(bottom);o.traverseHeights.push(Number(String(r.traverseType).match(/\d+/)?.[0])||o.traverseHeight||140);
    o.palletHeights.push(Number(r.palletHeight)||o.palletHeight||1200);
    if(i)o.levelClearances[i-1]=Math.max(0,Number(r.distance)-o.traverseHeights[i-1]-o.palletHeights[i-1]);
  });
  o.firstFloorGap=o.traverseBottoms[0];return o;
}
