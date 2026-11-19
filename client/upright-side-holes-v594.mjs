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
 const at=i=>index?index.getX(i):i,quantum=Math.max(size[heightAxis]*2e-5,1e-6),key=v=>Math.round(v[heightAxis]/quantum)+':'+Math.round(v[frontAxis]/quantum);
 for(let i=0;i<count;i+=3){a.fromBufferAttribute(pos,at(i));b.fromBufferAttribute(pos,at(i+1));c.fromBufferAttribute(pos,at(i+2));n.subVectors(b,a).cross(edge.subVectors(c,a));if(!n.lengthSq())continue;n.normalize();if(Math.abs(n[side])<.999)continue;
  const planeKey=Math.round(a[side]/quantum)+':'+Math.sign(n[side]);let p=planes.get(planeKey);if(!p){p={normal:n.clone(),at:a[side],edges:new Map(),vertices:new Map(),triangles:[]};planes.set(planeKey,p);}p.triangles.push(i);
  const points=[a,b,c],keys=points.map(key);points.forEach((v,j)=>p.vertices.set(keys[j],v.clone()));for(let j=0;j<3;j++){const x=keys[j],y=keys[(j+1)%3],k=[x,y].sort().join('|');if(p.edges.has(k))p.edges.delete(k);else p.edges.set(k,[x,y]);}
 }
 const remove=new Set(),patches=[];let closed=0;
 for(const plane of planes.values()){
  const next=new Map();let ambiguous=false;for(const [a,b]of plane.edges.values()){if(next.has(a)){ambiguous=true;break;}next.set(a,b);}if(ambiguous)continue;
  const loops=[];while(next.size){const first=next.keys().next().value,loop=[];let v=first;while(next.has(v)){loop.push(plane.vertices.get(v));const to=next.get(v);next.delete(v);v=to;if(v===first)break;}if(v!==first){ambiguous=true;break;}if(loop.length>=3)loops.push(loop);}if(ambiguous||loops.length<2)continue;
  const projected=loops.map(points=>({points,flat:points.map(v=>new THREE.Vector2(v[heightAxis],v[frontAxis]))}));projected.forEach(l=>l.area=THREE.ShapeUtils.area(l.flat));const largest=projected.reduce((a,b)=>Math.abs(a.area)>Math.abs(b.area)?a:b),sign=Math.sign(largest.area);
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
