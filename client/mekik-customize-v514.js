(function(){
 const api=window.rafexMekikCustomizeV514={},clone=v=>JSON.parse(JSON.stringify(v)),el=id=>document.getElementById(id),fmt=n=>Number(n).toLocaleString('tr-TR'),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let current=null,modal=null,viewer=null,timer=0,token=0,before=null;api.nativeRequest=0;
 api.close=()=>{api.nativeRequest++;clearTimeout(timer);token++;viewer?.dispose();viewer=null;current=null;};
 api.init=(rack,host)=>{
  api.close();modal=host;modal.querySelectorAll('[data-step514]').forEach(n=>n.remove());modal.classList.toggle('mekik-step514',!!rack&&rack.rafexSystem!=='drive'&&rack.systemType!=='drive');
  current=rack;before=clone(rack);if(!modal.classList.contains('mekik-step514'))return;
  const c=rack.mekikCustomizationV514||{},fields=modal.querySelector('.rsv115-fields');
  fields.insertAdjacentHTML('beforeend','<section data-step514><label>Ayak boyu<select id="mekikHeightMode514"><option value="auto">Otomatik</option><option value="manual">Manuel</option></select><input id="mekikHeight514" aria-label="Manuel ayak boyu (mm)" type="number" min="1" step="50"></label><label><input id="mekikShowPallets514" type="checkbox"> Paletleri göster</label><p>Kısa katlar arkadaki son palet yerlerini kullanır. Katlar aşağıdan yukarıya sıralanır.</p><div id="mekikDepths514"></div><details><summary>Ayakları ayrı düzenle · girişten arkaya</summary><div id="mekikFrames514"></div></details><p id="mekikSummary514" role="status"></p></section>');
  el('mekikHeightMode514').value=c.heightMode||rack.mekikUprightMode||'auto';el('mekikHeight514').value=c.uprightHeight||rack.sideUprightHeight||5000;el('mekikShowPallets514').checked=rack.showPallets!==false;
  fields.querySelector('[data-step514]').addEventListener('input',()=>api.render(api.draft(current,{...current,levels:Number(el('rsv115Levels').value)||1,palletHeight:Number(el('rsv115Pallet').value)||1200})));
  modal.querySelector('.rsv115-live').innerHTML='<div class="step514-tools"><button type="button" data-view514="perspective">3D</button><button type="button" data-view514="front">Önden</button><button type="button" data-view514="side">Yandan</button></div><div id="mekikCanvas514" style="position:relative;height:440px"></div><div id="mekikTechnical514"></div>';
  modal.querySelectorAll('[data-view514]').forEach(b=>b.onclick=()=>{const mode=b.dataset.view514,technical=el('mekikTechnical514');el('mekikCanvas514').hidden=mode!=='perspective';technical.hidden=mode==='perspective';technical.dataset.mode=mode;technical.querySelectorAll('[data-native-view]').forEach(n=>n.hidden=n.dataset.nativeView!==mode);api.render(api.draft(current,{...current,levels:Number(el('rsv115Levels').value)||1,palletHeight:Number(el('rsv115Pallet').value)||1200}));});
  el('mekikTechnical514').hidden=true;
  fields.addEventListener('change',e=>{if(e.target.matches('#mekikHeight514,[data-frame-height]')&&Number(e.target.value)>0)e.target.value=Math.ceil(Number(e.target.value)/50)*50;});
 };
 api.draft=(rack,d)=>{
  if(!current||rack.id!==current.id||!modal.classList.contains('mekik-step514'))return d;
  const c=rack.mekikCustomizationV514||{},depths=[...document.querySelectorAll('#mekikDepths514 input')],frames=[...document.querySelectorAll('#mekikFrames514 section')];
  d.mekikCustomizationV514={version:514,anchor:'rear',heightMode:el('mekikHeightMode514').value,uprightHeight:Number(el('mekikHeight514').value),depths:Array.from({length:d.levels},(_,i)=>Number(depths[i]?.value??c.depths?.[i]??rack.depth)),frameLevels:frames.length?frames.map(f=>f.querySelector('[data-frame-level]').value===''?null:Number(f.querySelector('[data-frame-level]').value)):(c.frameLevels||[]),frameHeights:frames.length?frames.map(f=>Number(f.querySelector('[data-frame-height]').value)||0):(c.frameHeights||[])};
  d.showPallets=el('mekikShowPallets514').checked;return d;
 };
 api.render=d=>{
  if(!current||!modal.classList.contains('mekik-step514'))return false;const s=window.rafexMekikSteppedV514(d);if(!s)return false;
  const depths=el('mekikDepths514');if(depths.childElementCount!==s.levels)depths.innerHTML=s.floors.map(f=>'<label>K'+(f.index+1)+' · palet derinliği<input type="number" min="1" max="'+s.depth+'" value="'+f.count+'"></label>').join('');
  [...depths.querySelectorAll('input')].forEach((input,i)=>{input.max=i?s.floors[i-1].count:s.depth;input.value=s.floors[i].count;});
  const frames=el('mekikFrames514');if(frames.childElementCount!==s.frames.length)frames.innerHTML=s.frames.map(f=>'<section><b>'+(f.index+1)+'. ayak</b><label>En fazla kat<input data-frame-level type="number" min="1" max="'+s.levels+'" placeholder="Tümü" value="'+(d.mekikCustomizationV514.frameLevels?.[f.index]||'')+'"></label><label>Ayak boyu · mm<input data-frame-height type="number" step="50" min="'+f.minimum+'" placeholder="Otomatik: '+f.height+'" value="'+(d.mekikCustomizationV514.frameHeights?.[f.index]||'')+'"></label></section>').join('');
  frames.querySelectorAll('[data-frame-level]').forEach(input=>input.max=s.levels);
  el('mekikHeight514').disabled=el('mekikHeightMode514').value!=='manual';el('mekikHeight514').min=s.minimum;if(el('mekikHeight514').disabled)el('mekikHeight514').value=s.automatic;
  el('mekikSummary514').textContent=s.errors.length?s.errors.join(' '):fmt(s.capacity)+' palet · Ayak: '+fmt(s.height)+' mm';el('mekikSummary514').style.color=s.errors.length?'#a22336':'#214f3b';
  clearTimeout(timer);const request=++token;timer=setTimeout(async()=>{const host=el('mekikCanvas514');if(!host||modal.hidden||request!==token)return;  const nativeDraft={...d,sideUprightHeight:s.height,totalRackHeight:s.height};
  if(!el('mekikTechnical514').hidden){viewer?.dispose();viewer=null;const nativeRequest=++api.nativeRequest;Promise.resolve(window.rafexCaptureTechnicalViews?.(nativeDraft,'mekik2')).then(views=>{if(!views||nativeRequest!==api.nativeRequest||modal.hidden)return;const host=el('mekikTechnical514'),mode=host.dataset.mode||'front';host.innerHTML=['front','side'].map(v=>'<img data-native-view="'+v+'" '+(mode!==v?'hidden':'')+' style="width:100%;height:auto" alt="'+(v==='front'?'Önden görünüş':'Yandan görünüş')+'" src="'+esc(views[v])+'">').join('');}).catch(e=>{if(nativeRequest===api.nativeRequest)el('mekikTechnical514').textContent='Görünüş hazırlanamadı: '+e.message;});return;}
viewer?.dispose();viewer=null;host.textContent='3D hazırlanıyor…';try{if(!window.rafexLayout3D?.previewRack)throw Error('3D modülü henüz yüklenmedi.');const created=await window.rafexLayout3D.previewRack(host,d);if(request!==token||modal.hidden){created.dispose();return;}viewer=created;viewer.loads(d.showPallets!==false);}catch(e){if(request===token)host.textContent='3D önizleme açılamadı: '+e.message;}},200);
  return true;
 };
 api.save=(rack,d)=>{if(!current||current.id!==rack.id||!d.mekikCustomizationV514)return true;d.mekikCustomizationV514.uprightHeight=Math.ceil(Number(d.mekikCustomizationV514.uprightHeight)/50)*50;d.mekikCustomizationV514.frameHeights=(d.mekikCustomizationV514.frameHeights||[]).map(h=>h?Math.ceil(h/50)*50:0);const s=window.rafexMekikSteppedV514(d);if(s.errors.length){el('mekikSummary514').textContent=s.errors.join(' ');return false;}d.sideUprightHeight=s.height;d.totalRackHeight=s.height;d.mekikUprightMode=d.mekikCustomizationV514.heightMode;d.mekikManualUprightHeight=s.height;return true;};
 api.commit=(rack,d)=>{
  if(!before||before.id!==rack.id)return;
  if(d.mekikCustomizationV514)Object.assign(rack,{mekikCustomizationV514:clone(d.mekikCustomizationV514),sideUprightHeight:d.sideUprightHeight,totalRackHeight:d.totalRackHeight,mekikUprightMode:d.mekikUprightMode,mekikManualUprightHeight:d.mekikManualUprightHeight,showPallets:d.showPallets});
  const signature=r=>JSON.stringify([r.mekikCustomizationV514,r.levels,r.palletHeight,r.showPallets,r.blockName,r.typeName]);
  if(signature(before)===signature(rack))return;
  delete rack.rackDetail;
  if(window.confirm('Blok adı değiştirilsin mi? Tamam: yeni blok adı oluştur. İptal: mevcut blok adını koru.')){const system=rack.rafexSystem==='drive'||rack.systemType==='drive'?'drive':'mekik2';window.rafexCommitCustomTypeV184?.(rack,{id:-Date.now(),name:rack.typeName||system,system,__rafexSystem:system,drawing:clone(rack)},before);}
  else{rack.blockName=before.blockName;rack.typeName=before.typeName;}
 };
})();
