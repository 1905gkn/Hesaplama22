import fs from 'node:fs';
export function transform(html){
 if(html.includes('section-viewer-loader-v290'))return html;
 const anchor="if(typeof window.rafexLoadViewerOnDemandV3==='function')return Promise.resolve(window.rafexLoadViewerOnDemandV3(system)).then(()=>{if(!window[api])throw Error(system+' 3D motoru hazırlanamadı');return true;});";
 if(!html.includes(anchor))throw Error('Missing section viewer loader');
 return html.replace(anchor,"/* section-viewer-loader-v290 */ const loader=system==='konsol'?window.rafexLoadHeavyViewerV1:window.rafexLoadViewerOnDemandV3;\n    if(typeof loader==='function')return Promise.resolve(loader(system)).then(()=>{if(!window[api])throw Error(system+' 3D motoru hazırlanamadı');return true;});");
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-section-viewer-loader-v290.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
