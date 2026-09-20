import fs from 'node:fs';

export function transform(html){
 if(html.includes('/* drag-isolation-v153 */'))return html;
 const replace=(from,to)=>{if(!html.includes(from))throw Error('v153 missing anchor: '+from.slice(0,100));html=html.replace(from,to);};
 // Chrome traces show this document-wide :has() rule invalidating 41k static
 // elements whenever a moving distance label changes. An equivalent modal flag
 // changes only when that modal is opened, closed, inserted or removed.
 replace('body:has(#m2SectionPlacementModal:not([hidden]))>*:not(#m2SectionPlacementModal)', 'body.rafex-section-placement-open-v153>*:not(#m2SectionPlacementModal)');
 // Rewriting hidden attributes invalidates document-wide relational CSS even
 // when the value did not change. Keep all existing permission/selection logic.
 replace('if(b)b.hidden=!allowed()', 'if(b&&b.hidden!==!allowed())b.hidden=!allowed()');
 replace("pick.setAttribute('aria-pressed',String(picking));", "if(pick.getAttribute('aria-pressed')!==String(picking))pick.setAttribute('aria-pressed',String(picking));");
 replace("report.closest('label')?.setAttribute('hidden','');", "const label=report.closest('label');if(label&&!label.hidden)label.hidden=true;");
 // These functions install/synchronize panels, not geometry or collision data.
 // Coalesce them by function identity and replay after the drag is committed.
 replace('function syncUi(){\n    if(!common())return;', 'function syncUi(){\n    if(window.rafexDragUiV153?.defer(syncUi))return;\n    if(!common())return;');
 replace('function ensureButton(){\n    var areaButton=', 'function ensureButton(){\n    if(window.rafexDragUiV153?.defer(ensureButton))return;\n    var areaButton=');
 replace("function sync(){frame=0;var page=document.getElementById('page');if(!common(page))return;cleanOptionText(page);", "function sync(){frame=0;if(window.rafexDragUiV153?.defer(sync))return;var page=document.getElementById('page');if(!common(page))return;cleanOptionText(page);");
 replace("    frame = null;\n    const root = page();", "    frame = null;\n    if(window.rafexDragUiV153?.defer(sync))return;\n    const root = page();");
 replace("    queued=false;\n    const page=document.getElementById('page'),button=document.getElementById('m2SaveRackButton');", "    queued=false;\n    if(window.rafexDragUiV153?.defer(apply))return;\n    const page=document.getElementById('page'),button=document.getElementById('m2SaveRackButton');");
 replace('    if(scheduled){cancelAnimationFrame(scheduled);scheduled=0;}\n    observer.disconnect();', '    if(scheduled){cancelAnimationFrame(scheduled);scheduled=0;}\n    if(window.rafexDragUiV153?.defer(commit))return;\n    observer.disconnect();');
 // A live distance overlay is the only dimension subtree changed by rack drag.
 replace("    for(const group of svg.querySelectorAll('.m2-wall-guide,.m2-distance-guide,[data-between-overlay],.m2-free-measure')){", "    const scope=m2LayoutState.drag?m2PerfDragOverlay:svg;if(!scope?.isConnected)return;\n    for(const group of scope.querySelectorAll('.m2-wall-guide,.m2-distance-guide,[data-between-overlay],.m2-free-measure')){");
 // Repeated status text must not wake every child-list observer on the page.
 const start=html.indexOf('      function m2ApplyLiveRackDrag('),stop=html.indexOf('      function m2ScheduleLiveRackDrag(',start);
 if(start<0||stop<0)throw Error('Missing drag handler');
 let count=0,drag=html.slice(start,stop).replace(/\$\("m2FloorStatus"\)\.textContent=((?:"(?:\\.|[^"\\])*"|[^";])+);/g,(_,expression)=>{count++;return 'm2SetDragStatusV153('+expression+');'});
 if(count!==4)throw Error('Unexpected drag status count: '+count);
 html=html.slice(0,start)+'      function m2SetDragStatusV153(text){const node=$("m2FloorStatus");if(node&&node.textContent!==text)node.textContent=text;}\n'+drag+html.slice(stop);
 replace('function m2ApplyLiveRackDrag(svg,drag,clientX,clientY){', '/* drag-isolation-v153 */\n      function m2ApplyLiveRackDrag(svg,drag,clientX,clientY){');
 const scheduler=fs.readFileSync(new URL('./drag-ui-scheduler-v153.js',import.meta.url),'utf8');
 replace('</head>','<script data-drag-ui="v153">'+scheduler+'</script></head>');
 const runtime=fs.readFileSync(new URL('./section-modal-state-v153.js',import.meta.url),'utf8');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body');
 return html.slice(0,end)+'<script data-drag-isolation="v153">'+runtime+'\n(function(){const render=m2RenderLayout;m2RenderLayout=function(){try{return render.apply(this,arguments)}finally{window.rafexDragUiV153.schedule()}}})();</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-drag-isolation-v153.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!m)throw Error('Missing compiled HTML');
 fs.writeFileSync(file,source.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
