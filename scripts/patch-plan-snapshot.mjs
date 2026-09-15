import fs from 'node:fs';
import {freezePlanPaint,preservePlanFrame} from './plan-snapshot.mjs';
export function transform(html){
  if(html.includes('/* RAFEX_LIVE_PLAN_SNAPSHOT */'))return html;
  const replace=(a,b)=>{if(!html.includes(a)||html.indexOf(a)!==html.lastIndexOf(a))throw Error('Snapshot anchor missing/ambiguous: '+a);html=html.replace(a,b)};
  replace('/* RAFEX_PDF_TIGHT_FIT_V141 */\n        const copy=source.cloneNode(true);',
    '/* RAFEX_PDF_TIGHT_FIT_V141 */\n        /* RAFEX_LIVE_PLAN_SNAPSHOT */\n        const copy=('+freezePlanPaint.toString()+')(source,source.cloneNode(true));\n        if(document.querySelector(\'#nav button.active[data-page]\')?.dataset.page===\'free\')return ('+preservePlanFrame.toString()+')(source,copy);');
  // A frozen export must not be repainted by the delayed live paint copier or
  // the upright overlay builder after HTML serialization.
  replace('host.querySelectorAll(".m2-corporate-floor svg").forEach(function(pdfSvg){',
    'host.querySelectorAll(".m2-corporate-floor svg").forEach(function(pdfSvg){\n        if(pdfSvg.hasAttribute("data-rafex-live-snapshot"))return;');
  replace('function enhance(svg){\n    if(!svg)return 0;',
    'function enhance(svg){\n    if(!svg)return 0;\n    if(svg.hasAttribute("data-rafex-live-snapshot"))return Number(svg.dataset.rafexPdfUprights)||0;');
  return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-plan-snapshot.mjs')){
  const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
  if(!m)throw Error('Snapshot HTML missing');
  const html=transform(Buffer.from(m[2],'base64').toString('utf8'));
  fs.writeFileSync(file,source.replace(m[0],m[0].replace(m[2],Buffer.from(html).toString('base64'))));
  console.log('Live plan geometry and paint frozen for preview and PDF.');
}
