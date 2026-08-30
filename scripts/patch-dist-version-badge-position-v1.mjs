import fs from 'node:fs';

const target = 'dist/server/index.js';
let source = fs.readFileSync(target, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1\s*;/);
if (!match) throw new Error('HTML_BASE64 bulunamadi.');

let html = Buffer.from(match[2], 'base64').toString('utf8');
const marker = 'data-rafex-version-badge-position="v3"';

if (!html.includes(marker)) {
  const style = `
<style ${marker}>
  .top-actions{align-items:center!important;}
  .rafex-version-badge-source-hidden{
    position:fixed!important;
    left:-10000px!important;
    right:auto!important;
    top:0!important;
    bottom:auto!important;
    opacity:0!important;
    visibility:hidden!important;
    pointer-events:none!important;
    margin:0!important;
    transform:none!important;
  }
  .rafex-version-badge-login{
    position:fixed!important;
    right:18px!important;
    bottom:18px!important;
    top:auto!important;
    left:auto!important;
    margin:0!important;
    transform:none!important;
    opacity:1!important;
    visibility:visible!important;
    z-index:9999!important;
  }
  .top-actions>.rafex-version-badge-clone{
    position:static!important;
    inset:auto!important;
    right:auto!important;
    bottom:auto!important;
    top:auto!important;
    left:auto!important;
    margin:0 8px 0 0!important;
    transform:none!important;
    opacity:1!important;
    visibility:visible!important;
    display:inline-flex!important;
    z-index:auto!important;
    flex:0 0 auto!important;
    pointer-events:none!important;
    box-sizing:border-box!important;
  }
  @media(max-width:760px){
    .rafex-version-badge-login{right:10px!important;bottom:10px!important;}
    .top-actions>.rafex-version-badge-clone{margin-right:4px!important;}
  }
</style>`;

  const script = `
<script ${marker}>
(function(){
  var CLONE_ATTR='data-rafex-version-badge-clone';
  function cleanText(el){
    return String(el && (el.innerText || el.textContent) || '').replace(/\\s+/g,' ').trim().toLocaleLowerCase('tr-TR');
  }
  function isVisible(el){
    if(!el) return false;
    var s=getComputedStyle(el);
    return s.display!=='none' && s.visibility!=='hidden';
  }
  function findSource(){
    var selectors=[
      '[aria-label="Son surum bilgisi"]',
      '[aria-label="Son sürüm bilgisi"]',
      '[data-version-badge]',
      '[data-rafex-version-badge]'
    ];
    for(var i=0;i<selectors.length;i++){
      var found=Array.from(document.querySelectorAll(selectors[i])).find(function(el){return !el.hasAttribute(CLONE_ATTR);});
      if(found) return found;
    }
    var nodes=Array.from(document.querySelectorAll('body *')).filter(function(el){
      if(el.hasAttribute(CLONE_ATTR) || el.closest('['+CLONE_ATTR+']')) return false;
      if(['SCRIPT','STYLE','NOSCRIPT'].includes(el.tagName)) return false;
      var text=cleanText(el);
      return text.includes('son sürüm') || text.includes('son surum');
    });
    nodes.sort(function(a,b){
      var ac=a.querySelectorAll('*').length;
      var bc=b.querySelectorAll('*').length;
      if(ac!==bc) return ac-bc;
      return cleanText(a).length-cleanText(b).length;
    });
    return nodes[0] || null;
  }
  function findHistory(actions){
    if(!actions) return null;
    var direct=actions.querySelector('.history-top');
    if(direct) return direct;
    return Array.from(actions.children).find(function(el){
      var text=cleanText(el);
      return text.includes('proje geçmişi') || text.includes('proje gecmisi');
    }) || null;
  }
  function stripIds(root){
    if(!root) return;
    if(root.removeAttribute) root.removeAttribute('id');
    root.querySelectorAll && root.querySelectorAll('[id]').forEach(function(el){el.removeAttribute('id');});
  }
  function removeClone(){
    document.querySelectorAll('['+CLONE_ATTR+']').forEach(function(el){el.remove();});
  }
  function ensureClone(source,actions,history){
    var clone=document.querySelector('['+CLONE_ATTR+']');
    if(!clone){
      clone=source.cloneNode(true);
      stripIds(clone);
      clone.setAttribute(CLONE_ATTR,'1');
      clone.classList.remove('rafex-version-badge-login','rafex-version-badge-source-hidden');
      clone.classList.add('rafex-version-badge-clone');
    }
    if(clone.innerHTML!==source.innerHTML){
      clone.innerHTML=source.innerHTML;
      stripIds(clone);
    }
    var aria=source.getAttribute('aria-label');
    if(aria) clone.setAttribute('aria-label',aria);
    clone.classList.add('rafex-version-badge-clone');
    clone.style.removeProperty('display');
    clone.style.removeProperty('visibility');
    clone.style.removeProperty('opacity');
    if(history){
      if(clone.parentElement!==actions || clone.nextElementSibling!==history){
        history.insertAdjacentElement('beforebegin',clone);
      }
    }else if(clone.parentElement!==actions){
      actions.appendChild(clone);
    }
  }
  function placeBadge(){
    var source=findSource();
    if(!source) return;
    var actions=document.querySelector('.top-actions');
    var appMode=!!actions && isVisible(actions);
    if(!appMode){
      removeClone();
      source.classList.remove('rafex-version-badge-source-hidden');
      source.classList.add('rafex-version-badge-login');
      return;
    }
    source.classList.remove('rafex-version-badge-login');
    source.classList.add('rafex-version-badge-source-hidden');
    ensureClone(source,actions,findHistory(actions));
  }
  var queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(function(){queued=false;placeBadge();});
  }
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style','aria-label']});
  window.addEventListener('load',schedule);
  document.addEventListener('click',function(){setTimeout(schedule,0);},true);
  setInterval(placeBadge,1000);
  schedule();
})();
</script>`;

  if (html.includes('</head>')) html = html.replace('</head>', style + '\n</head>');
  else html = style + html;
  if (html.includes('</body>')) html = html.replace('</body>', script + '\n</body>');
  else html += script;

  const encoded = Buffer.from(html, 'utf8').toString('base64');
  source = source.replace(match[0], `const HTML_BASE64 =\n  "${encoded}";`);
  fs.writeFileSync(target, source);
}

console.log('Version badge position patch v3 applied.');
