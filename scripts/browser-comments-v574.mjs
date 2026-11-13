import fs from 'node:fs';
export function transform(html){
 if(html.includes('data-browser-comments="v574"'))return html;
 const css=`
 /* Keep MR's full drawing row immediately above the save controls. */
 #page#page[data-rafex-common-active="1"] .mr-view-card{display:flex!important;flex-direction:column!important;gap:0!important;align-self:start!important;height:auto!important}
 #page#page[data-rafex-common-active="1"] .mr-canvas-wrap{flex:0 0 clamp(660px,calc(100vh - 276px),1100px)!important;width:100%!important;height:clamp(660px,calc(100vh - 276px),1100px)!important;min-height:clamp(660px,calc(100vh - 276px),1100px)!important;max-height:none!important;margin:0!important;box-sizing:border-box!important}
 #page#page .mr-canvas-wrap #mrCanvas{display:block!important;width:100%!important;height:100%!important;min-height:0!important;max-height:none!important}
 #page#page .mr-view-card>.mr-rack-save{margin-top:0!important;flex-shrink:0!important}
 /* All toolbar groups participate in layout, including long translations. */
 #page#page .rafex-plan-toolbar-v150{display:flex!important;flex-wrap:wrap!important;justify-content:flex-start!important;gap:8px!important;padding:8px!important}
 #page#page .rafex-plan-toolbar-v150>:is(.m2-layout-zoom-floating,.rafex-menu-center-v219,.rafex-type-letter-scale-v65){position:static!important;inset:auto!important;transform:none!important;display:flex!important;flex-wrap:wrap!important;flex:0 1 auto!important;width:auto!important;max-width:100%!important;min-width:0!important;gap:5px!important}
 #page#page .rafex-plan-toolbar-v150 :is(button,summary,label){font-size:11px!important;line-height:1.25!important;white-space:normal!important;overflow-wrap:anywhere;min-width:0!important;max-width:100%!important}
 #page#page .rafex-plan-toolbar-v150 :is(button,summary){padding:7px 8px!important;min-height:32px!important}
 #page#page .rafex-plan-toolbar-v150 .rafex-type-letter-row{flex-wrap:wrap!important;min-width:0!important}
 #page#page .rafex-plan-toolbar-v150 .rafex-type-letter-row input{width:48px!important;min-width:0!important}
 @media(max-width:600px){#page#page[data-rafex-common-active="1"] .mr-canvas-wrap{flex-basis:660px!important;height:660px!important;min-height:660px!important}}
 `;
 html=html.replace(/\/(b2b-viewer|mr-viewer|konsol-viewer|mekik-front-viewer|drive-in-viewer)\.js\?v=[\w.-]+/g,'/$1.js?v=575');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing closing body');
 return html.slice(0,end)+'<style data-browser-comments="v574">'+css+'</style>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/browser-comments-v574.mjs'))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');
 if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing embedded HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}
 fs.writeFileSync(file,s);
}
