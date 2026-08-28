import fs from "node:fs";

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('Common loader v88: HTML_BASE64 not found');
let html=Buffer.from(match[2],'base64').toString('utf8');
html=html.replace(/<script data-rafex-common-loader-normalize="v88">[\s\S]*?<\/script>/g,'');

const runtime=String.raw`<script data-rafex-common-loader-normalize="v88">(()=>{
  if(window.__rafexCommonLoaderNormalizeV88)return;window.__rafexCommonLoaderNormalizeV88=true;
  const marker=document.createElement('span');marker.textContent='RAFEX COMMON RUNTIME V88';marker.style.cssText='position:fixed;left:-10000px;top:-10000px;width:1px;height:1px;overflow:hidden';marker.dataset.rafexCommonRuntime='v88';document.body.appendChild(marker);
  const low=(v)=>String(v||'').toLocaleLowerCase('tr-TR').trim();
  const systemsOf=(project)=>new Set((project?.payload?.layout?.racks||[]).map((rack)=>low(rack?.rafexSystem||(rack?.b2b?.mr?'mr':rack?.b2bLayout?'b2b':''))).filter(Boolean));
  const isCommon=(project)=>low(project?.module)==='ortak'||systemsOf(project).size>1;
  const normalize=(project)=>isCommon(project)?{...project,module:'ortak'}:project;
  const realCommon=()=>window.rafexUnifiedFreeDrawingActiveV75?.()===true&&!!document.getElementById('rafexUnifiedSystemPicker');
  const enterCommon=()=>{
    if(realCommon())return true;
    try{if(typeof window.showPage==='function')window.showPage('free');}catch(error){console.warn('v88 showPage free',error);}
    if(!realCommon())try{if(typeof window.rafexEnterUnifiedFreeDrawing==='function')window.rafexEnterUnifiedFreeDrawing();}catch(error){console.warn('v88 enter unified',error);}
    return realCommon();
  };
  const install=()=>{
    const loader=window.rafexLoadUnifiedProjectV75;
    if(typeof loader==='function'&&!loader.__rafexCommonNormalizeV88){
      const wrapped=function(project,asCopy){
        const normalized=normalize(project),common=isCommon(normalized);
        if(common)enterCommon();
        const result=loader.call(this,normalized,asCopy);
        if(common){
          requestAnimationFrame(()=>{const title=document.getElementById('pageTitle');if(title)title.textContent='Ortak Çizim';});
          setTimeout(()=>{const title=document.getElementById('pageTitle');if(title)title.textContent='Ortak Çizim';},120);
        }
        return result;
      };
      wrapped.__rafexCommonNormalizeV88=true;wrapped.__rafexOriginal=loader;
      window.rafexLoadUnifiedProjectV75=wrapped;
    }
    const opener=window.rafexOpenCommonProjectV87;
    if(typeof opener==='function'&&!opener.__rafexCommonNormalizeV88){
      const wrapped=function(project,asCopy){const normalized=normalize(project);if(isCommon(normalized))enterCommon();return opener.call(this,normalized,asCopy);};
      wrapped.__rafexCommonNormalizeV88=true;wrapped.__rafexOriginal=opener;window.rafexOpenCommonProjectV87=wrapped;
    }
  };
  const forceQueryCommon=async()=>{
    let wanted='';try{wanted=String(new URLSearchParams(location.search).get('project')||'').trim();}catch{}if(!wanted)return;
    try{
      const request=window.req||((typeof req==='function')?req:null);if(typeof request!=='function')return;
      const result=await request('/api/projects'),wantedNo=Number(wanted),wantedPad=String(Number.isFinite(wantedNo)?wantedNo:wanted).padStart(4,'0');
      const project=(result?.projects||[]).find((item)=>String(item?.serial_no??'').padStart(4,'0')===wantedPad||Number(item?.serial_no)===wantedNo);
      if(!project||!isCommon(project))return;
      install();enterCommon();
      requestAnimationFrame(()=>{
        enterCommon();install();const loader=window.rafexLoadUnifiedProjectV75;if(typeof loader!=='function')return;
        loader(normalize(project),false);
        const title=document.getElementById('pageTitle');if(title)title.textContent='Ortak Çizim';
        const status=document.getElementById('m2FloorStatus');if(status)status.textContent='Proje #'+wantedPad+' Ortak Çizim\'de açıldı.';
      });
    }catch(error){console.warn('v88 ortak proje koruması',error);}
  };
  install();queueMicrotask(install);setTimeout(install,0);setTimeout(install,250);
  setTimeout(forceQueryCommon,500);setTimeout(forceQueryCommon,1400);setTimeout(forceQueryCommon,2800);
  window.rafexNormalizeCommonProjectV88=normalize;
})();</script>`;
html=html.replace('</body>',runtime+'\n</body>');
if(!html.includes('data-rafex-common-loader-normalize="v88"')||!html.includes('RAFEX COMMON RUNTIME V88')||!html.includes("window.showPage('free')"))throw new Error('Common loader v88 marker missing');
const encoded=Buffer.from(html,'utf8').toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('v88.3: karma proje sol menudeki Ortak Cizim ile ayni showPage free yolundan acilir.');
