import fs from 'node:fs';

const target = 'dist/server/index.js';
let source = fs.readFileSync(target, 'utf8');
const match = source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1\s*;/);
if (!match) throw new Error('HTML_BASE64 bulunamadi.');

let html = Buffer.from(match[2], 'base64').toString('utf8');
const marker = 'data-rafex-version-badge-position="v8"';
const buildSha = String(process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'local').slice(0, 7);
const badgeText = `SON SÜRÜM · ${buildSha}`;

// Onceki tum runtime badge enjeksiyonlarini temizle. Bu surum JS kullanmaz.
html = html
  .replace(/<style\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/style>\s*/g, '')
  .replace(/<script\s+data-rafex-version-badge-position="v\d+">[\s\S]*?<\/script>\s*/g, '')
  .replace(/<span\s+id="rafexBuildVersionBadge"[^>]*>[\s\S]*?<\/span>\s*/g, '');

const style = `
<style ${marker}>
  #rafexVersionBadge{display:none!important;}
  .top-actions{display:flex!important;align-items:center!important;gap:8px!important;}
  #rafexBuildVersionBadge{
    display:inline-flex!important;
    align-items:center!important;
    justify-content:center!important;
    box-sizing:border-box!important;
    flex:0 0 auto!important;
    white-space:nowrap!important;
    margin:0!important;
    padding:6px 9px!important;
    border:1px solid #d7dfda!important;
    border-radius:8px!important;
    background:#fff!important;
    box-shadow:0 3px 12px rgba(23,32,27,.10)!important;
    color:#536058!important;
    font:800 10px/1.15 Arial,sans-serif!important;
    letter-spacing:.035em!important;
    opacity:1!important;
    visibility:visible!important;
    pointer-events:none!important;
  }
  @media(max-width:760px){
    #rafexBuildVersionBadge{padding:5px 7px!important;font-size:9px!important;}
  }
</style>`;

const historyButton = '<button class="soft history-top" onclick="openHistory()">';
if (!html.includes(historyButton)) {
  throw new Error('Proje Gecmisi butonu bulunamadi; statik surum rozeti eklenemedi.');
}

html = html.replace(
  historyButton,
  `<span id="rafexBuildVersionBadge" aria-label="Canli surum bilgisi">${badgeText}</span>${historyButton}`,
);

if (html.includes('</head>')) html = html.replace('</head>', style + '\n</head>');
else html = style + html;

const encoded = Buffer.from(html, 'utf8').toString('base64');
source = source.replace(match[0], `const HTML_BASE64 =\n  "${encoded}";`);
fs.writeFileSync(target, source);

console.log(`Version badge position patch v8 STATIC applied: ${buildSha}`);
