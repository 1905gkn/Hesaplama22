import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-shared-fill="v245"'))return html;
 const a=html.indexOf('  function renderSharedFeet(state,svg){'),b=html.indexOf('  function decorate(){',a);if(a<0||b<0)throw Error('Shared feet renderer missing');
 html=html.slice(0,a)+fs.readFileSync(new URL('./shared-fill-v245.js',import.meta.url),'utf8')+html.slice(b);
 html=html.replace(/<style data-shared-frames="v244">[\s\S]*?<\/style>/,'<style data-shared-fill="v245">.rafex-shared-foot-layer-v60{pointer-events:none}</style>');
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-shared-fill-v245.mjs')){const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!match)throw Error('Missing HTML');fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));}
