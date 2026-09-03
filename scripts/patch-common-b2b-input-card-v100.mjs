import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Common B2B input v100: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html
  .replace(/<style\s+data-rafex-common-b2b-input="v100">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-common-b2b-input="v100">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-common-b2b-input="v100">
/* Yalniz Ortak Cizim > B2B hesap girdileri. Diger sistemler ve bagimsiz B2B etkilenmez. */
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-input-card{
  width:100%!important;max-width:420px!important;padding:0!important;overflow:auto!important;
  border:1px solid #dcc5ca!important;border-radius:13px!important;background:#fff!important;
  box-shadow:0 10px 26px rgba(67,12,21,.08)!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-input-head{
  position:sticky!important;top:0!important;z-index:3!important;display:flex!important;
  align-items:center!important;justify-content:space-between!important;gap:12px!important;
  padding:16px 18px 12px!important;border-bottom:1px solid #eadcdf!important;
  background:#fff!important;color:#17231c!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-input-head h3{
  margin:0!important;color:#17231c!important;font-size:17px!important;line-height:1.2!important;font-weight:900!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-input-head span{
  display:block!important;margin:0!important;color:#8a7c7f!important;font-size:9px!important;line-height:1.2!important;font-weight:700!important;white-space:nowrap!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-input-body{
  display:grid!important;gap:12px!important;padding:14px 18px 18px!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-input-body>.b2b-field:has(#b2bProjectName),
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-input-body>.b2b-field:has(#b2bTunnelPicker){display:none!important}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .m2-views>.m2-view-tabs,
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .m2-views>.m2-export{display:none!important}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-field{gap:6px!important;color:#5f3038!important;font-size:10px!important;line-height:1.25!important;font-weight:850!important}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-field-row{gap:9px!important}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-field input,
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-field select{
  min-height:40px!important;padding:9px 10px!important;border:1px solid #d9c7cb!important;border-radius:9px!important;
  background:#fff!important;color:#351218!important;font:800 12px/1.2 Arial,sans-serif!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-choice{gap:6px!important}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-choice button{
  min-height:36px!important;padding:7px 5px!important;border:1px solid #d7c0c5!important;border-radius:8px!important;
  background:#f8f0f2!important;color:#6b2835!important;font-size:10px!important;font-weight:850!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-choice button.active{
  border-color:#761b2a!important;background:#761b2a!important;color:#fff!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-accessory-area{
  order:0!important;margin-top:3px!important;padding-top:14px!important;border-top:1px solid #e4dadd!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-accessory-launch{
  width:100%!important;min-height:44px!important;padding:10px 12px!important;border:1px solid #173c2d!important;
  border-radius:8px!important;background:#173c2d!important;color:#fff!important;font-size:13px!important;font-weight:900!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-accessory-list{margin-top:9px!important}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-accessory-empty{
  min-height:34px!important;display:grid!important;place-items:center!important;padding:7px 10px!important;
  border:1px dashed #ccd7cf!important;border-radius:8px!important;background:#fff!important;color:#8a8f8b!important;font-size:9px!important
}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-result{gap:7px!important}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-result div{padding:10px!important;border-radius:9px!important;background:#f5e9eb!important}
#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-recommendation{border-radius:11px!important;background:#fbf4f5!important}
#page[data-rafex-common-active="1"] .rafex-common-measure-head{
  display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;
  padding:16px 18px 12px!important;border-bottom:1px solid #eadcdf!important;background:#fff!important;color:#17231c!important
}
#page[data-rafex-common-active="1"] .rafex-common-measure-head h3{
  margin:0!important;color:#17231c!important;font-size:17px!important;line-height:1.2!important;font-weight:900!important
}
#page[data-rafex-common-active="1"] .rafex-common-measure-head span{
  display:block!important;margin:0!important;color:#8a7c7f!important;font-size:9px!important;line-height:1.2!important;font-weight:700!important;white-space:nowrap!important
}
#page[data-rafex-common-active="1"] .m2-config-card>.rafex-common-measure-head{margin:-20px -20px 14px!important}
#page[data-rafex-common-active="1"] .mr-panel>.rafex-common-measure-head{margin:-14px -14px 12px!important;border-radius:14px 14px 0 0!important}
#page[data-rafex-common-active="1"] .konsol-panel>.rafex-common-measure-head{margin:-15px -15px 14px!important;border-radius:14px 14px 0 0!important}
@media(max-width:900px){#page[data-rafex-common-active="1"][data-rafex-common-system="b2b"].b2b-mode .b2b-input-card{max-width:none!important}}
</style>
<script data-rafex-common-b2b-input="v100">(function(){
  if(window.__rafexCommonB2BInputV100)return;window.__rafexCommonB2BInputV100=true;
  var frame=0;
  function active(page){return !!(page&&page.getAttribute('data-rafex-common-active')==='1'&&page.getAttribute('data-rafex-common-system')==='b2b'&&page.classList.contains('b2b-mode'));}
  function sharedHead(page){
    if(!page||page.getAttribute('data-rafex-common-active')!=='1')return;
    var system=page.getAttribute('data-rafex-common-system')||'',head=null;
    if(system==='mr'){
      var mrInput=page.querySelector('#mrProjectName,#mrModuleCount,#mrLevels');
      head=mrInput&&mrInput.closest('.mr-panel')&&mrInput.closest('.mr-panel').querySelector(':scope>.mr-panel-head');
    }else if(system==='konsol'){
      var panel=page.querySelector('#konsolUprightCount,#konsolHeight')?.closest('.konsol-panel');
      head=panel&&panel.querySelector(':scope>h3,:scope>.rafex-common-measure-head');
    }else if(system==='mekik2'||system==='drive'){
      head=page.querySelector('.m2-config-card>.card-title,.m2-config-card>.rafex-common-measure-head');
    }
    if(!head||head.classList.contains('rafex-common-measure-head'))return;
    var replacement=document.createElement('div');replacement.className='rafex-common-measure-head';
    replacement.innerHTML='<h3>Raf Ölçüleri</h3><span>Anında güncellenir</span>';head.replaceWith(replacement);
  }
  function sync(){
    frame=0;var page=document.getElementById('page');sharedHead(page);if(!active(page))return;
    var card=page.querySelector('.b2b-input-card'),body=card&&card.querySelector('.b2b-input-body');if(!card||!body)return;
    var title=card.querySelector('.b2b-input-head h3'),note=card.querySelector('.b2b-input-head span');
    if(title&&title.textContent!=='Raf Ölçüleri')title.textContent='Raf Ölçüleri';
    if(note&&note.textContent!=='Anında güncellenir')note.textContent='Anında güncellenir';
    var result=body.querySelector('.b2b-result'),accessories=body.querySelector('#b2bAccessoryArea,.b2b-accessory-area');
    if(result&&accessories&&accessories.nextElementSibling!==result)body.insertBefore(accessories,result);
  }
  function queue(){if(!frame)frame=requestAnimationFrame(sync);}
  new MutationObserver(queue).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-rafex-common-active','data-rafex-common-system']});
  window.addEventListener('rafex-authority-state',queue);
  document.addEventListener('click',function(event){if(event.target&&event.target.closest&&event.target.closest('#rafexUnifiedSystemPicker'))setTimeout(queue,0)},true);
  queue();setTimeout(sync,120);setTimeout(sync,500);setTimeout(sync,1200);
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Common B2B input v100: body bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

for (const required of [
  'data-rafex-common-b2b-input="v100"',
  '[data-rafex-common-system="b2b"].b2b-mode .b2b-input-card',
  "title.textContent='Raf Ölçüleri'",
  "note.textContent='Anında güncellenir'",
  "body.insertBefore(accessories,result)",
  '.m2-views>.m2-export{display:none!important}',
  "replacement.innerHTML='<h3>Raf Ölçüleri</h3><span>Anında güncellenir</span>'",
]) {
  if (!html.includes(required)) throw new Error("Common B2B input v100 dogrulama eksigi: " + required);
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v100: Ortak Cizim sistem giris basliklari Raf Olculeri olarak esitlendi; B2B referans duzeni korundu.");
