import fs from 'node:fs';

const target = 'dist/server/index.js';
let source = fs.readFileSync(target, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1\s*;/);
if (!match) throw new Error('HTML_BASE64 bulunamadi.');

let html = Buffer.from(match[2], 'base64').toString('utf8');
const marker = 'data-rafex-version-badge-position="v10"';
const buildSha = String(process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'local').slice(0, 7);

function istanbulStamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('tr-TR', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const val = (type) => parts.find((p) => p.type === type)?.value || '';
  return `${val('day')}.${val('month')}.${val('year')} ${val('hour')}:${val('minute')}:${val('second')}`;
}
const buildTime = istanbulStamp();

// Onceki tum surum-konum enjeksiyonlarini ve beyaz badge'i temizle.
html = html
  .replace(/<style\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/style>\s*/g, '')
  .replace(/<script\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/script>\s*/g, '')
  .replace(/<span\s+id="rafexBuildVersionBadge"[^>]*>[\s\S]*?<\/span>\s*/g, '')
  .replace(/<div\s+id="rafexVersionInfoCard"[^>]*>[\s\S]*?<\/div>\s*/g, '');

const style = `
<style ${marker}>
  /* Eski tek satirlik surum rozeti kesinlikle gorunmez. */
  #rafexVersionBadge,#rafexBuildVersionBadge{display:none!important;}
  .top-actions{display:flex!important;align-items:center!important;gap:8px!important;}
  #rafexVersionInfoCard{
    box-sizing:border-box!important;
    min-width:188px!important;
    height:46px!important;
    display:flex!important;
    align-items:center!important;
    gap:10px!important;
    padding:6px 12px!important;
    border:1px solid #dfadb5!important;
    border-radius:12px!important;
    background:#fff8f9!important;
    color:#65000d!important;
    box-shadow:none!important;
    white-space:nowrap!important;
    flex:0 0 auto!important;
    font-family:Arial,sans-serif!important;
    line-height:1.15!important;
    opacity:1!important;
    visibility:visible!important;
  }
  #rafexVersionInfoCard .rafex-version-dot{
    width:6px!important;
    height:6px!important;
    border-radius:50%!important;
    background:#690013!important;
    flex:0 0 6px!important;
  }
  #rafexVersionInfoCard .rafex-version-copy{
    display:flex!important;
    flex-direction:column!important;
    justify-content:center!important;
    gap:3px!important;
    min-width:0!important;
  }
  #rafexVersionInfoCard .rafex-version-main{
    color:#65000d!important;
    font-size:11px!important;
    font-weight:800!important;
    letter-spacing:0!important;
  }
  #rafexVersionInfoCard .rafex-version-time{
    color:#8c646a!important;
    font-size:9px!important;
    font-weight:400!important;
  }
  #rafexVersionInfoCard.rafex-version-card-top{
    position:static!important;
    inset:auto!important;
    margin:0!important;
    transform:none!important;
    z-index:auto!important;
    align-self:center!important;
  }
  #rafexVersionInfoCard.rafex-version-card-login{
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
    #rafexVersionInfoCard{min-width:172px!important;height:42px!important;padding:5px 10px!important;gap:8px!important;}
    #rafexVersionInfoCard .rafex-version-main{font-size:10px!important;}
    #rafexVersionInfoCard .rafex-version-time{font-size:8px!important;}
    #rafexVersionInfoCard.rafex-version-card-login{right:10px!important;bottom:10px!important;}
  }
</style>`;

const script = `
<script ${marker}>
(function(){
  if(window.__rafexVersionInfoCardV10)return;
  window.__rafexVersionInfoCardV10=true;
  var BUILD_SHA=${JSON.stringify(buildSha)};
  var BUILD_TIME=${JSON.stringify(buildTime)};

  function isActuallyVisible(el){
    if(!el) return false;
    if(el.classList && el.classList.contains('hidden')) return false;
    var s=getComputedStyle(el);
    if(s.display==='none' || s.visibility==='hidden') return false;
    return el.getClientRects().length>0;
  }
  function ensureCard(){
    var card=document.getElementById('rafexVersionInfoCard');
    if(!card){
      card=document.createElement('div');
      card.id='rafexVersionInfoCard';
      card.setAttribute('aria-label','Son sürüm ve yüklenme bilgisi');
      card.innerHTML='<span class="rafex-version-dot" aria-hidden="true"></span><span class="rafex-version-copy"><span class="rafex-version-main">Son sürüm · '+BUILD_SHA+'</span><span class="rafex-version-time">Yüklenme: '+BUILD_TIME+'</span></span>';
    }
    return card;
  }
  function place(){
    if(!document.body)return;
    var oldWhite=document.getElementById('rafexBuildVersionBadge');
    if(oldWhite) oldWhite.remove();
    var card=ensureCard();
    var actions=document.querySelector('.top-actions');
    var appMode=isActuallyVisible(actions);

    card.classList.remove('rafex-version-card-top','rafex-version-card-login');
    if(appMode){
      card.classList.add('rafex-version-card-top');
      var history=actions.querySelector('.history-top');
      if(history){
        if(history.nextElementSibling!==card) history.insertAdjacentElement('afterend',card);
      }else if(card.parentElement!==actions){
        actions.appendChild(card);
      }
    }else{
      card.classList.add('rafex-version-card-login');
      if(card.parentElement!==document.body) document.body.appendChild(card);
    }
  }

  var queued=false;
  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(function(){queued=false;place();});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
  window.addEventListener('load',schedule,{once:true});
  document.addEventListener('click',function(){setTimeout(schedule,0)},true);
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
  setTimeout(schedule,100);
  setTimeout(schedule,500);
  setTimeout(schedule,1500);
})();
</script>`;

if (html.includes('</head>')) html = html.replace('</head>', style + '\n</head>');
else html = style + html;
if (html.includes('</body>')) html = html.replace('</body>', script + '\n</body>');
else html += script;

const encoded = Buffer.from(html, 'utf8').toString('base64');
source = source.replace(match[0], `const HTML_BASE64 =\n  "${encoded}";`);
fs.writeFileSync(target, source);

console.log(`Version badge position patch v10 RED CARD applied: ${buildSha} @ ${buildTime}`);
