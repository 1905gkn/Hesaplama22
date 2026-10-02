import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* history-speed-v261 */'))return html;
 const rep=(a,b)=>{if(html.split(a).length!==2)throw Error('Anchor mismatch '+a.slice(0,90));html=html.replace(a,b);};
 rep('m2ClearMultiSelection();m2RenderLayout();requestAnimationFrame(()=>m2RenderLayout());','m2ClearMultiSelection();if(!(commonV186&&payload.areas?.length&&window.rafexAreaOutputIsCurrent)){m2RenderLayout();requestAnimationFrame(()=>m2RenderLayout());}');
 rep('      async function loadProjects() {\n        projects = (await req("/api/projects")).projects;\n      }',`      /* history-speed-v261 */
      let projectListTimeV261=0,projectListEpochV261=0,projectListRequestV261=null;
      async function loadProjects() {
        if(projectListTimeV261&&Date.now()-projectListTimeV261<15000)return;
        if(projectListRequestV261)return projectListRequestV261;
        const epoch=projectListEpochV261;
        const request=(async()=>{const data=await req('/api/projects');if(epoch!==projectListEpochV261)return;projects=data.projects;projectListTimeV261=Date.now();})();
        projectListRequestV261=request;
        try{await request;}finally{if(projectListRequestV261===request)projectListRequestV261=null;}
      }`);
 // Invalidate both before and after mutations, including failed requests and account changes.
 html=html.replaceAll('if (invalidatesProjects) pendingProjectList = null;','if (invalidatesProjects) {pendingProjectList = null;projectListTimeV261=0;projectListEpochV261++;projectListRequestV261=null;}');
 rep("onclick=\"document.getElementById('hp${i}').classList.toggle('open')\"","onclick=\"rafexToggleHistoryV261(this,${p.id})\"");
 const start=html.indexOf('      function renderHistoryProjects()'),end=html.indexOf('      function openHistory()',start);
 const section=html.slice(start,end),needle='${historyProjectBody(p, x, inp)}</div></div>`;';
 if(section.split(needle).length!==2)throw Error('History body anchor mismatch');
 html=html.slice(0,start)+section.replace(needle,'<div data-history-body-v261="${p.id}"></div></div></div>`;')+html.slice(end);
 rep('      function openHistory() {\n        loadProjects().then(() => {\n          $("historyFilters").hidden = false;\n          renderHistoryProjects();\n          $("historyModal").classList.add("open");\n        });\n      }',`      function openHistory() {
        $('historyFilters').hidden=false;
        $('historyModal').classList.add('open');
        if(projects.length)renderHistoryProjects();else $('historyList').textContent='Projeler yükleniyor…';
        const before=projects;
        loadProjects().then(()=>{if(projects!==before||!before.length)renderHistoryProjects();}).catch(error=>{
          const message=document.createElement('div');message.setAttribute('role','status');message.textContent='Proje listesi yenilenemedi: '+error.message;$('historyList').prepend(message);
        });
      }
      window.rafexToggleHistoryV261=function(button,id){
        const row=button.closest('.history-item');if(!row)return;
        const body=row.querySelector('[data-history-body-v261]'),p=projects.find(p=>Number(p.id)===Number(id));
        if(body&&!body.dataset.loaded&&p){body.innerHTML=historyProjectBody(p,p.payload||{},p.payload?.inputs||{});body.dataset.loaded='1';}
        row.classList.toggle('open');
      };`);
 return html;
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-history-speed-v261.mjs')){const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));}
