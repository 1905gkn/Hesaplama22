import fs from 'node:fs';

export function transform(html){
 if(html.includes('/* bounded-plan-v247:'))return html;
 const a=html.indexOf('      function m2PlanWithLengths('),b=html.indexOf('      function m2PartRows(',a);
 if(a<0||b<0)throw Error('Plan anchors missing');
 html=html.slice(0,a)+fs.readFileSync(new URL('./plan-v247.js',import.meta.url),'utf8')+html.slice(b);
 const change=(before,after)=>{if(!html.includes(before))throw Error('Manual plan limit anchor missing: '+before);html=html.replace(before,()=>after);};
 change('m2ManualPlanRows.push({ kind:"brace", length:1200, count:1 })','m2ManualPlanRows.push({ kind:"brace", length:m2PlanMaximumDepth(), count:1 })');
 change('min="500" max="1200" step="5" value="${row.length}"','min="500" max="${m2PlanMaximumDepth()}" step="5" value="${row.length}"');
 change('row.length <= 1200','row.length <= m2PlanMaximumDepth()');
 change('"Her ölçü 500–1.200 mm, her adet en az 1 olmalıdır."','`Her ölçü 500–${fmt(m2PlanMaximumDepth())} mm, her adet en az 1 olmalıdır.`');
 change('hasExtra ? 1 : 0}`; }','hasExtra ? 1 : 0}|${m2PlanMaximumDepth()}`; }');
 return html;
}

if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-mekik-freeze-v247.mjs')){
 const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!match)throw Error('Missing HTML');
 fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));
}
