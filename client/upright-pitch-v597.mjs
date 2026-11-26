import * as T from 'three';
const cache=new WeakMap();
// Counter the display scale for perforated profiles, cutting/extending the
// straight profile instead of stretching its 50 mm hole pattern.
export function uprightPitchGeometry597(source,scale,axis='y'){
 if(!Number.isFinite(scale)||scale<=0||Math.abs(scale-1)<1e-8)return source;
 let variants=cache.get(source);if(!variants){variants=new Map();cache.set(source,variants);}const key=axis+':'+scale.toFixed(9);if(variants.has(key))return variants.get(key);
 source.computeBoundingBox();const min=source.boundingBox.min[axis],max=source.boundingBox.max[axis],span=max-min,limit=span*scale;
 const attrs=source.attributes,p=attrs.position,ix=source.index,count=ix?.count??p.count;
 const names=Object.keys(attrs),out=Object.fromEntries(names.map(name=>[name,[]]));
 const ai={x:0,y:1,z:2}[axis],epsilon=span*1e-7;
 const indexAt=i=>ix?ix.getX(i):i;
 function emitVertex(from,to,mix,height){
  for(const name of names){
   const attribute=attrs[name],values=out[name];
   for(let component=0;component<attribute.itemSize;component++){
    if(name==='position'&&component===ai){values.push(height);continue;}
    const value=attribute.getComponent(from,component);
    values.push(from===to?value:value+(attribute.getComponent(to,component)-value)*mix);
   }
  }
 }
 // A clipped triangle has at most four vertices. Reuse the same scratch
 // storage for every face instead of constructing objects per attribute.
 const ids=new Uint32Array(3),heights=new Float64Array(3);
 const from=new Uint32Array(4),to=new Uint32Array(4),mix=new Float64Array(4),clippedHeight=new Float64Array(4);
 const caps=[];
 for(let tile=0;tile<Math.ceil(scale);tile++){
  const offset=tile*span;
  for(let i=0;i<count;i+=3){
   for(let j=0;j<3;j++){
    ids[j]=indexAt(i+j);
    heights[j]=p.getComponent(ids[j],ai)-min;
   }
   if(Math.abs(heights[0]-span)<epsilon&&Math.abs(heights[1]-span)<epsilon&&Math.abs(heights[2]-span)<epsilon){
    if(tile===0)caps.push(i);
    continue;
   }
   if(tile>0&&Math.abs(heights[0])<epsilon&&Math.abs(heights[1])<epsilon&&Math.abs(heights[2])<epsilon)continue;
   const a=heights[0]+offset,b=heights[1]+offset,c=heights[2]+offset;
   if(a<=limit&&b<=limit&&c<=limit){
    for(let j=0;j<3;j++)emitVertex(ids[j],ids[j],0,min+(heights[j]+offset)/scale);
    continue;
   }
   if(a>limit&&b>limit&&c>limit)continue;
   let length=0;
   for(let j=0;j<3;j++){
    const next=(j+1)%3,ya=heights[j]+offset,yb=heights[next]+offset,inside=ya<=limit;
    if(inside){
     from[length]=to[length]=ids[j];mix[length]=0;clippedHeight[length++]=ya;
    }
    if(inside!==(yb<=limit)){
     const t=(limit-ya)/(yb-ya);
     from[length]=ids[j];to[length]=ids[next];mix[length]=t;clippedHeight[length++]=ya+(yb-ya)*t;
    }
   }
   for(let j=1;j+1<length;j++){
    emitVertex(from[0],to[0],mix[0],min+clippedHeight[0]/scale);
    emitVertex(from[j],to[j],mix[j],min+clippedHeight[j]/scale);
    emitVertex(from[j+1],to[j+1],mix[j+1],min+clippedHeight[j+1]/scale);
   }
  }
 }
 // Keep the original cut cap at the top of the rescaled profile.
 for(const i of caps)for(let j=0;j<3;j++){
  const id=indexAt(i+j);
  emitVertex(id,id,0,p.getComponent(id,ai));
 }
 const g=new T.BufferGeometry();for(const [name,a]of Object.entries(attrs))g.setAttribute(name,new T.Float32BufferAttribute(out[name],a.itemSize));g.computeBoundingBox();g.computeBoundingSphere();g.userData={...source.userData,uprightPitch597:{scale,axis}};variants.set(key,g);return g;
}
const templateCache=new WeakMap();
export function uprightTemplate597(template,scale){
 if(Math.abs(scale-1)<1e-8)return template;let variants=templateCache.get(template);if(!variants){variants=new Map();templateCache.set(template,variants);}const key=scale.toFixed(9);if(!variants.has(key))variants.set(key,{...template,geometries:template.geometries.map(g=>g.userData.uprightCandidate594&&!g.userData.innerPost605?uprightPitchGeometry597(g,scale,'y'):g)});return variants.get(key);
}
