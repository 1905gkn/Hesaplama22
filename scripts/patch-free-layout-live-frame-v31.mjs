import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = "function m2ScheduleLiveRackDrag(svg,event)";
if (html.includes(marker)) {
  console.log("v31: Canli Serbest surukleme frame birlestirme zaten mevcut.");
  process.exit(0);
}

function replaceRequired(from, to, label) {
  if (!html.includes(from)) throw new Error(`v31: ${label} bulunamadi.`);
  html = html.replace(from, to);
}

// Browser bir saniyede yuzlerce pointermove olayi uretebilir. En son koordinati
// saklayip mevcut (duvar + raf + kolon) cakisma kurallarini ekran karesinde bir kez
// calistir. Bu, v26'daki "yalniz birakinca kontrol" davranisini geri getirmez:
// konum, cakisma ve mesafeler surukleme boyunca canli kalir.
const svgPointBlock = `      function m2SvgPoint(event) {
        const svg = $("m2LayoutSvg"), activeDrag=Boolean(m2LayoutState.drag); let rect=null;
        if(activeDrag&&m2PerfSvgRectTable.svg===svg)rect=m2PerfSvgRectTable.rect;
        if(!rect){rect=svg.getBoundingClientRect();if(activeDrag){m2PerfSvgRectTable.svg=svg;m2PerfSvgRectTable.rect=rect;}else m2PerfInvalidateSvgRect();}
        return { x: (event.clientX - rect.left) * 1000 / rect.width, y: (event.clientY - rect.top) * 650 / rect.height };
      }`;

const liveFrameHelpers = `${svgPointBlock}
      function m2PaintLiveRackDragFrame(){
        if(typeof m2PerfRenderSingleRackDragFrame==="function"&&m2PerfRenderSingleRackDragFrame())return;
        m2RenderLayout();
      }
      function m2ApplyLiveRackDrag(svg,drag,clientX,clientY){
        if(!drag||m2LayoutState.drag!==drag||!Number.isFinite(clientX)||!Number.isFinite(clientY))return;
        const point=m2SvgPoint({clientX,clientY}),rack=m2LayoutState.racks.find((item)=>item.id===drag.id);if(!rack)return;
        const nextX=point.x-drag.dx,nextY=point.y-drag.dy;
        if(drag.selectionGroup){
          const targetDx=nextX-drag.originX,targetDy=nextY-drag.originY,adjusted=m2SmoothGroupTranslation(drag.groupMembers,targetDx,targetDy);m2ApplyGroupTranslation(drag.groupMembers,adjusted.dx,adjusted.dy);
          (drag.symbolMembers||[]).forEach((origin)=>{const symbol=m2LayoutSymbols.find((item)=>item.id===origin.id);if(symbol){symbol.x=origin.x+adjusted.dx;symbol.y=origin.y+adjusted.dy;}});
          $("m2FloorStatus").textContent=adjusted.exact?"Seçili raflar ve bağlı parçalar birlikte taşınıyor; duvar uzaklıkları gösteriliyor.":"Seçili grup duvar veya raf sınırında kaydırılıyor.";m2PaintLiveRackDragFrame();return;
        }
        if(drag.groupMembers?.length>1){
          const targetDx=nextX-drag.originX,targetDy=nextY-drag.originY,freeGroup=drag.groupMembers.some((origin)=>m2LayoutState.racks.find((item)=>item.id===origin.id)?.freePlacement),adjusted=freeGroup?m2ClampGroupTranslationToCanvas(drag.groupMembers,targetDx,targetDy):m2SmoothGroupTranslation(drag.groupMembers,targetDx,targetDy);
          m2ApplyGroupTranslation(drag.groupMembers,adjusted.dx,adjusted.dy);
          $("m2FloorStatus").textContent=freeGroup?"Birleşik raf tek yapı olarak serbestçe taşınıyor.":adjusted.exact?"Birleşik modüller ortak ayakları korunarak birlikte taşınıyor.":"Birleşik grup köşe ve duvar boyunca takılmadan kaydırılıyor.";m2PaintLiveRackDragFrame();return;
        }
        if(rack.freePlacement){
          rack.x=Math.max(0,Math.min(1000-rack.w,nextX));rack.y=Math.max(0,Math.min(650-rack.h,nextY));
          $("m2FloorStatus").textContent="İlk bırakmaya kadar duvarlardan bağımsız taşıyabilirsin.";m2PaintLiveRackDragFrame();return;
        }
        const adjusted=m2SmoothDragPosition(rack,nextX,nextY);
        if(adjusted){rack.x=adjusted.x;rack.y=adjusted.y;if(m2RackInsideArea(rack))rack.staged=false;}
        $("m2FloorStatus").textContent=adjusted?.exact?"En yakın raf mesafesi çizimde gösteriliyor.":m2RackOverlaps(rack,nextX,nextY,rack.angle)?"Raflar üst üste getirilemez; kenar boyunca akıcı kaydırılıyor.":"Alan sınırında köşe boyunca akıcı kaydırılıyor.";
        m2PaintLiveRackDragFrame();
      }
      function m2ScheduleLiveRackDrag(svg,event){
        const drag=m2LayoutState.drag;if(!drag)return;drag.liveClientX=event.clientX;drag.liveClientY=event.clientY;
        if(drag.liveFrame!=null)return;
        drag.liveFrame=requestAnimationFrame(()=>{const active=m2LayoutState.drag;if(!active)return;active.liveFrame=null;m2ApplyLiveRackDrag(svg,active,active.liveClientX,active.liveClientY);});
      }
      function m2FlushLiveRackDrag(svg,event){
        const drag=m2LayoutState.drag;if(!drag)return;
        if(drag.liveFrame!=null){cancelAnimationFrame(drag.liveFrame);drag.liveFrame=null;}
        const clientX=Number.isFinite(event?.clientX)?event.clientX:drag.liveClientX,clientY=Number.isFinite(event?.clientY)?event.clientY:drag.liveClientY;
        m2ApplyLiveRackDrag(svg,drag,clientX,clientY);
      }`;
