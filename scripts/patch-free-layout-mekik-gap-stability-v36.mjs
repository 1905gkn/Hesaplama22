import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = "function m2PerfLiveNearestRackGap(rack)";
if (html.includes(marker)) {
  console.log("v36: Mekik Serbest Cizim raf-arasi stabilite yamasi zaten mevcut.");
  process.exit(0);
}

function replaceRequired(from, to, label) {
  if (!html.includes(from)) throw new Error(`v36: ${label} bulunamadi.`);
  html = html.replace(from, to);
}

// Surukleme sirasinda baska bir rafta sabitlenmis RAF ARASI cizgisi,
// hareket eden rafin eski konumunu gostermeye devam ediyordu. Bu durum ekranda
// iki ayri mesafe cizgisi ve "takili kalmis" olcu goruntusu olusturuyordu.
const oldRemoveStatic = `      function m2PerfRemoveStaticMovingGuides(layer,rackId){
        layer.querySelectorAll('.m2-wall-guide[data-wall-rack="'+rackId+'"]').forEach((node)=>node.remove());
        ["gap:"+rackId,"column-gap:"+rackId].forEach((key)=>{layer.querySelectorAll('[data-dimension-key="'+key+'"]').forEach((node)=>node.closest(".m2-distance-guide")?.remove());});
        layer.querySelectorAll(".m2-b2b-seismic-brace[data-seismic-racks]").forEach((node)=>{const ids=String(node.dataset.seismicRacks||"").split(",").map(Number);if(ids.includes(Number(rackId)))node.remove();});
      }`;
const newRemoveStatic = `      function m2PerfRemoveStaticMovingGuides(layer,rackId){
        layer.querySelectorAll('.m2-wall-guide[data-wall-rack="'+rackId+'"]').forEach((node)=>node.remove());
        // Aktif surukleme boyunca tum statik RAF ARASI cizgilerini gizle.
        // Cunku bu cizgilerden biri hareket eden rafi hedefliyorsa eski koordinatta kalir.
        // Pointerup'taki normal m2RenderLayout hepsini yeni konuma gore tekrar hesaplar.
        layer.querySelectorAll('.m2-distance-guide[data-rack-gap]').forEach((node)=>node.remove());
        ["column-gap:"+rackId].forEach((key)=>{layer.querySelectorAll('[data-dimension-key="'+key+'"]').forEach((node)=>node.closest(".m2-distance-guide")?.remove());});
        layer.querySelectorAll(".m2-b2b-seismic-brace[data-seismic-racks]").forEach((node)=>{const ids=String(node.dataset.seismicRacks||"").split(",").map(Number);if(ids.includes(Number(rackId)))node.remove();});
      }`;
replaceRequired(oldRemoveStatic, newRemoveStatic, "statik raf-arasi olcu temizligi");

const renderAnchor = `      function m2PerfRenderSingleRackDragFrame(){`;
if (!html.includes(renderAnchor)) throw new Error("v36: tek raf drag render ankraji bulunamadi.");

