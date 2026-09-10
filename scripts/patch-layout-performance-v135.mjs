import fs from 'node:fs';

// Applied to the final runtime, after v133. Fail closed if an upstream patch
// changes an anchor: never silently ship a partially installed optimization.
export function transform(html) {
  if (html.includes('data-rafex-layout-performance="v135"')) return html;
  const replace = (from, to) => {
    if (!html.includes(from) || html.indexOf(from) !== html.lastIndexOf(from)) throw Error('v135 anchor missing/ambiguous: ' + from.slice(0,100));
    html = html.replace(from, to);
  };
  const section = (marker, change) => {
    const start=html.indexOf('<script '+marker),end=html.indexOf('</script>',start);
    if(start<0||end<0)throw Error('v135 script missing: '+marker);
    const before=html.slice(start,end),after=change(before);
    if(before===after)throw Error('v135 script unchanged: '+marker);
    html=html.slice(0,start)+after+html.slice(end);
  };
  replace('function m2SyncAttachedProtections(){m2LayoutSymbols.forEach',
    'function m2SyncAttachedProtections(){const racksV135=new Map(m2LayoutState.racks.map(r=>[r.id,r]));m2LayoutSymbols.forEach');
  replace('const rack=m2LayoutState.racks.find((item)=>item.id===symbol.rackId);if(!rack)return;',
    'const rack=racksV135.get(symbol.rackId);if(!rack)return;');
  replace("layer.querySelectorAll('[data-layout-symbol]').forEach((node)=>{const symbol=m2LayoutSymbols.find((item)=>item.id===Number(node.dataset.layoutSymbol));",
    "const symbolsV135=new Map(m2LayoutSymbols.map(symbol=>[symbol.id,symbol]));\n        layer.querySelectorAll('[data-layout-symbol]').forEach((node)=>{const symbol=symbolsV135.get(Number(node.dataset.layoutSymbol));");

  // v50/v126 own the visible viewport. v49 controls are already permanently
  // hidden; its obsolete renderer was forcing a layout for every single rack
  // before v50 repainted the same labels. Keep the old API for compatibility.
  section('data-rafex-common-drawing-viewport="v49"', source => source
    .replace('function isActive(){', 'function isActive(){if(window.rafexCommonDrawingFixedCanvasV50)return false;')
    .replace('function decorate(){', 'function decorate(){if(window.rafexCommonDrawingFixedCanvasV50)return;'));
  replace('function decorateRack(group,screenScaleV133){',
    'function decorateRack(group,screenScaleV133){group.classList.add("rafex-type-contour");');

  // Leave unchanged rack groups attached to the live SVG. Moving every retained
  // rack into a detached buffer used to invalidate its entire rendered subtree.
  replace(`    for(const placeholder of buffer.querySelectorAll('[data-rafex-retain-v133]'))placeholder.replaceWith(retained[Number(placeholder.dataset.rafexRetainV133)]);
    for(const fresh of buffer.querySelectorAll('[data-rack]'))if(freshMarkup.has(fresh.dataset.rack))markup.set(fresh,freshMarkup.get(fresh.dataset.rack));
    layer.replaceChildren(...buffer.childNodes);`,
    `    for(const fresh of buffer.querySelectorAll('[data-rack]'))if(freshMarkup.has(fresh.dataset.rack))markup.set(fresh,freshMarkup.get(fresh.dataset.rack));
    const desiredV135=Array.from(buffer.childNodes).map(node=>node.nodeType===1&&node.hasAttribute('data-rafex-retain-v133')?retained[Number(node.dataset.rafexRetainV133)]:node);
    const keepV135=new Set(desiredV135);
    for(const child of Array.from(layer.childNodes))if(!keepV135.has(child))child.remove();
    let cursorV135=layer.firstChild;
    for(const child of desiredV135){if(child===cursorV135)cursorV135=cursorV135.nextSibling;else layer.insertBefore(child,cursorV135);}`);

  // MR readiness depends on rack membership/type, not every label/guide change.
  replace("function decorate(){var svg=document.getElementById('m2LayoutSvg');if(!svg)return;svg.querySelectorAll('[data-rack]').forEach(function(node){node.classList.toggle('rafex-mr-extension-ready',isMr(rackById(node.dataset.rack)))})}",
    "function decorate(){var svg=document.getElementById('m2LayoutSvg');if(!svg)return;var racks=new Map((state()?.racks||[]).map(r=>[Number(r.id),r]));svg.querySelectorAll('[data-rack]').forEach(function(node){node.classList.toggle('rafex-mr-extension-ready',isMr(racks.get(Number(node.dataset.rack))))})}");
  replace('var observer=new MutationObserver(function(){requestAnimationFrame(decorate)});observer.observe(document.documentElement,{childList:true,subtree:true});',
    `var decorateFrameV135=0;
  var observer=new MutationObserver(function(records){
    if(decorateFrameV135||!records.some(record=>Array.from(record.addedNodes).some(node=>node.nodeType===1&&(node.matches('[data-rack],#m2LayoutSvg')||node.querySelector('[data-rack],#m2LayoutSvg')))))return;
    decorateFrameV135=requestAnimationFrame(function(){decorateFrameV135=0;decorate()});
  });observer.observe(document.documentElement,{childList:true,subtree:true});`);

  // Retain ordinary racks AND their attached upright protections on release.
  // Topology changes, mixed selections, seismic bracing and tunnel barriers keep
  // the established full renderer. Static columns still participate in collision
  // checks and measurement guides, exactly as during the existing fast drag.
  replace('||m2LayoutSymbols.length)return false;\n        const layer=$("m2LayoutContent"),rack=byId.get(Number(drag.id));',
    `||m2LayoutSymbols.some(s=>!['uaks','uakz','column'].includes(s.type)))return false;
        const movingV135=new Set(members.map(r=>Number(r.id)));
        if(m2LayoutState.racks.some(r=>(r.seismicBraces||[]).some(b=>(b.rackIds||[]).some(id=>movingV135.has(Number(id))))))return false;
        if((drag.perfSharedFootEntries||[]).some(e=>e.ids.some(id=>movingV135.has(id))&&!e.ids.every(id=>movingV135.has(id))))return false;
        const attachedV135=m2LayoutSymbols.filter(s=>movingV135.has(Number(s.rackId))&&/^(uaks|uakz)$/.test(s.type));
        if(attachedV135.some(s=>!m2PerfSymbolDomTable.get(Number(s.id))?.node?.isConnected))return false;
        const layer=$("m2LayoutContent"),rack=byId.get(Number(drag.id));`);
  replace('(drag.perfSharedFootEntries||[]).forEach(rebase);\n        m2LayoutState.drag=null;',
    `(drag.perfSharedFootEntries||[]).forEach(rebase);
        m2SyncAttachedProtections();
        attachedV135.forEach(s=>rebase(m2PerfSymbolDomTable.get(Number(s.id))));
        m2LayoutState.drag=null;`);
  replace('if(!m2PerfRenderSingleRackDragFrame())return false;\n        const unchanged=m2FastDragUnchanged(drag);',
    `if(!m2PerfRenderSingleRackDragFrame())return false;
        if((drag.perfSharedFootEntries||[]).some(e=>e.ids.some(id=>movingV135.has(id))&&!e.ids.every(id=>movingV135.has(id))))return false;
        const unchanged=m2FastDragUnchanged(drag);`);
  const end=html.lastIndexOf('</body>');
  if(end<0)throw Error('v135 body end missing');
  return html.slice(0,end)+'<script data-rafex-layout-performance="v135">window.rafexLayoutPerformanceVersion="v135";</script>'+html.slice(end);
}

if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-layout-performance-v135.mjs')){
  const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
  if(!match)throw Error('HTML_BASE64 missing');
  const html=transform(Buffer.from(match[2],'base64').toString('utf8'));
  fs.writeFileSync(file,source.replace(match[0],match[0].replace(match[2],Buffer.from(html).toString('base64'))));
  console.log('v135: large protected layouts optimized without reducing drawing detail');
}