replaceRequired(svgPointBlock, liveFrameHelpers, "SVG koordinat ve frame yardimcilari");

replaceRequired(
  `        svg.onpointermove = (event) => {
          const point = m2SvgPoint(event);`,
  `        svg.onpointermove = (event) => {
          if(m2LayoutState.drag){m2ScheduleLiveRackDrag(svg,event);return;}
          const point = m2SvgPoint(event);`,
  "pointermove frame birlestirme girisi"
);

replaceRequired(
  `        const stop = () => {
          if(m2SeismicDraft?.start){m2CommitSeismicArea();return;}`,
  `        const stop = (event) => {
          if(m2LayoutState.drag)m2FlushLiveRackDrag(svg,event);
          if(m2SeismicDraft?.start){m2CommitSeismicArea();return;}`,
  "pointerup son koordinat uygulamasi"
);

// Duvar/kolon/aksesuar topolojisi bir raf suruklenirken degismez. Imzalarin her
// karede yeniden taranmasini onle; yeni drag nesnesinde ilk karede yeniden kurulur.
replaceRequired(
  `      function m2PerfBlockingSymbols(){
        const table=m2LayoutRuntimeCache.accessories,signature=m2PerfAccessorySignature();
        if(table.signature!==signature){
          const all=(m2LayoutSymbols||[]).filter((s)=>s.blocking||/^(uaks|uakz|barrier)$/.test(String(s.type||""))),blocking=all.filter((s)=>s.blocking),bounds=new Map();all.forEach((s)=>bounds.set(Number(s.id),m2SymbolBounds(s)));
          table.signature=signature;table.version++;table.blocking=blocking;table.bounds=bounds;
        }
        return table.blocking;
      }`,
  `      function m2PerfBlockingSymbols(){
        const table=m2LayoutRuntimeCache.accessories,drag=m2LayoutState.drag;
        if(drag?.perfBlockingReady)return table.blocking;
        const signature=m2PerfAccessorySignature();
        if(table.signature!==signature){
          const all=(m2LayoutSymbols||[]).filter((s)=>s.blocking||/^(uaks|uakz|barrier)$/.test(String(s.type||""))),blocking=all.filter((s)=>s.blocking),bounds=new Map();all.forEach((s)=>bounds.set(Number(s.id),m2SymbolBounds(s)));
          table.signature=signature;table.version++;table.blocking=blocking;table.bounds=bounds;
        }
        if(drag)drag.perfBlockingReady=true;
        return table.blocking;
      }`,
  "surukleme engel tablosu"
);

