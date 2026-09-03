import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Common layout theme v96: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html
  .replace(/<style\s+data-rafex-common-layout-theme="v96">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-common-layout-theme="v96">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-common-layout-theme="v96">
/* Ortak Cizim'in ust dort blogu sistem degisimlerinde ayni olcude kalir. */
#page[data-rafex-common-active="1"]{--rafex-common-accent:#214f3b;--rafex-common-soft:#edf4f0}
#page[data-rafex-common-active="1"][data-rafex-layout-theme="drivein"]{--rafex-common-accent:#17699a;--rafex-common-soft:#eaf5fb}
#page[data-rafex-common-active="1"][data-rafex-layout-theme="konsol"]{--rafex-common-accent:#765035;--rafex-common-soft:#f5eee8}
#page[data-rafex-common-active="1"]>.hero:first-child{
  width:100%!important;height:94px!important;min-height:94px!important;max-height:94px!important;
  margin:0 0 12px!important;padding:20px 26px!important;box-sizing:border-box!important;
  background:var(--rafex-common-accent)!important;overflow:hidden!important
}
#page[data-rafex-common-active="1"]>.hero:first-child h2{margin:0!important;line-height:1.1!important}
#page[data-rafex-common-active="1"] #rafexUnifiedSystemPicker{
  width:100%!important;min-width:0!important;height:166px!important;min-height:166px!important;max-height:166px!important;
  margin:0 0 12px!important;padding:14px!important;box-sizing:border-box!important;overflow:hidden!important
}
#page[data-rafex-common-active="1"] #rafexUnifiedSystemPicker .rafex-system-picker-head{height:38px!important;min-height:38px!important;margin:0 0 8px!important}
#page[data-rafex-common-active="1"] #rafexUnifiedSystemPicker .rafex-system-options{height:62px!important;min-height:62px!important;gap:8px!important}
#page[data-rafex-common-active="1"] #rafexUnifiedSystemPicker .rafex-system-option,
#page[data-rafex-common-active="1"] #rafexUnifiedSystemPicker .rafex-system-option-body{height:62px!important;min-height:62px!important;box-sizing:border-box!important}
#page[data-rafex-common-active="1"] #rafexUnifiedSystemPicker .rafex-system-picker-actions{height:26px!important;min-height:26px!important;margin-top:8px!important;overflow:hidden!important}
#page[data-rafex-common-active="1"] .rafex-common-project-name-wrap{
  display:flex!important;width:100%!important;max-width:none!important;min-width:0!important;
  height:64px!important;min-height:64px!important;max-height:64px!important;
  margin:0 0 12px!important;padding:8px 10px!important;box-sizing:border-box!important;overflow:hidden!important;
  background:var(--rafex-common-soft)!important;border-color:color-mix(in srgb,var(--rafex-common-accent) 22%,#d9e4dc)!important
}
#page[data-rafex-common-active="1"] .rafex-common-project-name-field{height:46px!important;min-height:46px!important}
#page[data-rafex-common-active="1"] #rafexCommonProjectName{height:32px!important;min-height:32px!important}
#page[data-rafex-common-active="1"] .rafex-common-project-name-wrap+*{margin-top:0!important}
@media(max-width:720px){
  #page[data-rafex-common-active="1"] #rafexUnifiedSystemPicker{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
  #page[data-rafex-common-active="1"] #rafexUnifiedSystemPicker .rafex-system-options{height:auto!important;min-height:0!important}
}
</style>
<script data-rafex-common-layout-theme="v96">(function(){
  if(window.__rafexCommonLayoutThemeV96)return;window.__rafexCommonLayoutThemeV96=true;
  var frame=0;
  function normalize(value){value=String(value||'').toLowerCase();if(value==='drive'||value==='drive-in'||value==='drivein')return 'drivein';if(value==='konsol'||value==='konsol-kollu')return 'konsol';if(value==='mekik')return 'mekik2';return value;}
  function sync(){frame=0;var page=document.getElementById('page');if(!page||page.getAttribute('data-rafex-common-active')!=='1')return;var selected=document.querySelector('#rafexUnifiedSystemPicker input[name="rafexUnifiedSystem"]:checked');var system=normalize(selected&&selected.value||page.dataset.rafexFreeContextSystem||page.dataset.freeSystem||page.dataset.rafexCommonSystem);if(system)page.setAttribute('data-rafex-layout-theme',system);}
  function queue(){if(!frame)frame=requestAnimationFrame(sync)}
  document.addEventListener('change',function(event){if(event.target&&event.target.name==='rafexUnifiedSystem')queue()},true);
  document.addEventListener('click',function(event){if(event.target&&event.target.closest&&event.target.closest('#rafexUnifiedSystemPicker'))queue()},true);
  new MutationObserver(queue).observe(document.getElementById('page')||document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-rafex-common-active','data-rafex-common-system','data-rafex-free-context-system','data-free-system']});
  queue();setTimeout(sync,120);setTimeout(sync,500);
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Common layout theme v96: body bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);
for (const required of ['data-rafex-common-layout-theme="v96"','data-rafex-layout-theme="drivein"','--rafex-common-accent:#17699a','--rafex-common-accent:#765035']) {
  if (!html.includes(required)) throw new Error("Common layout theme v96 dogrulama eksigi: " + required);
}
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v96: Ortak Cizim ust bloklari sabitlendi; Drive-In mavi, Konsol kahverengi tema aldi.");
