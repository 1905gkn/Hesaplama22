import fs from 'node:fs';
export function transform(html) {
  if (html.includes('/* site-localization-v202 */')) return html;
  const rows = JSON.parse(fs.readFileSync(new URL('../client/site-translations.json', import.meta.url), 'utf8'));
  const runtime = fs.readFileSync(new URL('../client/site-localization.js', import.meta.url), 'utf8').replace('/* TRANSLATION_ROWS */ []', JSON.stringify(rows).replaceAll('<', '\\u003c'));
  // Earlier occurrences can belong to quoted print-window HTML inside scripts.
  const closingBody = html.lastIndexOf('</body>');
  if (closingBody < 0) throw Error('Missing application closing body');
  return html.slice(0, closingBody) + `<script>\n${runtime}\n</script>\n` + html.slice(closingBody);
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/patch-site-localization-v202.mjs')) {
  const file = 'dist/server/index.js', source = fs.readFileSync(file, 'utf8');
  const match = source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
  if (!match) throw Error('Missing embedded application HTML');
  fs.writeFileSync(file, source.replace(match[1], Buffer.from(transform(Buffer.from(match[1], 'base64').toString())).toString('base64')));
}
