import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createGroupSolver} from '../client/group-placement-worker.mjs';
import {wallCuts559} from './target-placement-v559.mjs';

export function optimizeLargeLayout(html) {
  const replace=(before,after)=>{
    if(!html.includes(before))throw Error('Large layout anchor missing: '+before);
    html=html.replace(before,after);
  };
  replace('const rackCacheV212=window.rafexCommonPerfV212.racks;',
    'for(const [id,peers] of peerGroupsV248)peerGroupsV248.set(id,JSON.stringify(peers));\n        const rackCacheV212=window.rafexCommonPerfV212.racks;');
  replace('hasSeismicLabel=m2LayoutState.racks.some((owner)=>(owner.seismicBraces||[]).some((brace)=>(brace.rackIds||[]).some((id)=>Number(id)===Number(rack.id))))',
    'hasSeismicLabel=seismicIdsV212.has(Number(rack.id))');
  replace('const state=()=>m2LayoutState,svg=()=>document.getElementById("m2LayoutSvg"),rackById=id=>(state().racks||[]).find(r=>Number(r.id)===Number(id));',
    'const state=()=>m2LayoutState,svg=()=>document.getElementById("m2LayoutSvg");');
  replace('function decorateRack(group,screenScaleV133)', 'function decorateRack(group,screenScaleV133,rack)');
  replace(',rack=rackById(group.getAttribute("data-rack"))', '');
  replace('node.querySelectorAll("[data-rack]").forEach(function(group){decorateRack(group,scale)})',
    'const racksById=new Map((state().racks||[]).map(rack=>[Number(rack.id),rack]));node.querySelectorAll("[data-rack]").forEach(function(group){decorateRack(group,scale,racksById.get(Number(group.getAttribute("data-rack"))))})');
  replace('if(!interactiveRender){m2RenderSelectedRackInfo();m2RenderLayoutProductList();',
    'if(!interactiveRender&&!window.rafexViewportV248?.viewportOnly)m2RenderSelectedRackInfo();\n        if(!interactiveRender&&!window.rafexViewportV248?.viewportOnly&&!m2LargeSelectionRender){m2RenderLayoutProductList();');
  replace("if(event.target?.closest?.('#m2LayoutSvg,.rafex-drag-scene-v248'))scheduleV428();",
    "if(event.button!==2&&event.target?.closest?.('#m2LayoutSvg,.rafex-drag-scene-v248')&&!$('m2LayoutSvg')?.classList.contains('rafex-pan-ready-v168'))scheduleV428();");
  replace('function(){syncRegionsV426(m2LayoutState,racks(),symbols(),m2RackBounds);const result=base.apply(this,arguments);install();draw();return result;};',
    'function(){if(!window.rafexViewportV248?.viewportOnly&&!m2LargeSelectionRender)syncRegionsV426(m2LayoutState,racks(),symbols(),m2RackBounds);const result=base.apply(this,arguments);install();draw();return result;};');
  replace('      function m2PerfBuildSpatialTable(){\n        const drag=m2LayoutState.drag;',
    `      let m2CopyCollisionScope=null,m2LargeSelectionRender=false;
      function m2WithCopyCollisionIndex(callback){
        if(m2CopyCollisionScope||m2LayoutState.racks.length<80)return callback();
        m2CopyCollisionScope={};
        try{return callback();}finally{m2CopyCollisionScope=null;}
      }
      function m2RenderSelectionOnly(){
        const previous=m2LargeSelectionRender;
        m2LargeSelectionRender=true;
        try{return m2RenderLayout();}finally{m2LargeSelectionRender=previous;}
      }
      function m2PerfBuildSpatialTable(){
        const drag=m2LayoutState.drag||m2CopyCollisionScope;`);
  replace('if(duplicateSelectedGroup())return;return baseDuplicate.apply(this,arguments)',
    'return m2WithCopyCollisionIndex(()=>{if(duplicateSelectedGroup())return;return baseDuplicate.apply(this,arguments)})');
  replace('window.rafexDuplicateSelectedBlocksV64=duplicateSelectedGroup;',
    'window.rafexDuplicateSelectedBlocksV64=()=>m2WithCopyCollisionIndex(duplicateSelectedGroup);');
  replace('m2RenderLayout();try{m2RefreshActiveReport()}catch(_){}return true;',
    'm2RenderLayout();return true;');
  replace('if(!offset){for(var y=0;y<=650-bounds.height&&!offset;y+=10)for(var x=0;x<=1000-bounds.width;x+=10)',
    `if(!offset){const points=m2LayoutState.points,xs=points.map(p=>p.x),ys=points.map(p=>p.y);
      const left=xs.length?Math.min(...xs):0,right=xs.length?Math.max(...xs):1000,top=ys.length?Math.min(...ys):0,bottom=ys.length?Math.max(...ys):650;
      for(var y=top;y<=bottom-bounds.height&&!offset;y+=10)for(var x=left;x<=right-bounds.width;x+=10)`);
  replace('[...selected].forEach((id)=>{const rack=m2LayoutState.racks.find((item)=>item.id===id);if(rack?.joinGroup)m2LayoutState.racks.filter((item)=>item.joinGroup===rack.joinGroup).forEach((item)=>selected.add(item.id));});',
    `const selectedGroups=new Set();
        for(const rack of m2LayoutState.racks)if(rack.joinGroup&&selected.has(rack.id))selectedGroups.add(rack.joinGroup);
        for(const rack of m2LayoutState.racks)if(selectedGroups.has(rack.joinGroup))selected.add(rack.id);`);
  replace(':"Tarama alanında raf bulunamadı.";m2RenderLayout();', ':"Tarama alanında raf bulunamadı.";m2RenderSelectionOnly();');
  replace('ids=new Set([...ids].filter(id=>racks().some(r=>r.id===id)));',
    'if(ids.size){const existing=new Set(racks().map(r=>r.id));ids=new Set([...ids].filter(id=>existing.has(id)));}');
  replace('function render(){syncSelection();m2RenderLayout();syncUi();}',
    'function render(){syncSelection();m2RenderSelectionOnly();syncUi();}');
  return addCanvasLayoutTrial(addGroupPlacementWorker(reduceFreeLayoutWork(retainSelectionPreview(retainLayoutEdits(html)))));
}

