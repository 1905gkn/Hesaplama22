import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = 'const m2PerfGroupDragVersion="v68";';
if (html.includes(marker)) {
  console.log("v68: Birlesik blok DOM tasima yolu zaten mevcut.");
  process.exit(0);
}

function replaceRequired(from, to, label) {
  if (!html.includes(from)) throw new Error(`v68: ${label} bulunamadi.`);
  html = html.replace(from, to);
}

// Birlesik ve toplu secilmis bloklarda eski hizli yol bilerek false donuyor,
// ardindan her pointer karesinde butun SVG layer.innerHTML ile kuruluyordu.
// Mevcut DOM tablolarini kullanarak yalniz hareket eden raf gruplarini,
// bagli korumalari ve toplam olcu elemanlarini translate et.
const oldRenderer = `      function m2PerfRenderSingleRackDragFrame(){
        const drag=m2LayoutState.drag;if(!drag||Number(m2LayoutState.selected)!==Number(drag.id)||drag.selectionGroup||Number(drag.groupMembers?.length||1)>1)return false;
        const rack=m2LayoutState.racks.find((item)=>Number(item.id)===Number(drag.id)),layer=$("m2LayoutContent");if(!rack||!layer)return false;
        if(!m2PerfBeginRuntimeFrame(rack))return true;
        let entry=m2PerfRackDomTable.get(Number(rack.id));
        if(!entry?.node?.isConnected){const node=layer.querySelector('[data-rack="'+rack.id+'"]');if(!node)return false;entry={node,baseTransform:node.getAttribute("transform")||""};m2PerfRackDomTable.set(Number(rack.id),entry);}
        const dx=Number(rack.x)-Number(drag.originX),dy=Number(rack.y)-Number(drag.originY);
        if(!m2PerfTranslateEntry(entry,dx,dy))return false;
        m2PerfTranslateAttachedSymbols(rack.id,dx,dy);m2PerfTranslateRackAux(rack.id,dx,dy);
        if(!m2PerfPreparedDrags.has(drag)){m2PerfRemoveStaticMovingGuides(layer,rack.id);m2PerfPreparedDrags.add(drag);}
        const overlay=m2PerfEnsureDragOverlay(layer,rack.id),guideHtml=rack.freePlacement?"":m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2PerfLiveRackDistanceGuide(rack)+m2ColumnDistanceGuide(rack)+m2PerfMovingSeismicSvg(rack.id);
        overlay.innerHTML=guideHtml;
        overlay.querySelectorAll("[data-dimension-key]").forEach((node)=>{const key=node.dataset.dimensionKey,size=m2DimensionFontSizes[key];if(size)node.style.fontSize=size+"px";node.classList.toggle("m2-dimension-selected",m2LayoutTool==="dimension"&&key===m2SelectedDimensionKey);});
        return true;
      }`;

