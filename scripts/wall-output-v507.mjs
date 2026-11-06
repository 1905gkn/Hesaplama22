import fs from 'node:fs';import vm from 'node:vm';
// Subtract text-mask polygons from a wall segment, retaining vector lines.
export function wallSegmentsV507(a,b,polygons){
 const dx=b.x-a.x,dy=b.y-a.y,at=t=>({x:a.x+dx*t,y:a.y+dy*t});
 const inside=(p,poly)=>{let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const x=poly[i],y=poly[j];if((x.y>p.y)!==(y.y>p.y)&&p.x<(y.x-x.x)*(p.y-x.y)/(y.y-x.y)+x.x)yes=!yes}return yes};
 const marks=[0,1];for(const poly of polygons)for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],ex=q.x-p.x,ey=q.y-p.y,cross=dx*ey-dy*ex;if(Math.abs(cross)<1e-10)continue;const rx=p.x-a.x,ry=p.y-a.y,t=(rx*ey-ry*ex)/cross,u=(rx*dy-ry*dx)/cross;if(t>0&&t<1&&u>=0&&u<=1)marks.push(t)}
 marks.sort((x,y)=>x-y);const result=[];for(let i=1;i<marks.length;i++){const lo=marks[i-1],hi=marks[i];if(hi-lo>1e-9&&!polygons.some(p=>inside(at((lo+hi)/2),p)))result.push([at(lo),at(hi)])}return result;
}
export const runtime=`(()=>{
 const segments=${wallSegmentsV507.toString()};
 function clean(root){
  if(!root?.querySelectorAll)return root;
  root.querySelectorAll('.m2-floor-point,[data-resume-point],.m2-draft-edge-hit,.rafex-cad-edge-hit,[data-wall-alignment-v256],[data-draw-hover-v260]').forEach(n=>n.remove());
  const ns='http://www.w3.org/2000/svg',width=Math.max(.2,(root.viewBox?.baseVal?.width||1200)/1200);
  for(const node of root.querySelectorAll('.m2-floor-area,.m2-floor-walls,.m2-floor-draft,.rafex-cad-wall')){
   if(node.hasAttribute('data-wall-output-v507'))continue;
   const kind=node.tagName.toLowerCase(),nums=String(node.getAttribute('points')||'').trim().split(/[ ,]+/).map(Number),points=kind==='line'?[{x:Number(node.getAttribute('x1')),y:Number(node.getAttribute('y1'))},{x:Number(node.getAttribute('x2')),y:Number(node.getAttribute('y2'))}]:nums.length>=4?Array.from({length:nums.length/2},(_,i)=>({x:nums[2*i],y:nums[2*i+1]})):[];
   if(points.length<2||points.some(p=>!Number.isFinite(p.x+p.y)))continue;
   const id=/url\\(["']?#([^"')]+)["']?\\)/.exec(node.getAttribute('mask')||'')?.[1],mask=id?[...root.querySelectorAll('mask')].find(m=>m.id===id):null,use=mask?.querySelector('use'),ref=use?.getAttribute('href')?.slice(1),cutout=ref?[...root.querySelectorAll('[id]')].find(n=>n.id===ref):null,matrix=use?.transform?.baseVal?.consolidate()?.matrix;
   const polygons=[...(cutout?.querySelectorAll('polygon')||[])].map(p=>{const n=p.getAttribute('points').trim().split(/[ ,]+/).map(Number);return Array.from({length:n.length/2},(_,i)=>{const x=n[2*i],y=n[2*i+1];return matrix?{x:matrix.a*x+matrix.c*y+matrix.e,y:matrix.b*x+matrix.d*y+matrix.f}:{x,y}})});
   const g=document.createElementNS(ns,'g');g.setAttribute('data-wall-output-v507','lines');if(node.hasAttribute('transform'))g.setAttribute('transform',node.getAttribute('transform'));
   const count=kind==='polygon'?points.length:points.length-1;
   for(let i=0;i<count;i++)for(const [a,b]of segments(points[i],points[(i+1)%points.length],polygons)){const l=document.createElementNS(ns,'line');for(const [k,v]of Object.entries({x1:a.x,y1:a.y,x2:b.x,y2:b.y}))l.setAttribute(k,String(v));l.style.cssText='fill:none!important;stroke:#111!important;stroke-width:'+width+'!important;stroke-linecap:butt!important;vector-effect:none!important;visibility:visible!important;opacity:1!important';g.append(l)}
   node.removeAttribute('mask');node.style.setProperty('mask','none','important');node.style.setProperty('stroke','none','important');node.setAttribute('data-wall-output-v507','fill');node.after(g);
  }
  root.querySelectorAll('.m2-floor-area-inner,.m2-floor-walls-inner').forEach(n=>n.remove());
  return root;
 }
 const clone=rafexPdfLayoutCloneV140;rafexPdfLayoutCloneV140=function(){return clean(clone.apply(this,arguments))};
 window.rafexWallOutputV507={clean};
})();`;
export function transform(html){
 if(html.includes('data-wall-output="v507"'))return html;
 const before="copy.setAttribute('xmlns','http://www.w3.org/2000/svg');copy.removeAttribute('id');return copy;";
 if(!html.includes(before))throw Error('v507 vector PDF freeze missing');
 html=html.replace(before,"copy.setAttribute('xmlns','http://www.w3.org/2000/svg');copy.removeAttribute('id');return window.rafexWallOutputV507?.clean(copy)||copy;");
 const end=html.lastIndexOf('</body>');html=html.slice(0,end)+`<style data-wall-output="v507">#page :is(#m2LayoutSvg,.rafex-drag-scene-v248) :is(.m2-floor-area,.m2-floor-walls,.rafex-cad-wall){stroke-width:.8px!important;stroke-linecap:butt!important;vector-effect:non-scaling-stroke!important}.m2-floor-area-inner,.m2-floor-walls-inner{display:none!important;stroke:none!important}@media print{.m2-floor-point,[data-resume-point],.m2-draft-edge-hit,.rafex-cad-edge-hit{display:none!important}}</style><script>${runtime}</script>`+html.slice(end);
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g))if(!/src=|application\/json/.test(m[1]))new vm.Script(m[2]);return html;
}
if(/[\\/]wall-output-v507\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('v507 HTML missing');source=source.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,source);console.log('PASS v507: '+file);
}

