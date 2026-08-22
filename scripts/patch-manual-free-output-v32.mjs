import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Manual free output v32: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-manual-free-output="v32">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-manual-free-output="v32">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-manual-free-output="v32">
#m2CreateOutputButton{padding:9px 12px!important;border:1px solid #7f1623!important;border-radius:8px!important;background:#7f1623!important;color:#fff!important;font-weight:900!important;white-space:nowrap!important;cursor:pointer!important}
#m2CreateOutputButton:hover{background:#65111b!important}
#m2CreateOutputButton:disabled{cursor:wait!important;opacity:.68!important}
#m2CreateOutputButton[hidden]{display:none!important}
</style><script data-rafex-manual-free-output="v32">(function(){
  if(window.__rafexManualFreeOutputV32)return;window.__rafexManualFreeOutputV32=true;
  var manualDepth=0,creating=false,buttonObserver=null,pageObserver=null;
  var originalSchedule=typeof window.m2ScheduleReportRefresh==='function'?window.m2ScheduleReportRefresh:null;
  var originalRefresh=typeof window.m2RefreshActiveReport==='function'?window.m2RefreshActiveReport:null;
  var originalA4=typeof window.m2RenderA4Report==='function'?window.m2RenderA4Report:null;
  var originalCorporate=typeof window.m2RenderCorporateReport==='function'?window.m2RenderCorporateReport:null;
  var originalSections=typeof window.rafexRenderSelectedB2BSections==='function'?window.rafexRenderSelectedB2BSections:null;

  function freePage(){var page=document.getElementById('page');return !!(page&&page.classList.contains('rafex-free-drawing-page'))}
  function allowed(){return manualDepth>0||!freePage()}
  function guard(original){return function(){if(!allowed()){window.__rafexFreeOutputDirty=true;return}return original&&original.apply(this,arguments)}}

  if(originalSchedule){var guardedSchedule=guard(originalSchedule);window.m2ScheduleReportRefresh=guardedSchedule;try{m2ScheduleReportRefresh=guardedSchedule}catch(e){}}
  if(originalRefresh){var guardedRefresh=guard(originalRefresh);window.m2RefreshActiveReport=guardedRefresh;try{m2RefreshActiveReport=guardedRefresh}catch(e){}}
  if(originalA4){var guardedA4=guard(originalA4);window.m2RenderA4Report=guardedA4;try{m2RenderA4Report=guardedA4}catch(e){}}
  if(originalCorporate){var guardedCorporate=guard(originalCorporate);window.m2RenderCorporateReport=guardedCorporate;try{m2RenderCorporateReport=guardedCorporate}catch(e){}}
  if(originalSections){window.rafexRenderSelectedB2BSections=guard(originalSections)}

  function nextFrame(){return new Promise(function(resolve){requestAnimationFrame(function(){resolve()})})}
  function wait(ms){return new Promise(function(resolve){setTimeout(resolve,ms)})}
  function setStatus(text){var status=document.getElementById('m2FloorStatus');if(status)status.textContent=text}

  async function createOutput(){
    if(creating)return;creating=true;manualDepth++;window.__rafexManualOutputBuild=true;
    var button=document.getElementById('m2CreateOutputButton'),oldText=button?.textContent||'Çıktıyı Oluştur';
    if(button){button.disabled=true;button.textContent='Çıktı Oluşturuluyor…'}
    setStatus('Çizim tamamlandı; teknik çıktı hazırlanıyor.');
    try{
      var reportType=document.getElementById('m2ReportType');if(reportType)reportType.value='corporate';
      var a4=document.getElementById('m2A4Sheet'),corporate=document.getElementById('m2CorporatePreview');if(a4)a4.hidden=true;if(corporate)corporate.hidden=false;
      if(originalCorporate)await Promise.resolve(originalCorporate());
      // Final PDF repair passes finish at 3100 ms. Capture the selected B2B
      // perspective once, after those DOM-only passes have settled.
      await wait(3200);await nextFrame();
      if(originalSections)await Promise.resolve(originalSections(true));
      await nextFrame();window.__rafexFreeOutputDirty=false;
      if(button)button.textContent='Çıktı Hazır';
      setStatus('Teknik çıktı oluşturuldu. Çizime devam edersen yeniden Oluştur düğmesine bas.');
      (corporate||document.querySelector('.m2-report-panel'))?.scrollIntoView?.({behavior:'smooth',block:'start'});
      setTimeout(function(){if(button&&!creating)button.textContent=oldText},1500);
    }catch(error){
      console.error('Serbest Çizim çıktısı oluşturulamadı',error);
      if(button)button.textContent='Tekrar Dene';setStatus('Çıktı oluşturulamadı; tekrar deneyebilirsin.');
    }finally{
      manualDepth=Math.max(0,manualDepth-1);window.__rafexManualOutputBuild=false;creating=false;if(button)button.disabled=false;
    }
  }

  function ensureButton(){
    var sectionButton=document.getElementById('m2SectionPlacementButton');
    var host=sectionButton?.parentElement||document.querySelector('.m2-report-head-actions');if(!host)return false;
    var button=document.getElementById('m2CreateOutputButton');if(!button){button=document.createElement('button');button.type='button';button.id='m2CreateOutputButton';button.textContent='Çıktıyı Oluştur';button.addEventListener('click',createOutput)}
    if(sectionButton){if(sectionButton.nextElementSibling!==button)sectionButton.insertAdjacentElement('afterend',button)}else if(!button.isConnected)host.prepend(button);
    button.hidden=!freePage();
    if(!buttonObserver){buttonObserver=new MutationObserver(function(){if(!document.getElementById('m2CreateOutputButton'))ensureButton()});buttonObserver.observe(host,{childList:true})}
    return true;
  }

  window.rafexCreateFreeDrawingOutput=createOutput;
  function start(){
    var attempts=0,timer=setInterval(function(){attempts++;if(ensureButton()||attempts>=40)clearInterval(timer)},250);
    var page=document.getElementById('page');if(page&&!pageObserver){pageObserver=new MutationObserver(ensureButton);pageObserver.observe(page,{attributes:true,attributeFilter:['class']})}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Manual free output v32: body kapanisi bulunamadi.");
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);

if (!html.includes('data-rafex-manual-free-output="v32"') || !html.includes("rafexCreateFreeDrawingOutput") || !html.includes("Çıktıyı Oluştur")) {
  throw new Error("Manual free output v32: son dogrulama basarisiz.");
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log('FINAL v32: Serbest Cizim raporu manuel; "Ciktiyi Olustur" Kesit Yer Belirleme yaninda.');
