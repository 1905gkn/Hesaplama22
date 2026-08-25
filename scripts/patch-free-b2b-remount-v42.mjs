import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("Ortak Cizim B2B 3D v42: HTML_BASE64 bulunamadi");

let html = Buffer.from(match[2], "base64").toString("utf8");
html = html.replace(/<script\s+data-rafex-free-b2b-remount="v42">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`<script data-rafex-free-b2b-remount="v42">
(function(){
  if(window.__rafexFreeB2BRemountV42)return;
  window.__rafexFreeB2BRemountV42=true;

  var remountToken=0;

  function isCommonPage(){
    var page=document.getElementById('page');
    return !!(page&&(page.dataset?.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page')));
  }

  function selectedB2B(){
    return document.querySelector('input[name="rafexUnifiedSystem"]:checked')?.value==='b2b';
  }

  function hasLiveCanvas(){
    return !!document.querySelector('#m2Front #b2bMain3DCanvas');
  }

  function restoreLiveB2B(token){
    if(token!==remountToken||!isCommonPage()||!selectedB2B())return;
    try{
      if(!hasLiveCanvas()&&typeof b2bInstallMain3D==='function')b2bInstallMain3D();
      var canvas=document.getElementById('b2bMain3DCanvas');
      if(!canvas)return;
      canvas.style.visibility='visible';
      window.__rafexFreeLayout3DStopped=false;
      document.getElementById('rafexB2BPausedOverlay')?.remove();
      if(typeof b2bUpdateMain3D==='function')b2bUpdateMain3D();
      window.RafexB2BViewer?.setView?.('perspective');
      if(typeof b2bSetCameraAngles==='function')b2bSetCameraAngles();
    }catch(error){console.warn('Ortak Cizim B2B 3D yeniden baglanamadi',error);}
  }

  document.addEventListener('change',function(event){
    var input=event.target?.closest?.('input[name="rafexUnifiedSystem"]');
    if(!input||input.value!=='b2b')return;
    var token=++remountToken;
    // v40 yerlesim geri yuklemeleri 0/80/220 ms'de m2Front'u yeniden cizer.
    // Son geri yuklemeden sonra gercek WebGL tuvalli B2B gorunumunu kesin olarak bagla.
    [260,420,700].forEach(function(delay){setTimeout(function(){restoreLiveB2B(token);},delay);});
  },true);
})();
</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Ortak Cizim B2B 3D v42: </body> bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

for (const required of [
  'data-rafex-free-b2b-remount="v42"',
  '__rafexFreeB2BRemountV42',
  "#m2Front #b2bMain3DCanvas",
  "b2bInstallMain3D()",
  "setView?.('perspective')"
]) {
  if (!html.includes(required)) throw new Error(`Ortak Cizim B2B 3D v42 dogrulama hatasi: ${required}`);
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[0].replace(match[2], encoded) + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("v42: Ortak Cizimde B2B secilince yerlesim geri yuklemesinden sonra canli 3D yeniden baglanir.");
