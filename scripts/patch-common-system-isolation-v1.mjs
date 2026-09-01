import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('Common system isolation: HTML_BASE64 bulunamadi.');
let html = Buffer.from(match[2], 'base64').toString('utf8');

html = html
  .replace(/<style\s+data-rafex-common-system-isolation="v1">[\s\S]*?<\/style>\s*/g, '')
  .replace(/<script\s+data-rafex-common-system-isolation="v1">[\s\S]*?<\/script>\s*/g, '');

const runtime = String.raw`<style data-rafex-common-system-isolation="v1">
/* Ortak Cizim'e ait tum yeni stiller yalniz bu kesin kapinin altinda calisir. */
#page:not([data-rafex-common-active="1"]){
  --rafex-mekik-common-foot:initial;
  --rafex-mekik-common-traverse:initial;
}
</style>
<script data-rafex-common-system-isolation="v1">(function(){
  if(window.__rafexCommonSystemIsolationV1)return;
  window.__rafexCommonSystemIsolationV1=true;
  var syncing=false,frame=0;
  function setAttr(node,name,value){if(node.getAttribute(name)!==value)node.setAttribute(name,value)}
  function removeAttr(node,name){if(node.hasAttribute(name))node.removeAttribute(name)}
  function toggleClass(node,name,active){if(node.classList.contains(name)!==active)node.classList.toggle(name,active)}
  function pageTitle(){return String(document.getElementById('pageTitle')?.textContent||'').trim().toLocaleLowerCase('tr-TR')}
  function isCommonPage(){
    var t=pageTitle();
    return t==='serbest çizim'||t==='ortak çizim'||t.includes('ortak çizim');
  }
  function normalizeSystem(raw){
    raw=String(raw||'').toLowerCase();
    if(raw==='mekik'||raw==='mekik2')return 'mekik2';
    if(raw==='b2b')return 'b2b';
    if(raw==='mr')return 'mr';
    if(raw==='drive'||raw==='drive-in'||raw==='drivein')return 'drivein';
    if(raw==='konsol'||raw==='konsol-kollu')return 'konsol';
    return raw;
  }
  function sync(){
    if(syncing)return;syncing=true;
    try{
      var page=document.getElementById('page');if(!page)return;
      var common=isCommonPage();
      if(!common){
        removeAttr(page,'data-rafex-common-active');
        removeAttr(page,'data-rafex-common-system');
        ['rafex-common-b2b','rafex-common-mekik','rafex-common-mr','rafex-common-drivein','rafex-common-konsol'].forEach(function(name){toggleClass(page,name,false)});
        /* Standalone sayfalarda Ortak Cizim'den kalmis isaretleri kesin temizle. */
        if(page.classList.contains('rafex-free-drawing-page')) page.classList.remove('rafex-free-drawing-page');
        removeAttr(page,'data-rafex-free-context-system');
        removeAttr(page,'data-free-system');
        if(page.style.getPropertyValue('--rafex-mekik-common-foot'))page.style.removeProperty('--rafex-mekik-common-foot');
        if(page.style.getPropertyValue('--rafex-mekik-common-traverse'))page.style.removeProperty('--rafex-mekik-common-traverse');
        return;
      }
      setAttr(page,'data-rafex-common-active','1');
      var system=normalizeSystem(page.dataset.rafexFreeContextSystem||page.dataset.freeSystem||'');
      setAttr(page,'data-rafex-common-system',system);
      toggleClass(page,'rafex-common-b2b',system==='b2b');
      toggleClass(page,'rafex-common-mekik',system==='mekik2');
      toggleClass(page,'rafex-common-mr',system==='mr');
      toggleClass(page,'rafex-common-drivein',system==='drivein');
      toggleClass(page,'rafex-common-konsol',system==='konsol');
    } finally {syncing=false}
  }
  function queue(){if(frame)return;frame=requestAnimationFrame(function(){frame=0;sync()})}
  window.rafexSyncCommonIsolationV1=sync;
  document.addEventListener('click',queue,true);
  document.addEventListener('change',queue,true);
  new MutationObserver(function(mutations){
    if(mutations.some(function(m){return m.target?.id==='page'||m.target?.id==='pageTitle'}))queue();
  }).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-rafex-free-context-system','data-free-system']});
  window.addEventListener('load',sync);
  queue();
})();</script>`;

const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd < 0) throw new Error('Common system isolation: body bulunamadi.');
html = html.slice(0, bodyEnd) + runtime + '\n' + html.slice(bodyEnd);
const encoded = Buffer.from(html, 'utf8').toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Common system isolation v1: Ortak Cizim B2B/Mekik/MR baglamlari standalone sayfalardan kesin ayrildi.');

