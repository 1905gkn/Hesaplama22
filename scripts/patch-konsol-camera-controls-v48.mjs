import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for Konsol camera controls v48");
let html = Buffer.from(match[2], "base64").toString("utf8");

html = html
  .replace(/<style data-rafex-konsol-camera-controls="v48">[\s\S]*?<\/style>/g, "")
  .replace(/<script data-rafex-konsol-camera-controls="v48">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`
<style data-rafex-konsol-camera-controls="v48">
#page .kcf-camera-hint{display:flex;align-items:center;gap:8px;margin:8px 0 10px;padding:8px 10px;border:1px solid #cddbd2;border-radius:8px;background:#f5f9f6;color:#315747;font-size:10px;font-weight:800}
#page .kcf-camera-hint b{color:#173c2d}
#page [data-kcf-action="focus"],#page [data-kcf-action="fit"]{border-color:#2f8060!important;background:#edf7f1!important;color:#174a35!important}
#page [data-kcf-action="focus"]:hover,#page [data-kcf-action="fit"]:hover{background:#dff0e6!important}
</style>
<script data-rafex-konsol-camera-controls="v48">
(function(){
  if(window.__rafexKonsolCameraControlsV48)return;
  window.__rafexKonsolCameraControlsV48=true;
  var timer=0,baseRender=window.renderKonsol;

  function byId(id){return document.getElementById(id)}
  function getApi(){return window.rafexKonsolFreeApiV46}
  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(function(){
      if(!byId("kcfCanvas")&&typeof window.rafexMountKonsolCommonDrawingV46==="function"){
        try{window.rafexMountKonsolCommonDrawingV46()}catch(err){console.error("[Konsol kamera v48 mount]",err)}
      }
      ensure();
    },35);
  }
  function wrapAdd(api){
    if(!api||api.__rafexAutoFocusV48||typeof api.addSpec!=="function")return;
    var original=api.addSpec;
    api.addSpec=function(){
      var ok=original.apply(api,arguments);
      if(ok)setTimeout(function(){try{api.focusSelected&&api.focusSelected()}catch(_){}},30);
      return ok;
    };
    api.__rafexAutoFocusV48=true;
  }
  function makeButton(action,label){
    var button=document.createElement("button");
    button.type="button";
    button.dataset.kcfAction=action;
    button.textContent=label;
    return button;
  }
  function bind(button,action,api){
    if(!button||button.dataset.rafexCameraV48)return;
    button.dataset.rafexCameraV48="1";
    button.addEventListener("click",function(event){
      event.preventDefault();
      event.stopImmediatePropagation();
      if(action==="focus"){
        if(!api.focusSelected||!api.focusSelected())window.alert("Önce serbest alandan bir raf seç.");
      }else if(action==="fit"&&api.fitAll)api.fitAll();
    },true);
  }
  function ensure(){
    var svg=byId("konsolFreeSvg"),api=getApi();
    if(!svg||!api)return false;
    wrapAdd(api);

    var card=svg.closest(".kcf-card");
    if(!card)return false;
    var group=card.querySelector(".kcf-tools .kcf-group:last-child")||card.querySelector(".kcf-tools");
    if(!group)return false;

    var focus=group.querySelector('[data-kcf-action="focus"]')||card.querySelector('[data-kcf-action="focus"]');
    var fit=group.querySelector('[data-kcf-action="fit"]')||card.querySelector('[data-kcf-action="fit"]');
    var anchor=group.querySelector('[data-kcf-action="measure"]');

    if(!focus){
      focus=makeButton("focus","Seçili Rafa Yaklaş");
      if(anchor)group.insertBefore(focus,anchor);else group.appendChild(focus);
    }
    if(!fit){
      fit=makeButton("fit","Tüm Projeyi Göster");
      if(anchor)group.insertBefore(fit,anchor);else group.appendChild(fit);
    }
    bind(focus,"focus",api);
    bind(fit,"fit",api);

    var canvas=byId("kcfCanvas");
    if(canvas&&!canvas.querySelector(".kcf-camera-hint")){
      var hint=document.createElement("div");
      hint.className="kcf-camera-hint";
      hint.innerHTML="<b>GÖRÜNÜM:</b> Tekerlek ile yakınlaştır/uzaklaştır · boş zemini sürükleyerek alanı kaydır · raf eklenince seçili rafa otomatik yaklaşır.";
      canvas.insertBefore(hint,canvas.firstChild);
    }
    svg.dataset.rafexCameraControls="v48";
    card.dataset.rafexCameraControls="v48";
    return true;
  }

  window.renderKonsol=function(){
    if(typeof baseRender==="function")baseRender.apply(this,arguments);
    [0,50,160,420,900].forEach(function(ms){setTimeout(schedule,ms)});
  };
  document.addEventListener("click",function(event){
    if(event.target.closest('[data-page="konsol"]'))[0,80,220,600,1200].forEach(function(ms){setTimeout(schedule,ms)});
  },true);

  var observer=new MutationObserver(function(records){
    for(var i=0;i<records.length;i++){
      var target=records[i].target;
      if(target&&(target.id==="page"||(target.closest&&target.closest("#page")))){schedule();break}
    }
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.rafexEnsureKonsolCameraControlsV48=ensure;
  [0,80,250,700,1500].forEach(function(ms){setTimeout(schedule,ms)});
})();
</script>`;

const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("body close missing for Konsol camera controls v48");
html = html.slice(0, close) + runtime + "\n" + html.slice(close);

for (const required of [
  'data-rafex-konsol-camera-controls="v48"',
  "rafexEnsureKonsolCameraControlsV48",
  "Seçili Rafa Yaklaş",
  "Tüm Projeyi Göster",
  "rafexAutoFocusV48"
]) {
  if (!html.includes(required)) throw new Error("Konsol camera controls v48 missing: " + required);
}

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v48: Konsol serbest yerleşim yakınlaştırma, kaydırma, otomatik odak ve görünüm düğmeleri kalıcı bağlandı.");
