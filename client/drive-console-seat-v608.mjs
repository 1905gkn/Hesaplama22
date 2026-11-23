import * as T from 'three';
// Find the inside face of the broad lower shelf after the console is turned up.
export function consoleBearing608(geometries,up='y'){
 const result=[];for(const g of geometries){const p=g.attributes.position,ix=g.index,n=ix?.count??p.count,planes=new Map(),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),ab=new T.Vector3(),ac=new T.Vector3();g.computeBoundingBox();const tol=Math.max(1e-7,(g.boundingBox.max[up]-g.boundingBox.min[up])*1e-5);
 for(let i=0;i<n;i+=3){[a,b,c].forEach((v,j)=>v.fromBufferAttribute(p,ix?ix.getX(i+j):i+j));if(Math.max(a[up],b[up],c[up])-Math.min(a[up],b[up],c[up])>tol)continue;const area=ab.subVectors(b,a).cross(ac.subVectors(c,a)).length()/2;if(area<1e-12)continue;const key=Math.round(a[up]/tol);let f=planes.get(key);if(!f)planes.set(key,f={at:a[up],area:0,min:Infinity,max:-Infinity});f.area+=area;f.min=Math.min(f.min,a.x,b.x,c.x);f.max=Math.max(f.max,a.x,b.x,c.x);}
 const faces=[...planes.values()],largest=Math.max(...faces.map(f=>f.area)),face=faces.filter(f=>f.area>=largest*.8).sort((a,b)=>b.at-a.at)[0];if(face)result.push({...face,bottom:Math.min(...faces.filter(f=>f.area>=largest*.8).map(f=>f.at)),x:(face.min+face.max)/2,width:face.max-face.min});}
 return {bottom:result.length?result.reduce((n,f)=>n+f.bottom,0)/result.length:0,at:result.length?result.reduce((n,f)=>n+f.at,0)/result.length:0,seats:result.sort((a,b)=>a.x-b.x)};
}

const objectCache608=new WeakMap();export function objectBearing608(root,up='z'){if(objectCache608.has(root))return objectCache608.get(root);root.updateMatrixWorld(true);const geometries=[];root.traverse(m=>{if(m.isMesh)geometries.push(m.geometry.clone().applyMatrix4(m.matrixWorld));});const bearing=consoleBearing608(geometries,up);geometries.forEach(g=>g.dispose());objectCache608.set(root,bearing);return bearing;}
