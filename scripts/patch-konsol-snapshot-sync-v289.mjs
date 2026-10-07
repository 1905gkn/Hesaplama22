import fs from 'node:fs';
export function transform(html){
 if(html.includes('konsol-snapshot-sync-v289'))return html;
 const expose='window.rafexRefreshKonsolFreePlanV38=schedule;';
 const anchor='/* RAFEX_PDF_TIGHT_FIT_V141 */';
 if(!html.includes(expose)||!html.includes(anchor))throw Error('Missing cantilever snapshot hooks');
 return html.replace(expose,expose+"\n  window.rafexFlushKonsolFreePlanV289=function(){if(raf){cancelAnimationFrame(raf);raf=0;}process();};").replace(anchor,"/* konsol-snapshot-sync-v289 */ if(source?.id===\"m2LayoutSvg\")window.rafexFlushKonsolFreePlanV289?.();\n        "+anchor);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-konsol-snapshot-sync-v289.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
