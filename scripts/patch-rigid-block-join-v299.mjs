import fs from 'node:fs';

export function transform(html) {
 if(html.includes('/* rigid-block-join-v299 */'))return html;
 const start=html.indexOf('function planScannedJoin('),end=html.indexOf('(function installScannedJoin()',start);
 if(start<0||end<0)throw Error('Missing scanned join planner');
 html=html.slice(0,start)+`function planScannedJoin(target,moving,scale,foot,fixed=[target],chosenRow=null,direction=null){
 /* rigid-block-join-v299 */
 const rad=(Number(target.angle)||0)*Math.PI/180,ux=Math.cos(rad),uy=Math.sin(rad);
 const along=r=>(r.x+r.w/2)*ux+(r.y+r.h/2)*uy;
 const sign=direction===-1?-1:direction===1?1:(moving.reduce((n,r)=>n+along(r)-along(target),0)<0?-1:1);
 const reference=Number(target.b2bLayout?.rowCount)===2?target:fixed.find(r=>Number(r.b2bLayout?.rowCount)===2);
 const lower=Number(target.b2bLayout?.rowCount)===1&&reference&&Math.abs(rowAxis(target,0)-rowAxis(reference,1))<Math.abs(rowAxis(target,0)-rowAxis(reference,0));
 const row=r=>(chosenRow===null?lower:chosenRow==='lower')?(Number(r.b2bLayout?.rowCount)||1)-1:0;
 const axis=rowAxis(target,row(target)),blocks=new Map();
 for(const r of moving){const key=r.joinGroup||r.id;if(!blocks.has(key))blocks.set(key,[]);blocks.get(key).push(r);}
 const ordered=[...blocks.values()].sort((a,b)=>Math.min(...a.map(r=>sign*along(r)))-Math.min(...b.map(r=>sign*along(r))));
 const planned=[];let previous=target;
 for(const block of ordered){
  const entry=block.slice().sort((a,b)=>sign*(along(a)-along(b))||Math.abs(rowAxis(a,row(a))-axis)-Math.abs(rowAxis(b,row(b))-axis))[0];
  const step=(previous.w+entry.w)/2-(m2B2BFootWidth(previous)+m2B2BFootWidth(entry))/2*scale;
  if(step<=0)throw Error('Modül genişliği ortak ayak için yetersiz.');
  const da=along(previous)+sign*step-along(entry),dc=axis-rowAxis(entry,row(entry));
  const dx=ux*da-uy*dc,dy=uy*da+ux*dc;
  const copies=block.map(r=>({...r,x:r.x+dx,y:r.y+dy})),byId=new Map(copies.map(r=>[r.id,r]));
  // Reverse only the parent path so the contacted endpoint becomes the root.
  // Every original internal shared-foot edge remains between the same two bays.
  let child=byId.get(entry.id),parentId=child.sharedFootWith,side=child.sharedFootSide;
  const visited=new Set([child.id]);
  while(byId.has(parentId)&&!visited.has(parentId)){
   const parent=byId.get(parentId),nextId=parent.sharedFootWith,nextSide=parent.sharedFootSide;
   parent.sharedFootWith=child.id;parent.sharedFootSide=side==='left'?'right':'left';
   visited.add(parent.id);child=parent;parentId=nextId;side=nextSide;
  }
  Object.assign(byId.get(entry.id),{sharedFootWith:previous.id,sharedFootSide:sign>0?'left':'right'});
  planned.push(...copies);
  const aligned=copies.filter(r=>Array.from({length:Number(r.b2bLayout?.rowCount)||1},(_,i)=>rowAxis(r,i)).some(a=>Math.abs(a-axis)<.01));
  previous=(aligned.length?aligned:copies).slice().sort((a,b)=>sign*(along(b)-along(a)))[0];
 }
 return {planned,sign};
}
`+html.slice(end);
 const bulk="const selected=new Set([...(m2MultiSelect?.rackIds||[])].map(Number));if(selected.size<2)return false;";
 if(!html.includes(bulk))throw Error('Missing bulk join entry');
 html=html.replace(bulk,bulk+"\n if(m2LayoutState.racks.some(r=>selected.has(Number(r.id))&&r.joinGroup))return false;");
 return html;
}

if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-rigid-block-join-v299.mjs')){
 const file=process.argv[2]||'dist/server/index.js',source=fs.readFileSync(file,'utf8'),embedded=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 const html=embedded?Buffer.from(embedded[1],'base64').toString():source,result=transform(html);
 fs.writeFileSync(file,embedded?source.replace(embedded[1],Buffer.from(result).toString('base64')):result);
}