export function addCanvasLayoutTrial(html){
  const at=html.lastIndexOf('</body>');
  if(at<0)throw Error('Canvas trial body missing');
  const runtime=fs.readFileSync(new URL('./canvas-layout-trial.js',import.meta.url),'utf8');
  return html.slice(0,at)+'<script data-canvas-layout-trial>'+runtime+'</script>'+html.slice(at);
}

export function addGroupPlacementWorker(html){
  const replace=(before,after)=>{
    if(!html.includes(before))throw Error('Group worker anchor missing: '+before);
    html=html.replace(before,()=>after);
  };
  const runtime=fs.readFileSync(new URL('./group-placement-runtime.js',import.meta.url),'utf8');
  replace('      function m2ApplyLiveRackDragBaseV266(svg,drag,clientX,clientY){',
    runtime+'\n      function m2ApplyLiveRackDragBaseV266(svg,drag,clientX,clientY,workerResult,workerCompleted=false){');
  replace('const nextX=point.x-drag.dx,nextY=point.y-drag.dy;\n        if(drag.selectionGroup){',
    `const nextX=point.x-drag.dx,nextY=point.y-drag.dy;
        if(!workerCompleted&&m2QueueGroupPlacement(drag,nextX-drag.originX,nextY-drag.originY,result=>{
          const previous=m2MemberFrameV266;
          m2MemberFrameV266=++m2MemberFrameSerialV266;
          try{m2ApplyLiveRackDragBaseV266(svg,drag,clientX,clientY,result,true);}
          finally{m2MemberFrameV266=previous;}
        }))return;
        const workerPosition=workerResult&&m2GroupTranslationValid(drag.groupMembers,workerResult.dx,workerResult.dy)?workerResult:null;
        if(drag.selectionGroup){`);
  replace('adjusted=m2SmoothGroupTranslation(drag.groupMembers,targetDx,targetDy);m2ApplyGroupTranslation',
    'adjusted=workerPosition||m2SmoothGroupTranslation(drag.groupMembers,targetDx,targetDy);m2ApplyGroupTranslation');
  replace('adjusted=freeGroup?m2SmoothFreeGroupTranslation(drag.groupMembers,targetDx,targetDy):m2SmoothGroupTranslation(drag.groupMembers,targetDx,targetDy);',
    'adjusted=freeGroup?m2SmoothFreeGroupTranslation(drag.groupMembers,targetDx,targetDy):workerPosition||m2SmoothGroupTranslation(drag.groupMembers,targetDx,targetDy);');
  replace('m2ApplyLiveRackDrag(svg,drag,clientX,clientY);\n      }\n      function m2ClearMultiSelection',
    'm2CloseGroupPlacement(drag);drag.groupWorkerFlush=true;\n        try{m2ApplyLiveRackDrag(svg,drag,clientX,clientY);}finally{drag.groupWorkerFlush=false;}\n      }\n      function m2ClearMultiSelection');
  return html;
}

export function groupPlacementWorkerSource(){
  return createGroupSolver.toString()+'\n'+wallCuts559.toString()+`
let solver;
self.onmessage=({data})=>{
 if(data.geometry){solver=createGroupSolver(data.geometry,wallCuts559);return;}
 if(solver)self.postMessage(solver.solve(data.startDx,data.startDy,data.targetDx,data.targetDy));
};
`;
}

