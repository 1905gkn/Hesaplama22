import fs from "node:fs";

const file = "dist/server/index.js";
let source = fs.readFileSync(file, "utf8");
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("Heavy viewer on-demand: HTML_BASE64 bulunamadi.");

let html = Buffer.from(match[2], "base64").toString("utf8");
html = html.replace(/<script\s+data-rafex-heavy-viewers-on-demand="v1">[\s\S]*?<\/script>\s*/g, "");

const viewerSources = {};
const viewers = [
  ["konsol", /\s*<script\b[^>]*\bsrc="(\/konsol-viewer\.js[^"]*)"[^>]*><\/script>\s*/g],
  ["drivein", /\s*<script\b[^>]*\bsrc="(\/drive-in-viewer\.js[^"]*)"[^>]*><\/script>\s*/g],
  ["mekik2", /\s*<script\b[^>]*\bsrc="(\/mekik-front-viewer\.js[^"]*)"[^>]*><\/script>\s*/g],
];

for (const [name, pattern] of viewers) {
  html = html.replace(pattern, (full, src) => {
    viewerSources[name] = src;
    return "\n";
  });
}

for (const [name] of viewers) {
  if (!viewerSources[name]) throw new Error(`Heavy viewer on-demand: ${name} kaynagi bulunamadi.`);
}

const runtime = `<script data-rafex-heavy-viewers-on-demand="v1">
(function(){
  if(window.__rafexHeavyViewersOnDemandV1)return;
  window.__rafexHeavyViewersOnDemandV1=true;
  const sources=${JSON.stringify(viewerSources)};
  const pending={};
  function load(name){
    name=String(name||'').toLowerCase();
    if(name==='mekik')name='mekik2';
    if(name==='drive-in')name='drivein';
    const src=sources[name];
    if(!src)return Promise.resolve(false);
    if(pending[name])return pending[name];
    const path=src.split('?')[0];
    const old=document.querySelector('script[src^="'+path+'"]');
    if(old)return Promise.resolve(true);
    pending[name]=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=src;
      script.async=true;
      script.dataset.rafexOnDemandViewer=name;
      script.onload=()=>resolve(true);
      script.onerror=()=>{delete pending[name];reject(new Error(name+' viewer yuklenemedi'))};
      document.head.appendChild(script);
    });
    return pending[name];
  }
  function normalized(value){
    value=String(value||'').toLowerCase();
    if(value==='mekik')return 'mekik2';
    if(value==='drive-in')return 'drivein';
    return value;
  }
  function fromTarget(target){
    const page=target?.closest?.('[data-page]')?.dataset?.page;
    if(page)return normalized(page);
    const value=target?.value;
    if(value)return normalized(value);
    return normalized(target?.dataset?.system||target?.dataset?.freeSystem||target?.dataset?.module);
  }
  function loadFromTarget(target){
    const name=fromTarget(target);
    if(sources[name])load(name).catch((error)=>console.warn(error));
  }
  function loadActive(){
    const page=document.getElementById('page');
    const active=document.querySelector('#nav button[data-page].active,#mobileTabs button[data-mobile-page].active');
    const name=normalized(active?.dataset?.page||active?.dataset?.mobilePage||page?.dataset?.rafexFreeContextSystem||page?.dataset?.freeSystem||page?.dataset?.m2Module);
    if(sources[name])load(name).catch((error)=>console.warn(error));
  }
  document.addEventListener('click',(event)=>loadFromTarget(event.target),true);
  document.addEventListener('change',(event)=>loadFromTarget(event.target),true);
  const page=document.getElementById('page');
  if(page)new MutationObserver(loadActive).observe(page,{attributes:true,attributeFilter:['class','data-m2-module','data-rafex-free-context-system','data-free-system']});
  window.rafexLoadHeavyViewerV1=load;
  loadActive();
})();
</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Heavy viewer on-demand: </body> bulunamadi.");
html = html.slice(0, bodyEnd) + runtime + "\n" + html.slice(bodyEnd);

for (const [, pattern] of viewers) {
  pattern.lastIndex = 0;
  if (pattern.test(html)) throw new Error("Heavy viewer on-demand: bloklayan script etiketi kaldi.");
}
if (!html.includes('data-rafex-heavy-viewers-on-demand="v1"')) throw new Error("Heavy viewer on-demand runtime eklenemedi.");

const encoded = Buffer.from(html, "utf8").toString("base64");
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log("Heavy viewer on-demand v1: Konsol/Drive-In/Mekik motorlari yalniz ilgili modul acilinca yuklenir.");

