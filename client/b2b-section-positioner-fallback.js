(() => {
  if (window.__rafexB2BSectionPositionerFallbackV3) return;
  window.__rafexB2BSectionPositionerFallbackV3 = true;

  const STORAGE_KEY = "rafex_b2b_section_placement_by_section_v2";
  const LEGACY_KEY = "rafex_b2b_section_placement_v1";
  const DEFAULTS = {
    front: { x: 20, y: -20, scale: 1 },
    side: { x: 0, y: 0, scale: 1 },
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const cloneView = (value, fallback) => ({
    x: clamp(number(value?.x, fallback.x), -80, 80),
    y: clamp(number(value?.y, fallback.y), -80, 80),
    scale: clamp(number(value?.scale, fallback.scale), 0.35, 2.5),
  });
  const clonePlacement = (value = DEFAULTS) => ({
    front: cloneView(value.front, DEFAULTS.front),
    side: cloneView(value.side, DEFAULTS.side),
  });
  const safeKey = (value) => String(value || "Kesit").trim().replace(/\s+/g, " ");

  function legacyPlacement() {
    try { return clonePlacement(JSON.parse(localStorage.getItem(LEGACY_KEY) || "{}")); }
    catch { return clonePlacement(DEFAULTS); }
  }

  function loadSettings() {
    const legacy = legacyPlacement();
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const sections = {};
      Object.entries(raw?.sections || {}).forEach(([key, value]) => {
        sections[safeKey(key)] = clonePlacement(value || legacy);
      });
      return { sections, fallback: clonePlacement(raw?.fallback || legacy) };
    } catch {
      return { sections: {}, fallback: legacy };
    }
  }

  let saved = loadSettings();
  let draft = JSON.parse(JSON.stringify(saved));
  let activeKey = "";
  let sectionCache = [];

  function cardIdentity(card, index) {
    const rawTitle = card?.querySelector(":scope > strong")?.textContent || card?.querySelector("strong")?.textContent || `Kesit ${index + 1}`;
    return safeKey(rawTitle);
  }

  function collectSections() {
    const hosts = [document.getElementById("m2CorporatePreview"), document.getElementById("m2CorporatePrint")].filter(Boolean);
    const map = new Map();
    hosts.forEach((host) => {
      [...host.querySelectorAll(".m2-corporate-type-card")].forEach((card, index) => {
        const key = cardIdentity(card, index);
        if (!map.has(key)) map.set(key, { key, label: key, cards: [] });
        map.get(key).cards.push(card);
      });
    });
    sectionCache = [...map.values()];
    return sectionCache;
  }

  function ensureSectionSetting(key) {
    const normalized = safeKey(key);
    if (!draft.sections[normalized]) draft.sections[normalized] = clonePlacement(saved.sections[normalized] || saved.fallback || DEFAULTS);
    return draft.sections[normalized];
  }

  function settingFor(key, source = saved) {
    return clonePlacement(source.sections?.[safeKey(key)] || source.fallback || DEFAULTS);
  }

  function applyCard(card, key, source = saved) {
    const settings = settingFor(key, source);
    const views = [...card.querySelectorAll(":scope > .m2-corporate-view")];
    views.forEach((view, index) => {
      const type = index === 0 ? "front" : "side";
      const value = settings[type];
      view.style.setProperty("--rafex-section-x", `${value.x}%`);
      view.style.setProperty("--rafex-section-y", `${value.y}%`);
      view.style.setProperty("--rafex-section-scale", String(value.scale));
      view.dataset.rafexSectionKey = safeKey(key);
    });
  }

  function applyEverywhere(source = saved) {
    collectSections().forEach((section) => section.cards.forEach((card) => applyCard(card, section.key, source)));
  }

  function artworkFor(sectionKey, type) {
    const section = collectSections().find((item) => item.key === sectionKey);
    if (!section) return null;
    for (const card of section.cards) {
      const views = [...card.querySelectorAll(":scope > .m2-corporate-view")];
      const view = views[type === "front" ? 0 : 1];
      if (!view) continue;
      const img = view.querySelector(".rafex-report-3d-frame img, img");
      if (img?.src) return { kind: "img", value: img.src };
      const svg = view.querySelector(":scope > svg, .rafex-report-3d-frame svg, svg");
      if (svg) return { kind: "svg", value: svg.outerHTML };
    }
    return null;
  }

  function installStyles() {
    if (document.querySelector("style[data-rafex-section-positioner-fallback]")) return;
    const style = document.createElement("style");
    style.dataset.rafexSectionPositionerFallback = "v3";
    style.textContent = `
      .rafex-section-placement-button{padding:9px 11px!important;background:#173c2d!important;color:#fff!important;border:1px solid #173c2d!important;border-radius:8px!important;white-space:nowrap!important;cursor:pointer!important}
      .rafex-section-placement-button:hover{background:#214f3b!important}
      .rafex-section-placement-modal{position:fixed!important;inset:0!important;z-index:12000!important;display:grid!important;place-items:center!important;padding:18px!important;background:#07150e99!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
      .rafex-section-placement-modal[hidden]{display:none!important}
      .rafex-section-placement-dialog{width:min(1120px,97vw);max-height:94vh;overflow:auto;background:#fff;border:1px solid #d9e2dc;border-radius:15px;box-shadow:0 28px 80px #07150e55;padding:14px}
      .rafex-section-placement-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:2px 2px 12px}.rafex-section-placement-head b{display:block;font-size:16px;color:#173c2d}.rafex-section-placement-head small{display:block;margin-top:4px;color:#68736c;font-size:10px}.rafex-section-placement-head>button{width:32px;height:32px;padding:0;background:#edf2ee;color:#173c2d;font-size:20px}
      .rafex-section-editor-shell{display:grid;grid-template-columns:260px minmax(0,1fr);gap:12px;min-height:470px}
      .rafex-section-list-panel{border:1px solid #dfe5e0;border-radius:11px;background:#f8faf8;overflow:hidden}.rafex-section-list-title{padding:10px 11px;background:#173c2d;color:#fff;font-size:11px;font-weight:900}.rafex-section-list-note{padding:8px 10px;color:#68736c;font-size:9px;line-height:1.35;border-bottom:1px solid #e2e8e4}.rafex-section-list{display:flex;flex-direction:column;gap:6px;padding:8px;max-height:62vh;overflow:auto}.rafex-section-list button{display:grid;grid-template-columns:28px 1fr;gap:7px;align-items:center;width:100%;padding:9px;text-align:left;background:#edf2ee;color:#173c2d;border:1px solid transparent;border-radius:8px}.rafex-section-list button.active{background:#fff8d5;border-color:#e5c544}.rafex-section-list button span:first-child{display:grid;place-items:center;width:24px;height:24px;border-radius:999px;background:#173c2d;color:#fff;font-size:9px}.rafex-section-list button b{font-size:10px;line-height:1.25;overflow:hidden;text-overflow:ellipsis}
      .rafex-section-workspace{min-width:0}.rafex-active-section-title{padding:9px 11px;margin-bottom:8px;border:1px solid #dfe5e0;border-radius:9px;background:#f8faf8;color:#173c2d;font-size:11px;font-weight:900}
      .rafex-section-placement-grid{display:grid;grid-template-columns:minmax(0,1.32fr) minmax(230px,.68fr);gap:10px;align-items:stretch}.rafex-placement-card{min-width:0;border:1px solid #dfe5e0;border-radius:11px;overflow:hidden;background:#f8faf8}.rafex-placement-card>b{display:block;padding:8px 10px;background:#dceaf1;color:#0b2b45;text-align:center;font-size:10px}.rafex-placement-stage{position:relative;height:min(55vh,520px);min-height:350px;overflow:hidden;background:#fff;cursor:grab;touch-action:none;user-select:none;border-bottom:1px solid #e2e8e4}.rafex-placement-stage.is-dragging{cursor:grabbing}.rafex-placement-art{position:absolute;left:50%;top:50%;height:90%;width:auto;max-width:none;max-height:none;transform:translate(-50%,-50%);transform-origin:center center;pointer-events:none;user-select:none}.rafex-placement-svg svg{display:block;height:100%;width:auto;max-width:none;max-height:none}.rafex-placement-empty{position:absolute;inset:0;display:grid;place-items:center;color:#849087;font-size:11px;pointer-events:none}.rafex-placement-controls{display:grid;grid-template-columns:1fr 32px 58px 32px auto;gap:6px;align-items:center;padding:8px;background:#f5f7f5}.rafex-placement-controls span{color:#68736c;font-size:9px}.rafex-placement-controls button{padding:7px 8px;background:#e8eeea;color:#173c2d;border-radius:7px}.rafex-placement-controls strong{font-size:10px;text-align:center;color:#173c2d}.rafex-section-placement-actions{display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:center;padding-top:12px}.rafex-section-placement-actions button{padding:9px 12px;background:#edf2ee;color:#173c2d}.rafex-section-placement-actions .rafex-placement-save{background:#173c2d;color:#fff}
      @media(max-width:820px){.rafex-section-editor-shell{grid-template-columns:1fr}.rafex-section-list{max-height:180px}.rafex-section-placement-grid{grid-template-columns:1fr}.rafex-placement-stage{height:360px;min-height:290px}}
    `;
    document.head.appendChild(style);
  }

  function renderSectionList() {
    const list = document.querySelector("[data-rafex-section-list]");
    if (!list) return;
    const sections = collectSections();
    list.innerHTML = "";
    if (!sections.length) {
      list.innerHTML = '<div class="rafex-section-list-note">Serbest yerleşimde kullanılan kesit bulunamadı.</div>';
      return;
    }
    if (!sections.some((item) => item.key === activeKey)) activeKey = sections[0].key;
    sections.forEach((section, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.classList.toggle("active", section.key === activeKey);
      button.innerHTML = `<span>${index + 1}</span><b>${section.label.replace(/[&<>\"]/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'\"':"&quot;"}[ch]))}</b>`;
      button.addEventListener("click", () => selectSection(section.key));
      list.appendChild(button);
    });
  }

  function updateArtwork(type) {
    const stage = document.querySelector(`[data-rafex-placement-stage="${type}"]`);
    const art = stage?.querySelector(".rafex-placement-art");
    if (!stage || !activeKey) return;
    const value = ensureSectionSetting(activeKey)[type];
    if (art) {
      art.style.left = `${50 + value.x}%`;
      art.style.top = `${50 + value.y}%`;
      art.style.transform = `translate(-50%,-50%) scale(${value.scale})`;
    }
    const zoom = document.querySelector(`[data-rafex-placement-zoom="${type}"]`);
    if (zoom) zoom.textContent = `${Math.round(value.scale * 100)}%`;
  }

  function fillArtwork(type) {
    const stage = document.querySelector(`[data-rafex-placement-stage="${type}"]`);
    if (!stage || !activeKey) return false;
    const source = artworkFor(activeKey, type);
    stage.querySelector(".rafex-placement-art, .rafex-placement-empty")?.remove();
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
    updateArtwork(type);
    return true;
  }

  function refreshArtwork(attempt = 0) {
    const frontReady = fillArtwork("front");
    const sideReady = fillArtwork("side");
    if ((!frontReady || !sideReady) && attempt < 14) setTimeout(() => refreshArtwork(attempt + 1), 180);
  }

  function selectSection(key) {
    activeKey = safeKey(key);
    ensureSectionSetting(activeKey);
    const title = document.querySelector("[data-rafex-active-section]");
    if (title) title.textContent = activeKey;
    renderSectionList();
    refreshArtwork();
  }

  function changeScale(type, delta) {
    if (!activeKey) return;
    const value = ensureSectionSetting(activeKey)[type];
    value.scale = clamp(Math.round((value.scale + delta) * 100) / 100, 0.35, 2.5);
    updateArtwork(type);
  }

  function resetView(type) {
    if (!activeKey) return;
    ensureSectionSetting(activeKey)[type] = { ...DEFAULTS[type] };
    updateArtwork(type);
  }

  function closeEditor(saveChanges) {
    const modal = document.getElementById("m2SectionPlacementModal");
    if (!modal) return;
    if (saveChanges) {
      saved = JSON.parse(JSON.stringify(draft));
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch {}
      applyEverywhere(saved);
    } else {
      draft = JSON.parse(JSON.stringify(saved));
      applyEverywhere(saved);
    }
    modal.hidden = true;
  }

  function prepareEditor() {
    saved = loadSettings();
    draft = JSON.parse(JSON.stringify(saved));
    const sections = collectSections();
    activeKey = sections.some((item) => item.key === activeKey) ? activeKey : (sections[0]?.key || "");
    if (activeKey) ensureSectionSetting(activeKey);
    renderSectionList();
    const title = document.querySelector("[data-rafex-active-section]");
    if (title) title.textContent = activeKey || "Kesit yok";
    refreshArtwork();
  }

  function openEditor() {
    const modal = ensureModal();
    if (!modal) return;
    modal.hidden = false;
    const render = window.m2RenderCorporateReport;
    try {
      if (typeof render === "function") {
        const result = render();
        if (result && typeof result.then === "function") result.finally(() => setTimeout(prepareEditor, 0));
        else setTimeout(prepareEditor, 50);
      } else prepareEditor();
    } catch { prepareEditor(); }
  }

  function ensureModal() {
    document.getElementById("m2SectionPlacementModal")?.remove();
    const modal = document.createElement("div");
    modal.className = "m2-layout-modal rafex-section-placement-modal";
    modal.id = "m2SectionPlacementModal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="rafex-section-placement-dialog" role="dialog" aria-modal="true" aria-labelledby="rafexSectionPlacementTitle">
        <div class="rafex-section-placement-head"><div><b id="rafexSectionPlacementTitle">Kesit Yer Belirleme</b><small>Serbest yerleşimde kullanılan kesitlerden birini seç; her kesitin ön ve yan görünüşünü ayrı ayrı taşıyıp büyütebilirsin.</small></div><button type="button" data-rafex-placement-close aria-label="Kapat">×</button></div>
        <div class="rafex-section-editor-shell">
          <aside class="rafex-section-list-panel"><div class="rafex-section-list-title">KULLANILAN KESİTLER</div><div class="rafex-section-list-note">Listeden bir kesit seç. Yaptığın ayar sadece seçili kesite uygulanır.</div><div class="rafex-section-list" data-rafex-section-list></div></aside>
          <div class="rafex-section-workspace"><div class="rafex-active-section-title" data-rafex-active-section>Kesit</div><div class="rafex-section-placement-grid">
            <section class="rafex-placement-card"><b>ÖNDEN GÖRÜNÜŞ</b><div class="rafex-placement-stage" data-rafex-placement-stage="front"><div class="rafex-placement-empty">Kesit hazırlanıyor…</div></div><div class="rafex-placement-controls"><span>Sürükle · Tekerlek</span><button type="button" data-rafex-zoom-out="front">−</button><strong data-rafex-placement-zoom="front">100%</strong><button type="button" data-rafex-zoom-in="front">+</button><button type="button" data-rafex-reset="front">Sıfırla</button></div></section>
            <section class="rafex-placement-card"><b>YAN GÖRÜNÜŞ</b><div class="rafex-placement-stage" data-rafex-placement-stage="side"><div class="rafex-placement-empty">Kesit hazırlanıyor…</div></div><div class="rafex-placement-controls"><span>Sürükle · Tekerlek</span><button type="button" data-rafex-zoom-out="side">−</button><strong data-rafex-placement-zoom="side">100%</strong><button type="button" data-rafex-zoom-in="side">+</button><button type="button" data-rafex-reset="side">Sıfırla</button></div></section>
          </div></div>
        </div>
        <div class="rafex-section-placement-actions"><button type="button" data-rafex-placement-reset-current>Seçili Kesiti Varsayılana Döndür</button><span></span><button type="button" data-rafex-placement-cancel>Vazgeç</button><button type="button" class="rafex-placement-save" data-rafex-placement-save>Kaydet</button></div>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelector("[data-rafex-placement-close]")?.addEventListener("click", () => closeEditor(false));
    modal.querySelector("[data-rafex-placement-cancel]")?.addEventListener("click", () => closeEditor(false));
    modal.querySelector("[data-rafex-placement-save]")?.addEventListener("click", () => closeEditor(true));
    modal.querySelector("[data-rafex-placement-reset-current]")?.addEventListener("click", () => {
      if (!activeKey) return;
      draft.sections[activeKey] = clonePlacement(DEFAULTS);
      refreshArtwork();
    });

    ["front", "side"].forEach((type) => {
      modal.querySelector(`[data-rafex-zoom-out="${type}"]`)?.addEventListener("click", () => changeScale(type, -0.08));
      modal.querySelector(`[data-rafex-zoom-in="${type}"]`)?.addEventListener("click", () => changeScale(type, 0.08));
      modal.querySelector(`[data-rafex-reset="${type}"]`)?.addEventListener("click", () => resetView(type));
      const stage = modal.querySelector(`[data-rafex-placement-stage="${type}"]`);
      if (!stage) return;
      stage.addEventListener("wheel", (event) => { event.preventDefault(); changeScale(type, event.deltaY < 0 ? 0.06 : -0.06); }, { passive: false });
      let drag = null;
      stage.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 || !activeKey) return;
        event.preventDefault();
        stage.setPointerCapture?.(event.pointerId);
        const value = ensureSectionSetting(activeKey)[type];
        drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: value.x, y: value.y };
        stage.classList.add("is-dragging");
      });
      stage.addEventListener("pointermove", (event) => {
        if (!drag || drag.pointerId !== event.pointerId || !activeKey) return;
        const rect = stage.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const value = ensureSectionSetting(activeKey)[type];
        value.x = clamp(drag.x + ((event.clientX - drag.startX) / rect.width) * 100, -80, 80);
        value.y = clamp(drag.y + ((event.clientY - drag.startY) / rect.height) * 100, -80, 80);
        updateArtwork(type);
      });
      const finish = (event) => { if (!drag || drag.pointerId !== event.pointerId) return; drag = null; stage.classList.remove("is-dragging"); };
      stage.addEventListener("pointerup", finish); stage.addEventListener("pointercancel", finish);
    });
    modal.addEventListener("pointerdown", (event) => { if (event.target === modal) closeEditor(false); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modal.hidden) closeEditor(false); });
    return modal;
  }

  function ensureButton() {
    const reportTypeHost = document.getElementById("m2ReportType");
    const reportRoot = document.getElementById("m2CorporatePreview") || document.getElementById("m2CorporatePrint");
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
    } else {
      old.replaceWith(button);
    }
    button.addEventListener("click", openEditor);
    button.dataset.rafexPerSectionPlacement = "v3";
    return true;
  }

  function installRenderWatch() {
    const observer = new MutationObserver(() => {
      if (document.getElementById("m2SectionPlacementModal")?.hidden !== false) applyEverywhere(saved);
    });
    [document.getElementById("m2CorporatePreview"), document.getElementById("m2CorporatePrint")].filter(Boolean).forEach((host) => observer.observe(host, { childList: true, subtree: true }));
  }

  function boot(attempt = 0) {
    installStyles();
    saved = loadSettings();
    draft = JSON.parse(JSON.stringify(saved));
    const ready = ensureButton();
    if (!ready && attempt < 40) return setTimeout(() => boot(attempt + 1), 250);
    document.getElementById("m2SectionPlacementModal")?.remove();
    installRenderWatch();
    setTimeout(() => applyEverywhere(saved), 150);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => boot());
  else boot();
})();
