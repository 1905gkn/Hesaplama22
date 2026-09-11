import fs from 'node:fs';
import {rackGapSearchV148} from './rack-gap-search-v148.mjs';

export function transform(html){
  if(html.includes('/* static-selection-v148 */'))return html;
  const replace=(from,to)=>{if(!html.includes(from))throw Error('v148 missing anchor: '+from.slice(0,90));html=html.replace(from,to)};
  replace('            m2PushFastDragUndo(m2LayoutState.drag);\n            svg.setPointerCapture?.(event.pointerId); m2QueueLayoutRender();', `            const pendingV148=!selectionGroup&&!rack.freePlacement&&!rack.staged&&!(groupMembers||[]).some(origin=>{const member=m2LayoutState.racks.find(r=>r.id===origin.id);return member?.freePlacement||member?.staged});
            m2LayoutState.drag.pendingSelectionV148=pendingV148;
            m2LayoutState.drag.pointerStartV148={x:event.clientX,y:event.clientY};
            if(!pendingV148)m2PushFastDragUndo(m2LayoutState.drag);
            svg.setPointerCapture?.(event.pointerId);
            if(pendingV148)m2PaintSelectionV148(id);else m2QueueLayoutRender();`);
  replace('const drag=m2LayoutState.drag;if(!drag)return;drag.liveClientX=event.clientX;', `const drag=m2LayoutState.drag;if(!drag)return;
        if(drag.pendingSelectionV148){
          if(Math.hypot(event.clientX-drag.pointerStartV148.x,event.clientY-drag.pointerStartV148.y)<3)return;
          drag.pendingSelectionV148=false;m2PushFastDragUndo(drag);
        }
        drag.liveClientX=event.clientX;`);
  replace('        const stop = (event) => {\n          if(m2LayoutState.drag)m2FlushLiveRackDrag(svg,event);', `        const stop = (event) => {
          const pendingV148=m2LayoutState.drag;
          if(pendingV148?.pendingSelectionV148){
            if(m2LayoutRenderFrame!=null){cancelAnimationFrame(m2LayoutRenderFrame);m2LayoutRenderFrame=null;}
            m2LayoutState.drag=null;m2DimensionDrag=null;
            const rack=m2SelectedRack(),layer=$("m2LayoutContent");
            if(rack&&layer){
              layer.querySelectorAll('.m2-wall-guide[data-wall-rack],.m2-distance-guide[data-rack-gap]').forEach(n=>n.remove());
              layer.querySelectorAll('[data-dimension-key^="column-gap:"]').forEach(n=>n.closest('.m2-distance-guide')?.remove());
              const overlay=m2PerfEnsureDragOverlay(layer,rack.id);
              overlay.innerHTML=m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2RackDistanceGuide(rack)+m2ColumnDistanceGuide(rack);
            }
            m2PerfRefreshStaticSelectionUi(pendingV148.id);return;
          }
          if(m2LayoutState.drag)m2FlushLiveRackDrag(svg,event);`);
  // Reuse the exact selection styling, but do not rebuild inputs on pointerdown.
  const start=html.indexOf('      function m2PerfRefreshStaticSelectionUi(rackId){');
  const middle=html.indexOf('        const activeRack=m2SelectedRack();',start);
  if(start<0||middle<0)throw Error('v148 selection styling missing');
  const paint=html.slice(start,middle).replace('function m2PerfRefreshStaticSelectionUi(rackId){','function m2PaintSelectionV148(rackId){');
  html=html.slice(0,start)+'      /* static-selection-v148 */\n'+paint+'      }\n      function m2PerfRefreshStaticSelectionUi(rackId){\n        m2PaintSelectionV148(rackId);\n'+html.slice(middle);
  replace('if(layer){const paint=(group,selected)=>{const rect=', 'if(layer){const changedV148=new Set();const paint=(group,selected)=>{const rect=');
  replace('if(!rect)return;rect.classList.toggle("selected",selected);', 'if(!rect||rect.classList.contains("selected")===selected)return;changedV148.add(group);rect.classList.toggle("selected",selected);');
  replace('forEach((rect)=>paint(rect.closest("[data-rack]"),false));paint(', 'forEach((rect)=>{const group=rect.closest("[data-rack]");if(Number(group?.dataset.rack)!==Number(rackId))paint(group,false)});paint(');
  replace('window.rafexFitNameplatesV136?.();}', 'window.rafexFitNameplatesV136?.(Array.from(changedV148));}');
  replace('window.rafexFitNameplatesV136=()=>{svg()?.querySelectorAll("[data-rack]").forEach(compactNameplateV136)}', 'window.rafexFitNameplatesV136=(groups)=>{(groups||svg()?.querySelectorAll("[data-rack]"))?.forEach(compactNameplateV136)}');
  const nearestStart=html.indexOf('        try{table.racks.forEach((other)=>{',html.indexOf('      function m2NearestRackGap(rack)'));
  const nearestEnd=html.indexOf('}finally{table.activeComputes=',nearestStart);
  if(nearestStart<0||nearestEnd<0)throw Error('v148 nearest search missing');
  html=html.slice(0,nearestStart)+'        try{nearest=rackGapSearchV148(rack,a,table.racks,other=>table.bounds.get(Number(other.id))||m2RackBounds(other),m2ClearRackGapLine,m2RackClearanceMm,false)[0]||null;'+html.slice(nearestEnd);
  const relationStart=html.indexOf('  window.rafexRackGapRelationsV46=function(owner){');
  const relationEnd=html.indexOf('  window.rafexSetRackGapV49=',relationStart);
  if(relationStart<0||relationEnd<0)throw Error('v148 relations search missing');
  html=html.slice(0,relationStart)+`  window.rafexRackGapRelationsV46=function(owner){
    if(!owner)return[];const table=m2PerfDistancePrepare();table.activeComputes++;
    try{return rackGapSearchV148(owner,m2CombinedRackBounds(owner),table.racks,other=>table.bounds.get(Number(other.id))||m2RackBounds(other),m2ClearRackGapLine,m2RackClearanceMm,true)}
    finally{table.activeComputes=Math.max(0,table.activeComputes-1)}
  };\n`+html.slice(relationEnd);
  replace('      /* static-selection-v148 */',rackGapSearchV148.toString()+'\n      /* static-selection-v148 */');
  return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-static-selection-v148.mjs')){
  const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
  if(!match)throw Error('Missing compiled HTML');
  fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));
  console.log('v148: select established racks without running group movement or creating undo entries.');
}
