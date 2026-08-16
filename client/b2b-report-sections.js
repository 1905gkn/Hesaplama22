(() => {
  const VERSION = "corporate-type-sections-v1";

  function typeTitle(card) {
    return String(card?.querySelector(":scope > strong > span")?.textContent || "").trim();
  }

  function updatePageHeader(page, title) {
    if (!title) return;
    const header = page.querySelector(":scope > .m2-corporate-page-header b");
    if (header) header.textContent = `KESİTLER · ${title}`;
  }

  function markSingleTypePage(page) {
    page.classList.add("rafex-single-type-page");
    const card = page.querySelector(":scope > .m2-corporate-type-grid > .m2-corporate-type-card");
    updatePageHeader(page, typeTitle(card));
  }

  function splitTypePages(host) {
    if (!host) return;
    const pages = [...host.querySelectorAll(":scope > .m2-corporate-page")];
    pages.forEach((page) => {
      const grid = page.querySelector(":scope > .m2-corporate-type-grid");
      if (!grid) return;
      const cards = [...grid.querySelectorAll(":scope > .m2-corporate-type-card")];
      if (!cards.length) return;
      if (cards.length === 1) {
        markSingleTypePage(page);
        return;
      }

      const replacements = cards.map((_, keepIndex) => {
        const clone = page.cloneNode(true);
        const cloneGrid = clone.querySelector(":scope > .m2-corporate-type-grid");
        const cloneCards = [...cloneGrid.querySelectorAll(":scope > .m2-corporate-type-card")];
        cloneCards.forEach((card, index) => {
          if (index !== keepIndex) card.remove();
        });
        markSingleTypePage(clone);
        return clone;
      });
      replacements.forEach((clone) => page.parentNode.insertBefore(clone, page));
      page.remove();
    });

    const finalPages = [...host.querySelectorAll(":scope > .m2-corporate-page")];
    finalPages.forEach((page, index) => {
      const footer = page.querySelector(":scope > .m2-corporate-page-footer");
      if (footer) footer.textContent = `${index + 1} / ${finalPages.length}`;
    });
  }

  function installStyles() {
    if (document.querySelector(`style[data-rafex-corporate-type-sections="${VERSION}"]`)) return;
    const style = document.createElement("style");
    style.dataset.rafexCorporateTypeSections = VERSION;
    style.textContent = `
      .rafex-single-type-page .m2-corporate-type-grid {
        grid-template-rows:minmax(0,1fr) !important;
        gap:0 !important;
      }
      .rafex-single-type-page .m2-corporate-type-grid > .m2-corporate-type-card {
        grid-row:1 / -1 !important;
        width:100%;
        height:100%;
        min-width:0;
        min-height:0;
      }
      .rafex-single-type-page .m2-corporate-type-card {
        grid-template-columns:minmax(0,1fr) minmax(0,1fr) !important;
        grid-template-rows:28px minmax(0,1fr) !important;
      }
      .rafex-single-type-page .m2-corporate-type-card > .m2-corporate-view {
        grid-row:2 !important;
        min-width:0;
        min-height:0;
        overflow:hidden;
      }
      .rafex-single-type-page .m2-corporate-type-card > .m2-corporate-view:first-of-type {
        border-right:1px solid #c6d2dc;
      }
      .rafex-single-type-page .m2-corporate-view .rafex-report-3d-frame,
      .rafex-single-type-page .m2-corporate-view .rafex-report-3d-frame img {
        width:100%;
        height:100% !important;
        max-width:100%;
        max-height:100%;
        object-fit:contain;
        object-position:center center;
      }
    `;
    document.head.appendChild(style);
  }

  function installHooks() {
    if (typeof window.m2RenderCorporateReport === "function") {
      const previousRender = window.m2RenderCorporateReport;
      window.m2RenderCorporateReport = function (...args) {
        const result = previousRender.apply(this, args);
        splitTypePages(document.getElementById("m2CorporatePreview"));
        return result;
      };
    }

    const previousPrepare = window.__rafexPrepareCorporatePrint;
    window.__rafexPrepareCorporatePrint = async function (...args) {
      if (typeof previousPrepare === "function") await previousPrepare.apply(this, args);
      splitTypePages(document.getElementById("m2CorporatePrint"));
      splitTypePages(document.getElementById("m2CorporatePreview"));
    };
  }

  installStyles();
  installHooks();
  splitTypePages(document.getElementById("m2CorporatePreview"));
})();
