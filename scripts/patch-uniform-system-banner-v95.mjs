import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Uniform system banner v95: HTML_BASE64 bulunamadi");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-uniform-system-banner="v95">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-uniform-system-banner="v95">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-uniform-system-banner="v95">
.top{box-sizing:border-box!important;position:sticky!important;top:0!important;z-index:40!important;height:72px!important;min-height:72px!important}
.top-actions{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:8px!important;flex-wrap:nowrap!important}
.top-actions>button{min-height:38px!important;white-space:nowrap!important}
#page .hero,#page .mr-hero{
  box-sizing:border-box!important;
  width:100%!important;
  height:128px!important;
  min-height:128px!important;
  margin-bottom:14px!important;
  padding:20px 28px!important;
  display:grid!important;
  place-items:center!important;
  text-align:center!important;
  border-radius:16px!important;
  overflow:hidden!important;
}
#page .hero>[data-rafex-system-banner-title],#page .mr-hero>[data-rafex-system-banner-title]{
  margin:0!important;
  color:#fff!important;
  font-family:Arial,sans-serif!important;
  font-size:32px!important;
  font-weight:800!important;
  line-height:1.1!important;
  letter-spacing:.01em!important;
  text-align:center!important;
  text-transform:uppercase!important;
}
#page .hero>p,#page .mr-hero>p,#page .hero>.capacity,#page .mr-hero>.capacity,#page .hero>.mr-hero-badge,#page .mr-hero>.mr-hero-badge{display:none!important}
@media(max-width:720px){
  .top{height:64px!important;min-height:64px!important}
  #page .hero,#page .mr-hero{height:104px!important;min-height:104px!important;padding:16px 18px!important}
  #page .hero>[data-rafex-system-banner-title],#page .mr-hero>[data-rafex-system-banner-title]{font-size:25px!important}
  .top-actions{gap:6px!important}
}
</style>
<script data-rafex-uniform-system-banner="v95">(function(){
  if(window.__rafexUniformSystemBannerV95)return;
  window.__rafexUniformSystemBannerV95=true;
  var labels={b2b:'B2B',mekik2:'MEKİK',mekik:'MEKİK',drive:'DRIVE-IN',mr:'MR',konsol:'KONSOL KOLLU',ayak:'AYAK HESAPLAMA',travers:'TRAVERS HESAPLAMA'};
  var busy=false,queued=false;
  function selectedSystem(page){
    var checked=page.querySelector('input[name="rafexUnifiedSystem"]:checked');
    if(checked&&labels[checked.value])return checked.value;
    var context=page.dataset.rafexFreeContextSystem||page.dataset.m2Module;
    if(context&&labels[context])return context;
    if(page.classList.contains('b2b-mode'))return 'b2b';
    if(page.classList.contains('mr-mode'))return 'mr';
    var active=document.querySelector('#nav button.active[data-page]');
    if(active&&labels[active.dataset.page])return active.dataset.page;
    var heading=page.querySelector('.hero h2,.mr-hero h2');
    var text=String(heading&&heading.textContent||'').toLocaleLowerCase('tr-TR');
    if(text.includes('drive'))return 'drive';
    if(text.includes('mekik'))return 'mekik2';
    if(text.includes('konsol'))return 'konsol';
    if(text.includes('modüler raf')||text==='mr')return 'mr';
    return '';
  }
  function sync(){
    if(busy)return;
    var page=document.getElementById('page');if(!page)return;
    var hero=page.querySelector('.hero,.mr-hero');if(!hero)return;
    var key=selectedSystem(page),label=labels[key]||'ORTAK ÇİZİM';
    var title=hero.querySelector(':scope>[data-rafex-system-banner-title]');
    var clean=title&&hero.children.length===1&&title.textContent===label;
    if(clean)return;
    busy=true;
    hero.innerHTML='<h2 data-rafex-system-banner-title>'+label+'</h2>';
    hero.dataset.rafexSystemBanner=key||'common';
    busy=false;
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;sync()})}
  document.addEventListener('change',function(event){if(event.target&&event.target.matches('input[name="rafexUnifiedSystem"]'))schedule()},true);
  document.addEventListener('click',function(event){if(event.target&&event.target.closest('#nav button[data-page],#rafexUnifiedSystemPicker'))setTimeout(schedule,0)},true);
  var page=document.getElementById('page');if(page)new MutationObserver(schedule).observe(page,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-m2-module','data-rafex-free-context-system']});
  sync();setTimeout(sync,100);setTimeout(sync,500);
})();</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Uniform system banner v95: </body> bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

for (const required of [
  'data-rafex-uniform-system-banner="v95"',
  "height:128px!important",
  "data-rafex-system-banner-title",
  "MEKİK",
  "KONSOL KOLLU",
  "hero.innerHTML='<h2 data-rafex-system-banner-title>'",
]) if (!html.includes(required)) throw new Error(`Uniform system banner v95 eksigi: ${required}`);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v95: Tum sistem bannerlari tek olcu, tek punto ve yalniz ortali sistem adi olacak sekilde standartlastirildi.");
