import fs from 'node:fs';
export function cameraCaptureZoom(viewer,zoom=1){
 const value=Math.max(.2,Math.min(2,Number(zoom)||1));
 viewer.camera.position.sub(viewer.controls.target).multiplyScalar(1/value).add(viewer.controls.target);
 viewer.camera.far=Math.max(viewer.camera.far,viewer.camera.position.distanceTo(viewer.controls.target)*20);
 viewer.camera.updateProjectionMatrix();viewer.controls.update();
}
export function sourceTransform(source,name){
 if(source.includes('/* section-camera-zoom-v575 */'))return source;
 const start=source.indexOf('async function '+name+'(');if(start<0)throw Error('Missing capture function '+name);
 const anchor='    viewer.controls.update();',index=source.indexOf(anchor,start);if(index<0)throw Error('Missing capture controls '+name);
 return '/* section-camera-zoom-v575 */\n'+cameraCaptureZoom.toString()+'\n'+source.slice(0,index)+anchor+'\n    cameraCaptureZoom(viewer,settings.captureZoom);'+source.slice(index+anchor.length);
}
export function transform(html){
 if(html.includes('data-section-camera-zoom="v575"'))return html;
 const pattern=/(<script data-rafex-b2b-section-positioner-fallback="v5">)([\s\S]*?)(<\/script>)/,match=html.match(pattern);if(!match)throw Error('Missing section editor');
 let script=match[2];
 const replace=(a,b)=>{if(!script.includes(a))throw Error('v575 missing '+a);script=script.replace(a,b);};
 replace('      scale: clamp(number(value.scale, defaults.scale), 0.35, 2.5),','      captureZoom: clamp(number(value.captureZoom, 1), .2, 2),\n      scale: clamp(number(value.scale, defaults.scale), 0.35, 2.5),');
 replace('azimuth:settings.azimuth, elevation:settings.elevation, showPallets:settings.showPallets','captureZoom:settings.captureZoom, azimuth:settings.azimuth, elevation:settings.elevation, showPallets:settings.showPallets');
 replace('azimuth:settings.azimuth, elevation:settings.elevation, pixelRatio:1.5','captureZoom:settings.captureZoom, azimuth:settings.azimuth, elevation:settings.elevation, pixelRatio:1.5');
 replace('    if (zoom) zoom.textContent = `${Math.round(value.scale * 100)}%`;','    if (zoom) zoom.textContent = `${Math.round(value.scale * 100)}%`;\n    const cameraZoom=document.querySelector("[data-rafex-camera-zoom]");if(cameraZoom)cameraZoom.textContent=`${Math.round(value.captureZoom*100)}%`;');
 replace('  function changeScale(delta) {',`  function changeCaptureZoom(delta){if(!activeKey)return;const value=ensureSetting(activeKey);value.captureZoom=clamp(Math.round((value.captureZoom+delta)*100)/100,.2,2);previewCache.delete(activeKey);updateArtwork();schedulePreview(true,100);}
  function changeScale(delta) {`);
 replace('    value.x = 0; value.y = 0; value.scale = 1;','    value.x = 0; value.y = 0; value.scale = 1; value.captureZoom = 1;');
 replace('<div class="rafex-placement-controls"><span>Sürükle · Tekerlek</span>','<div class="rafex-option-row rafex-capture-zoom-controls"><strong>Çekim yakınlığı</strong><button type="button" data-rafex-camera-zoom-out aria-label="Çekimde uzaklaştır">−</button><strong data-rafex-camera-zoom>100%</strong><button type="button" data-rafex-camera-zoom-in aria-label="Çekimde yakınlaştır">+</button><small>Ölçü yazılarını kadraja almak için uzaklaştırın.</small></div><div class="rafex-placement-controls"><span>Sürükle · Tekerlek</span>');
 replace('    modal.querySelector("[data-rafex-zoom-out]")?.addEventListener', '    modal.querySelector("[data-rafex-camera-zoom-out]")?.addEventListener("click",()=>changeCaptureZoom(-.1));\n    modal.querySelector("[data-rafex-camera-zoom-in]")?.addEventListener("click",()=>changeCaptureZoom(.1));\n    modal.querySelector("[data-rafex-zoom-out]")?.addEventListener');
 html=html.replace(pattern,()=>match[1]+script+match[3]);
 return html.replace('</head>','<meta data-section-camera-zoom="v575"></head>');
}
if(process.argv[2]==='source'){
 for(const [file,name]of [['client/mr-viewer.entry.js','captureMRPerspective'],['client/b2b-viewer.entry.js','captureB2BPerspective'],['dist/b2b-viewer.patched.entry.js','captureB2BPerspective']])if(fs.existsSync(file))fs.writeFileSync(file,sourceTransform(fs.readFileSync(file,'utf8'),name));
}
else if(process.argv[1]?.replaceAll('\\','/').endsWith('/section-camera-zoom-v575.mjs'))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,s);
}
