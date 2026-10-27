export function transform(html){
 if(html.includes('data-initial-foot-finish="v383"'))return transformMekikManualHeightV421(html);
 const old=`mekikFootColor:(m2ActiveModule==='mekik2'?document.querySelector('.rafex-mekik-foot-color')?.value:null)||m2LastDrawing?.mekikFootColor||(m2ActiveModule==='drive'?'pgv':'ral5010'), bays, levels, depth,`;
 if(html.split(old).length!==2)throw Error('v383 initial finish anchor');
 html=html.replace(old,`rafexSystem:m2ActiveModule, mekikFootColor:window.rafexInitialFootFinishV383(m2ActiveModule,m2LastDrawing), bays, levels, depth,`);
 const control='row.append(foot,beam);form.prepend(row);';
 if(html.split(control).length!==2)throw Error('v383 controls anchor');
 html=html.replace(control,`try{const current=typeof m2LastDrawing!=='undefined'?m2LastDrawing:null;if(current&&(!current.rafexSystem||current.rafexSystem===key)&&['ral5010','pgv'].includes(current.mekikFootColor))foot.querySelector('select').value=current.mekikFootColor;}catch(_){}row.append(foot,beam);form.prepend(row);`);
 const runtime=String.raw`(()=>{
  window.rafexInitialFootFinishV383=(system,previous)=>{
   const valid=value=>['ral5010','pgv'].includes(value);
   if(system==='mekik2'||system==='drive'){
    const visible=Array.from(document.querySelectorAll('.rafex-mekik-foot-color')).filter(node=>node.isConnected&&node.getClientRects().length>0);
    const choice=visible.at(-1)?.value;
    if(valid(choice))return choice;
   }
   const previousSystem=previous?.rafexSystem||(previous?.systemType==='drive'?'drive':'mekik2');
   if(previousSystem===system&&valid(previous?.mekikFootColor))return previous.mekikFootColor;
   return 'ral5010';
  };
  document.addEventListener('change',event=>{
   if(!event.target.matches?.('.rafex-mekik-foot-color'))return;
   try{if(typeof m2LastDrawing!=='undefined'&&m2LastDrawing)m2LastDrawing.mekikFootColor=event.target.value;}catch(_){}
  });
 })();`;
 const first=html.indexOf('<script');
 return transformMekikManualHeightV421(html.slice(0,first)+'<script data-initial-foot-finish="v383">'+runtime+'</script>'+html.slice(first));
}


export function heightChoiceV421(automatic,mode,raw){
 const minimum=Math.ceil(Number(automatic)||0),requested=Number(raw),manual=mode==='manual';
 const valid=!manual||(Number.isSafeInteger(requested)&&requested>=minimum);
 return {mode:manual?'manual':'auto',minimum,requested:manual?requested:null,height:manual&&valid?requested:Number(automatic),valid};
}

export function manualHeightRuntimeV421(){
 const api=window.rafexMekikHeightV421;
 const get=id=>document.getElementById(id);
 api.resolve=(automatic,system)=>{
  const active=system==='mekik2',mode=get('m2UprightModeV421'),input=get('m2UprightHeightV421'),wrap=get('m2UprightWrapV421'),hint=get('m2UprightHintV421');
  if(wrap)wrap.hidden=!active;
  const value=api.choice(automatic,active?mode?.value:'auto',input?.value);
  if(active&&input){input.disabled=value.mode!=='manual';input.min=String(value.minimum);if(value.mode==='auto')input.value=String(value.minimum);input.setCustomValidity(value.valid?'':'Ayak boyu en az '+value.minimum+' mm olmalı.');}
  if(active&&hint){hint.textContent='Otomatik / minimum ayak boyu: '+value.minimum.toLocaleString('tr-TR')+' mm.'+(value.valid?'':' Daha kısa ayak boyuyla kayıt yapılamaz.');hint.style.color=value.valid?'#526158':'#a1182b';hint.setAttribute('role',value.valid?'status':'alert');}
  api.current=active?value:null;return value.height;
 };
 api.snapshot=()=>api.current?{mekikUprightMode:api.current.mode,mekikManualUprightHeight:api.current.requested,mekikAutomaticUprightHeight:api.current.minimum}:{};
 api.restore=drawing=>{const mode=get('m2UprightModeV421'),input=get('m2UprightHeightV421');if(mode)mode.value=drawing?.mekikUprightMode==='manual'?'manual':'auto';if(input&&drawing?.mekikUprightMode==='manual')input.value=String(drawing.mekikManualUprightHeight??drawing.sideUprightHeight??'');};
 api.valid=drawing=>{if(drawing?.rafexSystem!=='mekik2'||drawing.mekikUprightMode!=='manual')return true;const automatic=Number(drawing.firstRailHeight)+(Number(drawing.levels)-1)*Number(drawing.levelH)+Number(drawing.palletHeight)/2;return api.choice(automatic,'manual',drawing.mekikManualUprightHeight).valid;};
 api.allowSave=()=>{
  if(typeof m2ActiveModule==='undefined'||m2ActiveModule!=='mekik2')return true;
  drawMekik2();if(api.current?.valid!==false&&api.valid(m2LastDrawing))return true;
  const message='Manuel ayak boyu otomatik hesaplanan '+(api.current?.minimum||0).toLocaleString('tr-TR')+' mm’den kısa olamaz. Kayıt yapılmadı.';
  const status=get('m2FloorStatus');if(status)status.textContent=message;get('m2UprightHeightV421')?.reportValidity();return false;
 };
}

