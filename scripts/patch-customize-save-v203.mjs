import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-customize-save="v203"'))return html;
 const replace=(from,to)=>{if(!html.includes(from))throw Error('Missing customize anchor: '+from.slice(0,90));html=html.replace(from,to);};
 // Clearing the canvas selection must not invalidate an open editor.
 replace('m2CopyMode=false;m2CustomizeMode=false;m2CustomizeRackId=null;m2JoinMode=false;', 'm2CopyMode=false;m2CustomizeMode=false;if(document.getElementById("m2CustomizeModal")?.hidden!==false)m2CustomizeRackId=null;m2JoinMode=false;');
 // Do not commit inventory or consume the single-module context after validation fails.
 replace('if(!ctx)return;\n   restoreOthers(ctx);', 'if(!ctx||document.getElementById("m2CustomizeModal")?.hidden===false)return;\n   restoreOthers(ctx);');
 replace('if(!state)return result;\n      var live=racks()', 'if(!state||document.getElementById("m2CustomizeModal")?.hidden===false)return result;\n      var live=racks()');
 // This shortcut ignores accessory/level edits. Only use it for an untouched editor.
 replace('if(!sameStructure||!sameName)return originalApply.apply(this,arguments);', 'if(!sameStructure||!sameName||document.getElementById("m2CustomizeModal")?.dataset.detailEditedV135)return originalApply.apply(this,arguments);');
 // Named customized types retain their user-facing name through project reloads.
 replace("let name=String(entry.name||'').trim().toUpperCase();\n    if(registry)name=appendedName();", "let name=String(entry.name||'').trim().toUpperCase();\n    const customName=entry.rafexCustomNameV203||entry.drawing?.rafexCustomNameV203;\n    if(customName){name=String(customName).trim();const base=name;let n=2;while(names.has(name.toUpperCase()))name=base+' '+n++;entry.rafexCustomNameV203=name;}\n    else if(registry)name=appendedName();");
 replace("function savedLetterForRack(rack){\n    var direct=", "function savedLetterForRack(rack){\n    if(rack?.rafexCustomNameV203)return String(rack.rafexCustomNameV203);\n    var direct=");
 // Show the current manual rows before committing them, without changing the fixed height.
 const anchor="};const bind=rows=>window.RafexRackTravers?.bindLevels(dialog,";
 replace(anchor,`};
 const refreshFootNoteV203=()=>{
  if(!custom)return;
  const rows=[...dialog.querySelectorAll('.level-row')].map(row=>({distance:Number(row.querySelector('[data-distance]').value),weight:Number(row.querySelector('[data-weight]').value),palletHeight:Number(row.querySelector('[data-pallet]').value),traverseType:row.querySelector('[data-traverse]').value,selectionMode:row.querySelector('[data-traverse]').dataset.manual==='true'?'manual':'auto'}));
  const mapped=rows.map((r,i)=>({...r,traverseType:ground?(rows[i+1]?.traverseType||''):r.traverseType,selectionMode:ground?(rows[i+1]?.selectionMode||'auto'):r.selectionMode}));
  const planned=manualOptions({...o,levels:rows.length,tunnelHeight:0},storedLevelRows(mapped));
  window.rafexCustomizeHeightNoteV203?.(planned,customFootHeight||o.footHeight,dialog,'rafexManualFootNoteV203');
 };
 dialog.oninput=refreshFootNoteV203;dialog.onchange=refreshFootNoteV203;
 dialog.onclick=()=>queueMicrotask(refreshFootNoteV203);
 refreshFootNoteV203();
 const bind=rows=>window.RafexRackTravers?.bindLevels(dialog,`);
 const runtime=fs.readFileSync(new URL('./customize-save-v203.js',import.meta.url),'utf8');
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');
 return html.slice(0,at)+'<style>@media print{#rafexCustomizeFootNoteV203,#rafexManualFootNoteV203,#rafexCustomizeSaveErrorV203,[data-customize-save-notice]{display:none!important}}</style><script data-customize-save="v203">'+runtime+'</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-customize-save-v203.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
