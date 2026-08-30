import fs from 'node:fs';

const target = 'dist/server/index.js';
let source = fs.readFileSync(target, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1\s*;/);
if (!match) throw new Error('HTML_BASE64 bulunamadi.');

let html = Buffer.from(match[2], 'base64').toString('utf8');
const marker = 'data-rafex-version-badge-position="v1"';

if (!html.includes(marker)) {
  const style = `
<style ${marker}>
  .rafex-version-badge-managed{box-sizing:border-box!important;}
  .rafex-version-badge-login{
    position:fixed!important;
    right:18px!important;
    bottom:18px!important;
    top:auto!important;
    left:auto!important;
    margin:0!important;
    transform:none!important;
    z-index:9999!important;
  }
  .top-actions{align-items:center;}
  .top-actions>.rafex-version-badge-top{
    position:static!important;
    inset:auto!important;
    right:auto!important;
    bottom:auto!important;
    top:auto!important;
    left:auto!important;
    margin:0 0 0 8px!important;
    transform:none!important;
    z-index:auto!important;
    flex:0 0 auto!important;
  }
  @media(max-width:760px){
    .rafex-version-badge-login{right:10px!important;bottom:10px!important;}
    .top-actions>.rafex-version-badge-top{margin-left:4px!important;}
  }
</style>`;

  const script = `
<script ${marker}>
(function(){
  function cleanText(el){
    return String(el && (el.innerText || el.textContent) || '').replace(/\\s+/g,' ').trim().toLocaleLowerCase('tr-TR');
  }
  function isVisible(el){
    if(!el) return false;
    if(el.classList && el.classList.contains('hidden')) return false;
    var s=getComputedStyle(el);
    return s.display!=='none' && s.visibility!=='hidden';
  }
  function findBadge(){
    var nodes=Array.from(document.querySelectorAll('body *')).filter(function(el){
      if(['SCRIPT','STYLE','NOSCRIPT'].includes(el.tagName)) return false;
      var text=cleanText(el);
      var hasVersion=text.includes('son sürüm') || text.includes('son surum');
      var hasLoaded=text.includes('yüklenme') || text.includes('yuklenme');
      return hasVersion && hasLoaded;
    });
    nodes.sort(function(a,b){
      var childDiff=a.querySelectorAll('*').length-b.querySelectorAll('*').length;
      if(childDiff) return childDiff;
      return cleanText(a).length-cleanText(b).length;
    });
    return nodes[0] || null;
  }
  function placeBadge(){
    var badge=findBadge();
    if(!badge) return;
    badge.classList.add('rafex-version-badge-managed');
    var auth=document.querySelector('.auth');
    var shell=document.querySelector('.shell');
    var loginMode=isVisible(auth) && !isVisible(shell);
    if(loginMode){
      badge.classList.remove('rafex-version-badge-top');
      badge.classList.add('rafex-version-badge-login');
      if(badge.parentElement!==document.body) document.body.appendChild(badge);
      return;
    }
    var actions=document.querySelector('.top-actions');
    if(!actions) return;
    badge.classList.remove('rafex-version-badge-login');
    badge.classList.add('rafex-version-badge-top');
    var history=actions.querySelector('.history-top');
    if(!history){
      history=Array.from(actions.children).find(function(el){return cleanText(el).includes('proje geçmişi');}) || null;
    }
    if(history){
      if(history.nextElementSibling!==badge) history.insertAdjacentElement('afterend',badge);
    }else if(badge.parentElement!==actions){
      actions.appendChild(badge);
    }
  }
  var queued=false;
  function schedule(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(function(){queued=false;placeBadge();});
  }
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  window.addEventListener('load',schedule);
  document.addEventListener('click',function(){setTimeout(schedule,0);},true);
  setInterval(placeBadge,1200);
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

console.log('Version badge position patch v1 applied.');
