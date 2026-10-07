import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* report-products-toggle-v278 */'))return html;
 // Captured images must be invalidated when the independent output language changes.
 html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,script=>{
  if(!script.includes('previewCache')||!script.includes('capturePerspective'))return script;
  return script.replace(/((?:const|var|let) signature\s*=\s*JSON\.stringify\(\{)/g,"$1 reportLanguage:document.getElementById('m2ReportLanguage')?.value||'tr',");
 });
 const runtime=fs.readFileSync(new URL('../client/report-products-toggle.js',import.meta.url),'utf8');
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');
 return html.slice(0,at)+'<script>\n'+runtime+'\n</script>\n'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-report-options-v278.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing embedded HTML');fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
