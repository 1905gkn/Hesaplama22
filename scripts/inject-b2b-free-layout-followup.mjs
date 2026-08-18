import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerPath = path.join(root, "dist/server/index.js");
const marker = 'data-rafex-free-layout-followup="v2"';

let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("HTML_BASE64 build çıktısında bulunamadı.");
let html = Buffer.from(match[3], "base64").toString("utf8");

// Uzatma aktifken genel ölçü etiketine tıklamak uzatmayı onaylamasın ve ölçü düzenlemeyi açmasın.
const autoFillClick = '          if (m2AutoFillDraft && !rackNode) { m2CommitAutoFillGuide(point); return; }';
const autoFillClickFixed = '          if (m2AutoFillDraft && dimensionNode) { const status=document.getElementById("m2FloorStatus"); if(status) status.textContent="Uzatma işlemi aktif. Ölçüler bu sırada pasif."; return; }\n          if (m2AutoFillDraft && !rackNode) { m2CommitAutoFillGuide(point); return; }';
html = html.replaceAll(autoFillClick, autoFillClickFixed);

// Duvar mesafeleri kendi inline pointer handler'ında propagation'ı durdurduğu için SVG korumasına hiç ulaşmıyordu.
// Sol/sağ/üst/alt duvar ölçülerinin tamamını uzatma sırasında doğrudan burada pasifleştir.
html = html.replaceAll(
  "onpointerdown=\"event.stopPropagation();if(m2LayoutTool!=='dimension'){event.preventDefault();m2PromptWallDistance(",
  "onpointerdown=\"event.stopPropagation();if(m2AutoFillDraft){event.preventDefault();const s=document.getElementById('m2FloorStatus');if(s)s.textContent='Uzatma işlemi aktif. Duvar mesafeleri bu sırada pasif.';return;}if(m2LayoutTool!=='dimension'){event.preventDefault();m2PromptWallDistance(",
);

// Serbest alana normal + Raf Ekle ile blok girer girmez üst 3D alanını Modülü Yenile durumuna al.
// Runtime wrapper'a güvenmek yerine gerçek m2AddRack gövdesine doğrudan çağrı ekle.
html = html.replaceAll(
  '        m2PushUndo("Raf ekleme");m2LayoutState.racks.push(rack);\n        m2LayoutState.selected = id;',
  '        m2PushUndo("Raf ekleme");m2LayoutState.racks.push(rack);setTimeout(()=>window.rafexPauseB2B3D?.(),0);\n        m2LayoutState.selected = id;',
);

// Uzatma ile eklenen yeni bloklarda da üst 3D yenile ekranında kalsın.
html = html.replaceAll(
  '          const actualCount=probe.b2bLayout.palletCount,actualSection=m2B2BSectionWidth(probe.b2bLayout,actualCount),group=anchor.joinGroup||source.joinGroup||`auto-${source.id}`;anchor.joinGroup=group;probe.joinGroup=group;probe.sharedFootWith=anchor.id;probe.sharedFootSide=direction>0?"left":"right";m2LayoutState.racks.push(probe);anchor=probe;',
  '          const actualCount=probe.b2bLayout.palletCount,actualSection=m2B2BSectionWidth(probe.b2bLayout,actualCount),group=anchor.joinGroup||source.joinGroup||`auto-${source.id}`;anchor.joinGroup=group;probe.joinGroup=group;probe.sharedFootWith=anchor.id;probe.sharedFootSide=direction>0?"left":"right";m2LayoutState.racks.push(probe);window.rafexPauseB2B3D?.();anchor=probe;',
);

// İlk 3D açılışında canvas eski/yarım kareyi göstermesin. Hazır olana kadar yalnız yükleme katmanı görünsün.
html = html.replaceAll(
  'class="b2b-main-3d-viewer" aria-label=',
  'class="b2b-main-3d-viewer" style="visibility:hidden" aria-label=',
);
html = html.replaceAll(
  'canvas.addEventListener("b2b-viewer-ready", () => { if ($("b2b3DLoading")) $("b2b3DLoading").hidden = true;',
  'canvas.addEventListener("b2b-viewer-ready", () => { canvas.style.visibility="visible"; if ($("b2b3DLoading")) $("b2b3DLoading").hidden = true;',
);

const followup = `<script ${marker}>(function(){
  if(window.__rafexFreeLayoutFollowupV2)return;window.__rafexFreeLayoutFollowupV2=true;

  // Son güvenlik: fonksiyon başka bir akıştan çağrılırsa da yeni blok sonrası 3D'yi durdur.
  function rackCount(){try{return Array.isArray(m2LayoutState?.racks)?m2LayoutState.racks.length:0}catch{return 0}}
  function pauseIfAdded(before){setTimeout(()=>{if(rackCount()>before)window.rafexPauseB2B3D?.();},0)}
  function wrapAdd(name){try{const original=window[name];if(typeof original!=="function")return;window[name]=function(){const before=rackCount(),result=original.apply(this,arguments);if(result&&typeof result.then==="function")return result.finally(()=>pauseIfAdded(before));pauseIfAdded(before);return result;};}catch(error){console.warn(name+" 3D durdurma kancası kurulamadı",error)}}
  wrapAdd("m2AddRack");
  wrapAdd("m2DuplicateRack");
  wrapAdd("m2CommitAutoFillGuide");

  // Uzatma aktifken duvar ölçüsü handler'ı hangi sebeple eski kaldıysa çağrı seviyesinde de engelle.
  try{
    const originalWall=window.m2PromptWallDistance;
    if(typeof originalWall==="function")window.m2PromptWallDistance=function(){
      if(typeof m2AutoFillDraft!=="undefined"&&m2AutoFillDraft){const status=document.getElementById("m2FloorStatus");if(status)status.textContent="Uzatma işlemi aktif. Duvar mesafeleri bu sırada pasif.";return;}
      return originalWall.apply(this,arguments);
    };
  }catch{}

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

if (!html.includes("Uzatma işlemi aktif. Duvar mesafeleri bu sırada pasif.")) throw new Error("Uzatma/duvar ölçüsü koruması eklenemedi.");
if (!html.includes('m2LayoutState.racks.push(rack);setTimeout(()=>window.rafexPauseB2B3D?.(),0)')) throw new Error("Normal blok ekleme 3D durdurması eklenemedi.");
if (!html.includes('wrapAdd("m2AddRack")') || !html.includes('wrapAdd("m2CommitAutoFillGuide")')) throw new Error("Blok ekleme 3D güvenlik kancası eklenemedi.");
if (!html.includes('style="visibility:hidden" aria-label=') || !html.includes('canvas.style.visibility="visible"')) throw new Error("3D geçiş görünürlüğü düzeltmesi eklenemedi.");

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
