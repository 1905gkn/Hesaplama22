import fs from 'node:fs';
export function transform(html){
 if(!html.includes('data-history-layer="v175"')){
  const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');
  html=html.slice(0,at)+'<style data-history-layer="v175">#historyModal{z-index:10000!important}</style>'+html.slice(at);
 }
 if(html.includes('data-common-ui="v161"'))return html;
 const anchor="  node.textContent=text;\n }\n async function persist(saveTypes){";
 if(!html.includes(anchor))throw Error('v161 drawing catalog status anchor missing');
 // Hide routine information, but never conceal a failed save or required action.
 html=html.replace(anchor,"  node.textContent=text;node.dataset.error=/^(Kaydedilemedi:|Önce )/.test(text)?'1':'0';\n }\n async function persist(saveTypes){");
 const css=`<style data-common-ui="v161">
#page#page[data-rafex-workflow-screen="types"] #m2AutoFillControls{display:none!important;visibility:hidden!important;position:absolute!important;pointer-events:none!important}
#page#page[data-rafex-workflow-screen] #m2SavedTypesPanel .m2-saved-types-head button[onclick="m2RefreshSavedRackTypes()"],
#page#page[data-rafex-workflow-screen] #m2SavedTypesPanel .m2-saved-types-head button[onclick="m2AddSelectedSavedRack()"],
#page#page #rafexIndependentProjectInfoV133,
#page#page #rafexProjectStartStatusV157:not([data-error="1"]){display:none!important}
#page #rafexProjectImportV155>.project-import-panel{width:100%!important;min-width:0!important;max-width:100%!important;box-sizing:border-box;overflow-wrap:anywhere}
</style>`;
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body');return html.slice(0,end)+css+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-common-ui-v161.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
