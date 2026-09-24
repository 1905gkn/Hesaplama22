/* site-localization-v202 */
(() => {
  const rows = /* TRANSLATION_ROWS */ [];
  for (const [tr, en, fr] of rows) {
    if (tr.length < 2) continue;
    UI_TRANSLATIONS.en[tr] = en;
    UI_TRANSLATIONS.fr[tr] = fr;
  }
  const textState = new WeakMap(), attributeState = new WeakMap();
  const protectedSelector = 'script,style,textarea,code,pre,[contenteditable="true"],[translate="no"],[data-no-translate],#m2ReportProjectName,.m2-user-note,[data-user-note],[data-rafex-type-name] > strong > span';
  const reportSelector = '#m2A4Sheet,.m2-corporate-preview,#m2CorporatePrint,#m2CorporatePrintArea,#konsolOutputPreview';
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
    // Dimension strings are compound labels; never replace arbitrary words in names.
    const parts = trimmed.split(/(\s+[·|]\s+|\s*:\s*)/);
    if (parts.length > 1) return source.replace(trimmed, parts.map((part, i) => i % 2 ? part : (lookup[language].get(normalize(part)) || part)).join(''));
    return source.replace(/(\d[\d.,]*)\s+(adet|palet|kat|göz|modül)(?=\s|$)/g, (_, n, unit) => `${n} ${{en:{adet:'units',palet:'pallets',kat:'levels',göz:'bays',modül:'modules'},fr:{adet:'pièces',palet:'palettes',kat:'niveaux',göz:'travées',modül:'modules'}}[language][unit]}`);
  };
  window.rafexTranslateText = translate;
  // Canvas callers can provide the independently selected output language.
  window.rafexDimensionText = translate;
  const languageFor = element => element.closest(reportSelector) ? (document.getElementById('m2ReportLanguage')?.value || 'tr') : (document.documentElement.lang || 'tr');
  function updateText(node, language) {
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
    if (!root) return;
    const elements = root.nodeType === 1 ? [root, ...root.querySelectorAll('*')] : [];
    for (const element of elements) {
      if (element.closest(protectedSelector)) continue;
      const language = languageFor(element);
      let states = attributeState.get(element);
      if (!states) attributeState.set(element, states = {});
      for (const name of ['placeholder', 'title', 'aria-label']) {
        if (!element.hasAttribute(name)) continue;
        const current = element.getAttribute(name);
        let state = states[name];
        if (!state || current !== state.rendered) state = states[name] = { source: (!state && i18nOriginalAttributes.get(element)?.[name]) || current, rendered: current };
        state.rendered = translate(state.source, language);
        if (current !== state.rendered) element.setAttribute(name, state.rendered);
      }
      for (const node of element.childNodes) if (node.nodeType === 3) updateText(node, language);
    }
  }
  i18nObserver.disconnect();
  applyTranslations = apply;
  // Alerts/prompts retain their existing translation entry point with safer matching.
  translatedUiText = translate;
  const observer = new MutationObserver(records => {
    observer.disconnect();
    const roots = new Set();
    for (const record of records) {
      if (record.target === document.documentElement) roots.add(document.body);
      else if (record.type === 'characterData') roots.add(record.target.parentElement);
      else if (record.type === 'attributes') roots.add(record.target);
      else for (const node of record.addedNodes) roots.add(node.nodeType === 1 ? node : node.parentElement);
    }
    for (const root of roots) if (root?.isConnected) apply(root);
    observe();
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
