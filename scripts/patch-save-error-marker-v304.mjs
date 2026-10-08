import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* save-error-marker-v304 */'))return html;
 const rep=(a,b)=>{if(!html.includes(a))throw Error('Missing v304 anchor: '+a.slice(0,90));html=html.replace(a,b);};
 rep('const placementError = m2ProjectPlacementError(); if (placementError)', 'window.rafexSaveErrorMarkerV304?.begin(); const placementError = m2ProjectPlacementError(); window.rafexSaveErrorMarkerV304?.finish(!!placementError); if (placementError)');
 rep('if (invalid) return', 'if (invalid) window.rafexSaveErrorMarkerV304?.capture(invalid,"wall");\n        if (invalid) return');
 rep('if (symbolOverlap) return', 'if (symbolOverlap) window.rafexSaveErrorMarkerV304?.capture(symbolOverlap,"symbol");\n        if (symbolOverlap) return');
 rep('return overlap ? `${overlap.typeName', 'if (overlap) window.rafexSaveErrorMarkerV304?.capture(overlap,"rack");\n        return overlap ? `${overlap.typeName');
 rep("if(error)return area.name+': '+error;", "if(error){window.rafexSaveErrorMarkerV304?.area(area.id);return area.name+': '+error;}");
 rep('window.rafexAreaDocument=()=>', 'window.rafexSelectErrorAreaV304=select;window.rafexSaveErrorActiveAreaV304=()=>documentState?.activeAreaId;\n  window.rafexAreaDocument=()=>');
 rep("copy.querySelectorAll('[data-wall-alignment-v256],[data-draw-hover-v260]')", "copy.querySelectorAll('[data-wall-alignment-v256],[data-draw-hover-v260],[data-save-error-v304]')");
 rep("node.matches('.m2-metre-ruler,[data-wall-alignment-v256],[data-draw-hover-v260]')", "node.matches('.m2-metre-ruler,[data-wall-alignment-v256],[data-draw-hover-v260],[data-save-error-v304]')");
 const runtime=`<script>/* save-error-marker-v304 */
 (function(){
  const ns='http://www.w3.org/2000/svg';let collecting=false,pending=null,marker=null,observer=null,scheduled=false;
  const scope=()=>window.rafexProjectIdentityV133?.uuid||'unopened';
  function clear(){observer?.disconnect();observer=null;marker=null;pending=null;document.querySelectorAll('[data-save-error-v304]').forEach(n=>n.remove());document.getElementById('rafexClearSaveErrorV304')?.remove();}
  function begin(){clear();collecting=true;}
  function capture(rack,kind){
   if(!collecting)return;
   const a=m2RackBounds(rack),boxes=[];
   const peers=kind==='symbol'?m2LayoutSymbols.filter(s=>s.type==='column'||s.blocking):kind==='rack'?m2LayoutState.racks.filter(r=>r.id!==rack.id&&!(rack.joinGroup&&r.joinGroup===rack.joinGroup)):[];
   for(const peer of peers){const b=kind==='symbol'?m2SymbolBounds(peer):m2RackBounds(peer),left=Math.max(a.left,b.left),right=Math.min(a.right,b.right),top=Math.max(a.top,b.top),bottom=Math.min(a.bottom,b.bottom);if(right>left&&bottom>top)boxes.push({left,right,top,bottom});}
   pending={rackId:rack.id,scope:scope(),areaId:null,boxes:boxes.length?boxes:[a]};
  }
  function paint(){
   document.querySelectorAll('[data-save-error-v304]').forEach(n=>n.remove());
   if(!marker||marker.scope!==scope()||(marker.areaId&&marker.areaId!==window.rafexSaveErrorActiveAreaV304?.()))return;
   const roots=[document.querySelector('.rafex-drag-scene-v248 .rafex-scene-content-v248')||document.getElementById('m2LayoutSvg')].filter(Boolean);
   for(const svg of roots){
   const m=svg.getScreenCTM(),scale=Math.hypot(m?.a||1,m?.b||0)||1,pad=5/scale;
   const g=document.createElementNS(ns,'g');g.dataset.saveErrorV304='1';g.style.pointerEvents='none';
   const boxes=marker.boxes,left=Math.min(...boxes.map(b=>b.left)),right=Math.max(...boxes.map(b=>b.right)),top=Math.min(...boxes.map(b=>b.top)),bottom=Math.max(...boxes.map(b=>b.bottom)),side=Math.max(right-left,bottom-top,16/scale)+pad*2;
   const rect=document.createElementNS(ns,'rect');for(const [k,v] of Object.entries({x:(left+right-side)/2,y:(top+bottom-side)/2,width:side,height:side,fill:'none',stroke:'#e12a2a','stroke-width':3,'stroke-dasharray':'7 4','vector-effect':'non-scaling-stroke'}))rect.setAttribute(k,v);
   const title=document.createElementNS(ns,'title');title.textContent='Kaydı engelleyen çakışma';g.append(title,rect);svg.appendChild(g);
   }
  }
  function finish(failed){collecting=false;if(!failed||!pending){clear();return;}marker=pending;pending=null;
   if(marker.areaId)window.rafexSelectErrorAreaV304?.(marker.areaId);
   const input=document.getElementById('m2ProjectSaveMsg');const button=document.createElement('button');button.id='rafexClearSaveErrorV304';button.type='button';button.textContent='Hata işaretini kaldır';button.onclick=clear;(input||document.getElementById('m2FloorStatus'))?.after(button);
   paint();
   observer=new MutationObserver(records=>{if(!marker||scheduled||!records.some(r=>!r.target.closest?.('[data-save-error-v304]')&&[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&!n.matches?.('[data-save-error-v304]'))))return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;paint();});});
   const root=document.getElementById('m2LayoutSvg')?.closest('.m2-floor-canvas-wrap');if(root)observer.observe(root,{childList:true,subtree:true});
  }
  const render=m2RenderLayout;m2RenderLayout=function(){const result=render.apply(this,arguments);paint();return result;};
  const apply=m2ApplyProjectRecord;m2ApplyProjectRecord=function(){clear();return apply.apply(this,arguments);};window.m2ApplyProjectRecord=m2ApplyProjectRecord;
  window.rafexSaveErrorMarkerV304={begin,capture,area(id){if(pending)pending.areaId=id;},finish,clear,paint};
 })();</script>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body end');return html.slice(0,end)+runtime+'\n'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-save-error-marker-v304.mjs')){
 const file=process.argv[2]||'dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}