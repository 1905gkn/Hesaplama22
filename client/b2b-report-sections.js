(() => {
  const VERSION = "corporate-type-sections-v14";

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

  function viewerFormulaFootHeight(options = {}) {
    const levels = Math.max(1, Math.round(num(options.levels, 1)));
    const traverseHeight = Math.max(50, num(options.traverseHeight, 140));
    const defaultPalletHeight = Math.max(300, num(options.palletHeight, 800));
    const defaultClearance = Math.max(0, num(options.palletTraverseGap, 200));
    const palletHeights = Array.isArray(options.palletHeights) ? options.palletHeights : [];
    const levelClearances = Array.isArray(options.levelClearances) ? options.levelClearances : [];
    const palletHeightAt = (level) => Math.max(300, num(palletHeights[level], defaultPalletHeight));
    const clearanceAt = (level) => Math.max(0, num(levelClearances[level], defaultClearance));

    let loadBottom = options.firstPalletPosition === "traverse"
      ? Math.max(0, num(options.firstFloorGap, 200)) + traverseHeight
      : 0;
    for (let level = 1; level < levels; level += 1) {
      loadBottom += palletHeightAt(level - 1) + clearanceAt(level - 1) + traverseHeight;
    }
    const lastPalletOverlap = Math.max(0, num(options.lastPalletOverlap, defaultPalletHeight / 2));
    return Math.max(500, Math.ceil((loadBottom + lastPalletOverlap) / 50) * 50);
  }

  function installCalculationOptionsBridge() {
    if (typeof window.m2Rack3DOptions !== "function") return false;
    if (window.m2Rack3DOptions.__rafexCalculationBridgeV14) return true;

    const original = window.m2Rack3DOptions;
    const wrapped = function (...args) {
      const result = original.apply(this, args);
      if (!result || typeof result !== "object") return result;
      // Hesaplama bölümünde kullanılan 3D seçeneklerini rapora özel fallback'lerden
      // ayır. b2b-report-3d daha sonra bazı alanları ezse bile bu kopya değişmeden kalır.
      const calculationOptions = { ...result };
      return {
        ...result,
        __rafexCalculationOptions: calculationOptions,
      };
    };
    wrapped.__rafexCalculationBridgeV14 = true;
    wrapped.__rafexOriginal = original;
    window.m2Rack3DOptions = wrapped;
    return true;
  }

  function adaptiveReportPadding(options = {}) {
    const palletCount = clamp(Math.round(num(options.palletCount, 3)), 1, 4);
    const palletWidth = Math.max(300, num(options.palletWidth, 800));
    const palletDepth = Math.max(300, num(options.palletDepth, 1200));
    const palletHeight = Math.max(300, num(options.palletHeight, 1200));
    const levels = Math.max(1, num(options.levels, 4));
    const footWidth = Math.max(60, num(options.footWidth, 120));
    const rowCount = options.rowType === "double" ? 2 : 1;
    const rowGap = Math.max(0, num(options.rowGap, 200));

    const rackWidth = palletCount * palletWidth + (palletCount + 1) * 75 + footWidth * 2;
    const estimatedHeight = Math.max(
      num(options.footHeight, 0),
      levels * (palletHeight + Math.max(100, num(options.palletTraverseGap, 200)) + Math.max(50, num(options.traverseHeight, 140))),
    );
    const rackDepth = palletDepth * rowCount + (rowCount === 2 ? rowGap : 0);
    const dominantSize = Math.max(rackWidth, estimatedHeight, rackDepth);

    let padding = levels <= 4 ? 0.96 : levels <= 7 ? 1.01 : 1.04;
    if (dominantSize > 10000) padding += Math.min(0.035, (dominantSize - 10000) / 110000);
    if (rowCount === 2 && rackDepth > 3200) padding += 0.01;
    return clamp(padding, 0.96, 1.08);
  }

  function installAdaptiveCaptureZoom() {
    const service = window.RafexB2BViewer;
    if (!service || typeof service.captureViews !== "function") return false;
    if (service.captureViews.__rafexAdaptiveReportZoomV14) return true;

    const originalCaptureViews = service.captureViews.__rafexOriginal || service.captureViews;
    const wrappedCaptureViews = function (options, settings = {}) {
      const requested = num(settings.cameraPadding, 1.16);
      const adaptive = adaptiveReportPadding(options || {});
      const width = num(settings.width, 0);
      const height = num(settings.height, 0);
      const isFrontReportCapture = width >= 2000 && height >= 2000;
      const isSideReportCapture = width === 1200 && height >= 2000;
      const isReportCapture = isFrontReportCapture || isSideReportCapture;

      const captureOptions = { ...(options || {}) };
      if (isReportCapture) {
        // Hesaplama ekranındaki m2Rack3DOptions çıktısı tek gerçek kaynaktır.
        // Rapor tarafında oluşturulan footHeight / seviye / travers fallback'lerini
        // bununla tekrar ez; böylece ayak boyu ve ölçüler yukarıdaki görünümle aynıdır.
        const calculationOptions = options?.__rafexCalculationOptions;
        if (calculationOptions && typeof calculationOptions === "object") {
          Object.assign(captureOptions, calculationOptions);
        } else {
          captureOptions.footHeight = viewerFormulaFootHeight(captureOptions);
        }
        delete captureOptions.__rafexCalculationOptions;
        delete captureOptions.__rafexSourceFootHeight;
      }

      return originalCaptureViews.call(this, captureOptions, {
        ...settings,
        width: isReportCapture ? 1500 : settings.width,
        height: isReportCapture ? 3000 : settings.height,
        cameraPadding: isReportCapture ? 1.14 : Math.min(requested, adaptive),
      });
    };
    wrappedCaptureViews.__rafexAdaptiveReportZoomV14 = true;
    wrappedCaptureViews.__rafexOriginal = originalCaptureViews;
    service.captureViews = wrappedCaptureViews;
    return true;
  }

  function customizationSignatureFromRack(rack) {
    return JSON.stringify({
      palletCount: Math.round(num(rack?.b2bLayout?.palletCount ?? rack?.bays, 1)),
      levels: Math.round(num(rack?.levels, 1)),
      palletHeight: num(rack?.palletHeight, 1200),
      rowCount: Math.round(num(rack?.b2bLayout?.rowCount, 1)),
      rowGap: num(rack?.b2bLayout?.rowGap, 0),
      customLevels: Array.isArray(rack?.b2b?.customLevels) ? rack.b2b.customLevels.map((item) => ({ interval:num(item?.interval), palletHeight:num(item?.palletHeight) })) : [],
      tunnelHeight: num(rack?.b2b?.tunnelHeight, 0),
    });
  }

  function customizationSignatureFromForm() {
    const manual = document.getElementById("m2CustomizeManualLevels")?.checked === true;
    const customLevels = manual ? [...document.querySelectorAll("#m2CustomizeLevelRows .m2-custom-level-row")].map((row) => ({
      interval: num(row.querySelector('[data-custom-interval]')?.value),
      palletHeight: num(row.querySelector('[data-custom-pallet]')?.value),
    })) : [];
    return JSON.stringify({
      palletCount: Math.max(1, Math.min(4, Math.round(num(document.getElementById("m2CustomizePalletCount")?.value, 1)))),
      levels: Math.max(1, Math.min(15, Math.round(num(document.getElementById("m2CustomizeLevels")?.value, 1)))),
      palletHeight: Math.max(300, num(document.getElementById("m2CustomizePalletHeight")?.value, 1200)),
      rowCount: document.getElementById("m2CustomizeRowType")?.value === "double" ? 2 : 1,
      rowGap: Math.max(0, num(document.getElementById("m2CustomizeRowGap")?.value, 0)),
      customLevels,
      tunnelHeight: document.getElementById("m2CustomizeTunnel")?.checked ? Math.max(500, num(document.getElementById("m2CustomizeTunnelHeight")?.value, 3600)) : 0,
    });
  }

  function nextCustomizedTypeName(rack) {
    const base = String(rack?.typeName || "Raf Tipi").replace(/\s*-\s*Özel\s*\d+\s*$/i, "").trim() || "Raf Tipi";
    const used = new Set();
    try { m2LayoutState.racks.forEach((item) => used.add(String(item.typeName || "").toLocaleLowerCase("tr-TR"))); } catch {}
    try { m2SavedRackTypes.forEach((item) => used.add(String(item.name || "").toLocaleLowerCase("tr-TR"))); } catch {}
    let index = 1;
    while (used.has(`${base} - Özel ${index}`.toLocaleLowerCase("tr-TR"))) index += 1;
    return `${base} - Özel ${index}`;
  }

  function installCustomizationTypeRules() {
    if (typeof window.m2ApplyRackCustomization !== "function" || window.m2ApplyRackCustomization.__rafexTechnicalTypesV6) return;
    const originalApply = window.m2ApplyRackCustomization;
    const wrappedApply = function (...args) {
      let rack = null;
      try { rack = m2LayoutState.racks.find((item) => item.id === m2CustomizeRackId); } catch {}
      if (rack && customizationSignatureFromRack(rack) !== customizationSignatureFromForm()) {
        const nameInput = document.getElementById("m2CustomizeName");
        const entered = String(nameInput?.value || "").trim();
        const current = String(rack.typeName || "").trim();
        if (!entered || entered.toLocaleLowerCase("tr-TR") === current.toLocaleLowerCase("tr-TR") || entered === "Özel Raf") {
          if (nameInput) nameInput.value = nextCustomizedTypeName(rack);
        }
      }
      return originalApply.apply(this, args);
    };
    wrappedApply.__rafexTechnicalTypesV6 = true;
    window.m2ApplyRackCustomization = wrappedApply;
  }

  function arrangeTypePage(page) {
    const grid = page?.querySelector(":scope > .m2-corporate-type-grid");
    if (!grid) return;
    const cards = [...grid.querySelectorAll(":scope > .m2-corporate-type-card")];
    if (!cards.length) return;

    page.classList.add("rafex-combined-type-page");
    page.classList.remove("rafex-single-type-page");
    cards.forEach((card) => {
      card.classList.add("rafex-combined-type-card");
      const views = [...card.querySelectorAll(":scope > .m2-corporate-view")];
      views.forEach((view, index) => {
        view.classList.toggle("rafex-front-view", index === 0);
        view.classList.toggle("rafex-side-view", index === 1);
        const title = view.querySelector(":scope > b");
        if (title) {
          const existing = String(title.textContent || "").trim();
          const shortTitle = existing.includes("·") ? existing.split("·").pop().trim() : existing;
          title.textContent = shortTitle || (index === 0 ? "ÖNDEN GÖRÜNÜŞ" : "YANDAN GÖRÜNÜŞ");
        }
      });
    });
  }

  function arrangeTypePages(host) {
    if (!host) return;
    const pages = [...host.querySelectorAll(":scope > .m2-corporate-page")];
    pages.forEach(arrangeTypePage);
    pages.forEach((page, index) => {
      const footer = page.querySelector(":scope > .m2-corporate-page-footer");
      if (footer) footer.textContent = `${index + 1} / ${pages.length}`;
    });
  }

  function installStyles() {
    document.querySelectorAll('style[data-rafex-corporate-type-sections]').forEach((node) => node.remove());
    const style = document.createElement("style");
    style.dataset.rafexCorporateTypeSections = VERSION;
    style.textContent = `
      .rafex-combined-type-page .m2-corporate-type-grid {display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;grid-template-rows:minmax(0,1fr)!important;gap:8px!important;align-items:stretch!important}
      .rafex-combined-type-page .m2-corporate-type-grid>.m2-corporate-type-card {grid-row:1!important;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;overflow:hidden!important}
      .rafex-combined-type-page .m2-corporate-type-grid>.m2-corporate-type-card:nth-child(1){grid-column:1!important}
      .rafex-combined-type-page .m2-corporate-type-grid>.m2-corporate-type-card:nth-child(2){grid-column:2!important}
      .rafex-combined-type-page .rafex-combined-type-card {display:grid!important;grid-template-columns:minmax(0,1.32fr) minmax(0,.68fr)!important;grid-template-rows:30px minmax(0,1fr)!important;gap:0!important}
      .rafex-combined-type-page .rafex-combined-type-card>strong {grid-column:1/-1!important;grid-row:1!important;align-self:center!important}
      .rafex-combined-type-page .rafex-combined-type-card>.m2-corporate-view {grid-row:2!important;min-width:0!important;min-height:0!important;overflow:hidden!important;display:grid!important;grid-template-rows:24px minmax(0,1fr)!important;padding:0!important;align-items:stretch!important;justify-items:stretch!important}
      .rafex-combined-type-page .rafex-combined-type-card>.m2-corporate-view:first-of-type {grid-column:1!important;border-right:1px solid #c6d2dc!important}
      .rafex-combined-type-page .rafex-combined-type-card>.m2-corporate-view:nth-of-type(2) {grid-column:2!important}
      .rafex-combined-type-page .m2-corporate-view>b {grid-row:1!important;display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;height:24px!important;margin:0!important;padding:2px 4px!important;background:#dceaf1!important;color:#0b2b45!important;font-size:8px!important;font-weight:900!important;line-height:1!important;text-align:center!important;position:static!important;transform:none!important}
      .rafex-combined-type-page .m2-corporate-view>.rafex-report-3d-frame {grid-row:2!important;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;padding:2px 5px 4px!important;position:relative!important}
      .rafex-combined-type-page .rafex-front-view>.rafex-report-3d-frame {padding-left:22px!important;padding-right:4px!important}
      .rafex-combined-type-page .m2-corporate-view>.rafex-report-3d-frame img {display:block!important;width:auto!important;height:90%!important;max-width:90%!important;max-height:90%!important;object-fit:contain!important;object-position:center center!important}
      .rafex-combined-type-page .rafex-front-view>.rafex-report-3d-frame img {position:relative!important;left:20%!important;top:-20%!important;transform:none!important}
      .rafex-combined-type-page .rafex-side-view>.rafex-report-3d-frame img {width:auto!important;height:90%!important;max-width:none!important;max-height:90%!important;object-fit:contain!important;object-position:center center!important;transform:none!important}
      .rafex-combined-type-page .m2-corporate-view>svg {grid-row:2!important;width:90%!important;height:90%!important;min-width:0!important;min-height:0!important;align-self:center!important;justify-self:center!important;position:relative!important}
      .rafex-combined-type-page .rafex-front-view>svg {width:88%!important;margin-left:12px!important;left:20%!important;top:-20%!important;transform:none!important}
      .rafex-combined-type-page .rafex-side-view>svg {width:auto!important;height:90%!important;max-width:none!important;max-height:90%!important}
    `;
    document.head.appendChild(style);
  }

  function installHooks() {
    installCalculationOptionsBridge();
    if (typeof window.m2RenderCorporateReport === "function" && !window.m2RenderCorporateReport.__rafexCombinedTypesV14) {
      const previousRender = window.m2RenderCorporateReport;
      const wrappedRender = function (...args) {
        installCalculationOptionsBridge();
        const result = previousRender.apply(this, args);
        installAdaptiveCaptureZoom();
        arrangeTypePages(document.getElementById("m2CorporatePreview"));
        return result;
      };
      wrappedRender.__rafexCombinedTypesV14 = true;
      window.m2RenderCorporateReport = wrappedRender;
    }

    const previousPrepare = window.__rafexPrepareCorporatePrint;
    if (typeof previousPrepare === "function" && !previousPrepare.__rafexCombinedTypesV14) {
      const wrappedPrepare = async function (...args) {
        installCalculationOptionsBridge();
        installAdaptiveCaptureZoom();
        await previousPrepare.apply(this, args);
        arrangeTypePages(document.getElementById("m2CorporatePrint"));
        arrangeTypePages(document.getElementById("m2CorporatePreview"));
      };
      wrappedPrepare.__rafexCombinedTypesV14 = true;
      window.__rafexPrepareCorporatePrint = wrappedPrepare;
    }
  }

  installStyles();
  installCalculationOptionsBridge();
  installAdaptiveCaptureZoom();
  installCustomizationTypeRules();
  installHooks();
  arrangeTypePages(document.getElementById("m2CorporatePreview"));
})();