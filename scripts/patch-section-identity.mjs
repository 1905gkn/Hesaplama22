import fs from 'node:fs';

// Share the same discriminator between the report cards and their captures.
export function sectionSystem(drawing) {
  const explicit=String(drawing?.rafexSystem||'').toLowerCase();
  if(['b2b','mr','konsol','mekik2','drive'].includes(explicit))return explicit;
  if(['cantilever','konsol-kollu'].includes(explicit))return 'konsol';
  if(drawing?.konsol)return 'konsol';
  if(drawing?.b2b?.mr||drawing?.b2bLayout?.palletType==='mr'||drawing?.systemType==='mr')return 'mr';
  if(drawing?.b2b||drawing?.b2bLayout)return 'b2b';
  return drawing?.systemType||'mekik2';
}

function collectRackTypes(){
  const groups=new Map();
  const racks=typeof m2LayoutState!=='undefined'&&Array.isArray(m2LayoutState.racks)?m2LayoutState.racks:null;
  const used=racks?racks.map(rack=>({name:rack.typeName||rack.name,drawing:rack})):(typeof m2CorporateUsedTypes==='function'?m2CorporateUsedTypes():[]);
  for(const [index,entry] of (used||[]).entries()){
    const drawing=entry?.drawing||entry,system=sectionSystem(drawing);
    if(!['b2b','mr','konsol'].includes(system))continue;
    const label=safeKey(entry.name||entry.typeName||`Raf Tipi ${index+1}`),key=system+'|'+label.toLocaleUpperCase('tr-TR');
    if(!groups.has(key))groups.set(key,{key,label,system,entries:new Map(),cards:[]});
    const count=palletCountOf(drawing);
    if(!groups.get(key).entries.has(count))groups.get(key).entries.set(count,{count,drawing});
  }
  for(const id of ['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea']){
    const host=document.getElementById(id);
    for(const card of host?.querySelectorAll('.m2-corporate-type-card,.rafex-v19-type-card')||[]){
      const system=card.dataset.rafexSystem||'b2b';
      if(!['b2b','mr','konsol'].includes(system))continue;
      const label=safeKey(card.dataset.rafexTypeName||card.querySelector('strong')?.textContent);
      const key=system+'|'+label.toLocaleUpperCase('tr-TR'),group=groups.get(key);
      if(group){group.cards.push(card);card.dataset.rafexSectionKey=key;}
    }
  }
  rackTypeCache=[...groups.values()].map(group=>({...group,existingCounts:[...group.entries.keys()].sort((a,b)=>b-a)}));
  return rackTypeCache;
}

export function transform(html){
  if(html.includes('data-rafex-section-identity'))return html;
  const pattern=/(<script data-rafex-b2b-section-positioner-fallback="v5">)([\s\S]*?)(<\/script>)/;
  const match=html.match(pattern);if(!match)throw Error('Section runtime missing');
  let script=match[2];
  const start=script.indexOf('  function collectRackTypes()'),end=script.indexOf('  function defaultsFor(',start);
  if(start<0||end<0)throw Error('Section collection missing');
  script=script.slice(0,start)+sectionSystem.toString()+'\n'+collectRackTypes.toString()+'\n'+script.slice(end);
  // Old name-only settings cannot safely be assigned to a system.
  script=script.replace('rafex_b2b_perspective_by_type_v4','rafex_section_by_system_v1');
  script=script.replace('if (renderQueued) return;', 'while (renderQueued) await new Promise(resolve=>setTimeout(resolve,25));');
  script=script.replace('if (!src) continue;', 'if (!src) throw new Error(type.label+" kesit görüntüsü hazırlanamadı");');
  script=script.replace('sectionWidth: widthForCount(count, base.palletWidth),','sectionWidth: exact?.drawing ? base.sectionWidth : widthForCount(count, base.palletWidth),');
  script=script.replace('const mr = !konsol&&(type?.system === "mr" || isMrDrawing(seed?.drawing));','const mr = type?.system === "mr";');
  html=html.replace(pattern,()=>match[1]+script+match[3]);
  const reportStart=html.indexOf('  function systemOf(entry){',html.indexOf('if(window.__rafexPdfDirectTypesV19)'));
  const reportEnd=html.indexOf('  function typeName(',reportStart);
  if(reportStart<0||reportEnd<0)throw Error('Report system discriminator missing');
  html=html.slice(0,reportStart)+sectionSystem.toString()+'\n  function systemOf(entry){return sectionSystem(entry?.drawing||entry);}\n'+html.slice(reportEnd);
  // A delayed decorator must never relabel a previous area's card by its index.
  const unsafe='var group=groupMap.get(raw)||Array.from(groupMap.values())[index];if(!group)return;';
  if(!html.includes(unsafe))throw Error('Report card decorator missing');
  html=html.replace(unsafe,'var group=Array.from(groupMap.values()).find(function(item){return item.letter===raw&&item.system===card.dataset.rafexSystem;});if(!group)return;');
  return html.replace('</head>','<meta data-rafex-section-identity content="1"></head>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-section-identity.mjs')){
 const file='dist/server/index.js',raw=fs.readFileSync(file,'utf8'),m=raw.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,raw.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
