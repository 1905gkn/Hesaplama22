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

// V92: Canli surukleme daha once serbest bloklari yalniz 1000x650 tuval
// dikdortgenine gore sinirliyordu. Dondurulmus raf ve egimli/cokgen alan
// koselerinde pointermove ile pointerup farkli geometri kullandigi icin blok
// birakildiginda sicriyor veya gecersiz halde kilitleniyordu. Tekli, birlesik
// ve toplu raflari ayni m2RackInsideArea poligon kaynagina bagla.
const moveHelper = `      function m2MoveRackOrJoinedGroup(rack, nextX, nextY) {`;
const cornerHelpers = `      function m2FreeAreaCenter(){
        const points=Array.isArray(m2LayoutState.points)?m2LayoutState.points:[];
        if(!points.length)return{x:500,y:325};
        return{x:points.reduce((sum,point)=>sum+Number(point.x||0),0)/points.length,y:points.reduce((sum,point)=>sum+Number(point.y||0),0)/points.length};
      }
      function m2SmoothFreeRackPosition(rack,targetX,targetY){
        const valid=(x,y)=>m2RackInsideArea(rack,x,y,rack.angle);
        if(valid(targetX,targetY))return{x:targetX,y:targetY,exact:true};
        const candidates=[],seeds=[];
        if(valid(rack.x,rack.y))seeds.push({x:rack.x,y:rack.y});
        const area=m2FreeAreaCenter(),center={x:area.x-rack.w/2,y:area.y-rack.h/2};
        if(valid(center.x,center.y))seeds.push(center);
        const approach=(start,endX,endY)=>{
          let low=0,high=1;
          for(let index=0;index<18;index++){
            const mid=(low+high)/2,x=start.x+(endX-start.x)*mid,y=start.y+(endY-start.y)*mid;
            if(valid(x,y))low=mid;else high=mid;
          }
          const x=start.x+(endX-start.x)*low,y=start.y+(endY-start.y)*low;
          if(valid(x,y))candidates.push({x,y,exact:false});
        };
        seeds.forEach((seed)=>{approach(seed,targetX,targetY);approach(seed,targetX,seed.y);approach(seed,seed.x,targetY);});
        candidates.sort((a,b)=>Math.hypot(a.x-targetX,a.y-targetY)-Math.hypot(b.x-targetX,b.y-targetY));
        return candidates[0]||seeds[0]||null;
      }
      function m2FreeGroupTranslationValid(origins,dx,dy){
        return origins.every((origin)=>{const member=m2LayoutState.racks.find((item)=>item.id===origin.id);return member&&m2RackInsideArea(member,origin.x+dx,origin.y+dy,member.angle);});
      }
      function m2SmoothFreeGroupTranslation(origins,targetDx,targetDy){
        if(m2FreeGroupTranslationValid(origins,targetDx,targetDy))return{dx:targetDx,dy:targetDy,exact:true};
        const seeds=[],candidates=[];
        if(m2FreeGroupTranslationValid(origins,0,0))seeds.push({dx:0,dy:0});
        const boxes=origins.map((origin)=>{const member=m2LayoutState.racks.find((item)=>item.id===origin.id);return member?m2RackBounds(member,origin.x,origin.y,member.angle):null;}).filter(Boolean);
        if(boxes.length){
          const area=m2FreeAreaCenter(),left=Math.min(...boxes.map((box)=>box.left)),right=Math.max(...boxes.map((box)=>box.right)),top=Math.min(...boxes.map((box)=>box.top)),bottom=Math.max(...boxes.map((box)=>box.bottom)),center={dx:area.x-(left+right)/2,dy:area.y-(top+bottom)/2};
          if(m2FreeGroupTranslationValid(origins,center.dx,center.dy))seeds.push(center);
        }
        const approach=(start,endDx,endDy)=>{
          let low=0,high=1;
          for(let index=0;index<18;index++){
            const mid=(low+high)/2,dx=start.dx+(endDx-start.dx)*mid,dy=start.dy+(endDy-start.dy)*mid;
            if(m2FreeGroupTranslationValid(origins,dx,dy))low=mid;else high=mid;
          }
          const dx=start.dx+(endDx-start.dx)*low,dy=start.dy+(endDy-start.dy)*low;
          if(m2FreeGroupTranslationValid(origins,dx,dy))candidates.push({dx,dy,exact:false});
        };
        seeds.forEach((seed)=>{approach(seed,targetDx,targetDy);approach(seed,targetDx,seed.dy);approach(seed,seed.dx,targetDy);});
        candidates.sort((a,b)=>Math.hypot(a.dx-targetDx,a.dy-targetDy)-Math.hypot(b.dx-targetDx,b.dy-targetDy));
        return candidates[0]||seeds[0]||{dx:0,dy:0,exact:false};
      }
${moveHelper}`;
replaceRequired(moveHelper, cornerHelpers, "v92 kose yardimcilarinin ekleme noktasi");

