(function(){
 const common=()=>document.querySelector('#nav button.active[data-page]')?.dataset.page==='free';
 const systemName=type=>type.__rafexSystemLabel||({b2b:'B2B',mekik2:'Mekik',drive:'Drive-In',mr:'MR',konsol:'Konsol Kollu'}[type.__rafexSystem||type.system])||'Raf tipi';
 function typeDetails(type){
  const d=type.__rafexSnapshot||type.drawing||{},state=d.b2b||{},parts=[];
  const number=(label,value,unit='')=>{if(Number(value)>0)parts.push(label+': '+Number(value).toLocaleString('tr-TR')+unit);};
  number('En',d.totalWidth||d.widthMm,' mm');number('Derinlik',d.railLength||d.depthMm,' mm');
  number('Yükseklik',d.sideUprightHeight||d.totalRackHeight||state.footHeight||d.b2bViewerOptions?.footHeight,' mm');
  number('Kat',d.levels||state.levels);number('Palet eni',d.palW||state.palletWidth,' mm');number('Palet derinliği',d.palD||state.palletDepth,' mm');
  number('Palet yüksekliği',d.palletHeight||state.palletHeight,' mm');number('Yük',d.palletWeight||state.palletWeight,' kg');
  if(d.footProfile||d.footType||state.footType)parts.push('Ayak: '+(d.footProfile||d.footType||state.footType));
  if(state.traverseType)parts.push('Travers: '+state.traverseType);
  if(state.rowType)parts.push(state.rowType==='double'?'Çift sıra':'Tek sıra');
  number('Tünel',state.tunnelHeight,' mm');
  for(const item of state.accessories||d.accessories||[]){
   const name=({tray:'Tava',hTraverse:'H travers',palletStop:'Palet dayama'})[item.type]||item.type;
   if(name)parts.push(name+(item.width?' '+item.width+' mm':'')+(item.levels?.length?' · Kat '+item.levels.join(', '):''));
  }
  return parts.join(' · ')||'Kayıtlı blok özellikleriyle aktarılır.';
 }
 const style=document.createElement('style');style.textContent=`
 #page#page[data-rafex-authority-mode="common"] .rafex-common-project-name-wrap{position:relative;z-index:110;flex-wrap:wrap!important;height:auto!important;max-height:none!important;overflow:visible!important;align-items:center!important;gap:8px!important}
 #page#page[data-rafex-authority-mode="common"] .rafex-common-project-name-field{flex:1 1 220px!important;width:auto!important;min-width:180px!important}
 #rafexProjectImportV155{position:relative;flex:0 1 300px;min-width:230px;margin-left:auto;font:12px Arial;color:#214f3b}
 #rafexProjectImportV155 summary{cursor:pointer;padding:10px;border:1px solid #a9c1b3;border-radius:7px;background:white;font-weight:bold}
 #rafexProjectImportV155 .project-import-panel{position:absolute;right:0;top:100%;z-index:100;width:min(420px,80vw);box-sizing:border-box;padding:12px;border:1px solid #a9c1b3;border-radius:8px;background:#fff;box-shadow:0 8px 24px #0002;display:grid;gap:8px}
 #rafexProjectImportV155 select{width:100%;min-width:0}#rafexProjectImportV155 .project-import-types{display:grid;gap:6px;max-height:230px;overflow:auto}
 #rafexProjectImportV155 .project-import-types label{display:flex;gap:8px;align-items:center;font:12px Arial}
 #rafexProjectImportV155 .project-import-type-text{display:grid;gap:5px;padding:8px 0;min-width:0}
 #rafexProjectImportV155 .project-import-type-text small{color:#53665b;overflow-wrap:anywhere}
 #rafexProjectImportV155 small{font:11px Arial;line-height:1.5}#rafexProjectImportV155 input[type=checkbox]{width:auto}
 `;document.head.appendChild(style);
 let frame=0;
 function install(){
  frame=0;if(!common())return;
  const wrap=document.querySelector('#page .rafex-common-project-name-wrap');if(!wrap||wrap.querySelector('#rafexProjectImportV155'))return;
  const root=document.createElement('details');root.id='rafexProjectImportV155';
  root.innerHTML='<summary>Eski projeden raf tipi kopyala</summary><div class="project-import-panel"><label>Kaynak proje<select aria-label="Kaynak proje"><option value="">Proje seç…</option></select></label><button type="button" data-refresh>Listeyi yenile</button><div class="project-import-types"></div><button type="button" data-copy disabled>Seçilen tipleri kopyala</button><small>Yalnızca seçilen raf tipleri bu projeye kopyalanır. Kaynak proje ve yerleşimi değişmez.</small><small role="status" aria-live="polite"></small></div>';
  wrap.appendChild(root);
  const select=root.querySelector('select'),list=root.querySelector('.project-import-types'),copy=root.querySelector('[data-copy]'),status=root.querySelector('[role=status]'),refresh=root.querySelector('[data-refresh]');
  let records=[],types=[],loaded=false,loading=false,owner=null;
  const active=()=>window.rafexProjectIdentityV133?.uuid;
  function choose(){
   owner=active();types=records.find(p=>String(p.id)===select.value)?.payload?.rackTypes||[];list.replaceChildren();
   types.forEach((type,i)=>{
    const label=document.createElement('label'),check=document.createElement('input'),text=document.createElement('span'),title=document.createElement('strong'),detail=document.createElement('small');
    check.type='checkbox';check.value=String(i);check.addEventListener('change',()=>copy.disabled=!list.querySelector('input:checked'));
    text.className='project-import-type-text';title.textContent=(type.name||'Raf')+' · '+systemName(type);detail.textContent=typeDetails(type);
    text.append(title,detail);label.append(check,text);list.append(label);
   });
   copy.disabled=true;status.textContent=select.value?(types.length?types.length+' raf tipi. Kopyalanacakları seç.':'Bu projede kayıtlı raf tipi yok.') : '';
  }
  async function load(){
   if(loading)return;loading=true;refresh.disabled=true;status.textContent='Projeler yükleniyor…';
   try{
    const result=await req('/api/projects',{cache:'no-store'});
    if(!Array.isArray(result?.projects))throw Error('Proje listesi alınamadı.');
    if(!root.isConnected)return;
    records=result.projects.filter(p=>Array.isArray(p.payload?.rackTypes)).sort((a,b)=>Number(b.serial_no||b.id)-Number(a.serial_no||a.id));
    select.replaceChildren(new Option('Proje seç…',''));
    records.forEach(p=>select.add(new Option('#'+(p.serial_no||p.id)+' · '+p.project_name,String(p.id))));
    loaded=true;choose();status.textContent=records.length?'Kaynak projeyi seç.':'Kayıtlı raf tipi içeren proje bulunamadı.';
   }catch(error){status.textContent=error.message||'Liste yüklenemedi. Yeniden deneyebilirsin.';}
   finally{loading=false;refresh.disabled=false;}
  }
  root.addEventListener('toggle',()=>{if(root.open){if(owner!==active()){select.value='';choose();}if(!loaded)load();}});
  refresh.addEventListener('click',load);select.addEventListener('change',choose);
  copy.addEventListener('click',()=>{
   if(!active()||!Array.isArray(window.rafexProjectTypesV133)){status.textContent='Önce proje adını yazıp Yeni proje aç düğmesine bas.';return;}
   if(owner!==active()){choose();status.textContent='Proje değişti. Tipleri yeniden seç.';return;}
   const selected=[...list.querySelectorAll('input:checked')].map(n=>types[Number(n.value)]);if(!selected.length)return;
   try{
    const copied=window.rafexIndependentProjectV133({payload:{rackTypes:selected,layout:{racks:[]}}},crypto.randomUUID(),Date.now()).payload.rackTypes;
    copied.forEach(e=>{delete e.registryKey;delete e.__rafexApi;});
    const current=window.rafexProjectTypesV133,merged=window.rafexMergeRackCatalog(current,copied);
    const added=merged.entries.length-current.length;
    window.rafexProjectTypesV133=merged.entries;
    window.rafexUnifiedCatalogSync();m2RenderSavedRackTypes();
    list.querySelectorAll('input').forEach(n=>n.checked=false);copy.disabled=true;
    status.textContent=added+' raf tipi kopyalandı. Kaynak değişmedi.'+(added<selected.length?' Aynı tipler tekrar eklenmedi.':'');
   }catch(error){status.textContent='Kopyalanamadı: '+error.message;}
  });
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(install);}
 const page=document.getElementById('page');if(page)new MutationObserver(schedule).observe(page,{childList:true});
 window.addEventListener('rafex-authority-state',schedule);
 document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,.rafex-system-option,#rafexNewProjectV133')){schedule();setTimeout(schedule,250);}});
 schedule();
})();
