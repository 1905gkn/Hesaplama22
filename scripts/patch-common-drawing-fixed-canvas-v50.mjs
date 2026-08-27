import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for common drawing fixed canvas v50");
let html = Buffer.from(match[2], "base64").toString("utf8");

html = html
  .replace(/<style data-rafex-common-drawing-fixed-canvas="v50">[\s\S]*?<\/style>/g, "")
  .replace(/<script data-rafex-common-drawing-fixed-canvas="v50">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`
<style data-rafex-common-drawing-fixed-canvas="v50">
#page .m2-layout-zoom-floating{display:none!important}
#page #m2LayoutSvg{width:100%!important;height:auto!important;max-width:none!important;margin:0!important;touch-action:none!important;cursor:default!important}
#page #m2LayoutSvg [data-rack]{cursor:grab}
#page #m2LayoutSvg [data-rack]:active{cursor:grabbing}
#page #m2LayoutSvg [data-rack]>.m2-layout-rack{pointer-events:all!important;vector-effect:non-scaling-stroke;stroke-width:3px!important}
#page .rafex-common-view-help,#page #m2ViewNavigateV49,#page #m2FocusSelectedRackV49,#page #m2FitAllProjectV49{display:none!important}
#page .rafex-fixed-layout-note{display:flex;align-items:center;gap:8px;margin:8px 0 0;padding:8px 10px;border:1px solid #d1ddd5;border-radius:9px;background:#f7faf8;color:#365a4a;font-size:10px;font-weight:800}
#page .rafex-fixed-layout-note:before{content:"↔";display:grid;place-items:center;width:22px;height:22px;border-radius:7px;background:#174a35;color:#fff;font-size:13px}
#page .rafex-rack-detail-v50{display:grid;grid-template-columns:minmax(220px,.75fr) minmax(330px,1.25fr);gap:12px;margin-top:10px;padding:10px;border:1px solid #bdcec3;border-radius:12px;background:#fff;box-shadow:0 7px 22px #173c2d12}
#page .rafex-rack-detail-v50[hidden]{display:none!important}
#page .rafex-rack-detail-preview{position:relative;min-height:150px;border:1px solid #d9e3dc;border-radius:10px;background:linear-gradient(135deg,#fbfdfb,#f1f6f3);overflow:hidden}
#page .rafex-rack-detail-preview svg{display:block;width:100%;height:150px;pointer-events:none}
#page .rafex-rack-detail-preview [data-rack]{cursor:default!important}
#page .rafex-rack-detail-preview .m2-b2b-plan-label,#page .rafex-rack-detail-preview .m2-rack-name,#page .rafex-rack-detail-preview .m2-rack-pallet-count{display:none!important}
#page .rafex-rack-detail-info{display:flex;flex-direction:column;gap:9px;min-width:0}
#page .rafex-rack-detail-head{display:flex;align-items:center;gap:8px;min-width:0}
#page .rafex-rack-detail-swatch{width:12px;height:32px;border-radius:5px;background:var(--rafex-detail-color,#2878d0);box-shadow:inset 0 0 0 1px #0002;flex:0 0 auto}
#page .rafex-rack-detail-title{min-width:0}
#page .rafex-rack-detail-title b{display:block;color:#173c2d;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#page .rafex-rack-detail-title small{display:block;margin-top:2px;color:#64756c;font-size:9px;font-weight:800}
#page .rafex-rack-move-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
#page .rafex-rack-move-row label{display:flex;align-items:center;gap:6px;color:#53675d;font-size:9px;font-weight:900}
#page .rafex-rack-move-row select{height:32px;border:1px solid #c7d4cc;border-radius:7px;background:#fff;color:#173c2d;font-size:10px;font-weight:900;padding:0 8px}
#page .rafex-rack-nudge{display:grid;grid-template-columns:34px 34px 34px;grid-template-rows:32px 32px;gap:4px}
#page .rafex-rack-nudge button{border:1px solid #adc4b6;border-radius:7px;background:#edf7f1;color:#174a35;font-size:16px;font-weight:900;cursor:pointer}
#page .rafex-rack-nudge button:hover{background:#dcefe4}
#page .rafex-rack-nudge button[data-dir="up"]{grid-column:2;grid-row:1}
#page .rafex-rack-nudge button[data-dir="left"]{grid-column:1;grid-row:2}
#page .rafex-rack-nudge button[data-dir="down"]{grid-column:2;grid-row:2}
#page .rafex-rack-nudge button[data-dir="right"]{grid-column:3;grid-row:2}
#page .rafex-rack-detail-hint{margin:0;color:#5d7066;font-size:9px;font-weight:700;line-height:1.45}
@media(max-width:760px){#page .rafex-rack-detail-v50{grid-template-columns:1fr}#page .rafex-rack-detail-preview{min-height:120px}#page .rafex-rack-detail-preview svg{height:120px}}
</style>
<script data-rafex-common-drawing-fixed-canvas="v50">
(function(){
  if(window.__rafexCommonDrawingFixedCanvasV50)return;
  window.__rafexCommonDrawingFixedCanvasV50=true;

  var BASE_W=1000,BASE_H=650,rendering=false,detailSignature="",baseRender=typeof m2RenderLayout==="function"?m2RenderLayout:null;
  function byId(id){return document.getElementById(id)}
  function state(){try{return m2LayoutState}catch(_){return null}}
  function svg(){return byId("m2LayoutSvg")}
  function rackById(id){var s=state();return s&&Array.isArray(s.racks)?s.racks.find(function(r){return Number(r.id)===Number(id)}):null}
  function selectedRack(){var s=state();return s?rackById(s.selected):null}
  function rackBounds(rack){
    var quarter=Math.abs((Number(rack.angle)||0)%180)===90,w=quarter?rack.h:rack.w,h=quarter?rack.w:rack.h,cx=rack.x+rack.w/2,cy=rack.y+rack.h/2;
    return{left:cx-w/2,right:cx+w/2,top:cy-h/2,bottom:cy+h/2,width:w,height:h};
  }
  function fixedPoint(event){
    var node=svg(),rect=node&&node.getBoundingClientRect();
    if(!rect||!rect.width||!rect.height)return{x:0,y:0};
    return{x:(event.clientX-rect.left)*BASE_W/rect.width,y:(event.clientY-rect.top)*BASE_H/rect.height};
  }
  function resetCanvas(){
    var node=svg();if(!node)return false;
    try{window.rafexCommonDrawingViewportV49&&window.rafexCommonDrawingViewportV49.setNavigation(false)}catch(_){}
    node.setAttribute("viewBox","0 0 "+BASE_W+" "+BASE_H);node.style.width="100%";node.style.height="auto";node.style.maxWidth="none";node.style.margin="0";
    node.classList.remove("rafex-common-pan-ready","rafex-common-space-pan","rafex-common-panning");
    try{m2LayoutZoom=1}catch(_){}
    var label=byId("m2LayoutZoomLabel");if(label)label.textContent="100%";
    return true;
  }
  function removeCameraControls(){
    ["m2ViewNavigateV49","m2FocusSelectedRackV49","m2FitAllProjectV49"].forEach(function(id){var node=byId(id);if(node){node.disabled=true;node.tabIndex=-1;node.setAttribute("aria-hidden","true")}});
    document.querySelectorAll(".rafex-common-view-help").forEach(function(node){node.setAttribute("aria-hidden","true")});
  }
  function ensureDetail(){
    var node=svg(),wrap=node&&node.closest(".m2-floor-canvas-wrap");if(!wrap)return null;
    var note=wrap.querySelector(".rafex-fixed-layout-note");
    if(!note){note=document.createElement("div");note.className="rafex-fixed-layout-note";note.textContent="Rafı doğrudan tutup sürükle. Hassas taşıma için aşağıdaki yön tuşlarını kullan.";wrap.appendChild(note)}
    var panel=byId("m2SelectedRackDetailV50");
    if(!panel){
      panel=document.createElement("section");panel.id="m2SelectedRackDetailV50";panel.className="rafex-rack-detail-v50";panel.hidden=true;
      panel.innerHTML='<div class="rafex-rack-detail-preview"><svg id="m2SelectedRackPreviewV50" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet" aria-label="Seçili raf büyütülmüş detay görünümü"><g id="m2SelectedRackPreviewContentV50"></g></svg></div><div class="rafex-rack-detail-info"><div class="rafex-rack-detail-head"><span class="rafex-rack-detail-swatch" aria-hidden="true"></span><div class="rafex-rack-detail-title"><b id="m2SelectedRackTitleV50">Seçili raf</b><small id="m2SelectedRackSizeV50"></small></div></div><div class="rafex-rack-move-row"><div class="rafex-rack-nudge" aria-label="Seçili rafı hassas taşı"><button type="button" data-dir="up" aria-label="Yukarı taşı">↑</button><button type="button" data-dir="left" aria-label="Sola taşı">←</button><button type="button" data-dir="down" aria-label="Aşağı taşı">↓</button><button type="button" data-dir="right" aria-label="Sağa taşı">→</button></div><label>Taşıma adımı <select id="m2RackMoveStepV50"><option value="50">50 mm</option><option value="100" selected>100 mm</option><option value="500">500 mm</option><option value="1000">1.000 mm</option></select></label></div><p class="rafex-rack-detail-hint">Ana plandaki gerçek ölçü değişmez. Bu pencere yalnız seçili rafı okunur büyüklükte gösterir.</p></div>';
      wrap.appendChild(panel);
      panel.querySelectorAll("[data-dir]").forEach(function(button){button.addEventListener("click",function(){var step=Math.max(1,Number(byId("m2RackMoveStepV50")&&byId("m2RackMoveStepV50").value)||100),dir=button.dataset.dir,dx=dir==="left"?-step:dir==="right"?step:0,dy=dir==="up"?-step:dir==="down"?step:0;moveSelected(dx,dy)})});
    }
    return panel;
  }
  function moveSelected(dxMm,dyMm){
    var rack=selectedRack(),s=state();if(!rack||!s)return false;
    var scale=Math.max(.000001,Number(s.scale)||.04),dx=dxMm*scale,dy=dyMm*scale,members=rack.joinGroup?s.racks.filter(function(item){return item.joinGroup===rack.joinGroup}):[rack];
    try{if(typeof m2PushUndo==="function")m2PushUndo("Raf hassas taşıma")}catch(_){}
    if(members.length>1&&typeof m2SmoothGroupTranslation==="function"&&typeof m2ApplyGroupTranslation==="function"){
      var origins=members.map(function(item){return{id:item.id,x:item.x,y:item.y}}),adjusted=m2SmoothGroupTranslation(origins,dx,dy);m2ApplyGroupTranslation(origins,adjusted.dx,adjusted.dy);
    }else if(rack.freePlacement){rack.x=Math.max(0,Math.min(BASE_W-rack.w,rack.x+dx));rack.y=Math.max(0,Math.min(BASE_H-rack.h,rack.y+dy))}
    else if(typeof m2SmoothDragPosition==="function"){
      var adjusted=m2SmoothDragPosition(rack,rack.x+dx,rack.y+dy);if(adjusted){rack.x=adjusted.x;rack.y=adjusted.y}
    }else{rack.x=Math.max(0,Math.min(BASE_W-rack.w,rack.x+dx));rack.y=Math.max(0,Math.min(BASE_H-rack.h,rack.y+dy))}
    var status=byId("m2FloorStatus");if(status)status.textContent="Seçili raf "+Math.max(Math.abs(dxMm),Math.abs(dyMm)).toLocaleString("tr-TR")+" mm taşındı.";
    if(typeof m2RenderLayout==="function")m2RenderLayout();return true;
  }
  function renderDetail(){
    var panel=ensureDetail(),rack=selectedRack(),node=svg();if(!panel||!node)return;
    if(!rack){panel.hidden=true;detailSignature="";return}panel.hidden=false;
    var group=node.querySelector('[data-rack="'+rack.id+'"]'),host=byId("m2SelectedRackPreviewContentV50"),preview=byId("m2SelectedRackPreviewV50"),bounds=rackBounds(rack),pad=Math.max(8,Math.min(34,Math.max(bounds.width,bounds.height)*.22)),color=rack.typeColor||(group&&group.getAttribute("data-type-color"))||"#2878d0";
    var title=String(rack.blockName||rack.typeName||"Seçili raf"),size=Math.round(Number(rack.widthMm)||0).toLocaleString("tr-TR")+" × "+Math.round(Number(rack.depthMm)||0).toLocaleString("tr-TR")+" mm",titleNode=byId("m2SelectedRackTitleV50"),sizeNode=byId("m2SelectedRackSizeV50");
    panel.style.setProperty("--rafex-detail-color",color);if(titleNode&&titleNode.textContent!==title)titleNode.textContent=title;if(sizeNode&&sizeNode.textContent!==size)sizeNode.textContent=size;
    if(group&&host){var markup=group.outerHTML,signature=rack.id+"|"+bounds.left+"|"+bounds.top+"|"+bounds.width+"|"+bounds.height+"|"+markup;if(signature!==detailSignature){detailSignature=signature;var clone=group.cloneNode(true);clone.querySelectorAll("[id]").forEach(function(child){child.removeAttribute("id")});host.replaceChildren(clone)}}
    if(preview)preview.setAttribute("viewBox",(bounds.left-pad)+" "+(bounds.top-pad)+" "+(bounds.width+pad*2)+" "+(bounds.height+pad*2));
  }
  function decorateRacks(){
    var node=svg();if(!node)return;node.querySelectorAll("[data-rack]").forEach(function(group){var frame=group.querySelector(":scope > .m2-layout-rack"),color=group.getAttribute("data-type-color")||"#2878d0",rack=rackById(group.getAttribute("data-rack")),selected=frame&&frame.classList.contains("selected");if(frame){frame.style.stroke=color;frame.style.strokeOpacity=selected?"1":".96";frame.style.fill=color;frame.style.fillOpacity=selected?".22":".14";frame.setAttribute("vector-effect","non-scaling-stroke");frame.setAttribute("pointer-events","all")}
      var rect=frame&&frame.getBoundingClientRect(),shortPx=rect?Math.min(rect.width,rect.height):0,shortSide=rack?Math.max(1,Math.min(Number(rack.w)||1,Number(rack.h)||1)):12,fontSize=Math.max(1.4,Math.min(4,shortSide*.20));group.querySelectorAll(".m2-b2b-plan-label,.m2-rack-name").forEach(function(label){label.style.fontSize=fontSize+"px";label.style.display=selected&&shortPx>=58?"":"none";label.style.opacity=selected?".8":"0"});group.querySelectorAll(".m2-rack-pallet-count").forEach(function(label){label.style.display=selected&&shortPx>=78?"":"none"})});
  }
  function afterRender(){
    if(rendering)return;rendering=true;try{resetCanvas();removeCameraControls();decorateRacks();renderDetail()}finally{rendering=false}
  }
  if(baseRender)m2RenderLayout=function(){var result=baseRender.apply(this,arguments);afterRender();return result};
  m2SvgPoint=fixedPoint;m2ZoomLayout=function(){resetCanvas();return true};
  window.rafexCommonDrawingMoveSelectedV50=moveSelected;window.rafexCommonDrawingFixedCanvasV50={moveSelected:moveSelected,reset:resetCanvas};
  document.addEventListener("click",function(event){if(event.target.closest('[data-page="mekik2"],[data-page="b2b"],[data-page="mr"],[data-page="free"],[data-rack]'))[0,40,160,500].forEach(function(ms){setTimeout(afterRender,ms)})},true);
  var observer=new MutationObserver(function(){if(svg())setTimeout(afterRender,20)});observer.observe(document.documentElement,{childList:true,subtree:true});
  [0,80,250,700,1400].forEach(function(ms){setTimeout(afterRender,ms)});
})();
</script>`;

const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("body close missing for common drawing fixed canvas v50");
html = html.slice(0, close) + runtime + "\n" + html.slice(close);

for (const required of [
  'data-rafex-common-drawing-fixed-canvas="v50"',
  "rafexCommonDrawingMoveSelectedV50",
  "m2SelectedRackDetailV50",
  "Taşıma adımı",
  "Rafı doğrudan tutup sürükle",
  'node.setAttribute("viewBox","0 0 "+BASE_W+" "+BASE_H)',
  "m2SvgPoint=fixedPoint",
  "removeCameraControls",
]) if (!html.includes(required)) throw new Error("Common drawing fixed canvas v50 missing: " + required);

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v50: Ortak Çizim zoom ve pan olmadan sabit planda; raf sürükleme, bağımsız detay ve hassas taşıma aktif.");
