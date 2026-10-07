import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* barrier-scan-v277 */'))return html;
 html=html.replaceAll('${m2ProtectionDraft.type.toUpperCase()} · AYAK KORUMA ALANI','${m2ProtectionDraft.type==="barrier"?"BARİYER ALANI":m2ProtectionDraft.type.toUpperCase()+" · AYAK KORUMA ALANI"}');
 const runtime=fs.readFileSync(new URL('../client/barrier-scan.js',import.meta.url),'utf8').replaceAll('export function ','function ');
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');
 return html.slice(0,at)+'<script>\n/* barrier-scan-v277 */\n'+runtime+'\ninstallBarrierScan();\n</script>\n'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-barrier-scan-v277.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing embedded HTML');
 fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
