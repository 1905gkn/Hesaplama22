import fs from 'node:fs';
import {pathToFileURL} from 'node:url';

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
  return html;
}

if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
  const source=process.argv[2]||'dist/index.html';
  const target=process.argv[3]||source;
  fs.writeFileSync(target,optimizeLargeLayout(fs.readFileSync(source,'utf8')));
}
