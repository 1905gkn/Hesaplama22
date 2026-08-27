import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("HTML_BASE64 not found for common drawing type letter scale v65");
let html = Buffer.from(match[2], "base64").toString("utf8");

html = html
  .replace(/<style data-rafex-type-letter-scale="v65">[\s\S]*?<\/style>/g, "")
  .replace(/<script data-rafex-type-letter-scale="v65">[\s\S]*?<\/script>/g, "");

const runtime = String.raw`
<style data-rafex-type-letter-scale="v65">
#page .m2-floor-canvas-wrap{position:relative}
#page .rafex-type-letter-scale-v65{position:absolute;z-index:18;top:12px;right:12px;display:none;align-items:center;gap:5px;padding:7px 8px;border:1px solid #aac5b5;border-radius:9px;background:rgba(255,255,255,.96);box-shadow:0 4px 13px rgba(21,55,41,.14);color:#173c2d;font-family:Arial,sans-serif;pointer-events:auto}
#page.rafex-free-drawing-page .rafex-type-letter-scale-v65,#page[data-rafex-free-drawing="1"] .rafex-type-letter-scale-v65{display:flex}
#page .rafex-type-letter-scale-v65>span:first-child{margin-right:3px;font-size:9px;font-weight:950;letter-spacing:.03em;white-space:nowrap;text-transform:uppercase}
#page .rafex-type-letter-scale-v65 button{width:27px;height:27px;padding:0;border:1px solid #9db8a8;border-radius:6px;background:#f4f8f5;color:#173c2d;font-size:17px;font-weight:900;line-height:1;cursor:pointer}
#page .rafex-type-letter-scale-v65 input{width:52px;height:27px;padding:3px 4px;border:1px solid #9db8a8;border-radius:6px;background:#fff;color:#173c2d;font-size:11px;font-weight:900;text-align:center}
#page .rafex-type-letter-scale-v65 .rafex-type-letter-percent{font-size:10px;font-weight:900}
</style>
<script data-rafex-type-letter-scale="v65">
(function(){
  if(window.__rafexTypeLetterScaleV65)return;
  window.__rafexTypeLetterScaleV65=true;
  var STORAGE="rafex-common-type-letter-scale-v65",value=100,pending=0;
  try{value=Math.max(50,Math.min(200,Number(localStorage.getItem(STORAGE))||100))}catch(_){}
  function isFree(){var page=document.getElementById("page");return !!(page&&(page.dataset.rafexFreeDrawing==="1"||page.classList.contains("rafex-free-drawing-page")))}
  function refreshLetters(){try{if(window.rafexCommonSingleLineLetterV58&&typeof window.rafexCommonSingleLineLetterV58.decorate==="function")window.rafexCommonSingleLineLetterV58.decorate()}catch(_){}}
  function setScale(next){value=Math.max(50,Math.min(200,Math.round(Number(next)||100)));try{localStorage.setItem(STORAGE,String(value))}catch(_){}var input=document.getElementById("rafexTypeLetterScaleInputV65");if(input&&Number(input.value)!==value)input.value=String(value);refreshLetters();return value}
  function install(){
    var wrap=document.querySelector("#page .m2-floor-canvas-wrap");if(!wrap)return;
    var control=wrap.querySelector(".rafex-type-letter-scale-v65");
    if(!control){control=document.createElement("div");control.className="rafex-type-letter-scale-v65";control.setAttribute("role","group");control.setAttribute("aria-label","Tip yazı oranı");control.setAttribute("onpointerdown","event.stopPropagation()");control.innerHTML='<span>Tip yazı oranı</span><button type="button" aria-label="Tip harflerini küçült" onclick="rafexStepTypeLetterScaleV65(-5)">−</button><input id="rafexTypeLetterScaleInputV65" type="number" min="50" max="200" step="5" aria-label="Tip yazı oranı yüzde" onchange="rafexSetTypeLetterScaleV65(this.value)"><span class="rafex-type-letter-percent">%</span><button type="button" aria-label="Tip harflerini büyüt" onclick="rafexStepTypeLetterScaleV65(5)">+</button>';wrap.appendChild(control)}
    var input=document.getElementById("rafexTypeLetterScaleInputV65");if(input&&Number(input.value)!==value)input.value=String(value);
  }
  window.rafexCommonTypeLetterScaleV65=function(){return value/100};
  window.rafexSetTypeLetterScaleV65=setScale;
  window.rafexStepTypeLetterScaleV65=function(step){return setScale(value+(Number(step)||0))};
  function schedule(){clearTimeout(pending);pending=setTimeout(function(){pending=0;install()},25)}
  document.addEventListener("click",function(event){schedule();if(event.target&&event.target.closest&&event.target.closest('[data-page="free"],#rafexUnifiedContinue,input[name="rafexUnifiedSystem"],.rafex-system-option'))[80,240,600,1200].forEach(function(ms){setTimeout(install,ms)})},true);
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  var page=document.getElementById("page");if(page)new MutationObserver(schedule).observe(page,{attributes:true,attributeFilter:["class","data-rafex-free-drawing"]});
  window.rafexTypeLetterScaleV65={install:install,setScale:setScale};[0,80,260,700].forEach(function(ms){setTimeout(function(){install();refreshLetters()},ms)});
})();
</script>`;

const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("body close missing for common drawing type letter scale v65");
html = html.slice(0, close) + runtime + "\n" + html.slice(close);

for (const required of [
  'data-rafex-type-letter-scale="v65"',
  "Tip yazı oranı",
  "rafexCommonTypeLetterScaleV65",
  "rafexSetTypeLetterScaleV65",
  "rafex-type-letter-scale-v65",
  'min="50" max="200" step="5"',
]) if (!html.includes(required)) throw new Error("Common drawing type letter scale v65 missing: " + required);

const encoded = Buffer.from(html).toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("v65: Serbest Cizim tip yazisi yuzde 50-200 araliginda ayarlanir; kayitli tip harfi korunur.");
