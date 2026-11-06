import fs from 'node:fs';import vm from 'node:vm';
export function transform(html){
 if(html.includes('data-free-wall-start="v509"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v509 missing '+a.slice(0,100));html=html.replace(a,b)};
 replace("m2PushUndo('Mevcut yerleşimde alan çizimi');", "m2PushUndo('Mevcut yerleşimde alan çizimi');\n        if(m2LayoutState.closed&&m2LayoutState.points.length>2){const first=m2LayoutState.points[0],last=m2LayoutState.points.at(-1);if(Math.hypot(first.x-last.x,first.y-last.y)>.001)m2LayoutState.points.push({...first});}\n        m2LayoutState.freeWallStartV509=true;\n        m2LayoutTool=null;m2SeismicDraft=null;m2ProtectionDraft=null;m2SymbolDrag=null;m2NoteDrag=null;m2DimensionDrag=null;");
 replace("Raflar ve görünüm korundu. Rafların etrafındaki alan köşelerini çiz; bitince Alanı Bitir veya Alanı Tamamla düğmesine bas.","Duvar çiziminin başlayacağı herhangi bir noktaya tıkla. Sonra duvar köşelerini çiz; mevcut duvarlar ve raflar korunur.");
 replace('function m2CurrentDrawPoint() {','function m2CurrentDrawPoint() {\n        if(m2LayoutState.mode==="draw"&&m2LayoutState.freeWallStartV509)return null;');
 replace('function m2InsertFreePoint(point) {','function m2InsertFreePoint(point) {\n        if(m2LayoutState.mode==="draw"&&m2LayoutState.freeWallStartV509){\n          const count=m2LayoutState.points.length;m2LayoutState.pathBreaks ||= [];\n          if(count&&!m2LayoutState.pathBreaks.includes(count-1))m2LayoutState.pathBreaks.push(count-1);\n          m2LayoutState.points.push({...point});m2LayoutState.drawFromIndex=count;m2LayoutState.branchSourceIndex=null;m2LayoutState.freeWallStartV509=false;return;\n        }');
 replace('function m2ResumeFreeArea(pointIndex = null) {','function m2ResumeFreeArea(pointIndex = null) {\n        m2LayoutState.freeWallStartV509=false;');
 replace('m2SnapOrtho=function(point){if(window.rafexAlignmentEnabledV256===false)', 'm2SnapOrtho=function(point){if(m2LayoutState.mode==="draw"&&m2LayoutState.freeWallStartV509){last=null;return {...point};}if(window.rafexAlignmentEnabledV256===false)');
 const block='if (m2LayoutState.mode === "draw") {\n            const snapped = m2SnapOrtho(point), last = m2CurrentDrawPoint();\n            if (!last || Math.hypot(snapped.x - last.x, snapped.y - last.y) > 1) m2InsertFreePoint(snapped);\n            m2LayoutState.hover = null; m2RenderLayout(); return;\n          }';
 replace(block,'');
 replace('if(m2SeismicDraft){m2SeismicDraft.start=point;',block+'\n          if(m2SeismicDraft){m2SeismicDraft.start=point;');
 replace('if (!m2LayoutState.points.length) m2InsertFreePoint({ x: 500, y: 325 });','if (!m2CurrentDrawPoint()) { $("m2FloorStatus").textContent="Önce duvarın başlangıç noktasını çizimde tıkla."; return; }');
 const end=html.lastIndexOf('</body>');html=html.slice(0,end)+'<script data-free-wall-start="v509">window.rafexFreeWallStartVersion="v509";</script>'+html.slice(end);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);return html;
}
if(/[\\/]free-wall-start-v509\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('v509 HTML missing');source=source.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,source);console.log('PASS v509: '+file);
}