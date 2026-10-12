import fs from 'node:fs';
const coordinator = fs.readFileSync(new URL('../client/ui-refresh-v321.js',import.meta.url),'utf8');
export function transform(html) {
  if (html.includes('/* simplified-ui-v321 */')) return html;
  const changeScript = (attribute, edit) => {
    const regex = new RegExp('<script\\b[^>]*'+attribute+'(?:="[^"]*")?[^>]*>([\\s\\S]*?)<\\/script>');
    const match = html.match(regex);
    if (!match) throw Error('Missing UI simplification module: '+attribute);
    html = html.replace(match[0], edit(match[1],match[0]));
  };
  const replace = (text, before, after) => {
    if (!text.includes(before)) throw Error('Missing UI simplification anchor: '+before.slice(0,90));
    return text.replace(before,after);
  };
  if (!html.includes('data-rafex-common-layout-zoom-crisp="v126"')) throw Error('Latest viewport is required');
  changeScript('data-rafex-common-drawing-viewport',()=>'');
  changeScript('data-rafex-common-drawing-fixed-canvas',text=>{
    const start=text.indexOf('  const nameplateCacheV152='),end=text.indexOf('  function afterRender()',start);
    if(start<0||end<0)throw Error('Current cached nameplate functions missing');
    // Keep the current appearance and cache. Retired viewport/detail code is not installed.
    const helpers=text.slice(start,end);
    return '<script data-rafex-nameplates="v321">(()=>{\n'+
      'const state=()=>m2LayoutState,svg=()=>document.getElementById("m2LayoutSvg"),rackById=id=>(state().racks||[]).find(r=>Number(r.id)===Number(id));\n'+helpers+
      'const render=m2RenderLayout;m2RenderLayout=function(){const result=render.apply(this,arguments);if(!window.rafexLayoutRenderDeferredV321())decorateRacks();return result;};\n'+
      'window.rafexFitNameplatesV136=groups=>(groups||svg()?.querySelectorAll("[data-rack]"))?.forEach(compactNameplateV136);\n'+
      '})();</script>';
  });
  // The inventory renderer superseded the disclosure renderer and saved-action wrappers.
  if (!html.includes('data-rafex-layout-inventory="v44"') || !html.includes('data-rafex-unified-free-catalog')) throw Error('Current inventory/catalog are required');
  changeScript('data-rafex-native-output-free-ux',()=>`<script data-rafex-output-defaults="v321">(()=>{
    function defaults(){document.querySelectorAll('#page .m2-report-panel select').forEach(select=>{
      const corporate=Array.from(select.options).find(option=>option.value==='corporate');
      if(!corporate||select.dataset.rafexCorporatePriority)return;
      select.dataset.rafexCorporatePriority='1';corporate.defaultSelected=true;
      if(select.options[0]!==corporate)select.insertBefore(corporate,select.options[0]);
      select.value='corporate';select.dispatchEvent(new Event('change',{bubbles:true}));
    });}
    window.rafexObserveUIV321(defaults);defaults();
  })();</script>`);
  changeScript('data-rafex-product-toggle',()=>'');
  changeScript('data-common-perf',(text,original)=>original.replace(text,'/* simplified-ui-v321 */\n'+coordinator+'\n'+text));
  changeScript('data-rafex-uniform-system-banner',(text,original)=>{
    text=replace(text,"    var page=document.getElementById('page');if(!page)return;",`    var page=document.getElementById('page');if(!page)return;
    if(page.querySelector('#trayForm')||document.querySelector('#nav button.active[data-page]')?.dataset.page==='tava'){
      page.querySelectorAll('[data-rafex-system-banner]').forEach(node=>node.remove());
      if(document.body.classList.contains('rafex-common-header-v95'))document.body.classList.remove('rafex-common-header-v95');return;
    }`);
    return original.replace(original.match(/>([\s\S]*?)<\/script>/)[1],text);
  });
  const shared=['data-rafex-uniform-system-banner','data-rafex-module-access-common','data-rafex-horizontal-products-savebar','data-rafex-common-b2b-input','data-rafex-common-mekik-input','data-rafex-uniform-color-controls'];
  for(const attribute of shared)changeScript(attribute,(text,original)=>{
    let changed=0;
    text=text.replace(/new MutationObserver\((\w+|records=>\{if\(window\.rafexCommonPerfV212\.formChange\(records\)\)queue\(\);\})\)\.observe\((?:page|document\.body|document\.documentElement|document\.getElementById\('page'\)\|\|document\.body),\{[^;]+?\}\);/g,(_all,callback)=>{changed++;return 'window.rafexObserveUIV321('+callback+');';});
    if(changed!==1)throw Error('Expected one structural observer in '+attribute+'; found '+changed);
    return original.replace(original.match(/>([\s\S]*?)<\/script>/)[1],text);
  });
  changeScript('data-rafex-sidebar-order',(text,original)=>original.replace('new MutationObserver(apply).observe(nav,{childList:true,subtree:true});',"window.rafexObserveUIV321(apply,'nav');"));
  changeScript('data-rafex-free-nav-ortak',(text,original)=>{
    text=replace(text,'navObserver=new MutationObserver(apply);',"navObserver=window.rafexObserveUIV321(apply,'nav');");
    text=replace(text,'navObserver.observe(nav,{childList:true,subtree:true,characterData:true});','');
    return original.replace(original.match(/>([\s\S]*?)<\/script>/)[1],text);
  });
  changeScript('data-rafex-workflow-screens',(text,original)=>{
    text=replace(text,"    if (root.dataset.rafexWorkflowScreen !== screen) root.dataset.rafexWorkflowScreen = screen;","    if (root.dataset.rafexWorkflowScreen !== screen) root.dataset.rafexWorkflowScreen = screen;\n    window.rafexSyncLayoutScreenV321(screen);");
    text=replace(text,'  const observer = new MutationObserver(queue);', '  window.rafexObserveUIV321(queue);');
    text=replace(text,"  const start = () => { observer.observe(document.getElementById('page') || document.body, {childList:true,subtree:true}); sync(); };",'  const start = () => { sync(); };');
    return original.replace(original.match(/>([\s\S]*?)<\/script>/)[1],text);
  });
  changeScript('data-rafex-common-layout-zoom-crisp',(text,original)=>{
    text=replace(text,"var boundsKey='',observedNode=null;","var boundsKey='',observedNode=null,boundsSnapshotV321=null;");
    text=replace(text,"function syncBounds(){var b=frameBounds(),key=[b.x,b.y,b.w,b.h].join('|');if(key!==boundsKey){boundsKey=key;view={...b};}return b;}","function syncBounds(){var b=frameBounds(),key=[b.x,b.y,b.w,b.h].join('|');if(!boundsSnapshotV321||['x','y','w','h'].some(k=>Math.abs(b[k]-boundsSnapshotV321[k])>.25)){boundsKey=key;boundsSnapshotV321={...b};view={...b};}return b;}");
    text=replace(text,'install();apply();return result','install();return result');
    text=text.replace(/\[50,180,500,1000\]\.forEach\(function\(ms\)\{setTimeout\(install,ms\)\}\)/,'requestAnimationFrame(install)');
    text=replace(text,'[0,80,240,700,1400].forEach(function(ms){setTimeout(install,ms)});','requestAnimationFrame(install);');
    return original.replace(original.match(/>([\s\S]*?)<\/script>/)[1],text);
  });
  html=replace(html,'if(!interactiveRender)m2NormalizeB2BRackDimensions();',`if(!interactiveRender)m2NormalizeB2BRackDimensions();
        if(window.rafexLayoutRenderDeferredV321?.()){window.__rafexLayoutDirtyV321=true;return;}`);
  const end=html.lastIndexOf('</script>');
  if(end<0)throw Error('Missing final render boundary anchor');
  if(!html.slice(html.lastIndexOf('<script')).includes('window.rafexInstallLayoutBoundaryV321();'))html=html.slice(0,end)+'\nwindow.rafexInstallLayoutBoundaryV321();\n'+html.slice(end);
  return html;
}
