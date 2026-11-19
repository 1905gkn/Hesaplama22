import fs from 'node:fs';
export function transform(html){return html.replace(/\/(layout-3d|b2b-viewer|mr-viewer|customer-view|customer-share-capture)\.js\?v=\d+/g,'/$1.js?v=594').replaceAll("captureRevision:'v591'","captureRevision:'v594'");}
if(/[\\/]customer-opening-v592\.mjs$/.test(process.argv[1]||''))for(const file of ['dist/index.html','dist/server/index.js'])if(fs.existsSync(file)){
 let s=fs.readFileSync(file,'utf8');if(file.endsWith('.html'))s=transform(s);else{const m=s.match(/const\s+HTML_BASE64\s*=\s*(["'])([A-Za-z0-9+/=]+)\1/);if(!m)throw Error('Missing HTML');s=s.replace(m[2],Buffer.from(transform(Buffer.from(m[2],'base64').toString())).toString('base64'));}fs.writeFileSync(file,s);
}
