import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for common drawing viewport v49");
let html = Buffer.from(match[2], "base64").toString("utf8");

html = html
  .replace(/<style data-rafex-common-drawing-viewport="v49">[\s\S]*?<\/style>/g, "")
  .replace(/<script data-rafex-common-drawing-viewport="v49">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`
<style data-rafex-common-drawing-viewport="v49">
#page #m2LayoutSvg{width:100%!important;max-width:none!important;margin:0!important;touch-action:none;cursor:default}
#page #m2LayoutSvg.rafex-common-pan-ready{cursor:grab}
#page #m2LayoutSvg.rafex-common-panning{cursor:grabbing}
#page #m2LayoutSvg .m2-layout-rack{vector-effect:non-scaling-stroke;stroke-width:2px!important}
#page #m2LayoutSvg [data-rack].rafex-type-contour>.m2-layout-rack{stroke-opacity:.94!important}
#page #m2LayoutSvg [data-rack].rafex-type-contour>.m2-layout-rack.selected{stroke-width:3px!important;stroke-opacity:1!important}
#page .rafex-common-view-button{border-color:#2b7d5d!important;background:#edf7f1!important;color:#174a35!important}
#page .rafex-common-view-button:hover{background:#dff0e6!important}
#page .rafex-common-view-help{display:flex;align-items:center;gap:7px;margin:7px 0 0;padding:7px 9px;border:1px solid #d1ddd5;border-radius:8px;background:#f7faf8;color:#48675a;font-size:9px;font-weight:800}
</style>
<script data-rafex-common-drawing-viewport="v49">
(function(){
  if(window.__rafexCommonDrawingViewportV49)return;
  window.__rafexCommonDrawingViewportV49=true;

  var BASE_W=1000,BASE_H=650,MIN_W=90,view={x:0,y:0,w:BASE_W,h:BASE_H},pan=null,lastIds=null,rendering=false,baseRender=typeof m2RenderLayout==="function"?m2RenderLayout:null;
  function byId(id){return document.getElementById(id)}
  function state(){try{return m2LayoutState}catch(_){return null}}
  function svg(){return byId("m2LayoutSvg")}
  function clamp(next){
    var aspect=BASE_W/BASE_H,w=Math.max(MIN_W,Math.min(BASE_W,Number(next.w)||BASE_W)),h=w/aspect;
    if(h>BASE_H){h=BASE_H;w=h*aspect}
    var x=Math.max(0,Math.min(BASE_W-w,Number(next.x)||0)),y=Math.max(0,Math.min(BASE_H-h,Number(next.y)||0));
    return{x:x,y:y,w:w,h:h};
  }
  function zoomValue(){return BASE_W/Math.max(1,view.w)}
  function apply(){
    var node=svg();if(!node)return false;view=clamp(view);node.setAttribute("viewBox",view.x+" "+view.y+" "+view.w+" "+view.h);node.style.width="100%";node.style.maxWidth="none";node.style.margin="0";
    var label=byId("m2LayoutZoomLabel"),labelText=Math.round(zoomValue()*100)+"%";if(label&&label.textContent!==labelText)label.textContent=labelText;
    decorate();return true;
  }
  function point(event){
    var node=svg(),rect=node&&node.getBoundingClientRect();if(!rect||!rect.width||!rect.height)return{x:view.x,y:view.y};
    return{x:view.x+(event.clientX-rect.left)*view.w/rect.width,y:view.y+(event.clientY-rect.top)*view.h/rect.height};
  }
  function zoomAt(factor,anchor){
    var before=anchor||{x:view.x+view.w/2,y:view.y+view.h/2},nw=Math.max(MIN_W,Math.min(BASE_W,view.w*factor)),nh=nw*BASE_H/BASE_W,rx=(before.x-view.x)/view.w,ry=(before.y-view.y)/view.h;
    view=clamp({x:before.x-rx*nw,y:before.y-ry*nh,w:nw,h:nh});apply();
  }
  function fitAll(){view={x:0,y:0,w:BASE_W,h:BASE_H};apply();return true}
  function rackById(id){var s=state();return s&&Array.isArray(s.racks)?s.racks.find(function(r){return Number(r.id)===Number(id)}):null}
  function rackBounds(rack){
    var quarter=Math.abs((Number(rack.angle)||0)%180)===90,w=quarter?rack.h:rack.w,h=quarter?rack.w:rack.h,cx=rack.x+rack.w/2,cy=rack.y+rack.h/2;
    return{left:cx-w/2,right:cx+w/2,top:cy-h/2,bottom:cy+h/2};
  }
  function focusRack(rack){
    if(!rack)return false;var s=state(),members=rack.joinGroup&&s? s.racks.filter(function(r){return r.joinGroup===rack.joinGroup}):[rack],boxes=members.map(rackBounds),left=Math.min.apply(null,boxes.map(function(b){return b.left})),right=Math.max.apply(null,boxes.map(function(b){return b.right})),top=Math.min.apply(null,boxes.map(function(b){return b.top})),bottom=Math.max.apply(null,boxes.map(function(b){return b.bottom})),aspect=BASE_W/BASE_H,w=Math.max(MIN_W,(right-left)*2.15,150),h=Math.max(80,(bottom-top)*2.7);
    if(w/h<aspect)w=h*aspect;else h=w/aspect;if(w>BASE_W){w=BASE_W;h=BASE_H}if(h>BASE_H){h=BASE_H;w=BASE_W}
    view=clamp({x:(left+right-w)/2,y:(top+bottom-h)/2,w:w,h:h});apply();return true;
  }
  function focusSelected(){var s=state(),rack=s&&rackById(s.selected);if(!rack){window.alert("Önce serbest alandan bir raf seç.");return false}return focusRack(rack)}
  function decorate(){
    var node=svg();if(!node)return;var z=zoomValue();node.classList.toggle("rafex-common-pan-ready",!pan);
    node.querySelectorAll("[data-rack]").forEach(function(group){
      var color=group.getAttribute("data-type-color")||"#2878d0",frame=group.querySelector(":scope > .m2-layout-rack");group.classList.add("rafex-type-contour");
      if(frame){frame.style.stroke=color;frame.style.strokeOpacity=frame.classList.contains("selected")?"1":".94";frame.setAttribute("vector-effect","non-scaling-stroke")}
      group.querySelectorAll(".m2-b2b-plan-label,.m2-rack-name").forEach(function(label){label.style.opacity=z<.58?"0":String(Math.min(.92,.46+z*.16));label.style.transition="opacity .12s linear"});
    });
  }
  function insertControls(){
    var node=svg();if(!node)return false;var measure=byId("m2MeasureToolButton"),group=measure&&measure.parentElement;if(!group)return false;
    var focus=byId("m2FocusSelectedRackV49"),fit=byId("m2FitAllProjectV49");
    if(!focus){focus=document.createElement("button");focus.type="button";focus.id="m2FocusSelectedRackV49";focus.className="rafex-common-view-button";focus.textContent="Seçili Rafa Yaklaş";focus.onclick=focusSelected;group.insertBefore(focus,measure)}
    if(!fit){fit=document.createElement("button");fit.type="button";fit.id="m2FitAllProjectV49";fit.className="rafex-common-view-button";fit.textContent="Tüm Projeyi Göster";fit.onclick=fitAll;group.insertBefore(fit,measure)}
    var canvas=node.closest(".m2-floor-canvas"),wrap=canvas&&canvas.parentElement;if(wrap&&!wrap.querySelector(".rafex-common-view-help")){var help=document.createElement("div");help.className="rafex-common-view-help";help.textContent="Tekerlek: yakınlaştır · Boş zemin: kaydır · Tip rengi: blok konturu";wrap.appendChild(help)}
    return true;
  }
  function activeTool(){try{return m2LayoutState.mode==="draw"||m2LayoutTool||m2ProtectionDraft||m2SeismicDraft||m2MultiSelect&&m2MultiSelect.active}catch(_){return false}}
  function isBlankTarget(target){return !target.closest("[data-rack],[data-layout-symbol],[data-user-note],[data-dimension-key],[data-free-measure-point],[data-resume-point],[data-draft-edge]")}
  function bind(){
    var node=svg();if(!node||node.dataset.rafexViewportBound==="v49")return false;node.dataset.rafexViewportBound="v49";
    node.addEventListener("wheel",function(event){event.preventDefault();event.stopImmediatePropagation();zoomAt(event.deltaY>0?1.18:.84,point(event))},{passive:false,capture:true});
    node.addEventListener("pointerdown",function(event){if(event.button!==0||activeTool()||!isBlankTarget(event.target))return;var rect=node.getBoundingClientRect();pan={id:event.pointerId,cx:event.clientX,cy:event.clientY,x:view.x,y:view.y,sx:view.w/Math.max(1,rect.width),sy:view.h/Math.max(1,rect.height)};node.classList.add("rafex-common-panning");event.preventDefault();event.stopImmediatePropagation();node.setPointerCapture&&node.setPointerCapture(event.pointerId)},true);
    node.addEventListener("pointermove",function(event){if(!pan||event.pointerId!==pan.id)return;view=clamp({x:pan.x-(event.clientX-pan.cx)*pan.sx,y:pan.y-(event.clientY-pan.cy)*pan.sy,w:view.w,h:view.h});apply();event.preventDefault();event.stopImmediatePropagation()},true);
    function stop(event){if(!pan||event.pointerId!==pan.id)return;pan=null;node.classList.remove("rafex-common-panning");event.preventDefault();event.stopImmediatePropagation()}
    node.addEventListener("pointerup",stop,true);node.addEventListener("pointercancel",stop,true);return true;
  }
  function afterRender(){
    if(rendering)return;rendering=true;try{insertControls();bind();apply();var s=state(),ids=new Set(s&&Array.isArray(s.racks)?s.racks.map(function(r){return Number(r.id)}):[]);if(lastIds){var added=Array.from(ids).filter(function(id){return !lastIds.has(id)});if(added.length){var selected=s&&rackById(s.selected),target=selected||rackById(added[added.length-1]);setTimeout(function(){focusRack(target)},25)}}lastIds=ids}finally{rendering=false}
  }
  if(baseRender){m2RenderLayout=function(){var result=baseRender.apply(this,arguments);afterRender();return result}}
  m2ZoomLayout=function(change,reset){if(reset)return fitAll();zoomAt(change>0?.82:change<0?1.22:1);return true};
  m2SvgPoint=function(event){return point(event)};
  window.rafexCommonDrawingFocusSelectedV49=focusSelected;window.rafexCommonDrawingFitAllV49=fitAll;window.rafexCommonDrawingViewportV49={focusSelected:focusSelected,fitAll:fitAll,apply:apply};
  document.addEventListener("click",function(event){if(event.target.closest('[data-page="mekik2"],[data-page="b2b"],[data-page="mr"],[data-page="free"]'))[40,160,420,900].forEach(function(ms){setTimeout(afterRender,ms)})},true);
  var observer=new MutationObserver(function(){if(svg())setTimeout(afterRender,25)});observer.observe(document.documentElement,{childList:true,subtree:true});
  [0,80,250,700,1400].forEach(function(ms){setTimeout(afterRender,ms)});
})();
</script>`;

const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("body close missing for common drawing viewport v49");
html = html.slice(0, close) + runtime + "\n" + html.slice(close);

for (const required of [
  'data-rafex-common-drawing-viewport="v49"',
  "rafexCommonDrawingFocusSelectedV49",
  "rafexCommonDrawingFitAllV49",
  "Seçili Rafa Yaklaş",
  "Tüm Projeyi Göster",
  "rafex-type-contour"
]) if (!html.includes(required)) throw new Error("Common drawing viewport v49 missing: " + required);

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v49: Ortak Çizim akıllı yakınlaştırma, boş zemin kaydırma, uyarlamalı harf ve tip rengi konturu aktif.");
