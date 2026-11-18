import fs from 'node:fs';
import {buildSync} from 'esbuild';
const cacheBundle=buildSync({entryPoints:['client/output-capture-cache.entry.js'],bundle:true,format:'iife',target:'es2022',minify:true,write:false}).outputFiles[0].text;
export function transform(html){
 if(html.includes('/* output-timings-v590 */'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Output timing anchor missing: '+a.slice(0,70));html=html.replace(a,b);};
 replace('/* output-performance-v578 */const started578=performance.now();','/* output-performance-v578 */const started578=performance.now();/* output-timings-v590 */const stages590=[];');
 replace('documentState.activeAreaId=area.id;if(areas.length>1)restore(area.layout,false);await render({sections:areas.length===1});','const areaStarted590=performance.now();documentState.activeAreaId=area.id;if(areas.length>1)restore(area.layout,false);await render({sections:areas.length===1});stages590.push({stage:"area",index:areaIndex578,racks:area.layout.racks?.length||0,ms:Math.round(performance.now()-areaStarted590)});');
 replace('restore(layout,false);await new Promise(requestAnimationFrame);await render({sharedOnly:true});','const sectionsStarted590=performance.now();restore(layout,false);await new Promise(requestAnimationFrame);await render({sharedOnly:true});stages590.push({stage:"sharedSections",ms:Math.round(performance.now()-sectionsStarted590)});');
 replace('    window.rafexCombineProductPages(target);','    const paginationStarted590=performance.now();window.rafexCombineProductPages(target);stages590.push({stage:"pagination",ms:Math.round(performance.now()-paginationStarted590)});target.dataset.outputStages590=JSON.stringify(stages590);');
 // Also update older local preview fixtures without regenerating the base build.
 return html.replace('await window.rafexSectionImageCache579?.put(durableKey579,src);','void Promise.resolve(window.rafexSectionImageCache579?.put(durableKey579,src)).catch(()=>{});').replace(/<script data-output-image-cache="v579">[\s\S]*?<\/script>/,()=>'<script data-output-image-cache="v579">'+cacheBundle+'</script>');
}
if(/[\\/]output-timings-v590\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,s);
}
