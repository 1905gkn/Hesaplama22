// Plans are independent drawings: preserve each orientation and isolate source IDs.
export function combinePlans(items){
  if(!items.length||items.some(i=>!i.result))throw Error('Her dosyanın analizi tamamlanmalı.');
  if(items.length===1)return {...items[0].result,files:[items[0].name]};
  const result={types:[],importTypes:[],placements:[],blocks:[],conflicts:[],warnings:[],rows:0,files:items.map(i=>i.name),batch:true,reconcileMixedRows:items.some(i=>i.result.reconcileMixedRows),raster:items.some(i=>i.result.raster),warehouseBoundary:null};
  const catalog=new Map();let offset=0;
  const signature=t=>JSON.stringify(Object.fromEntries(Object.entries(t).filter(([k])=>!['key','name'].includes(k)).sort(([a],[b])=>a.localeCompare(b))));
  for(const [index,item] of items.entries()){
    const p=item.result,prefix='F'+(index+1)+':',keys=new Map(),baseKeys=new Map();
    for(const t of p.importTypes){const sig=signature(t);if(!catalog.has(sig)){const type={...t,key:'batch-'+catalog.size};catalog.set(sig,type);result.importTypes.push(type);}keys.set(t.key,catalog.get(sig).key);}
    for(const t of p.types){const type={...t,key:prefix+t.key};baseKeys.set(t.key,type.key);result.types.push(type);}
    const horizontal=p.orientation==='horizontal',shown=p.placements.map(b=>({x:horizontal?b.y:b.x,y:horizontal?b.x:b.y,w:horizontal?b.depth:b.width,h:horizontal?b.width:b.depth}));
    const minX=Math.min(...shown.map(b=>b.x-b.w/2)),maxX=Math.max(...shown.map(b=>b.x+b.w/2)),minY=Math.min(...shown.map(b=>b.y-b.h/2));
    const map=(b,block)=>({...b,id:prefix+b.id,key:(block?keys:baseKeys).get(b.key),row:prefix+b.row,sourceRows:(b.sourceRows||[b.row]).map(r=>prefix+r),sourceIds:(b.sourceIds||[b.id]).map(id=>prefix+id),fileIndex:index,sourceFile:item.name,horizontal,previewX:(horizontal?b.y:b.x)-minX+offset,previewY:(horizontal?b.x:b.y)-minY,previewWidth:horizontal?b.depth:b.width,previewDepth:horizontal?b.width:b.depth});
    result.placements.push(...p.placements.map(b=>map(b,false)));result.blocks.push(...p.blocks.map(b=>map(b,true)));
    result.conflicts.push(...p.conflicts.map(c=>c.map(id=>prefix+id)));result.rows+=p.rows;result.warnings.push(...p.warnings.map(w=>item.name+': '+w));offset+=maxX-minX+3000;
  }
  result.warnings.unshift('Dosyalar ayrı planlar olarak yan yana yerleştirilir; aralarındaki boşluk depo koridor ölçüsü değildir.');
  return result;
}

