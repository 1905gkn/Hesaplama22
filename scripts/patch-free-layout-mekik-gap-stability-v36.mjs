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
// hareket eden rafin eski konumunu gostermeye devam edebiliyordu. Aktif drag
// boyunca statik rack-gap cizgilerini kaldir; pointerup'taki tam render hepsini
// yeni koordinatlarla yeniden kurar.
const oldRemoveStatic = `      function m2PerfRemoveStaticMovingGuides(layer,rackId){
        layer.querySelectorAll('.m2-wall-guide[data-wall-rack="'+rackId+'"]').forEach((node)=>node.remove());
        ["gap:"+rackId,"column-gap:"+rackId].forEach((key)=>{layer.querySelectorAll('[data-dimension-key="'+key+'"]').forEach((node)=>node.closest(".m2-distance-guide")?.remove());});
        layer.querySelectorAll(".m2-b2b-seismic-brace[data-seismic-racks]").forEach((node)=>{const ids=String(node.dataset.seismicRacks||"").split(",").map(Number);if(ids.includes(Number(rackId)))node.remove();});
      }`;
const newRemoveStatic = `      function m2PerfRemoveStaticMovingGuides(layer,rackId){
        layer.querySelectorAll('.m2-wall-guide[data-wall-rack="'+rackId+'"]').forEach((node)=>node.remove());
        layer.querySelectorAll('.m2-distance-guide[data-rack-gap]').forEach((node)=>node.remove());
        ["column-gap:"+rackId].forEach((key)=>{layer.querySelectorAll('[data-dimension-key="'+key+'"]').forEach((node)=>node.closest(".m2-distance-guide")?.remove());});
        layer.querySelectorAll(".m2-b2b-seismic-brace[data-seismic-racks]").forEach((node)=>{const ids=String(node.dataset.seismicRacks||"").split(",").map(Number);if(ids.includes(Number(rackId)))node.remove();});
      }`;
replaceRequired(oldRemoveStatic, newRemoveStatic, "statik raf-arasi olcu temizligi");

const renderAnchor = `      function m2PerfRenderSingleRackDragFrame(){`;
if (!html.includes(renderAnchor)) throw new Error("v36: tek raf drag render ankraji bulunamadi.");

// Canli drag icin normal m2RackDistanceGuide'in engel taramasi ve iki farkli
// iliski uretme katmanini kullanma. Yalniz birbirine dik izdusu olan gercek raf
// sinirlari arasinda tek en yakin kenar-kenar mesafeyi bul. Bu yol O(n) ve bir
// animasyon karesinde tek kez calisir.
const helpers = `      function m2PerfLiveGapCandidate(rack,other,a,b){
        if(!other||Number(other.id)===Number(rack.id))return null;
        if(rack.joinGroup&&other.joinGroup===rack.joinGroup)return null;
        if(other.staged||other.freePlacement)return null;
        const candidates=[],y1=Math.max(a.top,b.top),y2=Math.min(a.bottom,b.bottom),x1=Math.max(a.left,b.left),x2=Math.min(a.right,b.right),yOverlap=y2-y1,xOverlap=x2-x1;
        if(yOverlap>.01){const y=(y1+y2)/2;if(a.right<=b.left)candidates.push({direction:"right",distance:b.left-a.right,ax:a.right,ay:y,bx:b.left,by:y});if(b.right<=a.left)candidates.push({direction:"left",distance:a.left-b.right,ax:a.left,ay:y,bx:b.right,by:y});}
        if(xOverlap>.01){const x=(x1+x2)/2;if(a.bottom<=b.top)candidates.push({direction:"bottom",distance:b.top-a.bottom,ax:x,ay:a.bottom,bx:x,by:b.top});if(b.bottom<=a.top)candidates.push({direction:"top",distance:a.top-b.bottom,ax:x,ay:a.top,bx:x,by:b.bottom});}
        if(!candidates.length)return null;candidates.sort((p,q)=>p.distance-q.distance||String(p.direction).localeCompare(String(q.direction)));const best=candidates[0];best.other=other;best.clearanceMm=m2RackClearanceMm(rack,other,best.direction);return best;
      }
      function m2PerfLiveNearestRackGap(rack){
        const a=m2CombinedRackBounds(rack),drag=m2LayoutState.drag,candidates=[];
        m2LayoutState.racks.forEach((other)=>{const b=m2RackBounds(other),candidate=m2PerfLiveGapCandidate(rack,other,a,b);if(candidate)candidates.push(candidate);});
        if(!candidates.length){if(drag)drag.liveGapOtherId=null;return null;}
        candidates.sort((p,q)=>p.distance-q.distance||Number(p.other?.id||0)-Number(q.other?.id||0));let best=candidates[0];
        if(drag?.liveGapOtherId!=null){const previous=candidates.find((c)=>Number(c.other?.id)===Number(drag.liveGapOtherId)),tolerance=Math.max(.5,100*Math.max(.000001,Number(m2LayoutState.scale)||0));if(previous&&previous.distance<=best.distance+tolerance)best=previous;}
        if(drag)drag.liveGapOtherId=best.other?.id??null;return best;
      }
      function m2PerfLiveRackDistanceGuide(rack){
        const nearest=m2PerfLiveNearestRackGap(rack);if(!nearest)return "";
        const scale=Math.max(.000001,Number(m2LayoutState.scale)||0),mm=Math.max(0,Math.round(nearest.distance/scale)-Number(nearest.clearanceMm||0)),mx=(nearest.ax+nearest.bx)/2,my=(nearest.ay+nearest.by)/2,axis=Math.abs(nearest.ax-nearest.bx)<Math.abs(nearest.ay-nearest.by)?"vertical":"horizontal",key="gap:"+rack.id,label=m2DimensionPosition(key,mx,my-8);
        return '<g class="m2-distance-guide" data-rack-gap="'+mm+'" data-rack-gap-owner="'+rack.id+'" data-rack-gap-other="'+String(nearest.other?.id??"")+'"><line x1="'+nearest.ax+'" y1="'+nearest.ay+'" x2="'+nearest.bx+'" y2="'+nearest.by+'" class="m2-rack-distance"/><circle cx="'+nearest.ax+'" cy="'+nearest.ay+'" r="4" fill="#e09b00"/><circle cx="'+nearest.bx+'" cy="'+nearest.by+'" r="4" fill="#e09b00"/><rect x="'+(label.x-48)+'" y="'+(label.y-13)+'" width="96" height="20" rx="5" class="m2-measure-hit" data-dimension-key="'+key+'" data-dimension-axis="'+axis+'"/><text x="'+label.x+'" y="'+label.y+'" text-anchor="middle" class="m2-rack-distance-label m2-dimension-movable" data-dimension-key="'+key+'" data-dimension-axis="'+axis+'">RAF ARASI '+fmt(mm)+' mm</text></g>';
      }
`;
html = html.replace(renderAnchor, helpers + renderAnchor);

