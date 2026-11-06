(function(){
 const api=window.rafexDriveCustomizeV521={},clone=v=>JSON.parse(JSON.stringify(v)),el=id=>document.getElementById(id),fmt=n=>Number(n).toLocaleString('tr-TR'),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let current=null,modal=null,viewer=null,timer=0,token=0,before=null;api.nativeRequest=0;
 api.close=()=>{api.nativeRequest++;clearTimeout(timer);token++;viewer?.dispose();viewer=null;current=null;};
 api.init=(rack,host)=>{
  api.close();modal=host;modal.querySelectorAll('[data-step521]').forEach(n=>n.remove());modal.classList.toggle('drive-step521',!!rack&&(rack.rafexSystem==='drive'||rack.systemType==='drive'));
  current=rack;before=clone(rack);if(!modal.classList.contains('drive-step521'))return;
  const c=rack.driveCustomizationV521||{},fields=modal.querySelector('.rsv115-fields');
  fields.insertAdjacentHTML('beforeend','<section data-step521><label>Ayak boyu<select id="driveHeightMode521"><option value="auto">Otomatik</option><option value="manual">Manuel</option></select><input id="driveHeight521" aria-label="Manuel ayak boyu (mm)" type="number" min="1" step="50"></label><label><input id="driveShowPallets521" type="checkbox"> Paletleri göster</label><p>Kısa katlar arkadaki son palet yerlerini kullanır. Katlar aşağıdan yukarıya sıralanır.</p><div id="driveDepths521"></div><details><summary>Ayakları ayrı düzenle · girişten arkaya</summary><div id="driveFrames521"></div></details><p id="driveSummary521" role="status"></p></section>');
  el('driveHeightMode521').value=c.heightMode||rack.driveUprightMode||'auto';el('driveHeight521').value=c.uprightHeight||rack.sideUprightHeight||5000;el('driveShowPallets521').checked=rack.showPallets!==false;
  fields.querySelector('[data-step521]').addEventListener('input',()=>api.render(api.draft(current,{...current,levels:Number(el('rsv115Levels').value)||1,palletHeight:Number(el('rsv115Pallet').value)||1200})));
  modal.querySelector('.rsv115-live').innerHTML='<div class="step521-tools"><button type="button" data-view521="perspective">3D</button><button type="button" data-view521="front">Önden</button><button type="button" data-view521="side">Yandan</button></div><div id="driveCanvas521" style="position:relative;height:440px"></div><div id="driveTechnical521"></div>';
  modal.querySelectorAll('[data-view521]').forEach(b=>b.onclick=()=>{const mode=b.dataset.view521,technical=el('driveTechnical521');el('driveCanvas521').hidden=mode!=='perspective';technical.hidden=mode==='perspective';technical.dataset.mode=mode;technical.querySelectorAll('[data-native-view]').forEach(n=>n.hidden=n.dataset.nativeView!==mode);api.render(api.draft(current,{...current,levels:Number(el('rsv115Levels').value)||1,palletHeight:Number(el('rsv115Pallet').value)||1200}));});
  el('driveTechnical521').hidden=true;
  if(!fields.dataset.driveHeightChange521){fields.dataset.driveHeightChange521='1';fields.addEventListener('change',e=>{if(e.target.matches('#driveHeight521,[data-frame-height]')&&Number(e.target.value)>0)e.target.value=Math.ceil(Number(e.target.value)/50)*50;});}
 };
 api.draft=(rack,d)=>{
  if(!current||rack.id!==current.id||!modal.classList.contains('drive-step521'))return d;
  const c=rack.driveCustomizationV521||{},depths=[...document.querySelectorAll('#driveDepths521 input')],frames=[...document.querySelectorAll('#driveFrames521 section')];
  d.driveCustomizationV521={version:521,anchor:'rear',heightMode:el('driveHeightMode521').value,uprightHeight:Number(el('driveHeight521').value),depths:Array.from({length:d.levels},(_,i)=>Number(depths[i]?.value??c.depths?.[i]??rack.depth)),frameLevels:frames.length?frames.map(f=>f.querySelector('[data-frame-level]').value===''?null:Number(f.querySelector('[data-frame-level]').value)):(c.frameLevels||[]),frameHeights:frames.length?frames.map(f=>Number(f.querySelector('[data-frame-height]').value)||0):(c.frameHeights||[])};
  d.showPallets=el('driveShowPallets521').checked;return d;
 };
 api.render=d=>{
  if(!current||!modal.classList.contains('drive-step521'))return false;const s=window.rafexDriveSteppedV521(d);if(!s)return false;
  const depths=el('driveDepths521');if(depths.childElementCount!==s.levels)depths.innerHTML=s.floors.map(f=>'<label>K'+(f.index+1)+' · palet derinliği<input type="number" min="1" max="'+s.depth+'" value="'+f.count+'"></label>').join('');
  [...depths.querySelectorAll('input')].forEach((input,i)=>{input.max=i?s.floors[i-1].count:s.depth;input.value=s.floors[i].count;});
  const frames=el('driveFrames521');if(frames.childElementCount!==s.frames.length)frames.innerHTML=s.frames.map(f=>'<section><b>'+(f.index+1)+'. ayak</b><label>En fazla kat<input data-frame-level type="number" min="1" max="'+s.levels+'" placeholder="Tümü" value="'+(d.driveCustomizationV521.frameLevels?.[f.index]||'')+'"></label><label>Ayak boyu · mm<input data-frame-height type="number" step="50" min="'+f.minimum+'" placeholder="Otomatik: '+f.height+'" value="'+(d.driveCustomizationV521.frameHeights?.[f.index]||'')+'"></label></section>').join('');
  frames.querySelectorAll('[data-frame-level]').forEach(input=>input.max=s.levels);
  el('driveHeight521').disabled=el('driveHeightMode521').value!=='manual';el('driveHeight521').min=s.minimum;if(el('driveHeight521').disabled)el('driveHeight521').value=s.automatic;
  el('driveSummary521').textContent=s.errors.length?s.errors.join(' '):fmt(s.capacity)+' palet · Ayak: '+fmt(s.height)+' mm';el('driveSummary521').style.color=s.errors.length?'#a22336':'#214f3b';
  clearTimeout(timer);const request=++token;timer=setTimeout(async()=>{const host=el('driveCanvas521');if(!host||modal.hidden||request!==token)return;  const nativeDraft={...d,sideUprightHeight:s.height,totalRackHeight:s.height};
  if(!el('driveTechnical521').hidden){viewer?.dispose();viewer=null;const nativeRequest=++api.nativeRequest;Promise.resolve(window.rafexCaptureTechnicalViews?.(nativeDraft,'drive')).then(views=>{if(!views||nativeRequest!==api.nativeRequest||modal.hidden)return;const host=el('driveTechnical521'),mode=host.dataset.mode||'front';host.innerHTML=['front','side'].map(v=>'<img data-native-view="'+v+'" '+(mode!==v?'hidden':'')+' style="width:100%;height:auto" alt="'+(v==='front'?'Önden görünüş':'Yandan görünüş')+'" src="'+esc(views[v])+'">').join('');}).catch(e=>{if(nativeRequest===api.nativeRequest)el('driveTechnical521').textContent='Görünüş hazırlanamadı: '+e.message;});return;}
viewer?.dispose();viewer=null;host.textContent='3D hazırlanıyor…';try{if(!window.rafexLayout3D?.previewRack)throw Error('3D modülü henüz yüklenmedi.');const created=await window.rafexLayout3D.previewRack(host,d);if(request!==token||modal.hidden){created.dispose();return;}viewer=created;viewer.loads(d.showPallets!==false);}catch(e){if(request===token)host.textContent='3D önizleme açılamadı: '+e.message;}},200);
  return true;
 };
 api.save=(rack,d)=>{if(!current||current.id!==rack.id||!d.driveCustomizationV521)return true;d.driveCustomizationV521.uprightHeight=Math.ceil(Number(d.driveCustomizationV521.uprightHeight)/50)*50;d.driveCustomizationV521.frameHeights=(d.driveCustomizationV521.frameHeights||[]).map(h=>h?Math.ceil(h/50)*50:0);const s=window.rafexDriveSteppedV521(d);if(s.errors.length){el('driveSummary521').textContent=s.errors.join(' ');return false;}d.sideUprightHeight=s.height;d.totalRackHeight=s.height;d.driveUprightMode=d.driveCustomizationV521.heightMode;d.driveManualUprightHeight=s.height;return true;};
 api.commit=(rack,d)=>{
  if(!before||before.id!==rack.id)return;
  if(d.driveCustomizationV521)Object.assign(rack,{driveCustomizationV521:clone(d.driveCustomizationV521),sideUprightHeight:d.sideUprightHeight,totalRackHeight:d.totalRackHeight,driveUprightMode:d.driveUprightMode,driveManualUprightHeight:d.driveManualUprightHeight,showPallets:d.showPallets});
  const signature=r=>JSON.stringify([r.driveCustomizationV521,r.levels,r.palletHeight,r.showPallets,r.blockName,r.typeName]);
  if(signature(before)===signature(rack))return;
  delete rack.rackDetail;
  if(window.confirm('Blok adı değiştirilsin mi? Tamam: yeni blok adı oluştur. İptal: mevcut blok adını koru.')){const system='drive';window.rafexCommitCustomTypeV184?.(rack,{id:-Date.now(),name:rack.typeName||system,system,__rafexSystem:system,drawing:clone(rack)},before);}
  else{rack.blockName=before.blockName;rack.typeName=before.typeName;}
 };
})();

(function(){const base=window.rafexMekikCustomizeV514,drive=window.rafexDriveCustomizeV521;const isDrive=r=>r?.rafexSystem==='drive'||r?.systemType==='drive';window.rafexMekikCustomizeV514={close(){base.close();drive.close()},init(r,host){base.close();drive.close();host.classList.remove('mekik-step514','drive-step521');return (isDrive(r)?drive:base).init(r,host)},draft(r,d){return (isDrive(r)?drive:base).draft(r,d)},render(d){return (isDrive(d)?drive:base).render(d)},save(r,d){return (isDrive(r)?drive:base).save(r,d)},commit(r,d){return (isDrive(r)?drive:base).commit(r,d)}};})();