replaceRequired(
  `      function m2PerfTranslateAttachedSymbols(rackId,dx,dy){
        m2LayoutSymbols.forEach((symbol)=>{if(Number(symbol.rackId)!==Number(rackId)||!/^(uaks|uakz)$/.test(symbol.type))return;const entry=m2PerfSymbolDomTable.get(Number(symbol.id));m2PerfTranslateEntry(entry,dx,dy);});
      }`,
  `      function m2PerfTranslateAttachedSymbols(rackId,dx,dy){
        const drag=m2LayoutState.drag;
        if(!drag?.perfAttachedEntries){
          const entries=m2LayoutSymbols.filter((symbol)=>Number(symbol.rackId)===Number(rackId)&&/^(uaks|uakz)$/.test(symbol.type)).map((symbol)=>m2PerfSymbolDomTable.get(Number(symbol.id))).filter(Boolean);
          if(drag)drag.perfAttachedEntries=entries;else entries.forEach((entry)=>m2PerfTranslateEntry(entry,dx,dy));
        }
        (drag?.perfAttachedEntries||[]).forEach((entry)=>m2PerfTranslateEntry(entry,dx,dy));
      }`,
  "raf bagli koruma DOM tablosu"
);

replaceRequired(
  `        m2LayoutRuntimeCache.dirtyObjects.clear();m2PerfMarkDirty("rack",rack.id,key);
        m2PerfWallGeometryTable();m2PerfColumnObjects();m2PerfBlockingSymbols();
        return true;`,
  `        m2LayoutRuntimeCache.dirtyObjects.clear();m2PerfMarkDirty("rack",rack.id,key);
        const drag=m2LayoutState.drag;
        if(!drag?.perfTopologyReady){m2PerfWallGeometryTable();m2PerfColumnObjects();m2PerfBlockingSymbols();if(drag)drag.perfTopologyReady=true;}
        return true;`,
  "surukleme topoloji tablosu"
);

// Raf ve ona bagli olcu/SVG katmani ayni animasyon karesinde guncellenir.
// Boylece blok olculerin onune gecmez; pointerup'taki normal render da son
// degeri eksiksiz kurar.
replaceRequired(
  `        if(!m2PerfTranslateEntry(entry,dx,dy))return false;
        m2PerfTranslateAttachedSymbols(rack.id,dx,dy);m2PerfTranslateRackAux(rack.id,dx,dy);
        if(!m2PerfPreparedDrags.has(drag)){m2PerfRemoveStaticMovingGuides(layer,rack.id);m2PerfPreparedDrags.add(drag);}
        const overlay=m2PerfEnsureDragOverlay(layer),guideHtml=m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2RackDistanceGuide(rack)+m2ColumnDistanceGuide(rack)+m2PerfMovingSeismicSvg(rack.id);`,
  `        if(!m2PerfTranslateEntry(entry,dx,dy))return false;
        m2PerfTranslateAttachedSymbols(rack.id,dx,dy);m2PerfTranslateRackAux(rack.id,dx,dy);
        if(!m2PerfPreparedDrags.has(drag)){m2PerfRemoveStaticMovingGuides(layer,rack.id);m2PerfPreparedDrags.add(drag);}
        const overlay=m2PerfEnsureDragOverlay(layer),guideHtml=m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2RackDistanceGuide(rack)+m2ColumnDistanceGuide(rack)+m2PerfMovingSeismicSvg(rack.id);`,
  "canli olcu SVG kare senkronu"
);

if(!html.includes(marker)||!html.includes("if(m2LayoutState.drag)m2FlushLiveRackDrag(svg,event)")||!html.includes("drag?.perfBlockingReady")||!html.includes("drag?.perfAttachedEntries")||html.includes("now-drag.perfLastGuideAt<64"))throw new Error("v31: son dogrulama basarisiz.");
fs.writeFileSync(portalPath,html);
console.log("v31: pointermove tek rAF; raf, canli cakisma ve olcu SVG katmani ayni karede senkron guncelleniyor.");
