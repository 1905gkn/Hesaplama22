import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

// v79: Serbest cizim ana render dongusu yalnizca cizim yapar.
// Urun/blok sayimi ve PDF/rapor isi bu donguden tamamen ayrilir.
const renderPatterns = [
  'if(!interactiveRender){m2RenderSelectedRackInfo();m2RenderLayoutProductList();m2ScheduleReportRefresh(650);}',
  'if(!interactiveRender){m2RenderSelectedRackInfo();m2RenderLayoutProductList();const placingRack=m2LayoutState.racks.some((rack)=>rack?.staged||rack?.freePlacement);if(!placingRack)m2ScheduleReportRefresh(650);}'
];
let renderDetached = false;
for (const pattern of renderPatterns) {
  if (!html.includes(pattern)) continue;
  html = html.replace(pattern, 'if(!interactiveRender)m2RenderSelectedRackInfo();');
  renderDetached = true;
}
if (!renderDetached && !html.includes('if(!interactiveRender)m2RenderSelectedRackInfo();')) {
  throw new Error("Free performance v79: ana render sayim/PDF kalibi bulunamadi.");
}

html = html.replace(/\s*setTimeout\(\(\)=>\{if\(typeof m2RefreshActiveReport==="function"\)m2RefreshActiveReport\(\);\},120\);/g, "");
html = html.replace(/\s*setTimeout\(function m2RefreshReportAfterStableAdd\(\)\{if\(m2LayoutState\?\.drag\)\{setTimeout\(m2RefreshReportAfterStableAdd,180\);return;\}if\(typeof m2RefreshActiveReport==="function"\)m2RefreshActiveReport\(\);\},180\);/g, "");

const summaryStart = '        const layoutTotalPallets = m2LayoutState.racks.reduce(';
const summaryEnd = '        if (!rack && !drawing) {';
const summaryIndex = html.indexOf(summaryStart);
if (summaryIndex >= 0) {
  const summaryEndIndex = html.indexOf(summaryEnd, summaryIndex);
  if (summaryEndIndex < 0) throw new Error("Free performance v79: secili raf ozet blogu sonu bulunamadi.");
  const oldSummary = html.slice(summaryIndex, summaryEndIndex);
  if (!oldSummary.includes("layoutB2BFootCount")) throw new Error("Free performance v79: ayak ozet sayimi bulunamadi.");
  const cachedSummary = '        const layoutSummaryV79 = window.rafexLayoutSummaryV79 || { totalPallets:0, footTeams:0 };\n        const layoutTotalPallets = Number(layoutSummaryV79.totalPallets || 0);\n        const layoutB2BFootCount = Number(layoutSummaryV79.footTeams || 0);\n';
  html = html.slice(0, summaryIndex) + cachedSummary + html.slice(summaryEndIndex);
} else if (!html.includes("const layoutSummaryV79 = window.rafexLayoutSummaryV79")) {
  throw new Error("Free performance v79: secili raf toplam sayim kalibi bulunamadi.");
}

