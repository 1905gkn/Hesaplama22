import fs from 'node:fs';
import crypto from 'node:crypto';
export function splitRuntimeAssets(html){
const assets=new Map();
// Only independently injected, known top-level runtimes. Preserve execution order.
for(const marker of ['data-rafex-common-single-line-letter="v58"','data-rafex-type-letter-scale="v65"','data-layout-budget="v152"']){
 const open='<script '+marker+'>',start=html.lastIndexOf(open);if(start<0)throw Error('Missing runtime '+marker);
 const end=html.indexOf('</script>',start),body=html.slice(start+open.length,end);
 if(end<0)throw Error('Unclosed runtime '+marker);
 const name=crypto.createHash('sha256').update(body).digest('hex').slice(0,20)+'.js';assets.set('/runtime-assets/'+name,body);
 html=html.slice(0,start)+'<script '+marker+' src="/runtime-assets/'+name+'"></script>'+html.slice(end+9);
}
return {html,assets};
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/split-runtime-assets-v152.mjs')){
 const file='dist/index.html',{html,assets}=splitRuntimeAssets(fs.readFileSync(file,'utf8'));
 fs.mkdirSync('dist/runtime-assets',{recursive:true});
 for(const [path,body] of assets)fs.writeFileSync('dist'+path,body);
 fs.writeFileSync(file,html);
}
