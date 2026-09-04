import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Common Mekik input v101: HTML_BASE64 bulunamadı");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html
  .replace(/<style\s+data-rafex-common-mekik-input="v101">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-common-mekik-input="v101">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-common-mekik-input="v101">
/* Yalnız Ortak Çizim > Mekik. B2B ölçü ve tipografi düzeni referanstır. */
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .m2-layout{
  grid-template-columns:420px minmax(0,1fr)!important;align-items:start!important;gap:18px!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card{
  position:sticky!important;top:88px!important;width:100%!important;max-width:420px!important;
  max-height:calc(100vh - 108px)!important;padding:0!important;overflow:auto!important;
  border:1px solid #dcc5ca!important;border-radius:13px!important;background:#fff!important;
  box-shadow:0 10px 26px rgba(67,12,21,.08)!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card>.rafex-common-measure-head{
  position:sticky!important;top:0!important;z-index:4!important;margin:0!important;
  padding:16px 18px 12px!important;border-radius:0!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card>.m2-form{
  grid-template-columns:1fr 1fr!important;gap:12px 9px!important;padding:14px 18px 4px!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .m2-project-name{display:none!important}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .input-field{
  min-width:0!important;margin:0!important;display:grid!important;align-content:start!important;gap:6px!important;
  color:#5f3038!important;font-size:10px!important;line-height:1.25!important;font-weight:850!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .input-field>input,
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .input-field>select,
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .classic-choice{
  box-sizing:border-box!important;width:100%!important;min-height:40px!important;margin:0!important;padding:9px 10px!important;
  border:1px solid #d9c7cb!important;border-radius:9px!important;background:#fff!important;color:#351218!important;
  font:800 12px/1.2 Arial,sans-serif!important;box-shadow:none!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .m2-foot-choice,
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .m2-spec-choice,
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .m2-traverse-placeholder,
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .choice-field{grid-column:1/-1!important}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .m2-foot-choice-row{
  grid-template-columns:minmax(0,1fr) 94px!important;gap:7px!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .m2-foot-manual-button{
  min-width:94px!important;min-height:40px!important;padding:7px!important;border:1px solid #173c2d!important;
  border-radius:9px!important;background:#173c2d!important;color:#fff!important;font-size:9px!important;font-weight:900!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .m2-segment{
  gap:6px!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .m2-segment button{
  min-height:36px!important;padding:7px 5px!important;border:1px solid #d7c0c5!important;border-radius:8px!important;
  background:#f8f0f2!important;color:#6b2835!important;font-size:10px!important;font-weight:850!important;box-shadow:none!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .m2-segment button.active{
  border-color:#173c2d!important;background:#173c2d!important;color:#fff!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .m2-limit,
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .m2-foot-recommendation{
  margin:0!important;color:#8a7c7f!important;font-size:9px!important;line-height:1.35!important;font-weight:700!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .m2-traverse-placeholder{
  padding:10px!important;border:1px solid #e3ced2!important;border-radius:9px!important;background:#fbf4f5!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card>.m2-metrics{
  gap:7px!important;margin:10px 18px 0!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .m2-metric{
  padding:10px!important;border:0!important;border-radius:9px!important;background:#f5e9eb!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .m2-metric small{font-size:8px!important}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card .m2-metric b{margin-top:4px!important;font-size:12px!important}
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card>.m2-plan,
#page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card>.m2-note{
  margin-left:18px!important;margin-right:18px!important
}
@media(max-width:1100px){
  #page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .m2-layout{grid-template-columns:380px minmax(0,1fr)!important}
}
@media(max-width:900px){
  #page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .m2-layout{grid-template-columns:1fr!important}
  #page[data-rafex-common-active="1"][data-rafex-common-system="mekik2"] .rafex-common-mekik-input-card{position:static!important;max-width:none!important;max-height:none!important}
}
</style>
<script data-rafex-common-mekik-input="v101">(function(){
  if(window.__rafexCommonMekikInputV101)return;window.__rafexCommonMekikInputV101=true;
  var frame=0;
  function sync(){
    frame=0;var page=document.getElementById('page');
    if(!page||page.getAttribute('data-rafex-common-active')!=='1'||page.getAttribute('data-rafex-common-system')!=='mekik2')return;
    var card=page.querySelector('.m2-layout>.card');
    if(card&&!card.classList.contains('rafex-common-mekik-input-card'))card.classList.add('rafex-common-mekik-input-card');
  }
  function queue(){if(!frame)frame=requestAnimationFrame(sync)}
  new MutationObserver(queue).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-rafex-common-active','data-rafex-common-system']});
  window.addEventListener('rafex-authority-state',queue);queue();setTimeout(sync,120);setTimeout(sync,500);
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Common Mekik input v101: body bulunamadı");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

for (const required of [
  'data-rafex-common-mekik-input="v101"',
  '[data-rafex-common-system="mekik2"] .m2-layout',
  'rafex-common-mekik-input-card',
  'grid-template-columns:420px minmax(0,1fr)',
  "card.classList.add('rafex-common-mekik-input-card')",
]) {
  if (!html.includes(required)) throw new Error("Common Mekik input v101 doğrulama eksiği: " + required);
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v101: Ortak Çizim Mekik giriş paneli B2B ölçü ve tipografi düzenine getirildi.");
