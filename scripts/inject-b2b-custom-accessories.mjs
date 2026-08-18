import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build çıktısında bulunamadı.");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html.replace(/<script\s+data-rafex-custom-accessories=["']v\d+["'][^>]*>[\s\S]*?<\/script>/gi, "");
html = html.replace(/<style\s+data-rafex-custom-accessories-style=["']v\d+["'][^>]*>[\s\S]*?<\/style>/gi, "");

const modalStart = html.indexOf('id="m2CustomizeModal"');
if (modalStart < 0) throw new Error("m2CustomizeModal bulunamadı.");
const modalEnd = html.indexOf('id="m2SymbolModal"', modalStart);
if (modalEnd < 0) throw new Error("Özelleştir modal sınırı bulunamadı.");
let modalHtml = html.slice(modalStart, modalEnd);

const accessorySection = '<div id="m2CustomizeAccessories" class="m2-custom-accessories"><div class="m2-accessory-head"><div><b>AKSESUAR EKLE</b><small>Bu rafa proje aksesuarı ekle</small></div><button type="button" onclick="m2AddCustomizeAccessory()">+ Aksesuar</button></div><div id="m2CustomizeAccessoryRows"><div class="m2-accessory-empty">Bu modüle henüz aksesuar eklenmedi.</div></div></div>';
const blockNameToken = '<label>Blok adı<input id="m2CustomizeBlockName"';
if (!modalHtml.includes('id="m2CustomizeAccessories"')) {
  if (!modalHtml.includes(blockNameToken)) throw new Error("Özelleştir Blok adı alanı bulunamadı.");
  modalHtml = modalHtml.replace(blockNameToken, `${accessorySection}${blockNameToken}`);
}
html = html.slice(0, modalStart) + modalHtml + html.slice(modalEnd);

const openToken = '        $("m2CustomizeModal").hidden=false;';
const openPatch = '        if(typeof m2EnsureCustomizeAccessories==="function")m2EnsureCustomizeAccessories();\n        if(typeof m2RenderCustomizeAccessories==="function")m2RenderCustomizeAccessories(Array.isArray(rack?.accessories)?rack.accessories:[]);\n        $("m2CustomizeModal").hidden=false;\n        requestAnimationFrame(()=>{if(typeof m2EnsureCustomizeAccessories==="function")m2EnsureCustomizeAccessories();});';
if (!html.includes(openPatch)) {
  if (!html.includes(openToken)) throw new Error("Özelleştir açılış noktası bulunamadı.");
  html = html.replace(openToken, openPatch);
}

const saveToken = '        m2PushUndo("Raf özelleştirme");';
const savePatch = '        m2PushUndo("Raf özelleştirme");\n        if(typeof m2CollectCustomizeAccessories==="function")rack.accessories=m2CollectCustomizeAccessories();';
if (!html.includes(savePatch)) {
  if (!html.includes(saveToken)) throw new Error("Özelleştir kaydetme noktası bulunamadı.");
  html = html.replace(saveToken, savePatch);
}

const style = `<style data-rafex-custom-accessories-style="v4">
#m2CustomizeModal .m2-customize-dialog aside{overflow-y:auto!important;max-height:min(92vh,900px)!important;padding-bottom:18px!important}
#m2CustomizeAccessories{display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:999!important;margin:8px 0 14px!important;padding:13px!important;border:2px solid #f2c500!important;border-radius:11px!important;background:#fff8d5!important;flex:0 0 auto!important;width:100%!important}
#m2CustomizeAccessories .m2-accessory-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;margin:0 0 8px!important}
#m2CustomizeAccessories .m2-accessory-head>div{display:grid!important;gap:2px!important}
#m2CustomizeAccessories .m2-accessory-head b{display:block!important;font-size:13px!important;color:#173c2d!important;letter-spacing:.04em!important}
#m2CustomizeAccessories .m2-accessory-head small{display:block!important;font-size:9px!important;color:#68736c!important}
#m2CustomizeAccessories .m2-accessory-head button{display:block!important;padding:8px 11px!important;background:#214f3b!important;color:#fff!important;border:0!important;border-radius:8px!important}
#m2CustomizeAccessoryRows{display:grid!important;gap:7px!important}
.m2-accessory-row{display:grid!important;grid-template-columns:minmax(0,1.35fr) minmax(80px,.9fr) 68px 32px!important;gap:6px!important;align-items:end!important}
.m2-accessory-row label{display:block!important;font-size:9px!important;font-weight:700!important;color:#536058!important}
.m2-accessory-row input{display:block!important;width:100%!important;margin-top:4px!important;padding:8px!important;border:1px solid #d8dfda!important;border-radius:7px!important;background:#fff!important;font-weight:700!important}
.m2-accessory-row button{height:34px!important;padding:0!important;background:#f3e5e5!important;color:#9b2d2d!important}
.m2-accessory-empty{display:block!important;padding:8px 4px!important;color:#6f786f!important;font-size:10px!important}
@media(max-height:760px){#m2CustomizeModal .m2-customize-dialog aside{max-height:88vh!important}}
</style>`;

const runtimeSection = accessorySection.replaceAll('`', '&#96;');
const script = `<script data-rafex-custom-accessories="v4">
(function(){
  const SECTION_HTML=${JSON.stringify(runtimeSection)};
  const esc=(value)=>String(value??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  let lastItems=[];
  let ensureQueued=false;

  window.m2EnsureCustomizeAccessories=function(){
    const modal=document.getElementById('m2CustomizeModal');
    if(!modal)return null;
    const blockInput=modal.querySelector('#m2CustomizeBlockName');
    const anchor=blockInput?.closest('label')||blockInput;
    if(!anchor||!anchor.parentNode)return modal.querySelector('#m2CustomizeAccessories');
    let section=modal.querySelector('#m2CustomizeAccessories');
    if(!section){
      const holder=document.createElement('div');
      holder.innerHTML=SECTION_HTML;
      section=holder.firstElementChild;
      if(section)anchor.parentNode.insertBefore(section,anchor);
    }else if(section.parentNode!==anchor.parentNode||section.nextElementSibling!==anchor){
      anchor.parentNode.insertBefore(section,anchor);
    }
    return section;
  };

  window.m2CollectCustomizeAccessories=function(){
    window.m2EnsureCustomizeAccessories();
    return [...document.querySelectorAll('#m2CustomizeAccessoryRows [data-accessory-row]')].map((row)=>({
      name:String(row.querySelector('[data-accessory-name]')?.value||'').trim(),
      code:String(row.querySelector('[data-accessory-code]')?.value||'').trim().toUpperCase(),
      qty:Math.max(1,Math.round(Number(row.querySelector('[data-accessory-qty]')?.value)||1))
    })).filter((item)=>item.name||item.code);
  };

  window.m2RenderCustomizeAccessories=function(items){
    lastItems=Array.isArray(items)?items.map((item)=>({...item})):[];
    const section=window.m2EnsureCustomizeAccessories();
    const host=section?.querySelector('#m2CustomizeAccessoryRows')||document.getElementById('m2CustomizeAccessoryRows');
    if(!host)return;
    if(!lastItems.length){host.innerHTML='<div class="m2-accessory-empty">Bu modüle henüz aksesuar eklenmedi.</div>';return;}
    host.innerHTML=lastItems.map((item,index)=>'<div class="m2-accessory-row" data-accessory-row>'+
      '<label>Aksesuar adı<input data-accessory-name type="text" maxlength="60" value="'+esc(item?.name)+'" placeholder="Örn. Stoplama aparatı"></label>'+
      '<label>Kod<input data-accessory-code type="text" maxlength="40" value="'+esc(item?.code)+'" placeholder="Ürün kodu"></label>'+
      '<label>Adet<input data-accessory-qty type="number" min="1" max="9999" step="1" value="'+Math.max(1,Math.round(Number(item?.qty)||1))+'"></label>'+
      '<button type="button" title="Aksesuarı sil" onclick="m2RemoveCustomizeAccessory('+index+')">×</button></div>').join('');
  };

  window.m2AddCustomizeAccessory=function(){
    const list=window.m2CollectCustomizeAccessories();
    list.push({name:'',code:'',qty:1});
    window.m2RenderCustomizeAccessories(list);
    requestAnimationFrame(()=>document.querySelector('#m2CustomizeAccessoryRows [data-accessory-row]:last-child [data-accessory-name]')?.focus());
  };

  window.m2RemoveCustomizeAccessory=function(index){
    const list=window.m2CollectCustomizeAccessories();
    list.splice(Number(index)||0,1);
    window.m2RenderCustomizeAccessories(list);
  };

  const keepVisible=()=>{
    const modal=document.getElementById('m2CustomizeModal');
    if(!modal||modal.hidden)return;
    const hadSection=!!modal.querySelector('#m2CustomizeAccessories');
    const section=window.m2EnsureCustomizeAccessories();
    if(section&&!hadSection&&lastItems.length)window.m2RenderCustomizeAccessories(lastItems);
  };
  const queueEnsure=()=>{
    if(ensureQueued)return;
    ensureQueued=true;
    requestAnimationFrame(()=>{ensureQueued=false;keepVisible();});
  };
  const attachObserver=()=>{
    const modal=document.getElementById('m2CustomizeModal');
    if(!modal||modal.dataset.rafexAccessoryObserved==='1')return;
    modal.dataset.rafexAccessoryObserved='1';
    new MutationObserver(queueEnsure).observe(modal,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  };
  attachObserver();
  window.m2EnsureCustomizeAccessories();
  document.addEventListener('click',(event)=>{
    const target=event.target instanceof Element?event.target:null;
    if(!target)return;
    if(target.closest('[onclick*="m2OpenCustomize"],#m2CustomizeRackButton,[data-action*="custom"]')){
      requestAnimationFrame(()=>{attachObserver();keepVisible();});
      setTimeout(keepVisible,40);
    }
  },true);
})();
<\/script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Portal </body> kapanışı bulunamadı.");
html = `${html.slice(0, bodyEnd)}${style}${script}${html.slice(bodyEnd)}`;

if (!html.includes('data-rafex-custom-accessories="v4"')) throw new Error("Aksesuar v4 runtime eklenemedi.");
if (!html.includes('m2EnsureCustomizeAccessories') || !html.includes('new MutationObserver(queueEnsure)')) throw new Error("Aksesuar runtime görünürlük koruması eklenemedi.");
if (!html.includes('rack.accessories=m2CollectCustomizeAccessories()')) throw new Error("Aksesuar kaydetme bağlantısı eklenemedi.");
if (!html.includes('AKSESUAR EKLE') || !html.includes('+ Aksesuar')) throw new Error("Aksesuar görünür metni eklenemedi.");

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
