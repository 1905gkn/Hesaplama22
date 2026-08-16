(() => {
  const VERSION = "corporate-type-sections-v3";

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

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

    // Küçük/orta raflarda daha yakın, büyük raflarda taşmayı engelleyecek kadar geri.
    let padding = 0.76;
    if (dominantSize > 4500) padding += Math.min(0.10, (dominantSize - 4500) / 55000);
    if (dominantSize > 9000) padding += Math.min(0.04, (dominantSize - 9000) / 90000);
    if (rowCount === 2 && rackDepth > 3000) padding += 0.015;
    if (levels >= 8) padding += 0.015;
    return clamp(padding, 0.76, 0.90);
  }

  function installAdaptiveCaptureZoom() {
    const service = window.RafexB2BViewer;
    if (!service || typeof service.captureViews !== "function") return false;
    if (service.captureViews.__rafexAdaptiveReportZoom) return true;

    const originalCaptureViews = service.captureViews;
    const wrappedCaptureViews = function (options, settings = {}) {
      const requested = num(settings.cameraPadding, 1.16);
      const adaptive = adaptiveReportPadding(options || {});
      return originalCaptureViews.call(this, options, {
        ...settings,
        cameraPadding: Math.min(requested, adaptive),
      });
    };
    wrappedCaptureViews.__rafexAdaptiveReportZoom = true;
    wrappedCaptureViews.__rafexOriginal = originalCaptureViews;
    service.captureViews = wrappedCaptureViews;
    return true;
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
      });
    });

    const header = page.querySelector(":scope > .m2-corporate-page-header b");
    if (header) header.textContent = "KESİTLER · A TİPİ + B TİPİ";
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
      .rafex-combined-type-page .m2-corporate-type-grid {
        display:grid !important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr) !important;
        grid-template-rows:minmax(0,1fr) !important;
        gap:10px !important;
        align-items:stretch !important;
      }
      .rafex-combined-type-page .m2-corporate-type-grid > .m2-corporate-type-card {
        grid-row:1 !important;
        width:100% !important;
        height:100% !important;
        min-width:0 !important;
        min-height:0 !important;
        overflow:hidden !important;
      }
      .rafex-combined-type-page .m2-corporate-type-grid > .m2-corporate-type-card:nth-child(1) {
        grid-column:1 !important;
      }
      .rafex-combined-type-page .m2-corporate-type-grid > .m2-corporate-type-card:nth-child(2) {
        grid-column:2 !important;
      }
      .rafex-combined-type-page .rafex-combined-type-card {
        display:grid !important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr) !important;
        grid-template-rows:30px minmax(0,1fr) !important;
        gap:0 !important;
      }
      .rafex-combined-type-page .rafex-combined-type-card > strong {
        grid-column:1 / -1 !important;
        grid-row:1 !important;
        align-self:center !important;
      }
      .rafex-combined-type-page .rafex-combined-type-card > .m2-corporate-view {
        grid-row:2 !important;
        min-width:0 !important;
        min-height:0 !important;
        overflow:hidden !important;
      }
      .rafex-combined-type-page .rafex-combined-type-card > .m2-corporate-view:first-of-type {
        grid-column:1 !important;
        border-right:1px solid #c6d2dc !important;
      }
      .rafex-combined-type-page .rafex-combined-type-card > .m2-corporate-view:nth-of-type(2) {
        grid-column:2 !important;
      }
      .rafex-combined-type-page .m2-corporate-view .rafex-report-3d-frame,
      .rafex-combined-type-page .m2-corporate-view .rafex-report-3d-frame img {
        width:100% !important;
        height:100% !important;
        max-width:100% !important;
        max-height:100% !important;
        object-fit:contain !important;
        object-position:center center !important;
      }
    `;
    document.head.appendChild(style);
  }

  function installHooks() {
    if (typeof window.m2RenderCorporateReport === "function" && !window.m2RenderCorporateReport.__rafexCombinedTypes) {
      const previousRender = window.m2RenderCorporateReport;
      const wrappedRender = function (...args) {
        const result = previousRender.apply(this, args);
        installAdaptiveCaptureZoom();
        arrangeTypePages(document.getElementById("m2CorporatePreview"));
        return result;
      };
      wrappedRender.__rafexCombinedTypes = true;
      window.m2RenderCorporateReport = wrappedRender;
    }

    if (!window.__rafexPrepareCorporatePrint?.__rafexCombinedTypes) {
      const previousPrepare = window.__rafexPrepareCorporatePrint;
      const wrappedPrepare = async function (...args) {
        installAdaptiveCaptureZoom();
        if (typeof previousPrepare === "function") await previousPrepare.apply(this, args);
        arrangeTypePages(document.getElementById("m2CorporatePrint"));
        arrangeTypePages(document.getElementById("m2CorporatePreview"));
      };
      wrappedPrepare.__rafexCombinedTypes = true;
      window.__rafexPrepareCorporatePrint = wrappedPrepare;
    }
  }

  installStyles();
  installAdaptiveCaptureZoom();
  installHooks();
  arrangeTypePages(document.getElementById("m2CorporatePreview"));
})();
