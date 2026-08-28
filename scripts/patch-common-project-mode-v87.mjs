import fs from "node:fs";

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('Common project v87: HTML_BASE64 not found');
let html=Buffer.from(match[2],'base64').toString('utf8');
html=html.replace(/<style data-rafex-common-project-mode="v87">[\s\S]*?<\/style>/g,'').replace(/<script data-rafex-common-project-mode="v87">[\s\S]*?<\/script>/g,'');

const runtime=String.raw`<style data-rafex-common-project-mode="v87">
#page.rafex-free-drawing-page .rafex-common-project-name-v87{display:block!important;margin:0 0 10px!important;padding:10px 12px!important;border:1px solid #d8e5dc!important;border-radius:10px!important;background:#f7faf8!important}
#page.rafex-free-drawing-page .rafex-common-project-name-v87>span{display:block;margin-bottom:6px;color:#31513f;font-size:10px;font-weight:900;letter-spacing:.04em}
#page.rafex-free-drawing-page .rafex-common-project-name-v87 input{width:100%;padding:10px 11px;border:1px solid #cfded3;border-radius:8px;background:#fff;color:#17201b;font-weight:800;outline:0}
#page.rafex-free-drawing-page .rafex-common-project-name-v87 input:focus{border-color:#b89b00;box-shadow:0 0 0 3px #f2c50033}
#page.rafex-free-drawing-page [data-rafex-native-project-name-v87="1"]{display:none!important}
</style>
<script data-rafex-common-project-mode="v87">(()=>{
  if(window.__rafexCommonProjectModeV87)return;window.__rafexCommonProjectModeV87=true;
  let commonName='',commonLocked=false,explicitNavExit=false,refreshing=false,activeCommonProject=null,repairQueued=false,userExited=false;
  const low=(v)=>String(v||'').toLocaleLowerCase('tr-TR').trim();
  const projectSystems=(project)=>new Set((project?.payload?.layout?.racks||[]).map((rack)=>low(rack?.rafexSystem||(rack?.b2b?.mr?'mr':rack?.b2bLayout?'b2b':''))).filter(Boolean));
  const isCommonProject=(project)=>low(project?.module)==='ortak'||projectSystems(project).size>1;
  const pageIsCommon=()=>{const p=document.getElementById('page');return !!(p&&(p.dataset.rafexFreeDrawing==='1'||p.classList.contains('rafex-free-drawing-page')));};
  const commonActive=()=>commonLocked||pageIsCommon()||!!window.rafexUnifiedFreeDrawingActiveV75?.();
  const nativeProjectInput=()=>document.getElementById('m2ProjectName');
  const commonInput=()=>document.getElementById('rafexCommonProjectNameV87');
  function setCommonName(value){commonName=String(value||'');const input=commonInput();if(input&&input.value!==commonName)input.value=commonName;}
  function ensureCommonNameField(){
    if(!pageIsCommon())return;
    const native=nativeProjectInput();if(!native)return;
    const nativeLabel=native.closest('label');if(nativeLabel)nativeLabel.dataset.rafexNativeProjectNameV87='1';
    let input=commonInput();
    if(!input){
      const label=document.createElement('label');label.className='rafex-common-project-name-v87';
      label.innerHTML='<span>ORTAK ÇİZİM PROJE ADI</span><input id="rafexCommonProjectNameV87" type="text" maxlength="120" placeholder="Örn. Depo Ortak Yerleşim">';
      const anchor=nativeLabel||native;anchor.parentNode?.insertBefore(label,anchor);
      input=label.querySelector('input');input?.addEventListener('input',()=>{commonName=input.value;});
    }
    if(input&&input.value!==commonName)input.value=commonName;
  }
  function lockCommonProject(project,asCopy=false){
    commonLocked=true;userExited=false;activeCommonProject=project||activeCommonProject;
    const name=String(project?.project_name||commonName||'')+(asCopy?' - Kopya':'');if(name)setCommonName(name);
    requestAnimationFrame(ensureCommonNameField);setTimeout(ensureCommonNameField,80);setTimeout(ensureCommonNameField,350);
  }
  function openCommonProject(project,asCopy=false){
    if(!project||!isCommonProject(project))return false;
    lockCommonProject(project,asCopy);
    if(typeof window.rafexLoadUnifiedProjectV75==='function')return window.rafexLoadUnifiedProjectV75(project,asCopy)!==false;
    try{window.showPage?.('free');requestAnimationFrame(()=>window.m2ApplyProjectRecord?.(project,asCopy));return true}catch{return false}
  }
  function repairCommonMode(){
    if(repairQueued||userExited||!commonLocked||pageIsCommon())return;
    repairQueued=true;setTimeout(()=>{repairQueued=false;if(userExited||!commonLocked||pageIsCommon())return;
      if(activeCommonProject&&typeof window.rafexLoadUnifiedProjectV75==='function')window.rafexLoadUnifiedProjectV75(activeCommonProject,false);
      else window.rafexEnterUnifiedFreeDrawing?.();
      setTimeout(ensureCommonNameField,60);
    },40);
  }
  async function restoreCommonFromQuery(){
    if(userExited)return;
    let wanted='';try{wanted=String(new URLSearchParams(location.search).get('project')||'').trim();}catch{}if(!wanted)return;
    try{
      const request=window.req||((typeof req==='function')?req:null);if(typeof request!=='function')return;
      const result=await request('/api/projects'),wantedNo=Number(wanted),project=(result?.projects||[]).find((item)=>String(item?.serial_no??'').padStart(4,'0')===String(Number.isFinite(wantedNo)?wantedNo:wanted).padStart(4,'0')||Number(item?.serial_no)===wantedNo);
      if(project&&isCommonProject(project))openCommonProject(project,false);
    }catch{}
  }
  document.addEventListener('click',(event)=>{
    const button=event.target?.closest?.('#nav button[data-page]');if(!button)return;
    if(button.dataset.page==='free'){commonLocked=true;userExited=false;requestAnimationFrame(ensureCommonNameField);return;}
    explicitNavExit=true;commonLocked=false;userExited=true;activeCommonProject=null;setTimeout(()=>{explicitNavExit=false;},0);
  },true);
  const previousShowPage=window.showPage;
  if(typeof previousShowPage==='function'&&!previousShowPage.__rafexCommonProjectV87){
    const wrapped=function(name){
      if(commonLocked&&!explicitNavExit&&['b2b','mr','mekik2'].includes(String(name))){repairCommonMode();return;}
      if(String(name)==='free'){commonLocked=true;userExited=false;}
      return previousShowPage.apply(this,arguments);
    };
    wrapped.__rafexCommonProjectV87=true;window.showPage=wrapped;try{showPage=wrapped}catch{}
  }
  const previousLoadProject=window.m2LoadProject;
  if(typeof previousLoadProject==='function'&&!previousLoadProject.__rafexCommonProjectV87){
    const wrapped=async function(id){
      let rows=Array.isArray(window.m2ProjectRecords)?window.m2ProjectRecords:typeof m2ProjectRecords!=='undefined'?m2ProjectRecords:[];
      let project=rows.find((item)=>Number(item?.id)===Number(id));
      if(!project){try{const request=window.req||req,result=await request('/api/projects');project=(result?.projects||[]).find((item)=>Number(item?.id)===Number(id));}catch{}}
      if(project&&isCommonProject(project))return openCommonProject(project,false);
      return previousLoadProject.apply(this,arguments);
    };
    wrapped.__rafexCommonProjectV87=true;window.m2LoadProject=wrapped;try{m2LoadProject=wrapped}catch{}
  }
  const previousRefreshProjects=window.m2RefreshProjects;
  if(typeof previousRefreshProjects==='function'&&!previousRefreshProjects.__rafexCommonProjectV87){
    const wrapped=async function(){
      if(!commonActive()||refreshing)return previousRefreshProjects.apply(this,arguments);
      refreshing=true;
      try{const request=window.req||req,result=await request('/api/projects'),rows=(result?.projects||[]).filter(isCommonProject);try{m2ProjectRecords=rows}catch{}window.m2ProjectRecords=rows;window.m2RenderProjects?.();try{m2RenderProjects?.()}catch{}}
      catch(error){const status=document.getElementById('m2FloorStatus');if(status)status.textContent=error?.message||'Ortak projeler getirilemedi.';}finally{refreshing=false;}
    };
    wrapped.__rafexCommonProjectV87=true;window.m2RefreshProjects=wrapped;try{m2RefreshProjects=wrapped}catch{}
  }
  const previousSaveProject=window.m2SaveProject;
  if(typeof previousSaveProject==='function'&&!previousSaveProject.__rafexCommonProjectV87){
    const wrapped=function(){
      if(commonActive()){
        commonLocked=true;userExited=false;ensureCommonNameField();const name=String(commonInput()?.value||commonName||'').trim();
        if(!name){const msg=document.getElementById('m2ProjectSaveMsg');if(msg)msg.textContent='Kaydedilemedi: Ortak Çizim proje adı yazılmadı.';commonInput()?.focus();return;}
        commonName=name;const native=nativeProjectInput();if(native)native.value=name;
      }
      return previousSaveProject.apply(this,arguments);
    };
    wrapped.__rafexCommonProjectV87=true;window.m2SaveProject=wrapped;try{m2SaveProject=wrapped}catch{}
  }
  const previousReq=window.req;
  if(typeof previousReq==='function'&&!previousReq.__rafexCommonProjectV87){
    const wrapped=async function(url,opt={}){
      if(url==='/api/projects'&&String(opt?.method||'GET').toUpperCase()==='POST'&&commonActive()){
        try{const body=JSON.parse(opt.body||'{}');body.module='ortak';const name=String(commonInput()?.value||commonName||body.projectName||'').trim();if(name)body.projectName=name;opt={...opt,body:JSON.stringify(body)};}catch{}
      }
      return previousReq.call(this,url,opt);
    };
    wrapped.__rafexCommonProjectV87=true;window.req=wrapped;try{req=wrapped}catch{}
  }
  const observer=new MutationObserver(()=>{if(pageIsCommon())ensureCommonNameField();else repairCommonMode();});observer.observe(document.documentElement,{childList:true,subtree:true});
  if(pageIsCommon()){commonLocked=true;ensureCommonNameField();}
  setTimeout(restoreCommonFromQuery,350);setTimeout(restoreCommonFromQuery,1200);setTimeout(repairCommonMode,1800);
  window.rafexIsCommonProjectV87=isCommonProject;window.rafexOpenCommonProjectV87=openCommonProject;
})();</script>`;
html=html.replace('</body>',runtime+'\n</body>');
if(!html.includes('data-rafex-common-project-mode="v87"'))throw new Error('Common project v87 marker missing');
const encoded=Buffer.from(html,'utf8').toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('v87.1: Ortak Cizim kendi kendini korur; proje adi ayridir; kayit module=ortak zorunludur.');
