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

// v81: Onceki performans yamasi tum proje undo snapshot'ini pointerdown'a tasimisti.
// Bu nedenle raf sadece secilirken bile tum proje JSON stringify oluyordu.
// Secimde snapshot alma; ilk gercek harekette yalnizca hareket eden raf/grubun koordinatlarini kaydet.
const queueMarker = '      function m2QueueLayoutRender() {';
if (!html.includes('function m2PushRackMoveUndoV81(')) {
  if (!html.includes(queueMarker)) throw new Error("Free performance v81: render queue kalibi bulunamadi.");
  const moveUndoHelpers = String.raw`      function m2PushRackMoveUndoV81(drag){
        if(!drag)return;
        const racks=(drag.groupMembers?.length?drag.groupMembers:[{id:drag.id,x:drag.originX,y:drag.originY}]).map((item)=>({id:item.id,x:item.x,y:item.y}));
        const symbols=(drag.symbolMembers||[]).map((item)=>({id:item.id,x:item.x,y:item.y}));
        m2UndoHistory.push({kind:"rack-move-v81",label:"Raf taşıma",racks,symbols});
        if(m2UndoHistory.length>30)m2UndoHistory.shift();
        m2UpdateUndoButton();
      }
      function m2RestoreRackMoveUndoV81(snapshot){
        (snapshot?.racks||[]).forEach((origin)=>{const rack=m2LayoutState.racks.find((item)=>item.id===origin.id);if(rack){rack.x=origin.x;rack.y=origin.y;}});
        (snapshot?.symbols||[]).forEach((origin)=>{const symbol=m2LayoutSymbols.find((item)=>item.id===origin.id);if(symbol){symbol.x=origin.x;symbol.y=origin.y;}});
      }
`;
  html = html.replace(queueMarker, moveUndoHelpers + queueMarker);
}

if (!html.includes('kind==="rack-move-v81"')) {
  const undoPop = 'const snapshot=m2UndoHistory.pop();if(!snapshot){m2UpdateUndoButton();return;}';
  if (!html.includes(undoPop)) throw new Error("Free performance v81: undo pop kalibi bulunamadi.");
  const undoFast = undoPop + 'if(snapshot?.kind==="rack-move-v81"){m2RestoreRackMoveUndoV81(snapshot);m2ClearAllSelections(`${snapshot.label} geri alındı.`);m2UpdateUndoButton();return;}';
  html = html.replace(undoPop, undoFast);
}

// Gercek build sirasinda patch-free-layout-drag-start-performance.mjs bu blogu
// undoCaptured:true + m2PushUndo("Raf taşıma") seklinde birakir. Onu geri hafiflet.
const symbolAnchor = html.indexOf('const symbolMembers=selectionGroup?');
if (symbolAnchor < 0) throw new Error("Free performance v81: raf secim anchor bulunamadi.");
const dragStart = html.indexOf('m2LayoutState.drag = {', symbolAnchor);
const dragLineEnd = html.indexOf('\n', dragStart);
if (dragStart < 0 || dragLineEnd < 0) throw new Error("Free performance v81: raf drag satiri bulunamadi.");
let dragLine = html.slice(dragStart, dragLineEnd);
if (!/undoCaptured:(true|false)/.test(dragLine)) throw new Error("Free performance v81: undoCaptured alani bulunamadi.");
dragLine = dragLine.replace(/undoCaptured:(true|false)/, 'undoCaptured:false');
html = html.slice(0, dragStart) + dragLine + html.slice(dragLineEnd);

const captureStart = html.indexOf('svg.setPointerCapture?.(event.pointerId);', dragStart);
if (captureStart < 0) throw new Error("Free performance v81: pointer capture bulunamadi.");
const betweenDragAndCapture = html.slice(dragLineEnd, captureStart);
if (betweenDragAndCapture.includes('m2PushUndo("Raf taşıma");')) {
  const cleaned = betweenDragAndCapture.replace(/\s*m2PushUndo\("Raf taşıma"\);\s*/g, '\n            ');
  html = html.slice(0, dragLineEnd) + cleaned + html.slice(captureStart);
}

if (!html.includes('m2PushRackMoveUndoV81(m2LayoutState.drag)')) {
  const moveAnchor = html.indexOf('svg.onpointermove = (event) => {');
  const dragBranch = html.indexOf('} else if (m2LayoutState.drag) {', moveAnchor);
  if (dragBranch < 0) throw new Error("Free performance v81: pointermove drag blogu bulunamadi.");
  const insertAt = html.indexOf('\n', dragBranch) + 1;
  const lightweightCapture = '            if(!m2LayoutState.drag.undoCaptured){m2PushRackMoveUndoV81(m2LayoutState.drag);m2LayoutState.drag.undoCaptured=true;}\n';
  html = html.slice(0, insertAt) + lightweightCapture + html.slice(insertAt);
}

// PDF/rapor cizimini kesin olarak kullanici PDF Olustur'a basana kadar kilitle.
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
  "m2PushRackMoveUndoV81",
  "rack-move-v81",
  "m2PushRackMoveUndoV81(m2LayoutState.drag)",
  "undoCaptured:false"
]) if (!html.includes(required)) throw new Error("Free performance v81 dogrulama eksigi: " + required);

if (html.includes('if(!interactiveRender){m2RenderSelectedRackInfo();m2RenderLayoutProductList();m2ScheduleReportRefresh(650);')) {
  throw new Error("Free performance v79: ana renderda urun/PDF cagrisi kaldi.");
}
const selectedArea = html.slice(symbolAnchor, html.indexOf('svg.onpointermove = (event) => {', symbolAnchor));
if (selectedArea.includes('m2PushUndo("Raf taşıma")')) throw new Error("Free performance v81: secim aninda tam undo snapshot cagrisi kaldi.");

fs.writeFileSync(portalPath, html);
console.log("SOURCE v81: raf secimindeki tam proje undo snapshot kaldirildi; geri al icin sadece tasinan koordinatlar kaydediliyor.");
