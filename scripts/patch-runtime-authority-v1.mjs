import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Runtime authority v1: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");

// Once this authority exists, the earlier presentation-only v96 layer is obsolete.
html = html
  .replace(/<style\s+data-rafex-common-layout-theme="v96">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-common-layout-theme="v96">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<style\s+data-rafex-runtime-authority="v1">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-runtime-authority="v1">[\s\S]*?<\/script>\s*/g, "");

const authority = String.raw`<style data-rafex-runtime-authority="v1">
#page[data-rafex-authority-mode="common"]{--rafex-authority-accent:#214f3b;--rafex-authority-soft:#edf4f0}
#page[data-rafex-authority-mode="common"][data-rafex-authority-system="drivein"]{--rafex-authority-accent:#17699a;--rafex-authority-soft:#eaf5fb}
#page[data-rafex-authority-mode="common"][data-rafex-authority-system="konsol"]{--rafex-authority-accent:#765035;--rafex-authority-soft:#f5eee8}
#page[data-rafex-authority-mode="common"] [data-rafex-system-banner="common"]{width:100%!important;height:94px!important;min-height:94px!important;max-height:94px!important;margin:0 0 12px!important;padding:20px 26px!important;box-sizing:border-box!important;background:var(--rafex-authority-accent)!important;overflow:hidden!important}
#page[data-rafex-authority-mode="common"] [data-rafex-system-banner="common"] h2{margin:0!important;line-height:1.1!important}
#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker{width:100%!important;min-width:0!important;height:166px!important;min-height:166px!important;max-height:166px!important;margin:0 0 12px!important;padding:14px!important;box-sizing:border-box!important;overflow:hidden!important}
#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker .rafex-system-picker-head{height:38px!important;min-height:38px!important;margin:0 0 8px!important}
#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker .rafex-system-options{height:62px!important;min-height:62px!important;gap:8px!important}
#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker .rafex-system-option,#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker .rafex-system-option-body{height:62px!important;min-height:62px!important;box-sizing:border-box!important}
#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker .rafex-system-picker-actions{height:26px!important;min-height:26px!important;margin-top:8px!important;overflow:hidden!important}
#page[data-rafex-authority-mode="common"] .rafex-common-project-name-wrap{display:flex!important;width:100%!important;max-width:none!important;min-width:0!important;height:64px!important;min-height:64px!important;max-height:64px!important;margin:0 0 12px!important;padding:8px 10px!important;box-sizing:border-box!important;overflow:hidden!important;background:var(--rafex-authority-soft)!important}
#page[data-rafex-authority-mode="common"] .rafex-common-project-name-field{height:46px!important;min-height:46px!important}
#page[data-rafex-authority-mode="common"] #rafexCommonProjectName{height:32px!important;min-height:32px!important}
#page[data-rafex-authority-mode="common"] .rafex-common-project-name-wrap+*{margin-top:0!important}
@media(max-width:720px){#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker .rafex-system-options{height:auto!important;min-height:0!important}}
</style>
<script data-rafex-runtime-authority="v1">(function(){
  if(window.RafexRuntimeAuthority&&window.RafexRuntimeAuthority.version==='v1')return;
  var scheduled=0,lastKey='',viewerRequests=new Map();
  function normalize(value){value=String(value||'').trim().toLowerCase();if(value==='drive'||value==='drive-in'||value==='drivein')return 'drivein';if(value==='konsol'||value==='konsol-kollu')return 'konsol';if(value==='mekik'||value==='mekik2')return 'mekik2';return ['b2b','mr'].includes(value)?value:'';}
  function selectedSystem(page){var selected=document.querySelector('#rafexUnifiedSystemPicker input[name="rafexUnifiedSystem"]:checked');if(selected)return normalize(selected.value);var values=[page.dataset.rafexAuthoritySystem,page.dataset.rafexFreeContextSystem,page.dataset.freeSystem,page.dataset.rafexCommonSystem,page.dataset.m2Module];for(var i=0;i<values.length;i++){var value=normalize(values[i]);if(value)return value}return '';}
  function isCommon(page){return !!(page&&page.classList.contains('rafex-common-independent')&&document.getElementById('rafexUnifiedSystemPicker'));}
  function requestViewer(system){var loader=window.rafexLoadViewerOnDemandV3||window.rafexLoadHeavyViewerV1;if(typeof loader!=='function'||!['b2b','mr','drivein','mekik2','konsol'].includes(system))return;if(viewerRequests.has(system))return;try{var request=Promise.resolve(loader(system)).catch(function(error){viewerRequests.delete(system);console.warn('RAFEX authority viewer:',error)});viewerRequests.set(system,request)}catch(error){viewerRequests.delete(system)}}
  function commit(){scheduled=0;var page=document.getElementById('page');if(!page)return;if(!isCommon(page)){page.removeAttribute('data-rafex-authority-mode');page.removeAttribute('data-rafex-authority-system');lastKey='';return}var system=selectedSystem(page)||'b2b';page.setAttribute('data-rafex-authority-mode','common');page.setAttribute('data-rafex-authority-system',system);page.setAttribute('data-rafex-common-active','1');page.setAttribute('data-rafex-common-system',system);var key='common:'+system;if(key!==lastKey){lastKey=key;requestViewer(system);window.dispatchEvent(new CustomEvent('rafex-authority-state',{detail:{mode:'common',system:system}}))}}
  function schedule(){if(!scheduled)scheduled=requestAnimationFrame(commit)}
  document.addEventListener('change',function(event){if(event.target&&event.target.name==='rafexUnifiedSystem')schedule()},true);
  document.addEventListener('click',function(event){if(event.target&&event.target.closest&&event.target.closest('#rafexUnifiedSystemPicker'))schedule()},true);
  new MutationObserver(schedule).observe(document.getElementById('page')||document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','checked','data-rafex-common-active','data-rafex-common-system','data-rafex-free-context-system','data-free-system','data-m2-module']});
  window.RafexRuntimeAuthority={version:'v1',sync:commit,getState:function(){var page=document.getElementById('page');return {mode:page&&page.dataset.rafexAuthorityMode||'',system:page&&page.dataset.rafexAuthoritySystem||''}}};
  schedule();setTimeout(commit,120);setTimeout(commit,600);
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Runtime authority v1: body bulunamadi");
html = html.slice(0, bodyEnd) + authority + "\n" + html.slice(bodyEnd);

for (const required of [
  'data-rafex-runtime-authority="v1"',
  'window.RafexRuntimeAuthority=',
  'data-rafex-authority-system',
  '--rafex-authority-accent:#17699a',
  '--rafex-authority-accent:#765035'
]) if (!html.includes(required)) throw new Error("Runtime authority v1 eksigi: " + required);
if ((html.match(/data-rafex-runtime-authority="v1"/g) || []).length !== 2) throw new Error("Runtime authority v1 tekil degil");
if (html.includes('data-rafex-common-layout-theme="v96"')) throw new Error("Eski v96 tema otoritesi kaldirilmadi");

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("Runtime authority v1: Ortak Cizim durumu, tema, olculer ve viewer talepleri tek otoritede birlestirildi.");
