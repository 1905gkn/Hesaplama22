export function detailSystem(d) {
  if(d.b2b?.mr||d.plan?.mr)return 'mr';
  if(d.konsol||d.spec?.system==='konsol')return 'konsol';
  if(d.b2b)return 'b2b';
  return ['drive','drivein','drive-in'].includes(d.rafexSystem||d.systemType)?'drive':'mekik2';
}
export function detailSignature(d) {
  const system=detailSystem(d),data={system,levels:d.levels,palletHeight:d.palletHeight};
  if(system==='b2b'||system==='mr')data.settings=d.b2b;
  else if(system==='konsol')data.settings=d.konsol||d.spec;
  else {
    for(const k of ['bays','depth','palW','palD','palletWeight','railHeight','levelH','firstRailHeight','sideUprightHeight','firstPalletGap','palletGap','palletPositions','palletGaps','hasExtra','footType','footProfile','plan'])data[k]=d[k];
    data.width=Number(d.totalWidth||d.widthMm)||0;data.length=Number(d.railLength||d.depthMm)||0;
    data.topVBraceBays=d.topVBraceBays||[];data.showPallets=d.showPallets!==false;data.showFlowArrows=d.showFlowArrows!==false;
  }
  const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>[k,stable(value[k])])):value;
  return JSON.stringify(stable(data));
}
export function readDetail(d,kind) {
  const s=d?.rackDetail;
  if(!s||s.version!==1||s.signature!==detailSignature(d))return null;
  return s.views[kind]==null?null:JSON.parse(JSON.stringify(s.views[kind]));
}
export function sealDetail(d,views) {
  const out=JSON.parse(JSON.stringify(d));
  out.rackDetail={version:1,system:detailSystem(out),signature:detailSignature(out),views:JSON.parse(JSON.stringify(views))};
  return out;
}

export const runtime=String.raw`<script data-rafex-rack-detail="v135">
(function(){
 const detailSystem=${detailSystem.toString()},detailSignature=${detailSignature.toString()},readDetail=${readDetail.toString()},sealDetail=${sealDetail.toString()};
 const clone=x=>JSON.parse(JSON.stringify(x));
 let copied=null;
 window.rafexReadRackDetailV135=readDetail;
 window.rafexCopiedDetailV135=system=>copied&&detailSystem(copied)===system?readDetail(copied,system):null;
 window.rafexCopiedDrawingV135=system=>copied&&detailSystem(copied)===system?clone(copied):null;
 window.rafexUseCopiedDetailV135=d=>{copied=clone(d);};
 // User edits start a draft. Programmatic form restoration does not discard the saved view.
 const invalidate=e=>{if(e.isTrusted)copied=null};
 document.addEventListener('input',invalidate,true);document.addEventListener('change',invalidate,true);
 document.addEventListener('click',e=>{if(e.isTrusted&&e.target?.closest('button')&&!e.target.closest('.rafex-free-copy,.m2-saved-type-copy,.rafex-global-copy-action'))copied=null},true);
 window.rafexSealRackDetailV135=function(d,preferLive=false){
   const sys=detailSystem(d),existing=readDetail(d,sys);
   if(existing)return clone(d);
   const clean=clone(d);delete clean.rackDetail;
   const views={};
   if(sys==='b2b')views.b2b=clone((preferLive?window.RafexB2BViewer?.getSavedDetail?.():null)||clean.b2bViewerOptions||window.rafexB2BDetailOptionsV117(clean));
   else if(sys==='mr')views.mr=clone((preferLive?window.RafexMRViewer?.getSavedDetail?.():null)||window.rafexMrConfigFromRackV37(clean));
   else if(sys==='konsol')views.konsol=clone((preferLive?window.RafexKonsolViewer?.getSavedDetail?.():null)||window.rafexKonsolDetailOptionsV135(clean));
   else {views[sys]=clone(clean);views.front=m2ReportElevationSvg(clean,'front',true);views.side=m2ReportElevationSvg(clean,'side',true);}
   return sealDetail(clean,views);
 };
 window.rafexPrepareRackSaveV135=function(url,opt){
   if(!/^\/api\/(?:rack|b2b|mr|mekik2)-types$/.test(String(url))||String(opt.method).toUpperCase()!=='POST'||typeof opt.body!=='string')return opt;
   const payload=JSON.parse(opt.body);if(!payload.drawing)return opt;
   payload.drawing=window.rafexSealRackDetailV135(payload.drawing,true);
   return {...opt,body:JSON.stringify(payload)};
 };
})();</script>`;
