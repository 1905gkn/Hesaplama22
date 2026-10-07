import fs from 'node:fs';
export function transform(html){
 if(html.includes('native-faithful-pdf-v285'))return html;
 const old="try{await window.rafexDownloadPreparedPdfV283(print);}catch(error){console.error('PDF indirilemedi',error);alert('PDF oluşturulamadı: '+error.message);}finally{cleanup();}";
 if(!html.includes(old))throw Error('Missing direct PDF hook');
 html=html.replace(old,"/* native-faithful-pdf-v285 */ await document.fonts.ready;requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()));");
 const end=html.lastIndexOf('</body>');return html.slice(0,end)+`<style data-native-faithful-pdf="v285">@media print{@page{size:A4 landscape;margin:0}#m2CorporatePrint{width:297mm!important}#m2CorporatePrint .m2-corporate-page{width:297mm!important;height:210mm!important;box-sizing:border-box!important}#m2CorporatePrint,#m2CorporatePrint *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}</style>`+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-native-faithful-pdf-v285.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
