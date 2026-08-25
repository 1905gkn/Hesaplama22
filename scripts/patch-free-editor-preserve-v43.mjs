import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("Ortak Cizim editor korumasi v43: HTML_BASE64 bulunamadi");

let html = Buffer.from(match[2], "base64").toString("utf8");
html = html.replace(/<script\s+data-rafex-free-editor-preserve="v43">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`<script data-rafex-free-editor-preserve="v43">
(function(){
  if(window.__rafexFreeEditorPreserveV43)return;
  window.__rafexFreeEditorPreserveV43=true;

  function isCommonPage(){
    var page=document.getElementById('page');
    return !!(page&&(page.dataset?.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page')));
  }

  function originalRestore(){
    var fn=window.m2RestoreModuleState;
    return fn?.__rafexOriginalRestore||fn;
  }

  function install(){
    var original=window.m2InitLayoutEditor;
    if(typeof original!=='function'||original.__rafexCommonPreserveV43)return false;

    var wrapped=function(){
      var snapshot=null;
      if(isCommonPage()&&typeof m2CaptureModuleState==='function'){
        try{snapshot=m2CaptureModuleState();}catch(error){console.warn('Ortak Cizim editor snapshot alinamadi',error);}
      }

      var result=original.apply(this,arguments);

      if(snapshot&&isCommonPage()){
        try{
          var restore=originalRestore();
          if(typeof restore==='function')restore.call(window,snapshot);
          requestAnimationFrame(function(){
            try{
              if(typeof m2RenderLayout==='function')m2RenderLayout();
              if(typeof m2RenderLayoutProductList==='function')m2RenderLayoutProductList();
              if(typeof m2RenderSavedRackTypes==='function')m2RenderSavedRackTypes();
            }catch(error){console.warn('Ortak Cizim editor yerlesimi cizilemedi',error);}
          });
        }catch(error){console.warn('Ortak Cizim editor yerlesimi korunamadi',error);}
      }
      return result;
    };

    wrapped.__rafexCommonPreserveV43=true;
    wrapped.__rafexOriginalInit=original;
    try{m2InitLayoutEditor=wrapped;}catch{}
    window.m2InitLayoutEditor=wrapped;
    return true;
  }

  if(!install()){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
    setTimeout(install,0);
  }
})();
</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Ortak Cizim editor korumasi v43: </body> bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

for (const required of [
  'data-rafex-free-editor-preserve="v43"',
  '__rafexFreeEditorPreserveV43',
  '__rafexOriginalInit',
  'm2InitLayoutEditor=wrapped',
  'restore.call(window,snapshot)'
]) {
  if (!html.includes(required)) throw new Error(`Ortak Cizim editor korumasi v43 dogrulama hatasi: ${required}`);
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[0].replace(match[2], encoded) + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("v43: Ortak Cizimde sistem degisince editor kurulumu mevcut alan, raf, olcu ve sembolleri sifirlamaz.");
