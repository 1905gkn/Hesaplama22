import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Mekik main front v93: HTML_BASE64 bulunamadi");
let html = Buffer.from(match[3], "base64").toString("utf8");

if (!html.includes('const m2MekikSetFrontRaster = "data:image/png;base64,')) throw new Error("Mekik main front v93: eski front raster bulunamadi");
if (!html.includes('$("m2Front").innerHTML = elevation("front");')) throw new Error("Mekik main front v93: ana front render noktasi bulunamadi");

html = html
  .replace(/<script\s+data-rafex-mekik-main-front="v93">[\s\S]*?<\/script>\s*/g, "")
  .replace('$("m2Front").innerHTML = elevation("front");', '$("m2Front").innerHTML = (typeof rafexMekikMainFrontV93 === "function" ? rafexMekikMainFrontV93() : elevation("front"));');

const runtime = String.raw`<script data-rafex-mekik-main-front="v93">(function(){
  if(window.__rafexMekikMainFrontV93)return;
  window.__rafexMekikMainFrontV93=true;
  function n(v,f){var x=Number(v);return Number.isFinite(x)?x:f;}
  function f(v){var x=Math.round(n(v,0));try{return x.toLocaleString('tr-TR')}catch(e){return String(x)}}
  function escText(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  window.rafexMekikMainFrontV93=function(){
    var d=typeof m2LastDrawing!=='undefined'&&m2LastDrawing?m2LastDrawing:{};
    var bays=Math.max(1,Math.round(n(d.bays,1)));
    var levels=Math.max(1,Math.round(n(d.levels,1)));
    var palW=Math.max(600,n(d.palW,1200));
    var side=Math.max(0,n(d.sideClearance,n(d.sideGap,75)));
    var upright=Math.max(70,Math.min(140,n(d.footType,90)));
    var column=palW+150;
    var first=Math.max(0,n(d.firstRailHeight,430));
    var levelH=Math.max(380,n(d.levelH,1580));
    var palletH=Math.max(300,n(d.palletHeight,1200));
    var rackH=Math.max(first+(levels-1)*levelH+palletH/2,n(d.totalRackHeight,0));
    var fullW=Math.max(1,n(d.totalWidth,bays*(palW+150)+(bays+1)*upright));
    var image='';
    try{image=(typeof m2MekikSetFrontRaster!=='undefined'&&m2MekikSetFrontRaster)||'';}catch(e){}
    var floorY=448,topY=84,shaftX=132;
    var useful=floorY-topY;
    var scale=useful/Math.max(1,rackH);
    var dims='';
    dims+='<text x="35" y="128" class="rf93-title">KOT ARALIKLARI</text>';
    var prev=0;
    for(var i=0;i<levels;i++){
      var z=i===0?first:first+i*levelH;
      var yy=floorY-z*scale;
      var py=floorY-prev*scale;
      var label=i===0?'ZEMİN · '+f(first)+' mm':'K'+i+' · '+f(levelH)+' mm';
      dims+='<g class="rf93-dim"><line x1="'+shaftX+'" y1="'+py+'" x2="'+shaftX+'" y2="'+yy+'"/><path d="M'+(shaftX-5)+' '+(py-8)+'L'+shaftX+' '+py+'L'+(shaftX+5)+' '+(py-8)+'M'+(shaftX-5)+' '+(yy+8)+'L'+shaftX+' '+yy+'L'+(shaftX+5)+' '+(yy+8)+'"/><line class="rf93-witness" x1="'+shaftX+'" y1="'+yy+'" x2="174" y2="'+yy+'"/><text x="122" y="'+((py+yy)/2+4)+'" text-anchor="end">'+label+'</text></g>';
      prev=z;
    }
    return '<svg data-rafex-mekik-main-front="v93" viewBox="0 0 760 500" role="img" aria-label="Eski Mekik ön görünüşü"><defs><style>.rf93-title{font:900 14px Arial;fill:#083d32}.rf93-dim{font:900 11px Arial;fill:#083d32;stroke:#d5ab00;stroke-width:2}.rf93-dim text{stroke:none;fill:#083d32}.rf93-witness{stroke:#d5ab00;stroke-width:1.3;stroke-dasharray:4 4}.rf93-chip{font:900 11px Arial}.rf93-chip-bg{fill:#123f31}.rf93-chip-text{fill:#fff}.rf93-yellow{fill:#fff4ae;stroke:#d5ab00}.rf93-yellow-text{fill:#3d3500}</style></defs><rect width="760" height="500" fill="#fff"/><g class="rf93-top"><text x="380" y="24" text-anchor="middle" class="rf93-chip rf93-yellow-text">YAN BOŞLUK · '+f(side)+' + '+f(side)+' mm</text><rect x="274" y="31" width="212" height="24" rx="12" class="rf93-chip-bg"/><text x="380" y="47" text-anchor="middle" class="rf93-chip rf93-chip-text">KOLON ARALIĞI · '+f(column)+' mm</text><rect x="316" y="59" width="128" height="20" rx="10" class="rf93-yellow"/><text x="380" y="73" text-anchor="middle" class="rf93-chip rf93-yellow-text">PALET · '+f(palW)+' mm</text></g>'+dims+'<g class="rf93-old-rack"><image href="'+escText(image)+'" x="172" y="82" width="414" height="366" preserveAspectRatio="xMidYMid meet"/></g><g><rect x="610" y="226" width="120" height="52" rx="9" class="rf93-chip-bg"/><text x="670" y="246" text-anchor="middle" class="rf93-chip rf93-chip-text">AYAK UZUNLUĞU</text><text x="670" y="266" text-anchor="middle" style="font:900 17px Arial;fill:#fff">'+f(rackH)+' mm</text></g><line x1="172" y1="448" x2="586" y2="448" stroke="#33413c" stroke-width="2"/><text x="379" y="478" text-anchor="middle" style="font:900 11px Arial;fill:#173c2d">'+f(fullW)+' mm · '+f(bays)+' GÖZ</text></svg>';
  };
})();</script>`;

const close = html.lastIndexOf("</body>");
if (close < 0) throw new Error("Mekik main front v93: body sonu bulunamadi");
html = html.slice(0, close) + runtime + "\n" + html.slice(close);

for (const required of [
  'data-rafex-mekik-main-front="v93"',
  'window.rafexMekikMainFrontV93',
  'typeof rafexMekikMainFrontV93 === "function"',
  'KOT ARALIKLARI',
  'm2MekikSetFrontRaster'
]) if (!html.includes(required)) throw new Error("Mekik main front v93 doğrulama eksigi: " + required);

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(match[0], `${match[1]}${match[2]}${encoded}${match[2]}`);
fs.writeFileSync(workerPath, worker);
console.log("v93: Mekik ANA Önden Görünüş #m2Front eski onaylanan raster görünüşe alındı; PDF/rapor katmanına dokunulmadı.");
