import fs from 'node:fs';
export function transform(html){
 if(html.includes('project-list-lazy-v315'))return html;
 html=html.replace('<b>${metric}</b></button><div class="history-detail">','<b>${p.__summary?"Detay için aç":metric}</b></button><div class="history-detail">');
 const runtime=`<script>
/* project-list-lazy-v315 */
(()=>{
 const originalReq=req,pending=new Map();
 req=async function(path,options){
  if(path==='/api/projects'&&(!options?.method||options.method==='GET'))path='/api/projects?summary=1';
  return originalReq.call(this,path,options);
 };
 function records(){return [...(typeof projects==='undefined'?[]:projects),...(typeof m2ProjectRecords==='undefined'?[]:m2ProjectRecords)];}
 async function hydrate(id){
  const current=records().find(p=>Number(p.id)===Number(id)&&!p.__summary);if(current)return current;
  if(pending.has(Number(id)))return pending.get(Number(id));
  const task=(async()=>{
   const data=await req('/api/projects/'+Number(id),{cache:'no-store'}),full=data.project;
   if(!full?.payload)throw Error('Proje verisi alınamadı.');
   for(const list of [typeof projects==='undefined'?[]:projects,typeof m2ProjectRecords==='undefined'?[]:m2ProjectRecords]){
    const record=list.find(p=>Number(p.id)===Number(id));if(record)Object.assign(record,full,{__summary:false});
   }
   return full;
  })();pending.set(Number(id),task);
  try{return await task;}finally{pending.delete(Number(id));}
 }
 function action(original,index=0){return async function(...args){try{await hydrate(args[index]);return await original.apply(this,args);}catch(error){alert(error.message);}};}
 copyProject=window.copyProject=action(copyProject);
 m2LoadProject=window.m2LoadProject=action(m2LoadProject);
 window.rafexOpenHistoryProjectV134=action(window.rafexOpenHistoryProjectV134);
 window.rafexToggleHistoryV261=action(window.rafexToggleHistoryV261,1);
 const apply=m2ApplyProjectRecord;
 m2ApplyProjectRecord=window.m2ApplyProjectRecord=function(project,...args){
  if(project?.__summary)return hydrate(project.id).then(full=>apply.call(this,full,...args)).catch(error=>{alert(error.message);return false;});
  return apply.call(this,project,...args);
 };
})();
</script>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body');return html.slice(0,end)+runtime+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-project-list-lazy-v315.mjs')){
 const file=process.argv[2]||'dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
