(() => {
  const VERSION = "front-side-capture-v4";
  const reportDrawings = new Map();
  const reportViewCache = new Map();
  const reportViewPending = new Map();

  const number = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
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
      traverseHeight: number(drawing?.traverseHeight ?? state.traverseHeight, 0),
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
    const traverseHeight = Math.max(50, number(drawing?.traverseHeight ?? state.traverseHeight, 140));
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
      showPallets: true,
      footColor: state.footColor || "ral5010",
      traverseColor: state.traverseColor || "ral1007",
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
    return merged;
  }

  function trimCache() {
    while (reportViewCache.size > 16) {
      const oldest = reportViewCache.keys().next().value;
      reportViewCache.delete(oldest);
    }
  }

  async function captureDrawing(key) {
    if (reportViewCache.has(key)) return reportViewCache.get(key);
    if (reportViewPending.has(key)) return reportViewPending.get(key);
    const drawing = reportDrawings.get(key);
    if (!drawing) return null;

    const task = (async () => {
      const capture = window.RafexB2BViewer?.captureViews;
      if (typeof capture !== "function") throw new Error("B2B 3D görüntü yakalama servisi hazır değil.");
      const result = await capture(viewerOptions(drawing), {
        width: 1200,
        height: 760,
        frontDimensions: { levels: true, markers: true, eye: true, width: false, depth: true },
        sideDimensions: { levels: false, markers: false, eye: false, width: false, depth: true },
        side: "right",
      });
      if (!result?.front || !result?.side) throw new Error("B2B 3D ön/yan görüntüsü oluşturulamadı.");
      const cached = { front: result.front, side: result.side };
      reportViewCache.set(key, cached);
      trimCache();
      return cached;
    })()
      .catch((error) => {
        console.error("B2B PDF 3D görüntüsü hazırlanamadı", error);
        return null;
      })
      .finally(() => reportViewPending.delete(key));

    reportViewPending.set(key, task);
    return task;
  }

  function reportCards() {
    const items = [];
    document.querySelectorAll("#m2ReportFronts .m2-report-elevation").forEach((card) => items.push({ card, view: "front" }));
    document.querySelectorAll("#m2ReportSides .m2-report-elevation").forEach((card) => items.push({ card, view: "side" }));
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
    const cached = reportViewCache.get(key);
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

  function applyCachedViews() {
    reportCards().forEach(({ card, view }) => replaceCardView(card, view));
  }

  async function ensureReportViews() {
    const keys = [...new Set(reportCards().map(({ card }) => cardKey(card)).filter(Boolean))];
    for (const key of keys) await captureDrawing(key);
    applyCachedViews();
  }

  function installReportHooks() {
    try {
      const originalRender = m2RenderA4Report;
      m2RenderA4Report = function (...args) {
        const result = originalRender.apply(this, args);
        applyCachedViews();
        queueMicrotask(() => ensureReportViews());
        return result;
      };
    } catch (error) {
      console.error("B2B PDF 3D önizleme bağlantısı kurulamadı", error);
    }

    try {
      const originalPrint = m2PrintA4Report;
      m2PrintA4Report = async function (...args) {
        if (document.getElementById("m2ReportType")?.value !== "corporate") {
          try {
            m2RenderA4Report();
            await ensureReportViews();
            m2RenderA4Report();
            applyCachedViews();
          } catch (error) {
            console.error("B2B PDF 3D görünüşleri yazdırma öncesi tamamlanamadı", error);
          }
        }
        return originalPrint.apply(this, args);
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
        background:#f7eff1;
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
      .m2-report-elevation[data-rafex-3d-ready="true"] {
        background:#f7eff1;
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
