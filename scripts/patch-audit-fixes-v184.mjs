import fs from 'node:fs';

export function transform(html){
 if(html.includes('data-audit-fixes="v184"'))return html;
 const replace=(from,to)=>{if(!html.includes(from))throw Error('v184 anchor missing: '+from.slice(0,120));html=html.replace(from,to);};
 // Commit catalog identity before any renderer can restore the old type letter.
 replace('m2PushUndo("Raf özelleştirme");', 'm2PushUndo("Raf özelleştirme");const previousTypeV184=window.rafexSealRackDetailV135(rack);');
 replace('if(existingIndex>=0)m2SavedRackTypes.splice(existingIndex,1,entry);else m2SavedRackTypes.push(entry);m2SelectedSavedType=existingIndex>=0?existingIndex:m2SavedRackTypes.length-1;',
 'if(existingIndex>=0)m2SavedRackTypes.splice(existingIndex,1,entry);else m2SavedRackTypes.push(entry);m2SelectedSavedType=existingIndex>=0?existingIndex:m2SavedRackTypes.length-1;window.rafexCommitCustomTypeV184(rack,entry,previousTypeV184);');
 // Individual selection must not silently expand to all joined modules.
 replace('var groups=new Set(m2LayoutState.racks.filter(function(r){return ids.has(Number(r.id))&&r.joinGroup})',
 'if(window.rafexIndividualSelectionV184?.active())return Array.from(ids);\n      var groups=new Set(m2LayoutState.racks.filter(function(r){return ids.has(Number(r.id))&&r.joinGroup})');
 replace('var ids=selectionIds();if(ids.length<2)return false;', 'var ids=selectionIds();if(!ids.length||ids.length<2&&!window.rafexIndividualSelectionV184?.active())return false;');
 replace('if(sources.length<2)return false;', 'if(!sources.length)return false;');
 replace('m2MultiSelect.rackIds=new Set(copies.map(function(copy){return copy.id}));', 'window.rafexIndividualSelectionV184?.replace(copies.map(function(copy){return copy.id}));m2MultiSelect.rackIds=new Set(copies.map(function(copy){return copy.id}));');
 replace('let picking=false,ids=new Set(),batch=null,scheduled=false;', `let picking=false,ids=new Set(),batch=null,scheduled=false;
  window.rafexIndividualSelectionV184={active:()=>picking,replace:values=>{if(picking)ids=new Set(values);}};`);
 // Project catalog numbers are stable; history serials remain internal record IDs.
 replace('const button = $("m2ProjectSaveButton"); if (button) button.disabled = true; window.rafexProjectSavingV133=true;', `if(commonLayoutSaveV106&&!independentV133&&window.rafexSaveDrawingCatalogV158){
          const catalogSaved=await window.rafexSaveDrawingCatalogV158();
          if(!catalogSaved){if(saveMessage)saveMessage.textContent='Raf tipi kataloğu kaydedilemedi. Proje kaydı tamamlanmadı; tekrar deneyin.';return;}
        }
        const button = $("m2ProjectSaveButton"); if (button) button.disabled = true; window.rafexProjectSavingV133=true;`);
 replace("project.payload.projectIdentity.displayNumber=!asCopy&&Number(project.serial_no)>0?String(project.serial_no):'Yeni';", "project.payload.projectIdentity.displayNumber=!asCopy?String(project.payload.projectIdentity.drawingCatalogId||project.serial_no||'Yeni'):'Yeni';");
 replace('showProjectSavedNotice(result.serialNo,projectName);\n            if(saveMessage)saveMessage.textContent=\'Proje #\'+result.serialNo', 'showProjectSavedNotice(documentV133.payload.projectIdentity?.drawingCatalogId||result.serialNo,projectName);\n            if(saveMessage)saveMessage.textContent=\'Proje #\'+(documentV133.payload.projectIdentity?.drawingCatalogId||result.serialNo)');
 replace('String(p.serial_no).padStart(4, "0")', 'String(x.projectIdentity?.drawingCatalogId||p.serial_no).padStart(4, "0")');
 replace('(x.drawing?.bays || 0) * (x.drawing?.levels || 0) * (x.drawing?.depth || 0)', 'window.rafexHistoryPalletsV184(x)');
 replace('${fmt(d.totalWidth || 0)} × ${fmt(d.railLength || 0)} mm', '${fmt(d.widthMm || d.totalWidth || 0)} × ${fmt(d.depthMm || d.railLength || 0)} mm');
 replace('esc((d.systemType || "fifo").toUpperCase())', 'esc(d.rafexSystemLabel || (d.b2bLayout ? (d.b2b?.mr ? "MR" : "B2B") : (d.systemType || "fifo").toUpperCase()))');
 replace('function m2CorporatePalletTable(types, palletTotal, labels) {', 'function m2CorporatePalletTable(types, palletTotal, labels) {\n        types=window.rafexUniquePalletRowsV184(types);');
 replace("+' · LOG '+esc(entry.logId||entry.createdAt||'-')", "");
 replace('<article><h3>${t.whyTitle}</h3><p>${t.whyText}</p></article>', '${types.some(entry=>{const d=entry.drawing||entry;return !d.b2bLayout&&(entry.rafexSystem||d.rafexSystem||"mekik2")==="mekik2"})?`<article><h3>${t.whyTitle}</h3><p>${t.whyText}</p></article>`:""}');
 const runtime=fs.readFileSync(new URL('./audit-fixes-v184.js',import.meta.url),'utf8');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body');
 return html.slice(0,end)+'<script data-audit-fixes="v184">'+runtime+'</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-audit-fixes-v184.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!m)throw Error('Missing compiled HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
