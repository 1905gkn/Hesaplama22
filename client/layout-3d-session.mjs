// A viewing session owns one GPU context and a bounded set of immutable area scenes.
// Source snapshots are compared only when opening an area, never on camera movement.
const revisions=new WeakMap();
export function layoutRevision(layout){
 if(!revisions.has(layout)){
  const {selectedId,getClearances,areas,activeAreaId,...source}=layout;
  revisions.set(layout,JSON.stringify(source));
 }
 return revisions.get(layout);
}

export function sceneBufferBytes(scene){
 const buffers=new Set(),textures=new Set();let textureBytes=0;
 const attribute=a=>{const array=a?.array||a?.data?.array;if(array)buffers.add(array.buffer);};
 const texture=t=>{if(!t?.isTexture||textures.has(t))return;textures.add(t);const image=t.image;if(image)textureBytes+=(image.width||0)*(image.height||0)*4;};
 scene.traverse(o=>{
  if(o.geometry){Object.values(o.geometry.attributes).forEach(attribute);attribute(o.geometry.index);}
  attribute(o.instanceMatrix);attribute(o.instanceColor);
  for(const material of [].concat(o.material||[])){
   Object.values(material).forEach(texture);
   Object.values(material.uniforms||{}).forEach(u=>texture(u.value));
  }
 });
 return [...buffers].reduce((n,b)=>n+b.byteLength,textureBytes);
}

export function createPreparedSceneSession({create,activate,deactivate,disposeSurface=()=>{},maxEntries=8,maxBytes=256*1024*1024}){
 const entries=new Map();let current=null,epoch=0,queue=Promise.resolve(),disposed=false,valid=null,builds=0,reuses=0;
 const remove=id=>{const entry=entries.get(id);if(!entry)return;if(current===entry){deactivate(entry.value);current=null;}entries.delete(id);entry.value.dispose();};
 const bytes=()=>[...entries.values()].reduce((n,e)=>n+e.bytes,0);
 const trim=()=>{while(entries.size>maxEntries||bytes()>maxBytes){const id=[...entries.keys()].find(id=>entries.get(id)!==current);if(id===undefined)break;remove(id);}};
 const hide=()=>{epoch++;if(current){deactivate(current.value);current=null;}};
 return {
  retain(pairs){valid=new Map(pairs);for(const [id,e] of entries)if(valid.get(id)!==e.revision)remove(id);},
  show(id,revision,source){
   if(disposed)return Promise.resolve(null);
   const ticket=++epoch;if(current){deactivate(current.value);current=null;}
   const job=async()=>{
    if(disposed||ticket!==epoch)return null;
    let entry=entries.get(id),reused=!!entry&&entry.revision===revision;
    if(entry&&!reused){remove(id);entry=null;}
    if(!entry){
     const value=await create(source);builds++;
     if(disposed||(valid&&valid.get(id)!==revision)){value.dispose();return null;}
     entry={revision,value,bytes:value.bytes||0};entries.set(id,entry);
    }
    if(ticket!==epoch){trim();return null;}
    entries.delete(id);entries.set(id,entry);current=entry;if(reused)reuses++;
    trim();activate(entry.value,{reused});return {value:entry.value,reused};
   };
   const result=queue.then(job,job);queue=result.catch(()=>{});return result;
  },
  hide,
  stats(){return {builds,reuses,entries:entries.size,bytes:bytes(),maxBytes};},
  dispose(){if(disposed)return;disposed=true;hide();for(const id of [...entries.keys()])remove(id);queue.finally(disposeSurface);}
 };
}
