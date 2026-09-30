import fs from 'node:fs';
export function viewerTransform(s){if(s.includes('mr-speed-v213'))return s;const rep=(a,b)=>{if(!s.includes(a))throw Error('MR anchor '+a);s=s.replace(a,b)};
 rep('window.RafexMRViewer={','window.RafexMRViewer={preload(){return Promise.all([os("upright"),os("traverse"),os("tray")]);},');
 rep('return B?.destroy(),B=new ce(l,e),B','if(B&&!B.destroyed&&B.canvas===l){if(e?.config)B.setConfiguration(e.config);return B;}return B?.destroy(),B=new ce(l,e),B');
 rep('this.renderer.shadowMap.enabled=!0','this.renderer.shadowMap.enabled=this.canvas.id!=="mrCanvas"');
 rep('this.configSignature=t;let L=', 'this.configSignature=t;if(this.canvas.id==="mrCanvas"&&!this.renderer.shadowMap.enabled){requestAnimationFrame(()=>requestAnimationFrame(()=>{if(this.destroyed)return;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.needsUpdate=true;this.frameDirty=true;}));}let L=');
 return s+'\n/* mr-speed-v213 */';
}
export function transform(html){if(html.includes('data-mr-speed="v213"'))return html;
 const start=html.indexOf('      function mrMountViewer(){'),end=html.indexOf('      function renderMR(){',start);if(start<0||end<0)throw Error('Mount anchor');
 html=html.slice(0,start)+`      function mrMountViewer(){
 const canvas=$('mrCanvas');if(!canvas)return;
 if(!canvas.__mrStatusV213){canvas.__mrStatusV213=true;canvas.addEventListener('mr-viewer-measure-edit',event=>window.mrOpenMeasureV12?.(event.detail?.key));for(const name of ['loading','model','error'])canvas.addEventListener('mr-viewer-'+name,event=>{if($('mrCanvas')!==canvas)return;const status=$('mrViewerStatus');if(status)status.textContent=name==='error'?(event.detail?.message||'MR modeli yüklenemedi.'):(event.detail?.label||'MR modeli')+(name==='model'?' · hazır':' yükleniyor…');});}
 if(!window.RafexMRViewer?.mount){if(canvas.__mrPendingV213)return;canvas.__mrPendingV213=true;if($('mrViewerStatus'))$('mrViewerStatus').textContent='MR 3D motoru hazırlanıyor…';Promise.resolve(window.rafexLoadViewerOnDemandV3?.('mr')).then(()=>{canvas.__mrPendingV213=false;if($('mrCanvas')===canvas&&window.RafexMRViewer?.mount)mrMountViewer();}).catch(error=>{canvas.__mrPendingV213=false;if($('mrCanvas')===canvas&&$('mrViewerStatus'))$('mrViewerStatus').textContent=error.message;});return;}
 try{mrViewerInstance=window.RafexMRViewer.mount(canvas,typeof mrConfigurationV2==='function'?{config:mrConfigurationV2()}:{model:'module'});}catch(error){if($('mrViewerStatus'))$('mrViewerStatus').textContent=error.message;}
 }
 window.rafexMrMountV213=mrMountViewer;
`+html.slice(end);
 const late=html.indexOf('      mrMountViewer=function(){'),lateEnd=html.indexOf('\n',late);if(late<0)throw Error('Final mount');html=html.slice(0,late)+'      mrMountViewer=window.rafexMrMountV213;'+html.slice(lateEnd);
 const product='<div class="m2-layout-products" id="m2LayoutProductList"><b>ÜRÜN LİSTESİ</b></div>';if(!html.includes(product))throw Error('Products');html=html.replace(product,'').replace('<div class="m2-report-panel">',product+'\n            <div class="m2-report-panel">');
 html=html.replaceAll('/mr-viewer.js?v=99d4f5ca8ee0f290','/mr-viewer.js?v=mr-speed-v213');
 const ready='script.onload=()=>resolve(true);';const index=html.indexOf(ready,html.indexOf('data-rafex-viewer-on-demand="v3"'));if(index<0)throw Error('Loader');html=html.slice(0,index)+html.slice(index).replace(ready,'script.onload=()=>{if(module===\'mr\')window.RafexMRViewer?.preload?.().catch(()=>{});resolve(true);};');
 return html.replace('</head>','<meta data-mr-speed="v213">\n</head>');
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-mr-speed-v213.mjs')){const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));const viewer='dist/mr-viewer.js';fs.writeFileSync(viewer,viewerTransform(fs.readFileSync(viewer,'utf8')));}
