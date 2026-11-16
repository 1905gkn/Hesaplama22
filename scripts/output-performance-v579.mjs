import fs from 'node:fs';import {pathToFileURL} from 'node:url';
import {buildSync} from 'esbuild';
const imageCacheBundle=buildSync({entryPoints:['client/output-capture-cache.entry.js'],bundle:true,format:'iife',target:'es2022',minify:true,write:false}).outputFiles[0].text;
export function transform(html){
 if(html.includes('output-performance-v579'))return html;
 const replace=(a,b)=>{if(!html.includes(a))throw Error('v579 missing anchor: '+a.slice(0,90));html=html.replace(a,b);};
 // The viewport export already paints the complete plan. Painting each restored
 // area first, then again on viewport exit, produced two discarded drawings.
 replace('documentState.activeAreaId=area.id;if(areas.length>1)restore(area.layout);await render({sections:areas.length===1});','documentState.activeAreaId=area.id;if(areas.length>1)restore(area.layout,false);await render({sections:areas.length===1});');
 // Only suppress the viewport exit paint during an area-output transaction;
 // its finally block restores the original active area after all captures.
 replace('let cover=null;output=true;preparedSignature=null;','let cover=null;output=true;preparedSignature=null;const previousBatch579=window.__rafexOutputBatch579;window.__rafexOutputBatch579=areas.length>1;');
 replace('try{documentState.activeAreaId=active;if(areas.length>1)restore(current().layout);','try{window.__rafexOutputBatch579=previousBatch579;documentState.activeAreaId=active;if(areas.length>1)restore(current().layout);');
 const cache=`/* output-performance-v579 */
  const sharedCaptureCache579=new Map();let sharedCaptureBytes579=0;
  function rememberCapture579(signature,src){if(typeof src!=='string')return;const bytes=src.length*2;if(bytes>12*1024*1024)return;
   const before=sharedCaptureCache579.get(signature);if(before){sharedCaptureBytes579-=before.bytes;sharedCaptureCache579.delete(signature);}
   while(sharedCaptureCache579.size&&(sharedCaptureBytes579+bytes>12*1024*1024||sharedCaptureCache579.size>=12)){const first=sharedCaptureCache579.keys().next().value;sharedCaptureBytes579-=sharedCaptureCache579.get(first).bytes;sharedCaptureCache579.delete(first);}
   sharedCaptureCache579.set(signature,{src,bytes});sharedCaptureBytes579+=bytes;
  }
`;
 replace('  const previewCache = new Map();','  const previewCache = new Map();\n'+cache);
 replace('    if (previewPending.has(key)) {',`    const renderSignature579=JSON.stringify({...JSON.parse(signature),key:undefined});
    if(!force&&sharedCaptureCache579.has(renderSignature579)){const hit=sharedCaptureCache579.get(renderSignature579);previewCache.set(key,{signature,src:hit.src});trimPreviewCache();return hit.src;}
    const durableKey579=await window.rafexSectionImageCache579?.key(renderSignature579);
    if(!force&&durableKey579){const hit=await window.rafexSectionImageCache579.get(durableKey579);if(hit){rememberCapture579(renderSignature579,hit);previewCache.set(key,{signature,src:hit});trimPreviewCache();const report=document.getElementById('m2CorporatePreview');if(report)report.dataset.reusedSections579=String((Number(report.dataset.reusedSections579)||0)+1);return hit;}}
    if (previewPending.has(key)) {`);
 replace('      const src = await capture.call(mr ?', '      const captureStarted579=performance.now();\n      const src = await capture.call(mr ?');
 replace('      if (src) { previewCache.set(key, { signature, src }); trimPreviewCache(); }',`      const report579=document.getElementById('m2CorporatePreview');if(report579){const timings=JSON.parse(report579.dataset.sectionTimings579||'[]');timings.push({key,ms:Math.round(performance.now()-captureStarted579)});report579.dataset.sectionTimings579=JSON.stringify(timings.slice(-40));}
      if (src) { await window.rafexSectionImageCache579?.put(durableKey579,src);rememberCapture579(renderSignature579,src);previewCache.set(key, { signature, src }); trimPreviewCache(); }`);
 // Smaller discarded section passes need no 400ms section repair window.
 replace('      await wait(400);','      await wait(options.sections===false?64:400);');
 replace('      for(const type of types){\n        if(settingFor(type.key,source).excluded)continue;\n        const src=await capturePerspective',`      let captureIndex579=0;
      for(const type of types){
        if(settingFor(type.key,source).excluded)continue;
        const progress579=document.getElementById('m2CreateOutputButton');if(progress579&&window.__rafexManualOutputBuild)progress579.textContent='Kesit '+(++captureIndex579)+' / '+types.length;
        const src=await capturePerspective`);
 const end=html.lastIndexOf('</body>');
 const viewport=`<script data-output-viewport="v579">(()=>{
  const api=window.rafexViewportV248;if(!api)return;const full=api.withFull;
  api.withFull=function(fn){if(!window.__rafexOutputBatch579)return full.apply(this,arguments);
   const paint=m2RenderLayout;let painted=false;
   m2RenderLayout=function(){if(painted)return;painted=true;return paint.apply(this,arguments);};
   try{return full.apply(this,arguments);}finally{m2RenderLayout=paint;}
  };
 })();</script>`;
 return html.slice(0,end)+'<script data-output-image-cache="v579">'+imageCacheBundle+'</script>'+viewport+html.slice(end);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,s);
}
