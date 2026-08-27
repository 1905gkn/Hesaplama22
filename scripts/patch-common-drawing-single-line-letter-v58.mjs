import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for common drawing single-line letter v58");
let html = Buffer.from(match[2], "base64").toString("utf8");

html = html
  .replace(/<style data-rafex-common-single-line-letter="v58">[\s\S]*?<\/style>/g, "")
  .replace(/<script data-rafex-common-single-line-letter="v58">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`
<style data-rafex-common-single-line-letter="v58">
#page #m2LayoutSvg [data-rack] .m2-b2b-plan-label,
#page #m2LayoutSvg [data-rack] .m2-rack-name{display:none!important}
#page .rafex-single-line-letter-v58{pointer-events:none}
#page .rafex-single-line-letter-v58 path{fill:none;stroke-width:2px;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke;shape-rendering:geometricPrecision}
#page #m2LayoutSvg .rafex-single-line-letter-v58 path{stroke-width:3.4px!important}
</style>
<script data-rafex-common-single-line-letter="v58">
(function(){
  if(window.__rafexCommonSingleLineLetterV58)return;
  window.__rafexCommonSingleLineLetterV58=true;

  var NS="http://www.w3.org/2000/svg",pending=0,baseRender=typeof m2RenderLayout==="function"?m2RenderLayout:null;
  var GLYPHS={
    A:"M0 10L5 0L10 10M2.25 5.7H7.75",B:"M0 0V10M0 0H5.5Q10 0 10 2.5Q10 5 5.5 5H0M5.5 5Q10 5 10 7.5Q10 10 5.5 10H0",C:"M10 1.2Q8.1 0 5.4 0Q0 0 0 5Q0 10 5.4 10Q8.1 10 10 8.8",D:"M0 0V10M0 0H4.8Q10 0 10 5Q10 10 4.8 10H0",E:"M10 0H0V10H10M0 5H8",F:"M10 0H0V10M0 5H8",G:"M10 1.2Q8.1 0 5.4 0Q0 0 0 5Q0 10 5.4 10Q8.1 10 10 8.8V5.7H6",H:"M0 0V10M10 0V10M0 5H10",I:"M2 0H8M5 0V10M2 10H8",J:"M2 0H10V7Q10 10 6 10Q2 10 2 7",K:"M0 0V10M10 0L0 6M4 4L10 10",L:"M0 0V10H10",M:"M0 10V0L5 5.5L10 0V10",N:"M0 10V0L10 10V0",O:"M5 0Q0 0 0 5Q0 10 5 10Q10 10 10 5Q10 0 5 0",P:"M0 10V0H5.5Q10 0 10 3Q10 6 5.5 6H0",Q:"M5 0Q0 0 0 5Q0 10 5 10Q10 10 10 5Q10 0 5 0M6.2 6.5L10.5 10.5",R:"M0 10V0H5.5Q10 0 10 3Q10 6 5.5 6H0M5.2 6L10 10",S:"M10 1.2Q8.2 0 5.4 0Q0 0 0 2.8Q0 5 5 5Q10 5 10 7.4Q10 10 4.6 10Q1.8 10 0 8.8",T:"M0 0H10M5 0V10",U:"M0 0V6Q0 10 5 10Q10 10 10 6V0",V:"M0 0L5 10L10 0",W:"M0 0L2.2 10L5 4.5L7.8 10L10 0",X:"M0 0L10 10M10 0L0 10",Y:"M0 0L5 5L10 0M5 5V10",Z:"M0 0H10L0 10H10",
    0:"M5 0Q0 0 0 5Q0 10 5 10Q10 10 10 5Q10 0 5 0M2 8L8 2",1:"M3 2L5 0V10M2 10H8",2:"M0 2Q1.5 0 5 0Q10 0 10 3Q10 5 0 10H10",3:"M0 1Q2 0 5 0Q10 0 10 2.6Q10 5 5 5Q10 5 10 7.5Q10 10 5 10Q2 10 0 9",4:"M8 10V0L0 7H10",5:"M10 0H0V5H5Q10 5 10 7.5Q10 10 5 10Q2 10 0 9",6:"M9 1Q7.5 0 5 0Q0 0 0 5V7Q0 10 5 10Q10 10 10 7Q10 4 5 4H0",7:"M0 0H10L3 10",8:"M5 0Q0 0 0 2.5Q0 5 5 5Q10 5 10 2.5Q10 0 5 0M5 5Q0 5 0 7.5Q0 10 5 10Q10 10 10 7.5Q10 5 5 5",9:"M10 6H5Q0 6 0 3Q0 0 5 0Q10 0 10 3V5Q10 10 5 10Q2.5 10 1 9"
  };
  function svg(){return document.getElementById("m2LayoutSvg")}
  function letterScale(){try{return typeof window.rafexCommonTypeLetterScaleV65==="function"?Math.max(.5,Math.min(2,Number(window.rafexCommonTypeLetterScaleV65())||1)):1}catch(_){return 1}}
  function existing(parent){return Array.from(parent.children||[]).find(function(node){return node.classList&&node.classList.contains("rafex-single-line-letter-v58")})||null}
  function decorateGroup(group){
    var labels=Array.from(group.querySelectorAll(".m2-b2b-plan-label,.m2-rack-name"));if(!labels.length)return;
    labels.forEach(function(label){label.style.display="none";label.setAttribute("aria-hidden","true")});
    var label=labels[0],letter=(String(label.textContent||"").trim().toUpperCase().match(/[A-Z0-9]/)||[])[0],pathData=GLYPHS[letter],parent=label.parentNode,old=parent&&existing(parent);
    if(!pathData||!parent){if(old)old.remove();return}
    var color=group.getAttribute("data-type-color")||"#2878d0",x=Number(label.getAttribute("x"))||0,y=Number(label.getAttribute("y"))||0,baseSize=Math.max(7,Math.min(12,parseFloat(label.style.fontSize)||parseFloat(getComputedStyle(label).fontSize)||11)),fontSize=baseSize*letterScale(),sx=fontSize*.72/10,sy=fontSize*.92/10,signature=[letter,color,x,y,fontSize].join("|");
    if(old&&old.getAttribute("data-signature")===signature)return;if(old)old.remove();
    var mark=document.createElementNS(NS,"g"),path=document.createElementNS(NS,"path");mark.setAttribute("class","rafex-single-line-letter-v58");mark.setAttribute("data-signature",signature);mark.setAttribute("data-letter",letter);mark.setAttribute("aria-label",letter);mark.setAttribute("transform","translate("+(x-fontSize*.36)+" "+(y-fontSize*.46)+") scale("+sx+" "+sy+")");path.setAttribute("d",pathData);path.setAttribute("stroke",color);mark.appendChild(path);parent.appendChild(mark);
  }
  function decorate(){var node=svg();if(!node)return;node.querySelectorAll("[data-rack]").forEach(decorateGroup)}
  function schedule(){clearTimeout(pending);pending=setTimeout(function(){pending=0;decorate()},20)}
  if(baseRender)m2RenderLayout=function(){var result=baseRender.apply(this,arguments);decorate();return result};
  var observer=new MutationObserver(schedule);observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener("click",function(event){if(event.target.closest('[data-page="free"],[data-page="b2b"],[data-page="mr"],[data-page="mekik2"],[data-rack]'))[0,80,240].forEach(function(ms){setTimeout(decorate,ms)})},true);
  window.rafexCommonSingleLineLetterV58={decorate:decorate,glyphs:GLYPHS};[0,80,260,700].forEach(function(ms){setTimeout(decorate,ms)});
})();
</script>`;

const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("body close missing for common drawing single-line letter v58");
html = html.slice(0, close) + runtime + "\n" + html.slice(close);

for (const required of [
  'data-rafex-common-single-line-letter="v58"',
  "rafexCommonSingleLineLetterV58",
  "rafex-single-line-letter-v58",
  "fill:none;stroke-width:2px",
  "stroke-width:3.4px!important",
  "Math.max(7,Math.min(12",
  "rafexCommonTypeLetterScaleV65",
  'path.setAttribute("d",pathData)',
  'path.setAttribute("stroke",color)',
  'label.style.display="none"',
  'data-letter',
]) if (!html.includes(required)) throw new Error("Common drawing single-line letter v58 missing: " + required);

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v58: Serbest Cizim blok harfleri 7-12 px, dolgusuz ve cift kontursuz, 3.4 px bold tek merkez cizgisiyle ciziliyor.");
