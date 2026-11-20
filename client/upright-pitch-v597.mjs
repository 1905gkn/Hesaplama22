import * as T from 'three';
const cache=new WeakMap();
// Counter the display scale for perforated profiles, cutting/extending the
// straight profile instead of stretching its 50 mm hole pattern.
export function uprightPitchGeometry597(source,scale,axis='y'){
 if(!Number.isFinite(scale)||scale<=0||Math.abs(scale-1)<1e-8)return source;
 let variants=cache.get(source);if(!variants){variants=new Map();cache.set(source,variants);}const key=axis+':'+scale.toFixed(9);if(variants.has(key))return variants.get(key);
 source.computeBoundingBox();const min=source.boundingBox.min[axis],max=source.boundingBox.max[axis],span=max-min,limit=span*scale;
 const attrs=source.attributes,p=attrs.position,ix=source.index,count=ix?.count??p.count,out=Object.fromEntries(Object.keys(attrs).map(k=>[k,[]])),ai={x:0,y:1,z:2}[axis];
 const vertex=i=>Object.fromEntries(Object.entries(attrs).map(([k,a])=>[k,Array.from({length:a.itemSize},(_,j)=>a.getComponent(i,j))]));
 const emit=poly=>{for(let j=1;j+1<poly.length;j++)for(const v of [poly[0],poly[j],poly[j+1]])for(const name of Object.keys(attrs))out[name].push(...v[name]);};
 const copies=Math.max(1,Math.ceil(scale));
 for(let tile=0;tile<copies;tile++)for(let i=0;i<count;i+=3){let poly=[0,1,2].map(j=>vertex(ix?ix.getX(i+j):i+j));const local=poly.map(v=>v.position[ai]-min);
  // Do not repeat the thin end caps inside an extended profile.
  if(tile>0&&local.every(y=>Math.abs(y)<span*1e-7))continue;
  if(local.every(y=>Math.abs(y-span)<span*1e-7))continue;
  poly.forEach(v=>v.position[ai]=v.position[ai]-min+tile*span);
  let clipped=[];for(let j=0;j<poly.length;j++){const a=poly[j],b=poly[(j+1)%poly.length],ya=a.position[ai],yb=b.position[ai],inside=ya<=limit;if(inside)clipped.push(a);if(inside!==(yb<=limit)){const t=(limit-ya)/(yb-ya),v={};for(const k of Object.keys(attrs))v[k]=a[k].map((n,q)=>n+(b[k][q]-n)*t);clipped.push(v);}}
  clipped.forEach(v=>v.position[ai]=min+v.position[ai]/scale);emit(clipped);
 }
 // Preserve the original open-channel top cap at its new cutting plane.
 for(let i=0;i<count;i+=3){const poly=[0,1,2].map(j=>vertex(ix?ix.getX(i+j):i+j));if(poly.every(v=>Math.abs(v.position[ai]-max)<span*1e-7))emit(poly);}
 const g=new T.BufferGeometry();for(const [name,a]of Object.entries(attrs))g.setAttribute(name,new T.Float32BufferAttribute(out[name],a.itemSize));g.computeBoundingBox();g.computeBoundingSphere();g.userData={...source.userData,uprightPitch597:{scale,axis}};variants.set(key,g);return g;
}
const templateCache=new WeakMap();
export function uprightTemplate597(template,scale){
 if(Math.abs(scale-1)<1e-8)return template;let variants=templateCache.get(template);if(!variants){variants=new Map();templateCache.set(template,variants);}const key=scale.toFixed(9);if(!variants.has(key))variants.set(key,{...template,geometries:template.geometries.map(g=>g.userData.uprightCandidate594?uprightPitchGeometry597(g,scale,'y'):g)});return variants.get(key);
}
