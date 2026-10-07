import fs from 'node:fs';
export function transform(html){
 if(html.includes('main-wheel-page-scroll-v295'))return html;
 const anchor='event.preventDefault();event.stopImmediatePropagation();\n  if(!held||!controls.enabled||!controls.enableZoom||viewer.destroyed)return;';
 if(!html.includes(anchor))throw Error('Missing shared wheel control');
 return html.replace(anchor,'/* main-wheel-page-scroll-v295 */ event.stopImmediatePropagation();\n  if(!held||!controls.enabled||!controls.enableZoom||viewer.destroyed)return;\n  event.preventDefault();');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-main-wheel-page-scroll-v295.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
