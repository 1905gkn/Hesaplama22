/* site-localization-v202 */
(() => {
  const rows = (/* TRANSLATION_ROWS */ []).concat([
 ['Tava Hesabı','Shelf Panel Calculation','Calcul des plateaux'],
 ['HAZIRLAYAN','PREPARED BY','PRÉPARÉ PAR'],['Hazırlayan','Prepared by','Préparé par'],
 ['YAN GÖRÜNÜŞ','SIDE VIEW','VUE LATÉRALE'],['ÖNDEN TEKNİK GÖRÜNÜŞ','TECHNICAL FRONT VIEW','VUE TECHNIQUE DE FACE'],
 ['MR SİSTEM','MR SYSTEM','SYSTÈME MR'],['MR 3D GÖRÜNÜŞ','MR 3D VIEW','VUE 3D MR'],['KAYITLI ÖLÇÜLER','SAVED DIMENSIONS','DIMENSIONS ENREGISTRÉES'],
 ['B2B ÜRÜNLERİ','B2B COMPONENTS','COMPOSANTS B2B'],['MEKİK ÜRÜNLERİ','SHUTTLE COMPONENTS','COMPOSANTS NAVETTE'],['DRIVE-IN ÜRÜNLERİ','DRIVE-IN COMPONENTS','COMPOSANTS DRIVE-IN'],
 ['MR ÜRÜNLERİ','MR COMPONENTS','COMPOSANTS MR'],['KONSOL KOLLU ÜRÜNLERİ','CANTILEVER COMPONENTS','COMPOSANTS CANTILEVER'],['(devam)','(continued)','(suite)'],['KOD','CODE','CODE'],
 ['Düz arabağ','Straight frame spacer','Entretoise droite'],['Palet yastığı','Pallet support pad','Support de palette'],
 ['Arka stoper','Rear pallet stop','Butée arrière de palette'],['Forklift stoperi','Forklift stop','Butée de chariot élévateur'],
 ['Giriş konsolu','Entry bracket','Console d’entrée'],['Yatay çapraz seti','Horizontal bracing set','Jeu de contreventement horizontal'],
 ['Konsol ayak','Cantilever upright','Montant cantilever'],['Konsol kolu','Cantilever arm','Bras cantilever'],
 ['MR Ayak Toplama','MR frame assembly','Échelle MR assemblée'],['ZS Travers','ZS beam','Lisse ZS'],
 ['PALET ÜST KOTU','TOP OF LOAD','COTE SUPÉRIEURE DE LA CHARGE'],
 ['HAZIRLANMA TARİHİ','PREPARATION DATE','DATE DE PRÉPARATION'],['PROJE NO','PROJECT NO.','N° DE PROJET'],['CRM NO','CRM NO.','N° CRM'],
 ['KOT ARALIKLARI','LEVEL SPACING','ESPACEMENT DES NIVEAUX'],['SON PALET YÜKSEKLİĞİ','TOP PALLET ELEVATION','COTE DE LA PALETTE SUPÉRIEURE'],
 ['SON KAT ÜSTÜ','ABOVE TOP LEVEL','AU-DESSUS DU DERNIER NIVEAU'],['TOPLAM UZUNLUK','TOTAL LENGTH','LONGUEUR TOTALE'],
 ['ZEMİN','GROUND LEVEL','SOL'],['ORTAK AYAK','SHARED FRAME','ÉCHELLE COMMUNE'],['ARABAĞ','FRAME SPACER','ENTRETOISE'],
 ['KOL','ARM','BRAS'],['GÖZ','BAY','TRAVÉE'],['TOPLAM','TOTAL','TOTAL'],['YÜKSEKLİK','HEIGHT','HAUTEUR'],
 ['KAT ARASI','LEVEL SPACING','ESPACEMENT DES NIVEAUX'],['RAF UZUNLUĞU','RACK LENGTH','LONGUEUR DU RAYONNAGE'],
 ['MR RAF','MR RACK','RAYONNAGE MR'],['TEK SIRA','SINGLE ROW','SIMPLE RANGÉE'],['ÇİFT SIRA','DOUBLE ROW','DOUBLE RANGÉE'],
 ['TEK SIRA RAF','SINGLE-ROW RACK','RAYONNAGE SIMPLE RANGÉE'],
 ['RAY SON AYAKTA BİTER','RAIL ENDS AT THE LAST FRAME','LE RAIL SE TERMINE À LA DERNIÈRE ÉCHELLE'],
 ['ÖNDEN GÖRÜNÜŞ','FRONT VIEW','VUE DE FACE'],['YANDAN GÖRÜNÜŞ','SIDE VIEW','VUE LATÉRALE'],['ÜST GÖRÜNÜŞ','TOP VIEW','VUE DE DESSUS'],
 ['3D İLE AYNI MODÜL','SAME BAY AS THE 3D MODEL','MÊME TRAVÉE QUE LE MODÈLE 3D'],
 ['AYAK · RAY · TRAVERS · PALET montaj görünüşü','FRAME · RAIL · BEAM · PALLET assembly view','Vue d’assemblage ÉCHELLE · RAIL · LISSE · PALETTE'],
 ['montaj görünüşü','assembly view','vue d’assemblage'],['3D ile aynı sıra düzeni · iki ürün ayrı konstrüksiyon','Same row layout as 3D · two independent structures','Même disposition des rangées que la vue 3D · deux structures indépendantes'],
 ['2 AYRI RAF · GALVANİZ DÜZ ARABAĞ','2 SEPARATE RACKS · GALVANISED STRAIGHT SPACER','2 RAYONNAGES SÉPARÉS · ENTRETOISE DROITE GALVANISÉE'],
 ['B2B çift sıra · arabağ uç plakaları ayak deliklerinde','B2B double row · spacer end plates in the upright holes','B2B double rangée · platines d’entretoise dans les perforations des montants'],
 ['B2B tek sıra','B2B single row','B2B simple rangée'],['V TEKRARI','V BRACING REPEAT','RÉPÉTITION DU CONTREVENTEMENT EN V'],
 ['İLK DÜĞÜM','FIRST BRACING NODE','PREMIER NŒUD DE CONTREVENTEMENT'],['ÖLÇEK','SCALE','ÉCHELLE'],
 ['KESİT AÇISI','SECTION ANGLE','ANGLE DE COUPE'],['KESİT','SECTION','COUPE'],
 ['H Travers','H-beam','Lisse en H'],['Kat teli','Wire decking','Platelage grillagé'],['Tavalı','With shelf panels','Avec plateaux'],
 ['Toplama katı','Picking level','Niveau de picking'],['Palet dayama','Pallet backstop','Butée de palette'],
 ['Hissedilen','Feels like','Ressenti'],['Rüzgâr','Wind','Vent'],['km/sa','km/h','km/h'],
 ['Bugünün kuru doğrulanamadı.',"Today's exchange rate could not be verified.",'Le taux de change du jour n’a pas pu être vérifié.'],
 ['Günlük gösterge kuru','Daily reference rate','Taux indicatif du jour'],['Kur kaynağı','Rate source','Source du taux'],
 ['Saat dilimine göre otomatik güncellenir','Updates automatically by time zone','Mise à jour automatique selon le fuseau horaire'],
 ['Tamamla','Mark complete','Marquer comme terminée'],['Tamamlandı','Completed','Terminée'],['Notu sil','Delete note','Supprimer la note'],
 ['İstanbul','Istanbul','Istanbul'],['Londra','London','Londres'],['Kazablanka','Casablanca','Casablanca'],['Riyad','Riyadh','Riyad'],['Şanghay','Shanghai','Shanghai'],
 ['Raf Ölçüleri','Rack Dimensions','Dimensions du rayonnage'],['PDF Çıktı Alanı','PDF Output Area','Zone de sortie PDF'],
 ['Kayıtlı Projeler · Tüm Sistemler','Saved Projects · All Systems','Projets enregistrés · Tous les systèmes'],
 ['Yerleşim ve teknik görünüşler','Layout and technical views','Implantation et vues techniques'],
 ['Hava durumu verisi şu anda kullanılamıyor.','Weather data is currently unavailable.','Les données météo sont actuellement indisponibles.']
 ]);
  for (const [tr, en, fr] of rows) {
    if (tr.length < 2) continue;
    UI_TRANSLATIONS.en[tr] = en;
    UI_TRANSLATIONS.fr[tr] = fr;
  }
  const textState = new WeakMap(), attributeState = new WeakMap();
  const stats = { batches: 0, textChecks: 0, attributeChecks: 0, subtreeScans: 0 };
  window.rafexTranslationStats = stats;
  const protectedSelector = 'script,style,textarea,code,pre,[contenteditable="true"],[translate="no"],[data-no-translate],#m2ReportProjectName,.todo-row > span,.m2-user-note,[data-user-note],[data-rafex-type-name] > strong > span';
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
    const engineering = trimmed.match(/^(.+?)\s+([\d.,]+(?:\s*[×x]\s*[\d.,]+)*(?:\s*(?:mm|m|kg))?)$/);
    const engineeringLabels = ['AYAK','ARABAĞ','RAY','TRAVERS','KOL','GÖZ','TOPLAM','YÜKSEKLİK','DERİNLİK','GENİŞLİK','PALET','KAT ARASI','TOPLAM GENİŞLİK','TOPLAM DERİNLİK','TOPLAM UZUNLUK','SON PALET YÜKSEKLİĞİ','AYAK UZUNLUĞU','V TEKRARI','İLK DÜĞÜM'];
    if (engineering && engineeringLabels.includes(engineering[1].toLocaleUpperCase('tr'))) return source.replace(trimmed, `${translate(engineering[1].toLocaleUpperCase('tr'), language)} ${engineering[2]}`);
    const patterns = [
      [/^([\d.,]+)\s*mm\s+kalınlık$/i, m => fr ? `épaisseur ${m[1]} mm` : `${m[1]} mm thickness`],
      [/^([\d.,]+)\s+derinlik$/i, m => fr ? `${m[1]} palettes en profondeur` : `${m[1]} pallets deep`],
      [/^(\d+)[’']l[üuıi]\s+çapraz seti$/i, m => fr ? `Jeu de contreventement pour ${m[1]} montants` : `${m[1]}-upright bracing set`],
      [/^([\d.,]+)\s*mm\s+ayak$/i, m => fr ? `Montant de ${m[1]} mm` : `${m[1]} mm upright`],
      [/^(K\d+\s*[→–-]\s*K\d+)\s+NET$/i, m => `${m[1]} ${fr ? 'LIBRE' : 'CLEAR'}`],
      // v438: translate engineering captions as structured labels, keeping numbers,
      // product codes and user-provided project names unchanged.
      [/^(\d+)\s+temsili blok$/i, m => `${m[1]} ${fr ? 'travées représentatives' : 'representative bays'}`],
      [/^([\d.,]+)\s+palet derinlik$/i, m => fr ? `${m[1]} palettes en profondeur` : `${m[1]} pallets deep`],
      [/^([\d.,]+)\s+palet\s*\/\s*bölüm$/i, m => fr ? `${m[1]} palettes / travée` : `${m[1]} pallets / bay`],
      [/^(Derinlik|Gözler)\s*([↓→])$/i, m => `${m[1].toLocaleLowerCase('tr') === 'derinlik' ? (fr ? 'Profondeur' : 'Depth') : (fr ? 'Travées' : 'Bays')} ${m[2]}`],
      [/^(ZEMİN)\s*([→–-]\s*K\d+)$/i, m => `${fr ? 'SOL' : 'GROUND'} ${m[2]}`],
      [/^(AYAK|ARABAĞ|RAY|TRAVERS|KOL|GÖZ|TOPLAM|YÜKSEKLİK|DERİNLİK|GENİŞLİK|PALET|KAT ARASI|TOPLAM GENİŞLİK|TOPLAM DERİNLİK|TOPLAM UZUNLUK|SON PALET YÜKSEKLİĞİ|AYAK UZUNLUĞU|V TEKRARI|İLK DÜĞÜM)\s+([\d.,]+(?:\s*[×x]\s*[\d.,]+)*(?:\s*(?:mm|m|kg))?)$/i, m => `${translate(m[1], language)} ${m[2]}`],
      [/^KOLON ARALIĞI\s+([\d.,]+\s*mm)$/i, m => `${fr ? 'ESPACEMENT DES COLONNES' : 'COLUMN SPACING'} ${m[1]}`],
      [/^([\d.,]+\s*mm)\s+(arabağ|kolon ara)$/i, m => `${m[1]} ${m[2].toLocaleLowerCase('tr') === 'arabağ' ? (fr ? 'entretoise' : 'frame spacer') : (fr ? 'entre colonnes' : 'column spacing')}`],
      [/^(KESİT AÇISI|KESİT)\s+([\d.,]+°)$/i, m => `${translate(m[1], language)} ${m[2]}`],
      [/^Merhaba, (.+)$/, m => (fr ? 'Bonjour, ' : 'Hello, ') + m[1]],
      [/^(\d+) açık$/, m => m[1] + (fr ? ' ouvertes' : ' open')],
      [/^(\d+) kapalı$/, m => m[1] + (fr ? ' clôturées' : ' closed')],
      [/^(\d+) tamamlandı$/, m => m[1] + (fr ? ' terminées' : ' completed')],
      [/^Hissedilen (.+)$/, m => (fr ? 'Ressenti ' : 'Feels like ') + m[1]],
      [/^Rüzgâr (.+) km\/sa$/, m => (fr ? 'Vent ' : 'Wind ') + m[1] + ' km/h'],
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
      [/^(\d+)\s+paletli$/i, m => fr ? `${m[1]} palettes` : `${m[1]} pallets`],
      [/^([\d.,]+)\s+PALET$/, m => `${m[1]} ${fr ? 'PALETTES' : 'PALLETS'}`],
      [/^([\d.,]+)\s+ADET$/, m => `${m[1]} ${fr ? 'PIÈCES' : 'PCS'}`],
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
    return source.replace(/(\d[\d.,]*)\s+(adet|palet|kat|göz|modül)(?=\s|$)/gi, (_, n, unit) => `${n} ${{en:{adet:'units',palet:'pallets',kat:'levels',göz:'bays',modül:'modules'},fr:{adet:'pièces',palet:'palettes',kat:'niveaux',göz:'travées',modül:'modules'}}[language][unit.toLocaleLowerCase('tr')]}`);
  };
  window.rafexTranslateText = translate;
  // Canvas callers can provide the independently selected output language.
  window.rafexDimensionText = translate;
  // Translate new SVG labels before measuring their plates or capturing a report.
  window.rafexTranslateDrawing438 = (root, language = document.documentElement.lang || 'tr') => {
    if (!root) return;
    for (const text of root.querySelectorAll('text,tspan')) {
      if (text.closest('[data-user-note],.m2-user-note,[translate="no"],[data-no-translate]')) continue;
      for (const node of text.childNodes) if (node.nodeType === 3) updateText(node, language);
    }
  };
  const languageFor = element => element.closest(reportSelector) ? (document.getElementById('m2ReportLanguage')?.value || 'tr') : (document.documentElement.lang || 'tr');
  window.rafexSetUiText = (element, source) => {
    if (!element) return;
    const rendered = translate(source, languageFor(element));
    if (element.textContent !== rendered) element.textContent = rendered;
    if (element.childNodes.length === 1 && element.firstChild.nodeType === 3)
      textState.set(element.firstChild, {source, rendered});
  };
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
      const owner = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      if (owner?.closest(protectedSelector)) continue;
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