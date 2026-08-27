import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = 'const m2PerfSharedFootDragVersion="v69";';
if (html.includes(marker)) {
  console.log("v69: Ortak ayak canli tasima yolu zaten mevcut.");
  process.exit(0);
}

function replaceRequired(from, to, label) {
  if (!html.includes(from)) throw new Error(`v69: ${label} bulunamadi.`);
  html = html.replace(from, to);
}

// Ortak ayaklar v57 tarafindan ana [data-rack] grubunun disinda, SVG'nin
// en ust katmaninda klonlanir. Raf grubu hizli translate olurken bu klonlar
// sabit kalmasin: ayni birlesik gruba ait ortak ayak holder'larini da ayni
// delta ile tasir. Bir bagin yalniz tek ucu seciliyse eski konumu gostermek
// yerine drag boyunca gizle; pointerup tam renderi dogru yerde yeniden kurar.
replaceRequired(
  `      function m2PerfMovingGroupSeismicSvg(movingIds){`,
  `      const m2PerfSharedFootDragVersion="v69";
      function m2PerfTranslateSharedFeet(drag,movingIds,dx,dy){
        if(!drag.perfSharedFootEntries){
          drag.perfSharedFootEntries=Array.from(document.querySelectorAll('#m2LayoutSvg .rafex-shared-foot-layer-v60 [data-shared-foot]')).map((node)=>({node,ids:String(node.dataset.sharedFoot||"").split(":").map(Number).filter(Number.isFinite),baseTransform:node.getAttribute("transform")||""}));
        }
        drag.perfSharedFootEntries.forEach((entry)=>{
          if(!entry.node?.isConnected)return;
          const movingCount=entry.ids.filter((id)=>movingIds.has(id)).length;
          if(!movingCount)return;
          if(movingCount!==entry.ids.length){entry.node.style.visibility="hidden";return;}
          entry.node.style.visibility="";m2PerfTranslateEntry(entry,dx,dy);
        });
      }
      function m2PerfMovingGroupSeismicSvg(movingIds){`,
  "ortak ayak DOM tasima yardimcisi",
);

replaceRequired(
  `        m2PerfTranslateDragSymbols(drag,movingIds,dx,dy);
        if(!m2PerfPreparedDrags.has(drag)){`,
  `        m2PerfTranslateDragSymbols(drag,movingIds,dx,dy);m2PerfTranslateSharedFeet(drag,movingIds,dx,dy);
        if(!m2PerfPreparedDrags.has(drag)){`,
  "grup frame ortak ayak cagrisi",
);

for (const required of [
  marker,
  "m2PerfTranslateSharedFeet",
  "rafex-shared-foot-layer-v60 [data-shared-foot]",
  "drag.perfSharedFootEntries",
  'entry.node.style.visibility="hidden"',
  "m2PerfTranslateSharedFeet(drag,movingIds,dx,dy)",
]) if (!html.includes(required)) throw new Error("v69 son dogrulama eksik: " + required);

fs.writeFileSync(portalPath, html);
console.log("v69: Birlesik blokla birlikte ortak mavi ayak katmani da ayni DOM delta ile tasiniyor.");
