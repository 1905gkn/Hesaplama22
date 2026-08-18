import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-free-layout-followup="v1"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build çıktısında bulunamadı.");
let html = Buffer.from(match[3], "base64").toString("utf8");

// Uzatma aktifken ölçü etiketine tıklamak uzatmayı onaylamasın ve ölçü düzenleme akışını açmasın.
const autoFillClick = '          if (m2AutoFillDraft && !rackNode) { m2CommitAutoFillGuide(point); return; }';
const autoFillClickFixed = '          if (m2AutoFillDraft && dimensionNode) { const status=document.getElementById("m2FloorStatus"); if(status) status.textContent="Uzatma işlemi aktif. Ölçü düzenlemek için önce uzatmayı tamamla veya iptal et."; return; }\n          if (m2AutoFillDraft && !rackNode) { m2CommitAutoFillGuide(point); return; }';
html = html.replaceAll(autoFillClick, autoFillClickFixed);

// İlk 3D açılışında canvas eski/yarım kareyi göstermesin. Hazır olana kadar yalnız yükleme katmanı görünsün.
html = html.replaceAll(
  'class="b2b-main-3d-viewer" aria-label=',
  'class="b2b-main-3d-viewer" style="visibility:hidden" aria-label=',
);
html = html.replaceAll(
  'canvas.addEventListener("b2b-viewer-ready", () => { if ($("b2b3DLoading")) $("b2b3DLoading").hidden = true;',
  'canvas.addEventListener("b2b-viewer-ready", () => { canvas.style.visibility="visible"; if ($("b2b3DLoading")) $("b2b3DLoading").hidden = true;',
);

// Serbest alana gerçekten yeni blok eklendiğinde 3D modülü tekrar durdur.
// Böylece kullanıcı blokları eklerken WebGL sahnesi arka planda tekrar tekrar güncellenmez.
const followup = `<script ${marker}>(function(){
  if(window.__rafexFreeLayoutFollowupV1)return;window.__rafexFreeLayoutFollowupV1=true;
  function rackCount(){try{return Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks.length:0}catch{return 0}}
  function pauseIfAdded(before){setTimeout(()=>{if(rackCount()>before)window.rafexPauseB2B3D?.();},0)}
  function wrapAdd(name){try{const original=window[name];if(typeof original!=="function")return;window[name]=function(){const before=rackCount(),result=original.apply(this,arguments);if(result&&typeof result.then==="function")return result.finally(()=>pauseIfAdded(before));pauseIfAdded(before);return result;};}catch(error){console.warn(name+" 3D durdurma kancası kurulamadı",error)}}
  wrapAdd("m2AddRack");
  wrapAdd("m2DuplicateRack");
  wrapAdd("m2CommitAutoFillGuide");

  // Modülü Yenile basıldığında eski canvas karesi hiçbir an görünmesin.
  const originalResume=window.rafexResumeB2B3D;
  if(typeof originalResume==="function")window.rafexResumeB2B3D=function(){
    const canvas=document.getElementById("b2bMain3DCanvas"),loading=document.getElementById("b2b3DLoading");
    if(canvas)canvas.style.visibility="hidden";
    if(loading)loading.hidden=false;
    const reveal=()=>{if(canvas)canvas.style.visibility="visible";if(loading)loading.hidden=true;};
    canvas?.addEventListener("b2b-viewer-ready",reveal,{once:true});
    try{return originalResume.apply(this,arguments);}catch(error){reveal();throw error;}
  };
})();</script>`;

if (!html.includes(marker)) {
  const bodyEnd = html.lastIndexOf("</body>");
  if (bodyEnd < 0) throw new Error("Portal </body> kapanışı bulunamadı.");
  html = `${html.slice(0, bodyEnd)}${followup}${html.slice(bodyEnd)}`;
}

if (!html.includes("Uzatma işlemi aktif. Ölçü düzenlemek için önce uzatmayı tamamla veya iptal et.")) throw new Error("Uzatma/ölçü koruması eklenemedi.");
if (!html.includes('wrapAdd("m2AddRack")') || !html.includes('wrapAdd("m2CommitAutoFillGuide")')) throw new Error("Blok ekleme 3D durdurma kancası eklenemedi.");
if (!html.includes('style="visibility:hidden" aria-label=') || !html.includes('canvas.style.visibility="visible"')) throw new Error("3D geçiş görünürlüğü düzeltmesi eklenemedi.");

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
