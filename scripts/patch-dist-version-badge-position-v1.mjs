import fs from 'node:fs';

const target = 'dist/server/index.js';
let source = fs.readFileSync(target, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1\s*;/);
if (!match) throw new Error('HTML_BASE64 bulunamadi.');

let html = Buffer.from(match[2], 'base64').toString('utf8');
const marker = 'data-rafex-version-badge-position="v9"';

// Onceki konum patchlerini ve bizim ekledigimiz beyaz rozeti tamamen temizle.
html = html
  .replace(/<style\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/style>\s*/g, '')
  .replace(/<script\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/script>\s*/g, '')
  .replace(/<span\s+id="rafexBuildVersionBadge"[^>]*>[\s\S]*?<\/span>\s*/g, '');

const style = `
<style ${marker}>
  .top-actions{display:flex!important;align-items:center!important;gap:8px!important;}
  .rafex-version-card-top{
    position:static!important;
    inset:auto!important;
    margin:0!important;
    transform:none!important;
    z-index:auto!important;
    flex:0 0 auto!important;
    align-self:center!important;
  }
  .rafex-version-card-login{
    position:fixed!important;
    right:18px!important;
    bottom:18px!important;
    top:auto!important;
    left:auto!important;
    margin:0!important;
    transform:none!important;
    z-index:99991!important;
  }
  @media(max-width:760px){
    .rafex-version-card-login{right:10px!important;bottom:10px!important;}
  }
</style>`;

const script = `
<script ${marker}>
(function(){
  if(window.__rafexRedVersionCardPositionV9)return;
  window.__rafexRedVersionCardPositionV9=true;

  function norm(v){
    return String(v||'').replace(/\\s+/g,' ').trim().toLocaleLowerCase('tr-TR');
  }
  function visible(el){
    if(!el) return false;
    if(el.classList && el.classList.contains('hidden')) return false;
    var s=getComputedStyle(el);
    return s.display!=='none' && s.visibility!=='hidden';
  }
  function findHistory(actions){
    if(!actions) return null;
    return actions.querySelector('.history-top') || Array.from(actions.children).find(function(el){
      var t=norm(el.innerText||el.textContent);
      return t.includes('proje geçmişi') || t.includes('proje gecmisi');
    }) || null;
  }
  function findRedVersionCard(){
    var all=Array.from(document.body ? document.body.querySelectorAll('div,aside,section,span') : []);
    var candidates=all.filter(function(el){
      if(el.id==='rafexBuildVersionBadge') return false;
      var t=norm(el.innerText||el.textContent);
      return t.includes('son sürüm') && (t.includes('yüklenme') || t.includes('yuklenme'));
    });
    if(!candidates.length) return null;
    candidates.sort(function(a,b){
      var ac=a.querySelectorAll('*').length, bc=b.querySelectorAll('*').length;
      if(ac!==bc) return ac-bc;
      return (a.textContent||'').length-(b.textContent||'').length;
    });
    return candidates[0];
  }
  function place(){
    var white=document.getElementById('rafexBuildVersionBadge');
    if(white) white.remove();

    var card=findRedVersionCard();
    if(!card) return;
    var actions=document.querySelector('.top-actions');
    var auth=document.querySelector('.auth');
    var appMode=!!actions && visible(actions) && !visible(auth);

    card.classList.remove('rafex-version-card-top','rafex-version-card-login');
    if(appMode){
      card.classList.add('rafex-version-card-top');
      var history=findHistory(actions);
      if(history){
        if(card.parentElement!==actions || history.nextElementSibling!==card){
          history.insertAdjacentElement('afterend',card);
        }
      }else if(card.parentElement!==actions){
        actions.appendChild(card);
      }
    }else{
      card.classList.add('rafex-version-card-login');
      if(card.parentElement!==document.body) document.body.appendChild(card);
    }
  }

  var timer=null;
  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(place,30);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
  window.addEventListener('load',schedule,{once:true});
  document.addEventListener('click',function(){setTimeout(place,0)},true);
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  setTimeout(place,100);
  setTimeout(place,500);
  setTimeout(place,1500);
})();
</script>`;

if (html.includes('</head>')) html = html.replace('</head>', style + '\n</head>');
else html = style + html;
if (html.includes('</body>')) html = html.replace('</body>', script + '\n</body>');
else html += script;

const encoded = Buffer.from(html, 'utf8').toString('base64');
source = source.replace(match[0], `const HTML_BASE64 =\n  "${encoded}";`);
fs.writeFileSync(target, source);

console.log('Version badge position patch v9 RED CARD ONLY applied.');
