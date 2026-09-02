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
#page #m2LayoutSvg .rafex-profile-merge-source-v61{display:none!important}
#page #m2LayoutSvg .rafex-merged-b2b-profile-v61{shape-rendering:geometricPrecision}
/* Corporate output removes the live SVG id. Keep the RAL 5010 finish in preview/print too. */
:is(#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea) .m2-corporate-floor .m2-b2b-plan-upright.rafex-ral5010-upright{fill:#005f90!important;stroke:#001927!important;stroke-width:3.2px!important;opacity:1!important;filter:none!important}
</style>
<script data-rafex-common-upright-5010="v57">
(function(){
  if(window.__rafexCommonUpright5010V57)return;
  window.__rafexCommonUpright5010V57=true;
  var baseRender=typeof m2RenderLayout==="function"?m2RenderLayout:null,pending=0,pdfPaintTimers=[];
  function rackState(){try{return m2LayoutState}catch(_){return null}}
  function isMrRack(rack){return !!(rack&&((rack.b2b&&rack.b2b.mr)||rack.systemType==="mr"||(rack.b2bLayout&&rack.b2bLayout.palletType==="mr")||(rack.plan&&rack.plan.mr)))}
  function mergeBackToBackProfiles(group,rack){
    group.querySelectorAll(".rafex-merged-b2b-profile-v61").forEach(function(node){node.remove()});
    var originals=Array.from(group.querySelectorAll(".m2-b2b-plan-upright:not(.rafex-shared-upright-v60)"));
    originals.forEach(function(node){node.classList.remove("rafex-profile-merge-source-v61")});
    group.removeAttribute("data-b2b-profile-gap");
    if(!rack||!rack.b2bLayout||isMrRack(rack))return;
    var columns={};
    originals.forEach(function(node){var x=Number(node.getAttribute("x"))||0,key=x.toFixed(2);(columns[key]||(columns[key]=[])).push(node)});
    Object.keys(columns).forEach(function(key){
      var nodes=columns[key].sort(function(a,b){return (Number(a.getAttribute("y"))||0)-(Number(b.getAttribute("y"))||0)}),pairs=null;
      if(nodes.length===2)pairs=[[nodes[0],nodes[1]]];
      else if(nodes.length===4){
        var firstInnerEnd=(Number(nodes[1].getAttribute("y"))||0)+(Number(nodes[1].getAttribute("height"))||0),secondInnerStart=Number(nodes[2].getAttribute("y"))||0;
        group.setAttribute("data-b2b-profile-gap",String(Math.max(0,secondInnerStart-firstInnerEnd)));
        pairs=[[nodes[0],nodes[1]],[nodes[2],nodes[3]]];
      }
      if(!pairs)return;
      pairs.forEach(function(pair){
        var first=pair[0],second=pair[1],top=Math.min(Number(first.getAttribute("y"))||0,Number(second.getAttribute("y"))||0),bottom=Math.max((Number(first.getAttribute("y"))||0)+(Number(first.getAttribute("height"))||0),(Number(second.getAttribute("y"))||0)+(Number(second.getAttribute("height"))||0)),merged=first.cloneNode(true);
        first.classList.add("rafex-profile-merge-source-v61");second.classList.add("rafex-profile-merge-source-v61");
        merged.classList.remove("rafex-profile-merge-source-v61");merged.classList.add("rafex-merged-b2b-profile-v61");merged.removeAttribute("id");merged.setAttribute("y",String(top));merged.setAttribute("height",String(bottom-top));merged.setAttribute("data-merged-profiles","2");
        merged.style.setProperty("transform","none","important");merged.style.setProperty("filter","none","important");merged.style.setProperty("stroke","none","important");
        group.appendChild(merged);
      });
    });
  }
  function renderSharedFeet(state,svg){
    svg.querySelectorAll(":scope > .rafex-shared-foot-layer-v60").forEach(function(node){node.remove()});
    var layer=document.createElementNS("http://www.w3.org/2000/svg","g");layer.setAttribute("class","rafex-shared-foot-layer-v60");layer.setAttribute("pointer-events","none");
    state.racks.forEach(function(rack){
      if(!rack||!rack.sharedFootWith||!rack.sharedFootSide)return;
      var anchor=state.racks.find(function(item){return Number(item.id)===Number(rack.sharedFootWith)}),anchorGroup=anchor&&svg.querySelector('[data-rack="'+anchor.id+'"]');if(!anchorGroup)return;
      var uprights=Array.from(anchorGroup.querySelectorAll(".m2-b2b-plan-upright:not(.rafex-profile-merge-source-v61)"));if(!uprights.length)return;
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
      mergeBackToBackProfiles(group,rack);
      group.querySelectorAll(".m2-b2b-plan-upright").forEach(function(upright){upright.classList.toggle("rafex-ral5010-upright",is5010);upright.setAttribute("data-upright-finish",is5010?"RAL 5010":finish||"PGV");upright.style.setProperty("filter","none","important")});
    });
    renderSharedFeet(state,svg);
  }
  function copyPdfUprightPaint(){
    var source=document.getElementById("m2LayoutSvg");if(!source)return;
    var selector=".m2-b2b-plan-upright,.m2-ayak-glb-shape path,.m2-ayak-glb-shape rect,.m2-ayak-glb-shape circle";
    var sourceParts=Array.from(source.querySelectorAll(selector));if(!sourceParts.length)return;
    ["m2CorporatePreview","m2CorporatePrint","m2CorporatePrintArea"].forEach(function(id){
      var host=document.getElementById(id);if(!host)return;
      host.querySelectorAll(".m2-corporate-floor svg").forEach(function(pdfSvg){
        var targetParts=Array.from(pdfSvg.querySelectorAll(selector));
        targetParts.forEach(function(target,index){
          var original=sourceParts[index];if(!original)return;
          var paint=getComputedStyle(original);
          ["fill","stroke","stroke-width","opacity"].forEach(function(name){
            var value=paint.getPropertyValue(name);if(value)target.style.setProperty(name,value,"important");
          });
          target.style.setProperty("filter","none","important");
          if(original.classList.contains("rafex-ral5010-upright"))target.classList.add("rafex-ral5010-upright");
        });
        pdfSvg.dataset.rafexUprightPaint="live-svg-v72";
      });
    });
  }
  function schedulePdfPaint(){pdfPaintTimers.forEach(clearTimeout);pdfPaintTimers=[0,40,120,280,650].map(function(ms){return setTimeout(copyPdfUprightPaint,ms)})}
  function schedule(delay){clearTimeout(pending);pending=setTimeout(decorate,Math.max(0,Number(delay)||0))}
  if(baseRender)m2RenderLayout=function(){var result=baseRender.apply(this,arguments);decorate();return result};
  try{
    var baseCorporate=window.m2RenderCorporateReport;
    if(typeof baseCorporate==="function"&&!baseCorporate.__rafexUprightPaintV72){
      var corporateWrapper=function(){var result=baseCorporate.apply(this,arguments);schedulePdfPaint();return result};
      corporateWrapper.__rafexUprightPaintV72=true;
      try{m2RenderCorporateReport=corporateWrapper}catch(_){}window.m2RenderCorporateReport=corporateWrapper;
    }
  }catch(_){}
  document.addEventListener("click",function(event){
    if(event.target.closest('button[data-page="free"],button[data-page="b2b"],button[data-page="mr"]'))schedule(35);
    if(event.target.closest('#m2CreateOutputButton,#m2PdfButton,.m2-pdf-button'))schedulePdfPaint();
  },true);
  ["m2CorporatePreview","m2CorporatePrint","m2CorporatePrintArea"].forEach(function(id){
    var host=document.getElementById(id);if(host)new MutationObserver(schedulePdfPaint).observe(host,{childList:true,subtree:true});
  });
  [0,80,240,700].forEach(function(ms){setTimeout(decorate,ms)});schedulePdfPaint();
  window.rafexCommonUpright5010V57={decorate:decorate,copyPdfUprightPaint:copyPdfUprightPaint};
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
  'rafex-profile-merge-source-v61',
  'rafex-merged-b2b-profile-v61',
  'data-merged-profiles',
  'data-b2b-profile-gap',
  'mergeBackToBackProfiles(group,rack)',
  'nodes.length===2',
  'rack.b2bLayout.palletType==="mr"',
  'merged.style.setProperty("transform","none","important")',
  'upright.style.setProperty("filter","none","important")',
  'rack.b2b.uprightFinish||"ral5010"',
  'rack.b2b&&rack.b2b.footColor',
  'copyPdfUprightPaint',
  'dataset.rafexUprightPaint="live-svg-v72"',
  'corporateWrapper.__rafexUprightPaintV72=true',
  '#m2CreateOutputButton,#m2PdfButton,.m2-pdf-button',
  'new MutationObserver(schedulePdfPaint)',
]) if (!html.includes(required)) throw new Error("Common drawing RAL 5010 upright v57 missing: " + required);

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v57/v60/v72: Serbest Cizim ayak renkleri PDF SVG'sine inline kopyalanir; RAL 5010 griye donmez.");

