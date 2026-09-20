import fs from 'node:fs';

export function transform(html) {
  if (html.includes('data-project-records="v156"')) return html;
  const replace = (from, to) => {
    if (!html.includes(from)) throw Error('v156 anchor missing: ' + from.slice(0,100));
    html = html.replace(from, to);
  };
  // Persist the project catalog even before any blocks have been placed.
  replace('const projectDrawingV106=commonLayoutSaveV106?m2LayoutState.racks[0]:m2LastDrawing;',
    'const projectDrawingV106=commonLayoutSaveV106?(m2LayoutState.racks[0]||window.rafexProjectTypesV133?.[0]?.drawing||m2LastDrawing):m2LastDrawing;');
  replace('drawing: projectDrawingV106, rackTypes: m2SavedRackTypes, layout,',
    'drawing: projectDrawingV106, rackTypes: commonLayoutSaveV106?(window.rafexProjectTypesV133||m2SavedRackTypes):m2SavedRackTypes, layout,');
  const saved = '          const result = await req("/api/projects", { method: "POST", body: JSON.stringify(documentV133) });';
  replace(saved, saved + `
          if(commonLayoutSaveV106&&!independentV133){
            window.rafexProjectSavedV156(result,documentV133);
            showProjectSavedNotice(result.serialNo,projectName);
            if(saveMessage)saveMessage.textContent='Proje #'+result.serialNo+' · '+projectName+' kaydedildi.';
            // A list refresh failure must not turn a successful save into an error.
            await Promise.allSettled([m2RefreshProjects(),loadProjects()]);
            return;
          }`);
  // Keep the two selectors fresh after saves and when reopened.
  replace("if(!loaded)load();", "load();");
  replace("records=result.projects.filter(p=>Array.isArray(p.payload?.rackTypes)).sort", "records=result.projects.filter(p=>p.payload?.layout||Array.isArray(p.payload?.rackTypes)).sort");
  replace("  refresh.addEventListener('click',load);select.addEventListener('change',choose);",
    "  root.addEventListener('rafex-project-saved',()=>{loaded=false;if(root.open)load();});\n  refresh.addEventListener('click',load);select.addEventListener('change',choose);");
  const end = html.lastIndexOf('</body>');
  if (end < 0) throw Error('v156 body missing');
  return html.slice(0,end)+'<script data-project-records="v156">'+fs.readFileSync(new URL('./project-records-v156.js',import.meta.url),'utf8')+'</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-project-records-v156.mjs')){
  const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
  if(!m)throw Error('Missing compiled HTML');
  fs.writeFileSync(file,source.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
