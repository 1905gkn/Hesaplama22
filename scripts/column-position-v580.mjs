import fs from 'node:fs';import {pathToFileURL} from 'node:url';
export function transform(html){
 if(html.includes('data-saved-column-position="v580"'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Column v580 anchor missing: '+a.slice(0,80));html=html.replace(a,b);};
 replace('if(!s.cadImported||s.cadBoundsVersion363||!solid(s.cadElement))continue;','if(!s.cadImported||s.cadBoundsVersion363||(s.type==="column"&&s.preserveSavedPosition580)||!solid(s.cadElement))continue;');
 replace('const v=clone(layout);restoring=true;','const v=clone(layout);window.rafexKeepSavedColumns580?.(v.symbols);restoring=true;');
 replace('m2LayoutSymbols=Array.isArray(restoredLayout.symbols)?restoredLayout.symbols:[];','m2LayoutSymbols=Array.isArray(restoredLayout.symbols)?restoredLayout.symbols:[];window.rafexKeepSavedColumns580?.(m2LayoutSymbols);');
 const helper='<script data-saved-column-position="v580">window.rafexKeepSavedColumns580=function(columns){for(const s of columns||[])if(s.type==="column"&&[s.x,s.y,s.w,s.h].every(v=>Number.isFinite(Number(v)))&&Number(s.w)>0&&Number(s.h)>0)s.preserveSavedPosition580=true;};</script>';
 const at=html.indexOf('<script data-project-roundtrip="v362">');if(at<0)throw Error('Column helper anchor missing');return html.slice(0,at)+helper+html.slice(at);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,s);
}
