import fs from 'node:fs';
import vm from 'node:vm';

export function screenFontSize551(requested,scale=1){
 const pixels=Number.isFinite(Number(requested))?Math.max(1,Math.min(36,Number(requested))):12;
 return pixels/Math.max(.000001,scale);
}
export function rackContains551(r,p){
 const angle=(Number(r.angle)||0)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),dx=p.x-r.x-r.w/2,dy=p.y-r.y-r.h/2;
 return Math.abs(dx*c+dy*s)<=r.w/2&&Math.abs(-dx*s+dy*c)<=r.h/2;
}
export function runtime551(){
 const selector='text[data-dimension-key]:not([data-dimension-key^="mark-label:"]),text.m2-area-dimension,text.m2-free-measure-label,text.m2-between-text';
 const unitText=lang=>({tr:'Çizimdeki tüm ölçüler milimetre (mm) cinsindedir.',en:'All drawing dimensions are in millimetres (mm).',fr:'Toutes les cotes du dessin sont en millimètres (mm).'})[String(lang||'tr').slice(0,2)]||'Çizimdeki tüm ölçüler milimetre (mm) cinsindedir.';
 function strip(root){for(const label of root.querySelectorAll(selector)){const walker=document.createTreeWalker(label,4);let node;while(node=walker.nextNode()){const next=node.nodeValue.replace(/\s*\bmm\b/gi,'');if(next!==node.nodeValue)node.nodeValue=next;}}}
 function notice(){const svg=document.getElementById('m2LayoutSvg');if(!svg)return;let note=document.getElementById('rafexDimensionUnitsV551');if(!note){note=document.createElement('small');note.id='rafexDimensionUnitsV551';note.className='rafex-dimension-units-v551';(svg.closest('.m2-floor-canvas-wrap')||svg).after(note);}const text=unitText(document.documentElement.lang);if(note.textContent!==text)note.textContent=text;}
 window.rafexRackNodeAtV551=event=>{
  const root=event.target?.closest?.('#m2LayoutSvg');if(!root||m2LayoutTool==='dimension'||m2LayoutTool==='measure')return null;
  if(event.target.closest('[data-user-note],[data-layout-symbol]'))return null;
  const p=m2SvgPoint(event),racks=m2LayoutState.racks;
  for(let i=racks.length-1;i>=0;i--)if(rackContains551(racks[i],p))return root.querySelector('[data-rack="'+racks[i].id+'"]');
  return null;
 };
 window.rafexDimensionLayoutV499=layer=>{
  if(!layer?.isConnected)return;strip(layer);notice();
  const occupied=[],hits=new Map(),root=layer.closest('svg')||layer;
  for(const hit of layer.querySelectorAll('rect.m2-measure-hit[data-dimension-key]')){const key=hit.dataset.dimensionKey;if(!hits.has(key))hits.set(key,[]);hits.get(key).push(hit);}
  for(const text of layer.querySelectorAll(selector)){
   const key=text.dataset.dimensionKey||'',parent=text.parentElement,matrix=parent.getScreenCTM?.();if(!matrix)continue;
   const scale=Math.sqrt(Math.abs(matrix.a*matrix.d-matrix.b*matrix.c));if(!(scale>0))continue;
   if(text.dataset.layout499Transform===undefined)text.dataset.layout499Transform=text.getAttribute('transform')||'';
   text.setAttribute('transform',text.dataset.layout499Transform);
   const requested=m2DimensionFontSizes[key]??m2DimensionFontSizes.__all??12,size=screenFontSize551(requested,scale);text.dataset.screenFont551=String(requested);
   text.style.setProperty('font-size',size+'px','important');text.style.setProperty('stroke-width',(.65/scale)+'px','important');
   const original=text.getBoundingClientRect(),step=Math.max(12,Math.min(original.width,original.height))*1.2+4;
   const collides=b=>occupied.some(a=>b.left<a.right+3&&b.right>a.left-3&&b.top<a.bottom+3&&b.bottom>a.top-3);
   let dy=0;if(!m2DimensionOffsets[key])for(let n=0;n<12;n++){dy=n===0?0:(n%2?-1:1)*Math.ceil(n/2)*step;if(!collides({left:original.left,right:original.right,top:original.top+dy,bottom:original.bottom+dy}))break;}
   if(dy){const inv=matrix.inverse();text.setAttribute('transform','translate('+(inv.c*dy)+' '+(inv.d*dy)+') '+text.dataset.layout499Transform);}
   occupied.push(text.getBoundingClientRect());const box=text.getBBox();
   for(const hit of hits.get(key)||[]){hit.setAttribute('x',box.x-size*.2);hit.setAttribute('y',box.y-size*.2);hit.setAttribute('width',box.width+size*.4);hit.setAttribute('height',box.height+size*.4);hit.setAttribute('transform',text.getAttribute('transform')||'');}
  }
 };
 function output(svg){if(!svg)return svg;strip(svg);if(svg.hasAttribute('data-unit-base-viewbox-v551'))svg.setAttribute('viewBox',svg.getAttribute('data-unit-base-viewbox-v551'));svg.querySelectorAll('[data-dimension-unit-note-v551]').forEach(n=>n.remove());
  const v=svg.getAttribute('viewBox')?.trim().split(/[ ,]+/).map(Number);if(v?.length!==4||!v.every(Number.isFinite)||!(v[2]>0&&v[3]>0))return svg;
  svg.setAttribute('data-unit-base-viewbox-v551',v.join(' '));const size=Math.max(v[2]/1000,v[3]/750)*12;
  for(const text of svg.querySelectorAll(selector)){const key=text.dataset.dimensionKey||'',requested=m2DimensionFontSizes[key]??m2DimensionFontSizes.__all??12;text.style.setProperty('font-size',String(size*Math.max(1,Math.min(36,requested))/12)+'px','important');text.style.setProperty('stroke-width',String(size*.055)+'px','important');}
  const note=document.createElementNS('http://www.w3.org/2000/svg','text');note.setAttribute('data-dimension-unit-note-v551','');note.setAttribute('x',v[0]+v[2]/2);note.setAttribute('y',v[1]+v[3]+size*1.8);note.setAttribute('text-anchor','middle');note.setAttribute('font-family','Arial,sans-serif');note.setAttribute('font-size',size);note.setAttribute('fill','#36584b');note.textContent=unitText(document.getElementById('m2ReportLanguage')?.value||document.documentElement.lang);svg.append(note);svg.setAttribute('viewBox',[v[0],v[1],v[2],v[3]+size*3].join(' '));return svg;
 }
 const clone=rafexPdfLayoutCloneV140;rafexPdfLayoutCloneV140=function(){return output(clone.apply(this,arguments));};
 window.rafexDimensionPresentationV551={output,strip,unitText};notice();
}
export function transform(html){
 if(html.includes('data-dimension-presentation="v551"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v551 missing '+a.slice(0,100));html=html.replace(a,b);};
 replace('const label=labelAt(root,event.clientX,event.clientY);','if(window.rafexRackNodeAtV551?.(event))return;const label=labelAt(root,event.clientX,event.clientY);');
 replace("const pair=ids(group),source=line(group),matrix=source?.getScreenCTM();","if(window.rafexRackNodeAtV551?.(event))return;const pair=ids(group),source=line(group),matrix=source?.getScreenCTM();");
 const rack='event.target.closest?.("[data-rack]")';
 if(!html.includes(rack))throw Error('v551 rack pointer missing');html=html.split(rack).join('(window.rafexRackNodeAtV551?.(event)||'+rack+')');
 replace('const dimensionNode = event.target.closest?.("[data-dimension-key]"),','const dimensionNode = rackNode&&m2LayoutTool!=="dimension"?null:event.target.closest?.("[data-dimension-key]"),');
 replace('window.rafexPinRulerV221?.();','window.rafexPinRulerV221?.();window.rafexDimensionLayoutV499?.(node);');
 replace("if(size>0)set(node,'font-size',size+'px');","if(size>0&&!node.dataset.screenFont551)set(node,'font-size',size+'px');");
 replace("else if(node.dataset.rafexDimensionFontSize){delete node.dataset.rafexDimensionFontSize;node.style.removeProperty('font-size');}","else if(node.dataset.rafexDimensionFontSize){delete node.dataset.rafexDimensionFontSize;if(!node.dataset.screenFont551)node.style.removeProperty('font-size');}");
 replace("if(!Number(node.dataset.rafexDimensionFontSize))if(!node.dataset.rafexPdfGapV286)set(node,'font-size','12px');","if(!node.dataset.screenFont551&&!Number(node.dataset.rafexDimensionFontSize))if(!node.dataset.rafexPdfGapV286)set(node,'font-size','12px');");
 html=html.replaceAll('Math.round(parseFloat(getComputedStyle(dimensionNode).fontSize))','Number(dimensionNode.dataset.screenFont551)||Math.round(parseFloat(getComputedStyle(dimensionNode).fontSize))');
 const css='<style data-dimension-presentation="v551">#page #m2LayoutSvg:not(.m2-dimension-editing) :is(text[data-dimension-key],.m2-measure-hit,.rafex-gap-side-hit-v350){pointer-events:none!important}#page #m2LayoutSvg.m2-dimension-editing text[data-dimension-key]{pointer-events:bounding-box!important}.rafex-dimension-units-v551{display:block;margin:6px 0;color:#496354;font:12px/1.4 Arial,sans-serif;pointer-events:none}</style>';
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v551 body missing');
 html=html.slice(0,end)+css+'<script data-dimension-presentation="v551">'+screenFontSize551.toString()+'\n'+rackContains551.toString()+'\n('+runtime551.toString()+')();</script>'+html.slice(end);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);return html;
}
if(process.argv[1]?.endsWith('dimension-presentation-v551.mjs'))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('v551 HTML missing');source=source.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,source);console.log('PASS v551 dimension presentation: '+file);
}
