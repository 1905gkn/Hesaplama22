import fs from 'node:fs';
export function transform(html){if(html.includes('data-tool-menus="v216"'))return html;const addition=`
<style data-tool-menus="v216">
#page .rafex-floating-tools-v214{opacity:.35;transition:opacity .16s ease;background:rgba(255,255,255,.35);box-shadow:none}
#page .rafex-floating-tools-v214:hover,#page .rafex-floating-tools-v214:focus-within{opacity:1;background:rgba(255,255,255,.96);box-shadow:0 3px 12px #173c2d22}
#page .rafex-menu-v216{position:relative;display:block;flex-shrink:0}
#page .rafex-menu-v216>summary{list-style:none;cursor:pointer;padding:9px 12px;border:1px solid #aac5b5;border-radius:7px;background:#fff;color:#173c2d;font-size:12px;font-weight:800;white-space:nowrap}
#page .rafex-menu-v216>summary::-webkit-details-marker{display:none}
#page .rafex-menu-v216>summary:after{content:' ▾'}
#page .rafex-menu-v216[open]>summary{background:#e5f0e9}
#page .rafex-menu-v216>.m2-floor-tools{position:absolute;top:calc(100% + 6px);left:0;width:250px;max-width:80vw;max-height:60vh;overflow:auto;z-index:40;display:block!important;margin:0!important;padding:10px!important;border:1px solid #aac5b5;border-radius:10px;background:#fff;box-shadow:0 6px 20px #173c2d33}
#page .rafex-menu-v216:not([open])>.m2-floor-tools{display:none!important}
#page .rafex-menu-v216>.m2-floor-tools>.m2-tool-group{display:flex!important;flex-direction:column!important;gap:6px!important;padding:0!important;border:0!important;width:100%!important}
#page .rafex-menu-v216 .m2-tool-group-title{display:none!important}
#page .rafex-menu-v216 .m2-tool-group>button,#page .rafex-menu-v216 .m2-tool-group>label{width:100%!important;margin:0!important;min-height:34px;box-sizing:border-box}
#page .rafex-menu-v216 .m2-summary-toggles{display:flex!important;flex-direction:column!important;gap:6px}
#page .rafex-menu-v216 .m2-summary-toggles button{width:100%!important}
#page .m2-floor-tools:has(>.area-tools):not(:has(>.rack-tools)){grid-template-columns:minmax(0,1fr)}
#page .rafex-plan-toolbar-v150 .m2-layout-zoom-floating{flex-wrap:wrap;overflow:visible}
</style><script data-tool-menus="v216">
(function(){
function mount(){const center=document.getElementById('m2CenterV169');if(!center)return;let last=center;for(const entry of [['measure-tools','Ölçü ve Yazı'],['rack-tools','Raf İşlemleri']]){let menu=document.getElementById('rafex-menu-'+entry[0]+'-v216');if(!menu){const group=document.querySelector('.m2-floor-tools>.'+entry[0]);if(!group)continue;menu=document.createElement('details');menu.id='rafex-menu-'+entry[0]+'-v216';menu.className='rafex-menu-v216';const summary=document.createElement('summary');summary.textContent=entry[1];const popup=document.createElement('div');popup.className='m2-floor-tools';popup.appendChild(group);menu.append(summary,popup);menu.addEventListener('toggle',()=>{if(menu.open)document.querySelectorAll('.rafex-menu-v216').forEach(other=>{if(other!==menu)other.open=false})});popup.addEventListener('click',event=>{if(event.target.closest('button'))menu.open=false});}if(last.nextElementSibling!==menu)last.after(menu);last=menu;}}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;mount()})}
function start(){const page=document.getElementById('page');if(page)new MutationObserver(records=>{if(records.some(r=>Array.from(r.addedNodes).some(n=>n.nodeType===1&&n.namespaceURI!=='http://www.w3.org/2000/svg'&&(n.id==='m2CenterV169'||n.matches?.('.m2-floor-editor,.rafex-plan-toolbar-v150')||n.querySelector?.('.rafex-plan-toolbar-v150')))))schedule()}).observe(page,{childList:true,subtree:true});schedule()}
document.addEventListener('click',event=>{if(!event.target.closest('.rafex-menu-v216'))document.querySelectorAll('.rafex-menu-v216[open]').forEach(menu=>menu.open=false)});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.rafex-menu-v216[open]').forEach(menu=>{menu.open=false;menu.querySelector('summary').focus()})});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();</script>`;const end=html.lastIndexOf('</body>');return html.slice(0,end)+addition+html.slice(end);}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-tool-menus-v216.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

