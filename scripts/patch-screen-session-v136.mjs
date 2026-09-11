import fs from 'node:fs';

// Final-runtime repair against cfcd589. Keep geometry, calculations and v135 intact.
export function transform(html) {
  if (html.includes('data-rafex-screen-session="v136"')) return html;
  function replace(from,to) {
    if (!html.includes(from) || html.indexOf(from)!==html.lastIndexOf(from)) throw Error('v136 missing/ambiguous anchor: '+from.slice(0,100));
    html=html.replace(from,to);
  }
  replace("var common=page.dataset.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page');",
    "var common=document.querySelector('#nav button.active[data-page]')?.dataset.page==='free';");
  replace("if(nav&&nav.dataset.page!=='free'&&common()){active=null;window.rafexProjectIdentityV133=null;window.rafexProjectTypesV133=null;}",
    "// v136: navigation suspends the common session instead of deleting it.");
  replace("  const navigate=showPage;\n  showPage=function(name){\n    if((name!=='free'&&common())||(name==='free'&&!common())){active=null;window.rafexProjectIdentityV133=null;window.rafexProjectTypesV133=null;}\n    const result=navigate.apply(this,arguments);schedule();return result;\n  };window.showPage=showPage;",
    `  const navigate=showPage,sessionsV136=new Map();
  showPage=function(name){
    const previous=document.querySelector('#nav button.active[data-page]')?.dataset.page;
    if(previous!==name){
      if(previous)sessionsV136.set(previous,{active,identity:window.rafexProjectIdentityV133,types:window.rafexProjectTypesV133});
      const next=sessionsV136.get(name);
      active=next?.active||null;window.rafexProjectIdentityV133=next?.identity||null;window.rafexProjectTypesV133=next?.types||null;
    }
    const result=navigate.apply(this,arguments);schedule();return result;
  };window.showPage=showPage;`);
  // Retained page datasets must not leak common mode into standalone renderers.
  replace("if(free.active){restoreStandaloneState();free.active=false;free.currentEngine=null;}",
    `if(free.active){restoreStandaloneState();free.active=false;free.currentEngine=null;}
      const leavingPage=document.getElementById('page');
      if(leavingPage){delete leavingPage.dataset.rafexFreeDrawing;delete leavingPage.dataset.rafexFreeContextSystem;leavingPage.classList.remove('rafex-free-drawing-page','rafex-common-independent');}`);
  // A fresh picker must describe the engine actually rendered.
  replace("free.pending=free.selected||null;", "free.selected=free.selected||'b2b';free.pending=free.selected;");
  // Konsol must restore the shared layout too when returning from standalone.
  replace("    if(target==='konsol'){ensureUnifiedState();m2ActiveModule='konsol';free.currentEngine='konsol';}\n    else restoreEngine(target);", "    restoreEngine(target);");
  replace("      page.dataset.rafexFreeContextSystem=target;", "      page.dataset.rafexFreeContextSystem=target;page.dataset.rafexFreeDrawing='1';");
  // Standalone Konsol has no shared floor editor; create its host before adapting it.
  replace("    var page=document.getElementById('page'),floor=page&&page.querySelector('.m2-floor-editor');", "    var page=document.getElementById('page'),floor=page&&page.querySelector('#m2ReportType')?.closest('.m2-floor-editor');");
  replace("    if(target==='b2b')renderB2B();else if(target==='mr')renderMR();else if(target==='drive')renderDrive();else if(target==='konsol')renderKonsolCommon();else renderMekik2();",
    "    if(target==='konsol'&&!page?.querySelector('#m2ReportType')){renderMekik2();m2ActiveModule='konsol';}\n    if(target==='b2b')renderB2B();else if(target==='mr')renderMR();else if(target==='drive')renderDrive();else if(target==='konsol')renderKonsolCommon();else renderMekik2();");
  replace('if(reportType){reportType.value="corporate";', 'if(reportType){if(!m2CommonDrawingActive())reportType.value="corporate";');
  replace('if($("m2ReportType")){$("m2ReportType").value="corporate";', 'if($("m2ReportType")&&!m2CommonDrawingActive()){$("m2ReportType").value="corporate";');
  // Report photos belong to the shared document, not the last input editor.
  replace("'freeMeasure','layoutSymbols','selectedSymbolId'];", "'freeMeasure','layoutSymbols','selectedSymbolId','reportImages'];");
  // One New Project control; old detached editor nodes can rejoin the page.
  replace("const field=name?.closest('label'),existing=document.getElementById('rafexNewProjectV133');",
    "const field=name?.closest('label'),existing=document.getElementById('rafexNewProjectV133');\n    document.querySelectorAll('[id=\"rafexNewProjectV133\"]').forEach(node=>{if(node!==existing)node.remove();});");
  const marker='<script data-rafex-manual-free-output="v32">';
  const start=html.indexOf(marker),end=html.indexOf('</script>',start);
  if(start<0||end<0)throw Error('v136 output owner missing');
  html=html.slice(0,start)+marker+fs.readFileSync(new URL('./screen-output-runtime-v136.js',import.meta.url),'utf8')+html.slice(end);
  const css=`<style data-rafex-screen-session="v136">
html .m2-report-panel[data-rafex-ready-v136="summary"]>#m2A4Sheet{display:grid!important}
html .m2-report-panel[data-rafex-ready-v136="corporate"]>#m2CorporatePreview{display:block!important}
.m2-report-panel:not([data-rafex-ready-v136])>#m2A4Sheet,.m2-report-panel:not([data-rafex-ready-v136])>#m2CorporatePreview{display:none!important}
</style>`;
  const bodyEnd=html.lastIndexOf('</body>');
  return html.slice(0,bodyEnd)+css+html.slice(bodyEnd);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-screen-session-v136.mjs')){
  const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
  if(!m)throw Error('HTML_BASE64 missing');
  const html=transform(Buffer.from(m[2],'base64').toString('utf8'));
  fs.writeFileSync(file,source.replace(m[0],m[0].replace(m[2],Buffer.from(html).toString('base64'))));
  console.log('v136: scoped project sessions, navigation headings and unified manual output');
}
