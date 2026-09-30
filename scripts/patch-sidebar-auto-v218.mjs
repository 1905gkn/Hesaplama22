import fs from 'node:fs';
export function transform(html){if(html.includes('data-sidebar-auto="v218"'))return html;const extra=`<style data-sidebar-auto="v218">
@media(min-width:901px){
#app.rafex-side-compact-v218{--rafex-side-width:60px;grid-template-columns:60px minmax(0,1fr)!important}
#app.rafex-side-compact-v218>.content{min-width:0;margin-left:60px!important;width:calc(100% - 60px)!important}
#app.rafex-side-compact-v218>.side{width:60px!important;box-sizing:border-box;padding:20px 6px!important;z-index:60;overflow:hidden;transition:width .18s ease,padding .18s ease}
#app.rafex-side-compact-v218>.side:is(:hover,:has(:focus-visible)){width:240px!important;padding:20px 14px!important;box-shadow:8px 0 24px #173c2d33}
#app.rafex-side-compact-v218>.side:not(:hover):not(:has(:focus-visible)) .side-brand{padding:5px 0 18px}
#app.rafex-side-compact-v218>.side:not(:hover):not(:has(:focus-visible)) .side-logo{padding:3px;width:48px}
#app.rafex-side-compact-v218>.side:not(:hover):not(:has(:focus-visible)) .nav button{font-size:0;gap:0;padding:12px;white-space:nowrap}
#app.rafex-side-compact-v218>.side:not(:hover):not(:has(:focus-visible)) .nav i{font-size:12px;flex-shrink:0}
#app.rafex-side-compact-v218>.side:not(:hover):not(:has(:focus-visible)) .userbox{opacity:0;pointer-events:none}
}
@media(prefers-reduced-motion:reduce){#app.rafex-side-compact-v218>.side{transition:none}}
</style><script data-sidebar-auto="v218">(function(){let active=false,timer=0;function sync(){const app=document.getElementById('app'),page=document.getElementById('page');if(!app)return;const common=!!document.querySelector('#nav button.active[data-page="free"]')||page?.getAttribute('data-rafex-common-active')==='1';if(common===active)return;active=common;clearTimeout(timer);app.classList.remove('rafex-side-compact-v218');if(common)timer=setTimeout(()=>{if(active)app.classList.add('rafex-side-compact-v218')},10000)}function start(){const nav=document.getElementById('nav'),page=document.getElementById('page');if(nav)new MutationObserver(sync).observe(nav,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-page']});if(page)new MutationObserver(sync).observe(page,{attributes:true,attributeFilter:['data-rafex-common-active']});sync()}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start()})();</script>`;const end=html.lastIndexOf('</body>');return html.slice(0,end)+extra+html.slice(end);}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-sidebar-auto-v218.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}

