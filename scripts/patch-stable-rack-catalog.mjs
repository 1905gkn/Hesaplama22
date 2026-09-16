import fs from 'node:fs';
import {mergeRackCatalog,catalogRecordFingerprint} from './stable-rack-catalog.mjs';
import {namespaceSvgCopy} from './namespace-svg-copy.mjs';
export function transform(html){
  if(html.includes('data-rafex-stable-catalog'))return html;
  const replace=(a,b)=>{if(!html.includes(a))throw Error('Catalog anchor missing: '+a.slice(0,100));html=html.replace(a,b);};
  const start=html.indexOf('  async function loadCatalog(force){'),end=html.indexOf('  function installCatalog(){',start);
  if(start<0||end<0)throw Error('Catalog loader missing');
  html=html.slice(0,start)+`  var stableCatalogOwner=null;
  async function loadCatalog(force){
    if(!isFree()||deletingSavedTypes)return catalog;
    const owner=window.rafexProjectIdentityV133?.uuid;
    if(!force&&(window.rafexProjectTypesV133||catalogReady)){installCatalog();return m2SavedRackTypes;}
    if(catalogLoading){if(stableCatalogOwner===owner)return catalogLoading;await catalogLoading;if(owner!==window.rafexProjectIdentityV133?.uuid)return [];return loadCatalog(force);}
    stableCatalogOwner=owner;
    catalogLoading=(async function(){
      const response=await req('/api/rack-types');
      if(owner!==window.rafexProjectIdentityV133?.uuid||!isFree())return [];
      if(!Array.isArray(response?.types))throw Error('Kayıtlı raf listesi alınamadı; mevcut liste korundu.');
      const records=response.types.filter(validEntry).map(entry=>{
        const row=normalizeCatalogEntry(entry,entry.system||systemOf(entry));
        row.__rafexApi='/api/rack-types';return row;
      });
      catalog=records;catalogReady=true;catalogLoadedAt=Date.now();
      const local=window.rafexProjectTypesV133;
      const merged=window.rafexMergeRackCatalog(local||[],records,window.rafexProjectIdentityV133?.excludedRackTypes||[]);
      if(local)window.rafexProjectTypesV133=merged.entries;else catalog=merged.entries;
      reconcileCatalogRacks(merged);
      installCatalog();status(m2SavedRackTypes.length+' kayıtlı raf tipi yüklendi.');return m2SavedRackTypes;
    })();
    try{return await catalogLoading;}catch(error){status(error.message||'Kayıtlar alınamadı; mevcut liste korundu.');return m2SavedRackTypes;}finally{catalogLoading=null;}
  }
  function reconcileCatalogRacks(merged){
    window.rafexSelectedCatalogKey=merged.aliases[window.rafexSelectedCatalogKey]||window.rafexSelectedCatalogKey;
    for(const rack of m2LayoutState?.racks||[]){
      const old=rack.rafexCatalogKey,key=merged.aliases[old]||old;
      const entry=merged.entries.find(e=>entryKey(e)===key);
      if(entry){rack.rafexCatalogKey=key;rack.typeName=entry.name;rack.rafexGlobalTypeLetter=entry.name;}
    }
  }
`+html.slice(end);
  // Every renderer sees exactly the same order; selection never changes index
  // behind a pending click or while a different system editor is rebuilt.
  replace('m2SavedRackTypes=structuredClone(window.rafexProjectTypesV133||catalog).sort(function(a,b){return letterNo(a.name)-letterNo(b.name);});','m2SavedRackTypes=structuredClone(window.rafexProjectTypesV133||catalog);');
  replace('    var selectedKey=entryKey(selected);','    var selectedKey=window.rafexSelectedCatalogKey||entryKey(selected);');
  const clickStart=html.indexOf('      function m2HandleSavedRackTypeClick(index, event) {'),clickEnd=html.indexOf('      async function m2SaveRackType()',clickStart);
  if(clickStart<0||clickEnd<0)throw Error('Catalog click handler missing');
  html=html.slice(0,clickStart)+`      function m2HandleSavedRackTypeClick(index,event){
        clearTimeout(m2SavedTypeClickTimer);m2SavedTypeClickTimer=null;
        const entry=m2SavedRackTypes[index];if(!entry)return;
        window.rafexSelectedCatalogKey=(entry.__rafexSystem||entry.system||'')+':'+entry.id;
        m2ChooseSavedRackType(index);
        if(Number(event?.detail)>=2)m2AddSelectedSavedRack();
      }
`+html.slice(clickEnd);
  // Project opening can contain duplicates left by older import code. Reconcile
  // once, not by recreating IDs on each render or refresh.
  replace('window.rafexProjectTypesV133=isolated?structuredClone(project.payload.rackTypes||[]):null;',`window.rafexSelectedCatalogKey=null;
    if(isolated){
      const merged=window.rafexMergeRackCatalog(project.payload.rackTypes||[],[]);
      project.payload.rackTypes=merged.entries;
      for(const rack of project.payload.layout?.racks||[]){const key=merged.aliases[rack.rafexCatalogKey]||rack.rafexCatalogKey;const entry=merged.entries.find(e=>(e.__rafexSystem+':'+e.id)===key);if(entry){rack.rafexCatalogKey=key;rack.typeName=entry.name;rack.rafexGlobalTypeLetter=entry.name;}}
    }
    window.rafexProjectTypesV133=isolated?structuredClone(project.payload.rackTypes||[]):null;`);
  // Remove the earlier catalog's independent import path. The final controller
  // handles the single endpoint and protects the active project from late replies.
  replace('  async function refreshUnified(force=false){','  async function refreshUnified(force=false){\n    if(isFree()&&window.__rafexStableCatalog)return window.m2RefreshSavedRackTypes();');
  const deletion="window.rafexProjectTypesV133=window.rafexProjectTypesV133.filter(item=>item.id!==entry.id);";
  if(!html.includes(deletion))throw Error('Project catalog deletion missing');
  html=html.replaceAll(deletion,`const identity=window.rafexProjectIdentityV133;if(identity){identity.excludedRackTypes=Array.from(new Set([...(identity.excludedRackTypes||[]),window.rafexCatalogFingerprint(entry)]));}window.rafexProjectTypesV133=window.rafexProjectTypesV133.filter(item=>String(item.id)!==String(entry.id)||(item.__rafexSystem||item.system)!==(entry.__rafexSystem||entry.system));`);
  html=html.replaceAll('m2SavedRackTypes=structuredClone(window.rafexProjectTypesV133);','m2SavedRackTypes=window.rafexCatalogView(window.rafexProjectTypesV133);');
  html=html.replaceAll('m2SavedRackTypes=structuredClone(window.rafexProjectTypesV133||catalog);','m2SavedRackTypes=window.rafexCatalogView(window.rafexProjectTypesV133||catalog);');
  replace("clone.setAttribute('aria-label','Konsol kollu serbest yerleşim çıktısı');right.appendChild(clone)","clone.setAttribute('aria-label','Konsol kollu serbest yerleşim çıktısı');window.rafexNamespaceSvgCopy(clone,'konsol-output-'+(++window.rafexSvgCopySequence));right.appendChild(clone)");
  const script='<script data-rafex-stable-catalog>'+catalogRecordFingerprint.toString()+';window.rafexCatalogFingerprint=catalogRecordFingerprint;window.rafexSvgCopySequence=0;window.rafexNamespaceSvgCopy='+namespaceSvgCopy.toString()+';window.__rafexStableCatalog=true;window.rafexMergeRackCatalog='+mergeRackCatalog.toString()+`;(()=>{const cache=new WeakMap();window.rafexCatalogView=function(source){let old=cache.get(source);if(!old||old.refs.length!==source.length||source.some((e,i)=>old.refs[i]!==e)){old={refs:source.slice(),view:structuredClone(source)};cache.set(source,old);}return old.view;};})();</script>`;
  const first=html.indexOf('<script');return html.slice(0,first)+script+html.slice(first);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-stable-rack-catalog.mjs')){
  const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
  const html=transform(Buffer.from(m[2],'base64').toString());
  fs.writeFileSync(file,s.replace(m[0],m[0].replace(m[2],Buffer.from(html).toString('base64'))));
}
