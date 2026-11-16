import fs from 'node:fs';import {pathToFileURL} from 'node:url';
export function transform(html){
 if(html.includes('/* mr-label-size-v582 */'))return html;
 const before='(rack.b2b&&!rack.b2b.mr?1.75:1)';
 const after="(/* mr-label-size-v582 */(rack.b2b?.mr||String(rack.rafexSystem||rack.__rafexSystem||rack.systemType||'').toLowerCase()==='mr')?2:(rack.b2b&&!rack.b2b.mr?1.75:1))";
 if(!html.includes(before))throw Error('Expected tunnel label sizing anchor');
 return html.replaceAll(before,after);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,s);
}
