function physicalKey(block){
 const options=block.detailView?.options||block.rack?.nativeOptions;
 if(!options)return JSON.stringify([block.detail,block.detailView?.technical,block.rack]);
 const ignored=new Set(['language','dimensions','dimensionScale','dimensionLabelScale','requestedLevelGap']);
 return JSON.stringify(options,(key,value)=>ignored.has(key)?undefined:value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(k=>[k,value[k]])):typeof value==='number'&&Number.isFinite(value)?Number(value.toFixed(6)):value);
}
export function customerBlockGroups(blocks=[]){
 const groups=new Map();
 for(const block of blocks){const key=JSON.stringify([block.system,block.name]);if(!groups.has(key))groups.set(key,{name:block.name,system:block.system,variants:[],keys:new Map()});const group=groups.get(key),variant=physicalKey(block);
  if(group.keys.has(variant)){const target=group.keys.get(variant);target.count=(target.count||0)+(block.count||0);target.rackIds=[...new Set([...(target.rackIds||[]),...(block.rackIds||[])])];}
  else{const copy={...block,rackIds:[...(block.rackIds||[])]};group.keys.set(variant,copy);group.variants.push(copy);}
 }
 return [...groups.values()].map(({keys,...group})=>group);
}
export function blockVariantSummary592(block){
 const o=block.detailView?.options||block.rack?.nativeOptions||{},r=block.rack||{},height=Number(o.footHeight??o.uprightHeight??r.height*1000)||0,levels=o.levels??r.levels??0,collections=o.collectionFloors?.length||0;
 return [levels+' kat',collections?collections+' toplama katı':'',height?height.toLocaleString('tr-TR')+' mm':'',Number(block.count)>0?block.count+' adet':''].filter(Boolean).join(' · ');
}
