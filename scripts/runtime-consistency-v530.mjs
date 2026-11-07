import fs from 'node:fs';
import vm from 'node:vm';
const replace=(s,a,b)=>{if(!s.includes(a))throw Error('v530 missing anchor '+a.slice(0,80));return s.replace(a,b)};
export function transform(s){if(s.includes('data-runtime-consistency="v530"'))return s;
 const from=s.indexOf('  window.rafexVisitAreasV522=async visitor=>{'),to=s.indexOf('  window.rafexAreaDocument=()=>',from);if(from<0||to<0)throw Error('Area visitor anchor');
 s=s.slice(0,from)+`  window.rafexVisitAreasV522=async visitor=>{
    if(window.rafexAreaCaptureBusy530)throw Error('Yerleşim hazırlanıyor. İşlemin bitmesini bekleyin.');
    ensure();remember();if(output||restoring||!documentState)throw Error('Alanlar şu anda hazırlanıyor. Tekrar deneyin.');
    window.rafexAreaCaptureBusy530=true;const page=document.getElementById('page'),inert=page?.inert;if(page)page.inert=true;
    const active=documentState.activeAreaId,viewport=window.rafexCommonLayoutZoomCrispV126?.getView();
    const saved={state:m2LayoutState,symbols:m2LayoutSymbols,notes:m2UserNotes,undo:m2UndoHistory,multi:structuredClone(m2MultiSelect),offsets:m2DimensionOffsets,sizes:m2DimensionFontSizes,hidden:m2HiddenSummaryDimensions,visible:m2VisibleRackDimensions,pinned:m2PinnedDimensions,pinnedByRack:m2PinnedDimensionsByRack,measure:m2FreeMeasure,zoom:m2LayoutZoom,tool:m2LayoutTool,dimensionDrag:m2DimensionDrag,pending:m2PendingMeasureApply,symbolId:m2SelectedSymbolId,noteId:m2SelectedNoteId,dimensionKey:m2SelectedDimensionKey,symbolDrag:m2SymbolDrag,noteDrag:m2NoteDrag,join:m2JoinMode,joinId:m2JoinFirstRackId,customize:m2CustomizeMode,customizeId:m2CustomizeRackId};
    const records=documentState.areas.map(a=>({id:a.id,name:a.name,layout:clone(a.layout)}));
    try{if(records.length===1){await visitor({id:records[0].id,name:records[0].name});return;}for(const area of records){documentState.activeAreaId=area.id;restore(area.layout,true,true);await new Promise(requestAnimationFrame);await visitor({id:area.id,name:area.name});}}
    finally{documentState.activeAreaId=active;m2LayoutState=saved.state;m2LayoutSymbols=saved.symbols;m2UserNotes=saved.notes;m2UndoHistory=saved.undo;m2MultiSelect=saved.multi;m2DimensionOffsets=saved.offsets;m2DimensionFontSizes=saved.sizes;m2HiddenSummaryDimensions=saved.hidden;m2VisibleRackDimensions=saved.visible;m2PinnedDimensions=saved.pinned;m2PinnedDimensionsByRack=saved.pinnedByRack;m2FreeMeasure=saved.measure;m2LayoutZoom=saved.zoom;m2LayoutTool=saved.tool;m2DimensionDrag=saved.dimensionDrag;m2PendingMeasureApply=saved.pending;m2SelectedSymbolId=saved.symbolId;m2SelectedNoteId=saved.noteId;m2SelectedDimensionKey=saved.dimensionKey;m2SymbolDrag=saved.symbolDrag;m2NoteDrag=saved.noteDrag;m2JoinMode=saved.join;m2JoinFirstRackId=saved.joinId;m2CustomizeMode=saved.customize;m2CustomizeRackId=saved.customizeId;
    try{if(viewport)window.rafexCommonLayoutZoomCrispV126?.setView(viewport);m2RenderLayout();m2UpdateUndoButton();draw();}finally{if(page)page.inert=inert;window.rafexAreaCaptureBusy530=false;}}
  };
`+s.slice(to);
 // The project and images travel independently; requests stay below 2 MB.
 s=replace(s,"views=frames522.map(a=>({kind:'plan',label:a.name}));const init=", "views=frames522.map(a=>({kind:'plan',label:a.name})),wire530=await capture473.serialize(snapshot473),snapshot530={parts:Math.ceil(wire530.bytes.length/2000000),totalBytes:wire530.bytes.length,rawBytes:wire530.rawBytes,encoding:wire530.encoding};const init=");
 s=replace(s,'imageCount:frames522.length,views})','imageCount:frames522.length,views,snapshot:snapshot530})');
 s=replace(s,"setStatus('Yerleşim ve blok verileri aktarılıyor…');for(let index522=0;", "setStatus('Yerleşim ve blok verileri aktarılıyor…');for(let part530=0;part530<snapshot530.parts;part530++){setStatus('Proje verisi '+(part530+1)+' / '+snapshot530.parts);await api('/'+token+'/snapshot/parts/'+part530,{method:'PUT',headers:{'content-type':'application/octet-stream'},body:wire530.bytes.subarray(part530*2000000,(part530+1)*2000000)});}for(let index522=0;");
 s=replace(s,'capture473.pack(frames522[index522].png,index522===0?snapshot473:null)','capture473.pack(frames522[index522].png,null)');
 s=replace(s,"const image=await fetch(root+'/images/0'", "const image=await fetch(root+(session.snapshot?'/snapshot':'/images/0')");
 s=replace(s,'const data=await window.rafexCustomerCapture.read(new Uint8Array(await image.arrayBuffer()));',"const bytes530=new Uint8Array(await image.arrayBuffer()),data=session.snapshot?await window.rafexCustomerCapture.readSnapshot(bytes530,session.snapshot.encoding):await window.rafexCustomerCapture.read(bytes530);");
 // Ignore SVG-only changes in global button installers.
 s=s.replaceAll('new MutationObserver(install).observe(',"new MutationObserver(records=>{if(records.some(r=>r.target.namespaceURI!=='http://www.w3.org/2000/svg'))install();}).observe(");
 // Make the project gate visible to accessibility tools and users.
 s=replace(s,"node.dataset.rafexProjectLocked='1';", "node.dataset.rafexProjectLocked='1';node.setAttribute('aria-disabled','true');");
 s=replace(s,"delete node.dataset.rafexProjectLocked;", "delete node.dataset.rafexProjectLocked;node.removeAttribute('aria-disabled');");
 // Replace injected customize scripts after the historical patches have run.
 for(const [name,marker] of [['mekik-customize-v514.js','const api=window.rafexMekikCustomizeV514'],['drive-customize-v521.js','const api=window.rafexDriveCustomizeV521']]){
  const js=fs.readFileSync('client/'+name,'utf8'),start=s.indexOf(marker);if(start<0)throw Error('Missing customize '+name);const open=s.lastIndexOf('<script',start),body=s.indexOf('>',open)+1,end=s.indexOf('</script>',start);s=s.slice(0,body)+js+s.slice(end);
 }
 s=s.replace(/\/layout-3d\.js\?v=\d+/g,'/layout-3d.js?v=530').replace(/\/customer-share-capture\.js\?v=\d+/g,'/customer-share-capture.js?v=530');
 const end=s.lastIndexOf('</body>');s=s.slice(0,end)+'<style data-runtime-consistency="v530">[data-rafex-project-locked="1"]{cursor:not-allowed!important;opacity:.65}</style>'+s.slice(end);
 for(const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);return s;
}
if(/[\\/]runtime-consistency-v530\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);console.log('PASS runtime consistency v530: '+file);}
