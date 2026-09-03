import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Runtime authority v2: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");

for (const version of ["v96", "v1", "v2"]) {
  const attr = version === "v96" ? "data-rafex-common-layout-theme" : "data-rafex-runtime-authority";
  html = html
    .replace(new RegExp(`<style\\s+${attr}="${version}">[\\s\\S]*?<\\/style>\\s*`, "g"), "")
    .replace(new RegExp(`<script\\s+${attr}="${version}">[\\s\\S]*?<\\/script>\\s*`, "g"), "");
}

const authority = String.raw`<style data-rafex-runtime-authority="v2">
#page[data-rafex-authority-mode="common"]{--rafex-authority-accent:#214f3b;--rafex-authority-soft:#edf4f0}
#page[data-rafex-authority-mode="common"][data-rafex-authority-system="drivein"]{--rafex-authority-accent:#17699a;--rafex-authority-soft:#eaf5fb}
#page[data-rafex-authority-mode="common"][data-rafex-authority-system="konsol"]{--rafex-authority-accent:#765035;--rafex-authority-soft:#f5eee8}
#page[data-rafex-authority-mode="common"] [data-rafex-system-banner="common"]{width:100%!important;height:94px!important;min-height:94px!important;max-height:94px!important;margin:0 0 10px!important;padding:20px 26px!important;box-sizing:border-box!important;background:var(--rafex-authority-accent)!important;overflow:hidden!important}
#page[data-rafex-authority-mode="common"] [data-rafex-system-banner="common"] h2{margin:0!important;line-height:1.1!important}
#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker{display:block!important;width:100%!important;min-width:0!important;height:78px!important;min-height:78px!important;max-height:78px!important;margin:0 0 10px!important;padding:8px 10px!important;box-sizing:border-box!important;overflow:hidden!important}
#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker .rafex-system-picker-head,#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker .rafex-system-picker-actions{display:none!important}
#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker .rafex-system-options{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;height:60px!important;min-height:60px!important;gap:8px!important;margin:0!important}
#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker .rafex-system-option,#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker .rafex-system-option-body{display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:60px!important;min-height:60px!important;box-sizing:border-box!important;margin:0!important}
#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker .rafex-system-option-body small,#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker .rafex-system-option-body em{display:none!important}
#page[data-rafex-authority-mode="common"] .rafex-common-project-name-wrap{display:flex!important;visibility:visible!important;width:100%!important;max-width:none!important;min-width:0!important;height:64px!important;min-height:64px!important;max-height:64px!important;margin:0 0 12px!important;padding:8px 10px!important;box-sizing:border-box!important;overflow:hidden!important;background:var(--rafex-authority-soft)!important}
#page[data-rafex-authority-mode="common"] .rafex-common-project-name-field{display:flex!important;flex-direction:column!important;width:100%!important;height:46px!important;min-height:46px!important}
#page[data-rafex-authority-mode="common"] #rafexAuthorityProjectName{display:block!important;width:100%!important;height:32px!important;min-height:32px!important;box-sizing:border-box!important}
#page[data-rafex-authority-mode="common"] #rafexCommonProjectName{display:none!important}
#page[data-rafex-authority-mode="common"] .rafex-common-project-name-wrap+*{margin-top:0!important}
@media(max-width:720px){#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}#page[data-rafex-authority-mode="common"] #rafexUnifiedSystemPicker .rafex-system-options{grid-template-columns:repeat(2,minmax(0,1fr))!important;height:auto!important;min-height:0!important}}
</style>
<script data-rafex-runtime-authority="v2">(function(){
  if(window.RafexRuntimeAuthority&&window.RafexRuntimeAuthority.version==='v2')return;
  var scheduled=0,lastKey='',projectName='',pickerNode=null,projectNode=null,viewerRequests=new Map();
  function normalize(value){value=String(value||'').trim().toLowerCase();if(value==='drive'||value==='drive-in'||value==='drivein')return 'drivein';if(value==='konsol'||value==='konsol-kollu')return 'konsol';if(value==='mekik'||value==='mekik2')return 'mekik2';return ['b2b','mr'].includes(value)?value:'';}
  function selectedSystem(page){var selected=document.querySelector('#rafexUnifiedSystemPicker input[name="rafexUnifiedSystem"]:checked');if(selected)return normalize(selected.value);var values=[page.dataset.rafexAuthoritySystem,page.dataset.rafexFreeContextSystem,page.dataset.freeSystem,page.dataset.rafexCommonSystem,page.dataset.m2Module];for(var i=0;i<values.length;i++){var value=normalize(values[i]);if(value)return value}return '';}
  function isCommon(page){var active=document.querySelector('#nav button.active[data-page]');return !!(page&&page.classList.contains('rafex-common-independent')&&active&&active.dataset.page==='free');}
  function leaveCommon(page){if(pickerNode&&pickerNode.isConnected)pickerNode.remove();if(projectNode&&projectNode.isConnected)projectNode.remove();page.querySelectorAll('[data-rafex-system-banner="common"]').forEach(function(node){node.remove()});page.removeAttribute('data-rafex-authority-mode');page.removeAttribute('data-rafex-authority-system');page.removeAttribute('data-rafex-common-active');page.removeAttribute('data-rafex-common-system');page.classList.remove('rafex-common-independent','rafex-free-drawing-page','rafex-common-project-name-active-v88','rafex-common-b2b','rafex-common-mekik','rafex-common-drivein','rafex-common-mr','rafex-common-konsol');lastKey='';}
  function ensurePicker(page){var live=document.getElementById('rafexUnifiedSystemPicker');if(live)pickerNode=live;if(!pickerNode)return null;if(!pickerNode.isConnected){var banner=page.querySelector('[data-rafex-system-banner="common"]');if(banner)banner.insertAdjacentElement('afterend',pickerNode);else page.insertAdjacentElement('afterbegin',pickerNode);}return pickerNode;}
  function ensureProject(picker){var wraps=Array.from(document.querySelectorAll('.rafex-common-project-name-wrap'));if(!projectNode){var oldInput=wraps[0]&&wraps[0].querySelector('#rafexCommonProjectName');projectName=oldInput&&oldInput.value||projectName;projectNode=document.createElement('section');projectNode.className='card rafex-common-project-name-wrap';projectNode.innerHTML='<label class="rafex-common-project-name-field"><span>Proje Adı</span><input id="rafexAuthorityProjectName" type="text" placeholder="Ortak proje adını yaz" autocomplete="off"><input id="rafexCommonProjectName" type="hidden"></label>';projectNode.querySelector('#rafexAuthorityProjectName').addEventListener('input',function(event){projectName=event.target.value;event.stopPropagation();schedule()},true);}wraps.forEach(function(node){if(node!==projectNode)node.remove()});var wrap=projectNode;if(wrap.hidden)wrap.hidden=false;if(wrap.hasAttribute('hidden'))wrap.removeAttribute('hidden');if(wrap.getAttribute('data-rafex-authority-project-name')!=='v2')wrap.setAttribute('data-rafex-authority-project-name','v2');if(picker.nextElementSibling!==wrap)picker.insertAdjacentElement('afterend',wrap);var input=wrap.querySelector('#rafexAuthorityProjectName'),legacy=wrap.querySelector('#rafexCommonProjectName');if(input&&input.value!==projectName)input.value=projectName;if(legacy&&legacy.value!==projectName)legacy.value=projectName;return wrap;}
  function requestViewer(system){var loader=window.rafexLoadViewerOnDemandV3||window.rafexLoadHeavyViewerV1;if(typeof loader!=='function'||!['b2b','mr','drivein','mekik2','konsol'].includes(system))return;if(viewerRequests.has(system))return;try{var request=Promise.resolve(loader(system)).catch(function(error){viewerRequests.delete(system);console.warn('RAFEX authority viewer:',error)});viewerRequests.set(system,request)}catch(error){viewerRequests.delete(system)}}
  function commit(){scheduled=0;var page=document.getElementById('page');if(!page)return;if(!isCommon(page)){leaveCommon(page);return}var picker=ensurePicker(page);if(!picker)return;ensureProject(picker);var system=selectedSystem(page)||'b2b';page.setAttribute('data-rafex-authority-mode','common');page.setAttribute('data-rafex-authority-system',system);page.setAttribute('data-rafex-common-active','1');page.setAttribute('data-rafex-common-system',system);var key='common:'+system;if(key!==lastKey){lastKey=key;requestViewer(system);window.dispatchEvent(new CustomEvent('rafex-authority-state',{detail:{mode:'common',system:system}}))}}
  function schedule(){if(!scheduled)scheduled=requestAnimationFrame(commit)}
  window.addEventListener('input',function(event){if(event.target&&event.target.id==='rafexAuthorityProjectName'){projectName=event.target.value;event.stopPropagation();schedule()}},true);
  document.addEventListener('input',function(event){if(event.target&&event.target.id==='rafexAuthorityProjectName')projectName=event.target.value},true);
  document.addEventListener('change',function(event){if(event.target&&event.target.name==='rafexUnifiedSystem')schedule()},true);
  document.addEventListener('click',function(event){if(event.target&&event.target.closest&&event.target.closest('#rafexUnifiedSystemPicker'))schedule()},true);
  new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden','checked','data-rafex-common-active','data-rafex-common-system','data-rafex-free-context-system','data-free-system','data-m2-module']});
  window.RafexRuntimeAuthority={version:'v2',sync:commit,getState:function(){var page=document.getElementById('page');return {mode:page&&page.dataset.rafexAuthorityMode||'',system:page&&page.dataset.rafexAuthoritySystem||'',projectName:projectName}}};
  schedule();setTimeout(commit,120);setTimeout(commit,600);
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Runtime authority v2: body bulunamadi");
html = html.slice(0, bodyEnd) + authority + "\n" + html.slice(bodyEnd);

if ((html.match(/data-rafex-runtime-authority="v2"/g) || []).length !== 2) throw new Error("Runtime authority v2 tekil degil");
if (html.includes('data-rafex-runtime-authority="v1"') || html.includes('data-rafex-common-layout-theme="v96"')) throw new Error("Eski tema otoritesi kaldirilmadi");

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("Runtime authority v2: sade besli sistem secimi ve sabit proje adi etkinlestirildi.");
