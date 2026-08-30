import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/(const\s+HTML_BASE64\s*=\s*)(["'])([A-Za-z0-9+/=]+)\2/);
if (!match) throw new Error("Global version/front2: HTML_BASE64 bulunamadi.");
let html = Buffer.from(match[3], "base64").toString("utf8");

html = html
  .replace(/<style\s+data-rafex-global-version-front2="v1">[\s\S]*?<\/style>\s*/g, "")
  .replace(/<script\s+data-rafex-global-version-front2="v1">[\s\S]*?<\/script>\s*/g, "");

const buildSha = String(process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || "local").slice(0, 7);
const runtime = String.raw`<style data-rafex-global-version-front2="v1">
#rafexVersionBadge{
  position:fixed;z-index:99991;pointer-events:none;white-space:nowrap;
  padding:6px 9px;border:1px solid #d7dfda;border-radius:8px;
  background:rgba(255,255,255,.94);box-shadow:0 4px 14px #17201b1a;
  color:#536058;font:800 10px/1.15 Arial,sans-serif;letter-spacing:.035em;
}
#rafexVersionBadge[data-position="home"]{right:16px;bottom:14px;top:auto}
#rafexVersionBadge[data-position="module"]{right:20px;top:18px;bottom:auto}
[data-m2-view="front2"] .m2-front2-canvas{display:grid;place-items:center;overflow:auto;min-height:360px;background:#fff}
[data-m2-view="front2"] .m2-front2-canvas>svg{display:block;width:min(100%,1100px);height:auto;max-height:72vh}
@media(max-width:760px){#rafexVersionBadge[data-position="module"]{right:10px;top:8px}[data-m2-view="front2"] .m2-front2-canvas{min-height:300px}}
</style>
<script data-rafex-global-version-front2="v1">(function(){
  if(window.__rafexGlobalVersionFront2V1)return;
  window.__rafexGlobalVersionFront2V1=true;
  var BUILD_SHA=${JSON.stringify(buildSha)};
  var scheduled=false;

  function activePage(){
    var active=document.querySelector('#nav button[data-page].active');
    return active&&active.dataset?String(active.dataset.page||''):'';
  }
  function isAuthVisible(){
    var auth=document.querySelector('.auth');
    if(!auth)return false;
    return !auth.classList.contains('hidden')&&getComputedStyle(auth).display!=='none';
  }
  function ensureVersion(){
    var badge=document.getElementById('rafexVersionBadge');
    if(!badge){badge=document.createElement('div');badge.id='rafexVersionBadge';badge.setAttribute('aria-label','Son surum bilgisi');document.body.appendChild(badge)}
    var page=activePage();
    badge.dataset.position=(isAuthVisible()||!page||page==='home')?'home':'module';
    badge.textContent='SON SÜRÜM · '+BUILD_SHA;
  }
  function isMekikModule(){
    try{if(typeof m2ActiveModule!=='undefined')return m2ActiveModule==='mekik2'||m2ActiveModule==='mekik'}catch(e){}
    var page=activePage();return page==='mekik2'||page==='mekik';
  }
  function front2Projection(){
    var drawing=null;
    try{if(typeof m2LastDrawing!=='undefined')drawing=m2LastDrawing}catch(e){}
    if(!drawing)return '';
    try{
      if(typeof m2MekikSetProjection!=='function')return '';
      var projection=m2MekikSetProjection('front',drawing,0,0,200,112);
      return '<svg viewBox="0 0 200 112" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mekik alternatif ön görünüm"><rect width="200" height="112" fill="#fff"/><g transform="translate(8 7) scale(.84)">'+projection+'</g></svg>';
    }catch(e){console.warn('Mekik Ön Görünüm 2 render',e);return ''}
  }
  function renderFront2(){
    if(!isMekikModule())return;
    var canvas=document.getElementById('m2Front2');if(!canvas)return;
    var svg=front2Projection();
    if(svg)canvas.innerHTML=svg;
    else canvas.innerHTML='<div style="padding:32px;color:#68736c;font-weight:700">Ön Görünüm 2 için önce raf hesabını oluştur.</div>';
  }
  window.m2RenderFront2=renderFront2;
  function activateFront2(){
    if(!isMekikModule())return;
    renderFront2();
    try{if(typeof m2ShowView==='function')m2ShowView('front2')}catch(e){}
  }
  window.m2ShowFront2=activateFront2;

  function ensureFront2(){
    if(!isMekikModule())return;
    var tabs=document.querySelector('.m2-view-tabs');
    var front=document.querySelector('[data-m2-view="front"]');
    if(!tabs||!front)return;
    var button=tabs.querySelector('[data-m2-tab="front2"]');
    if(!button){
      button=document.createElement('button');
      button.type='button';button.dataset.m2Tab='front2';button.textContent='Ön Görünüm 2';button.setAttribute('aria-label','Mekik Ön Görünüm 2');
      button.addEventListener('click',activateFront2);
      var frontButton=tabs.querySelector('[data-m2-tab="front"]');
      if(frontButton&&frontButton.nextSibling)tabs.insertBefore(button,frontButton.nextSibling);else tabs.appendChild(button);
    }
    var view=document.querySelector('[data-m2-view="front2"]');
    if(!view){
      view=document.createElement('div');view.className='m2-view';view.dataset.m2View='front2';view.hidden=true;
      view.innerHTML='<header><h3>Ön Görünüm 2</h3><div class="m2-view-header-tools"><span>Alternatif teknik ön görünüm</span></div></header><div class="m2-canvas m2-front2-canvas" id="m2Front2"></div>';
      front.insertAdjacentElement('afterend',view);
    }
  }
  function removeFront2OutsideMekik(){
    if(isMekikModule())return;
    document.querySelectorAll('[data-m2-tab="front2"],[data-m2-view="front2"]').forEach(function(el){el.remove()});
  }
  function sync(){
    scheduled=false;
    ensureVersion();
    if(isMekikModule()){ensureFront2();var view=document.querySelector('[data-m2-view="front2"]');if(view&&!view.hidden)renderFront2()}
    else removeFront2OutsideMekik();
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(sync)}
  var observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',function(){setTimeout(schedule,0)},true);
  window.addEventListener('hashchange',schedule);
  window.addEventListener('popstate',schedule);
  schedule();setTimeout(schedule,120);setTimeout(schedule,500);
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Global version/front2: body bulunamadi.");
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log(`Global version/front2 v1: version ${buildSha}; home bottom-right, modules top-right; Mekik Front View 2 enabled.`);
