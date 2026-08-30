import fs from "node:fs";

const target = "dist/server/index.js";
let source = fs.readFileSync(target, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1\s*;/);
if (!match) throw new Error("Mekik front clear v1: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[2], "base64").toString("utf8");

// d6111ab ile geri gelen v91 scripti Ortak Cizim kaydi + Mekik front override'ini birlikte tasiyordu.
// Tum scripti kaldirip yalniz Ortak Cizim kayit normalizasyonunu geri ekliyoruz.
html = html
  .replace(/<script\s+data-rafex-common-save-mekik-front="v91">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<script\s+data-rafex-common-save-only="v92">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<style\s+data-rafex-mekik-front-visual-clear="v1">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-mekik-front-visual-clear="v1">[\s\S]*?<\/script>\s*/g, "");

const commonSaveOnly = String.raw`<script data-rafex-common-save-only="v92">(function(){
  if(window.__rafexCommonSaveOnlyV92)return;
  window.__rafexCommonSaveOnlyV92=true;
  function realCommon(){
    var picker=document.getElementById('rafexUnifiedSystemPicker');
    var active=false;
    try{active=typeof window.rafexUnifiedFreeDrawingActiveV75==='function'&&window.rafexUnifiedFreeDrawingActiveV75()===true;}catch(error){}
    return !!(picker&&active);
  }
  var nativeFetch=window.fetch;
  if(typeof nativeFetch==='function'&&!nativeFetch.__rafexCommonSaveOnlyV92){
    var wrappedFetch=function(input,init){
      var url=typeof input==='string'?input:(input&&input.url)||'';
      var opts=init||{};
      if(realCommon()&&/\/api\/projects(?:\?|$)/.test(url)&&String(opts.method||'GET').toUpperCase()==='POST'&&typeof opts.body==='string'){
        try{
          var body=JSON.parse(opts.body);
          body.module='ortak';
          if(body.payload&&typeof body.payload==='object'){
            body.payload.module='ortak';
            body.payload.rafexCommonDrawing=true;
          }
          opts=Object.assign({},opts,{body:JSON.stringify(body)});
        }catch(error){console.warn('Ortak Cizim kayit govdesi normalize edilemedi',error);}
      }
      return nativeFetch.call(this,input,opts);
    };
    wrappedFetch.__rafexCommonSaveOnlyV92=true;
    window.fetch=wrappedFetch;
  }
})();</script>`;

const clearRuntime = String.raw`<style data-rafex-mekik-front-visual-clear="v1">
#m2Front[data-rafex-mekik-front-cleared="v1"]>*{display:none!important;visibility:hidden!important;opacity:0!important}
</style>
<script data-rafex-mekik-front-visual-clear="v1">(function(){
  if(window.__rafexMekikFrontVisualClearV1)return;
  window.__rafexMekikFrontVisualClearV1=true;

  var clearing=false;
  var observedHost=null;
  var hostObserver=null;

  function isMekik(){
    try{
      if(typeof m2ActiveModule!=='undefined')return String(m2ActiveModule)==='mekik2';
    }catch(error){}
    var page=document.getElementById('page');
    if(!page||page.classList.contains('drive-in-mode'))return false;
    var module=String((page.dataset&&page.dataset.m2Module)||'');
    if(module)return module==='mekik2';
    var title=String(document.getElementById('pageTitle')?.textContent||'').toLocaleLowerCase('tr-TR');
    return title==='mekik';
  }

  function clearFront(){
    var host=document.getElementById('m2Front');
    if(!host)return;
    if(isMekik()){
      host.setAttribute('data-rafex-mekik-front-cleared','v1');
      if(host.childNodes.length){
        clearing=true;
        host.replaceChildren();
        clearing=false;
      }
    }else{
      host.removeAttribute('data-rafex-mekik-front-cleared');
    }
  }

  function observeFront(){
    var host=document.getElementById('m2Front');
    if(!host||host===observedHost)return;
    if(hostObserver)hostObserver.disconnect();
    observedHost=host;
    hostObserver=new MutationObserver(function(){
      if(clearing)return;
      queueMicrotask(clearFront);
    });
    hostObserver.observe(host,{childList:true,subtree:false});
  }

  function schedule(){
    observeFront();
    requestAnimationFrame(clearFront);
  }

  var rootObserver=new MutationObserver(schedule);
  rootObserver.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-m2-module']});
  document.addEventListener('click',function(){setTimeout(schedule,0)},true);
  document.addEventListener('input',function(){setTimeout(schedule,0)},true);
  document.addEventListener('change',function(){setTimeout(schedule,0)},true);
  window.addEventListener('load',schedule);
  window.addEventListener('hashchange',schedule);
  schedule();
  setTimeout(schedule,100);
  setTimeout(schedule,400);
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Mekik front clear v1: </body> bulunamadi.");
html = html.slice(0, closing) + commonSaveOnly + "\n" + clearRuntime + "\n" + html.slice(closing);

if (html.includes('data-rafex-mekik-front="restored-v91"')) throw new Error("Mekik front clear v1: rollback v91 front override hala build icinde.");
if (!html.includes('data-rafex-common-save-only="v92"')) throw new Error("Mekik front clear v1: Ortak Cizim save-only korumasi eklenemedi.");
if (!html.includes('data-rafex-mekik-front-visual-clear="v1"')) throw new Error("Mekik front clear v1: final temizleme runtime eklenemedi.");

const encoded = Buffer.from(html, "utf8").toString("base64");
source = source.replace(match[0], `const HTML_BASE64 =\n  "${encoded}";`);
fs.writeFileSync(target, source);
console.log("Mekik front clear v1: rollback v91 front override removed; Mekik m2Front SVG/GLB/raster visuals cleared; side/calculations untouched.");
