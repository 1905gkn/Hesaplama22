import fs from 'node:fs';
import vm from 'node:vm';
const file='dist/server/index.js',source=fs.readFileSync(file,'utf8');
const match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
if(!match)throw Error('Missing compiled HTML');
let html=Buffer.from(match[1],'base64').toString();
const runtime=fs.readFileSync(new URL('./common-workflow-screens.js',import.meta.url),'utf8');
new vm.Script(runtime);
html=html.replace(/<style data-rafex-workflow-screens="v1">[\s\S]*?<\/style>/g,'').replace(/<script data-rafex-workflow-screens="v1">[\s\S]*?<\/script>/g,'');
const style=`<style data-rafex-workflow-screens="v1">
#page[data-rafex-workflow-screen] #rafexLayoutScreenLaunch{display:block;width:100%;margin:10px 0 18px}
#page[data-rafex-workflow-screen] #rafexOpenLayoutScreen,#page[data-rafex-workflow-screen] #rafexBackToRackTypes{min-height:48px;padding:12px 24px;border:0;border-radius:8px;background:#17553c;color:white;font-weight:700;cursor:pointer}
#page[data-rafex-workflow-screen] #rafexOpenLayoutScreen{width:100%}
#page[data-rafex-workflow-screen="types"] #rafexLayoutScreenHeader,
#page[data-rafex-workflow-screen="types"] .rafex-free-mode-note,
#page[data-rafex-workflow-screen="types"] .rafex-free-shortcuts,
#page[data-rafex-workflow-screen="types"] .m2-floor-editor>:not(#m2SavedTypesPanel):not([id$="Modal"]):not([role="dialog"]){display:none!important}
#page[data-rafex-workflow-screen="types"] .m2-floor-editor{display:block!important;min-height:0!important;padding:12px!important}
#page[data-rafex-workflow-screen] #m2SavedTypesPanel{display:block!important}
#page[data-rafex-workflow-screen="layout"] #rafexLayoutScreenLaunch,
#page[data-rafex-workflow-screen="layout"] #rafexUnifiedSystemPicker,
#page[data-rafex-workflow-screen="layout"] .m2-layout,
#page[data-rafex-workflow-screen="layout"] .mr-workspace,
#page[data-rafex-workflow-screen="layout"] .konsol-shell,
#page[data-rafex-workflow-screen="layout"] .rafex-b2b-mekik-savebar,
#page[data-rafex-workflow-screen="layout"] .common-full-savebar,
#page[data-rafex-workflow-screen="layout"] .mr-rack-save{display:none!important}
#rafexLayoutScreenHeader{margin:16px 0;padding:20px;scroll-margin-top:16px}
#rafexLayoutScreenHeader h2{margin:0 0 8px}#rafexLayoutScreenHeader p{margin:0 0 16px}
@media print{#rafexLayoutScreenLaunch,#rafexLayoutScreenHeader{display:none!important}}
</style>`;
const bodyEnd=html.lastIndexOf('</body>');
if(bodyEnd<0)throw Error('Missing final body closing tag');
html=html.slice(0,bodyEnd)+style+'<script data-rafex-workflow-screens="v1">'+runtime+'</script>'+html.slice(bodyEnd);
fs.writeFileSync(file,source.replace(match[1],Buffer.from(html).toString('base64')));
console.log('Common workflow: separate rack-type and placement screens, shared live catalog.');
