import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const marker = "const m2PerfRackDomTable = new Map();";
if (html.includes(marker)) {
  console.log("v28: Serbest yerlesim DOM tablosu zaten mevcut.");
  process.exit(0);
}

const oldSvgPoint = `      function m2SvgPoint(event) {
        const svg = $("m2LayoutSvg"), rect = svg.getBoundingClientRect();
        return { x: (event.clientX - rect.left) * 1000 / rect.width, y: (event.clientY - rect.top) * 650 / rect.height };
      }`;

const newSvgPoint = `      const m2PerfSvgRectTable={svg:null,rect:null};
      function m2PerfInvalidateSvgRect(){m2PerfSvgRectTable.svg=null;m2PerfSvgRectTable.rect=null;}
      window.addEventListener("resize",m2PerfInvalidateSvgRect,{passive:true});
      window.addEventListener("scroll",m2PerfInvalidateSvgRect,{passive:true,capture:true});
      function m2SvgPoint(event) {
        const svg = $("m2LayoutSvg"), activeDrag=Boolean(m2LayoutState.drag); let rect=null;
        if(activeDrag&&m2PerfSvgRectTable.svg===svg)rect=m2PerfSvgRectTable.rect;
        if(!rect){rect=svg.getBoundingClientRect();if(activeDrag){m2PerfSvgRectTable.svg=svg;m2PerfSvgRectTable.rect=rect;}else m2PerfInvalidateSvgRect();}
        return { x: (event.clientX - rect.left) * 1000 / rect.width, y: (event.clientY - rect.top) * 650 / rect.height };
      }`;

if (!html.includes(oldSvgPoint)) throw new Error("v28: m2SvgPoint kaynagi bulunamadi.");
html = html.replace(oldSvgPoint, newSvgPoint);

const oldQueue = `      function m2QueueLayoutRender() {
        if (m2LayoutRenderFrame != null) return;
        m2LayoutRenderFrame = requestAnimationFrame(() => { m2LayoutRenderFrame = null; m2RenderLayout(); });
      }`;

