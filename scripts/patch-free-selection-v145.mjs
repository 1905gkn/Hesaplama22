import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const file='dist/server/index.js';
let source=fs.readFileSync(file,'utf8');
const match=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
if(!match)throw new Error('Free selection: HTML_BASE64 missing');
let html=Buffer.from(match[2],'base64').toString('utf8');
html=html.replace('aside>:not(.m2-customize-head):not(.rafex-mr-customize-summary):not(.m2-customize-actions){','aside>:not(.m2-customize-head):not(.rafex-mr-customize-summary):not(.m2-customize-actions):not(.rafex-mr-batch-fields):not(.rafex-batch-note-v145){');
html=html.replace(/<style data-rafex-free-selection="v145">[\s\S]*?<\/style>/g,'').replace(/<script data-rafex-free-selection="v145">[\s\S]*?<\/script>/g,'');
const scope='#page:is([data-rafex-common-active="1"],[data-rafex-free-drawing="1"],.rafex-free-drawing-page)';
const style=`<style data-rafex-free-selection="v145">
${scope} .m2-ortho-tools,${scope} .m2-project-actions>div:first-child,${scope} .m2-export-copy,${scope} label:has(>#m2ReportType){display:none!important}
${scope} .m2-project-actions{justify-content:flex-end!important}
${scope} .m2-export{min-height:0!important;padding:6px 8px!important;justify-content:flex-end!important}
${scope} .measure-tools{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important;align-content:start!important;align-items:stretch!important}
${scope} .measure-tools>button,${scope} .measure-tools>label{width:100%!important;min-width:0!important;margin:0!important;box-sizing:border-box!important;justify-content:center!important}
${scope} .measure-tools::before,${scope} .measure-tools>.m2-tool-title,${scope} .measure-tools>#m2AreaDimsButton,${scope} .measure-tools>#m2DimensionMoveButton,${scope} .measure-tools>.m2-summary-toggles{grid-column:1/-1}
${scope} .measure-tools>.m2-summary-toggles{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}
${scope} .measure-tools .m2-summary-toggles button{min-width:0!important;padding:7px 4px!important;font-size:10px!important}
${scope} .measure-tools>#m2AreaDimsButton{order:1}
${scope} .measure-tools>#m2MeasureToolButton{order:2}
${scope} .measure-tools>#m2BetweenMeasureButton{order:3}
${scope} .measure-tools>#m2DimensionMoveButton{order:4}
${scope} .measure-tools>label:has(#m2DimensionFontSize){order:5}
${scope} .measure-tools>label:has(#m2AnnotationFontSize){order:6}
${scope} .measure-tools>#m2TextToolButton{order:7;grid-column:1/-1}
${scope} .measure-tools>.m2-summary-toggles{order:8}
${scope} #rafexPickBlocksV145{flex-basis:100%;border:1px solid #214f3b}
${scope} #rafexPickBlocksV145.active{background:#214f3b;color:white}
${scope} .m2-layout-rack.selected{stroke-width:3!important;stroke-dasharray:6 3!important}
.rafex-batch-note-v145{padding:10px;background:#eaf5ee;border:1px solid #a1c4ae;border-radius:7px;font-size:12px;color:#214f3b}
.rafex-mr-batch-fields{display:grid;gap:8px;padding:12px;border:1px solid #a1c4ae;border-radius:8px}
.rafex-mr-batch-fields label{display:grid;gap:4px}.rafex-mr-batch-fields input{width:100%;min-height:36px;box-sizing:border-box}
#m2CustomizeModal:has(.rafex-batch-note-v145) .rafex-single-module-note{display:none}
#m2CustomizeModal:has(.rafex-mr-batch-fields) .rafex-mr-customize-summary,#m2CustomizeModal:has(.rafex-mr-batch-fields) .m2-customize-actions{display:none!important}
</style>`;
const code=['free-selection-core-v145.js','free-selection-runtime-v145.js'].map(name=>fs.readFileSync(fileURLToPath(new URL(name,import.meta.url)),'utf8')).join('\n');
new vm.Script(code,{filename:'free-selection-v145.js'});
const end=html.lastIndexOf('</body>');if(end<0)throw new Error('Free selection: body missing');
html=html.slice(0,end)+style+'<script data-rafex-free-selection="v145">'+code+'</script>'+html.slice(end);
source=source.slice(0,match.index)+match[0].replace(match[2],Buffer.from(html).toString('base64'))+source.slice(match.index+match[0].length);
fs.writeFileSync(file,source);
console.log('Free drawing: persistent selection, selected-only customization and separation.');
