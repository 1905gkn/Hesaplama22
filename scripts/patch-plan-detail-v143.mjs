import fs from 'node:fs';
import {planDetail,renderPlan} from './plan-detail-v143.mjs';
const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
let html=Buffer.from(m[2],'base64').toString();
const replace=(a,b)=>{if(!html.includes(a))throw Error('v143 missing anchor: '+a.slice(0,100));html=html.replace(a,b)};
const section=(a,b,value)=>{const start=html.indexOf(a),end=html.indexOf(b,start);if(start<0||end<0)throw Error('v143 section missing: '+a);html=html.slice(0,start)+value+html.slice(end)};
// Keep the input editor's dimensions and interactive V-brace controls; share
// every structural component and pallet coordinate with the floor renderer.
section('        let sectionY = topY;','        const topFlowFont =',`        top += window.rafexRenderPlanV143(window.rafexPlanDetailV143(m2LastDrawing),{x:left,y:topY,scale:topScale,braces:false});\n`);
section('          let partY = rack.y;','          const areaPointsV136=',`          const savedPlanV143=window.rafexReadRackDetailV135?.(rack,'top')||window.rafexPlanDetailV143(rack),planScaleV143=rack.w/savedPlanV143.width;
          html+=window.rafexRenderPlanV143(savedPlanV143,{x:rack.x,y:rack.y,scale:planScaleV143});
          const palletRowH=savedPlanV143.palD*planScaleV143;
`);
// Flow markers retain the user's 50/100m limits, but use the saved channel centres.
replace('const flowX = rack.x + (bay + .5) * cellW, topMarkerY', 'const flowX = rack.x + (savedPlanV143.foot/2+(bay+.5)*savedPlanV143.pitch)*planScaleV143, topMarkerY');
section('          const seismicNodeYs = [];','          const rackLabel =', '');
// Persist the resolved top plan with the other saved views. Existing records
// without a top snapshot are upgraded from their own fields on the next save.
replace('if(existing)return clone(d);', "if(existing&&(!['drive','mekik2'].includes(sys)||readDetail(d,'top')))return clone(d);");
replace('else {views[sys]=clone(clean);views.front=', 'else {views.top=window.rafexPlanDetailV143(clean);views[sys]=clone(clean);views.front=');
// Capture the top-view visibility settings at save time instead of consulting a
// different active module when the saved type is used later.
replace('topVBraceBays: [...normalizedTopVBraceBays].sort((a,b) => a-b), plan,', 'topVBraceBays: [...normalizedTopVBraceBays].sort((a,b) => a-b), showFlowArrows:$("m2ShowFlowArrows")?.checked!==false, plan,');
replace('rackDetail:source.rackDetail?', 'showFlowArrows:source.showFlowArrows,showPallets:source.showPallets,rackDetail:source.rackDetail?');
replace('if ($("m2ShowFlowArrows")?.checked !== false) for (let bay = 0; bay < rack.bays;', 'if (savedPlanV143.showFlow && $("m2ShowFlowArrows")?.checked !== false) for (let bay = 0; bay < rack.bays;');
// These helpers must exist before initial rendering starts in earlier scripts.
const runtime=`<script data-rafex-plan-detail="v143">window.rafexPlanDetailV143=${planDetail.toString()};window.rafexRenderPlanV143=${renderPlan.toString()};</script>`;
const firstScript=html.indexOf('<script');html=html.slice(0,firstScript)+runtime+html.slice(firstScript);
fs.writeFileSync(file,source.replace(m[0],m[0].replace(m[2],Buffer.from(html).toString('base64'))));
console.log('v143: saved physical top plan shared by editor and layout.');
