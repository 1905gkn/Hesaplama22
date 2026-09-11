import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* static-deselection-v149 */'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v149 missing '+a.slice(0,100));html=html.replace(a,b)};
 replace('function m2ClearAllSelections(message="Seçimler temizlendi."){',`function m2ClearAllSelections(message="Seçimler temizlendi.",selectionOnlyV149=false){
        /* static-deselection-v149 */
        const fastV149=selectionOnlyV149&&m2LayoutState.mode!=="draw"&&!m2LayoutState.drag&&!m2SymbolDrag&&!m2NoteDrag&&!m2DimensionDrag&&!m2SelectedSymbolId&&!m2SelectedNoteId&&!m2SelectedDimensionKey&&!m2LayoutTool&&!m2CopyMode&&!m2CustomizeMode&&!m2JoinMode&&!m2ProtectionDraft&&!m2SeismicDraft&&!m2AutoFillDraft&&!m2MultiSelect.active&&!m2MultiSelect.rackIds.size&&!m2MultiSelect.symbolIds.size&&!Number.isInteger(m2FreeMeasure.dragIndex)&&m2LayoutRenderFrame==null;`);
 replace('if($("m2FloorStatus"))$("m2FloorStatus").textContent=message;m2RenderLayout();',`if($("m2FloorStatus"))$("m2FloorStatus").textContent=message;
        if(fastV149){
          const layer=$("m2LayoutContent");
          if(layer){
            layer.querySelectorAll('.m2-wall-guide[data-wall-rack],.m2-distance-guide[data-rack-gap]').forEach(n=>n.remove());
            layer.querySelectorAll('[data-dimension-key^="column-gap:"]').forEach(n=>n.closest('.m2-distance-guide')?.remove());
            const overlay=m2PerfEnsureDragOverlay(layer,null);
            overlay.innerHTML=m2LayoutState.racks.map(rack=>{const p=m2PinnedForRack(rack.id);return Object.values(p).some(Boolean)?m2WallDistanceGuides(rack,p)+(p.gap?m2RackDistanceGuide(rack)+m2ColumnDistanceGuide(rack):""):""}).join("");
          }
          m2PerfRefreshStaticSelectionUi(null);
        }else m2RenderLayout();`);
 // Only user cancellation opts in. Undo and all model-changing callers keep the full render.
 replace('m2ClearAllSelections("Bütün seçimler kaldırıldı.");','m2ClearAllSelections("Bütün seçimler kaldırıldı.",true);');
 replace('if(hasSelection)m2ClearAllSelections("Bütün seçimler kaldırıldı.");','if(hasSelection)m2ClearAllSelections("Bütün seçimler kaldırıldı.",true);');
 replace('        svg.onpointerdown = (event) => {','        let emptyPointerV149=false;\n        svg.onpointerdown = (event) => {\n          emptyPointerV149=false;');
 replace('} else { m2ClearAllSelections("Bütün seçimler kaldırıldı."); }','} else { m2ClearAllSelections("Bütün seçimler kaldırıldı.",true);emptyPointerV149=true; }');
 replace('        const stop = (event) => {','        const stop = (event) => {\n          if(emptyPointerV149){emptyPointerV149=false;return;}');
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-static-deselection-v149.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!match)throw Error('Missing compiled HTML');
 fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));
 console.log('v149: deselect without rebuilding rack geometry; preserve pinned dimensions.');
}
