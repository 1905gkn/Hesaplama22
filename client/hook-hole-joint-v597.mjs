import * as T from 'three';
export function planeHoles597(g,normalAxis,at,up='y'){
 const across=['x','y','z'].find(k=>k!==normalAxis&&k!==up),p=g.attributes.position,ix=g.index,count=ix?.count??p.count,edges=new Map(),vertices=new Map(),get=(i,k)=>p['get'+k.toUpperCase()](i);g.computeBoundingBox();const span=g.boundingBox.max[up]-g.boundingBox.min[up],q=Math.max(span*1e-8,1e-8),tol=q*20,key=i=>[get(i,across),get(i,up)].map(n=>Math.round(n/q)).join(':');
 for(let i=0;i<count;i+=3){const ids=[0,1,2].map(j=>ix?ix.getX(i+j):i+j);if(ids.some(i=>Math.abs(get(i,normalAxis)-at)>tol))continue;const keys=ids.map(key);if(new Set(keys).size<3)continue;ids.forEach((i,j)=>vertices.set(keys[j],[get(i,across),get(i,up)]));for(let j=0;j<3;j++){const a=keys[j],b=keys[(j+1)%3],k=[a,b].sort().join('|');if(edges.has(k))edges.delete(k);else edges.set(k,[a,b]);}}
 const next=new Map(edges.values()),holes=[];while(next.size){const start=next.keys().next().value,ring=[];let v=start;while(next.has(v)){ring.push(vertices.get(v));const to=next.get(v);next.delete(v);v=to;if(v===start)break;}if(v!==start||ring.length<4)continue;const xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),height=maxY-minY;if(height>span*.2||height<q*10)continue;holes.push({x:(minX+maxX)/2,y:(minY+maxY)/2,width:maxX-minX,height,minX,maxX,minY,maxY});}return holes;
}
export function repeatingHoles597(holes){
 const groups=new Map();for(const h of holes){const k=[h.width,h.height].map(v=>Math.round(v*2000)).join(':');if(!groups.has(k))groups.set(k,[]);groups.get(k).push(h);}return [...groups.values()].sort((a,b)=>b.length-a.length)[0]||[];
}
export function connectorPhase597(post,beam,postScale,beamY){
 const pitch=post.holePitch||.05,base=(post.holeBase||0)*postScale+(post.holeFirstOffset||.026),nominal=beamY+(beam.hookTopY??-.046),upper=(beam.profileMinY??-.258)-(beam.connectorBottomY??-.263),lower=(beam.profileMaxY??-.208)-(beam.connectorTopY??-.023);
 let shift=base+Math.round((nominal-base)/pitch)*pitch-nominal;while(shift>upper+1e-7)shift-=pitch;while(shift<lower-1e-7)shift+=pitch;return shift;
}
const beamCache=new WeakMap();
export function connectorTemplate597(template,dy){
 if(Math.abs(dy)<1e-8)return template;let variants=beamCache.get(template);if(!variants){variants=new Map();beamCache.set(template,variants);}const key=dy.toFixed(8);if(!variants.has(key))variants.set(key,{...template,geometries:template.geometries.map(g=>/KONNEKT/i.test(g.userData.cadPartName||'')?g.clone().translate(0,dy,0):g)});return variants.get(key);
}
// Measurements in metres; root transforms may use native millimetres.
export function nativeJoint597(root,kind,contactFace=null){
 root.updateMatrixWorld(true);const pieces=[];root.traverse(m=>{if(m.isMesh&&(kind==='upright'?/MRD\d|AYAK(?:[_\s]+\d+)*[_\s]*-\d+/i.test(m.name):/KONNEKT/i.test(m.name)))pieces.push(m.geometry.clone().applyMatrix4(m.matrixWorld));});
 let best=null,all=[];for(const g of pieces){g.computeBoundingBox();const center=g.boundingBox.getCenter(new T.Vector3()),p=g.attributes.position,ix=g.index,count=ix?.count??p.count,planes=new Map();
  if(kind==='upright')for(let i=0;i<count;i+=3){const ids=[0,1,2].map(j=>ix?ix.getX(i+j):i+j),ys=ids.map(j=>p.getY(j));if(Math.max(...ys)-Math.min(...ys)>.001)continue;const a=new T.Vector3().fromBufferAttribute(p,ids[0]),b=new T.Vector3().fromBufferAttribute(p,ids[1]),c=new T.Vector3().fromBufferAttribute(p,ids[2]),area=b.sub(a).cross(c.sub(a)).length()/2,k=Math.round(ys[0]*1000);planes.set(k,(planes.get(k)||0)+area);}
  const candidates=kind==='upright'?[...planes].sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k])=>k/1000):[contactFace];
  for(const face of candidates){const holes=repeatingHoles597(planeHoles597(g,'y',face,'z'));if(kind==='traverse'){all.push(...holes);continue;}const score=holes.length*1000+Math.abs(face-center.y);if(holes.length&&(!best||score>best.score))best={score,face,holes,base:g.boundingBox.min.z};}
 }
 const holes=kind==='upright'?best?.holes||[]:repeatingHoles597(all);const result=kind==='upright'?{frontFace:best?.face,holeXs:[...new Set(holes.map(h=>Math.round(h.x*1000)/1e6))],holeBase:(best?.base||0)/1000,holeFirstOffset:holes.length?(Math.min(...holes.map(h=>h.y))-(best?.base||0))/1000:0,holePitch:.05}:{hookHalfSpan:holes.length?holes.reduce((n,h)=>n+Math.abs(h.x),0)/holes.length/1000:null,hookTopY:holes.length?Math.max(...holes.map(h=>h.y))/1000:null,connectorBottomY:pieces.length?Math.min(...pieces.map(g=>g.boundingBox.min.z))/1000:null,connectorTopY:pieces.length?Math.max(...pieces.map(g=>g.boundingBox.max.z))/1000:null};pieces.forEach(g=>g.dispose());return result;
}

const consoleCache597=new WeakMap();
// Move mirrored consoles independently without stretching their connector plates.
export function driveConsoleTemplate597(template,clearSpan){
 let variants=consoleCache597.get(template);if(!variants){variants=new Map();consoleCache597.set(template,variants);}const key=clearSpan.toFixed(7);if(!variants.has(key)){const factor=70/59;variants.set(key,{...template,geometries:template.geometries.map(source=>{const g=source.clone();g.computeBoundingBox();const b=g.boundingBox,side=(b.min.x+b.max.x)<0?-1:1,outer=side<0?b.min.x:b.max.x;g.scale(factor,factor,factor);g.translate(side*(clearSpan/2-.0002)-outer*factor,0,0);g.userData.connectorExact596=true;g.computeBoundingBox();g.computeBoundingSphere();return g;})});}return variants.get(key);
}
