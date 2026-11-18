import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {transform} from './seismic-bounds-v589.mjs';
const file=process.argv[2]||'local-review/index.html',before=fs.readFileSync(file,'utf8'),html=transform(before);assert.equal(transform(html),html);
const start=html.indexOf('function m2SeismicBraceSvg(brace){'),end=html.indexOf('function m2NormalizeSeismicBraces()',start),footStart=html.indexOf('function m2RackFootPoints(rack){'),footEnd=html.indexOf('/* foot-protection-ownership-v337 */',footStart);
const ctx={m2LayoutState:{racks:[]},m2TypeColor:()=> '#00f',b2bTypeLetter:()=> 'A',esc:x=>x,m2RackLocalPoint:(r,x,y)=>{const a=r.angle*Math.PI/180;return{x:r.x+r.w/2+x*Math.cos(a)-y*Math.sin(a),y:r.y+r.h/2+x*Math.sin(a)+y*Math.cos(a)};}};vm.createContext(ctx);vm.runInContext(html.slice(footStart,footEnd)+html.slice(start,end),ctx);
let checks=0;
for(const angle of [0,90,180,270,35])for(const rows of [1,2])for(const w of [10,100,700])for(const type of ['light','heavy']){
 const rack={id:1,x:40,y:80,w,h:rows*120,widthMm:w*10,depthMm:rows*1200,angle,typeName:'A',b2bLayout:{rowCount:rows,frameDepth:1100,palletDepth:1200,palletOverhang:50,rowGap:100}};
 const a=angle*Math.PI/180,other={...rack,id:2,x:rack.x+w*Math.cos(a),y:rack.y+w*Math.sin(a)};ctx.m2LayoutState.racks=type==='heavy'?[rack,other]:[rack];
 const feet=ctx.m2LayoutState.racks.flatMap(ctx.m2RackFootPoints),project=p=>({u:p.x*Math.cos(a)+p.y*Math.sin(a),v:-p.x*Math.sin(a)+p.y*Math.cos(a)}),p=feet.map(project);
 const svg=ctx.m2SeismicBraceSvg({id:1,type,rackIds:ctx.m2LayoutState.racks.map(r=>r.id)}),lines=[...svg.matchAll(/<line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"/g)];assert.equal(lines.length,2);
 for(const line of lines)for(const [x,y] of [[+line[1],+line[2]],[+line[3],+line[4]]]){const q=project({x,y});for(const axis of ['u','v']){assert(q[axis]-.45>=Math.min(...p.map(p=>p[axis]))-1e-7);assert(q[axis]+.45<=Math.max(...p.map(p=>p[axis]))+1e-7);}}
 checks++;
}
console.log(`PASS ${checks} seismic layouts: X stroke remains within real frame marks for light/heavy braces, single/double rows, narrow/wide bays and five rotations.`);
