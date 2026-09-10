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
  .replace(/<script data-rafex-pdf-upright-visibility="v131">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`
<style data-rafex-pdf-upright-visibility="v131">
:is(#m2ReportFloor,#m2A4PrintSheet,#m2A4PrintArea,#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea) svg .m2-b2b-plan-upright{
  fill:#0877ad!important;
  fill-opacity:1!important;
  stroke:#002c45!important;
  stroke-width:1.2px!important;
  stroke-opacity:1!important;
  vector-effect:non-scaling-stroke!important;
  shape-rendering:crispEdges!important;
  opacity:1!important;
  rx:0!important;
  ry:0!important;
}
:is(#m2ReportFloor,#m2A4PrintSheet,#m2A4PrintArea,#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea) svg .rafex-pdf-upright-halo-v131{
  fill:none!important;stroke:#002c45!important;stroke-width:5px!important;stroke-linecap:butt!important;vector-effect:non-scaling-stroke!important;shape-rendering:crispEdges!important;opacity:1!important;filter:none!important
}
:is(#m2ReportFloor,#m2A4PrintSheet,#m2A4PrintArea,#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea) svg .rafex-pdf-upright-overlay-v131{
  fill:none!important;stroke:#0a8dcc!important;stroke-width:3px!important;stroke-linecap:butt!important;vector-effect:non-scaling-stroke!important;shape-rendering:crispEdges!important;opacity:1!important;filter:none!important
}
</style>
<script data-rafex-pdf-upright-visibility="v131">(function(){
  if(window.__rafexPdfUprightVisibilityV131)return;
  window.__rafexPdfUprightVisibilityV131=true;
  function paintLine(original,className,color,strokeWidth){
    var node=document.createElementNS('http://www.w3.org/2000/svg','line');
    var x=Number(original.getAttribute('x'))||0,y=Number(original.getAttribute('y'))||0;
    var width=Number(original.getAttribute('width'))||0,height=Number(original.getAttribute('height'))||0;
    node.setAttribute('x1',String(x+width/2));node.setAttribute('x2',String(x+width/2));
    node.setAttribute('y1',String(y));node.setAttribute('y2',String(y+height));
    node.setAttribute('class',className);node.setAttribute('aria-hidden','true');
    node.style.setProperty('display','inline','important');node.style.setProperty('visibility','visible','important');
    node.style.setProperty('fill','none','important');node.style.setProperty('stroke',color,'important');node.style.setProperty('stroke-width',strokeWidth,'important');
    node.style.setProperty('stroke-opacity','1','important');node.style.setProperty('stroke-linecap','butt','important');
    node.style.setProperty('vector-effect','non-scaling-stroke','important');node.style.setProperty('shape-rendering','crispEdges','important');
    node.style.setProperty('opacity','1','important');node.style.setProperty('filter','none','important');return node;
  }
  function enhance(svg){
    if(!svg)return 0;
    svg.querySelectorAll('.rafex-pdf-upright-overlay-v129,.rafex-pdf-upright-halo-v130,.rafex-pdf-upright-overlay-v130,.rafex-pdf-upright-halo-v131,.rafex-pdf-upright-overlay-v131').forEach(function(node){node.remove()});
    var originals=Array.from(svg.querySelectorAll('.m2-b2b-plan-upright:not(.rafex-profile-merge-source-v61)'));
    originals.forEach(function(original){
      original.parentNode.appendChild(paintLine(original,'rafex-pdf-upright-halo-v131','#002c45','5px'));
      original.parentNode.appendChild(paintLine(original,'rafex-pdf-upright-overlay-v131','#0a8dcc','3px'));
    });
    svg.dataset.rafexPdfUprights=String(originals.length);
    return originals.length;
  }
  function enhanceHost(host){if(!host)return 0;return Array.from(host.querySelectorAll('svg')).reduce(function(total,svg){return total+enhance(svg)},0)}
  var baseA4=typeof m2RenderA4Report==='function'?m2RenderA4Report:null;
  if(baseA4){
    var wrappedA4=function(){var result=baseA4.apply(this,arguments);enhance(document.querySelector('#m2ReportFloor > svg'));return result};
    wrappedA4.__rafexPdfUprightVisibilityV131=true;m2RenderA4Report=wrappedA4;window.m2RenderA4Report=wrappedA4;
  }
  var baseBuild=typeof m2BuildCorporatePages==='function'?m2BuildCorporatePages:null;
  if(baseBuild){
    var wrappedBuild=function(){var raw=baseBuild.apply(this,arguments),template=document.createElement('template');template.innerHTML=raw;template.content.querySelectorAll('.m2-corporate-floor svg').forEach(enhance);var shell=document.createElement('div');shell.appendChild(template.content.cloneNode(true));return shell.innerHTML};
    wrappedBuild.__rafexPdfUprightVisibilityV131=true;m2BuildCorporatePages=wrappedBuild;window.m2BuildCorporatePages=wrappedBuild;
  }
  window.rafexPdfUprightVisibilityV131={enhance:enhance,enhanceHost:enhanceHost};
  requestAnimationFrame(function(){enhance(document.querySelector('#m2ReportFloor > svg'));enhanceHost(document.getElementById('m2CorporatePreview'))});
})();</script>`;

const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("body close missing for PDF upright visibility v129");
html = html.slice(0, close) + runtime + "\n" + html.slice(close);

for (const required of [
  'data-rafex-pdf-upright-visibility="v131"',
  "rafex-pdf-upright-halo-v131",
  "rafex-pdf-upright-overlay-v131",
  "vector-effect:non-scaling-stroke!important",
  "stroke-width:5px!important",
  "stroke-width:3px!important",
  "stroke-width:1.2px!important",
  "stroke-linecap:butt!important",
  "rafexPdfUprightVisibilityV131",
]) if (!html.includes(required)) throw new Error("PDF upright visibility v131 missing: " + required);
for (const removed of [
  'data-rafex-pdf-foot-count="v128"',
  "AYAK SAYIM TABLOSU",
  "rafex-pdf-foot-count-page-v128",
]) if (html.includes(removed)) throw new Error("Obsolete PDF count UI remains: " + removed);

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v131: PDF ust gorunum ayaklari gercek ince oranini koruyan net cizgilerle belirginlestirildi.");
