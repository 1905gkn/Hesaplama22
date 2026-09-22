(()=>{
 'use strict';
 window.rafexCommitCustomTypeV184=(rack,entry,previous)=>{
  entry=structuredClone(entry);
  const system=entry.__rafexSystem||entry.system||entry.drawing.rafexSystem;
  const catalog=window.rafexProjectTypesV133||[],old=catalog.find(t=>(t.__rafexSystem||t.system)+':'+t.id===previous?.rafexCatalogKey);
  const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
  const unchanged=previous?.rackDetail?.views&&rack.rackDetail?.views&&JSON.stringify(stable(previous.rackDetail.views))===JSON.stringify(stable(rack.rackDetail.views));
  let reused=false;
  if(old&&entry.name===previous.typeName&&unchanged){entry=old;reused=true;}
  else if(catalog.some(t=>t.name===entry.name)){
   // Editing one module must not overwrite the definition used by other modules.
   let n=0,name;const letter=value=>{let out='';for(;value;value=Math.floor((value-1)/26))out=String.fromCharCode(65+(value-1)%26)+out;return out;};
   do{name=letter(++n)}while(catalog.some(t=>t.name===name));
   entry={...entry,id:-Math.max(Date.now(),...catalog.map(t=>Math.abs(Number(t.id)||0)+1)),name};
  }
  if(!reused&&catalog.some(t=>(t.__rafexSystem||t.system)===system&&String(t.id)===String(entry.id))){
   let id=-1;while(catalog.some(t=>String(t.id)===String(id)))id--;entry.id=id;
  }
  const key=system+':'+entry.id,name=entry.name;
  if(reused){Object.assign(rack,{typeName:name,rafexGlobalTypeLetter:name,rafexOriginalTypeName:name,rafexSectionLetter:name,rafexCatalogKey:key});window.rafexSelectedCatalogKey=key;return;}
  for(const target of [rack,entry.drawing])Object.assign(target,{typeName:name,rafexGlobalTypeLetter:name,rafexOriginalTypeName:name,rafexSectionLetter:name,rafexCatalogKey:key});
  entry.__rafexSnapshot=structuredClone(entry.drawing);
  if(Array.isArray(window.rafexProjectTypesV133)){
   const types=window.rafexProjectTypesV133.filter(item=>!(String(item.id)===String(entry.id)&&(item.__rafexSystem||item.system)===system));
   window.rafexProjectTypesV133=[...types,structuredClone(entry)];
  }
  window.rafexSelectedCatalogKey=key;
 };
 window.rafexHistoryPalletsV184=payload=>{
  const racks=payload.areas?.length?payload.areas.flatMap(area=>area.layout?.racks||[]):Array.isArray(payload.layout?.racks)?payload.layout.racks:[payload.drawing].filter(Boolean);
  return racks.reduce((sum,r)=>sum+(r.b2bLayout?(Number(r.b2bLayout.palletCount)||0)*(Number(r.levels)||0)*(Number(r.b2bLayout.rowCount)||1):(Number(r.bays)||0)*(Number(r.levels)||0)*(Number(r.depth)||0)),0);
 };
 window.rafexUniquePalletRowsV184=types=>{
  const seen=new Set();return types.filter(entry=>{
   const d=entry.drawing||entry,key=JSON.stringify([entry.rafexSystem||d.rafexSystem||'',String(entry.name||d.typeName||'').trim().toLocaleUpperCase('tr-TR'),...['palD','palW','palletHeight','palletWeight'].map(k=>Number(d[k])||0)]);
   if(seen.has(key))return false;seen.add(key);return true;
  });
 };
})();
