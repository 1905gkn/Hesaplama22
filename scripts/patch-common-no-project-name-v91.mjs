import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Common no project name v91: HTML_BASE64 bulunamadi");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-common-no-project-name="v91">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-common-no-project-name="v91">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-common-no-project-name="v91">
/* Ortak Cizim'de tek ortak Proje Adi sabit kalir; sistemlerin yerel alanlari gizlenir. */
#page.rafex-common-no-project-name-v91 .rafex-native-project-name-v87,
#page.rafex-common-no-project-name-v91 .m2-project-name,
#page.rafex-common-no-project-name-v91 label:has(#m2ProjectName),
#page.rafex-common-no-project-name-v91 label:has(#b2bProjectName),
#page.rafex-common-no-project-name-v91 label:has(#mrProjectName){display:none!important}
</style>
<script data-rafex-common-no-project-name="v91">(function(){
  if(window.__rafexCommonNoProjectNameV91)return;
  window.__rafexCommonNoProjectNameV91=true;
  var queued=false;
  function realCommon(){
    var page=document.getElementById('page');
    var picker=document.getElementById('rafexUnifiedSystemPicker');
    return !!(page&&(document.body?.classList.contains('rafex-common-header-v95')||(picker&&page.contains(picker)&&page.classList.contains('rafex-free-drawing-page'))));
  }
  function hideNativeProjectFields(page){
    if(!page)return;
    page.querySelectorAll('.rafex-common-project-name-wrap').forEach(function(node){node.hidden=false;node.removeAttribute('aria-hidden');});
    page.querySelectorAll('#m2ProjectName,#b2bProjectName,#mrProjectName').forEach(function(input){
      var label=input.closest('label');
      if(label){label.hidden=true;label.setAttribute('aria-hidden','true');}
    });
  }
  function restoreStandalone(page){
    if(!page)return;
    page.querySelectorAll('.rafex-common-project-name-wrap').forEach(function(node){node.hidden=false;node.removeAttribute('aria-hidden');});
    page.querySelectorAll('#m2ProjectName,#b2bProjectName,#mrProjectName').forEach(function(input){
      var label=input.closest('label');
      if(label){label.hidden=false;label.removeAttribute('aria-hidden');}
    });
  }
  function sync(){
    queued=false;
    var page=document.getElementById('page');if(!page)return;
    var active=realCommon();
    page.classList.toggle('rafex-common-no-project-name-v91',active);
    if(active)hideNativeProjectFields(page);else restoreStandalone(page);
  }
  function queue(){if(queued)return;queued=true;requestAnimationFrame(sync);}
  document.addEventListener('click',function(event){
    if(event.target?.closest?.('#nav button[data-page],#rafexUnifiedSystemPicker')){setTimeout(sync,0);setTimeout(sync,80);}
  },true);
  document.addEventListener('change',function(event){
    if(event.target?.matches?.('input[name="rafexUnifiedSystem"]'))queue();
  },true);
  var nav=document.getElementById('nav');if(nav)new MutationObserver(queue).observe(nav,{attributes:true,subtree:true,attributeFilter:['class']});
  var page=document.getElementById('page');if(page)new MutationObserver(queue).observe(page,{childList:true,subtree:true});
  sync();setTimeout(sync,120);setTimeout(sync,500);
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Common no project name v91: </body> bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

for (const required of [
  'data-rafex-common-no-project-name="v91"',
  'rafex-common-no-project-name-v91',
  '.rafex-common-project-name-wrap',
  '#m2ProjectName,#b2bProjectName,#mrProjectName',
  'function realCommon()'
]) if (!html.includes(required)) throw new Error("Common no project name v91 dogrulama eksigi: "+required);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v91: Ortak Cizim'de tek ortak Proje Adi sabit kalir; sistemlerin yerel alanlari gizlenir.");

