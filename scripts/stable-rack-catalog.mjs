// Project copies keep their own IDs; registry identity survives every import.
export function mergeRackCatalog(current, incoming) {
  const clone=value=>JSON.parse(JSON.stringify(value));
  const system=e=>e.__rafexSystem||e.system||e.drawing?.rafexSystem||e.drawing?.systemType||'b2b';
  const key=e=>system(e)+':'+e.id;
  const ignored=new Set(['rafexCatalogKey','rafexOriginalTypeName','rafexGlobalTypeLetter','rafexSystemLabel','rafexSystem','typeName','typeColor','name','logId','createdAt','projectUuid']);
  const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().filter(k=>!ignored.has(k)).map(k=>[k,canonical(value[k])])):value;
  const fingerprint=e=>JSON.stringify([system(e),canonical(e.__rafexSnapshot||e.drawing||{})]);
  const letter=n=>{let s='';for(;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
  const result=[],byOrigin=new Map(),byContent=new Map(),names=new Set();
  const aliases={};
  function add(raw,registry){
    const entry=clone(raw),origin=entry.registryKey||(registry?key(entry):null),fp=fingerprint(entry);
    const existing=(origin&&byOrigin.get(origin))||byContent.get(fp);
    if(existing){aliases[key(entry)]=key(existing);if(origin){existing.registryKey=existing.registryKey||origin;byOrigin.set(origin,existing);}return;}
    let name=String(entry.name||'').trim();
    if(!name||names.has(name.toUpperCase())){let n=1;while(names.has(letter(n)))n++;name=letter(n);}
    names.add(name.toUpperCase());entry.name=name;
    if(origin)entry.registryKey=origin;
    entry.__rafexUnified=true;entry.__rafexSystem=system(entry);
    entry.drawing=clone(entry.__rafexSnapshot||entry.drawing||{});
    entry.drawing.rafexGlobalTypeLetter=name;
    entry.__rafexSnapshot=clone(entry.drawing);
    result.push(entry);byContent.set(fp,entry);if(origin)byOrigin.set(origin,entry);
  }
  (current||[]).forEach(e=>add(e,false));
  (incoming||[]).forEach(e=>add(e,true));
  return {entries:result,aliases};
}
