import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* visible-collision-v303 */'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Missing v303 anchor: '+a.slice(0,100));html=html.replace(a,b);};
 replace('const overlap = m2LayoutState.racks.find((rack) => m2RackOverlaps(rack));',`/* visible-collision-v303 */
        const symbolOverlap = m2LayoutState.racks.find((rack) => m2RackOverlapsBlockingSymbol(rack));
        if (symbolOverlap) return \\u0060\${symbolOverlap.typeName || "Raf"} bir kolon veya engel sembolüyle çakışıyor. Çizimdeki sembolü veya rafı ayır.\\u0060;
        const overlap = m2LayoutState.racks.find((rack) => m2RackOverlaps(rack));`.replaceAll('\\u0060','`'));
 replace('if(symbol?.type!=="barrier")return;const host=', 'if(symbol?.type==="column"){layer.appendChild(node);return;}if(symbol?.type!=="barrier")return;const host=');
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-visible-collision-v303.mjs')){
 const file=process.argv[2]||'dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!match)throw Error('Missing HTML');
 fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));
}