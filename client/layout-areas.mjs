export function namespaceAreaLayout(source,id,name){
 const data=structuredClone(source),key=String(id),rackId=v=>key+':'+String(v);
 const measure=m=>({...m,key:key+':'+m.key,rackIds:(m.rackIds||[]).map(rackId)});
 data.areaId=key;data.areaName=String(name);
 data.racks=data.racks.map(r=>({...r,sourceId:r.id,id:rackId(r.id),areaId:key,areaName:String(name)}));
 data.symbols=(data.symbols||[]).map(s=>({...s,id:key+':symbol:'+s.id}));
 if(data.selectedId!=null)data.selectedId=rackId(data.selectedId);
 data.visibleClearances=(data.visibleClearances||[]).map(measure);
 data.clearancesByRack=Object.fromEntries(Object.entries(data.clearancesByRack||{}).map(([id,rows])=>[rackId(id),rows.map(measure)]));
 return data;
}
export function mergeAreaLayouts(areas,activeAreaId){
 if(!areas.length)throw Error('Yerleşim alanı bulunamadı.');
 const normalized=areas.map((area,index)=>({id:String(area.id),name:String(area.name||'Alan '+(index+1)),imageIndex:index,layout:namespaceAreaLayout(area.layout,area.id,area.name)}));
 const active=normalized.find(a=>a.id===String(activeAreaId))||normalized[0];
 return {...active.layout,racks:normalized.flatMap(a=>a.layout.racks),activeAreaId:active.id,areas:normalized};
}
export function selectedAreaLayout(layout,id){return layout.areas?.find(a=>a.id===String(id||layout.activeAreaId))?.layout||layout;}
