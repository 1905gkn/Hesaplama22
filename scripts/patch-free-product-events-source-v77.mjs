import fs from "node:fs";
import path from "node:path";

const portalPath = path.join(process.cwd(), "portal.html");
let html = fs.readFileSync(portalPath, "utf8");

const renderPattern = 'if(!interactiveRender){m2RenderSelectedRackInfo();m2RenderLayoutProductList();const placingRack=m2LayoutState.racks.some((rack)=>rack?.staged||rack?.freePlacement);if(!placingRack)m2ScheduleReportRefresh(650);}';
if (!html.includes(renderPattern)) throw new Error("Free product events v77: genel render sayim/PDF kalibi bulunamadi.");
html = html.replace(renderPattern, 'if(!interactiveRender)m2RenderSelectedRackInfo();');

const addTimerPattern = /\s+setTimeout\(function m2RefreshReportAfterStableAdd\(\)\{if\(m2LayoutState\?\.drag\)\{setTimeout\(m2RefreshReportAfterStableAdd,180\);return;\}if\(typeof m2RefreshActiveReport==="function"\)m2RefreshActiveReport\(\);\},180\);/;
if (!addTimerPattern.test(html)) throw new Error("Free product events v77: raf ekleme PDF zamanlayicisi bulunamadi.");
html = html.replace(addTimerPattern, "");

// Eski raf-ekleme akışında kalan ikinci, kısa PDF yenileme zamanlayıcısını da kaldır.
const shortAddReportPattern = /\s*setTimeout\(\(\)=>\{if\(typeof m2RefreshActiveReport==="function"\)m2RefreshActiveReport\(\);\},120\);/g;
html = html.replace(shortAddReportPattern, "");

// PDF/rapor çizimini kesin olarak kullanıcı PDF Oluştur'a basana kadar kilitle.
// Böylece MR/B2B/Mekik açılışı, seçim, sürükleme, ölçü, görünüş veya form değişikliği
// A4/kurumsal rapor SVG/HTML üretimi yapmaz.
const bootMarker = '      changeProgramLanguage(appLanguage, false);\n      boot();';
if (!html.includes(bootMarker)) throw new Error("PDF lazy v78: boot kalibi bulunamadi.");

const lazyInstall = String.raw`      function rafexInstallPdfLazyV78(){
        if(window.__rafexPdfLazyV78)return;
        window.__rafexPdfLazyV78=true;
        let depth=0;
        const originals={};
        const publish=()=>{window.rafexPdfLazyStateV78={locked:depth===0,depth,dirty:!!window.__rafexPdfDirtyV78};};
        const setGlobal=(name,fn)=>{window[name]=fn;try{(0,eval)(name+'=window["'+name+'"]')}catch(_){}};
        const guard=(name,fallback=null)=>{
          const original=window[name];
          if(typeof original!=="function"||original.__rafexPdfLazyGuardV78)return;
          originals[name]=original;
          const wrapped=function(){
            if(depth<=0){window.__rafexPdfDirtyV78=true;publish();return typeof fallback==="function"?fallback():fallback;}
            return original.apply(this,arguments);
          };
          wrapped.__rafexPdfLazyGuardV78=true;
          wrapped.__rafexOriginal=original;
          setGlobal(name,wrapped);
        };
        ["m2RenderA4Report","m2RenderCorporateReport","m2RefreshActiveReport","m2ScheduleReportRefresh","m2RenderReportImages","m2RenderPalletSpec"].forEach((name)=>guard(name,null));
        guard("m2BuildCorporatePages","");
        const wrapPrint=(name)=>{
          const original=window[name];
          if(typeof original!=="function"||original.__rafexPdfLazyPrintV78)return;
          const wrapped=function(){
            const outer=depth===0;
            depth++;
            if(outer){
              window.__rafexPdfDirtyV78=false;
              try{if(typeof window.rafexRefreshProductCountsV77==="function")window.rafexRefreshProductCountsV77();}catch(_){}
            }
            publish();
            let result;
            try{result=original.apply(this,arguments)}catch(error){depth=Math.max(0,depth-1);publish();throw error}
            if(result&&typeof result.finally==="function")return result.finally(()=>{depth=Math.max(0,depth-1);publish()});
            depth=Math.max(0,depth-1);publish();return result;
          };
          wrapped.__rafexPdfLazyPrintV78=true;
          wrapped.__rafexOriginal=original;
          setGlobal(name,wrapped);
        };
        wrapPrint("m2PrintCorporateReport");
        wrapPrint("m2PrintA4Report");
        window.rafexRunPdfWorkV78=function(callback){depth++;publish();try{return callback()}finally{depth=Math.max(0,depth-1);publish()}};
        publish();
      }
      rafexInstallPdfLazyV78();
      changeProgramLanguage(appLanguage, false);
      boot();`;

html = html.replace(bootMarker, lazyInstall);

for (const required of [
  "rafexInstallPdfLazyV78",
  "rafexPdfLazyStateV78",
  "__rafexPdfLazyGuardV78",
  "__rafexPdfLazyPrintV78",
  "rafexRefreshProductCountsV77"
]) if (!html.includes(required)) throw new Error("PDF lazy v78 doğrulama eksigi: " + required);

fs.writeFileSync(portalPath, html);
console.log("SOURCE v78: urun sayimi olay-temelli; PDF/A4/kurumsal rapor isi sadece PDF Olustur ile acilir.");
