import fs from 'node:fs';
import {runtime} from './rack-detail-snapshot-v135.mjs';
const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),m=source.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);
let html=Buffer.from(m[2],'base64').toString();
function replace(a,b){if(!html.includes(a))throw Error('Snapshot anchor missing: '+a.slice(0,100));html=html.replace(a,b)}
replace('async function req(url, opt = {}) {','async function req(url, opt = {}) {\n        opt=window.rafexPrepareRackSaveV135?.(url,opt)||opt;');
replace('const rack = { id, typeName, typeColor:', 'const rack = { id, typeName, rackDetail:source.rackDetail?JSON.parse(JSON.stringify(source.rackDetail)):null,b2bViewerOptions:source.b2bViewerOptions?JSON.parse(JSON.stringify(source.b2bViewerOptions)):null, typeColor:');
replace('rack.rafexSystem=system;', 'rack.rafexSystem=system;rack.rackDetail=drawing.rackDetail?clone(drawing.rackDetail):null;');
replace('const snapshot=freeze(clone(entry.drawing));', 'const snapshot=freeze(window.rafexSealRackDetailV135?window.rafexSealRackDetailV135(entry.drawing):clone(entry.drawing));');
for(const [signature,arg,kind] of [['function b2bOptions(d){','d','b2b'],['function mrConfig(d){','d','mr'],['function konsolOptions(d){','d','konsol'],['function configFromRack(rack){','rack','mr']]){
  replace(signature,signature+`const storedV135=window.rafexReadRackDetailV135?.(${arg},'${kind}');if(storedV135)return storedV135;`);
}
replace('window.rafexB2BDetailMeasureV117=b2bMeasure;', 'window.rafexB2BDetailMeasureV117=b2bMeasure;window.rafexKonsolDetailOptionsV135=konsolOptions;');
replace('function m2ReportElevationSvg(drawing, mode) {', 'function m2ReportElevationSvg(drawing, mode) {const storedV135=window.rafexReadRackDetailV135?.(drawing,mode);if(storedV135)return storedV135;');
replace('if ($("m2DxfButton")) $("m2DxfButton").disabled', 'const copiedV135=window.rafexCopiedDrawingV135?.(m2ActiveModule);if(copiedV135)m2LastDrawing=copiedV135;\n        if ($("m2DxfButton")) $("m2DxfButton").disabled');
replace('mrConfigurationV2=function(){', "mrConfigurationV2=function(){const storedV135=window.rafexCopiedDetailV135?.('mr');if(storedV135)return storedV135;");
replace('function options(rack,fromForm){var k=', "function options(rack,fromForm){const storedV135=window.rafexReadRackDetailV135?.(rack,'konsol');if(storedV135&&(!fromForm||['rkcCount','rkcSpacing','rkcHeight','rkcArm','rkcBase','rkcLevels'].every((id,i)=>Number(document.getElementById(id)?.value)===Number(storedV135[['uprightCount','spacing','height','armLength','baseDepth','levels'][i]]))&&((document.getElementById('rkcSide')?.value==='double')===storedV135.doubleSided)))return storedV135;var k=");
// Every copy action reaches this shared loader, including its deferred attempts.
replace('m2SavedRackTypes=[copy];m2SelectedSavedType=0;', 'window.rafexUseCopiedDetailV135?.(copy.__rafexSnapshot||copy.drawing);m2SavedRackTypes=[copy];m2SelectedSavedType=0;');
replace('const live=previousMainOptionsV134.apply(this,arguments),state=', "const storedV135=window.rafexCopiedDetailV135?.('b2b');if(storedV135)return storedV135;const live=previousMainOptionsV134.apply(this,arguments),state=");
// Preserve the starting Customize view until a field/accessory is edited.
replace('function b2bCustomizeOptions(rack){var out=', "function b2bCustomizeOptions(rack){if(!document.getElementById('m2CustomizeModal')?.dataset.detailEditedV135){const stored=window.rafexReadRackDetailV135?.(rack,'b2b');if(stored)return stored;}var out=");
replace("window.rafexResetCustomizePlanV121?.();previousOpen", "window.rafexResetCustomizePlanV121?.();const modalV135=document.getElementById('m2CustomizeModal');if(modalV135){delete modalV135.dataset.detailEditedV135;if(!modalV135.dataset.detailEventsV135){modalV135.dataset.detailEventsV135='1';const dirty=()=>{modalV135.dataset.detailEditedV135='1'};modalV135.addEventListener('input',dirty,true);modalV135.addEventListener('change',dirty,true);modalV135.addEventListener('click',e=>{if(e.target.closest('button')&&!e.target.closest('.m2-customize-actions,.m2-customize-head'))dirty()},true)}}previousOpen");
// The new customization record retains the edited preview, not the original snapshot.
replace('rack.b2bViewerOptions=JSON.parse(JSON.stringify(detailV134));', 'rack.b2bViewerOptions=JSON.parse(JSON.stringify(detailV134));delete rack.rackDetail;');
replace('const drawing=m2DrawingFromCustomizedRack(rack),existingIndex=', 'rack.rackDetail=window.rafexSealRackDetailV135(rack).rackDetail;const drawing=m2DrawingFromCustomizedRack(rack),existingIndex=');
replace('previewConfig.dimensionScale=Math.max(2,Number(previewConfig.dimensionScale)||2);', 'previewConfig.dimensionScale=Number(previewConfig.dimensionScale)||2;');
replace('inspectConfig.dimensionScale=Math.max(2,Number(inspectConfig.dimensionScale)||2);', 'inspectConfig.dimensionScale=Number(inspectConfig.dimensionScale)||2;');
const end=html.lastIndexOf('</body>');html=html.slice(0,end)+runtime+html.slice(end);
fs.writeFileSync(file,source.replace(m[0],m[0].replace(m[2],Buffer.from(html).toString('base64'))));
console.log('v135: persistent rack detail snapshots connected to save, copy, floor and detail views.');
