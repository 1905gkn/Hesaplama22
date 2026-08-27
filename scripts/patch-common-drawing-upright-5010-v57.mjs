import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for common drawing RAL 5010 uprights v57");
let html = Buffer.from(match[2], "base64").toString("utf8");

html = html
  .replace(/<style data-rafex-common-upright-5010="v57">[\s\S]*?<\/style>/g, "")
  .replace(/<script data-rafex-common-upright-5010="v57">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`
<style data-rafex-common-upright-5010="v57">
#page #m2LayoutSvg .m2-b2b-plan-upright.rafex-ral5010-upright{fill:#00679d!important;stroke:#002f4a!important;stroke-width:2px!important;opacity:1!important;vector-effect:non-scaling-stroke;transform-box:fill-box;transform-origin:center;transform:scale(1.16);shape-rendering:geometricPrecision}
#page #m2LayoutSvg .m2-b2b-plan-upright{stroke:#354650!important;stroke-width:2.4px!important;opacity:1!important;vector-effect:non-scaling-stroke;transform-box:fill-box;transform-origin:center;transform:scale(1.14);shape-rendering:geometricPrecision;filter:drop-shadow(0 0 .7px #fff)}
#page #m2LayoutSvg .m2-b2b-plan-upright.rafex-shared-upright-v60{stroke-width:3.6px!important;transform:scale(1.28);filter:drop-shadow(0 0 1.2px #fff) drop-shadow(0 0 1px #26374199)}
#page #m2LayoutSvg .m2-b2b-plan-upright.rafex-ral5010-upright{fill:#005f90!important;stroke:#001927!important;stroke-width:3.2px!important;transform:scale(1.32);filter:drop-shadow(0 0 1px #fff) drop-shadow(0 0 1px #002f4a88)}
#page #m2LayoutSvg .m2-b2b-plan-upright.rafex-ral5010-upright.rafex-shared-upright-v60{stroke-width:4px!important;transform:scale(1.4);filter:drop-shadow(0 0 1.3px #fff) drop-shadow(0 0 1.2px #001927bb)}
</style>
<script data-rafex-common-upright-5010="v57">
(function(){
  if(window.__rafexCommonUpright5010V57)return;
  window.__rafexCommonUpright5010V57=true;
  var baseRender=typeof m2RenderLayout==="function"?m2RenderLayout:null,pending=0;
  function rackState(){try{return m2LayoutState}catch(_){return null}}
  function renderSharedFeet(state,svg){
    svg.querySelectorAll(":scope > .rafex-shared-foot-layer-v60").forEach(function(node){node.remove()});
    var layer=document.createElementNS("http://www.w3.org/2000/svg","g");layer.setAttribute("class","rafex-shared-foot-layer-v60");layer.setAttribute("pointer-events","none");
    state.racks.forEach(function(rack){
      if(!rack||!rack.sharedFootWith||!rack.sharedFootSide)return;
      var anchor=state.racks.find(function(item){return Number(item.id)===Number(rack.sharedFootWith)}),anchorGroup=anchor&&svg.querySelector('[data-rack="'+anchor.id+'"]');if(!anchorGroup)return;
      var uprights=Array.from(anchorGroup.querySelectorAll(".m2-b2b-plan-upright"));if(!uprights.length)return;
      var commonSide=rack.sharedFootSide==="left"?"right":"left",xs=uprights.map(function(node){return Number(node.getAttribute("x"))||0}),edge=commonSide==="left"?Math.min.apply(null,xs):Math.max.apply(null,xs),shared=uprights.filter(function(node){return Math.abs((Number(node.getAttribute("x"))||0)-edge)<.01});if(!shared.length)return;
      var holder=document.createElementNS("http://www.w3.org/2000/svg","g"),transform=anchorGroup.getAttribute("transform");if(transform)holder.setAttribute("transform",transform);holder.setAttribute("data-shared-foot",anchor.id+":"+rack.id);holder.setAttribute("data-shared-side",commonSide);
      shared.forEach(function(source){var clone=source.cloneNode(true);clone.classList.add("rafex-shared-upright-v60");clone.removeAttribute("id");holder.appendChild(clone)});layer.appendChild(holder);
    });
    if(layer.childElementCount)svg.appendChild(layer);
  }
  function decorate(){
    var state=rackState(),svg=document.getElementById("m2LayoutSvg");
    if(!state||!Array.isArray(state.racks)||!svg)return;
    svg.querySelectorAll("[data-rack]").forEach(function(group){
      var id=Number(group.getAttribute("data-rack")),rack=state.racks.find(function(item){return Number(item.id)===id}),finish=rack&&rack.b2b&&rack.b2b.mr?(rack.b2b.uprightFinish||"ral5010"):rack&&rack.b2b&&rack.b2b.footColor,is5010=finish==="ral5010";
      group.querySelectorAll(".m2-b2b-plan-upright").forEach(function(upright){upright.classList.toggle("rafex-ral5010-upright",is5010);upright.setAttribute("data-upright-finish",is5010?"RAL 5010":finish||"PGV")});
    });
    renderSharedFeet(state,svg);
  }
  function schedule(delay){clearTimeout(pending);pending=setTimeout(decorate,Math.max(0,Number(delay)||0))}
  if(baseRender)m2RenderLayout=function(){var result=baseRender.apply(this,arguments);decorate();return result};
  document.addEventListener("click",function(event){if(event.target.closest('[data-page="free"],[data-page="b2b"],[data-page="mr"],[data-rack]'))schedule(35)},true);
  [0,80,240,700].forEach(function(ms){setTimeout(decorate,ms)});
  window.rafexCommonUpright5010V57={decorate:decorate};
})();
</script>`;

const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("body close missing for common drawing RAL 5010 uprights v57");
html = html.slice(0, close) + runtime + "\n" + html.slice(close);

for (const required of [
  'data-rafex-common-upright-5010="v57"',
  "rafex-ral5010-upright",
  'fill:#00679d!important',
  'stroke:#002f4a!important',
  'transform:scale(1.16)',
  'stroke-width:2.4px!important',
  'transform:scale(1.14)',
  'fill:#005f90!important',
  'stroke:#001927!important',
  'stroke-width:3.2px!important',
  'transform:scale(1.32)',
  'rafex-shared-foot-layer-v60',
  'rafex-shared-upright-v60',
  'data-shared-foot',
  'stroke-width:3.6px!important',
  'stroke-width:4px!important',
  'transform:scale(1.4)',
  'rack.b2b.uprightFinish||"ral5010"',
  'rack.b2b&&rack.b2b.footColor',
]) if (!html.includes(required)) throw new Error("Common drawing RAL 5010 upright v57 missing: " + required);

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v57/v60: Serbest Cizim ortak ara ayaklari tek kez en ust katmanda gorunur; RAL 5010 daha baskin.");
