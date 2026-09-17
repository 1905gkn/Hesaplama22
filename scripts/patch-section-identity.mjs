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
  let racks=typeof m2LayoutState!=='undefined'&&Array.isArray(m2LayoutState.racks)?m2LayoutState.racks:null;
  if(document.getElementById('m2SectionPlacementModal')?.hidden===false){
    const areas=window.rafexAreaDocument?.()?.areas;
    if(areas?.length)racks=areas.flatMap(area=>area.layout?.racks||[]);
  }
  const used=racks?racks.map(rack=>({name:rack.typeName||rack.name,drawing:rack})):(typeof m2CorporateUsedTypes==='function'?m2CorporateUsedTypes():[]);
  for(const [index,entry] of (used||[]).entries()){
    const drawing=entry?.drawing||entry,system=sectionSystem(drawing);
    if(!['b2b','mr','konsol','mekik2','drive'].includes(system))continue;
    const label=safeKey(entry.name||entry.typeName||`Raf Tipi ${index+1}`),key=system+'|'+label.toLocaleUpperCase('tr-TR');
    if(!groups.has(key))groups.set(key,{key,label,system,entries:new Map(),cards:[]});
    const count=palletCountOf(drawing);
    if(!groups.get(key).entries.has(count))groups.get(key).entries.set(count,{count,drawing});
  }
  for(const id of ['m2CorporatePreview','m2CorporatePrint','m2CorporatePrintArea']){
    const host=document.getElementById(id);
    for(const card of host?.querySelectorAll('.m2-corporate-type-card,.rafex-v19-type-card')||[]){
      const system=card.dataset.rafexSystem||'b2b';
      if(!['b2b','mr','konsol','mekik2','drive'].includes(system))continue;
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
  script=script.replace("    const konsol=type?.system==='konsol';",`    if(['mekik2','drive'].includes(type?.system)){
      const svg=window.rafexTechnicalSectionSvg?.(seed?.drawing,type.system);
      return svg?'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg):null;
    }
    const konsol=type?.system==='konsol';`);
  script=script.replace('button.type = "button";', 'button.type = "button";\n      button.dataset.rafexSystem=section.system;button.dataset.rafexTypeLetter=section.label;button.dataset.rafexNativeSection="1";');
  html=html.replace(pattern,()=>match[1]+script+match[3]);
  const reportStart=html.indexOf('  function systemOf(entry){',html.indexOf('if(window.__rafexPdfDirectTypesV19)'));
  const reportEnd=html.indexOf('  function typeName(',reportStart);
  if(reportStart<0||reportEnd<0)throw Error('Report system discriminator missing');
  html=html.slice(0,reportStart)+sectionSystem.toString()+'\n  function systemOf(entry){return sectionSystem(entry?.drawing||entry);}\n'+html.slice(reportEnd);
  html=html.replace('  function buildDriveCard(group,index){',`  window.rafexTechnicalSectionSvg=function(d,system){
    const views=system==='drive'?[driveSvg(d)]:[mekikSvg(d,'front'),mekikSvg(d,'side')];
    if(views.some(svg=>!svg))return null;
    const parts=views.map((text,index)=>{const svg=new DOMParser().parseFromString(text,'image/svg+xml').documentElement;svg.setAttribute('x','0');svg.setAttribute('y',String(index*900/views.length));svg.setAttribute('width','1120');svg.setAttribute('height',String(900/views.length));svg.setAttribute('preserveAspectRatio','xMidYMid meet');return new XMLSerializer().serializeToString(svg);});
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 900">'+parts.join('')+'</svg>';
  };
  function buildDriveCard(group,index){`);
  html=html.replace('  async function syncModalList(){','  async function syncModalList(){\n    if(document.querySelector("meta[data-rafex-section-identity]"))return;');
  html=html.replace("!item.button.classList.contains('rafex-mekik-section-entry')&&item.info.system==='mekik2'", "!item.button.dataset.rafexNativeSection&&!item.button.classList.contains('rafex-mekik-section-entry')&&item.info.system==='mekik2'");
  const cleaner=/  function cleanSectionTypes\(\)\{[^\n]*\}/;
  if(!cleaner.test(html))throw Error('Legacy B2B-only section filter missing');
  html=html.replace(cleaner,'  function cleanSectionTypes(){}');
  html=html.replace('.rafex-non-b2b-section{display:none!important}','');
  // A delayed decorator must never relabel a previous area's card by its index.
  const unsafe='var group=groupMap.get(raw)||Array.from(groupMap.values())[index];if(!group)return;';
  if(!html.includes(unsafe))throw Error('Report card decorator missing');
  html=html.replace(unsafe,'var group=Array.from(groupMap.values()).find(function(item){return item.letter===raw&&item.system===card.dataset.rafexSystem;});if(!group)return;');
  return html.replace('</head>','<meta data-rafex-section-identity content="1"></head>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-section-identity.mjs')){
 const file='dist/server/index.js',raw=fs.readFileSync(file,'utf8'),m=raw.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,raw.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
