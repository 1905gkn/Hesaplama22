import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Common output/add v102: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");
if (!html.includes('data-rafex-common-architecture="v90"')) throw new Error("Common output/add v102: v90 ortak kontrolcu bulunamadi");
if (!html.includes('data-rafex-manual-free-output="v32"')) throw new Error("Common output/add v102: manuel cikti v32 bulunamadi");

html = html
  .replace(/<style\s+data-rafex-common-output-add="v102">[\s\S]*?<\/style>/g, "")
  .replace(/<script\s+data-rafex-common-output-add="v102">[\s\S]*?<\/script>/g, "");

// v90 kendi rapor yenilemesini cagiriyordu. Ancak v32 cikti motoru manualDepth
// kilidiyle calistigi icin bu yol goruntu uretmeden donuyordu. Ortak toolbar cikti
// dugmesi artik dogrudan, zaten calisan v32 manuel cikti motorunu bekler.
const createOutputPattern = /  function createOutput\(\)\{[\s\S]*?\n  \}\n\n  async function enterCommon/;
const createOutputReplacement = String.raw`  async function createOutput(){
    const page=document.getElementById('page'),panel=document.querySelector('.m2-report-panel'),corporate=document.getElementById('m2CorporatePreview'),a4=document.getElementById('m2A4Sheet'),toolbarButton=document.getElementById('rafexCommonOutputV90'),oldText=toolbarButton?.textContent||'Çıktıyı Oluştur';
    let ready=false;
    state.outputDirty=false;page?.classList.add('rafex-output-ready-v90');window.__rafexExplicitOutputV90=true;
    if(panel){panel.hidden=false;panel.dataset.rafexOutputVisible='1'}
    const reportType=document.getElementById('m2ReportType');if(reportType)reportType.value='corporate';if(a4)a4.hidden=true;if(corporate)corporate.hidden=false;
    if(toolbarButton){toolbarButton.disabled=true;toolbarButton.textContent='Çıktı Oluşturuluyor…'}
    status('Ortak Çizim teknik çıktısı hazırlanıyor.');
    try{
      const manual=window.rafexCreateFreeDrawingOutput;
      if(typeof manual==='function')await Promise.resolve(manual());
      else await Promise.resolve(withOutput(()=>{try{window.rafexRefreshProductCountsV77?.()}catch{}try{readGlobal('m2RenderLayoutProductList')?.()}catch{}try{readGlobal('m2ChangeReportMode')?.()}catch{}try{readGlobal('m2RefreshActiveReport')?.()}catch{}}));
      if(corporate&&!String(corporate.innerHTML||'').trim()){
        let build=readGlobal('m2BuildCorporatePages'),depth=0;while(typeof build==='function'&&typeof build.__rafexOriginal==='function'&&depth++<8)build=build.__rafexOriginal;
        try{const pages=typeof build==='function'?build():'';if(pages)corporate.innerHTML=pages}catch(error){console.warn('v102 kurumsal cikti geri dolumu',error)}
      }
      try{window.rafexCommonV44Api?.syncPdf?.()}catch{}
      state.outputDirty=false;page?.classList.add('rafex-output-ready-v90');if(panel)panel.dataset.rafexOutputVisible='1';if(corporate)corporate.hidden=false;
      ready=!!String(corporate?.innerHTML||'').trim();
      status(ready?'Ortak Çizim çıktısı oluşturuldu ve görüntülendi.':'Çıktı alanı açıldı ancak görünüş üretilemedi; tekrar deneyebilirsin.');
      (corporate||panel)?.scrollIntoView?.({behavior:'smooth',block:'start'});
      return ready;
    }catch(error){
      console.error('Ortak Çizim çıktısı oluşturulamadı',error);state.outputDirty=true;page?.classList.remove('rafex-output-ready-v90');status('Çıktı oluşturulamadı: '+String(error?.message||error||'Bilinmeyen hata'));return false;
    }finally{
      window.__rafexExplicitOutputV90=false;
      if(toolbarButton){toolbarButton.disabled=false;toolbarButton.textContent=ready?'Çıktı Hazır':oldText;if(ready)setTimeout(()=>{if(toolbarButton&&!toolbarButton.disabled)toolbarButton.textContent=oldText},1500)}
    }
  }

  async function enterCommon`;