export function reduceFreeLayoutWork(html){
  const replace=(before,after)=>{
    if(!html.includes(before))throw Error('Free layout work anchor missing: '+before);
    html=html.replace(before,()=>after);
  };
  replace('window.rafexPinRulerV221?.();window.rafexDimensionLayoutV499?.(node);',
    'window.rafexPinRulerV221?.();scheduleCameraDimensions(node);');
  replace('  function expectedViewBox(){',
    `  let cameraDimensionTimer=0,cameraDimensionScale=null,cameraDimensionSvg=null;
  function scheduleCameraDimensions(node){
    const scale=view.w+':'+view.h;
    clearTimeout(cameraDimensionTimer);
    if(node===cameraDimensionSvg&&scale===cameraDimensionScale)return;
    cameraDimensionTimer=setTimeout(()=>{
      if(node!==svg()||!node.isConnected)return;
      cameraDimensionSvg=node;cameraDimensionScale=scale;
      window.rafexDimensionLayoutV499?.(node);
    },140);
  }
  function expectedViewBox(){`);
  replace('      function m2RenderSelectedRackInfo() {',
    `      let m2LayoutTotals=null;
      function m2ReadLayoutTotals(){
        const racks=m2LayoutState.racks;
        if(m2LayoutTotals?.racks===racks&&m2LayoutTotals.count===racks.length)return m2LayoutTotals;
        const byId=new Map(racks.map(rack=>[rack.id,rack]));
        let pallets=0,feet=0;
        for(const rack of racks){
          pallets+=rafexPalletCapacity(rack);
          if(rack.b2bLayout)feet+=2*(Number(rack.b2bLayout.rowCount)||1)-sharedRows(rack,byId);
        }
        return m2LayoutTotals={racks,count:racks.length,pallets,feet};
      }
      function m2RenderSelectedRackInfo() {`);
  replace('const parent=racks.find(r=>r.id===rack.sharedFootWith);if(!parent)return false;',
    'const parent=racks instanceof Map?racks.get(rack.sharedFootWith):racks.find(r=>r.id===rack.sharedFootWith);if(!parent)return false;');
  replace('const layoutTotalPallets = m2LayoutState.racks.reduce((total, item) => total + rafexPalletCapacity(item), 0);',
    'const {pallets:layoutTotalPallets,feet:layoutB2BFootCount}=m2ReadLayoutTotals();');
  replace('        const layoutB2BFootCount = m2LayoutState.racks.reduce((total,item) => total + (item.b2bLayout ? 2 * (Number(item.b2bLayout.rowCount) || 1) - (sharedRows(item,m2LayoutState.racks)) : 0),0);','');
  replace('if(!m2LayoutState.drag&&!window.rafexViewportV248?.viewportOnly)m2SyncEditingIndex();',
    'if(!m2LayoutState.drag&&!window.rafexViewportV248?.viewportOnly&&!m2LargeSelectionRender){m2LayoutTotals=null;m2SyncEditingIndex();}');
  replace('for(const member of members)m2UpdateIndexedRack(member);',
    'for(const member of members)if(m2UpdateIndexedRack(member))m2LayoutTotals=null;');
  replace('      function m2NearestColumnGap(rack) {\n        const table=',
    '      function m2NearestColumnGap(rack) {\n        if(!m2LayoutSymbols.some(symbol=>symbol.type==="column"))return null;\n        const table=');
  replace('function m2RackOverlapsBlockingSymbol(rack,x=rack.x,y=rack.y,angle=rack.angle){const a=m2RackBounds(rack,x,y,angle);',
    'function m2RackOverlapsBlockingSymbol(rack,x=rack.x,y=rack.y,angle=rack.angle){if(!m2LayoutSymbols.length)return false;const symbols=m2PerfBlockingSymbols();if(!symbols.length)return false;const a=m2RackBounds(rack,x,y,angle);');
  replace('};const symbols=m2PerfBlockingSymbols();return m2ColumnExtensionContextV504?',
    '};return m2ColumnExtensionContextV504?');
  replace('function m2MekikColumnGroupTargetV512(origins,targetDx,targetDy){\n let fraction=',
    'function m2MekikColumnGroupTargetV512(origins,targetDx,targetDy){\n if(!m2PerfColumnObstacles().length)return{dx:targetDx,dy:targetDy};\n let fraction=');
  replace('function m2MekikColumnTargetV512(rack,targetX,targetY){\n if(!m2IsMekikV512(rack))',
    `function m2PerfColumnObstacles(){
 const drag=m2LayoutState.drag;
 if(drag?.perfColumns)return drag.perfColumns;
 const columns=m2LayoutSymbols.length?m2PerfBlockingSymbols().filter(symbol=>symbol.type==='column'):[];
 if(drag)drag.perfColumns=columns;
 return columns;
}
function m2MekikColumnTargetV512(rack,targetX,targetY){
 if(!m2IsMekikV512(rack))`);
  replace('const dx=targetX-rack.x,dy=targetY-rack.y,a=m2RackBounds(rack);let fraction=1;\n for(const symbol of m2PerfBlockingSymbols()){if(symbol.type!==\'column\')continue;',
    'const columns=m2PerfColumnObstacles();if(!columns.length)return{x:targetX,y:targetY};\n const dx=targetX-rack.x,dy=targetY-rack.y,a=m2RackBounds(rack);let fraction=1;\n for(const symbol of columns){');
  return html;
}

