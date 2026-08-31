import fs from 'node:fs';

const file = 'dist/server/index.js';
let source = fs.readFileSync(file, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if (!match) throw new Error('Common Mekik view colors: HTML_BASE64 bulunamadi.');
let html = Buffer.from(match[2], 'base64').toString('utf8');

html = html
  .replace(/<style\s+data-rafex-common-mekik-view-colors="v1">[\s\S]*?<\/style>\s*/g, '')
  .replace(/<script\s+data-rafex-common-mekik-view-colors="v1">[\s\S]*?<\/script>\s*/g, '');

const runtime = String.raw`<style data-rafex-common-mekik-view-colors="v1">
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"]{
  --rafex-mekik-common-foot:#004f7c;
  --rafex-mekik-common-traverse:#e5be01;
}
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2Top .m2-top-foot rect{
  fill:var(--rafex-mekik-common-foot)!important;
  stroke:#26313b!important;
}
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2Top .m2-top-foot line,
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2Top .m2-top-foot path{
  stroke:var(--rafex-mekik-common-foot)!important;
}
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2Top .m2-top-leg{
  stroke:var(--rafex-mekik-common-traverse)!important;
}
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2Top .m2-top-joint{
  fill:var(--rafex-mekik-common-traverse)!important;
  stroke:var(--rafex-mekik-common-traverse)!important;
}
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2Side .m2-side-upright-body,
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2Side .m2-side-base{
  fill:var(--rafex-mekik-common-foot)!important;
}
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2Side .m2-side-upright-highlight{
  stroke:var(--rafex-mekik-common-foot)!important;
}
#page.rafex-free-drawing-page[data-rafex-free-context-system="mekik2"] #m2Side .m2-side-horizontal-brace{
  stroke:var(--rafex-mekik-common-traverse)!important;
}
</style>
<script data-rafex-common-mekik-view-colors="v1">(function(){
  if(window.__rafexCommonMekikViewColorsV1)return;
  window.__rafexCommonMekikViewColorsV1=true;
  var foot={ral5010:'#004f7c',pgv:'#a8b0b3'};
  var traverse={ral1007:'#e5be01',ral2004:'#f44611'};
  function visibleValue(selector,fallback){
    var nodes=Array.from(document.querySelectorAll(selector));
    var visible=nodes.filter(function(node){return node.isConnected&&node.getClientRects().length>0});
    return String((visible[visible.length-1]||nodes[nodes.length-1])?.value||fallback);
  }
  function apply(){
    var page=document.getElementById('page');
    if(!page||!page.classList.contains('rafex-free-drawing-page')||String(page.dataset.rafexFreeContextSystem||'')!=='mekik2')return;
    var footKey=visibleValue('.rafex-mekik-foot-color','ral5010');
    var traverseKey=visibleValue('.rafex-mekik-traverse-color','ral1007');
    page.style.setProperty('--rafex-mekik-common-foot',foot[footKey]||foot.ral5010);
    page.style.setProperty('--rafex-mekik-common-traverse',traverse[traverseKey]||traverse.ral1007);
  }
  document.addEventListener('input',function(event){if(event.target?.matches?.('.rafex-mekik-foot-color,.rafex-mekik-traverse-color'))requestAnimationFrame(apply)},true);
  document.addEventListener('change',function(event){if(event.target?.matches?.('.rafex-mekik-foot-color,.rafex-mekik-traverse-color'))requestAnimationFrame(apply)},true);
  new MutationObserver(function(mutations){
    if(mutations.some(function(m){return m.type==='attributes'&&m.target?.id==='page'}))requestAnimationFrame(apply);
  }).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','data-rafex-free-context-system']});
  window.addEventListener('load',apply);
  requestAnimationFrame(apply);
})();</script>`;

const bodyEnd = html.lastIndexOf('</body>');
if (bodyEnd < 0) throw new Error('Common Mekik view colors: body bulunamadi.');
html = html.slice(0, bodyEnd) + runtime + '\n' + html.slice(bodyEnd);

const encoded = Buffer.from(html, 'utf8').toString('base64');
source = source.slice(0, match.index) + match[0].replace(match[2], encoded) + source.slice(match.index + match[0].length);
fs.writeFileSync(file, source);
console.log('Common Mekik view colors v1: üst/yan ayaklar seçili ayak rengine, düz arabağlar travers rengine bağlandı.');
