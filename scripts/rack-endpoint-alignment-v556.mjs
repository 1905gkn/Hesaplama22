import fs from 'node:fs';
export function rackEnds556(r,x=r.x,y=r.y){
 const w=Number(r.w)||0,h=Number(r.h)||0,cx=x+w/2,cy=y+h/2,a=(Number(r.angle)||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
 return [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(([dx,dy],i)=>({x:cx+dx*c-dy*s,y:cy+dx*s+dy*c,rackId:r.id,end:i}));
}
export function groupEnds556(racks,origins,joined){
 const all=origins.flatMap(o=>{const r=racks.find(r=>Number(r.id)===Number(o.id));return r?rackEnds556(r,o.x,o.y):[];});
 if(!joined||origins.length<2||!all.length)return all;
 const r=racks.find(r=>Number(r.id)===Number(origins[0].id)),a=(Number(r.angle)||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a),project=all.map(p=>({p,u:p.x*c+p.y*s,v:-p.x*s+p.y*c}));
 const minU=Math.min(...project.map(p=>p.u)),maxU=Math.max(...project.map(p=>p.u)),minV=Math.min(...project.map(p=>p.v)),maxV=Math.max(...project.map(p=>p.v));
 return project.filter(p=>(Math.abs(p.u-minU)<.001||Math.abs(p.u-maxU)<.001)&&(Math.abs(p.v-minV)<.001||Math.abs(p.v-maxV)<.001)).map(p=>p.p);
}
export function nearestEnds556(groups,anchors,raw,axis,scale,old,nearest){
 const moved=a=>({x:a.x+raw.dx,y:a.y+raw.dy});
 if(old?.anchor){const p=moved(old.anchor),cross=axis==='x'?'y':'x';if(Math.abs(old.value-p[axis])*scale<=12&&Math.abs(old.ref[cross]-p[cross])*scale<=400)return {...old,delta:old.value-p[axis]};}
 let best=null,score=Infinity;
 for(const anchor of anchors){const p=moved(anchor),match=nearest(groups,p,axis,scale,null);if(!match)continue;const cross=axis==='x'?'y':'x',cost=Math.abs(match.delta)*scale+Math.abs(match.ref[cross]-p[cross])*scale/1000;if(cost<score){score=cost;best={...match,anchor};}}
 return best;
}
export function transform(html){
 if(html.includes('/* rack-endpoints-v556 */'))return html;
 const re=/<script data-rack-alignment="v249">([\s\S]*?)<\/script>/,match=html.match(re);if(!match)throw Error('v556 alignment runtime missing');let code=match[1];
 const replace=(pattern,replacement)=>{if(!pattern.test(code))throw Error('v556 alignment anchor missing: '+pattern);code=code.replace(pattern,()=>replacement);};
 replace(/ function context\(drag,rack\)\{[^\n]*\}/," function context(drag,rack){if(drag.endpointsV556)return drag.endpointsV556;const origins=drag.groupMembers?.length?drag.groupMembers:[{id:rack.id,x:drag.originX,y:drag.originY}],ids=new Set(origins.map(o=>Number(o.id))),anchors=groupEnds556(m2LayoutState.racks,origins,Boolean(rack.joinGroup&&!drag.selectionGroup)),refs=m2LayoutState.racks.filter(r=>!ids.has(Number(r.id))&&!r.staged).flatMap(r=>rackEnds556(r));return drag.endpointsV556={origins,anchors,index:{x:index(refs,'x'),y:index(refs,'y')},x:null,y:null,version};}");
 replace(/ function paint\(ctx,rack,drag\)\{[^\n]*\}/,` function paint(ctx,rack,drag){const svg=document.querySelector('.rafex-drag-scene-v248 .rafex-scene-content-v248')||document.getElementById('m2LayoutSvg');if(!svg)return;const matches=['x','y'].filter(axis=>{const m=ctx[axis];return m&&Math.abs(m.anchor[axis]+rack[axis]-drag[axis==='x'?'originX':'originY']-m.value)<.01;});if(!matches.length){clear();return;}if(!guide?.isConnected||guide.parentNode!==svg){clear();guide=document.createElementNS(ns,'g');guide.setAttribute('data-rafex-alignment-v249','');guide.setAttribute('pointer-events','none');svg.append(guide);}guide.innerHTML=matches.map(axis=>{const m=ctx[axis],p={x:m.anchor.x+rack.x-drag.originX,y:m.anchor.y+rack.y-drag.originY},ref=m.ref;return axis==='x'?'<line x1="'+p.x+'" x2="'+p.x+'" y1="'+Math.min(p.y,ref.y)+'" y2="'+Math.max(p.y,ref.y)+'"/>':'<line y1="'+p.y+'" y2="'+p.y+'" x1="'+Math.min(p.x,ref.x)+'" x2="'+Math.max(p.x,ref.x)+'"/>';}).join('');}`);
 replace(/if\(!ctx.anchor\|\|!matrix\)/,"if(!ctx.anchors.length||!matrix)");
 replace(/,p=\{x:ctx.anchor.x\+raw.dx,y:ctx.anchor.y\+raw.dy\}/,'');
 replace(/const x=nearest\(ctx.index.x,p,'x',scale,ctx.x\),y=nearest\(ctx.index.y,p,'y',scale,ctx.y\)/,"const x=nearestEnds556(ctx.index.x,ctx.anchors,raw,'x',scale,ctx.x,nearest),y=nearestEnds556(ctx.index.y,ctx.anchors,raw,'y',scale,ctx.y,nearest)");
 code='/* rack-endpoints-v556 */\n'+[rackEnds556,groupEnds556,nearestEnds556].map(f=>f.toString()).join('\n')+'\n'+code;
 return html.replace(re,()=>'<script data-rack-alignment="v249">'+code+'</script>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/rack-endpoint-alignment-v556.mjs'))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){let source=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))source=transform(source);else{const m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('HTML missing');source=source.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,source);console.log('PASS endpoint alignment v556: '+file);}
