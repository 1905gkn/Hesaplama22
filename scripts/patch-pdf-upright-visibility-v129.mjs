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
  .replace(/<script data-rafex-pdf-upright-visibility="v129">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`
<style data-rafex-pdf-upright-visibility="v129">
:is(#m2ReportFloor,#m2A4PrintSheet,#m2A4PrintArea,#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea) svg .m2-b2b-plan-upright{
  fill:#0877ad!important;
  fill-opacity:1!important;
  stroke:#002c45!important;
  stroke-width:3.6px!important;
  stroke-opacity:1!important;
  vector-effect:non-scaling-stroke!important;
  shape-rendering:crispEdges!important;
  opacity:1!important;
  rx:0!important;
  ry:0!important;
}
:is(#m2ReportFloor,#m2A4PrintSheet,#m2A4PrintArea,#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea) svg .rafex-pdf-upright-overlay-v129{
  stroke-width:3.8px!important;
}
</style>
<script data-rafex-pdf-upright-visibility="v129">(function(){
  if(window.__rafexPdfUprightVisibilityV129)return;
  window.__rafexPdfUprightVisibilityV129=true;
  function enhance(svg){
    if(!svg)return 0;
    svg.querySelectorAll('.rafex-pdf-upright-overlay-v129').forEach(function(node){node.remove()});
    var originals=Array.from(svg.querySelectorAll('.m2-b2b-plan-upright:not(.rafex-profile-merge-source-v61):not(.rafex-pdf-upright-overlay-v129)'));
    originals.forEach(function(original){
      var overlay=original.cloneNode(true);
      overlay.classList.add('rafex-pdf-upright-overlay-v129');
      overlay.setAttribute('aria-hidden','true');
      overlay.style.setProperty('display','inline','important');
      overlay.style.setProperty('visibility','visible','important');
      overlay.style.setProperty('fill','#0877ad','important');
      overlay.style.setProperty('fill-opacity','1','important');
      overlay.style.setProperty('stroke','#002c45','important');
      overlay.style.setProperty('stroke-width','3.8px','important');
      overlay.style.setProperty('stroke-opacity','1','important');
      overlay.style.setProperty('vector-effect','non-scaling-stroke','important');
      overlay.style.setProperty('shape-rendering','crispEdges','important');
      overlay.style.setProperty('opacity','1','important');
      overlay.style.setProperty('filter','none','important');
      original.parentNode.appendChild(overlay);
    });
    svg.dataset.rafexPdfUprights=String(originals.length);
    return originals.length;
  }
  function enhanceHost(host){if(!host)return 0;return Array.from(host.querySelectorAll('svg')).reduce(function(total,svg){return total+enhance(svg)},0)}
  var baseA4=typeof m2RenderA4Report==='function'?m2RenderA4Report:null;
  if(baseA4){
    var wrappedA4=function(){var result=baseA4.apply(this,arguments);enhance(document.querySelector('#m2ReportFloor > svg'));return result};
    wrappedA4.__rafexPdfUprightVisibilityV129=true;m2RenderA4Report=wrappedA4;window.m2RenderA4Report=wrappedA4;
  }
  var baseBuild=typeof m2BuildCorporatePages==='function'?m2BuildCorporatePages:null;
  if(baseBuild){
    var wrappedBuild=function(){var raw=baseBuild.apply(this,arguments),template=document.createElement('template');template.innerHTML=raw;template.content.querySelectorAll('.m2-corporate-floor svg').forEach(enhance);var shell=document.createElement('div');shell.appendChild(template.content.cloneNode(true));return shell.innerHTML};
    wrappedBuild.__rafexPdfUprightVisibilityV129=true;m2BuildCorporatePages=wrappedBuild;window.m2BuildCorporatePages=wrappedBuild;
  }
  window.rafexPdfUprightVisibilityV129={enhance:enhance,enhanceHost:enhanceHost};
  requestAnimationFrame(function(){enhance(document.querySelector('#m2ReportFloor > svg'));enhanceHost(document.getElementById('m2CorporatePreview'))});
})();</script>`;

const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("body close missing for PDF upright visibility v129");
html = html.slice(0, close) + runtime + "\n" + html.slice(close);

for (const required of [
  'data-rafex-pdf-upright-visibility="v129"',
  "rafex-pdf-upright-overlay-v129",
  "vector-effect:non-scaling-stroke!important",
  "stroke-width:3.8px!important",
  "rafexPdfUprightVisibilityV129",
]) if (!html.includes(required)) throw new Error("PDF upright visibility v129 missing: " + required);
for (const removed of [
  'data-rafex-pdf-foot-count="v128"',
  "AYAK SAYIM TABLOSU",
  "rafex-pdf-foot-count-page-v128",
]) if (html.includes(removed)) throw new Error("Obsolete PDF count UI remains: " + removed);

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v129: PDF ust gorunum ayaklari, olcegi bozmadan ust katmanda ve sabit kontur kalinliginda belirginlestirildi.");
