import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* solid-shared-feet-v273 */'))return html;
 const start=html.indexOf('  function renderSharedFeet(state,svg){'),end=html.indexOf('  function decorate(){',start);
 if(start<0||end<start)throw Error('Shared upright renderer missing');
 html=html.slice(0,start)+`  function renderSharedFeet(state,svg){
    /* solid-shared-feet-v273: the anchor already owns the physical shared upright */
    svg.querySelectorAll(':scope > .rafex-shared-foot-layer-v60').forEach(node=>node.remove());
    if(svg.__sharedFeetV146){svg.__sharedFeetV146.entries.clear();delete svg.__sharedFeetV146;}
    svg.querySelectorAll('[data-rack] .m2-b2b-plan-upright:not(.rafex-profile-merge-source-v61)').forEach(node=>{if(node.style.getPropertyValue('opacity')==='0')node.style.setProperty('opacity','1','important');});
  }
`+html.slice(end);
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-solid-shared-feet-v273.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}
