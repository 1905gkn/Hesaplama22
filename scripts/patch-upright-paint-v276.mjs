import fs from 'node:fs';
export function transform(html) {
 if(html.includes('/* upright-paint-v276 */'))return html;
 const runtime=fs.readFileSync(new URL('../client/upright-paint.js',import.meta.url),'utf8');
 const end=html.lastIndexOf('</body>');if(end<0)throw Error('Missing body');
 return html.slice(0,end)+'<script>\n'+runtime+'\n</script>\n'+html.slice(end);
}
if(process.argv[1]?.replaceAll('\\','/').endsWith('/patch-upright-paint-v276.mjs')){
 const file='dist/server/index.js',s=fs.readFileSync(file,'utf8'),m=s.match(/HTML_BASE64\s*=\s*["']([A-Za-z0-9+/=]+)/);
 if(!m)throw Error('Missing embedded HTML');
 fs.writeFileSync(file,s.replace(m[1],Buffer.from(transform(Buffer.from(m[1],'base64').toString())).toString('base64')));
}
