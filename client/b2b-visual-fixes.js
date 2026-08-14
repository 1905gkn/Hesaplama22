(() => {
  const localFmt = (value) => {
    try { return typeof fmt === "function" ? fmt(Math.round(Number(value) || 0)) : Math.round(Number(value) || 0).toLocaleString("tr-TR"); }
    catch { return String(Math.round(Number(value) || 0)); }
  };

  function b2bVisualState(drawing) {
    const state = drawing?.b2b || {};
    const layout = drawing?.b2bLayout || {};
    const rowCount = state.rowType === "double" || Number(layout.rowCount) === 2 ? 2 : 1;
    const palletDepth = Math.max(500, Number(state.palletDepth || layout.palletDepth || drawing?.palD) || 1200);
    const overhang = Math.max(0, Number(state.palletOverhang ?? layout.palletOverhang) || 50);
    const frameDepth = Math.max(500, Number(layout.frameDepth) || palletDepth - overhang * 2);
    const rowGap = Math.max(0, Number(state.rowGap ?? layout.rowGap) || 200);
    const levels = Math.max(1, Number(drawing?.levels || state.levels) || 1);
    const uprightHeight = Math.max(1000, Number(drawing?.sideUprightHeight || drawing?.totalRackHeight || state.footHeight) || 5000);
    const palletCount = Math.max(1, Math.min(4, Number(state.palletCount || layout.palletCount) || 3));
    const palletWidth = Math.max(300, Number(state.palletWidth || layout.palletWidth || drawing?.palW) || 800);
    const sectionWidth = Math.max(1200, Number(layout.sectionWidth) || palletCount * palletWidth + (palletCount + 1) * 75);
    const tiePlan = typeof b2bStraightTiePlan === "function"
      ? b2bStraightTiePlan(drawing)
      : { count: rowCount === 2 ? (uprightHeight <= 2000 ? 1 : uprightHeight <= 5000 ? 2 : uprightHeight <= 7000 ? 3 : uprightHeight <= 10000 ? 4 : 5) : 0, length: rowGap, width: 200, positions: [] };
    return { state, layout, rowCount, frameDepth, rowGap, levels, uprightHeight, palletCount, palletWidth, sectionWidth, tiePlan };
  }

  function b2bRackSideBody(x, width, top, bottom, levels, side) {
    const innerX = side === "left" ? x + width : x;
    const outerX = side === "left" ? x : x + width;
    const height = bottom - top;
    const uprightW = 10;
    const beamH = 7;
    let html = `<g class="rafex-b2b-complete-rack" data-product-side="${side}">`;
    html += `<rect x="${x}" y="${top}" width="${width}" height="${height}" rx="2" fill="#fafafa" stroke="#9aa4a8" stroke-width="1"/>`;
    html += `<rect x="${outerX - uprightW / 2}" y="${top}" width="${uprightW}" height="${height}" rx="2" fill="#b9c0c3" stroke="#596368" stroke-width="2"/>`;
    html += `<rect x="${innerX - uprightW / 2}" y="${top}" width="${uprightW}" height="${height}" rx="2" fill="#b9c0c3" stroke="#596368" stroke-width="2"/>`;
    const nodeCount = Math.max(4, Math.ceil(height / 62));
    let diagonal = "";
    for (let node = 0; node <= nodeCount; node += 1) {
      const y = bottom - (height * node / nodeCount);
      const px = node % 2 === 0 ? outerX : innerX;
      diagonal += `${node ? "L" : "M"}${px} ${y}`;
    }
    html += `<path d="${diagonal}" fill="none" stroke="#90999d" stroke-width="5" stroke-linecap="square" stroke-linejoin="miter"/>`;
    html += `<line x1="${outerX}" y1="${bottom - 6}" x2="${innerX}" y2="${bottom - 6}" stroke="#90999d" stroke-width="5"/>`;
    html += `<line x1="${outerX}" y1="${top + 6}" x2="${innerX}" y2="${top + 6}" stroke="#90999d" stroke-width="5"/>`;
    for (let level = 0; level < levels; level += 1) {
      const y = bottom - 28 - (height - 54) * (level / Math.max(1, levels - 1));
      const loadW = Math.max(54, width - 38);
      const loadH = Math.max(26, Math.min(48, height / Math.max(6, levels + 3)));
      const loadX = side === "left" ? x + 12 : x + width - loadW - 12;
      html += `<rect x="${x + 3}" y="${y}" width="${width - 6}" height="${beamH}" rx="2" fill="#e5bd00" stroke="#8d7500" stroke-width="1.5"/>`;
      if (typeof m2ShowSidePallets === "undefined" || m2ShowSidePallets !== false) {
        html += `<rect x="${loadX}" y="${y - loadH - 5}" width="${loadW}" height="${loadH}" fill="#e7dfcf" stroke="#807a70" stroke-width="1.5"/>`;
        html += `<rect x="${loadX}" y="${y - 5}" width="${loadW}" height="7" fill="#c58b42" stroke="#744719" stroke-width="1.2"/>`;
      }
    }
    html += `<rect x="${outerX - 15}" y="${bottom - 7}" width="30" height="8" rx="2" fill="#9ea7aa" stroke="#4d575c" stroke-width="1.5"/>`;
    html += `<rect x="${innerX - 15}" y="${bottom - 7}" width="30" height="8" rx="2" fill="#9ea7aa" stroke="#4d575c" stroke-width="1.5"/>`;
    html += `</g>`;
    return { html, innerX, outerX };
  }

  function rafexB2BSideElevationSvg(drawing, labels) {
    const { rowCount, frameDepth, rowGap, levels, uprightHeight, tiePlan } = b2bVisualState(drawing);
    const canvasW = 920, canvasH = 620, top = 72, bottom = 516;
    const rackW = rowCount === 2 ? 300 : 390;
    const visualGap = rowCount === 2 ? Math.max(34, Math.min(72, rackW * rowGap / Math.max(1, frameDepth))) : 0;
    const center = canvasW / 2;
    const leftX = rowCount === 2 ? center - visualGap / 2 - rackW : center - rackW / 2;
    const rightX = center + visualGap / 2;
    const left = b2bRackSideBody(leftX, rackW, top, bottom, levels, "left");
    let bodies = left.html, right = null;
    if (rowCount === 2) { right = b2bRackSideBody(rightX, rackW, top, bottom, levels, "right"); bodies += right.html; }
    let ties = "";
    if (rowCount === 2 && right && Number(tiePlan.count) > 0) {
      const count = Math.max(1, Number(tiePlan.count) || 1);
      const positions = Array.isArray(tiePlan.positions) && tiePlan.positions.length ? tiePlan.positions : Array.from({ length: count }, (_, index) => uprightHeight * (index + 1) / (count + 1));
      positions.slice(0, count).forEach((mm, index) => {
        const y = bottom - (bottom - top) * Math.max(0, Math.min(1, Number(mm) / Math.max(1, uprightHeight)));
        const x1 = left.innerX, x2 = right.innerX, span = x2 - x1;
        const mountLeft = x1 + 5, mountRight = x2 - 5, mountSpan = mountRight - mountLeft;\n        ties += `<g class="rafex-b2b-straight-tie" data-tie-index="${index + 1}" data-reference-shape="sac-arabag-glb-hole-face-mounted"><rect x="${mountLeft}" y="${y - 7}" width="${mountSpan}" height="14" rx="2" fill="#b8c0c3" stroke="#566168" stroke-width="1.5"/><path d="M${mountLeft + 2} ${y - 3}H${mountRight - 2}M${mountLeft + 2} ${y + 3}H${mountRight - 2}" stroke="#e8edef" stroke-width="1.5"/><rect x="${mountLeft - 7}" y="${y - 16}" width="14" height="32" rx="2" fill="#aeb6b9" stroke="#4e5a60" stroke-width="1.5"/><rect x="${mountRight - 7}" y="${y - 16}" width="14" height="32" rx="2" fill="#aeb6b9" stroke="#4e5a60" stroke-width="1.5"/><circle cx="${mountLeft}" cy="${y - 7}" r="2.4" fill="#344047"/><circle cx="${mountLeft}" cy="${y + 7}" r="2.4" fill="#344047"/><circle cx="${mountRight}" cy="${y - 7}" r="2.4" fill="#344047"/><circle cx="${mountRight}" cy="${y + 7}" r="2.4" fill="#344047"/></g>`;
      });
    }
    const totalDepth = rowCount === 2 ? frameDepth * 2 + rowGap : frameDepth;
    const dimensionText = rowCount === 2 ? `${localFmt(frameDepth)} + ${localFmt(rowGap)} + ${localFmt(frameDepth)} = ${localFmt(totalDepth)} mm` : `${localFmt(frameDepth)} mm`;
    const title = rowCount === 2 ? "YANDAN GÖRÜNÜŞ · 2 TAM RAF SIRT SIRTA" : "YANDAN GÖRÜNÜŞ · TEK SIRA";
    const tieText = rowCount === 2 && Number(tiePlan.count) ? `DÜZ ARABAĞ · ${localFmt(tiePlan.length || rowGap)} mm · ${localFmt(tiePlan.count)} KOT` : "";
    return `<svg viewBox="0 0 ${canvasW} ${canvasH}" role="img" data-rafex-side-version="back-to-back-reference-v2" data-row-count="${rowCount}" aria-label="${title}"><style>.rafex-b2b-title{font:900 18px Arial;fill:#1f2933}.rafex-b2b-sub{font:800 11px Arial;fill:#53606a}.rafex-b2b-dim{font:900 12px Arial;fill:#27343d}.rafex-b2b-dim-line{stroke:#303b42;stroke-width:1.5}.rafex-b2b-note{font:800 10px Arial;fill:#52616a}</style><text x="${center}" y="28" text-anchor="middle" class="rafex-b2b-title">${title}</text><text x="${center}" y="48" text-anchor="middle" class="rafex-b2b-sub">3D ile aynı sıra düzeni · iki ürün ayrı konstrüksiyon</text>${bodies}${ties}<line x1="${leftX - 24}" y1="${bottom + 2}" x2="${(rowCount === 2 ? rightX + rackW : leftX + rackW) + 24}" y2="${bottom + 2}" stroke="#313b41" stroke-width="3"/><g><line x1="${leftX}" y1="558" x2="${rowCount === 2 ? rightX + rackW : leftX + rackW}" y2="558" class="rafex-b2b-dim-line"/><line x1="${leftX}" y1="550" x2="${leftX}" y2="566" class="rafex-b2b-dim-line"/><line x1="${rowCount === 2 ? rightX + rackW : leftX + rackW}" y1="550" x2="${rowCount === 2 ? rightX + rackW : leftX + rackW}" y2="566" class="rafex-b2b-dim-line"/><text x="${center}" y="579" text-anchor="middle" class="rafex-b2b-dim">${dimensionText}</text></g>${tieText ? `<text x="${center}" y="603" text-anchor="middle" class="rafex-b2b-note">${tieText}</text>` : ""}</svg>`;
  }

  function rafexB2BFrontElevationSvg(drawing, labels, showVariants) {
    const { rowCount, levels, palletCount, sectionWidth, uprightHeight, tiePlan } = b2bVisualState(drawing);
    const canvasW = 920, canvasH = 600, left = 92, right = 828, top = 76, bottom = 520;
    const width = right - left, height = bottom - top, bayW = width / palletCount;
    let body = "", tieEnds = "";
    if (rowCount === 2) body += `<rect x="${left + 7}" y="${top - 7}" width="${width}" height="${height}" fill="none" stroke="#c4c9cc" stroke-width="5" opacity=".7"/>`;
    for (let column = 0; column <= palletCount; column += 1) {
      const x = left + column * bayW;
      body += `<rect x="${x - 5}" y="${top}" width="10" height="${height}" rx="2" fill="#0b4975" stroke="#063353" stroke-width="1.5"/>`;
    }
    for (let level = 0; level < levels; level += 1) {
      const y = bottom - 25 - (height - 48) * (level / Math.max(1, levels - 1));
      body += `<rect x="${left}" y="${y}" width="${width}" height="8" rx="2" fill="#e5bd00" stroke="#8d7500" stroke-width="1.5"/>`;
      for (let bay = 0; bay < palletCount; bay += 1) {
        const loadX = left + bay * bayW + 10, loadW = Math.max(24, bayW - 20), loadH = Math.max(28, Math.min(48, height / Math.max(6, levels + 3)));
        body += `<rect x="${loadX}" y="${y - loadH - 5}" width="${loadW}" height="${loadH}" fill="#e7dfcf" stroke="#807a70" stroke-width="1.5"/><rect x="${loadX}" y="${y - 5}" width="${loadW}" height="7" fill="#c58b42" stroke="#744719" stroke-width="1.2"/>`;
      }
    }
    if (rowCount === 2 && Number(tiePlan.count) > 0) {
      const count = Math.max(1, Number(tiePlan.count) || 1);
      const positions = Array.isArray(tiePlan.positions) && tiePlan.positions.length ? tiePlan.positions : Array.from({ length: count }, (_, index) => uprightHeight * (index + 1) / (count + 1));
      positions.slice(0, count).forEach((mm, index) => {
        const y = bottom - height * Math.max(0, Math.min(1, Number(mm) / Math.max(1, uprightHeight)));
        for (let column = 0; column <= palletCount; column += 1) {
          const x = left + column * bayW;
          tieEnds += `<g class="rafex-b2b-front-tie-end" data-tie-index="${index + 1}" data-mount="upright-hole-face"><rect x="${x - 11}" y="${y - 15}" width="22" height="30" rx="2" fill="#aeb6b9" stroke="#4e5a60" stroke-width="1.5"/><circle cx="${x}" cy="${y - 7}" r="2.5" fill="#344047"/><circle cx="${x}" cy="${y + 7}" r="2.5" fill="#344047"/></g>`;
        }
      });
    }
    const tieText = rowCount === 2 && Number(tiePlan.count) ? ` · DÜZ ARABAĞ ${localFmt(tiePlan.length || 0)} mm / ${localFmt(tiePlan.count)} KOT` : "";
    return `<svg viewBox="0 0 ${canvasW} ${canvasH}" role="img" data-rafex-front-version="sac-arabag-hole-face-v3" data-row-count="${rowCount}"><style>.rf-title{font:900 18px Arial;fill:#1f2933}.rf-sub{font:800 11px Arial;fill:#53606a}.rf-dim{font:900 12px Arial;fill:#27343d}</style><text x="460" y="28" text-anchor="middle" class="rf-title">ÖNDEN GÖRÜNÜŞ · 3D İLE AYNI MODÜL</text><text x="460" y="48" text-anchor="middle" class="rf-sub">${rowCount === 2 ? "B2B çift sıra · arabağ uç plakaları ayak deliklerinde" : "B2B tek sıra"}</text>${body}${tieEnds}<line x1="${left - 25}" y1="${bottom + 2}" x2="${right + 25}" y2="${bottom + 2}" stroke="#313b41" stroke-width="3"/><text x="460" y="565" text-anchor="middle" class="rf-dim">${localFmt(palletCount)} palet / bölüm · travers ${localFmt(sectionWidth)} mm${tieText}</text></svg>`;
  }

  function refreshLiveSide() {
    try {
      if (typeof m2ActiveModule === "undefined" || m2ActiveModule !== "b2b" || typeof m2LastDrawing === "undefined" || !m2LastDrawing) return;
      const sideHost = document.getElementById("m2Side");
      const frontHost = document.getElementById("m2Front");
      if (sideHost) {
        sideHost.innerHTML = rafexB2BSideElevationSvg(m2LastDrawing);
        sideHost.dataset.rafexReferenceView = "sac-arabag-hole-face-mounted";
      }
      if (frontHost) {
        frontHost.innerHTML = rafexB2BFrontElevationSvg(m2LastDrawing);
        frontHost.dataset.rafexReferenceView = "sac-arabag-end-plates-on-uprights";
      }
      requestAnimationFrame(() => { try { if (typeof m2ApplyViewZoom === "function") { m2ApplyViewZoom("side"); m2ApplyViewZoom("front"); } } catch {} });
    } catch (error) { console.error("B2B referans yan görünüşü oluşturulamadı", error); }
  }

  try { m2B2BSideElevationSvg = rafexB2BSideElevationSvg; } catch {}
  try { m2B2BReportPerspectiveSvg = rafexB2BFrontElevationSvg; } catch {}
  window.rafexB2BReferenceSideSvg = rafexB2BSideElevationSvg;
  window.rafexB2BReferenceFrontSvg = rafexB2BFrontElevationSvg;
  window.rafexRefreshB2BSideView = refreshLiveSide;

  try {
    const originalRefresh = b2bRefreshSummary;
    b2bRefreshSummary = function (...args) {
      const result = originalRefresh.apply(this, args);
      queueMicrotask(refreshLiveSide);
      return result;
    };
  } catch {}
  try {
    const originalRender = renderB2B;
    renderB2B = function (...args) {
      const result = originalRender.apply(this, args);
      setTimeout(refreshLiveSide, 0);
      return result;
    };
  } catch {}
  try {
    const originalShowView = m2ShowView;
    m2ShowView = function (name, ...args) {
      const result = originalShowView.call(this, name, ...args);
      if (name === "side" || name === "front") queueMicrotask(refreshLiveSide);
      return result;
    };
  } catch {}
  try {
    const originalTogglePallets = m2ToggleSidePallets;
    m2ToggleSidePallets = function (...args) {
      const result = originalTogglePallets.apply(this, args);
      queueMicrotask(refreshLiveSide);
      return result;
    };
  } catch {}

  queueMicrotask(refreshLiveSide);

  const B2B_RELEASE_VERSION = "__B2B_BUILD_VERSION__";
  const B2B_RELEASE_TIME = "__B2B_BUILD_TIME__";
  function rafexB2BReleaseBadge() {
    const top = document.querySelector(".top");
    const page = document.getElementById("page");
    if (!top || !page) return;
    let badge = document.getElementById("rafexB2BReleaseBadge");
    if (!badge) {
      const style = document.createElement("style");
      style.textContent = `
        #rafexB2BReleaseBadge{display:none;align-items:center;gap:10px;margin-left:auto;padding:7px 11px;border:1px solid #d7b8be;border-radius:10px;background:#fff7f8;color:#430c15;line-height:1.15}
        #rafexB2BReleaseBadge b{display:block;font-size:11px}
        #rafexB2BReleaseBadge small{display:block;margin-top:2px;color:#80636a;font-size:9px}
        #rafexB2BReleaseBadge[data-active="true"]{display:flex}
        @media(max-width:720px){#rafexB2BReleaseBadge{padding:6px 8px}#rafexB2BReleaseBadge small{display:none}}
      `;
      document.head.appendChild(style);
      badge = document.createElement("div");
      badge.id = "rafexB2BReleaseBadge";
      badge.innerHTML = `<span>●</span><span><b>Son sürüm · ${B2B_RELEASE_VERSION}</b><small>Yüklenme: ${new Date(B2B_RELEASE_TIME).toLocaleString("tr-TR",{timeZone:"Europe/Istanbul",dateStyle:"short",timeStyle:"medium"})}</small></span>`;
      (top.querySelector(".top-actions") || top).appendChild(badge);
    }
    badge.dataset.active = page.classList.contains("b2b-mode") ? "true" : "false";
  }
  new MutationObserver(rafexB2BReleaseBadge).observe(document.getElementById("page"), { attributes:true, attributeFilter:["class"] });
  queueMicrotask(rafexB2BReleaseBadge);
})();
