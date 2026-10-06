import fs from 'node:fs';
export const runtime=String.raw`(function(){
let depth=0,busy=false;
const render=m2RenderLayout,types=m2RenderSavedRackTypes,apply=m2ApplyProjectRecord,open=window.rafexOpenHistoryProjectV134;
m2RenderLayout=function(){if(depth)return;return render.apply(this,arguments)};window.m2RenderLayout=m2RenderLayout;
m2RenderSavedRackTypes=function(){if(depth)return;return types.apply(this,arguments)};window.m2RenderSavedRackTypes=m2RenderSavedRackTypes;
function transaction(fn){depth++;try{return fn()}finally{if(--depth===0){types();render();}}}
m2ApplyProjectRecord=function(project,asCopy){return transaction(()=>apply.call(this,project,asCopy))};window.m2ApplyProjectRecord=m2ApplyProjectRecord;
window.rafexOpenHistoryProjectV134=async function(id){if(busy)return;busy=true;const previous=m2OpeningProjectFromHistory;
const note=document.createElement('div');note.setAttribute('role','status');note.id='rafexHistoryLoadingV271';note.textContent='Proje açılıyor…';note.style.cssText='position:fixed;inset:20px auto auto 50%;transform:translateX(-50%);z-index:2147483647;background:#fff;padding:14px 24px;border:1px solid #b3c8ba;border-radius:8px;color:#214f3b';document.body.appendChild(note);
try{await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));m2OpeningProjectFromHistory=true;return transaction(()=>open(id));}
catch(error){console.error('Proje açılamadı',error);const status=document.getElementById('m2FloorStatus');if(status)status.textContent='Proje açılamadı: '+error.message;}
finally{m2OpeningProjectFromHistory=previous;busy=false;note.remove();}
};
})();`;
export function transform(html){
 if(html.includes('data-history-open="v271"'))return html;
 const old='m2RenderLayout();requestAnimationFrame(()=>m2RenderLayout());';
 if(!html.includes(old))throw Error('Duplicate project render hook missing');
 html=html.replace(old,'m2RenderLayout(); /* history-open-v271: one final render */');
 const copy='const result=baseApply.call(this,structuredClone(project),asCopy);';
 if(!html.includes(copy))throw Error('Project copy hook missing');
 html=html.replace(copy,'const result=baseApply.call(this,project,asCopy);');
 const area='const payload=structuredClone(project.payload);\n      const mergedV186=';
 if(!html.includes(area))throw Error('Area project copy hook missing');
 html=html.replace(area,'const payload={rackTypes:project.payload.rackTypes,areas:structuredClone(project.payload.areas||[]),activeAreaId:project.payload.activeAreaId};\n      const mergedV186=');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing document body');
 return html.slice(0,end)+'<script data-history-open="v271">'+runtime+'</script>\n'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-history-open-v271.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}
