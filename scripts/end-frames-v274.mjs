export function frameHeights(d, normal, racks = []) {
 const special=d.b2b?.endFrameHeightEnabled ? Math.max(normal,Number(d.b2b.endFrameHeight)||normal) : normal;
 const rows=Number(d.b2bLayout?.rowCount)||(d.b2b?.rowType==='double'?2:1);
 return Array.from({length:rows},(_,row)=>Object.fromEntries(['left','right'].map(side=>{
   const adjacent=racks.filter(r=>r!==d&&((Number(d.sharedFootWith)===Number(r.id)&&d.sharedFootSide===side)||(Number(r.sharedFootWith)===Number(d.id)&&r.sharedFootSide===(side==='left'?'right':'left'))));
   const axis=(r,i)=>{const l=r.b2bLayout||{},rad=(Number(r.angle)||0)*Math.PI/180,pallet=Number(l.palletDepth)||Number(l.frameDepth)||1100,pitch=pallet+Math.max(0,(Number(l.rowGap)||0)-2*(Number(l.palletOverhang)||0)),depth=Number(r.depthMm)||pallet+((Number(l.rowCount)||1)-1)*pitch;return -(r.x+r.w/2)*Math.sin(rad)+(r.y+r.h/2)*Math.cos(rad)-r.h/2+((Number(l.palletOverhang)||0)+(Number(l.frameDepth)||1100)/2+i*pitch)*r.h/depth;};
   const joined=adjacent.filter(r=>Array.from({length:Number(r.b2bLayout?.rowCount)||1},(_,i)=>axis(r,i)).some(a=>Math.abs(a-axis(d,row))<.01));
   return [side,joined.length?Math.max(normal,...joined.map(r=>Number(r.sideUprightHeight)||Number(r.b2b?.footHeight)||normal)):special];
 })));
}

export function installEndFrames(){
 const get=id=>document.getElementById(id);
 const minimum=()=>Math.max(500,Number(b2bVerticalLayout().footHeight)||500);
 function sync(commit=false){
  const input=get('b2bEndFrameHeight'),button=get('b2bEndFrameToggle');if(!input||!button)return;
  const enabled=button.getAttribute('aria-pressed')==='true',min=minimum();input.hidden=!enabled;input.disabled=!enabled;input.min=String(min);
  if(enabled&&commit&&(!Number.isFinite(input.valueAsNumber)||input.valueAsNumber<min||input.valueAsNumber>30000))input.value=String(Math.min(30000,Math.max(min,Number(input.value)||min)));
  const invalid=enabled&&(!input.value||Number(input.value)<min||Number(input.value)>30000);
  input.setCustomValidity(invalid?'Yan ayak yüksekliği '+min+' mm değerinden kısa olamaz (en fazla 30.000 mm).':'');input.setAttribute('aria-invalid',String(invalid));
  get('b2bEndFrameHint').textContent=enabled?(invalid?'En az '+min.toLocaleString('tr-TR')+' mm girin.':'Yalnızca sıranın baş ve son ayakları · İç ayaklar '+min.toLocaleString('tr-TR')+' mm'):'';
 }
 window.rafexToggleEndFrames=function(){const b=get('b2bEndFrameToggle');b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));sync(true);b2bApplyInputs({target:b});b2bUpdateMain3D();get('b2bEndFrameHeight')?.focus();};
 window.rafexEditEndFrames=function(commit){sync(commit);b2bApplyInputs({target:get('b2bEndFrameHeight')});b2bUpdateMain3D();};
 window.rafexReadEndFrameState=function(){const enabled=get('b2bEndFrameToggle')?.getAttribute('aria-pressed')==='true';return {endFrameHeightEnabled:enabled,endFrameHeight:enabled?Math.max(minimum(),Math.min(30000,Number(get('b2bEndFrameHeight')?.value)||minimum())):null};};
 window.rafexRestoreEndFrameState=function(state){const b=get('b2bEndFrameToggle'),i=get('b2bEndFrameHeight');if(b)b.setAttribute('aria-pressed',String(state?.endFrameHeightEnabled===true));if(i)i.value=state?.endFrameHeight||'';};
 const read=b2bReadInputState;b2bReadInputState=window.b2bReadInputState=function(){const state=read.apply(this,arguments);if(!state)return state;const enabled=get('b2bEndFrameToggle')?.getAttribute('aria-pressed')==='true';return {...state,endFrameHeightEnabled:enabled,endFrameHeight:enabled?Math.max(minimum(),Math.min(30000,Number(get('b2bEndFrameHeight')?.value)||minimum())):null};};
 const apply=b2bApplySavedInputState;b2bApplySavedInputState=window.b2bApplySavedInputState=function(state){const b=get('b2bEndFrameToggle'),i=get('b2bEndFrameHeight');if(b)b.setAttribute('aria-pressed',String(state?.endFrameHeightEnabled===true));if(i)i.value=state?.endFrameHeight||'';const result=apply.apply(this,arguments);sync(true);return result;};
 const mainOptions=b2b3DOptions;b2b3DOptions=window.b2b3DOptions=function(){const o=mainOptions.apply(this,arguments),s=b2bReadInputState();return {...o,endFrameHeight:s?.endFrameHeightEnabled?Math.max(o.footHeight,Number(s.endFrameHeight)||o.footHeight):null,frameHeights:null};};
 const inputs=b2bApplyInputs;b2bApplyInputs=window.b2bApplyInputs=function(){const result=inputs.apply(this,arguments);sync();return result;};
 window.rafexEndFrameOptions=function(d,o){return {...o,endFrameHeight:d.b2b?.endFrameHeightEnabled?Math.max(o.footHeight,Number(d.b2b.endFrameHeight)||o.footHeight):null,frameHeights:typeof m2LayoutState!=='undefined'&&m2LayoutState.racks.some(r=>r.id===d.id)?frameHeights(d,o.footHeight,m2LayoutState.racks):null};};
}
