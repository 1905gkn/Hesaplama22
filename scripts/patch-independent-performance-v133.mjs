import fs from 'node:fs';
import {independentProject} from './independent-project-v133.mjs';

export function transform(html) {
  if (html.includes('data-rafex-independent-performance="v133"')) return html;
  const replace = (from, to) => { if (!html.includes(from)) throw new Error('v133 anchor missing: ' + from.slice(0,110)); html = html.replace(from, to); };
  const historyCopy='<button class="small-btn" onclick="event.stopPropagation();copyProject(${p.id})">';
  if(!html.includes(historyCopy))throw new Error('Project history action missing');
  html=html.replaceAll(historyCopy,'${p.payload?.layout ? `<button class="small-btn" onclick="event.stopPropagation();rafexOpenHistoryProjectV134(${p.id})">Projeyi Aç</button>` : ""}'+historyCopy);
  replace('m2ProjectRecords = (result.projects || []).filter((project) => project.module === m2ActiveModule); m2RenderProjects();', `const commonProjectsV133=document.querySelector('#nav button.active[data-page]')?.dataset.page==='free';
          m2ProjectRecords = (result.projects || []).filter((project) => commonProjectsV133 ? Boolean(project.payload?.layout) : project.module === m2ActiveModule); m2RenderProjects();
          if(commonProjectsV133){const title=$('m2ProjectList')?.previousElementSibling;if(title)title.textContent='Kayıtlı Projeler · Tüm Sistemler';}`);
  replace('      async function m2SaveProject() {', '      async function m2SaveProject() {\n        if(window.rafexCanEditProjectV134?.()===false)return;\n        const independentV133=arguments[0]===true; if(window.rafexProjectSavingV133)return;');
  replace('const button = $("m2ProjectSaveButton"); if (button) button.disabled = true;', 'const button = $("m2ProjectSaveButton"); if (button) button.disabled = true; window.rafexProjectSavingV133=true;');
  const request = '{ projectName, module: commonLayoutSaveV106?"ortak":m2ActiveModule, payload: { version: 1, ...(commonLayoutSaveV106?{module:"ortak",rafexCommonDrawing:true}:{}), drawing: projectDrawingV106, rackTypes: m2SavedRackTypes, layout } }';
  replace('          const result = await req("/api/projects", { method: "POST", body: JSON.stringify('+request+') });',
    '          let documentV133='+request+';\n          if(independentV133)documentV133=window.rafexIndependentProjectV133(documentV133,crypto.randomUUID(),Date.now());\n          const result = await req("/api/projects", { method: "POST", body: JSON.stringify(documentV133) });\n          if(independentV133){window.rafexOpenIndependentV133(documentV133);showProjectSavedNotice(result.serialNo,projectName);try{await m2RefreshProjects();await loadProjects()}catch(_){}return;}');
  replace('finally { if (button) button.disabled = false; }\n      }\n      function m2ProjectPlacementError', 'finally { window.rafexProjectSavingV133=false; if (button) button.disabled = false; }\n      }\n      function m2ProjectPlacementError');
  // Keep the project catalog authoritative when the global registry refreshes,
  // including requests that were already in flight when the project opened.
  replace('m2SavedRackTypes=cache.map((entry)=>({...entry,drawing:clone(entry.__rafexSnapshot)}));', 'm2SavedRackTypes=(window.rafexProjectTypesV133||cache).map((entry)=>({...entry,drawing:clone(entry.__rafexSnapshot||entry.drawing)}));');
  replace('count:cache.filter((entry)=>entry.__rafexSystem===system.key).length', 'count:m2SavedRackTypes.filter((entry)=>entry.__rafexSystem===system.key).length');
  replace('    if(!isFree()){if(originalRefresh)return originalRefresh();return [];}',`    if(!isFree()){if(originalRefresh)return originalRefresh();return [];}
    if(window.rafexProjectTypesV133){
      if(force){
        const owner=window.rafexProjectIdentityV133?.uuid,records=await fetchRegistry();
        if(owner!==window.rafexProjectIdentityV133?.uuid)return [];
        const key=entry=>{const drawing=structuredClone(entry.__rafexSnapshot||entry.drawing);delete drawing.rafexCatalogKey;return JSON.stringify([entry.__rafexSystem,entry.name,drawing]);};
        const known=new Set(window.rafexProjectTypesV133.map(key));
        const missing=records.filter(entry=>!known.has(key(entry)));
        if(missing.length){const imported=window.rafexIndependentProjectV133({payload:{rackTypes:missing,layout:{racks:[]}}},crypto.randomUUID(),Date.now());window.rafexProjectTypesV133.push(...imported.payload.rackTypes);}
      }
      installCache(currentSelectedKey());return window.rafexProjectTypesV133;
    }`);
  replace("      if(!isFree())return originalDeleteAll();", "      if(!isFree())return originalDeleteAll();\n      if(window.rafexProjectTypesV133){if(confirm('Bu projedeki raf tipi listesini temizle? Yerleşimdeki raflar korunur.')){window.rafexProjectTypesV133=[];installCache('');}return;}");
  replace("    const entry=m2SavedRackTypes[index];if(!entry)return;\n    if(!confirm", "    const entry=m2SavedRackTypes[index];if(!entry)return;\n    if(window.rafexProjectTypesV133){if(confirm(entry.name+' raf tipini bu projenin listesinden kaldır?')){window.rafexProjectTypesV133=window.rafexProjectTypesV133.filter(item=>item.id!==entry.id);installCache('');}return;}\n    if(!confirm");
  // Save the same identity on subsequent ordinary saves, too.
  // The v44 common catalog wraps the earlier unified catalog. Protect the
  // final owner too, including its legacy API refresh and delete handlers.
  replace('  async function loadCatalog(force){\n    if(!isFree())return [];', `  async function loadCatalog(force){
    if(!isFree())return [];
    const ownerV133=window.rafexProjectIdentityV133?.uuid;
    if(window.rafexProjectTypesV133&&!force){installCatalog();return window.rafexProjectTypesV133;}`);
  replace('      catalog=merged;catalogReady=true;catalogLoadedAt=Date.now();installCatalog();', `      catalog=merged;catalogReady=true;catalogLoadedAt=Date.now();
      if(ownerV133&&ownerV133===window.rafexProjectIdentityV133?.uuid&&window.rafexProjectTypesV133){
        const key=entry=>{const drawing=structuredClone(entry.__rafexSnapshot||entry.drawing);delete drawing.rafexCatalogKey;return JSON.stringify([entry.__rafexSystem,entry.__rafexOriginalName||entry.name,drawing]);};
        const known=new Set(window.rafexProjectTypesV133.map(key));
        const missing=merged.filter(entry=>!known.has(key(entry)));
        if(missing.length){const imported=window.rafexIndependentProjectV133({payload:{rackTypes:missing,layout:{racks:[]}}},crypto.randomUUID(),Date.now());window.rafexProjectTypesV133.push(...imported.payload.rackTypes);}
      }
      installCatalog();`);
  replace('m2SavedRackTypes=catalog.slice().sort(function(a,b){return letterNo(a.name)-letterNo(b.name);});', 'm2SavedRackTypes=structuredClone(window.rafexProjectTypesV133||catalog).sort(function(a,b){return letterNo(a.name)-letterNo(b.name);});');
  replace('      if(!catalogReady){\n        var list=', '      if(window.rafexProjectTypesV133){m2SavedRackTypes=structuredClone(window.rafexProjectTypesV133);return renderCommonCatalogBase.apply(this,arguments);}\n      if(!catalogReady){\n        var list=');
  replace("    var entry=m2SavedRackTypes[index];if(!entry)return;\n    if(!confirm", "    var entry=m2SavedRackTypes[index];if(!entry)return;\n    if(window.rafexProjectTypesV133){if(confirm(entry.name+' raf tipini bu projenin listesinden kaldır?')){window.rafexProjectTypesV133=window.rafexProjectTypesV133.filter(item=>item.id!==entry.id);installCatalog();}return;}\n    if(!confirm");
  replace("    if(!catalog.length){status('Silinecek kayıtlı raf tipi yok.');return;}", "    if(isFree()&&window.rafexProjectTypesV133){if(confirm('Bu projedeki raf tipi listesini temizle? Yerleşimdeki raflar korunur.')){window.rafexProjectTypesV133=[];installCatalog();}return;}\n    if(!catalog.length){status('Silinecek kayıtlı raf tipi yok.');return;}");
  replace('drawing: projectDrawingV106, rackTypes: m2SavedRackTypes, layout } };', 'drawing: projectDrawingV106, rackTypes: m2SavedRackTypes, layout, ...(window.rafexProjectIdentityV133?{projectIdentity:window.rafexProjectIdentityV133}:{}) } };');
  // Existing retained dragging stays intact; full refreshes reuse unchanged
  // rack nodes. Other nodes are rebuilt so event listeners never accumulate.
  replace('layer.innerHTML = html; m2PerfRefreshLayoutDomTable(layer);', 'window.rafexCommitLayoutV133(layer,html); m2PerfRefreshLayoutDomTable(layer);');
  // Cache expensive geometry decoration per retained group and visual settings.
  replace('var id=Number(group.getAttribute("data-rack")),rack=state.racks.find(function(item){return Number(item.id)===id}),finish=', 'var id=Number(group.getAttribute("data-rack")),rack=rackMapV133.get(id),finish=');
  replace('    svg.querySelectorAll("[data-rack]").forEach(function(group){\n      var id=', '    var rackMapV133=new Map(state.racks.map(function(r){return [Number(r.id),r]}));\n    svg.querySelectorAll("[data-rack]").forEach(function(group){\n      var id=');
  replace('      mergeBackToBackProfiles(group,rack);', '      var signatureV133=JSON.stringify([finish,rack&&rack.b2bLayout,isMrRack(rack)]);\n      if(group.__uprightSignatureV133===signatureV133)return;group.__uprightSignatureV133=signatureV133;\n      mergeBackToBackProfiles(group,rack);');
  // Read one SVG transform before writes instead of forcing layout per rack.
  replace('function decorateRack(group){', 'function decorateRack(group,screenScaleV133){');
  replace('selected=frame&&frame.classList.contains("selected");if(frame){', 'selected=frame&&frame.classList.contains("selected");var signatureV133=[color,selected,screenScaleV133,rack&&rack.w,rack&&rack.h].join("|");if(group.__fixedSignatureV133===signatureV133)return;group.__fixedSignatureV133=signatureV133;if(frame){');
  replace('var rect=frame&&frame.getBoundingClientRect(),shortPx=rect?Math.min(rect.width,rect.height):0,', 'var shortPx=frame?Math.min(Number(frame.getAttribute("width"))||0,Number(frame.getAttribute("height"))||0)*(Number(screenScaleV133)||1):0,');
  replace('function decorateRacks(){var node=svg();if(!node)return;node.querySelectorAll("[data-rack]").forEach(decorateRack)}', 'function decorateRacks(){var node=svg();if(!node)return;var matrix=node.getScreenCTM(),scale=matrix?Math.hypot(matrix.a,matrix.b):1;node.querySelectorAll("[data-rack]").forEach(function(group){decorateRack(group,scale)})}');
  replace('    var panel=ensureDetail(),rack=selectedRack(),node=svg();if(!panel||!node)return;', '    return; // Retired detail panel is permanently hidden by v115.');
  const runtime = `<script data-rafex-independent-performance="v133">\nwindow.rafexIndependentProjectV133=${independentProject.toString()};\n${fs.readFileSync(new URL('./independent-performance-runtime-v133.js',import.meta.url),'utf8')}\n${fs.readFileSync(new URL('./project-session-v134.js',import.meta.url),'utf8')}\n</script>`;
  const end=html.lastIndexOf('</body>');
  return html.slice(0,end)+runtime+html.slice(end);
}

if (process.argv[1]?.replaceAll('\\','/').endsWith('/patch-independent-performance-v133.mjs')) {
  const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
  if(!match)throw Error('HTML_BASE64 missing');
  const html=transform(Buffer.from(match[2],'base64').toString('utf8'));
  fs.writeFileSync(file,source.replace(match[0],match[0].replace(match[2],Buffer.from(html).toString('base64'))));
  console.log('v133: independent project snapshots and retained layout rendering installed');
}
