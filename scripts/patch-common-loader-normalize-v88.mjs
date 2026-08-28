import fs from "node:fs";

const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('Common loader v88: HTML_BASE64 not found');
let html=Buffer.from(match[2],'base64').toString('utf8');
html=html.replace(/<script data-rafex-common-loader-normalize="v88">[\s\S]*?<\/script>/g,'');

const runtime=String.raw`<script data-rafex-common-loader-normalize="v88">(()=>{
  if(window.__rafexCommonLoaderNormalizeV88)return;window.__rafexCommonLoaderNormalizeV88=true;
  const low=(v)=>String(v||'').toLocaleLowerCase('tr-TR').trim();
  const systemsOf=(project)=>new Set((project?.payload?.layout?.racks||[]).map((rack)=>low(rack?.rafexSystem||(rack?.b2b?.mr?'mr':rack?.b2bLayout?'b2b':''))).filter(Boolean));
  const isCommon=(project)=>low(project?.module)==='ortak'||systemsOf(project).size>1;
  const normalize=(project)=>isCommon(project)?{...project,module:'ortak'}:project;
  const install=()=>{
    const loader=window.rafexLoadUnifiedProjectV75;
    if(typeof loader==='function'&&!loader.__rafexCommonNormalizeV88){
      const wrapped=function(project,asCopy){
        const normalized=normalize(project),common=isCommon(normalized),result=loader.call(this,normalized,asCopy);
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
      const wrapped=function(project,asCopy){return opener.call(this,normalize(project),asCopy);};
      wrapped.__rafexCommonNormalizeV88=true;wrapped.__rafexOriginal=opener;window.rafexOpenCommonProjectV87=wrapped;
    }
  };
  install();queueMicrotask(install);setTimeout(install,0);setTimeout(install,250);
  window.rafexNormalizeCommonProjectV88=normalize;
})();</script>`;
html=html.replace('</body>',runtime+'\n</body>');
if(!html.includes('data-rafex-common-loader-normalize="v88"'))throw new Error('Common loader v88 marker missing');
const encoded=Buffer.from(html,'utf8').toString('base64');
source=source.slice(0,match.index)+match[0].replace(match[2],encoded)+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('v88: Ortak yukleyicinin tum girislerinde eski MR/B2B module etiketi module=ortak normalize edilir.');
