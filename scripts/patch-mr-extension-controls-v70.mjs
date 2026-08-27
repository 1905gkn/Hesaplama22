import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("MR extension controls v70: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-mr-extension-controls="v70">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-mr-extension-controls="v70">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-mr-extension-controls="v70">
#page.rafex-free-drawing-page #m2AutoFillControls.rafex-mr-distance-active{display:block!important;visibility:visible!important;opacity:1!important}
#page.rafex-free-drawing-page #m2AutoFillControls.rafex-mr-distance-active>.rafex-extension-body{display:flex!important}
#page.rafex-free-drawing-page #m2AutoFillControls.rafex-mr-distance-active>.rafex-extension-toggle:after{content:'−'}
</style>
<script data-rafex-mr-extension-controls="v70">(function(){
  if(window.__rafexMrExtensionControlsV70)return;window.__rafexMrExtensionControlsV70=true;
  function draft(){try{return m2AutoFillDraft||null}catch{return null}}
  function isMr(){return draft()?.rafexSystem==='mr'}
  function status(text){var node=document.getElementById('m2FloorStatus');if(node)node.textContent=text}
  function rack(){var d=draft();try{return m2LayoutState.racks.find(function(item){return Number(item.id)===Number(d?.rackId)})||null}catch{return null}}
  function sync(){
    var host=document.getElementById('m2AutoFillControls'),active=isMr();if(!host)return;
    host.classList.toggle('rafex-mr-distance-active',active);
    if(!active)return;
    host.hidden=false;host.style.setProperty('display','block','important');host.classList.add('is-open');host.classList.remove('is-disabled');host.removeAttribute('aria-disabled');
    var toggle=host.querySelector('.rafex-extension-toggle');if(toggle){toggle.setAttribute('aria-expanded','true');toggle.disabled=false;}
    host.querySelectorAll('input,button').forEach(function(node){node.disabled=false;node.removeAttribute('aria-disabled')});
    var input=document.getElementById('m2AutoFillLength');if(input){input.readOnly=false;input.inputMode='numeric';input.placeholder='MR uzatma mesafesi (mm)';}
  }
  function preview(raw){
    if(!isMr())return false;var value=Number(raw);
    if(!Number.isFinite(value)||value<0)return false;
    var d=draft(),source=rack(),scale=Math.max(.0001,Number(m2LayoutState?.scale)||.04),direction=Number(d.direction)<0?-1:1,angle=(Number(source?.angle)||0)*Math.PI/180,dx=Math.cos(angle)*direction,dy=Math.sin(angle)*direction;
    if(typeof window.rafexProjectMrObstacleV40==='function')window.rafexProjectMrObstacleV40({x:(source?.x||0)+(source?.w||0)/2+dx*100000,y:(source?.y||0)+(source?.h||0)/2+dy*100000});
    d=draft();var requested=Math.max(0,Math.round(value)),limit=Math.max(0,Math.round(Number(d.obstacleDistanceMm)||requested)),selected=Math.min(requested,limit),start=d.start||{x:(source?.x||0)+(source?.w||0)/2,y:(source?.y||0)+(source?.h||0)/2};
    d.manualLengthMm=selected;d.selectedLengthMm=selected;d.pointerRequestedMm=requested;d.pointerClamped=requested>limit;d.hover={x:start.x+dx*selected*scale,y:start.y+dy*selected*scale};
    var input=document.getElementById('m2AutoFillLength');if(input&&requested>limit)input.value=String(selected);
    try{m2RenderLayout()}catch{}
    status(requested>limit?'Girilen MR uzatma mesafesi en yakın sınır nedeniyle '+limit.toLocaleString('tr-TR')+' mm ile sınırlandı.':'MR uzatma mesafesi '+selected.toLocaleString('tr-TR')+' mm olarak seçildi.');
    sync();return true;
  }
  function apply(){
    if(!isMr())return false;var input=document.getElementById('m2AutoFillLength'),raw=Number(input?.value);
    if(!Number.isFinite(raw)||raw<=0){status('MR uzatma mesafesini 0’dan büyük bir mm değeri olarak yaz.');input?.focus();return true;}
    preview(raw);
    if(typeof window.rafexCommitMrObstacleV40==='function')window.rafexCommitMrObstacleV40(null);else if(typeof window.m2ApplyAutoFillLength==='function')window.m2ApplyAutoFillLength();
    return true;
  }
  window.rafexMrPreviewDistanceV70=preview;window.rafexMrApplyDistanceV70=apply;window.rafexMrSyncDistanceV70=sync;
  document.addEventListener('input',function(event){if(event.target?.id!=='m2AutoFillLength'||!isMr())return;event.preventDefault();event.stopImmediatePropagation();preview(event.target.value)},true);
  document.addEventListener('keydown',function(event){if(event.target?.id!=='m2AutoFillLength'||!isMr())return;if(event.key==='Enter'){event.preventDefault();event.stopImmediatePropagation();apply()}},true);
  document.addEventListener('click',function(event){if(!isMr())return;var applyButton=event.target?.closest?.('#m2AutoFillApplyButton');if(applyButton){event.preventDefault();event.stopImmediatePropagation();apply();return}setTimeout(sync,0)},true);
  document.addEventListener('pointerup',function(){setTimeout(sync,0)},true);
  document.addEventListener('dblclick',function(){setTimeout(sync,0)},true);
  [0,80,240,700].forEach(function(delay){setTimeout(sync,delay)});
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("MR extension controls v70: body bulunamadi.");
html = html.slice(0, bodyEnd) + runtime + "\n" + html.slice(bodyEnd);

for (const required of [
  'data-rafex-mr-extension-controls="v70"',
  "rafexMrPreviewDistanceV70",
  "rafexMrApplyDistanceV70",
  "rafex-mr-distance-active",
  "MR uzatma mesafesini 0’dan büyük",
]) if (!html.includes(required)) throw new Error(`MR extension controls v70 dogrulama hatasi: ${required}`);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("MR v70: uzatma paneli otomatik acilir; manuel mesafe onizleme ve uygulama dogrudan MR hattina baglandi.");
