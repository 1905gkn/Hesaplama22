import fs from 'node:fs';
export function transform(html){
 if(html.includes('section-held-wheel-v292'))return html;
 const anchor='stage?.addEventListener("wheel", (event) => { event.preventDefault(); changeScale(event.deltaY < 0 ? 0.06 : -0.06); }, { passive: false });';
 if(!html.includes(anchor))throw Error('Missing section wheel handler');
 return html.replace(anchor,'/* section-held-wheel-v292 */ stage?.addEventListener("wheel", (event) => { if(!drag?.rotate)return; event.preventDefault(); changeScale(event.deltaY < 0 ? 0.06 : -0.06); }, { passive: false });');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-section-held-wheel-v292.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
