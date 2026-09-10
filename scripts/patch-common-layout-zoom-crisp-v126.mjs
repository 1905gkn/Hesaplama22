import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for common layout zoom crisp v126");
let html = Buffer.from(match[2], "base64").toString("utf8");

html = html
  .replace(/<style data-rafex-common-layout-zoom-crisp="v126">[\s\S]*?<\/style>/g, "")
  .replace(/<script data-rafex-common-layout-zoom-crisp="v126">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`
<style data-rafex-common-layout-zoom-crisp="v126">
#page .m2-layout-zoom-floating{display:flex!important;left:12px!important;right:auto!important;top:12px!important;z-index:22!important;padding:6px!important;background:#fffffff7!important;border-color:#8eaa9a!important;box-shadow:0 5px 16px #10281c24!important}
#page .m2-layout-zoom-floating button{min-width:34px!important;height:32px!important;border-color:#91ad9d!important;color:#123e2d!important;background:#fff!important}
#page .m2-layout-zoom-floating button:hover{background:#e8f4ed!important}
#page .m2-layout-zoom-floating #m2FocusSelectedRackV126{width:auto!important;padding:0 10px!important;background:#174a35!important;color:#fff!important;border-color:#174a35!important;font-size:9px!important}
#page #m2LayoutSvg{shape-rendering:geometricPrecision;text-rendering:geometricPrecision}
#page #m2LayoutSvg [data-rack]>.m2-layout-rack{fill-opacity:.055!important;stroke-opacity:1!important;stroke-width:2.25px!important;vector-effect:non-scaling-stroke;shape-rendering:geometricPrecision}
#page #m2LayoutSvg [data-rack] .m2-b2b-plan-frame{fill:#e2e9e5!important;fill-opacity:1!important;stroke:#263b44!important;stroke-width:1.75px!important;opacity:1!important;vector-effect:non-scaling-stroke;shape-rendering:crispEdges;rx:0!important;ry:0!important}
#page #m2LayoutSvg [data-rack] .m2-b2b-plan-beam{stroke:#d79b00!important;stroke-width:2.7px!important;opacity:1!important;vector-effect:non-scaling-stroke;shape-rendering:geometricPrecision}
#page #m2LayoutSvg [data-rack] .m2-b2b-plan-upright{fill:#728994!important;stroke:#1c3440!important;stroke-width:2.7px!important;opacity:1!important;vector-effect:non-scaling-stroke;shape-rendering:crispEdges;rx:0!important;ry:0!important}
#page #m2LayoutSvg [data-rack] .m2-b2b-plan-upright.rafex-ral5010-upright{fill:#00679d!important;stroke:#00283d!important;stroke-width:3px!important}
#page #m2LayoutSvg [data-rack] .m2-b2b-plan-pallet{fill:#c78330!important;fill-opacity:1!important;stroke:#4b2809!important;stroke-width:1.5px!important;opacity:1!important;vector-effect:non-scaling-stroke;shape-rendering:crispEdges;rx:0!important;ry:0!important}
#page #m2LayoutSvg [data-rack] .m2-b2b-plan-pallet-line{stroke:#704018!important;stroke-width:.95px!important;opacity:1!important;vector-effect:non-scaling-stroke;shape-rendering:geometricPrecision}
#page #m2LayoutSvg [data-rack] .m2-rack-nameplate{fill:#fff!important;fill-opacity:.94!important;stroke-opacity:.9!important;stroke-width:1.15px!important;vector-effect:non-scaling-stroke}
#page #m2LayoutSvg [data-rack] .m2-rack-name,#page #m2LayoutSvg [data-rack] .m2-rack-pallet-count{fill-opacity:1!important;stroke-opacity:1!important;opacity:1!important;vector-effect:non-scaling-stroke;text-rendering:geometricPrecision}
@media(max-width:760px){#page .m2-layout-zoom-floating{top:8px!important;left:8px!important}#page .m2-layout-zoom-floating #m2FocusSelectedRackV126{padding:0 7px!important}}
</style>
<script data-rafex-common-layout-zoom-crisp="v126">
(function(){
  if(window.__rafexCommonLayoutZoomCrispV126)return;
  window.__rafexCommonLayoutZoomCrispV126=true;
  var BASE_W=1000,BASE_H=650,MIN_W=70,view={x:0,y:0,w:BASE_W,h:BASE_H},applying=false,observer=null,baseRender=typeof m2RenderLayout==="function"?m2RenderLayout:null;
  function byId(id){return document.getElementById(id)}
  function svg(){return byId("m2LayoutSvg")}
  function state(){try{return m2LayoutState}catch(_){return null}}
  function clamp(next){
    var aspect=BASE_W/BASE_H,w=Math.max(MIN_W,Math.min(BASE_W,Number(next.w)||BASE_W)),h=w/aspect;
    if(h>BASE_H){h=BASE_H;w=h*aspect}
    return{x:Math.max(0,Math.min(BASE_W-w,Number(next.x)||0)),y:Math.max(0,Math.min(BASE_H-h,Number(next.y)||0)),w:w,h:h};
  }
  function zoomValue(){return BASE_W/Math.max(1,view.w)}
  function expectedViewBox(){return [view.x,view.y,view.w,view.h].map(function(value){return Math.round(value*1000)/1000}).join(" ")}
  function apply(){
    var node=svg();if(!node)return false;view=clamp(view);applying=true;node.setAttribute("viewBox",expectedViewBox());applying=false;
    node.style.width="100%";node.style.height="auto";node.style.maxWidth="none";node.style.margin="0";
    var label=byId("m2LayoutZoomLabel");if(label)label.textContent=Math.round(zoomValue()*100)+"%";
    return true;
  }
  function point(event){
    var node=svg(),rect=node&&node.getBoundingClientRect();if(!rect||!rect.width||!rect.height)return{x:view.x,y:view.y};
    return{x:view.x+(event.clientX-rect.left)*view.w/rect.width,y:view.y+(event.clientY-rect.top)*view.h/rect.height};
  }
  function zoomAt(factor,anchor){
    var before=anchor||selectedCenter()||{x:view.x+view.w/2,y:view.y+view.h/2},nw=Math.max(MIN_W,Math.min(BASE_W,view.w*factor)),nh=nw*BASE_H/BASE_W,rx=(before.x-view.x)/view.w,ry=(before.y-view.y)/view.h;
    view=clamp({x:before.x-rx*nw,y:before.y-ry*nh,w:nw,h:nh});apply();return true;
  }
  function fitAll(){view={x:0,y:0,w:BASE_W,h:BASE_H};apply();return true}
  function rackById(id){var s=state();return s&&Array.isArray(s.racks)?s.racks.find(function(rack){return Number(rack.id)===Number(id)}):null}
  function rackBounds(rack){
    var quarter=Math.abs((Number(rack.angle)||0)%180)===90,w=quarter?rack.h:rack.w,h=quarter?rack.w:rack.h,cx=rack.x+rack.w/2,cy=rack.y+rack.h/2;
    return{left:cx-w/2,right:cx+w/2,top:cy-h/2,bottom:cy+h/2,width:w,height:h};
  }
  function selectedRack(){var s=state();return s?rackById(s.selected):null}
  function selectedCenter(){var rack=selectedRack(),bounds=rack&&rackBounds(rack);return bounds?{x:(bounds.left+bounds.right)/2,y:(bounds.top+bounds.bottom)/2}:null}
  function focusSelected(){
    var rack=selectedRack(),s=state();if(!rack){var status=byId("m2FloorStatus");if(status)status.textContent="Yaklaşmak için önce plandaki bir rafı seç.";return false}
    var members=rack.joinGroup&&s?s.racks.filter(function(item){return item.joinGroup===rack.joinGroup}):[rack],boxes=members.map(rackBounds),left=Math.min.apply(null,boxes.map(function(box){return box.left})),right=Math.max.apply(null,boxes.map(function(box){return box.right})),top=Math.min.apply(null,boxes.map(function(box){return box.top})),bottom=Math.max.apply(null,boxes.map(function(box){return box.bottom})),aspect=BASE_W/BASE_H,w=Math.max(MIN_W,(right-left)*3.2,120),h=Math.max(70,(bottom-top)*4.2);
    if(w/h<aspect)w=h*aspect;else h=w/aspect;if(w>BASE_W){w=BASE_W;h=BASE_H}if(h>BASE_H){h=BASE_H;w=BASE_W}
    view=clamp({x:(left+right-w)/2,y:(top+bottom-h)/2,w:w,h:h});apply();
    var status=byId("m2FloorStatus");if(status)status.textContent="Seçili raf okunur ölçüde yakınlaştırıldı. Yüzde düğmesi tüm projeyi gösterir.";return true;
  }
  function install(){
    var node=svg(),controls=document.querySelector("#page .m2-layout-zoom-floating");if(!node||!controls)return false;
    controls.setAttribute("aria-label","Plan görünümü yakınlaştırma");
    var focus=byId("m2FocusSelectedRackV126");if(!focus){focus=document.createElement("button");focus.type="button";focus.id="m2FocusSelectedRackV126";focus.textContent="SEÇİLİ RAF";focus.title="Seçili rafı okunur büyüklükte göster";focus.onclick=focusSelected;controls.appendChild(focus)}
    var label=byId("m2LayoutZoomLabel");if(label){label.title="Tüm projeyi göster";label.setAttribute("aria-label","Tüm projeyi göster")}
    if(!observer){observer=new MutationObserver(function(records){if(applying||zoomValue()<=1.001)return;var changed=records.some(function(record){return record.attributeName==="viewBox"});if(changed&&node.getAttribute("viewBox")!==expectedViewBox())requestAnimationFrame(apply)});observer.observe(node,{attributes:true,attributeFilter:["viewBox"]})}
    return apply();
  }
  if(baseRender)m2RenderLayout=function(){var result=baseRender.apply(this,arguments);install();apply();return result};
  m2ZoomLayout=function(change,reset){if(reset)return fitAll();return zoomAt(change>0?.78:change<0?1.28:1)};
  m2SvgPoint=point;
  window.rafexFocusSelectedRackV126=focusSelected;
  window.rafexFitCommonLayoutV126=fitAll;
  window.rafexCommonLayoutZoomCrispV126={focusSelected:focusSelected,fitAll:fitAll,zoomAt:zoomAt,getView:function(){return Object.assign({},view)}};
  document.addEventListener("click",function(event){if(event.target&&event.target.closest&&event.target.closest('button[data-page="free"],#rafexUnifiedContinue,input[name="rafexUnifiedSystem"],.rafex-system-option'))[50,180,500,1000].forEach(function(ms){setTimeout(install,ms)})},true);
  [0,80,240,700,1400].forEach(function(ms){setTimeout(install,ms)});
})();
</script>`;

const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("body close missing for common layout zoom crisp v126");
html = html.slice(0, close) + runtime + "\n" + html.slice(close);

for (const required of [
  'data-rafex-common-layout-zoom-crisp="v126"',
  "rafexCommonLayoutZoomCrispV126",
  "rafexFocusSelectedRackV126",
  "m2FocusSelectedRackV126",
  "SEÇİLİ RAF",
  "vector-effect:non-scaling-stroke",
  "fill-opacity:.055!important",
  "m2SvgPoint=point",
  "new MutationObserver",
]) if (!html.includes(required)) throw new Error("Common layout zoom crisp v126 missing: " + required);

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v126: Buyuk Ortak Cizim alaninda secili raf odagi, zoom ve olcekten bagimsiz net plan konturlari aktif.");