// v80: Sadece secim yapmak tam SVG renderi yapmaz.
const queueMarker = '      function m2QueueLayoutRender() {';
if (!html.includes('function m2FastSelectRackV80(')) {
  if (!html.includes(queueMarker)) throw new Error("Free performance v80: render queue kalibi bulunamadi.");
  const fastSelection = String.raw`      let m2SelectionGuideTokenV80=0;
      function m2FastSelectRackV80(id){
        const layer=$("m2LayoutContent"),rack=m2LayoutState.racks.find((item)=>item.id===id);
        if(!layer||!rack)return;
        layer.querySelectorAll("[data-rack]").forEach((host)=>{
          const rect=host.querySelector(".m2-layout-rack");if(!rect)return;
          const selected=Number(host.dataset.rack)===id,color=host.dataset.typeColor||m2TypeColor(rack.typeName||"RAF");
          rect.classList.toggle("selected",selected);
          rect.style.fill=selected?color+"24":"transparent";
          rect.style.stroke=selected?color:"transparent";
        });
        const separateButton=$("m2SeparateRackButton");if(separateButton)separateButton.disabled=!rack?.joinGroup;
        if(typeof m2RenderSelectedRackInfo==="function")m2RenderSelectedRackInfo();
      }
      function m2RefreshSelectionGuidesV80(id){
        if(m2LayoutState.drag||m2LayoutState.selected!==id)return;
        const layer=$("m2LayoutContent"),selectedRack=m2LayoutState.racks.find((item)=>item.id===id);if(!layer||!selectedRack)return;
        layer.querySelectorAll(".m2-wall-guide,.m2-distance-guide,.m2-fast-selection-guides-v80").forEach((node)=>node.remove());
        let guides=m2WallDistanceGuides(selectedRack,{left:true,right:true,top:true,bottom:true,gap:true})+m2RackDistanceGuide(selectedRack)+m2ColumnDistanceGuide(selectedRack);
        m2LayoutState.racks.forEach((rack)=>{if(rack.id===id)return;const pinned=m2PinnedForRack(rack.id);if(!Object.values(pinned).some(Boolean))return;guides+=m2WallDistanceGuides(rack,pinned)+(pinned.gap?m2RackDistanceGuide(rack)+m2ColumnDistanceGuide(rack):"");});
        if(guides)layer.insertAdjacentHTML("beforeend",'<g class="m2-fast-selection-guides-v80">'+guides+'</g>');
      }
      function m2ScheduleSelectionGuidesV80(id){
        const token=++m2SelectionGuideTokenV80,run=()=>{if(token!==m2SelectionGuideTokenV80)return;m2RefreshSelectionGuidesV80(id);};
        if(typeof requestIdleCallback==="function")requestIdleCallback(run,{timeout:180});else setTimeout(run,0);
      }
      function m2CancelSelectionGuidesV80(){m2SelectionGuideTokenV80++;}
`;
  html = html.replace(queueMarker, fastSelection + queueMarker);
}

if (!html.includes('selectionOnly:!rack.freePlacement')) {
  const symbolAnchor = html.indexOf('const symbolMembers=selectionGroup?');
  if (symbolAnchor < 0) throw new Error("Free performance v80: raf secim anchor bulunamadi.");
  const dragStart = html.indexOf('m2LayoutState.drag = {', symbolAnchor);
  const dragLineEnd = html.indexOf('\n', dragStart);
  if (dragStart < 0 || dragLineEnd < 0) throw new Error("Free performance v80: raf drag satiri bulunamadi.");
  let dragLine = html.slice(dragStart, dragLineEnd);
  if (!dragLine.includes('undoCaptured:false')) throw new Error("Free performance v80: raf drag undo alani bulunamadi.");
  dragLine = dragLine.replace('undoCaptured:false', 'undoCaptured:false,selectionOnly:!rack.freePlacement');
  html = html.slice(0, dragStart) + dragLine + html.slice(dragLineEnd);

  const captureStart = html.indexOf('svg.setPointerCapture?.(event.pointerId);', dragStart);
  const captureLineEnd = html.indexOf('\n', captureStart);
  if (captureStart < 0 || captureLineEnd < 0) throw new Error("Free performance v80: raf pointer capture satiri bulunamadi.");
  const captureLine = html.slice(captureStart, captureLineEnd);
  if (!captureLine.includes('m2RenderLayout()') && !captureLine.includes('m2QueueLayoutRender()')) throw new Error("Free performance v80: raf secim render cagrisi bulunamadi.");
  html = html.slice(0, captureStart) + 'svg.setPointerCapture?.(event.pointerId); m2CancelSelectionGuidesV80(); m2FastSelectRackV80(id);' + html.slice(captureLineEnd);
}

if (!html.includes('m2LayoutState.drag.selectionOnly=false')) {
  const moveAnchor = html.indexOf('svg.onpointermove = (event) => {');
  const dragBranch = html.indexOf('} else if (m2LayoutState.drag) {', moveAnchor);
  if (dragBranch < 0) throw new Error("Free performance v80: pointermove drag blogu bulunamadi.");
  const insertAt = html.indexOf('\n', dragBranch) + 1;
  html = html.slice(0, insertAt) + '            m2CancelSelectionGuidesV80();m2LayoutState.drag.selectionOnly=false;\n' + html.slice(insertAt);
}

if (!html.includes('m2LayoutState.drag?.selectionOnly')) {
  const stopAnchor = html.indexOf('const stop = () => {');
  const stopDrag = html.indexOf('          if (m2LayoutState.drag) {', stopAnchor);
  if (stopAnchor < 0 || stopDrag < 0) throw new Error("Free performance v80: pointerup drag blogu bulunamadi.");
  const fastStop = '          if(m2LayoutState.drag?.selectionOnly){const selectedId=m2LayoutState.selected;m2LayoutState.drag=null;m2DimensionDrag=null;m2FastSelectRackV80(selectedId);m2ScheduleSelectionGuidesV80(selectedId);return;}\n';
  html = html.slice(0, stopDrag) + fastStop + html.slice(stopDrag);
}

