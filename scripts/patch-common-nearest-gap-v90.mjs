import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Nearest gap v90: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");
if (!html.includes('data-rafex-common-independent="v44"')) throw new Error("Nearest gap v90: Ortak Cizim v44 bulunamadi");

html = html
  .replace(/<meta\s+data-rafex-common-nearest-gap="v90"[^>]*>\s*/g, "")
  .replace(/<script\s+data-rafex-common-nearest-gap="v90">[\s\S]*?<\/script>\s*/g, "");

function replaceFunction(source, signature, replacement) {
  const start = source.indexOf(signature);
  if (start < 0) throw new Error(`Nearest gap v90: ${signature} bulunamadi`);
  const braceStart = source.indexOf("{", start);
  if (braceStart < 0) throw new Error(`Nearest gap v90: ${signature} govde basi bulunamadi`);
  let depth = 0;
  let quote = null;
  let escape = false;
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

// Sadece tek komsu oldugu icin arayuz adini sabitle.
html = html.replace(
  "label.innerHTML='<input type=\"checkbox\" '+(pinnedPairGaps.has(key)?'checked':'')+' onchange=\"rafexToggleRackPairGap('+pair.a.id+','+pair.b.id+',this.checked)\" aria-label=\"Raf arası '+(index+1)+' ölçüsünü göster\"><span>Raf arası '+(index+1)+'</span><input type=\"number\" min=\"0\" step=\"1\" value=\"'+mm+'\" oninput=\"event.stopPropagation()\" onchange=\"rafexSetRackPairDistance('+pair.a.id+','+pair.b.id+',this.value,'+rack.id+')\" aria-label=\"Raf arası '+(index+1)+' mesafesi milimetre\">';",
  "label.innerHTML='<input type=\"checkbox\" '+(pinnedPairGaps.has(key)?'checked':'')+' onchange=\"rafexToggleRackPairGap('+pair.a.id+','+pair.b.id+',this.checked)\" aria-label=\"En yakın raf ölçüsünü göster\"><span>En yakın raf</span><input type=\"number\" min=\"0\" step=\"1\" value=\"'+mm+'\" oninput=\"event.stopPropagation()\" onchange=\"rafexSetRackPairDistance('+pair.a.id+','+pair.b.id+',this.value,'+rack.id+')\" aria-label=\"En yakın raf mesafesi milimetre\">';"
);

html = html.replace("</head>", '<meta data-rafex-common-nearest-gap="v90"></head>');

for (const required of [
  'data-rafex-common-nearest-gap="v90"',
  'var best=null,bestDistance=Infinity',
  'return best?[best]:[];',
  '<span>En yakın raf</span>'
]) if (!html.includes(required)) throw new Error("Nearest gap v90 dogrulama eksigi: "+required);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v90: Kenar uzakliklarinda yalniz secili modulun en yakin tek komsusu O(n) taramayla gosterilir; tum raf ciftleri uretilmez.");
