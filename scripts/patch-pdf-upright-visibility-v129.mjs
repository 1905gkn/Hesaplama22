import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for PDF upright visibility v129");
let html = Buffer.from(match[2], "base64").toString("utf8");

html = html
  .replace(/<style data-rafex-pdf-foot-count="v128">[\s\S]*?<\/style>/g, "")
  .replace(/<script data-rafex-pdf-foot-count="v128">[\s\S]*?<\/script>/g, "")
  .replace(/<style data-rafex-pdf-upright-visibility="v129">[\s\S]*?<\/style>/g, "")
  .replace(/<script data-rafex-pdf-upright-visibility="v129">[\s\S]*?<\/script>/g, "")
  .replace(/<style data-rafex-pdf-upright-visibility="v130">[\s\S]*?<\/style>/g, "")
  .replace(/<script data-rafex-pdf-upright-visibility="v130">[\s\S]*?<\/script>/g, "")
  .replace(/<style data-rafex-pdf-upright-visibility="v131">[\s\S]*?<\/style>/g, "")
  .replace(/<script data-rafex-pdf-upright-visibility="v131">[\s\S]*?<\/script>/g, "")
  .replace(/<style data-rafex-pdf-upright-visibility="v132">[\s\S]*?<\/style>/g, "")
  .replace(/<script data-rafex-pdf-upright-visibility="v132">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`
<style data-rafex-pdf-upright-visibility="v132">
:is(#page #m2LayoutSvg,#m2ReportFloor svg,#m2A4PrintSheet svg,#m2A4PrintArea svg,#m2CorporatePreview svg,#m2CorporatePrint svg,#m2CorporatePrintArea svg) .m2-b2b-plan-upright{
  fill:#0877ad!important;
  fill-opacity:1!important;
  stroke:#002c45!important;
  stroke-width:1.2px!important;
  stroke-opacity:1!important;
  vector-effect:non-scaling-stroke!important;
  shape-rendering:crispEdges!important;
  opacity:1!important;
  transform:none!important;
  filter:none!important;
  rx:0!important;
  ry:0!important;
}
:is(#page #m2LayoutSvg,#m2ReportFloor svg,#m2A4PrintSheet svg,#m2A4PrintArea svg,#m2CorporatePreview svg,#m2CorporatePrint svg,#m2CorporatePrintArea svg) .rafex-pdf-upright-halo-v132{
  fill:none!important;stroke:#002c45!important;stroke-width:5px!important;stroke-linecap:butt!important;vector-effect:non-scaling-stroke!important;shape-rendering:crispEdges!important;opacity:1!important;filter:none!important;pointer-events:none!important
}
:is(#page #m2LayoutSvg,#m2ReportFloor svg,#m2A4PrintSheet svg,#m2A4PrintArea svg,#m2CorporatePreview svg,#m2CorporatePrint svg,#m2CorporatePrintArea svg) .rafex-pdf-upright-overlay-v132{
  fill:none!important;stroke:#0a8dcc!important;stroke-width:3px!important;stroke-linecap:butt!important;vector-effect:non-scaling-stroke!important;shape-rendering:crispEdges!important;opacity:1!important;filter:none!important;pointer-events:none!important
}
</style>
<script data-rafex-pdf-upright-visibility="v132">(function(){
  if(window.__rafexPdfUprightVisibilityV132)return;
  window.__rafexPdfUprightVisibilityV132=true;
  function paintPath(segments,className,color,strokeWidth){
    var node=document.createElementNS('http://www.w3.org/2000/svg','path');
    node.setAttribute('d',segments);
    node.setAttribute('class',className);node.setAttribute('aria-hidden','true');node.setAttribute('pointer-events','none');
    node.style.setProperty('display','inline','important');node.style.setProperty('visibility','visible','important');
    node.style.setProperty('fill','none','important');node.style.setProperty('stroke',color,'important');node.style.setProperty('stroke-width',strokeWidth,'important');
    node.style.setProperty('stroke-opacity','1','important');node.style.setProperty('stroke-linecap','butt','important');
    node.style.setProperty('vector-effect','non-scaling-stroke','important');node.style.setProperty('shape-rendering','crispEdges','important');
    node.style.setProperty('opacity','1','important');node.style.setProperty('filter','none','important');return node;
  }
  function enhance(svg){
    if(!svg)return 0;
    svg.querySelectorAll('.rafex-pdf-upright-overlay-v129,.rafex-pdf-upright-halo-v130,.rafex-pdf-upright-overlay-v130,.rafex-pdf-upright-halo-v131,.rafex-pdf-upright-overlay-v131,line.rafex-pdf-upright-halo-v132,line.rafex-pdf-upright-overlay-v132').forEach(function(node){node.remove()});
    var originals=Array.from(svg.querySelectorAll('.m2-b2b-plan-upright:not(.rafex-profile-merge-source-v61)'));
    var groups=new Map();
    originals.forEach(function(original){
      var x=(Number(original.getAttribute('x'))||0)+(Number(original.getAttribute('width'))||0)/2,y=Number(original.getAttribute('y'))||0,h=Number(original.getAttribute('height'))||0,parent=original.parentNode;
      groups.set(parent,(groups.get(parent)||'')+'M'+x+' '+y+'V'+(y+h));
    });
    groups.forEach(function(segments,parent){
      [['rafex-pdf-upright-halo-v132','#002c45','5px'],['rafex-pdf-upright-overlay-v132','#0a8dcc','3px']].forEach(function(style){
        var node=parent.querySelector(':scope > path.'+style[0]);
        if(!node)parent.appendChild(paintPath(segments,style[0],style[1],style[2]));
        else if(node.getAttribute('d')!==segments)node.setAttribute('d',segments);
      });
    });
    svg.dataset.rafexPdfUprights=String(originals.length);
    return originals.length;
  }
  function enhanceHost(host){if(!host)return 0;return Array.from(host.querySelectorAll('svg')).reduce(function(total,svg){return total+enhance(svg)},0)}
  var baseLayout=typeof m2RenderLayout==='function'?m2RenderLayout:null;
  if(baseLayout){
    var wrappedLayout=function(){var result=baseLayout.apply(this,arguments);enhance(document.getElementById('m2LayoutSvg'));return result};
    wrappedLayout.__rafexPdfUprightVisibilityV132=true;try{m2RenderLayout=wrappedLayout}catch(_){}window.m2RenderLayout=wrappedLayout;
  }
  var baseA4=typeof m2RenderA4Report==='function'?m2RenderA4Report:null;
  if(baseA4){
    var wrappedA4=function(){var result=baseA4.apply(this,arguments);enhance(document.querySelector('#m2ReportFloor > svg'));return result};
    wrappedA4.__rafexPdfUprightVisibilityV132=true;m2RenderA4Report=wrappedA4;window.m2RenderA4Report=wrappedA4;
  }
  var baseBuild=typeof m2BuildCorporatePages==='function'?m2BuildCorporatePages:null;
  if(baseBuild){
    var wrappedBuild=function(){var raw=baseBuild.apply(this,arguments),template=document.createElement('template');template.innerHTML=raw;template.content.querySelectorAll('.m2-corporate-floor svg').forEach(enhance);var shell=document.createElement('div');shell.appendChild(template.content.cloneNode(true));return shell.innerHTML};
    wrappedBuild.__rafexPdfUprightVisibilityV132=true;m2BuildCorporatePages=wrappedBuild;window.m2BuildCorporatePages=wrappedBuild;
  }
  document.addEventListener('click',function(event){if(event.target.closest('button[data-page="free"],#rafexUnifiedContinue,input[name="rafexUnifiedSystem"],.rafex-system-option'))[40,160,500].forEach(function(ms){setTimeout(function(){enhance(document.getElementById('m2LayoutSvg'))},ms)})},true);
  window.rafexPdfUprightVisibilityV132={enhance:enhance,enhanceHost:enhanceHost};
  requestAnimationFrame(function(){enhance(document.getElementById('m2LayoutSvg'));enhance(document.querySelector('#m2ReportFloor > svg'));enhanceHost(document.getElementById('m2CorporatePreview'))});
})();</script>`;

const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("body close missing for PDF upright visibility v129");
html = html.slice(0, close) + runtime + "\n" + html.slice(close);

for (const required of [
  'data-rafex-pdf-upright-visibility="v132"',
  "rafex-pdf-upright-halo-v132",
  "rafex-pdf-upright-overlay-v132",
  "vector-effect:non-scaling-stroke!important",
  "stroke-width:5px!important",
  "stroke-width:3px!important",
  "stroke-width:1.2px!important",
  "stroke-linecap:butt!important",
  "pointer-events:none!important",
  "enhance(document.getElementById('m2LayoutSvg'))",
  "rafexPdfUprightVisibilityV132",
]) if (!html.includes(required)) throw new Error("PDF upright visibility v132 missing: " + required);
for (const removed of [
  'data-rafex-pdf-foot-count="v128"',
  "AYAK SAYIM TABLOSU",
  "rafex-pdf-foot-count-page-v128",
]) if (html.includes(removed)) throw new Error("Obsolete PDF count UI remains: " + removed);

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v132: PDF ve serbest cizim ayaklari ayni ince, net ve olcekten bagimsiz cizgiyle gosteriliyor.");
