/* report-localization-v275 */
(() => {
  const rows = [
    ['Zemin hariç katlarda kat aralarında travers ölçüsü gösterilmemiştir. Toplam ayak boyunda travers ölçüleri hesaplanmıştır.', 'Beam dimensions are omitted from the spacing between elevated levels. Beam dimensions are included in the overall upright height.', 'Les dimensions des lisses ne sont pas indiquées dans les espacements des niveaux hors sol. Elles sont incluses dans la hauteur totale du montant.'],
    ['Blok Açıklamaları', 'Block Descriptions', 'Descriptions des blocs'],
    ['Çizim Notu', 'Drawing Note', 'Note sur les dessins'],
    ['Çizimler 3D olduğu için perspektiften dolayı görsel yanılmalar olabilir.', 'Perspective in 3D drawings may cause visual distortions.', 'La perspective des dessins 3D peut entraîner des distorsions visuelles.'],
    ['kaynaklı', 'welded', 'soudé'], ['galvaniz', 'galvanised', 'galvanisé'],
    ['Bu raf tipine bağlı', 'Assigned to this rack type', 'Associé à ce type de rayonnage'],
    ['UAKS ayak koruma', 'UAKS upright protector', 'Protection de montant UAKS'],
    ['UAKZ ayak koruma', 'UAKZ upright protector', 'Protection de montant UAKZ'],
    ['Ayak koruma', 'Upright protector', 'Protection de montant'],
    ['Bariyer koruma', 'Safety barrier', 'Barrière de protection'],
    ['Deprem çaprazı', 'Seismic bracing', 'Contreventement sismique'],
    ['Ağır deprem çaprazı', 'Heavy-duty seismic bracing', 'Contreventement sismique renforcé'],
    ['PALLET KG', 'PALLET LOAD (kg)', 'CHARGE PALETTE (kg)']
  ];
  const language = () => document.getElementById('m2ReportLanguage')?.value || 'tr';
  const translate = (source, lang = language()) => {
    if (lang === 'tr') return source;
    const row = rows.find(row => row[0].toLocaleLowerCase('tr') === source.trim().toLocaleLowerCase('tr'));
    if (row) return source.replace(source.trim(), row[lang === 'fr' ? 2 : 1]);
    return window.rafexTranslateText?.(source, lang) || source;
  };
  const selector = '#m2A4Sheet,#m2CorporatePreview,#m2CorporatePrint,#m2CorporatePrintArea,#konsolOutputPreview';
  const originals = new WeakMap();
  function apply(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest('script,style,[translate="no"],[data-user-note],.m2-user-note,#m2ReportProjectName,.m2-corporate-cover h1,[data-rafex-type-name] > strong > span')) continue;
      const previous = originals.get(node);
      const source = previous && previous.rendered === node.nodeValue ? previous.source : node.nodeValue;
      const rendered = translate(source);
      originals.set(node, { source, rendered });
      if (node.nodeValue !== rendered) node.nodeValue = rendered;
    }
  }
  const sync = () => document.querySelectorAll(selector).forEach(apply);
  window.rafexTranslateReportText = translate;
  window.rafexTranslateReport = sync;
  if (typeof m2BuildCorporatePages === 'function') {
    const build = m2BuildCorporatePages;
    m2BuildCorporatePages = function (...args) {
      const holder = document.createElement('div');
      holder.innerHTML = build.apply(this, args);
      apply(holder);
      return holder.innerHTML;
    };
  }
  for (const name of ['m2RenderA4Report', 'm2RenderCorporateReport', 'm2ChangeReportLanguage']) {
    const original = window[name];
    if (typeof original !== 'function') continue;
    window[name] = function (...args) { const result = original.apply(this, args); sync(); return result; };
  }
  document.addEventListener('change', event => { if (event.target.id === 'm2ReportLanguage') sync(); });
  window.addEventListener('beforeprint', sync);
  const observer = new MutationObserver(records => {
    if (records.some(record => record.target.parentElement?.closest(selector) || record.target.closest?.(selector))) sync();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  sync();
})();
