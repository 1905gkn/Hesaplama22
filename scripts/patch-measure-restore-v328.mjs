import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* measure-restore-v328 */'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v328 anchor mismatch: '+a.slice(0,100));html=html.replace(a,b);};
 replace("    if(activeId==null)return [];\n    var active=racks.find(function(rack){return Number(rack.id)===Number(activeId);});\n    if(!active)return [];\n    var relations=typeof window.rafexRackGapRelationsV46==='function'?window.rafexRackGapRelationsV46(active):[];",`    /* measure-restore-v328 */
    // Pinned pairs belong to the saved area, even when no rack is selected.
    var active=activeId==null?null:racks.find(function(rack){return Number(rack.id)===Number(activeId);});
    var relations=active&&typeof window.rafexRackGapRelationsV46==='function'?window.rafexRackGapRelationsV46(active):[];`);
 replace("var activeId=m2LayoutState.selected,currentKeys=new Set(pairs.map(pairKey));pinnedPairGaps.forEach(function(key){if(!currentKeys.has(key))pinnedPairGaps.delete(key);});",`var activeId=m2LayoutState.selected,rackIds=new Set((m2LayoutState.racks||[]).map(function(r){return String(r.id);}));
    // Rendering must not erase saved visibility during a temporary geometry miss.
    pinnedPairGaps.forEach(function(key){if(String(key).split(':').some(function(id){return !rackIds.has(id);}))pinnedPairGaps.delete(key);});`);
 replace('pinnedDimensions:{...m2PinnedDimensions},freeMeasure:s.freeMeasure,','pinnedDimensions:{...m2PinnedDimensions},distanceRackId:m2MeasurementRack()?.id??null,pinnedPairGaps:[...(m2LayoutState.pinnedPairGaps||[])],freeMeasure:s.freeMeasure,');
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-measure-restore-v328.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('v328 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));console.log('v328: saved pair dimensions survive project restore and area switching without selection');
}

