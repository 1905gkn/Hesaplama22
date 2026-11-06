(function(){
 const api=window.rafexMekikCustomizeV514={},clone=v=>JSON.parse(JSON.stringify(v)),el=id=>document.getElementById(id),fmt=n=>Number(n).toLocaleString('tr-TR'),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let current=null,modal=null,viewer=null,timer=0,token=0,before=null;
 api.close=()=>{clearTimeout(timer);token++;viewer?.dispose();viewer=null;current=null;};
 api.init=(rack,host)=>{
  api.close();modal=host;modal.querySelectorAll('[data-step514]').forEach(n=>n.remove());modal.classList.toggle('mekik-step514',!!rack&&rack.rafexSystem!=='drive'&&rack.systemType!=='drive');
  if(!modal.classList.contains('mekik-step514'))return;
  current=rack;before=clone(rack);const c=rack.mekikCustomizationV514||{},fields=modal.querySelector('.rsv115-fields');
  fields.insertAdjacentHTML('beforeend','<section data-step514><label>Ayak boyu<select id="mekikHeightMode514"><option value="auto">Otomatik</option><option value="manual">Manuel</option></select><input id="mekikHeight514" aria-label="Manuel ayak boyu (mm)" type="number" min="1" step="10"></label><label><input id="mekikShowPallets514" type="checkbox"> Paletleri göster</label><p>Kısa katlar arkadaki son palet yerlerini kullanır. Katlar aşağıdan yukarıya sıralanır.</p><div id="mekikDepths514"></div><details><summary>Ayakları ayrı düzenle · girişten arkaya</summary><div id="mekikFrames514"></div></details><p id="mekikSummary514" role="status"></p></section>');
  el('mekikHeightMode514').value=c.heightMode||rack.mekikUprightMode||'auto';el('mekikHeight514').value=c.uprightHeight||rack.sideUprightHeight||5000;el('mekikShowPallets514').checked=rack.showPallets!==false;
  fields.querySelector('[data-step514]').addEventListener('input',()=>api.render(api.draft(current,{...current,levels:Number(el('rsv115Levels').value)||1,palletHeight:Number(el('rsv115Pallet').value)||1200})));
  modal.querySelector('.rsv115-live').innerHTML='<div class="step514-tools"><button type="button" data-view514="perspective">3D</button><button type="button" data-view514="front">Önden</button><button type="button" data-view514="side">Yandan</button></div><div id="mekikCanvas514" style="position:relative;height:440px"></div><div id="mekikTechnical514"></div>';
  modal.querySelectorAll('[data-view514]').forEach(b=>b.onclick=()=>b.dataset.view514==='perspective'?viewer?.fit():viewer?.view(b.dataset.view514));
 };
 api.draft=(rack,d)=>{
  if(!current||rack.id!==current.id)return d;
  const c=rack.mekikCustomizationV514||{},depths=[...document.querySelectorAll('#mekikDepths514 input')],frames=[...document.querySelectorAll('#mekikFrames514 section')];
  d.mekikCustomizationV514={version:514,anchor:'rear',heightMode:el('mekikHeightMode514').value,uprightHeight:Number(el('mekikHeight514').value),depths:Array.from({length:d.levels},(_,i)=>Number(depths[i]?.value??c.depths?.[i]??rack.depth)),frameLevels:frames.length?frames.map(f=>f.querySelector('[data-frame-level]').value===''?null:Number(f.querySelector('[data-frame-level]').value)):(c.frameLevels||[]),frameHeights:frames.length?frames.map(f=>Number(f.querySelector('[data-frame-height]').value)||0):(c.frameHeights||[])};
  d.showPallets=el('mekikShowPallets514').checked;return d;
 };
 api.render=d=>{
  if(!current)return false;const s=window.rafexMekikSteppedV514(d);if(!s)return false;
  const depths=el('mekikDepths514');if(depths.childElementCount!==s.levels)depths.innerHTML=s.floors.map(f=>'<label>K'+(f.index+1)+' · palet derinliği<input type="number" min="1" max="'+s.depth+'" value="'+f.count+'"></label>').join('');
  [...depths.querySelectorAll('input')].forEach((input,i)=>{input.max=i?s.floors[i-1].count:s.depth;input.value=s.floors[i].count;});
  const frames=el('mekikFrames514');if(frames.childElementCount!==s.frames.length)frames.innerHTML=s.frames.map(f=>'<section><b>'+(f.index+1)+'. ayak</b><label>En fazla kat<input data-frame-level type="number" min="1" max="'+s.levels+'" placeholder="Tümü" value="'+(d.mekikCustomizationV514.frameLevels?.[f.index]||'')+'"></label><label>Ayak boyu · mm<input data-frame-height type="number" min="'+f.minimum+'" placeholder="Otomatik: '+f.height+'" value="'+(d.mekikCustomizationV514.frameHeights?.[f.index]||'')+'"></label></section>').join('');
  frames.querySelectorAll('[data-frame-level]').forEach(input=>input.max=s.levels);
  el('mekikHeight514').disabled=el('mekikHeightMode514').value!=='manual';el('mekikHeight514').min=s.minimum;if(el('mekikHeight514').disabled)el('mekikHeight514').value=s.automatic;
  el('mekikSummary514').textContent=s.errors.length?s.errors.join(' '):fmt(s.capacity)+' palet · Ayak: '+fmt(s.height)+' mm';el('mekikSummary514').style.color=s.errors.length?'#a22336':'#214f3b';
  el('mekikTechnical514').innerHTML=window.rafexMekikSteppedSvgV514(d,'side');
  clearTimeout(timer);const request=++token;timer=setTimeout(async()=>{const host=el('mekikCanvas514');if(!host||modal.hidden||request!==token)return;viewer?.dispose();viewer=null;host.textContent='3D hazırlanıyor…';try{if(!window.rafexLayout3D?.previewRack)throw Error('3D modülü henüz yüklenmedi.');const created=await window.rafexLayout3D.previewRack(host,d);if(request!==token||modal.hidden){created.dispose();return;}viewer=created;viewer.loads(d.showPallets!==false);}catch(e){if(request===token)host.textContent='3D önizleme açılamadı: '+e.message;}},200);
  return true;
 };
 api.save=(rack,d)=>{if(!current||current.id!==rack.id)return true;const s=window.rafexMekikSteppedV514(d);if(s.errors.length){el('mekikSummary514').textContent=s.errors.join(' ');return false;}d.sideUprightHeight=s.height;d.totalRackHeight=s.height;d.mekikUprightMode=d.mekikCustomizationV514.heightMode;d.mekikManualUprightHeight=s.height;return true;};
 api.commit=(rack,d)=>{if(!d.mekikCustomizationV514)return;Object.assign(rack,{mekikCustomizationV514:clone(d.mekikCustomizationV514),sideUprightHeight:d.sideUprightHeight,totalRackHeight:d.totalRackHeight,mekikUprightMode:d.mekikUprightMode,mekikManualUprightHeight:d.mekikManualUprightHeight,showPallets:d.showPallets});delete rack.rackDetail;
  if(JSON.stringify([before?.mekikCustomizationV514,before?.levels,before?.palletHeight,before?.showPallets])!==JSON.stringify([rack.mekikCustomizationV514,rack.levels,rack.palletHeight,rack.showPallets]))window.rafexCommitCustomTypeV184?.(rack,{id:-Date.now(),name:rack.typeName||'Mekik',system:'mekik2',__rafexSystem:'mekik2',drawing:clone(rack)},before);
 };
 window.rafexMekikSteppedSvgV514=(r,mode)=>{
  const s=window.rafexMekikSteppedV514(r);if(!s)return '';const front=mode==='front',h=Math.max(s.height,...s.frames.map(f=>f.height),...s.floors.map(f=>f.y+Number(r.palletHeight||1200))),w=front?(Number(r.totalWidth||r.widthMm)/Number(r.bays))*Math.min(5,Number(r.bays)):Number(r.railLength||r.depthMm),scale=Math.min(880/w,550/h),x=100,y=620,H=v=>y-v*scale,X=v=>x+v*scale;
  let out='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 700" role="img" aria-label="Mekik kademeli '+(front?'ön':'yan')+' görünüş"><rect width="1100" height="700" fill="white"/><g font-family="Arial" fill="#214f3b"><text x="550" y="24" text-anchor="middle" font-size="18">'+(front?'ÖNDEN GÖRÜNÜŞ':'YANDAN GÖRÜNÜŞ · GİRİŞ → ARKA')+'</text>';
  const footColor=r.mekikFootColor==='pgv'?'#aeb8bd':r.mekikFootColor==='ral5015'?'#287ab5':'#005078',beamColor=r.mekikTraverseColor==='pgv'?'#aeb8bd':'#e5bd00',rect=(a,b,c,d,fill)=>'<rect x="'+a+'" y="'+b+'" width="'+Math.max(1,c)+'" height="'+Math.max(1,d)+'" fill="'+fill+'"/>';
  if(front){const bays=Math.min(5,Number(r.bays)),pitch=w/bays;for(let i=0;i<=bays;i++)out+=rect(X(i*pitch),H(s.height),5,s.height*scale,footColor);for(const f of s.floors){out+=rect(x,H(f.y),w*scale,4,beamColor);if(r.showPallets!==false)for(let i=0;i<bays;i++)out+=rect(X(i*pitch+pitch*.12),H(f.y+Number(r.palletHeight)),pitch*.76*scale,Number(r.palletHeight)*scale,'#d6b47b');}}
  else{for(const f of s.frames){for(const pos of [f.start,f.end])out+=rect(X(pos),H(f.height),4,f.height*scale,footColor);out+='<text x="'+X((f.start+f.end)/2)+'" y="'+(H(f.height)-10)+'" text-anchor="middle" font-size="13">'+fmt(f.height)+' mm</text>';for(let by=200;by<f.height-150;by+=600)out+='<path d="M '+X(f.start)+' '+H(by)+' L '+X(f.end)+' '+H(Math.min(by+600,f.height-150))+'" stroke="#aeb8bd" stroke-width="2"/>';}
   for(const f of s.floors){for(const run of f.runs)out+=rect(X(run.start),H(f.y), (run.end-run.start)*scale,4,'#9ba7ad');if(r.showPallets!==false)for(const p of f.positions)out+=rect(X(p),H(f.y+Number(r.palletHeight)),Number(r.palD)*scale-2,Number(r.palletHeight)*scale,'#d6b47b');out+='<text x="85" y="'+H(f.y+Number(r.palletHeight)/2)+'" text-anchor="end" font-size="14">K'+(f.index+1)+' · '+f.positions.length+'</text>';}}
  out+='<text x="550" y="665" text-anchor="middle" font-size="17">'+fmt(s.capacity)+' palet · '+fmt(Number(r.railLength||r.depthMm))+' mm derinlik · '+Number(r.bays)+' kanal</text></g></svg>';return out;
 };
})();
