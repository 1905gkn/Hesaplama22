(() => {
  if (window.__rafexB2BSectionPositionerFallbackV2) return;
  window.__rafexB2BSectionPositionerFallbackV2 = true;

  const STORAGE_KEY = "rafex_b2b_section_placement_v1";
  const DEFAULTS = {
    front: { x: 20, y: -20, scale: 1 },
    side: { x: 0, y: 0, scale: 1 },
  };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const copy = (value) => ({ front: { ...value.front }, side: { ...value.side } });
  const normalize = (raw = {}) => ({
    front: {
      x: clamp(number(raw.front?.x, DEFAULTS.front.x), -80, 80),
      y: clamp(number(raw.front?.y, DEFAULTS.front.y), -80, 80),
      scale: clamp(number(raw.front?.scale, DEFAULTS.front.scale), 0.35, 2.5),
    },
    side: {
      x: clamp(number(raw.side?.x, DEFAULTS.side.x), -80, 80),
      y: clamp(number(raw.side?.y, DEFAULTS.side.y), -80, 80),
      scale: clamp(number(raw.side?.scale, DEFAULTS.side.scale), 0.35, 2.5),
    },
  });

  const load = () => {
    try { return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")); }
    catch { return normalize(DEFAULTS); }
  };

  let saved = load();
  let draft = copy(saved);

  function installStyles() {
    if (document.querySelector("style[data-rafex-section-positioner-fallback]")) return;
    const style = document.createElement("style");
    style.dataset.rafexSectionPositionerFallback = "v2";
    style.textContent = `
      .rafex-section-placement-button{padding:9px 11px!important;background:#173c2d!important;color:#fff!important;border:1px solid #173c2d!important;border-radius:8px!important;white-space:nowrap!important;cursor:pointer!important}
      .rafex-section-placement-button:hover{background:#214f3b!important}
      .rafex-section-placement-modal{position:fixed!important;inset:0!important;z-index:12000!important;display:grid!important;place-items:center!important;padding:18px!important;background:#07150e99!important}
      .rafex-section-placement-modal[hidden]{display:none!important}
      .rafex-section-placement-dialog{width:min(920px,96vw);max-height:92vh;overflow:auto;background:#fff;border:1px solid #d9e2dc;border-radius:15px;box-shadow:0 28px 80px #07150e55;padding:14px}
      .rafex-section-placement-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:2px 2px 12px}
      .rafex-section-placement-head b{display:block;font-size:16px;color:#173c2d}.rafex-section-placement-head small{display:block;margin-top:4px;color:#68736c;font-size:10px}
      .rafex-section-placement-head>button{width:32px;height:32px;padding:0;background:#edf2ee;color:#173c2d;font-size:20px}
      .rafex-section-placement-grid{display:grid;grid-template-columns:minmax(0,1.32fr) minmax(230px,.68fr);gap:10px;align-items:stretch}
      .rafex-placement-card{min-width:0;border:1px solid #dfe5e0;border-radius:11px;overflow:hidden;background:#f8faf8}.rafex-placement-card>b{display:block;padding:8px 10px;background:#dceaf1;color:#0b2b45;text-align:center;font-size:10px}
      .rafex-placement-stage{position:relative;height:min(58vh,560px);min-height:360px;overflow:hidden;background:#fff;cursor:grab;touch-action:none;user-select:none;border-bottom:1px solid #e2e8e4}.rafex-placement-stage.is-dragging{cursor:grabbing}
      .rafex-placement-art{position:absolute;left:50%;top:50%;height:90%;width:auto;max-width:none;max-height:none;transform:translate(-50%,-50%);transform-origin:center center;pointer-events:none;user-select:none}.rafex-placement-svg svg{display:block;height:100%;width:auto;max-width:none;max-height:none}
      .rafex-placement-empty{position:absolute;inset:0;display:grid;place-items:center;color:#849087;font-size:11px;pointer-events:none}
      .rafex-placement-controls{display:grid;grid-template-columns:1fr 32px 58px 32px auto;gap:6px;align-items:center;padding:8px;background:#f5f7f5}.rafex-placement-controls span{color:#68736c;font-size:9px}.rafex-placement-controls button{padding:7px 8px;background:#e8eeea;color:#173c2d;border-radius:7px}.rafex-placement-controls strong{font-size:10px;text-align:center;color:#173c2d}
      .rafex-section-placement-actions{display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:center;padding-top:12px}.rafex-section-placement-actions button{padding:9px 12px;background:#edf2ee;color:#173c2d}.rafex-section-placement-actions .rafex-placement-save{background:#173c2d;color:#fff}
      @media(max-width:760px){.rafex-section-placement-grid{grid-template-columns:1fr}.rafex-placement-stage{height:380px;min-height:300px}.rafex-placement-controls{grid-template-columns:1fr 32px 52px 32px auto}}
    `;
    document.head.appendChild(style);
  }

  function applyPlacement() {
    const apply = (selector, value) => {
      document.querySelectorAll(selector).forEach((view) => {
        view.style.setProperty("--rafex-section-x", `${value.x}%`);
        view.style.setProperty("--rafex-section-y", `${value.y}%`);
        view.style.setProperty("--rafex-section-scale", String(value.scale));
      });
    };
    apply(".rafex-front-view", saved.front);
    apply(".rafex-side-view", saved.side);
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

  function updateArtwork(type) {
    const stage = document.querySelector(`[data-rafex-placement-stage="${type}"]`);
    const art = stage?.querySelector(".rafex-placement-art");
    const value = draft[type];
    if (!stage || !value) return;
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
    if (!stage) return false;
    const source = representativeArtwork(type);
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

  function changeScale(type, delta) {
    draft[type].scale = clamp(Math.round((draft[type].scale + delta) * 100) / 100, 0.35, 2.5);
    updateArtwork(type);
  }

  function closeEditor(saveChanges) {
    const modal = document.getElementById("m2SectionPlacementModal");
    if (!modal) return;
    if (saveChanges) {
      saved = normalize(draft);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch {}
      applyPlacement();
    } else {
      draft = copy(saved);
    }
    modal.hidden = true;
  }

  function openEditor() {
    const modal = ensureModal();
    if (!modal) return;
    saved = load();
    draft = copy(saved);
    modal.hidden = false;
    updateArtwork("front");
    updateArtwork("side");
    try {
      if (typeof window.m2RenderCorporateReport === "function") {
        const result = window.m2RenderCorporateReport();
        if (result && typeof result.then === "function") result.finally(() => refreshArtwork());
      }
    } catch {}
    refreshArtwork();
  }

  function ensureModal() {
    let modal = document.getElementById("m2SectionPlacementModal");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.className = "m2-layout-modal rafex-section-placement-modal";
    modal.id = "m2SectionPlacementModal";
    modal.hidden = true;
    modal.innerHTML = `
      <div class="rafex-section-placement-dialog" role="dialog" aria-modal="true" aria-labelledby="rafexSectionPlacementTitle">
        <div class="rafex-section-placement-head"><div><b id="rafexSectionPlacementTitle">Kesit Yer Belirleme</b><small>Kesiti fareyle sürükle. Mouse tekeriyle büyüt / küçült.</small></div><button type="button" data-rafex-placement-close aria-label="Kapat">×</button></div>
        <div class="rafex-section-placement-grid">
          <section class="rafex-placement-card"><b>ÖNDEN GÖRÜNÜŞ</b><div class="rafex-placement-stage" data-rafex-placement-stage="front"><div class="rafex-placement-empty">Kesit hazırlanıyor…</div></div><div class="rafex-placement-controls"><span>Sürükle · Tekerlek</span><button type="button" data-rafex-zoom-out="front">−</button><strong data-rafex-placement-zoom="front">100%</strong><button type="button" data-rafex-zoom-in="front">+</button><button type="button" data-rafex-reset="front">Sıfırla</button></div></section>
          <section class="rafex-placement-card"><b>YAN GÖRÜNÜŞ</b><div class="rafex-placement-stage" data-rafex-placement-stage="side"><div class="rafex-placement-empty">Kesit hazırlanıyor…</div></div><div class="rafex-placement-controls"><span>Sürükle · Tekerlek</span><button type="button" data-rafex-zoom-out="side">−</button><strong data-rafex-placement-zoom="side">100%</strong><button type="button" data-rafex-zoom-in="side">+</button><button type="button" data-rafex-reset="side">Sıfırla</button></div></section>
        </div>
        <div class="rafex-section-placement-actions"><button type="button" data-rafex-placement-reset-all>Varsayılana Dön</button><span></span><button type="button" data-rafex-placement-cancel>Vazgeç</button><button type="button" class="rafex-placement-save" data-rafex-placement-save>Kaydet</button></div>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelector("[data-rafex-placement-close]")?.addEventListener("click", () => closeEditor(false));
    modal.querySelector("[data-rafex-placement-cancel]")?.addEventListener("click", () => closeEditor(false));
    modal.querySelector("[data-rafex-placement-save]")?.addEventListener("click", () => closeEditor(true));
    modal.querySelector("[data-rafex-placement-reset-all]")?.addEventListener("click", () => {
      draft = copy(DEFAULTS);
      updateArtwork("front"); updateArtwork("side");
    });

    ["front", "side"].forEach((type) => {
      modal.querySelector(`[data-rafex-zoom-out="${type}"]`)?.addEventListener("click", () => changeScale(type, -0.08));
      modal.querySelector(`[data-rafex-zoom-in="${type}"]`)?.addEventListener("click", () => changeScale(type, 0.08));
      modal.querySelector(`[data-rafex-reset="${type}"]`)?.addEventListener("click", () => { draft[type] = { ...DEFAULTS[type] }; updateArtwork(type); });
      const stage = modal.querySelector(`[data-rafex-placement-stage="${type}"]`);
      if (!stage) return;
      stage.addEventListener("wheel", (event) => { event.preventDefault(); changeScale(type, event.deltaY < 0 ? 0.06 : -0.06); }, { passive: false });
      let drag = null;
      stage.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        stage.setPointerCapture?.(event.pointerId);
        drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: draft[type].x, y: draft[type].y };
        stage.classList.add("is-dragging");
      });
      stage.addEventListener("pointermove", (event) => {
        if (!drag || drag.pointerId !== event.pointerId) return;
        const rect = stage.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        draft[type].x = clamp(drag.x + ((event.clientX - drag.startX) / rect.width) * 100, -80, 80);
        draft[type].y = clamp(drag.y + ((event.clientY - drag.startY) / rect.height) * 100, -80, 80);
        updateArtwork(type);
      });
      const finish = (event) => {
        if (!drag || drag.pointerId !== event.pointerId) return;
        drag = null; stage.classList.remove("is-dragging");
      };
      stage.addEventListener("pointerup", finish); stage.addEventListener("pointercancel", finish);
    });

    modal.addEventListener("pointerdown", (event) => { if (event.target === modal) closeEditor(false); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modal.hidden) closeEditor(false); });
    return modal;
  }

  function ensureButton() {
    const actions = document.querySelector(".m2-report-head-actions");
    if (!actions) return false;
    let button = document.getElementById("m2SectionPlacementButton");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.id = "m2SectionPlacementButton";
      button.className = "rafex-section-placement-button";
      button.textContent = "Kesit Yer Belirleme";
      const reportType = document.getElementById("m2ReportType");
      const label = reportType?.closest("label") || [...actions.querySelectorAll("label")].find((node) => /çıktı\s*tipi/i.test(node.textContent || ""));
      actions.insertBefore(button, label || actions.firstChild);
    }
    if (button.dataset.rafexPlacementFallbackBound !== "v2") {
      button.dataset.rafexPlacementFallbackBound = "v2";
      button.addEventListener("click", openEditor);
    }
    ensureModal();
    return true;
  }

  function wrapReportHook(name, marker) {
    const current = window[name];
    if (typeof current !== "function" || current[marker]) return;
    const wrapped = function (...args) {
      const result = current.apply(this, args);
      const finish = () => { setTimeout(applyPlacement, 0); };
      if (result && typeof result.then === "function") result.finally(finish);
      else finish();
      return result;
    };
    wrapped[marker] = true;
    wrapped.__rafexOriginal = current;
    window[name] = wrapped;
  }

  function install() {
    installStyles();
    ensureButton();
    wrapReportHook("m2RenderCorporateReport", "__rafexPlacementFallbackRenderV2");
    wrapReportHook("__rafexPrepareCorporatePrint", "__rafexPlacementFallbackPrintV2");
    applyPlacement();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();

  const observer = new MutationObserver(() => install());
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