replaceRequired(
  "freeGroup?m2ClampGroupTranslationToCanvas(drag.groupMembers,targetDx,targetDy):m2SmoothGroupTranslation(drag.groupMembers,targetDx,targetDy)",
  "freeGroup?m2SmoothFreeGroupTranslation(drag.groupMembers,targetDx,targetDy):m2SmoothGroupTranslation(drag.groupMembers,targetDx,targetDy)",
  "v92 canli birlesik raf kose hesabi",
);
replaceRequired(
  "freeGroup?m2ClampGroupTranslationToCanvas(m2LayoutState.drag.groupMembers,targetDx,targetDy):m2SmoothGroupTranslation(m2LayoutState.drag.groupMembers,targetDx,targetDy)",
  "freeGroup?m2SmoothFreeGroupTranslation(m2LayoutState.drag.groupMembers,targetDx,targetDy):m2SmoothGroupTranslation(m2LayoutState.drag.groupMembers,targetDx,targetDy)",
  "v92 temel birlesik raf kose hesabi",
);

replaceRequired(
  `        if(rack.freePlacement){
          rack.x=Math.max(0,Math.min(1000-rack.w,nextX));rack.y=Math.max(0,Math.min(650-rack.h,nextY));
          $("m2FloorStatus").textContent="İlk bırakmaya kadar duvarlardan bağımsız taşıyabilirsin.";m2PaintLiveRackDragFrame();return;
        }`,
  `        if(rack.freePlacement){
          const freeAdjusted=m2SmoothFreeRackPosition(rack,nextX,nextY);if(freeAdjusted){rack.x=freeAdjusted.x;rack.y=freeAdjusted.y;}
          $("m2FloorStatus").textContent=freeAdjusted?.exact?"Raf gerçek alan sınırları içinde taşınıyor.":"Raf döndürülmüş köşeleri korunarak alan sınırında kaydırılıyor.";m2PaintLiveRackDragFrame();return;
        }`,
  "v92 canli tek raf kose hesabi",
);
replaceRequired(
  `            if (rack.freePlacement) {
              rack.x = Math.max(0, Math.min(1000 - rack.w, nextX)); rack.y = Math.max(0, Math.min(650 - rack.h, nextY));
              $("m2FloorStatus").textContent = "İlk bırakmaya kadar duvarlardan bağımsız taşıyabilirsin."; m2QueueLayoutRender(); return;
            }`,
  `            if (rack.freePlacement) {
              const freeAdjusted=m2SmoothFreeRackPosition(rack,nextX,nextY);if(freeAdjusted){rack.x=freeAdjusted.x;rack.y=freeAdjusted.y;}
              $("m2FloorStatus").textContent = freeAdjusted?.exact ? "Raf gerçek alan sınırları içinde taşınıyor." : "Raf döndürülmüş köşeleri korunarak alan sınırında kaydırılıyor."; m2QueueLayoutRender(); return;
            }`,
  "v92 temel tek raf kose hesabi",
);
replaceRequired(
  `            else if (rack?.freePlacement) {
              rack.freePlacement = false; rack.staged = false; rack.locked = true;
              const outside = !m2RackInsideArea(rack), overlap = m2RackOverlaps(rack);
              $("m2FloorStatus").textContent = outside
                ? "Raf duvarın üzerinde veya alan dışında bırakıldı; bu konumdayken proje kaydedilemez."
                : overlap ? "Raf başka bir rafın üzerinde bırakıldı; bu konumdayken proje kaydedilemez."
                : "Raf bırakıldı; artık duvar ve çakışma sınırları aktif.";
              m2RenderLayout();
            }`,
  `            else if (rack?.freePlacement) {
              const outside=!m2RackInsideArea(rack),overlap=m2RackOverlaps(rack),valid=!outside&&!overlap;
              rack.freePlacement=!valid;rack.staged=!valid;rack.locked=valid;
              $("m2FloorStatus").textContent=outside
                ? "Raf alan sınırında tutuldu; tamamı gerçek alan içine girene kadar serbest taşıma açık."
                : overlap ? "Raf başka bir rafla çakışıyor; uygun konuma gelene kadar serbest taşıma açık."
                : "Raf gerçek alan sınırları içinde yerleştirildi; duvar ve çakışma sınırları aktif.";
              m2RenderLayout();
            }`,
  "v92 tek raf birakma durumu",
);

for (const required of [
  marker,
  "m2PerfTranslateSharedFeet",
  "rafex-shared-foot-layer-v60 [data-shared-foot]",
  "drag.perfSharedFootEntries",
  'entry.node.style.visibility="hidden"',
  "m2PerfTranslateSharedFeet(drag,movingIds,dx,dy)",
  "function m2SmoothFreeRackPosition(rack,targetX,targetY)",
  "function m2SmoothFreeGroupTranslation(origins,targetDx,targetDy)",
  "freeGroup?m2SmoothFreeGroupTranslation",
  "rack.freePlacement=!valid;rack.staged=!valid;rack.locked=valid",
]) if (!html.includes(required)) throw new Error("v69 son dogrulama eksik: " + required);

if (html.includes("freeGroup?m2ClampGroupTranslationToCanvas")) throw new Error("v92: eski dikdortgen grup siniri kaldi.");

fs.writeFileSync(portalPath, html);
console.log("v69/v92: Ortak ayak tasima ve gercek poligon/dondurulmus kose siniri tek katmanda aktif.");
