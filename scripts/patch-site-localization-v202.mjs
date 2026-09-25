import fs from 'node:fs';
export function transform(html) {
  if (html.includes('/* site-localization-v202 */')) return html;
  // Change the generated report template, not an already-rendered user's report.
  html = html.replaceAll('<article><h3>${t.extraTitle}</h3><p>${t.extraText}</p></article>', '');
  html = html.replaceAll('<article><h3>Çizim Notu</h3><p>Çizimler 3D olduğu için perspektiften dolayı görsel yanılmalar olabilir.</p></article>', '<article class="rafex-drawing-note-footer"><h3>Çizim Notu</h3><p>Çizimler 3D olduğu için perspektiften dolayı görsel yanılmalar olabilir.</p></article>');
  // The legacy navigation observer owns this label and watches characterData.
  // It must agree with the translator, otherwise each observer undoes the other
  // in the same microtask checkpoint and the browser never paints again.
  html = html.replace(/<script data-rafex-free-nav-ortak="v39">([\s\S]*?)<\/script>/g, (script) => script
    .replace('function apply(){', "function apply(){\n    const LABEL=window.rafexTranslateText?.('Ortak Çizim',document.documentElement.lang)||'Ortak Çizim';")
    .replace("button.setAttribute('aria-label',LABEL);", "if(button.getAttribute('aria-label')!==LABEL)button.setAttribute('aria-label',LABEL);"));
  const rows = JSON.parse(fs.readFileSync(new URL('../client/site-translations.json', import.meta.url), 'utf8'));
  const runtime = fs.readFileSync(new URL('../client/site-localization.js', import.meta.url), 'utf8').replace('/* TRANSLATION_ROWS */ []', JSON.stringify(rows).replaceAll('<', '\\u003c'));
  // Earlier occurrences can belong to quoted print-window HTML inside scripts.
  const closingBody = html.lastIndexOf('</body>');
  if (closingBody < 0) throw Error('Missing application closing body');
  return html.slice(0, closingBody) + `<style>.m2-corporate-final{min-height:0;flex:1}.m2-corporate-copy:has(.rafex-drawing-note-footer){display:flex;flex-direction:column;height:100%}.m2-corporate-copy .rafex-drawing-note-footer{margin-top:auto;padding:6px 8px;background:transparent;font-size:9px;line-height:1.35}.m2-corporate-copy .rafex-drawing-note-footer h3{font-size:10px;margin:0 0 3px}.m2-corporate-copy .rafex-drawing-note-footer p{font-size:9px;margin:0}</style><script>\n${runtime}\n</script>\n` + html.slice(closingBody);
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/patch-site-localization-v202.mjs')) {
  const file = 'dist/server/index.js', source = fs.readFileSync(file, 'utf8');
  const match = source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
  if (!match) throw Error('Missing embedded application HTML');
  fs.writeFileSync(file, source.replace(match[1], Buffer.from(transform(Buffer.from(match[1], 'base64').toString())).toString('base64')));
}