const newRenderer = `      const m2PerfGroupDragVersion="v68";
      function m2PerfDragMembers(drag,rack){
        const origins=Array.isArray(drag?.groupMembers)&&drag.groupMembers.length?drag.groupMembers:[{id:rack.id,x:drag.originX,y:drag.originY}];
        return origins.map((origin)=>({origin,rack:m2LayoutState.racks.find((item)=>Number(item.id)===Number(origin.id))})).filter((item)=>item.rack);
      }
      function m2PerfEnsureRackDragEntry(layer,rack){
        let entry=m2PerfRackDomTable.get(Number(rack.id));
        if(!entry?.node?.isConnected){const node=layer.querySelector('[data-rack="'+rack.id+'"]');if(!node)return null;entry={node,baseTransform:node.getAttribute("transform")||""};m2PerfRackDomTable.set(Number(rack.id),entry);}
        return entry;
      }
      function m2PerfTranslateDragSymbols(drag,movingIds,dx,dy){
        m2LayoutSymbols.forEach((symbol)=>{
          if(!movingIds.has(Number(symbol.rackId))||!/^(uaks|uakz)$/.test(symbol.type))return;
          m2PerfTranslateEntry(m2PerfSymbolDomTable.get(Number(symbol.id)),dx,dy);
        });
        (drag.symbolMembers||[]).forEach((origin)=>{
          const symbol=m2LayoutSymbols.find((item)=>Number(item.id)===Number(origin.id));if(!symbol)return;
          m2PerfTranslateEntry(m2PerfSymbolDomTable.get(Number(symbol.id)),Number(symbol.x)-Number(origin.x),Number(symbol.y)-Number(origin.y));
        });
      }
      function m2PerfMovingGroupSeismicSvg(movingIds){
        const seen=new Set(),out=[];
        m2LayoutState.racks.forEach((owner)=>(owner.seismicBraces||[]).forEach((brace)=>{const ids=(brace.rackIds||[]).map(Number);if(!ids.some((id)=>movingIds.has(id)))return;const key=String(brace.id||ids.join("|")+":"+brace.type);if(seen.has(key))return;seen.add(key);out.push(m2SeismicBraceSvg(brace));}));
        return out.join("");
      }
      function m2PerfRenderSingleRackDragFrame(){
        const drag=m2LayoutState.drag;if(!drag)return false;
        const rack=m2LayoutState.racks.find((item)=>Number(item.id)===Number(drag.id)),layer=$("m2LayoutContent");if(!rack||!layer)return false;
        if(!m2PerfBeginRuntimeFrame(rack))return true;
        const members=m2PerfDragMembers(drag,rack),movingIds=new Set(members.map((item)=>Number(item.rack.id)));if(!members.length)return false;
        let dx=0,dy=0;
        for(const item of members){
          const entry=m2PerfEnsureRackDragEntry(layer,item.rack);if(!entry)return false;
          const memberDx=Number(item.rack.x)-Number(item.origin.x),memberDy=Number(item.rack.y)-Number(item.origin.y);
          if(!m2PerfTranslateEntry(entry,memberDx,memberDy))return false;
          m2PerfTranslateRackAux(item.rack.id,memberDx,memberDy);
          if(Number(item.rack.id)===Number(rack.id)){dx=memberDx;dy=memberDy;}
        }
        m2PerfTranslateDragSymbols(drag,movingIds,dx,dy);
        if(!m2PerfPreparedDrags.has(drag)){members.forEach((item)=>m2PerfRemoveStaticMovingGuides(layer,item.rack.id));m2PerfPreparedDrags.add(drag);}
        const overlay=m2PerfEnsureDragOverlay(layer,rack.id),showGap=!drag.selectionGroup,guideHtml=rack.freePlacement?"":m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+(showGap?m2PerfLiveRackDistanceGuide(rack):"")+m2ColumnDistanceGuide(rack)+m2PerfMovingGroupSeismicSvg(movingIds);
        overlay.innerHTML=guideHtml;
        overlay.querySelectorAll("[data-dimension-key]").forEach((node)=>{const key=node.dataset.dimensionKey,size=m2DimensionFontSizes[key];if(size)node.style.fontSize=size+"px";node.classList.toggle("m2-dimension-selected",m2LayoutTool==="dimension"&&key===m2SelectedDimensionKey);});
        return true;
      }
      window.rafexFreeGroupDragV68={version:m2PerfGroupDragVersion,render:m2PerfRenderSingleRackDragFrame};`;

replaceRequired(oldRenderer, newRenderer, "birlesik blok hizli render yolu");

// Canli cakisma kuralini koru, ancak 20 adimli binary search'i her karede
// calistirma. 6 adim ekran koordinatinda 0,16 px'den daha hassastir.
replaceRequired(
  `          for (let i = 0; i < 20; i++) {\n            const mid = (low + high) / 2;`,
  `          for (let i = 0; i < 6; i++) {\n            const mid = (low + high) / 2;`,
  "birlesik blok cakisma arama adimi",
);

for (const required of [
  marker,
  "m2PerfDragMembers",
  "m2PerfTranslateDragSymbols",
  "m2PerfMovingGroupSeismicSvg",
  "window.rafexFreeGroupDragV68",
  "for (let i = 0; i < 6; i++)",
]) if (!html.includes(required)) throw new Error("v68 son dogrulama eksik: " + required);

fs.writeFileSync(portalPath, html);
console.log("v68: Birlesik/toplu bloklar tam SVG renderi olmadan DOM tablosu uzerinden tasiniyor; canli cakisma 6 adimda korunuyor.");
