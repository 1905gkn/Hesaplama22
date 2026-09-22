import fs from 'node:fs';

export function transform(html){
 if(html.includes('data-mixed-layout="v186"'))return html;
 const replace=(from,to)=>{if(!html.includes(from)||html.indexOf(from)!==html.lastIndexOf(from))throw Error('v186 missing/ambiguous anchor: '+from.slice(0,100));html=html.replace(from,to);};
 // A common project is a complete mixed-system model, not the currently
 // visible editor's input form. Never normalize every rack using that editor.
 replace('        const drawing = payload.drawing;\n        if (drawing) {',`        const drawing = payload.drawing;
        const commonV186=!!(payload.rafexCommonDrawing||payload.module==='ortak'||project.module==='ortak'||document.querySelector('#nav button.active[data-page]')?.dataset.page==='free');
        if(commonV186){const name=$('m2ProjectName');if(name)name.value=project.project_name+(asCopy?' - Kopya':'');}
        if (drawing&&!commonV186) {`);
 replace('name:m2ActiveModule === "b2b" && entry.source!=="custom" ?', 'name:!commonV186 && m2ActiveModule === "b2b" && entry.source!=="custom" ?');
 replace('            if (m2ActiveModule === "b2b" && drawing?.b2b) {','            if (!commonV186 && m2ActiveModule === "b2b" && drawing?.b2b) {');
 // Validate an isolated catalog before replacing the active project identity.
 replace('    window.rafexProjectIdentityV133=isolated?structuredClone(project.payload.projectIdentity):null;\n    window.rafexSelectedCatalogKey=null;', '    // v186: catalog reconciliation must finish before active state changes.');
 replace('      for(const rack of project.payload.layout?.racks||[]){const key=merged.aliases[rack.rafexCatalogKey]||rack.rafexCatalogKey;const entry=merged.entries.find(e=>(e.__rafexSystem+\':\'+e.id)===key);if(entry){rack.rafexCatalogKey=key;rack.typeName=entry.name;rack.rafexGlobalTypeLetter=entry.name;}}', `      const entriesV186=new Map(merged.entries.map(e=>[e.__rafexSystem+':'+e.id,e]));
      for(const layout of new Set([project.payload.layout,...(project.payload.areas||[]).map(a=>a.layout)])){
        for(const rack of layout?.racks||[]){const key=merged.aliases[rack.rafexCatalogKey]||rack.rafexCatalogKey,entry=entriesV186.get(key);if(entry){rack.rafexCatalogKey=key;rack.typeName=entry.name;rack.rafexGlobalTypeLetter=entry.name;}}
      }`);
 replace('    window.rafexProjectTypesV133=isolated?structuredClone(project.payload.rackTypes||[]):null;', `    window.rafexProjectIdentityV133=isolated?structuredClone(project.payload.projectIdentity):null;
    window.rafexSelectedCatalogKey=null;
    window.rafexProjectTypesV133=isolated?structuredClone(project.payload.rackTypes||[]):null;`);
 // The multi-area wrapper owns its own copy outside the v133 wrapper. Apply
 // the same aliases there, otherwise restoring an area revives the old keys.
 replace('const payload=project.payload;if(payload.areas?.length){',`const payload=structuredClone(project.payload);
      const mergedV186=window.rafexMergeRackCatalog(payload.rackTypes||[],[]),entriesV186=new Map(mergedV186.entries.map(e=>[e.__rafexSystem+':'+e.id,e]));
      for(const area of payload.areas||[])for(const rack of area.layout?.racks||[]){const key=mergedV186.aliases[rack.rafexCatalogKey]||rack.rafexCatalogKey,entry=entriesV186.get(key);if(entry){rack.rafexCatalogKey=key;rack.typeName=entry.name;rack.rafexGlobalTypeLetter=entry.name;}}
      if(payload.areas?.length){`);
 // PAN keeps the same zoom percentage. Rewriting its text on every pointer
 // frame awakened document-wide observers and repeatedly scanned the SVG.
 replace('var node=svg();if(!node)return false;syncBounds();view=clamp(view);applying=true;node.setAttribute("viewBox",expectedViewBox());applying=false;', 'var node=svg();if(!node)return false;syncBounds();view=clamp(view);applying=true;var boxV186=expectedViewBox();if(node.getAttribute("viewBox")!==boxV186)node.setAttribute("viewBox",boxV186);applying=false;');
 replace('node.style.width="100%";node.style.height="auto";node.style.maxWidth="none";node.style.margin="0";var ratioV147=', 'if(node.style.width!=="100%")node.style.width="100%";if(node.style.height!=="auto")node.style.height="auto";if(node.style.maxWidth!=="none")node.style.maxWidth="none";if(node.style.margin!=="0px")node.style.margin="0";var ratioV147=');
 replace('var label=byId("m2LayoutZoomLabel");if(label)label.textContent=Math.round(zoomValue()*100)+"%";', 'var label=byId("m2LayoutZoomLabel"),textV186=Math.round(zoomValue()*100)+"%";if(label&&label.textContent!==textV186)label.textContent=textV186;');
 replace('function compactNameplateV136(group){','function compactNameplateV136(group){if(group.classList.contains("rafex-offscreen-v152"))return;');
 replace('#m2LayoutSvg .rafex-offscreen-v152{visibility:hidden!important}', '#m2LayoutSvg .rafex-offscreen-v152{visibility:hidden!important;display:none!important}');
 const start=html.indexOf('<script data-layout-budget="v152">'),end=html.indexOf('</script>',start);
 if(start<0||end<0)throw Error('v186 inline layout budget missing');
 html=html.slice(0,start)+'<script data-layout-budget="v152">'+fs.readFileSync(new URL('./layout-budget-runtime-v186.js',import.meta.url),'utf8')+html.slice(end);
 const bodyEnd=html.lastIndexOf('</body>');if(bodyEnd<0)throw Error('v186 body missing');
 return html.slice(0,bodyEnd)+'<script data-mixed-layout="v186">window.rafexMixedLayoutVersion="v186";</script>'+html.slice(bodyEnd);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-mixed-layout-v186.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!m)throw Error('Missing HTML');fs.writeFileSync(file,source.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
