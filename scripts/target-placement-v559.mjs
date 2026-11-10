import fs from 'node:fs';
// Segment clipping against the open interior of an oriented rectangular rack.
// A wall may touch its boundary (zero clearance) but cannot pass through it.
export function wallCuts559(a,b,corners){
 const o=corners[0],u={x:corners[1].x-o.x,y:corners[1].y-o.y},v={x:corners[3].x-o.x,y:corners[3].y-o.y},uu=u.x*u.x+u.y*u.y,vv=v.x*v.x+v.y*v.y;
 if(!(uu>0&&vv>0))return true;
 let low=0,high=1;
 for(const [axis,length]of [[u,uu],[v,vv]]){
  const from=((a.x-o.x)*axis.x+(a.y-o.y)*axis.y)/length,to=((b.x-o.x)*axis.x+(b.y-o.y)*axis.y)/length,d=to-from,eps=1e-8;
  if(Math.abs(d)<1e-12){if(from<=eps||from>=1-eps)return false;continue;}
  const enter=(eps-from)/d,exit=(1-eps-from)/d;low=Math.max(low,Math.min(enter,exit));high=Math.min(high,Math.max(enter,exit));if(low>high)return false;
 }
 return low<=high;
}
export function transform(html){
 if(html.includes('data-target-placement="559"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('559 missing '+a.slice(0,120));html=html.replace(a,b);};
 const start=html.indexOf('function m2RackInsideArea('),end=html.indexOf('function m2',start+30),old=html.slice(start,end);
 if(start<0||!old.includes('return corners.every(m2PointInArea);'))throw Error('559 area validator missing');
 const next=old.replace(/if \(!m2LayoutState.closed\) \{[\s\S]*?return corners.every\(m2PointInArea\);/,`/* target-placement-v559: validate the destination against walls, not enclosure membership. */
        if(corners.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return false;
        return !(m2PerfWallGeometryTable().segments||[]).some(({a,b})=>window.rafexWallCuts559(a,b,corners));`);
 html=html.slice(0,start)+next+html.slice(end);
 replace('function m2SmoothDragPosition(rack, targetX, targetY) {','function m2SmoothDragPosition(rack, targetX, targetY) {\n        if(m2RackInsideArea(rack,targetX,targetY,rack.angle)&&!m2RackOverlaps(rack,targetX,targetY,rack.angle))return{x:targetX,y:targetY,exact:true};');
 replace('function m2SmoothGroupTranslation(origins, targetDx, targetDy) {','function m2SmoothGroupTranslation(origins, targetDx, targetDy) {\n        if(m2GroupTranslationValid(origins,targetDx,targetDy))return{dx:targetDx,dy:targetDy,exact:true};');
 const at=html.lastIndexOf('</body>'),script='<script data-target-placement="559">window.rafexWallCuts559='+wallCuts559.toString()+';</script>';
 return html.slice(0,at)+script+html.slice(at);
}
if(/[\\/]target-placement-v559\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('HTML missing');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);
}
