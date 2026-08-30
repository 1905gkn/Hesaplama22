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
  var FRONT2_MARKER='legacy-drive-in-front-v2-safe';
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
    var position=(isAuthVisible()||!page||page==='home')?'home':'module';
    if(badge.dataset.position!==position)badge.dataset.position=position;
    var text='SON SÜRÜM · '+BUILD_SHA;if(badge.textContent!==text)badge.textContent=text;
  }
  function isMekikModule(){
    try{if(typeof m2ActiveModule!=='undefined')return m2ActiveModule==='mekik2'||m2ActiveModule==='mekik'}catch(e){}
    var page=activePage();return page==='mekik2'||page==='mekik';
  }
  function currentDrawing(){
    if(!isMekikModule())return null;
    try{if(typeof m2LastDrawing!=='undefined'&&m2LastDrawing)return m2LastDrawing}catch(e){}
    return null;
  }
  function fmtLegacy(value){var n=Math.round(Number(value)||0);try{return n.toLocaleString('tr-TR')}catch(e){return String(n)}}
  function legacyDimLine(x1,y1,x2,y2){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" class="m2-front2-dimension"/><line x1="'+(x1-4)+'" y1="'+y1+'" x2="'+(x1+4)+'" y2="'+y1+'" class="m2-front2-dimension"/><line x1="'+(x2-4)+'" y1="'+y2+'" x2="'+(x2+4)+'" y2="'+y2+'" class="m2-front2-dimension"/>'}
  function legacyFrontSvg(drawing){
    var bays=Math.max(1,Math.round(Number(drawing&&drawing.bays)||1));
    var levels=Math.max(1,Math.round(Number(drawing&&drawing.levels)||1));
    var visibleBays=Math.min(bays,3),visibleLevels=Math.min(levels,6);
    var totalWidth=Math.max(1,Number(drawing&&drawing.totalWidth)||1),levelH=Math.max(1,Number(drawing&&drawing.levelH)||1);
    var x0=82,y0=55,w=610,h=385,colW=w/visibleBays,rowH=h/visibleLevels;
    var svg='<svg viewBox="0 0 760 500" role="img" aria-label="Mekik raf önden görünüşü" data-rafex-front2="'+FRONT2_MARKER+'"><style>.m2-front2-label{fill:#111827;font:800 12px Arial}.m2-front2-dim{fill:#64748b;font:700 9px Arial}.m2-front2-upright{stroke:#4b5565;stroke-width:9}.m2-front2-beam{stroke:#e73e3e;stroke-width:9}.m2-front2-load{fill:#e9f3ff;stroke:#2587ee;stroke-width:1.2}.m2-front2-pallet-base{fill:#d99b18;stroke:#b77d08;stroke-width:1}.m2-front2-dimension{stroke:#64748b;stroke-width:1}</style><text x="380" y="25" text-anchor="middle" class="m2-front2-label">VUE DE FACE (Önden Görünüş)</text>';
    for(var c=0;c<=visibleBays;c++){var x=x0+c*colW;svg+='<line x1="'+x+'" y1="'+y0+'" x2="'+x+'" y2="'+(y0+h)+'" class="m2-front2-upright"/>'}
    for(var level=0;level<visibleLevels;level++){
      var beamY=y0+h-level*rowH;svg+='<line x1="'+x0+'" y1="'+beamY+'" x2="'+(x0+w)+'" y2="'+beamY+'" class="m2-front2-beam"/>';
      for(var bay=0;bay<visibleBays;bay++){var px=x0+bay*colW+colW*.14,py=beamY-rowH*.72;svg+='<rect x="'+px+'" y="'+py+'" width="'+(colW*.72)+'" height="'+(rowH*.57)+'" rx="2" class="m2-front2-load"/><rect x="'+(px-3)+'" y="'+(beamY-9)+'" width="'+(colW*.78)+'" height="9" class="m2-front2-pallet-base"/>'}
    }
    svg+='<line x1="'+x0+'" y1="'+y0+'" x2="'+(x0+w)+'" y2="'+y0+'" class="m2-front2-beam"/>'+legacyDimLine(48,y0,48,y0+h)+'<text x="36" y="'+(y0+h/2)+'" transform="rotate(-90 36 '+(y0+h/2)+')" text-anchor="middle" class="m2-front2-dim">'+fmtLegacy(levels*levelH)+' mm</text>'+legacyDimLine(x0,466,x0+w,466)+'<text x="'+(x0+w/2)+'" y="486" text-anchor="middle" class="m2-front2-dim">'+fmtLegacy(totalWidth)+' mm · '+fmtLegacy(bays)+' göz</text></svg>';
    return svg;
  }
  function renderFront2(){
    if(!isMekikModule())return;
    var canvas=document.getElementById('m2Front2'),drawing=currentDrawing();if(!canvas)return;
    if(!drawing){if(!canvas.children.length)canvas.innerHTML='<div style="padding:32px;color:#68736c;font-weight:700">Ön Görünüm 2 için önce raf hesabını oluştur.</div>';return}
    var signature=[drawing.bays,drawing.levels,drawing.totalWidth,drawing.levelH].join('|');
    if(canvas.dataset.signature===signature&&canvas.querySelector('[data-rafex-front2="'+FRONT2_MARKER+'"]'))return;
    canvas.innerHTML=legacyFrontSvg(drawing);canvas.dataset.signature=signature;canvas.dataset.source='rafex-drive-in-legacy-front';
  }
  window.m2RenderFront2=renderFront2;
  function activateFront2(){
    if(!isMekikModule())return;renderFront2();
    document.querySelectorAll('[data-m2-view]').forEach(function(view){view.hidden=view.dataset.m2View!=='front2'});
    document.querySelectorAll('[data-m2-tab]').forEach(function(button){button.classList.toggle('active',button.dataset.m2Tab==='front2')});
  }
  window.m2ShowFront2=activateFront2;
  function removeFront2OutsideMekik(){
    if(isMekikModule())return;
    document.querySelectorAll('[data-m2-tab="front2"][data-rafex-front2-tab],[data-m2-view="front2"][data-rafex-front2-view]').forEach(function(el){el.remove()});
  }
  function ensureFront2(){
    if(!isMekikModule()){removeFront2OutsideMekik();return}
    var frontButton=document.querySelector('[data-m2-tab="front"]'),frontView=document.querySelector('[data-m2-view="front"]');if(!frontButton||!frontView)return;
    var button=document.querySelector('[data-m2-tab="front2"][data-rafex-front2-tab]');
    if(!button){button=document.createElement('button');button.type='button';button.dataset.m2Tab='front2';button.dataset.rafexFront2Tab='1';button.textContent='Ön Görünüm 2';button.setAttribute('aria-label','Mekik Ön Görünüm 2');button.addEventListener('click',activateFront2);frontButton.insertAdjacentElement('afterend',button)}
    var view=document.querySelector('[data-m2-view="front2"][data-rafex-front2-view]');
    if(!view){view=document.createElement('div');view.className='m2-view';view.dataset.m2View='front2';view.dataset.rafexFront2View='1';view.hidden=true;view.innerHTML='<header><h3>Ön Görünüm 2</h3><div class="m2-view-header-tools"><span>Eski Rafex Drive-In görünümü</span></div></header><div class="m2-canvas m2-front2-canvas" id="m2Front2" data-source="rafex-drive-in-legacy-front"></div>';frontView.insertAdjacentElement('afterend',view)}
    renderFront2();
  }
  function sync(){scheduled=false;ensureVersion();if(isMekikModule()){ensureFront2();var view=document.querySelector('[data-m2-view="front2"]');if(view&&!view.hidden)renderFront2()}else removeFront2OutsideMekik()}
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(sync)}
  var observer=new MutationObserver(schedule);observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',function(){setTimeout(schedule,0)},true);window.addEventListener('hashchange',schedule);window.addEventListener('popstate',schedule);
  schedule();setTimeout(schedule,120);setTimeout(schedule,500);
})();</script>`;

const bodyEnd = html.lastIndexOf("</body>");
if (bodyEnd < 0) throw new Error("Global version/front2: body bulunamadi.");
html = html.slice(0, bodyEnd) + runtime + html.slice(bodyEnd);
const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[1] + match[2] + encoded + match[2] + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log(`Global version/front2 v1: version ${buildSha}; home bottom-right, modules top-right; legacy Mekik Front View 2 enabled.`);
