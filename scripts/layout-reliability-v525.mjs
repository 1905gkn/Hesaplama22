import fs from 'node:fs';
import vm from 'node:vm';

export function typeUseCount(rack, areas, currentRacks) {
 const racks=areas?.length?areas.flatMap(a=>a.layout?.racks||[]):currentRacks||[];
 const system=r=>r.rafexSystem||(r.b2bLayout?'b2b':'mekik2');
 return racks.filter(r=>rack.rafexCatalogKey&&r.rafexCatalogKey?r.rafexCatalogKey===rack.rafexCatalogKey:system(r)===system(rack)&&r.typeName===rack.typeName).length;
}
export function transform(html){
 if(html.includes('data-layout-reliability="v525"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v525 missing: '+a);html=html.replaceAll(a,b);};
 replace('sync(box);fireGeometry();','sync(box);window.RafexKonsolViewer?.setLoadType(window.__rafexKonsolLoadType);fireGeometry();');
 // Preserve the reference positions except for the new terminal pallet gap.
 replace('const adapted=m2JoinedDepthPlan(first,positions.at(-1)+palD);',`if(count>1){const terminal=m2PalletDepthLayout(count,palD,first.systemType,first.firstPalletGap??200,first.palletGap??50);positions[count-1]=Math.max(positions[count-1],positions[count-2]+palD+terminal.gaps[count-2]);}
        const adapted=m2JoinedDepthPlan(first,positions.at(-1)+palD);`);
 replace('let reused=false;',`let reused=false;
  const singleton=old&&previous&&window.rafexTypeUseCountV525(previous)===1;`);
 replace('if(wireTypeChanged){\n   const used=',`if(singleton){entry.id=old.id;entry.name=old.name;entry.rafexCustomNameV203=old.name;rack.rafexCustomNameV203=old.name;entry.drawing.rafexCustomNameV203=old.name;}
  else if(wireTypeChanged){
   const used=`);
 replace('if(!reused&&catalog.some(t=>','if(!reused&&!singleton&&catalog.some(t=>');
 replace('Object.assign(rack,adapted);rack.x=nextX;', 'const previous=structuredClone(rack),singleton=window.rafexTypeUseCountV525(previous)===1;\n        Object.assign(rack,adapted);rack.x=nextX;');
 replace('let number=1,name;do{name=b2bTypeLetter("",number++);}while(used.has(name));','let number=1,name;if(singleton&&previous.typeName)name=previous.typeName;else do{name=b2bTypeLetter("",number++);}while(used.has(name));');
 replace('window.rafexCommitCustomTypeV184?.(rack,entry,null);','window.rafexCommitCustomTypeV184?.(rack,entry,previous);');
 replace('m2SavedRackTypes.push(entry);m2RenderSavedRackTypes();',`if(singleton)m2SavedRackTypes=m2SavedRackTypes.filter(t=>t.name!==previous.typeName);
          const saved=(window.rafexProjectTypesV133||[]).find(t=>(t.__rafexSystem||t.system)+':'+t.id===rack.rafexCatalogKey);
          m2SavedRackTypes.push(saved?structuredClone(saved):entry);m2RenderSavedRackTypes();`);
 // Drawing preferences belong to the saved area, not the browser that opens it.
 replace('areaZoom:m2LayoutZoom,editorViewportV258:',`areaZoom:m2LayoutZoom,typeLetterScale:100*(window.rafexCommonTypeLetterScaleV65?.()||1),typeLetterContrast:100*(window.rafexCommonTypeLetterContrastV65?.()||1),editorViewportV258:`);
 replace('m2LayoutSymbols=v.symbols||[];m2UserNotes=v.userNotes||[];',`m2LayoutSymbols=v.symbols||[];m2UserNotes=v.userNotes||[];
      window.rafexSetTypeLetterScaleV65?.(v.typeLetterScale??100);window.rafexSetTypeLetterContrastV65?.(v.typeLetterContrast??100);`);
 const css=`#page#page[data-rafex-common-active="1"] .konsol-view-card{height:auto!important;min-height:0!important;align-self:start!important;grid-template-rows:auto!important}
 #page#page[data-rafex-common-active="1"] .konsol-view-wrap{height:auto!important;min-height:0!important;grid-template-rows:auto auto auto!important}
 #page#page[data-rafex-common-active="1"] #konsolCanvas{display:block!important;height:clamp(510px,65vh,700px)!important;min-height:0!important;max-height:none!important;width:100%!important}
 @media(max-width:600px){#page#page[data-rafex-common-active="1"] #konsolCanvas{height:440px!important}}`;
 const code=`window.rafexTypeUseCountV525=r=>(${typeUseCount.toString()})(r,window.rafexAreaDocument?.()?.areas,typeof m2LayoutState==='undefined'?[]:m2LayoutState.racks);`;
 const end=html.lastIndexOf('</body>');html=html.slice(0,end)+`<style data-layout-reliability="v525">${css}</style><script>${code}</script>`+html.slice(end);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);
 return html;
}
if(/[\\/]layout-reliability-v525\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);console.log('PASS layout reliability v525: '+file);
}
