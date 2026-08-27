import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("MR extension activation v71: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[3], "base64").toString("utf8");
html = html
  .replace(/<style\s+data-rafex-mr-extension-activation="v71">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-mr-extension-activation="v71">[\s\S]*?<\/script>\s*/g, "");

const runtime = String.raw`<style data-rafex-mr-extension-activation="v71">
#page.rafex-free-drawing-page #m2LayoutSvg [data-rack].rafex-mr-extension-ready{cursor:ew-resize!important}
</style>
<script data-rafex-mr-extension-activation="v71">(function(){
  if(window.__rafexMrExtensionActivationV71)return;window.__rafexMrExtensionActivationV71=true;
  var lastTap={id:null,at:0};
  function state(){try{return m2LayoutState}catch{return null}}
  function isMr(rack){
    if(!rack)return false;var text=[rack.rafexSystem,rack.rafexSystemLabel,rack.systemType,rack.system,rack.kind,rack.b2bLayout?.palletType,rack.rafexCatalogKey].map(function(value){return String(value||'').toLowerCase()}).join('|');
    return rack.b2b?.mr===true||rack.plan?.mr===true||/(^|[|:])mr($|[|:])/.test(text);
  }
  function rackById(id){var s=state();return s&&Array.isArray(s.racks)?s.racks.find(function(rack){return Number(rack.id)===Number(id)})||null:null}
  function point(event){try{return typeof m2SvgPoint==='function'?m2SvgPoint(event):null}catch{return null}}
  function contains(rack,p){
    if(!rack||!p)return false;var cx=rack.x+rack.w/2,cy=rack.y+rack.h/2,a=-(Number(rack.angle)||0)*Math.PI/180,dx=p.x-cx,dy=p.y-cy,x=dx*Math.cos(a)-dy*Math.sin(a)+cx,y=dx*Math.sin(a)+dy*Math.cos(a)+cy;
    return x>=rack.x&&x<=rack.x+rack.w&&y>=rack.y&&y<=rack.y+rack.h;
  }
  function rackFromEvent(event){
    var svg=document.getElementById('m2LayoutSvg');if(!svg||!svg.contains(event.target))return null;
    var node=event.target?.closest?.('#m2LayoutSvg [data-rack]'),direct=node&&rackById(node.dataset.rack);if(isMr(direct))return direct;
    var p=point(event),racks=state()?.racks||[],selected=rackById(state()?.selected);if(isMr(selected)&&contains(selected,p))return selected;
    for(var index=racks.length-1;index>=0;index-=1)if(isMr(racks[index])&&contains(racks[index],p))return racks[index];return null;
  }
  function openControls(){
    var host=document.getElementById('m2AutoFillControls');if(!host)return;host.hidden=false;host.style.setProperty('display','block','important');host.classList.add('is-open','rafex-mr-distance-active');host.classList.remove('is-disabled');host.removeAttribute('aria-disabled');
    var toggle=host.querySelector('.rafex-extension-toggle');if(toggle){toggle.disabled=false;toggle.setAttribute('aria-expanded','true')}
    host.querySelectorAll('input,button').forEach(function(node){node.disabled=false;node.removeAttribute('aria-disabled')});
  }
  function start(rack,event){
    if(!isMr(rack))return false;event?.preventDefault?.();event?.stopImmediatePropagation?.();
    rack.rafexSystem='mr';rack.rafexSystemLabel='MR';rack.b2b={...(rack.b2b||{}),mr:true};
    try{m2LayoutTool=null;m2CustomizeMode=false;m2CopyMode=false;m2JoinMode=false;m2LayoutState.drag=null;m2LayoutState.selected=rack.id;if(m2MultiSelect){m2MultiSelect.active=false;m2MultiSelect.rackIds?.clear?.();m2MultiSelect.symbolIds?.clear?.()}}catch{}
    try{if(typeof m2StartAutoFillGuide==='function')m2StartAutoFillGuide(rack.id);else window.m2StartAutoFillGuide?.(rack.id)}catch(error){console.warn('MR uzatma baslatilamadi',error);return false}
    openControls();window.rafexMrSyncDistanceV70?.();var input=document.getElementById('m2AutoFillLength');if(input){input.disabled=false;input.placeholder='MR uzatma mesafesi (mm)'}
    var status=document.getElementById('m2FloorStatus');if(status)status.textContent='MR uzatma açıldı. Yönü göster veya mesafeyi mm olarak yaz.';
    return true;
  }
  function decorate(){var svg=document.getElementById('m2LayoutSvg');if(!svg)return;svg.querySelectorAll('[data-rack]').forEach(function(node){node.classList.toggle('rafex-mr-extension-ready',isMr(rackById(node.dataset.rack)))})}
  window.addEventListener('pointerdown',function(event){
    if(event.button!=null&&event.button!==0||event.isPrimary===false)return;var rack=rackFromEvent(event);if(!rack){lastTap={id:null,at:0};return}var now=Date.now(),same=Number(lastTap.id)===Number(rack.id)&&now-lastTap.at<560;
    if(!same){lastTap={id:rack.id,at:now};return}lastTap={id:null,at:0};start(rack,event);
  },true);
  window.addEventListener('dblclick',function(event){var rack=rackFromEvent(event);if(rack)start(rack,event)},true);
  document.addEventListener('pointerup',function(){setTimeout(decorate,0)},true);
  var observer=new MutationObserver(function(){requestAnimationFrame(decorate)});observer.observe(document.documentElement,{childList:true,subtree:true});
  [0,100,350,900].forEach(function(delay){setTimeout(decorate,delay)});
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("MR extension activation v71: body bulunamadi.");
html = html.slice(0, bodyEnd) + runtime + "\n" + html.slice(bodyEnd);

for (const required of [
  'data-rafex-mr-extension-activation="v71"',
  "rafex-mr-extension-ready",
  "window.addEventListener('pointerdown'",
  "window.addEventListener('dblclick'",
  "rack.rafexSystem='mr'",
  "MR uzatma açıldı",
]) if (!html.includes(required)) throw new Error(`MR extension activation v71 dogrulama hatasi: ${required}`);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("MR v71: raf govdesi ve ust SVG katmanlarinda cift tik dogrudan uzatmayi baslatir.");
