(() => {
  const VERSION = "corporate-type-sections-v15";
  const PLACEMENT_KEY = "rafex_b2b_section_placement_v1";
  const DEFAULT_PLACEMENT = {
    front: { x: 20, y: -20, scale: 1 },
    side: { x: 0, y: 0, scale: 1 },
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const copyPlacement = (value) => ({
    front: { ...value.front },
    side: { ...value.side },
  });

  function normalizedPlacement(raw = {}) {
    const normalizeView = (view, fallback) => ({
      x: clamp(num(view?.x, fallback.x), -80, 80),
      y: clamp(num(view?.y, fallback.y), -80, 80),
      scale: clamp(num(view?.scale, fallback.scale), 0.35, 2.5),
    });
    return {
      front: normalizeView(raw.front, DEFAULT_PLACEMENT.front),
      side: normalizeView(raw.side, DEFAULT_PLACEMENT.side),
    };
  }

  function loadPlacement() {
    try {
      return normalizedPlacement(JSON.parse(localStorage.getItem(PLACEMENT_KEY) || "{}"));
    } catch {
      return normalizedPlacement(DEFAULT_PLACEMENT);
    }
  }

  let placementSettings = loadPlacement();
  let editorDraft = copyPlacement(placementSettings);

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
    if (window.m2Rack3DOptions.__rafexCalculationBridgeV15) return true;

    const original = window.m2Rack3DOptions.__rafexOriginal || window.m2Rack3DOptions;
    const wrapped = function (...args) {
      const result = original.apply(this, args);
      if (!result || typeof result !== "object") return result;
      const calculationOptions = { ...result };
      return {
        ...result,
        __rafexCalculationOptions: calculationOptions,
      };
    };
    wrapped.__rafexCalculationBridgeV15 = true;
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
    if (service.captureViews.__rafexAdaptiveReportZoomV15) return true;

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
    wrappedCaptureViews.__rafexAdaptiveReportZoomV15 = true;
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

  function applyViewPlacement(view, type, settings = placementSettings) {
    const item = settings[type] || DEFAULT_PLACEMENT[type];
    view.style.setProperty("--rafex-section-x", `${item.x}%`);
    view.style.setProperty("--rafex-section-y", `${item.y}%`);
    view.style.setProperty("--rafex-section-scale", String(item.scale));
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
        const type = index === 0 ? "front" : "side";
        view.classList.toggle("rafex-front-view", type === "front");
        view.classList.toggle("rafex-side-view", type === "side");
        applyViewPlacement(view, type);
        const title = view.querySelector(":scope > b");
        if (title) {
          const existing = String(title.textContent || "").trim();
          const shortTitle = existing.includes("·") ? existing.split("·").pop().trim() : existing;
          title.textContent = shortTitle || (type === "front" ? "ÖNDEN GÖRÜNÜŞ" : "YANDAN GÖRÜNÜŞ");
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

  function applyPlacementEverywhere() {
    arrangeTypePages(document.getElementById("m2CorporatePreview"));
    arrangeTypePages(document.getElementById("m2CorporatePrint"));
  }

  function representativeArtwork(type) {
    const cls = type === "front" ? ".rafex-front-view" : ".rafex-side-view";
    const hosts = [document.getElementById("m2CorporatePreview"), document.getElementById("m2CorporatePrint")].filter(Boolean);
    for (const host of hosts) {
      const img = host.querySelector(`${cls} .rafex-report-3d-frame img, ${cls} img`);
      if (img?.src) return { kind: "img", value: img.src };
      const svg = host.querySelector(`${cls} > svg, ${cls} .rafex-report-3d-frame svg`);
      if (svg) return { kind: "svg", value: svg.outerHTML };
    }
    return null;
  }

  function updateEditorArtworkTransform(type) {
    const stage = document.querySelector(`[data-rafex-placement-stage="${type}"]`);
    const art = stage?.querySelector(".rafex-placement-art");
    const value = editorDraft[type];
    if (!stage || !art || !value) return;
    art.style.left = `${50 + value.x}%`;
    art.style.top = `${50 + value.y}%`;
    art.style.transform = `translate(-50%,-50%) scale(${value.scale})`;
    const label = document.querySelector(`[data-rafex-placement-zoom="${type}"]`);
    if (label) label.textContent = `${Math.round(value.scale * 100)}%`;
  }

  function fillEditorArtwork(type) {
    const stage = document.querySelector(`[data-rafex-placement-stage="${type}"]`);
    if (!stage) return false;
    const source = representativeArtwork(type);
    const old = stage.querySelector(".rafex-placement-art, .rafex-placement-empty");
    if (old) old.remove();
    if (!source) {
      const empty = document.createElement("div");
      empty.className = "rafex-placement-empty";
      empty.textContent = "Kesit hazırlanıyor…";
      stage.appendChild(empty);
      return false;
    }
    if (source.kind === "img") {
      const img = document.createElement("img");
      img.className = "rafex-placement-art";
      img.src = source.value;
      img.alt = type === "front" ? "Önden görünüş" : "Yan görünüş";
      img.draggable = false;
      stage.appendChild(img);
    } else {
      const holder = document.createElement("div");
      holder.className = "rafex-placement-art rafex-placement-svg";
      holder.innerHTML = source.value;
      stage.appendChild(holder);
    }
    updateEditorArtworkTransform(type);
    return true;
  }

  function refreshEditorArtwork(attempt = 0) {
    const frontReady = fillEditorArtwork("front");
    const sideReady = fillEditorArtwork("side");
    if ((!frontReady || !sideReady) && attempt < 12) {
      setTimeout(() => refreshEditorArtwork(attempt + 1), 180);
    }
  }

  function changeEditorScale(type, delta) {
    const item = editorDraft[type];
    if (!item) return;
    item.scale = clamp(Math.round((item.scale + delta) * 100) / 100, 0.35, 2.5);
    updateEditorArtworkTransform(type);
  }

  function resetEditorView(type) {
    editorDraft[type] = { ...DEFAULT_PLACEMENT[type] };
    updateEditorArtworkTransform(type);
  }

  function closePlacementEditor(save) {
    const modal = document.getElementById("m2SectionPlacementModal");
    if (!modal) return;
    if (save) {
      placementSettings = normalizedPlacement(editorDraft);
      try { localStorage.setItem(PLACEMENT_KEY, JSON.stringify(placementSettings)); } catch {}
      applyPlacementEverywhere();
    } else {
      editorDraft = copyPlacement(placementSettings);
    }
    modal.hidden = true;
  }

  function openPlacementEditor() {
    const modal = document.getElementById("m2SectionPlacementModal");
    if (!modal) return;
    editorDraft = copyPlacement(placementSettings);
    modal.hidden = false;
    updateEditorArtworkTransform("front");
    updateEditorArtworkTransform("side");

    try {
      if (typeof window.m2RenderCorporateReport === "function") {
        const result = window.m2RenderCorporateReport();
        if (result && typeof result.then === "function") result.finally(() => refreshEditorArtwork());
      }
    } catch {}
    refreshEditorArtwork();
  }

  function installPlacementEditor() {
    if (document.getElementById("m2SectionPlacementButton")) return;
    const headActions = document.querySelector(".m2-report-head-actions");
    const reportType = document.getElementById("m2ReportType");
    const reportTypeLabel = reportType?.closest("label");
    if (!headActions || !reportTypeLabel) return;

    const button = document.createElement("button");
    button.type = "button";
    button.id = "m2SectionPlacementButton";
    button.className = "rafex-section-placement-button";
    button.textContent = "Kesit Yer Belirleme";
    button.addEventListener("click", openPlacementEditor);
    headActions.insertBefore(button, reportTypeLabel);

    const modal = document.createElement("div");
    modal.className = "m2-layout-modal rafex-section-placement-modal";
    modal.id = "m2SectionPlacementModal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="rafex-section-placement-dialog" role="dialog" aria-modal="true" aria-labelledby="rafexSectionPlacementTitle">
        <div class="rafex-section-placement-head">
          <div><b id="rafexSectionPlacementTitle">Kesit Yer Belirleme</b><small>Kesiti fareyle sürükle. Mouse tekeriyle büyüt / küçült.</small></div>
          <button type="button" data-rafex-placement-close aria-label="Kapat">×</button>
        </div>
        <div class="rafex-section-placement-grid">
          <section class="rafex-placement-card rafex-placement-card-front">
            <b>ÖNDEN GÖRÜNÜŞ</b>
            <div class="rafex-placement-stage" data-rafex-placement-stage="front"><div class="rafex-placement-empty">Kesit hazırlanıyor…</div></div>
            <div class="rafex-placement-controls">
              <span>Sürükle · Tekerlek</span>
              <button type="button" data-rafex-zoom-out="front">−</button>
              <strong data-rafex-placement-zoom="front">100%</strong>
              <button type="button" data-rafex-zoom-in="front">+</button>
              <button type="button" data-rafex-reset="front">Sıfırla</button>
            </div>
          </section>
          <section class="rafex-placement-card rafex-placement-card-side">
            <b>YAN GÖRÜNÜŞ</b>
            <div class="rafex-placement-stage" data-rafex-placement-stage="side"><div class="rafex-placement-empty">Kesit hazırlanıyor…</div></div>
            <div class="rafex-placement-controls">
              <span>Sürükle · Tekerlek</span>
              <button type="button" data-rafex-zoom-out="side">−</button>
              <strong data-rafex-placement-zoom="side">100%</strong>
              <button type="button" data-rafex-zoom-in="side">+</button>
              <button type="button" data-rafex-reset="side">Sıfırla</button>
            </div>
          </section>
        </div>
        <div class="rafex-section-placement-actions">
          <button type="button" data-rafex-placement-reset-all>Varsayılana Dön</button>
          <span></span>
          <button type="button" data-rafex-placement-cancel>Vazgeç</button>
          <button type="button" class="rafex-placement-save" data-rafex-placement-save>Kaydet</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelector("[data-rafex-placement-close]")?.addEventListener("click", () => closePlacementEditor(false));
    modal.querySelector("[data-rafex-placement-cancel]")?.addEventListener("click", () => closePlacementEditor(false));
    modal.querySelector("[data-rafex-placement-save]")?.addEventListener("click", () => closePlacementEditor(true));
    modal.querySelector("[data-rafex-placement-reset-all]")?.addEventListener("click", () => {
      editorDraft = copyPlacement(DEFAULT_PLACEMENT);
      updateEditorArtworkTransform("front");
      updateEditorArtworkTransform("side");
    });

    ["front", "side"].forEach((type) => {
      modal.querySelector(`[data-rafex-zoom-out="${type}"]`)?.addEventListener("click", () => changeEditorScale(type, -0.08));
      modal.querySelector(`[data-rafex-zoom-in="${type}"]`)?.addEventListener("click", () => changeEditorScale(type, 0.08));
      modal.querySelector(`[data-rafex-reset="${type}"]`)?.addEventListener("click", () => resetEditorView(type));
      const stage = modal.querySelector(`[data-rafex-placement-stage="${type}"]`);
      if (!stage) return;

      stage.addEventListener("wheel", (event) => {
        event.preventDefault();
        changeEditorScale(type, event.deltaY < 0 ? 0.06 : -0.06);
      }, { passive: false });

      let drag = null;
      stage.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        stage.setPointerCapture?.(event.pointerId);
        drag = {
          pointerId: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          x: editorDraft[type].x,
          y: editorDraft[type].y,
        };
        stage.classList.add("is-dragging");
      });
      stage.addEventListener("pointermove", (event) => {
        if (!drag || drag.pointerId !== event.pointerId) return;
        const rect = stage.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        editorDraft[type].x = clamp(drag.x + ((event.clientX - drag.startX) / rect.width) * 100, -80, 80);
        editorDraft[type].y = clamp(drag.y + ((event.clientY - drag.startY) / rect.height) * 100, -80, 80);
        updateEditorArtworkTransform(type);
      });
      const endDrag = (event) => {
        if (!drag || drag.pointerId !== event.pointerId) return;
        drag = null;
        stage.classList.remove("is-dragging");
      };
      stage.addEventListener("pointerup", endDrag);
      stage.addEventListener("pointercancel", endDrag);
    });

    modal.addEventListener("pointerdown", (event) => {
      if (event.target === modal) closePlacementEditor(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) closePlacementEditor(false);
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
      .rafex-combined-type-page .m2-corporate-view>.rafex-report-3d-frame {grid-row:2!important;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;display:block!important;overflow:hidden!important;padding:0!important;position:relative!important}
      .rafex-combined-type-page .m2-corporate-view>.rafex-report-3d-frame img {display:block!important;position:absolute!important;left:calc(50% + var(--rafex-section-x,0%))!important;top:calc(50% + var(--rafex-section-y,0%))!important;width:auto!important;height:90%!important;max-width:none!important;max-height:none!important;object-fit:contain!important;object-position:center center!important;transform:translate(-50%,-50%) scale(var(--rafex-section-scale,1))!important;transform-origin:center center!important}
      .rafex-combined-type-page .m2-corporate-view>svg {grid-row:2!important;position:absolute!important;left:calc(50% + var(--rafex-section-x,0%))!important;top:calc(50% + var(--rafex-section-y,0%))!important;width:auto!important;height:90%!important;max-width:none!important;max-height:none!important;transform:translate(-50%,-50%) scale(var(--rafex-section-scale,1))!important;transform-origin:center center!important}

      .rafex-section-placement-button {padding:9px 11px!important;background:#173c2d!important;color:#fff!important;border:1px solid #173c2d!important;border-radius:8px!important;white-space:nowrap!important}
      .rafex-section-placement-button:hover {background:#214f3b!important}
      .rafex-section-placement-modal {z-index:12000!important;display:grid!important;place-items:center!important;padding:18px!important;background:#07150e99!important}
      .rafex-section-placement-modal[hidden] {display:none!important}
      .rafex-section-placement-dialog {width:min(920px,96vw);max-height:92vh;overflow:auto;background:#fff;border:1px solid #d9e2dc;border-radius:15px;box-shadow:0 28px 80px #07150e55;padding:14px}
      .rafex-section-placement-head {display:flex;align-items:center;justify-content:space-between;gap:12px;padding:2px 2px 12px}
      .rafex-section-placement-head b {display:block;font-size:16px;color:#173c2d}
      .rafex-section-placement-head small {display:block;margin-top:4px;color:#68736c;font-size:10px}
      .rafex-section-placement-head>button {width:32px;height:32px;padding:0;background:#edf2ee;color:#173c2d;font-size:20px}
      .rafex-section-placement-grid {display:grid;grid-template-columns:minmax(0,1.32fr) minmax(230px,.68fr);gap:10px;align-items:stretch}
      .rafex-placement-card {min-width:0;border:1px solid #dfe5e0;border-radius:11px;overflow:hidden;background:#f8faf8}
      .rafex-placement-card>b {display:block;padding:8px 10px;background:#dceaf1;color:#0b2b45;text-align:center;font-size:10px}
      .rafex-placement-stage {position:relative;height:min(58vh,560px);min-height:360px;overflow:hidden;background:#fff;cursor:grab;touch-action:none;user-select:none;border-bottom:1px solid #e2e8e4}
      .rafex-placement-stage.is-dragging {cursor:grabbing}
      .rafex-placement-art {position:absolute;left:50%;top:50%;height:90%;width:auto;max-width:none;max-height:none;transform:translate(-50%,-50%);transform-origin:center center;pointer-events:none;user-select:none}
      .rafex-placement-svg svg {display:block;height:100%;width:auto;max-width:none;max-height:none}
      .rafex-placement-empty {position:absolute;inset:0;display:grid;place-items:center;color:#849087;font-size:11px;pointer-events:none}
      .rafex-placement-controls {display:grid;grid-template-columns:1fr 32px 58px 32px auto;gap:6px;align-items:center;padding:8px;background:#f5f7f5}
      .rafex-placement-controls span {color:#68736c;font-size:9px}
      .rafex-placement-controls button {padding:7px 8px;background:#e8eeea;color:#173c2d;border-radius:7px}
      .rafex-placement-controls strong {font-size:10px;text-align:center;color:#173c2d}
      .rafex-section-placement-actions {display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:center;padding-top:12px}
      .rafex-section-placement-actions button {padding:9px 12px;background:#edf2ee;color:#173c2d}
      .rafex-section-placement-actions .rafex-placement-save {background:#173c2d;color:#fff}
      @media(max-width:760px){.rafex-section-placement-grid{grid-template-columns:1fr}.rafex-placement-stage{height:380px;min-height:300px}.rafex-placement-controls{grid-template-columns:1fr 32px 52px 32px auto}}
    `;
    document.head.appendChild(style);
  }

  function installHooks() {
    installCalculationOptionsBridge();
    if (typeof window.m2RenderCorporateReport === "function" && !window.m2RenderCorporateReport.__rafexCombinedTypesV15) {
      const previousRender = window.m2RenderCorporateReport;
      const wrappedRender = function (...args) {
        installCalculationOptionsBridge();
        const result = previousRender.apply(this, args);
        installAdaptiveCaptureZoom();
        arrangeTypePages(document.getElementById("m2CorporatePreview"));
        if (result && typeof result.then === "function") {
          result.finally(() => arrangeTypePages(document.getElementById("m2CorporatePreview")));
        }
        return result;
      };
      wrappedRender.__rafexCombinedTypesV15 = true;
      window.m2RenderCorporateReport = wrappedRender;
    }

    const previousPrepare = window.__rafexPrepareCorporatePrint;
    if (typeof previousPrepare === "function" && !previousPrepare.__rafexCombinedTypesV15) {
      const wrappedPrepare = async function (...args) {
        installCalculationOptionsBridge();
        installAdaptiveCaptureZoom();
        await previousPrepare.apply(this, args);
        arrangeTypePages(document.getElementById("m2CorporatePrint"));
        arrangeTypePages(document.getElementById("m2CorporatePreview"));
      };
      wrappedPrepare.__rafexCombinedTypesV15 = true;
      window.__rafexPrepareCorporatePrint = wrappedPrepare;
    }
  }

  installStyles();
  installCalculationOptionsBridge();
  installAdaptiveCaptureZoom();
  installCustomizationTypeRules();
  installHooks();
  installPlacementEditor();
  applyPlacementEverywhere();
})();