import fs from 'node:fs';
export function transform(html){
 const runtime=fs.readFileSync(new URL('../client/barrier-scan.js',import.meta.url),'utf8').replaceAll('export function ','function ');
 const pattern=/<script>\s*\/\* barrier-scan-v277 \*\/[\s\S]*?<\/script>/;
 if(!pattern.test(html))throw Error('Missing barrier scan runtime');
 return html.replace(pattern,()=>'<script>\n/* barrier-scan-v277 */\n'+runtime+'\ninstallBarrierScan();\n</script>');
}
if(/[\\/]barrier-selection-v588\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,s);
}