const preV43GuideLine = `        const overlay=m2PerfEnsureDragOverlay(layer),guideHtml=m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2RackDistanceGuide(rack)+m2ColumnDistanceGuide(rack)+m2PerfMovingSeismicSvg(rack.id);`;
const v43GuideLine = `        const overlay=m2PerfEnsureDragOverlay(layer,rack.id),guideHtml=m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2RackDistanceGuide(rack)+m2ColumnDistanceGuide(rack)+m2PerfMovingSeismicSvg(rack.id);`;
const stablePreV43 = `        const overlay=m2PerfEnsureDragOverlay(layer),guideHtml=rack.freePlacement?"":m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2PerfLiveRackDistanceGuide(rack)+m2ColumnDistanceGuide(rack)+m2PerfMovingSeismicSvg(rack.id);`;
const stableV43 = `        const overlay=m2PerfEnsureDragOverlay(layer,rack.id),guideHtml=rack.freePlacement?"":m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2PerfLiveRackDistanceGuide(rack)+m2ColumnDistanceGuide(rack)+m2PerfMovingSeismicSvg(rack.id);`;
if(html.includes(v43GuideLine))html=html.replace(v43GuideLine,stableV43);
else if(html.includes(preV43GuideLine))html=html.replace(preV43GuideLine,stablePreV43);
else throw new Error("v36: canli raf-arasi guide hesabi bulunamadi.");

// Raf eklendikten hemen sonra calisan rapor yenilemesi drag baslamissa beklesin.
const oldReportRefresh = `setTimeout(()=>{if(typeof m2RefreshActiveReport==="function")m2RefreshActiveReport();},120);`;
const newReportRefresh = `setTimeout(function m2RefreshReportAfterStableAdd(){if(m2LayoutState?.drag){setTimeout(m2RefreshReportAfterStableAdd,180);return;}if(typeof m2RefreshActiveReport==="function")m2RefreshActiveReport();},180);`;
if (html.includes(oldReportRefresh)) html = html.replace(oldReportRefresh, newReportRefresh);
else if (!html.includes("m2RefreshReportAfterStableAdd")) throw new Error("v36: raf ekleme rapor yenileme ankraji bulunamadi.");

for (const required of [marker,"m2PerfLiveRackDistanceGuide(rack)",".m2-distance-guide[data-rack-gap]","data-rack-gap-other","m2RefreshReportAfterStableAdd"])if(!html.includes(required))throw new Error(`v36: dogrulama eksik: ${required}`);

fs.writeFileSync(portalPath, html);
console.log("v36: Serbest Cizim Mekik drag stabil; canli RAF ARASI tek hafif kenar-kenar hesabiyla guncelleniyor, statik eski guide'lar drag boyunca gizleniyor.");
