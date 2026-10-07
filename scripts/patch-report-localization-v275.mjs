import fs from 'node:fs';
export function transform(html) {
  if(html.includes('/* report-localization-v275 */'))return html;
  const runtime=fs.readFileSync(new URL('../client/report-localization.js',import.meta.url),'utf8');
  const end=html.lastIndexOf('</body>');
  if(end<0)throw Error('Missing application body');
  return html.slice(0,end)+'<script>\n'+runtime+'\n</script>\n'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-report-localization-v275.mjs')){
 const file='dist/server/index.js', source=fs.readFileSync(file,'utf8');
 const match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!match)throw Error('Missing embedded HTML');
 fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));
}
