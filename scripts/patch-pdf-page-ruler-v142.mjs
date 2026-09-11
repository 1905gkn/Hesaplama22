import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* RAFEX_PDF_PAGE_RULER_V142 */'))return html;
 if(!html.includes('/* RAFEX_PDF_TIGHT_FIT_V141 */'))throw Error('v142 requires PDF tight fit');
 const runtime=`<script>
/* RAFEX_PDF_PAGE_RULER_V142 */
(()=>{
 const selector='svg[data-rafex-pdf-margin="v141"]',pages=new Set(),hosts=new WeakSet();let pending=0;
 // Only the exported ruler moves. The drawing viewBox and metric scale never change.
 function align(){
  pending=0;
  for(const id of ['m2CorporatePreview','m2ReportFloor','page']){const host=document.getElementById(id);if(host&&!hosts.has(host)){hosts.add(host);observer.observe(host,{childList:true});}}
  for(const svg of document.querySelectorAll(selector)){
   const page=svg.closest('.m2-corporate-page,.m2-a4-sheet');
   let overlay=page?.querySelector(':scope > [data-rafex-page-ruler]');
   const holder=svg.querySelector('[data-rafex-pdf-ruler]')||overlay?.querySelector('[data-rafex-pdf-ruler]'),ruler=holder?.querySelector('.m2-metre-ruler');
   if(!page||!ruler)continue;
   if(!pages.has(page)){pages.add(page);resize.observe(page);}
   const rect=page.getBoundingClientRect(),frame=svg.getBoundingClientRect();
   if(!rect.width||!rect.height||!frame.width||!frame.height)continue;
   // A page-level overlay avoids clipping by the summary drawing cell.
   if(!overlay){overlay=document.createElementNS('http://www.w3.org/2000/svg','svg');overlay.setAttribute('data-rafex-page-ruler','v142');overlay.style.cssText='position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;overflow:visible!important;pointer-events:none!important;z-index:20!important;';page.appendChild(overlay);}
   let viewport=overlay.querySelector('svg');if(!viewport){viewport=document.createElementNS('http://www.w3.org/2000/svg','svg');overlay.appendChild(viewport);}
   if(holder.parentElement!==viewport)viewport.replaceChildren(holder);
   const area=overlay.getBoundingClientRect(),box=ruler.getBBox(),view=svg.getAttribute('viewBox').split(/[ ,]+/).map(Number),w=frame.width/area.width*100,h=frame.height/area.height*100;
   // Same viewport proportions and viewBox size as the diagram: exactly the same
   // metric scale, including native print pagination. Percent anchors stay fixed.
   viewport.setAttribute('x','3%');viewport.setAttribute('y',(97-h)+'%');viewport.setAttribute('width',w+'%');viewport.setAttribute('height',h+'%');
   viewport.setAttribute('viewBox',[box.x,box.y+box.height-view[3],view[2],view[3]].join(' '));viewport.setAttribute('preserveAspectRatio','xMinYMax meet');viewport.style.overflow='visible';
   holder.removeAttribute('transform');
   holder.setAttribute('data-rafex-pdf-ruler','v142');
  }
  for(const page of pages)if(!page.isConnected){resize.unobserve(page);pages.delete(page);}
 }
 function schedule(){if(!pending)pending=requestAnimationFrame(align);}
 const resize=new ResizeObserver(schedule);
 const observer=new MutationObserver(schedule);
 function start(){
  // Observe output containers only, never thousands of live editor rack nodes.
  observer.observe(document.body,{childList:true,attributes:true,attributeFilter:['class']});
  window.addEventListener('resize',schedule);window.addEventListener('beforeprint',align);window.addEventListener('afterprint',schedule);
  schedule();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
</script>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v142 document body missing');
 return html.slice(0,end)+runtime+'\n'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-pdf-page-ruler-v142.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
 if(!m)throw Error('v142 HTML_BASE64 missing');
 const html=transform(Buffer.from(m[2],'base64').toString('utf8'));
 fs.writeFileSync(file,source.replace(m[0],m[0].replace(m[2],Buffer.from(html).toString('base64'))));
 console.log('v142: anchor exported metric ruler to page bottom-left without changing scale');
}
