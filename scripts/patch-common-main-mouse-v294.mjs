import fs from 'node:fs';
export const runtime=`/* common-main-mouse-v294 */
(()=>{
 const common=()=>document.querySelector('#nav button.active[data-page]')?.dataset.page==='free'||document.getElementById('page')?.dataset.rafexAuthorityMode==='common';
 function wrap(name){const api=window[name];if(!api)return;
  for(const method of ['mount','createDetached']){const original=api[method];if(typeof original!=='function'||original.__commonMouseV294)continue;
   const wrapped=function(canvas,...args){const viewer=original.call(this,canvas,...args);if(common()&&(canvas?.closest?.('#m2Front')||['mrCanvas','konsolCanvas','b2bMain3DCanvas'].includes(canvas?.id)))window.rafexDetailMouseV293?.(viewer,canvas);return viewer;};
   wrapped.__commonMouseV294=true;api[method]=wrapped;
  }
 }
 for(const [api,event]of [['RafexB2BViewer','rafex-b2b-viewer-ready'],['RafexMRViewer','rafex-mr-viewer-ready'],['RafexKonsolViewer','rafex-konsol-viewer-ready']]){wrap(api);window.addEventListener(event,()=>wrap(api));}
})();`;
export function transform(html){if(html.includes('common-main-mouse-v294'))return html;if(!html.includes('detail-held-wheel-v293'))throw Error('Missing shared mouse controller');const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body');return html.slice(0,end)+'<script>'+runtime+'</script>'+html.slice(end);}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-common-main-mouse-v294.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
