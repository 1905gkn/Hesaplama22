import * as THREE from 'three';
// Render-only repair: retessellate flat lateral faces, keeping the original
// section outline and every front-face triangle. Coordinates are never moved.
export function closeUprightSideHoles594(source,{heightAxis='y',frontAxis='z'}={}){
 if(source.userData?.uprightSides594||new Set(source.groups.map(g=>g.materialIndex)).size>1)return source;
 const pos=source.attributes.position;if(!pos||Object.keys(source.morphAttributes).length)return source;
 source.computeBoundingBox();const size=source.boundingBox.getSize(new THREE.Vector3());
 if(size[heightAxis]<Math.max(...['x','y','z'].filter(k=>k!==heightAxis).map(k=>size[k]))*8)return source;
 const side=['x','y','z'].find(k=>k!==heightAxis&&k!==frontAxis),index=source.index,count=index?.count??pos.count;
 const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),n=new THREE.Vector3(),edge=new THREE.Vector3(),planes=new Map();
 const at=i=>index?index.getX(i):i,quantum=Math.max(size[heightAxis]*1e-8,1e-8),normalAttribute=source.attributes.normal,heightVector=new THREE.Vector3();heightVector[heightAxis]=1;const na=new THREE.Vector3(),nb=new THREE.Vector3(),nc=new THREE.Vector3();
 for(let i=0;i<count;i+=3){a.fromBufferAttribute(pos,at(i));b.fromBufferAttribute(pos,at(i+1));c.fromBufferAttribute(pos,at(i+2));n.subVectors(b,a).cross(edge.subVectors(c,a));if(!n.lengthSq())continue;const triangleArea=n.length()*.5;n.normalize();if(Math.abs(n[heightAxis])>.01||Math.abs(n[side])<.1)continue;
  // Folded side flanges are oblique. Restricting the repair to axis-aligned
  // faces left their round holes untouched in MR and Drive-In CAD exports.
  if(normalAttribute){na.fromBufferAttribute(normalAttribute,at(i));nb.fromBufferAttribute(normalAttribute,at(i+1));nc.fromBufferAttribute(normalAttribute,at(i+2));if(na.dot(nb)<.99999||na.dot(nc)<.99999||na.dot(n)<.99)continue;n.copy(na).normalize();}
  n[heightAxis]=0;n.normalize();const distance=n.dot(a);
  let p=[...planes.values()].find(p=>p.normal.dot(n)>.99999&&Math.abs(p.distance-distance)<Math.max(size[heightAxis]*4e-5,1e-6));
  if(!p){p={normal:n.clone(),distance,area:0,tangent:new THREE.Vector3().crossVectors(heightVector,n).normalize(),edges:new Map(),vertices:new Map(),triangles:[]};planes.set(planes.size,p);}
  const key=v=>Math.round(v[heightAxis]/quantum)+':'+Math.round(v.dot(p.tangent)/quantum);
  const points=[a,b,c],keys=points.map(key);if(new Set(keys).size<3)continue;p.triangles.push(i);p.area+=triangleArea;points.forEach((v,j)=>p.vertices.set(keys[j],v.clone()));for(let j=0;j<3;j++){const x=keys[j],y=keys[(j+1)%3],k=[x,y].sort().join('|');if(p.edges.has(k))p.edges.delete(k);else p.edges.set(k,[x,y]);}
 }
 const remove=new Set(),patches=[];let closed=0;
 for(const plane of planes.values()){
  if(plane.area<size[heightAxis]*Math.max(size[side],size[frontAxis])*.015)continue;
  // Upright side sheets are straight extrusions. Their full-height convex
  // envelope is authoritative even when a compressed CAD hole has broken seams.
  const samples=[...plane.vertices.values()].map(v=>({v,x:v[heightAxis],y:v.dot(plane.tangent)})).sort((a,b)=>a.x-b.x||a.y-b.y);
  if(samples.length>=4&&samples.at(-1).x-samples[0].x>=size[heightAxis]*.98){
   const turn=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),lower=[],upper=[];
   for(const p of samples){while(lower.length>=2&&turn(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}for(let i=samples.length-1;i>=0;i--){const p=samples[i];while(upper.length>=2&&turn(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}const hull=lower.slice(0,-1).concat(upper.slice(0,-1)),flat=hull.map(p=>new THREE.Vector2(p.x,p.y)),area=Math.abs(THREE.ShapeUtils.area(flat));
   if(hull.length>=3&&area>=plane.area*.999&&area<=plane.area*1.6){
    for(const face of THREE.ShapeUtils.triangulateShape(flat,[])){const vs=face.map(i=>hull[i].v);n.subVectors(vs[1],vs[0]).cross(edge.subVectors(vs[2],vs[0]));if(n.dot(plane.normal)<0)[vs[1],vs[2]]=[vs[2],vs[1]];patches.push({points:vs,normal:plane.normal});}plane.triangles.forEach(i=>remove.add(i));closed++;continue;
   }
  }
  const next=new Map();for(const [a,b]of plane.edges.values()){if(!next.has(a))next.set(a,[]);next.get(a).push(b);}
  let ambiguous=false;const loops=[];
  while(next.size){const first=next.keys().next().value,loop=[],visited=new Map();let v=first,previous=null;
   while(next.has(v)){
    if(visited.has(v)){const ring=loop.slice(visited.get(v));if(ring.length>=3)loops.push(ring);break;}
    visited.set(v,loop.length);loop.push(plane.vertices.get(v));const choices=next.get(v);let selected=0;
    if(previous&&choices.length>1){const at=plane.vertices.get(v),from=plane.vertices.get(previous),dx=at[heightAxis]-from[heightAxis],dy=at.dot(plane.tangent)-from.dot(plane.tangent);let best=Infinity;for(let j=0;j<choices.length;j++){const to=plane.vertices.get(choices[j]),x=to[heightAxis]-at[heightAxis],y=to.dot(plane.tangent)-at.dot(plane.tangent),turn=Math.atan2(dx*y-dy*x,dx*x+dy*y);if(turn<best){best=turn;selected=j;}}}
    const [to]=choices.splice(selected,1);if(!choices.length)next.delete(v);previous=v;v=to;
    if(v===first){if(loop.length>=3)loops.push(loop);break;}
   }
   if(v!==first&&!visited.has(v))ambiguous=true;
  }
  if(loops.length<1)continue;
  if(ambiguous){
   // Quantized Drive-In CAD has open seam fragments between otherwise closed
   // holes. Cap only verified clockwise hole contours; never rebuild its outline.
   for(const points of loops){const flat=points.map(v=>new THREE.Vector2(v[heightAxis],v.dot(plane.tangent))),area=THREE.ShapeUtils.area(flat),box=new THREE.Box2().setFromPoints(flat),span=box.getSize(new THREE.Vector2());const minSpan=Math.max(size[side],size[frontAxis])*.02;if(area<minSpan*minSpan*.3||span.x<minSpan||span.y<minSpan||span.x>size[heightAxis]*.03||span.y>Math.max(size[side],size[frontAxis])*.45)continue;
    for(const face of THREE.ShapeUtils.triangulateShape(flat,[])){const vs=face.map(i=>points[i]);n.subVectors(vs[1],vs[0]).cross(edge.subVectors(vs[2],vs[0]));if(n.dot(plane.normal)<0)[vs[1],vs[2]]=[vs[2],vs[1]];patches.push({points:vs,normal:plane.normal});}closed++;
   }
   continue;
  }
  if(loops.length<2)continue;
  const projected=loops.map(points=>({points,flat:points.map(v=>new THREE.Vector2(v[heightAxis],v.dot(plane.tangent)))}));projected.forEach(l=>l.area=THREE.ShapeUtils.area(l.flat));const largest=projected.reduce((a,b)=>Math.abs(a.area)>Math.abs(b.area)?a:b),sign=Math.sign(largest.area);
  const outers=projected.filter(l=>Math.sign(l.area)===sign),holes=projected.filter(l=>Math.sign(l.area)!==sign);if(!holes.length)continue;
  // Reject a broken/open end cut: only fully enclosed loops count as holes.
  const inside=(p,poly)=>{let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++)if((poly[i].y>p.y)!==(poly[j].y>p.y)&&p.x<(poly[j].x-poly[i].x)*(p.y-poly[i].y)/(poly[j].y-poly[i].y)+poly[i].x)yes=!yes;return yes;};
  if(holes.some(h=>!outers.some(o=>inside(h.flat[0],o.flat))))continue;
  const triangles=[];for(const outer of outers)for(const face of THREE.ShapeUtils.triangulateShape(outer.flat,[])){const points=face.map(i=>outer.points[i]);n.subVectors(points[1],points[0]).cross(edge.subVectors(points[2],points[0]));if(n.dot(plane.normal)<0)[points[1],points[2]]=[points[2],points[1]];triangles.push({points,normal:plane.normal});}
  if(!triangles.length)continue;plane.triangles.forEach(i=>remove.add(i));patches.push(...triangles);closed+=holes.length;
 }
 if(!closed)return source;
 const geometry=new THREE.BufferGeometry(),attributes={};for(const [name,attr]of Object.entries(source.attributes))attributes[name]=[];
 for(let i=0;i<count;i+=3)if(!remove.has(i))for(let j=0;j<3;j++){const vertex=at(i+j);for(const [name,attr]of Object.entries(source.attributes))for(let k=0;k<attr.itemSize;k++)attributes[name].push(attr.getComponent(vertex,k));}
 for(const patch of patches)for(const v of patch.points)for(const [name,attr]of Object.entries(source.attributes))for(let k=0;k<attr.itemSize;k++)attributes[name].push(name==='position'?v.getComponent(k):name==='normal'?patch.normal.getComponent(k):0);
 for(const [name,values]of Object.entries(attributes))geometry.setAttribute(name,new THREE.Float32BufferAttribute(values,source.attributes[name].itemSize));
 geometry.computeBoundingBox();geometry.computeBoundingSphere();geometry.userData={...source.userData,uprightSides594:{closed,frontAxis,heightAxis}};return geometry;
}

const uprightCache594=new WeakMap();
export function prepareUprightGeometry594(source,{heightAxis='y',frontAxis='z'}={}){
 const key=heightAxis+frontAxis;let variants=uprightCache594.get(source);if(!variants){variants=new Map();uprightCache594.set(source,variants);}if(variants.has(key))return variants.get(key);
 let g=closeUprightSideHoles594(source,{heightAxis,frontAxis});if(g===source){g=new THREE.BufferGeometry();for(const [name,a]of Object.entries(source.attributes))g.setAttribute(name,a);g.setIndex(source.index);g.boundingBox=source.boundingBox?.clone()||null;g.boundingSphere=source.boundingSphere?.clone()||null;g.userData={...source.userData};}
 g.userData.uprightProfile594={heightAxis,frontAxis};variants.set(key,g);return g;
}