if (!createOutputPattern.test(html)) throw new Error("Common output/add v102: v90 createOutput blogu bulunamadi");
html = html.replace(createOutputPattern, createOutputReplacement);

// Cikti dugmesine basmak, ayni click yakalayicisinda tekrar markDirty calistirip
// yeni olusturulan goruntuyu aninda gizliyordu. Cikti/PDF aksiyonlari dirty yoluna girmez.
const oldOutputClick = `    const text=String(button.textContent||'').trim();if(/Çıktıyı Oluştur|PDF Oluştur/i.test(text)){window.__rafexExplicitOutputV90=true;document.getElementById('page')?.classList.add('rafex-output-ready-v90');requestAnimationFrame(()=>{window.__rafexExplicitOutputV90=false})}\n    if(!/3D|Kamera|Yaklaş|Uzaklaş|Görünüş/i.test(text))markDirty();requestAnimationFrame(decorate);`;
const newOutputClick = `    const text=String(button.textContent||'').trim(),isOutput=/Çıktıyı Oluştur/i.test(text),isPdf=/PDF Oluştur/i.test(text);\n    if(isOutput||isPdf){window.__rafexExplicitOutputV90=true;document.getElementById('page')?.classList.add('rafex-output-ready-v90');requestAnimationFrame(()=>{if(!isOutput)window.__rafexExplicitOutputV90=false});requestAnimationFrame(decorate);return}\n    if(!/3D|Kamera|Yaklaş|Uzaklaş|Görünüş/i.test(text))markDirty();requestAnimationFrame(decorate);`;
if (!html.includes(oldOutputClick)) throw new Error("Common output/add v102: v90 output click blogu bulunamadi");
html = html.replace(oldOutputClick, newOutputClick);

