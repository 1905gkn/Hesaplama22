import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Common wording/palette v94: HTML_BASE64 bulunamadi");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-common-wording-palette="v94">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-common-wording-palette="v94">[\s\S]*?<\/script>\s*/g, "")
  .replaceAll("SERBEST ÇİZİM", "ORTAK ÇİZİM")
  .replaceAll("Serbest Çizim", "Ortak Çizim")
  .replaceAll("Serbest çizim", "Ortak çizim")
  .replaceAll("serbest çizim", "ortak çizim")
  // B2B'nin onaylı palet (#9a6028) ve kutu (#c58b47) renklerini
  // ekran, ortak plan ve kendinden stilli PDF SVG'lerinde tek standarda getir.
  .replaceAll("#d7a44f", "#c58b47")
  .replaceAll("#d8a44d", "#c58b47")
  .replaceAll("#d6a25d", "#9a6028")
  .replaceAll("#a96928", "#9a6028")
  .replaceAll("#edbd78", "#9a6028")
  .replaceAll("#d69c50", "#9a6028")
  .replaceAll("#a96d2c", "#9a6028")
  .replace("page.querySelector('.hero');", "page.querySelector('.hero,.mr-hero');");

const runtime = String.raw`<style data-rafex-common-wording-palette="v94">
:root{--rafex-pallet-color:#9a6028;--rafex-box-color:#c58b47}
#page.rafex-free-drawing-page #rafexUnifiedAddModule{display:none!important}
#page.rafex-free-drawing-page #rafexUnifiedSystemPicker .rafex-system-picker-actions{justify-content:flex-start!important}
#page.rafex-free-drawing-page .rafex-common-project-name-wrap{display:flex!important;flex:1 1 470px!important;max-width:470px!important;min-width:260px!important}
#page.rafex-free-drawing-page .rafex-common-project-name-field{align-items:stretch!important;width:100%!important}
#page.rafex-free-drawing-page #rafexCommonProjectName{width:100%!important;height:42px!important}
.m2-pallet,.m2-pallet-base,.m2-pallet-real,.m2-front-pallet,.m2-side-pallet{fill:var(--rafex-pallet-color)!important}
.m2-load,.m2-pallet-surface,.m2-layout-pallet,.m2-b2b-plan-pallet,.m2-front-box,.m2-side-box{fill:var(--rafex-box-color)!important;stroke:#744719!important}
.m2-b2b-plan-pallet-line,.m2-pallet-board,.m2-pallet-slat{stroke:var(--rafex-pallet-color)!important}
@media(max-width:720px){#page.rafex-free-drawing-page .rafex-common-project-name-wrap{flex-basis:100%!important;max-width:none!important;min-width:0!important}}
</style>
<script data-rafex-common-wording-palette="v94">(function(){
  if(window.__rafexCommonWordingPaletteV94)return;
  window.__rafexCommonWordingPaletteV94=true;
  function sync(){
    var page=document.getElementById('page');
    var common=page&&(page.dataset.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page'));
    if(!common)return;
    var title=document.getElementById('pageTitle');if(title)title.textContent='Ortak Çizim';
    var hero=page.querySelector('.hero,.mr-hero');
    if(hero){var kicker=hero.querySelector('p'),heading=hero.querySelector('h2');if(kicker)kicker.textContent='TÜM RAF SİSTEMLERİ · ORTAK YERLEŞİM';if(heading)heading.textContent='Ortak Çizim';}
  }
  document.addEventListener('change',function(event){if(event.target?.matches?.('input[name="rafexUnifiedSystem"]'))setTimeout(sync,0)},true);
  document.addEventListener('click',function(event){if(event.target?.closest?.('#nav button[data-page],#rafexUnifiedSystemPicker'))setTimeout(sync,0)},true);
  var page=document.getElementById('page');if(page)new MutationObserver(function(){requestAnimationFrame(sync)}).observe(page,{childList:true,subtree:false});
  sync();setTimeout(sync,120);setTimeout(sync,500);
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Common wording/palette v94: </body> bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

for (const required of [
  'data-rafex-common-wording-palette="v94"',
  "--rafex-pallet-color:#9a6028",
  "--rafex-box-color:#c58b47",
  "page.querySelector('.hero,.mr-hero')",
  "title.textContent='Ortak Çizim'",
  "#rafexUnifiedAddModule{display:none!important}",
]) if (!html.includes(required)) throw new Error(`Common wording/palette v94 eksigi: ${required}`);

if (html.includes("Serbest Çizim") || html.includes("SERBEST ÇİZİM")) {
  throw new Error("Common wording/palette v94: eski Serbest Cizim etiketi kaldi");
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v94: Ortak Cizim metinleri, MR banneri, proje adi alani ve B2B palet/kutu renk standardi uygulandi.");
