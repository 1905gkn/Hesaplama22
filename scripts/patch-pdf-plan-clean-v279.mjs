import fs from 'node:fs';
export function transform(html){
 if(html.includes('/* pdf-plan-clean-v279 */'))return html;
 html=html.replaceAll('>RAF ARASI ${fmt(mm)} mm','>${fmt(mm)} mm').replaceAll(">RAF ARASI '+fmt(mm)+' mm",">'+fmt(mm)+' mm");
 const runtime=fs.readFileSync(new URL('../client/pdf-plan-clean.js',import.meta.url),'utf8');
 const at=html.lastIndexOf('</body>');if(at<0)throw Error('Missing body');
 return html.slice(0,at)+'<script>'+runtime+'</script>'+html.slice(at);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-pdf-plan-clean-v279.mjs')){
 const f='dist/server/index.js',s=fs.readFileSync(f,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);if(!m)throw Error('Missing embedded HTML');
 fs.writeFileSync(f,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
