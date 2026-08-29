import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Nearest gap v90: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");
if (!html.includes('data-rafex-common-independent="v44"')) throw new Error("Nearest gap v90: Ortak Cizim v44 bulunamadi");
if (!html.includes('data-rafex-mekik-native-front-details="v13"')) throw new Error("v92: Mekik native front v13 bulunamadi");

html = html
  .replace(/<meta\s+data-rafex-common-nearest-gap="v90"[^>]*>\s*/g, "")
  .replace(/<script\s+data-rafex-common-nearest-gap="v90">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<script\s+data-rafex-common-save-mekik-front="v91">[\s\S]*?<\/script>\s*/g, "")
  .replace(/<script\s+data-rafex-common-save-only="v92">[\s\S]*?<\/script>\s*/g, "");

function replaceFunction(source, signature, replacement) {
  const start = source.indexOf(signature);
  if (start < 0) throw new Error(`Nearest gap v90: ${signature} bulunamadi`);
  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) throw new Error(`Nearest gap v90: ${signature} govde basi bulunamadi`);
  let depth = 0, quote = null, escape = false;
  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return source.slice(0, start) + replacement + source.slice(i + 1);
    }
  }
  throw new Error(`Nearest gap v90: ${signature} govde sonu bulunamadi`);
}

const nearestAllPairs = `  function allPairs(){
    var racks=Array.isArray(m2LayoutState&&m2LayoutState.racks)?m2LayoutState.racks:[];
    if(!racks.length)return [];
    var activeId=m2LayoutState&&m2LayoutState.selected;
    if(activeId==null&&typeof m2MeasurementRack==='function'){
      var measured=m2MeasurementRack();activeId=measured&&measured.id;
    }
    if(activeId==null)return [];
    var active=racks.find(function(rack){return Number(rack.id)===Number(activeId);});
    if(!active)return [];
    var best=null,bestDistance=Infinity;
    for(var i=0;i<racks.length;i+=1){
      var other=racks[i];if(!other||Number(other.id)===Number(active.id))continue;
      var pair=pairCandidate(active,other);if(!pair)continue;
      var distance=Math.max(0,Number(pair.distance)||0);
      if(distance<bestDistance){bestDistance=distance;best=pair;}
    }
    return best?[best]:[];
  }`;
html = replaceFunction(html, "  function allPairs(){", nearestAllPairs);

html = html.replace(
  "label.innerHTML='<input type=\"checkbox\" '+(pinnedPairGaps.has(key)?'checked':'')+' onchange=\"rafexToggleRackPairGap('+pair.a.id+','+pair.b.id+',this.checked)\" aria-label=\"Raf arası '+(index+1)+' ölçüsünü göster\"><span>Raf arası '+(index+1)+'</span><input type=\"number\" min=\"0\" step=\"1\" value=\"'+mm+'\" oninput=\"event.stopPropagation()\" onchange=\"rafexSetRackPairDistance('+pair.a.id+','+pair.b.id+',this.value,'+rack.id+')\" aria-label=\"Raf arası '+(index+1)+' mesafesi milimetre\">';",
  "label.innerHTML='<input type=\"checkbox\" '+(pinnedPairGaps.has(key)?'checked':'')+' onchange=\"rafexToggleRackPairGap('+pair.a.id+','+pair.b.id+',this.checked)\" aria-label=\"En yakın raf ölçüsünü göster\"><span>En yakın raf</span><input type=\"number\" min=\"0\" step=\"1\" value=\"'+mm+'\" oninput=\"event.stopPropagation()\" onchange=\"rafexSetRackPairDistance('+pair.a.id+','+pair.b.id+',this.value,'+rack.id+')\" aria-label=\"En yakın raf mesafesi milimetre\">';"
);

const runtime = String.raw`<script data-rafex-common-save-only="v92">(function(){
  if(window.__rafexCommonSaveOnlyV92)return;
  window.__rafexCommonSaveOnlyV92=true;
  function realCommon(){
    var picker=document.getElementById('rafexUnifiedSystemPicker');
    var active=false;
    try{active=typeof window.rafexUnifiedFreeDrawingActiveV75==='function'&&window.rafexUnifiedFreeDrawingActiveV75()===true;}catch(error){}
    return !!(picker&&active);
  }
  var nativeFetch=window.fetch;
  if(typeof nativeFetch==='function'&&!nativeFetch.__rafexCommonSaveV92){
    var wrapped=function(input,init){
      var url=typeof input==='string'?input:(input&&input.url)||'';
      var opts=init||{};
      if(realCommon()&&/\/api\/projects(?:\?|$)/.test(url)&&String(opts.method||'GET').toUpperCase()==='POST'&&typeof opts.body==='string'){
        try{
          var body=JSON.parse(opts.body);
          body.module='ortak';
          if(body.payload&&typeof body.payload==='object'){
            body.payload.module='ortak';
            body.payload.rafexCommonDrawing=true;
          }
          opts=Object.assign({},opts,{body:JSON.stringify(body)});
        }catch(error){console.warn('Ortak Cizim kayit govdesi normalize edilemedi',error);}
      }
      return nativeFetch.call(this,input,opts);
    };
    wrapped.__rafexCommonSaveV92=true;
    window.fetch=wrapped;
  }
})();</script>`;

html = html.replace("</head>", '<meta data-rafex-common-nearest-gap="v90"></head>');
const closing=html.lastIndexOf("</body>");
if(closing<0)throw new Error("v92: </body> bulunamadi");
html=html.slice(0,closing)+runtime+"\n"+html.slice(closing);

for (const required of [
  'data-rafex-common-nearest-gap="v90"',
  'var best=null,bestDistance=Infinity',
  'return best?[best]:[];',
  '<span>En yakın raf</span>',
  'data-rafex-common-save-only="v92"',
  "body.module='ortak'",
  'data-rafex-mekik-native-front-details="v13"'
]) if (!html.includes(required)) throw new Error("Nearest gap/v92 dogrulama eksigi: "+required);
if (html.includes('data-rafex-mekik-front="restored-v91"')) throw new Error('v92: bozuk v91 Mekik on gorunus override hala aktif');

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v90/v92: En yakin raf O(n); Ortak kayit module=ortak; Mekik v91 override kaldirildi ve eski native v13 on gorunus korundu.");
await import("./patch-mekik-main-front-v93.mjs");
