import fs from 'node:fs';
export function transform(html){
  if(html.includes('data-pdf-auto-layout="v188"'))return html;
  if(!html.includes('rafexProjectImportV155'))throw Error('PDF button anchor missing');
  const save='const layout = { points: m2LayoutState.points,';
  if(!html.includes(save)&&!html.includes('pdfImport: m2LayoutState.pdfImport || null'))throw Error('PDF import persistence anchor missing');
  html=html.replace(save,'const layout = { pdfImport: m2LayoutState.pdfImport || null, points: m2LayoutState.points,');
  html=html.replace('const restoredLayout = JSON.parse(JSON.stringify(payload.layout));','const restoredLayout = JSON.parse(JSON.stringify(payload.layout)); restoredLayout.pdfImport = payload.layout.pdfImport || null;');
  html=html.replace('const sectionWidth = settings.palletType === \"euro\" && count === 4 ? 3600 : calculatedWidth;', 'const sectionWidth = Number(settings.importedSectionWidth) >= calculatedWidth ? Number(settings.importedSectionWidth) : settings.palletType === \"euro\" && count === 4 ? 3600 : calculatedWidth;');
  const runtime=['pdf-native-placement.js','pdf-auto-layout.js'].map(f=>fs.readFileSync(new URL('../client/'+f,import.meta.url),'utf8')).join('\n');
  const end=html.lastIndexOf('</body>');if(end<0)throw Error('Body missing');
  return html.slice(0,end)+'<script data-pdf-auto-layout="v188">'+runtime+'</script>'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-pdf-auto-layout-v188.mjs')){
  const file='dist/server/index.js',source=fs.readFileSync(file,'utf8'),match=source.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!match)throw Error('HTML missing');
  fs.writeFileSync(file,source.replace(match[1],Buffer.from(transform(Buffer.from(match[1],'base64').toString())).toString('base64')));
  fs.mkdirSync('dist/pdfjs',{recursive:true});
  for(const file of ['pdf.mjs','pdf.worker.mjs'])fs.copyFileSync('node_modules/pdfjs-dist/build/'+file,'dist/pdfjs/'+file);
  fs.copyFileSync('node_modules/pdfjs-dist/LICENSE','dist/pdfjs/LICENSE');
  for(const file of ['pdf-vector-reader.mjs','pdf-rack-detection.mjs','pdf-raster-reader.mjs','pdf-batch-plan.mjs','pdf-dimensioned-reader.mjs'])fs.copyFileSync('client/'+file,'dist/pdfjs/'+file);
  fs.mkdirSync('dist/ocr/core',{recursive:true});fs.mkdirSync('dist/ocr/lang',{recursive:true});
  for(const file of ['tesseract.esm.min.js','worker.min.js','worker.min.js.LICENSE.txt'])fs.copyFileSync('node_modules/tesseract.js/dist/'+file,'dist/ocr/'+file);
  for(const file of fs.readdirSync('node_modules/tesseract.js-core').filter(f=>/lstm.*\.(?:js|wasm)$/.test(f)))fs.copyFileSync('node_modules/tesseract.js-core/'+file,'dist/ocr/core/'+file);
  fs.copyFileSync('node_modules/tesseract.js-core/LICENSE','dist/ocr/core/LICENSE');
  fs.copyFileSync('node_modules/@tesseract.js-data/eng/4.0.0/eng.traineddata.gz','dist/ocr/lang/eng.traineddata.gz');
}
