import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-common-perf="v212"'))return html;
 const rep=(a,b)=>{if(!html.includes(a))throw Error('Missing '+a.slice(0,100));html=html.replace(a,b)};
 rep('function scheduleProducts(){[0,20,80,180].forEach(ms=>setTimeout(()=>{try{if(typeof window.m2RenderLayoutProductList===\'function\')window.m2RenderLayoutProductList();}catch{}decorateProducts();refreshNativeParts();},ms));}',`let productRefreshV212=0;function scheduleProducts(){clearTimeout(productRefreshV212);productRefreshV212=setTimeout(()=>{productRefreshV212=0;try{window.m2RenderLayoutProductList?.();}catch{}decorateProducts();refreshNativeParts();},40);}`);
 rep('[0,30,120].forEach(ms=>setTimeout(()=>{refreshNativeParts();scheduleProducts();},ms));','scheduleProducts();');
 html=html.replaceAll('m2RenderLayout();m2RenderLayoutProductList();','m2RenderLayout();');
 // Skip the superseded camera pass and initialize fixed controls once per SVG.
 rep('if(rendering||!isActive())return;rendering=true;try{insertControls();bind();if(navMode&&activeTool())setNavMode(false);apply()}finally{rendering=false}', 'if(window.__rafexCommonLayoutZoomCrispV126||rendering||!isActive())return;rendering=true;try{insertControls();bind();if(navMode&&activeTool())setNavMode(false);apply()}finally{rendering=false}');
 rep('try{resetCanvas();removeCameraControls();decorateRacks();renderDetail()}','try{const nodeV212=svg();if(nodeV212&&!nodeV212.__fixedControlsV212){resetCanvas();removeCameraControls();nodeV212.__fixedControlsV212=true;}decorateRacks();renderDetail()}');
 // Cache each rack drawing independently. Cross-rack dependencies are explicit.
 const start=html.indexOf('        m2LayoutState.racks.forEach((rack, index) => {',html.indexOf('function m2RenderLayout()')),end=html.indexOf('        html+=m2LayoutState.racks.flatMap',start);if(start<0||end<0)throw Error('Rack loop');
 let loop=html.slice(start,end);const body=loop.slice(loop.indexOf('{')+1,loop.lastIndexOf('        });')).replaceAll('return;','return html;');
 const replacement=`        const rackCacheV212=window.rafexCommonPerfV212.racks;
        const globalKeyV212=JSON.stringify([m2LayoutState.scale,m2LayoutState.points,m2ShowSharedFootLabels,$('m2ShowFlowArrows')?.checked,$('programLanguage')?.value]);
        const seismicIdsV212=new Set(m2LayoutState.racks.flatMap(r=>(r.seismicBraces||[]).flatMap(b=>b.rackIds||[])).map(Number));
        const liveIdsV212=new Set();
        m2LayoutState.racks.forEach((rack,index)=>{
          liveIdsV212.add(rack.id);
          const dimensionsV212=['length-top:','length-bottom:','depth-left:','depth-right:'].map(k=>[m2HiddenSummaryDimensions.has(k+rack.id),m2DimensionOffsets['total-'+k+rack.id]]);
          const peersV212=rack.joinGroup?m2LayoutState.racks.filter(r=>r.joinGroup===rack.joinGroup).map(r=>[r.id,r.x,r.y,r.w,r.h,r.angle]):null;
          const keyV212=JSON.stringify([rack,index,globalKeyV212,rack.id===m2LayoutState.selected||m2MultiSelect.rackIds.has(rack.id),m2VisibleRackDimensions.length.has(rack.id),m2VisibleRackDimensions.depth.has(rack.id),dimensionsV212,seismicIdsV212.has(Number(rack.id)),peersV212]);
          const cachedV212=rackCacheV212.get(rack.id);
          if(cachedV212?.key===keyV212){html+=cachedV212.html;window.rafexCommonPerfV212.hits++;return;}
          const rackHtmlV212=(()=>{let html='';${body}\nreturn html;})();
          rackCacheV212.set(rack.id,{key:keyV212,html:rackHtmlV212});html+=rackHtmlV212;window.rafexCommonPerfV212.misses++;
        });
        for(const id of rackCacheV212.keys())if(!liveIdsV212.has(id))rackCacheV212.delete(id);
`;
 html=html.slice(0,start)+replacement+html.slice(end);
 // Reuse unchanged boundary input fields.
 const edgeStart=html.indexOf('          editor.innerHTML = Array.from({ length: edgeCount }'),edgeEnd=html.indexOf('          }).join("");',edgeStart);if(edgeStart<0||edgeEnd<0)throw Error('Edge editor');
 const edge=html.slice(edgeStart,edgeEnd+'          }).join("");'.length).replace('editor.innerHTML =','const edgeMarkupV212 =');html=html.slice(0,edgeStart)+edge+'\n          if(editor.__markupV212!==edgeMarkupV212){editor.innerHTML=edgeMarkupV212;editor.__markupV212=edgeMarkupV212;}'+html.slice(edgeEnd+'          }).join("");'.length);
 // Delegate dimension interactions once per layer, instead of binding every node each redraw.
 rep('        layer.querySelectorAll(".m2-dimension-movable[data-dimension-key]").forEach((node)=>{\n          node.addEventListener("pointerdown",(event)=>{',`        if(!layer.__dimensionEventsV212){layer.__dimensionEventsV212=true;
          layer.addEventListener("pointerdown",(event)=>{
            const node=event.target.closest?.('.m2-dimension-movable[data-dimension-key]');if(!node||!layer.contains(node))return;`);
 rep('          node.addEventListener("dblclick",(event)=>{\n            const match=String(node.dataset.dimensionKey||"")',`          layer.addEventListener("dblclick",(event)=>{
            const node=event.target.closest?.('.m2-dimension-movable[data-dimension-key]');if(!node||!layer.contains(node))return;
            const match=String(node.dataset.dimensionKey||"")`);
 rep('m2ConfirmHideSummaryDimension(match[1],Number(match[2]));\n          },{capture:true});\n        });','m2ConfirmHideSummaryDimension(match[1],Number(match[2]));\n          },{capture:true});\n        }');
 // Form-only observers should ignore updates inside drawings and product lists.
 const observer='new MutationObserver(queue).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:[\'class\',\'data-rafex-common-active\',\'data-rafex-common-system\']});';
 if(!html.includes(observer))throw Error('Form observers');html=html.replaceAll(observer,"new MutationObserver(records=>{if(window.rafexCommonPerfV212.formChange(records))queue();}).observe(document.getElementById('page')||document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-rafex-common-active','data-rafex-common-system']});");
 rep("new MutationObserver(queue).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-rafex-common-active','data-rafex-common-system','data-m2-module']});","new MutationObserver(records=>{if(window.rafexCommonPerfV212.formChange(records))queue();}).observe(document.getElementById('page')||document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-rafex-common-active','data-rafex-common-system','data-m2-module']});");
 const runtime=`<script data-common-perf="v212">window.rafexCommonPerfV212={racks:new Map(),hits:0,misses:0,formChange(records){return records.some(r=>{const e=r.target.nodeType===1?r.target:r.target.parentElement;return !e?.closest('#m2LayoutSvg,#m2LayoutProductList,#m2Top,#m2Side,#m2Front,#m2CorporatePreview,#m2A4Sheet');});}};</script>`;
 return html.replace('</head>',runtime+'</head>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-common-perf-v212.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}