export function retainSelectionPreview(html){
  const replace=(before,after)=>{
    if(!html.includes(before))throw Error('Selection preview anchor missing: '+before);
    html=html.replace(before,()=>after);
  };
  replace('      function m2QueueLayoutRender() {',
    `      let m2SelectionPreview, m2SelectionPreviewFrame=0;
      function m2PaintSelectionPreview(){
        const svg=$("m2LayoutSvg"),start=m2MultiSelect.start,end=m2MultiSelect.hover;
        if(!svg||!m2MultiSelect.active||!start||!end){m2SelectionPreview?.remove();return false;}
        if(m2SelectionPreview?.parentNode!==svg){
          m2SelectionPreview?.remove();
          const ns="http://www.w3.org/2000/svg";
          m2SelectionPreview=document.createElementNS(ns,"g");
          m2SelectionPreview.setAttribute("pointer-events","none");
          m2SelectionPreview.setAttribute("aria-hidden","true");
          const rect=document.createElementNS(ns,"rect"),label=document.createElementNS(ns,"text");
          rect.setAttribute("class","m2-multi-selection-area");
          label.setAttribute("class","m2-multi-selection-label");
          label.setAttribute("text-anchor","middle");
          label.textContent="TOPLU SEÇİM";
          m2SelectionPreview.append(rect,label);svg.append(m2SelectionPreview);
        }
        const [rect,label]=m2SelectionPreview.children;
        const x=Math.min(start.x,end.x),y=Math.min(start.y,end.y),width=Math.abs(start.x-end.x),height=Math.abs(start.y-end.y);
        for(const [key,value] of Object.entries({x,y,width,height}))rect.setAttribute(key,value);
        label.setAttribute("x",x+width/2);label.setAttribute("y",y+height/2);
        return true;
      }
      function m2QueueSelectionPreview(){
        if(!m2SelectionPreviewFrame)m2SelectionPreviewFrame=requestAnimationFrame(()=>{
          m2SelectionPreviewFrame=0;m2PaintSelectionPreview();
        });
      }
      function m2QueueLayoutRender() {
        if(m2MultiSelect.active&&m2MultiSelect.start){m2QueueSelectionPreview();return;}`);
  replace('m2MultiSelect.start=point;m2MultiSelect.hover=point;svg.setPointerCapture?.(event.pointerId);m2RenderLayout();return;',
    'm2MultiSelect.start=point;m2MultiSelect.hover=point;svg.setPointerCapture?.(event.pointerId);m2QueueSelectionPreview();return;');
  replace('"Toplu seçim kapatıldı.";m2RenderLayout();','"Toplu seçim kapatıldı.";m2RenderSelectionOnly();');
  replace('function m2RenderSelectionOnly(){\n        const layer=', 'function m2RenderSelectionOnly(){\n        m2PaintSelectionPreview();\n        const layer=');
  replace('function m2ClearMultiSelection(keepMode=false){m2MultiSelect.rackIds.clear();',
    'function m2ClearMultiSelection(keepMode=false){m2SelectionPreview?.remove();m2MultiSelect.rackIds.clear();');
  const start=html.indexOf('        if(m2MultiSelect.active&&m2MultiSelect.start&&m2MultiSelect.hover){const x=');
  const end=html.indexOf('\n',start);
  if(start<0||end<0)throw Error('Missing legacy selection preview');
  html=html.slice(0,start)+html.slice(end+1);
  replace('if(m2MultiSelect.active&&m2MultiSelect.start){m2CommitMultiSelection();return;}',
    'if(m2MultiSelect.active&&m2MultiSelect.start){m2MultiSelect.hover=m2SvgPoint(event);try{m2CommitMultiSelection();}finally{m2QueueSelectionPreview();}return;}');
  replace('const layer = $("m2LayoutContent"); if (!layer) return;\n        m2NormalizeSeismicBraces();',
    'const layer = $("m2LayoutContent"); if (!layer) return;\n        m2PaintSelectionPreview();\n        m2NormalizeSeismicBraces();');
  replace('window.rafexFitNameplatesV136=groups=>(groups||svg()?.querySelectorAll("[data-rack]"))?.forEach(compactNameplateV136);',
    `const resizeQueue=new Set();
    let resizeFrame=0;
    function resizeNameplates(){
      resizeFrame=0;
      const deadline=performance.now()+5;
      for(const group of resizeQueue){
        resizeQueue.delete(group);
        if(group.isConnected)compactNameplateV136(group);
        if(performance.now()>=deadline)break;
      }
      if(resizeQueue.size)resizeFrame=requestAnimationFrame(resizeNameplates);
    }
    window.rafexFitNameplatesV136=groups=>{
      for(const group of groups||svg()?.querySelectorAll("[data-rack]")||[])resizeQueue.add(group);
      if(resizeQueue.size&&!resizeFrame)resizeFrame=requestAnimationFrame(resizeNameplates);
    };`);
  return html;
}

