import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* single-rack-type-v563 */'))return html;
 const anchor='  function applyReplacement(target, source) {';
 if(!html.includes(anchor))throw Error('563 replacement helpers missing');
 html=html.replace(anchor,`  window.rafexReplaceSingleRack563=function(rackId,sourceKey){
    if(window.rafexCanEditProjectV134?.()===false)throw Error('Bu proje değiştirilemiyor.');
    const types=window.rafexProjectTypesV133||m2SavedRackTypes,source=types.find(e=>key(e)===sourceKey);
    if(!source||system(source)!=='b2b')throw Error('Kayıtlı B2B tipi bulunamadı.');
    const oldAreas=window.rafexAreaDocument?.(),owner=window.rafexProjectIdentityV133?.uuid;if(!oldAreas)throw Error('Proje alanları hazır değil.');
    const next=clone(oldAreas),area=next.areas.find(a=>a.id===next.activeAreaId),rack=area?.layout.racks.find(r=>r.id===rackId);
    if(!rack||system(rack)!=='b2b')throw Error('Seçilen B2B blok bulunamadı.');
    const drawing=m2B2BRecordV108(clone(source.__rafexSnapshot||source.drawing));
    const changed=new Set([rackId]),previous=oldAreas.areas.find(a=>a.id===area.id).layout;
    const replacement=replaceRack(rack,drawing,source,Number(area.layout.scale)||.04);replacement.blockName='';
    area.layout.racks=area.layout.racks.map(r=>r.id===rackId?replacement:r);
    reflowJoinedArea(area,previous,changed);validateReplacementArea(area,previous,changed);
    const history=m2UndoHistory.slice(),undo={label:'Blok tipini '+source.name+' yap',replaceTypeV319:{owner,areas:oldAreas,types:clone(types),excluded:clone(window.rafexProjectIdentityV133?.excludedRackTypes||[])}};
    window.rafexReplaceAreaDocumentV319(next,owner);m2UndoHistory=[...history,undo].slice(-30);m2UpdateUndoButton();
    m2LayoutState.selected=rackId;window.__rafexFreeOutputDirty=true;m2RenderLayout();m2RefreshActiveReport?.();
    status('Seçilen blok '+source.name+' tipine dönüştürüldü.');return replacement;
  };
`+anchor);
 const code=`/* single-rack-type-v563 */(()=>{
 const labels=()=>{const l=document.getElementById('programLanguage')?.value;return l==='en'?['Change type','Keep current type','Only this block will use all properties of the selected type.']:l==='fr'?['Changer de type','Conserver le type actuel','Seul ce bloc utilisera toutes les propriétés du type sélectionné.']:['Tipini Değiştir','Mevcut tipi koru','Yalnızca bu blok, seçilen tipin tüm özelliklerini kullanır.'];};
 const isB2B=r=>Boolean(r?.b2b&&!r.b2b.mr&&r.b2bLayout);
 function selected(){if(!isB2B(m2LayoutState.racks.find(r=>r.id===m2CustomizeRackId)))return null;const field=document.getElementById('rafexSingleRackType563');return field&&!field.closest('[hidden]')&&field.value?field.value:null;}
 function entry(){const value=selected();return value&&(window.rafexProjectTypesV133||m2SavedRackTypes).find(e=>'b2b:'+e.id===value);}
 function decorate(){const modal=document.getElementById('m2CustomizeModal'),rack=m2LayoutState.racks.find(r=>r.id===m2CustomizeRackId);if(!modal||modal.hidden||!isB2B(rack))return;
  let wrap=modal.querySelector('[data-single-type563]');if(wrap&&wrap.dataset.rackId===String(rack.id))return;if(!wrap){wrap=document.createElement('label');wrap.dataset.singleType563='';wrap.style.cssText='display:grid;gap:7px;padding:12px;border:1px solid #a6c8b5;border-radius:8px;background:#edf6f0;margin-bottom:14px';wrap.innerHTML='<b></b><select id="rafexSingleRackType563" aria-label="Tipini Değiştir"></select><small></small>';modal.querySelector('aside').prepend(wrap);wrap.querySelector('select').addEventListener('change',()=>m2PreviewRackCustomization());}
  wrap.dataset.rackId=String(rack.id);const text=labels();wrap.querySelector('b').textContent=text[0];wrap.querySelector('small').textContent=text[2];const select=wrap.querySelector('select');select.setAttribute('aria-label',text[0]);select.replaceChildren();const keep=document.createElement('option');keep.value='';keep.textContent=text[1];select.append(keep);
  for(const e of window.rafexProjectTypesV133||m2SavedRackTypes){const d=e.__rafexSnapshot||e.drawing;if((e.__rafexSystem||e.system||d?.rafexSystem||(d?.b2b&&!d.b2b.mr?'b2b':''))!=='b2b'||!d?.b2b||d.b2b.mr)continue;const o=document.createElement('option');o.value='b2b:'+e.id;o.textContent=e.name;select.append(o);}
 }
 const open=m2OpenCustomizeModal;m2OpenCustomizeModal=window.m2OpenCustomizeModal=function(){const result=open.apply(this,arguments);decorate();return result;};
 const preview=m2PreviewRackCustomization;m2PreviewRackCustomization=window.m2PreviewRackCustomization=function(){const e=entry();if(e){const d=m2B2BRecordV108(structuredClone(e.__rafexSnapshot||e.drawing));return window.RafexB2BViewer?.update(m2Rack3DOptions(d));}return preview.apply(this,arguments);};
 const apply=m2ApplyRackCustomization;m2ApplyRackCustomization=window.m2ApplyRackCustomization=function(){const value=selected();if(!value)return apply.apply(this,arguments);try{window.rafexReplaceSingleRack563(m2CustomizeRackId,value);m2CloseCustomizeModal();}catch(error){alert(error.message||'Tip değiştirilemedi.');}};
 let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate();});}
 new MutationObserver(records=>{if(records.some(r=>r.target.id==='m2CustomizeModal'||r.target.id==='page'))schedule();}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
 document.addEventListener('click',event=>{const button=event.target.closest?.('#m2CustomizeModal .m2-customize-actions button');if(!button||!String(button.getAttribute('onclick')).includes('m2ApplyRackCustomization')||!selected())return;event.preventDefault();event.stopImmediatePropagation();try{window.rafexReplaceSingleRack563(m2CustomizeRackId,selected());m2CloseCustomizeModal();}catch(error){alert(error.message||'Tip değiştirilemedi.');}},true);
})();`;
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+'<script>'+code+'</script>'+html.slice(at);
}
if(/[\\/]single-rack-type-v563\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('HTML missing');s=s.replace(m[0],m[0].replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64')));}fs.writeFileSync(file,s);
}



