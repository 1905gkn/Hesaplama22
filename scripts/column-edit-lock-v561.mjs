import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* column-edit-lock-v561 */'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('561 missing '+a.slice(0,100));html=html.replace(a,b);};
 replace('function m2RenderLayout() {','function m2RenderLayout() { /* column-edit-lock-v561 */\n        const columnEditing561=m2LayoutState.mode==="draw"||m2LayoutState.areaEditMode;if(!columnEditing561){if(m2LayoutSymbols.some(s=>s.type==="column"&&s.id===m2SelectedSymbolId))m2SelectedSymbolId=null;if(m2SymbolDrag&&m2LayoutSymbols.some(s=>s.type==="column"&&s.id===m2SymbolDrag.id))m2SymbolDrag=null;for(const s of m2LayoutSymbols)if(s.type==="column")m2MultiSelect.symbolIds.delete(s.id);}\n');
 replace('symbolNode=event.target.closest?.("[data-layout-symbol]")','symbolNode=event.target.closest?.("[data-layout-symbol]:not([data-column-locked561])")');
 replace('data-layout-symbol="${symbol.id}" transform="rotate','data-layout-symbol="${symbol.id}" ${symbol.type==="column"&&!columnEditing561?\'data-column-locked561="true" style="pointer-events:none;cursor:default"\':""} transform="rotate');
 replace('m2LayoutSymbols.filter((symbol)=>selected.has(symbol.rackId)||','m2LayoutSymbols.filter((symbol)=>(symbol.type!=="column"||m2LayoutState.mode==="draw"||m2LayoutState.areaEditMode)&&(selected.has(symbol.rackId)||');
 replace('symbol.y+symbol.h/2<=bottom)).map((symbol)=>symbol.id)','symbol.y+symbol.h/2<=bottom))).map((symbol)=>symbol.id)');
 html=html.replace('if(!columnEditing561){','document.getElementById("m2LayoutSvg")?.setAttribute("data-area-edit561",String(Boolean(columnEditing561)));if(!columnEditing561){');
 return html.replace('</body>','<style>#m2LayoutSvg[data-area-edit561="false"] .m2-floor-point,#m2LayoutSvg[data-area-edit561="false"] [data-resume-point]{display:none!important;pointer-events:none!important}[data-column-locked561],[data-column-locked561] *{pointer-events:none!important;cursor:default!important}</style></body>');
}
if(/[\\/]column-edit-lock-v561\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('HTML missing');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);
}


