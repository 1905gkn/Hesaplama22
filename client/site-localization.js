/* site-localization-v202 */
(() => {
  const rows = /* TRANSLATION_ROWS */ [];
  for (const [tr, en, fr] of rows) {
    if (tr.length < 2) continue;
    UI_TRANSLATIONS.en[tr] = en;
    UI_TRANSLATIONS.fr[tr] = fr;
  }
  const textState = new WeakMap(), attributeState = new WeakMap();
  const stats = { batches: 0, textChecks: 0, attributeChecks: 0, subtreeScans: 0 };
  window.rafexTranslationStats = stats;
  const protectedSelector = 'script,style,textarea,code,pre,[contenteditable="true"],[translate="no"],[data-no-translate],#m2ReportProjectName,.m2-user-note,[data-user-note],[data-rafex-type-name] > strong > span';
  const reportSelector = '#m2A4Sheet,#m2CorporatePreview,.m2-corporate-preview,#m2CorporatePrint,#m2CorporatePrintArea,#konsolOutputPreview';
  const lookup = { en: new Map(), fr: new Map() };
  const normalize = value => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr');
  for (const language of ['en', 'fr']) {
    for (const [tr, value] of Object.entries(UI_TRANSLATIONS[language])) lookup[language].set(normalize(tr), value);
  }
  const translate = (source, language = document.documentElement.lang || 'tr') => {
    if (typeof source !== 'string' || !lookup[language]) return source;
    const trimmed = source.trim();
    const exact = UI_TRANSLATIONS[language][trimmed] || lookup[language].get(normalize(trimmed));
    if (exact) return source.replace(trimmed, exact);
    const fr = language === 'fr';
    const patterns = [
      [/^(Kapalı Notları (?:Göster|Gizle)|Tüm Sistemler)\s*(\(\d+\))$/, m => `${translate(m[1], language)} ${m[2]}`],
      [/^(\d+)\.\s*ÖNERİ$/, m => `${m[1]}. ${fr ? 'RECOMMANDATION' : 'RECOMMENDATION'}`],
      [/^(\d+)\.\s*Alanı Aç$/, m => fr ? `Ouvrir la zone ${m[1]}` : `Open Area ${m[1]}`],
      [/^(\d+)\.\s*Alan$/, m => `${fr ? 'Zone' : 'Area'} ${m[1]}`],
      [/^(\d+)\.\s*kenar$/, m => `${fr ? 'Côté' : 'Edge'} ${m[1]}`],
      [/^([\d.,]+) mm travers için:(.*)$/, m => fr ? `Pour une lisse de ${m[1]} mm :${m[2]}` : `For a ${m[1]} mm beam:${m[2]}`],
      [/^Kat ([\d.,]+ kg \/ [\d.,]+ mm) → tablo ([\d.,]+ kg \/ [\d.,]+ mm)$/, m => `${fr ? 'Niveau' : 'Level'} ${m[1]} → ${fr ? 'tableau' : 'table'} ${m[2]}`],
      [/^KESİT ([^·|]+)$/, m => `${fr ? 'COUPE' : 'SECTION'} ${m[1]}`],
      [/^(.+) ortak çizim alanına eklendi\.$/, m => fr ? `${m[1]} ajouté à la zone d’implantation commune.` : `${m[1]} added to the combined layout area.`],
      [/^(\d+) BÖLÜM$/, m => `${m[1]} ${fr ? (m[1] === '1' ? 'TRAVÉE' : 'TRAVÉES') : (m[1] === '1' ? 'BAY' : 'BAYS')}`],
      [/^HER BÖLÜM ([\d.,]+ mm)$/, m => `${fr ? 'CHAQUE TRAVÉE' : 'EACH BAY'} ${m[1]}`],
      [/^HER BÖLÜMDE (\d+) PALET × ([\d.,]+ mm)$/, m => fr ? `${m[1]} PALETTES × ${m[2]} PAR TRAVÉE` : `${m[1]} PALLETS × ${m[2]} PER BAY`],
      [/^(\d+) KAT$/, m => `${m[1]} ${fr ? 'NIVEAUX' : 'LEVELS'}`],
      [/^KATTA TOPLAM (\d+) PALET$/, m => `${m[1]} ${fr ? 'PALETTES PAR NIVEAU' : 'PALLETS PER LEVEL'}`],
      [/^AYAK ([\d.,]+ mm)$/, m => `${fr ? 'MONTANT' : 'UPRIGHT'} ${m[1]}`]
    ];
    for (const [pattern, render] of patterns) {
      const match = trimmed.match(pattern);
      if (match) return source.replace(trimmed, render(match));
    }
    // Dimension strings are compound labels; never replace arbitrary words in names.
    const parts = trimmed.split(/(\s+[·|]\s+|\s*:\s*)/);
    if (parts.length > 1) return source.replace(trimmed, parts.map((part, i) => i % 2 ? part : translate(part, language)).join(''));
    return source.replace(/(\d[\d.,]*)\s+(adet|palet|kat|göz|modül)(?=\s|$)/g, (_, n, unit) => `${n} ${{en:{adet:'units',palet:'pallets',kat:'levels',göz:'bays',modül:'modules'},fr:{adet:'pièces',palet:'palettes',kat:'niveaux',göz:'travées',modül:'modules'}}[language][unit]}`);
  };
  window.rafexTranslateText = translate;
  // Canvas callers can provide the independently selected output language.
  window.rafexDimensionText = translate;
  const languageFor = element => element.closest(reportSelector) ? (document.getElementById('m2ReportLanguage')?.value || 'tr') : (document.documentElement.lang || 'tr');
  function updateText(node, language) {
    stats.textChecks++;
    const current = node.nodeValue;
    let state = textState.get(node);
    if (!state || current !== state.rendered) {
      const original = !state && i18nOriginalText.get(node);
      state = { source: original || current, rendered: current };
      textState.set(node, state);
    }
    const next = translate(state.source, language);
    state.rendered = next;
    if (next !== current) node.nodeValue = next;
  }
  function apply(root = document.body) {
    if (!root || root.nodeType !== 1 || root.closest(protectedSelector)) return;
    if (!root.firstChild && !root.matches('[placeholder],[title],[aria-label]')) return;
    stats.subtreeScans++;
    // Geometry, paths and groups have no translatable text. Never enumerate
    // every SVG element just to translate a caption or tooltip.
    for (const element of [root, ...root.querySelectorAll('[placeholder],[title],[aria-label]')]) {
      updateAttributes(element);
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateNode(node);
  }
  function translateNode(node) {
    const element = node.parentElement;
    if (!element || !node.nodeValue.trim() || element.closest(protectedSelector)) return;
    const language = languageFor(element);
    if (language === 'tr' && !textState.has(node) && !i18nOriginalText.has(node)) return;
    updateText(node, language);
  }
  function updateAttributes(element, onlyName) {
      if (element.closest(protectedSelector)) return;
      const language = languageFor(element);
      if (language === 'tr' && !attributeState.has(element) && !i18nOriginalAttributes.has(element)) return;
      let states = attributeState.get(element);
      if (!states) attributeState.set(element, states = {});
      for (const name of onlyName ? [onlyName] : ['placeholder', 'title', 'aria-label']) {
        if (!element.hasAttribute(name)) continue;
        stats.attributeChecks++;
        const current = element.getAttribute(name);
        let state = states[name];
        if (!state || current !== state.rendered) state = states[name] = { source: (!state && i18nOriginalAttributes.get(element)?.[name]) || current, rendered: current };
        state.rendered = translate(state.source, language);
        if (current !== state.rendered) element.setAttribute(name, state.rendered);
      }
  }
  i18nObserver.disconnect();
  applyTranslations = apply;
  // Alerts/prompts retain their existing translation entry point with safer matching.
  translatedUiText = translate;
  const roots = new Set(), texts = new Set(), attributes = new Map();
  let timer = null;
  function flush() {
    timer = null;
    stats.batches++;
    // Keep observing: guarded writes do not change state twice. The deferred
    // batch prevents other legacy observers from starving browser input/paint.
    const work = new Set(roots); roots.clear();
    const covered = node => {
      while (node) { if (work.has(node)) return true; node = node.parentElement; }
      return false;
    };
    for (const root of work) {
      if (!root.isConnected) continue;
      let parent = root.parentElement, nested = false;
      while (parent) { if (work.has(parent)) { nested = true; break; } parent = parent.parentElement; }
      if (!nested) apply(root);
    }
    for (const node of texts) if (node.isConnected && !covered(node)) translateNode(node);
    texts.clear();
    for (const [element, names] of attributes) if (element.isConnected && !covered(element)) for (const name of names) updateAttributes(element, name);
    attributes.clear();
  }
  const observer = new MutationObserver(records => {
    // Keep the language-change restoration, but ignore normal Turkish renders
    // before allocating queues or walking through thousands of added nodes.
    if (document.documentElement.lang === 'tr' && (!document.getElementById('m2ReportLanguage') || document.getElementById('m2ReportLanguage').value === 'tr') && !records.some(r => r.target === document.documentElement) && !roots.has(document.body)) return;
    for (const record of records) {
      if (record.target === document.documentElement) roots.add(document.body);
      else if (record.type === 'characterData') {
        if (textState.get(record.target)?.rendered !== record.target.nodeValue) texts.add(record.target);
      } else if (record.type === 'attributes') {
        if (attributeState.get(record.target)?.[record.attributeName]?.rendered === record.target.getAttribute(record.attributeName)) continue;
        if (!attributes.has(record.target)) attributes.set(record.target, new Set());
        attributes.get(record.target).add(record.attributeName);
      } else for (const node of record.addedNodes) {
        if (node.nodeType === 3) texts.add(node);
        else if (node.nodeType === 1) roots.add(node);
      }
    }
    if (timer === null && (roots.size || texts.size || attributes.size)) timer = setTimeout(flush, 16);
  });
  function observe() {
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  document.addEventListener('change', event => {
    if (event.target.id === 'm2ReportLanguage') requestAnimationFrame(() => apply(document.body));
  });
  apply();
  observe();
})();
