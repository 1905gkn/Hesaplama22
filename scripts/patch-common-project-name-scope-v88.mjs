import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Common project name scope v88: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");
if (!html.includes('data-rafex-common-project-name="v87"')) throw new Error("Common project name scope v88: v87 bulunamadi");

html = html
  .replace(/<style\s+data-rafex-common-project-name-scope="v88">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-common-project-name-scope="v88">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-common-project-name-scope="v88">
/* v87'de kalan free-drawing class'i standalone sayfalari etkilemesin. */
#page:not(.rafex-common-project-name-active-v88) .rafex-native-project-name-v87{display:revert!important}
#page.rafex-common-project-name-active-v88 .rafex-native-project-name-v87{display:none!important}
#page:not(.rafex-common-project-name-active-v88) .rafex-common-project-name-wrap{display:none!important}
#page.rafex-common-project-name-active-v88 .rafex-common-project-name-wrap{display:flex!important}
</style>
<script data-rafex-common-project-name-scope="v88">(function(){
  if(window.__rafexCommonProjectNameScopeV88)return;
  window.__rafexCommonProjectNameScopeV88=true;
  var queued=false;
  function realCommon(){
    var page=document.getElementById('page');
    var picker=document.getElementById('rafexUnifiedSystemPicker');
    return !!(page&&(document.body?.classList.contains('rafex-common-header-v95')||(picker&&page.contains(picker)&&page.classList.contains('rafex-free-drawing-page'))));
  }
  function sync(){
    queued=false;
    var page=document.getElementById('page');if(!page)return;
    var active=realCommon();
    page.classList.toggle('rafex-common-project-name-active-v88',active);
    if(!active){
      page.querySelectorAll('.rafex-native-project-name-v87').forEach(function(node){
        node.style.removeProperty('display');
      });
    }
  }
  function queue(){if(queued)return;queued=true;requestAnimationFrame(sync);}
  document.addEventListener('click',function(event){
    if(event.target?.closest?.('#nav button[data-page]')){setTimeout(sync,0);setTimeout(sync,80);}
  },true);
  document.addEventListener('change',function(event){
    if(event.target?.matches?.('input[name="rafexUnifiedSystem"]'))queue();
  },true);
  var nav=document.getElementById('nav');if(nav)new MutationObserver(queue).observe(nav,{attributes:true,subtree:true,attributeFilter:['class']});
  var page=document.getElementById('page');if(page)new MutationObserver(queue).observe(page,{childList:true,subtree:false});
  sync();setTimeout(sync,150);setTimeout(sync,600);
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Common project name scope v88: </body> bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);
for (const required of [
  'data-rafex-common-project-name-scope="v88"',
  'rafex-common-project-name-active-v88',
  "document.body?.classList.contains('rafex-common-header-v95')",
  'rafexUnifiedSystemPicker'
]) if (!html.includes(required)) throw new Error("Common project name scope v88 dogrulama eksigi: "+required);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v88: Proje Adi gizleme yalniz gercek Ortak Cizim aktifken uygulanir; B2B/MR/Mekik/Drive-In/Konsol kendi sayfalarinda eski alanlarini korur.");

await import("./patch-global-pdf-gate-v89.mjs");

