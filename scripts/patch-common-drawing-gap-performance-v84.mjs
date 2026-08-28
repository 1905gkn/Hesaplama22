import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Common gap perf v84: HTML_BASE64 bulunamadi");

let html = Buffer.from(match[3], "base64").toString("utf8");
if (!html.includes('data-rafex-common-independent="v44"')) throw new Error("Common gap perf v84: v44 runtime bulunamadi");

// Secim panelinde onceki renderlardan kalan Raf arasi alanlarini mutlaka temizle.
// v44 bunlari append ediyordu; buyuk projelerde yuzlerce input DOM'da birikiyordu.
const oldControlsCleanup = `    Array.from(wallEditor.querySelectorAll('label')).forEach(function(label){var span=label.querySelector('span');if(span&&String(span.textContent||'').trim()==='En yakın raf arası')label.remove();});`;
const newControlsCleanup = `    wallEditor.querySelectorAll('[data-rafex-pair-field]').forEach(function(node){node.remove();});\n    Array.from(wallEditor.querySelectorAll('label')).forEach(function(label){var span=label.querySelector('span');if(span&&String(span.textContent||'').trim()==='En yakın raf arası')label.remove();});`;
if (!html.includes(oldControlsCleanup) && !html.includes("wallEditor.querySelectorAll('[data-rafex-pair-field]')")) throw new Error("Common gap perf v84: kontrol temizleme anchor bulunamadi");
if (!html.includes("wallEditor.querySelectorAll('[data-rafex-pair-field]')")) html = html.replace(oldControlsCleanup, newControlsCleanup);

// Eski allPairs her normal renderda N x N tarama yapiyordu. Oysa ekranda yalnizca
// secili/olculen rafin en yakin 4 yonu ve daha once sabitlenen ciftler gerekiyor.
const allPairsPattern = /  function allPairs\(\)\{[\s\S]*?    return Array\.from\(unique\.values\(\)\);\n  \}/;
const focusedAllPairs = String.raw`  function allPairs(){
    var racks=Array.isArray(m2LayoutState&&m2LayoutState.racks)?m2LayoutState.racks:[],unique=new Map();
    if(!racks.length)return [];
    var measured=typeof m2MeasurementRack==='function'?m2MeasurementRack():null;
    var activeId=m2LayoutState&&m2LayoutState.selected!=null?m2LayoutState.selected:(measured&&measured.id);
    var active=activeId!=null?racks.find(function(rack){return Number(rack.id)===Number(activeId);}):null;
    function addPair(a,b){
      var pair=pairCandidate(a,b);if(!pair)return;
      var first=Math.min(Number(a.id),Number(b.id)),second=Math.max(Number(a.id),Number(b.id)),key=first+':'+second;
      if(!unique.has(key))unique.set(key,pair);
    }
    function addNearestFor(a){
      if(!a)return;
      var nearest={};
      racks.forEach(function(b){
        var rough=roughPair(a,b),current=rough&&nearest[rough.direction];
        if(rough&&(!current||rough.distance<current.distance))nearest[rough.direction]={distance:rough.distance,b:b};
      });
      Object.keys(nearest).forEach(function(direction){addPair(a,nearest[direction].b);});
    }
    addNearestFor(active);
    pinnedPairGaps.forEach(function(key){
      var ids=String(key||'').split(':').map(Number),a=racks.find(function(rack){return Number(rack.id)===ids[0];}),b=racks.find(function(rack){return Number(rack.id)===ids[1];});
      if(a&&b)addPair(a,b);
    });
    return Array.from(unique.values());
  }`;
if (!html.includes('var measured=typeof m2MeasurementRack') ) {
  if (!allPairsPattern.test(html)) throw new Error("Common gap perf v84: allPairs blogu bulunamadi");
  html = html.replace(allPairsPattern, focusedAllPairs);
}

if (!html.includes('data-rafex-common-gap-performance="v84"')) {
  html = html.replace('</head>', '<meta data-rafex-common-gap-performance="v84"></head>');
}

for (const required of [
  'data-rafex-common-gap-performance="v84"',
  "wallEditor.querySelectorAll('[data-rafex-pair-field]')",
  "var measured=typeof m2MeasurementRack==='function'?m2MeasurementRack():null",
  'addNearestFor(active)',
  'pinnedPairGaps.forEach(function(key)'
]) if (!html.includes(required)) throw new Error("Common gap perf v84 dogrulama eksigi: " + required);

const oldEncoded = match[3];
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.replace(oldEncoded, encoded);
fs.writeFileSync(workerPath, worker);
console.log("v84: Ortak Cizim raf secimi O(n) en yakin komsu hesabina indirildi; biriken Raf arasi DOM alanlari temizleniyor.");

// Adet hesaplarini degistirmeden urun kartlarindaki teknik detaylari geri getir.
await import("./patch-product-detail-restore-v86.mjs");
// Ortak proje modu, ayri proje adi ve module=ortak kaydi son runtime olarak uygula.
await import("./patch-common-project-mode-v87.mjs");
// Eski karma kayitlar hangi yoldan acilirsa acilsin module=ortak olarak yuklenir.
await import("./patch-common-loader-normalize-v88.mjs");
// Ortak Cizim, sistemlerin kendi Serbest Yerlesim sayfalarindan ayri kimlikle takip edilir.
await import("./patch-common-mode-identity-v89.mjs");