// Canli RAF ARASI hesabi icin agir m2ClearRackGapLine -> duvar/rack taramasini her
// pointer karesinde calistirmiyoruz. Sadece birbirine izdusu olan raflar arasinda
// gercek kenar-kenar mesafeyi hesapliyoruz. Hedef degisimi yakin esit mesafelerde
// kisa bir histerezis ile sabitlenir; Mekik eklendiginde etiket ileri-geri ziplamaz.
const helpers = `      function m2PerfLiveGapCandidate(rack,other,a,b){
        if(!other||Number(other.id)===Number(rack.id))return null;
        if(rack.joinGroup&&other.joinGroup===rack.joinGroup)return null;
        if(other.staged||other.freePlacement)return null;
        const candidates=[];
        const y1=Math.max(a.top,b.top),y2=Math.min(a.bottom,b.bottom),x1=Math.max(a.left,b.left),x2=Math.min(a.right,b.right);
        const yOverlap=y2-y1,xOverlap=x2-x1;
        if(yOverlap>.01){
          const y=(y1+y2)/2;
          if(a.right<=b.left)candidates.push({direction:"right",distance:b.left-a.right,ax:a.right,ay:y,bx:b.left,by:y});
          if(b.right<=a.left)candidates.push({direction:"left",distance:a.left-b.right,ax:a.left,ay:y,bx:b.right,by:y});
        }
        if(xOverlap>.01){
          const x=(x1+x2)/2;
          if(a.bottom<=b.top)candidates.push({direction:"bottom",distance:b.top-a.bottom,ax:x,ay:a.bottom,bx:x,by:b.top});
          if(b.bottom<=a.top)candidates.push({direction:"top",distance:a.top-b.bottom,ax:x,ay:a.top,bx:x,by:b.bottom});
        }
        if(!candidates.length)return null;
        candidates.sort((p,q)=>p.distance-q.distance||String(p.direction).localeCompare(String(q.direction)));
        const best=candidates[0];best.other=other;best.clearanceMm=m2RackClearanceMm(rack,other,best.direction);return best;
      }
      function m2PerfLiveNearestRackGap(rack){
        const a=m2CombinedRackBounds(rack),drag=m2LayoutState.drag,candidates=[];
        m2LayoutState.racks.forEach((other)=>{const b=m2RackBounds(other),candidate=m2PerfLiveGapCandidate(rack,other,a,b);if(candidate)candidates.push(candidate);});
        if(!candidates.length){if(drag)drag.liveGapOtherId=null;return null;}
        candidates.sort((p,q)=>p.distance-q.distance||Number(p.other?.id||0)-Number(q.other?.id||0));
        let best=candidates[0];
        if(drag?.liveGapOtherId!=null){
          const previous=candidates.find((c)=>Number(c.other?.id)===Number(drag.liveGapOtherId));
          const tolerance=Math.max(.5,100*Math.max(.000001,Number(m2LayoutState.scale)||0));
          if(previous&&previous.distance<=best.distance+tolerance)best=previous;
        }
        if(drag)drag.liveGapOtherId=best.other?.id??null;
        return best;
      }
      function m2PerfLiveRackDistanceGuide(rack){
        const nearest=m2PerfLiveNearestRackGap(rack);if(!nearest)return "";
        const mm=Math.max(0,Math.round(nearest.distance/Math.max(.000001,m2LayoutState.scale))-Number(nearest.clearanceMm||0)),mx=(nearest.ax+nearest.bx)/2,my=(nearest.ay+nearest.by)/2,axis=Math.abs(nearest.ax-nearest.bx)<Math.abs(nearest.ay-nearest.by)?"vertical":"horizontal",label=m2DimensionPosition("gap:"+rack.id,mx,my-8);
        return '<g class="m2-distance-guide" data-rack-gap="'+mm+'" data-rack-gap-other="'+String(nearest.other?.id??"")+'"><line x1="'+nearest.ax+'" y1="'+nearest.ay+'" x2="'+nearest.bx+'" y2="'+nearest.by+'" class="m2-rack-distance"/><circle cx="'+nearest.ax+'" cy="'+nearest.ay+'" r="4" fill="#e09b00"/><circle cx="'+nearest.bx+'" cy="'+nearest.by+'" r="4" fill="#e09b00"/><rect x="'+(label.x-48)+'" y="'+(label.y-13)+'" width="96" height="20" rx="5" class="m2-measure-hit" data-dimension-key="gap:'+rack.id+'" data-dimension-axis="'+axis+'"/><text x="'+label.x+'" y="'+label.y+'" text-anchor="middle" class="m2-rack-distance-label m2-dimension-movable" data-dimension-key="gap:'+rack.id+'" data-dimension-axis="'+axis+'">RAF ARASI '+fmt(mm)+' mm</text></g>';
      }
`;
html = html.replace(renderAnchor, helpers + renderAnchor);

const oldGuideLine = `        const overlay=m2PerfEnsureDragOverlay(layer),guideHtml=m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2RackDistanceGuide(rack)+m2ColumnDistanceGuide(rack)+m2PerfMovingSeismicSvg(rack.id);`;
const newGuideLine = `        const overlay=m2PerfEnsureDragOverlay(layer),guideHtml=rack.freePlacement?"":m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2PerfLiveRackDistanceGuide(rack)+m2ColumnDistanceGuide(rack)+m2PerfMovingSeismicSvg(rack.id);`;
replaceRequired(oldGuideLine, newGuideLine, "canli raf-arasi guide hesabi");

// m2AddRack, eklemeden 120 ms sonra rapor DOM'unu yeniliyordu. Kullanici yeni Mekik'i
// hemen suruklemeye baslarsa bu yenileme drag karesinin ortasinda calisip titreme
// yaratabiliyordu. Drag bitene kadar rapor yenilemesini ertele.
const oldReportRefresh = `setTimeout(()=>{if(typeof m2RefreshActiveReport==="function")m2RefreshActiveReport();},120);`;
const newReportRefresh = `setTimeout(function m2RefreshReportAfterStableAdd(){if(m2LayoutState?.drag){setTimeout(m2RefreshReportAfterStableAdd,180);return;}if(typeof m2RefreshActiveReport==="function")m2RefreshActiveReport();},180);`;
if (html.includes(oldReportRefresh)) html = html.replace(oldReportRefresh, newReportRefresh);
else if (!html.includes("m2RefreshReportAfterStableAdd")) throw new Error("v36: raf ekleme rapor yenileme ankraji bulunamadi.");

for (const required of [
  marker,
  "m2PerfLiveRackDistanceGuide(rack)",
  ".m2-distance-guide[data-rack-gap]",
  "data-rack-gap-other",
  "m2RefreshReportAfterStableAdd"
]) if (!html.includes(required)) throw new Error(`v36: dogrulama eksik: ${required}`);

fs.writeFileSync(portalPath, html);
console.log("v36: Serbest Cizim Mekik drag stabil; eski RAF ARASI guide temizleniyor, canli gap tek hafif hesapla guncelleniyor, rapor refresh drag sonrasina erteleniyor.");
