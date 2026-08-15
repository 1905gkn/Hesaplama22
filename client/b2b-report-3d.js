(() => {
  const VERSION = "front-side-capture-v26";
  const reportDrawings = new Map();
  const reportViewCache = new Map();
  const reportViewPending = new Map();
  let combinedVariantCache = null;
  let combinedVariantPending = null;

  const number = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const b2bTraverseHeight = (drawing) => {
    const state = drawing?.b2b || {};
    const typeHeight = Number(String(state.traverseType || "").match(/\d+/)?.[0]);
    const candidates = [state.traverseHeightOverride, state.traverseHeight, typeHeight, drawing?.traverseHeight, 140];
    return Math.max(50, candidates.map(Number).find((value) => Number.isFinite(value) && value > 0) || 140);
  };

  function stableKey(drawing) {
    const state = drawing?.b2b || {};
    const layout = drawing?.b2bLayout || {};
    const tiePlan = typeof b2bStraightTiePlan === "function"
      ? b2bStraightTiePlan(drawing)
      : { count: 0, positions: [] };
    const payload = {
      palletCount: number(layout.palletCount ?? state.palletCount ?? drawing?.bays, 3),
      palletWidth: number(layout.palletWidth ?? state.palletWidth ?? drawing?.palW, 800),
      palletDepth: number(layout.palletDepth ?? state.palletDepth ?? drawing?.palD, 1200),
      palletHeight: number(drawing?.palletHeight ?? state.palletHeight, 1200),
      levels: number(drawing?.levels ?? state.levels, 4),
      rowCount: number(layout.rowCount, state.rowType === "double" ? 2 : 1),
      rowGap: number(layout.rowGap ?? state.rowGap, 200),
      uprightHeight: number(drawing?.sideUprightHeight ?? drawing?.totalRackHeight ?? drawing?.footLy ?? state.footHeight, 0),
      traverseHeight: b2bTraverseHeight(drawing),
      tunnelHeight: number(state.tunnelHeight, 0),
      firstPalletPosition: state.firstPalletPosition || "ground",
      firstFloorGap: number(state.firstFloorGap, 200),
      palletTraverseGap: number(state.palletTraverseGap, 200),
      lastPalletOverlap: number(state.lastPalletOverlap, 600),
      palletOverhang: number(state.palletOverhang ?? layout.palletOverhang, 50),
      customLevels: Array.isArray(state.customLevels)
        ? state.customLevels.map((item) => ({
            interval: number(item?.interval, 0),
            palletHeight: number(item?.palletHeight, 0),
          }))
        : [],
      tieCount: number(tiePlan?.count, 0),
      tiePositions: Array.isArray(tiePlan?.positions) ? tiePlan.positions.map((item) => number(item, 0)) : [],
      footColor: state.footColor || "ral5010",
      traverseColor: state.traverseColor || "ral1007",
      dimensionLabelScale: Math.max(.7, Math.min(1.5, number(state.dimensionTextScale, typeof b2bDimensionTextScale === "number" ? b2bDimensionTextScale : 1))),
    };
    const text = JSON.stringify(payload);
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `b2b-${(hash >>> 0).toString(36)}-${text.length.toString(36)}`;
  }

  function registerDrawing(drawing) {
    const key = stableKey(drawing);
    reportDrawings.set(key, drawing);
    return key;
  }

  function markSvg(svg, key, view) {
    if (typeof svg !== "string" || !svg.includes("<svg")) return svg;
    return svg.replace(
      /<svg\b/,
      `<svg data-rafex-capture-key="${key}" data-rafex-capture-view="${view}" data-rafex-report-version="${VERSION}"`,
    );
  }

  function installDrawingRegistry() {
    try {
      const originalFront = m2B2BReportPerspectiveSvg;
      m2B2BReportPerspectiveSvg = function (drawing, ...args) {
        const key = registerDrawing(drawing);
        return markSvg(originalFront.call(this, drawing, ...args), key, "front");
      };
    } catch (error) {
      console.error("B2B PDF ön görünüş kaydı kurulamadı", error);
    }
    try {
      const originalSide = m2B2BSideElevationSvg;
      m2B2BSideElevationSvg = function (drawing, ...args) {
        const key = registerDrawing(drawing);
        return markSvg(originalSide.call(this, drawing, ...args), key, "side");
      };
    } catch (error) {
      console.error("B2B PDF yan görünüş kaydı kurulamadı", error);
    }
  }

  function fallbackViewerOptions(drawing) {
    const state = drawing?.b2b || {};
    const layout = drawing?.b2bLayout || {};
    const customLevels = Array.isArray(state.customLevels) ? state.customLevels : [];
    const palletHeight = Math.max(300, number(drawing?.palletHeight ?? state.palletHeight, 1200));
    const traverseHeight = b2bTraverseHeight(drawing);
    const palletHeights = customLevels.map((item) => Math.max(300, number(item?.palletHeight, palletHeight)));
    const levelClearances = customLevels.map((item, index) => Math.max(
      0,
      number(item?.interval, 0) - (palletHeights[index] || palletHeight) - traverseHeight,
    ));
    const footHeight = Math.max(
      500,
      number(drawing?.sideUprightHeight ?? drawing?.totalRackHeight ?? drawing?.footLy ?? state.footHeight, 0),
    );
    const tiePlan = typeof b2bStraightTiePlan === "function"
      ? b2bStraightTiePlan(drawing)
      : { count: 0, positions: [] };
    const overhang = Math.max(0, number(state.palletOverhang ?? layout.palletOverhang, 50));
    return {
      moduleCount: 1,
      palletCount: Math.max(1, Math.min(4, number(layout.palletCount ?? state.palletCount ?? drawing?.bays, 3))),
      palletWidth: Math.max(300, number(layout.palletWidth ?? state.palletWidth ?? drawing?.palW, 800)),
      palletDepth: Math.max(300, number(layout.palletDepth ?? state.palletDepth ?? drawing?.palD, 1200)),
      palletHeight,
      levels: Math.max(1, number(drawing?.levels ?? state.levels, 4)),
      rowType: number(layout.rowCount, state.rowType === "double" ? 2 : 1) === 2 ? "double" : "single",
      rowGap: Math.max(0, number(layout.rowGap ?? state.rowGap, 200)),
      straightTieCount: Math.max(0, number(tiePlan?.count, 0)),
      straightTiePositions: Array.isArray(tiePlan?.positions) ? tiePlan.positions.map((item) => number(item, 0)) : [],
      palletTraverseGap: Math.max(0, number(state.palletTraverseGap, 200)),
      levelClearances,
      palletHeights,
      tunnelHeight: Math.max(0, number(state.tunnelHeight, 0)),
      firstPalletPosition: state.firstPalletPosition === "traverse" ? "traverse" : "ground",
      firstFloorGap: Math.max(0, number(state.firstFloorGap, 200)),
      lastPalletOverlap: Math.max(0, number(state.lastPalletOverlap, 600)),
      frontPalletGap: overhang,
      rearPalletGap: overhang,
      traverseHeight,
      footHeight,
      footWidth: Math.max(60, number(drawing?.footType ?? state.footWidth, 120)),
      showPallets: true,
      footColor: state.footColor || "ral5010",
      traverseColor: state.traverseColor || "ral1007",
      dimensionLabelScale: Math.max(.7, Math.min(1.5, number(state.dimensionTextScale, typeof b2bDimensionTextScale === "number" ? b2bDimensionTextScale : 1))),
    };
  }

  function viewerOptions(drawing) {
    let options = null;
    try {
      if (typeof m2Rack3DOptions === "function") options = m2Rack3DOptions(drawing);
    } catch (error) {
      console.warn("B2B PDF için mevcut 3D seçenekleri okunamadı", error);
    }
    const fallback = fallbackViewerOptions(drawing);
    const merged = { ...fallback, ...(options || {}) };
    merged.moduleCount = 1;
    merged.showPallets = true;
    merged.palletCount = fallback.palletCount;
    merged.palletWidth = fallback.palletWidth;
    merged.palletDepth = fallback.palletDepth;
    merged.palletHeight = fallback.palletHeight;
    merged.levels = fallback.levels;
    merged.rowType = fallback.rowType;
    merged.rowGap = fallback.rowGap;
    merged.levelClearances = fallback.levelClearances;
    merged.palletHeights = fallback.palletHeights;
    merged.tunnelHeight = fallback.tunnelHeight;
    merged.straightTieCount = fallback.straightTieCount;
    merged.straightTiePositions = fallback.straightTiePositions;
    merged.footHeight = fallback.footHeight;
    merged.traverseHeight = fallback.traverseHeight;
    merged.frontPalletGap = fallback.frontPalletGap;
    merged.rearPalletGap = fallback.rearPalletGap;
    merged.dimensionLabelScale = fallback.dimensionLabelScale;
    return merged;
  }

  function trimCache() {
    while (reportViewCache.size > 16) {
      const oldest = reportViewCache.keys().next().value;
      reportViewCache.delete(oldest);
    }
  }

  function variantsEnabled(){return document.getElementById("m2ReportCompleteFront")?.checked===true;}
  function reportCacheKey(key){return `${key}|${variantsEnabled()?"variants":"single"}`;}

  async function captureDrawing(key) {
    const cacheKey=reportCacheKey(key);
    if (reportViewCache.has(cacheKey)) return reportViewCache.get(cacheKey);
    if (reportViewPending.has(cacheKey)) return reportViewPending.get(cacheKey);
    const drawing = reportDrawings.get(key);
    if (!drawing) return null;

    const task = (async () => {
      const capture = window.RafexB2BViewer?.captureViews;
      if (typeof capture !== "function") throw new Error("B2B 3D görüntü yakalama servisi hazır değil.");
      const options=viewerOptions(drawing);
      const result = await capture(options, {
        width: 3000,
        height: 2000,
        pixelRatio: 2,
        cameraPadding: 1.06,
        frontDimensions: { levels: true, markers: true, eye: true, width: false, depth: false },
        sideDimensions: { levels: false, markers: false, eye: false, width: false, depth: true },
        side: "right",
      });
      if (!result?.front || !result?.side) throw new Error("B2B 3D ön/yan görüntüsü oluşturulamadı.");
      const cached = { front: result.front, side: result.side };
      reportViewCache.set(cacheKey, cached);
      trimCache();
      return cached;
    })()
      .catch((error) => {
        console.error("B2B PDF 3D görüntüsü hazırlanamadı", error);
        return null;
      })
      .finally(() => reportViewPending.delete(cacheKey));

    reportViewPending.set(cacheKey, task);
    return task;
  }

  function reportCards() {
    const items = [];
    document.querySelectorAll("#m2ReportFronts .m2-report-elevation").forEach((card) => items.push({ card, view: card.dataset.rafexCaptureView || "front" }));
    document.querySelectorAll("#m2ReportSides .m2-report-elevation").forEach((card) => items.push({ card, view: card.dataset.rafexCaptureView || "side" }));
    document.querySelectorAll("#m2CorporatePreview .m2-corporate-view, #m2CorporatePrint .m2-corporate-view").forEach((card) => {
      const view = card.querySelector("svg[data-rafex-capture-view]")?.dataset.rafexCaptureView;
      if (view === "front" || view === "side") items.push({ card, view });
    });
    return items;
  }

  function cardKey(card) {
    const svg = card.querySelector("svg[data-rafex-capture-key]");
    const key = svg?.dataset.rafexCaptureKey || card.dataset.rafexCaptureKey || "";
    if (key) card.dataset.rafexCaptureKey = key;
    return key;
  }

  function replaceCardView(card, view) {
    const key = cardKey(card);
    if (!key) return false;
    const cached = reportViewCache.get(reportCacheKey(key));
    if (!cached?.[view]) return false;
    let frame = card.querySelector(".rafex-report-3d-frame");
    if (!frame) {
      card.querySelectorAll("svg,.rafex-report-3d-frame").forEach((node) => node.remove());
      frame = document.createElement("div");
      frame.className = "rafex-report-3d-frame";
      card.appendChild(frame);
    }
    let image = frame.querySelector("img");
    if (!image) {
      image = document.createElement("img");
      image.decoding = "sync";
      image.loading = "eager";
      frame.appendChild(image);
    }
    image.src = cached[view];
    image.alt = view === "front" ? "B2B raf 3D önden görünüş" : "B2B raf 3D sağ yan görünüş";
    card.dataset.rafexCaptureView = view;
    card.dataset.rafex3dReady = "true";
    return true;
  }

  function visibleVariantDrawings(){
    try{
      const placed=typeof m2CorporateUsedTypes==="function"?m2CorporateUsedTypes():[];
      if(Array.isArray(placed)&&placed.length){
        const uniqueCounts=new Map();
        placed.forEach((entry,index)=>{
          const drawing=entry?.drawing||entry,key=registerDrawing(drawing),name=String(entry?.name||`TİP ${index+1}`),count=number(drawing?.b2bLayout?.palletCount??drawing?.b2b?.palletCount??drawing?.bays,0);
          if(count>0&&!uniqueCounts.has(count))uniqueCounts.set(count,{key:`${key}:${name}`,drawing,count,name});
        });
        return [...uniqueCounts.values()].sort((left,right)=>right.count-left.count);
      }
    }catch(error){console.warn("B2B kurumsal tip listesi doğrudan okunamadı",error);}
    const cards=[...document.querySelectorAll(".rafex-combined-front, .rafex-variant-pair .m2-report-elevation[data-rafex-capture-view='front'], #m2ReportFronts>.m2-report-elevation")];
    const found=new Map();
    cards.forEach((card)=>{
      const key=cardKey(card),drawing=reportDrawings.get(key);if(!key||!drawing)return;
      const count=number(drawing?.b2bLayout?.palletCount??drawing?.b2b?.palletCount??drawing?.bays,0);
      if(count>0&&!found.has(key))found.set(key,{key,drawing,count});
    });
    return [...found.values()].sort((left,right)=>right.count-left.count);
  }

  async function captureCombinedVariants(){
    const enabled=document.getElementById("m2ReportCompleteFront")?.checked===true;
    const entries=enabled?visibleVariantDrawings():[];
    if(entries.length<2){combinedVariantCache=null;return null;}
    const signature=entries.map((entry)=>entry.key).join("|");
    if(combinedVariantCache?.signature===signature)return combinedVariantCache;
    if(combinedVariantPending)return combinedVariantPending;
    combinedVariantPending=(async()=>{
      const moduleOptions=entries.map((entry)=>viewerOptions(entry.drawing));
      const base={...moduleOptions[0],moduleCount:moduleOptions.length,moduleOptions,showPallets:true};
      const capture=window.RafexB2BViewer?.captureViews;
      if(typeof capture!=="function")throw new Error("Birleşik B2B 3D yakalama servisi hazır değil.");
      const result=await capture(base,{width:3000,height:1500,pixelRatio:2,cameraPadding:1.12,frontDimensions:{levels:true,markers:true,eye:true,width:false,depth:false},sideDimensions:{levels:false,markers:false,eye:false,width:false,depth:true},side:"right"});
      combinedVariantCache={signature,front:result.front,side:result.side};return combinedVariantCache;
    })().finally(()=>{combinedVariantPending=null;});
    return combinedVariantPending;
  }

  function applyCombinedVariantViews(){
    if(!combinedVariantCache)return;
    document.querySelectorAll(".rafex-combined-fronts").forEach((host)=>{
      host.innerHTML=`<div class="rafex-report-3d-frame rafex-true-combined"><img src="${combinedVariantCache.front}" alt="Birleşik B2B modülleri 3D önden görünüş"></div>`;
    });
    document.querySelectorAll(".rafex-combined-side").forEach((host)=>{
      host.innerHTML=`<div class="rafex-report-3d-frame"><img src="${combinedVariantCache.side}" alt="Birleşik B2B modülleri 3D yan görünüş"></div>`;
    });
    const sheet=document.getElementById("m2A4Sheet"),fronts=document.getElementById("m2ReportFronts");
    if(sheet?.classList.contains("rafex-variants-active")&&fronts){
      fronts.style.setProperty("--m2-report-count","1");
      fronts.innerHTML=`<div class="rafex-summary-combined"><div><b>ÖNDEN GÖRÜNÜŞ</b><div class="rafex-report-3d-frame"><img src="${combinedVariantCache.front}" alt="Birleşik B2B modülleri 3D önden görünüş"></div></div><div><b>YAN GÖRÜNÜŞ</b><div class="rafex-report-3d-frame"><img src="${combinedVariantCache.side}" alt="Birleşik B2B modülleri 3D yan görünüş"></div></div></div>`;
    }
  }

  function applyCachedViews() {
    reportCards().forEach(({ card, view }) => replaceCardView(card, view));
    applyCombinedVariantViews();
  }

  async function ensureReportViews() {
    const keys = [...new Set(reportCards().map(({ card }) => cardKey(card)).filter(Boolean))];
    for (const key of keys) await captureDrawing(key);
    await captureCombinedVariants();
    applyCachedViews();
  }

  function renderAvailableVariants() {
    const toggle=document.getElementById("m2ReportCompleteFront"),label=document.getElementById("m2ReportVariantsLabel"),sheet=document.getElementById("m2A4Sheet");
    if(label)label.textContent="4–3–2–1 GÖSTER";
    const enabled=toggle?.checked===true;sheet?.classList.toggle("rafex-variants-active",enabled);
    if(!enabled)return;
    const fronts=document.getElementById("m2ReportFronts"),sides=document.getElementById("m2ReportSides");
    const original=[...(fronts?.querySelectorAll(".m2-report-elevation")||[])];
    const variants=original.map((card)=>{
      const key=cardKey(card),drawing=reportDrawings.get(key);if(!key||!drawing)return null;
      const count=number(drawing?.b2bLayout?.palletCount??drawing?.b2b?.palletCount??drawing?.bays,0);
      return {key,drawing,count,title:card.querySelector("b")?.textContent||"Raf Tipi"};
    }).filter(Boolean).sort((a,b)=>b.count-a.count);
    if(variants.length<2){sheet?.classList.remove("rafex-variants-active");return;}
    const language=document.getElementById("m2ReportLanguage")?.value||"tr",labels=typeof m2ReportDictionary==="function"?m2ReportDictionary(language):{};
    const cards=variants.map((entry)=>{
      const front=m2B2BReportPerspectiveSvg(entry.drawing,labels,false),side=m2B2BSideElevationSvg(entry.drawing,labels);
      return `<div class="rafex-variant-pair"><b class="rafex-variant-title">${entry.title}</b><div class="m2-report-elevation" data-rafex-capture-view="front">${front}</div><div class="m2-report-elevation" data-rafex-capture-view="side">${side}</div></div>`;
    }).join("");
    if(fronts){fronts.style.setProperty("--m2-report-count",String(variants.length));fronts.innerHTML=cards;}
    if(sides)sides.innerHTML="";
  }

  function installReportHooks() {
    window.__rafexPrepareCorporatePrint=async function(){
      await ensureReportViews();
      applyCachedViews();
    };
    try {
      const originalRender = m2RenderA4Report;
      m2RenderA4Report = function (...args) {
        const result = originalRender.apply(this, args);
        renderAvailableVariants();
        applyCachedViews();
        queueMicrotask(() => ensureReportViews());
        return result;
      };
    } catch (error) {
      console.error("B2B PDF 3D önizleme bağlantısı kurulamadı", error);
    }

    try {
      const originalCorporateRender = m2RenderCorporateReport;
      m2RenderCorporateReport = function (...args) {
        const result = originalCorporateRender.apply(this, args);
        applyCachedViews();
        queueMicrotask(() => ensureReportViews());
        return result;
      };
    } catch (error) {
      console.error("B2B detay çıktı 3D önizleme bağlantısı kurulamadı", error);
    }

    try {
      const originalPrint = m2PrintA4Report;
      let printInProgress = false;
      m2PrintA4Report = async function (...args) {
        if (printInProgress) return;
        printInProgress = true;
        const releasePrint = () => { printInProgress = false; };
        const releaseTimer = window.setTimeout(releasePrint, 15000);
        window.addEventListener("afterprint", () => {
          window.clearTimeout(releaseTimer);
          releasePrint();
        }, { once: true });
        const corporate = document.getElementById("m2ReportType")?.value === "corporate";
        try {
          if (corporate) m2RenderCorporateReport();
          else m2RenderA4Report();
          await ensureReportViews();
          applyCachedViews();
          return originalPrint.apply(this, args);
        } catch (error) {
          console.error("B2B PDF 3D görünüşleri yazdırma öncesi tamamlanamadı", error);
          window.clearTimeout(releaseTimer);
          releasePrint();
          return originalPrint.apply(this, args);
        }
      };
    } catch (error) {
      console.error("B2B PDF yazdırma bağlantısı kurulamadı", error);
    }
  }

  function installStyles() {
    if (document.querySelector(`style[data-rafex-b2b-report-3d="${VERSION}"]`)) return;
    const style = document.createElement("style");
    style.setAttribute("data-rafex-b2b-report-3d", VERSION);
    style.textContent = `
      .m2-report-elevation .rafex-report-3d-frame,
      #m2A4PrintSheet .m2-report-elevation .rafex-report-3d-frame {
        width:100%;
        height:100%;
        min-width:0;
        min-height:0;
        display:grid;
        place-items:center;
        overflow:hidden;
        background:#fff;
      }
      .m2-report-elevation .rafex-report-3d-frame img,
      #m2A4PrintSheet .m2-report-elevation .rafex-report-3d-frame img {
        display:block;
        width:100%;
        height:100%;
        min-width:0;
        min-height:0;
        object-fit:contain;
        object-position:center;
      }
      .m2-report-elevation[data-rafex-3d-ready="true"],
      .m2-corporate-view[data-rafex-3d-ready="true"] {
        background:#fff;
      }
      .m2-corporate-view .rafex-report-3d-frame,
      #m2CorporatePrint .m2-corporate-view .rafex-report-3d-frame {
        width:100%; height:100%; min-width:0; min-height:0; display:grid;
        place-items:center; overflow:hidden; background:#fff;
      }
      .m2-corporate-view .rafex-report-3d-frame img,
      #m2CorporatePrint .m2-corporate-view .rafex-report-3d-frame img {
        display:block; width:100%; height:100%; object-fit:contain; object-position:center;
      }
      #m2ReportFronts, #m2ReportSides {
        grid-template-columns:repeat(var(--m2-report-count, 1), minmax(0, 1fr)) !important;
      }
      .m2-corporate-view .rafex-report-3d-frame img,
      #m2CorporatePrint .m2-corporate-view .rafex-report-3d-frame img {
        max-width:100%; max-height:100%; padding:6px; box-sizing:border-box;
      }
      #m2A4Sheet.rafex-variants-active .m2-a4-floor,
      #m2A4Sheet.rafex-variants-active .m2-a4-side { display:none !important; }
      #m2A4Sheet.rafex-variants-active .m2-a4-front {
        grid-column:1 / -1 !important; grid-row:1 / 4 !important; min-width:0; min-height:0;
      }
      #m2A4Sheet.rafex-variants-active #m2ReportFronts {
        display:grid !important; grid-template-columns:repeat(var(--m2-report-count, 1),minmax(0,1fr)) !important;
        gap:6px; width:100%; height:100%; align-items:stretch;
      }
      .rafex-variant-pair { display:grid; grid-template-rows:auto minmax(0,1.45fr) minmax(0,1fr); gap:4px; min-width:0; min-height:0; background:#fff; border:1px solid #d7e0e6; border-radius:6px; padding:5px; overflow:hidden; }
      .rafex-variant-title { text-align:center; font-size:10px; color:#073357; }
      .rafex-variant-pair .m2-report-elevation { min-width:0; min-height:0; height:100%; overflow:hidden; background:#fff; }
      .rafex-combined-page .m2-corporate-type-grid { grid-template-rows:minmax(0,1fr) !important; }
      .rafex-combined-type-card { grid-template-columns:9% minmax(0,72%) minmax(0,19%) !important; }
      .rafex-combined-fronts,.rafex-combined-side { display:flex; width:100%; height:100%; min-width:0; min-height:0; overflow:hidden; background:#fff; }
      .rafex-combined-fronts .rafex-true-combined { width:100%; height:100%; display:grid; place-items:center; overflow:hidden; background:#fff; }
      .rafex-combined-fronts .rafex-true-combined img { display:block; width:100%; height:100%; object-fit:contain; }
      .rafex-summary-combined { display:grid; grid-template-columns:minmax(0,4fr) minmax(0,1fr); gap:6px; width:100%; height:100%; min-width:0; min-height:0; }
      .rafex-summary-combined>div { display:grid; grid-template-rows:18px minmax(0,1fr); min-width:0; min-height:0; overflow:hidden; background:#fff; }
      .rafex-summary-combined b { display:grid; place-items:center; background:#dceaf1; color:#0b2b45; font-size:8px; }
      .rafex-summary-combined .rafex-report-3d-frame,.rafex-summary-combined img { width:100%; height:100%; min-width:0; min-height:0; object-fit:contain; }
      .rafex-combined-front { flex:var(--rafex-variant-weight,1) 1 0; border-left:0 !important; min-width:0; overflow:hidden; }
      .rafex-combined-front + .rafex-combined-front { margin-left:-1px; }
      .rafex-combined-front .rafex-report-3d-frame { overflow:hidden; }
      .rafex-combined-front:not(:first-child) .rafex-report-3d-frame img { transform:scale(1.18); transform-origin:center right; }
      .rafex-combined-side { border-left:1px solid #c6d2dc !important; }
      .rafex-combined-side .rafex-report-3d-frame,.rafex-combined-side img { width:100%; height:100%; object-fit:contain; }
      .m2-corporate-type-grid { gap:2px !important; }
      .m2-corporate-type-card>strong { font-size:13px !important; padding:3px !important; }
      .m2-corporate-view b { font-size:10px !important; height:20px; }
      .m2-corporate-type-card { grid-template-columns:12% 44% 44% !important; }
      .m2-corporate-bom-grid:not(.combined) { grid-template-columns:repeat(2,minmax(0,1fr)) !important; grid-template-rows:repeat(3,minmax(0,1fr)) !important; gap:3px 5px !important; }
      .m2-corporate-bom-card h3 { font-size:13px !important; line-height:1 !important; padding:4px 7px !important; }
      .m2-corporate-bom-meta { font-size:9.5px !important; line-height:1 !important; padding:2px 7px !important; }
      .m2-corporate-bom-head { font-size:9.5px !important; line-height:1 !important; }
      .m2-corporate-bom-row { font-size:9.2px !important; line-height:1 !important; min-height:0 !important; font-weight:700 !important; }
      .m2-corporate-bom-head span,.m2-corporate-bom-row span { padding:3px 4px !important; }
      @media print {
        #m2A4PrintSheet { overflow:hidden !important; contain:layout paint; }
        #m2A4PrintSheet.rafex-variants-active .m2-a4-floor,
        #m2A4PrintSheet.rafex-variants-active .m2-a4-side { display:none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  installStyles();
  installDrawingRegistry();
  installReportHooks();
  queueMicrotask(() => {
    applyCachedViews();
    ensureReportViews();
  });
})();
