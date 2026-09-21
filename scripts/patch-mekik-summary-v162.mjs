import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-mekik-summary="v162"'))return html;
 const anchor="if(card&&!card.classList.contains('rafex-common-mekik-input-card'))card.classList.add('rafex-common-mekik-input-card');";
 if(!html.includes(anchor))throw Error('v162 Mekik input sync anchor missing');
 html=html.replace(anchor,anchor+`
    if(card){
      var sections=Array.from(card.children).filter(function(node){return node.matches('.m2-metrics,.m2-plan,.m2-note')});
      var details=card.querySelector(':scope > .mekik-summary-details');
      if(sections.length){
        if(!details){
          details=document.createElement('details');details.className='mekik-summary-details';
          var summary=document.createElement('summary');summary.textContent='Ölçü ve yük özeti';
          details.appendChild(summary);sections[0].before(details);
        }
        sections.forEach(function(node){details.appendChild(node)});
      }
    }`);
 const css=`<style data-mekik-summary="v162">
#page .rafex-common-mekik-input-card>.mekik-summary-details{margin:14px 18px 18px;border:1px solid #dcc5ca;border-radius:10px;padding:10px;min-width:0}
#page .mekik-summary-details>summary{cursor:pointer;font-weight:700;color:#701c2b;font-size:12px}
#page .mekik-summary-details>.m2-metrics{gap:5px;margin:10px 0 0}
#page#page .rafex-common-mekik-input-card .mekik-summary-details .m2-metric{padding:6px!important;border-radius:6px!important}
#page#page .rafex-common-mekik-input-card .mekik-summary-details .m2-metric b{font-size:11px!important;margin-top:2px!important}
#page .mekik-summary-details>.m2-plan,#page .mekik-summary-details>.m2-note{margin:10px 0 0}
#page .mekik-summary-details .m2-plan-head{flex-wrap:wrap;gap:6px;padding:8px}
#page .mekik-summary-details>.m2-note{padding:8px;font-size:10px}
</style>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body');
 return html.slice(0,end)+css+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-mekik-summary-v162.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
