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

// Raf eklenince rapor onizlemesini otomatik olusturan eski zamanlayicilari kaldir.
html = html.replace(/\s*setTimeout\(\(\)=>\{if\(typeof m2RefreshActiveReport==="function"\)m2RefreshActiveReport\(\);\},120\);/g, "");
html = html.replace(/\s*setTimeout\(function m2RefreshReportAfterStableAdd\(\)\{if\(m2LayoutState\?\.drag\)\{setTimeout\(m2RefreshReportAfterStableAdd,180\);return;\}if\(typeof m2RefreshActiveReport==="function"\)m2RefreshActiveReport\(\);\},180\);/g, "");

// Secili raf bilgi panelindeki tum raflari her renderda iki kez sayan reduce'lari da
// olay-temelli ozet cache'ine bagla. Cache post-build v79 scripti tarafindan guncellenir.
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

// PDF/rapor cizimini kesin olarak kullanici PDF Olustur'a basana kadar kilitle.
// Boot ve diger UI aksiyonlarindaki tum rapor cagirilari sadece 'dirty' isareti birakir.
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
  "__rafexPdfLazyPrintV79"
]) if (!html.includes(required)) throw new Error("Free performance v79 dogrulama eksigi: " + required);

if (html.includes('if(!interactiveRender){m2RenderSelectedRackInfo();m2RenderLayoutProductList();m2ScheduleReportRefresh(650);')) {
  throw new Error("Free performance v79: ana renderda urun/PDF cagrisi kaldi.");
}

fs.writeFileSync(portalPath, html);
console.log("SOURCE v79: hareket renderindan urun/blok sayimi ve PDF tamamen ayrildi; secili raf toplam sayimlari cache'e baglandi.");