const bootMarker = '      changeProgramLanguage(appLanguage, false);\n      boot();';
if (!html.includes(bootMarker) && !html.includes("rafexInstallPdfLazyV79")) {
  throw new Error("PDF lazy v79: boot kalibi bulunamadi.");
}

if (!html.includes("rafexInstallPdfLazyV79")) {
  const lazyInstall = String.raw`      function rafexInstallPdfLazyV79(){
        if(window.__rafexPdfLazyV79)return;
        window.__rafexPdfLazyV79=true;
        let depth=0;
        const publish=()=>{window.rafexPdfLazyStateV79={locked:depth===0,depth,dirty:!!window.__rafexPdfDirtyV79};};
        const setGlobal=(name,fn)=>{window[name]=fn;try{(0,eval)(name+'=window["'+name+'"]')}catch(_){}};
        const guard=(name,fallback=null)=>{
          const original=window[name];
          if(typeof original!=="function"||original.__rafexPdfLazyGuardV79)return;
          const wrapped=function(){
            if(depth<=0){window.__rafexPdfDirtyV79=true;publish();return typeof fallback==="function"?fallback():fallback;}
            return original.apply(this,arguments);
          };
          wrapped.__rafexPdfLazyGuardV79=true;
          wrapped.__rafexOriginal=original;
          setGlobal(name,wrapped);
        };
        ["m2RenderA4Report","m2RenderCorporateReport","m2RefreshActiveReport","m2ScheduleReportRefresh","m2RenderReportImages","m2RenderPalletSpec"].forEach((name)=>guard(name,null));
        guard("m2BuildCorporatePages","");
        const wrapPrint=(name)=>{
          const original=window[name];
          if(typeof original!=="function"||original.__rafexPdfLazyPrintV79)return;
          const wrapped=function(){
            const outer=depth===0;
            depth++;
            if(outer){
              window.__rafexPdfDirtyV79=false;
              try{if(typeof window.rafexRefreshProductCountsV79==="function")window.rafexRefreshProductCountsV79(true);else if(typeof window.rafexRefreshProductCountsV77==="function")window.rafexRefreshProductCountsV77();}catch(_){}
            }
            publish();
            let result;
            try{result=original.apply(this,arguments)}catch(error){depth=Math.max(0,depth-1);publish();throw error}
            if(result&&typeof result.finally==="function")return result.finally(()=>{depth=Math.max(0,depth-1);publish()});
            depth=Math.max(0,depth-1);publish();return result;
          };
          wrapped.__rafexPdfLazyPrintV79=true;
          wrapped.__rafexOriginal=original;
          setGlobal(name,wrapped);
        };
        wrapPrint("m2PrintCorporateReport");
        wrapPrint("m2PrintA4Report");
        window.rafexRunPdfWorkV79=function(callback){depth++;publish();try{return callback()}finally{depth=Math.max(0,depth-1);publish()}};
        publish();
      }
      rafexInstallPdfLazyV79();
      changeProgramLanguage(appLanguage, false);
      boot();`;
  html = html.replace(bootMarker, lazyInstall);
}

for (const required of [
  "if(!interactiveRender)m2RenderSelectedRackInfo();",
  "layoutSummaryV79",
  "rafexInstallPdfLazyV79",
  "rafexPdfLazyStateV79",
  "__rafexPdfLazyGuardV79",
  "__rafexPdfLazyPrintV79",
  "m2FastSelectRackV80",
  "m2ScheduleSelectionGuidesV80",
  "selectionOnly:!rack.freePlacement",
  "m2LayoutState.drag.selectionOnly=false",
  "m2LayoutState.drag?.selectionOnly"
]) if (!html.includes(required)) throw new Error("Free performance v80 dogrulama eksigi: " + required);

if (html.includes('if(!interactiveRender){m2RenderSelectedRackInfo();m2RenderLayoutProductList();m2ScheduleReportRefresh(650);')) {
  throw new Error("Free performance v79: ana renderda urun/PDF cagrisi kaldi.");
}

fs.writeFileSync(portalPath, html);
console.log("SOURCE v80: raf secimi tam SVG renderinden ayrildi; secim hafif DOM guncellemesi, kilavuzlar idle pointerup sonrasinda.");
