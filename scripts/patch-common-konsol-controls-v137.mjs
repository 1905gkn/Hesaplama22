import fs from 'node:fs';

// Presentation only: leave standalone Konsol and all save handlers intact.
export function transform(html){
  if(html.includes('data-rafex-common-konsol-controls="v137"'))return html;
  for(const anchor of ['konsolBottomWorkspace','konsol-section-card','rafexKonsolCommonSaveRack','data-rafex-screen-session="v136"']){
    if(!html.includes(anchor))throw Error('v137 missing anchor: '+anchor);
  }
  const css=`<style data-rafex-common-konsol-controls="v137">
#page[data-rafex-free-drawing="1"][data-rafex-free-context-system="konsol"] #konsolBottomWorkspace,
#page[data-rafex-free-drawing="1"][data-rafex-free-context-system="konsol"] .konsol-section-card{display:none!important}
#page[data-rafex-free-drawing="1"][data-rafex-free-context-system="konsol"] .rafex-konsol-common-savebar{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:0!important;width:100%!important;box-sizing:border-box;margin:12px 0 16px!important;padding:0!important;border:0!important;background:transparent!important}
#page[data-rafex-free-drawing="1"][data-rafex-free-context-system="konsol"] #rafexKonsolCommonSaveRack{display:block!important;width:100%!important;min-height:46px!important;box-sizing:border-box;background:var(--y,#f2c500)!important;color:var(--ink,#17201b)!important;border:0!important;border-radius:9px!important;font-size:14px!important;font-weight:900!important}
#page[data-rafex-free-drawing="1"][data-rafex-free-context-system="konsol"] #rafexKonsolCommonSaveStatus{order:2;margin:4px 0 0!important;text-align:left}
</style>`;
  const end=html.lastIndexOf('</body>');if(end<0)throw Error('v137 body missing');
  return html.slice(0,end)+css+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-common-konsol-controls-v137.mjs')){
  const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
  if(!m)throw Error('v137 HTML_BASE64 missing');
  const h=transform(Buffer.from(m[2],'base64').toString('utf8'));
  fs.writeFileSync(file,s.replace(m[0],m[0].replace(m[2],Buffer.from(h).toString('base64'))));
  console.log('v137: common Konsol uses one shared workspace and full-width yellow rack save');
}
