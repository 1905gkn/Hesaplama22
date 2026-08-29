import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Global PDF gate v89: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html
  .replace(/<style\s+data-rafex-global-pdf-gate="v89">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-global-pdf-gate="v89">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-global-pdf-gate="v89">
html:not(.rafex-pdf-explicit-v89) #m2A4Sheet,
html:not(.rafex-pdf-explicit-v89) #m2CorporatePreview,
html:not(.rafex-pdf-explicit-v89) #m2CorporatePrint,
html:not(.rafex-pdf-explicit-v89) [data-rafex-output-preview],
html:not(.rafex-pdf-explicit-v89) .rafex-output-preview,
html:not(.rafex-pdf-explicit-v89) .rafex-pdf-preview{display:none!important}
</style>
<script data-rafex-global-pdf-gate="v89">(function(){
  if(window.__rafexGlobalPdfGateV89)return;
  window.__rafexGlobalPdfGateV89=true;

  var allowUntil=0,closeTimer=0,wrapped=new Map();
  var PREFIX=/^(m2|rafex|drive|drivein|konsol|cantilever|mr|b2b|mekik)/i;
  var PDFNAME=/(pdf|report|print|a4|output)/i;
  var SAFE=/^(m2ReportProjectName|m2ReportMeta)$/i;

  function allowed(){return Date.now()<allowUntil||window.__rafexManualOutputBuild===true||window.__rafexExplicitOutputV90===true;}
  function openGate(){
    allowUntil=Date.now()+12000;
    window.__rafexPdfExplicitGateV89=true;
    document.documentElement.classList.add('rafex-pdf-explicit-v89');
    scheduleClose();
  }
  function closeGate(){
    allowUntil=0;
    window.__rafexPdfExplicitGateV89=false;
    document.documentElement.classList.remove('rafex-pdf-explicit-v89');
    try{document.getElementById('m2CorporatePrint')?.remove()}catch(_){ }
  }
  function scheduleClose(){
    clearTimeout(closeTimer);
    closeTimer=setTimeout(function(){
      if(Date.now()<allowUntil){scheduleClose();return;}
      closeGate();
    },1400);
  }
  function touchGate(){if(allowed()){allowUntil=Math.max(allowUntil,Date.now()+2200);scheduleClose();}}
  function explicitButton(node){
    var button=node?.closest?.('button,[role="button"],input[type="button"],input[type="submit"]');
    if(!button)return false;
    if(button.matches('[data-rafex-output-build],[data-rafex-create-output],#rafexCommonBuildOutputV90,.m2-pdf-button'))return true;
    var text=String(button.textContent||button.value||button.getAttribute('aria-label')||button.title||'').toLocaleLowerCase('tr-TR').replace(/\s+/g,' ').trim();
    return /çıktıyı oluştur|ciktiyi olustur|pdf oluştur|pdf olustur|pdf \/ yazdır|create pdf|create output|build output|créer le pdf|creer le pdf/.test(text);
  }
  function isPdfFunction(name,fn){
    if(typeof fn!=='function'||SAFE.test(name)||!PREFIX.test(name)||!PDFNAME.test(name))return false;
    if(fn.__rafexPdfGateV89)return false;
    return true;
  }
  function wrapName(name){
    var fn;try{fn=window[name]}catch(_){return}
    if(!isPdfFunction(name,fn))return;
    var gate=function(){
      if(!allowed())return undefined;
      touchGate();
      var result=fn.apply(this,arguments);
      if(result&&typeof result.then==='function')return result.finally(touchGate);
      touchGate();return result;
    };
    gate.__rafexPdfGateV89=true;gate.__rafexOriginal=fn;wrapped.set(name,gate);
    try{window[name]=gate}catch(_){return}
    try{(0,eval)(name+'=window["'+name+'"]')}catch(_){ }
  }
  function install(){
    Object.getOwnPropertyNames(window).forEach(function(name){wrapName(name)});
    [
      'm2RenderA4Report','m2RenderCorporateReport','m2RefreshActiveReport','m2ChangeReportMode','m2ChangeReportLanguage','m2SetPdfPalletDetails','m2PrintA4Report','m2PrintCorporateReport','m2BuildCorporatePages',
      'rafexBuildOutput','rafexCreateOutput','rafexRenderOutput','rafexSyncPdf','rafexRefreshPdf','rafexBuildPdf','rafexPrintPdf','printPdf'
    ].forEach(wrapName);
  }
  function hideIdleOutput(){
    if(allowed())return;
    ['m2A4Sheet','m2CorporatePreview'].forEach(function(id){var node=document.getElementById(id);if(node)node.hidden=true;});
  }
  document.addEventListener('pointerdown',function(event){
    if(explicitButton(event.target)){openGate();install();return;}
    if(event.target?.closest?.('#nav button[data-page]')){closeGate();setTimeout(function(){install();hideIdleOutput()},0);setTimeout(function(){install();hideIdleOutput()},120);}
  },true);
  document.addEventListener('click',function(event){
    if(explicitButton(event.target)){openGate();install();}
  },true);
  document.addEventListener('change',function(event){
    if(event.target?.matches?.('input[name="rafexUnifiedSystem"]')){closeGate();setTimeout(function(){install();hideIdleOutput()},0);}
  },true);
  window.addEventListener('rafex:module-changed',function(){closeGate();install();hideIdleOutput();});
  window.rafexOpenPdfGateV89=openGate;
  window.rafexClosePdfGateV89=closeGate;
  window.rafexPdfGateAllowedV89=allowed;
  closeGate();install();hideIdleOutput();
  setTimeout(function(){install();hideIdleOutput()},250);
  setTimeout(function(){install();hideIdleOutput()},900);
  setTimeout(function(){install();hideIdleOutput()},2200);
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Global PDF gate v89: </body> bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

for (const required of [
  'data-rafex-global-pdf-gate="v89"',
  'rafexPdfGateAllowedV89',
  'm2RenderA4Report',
  'm2RenderCorporateReport',
  'rafex-pdf-explicit-v89',
  'çıktıyı oluştur'
]) if (!html.includes(required)) throw new Error("Global PDF gate v89 dogrulama eksigi: "+required);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v89: B2B/MR/Mekik/Drive-In/Konsol/Ortak dahil tum modullerde PDF/rapor fonksiyonlari yalniz acik Cikti/PDF olustur tiklamasindan sonra calisir.");
