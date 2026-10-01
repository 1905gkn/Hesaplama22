import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* lossless-save-wire-v244 */'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('Missing '+a.slice(0,100));html=html.replace(a,b);};
 // The anchor rack already draws the shared frame. The old overlay drew it
 // a second time, with a thicker stroke and enlarged scale.
 const start=html.indexOf('  function renderSharedFeet(state,svg){'),end=html.indexOf('  function decorate(){',start);
 if(start<0||end<0)throw Error('Shared frame renderer missing');
 html=html.slice(0,start)+'  function renderSharedFeet(state,svg){\n    svg.querySelectorAll(\'.rafex-shared-foot-layer-v60\').forEach(node=>node.remove());\n    if(svg.__sharedFeetV146){svg.__sharedFeetV146.entries.clear();delete svg.__sharedFeetV146;}\n  }\n'+html.slice(end);
 replace("  let response;\n  try { response=await fetch(url", "  try{if(window.rafexPrepareWireV244)opt=await window.rafexPrepareWireV244(url,opt);}catch(error){throw fail('PAYLOAD',error.message);}\n  let response;\n  try { response=await fetch(url");
 replace('raw=await response.text();','raw=await (window.rafexReadWireV244?window.rafexReadWireV244(response):response.text());');
 const pos=html.lastIndexOf('</body>'),js=fs.readFileSync(new URL('./wire-client-v244.js',import.meta.url),'utf8');
 return html.slice(0,pos)+'<style data-shared-frames="v244">.m2-b2b-plan-upright.rafex-shared-upright-v60{display:none!important}</style><script>'+js+'</script>'+html.slice(pos);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-shared-save-v244.mjs')){const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!match)throw Error('Missing HTML');fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));}