export function installManualHeightSaveV421(){
 const api=window.rafexMekikHeightV421,save=m2SaveRackType;
 m2SaveRackType=window.m2SaveRackType=function(){if(!api.allowSave())return false;return save.apply(this,arguments);};
}

export function transformMekikManualHeightV421(html){
 if(html.includes('data-mekik-manual-height="v421"'))return html;
 const replace=(a,b)=>{if(html.split(a).length!==2)throw Error('v421 anchor '+a.slice(0,100));html=html.replace(a,b);};
 const anchor='<label class="input-field">Palet yüksekliği (mm)<input id="m2LevelH" type="number" min="300" max="3000" step="50" value="1200"></label>';
 replace(anchor,anchor+'<label class="input-field" id="m2UprightWrapV421" style="grid-column:1/-1">Ayak boyu (mm)<div style="display:flex;gap:8px"><select id="m2UprightModeV421" style="flex:0 0 110px;min-width:110px" aria-label="Ayak boyu modu"><option value="auto">Otomatik</option><option value="manual">Manuel</option></select><input id="m2UprightHeightV421" style="flex:1;min-width:0" aria-label="Manuel ayak boyu (mm)" type="number" min="1" step="1" disabled></div><small id="m2UprightHintV421" aria-live="polite"></small></label>');
 replace('sideUprightHeight = firstRailHeight + (levels - 1) * levelH + palletHeight / 2,','sideUprightHeight = window.rafexMekikHeightV421.resolve(firstRailHeight + (levels - 1) * levelH + palletHeight / 2,m2ActiveModule),');
 replace('totalRackHeight = firstRailHeight + (levels - 1) * levelH + palletHeight,','totalRackHeight = Math.max(firstRailHeight + (levels - 1) * levelH + palletHeight,window.rafexMekikHeightV421.resolve(firstRailHeight + (levels - 1) * levelH + palletHeight / 2,m2ActiveModule)),');
 replace('m2LastDrawing = { rafexSystem:m2ActiveModule, mekikFootColor:','m2LastDrawing = { ...(m2ActiveModule===\'mekik2\'?window.rafexMekikHeightV421.snapshot():{}),rafexSystem:m2ActiveModule, mekikFootColor:');
 replace('function m2PrepareSavedFootProfile(drawing) {','function m2PrepareSavedFootProfile(drawing) { window.rafexMekikHeightV421.restore(drawing);');
 replace('async function m2SaveRackType() {','async function m2SaveRackType() { if(!window.rafexMekikHeightV421.allowSave())return false;');
 const first=html.indexOf('<script');html=html.slice(0,first)+'<script data-mekik-manual-height="v421">window.rafexMekikHeightV421={choice:'+heightChoiceV421.toString()+'};('+manualHeightRuntimeV421.toString()+')();</script>'+html.slice(first);
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('v421 body');return html.slice(0,end)+'<script data-mekik-height-save="v421">('+installManualHeightSaveV421.toString()+')();</script>'+html.slice(end);
}

