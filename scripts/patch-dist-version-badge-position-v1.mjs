import fs from 'node:fs';

const target = 'dist/server/index.js';
let source = fs.readFileSync(target, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1\s*;/);
if (!match) throw new Error('HTML_BASE64 bulunamadi.');

let html = Buffer.from(match[2], 'base64').toString('utf8');
const marker = 'data-rafex-version-badge-position="v14"';
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

html = html
  .replace(/<style\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/style>\s*/g, '')
  .replace(/<script\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/script>\s*/g, '')
  .replace(/<span\s+id="rafexBuildVersionBadge"[^>]*>[\s\S]*?<\/span>\s*/g, '')
  .replace(/<div\s+id="rafexVersionInfoTop"[^>]*>[\s\S]*?<\/div>\s*/g, '')
  .replace(/<div\s+id="rafexVersionInfoLogin"[^>]*>[\s\S]*?<\/div>\s*/g, '');

const cardInner = `<span class="rafex-version-dot" aria-hidden="true"></span><span class="rafex-version-copy"><span class="rafex-version-main">Son sürüm · ${buildSha}</span><span class="rafex-version-time">Yüklenme: ${buildTime}</span></span>`;
const topCard = `<div id="rafexVersionInfoTop" class="rafex-version-info-card" aria-label="Son sürüm ve yüklenme bilgisi">${cardInner}</div>`;
const loginCard = `<div id="rafexVersionInfoLogin" class="rafex-version-info-card" aria-label="Son sürüm ve yüklenme bilgisi">${cardInner}</div>`;

const style = `
<style ${marker}>
  #rafexVersionBadge,#rafexBuildVersionBadge{display:none!important;}
  .top-actions{display:flex!important;align-items:center!important;gap:8px!important;}
  .rafex-version-info-card{
    box-sizing:border-box!important;
    min-width:188px!important;
    height:46px!important;
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
  .top-actions>#rafexVersionInfoTop{display:flex!important;position:static!important;margin:0!important;transform:none!important;align-self:center!important;}
  .top #rafexVersionInfoCard,
  .top .rafex-version-info-card:not(#rafexVersionInfoTop){display:none!important;}
  #rafexVersionInfoLogin{display:none!important;position:fixed!important;right:18px!important;bottom:18px!important;top:auto!important;left:auto!important;margin:0!important;transform:none!important;z-index:99991!important;}
  body:has(#auth:not(.hidden)) #rafexVersionInfoLogin{display:flex!important;}
  body:has(#app:not(.hidden)) #rafexVersionInfoLogin{display:none!important;}
  .rafex-version-dot{width:6px!important;height:6px!important;border-radius:50%!important;background:#690013!important;flex:0 0 6px!important;}
  .rafex-version-copy{display:flex!important;flex-direction:column!important;justify-content:center!important;gap:3px!important;min-width:0!important;}
  .rafex-version-main{color:#65000d!important;font-size:11px!important;font-weight:800!important;letter-spacing:0!important;}
  .rafex-version-time{color:#8c646a!important;font-size:9px!important;font-weight:400!important;}
  @media(max-width:760px){
    .rafex-version-info-card{min-width:172px!important;height:42px!important;padding:5px 10px!important;gap:8px!important;}
    .rafex-version-main{font-size:10px!important;}.rafex-version-time{font-size:8px!important;}
    #rafexVersionInfoLogin{right:10px!important;bottom:10px!important;}
  }
</style>`;

const historyRe = /(<button\s+class="soft history-top"\s+onclick="openHistory\(\)"[^>]*>[\s\S]*?<\/button>)/;
if (!historyRe.test(html)) throw new Error('Proje Gecmisi butonu bulunamadi.');
html = html.replace(historyRe, `$1${topCard}`);

if (html.includes('<body>')) html = html.replace('<body>', `<body>${loginCard}`);
else throw new Error('body etiketi bulunamadi.');

const dedupeScript = `
<script ${marker}>
(function(){
  function normalized(el){
    return String(el && (el.innerText || el.textContent) || '').replace(/\\s+/g,' ').trim().toLocaleLowerCase('tr-TR');
  }
  function isVersionCopy(el){
    var txt=normalized(el);
    return (txt.includes('son sürüm') || txt.includes('son surum')) && (txt.includes('yüklenme') || txt.includes('yuklenme'));
  }
  function dedupe(){
    var keep=document.getElementById('rafexVersionInfoTop');
    var top=document.querySelector('.top');
    if(!keep||!top)return;

    Array.from(top.querySelectorAll('*')).forEach(function(el){
      if(el===keep || el.contains(keep) || keep.contains(el)) return;
      if(!isVersionCopy(el)) return;
      el.style.setProperty('display','none','important');
      el.setAttribute('data-rafex-version-duplicate-hidden','1');
    });
  }

  var queued=false;
  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(function(){queued=false;dedupe();});
  }

  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
  window.addEventListener('load',schedule);
  document.addEventListener('click',function(){setTimeout(schedule,0)},true);
  schedule();
  setTimeout(schedule,100);
  setTimeout(schedule,500);
  setTimeout(schedule,1200);
})();
</script>`;

if (html.includes('</head>')) html = html.replace('</head>', style + '\n</head>');
else html = style + html;
if (html.includes('</body>')) html = html.replace('</body>', dedupeScript + '\n</body>');
else html += dedupeScript;

const encoded = Buffer.from(html, 'utf8').toString('base64');
source = source.replace(match[0], `const HTML_BASE64 =\n  "${encoded}";`);
fs.writeFileSync(target, source);

console.log(`Version badge position patch v14: one app-header card only: ${buildSha} @ ${buildTime}`);
