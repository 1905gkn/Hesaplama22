import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-lane-contour="v210"'))return html;
 const code=`<style data-lane-contour="v210">
#page #m2LayoutSvg [data-rack]:has(.rafex-plan-detail-v143)>.m2-layout-rack:is(.selected,:not(.selected)){stroke-opacity:0!important;fill-opacity:0!important}
#page #m2LayoutSvg[data-lane-pressed-v210] [data-rack]:has(.rafex-plan-detail-v143)>.m2-layout-rack.selected{stroke-opacity:1!important;fill-opacity:.12!important}
</style><script>(()=>{
let active=null;
function clear(){active?.removeAttribute('data-lane-pressed-v210');active=null;}
document.addEventListener('pointerdown',event=>{clear();const group=event.target.closest?.('#m2LayoutSvg [data-rack]');if(event.button!==0||!group?.querySelector('.rafex-plan-detail-v143'))return;active=group.closest('svg');active?.setAttribute('data-lane-pressed-v210','1');},true);
window.addEventListener('pointerup',clear,true);window.addEventListener('pointercancel',clear,true);window.addEventListener('blur',clear);document.addEventListener('lostpointercapture',clear,true);
})();</script>`;
 const at=html.lastIndexOf('</body>');return html.slice(0,at)+code+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-lane-contour-v210.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}

