import fs from 'node:fs';
import {mergeRackCatalog} from './stable-rack-catalog.mjs';
export function transform(html){
 if(html.includes('data-project-display-persistence="v325"'))return html;
 const replace=(from,to)=>{if(!html.includes(from))throw Error('v325 anchor missing: '+from.slice(0,100));html=html.replace(from,to);};
 // Invisible CAD hit targets can extend far past the actual drawing.
 replace("const nodes=[...source.children].flatMap(node=>node.id==='m2LayoutContent'?[...node.children]:node.tagName.toLowerCase()==='g'?[node]:[]);",
 "const nodes=[...source.children].flatMap(node=>node.id==='m2LayoutContent'?[...node.children]:node.tagName.toLowerCase()==='g'?[node]:[]).flatMap(node=>node.matches('.rafex-cad-layer')?[...node.children].filter(child=>!child.matches('.rafex-cad-edge-hit')):[node]);");
 replace('height=(bottom-top+rulerSpace)/(1-2*margin);','height=(bottom-top)/(1-2*margin);');
 const runtime=`<script data-project-display-persistence="v325">(()=>{
 const mergeCatalog=(${mergeRackCatalog.toString()});
 let repairing=false;const checked=new WeakMap();
 const key=e=>(e.__rafexSystem||e.system||e.drawing?.rafexSystem||e.drawing?.systemType||'b2b')+':'+e.id;
 function remap(layout,merged){
  for(const rack of layout?.racks||[]){
   const previous=rack.rafexCatalogKey,next=merged.aliases[previous]||previous,entry=merged.entries.find(e=>key(e)===next);
   if(!entry)continue;
   rack.rafexCatalogKey=next;rack.typeName=entry.name;rack.rafexGlobalTypeLetter=entry.name;
   if(previous!==next)for(const field of ['rackTypeId','savedTypeId'])if(rack[field]!=null)rack[field]=entry.id;
  }
 }
 function repair(){
  const types=window.rafexProjectTypesV133;
  if(repairing||!Array.isArray(types)||document.querySelector('#nav button.active[data-page]')?.dataset.page!=='free')return;
  const old=checked.get(types);if(old&&old.length===types.length&&old.every((e,i)=>e===types[i]))return;
  const merged=mergeCatalog(types,[]);checked.set(types,types.slice());
  if(merged.entries.length===types.length&&merged.entries.every((e,i)=>key(e)===key(types[i])&&e.name===types[i].name))return;
  repairing=true;
  try{
   const areas=window.rafexAreaDocument?.();
   if(areas)for(const area of areas.areas)remap(area.layout,merged);
   remap(m2LayoutState,merged);
   window.rafexProjectTypesV133=merged.entries;checked.set(merged.entries,merged.entries.slice());
   window.rafexSelectedCatalogKey=merged.aliases[window.rafexSelectedCatalogKey]||window.rafexSelectedCatalogKey;
   if(areas&&window.rafexReplaceAreaDocumentV319)window.rafexReplaceAreaDocumentV319(areas,window.rafexProjectIdentityV133?.uuid);
  }finally{repairing=false;}
 }
 const render=m2RenderSavedRackTypes;
 m2RenderSavedRackTypes=window.m2RenderSavedRackTypes=function(){repair();return render.apply(this,arguments);};
})();</script>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v325 body missing');
 return html.slice(0,end)+runtime+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-project-display-persistence-v325.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!m)throw Error('v325 HTML missing');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
 console.log('v325: centered painted layout bounds, unique catalog and project-owned section dimensions');
}