const runtime = String.raw`<style data-rafex-common-output-add="v102">
#page.rafex-common-v90.rafex-output-ready-v90 .m2-report-panel{display:block!important;visibility:visible!important}
#page.rafex-common-v90.rafex-output-ready-v90 .m2-report-panel[data-rafex-output-visible="1"]>#m2CorporatePreview:not([hidden]){display:block!important;visibility:visible!important;opacity:1!important}
#page.rafex-common-v90.rafex-output-ready-v90 #m2TypePagesHost{display:block!important;visibility:visible!important}
#page.rafex-common-v90 #rafexCommonOutputV90:disabled{cursor:wait!important;opacity:.7!important}
</style>
<script data-rafex-common-output-add="v102">(()=>{
  if(window.__rafexCommonOutputAddV102)return;window.__rafexCommonOutputAddV102=true;
  const marker=document.createElement('span');marker.textContent='RAFEX COMMON OUTPUT ADD V102';marker.style.cssText='position:fixed;left:-10000px;top:-10000px;width:1px;height:1px;overflow:hidden';marker.dataset.rafexCommonOutputAdd='v102';document.body.appendChild(marker);
  const read=(name)=>{try{return window[name]||Function('return typeof '+name+'!=="undefined"?'+name+':null')()}catch{return window[name]||null}};
  const assign=(name,value)=>{window[name]=value;try{(0,eval)(name+'=window["'+name+'"]')}catch{}};
  const common=()=>window.__rafexCommonArchitectureV90Active===true&&document.getElementById('page')?.classList.contains('rafex-common-v90');
  const entries=()=>{try{return Array.isArray(m2SavedRackTypes)?m2SavedRackTypes:[]}catch{return Array.isArray(window.m2SavedRackTypes)?window.m2SavedRackTypes:[]}};
  const racks=()=>{try{return Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks:[]}catch{return[]}};
  const status=(text)=>{const floor=document.getElementById('m2FloorStatus');if(floor)floor.textContent=text;const top=document.getElementById('rafexCommonStatusV90');if(top)top.textContent=text};
  const originalClick=read('m2HandleSavedRackTypeClick');
  let last={key:'',at:0},lastAdd={key:'',at:0};

  function selectWithoutRebuild(index){
    const list=entries(),entry=list[index];if(!entry?.drawing)return null;
    try{clearTimeout(m2SavedTypeClickTimer);m2SavedTypeClickTimer=null}catch{}
    try{m2SelectedSavedType=index}catch{window.m2SelectedSavedType=index}
    try{if(m2LayoutState)m2LayoutState.selected=null}catch{}
    document.querySelectorAll('#m2SavedTypeList .m2-saved-type').forEach((button,position)=>{const active=position===index;button.classList.toggle('active',active);button.setAttribute('aria-pressed',active?'true':'false')});
    requestAnimationFrame(()=>{try{read('m2RenderSelectedRackInfo')?.()}catch{}});
    return entry;
  }
  function entryKey(entry,index){return String(entry?.__rafexSystem||entry?.drawing?.rafexSystem||'')+':'+String(entry?.id??entry?.name??index)}
  function finishAdd(entry,before){
    const after=racks().length,label=String(entry?.__rafexSystemLabel||entry?.drawing?.rafexSystemLabel||entry?.__rafexSystem||'RAF').toUpperCase();
    if(after>before){try{window.rafexMarkProductCountsDirtyV79?.('saved-double-click')}catch{}status(label+' · '+String(entry?.name||'Blok')+' serbest yerleşim alanına eklendi.');}
    else status(String(entry?.name||'Blok')+' seçildi fakat serbest alana eklenemedi. Alan ve çakışma durumunu kontrol et.');
  }
  function fixedSavedClick(index,event){
    if(!common())return typeof originalClick==='function'?originalClick.apply(this,arguments):undefined;
    index=Number(index);const entry=selectWithoutRebuild(index);if(!entry)return;
    const now=typeof performance!=='undefined'&&performance.now?performance.now():Date.now(),key=entryKey(entry,index),nativeDouble=Number(event?.detail)>=2||event?.type==='dblclick',fastDouble=last.key===key&&now-last.at<=650;
    if(!nativeDouble&&!fastDouble){last={key,at:now};status(String(entry.name||'Blok')+' seçildi. Çift tıklayarak serbest alana ekleyebilirsin.');return;}
    last={key:'',at:0};event?.preventDefault?.();event?.stopPropagation?.();
    if(lastAdd.key===key&&now-lastAdd.at<700)return;lastAdd={key,at:now};
    const before=racks().length,add=read('m2AddSelectedSavedRack');
    if(typeof add!=='function'){status('Blok ekleme fonksiyonu hazırlanamadı.');return;}
    try{const result=add();if(result&&typeof result.finally==='function')result.finally(()=>requestAnimationFrame(()=>finishAdd(entry,before)));else requestAnimationFrame(()=>finishAdd(entry,before));}
    catch(error){console.error('v102 blok ekleme',error);status('Blok serbest alana eklenemedi: '+String(error?.message||error||'Bilinmeyen hata'));}
  }
  fixedSavedClick.__rafexCommonSavedDoubleV102=true;fixedSavedClick.__rafexOriginal=originalClick;assign('m2HandleSavedRackTypeClick',fixedSavedClick);
  document.addEventListener('dblclick',(event)=>{if(!common())return;const button=event.target?.closest?.('#m2SavedTypeList .m2-saved-type');if(!button)return;const buttons=Array.from(document.querySelectorAll('#m2SavedTypeList .m2-saved-type')),index=buttons.indexOf(button);if(index>=0)fixedSavedClick(index,event)},true);
  window.rafexCommonAddSavedBlockV102=(index)=>fixedSavedClick(index,{detail:2,type:'dblclick',preventDefault(){},stopPropagation(){}});
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Common output/add v102: body bulunamadi");
html = html.slice(0, bodyEnd) + runtime + "\n" + html.slice(bodyEnd);

for (const required of [
  'data-rafex-common-output-add="v102"',
  'RAFEX COMMON OUTPUT ADD V102',
  'rafexCommonAddSavedBlockV102',
  '__rafexCommonSavedDoubleV102',
  "typeof window.rafexCreateFreeDrawingOutput==='function'",
  "panel.dataset.rafexOutputVisible='1'",
  "isOutput||isPdf",
]) if (!html.includes(required)) throw new Error("Common output/add v102 dogrulama eksigi: " + required);
if (html.includes(oldOutputClick)) throw new Error("Common output/add v102: ciktiyi tekrar gizleyen eski click yolu kaldi");

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[0].replace(match[3], encoded) + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("v102: Ortak Cizim cikti goruntusu manuel motorla acilir; kayitli blok cift tikla serbest alana eklenir.");