export function retainLayoutEdits(html) {
  if (html.includes('function m2SyncEditingIndex()')) return html;
  const replace=(before,after)=>{
    if(!html.includes(before))throw Error('Retained layout anchor missing: '+before);
    html=html.replace(before,()=>after);
  };
  const start=html.indexOf('      function m2PerfBuildSpatialTable(){');
  const end=html.indexOf('      function m2PerfCollisionCandidates(',start);
  if(start<0||end<0)throw Error('Missing spatial index');
  html=html.slice(0,start)+`      const m2EditingIndex={records:new Map(),revision:0,rows:new Map(),columns:new Map(),racks:null,symbolRevision:''};
      function m2EditBuckets(map,from,to,id,add){
        for(let bucket=Math.floor(from/25);bucket<=Math.floor(to/25);bucket++){
          let ids=map.get(bucket);
          if(add){if(!ids)map.set(bucket,ids=new Set());ids.add(id);}
          else if(ids?.delete(id)&&!ids.size)map.delete(bucket);
        }
      }
      function m2IndexRack(rack,add){
        const table=m2PerfSpatialTable,id=rack.id;
        const bounds=add?m2RackBounds(rack):m2EditingIndex.records.get(id).bounds;
        const gap=add?m2GapBoundsV346(rack):m2EditingIndex.records.get(id).gap;
        const angle=(Number(rack.angle)||0)*Math.PI/180;
        const halfW=(Math.abs(Math.cos(angle))*rack.w+Math.abs(Math.sin(angle))*rack.h)/2;
        const halfH=(Math.abs(Math.sin(angle))*rack.w+Math.abs(Math.cos(angle))*rack.h)/2;
        const hit=add?{left:Math.min(bounds.left,bounds.cx-halfW),right:Math.max(bounds.right,bounds.cx+halfW),
          top:Math.min(bounds.top,bounds.cy-halfH),bottom:Math.max(bounds.bottom,bounds.cy+halfH)}:m2EditingIndex.records.get(id).hit;
        const cell=table.cellSize;
        for(let x=Math.floor(hit.left/cell);x<=Math.floor(hit.right/cell);x++)
          for(let y=Math.floor(hit.top/cell);y<=Math.floor(hit.bottom/cell);y++){
            const key=x+':'+y;
            let ids=table.grid.get(key);
            if(add){if(!ids)table.grid.set(key,ids=new Set());ids.add(id);}
            else if(ids?.delete(id)&&!ids.size)table.grid.delete(key);
          }
        m2EditBuckets(m2EditingIndex.rows,Math.min(gap.top,bounds.top),Math.max(gap.bottom,bounds.bottom),id,add);
        m2EditBuckets(m2EditingIndex.columns,Math.min(gap.left,bounds.left),Math.max(gap.right,bounds.right),id,add);
        if(add){
          table.rackById.set(id,rack);
          m2EditingIndex.records.set(id,{rack,bounds,gap,hit,key:m2EditingRackKey(rack)});
        }else{
          table.rackById.delete(id);
          m2EditingIndex.records.delete(id);
        }
      }
      function m2EditingRackKey(rack){
        const layout=rack.b2bLayout;
        return [m2PerfRackGeometryKey(rack),rack.staged,rack.joinGroup,m2LayoutState.rackGapBasis,
          rack.railLength,layout?.rowCount,layout?.palletOverhang,layout?.frameDepth,layout?.palletDepth,layout?.rowGap].join('|');
      }
      function m2UpdateIndexedRack(rack){
        const previous=m2EditingIndex.records.get(rack.id);
        if(previous?.rack===rack&&previous.key===m2EditingRackKey(rack))return false;
        if(previous)m2IndexRack(previous.rack,false);
        m2IndexRack(rack,true);
        m2EditingIndex.records.get(rack.id).order=previous?.order;
        m2EditingIndex.revision++;
        return true;
      }
      function m2SyncEditingIndex(){
        const racks=m2LayoutState.racks,live=new Set();
        m2EditingIndex.racks=racks;
        racks.forEach((rack,order)=>{live.add(rack.id);m2UpdateIndexedRack(rack);m2EditingIndex.records.get(rack.id).order=order;});
        for(const [id,record] of m2EditingIndex.records)if(!live.has(id)){m2IndexRack(record.rack,false);m2EditingIndex.revision++;}
        const symbolRevision=JSON.stringify(m2LayoutSymbols.map(s=>[s.id,s.type,s.x,s.y,s.w,s.h,s.angle,s.blocking]));
        if(symbolRevision!==m2EditingIndex.symbolRevision){
          m2EditingIndex.symbolRevision=symbolRevision;
          m2EditingIndex.revision++;
        }
      }
      function m2PerfBuildSpatialTable(){
        const scope=m2LayoutState.drag||m2CopyCollisionScope;
        if(!scope)return null;
        if(m2PerfSpatialTable.drag!==scope){
          const racks=m2LayoutState.racks;
          if(m2EditingIndex.racks!==racks||m2EditingIndex.records.size!==racks.length)m2SyncEditingIndex();
          m2PerfSpatialTable.drag=scope;
        }
        return m2PerfSpatialTable;
      }
      function m2IndexedGapCandidates(bounds,racks){
        const ids=new Set();
        for(let y=Math.floor(bounds.top/25);y<=Math.floor(bounds.bottom/25);y++)for(const id of m2EditingIndex.rows.get(y)||[])ids.add(id);
        for(let x=Math.floor(bounds.left/25);x<=Math.floor(bounds.right/25);x++)for(const id of m2EditingIndex.columns.get(x)||[])ids.add(id);
        if(m2EditingIndex.records.size!==racks.length)return racks;
        return Array.from(ids,id=>m2EditingIndex.records.get(id)).sort((a,b)=>a.order-b.order).map(entry=>entry.rack);
      }
`+html.slice(end);
  replace('const visibleV248=window.rafexViewportV248?.prepare();',
    'if(!m2LayoutState.drag&&!window.rafexViewportV248?.viewportOnly)m2SyncEditingIndex();\n        const visibleV248=window.rafexViewportV248?.prepare();');
  replace("const p=m2SvgPoint(event),racks=m2LayoutState.racks;",
    `const p=m2SvgPoint(event),entries=m2EditingIndex.records,cell=m2PerfSpatialTable.cellSize;
    const ids=m2PerfSpatialTable.grid.get(Math.floor(p.x/cell)+':'+Math.floor(p.y/cell));
    const racks=entries.size===m2LayoutState.racks.length&&!m2LayoutState.drag
      ? Array.from(ids||[],id=>entries.get(id)).sort((a,b)=>a.order-b.order).map(entry=>entry.rack)
      : m2LayoutState.racks;`);
  replace('nearest=rackGapSearchV148(rack,a,table.racks,','nearest=rackGapSearchV148(rack,a,m2LayoutState.drag?table.racks:m2IndexedGapCandidates(a,table.racks),');
  replace('return rackGapSearchV148(owner,m2CombinedGapBoundsV346(owner),table.racks,',
    'const bounds=m2CombinedGapBoundsV346(owner);return rackGapSearchV148(owner,bounds,m2LayoutState.drag?table.racks:m2IndexedGapCandidates(bounds,table.racks),');
  replace('function m2RenderSelectionOnly(){\n        const previous=',
    `let m2SelectionDetailsFrame=0;
      function m2RenderSelectionOnly(){
        const layer=$("m2LayoutContent"),id=m2LayoutState.selected;
        if(layer?.isConnected&&(!id||m2PerfRackDomTable.get(Number(id))?.node?.isConnected)&&!m2LayoutState.drag&&!Object.keys(m2PinnedDimensionsByRack||{}).length){
          m2PaintSelectionV148(id);
          const selected=new Set([...m2MultiSelect.symbolIds].map(String));
          if(m2SelectedSymbolId!=null)selected.add(String(m2SelectedSymbolId));
          layer.querySelectorAll('.m2-layout-symbol.selected').forEach(node=>node.classList.toggle('selected',selected.has(node.dataset.layoutSymbol)));
          for(const symbol of selected)m2PerfSymbolDomTable.get(symbol)?.node?.classList.add('selected');
          cancelAnimationFrame(m2SelectionDetailsFrame);
          m2SelectionDetailsFrame=requestAnimationFrame(()=>setTimeout(()=>{
            if(id!==m2LayoutState.selected||m2LayoutState.drag||layer!==$("m2LayoutContent"))return;
            const rack=m2SelectedRack();
            layer.querySelectorAll('.m2-wall-guide[data-wall-rack],.m2-distance-guide[data-rack-gap]').forEach(node=>node.remove());
            layer.querySelectorAll('[data-dimension-key^="column-gap:"]').forEach(node=>node.closest('.m2-distance-guide')?.remove());
            if(rack){
              const overlay=m2PerfEnsureDragOverlay(layer,id);
              overlay.innerHTML=m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2RackDistanceGuide(rack)+m2ColumnDistanceGuide(rack);
              window.rafexDimensionLayoutV499?.(overlay);
            }
            m2PerfRefreshStaticSelectionUi(id);
          },0));
          return;
        }
        const previous=`);
  replace('if(Number(group?.dataset.rack)!==Number(rackId))paint(group,false)});paint(layer.querySelector(\'[data-rack="\'+rackId+\'"]\'),true);',
    'if(!selected.has(Number(group?.dataset.rack)))paint(group,false)});for(const id of selected)paint(m2PerfRackDomTable.get(id)?.node,true);');
  replace('if(layer){const changedV148=new Set();',
    'if(layer){const selected=new Set([...m2MultiSelect.rackIds].map(Number));if(rackId!=null)selected.add(Number(rackId));const changedV148=new Set();');
  replace('const pendingV148=!selectionGroup&&!rack.freePlacement',
    'const pendingV148=!rack.freePlacement');
  replace("||m2LayoutSymbols.some(s=>!['uaks','uakz','column'].includes(s.type)))return false;",
    `||Object.keys(m2PinnedDimensionsByRack||{}).length)return false;
        const barrierDependsOnMovement=m2LayoutSymbols.some(symbol=>{
          if(symbol.type!=='barrier')return false;
          const {cx,cy}=m2SymbolBounds(symbol);
          return members.some((member,i)=>{
            const old=origins[i];
            const includes=box=>cx>=box.left&&cx<=box.right&&cy>=box.top&&cy<=box.bottom;
            return includes(m2RackBounds(member))||includes(m2RackBounds(member,old.x??drag.originX,old.y??drag.originY));
          });
        });
        if(barrierDependsOnMovement)return false;`);
  replace('(drag.perfSharedFootEntries||[]).forEach(rebase);',
    `(drag.perfSharedFootEntries||[]).forEach(rebase);
        for(const member of members)m2UpdateIndexedRack(member);`);
  replace('function m2PerfDistancePrepareBaseV104(){\n        const table=m2PerfDistanceIndex;if(table.activeComputes>0)return table;const signature=m2PerfDistanceSignature();',
    'function m2PerfDistancePrepareBaseV104(){\n        const table=m2PerfDistanceIndex;if(table.activeComputes>0)return table;const signature=m2LayoutState.drag?m2PerfDistanceSignature():JSON.stringify([m2EditingIndex.revision,m2LayoutState.points,m2LayoutState.pathBreaks,m2LayoutState.closed,m2LayoutState.openFinished,m2LayoutState.cadElements,m2LayoutState.scale,m2LayoutState.rackGapBasis]);');
  replace('function refreshV428(){\n  refreshFrameV428=0;syncV428();m2RenderLayoutProductList();draw();',
    'let refreshedRevision=m2EditingIndex.revision;\n function refreshV428(){\n  refreshFrameV428=0;const revision=m2EditingIndex.revision;if(revision===refreshedRevision)return;refreshedRevision=revision;syncV428();m2RenderLayoutProductList();draw();');
  replace('refs=m2LayoutState.racks.filter(r=>!ids.has(Number(r.id))&&!r.staged).flatMap(r=>rackEnds556(r));return drag.endpointsV556={origins,anchors,index:{x:index(refs,\'x\'),y:index(refs,\'y\')},x:null,y:null,version};',
    `refs=()=>Array.from(m2EditingIndex.records.values(),entry=>entry.rack).filter(r=>!r.staged).flatMap(r=>rackEnds556(r));
    m2PerfBuildSpatialTable();
    if(endpointIndexRevision!==m2EditingIndex.revision){
      const points=refs();endpointIndex={x:index(points,'x'),y:index(points,'y')};endpointIndexRevision=m2EditingIndex.revision;
    }
    return drag.endpointsV556={origins,anchors,index:endpointIndex,ids,x:null,y:null,version};`);
  replace(' function context(drag,rack){if(drag.endpointsV556)',
    ' let endpointIndexRevision=-1,endpointIndex=null;\n function context(drag,rack){if(drag.endpointsV556)');
  replace("nearestEnds556(ctx.index.x,ctx.anchors,raw,'x',scale,ctx.x,nearest),y=nearestEnds556(ctx.index.y,ctx.anchors,raw,'y',scale,ctx.y,nearest)",
    "nearestEnds556(ctx.index.x,ctx.anchors,raw,'x',scale,ctx.x,(g,p,a,s)=>nearest(g,p,a,s,null,ctx.ids)),y=nearestEnds556(ctx.index.y,ctx.anchors,raw,'y',scale,ctx.y,(g,p,a,s)=>nearest(g,p,a,s,null,ctx.ids))");
  replace('function nearest(groups,p,axis,scale,old){const cross=',
    'function nearest(groups,p,axis,scale,old,excluded){const cross=');
  replace('for(const ref of g.items){const apart=Math.abs(ref[cross]-p[cross])*scale;',
    'for(const ref of g.items){if(excluded?.has(Number(ref.rackId)))continue;const apart=Math.abs(ref[cross]-p[cross])*scale;');
  replace('i=Math.max(0,lo-8);i<Math.min(groups.length,lo+8);i++',
    'i=lo>0?lowerEndpoint(groups,p[axis]-ENTER/scale):0;i<groups.length&&groups[i].value<=p[axis]+ENTER/scale;i++');
  replace(' function index(refs,axis){',
    ' function lowerEndpoint(groups,value){let lo=0,hi=groups.length;while(lo<hi){const mid=(lo+hi)>>>1;if(groups[mid].value<value)lo=mid+1;else hi=mid;}return lo;}\n function index(refs,axis){');
  replace('  function duplicateSelectedGroup(){\n    var ids=selectionIds();',
    '  let copySearchRunning=false;\n  function duplicateSelectedGroup(){\n    if(copySearchRunning)return true;\n    var ids=selectionIds();');
  const searchStart=html.indexOf('    if(!offset){const points=m2LayoutState.points');
  const searchEnd=html.indexOf('    copies.forEach(function(copy,index){copy.x=',searchStart);
  if(searchStart<0||searchEnd<0)throw Error('Missing copy placement search');
  html=html.slice(0,searchStart)+`    if(!offset){
      const state=m2LayoutState,points=state.points,xs=points.map(p=>p.x),ys=points.map(p=>p.y);
      const left=xs.length?Math.min(...xs):0,right=(xs.length?Math.max(...xs):1000)-bounds.width;
      const bottom=(ys.length?Math.max(...ys):650)-bounds.height;
      let x=left,y=ys.length?Math.min(...ys):0;
      const selection=ids.join(','),undo=m2UndoHistory.at(-1),revision=m2EditingIndex.revision;
      const status=$("m2FloorStatus"),scope=m2CopyCollisionScope;
      copySearchRunning=true;
      status.textContent="Kopya için boş yer aranıyor…";
      function search(){
        if(m2LayoutState!==state||state.drag||m2UndoHistory.at(-1)!==undo||selectionIds().join(',')!==selection||m2EditingIndex.revision!==revision){
          copySearchRunning=false;
          if(status.textContent==="Kopya için boş yer aranıyor…")status.textContent="Yerleşim değiştiği için kopyalama durduruldu.";
          return;
        }
        const deadline=performance.now()+6;
        m2CopyCollisionScope=scope;
        try{
          while(y<=bottom&&left<=right&&!offset&&performance.now()<deadline){
            const dx=x-bounds.left,dy=y-bounds.top;
            if(valid(dx,dy))offset={dx,dy};
            x+=10;if(x>right){x=left;y+=10;}
          }
        }finally{m2CopyCollisionScope=null;}
        if(!offset&&y<=bottom&&left<=right){setTimeout(search,0);return;}
        copySearchRunning=false;
        if(offset)commit();
        else status.textContent="Seçili blokların toplu kopyası için çakışmasız boş alan bulunamadı.";
      }
      setTimeout(search,0);return true;
    }
    commit();return true;
    function commit(){
`+html.slice(searchEnd);
  replace('m2PushUndo("Toplu blok çoğaltma");m2LayoutState.racks.push.apply(m2LayoutState.racks,copies);',
    'm2UndoHistory.push({label:"Toplu blok çoğaltma",copyIds:new Set(copies.map(r=>r.id)),copySymbolIds:symbolIds});if(m2UndoHistory.length>30)m2UndoHistory.shift();m2UpdateUndoButton();m2LayoutState.racks.push.apply(m2LayoutState.racks,copies);');
  replace('blok, konumları korunarak topluca çoğaltıldı.";m2RenderLayout();return true;\n  }',
    'blok, konumları korunarak topluca çoğaltıldı.";m2RenderLayout();\n    }\n  }');
  replace('        if(snapshot.fastDrag){',`        if(snapshot.copyIds){
          m2LayoutState.racks=m2LayoutState.racks.filter(r=>!snapshot.copyIds.has(r.id));
          m2LayoutSymbols=m2LayoutSymbols.filter(s=>!snapshot.copySymbolIds.has(s.id));
          m2ClearMultiSelection();m2ClearAllSelections(snapshot.label+" geri alındı.");m2UpdateUndoButton();return;
        }
        if(snapshot.fastDrag){`);
  return html;
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const source=process.argv[2]||'dist/index.html';
  const target=process.argv[3]||source;
  fs.writeFileSync(target,optimizeLargeLayout(fs.readFileSync(source,'utf8')));
  if(!process.argv[2]){
    fs.mkdirSync('dist/runtime-assets',{recursive:true});
    fs.writeFileSync('dist/runtime-assets/group-placement-worker-v1.js',groupPlacementWorkerSource());
  }
}
