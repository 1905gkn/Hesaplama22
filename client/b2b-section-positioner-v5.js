(() => {
  if (window.__rafexB2BSectionPositionerFallbackV5) return;
  window.__rafexB2BSectionPositionerFallbackV5 = true;

  const STORAGE_KEY = "rafex_b2b_perspective_by_type_v4";
  const DIMENSION_DEFAULTS = { levels: true, markers: true, eye: true, width: false, depth: true };
  const DEFAULT_VIEW = { x: 0, y: 0, scale: 1, azimuth: 41, elevation: 24, counts: [], showPallets: true, dimensions: DIMENSION_DEFAULTS };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const safeKey = (value) => String(value || "Raf Tipi").trim().replace(/\s+/g, " ");
  const escapeHtml = (value) => String(value || "").replace(/[&<>\"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;" }[ch]));

  function cloneView(value = {}, defaults = DEFAULT_VIEW) {
    const defaultDimensions = { ...DIMENSION_DEFAULTS, ...(defaults.dimensions || {}) };
    return {
      x: clamp(number(value.x, defaults.x), -80, 80),
      y: clamp(number(value.y, defaults.y), -80, 80),
      scale: clamp(number(value.scale, defaults.scale), 0.35, 2.5),
      azimuth: clamp(number(value.azimuth, defaults.azimuth), -180, 180),
      elevation: clamp(number(value.elevation, defaults.elevation), -35, 75),
      counts: Array.isArray(value.counts) ? [...new Set(value.counts.map(Number).filter((n) => n >= 1 && n <= 4))].sort((a, b) => b - a) : [],
      showPallets: value.showPallets !== false,
      dimensions: {
        levels: value.dimensions?.levels ?? defaultDimensions.levels,
        markers: value.dimensions?.markers ?? defaultDimensions.markers,
        eye: value.dimensions?.eye ?? defaultDimensions.eye,
        width: value.dimensions?.width ?? defaultDimensions.width,
        depth: value.dimensions?.depth ?? defaultDimensions.depth,
      },
    };
  }

  function loadSettings() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const sections = {};
      Object.entries(raw?.sections || {}).forEach(([key, value]) => { sections[safeKey(key)] = cloneView(value); });
      return { sections };
    } catch {
      return { sections: {} };
    }
  }

  let saved = loadSettings();
  let draft = JSON.parse(JSON.stringify(saved));
  let activeKey = "";
  let rackTypeCache = [];
  const previewCache = new Map();
  const previewPending = new Map();
  let previewTimer = 0;
  let reportRenderTimer = 0;
  let renderQueued = false;

  function trimPreviewCache() {
    while (previewCache.size > 12) previewCache.delete(previewCache.keys().next().value);
  }

  function palletCountOf(drawing) {
    return clamp(Math.round(number(drawing?.b2bLayout?.palletCount ?? drawing?.b2b?.palletCount ?? drawing?.bays, 3)), 1, 4);
  }

  function collectRackTypes() {
    const groups = new Map();
    try {
      const used = typeof m2CorporateUsedTypes === "function" ? m2CorporateUsedTypes() : [];
      (Array.isArray(used) ? used : []).forEach((entry, index) => {
        const drawing = entry?.drawing || entry;
        if (!drawing) return;
        const label = safeKey(entry?.name || entry?.typeName || entry?.label || `Raf Tipi ${index + 1}`);
        const system = drawing?.b2b?.mr || drawing?.systemType === "mr" || drawing?.b2bLayout?.palletType === "mr" ? "mr" : "b2b";
        if (!groups.has(label)) groups.set(label, { key: label, label, system, entries: new Map(), cards: [] });
        const count = palletCountOf(drawing);
        if (!groups.get(label).entries.has(count)) groups.get(label).entries.set(count, { count, drawing });
      });
    } catch (error) {
      console.warn("Kesit Yer Belirleme kayıtlı raf tiplerini okuyamadı", error);
    }

    const hosts = [document.getElementById("m2CorporatePreview"), document.getElementById("m2CorporatePrint"), document.getElementById("m2CorporatePrintArea")].filter(Boolean);
    hosts.forEach((host) => {
      [...host.querySelectorAll('.m2-corporate-type-card,.rafex-v19-type-card[data-rafex-system="b2b"]')].forEach((card, index) => {
        const rawTitle = card.dataset.rafexTypeName || card.querySelector(":scope > strong > span")?.textContent || card.querySelector(":scope > strong")?.textContent || card.querySelector("strong")?.textContent || `Raf Tipi ${index + 1}`;
        const label = safeKey(rawTitle);
        card.dataset.rafexTypeName = label;
        if (!groups.has(label)) groups.set(label, { key: label, label, entries: new Map(), cards: [] });
        if (!groups.get(label).cards.includes(card)) groups.get(label).cards.push(card);
      });
    });

    rackTypeCache = [...groups.values()].map((group) => ({ ...group, existingCounts: [...group.entries.keys()].sort((a, b) => b - a) }));
    return rackTypeCache;
  }

  function defaultsFor(key) {
    const type = rackTypeCache.find((item) => item.key === safeKey(key)) || collectRackTypes().find((item) => item.key === safeKey(key));
    return cloneView({ ...DEFAULT_VIEW, counts: type?.existingCounts?.length ? type.existingCounts : [3] });
  }

  function ensureSetting(key) {
    const normalized = safeKey(key);
    if (!draft.sections[normalized]) draft.sections[normalized] = cloneView(saved.sections[normalized] || defaultsFor(normalized), defaultsFor(normalized));
    if (!draft.sections[normalized].counts.length) draft.sections[normalized].counts = [...defaultsFor(normalized).counts];
    return draft.sections[normalized];
  }

  function settingFor(key, source = saved) {
    const normalized = safeKey(key);
    const defaults = defaultsFor(normalized);
    const value = cloneView(source.sections?.[normalized] || defaults, defaults);
    if (!value.counts.length) value.counts = [...defaults.counts];
    return value;
  }

  function fallbackViewerOptions(drawing) {
    const state = drawing?.b2b || {};
    const layout = drawing?.b2bLayout || {};
    const count = palletCountOf(drawing);
    const width = Math.max(300, number(layout.palletWidth ?? state.palletWidth ?? drawing?.palW, 800));
    const depth = Math.max(300, number(layout.palletDepth ?? state.palletDepth ?? drawing?.palD, 1200));
    const palletHeight = Math.max(300, number(drawing?.palletHeight ?? state.palletHeight, 1200));
    const levels = Math.max(1, Math.round(number(drawing?.levels ?? state.levels, 4)));
    return {
      moduleCount: 1,
      palletCount: count,
      palletWidth: width,
      palletDepth: depth,
      palletHeight,
      levels,
      rowType: number(layout.rowCount, state.rowType === "double" ? 2 : 1) === 2 ? "double" : "single",
      rowGap: Math.max(0, number(layout.rowGap ?? state.rowGap, 200)),
      palletTraverseGap: Math.max(0, number(state.palletTraverseGap ?? drawing?.clearance, 200)),
      firstPalletPosition: state.firstPalletPosition === "traverse" ? "traverse" : "ground",
      firstFloorGap: Math.max(0, number(state.firstFloorGap, 200)),
      lastPalletOverlap: Math.max(0, number(state.lastPalletOverlap, 600)),
      frontPalletGap: Math.max(0, number(state.palletOverhang ?? layout.palletOverhang, 50)),
      rearPalletGap: Math.max(0, number(state.palletOverhang ?? layout.palletOverhang, 50)),
      traverseHeight: Math.max(50, number(state.traverseHeightOverride ?? state.traverseHeight ?? drawing?.traverseHeight, 140)),
      footHeight: Math.max(500, number(drawing?.sideUprightHeight ?? drawing?.totalRackHeight ?? drawing?.footLy ?? state.footHeight, 0)) || null,
      footWidth: Math.max(60, number(drawing?.footType ?? state.footWidth, 120)),
      showPallets: true,
      footColor: state.footColor || "ral5010",
      traverseColor: state.traverseColor || "ral1007",
      dimensionLabelScale: Math.max(.7, Math.min(1.5, number(state.dimensionTextScale, 1))),
      dimensions: { ...DIMENSION_DEFAULTS },
    };
  }

  function viewerOptions(drawing) {
    try {
      if (typeof m2Rack3DOptions === "function") return { ...fallbackViewerOptions(drawing), ...(m2Rack3DOptions(drawing) || {}), moduleCount: 1 };
    } catch (error) {
      console.warn("Kesit Yer Belirleme 3D seçenekleri okunamadı", error);
    }
    return fallbackViewerOptions(drawing);
  }

  function widthForCount(count, palletWidth) {
    const width = Math.max(300, number(palletWidth, 800));
    return count === 4 && width === 800 ? 3600 : count * width + (count + 1) * 75;
  }

  function optionsForType(type, settings) {
    if (!type?.entries?.size) return null;
    const counts = settings.counts.length ? settings.counts : type.existingCounts;
    const seed = counts.map((count) => type.entries.get(count)).find(Boolean) || [...type.entries.values()][0];
    if (!seed?.drawing) return null;
    const seedOptions = viewerOptions(seed.drawing);
    const moduleOptions = counts.map((count) => {
      const exact = type.entries.get(count);
      const base = exact?.drawing ? viewerOptions(exact.drawing) : { ...seedOptions };
      return {
        ...base,
        moduleCount: 1,
        moduleOptions: null,
        palletCount: count,
        sectionWidth: widthForCount(count, base.palletWidth),
        showPallets: settings.showPallets,
        dimensions: { ...settings.dimensions },
      };
    });
    return {
      ...moduleOptions[0],
      moduleCount: Math.max(1, moduleOptions.length),
      moduleOptions,
      showPallets: settings.showPallets,
      dimensions: { ...settings.dimensions },
    };
  }

  async function capturePerspective(key, source = draft, force = false) {
    const type = rackTypeCache.find((item) => item.key === safeKey(key)) || collectRackTypes().find((item) => item.key === safeKey(key));
    const settings = settingFor(key, source);
    const options = optionsForType(type, settings);
    if (!options) return null;
    const system = type?.system === "mr" ? "mr" : "b2b";
    if (typeof window.rafexLoadViewerOnDemandV3 === "function") await window.rafexLoadViewerOnDemandV3(system);
    if (system === "mr") {
      if (!window.RafexMRViewer?.captureView) return null;
      const seed = [...type.entries.values()][0]?.drawing;
      const config = { ...(seed?.b2b || {}), modules:1, levels:Math.max(1, number(seed?.levels ?? seed?.b2b?.levels, 4)), width:Math.max(300, number(seed?.b2b?.width ?? seed?.palW, 2400)), depth:Math.max(300, number(seed?.b2b?.depth ?? seed?.palD, 800)), dimensions:{ ...settings.dimensions } };
      const signature = JSON.stringify({ key:safeKey(key), system, settings, config });
      if (!force && previewCache.get(key)?.signature === signature) return previewCache.get(key).src;
      const src = await window.RafexMRViewer.captureView(config, { view:"perspective", width:1120, height:900 });
      previewCache.set(key, { signature, src }); trimPreviewCache(); return src;
    }
    if (!window.RafexB2BViewer?.mount) return null;
    const signature = JSON.stringify({ key: safeKey(key), counts: settings.counts, azimuth: settings.azimuth, elevation: settings.elevation, showPallets: settings.showPallets, dimensions: settings.dimensions, options });
    if (!force && previewCache.get(key)?.signature === signature) return previewCache.get(key).src;
    if (previewPending.has(key)) return previewPending.get(key);

    const task = (async () => {
      const width = 1120;
      const height = 900;
      const host = document.createElement("div");
      host.style.cssText = `position:fixed;left:-100000px;top:0;width:${width}px;height:${height}px;overflow:hidden;pointer-events:none;background:#fff`;
      const canvas = document.createElement("canvas");
      canvas.style.cssText = "display:block;width:100%;height:100%";
      host.appendChild(canvas);
      document.body.appendChild(host);
      try {
        const ready = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Perspektif görünüş zaman aşımına uğradı.")), 12000);
          canvas.addEventListener("b2b-viewer-ready", () => { clearTimeout(timeout); resolve(); }, { once: true });
          canvas.addEventListener("b2b-viewer-error", (event) => { clearTimeout(timeout); reject(new Error(event.detail?.message || "Perspektif görünüş oluşturulamadı.")); }, { once: true });
        });
        const viewer = window.RafexB2BViewer.mount(canvas, options);
        await ready;
        viewer?.setView?.("perspective");
        viewer?.setCameraAngles?.(settings.azimuth, settings.elevation);
        viewer?.controls?.update?.();
        viewer?.renderer?.render?.(viewer.scene, viewer.camera);
        const src = canvas.toDataURL("image/webp", 0.9);
        previewCache.set(key, { signature, src });
        trimPreviewCache();
        return src;
      } finally {
        window.RafexB2BViewer?.destroy?.();
        host.remove();
      }
    })().catch((error) => {
      console.error("Kesit Yer Belirleme perspektif görüntüsü hazırlanamadı", error);
      return null;
    }).finally(() => previewPending.delete(key));

    previewPending.set(key, task);
    return task;
  }

  function installStyles() {
    if (document.querySelector("style[data-rafex-section-positioner-fallback-v5]")) return;
    const style = document.createElement("style");
    style.dataset.rafexSectionPositionerFallbackV5 = "v5";
    style.textContent = `
      .rafex-section-placement-button{padding:9px 11px!important;background:#173c2d!important;color:#fff!important;border:1px solid #173c2d!important;border-radius:8px!important;white-space:nowrap!important;cursor:pointer!important}.rafex-section-placement-button:hover{background:#214f3b!important}
      .rafex-section-placement-modal{position:fixed!important;inset:0!important;z-index:12000!important;display:grid!important;place-items:center!important;padding:18px!important;background:#07150e99!important}.rafex-section-placement-modal[hidden]{display:none!important}
      .rafex-section-placement-dialog{width:min(1180px,97vw);max-height:94vh;overflow:auto;background:#fff;border:1px solid #d9e2dc;border-radius:15px;box-shadow:0 28px 80px #07150e55;padding:14px}.rafex-section-placement-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:2px 2px 12px}.rafex-section-placement-head b{display:block;font-size:16px;color:#173c2d}.rafex-section-placement-head small{display:block;margin-top:4px;color:#68736c;font-size:10px}.rafex-section-placement-head>button{width:32px;height:32px;padding:0;background:#edf2ee;color:#173c2d;font-size:20px}
      .rafex-section-editor-shell{display:grid;grid-template-columns:260px minmax(0,1fr);gap:12px;min-height:520px}.rafex-section-list-panel{border:1px solid #dfe5e0;border-radius:11px;background:#f8faf8;overflow:hidden}.rafex-section-list-title{padding:10px 11px;background:#173c2d;color:#fff;font-size:11px;font-weight:900}.rafex-section-list-note{padding:8px 10px;color:#68736c;font-size:9px;line-height:1.35;border-bottom:1px solid #e2e8e4}.rafex-section-list{display:flex;flex-direction:column;gap:6px;padding:8px;max-height:68vh;overflow:auto}.rafex-section-list button{display:grid;grid-template-columns:28px 1fr;gap:7px;align-items:center;width:100%;padding:9px;text-align:left;background:#edf2ee;color:#173c2d;border:1px solid transparent;border-radius:8px}.rafex-section-list button.active{background:#fff8d5;border-color:#e5c544}.rafex-section-list button span:first-child{display:grid;place-items:center;width:24px;height:24px;border-radius:999px;background:#173c2d;color:#fff;font-size:9px}.rafex-section-list button b{font-size:10px;line-height:1.25;overflow:hidden;text-overflow:ellipsis}
      .rafex-section-workspace{min-width:0}.rafex-active-section-title{padding:9px 11px;margin-bottom:8px;border:1px solid #dfe5e0;border-radius:9px;background:#f8faf8;color:#173c2d;font-size:11px;font-weight:900}.rafex-perspective-card{border:1px solid #dfe5e0;border-radius:11px;overflow:hidden;background:#f8faf8}.rafex-perspective-card>b{display:block;padding:8px 10px;background:#dceaf1;color:#0b2b45;text-align:center;font-size:10px}.rafex-placement-stage{position:relative;height:min(56vh,530px);min-height:370px;overflow:hidden;background:#fff;cursor:grab;touch-action:none;user-select:none;border-bottom:1px solid #e2e8e4}.rafex-placement-stage.is-dragging{cursor:grabbing}.rafex-placement-art{position:absolute;left:50%;top:50%;height:92%;width:auto;max-width:none;max-height:none;transform:translate(-50%,-50%);transform-origin:center center;pointer-events:none;user-select:none}.rafex-placement-empty{position:absolute;inset:0;display:grid;place-items:center;color:#849087;font-size:11px;pointer-events:none}.rafex-placement-controls{display:grid;grid-template-columns:auto 32px 58px 32px auto 1fr auto auto auto auto;gap:6px;align-items:center;padding:8px;background:#f5f7f5}.rafex-placement-controls span{color:#68736c;font-size:9px}.rafex-placement-controls button{padding:7px 8px;background:#e8eeea;color:#173c2d;border-radius:7px}.rafex-placement-controls strong{font-size:10px;text-align:center;color:#173c2d}
      .rafex-option-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 11px;background:#fff;border-top:1px solid #e2e8e4}.rafex-option-row>strong{font-size:10px;color:#173c2d;margin-right:3px}.rafex-option-row button{padding:8px 9px;background:#f5f7f5;color:#173c2d;border:1px solid #cfd9d2;border-radius:7px}.rafex-option-row button.active{background:#173c2d;color:#fff;border-color:#173c2d}.rafex-dimension-options label{display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px solid #dfe5e0;border-radius:7px;background:#f8faf8;font-size:9px;font-weight:800;color:#173c2d}.rafex-dimension-options input{accent-color:#173c2d}.rafex-module-selector{display:grid;grid-template-columns:auto repeat(4,54px);gap:8px;align-items:center;padding:11px;background:#fff;border-top:1px solid #e2e8e4}.rafex-module-selector>span{font-size:10px;font-weight:900;color:#173c2d}.rafex-module-count{position:relative;padding:9px 7px!important;border:1px solid #cfd9d2!important;background:#f5f7f5!important;color:#173c2d!important}.rafex-module-count.active{background:#173c2d!important;color:#fff!important;border-color:#173c2d!important}.rafex-module-count.existing:after{content:"";position:absolute;right:5px;top:5px;width:6px;height:6px;border-radius:99px;background:#f2c500}.rafex-section-placement-actions{display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:center;padding-top:12px}.rafex-section-placement-actions button{padding:9px 12px;background:#edf2ee;color:#173c2d}.rafex-section-placement-actions .rafex-placement-save{background:#173c2d;color:#fff}
      .m2-corporate-type-card.rafex-perspective-output .m2-corporate-view[data-rafex-perspective-hidden="1"]{display:none!important}.m2-corporate-type-card.rafex-perspective-output .m2-corporate-view[data-rafex-perspective-primary="1"]{grid-column:1/-1!important;width:100%!important;max-width:none!important}.rafex-perspective-output .rafex-report-3d-frame{width:100%!important;height:100%!important;overflow:hidden!important}.rafex-perspective-output .rafex-report-3d-frame img{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important}.rafex-v19-type-card.rafex-perspective-output>.rafex-v19-view{width:100%!important;height:100%!important}.rafex-v19-type-card.rafex-perspective-output .rafex-v19-visual{min-height:0!important;overflow:hidden!important}
      @media(max-width:820px){.rafex-section-editor-shell{grid-template-columns:1fr}.rafex-section-list{max-height:180px}.rafex-placement-stage{height:360px;min-height:290px}.rafex-placement-controls{grid-template-columns:auto 32px 50px 32px auto}.rafex-module-selector{grid-template-columns:repeat(4,1fr)}.rafex-module-selector>span{grid-column:1/-1}}
    `;
    document.head.appendChild(style);
  }

  function renderSectionList() {
    const list = document.querySelector("[data-rafex-section-list]");
    if (!list) return;
    const sections = collectRackTypes();
    list.innerHTML = "";
    if (!sections.length) {
      list.innerHTML = '<div class="rafex-section-list-note">Kayıtlı raflarda kullanılabilir raf tipi bulunamadı.</div>';
      return;
    }
    if (!sections.some((item) => item.key === activeKey)) activeKey = sections[0].key;
    sections.forEach((section, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.classList.toggle("active", section.key === activeKey);
      button.innerHTML = `<span>${index + 1}</span><b>${escapeHtml(section.label)}</b>`;
      button.addEventListener("click", () => selectSection(section.key));
      list.appendChild(button);
    });
  }

  function renderControls() {
    if (!activeKey) return;
    const type = rackTypeCache.find((item) => item.key === activeKey) || collectRackTypes().find((item) => item.key === activeKey);
    const value = ensureSetting(activeKey);
    document.querySelectorAll("[data-rafex-count]").forEach((button) => {
      const count = Number(button.dataset.rafexCount);
      button.classList.toggle("active", value.counts.includes(count));
      button.classList.toggle("existing", type?.existingCounts?.includes(count));
      button.setAttribute("aria-pressed", value.counts.includes(count) ? "true" : "false");
    });
    document.querySelectorAll("[data-rafex-dimension]").forEach((input) => { input.checked = value.dimensions[input.dataset.rafexDimension] !== false; });
    const pallet = document.querySelector("[data-rafex-pallets]");
    if (pallet) {
      pallet.classList.toggle("active", value.showPallets);
      pallet.setAttribute("aria-pressed", value.showPallets ? "true" : "false");
      pallet.textContent = value.showPallets ? "Paletleri Gizle" : "Paletleri Göster";
    }
  }

  function updateArtwork() {
    const stage = document.querySelector('[data-rafex-placement-stage="perspective"]');
    const art = stage?.querySelector(".rafex-placement-art");
    if (!stage || !activeKey) return;
    const value = ensureSetting(activeKey);
    if (art) {
      art.style.left = `${50 + value.x}%`;
      art.style.top = `${50 + value.y}%`;
      art.style.transform = `translate(-50%,-50%) scale(${value.scale})`;
    }
    const zoom = document.querySelector('[data-rafex-placement-zoom="perspective"]');
    if (zoom) zoom.textContent = `${Math.round(value.scale * 100)}%`;
    const angles = document.querySelector("[data-rafex-angle-label]");
    if (angles) angles.textContent = `${Math.round(value.azimuth)}° / ${Math.round(value.elevation)}°`;
    renderControls();
  }

  async function fillArtwork(force = false) {
    const stage = document.querySelector('[data-rafex-placement-stage="perspective"]');
    if (!stage || !activeKey) return false;
    const requestKey = activeKey;
    const empty = stage.querySelector(".rafex-placement-empty");
    if (empty) { empty.textContent = "Perspektif hazırlanıyor…"; empty.hidden = false; }
    const src = await capturePerspective(requestKey, draft, force);
    if (!src || requestKey !== activeKey) {
      if (!src && empty) empty.textContent = "Perspektif görünüş hazırlanamadı.";
      return false;
    }
    let image = stage.querySelector("img.rafex-placement-art");
    if (!image) {
      image = document.createElement("img");
      image.className = "rafex-placement-art";
      image.alt = "B2B raf perspektif görünüşü";
      image.draggable = false;
      stage.appendChild(image);
    }
    if (image.src !== src) image.src = src;
    if (empty) empty.hidden = true;
    updateArtwork();
    return true;
  }

  function schedulePreview(force = true, delay = 150) {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => fillArtwork(force), delay);
  }

  function selectSection(key) {
    activeKey = safeKey(key);
    ensureSetting(activeKey);
    const title = document.querySelector("[data-rafex-active-section]");
    if (title) title.textContent = activeKey;
    renderSectionList();
    updateArtwork();
    fillArtwork(false);
  }

  function changeScale(delta) {
    if (!activeKey) return;
    const value = ensureSetting(activeKey);
    value.scale = clamp(Math.round((value.scale + delta) * 100) / 100, 0.35, 2.5);
    updateArtwork();
  }

  function rotateView(azimuthDelta, elevationDelta = 0) {
    if (!activeKey) return;
    const value = ensureSetting(activeKey);
    value.azimuth = clamp(value.azimuth + azimuthDelta, -180, 180);
    value.elevation = clamp(value.elevation + elevationDelta, -35, 75);
    updateArtwork();
    schedulePreview(true, 180);
  }

  function fitCurrent() {
    if (!activeKey) return;
    const value = ensureSetting(activeKey);
    value.x = 0; value.y = 0; value.scale = 1; value.azimuth = 41; value.elevation = 24;
    updateArtwork();
    schedulePreview(true, 80);
  }

  function resetCurrent() {
    if (!activeKey) return;
    draft.sections[activeKey] = defaultsFor(activeKey);
    previewCache.delete(activeKey);
    updateArtwork();
    fillArtwork(true);
  }

  function toggleCount(count) {
    if (!activeKey) return;
    const value = ensureSetting(activeKey);
    if (value.counts.includes(count)) {
      if (value.counts.length === 1) return;
      value.counts = value.counts.filter((item) => item !== count);
    } else value.counts = [...value.counts, count].sort((a, b) => b - a);
    previewCache.delete(activeKey);
    updateArtwork();
    schedulePreview(true, 80);
  }

  function togglePallets() {
    if (!activeKey) return;
    const value = ensureSetting(activeKey);
    value.showPallets = !value.showPallets;
    previewCache.delete(activeKey);
    updateArtwork();
    schedulePreview(true, 80);
  }

  function setAllDimensions(visible) {
    if (!activeKey) return;
    const value = ensureSetting(activeKey);
    Object.keys(value.dimensions).forEach((key) => { value.dimensions[key] = Boolean(visible); });
    previewCache.delete(activeKey);
    updateArtwork();
    schedulePreview(true, 80);
  }

  function changeDimension(key, visible) {
    if (!activeKey || !(key in DIMENSION_DEFAULTS)) return;
    const value = ensureSetting(activeKey);
    value.dimensions[key] = Boolean(visible);
    previewCache.delete(activeKey);
    schedulePreview(true, 80);
  }

  async function applyPerspectiveToCard(card, key, src, source = saved) {
    if (!card || !src) return;
    const settings = settingFor(key, source);
    const views = [...card.querySelectorAll(":scope > .m2-corporate-view,:scope > .rafex-v19-view")];
    const primary = views[0];
    if (!primary) return;
    card.classList.add("rafex-perspective-output");
    primary.dataset.rafexPerspectivePrimary = "1";
    views.slice(1).forEach((view) => { view.dataset.rafexPerspectiveHidden = "1"; view.style.display = "none"; });
    const visualHost = primary.querySelector(":scope > .rafex-v19-visual") || primary;
    let frame = visualHost.querySelector(":scope > .rafex-report-3d-frame");
    if (!frame) {
      visualHost.innerHTML = "";
      frame = document.createElement("div");
      frame.className = "rafex-report-3d-frame";
      visualHost.appendChild(frame);
    }
    let image = frame.querySelector("img");
    if (!image) {
      frame.innerHTML = "";
      image = document.createElement("img");
      image.decoding = "async";
      image.loading = "lazy";
      frame.appendChild(image);
    }
    if (image.src !== src) image.src = src;
    image.alt = `${key} perspektif görünüş`;
    image.style.objectPosition = `${50 + settings.x}% ${50 + settings.y}%`;
    image.style.transform = `scale(${settings.scale})`;
    image.style.transformOrigin = "center center";
  }

  async function renderAllPerspective(source = saved, force = false) {
    if (renderQueued) return;
    const types = collectRackTypes().filter((type) => type.entries.size && type.cards.length);
    if (!types.length) return;
    renderQueued = true;
    try {
      for (const type of types) {
        const src = await capturePerspective(type.key, source, force);
        if (!src) continue;
        for (const card of type.cards) await applyPerspectiveToCard(card, type.key, src, source);
      }
    } finally {
      renderQueued = false;
    }
  }

  // Final PDF builders run after this module. Expose the exact same renderer
  // used by Kesit Yer Belirleme so a later page rebuild can restore the saved
  // camera, dimensions, pallet visibility, position and scale without falling
  // back to a generic rack illustration.
  window.rafexRenderSelectedB2BSections = async function(force = true) {
    saved = loadSettings();
    return renderAllPerspective(saved, force);
  };

  function queueReportRender(source = saved, force = false, delay = 320) {
    clearTimeout(reportRenderTimer);
    reportRenderTimer = setTimeout(() => {
      if (document.getElementById("m2SectionPlacementModal")?.hidden === false) return;
      renderAllPerspective(source, force);
    }, delay);
  }

  function closeEditor(saveChanges) {
    const modal = document.getElementById("m2SectionPlacementModal");
    if (!modal) return;
    if (saveChanges) {
      saved = JSON.parse(JSON.stringify(draft));
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch {}
      modal.hidden = true;
      window.__rafexFreeOutputDirty = true;
    } else {
      draft = JSON.parse(JSON.stringify(saved));
      modal.hidden = true;
    }
  }

  function prepareEditor() {
    saved = loadSettings();
    draft = JSON.parse(JSON.stringify(saved));
    const sections = collectRackTypes();
    activeKey = sections.some((item) => item.key === activeKey) ? activeKey : (sections[0]?.key || "");
    if (activeKey) ensureSetting(activeKey);
    renderSectionList();
    const title = document.querySelector("[data-rafex-active-section]");
    if (title) title.textContent = activeKey || "Raf tipi yok";
    updateArtwork();
    fillArtwork(false);
  }

  function openEditor() {
    const modal = ensureModal();
    if (!modal) return;
    modal.hidden = false;
    try {
      const render = typeof m2RenderCorporateReport === "function" ? m2RenderCorporateReport : null;
      const result = render?.();
      if (result && typeof result.then === "function") result.finally(() => setTimeout(prepareEditor, 0));
      else setTimeout(prepareEditor, 70);
    } catch { prepareEditor(); }
  }

  function ensureModal() {
    const old = document.getElementById("m2SectionPlacementModal");
    if (old) old.remove();
    const modal = document.createElement("div");
    modal.className = "rafex-section-placement-modal";
    modal.id = "m2SectionPlacementModal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="rafex-section-placement-dialog" role="dialog" aria-modal="true" aria-labelledby="rafexSectionPlacementTitle">
        <div class="rafex-section-placement-head"><div><b id="rafexSectionPlacementTitle">Kesit Yer Belirleme</b><small>Kayıtlı raf tipini seç; perspektif, ölçüler, palet görünümü ve modül dağılımını ayrı ayrı kaydet.</small></div><button type="button" data-rafex-placement-close aria-label="Kapat">×</button></div>
        <div class="rafex-section-editor-shell">
          <aside class="rafex-section-list-panel"><div class="rafex-section-list-title">KAYITLI RAF TİPLERİ</div><div class="rafex-section-list-note">Kayıtlı Raflar içindeki raf tipleri burada görünür. Her tipin perspektifi ayrı kaydedilir.</div><div class="rafex-section-list" data-rafex-section-list></div></aside>
          <div class="rafex-section-workspace"><div class="rafex-active-section-title" data-rafex-active-section>Raf Tipi</div>
            <section class="rafex-perspective-card"><b>PERSPEKTİF ÇIKTISI</b><div class="rafex-placement-stage" data-rafex-placement-stage="perspective"><div class="rafex-placement-empty">Perspektif hazırlanıyor…</div></div>
              <div class="rafex-placement-controls"><span>Sürükle · Tekerlek</span><button type="button" data-rafex-zoom-out>−</button><strong data-rafex-placement-zoom="perspective">100%</strong><button type="button" data-rafex-zoom-in>+</button><button type="button" data-rafex-fit>Sığdır</button><span></span><button type="button" data-rafex-rotate-left title="Sola döndür">↺</button><button type="button" data-rafex-rotate-right title="Sağa döndür">↻</button><button type="button" data-rafex-rotate-up title="Yukarıdan bak">↑</button><button type="button" data-rafex-rotate-down title="Aşağıdan bak">↓</button></div>
              <div class="rafex-option-row"><strong>PALETLER</strong><button type="button" data-rafex-pallets>Paletleri Gizle</button></div>
              <div class="rafex-option-row rafex-dimension-options"><strong>ÖLÇÜLERİ GÖSTER</strong><label><input type="checkbox" data-rafex-dimension="levels"> Kat aralıkları ve ilk travers</label><label><input type="checkbox" data-rafex-dimension="markers"> Üst palet kotu ve ayak boyu</label><label><input type="checkbox" data-rafex-dimension="eye"> Göz / travers ölçüsü</label><label><input type="checkbox" data-rafex-dimension="width"> Toplam genişlik</label><label><input type="checkbox" data-rafex-dimension="depth"> Raf derinliği</label><button type="button" data-rafex-dim-all>Hepsini Göster</button><button type="button" data-rafex-dim-none>Hepsini Gizle</button></div>
              <div class="rafex-module-selector"><span>MODÜLLER <small data-rafex-angle-label style="margin-left:8px;color:#68736c">41° / 24°</small></span><button type="button" class="rafex-module-count" data-rafex-count="4">4</button><button type="button" class="rafex-module-count" data-rafex-count="3">3</button><button type="button" class="rafex-module-count" data-rafex-count="2">2</button><button type="button" class="rafex-module-count" data-rafex-count="1">1</button></div>
            </section>
          </div>
        </div>
        <div class="rafex-section-placement-actions"><button type="button" data-rafex-placement-reset-current>Seçili Raf Tipini Varsayılana Döndür</button><span></span><button type="button" data-rafex-placement-cancel>Vazgeç</button><button type="button" class="rafex-placement-save" data-rafex-placement-save>Kaydet</button></div>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelector("[data-rafex-placement-close]")?.addEventListener("click", () => closeEditor(false));
    modal.querySelector("[data-rafex-placement-cancel]")?.addEventListener("click", () => closeEditor(false));
    modal.querySelector("[data-rafex-placement-save]")?.addEventListener("click", () => closeEditor(true));
    modal.querySelector("[data-rafex-placement-reset-current]")?.addEventListener("click", resetCurrent);
    modal.querySelector("[data-rafex-zoom-out]")?.addEventListener("click", () => changeScale(-0.08));
    modal.querySelector("[data-rafex-zoom-in]")?.addEventListener("click", () => changeScale(0.08));
    modal.querySelector("[data-rafex-fit]")?.addEventListener("click", fitCurrent);
    modal.querySelector("[data-rafex-rotate-left]")?.addEventListener("click", () => rotateView(-8, 0));
    modal.querySelector("[data-rafex-rotate-right]")?.addEventListener("click", () => rotateView(8, 0));
    modal.querySelector("[data-rafex-rotate-up]")?.addEventListener("click", () => rotateView(0, 6));
    modal.querySelector("[data-rafex-rotate-down]")?.addEventListener("click", () => rotateView(0, -6));
    modal.querySelector("[data-rafex-pallets]")?.addEventListener("click", togglePallets);
    modal.querySelector("[data-rafex-dim-all]")?.addEventListener("click", () => setAllDimensions(true));
    modal.querySelector("[data-rafex-dim-none]")?.addEventListener("click", () => setAllDimensions(false));
    modal.querySelectorAll("[data-rafex-count]").forEach((button) => button.addEventListener("click", () => toggleCount(Number(button.dataset.rafexCount))));
    modal.querySelectorAll("[data-rafex-dimension]").forEach((input) => input.addEventListener("change", () => changeDimension(input.dataset.rafexDimension, input.checked)));

    const stage = modal.querySelector('[data-rafex-placement-stage="perspective"]');
    stage?.addEventListener("wheel", (event) => { event.preventDefault(); changeScale(event.deltaY < 0 ? 0.06 : -0.06); }, { passive: false });
    let drag = null;
    stage?.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !activeKey) return;
      event.preventDefault();
      stage.setPointerCapture?.(event.pointerId);
      const value = ensureSetting(activeKey);
      drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: value.x, y: value.y };
      stage.classList.add("is-dragging");
    });
    stage?.addEventListener("pointermove", (event) => {
      if (!drag || drag.pointerId !== event.pointerId || !activeKey) return;
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const value = ensureSetting(activeKey);
      value.x = clamp(drag.x + ((event.clientX - drag.startX) / rect.width) * 100, -80, 80);
      value.y = clamp(drag.y + ((event.clientY - drag.startY) / rect.height) * 100, -80, 80);
      updateArtwork();
    });
    const finish = (event) => { if (!drag || drag.pointerId !== event.pointerId) return; drag = null; stage?.classList.remove("is-dragging"); };
    stage?.addEventListener("pointerup", finish);
    stage?.addEventListener("pointercancel", finish);
    modal.addEventListener("pointerdown", (event) => { if (event.target === modal) closeEditor(false); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modal.hidden) closeEditor(false); });
    return modal;
  }

  function ensureButton() {
    const reportTypeHost = document.getElementById("m2ReportType");
    const reportRoot = document.getElementById("m2CorporatePreview") || document.getElementById("m2CorporatePrint") || document.getElementById("m2CorporatePrintArea");
    const actions = document.querySelector(".m2-report-head-actions") || reportTypeHost?.parentElement || reportRoot?.parentElement;
    if (!actions) return false;
    const old = document.getElementById("m2SectionPlacementButton");
    const button = old ? old.cloneNode(true) : document.createElement("button");
    if (!old) {
      button.type = "button";
      button.id = "m2SectionPlacementButton";
      button.className = "rafex-section-placement-button";
      button.textContent = "Kesit Yer Belirleme";
      actions.insertBefore(button, reportTypeHost?.closest("label") || actions.firstChild);
    } else old.replaceWith(button);
    button.addEventListener("click", openEditor);
    button.dataset.rafexPerSectionPlacement = "v5";
    return true;
  }

  function installRenderHooks() {
    if (window.__rafexPerspectiveRenderHooksV5) return;
    window.__rafexPerspectiveRenderHooksV5 = true;
    try {
      const original = m2RenderCorporateReport;
      if (typeof original === "function") {
        m2RenderCorporateReport = function (...args) {
          return original.apply(this, args);
        };
      }
    } catch (error) { console.warn("Perspektif kurumsal çıktı kancası kurulamadı", error); }
    try {
      const originalPrepare = window.__rafexPrepareCorporatePrint;
      window.__rafexPrepareCorporatePrint = async function (...args) {
        if (typeof originalPrepare === "function") await originalPrepare.apply(this, args);
        await renderAllPerspective(saved, false);
      };
    } catch (error) { console.warn("Perspektif yazdırma kancası kurulamadı", error); }
  }

  function boot(attempt = 0) {
    installStyles();
    saved = loadSettings();
    draft = JSON.parse(JSON.stringify(saved));
    const ready = ensureButton();
    if (!ready && attempt < 40) return setTimeout(() => boot(attempt + 1), 250);
    ensureModal();
    installRenderHooks();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => boot());
  else boot();
})();
