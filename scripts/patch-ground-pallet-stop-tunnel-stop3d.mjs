import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const workerPath=path.join(root,"dist/server/index.js");
let worker=fs.readFileSync(workerPath,"utf8");
const match=worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if(!match) throw new Error("HTML_BASE64 bulunamadi.");
let html=Buffer.from(match[3],"base64").toString("utf8");

// 1) Hesap girdilerindeki eski "Tunel olacak bolum" secicisini kaldir.
html=html.replace(/\s*<div class="b2b-field"><span>Tünel olacak bölüm<\/span><details class="b2b-tunnel-picker" id="b2bTunnelPicker">[\s\S]*?<\/details><small>Listeyi açıp birden fazla bölüm seçebilirsin\.<\/small><\/div>/g,"");

// 2) Customize accessory runtime: Palet Dayama icin ZEMIN (level 0) secimini destekle.
const levelCountNeedle="const levelCount=()=>Math.max(1,Math.min(15,Math.round(Number(document.getElementById('m2CustomizeLevels')?.value)||1)));";
if(html.includes(levelCountNeedle) && !html.includes('const rafexGroundPalletStopAllowed=')){
  html=html.replace(levelCountNeedle, levelCountNeedle+"\n  const rafexGroundPalletStopAllowed=()=>{try{const id=Number(typeof m2CustomizeRackId!=='undefined'?m2CustomizeRackId:0);const racks=(typeof m2LayoutState!=='undefined'&&Array.isArray(m2LayoutState?.racks))?m2LayoutState.racks:[];const rack=racks.find((item)=>Number(item?.id)===id);return String(rack?.b2b?.firstPalletPosition||'ground').toLowerCase()==='ground';}catch{return false}};");
}

html=html.replace(
  "window.m2CollectCustomizeRackAccessories=()=>clone(draft).map((item)=>({...item,levels:item.levels.filter((level)=>level>=1&&level<=levelCount())}));",
  "window.m2CollectCustomizeRackAccessories=()=>clone(draft).map((item)=>({...item,levels:item.levels.filter((level)=>(level>=1&&level<=levelCount())||(level===0&&item.type==='palletStop'&&rafexGroundPalletStopAllowed()))}));"
);
html=html.replace(
  "draft=draft.map((item)=>({...item,levels:(item.levels||[]).filter((level)=>level>=1&&level<=count)}));",
  "draft=draft.map((item)=>({...item,levels:(item.levels||[]).filter((level)=>(level>=1&&level<=count)||(level===0&&item.type==='palletStop'&&rafexGroundPalletStopAllowed()))}));"
);
html=html.replace(
  "const selected=new Set(item.levels||[]);\n        const levels=Array.from({length:count},(_,i)=>i+1).map((level)=>'<button type=\"button\" data-level=\"'+level+'\" class=\"'+(selected.has(level)?'active':'')+'\">K'+level+'</button>').join('');",
  "const selected=new Set(item.levels||[]);\n        const groundButton=type==='palletStop'&&rafexGroundPalletStopAllowed()?'<button type=\"button\" data-level=\"0\" class=\"'+(selected.has(0)?'active':'')+'\">ZEMİN</button>':'';\n        const levels=Array.from({length:count},(_,i)=>i+1).map((level)=>'<button type=\"button\" data-level=\"'+level+'\" class=\"'+(selected.has(level)?'active':'')+'\">K'+level+'</button>').join('');"
);
html=html.replace(
  "<div class=\"m2-customize-accessory-levels\">'+levels+'</div>",
  "<div class=\"m2-customize-accessory-levels\">'+groundButton+levels+'</div>"
);
html=html.replace(
  "const count=levelCount();item.levels=(item.levels||[]).filter((level)=>level>=1&&level<=count).length===count?[]:Array.from({length:count},(_,i)=>i+1);window.m2RenderCustomizeRackAccessories();preview();",
  "const count=levelCount();const all=(item.type==='palletStop'&&rafexGroundPalletStopAllowed()?[0]:[]).concat(Array.from({length:count},(_,i)=>i+1));const valid=(item.levels||[]).filter((level)=>all.includes(level));item.levels=valid.length===all.length?[]:all;window.m2RenderCustomizeRackAccessories();preview();"
);

// Final capture handler level 0'i de kabul etsin.
html=html.replace(
  "if(!type||!level||typeof window.m2ToggleCustomizeRackAccessoryLevel!=='function')return;",
  "if(!type||!Number.isFinite(level)||level<0||typeof window.m2ToggleCustomizeRackAccessoryLevel!=='function')return;if(level===0&&(type!=='palletStop'||!rafexGroundPalletStopAllowed()))return;"
);

// 3) Serbest yerlesime dokunuldugu anda ana 3D viewer'i tamamen durdur.
const stopMarker='data-rafex-free-layout-stop3d="v1"';
if(!html.includes(stopMarker)){
  const runtime=`<script ${stopMarker}>(function(){
    let stopped=false;
    function stop3D(){
      if(stopped)return;stopped=true;
      try{window.RafexB2BViewer?.setAutoRotate?.(false);}catch{}
      try{window.RafexB2BViewer?.destroy?.();}catch{}
      const loading=document.getElementById('b2b3DLoading');if(loading)loading.hidden=true;
    }
    window.rafexStopMain3DForFreeLayout=stop3D;
    document.addEventListener('pointerdown',(event)=>{
      const target=event.target instanceof Element?event.target:null;if(!target)return;
      if(target.closest('#m2LayoutSvg'))stop3D();
    },true);
    document.addEventListener('click',(event)=>{
      const target=event.target instanceof Element?event.target:null;if(!target)return;
      if(target.closest('.m2-floor-tools button,.m2-floor-head-actions button,#m2SavedTypesPanel button'))stop3D();
    },true);
  })();</script>`;
  const bodyEnd=html.lastIndexOf('</body>');
  if(bodyEnd<0)throw new Error('body kapanisi bulunamadi.');
  html=html.slice(0,bodyEnd)+runtime+html.slice(bodyEnd);
}

if(html.includes('Tünel olacak bölüm')) throw new Error('Tunel olacak bolum final HTML icinde kaldi.');
if(!html.includes('data-level=\"0\"')) throw new Error('Palet Dayama ZEMIN dugmesi eklenemedi.');
if(!html.includes(stopMarker)) throw new Error('Serbest yerlesim 3D durdurma runtime eklenemedi.');

const encoded=Buffer.from(html,"utf8").toString("base64");
worker=worker.slice(0,match.index)+match[1]+match[2]+encoded+match[2]+worker.slice(match.index+match[0].length);
fs.writeFileSync(workerPath,worker);
console.log('FINAL: Palet Dayama ZEMIN + tunel girdisi kaldirildi + serbest yerlesimde 3D durdurma eklendi.');