const helpersAndQueue = `      const m2PerfRackDomTable = new Map();
      const m2PerfSymbolDomTable = new Map();
      const m2PerfRackAuxDomTable = new Map();
      const m2PerfPreparedDrags = new WeakSet();
      let m2PerfDragOverlay = null;
      function m2PerfAddAuxNode(rackId,node){
        if(!Number.isFinite(rackId)||!node)return;
        let list=m2PerfRackAuxDomTable.get(rackId);if(!list){list=[];m2PerfRackAuxDomTable.set(rackId,list);}
        list.push({node,baseTransform:node.getAttribute("transform")||""});
      }
      function m2PerfRefreshLayoutDomTable(layer){
        m2PerfRackDomTable.clear();m2PerfSymbolDomTable.clear();m2PerfRackAuxDomTable.clear();m2PerfDragOverlay=null;
        layer.querySelectorAll("[data-rack]").forEach((node)=>{const id=Number(node.dataset.rack);if(Number.isFinite(id))m2PerfRackDomTable.set(id,{node,baseTransform:node.getAttribute("transform")||""});});
        layer.querySelectorAll("[data-layout-symbol]").forEach((node)=>{const id=Number(node.dataset.layoutSymbol);if(Number.isFinite(id))m2PerfSymbolDomTable.set(id,{node,baseTransform:node.getAttribute("transform")||""});});
        layer.querySelectorAll("[data-dimension-key]").forEach((node)=>{const key=String(node.dataset.dimensionKey||"");const match=key.match(/^total-(?:length|depth)-(?:top|bottom|left|right):(\\d+)$/);if(match)m2PerfAddAuxNode(Number(match[1]),node);});
        if(window.rafexFreeLayoutPerfTables){window.rafexFreeLayoutPerfTables.rackDom=m2PerfRackDomTable;window.rafexFreeLayoutPerfTables.symbolDom=m2PerfSymbolDomTable;window.rafexFreeLayoutPerfTables.rackAuxDom=m2PerfRackAuxDomTable;}
      }
      function m2PerfEnsureDragOverlay(layer){
        if(m2PerfDragOverlay?.isConnected&&m2PerfDragOverlay.parentNode===layer)return m2PerfDragOverlay;
        const overlay=document.createElementNS("http://www.w3.org/2000/svg","g");overlay.setAttribute("data-rafex-drag-overlay","v28");layer.appendChild(overlay);m2PerfDragOverlay=overlay;return overlay;
      }
      function m2PerfRemoveStaticMovingGuides(layer,rackId){
        layer.querySelectorAll('.m2-wall-guide[data-wall-rack="'+rackId+'"]').forEach((node)=>node.remove());
        ["gap:"+rackId,"column-gap:"+rackId].forEach((key)=>{layer.querySelectorAll('[data-dimension-key="'+key+'"]').forEach((node)=>node.closest(".m2-distance-guide")?.remove());});
        layer.querySelectorAll(".m2-b2b-seismic-brace[data-seismic-racks]").forEach((node)=>{const ids=String(node.dataset.seismicRacks||"").split(",").map(Number);if(ids.includes(Number(rackId)))node.remove();});
      }
      function m2PerfTranslateEntry(entry,dx,dy){if(!entry?.node?.isConnected)return false;entry.node.setAttribute("transform","translate("+dx+" "+dy+") "+entry.baseTransform);return true;}
      function m2PerfTranslateAttachedSymbols(rackId,dx,dy){
        m2LayoutSymbols.forEach((symbol)=>{if(Number(symbol.rackId)!==Number(rackId)||!/^(uaks|uakz)$/.test(symbol.type))return;const entry=m2PerfSymbolDomTable.get(Number(symbol.id));m2PerfTranslateEntry(entry,dx,dy);});
      }
      function m2PerfTranslateRackAux(rackId,dx,dy){(m2PerfRackAuxDomTable.get(Number(rackId))||[]).forEach((entry)=>m2PerfTranslateEntry(entry,dx,dy));}
      function m2PerfMovingSeismicSvg(rackId){
        const seen=new Set(),out=[];
        m2LayoutState.racks.forEach((owner)=>(owner.seismicBraces||[]).forEach((brace)=>{const ids=(brace.rackIds||[]).map(Number);if(!ids.includes(Number(rackId)))return;const key=String(brace.id||ids.join("|")+":"+brace.type);if(seen.has(key))return;seen.add(key);out.push(m2SeismicBraceSvg(brace));}));
        return out.join("");
      }
      function m2PerfRenderSingleRackDragFrame(){
        const drag=m2LayoutState.drag;if(!drag||drag.selectionGroup||Number(drag.groupMembers?.length||1)>1)return false;
        const rack=m2LayoutState.racks.find((item)=>Number(item.id)===Number(drag.id)),layer=$("m2LayoutContent");if(!rack||!layer)return false;
        let entry=m2PerfRackDomTable.get(Number(rack.id));
        if(!entry?.node?.isConnected){const node=layer.querySelector('[data-rack="'+rack.id+'"]');if(!node)return false;entry={node,baseTransform:node.getAttribute("transform")||""};m2PerfRackDomTable.set(Number(rack.id),entry);}
        const dx=Number(rack.x)-Number(drag.originX),dy=Number(rack.y)-Number(drag.originY);
        if(!m2PerfTranslateEntry(entry,dx,dy))return false;
        m2PerfTranslateAttachedSymbols(rack.id,dx,dy);m2PerfTranslateRackAux(rack.id,dx,dy);
        if(!m2PerfPreparedDrags.has(drag)){m2PerfRemoveStaticMovingGuides(layer,rack.id);m2PerfPreparedDrags.add(drag);}
        const overlay=m2PerfEnsureDragOverlay(layer),guideHtml=m2WallDistanceGuides(rack,{left:true,right:true,top:true,bottom:true,gap:true})+m2RackDistanceGuide(rack)+m2ColumnDistanceGuide(rack)+m2PerfMovingSeismicSvg(rack.id);
        overlay.innerHTML=guideHtml;
        overlay.querySelectorAll("[data-dimension-key]").forEach((node)=>{const key=node.dataset.dimensionKey,size=m2DimensionFontSizes[key];if(size)node.style.fontSize=size+"px";node.classList.toggle("m2-dimension-selected",m2LayoutTool==="dimension"&&key===m2SelectedDimensionKey);});
        return true;
      }
      function m2QueueLayoutRender() {
        if (m2LayoutRenderFrame != null) return;
        m2LayoutRenderFrame = requestAnimationFrame(() => { m2LayoutRenderFrame = null; if(m2PerfRenderSingleRackDragFrame())return; m2RenderLayout(); });
      }`;

if (!html.includes(oldQueue)) throw new Error("v28: m2QueueLayoutRender kaynagi bulunamadi.");
html = html.replace(oldQueue, helpersAndQueue);

const oldLayerWrite = "        layer.innerHTML = html;";
const newLayerWrite = "        layer.innerHTML = html; m2PerfRefreshLayoutDomTable(layer);";
if (!html.includes(oldLayerWrite)) throw new Error("v28: layer.innerHTML kaynagi bulunamadi.");
html = html.replace(oldLayerWrite, newLayerWrite);

if(!html.includes(marker)||!html.includes("m2PerfRenderSingleRackDragFrame()")||!html.includes("data-rafex-drag-overlay"))throw new Error("v28: DOM tablo dogrulamasi basarisiz.");
fs.writeFileSync(portalPath, html);
console.log("v28: Serbest yerlesim tek-raf surukleme DOM tablosu aktif: tam SVG yeniden kurma yerine sadece hareket eden raf + canli mesafe/cakisma katmani guncelleniyor.");
await import("./patch-free-layout-runtime-tables-v29.mjs");
