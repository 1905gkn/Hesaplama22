import fs from 'node:fs';
export function transform(html){if(html.includes('section-variants-v234'))return html;
const old='    const counts = settings.counts.length ? settings.counts : type.existingCounts;';if(!html.includes(old))throw Error('Missing count selection');
return html.replace(old,`    /* section-variants-v234: variants require explicit multi-view selection */
    const editing=document.getElementById('m2SectionPlacementModal')?.hidden===false;
    const multiple=editing||document.getElementById('m2ReportCompleteFront')?.checked===true;
    const available=type.existingCounts?.length?type.existingCounts:[...type.entries.keys()].sort((a,b)=>b-a);
    const requested=settings.counts.length?settings.counts:available;
    const counts=multiple?requested:[available[0]];`);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-section-variants-v234.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}
