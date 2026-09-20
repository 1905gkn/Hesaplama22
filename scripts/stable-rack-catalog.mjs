// Project copies keep their own IDs; registry identity survives every import.
export function catalogRecordFingerprint(e) {
  const ignored=new Set(['rafexCatalogKey','rafexOriginalTypeName','rafexGlobalTypeLetter','rafexSystemLabel','rafexSystem','typeName','typeColor','name','logId','createdAt','projectUuid']);
  const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().filter(k=>!ignored.has(k)).map(k=>[k,canonical(value[k])])):value;
  return JSON.stringify([e.__rafexSystem||e.system||e.drawing?.rafexSystem||e.drawing?.systemType||'b2b',canonical(e.__rafexSnapshot||e.drawing||{})]);
}
export function mergeRackCatalog(current, incoming, excluded=[]) {
  const clone=value=>JSON.parse(JSON.stringify(value));
  const system=e=>e.__rafexSystem||e.system||e.drawing?.rafexSystem||e.drawing?.systemType||'b2b';
  const key=e=>system(e)+':'+e.id;
  const fingerprint=catalogRecordFingerprint;
  const letter=n=>{let s='';for(;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s;};
  const validName=value=>/^[A-Z]+$/.test(String(value||'').trim().toUpperCase());
  const reserved=new Set([...(current||[]),...(incoming||[])].filter(e=>!excluded.includes(fingerprint(e))).map(e=>String(e.name||'').trim().toUpperCase()).filter(validName));
  const result=[],byOrigin=new Map(),byContent=new Map(),names=new Set();
  const aliases={};
  const letterNo=value=>{let n=0;for(const char of String(value||'').trim().toUpperCase())n=n*26+char.charCodeAt(0)-64;return n;};
  let appendNo=(current||[]).map(e=>String(e.name||'').trim().toUpperCase()).filter(validName).reduce((max,name)=>Math.max(max,letterNo(name)),0);
  const appendedName=()=>{let name;do{name=letter(++appendNo);}while(names.has(name));return name;};
  function add(raw,registry){
    const entry=clone(raw),origin=entry.registryKey||(registry?key(entry):null),fp=fingerprint(entry);
    const existing=(origin&&byOrigin.get(origin))||byContent.get(fp);
    if(existing){aliases[key(entry)]=key(existing);if(origin){existing.registryKey=existing.registryKey||origin;byOrigin.set(origin,existing);}return;}
    let name=String(entry.name||'').trim().toUpperCase();
    if(registry)name=appendedName();
    else if(!validName(name)||names.has(name)){let n=1;while(names.has(letter(n))||reserved.has(letter(n)))n++;name=letter(n);}
    names.add(name.toUpperCase());entry.name=name;
    if(origin)entry.registryKey=origin;
    entry.__rafexUnified=true;entry.__rafexSystem=system(entry);
    entry.drawing=clone(entry.__rafexSnapshot||entry.drawing||{});
    entry.drawing.rafexGlobalTypeLetter=name;
    entry.__rafexGlobalLetter=name;
    entry.__rafexSnapshot=clone(entry.drawing);
    result.push(entry);byContent.set(fp,entry);if(origin)byOrigin.set(origin,entry);
  }
  (current||[]).forEach(e=>add(e,false));
  (incoming||[]).filter(e=>!excluded.includes(fingerprint(e))).forEach(e=>add(e,true));
  result.sort((a,b)=>a.name.length-b.name.length||a.name.localeCompare(b.name,'en'));
  return {entries:result,aliases};
}
