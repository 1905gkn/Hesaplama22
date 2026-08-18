import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build çıktısında bulunamadı.");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html.replace(/<script\s+data-rafex-custom-accessories=["']v\d+["'][^>]*>[\s\S]*?<\/script>/gi, "");
html = html.replace(/<style\s+data-rafex-custom-accessories-style=["']v\d+["'][^>]*>[\s\S]*?<\/style>/gi, "");
html = html.replace(/<div id="m2CustomizeAccessories"[\s\S]*?<\/div><div class="m2-customize-actions">/gi, '<div class="m2-customize-actions">');

const accessorySection = '<div id="m2CustomizeAccessories"><div class="m2-accessory-head"><b>AKSESUAR EKLE</b><button type="button" onclick="m2AddCustomizeAccessory()">+ Aksesuar</button></div><div id="m2CustomizeAccessoryRows"><div class="m2-accessory-empty">Bu modüle henüz aksesuar eklenmedi.</div></div></div>';
const actionsToken = '<div class="m2-customize-actions"><button type="button" onclick="m2CloseCustomizeModal()">Vazgeç</button>';
if (!html.includes('id="m2CustomizeAccessories"')) {
  if (!html.includes(actionsToken)) throw new Error("Özelleştir aksiyon alanı bulunamadı.");
  html = html.replace(actionsToken, `${accessorySection}${actionsToken}`);
}

const openToken = '        $("m2CustomizeModal").hidden=false;';
const openPatch = '        if(typeof m2RenderCustomizeAccessories==="function")m2RenderCustomizeAccessories(Array.isArray(rack?.accessories)?rack.accessories:[]);\n        $("m2CustomizeModal").hidden=false;';
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

const style = `<style data-rafex-custom-accessories-style="v2">
#m2CustomizeAccessories{margin-top:14px;padding:12px;border:1px solid #d6ded8;border-radius:10px;background:#f7f9f7;display:block!important}
.m2-accessory-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.m2-accessory-head b{font-size:12px;color:#173c2d;letter-spacing:.03em}
.m2-accessory-head button{padding:7px 10px;background:#edf2ee;color:#214f3b;border:1px solid #cbd8cf}
#m2CustomizeAccessoryRows{display:grid;gap:7px}
.m2-accessory-row{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(90px,.9fr) 72px 34px;gap:6px;align-items:end}
.m2-accessory-row label{font-size:9px;font-weight:700;color:#536058}
.m2-accessory-row input{width:100%;margin-top:4px;padding:8px;border:1px solid #d8dfda;border-radius:7px;background:#fff;font-weight:700}
.m2-accessory-row button{height:34px;padding:0;background:#f3e5e5;color:#9b2d2d}
.m2-accessory-empty{padding:8px 4px;color:#7b8780;font-size:10px}
</style>`;

const script = `<script data-rafex-custom-accessories="v2">
(function(){
  const esc=(value)=>String(value??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  window.m2CollectCustomizeAccessories=function(){
    return [...document.querySelectorAll('#m2CustomizeAccessoryRows [data-accessory-row]')].map((row)=>({
      name:String(row.querySelector('[data-accessory-name]')?.value||'').trim(),
      code:String(row.querySelector('[data-accessory-code]')?.value||'').trim().toUpperCase(),
      qty:Math.max(1,Math.round(Number(row.querySelector('[data-accessory-qty]')?.value)||1))
    })).filter((item)=>item.name||item.code);
  };
  window.m2RenderCustomizeAccessories=function(items){
    const host=document.getElementById('m2CustomizeAccessoryRows');
    if(!host)return;
    const list=Array.isArray(items)?items:[];
    if(!list.length){host.innerHTML='<div class="m2-accessory-empty">Bu modüle henüz aksesuar eklenmedi.</div>';return;}
    host.innerHTML=list.map((item,index)=>'<div class="m2-accessory-row" data-accessory-row>'+
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
})();
<\/script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Portal </body> kapanışı bulunamadı.");
html = `${html.slice(0, bodyEnd)}${style}${script}${html.slice(bodyEnd)}`;

if (!html.includes('id="m2CustomizeAccessories"') || !html.includes('AKSESUAR EKLE')) throw new Error("Aksesuar bölümü Özelleştir HTML içine eklenemedi.");
if (!html.includes('m2RenderCustomizeAccessories(Array.isArray(rack?.accessories)') || !html.includes('rack.accessories=m2CollectCustomizeAccessories()')) throw new Error("Aksesuar aç/kaydet bağlantısı eklenemedi.");
if (!html.includes('data-rafex-custom-accessories="v2"')) throw new Error("Aksesuar v2 scripti eklenemedi.");

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
