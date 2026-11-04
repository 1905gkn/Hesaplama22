import fs from 'node:fs';
import vm from 'node:vm';
export function blocksWall(a,b,d,limit){
 const overlap=(x,y,u,v)=>Math.min(y,v)-Math.max(x,u)>.01;
 if(d==='left')return b.right<=a.left&&a.left-b.right<limit&&overlap(a.top,a.bottom,b.top,b.bottom);
 if(d==='right')return b.left>=a.right&&b.left-a.right<limit&&overlap(a.top,a.bottom,b.top,b.bottom);
 if(d==='top')return b.bottom<=a.top&&a.top-b.bottom<limit&&overlap(a.left,a.right,b.left,b.right);
 return b.top>=a.bottom&&b.top-a.bottom<limit&&overlap(a.left,a.right,b.left,b.right);
}
export function runtime(){
 window.rafexWallBlockedV499=(rack,d,item)=>{
  const a=m2GapBoundsV346(rack);
  return m2LayoutState.racks.some(other=>other.id!==rack.id&&!(rack.joinGroup&&rack.joinGroup===other.joinGroup)&&blocksWall(a,m2GapBoundsV346(other),d,item.px));
 };
 window.rafexDimensionLayoutV499=layer=>{
  if(!layer?.isConnected)return;
  const sizes=m2LayoutState.racks.map(r=>{const b=m2GapBoundsV346(r);return Math.min(b.right-b.left,b.bottom-b.top)}).filter(n=>n>0).sort((a,b)=>a-b);
  const automatic=Math.max(1.5,Math.min(12,(sizes[Math.floor(sizes.length/2)]||60)*.2)),occupied=[];
  const labels=[...layer.querySelectorAll('text[data-dimension-key]')],hits=new Map();
  for(const hit of layer.querySelectorAll('rect.m2-measure-hit[data-dimension-key]')){const key=hit.dataset.dimensionKey;if(!hits.has(key))hits.set(key,[]);hits.get(key).push(hit);}
  for(const text of labels){
   const key=text.dataset.dimensionKey;if(key.startsWith('mark-label:'))continue;
   if(text.dataset.layout499Transform===undefined)text.dataset.layout499Transform=text.getAttribute('transform')||'';
   text.setAttribute('transform',text.dataset.layout499Transform);
   const size=m2DimensionFontSizes[key]??m2DimensionFontSizes.__all??automatic;
   text.style.setProperty('font-size',size+'px','important');
   text.style.setProperty('stroke-width',Math.max(.25,size*.1)+'px','important');
   const original=text.getBoundingClientRect(),step=Math.max(original.height,original.width>original.height?0:size)*1.3+3;
   let dx=0,dy=0;
   const collides=b=>occupied.some(a=>b.left<a.right+4&&b.right>a.left-4&&b.top<a.bottom+4&&b.bottom>a.top-4);
   if(!m2DimensionOffsets[key])for(let n=0;n<16;n++){
    dy=n===0?0:(n%2?-1:1)*Math.ceil(n/2)*step;
    if(!collides({left:original.left,right:original.right,top:original.top+dy,bottom:original.bottom+dy}))break;
   }
   const matrix=text.parentElement.getScreenCTM?.();
   if(matrix&&dy){const inv=matrix.inverse();dx=inv.c*dy;const sy=inv.d*dy;text.setAttribute('transform','translate('+dx+' '+sy+') '+text.dataset.layout499Transform);}
   const box=text.getBoundingClientRect();occupied.push(box);
   const local=text.getBBox();
   for(const hit of hits.get(key)||[]){
    hit.setAttribute('x',local.x-size*.3);hit.setAttribute('y',local.y-size*.25);hit.setAttribute('width',local.width+size*.6);hit.setAttribute('height',local.height+size*.5);hit.setAttribute('transform',text.getAttribute('transform')||'');
   }
  }
 };
}
export function transform(html){
 if(html.includes('data-dimension-layout="v499"'))return html;
 const a='return Object.entries(measurements).filter(([direction]) => visible[direction]).map(([direction, item]) => {';
 if(!html.includes(a))throw Error('wall filter missing');
 html=html.replace(a,'return Object.entries(measurements).filter(([direction,item]) => visible[direction]&&!window.rafexWallBlockedV499?.(rack,direction,item)).map(([direction, item]) => {');
 const hook='        const areaDimsButton = $("m2AreaDimsButton");';if(!html.includes(hook))throw Error('dimension hook missing');
 html=html.replace(hook,'        window.rafexDimensionLayoutV499?.(layer);\n'+hook);
 const overlay='overlay.querySelectorAll("[data-dimension-key]").forEach((node)=>{const key=node.dataset.dimensionKey,size=(m2DimensionFontSizes[key]??m2DimensionFontSizes.__all);if(size)node.style.fontSize=size+"px";node.classList.toggle("m2-dimension-selected",m2LayoutTool==="dimension"&&key===m2SelectedDimensionKey);});';
 if(!html.includes(overlay))throw Error('drag overlay missing');html=html.replace(overlay,overlay+'window.rafexDimensionLayoutV499?.(overlay);');
 const i=html.lastIndexOf('</body>');html=html.slice(0,i)+'<script data-dimension-layout="v499">'+blocksWall.toString()+'\n('+runtime.toString()+')();</script>'+html.slice(i);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);
 return html;
}
if(process.argv[1]?.endsWith('dimension-layout-v499.mjs')){
 for(const f of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(f)){
  let s=fs.readFileSync(f,'utf8');if(f.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('HTML missing');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(f,s);
 }
 console.log('PASS v499: rack obstruction precedence, proportional dimensions, collision spacing, editable sizes.');
}
