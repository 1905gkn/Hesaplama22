import fs from "node:fs";
import path from "node:path";

const workerPath = path.join(process.cwd(), "dist/server/index.js");
let worker = fs.readFileSync(workerPath, "utf8");
const match = worker.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error("Ortak Cizim UX v41: HTML_BASE64 bulunamadi");

let html = Buffer.from(match[2], "base64").toString("utf8");
html = html.replace(/<script\s+data-rafex-free-ortak-switch-ux="v41">[\s\S]*?<\/script>/g, "");

const oldAutoScroll = "setTimeout(()=>document.querySelector('.m2-layout')?.scrollIntoView({behavior:'smooth',block:'start'}),60);";
const fixedAutoScroll = "setTimeout(()=>window.rafexRestoreCommonViewport?.(),70);";
if (html.includes(oldAutoScroll)) html = html.replace(oldAutoScroll, fixedAutoScroll);
if (html.includes(oldAutoScroll)) throw new Error("Ortak Cizim UX v41: eski B2B otomatik scroll kaldirilamadi");

const runtime = String.raw`<script data-rafex-free-ortak-switch-ux="v41">
(function(){
  if(window.__rafexFreeOrtakSwitchUxV41)return;
  window.__rafexFreeOrtakSwitchUxV41=true;

  var viewport=null;
  var switchToken=0;
  var navObserver=null;

  function isCommonPage(){
    var page=document.getElementById('page');
    if(page&&(page.dataset?.rafexFreeDrawing==='1'||page.classList.contains('rafex-free-drawing-page')))return true;
    if(document.querySelector('#nav button[data-page="free"].active'))return true;
    var title=(document.getElementById('pageTitle')?.textContent||'').trim();
    return title==='Serbest Çizim'||title==='Ortak Çizim';
  }

  function floorAnchor(){
    return document.getElementById('m2LayoutSvg')||document.querySelector('.m2-floor-editor');
  }

  function captureViewport(){
    if(!isCommonPage())return null;
    var anchor=floorAnchor();
    viewport={
      y:window.scrollY||window.pageYOffset||0,
      anchorTop:anchor?anchor.getBoundingClientRect().top:null
    };
    return viewport;
  }

  function restoreViewport(snapshot){
    snapshot=snapshot||viewport;
    if(!snapshot||!isCommonPage())return;
    var anchor=floorAnchor();
    if(anchor&&Number.isFinite(snapshot.anchorTop)){
      var delta=anchor.getBoundingClientRect().top-snapshot.anchorTop;
      if(Math.abs(delta)>1)window.scrollBy({top:delta,left:0,behavior:'auto'});
    }else{
      window.scrollTo({top:snapshot.y,left:0,behavior:'auto'});
    }
  }

  window.rafexRestoreCommonViewport=function(){restoreViewport(viewport);};

  function cleanLegacyNav(){
    var nav=document.getElementById('nav');
    if(!nav)return;
    var keeper=nav.querySelector('button[data-page="free"]');
    nav.querySelectorAll('button').forEach(function(button){
      if(button===keeper)return;
      var text=String(button.textContent||'').replace(/^\s*\d+\s*/,'').trim().toLocaleLowerCase('tr-TR');
      if(text==='serbest çizim'){
        button.classList.add('rafex-legacy-free-nav');
        button.hidden=true;
        button.setAttribute('aria-hidden','true');
        button.style.display='none';
      }
    });
  }

  function normalizeCommonLabels(){
    if(!isCommonPage())return;
    var title=document.getElementById('pageTitle');
    if(title)title.textContent='Ortak Çizim';
    var page=document.getElementById('page');
    var heading=page?.querySelector('.hero h2');
    if(heading&&(heading.textContent||'').trim()==='Serbest Çizim')heading.textContent='Ortak Çizim';
  }

  function maintain(){
    cleanLegacyNav();
    normalizeCommonLabels();
  }

  document.addEventListener('change',function(event){
    var input=event.target?.closest?.('input[name="rafexUnifiedSystem"]');
    if(!input||!isCommonPage())return;
    var snapshot=captureViewport();
    var token=++switchToken;
    [0,90,180,320].forEach(function(delay){
      setTimeout(function(){if(token===switchToken){restoreViewport(snapshot);maintain();}},delay);
    });
  },true);

  function bind(){
    maintain();
    var nav=document.getElementById('nav');
    if(nav&&!navObserver){
      navObserver=new MutationObserver(function(){cleanLegacyNav();});
      navObserver.observe(nav,{childList:true,subtree:true,characterData:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  setTimeout(bind,0);
  setTimeout(bind,250);
})();
</script>`;

const closing = html.lastIndexOf("</body>");
if (closing < 0) throw new Error("Ortak Cizim UX v41: </body> bulunamadi");
html = html.slice(0, closing) + runtime + "\n" + html.slice(closing);

for (const required of [
  'data-rafex-free-ortak-switch-ux="v41"',
  '__rafexFreeOrtakSwitchUxV41',
  'rafexRestoreCommonViewport',
  'rafex-legacy-free-nav',
  "title.textContent='Ortak Çizim'"
]) {
  if (!html.includes(required)) throw new Error(`Ortak Cizim UX v41 dogrulama hatasi: ${required}`);
}

const encoded = Buffer.from(html, "utf8").toString("base64");
worker = worker.slice(0, match.index) + match[0].replace(match[2], encoded) + worker.slice(match.index + match[0].length);
fs.writeFileSync(workerPath, worker);
console.log("v41: Ortak Cizimde B2B/Mekik/MR gecisinde viewport sabit; eski Serbest Cizim menu kopyasi gizli.");
