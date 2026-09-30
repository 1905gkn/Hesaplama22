import fs from 'node:fs';
export function transform(html){if(html.includes('single-preview-v233'))return html;
const old="function b2bOptions(d){const storedV135=window.rafexReadRackDetailV135?.(d,'b2b');if(storedV135)return storedV135;";
if(!html.includes(old))throw Error('Missing detail options');
return html.replace(old,`/* single-preview-v233 */
 function normalizeRackPreviewV233(options,d){
   const out=copy(options),rows=Number(d.b2bLayout?.rowCount),rowType=rows===1?'single':rows===2?'double':d.b2b?.rowType;
   out.moduleCount=1;out.moduleOptions=null;
   if(rowType==='single'||rowType==='double')out.rowType=rowType;
   if(out.rowType==='single'){out.rowGap=0;out.straightTieCount=0;out.straightTiePositions=[];}
   else if(d.b2bLayout?.rowGap!=null)out.rowGap=Number(d.b2bLayout.rowGap);
   return out;
 }
 function b2bOptions(d){const storedV135=window.rafexReadRackDetailV135?.(d,'b2b');if(storedV135)return normalizeRackPreviewV233(storedV135,d);`)
 .replace('...(m2Rack3DOptions(drawing) || {}), moduleCount: 1','...(m2Rack3DOptions(drawing) || {}), moduleCount: 1, moduleOptions:null');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-single-preview-v233.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}
